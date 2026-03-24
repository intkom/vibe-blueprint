import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

export type AnalysisData = {
  title: string;
  health_score: number;
  health_label: "Critical" | "Weak" | "Moderate" | "Strong" | "Excellent";
  summary: string;
  risk_areas: Array<{
    title: string;
    severity: "high" | "medium" | "low";
    description: string;
    fix: string;
  }>;
  architecture_insights: Array<{
    layer: string;
    recommendation: string;
    reason: string;
  }>;
  execution_path: Array<{
    step: number;
    title: string;
    description: string;
    estimated_hours: number;
    why: string;
  }>;
  failure_points: Array<{
    point: string;
    likelihood: "high" | "medium" | "low";
    prevention: string;
  }>;
  confidence_note: string;
  icp_profile: {
    primary_audience: string;
    pain_points: string[];
    why_they_care: string;
  };
  competitor_analysis: Array<{
    name: string;
    weakness: string;
    your_advantage: string;
  }>;
  deployment_checklist: Array<{
    platform: string;
    priority: "high" | "medium" | "low";
    action: string;
  }>;
  viral_hooks: Array<{
    format: string;
    copy: string;
  }>;
  iteration_suggestions: Array<{
    issue: string;
    fix: string;
    impact: "high" | "medium" | "low";
  }>;
};

export type StreamEvent =
  | { type: "start"; projectId: string }
  | { type: "progress"; message: string; pct: number }
  | { type: "chunk"; text: string }
  | { type: "done"; projectId: string; analysis: AnalysisData }
  | { type: "error"; message: string };

// JSON section markers — fired once each as they appear in the stream
const SECTION_MARKERS: Array<{ marker: string; message: string; pct: number }> = [
  { marker: '"summary":',               message: "Analyzing product truth",        pct: 15 },
  { marker: '"risk_areas":',            message: "Scanning for risk areas",        pct: 25 },
  { marker: '"architecture_insights":', message: "Mapping architecture layers",    pct: 34 },
  { marker: '"execution_path":',        message: "Sequencing execution path",      pct: 44 },
  { marker: '"failure_points":',        message: "Identifying failure points",     pct: 54 },
  { marker: '"confidence_note":',       message: "Scoring build health",           pct: 62 },
  { marker: '"icp_profile":',           message: "Profiling your ideal customer",  pct: 70 },
  { marker: '"competitor_analysis":',   message: "Mapping competitor landscape",   pct: 78 },
  { marker: '"deployment_checklist":',  message: "Building deployment checklist",  pct: 85 },
  { marker: '"viral_hooks":',           message: "Crafting viral hooks",           pct: 90 },
  { marker: '"iteration_suggestions":', message: "Generating iteration roadmap",   pct: 94 },
];

export const SYSTEM_PROMPT = `You are Axiom, a product intelligence engine. Analyze the user's build idea with technical depth and honesty.

Return ONLY this exact JSON structure — no markdown, no fences, no explanation:
{
  "title": "5-8 word product concept name",
  "health_score": number between 0-100,
  "health_label": "Critical" or "Weak" or "Moderate" or "Strong" or "Excellent",
  "summary": "2-3 sentences of honest product truth. What is actually being built and what the real challenge is. No cheerleading.",
  "risk_areas": [
    {
      "title": "Short risk name (3-6 words)",
      "severity": "high" or "medium" or "low",
      "description": "Why this is a real risk for this specific build. One specific sentence.",
      "fix": "Concrete action to reduce this risk. Start with a verb."
    }
  ],
  "architecture_insights": [
    {
      "layer": "e.g. Database, Authentication, Frontend, API, Payments",
      "recommendation": "What to use for this layer",
      "reason": "Why this fits their specific build constraints. One sentence."
    }
  ],
  "execution_path": [
    {
      "step": 1,
      "title": "Step title (max 8 words)",
      "description": "What to do in this step. One specific sentence.",
      "estimated_hours": 4,
      "why": "Why this step must come at this position. One sentence."
    }
  ],
  "failure_points": [
    {
      "point": "What will fail and when",
      "likelihood": "high" or "medium" or "low",
      "prevention": "How to prevent it. Specific action."
    }
  ],
  "confidence_note": "One honest sentence about the certainty of this analysis given what was shared.",
  "icp_profile": {
    "primary_audience": "One sentence describing the exact person who has this problem right now.",
    "pain_points": ["3-5 specific pain points this person experiences today — be concrete, not generic"],
    "why_they_care": "One sentence on why solving this problem matters to them financially or emotionally."
  },
  "competitor_analysis": [
    {
      "name": "Competitor or substitute name",
      "weakness": "Their specific weakness relevant to this build. One sentence.",
      "your_advantage": "The specific angle this build can win on. Start with a verb."
    }
  ],
  "deployment_checklist": [
    {
      "platform": "e.g. Vercel, Supabase, Stripe, Cloudflare, SendGrid",
      "priority": "high" or "medium" or "low",
      "action": "Specific setup action required before going live. Start with a verb."
    }
  ],
  "viral_hooks": [
    {
      "format": "e.g. Twitter thread, LinkedIn post, cold DM, Product Hunt tagline",
      "copy": "Ready-to-use copy for this format. Should make the reader stop scrolling."
    }
  ],
  "iteration_suggestions": [
    {
      "issue": "What gap or weakness will appear after the first 100 users",
      "fix": "Specific product change to address it. Start with a verb.",
      "impact": "high" or "medium" or "low"
    }
  ]
}

Rules:
- health_score: 0-20=Critical, 21-40=Weak, 41-60=Moderate, 61-80=Strong, 81-100=Excellent
- risk_areas: exactly 3 items, ordered by severity descending
- architecture_insights: exactly 3 items, most critical layers first
- execution_path: exactly 10 items, sequenced as a real build order
- failure_points: exactly 3 items, most likely first
- icp_profile.pain_points: exactly 4 items
- competitor_analysis: exactly 3 items, most threatening first
- deployment_checklist: exactly 5 items, ordered by priority descending
- viral_hooks: exactly 3 items, most shareable format first
- iteration_suggestions: exactly 3 items, highest impact first
- Be specific to THIS idea. No generic advice.
- Return ONLY valid JSON.`;

export async function POST(req: NextRequest) {
  const body = await req.json() as { idea?: string };
  const idea = body.idea?.trim() ?? "";

  if (!idea || idea.length < 20) {
    return Response.json({ error: "Idea too short" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Usage limit check ─────────────────────────────────────
  const FREE_LIMIT = 3;
  const { data: profile } = await supabase
    .from("profiles")
    .select("analyses_used, analyses_reset_date, plan, bonus_analyses")
    .eq("id", user.id)
    .single();

  let currentUsage = profile?.analyses_used ?? 0;
  if (profile) {
    // Reset counter if it's a new calendar month
    const resetDate = profile.analyses_reset_date ? new Date(profile.analyses_reset_date) : null;
    if (resetDate) {
      const now = new Date();
      const isNewMonth =
        now.getFullYear() > resetDate.getFullYear() ||
        (now.getFullYear() === resetDate.getFullYear() && now.getMonth() > resetDate.getMonth());
      if (isNewMonth) {
        await supabase
          .from("profiles")
          .update({ analyses_used: 0, analyses_reset_date: now.toISOString().split("T")[0] })
          .eq("id", user.id);
        currentUsage = 0;
      }
    }

    const bonusCount = profile.bonus_analyses ?? 0;
    const isPro = (profile.plan ?? "free") !== "free";
    if (!isPro && currentUsage >= FREE_LIMIT + bonusCount) {
      return Response.json(
        { error: "limit_reached", used: currentUsage, limit: FREE_LIMIT + bonusCount },
        { status: 429 }
      );
    }
  }
  // ─────────────────────────────────────────────────────────

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      // Create project record immediately
      const { data: project, error: createError } = await supabase
        .from("projects")
        .insert({ user_id: user.id, raw_idea: idea, title: "Analyzing..." })
        .select("id")
        .single();

      if (createError || !project) {
        send({ type: "error", message: createError?.message ?? "Failed to create project" });
        controller.close();
        return;
      }

      send({ type: "start", projectId: project.id });
      send({ type: "progress", message: "Project created in database", pct: 8 });

      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        let fullText = "";
        const fired = new Set<string>();

        const stream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: idea }],
        });

        let streamStarted = false;
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            if (!streamStarted) {
              streamStarted = true;
              send({ type: "progress", message: "Intelligence engine connected", pct: 11 });
            }
            fullText += event.delta.text;
            send({ type: "chunk", text: event.delta.text });

            // Fire progress events when each section first appears in the stream
            for (const { marker, message, pct } of SECTION_MARKERS) {
              if (!fired.has(marker) && fullText.includes(marker)) {
                fired.add(marker);
                send({ type: "progress", message, pct });
              }
            }
          }
        }

        send({ type: "progress", message: "Parsing analysis output", pct: 96 });

        // Extract and parse JSON
        const match = fullText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Claude did not return valid JSON");

        const raw = JSON.parse(match[0]) as Record<string, unknown>;

        const rawIcp = (raw.icp_profile ?? {}) as Record<string, unknown>;
        const analysis: AnalysisData = {
          title: String(raw.title ?? "Product Analysis").slice(0, 80),
          health_score: Math.max(0, Math.min(100, Number(raw.health_score) || 50)),
          health_label: (["Critical", "Weak", "Moderate", "Strong", "Excellent"] as const)
            .includes(raw.health_label as "Critical")
            ? raw.health_label as AnalysisData["health_label"]
            : "Moderate",
          summary: String(raw.summary ?? ""),
          risk_areas: (Array.isArray(raw.risk_areas) ? raw.risk_areas : []).slice(0, 3).map((r: unknown) => {
            const ri = r as Record<string, unknown>;
            return {
              title: String(ri.title ?? ""),
              severity: (["high", "medium", "low"] as const).includes(ri.severity as "high")
                ? ri.severity as "high" | "medium" | "low"
                : "medium",
              description: String(ri.description ?? ""),
              fix: String(ri.fix ?? ""),
            };
          }),
          architecture_insights: (Array.isArray(raw.architecture_insights) ? raw.architecture_insights : []).slice(0, 3).map((a: unknown) => {
            const ai = a as Record<string, unknown>;
            return {
              layer: String(ai.layer ?? ""),
              recommendation: String(ai.recommendation ?? ""),
              reason: String(ai.reason ?? ""),
            };
          }),
          execution_path: (Array.isArray(raw.execution_path) ? raw.execution_path : []).slice(0, 10).map((e: unknown, idx: number) => {
            const ep = e as Record<string, unknown>;
            return {
              step: Number(ep.step ?? idx + 1),
              title: String(ep.title ?? ""),
              description: String(ep.description ?? ""),
              estimated_hours: Math.max(1, Number(ep.estimated_hours) || 4),
              why: String(ep.why ?? ""),
            };
          }),
          failure_points: (Array.isArray(raw.failure_points) ? raw.failure_points : []).slice(0, 3).map((f: unknown) => {
            const fp = f as Record<string, unknown>;
            return {
              point: String(fp.point ?? ""),
              likelihood: (["high", "medium", "low"] as const).includes(fp.likelihood as "high")
                ? fp.likelihood as "high" | "medium" | "low"
                : "medium",
              prevention: String(fp.prevention ?? ""),
            };
          }),
          confidence_note: String(raw.confidence_note ?? ""),
          icp_profile: {
            primary_audience: String(rawIcp.primary_audience ?? ""),
            pain_points: (Array.isArray(rawIcp.pain_points) ? rawIcp.pain_points : []).slice(0, 4).map(String),
            why_they_care: String(rawIcp.why_they_care ?? ""),
          },
          competitor_analysis: (Array.isArray(raw.competitor_analysis) ? raw.competitor_analysis : []).slice(0, 3).map((c: unknown) => {
            const ca = c as Record<string, unknown>;
            return {
              name: String(ca.name ?? ""),
              weakness: String(ca.weakness ?? ""),
              your_advantage: String(ca.your_advantage ?? ""),
            };
          }),
          deployment_checklist: (Array.isArray(raw.deployment_checklist) ? raw.deployment_checklist : []).slice(0, 5).map((d: unknown) => {
            const dc = d as Record<string, unknown>;
            return {
              platform: String(dc.platform ?? ""),
              priority: (["high", "medium", "low"] as const).includes(dc.priority as "high")
                ? dc.priority as "high" | "medium" | "low"
                : "medium",
              action: String(dc.action ?? ""),
            };
          }),
          viral_hooks: (Array.isArray(raw.viral_hooks) ? raw.viral_hooks : []).slice(0, 3).map((v: unknown) => {
            const vh = v as Record<string, unknown>;
            return {
              format: String(vh.format ?? ""),
              copy: String(vh.copy ?? ""),
            };
          }),
          iteration_suggestions: (Array.isArray(raw.iteration_suggestions) ? raw.iteration_suggestions : []).slice(0, 3).map((i: unknown) => {
            const is_ = i as Record<string, unknown>;
            return {
              issue: String(is_.issue ?? ""),
              fix: String(is_.fix ?? ""),
              impact: (["high", "medium", "low"] as const).includes(is_.impact as "high")
                ? is_.impact as "high" | "medium" | "low"
                : "medium",
            };
          }),
        };

        // Save analysis to database
        send({ type: "progress", message: "Saving to database", pct: 98 });
        await supabase
          .from("projects")
          .update({ analysis, title: analysis.title })
          .eq("id", project.id);

        send({ type: "done", projectId: project.id, analysis });

        // Increment usage counter
        await supabase
          .from("profiles")
          .update({ analyses_used: currentUsage + 1 })
          .eq("id", user.id);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        send({ type: "error", message });
        // Clean up orphaned project
        await supabase.from("projects").delete().eq("id", project.id);
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
