import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import { DEEP_SYSTEM_PROMPT, parseDeepAnalysis } from "@/app/api/analyze/route";
import type { DeepAnalysisData } from "@/app/api/analyze/route";

export type RefineEvent =
  | { type: "progress"; message: string; pct: number }
  | { type: "chunk"; text: string }
  | { type: "done"; analysis: DeepAnalysisData }
  | { type: "error"; message: string };

const REFINE_MARKERS = [
  { marker: '"summary":',            message: "Refining product summary",     pct: 15 },
  { marker: '"risk_areas":',         message: "Updating risk analysis",       pct: 30 },
  { marker: '"icp_profile":',        message: "Sharpening customer profile",  pct: 50 },
  { marker: '"tech_stack":',         message: "Updating tech stack",          pct: 65 },
  { marker: '"competitive_moat":',   message: "Updating moat analysis",       pct: 78 },
  { marker: '"section_confidence":', message: "Recalculating confidence",     pct: 90 },
  { marker: '"followup_questions":', message: "Generating new questions",     pct: 95 },
];

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    projectId?: string;
    answers?: Record<string, string>;
    questions?: string[];
  };

  const { projectId, answers = {}, questions = [] } = body;
  if (!projectId) return Response.json({ error: "projectId required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: project } = await supabase
    .from("projects")
    .select("id, raw_idea")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) return Response.json({ error: "Project not found" }, { status: 404 });

  // Build enriched context with Q&A answers
  const qa = questions
    .map((q, i) => {
      const answer = answers[String(i)] ?? answers[q] ?? "";
      return answer.trim() ? `Q: ${q}\nA: ${answer.trim()}` : null;
    })
    .filter(Boolean)
    .join("\n\n");

  const enrichedIdea = qa
    ? `${project.raw_idea ?? ""}\n\n---\nAdditional context:\n${qa}`
    : (project.raw_idea ?? "");

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: RefineEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      send({ type: "progress", message: "Processing your answers", pct: 5 });

      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        let fullText = "";
        const fired = new Set<string>();

        const stream = client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16000,
          system: DEEP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: enrichedIdea }],
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            fullText += event.delta.text;
            send({ type: "chunk", text: event.delta.text });

            for (const { marker, message, pct } of REFINE_MARKERS) {
              if (!fired.has(marker) && fullText.includes(marker)) {
                fired.add(marker);
                send({ type: "progress", message, pct });
              }
            }
          }
        }

        send({ type: "progress", message: "Parsing refined analysis", pct: 98 });

        const match = fullText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON returned from refinement");

        const deepAnalysis = parseDeepAnalysis(JSON.parse(match[0]) as Record<string, unknown>);

        await supabase.from("projects")
          .update({ deep_analysis: deepAnalysis })
          .eq("id", projectId);

        send({ type: "done", analysis: deepAnalysis });

      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Refinement failed" });
      }

      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Accel-Buffering": "no",
    },
  });
}
