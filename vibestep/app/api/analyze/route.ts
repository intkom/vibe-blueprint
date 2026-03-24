import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

/* ── Basic analysis types ─────────────────────────────────────── */
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

/* ── Deep analysis types (Sonnet) ─────────────────────────────── */
export type TechStackItem = {
  layer: string;
  tool: string;
  why: string;
  alternatives: string[];
  setup_hours: number;
};

export type CompetitiveMoat = {
  moat_score: number;
  moat_type: "network_effects" | "switching_costs" | "data_advantage" | "brand" | "cost" | "none";
  defensibility: string;
  risks: string[];
  build_actions: string[];
};

export type SectionConfidence = {
  risk_areas: number;
  architecture: number;
  execution_path: number;
  icp_profile: number;
  competitor_analysis: number;
  overall: number;
};

export type FollowUpQuestion = {
  question: string;
  section: string;
  why: string;
};

export type DeepAnalysisData = AnalysisData & {
  tech_stack: TechStackItem[];
  competitive_moat: CompetitiveMoat;
  section_confidence: SectionConfidence;
  followup_questions: FollowUpQuestion[];
};

/* ── Stream event types ───────────────────────────────────────── */
export type StreamEvent =
  | { type: "start"; projectId: string }
  | { type: "progress"; message: string; pct: number }
  | { type: "chunk"; text: string }
  | { type: "done"; projectId: string; analysis: AnalysisData }
  | { type: "deep_start" }
  | { type: "deep_progress"; message: string; pct: number }
  | { type: "deep_chunk"; text: string }
  | { type: "deep_done"; projectId: string; analysis: DeepAnalysisData }
  | { type: "deep_error"; message: string }
  | { type: "error"; message: string };

/* ── Fast (Haiku) section markers ─────────────────────────────── */
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

/* ── Deep (Sonnet) section markers ───────────────────────────── */
const DEEP_SECTION_MARKERS: Array<{ marker: string; message: string; pct: number }> = [
  { marker: '"summary":',               message: "Enriching product summary",         pct: 10 },
  { marker: '"risk_areas":',            message: "Deep-scanning risk landscape",       pct: 20 },
  { marker: '"architecture_insights":', message: "Refining architecture layers",       pct: 30 },
  { marker: '"execution_path":',        message: "Optimizing execution sequence",      pct: 40 },
  { marker: '"icp_profile":',           message: "Deepening customer intelligence",    pct: 52 },
  { marker: '"competitor_analysis":',   message: "Analyzing competitor landscape",     pct: 62 },
  { marker: '"tech_stack":',            message: "Mapping your tech stack",            pct: 72 },
  { marker: '"competitive_moat":',      message: "Analyzing competitive moat",         pct: 82 },
  { marker: '"section_confidence":',    message: "Scoring analysis confidence",        pct: 90 },
  { marker: '"followup_questions":',    message: "Generating refinement questions",    pct: 96 },
];

/* ── Fast analysis prompt (Haiku) ─────────────────────────────── */
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

/* ── Deep analysis prompt (Sonnet) ────────────────────────────── */
export const DEEP_SYSTEM_PROMPT = `You are Axiom Deep Intelligence, powered by advanced reasoning. Produce the most comprehensive product analysis available to indie builders.

Return ONLY this exact JSON — no markdown, no fences, no explanation:
{
  "title": "5-8 word product concept name",
  "health_score": number 0-100,
  "health_label": "Critical" or "Weak" or "Moderate" or "Strong" or "Excellent",
  "summary": "3-4 sentences of deep product truth. What is being built, what the real market challenge is, and what will determine success or failure.",
  "risk_areas": [
    {
      "title": "Short risk name (3-6 words)",
      "severity": "high" or "medium" or "low",
      "description": "Why this is a real risk — with specific technical or market reasoning.",
      "fix": "Concrete multi-step action to reduce this risk."
    }
  ],
  "architecture_insights": [
    {
      "layer": "e.g. Database, Authentication, Frontend, API, Payments",
      "recommendation": "Specific technology with rationale",
      "reason": "Deep reasoning on why this fits — constraints, scale, team size."
    }
  ],
  "execution_path": [
    {
      "step": 1,
      "title": "Step title (max 8 words)",
      "description": "Detailed description of what to build in this step.",
      "estimated_hours": 4,
      "why": "Why this step unlocks everything after it."
    }
  ],
  "failure_points": [
    {
      "point": "What will fail and exactly when",
      "likelihood": "high" or "medium" or "low",
      "prevention": "Specific prevention steps with early warning signals."
    }
  ],
  "confidence_note": "Honest sentence about analysis certainty with specific gaps identified.",
  "icp_profile": {
    "primary_audience": "Precise description of the exact person — job title, company size, current workflow.",
    "pain_points": ["4 deeply specific pain points with context"],
    "why_they_care": "Financial or emotional stakes clearly stated."
  },
  "competitor_analysis": [
    {
      "name": "Competitor or substitute name",
      "weakness": "Their specific exploitable weakness.",
      "your_advantage": "Concrete differentiation strategy. Start with a verb."
    }
  ],
  "deployment_checklist": [
    {
      "platform": "Platform name",
      "priority": "high" or "medium" or "low",
      "action": "Detailed setup action with any gotchas mentioned."
    }
  ],
  "viral_hooks": [
    {
      "format": "Distribution channel and format",
      "copy": "Ready-to-use copy, optimized for maximum engagement."
    }
  ],
  "iteration_suggestions": [
    {
      "issue": "Specific gap that will emerge post-launch",
      "fix": "Product change with implementation detail.",
      "impact": "high" or "medium" or "low"
    }
  ],
  "tech_stack": [
    {
      "layer": "e.g. Frontend, Backend, Database, Auth, Payments, Hosting, Monitoring, Analytics",
      "tool": "Specific technology name and version where relevant",
      "why": "One sentence specific to this build's constraints and goals.",
      "alternatives": ["Alternative 1 — when to prefer it", "Alternative 2 — when to prefer it"],
      "setup_hours": number
    }
  ],
  "competitive_moat": {
    "moat_score": number 0-100,
    "moat_type": "network_effects" or "switching_costs" or "data_advantage" or "brand" or "cost" or "none",
    "defensibility": "One specific sentence on what makes this hard to copy at scale.",
    "risks": ["3 specific risks to the competitive position over 12-24 months"],
    "build_actions": ["3 concrete actions to strengthen the moat starting in v1"]
  },
  "section_confidence": {
    "risk_areas": number 0-100,
    "architecture": number 0-100,
    "execution_path": number 0-100,
    "icp_profile": number 0-100,
    "competitor_analysis": number 0-100,
    "overall": number 0-100
  },
  "followup_questions": [
    {
      "question": "Specific question that would sharpen the analysis",
      "section": "which section this improves most",
      "why": "One sentence on how the answer changes the analysis"
    }
  ]
}

Rules:
- health_score: 0-20=Critical, 21-40=Weak, 41-60=Moderate, 61-80=Strong, 81-100=Excellent
- risk_areas: exactly 3, severity descending
- architecture_insights: exactly 3, most critical first
- execution_path: exactly 10, real build order
- failure_points: exactly 3, most likely first
- icp_profile.pain_points: exactly 4
- competitor_analysis: exactly 3, most threatening first
- deployment_checklist: exactly 5, priority descending
- viral_hooks: exactly 3, most shareable first
- iteration_suggestions: exactly 3, highest impact first
- tech_stack: exactly 6-8 items. Frontend → Backend → Database → Auth → Payments → Hosting → optional domain-specific layers
- competitive_moat.moat_score: 0-20=None, 21-40=Weak, 41-60=Moderate, 61-80=Strong, 81-100=Exceptional
- competitive_moat.risks: exactly 3
- competitive_moat.build_actions: exactly 3
- section_confidence: score 0-100 based on specificity of input. 90+=very specific, 70-89=good detail, 50-69=moderate, <50=vague
- followup_questions: exactly 3, targeting the lowest confidence sections
- Be maximally specific to THIS idea. No generic advice.
- Return ONLY valid JSON.`;

/* ── Shared JSON parser for AnalysisData ──────────────────────── */
function parseAnalysis(raw: Record<string, unknown>): AnalysisData {
  const rawIcp = (raw.icp_profile ?? {}) as Record<string, unknown>;
  return {
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
          ? ri.severity as "high" | "medium" | "low" : "medium",
        description: String(ri.description ?? ""),
        fix: String(ri.fix ?? ""),
      };
    }),
    architecture_insights: (Array.isArray(raw.architecture_insights) ? raw.architecture_insights : []).slice(0, 3).map((a: unknown) => {
      const ai = a as Record<string, unknown>;
      return { layer: String(ai.layer ?? ""), recommendation: String(ai.recommendation ?? ""), reason: String(ai.reason ?? "") };
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
          ? fp.likelihood as "high" | "medium" | "low" : "medium",
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
      return { name: String(ca.name ?? ""), weakness: String(ca.weakness ?? ""), your_advantage: String(ca.your_advantage ?? "") };
    }),
    deployment_checklist: (Array.isArray(raw.deployment_checklist) ? raw.deployment_checklist : []).slice(0, 5).map((d: unknown) => {
      const dc = d as Record<string, unknown>;
      return {
        platform: String(dc.platform ?? ""),
        priority: (["high", "medium", "low"] as const).includes(dc.priority as "high")
          ? dc.priority as "high" | "medium" | "low" : "medium",
        action: String(dc.action ?? ""),
      };
    }),
    viral_hooks: (Array.isArray(raw.viral_hooks) ? raw.viral_hooks : []).slice(0, 3).map((v: unknown) => {
      const vh = v as Record<string, unknown>;
      return { format: String(vh.format ?? ""), copy: String(vh.copy ?? "") };
    }),
    iteration_suggestions: (Array.isArray(raw.iteration_suggestions) ? raw.iteration_suggestions : []).slice(0, 3).map((i: unknown) => {
      const is_ = i as Record<string, unknown>;
      return {
        issue: String(is_.issue ?? ""),
        fix: String(is_.fix ?? ""),
        impact: (["high", "medium", "low"] as const).includes(is_.impact as "high")
          ? is_.impact as "high" | "medium" | "low" : "medium",
      };
    }),
  };
}

/* ── Deep analysis parser (extends basic) ─────────────────────── */
export function parseDeepAnalysis(raw: Record<string, unknown>): DeepAnalysisData {
  const base = parseAnalysis(raw);

  const rawMoat = (raw.competitive_moat ?? {}) as Record<string, unknown>;
  const rawConf = (raw.section_confidence ?? {}) as Record<string, unknown>;

  return {
    ...base,
    tech_stack: (Array.isArray(raw.tech_stack) ? raw.tech_stack : []).slice(0, 8).map((t: unknown) => {
      const ts = t as Record<string, unknown>;
      return {
        layer: String(ts.layer ?? ""),
        tool: String(ts.tool ?? ""),
        why: String(ts.why ?? ""),
        alternatives: (Array.isArray(ts.alternatives) ? ts.alternatives : []).map(String),
        setup_hours: Math.max(0, Number(ts.setup_hours) || 2),
      };
    }),
    competitive_moat: {
      moat_score: Math.max(0, Math.min(100, Number(rawMoat.moat_score) || 0)),
      moat_type: (["network_effects", "switching_costs", "data_advantage", "brand", "cost", "none"] as const)
        .includes(rawMoat.moat_type as "none")
        ? rawMoat.moat_type as CompetitiveMoat["moat_type"]
        : "none",
      defensibility: String(rawMoat.defensibility ?? ""),
      risks: (Array.isArray(rawMoat.risks) ? rawMoat.risks : []).slice(0, 3).map(String),
      build_actions: (Array.isArray(rawMoat.build_actions) ? rawMoat.build_actions : []).slice(0, 3).map(String),
    },
    section_confidence: {
      risk_areas: Math.max(0, Math.min(100, Number(rawConf.risk_areas) || 50)),
      architecture: Math.max(0, Math.min(100, Number(rawConf.architecture) || 50)),
      execution_path: Math.max(0, Math.min(100, Number(rawConf.execution_path) || 50)),
      icp_profile: Math.max(0, Math.min(100, Number(rawConf.icp_profile) || 50)),
      competitor_analysis: Math.max(0, Math.min(100, Number(rawConf.competitor_analysis) || 50)),
      overall: Math.max(0, Math.min(100, Number(rawConf.overall) || 50)),
    },
    followup_questions: (Array.isArray(raw.followup_questions) ? raw.followup_questions : []).slice(0, 3).map((q: unknown) => {
      const fq = q as Record<string, unknown>;
      return {
        question: String(fq.question ?? ""),
        section: String(fq.section ?? ""),
        why: String(fq.why ?? ""),
      };
    }),
  };
}

/* ── POST handler ─────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const body = await req.json() as { idea?: string };
  const idea = body.idea?.trim() ?? "";

  if (!idea || idea.length < 20) {
    return Response.json({ error: "Idea too short" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // ── Usage limit check ────────────────────────────────────────
  const FREE_LIMIT = 3;
  const { data: profile } = await supabase
    .from("profiles")
    .select("analyses_used, analyses_reset_date, plan, bonus_analyses")
    .eq("id", user.id)
    .single();

  let currentUsage = profile?.analyses_used ?? 0;
  if (profile) {
    const resetDate = profile.analyses_reset_date ? new Date(profile.analyses_reset_date) : null;
    if (resetDate) {
      const now = new Date();
      const isNewMonth =
        now.getFullYear() > resetDate.getFullYear() ||
        (now.getFullYear() === resetDate.getFullYear() && now.getMonth() > resetDate.getMonth());
      if (isNewMonth) {
        await supabase.from("profiles")
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
  // ─────────────────────────────────────────────────────────────

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      // Create project record
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
      send({ type: "progress", message: "Project created in database", pct: 5 });

      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

      // ── PHASE 1: Fast analysis (Haiku) ───────────────────────
      try {
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
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            if (!streamStarted) {
              streamStarted = true;
              send({ type: "progress", message: "Intelligence engine connected", pct: 8 });
            }
            fullText += event.delta.text;
            send({ type: "chunk", text: event.delta.text });

            for (const { marker, message, pct } of SECTION_MARKERS) {
              if (!fired.has(marker) && fullText.includes(marker)) {
                fired.add(marker);
                send({ type: "progress", message, pct });
              }
            }
          }
        }

        send({ type: "progress", message: "Parsing fast analysis", pct: 95 });

        const match = fullText.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Fast analysis: no JSON returned");

        const raw = JSON.parse(match[0]) as Record<string, unknown>;
        const analysis = parseAnalysis(raw);

        await supabase.from("projects")
          .update({ analysis, title: analysis.title })
          .eq("id", project.id);

        send({ type: "done", projectId: project.id, analysis });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Fast analysis failed";
        send({ type: "error", message });
        await supabase.from("projects").delete().eq("id", project.id);
        controller.close();
        return;
      }

      // ── PHASE 2: Deep analysis (Sonnet) ─────────────────────
      send({ type: "deep_start" });
      send({ type: "deep_progress", message: "Connecting deep intelligence engine", pct: 3 });

      try {
        let deepText = "";
        const deepFired = new Set<string>();

        const deepStream = client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 16000,
          system: DEEP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: idea }],
        });

        let deepStarted = false;
        for await (const event of deepStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            if (!deepStarted) {
              deepStarted = true;
              send({ type: "deep_progress", message: "Sonnet reasoning engine active", pct: 6 });
            }
            deepText += event.delta.text;
            send({ type: "deep_chunk", text: event.delta.text });

            for (const { marker, message, pct } of DEEP_SECTION_MARKERS) {
              if (!deepFired.has(marker) && deepText.includes(marker)) {
                deepFired.add(marker);
                send({ type: "deep_progress", message, pct });
              }
            }
          }
        }

        send({ type: "deep_progress", message: "Parsing deep analysis", pct: 98 });

        const deepMatch = deepText.match(/\{[\s\S]*\}/);
        if (!deepMatch) throw new Error("Deep analysis: no JSON returned");

        const deepRaw = JSON.parse(deepMatch[0]) as Record<string, unknown>;
        const deepAnalysis = parseDeepAnalysis(deepRaw);

        await supabase.from("projects")
          .update({ deep_analysis: deepAnalysis, title: deepAnalysis.title })
          .eq("id", project.id);

        // Increment usage counter after both analyses complete
        await supabase.from("profiles")
          .update({ analyses_used: currentUsage + 1 })
          .eq("id", user.id);

        send({ type: "deep_done", projectId: project.id, analysis: deepAnalysis });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Deep analysis failed";
        send({ type: "deep_error", message });
        // Increment usage even if deep analysis fails (fast analysis succeeded)
        await supabase.from("profiles")
          .update({ analyses_used: currentUsage + 1 })
          .eq("id", user.id);
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
