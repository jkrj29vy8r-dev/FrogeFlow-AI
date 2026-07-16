import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { BookOpen } from "lucide-react";

export function MarketingFooter() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  const footerLinks = {
    [t("product")]: [
      { label: t("links.features"), href: "/#features" },
      { label: t("links.pricing"), href: "/pricing" },
      { label: t("links.changelog"), href: "/changelog" },
    ],
    [t("company")]: [
      { label: t("links.about"), href: "/about" },
      { label: t("links.blog"), href: "/blog" },
      { label: t("links.contact"), href: "/contact" },
    ],
    [t("legal")]: [
      { label: t("links.privacy"), href: "/privacy" },
      { label: t("links.terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-[hsl(var(--border))] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--primary))]">
                <BookOpen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm">{tCommon("appName")}</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              {t("description")}
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="mb-3 text-sm font-semibold text-[hsl(var(--foreground))]">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[hsl(var(--border))] pt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
