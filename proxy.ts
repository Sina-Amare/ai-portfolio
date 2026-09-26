import { NextResponse, type NextRequest } from "next/server";
import { isbot } from "isbot";
import { LOCALE_COOKIE, localizedPath, preferredLocale } from "@/lib/locale";

/**
 * Locale routing. Public URLs: English unprefixed (/projects), Persian under
 * /fa (/fa/projects). Every route lives in app/[lang]/, so English requests are
 * REWRITTEN to /en/... (the address bar never shows it), /fa passes through,
 * and a typed /en/... URL is 308'd to its canonical unprefixed form.
 *
 * Persian visitors are redirected only on ENTRY (see wantsPersian), so inside
 * the site the URL is always the truth and back/forward never bounce.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/fa" || pathname.startsWith("/fa/")) return NextResponse.next();

  if (wantsPersian(req)) {
    url.pathname = localizedPath(pathname, "fa");
    return NextResponse.redirect(url, 307);
  }
  url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  return NextResponse.rewrite(url);
}

function wantsPersian(req: NextRequest): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  // In-site navigation (links, RSC fetches, back/forward): never second-guess the URL.
  if (req.headers.get("sec-fetch-site") === "same-origin") return false;
  // Crawlers must see each URL's own language, or /projects would never be indexed.
  if (isbot(req.headers.get("user-agent") ?? "")) return false;
  // An explicit choice from the toggle beats the browser's language.
  const choice = req.cookies.get(LOCALE_COOKIE)?.value;
  if (choice) return choice === "fa";
  return preferredLocale(req.headers.get("accept-language")) === "fa";
}

export const config = {
  // Pages only: no API, Next internals, dev overlay, the root icon, or files (anything with a dot).
  matcher: ["/((?!api|_next|__next|_vercel|icon|.*\\..*).*)"],
};
