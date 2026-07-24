"use client";

import { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  ShoppingCart,
  Gift,
  Heart,
  Clock,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { LandingPageType, CopywritingFramework, WritingTone } from "@/types/landing-pages";
import { PAGE_TYPE_LABELS, FRAMEWORK_LABELS, TONE_LABELS } from "@/types/landing-pages";

// ── Types ─────────────────────────────────────────────────────────────────────

interface WizardData {
  pageType: LandingPageType;
  productName: string;
  description: string;
  targetAudience: string;
  industry: string;
  tone: WritingTone;
  framework: CopywritingFramework;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  cta: string;
  testimonials: string;
  faqs: string;
}

type WizardStep = 'type' | 'details' | 'brand' | 'optional' | 'generating';

// ── Icons ─────────────────────────────────────────────────────────────────────

const PAGE_TYPE_ICONS: Record<LandingPageType, React.ElementType> = {
  landing: FileText,
  sales: ShoppingCart,
  lead_magnet: Gift,
  thank_you: Heart,
  coming_soon: Clock,
};

const PAGE_TYPE_DESCRIPTIONS: Record<LandingPageType, string> = {
  landing: 'Drive sign-ups and conversions for your product or service',
  sales: 'Long-form persuasive page optimized to sell a product or course',
  lead_magnet: 'Capture emails by offering a free valuable resource',
  thank_you: 'Confirm a signup or purchase and guide next steps',
  coming_soon: 'Build anticipation and capture early interest',
};

// ── Step indicators ────────────────────────────────────────────────────────────

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'type', label: 'Page Type' },
  { id: 'details', label: 'Details' },
  { id: 'brand', label: 'Brand' },
  { id: 'optional', label: 'Optional' },
];

const STEP_ORDER: WizardStep[] = ['type', 'details', 'brand', 'optional', 'generating'];

// ── Progress messages ─────────────────────────────────────────────────────────

const PROGRESS_MESSAGES = [
  "Initializing your landing page…",
  "Crafting compelling headlines…",
  "Writing your section copy…",
  "Optimizing for conversions…",
  "Generating SEO metadata…",
  "Polishing the final touches…",
  "Almost done…",
];

// ── Main component ────────────────────────────────────────────────────────────

export function GeneratorWizard({
  initialData,
}: {
  initialData?: Partial<Pick<WizardData, "productName" | "description" | "targetAudience">>;
} = {}) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>('type');
  const [progressPct, setProgressPct] = useState(0);
  const [progressMsg, setProgressMsg] = useState(PROGRESS_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [data, setData] = useState<WizardData>({
    pageType: 'landing',
    productName: '',
    description: '',
    targetAudience: '',
    industry: '',
    tone: 'friendly',
    framework: 'AIDA',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    logoUrl: '',
    cta: 'Get Started Free',
    testimonials: '',
    faqs: '',
    ...initialData,
  });

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  const currentStepIndex = STEP_ORDER.indexOf(step);

  function nextStep() {
    const next = STEP_ORDER[currentStepIndex + 1];
    if (next === 'generating') void generate();
    else setStep(next);
  }

  function prevStep() {
    const prev = STEP_ORDER[currentStepIndex - 1];
    if (prev) setStep(prev);
  }

  async function generate() {
    setStep('generating');
    setProgressPct(5);
    setError(null);

    let msgIdx = 0;
    progressInterval.current = setInterval(() => {
      setProgressPct(p => Math.min(p + 8, 88));
      msgIdx = Math.min(msgIdx + 1, PROGRESS_MESSAGES.length - 1);
      setProgressMsg(PROGRESS_MESSAGES[msgIdx]);
    }, 1800);

    try {
      const response = await fetch('/api/landing-pages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          logoUrl: data.logoUrl || undefined,
          testimonials: data.testimonials || undefined,
          faqs: data.faqs || undefined,
        }),
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (!contentType.includes('text/event-stream')) {
        const json = await response.json() as { error?: string };
        throw new Error(json.error ?? 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = JSON.parse(line.slice(6)) as { type: string; message?: string; pageId?: string };

          if (payload.type === 'done' && payload.pageId) {
            if (progressInterval.current) clearInterval(progressInterval.current);
            setProgressPct(100);
            setProgressMsg("Your landing page is ready!");
            await new Promise(r => setTimeout(r, 600));
            router.push(`/landing-pages/${payload.pageId}/editor` as '/');
            return;
          } else if (payload.type === 'error') {
            throw new Error(payload.message ?? 'Generation failed');
          } else if (payload.type === 'progress' && payload.message) {
            setProgressMsg(payload.message);
          }
        }
      }
    } catch (err) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('optional');
    }
  }

  // Validation per step
  function isStepValid(): boolean {
    switch (step) {
      case 'type': return true;
      case 'details': return data.productName.trim().length > 0 && data.description.trim().length >= 10 && data.targetAudience.trim().length > 0 && data.industry.trim().length > 0;
      case 'brand': return data.cta.trim().length > 0;
      case 'optional': return true;
      default: return false;
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────────

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.12)]">
          <Sparkles className="h-8 w-8 animate-pulse text-[hsl(var(--primary))]" />
        </div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Generating your landing page</h2>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{progressMsg}</p>
        <div className="mt-8 w-full max-w-sm">
          <Progress value={progressPct} className="h-2" />
          <p className="mt-2 text-right text-xs text-[hsl(var(--muted-foreground))]">{progressPct}%</p>
        </div>
        {error && (
          <p className="mt-6 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const stepIndex = STEP_ORDER.indexOf(s.id);
          const isDone = stepIndex < currentStepIndex;
          const isActive = s.id === step;
          return (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                isDone ? "bg-[hsl(var(--primary))] text-white" :
                  isActive ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]" :
                    "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
              )}>
                {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-sm font-medium", isActive ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="flex-1 border-t border-[hsl(var(--border))]" />}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        {step === 'type' && <StepType data={data} update={update} />}
        {step === 'details' && <StepDetails data={data} update={update} />}
        {step === 'brand' && <StepBrand data={data} update={update} />}
        {step === 'optional' && <StepOptional data={data} update={update} error={error} />}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!isStepValid()}
          className="gap-2"
        >
          {step === 'optional' ? (
            <><Sparkles className="h-4 w-4" /> Generate Page</>
          ) : (
            <>Next <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Step: Page Type ────────────────────────────────────────────────────────────

function StepType({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">What type of page?</h2>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Choose the page type that matches your goal.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(PAGE_TYPE_LABELS) as LandingPageType[]).map(type => {
          const Icon = PAGE_TYPE_ICONS[type];
          const isSelected = data.pageType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => update('pageType', type)}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                isSelected
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                  : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)]"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                isSelected ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary)/0.1)] group-hover:text-[hsl(var(--primary))]"
              )}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", isSelected ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--foreground))]")}>
                  {PAGE_TYPE_LABELS[type]}
                </p>
                <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {PAGE_TYPE_DESCRIPTIONS[type]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step: Details ─────────────────────────────────────────────────────────────

function StepDetails({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Product details</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Tell us about your product so we can write targeted copy.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="productName">Product / Service Name <span className="text-[hsl(var(--destructive))]">*</span></Label>
          <Input id="productName" value={data.productName} onChange={e => update('productName', e.target.value)} placeholder="e.g. Acme Analytics" maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-[hsl(var(--destructive))]">*</span></Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={e => update('description', e.target.value)}
            placeholder="Describe what your product does, its key features, and the problem it solves…"
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{data.description.length}/2000</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="audience">Target Audience <span className="text-[hsl(var(--destructive))]">*</span></Label>
            <Input id="audience" value={data.targetAudience} onChange={e => update('targetAudience', e.target.value)} placeholder="e.g. SaaS founders, freelancers" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry <span className="text-[hsl(var(--destructive))]">*</span></Label>
            <Input id="industry" value={data.industry} onChange={e => update('industry', e.target.value)} placeholder="e.g. Marketing, Finance, Health" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="tone">Writing Tone</Label>
            <Select id="tone" value={data.tone} onChange={e => update('tone', e.target.value as WritingTone)}>
              {(Object.entries(TONE_LABELS) as [WritingTone, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="framework">Copywriting Framework</Label>
            <Select id="framework" value={data.framework} onChange={e => update('framework', e.target.value as CopywritingFramework)}>
              {(Object.entries(FRAMEWORK_LABELS) as [CopywritingFramework, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step: Brand ────────────────────────────────────────────────────────────────

function StepBrand({ data, update }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Brand & style</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Personalize the look and feel of your page.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cta">Primary Call-to-Action Text <span className="text-[hsl(var(--destructive))]">*</span></Label>
          <Input id="cta" value={data.cta} onChange={e => update('cta', e.target.value)} placeholder="e.g. Get Started Free, Try for Free, Download Now" maxLength={80} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="primaryColor"
                value={data.primaryColor}
                onChange={e => update('primaryColor', e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-[hsl(var(--border))] p-0.5"
              />
              <Input
                value={data.primaryColor}
                onChange={e => update('primaryColor', e.target.value)}
                placeholder="#6366f1"
                className="font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="secondaryColor"
                value={data.secondaryColor}
                onChange={e => update('secondaryColor', e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-[hsl(var(--border))] p-0.5"
              />
              <Input
                value={data.secondaryColor}
                onChange={e => update('secondaryColor', e.target.value)}
                placeholder="#8b5cf6"
                className="font-mono uppercase"
                maxLength={7}
              />
            </div>
          </div>
        </div>
        {/* Color preview */}
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg p-4 text-center text-sm font-semibold text-white" style={{ background: data.primaryColor }}>
            Primary
          </div>
          <div className="flex-1 rounded-lg p-4 text-center text-sm font-semibold text-white" style={{ background: data.secondaryColor }}>
            Secondary
          </div>
          <div className="flex-1 rounded-lg p-4 text-center text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})` }}>
            Gradient
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">Logo URL <span className="text-xs text-[hsl(var(--muted-foreground))]">(optional)</span></Label>
          <Input id="logoUrl" value={data.logoUrl} onChange={e => update('logoUrl', e.target.value)} placeholder="https://your-domain.com/logo.png" type="url" />
        </div>
      </div>
    </div>
  );
}

// ── Step: Optional ─────────────────────────────────────────────────────────────

function StepOptional({ data, update, error }: { data: WizardData; update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void; error: string | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Optional content</h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Add real testimonials and FAQs to use in the page. Leave blank to let AI generate them.</p>
      </div>
      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] p-4">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--destructive))]" />
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--destructive))]">Generation failed</p>
            <p className="mt-0.5 text-xs text-[hsl(var(--destructive))]">{error}</p>
          </div>
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="testimonials">Customer Testimonials</Label>
          <Textarea
            id="testimonials"
            value={data.testimonials}
            onChange={e => update('testimonials', e.target.value)}
            placeholder={`Name: John Smith\nRole: CEO at Acme Corp\nQuote: This product saved us 10 hours per week...\n\nName: Jane Doe\nRole: Freelancer\nQuote: I doubled my revenue in 3 months...`}
            rows={5}
            maxLength={3000}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="faqs">FAQ Items</Label>
          <Textarea
            id="faqs"
            value={data.faqs}
            onChange={e => update('faqs', e.target.value)}
            placeholder={`Q: How long does it take to set up?\nA: You can be up and running in under 5 minutes...\n\nQ: Do you offer a free trial?\nA: Yes, we offer a 14-day free trial...`}
            rows={5}
            maxLength={3000}
          />
        </div>
      </div>
    </div>
  );
}
