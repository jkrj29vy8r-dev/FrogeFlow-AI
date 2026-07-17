import type { CoverContent, CoverBackground, TextElement, ShapeElement } from "@/types/covers";

const CANVAS_W = 600;
const CANVAS_H = 900;

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function bgCss(bg: CoverBackground): string {
  if (bg.type === 'gradient' && bg.gradient) {
    const stops = bg.gradient.stops.map(s => `${s.color} ${s.position}%`).join(', ');
    return `background: linear-gradient(${bg.gradient.angle}deg, ${stops});`;
  }
  if (bg.type === 'solid') return `background: ${bg.color ?? '#6366f1'};`;
  if (bg.type === 'pattern') {
    const base = bg.color ?? '#6366f1';
    const pat = bg.patternColor ?? 'rgba(255,255,255,0.08)';
    if (bg.pattern === 'dots') return `background-color:${base}; background-image:radial-gradient(circle, ${pat} 1px, transparent 1px); background-size:20px 20px;`;
    if (bg.pattern === 'grid') return `background-color:${base}; background-image:linear-gradient(${pat} 1px, transparent 1px), linear-gradient(90deg, ${pat} 1px, transparent 1px); background-size:30px 30px;`;
    if (bg.pattern === 'diagonal') return `background-color:${base}; background-image:repeating-linear-gradient(45deg, ${pat} 0, ${pat} 1px, transparent 0, transparent 50%); background-size:20px 20px;`;
    return `background:${base};`;
  }
  return 'background:#6366f1;';
}

function textElHtml(el: TextElement): string {
  const style = [
    `position:absolute`,
    `left:${el.x}%`,
    `top:${el.y}%`,
    `width:${el.width}%`,
    `font-family:'${el.fontFamily}',serif`,
    `font-size:${el.fontSize}px`,
    `font-weight:${el.fontWeight}`,
    `font-style:${el.fontStyle}`,
    `color:${el.color}`,
    `text-align:${el.align}`,
    `letter-spacing:${el.letterSpacing}px`,
    `line-height:${el.lineHeight}`,
    `text-transform:${el.textTransform}`,
    `opacity:${el.opacity}`,
    `z-index:${el.zIndex}`,
    `margin:0`,
    `padding:0`,
    `word-break:break-word`,
    el.textShadow ? `text-shadow:${el.textShadow}` : '',
  ].filter(Boolean).join(';');
  return `<div style="${style}">${escHtml(el.value)}</div>`;
}

function shapeElHtml(el: ShapeElement): string {
  const style = [
    `position:absolute`,
    `left:${el.x}%`,
    `top:${el.y}%`,
    `width:${el.width}%`,
    `height:${el.height}%`,
    `background:${el.color}`,
    `opacity:${el.opacity}`,
    `border-radius:${el.shape === 'circle' ? '50%' : `${el.borderRadius}px`}`,
    `transform:rotate(${el.rotation}deg)`,
    `z-index:${el.zIndex}`,
  ].join(';');
  return `<div style="${style}"></div>`;
}

export function buildCoverHtml(content: CoverContent, scale = 1): string {
  const w = CANVAS_W * scale;
  const h = CANVAS_H * scale;

  const sorted = [...content.elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementsHtml = sorted.map(el => {
    if (el.kind === 'text') return textElHtml(el);
    if (el.kind === 'shape') return shapeElHtml(el);
    return '';
  }).join('\n');

  const overlayHtml = content.background.overlay
    ? `<div style="position:absolute;inset:0;background:${content.background.overlay.color};opacity:${content.background.overlay.opacity};z-index:0;"></div>`
    : '';

  const fontFamilies = [...new Set(
    content.elements.filter((e): e is TextElement => e.kind === 'text').map(e => e.fontFamily)
  )];
  const fontUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400`).join('&')}&display=swap`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${fontUrl}" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${w}px; height: ${h}px; overflow: hidden; background: transparent; }
  #cover {
    position: relative;
    width: ${w}px;
    height: ${h}px;
    overflow: hidden;
    ${scale !== 1 ? '' : ''}
    ${bgCss(content.background)}
    ${scale !== 1 ? `transform: scale(${scale}); transform-origin: top left;` : ''}
  }
</style>
</head>
<body>
<div id="cover">
  ${overlayHtml}
  ${elementsHtml}
</div>
</body>
</html>`;
}
