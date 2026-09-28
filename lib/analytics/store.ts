/**
 * Privacy-first visit analytics on Upstash Redis (free tier: 256 MB, 500k
 * commands/month, and — unlike Neon/Supabase/Turso — no idle pause, which
 * matters for a low-traffic portfolio that may go days without a visit).
 *
 * What is stored: aggregate counters, 90-day visit records and 30-day chat
 * transcripts (lib/analytics/session.ts). A visitor is represented by
 * sha256(monthlySalt + ip + user-agent + host) — the raw IP is never written
 * anywhere, and once a month's salt expires the hashes cannot be recomputed.
 *
 * The salt is keyed to the calendar month it governs (an:salt:<YYYY-MM>) rather
 * than being a single rolling key. That alignment matters: with a rolling TTL
 * the salt could rotate mid-month, which silently gives every returning visitor
 * a brand-new hash and double-counts them in that month's "distinct people".
 *
 * Every key carries a TTL, set once on creation, so storage is bounded without
 * paying for an EXPIRE on every write (lib/analytics/session.ts says where each
 * one is set). The one exception is `an:since`: a single date, nothing personal.
 *
 * Everything degrades to a no-op when the Upstash env vars are absent, so the
 * site builds and deploys perfectly well before the datastore is provisioned.
 */
import { Redis } from "@upstash/redis";
import { createHash, randomBytes } from "node:crypto";

/** Daily and monthly aggregates live this long. */
export const DAY_TTL = 400 * 86_400;
export const MONTH_TTL = 400 * 86_400;
/** A month's salt must outlive the month it stamps, with room for clock skew. */
const SALT_TTL = 40 * 86_400;

let client: Redis | null | undefined;

/**
 * Find the Redis REST credentials however Vercel happened to name them.
 *
 * Upstash's own integration sets UPSTASH_REDIS_REST_*; provisioning through the
 * Vercel Marketplace (the descendant of Vercel KV) sets KV_REST_API_*; and
 * Vercel's "Custom Prefix" option on the connect dialog renames them again to
 * <PREFIX>_REST_API_*. Hard-coding one scheme means a perfectly good database
 * shows up as "not connected" with nothing in the logs to explain it, so fall
 * back to discovering any matching url/token pair.
 */
function credentialsFromEnv(): { url: string; token: string } | null {
  const known: [string | undefined, string | undefined][] = [
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ];
  for (const [url, token] of known) if (url && token) return { url, token };

  const SUFFIX = /(REST_API_URL|REST_URL)$/;
  for (const [key, value] of Object.entries(process.env)) {
    if (!value || !SUFFIX.test(key) || !/^https?:\/\//.test(value)) continue;
    const prefix = key.replace(SUFFIX, "");
    const token = process.env[`${prefix}REST_API_TOKEN`] ?? process.env[`${prefix}REST_TOKEN`];
    if (token) return { url: value, token };
  }
  return null;
}

/** Null when unconfigured — every caller treats that as "analytics disabled". */
export function redis(): Redis | null {
  if (client !== undefined) return client;
  const creds = credentialsFromEnv();
  client = creds ? new Redis(creds) : null;
  return client;
}

export function analyticsEnabled(): boolean {
  return redis() !== null;
}

/**
 * Whether visits are WRITTEN. Production only: `vercel env pull` or `vercel
 * install upstash` puts the production credentials in .env.local, and the
 * owner's own `npm run dev` browsing would land in the real numbers.
 * ANALYTICS_IN_DEV=1 opts back in to test the pipeline locally. Reading (the
 * dashboard) is unaffected.
 */
export function collecting(): boolean {
  return (
    analyticsEnabled() &&
    (process.env.NODE_ENV === "production" || process.env.ANALYTICS_IN_DEV === "1")
  );
}

/** UTC stamps so buckets don't shift with the server's locale. */
export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
export function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

export const K = {
  salt: (m: string) => `an:salt:${m}`,
  // v2, visits (lib/analytics/session.ts). A visit id starts with the day it
  // began, so its day and month keys are known without a read.
  sessionOf: (vid: string) => `an:s:${vid}`,
  sess: (sid: string) => `an:sess:${sid}`,
  day: (d: string) => `an:d:${d}`,
  month: (m: string) => `an:m:${m}`,
  /** Distinct visitors this month (v1 added them per page view, v2 per visit). */
  seen: (m: string) => `an:seen:${m}`,
  /** Visitors with 2+ visits this month. */
  ret: (m: string) => `an:ret:${m}`,
  recent: "an:recent",
  since: "an:since",
  /** The day's chat turns (question, reply, visit), newest first; 30 days. */
  chat: (d: string) => `an:chat:${d}`,
  // v1's per-pageview counter: no longer written, still read for days before v2.
  // (v1's other keys expire on their own within 400 days.)
  views: (d: string) => `an:v:${d}`,
} as const;

/**
 * The month's salt, cached in instance memory. It is immutable for the whole
 * month, so a warm lambda reads it from Redis once instead of once per view —
 * which is the single cheapest command saving available here.
 */
let saltCache: { month: string; value: string } | null = null;

export async function currentSalt(r: Redis, month: string): Promise<string> {
  if (saltCache?.month === month) return saltCache.value;
  const key = K.salt(month);
  let value = await r.get<string>(key);
  if (!value) {
    // NX so two cold starts racing on the 1st can't clobber each other.
    await r.set(key, randomBytes(32).toString("hex"), { nx: true, ex: SALT_TTL });
    value = (await r.get<string>(key)) ?? randomBytes(32).toString("hex");
  }
  saltCache = { month, value };
  return value;
}

/** Pseudonymous per-visitor id. Not reversible once the month's salt expires. */
export function visitorHash(salt: string, ip: string, userAgent: string, host: string): string {
  return createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}|${host}`)
    .digest("hex")
    .slice(0, 32);
}

export type Breakdown = { label: string; count: number }[];

/** Merge one-or-more monthly hashes into a sorted top-N breakdown. */
export function toBreakdown(hashes: (Record<string, unknown> | null)[], limit = 12): Breakdown {
  const totals = new Map<string, number>();
  for (const h of hashes) {
    if (!h) continue;
    for (const [label, count] of Object.entries(h)) {
      totals.set(label, (totals.get(label) ?? 0) + (Number(count) || 0));
    }
  }
  return [...totals]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Distinct YYYY-MM buckets a day list touches, so ranges can span months. */
export function monthsFor(days: string[]): string[] {
  return [...new Set(days.map((d) => d.slice(0, 7)))];
}

const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Calendar order, so the weekday chart reads Mon→Sun rather than by volume. */
export function orderWeekdays(rows: Breakdown): Breakdown {
  return [...rows].sort((a, b) => WEEK.indexOf(a.label) - WEEK.indexOf(b.label));
}
