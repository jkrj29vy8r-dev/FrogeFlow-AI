import { createClient } from "@/lib/supabase/server";
import { getAnthropic, AI_MODEL } from "@/lib/ai/client";
import { buildRegenerateAssetPrompt } from "@/features/projects/lib/generation-prompts";
import type { AssetType, ProjectInput } from "@/types/projects";

export const runtime = "nodejs";
export const maxDuration = 120;

function stripFences(raw: string): string {
  return raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: projectId, assetId } = await params;

  // Verify ownership
  const { data: project } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: { input: ProjectInput; user_id: string } | null }> } } } }
  }).from("projects").select("input, user_id").eq("id", projectId).eq("user_id", user.id).single();

  if (!project) return Response.json({ error: "Not found" }, { status: 404 });

  const { data: asset } = await (supabase as never as {
    from: (t: string) => { select: (s: string) => { eq: (a: string, b: string) => { eq: (a: string, b: string) => { single: () => Promise<{ data: { asset_type: AssetType } | null }> } } } }
  }).from("project_assets").select("asset_type").eq("id", assetId).eq("project_id", projectId).single();

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

  try {
    const anthropic = getAnthropic();
    const msg = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: buildRegenerateAssetPrompt(project.input, asset.asset_type, instruction),
      }],
    });
    const block = msg.content[0];
    const rawText = block.type === "text" ? block.text : "";
    const parsed = JSON.parse(stripFences(rawText)) as Record<string, object>;
    const content = parsed[asset.asset_type] ?? parsed;

    await (supabase as never as {
      from: (t: string) => { update: (d: object) => { eq: (a: string, b: string) => Promise<unknown> } }
    }).from("project_assets").update({
      status: "completed",
      content,
      error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", assetId);

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
