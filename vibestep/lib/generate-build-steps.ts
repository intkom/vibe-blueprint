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

export type GeneratedPlan = {
  title: string;
  steps: GeneratedStep[];
};

function extractJson(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as unknown;
  }
  throw new Error("No JSON object found in response");
}

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
  const obj = raw as { title: string; steps: unknown[] };
  const title = String(obj.title ?? "").trim() || "Untitled project";
  const steps = obj.steps.slice(0, 10).map((s, i) => {
    if (!s || typeof s !== "object") {
      return {
        phase: "build",
        title: `Step ${i + 1}`,
        objective: "",
        guidance: "",
      };
    }
    const step = s as Record<string, unknown>;
    const phaseStr = String(step.phase ?? "build").toLowerCase();
    const phase = (VALID_PHASES as readonly string[]).includes(phaseStr)
      ? phaseStr
      : "build";
    return {
      phase,
      title: String(step.title ?? `Step ${i + 1}`).trim(),
      objective: String(step.objective ?? "").trim(),
      guidance: String(step.guidance ?? "").trim(),
    };
  });
  while (steps.length < 10) {
    steps.push({
      phase: "build",
      title: `Step ${steps.length + 1}`,
      objective: "",
      guidance: "",
    });
  }
  return { title, steps };
}

export async function generateBuildSteps(idea: string): Promise<GeneratedPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const client = new Anthropic({ apiKey });

  const prompt = `You are a product development coach. Given a product idea, generate exactly 10 atomic build steps. Each step should be small, actionable, and in sequence. Use phases: discover, define, design, build, launch, or reflect.

Return ONLY valid JSON with this exact structure (no markdown, no code fence):
{"title": "Short project title (max 80 chars)", "steps": [{"phase": "discover", "title": "Step title", "objective": "What to accomplish", "guidance": "Practical tips"}, ...]}

Idea: ${idea}`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const text =
    textBlock && "text" in textBlock ? String(textBlock.text) : "";
  const raw = extractJson(text);
  return parsePlan(raw);
}
