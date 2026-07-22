/**
 * Cross-environment Chromium launcher.
 * - Dev/CCR: uses /opt/pw-browsers/chromium (pre-installed)
 * - Vercel production: uses @sparticuz/chromium (serverless bundle)
 * - Override with PLAYWRIGHT_CHROMIUM_PATH env var
 */
export async function launchBrowser() {
  // Use playwright-core (not the full "playwright" package) — every branch
  // below always supplies an explicit executablePath, so the full package's
  // bundled browser-download machinery is never needed. Importing it anyway
  // breaks the Vercel serverless bundle: "playwright"'s browsers.json isn't
  // included in the deployment output, causing a hard "Cannot find module
  // .../playwright-core/browsers.json" crash at import time.
  const { chromium } = await import("playwright-core");

  const customPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

  if (customPath) {
    return chromium.launch({
      executablePath: customPath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--font-render-hinting=none"],
    });
  }

  // Try @sparticuz/chromium for serverless environments (Vercel)
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const sparticuz = await import("@sparticuz/chromium");
      const executablePath = await sparticuz.default.executablePath();
      return chromium.launch({
        executablePath,
        args: [...sparticuz.default.args, "--font-render-hinting=none"],
        headless: true,
      });
    } catch {
      // fall through to default
    }
  }

  // Local dev fallback
  return chromium.launch({
    executablePath: "/opt/pw-browsers/chromium",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--font-render-hinting=none"],
  });
}
