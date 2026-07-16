import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2.5 font-semibold">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg text-[hsl(var(--foreground))]">
          BookForge AI
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
