import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Plus, FileText, Clock, Globe, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLandingPages, deleteLandingPage } from "@/features/landing-pages/actions/landing-pages.actions";
import { PAGE_TYPE_LABELS } from "@/types/landing-pages";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Landing Pages",
};

export default async function LandingPagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { pages } = await getLandingPages();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Landing Pages</h1>
          <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
            AI-generated landing pages ready to publish.
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/landing-pages/new">
            <Plus className="h-3.5 w-3.5" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total pages", value: pages.length.toString() },
          { label: "Published", value: pages.filter(p => p.status === 'published').length.toString() },
          { label: "Drafts", value: pages.filter(p => p.status === 'draft').length.toString() },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pages list */}
      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">No landing pages yet</p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Generate your first AI-powered landing page in minutes.
          </p>
          <Button asChild size="sm" className="mt-4 gap-2">
            <Link href="/landing-pages/new">
              <Plus className="h-3.5 w-3.5" /> Create Landing Page
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(page => (
            <div
              key={page.id}
              className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
            >
              {/* Color dot */}
              <div
                className="h-10 w-10 shrink-0 rounded-lg"
                style={{ background: `linear-gradient(135deg, ${page.settings?.primaryColor || '#6366f1'}, ${page.settings?.secondaryColor || '#8b5cf6'})` }}
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">{page.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {PAGE_TYPE_LABELS[page.page_type]}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {page.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(page.updated_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-xs">
                  <Link href={`/landing-pages/${page.id}/editor`}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                </Button>
                <form action={async () => {
                  "use server";
                  await deleteLandingPage(page.id);
                }}>
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]"
                    title="Delete page"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
