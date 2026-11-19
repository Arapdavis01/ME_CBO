import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge guard. Checks only for the presence of the access cookie
 * (HttpOnly, set by NestJS). Full validation happens on the API
 * and in server components via /auth/me.
 */
const ACCESS_COOKIE = "me_access";
const REFRESH_COOKIE = "me_refresh";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/events",
  "/impact",
  "/members",
  "/inventory",
  "/incidents",
  "/swap-shop",
  "/learning",
  "/finance",
  "/admin",
  "/profile",
];

const AUTH_PAGES = ["/login", "/register", "/mfa", "/forgot-password", "/reset-password"];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession =
    req.cookies.has(ACCESS_COOKIE) || req.cookies.has(REFRESH_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|images|.*\\..*).*)"],
};
