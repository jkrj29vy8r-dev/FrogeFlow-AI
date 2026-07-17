"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { Sparkles, ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GENERATION_ORDER, ASSET_TYPE_LABELS, ASSET_TYPE_ICONS } from "@/types/projects";
import type { AssetType } from "@/types/projects";

type Step = "basics" | "brand" | "generating";

interface FormData {
  productIdea: string;
  targetAudience: string;
  language: string;
  tone: string;
  industry: string;
  goal: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
}

const TONES = ["Professional", "Friendly", "Bold", "Empathetic", "Conversational", "Inspirational"];
const INDUSTRIES = ["Business & Entrepreneurship", "Health & Wellness", "Finance & Investing", "Education & Learning", "Technology", "Creative Arts", "Personal Development", "Marketing & Sales", "Productivity", "Parenting & Family"];
const GOALS = ["Generate leads", "Sell a product", "Build an audience", "Educate customers", "Grow email list"];
const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "German", "Italian"];

const defaultForm: FormData = {
  productIdea: "",
  targetAudience: "",
  language: "English",
  tone: "Professional",
  industry: "Business & Entrepreneurship",
  goal: "Generate leads",
  brandName: "",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  logoUrl: "",
};

interface AssetProgress {
  status: "pending" | "generating" | "completed" | "failed";
}

export function GenerateWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<FormData>(defaultForm);
  const [progress, setProgress] = useState<Partial<Record<AssetType, AssetProgress>>>({});
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");

  const set = useCallback((key: keyof FormData, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const completedCount = Object.values(progress).filter(p => p?.status === "completed").length;
  const totalAssets = GENERATION_ORDER.length;

  async function startGeneration() {
    setStep("generating");
    setError("");
    setProgress({});

    try {
      const res = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIdea: form.productIdea,
          targetAudience: form.targetAudience,
          language: form.language,
          tone: form.tone,
          industry: form.industry,
          goal: form.goal,
          brandName: form.brandName,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          ...(form.logoUrl ? { logoUrl: form.logoUrl } : {}),
        }),
      });

      if (!res.ok || !res.body) {
        setError("Failed to start generation.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6)) as {
              type: string;
              message?: string;
              projectId?: string;
              assetType?: AssetType;
              status?: string;
            };

            if (evt.type === "progress" && evt.message) {
              setProgressMsg(evt.message);
            } else if (evt.type === "asset_update" && evt.assetType) {
              setProgress(p => ({ ...p, [evt.assetType!]: { status: evt.status as AssetProgress["status"] } }));
            } else if (evt.type === "done" && evt.projectId) {
              router.push(`/projects/${evt.projectId}`);
              return;
            } else if (evt.type === "error") {
              setError(evt.message ?? "Generation failed.");
              return;
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setError("Connection error. Please try again.");
    }
  }

  if (step === "generating") {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary)/0.1)]">
              <Zap className="h-7 w-7 animate-pulse text-[hsl(var(--primary))]" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Generating Your Digital Business</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{progressMsg || "Starting AI generation..."}</p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span>{completedCount} of {totalAssets} assets generated</span>
            <span>{Math.round((completedCount / totalAssets) * 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
              style={{ width: `${(completedCount / totalAssets) * 100}%` }}
            />
          </div>
        </div>

        {/* Asset grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GENERATION_ORDER.map((assetType) => {
            const s = progress[assetType]?.status ?? "pending";
            return (
              <div
                key={assetType}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all",
                  s === "completed" && "border-green-500/30 bg-green-500/5 text-green-600",
                  s === "generating" && "border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.05)] text-[hsl(var(--primary))]",
                  s === "failed" && "border-red-500/30 bg-red-500/5 text-red-600",
                  s === "pending" && "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]",
                )}
              >
                <span>{ASSET_TYPE_ICONS[assetType]}</span>
                <span className="truncate font-medium">{ASSET_TYPE_LABELS[assetType]}</span>
                {s === "generating" && <span className="ml-auto text-[10px] animate-pulse">...</span>}
                {s === "completed" && <span className="ml-auto text-[10px]">✓</span>}
                {s === "failed" && <span className="ml-auto text-[10px]">✗</span>}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-600">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {(["basics", "brand"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-[hsl(var(--border))]" />}
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
              step === s ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-sm", step === s ? "font-medium text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]")}>
              {s === "basics" ? "Product Info" : "Brand"}
            </span>
          </div>
        ))}
      </div>

      {step === "basics" && (
        <div className="space-y-5">
          <Field label="Product Idea *" hint="What are you creating?">
            <textarea
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] h-24 resize-none"
              placeholder="e.g. A complete guide to freelancing as a graphic designer, including how to find clients, price your services, and scale to $10k/month"
              value={form.productIdea}
              onChange={e => set("productIdea", e.target.value)}
            />
          </Field>
          <Field label="Target Audience *">
            <textarea
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] h-20 resize-none"
              placeholder="e.g. Aspiring freelance designers aged 22-35 who want to leave their 9-5"
              value={form.targetAudience}
              onChange={e => set("targetAudience", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Industry">
              <select className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]" value={form.industry} onChange={e => set("industry", e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Goal">
              <select className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]" value={form.goal} onChange={e => set("goal", e.target.value)}>
                {GOALS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Tone">
              <select className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]" value={form.tone} onChange={e => set("tone", e.target.value)}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]" value={form.language} onChange={e => set("language", e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setStep("brand")}
              disabled={!form.productIdea.trim() || !form.targetAudience.trim()}
              className="gap-2"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "brand" && (
        <div className="space-y-5">
          <Field label="Brand Name *">
            <input
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
              placeholder="e.g. DesignPro Academy"
              value={form.brandName}
              onChange={e => set("brandName", e.target.value)}
            />
          </Field>
          <Field label="Logo URL (optional)">
            <input
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)]"
              placeholder="https://..."
              value={form.logoUrl}
              onChange={e => set("logoUrl", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5" />
                <input className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] flex-1" value={form.primaryColor} onChange={e => set("primaryColor", e.target.value)} />
              </div>
            </Field>
            <Field label="Secondary Color">
              <div className="flex items-center gap-2">
                <input type="color" value={form.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0.5" />
                <input className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.3)] flex-1" value={form.secondaryColor} onChange={e => set("secondaryColor", e.target.value)} />
              </div>
            </Field>
          </div>

          {/* Preview */}
          <div
            className="flex h-24 items-center justify-center rounded-xl text-white"
            style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}
          >
            <span className="text-lg font-bold">{form.brandName || "Your Brand"}</span>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("basics")} className="gap-2">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={startGeneration}
              disabled={!form.brandName.trim()}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" /> Generate Everything
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</label>
      {hint && <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
      {children}
    </div>
  );
}
