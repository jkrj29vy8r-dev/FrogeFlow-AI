import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 h-64 w-64 rounded-full bg-[hsl(var(--primary)/0.15)] blur-3xl"
        />

        <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl lg:text-5xl">
          Ready to build your first digital product?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
          Join creators worldwide using BookForge AI to launch digital products
          faster than ever before.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="xl" asChild>
            <Link href="/sign-up">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          Free plan · No credit card · Cancel anytime
        </p>
      </div>
    </section>
  );
}
