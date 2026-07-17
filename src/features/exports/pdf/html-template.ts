import type { ExportSettings, FontFamily, PageSize, CoverStyle } from "@/types/exports";
import type { Section } from "@/types/database";

// ── Google Font URLs ──────────────────────────────────────────────────────────

const FONT_IMPORTS: Record<FontFamily, string> = {
  inter: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');",
  georgia: "", // system font
  merriweather: "@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');",
  playfair: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');",
  lato: "@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');",
  opensans: "@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');",
};

const FONT_STACKS: Record<FontFamily, string> = {
  inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  georgia: "Georgia, 'Times New Roman', Times, serif",
  merriweather: "'Merriweather', Georgia, serif",
  playfair: "'Playfair Display', Georgia, serif",
  lato: "'Lato', Helvetica, Arial, sans-serif",
  opensans: "'Open Sans', Helvetica, Arial, sans-serif",
};

// ── Page dimensions ───────────────────────────────────────────────────────────

interface PageDimensions {
  width: string;
  height: string;
  margin: string;
}

const PAGE_DIMENSIONS: Record<PageSize, PageDimensions> = {
  a4: { width: "210mm", height: "297mm", margin: "20mm 25mm 25mm 25mm" },
  letter: { width: "216mm", height: "279mm", margin: "20mm 25mm 25mm 25mm" },
  a5: { width: "148mm", height: "210mm", margin: "15mm 18mm 20mm 18mm" },
};

// ── Cover generators ──────────────────────────────────────────────────────────

function renderCoverPage(
  title: string,
  subtitle: string,
  settings: ExportSettings
): string {
  const { primaryColor, secondaryColor, accentColor, authorName, companyName, coverStyle, coverImageUrl } = settings;

  const coverBg = coverImageUrl
    ? `background: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${coverImageUrl}') center/cover no-repeat;`
    : getCoverBackground(coverStyle, primaryColor, secondaryColor);

  const textColor = coverImageUrl ? "#ffffff" : getCoverTextColor(coverStyle);
  const accentStyle = `color: ${coverImageUrl ? accentColor : primaryColor};`;

  return `
  <div class="cover-page" style="${coverBg}">
    <div class="cover-inner">
      ${companyName ? `<div class="cover-company" style="${accentStyle}">${escHtml(companyName)}</div>` : ""}
      <div class="cover-divider" style="background: ${coverImageUrl ? accentColor : primaryColor};"></div>
      <h1 class="cover-title" style="color: ${textColor};">${escHtml(title)}</h1>
      ${subtitle ? `<p class="cover-subtitle" style="color: ${coverImageUrl ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)"};">${escHtml(subtitle)}</p>` : ""}
      ${authorName ? `<div class="cover-author" style="${accentStyle}">by ${escHtml(authorName)}</div>` : ""}
    </div>
    <div class="cover-footer">
      ${coverImageUrl ? "" : `<div class="cover-decoration" style="background: ${primaryColor}; opacity: 0.08;"></div>`}
    </div>
  </div>
  `;
}

function getCoverBackground(style: CoverStyle, primary: string, secondary: string): string {
  switch (style) {
    case "gradient":
      return `background: linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${lighten(primary, 20)} 100%);`;
    case "minimal":
      return `background: #fafafa; border-left: 12mm solid ${primary};`;
    case "bold":
      return `background: ${primary};`;
    case "elegant":
      return `background: linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);`;
    case "modern":
      return `background: linear-gradient(135deg, #0f0f23 0%, ${primary} 100%);`;
    default:
      return `background: ${primary};`;
  }
}

function getCoverTextColor(style: CoverStyle): string {
  switch (style) {
    case "minimal":
      return "#1a1a2e";
    default:
      return "#ffffff";
  }
}

function lighten(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── TOC renderer ──────────────────────────────────────────────────────────────

function renderToc(sections: Section[], primaryColor: string): string {
  const entries = sections
    .filter((s) => s.section_type !== "subchapter")
    .map(
      (s, i) => `
      <div class="toc-entry">
        <span class="toc-number" style="color:${primaryColor};">${i + 1}</span>
        <span class="toc-title">${escHtml(s.title)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">—</span>
      </div>
    `
    )
    .join("");

  return `
  <div class="toc-page">
    <h2 class="toc-heading" style="color:${primaryColor};">Table of Contents</h2>
    <div class="toc-list">${entries}</div>
  </div>
  `;
}

// ── Section type helpers ──────────────────────────────────────────────────────

const SECTION_TYPE_LABELS: Record<string, string> = {
  introduction: "Introduction",
  chapter: "Chapter",
  subchapter: "Subchapter",
  conclusion: "Conclusion",
  cta: "Call to Action",
  checklist_group: "Checklist",
  exercise: "Exercise",
  tips: "Tips",
};

function renderSection(
  section: Section,
  index: number,
  settings: ExportSettings
): string {
  const { primaryColor, secondaryColor } = settings;
  const isChapter = section.section_type === "chapter";
  const isSubchapter = section.section_type === "subchapter";
  const isIntro = section.section_type === "introduction";
  const isConclusion = section.section_type === "conclusion";

  const label = SECTION_TYPE_LABELS[section.section_type] ?? section.section_type;
  const chapterBreak = isChapter || isIntro || isConclusion ? 'style="page-break-before: always;"' : "";
  const chapterNum = isChapter ? `Chapter ${index}` : label;

  let header = "";
  if (isChapter || isIntro || isConclusion) {
    header = `
      <div class="chapter-header" ${chapterBreak}>
        <div class="chapter-label" style="color:${primaryColor};">${chapterNum}</div>
        <h2 class="chapter-title">${escHtml(section.title)}</h2>
        <div class="chapter-rule" style="background:${primaryColor};"></div>
      </div>
    `;
  } else if (isSubchapter) {
    header = `
      <div class="subchapter-header">
        <h3 class="subchapter-title" style="border-left:3px solid ${secondaryColor};">${escHtml(section.title)}</h3>
      </div>
    `;
  } else {
    header = `
      <div class="section-header">
        <span class="section-type-badge" style="background:${primaryColor}15; color:${primaryColor};">${label}</span>
        <h3 class="section-title">${escHtml(section.title)}</h3>
      </div>
    `;
  }

  const sanitizedContent = sanitizeHtmlForPdf(section.content, primaryColor);

  return `
  <div class="section-block">
    ${header}
    <div class="section-content">${sanitizedContent}</div>
  </div>
  `;
}

// ── HTML sanitizer for PDF ────────────────────────────────────────────────────

function sanitizeHtmlForPdf(html: string, primaryColor: string): string {
  if (!html || !html.trim()) return "<p><em>(No content)</em></p>";

  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/<a /g, `<a style="color:${primaryColor};" `)
    .replace(/<blockquote>/g, `<blockquote style="border-left:3px solid ${primaryColor};">`)
    .replace(/data-callout-type="info"/g, `data-callout-type="info" style="background:#eff6ff; border-left:4px solid #3b82f6;"`)
    .replace(/data-callout-type="warning"/g, `data-callout-type="warning" style="background:#fffbeb; border-left:4px solid #f59e0b;"`)
    .replace(/data-callout-type="success"/g, `data-callout-type="success" style="background:#f0fdf4; border-left:4px solid #22c55e;"`)
    .replace(/data-callout-type="tip"/g, `data-callout-type="tip" style="background:#f5f3ff; border-left:4px solid ${primaryColor};"`)
    .replace(/<ul data-type="taskList">/g, '<ul class="task-list">')
    .replace(/<li data-checked="true">/g, '<li class="task-done">✓ ')
    .replace(/<li data-checked="false">/g, '<li class="task-todo">☐ ');
}

function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── CSS styles ────────────────────────────────────────────────────────────────

function buildStyles(settings: ExportSettings): string {
  const { pageSize, fontSize, fontFamily, primaryColor, includeWatermark } = settings;
  const dims = PAGE_DIMENSIONS[pageSize];
  const fontImport = FONT_IMPORTS[fontFamily];
  const fontStack = FONT_STACKS[fontFamily];
  const baseFontSize = `${fontSize}pt`;
  const headingFont =
    fontFamily === "inter" || fontFamily === "lato" || fontFamily === "opensans"
      ? fontStack
      : fontStack; // same for now

  return `
    ${fontImport}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page {
      size: ${dims.width} ${dims.height};
      margin: ${dims.margin};
    }

    body {
      font-family: ${fontStack};
      font-size: ${baseFontSize};
      line-height: 1.7;
      color: #1a1a2e;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* ── Cover page ─────────────────────────────────────────────────────── */
    .cover-page {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 20mm 25mm;
      position: relative;
      page-break-after: always;
    }
    .cover-inner { max-width: 80%; }
    .cover-company {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8mm;
    }
    .cover-divider {
      width: 15mm;
      height: 2px;
      margin-bottom: 8mm;
    }
    .cover-title {
      font-family: ${headingFont};
      font-size: 28pt;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      margin-bottom: 6mm;
    }
    .cover-subtitle {
      font-size: 13pt;
      line-height: 1.5;
      margin-bottom: 12mm;
      font-weight: 300;
    }
    .cover-author {
      font-size: 10pt;
      font-weight: 500;
      letter-spacing: 0.05em;
    }
    .cover-footer { margin-top: auto; }

    /* ── TOC page ───────────────────────────────────────────────────────── */
    .toc-page {
      page-break-after: always;
      padding: 8mm 0;
    }
    .toc-heading {
      font-family: ${headingFont};
      font-size: 18pt;
      font-weight: 700;
      margin-bottom: 8mm;
      padding-bottom: 3mm;
      border-bottom: 1px solid #e5e7eb;
    }
    .toc-list { display: flex; flex-direction: column; gap: 3mm; }
    .toc-entry {
      display: flex;
      align-items: baseline;
      gap: 3mm;
      font-size: 10pt;
    }
    .toc-number {
      font-weight: 700;
      font-size: 9pt;
      min-width: 6mm;
    }
    .toc-title { font-weight: 500; }
    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #d1d5db;
      margin: 0 2mm;
    }
    .toc-page { color: #6b7280; font-size: 9pt; }

    /* ── Chapter header ─────────────────────────────────────────────────── */
    .chapter-header {
      margin-bottom: 8mm;
      padding-top: 6mm;
    }
    .chapter-label {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 3mm;
    }
    .chapter-title {
      font-family: ${headingFont};
      font-size: 20pt;
      font-weight: 700;
      line-height: 1.2;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin-bottom: 4mm;
    }
    .chapter-rule {
      width: 10mm;
      height: 3px;
      border-radius: 2px;
      margin-bottom: 6mm;
    }

    /* ── Subchapter ─────────────────────────────────────────────────────── */
    .subchapter-title {
      font-family: ${headingFont};
      font-size: 13pt;
      font-weight: 600;
      color: #1e293b;
      padding-left: 4mm;
      margin: 6mm 0 3mm;
      line-height: 1.3;
    }

    /* ── Section header ─────────────────────────────────────────────────── */
    .section-type-badge {
      display: inline-block;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.8mm 2.5mm;
      border-radius: 2mm;
      margin-bottom: 2mm;
    }
    .section-title {
      font-family: ${headingFont};
      font-size: 13pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4mm;
    }

    /* ── Section content ────────────────────────────────────────────────── */
    .section-block { margin-bottom: 8mm; }
    .section-content { font-size: ${baseFontSize}; }

    .section-content p { margin-bottom: 3mm; }
    .section-content p:last-child { margin-bottom: 0; }

    .section-content h1 {
      font-family: ${headingFont};
      font-size: 16pt;
      font-weight: 700;
      margin: 5mm 0 3mm;
      color: #0f172a;
    }
    .section-content h2 {
      font-family: ${headingFont};
      font-size: 13pt;
      font-weight: 600;
      margin: 4mm 0 2mm;
      color: #1e293b;
    }
    .section-content h3 {
      font-family: ${headingFont};
      font-size: 11pt;
      font-weight: 600;
      margin: 3mm 0 2mm;
      color: #1e293b;
    }

    .section-content ul, .section-content ol {
      padding-left: 6mm;
      margin: 2mm 0 3mm;
    }
    .section-content li { margin-bottom: 1.5mm; }
    .section-content ul { list-style-type: disc; }
    .section-content ol { list-style-type: decimal; }

    .section-content strong { font-weight: 700; }
    .section-content em { font-style: italic; }
    .section-content u { text-decoration: underline; }
    .section-content s { text-decoration: line-through; opacity: 0.65; }

    .section-content blockquote {
      margin: 4mm 0;
      padding: 3mm 4mm;
      border-radius: 2mm;
      background: #f8f9fa;
      font-style: italic;
      color: #374151;
    }

    .section-content code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.88em;
      background: #f3f4f6;
      padding: 0.5mm 1.5mm;
      border-radius: 1mm;
      color: ${primaryColor};
    }

    .section-content pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 4mm 5mm;
      border-radius: 2mm;
      margin: 3mm 0;
      overflow: hidden;
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.5;
    }
    .section-content pre code {
      background: none;
      color: inherit;
      padding: 0;
    }

    .section-content a { color: ${primaryColor}; }

    .section-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 3mm 0;
      font-size: 9.5pt;
    }
    .section-content th {
      background: ${primaryColor};
      color: white;
      padding: 2mm 3mm;
      text-align: left;
      font-weight: 600;
    }
    .section-content td {
      padding: 2mm 3mm;
      border-bottom: 0.3mm solid #e5e7eb;
    }
    .section-content tr:nth-child(even) td { background: #f9fafb; }

    .section-content img {
      max-width: 100%;
      height: auto;
      border-radius: 2mm;
      margin: 3mm 0;
    }

    .section-content hr {
      border: none;
      border-top: 0.5mm solid #e5e7eb;
      margin: 4mm 0;
    }

    /* Task list */
    .section-content .task-list { list-style: none; padding-left: 0; }
    .section-content .task-done { color: #16a34a; font-weight: 500; }
    .section-content .task-todo { color: #374151; }

    /* Callout blocks */
    .section-content [data-callout] {
      border-radius: 2mm;
      padding: 3mm 4mm;
      margin: 3mm 0;
      font-size: 9.5pt;
    }

    /* ── Watermark ──────────────────────────────────────────────────────── */
    ${includeWatermark ? `
    body::after {
      content: "Generated with FrogeFlow AI";
      position: fixed;
      bottom: 5mm;
      right: 8mm;
      font-size: 7pt;
      color: #d1d5db;
      font-family: ${fontStack};
    }
    ` : ""}

    /* ── Running header/footer ──────────────────────────────────────────── */
    @page:not(:first) {
      @top-center {
        content: "${settings.includeHeaderFooter ? "FrogeFlow AI" : ""}";
        font-size: 7pt;
        color: #9ca3af;
      }
      @bottom-right {
        content: ${settings.includePageNumbers ? "counter(page)" : '""'};
        font-size: 8pt;
        color: #6b7280;
        font-family: ${fontStack};
      }
      @bottom-left {
        content: "${settings.footerText ? settings.footerText.replace(/"/g, '\\"') : (settings.includeHeaderFooter ? (settings.companyName || "FrogeFlow AI") : "")}";
        font-size: 8pt;
        color: #9ca3af;
        font-family: ${fontStack};
      }
    }

    /* ── Print media ────────────────────────────────────────────────────── */
    @media print {
      body { background: white; }
      .cover-page { page-break-after: always; }
      .toc-page { page-break-after: always; }
    }
  `;
}

// ── Main template builder ─────────────────────────────────────────────────────

export interface TemplateInput {
  title: string;
  subtitle?: string;
  sections: Section[];
  settings: ExportSettings;
}

export function buildPdfHtml(input: TemplateInput): string {
  const { title, subtitle = "", sections, settings } = input;
  const {
    primaryColor,
    includeCoverPage,
    includeTableOfContents,
  } = settings;

  const styles = buildStyles(settings);

  // Cover page
  const coverHtml = includeCoverPage
    ? renderCoverPage(title, subtitle, settings)
    : "";

  // TOC
  const tocHtml = includeTableOfContents && sections.length > 1
    ? renderToc(sections, primaryColor)
    : "";

  // Chapter counter (only counts "chapter" sections)
  let chapterCount = 0;
  const sectionsHtml = sections
    .map((s) => {
      if (s.section_type === "chapter") chapterCount++;
      return renderSection(s, chapterCount, settings);
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <style>${styles}</style>
</head>
<body>
  ${coverHtml}
  ${tocHtml}
  <div class="document-body">
    ${sectionsHtml}
  </div>
</body>
</html>`;
}
