import { useTranslations } from "next-intl";
import {
  BookOpen,
  FileText,
  CheckSquare,
  Magnet,
  Globe,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ProductTypeKey =
  | "ebook"
  | "pdfGuide"
  | "workbook"
  | "checklist"
  | "leadMagnet"
  | "landingPage"
  | "salesPage"
  | "emailCampaign";

const PRODUCT_TYPE_CONFIG: Record<
  ProductTypeKey,
  { icon: LucideIcon; color: string }
> = {
  ebook: { icon: BookOpen, color: "text-violet-500 bg-violet-500/10" },
  pdfGuide: { icon: FileText, color: "text-blue-500 bg-blue-500/10" },
  workbook: { icon: FileText, color: "text-emerald-500 bg-emerald-500/10" },
  checklist: { icon: CheckSquare, color: "text-amber-500 bg-amber-500/10" },
  leadMagnet: { icon: Magnet, color: "text-rose-500 bg-rose-500/10" },
  landingPage: { icon: Globe, color: "text-cyan-500 bg-cyan-500/10" },
  salesPage: { icon: FileText, color: "text-indigo-500 bg-indigo-500/10" },
  emailCampaign: { icon: Mail, color: "text-orange-500 bg-orange-500/10" },
};

const PRODUCT_TYPE_KEYS: ProductTypeKey[] = [
  "ebook",
  "pdfGuide",
  "workbook",
  "checklist",
  "leadMagnet",
  "landingPage",
  "salesPage",
  "emailCampaign",
];

export function ProductTypesSection() {
  const t = useTranslations("landing.productTypes");

  return (
    <section
      id="products"
      className="border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] px-6 py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            {t("headline")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--muted-foreground))]">
            {t("subheadline")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PRODUCT_TYPE_KEYS.map((key) => {
            const { icon: Icon, color } = PRODUCT_TYPE_CONFIG[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center transition-shadow hover:shadow-md"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {t(key)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
