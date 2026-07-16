import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OutlineView } from "@/features/documents/components/outline-view";

export const metadata: Metadata = {
  title: "Review Outline",
};

interface OutlinePageProps {
  params: Promise<{ id: string }>;
}

export default async function OutlinePage({ params }: OutlinePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (!document) notFound();

  return (
    <div className="px-4 py-8 sm:px-6">
      <OutlineView document={document} />
    </div>
  );
}
