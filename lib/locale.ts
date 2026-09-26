/**
 * Locale plumbing shared by the proxy, server components and the client.
 * Dependency-free on purpose: proxy.ts imports it.
 *
 * URL scheme: English is unprefixed (/projects), Persian lives under /fa
 * (/fa/projects). Internally the proxy rewrites English to /en/..., so every
 * route sits under app/[lang]/.
 */
export type Locale = "en" | "fa";

export const LOCALES: readonly Locale[] = ["en", "fa"];

/** Set only by the language toggle — an explicit choice, never a guess. */
export const LOCALE_COOKIE = "locale";

export const dirOf = (l: Locale): "rtl" | "ltr" => (l === "fa" ? "rtl" : "ltr");

export const hasLocale = (s: string): s is Locale => (LOCALES as readonly string[]).includes(s);

/** For route params the proxy already constrained; anything else reads as English. */
export const toLocale = (s: string): Locale => (hasLocale(s) ? s : "en");

/**
 * Public URL of a bare site path in `locale`. Accepts a query or hash:
 * ("/", fa) → "/fa", ("/#about", fa) → "/fa#about", ("/admin?range=7", fa) → "/fa/admin?range=7".
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === "en") return path;
  return path === "/" || path[1] === "#" || path[1] === "?" ? `/fa${path.slice(1)}` : `/fa${path}`;
}

/** Inverse of localizedPath for a pathname: "/fa/projects" and "/en/projects" → "/projects". */
export function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|fa)(?=\/|$)/, "") || "/";
}

/**
 * Best supported language in an Accept-Language header, honouring q-values
 * ("fa-IR,fa;q=0.9,en;q=0.8" → "fa"). Ties keep header order; no match → "en".
 */
export function preferredLocale(header: string | null | undefined): Locale {
  let best: Locale = "en";
  let bestQ = 0;
  for (const part of (header ?? "").split(",")) {
    const [tag = "", ...params] = part.trim().split(";");
    const lang = tag.split("-")[0]!.toLowerCase();
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const weight = q ? Number(q.slice(2)) : 1;
    if (hasLocale(lang) && weight > bestQ) {
      best = lang;
      bestQ = weight;
    }
  }
  return best;
}
