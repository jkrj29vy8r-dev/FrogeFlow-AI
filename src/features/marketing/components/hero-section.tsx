import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";

function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* Glow behind the card */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-3xl bg-[hsl(var(--primary)/0.25)] blur-3xl"
      />

      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-rose-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 flex-1 rounded-md bg-[hsl(var(--background))] px-3 py-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            bookforgeai.com/editor
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Doc header */}
          <div className="mb-4 overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(254,80%,45%)] p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-white/20">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-[11px] font-semibold text-white/80">AI GENERATOR</span>
            </div>
            <p className="mt-2 text-base font-bold text-white">
              The Ultimate Guide to Intermittent Fasting
            </p>
            <p className="mt-0.5 text-[11px] text-white/70">eBook · 18 chapters · ~30 pages</p>
          </div>

          {/* Outline preview */}
          <div className="space-y-2">
            {[
              { label: "Introduction to Intermittent Fasting", done: true },
              { label: "The Science Behind Time-Restricted Eating", done: true },
              { label: "Getting Started: Your First 7 Days", done: true },
              { label: "Common Mistakes & How to Avoid Them", done: false },
              { label: "Advanced Protocols for Maximum Results", done: false },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5"
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    item.done
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {item.done ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span
                  className={`flex-1 text-[11px] ${
                    item.done
                      ? "text-[hsl(var(--foreground))]"
                      : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {item.label}
                </span>
                {item.done && (
                  <span className="shrink-0 text-[10px] font-medium text-emerald-500">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Footer bar */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--primary))]" />
              <span className="text-[10px] font-medium text-[hsl(var(--primary))]">
                AI writing chapter 4…
              </span>
            </div>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              ~2 min remaining
            </span>
          </div>
        </div>
      </div>

      {/* Floating badge: speed */}
      <div className="absolute -right-4 -top-4 flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 shadow-lg">
        <span className="text-base">⚡</span>
        <div>
          <p className="text-[10px] font-bold text-[hsl(var(--foreground))]">Generated in</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">1 min 42 sec</p>
        </div>
      </div>

      {/* Floating badge: export */}
      <div className="absolute -bottom-4 -left-4 flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 shadow-lg">
        <span className="text-base">📄</span>
        <div>
          <p className="text-[10px] font-bold text-[hsl(var(--foreground))]">PDF ready</p>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">32 pages · no watermark</p>
        </div>
      </div>
    </div>
  );
}

function AvatarStack() {
  const colors = [
    "bg-violet-400",
    "bg-blue-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-rose-400",
  ];
  const initials = ["JK", "SR", "TM", "AL", "PW"];
  return (
    <div className="flex -space-x-2">
      {colors.map((color, i) => (
        <div
          key={i}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[hsl(var(--background))] text-[9px] font-bold text-white ${color}`}
        >
          {initials[i]}
        </div>
      ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pt-24">
      {/* Layered gradient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[700px] w-[700px] -translate-y-1/3 rounded-full bg-[hsl(var(--primary)/0.1)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/4 rounded-full bg-[hsl(252,87%,75%/0.08)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[600px] rounded-full bg-[hsl(var(--primary)/0.05)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.06)] px-4 py-1.5 text-sm font-medium text-[hsl(var(--primary))]">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Claude Sonnet 5
            </div>

            {/* Headline */}
            <h1 className="text-balance text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl lg:text-6xl">
              Create digital products{" "}
              <span className="bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(252,87%,65%)] to-[hsl(280,80%,65%)] bg-clip-text text-transparent">
                in minutes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-[hsl(var(--muted-foreground))] lg:mx-0">
              BookForge AI transforms your ideas into polished eBooks, guides, workbooks, and
              marketing content — structured, editable, and ready to sell.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button size="xl" asChild>
                <Link href="/sign-up">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <AvatarStack />
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold text-[hsl(var(--foreground))]">50,000+</span>{" "}
                creators trust BookForge AI
              </div>
              <div className="hidden h-4 w-px bg-[hsl(var(--border))] sm:block" />
              <div className="flex items-center gap-1 text-sm">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i} className="text-amber-400">{star}</span>
                ))}
                <span className="ml-1 text-[hsl(var(--muted-foreground))]">4.9/5</span>
              </div>
            </div>

            {/* No-CC note */}
            <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
              No credit card required · Free forever plan
            </p>
          </div>

          {/* Right: product mockup */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <ProductMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
