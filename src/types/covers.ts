export type ProductType = 'ebook' | 'guide' | 'workbook' | 'checklist' | 'lead_magnet';
export type LayoutType = 'centered' | 'bold' | 'minimal' | 'split' | 'professional' | 'creative';
export type CoverStyle = 'elegant' | 'bold' | 'minimal' | 'creative' | 'corporate' | 'playful';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ebook: 'eBook',
  guide: 'PDF Guide',
  workbook: 'Workbook',
  checklist: 'Checklist',
  lead_magnet: 'Lead Magnet',
};

export const LAYOUT_LABELS: Record<LayoutType, string> = {
  centered: 'Centered Classic',
  bold: 'Bold Modern',
  minimal: 'Minimal Light',
  split: 'Split Design',
  professional: 'Professional Dark',
  creative: 'Creative Edge',
};

export const COVER_FONTS = [
  'Playfair Display',
  'Montserrat',
  'Lato',
  'Poppins',
  'Merriweather',
  'Raleway',
] as const;

export type CoverFont = typeof COVER_FONTS[number];

export interface GradientStop {
  color: string;
  position: number;
}

export interface CoverBackground {
  type: 'gradient' | 'solid' | 'pattern';
  gradient?: {
    angle: number;
    stops: GradientStop[];
  };
  color?: string;
  pattern?: 'dots' | 'grid' | 'diagonal';
  patternColor?: string;
  overlay?: { color: string; opacity: number };
}

export interface TextElement {
  id: string;
  kind: 'text';
  role: 'title' | 'subtitle' | 'author' | 'brand' | 'tagline';
  value: string;
  x: number;
  y: number;
  width: number;
  fontFamily: CoverFont;
  fontSize: number;
  fontWeight: string;
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  textTransform: 'none' | 'uppercase' | 'lowercase';
  opacity: number;
  textShadow?: string;
  zIndex: number;
}

export interface ShapeElement {
  id: string;
  kind: 'shape';
  shape: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  borderRadius: number;
  rotation: number;
  zIndex: number;
}

export type CoverElement = TextElement | ShapeElement;

export interface CoverContent {
  layout: LayoutType;
  background: CoverBackground;
  elements: CoverElement[];
}

export interface CoverVariation {
  name: string;
  description: string;
  layout: LayoutType;
  background: CoverBackground;
  textColors: { title: string; subtitle: string; author: string };
  accentColor: string;
  fonts: { title: CoverFont; subtitle: CoverFont; author: CoverFont };
}

export interface CoverInput {
  title: string;
  subtitle: string;
  author: string;
  brandName: string;
  productType: ProductType;
  industry: string;
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  style: CoverStyle;
}

export interface Cover {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  product_type: ProductType;
  content: CoverContent;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export const COLOR_PALETTES = [
  { name: 'Midnight', colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'] },
  { name: 'Ocean', colors: ['#0d1b2a', '#1b4332', '#40916c', '#95d5b2'] },
  { name: 'Violet', colors: ['#240046', '#5a189a', '#9d4edd', '#e0aaff'] },
  { name: 'Sunrise', colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'] },
  { name: 'Slate', colors: ['#1e293b', '#334155', '#64748b', '#f1f5f9'] },
  { name: 'Rose', colors: ['#881337', '#be123c', '#fb7185', '#fda4af'] },
  { name: 'Forest', colors: ['#1b4332', '#2d6a4f', '#52b788', '#d8f3dc'] },
  { name: 'Gold', colors: ['#1c1610', '#78350f', '#d97706', '#fef3c7'] },
  { name: 'Indigo', colors: ['#1e1b4b', '#3730a3', '#6366f1', '#e0e7ff'] },
  { name: 'Sand', colors: ['#292524', '#78716c', '#d6d3d1', '#fafaf9'] },
] as const;

export const EXPORT_FORMATS = ['png', 'jpg', 'pdf', 'svg'] as const;
export type ExportFormat = typeof EXPORT_FORMATS[number];
