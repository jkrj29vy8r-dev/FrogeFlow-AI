import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/types/database";
import { Link } from "@/i18n/navigation";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentsList } from "@/features/documents/components/documents-list";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let documents: Document[] = [];
  if (user) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    documents = data ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Documents</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            All your generated content in one place.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/new">
            <Plus className="h-4 w-4" />
            New document
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">No documents yet</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Create your first document to get started.
          </p>
          <Button size="sm" asChild className="mt-4">
            <Link href="/new">
              <Plus className="h-3.5 w-3.5" />
              Create document
            </Link>
          </Button>
        </div>
      ) : (
        <DocumentsList initialDocuments={documents} />
      )}
    </div>
  );
}
