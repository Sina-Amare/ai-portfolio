/**
 * Lightweight in-memory rate limiting + a global daily cap to protect free-tier quota.
 * Module-scope state persists across warm invocations. For multi-instance scale, swap in
 * Upstash Ratelimit (env-gated) later — fine for a portfolio at this volume.
 */
const WINDOW_MS = 60_000;
const PER_MINUTE = Number(process.env.RAG_RPM ?? "12");
const DAILY_MAX = Number(process.env.RAG_DAILY_MAX ?? "1000");

type Bucket = { count: number; reset: number };
const ipBuckets = new Map<string, Bucket>();

let dayCount = 0;
let dayReset = 0;

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export function rateLimit(
  ip: string,
  now = Date.now(),
): { ok: boolean; retryAfter: number } {
  const b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    ipBuckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= PER_MINUTE) {
    return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Global daily counter; once exhausted we degrade to the canned refusal. */
export function globalDailyOk(now = Date.now()): boolean {
  if (now > dayReset) {
    dayCount = 0;
    dayReset = now + 86_400_000;
  }
  if (dayCount >= DAILY_MAX) return false;
  dayCount += 1;
  return true;
}
