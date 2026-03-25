import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { display_name?: string; language?: string };
  const updates: Record<string, string> = {};
  if (typeof body.display_name === "string" && body.display_name.trim()) {
    updates.display_name = body.display_name.trim().slice(0, 50);
  }
  const VALID_LOCALES = ["en", "ka", "ru", "az"];
  if (typeof body.language === "string" && VALID_LOCALES.includes(body.language)) {
    updates.language = body.language;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
