"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  FileText,
  CreditCard,
  LogOut,
  FolderOpen,
  LayoutTemplate,
  Sparkles,
  Download,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Zap,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/features/auth/actions/auth.actions";
import { useSidebar } from "@/context/sidebar-context";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface SidebarProps {
  user: User | null;
  profile: Profile | null;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "AI Generator", href: "/new", icon: Sparkles },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Generate Business", href: "/generate", icon: Zap },
  { label: "Cover Studio", href: "/covers", icon: Image },
  { label: "Landing Pages", href: "/landing-pages", icon: Globe },
  { label: "Exports", href: "/exports", icon: Download },
] as const;

const bottomItems = [
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
] as const;

function NavItem({
  href,
  icon: Icon,
  label,
  exact,
  collapsed,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "group flex items-center rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150",
        collapsed ? "justify-center" : "gap-3",
        isActive
          ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export function Sidebar({ user, profile }: SidebarProps) {
  const { collapsed, toggle } = useSidebar();

  const firstName =
    (profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined))
      ?.split(" ")[0] ?? "User";
  const email = user?.email ?? "";
  const initials = firstName.slice(0, 2).toUpperCase();
  const planLabel =
    profile?.plan === "pro" ? "Pro" : profile?.plan === "enterprise" ? "Agency" : "Free";

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] transition-all duration-300 ease-in-out",
        collapsed ? "w-[60px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-[hsl(var(--border))]",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
          <BookOpen className="h-3.5 w-3.5 text-white" />
        </div>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
            BookForge AI
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            exact={"exact" in item ? item.exact : undefined}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-0.5 border-t border-[hsl(var(--border))] p-2">
        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "group flex w-full items-center rounded-lg px-2.5 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-all duration-150 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </form>
      </div>

      {/* User section */}
      {!collapsed && (
        <div className="border-t border-[hsl(var(--border))] p-3">
          <div className="flex items-center gap-2.5 rounded-lg p-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-semibold text-[hsl(var(--primary))]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[hsl(var(--foreground))]">
                {firstName}
              </p>
              <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-[hsl(var(--primary)/0.1)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
              {planLabel}
            </span>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] shadow-sm transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
