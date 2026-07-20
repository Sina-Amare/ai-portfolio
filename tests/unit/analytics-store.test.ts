// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * The aggregation path is where silent wrongness lives: recordVisit fans out
 * across several key types, and getOverview reads them back by *position* in a
 * pipeline. An off-by-one there wouldn't crash — it would just render confident,
 * wrong numbers on the dashboard. So exercise both against an in-memory Redis.
 */
// vi.mock's factory is hoisted above every import, so the fake has to be built
// inside vi.hoisted() to exist by the time the factory runs.
const { store, FakeRedis } = vi.hoisted(() => {
const store = {
  kv: new Map<string, string>(),
  sets: new Map<string, Set<string>>(),
  hashes: new Map<string, Map<string, number>>(),
};

class FakeRedis {
  async get<T>(k: string): Promise<T | null> {
    return (store.kv.has(k) ? (store.kv.get(k) as unknown as T) : null);
  }
  async set(k: string, v: string, opts?: { nx?: boolean }) {
    if (opts?.nx && store.kv.has(k)) return null;
    store.kv.set(k, v);
    return "OK";
  }
  async incr(k: string) {
    const n = Number(store.kv.get(k) ?? 0) + 1;
    store.kv.set(k, String(n));
    return n;
  }
  async sadd(k: string, m: string) {
    const s = store.sets.get(k) ?? new Set<string>();
    const isNew = !s.has(m);
    s.add(m);
    store.sets.set(k, s);
    return isNew ? 1 : 0;
  }
  async scard(k: string) {
    return store.sets.get(k)?.size ?? 0;
  }
  async hincrby(k: string, f: string, by: number) {
    const h = store.hashes.get(k) ?? new Map<string, number>();
    const n = (h.get(f) ?? 0) + by;
    h.set(f, n);
    store.hashes.set(k, h);
    return n;
  }
  async hgetall(k: string) {
    const h = store.hashes.get(k);
    return h ? Object.fromEntries(h) : null;
  }
  async expire() {
    return 1;
  }
  async zadd() {
    return 1;
  }
  pipeline = () => {
    const ops: (() => Promise<unknown>)[] = [];
    const api = {
      get: (k: string) => (ops.push(() => this.get(k)), api),
      incr: (k: string) => (ops.push(() => this.incr(k)), api),
      sadd: (k: string, m: string) => (ops.push(() => this.sadd(k, m)), api),
      scard: (k: string) => (ops.push(() => this.scard(k)), api),
      hincrby: (k: string, f: string, b: number) => (ops.push(() => this.hincrby(k, f, b)), api),
      hgetall: (k: string) => (ops.push(() => this.hgetall(k)), api),
      expire: () => (ops.push(() => this.expire()), api),
      zadd: () => (ops.push(() => this.zadd()), api),
      exec: async () => {
        const out: unknown[] = [];
        for (const op of ops) out.push(await op());
        return out;
      },
    };
    return api;
  };
}

  return { store, FakeRedis };
});

vi.mock("@upstash/redis", () => ({ Redis: FakeRedis }));

const CHROME = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const visit = (over: Partial<Parameters<typeof recordVisit>[0]> = {}) => ({
  ip: "1.2.3.4",
  userAgent: CHROME,
  host: "sinaamareh.ir",
  path: "/",
  referrer: "Direct",
  country: "DE",
  timezone: "Europe/Berlin",
  ...over,
});

import { recordVisit, getOverview } from "@/lib/analytics/store";

beforeEach(() => {
  store.kv.clear();
  store.sets.clear();
  store.hashes.clear();
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  vi.resetModules();
});

describe("analytics store aggregation", () => {
  it("counts one visitor once, and only marks them as returning on a second view", async () => {
    await recordVisit(visit());
    let o = await getOverview(30);
    expect(o.totals.views).toBe(1);
    expect(o.totals.visitors).toBe(1);
    expect(o.totals.repeatVisitors).toBe(0); // one view is not "came back"

    // Same IP + UA + host → same hash → still ONE person, now a repeat visitor.
    await recordVisit(visit({ path: "/projects" }));
    o = await getOverview(30);
    expect(o.totals.views).toBe(2);
    expect(o.totals.visitors).toBe(1);
    expect(o.totals.repeatVisitors).toBe(1);

    // A third view must not double-count them as two repeat visitors.
    await recordVisit(visit({ path: "/projects" }));
    o = await getOverview(30);
    expect(o.totals.views).toBe(3);
    expect(o.totals.visitors).toBe(1);
    expect(o.totals.repeatVisitors).toBe(1);
  });

  it("counts a different visitor as a separate person", async () => {
    await recordVisit(visit());
    await recordVisit(visit({ ip: "9.9.9.9" }));
    const o = await getOverview(30);
    expect(o.totals.visitors).toBe(2);
    expect(o.totals.repeatVisitors).toBe(0);
    expect(o.totals.views).toBe(2);
  });

  it("maps breakdowns to the right buckets (guards the pipeline index math)", async () => {
    await recordVisit(visit({ path: "/a", country: "DE", timezone: "Europe/Berlin", referrer: "google.com" }));
    await recordVisit(visit({ ip: "5.5.5.5", path: "/a", country: "US", timezone: "America/New_York", referrer: "Direct" }));
    await recordVisit(visit({ ip: "6.6.6.6", path: "/b", country: "US", timezone: "America/New_York", referrer: "google.com" }));

    const o = await getOverview(30);
    // Each breakdown must land in its OWN card — a shifted index would swap them.
    expect(o.paths).toEqual([
      { label: "/a", count: 2 },
      { label: "/b", count: 1 },
    ]);
    expect(o.countries).toEqual([
      { label: "US", count: 2 },
      { label: "DE", count: 1 },
    ]);
    expect(o.timezones).toEqual([
      { label: "America/New_York", count: 2 },
      { label: "Europe/Berlin", count: 1 },
    ]);
    expect(o.referrers).toEqual([
      { label: "google.com", count: 2 },
      { label: "Direct", count: 1 },
    ]);
  });

  it("honours the requested range length", async () => {
    await recordVisit(visit());
    for (const days of [7, 30, 90]) {
      const o = await getOverview(days);
      expect(o.series).toHaveLength(days);
      expect(o.range).toBe(days);
      // Today's view is always present regardless of window size.
      expect(o.totals.views).toBe(1);
    }
  });

  it("merges breakdowns across every month a long range spans", async () => {
    // Seed the previous month directly, mimicking data recorded back then.
    const prev = new Date();
    prev.setUTCMonth(prev.getUTCMonth() - 1);
    const prevMonth = prev.toISOString().slice(0, 7);
    store.hashes.set(`an:co:${prevMonth}`, new Map([["DE", 5]]));

    await recordVisit(visit({ country: "DE" })); // current month, 1 more DE

    // A 7-day window can't reach last month...
    const short = await getOverview(7);
    expect(short.countries).toEqual([{ label: "DE", count: 1 }]);

    // ...but a 90-day window must include and merge it, or the range selector
    // would only ever change the chart.
    const long = await getOverview(90);
    expect(long.countries).toEqual([{ label: "DE", count: 6 }]);
  });

  it("puts today's views at the END of the series (chronological order)", async () => {
    await recordVisit(visit());
    const o = await getOverview(7);
    expect(o.series).toHaveLength(7);
    expect(o.series[6]!.views).toBe(1); // today is last
    expect(o.series[0]!.views).toBe(0);
    expect(o.series[6]!.day).toBe(new Date().toISOString().slice(0, 10));
  });

  it("caps beacons per IP and by a global daily budget", async () => {
    const { beaconAllowed } = await import("@/lib/analytics/limit");
    const day = "2026-07-13";

    // Default per-IP budget is 20/min: the 21st call from one IP is refused,
    // while a different IP is unaffected.
    for (let i = 0; i < 20; i++) {
      expect((await beaconAllowed("1.2.3.4", day)).ok).toBe(true);
    }
    const over = await beaconAllowed("1.2.3.4", day);
    expect(over.ok).toBe(false);
    expect(over.reason).toBe("ip");
    expect((await beaconAllowed("5.6.7.8", day)).ok).toBe(true);
  });

  it("refuses beacons once the global daily budget is spent, even from fresh IPs", async () => {
    process.env.ANALYTICS_DAILY_MAX = "5";
    vi.resetModules();
    const { beaconAllowed } = await import("@/lib/analytics/limit");
    const day = "2026-07-14";

    for (let i = 0; i < 5; i++) {
      expect((await beaconAllowed(`10.0.0.${i}`, day)).ok).toBe(true);
    }
    // This is the control that stops one script draining a month of quota:
    // a brand-new IP is still refused once the day's budget is gone.
    const blocked = await beaconAllowed("10.0.0.99", day);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe("budget");
    delete process.env.ANALYTICS_DAILY_MAX;
  });

  it("never keys rate-limit state on a raw IP", async () => {
    const { beaconAllowed } = await import("@/lib/analytics/limit");
    await beaconAllowed("203.0.113.7", "2026-07-15");
    const keys = [...store.kv.keys()].join(" ");
    expect(keys).toContain("an:rl:");
    expect(keys).not.toContain("203.0.113.7");
  });

  it("also accepts the KV_REST_API_* names the Vercel Marketplace injects", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.KV_REST_API_URL = "https://fake.upstash.io";
    process.env.KV_REST_API_TOKEN = "fake-token";
    vi.resetModules();
    const mod = await import("@/lib/analytics/store");
    expect(mod.analyticsEnabled()).toBe(true);
    await mod.recordVisit(visit());
    expect((await mod.getOverview(30)).totals.views).toBe(1);
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
  });

  it("discovers credentials behind a Vercel Custom Prefix", async () => {
    // Vercel's connect dialog can rename the injected vars to <PREFIX>_REST_API_*.
    // Without discovery this reads as "not connected" with nothing to explain why.
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.STORAGE_REST_API_URL = "https://fake.upstash.io";
    process.env.STORAGE_REST_API_TOKEN = "fake-token";
    vi.resetModules();
    const mod = await import("@/lib/analytics/store");
    expect(mod.analyticsEnabled()).toBe(true);
    await mod.recordVisit(visit());
    expect((await mod.getOverview(30)).totals.views).toBe(1);
    delete process.env.STORAGE_REST_API_URL;
    delete process.env.STORAGE_REST_API_TOKEN;
  });

  it("no-ops safely when Upstash is not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.resetModules();
    const mod = await import("@/lib/analytics/store");
    await expect(mod.recordVisit(visit())).resolves.toBeUndefined();
    const o = await mod.getOverview(30);
    expect(o.enabled).toBe(false);
    expect(o.totals.views).toBe(0);
  });
});
