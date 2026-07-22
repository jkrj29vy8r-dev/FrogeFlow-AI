"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Check,
  AlignLeft,
  Maximize,
  Minimize,
  Eye,
  Layers,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./section-editor";
import { ExportDialog } from "@/features/exports/components/export-dialog";
import type { Section, DocumentWithGeneration } from "@/types/database";
import {
  updateDocumentStatus,
  reorderSections,
} from "@/features/documents/actions/sections.actions";

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
    return sum + stripped.split(/\s+/).filter(Boolean).length;
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

// ── Sortable section wrapper ───────────────────────────────────────────────────

function SortableSection({
  section,
  documentId,
  isFocused,
  onFocus,
}: {
  section: Section;
  documentId: string;
  isFocused: boolean;
  onFocus: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={`section-${section.id}`}
      className="scroll-mt-20"
    >
      <SectionEditor
        section={section}
        documentId={documentId}
        isFocused={isFocused}
        onFocus={onFocus}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
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
  const [sections, setSections] = useState(initialSections);
  const [activeId, setActiveId] = useState<string | null>(
    initialSections[0]?.id ?? null
  );
  const [focusMode, setFocusMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Fullscreen ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setFullscreen(!!window.document.fullscreenElement);
    window.document.addEventListener("fullscreenchange", handler);
    return () => window.document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Lock background scroll while the mobile TOC drawer is open — otherwise
  // the main content can be scrolled underneath it, so buttons from the
  // page (e.g. the bottom "Export PDF") can end up poking out past the
  // drawer's edge, looking like a rendering glitch.
  useEffect(() => {
    if (!mobileTocOpen) return;
    const original = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = original;
    };
  }, [mobileTocOpen]);

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
      if (e.key === "Escape") {
        if (focusMode) setFocusMode(false);
        if (mobileTocOpen) setMobileTocOpen(false);
      }
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
  }, [focusMode, mobileTocOpen, toggleFullscreen]);

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
    setMobileTocOpen(false);
    window.document.getElementById(`section-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  // ── Drag & drop reorder ────────────────────────────────────────────────────────
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
      await reorderSections(reordered.map((s) => s.id));
    },
    [sections]
  );

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    await updateDocumentStatus(document.id, "completed");
    router.push("/projects");
  }, [document.id, router]);

  const totalWords = sections.reduce((sum, s) => {
    const stripped = s.content.replace(/<[^>]+>/g, " ").trim();
    return sum + stripped.split(/\s+/).filter(Boolean).length;
  }, 0);

  // ── Sidebar content (shared between desktop sidebar and mobile drawer) ─────────
  const tocContent = (
    <>
      <div className="border-b border-[hsl(var(--border))] px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Projects
          </Link>
          <button
            type="button"
            onClick={() => setMobileTocOpen(false)}
            className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mt-2 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/projects" className="hover:text-[hsl(var(--foreground))]">Projects</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate text-[hsl(var(--foreground))]">Editor</span>
        </nav>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-[hsl(var(--foreground))]">
          {document.title}
        </p>
        <span className="mt-1 inline-block rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
          {TYPE_LABELS[document.type] ?? document.type}
        </span>
      </div>

      <StatsBar sections={sections} />

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
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={() => {
            setMobileTocOpen(false);
            setShowExport(true);
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </Button>
      </div>
    </>
  );

  return (
    <>
    {showExport && (
      <ExportDialog
        documentId={document.id}
        documentTitle={document.title}
        onClose={() => setShowExport(false)}
      />
    )}
    <div
      ref={containerRef}
      className={cn(
        "flex h-full bg-[hsl(var(--background))] transition-all duration-300",
        fullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* ── Desktop TOC Sidebar ───────────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] transition-all duration-300 lg:flex",
          tocOpen && !focusMode ? "w-56" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {tocContent}
      </aside>

      {/* ── Mobile TOC Drawer ─────────────────────────────────────────────────── */}
      {mobileTocOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 lg:hidden"
            onClick={() => setMobileTocOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background))] lg:hidden">
            {tocContent}
          </aside>
        </>
      )}

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Sticky topbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.92)] px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileTocOpen(true)}
              className="flex items-center justify-center rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Desktop TOC toggle */}
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

            {/* Breadcrumb — desktop */}
            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1 text-xs lg:flex"
            >
              <Link
                href="/projects"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                Projects
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="max-w-[12rem] truncate font-medium text-[hsl(var(--foreground))]">
                {document.title}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[hsl(var(--muted-foreground))]">Editor</span>
            </nav>

            {/* Mobile title */}
            <p className="line-clamp-1 text-sm font-semibold text-[hsl(var(--foreground))] lg:hidden">
              {document.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatsBar sections={sections} isCompact />

            {/* Mode switcher */}
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
              <span className="hidden sm:inline">Done</span>
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
              focusMode ? "max-w-2xl px-6" : "max-w-3xl px-4 sm:px-6"
            )}
          >
            {/* Document header */}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e: DragEndEvent) => void handleDragEnd(e)}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-6">
                      {sections.map((section) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          documentId={document.id}
                          isFocused={!focusMode || activeId === section.id}
                          onFocus={() => setActiveId(section.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Bottom actions */}
                <div className="mt-10 flex items-center justify-between border-t border-[hsl(var(--border))] pt-6">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {totalWords.toLocaleString()} words total
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowExport(true)}
                    >
                      <Download className="h-4 w-4" />
                      Export PDF
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
    </>
  );
}
