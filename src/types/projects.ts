export type ProjectStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
export type AssetStatus = 'pending' | 'generating' | 'completed' | 'failed';

export type AssetType =
  | 'ebook_outline'
  | 'workbook'
  | 'checklist'
  | 'lead_magnet'
  | 'landing_page'
  | 'sales_page'
  | 'email_sequence'
  | 'social_media_pack'
  | 'ai_cover'
  | 'product_description'
  | 'seo_metadata'
  | 'faq'
  | 'cta_pack'
  | 'download_page';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  ebook_outline: 'eBook',
  workbook: 'Workbook',
  checklist: 'Checklist',
  lead_magnet: 'Lead Magnet',
  landing_page: 'Landing Page',
  sales_page: 'Sales Page',
  email_sequence: 'Email Sequence',
  social_media_pack: 'Social Media Pack',
  ai_cover: 'AI Cover',
  product_description: 'Product Description',
  seo_metadata: 'SEO Metadata',
  faq: 'FAQ',
  cta_pack: 'Call To Actions',
  download_page: 'Download Page',
};

export const ASSET_TYPE_ICONS: Record<AssetType, string> = {
  ebook_outline: '📖',
  workbook: '📝',
  checklist: '✅',
  lead_magnet: '🧲',
  landing_page: '🌐',
  sales_page: '💰',
  email_sequence: '📧',
  social_media_pack: '📱',
  ai_cover: '🎨',
  product_description: '📄',
  seo_metadata: '🔍',
  faq: '❓',
  cta_pack: '📣',
  download_page: '⬇️',
};

export const GENERATION_ORDER: AssetType[] = [
  'product_description',
  'seo_metadata',
  'ebook_outline',
  'workbook',
  'checklist',
  'lead_magnet',
  'email_sequence',
  'social_media_pack',
  'ai_cover',
  'faq',
  'cta_pack',
  'landing_page',
  'sales_page',
  'download_page',
];

export interface ProjectInput {
  productIdea: string;
  targetAudience: string;
  language: string;
  tone: string;
  industry: string;
  goal: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  status: ProjectStatus;
  input: ProjectInput;
  ai_usage: AiUsage;
  credits_used: number;
  created_at: string;
  updated_at: string;
}

// Asset content types

export interface EbookOutlineContent {
  title: string;
  subtitle: string;
  introduction: string;
  chapters: Array<{ number: number; title: string; description: string; keyPoints: string[] }>;
  conclusion: string;
  callToAction: string;
}

export interface WorkbookContent {
  title: string;
  introduction: string;
  modules: Array<{
    title: string;
    objective: string;
    exercises: Array<{ title: string; prompt: string; fieldCount: number }>;
  }>;
}

export interface ChecklistContent {
  title: string;
  description: string;
  sections: Array<{ title: string; items: Array<{ text: string; note?: string }> }>;
}

export interface LeadMagnetContent {
  title: string;
  subtitle: string;
  hook: string;
  sections: Array<{ heading: string; content: string; tip?: string }>;
  cta: string;
}

export interface EmailSequenceContent {
  emails: Array<{
    subject: string;
    preheader: string;
    body: string;
    cta: string;
    delay: string;
  }>;
}

export interface SocialMediaPackContent {
  posts: Array<{
    platform: 'instagram' | 'linkedin' | 'twitter' | 'facebook';
    caption: string;
    hashtags: string[];
    hook: string;
  }>;
}

export interface AiCoverContent {
  title: string;
  subtitle: string;
  authorName: string;
  tagline: string;
  style: 'minimal' | 'bold' | 'professional' | 'creative';
  primaryColor: string;
  secondaryColor: string;
}

export interface ProductDescriptionContent {
  headline: string;
  subheadline: string;
  shortDescription: string;
  longDescription: string;
  bulletPoints: string[];
  targetAudience: string;
  uniqueValueProp: string;
}

export interface SeoMetadataContent {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  structuredData: object;
}

export interface FaqContent {
  items: Array<{ question: string; answer: string }>;
}

export interface CtaPackContent {
  ctas: Array<{
    context: string;
    primary: string;
    secondary: string;
    microcopy: string;
  }>;
}

export interface DownloadPageContent {
  headline: string;
  subheadline: string;
  thankYouMessage: string;
  deliverableTitle: string;
  downloadInstructions: string;
  bonusItems: Array<{ title: string; description: string }>;
  nextSteps: string[];
  cta: string;
}

export type AssetContent =
  | EbookOutlineContent
  | WorkbookContent
  | ChecklistContent
  | LeadMagnetContent
  | EmailSequenceContent
  | SocialMediaPackContent
  | AiCoverContent
  | ProductDescriptionContent
  | SeoMetadataContent
  | FaqContent
  | CtaPackContent
  | DownloadPageContent;

export interface ProjectAsset {
  id: string;
  project_id: string;
  user_id: string;
  asset_type: AssetType;
  name: string;
  status: AssetStatus;
  content: AssetContent | null;
  error: string | null;
  landing_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithAssets extends Project {
  assets: ProjectAsset[];
}
