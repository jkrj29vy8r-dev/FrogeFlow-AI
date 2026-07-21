"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  FileText,
  Zap,
  LayoutTemplate,
  Search,
  Star,
  Lock,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  isPremium: boolean;
  isFeatured?: boolean;
}

const TEMPLATES: Template[] = [
  {
    id: "starter-ebook",
    name: "Starter eBook",
    description: "A classic 20-chapter eBook structure covering intro to expert content.",
    category: "eBooks",
    type: "ebook",
    href: "/new?type=ebook&template=starter-ebook",
    icon: BookOpen,
    gradient: "from-violet-500/20 to-purple-600/20",
    isPremium: false,
    isFeatured: true,
  },
  {
    id: "how-to-guide",
    name: "How-To Guide",
    description: "Step-by-step guide format with exercises and takeaways per section.",
    category: "PDF Guides",
    type: "pdf_guide",
    href: "/new?type=pdf_guide&template=how-to-guide",
    icon: FileText,
    gradient: "from-blue-500/20 to-cyan-600/20",
    isPremium: false,
  },
  {
    id: "lead-magnet",
    name: "Lead Magnet Checklist",
    description: "High-converting checklist designed to capture emails and add value fast.",
    category: "Lead Magnets",
    type: "lead_magnet",
    href: "/new?type=lead_magnet&template=lead-magnet",
    icon: Zap,
    gradient: "from-amber-500/20 to-orange-600/20",
    isPremium: false,
    isFeatured: true,
  },
  {
    id: "sales-page",
    name: "Sales Page Copy",
    description: "Full sales page with headline, benefits, proof, and CTAs.",
    category: "Sales Pages",
    type: "sales_page",
    href: "/new?type=sales_page&template=sales-page",
    icon: FileText,
    gradient: "from-rose-500/20 to-pink-600/20",
    isPremium: true,
  },
  {
    id: "workbook",
    name: "Interactive Workbook",
    description: "Structured workbook with exercises, prompts, and reflection questions.",
    category: "Workbooks",
    type: "workbook",
    href: "/new?type=workbook&template=workbook",
    icon: LayoutTemplate,
    gradient: "from-emerald-500/20 to-teal-600/20",
    isPremium: true,
  },
  {
    id: "email-sequence",
    name: "Welcome Email Sequence",
    description: "7-email onboarding sequence that converts subscribers to buyers.",
    category: "Email Campaigns",
    type: "email_campaign",
    href: "/new?type=email_campaign&template=email-sequence",
    icon: FileText,
    gradient: "from-indigo-500/20 to-blue-600/20",
    isPremium: true,
  },
  {
    id: "social-content",
    name: "30-Day Social Plan",
    description: "Monthly content calendar with 30 ready-to-post social media scripts.",
    category: "Social Posts",
    type: "social_post",
    href: "/new?type=social_post&template=social-content",
    icon: FileText,
    gradient: "from-sky-500/20 to-blue-600/20",
    isPremium: false,
  },
  {
    id: "product-description",
    name: "Product Description Pack",
    description: "SEO-optimized product descriptions for digital and physical products.",
    category: "Product Descriptions",
    type: "product_description",
    href: "/new?type=product_description&template=product-description",
    icon: FileText,
    gradient: "from-lime-500/20 to-green-600/20",
    isPremium: false,
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

export function TemplatesView() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = TEMPLATES.filter(
    (t) =>
      (category === "All" || t.category === category) &&
      (query === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()))
  );

  const featured = TEMPLATES.filter((t) => t.isFeatured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Templates</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Start faster with professionally crafted templates.
        </p>
      </div>

      {/* Featured templates */}
      {query === "" && category === "All" && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">Featured</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <Link
                  key={tpl.id}
                  href={tpl.href}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br p-6 transition-all hover:border-[hsl(var(--primary)/0.4)] hover:shadow-lg",
                    tpl.gradient
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-[hsl(var(--foreground))]" />
                    </div>
                    <span className="rounded-full bg-[hsl(var(--primary)/0.15)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
                      Featured
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {tpl.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))]">
                    Use template <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Search & filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="h-9 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-9 pr-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                  : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* All templates grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No templates match &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <div
                key={tpl.id}
                className="group relative flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-md"
              >
                {tpl.isPremium && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Lock className="h-2.5 w-2.5" />
                    Pro
                  </div>
                )}
                <div
                  className={cn(
                    "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                    tpl.gradient
                  )}
                >
                  <Icon className="h-4 w-4 text-[hsl(var(--foreground))]" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {tpl.name}
                </h3>
                <p className="flex-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                  {tpl.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                    {tpl.category}
                  </span>
                  {tpl.isPremium ? (
                    <Link
                      href="/billing"
                      className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400"
                    >
                      <Star className="h-3 w-3" /> Upgrade
                    </Link>
                  ) : (
                    <Link
                      href={tpl.href}
                      className="flex items-center gap-1 text-[10px] font-medium text-[hsl(var(--primary))] opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      Use <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
