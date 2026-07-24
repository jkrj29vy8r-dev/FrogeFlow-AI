import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GeneratorWizard } from "@/features/landing-pages/components/generator-wizard";

export const metadata: Metadata = {
  title: "New Landing Page",
};

interface NewLandingPagePageProps {
  searchParams: Promise<{
    productName?: string;
    description?: string;
    targetAudience?: string;
  }>;
}

export default async function NewLandingPagePage({ searchParams }: NewLandingPagePageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { productName, description, targetAudience } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Create Landing Page</h1>
        <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
          Answer a few questions and AI will generate a conversion-optimized page in seconds.
        </p>
      </div>
      <GeneratorWizard initialData={{ productName, description, targetAudience }} />
    </div>
  );
}
