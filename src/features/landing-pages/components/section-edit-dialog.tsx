"use client";

import { useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  LandingPageSection,
  SectionType,
  HeroContent,
  PainPointsContent,
  SolutionContent,
  FeaturesContent,
  BenefitsContent,
  HowItWorksContent,
  TestimonialsContent,
  PricingContent,
  PricingPlan,
  FAQContent,
  GuaranteeContent,
  AboutContent,
  CTAContent,
  FooterContent,
} from "@/types/landing-pages";
import { SECTION_LABELS } from "@/types/landing-pages";

interface SectionEditDialogProps {
  section: LandingPageSection;
  onSave: (content: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function SectionEditDialog({ section, onSave, onClose }: SectionEditDialogProps) {
  const [content, setContent] = useState<Record<string, unknown>>(section.content);
  const [saving, setSaving] = useState(false);

  const update = useCallback((path: string, value: unknown) => {
    setContent(prev => setNestedValue(prev, path, value));
  }, []);

  async function handleSave() {
    setSaving(true);
    await onSave(content);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-10">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <h2 className="font-semibold text-[hsl(var(--foreground))]">
            Edit: {SECTION_LABELS[section.section_type as SectionType]}
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          <SectionForm sectionType={section.section_type as SectionType} content={content} update={update} />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[hsl(var(--border))] px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Generic form dispatcher ───────────────────────────────────────────────────

function SectionForm({
  sectionType,
  content,
  update,
}: {
  sectionType: SectionType;
  content: Record<string, unknown>;
  update: (path: string, value: unknown) => void;
}) {
  switch (sectionType) {
    case 'hero': return <HeroForm c={content as unknown as HeroContent} update={update} />;
    case 'pain_points': return <PainPointsForm c={content as unknown as PainPointsContent} update={update} />;
    case 'solution': return <SolutionForm c={content as unknown as SolutionContent} update={update} />;
    case 'features': return <FeaturesForm c={content as unknown as FeaturesContent} update={update} />;
    case 'benefits': return <BenefitsForm c={content as unknown as BenefitsContent} update={update} />;
    case 'how_it_works': return <HowItWorksForm c={content as unknown as HowItWorksContent} update={update} />;
    case 'testimonials': return <TestimonialsForm c={content as unknown as TestimonialsContent} update={update} />;
    case 'pricing': return <PricingForm c={content as unknown as PricingContent} update={update} />;
    case 'faq': return <FAQForm c={content as unknown as FAQContent} update={update} />;
    case 'guarantee': return <GuaranteeForm c={content as unknown as GuaranteeContent} update={update} />;
    case 'about': return <AboutForm c={content as unknown as AboutContent} update={update} />;
    case 'cta': return <CTAForm c={content as unknown as CTAContent} update={update} />;
    case 'footer': return <FooterForm c={content as unknown as FooterContent} update={update} />;
    default: return <p className="text-sm text-[hsl(var(--muted-foreground))]">No editor available for this section type.</p>;
  }
}

// ── Form field helpers ────────────────────────────────────────────────────────

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TF({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <Textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} />;
}

function IF({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <Input value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

function ArrayItemHeader({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{label}</span>
      <button type="button" onClick={onRemove} className="rounded p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroForm({ c, update }: { c: HeroContent; update: (p: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Badge Text (optional)">
        <IF value={c.badge ?? ''} onChange={v => update('badge', v || undefined)} placeholder="e.g. New · 10,000+ users" />
      </Field>
      <Field label="Headline *">
        <TF value={c.headline} onChange={v => update('headline', v)} rows={2} placeholder="Your bold, benefit-driven headline" />
      </Field>
      <Field label="Subheadline *">
        <TF value={c.subheadline} onChange={v => update('subheadline', v)} rows={3} placeholder="Expand on your headline in 2-3 sentences" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary CTA Text">
          <IF value={c.primaryCta?.text ?? ''} onChange={v => update('primaryCta.text', v)} placeholder="Get Started Free" />
        </Field>
        <Field label="Primary CTA URL">
          <IF value={c.primaryCta?.href ?? '#'} onChange={v => update('primaryCta.href', v)} placeholder="#" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Secondary CTA Text (optional)">
          <IF value={c.secondaryCta?.text ?? ''} onChange={v => update('secondaryCta.text', v || undefined)} placeholder="Learn More" />
        </Field>
        <Field label="Secondary CTA URL (optional)">
          <IF value={c.secondaryCta?.href ?? '#features'} onChange={v => update('secondaryCta.href', v || undefined)} placeholder="#features" />
        </Field>
      </div>
      <Field label="Social Proof (optional)">
        <IF value={c.socialProof ?? ''} onChange={v => update('socialProof', v || undefined)} placeholder="✓ 30-day guarantee  ✓ No credit card required" />
      </Field>
    </div>
  );
}

// ── Pain Points ───────────────────────────────────────────────────────────────

function PainPointsForm({ c, update }: { c: PainPointsContent; update: (p: string, v: unknown) => void }) {
  const items = c.items ?? [];
  function addItem() {
    update('items', [...items, { emoji: '😤', title: '', description: '' }]);
  }
  function removeItem(i: number) {
    update('items', items.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-4">
      <Field label="Section Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Item ${i + 1}`} onRemove={() => removeItem(i)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Emoji"><IF value={item.emoji} onChange={v => update(`items.${i}.emoji`, v)} placeholder="😤" /></Field>
            <Field label="Title" className="sm:col-span-2"><IF value={item.title} onChange={v => update(`items.${i}.title`, v)} /></Field>
          </div>
          <Field label="Description"><TF value={item.description} onChange={v => update(`items.${i}.description`, v)} rows={2} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addItem}>
        <Plus className="h-3.5 w-3.5" /> Add Item
      </Button>
    </div>
  );
}

// ── Solution ──────────────────────────────────────────────────────────────────

function SolutionForm({ c, update }: { c: SolutionContent; update: (p: string, v: unknown) => void }) {
  const points = c.points ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      <Field label="Description"><TF value={c.description} onChange={v => update('description', v)} rows={3} /></Field>
      <div className="space-y-2">
        <Label>Bullet Points</Label>
        {points.map((point, i) => (
          <div key={i} className="flex gap-2">
            <IF value={point} onChange={v => update(`points.${i}`, v)} placeholder={`Point ${i + 1}`} />
            <button type="button" onClick={() => update('points', points.filter((_, idx) => idx !== i))} className="rounded p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('points', [...points, ''])}>
          <Plus className="h-3.5 w-3.5" /> Add Point
        </Button>
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesForm({ c, update }: { c: FeaturesContent; update: (p: string, v: unknown) => void }) {
  const items = c.items ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Feature ${i + 1}`} onRemove={() => update('items', items.filter((_, idx) => idx !== i))} />
          <Field label="Title"><IF value={item.title} onChange={v => update(`items.${i}.title`, v)} /></Field>
          <Field label="Description"><TF value={item.description} onChange={v => update(`items.${i}.description`, v)} rows={2} /></Field>
          <Field label="Badge (optional)"><IF value={item.badge ?? ''} onChange={v => update(`items.${i}.badge`, v || undefined)} placeholder="New, Popular, etc." /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('items', [...items, { title: '', description: '' }])}>
        <Plus className="h-3.5 w-3.5" /> Add Feature
      </Button>
    </div>
  );
}

// ── Benefits ──────────────────────────────────────────────────────────────────

function BenefitsForm({ c, update }: { c: BenefitsContent; update: (p: string, v: unknown) => void }) {
  const items = c.items ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Benefit ${i + 1}`} onRemove={() => update('items', items.filter((_, idx) => idx !== i))} />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Icon"><IF value={item.icon} onChange={v => update(`items.${i}.icon`, v)} placeholder="⚡" /></Field>
            <Field label="Title" className="sm:col-span-3"><IF value={item.title} onChange={v => update(`items.${i}.title`, v)} /></Field>
          </div>
          <Field label="Description"><TF value={item.description} onChange={v => update(`items.${i}.description`, v)} rows={2} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('items', [...items, { icon: '⚡', title: '', description: '' }])}>
        <Plus className="h-3.5 w-3.5" /> Add Benefit
      </Button>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksForm({ c, update }: { c: HowItWorksContent; update: (p: string, v: unknown) => void }) {
  const steps = c.steps ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {steps.map((step, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Step ${i + 1}`} onRemove={() => update('steps', steps.filter((_, idx) => idx !== i))} />
          <div className="grid gap-3 sm:grid-cols-4">
            <Field label="Number"><IF value={step.step} onChange={v => update(`steps.${i}.step`, v)} placeholder={`${i + 1}`} /></Field>
            <Field label="Title" className="sm:col-span-3"><IF value={step.title} onChange={v => update(`steps.${i}.title`, v)} /></Field>
          </div>
          <Field label="Description"><TF value={step.description} onChange={v => update(`steps.${i}.description`, v)} rows={2} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('steps', [...steps, { step: `${steps.length + 1}`, title: '', description: '' }])}>
        <Plus className="h-3.5 w-3.5" /> Add Step
      </Button>
    </div>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function TestimonialsForm({ c, update }: { c: TestimonialsContent; update: (p: string, v: unknown) => void }) {
  const items = c.items ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Testimonial ${i + 1}`} onRemove={() => update('items', items.filter((_, idx) => idx !== i))} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Name"><IF value={item.name} onChange={v => update(`items.${i}.name`, v)} /></Field>
            <Field label="Role"><IF value={item.role} onChange={v => update(`items.${i}.role`, v)} /></Field>
            <Field label="Company (optional)"><IF value={item.company ?? ''} onChange={v => update(`items.${i}.company`, v || undefined)} /></Field>
          </div>
          <Field label="Quote"><TF value={item.quote} onChange={v => update(`items.${i}.quote`, v)} rows={3} /></Field>
          <Field label="Rating (1-5)">
            <Input type="number" min={1} max={5} value={item.rating ?? 5} onChange={e => update(`items.${i}.rating`, parseInt(e.target.value))} className="w-24" />
          </Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('items', [...items, { name: '', role: '', quote: '', rating: 5 }])}>
        <Plus className="h-3.5 w-3.5" /> Add Testimonial
      </Button>
    </div>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────

function PricingForm({ c, update }: { c: PricingContent; update: (p: string, v: unknown) => void }) {
  const plans = c.plans ?? [];
  function addPlan() {
    const newPlan: PricingPlan = { name: 'New Plan', price: '$0', period: '/month', description: '', features: ['Feature 1'], cta: 'Get Started', highlighted: false };
    update('plans', [...plans, newPlan]);
  }
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {plans.map((plan, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`Plan: ${plan.name}`} onRemove={() => update('plans', plans.filter((_, idx) => idx !== i))} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Plan Name"><IF value={plan.name} onChange={v => update(`plans.${i}.name`, v)} /></Field>
            <Field label="Badge (optional)"><IF value={plan.badge ?? ''} onChange={v => update(`plans.${i}.badge`, v || undefined)} placeholder="Most Popular" /></Field>
            <Field label="Price"><IF value={plan.price} onChange={v => update(`plans.${i}.price`, v)} placeholder="$49" /></Field>
            <Field label="Period"><IF value={plan.period} onChange={v => update(`plans.${i}.period`, v)} placeholder="/month" /></Field>
          </div>
          <Field label="Description"><IF value={plan.description} onChange={v => update(`plans.${i}.description`, v)} /></Field>
          <Field label="CTA Button Text"><IF value={plan.cta} onChange={v => update(`plans.${i}.cta`, v)} placeholder="Get Started" /></Field>
          <div className="space-y-2">
            <Label>Features</Label>
            {(plan.features ?? []).map((feat, j) => (
              <div key={j} className="flex gap-2">
                <IF value={feat} onChange={v => update(`plans.${i}.features.${j}`, v)} />
                <button type="button" onClick={() => update(`plans.${i}.features`, plan.features.filter((_, idx) => idx !== j))} className="rounded p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update(`plans.${i}.features`, [...(plan.features ?? []), ''])}>
              <Plus className="h-3.5 w-3.5" /> Add Feature
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))]">
            <input type="checkbox" checked={plan.highlighted ?? false} onChange={e => update(`plans.${i}.highlighted`, e.target.checked)} className="rounded" />
            Highlight this plan (recommended / popular)
          </label>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addPlan}>
        <Plus className="h-3.5 w-3.5" /> Add Plan
      </Button>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

function FAQForm({ c, update }: { c: FAQContent; update: (p: string, v: unknown) => void }) {
  const items = c.items ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      {items.map((item, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-[hsl(var(--border))] p-4">
          <ArrayItemHeader label={`FAQ ${i + 1}`} onRemove={() => update('items', items.filter((_, idx) => idx !== i))} />
          <Field label="Question"><IF value={item.question} onChange={v => update(`items.${i}.question`, v)} /></Field>
          <Field label="Answer"><TF value={item.answer} onChange={v => update(`items.${i}.answer`, v)} rows={3} /></Field>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('items', [...items, { question: '', answer: '' }])}>
        <Plus className="h-3.5 w-3.5" /> Add FAQ
      </Button>
    </div>
  );
}

// ── Guarantee ─────────────────────────────────────────────────────────────────

function GuaranteeForm({ c, update }: { c: GuaranteeContent; update: (p: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Description"><TF value={c.description} onChange={v => update('description', v)} rows={3} /></Field>
      <Field label="Badge Text (optional)"><IF value={c.badge ?? ''} onChange={v => update('badge', v || undefined)} placeholder="100% Satisfaction Guaranteed" /></Field>
      <Field label="Period (optional)"><IF value={c.period ?? ''} onChange={v => update('period', v || undefined)} placeholder="30 days" /></Field>
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutForm({ c, update }: { c: AboutContent; update: (p: string, v: unknown) => void }) {
  const stats = c.stats ?? [];
  return (
    <div className="space-y-4">
      <Field label="Headline"><IF value={c.headline} onChange={v => update('headline', v)} /></Field>
      <Field label="Description"><TF value={c.description} onChange={v => update('description', v)} rows={4} /></Field>
      <div className="space-y-2">
        <Label>Stats (optional)</Label>
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2">
            <IF value={stat.value} onChange={v => update(`stats.${i}.value`, v)} placeholder="10,000+" />
            <IF value={stat.label} onChange={v => update(`stats.${i}.label`, v)} placeholder="Happy customers" />
            <button type="button" onClick={() => update('stats', stats.filter((_, idx) => idx !== i))} className="rounded p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('stats', [...stats, { value: '', label: '' }])}>
          <Plus className="h-3.5 w-3.5" /> Add Stat
        </Button>
      </div>
    </div>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────

function CTAForm({ c, update }: { c: CTAContent; update: (p: string, v: unknown) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Headline"><TF value={c.headline} onChange={v => update('headline', v)} rows={2} /></Field>
      <Field label="Subheadline (optional)"><IF value={c.subheadline ?? ''} onChange={v => update('subheadline', v || undefined)} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary CTA Text"><IF value={c.primaryCta?.text ?? ''} onChange={v => update('primaryCta.text', v)} /></Field>
        <Field label="Primary CTA URL"><IF value={c.primaryCta?.href ?? '#'} onChange={v => update('primaryCta.href', v)} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Secondary CTA Text (optional)"><IF value={c.secondaryCta?.text ?? ''} onChange={v => update('secondaryCta.text', v || undefined)} /></Field>
        <Field label="Secondary CTA URL (optional)"><IF value={c.secondaryCta?.href ?? '#'} onChange={v => update('secondaryCta.href', v || undefined)} /></Field>
      </div>
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function FooterForm({ c, update }: { c: FooterContent; update: (p: string, v: unknown) => void }) {
  const links = c.links ?? [];
  return (
    <div className="space-y-4">
      <Field label="Company Name"><IF value={c.companyName} onChange={v => update('companyName', v)} /></Field>
      <Field label="Tagline (optional)"><IF value={c.tagline ?? ''} onChange={v => update('tagline', v || undefined)} /></Field>
      <Field label="Copyright"><IF value={c.copyright} onChange={v => update('copyright', v)} placeholder={`© ${new Date().getFullYear()} Company. All rights reserved.`} /></Field>
      <div className="space-y-2">
        <Label>Links</Label>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <IF value={link.label} onChange={v => update(`links.${i}.label`, v)} placeholder="Privacy Policy" />
            <IF value={link.href} onChange={v => update(`links.${i}.href`, v)} placeholder="/privacy" />
            <button type="button" onClick={() => update('links', links.filter((_, idx) => idx !== i))} className="rounded p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => update('links', [...links, { label: '', href: '/' }])}>
          <Plus className="h-3.5 w-3.5" /> Add Link
        </Button>
      </div>
    </div>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split('.');
  if (parts.length === 1) return { ...obj, [path]: value };

  const [head, ...rest] = parts;
  const headIdx = parseInt(head);

  if (!isNaN(headIdx) && Array.isArray(obj)) {
    const arr = [...obj as unknown[]];
    arr[headIdx] = setNestedValue(arr[headIdx] as Record<string, unknown> ?? {}, rest.join('.'), value);
    return arr as unknown as Record<string, unknown>;
  }

  return {
    ...obj,
    [head]: setNestedValue(
      (obj[head] as Record<string, unknown>) ?? (isNaN(parseInt(rest[0])) ? {} : []),
      rest.join('.'),
      value
    ),
  };
}
