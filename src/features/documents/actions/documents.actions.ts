"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database, DocumentType, Json } from "@/types/database";
import type { DocumentMetadata } from "@/features/documents/types";

type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];

const DOCUMENT_TYPES: DocumentType[] = [
  "ebook",
  "pdf_guide",
  "workbook",
  "checklist",
  "lead_magnet",
  "landing_page",
  "sales_page",
  "product_description",
  "marketing_content",
  "social_post",
  "email_campaign",
];

const createDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES as [DocumentType, ...DocumentType[]]),
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  audience: z.string().min(5, "Target audience must be at least 5 characters").max(300),
  language: z.string().min(2).max(50).default("English"),
  writing_style: z
    .enum(["narrative", "instructional", "conversational", "academic", "journalistic"])
    .default("instructional"),
  tone: z
    .enum(["professional", "conversational", "authoritative", "motivational", "friendly"])
    .default("professional"),
  knowledge_level: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .default("beginner"),
  length: z.enum(["short", "medium", "long", "comprehensive"]).default("medium"),
  goal: z.string().max(500).default(""),
  notes: z.string().max(1000).default(""),
});

export type CreateDocumentState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createDocument(
  _prevState: CreateDocumentState,
  formData: FormData
): Promise<CreateDocumentState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to create a document." };
  }

  const raw = {
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    audience: formData.get("audience"),
    language: formData.get("language") || "English",
    writing_style: formData.get("writing_style") || "instructional",
    tone: formData.get("tone") || "professional",
    knowledge_level: formData.get("knowledge_level") || "beginner",
    length: formData.get("length") || "medium",
    goal: formData.get("goal") || "",
    notes: formData.get("notes") || "",
  };

  const parsed = createDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const data = parsed.data;

  const metadata: DocumentMetadata = {
    title: data.title,
    description: data.description,
    audience: data.audience,
    language: data.language,
    writing_style: data.writing_style,
    tone: data.tone,
    knowledge_level: data.knowledge_level,
    length: data.length,
    goal: data.goal,
    notes: data.notes,
  };

  const insertRow: DocumentInsert = {
    user_id: user.id,
    title: data.title.length > 120 ? data.title.slice(0, 117) + "…" : data.title,
    type: data.type,
    content: metadata as unknown as Json,
    status: "draft",
  };

  const { data: doc, error } = await supabase
    .from("documents")
    .insert(insertRow)
    .select("id")
    .single();

  if (error || !doc) {
    return { error: "Failed to create document. Please try again." };
  }

  redirect(`/dashboard/documents/${doc.id}/outline`);
}

export async function renameDocument(id: string, title: string): Promise<{ error?: string }> {
  if (!title.trim()) return { error: "Title cannot be empty" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("documents")
    .update({ title: title.trim().slice(0, 200), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to rename document" };
  return {};
}

export async function duplicateDocument(id: string): Promise<{ error?: string; newId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc) return { error: "Document not found" };

  const { data: newDoc, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      title: `${doc.title} (Copy)`,
      type: doc.type,
      content: doc.content,
      status: "draft",
    } as DocumentInsert)
    .select("id")
    .single();

  if (error || !newDoc) return { error: "Failed to duplicate document" };
  return { newId: newDoc.id };
}

export async function deleteDocument(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to delete document" };
  return {};
}
