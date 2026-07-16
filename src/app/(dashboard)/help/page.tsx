import type { Metadata } from "next";
import {
  BookOpen,
  MessageCircle,
  Video,
  ArrowRight,
  Sparkles,
  FileText,
  Download,
  CreditCard,
  ChevronDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center",
};

const ARTICLES = [
  {
    category: "Getting started",
    icon: Sparkles,
    articles: [
      { title: "How to create your first document", href: "#" },
      { title: "Understanding AI credits", href: "#" },
      { title: "Choosing the right document type", href: "#" },
    ],
  },
  {
    category: "Documents",
    icon: FileText,
    articles: [
      { title: "Editing your outline", href: "#" },
      { title: "Regenerating sections", href: "#" },
      { title: "Customizing tone and style", href: "#" },
    ],
  },
  {
    category: "Exporting",
    icon: Download,
    articles: [
      { title: "Exporting as PDF", href: "#" },
      { title: "Cover page options", href: "#" },
      { title: "Removing the watermark (Pro)", href: "#" },
    ],
  },
  {
    category: "Billing",
    icon: CreditCard,
    articles: [
      { title: "Upgrading your plan", href: "#" },
      { title: "Cancelling your subscription", href: "#" },
      { title: "Understanding your invoice", href: "#" },
    ],
  },
];

const FAQS = [
  {
    q: "How many credits do I get on the free plan?",
    a: "The free plan includes 3 AI credits, which is enough to generate a short document. Upgrade to Pro for 100 credits per month.",
  },
  {
    q: "Can I edit the content after it's generated?",
    a: "Yes! Every section is fully editable. You can rewrite, expand, or restructure any part of your document after generation.",
  },
  {
    q: "What file formats can I export to?",
    a: "Currently BookForge AI supports PDF export. HTML and DOCX exports are coming soon for Pro users.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Credits reset at the start of each billing period and do not roll over. Use them before the month ends!",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] p-8 text-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">How can we help?</h1>
        <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">
          Search our docs or browse topics below.
        </p>
        <div className="mx-auto mt-4 max-w-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles…"
              className="h-10 w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
            />
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Documentation", description: "Full guides & tutorials", href: "#" },
          { icon: Video, label: "Video walkthroughs", description: "See BookForge AI in action", href: "#" },
          { icon: MessageCircle, label: "Contact support", description: "We typically reply in 24h", href: "mailto:support@bookforgeai.com" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)]">
                <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-hover:translate-x-1" />
            </a>
          );
        })}
      </div>

      {/* Article categories */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">Browse topics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ARTICLES.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.category}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                    <Icon className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                    {group.category}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {group.articles.map((article) => (
                    <li key={article.title}>
                      <a
                        href={article.href}
                        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                      >
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-[hsl(var(--foreground))]">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">{faq.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
