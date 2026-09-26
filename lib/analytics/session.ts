/**
 * Visits and what happened in them: the write side of analytics v2.
 *
 * A visit (session) is every beacon from one visitor hash with less than 30
 * minutes of inactivity between them, GA4's definition. The pointer
 * `an:s:<vid>` → visit id is refreshed by every beacon (sliding EX 1800), so a
 * reload, the back button or a tab switch inside half an hour continues the
 * same visit, and coming back after lunch starts a new one. The pointer lives
 * in Redis, never on the visitor's device.
 *
 * TTLs are set when a key is created, never on every write:
 *  - `an:s:<vid>` 30 min (sliding) and `an:sess:<sid>` 90 days, as the visit starts;
 *  - `an:d:<day>`, `an:m:<month>`, `an:seen:<month>` and `an:recent` on the day's
 *    first visit, which is the only moment each can be created
 *    (a month's first visit is also its day's first);
 *  - `an:ret:<month>` with every add, because it is created later than the rest.
 */
import { randomBytes } from "node:crypto";
import type { Redis } from "@upstash/redis";
import { isOwner } from "./auth";
import { KEY_EVENTS, type Beacon, type EngageBeacon } from "./beacon";
import { isBotRequest } from "./collect";
import {
  collecting,
  currentSalt,
  DAY_TTL,
  dayKey,
  K,
  MONTH_TTL,
  monthKey,
  redis,
  visitorHash,
} from "./store";

const IDLE_S = 1800;
const SESSION_TTL = 90 * 86_400;
const RECENT_MAX = 500;
/** A second page view of the same path this soon is a reload or a double fire. */
const RELOAD_MS = 15_000;
const SEQ_MAX = 20;
/** GA4's engaged-visit bar: this much active time, 2+ pages, or a key event. */
const ENGAGED_MS = 10_000;

/** Lower edges of active-time buckets b1..b5 (b0 is under 10 s). */
const BUCKET_EDGES = [10_000, 30_000, 60_000, 180_000, 600_000];
export const BUCKET_LABELS = ["<10s", "10–30s", "30s–1m", "1–3m", "3–10m", "10m+"];
const bucketOf = (ms: number) => BUCKET_EDGES.filter((edge) => ms >= edge).length;

/** Who sent the beacon, all derived server-side from the request (collect.ts). */
export type Visitor = {
  ip: string;
  userAgent: string;
  host: string;
  country: string;
  timezone: string;
  city: string;
  hour: string;
  weekday: string;
  device: string;
  browser: string;
};

/** Counts the commands a beacon spends, so the daily budget charges what was real. */
type Tx = { r: Redis; n: number };
type Pipe = ReturnType<Redis["pipeline"]>;

async function run(tx: Tx, p: Pipe): Promise<unknown[]> {
  if (p.length() === 0) return [];
  const res = (await p.exec()) as unknown[];
  tx.n += res.length;
  return res;
}

/** A visit id is `<YYYY-MM-DD>_<random>`: its day and month keys need no read. */
const dayOf = (sid: string) => sid.slice(0, 10);
const monthOf = (sid: string) => sid.slice(0, 7);
const langOf = (path: string) => (path === "/fa" || path.startsWith("/fa/") ? "fa" : "en");
const num = (x: unknown) => Number(x) || 0;

/** Record one beacon. Returns the Redis commands it spent. */
export async function recordBeacon(v: Visitor, b: Beacon, now = Date.now()): Promise<number> {
  const r = redis();
  if (!r) return 0;
  const tx: Tx = { r, n: 0 };
  const salt = await currentSalt(r, monthKey(new Date(now)));
  const vid = visitorHash(salt, v.ip, v.userAgent, v.host);

  const ptr = K.sessionOf(vid);
  const current = await r.getex<string>(ptr, { ex: IDLE_S });
  tx.n += 1;
  if (current) {
    const sid = String(current);
    if (b.t === "pv") await pageview(tx, sid, b.path, now);
    else await engage(tx, sid, b, now);
    return tx.n;
  }

  const sid = `${dayKey(new Date(now))}_${randomBytes(6).toString("hex")}`;
  await r.set(ptr, sid, { ex: IDLE_S });
  tx.n += 1;
  // Activity after 30 idle minutes is a new visit even when it's an engagement
  // flush, with that page as its entry (again GA4's rule).
  await startVisit(tx, sid, vid, v, b.path, b.t === "pv" ? b.referrer : "Direct", now);
  if (b.t === "eng") await engage(tx, sid, b, now);
  return tx.n;
}

/**
 * A new visit: its record, the day's counters and the acquisition breakdowns
 * (counted once per VISIT, so a 6-page visit from Google is one Google
 * arrival), plus its first page view.
 */
async function startVisit(
  tx: Tx,
  sid: string,
  vid: string,
  v: Visitor,
  path: string,
  ref: string,
  now: number,
) {
  const day = K.day(dayOf(sid));
  const m = K.month(monthOf(sid));
  const month = monthOf(sid);
  const lang = langOf(path);
  const p = tx.r.pipeline();
  p.sadd(K.seen(month), vid); // [0] 0 = seen earlier this month
  p.hincrby(day, "visits", 1); // [1] 1 = the day's first visit
  p.hset(K.sess(sid), {
    start: now,
    last: now,
    country: v.country,
    city: v.city,
    device: v.device,
    browser: v.browser,
    lang,
    ref,
    entry: path,
    seq: path,
    lp: path,
    lt: now,
    pages: 1,
    ms: 0,
  });
  p.expire(K.sess(sid), SESSION_TTL);
  p.hincrby(day, "b0", 1);
  p.hincrby(day, "pages", 1);
  p.hincrby(m, "visits", 1);
  const dims: [string, string][] = [
    ["ref", ref],
    ["entry", path],
    ["co", v.country],
    ["city", v.city],
    ["dev", v.device],
    ["br", v.browser],
    ["hr", v.hour],
    ["wd", v.weekday],
    ["lang", lang],
    ["tz", v.timezone],
  ];
  for (const [dim, label] of dims) p.hincrby(m, `${dim}:${label}`, 1);
  p.hincrby(m, `pv:${path}`, 1);
  p.lpush(K.recent, sid);
  p.ltrim(K.recent, 0, RECENT_MAX - 1);
  const res = await run(tx, p);

  const e = tx.r.pipeline();
  // Returning visitor = 2+ visits this month (the salt is monthly, so a visitor
  // can't be recognised across months).
  if (num(res[0]) === 0) {
    e.sadd(K.ret(month), vid);
    e.expire(K.ret(month), MONTH_TTL);
    e.hset(K.sess(sid), { ret: 1 });
    e.hincrby(day, "returning", 1);
  }
  if (num(res[1]) === 1) {
    e.expire(day, DAY_TTL);
    e.expire(m, MONTH_TTL);
    e.expire(K.seen(month), MONTH_TTL);
    e.expire(K.recent, SESSION_TTL); // sliding: the index outlives its oldest visit
    e.set(K.since, dayOf(sid), { nx: true });
  }
  await run(tx, e);
}

/** A page view inside a running visit. */
async function pageview(tx: Tx, sid: string, path: string, now: number) {
  const s = await tx.r.hmget<Record<string, unknown>>(
    K.sess(sid),
    "lp",
    "lt",
    "seq",
    "pages",
    "ms",
    "eng",
  );
  tx.n += 1;
  // No record (deleted by hand): writing now would recreate it without a TTL.
  if (!s) return;
  if (String(s.lp) === path && now - num(s.lt) < RELOAD_MS) return;

  const pages = num(s.pages) + 1;
  const seq = String(s.seq ?? "")
    .split(" ")
    .filter(Boolean);
  if (seq.length < SEQ_MAX) seq.push(path);
  const p = tx.r.pipeline();
  p.hset(K.sess(sid), { lp: path, lt: now, last: now, pages, seq: seq.join(" ") });
  p.hincrby(K.day(dayOf(sid)), "pages", 1);
  p.hincrby(K.month(monthOf(sid)), `pv:${path}`, 1);
  await run(tx, p);
  if (pages >= 2 && !num(s.eng)) await markEngaged(tx, sid, num(s.ms));
}

/**
 * Marked once per visit (HSETNX) however many beacons race to say so. `ems`
 * is the active time of engaged visits: their time so far, then every flush.
 */
async function markEngaged(tx: Tx, sid: string, msSoFar: number) {
  const first = await tx.r.hsetnx(K.sess(sid), "eng", 1);
  tx.n += 1;
  if (first !== 1) return;
  const p = tx.r.pipeline();
  p.hincrby(K.day(dayOf(sid)), "engaged", 1);
  if (msSoFar) p.hincrby(K.day(dayOf(sid)), "ems", msSoFar);
  await run(tx, p);
}

/**
 * Active time, section dwell and events from the tracker. A visit's active time
 * sits in exactly one bucket of its day; when a flush carries it over an edge
 * it moves (HINCRBY returns the new total, so old = new - delta).
 *
 * ponytail: a page view that engages the visit in the same instant as a flush
 * can drop that one flush from `ems`; exact would need a Lua script.
 */
async function engage(tx: Tx, sid: string, b: EngageBeacon, now: number) {
  const sess = K.sess(sid);
  const day = K.day(dayOf(sid));
  const m = K.month(monthOf(sid));
  const sections = Object.entries(b.sections);
  const events = Object.entries(b.events);
  const nameOf = (key: string) => key.split(":")[0]!;

  const p = tx.r.pipeline();
  p.hincrby(sess, "ms", b.ms); // [0] the visit's new total
  p.hget(sess, "eng"); // [1]
  // [2..]: section dwell for this visit. Every increment is at least 1 ms, so a
  // total equal to its increment means the section is new to the visit, which
  // gives "reached" without an extra read (costs ≤ 1 ms of dwell per flush).
  for (const [s, ms] of sections) p.hincrby(sess, `s:${s}`, Math.max(ms, 1));
  p.hset(sess, { last: now });
  if (b.ms) {
    p.hincrby(day, "ms", b.ms);
    p.hincrby(m, `pms:${b.path}`, b.ms);
  }
  for (const [s, ms] of sections) if (ms) p.hincrby(m, `sms:${s}`, ms);
  for (const [key, n] of events) {
    p.hincrby(sess, `e:${key}`, n);
    p.hincrby(m, `ev:${key}`, n);
    if (nameOf(key) === "contact_submit") p.hincrby(day, "contact", n);
  }
  const res = await run(tx, p);

  const total = num(res[0]);
  const engaged = num(res[1]) === 1;
  const q = tx.r.pipeline();
  sections.forEach(([s, ms], i) => {
    if (num(res[2 + i]) === Math.max(ms, 1)) q.hincrby(m, `sr:${s}`, 1);
  });
  const from = bucketOf(total - b.ms);
  const to = bucketOf(total);
  if (from !== to) {
    q.hincrby(day, `b${from}`, -1);
    q.hincrby(day, `b${to}`, 1);
  }
  if (engaged && b.ms) q.hincrby(day, "ems", b.ms);
  await run(tx, q);

  const keyEvent = events.some(([key]) => KEY_EVENTS.has(nameOf(key)));
  if (!engaged && (total >= ENGAGED_MS || keyEvent)) await markEngaged(tx, sid, total);
}

/** Counted at all: production (see collecting()), a real browser, not the owner. */
export function countable(req: Request): boolean {
  return (
    collecting() &&
    !isBotRequest(req.headers.get("user-agent") ?? "") &&
    !isOwner(req.headers.get("cookie"))
  );
}
