import type { DocumentType, SectionType } from "@/types/database";

// ── Document metadata (stored in documents.content jsonb) ─────────────────────

export interface DocumentMetadata {
  title: string;
  description: string;
  audience: string;
  language: string;
  writing_style: WritingStyle;
  tone: Tone;
  knowledge_level: KnowledgeLevel;
  length: DocumentLength;
  goal: string;
  notes: string;
  // Legacy fields (kept for backwards compat)
  topic?: string;
}

export type WritingStyle =
  | "narrative"
  | "instructional"
  | "conversational"
  | "academic"
  | "journalistic";

export type Tone =
  | "professional"
  | "conversational"
  | "authoritative"
  | "motivational"
  | "friendly";

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type DocumentLength = "short" | "medium" | "long" | "comprehensive";

// ── Streaming event types ─────────────────────────────────────────────────────

export type OutlineStreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; sections: OutlineSection[] }
  | { type: "error"; message: string };

export type SectionStreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; wordCount: number }
  | { type: "error"; message: string };

// ── Outline section (parsed from AI response, before DB insert) ───────────────

export interface OutlineSection {
  position: number;
  title: string;
  section_type: SectionType;
  description: string;
}

// ── Product type configuration ────────────────────────────────────────────────

export interface ProductTypeConfig {
  type: DocumentType;
  label: string;
  description: string;
  defaultLength: DocumentLength;
  sectionTypes: SectionType[];
  wordCountPerSection: Record<DocumentLength, number>;
}

export const MVP_PRODUCT_TYPES: DocumentType[] = [
  "ebook",
  "pdf_guide",
  "checklist",
  "workbook",
];

export const PRODUCT_TYPE_CONFIGS: Record<string, ProductTypeConfig> = {
  ebook: {
    type: "ebook",
    label: "eBook",
    description: "A full-length digital book with chapters and rich content",
    defaultLength: "medium",
    sectionTypes: ["introduction", "chapter", "conclusion", "cta"],
    wordCountPerSection: { short: 400, medium: 700, long: 1200, comprehensive: 2000 },
  },
  pdf_guide: {
    type: "pdf_guide",
    label: "PDF Guide",
    description: "A practical step-by-step guide with actionable advice",
    defaultLength: "medium",
    sectionTypes: ["introduction", "chapter", "tips", "conclusion"],
    wordCountPerSection: { short: 300, medium: 500, long: 800, comprehensive: 1200 },
  },
  checklist: {
    type: "checklist",
    label: "Checklist",
    description: "A structured checklist with grouped action items",
    defaultLength: "short",
    sectionTypes: ["introduction", "checklist_group", "conclusion"],
    wordCountPerSection: { short: 150, medium: 250, long: 400, comprehensive: 600 },
  },
  workbook: {
    type: "workbook",
    label: "Workbook",
    description: "An interactive workbook with exercises and reflection prompts",
    defaultLength: "medium",
    sectionTypes: ["introduction", "exercise", "chapter", "conclusion"],
    wordCountPerSection: { short: 300, medium: 500, long: 800, comprehensive: 1200 },
  },
};
