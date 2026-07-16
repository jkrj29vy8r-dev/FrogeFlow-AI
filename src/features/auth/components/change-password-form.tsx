"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/features/auth/actions/auth.actions";
import { Loader2, CheckCircle2 } from "lucide-react";

const initialState = { error: undefined, success: undefined };

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          required
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
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

      {state?.success && (
        <p className="flex items-center gap-2 rounded-md bg-[hsl(var(--primary)/0.1)] px-3 py-2 text-sm text-[hsl(var(--primary))]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
