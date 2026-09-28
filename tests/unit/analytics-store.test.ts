// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";

/**
 * The aggregation path is where silent wrongness lives: a visit fans out across
 * several key types, and getInsights reads them back by *position* in a
 * pipeline. An off-by-one there wouldn't crash — it would just render
 * confident, wrong numbers on the dashboard. So exercise both against an
 * in-memory Redis that also honours TTLs, so visit expiry and "every key has a
 * TTL" are real.
 */
// vi.mock's factory is hoisted above every import, so the fake has to be built
// inside vi.hoisted() to exist by the time the factory runs.
const { store, FakeRedis } = vi.hoisted(() => {
  const store = {
    kv: new Map<string, unknown>(),
    sets: new Map<string, Set<string>>(),
    hashes: new Map<string, Map<string, unknown>>(),
    lists: new Map<string, string[]>(),
    /** key → expiry (epoch ms). */
    ttl: new Map<string, number>(),
  };
  const maps = () => [store.kv, store.sets, store.hashes, store.lists];
  const exists = (k: string) => maps().some((m) => m.has(k));
  /** Lazy expiry on access, like Redis. */
  const alive = (k: string) => {
    const t = store.ttl.get(k);
    if (t !== undefined && Date.now() >= t) {
      for (const m of maps()) m.delete(k);
      store.ttl.delete(k);
    }
  };
  const hash = (k: string) => {
    alive(k);
    const h = store.hashes.get(k) ?? new Map<string, unknown>();
    store.hashes.set(k, h);
    return h;
  };

  class FakeRedis {
    async get(k: string) {
      alive(k);
      return store.kv.has(k) ? store.kv.get(k) : null;
    }
    async getex(k: string, o: { ex: number }) {
      alive(k);
      if (!store.kv.has(k)) return null;
      store.ttl.set(k, Date.now() + o.ex * 1000);
      return store.kv.get(k);
    }
    async set(k: string, v: unknown, o?: { nx?: boolean; ex?: number }) {
      alive(k);
      if (o?.nx && store.kv.has(k)) return null;
      store.kv.set(k, v);
      store.ttl.delete(k);
      if (o?.ex) store.ttl.set(k, Date.now() + o.ex * 1000);
      return "OK";
    }
    async incr(k: string) {
      return this.incrby(k, 1);
    }
    async incrby(k: string, by: number) {
      alive(k);
      const n = Number(store.kv.get(k) ?? 0) + by;
      store.kv.set(k, String(n));
      return n;
    }
    async sadd(k: string, m: string) {
      alive(k);
      const s = store.sets.get(k) ?? new Set<string>();
      const isNew = !s.has(m);
      s.add(m);
      store.sets.set(k, s);
      return isNew ? 1 : 0;
    }
    async scard(k: string) {
      alive(k);
      return store.sets.get(k)?.size ?? 0;
    }
    async hincrby(k: string, f: string, by: number) {
      const h = hash(k);
      const n = Number(h.get(f) ?? 0) + by;
      h.set(f, n);
      return n;
    }
    async hset(k: string, obj: Record<string, unknown>) {
      const h = hash(k);
      for (const [f, v] of Object.entries(obj)) h.set(f, v);
      return 1;
    }
    async hsetnx(k: string, f: string, v: unknown) {
      const h = hash(k);
      if (h.has(f)) return 0;
      h.set(f, v);
      return 1;
    }
    async hget(k: string, f: string) {
      alive(k);
      return store.hashes.get(k)?.get(f) ?? null;
    }
    async hmget(k: string, ...fields: string[]) {
      alive(k);
      const h = store.hashes.get(k);
      return h ? Object.fromEntries(fields.map((f) => [f, h.get(f) ?? null])) : null;
    }
    async hgetall(k: string) {
      alive(k);
      const h = store.hashes.get(k);
      return h ? Object.fromEntries(h) : null;
    }
    async lpush(k: string, v: string) {
      alive(k);
      const l = [v, ...(store.lists.get(k) ?? [])];
      store.lists.set(k, l);
      return l.length;
    }
    async ltrim(k: string, start: number, stop: number) {
      const l = store.lists.get(k);
      if (l) store.lists.set(k, l.slice(start, stop + 1));
      return "OK";
    }
    async lrange(k: string, start: number, stop: number) {
      alive(k);
      // A negative stop counts from the end, like Redis (-1 = the last element).
      return (store.lists.get(k) ?? []).slice(start, stop + 1 || undefined);
    }
    async expire(k: string, seconds: number, option?: string) {
      alive(k);
      if (!exists(k)) return 0; // EXPIRE on a missing key does nothing
      if (option?.toLowerCase() === "nx" && store.ttl.has(k)) return 0;
      store.ttl.set(k, Date.now() + seconds * 1000);
      return 1;
    }
    /** Queues any command above; exec runs them in order. */
    pipeline = () => {
      const ops: (() => Promise<unknown>)[] = [];
      const self = this as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>;
      const api: Record<string, unknown> = new Proxy(
        {},
        {
          get: (_, name: string) => {
            if (name === "length") return () => ops.length;
            if (name === "exec") {
              return async () => {
                const out: unknown[] = [];
                for (const op of ops) out.push(await op());
                return out;
              };
            }
            return (...args: unknown[]) => {
              ops.push(() => self[name]!(...args));
              return api;
            };
          },
        },
      );
      return api;
    };
  }

  return { store, FakeRedis };
});

vi.mock("@upstash/redis", () => ({ Redis: FakeRedis }));

// after() needs a live request; here it runs the callback and keeps its promise.
const { afterWork } = vi.hoisted(() => ({ afterWork: [] as Promise<unknown>[] }));
vi.mock("next/server", () => ({
  after: (fn: () => Promise<unknown>) => void afterWork.push(fn()),
}));

import {
  noteChat,
  recordBeacon,
  recordChat,
  type ChatTurn,
  type Visitor,
} from "@/lib/analytics/session";
import { getConversations, getInsights } from "@/lib/analytics/insights";
import { siteHost } from "@/lib/analytics/collect";
import type { Beacon } from "@/lib/analytics/beacon";

const CHROME = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const visitor = (over: Partial<Visitor> = {}): Visitor => ({
  ip: "1.2.3.4",
  userAgent: CHROME,
  host: "sinaamareh.ir",
  country: "DE",
  timezone: "Europe/Berlin",
  city: "Berlin, DE",
  hour: "09:00",
  weekday: "Tue",
  device: "Desktop",
  browser: "Chrome",
  ...over,
});
/** The request fields a chat turn is matched to its visit by (visitor()'s own). */
const who = { ip: "1.2.3.4", userAgent: CHROME, host: "sinaamareh.ir" };
const turn = (over: Partial<ChatTurn> = {}): ChatTurn => ({
  question: "What is ScrapeGPT?",
  reply: "My scraper that asks an LLM for structured data.",
  lang: "en",
  sources: ["Project: ScrapeGPT"],
  provider: "gemini-3.1-flash-lite#0",
  ms: 2400,
  ...over,
});
const pv = (path = "/", referrer = "Direct"): Beacon => ({ t: "pv", path, referrer });
const eng = (ms: number, extra: Partial<Extract<Beacon, { t: "eng" }>> = {}): Beacon => ({
  t: "eng",
  path: "/",
  ms,
  sections: {},
  events: {},
  ...extra,
});

/** A fixed mid-month morning, so 7- and 30-day ranges stay inside one month. */
const T0 = new Date("2026-09-15T10:00:00Z").getTime();
const MIN = 60_000;
const at = (ms: number) => vi.setSystemTime(T0 + ms);
const insights = (days = 30) => getInsights(days, new Date());

beforeEach(() => {
  for (const m of [store.kv, store.sets, store.hashes, store.lists, store.ttl]) m.clear();
  process.env.UPSTASH_REDIS_REST_URL = "https://fake.upstash.io";
  process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
  vi.useFakeTimers({ toFake: ["Date"] });
  at(0);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("visits (sessions)", () => {
  it("continues a visit across pages and reloads, and starts a new one after 30 idle minutes", async () => {
    await recordBeacon(visitor(), pv("/"));
    at(5 * MIN);
    await recordBeacon(visitor(), pv("/projects"));
    at(20 * MIN); // an engagement flush also keeps the visit alive
    await recordBeacon(visitor(), eng(1000));
    let o = await insights();
    expect(o.kpis.visits).toBe(1);
    expect(o.kpis.pageviews).toBe(2);

    at(20 * MIN + 31 * MIN); // 31 minutes of silence
    await recordBeacon(visitor(), pv("/"));
    o = await insights();
    expect(o.kpis.visits).toBe(2);
    expect(o.kpis.uniqueVisitors).toBe(1); // still one person
  });

  it("does not start a visit from an empty flush after 30 idle minutes", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor(), eng(5000));
    at(40 * MIN); // the tab sat in the background, then was closed
    await recordBeacon(visitor(), eng(0));
    const o = await insights();
    expect(o.kpis.visits).toBe(1);
    expect(o.kpis.returningVisits).toBe(0);
    expect(o.recent).toHaveLength(1);
  });

  it("starts one visit when a new visitor's first beacons race", async () => {
    // Several links opened in new tabs at once: every tab's page view sees no visit.
    await Promise.all([recordBeacon(visitor(), pv("/")), recordBeacon(visitor(), pv("/projects"))]);
    const o = await insights();
    expect(o.kpis.visits).toBe(1);
    expect(o.kpis.returningVisits).toBe(0);
  });

  it("does not count a reload of the same page within 15 s as a page view", async () => {
    await recordBeacon(visitor(), pv("/"));
    at(10_000);
    await recordBeacon(visitor(), pv("/")); // reload
    expect((await insights()).kpis.pageviews).toBe(1);
    at(30_000);
    await recordBeacon(visitor(), pv("/")); // came back to it later
    const o = await insights();
    expect(o.kpis.pageviews).toBe(2);
    expect(o.kpis.engaged).toBe(0); // the same page twice is not "2+ pages"
  });

  it("counts acquisition once per visit, pages once per view", async () => {
    await recordBeacon(visitor(), pv("/", "google.com"));
    at(MIN);
    await recordBeacon(visitor(), pv("/projects"));
    at(2 * MIN);
    await recordBeacon(visitor(), pv("/projects/scrapegpt"));
    await recordBeacon(visitor({ ip: "9.9.9.9", country: "US" }), pv("/fa", "Direct"));

    const o = await insights();
    // Three pages from Google are ONE arrival from Google.
    expect(o.acquisition.referrers).toHaveLength(2);
    expect(o.acquisition.referrers).toEqual(
      expect.arrayContaining([
        { label: "google.com", count: 1 },
        { label: "Direct", count: 1 },
      ]),
    );
    expect(o.acquisition.countries).toHaveLength(2);
    expect(o.acquisition.devices).toEqual([{ label: "Desktop", count: 2 }]);
    expect(o.acquisition.entryPages.map((e) => e.label).sort()).toEqual(["/", "/fa"]);
    expect(o.acquisition.languages).toEqual(
      expect.arrayContaining([
        { label: "en", count: 1 },
        { label: "fa", count: 1 },
      ]),
    );
    expect(o.kpis.pagesPerVisit).toBe(2); // 4 views over 2 visits, same days
    expect(o.pages.map((p) => p.path)).toHaveLength(4);
  });

  it("marks a visit returning only on the visitor's second visit this month", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor(), pv("/projects")); // same visit: not a return
    let o = await insights();
    expect(o.kpis.returningVisits).toBe(0);
    expect(o.kpis.returningVisitors).toBe(0);

    at(2 * 3600_000);
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor({ ip: "5.5.5.5" }), pv("/"));
    o = await insights();
    expect(o.kpis.visits).toBe(3);
    expect(o.kpis.returningVisits).toBe(1);
    expect(o.kpis.returningVisitors).toBe(1);
    expect(o.recent.map((v) => v.returning)).toEqual([false, true, false]); // newest first
  });
});

describe("engagement", () => {
  it("marks a visit engaged once, by active time, a second page or a key event", async () => {
    // A: crosses 10 s of active time on its second flush, then views another page.
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor(), eng(5000));
    expect((await insights()).kpis.engaged).toBe(0);
    await recordBeacon(visitor(), eng(6000));
    at(MIN);
    await recordBeacon(visitor(), pv("/projects"));
    // B: a key event with almost no time.
    await recordBeacon(visitor({ ip: "2.2.2.2" }), pv("/"));
    await recordBeacon(visitor({ ip: "2.2.2.2" }), eng(1000, { events: { resume_download: 1 } }));
    // C: two pages. D: one page and gone.
    await recordBeacon(visitor({ ip: "3.3.3.3" }), pv("/"));
    await recordBeacon(visitor({ ip: "3.3.3.3" }), pv("/projects"));
    await recordBeacon(visitor({ ip: "4.4.4.4" }), pv("/"));

    const o = await insights();
    expect(o.kpis.visits).toBe(4);
    expect(o.kpis.engaged).toBe(3);
    expect(o.kpis.engagementRate).toBe(0.75);
    // A engaged at 11 s, B at 1 s, C at 0 s.
    expect(o.kpis.avgEngagedMs).toBe(4000);
    expect(o.series.at(-1)).toMatchObject({ visits: 4, engaged: 3 });
  });

  it("counts the visit engaged once when a route change's page view and flush race", async () => {
    await recordBeacon(visitor(), pv("/"));
    // Navigating sends the old page's flush and the new page's view together;
    // both see an unengaged visit and both try to mark it.
    await Promise.all([
      recordBeacon(visitor(), pv("/projects")),
      recordBeacon(visitor(), eng(11_000)),
    ]);
    expect((await insights()).kpis.engaged).toBe(1);
  });

  it("moves a visit between time buckets as its active time crosses an edge", async () => {
    await recordBeacon(visitor(), pv("/"));
    const counts = async () => (await insights()).timeBuckets.map((b) => b.count);
    expect(await counts()).toEqual([1, 0, 0, 0, 0, 0]);
    await recordBeacon(visitor(), eng(5000));
    expect(await counts()).toEqual([1, 0, 0, 0, 0, 0]); // still under 10 s
    await recordBeacon(visitor(), eng(6000)); // 11 s
    expect(await counts()).toEqual([0, 1, 0, 0, 0, 0]);
    await recordBeacon(visitor(), eng(60_000)); // 71 s → 1–3 min
    expect(await counts()).toEqual([0, 0, 0, 1, 0, 0]);
  });

  it("counts a section reached once per visit and sums its dwell", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor(), eng(4000, { sections: { hero: 3000, featured: 0 } }));
    await recordBeacon(visitor(), eng(4000, { sections: { hero: 2000, about: 1000 } }));
    await recordBeacon(visitor({ ip: "7.7.7.7" }), pv("/"));

    const o = await insights();
    const hero = o.sections.find((s) => s.section === "hero")!;
    expect(hero).toEqual({ section: "hero", visits: 1, reachPct: 0.5, avgMs: 5000 });
    expect(o.sections.find((s) => s.section === "featured")!.visits).toBe(1);
    expect(o.sections.find((s) => s.section === "contact")!.visits).toBe(0);
    expect(o.pages.find((p) => p.path === "/")).toEqual({ path: "/", views: 2, avgMs: 4000 });
  });

  it("measures a section's reach against the visits that opened its page", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(visitor(), eng(4000, { sections: { hero: 3000 } }));
    at(MIN);
    await recordBeacon(visitor(), pv("/fa")); // the same home page again: still one home visit
    // Landed on a case study and never opened home: not a drop-off in the home funnel.
    const deep = visitor({ ip: "7.7.7.7" });
    await recordBeacon(deep, pv("/projects/scrapegpt"));
    await recordBeacon(
      deep,
      eng(4000, { path: "/projects/scrapegpt", sections: { "case-study": 3000 } }),
    );

    const o = await insights();
    expect(o.sections.find((s) => s.section === "hero")!.reachPct).toBe(1);
    expect(o.sections.find((s) => s.section === "case-study")!.reachPct).toBe(1);
  });

  it("groups events with their props, per month and per visit", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(
      visitor(),
      eng(1000, { events: { "outbound:github": 2, "chat_ask:chip": 1, contact_submit: 1 } }),
    );

    const o = await insights();
    expect(o.events[0]).toEqual({
      name: "outbound",
      count: 2,
      props: [{ label: "github", count: 2 }],
    });
    expect(o.kpis.contactSubmits).toBe(1);
    expect(o.recent[0]!.events).toEqual(
      expect.arrayContaining([{ name: "outbound:github", count: 2 }]),
    );
  });
});

describe("storage and cost", () => {
  it("gives every key it creates a TTL (except the one-date since marker)", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordBeacon(
      visitor(),
      eng(12_000, { sections: { hero: 1000 }, events: { outbound: 1 } }),
    );
    at(2 * 3600_000);
    await recordBeacon(visitor(), pv("/")); // returning → an:ret is created now
    await recordChat({ outcome: "answered", topic: "CV", chip: true }, { turn: turn(), who });

    const keys = [store.kv, store.sets, store.hashes, store.lists].flatMap((m) => [...m.keys()]);
    expect(keys.filter((k) => k !== "an:since" && !store.ttl.has(k))).toEqual([]);
    expect(keys).toContain("an:ret:2026-09");
    expect(keys).toContain("an:chat:2026-09-15");
  });

  it("spends under 30 commands on a visit's first beacon and far fewer inside it", async () => {
    const first = await recordBeacon(visitor(), pv("/", "google.com"));
    at(MIN);
    const next = await recordBeacon(visitor(), pv("/projects"));
    const flush = await recordBeacon(visitor(), eng(5000, { sections: { hero: 3000 } }));
    // The daily budget math in lib/analytics/limit.ts leans on these.
    expect(first).toBeGreaterThan(15);
    expect(first).toBeLessThanOrEqual(30);
    expect(next).toBeLessThanOrEqual(8);
    expect(flush).toBeLessThanOrEqual(12);
  });
});

describe("getInsights", () => {
  it("reads the old per-pageview counter for days before v2 started", async () => {
    store.kv.set("an:v:2026-09-10", "7");
    store.kv.set("an:v:2026-09-15", "3"); // the deploy day: v1 views before, v2 after
    await recordBeacon(visitor(), pv("/"));
    const o = await insights(7);
    expect(o.since).toBe("2026-09-15");
    expect(o.series.find((d) => d.day === "2026-09-10")!.pageviews).toBe(7);
    expect(o.series.at(-1)!.pageviews).toBe(4);
    expect(o.kpis.pageviews).toBe(11);
  });

  it("merges every month a range touches and says which months those are", async () => {
    store.hashes.set("an:m:2026-08", new Map<string, unknown>([["co:DE", 5]]));
    await recordBeacon(visitor(), pv("/"));

    const short = await insights(7);
    expect(short.months).toEqual(["2026-09"]);
    expect(short.acquisition.countries).toEqual([{ label: "DE", count: 1 }]);

    const long = await insights(90);
    expect(long.months).toEqual(["2026-06", "2026-07", "2026-08", "2026-09"]);
    expect(long.acquisition.countries).toEqual([{ label: "DE", count: 6 }]);
    expect(long.series).toHaveLength(90);
  });

  it("lists recent visits newest first with their page sequence", async () => {
    await recordBeacon(visitor(), pv("/", "google.com"));
    await recordBeacon(visitor(), pv("/projects"));
    at(MIN);
    await recordBeacon(visitor({ ip: "8.8.8.8", country: "US" }), pv("/fa/projects"));

    const { recent } = await insights();
    expect(recent).toHaveLength(2);
    expect(recent[0]).toMatchObject({ country: "US", lang: "fa", entry: "/fa/projects" });
    expect(recent[1]).toMatchObject({
      referrer: "google.com",
      pages: ["/", "/projects"],
      pageCount: 2,
      engaged: true, // two pages
    });
  });

  it("returns a degraded result instead of throwing when Redis fails", async () => {
    const spy = vi.spyOn(FakeRedis.prototype, "hgetall").mockRejectedValue(new Error("ERR quota"));
    try {
      const o = await insights();
      expect(o.enabled).toBe(true);
      expect(o.degraded).toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});

describe("chat outcomes", () => {
  it("records outcome, topic and chip-vs-typed in the month's aggregates", async () => {
    await recordChat({ outcome: "answered", topic: "Project: ScrapeGPT", chip: true });
    await recordChat({ outcome: "refused", chip: false });
    const o = await insights();
    expect(o.kpis.chatQuestions).toBe(2);
    expect(o.chat.outcomes).toEqual(
      expect.arrayContaining([
        { label: "answered", count: 1 },
        { label: "refused", count: 1 },
      ]),
    );
    expect(o.chat.topics).toEqual([{ label: "Project: ScrapeGPT", count: 1 }]);
    expect(o.chat).toMatchObject({ chip: 1, typed: 1 });
  });

  it("never throws when Redis fails", async () => {
    const spy = vi.spyOn(FakeRedis.prototype, "hincrby").mockRejectedValue(new Error("down"));
    try {
      await expect(recordChat({ outcome: "error", chip: false })).resolves.toBeUndefined();
    } finally {
      spy.mockRestore();
    }
  });
});

describe("chat transcripts", () => {
  const DAY = "an:chat:2026-09-15";
  const log = (over: Partial<ChatTurn> = {}) => ({ turn: turn(over), who });
  const answered = { outcome: "answered", topic: "Project: ScrapeGPT", chip: true } as const;

  it("stores the question, the reply and the asker's visit, with a 30-day TTL from creation", async () => {
    await recordBeacon(visitor(), pv("/"));
    const sid = store.lists.get("an:recent")![0];
    await recordChat(answered, log());
    const created = store.ttl.get(DAY);
    expect(created).toBe(T0 + 30 * 86_400_000);

    at(MIN);
    await recordChat(
      { outcome: "smalltalk", chip: false },
      log({ question: "thanks!", reply: "Anytime!", intent: "thanks", sources: [] }),
    );
    expect(store.ttl.get(DAY)).toBe(created); // set once, not slid by every turn
    expect(store.lists.get(DAY)).toEqual([
      expect.objectContaining({ question: "thanks!", outcome: "smalltalk", intent: "thanks", sid }),
      {
        question: "What is ScrapeGPT?",
        reply: "My scraper that asks an LLM for structured data.",
        lang: "en",
        sources: ["Project: ScrapeGPT"],
        provider: "gemini-3.1-flash-lite#0",
        ms: 2400,
        at: T0,
        outcome: "answered",
        sid,
      },
    ]);
  });

  it("re-arms the 30-day TTL on a later turn when the first turn's EXPIRE failed", async () => {
    const expire = vi
      .spyOn(FakeRedis.prototype, "expire")
      .mockRejectedValueOnce(new Error("Upstash blip"));
    try {
      await recordChat(answered, log()); // its pipeline throws after the LPUSH
      expect(store.lists.get(DAY)).toHaveLength(1);
      expect(store.ttl.has(DAY)).toBe(false);
    } finally {
      expire.mockRestore();
    }
    at(MIN);
    await recordChat(answered, log());
    expect(store.ttl.get(DAY)).toBe(T0 + MIN + 30 * 86_400_000);
  });

  it("truncates a long reply and never stores the raw IP", async () => {
    await recordChat(answered, log({ reply: "x".repeat(9000) }));
    const [entry] = store.lists.get(DAY) as unknown as { reply: string }[];
    expect(entry!.reply).toHaveLength(4000);
    expect(JSON.stringify([...store.lists, ...store.kv, ...store.hashes])).not.toContain("1.2.3.4");
  });

  it("keeps a turn with no visit found, its visit left empty", async () => {
    await recordChat(answered, log());
    expect(store.lists.get(DAY)).toEqual([expect.objectContaining({ sid: "" })]);
  });

  it("stops writing turns once the day's chat cap is reached", async () => {
    at(40 * 86_400_000); // its own day: the cap is remembered per instance
    store.hashes.set("an:d:2026-10-25", new Map<string, unknown>([["chat", 300]]));
    await recordChat(answered, log());
    await recordChat(answered, log());
    expect(store.lists.has("an:chat:2026-10-25")).toBe(false);
  });

  it("spends 7 commands on a turn inside a visit", async () => {
    await recordBeacon(visitor(), pv("/"));
    await recordChat(answered, log()); // the day's first: its EXPIREs, plus the salt
    const names = ["get", "set", "lpush", "hincrby", "expire"] as const;
    const spies = names.map((n) => vi.spyOn(FakeRedis.prototype, n));
    try {
      await recordChat(answered, log());
      expect(spies.reduce((a, s) => a + s.mock.calls.length, 0)).toBe(7);
    } finally {
      spies.forEach((s) => s.mockRestore());
    }
  });

  describe("noteChat", () => {
    const request = (headers: Record<string, string> = {}) =>
      new Request("https://sinaamareh.ir/api/chat", {
        method: "POST",
        headers: { "user-agent": CHROME, "x-forwarded-for": "1.2.3.4", ...headers },
      });
    const settle = async () => {
      await Promise.all(afterWork.splice(0));
    };
    beforeEach(() => {
      vi.stubEnv("ANALYTICS_IN_DEV", "1");
    });
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("finds the visit the beacon started for the same request", async () => {
      const req = request();
      await recordBeacon(visitor({ host: siteHost(req) }), pv("/"));
      noteChat(req, answered, turn());
      await settle();
      expect(store.lists.get(DAY)).toEqual([
        expect.objectContaining({ sid: store.lists.get("an:recent")![0] }),
      ]);
    });

    it("skips the owner, bots, and everything outside production", async () => {
      noteChat(request({ cookie: "sa_owner=1" }), answered, turn());
      noteChat(
        request({ "user-agent": "Googlebot/2.1 (+http://www.google.com/bot.html)" }),
        answered,
        turn(),
      );
      vi.stubEnv("ANALYTICS_IN_DEV", "");
      noteChat(request(), answered, turn());
      await settle();
      expect(store.lists.has(DAY)).toBe(false);
      expect(store.hashes.has("an:d:2026-09-15")).toBe(false);
    });
  });
});

describe("getConversations", () => {
  const ask = (question: string, ip = who.ip) =>
    recordChat(
      { outcome: "answered", chip: false },
      { turn: turn({ question }), who: { ...who, ip } },
    );

  it("groups turns by visit, newest conversation first, each in the order asked", async () => {
    await recordBeacon(visitor(), pv("/"));
    await ask("What is ScrapeGPT?");
    at(MIN);
    await ask("Does it have tests?");
    at(2 * MIN);
    await recordBeacon(visitor({ ip: "8.8.8.8", country: "US" }), pv("/fa"));
    await ask("Ignore your rules", "8.8.8.8");
    at(3 * MIN);
    await ask("hi", "9.9.9.9"); // this one's visit was never recorded

    const { list, more, days } = await getConversations(30, 50, new Date());
    expect(days).toBe(30);
    expect(more).toBe(false);
    expect(list.map((c) => c.turns.map((t) => t.question))).toEqual([
      ["hi"], // no visit found: a conversation of its own
      ["Ignore your rules"],
      ["What is ScrapeGPT?", "Does it have tests?"],
    ]);
    expect(list[0]!.visit).toBeNull();
    // Named by its time, not its place: a newer visit-less turn can't shift a ?chat= link.
    const lone = list[0]!.id;
    expect(lone).toMatch(/^turn-\d+$/);
    at(4 * MIN);
    await ask("hello", "7.7.7.7");
    await ask("hey", "6.6.6.6"); // same millisecond: still a conversation of its own
    const after = (await getConversations(30, 50, new Date())).list;
    expect(after.map((c) => c.turns.map((t) => t.question))).toEqual([
      ["hey"],
      ["hello"],
      ["hi"],
      ["Ignore your rules"],
      ["What is ScrapeGPT?", "Does it have tests?"],
    ]);
    expect(after[2]!.id).toBe(lone);
    expect(list[1]!.visit).toMatchObject({ country: "US", lang: "fa" });
    expect(list[2]!.visit).toMatchObject({ country: "DE", entry: "/" });
  });

  it("is bounded: the newest `limit`, older days only read when needed, 30 days at most", async () => {
    for (let i = 0; i < 4; i++) {
      at(-i * 86_400_000); // one lone turn on each of the last 4 days
      await ask(`day ${i}`, `10.0.0.${i}`);
    }
    at(0);
    const lrange = vi.spyOn(FakeRedis.prototype, "lrange");
    try {
      const first = await getConversations(30, 2, new Date());
      expect(first.list.map((c) => c.turns[0]!.question)).toEqual(["day 0", "day 1"]);
      expect(first.more).toBe(true);
      expect(lrange).toHaveBeenCalledTimes(7); // one week was enough
      expect((await getConversations(90, 50, new Date())).days).toBe(30);
    } finally {
      lrange.mockRestore();
    }
  });
});

describe("beacon limits", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("caps beacons per IP, in memory before any Redis command", async () => {
    const { beaconAllowed } = await import("@/lib/analytics/limit");
    const day = "2026-07-13";
    // Default 30/min: the 31st from one IP is refused, another IP is unaffected.
    for (let i = 0; i < 30; i++) expect((await beaconAllowed("1.2.3.4", day)).ok).toBe(true);
    for (let i = 0; i < 10; i++) {
      expect(await beaconAllowed("1.2.3.4", day)).toEqual({ ok: false, reason: "ip" });
    }
    // The refused ones never reached Redis.
    const counters = [...store.kv].filter(([k]) => k.startsWith("an:rl:"));
    expect(counters.map(([, v]) => v)).toEqual(["30"]);
    expect((await beaconAllowed("5.6.7.8", day)).ok).toBe(true);
  });

  it("refuses beacons once the day's command budget is spent, even from fresh IPs", async () => {
    process.env.ANALYTICS_DAILY_COMMANDS = "50";
    try {
      const { beaconAllowed, chargeBeacon } = await import("@/lib/analytics/limit");
      const day = "2026-07-14";
      expect((await beaconAllowed("10.0.0.1", day)).ok).toBe(true);
      await chargeBeacon(day, 30);
      expect((await beaconAllowed("10.0.0.2", day)).ok).toBe(true);
      await chargeBeacon(day, 30);
      // This is the control that stops one script draining a month of quota.
      expect(await beaconAllowed("10.0.0.99", day)).toEqual({ ok: false, reason: "budget" });
      expect((await beaconAllowed("10.0.0.99", "2026-07-15")).ok).toBe(true); // a new day
      expect(store.ttl.has(`an:cap:${day}`)).toBe(true);
    } finally {
      delete process.env.ANALYTICS_DAILY_COMMANDS;
    }
  });

  it("fails open when Redis errors, so an outage can't lock the owner out", async () => {
    const incr = vi
      .spyOn(FakeRedis.prototype, "incrby")
      .mockRejectedValue(new Error("ERR max requests limit exceeded"));
    try {
      const { beaconAllowed, chargeBeacon, loginAllowed } = await import("@/lib/analytics/limit");
      expect(await loginAllowed("1.2.3.4")).toBe(true);
      expect((await beaconAllowed("1.2.3.4", "2026-07-16")).ok).toBe(true);
      await expect(chargeBeacon("2026-07-16", 10)).resolves.toBeUndefined();
    } finally {
      incr.mockRestore();
    }
  });

  it("never keys rate-limit state on a raw IP, nor on a bare hash of one", async () => {
    const { beaconAllowed } = await import("@/lib/analytics/limit");
    await beaconAllowed("203.0.113.7", "2026-07-15");
    const keys = [...store.kv.keys()].join(" ");
    expect(keys).toContain("an:rl:");
    expect(keys).not.toContain("203.0.113.7");
    // Every IPv4 address hashes in seconds, so an unsalted hash is the IP.
    const bareHash = createHash("sha256").update("203.0.113.7").digest("hex").slice(0, 16);
    expect(keys).not.toContain(bareHash);
  });
});

describe("configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("also accepts the KV_REST_API_* names the Vercel Marketplace injects", async () => {
    vi.stubEnv("KV_REST_API_URL", "https://fake.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "fake-token");
    const mod = await import("@/lib/analytics/store");
    expect(mod.analyticsEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("discovers credentials behind a Vercel Custom Prefix", async () => {
    // Vercel's connect dialog can rename the injected vars to <PREFIX>_REST_API_*.
    // Without discovery this reads as "not connected" with nothing to explain why.
    vi.stubEnv("STORAGE_REST_API_URL", "https://fake.upstash.io");
    vi.stubEnv("STORAGE_REST_API_TOKEN", "fake-token");
    const mod = await import("@/lib/analytics/store");
    expect(mod.analyticsEnabled()).toBe(true);
    vi.unstubAllEnvs();
  });

  it("no-ops safely when Upstash is not configured", async () => {
    const session = await import("@/lib/analytics/session");
    const { getInsights: read } = await import("@/lib/analytics/insights");
    expect(await session.recordBeacon(visitor(), pv("/"))).toBe(0);
    await expect(session.recordChat({ outcome: "answered", chip: false })).resolves.toBeUndefined();
    expect((await read(30)).enabled).toBe(false);
  });

  it("writes nothing outside production unless ANALYTICS_IN_DEV=1", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");
    const { collecting } = await import("@/lib/analytics/store");
    expect(collecting()).toBe(false); // NODE_ENV is "test" here
    vi.stubEnv("ANALYTICS_IN_DEV", "1");
    expect(collecting()).toBe(true);
    vi.stubEnv("ANALYTICS_IN_DEV", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(collecting()).toBe(true);
    vi.unstubAllEnvs();
  });
});
