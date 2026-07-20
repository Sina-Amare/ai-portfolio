/**
 * Turning a raw beacon request into a clean, aggregate-safe visit record.
 *
 * Data quality — not plumbing — is what makes analytics worth reading. Plausible
 * blocks ~2 billion bot visits a month and reports raw server logs carrying ~18x
 * the real pageview count, so an unfiltered counter mostly measures crawlers.
 * Two things protect us here: the beacon only fires from a real browser running
 * JS, and every request still passes the isbot user-agent check below.
 */
import { isbot } from "isbot";

/** Vercel geo headers — available on Hobby with no plan gate. */
export function geoFrom(headers: Headers): { country: string; timezone: string } {
  const country = headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  // NOTE: timezone is read server-side from Vercel's header rather than from
  // Intl.DateTimeFormat() in the browser. The client value is more precise, but
  // EDPB Guidelines 2/2023 §53 treat reading a local value and transmitting it
  // as "gaining access to information stored in terminal equipment" — cookies or
  // not — and a device-stable timezone would also sharpen the visitor hash into
  // something closer to a fingerprint. The header never touches the device.
  const timezone = headers.get("x-vercel-ip-timezone")?.trim();
  return {
    country: country && /^[A-Z]{2}$/.test(country) ? country : "Unknown",
    timezone: timezone && timezone.includes("/") ? timezone : "Unknown",
  };
}

/** Bots never reach the store. */
export function isBotRequest(userAgent: string): boolean {
  if (!userAgent) return true; // no UA at all is not a real browser
  return isbot(userAgent);
}

const MAX_LABEL = 128;
/** Anything not a known route collapses here, so cardinality can't be driven up. */
export const OTHER = "Other";

/**
 * Paths are validated against the site's ACTUAL routes and anything else is
 * folded into a single bucket.
 *
 * This is a storage-integrity control, not tidiness: `path` arrives in the
 * request body of an unauthenticated endpoint and becomes a Redis hash field.
 * Without an allow-list, a script posting a million distinct paths would grow
 * the hash without bound until it filled the 256 MB store.
 */
export function normalizePath(raw: string, knownSlugs: readonly string[] = []): string {
  if (!raw) return "/";
  let p = raw.split("?")[0]!.split("#")[0]!;
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  p = p.slice(0, MAX_LABEL) || "/";

  if (p === "/" || p === "/projects") return p;
  const m = /^\/projects\/([^/]+)$/.exec(p);
  if (m && knownSlugs.includes(m[1]!)) return p;
  return OTHER;
}

/**
 * Referrers collapse to a bare hostname — "google.com", not the full URL with
 * its tracking parameters, which would be both unbounded cardinality and a
 * privacy leak (search queries routinely ride along in referrer URLs).
 */
export function normalizeReferrer(raw: string, selfHost: string): string {
  if (!raw) return "Direct";
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return "Direct";
  }
  if (!host) return "Direct";
  host = host.replace(/^www\./, "");
  if (host === selfHost.toLowerCase().replace(/^www\./, "")) return "Direct";
  // Referrer hosts are genuinely open-ended (anyone may link to you), so they
  // can't be allow-listed like paths. Bound them instead: a hostname is at most
  // 253 chars per DNS, and anything longer or malformed is not a real referrer.
  if (host.length > 253 || !/^[a-z0-9.-]+$/.test(host)) return OTHER;
  return host.slice(0, MAX_LABEL);
}
