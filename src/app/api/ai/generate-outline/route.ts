import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL, AI_MAX_TOKENS } from "@/lib/ai/client";
import { buildOutlinePrompt } from "@/lib/ai/prompts";
import type { DocumentMetadata, OutlineSection } from "@/features/documents/types";
import type { Section } from "@/types/database";
import { generationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  documentId: z.string().uuid(),
});

const encoder = new TextEncoder();

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function parseOutlineJSON(text: string): OutlineSection[] {
  // Strip markdown code fences if the model added them
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  const parsed = JSON.parse(cleaned) as { sections?: unknown[] };

  if (!Array.isArray(parsed.sections)) {
    throw new Error("AI returned invalid outline format");
  }

  return parsed.sections.map((item, i) => {
    const s = item as Record<string, unknown>;
    return {
      position: typeof s.position === "number" ? s.position : i + 1,
      title: String(s.title ?? `Section ${i + 1}`),
      section_type: String(s.section_type ?? "chapter") as OutlineSection["section_type"],
      description: String(s.description ?? ""),
    };
  });
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await generationRateLimit(`outline:${user.id}`);
  if (!rl.success) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: rateLimitHeaders(rl),
    });
  }

  const { ok: hasCredits } = await checkCredits(supabase, user.id, 1);
  if (!hasCredits) {
    return Response.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid documentId" }, { status: 400 });
  }

  const { documentId } = parsed.data;

  // Fetch document and verify ownership
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (docError || !document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  const metadata = document.content as unknown as DocumentMetadata;

  const readable = new ReadableStream({
    async start(controller) {
      // Mark document as generating
      await supabase
        .from("documents")
        .update({ generation_status: "generating_outline" } as unknown as never)
        .eq("id", documentId);

      try {
        const prompt = buildOutlinePrompt(document.type, metadata);
        const anthropic = getAnthropic();

        const stream = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: AI_MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        });

        let fullText = "";

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullText += event.delta.text;
            send(controller, { type: "token", text: event.delta.text });
          }
        }

        // Parse the outline JSON
        const sections = parseOutlineJSON(fullText);

        // Delete any existing sections for this document
        await supabase.from("sections" as never).delete().eq("document_id", documentId);

        // Insert new sections
        const sectionRows: Omit<Section, "id" | "created_at" | "updated_at">[] = sections.map(
          (s) => ({
            document_id: documentId,
            user_id: user.id,
            position: s.position,
            title: s.title,
            content: "",
            section_type: s.section_type,
            description: s.description,
            word_count: 0,
            is_generated: false,
            generation_status: "pending" as const,
            ai_metadata: {},
          })
        );

        const { error: insertError } = await supabase
          .from("sections" as never)
          .insert(sectionRows as never);

        if (insertError) throw new Error("Failed to save outline");

        // Update document status
        await supabase
          .from("documents")
          .update({ generation_status: "outline_ready" } as unknown as never)
          .eq("id", documentId);

        // Deduct credits and log usage
        await deductCredits(supabase, user.id, "outline_generated", {
          document_id: documentId,
          section_count: sections.length,
        });

        send(controller, { type: "done", sections });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";

        await supabase
          .from("documents")
          .update({ generation_status: "failed" } as unknown as never)
          .eq("id", documentId);

        send(controller, { type: "error", message });
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
