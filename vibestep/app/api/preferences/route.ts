import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({})) as {
    email_weekly_digest?: boolean;
    email_risk_alerts?: boolean;
    email_build_tips?: boolean;
  };

  const update: Record<string, boolean> = {};
  if (typeof body.email_weekly_digest === "boolean") update.email_weekly_digest = body.email_weekly_digest;
  if (typeof body.email_risk_alerts === "boolean") update.email_risk_alerts = body.email_risk_alerts;
  if (typeof body.email_build_tips === "boolean") update.email_build_tips = body.email_build_tips;

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
