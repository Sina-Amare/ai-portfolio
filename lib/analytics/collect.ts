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

/**
 * City, as "Amsterdam, NL". Kept as one label rather than a separate region
 * dimension so the breakdown stays readable and costs one hash instead of two.
 * The value comes from Vercel's header (RFC3986-encoded), never the client, so
 * its cardinality is bounded by real geography and can't be driven up.
 */
export function cityFrom(headers: Headers, country: string): string {
  const raw = headers.get("x-vercel-ip-city")?.trim();
  if (!raw) return "Unknown";
  let city: string;
  try {
    city = decodeURIComponent(raw);
  } catch {
    city = raw;
  }
  city = city.replace(/[^\p{L}\p{N}\s'.-]/gu, "").trim().slice(0, 64);
  if (!city) return "Unknown";
  return country === "Unknown" ? city : `${city}, ${country}`;
}

/**
 * The hour and weekday *as the visitor experienced them*, derived from their
 * IANA timezone. "People read this at 9am their time" is a far more useful fact
 * than the UTC hour, and it needs no data from the device — the timezone
 * already came from Vercel's header.
 */
export function localTimeFrom(timezone: string, now = new Date()): {
  hour: string;
  weekday: string;
} {
  const tz = timezone !== "Unknown" ? timezone : "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
      weekday: "short",
    }).formatToParts(now);
    const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Unknown";
    // "24" appears in some ICU builds for midnight; normalise it.
    return { hour: `${hour === "24" ? "00" : hour}:00`, weekday };
  } catch {
    return { hour: "Unknown", weekday: "Unknown" };
  }
}

/** Coarse device class. Deliberately crude — enough to answer "mobile or not". */
export function deviceFrom(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return "Tablet";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/.test(ua)) return "Mobile";
  return "Desktop";
}

/** Browser family. Order matters: Chrome/Edge UAs also contain "Safari". */
export function browserFrom(userAgent: string): string {
  const ua = userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

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
