"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Copy,
  RotateCcw,
  Loader2,
  Download,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { LandingPage, LandingPageSection, SectionType } from "@/types/landing-pages";
import { SECTION_LABELS } from "@/types/landing-pages";
import { SectionPreview } from "./section-preview";
import { SectionEditDialog } from "./section-edit-dialog";
import { ExportDialog } from "./export-dialog";
import {
  updateSection,
  reorderSections,
  duplicateSection,
  deleteSection,
  addSection,
  updateLandingPage,
} from "@/features/landing-pages/actions/landing-pages.actions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageEditorProps {
  page: LandingPage;
  initialSections: LandingPageSection[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_SECTION_TYPES: SectionType[] = [
  'hero', 'pain_points', 'solution', 'features', 'benefits',
  'how_it_works', 'testimonials', 'pricing', 'faq', 'guarantee', 'about', 'cta', 'footer',
];

// ── Main component ────────────────────────────────────────────────────────────

export function PageEditor({ page, initialSections }: PageEditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [pageName, setPageName] = useState(page.name);
  const [savingName, setSavingName] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const primary = page.settings.primaryColor || '#6366f1';
  const secondary = page.settings.secondaryColor || '#8b5cf6';

  // Filter visible sections for search
  const filteredSections = sections.filter(s =>
    !searchQuery || SECTION_LABELS[s.section_type as SectionType]?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex(s => s.id === active.id);
    const newIdx = sections.findIndex(s => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(sections, oldIdx, newIdx);
    setSections(reordered);
    await reorderSections(page.id, reordered.map(s => s.id));
  }, [sections, page.id]);

  const handleToggleVisibility = useCallback(async (section: LandingPageSection) => {
    const newVisible = !section.is_visible;
    setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: newVisible } : s));
    await updateSection(section.id, { is_visible: newVisible });
  }, []);

  const handleSaveContent = useCallback(async (sectionId: string, content: Record<string, unknown>) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s));
    await updateSection(sectionId, { content });
  }, []);

  const handleDuplicate = useCallback(async (section: LandingPageSection) => {
    const { section: dup } = await duplicateSection(section.id);
    if (dup) setSections(prev => {
      const idx = prev.findIndex(s => s.id === section.id);
      const next = [...prev];
      next.splice(idx + 1, 0, dup);
      return next;
    });
  }, []);

  const handleDelete = useCallback(async (sectionId: string) => {
    if (!confirm('Delete this section? This cannot be undone.')) return;
    setSections(prev => prev.filter(s => s.id !== sectionId));
    await deleteSection(sectionId);
  }, []);

  const handleRegenerate = useCallback(async (section: LandingPageSection) => {
    setRegeneratingId(section.id);
    try {
      const response = await fetch(`/api/landing-pages/${page.id}/section`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: section.id }),
      });
      if (response.ok) {
        const { content } = await response.json() as { content: Record<string, unknown> };
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, content } : s));
      }
    } finally {
      setRegeneratingId(null);
    }
  }, [page.id]);

  const handleAddSection = useCallback(async (type: SectionType) => {
    const position = sections.length;
    const { section } = await addSection(page.id, type, position);
    if (section) setSections(prev => [...prev, section]);
    setShowAddSection(false);
  }, [page.id, sections.length]);

  const handleSaveName = useCallback(async () => {
    if (pageName === page.name) return;
    setSavingName(true);
    await updateLandingPage(page.id, { name: pageName });
    setSavingName(false);
  }, [page.id, page.name, pageName]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-lg font-bold text-[hsl(var(--foreground))] focus:border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            value={pageName}
            onChange={e => setPageName(e.target.value)}
            onBlur={() => void handleSaveName()}
            onKeyDown={e => { if (e.key === 'Enter') void handleSaveName(); }}
          />
          {savingName && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[hsl(var(--muted-foreground))]" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            {page.status === 'published' ? '🟢 Published' : '⚪ Draft'}
          </span>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowExport(true)}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* SEO info strip */}
      {page.seo?.title && (
        <div className="flex items-start gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-4 py-2.5 text-xs">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <div className="min-w-0">
            <span className="font-medium text-[hsl(var(--foreground))]">{page.seo.title}</span>
            <span className="mx-1.5 text-[hsl(var(--muted-foreground))]">·</span>
            <span className="text-[hsl(var(--muted-foreground))]">{page.seo.description}</span>
          </div>
        </div>
      )}

      {/* Search + add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            className="pl-9"
            placeholder="Search sections…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowAddSection(s => !s)}>
          <Plus className="h-3.5 w-3.5" /> Add Section
        </Button>
      </div>

      {/* Add section panel */}
      {showAddSection && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="mb-3 text-sm font-medium text-[hsl(var(--foreground))]">Choose a section to add:</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SECTION_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => void handleAddSection(type)}
                className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.05)] hover:text-[hsl(var(--primary))]"
              >
                {SECTION_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => void handleDragEnd(e)}>
        <SortableContext items={filteredSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {filteredSections.map(section => (
              <SortableSection
                key={section.id}
                section={section}
                primaryColor={primary}
                secondaryColor={secondary}
                isCollapsed={collapsedSections.has(section.id)}
                isRegenerating={regeneratingId === section.id}
                onToggleCollapse={toggleCollapse}
                onEdit={setEditingSection}
                onToggleVisibility={handleToggleVisibility}
                onDuplicate={handleDuplicate}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredSections.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {searchQuery ? 'No sections match your search' : 'No sections yet'}
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {searchQuery ? 'Try a different search term' : 'Add sections using the button above'}
          </p>
        </div>
      )}

      {/* Last updated */}
      <p className="text-right text-xs text-[hsl(var(--muted-foreground))]">
        Last updated {formatRelativeTime(page.updated_at)}
      </p>

      {/* Edit dialog */}
      {editingSection && (
        <SectionEditDialog
          section={editingSection}
          onSave={async (content) => {
            await handleSaveContent(editingSection.id, content);
          }}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* Export dialog */}
      {showExport && (
        <ExportDialog
          page={page}
          sections={sections}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

// ── Sortable section card ──────────────────────────────────────────────────────

interface SortableSectionProps {
  section: LandingPageSection;
  primaryColor: string;
  secondaryColor: string;
  isCollapsed: boolean;
  isRegenerating: boolean;
  onToggleCollapse: (id: string) => void;
  onEdit: (section: LandingPageSection) => void;
  onToggleVisibility: (section: LandingPageSection) => Promise<void>;
  onDuplicate: (section: LandingPageSection) => Promise<void>;
  onRegenerate: (section: LandingPageSection) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function SortableSection({
  section,
  primaryColor,
  secondaryColor,
  isCollapsed,
  isRegenerating,
  onToggleCollapse,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onRegenerate,
  onDelete,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-shadow",
        isDragging && "shadow-xl ring-2 ring-[hsl(var(--primary)/0.3)]",
        !section.is_visible && "opacity-60"
      )}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Section label */}
        <button
          type="button"
          className="flex flex-1 items-center gap-2 text-left"
          onClick={() => onToggleCollapse(section.id)}
        >
          <span className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {SECTION_LABELS[section.section_type as SectionType] ?? section.section_type}
          </span>
          {!section.is_visible && (
            <span className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">Hidden</span>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {isRegenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--muted-foreground))]" />
          ) : (
            <ActionButton title="Regenerate with AI" onClick={() => void onRegenerate(section)}>
              <RotateCcw className="h-3.5 w-3.5" />
            </ActionButton>
          )}
          <ActionButton title="Edit" onClick={() => onEdit(section)}>
            <Pencil className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton title={section.is_visible ? 'Hide' : 'Show'} onClick={() => void onToggleVisibility(section)}>
            {section.is_visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </ActionButton>
          <ActionButton title="Duplicate" onClick={() => void onDuplicate(section)}>
            <Copy className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton title="Delete" onClick={() => void onDelete(section.id)} danger>
            <Trash2 className="h-3.5 w-3.5" />
          </ActionButton>
          <button
            type="button"
            onClick={() => onToggleCollapse(section.id)}
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
            aria-expanded={!isCollapsed}
            className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Section preview */}
      {!isCollapsed && (
        <div
          className="overflow-hidden rounded-b-xl border-t border-[hsl(var(--border))] text-sm"
          style={{ fontSize: '0.7rem' }}
        >
          {isRegenerating ? (
            <div className="flex items-center justify-center gap-2 py-10 text-[hsl(var(--muted-foreground))]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Regenerating with AI…</span>
            </div>
          ) : (
            <SectionPreview section={section} primaryColor={primaryColor} secondaryColor={secondaryColor} />
          )}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] transition-colors",
        danger
          ? "hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
          : "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
      )}
    >
      {children}
    </button>
  );
}
