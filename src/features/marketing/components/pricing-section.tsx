import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying BookForge AI.",
    cta: "Get started free",
    href: "/sign-up",
    popular: false,
    features: [
      "3 AI credits",
      "eBooks & PDF Guides",
      "Basic export (with watermark)",
      "Community support",
    ],
    disabled: [],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For solo creators who publish regularly.",
    cta: "Start Pro trial",
    href: "/sign-up?plan=pro",
    popular: true,
    features: [
      "100 AI credits / month",
      "All 10 document types",
      "PDF export — no watermark",
      "Custom tone & style",
      "Priority AI generation",
      "Email support",
    ],
    disabled: [],
  },
  {
    name: "Agency",
    price: "$79",
    period: "/ month",
    description: "For teams and high-volume publishers.",
    cta: "Contact sales",
    href: "/sign-up?plan=enterprise",
    popular: false,
    features: [
      "500 AI credits / month",
      "Everything in Pro",
      "Team seats (up to 5)",
      "White-label exports",
      "API access",
      "Dedicated support",
    ],
    disabled: [],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel any time.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8 transition-shadow",
                plan.popular
                  ? "border-[hsl(var(--primary)/0.6)] shadow-[0_0_0_1px_hsl(var(--primary)/0.3),0_8px_30px_hsl(var(--primary)/0.12)]"
                  : "border-[hsl(var(--border))] hover:shadow-md"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-[11px] font-semibold text-[hsl(var(--primary-foreground))]">
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[hsl(var(--foreground))]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {plan.description}
                </p>
              </div>

              <ul className="my-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground))]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={plan.popular ? "default" : "outline"}
                asChild
                className="w-full"
              >
                <Link href={plan.href}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          All plans include a 7-day money-back guarantee. No credit card required for Free.
        </p>
      </div>
    </section>
  );
}
