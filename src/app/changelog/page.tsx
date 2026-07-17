import type { Metadata } from "next";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";

export const metadata: Metadata = {
  title: "Changelog — BookForge AI",
};

const RELEASES = [
  {
    version: "1.0.0",
    date: "July 2025",
    highlights: [
      "AI Cover Design Studio — Canva-style editor with 6 layouts, 8 palettes, drag-and-drop",
      "Generate Complete Digital Business — single click creates 14 assets",
      "AI Landing Page & Sales Page Generator",
      "World-class PDF Export with Playwright",
      "Premium rich text editor with AI section generation",
      "Projects dashboard with SSE progress tracking",
      "Stripe billing with checkout, portal, and webhooks",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Changelog</h1>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">What&apos;s new in BookForge AI</p>

          <div className="mt-10 space-y-10">
            {RELEASES.map(r => (
              <div key={r.version}>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-sm font-semibold text-[hsl(var(--primary))]">
                    v{r.version}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{r.date}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {r.highlights.map(h => (
                    <li key={h} className="flex items-start gap-2 text-sm text-[hsl(var(--foreground))]">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
