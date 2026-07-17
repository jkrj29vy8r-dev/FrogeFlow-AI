"use client";

import { useState } from "react";
import { Download, X, FileImage, FileType, Code } from "lucide-react";
import type { ExportFormat } from "@/types/covers";
import { cn } from "@/lib/utils";

interface Props {
  coverId: string;
  coverName: string;
  onClose: () => void;
}

const FORMATS: Array<{ id: ExportFormat; label: string; desc: string; icon: React.ElementType }> = [
  { id: 'png', label: 'PNG', desc: 'High quality, transparent bg support', icon: FileImage },
  { id: 'jpg', label: 'JPG', desc: 'Smaller file size, web optimized', icon: FileImage },
  { id: 'pdf', label: 'PDF', desc: 'Print-ready, vector quality', icon: FileType },
  { id: 'svg', label: 'SVG', desc: 'Scalable vector, infinitely sharp', icon: Code },
];

const RESOLUTIONS = [
  { id: '1x', label: '1× Standard', desc: '600 × 900 px' },
  { id: '2x', label: '2× High-Res', desc: '1200 × 1800 px' },
  { id: '3x', label: '3× Print', desc: '1800 × 2700 px' },
];

export function ExportDialog({ coverId, coverName, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [resolution, setResolution] = useState('2x');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  async function handleExport() {
    setExporting(true);
    setError('');
    try {
      const scale = resolution === '2x' ? 2 : resolution === '3x' ? 3 : 1;
      const res = await fetch(`/api/covers/${coverId}/export?format=${format}&scale=${scale}`);
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = coverName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      a.download = `${safeName}-cover.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-[hsl(var(--accent))]">
          <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
            <Download className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">Export Cover</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{coverName}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all",
                    format === f.id
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
                  )}
                >
                  <f.icon className={cn("mt-0.5 h-4 w-4 shrink-0", format === f.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]")} />
                  <div>
                    <p className={cn("text-xs font-semibold", format === f.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>{f.label}</p>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{f.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {(format === 'png' || format === 'jpg') && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Resolution</p>
              <div className="space-y-1.5">
                {RESOLUTIONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setResolution(r.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 transition-all",
                      resolution === r.id
                        ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
                    )}
                  >
                    <span className={cn("text-xs font-medium", resolution === r.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>{r.label}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : `Export as ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
