"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithMagicLink } from "@/features/auth/actions/auth.actions";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

const initialState = { error: undefined, success: undefined };

export function MagicLinkForm() {
  const [state, formAction, isPending] = useActionState(signInWithMagicLink, initialState);

  if (state?.success) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center shadow-sm">
        <div className="mb-3 flex justify-center">
          <CheckCircle2 className="h-10 w-10 text-[hsl(var(--primary))]" />
        </div>
        <h3 className="font-semibold text-[hsl(var(--foreground))]">Check your inbox</h3>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <p className="rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="outline" className="w-full gap-2" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isPending ? "Sending…" : "Send magic link"}
      </Button>
    </form>
  );
}
