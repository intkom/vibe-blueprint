import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You've been invited – Axiom",
  description: "A friend invited you to Axiom. Get your free product analysis.",
};

export default async function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!code || code.length < 4) redirect("/signup");

  // Set referral cookie (30 days)
  const cookieStore = await cookies();
  cookieStore.set("ref_code", code, {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });

  redirect(`/signup?ref=${code}`);
}
