"use client";

import type {
  LandingPageSection,
  HeroContent,
  PainPointsContent,
  SolutionContent,
  FeaturesContent,
  BenefitsContent,
  HowItWorksContent,
  TestimonialsContent,
  PricingContent,
  FAQContent,
  GuaranteeContent,
  AboutContent,
  CTAContent,
  FooterContent,
} from "@/types/landing-pages";

interface SectionPreviewProps {
  section: LandingPageSection;
  primaryColor: string;
  secondaryColor: string;
}

export function SectionPreview({ section, primaryColor, secondaryColor }: SectionPreviewProps) {
  const style = { '--brand-primary': primaryColor, '--brand-secondary': secondaryColor } as React.CSSProperties;
  const c = section.content;

  switch (section.section_type) {
    case 'hero': return <HeroPreview c={c as unknown as HeroContent} primary={primaryColor} secondary={secondaryColor} style={style} />;
    case 'pain_points': return <PainPointsPreview c={c as unknown as PainPointsContent} style={style} />;
    case 'solution': return <SolutionPreview c={c as unknown as SolutionContent} primary={primaryColor} style={style} />;
    case 'features': return <FeaturesPreview c={c as unknown as FeaturesContent} style={style} />;
    case 'benefits': return <BenefitsPreview c={c as unknown as BenefitsContent} primary={primaryColor} style={style} />;
    case 'how_it_works': return <HowItWorksPreview c={c as unknown as HowItWorksContent} primary={primaryColor} style={style} />;
    case 'testimonials': return <TestimonialsPreview c={c as unknown as TestimonialsContent} style={style} />;
    case 'pricing': return <PricingPreview c={c as unknown as PricingContent} primary={primaryColor} style={style} />;
    case 'faq': return <FAQPreview c={c as unknown as FAQContent} style={style} />;
    case 'guarantee': return <GuaranteePreview c={c as unknown as GuaranteeContent} primary={primaryColor} style={style} />;
    case 'about': return <AboutPreview c={c as unknown as AboutContent} primary={primaryColor} style={style} />;
    case 'cta': return <CTAPreview c={c as unknown as CTAContent} primary={primaryColor} style={style} />;
    case 'footer': return <FooterPreview c={c as unknown as FooterContent} style={style} />;
    default: return <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">Unknown section type</div>;
  }
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroPreview({ c, primary, secondary }: { c: HeroContent; primary: string; secondary: string; style: React.CSSProperties }) {
  return (
    <section
      className="px-8 py-14 text-center"
      style={{ background: `linear-gradient(135deg, ${primary}18 0%, ${secondary}18 100%)` }}
    >
      {c.badge && (
        <span className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${primary}20`, color: primary }}>
          {c.badge}
        </span>
      )}
      <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
        {c.headline}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-[hsl(var(--muted-foreground))]">
        {c.subheadline}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90" style={{ background: primary }}>
          {c.primaryCta?.text ?? 'Get Started'}
        </button>
        {c.secondaryCta && (
          <button className="rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80" style={{ borderColor: primary, color: primary }}>
            {c.secondaryCta.text}
          </button>
        )}
      </div>
      {c.socialProof && (
        <p className="mt-5 text-xs text-[hsl(var(--muted-foreground))]">{c.socialProof}</p>
      )}
    </section>
  );
}

// ── Pain Points ───────────────────────────────────────────────────────────────

function PainPointsPreview({ c, style }: { c: PainPointsContent; style: React.CSSProperties }) {
  return (
    <section className="bg-orange-50/50 px-8 py-12 dark:bg-orange-950/10" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(c.items ?? []).map((item, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="mb-3 text-3xl">{item.emoji}</div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.title}</h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Solution ──────────────────────────────────────────────────────────────────

function SolutionPreview({ c, primary, style }: { c: SolutionContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-12" style={style}>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
        {c.subheadline && <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">{c.description}</p>
        <ul className="mt-5 space-y-2 text-left">
          {(c.points ?? []).map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 font-bold" style={{ color: primary }}>✓</span>
              <span className="text-[hsl(var(--foreground))]">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesPreview({ c, style }: { c: FeaturesContent; style: React.CSSProperties }) {
  return (
    <section className="bg-[hsl(var(--muted)/0.3)] px-8 py-12" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(c.items ?? []).map((item, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            {item.badge && (
              <span className="mb-2 inline-block rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">
                {item.badge}
              </span>
            )}
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.title}</h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Benefits ──────────────────────────────────────────────────────────────────

function BenefitsPreview({ c, primary, style }: { c: BenefitsContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-12" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {(c.items ?? []).map((item, i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `${primary}15` }}>
              {item.icon}
            </div>
            <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.title}</h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksPreview({ c, primary, style }: { c: HowItWorksContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="bg-[hsl(var(--muted)/0.2)] px-8 py-12" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mx-auto mt-8 max-w-lg space-y-5">
        {(c.steps ?? []).map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: primary }}>
              {step.step}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{step.title}</h3>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsPreview({ c, style }: { c: TestimonialsContent; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-12" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {(c.items ?? []).map((item, i) => (
          <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="mb-2 text-sm text-yellow-400">{'★'.repeat(item.rating ?? 5)}</div>
            <p className="text-xs italic text-[hsl(var(--foreground))]">&ldquo;{item.quote}&rdquo;</p>
            <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
              <p className="text-xs font-semibold text-[hsl(var(--foreground))]">{item.name}</p>
              <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">{item.role}{item.company ? `, ${item.company}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

function PricingPreview({ c, primary, style }: { c: PricingContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="bg-[hsl(var(--muted)/0.2)] px-8 py-12" style={style}>
      <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
      {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {(c.plans ?? []).map((plan, i) => (
          <div key={i} className="relative w-64 rounded-xl border-2 bg-[hsl(var(--card))] p-6" style={{ borderColor: plan.highlighted ? primary : 'hsl(var(--border))' }}>
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold text-white" style={{ background: primary }}>
                {plan.badge}
              </span>
            )}
            <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-[hsl(var(--foreground))]">{plan.price}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{plan.period}</span>
            </div>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{plan.description}</p>
            <ul className="mt-4 space-y-1.5">
              {(plan.features ?? []).map((f, j) => (
                <li key={j} className="flex items-center gap-1.5 text-xs text-[hsl(var(--foreground))]">
                  <span className="font-bold" style={{ color: primary }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button className="mt-5 w-full rounded-lg py-2 text-xs font-semibold text-white" style={{ background: plan.highlighted ? primary : '#6b7280' }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

function FAQPreview({ c, style }: { c: FAQContent; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-12" style={style}>
      <div className="mx-auto max-w-xl">
        <h2 className="text-center text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
        {c.subheadline && <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">{c.subheadline}</p>}
        <div className="mt-8 space-y-3">
          {(c.items ?? []).map((item, i) => (
            <div key={i} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.question}</p>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Guarantee ─────────────────────────────────────────────────────────────────

function GuaranteePreview({ c, primary, style }: { c: GuaranteeContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-12 text-center" style={{ ...style, background: `linear-gradient(135deg, ${primary}12, ${primary}05)` }}>
      <div className="mx-auto max-w-md">
        <div className="mb-4 text-4xl">🛡️</div>
        {c.badge && (
          <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold" style={{ background: `${primary}20`, color: primary }}>
            {c.badge}
          </span>
        )}
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{c.description}</p>
        {c.period && <p className="mt-3 text-sm font-semibold" style={{ color: primary }}>{c.period} money-back guarantee</p>}
      </div>
    </section>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutPreview({ c, primary, style }: { c: AboutContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="bg-[hsl(var(--muted)/0.2)] px-8 py-12 text-center" style={style}>
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">{c.headline}</h2>
        <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{c.description}</p>
        {c.stats && c.stats.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {c.stats.map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-black" style={{ color: primary }}>{stat.value}</div>
                <div className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────

function CTAPreview({ c, primary, style }: { c: CTAContent; primary: string; style: React.CSSProperties }) {
  return (
    <section className="px-8 py-14 text-center text-white" style={{ ...style, background: primary }}>
      <h2 className="text-2xl font-extrabold">{c.headline}</h2>
      {c.subheadline && <p className="mt-3 text-sm opacity-85">{c.subheadline}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold" style={{ color: primary }}>
          {c.primaryCta?.text}
        </button>
        {c.secondaryCta && (
          <button className="rounded-lg border-2 border-white/50 px-6 py-3 text-sm font-semibold text-white">
            {c.secondaryCta.text}
          </button>
        )}
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function FooterPreview({ c, style }: { c: FooterContent; style: React.CSSProperties }) {
  return (
    <footer className="bg-gray-900 px-8 py-8 text-center text-gray-400" style={style}>
      <p className="text-sm font-bold text-white">{c.companyName}</p>
      {c.tagline && <p className="mt-1 text-xs">{c.tagline}</p>}
      {c.links && c.links.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-4">
          {c.links.map((link, i) => (
            <span key={i} className="cursor-pointer text-xs hover:text-white">{link.label}</span>
          ))}
        </div>
      )}
      <p className="mt-4 text-[11px] opacity-60">{c.copyright}</p>
    </footer>
  );
}
