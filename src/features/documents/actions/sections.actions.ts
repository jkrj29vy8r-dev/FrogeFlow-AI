"use server";

import { createClient } from "@/lib/supabase/server";
import type { Section, SectionVersion } from "@/types/database";

function countWords(text: string): number {
  const stripped = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return stripped ? stripped.split(" ").filter(Boolean).length : 0;
}

// ── Update section title ──────────────────────────────────────────────────────

export async function updateSectionTitle(
  sectionId: string,
  title: string
): Promise<{ error?: string }> {
  if (!title.trim()) return { error: "Title cannot be empty" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("sections" as never)
    .update({ title: title.trim() } as never)
    .eq("id", sectionId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update title" };
  return {};
}

// ── Autosave section content ──────────────────────────────────────────────────

export async function saveSectionContent(
  sectionId: string,
  documentId: string,
  content: string
): Promise<{ error?: string; wordCount?: number }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const wordCount = countWords(content);

  // Update section — select the updated row back so we can tell a genuine
  // failure apart from "matched zero rows" (e.g. sectionId belongs to
  // another user), which Supabase does not treat as an error.
  const { data: updated, error: updateError } = await supabase
    .from("sections" as never)
    .update({ content, word_count: wordCount } as never)
    .eq("id", sectionId)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (updateError || !updated) return { error: "Failed to save" };

  // Get next version number
  const { count: versionCount } = await supabase
    .from("section_versions" as never)
    .select("*", { count: "exact", head: true })
    .eq("section_id", sectionId) as { count: number | null; error: unknown };

  const nextVersion = (versionCount ?? 0) + 1;

  // Create version snapshot
  await supabase.from("section_versions" as never).insert({
    section_id: sectionId,
    document_id: documentId,
    user_id: user.id,
    content,
    word_count: wordCount,
    version: nextVersion,
  } as never);

  // Prune old versions
  if (nextVersion > 20) {
    const { data: old } = await supabase
      .from("section_versions" as never)
      .select("id")
      .eq("section_id", sectionId)
      .order("version", { ascending: true })
      .limit(nextVersion - 20) as { data: { id: string }[] | null; error: unknown };

    if (old && old.length > 0) {
      await supabase
        .from("section_versions" as never)
        .delete()
        .in("id", old.map((v) => v.id));
    }
  }

  return { wordCount };
}

// ── Update document generation status ─────────────────────────────────────────

export async function updateDocumentStatus(
  documentId: string,
  status: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("documents")
    .update({ generation_status: status } as unknown as never)
    .eq("id", documentId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update status" };
  return {};
}

// ── Check credits before starting bulk content generation ─────────────────────
//
// This used to also deduct 1 flat credit here on top of the per-section
// credit charged by /api/ai/generate-section for every section it writes —
// double-billing a single content-generation run (e.g. a 5-section eBook
// actually cost 1 outline + 1 flat + 5 per-section = 7 credits, more than
// the entire Free plan's starting balance). Each section's own request
// already checks and deducts its own credit, so this is now a read-only
// upfront check so the UI can fail fast with a clear message instead of
// silently failing section-by-section once credits run out mid-run.
export async function deductGenerationCredit(
  _documentId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Unauthorized" };
  if (profile.plan === "pro" || profile.plan === "agency") return {};
  if ((profile.credits as number) < 1) return { error: "Insufficient credits" };

  return {};
}

// ── Reorder sections ──────────────────────────────────────────────────────────

export async function reorderSections(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("sections" as never)
      .update({ position: index } as never)
      .eq("id", id)
      .eq("user_id", user.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => (r as { error: unknown }).error);
  if (failed) return { error: "Failed to reorder sections" };
  return {};
}

// ── Get sections for a document ───────────────────────────────────────────────

export async function getDocumentSections(
  documentId: string
): Promise<{ sections?: Section[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("sections" as never)
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", user.id)
    .order("position", { ascending: true }) as { data: Section[] | null; error: unknown };

  if (error) return { error: "Failed to fetch sections" };
  return { sections: data ?? [] };
}

// ── Get version history for a section ────────────────────────────────────────

export async function getSectionVersions(
  sectionId: string
): Promise<{ versions?: SectionVersion[]; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("section_versions" as never)
    .select("*")
    .eq("section_id", sectionId)
    .eq("user_id", user.id)
    .order("version", { ascending: false })
    .limit(20) as { data: SectionVersion[] | null; error: unknown };

  if (error) return { error: "Failed to fetch versions" };
  return { versions: data ?? [] };
}

// ── Restore a specific version ────────────────────────────────────────────────

export async function restoreSectionVersion(
  sectionId: string,
  documentId: string,
  versionId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: version } = await supabase
    .from("section_versions" as never)
    .select("content, word_count")
    .eq("id", versionId)
    .eq("user_id", user.id)
    .single() as { data: { content: string; word_count: number } | null; error: unknown };

  if (!version) return { error: "Version not found" };

  return saveSectionContent(sectionId, documentId, version.content);
}
