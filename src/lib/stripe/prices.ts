export type StripePriceKey = "pro_monthly" | "agency_monthly";

export function getStripePrices(): Record<StripePriceKey, string> {
  const pro = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const agency = process.env.STRIPE_PRICE_AGENCY_MONTHLY;
  if (!pro || !agency) {
    throw new Error(
      "STRIPE_PRICE_PRO_MONTHLY or STRIPE_PRICE_AGENCY_MONTHLY is not set. Add them to your deployment's environment variables."
    );
  }
  return { pro_monthly: pro, agency_monthly: agency };
}

export const PLAN_LIMITS = {
  free: {
    documents_per_month: 1,
    credits_per_month: 3,
    watermark: true,
  },
  pro: {
    documents_per_month: Infinity,
    credits_per_month: 100,
    watermark: false,
  },
  agency: {
    documents_per_month: Infinity,
    credits_per_month: 500,
    watermark: false,
  },
} as const;
