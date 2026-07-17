import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — BookForge AI",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Get in touch</h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))]">
            We&apos;d love to hear from you. Reach out anytime.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <a
              href="mailto:hello@bookforge.ai"
              className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                <Mail className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Email</p>
                <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">hello@bookforge.ai</p>
              </div>
            </a>

            <a
              href="mailto:support@bookforge.ai"
              className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                <MessageCircle className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Support</p>
                <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">support@bookforge.ai</p>
              </div>
            </a>

            <a
              href="https://x.com/bookforgeai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                <span className="text-2xl font-bold text-[hsl(var(--primary))]">𝕏</span>
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">X (Twitter)</p>
                <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">@bookforgeai</p>
              </div>
            </a>
          </div>

          <div className="mt-12 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-left">
            <h2 className="font-semibold text-[hsl(var(--foreground))]">Support hours</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Monday – Friday: 9am – 5pm ET<br />
              We typically respond within 24 hours. For urgent issues, use live chat.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
