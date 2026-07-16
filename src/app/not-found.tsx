import { Link } from "@/i18n/navigation";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
        <FileQuestion className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </div>
  );
}
