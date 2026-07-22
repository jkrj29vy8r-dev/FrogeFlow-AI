"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Loader2,
  Settings2,
  Palette,
  FileText,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExportSettings, FontFamily, PageSize, QualityPreset, CoverStyle } from "@/types/exports";
import {
  DEFAULT_EXPORT_SETTINGS,
  FONT_LABELS,
  PAGE_SIZE_LABELS,
  QUALITY_LABELS,
} from "@/types/exports";

interface ExportDialogProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
}

type Tab = "layout" | "typography" | "branding" | "cover";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "layout", label: "Layout", icon: FileText },
  { id: "typography", label: "Typography", icon: Settings2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "cover", label: "Cover", icon: FileText },
];

const COVER_STYLES: { id: CoverStyle; label: string; preview: string }[] = [
  { id: "gradient", label: "Gradient", preview: "bg-gradient-to-br from-indigo-500 to-purple-600" },
  { id: "minimal", label: "Minimal", preview: "bg-gray-50 border-l-4 border-indigo-500" },
  { id: "bold", label: "Bold", preview: "bg-indigo-600" },
  { id: "elegant", label: "Elegant", preview: "bg-gradient-to-br from-slate-900 to-blue-900" },
  { id: "modern", label: "Modern", preview: "bg-gradient-to-br from-gray-900 to-indigo-600" },
];

export function ExportDialog({ documentId, documentTitle, onClose }: ExportDialogProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    ...DEFAULT_EXPORT_SETTINGS,
    authorName: "",
    companyName: "",
    footerText: "",
  });
  const [activeTab, setActiveTab] = useState<Tab>("layout");
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = useCallback(<K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    setProgress(0);

    // Simulate progress while waiting
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85));
    }, 400);

    try {
      const response = await fetch("/api/exports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, settings }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = (await response.json()) as { error?: string };
        throw new Error(errData.error ?? "Export failed");
      }

      setProgress(100);

      // Trigger browser download
      const blob = await response.blob();
      const fileName =
        response.headers.get("Content-Disposition")?.match(/filename="(.+?)"/)?.[1] ??
        `${documentTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Export failed");
      setProgress(0);
    } finally {
      setIsExporting(false);
    }
  }, [documentId, documentTitle, settings, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Export PDF</h2>
            <p className="mt-0.5 line-clamp-1 text-xs text-[hsl(var(--muted-foreground))]">
              {documentTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-[hsl(var(--border))] px-6 pt-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-medium transition-colors",
                activeTab === id
                  ? "border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "layout" && (
            <div className="space-y-5">
              <FieldGroup label="Page Size">
                <RadioGrid
                  options={Object.entries(PAGE_SIZE_LABELS).map(([id, label]) => ({ id, label }))}
                  value={settings.pageSize}
                  onChange={(v) => update("pageSize", v as PageSize)}
                />
              </FieldGroup>

              <FieldGroup label="Orientation">
                <RadioGrid
                  options={[
                    { id: "portrait", label: "Portrait" },
                    { id: "landscape", label: "Landscape" },
                  ]}
                  value={settings.orientation}
                  onChange={(v) => update("orientation", v as "portrait" | "landscape")}
                />
              </FieldGroup>

              <FieldGroup label="Quality">
                <RadioGrid
                  options={Object.entries(QUALITY_LABELS).map(([id, label]) => ({ id, label }))}
                  value={settings.quality}
                  onChange={(v) => update("quality", v as QualityPreset)}
                />
              </FieldGroup>

              <FieldGroup label="Features">
                <div className="space-y-2">
                  {[
                    { key: "includeCoverPage", label: "Cover page" },
                    { key: "includeTableOfContents", label: "Table of contents" },
                    { key: "includePageNumbers", label: "Page numbers" },
                    { key: "includeHeaderFooter", label: "Headers & footers" },
                    { key: "includeWatermark", label: 'Watermark (remove with Pro)' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof ExportSettings] as boolean}
                        onChange={(e) =>
                          update(key as keyof ExportSettings, e.target.checked as ExportSettings[keyof ExportSettings])
                        }
                        className="accent-[hsl(var(--primary))] h-4 w-4 rounded"
                      />
                      <span className="text-sm text-[hsl(var(--foreground))]">{label}</span>
                    </label>
                  ))}
                </div>
              </FieldGroup>
            </div>
          )}

          {activeTab === "typography" && (
            <div className="space-y-5">
              <FieldGroup label="Font Family">
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(FONT_LABELS) as [FontFamily, string][]).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => update("fontFamily", id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        settings.fontFamily === id
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label={`Base Font Size: ${settings.fontSize}pt`}>
                <input
                  type="range"
                  min={9}
                  max={14}
                  step={0.5}
                  value={settings.fontSize}
                  onChange={(e) => update("fontSize", parseFloat(e.target.value))}
                  className="w-full accent-[hsl(var(--primary))]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                  <span>9pt (compact)</span>
                  <span>14pt (large)</span>
                </div>
              </FieldGroup>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-5">
              <FieldGroup label="Colors">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: "primaryColor", label: "Primary" },
                    { key: "secondaryColor", label: "Secondary" },
                    { key: "accentColor", label: "Accent" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex flex-col gap-1">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings[key as keyof ExportSettings] as string}
                          onChange={(e) =>
                            update(key as keyof ExportSettings, e.target.value as ExportSettings[keyof ExportSettings])
                          }
                          className="h-8 w-8 cursor-pointer rounded border border-[hsl(var(--border))]"
                        />
                        <input
                          type="text"
                          value={settings[key as keyof ExportSettings] as string}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^#[0-9a-f]{6}$/i.test(val)) {
                              update(key as keyof ExportSettings, val as ExportSettings[keyof ExportSettings]);
                            }
                          }}
                          className="flex-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs font-mono"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Author & Company">
                <div className="space-y-3">
                  <TextField
                    label="Author Name"
                    value={settings.authorName}
                    onChange={(v) => update("authorName", v)}
                    placeholder="e.g. Jane Smith"
                  />
                  <TextField
                    label="Company Name"
                    value={settings.companyName}
                    onChange={(v) => update("companyName", v)}
                    placeholder="e.g. Acme Corp"
                  />
                  <TextField
                    label="Footer Text"
                    value={settings.footerText}
                    onChange={(v) => update("footerText", v)}
                    placeholder="e.g. © 2025 Acme Corp. All rights reserved."
                  />
                </div>
              </FieldGroup>
            </div>
          )}

          {activeTab === "cover" && (
            <div className="space-y-5">
              <FieldGroup label="Cover Style">
                <div className="grid grid-cols-5 gap-2">
                  {COVER_STYLES.map(({ id, label, preview }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => update("coverStyle", id)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={cn(
                          "h-16 w-full rounded-lg border-2 transition-all",
                          preview,
                          settings.coverStyle === id
                            ? "border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary)/0.3)]"
                            : "border-[hsl(var(--border))]"
                        )}
                      />
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{label}</span>
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup label="Cover Image URL (optional)">
                <TextField
                  label=""
                  value={settings.coverImageUrl ?? ""}
                  onChange={(v) => update("coverImageUrl", v || null)}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                  Paste a public image URL to use as your cover background. The cover style will overlay on top.
                </p>
              </FieldGroup>

              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] p-4">
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                  Cover preview
                </p>
                <div
                  className={cn(
                    "mt-3 flex h-36 items-end rounded-lg p-4",
                    !settings.coverImageUrl && getCoverPreviewClass(settings.coverStyle)
                  )}
                  style={
                    settings.coverImageUrl
                      ? { background: `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url(${settings.coverImageUrl}) center/cover` }
                      : {}
                  }
                >
                  <div>
                    {settings.companyName && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">
                        {settings.companyName}
                      </p>
                    )}
                    <p className="line-clamp-2 text-sm font-bold leading-tight text-white">
                      Document Title
                    </p>
                    {settings.authorName && (
                      <p className="mt-1 text-[9px] text-white/70">by {settings.authorName}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--border))] px-6 py-4">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.08)] px-3 py-2 text-xs text-[hsl(var(--destructive))]">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {isExporting && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>Generating PDF…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {settings.pageSize.toUpperCase()} · {settings.orientation} · {settings.quality}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleExport()}
                disabled={isExporting || success}
                className="gap-2 min-w-[120px]"
              >
                {success ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Downloaded!
                  </>
                ) : isExporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function RadioGrid({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
            value === id
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)] font-medium text-[hsl(var(--primary))]"
              : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)]"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:outline-none"
      />
    </label>
  );
}

function getCoverPreviewClass(style: string): string {
  // Use Tailwind-safe classes for preview (can't use dynamic hex in tailwind)
  switch (style) {
    case "minimal": return "bg-gray-50";
    case "elegant": return "bg-slate-900";
    case "modern": return "bg-gray-900";
    default: return "bg-indigo-600"; // gradient/bold fallback
  }
}
