import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  // Auth guard
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages, systemPrompt } = await req.json() as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    systemPrompt: string;
  };

  if (!messages?.length || !systemPrompt) {
    return new Response("Missing required fields", { status: 400 });
  }

  const client = new Anthropic();

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const stream = client.messages.stream({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages,
        });
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode("\n\nSorry, something went wrong. Please try again.")
        );
        console.error("[chat/route] stream error:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
