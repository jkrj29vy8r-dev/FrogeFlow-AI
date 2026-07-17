import type { PageSize, QualityPreset } from "@/types/exports";
import type { TemplateInput } from "./html-template";
import { buildPdfHtml } from "./html-template";

// ── Page format mapping ───────────────────────────────────────────────────────

const PAGE_FORMATS: Record<PageSize, { width: string; height: string }> = {
  a4: { width: "210mm", height: "297mm" },
  letter: { width: "216mm", height: "279mm" },
  a5: { width: "148mm", height: "210mm" },
};

// ── Quality scale mapping ─────────────────────────────────────────────────────

const QUALITY_SCALE: Record<QualityPreset, number> = {
  digital: 1,
  print: 2,
  compressed: 0.8,
};

// ── Result type ───────────────────────────────────────────────────────────────

export interface PdfGenerationResult {
  buffer: Buffer;
  pageCount: number;
  fileSizeBytes: number;
  fileName: string;
}

// ── PDF generator ─────────────────────────────────────────────────────────────

export async function generatePdf(
  input: TemplateInput
): Promise<PdfGenerationResult> {
  const { chromium } = await import("playwright");
  const { settings } = input;

  const html = buildPdfHtml(input);
  const format = PAGE_FORMATS[settings.pageSize];
  const isLandscape = settings.orientation === "landscape";

  // Launch Chromium (pre-installed at /opt/pw-browsers/chromium)
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set content directly (faster than navigation)
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    // Wait for fonts to load
    await page.waitForTimeout(800);

    const pdfBuffer = await page.pdf({
      width: isLandscape ? format.height : format.width,
      height: isLandscape ? format.width : format.height,
      printBackground: true,
      displayHeaderFooter: false, // We use CSS @page rules
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      scale: QUALITY_SCALE[settings.quality],
    });

    const buffer = Buffer.from(pdfBuffer);
    const safeTitle = input.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40);
    const fileName = `${safeTitle}-${Date.now()}.pdf`;

    return {
      buffer,
      pageCount: 0, // Playwright doesn't expose page count easily
      fileSizeBytes: buffer.length,
      fileName,
    };
  } finally {
    await browser.close();
  }
}
