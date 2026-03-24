import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "risk";
  read: boolean;
  link: string | null;
  created_at: string;
};

// GET /api/notifications — list latest 20 for current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, message, type, read, link, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data ?? [] });
}

// PATCH /api/notifications — mark all read, or mark specific id read
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id?: string; markAllRead?: boolean };

  if (body.markAllRead) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", body.id)
      .eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id or markAllRead required" }, { status: 400 });
}

// POST /api/notifications — create a notification (internal use)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    title: string;
    message: string;
    type?: string;
    link?: string;
  };

  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      title: body.title,
      message: body.message,
      type: body.type ?? "info",
      link: body.link ?? null,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
