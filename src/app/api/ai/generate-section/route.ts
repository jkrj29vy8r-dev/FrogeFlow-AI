import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL, AI_MAX_TOKENS } from "@/lib/ai/client";
import { buildSectionPrompt } from "@/lib/ai/prompts";
import type { DocumentMetadata, OutlineSection } from "@/features/documents/types";
import type { Section } from "@/types/database";
import { PRODUCT_TYPE_CONFIGS } from "@/features/documents/types";
import { sectionGenerationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import { markdownToHtml, stripLeadingDuplicateTitle } from "@/lib/markdown";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const requestSchema = z.object({
  sectionId: z.string().uuid(),
  documentId: z.string().uuid(),
});

const encoder = new TextEncoder();

function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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

  const { sectionId, documentId } = parsed.data;

  // Fetch document (verify ownership)
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (docError || !document) {
    return Response.json({ error: "Document not found" }, { status: 404 });
  }

  const rl = await sectionGenerationRateLimit(`section:${user.id}`);
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

  // Fetch target section
  const { data: section, error: sectionError } = await supabase
    .from("sections" as never)
    .select("*")
    .eq("id", sectionId)
    .eq("document_id", documentId)
    .single() as { data: Section | null; error: unknown };

  if (sectionError || !section) {
    return Response.json({ error: "Section not found" }, { status: 404 });
  }

  // Fetch all sections for context
  const { data: allSectionsRaw } = await supabase
    .from("sections" as never)
    .select("position, title, section_type, description")
    .eq("document_id", documentId)
    .order("position", { ascending: true }) as { data: Section[] | null; error: unknown };

  const allSections: OutlineSection[] = (allSectionsRaw ?? []).map((s) => ({
    position: s.position,
    title: s.title,
    section_type: s.section_type,
    description: s.description,
  }));

  const metadata = document.content as unknown as DocumentMetadata;
  const config = PRODUCT_TYPE_CONFIGS[document.type];
  const targetWordCount = config?.wordCountPerSection[metadata.length] ?? 600;

  const readable = new ReadableStream({
    async start(controller) {
      // Mark section as generating
      await supabase
        .from("sections" as never)
        .update({ generation_status: "generating" } as never)
        .eq("id", sectionId);

      try {
        const prompt = buildSectionPrompt(
          document.type,
          metadata,
          {
            position: section.position,
            title: section.title,
            section_type: section.section_type,
            description: section.description,
          },
          allSections,
          targetWordCount
        );

        const anthropic = getAnthropic();
        const stream = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: AI_MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        });

        let fullContent = "";

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            fullContent += event.delta.text;
            send(controller, { type: "token", text: event.delta.text });
          }
        }

        const wordCount = countWords(fullContent);
        const contentHtml = stripLeadingDuplicateTitle(
          markdownToHtml(fullContent),
          section.title
        );

        // Get current version number
        const { count: versionCount } = await supabase
          .from("section_versions" as never)
          .select("*", { count: "exact", head: true })
          .eq("section_id", sectionId) as { count: number | null; error: unknown };

        const nextVersion = (versionCount ?? 0) + 1;

        // Save new version
        await supabase.from("section_versions" as never).insert({
          section_id: sectionId,
          document_id: documentId,
          user_id: user.id,
          content: contentHtml,
          word_count: wordCount,
          version: nextVersion,
        } as never);

        // Prune old versions (keep last 20)
        if (nextVersion > 20) {
          const { data: oldVersions } = await supabase
            .from("section_versions" as never)
            .select("id")
            .eq("section_id", sectionId)
            .order("version", { ascending: true })
            .limit(nextVersion - 20) as { data: { id: string }[] | null; error: unknown };

          if (oldVersions && oldVersions.length > 0) {
            await supabase
              .from("section_versions" as never)
              .delete()
              .in("id", oldVersions.map((v) => v.id));
          }
        }

        // Update section content
        await supabase
          .from("sections" as never)
          .update({
            content: contentHtml,
            word_count: wordCount,
            is_generated: true,
            generation_status: "completed",
          } as never)
          .eq("id", sectionId);

        // Deduct credits and log usage
        await deductCredits(supabase, user.id, "section_generated", {
          document_id: documentId,
          section_id: sectionId,
          word_count: wordCount,
        });

        send(controller, { type: "done", wordCount });
      } catch (err) {
        console.error("[generate-section] failed:", err);
        const message = err instanceof Error ? err.message : "Generation failed";

        await supabase
          .from("sections" as never)
          .update({ generation_status: "failed" } as never)
          .eq("id", sectionId);

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
