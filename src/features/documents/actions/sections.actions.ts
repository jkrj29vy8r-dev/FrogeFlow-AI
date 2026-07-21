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

// ── Deduct credits for content generation ─────────────────────────────────────

export async function deductGenerationCredit(
  documentId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.credits < 1) return { error: "Insufficient credits" };

  const { error: deductError } = await supabase
    .from("profiles")
    .update({ credits: profile.credits - 1 })
    .eq("id", user.id);

  if (deductError) return { error: "Failed to deduct credit" };

  await supabase.from("usage_events").insert({
    user_id: user.id,
    document_id: documentId,
    event_type: "section_generated",
    credits_used: 1,
    metadata: { action: "full_content_generation" },
  });

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
