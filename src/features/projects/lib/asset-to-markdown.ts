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
import { markdownToHtml } from "@/lib/markdown";

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
  triggerDownload(text, filename, "text/markdown;charset=utf-8");
}

function triggerDownload(data: string, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Wraps markdown-rendered HTML in a clean, self-contained, printable document
// so a downloaded file opens beautifully in any browser or phone instead of
// showing raw `#`/`##` markdown symbols as plain text.
export function markdownToHtmlDocument(title: string, markdown: string): string {
  const body = markdownToHtml(markdown);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.65; color: #1a1a2e; background: #ffffff;
    max-width: 780px; margin: 0 auto; padding: 48px 24px 96px;
    -webkit-text-size-adjust: 100%;
  }
  h1 { font-size: 1.9rem; line-height: 1.2; margin: 2.2rem 0 1rem; letter-spacing: -0.02em; }
  h1:first-child { margin-top: 0; }
  h2 { font-size: 1.4rem; margin: 2rem 0 0.8rem; letter-spacing: -0.01em; }
  h3 { font-size: 1.12rem; margin: 1.6rem 0 0.6rem; }
  p { margin: 0.7rem 0; }
  ul, ol { margin: 0.7rem 0; padding-left: 1.4rem; }
  li { margin: 0.3rem 0; }
  a { color: #6d28d9; }
  blockquote {
    margin: 1rem 0; padding: 0.4rem 1rem; border-left: 3px solid #a78bfa;
    background: rgba(167,139,250,0.08); border-radius: 0 8px 8px 0;
  }
  code { background: rgba(0,0,0,0.06); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
  pre { background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid rgba(0,0,0,0.1); margin: 2.5rem 0; }
  em { color: #4b5563; }
  table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
  th, td { border: 1px solid rgba(0,0,0,0.12); padding: 0.5rem 0.7rem; text-align: left; }
  @media (prefers-color-scheme: dark) {
    body { color: #e5e7eb; background: #0f0f1a; }
    a { color: #a78bfa; }
    em { color: #9ca3af; }
    code, pre { background: rgba(255,255,255,0.08); }
    blockquote { background: rgba(167,139,250,0.12); }
    hr, th, td { border-color: rgba(255,255,255,0.14); }
  }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

// Triggers a browser download of a full HTML document named `filename`.
export function downloadHtmlFile(html: string, filename: string) {
  triggerDownload(html, filename, "text/html;charset=utf-8");
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
