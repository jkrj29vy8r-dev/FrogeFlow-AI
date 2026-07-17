import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/features/marketing/components/marketing-nav";
import { MarketingFooter } from "@/features/marketing/components/marketing-footer";
import { Clock, ArrowLeft } from "lucide-react";

interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  body: string;
}

const POSTS: Post[] = [
  {
    slug: "how-to-create-ebook-with-ai",
    title: "How to Create a Professional eBook in Under 10 Minutes with AI",
    excerpt: "Gone are the days of spending weeks writing, formatting, and designing your eBook.",
    category: "Tutorial",
    readTime: 6,
    date: "July 10, 2025",
    body: `Creating a professional eBook used to take weeks. You had to write every chapter, hire a designer, wrestle with formatting tools, and still end up with something that looked like it was made in the early 2000s.

**With AI, that's over.**

BookForge AI can take your topic, target audience, and goals and generate a complete, publication-ready eBook — outline, chapters, cover, and all — in under 10 minutes. Here's exactly how.

## Step 1: Define your topic and audience

The more specific you are, the better the output. Instead of "productivity," try "time-blocking strategies for freelance designers with ADHD." Specificity is what separates a forgettable generic guide from something people actually buy.

## Step 2: Generate your outline

BookForge's AI analyzes your topic and generates a logical, professional chapter structure. You can tweak the outline — reorder chapters, rename sections, add or remove topics — before you generate any content.

## Step 3: Generate section content

Click to generate each section. The AI writes in-depth, well-structured prose, then you review and edit. Most creators find themselves spending more time curating than writing.

## Step 4: Design your cover

The Cover Studio generates professional cover variations in seconds. Pick your favorite, customize the colors and typography, and you have a cover that rivals traditionally designed products.

## Step 5: Export to PDF

One click produces a beautifully formatted PDF with a cover page, table of contents, page numbers, and professional typography. Ready to sell on Gumroad, Etsy, or your own site.

That's it. Ten minutes from idea to polished eBook.`,
  },
  {
    slug: "digital-product-pricing-guide",
    title: "The Creator's Guide to Pricing Digital Products in 2025",
    excerpt: "Underpricing is the #1 mistake new digital product creators make.",
    category: "Strategy",
    readTime: 8,
    date: "July 7, 2025",
    body: `Most new digital product creators underprice their work by 50–80%. It's the single biggest revenue leak in the creator economy, and it's almost entirely driven by imposter syndrome.

Here's the truth: **digital products are priced on value, not effort.** A checklist that saves someone $10,000 in accounting mistakes is worth far more than $9.

## The value-first pricing framework

Start with the outcome your product delivers, then work backwards.

- What problem does it solve?
- What would a professional consultant charge to solve the same problem?
- What does your buyer's next-best alternative cost?

If your eBook helps freelancers land their first $5,000 client, pricing it at $27 is a no-brainer for the buyer.

## Price anchoring

Always offer at least two tiers. A "basic" version and a "premium" bundle. The premium bundle — with bonuses, templates, and extras — makes the base price look like the obvious choice.

## Testing your price

Launch at your target price. If you convert more than 3% of visitors, raise the price. If you convert less than 1%, examine your messaging before touching the price — positioning issues masquerade as pricing issues.`,
  },
  {
    slug: "landing-page-conversion-tips",
    title: "7 Landing Page Elements That Double Conversion Rates",
    excerpt: "Your landing page has one job: convert visitors into buyers.",
    category: "Marketing",
    readTime: 5,
    date: "July 3, 2025",
    body: `Your landing page has one job. Everything else is noise.

These seven elements — each validated by split testing across thousands of digital product pages — will dramatically lift your conversion rate.

**1. A headline that names the transformation**
Not "The Ultimate Productivity Guide." Instead: "Go from overwhelmed to inbox-zero in 30 days."

**2. Social proof above the fold**
Testimonials, download counts, or media logos. One strong testimonial above the fold outperforms ten at the bottom.

**3. A single CTA (not three)**
Every additional CTA reduces conversion. One button. One destination.

**4. Specificity over superlatives**
"47 plug-and-play email templates" beats "comprehensive email resources" every single time.

**5. Risk reversal**
A 30-day money-back guarantee removes the last objection. Most buyers don't use it — but knowing it exists is what makes them buy.

**6. FAQ section**
Every unanswered question is a lost sale. Write the FAQ from your buyer's biggest objections.

**7. Urgency (real urgency)**
A price increase on launch day. A limited bonus for the first 100 buyers. Real urgency converts. Fake countdown timers destroy trust.`,
  },
  {
    slug: "lead-magnet-ideas",
    title: "50 High-Converting Lead Magnet Ideas for Every Niche",
    excerpt: "The right lead magnet can 10x your email list growth.",
    category: "Growth",
    readTime: 7,
    date: "June 28, 2025",
    body: `The right lead magnet can 10x your email list growth. The wrong one collects digital dust.

Here are 50 proven lead magnet ideas, organized by format.

## Checklists (highest conversion rate)
- Pre-launch product checklist
- Client onboarding checklist
- Daily habit tracker
- Website audit checklist
- Tax prep checklist for freelancers

## Templates (save time, massive perceived value)
- Invoice template pack
- Social media content calendar
- Weekly meal planner
- Client proposal template
- YouTube video script template

## Guides & Mini-eBooks
- Beginner's guide to [your niche]
- "What I wish I knew" guide
- Step-by-step tutorial on [specific skill]
- Resource roundup guide
- Industry trend report

## Swipe Files
- Email subject line swipe file
- Instagram caption templates
- Sales page headline swipe file
- Cold email sequences
- DM scripts for outreach

## Calculators & Tools
- Freelance rate calculator
- Savings goal calculator
- Macro calculator
- ROI calculator
- Budget spreadsheet

The best lead magnet is the one your specific audience would pay $10 for but gets for free. Start there.`,
  },
  {
    slug: "ai-cover-design-guide",
    title: "AI Cover Design: How to Create Covers That Sell",
    excerpt: "Your cover is the first thing a potential buyer sees.",
    category: "Design",
    readTime: 4,
    date: "June 22, 2025",
    body: `Buyers judge digital products by their covers. A polished, professional cover signals quality before a single word is read.

Until recently, a great cover meant hiring a designer ($200–$500) or spending hours in Canva with mediocre results. AI changes that.

## What makes a cover convert?

**Clarity over cleverness.** The title should be readable at thumbnail size. The fastest test: shrink your cover to 150px wide. If you can't read the title, neither can your buyers.

**Color psychology.** Blues signal trust and authority (great for business/finance). Greens signal health and growth. Deep purples suggest creativity and premium value. Don't pick colors you like — pick colors your buyer responds to.

**Typography hierarchy.** Title > Subtitle > Author name. Three sizes, no more. Script fonts for body text are a conversion killer.

**Whitespace.** Overcrowded covers look cheap. Breathing room looks expensive.

## Using BookForge Cover Studio

Generate 6 layout variations with one click. Each variation applies different composition rules — centered, editorial, bold, minimal — so you can see what works for your topic without starting from scratch.

The best workflow: generate variations, pick your favorite layout, then fine-tune the colors and typography to match your brand. Total time: under 5 minutes.`,
  },
  {
    slug: "email-sequence-digital-products",
    title: "The 7-Email Welcome Sequence That Turns Subscribers Into Buyers",
    excerpt: "Most creators waste their email list.",
    category: "Email",
    readTime: 6,
    date: "June 16, 2025",
    body: `Most creators waste their email list. They build an audience over months, then blast promotions that feel cold and transactional. The result: high unsubscribes, low conversion, and a list that quietly dies.

The fix is a deliberate welcome sequence that builds trust before it asks for anything.

## The 7-email framework

**Email 1 (Day 0): Deliver the goods**
Instantly deliver the lead magnet they signed up for. Keep it short and warm. This email has the highest open rate you'll ever see — make a great first impression.

**Email 2 (Day 1): Your story**
Why do you create in this niche? What's your origin story? People buy from people they connect with.

**Email 3 (Day 3): Your best free content**
Link to your single most valuable piece of free content — a blog post, video, or tool. Pure value, no ask.

**Email 4 (Day 5): A quick win**
Give them something actionable they can implement today. A template, a framework, a tip. Quick wins build credibility fast.

**Email 5 (Day 7): Social proof**
Share a testimonial or success story from someone you've helped. Proof that your approach works.

**Email 6 (Day 10): Address objections**
What stops people from taking the next step? Address the top 3 objections your buyers have — preemptively.

**Email 7 (Day 14): The soft pitch**
Introduce your paid product. Not a hard sell — a natural next step. "If you found this helpful and want to go deeper, here's how I can help."

This sequence alone converts 5–15% of new subscribers into buyers before they've ever seen a hard promotion.`,
  },
];

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
