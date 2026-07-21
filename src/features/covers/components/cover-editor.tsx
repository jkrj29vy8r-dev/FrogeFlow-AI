"use client";

import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Undo2, Redo2, Save, Download, Check, ChevronLeft, Sparkles, Sliders, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Cover, CoverContent, CoverElement, CoverBackground, CoverInput } from "@/types/covers";
import { CoverCanvas, CANVAS_W, CANVAS_H } from "./cover-canvas";
import { LeftPanel } from "./panels/left-panel";
import { RightPanel } from "./panels/right-panel";
import { ExportDialog } from "./export-dialog";
import { updateCoverContent } from "@/features/covers/actions/covers.actions";

interface Props {
  cover: Cover;
}

const MAX_HISTORY = 50;

export function CoverEditor({ cover }: Props) {
  const router = useRouter();
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [history, setHistory] = useState<CoverContent[]>([cover.content]);
  const [histIdx, setHistIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showExport, setShowExport] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<'none' | 'left' | 'right'>('none');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const content = history[histIdx] ?? cover.content;

  // Compute scale to fit canvas in available area
  useLayoutEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const padding = 56;
      const s = Math.min((width - padding) / CANVAS_W, (height - padding) / CANVAS_H, 1.1);
      setScale(Math.max(0.3, s));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const scheduleSave = useCallback((c: CoverContent) => {
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateCoverContent(cover.id, c);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1500);
  }, [cover.id]);

  const pushHistory = useCallback((newContent: CoverContent) => {
    setHistory(h => {
      const next = h.slice(0, histIdx + 1);
      next.push(newContent);
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setHistIdx(i => Math.min(i + 1, MAX_HISTORY - 1));
    scheduleSave(newContent);
  }, [histIdx, scheduleSave]);

  function undo() {
    if (histIdx > 0) {
      setHistIdx(i => i - 1);
      scheduleSave(history[histIdx - 1]);
    }
  }

  function redo() {
    if (histIdx < history.length - 1) {
      setHistIdx(i => i + 1);
      scheduleSave(history[histIdx + 1]);
    }
  }

  const handleUpdateElement = useCallback((id: string, updates: Partial<CoverElement>) => {
    const newContent: CoverContent = {
      ...content,
      elements: content.elements.map(el => el.id === id ? { ...el, ...updates } as CoverElement : el),
    };
    pushHistory(newContent);
  }, [content, pushHistory]);

  const handleUpdateBackground = useCallback((bg: CoverBackground) => {
    pushHistory({ ...content, background: bg });
  }, [content, pushHistory]);

  const handleApplyContent = useCallback((newContent: CoverContent) => {
    setSelectedId(null);
    pushHistory(newContent);
  }, [pushHistory]);

  const coverInput: Pick<CoverInput, 'title' | 'subtitle' | 'author' | 'brandName'> = {
    title: (content.elements.find(e => e.kind === 'text' && e.role === 'title') as { value: string } | undefined)?.value ?? cover.name,
    subtitle: (content.elements.find(e => e.kind === 'text' && e.role === 'subtitle') as { value: string } | undefined)?.value ?? '',
    author: (content.elements.find(e => e.kind === 'text' && e.role === 'author') as { value: string } | undefined)?.value ?? '',
    brandName: (content.elements.find(e => e.kind === 'text' && e.role === 'brand') as { value: string } | undefined)?.value ?? '',
  };

  return (
    <>
      <div
        className="-mx-4 -my-4 flex overflow-hidden sm:-mx-6 sm:-my-6 lg:-mx-8"
        style={{ height: 'calc(100vh - 56px)' }}
      >
        {/* Left panel — static on desktop, slide-in drawer on mobile */}
        {mobilePanel === 'left' && (
          <div
            onClick={() => setMobilePanel('none')}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
            mobilePanel === 'left' ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-10 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 lg:hidden">
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Design</span>
            <button
              onClick={() => setMobilePanel('none')}
              aria-label="Close design panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-40px)] lg:h-full">
            <LeftPanel
              coverInput={coverInput}
              currentContent={content}
              onApply={(c) => { handleApplyContent(c); setMobilePanel('none'); }}
            />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex h-11 shrink-0 items-center justify-between gap-2 overflow-x-auto border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 sm:px-4">
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => router.push('/covers')}
                className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] sm:px-2.5"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Covers</span>
              </button>
              <span className="max-w-[100px] truncate text-xs font-medium text-[hsl(var(--foreground))] sm:max-w-none">{cover.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {/* Mobile-only panel toggles */}
              <button
                onClick={() => setMobilePanel('left')}
                title="Design"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--accent))] lg:hidden"
              >
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--foreground))]" />
              </button>
              <button
                onClick={() => setMobilePanel('right')}
                title="Style"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--accent))] lg:hidden"
              >
                <Sliders className="h-3.5 w-3.5 text-[hsl(var(--foreground))]" />
              </button>

              <button
                onClick={undo}
                disabled={histIdx === 0}
                title="Undo (Cmd+Z)"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--accent))] disabled:opacity-40"
              >
                <Undo2 className="h-3.5 w-3.5 text-[hsl(var(--foreground))]" />
              </button>
              <button
                onClick={redo}
                disabled={histIdx >= history.length - 1}
                title="Redo (Cmd+Y)"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[hsl(var(--accent))] disabled:opacity-40"
              >
                <Redo2 className="h-3.5 w-3.5 text-[hsl(var(--foreground))]" />
              </button>
              <div className={cn("hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-all sm:flex",
                saveStatus === 'saving' ? "text-[hsl(var(--muted-foreground))]" :
                saveStatus === 'saved' ? "text-green-600" : "text-transparent"
              )}>
                {saveStatus === 'saved' ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : ''}
              </div>
              <button
                onClick={() => setShowExport(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-3"
              >
                <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Canvas stage */}
          <div
            ref={canvasAreaRef}
            className="flex flex-1 items-center justify-center overflow-auto bg-[hsl(var(--muted)/0.5)]"
            style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)',
                borderRadius: 4,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <CoverCanvas
                content={content}
                selectedId={selectedId}
                onSelectElement={setSelectedId}
                onUpdateElement={handleUpdateElement}
                interactive
              />
            </div>
          </div>

          {/* Dimension badge */}
          <div className="flex h-6 shrink-0 items-center justify-center border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {CANVAS_W} × {CANVAS_H} px · {Math.round(scale * 100)}%
            </span>
          </div>
        </div>

        {/* Right panel — static on desktop, slide-in drawer on mobile */}
        {mobilePanel === 'right' && (
          <div
            onClick={() => setMobilePanel('none')}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
        )}
        <div
          className={cn(
            "fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0",
            mobilePanel === 'right' ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex h-10 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 lg:hidden">
            <span className="text-xs font-semibold text-[hsl(var(--foreground))]">Style</span>
            <button
              onClick={() => setMobilePanel('none')}
              aria-label="Close style panel"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-40px)] lg:h-full">
            <RightPanel
              content={content}
              selectedId={selectedId}
              onUpdateElement={handleUpdateElement}
              onUpdateBackground={handleUpdateBackground}
            />
          </div>
        </div>
      </div>

      {showExport && (
        <ExportDialog
          coverId={cover.id}
          coverName={cover.name}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}
