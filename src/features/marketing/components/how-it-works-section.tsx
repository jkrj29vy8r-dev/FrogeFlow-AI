import { Sparkles, Edit3, Download } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: Sparkles,
    title: "Describe your idea",
    description:
      "Tell the AI what you want to create — a topic, audience, and goal is all it takes. No prompting expertise required.",
    color: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-500/10",
    lightText: "text-violet-600 dark:text-violet-400",
  },
  {
    step: "02",
    icon: Edit3,
    title: "Review & refine",
    description:
      "Your document is generated chapter-by-chapter. Edit any section, regenerate paragraphs, or change tone — you're always in control.",
    color: "from-blue-500 to-cyan-600",
    lightBg: "bg-blue-500/10",
    lightText: "text-blue-600 dark:text-blue-400",
  },
  {
    step: "03",
    icon: Download,
    title: "Export & publish",
    description:
      "Download a polished PDF, share a link, or sell it on your store. No watermarks on paid plans. Done in minutes.",
    color: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-500/10",
    lightText: "text-emerald-600 dark:text-emerald-400",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            From idea to product{" "}
            <span className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(252,87%,65%)] bg-clip-text text-transparent">
              in three steps
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            No complex setup. No writing blocks. Just describe what you need and BookForge AI
            handles the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden
            className="absolute left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] top-[2.75rem] hidden h-px bg-gradient-to-r from-violet-300 via-blue-300 to-emerald-300 opacity-40 md:block"
          />

          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {/* Step number bubble */}
                <div
                  className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--background))] text-[10px] font-bold text-[hsl(var(--foreground))] shadow">
                    {s.step}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
