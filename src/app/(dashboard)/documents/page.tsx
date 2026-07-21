import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Document } from "@/types/database";
import { Link } from "@/i18n/navigation";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documents",
};

const TYPE_LABELS: Record<string, string> = {
  ebook: "eBook",
  pdf_guide: "PDF Guide",
  workbook: "Workbook",
  checklist: "Checklist",
  lead_magnet: "Lead Magnet",
  landing_page: "Landing Page",
  sales_page: "Sales Page",
  product_description: "Product Description",
  marketing_content: "Marketing",
  social_post: "Social Post",
  email_campaign: "Email Campaign",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
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
        <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/documents/${doc.id}/outline`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--accent)/0.5)]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                  {doc.title}
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {TYPE_LABELS[doc.type] ?? doc.type}
                  {doc.word_count > 0 && ` · ${doc.word_count.toLocaleString()} words`}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft}`}
              >
                {doc.status}
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] sm:flex">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(doc.updated_at)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
