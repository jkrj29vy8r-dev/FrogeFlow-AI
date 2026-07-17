"use client";

import { useState } from "react";
import { X, Download, Code, FileText, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingPage, LandingPageSection, ExportFormat } from "@/types/landing-pages";
import { EXPORT_FORMAT_LABELS } from "@/types/landing-pages";
import { exportAsHtml, exportAsMarkdown, exportAsReact, exportAsNextjs } from "@/features/landing-pages/lib/html-exporter";

interface ExportDialogProps {
  page: LandingPage;
  sections: LandingPageSection[];
  onClose: () => void;
}

const FORMAT_ICONS: Record<ExportFormat, React.ElementType> = {
  html: Globe,
  react: Code,
  nextjs: Code,
  markdown: FileText,
};

const FORMAT_DESCRIPTIONS: Record<ExportFormat, string> = {
  html: 'Standalone HTML file ready to deploy anywhere',
  react: 'React/TSX component with typed section data',
  nextjs: 'Next.js page.tsx with metadata and JSON data',
  markdown: 'Clean markdown file with all page content',
};

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  html: '.html',
  react: '.tsx',
  nextjs: 'page.tsx',
  markdown: '.md',
};

export function ExportDialog({ page, sections, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('html');
  const [copied, setCopied] = useState(false);

  function generate(): string {
    const input = { page, sections };
    switch (format) {
      case 'html': return exportAsHtml(input);
      case 'react': return exportAsReact(input);
      case 'nextjs': return exportAsNextjs(input);
      case 'markdown': return exportAsMarkdown(input);
    }
  }

  function download() {
    const content = generate();
    const mimeTypes: Record<ExportFormat, string> = {
      html: 'text/html',
      react: 'text/plain',
      nextjs: 'text/plain',
      markdown: 'text/markdown',
    };
    const slug = page.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = format === 'nextjs' ? 'page.tsx' : `${slug}${FORMAT_EXTENSIONS[format]}`;
    const blob = new Blob([content], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(generate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div>
            <h2 className="font-semibold text-[hsl(var(--foreground))]">Export Page</h2>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">Download your landing page in your preferred format</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Format selection */}
        <div className="p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Export Format</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(EXPORT_FORMAT_LABELS) as ExportFormat[]).map(f => {
              const Icon = FORMAT_ICONS[f];
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    format === f
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.3)]"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    format === f ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", format === f ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>
                      {EXPORT_FORMAT_LABELS[f]}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                      {FORMAT_DESCRIPTIONS[f]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-4 rounded-lg bg-[hsl(var(--muted)/0.5)] p-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              <span className="font-medium text-[hsl(var(--foreground))]">Output:</span>{' '}
              {FORMAT_EXTENSIONS[format]} file containing{' '}
              {sections.filter(s => s.is_visible).length} visible sections from your page.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between border-t border-[hsl(var(--border))] px-6 py-4">
          <Button variant="outline" onClick={() => void copyToClipboard()}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button className="gap-2" onClick={download}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
