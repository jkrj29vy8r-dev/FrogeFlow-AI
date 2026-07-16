"use client";

import { useTranslations } from "next-intl";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface OutlineViewProps {
  document: Document;
}

export function OutlineView({ document }: OutlineViewProps) {
  const t = useTranslations("generation.outline");
  const tProjects = useTranslations("projects");

  const content = document.content as {
    topic?: string;
    audience?: string;
    tone?: string;
    length?: string;
    sections?: { title: string; description?: string }[];
  };

  const sections = content.sections ?? [];
  const hasSections = sections.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {t("subtitle")}
          </p>
        </div>
        <Badge variant="secondary">
          {tProjects(`types.${document.type}` as Parameters<typeof tProjects>[0])}
        </Badge>
      </div>

      {/* Document brief */}
      <div className="mb-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">
          {document.title}
        </h2>
        {content.topic && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {content.topic}
          </p>
        )}
      </div>

      {/* Sections or placeholder */}
      {hasSections ? (
        <div className="space-y-2">
          {sections.map((section, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-semibold text-[hsl(var(--primary))]">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {section.title}
                </p>
                {section.description && (
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {section.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <Sparkles className="mb-3 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            AI outline generation coming soon.
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/new">
            <RotateCcw className="h-4 w-4" />
            {t("startOver")}
          </Link>
        </Button>
        <Button className="flex-1 gap-2" disabled={!hasSections}>
          <Sparkles className="h-4 w-4" />
          {t("approve")}
        </Button>
      </div>
    </div>
  );
}
