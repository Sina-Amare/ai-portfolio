/**
 * Visit beacon: a page view (`t: "pv"`) or an engagement flush (`t: "eng"`:
 * active time, section dwell, events). Records visits and aggregates only; see
 * lib/analytics/session.ts for the model and lib/analytics/beacon.ts for the
 * contract.
 *
 * Noise never reaches the store: nothing is written outside production, from
 * bots, or from the owner's browser (the `sa_owner` mark set at admin login, or
 * a live admin session). The endpoint is unauthenticated and every accepted
 * call costs Redis commands, so a beacon must also come from our own origin,
 * be well-formed (checked before any command is spent), pass a per-IP limit
 * (in memory first, then shared) and fit the day's command budget.
 *
 * Always answers 204: a portfolio must never show an error because a counter
 * didn't increment.
 */
import { sameOrigin } from "@/lib/http";
import { getClientIp } from "@/lib/rate-limit";
import { parseBeacon } from "@/lib/analytics/beacon";
import { browserFrom, cityFrom, deviceFrom, geoFrom, localTimeFrom } from "@/lib/analytics/collect";
import { beaconAllowed, chargeBeacon } from "@/lib/analytics/limit";
import { countable, recordBeacon } from "@/lib/analytics/session";
import { dayKey } from "@/lib/analytics/store";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";

export const runtime = "nodejs";

const noContent = () => new Response(null, { status: 204 });

const SLUGS = projects.map((p) => p.slug);
/** A real beacon is a few hundred bytes; anything bigger isn't parsed. */
const MAX_BODY = 4096;

function siteHost(req: Request): string {
  try {
    return new URL(site.url).hostname;
  } catch {
    return req.headers.get("host") ?? "localhost";
  }
}

export async function POST(req: Request) {
  if (!countable(req)) return noContent();

  const host = siteHost(req);
  if (!sameOrigin(req, host)) return noContent();

  let beacon;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) return noContent();
    beacon = parseBeacon(JSON.parse(text), SLUGS, host);
  } catch {
    return noContent();
  }
  if (!beacon) return noContent();

  const ip = getClientIp(req);
  const day = dayKey();
  if (!(await beaconAllowed(ip, day)).ok) return noContent();

  const userAgent = req.headers.get("user-agent") ?? "";
  const { country, timezone } = geoFrom(req.headers);
  try {
    const spent = await recordBeacon(
      {
        ip,
        userAgent,
        host,
        country,
        timezone,
        city: cityFrom(req.headers, country),
        ...localTimeFrom(timezone),
        device: deviceFrom(userAgent),
        browser: browserFrom(userAgent),
      },
      beacon,
    );
    await chargeBeacon(day, spent);
  } catch {
    // Swallow: a failed counter must never surface to the visitor.
  }
  return noContent();
}
