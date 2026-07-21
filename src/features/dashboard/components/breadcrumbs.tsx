"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  templates: "Templates",
  new: "New Document",
  documents: "Documents",
  exports: "Exports",
  billing: "Billing",
  settings: "Settings",
  help: "Help",
  "ai-generator": "AI Generator",
  outline: "Outline",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="shrink-0 text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
        aria-label="Dashboard home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span
          key={crumb.href}
          className={cn(
            "flex min-w-0 items-center gap-1",
            !crumb.isLast && "hidden sm:flex"
          )}
        >
          <ChevronRight className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
          {crumb.isLast ? (
            <span
              className={cn(
                "truncate font-medium",
                crumb.isLast
                  ? "text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))]"
              )}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="truncate text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
