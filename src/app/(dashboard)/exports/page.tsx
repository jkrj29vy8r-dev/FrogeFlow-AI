import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExportHistoryList } from "@/features/exports/components/export-history-list";
import { getExportHistory, getExportStats } from "@/features/exports/actions/exports.actions";
import type { PdfExport } from "@/types/exports";

export const metadata: Metadata = {
  title: "Exports",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ExportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const [{ exports }, stats] = await Promise.all([
    getExportHistory(),
    getExportStats(),
  ]);

  const exportList: PdfExport[] = exports ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Exports</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            Download and manage your exported PDF documents.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/projects">
            <FileText className="h-3.5 w-3.5" />
            Go to projects
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total exports", value: stats.totalExports.toString() },
          { label: "Total downloads", value: stats.totalDownloads.toString() },
          { label: "Storage used", value: formatBytes(stats.totalBytes) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
          >
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Export history */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">Export history</h2>
        <ExportHistoryList exports={exportList} />
      </div>

      {/* Upgrade prompt */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--primary)/0.05)] to-[hsl(var(--primary)/0.1)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)]">
            <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Remove watermarks with Pro
            </p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              Free exports include a FrogeFlow AI watermark. Upgrade to remove it and unlock custom branding presets.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/billing">Upgrade</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
