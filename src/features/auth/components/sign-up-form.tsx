"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/features/auth/actions/auth.actions";
import { Loader2, CheckCircle2 } from "lucide-react";

const initialState = { error: undefined, success: undefined };

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-[hsl(var(--primary))]" />
        </div>
        <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {state.success}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          Start building digital products with AI
        </p>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
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
            {isPending ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
