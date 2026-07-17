import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCover } from "@/features/covers/actions/covers.actions";
import { buildCoverHtml } from "@/features/covers/lib/cover-html";
import type { CoverContent, ExportFormat } from "@/types/covers";

const CANVAS_W = 600;
const CANVAS_H = 900;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const format = (searchParams.get("format") ?? "png") as ExportFormat;
  const scale = Number(searchParams.get("scale") ?? "2");

  const { cover } = await getCover(id);
  if (!cover) return NextResponse.json({ error: "Cover not found" }, { status: 404 });

  if (format === "svg") {
    const svg = buildSvgExport(cover.content);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${sanitize(cover.name)}-cover.svg"`,
      },
    });
  }

  const html = buildCoverHtml(cover.content, 1);

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewportSize({ width: CANVAS_W, height: CANVAS_H });
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(1000);

    if (format === "pdf") {
      const pdfBuffer = await page.pdf({
        width: `${CANVAS_W}px`,
        height: `${CANVAS_H}px`,
        printBackground: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
        scale: Math.min(scale, 2),
      });
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${sanitize(cover.name)}-cover.pdf"`,
        },
      });
    }

    const imgBuffer = await page.screenshot({
      type: format === "jpg" ? "jpeg" : "png",
      clip: { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H },
      scale: "device",
    });

    const finalBuffer = scale > 1
      ? await resizeBuffer(imgBuffer, CANVAS_W * scale, CANVAS_H * scale, format === "jpg" ? "jpeg" : "png")
      : imgBuffer;

    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: {
        "Content-Type": format === "jpg" ? "image/jpeg" : "image/png",
        "Content-Disposition": `attachment; filename="${sanitize(cover.name)}-cover.${format}"`,
      },
    });
  } finally {
    await browser.close();
  }
}

function sanitize(name: string) {
  return name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

async function resizeBuffer(
  buf: Buffer,
  width: number,
  height: number,
  type: "png" | "jpeg"
): Promise<Buffer> {
  try {
    const sharp = (await import("sharp")).default;
    return await sharp(buf).resize(Math.round(width), Math.round(height))[type]().toBuffer();
  } catch {
    return buf;
  }
}

function buildSvgExport(content: CoverContent): string {
  const { background, elements } = content;
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  let bgEl = "";
  if (background.type === "solid") {
    bgEl = `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="${background.color ?? "#6366f1"}"/>`;
  } else if (background.type === "gradient" && background.gradient) {
    const stops = background.gradient.stops.map(s => `<stop offset="${s.position}%" stop-color="${s.color}"/>`).join("");
    const angle = background.gradient.angle ?? 135;
    const rad = (angle * Math.PI) / 180;
    const x2 = 50 + 50 * Math.cos(rad);
    const y2 = 50 + 50 * Math.sin(rad);
    bgEl = `<defs><linearGradient id="bg" x1="50%" y1="50%" x2="${x2}%" y2="${y2}%">${stops}</linearGradient></defs>
<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#bg)"/>`;
  } else {
    bgEl = `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="${background.color ?? "#6366f1"}"/>`;
  }

  const elSvg = sorted.map(el => {
    if (el.kind === "text") {
      const x = (el.x / 100) * CANVAS_W;
      const y = (el.y / 100) * CANVAS_H;
      const w = (el.width / 100) * CANVAS_W;
      return `<foreignObject x="${x}" y="${y}" width="${w}" height="${CANVAS_H}">
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'${el.fontFamily}',serif;font-size:${el.fontSize}px;font-weight:${el.fontWeight};font-style:${el.fontStyle};color:${el.color};text-align:${el.align};letter-spacing:${el.letterSpacing}px;line-height:${el.lineHeight};text-transform:${el.textTransform};opacity:${el.opacity};word-break:break-word;">${escSvg(el.value)}</div>
</foreignObject>`;
    }
    if (el.kind === "shape") {
      const x = (el.x / 100) * CANVAS_W;
      const y = (el.y / 100) * CANVAS_H;
      const w = (el.width / 100) * CANVAS_W;
      const h = (el.height / 100) * CANVAS_H;
      const rx = el.shape === "circle" ? Math.min(w, h) / 2 : el.borderRadius;
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${el.color}" opacity="${el.opacity}" transform="rotate(${el.rotation} ${x + w / 2} ${y + h / 2})"/>`;
    }
    return "";
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xhtml="http://www.w3.org/1999/xhtml" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
${bgEl}
${elSvg}
</svg>`;
}

function escSvg(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
