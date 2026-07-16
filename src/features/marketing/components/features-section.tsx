import { useTranslations } from "next-intl";
import { Zap, Edit3, Download, Layers, Shield, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FeatureKey =
  | "aiGeneration"
  | "editable"
  | "multipleFormats"
  | "exportAnywhere"
  | "blazingFast"
  | "secure";

const FEATURE_ICONS: Record<FeatureKey, LucideIcon> = {
  aiGeneration: Wand2,
  editable: Edit3,
  multipleFormats: Layers,
  exportAnywhere: Download,
  blazingFast: Zap,
  secure: Shield,
};

const FEATURE_KEYS: FeatureKey[] = [
  "aiGeneration",
  "editable",
  "multipleFormats",
  "exportAnywhere",
  "blazingFast",
  "secure",
];

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            {t("headline")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            {t("subheadline")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_KEYS.map((key) => {
            const Icon = FEATURE_ICONS[key];
            return (
              <div
                key={key}
                className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                  <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="mb-2 font-semibold text-[hsl(var(--foreground))]">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {t(`items.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
