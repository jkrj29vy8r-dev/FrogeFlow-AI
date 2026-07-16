"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Search, Bell, Plus, Settings, ChevronDown, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions/auth.actions";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface TopbarProps {
  user: SupabaseUser | null;
  profile: Profile | null;
}

export function Topbar({ user, profile }: TopbarProps) {
  const [cmdOpen, setCmdOpen] = useState(false);

  const firstName =
    (profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined))
      ?.split(" ")[0] ?? "User";
  const initials = firstName.slice(0, 2).toUpperCase();
  const credits = profile?.credits ?? 0;
  const planLabel =
    profile?.plan === "pro" ? "Pro" : profile?.plan === "enterprise" ? "Agency" : "Free";

  // CMD+K / Ctrl+K to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.8)] px-4 backdrop-blur-sm">
        {/* Breadcrumbs */}
        <div className="flex-1">
          <Breadcrumbs />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--ring)/0.5)] hover:text-[hsl(var(--foreground))] sm:flex"
            aria-label="Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Search…</span>
            <kbd className="ml-1 rounded border border-[hsl(var(--border))] px-1 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Create button */}
          <Link
            href="/new"
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Create</span>
          </Link>

          {/* Credits badge */}
          <div
            className="hidden cursor-default items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))] lg:flex"
            title="AI Credits remaining"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
            {credits} credits
          </div>

          {/* Plan badge */}
          <span
            className={cn(
              "hidden rounded-full px-2 py-0.5 text-[10px] font-semibold md:block",
              planLabel === "Free"
                ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                : "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]"
            )}
          >
            {planLabel}
          </span>

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {/* User avatar menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-[hsl(var(--accent))]">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-semibold text-[hsl(var(--primary))]">
                  {initials}
                </div>
                <ChevronDown className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">{firstName}</p>
                  <p className="mt-0.5 truncate text-xs font-normal text-[hsl(var(--muted-foreground))]">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(var(--destructive)/0.1)]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {cmdOpen && <CommandPalette onClose={() => setCmdOpen(false)} />}
    </>
  );
}
