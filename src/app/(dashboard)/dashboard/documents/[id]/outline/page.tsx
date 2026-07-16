import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OutlineView } from "@/features/documents/components/outline-view";
import type { DocumentWithGeneration, Section } from "@/types/database";

export const metadata: Metadata = {
  title: "Review Outline",
};

interface OutlinePageProps {
  params: Promise<{ id: string }>;
}

export default async function OutlinePage({ params }: OutlinePageProps) {
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

  // If already completed, redirect to editor
  const doc = document as unknown as DocumentWithGeneration;
  if (doc.generation_status === "completed") {
    redirect(`/dashboard/documents/${id}/editor`);
  }

  // Fetch existing sections
  const { data: sectionsRaw } = await supabase
    .from("sections" as never)
    .select("*")
    .eq("document_id", id)
    .eq("user_id", user.id)
    .order("position", { ascending: true }) as { data: Section[] | null; error: unknown };

  const sections: Section[] = sectionsRaw ?? [];

  return (
    <div className="px-4 py-8 sm:px-6">
      <OutlineView document={doc} initialSections={sections} />
    </div>
  );
}
