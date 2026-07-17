import type { CoverContent, CoverVariation, LayoutType } from "@/types/covers";

export interface LayoutInput {
  title: string;
  subtitle: string;
  author: string;
  brand: string;
  variation: CoverVariation;
}

export function applyLayout(input: LayoutInput): CoverContent {
  const builders: Record<LayoutType, (i: LayoutInput) => CoverContent> = {
    centered: centeredLayout,
    bold: boldLayout,
    minimal: minimalLayout,
    split: splitLayout,
    professional: professionalLayout,
    creative: creativeLayout,
  };
  return (builders[input.variation.layout] ?? centeredLayout)(input);
}

function centeredLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  return {
    layout: 'centered',
    background: v.background,
    elements: [
      { id: 'deco-top', kind: 'shape', shape: 'rect', x: 35, y: 11, width: 30, height: 0.45, color: v.accentColor, opacity: 0.9, borderRadius: 2, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 8, y: 15, width: 84, fontFamily: v.fonts.author, fontSize: 11, fontWeight: '500', fontStyle: 'normal', color: v.textColors.author, align: 'center', letterSpacing: 4, lineHeight: 1, textTransform: 'uppercase', opacity: 0.7, zIndex: 2 } : null,
      { id: 'title', kind: 'text', role: 'title', value: title, x: 8, y: 28, width: 84, fontFamily: v.fonts.title, fontSize: 54, fontWeight: '700', fontStyle: 'normal', color: v.textColors.title, align: 'center', letterSpacing: -0.5, lineHeight: 1.15, textTransform: 'none', opacity: 1, zIndex: 3 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 10, y: 62, width: 80, fontFamily: v.fonts.subtitle, fontSize: 18, fontWeight: '300', fontStyle: 'normal', color: v.textColors.subtitle, align: 'center', letterSpacing: 0.3, lineHeight: 1.5, textTransform: 'none', opacity: 1, zIndex: 2 } : null,
      { id: 'deco-div', kind: 'shape', shape: 'rect', x: 40, y: 83, width: 20, height: 0.3, color: v.textColors.author, opacity: 0.4, borderRadius: 0, rotation: 0, zIndex: 1 },
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 8, y: 86, width: 84, fontFamily: v.fonts.author, fontSize: 13, fontWeight: '400', fontStyle: 'normal', color: v.textColors.author, align: 'center', letterSpacing: 2.5, lineHeight: 1.2, textTransform: 'uppercase', opacity: 0.8, zIndex: 2 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
}

function boldLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  return {
    layout: 'bold',
    background: v.background,
    elements: [
      { id: 'accent-bar', kind: 'shape', shape: 'rect', x: 0, y: 0, width: 8, height: 100, color: v.accentColor, opacity: 1, borderRadius: 0, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 14, y: 12, width: 78, fontFamily: v.fonts.author, fontSize: 10, fontWeight: '600', fontStyle: 'normal', color: v.textColors.author, align: 'left', letterSpacing: 5, lineHeight: 1, textTransform: 'uppercase', opacity: 0.6, zIndex: 2 } : null,
      { id: 'title', kind: 'text', role: 'title', value: title, x: 14, y: 22, width: 78, fontFamily: v.fonts.title, fontSize: 62, fontWeight: '900', fontStyle: 'normal', color: v.textColors.title, align: 'left', letterSpacing: -1, lineHeight: 1.1, textTransform: 'none', opacity: 1, zIndex: 3 },
      { id: 'deco-line', kind: 'shape', shape: 'rect', x: 14, y: 72, width: 40, height: 0.5, color: v.accentColor, opacity: 1, borderRadius: 0, rotation: 0, zIndex: 2 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 14, y: 76, width: 76, fontFamily: v.fonts.subtitle, fontSize: 17, fontWeight: '400', fontStyle: 'normal', color: v.textColors.subtitle, align: 'left', letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', opacity: 1, zIndex: 2 } : null,
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 14, y: 90, width: 76, fontFamily: v.fonts.author, fontSize: 12, fontWeight: '400', fontStyle: 'normal', color: v.textColors.author, align: 'left', letterSpacing: 2, lineHeight: 1.2, textTransform: 'uppercase', opacity: 0.7, zIndex: 2 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
}

function minimalLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  return {
    layout: 'minimal',
    background: v.background,
    elements: [
      { id: 'deco-dot1', kind: 'shape', shape: 'circle', x: 12, y: 10, width: 4, height: 2.5, color: v.accentColor, opacity: 0.4, borderRadius: 50, rotation: 0, zIndex: 1 },
      { id: 'deco-dot2', kind: 'shape', shape: 'circle', x: 84, y: 8, width: 6, height: 4, color: v.accentColor, opacity: 0.2, borderRadius: 50, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 12, y: 22, width: 76, fontFamily: v.fonts.author, fontSize: 10, fontWeight: '400', fontStyle: 'normal', color: v.textColors.author, align: 'left', letterSpacing: 6, lineHeight: 1, textTransform: 'uppercase', opacity: 0.5, zIndex: 2 } : null,
      { id: 'deco-bar', kind: 'shape', shape: 'rect', x: 12, y: 28, width: 12, height: 0.35, color: v.accentColor, opacity: 1, borderRadius: 0, rotation: 0, zIndex: 2 },
      { id: 'title', kind: 'text', role: 'title', value: title, x: 12, y: 33, width: 76, fontFamily: v.fonts.title, fontSize: 46, fontWeight: '400', fontStyle: 'italic', color: v.textColors.title, align: 'left', letterSpacing: 0, lineHeight: 1.2, textTransform: 'none', opacity: 1, zIndex: 3 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 12, y: 66, width: 70, fontFamily: v.fonts.subtitle, fontSize: 16, fontWeight: '300', fontStyle: 'normal', color: v.textColors.subtitle, align: 'left', letterSpacing: 0.5, lineHeight: 1.6, textTransform: 'none', opacity: 1, zIndex: 2 } : null,
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 12, y: 90, width: 76, fontFamily: v.fonts.author, fontSize: 12, fontWeight: '300', fontStyle: 'normal', color: v.textColors.author, align: 'left', letterSpacing: 1.5, lineHeight: 1.2, textTransform: 'none', opacity: 0.6, zIndex: 2 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
}

function splitLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  const bottomColor = v.background.gradient?.stops[1]?.color ?? '#ffffff';
  return {
    layout: 'split',
    background: v.background,
    elements: [
      { id: 'split-bottom', kind: 'shape', shape: 'rect', x: 0, y: 58, width: 100, height: 42, color: 'rgba(255,255,255,0.97)', opacity: 1, borderRadius: 0, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 8, y: 8, width: 84, fontFamily: v.fonts.author, fontSize: 10, fontWeight: '500', fontStyle: 'normal', color: 'rgba(255,255,255,0.8)', align: 'left', letterSpacing: 5, lineHeight: 1, textTransform: 'uppercase', opacity: 1, zIndex: 3 } : null,
      { id: 'title', kind: 'text', role: 'title', value: title, x: 8, y: 20, width: 84, fontFamily: v.fonts.title, fontSize: 52, fontWeight: '700', fontStyle: 'normal', color: '#ffffff', align: 'left', letterSpacing: -0.5, lineHeight: 1.15, textTransform: 'none', opacity: 1, zIndex: 3 },
      { id: 'deco-accent', kind: 'shape', shape: 'rect', x: 8, y: 57, width: 30, height: 0.55, color: v.accentColor, opacity: 1, borderRadius: 0, rotation: 0, zIndex: 4 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 8, y: 65, width: 84, fontFamily: v.fonts.subtitle, fontSize: 17, fontWeight: '400', fontStyle: 'normal', color: '#1e293b', align: 'left', letterSpacing: 0, lineHeight: 1.5, textTransform: 'none', opacity: 1, zIndex: 3 } : null,
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 8, y: 88, width: 84, fontFamily: v.fonts.author, fontSize: 12, fontWeight: '400', fontStyle: 'normal', color: '#64748b', align: 'left', letterSpacing: 2, lineHeight: 1.2, textTransform: 'uppercase', opacity: 1, zIndex: 3 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
  void bottomColor;
}

function professionalLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  return {
    layout: 'professional',
    background: v.background,
    elements: [
      { id: 'top-bar', kind: 'shape', shape: 'rect', x: 0, y: 0, width: 100, height: 8, color: v.accentColor, opacity: 1, borderRadius: 0, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 8, y: 2, width: 84, fontFamily: v.fonts.author, fontSize: 11, fontWeight: '600', fontStyle: 'normal', color: '#ffffff', align: 'center', letterSpacing: 3, lineHeight: 1, textTransform: 'uppercase', opacity: 1, zIndex: 3 } : null,
      { id: 'deco-circle1', kind: 'shape', shape: 'circle', x: -8, y: 20, width: 30, height: 18, color: 'rgba(255,255,255,0.04)', opacity: 1, borderRadius: 50, rotation: 0, zIndex: 1 },
      { id: 'deco-circle2', kind: 'shape', shape: 'circle', x: 78, y: 60, width: 35, height: 22, color: 'rgba(255,255,255,0.04)', opacity: 1, borderRadius: 50, rotation: 0, zIndex: 1 },
      { id: 'title', kind: 'text', role: 'title', value: title, x: 8, y: 32, width: 84, fontFamily: v.fonts.title, fontSize: 50, fontWeight: '700', fontStyle: 'normal', color: v.textColors.title, align: 'center', letterSpacing: -0.5, lineHeight: 1.2, textTransform: 'none', opacity: 1, zIndex: 3 },
      { id: 'deco-diamond', kind: 'shape', shape: 'rect', x: 45, y: 64, width: 10, height: 0.5, color: v.accentColor, opacity: 1, borderRadius: 2, rotation: 45, zIndex: 2 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 10, y: 70, width: 80, fontFamily: v.fonts.subtitle, fontSize: 16, fontWeight: '300', fontStyle: 'normal', color: v.textColors.subtitle, align: 'center', letterSpacing: 0.5, lineHeight: 1.5, textTransform: 'none', opacity: 1, zIndex: 2 } : null,
      { id: 'bottom-bar', kind: 'shape', shape: 'rect', x: 0, y: 93, width: 100, height: 7, color: v.accentColor, opacity: 0.3, borderRadius: 0, rotation: 0, zIndex: 1 },
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 8, y: 94, width: 84, fontFamily: v.fonts.author, fontSize: 12, fontWeight: '400', fontStyle: 'normal', color: v.textColors.author, align: 'center', letterSpacing: 2, lineHeight: 1.2, textTransform: 'uppercase', opacity: 0.9, zIndex: 3 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
}

function creativeLayout({ title, subtitle, author, brand, variation: v }: LayoutInput): CoverContent {
  return {
    layout: 'creative',
    background: v.background,
    elements: [
      { id: 'deco-diag', kind: 'shape', shape: 'rect', x: -20, y: 60, width: 140, height: 30, color: v.accentColor, opacity: 0.12, borderRadius: 0, rotation: -12, zIndex: 1 },
      { id: 'deco-circle', kind: 'shape', shape: 'circle', x: 60, y: 5, width: 50, height: 30, color: 'rgba(255,255,255,0.06)', opacity: 1, borderRadius: 50, rotation: 0, zIndex: 1 },
      brand ? { id: 'brand', kind: 'text', role: 'brand', value: brand, x: 8, y: 10, width: 50, fontFamily: v.fonts.author, fontSize: 10, fontWeight: '600', fontStyle: 'normal', color: v.accentColor, align: 'left', letterSpacing: 4, lineHeight: 1, textTransform: 'uppercase', opacity: 1, zIndex: 3 } : null,
      { id: 'title', kind: 'text', role: 'title', value: title, x: 8, y: 30, width: 86, fontFamily: v.fonts.title, fontSize: 58, fontWeight: '800', fontStyle: 'normal', color: v.textColors.title, align: 'left', letterSpacing: -1.5, lineHeight: 1.1, textTransform: 'none', opacity: 1, zIndex: 3 },
      { id: 'deco-accent-bar', kind: 'shape', shape: 'rect', x: 8, y: 73, width: 6, height: 6, color: v.accentColor, opacity: 1, borderRadius: 1, rotation: 0, zIndex: 2 },
      subtitle ? { id: 'subtitle', kind: 'text', role: 'subtitle', value: subtitle, x: 18, y: 74, width: 74, fontFamily: v.fonts.subtitle, fontSize: 16, fontWeight: '400', fontStyle: 'normal', color: v.textColors.subtitle, align: 'left', letterSpacing: 0, lineHeight: 1.4, textTransform: 'none', opacity: 1, zIndex: 2 } : null,
      author ? { id: 'author', kind: 'text', role: 'author', value: author, x: 8, y: 91, width: 84, fontFamily: v.fonts.author, fontSize: 12, fontWeight: '300', fontStyle: 'italic', color: v.textColors.author, align: 'left', letterSpacing: 1, lineHeight: 1.2, textTransform: 'none', opacity: 0.7, zIndex: 2 } : null,
    ].filter(Boolean) as CoverContent['elements'],
  };
}

export const DEFAULT_VARIATION: CoverVariation = {
  name: 'Deep Ocean',
  description: 'Dark and professional',
  layout: 'centered',
  background: {
    type: 'gradient',
    gradient: { angle: 135, stops: [{ color: '#1a1a2e', position: 0 }, { color: '#16213e', position: 50 }, { color: '#0f3460', position: 100 }] },
  },
  textColors: { title: '#ffffff', subtitle: 'rgba(255,255,255,0.8)', author: 'rgba(255,255,255,0.55)' },
  accentColor: '#e94560',
  fonts: { title: 'Playfair Display', subtitle: 'Lato', author: 'Montserrat' },
};
