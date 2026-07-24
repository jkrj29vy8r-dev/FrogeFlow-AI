import type {
  ProjectAsset,
  AssetType,
  EbookOutlineContent,
  WorkbookContent,
  ChecklistContent,
  LeadMagnetContent,
  EmailSequenceContent,
  SocialMediaPackContent,
  AiCoverContent,
  ProductDescriptionContent,
  SeoMetadataContent,
  FaqContent,
  CtaPackContent,
  DownloadPageContent,
} from "@/types/projects";
import { ASSET_TYPE_LABELS } from "@/types/projects";

// Normalizes any value into an array so `.map`/`.flatMap` never throws when the
// AI returns a malformed shape (a string or object where a list was expected).
function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// Turns a generated asset's structured content into readable Markdown so it can
// be copied to the clipboard or downloaded as a .md file. Falls back to pretty
// JSON for anything without a dedicated formatter. Never throws — a malformed
// asset degrades to a JSON dump instead of crashing the export.
export function assetToMarkdown(asset: ProjectAsset): string {
  const c = asset.content as Record<string, unknown> | null;
  if (!c) return `# ${asset.name}\n\n_(No content)_\n`;

  const title = `# ${asset.name}\n_${ASSET_TYPE_LABELS[asset.asset_type as AssetType] ?? asset.asset_type}_\n`;
  let body: string;
  try {
    body = formatBody(asset.asset_type as AssetType, c);
  } catch {
    body = "```json\n" + JSON.stringify(c, null, 2) + "\n```";
  }
  return `${title}\n${body}\n`;
}

function formatBody(type: AssetType, raw: Record<string, unknown>): string {
  switch (type) {
    case "product_description": {
      const c = raw as unknown as ProductDescriptionContent;
      return [
        `## ${c.headline ?? ""}`,
        c.subheadline ?? "",
        "",
        "### Short Description",
        c.shortDescription ?? "",
        "",
        "### Long Description",
        c.longDescription ?? "",
        "",
        "### Key Benefits",
        ...arr<string>(c.bulletPoints).map((b) => `- ${b}`),
        "",
        "### Unique Value Proposition",
        c.uniqueValueProp ?? "",
      ].join("\n");
    }
    case "seo_metadata": {
      const c = raw as unknown as SeoMetadataContent;
      return [
        `- **Meta Title:** ${c.metaTitle ?? ""}`,
        `- **Meta Description:** ${c.metaDescription ?? ""}`,
        `- **OG Title:** ${c.ogTitle ?? ""}`,
        `- **OG Description:** ${c.ogDescription ?? ""}`,
        `- **Twitter Title:** ${c.twitterTitle ?? ""}`,
        `- **Twitter Description:** ${c.twitterDescription ?? ""}`,
        "",
        `**Keywords:** ${arr<string>(c.keywords).join(", ")}`,
      ].join("\n");
    }
    case "ebook_outline": {
      const c = raw as unknown as EbookOutlineContent;
      return [
        `## ${c.title ?? ""}`,
        c.subtitle ?? "",
        "",
        "### Introduction",
        c.introduction ?? "",
        "",
        ...arr<EbookOutlineContent["chapters"][number]>(c.chapters).flatMap((ch) => [
          `### Chapter ${ch.number}: ${ch.title}`,
          ch.description ?? "",
          ...arr<string>(ch.keyPoints).map((kp) => `- ${kp}`),
          "",
        ]),
        "### Call to Action",
        c.callToAction ?? "",
      ].join("\n");
    }
    case "workbook": {
      const c = raw as unknown as WorkbookContent;
      return [
        `## ${c.title ?? ""}`,
        c.introduction ?? "",
        "",
        ...arr<WorkbookContent["modules"][number]>(c.modules).flatMap((m) => [
          `### ${m.title}`,
          `_${m.objective ?? ""}_`,
          "",
          ...arr<WorkbookContent["modules"][number]["exercises"][number]>(m.exercises).flatMap((ex) => [
            `**${ex.title}**`,
            ex.prompt ?? "",
            "",
          ]),
        ]),
      ].join("\n");
    }
    case "checklist": {
      const c = raw as unknown as ChecklistContent;
      return [
        `## ${c.title ?? ""}`,
        c.description ?? "",
        "",
        ...arr<ChecklistContent["sections"][number]>(c.sections).flatMap((s) => [
          `### ${s.title}`,
          ...arr<ChecklistContent["sections"][number]["items"][number]>(s.items).map(
            (it) => `- [ ] ${it.text}${it.note ? ` — _${it.note}_` : ""}`
          ),
          "",
        ]),
      ].join("\n");
    }
    case "lead_magnet": {
      const c = raw as unknown as LeadMagnetContent;
      return [
        `## ${c.title ?? ""}`,
        c.subtitle ?? "",
        "",
        `> ${c.hook ?? ""}`,
        "",
        ...arr<LeadMagnetContent["sections"][number]>(c.sections).flatMap((s) => [
          `### ${s.heading}`,
          s.content ?? "",
          s.tip ? `\n💡 _${s.tip}_` : "",
          "",
        ]),
        `**CTA:** ${c.cta ?? ""}`,
      ].join("\n");
    }
    case "email_sequence": {
      const c = raw as unknown as EmailSequenceContent;
      return arr<EmailSequenceContent["emails"][number]>(c.emails)
        .map((e, i) =>
          [
            `## Email ${i + 1}: ${e.subject}`,
            `_${e.delay ?? ""} · ${e.preheader ?? ""}_`,
            "",
            e.body ?? "",
            "",
            `**CTA:** ${e.cta ?? ""}`,
          ].join("\n")
        )
        .join("\n\n---\n\n");
    }
    case "social_media_pack": {
      const c = raw as unknown as SocialMediaPackContent;
      return arr<SocialMediaPackContent["posts"][number]>(c.posts)
        .map((p) =>
          [
            `## ${p.platform}`,
            p.hook ? `_${p.hook}_` : "",
            "",
            p.caption ?? "",
            "",
            arr<string>(p.hashtags).map((h) => `#${h}`).join(" "),
          ].join("\n")
        )
        .join("\n\n---\n\n");
    }
    case "ai_cover": {
      const c = raw as unknown as AiCoverContent;
      return [
        `## ${c.title ?? ""}`,
        c.subtitle ?? "",
        `_${c.tagline ?? ""}_`,
        "",
        `- **Author:** ${c.authorName ?? ""}`,
        `- **Style:** ${c.style ?? ""}`,
        `- **Colors:** ${c.primaryColor ?? ""} → ${c.secondaryColor ?? ""}`,
      ].join("\n");
    }
    case "faq": {
      const c = raw as unknown as FaqContent;
      return arr<FaqContent["items"][number]>(c.items)
        .map((it) => `### ${it.question}\n${it.answer ?? ""}`)
        .join("\n\n");
    }
    case "cta_pack": {
      const c = raw as unknown as CtaPackContent;
      return arr<CtaPackContent["ctas"][number]>(c.ctas)
        .map((cta) =>
          [
            `### ${cta.context}`,
            `- **Primary:** ${cta.primary}`,
            `- **Secondary:** ${cta.secondary}`,
            cta.microcopy ? `- _${cta.microcopy}_` : "",
          ].join("\n")
        )
        .join("\n\n");
    }
    case "download_page": {
      const c = raw as unknown as DownloadPageContent;
      return [
        `## ${c.headline ?? ""}`,
        c.subheadline ?? "",
        "",
        "### Thank You Message",
        c.thankYouMessage ?? "",
        "",
        "### Download Instructions",
        c.downloadInstructions ?? "",
        "",
        ...(c.bonusItems?.length
          ? [
              "### Bonus Items",
              ...c.bonusItems.map((b) => `- **${b.title}** — ${b.description}`),
              "",
            ]
          : []),
        "### Next Steps",
        ...arr<string>(c.nextSteps).map((s, i) => `${i + 1}. ${s}`),
      ].join("\n");
    }
    default:
      return "```json\n" + JSON.stringify(raw, null, 2) + "\n```";
  }
}

// Triggers a browser download of `text` as a file named `filename`.
export function downloadTextFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function slugify(name: string): string {
  return (
    name
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "asset"
  );
}
