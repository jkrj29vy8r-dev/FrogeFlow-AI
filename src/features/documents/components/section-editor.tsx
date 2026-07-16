"use client";

import { useState, useRef } from "react";
import {
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { useAutosave } from "@/features/documents/hooks/use-autosave";
import {
  getSectionVersions,
  restoreSectionVersion,
} from "@/features/documents/actions/sections.actions";
import type { Section, SectionVersion } from "@/types/database";

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
  onRegenerate?: (sectionId: string) => void;
  isRegenerating?: boolean;
}

export function SectionEditor({
  section,
  documentId,
  onRegenerate,
  isRegenerating = false,
}: SectionEditorProps) {
  const [content, setContent] = useState(section.content);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<SectionVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { status: autosaveStatus } = useAutosave(
    section.id,
    documentId,
    content,
    !isRegenerating
  );

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
      setContent(version.content);
    }
    setRestoringId(null);
    setShowHistory(false);
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className={cn(
        "rounded-xl border bg-[hsl(var(--card))] transition-shadow",
        isRegenerating
          ? "border-[hsl(var(--primary)/0.4)] shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
          : "border-[hsl(var(--border))]"
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
            {SECTION_TYPE_LABELS[section.section_type] ?? section.section_type}
          </span>
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            {section.title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Autosave status */}
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            {autosaveStatus === "saving" && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </span>
            )}
            {autosaveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-500">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
            {autosaveStatus === "error" && (
              <span className="flex items-center gap-1 text-[hsl(var(--destructive))]">
                <AlertCircle className="h-3 w-3" />
                Error
              </span>
            )}
          </span>

          {/* Regenerate button */}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRegenerate(section.id)}
              disabled={isRegenerating}
              className="h-7 gap-1.5 px-2 text-xs"
            >
              {isRegenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RotateCcw className="h-3 w-3" />
              )}
              {isRegenerating ? "Writing…" : "Regenerate"}
            </Button>
          )}

          {/* History button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadVersionHistory}
            disabled={loadingHistory}
            className="h-7 gap-1.5 px-2 text-xs"
          >
            {loadingHistory ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <History className="h-3 w-3" />
            )}
            History
            {showHistory ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Version history panel */}
      {showHistory && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-5 py-3">
          {versions.length === 0 ? (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">No versions yet.</p>
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
                    onClick={() => handleRestore(v)}
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

      {/* Regenerating overlay */}
      {isRegenerating && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--primary))]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is rewriting this section…</span>
          </div>
        </div>
      )}

      {/* Editable textarea */}
      <div className="px-5 py-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isRegenerating}
          placeholder="Content will appear here after generation…"
          className={cn(
            "min-h-[200px] w-full resize-none bg-transparent text-sm leading-relaxed text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none",
            isRegenerating && "opacity-50"
          )}
          style={{ height: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-5 py-2">
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
          {wordCount.toLocaleString()} words
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
