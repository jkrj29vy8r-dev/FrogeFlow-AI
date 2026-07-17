"use client";

import { useRef, useCallback } from "react";
import type { CoverContent, CoverBackground, TextElement, ShapeElement, CoverElement } from "@/types/covers";

export const CANVAS_W = 600;
export const CANVAS_H = 900;

function getBgStyle(bg: CoverBackground): React.CSSProperties {
  if (bg.type === 'gradient' && bg.gradient) {
    const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ');
    return { background: `linear-gradient(${bg.gradient.angle}deg, ${stops})` };
  }
  if (bg.type === 'solid') return { background: bg.color ?? '#6366f1' };
  if (bg.type === 'pattern') {
    const base = bg.color ?? '#6366f1';
    const pat = bg.patternColor ?? 'rgba(255,255,255,0.08)';
    if (bg.pattern === 'dots') return { backgroundColor: base, backgroundImage: `radial-gradient(circle, ${pat} 1px, transparent 1px)`, backgroundSize: '20px 20px' };
    if (bg.pattern === 'grid') return { backgroundColor: base, backgroundImage: `linear-gradient(${pat} 1px, transparent 1px), linear-gradient(90deg, ${pat} 1px, transparent 1px)`, backgroundSize: '30px 30px' };
    if (bg.pattern === 'diagonal') return { backgroundColor: base, backgroundImage: `repeating-linear-gradient(45deg, ${pat} 0, ${pat} 1px, transparent 0, transparent 50%)`, backgroundSize: '20px 20px' };
    return { background: base };
  }
  return { background: '#6366f1' };
}

function getTextStyle(el: TextElement): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.width}%`,
    fontFamily: `'${el.fontFamily}', serif`,
    fontSize: `${el.fontSize}px`,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    color: el.color,
    textAlign: el.align,
    letterSpacing: `${el.letterSpacing}px`,
    lineHeight: el.lineHeight,
    textTransform: el.textTransform,
    opacity: el.opacity,
    textShadow: el.textShadow,
    zIndex: el.zIndex,
    margin: 0,
    padding: 0,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  };
}

function getShapeStyle(el: ShapeElement): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${el.x}%`,
    top: `${el.y}%`,
    width: `${el.width}%`,
    height: `${el.height}%`,
    backgroundColor: el.color,
    opacity: el.opacity,
    borderRadius: el.shape === 'circle' ? '50%' : `${el.borderRadius}px`,
    transform: `rotate(${el.rotation}deg)`,
    zIndex: el.zIndex,
  };
}

interface CoverCanvasProps {
  content: CoverContent;
  selectedId?: string | null;
  onSelectElement?: (id: string | null) => void;
  onUpdateElement?: (id: string, updates: Partial<CoverElement>) => void;
  interactive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function CoverCanvas({
  content,
  selectedId,
  onSelectElement,
  onUpdateElement,
  interactive = false,
  style,
  className,
}: CoverCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback((e: React.MouseEvent, el: CoverElement) => {
    if (!interactive || !onUpdateElement || !canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectElement?.(el.id);

    const rect = canvasRef.current.getBoundingClientRect();
    let lastX = e.clientX;
    let lastY = e.clientY;
    let cx = el.x;
    let cy = el.y;

    const onMove = (mv: MouseEvent) => {
      const dx = (mv.clientX - lastX) / rect.width * 100;
      const dy = (mv.clientY - lastY) / rect.height * 100;
      lastX = mv.clientX;
      lastY = mv.clientY;
      cx = Math.max(0, Math.min(90, cx + dx));
      cy = Math.max(0, Math.min(95, cy + dy));
      onUpdateElement(el.id, { x: cx, y: cy });
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [interactive, onUpdateElement, onSelectElement]);

  const sorted = [...content.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={canvasRef}
      onClick={() => onSelectElement?.(null)}
      style={{
        position: 'relative',
        width: CANVAS_W,
        height: CANVAS_H,
        overflow: 'hidden',
        flexShrink: 0,
        ...getBgStyle(content.background),
        ...style,
      }}
      className={className}
    >
      {content.background.overlay && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: content.background.overlay.color,
          opacity: content.background.overlay.opacity,
          zIndex: 0,
        }} />
      )}

      {sorted.map(el => {
        const isSelected = el.id === selectedId;
        const selectedStyle: React.CSSProperties = isSelected && interactive ? {
          outline: '2px dashed rgba(255,255,255,0.85)',
          outlineOffset: '3px',
          cursor: 'move',
        } : {};

        if (el.kind === 'text') {
          return (
            <div
              key={el.id}
              style={{ ...getTextStyle(el), cursor: interactive ? 'move' : 'default', ...selectedStyle }}
              onMouseDown={interactive ? (e) => startDrag(e, el) : undefined}
              onClick={interactive ? (e) => { e.stopPropagation(); onSelectElement?.(el.id); } : undefined}
            >
              {el.value}
            </div>
          );
        }

        if (el.kind === 'shape') {
          return (
            <div
              key={el.id}
              style={{ ...getShapeStyle(el), cursor: interactive ? 'move' : 'default', ...selectedStyle }}
              onMouseDown={interactive ? (e) => startDrag(e, el) : undefined}
              onClick={interactive ? (e) => { e.stopPropagation(); onSelectElement?.(el.id); } : undefined}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

export function CoverCanvasMini({ content, className }: { content: CoverContent; className?: string }) {
  return (
    <div className={`overflow-hidden ${className ?? ''}`} style={{ position: 'relative' }}>
      <div style={{ transform: `scale(${1})`, transformOrigin: 'top left' }}>
        <CoverCanvas content={content} />
      </div>
    </div>
  );
}
