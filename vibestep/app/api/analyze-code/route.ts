import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

export type CodeAnalysisData = {
  title: string;
  health_score: number;
  health_label: "Critical" | "Weak" | "Moderate" | "Strong" | "Excellent";
  language: string;
  summary: string;
  security_issues: Array<{
    title: string;
    severity: "critical" | "high" | "medium" | "low";
    location: string;
    description: string;
    fix: string;
  }>;
  performance_issues: Array<{
    title: string;
    impact: "high" | "medium" | "low";
    description: string;
    fix: string;
  }>;
  architecture_issues: Array<{
    title: string;
    severity: "high" | "medium" | "low";
    description: string;
    fix: string;
  }>;
  missing_patterns: Array<{
    pattern: string;
    impact: string;
    example: string;
  }>;
  scalability_concerns: Array<{
    concern: string;
    threshold: string;
    solution: string;
  }>;
  overall_verdict: string;
  refactor_priority: string[];
};

export type CodeStreamEvent =
  | { type: "start"; projectId: string }
  | { type: "progress"; message: string; pct: number }
  | { type: "chunk"; text: string }
  | { type: "done"; projectId: string; analysis: CodeAnalysisData }
  | { type: "error"; message: string };

const CODE_SECTION_MARKERS = [
  { marker: '"language":',            message: "Detecting language and context",   pct: 12 },
  { marker: '"summary":',             message: "Summarizing code behavior",        pct: 20 },
  { marker: '"security_issues":',     message: "Scanning for vulnerabilities",     pct: 32 },
  { marker: '"performance_issues":',  message: "Profiling performance hotspots",   pct: 48 },
  { marker: '"architecture_issues":', message: "Reviewing architecture patterns",  pct: 62 },
  { marker: '"missing_patterns":',    message: "Finding missing error handling",   pct: 74 },
  { marker: '"scalability_concerns":',message: "Assessing scalability limits",     pct: 84 },
  { marker: '"overall_verdict":',     message: "Forming overall verdict",          pct: 92 },
  { marker: '"refactor_priority":',   message: "Prioritizing refactor actions",    pct: 96 },
];

const CODE_SYSTEM_PROMPT = `You are Axiom Code Intelligence, a senior security and architecture reviewer with expertise in OWASP, clean architecture, and production systems.

Analyze the provided code for vulnerabilities, performance issues, and architectural problems.

Return ONLY this exact JSON — no markdown, no fences, no explanation:
{
  "title": "What this code does (5-8 words)",
  "health_score": number 0-100,
  "health_label": "Critical" or "Weak" or "Moderate" or "Strong" or "Excellent",
  "language": "detected programming language",
  "summary": "2-3 sentences: what this code does, the main concerns, and overall production-readiness verdict.",
  "security_issues": [
    {
      "title": "Issue name (3-5 words)",
      "severity": "critical" or "high" or "medium" or "low",
      "location": "File, line number, or function name if identifiable",
      "description": "What the vulnerability is and its real-world impact.",
      "fix": "Specific fix with code example where possible."
    }
  ],
  "performance_issues": [
    {
      "title": "Issue name (3-5 words)",
      "impact": "high" or "medium" or "low",
      "description": "What is slow or wasteful and in what circumstances.",
      "fix": "Concrete optimization approach."
    }
  ],
  "architecture_issues": [
    {
      "title": "Issue name (3-5 words)",
      "severity": "high" or "medium" or "low",
      "description": "Why this is an architectural problem and what it causes.",
      "fix": "Recommended pattern or refactor."
    }
  ],
  "missing_patterns": [
    {
      "pattern": "What's missing (e.g. input validation, error handling, rate limiting)",
      "impact": "What breaks or becomes exploitable without this.",
      "example": "Brief example showing how to add it."
    }
  ],
  "scalability_concerns": [
    {
      "concern": "What won't scale and why",
      "threshold": "When this becomes a problem (e.g. '1000 concurrent users', '10GB dataset')",
      "solution": "How to address it before hitting the threshold."
    }
  ],
  "overall_verdict": "One honest sentence on whether this code is production-ready and why.",
  "refactor_priority": [
    "First most critical fix",
    "Second most critical fix",
    "Third",
    "Fourth",
    "Fifth"
  ]
}

Rules:
- health_score: 0-20=Critical (dangerous/broken), 21-40=Weak (major issues), 41-60=Moderate (works but risky), 61-80=Strong (minor issues), 81-100=Excellent (production-ready)
- security_issues: 0-5 items, only real issues found in the actual code
- performance_issues: 0-4 items
- architecture_issues: 0-4 items
- missing_patterns: 0-5 items
- scalability_concerns: 0-3 items
- refactor_priority: exactly 5 items ordered by severity/impact
- Be SPECIFIC to the actual code provided — no generic advice
- If you cannot find issues in a category, return an empty array for that category
- Return ONLY valid JSON.`;

export async function POST(req: NextRequest) {
  const body = await req.json() as { code?: string; github_url?: string };
  const code = body.code?.trim() ?? "";

  if (!code || code.length < 50) {
    return Response.json({ error: "Code too short — paste at least 50 characters" }, { status: 400 });
  }
  if (code.length > 50000) {
    return Response.json({ error: "Code too long — max 50,000 characters" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Usage limit (same as idea analysis)
  const FREE_LIMIT = 3;
  const { data: profile } = await supabase
    .from("profiles")
    .select("analyses_used, analyses_reset_date, plan, bonus_analyses")
    .eq("id", user.id)
    .single();

  let currentUsage = profile?.analyses_used ?? 0;
  if (profile) {
    const bonusCount = profile.bonus_analyses ?? 0;
    const isPro = (profile.plan ?? "free") !== "free";
    if (!isPro && currentUsage >= FREE_LIMIT + bonusCount) {
      return Response.json(
        { error: "limit_reached", used: currentUsage, limit: FREE_LIMIT + bonusCount },
        { status: 429 }
      );
    }
  }

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: CodeStreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      const { data: project, error: createError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          raw_idea: code.slice(0, 2000), // Store truncated for reference
          title: "Analyzing code...",
          input_mode: "code",
        })
        .select("id")
        .single();

      if (createError || !project) {
        send({ type: "error", message: createError?.message ?? "Failed to create project" });
        controller.close();
        return;
      }

      send({ type: "start", projectId: project.id });
      send({ type: "progress", message: "Code submitted to analysis engine", pct: 5 });

      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        let fullText = "";
        const fired = new Set<string>();

        const stream = client.messages.stream({
          model: "claude-sonnet-4-20250514", // Use Sonnet for code — better reasoning
          max_tokens: 8192,
          system: CODE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Analyze this code:\n\n\`\`\`\n${code}\n\`\`\`` }],
        });

        let streamStarted = false;
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            if (!streamStarted) {
              streamStarted = true;
              send({ type: "progress", message: "Analysis engine connected", pct: 8 });
            }
            fullText += event.delta.text;
            send({ type: "chunk", text: event.delta.text });

            for (const { marker, message, pct } of CODE_SECTION_MARKERS) {
              if (!fired.has(marker) && fullText.includes(marker)) {
                fired.add(marker);
                send({ type: "progress", message, pct });
              }
            }
          }
        }

        send({ type: "progress", message: "Parsing analysis output", pct: 97 });

        const match = fullText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON returned");

        const raw = JSON.parse(match[0]) as Record<string, unknown>;

        const analysis: CodeAnalysisData = {
          title: String(raw.title ?? "Code Analysis").slice(0, 80),
          health_score: Math.max(0, Math.min(100, Number(raw.health_score) || 50)),
          health_label: (["Critical", "Weak", "Moderate", "Strong", "Excellent"] as const)
            .includes(raw.health_label as "Critical")
            ? raw.health_label as CodeAnalysisData["health_label"]
            : "Moderate",
          language: String(raw.language ?? "Unknown"),
          summary: String(raw.summary ?? ""),
          security_issues: (Array.isArray(raw.security_issues) ? raw.security_issues : []).slice(0, 5).map((s: unknown) => {
            const si = s as Record<string, unknown>;
            return {
              title: String(si.title ?? ""),
              severity: (["critical","high","medium","low"] as const).includes(si.severity as "critical")
                ? si.severity as "critical" | "high" | "medium" | "low" : "medium",
              location: String(si.location ?? ""),
              description: String(si.description ?? ""),
              fix: String(si.fix ?? ""),
            };
          }),
          performance_issues: (Array.isArray(raw.performance_issues) ? raw.performance_issues : []).slice(0, 4).map((p: unknown) => {
            const pi = p as Record<string, unknown>;
            return {
              title: String(pi.title ?? ""),
              impact: (["high","medium","low"] as const).includes(pi.impact as "high")
                ? pi.impact as "high" | "medium" | "low" : "medium",
              description: String(pi.description ?? ""),
              fix: String(pi.fix ?? ""),
            };
          }),
          architecture_issues: (Array.isArray(raw.architecture_issues) ? raw.architecture_issues : []).slice(0, 4).map((a: unknown) => {
            const ai = a as Record<string, unknown>;
            return {
              title: String(ai.title ?? ""),
              severity: (["high","medium","low"] as const).includes(ai.severity as "high")
                ? ai.severity as "high" | "medium" | "low" : "medium",
              description: String(ai.description ?? ""),
              fix: String(ai.fix ?? ""),
            };
          }),
          missing_patterns: (Array.isArray(raw.missing_patterns) ? raw.missing_patterns : []).slice(0, 5).map((m: unknown) => {
            const mp = m as Record<string, unknown>;
            return { pattern: String(mp.pattern ?? ""), impact: String(mp.impact ?? ""), example: String(mp.example ?? "") };
          }),
          scalability_concerns: (Array.isArray(raw.scalability_concerns) ? raw.scalability_concerns : []).slice(0, 3).map((sc: unknown) => {
            const s = sc as Record<string, unknown>;
            return { concern: String(s.concern ?? ""), threshold: String(s.threshold ?? ""), solution: String(s.solution ?? "") };
          }),
          overall_verdict: String(raw.overall_verdict ?? ""),
          refactor_priority: (Array.isArray(raw.refactor_priority) ? raw.refactor_priority : []).slice(0, 5).map(String),
        };

        await supabase.from("projects")
          .update({ analysis: analysis as unknown as Record<string, unknown>, title: analysis.title })
          .eq("id", project.id);

        await supabase.from("profiles")
          .update({ analyses_used: currentUsage + 1 })
          .eq("id", user.id);

        send({ type: "done", projectId: project.id, analysis });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Code analysis failed";
        send({ type: "error", message });
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
