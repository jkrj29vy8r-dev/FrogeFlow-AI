"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import type { PdfExport } from "@/types/exports";
import { deleteExport, incrementDownloadCount } from "@/features/exports/actions/exports.actions";

interface ExportHistoryListProps {
  exports: PdfExport[];
}

const STATUS_ICONS = {
  pending: <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />,
  generating: <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />,
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  failed: <XCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />,
};

const STATUS_LABELS = {
  pending: "Pending",
  generating: "Generating…",
  completed: "Ready",
  failed: "Failed",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ExportRow({
  item,
  onDelete,
}: {
  item: PdfExport;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await deleteExport(item.id);
    onDelete(item.id);
  }, [item.id, onDelete]);

  const handleDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Re-generate the PDF (since we store settings, not file)
      const response = await fetch("/api/exports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: item.document_id,
          settings: item.settings,
        }),
      });

      if (!response.ok) return;

      await incrementDownloadCount(item.id);
      const blob = await response.blob();
      const fileName = `${item.document_title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, [item, isDownloading]);

  return (
    <div className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
        <FileText className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-[hsl(var(--foreground))]">
          {item.document_title}
        </p>
        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1">
            {STATUS_ICONS[item.status]}
            {STATUS_LABELS[item.status]}
          </span>
          <span>·</span>
          <span>{item.settings.pageSize.toUpperCase()}</span>
          <span>·</span>
          <span>{formatBytes(item.file_size_bytes)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(item.created_at)}
          </span>
          {item.download_count > 0 && (
            <>
              <span>·</span>
              <span>{item.download_count} download{item.download_count !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {item.status === "completed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
            className="h-7 gap-1.5 px-2.5 text-xs"
          >
            {isDownloading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
            Download
          </Button>
        )}
        <button
          type="button"
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          aria-label="Delete export"
          className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ExportHistoryList({ exports: initialExports }: ExportHistoryListProps) {
  const [items, setItems] = useState(initialExports);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
          <Download className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">No exports yet</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Export a document to PDF from the editor.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ExportRow key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </div>
  );
}
