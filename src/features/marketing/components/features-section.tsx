import { Zap, Edit3, Download, Layers, Shield, Wand2 } from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    title: "AI-powered generation",
    description:
      "Describe your idea and watch BookForge AI write a full, structured document — chapters, headings, content and all.",
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: Edit3,
    title: "Fully editable",
    description:
      "Every section, paragraph, and heading is editable. Regenerate individual parts or rewrite from scratch — your content, your way.",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Layers,
    title: "10 document types",
    description:
      "eBooks, PDF Guides, Workbooks, Checklists, Lead Magnets, Landing Pages, Sales Pages, Marketing Content, Social Posts, Email Campaigns.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: Download,
    title: "One-click export",
    description:
      "Download polished PDFs in seconds. No watermarks on paid plans. Print-ready or screen-ready — your call.",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Zap,
    title: "Blazing fast",
    description:
      "Most documents are generated in under two minutes. Stop staring at a blank page and start publishing.",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  {
    icon: Shield,
    title: "Your content, privately",
    description:
      "Your prompts and documents are never used to train AI models. What you create stays yours — always.",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(252,87%,65%)] bg-clip-text text-transparent">
              publish faster
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            BookForge AI handles the hard parts so you can focus on ideas, not formatting.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <Icon className="h-5 w-5" />
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
