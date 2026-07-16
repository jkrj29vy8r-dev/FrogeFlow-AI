import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Plus, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface DashboardOverviewProps {
  user: User | null;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const t = useTranslations("dashboard");

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    "there";

  const quickCreateItems = [
    {
      label: t("quickCreate.ebook"),
      icon: BookOpen,
      href: "/new?type=ebook",
    },
    {
      label: t("quickCreate.pdfGuide"),
      icon: FileText,
      href: "/new?type=pdf_guide",
    },
    {
      label: t("quickCreate.checklist"),
      icon: FileText,
      href: "/new?type=checklist",
    },
  ] as const;

  const stats = [
    { label: t("stats.documents"), value: "0", icon: FileText },
    { label: t("stats.creditsUsed"), value: "0", icon: Sparkles },
    { label: t("stats.wordsGenerated"), value: "0", icon: TrendingUp },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/new">
            <Plus className="h-4 w-4" />
            {t("newDocument")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick create */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
          {t("quickCreate.title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickCreateItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)] transition-colors group-hover:bg-[hsl(var(--primary)/0.15)]">
                  <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                </div>
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
          {t("recentDocuments.title")}
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <FileText className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
          </div>
          <h3 className="mb-1 text-sm font-medium text-[hsl(var(--foreground))]">
            {t("recentDocuments.empty.title")}
          </h3>
          <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
            {t("recentDocuments.empty.subtitle")}
          </p>
          <Button size="sm" asChild>
            <Link href="/new">
              <Plus className="h-4 w-4" />
              {t("recentDocuments.empty.cta")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
