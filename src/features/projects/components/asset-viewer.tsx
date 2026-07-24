"use client";

import { Component, type ReactNode } from "react";
import type { ProjectAsset, AssetType } from "@/types/projects";
import type {
  EbookOutlineContent, WorkbookContent, ChecklistContent, LeadMagnetContent,
  EmailSequenceContent, SocialMediaPackContent, AiCoverContent, ProductDescriptionContent,
  SeoMetadataContent, FaqContent, CtaPackContent, DownloadPageContent,
} from "@/types/projects";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "lucide-react";

interface Props {
  asset: ProjectAsset;
}

// A malformed AI response (a field that should be a list arriving as a string,
// a missing nested object) would otherwise throw during render and take down
// the whole page via the route error boundary. Catch it here and degrade to a
// readable JSON dump so the rest of the project stays usable.
class ViewerErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function AssetViewer({ asset }: Props) {
  return (
    <ViewerErrorBoundary
      fallback={
        <div className="space-y-2">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            This asset couldn&apos;t be displayed in the formatted view. Showing the raw content:
          </p>
          <pre className="overflow-auto rounded-lg bg-[hsl(var(--muted))] p-3 text-xs">
            {JSON.stringify(asset.content, null, 2)}
          </pre>
        </div>
      }
    >
      <AssetViewerInner asset={asset} />
    </ViewerErrorBoundary>
  );
}

function AssetViewerInner({ asset }: Props) {
  if (!asset.content) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">No content available.</p>;
  }

  switch (asset.asset_type as AssetType) {
    case "product_description":
      return <ProductDescriptionView content={asset.content as ProductDescriptionContent} />;
    case "seo_metadata":
      return <SeoMetadataView content={asset.content as SeoMetadataContent} />;
    case "ebook_outline":
      return <EbookView content={asset.content as EbookOutlineContent} />;
    case "workbook":
      return <WorkbookView content={asset.content as WorkbookContent} />;
    case "checklist":
      return <ChecklistView content={asset.content as ChecklistContent} />;
    case "lead_magnet":
      return <LeadMagnetView content={asset.content as LeadMagnetContent} />;
    case "email_sequence":
      return <EmailSequenceView content={asset.content as EmailSequenceContent} />;
    case "social_media_pack":
      return <SocialMediaPackView content={asset.content as SocialMediaPackContent} />;
    case "ai_cover":
      return <AiCoverView content={asset.content as AiCoverContent} />;
    case "faq":
      return <FaqView content={asset.content as FaqContent} />;
    case "cta_pack":
      return <CtaPackView content={asset.content as CtaPackContent} />;
    case "download_page":
      return <DownloadPageView content={asset.content as DownloadPageContent} />;
    case "landing_page":
    case "sales_page":
      return <LandingPageAssetView asset={asset} />;
    default:
      return <pre className="text-xs overflow-auto">{JSON.stringify(asset.content, null, 2)}</pre>;
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--foreground))]">
      {children}
    </span>
  );
}

function ProductDescriptionView({ content }: { content: ProductDescriptionContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.headline}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">{content.subheadline}</p>
      </div>
      <Section title="Short Description">
        <p className="text-sm text-[hsl(var(--foreground))]">{content.shortDescription}</p>
      </Section>
      <Section title="Long Description">
        <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{content.longDescription}</p>
      </Section>
      <Section title="Key Benefits">
        <ul className="space-y-1.5">
          {content.bulletPoints?.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-[hsl(var(--primary))]">•</span>
              {b}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Unique Value Proposition">
        <p className="rounded-lg bg-[hsl(var(--primary)/0.05)] p-3 text-sm font-medium text-[hsl(var(--foreground))]">{content.uniqueValueProp}</p>
      </Section>
    </div>
  );
}

function SeoMetadataView({ content }: { content: SeoMetadataContent }) {
  return (
    <div className="space-y-4">
      {[
        { label: "Meta Title", value: content.metaTitle },
        { label: "Meta Description", value: content.metaDescription },
        { label: "OG Title", value: content.ogTitle },
        { label: "OG Description", value: content.ogDescription },
        { label: "Twitter Title", value: content.twitterTitle },
        { label: "Twitter Description", value: content.twitterDescription },
      ].map(({ label, value }) => (
        <Section key={label} title={label}>
          <p className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2 text-sm font-mono">{value}</p>
        </Section>
      ))}
      <Section title="Keywords">
        <div className="flex flex-wrap gap-1.5">
          {content.keywords?.map((kw, i) => <Tag key={i}>{kw}</Tag>)}
        </div>
      </Section>
    </div>
  );
}

function EbookView({ content }: { content: EbookOutlineContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.title}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">{content.subtitle}</p>
      </div>
      <Section title="Introduction">
        <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{content.introduction}</p>
      </Section>
      <Section title="Chapters">
        <div className="space-y-3">
          {content.chapters?.map((ch) => (
            <div key={ch.number} className="rounded-lg border border-[hsl(var(--border))] p-3">
              <p className="font-semibold text-sm text-[hsl(var(--foreground))]">Chapter {ch.number}: {ch.title}</p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{ch.description}</p>
              {ch.keyPoints && (
                <ul className="mt-2 space-y-1">
                  {ch.keyPoints.map((kp, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[hsl(var(--foreground))]">
                      <span className="text-[hsl(var(--primary))]">–</span> {kp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Section>
      <Section title="Call to Action">
        <p className="text-sm font-medium text-[hsl(var(--primary))]">{content.callToAction}</p>
      </Section>
    </div>
  );
}

function WorkbookView({ content }: { content: WorkbookContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.title}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{content.introduction}</p>
      </div>
      {content.modules?.map((mod, mi) => (
        <div key={mi} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
          <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">{mod.title}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{mod.objective}</p>
          </div>
          {mod.exercises?.map((ex, ei) => (
            <div key={ei} className="rounded-lg bg-[hsl(var(--muted)/0.5)] p-3 space-y-2">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{ex.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{ex.prompt}</p>
              <div className="space-y-1.5">
                {Array.from({ length: ex.fieldCount ?? 2 }).map((_, fi) => (
                  <div key={fi} className="h-8 rounded border border-dashed border-[hsl(var(--border))] bg-white/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChecklistView({ content }: { content: ChecklistContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.title}</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{content.description}</p>
      </div>
      {content.sections?.map((sec, si) => (
        <div key={si} className="space-y-2">
          <h3 className="font-semibold text-[hsl(var(--foreground))]">{sec.title}</h3>
          {sec.items?.map((item, ii) => (
            <div key={ii} className="flex items-start gap-2.5 rounded-lg border border-[hsl(var(--border))] px-3 py-2">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[hsl(var(--border))]" />
              <div>
                <p className="text-sm text-[hsl(var(--foreground))]">{item.text}</p>
                {item.note && <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function LeadMagnetView({ content }: { content: LeadMagnetContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.title}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">{content.subtitle}</p>
      </div>
      <Section title="Hook">
        <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">{content.hook}</p>
      </Section>
      {content.sections?.map((sec, i) => (
        <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-4 space-y-2">
          <h3 className="font-semibold text-sm text-[hsl(var(--foreground))]">{sec.heading}</h3>
          <p className="text-sm text-[hsl(var(--foreground))]">{sec.content}</p>
          {sec.tip && <p className="text-xs rounded bg-[hsl(var(--primary)/0.08)] px-2 py-1 text-[hsl(var(--primary))]">💡 {sec.tip}</p>}
        </div>
      ))}
      <Section title="Call to Action">
        <p className="text-sm font-medium text-[hsl(var(--primary))]">{content.cta}</p>
      </Section>
    </div>
  );
}

function EmailSequenceView({ content }: { content: EmailSequenceContent }) {
  return (
    <div className="space-y-4">
      {content.emails?.map((email, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.1)] text-xs font-bold text-[hsl(var(--primary))]">{i + 1}</span>
            <div>
              <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{email.subject}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{email.delay} · {email.preheader}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[hsl(var(--foreground))] whitespace-pre-line">{email.body}</p>
          <div className="rounded bg-[hsl(var(--primary)/0.05)] px-3 py-1.5 text-sm font-medium text-[hsl(var(--primary))]">CTA: {email.cta}</div>
        </div>
      ))}
    </div>
  );
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-600",
  linkedin: "bg-blue-500/10 text-blue-700",
  twitter: "bg-sky-500/10 text-sky-600",
  facebook: "bg-blue-600/10 text-blue-700",
};

function SocialMediaPackView({ content }: { content: SocialMediaPackContent }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {content.posts?.map((post, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PLATFORM_COLORS[post.platform] ?? ""}`}>
            {post.platform}
          </span>
          <p className="text-xs font-medium text-[hsl(var(--foreground))]">{post.hook}</p>
          <p className="text-sm text-[hsl(var(--foreground))]">{post.caption}</p>
          <div className="flex flex-wrap gap-1">
            {post.hashtags?.map((ht, hi) => (
              <span key={hi} className="text-xs text-[hsl(var(--primary))]">#{ht}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AiCoverView({ content }: { content: AiCoverContent }) {
  return (
    <div className="space-y-4">
      <div
        className="flex h-64 w-48 flex-col items-center justify-center rounded-xl p-4 text-center text-white shadow-lg"
        style={{ background: `linear-gradient(160deg, ${content.primaryColor}, ${content.secondaryColor})` }}
      >
        <p className="text-xs uppercase tracking-widest opacity-80 mb-3">{content.authorName}</p>
        <h2 className="text-lg font-bold leading-tight">{content.title}</h2>
        <p className="mt-2 text-xs opacity-80">{content.subtitle}</p>
        <p className="mt-4 text-xs font-medium opacity-90">{content.tagline}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-[hsl(var(--muted-foreground))]">Style:</span> <span className="capitalize">{content.style}</span></div>
        <div><span className="text-[hsl(var(--muted-foreground))]">Author:</span> {content.authorName}</div>
      </div>
    </div>
  );
}

function FaqView({ content }: { content: FaqContent }) {
  return (
    <div className="space-y-3">
      {content.items?.map((item, i) => (
        <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-4">
          <p className="font-semibold text-sm text-[hsl(var(--foreground))]">{item.question}</p>
          <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

function CtaPackView({ content }: { content: CtaPackContent }) {
  return (
    <div className="space-y-3">
      {content.ctas?.map((cta, i) => (
        <div key={i} className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">{cta.context}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-semibold text-white">{cta.primary}</span>
            <span className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--foreground))]">{cta.secondary}</span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{cta.microcopy}</p>
        </div>
      ))}
    </div>
  );
}

function DownloadPageView({ content }: { content: DownloadPageContent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">{content.headline}</h2>
        <p className="text-[hsl(var(--muted-foreground))]">{content.subheadline}</p>
      </div>
      <Section title="Thank You Message">
        <p className="text-sm text-[hsl(var(--foreground))]">{content.thankYouMessage}</p>
      </Section>
      <Section title="Download Instructions">
        <p className="text-sm text-[hsl(var(--foreground))]">{content.downloadInstructions}</p>
      </Section>
      {content.bonusItems?.length > 0 && (
        <Section title="Bonus Items">
          <div className="space-y-2">
            {content.bonusItems.map((b, i) => (
              <div key={i} className="rounded-lg border border-[hsl(var(--border))] p-3">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{b.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{b.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section title="Next Steps">
        <ul className="space-y-1.5">
          {content.nextSteps?.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="font-semibold text-[hsl(var(--primary))]">{i + 1}.</span> {s}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function LandingPageAssetView({ asset }: { asset: ProjectAsset }) {
  const content = asset.content as { landing_page_id?: string } | null;
  const landingPageId = asset.landing_page_id ?? content?.landing_page_id;

  if (!landingPageId) {
    return <p className="text-sm text-[hsl(var(--muted-foreground))]">Page not yet generated.</p>;
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-[hsl(var(--foreground))]">
        This {asset.asset_type === "landing_page" ? "landing" : "sales"} page has been created and is ready to edit.
      </p>
      <Link
        href={`/landing-pages/${landingPageId}/editor`}
        className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary)/0.9)]"
      >
        <ExternalLink className="h-4 w-4" /> Open in Editor
      </Link>
    </div>
  );
}
