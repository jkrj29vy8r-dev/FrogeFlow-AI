import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generatePdf } from "@/features/exports/pdf/pdf-generator";
import { createExportRecord, updateExportStatus } from "@/features/exports/actions/exports.actions";
import type { Section, DocumentWithGeneration } from "@/types/database";
import type { ExportSettings } from "@/types/exports";
import { DEFAULT_EXPORT_SETTINGS } from "@/types/exports";

const ExportSettingsSchema = z.object({
  pageSize: z.enum(["a4", "letter", "a5"]).default("a4"),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  quality: z.enum(["digital", "print", "compressed"]).default("digital"),
  fontFamily: z.enum(["inter", "georgia", "merriweather", "playfair", "lato", "opensans"]).default("inter"),
  fontSize: z.number().min(8).max(16).default(11),
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i).default("#6366f1"),
  secondaryColor: z.string().regex(/^#[0-9a-f]{6}$/i).default("#4f46e5"),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i).default("#a5b4fc"),
  authorName: z.string().max(100).default(""),
  companyName: z.string().max(100).default(""),
  footerText: z.string().max(200).default(""),
  coverImageUrl: z.string().url().nullable().default(null),
  coverStyle: z.enum(["gradient", "minimal", "bold", "elegant", "modern"]).default("gradient"),
  includeCoverPage: z.boolean().default(true),
  includeTableOfContents: z.boolean().default(true),
  includePageNumbers: z.boolean().default(true),
  includeHeaderFooter: z.boolean().default(true),
  includeWatermark: z.boolean().default(true),
  logoUrl: z.string().url().nullable().default(null),
});

const RequestSchema = z.object({
  documentId: z.string().uuid(),
  settings: ExportSettingsSchema.optional(),
});

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { documentId, settings: rawSettings } = parsed.data;
  const settings: ExportSettings = { ...DEFAULT_EXPORT_SETTINGS, ...(rawSettings ?? {}) };

  // Fetch document (ownership check)
  const { data: docRaw } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("user_id", user.id)
    .single();

  if (!docRaw) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  const doc = docRaw as unknown as DocumentWithGeneration;

  // Fetch sections
  const { data: sectionsRaw } = await supabase
    .from("sections" as never)
    .select("*")
    .eq("document_id", documentId)
    .eq("user_id", user.id)
    .order("position", { ascending: true }) as { data: Section[] | null; error: unknown };

  const sections: Section[] = sectionsRaw ?? [];

  if (sections.length === 0) {
    return NextResponse.json({ error: "No sections to export" }, { status: 400 });
  }

  // Create export record
  const { exportId, error: createError } = await createExportRecord(
    documentId,
    doc.title,
    doc.type,
    settings
  );
  if (createError || !exportId) {
    return NextResponse.json({ error: "Failed to create export record" }, { status: 500 });
  }

  // Update to generating
  await updateExportStatus(exportId, "generating");

  // Generate PDF
  try {
    const result = await generatePdf({
      title: doc.title,
      subtitle: (doc.ai_metadata?.subtitle as string | undefined) ?? "",
      sections,
      settings,
    });

    // Update record as completed
    await updateExportStatus(exportId, "completed", {
      fileSizeBytes: result.fileSizeBytes,
      pageCount: result.pageCount,
    });

    // Stream PDF directly back
    return new Response(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
        "Content-Length": result.fileSizeBytes.toString(),
        "X-Export-Id": exportId,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    await updateExportStatus(exportId, "failed", { errorMessage: message });
    return NextResponse.json({ error: message, exportId }, { status: 500 });
  }
}
