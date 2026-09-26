/**
 * Lightweight in-memory rate limiting + a global daily cap to protect free-tier quota.
 * Per-IP state is module-scope (per warm instance) — enough to blunt casual abuse. The
 * daily cap is the one number that must hold across instances, so it lives in Redis
 * when configured.
 */
import { createHash } from "node:crypto";
import { dayKey, redis } from "@/lib/analytics/store";

const WINDOW_MS = 60_000;
const PER_MINUTE = Number(process.env.RAG_RPM ?? "12");
const DAILY_MAX = Number(process.env.RAG_DAILY_MAX ?? "1000");

type Bucket = { count: number; reset: number };
const ipBuckets = new Map<string, Bucket>();

/**
 * Bucket keys are a hash of the IP, never the IP itself. The limiter only needs
 * equality, and keeping raw addresses in a long-lived process map would quietly
 * contradict the "raw IPs are never stored" property the analytics relies on.
 */
function bucketKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Drop expired buckets. Without this the maps grow for the life of the lambda,
 * which is both a slow leak and a needlessly large set of retained identifiers.
 */
function sweep(map: Map<string, Bucket>, now: number): void {
  if (map.size < 512) return; // cheap: only bother once it's actually growing
  for (const [k, b] of map) if (now > b.reset) map.delete(k);
}

let dayCount = 0;
let dayReset = 0;

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export function rateLimit(ip: string, now = Date.now()): { ok: boolean; retryAfter: number } {
  const key = bucketKey(ip);
  sweep(ipBuckets, now);
  const b = ipBuckets.get(key);
  if (!b || now > b.reset) {
    ipBuckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= PER_MINUTE) {
    return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/** Separate, stricter limiter for the contact form (default 5 per 10 minutes). */
const CONTACT_WINDOW_MS = 600_000;
const CONTACT_MAX = Number(process.env.CONTACT_MAX_PER_WINDOW ?? "5");
const contactBuckets = new Map<string, Bucket>();

export function contactRateLimit(
  ip: string,
  now = Date.now(),
): { ok: boolean; retryAfter: number } {
  const key = bucketKey(ip);
  sweep(contactBuckets, now);
  const b = contactBuckets.get(key);
  if (!b || now > b.reset) {
    contactBuckets.set(key, { count: 1, reset: now + CONTACT_WINDOW_MS });
    return { ok: true, retryAfter: 0 };
  }
  if (b.count >= CONTACT_MAX) {
    return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  }
  b.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * Global daily cap on LLM-bound chat requests. Shared through Redis when configured
 * (one INCR, plus an EXPIRE on the day's first request); falls back to this instance's
 * own counter without Redis, or when Redis errors.
 */
export async function globalDailyOk(now = Date.now()): Promise<boolean> {
  const r = redis();
  if (r) {
    try {
      const key = `chat:day:${dayKey(new Date(now))}`;
      const n = await r.incr(key);
      if (n === 1) await r.expire(key, 90_000);
      return n <= DAILY_MAX;
    } catch {
      // Fall through to the in-memory counter.
    }
  }
  if (now > dayReset) {
    dayCount = 0;
    dayReset = now + 86_400_000;
  }
  if (dayCount >= DAILY_MAX) return false;
  dayCount += 1;
  return true;
}
