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
          plan: "free" | "pro" | "enterprise";
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "enterprise";
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
          status: "draft" | "published" | "archived";
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
          status?: "draft" | "published" | "archived";
          word_count?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          type?: DocumentType;
          content?: Json;
          status?: "draft" | "published" | "archived";
          word_count?: number;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      document_type: DocumentType;
      plan_type: "free" | "pro" | "enterprise";
    };
  };
}

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
