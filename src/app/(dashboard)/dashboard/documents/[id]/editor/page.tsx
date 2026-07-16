import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/features/documents/components/content-editor";
import type { DocumentWithGeneration, Section } from "@/types/database";

export const metadata: Metadata = {
  title: "Editor",
};

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!document) notFound();

  const doc = document as unknown as DocumentWithGeneration;

  // If not at least outline_ready, redirect to outline
  if (
    doc.generation_status === "pending" ||
    doc.generation_status === "generating_outline"
  ) {
    redirect(`/dashboard/documents/${id}/outline`);
  }

  const { data: sectionsRaw } = await supabase
    .from("sections" as never)
    .select("*")
    .eq("document_id", id)
    .eq("user_id", user.id)
    .order("position", { ascending: true }) as { data: Section[] | null; error: unknown };

  const sections: Section[] = sectionsRaw ?? [];

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <ContentEditor document={doc} initialSections={sections} />
    </div>
  );
}
