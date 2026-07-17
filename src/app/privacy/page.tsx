import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export const metadata: Metadata = {
  title: "Privacy Policy — BookForge AI",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Last updated: July 2025</p>

          <div className="prose prose-sm mt-8 max-w-none text-[hsl(var(--foreground))]">
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your email address, name, and content you create using BookForge AI.
            </p>

            <h2 className="mt-6 text-lg font-semibold">2. How We Use Your Information</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional emails, and comply with legal obligations.
            </p>

            <h2 className="mt-6 text-lg font-semibold">3. Data Storage</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Your data is stored securely using Supabase (PostgreSQL) with row-level security. Documents and generated content are associated with your account and are not shared with other users.
            </p>

            <h2 className="mt-6 text-lg font-semibold">4. Third-Party Services</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              We use Stripe for payment processing, Anthropic Claude for AI generation, and Resend for transactional emails. Each service has its own privacy policy.
            </p>

            <h2 className="mt-6 text-lg font-semibold">5. Data Deletion</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              You can delete your account and all associated data at any time from your account settings. Deletion is permanent and irreversible.
            </p>

            <h2 className="mt-6 text-lg font-semibold">6. Contact</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              For privacy questions, contact us at privacy@bookforge.ai
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
