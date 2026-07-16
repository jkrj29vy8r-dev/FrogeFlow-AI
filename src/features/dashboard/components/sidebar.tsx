"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Settings,
  FileText,
  CreditCard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/features/auth/actions/auth.actions";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const navItems = [
    { label: t("dashboard"), href: "/dashboard" as const, icon: LayoutDashboard },
    { label: t("documents"), href: "/dashboard/documents" as const, icon: FileText },
    { label: t("settings"), href: "/settings" as const, icon: Settings },
    { label: t("billing"), href: "/billing" as const, icon: CreditCard },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[hsl(var(--border))] px-5 font-semibold">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
          <BookOpen className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm text-[hsl(var(--foreground))]">
          {tCommon("appName")}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-[hsl(var(--muted-foreground))]"
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </Button>
        </form>
      </div>
    </aside>
  );
}
