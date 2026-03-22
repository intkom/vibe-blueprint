import Anthropic from "@anthropic-ai/sdk";

export type StepEnrichment = {
  acceptance_criteria: string[];
  common_mistakes: { title: string; detail: string }[];
  estimated_hours: number;
  difficulty: "easy" | "medium" | "hard";
};

export type InputStep = {
  phase: string;
  title: string;
  objective: string;
  guidance: string;
};

function extractJson(text: string): unknown {
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) return JSON.parse(arrMatch[0]);
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) return JSON.parse(objMatch[0]);
  throw new Error("No JSON found in enrichment response");
}

function parseEnrichment(raw: unknown): StepEnrichment {
  const fallback: StepEnrichment = {
    acceptance_criteria: [],
    common_mistakes: [],
    estimated_hours: 3,
    difficulty: "medium",
  };
  if (!raw || typeof raw !== "object") return fallback;
  const obj = raw as Record<string, unknown>;

  const acceptance_criteria = Array.isArray(obj.acceptance_criteria)
    ? obj.acceptance_criteria.slice(0, 5).map(s => String(s).trim()).filter(Boolean)
    : [];

  const common_mistakes = Array.isArray(obj.common_mistakes)
    ? obj.common_mistakes.slice(0, 3).map(m => {
        const mo = m as Record<string, unknown>;
        return { title: String(mo.title ?? "").trim(), detail: String(mo.detail ?? "").trim() };
      }).filter(m => m.title)
    : [];

  const estimated_hours = Math.min(8, Math.max(1, parseInt(String(obj.estimated_hours ?? "3"), 10) || 3));
  const rawDiff = String(obj.difficulty ?? "medium").toLowerCase();
  const difficulty = (["easy", "medium", "hard"] as const).find(d => d === rawDiff) ?? "medium";

  return { acceptance_criteria, common_mistakes, estimated_hours, difficulty };
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey });
}

/* ── Bulk enrichment — one call for all steps at project creation time ── */
export async function enrichAllSteps(steps: InputStep[]): Promise<StepEnrichment[]> {
  const client = getClient();

  const stepsPayload = steps.map((s, i) => ({
    index: i,
    phase: s.phase,
    title: s.title,
    objective: s.objective,
  }));

  const prompt = `You are a senior engineering coach reviewing a sequence of build steps for a software project.

For EACH step below, generate:
1. acceptance_criteria: array of 3-5 binary pass/fail tests the developer can verify themselves. Be SPECIFIC — name exact things to check, not vague goals.
2. common_mistakes: array of exactly 3 objects {title, detail}. title = max 8 words. detail = 2 sentences explaining the exact failure mode and when it strikes.
3. estimated_hours: integer 1-8, realistic for a focused developer session.
4. difficulty: "easy", "medium", or "hard" based on technical complexity.

Steps to enrich:
${JSON.stringify(stepsPayload, null, 2)}

Return ONLY a valid JSON array with exactly ${steps.length} objects in the same order as the input. No markdown, no code fences, no explanation:
[
  {
    "acceptance_criteria": ["specific check 1", "specific check 2", "specific check 3"],
    "common_mistakes": [
      {"title": "Short mistake title", "detail": "Sentence one. Sentence two."},
      {"title": "...", "detail": "..."},
      {"title": "...", "detail": "..."}
    ],
    "estimated_hours": 3,
    "difficulty": "medium"
  }
]`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find(b => b.type === "text");
  const text = textBlock && "text" in textBlock ? String(textBlock.text) : "[]";

  let parsed: unknown;
  try {
    parsed = extractJson(text);
  } catch {
    return steps.map(() => ({ acceptance_criteria: [], common_mistakes: [], estimated_hours: 3, difficulty: "medium" as const }));
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  // Ensure we have one entry per step (pad with fallbacks if AI returned fewer)
  const results: StepEnrichment[] = steps.map((_, i) => parseEnrichment(arr[i] ?? null));
  return results;
}

/* ── Single-step enrichment — lazy fallback when step detail is first viewed ── */
export async function enrichSingleStep(step: InputStep): Promise<StepEnrichment> {
  const client = getClient();

  const prompt = `You are a senior engineering coach reviewing one build step for a software project.

Phase: ${step.phase}
Title: ${step.title}
Objective: ${step.objective}
Guidance: ${step.guidance}

Generate:
1. acceptance_criteria: 3-5 specific, binary pass/fail checks the developer can verify
2. common_mistakes: exactly 3 objects {title (max 8 words), detail (2 sentences specific to this step)}
3. estimated_hours: integer 1-8
4. difficulty: "easy", "medium", or "hard"

Return ONLY valid JSON, no markdown:
{
  "acceptance_criteria": ["check 1", "check 2", "check 3"],
  "common_mistakes": [
    {"title": "Short title", "detail": "Sentence one. Sentence two."},
    {"title": "...", "detail": "..."},
    {"title": "...", "detail": "..."}
  ],
  "estimated_hours": 3,
  "difficulty": "medium"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === "text");
    const text = textBlock && "text" in textBlock ? String(textBlock.text) : "{}";
    const raw = extractJson(text);
    return parseEnrichment(Array.isArray(raw) ? raw[0] : raw);
  } catch {
    return { acceptance_criteria: [], common_mistakes: [], estimated_hours: 3, difficulty: "medium" };
  }
}
