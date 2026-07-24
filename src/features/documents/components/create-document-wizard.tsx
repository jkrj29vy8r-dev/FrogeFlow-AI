"use client";

import { useActionState, useState } from "react";
import {
  BookOpen,
  FileText,
  Layers,
  CheckSquare,
  Magnet,
  Monitor,
  ShoppingCart,
  Package,
  Megaphone,
  Share2,
  Mail,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createDocument,
  type CreateDocumentState,
} from "@/features/documents/actions/documents.actions";
import type { DocumentType } from "@/types/database";

// ── Product type registry ─────────────────────────────────────────────────────

interface ProductTypeOption {
  type: DocumentType;
  icon: React.ElementType;
  label: string;
  description: string;
  badge?: "MVP";
}

const PRODUCT_TYPES: ProductTypeOption[] = [
  {
    type: "ebook",
    icon: BookOpen,
    label: "eBook",
    description: "Full-length digital book with chapters",
    badge: "MVP",
  },
  {
    type: "pdf_guide",
    icon: FileText,
    label: "PDF Guide",
    description: "Actionable step-by-step guide",
    badge: "MVP",
  },
  {
    type: "workbook",
    icon: Layers,
    label: "Workbook",
    description: "Interactive exercises & worksheets",
    badge: "MVP",
  },
  {
    type: "checklist",
    icon: CheckSquare,
    label: "Checklist",
    description: "Grouped action-item checklists",
    badge: "MVP",
  },
  { type: "lead_magnet", icon: Magnet, label: "Lead Magnet", description: "High-value opt-in offer" },
  { type: "landing_page", icon: Monitor, label: "Landing Page", description: "Conversion-focused page copy" },
  { type: "sales_page", icon: ShoppingCart, label: "Sales Page", description: "Long-form sales copy" },
  { type: "product_description", icon: Package, label: "Product Description", description: "Compelling product copy" },
  { type: "marketing_content", icon: Megaphone, label: "Marketing Content", description: "Blog posts & articles" },
  { type: "social_post", icon: Share2, label: "Social Post", description: "Platform-ready social content" },
  { type: "email_campaign", icon: Mail, label: "Email Campaign", description: "Email sequence copy" },
];

// ── Field configs ─────────────────────────────────────────────────────────────

const WRITING_STYLES = [
  { value: "instructional", label: "Instructional — step-by-step, clear" },
  { value: "narrative", label: "Narrative — story-driven, engaging" },
  { value: "conversational", label: "Conversational — casual, friendly" },
  { value: "academic", label: "Academic — formal, research-based" },
  { value: "journalistic", label: "Journalistic — factual, concise" },
] as const;

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "authoritative", label: "Authoritative" },
  { value: "motivational", label: "Motivational" },
  { value: "friendly", label: "Friendly" },
] as const;

const KNOWLEDGE_LEVELS = [
  { value: "beginner", label: "Beginner — no prior knowledge assumed" },
  { value: "intermediate", label: "Intermediate — some experience" },
  { value: "advanced", label: "Advanced — deep expertise assumed" },
  { value: "expert", label: "Expert — practitioner-level" },
] as const;

const LENGTHS = [
  { value: "short", label: "Short (5–7 sections)" },
  { value: "medium", label: "Medium (8–10 sections)" },
  { value: "long", label: "Long (11–14 sections)" },
  { value: "comprehensive", label: "Comprehensive (15+ sections)" },
] as const;

const LANGUAGES = [
  "English", "Spanish", "Portuguese", "French", "German",
  "Italian", "Dutch", "Polish", "Turkish", "Japanese",
];

// ── Wizard ────────────────────────────────────────────────────────────────────

const initialState: CreateDocumentState = {};

const STEPS = ["Product type", "Details", "Review & generate"];

interface CreateDocumentWizardProps {
  initialType?: DocumentType;
  initialTitle?: string;
  initialDescription?: string;
  initialAudience?: string;
}

export function CreateDocumentWizard({
  initialType,
  initialTitle = "",
  initialDescription = "",
  initialAudience = "",
}: CreateDocumentWizardProps) {
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(initialType ?? null);

  // Step 2 fields
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [audience, setAudience] = useState(initialAudience);
  const [language, setLanguage] = useState("English");
  const [writingStyle, setWritingStyle] = useState("instructional");
  const [tone, setTone] = useState("professional");
  const [knowledgeLevel, setKnowledgeLevel] = useState("beginner");
  const [length, setLength] = useState("medium");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");

  const [state, formAction, isPending] = useActionState(createDocument, initialState);

  const step2Valid = title.length >= 5 && description.length >= 10 && audience.length >= 5;

  const selectedProduct = PRODUCT_TYPES.find((p) => p.type === selectedType);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Create a new document
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Tell the AI what you need and it will handle the rest
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const isComplete = step > num;
          const isActive = step === num;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete || isActive
                    ? "bg-[hsl(var(--primary))] text-white"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isActive
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="mx-1 h-px w-8 bg-[hsl(var(--border))]" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Product type ──────────────────────────────────────── */}
      {step === 1 && (
        <div>
          <p className="mb-5 text-center text-sm text-[hsl(var(--muted-foreground))]">
            Choose the type of document you want to create
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCT_TYPES.map(({ type, icon: Icon, label, description, badge }) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedType(type);
                  setStep(2);
                }}
                className={cn(
                  "group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-[hsl(var(--primary)/0.5)] hover:shadow-sm",
                  selectedType === type
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.05)]"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                      selectedType === type
                        ? "bg-[hsl(var(--primary)/0.15)]"
                        : "bg-[hsl(var(--muted))] group-hover:bg-[hsl(var(--primary)/0.1)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        selectedType === type
                          ? "text-[hsl(var(--primary))]"
                          : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]"
                      )}
                    />
                  </div>
                  {badge && (
                    <span className="rounded-full bg-[hsl(var(--primary)/0.1)] px-1.5 py-0.5 text-[9px] font-semibold text-[hsl(var(--primary))]">
                      {badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
                  <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Details ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            {selectedProduct && (
              <>
                <selectedProduct.icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {selectedProduct.label}
                </span>
              </>
            )}
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Ultimate Guide to Intermittent Fasting"
                className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-[hsl(var(--destructive))]">{state.fieldErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this document about? What will readers learn or accomplish?"
                className="min-h-[80px] resize-none"
              />
              {state.fieldErrors?.description && (
                <p className="text-xs text-[hsl(var(--destructive))]">{state.fieldErrors.description}</p>
              )}
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience">
                Target audience <span className="text-[hsl(var(--destructive))]">*</span>
              </Label>
              <Textarea
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Health-conscious adults aged 25–45 who want to lose weight"
                className="min-h-[60px] resize-none"
              />
              {state.fieldErrors?.audience && (
                <p className="text-xs text-[hsl(var(--destructive))]">{state.fieldErrors.audience}</p>
              )}
            </div>

            {/* Goal */}
            <div className="space-y-2">
              <Label htmlFor="goal">Goal</Label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Educate readers and position me as an authority"
                className="h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>

            {/* Row: Writing Style + Tone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="writing_style">Writing style</Label>
                <Select
                  id="writing_style"
                  value={writingStyle}
                  onChange={(e) => setWritingStyle(e.target.value)}
                >
                  {WRITING_STYLES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {TONES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Row: Knowledge Level + Length */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="knowledge_level">Reader knowledge level</Label>
                <Select
                  id="knowledge_level"
                  value={knowledgeLevel}
                  onChange={(e) => setKnowledgeLevel(e.target.value)}
                >
                  {KNOWLEDGE_LEVELS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  {LENGTHS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Optional notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requirements, topics to cover, things to avoid, or inspiration…"
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              disabled={!step2Valid}
              onClick={() => setStep(3)}
            >
              Review
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review & Generate ─────────────────────────────────── */}
      {step === 3 && selectedType && (
        <form action={formAction}>
          {/* Hidden fields */}
          <input type="hidden" name="type" value={selectedType} />
          <input type="hidden" name="title" value={title} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="audience" value={audience} />
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="writing_style" value={writingStyle} />
          <input type="hidden" name="tone" value={tone} />
          <input type="hidden" name="knowledge_level" value={knowledgeLevel} />
          <input type="hidden" name="length" value={length} />
          <input type="hidden" name="goal" value={goal} />
          <input type="hidden" name="notes" value={notes} />

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))]">
              Review your brief before the AI designs your outline
            </p>

            <div className="space-y-2.5 rounded-lg bg-[hsl(var(--muted)/0.5)] p-4">
              <Row label="Type" value={selectedProduct?.label ?? selectedType} />
              <Row label="Title" value={title} />
              <Row label="Description" value={description} />
              <Row label="Audience" value={audience} />
              {goal && <Row label="Goal" value={goal} />}
              <Row label="Style" value={WRITING_STYLES.find((s) => s.value === writingStyle)?.label.split(" — ")[0] ?? writingStyle} />
              <Row label="Tone" value={tone} />
              <Row label="Level" value={KNOWLEDGE_LEVELS.find((k) => k.value === knowledgeLevel)?.label.split(" — ")[0] ?? knowledgeLevel} />
              <Row label="Length" value={LENGTHS.find((l) => l.value === length)?.label ?? length} />
              <Row label="Language" value={language} />
              {notes && <Row label="Notes" value={notes} />}
            </div>

            <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
              The AI will design a structured outline in ~10 seconds, then you can
              review it before generating the full content.
            </p>

            {state.error && (
              <p className="mt-3 rounded-md bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-sm text-[hsl(var(--destructive))]">
                {state.error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                disabled={isPending}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={isPending}>
                <Sparkles className="h-4 w-4" />
                {isPending ? "Creating…" : "Create & generate outline"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-24 shrink-0 font-medium text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
      <span className="text-[hsl(var(--foreground))]">{value}</span>
    </div>
  );
}
