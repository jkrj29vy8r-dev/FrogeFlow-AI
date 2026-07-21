import { createServerClient } from "@supabase/ssr";
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

// Detect locale from cookie or Accept-Language header (no path prefix rewriting)
function detectLocale(request: NextRequest): string {
  // 1. Check NEXT_LOCALE cookie (set by language switcher)
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const preferred = acceptLang
      .split(",")
      .map((part) => part.trim().split(";")[0].trim().split("-")[0].toLowerCase());
    for (const lang of preferred) {
      if ((locales as readonly string[]).includes(lang)) return lang;
    }
  }

  return defaultLocale;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: pass through without any locale handling
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Detect locale and build response with locale header
  const locale = detectLocale(request);

  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );

  if (isProtected || isAuthPath) {
    let response = NextResponse.next({
      request: {
        headers: new Headers({ ...Object.fromEntries(request.headers), "X-NEXT-INTL-LOCALE": locale }),
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: new Headers({ ...Object.fromEntries(request.headers), "X-NEXT-INTL-LOCALE": locale }),
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("next", pathnameWithoutLocale);
      return NextResponse.redirect(url);
    }

    if (isAuthPath && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    response.headers.set("X-NEXT-INTL-LOCALE", locale);
    return response;
  }

  // All other routes: just set locale header, no path rewriting
  const response = NextResponse.next({
    request: {
      headers: new Headers({ ...Object.fromEntries(request.headers), "X-NEXT-INTL-LOCALE": locale }),
    },
  });
  response.headers.set("X-NEXT-INTL-LOCALE", locale);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
