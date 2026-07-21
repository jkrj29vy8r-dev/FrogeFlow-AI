import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { buildPhase1Prompt, buildEmailSequencePrompt } from "@/features/projects/lib/generation-prompts";
import type { ProjectInput, AssetType } from "@/types/projects";
import { generationRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { checkCredits, deductCredits } from "@/lib/credits";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 180;

const InputSchema = z.object({
  productIdea: z.string().min(10).max(2000),
  targetAudience: z.string().min(3).max(500),
  language: z.string().min(2).max(50).default("English"),
  tone: z.string().min(3).max(50),
  industry: z.string().min(2).max(100),
  goal: z.string().min(3).max(500),
  brandName: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#8b5cf6"),
  logoUrl: z.string().url().optional(),
});

const encoder = new TextEncoder();

function sse(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
}

function stripFences(raw: string): string {
  return raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
}

async function callClaude(prompt: string): Promise<string> {
  const anthropic = getAnthropic();
  const msg = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content[0];
  return block.type === "text" ? block.text : "";
}

type SupabaseInsert = {
  from: (t: string) => {
    insert: (d: object) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null; error: unknown }> } };
    update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> };
  };
};

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await generationRateLimit(`project:${user.id}`);
  if (!rl.success) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, {
      status: 429,
      headers: rateLimitHeaders(rl),
    });
  }

  const { ok: hasCredits } = await checkCredits(supabase, user.id, 5);
  if (!hasCredits) {
    return Response.json({ error: "Insufficient credits. Please upgrade your plan." }, { status: 402 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = InputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const input: ProjectInput = parsed.data;
  const db = supabase as unknown as SupabaseInsert;

  // Create project record
  const { data: project } = await db.from("projects").insert({
    user_id: user.id,
    name: input.brandName + " — " + input.productIdea.slice(0, 60),
    status: "generating",
    input,
    ai_usage: { inputTokens: 0, outputTokens: 0 },
    credits_used: 0,
  }).select("id").single();

  if (!project) return Response.json({ error: "Failed to create project" }, { status: 500 });

  const projectId = project.id;

  // Pre-create all asset rows as pending
  const PHASE1_ASSETS: AssetType[] = [
    "product_description", "seo_metadata", "ebook_outline", "workbook", "checklist",
    "lead_magnet", "social_media_pack", "ai_cover", "faq", "cta_pack", "download_page",
  ];
  const EMAIL_ASSET: AssetType = "email_sequence";
  const PAGE_ASSETS: AssetType[] = ["landing_page", "sales_page"];

  const allAssets: AssetType[] = [...PHASE1_ASSETS, EMAIL_ASSET, ...PAGE_ASSETS];

  const assetNames: Record<AssetType, string> = {
    product_description: "Product Description",
    seo_metadata: "SEO Metadata",
    ebook_outline: "eBook Outline",
    workbook: "Workbook",
    checklist: "Checklist",
    lead_magnet: "Lead Magnet",
    social_media_pack: "Social Media Pack",
    ai_cover: "AI Cover Design",
    faq: "FAQ Document",
    cta_pack: "Call To Actions",
    download_page: "Download Page",
    email_sequence: "Email Sequence",
    landing_page: "Landing Page",
    sales_page: "Sales Page",
  };

  // Insert all assets as pending
  for (const assetType of allAssets) {
    await (supabase as never as {
      from: (t: string) => { insert: (d: object) => Promise<unknown> }
    }).from("project_assets").insert({
      project_id: projectId,
      user_id: user.id,
      asset_type: assetType,
      name: assetNames[assetType],
      status: "pending",
      content: null,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        sse(controller, { type: "started", projectId });

        // Fetch asset IDs
        const { data: assetRows } = await (supabase as never as {
          from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => Promise<{ data: Array<{ id: string; asset_type: string }> | null }> } }
        }).from("project_assets").select("id, asset_type").eq("project_id", projectId);

        const assetIdMap: Partial<Record<AssetType, string>> = {};
        for (const row of assetRows ?? []) {
          assetIdMap[row.asset_type as AssetType] = row.id;
        }

        async function markAsset(assetType: AssetType, status: string, content?: object, error?: string) {
          const assetId = assetIdMap[assetType];
          if (!assetId) return;
          await (supabase as never as {
            from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
          }).from("project_assets").update({
            status,
            content: content ?? null,
            error: error ?? null,
            updated_at: new Date().toISOString(),
          }).eq("id", assetId);
          sse(controller, { type: "asset_update", assetType, status, assetId });
        }

        // Phase 1 + Phase 2 in parallel
        sse(controller, { type: "progress", message: "Generating core content and email sequence..." });

        for (const assetType of PHASE1_ASSETS) {
          await markAsset(assetType, "generating");
        }
        await markAsset(EMAIL_ASSET, "generating");

        const [phase1Raw, emailRaw] = await Promise.all([
          callClaude(buildPhase1Prompt(input)),
          callClaude(buildEmailSequencePrompt(input)),
        ]);

        // Parse phase 1
        try {
          const phase1Data = JSON.parse(stripFences(phase1Raw)) as Record<string, object>;
          for (const assetType of PHASE1_ASSETS) {
            if (phase1Data[assetType]) {
              await markAsset(assetType, "completed", phase1Data[assetType]);
            } else {
              await markAsset(assetType, "failed", undefined, "Missing from AI response");
            }
          }
        } catch {
          for (const assetType of PHASE1_ASSETS) {
            await markAsset(assetType, "failed", undefined, "Failed to parse AI response");
          }
        }

        // Parse email sequence
        try {
          const emailData = JSON.parse(stripFences(emailRaw)) as Record<string, object>;
          if (emailData.email_sequence) {
            await markAsset(EMAIL_ASSET, "completed", emailData.email_sequence);
          } else {
            await markAsset(EMAIL_ASSET, "failed", undefined, "Missing from AI response");
          }
        } catch {
          await markAsset(EMAIL_ASSET, "failed", undefined, "Failed to parse AI response");
        }

        // Phase 3: create landing pages via landing_pages table
        sse(controller, { type: "progress", message: "Creating landing and sales pages..." });

        for (const pageAsset of PAGE_ASSETS) {
          await markAsset(pageAsset, "generating");
          try {
            const pageType = pageAsset === "landing_page" ? "landing" : "sales";
            const { data: lp } = await (supabase as never as {
              from: (t: string) => { insert: (d: object) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null }> } } }
            }).from("landing_pages").insert({
              user_id: user.id,
              name: `${input.brandName} — ${pageType === "landing" ? "Landing" : "Sales"} Page`,
              page_type: pageType,
              status: "draft",
              input: {
                pageType,
                productName: input.brandName,
                description: input.productIdea,
                targetAudience: input.targetAudience,
                industry: input.industry,
                tone: input.tone,
                framework: "AIDA",
                primaryColor: input.primaryColor,
                secondaryColor: input.secondaryColor,
                cta: "Get Started Now",
              },
              settings: { primaryColor: input.primaryColor, secondaryColor: input.secondaryColor },
            }).select("id").single();

            if (lp?.id) {
              const assetId = assetIdMap[pageAsset];
              if (assetId) {
                await (supabase as never as {
                  from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
                }).from("project_assets").update({
                  status: "completed",
                  landing_page_id: lp.id,
                  content: { landing_page_id: lp.id },
                  updated_at: new Date().toISOString(),
                }).eq("id", assetId);
                sse(controller, { type: "asset_update", assetType: pageAsset, status: "completed", assetId, landingPageId: lp.id });
              }
            } else {
              await markAsset(pageAsset, "failed", undefined, "Failed to create page");
            }
          } catch {
            await markAsset(pageAsset, "failed", undefined, "Unexpected error");
          }
        }

        // Mark project complete
        await (supabase as never as {
          from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
        }).from("projects").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", projectId);

        await deductCredits(supabase, user.id, "project_generated", { project_id: projectId });
        sse(controller, { type: "done", projectId });
      } catch (err) {
        console.error("[projects/generate] failed:", err);
        sse(controller, { type: "error", message: err instanceof Error ? err.message : "Unknown error" });
        await (supabase as never as {
          from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
        }).from("projects").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", projectId);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
