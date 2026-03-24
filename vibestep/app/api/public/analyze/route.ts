import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/app/api/analyze/route";
import type { AnalysisData } from "@/app/api/analyze/route";

// Simple in-memory rate limiter — resets on server restart
// For production, use Redis or Upstash
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10; // requests per hour
const WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

export async function POST(req: NextRequest) {
  // Auth via Bearer token
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return Response.json({ error: "Missing Authorization header" }, { status: 401 });
  }

  // For MVP, validate against a fixed env var API key
  // In production: validate against a keys table in Supabase
  const validKey = process.env.PUBLIC_API_KEY;
  if (!validKey || token !== validKey) {
    return Response.json({ error: "Invalid API key" }, { status: 403 });
  }

  // Rate limit by token
  const rl = checkRateLimit(token);
  if (!rl.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Max 10 requests/hour." },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(Date.now() + WINDOW_MS) },
      }
    );
  }

  const body = await req.json().catch(() => ({})) as { idea?: string };
  const idea = body.idea?.trim() ?? "";

  if (!idea || idea.length < 20) {
    return Response.json({ error: "idea must be at least 20 characters" }, { status: 400 });
  }

  if (idea.length > 2000) {
    return Response.json({ error: "idea must be at most 2000 characters" }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: idea }],
    });

    const text = message.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("");

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "Analysis failed to parse" }, { status: 500 });
    }

    const analysis = JSON.parse(match[0]) as AnalysisData;

    return Response.json(analysis, {
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
