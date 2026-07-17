import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GenerateWizard } from "@/features/projects/components/generate-wizard";

export const metadata: Metadata = {
  title: "Generate Digital Business",
};

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Generate Your Digital Business</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          One click generates a complete digital product — eBook, landing pages, email sequence, social media pack, and more.
        </p>
      </div>
      <GenerateWizard />
    </div>
  );
}
