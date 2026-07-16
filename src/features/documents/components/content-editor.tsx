"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  Download,
  Check,
  AlignLeft,
  Maximize,
  Minimize,
  Eye,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./section-editor";
import type { Section, DocumentWithGeneration } from "@/types/database";
import { updateDocumentStatus } from "@/features/documents/actions/sections.actions";

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

// ── TOC entry ─────────────────────────────────────────────────────────────────

function TocEntry({
  section,
  index,
  isActive,
  onClick,
}: {
  section: Section;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-all",
        isActive
          ? "text-[hsl(var(--foreground))]"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
          isActive
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            : "bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--accent))]"
        )}
      >
        {index + 1}
      </span>
      <span className="line-clamp-2 leading-snug">{section.title}</span>
    </button>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatsBar({
  sections,
  isCompact = false,
}: {
  sections: Section[];
  isCompact?: boolean;
}) {
  const totalWords = sections.reduce((sum, s) => {
    const stripped = s.content.replace(/<[^>]+>/g, " ").trim();
    const words = stripped.split(/\s+/).filter(Boolean).length;
    return sum + words;
  }, 0);
  const generated = sections.filter((s) => s.is_generated).length;

  if (isCompact) {
    return (
      <span className="text-xs text-[hsl(var(--muted-foreground))]">
        {totalWords.toLocaleString()} words · {sections.length} sections
      </span>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 px-3 py-2">
      {[
        { label: "Words", value: totalWords.toLocaleString() },
        { label: "Sections", value: sections.length },
        { label: "Generated", value: `${generated}/${sections.length}` },
      ].map(({ label, value }) => (
        <div key={label} className="text-center">
          <p className="text-sm font-bold text-[hsl(var(--foreground))]">{value}</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ContentEditorProps {
  document: DocumentWithGeneration;
  initialSections: Section[];
}

export function ContentEditor({ document, initialSections }: ContentEditorProps) {
  const router = useRouter();
  const [sections] = useState<Section[]>(initialSections);
  const [activeId, setActiveId] = useState<string | null>(
    initialSections[0]?.id ?? null
  );
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      setFullscreen(!!window.document.fullscreenElement);
    };
    window.document.addEventListener("fullscreenchange", handler);
    return () => window.document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!window.document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(() => null);
    } else {
      await window.document.exitFullscreen().catch(() => null);
    }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && focusMode) setFocusMode(false);
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        void toggleFullscreen();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "d") {
        e.preventDefault();
        setFocusMode((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, toggleFullscreen]);

  // ── Scroll spy ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("section-", "");
            setActiveId(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((s) => {
      const el = window.document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    setActiveId(id);
    window.document.getElementById(`section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    await updateDocumentStatus(document.id, "completed");
    router.push("/projects");
  }, [document.id, router]);

  const totalWords = sections.reduce((sum, s) => {
    const stripped = s.content.replace(/<[^>]+>/g, " ").trim();
    return sum + stripped.split(/\s+/).filter(Boolean).length;
  }, 0);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex h-full bg-[hsl(var(--background))] transition-all duration-300",
        fullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* ── TOC Sidebar ───────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] transition-all duration-300 lg:flex",
          tocOpen && !focusMode ? "w-56" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {/* Back + title */}
        <div className="border-b border-[hsl(var(--border))] px-4 py-3">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[hsl(var(--foreground))]">
            {document.title}
          </p>
          <span className="mt-1 inline-block rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            {TYPE_LABELS[document.type] ?? document.type}
          </span>
        </div>

        {/* Stats */}
        <StatsBar sections={sections} />

        {/* Section nav */}
        <nav className="flex-1 overflow-y-auto py-1">
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            Contents
          </p>
          {sections.map((s, i) => (
            <TocEntry
              key={s.id}
              section={s}
              index={i}
              isActive={activeId === s.id}
              onClick={() => scrollToSection(s.id)}
            />
          ))}
        </nav>

        {/* Actions */}
        <div className="space-y-2 border-t border-[hsl(var(--border))] p-3">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => void handlePublish()}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Done
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild className="w-full gap-2">
            <Link href="/exports">
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </Link>
          </Button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Sticky topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] px-4 py-2 backdrop-blur-md">
          {/* Left: mobile back + toc toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setTocOpen((o) => !o)}
              className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] lg:flex"
              title="Toggle table of contents"
            >
              <Layers className="h-3.5 w-3.5" />
              Contents
            </button>

            <span className="hidden text-[hsl(var(--border))] lg:inline">|</span>

            <p className="line-clamp-1 text-sm font-semibold text-[hsl(var(--foreground))]">
              {document.title}
            </p>
          </div>

          {/* Right: stats + mode controls */}
          <div className="flex items-center gap-2">
            <StatsBar sections={sections} isCompact />

            <div className="flex items-center gap-0.5 rounded-lg border border-[hsl(var(--border))] p-0.5">
              <button
                type="button"
                onClick={() => setFocusMode(false)}
                title="Normal mode"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-xs transition-colors",
                  !focusMode
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFocusMode(true)}
                title="Focus mode (⌘⇧D)"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded text-xs transition-colors",
                  focusMode
                    ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              title="Full screen (⌘⇧F)"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            >
              {fullscreen ? (
                <Minimize className="h-3.5 w-3.5" />
              ) : (
                <Maximize className="h-3.5 w-3.5" />
              )}
            </button>

            <Button
              size="sm"
              className="gap-2"
              onClick={() => void handlePublish()}
              disabled={isPublishing}
            >
              <Check className="h-3.5 w-3.5" />
              Done
            </Button>
          </div>
        </header>

        {/* Error banner */}
        {regenerateError && (
          <div className="flex items-center gap-3 border-b border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.06)] px-6 py-2.5 text-sm text-[hsl(var(--destructive))]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{regenerateError}</span>
            <button
              type="button"
              onClick={() => setRegenerateError(null)}
              className="hover:opacity-70"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto py-8 transition-all duration-300",
              focusMode
                ? "max-w-2xl px-6"
                : "max-w-3xl px-4 sm:px-6"
            )}
          >
            {/* Document title */}
            <div className="mb-8">
              <div className="mb-1.5 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">
                  {TYPE_LABELS[document.type] ?? document.type}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                {document.title}
              </h1>
            </div>

            {/* Empty state */}
            {sections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] py-20 text-center">
                <Sparkles className="mb-3 h-10 w-10 text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  No sections found
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  Go back to the outline to generate content.
                </p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href={`/dashboard/documents/${document.id}/outline`}>
                    Back to outline
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Sections */}
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      className="scroll-mt-20"
                    >
                      <SectionEditor
                        section={section}
                        documentId={document.id}
                        isFocused={!focusMode || activeId === section.id}
                        onFocus={() => setActiveId(section.id)}
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom actions */}
                <div className="mt-10 flex items-center justify-between border-t border-[hsl(var(--border))] pt-6">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {totalWords.toLocaleString()} words total
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild className="gap-2">
                      <Link href="/exports">
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Link>
                    </Button>
                    <Button
                      className="gap-2"
                      onClick={() => void handlePublish()}
                      disabled={isPublishing}
                    >
                      <Check className="h-4 w-4" />
                      Finish &amp; save
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
