import { createClient } from "@/lib/supabase/server";
import { generateJsonText, extractJsonObject } from "@/lib/ai/generate-json";
import { buildRegenerateAssetPrompt } from "@/features/projects/lib/generation-prompts";
import { buildLandingPagePrompt } from "@/features/landing-pages/lib/prompts";
import { DEFAULT_SECTIONS_BY_TYPE } from "@/types/landing-pages";
import type { LandingPageInput, LandingPageType } from "@/types/landing-pages";
import { generationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import type { AssetType, ProjectInput } from "@/types/projects";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await generationRateLimit(`asset-regen:${user.id}`);
  if (!rl.success) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const { ok: hasCredits } = await checkCredits(supabase, user.id, 1);
  if (!hasCredits) {
    return Response.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  const { id: projectId, assetId } = await params;

  // Verify ownership
  const { data: project } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: { input: ProjectInput; user_id: string } | null }> } } } }
  }).from("projects").select("input, user_id").eq("id", projectId).eq("user_id", user.id).single();

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const { data: asset } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: { asset_type: AssetType; landing_page_id: string | null } | null }> } } } }
  }).from("project_assets").select("asset_type, landing_page_id").eq("id", assetId).eq("project_id", projectId).single();

  if (!asset) return Response.json({ error: "Asset not found" }, { status: 404 });

  let instruction: string | undefined;
  try {
    const body = await request.json() as { instruction?: string };
    instruction = body.instruction;
  } catch { /* optional */ }

  // Mark as generating
  await (supabase as never as {
    from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
  }).from("project_assets").update({ status: "generating", updated_at: new Date().toISOString() }).eq("id", assetId);

  // Landing/sales pages don't store their content on the asset — they live in
  // the landing_pages table with their own sections. Regenerate the sections
  // there instead of overwriting the asset (which would break the page link).
  if (asset.asset_type === "landing_page" || asset.asset_type === "sales_page") {
    try {
      const content = await regeneratePageSections(supabase, user.id, asset.landing_page_id, asset.asset_type);
      await (supabase as never as {
        from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
      }).from("project_assets").update({
        status: "completed",
        content,
        error: null,
        updated_at: new Date().toISOString(),
      }).eq("id", assetId);
      await deductCredits(supabase, user.id, "asset_regenerated", { project_id: projectId, asset_id: assetId });
      return Response.json({ content });
    } catch (err) {
      console.error("[projects/assets] page regeneration failed:", err);
      await (supabase as never as {
        from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
      }).from("project_assets").update({
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
        updated_at: new Date().toISOString(),
      }).eq("id", assetId);
      return Response.json({ error: "Regeneration failed" }, { status: 500 });
    }
  }

  try {
    const rawText = await generateJsonText(
      buildRegenerateAssetPrompt(project.input, asset.asset_type, instruction),
      16000
    );
    const parsed = JSON.parse(extractJsonObject(rawText)) as Record<string, object>;
    const content = parsed[asset.asset_type] ?? parsed;

    await (supabase as never as {
      from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
    }).from("project_assets").update({
      status: "completed",
      content,
      error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", assetId);

    await deductCredits(supabase, user.id, "asset_regenerated", {
      project_id: projectId,
      asset_id: assetId,
    });

    return Response.json({ content });
  } catch (err) {
    console.error("[projects/assets] regeneration failed:", err);
    await (supabase as never as {
      from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
    }).from("project_assets").update({
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
      updated_at: new Date().toISOString(),
    }).eq("id", assetId);

    return Response.json({ error: "Regeneration failed" }, { status: 500 });
  }
}

// Regenerates the sections of a landing/sales page and rewrites them in the
// landing_page_sections table. Returns the asset content ({ landing_page_id }).
async function regeneratePageSections(
  supabase: unknown,
  userId: string,
  landingPageId: string | null,
  assetType: "landing_page" | "sales_page"
): Promise<{ landing_page_id: string }> {
  if (!landingPageId) throw new Error("Missing landing_page_id");

  const { data: page } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: { input: LandingPageInput } | null }> } } }
  }).from("landing_pages").select("input").eq("id", landingPageId).single();

  const pageType: LandingPageType = assetType === "landing_page" ? "landing" : "sales";
  const lpInput = { ...(page?.input ?? {}), pageType } as LandingPageInput;

  const raw = await generateJsonText(buildLandingPagePrompt(lpInput));
  const parsedPage = JSON.parse(extractJsonObject(raw)) as {
    seo?: Record<string, unknown>;
    sections?: { section_type: string; content: Record<string, unknown> }[];
  };
  const generatedSections = parsedPage.sections ?? [];

  const expectedSections = DEFAULT_SECTIONS_BY_TYPE[pageType];
  const sectionInserts = expectedSections.map((sectionType, position) => {
    const found = generatedSections.find((s) => s.section_type === sectionType);
    return {
      page_id: landingPageId,
      user_id: userId,
      section_type: sectionType,
      position,
      is_visible: true,
      content: found?.content ?? {},
    };
  });

  // Replace any existing sections so a regenerate doesn't stack duplicates.
  await (supabase as never as {
    from: (t: string) => { delete: () => { eq: (a: string, b: string) => Promise<unknown> } }
  }).from("landing_page_sections").delete().eq("page_id", landingPageId);

  await (supabase as never as {
    from: (t: string) => { insert: (d: object) => Promise<unknown> }
  }).from("landing_page_sections").insert(sectionInserts);

  if (parsedPage.seo) {
    await (supabase as never as {
      from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
    }).from("landing_pages").update({ seo: parsedPage.seo, updated_at: new Date().toISOString() }).eq("id", landingPageId);
  }

  return { landing_page_id: landingPageId };
}
