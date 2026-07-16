"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  Download,
  Check,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./section-editor";
import type { Section, DocumentWithGeneration } from "@/types/database";
import type { SectionStreamEvent } from "@/features/documents/types";
import { updateDocumentStatus, deductGenerationCredit } from "@/features/documents/actions/sections.actions";

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

interface ContentEditorProps {
  document: DocumentWithGeneration;
  initialSections: Section[];
}

export function ContentEditor({ document, initialSections }: ContentEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(
    initialSections[0]?.id ?? null
  );

  const totalWords = sections.reduce((sum, s) => sum + s.word_count, 0);
  const generatedCount = sections.filter((s) => s.is_generated).length;

  const handleRegenerate = useCallback(
    async (sectionId: string) => {
      setRegenerateError(null);

      const creditResult = await deductGenerationCredit(document.id);
      if (creditResult.error) {
        setRegenerateError(creditResult.error);
        return;
      }

      setRegeneratingId(sectionId);

      try {
        const abortController = new AbortController();

        const response = await fetch("/api/ai/generate-section", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId, documentId: document.id }),
          signal: abortController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error("Regeneration failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let newContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as SectionStreamEvent;
              if (event.type === "token") {
                newContent += event.text;
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === sectionId
                      ? { ...s, content: newContent }
                      : s
                  )
                );
              } else if (event.type === "done") {
                setSections((prev) =>
                  prev.map((s) =>
                    s.id === sectionId
                      ? {
                          ...s,
                          content: newContent,
                          word_count: event.wordCount,
                          is_generated: true,
                        }
                      : s
                  )
                );
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Regeneration error:", err);
        }
      } finally {
        setRegeneratingId(null);
      }
    },
    [document.id]
  );

  async function handlePublish() {
    await updateDocumentStatus(document.id, "completed");
    router.push("/projects");
  }

  const scrollToSection = (id: string) => {
    setActiveId(id);
    globalThis.document?.getElementById(`section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex h-full gap-0">
      {/* ── Sidebar TOC ──────────────────────────────────────────────── */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[hsl(var(--border))] lg:flex">
        <div className="border-b border-[hsl(var(--border))] px-4 py-3">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-[hsl(var(--foreground))]">
            {document.title}
          </p>
          <span className="mt-1 inline-block rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            {TYPE_LABELS[document.type] ?? document.type}
          </span>
        </div>

        {/* Stats */}
        <div className="border-b border-[hsl(var(--border))] px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                {totalWords.toLocaleString()}
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">words</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">
                {sections.length}
              </p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">sections</p>
            </div>
          </div>
          {generatedCount < sections.length && (
            <div className="mt-2">
              <div className="h-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                  style={{
                    width: `${Math.round((generatedCount / sections.length) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                {generatedCount}/{sections.length} generated
              </p>
            </div>
          )}
        </div>

        {/* Section list */}
        <nav className="flex-1 overflow-y-auto py-2">
          {sections.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              className={cn(
                "flex w-full items-start gap-2 px-4 py-2 text-left transition-colors",
                activeId === s.id
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[9px] font-semibold">
                {i + 1}
              </span>
              <span className="line-clamp-2 text-xs">{s.title}</span>
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="border-t border-[hsl(var(--border))] p-4 space-y-2">
          <Button size="sm" className="w-full gap-2" onClick={handlePublish}>
            <Check className="h-3.5 w-3.5" />
            Done
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full gap-2">
            <Link href={`/exports`}>
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Link>
          </Button>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.9)] px-4 py-3 backdrop-blur-sm lg:hidden">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <p className="line-clamp-1 text-sm font-semibold text-[hsl(var(--foreground))]">
            {document.title}
          </p>
          <Button size="sm" onClick={handlePublish}>Done</Button>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
          {/* Regeneration error banner */}
          {regenerateError && (
            <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--destructive)/0.4)] bg-[hsl(var(--destructive)/0.08)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
              <span className="flex-1">{regenerateError}</span>
              <button
                type="button"
                onClick={() => setRegenerateError(null)}
                className="text-[hsl(var(--destructive))] hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          {/* Document title */}
          <div className="pb-4">
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--primary))]">
                {TYPE_LABELS[document.type] ?? document.type}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
              {document.title}
            </h1>
          </div>

          {/* Sections */}
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No sections found. Go back to generate content.
              </p>
              <Button variant="outline" asChild className="mt-4">
                <Link href={`/dashboard/documents/${document.id}/outline`}>
                  Back to outline
                </Link>
              </Button>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.id} id={`section-${section.id}`}>
                <SectionEditor
                  section={section}
                  documentId={document.id}
                  onRegenerate={handleRegenerate}
                  isRegenerating={regeneratingId === section.id}
                />
              </div>
            ))
          )}

          {/* Bottom action */}
          {sections.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {totalWords.toLocaleString()} words total
              </p>
              <div className="flex gap-3">
                <Button variant="outline" asChild className="gap-2">
                  <Link href={`/exports`}>
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Link>
                </Button>
                <Button className="gap-2" onClick={handlePublish}>
                  <Check className="h-4 w-4" />
                  Finish &amp; save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

