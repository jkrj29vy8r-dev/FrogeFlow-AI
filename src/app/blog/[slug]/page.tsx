import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { Clock, ArrowLeft } from "lucide-react";
import { BLOG_POSTS as POSTS } from "@/features/marketing/data/blog-posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — BookForge AI Blog`,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const paragraphs = post.body.split("\n\n");

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-2xl px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Blog
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-0.5 text-xs font-semibold text-[hsl(var(--primary))]">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readTime} min read
            </span>
            <span>{post.date}</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
            {post.excerpt}
          </p>

          <div className="mt-10 space-y-5 text-[hsl(var(--foreground))] leading-relaxed">
            {paragraphs.map((para, i) => {
              if (para.startsWith("## ")) {
                return (
                  <h2 key={i} className="mt-10 text-xl font-bold text-[hsl(var(--foreground))]">
                    {para.slice(3)}
                  </h2>
                );
              }
              if (para.startsWith("**") && para.endsWith("**")) {
                return (
                  <p key={i} className="font-semibold">
                    {para.slice(2, -2)}
                  </p>
                );
              }
              if (para.startsWith("- ")) {
                const items = para.split("\n").filter(l => l.startsWith("- "));
                return (
                  <ul key={i} className="space-y-1.5 pl-1">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                        {item.slice(2)}
                      </li>
                    ))}
                  </ul>
                );
              }
              const rendered = para
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
              return (
                <p
                  key={i}
                  className="text-[hsl(var(--muted-foreground))] text-sm leading-7"
                  dangerouslySetInnerHTML={{ __html: rendered }}
                />
              );
            })}
          </div>

          <div className="mt-16 rounded-2xl bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] p-8 text-center">
            <p className="font-semibold text-[hsl(var(--foreground))]">Ready to create your first digital product?</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Start for free. No credit card required.</p>
            <Link
              href="/sign-up"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
