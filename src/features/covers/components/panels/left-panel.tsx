"use client";

import { useState } from "react";
import { Sparkles, LayoutTemplate, Palette, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoverContent, CoverVariation, CoverInput } from "@/types/covers";
import { PRESET_VARIATIONS } from "@/features/covers/lib/palettes";
import { LAYOUT_LABELS } from "@/types/covers";
import { applyLayout } from "@/features/covers/lib/layouts";
import { CoverCanvas, CANVAS_W, CANVAS_H } from "../cover-canvas";

type Tab = 'ai' | 'layouts' | 'palettes';

interface Props {
  coverInput: Pick<CoverInput, 'title' | 'subtitle' | 'author' | 'brandName'>;
  currentContent: CoverContent;
  onApply: (content: CoverContent) => void;
}

export function LeftPanel({ coverInput, currentContent, onApply }: Props) {
  const [tab, setTab] = useState<Tab>('ai');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiVariations, setAiVariations] = useState<CoverVariation[]>([]);
  const [aiError, setAiError] = useState('');
  const [appliedIdx, setAppliedIdx] = useState<number | null>(null);

  // Quick input for AI
  const [aiStyle, setAiStyle] = useState('elegant');
  const [aiIndustry, setAiIndustry] = useState('Business');

  async function generateVariations() {
    setAiGenerating(true);
    setAiError('');
    setAiVariations([]);
    try {
      const res = await fetch('/api/covers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: coverInput.title || 'My Product',
          subtitle: coverInput.subtitle || '',
          author: coverInput.author || coverInput.brandName || '',
          brandName: coverInput.brandName || '',
          productType: 'ebook',
          industry: aiIndustry,
          targetAudience: 'professionals',
          primaryColor: '#6366f1',
          secondaryColor: '#8b5cf6',
          style: aiStyle,
        }),
      });
      const data = await res.json() as { variations?: CoverVariation[]; error?: string };
      if (data.error) { setAiError(data.error); return; }
      setAiVariations(data.variations ?? []);
    } catch {
      setAiError('Failed to generate. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  }

  function applyVariation(v: CoverVariation, idx: number) {
    const content = applyLayout({
      title: coverInput.title || 'My Product',
      subtitle: coverInput.subtitle || '',
      author: coverInput.author || coverInput.brandName || '',
      brand: coverInput.brandName || '',
      variation: v,
    });
    onApply(content);
    setAppliedIdx(idx);
  }

  function applyPreset(v: CoverVariation) {
    const content = applyLayout({
      title: coverInput.title || 'My Product',
      subtitle: coverInput.subtitle || '',
      author: coverInput.author || coverInput.brandName || '',
      brand: coverInput.brandName || '',
      variation: v,
    });
    onApply(content);
  }

  const SCALE = 0.18;
  const miniW = Math.round(CANVAS_W * SCALE);
  const miniH = Math.round(CANVAS_H * SCALE);

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))]">
        {([
          { id: 'ai' as Tab, icon: Sparkles, label: 'AI' },
          { id: 'layouts' as Tab, icon: LayoutTemplate, label: 'Layouts' },
          { id: 'palettes' as Tab, icon: Palette, label: 'Palettes' },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
              tab === t.id
                ? "border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* AI Tab */}
        {tab === 'ai' && (
          <div className="space-y-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Generate unique cover designs using AI based on your product content.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[hsl(var(--foreground))]">Industry</label>
              <select
                className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs focus:outline-none"
                value={aiIndustry}
                onChange={e => setAiIndustry(e.target.value)}
              >
                {['Business', 'Health & Wellness', 'Finance', 'Technology', 'Education', 'Marketing', 'Creative Arts', 'Personal Development'].map(i => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[hsl(var(--foreground))]">Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['elegant', 'bold', 'minimal', 'creative', 'corporate', 'playful'].map(s => (
                  <button
                    key={s}
                    onClick={() => setAiStyle(s)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-[10px] font-medium capitalize transition-colors",
                      aiStyle === s
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                        : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground)/0.3)]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={generateVariations}
              disabled={aiGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {aiGenerating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {aiGenerating ? 'Generating...' : 'Generate 4 Designs'}
            </button>
            {aiError && <p className="text-xs text-red-500">{aiError}</p>}

            {aiVariations.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Results — click to apply</p>
                <div className="grid grid-cols-2 gap-2">
                  {aiVariations.map((v, i) => {
                    const content = applyLayout({
                      title: coverInput.title || 'Product',
                      subtitle: coverInput.subtitle || '',
                      author: coverInput.author || '',
                      brand: coverInput.brandName || '',
                      variation: v,
                    });
                    return (
                      <button
                        key={i}
                        onClick={() => applyVariation(v, i)}
                        className={cn(
                          "group relative rounded-lg overflow-hidden border-2 transition-all",
                          appliedIdx === i ? "border-[hsl(var(--primary))]" : "border-transparent hover:border-[hsl(var(--primary)/0.5)]"
                        )}
                        style={{ width: miniW, height: miniH }}
                        title={v.name}
                      >
                        <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                          <CoverCanvas content={content} />
                        </div>
                        {appliedIdx === i && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--primary)/0.2)]">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-[8px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">{v.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layouts Tab */}
        {tab === 'layouts' && (
          <div className="space-y-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Apply a layout template while keeping your current colors.</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LAYOUT_LABELS) as Array<keyof typeof LAYOUT_LABELS>).map(layout => {
                const variation: CoverVariation = {
                  ...PRESET_VARIATIONS[0],
                  layout,
                  background: currentContent.background,
                  textColors: {
                    title: (currentContent.elements.find(e => e.kind === 'text' && e.role === 'title') as { color: string } | undefined)?.color ?? '#ffffff',
                    subtitle: (currentContent.elements.find(e => e.kind === 'text' && e.role === 'subtitle') as { color: string } | undefined)?.color ?? 'rgba(255,255,255,0.8)',
                    author: (currentContent.elements.find(e => e.kind === 'text' && e.role === 'author') as { color: string } | undefined)?.color ?? 'rgba(255,255,255,0.6)',
                  },
                  accentColor: PRESET_VARIATIONS[0].accentColor,
                };
                const content = applyLayout({
                  title: coverInput.title || 'Product',
                  subtitle: coverInput.subtitle || '',
                  author: coverInput.author || '',
                  brand: coverInput.brandName || '',
                  variation,
                });
                return (
                  <button
                    key={layout}
                    onClick={() => onApply(content)}
                    className="group relative overflow-hidden rounded-lg border-2 border-transparent hover:border-[hsl(var(--primary)/0.5)] transition-all"
                    style={{ width: miniW, height: miniH }}
                    title={LAYOUT_LABELS[layout]}
                  >
                    <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      <CoverCanvas content={content} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-[8px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      {LAYOUT_LABELS[layout]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Palettes Tab */}
        {tab === 'palettes' && (
          <div className="space-y-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Apply a preset color palette to the current layout.</p>
            {PRESET_VARIATIONS.map((v, i) => (
              <button
                key={i}
                onClick={() => applyPreset(v)}
                className="group flex w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] px-3 py-2.5 text-left transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]"
              >
                <div
                  className="h-9 w-9 shrink-0 rounded-lg shadow-sm"
                  style={{
                    background: v.background.type === 'gradient' && v.background.gradient
                      ? `linear-gradient(135deg, ${v.background.gradient.stops[0]?.color}, ${v.background.gradient.stops[v.background.gradient.stops.length - 1]?.color})`
                      : v.background.color ?? '#6366f1',
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[hsl(var(--foreground))]">{v.name}</p>
                  <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{v.description}</p>
                </div>
                <div
                  className="ml-auto h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: v.accentColor }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
