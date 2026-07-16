"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/features/auth/actions/auth.actions";
import { Loader2, CheckCircle2 } from "lucide-react";

const initialState = { error: undefined, success: undefined };

export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-[hsl(var(--primary))]" />
        </div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          {t("success.title")}
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {t("success.message")}
        </p>
      </div>
    );
  }

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
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder={t("fullNamePlaceholder")}
              autoComplete="name"
              required
              disabled={isPending}
            />
          </div>

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
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
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

          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            {t.rich("terms", {
              terms: (chunks) => (
                <Link href="/terms" className="hover:underline">
                  {chunks}
                </Link>
              ),
              privacy: (chunks) => (
                <Link href="/privacy" className="hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t("hasAccount")}{" "}
        <Link
          href="/sign-in"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
