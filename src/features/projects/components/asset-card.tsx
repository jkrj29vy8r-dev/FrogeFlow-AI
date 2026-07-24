"use client";

import { useState } from "react";
import { MoreHorizontal, RefreshCw, Trash2, Eye, Pencil, Copy, Download, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ASSET_TYPE_ICONS, ASSET_TYPE_LABELS } from "@/types/projects";
import type { ProjectAsset, AssetType } from "@/types/projects";
import { AssetViewer } from "./asset-viewer";
import { assetToMarkdown, downloadTextFile, slugify } from "@/features/projects/lib/asset-to-markdown";
import { deleteAsset, renameAsset } from "@/features/projects/actions/projects.actions";

interface Props {
  asset: ProjectAsset;
  onRegenerate: (assetId: string, assetType: AssetType) => void;
  onDuplicate?: (assetId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  generating: "bg-blue-500/10 text-blue-600 animate-pulse",
  completed: "bg-green-500/10 text-green-600",
  failed: "bg-red-500/10 text-red-600",
};

export function AssetCard({ asset, onRegenerate }: Props) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(asset.name);
  const [copied, setCopied] = useState(false);

  async function handleRename() {
    if (nameVal.trim() && nameVal !== asset.name) {
      await renameAsset(asset.id, nameVal.trim());
    }
    setRenaming(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(assetToMarkdown(asset));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  function handleDownload() {
    downloadTextFile(assetToMarkdown(asset), `${slugify(asset.name)}.md`);
  }

  // Landing/sales pages aren't plain text — they open in the page editor, which
  // has its own HTML export — so Copy/Download only apply to the text assets.
  const isDownloadable =
    asset.status === "completed" &&
    asset.asset_type !== "landing_page" &&
    asset.asset_type !== "sales_page";

  return (
    <>
      <div
        className={cn(
          "relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm",
          open && "border-[hsl(var(--primary)/0.4)] shadow-sm"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl shrink-0">{ASSET_TYPE_ICONS[asset.asset_type]}</span>
            <div className="min-w-0">
              {renaming ? (
                <input
                  autoFocus
                  className="w-full rounded border border-[hsl(var(--primary))] px-1 py-0.5 text-sm font-medium focus:outline-none"
                  value={nameVal}
                  onChange={e => setNameVal(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={e => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
                />
              ) : (
                <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{asset.name}</p>
              )}
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{ASSET_TYPE_LABELS[asset.asset_type]}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", STATUS_STYLES[asset.status])}>
              {asset.status}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(m => !m)}
              aria-label="More options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-[hsl(var(--accent))]"
            >
              <MoreHorizontal className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>
        </div>

        {/* Error */}
        {asset.status === "failed" && asset.error && (
          <p className="mt-2 text-xs text-red-500">{asset.error}</p>
        )}

        {/* Action row */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {asset.status === "completed" && (
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))]"
            >
              <Eye className="h-3.5 w-3.5" />
              {open ? "Hide" : "Preview"}
            </button>
          )}
          {isDownloadable && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </>
          )}
          {(asset.status === "completed" || asset.status === "failed") && (
            <button
              onClick={() => onRegenerate(asset.id, asset.asset_type)}
              className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-medium hover:bg-[hsl(var(--accent))]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          )}
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div
            className="absolute right-4 top-10 z-20 min-w-[140px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg"
            onBlur={() => setMenuOpen(false)}
          >
            <button
              onClick={() => { setRenaming(true); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
            >
              <Pencil className="h-3.5 w-3.5" /> Rename
            </button>
            <button
              onClick={() => { onRegenerate(asset.id, asset.asset_type); setMenuOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
            >
              <Copy className="h-3.5 w-3.5" /> Regenerate
            </button>
            <form action={async () => { await deleteAsset(asset.id); }}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/5"
                onClick={() => setMenuOpen(false)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Expanded preview */}
      {open && asset.status === "completed" && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <AssetViewer asset={asset} />
        </div>
      )}
    </>
  );
}
