"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--destructive)/0.1)]">
        <AlertCircle className="h-6 w-6 text-[hsl(var(--destructive))]" />
      </div>
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
        Something went wrong
      </h2>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {error.digest ? `Error: ${error.digest}` : "Please try again or contact support."}
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Try again
      </button>
    </div>
  );
}
