// ── Enums ─────────────────────────────────────────────────────────────────────

export type LandingPageType = 'landing' | 'sales' | 'lead_magnet' | 'thank_you' | 'coming_soon';

export type SectionType =
  | 'hero'
  | 'pain_points'
  | 'solution'
  | 'features'
  | 'benefits'
  | 'how_it_works'
  | 'testimonials'
  | 'pricing'
  | 'faq'
  | 'guarantee'
  | 'about'
  | 'cta'
  | 'footer';

export type CopywritingFramework = 'AIDA' | 'PAS' | 'BAB' | 'StoryBrand';

export type WritingTone =
  | 'professional'
  | 'friendly'
  | 'bold'
  | 'empathetic'
  | 'urgent'
  | 'inspirational'
  | 'conversational';

// ── Page & Section models ─────────────────────────────────────────────────────

export interface LandingPageSeo {
  title: string;
  description: string;
  og_title: string;
  og_description: string;
  twitter_title: string;
  twitter_description: string;
  canonical_path: string;
  schema: Record<string, unknown>;
}

export interface LandingPageSettings {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface LandingPageInput {
  pageType: LandingPageType;
  productName: string;
  description: string;
  targetAudience: string;
  industry: string;
  tone: WritingTone;
  framework: CopywritingFramework;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  cta: string;
  testimonials?: string;
  faqs?: string;
}

export interface LandingPage {
  id: string;
  user_id: string;
  name: string;
  page_type: LandingPageType;
  status: 'draft' | 'published';
  input: LandingPageInput;
  seo: LandingPageSeo;
  settings: LandingPageSettings;
  created_at: string;
  updated_at: string;
}

export interface LandingPageSection {
  id: string;
  page_id: string;
  user_id: string;
  section_type: SectionType;
  position: number;
  is_visible: boolean;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Section content types ─────────────────────────────────────────────────────

export interface HeroContent {
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  socialProof?: string;
}

export interface PainPointsContent {
  headline: string;
  subheadline?: string;
  items: { emoji: string; title: string; description: string }[];
}

export interface SolutionContent {
  headline: string;
  subheadline?: string;
  description: string;
  points: string[];
}

export interface FeaturesContent {
  headline: string;
  subheadline?: string;
  items: { title: string; description: string; badge?: string }[];
}

export interface BenefitsContent {
  headline: string;
  subheadline?: string;
  items: { icon: string; title: string; description: string }[];
}

export interface HowItWorksContent {
  headline: string;
  subheadline?: string;
  steps: { step: string; title: string; description: string }[];
}

export interface TestimonialsContent {
  headline: string;
  subheadline?: string;
  items: { name: string; role: string; company?: string; quote: string; rating?: number }[];
}

export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingContent {
  headline: string;
  subheadline?: string;
  plans: PricingPlan[];
}

export interface FAQContent {
  headline: string;
  subheadline?: string;
  items: { question: string; answer: string }[];
}

export interface GuaranteeContent {
  headline: string;
  description: string;
  badge?: string;
  period?: string;
}

export interface AboutContent {
  headline: string;
  description: string;
  stats?: { value: string; label: string }[];
}

export interface CTAContent {
  headline: string;
  subheadline?: string;
  primaryCta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
}

export interface FooterContent {
  companyName: string;
  tagline?: string;
  links?: { label: string; href: string }[];
  copyright: string;
}

// ── Section content union (for type-safe casting) ─────────────────────────────

export type AnySectionContent =
  | HeroContent
  | PainPointsContent
  | SolutionContent
  | FeaturesContent
  | BenefitsContent
  | HowItWorksContent
  | TestimonialsContent
  | PricingContent
  | FAQContent
  | GuaranteeContent
  | AboutContent
  | CTAContent
  | FooterContent;

// ── Constants ─────────────────────────────────────────────────────────────────

export const PAGE_TYPE_LABELS: Record<LandingPageType, string> = {
  landing: 'Landing Page',
  sales: 'Sales Page',
  lead_magnet: 'Lead Magnet Page',
  thank_you: 'Thank You Page',
  coming_soon: 'Coming Soon Page',
};

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero',
  pain_points: 'Pain Points',
  solution: 'Solution',
  features: 'Features',
  benefits: 'Benefits',
  how_it_works: 'How It Works',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  faq: 'FAQ',
  guarantee: 'Guarantee',
  about: 'About',
  cta: 'Call to Action',
  footer: 'Footer',
};

export const FRAMEWORK_LABELS: Record<CopywritingFramework, string> = {
  AIDA: 'AIDA (Attention, Interest, Desire, Action)',
  PAS: 'PAS (Problem, Agitate, Solution)',
  BAB: 'BAB (Before, After, Bridge)',
  StoryBrand: 'StoryBrand (Clarify Your Message)',
};

export const TONE_LABELS: Record<WritingTone, string> = {
  professional: 'Professional',
  friendly: 'Friendly & Approachable',
  bold: 'Bold & Direct',
  empathetic: 'Empathetic',
  urgent: 'Urgent & Persuasive',
  inspirational: 'Inspirational',
  conversational: 'Conversational',
};

export const DEFAULT_SECTIONS_BY_TYPE: Record<LandingPageType, SectionType[]> = {
  landing: ['hero', 'benefits', 'features', 'how_it_works', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
  sales: ['hero', 'pain_points', 'solution', 'features', 'testimonials', 'pricing', 'guarantee', 'faq', 'cta', 'footer'],
  lead_magnet: ['hero', 'benefits', 'how_it_works', 'testimonials', 'cta', 'footer'],
  thank_you: ['hero', 'about', 'cta', 'footer'],
  coming_soon: ['hero', 'features', 'cta', 'footer'],
};

export const EXPORT_FORMAT_LABELS = {
  html: 'HTML File',
  react: 'React Component',
  nextjs: 'Next.js Page',
  markdown: 'Markdown',
} as const;

export type ExportFormat = keyof typeof EXPORT_FORMAT_LABELS;
