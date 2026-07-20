/**
 * Privacy-first visit analytics on Upstash Redis (free tier: 256 MB, 500k
 * commands/month, and — unlike Neon/Supabase/Turso — no idle pause, which
 * matters for a low-traffic portfolio that may go days without a visit).
 *
 * What is stored: aggregate counters only. A visitor is represented by
 * sha256(monthlySalt + ip + user-agent + host) — the raw IP is never written
 * anywhere, and once a month's salt expires the hashes cannot be recomputed.
 *
 * The salt is keyed to the calendar month it governs (an:salt:<YYYY-MM>) rather
 * than being a single rolling key. That alignment matters: with a rolling TTL
 * the salt could rotate mid-month, which silently gives every returning visitor
 * a brand-new hash and double-counts them in that month's "distinct people".
 *
 * Every key carries a TTL, set once on creation, so storage is bounded without
 * paying for an EXPIRE on every write.
 *
 * Everything degrades to a no-op when the Upstash env vars are absent, so the
 * site builds and deploys perfectly well before the datastore is provisioned.
 */
import { Redis } from "@upstash/redis";
import { createHash, randomBytes } from "node:crypto";

/** Daily aggregates live this long; monthly ones a little longer. */
const DAY_TTL = 400 * 86_400;
const MONTH_TTL = 400 * 86_400;
/** A month's salt must outlive the month it stamps, with room for clock skew. */
const SALT_TTL = 40 * 86_400;

let client: Redis | null | undefined;

/**
 * Null when unconfigured — every caller treats that as "analytics disabled".
 *
 * Accepts both naming conventions on purpose: Upstash's own integration sets
 * UPSTASH_REDIS_REST_*, while provisioning Redis through the Vercel Marketplace
 * (the descendant of Vercel KV) sets KV_REST_API_*. Reading only one of them
 * would leave analytics silently dormant depending on how the store was added,
 * with no error to explain why.
 */
export function redis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

export function analyticsEnabled(): boolean {
  return redis() !== null;
}

/** UTC stamps so buckets don't shift with the server's locale. */
export function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
export function monthKey(d = new Date()): string {
  return d.toISOString().slice(0, 7);
}

const K = {
  salt: (m: string) => `an:salt:${m}`,
  views: (d: string) => `an:v:${d}`,
  uniqDay: (d: string) => `an:u:${d}`,
  seen: (m: string) => `an:seen:${m}`,
  repeat: (m: string) => `an:rep:${m}`,
  path: (m: string) => `an:path:${m}`,
  ref: (m: string) => `an:ref:${m}`,
  country: (m: string) => `an:co:${m}`,
  tz: (m: string) => `an:tz:${m}`,
} as const;

/**
 * The month's salt, cached in instance memory. It is immutable for the whole
 * month, so a warm lambda reads it from Redis once instead of once per view —
 * which is the single cheapest command saving available here.
 */
let saltCache: { month: string; value: string } | null = null;

async function currentSalt(r: Redis, month: string): Promise<string> {
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
export function visitorHash(
  salt: string,
  ip: string,
  userAgent: string,
  host: string,
): string {
  return createHash("sha256")
    .update(`${salt}|${ip}|${userAgent}|${host}`)
    .digest("hex")
    .slice(0, 32);
}

export type VisitInput = {
  ip: string;
  userAgent: string;
  host: string;
  path: string;
  referrer: string;
  country: string;
  timezone: string;
};

/**
 * Record one page view. Typically ~8 Redis commands on a warm instance (the
 * salt is cached and TTLs are only set when a key is first created).
 */
export async function recordVisit(v: VisitInput): Promise<void> {
  const r = redis();
  if (!r) return;

  const now = new Date();
  const day = dayKey(now);
  const month = monthKey(now);
  const salt = await currentSalt(r, month);
  const vid = visitorHash(salt, v.ip, v.userAgent, v.host);

  // SADD returns 1 only when the id is new to this month's set.
  const firstThisMonth = await r.sadd(K.seen(month), vid);

  const p = r.pipeline();
  p.incr(K.views(day));
  p.sadd(K.uniqDay(day), vid);
  // A visitor who is NOT new this month has, by definition, come back.
  if (firstThisMonth !== 1) p.sadd(K.repeat(month), vid);
  p.hincrby(K.path(month), v.path, 1);
  p.hincrby(K.ref(month), v.referrer, 1);
  p.hincrby(K.country(month), v.country, 1);
  p.hincrby(K.tz(month), v.timezone, 1);
  const res = (await p.exec()) as unknown[];

  // Set TTLs only when a key was just created, so the common path pays nothing.
  // res[0] is the INCR result (1 == first view of the day); res[1] the SADD.
  const firstViewOfDay = Number(res[0]) === 1;
  if (firstViewOfDay || firstThisMonth === 1) {
    const e = r.pipeline();
    if (firstViewOfDay) {
      e.expire(K.views(day), DAY_TTL);
      e.expire(K.uniqDay(day), DAY_TTL);
    }
    if (firstThisMonth === 1) {
      e.expire(K.seen(month), MONTH_TTL);
      e.expire(K.repeat(month), MONTH_TTL);
      e.expire(K.path(month), MONTH_TTL);
      e.expire(K.ref(month), MONTH_TTL);
      e.expire(K.country(month), MONTH_TTL);
      e.expire(K.tz(month), MONTH_TTL);
    }
    await e.exec();
  }
}

export type DayPoint = { day: string; views: number; uniques: number };
export type Breakdown = { label: string; count: number }[];

export type Overview = {
  enabled: boolean;
  degraded: boolean;
  range: number;
  totals: { views: number; visitors: number; repeatVisitors: number };
  series: DayPoint[];
  paths: Breakdown;
  referrers: Breakdown;
  countries: Breakdown;
  timezones: Breakdown;
};

function toBreakdown(h: Record<string, unknown> | null, limit = 12): Breakdown {
  if (!h) return [];
  return Object.entries(h)
    .map(([label, count]) => ({ label, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function emptyOverview(days: number, enabled: boolean, degraded: boolean): Overview {
  return {
    enabled,
    degraded,
    range: days,
    totals: { views: 0, visitors: 0, repeatVisitors: 0 },
    series: [],
    paths: [],
    referrers: [],
    countries: [],
    timezones: [],
  };
}

/**
 * Last `days` days of aggregates plus this month's breakdowns.
 *
 * Never throws: an Upstash outage or an exhausted quota returns a degraded
 * overview so /admin renders a notice instead of a 500.
 */
export async function getOverview(days = 30): Promise<Overview> {
  const r = redis();
  if (!r) return emptyOverview(days, false, false);

  try {
    const today = new Date();
    const dayList: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      dayList.push(dayKey(d));
    }
    const month = monthKey(today);

    const p = r.pipeline();
    for (const d of dayList) p.get<number>(K.views(d));
    for (const d of dayList) p.scard(K.uniqDay(d));
    p.scard(K.seen(month));
    p.scard(K.repeat(month));
    p.hgetall(K.path(month));
    p.hgetall(K.ref(month));
    p.hgetall(K.country(month));
    p.hgetall(K.tz(month));
    const res = (await p.exec()) as unknown[];

    const n = dayList.length;
    const num = (x: unknown) => Number(x) || 0;
    const views = res.slice(0, n).map(num);
    const uniques = res.slice(n, n * 2).map(num);
    const at = (i: number) => res[n * 2 + i];

    return {
      enabled: true,
      degraded: false,
      range: days,
      totals: {
        views: views.reduce((a, b) => a + b, 0),
        // Deliberately NOT the sum of daily uniques — that counts a person who
        // visits on five days as five people.
        visitors: num(at(0)),
        repeatVisitors: num(at(1)),
      },
      series: dayList.map((day, i) => ({
        day,
        views: views[i] ?? 0,
        uniques: uniques[i] ?? 0,
      })),
      paths: toBreakdown(at(2) as Record<string, unknown> | null),
      referrers: toBreakdown(at(3) as Record<string, unknown> | null),
      countries: toBreakdown(at(4) as Record<string, unknown> | null),
      timezones: toBreakdown(at(5) as Record<string, unknown> | null),
    };
  } catch {
    return emptyOverview(days, true, true);
  }
}
