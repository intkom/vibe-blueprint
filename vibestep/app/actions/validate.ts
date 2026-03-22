"use server";

import Anthropic from "@anthropic-ai/sdk";

export type ValidationResult = {
  market_size: string;
  market_reasoning: string;
  competitors: Array<{ name: string; weakness: string }>;
  unique_angle: string;
  biggest_risk: string;
  verdict: "Build it" | "Pivot" | "Skip it";
  verdict_reasoning: string;
  confidence: "high" | "medium" | "low";
};

export type ValidateState = {
  result: ValidationResult | null;
  error: string | null;
  idea: string;
};

const INITIAL_RESULT: ValidateState = { result: null, error: null, idea: "" };

export async function validateIdea(
  _prev: ValidateState,
  formData: FormData
): Promise<ValidateState> {
  const idea = String(formData.get("idea") ?? "").trim();

  if (!idea || idea.length < 20) {
    return { result: null, error: "Please describe your idea in at least 20 characters.", idea };
  }

  const client = new Anthropic();

  const prompt = `Analyze this startup idea with brutal honesty. Be specific and data-driven — no fluff.

IDEA: "${idea}"

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "market_size": "Specific TAM estimate like '~$3.8B TAM (2024)' — never use ranges, pick a number",
  "market_reasoning": "1-2 sentences explaining how you sized the market",
  "competitors": [
    {"name": "Specific competitor name", "weakness": "Their key exploitable weakness in 1 sentence"},
    {"name": "Specific competitor name", "weakness": "Their key exploitable weakness in 1 sentence"},
    {"name": "Specific competitor name", "weakness": "Their key exploitable weakness in 1 sentence"}
  ],
  "unique_angle": "The specific, defensible angle that makes this idea different in 1-2 sentences",
  "biggest_risk": "The single most likely reason this fails — be brutally specific, 1 sentence",
  "verdict": "Build it",
  "verdict_reasoning": "2-3 sentences explaining verdict. Mention the specific market opportunity or fatal flaw.",
  "confidence": "high"
}

Verdict rules:
- "Build it": Clear pain point, reachable market, differentiation exists, risk is manageable
- "Pivot": Good core insight but wrong angle — the market or approach needs adjustment
- "Skip it": Market too small (<$500M), competition too entrenched, or timing is fundamentally wrong

Confidence rules:
- "high": Strong signal either way (clearly good or clearly bad)
- "medium": Mixed signals, depends on execution
- "low": Very uncertain, highly depends on external factors`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const result = JSON.parse(jsonMatch[0]) as ValidationResult;

    // Validate required fields
    if (!result.verdict || !result.market_size || !Array.isArray(result.competitors)) {
      throw new Error("Incomplete response from AI");
    }

    // Normalise verdict
    if (!["Build it", "Pivot", "Skip it"].includes(result.verdict)) {
      result.verdict = "Pivot";
    }

    return { result, error: null, idea };
  } catch (err) {
    console.error("[validateIdea] error:", err);
    return { result: null, error: "Analysis failed — please try again.", idea };
  }
}

export { INITIAL_RESULT };
