"use client";

import type { CoverContent, CoverElement, TextElement, ShapeElement, CoverBackground, CoverFont } from "@/types/covers";
import { COVER_FONTS } from "@/types/covers";
import { cn } from "@/lib/utils";

interface Props {
  content: CoverContent;
  selectedId: string | null;
  onUpdateElement: (id: string, updates: Partial<CoverElement>) => void;
  onUpdateBackground: (bg: CoverBackground) => void;
}

const FONT_WEIGHTS = ['300', '400', '500', '600', '700', '800', '900'];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 54, 60, 72, 84];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 items-center gap-2">
      <label className="text-xs text-[hsl(var(--muted-foreground))]">{label}</label>
      {children}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={value.startsWith('#') ? value : '#ffffff'}
        onChange={e => onChange(e.target.value)}
        className="h-7 w-8 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs font-mono focus:outline-none"
      />
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
    />
  );
}

function TextElementPanel({ el, onUpdate }: { el: TextElement; onUpdate: (u: Partial<TextElement>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Text Content</p>
      <textarea
        className="w-full resize-none rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-2 text-xs focus:outline-none"
        rows={3}
        value={el.value}
        onChange={e => onUpdate({ value: e.target.value })}
      />

      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Typography</p>
      <Row label="Font">
        <select
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
          value={el.fontFamily}
          onChange={e => onUpdate({ fontFamily: e.target.value as CoverFont })}
        >
          {COVER_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Row>
      <Row label="Size">
        <select
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
          value={el.fontSize}
          onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
        </select>
      </Row>
      <Row label="Weight">
        <select
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
          value={el.fontWeight}
          onChange={e => onUpdate({ fontWeight: e.target.value })}
        >
          {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </Row>
      <Row label="Style">
        <select
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
          value={el.fontStyle}
          onChange={e => onUpdate({ fontStyle: e.target.value as 'normal' | 'italic' })}
        >
          <option value="normal">Normal</option>
          <option value="italic">Italic</option>
        </select>
      </Row>
      <Row label="Align">
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              onClick={() => onUpdate({ align: a })}
              className={cn("flex-1 rounded border py-1 text-[10px] capitalize transition-colors", el.align === a ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]")}
            >
              {a[0].toUpperCase()}
            </button>
          ))}
        </div>
      </Row>

      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Color & Effects</p>
      <Row label="Color">
        <ColorInput value={el.color} onChange={v => onUpdate({ color: v })} />
      </Row>
      <Row label="Opacity">
        <input type="range" min={0} max={1} step={0.05} value={el.opacity}
          onChange={e => onUpdate({ opacity: Number(e.target.value) })}
          className="w-full" />
      </Row>
      <Row label="Letter Sp.">
        <NumberInput value={el.letterSpacing} onChange={v => onUpdate({ letterSpacing: v })} min={-5} max={20} step={0.5} />
      </Row>
      <Row label="Line H.">
        <NumberInput value={el.lineHeight} onChange={v => onUpdate({ lineHeight: v })} min={0.8} max={3} step={0.05} />
      </Row>
      <Row label="Transform">
        <select
          className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
          value={el.textTransform}
          onChange={e => onUpdate({ textTransform: e.target.value as 'none' | 'uppercase' | 'lowercase' })}
        >
          <option value="none">None</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
        </select>
      </Row>

      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Position</p>
      <Row label="X (%)">
        <NumberInput value={Math.round(el.x)} onChange={v => onUpdate({ x: v })} min={0} max={90} />
      </Row>
      <Row label="Y (%)">
        <NumberInput value={Math.round(el.y)} onChange={v => onUpdate({ y: v })} min={0} max={95} />
      </Row>
      <Row label="Width (%)">
        <NumberInput value={Math.round(el.width)} onChange={v => onUpdate({ width: v })} min={10} max={100} />
      </Row>
    </div>
  );
}

function ShapeElementPanel({ el, onUpdate }: { el: ShapeElement; onUpdate: (u: Partial<ShapeElement>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Shape</p>
      <Row label="Color">
        <ColorInput value={el.color} onChange={v => onUpdate({ color: v })} />
      </Row>
      <Row label="Opacity">
        <input type="range" min={0} max={1} step={0.05} value={el.opacity}
          onChange={e => onUpdate({ opacity: Number(e.target.value) })}
          className="w-full" />
      </Row>
      <Row label="Rotation">
        <NumberInput value={el.rotation} onChange={v => onUpdate({ rotation: v })} min={-180} max={180} />
      </Row>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Position & Size</p>
      <Row label="X (%)"><NumberInput value={Math.round(el.x)} onChange={v => onUpdate({ x: v })} min={-50} max={100} /></Row>
      <Row label="Y (%)"><NumberInput value={Math.round(el.y)} onChange={v => onUpdate({ y: v })} min={-10} max={100} /></Row>
      <Row label="W (%)"><NumberInput value={Math.round(el.width)} onChange={v => onUpdate({ width: v })} min={1} max={150} /></Row>
      <Row label="H (%)"><NumberInput value={Math.round(el.height)} onChange={v => onUpdate({ height: v })} min={0.1} max={100} step={0.1} /></Row>
    </div>
  );
}

function BackgroundPanel({ bg, onUpdate }: { bg: CoverBackground; onUpdate: (b: CoverBackground) => void }) {
  const stops = bg.gradient?.stops ?? [{ color: '#6366f1', position: 0 }, { color: '#8b5cf6', position: 100 }];

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Background Type</p>
      <div className="grid grid-cols-3 gap-1">
        {(['gradient', 'solid', 'pattern'] as const).map(t => (
          <button
            key={t}
            onClick={() => onUpdate({ ...bg, type: t })}
            className={cn("rounded border py-1.5 text-[10px] font-medium capitalize transition-colors", bg.type === t ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]")}
          >
            {t}
          </button>
        ))}
      </div>

      {bg.type === 'gradient' && (
        <>
          <Row label="Angle">
            <NumberInput value={bg.gradient?.angle ?? 135} onChange={v => onUpdate({ ...bg, gradient: { stops, angle: v } })} min={0} max={360} />
          </Row>
          {stops.map((stop, i) => (
            <Row key={i} label={`Stop ${i + 1}`}>
              <div className="flex items-center gap-1.5">
                <ColorInput value={stop.color} onChange={c => {
                  const newStops = stops.map((s, si) => si === i ? { ...s, color: c } : s);
                  onUpdate({ ...bg, gradient: { stops: newStops, angle: bg.gradient?.angle ?? 135 } });
                }} />
                <NumberInput value={stop.position} onChange={p => {
                  const newStops = stops.map((s, si) => si === i ? { ...s, position: p } : s);
                  onUpdate({ ...bg, gradient: { stops: newStops, angle: bg.gradient?.angle ?? 135 } });
                }} min={0} max={100} />
              </div>
            </Row>
          ))}
        </>
      )}

      {bg.type === 'solid' && (
        <Row label="Color">
          <ColorInput value={bg.color ?? '#6366f1'} onChange={c => onUpdate({ ...bg, color: c })} />
        </Row>
      )}

      {bg.type === 'pattern' && (
        <>
          <Row label="Base Color">
            <ColorInput value={bg.color ?? '#6366f1'} onChange={c => onUpdate({ ...bg, color: c })} />
          </Row>
          <Row label="Pattern">
            <select
              className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs focus:outline-none"
              value={bg.pattern ?? 'dots'}
              onChange={e => onUpdate({ ...bg, pattern: e.target.value as 'dots' | 'grid' | 'diagonal' })}
            >
              <option value="dots">Dots</option>
              <option value="grid">Grid</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </Row>
          <Row label="Pattern Color">
            <ColorInput value={bg.patternColor ?? 'rgba(255,255,255,0.08)'} onChange={c => onUpdate({ ...bg, patternColor: c })} />
          </Row>
        </>
      )}
    </div>
  );
}

export function RightPanel({ content, selectedId, onUpdateElement, onUpdateBackground }: Props) {
  const selected = content.elements.find(e => e.id === selectedId);

  return (
    <aside className="flex h-full w-72 flex-shrink-0 flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="border-b border-[hsl(var(--border))] px-4 py-3">
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {selected ? (selected.kind === 'text' ? `Text — ${(selected as TextElement).role}` : `Shape — ${(selected as ShapeElement).shape}`) : 'Background'}
        </p>
        {!selected && <p className="text-xs text-[hsl(var(--muted-foreground))]">Click an element to select it</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!selected && (
          <BackgroundPanel
            bg={content.background}
            onUpdate={onUpdateBackground}
          />
        )}

        {selected?.kind === 'text' && (
          <TextElementPanel
            el={selected as TextElement}
            onUpdate={u => onUpdateElement(selected.id, u as Partial<CoverElement>)}
          />
        )}

        {selected?.kind === 'shape' && (
          <ShapeElementPanel
            el={selected as ShapeElement}
            onUpdate={u => onUpdateElement(selected.id, u as Partial<CoverElement>)}
          />
        )}
      </div>
    </aside>
  );
}
