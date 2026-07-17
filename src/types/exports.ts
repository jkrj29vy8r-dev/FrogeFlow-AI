import type { DocumentType } from "./database";

// ── Export status ─────────────────────────────────────────────────────────────

export type ExportStatus = "pending" | "generating" | "completed" | "failed";

export type PageSize = "a4" | "letter" | "a5";

export type PageOrientation = "portrait" | "landscape";

export type FontFamily =
  | "inter"
  | "georgia"
  | "merriweather"
  | "playfair"
  | "lato"
  | "opensans";

export type QualityPreset = "digital" | "print" | "compressed";

// ── Export settings ───────────────────────────────────────────────────────────

export interface ExportSettings {
  // Page layout
  pageSize: PageSize;
  orientation: PageOrientation;
  quality: QualityPreset;

  // Typography
  fontFamily: FontFamily;
  fontSize: number; // base font size in pt (10-14)

  // Branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  authorName: string;
  companyName: string;
  footerText: string;

  // Cover
  coverImageUrl: string | null;
  coverStyle: CoverStyle;

  // Features
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  includeHeaderFooter: boolean;
  includeWatermark: boolean;

  // Logo
  logoUrl: string | null;
}

export type CoverStyle =
  | "gradient"
  | "minimal"
  | "bold"
  | "elegant"
  | "modern";

// ── Branding preset ───────────────────────────────────────────────────────────

export interface BrandingPreset {
  id: string;
  name: string;
  settings: Partial<ExportSettings>;
  isDefault: boolean;
}

// ── Export job (DB row) ───────────────────────────────────────────────────────

export interface PdfExport {
  id: string;
  user_id: string;
  document_id: string;
  document_title: string;
  document_type: DocumentType;
  status: ExportStatus;
  settings: ExportSettings;
  file_name: string | null;
  error_message: string | null;
  download_count: number;
  page_count: number | null;
  file_size_bytes: number | null;
  created_at: string;
  completed_at: string | null;
}

// ── API payloads ──────────────────────────────────────────────────────────────

export interface GenerateExportRequest {
  documentId: string;
  settings: ExportSettings;
}

export interface GenerateExportResponse {
  exportId: string;
  error?: string;
}

export interface ExportStatusResponse {
  status: ExportStatus;
  progress: number; // 0–100
  error?: string;
  downloadUrl?: string;
  fileName?: string;
}

// ── Default settings ──────────────────────────────────────────────────────────

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  pageSize: "a4",
  orientation: "portrait",
  quality: "digital",
  fontFamily: "inter",
  fontSize: 11,
  primaryColor: "#6366f1",
  secondaryColor: "#4f46e5",
  accentColor: "#a5b4fc",
  authorName: "",
  companyName: "",
  footerText: "",
  coverImageUrl: null,
  coverStyle: "gradient",
  includeCoverPage: true,
  includeTableOfContents: true,
  includePageNumbers: true,
  includeHeaderFooter: true,
  includeWatermark: true,
  logoUrl: null,
};

export const FONT_LABELS: Record<FontFamily, string> = {
  inter: "Inter (Modern)",
  georgia: "Georgia (Classic)",
  merriweather: "Merriweather (Serif)",
  playfair: "Playfair Display (Elegant)",
  lato: "Lato (Clean)",
  opensans: "Open Sans (Friendly)",
};

export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  a4: "A4 (210×297mm)",
  letter: "US Letter (8.5×11in)",
  a5: "A5 (148×210mm)",
};

export const QUALITY_LABELS: Record<QualityPreset, string> = {
  digital: "Digital (Optimized for screen)",
  print: "Print (High quality)",
  compressed: "Compressed (Smaller file)",
};
