import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Download, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Exports",
};

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Exports</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            Download and manage your exported documents.
          </p>
        </div>
      </div>

      {/* Export stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total exports", value: "0" },
          { label: "PDFs generated", value: "0" },
          { label: "Storage used", value: "0 MB" },
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

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
          <Download className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">No exports yet</p>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          Export a document to PDF to see it here.
        </p>
        <Button size="sm" asChild className="mt-4">
          <Link href="/projects">
            <FileText className="h-3.5 w-3.5" />
            Go to projects
          </Link>
        </Button>
      </div>

      {/* Upgrade prompt for free users */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--primary)/0.05)] to-[hsl(var(--primary)/0.1)] p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)]">
            <Plus className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Remove watermarks with Pro
            </p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              Free exports include a BookForge AI watermark. Upgrade to remove it.
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
