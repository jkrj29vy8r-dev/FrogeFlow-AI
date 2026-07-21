"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Loader2,
  AlertCircle,
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  Eye,
  Pencil,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAutosave } from "@/features/documents/hooks/use-autosave";
import {
  getSectionVersions,
  restoreSectionVersion,
  deductGenerationCredit,
} from "@/features/documents/actions/sections.actions";
import type { Section, SectionVersion } from "@/types/database";
import type { SectionStreamEvent } from "@/features/documents/types";
import { RichTextEditor, plainTextToHtml } from "./rich-editor";
import type { RichTextEditorHandle } from "./rich-editor";

const SECTION_TYPE_LABELS: Record<string, string> = {
  introduction: "Introduction",
  chapter: "Chapter",
  subchapter: "Subchapter",
  conclusion: "Conclusion",
  cta: "Call to Action",
  checklist_group: "Checklist",
  exercise: "Exercise",
  tips: "Tips",
};

interface SectionEditorProps {
  section: Section;
  documentId: string;
  isFocused?: boolean;
  onFocus?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function SectionEditor({
  section,
  documentId,
  isFocused = true,
  onFocus,
  dragHandleProps,
}: SectionEditorProps) {
  const [content, setContent] = useState(section.content);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<SectionVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const saveFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const { status: autosaveStatus } = useAutosave(
    section.id,
    documentId,
    content,
    !isRegenerating
  );

  // Trigger success flash when status transitions to "saved"
  const prevStatus = useRef(autosaveStatus);
  useEffect(() => {
    if (prevStatus.current !== "saved" && autosaveStatus === "saved") {
      if (saveFlashTimer.current) clearTimeout(saveFlashTimer.current);
      setSaveFlash(true);
      saveFlashTimer.current = setTimeout(() => setSaveFlash(false), 1500);
    }
    prevStatus.current = autosaveStatus;
  }, [autosaveStatus]);

  const wordCount = content
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  async function loadVersionHistory() {
    if (versions.length > 0) {
      setShowHistory((v) => !v);
      return;
    }
    setLoadingHistory(true);
    const result = await getSectionVersions(section.id);
    setVersions(result.versions ?? []);
    setLoadingHistory(false);
    setShowHistory(true);
  }

  async function handleRestore(version: SectionVersion) {
    setRestoringId(version.id);
    const result = await restoreSectionVersion(section.id, documentId, version.id);
    if (!result.error) {
      const html = plainTextToHtml(version.content);
      setContent(html);
      editorRef.current?.setContent(html);
    }
    setRestoringId(null);
    setShowHistory(false);
  }

  const handleRegenerate = useCallback(async () => {
    setRegenerateError(null);

    const creditResult = await deductGenerationCredit(documentId);
    if (creditResult.error) {
      setRegenerateError(creditResult.error);
      return;
    }

    setIsRegenerating(true);

    try {
      const response = await fetch("/api/ai/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: section.id, documentId }),
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

          let event: SectionStreamEvent;
          try {
            event = JSON.parse(raw) as SectionStreamEvent;
          } catch {
            // Malformed/partial chunk (can legitimately happen if a chunk
            // boundary splits a message) — skip it, don't treat as fatal.
            continue;
          }

          if (event.type === "token") {
            newContent += event.text;
            const html = plainTextToHtml(newContent);
            editorRef.current?.setContent(html);
            setContent(html);
          } else if (event.type === "done") {
            const finalHtml = plainTextToHtml(newContent);
            editorRef.current?.setContent(finalHtml);
            setContent(finalHtml);
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setRegenerateError(
          err instanceof Error ? err.message : "Regeneration failed"
        );
      }
    } finally {
      setIsRegenerating(false);
    }
  }, [section.id, documentId]);

  return (
    <div
      className={cn(
        "group/section rounded-2xl border bg-[hsl(var(--card))] transition-all duration-200",
        isFocused
          ? "border-[hsl(var(--border))] shadow-sm"
          : "border-transparent opacity-60 hover:opacity-80",
        isExpanded && "fixed inset-4 z-50 overflow-auto shadow-2xl"
      )}
      onClick={onFocus}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="hidden cursor-grab touch-none items-center text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover/section:opacity-60 active:cursor-grabbing lg:flex"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--primary))]">
            {SECTION_TYPE_LABELS[section.section_type] ?? section.section_type}
          </span>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {section.title}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          {/* Autosave indicator */}
          <span className="min-w-[4.5rem] text-right text-[10px]">
            {autosaveStatus === "saving" && (
              <span className="flex items-center justify-end gap-1 text-[hsl(var(--muted-foreground))]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </span>
            )}
            {autosaveStatus === "saved" && (
              <span
                className={cn(
                  "flex items-center justify-end gap-1 transition-colors duration-700",
                  saveFlash ? "text-emerald-500" : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
            {autosaveStatus === "error" && (
              <span className="flex items-center justify-end gap-1 text-[hsl(var(--destructive))]">
                <AlertCircle className="h-3 w-3" />
                Error
              </span>
            )}
          </span>

          {/* Undo / Redo */}
          <button
            type="button"
            title="Undo (⌘Z)"
            onClick={(e) => { e.stopPropagation(); editorRef.current?.undo(); }}
            className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Redo (⌘⇧Z)"
            onClick={(e) => { e.stopPropagation(); editorRef.current?.redo(); }}
            className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          {/* Preview / Edit toggle */}
          <button
            type="button"
            title={isPreview ? "Switch to edit" : "Preview"}
            onClick={(e) => { e.stopPropagation(); setIsPreview((p) => !p); }}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded transition-colors",
              isPreview
                ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            {isPreview ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>

          {/* Regenerate */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); void handleRegenerate(); }}
            disabled={isRegenerating}
            className="h-7 gap-1.5 px-2 text-xs"
            title="Regenerate this section with AI"
          >
            {isRegenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RotateCcw className="h-3 w-3" />
            )}
            {isRegenerating ? "Writing…" : "Regenerate"}
          </Button>

          {/* History */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); void loadVersionHistory(); }}
            disabled={loadingHistory}
            className="h-7 gap-1 px-2 text-xs"
            title="Version history"
          >
            {loadingHistory ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <History className="h-3 w-3" />
            )}
            {showHistory ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>

          {/* Expand / collapse */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsExpanded((x) => !x); }}
            className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-5 py-3">
          {versions.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              No versions yet.
            </p>
          ) : (
            <div className="space-y-1">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                Version history
              </p>
              {versions.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-[hsl(var(--accent))]"
                >
                  <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                    <Clock className="h-3 w-3" />
                    <span>v{v.version}</span>
                    <span>{formatRelativeTime(v.created_at)}</span>
                    <span>· {v.word_count} words</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    disabled={restoringId === v.id}
                    onClick={() => void handleRestore(v)}
                  >
                    {restoringId === v.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Restore"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regenerate error */}
      {regenerateError && (
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--destructive)/0.06)] px-5 py-2 text-xs text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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

      {/* Regenerating overlay */}
      {isRegenerating && (
        <div className="flex items-center gap-2 border-b border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.04)] px-5 py-2 text-xs text-[hsl(var(--primary))]">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>AI is rewriting this section…</span>
        </div>
      )}

      {/* Editor / Preview */}
      <div className="px-6 py-5">
        {isPreview ? (
          <div
            className="prose-editor min-h-[120px]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <RichTextEditor
            ref={editorRef}
            initialContent={content}
            onChange={setContent}
            disabled={isRegenerating}
            placeholder={`Start writing ${section.title}…`}
            className={cn(isRegenerating && "prose-editor-regenerating")}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-5 py-2">
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {wordCount.toLocaleString()} {wordCount === 1 ? "word" : "words"}
        </span>
        {section.description && (
          <span className="line-clamp-1 max-w-xs text-[10px] italic text-[hsl(var(--muted-foreground))]">
            {section.description}
          </span>
        )}
      </div>
    </div>
  );
}
