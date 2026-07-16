import { Zap, Edit3, Download, Layers, Shield, Wand2 } from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description:
      "Describe your topic and let AI create structured, professional content instantly.",
  },
  {
    icon: Edit3,
    title: "Fully Editable",
    description:
      "Every generated section is editable. Refine tone, add details, restructure freely.",
  },
  {
    icon: Layers,
    title: "Multiple Formats",
    description:
      "eBooks, workbooks, checklists, lead magnets, sales pages — one platform.",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Export as PDF, HTML, or structured data. Ready for Gumroad, Shopify, or your own store.",
  },
  {
    icon: Zap,
    title: "Blazing Fast",
    description:
      "Generate a complete 30-page guide in under 2 minutes. No waiting, no friction.",
  },
  {
    icon: Shield,
    title: "Your Content, Secured",
    description:
      "All documents are private by default. Row-level security ensures only you see your work.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            Everything you need to create and sell
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            BookForge AI is built for creators who want to move fast without
            sacrificing quality.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                  <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="mb-2 font-semibold text-[hsl(var(--foreground))]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
