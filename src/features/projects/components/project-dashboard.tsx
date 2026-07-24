"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Zap, Download } from "lucide-react";
import type { ProjectWithAssets, ProjectAsset, AssetType } from "@/types/projects";
import { GENERATION_ORDER, ASSET_TYPE_LABELS } from "@/types/projects";
import { AssetCard } from "./asset-card";
import { assetToMarkdown, downloadHtmlFile, markdownToHtmlDocument, slugify } from "@/features/projects/lib/asset-to-markdown";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  project: ProjectWithAssets;
}

export function ProjectDashboard({ project }: Props) {
  const [assets, setAssets] = useState<ProjectAsset[]>(project.assets);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const completedCount = assets.filter(a => a.status === "completed").length;
  const totalCount = GENERATION_ORDER.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  // Bundle every completed text asset into one Markdown document. Landing/sales
  // pages are skipped — they live in the page editor with their own HTML export.
  function handleExportAll() {
    try {
      const parts = assets
        .filter(
          a =>
            a.status === "completed" &&
            a.asset_type !== "landing_page" &&
            a.asset_type !== "sales_page"
        )
        .map(a => assetToMarkdown(a));
      if (parts.length === 0) return;
      const markdown = `# ${project.name}\n\n${parts.join("\n\n---\n\n")}`;
      const html = markdownToHtmlDocument(project.name, markdown);
      downloadHtmlFile(html, `${slugify(project.name)}-assets.html`);
    } catch (err) {
      console.error("Export all failed", err);
      alert("Something went wrong while exporting. Please try again.");
    }
  }

  const hasDownloadable = assets.some(
    a =>
      a.status === "completed" &&
      a.asset_type !== "landing_page" &&
      a.asset_type !== "sales_page"
  );

  const handleRegenerate = useCallback(async (assetId: string, assetType: AssetType) => {
    setRegenerating(assetId);
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: "generating" } : a));

    try {
      const res = await fetch(`/api/projects/${project.id}/assets/${assetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const { content } = await res.json() as { content: ProjectAsset["content"] };
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: "completed", content } : a));
      } else {
        setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: "failed", error: "Regeneration failed" } : a));
      }
    } catch {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: "failed", error: "Connection error" } : a));
    } finally {
      setRegenerating(null);
    }

    void assetType;
  }, [project.id]);

  const orderedAssets = GENERATION_ORDER.map(type => assets.find(a => a.asset_type === type)).filter(Boolean) as ProjectAsset[];

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Assets Generated" value={`${completedCount}/${totalCount}`} />
        <StatCard label="Status" value={<span className="capitalize">{project.status}</span>} />
        <StatCard label="Last Updated" value={formatRelativeTime(project.updated_at)} />
        <StatCard label="Credits Used" value={project.credits_used.toString() || "—"} />
      </div>

      {/* Progress */}
      {project.status !== "completed" && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-[hsl(var(--foreground))]">
              <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
              Generation Progress
            </span>
            <span className="text-[hsl(var(--muted-foreground))]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Assets grid */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Generated Assets</h2>
          <div className="flex items-center gap-3">
            {regenerating && (
              <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Regenerating {ASSET_TYPE_LABELS[assets.find(a => a.id === regenerating)?.asset_type ?? "faq"]}...
              </div>
            )}
            {hasDownloadable && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[hsl(var(--primary)/0.9)]"
              >
                <Download className="h-3.5 w-3.5" />
                Export all
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          {orderedAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onRegenerate={handleRegenerate}
            />
          ))}
          {orderedAssets.length === 0 && (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-sm text-[hsl(var(--muted-foreground))]">
              No assets generated yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[hsl(var(--foreground))]">{value}</p>
    </div>
  );
}
