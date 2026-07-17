import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — BookForge AI",
  description: "Tips, tutorials, and insights for digital product creators.",
};

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  featured?: boolean;
}

const POSTS: Post[] = [
  {
    slug: "how-to-create-ebook-with-ai",
    title: "How to Create a Professional eBook in Under 10 Minutes with AI",
    excerpt: "Gone are the days of spending weeks writing, formatting, and designing your eBook. Here's how modern creators use AI to ship polished digital products fast.",
    category: "Tutorial",
    readTime: 6,
    date: "July 10, 2025",
    featured: true,
  },
  {
    slug: "digital-product-pricing-guide",
    title: "The Creator's Guide to Pricing Digital Products in 2025",
    excerpt: "Underpricing is the #1 mistake new digital product creators make. Learn the psychology of pricing and how to position your products for maximum value.",
    category: "Strategy",
    readTime: 8,
    date: "July 7, 2025",
  },
  {
    slug: "landing-page-conversion-tips",
    title: "7 Landing Page Elements That Double Conversion Rates",
    excerpt: "Your landing page has one job: convert visitors into buyers. These seven proven elements — backed by A/B test data — will dramatically lift your conversion rate.",
    category: "Marketing",
    readTime: 5,
    date: "July 3, 2025",
  },
  {
    slug: "lead-magnet-ideas",
    title: "50 High-Converting Lead Magnet Ideas for Every Niche",
    excerpt: "The right lead magnet can 10x your email list growth. We've compiled 50 ideas — from checklists to mini-courses — organized by niche so you can start fast.",
    category: "Growth",
    readTime: 7,
    date: "June 28, 2025",
  },
  {
    slug: "ai-cover-design-guide",
    title: "AI Cover Design: How to Create Covers That Sell",
    excerpt: "Your cover is the first thing a potential buyer sees. Learn how to use AI-generated design variations and what makes covers convert in a crowded marketplace.",
    category: "Design",
    readTime: 4,
    date: "June 22, 2025",
  },
  {
    slug: "email-sequence-digital-products",
    title: "The 7-Email Welcome Sequence That Turns Subscribers Into Buyers",
    excerpt: "Most creators waste their email list. This battle-tested 7-email sequence nurtures new subscribers and consistently converts them into paying customers.",
    category: "Email",
    readTime: 6,
    date: "June 16, 2025",
  },
];

const CATEGORIES = ["All", "Tutorial", "Strategy", "Marketing", "Growth", "Design", "Email"];

const CATEGORY_COLORS: Record<string, string> = {
  Tutorial: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Strategy: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Marketing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Growth: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Design: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  Email: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
};

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured);

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-[hsl(var(--border))] py-14">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))]">Blog</h1>
            <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">
              Tips, tutorials, and insights for digital product creators.
            </p>
            {/* Category pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map(cat => (
                <span
                  key={cat}
                  className="rounded-full border border-[hsl(var(--border))] px-4 py-1 text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))] cursor-default"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-6 py-12">
          {/* Featured post */}
          {featured && (
            <div className="mb-12">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--primary))]">Featured</p>
              <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[featured.category] ?? ""}`}>
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.readTime} min read
                  </span>
                  <span>{featured.date}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--foreground))] leading-snug">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {featured.excerpt}
                </p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Read article →
                </Link>
              </article>
            </div>
          )}

          {/* Article grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map(post => (
              <article
                key={post.slug}
                className="flex flex-col rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className={`rounded-full px-2.5 py-0.5 font-semibold ${CATEGORY_COLORS[post.category] ?? ""}`}>
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {post.readTime} min
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold leading-snug text-[hsl(var(--foreground))]">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{post.date}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 rounded-2xl bg-[hsl(var(--primary)/0.06)] border border-[hsl(var(--primary)/0.15)] p-8 text-center">
            <Tag className="mx-auto mb-4 h-8 w-8 text-[hsl(var(--primary))]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Get creator insights in your inbox</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              New articles on AI, digital products, and creator growth — delivered weekly.
            </p>
            <form className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] sm:w-72"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-[hsl(var(--primary))] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
