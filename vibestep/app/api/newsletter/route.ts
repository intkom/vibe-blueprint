import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : null;

  if (!email || !email.includes("@") || email.length < 5) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ message: "Already subscribed — you're on the list!" });
    }
    console.error("Newsletter insert error:", error.message);
    return NextResponse.json({ error: "Failed to subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
