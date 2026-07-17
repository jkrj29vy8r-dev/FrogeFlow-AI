import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const AI_ACTIONS = [
  "rewrite",
  "expand",
  "shorten",
  "improve",
  "tone",
  "translate",
  "summarize",
  "examples",
  "faq",
  "continue",
] as const;

type AiAction = (typeof AI_ACTIONS)[number];

const requestSchema = z.object({
  action: z.enum(AI_ACTIONS),
  text: z.string().min(1).max(10000),
  tone: z.string().max(50).optional(),
  language: z.string().max(50).optional(),
});

const encoder = new TextEncoder();

function buildPrompt(
  action: AiAction,
  text: string,
  opts: { tone?: string; language?: string }
): string {
  const prompts: Record<AiAction, string> = {
    rewrite: `Rewrite the following text to improve clarity and flow while preserving the exact meaning:\n\n${text}`,
    expand: `Expand the following text with more detail, context, examples, and depth:\n\n${text}`,
    shorten: `Shorten the following text to its essential points while preserving the core message:\n\n${text}`,
    improve: `Improve the writing quality — stronger word choices, better sentence rhythm, smoother flow:\n\n${text}`,
    tone: `Rewrite the following text in a ${opts.tone ?? "professional"} tone while keeping the same meaning:\n\n${text}`,
    translate: `Translate the following text to ${opts.language ?? "Spanish"}. Maintain the same tone and style:\n\n${text}`,
    summarize: `Write a concise, accurate summary of the following text in 2–3 sentences:\n\n${text}`,
    examples: `Generate 3 concrete, specific, real-world examples that illustrate the concept in this text. Format as a numbered list:\n\n${text}`,
    faq: `Generate 5 FAQs (with concise answers) a reader might have about this content. Format each as:\nQ: ...\nA: ...\n\n${text}`,
    continue: `Continue writing naturally from where this text leaves off. Match the style, tone, and voice exactly:\n\n${text}`,
  };
  return prompts[action];
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await rateLimit(`edit:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: rateLimitHeaders(rl),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, text, tone, language } = parsed.data;
  const prompt = buildPrompt(action, text, { tone, language });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const anthropic = getAnthropic();
        const stream = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: 2048,
          system:
            "You are an expert writing assistant embedded in a document editor. Output ONLY the requested content — no preambles, no explanations, no meta-commentary. Output clean prose ready to insert directly into a document.",
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "token", text: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "AI editing failed";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
