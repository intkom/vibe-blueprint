import Anthropic from "@anthropic-ai/sdk";

/* ─── Tool type registry ─────────────────────────────────────── */

export const TOOL_TYPES = ["validator", "stack", "monetization", "sprint"] as const;
export type ToolType = (typeof TOOL_TYPES)[number];

export const TOOL_META: Record<ToolType, {
  label: string;
  tagline: string;
  badge: string;
  placeholder: string;
  loadingMessages: string[];
  accentColor: string;
  accentBg: string;
}> = {
  validator: {
    label: "Idea Validator",
    tagline: "Is it worth building?",
    badge: "7-dimension scorecard",
    placeholder: "Describe your idea. What problem does it solve? Who is it for? How is it different from what exists?\n\nBe direct — 2–5 sentences is enough.",
    loadingMessages: [
      "Analysing market signals…",
      "Scoring differentiation…",
      "Checking distribution paths…",
      "Calculating monetisation fit…",
      "Identifying kill risks…",
    ],
    accentColor: "rgba(251,191,36,0.8)",
    accentBg: "rgba(251,191,36,0.08)",
  },
  stack: {
    label: "Tech Blueprint",
    tagline: "Exactly what to build with",
    badge: "Full stack decision",
    placeholder: "Describe what you're building. Mention:\n- Key features\n- Approximate team size\n- Timeline pressure\n- Any strong tech preferences (or none is fine)",
    loadingMessages: [
      "Evaluating your requirements…",
      "Selecting optimal stack layers…",
      "Identifying architectural traps…",
      "Flagging premature decisions…",
      "Writing your blueprint…",
    ],
    accentColor: "rgba(139,92,246,0.8)",
    accentBg: "rgba(139,92,246,0.08)",
  },
  monetization: {
    label: "Monetization Map",
    tagline: "How to make money from it",
    badge: "Pricing architecture",
    placeholder: "Describe your product and who pays for it. Include:\n- Who the user is\n- What value they get\n- Any pricing ideas you already have (or none is fine)",
    loadingMessages: [
      "Evaluating monetisation models…",
      "Scoring pricing fit…",
      "Designing tier structure…",
      "Mapping upgrade triggers…",
      "Building your pricing architecture…",
    ],
    accentColor: "rgba(52,211,153,0.8)",
    accentBg: "rgba(52,211,153,0.08)",
  },
  sprint: {
    label: "Sprint Planner",
    tagline: "How to build it, step by step",
    badge: "10 atomic steps",
    placeholder: "What are you building? Who is it for? What problem does it solve? What tech stack do you prefer?\n\nThe more detail, the more specific your steps.",
    loadingMessages: [
      "Reading your idea…",
      "Thinking like a senior engineer…",
      "Breaking it into atomic steps…",
      "Sequencing build order…",
      "Saving your blueprint…",
    ],
    accentColor: "rgba(96,165,250,0.8)",
    accentBg: "rgba(96,165,250,0.08)",
  },
};

/* ─── Output types ───────────────────────────────────────────── */

export type ValidatorDimension = {
  name: string;
  score: number;
  reason: string;
};

export type ValidatorOutput = {
  tool_type: "validator";
  title: string;
  dimensions: ValidatorDimension[];
  verdict: "STRONG BUILD" | "BUILD WITH CONDITIONS" | "VALIDATE FURTHER" | "DO NOT BUILD";
  kill_risk: string;
  proceed_if: string;
  next_action: string;
};

export type StackLayer = {
  layer: string;
  pick: string;
  reason: string;
  skip: string;
};

export type StackDecision = {
  decision: string;
  how: string;
};

export type StackDeferItem = {
  item: string;
  when: string;
};

export type StackOutput = {
  tool_type: "stack";
  title: string;
  layers: StackLayer[];
  decisions_now: StackDecision[];
  defer: StackDeferItem[];
  next_action: string;
};

export type MonetizationModel = {
  model: string;
  fit_score: number;
  why: string;
  risk: string;
};

export type PricingTier = {
  name: string;
  price: string;
  limits: string;
  purpose: string;
};

export type MonetizationOutput = {
  tool_type: "monetization";
  title: string;
  models: MonetizationModel[];
  recommended: string;
  tiers: PricingTier[];
  upgrade_triggers: string[];
  next_action: string;
};

export type AnyToolOutput = ValidatorOutput | StackOutput | MonetizationOutput;

/* ─── Prompts ────────────────────────────────────────────────── */

const VALIDATOR_PROMPT = (idea: string) => `You are a senior product analyst with deep experience evaluating early-stage startup ideas. A founder just described their idea. Your job: score it honestly on 7 dimensions. No cheerleading. No vague positivity. If something is weak, say why specifically.

Score each dimension 1–10. In the reason field, give ONE specific, critical sentence that explains the score — not a generic observation.

The 7 dimensions are fixed:
1. Market Size — is the addressable market real and reachable without VC funding?
2. Problem Sharpness — is this a daily/weekly pain that people actively complain about?
3. Competition Level — how crowded is this space, and is that good or bad for this idea?
4. Differentiation — does this have a specific angle competitors don't have?
5. Technical Risk — how hard is the core technical challenge?
6. Distribution Path — is there a clear channel to reach users without $100k in ads?
7. Monetization Fit — does the pricing model match how users think about value?

Verdict options (pick ONE exactly):
- "STRONG BUILD" — 5+ dimensions above 7, distribution is viable
- "BUILD WITH CONDITIONS" — solid core but 1–2 critical issues to resolve first
- "VALIDATE FURTHER" — too many unknowns, needs user interviews before code
- "DO NOT BUILD" — fundamental flaw that cannot be fixed by pivoting slightly

Return ONLY valid JSON, no markdown, no fences:
{
  "tool_type": "validator",
  "title": "2–5 word product concept name",
  "dimensions": [
    { "name": "Market Size", "score": 7, "reason": "One specific sentence about THIS idea." },
    { "name": "Problem Sharpness", "score": 9, "reason": "..." },
    { "name": "Competition Level", "score": 5, "reason": "..." },
    { "name": "Differentiation", "score": 6, "reason": "..." },
    { "name": "Technical Risk", "score": 8, "reason": "..." },
    { "name": "Distribution Path", "score": 4, "reason": "..." },
    { "name": "Monetization Fit", "score": 7, "reason": "..." }
  ],
  "verdict": "BUILD WITH CONDITIONS",
  "kill_risk": "One sentence. The single most likely reason this idea fails. Be specific to this idea.",
  "proceed_if": "One sentence. The concrete signal that means this is worth building.",
  "next_action": "The single most important thing to do in the next 7 days. Not 'do research.' Be specific."
}

Idea: ${idea}`;

const STACK_PROMPT = (idea: string) => `You are a technical co-founder reviewing a product spec. Your job: pick the exact tech stack for this specific idea. Not the most popular stack. The right stack for THIS idea, THIS team size, THIS timeline.

Rules:
- For each layer, pick EXACTLY ONE technology. Make a decision.
- The "reason" must explain why this choice fits THIS specific idea — one critical sentence.
- The "skip" must name the alternative and why it's wrong for THIS idea.
- decisions_now: the 3 architectural choices they MUST make before writing code, or they'll rewrite later.
- defer: the 3 things they'll be tempted to add in week 1 but should wait for.

Layers to include: Frontend, Backend, Database, Auth, Payments, File Storage, Email, Hosting

Return ONLY valid JSON, no markdown, no fences:
{
  "tool_type": "stack",
  "title": "2–5 word product concept name",
  "layers": [
    { "layer": "Frontend", "pick": "Next.js App Router", "reason": "One sentence specific to this idea.", "skip": "Remix — reason in 4 words" },
    { "layer": "Backend", ... },
    { "layer": "Database", ... },
    { "layer": "Auth", ... },
    { "layer": "Payments", ... },
    { "layer": "File Storage", ... },
    { "layer": "Email", ... },
    { "layer": "Hosting", ... }
  ],
  "decisions_now": [
    { "decision": "Short decision name", "how": "One sentence on how to make this decision correctly." },
    { "decision": "...", "how": "..." },
    { "decision": "...", "how": "..." }
  ],
  "defer": [
    { "item": "Short item name", "when": "The specific trigger that means it's time to add this." },
    { "item": "...", "when": "..." },
    { "item": "...", "when": "..." }
  ],
  "next_action": "The first technical action to take. Name the exact command or step."
}

Product description: ${idea}`;

const MONETIZATION_PROMPT = (idea: string) => `You are a SaaS pricing strategist. A founder just described their product. Your job: evaluate 4 monetisation models and build an exact pricing architecture for this specific product.

Score each model 1–10 for fit with THIS product. Be opinionated — say which one wins and why the others don't fit.

Models to evaluate (use exactly these names):
1. "Per-seat SaaS" — monthly per-user subscription
2. "Usage-based" — pay per action/output/API call
3. "Freemium" — free tier + paid upgrade
4. "One-time license" — single payment, perpetual access

Design exactly 4 pricing tiers. Each tier must have a PURPOSE (acquisition / conversion / expansion / enterprise).

Upgrade triggers: name the EXACT moment in the UX where users hit a wall and must pay. Not "when they need more features." The specific action that fails until they upgrade.

Return ONLY valid JSON, no markdown, no fences:
{
  "tool_type": "monetization",
  "title": "2–5 word product concept name",
  "models": [
    { "model": "Per-seat SaaS", "fit_score": 8, "why": "One sentence specific to this product.", "risk": "One sentence specific risk." },
    { "model": "Usage-based", ... },
    { "model": "Freemium", ... },
    { "model": "One-time license", ... }
  ],
  "recommended": "Per-seat SaaS + Freemium gate",
  "tiers": [
    { "name": "Free", "price": "$0", "limits": "Specific limits that create friction", "purpose": "Acquisition" },
    { "name": "Starter", "price": "$9/mo", "limits": "...", "purpose": "Conversion" },
    { "name": "Builder", "price": "$29/mo", "limits": "...", "purpose": "Expansion" },
    { "name": "Team", "price": "$79/mo", "limits": "...", "purpose": "Enterprise entry" }
  ],
  "upgrade_triggers": [
    "Exact UX moment 1 — what the user tries to do and can't",
    "Exact UX moment 2",
    "Exact UX moment 3",
    "Exact UX moment 4"
  ],
  "next_action": "The single most important pricing decision to make this week."
}

Product description: ${idea}`;

/* ─── Claude caller ──────────────────────────────────────────── */

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && "text" in block ? String(block.text) : "";
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

/* ─── Parsers ────────────────────────────────────────────────── */

function parseValidator(raw: unknown): ValidatorOutput {
  const o = raw as Record<string, unknown>;
  const dimensions = (Array.isArray(o.dimensions) ? o.dimensions : []).map((d: unknown) => {
    const dim = d as Record<string, unknown>;
    return {
      name: String(dim.name ?? ""),
      score: Math.max(1, Math.min(10, Number(dim.score ?? 5))),
      reason: String(dim.reason ?? ""),
    };
  });
  const validVerdicts = ["STRONG BUILD", "BUILD WITH CONDITIONS", "VALIDATE FURTHER", "DO NOT BUILD"] as const;
  const rawVerdict = String(o.verdict ?? "VALIDATE FURTHER").toUpperCase();
  const verdict = (validVerdicts as readonly string[]).includes(rawVerdict)
    ? (rawVerdict as ValidatorOutput["verdict"])
    : "VALIDATE FURTHER";
  return {
    tool_type: "validator",
    title: String(o.title ?? "Untitled idea"),
    dimensions,
    verdict,
    kill_risk: String(o.kill_risk ?? ""),
    proceed_if: String(o.proceed_if ?? ""),
    next_action: String(o.next_action ?? ""),
  };
}

function parseStack(raw: unknown): StackOutput {
  const o = raw as Record<string, unknown>;
  const layers = (Array.isArray(o.layers) ? o.layers : []).map((l: unknown) => {
    const layer = l as Record<string, unknown>;
    return {
      layer: String(layer.layer ?? ""),
      pick: String(layer.pick ?? ""),
      reason: String(layer.reason ?? ""),
      skip: String(layer.skip ?? ""),
    };
  });
  const decisions_now = (Array.isArray(o.decisions_now) ? o.decisions_now : []).map((d: unknown) => {
    const dec = d as Record<string, unknown>;
    return { decision: String(dec.decision ?? ""), how: String(dec.how ?? "") };
  });
  const defer = (Array.isArray(o.defer) ? o.defer : []).map((d: unknown) => {
    const def = d as Record<string, unknown>;
    return { item: String(def.item ?? ""), when: String(def.when ?? "") };
  });
  return {
    tool_type: "stack",
    title: String(o.title ?? "Untitled project"),
    layers,
    decisions_now,
    defer,
    next_action: String(o.next_action ?? ""),
  };
}

function parseMonetization(raw: unknown): MonetizationOutput {
  const o = raw as Record<string, unknown>;
  const models = (Array.isArray(o.models) ? o.models : []).map((m: unknown) => {
    const mod = m as Record<string, unknown>;
    return {
      model: String(mod.model ?? ""),
      fit_score: Math.max(1, Math.min(10, Number(mod.fit_score ?? 5))),
      why: String(mod.why ?? ""),
      risk: String(mod.risk ?? ""),
    };
  });
  const tiers = (Array.isArray(o.tiers) ? o.tiers : []).map((t: unknown) => {
    const tier = t as Record<string, unknown>;
    return {
      name: String(tier.name ?? ""),
      price: String(tier.price ?? ""),
      limits: String(tier.limits ?? ""),
      purpose: String(tier.purpose ?? ""),
    };
  });
  const upgrade_triggers = (Array.isArray(o.upgrade_triggers) ? o.upgrade_triggers : []).map(String);
  return {
    tool_type: "monetization",
    title: String(o.title ?? "Untitled project"),
    models,
    recommended: String(o.recommended ?? ""),
    tiers,
    upgrade_triggers,
    next_action: String(o.next_action ?? ""),
  };
}

/* ─── Main runner ────────────────────────────────────────────── */

export async function runTool(toolType: "validator", idea: string): Promise<ValidatorOutput>;
export async function runTool(toolType: "stack", idea: string): Promise<StackOutput>;
export async function runTool(toolType: "monetization", idea: string): Promise<MonetizationOutput>;
export async function runTool(toolType: ToolType, idea: string): Promise<AnyToolOutput>;
export async function runTool(toolType: ToolType, idea: string): Promise<AnyToolOutput> {
  let prompt: string;
  if (toolType === "validator") prompt = VALIDATOR_PROMPT(idea);
  else if (toolType === "stack") prompt = STACK_PROMPT(idea);
  else if (toolType === "monetization") prompt = MONETIZATION_PROMPT(idea);
  else throw new Error(`runTool called with sprint type — use generateBuildSteps instead`);

  const text = await callClaude(prompt);
  const raw = extractJson(text);

  if (toolType === "validator") return parseValidator(raw);
  if (toolType === "stack") return parseStack(raw);
  return parseMonetization(raw);
}

/* ─── Storage helpers ────────────────────────────────────────── */

export function serializeToolOutput(output: AnyToolOutput): string {
  return JSON.stringify(output);
}

export function deserializeToolOutput(raw: string | null): AnyToolOutput | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AnyToolOutput;
    if (!parsed.tool_type) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isToolType(phase: string | null): phase is "validator" | "stack" | "monetization" {
  return phase === "validator" || phase === "stack" || phase === "monetization";
}
