import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export const metadata: Metadata = {
  title: "Blog — BookForge AI",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Blog</h1>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Tips, tutorials, and insights for digital product creators. Coming soon.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
