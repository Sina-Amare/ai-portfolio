/**
 * Shared, Redis-backed limiting for the analytics endpoints.
 *
 * The in-memory limiter in lib/rate-limit.ts is fine for the chat route (it only
 * has to blunt casual abuse) but it is per-serverless-instance: concurrent
 * requests fan out across lambdas that each start with an empty Map, and a cold
 * start wipes it. That is not good enough here for two reasons — an
 * unauthenticated beacon that costs Redis commands can drain a whole month's
 * free quota, and the admin login is the only thing standing in front of the
 * dashboard. Both need a counter that is actually shared.
 *
 * Cost is deliberately tiny: one INCR per check, plus an EXPIRE only on the
 * first hit of each window (and the month's salt, read once per warm instance).
 */
import { createHash } from "node:crypto";
import { windowLimiter } from "@/lib/rate-limit";
import { currentSalt, monthKey, redis } from "./store";

/**
 * Never key Redis on a raw IP, nor on a bare hash of one (every IPv4 address
 * hashes in seconds): salt it with the month's visitor salt, which the beacon
 * reads anyway. Null when Redis can't give the salt; the caller then skips the
 * shared counter, as bump() would fail open.
 */
async function ipKey(ip: string): Promise<string | null> {
  const r = redis();
  if (!r) return null;
  try {
    const salt = await currentSalt(r, monthKey());
    return createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

/**
 * Fails OPEN (returns 0) when Redis errors — an outage or a spent free quota
 * must not turn the login into a 500 the form reads as "wrong password", nor
 * break the beacon's always-204 contract. The login's in-memory limiter still
 * applies meanwhile.
 */
async function bump(key: string, ttlSeconds: number): Promise<number> {
  const r = redis();
  if (!r) return 0;
  try {
    const n = await r.incr(key);
    // Only the request that created the key pays for the EXPIRE.
    if (n === 1) await r.expire(key, ttlSeconds);
    return n;
  } catch {
    return 0;
  }
}

/**
 * Per-IP beacons per minute. A page view sends one beacon and its engagement
 * flushes (route change, tab hidden, every minute while active) about one more,
 * so 30 still covers someone clicking through a page every few seconds.
 */
const BEACON_PER_MINUTE = Number(process.env.ANALYTICS_RPM ?? "30");
/**
 * First line, in instance memory: a single-source flood on a warm instance is
 * turned away before it costs a single Redis command.
 */
const localBeaconLimit = windowLimiter(60_000, BEACON_PER_MINUTE);

/**
 * Redis commands beacons may spend per UTC day, charged with what each beacon
 * ACTUALLY spent (chargeBeacon), because a beacon's cost varies ~5x: a page
 * view inside a running visit is 5-8 commands, the first beacon of a visit ~27
 * (31 for a returning one), an engagement flush 10-30 depending on sections and
 * events (tests/unit/analytics-store.test.ts pins these).
 *
 * The math: Upstash free is 500k/month ≈ 16.6k/day. Leave ~4.6k/day (~140k a
 * month) for the dashboard (~90-250 per load), chat recording (≤300 records
 * × ~5), the chat cap and login, and beacons get 12k/day ≈ 360k/month. A real
 * 3-page visit spends ~110 over ~8 beacons, so that is ~100 visits a day; a
 * script inventing a new "visitor" per beacon gets ~400 beacons, then nothing.
 */
const BEACON_COMMANDS_PER_DAY = Number(process.env.ANALYTICS_DAILY_COMMANDS ?? "12000");

/**
 * The day's spend as this instance last saw it. Once it is over budget, the
 * rest of the day costs this instance nothing; a cold instance learns the
 * total from its first charge, so the overshoot is about a beacon per instance.
 */
let spent = { day: "", total: 0 };

export type Gate = { ok: boolean; reason?: "ip" | "budget" };

export async function beaconAllowed(ip: string, day: string): Promise<Gate> {
  if (!localBeaconLimit(ip).ok) return { ok: false, reason: "ip" };
  if (spent.day === day && spent.total >= BEACON_COMMANDS_PER_DAY) {
    return { ok: false, reason: "budget" };
  }
  const minute = Math.floor(Date.now() / 60_000);
  const key = await ipKey(ip);
  const perIp = key ? await bump(`an:rl:${key}:${minute}`, 120) : 0;
  if (perIp > BEACON_PER_MINUTE) return { ok: false, reason: "ip" };
  return { ok: true };
}

/** Add what an accepted beacon spent (plus the gate's INCR and this INCRBY) to the day. */
export async function chargeBeacon(day: string, commands: number): Promise<void> {
  const r = redis();
  if (!r) return;
  const cost = commands + 2;
  try {
    const key = `an:cap:${day}`;
    const total = await r.incrby(key, cost);
    if (total === cost) await r.expire(key, 172_800);
    spent = { day, total };
  } catch {
    // Fail open, like bump(): the local limiter still applies.
  }
}

/**
 * Admin login throttle. Two counters: per-IP (stops one attacker) and global
 * (bounds the same attack spread across many IPs, which the per-IP counter would
 * happily wave through).
 *
 * The global cap is deliberately high. At 60 it took just 6 IPs × 10 attempts
 * to lock the owner out for the rest of the hour, while against a long random
 * password it adds almost nothing — the password's entropy is the real defence.
 */
const LOGIN_PER_IP_PER_HOUR = Number(process.env.ADMIN_LOGIN_MAX ?? "10");
const LOGIN_GLOBAL_PER_HOUR = Number(process.env.ADMIN_LOGIN_GLOBAL_MAX ?? "500");

export async function loginAllowed(ip: string): Promise<boolean> {
  const r = redis();
  // Fail OPEN when Redis isn't configured — otherwise a missing integration
  // would lock the owner out of their own dashboard. The in-memory limiter in
  // the route still applies in that case.
  if (!r) return true;
  const hour = Math.floor(Date.now() / 3_600_000);
  const key = await ipKey(ip);
  const perIp = key ? await bump(`an:login:${key}:${hour}`, 3_700) : 0;
  if (perIp > LOGIN_PER_IP_PER_HOUR) return false;
  const global = await bump(`an:login:all:${hour}`, 3_700);
  return global <= LOGIN_GLOBAL_PER_HOUR;
}
