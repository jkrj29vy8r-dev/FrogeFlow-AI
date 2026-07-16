import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const t = useTranslations("landing.cta");

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl lg:text-5xl">
          {t("headline")}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-[hsl(var(--muted-foreground))]">
          {t("subheadline")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="xl" asChild>
            <Link href="/sign-up">
              {t("button")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
