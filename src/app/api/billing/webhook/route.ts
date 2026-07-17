export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      if (userId && plan) {
        await supabase.from("profiles").update({ plan } as never).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (!userId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";
      const plan = sub.metadata?.plan ?? (isActive ? "pro" : "free");

      await supabase.from("profiles").update({ plan: isActive ? plan : "free" } as never).eq("id", userId);

      const item = sub.items.data[0];
      // In Stripe API 2026-06-24, period dates are on the subscription item
      const periodStart = (item as unknown as { current_period_start?: number })?.current_period_start;
      const periodEnd = (item as unknown as { current_period_end?: number })?.current_period_end;

      await supabase.from("subscriptions").upsert({
        id: sub.id,
        user_id: userId,
        status: sub.status,
        price_id: item?.price.id ?? "",
        quantity: item?.quantity ?? 1,
        cancel_at_period_end: sub.cancel_at_period_end,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : new Date().toISOString(),
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        trial_start: sub.trial_start ? new Date(sub.trial_start * 1000).toISOString() : null,
        trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) {
        await supabase.from("profiles").update({ plan: "free" } as never).eq("id", userId);
        await supabase.from("subscriptions").update({ status: "canceled" }).eq("id", sub.id);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
