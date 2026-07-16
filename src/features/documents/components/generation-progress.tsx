"use client";

import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SectionProgress } from "@/features/documents/hooks/use-generation";

interface OutlineGeneratingProps {
  text: string;
  onCancel: () => void;
}

export function OutlineGenerating({ text, onCancel }: OutlineGeneratingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Animated orb */}
      <div className="relative mb-6">
        <div className="h-16 w-16 rounded-full bg-[hsl(var(--primary)/0.15)]" />
        <div className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--primary)/0.2)]" />
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)]">
          <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
        </div>
      </div>

      <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))]">
        Designing your outline…
      </h3>
      <p className="mb-6 text-sm text-[hsl(var(--muted-foreground))]">
        The AI is analyzing your brief and structuring your content
      </p>

      {/* Live streaming preview */}
      {text && (
        <div className="mb-6 max-h-32 w-full max-w-md overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] p-3 text-left">
          <p className="font-mono text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">
            {text.slice(-400)}
          </p>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

interface ContentGeneratingProps {
  progress: SectionProgress[];
  currentIndex: number;
  onCancel: () => void;
}

export function ContentGenerating({
  progress,
  currentIndex: _currentIndex,
  onCancel,
}: ContentGeneratingProps) {
  const completed = progress.filter((p) => p.status === "completed").length;
  const total = progress.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const estimatedSecsRemaining = (total - completed) * 30;
  const minutes = Math.floor(estimatedSecsRemaining / 60);
  const seconds = estimatedSecsRemaining % 60;
  const timeLabel =
    minutes > 0
      ? `~${minutes}m ${seconds}s remaining`
      : `~${seconds}s remaining`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
            Generating content…
          </h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {completed} of {total} sections complete · {timeLabel}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Overall progress bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
        <div
          className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Per-section status list */}
      <div className="space-y-2">
        {progress.map((p, i) => (
          <div
            key={p.sectionId}
            className={cn(
              "flex items-start gap-3 rounded-lg border px-4 py-3 transition-all",
              p.status === "generating"
                ? "border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.05)]"
                : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            )}
          >
            {/* Status icon */}
            <div className="mt-0.5 shrink-0">
              {p.status === "completed" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
              {p.status === "generating" && (
                <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--primary))]" />
              )}
              {p.status === "failed" && (
                <XCircle className="h-4 w-4 text-[hsl(var(--destructive))]" />
              )}
              {p.status === "pending" && (
                <div className="h-4 w-4 rounded-full border-2 border-[hsl(var(--border))]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    p.status === "generating"
                      ? "text-[hsl(var(--foreground))]"
                      : p.status === "completed"
                        ? "text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))]"
                  )}
                >
                  {i + 1}. {p.title}
                </span>
                {p.status === "generating" && (
                  <span className="shrink-0 text-[10px] font-medium text-[hsl(var(--primary))]">
                    Writing…
                  </span>
                )}
                {p.status === "completed" && (
                  <span className="shrink-0 text-[10px] font-medium text-emerald-500">
                    Done
                  </span>
                )}
              </div>

              {/* Live content preview for active section */}
              {p.status === "generating" && p.content && (
                <p className="mt-1 line-clamp-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                  {p.content.slice(-200)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface GenerationErrorProps {
  message: string;
  onRetry: () => void;
}

export function GenerationError({ message, onRetry }: GenerationErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--destructive)/0.1)]">
        <AlertCircle className="h-7 w-7 text-[hsl(var(--destructive))]" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[hsl(var(--foreground))]">
        Generation failed
      </h3>
      <p className="mb-5 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{message}</p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
