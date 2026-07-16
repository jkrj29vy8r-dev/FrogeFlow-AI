"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { absoluteUrl } from "@/lib/utils";
import { authRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

// ── Schemas ───────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActionResult = {
  error?: string;
  success?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function signUp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await authRateLimit(`signup:${ip}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: absoluteUrl("/auth/callback"),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Account created! Please check your email to confirm your account." };
}

export async function signIn(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const email = (formData.get("email") as string | null) ?? "";
  const rl = await authRateLimit(`signin:${ip}:${email}`);
  if (!rl.success) {
    return { error: "Too many sign-in attempts. Please wait a minute and try again." };
  }

  const parsed = signInSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Invalid email or password" };
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await authRateLimit(`forgot:${ip}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
  });

  // Always return success to avoid email enumeration
  return { success: "If that email is registered, a reset link is on its way." };
}

export async function resetPassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signInWithMagicLink(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = await authRateLimit(`magic:${ip}`);
  if (!rl.success) {
    return { error: "Too many attempts. Please wait a moment and try again." };
  }

  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: absoluteUrl("/auth/callback"),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Magic link sent! Check your inbox to sign in." };
}

export async function signInWithOAuth(provider: "google" | "github"): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: absoluteUrl("/auth/callback"),
    },
  });

  if (error || !data.url) {
    redirect(`/sign-in?error=oauth_failed`);
  }

  redirect(data.url);
}

export async function changePassword(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Verify current password by attempting a re-auth sign-in
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: "Not authenticated" };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { error: "Current password is incorrect" };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated successfully." };
}
