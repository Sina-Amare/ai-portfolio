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
 * first hit of each window.
 */
import { createHash } from "node:crypto";
import { redis } from "./store";

/** Never key Redis on a raw IP — hash it, we only need equality. */
export function ipKey(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function bump(key: string, ttlSeconds: number): Promise<number> {
  const r = redis();
  if (!r) return 0;
  const n = await r.incr(key);
  // Only the request that created the key pays for the EXPIRE.
  if (n === 1) await r.expire(key, ttlSeconds);
  return n;
}

/** Per-IP beacon budget. Generous for humans, useless for a flood. */
const BEACON_PER_MINUTE = Number(process.env.ANALYTICS_RPM ?? "20");
/**
 * Hard ceiling on beacons accepted per UTC day. At ~11 commands per recorded
 * view this keeps the month comfortably inside Upstash's 500k free commands
 * even if someone hammers the endpoint every single day.
 */
const BEACON_PER_DAY = Number(process.env.ANALYTICS_DAILY_MAX ?? "1200");

export type Gate = { ok: boolean; reason?: "ip" | "budget" };

export async function beaconAllowed(ip: string, day: string): Promise<Gate> {
  const minute = Math.floor(Date.now() / 60_000);
  const perIp = await bump(`an:rl:${ipKey(ip)}:${minute}`, 120);
  if (perIp > BEACON_PER_MINUTE) return { ok: false, reason: "ip" };

  const perDay = await bump(`an:cap:${day}`, 172_800);
  if (perDay > BEACON_PER_DAY) return { ok: false, reason: "budget" };

  return { ok: true };
}

/**
 * Admin login throttle. Two counters: per-IP (stops one attacker) and global
 * (stops the same attack spread across many IPs, which the per-IP counter would
 * happily wave through).
 */
const LOGIN_PER_IP_PER_HOUR = Number(process.env.ADMIN_LOGIN_MAX ?? "10");
const LOGIN_GLOBAL_PER_HOUR = Number(process.env.ADMIN_LOGIN_GLOBAL_MAX ?? "60");

export async function loginAllowed(ip: string): Promise<boolean> {
  const r = redis();
  // Fail OPEN when Redis isn't configured — otherwise a missing integration
  // would lock the owner out of their own dashboard. The in-memory limiter in
  // the route still applies in that case.
  if (!r) return true;
  const hour = Math.floor(Date.now() / 3_600_000);
  const perIp = await bump(`an:login:${ipKey(ip)}:${hour}`, 3_700);
  if (perIp > LOGIN_PER_IP_PER_HOUR) return false;
  const global = await bump(`an:login:all:${hour}`, 3_700);
  return global <= LOGIN_GLOBAL_PER_HOUR;
}
