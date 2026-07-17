import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Check, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/database";

export const metadata: Metadata = {
  title: "Billing",
};

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Great for exploring what BookForge AI can do.",
    features: [
      "1 document per month",
      "Watermarked exports",
      "3 AI credits",
      "PDF export",
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For creators who want to ship content fast, every month.",
    features: [
      "Unlimited documents",
      "No watermark",
      "100 AI credits / month",
      "PDF export",
      "Priority generation",
      "All product types",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    period: "per month",
    description: "For teams and agencies building content at scale.",
    features: [
      "Everything in Pro",
      "500 AI credits / month",
      "3 team members",
      "White-label exports",
      "API access",
      "Priority support",
    ],
    cta: "Upgrade to Agency",
    highlighted: false,
  },
] as const;

const PLAN_ICONS = {
  free: Zap,
  pro: Zap,
  agency: Building2,
} as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, username, language, timezone, last_login, plan, credits, created_at, updated_at")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const currentPlan = profile?.plan ?? "free";
  const credits = profile?.credits ?? 0;

  let documentsThisMonth = 0;
  if (user) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth);
    documentsThisMonth = count ?? 0;
  }

  return (
    <div className="space-y-8">
      {params.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          🎉 Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {params.canceled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Checkout canceled. No charges were made.
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Billing</h1>
        <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
          Manage your subscription and usage.
        </p>
      </div>

      {/* Current plan summary */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Current plan
            </p>
            <p className="mt-1 text-xl font-bold capitalize text-[hsl(var(--foreground))]">
              {currentPlan}
            </p>
          </div>
          <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-sm font-semibold capitalize text-[hsl(var(--primary))]">
            {currentPlan}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[hsl(var(--muted))] p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">AI Credits remaining</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">{credits}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--border))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--primary))]"
                style={{ width: `${Math.min(100, (credits / (currentPlan === "pro" ? 100 : currentPlan === "agency" ? 500 : 3)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--muted))] p-4">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Documents this month</p>
            <p className="mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">{documentsThisMonth}</p>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              {currentPlan === "free" ? "1 document limit" : "Unlimited"}
            </p>
          </div>
        </div>

        {currentPlan !== "free" && (
          <div className="mt-4 flex justify-end">
            <Link
              href="/api/billing/portal"
              className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            >
              Manage subscription →
            </Link>
          </div>
        )}
      </div>

      {/* Plans */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
          Choose your plan
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id];
            const isCurrent = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border p-5 ${
                  plan.highlighted
                    ? "border-[hsl(var(--primary))] shadow-md shadow-[hsl(var(--primary)/0.1)]"
                    : "border-[hsl(var(--border))]"
                } bg-[hsl(var(--card))]`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[hsl(var(--primary))] px-3 py-0.5 text-[10px] font-semibold text-white">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      plan.highlighted
                        ? "bg-[hsl(var(--primary)/0.1)]"
                        : "bg-[hsl(var(--muted))]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        plan.highlighted
                          ? "text-[hsl(var(--primary))]"
                          : "text-[hsl(var(--muted-foreground))]"
                      }`}
                    />
                  </div>
                  <p className="font-semibold text-[hsl(var(--foreground))]">{plan.name}</p>
                </div>

                <div className="mt-3">
                  <span className="text-2xl font-bold text-[hsl(var(--foreground))]">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {plan.period}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {plan.description}
                </p>

                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-[hsl(var(--foreground))]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] disabled:opacity-60"
                    >
                      Current plan
                    </button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                      asChild
                    >
                      <Link href={`/api/billing/checkout?plan=${plan.id}`}>
                        {plan.cta}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        All plans include a 30-day money-back guarantee. No questions asked.
      </p>
    </div>
  );
}
