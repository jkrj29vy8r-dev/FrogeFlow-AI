import { Link } from "@/i18n/navigation";
import type { User } from "@supabase/supabase-js";
import type { Profile, Document } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Sparkles,
  Plus,
  BookOpen,
  TrendingUp,
  Download,
  ArrowRight,
  Clock,
  Zap,
  LayoutTemplate,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface DashboardOverviewProps {
  user: User | null;
  profile: Profile | null;
  documents: Document[];
}

const QUICK_ACTIONS = [
  { label: "eBook", description: "Long-form guide or book", icon: BookOpen, href: "/new?type=ebook", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { label: "PDF Guide", description: "Concise reference guide", icon: FileText, href: "/new?type=pdf_guide", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Checklist", description: "Step-by-step checklist", icon: FileText, href: "/new?type=checklist", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { label: "Lead Magnet", description: "Attract and convert leads", icon: Zap, href: "/new?type=lead_magnet", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
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

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
};

export function DashboardOverview({ user, profile, documents }: DashboardOverviewProps) {
  const firstName =
    (profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined))
      ?.split(" ")[0] ?? "there";
  const credits = profile?.credits ?? 0;
  const planLabel =
    profile?.plan === "pro" ? "Pro" : profile?.plan === "agency" ? "Agency" : "Free";
  const recentDocs = documents.slice(0, 5);
  const totalWords = documents.reduce((sum, d) => sum + (d.word_count ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--primary))] px-8 py-7">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(254,80%,45%)] opacity-90" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/70">Welcome back</p>
            <h1 className="mt-0.5 text-2xl font-bold text-white">
              Good morning, {firstName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-white/70">
              Ready to create something amazing today?
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button
                asChild
                className="bg-white text-[hsl(var(--primary))] hover:bg-white/90"
                size="sm"
              >
                <Link href="/new">
                  <Plus className="h-3.5 w-3.5" />
                  New document
                </Link>
              </Button>
              <Badge
                className="border-white/20 bg-white/10 text-white"
                variant="outline"
              >
                {planLabel} plan
              </Badge>
            </div>
          </div>
          {/* Decorative */}
          <div className="hidden shrink-0 lg:block">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-white/10" />
              <div className="absolute inset-4 rounded-full bg-white/10" />
              <div className="absolute inset-8 flex items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Documents", value: documents.length, icon: FileText, color: "text-violet-500" },
          { label: "AI Credits", value: credits, icon: Sparkles, color: "text-blue-500" },
          { label: "Words Generated", value: totalWords, icon: TrendingUp, color: "text-emerald-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</span>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">
                {stat.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick create */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">Quick create</h2>
          <Link
            href="/new"
            className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
          >
            All types <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                    {item.label}
                  </p>
                  <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent documents */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[hsl(var(--foreground))]">
              Recent documents
            </h2>
            {recentDocs.length > 0 && (
              <Link
                href="/projects"
                className="flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">No documents yet</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Create your first document to get started.
              </p>
              <Button size="sm" asChild className="mt-4">
                <Link href="/new">
                  <Plus className="h-3.5 w-3.5" />
                  Create document
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/dashboard/documents/${doc.id}/outline`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-[hsl(var(--accent)/0.5)]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                    <FileText className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                      {doc.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatRelativeTime(doc.updated_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[doc.status] ?? STATUS_COLORS.draft}`}
                  >
                    {doc.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Right column */}
        <div className="space-y-6">
          {/* AI suggestions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">
              Get started
            </h2>
            <div className="space-y-2">
              {[
                { label: "Explore templates", icon: LayoutTemplate, href: "/templates" },
                { label: "View exports", icon: Download, href: "/exports" },
                { label: "Check billing", icon: Sparkles, href: "/billing" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--accent))]"
                  >
                    <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    {item.label}
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Credits widget */}
          <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">Credits</span>
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">{credits}</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">remaining this month</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                style={{ width: `${Math.min(100, (credits / 100) * 100)}%` }}
              />
            </div>
            {credits < 10 && (
              <Link
                href="/billing"
                className="mt-3 block text-center text-xs font-medium text-[hsl(var(--primary))] hover:underline"
              >
                Upgrade for more credits →
              </Link>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
