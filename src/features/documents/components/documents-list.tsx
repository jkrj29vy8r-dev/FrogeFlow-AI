"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { FileText, Clock } from "lucide-react";
import type { Document } from "@/types/database";
import { formatRelativeTime } from "@/lib/utils";
import { DocActions } from "@/features/dashboard/components/projects-view";

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

export function DocumentsList({ initialDocuments }: { initialDocuments: Document[] }) {
  const [documents, setDocuments] = useState(initialDocuments);

  const handleRenamed = useCallback((id: string, title: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)));
  }, []);

  const handleDeleted = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[hsl(var(--accent)/0.5)]"
        >
          <Link
            href={`/dashboard/documents/${doc.id}/outline`}
            className="flex min-w-0 flex-1 items-center gap-4"
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
          <DocActions
            doc={doc}
            onRenamed={handleRenamed}
            onDeleted={handleDeleted}
            onDuplicated={() => { /* not offered from this list */ }}
          />
        </div>
      ))}
    </div>
  );
}
