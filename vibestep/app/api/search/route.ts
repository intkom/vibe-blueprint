import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export type SearchResult = {
  id: string;
  title: string;
  snippet: string;
  type: "project" | "step";
  url: string;
  health_score?: number;
  health_label?: string;
};

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const results: SearchResult[] = [];

  // Full-text search on projects (uses search_vector if available, falls back to ilike)
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, raw_idea, analysis")
    .eq("user_id", user.id)
    .textSearch("search_vector", q, { type: "websearch" })
    .limit(8);

  for (const p of projects ?? []) {
    const analysis = p.analysis as { health_score?: number; health_label?: string; summary?: string } | null;
    const idea = p.raw_idea ?? "";
    const snippet = idea.length > 120 ? idea.slice(0, 117) + "…" : idea;

    results.push({
      id: p.id,
      title: p.title ?? "Untitled",
      snippet,
      type: "project",
      url: `/project/${p.id}/analysis`,
      health_score: analysis?.health_score,
      health_label: analysis?.health_label,
    });
  }

  // If not enough results, also search by step title
  if (results.length < 5) {
    const { data: steps } = await supabase
      .from("build_steps")
      .select("id, title, objective, project_id, projects!inner(title, user_id)")
      .eq("projects.user_id", user.id)
      .ilike("title", `%${q}%`)
      .limit(4);

    for (const s of steps ?? []) {
      const proj = s.projects as unknown as { title: string } | null;
      results.push({
        id: s.id,
        title: s.title ?? "Untitled step",
        snippet: `In: ${proj?.title ?? "Project"} — ${s.objective ?? ""}`.slice(0, 120),
        type: "step",
        url: `/project/${s.project_id}`,
      });
    }
  }

  return NextResponse.json({ results: results.slice(0, 10) });
}
