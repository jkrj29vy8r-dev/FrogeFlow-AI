import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { buildRegenerateSectionPrompt } from "@/features/landing-pages/lib/prompts";
import type { LandingPage, LandingPageSection, LandingPageInput, SectionType } from "@/types/landing-pages";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  sectionId: z.string().uuid(),
  instruction: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: pageId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  const { sectionId, instruction } = parsed.data;

  // Verify page ownership
  const { data: page } = await supabase
    .from("landing_pages" as never)
    .select("*")
    .eq("id", pageId)
    .eq("user_id", user.id)
    .single() as { data: LandingPage | null; error: unknown };

  if (!page) return Response.json({ error: "Page not found" }, { status: 404 });

  // Fetch section
  const { data: section } = await supabase
    .from("landing_page_sections" as never)
    .select("*")
    .eq("id", sectionId)
    .eq("page_id", pageId)
    .eq("user_id", user.id)
    .single() as { data: LandingPageSection | null; error: unknown };

  if (!section) return Response.json({ error: "Section not found" }, { status: 404 });

  try {
    const prompt = buildRegenerateSectionPrompt(
      page.input as LandingPageInput,
      section.section_type as SectionType,
      section.content,
      instruction
    );

    const anthropic = getAnthropic();
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content.find(b => b.type === 'text')?.text ?? '{}';
    const clean = rawText.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const newContent = JSON.parse(clean) as Record<string, unknown>;

    await supabase
      .from("landing_page_sections" as never)
      .update({ content: newContent as never, updated_at: new Date().toISOString() } as never)
      .eq("id", sectionId)
      .eq("user_id", user.id);

    return Response.json({ content: newContent });
  } catch (err) {
    console.error("[landing-pages/section] failed:", err);
    const message = err instanceof Error ? err.message : "Regeneration failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
