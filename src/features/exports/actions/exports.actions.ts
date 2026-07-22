"use server";

import { createClient } from "@/lib/supabase/server";
import type { PdfExport, ExportSettings, ExportStatus } from "@/types/exports";

// ── Create export record ──────────────────────────────────────────────────────

export async function createExportRecord(
  documentId: string,
  documentTitle: string,
  documentType: string,
  settings: ExportSettings
): Promise<{ exportId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("pdf_exports" as never)
    .insert({
      user_id: user.id,
      document_id: documentId,
      document_title: documentTitle,
      document_type: documentType,
      status: "pending",
      settings: settings as never,
      download_count: 0,
    } as never)
    .select("id")
    .single() as { data: { id: string } | null; error: { message?: string; code?: string } | null };

  if (error || !data) {
    console.error("[createExportRecord] insert failed:", error);
    return { error: "Failed to create export record" };
  }
  return { exportId: data.id };
}

// ── Update export status ──────────────────────────────────────────────────────

export async function updateExportStatus(
  exportId: string,
  status: ExportStatus,
  extras?: {
    fileSizeBytes?: number;
    pageCount?: number;
    errorMessage?: string;
  }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const update: Record<string, unknown> = { status };
  if (status === "completed") update.completed_at = new Date().toISOString();
  if (extras?.fileSizeBytes) update.file_size_bytes = extras.fileSizeBytes;
  if (extras?.pageCount) update.page_count = extras.pageCount;
  if (extras?.errorMessage) update.error_message = extras.errorMessage;

  await supabase
    .from("pdf_exports" as never)
    .update(update as never)
    .eq("id", exportId)
    .eq("user_id", user.id);

  return {};
}

// ── Increment download count ──────────────────────────────────────────────────

export async function incrementDownloadCount(
  exportId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("pdf_exports" as never)
    .select("download_count")
    .eq("id", exportId)
    .eq("user_id", user.id)
    .single() as { data: { download_count: number } | null; error: unknown };

  if (!existing) return;

  await supabase
    .from("pdf_exports" as never)
    .update({ download_count: existing.download_count + 1 } as never)
    .eq("id", exportId)
    .eq("user_id", user.id);
}

// ── Get export history ────────────────────────────────────────────────────────

export async function getExportHistory(): Promise<{
  exports?: PdfExport[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("pdf_exports" as never)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50) as { data: PdfExport[] | null; error: unknown };

  if (error) return { error: "Failed to fetch exports" };
  return { exports: data ?? [] };
}

// ── Get export stats ──────────────────────────────────────────────────────────

export async function getExportStats(): Promise<{
  totalExports: number;
  totalDownloads: number;
  totalBytes: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { totalExports: 0, totalDownloads: 0, totalBytes: 0 };

  const { data } = await supabase
    .from("pdf_exports" as never)
    .select("download_count, file_size_bytes")
    .eq("user_id", user.id)
    .eq("status", "completed") as {
    data: { download_count: number; file_size_bytes: number | null }[] | null;
    error: unknown;
  };

  const rows = data ?? [];
  return {
    totalExports: rows.length,
    totalDownloads: rows.reduce((s, r) => s + (r.download_count ?? 0), 0),
    totalBytes: rows.reduce((s, r) => s + (r.file_size_bytes ?? 0), 0),
  };
}

// ── Get single export ─────────────────────────────────────────────────────────

export async function getExport(
  exportId: string
): Promise<{ export?: PdfExport; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("pdf_exports" as never)
    .select("*")
    .eq("id", exportId)
    .eq("user_id", user.id)
    .single() as { data: PdfExport | null; error: unknown };

  if (error || !data) return { error: "Export not found" };
  return { export: data };
}

// ── Delete export ─────────────────────────────────────────────────────────────

export async function deleteExport(
  exportId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("pdf_exports" as never)
    .delete()
    .eq("id", exportId)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete export" };
  return {};
}
