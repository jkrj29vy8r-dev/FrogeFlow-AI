import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { BLOG_POSTS } from "@/features/marketing/data/blog-posts";

export const metadata: Metadata = {
  title: "Blog — BookForge AI",
};

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Blog</h1>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">
            Tips, tutorials, and insights for digital product creators.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 px-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-[hsl(var(--border))] p-6 transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--accent)/0.4)]"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-0.5 font-semibold text-[hsl(var(--primary))]">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {post.readTime} min read
                </span>
                <span>{post.date}</span>
              </div>

              <h2 className="mt-3 text-lg font-semibold leading-snug text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))]">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
