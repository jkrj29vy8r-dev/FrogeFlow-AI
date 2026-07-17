import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { buildLandingPagePrompt } from "@/features/landing-pages/lib/prompts";
import type { LandingPageInput, LandingPageSeo } from "@/types/landing-pages";
import { DEFAULT_SECTIONS_BY_TYPE } from "@/types/landing-pages";
import { generationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const InputSchema = z.object({
  pageType: z.enum(['landing', 'sales', 'lead_magnet', 'thank_you', 'coming_soon']),
  productName: z.string().min(1).max(120),
  description: z.string().min(10).max(2000),
  targetAudience: z.string().min(1).max(500),
  industry: z.string().min(1).max(100),
  tone: z.enum(['professional', 'friendly', 'bold', 'empathetic', 'urgent', 'inspirational', 'conversational']),
  framework: z.enum(['AIDA', 'PAS', 'BAB', 'StoryBrand']),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#8b5cf6'),
  logoUrl: z.string().url().optional(),
  cta: z.string().min(1).max(80),
  testimonials: z.string().max(3000).optional(),
  faqs: z.string().max(3000).optional(),
});

const encoder = new TextEncoder();

function sse(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await generationRateLimit(`landing-page:${user.id}`);
  if (!rl.success) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: rateLimitHeaders(rl),
    });
  }

  const { ok: hasCredits } = await checkCredits(supabase, user.id, 2);
  if (!hasCredits) {
    return Response.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const input: LandingPageInput = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        sse(controller, { type: "progress", message: "Creating your landing page…" });

        // Create the landing page record
        const { data: page, error: pageError } = await supabase
          .from("landing_pages" as never)
          .insert({
            user_id: user.id,
            name: input.productName,
            page_type: input.pageType,
            status: 'draft',
            input,
            seo: {} as never,
            settings: {
              primaryColor: input.primaryColor,
              secondaryColor: input.secondaryColor,
              logoUrl: input.logoUrl,
              fontFamily: 'system-ui',
            },
          } as never)
          .select()
          .single() as { data: { id: string } | null; error: unknown };

        if (pageError || !page) {
          sse(controller, { type: "error", message: "Failed to create page" });
          controller.close();
          return;
        }

        const pageId = page.id;
        sse(controller, { type: "progress", message: "Generating compelling copy with AI…" });

        // Generate content with Claude
        const prompt = buildLandingPagePrompt(input);
        const anthropic = getAnthropic();

        let rawJson = "";
        const aiStream = anthropic.messages.stream({
          model: AI_MODEL,
          max_tokens: 8192,
          messages: [{ role: "user", content: prompt }],
        });

        sse(controller, { type: "progress", message: "Writing your sections…" });

        for await (const event of aiStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            rawJson += event.delta.text;
          }
        }

        sse(controller, { type: "progress", message: "Saving your content…" });

        // Parse the response
        let parsed_: { seo?: LandingPageSeo; sections?: { section_type: string; content: Record<string, unknown> }[] };
        try {
          // Strip any accidental markdown fences
          const clean = rawJson.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
          parsed_ = JSON.parse(clean) as typeof parsed_;
        } catch {
          sse(controller, { type: "error", message: "Failed to parse AI response. Please try again." });
          await supabase.from("landing_pages" as never).delete().eq("id", pageId);
          controller.close();
          return;
        }

        // Update SEO
        if (parsed_.seo) {
          await supabase
            .from("landing_pages" as never)
            .update({ seo: parsed_.seo as never, updated_at: new Date().toISOString() } as never)
            .eq("id", pageId);
        }

        // Save sections
        const expectedSections = DEFAULT_SECTIONS_BY_TYPE[input.pageType];
        const generatedSections = parsed_.sections ?? [];

        const sectionInserts = expectedSections
          .map((sectionType, position) => {
            const found = generatedSections.find(s => s.section_type === sectionType);
            return {
              page_id: pageId,
              user_id: user.id,
              section_type: sectionType,
              position,
              is_visible: true,
              content: found?.content ?? {},
            };
          });

        await supabase
          .from("landing_page_sections" as never)
          .insert(sectionInserts as never);

        await deductCredits(supabase, user.id, "landing_page_generated", { page_id: pageId });
        sse(controller, { type: "done", pageId });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        sse(controller, { type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
