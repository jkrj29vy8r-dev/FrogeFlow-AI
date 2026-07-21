import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

const PROTECTED_PATHS = [
  "/dashboard",
  "/editor",
  "/settings",
  "/billing",
  "/new",
  "/projects",
  "/templates",
  "/documents",
  "/exports",
  "/help",
  "/ai-generator",
  "/generate",
  "/covers",
  "/landing-pages",
  "/admin",
];
const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password"];

// Supabase sets this cookie when authenticated (project ref = ryxfngutqumfzqfranma)
const SUPABASE_AUTH_COOKIE = "sb-ryxfngutqumfzqfranma-auth-token";

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang
      .split(",")
      .map((p) => p.trim().split(";")[0].trim().split("-")[0].toLowerCase());
    for (const lang of preferred) {
      if ((locales as readonly string[]).includes(lang)) return lang;
    }
  }
  return defaultLocale;
}

function isAuthenticated(request: NextRequest): boolean {
  // Check Supabase auth cookie (any of the possible formats)
  const authCookie = request.cookies.get(SUPABASE_AUTH_COOKIE)?.value;
  if (authCookie) return true;
  // Also check legacy/chunked cookie format
  const chunk0 = request.cookies.get(`${SUPABASE_AUTH_COOKIE}.0`)?.value;
  if (chunk0) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const locale = detectLocale(request);
  const headers = new Headers(request.headers);
  headers.set("X-NEXT-INTL-LOCALE", locale);

  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );

  const authed = isAuthenticated(request);

  if (isProtected && !authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathnameWithoutLocale);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && authed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
