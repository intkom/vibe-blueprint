import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

const client = new Anthropic();

export type TechStack =
  | "next_supabase"
  | "react_firebase"
  | "vue_node"
  | "react_native"
  | "python_fastapi";

const STACK_LABELS: Record<TechStack, string> = {
  next_supabase:   "Next.js + Supabase",
  react_firebase:  "React + Firebase",
  vue_node:        "Vue.js + Node.js",
  react_native:    "React Native + Expo",
  python_fastapi:  "Python + FastAPI",
};

function buildPrompt(
  step: string,
  idea: string,
  stack: TechStack,
  projectTitle: string,
): string {
  const stackLabel = STACK_LABELS[stack];

  const STACK_CONTEXT: Record<TechStack, string> = {
    next_supabase: `
Stack: Next.js 15 (App Router) + TypeScript + Supabase (Postgres + Auth + Storage)
- Use Server Components by default, 'use client' only when needed
- API routes in app/api/**/route.ts
- Supabase client: import { createClient } from "@/utils/supabase/server" (server) or "@/utils/supabase/client" (client)
- Tailwind is NOT available — use inline styles matching the dark cosmic theme (bg #030014, accent #7c3aed)`,

    react_firebase: `
Stack: React 18 + TypeScript + Firebase v10 (Firestore, Auth, Storage)
- Functional components with hooks
- Firebase: import { db, auth, storage } from "@/lib/firebase"
- Use onSnapshot for real-time data
- Context provider for auth state`,

    vue_node: `
Stack: Vue 3 (Composition API) + TypeScript + Node.js (Express) + Postgres
- Vue 3 with <script setup lang="ts">
- Pinia for state management
- Express routes: router.get/post/put/delete
- Use Prisma ORM for database access`,

    react_native: `
Stack: React Native + Expo (SDK 51) + TypeScript
- Expo Router for navigation
- NativeWind for styling (Tailwind classes on native)
- Supabase for backend: @supabase/supabase-js
- AsyncStorage for local persistence`,

    python_fastapi: `
Stack: Python 3.12 + FastAPI + PostgreSQL (asyncpg) + Pydantic v2
- Async endpoints with async def
- SQLAlchemy 2.0 async ORM
- Pydantic models for request/response validation
- JWT auth with python-jose
- requirements.txt format`,
  };

  return `You are a senior engineer writing production-ready code for a real product.

Project: "${projectTitle}"
Idea: ${idea}
Task: ${step}
${STACK_CONTEXT[stack]}

Generate COMPLETE, WORKING code that implements this task. Requirements:
1. Start with the primary file (suggest exact filename as a comment on line 1: // filename: path/to/file.ts)
2. All necessary imports included
3. TypeScript types / Python type hints everywhere
4. Error handling for production use
5. Comments only where logic is non-obvious
6. After main file: include installation command if new packages needed (as \`\`\`bash block)
7. End with a 2-line "Usage" note (as \`\`\`comment block)

DO NOT: use pseudo-code, TODO stubs, "implement this yourself" placeholders, or simplified examples.
DO: write the actual implementation as if shipping tomorrow.

Use appropriate code blocks: \`\`\`typescript, \`\`\`python, \`\`\`bash, \`\`\`sql, etc.`;
}

export type CodeEvent =
  | { type: "start"; stack: string; stackLabel: string }
  | { type: "chunk"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const body = await req.json() as {
    step: string;
    idea: string;
    stack: TechStack;
    projectTitle?: string;
  };

  const { step, idea, stack = "next_supabase", projectTitle = "Your Project" } = body;
  if (!step || !idea) {
    return new Response(JSON.stringify({ error: "step and idea are required" }), { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(event: CodeEvent) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      try {
        send({ type: "start", stack, stackLabel: STACK_LABELS[stack] });

        const anthropicStream = await client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4096,
          messages: [{ role: "user", content: buildPrompt(step, idea, stack, projectTitle) }],
          system: "You are a senior full-stack engineer. Write only production code. No markdown headings outside code blocks. No filler text.",
        });

        for await (const chunk of anthropicStream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            send({ type: "chunk", text: chunk.delta.text });
          }
        }

        send({ type: "done" });
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Generation failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    },
  });
}
