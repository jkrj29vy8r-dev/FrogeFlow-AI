import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { PricingSection } from "@/features/marketing/components/pricing-section";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export const metadata: Metadata = {
  title: "Pricing — BookForge AI",
  description:
    "Simple, transparent pricing. Start free and upgrade when you're ready. No hidden fees.",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 pt-8">
        <div className="px-6 pb-4 pt-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
            Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-[hsl(var(--muted-foreground))]">
            Start for free. Upgrade when you&apos;re ready. Cancel any time.
          </p>
        </div>
        <PricingSection />
      </main>
      <MarketingFooter />
    </div>
  );
}
