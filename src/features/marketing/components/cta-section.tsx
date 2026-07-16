import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(252,87%,55%)] to-[hsl(280,80%,55%)] px-8 py-16 text-center shadow-2xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
          <Sparkles className="h-3.5 w-3.5" />
          Start for free — no credit card needed
        </div>

        <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Your next digital product is one prompt away
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-white/80">
          Join 50,000+ creators who use BookForge AI to publish eBooks, guides, and marketing
          content — in minutes, not months.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="xl"
            asChild
            className="bg-white text-[hsl(var(--primary))] hover:bg-white/90"
          >
            <Link href="/sign-up">
              Create your first document free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
            <Link href="#pricing">View pricing</Link>
          </Button>
        </div>

        <p className="mt-5 text-sm text-white/60">
          Free forever plan · No credit card required · Cancel any time
        </p>
      </div>
    </section>
  );
}
