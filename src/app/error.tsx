"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--destructive)/0.1)]">
        <AlertCircle className="h-8 w-8 text-[hsl(var(--destructive))]" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        An unexpected error occurred. Our team has been notified.
      </p>
      {error.digest && (
        <p className="mt-1 font-mono text-xs text-[hsl(var(--muted-foreground))]">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
