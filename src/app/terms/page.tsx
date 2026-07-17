import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export const metadata: Metadata = {
  title: "Terms of Service — BookForge AI",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Terms of Service</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Last updated: July 2025</p>

          <div className="mt-8 space-y-6 text-[hsl(var(--muted-foreground))]">
            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">1. Acceptance of Terms</h2>
              <p className="mt-2 text-sm">By accessing BookForge AI, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">2. Use of Service</h2>
              <p className="mt-2 text-sm">BookForge AI is provided for creating digital products such as eBooks, guides, and marketing materials. You may not use the service for illegal purposes, to generate harmful content, or to violate third-party rights.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">3. Intellectual Property</h2>
              <p className="mt-2 text-sm">Content you create using BookForge AI belongs to you. You retain full ownership of your generated documents and may use them commercially. BookForge AI retains ownership of the platform software and AI models.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">4. Subscription & Billing</h2>
              <p className="mt-2 text-sm">Paid subscriptions are billed monthly. You may cancel at any time. Refunds are provided within 30 days of purchase if you are unsatisfied. Credits do not roll over between billing periods.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">5. Limitation of Liability</h2>
              <p className="mt-2 text-sm">BookForge AI is provided &ldquo;as is&rdquo; without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">6. Changes to Terms</h2>
              <p className="mt-2 text-sm">We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">7. Contact</h2>
              <p className="mt-2 text-sm">For questions about these terms, contact legal@bookforge.ai</p>
            </section>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
