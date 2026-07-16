"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
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

const PRODUCT_TYPES: { type: DocumentType; icon: React.ElementType; labelKey: string }[] = [
  { type: "ebook", icon: BookOpen, labelKey: "ebook" },
  { type: "pdf_guide", icon: FileText, labelKey: "pdfGuide" },
  { type: "workbook", icon: Layers, labelKey: "workbook" },
  { type: "checklist", icon: CheckSquare, labelKey: "checklist" },
  { type: "lead_magnet", icon: Magnet, labelKey: "leadMagnet" },
  { type: "landing_page", icon: Monitor, labelKey: "landingPage" },
  { type: "sales_page", icon: ShoppingCart, labelKey: "salesPage" },
  { type: "product_description", icon: Package, labelKey: "productDescription" },
  { type: "marketing_content", icon: Megaphone, labelKey: "marketingContent" },
  { type: "social_post", icon: Share2, labelKey: "socialPost" },
  { type: "email_campaign", icon: Mail, labelKey: "emailCampaign" },
];

const initialState: CreateDocumentState = {};

export function CreateDocumentWizard({ initialType }: { initialType?: DocumentType }) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");

  const [step, setStep] = useState(initialType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(initialType ?? null);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");

  const [state, formAction, isPending] = useActionState(createDocument, initialState);

  const steps = [
    t("create.step1.title"),
    t("create.step2.title"),
    t("create.step3.title"),
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {t("create.title")}
        </h1>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((label, i) => {
          const num = i + 1;
          const isComplete = step > num;
          const isActive = step === num;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isComplete
                    ? "bg-[hsl(var(--primary))] text-white"
                    : isActive
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
              {i < steps.length - 1 && (
                <div className="mx-1 h-px w-8 bg-[hsl(var(--border))]" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 — Product type */}
      {step === 1 && (
        <div>
          <p className="mb-5 text-center text-sm text-[hsl(var(--muted-foreground))]">
            {t("create.step1.subtitle")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRODUCT_TYPES.map(({ type, icon: Icon, labelKey }) => (
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
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {t(`types.${labelKey}` as Parameters<typeof t>[0])}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Document details */}
      {step === 2 && (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))]">
            {t("create.step2.subtitle")}
          </p>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="topic">{t("create.step2.topicLabel")}</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t("create.step2.topicPlaceholder")}
                className="min-h-[100px] resize-none"
              />
              {state.fieldErrors?.topic && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {state.fieldErrors.topic}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">{t("create.step2.audienceLabel")}</Label>
              <Textarea
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={t("create.step2.audiencePlaceholder")}
                className="min-h-[80px] resize-none"
              />
              {state.fieldErrors?.audience && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {state.fieldErrors.audience}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tone">{t("create.step2.toneLabel")}</Label>
                <Select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  {(["professional", "conversational", "authoritative", "motivational"] as const).map(
                    (v) => (
                      <option key={v} value={v}>
                        {t(`create.step2.tones.${v}` as Parameters<typeof t>[0])}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">{t("create.step2.lengthLabel")}</Label>
                <Select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                >
                  {(["short", "medium", "long"] as const).map((v) => (
                    <option key={v} value={v}>
                      {t(`create.step2.lengths.${v}` as Parameters<typeof t>[0])}
                    </option>
                  ))}
                </Select>
              </div>
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
              {tCommon("back")}
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              disabled={topic.length < 10 || audience.length < 5}
              onClick={() => setStep(3)}
            >
              {tCommon("next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Review & generate */}
      {step === 3 && selectedType && (
        <form action={formAction}>
          {/* Hidden fields */}
          <input type="hidden" name="type" value={selectedType} />
          <input type="hidden" name="topic" value={topic} />
          <input type="hidden" name="audience" value={audience} />
          <input type="hidden" name="tone" value={tone} />
          <input type="hidden" name="length" value={length} />

          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <p className="mb-5 text-sm text-[hsl(var(--muted-foreground))]">
              {t("create.step3.subtitle")}
            </p>

            <div className="space-y-3 rounded-lg bg-[hsl(var(--muted)/0.5)] p-4">
              <Row label="Type" value={t(`types.${PRODUCT_TYPES.find(p => p.type === selectedType)!.labelKey}` as Parameters<typeof t>[0])} />
              <Row label="Topic" value={topic} />
              <Row label="Audience" value={audience} />
              <Row
                label="Tone"
                value={t(`create.step2.tones.${tone}` as Parameters<typeof t>[0])}
              />
              <Row
                label="Length"
                value={t(`create.step2.lengths.${length}` as Parameters<typeof t>[0])}
              />
            </div>

            <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
              {t("create.step3.estimatedTime")}
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
                {tCommon("back")}
              </Button>
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isPending}
              >
                <Sparkles className="h-4 w-4" />
                {isPending ? tCommon("loading") : t("create.step3.generateOutline")}
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
      <span className="w-20 shrink-0 font-medium text-[hsl(var(--muted-foreground))]">
        {label}
      </span>
      <span className="text-[hsl(var(--foreground))]">{value}</span>
    </div>
  );
}
