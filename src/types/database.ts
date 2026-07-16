export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Relationships: [];
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          username: string | null;
          language: string;
          timezone: string;
          last_login: string | null;
          plan: PlanType;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          language?: string;
          timezone?: string;
          last_login?: string | null;
          plan?: PlanType;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          username?: string | null;
          language?: string;
          timezone?: string;
          last_login?: string | null;
          plan?: PlanType;
          credits?: number;
          updated_at?: string;
        };
      };
      documents: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: DocumentType;
          content: Json;
          status: DocumentStatus;
          word_count: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          type: DocumentType;
          content?: Json;
          status?: DocumentStatus;
          word_count?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          type?: DocumentType;
          content?: Json;
          status?: DocumentStatus;
          word_count?: number;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          price_id: string;
          quantity: number;
          cancel_at_period_end: boolean;
          current_period_start: string;
          current_period_end: string;
          cancel_at: string | null;
          canceled_at: string | null;
          trial_start: string | null;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          status: SubscriptionStatus;
          price_id: string;
          quantity?: number;
          cancel_at_period_end?: boolean;
          current_period_start: string;
          current_period_end: string;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: SubscriptionStatus;
          price_id?: string;
          quantity?: number;
          cancel_at_period_end?: boolean;
          current_period_start?: string;
          current_period_end?: string;
          cancel_at?: string | null;
          canceled_at?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          updated_at?: string;
        };
      };
      usage_events: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          event_type: UsageEventType;
          credits_used: number;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          event_type: UsageEventType;
          credits_used?: number;
          metadata?: Json;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      document_type: DocumentType;
      plan_type: PlanType;
    };
  };
}

// ── Shared union types ────────────────────────────────────────────────────────

export type PlanType = "free" | "pro" | "enterprise";

export type DocumentType =
  | "ebook"
  | "pdf_guide"
  | "workbook"
  | "checklist"
  | "lead_magnet"
  | "landing_page"
  | "sales_page"
  | "product_description"
  | "marketing_content"
  | "social_post"
  | "email_campaign";

export type DocumentStatus = "draft" | "published" | "archived";

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused";

export type UsageEventType =
  | "outline_generated"
  | "section_generated"
  | "export_pdf"
  | "export_html"
  | "document_created";

export type GenerationStatus =
  | "pending"
  | "generating_outline"
  | "outline_ready"
  | "generating_content"
  | "completed"
  | "failed"
  | "cancelled";

export type SectionType =
  | "introduction"
  | "chapter"
  | "subchapter"
  | "conclusion"
  | "cta"
  | "checklist_group"
  | "exercise"
  | "tips";

export type SectionGenerationStatus = "pending" | "generating" | "completed" | "failed";

// ── Row helpers (convenience shorthand) ──────────────────────────────────────

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type UsageEvent = Database["public"]["Tables"]["usage_events"]["Row"];

// ── AI Engine types (not in DB interface yet — added by migration) ────────────

export interface Section {
  id: string;
  document_id: string;
  user_id: string;
  position: number;
  title: string;
  content: string;
  section_type: SectionType;
  description: string;
  word_count: number;
  is_generated: boolean;
  generation_status: SectionGenerationStatus;
  ai_metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SectionVersion {
  id: string;
  section_id: string;
  document_id: string;
  user_id: string;
  content: string;
  word_count: number;
  version: number;
  created_at: string;
}

export interface DocumentWithGeneration extends Document {
  generation_status: GenerationStatus;
  ai_metadata: Record<string, unknown>;
}
