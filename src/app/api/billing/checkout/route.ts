import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_PRICES } from "@/lib/stripe/prices";
import { env } from "@/lib/env";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/sign-in", req.url));

  const plan = req.nextUrl.searchParams.get("plan");
  if (!plan || plan === "free") {
    return NextResponse.redirect(new URL("/billing", req.url));
  }

  const priceKey = plan === "pro" ? "pro_monthly" : plan === "agency" ? "agency_monthly" : null;
  if (!priceKey) return NextResponse.redirect(new URL("/billing", req.url));

  const priceId = STRIPE_PRICES[priceKey];
  if (!priceId) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const stripe = getStripe();
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  // Get or create stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user.id)
    .single();

  let customerId: string | undefined = (profile as { stripe_customer_id?: string } | null)?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? "",
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId } as never)
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
  });

  return NextResponse.redirect(session.url!);
}
