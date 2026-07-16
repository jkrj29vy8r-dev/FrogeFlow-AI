"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database, DocumentType, Json } from "@/types/database";

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
  topic: z.string().min(10, "Topic must be at least 10 characters").max(500),
  audience: z.string().min(5, "Audience must be at least 5 characters").max(300),
  tone: z.enum(["professional", "conversational", "authoritative", "motivational"]),
  length: z.enum(["short", "medium", "long"]),
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to create a document." };
  }

  const raw = {
    type: formData.get("type"),
    topic: formData.get("topic"),
    audience: formData.get("audience"),
    tone: formData.get("tone"),
    length: formData.get("length"),
  };

  const parsed = createDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const { type, topic, audience, tone, length } = parsed.data;

  const title = topic.length > 60 ? topic.slice(0, 57) + "…" : topic;

  const insertRow: DocumentInsert = {
    user_id: user.id,
    title,
    type,
    content: { topic, audience, tone, length, sections: [] } as Json,
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
