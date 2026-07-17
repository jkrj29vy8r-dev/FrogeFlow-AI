import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { getLandingPage, getLandingPageSections } from "@/features/landing-pages/actions/landing-pages.actions";
import { PageEditor } from "@/features/landing-pages/components/page-editor";

export const metadata: Metadata = {
  title: "Edit Landing Page",
};

export default async function LandingPageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const [{ page, error }, { sections }] = await Promise.all([
    getLandingPage(id),
    getLandingPageSections(id),
  ]);

  if (error || !page) notFound();

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <Link href="/landing-pages" className="flex items-center gap-1 hover:text-[hsl(var(--foreground))]">
          <ArrowLeft className="h-3.5 w-3.5" /> Landing Pages
        </Link>
        <span>/</span>
        <span className="text-[hsl(var(--foreground))]">{page.name}</span>
      </div>

      <PageEditor page={page} initialSections={sections} />
    </div>
  );
}
