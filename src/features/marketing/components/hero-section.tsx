import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-32">
      {/* Gradient orb background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[hsl(var(--primary)/0.12)] blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-1.5 text-sm font-medium text-[hsl(var(--muted-foreground))]">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
          Powered by advanced AI
        </div>

        {/* Headline */}
        <h1 className="text-balance text-5xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
          Create digital products{" "}
          <span className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(252_87%_75%)] bg-clip-text text-transparent">
            in minutes
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-[hsl(var(--muted-foreground))] sm:text-xl">
          BookForge AI transforms your ideas into polished eBooks, guides,
          workbooks, and marketing content — structured, editable, and ready to
          sell.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="xl" asChild>
            <Link href="/sign-up">
              Start creating for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="#features">See how it works</Link>
          </Button>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-[hsl(var(--muted-foreground))]">
          No credit card required · 3 free documents per month
        </p>
      </div>
    </section>
  );
}
