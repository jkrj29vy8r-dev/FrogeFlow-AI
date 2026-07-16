"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Document } from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Search,
  Grid3x3,
  List,
  MoreHorizontal,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const TYPE_LABELS: Record<string, string> = {
  ebook: "eBook",
  pdf_guide: "PDF Guide",
  workbook: "Workbook",
  checklist: "Checklist",
  lead_magnet: "Lead Magnet",
  landing_page: "Landing Page",
  sales_page: "Sales Page",
  product_description: "Product Description",
  marketing_content: "Marketing",
  social_post: "Social Post",
  email_campaign: "Email Campaign",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  ebook: BookOpen,
  pdf_guide: FileText,
  lead_magnet: Zap,
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
};

const TYPE_COLORS: Record<string, string> = {
  ebook: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  pdf_guide: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  lead_magnet: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  checklist: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function ProjectCard({ doc }: { doc: Document }) {
  const Icon = TYPE_ICONS[doc.type] ?? FileText;
  const colorClass = TYPE_COLORS[doc.type] ?? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";

  return (
    <div className="group relative rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {}}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}} destructive>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/dashboard/documents/${doc.id}/outline`} className="block">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-[hsl(var(--foreground))]">
          {doc.title}
        </h3>
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft
          )}
        >
          {doc.status}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(doc.updated_at)}
        </span>
      </div>

      {doc.word_count > 0 && (
        <p className="mt-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
          {doc.word_count.toLocaleString()} words
        </p>
      )}

      <div className="mt-2">
        <span className="rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
          {TYPE_LABELS[doc.type] ?? doc.type}
        </span>
      </div>
    </div>
  );
}

function ProjectRow({ doc }: { doc: Document }) {
  const Icon = TYPE_ICONS[doc.type] ?? FileText;
  const colorClass = TYPE_COLORS[doc.type] ?? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";

  return (
    <div className="group flex items-center gap-4 border-b border-[hsl(var(--border))] px-4 py-3 last:border-0 hover:bg-[hsl(var(--accent)/0.5)]">
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <Link href={`/dashboard/documents/${doc.id}/outline`}>
          <p className="truncate text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]">
            {doc.title}
          </p>
        </Link>
      </div>
      <span className="hidden shrink-0 rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] sm:block">
        {TYPE_LABELS[doc.type] ?? doc.type}
      </span>
      <span
        className={cn(
          "hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium md:block",
          STATUS_STYLES[doc.status] ?? STATUS_STYLES.draft
        )}
      >
        {doc.status}
      </span>
      <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
        {formatRelativeTime(doc.updated_at)}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex h-7 w-7 cursor-pointer shrink-0 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {}}>Rename</DropdownMenuItem>
          <DropdownMenuItem onClick={() => {}}>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {}} destructive>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface ProjectsViewProps {
  documents: Document[];
}

type ViewMode = "grid" | "list";
type SortKey = "updated_at" | "created_at" | "title";

export function ProjectsView({ documents }: ProjectsViewProps) {
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated_at");
  const [typeFilter, setTypeFilter] = useState("all");

  const types = ["all", ...Array.from(new Set(documents.map((d) => d.type)))];

  const filtered = documents
    .filter(
      (d) =>
        (typeFilter === "all" || d.type === typeFilter) &&
        (query === "" || d.title.toLowerCase().includes(query.toLowerCase()))
    )
    .sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b[sort]).getTime() - new Date(a[sort]).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Projects</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            {documents.length} {documents.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/new">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="h-9 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-9 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All types" : (TYPE_LABELS[t] ?? t)}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          <option value="updated_at">Last modified</option>
          <option value="created_at">Date created</option>
          <option value="title">Title A–Z</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg border border-[hsl(var(--border))] p-0.5">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={cn(
              "flex h-7 w-8 items-center justify-center rounded-md transition-colors",
              view === "grid"
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
            aria-label="Grid view"
          >
            <Grid3x3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex h-7 w-8 items-center justify-center rounded-md transition-colors",
              view === "list"
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            )}
            aria-label="List view"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {query || typeFilter !== "all" ? "No matching projects" : "No projects yet"}
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {query || typeFilter !== "all"
              ? "Try adjusting your filters."
              : "Start by creating your first document."}
          </p>
          {!query && typeFilter === "all" && (
            <Button size="sm" asChild className="mt-4">
              <Link href="/new">
                <Plus className="h-3.5 w-3.5" />
                Create project
              </Link>
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <ProjectCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {filtered.map((doc) => (
            <ProjectRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
