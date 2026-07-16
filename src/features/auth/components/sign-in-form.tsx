"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/auth/actions/auth.actions";
import { OAuthButton } from "@/features/auth/components/oauth-button";
import { MagicLinkForm } from "@/features/auth/components/magic-link-form";
import { Loader2 } from "lucide-react";

const initialState = { error: undefined, success: undefined };

export function SignInForm() {
  const t = useTranslations("auth.signIn");
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [showMagicLink, setShowMagicLink] = useState(false);

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        {/* OAuth providers */}
        <div className="space-y-2">
          <OAuthButton provider="google" label="Continue with Google" />
          <OAuthButton provider="github" label="Continue with GitHub" />
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">or</span>
          <div className="h-px flex-1 bg-[hsl(var(--border))]" />
        </div>

        {showMagicLink ? (
          <>
            <MagicLinkForm />
            <button
              type="button"
              onClick={() => setShowMagicLink(false)}
              className="mt-3 w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              Use password instead
            </button>
          </>
        ) : (
          <>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailLabel")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("passwordLabel")}</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                />
              </div>

              {state?.error && (
                <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
                  {state.error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? t("submitting") : t("submit")}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setShowMagicLink(true)}
              className="mt-3 w-full text-center text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              Sign in with magic link instead
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t("noAccount")}{" "}
        <Link
          href="/sign-up"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </div>
  );
}
