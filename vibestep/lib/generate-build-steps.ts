import Anthropic from "@anthropic-ai/sdk";

const VALID_PHASES = [
  "discover",
  "define",
  "design",
  "build",
  "launch",
  "reflect",
] as const;

export type GeneratedStep = {
  phase: string;
  title: string;
  objective: string;
  guidance: string;
};

export type StackRecommendation = {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  payments: string;
  hosting: string;
};

export type Warning = {
  title: string;
  detail: string;
};

export type GeneratedPlan = {
  title: string;
  stack: StackRecommendation;
  warnings: Warning[];
  steps: GeneratedStep[];
};

function extractJson(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as unknown;
  }
  throw new Error("No JSON object found in response");
}

const DEFAULT_STACK: StackRecommendation = {
  frontend: "Next.js App Router",
  backend: "tRPC or Next.js API routes",
  database: "PostgreSQL via Supabase",
  auth: "Clerk or Supabase Auth",
  payments: "Stripe",
  hosting: "Vercel",
};

function parsePlan(raw: unknown): GeneratedPlan {
  if (
    !raw ||
    typeof raw !== "object" ||
    !("title" in raw) ||
    !("steps" in raw) ||
    !Array.isArray((raw as { steps: unknown }).steps)
  ) {
    throw new Error("Invalid response shape");
  }
  const obj = raw as Record<string, unknown>;

  const title = String(obj.title ?? "").trim() || "Untitled project";

  // Parse stack
  const rawStack = obj.stack as Record<string, unknown> | undefined;
  const stack: StackRecommendation = rawStack
    ? {
        frontend: String(rawStack.frontend ?? DEFAULT_STACK.frontend),
        backend: String(rawStack.backend ?? DEFAULT_STACK.backend),
        database: String(rawStack.database ?? DEFAULT_STACK.database),
        auth: String(rawStack.auth ?? DEFAULT_STACK.auth),
        payments: String(rawStack.payments ?? DEFAULT_STACK.payments),
        hosting: String(rawStack.hosting ?? DEFAULT_STACK.hosting),
      }
    : DEFAULT_STACK;

  // Parse warnings (Dead-End Detector)
  const rawWarnings = Array.isArray(obj.warnings) ? obj.warnings : [];
  const warnings: Warning[] = rawWarnings.slice(0, 3).map((w) => {
    const warn = w as Record<string, unknown>;
    return {
      title: String(warn.title ?? "Watch out").trim(),
      detail: String(warn.detail ?? "").trim(),
    };
  });

  // Parse steps
  const steps: GeneratedStep[] = (obj.steps as unknown[]).slice(0, 10).map((s, i) => {
    if (!s || typeof s !== "object") {
      return { phase: "build", title: `Step ${i + 1}`, objective: "", guidance: "" };
    }
    const step = s as Record<string, unknown>;
    const phaseStr = String(step.phase ?? "build").toLowerCase();
    const phase = (VALID_PHASES as readonly string[]).includes(phaseStr) ? phaseStr : "build";
    return {
      phase,
      title: String(step.title ?? `Step ${i + 1}`).trim(),
      objective: String(step.objective ?? "").trim(),
      guidance: String(step.guidance ?? "").trim(),
    };
  });

  while (steps.length < 10) {
    steps.push({ phase: "build", title: `Step ${steps.length + 1}`, objective: "", guidance: "" });
  }

  return { title, stack, warnings, steps };
}

export async function generateBuildSteps(idea: string): Promise<GeneratedPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const client = new Anthropic({ apiKey });

  const prompt = `You are a senior technical co-founder and brutal product architect. A founder just described their idea to you. Your job is to give them the exact same advice you would give a co-founder — specific, opinionated, and honest. No fluff. No "it depends." Make a decision and defend it.

You will output four things:
1. A sharp project title (max 8 words, product-name style, not a sentence)
2. A tech stack recommendation — for each layer, pick ONE technology and explain WHY for THIS specific idea in one sharp sentence. Mention what goes wrong if they ignore your recommendation.
3. Three "Dead-End Detector" warnings — the most dangerous architectural or product decisions this founder is likely to get wrong. Be specific to their idea. Make it sting a little. Each warning should make them think "I would have done exactly that."
4. Exactly 10 atomic build steps in sequence. Each step must be:
   - Small enough to complete in one focused session (2–4 hours)
   - Opinionated about HOW to do it, not just WHAT to do
   - Critical where necessary — if they skip this, say what breaks
   - Specific to their idea, not generic advice

Use these phases for steps: discover, define, design, build, launch, reflect

Return ONLY valid JSON with this exact structure (no markdown, no code fences, no explanation):
{
  "title": "Product Name Here",
  "stack": {
    "frontend": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong",
    "backend": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong",
    "database": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong",
    "auth": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong",
    "payments": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong",
    "hosting": "Technology — one sentence explaining why for THIS idea and what breaks if they choose wrong"
  },
  "warnings": [
    {
      "title": "Short warning title (max 8 words)",
      "detail": "2–3 sentences. Specific to their idea. Name the exact thing that will go wrong, when it will happen, and what it will cost them."
    },
    { "title": "...", "detail": "..." },
    { "title": "...", "detail": "..." }
  ],
  "steps": [
    {
      "phase": "discover",
      "title": "Step title (action verb, max 10 words)",
      "objective": "What this step produces and why it matters for this specific product. One direct sentence.",
      "guidance": "How to actually do this step. Be specific — name tools, methods, thresholds. If there's a wrong way to do it, say so. 2–4 sentences."
    }
  ]
}

The founder's idea:
${idea}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const text = textBlock && "text" in textBlock ? String(textBlock.text) : "";
  const raw = extractJson(text);
  return parsePlan(raw);
}

// Serialise stack+warnings for storage in build_steps.ai_output on step 0
export function serializeMeta(plan: GeneratedPlan): string {
  return JSON.stringify({ stack: plan.stack, warnings: plan.warnings });
}

// Deserialise back when reading from DB
export type ProjectMeta = { stack: StackRecommendation; warnings: Warning[] };
export function deserializeMeta(raw: string | null): ProjectMeta | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ProjectMeta;
    if (!parsed.stack || !parsed.warnings) return null;
    return parsed;
  } catch {
    return null;
  }
}
