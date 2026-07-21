import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Plus, Image as ImageIcon, Clock, Trash2, Pencil } from "lucide-react";
import { getCovers, deleteCover } from "@/features/covers/actions/covers.actions";
import { formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cover Designs",
};

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  ebook: "eBook",
  guide: "PDF Guide",
  workbook: "Workbook",
  checklist: "Checklist",
  lead_magnet: "Lead Magnet",
};

export default async function CoversPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { covers } = await getCovers();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) await deleteCover(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Cover Designs</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Create stunning covers for your digital products
          </p>
        </div>
        <Link
          href="/covers/new"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:justify-start"
        >
          <Plus className="h-4 w-4" /> New Cover
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Covers</p>
          <p className="mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">{covers.length}</p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Product Types</p>
          <p className="mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">
            {new Set(covers.map(c => c.product_type)).size}
          </p>
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">This Week</p>
          <p className="mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">
            {covers.filter(c => {
              const d = new Date(c.created_at);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
        </div>
      </div>

      {/* Cover grid */}
      {covers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)]">
            <ImageIcon className="h-8 w-8 text-[hsl(var(--primary))]" />
          </div>
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">No covers yet</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Create your first AI-powered cover design
          </p>
          <Link
            href="/covers/new"
            className="mt-6 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create Cover
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* New cover card */}
          <Link
            href="/covers/new"
            className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent))]"
            style={{ aspectRatio: "2/3" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] transition-colors group-hover:bg-[hsl(var(--primary)/0.2)]">
              <Plus className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <p className="mt-3 text-xs font-medium text-[hsl(var(--muted-foreground))]">New Cover</p>
          </Link>

          {covers.map(cover => (
            <div key={cover.id} className="group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-shadow hover:shadow-md">
              {/* Cover preview placeholder */}
              <Link href={`/covers/${cover.id}/editor`} className="block">
                <div
                  className="w-full bg-gradient-to-br from-indigo-500 to-purple-600 transition-opacity group-hover:opacity-90"
                  style={{ aspectRatio: "2/3" }}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-white line-clamp-2">{cover.name}</p>
                    <p className="text-[10px] text-white/70">
                      {PRODUCT_TYPE_LABELS[cover.product_type] ?? cover.product_type}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Info & actions */}
              <div className="p-3">
                <p className="truncate text-xs font-medium text-[hsl(var(--foreground))]">{cover.name}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(cover.updated_at)}
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Link
                  href={`/covers/${cover.id}/editor`}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/80"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5 text-white" />
                </Link>
                <form action={handleDelete}>
                  <input type="hidden" name="id" value={cover.id} />
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm transition-colors hover:bg-red-600/80"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-white" />
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
