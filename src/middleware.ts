import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const PROTECTED_PATHS = [
  "/dashboard",
  "/editor",
  "/settings",
  "/billing",
  "/new",
  "/projects",
  "/templates",
  "/admin",
];
const AUTH_PATHS = ["/sign-in", "/sign-up", "/forgot-password"];

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for path matching (e.g., /es/dashboard → /dashboard)
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`)
  );
  const isApiRoute = pathname.startsWith("/api/");

  // API routes: auth check only, no intl
  if (isApiRoute) {
    return NextResponse.next();
  }

  // For protected and auth paths: check session before handling locale
  if (isProtected || isAuthPath) {
    let response = NextResponse.next({ request });

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
            response = NextResponse.next({ request });
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

    // Let intl middleware handle the response after auth passes
    const intlResponse = intlMiddleware(request);
    // Forward any auth cookies set during session refresh
    response.cookies.getAll().forEach(({ name, value }) => {
      intlResponse.cookies.set(name, value);
    });
    return intlResponse;
  }

  // All other routes: intl middleware handles locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
