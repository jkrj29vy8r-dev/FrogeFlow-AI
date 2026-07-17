"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  fullName: z.string().max(100).optional(),
  username: z
    .string()
    .max(30)
    .regex(/^[a-zA-Z0-9_-]*$/, "Username may only contain letters, numbers, hyphens, and underscores")
    .optional(),
});

const preferencesSchema = z.object({
  language: z.enum(["en", "es", "pt", "fr", "de"]),
  timezone: z.string().max(50),
});

export async function updateProfile(_prev: { error: string | null } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName") ?? undefined,
    username: formData.get("username") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const updates: Record<string, string> = {};
  if (parsed.data.fullName !== undefined) updates.full_name = parsed.data.fullName.trim();
  if (parsed.data.username !== undefined) updates.username = parsed.data.username.trim();

  if (Object.keys(updates).length === 0) return { error: null };

  if (updates.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", updates.username)
      .neq("id", user.id)
      .maybeSingle();
    if (existing) return { error: "Username is already taken" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: "Failed to save profile" };

  revalidatePath("/settings");
  return { error: null };
}

export async function updatePreferences(_prev: { error: string | null } | null, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = preferencesSchema.safeParse({
    language: formData.get("language"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { error } = await supabase
    .from("profiles")
    .update({ language: parsed.data.language, timezone: parsed.data.timezone, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: "Failed to save preferences" };

  revalidatePath("/settings");
  return { error: null };
}
