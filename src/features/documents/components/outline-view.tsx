"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RotateCcw,
  Check,
  Edit2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeneration } from "@/features/documents/hooks/use-generation";
import { updateSectionTitle } from "@/features/documents/actions/sections.actions";
import {
  OutlineGenerating,
  ContentGenerating,
  GenerationError,
} from "./generation-progress";
import type { Section, DocumentWithGeneration } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  ebook: "eBook",
  pdf_guide: "PDF Guide",
  workbook: "Workbook",
  checklist: "Checklist",
  lead_magnet: "Lead Magnet",
  landing_page: "Landing Page",
  sales_page: "Sales Page",
  product_description: "Product Description",
  marketing_content: "Marketing Content",
  social_post: "Social Post",
  email_campaign: "Email Campaign",
};

interface OutlineViewProps {
  document: DocumentWithGeneration;
  initialSections: Section[];
}

interface EditableTitleProps {
  section: Section;
  onSave: (id: string, title: string) => void;
}

function EditableTitle({ section, onSave }: EditableTitleProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(section.title);

  function commit() {
    const trimmed = value.trim();
    if (trimmed && trimmed !== section.title) {
      onSave(section.id, trimmed);
    } else {
      setValue(section.title);
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setValue(section.title);
            setEditing(false);
          }
        }}
        className="w-full rounded border border-[hsl(var(--ring))] bg-transparent px-1 py-0.5 text-sm font-medium text-[hsl(var(--foreground))] focus:outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      className="group/title flex items-center gap-1.5 text-left"
      onClick={() => setEditing(true)}
    >
      <span className="text-sm font-medium text-[hsl(var(--foreground))]">
        {section.title}
      </span>
      <Edit2 className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover/title:opacity-100" />
    </button>
  );
}

export function OutlineView({ document, initialSections }: OutlineViewProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);

  const initialPhase = (() => {
    const s = document.generation_status;
    // Self-heal: if sections already exist, always show them — regardless of
    // a stale "pending"/"generating_outline"/"failed" status left behind by
    // an interrupted generation (e.g. a serverless function timeout that
    // never got to update the document's status).
    if (initialSections.length > 0 && s !== "generating_content" && s !== "completed") {
      return "outline_ready" as const;
    }
    if (s === "pending" || s === "generating_outline") return "idle" as const;
    if (s === "outline_ready") return "outline_ready" as const;
    if (s === "generating_content") return "generating_content" as const;
    if (s === "completed") return "completed" as const;
    if (s === "failed") return "failed" as const;
    if (s === "cancelled") return "cancelled" as const;
    return "idle" as const;
  })();

  const handleOutlineComplete = useCallback((newSections: Section[]) => {
    setSections(newSections);
  }, []);

  const handleContentComplete = useCallback(() => {
    router.push(`/dashboard/documents/${document.id}/editor`);
  }, [document.id, router]);

  const {
    phase,
    outlineText,
    sectionProgress,
    currentSectionIndex,
    error,
    generateOutline,
    generateContent,
    cancel,
    retry,
  } = useGeneration(
    document.id,
    initialPhase,
    handleOutlineComplete,
    handleContentComplete
  );

  // Auto-start outline if document is pending
  useEffect(() => {
    if (
      (document.generation_status === "pending" ||
        document.generation_status === "generating_outline") &&
      initialSections.length === 0
    ) {
      void generateOutline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTitleSave(sectionId: string, title: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
    await updateSectionTitle(sectionId, title);
  }

  async function handleGenerateContent() {
    const sectionsToGenerate = sections.length > 0 ? sections : [];
    if (sectionsToGenerate.length === 0) return;
    await generateContent(sectionsToGenerate);
  }

  const displaySections = sections;
  const hasSections = displaySections.length > 0;
  const showOutline = phase === "outline_ready" || phase === "completed";

  const anyStateMatched =
    phase === "generating_outline" ||
    (phase === "generating_content" && sectionProgress.length > 0) ||
    (phase === "failed" && !!error) ||
    phase === "cancelled" ||
    (phase === "idle" && !hasSections) ||
    (showOutline && hasSections) ||
    phase === "completed";

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
              {TYPE_LABELS[document.type] ?? document.type}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            {document.title}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Review and edit your outline before generating content
          </p>
        </div>
      </div>

      {/* ── States ─────────────────────────────────────────── */}

      {/* Generating outline */}
      {phase === "generating_outline" && (
        <OutlineGenerating text={outlineText} onCancel={cancel} />
      )}

      {/* Generating content */}
      {phase === "generating_content" && sectionProgress.length > 0 && (
        <ContentGenerating
          progress={sectionProgress}
          currentIndex={currentSectionIndex}
          onCancel={cancel}
        />
      )}

      {/* Error */}
      {phase === "failed" && error && (
        <GenerationError message={error} onRetry={retry} />
      )}

      {/* Cancelled */}
      {phase === "cancelled" && (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <AlertCircle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Generation cancelled.
          </p>
          <Button onClick={() => void generateOutline()}>Regenerate outline</Button>
        </div>
      )}

      {/* No sections yet — idle but not generating */}
      {phase === "idle" && !hasSections && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <Sparkles className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Ready to generate your outline
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              The AI will design a structured outline based on your brief
            </p>
          </div>
          <Button onClick={() => void generateOutline()}>
            <Sparkles className="h-4 w-4" />
            Generate outline
          </Button>
        </div>
      )}

      {/* Outline ready / sections */}
      {showOutline && hasSections && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              {displaySections.length} sections
            </p>
            <button
              type="button"
              onClick={() => void generateOutline()}
              className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </button>
          </div>

          <div className="space-y-2">
            {displaySections.map((section, i) => (
              <div
                key={section.id}
                className="group flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-shadow hover:shadow-sm"
              >
                {/* Number badge */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-[10px] font-semibold text-[hsl(var(--primary))]">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <EditableTitle section={section} onSave={handleTitleSave} />
                  {section.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[hsl(var(--muted-foreground))]">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Section type chip */}
                <span className="shrink-0 rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] capitalize text-[hsl(var(--muted-foreground))]">
                  {section.section_type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => void generateOutline()}
            >
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => void handleGenerateContent()}
            >
              <Check className="h-4 w-4" />
              Approve &amp; generate content
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Tip: click any section title to rename it before generating
          </p>
        </>
      )}

      {/* Completed — show link to editor */}
      {phase === "completed" && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            Content generated successfully!
          </p>
          <Button
            className="mt-4 gap-2"
            onClick={() =>
              router.push(`/dashboard/documents/${document.id}/editor`)
            }
          >
            Open editor
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Safety net — should never happen, but never show a blank page */}
      {!anyStateMatched && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <AlertCircle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">
              Generation seems to have stalled
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              This can happen if a previous attempt was interrupted. Try generating again.
            </p>
          </div>
          <Button onClick={() => void generateOutline()}>
            <Sparkles className="h-4 w-4" />
            Generate outline
          </Button>
        </div>
      )}
    </div>
  );
}
