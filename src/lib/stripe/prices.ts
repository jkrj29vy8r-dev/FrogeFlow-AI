export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  agency_monthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? "",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICES;

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
  enterprise: {
    documents_per_month: Infinity,
    credits_per_month: 500,
    watermark: false,
  },
} as const;
