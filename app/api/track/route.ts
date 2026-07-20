/**
 * Visit beacon. Fired once per page view from the browser; records aggregate
 * counters only (see lib/analytics/store.ts for the privacy model).
 *
 * This endpoint is unauthenticated and every accepted call costs Redis
 * commands, so it is gated three ways before it can touch the datastore: the
 * request must come from our own origin, the caller must be under a SHARED
 * per-IP rate limit, and the whole site must be under a global daily budget.
 * The shared counters matter — the in-memory limiter used elsewhere is
 * per-lambda, so concurrent requests would each get their own fresh budget.
 *
 * Always answers 204: a portfolio must never show an error because a counter
 * didn't increment.
 */
import { getClientIp } from "@/lib/rate-limit";
import {
  browserFrom,
  cityFrom,
  deviceFrom,
  geoFrom,
  isBotRequest,
  localTimeFrom,
  normalizePath,
  normalizeReferrer,
} from "@/lib/analytics/collect";
import { analyticsEnabled, dayKey, recordVisit } from "@/lib/analytics/store";
import { beaconAllowed } from "@/lib/analytics/limit";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const noContent = () => new Response(null, { status: 204 });

const SLUGS = projects.map((p) => p.slug);

function siteHost(req: Request): string {
  try {
    return new URL(site.url).hostname;
  } catch {
    return req.headers.get("host") ?? "localhost";
  }
}

/** Cheap first filter: a real beacon is same-origin fetch, so Origin is set. */
function sameOrigin(req: Request, host: string): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const o = new URL(origin).hostname.toLowerCase().replace(/^www\./, "");
    const h = host.toLowerCase().replace(/^www\./, "");
    return o === h || o === "localhost" || o === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!analyticsEnabled()) return noContent();

  const userAgent = req.headers.get("user-agent") ?? "";
  if (isBotRequest(userAgent)) return noContent();

  const host = siteHost(req);
  if (!sameOrigin(req, host)) return noContent();

  const ip = getClientIp(req);
  const gate = await beaconAllowed(ip, dayKey());
  if (!gate.ok) return noContent();

  let body: { path?: unknown; referrer?: unknown };
  try {
    body = await req.json();
  } catch {
    return noContent();
  }

  const { country, timezone } = geoFrom(req.headers);
  const { hour, weekday } = localTimeFrom(timezone);

  try {
    await recordVisit({
      ip,
      userAgent,
      host,
      path: normalizePath(typeof body.path === "string" ? body.path : "/", SLUGS),
      referrer: normalizeReferrer(
        typeof body.referrer === "string" ? body.referrer : "",
        host,
      ),
      country,
      timezone,
      city: cityFrom(req.headers, country),
      hour,
      weekday,
      device: deviceFrom(userAgent),
      browser: browserFrom(userAgent),
    });
  } catch {
    // Swallow: a failed counter must never surface to the visitor.
  }
  return noContent();
}
