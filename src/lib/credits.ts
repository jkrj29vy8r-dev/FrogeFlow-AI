import type { SupabaseClient } from "@supabase/supabase-js";

export const CREDIT_COSTS = {
  outline_generated: 1,
  section_generated: 1,
  cover_generated: 1,
  landing_page_generated: 2,
  project_generated: 5,
  pdf_exported: 1,
  asset_regenerated: 1,
  landing_section_regenerated: 1,
  text_edited: 1,
} as const;

export type CreditEventType = keyof typeof CREDIT_COSTS;

export async function checkCredits(
  supabase: SupabaseClient,
  userId: string,
  required: number
): Promise<{ ok: boolean; credits: number }> {
  const { data } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  if (!data) return { ok: false, credits: 0 };
  // Pro/agency plans get unlimited credits (represented as -1 or very high value)
  if (data.plan === "pro" || data.plan === "agency") return { ok: true, credits: data.credits as number };
  return { ok: (data.credits as number) >= required, credits: data.credits as number };
}

export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  eventType: CreditEventType,
  metadata?: Record<string, unknown>
): Promise<void> {
  const cost = CREDIT_COSTS[eventType];

  // Don't deduct for paid plans
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .single();

  if (!profile) return;
  if (profile.plan === "pro" || profile.plan === "agency") {
    // Still log the usage event but don't deduct
    await supabase.from("usage_events").insert({
      user_id: userId,
      event_type: eventType,
      credits_used: 0,
      metadata: metadata ?? {},
    });
    return;
  }

  const newCredits = Math.max(0, (profile.credits as number) - cost);
  await Promise.all([
    supabase.from("profiles").update({ credits: newCredits }).eq("id", userId),
    supabase.from("usage_events").insert({
      user_id: userId,
      event_type: eventType,
      credits_used: cost,
      metadata: metadata ?? {},
    }),
  ]);
}
