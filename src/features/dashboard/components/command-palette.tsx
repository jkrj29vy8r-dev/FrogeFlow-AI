"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FolderOpen,
  LayoutTemplate,
  Sparkles,
  FileText,
  Download,
  CreditCard,
  Settings,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ElementType;
  group: string;
}

const COMMANDS: CommandItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navigation" },
  { id: "projects", label: "Projects", href: "/projects", icon: FolderOpen, group: "Navigation" },
  { id: "templates", label: "Templates", href: "/templates", icon: LayoutTemplate, group: "Navigation" },
  { id: "ai-generator", label: "AI Generator", description: "Create a new document", href: "/new", icon: Sparkles, group: "Navigation" },
  { id: "documents", label: "Documents", href: "/documents", icon: FileText, group: "Navigation" },
  { id: "exports", label: "Exports", href: "/exports", icon: Download, group: "Navigation" },
  { id: "billing", label: "Billing", href: "/billing", icon: CreditCard, group: "Navigation" },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, group: "Navigation" },
  { id: "help", label: "Help Center", href: "/help", icon: HelpCircle, group: "Navigation" },
  { id: "new-ebook", label: "New eBook", description: "Create an eBook with AI", href: "/new?type=ebook", icon: Sparkles, group: "Quick Actions" },
  { id: "new-guide", label: "New PDF Guide", description: "Create a PDF guide with AI", href: "/new?type=pdf_guide", icon: Sparkles, group: "Quick Actions" },
  { id: "new-checklist", label: "New Checklist", description: "Create a checklist with AI", href: "/new?type=checklist", icon: Sparkles, group: "Quick Actions" },
];

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? COMMANDS.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : COMMANDS;

  const groups = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  const execute = useCallback(
    (item: CommandItem) => {
      router.push(item.href);
      onClose();
    },
    [router, onClose]
  );

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        const item = filtered[activeIndex];
        if (item) execute(item);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, filtered, activeIndex, execute]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-2xl"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search or jump to…"
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
            aria-label="Search"
          />
          <kbd className="hidden rounded border border-[hsl(var(--border))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                  {group}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = flatIndex === activeIndex;
                  const currentIndex = flatIndex++;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => execute(item)}
                      onMouseEnter={() => setActiveIndex(currentIndex)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                        isActive
                          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                          : "text-[hsl(var(--foreground))]"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                          isActive ? "bg-[hsl(var(--primary)/0.15)]" : "bg-[hsl(var(--muted))]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-3.5 w-3.5",
                            isActive
                              ? "text-[hsl(var(--primary))]"
                              : "text-[hsl(var(--muted-foreground))]"
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{item.label}</span>
                        {item.description && (
                          <span className="ml-2 text-[hsl(var(--muted-foreground))]">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 border-t border-[hsl(var(--border))] px-4 py-2.5">
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <kbd className="rounded border border-[hsl(var(--border))] px-1 py-0.5 font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <kbd className="rounded border border-[hsl(var(--border))] px-1 py-0.5 font-mono">↵</kbd>
            open
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <kbd className="rounded border border-[hsl(var(--border))] px-1 py-0.5 font-mono">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
