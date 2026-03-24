import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";
import type { ActionType } from "@/components/action-panel";

type Msg = { role: "user" | "assistant"; content: string };

type ActionPayload = {
  type: ActionType;
  projectIdea: string;
  projectTitle: string;
  context: Record<string, unknown>;
  messages?: Msg[];
};

function buildPrompt(
  type: ActionType,
  projectIdea: string,
  projectTitle: string,
  context: Record<string, unknown>,
): string {
  const base = `Project: "${projectTitle}"\nBuild: ${projectIdea}\n\n`;

  switch (type) {
    case "step": {
      const s = context as { step: number; title: string; description: string; estimated_hours: number; why: string };
      return base + `You are a senior full-stack engineer providing exact implementation guidance.

Working on Step ${s.step}: "${s.title}"
Task: ${s.description}
Why now: ${s.why}
Estimate: ~${s.estimated_hours}h

Give EXACT code, terminal commands, and config to complete this step. Use \`\`\`language code blocks for all code and commands. Structure:
1. What we're building (1 sentence)
2. Setup / prerequisites
3. Core implementation
4. How to verify it works

Be specific to this project. No filler.`;
    }

    case "deploy": {
      const d = context as { platform: string; action: string; priority: string };
      return base + `You are a DevOps expert.

Task: Set up ${d.platform}
Action required: ${d.action}
Priority: ${d.priority}

Provide EXACT step-by-step commands. Use \`\`\`bash for terminal, \`\`\`sql for SQL, \`\`\`env for env vars. Include:
1. Installation / setup commands
2. Required config or environment variables
3. Verification command to confirm success

Commands only. No fluff.`;
    }

    case "competitor": {
      const c = context as { name: string; weakness: string; your_advantage: string };
      return base + `You are a competitive intelligence analyst.

Competitor: ${c.name}
Known weakness: ${c.weakness}
Your angle: ${c.your_advantage}

Give a deep competitive analysis for a builder deciding how to position against them:
1. Likely tech stack and infrastructure
2. Pricing model (actual or estimated)
3. Three specific product weaknesses right now
4. Exact attack vector: how to win users away from them
5. One thing they do well worth studying

Be tactical and specific. This builder is making positioning decisions today.`;
    }

    case "viral": {
      return base + `You are a viral marketing expert who has launched multiple products.

Generate 5 platform-native posts. Make each one stop the scroll.

Format exactly as:
**[Platform]**
[Ready-to-post copy]

Platforms: Twitter/X (thread opener), LinkedIn, Reddit (include subreddit + title), Product Hunt (tagline + first comment), Hacker News (Show HN: title + opening paragraph).

Feel native to each platform. No corporate language. Specific, provocative, real.`;
    }

    case "iterate": {
      const it = context as { issue: string; fix: string; impact: string };
      return base + `You are a senior product engineer.

Gap to fix: ${it.issue}
Suggested approach: ${it.fix}
Impact: ${it.impact}

Provide EXACT implementation:
1. Root cause (why this gap appears)
2. Exact code / component changes
3. Database or API changes if needed
4. How to test the fix
5. Time estimate

Use code blocks for all technical content.`;
    }

    case "score": {
      const sc = context as { health_score: number; health_label: string };
      return base + `You are a product strategist.

Current score: ${sc.health_score}/100 (${sc.health_label})

Give 3 specific, high-leverage actions to improve the score by 15-25 points. For each:

**Action [N]: [Name]**
- What to do (specific)
- Why it raises the score
- Exact steps (with code if relevant)
- Time: X hours

Target root causes. Be honest about what's weak.`;
    }

    case "risk": {
      const r = context as { title: string; severity: string; description: string; fix: string };
      return base + `You are a senior software architect.

Risk: "${r.title}" (${r.severity} severity)
Description: ${r.description}
Suggested fix: ${r.fix}

Generate EXACT mitigation steps:
1. Why this risk is real for this specific build
2. Immediate actions (do today)
3. Code / config / architecture changes
4. Verification: how to confirm it's mitigated
5. What to monitor going forward

Use code blocks throughout.`;
    }

    case "ask": {
      const a = context as { health_score?: number; health_label?: string; summary?: string };
      return base + `You are Axiom, a product intelligence AI. You have analyzed this build.

${a.summary ? `Analysis: ${a.summary}` : ""}
${a.health_score !== undefined ? `Health: ${a.health_score}/100 (${a.health_label})` : ""}

Answer the builder's questions about their project with technical depth and honesty. Use code blocks when providing code or commands. Be specific to their build.`;
    }

    case "codegen": {
      const cg = context as { step?: number; title?: string; description?: string; why?: string; stack?: string };
      return base + `You are a senior full-stack engineer generating production-ready starter code.

Task: ${cg.title ?? ""}
Description: ${cg.description ?? ""}
${cg.stack ? `Tech stack: ${cg.stack}` : ""}
Why now: ${cg.why ?? ""}

Generate complete, copy-paste-ready code. Requirements:
- Include all necessary imports
- Add comments explaining non-obvious logic
- Follow best practices for the inferred tech stack
- Production-ready (not pseudocode, not TODO stubs)
- Start with the most critical file/function

Use appropriate language code blocks (\`\`\`typescript, \`\`\`bash, \`\`\`sql, etc). After code, add a 2-sentence "How to use this" note.`;
    }

    case "explain": {
      const ex = context as { section: string; content: string };
      return base + `You are an expert at making complex concepts simple.

Section: ${ex.section}
Content: ${ex.content}

Explain this in plain language a non-technical founder can understand in 30 seconds:
1. One-sentence plain-English summary
2. Real-world analogy (compare it to something everyday)
3. What this means FOR THEM specifically — the action or implication

Max 120 words. No jargon. Direct.`;
    }

    case "stuck": {
      const st = context as { step: number; title: string; description: string; estimated_hours: number; why: string };
      return base + `You are a patient senior engineer helping someone who is stuck.

Step ${st.step}: "${st.title}"
What to do: ${st.description}
Why this step: ${st.why}

They're stuck. Give exactly:

**3 Approaches to get unstuck:**

**Approach 1: Simplest path**
When stuck because: [reason]
First action: [exact thing to do right now]
\`\`\`bash
# First 2-3 commands
\`\`\`

**Approach 2: Different angle**
...

**Approach 3: Ask for help**
Where to ask: [specific resource/community]
What to paste: [template for their question]

---
**Break it into 5 sub-steps (5-15 min each):**
1. [micro task]
2. [micro task]
3. [micro task]
4. [micro task]
5. [micro task]

Be specific to this exact project and step.`;
    }

    default:
      return base + "You are an expert product and engineering advisor. Be specific and actionable.";
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as ActionPayload;
  const { type, projectIdea, projectTitle, context, messages = [] } = body;

  const systemPrompt = buildPrompt(type, projectIdea, projectTitle, context);
  const apiMessages: Msg[] = messages.length > 0
    ? messages
    : [{ role: "user", content: "Begin." }];

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        const stream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: systemPrompt,
          messages: apiMessages,
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(encoder.encode(`\n\nError: ${err instanceof Error ? err.message : "Failed"}`));
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
