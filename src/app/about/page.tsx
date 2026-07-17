import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { BookOpen, Sparkles, Zap, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About — BookForge AI",
  description: "We're on a mission to make professional digital product creation accessible to everyone.",
};

const VALUES = [
  { icon: Sparkles, title: "AI-First", desc: "We believe AI should do the heavy lifting, so creators can focus on their unique knowledge and voice." },
  { icon: Zap, title: "Speed", desc: "From idea to complete digital product in minutes, not weeks. Time is the most valuable resource for creators." },
  { icon: BookOpen, title: "Quality", desc: "Professional-grade output that rivals hand-crafted documents — beautiful typography, smart layouts, polished exports." },
  { icon: Globe, title: "Accessibility", desc: "World-class tools shouldn't cost a fortune. We make premium creation affordable for every creator." },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)]">
              <BookOpen className="h-8 w-8 text-[hsl(var(--primary))]" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
              We&apos;re building the future of<br />digital product creation
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
              BookForge AI was built for creators, coaches, consultants, and entrepreneurs who want to package their knowledge into beautiful digital products — without spending weeks writing, designing, and formatting.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="border-t border-[hsl(var(--border))] py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="mb-10 text-center text-2xl font-bold text-[hsl(var(--foreground))]">Our values</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map(v => (
                <div key={v.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                    <v.icon className="h-6 w-6 text-[hsl(var(--primary))]" />
                  </div>
                  <h3 className="font-semibold text-[hsl(var(--foreground))]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[hsl(var(--border))] py-16 text-center">
          <div className="mx-auto max-w-xl px-6">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Ready to create something amazing?</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">Start for free. No credit card required.</p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
