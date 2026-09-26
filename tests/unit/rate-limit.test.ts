import { describe, it, expect, vi } from "vitest";

// A tiny stand-in for the Upstash client: just the two commands the cap uses.
const { fake } = vi.hoisted(() => ({
  fake: {
    counts: new Map<string, number>(),
    expired: [] as string[],
    broken: false,
    on: false,
  },
}));
vi.mock("@/lib/analytics/store", () => ({
  dayKey: (d = new Date()) => d.toISOString().slice(0, 10),
  redis: () =>
    fake.on
      ? {
          incr: async (k: string) => {
            if (fake.broken) throw new Error("ERR max requests limit exceeded");
            const n = (fake.counts.get(k) ?? 0) + 1;
            fake.counts.set(k, n);
            return n;
          },
          expire: async (k: string) => fake.expired.push(k),
        }
      : null,
}));

import { rateLimit, globalDailyOk, getClientIp } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("getClientIp reads the first x-forwarded-for entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("getClientIp falls back to anonymous", () => {
    expect(getClientIp(new Request("http://x"))).toBe("anonymous");
  });

  it("allows requests under the per-minute limit, then blocks", () => {
    const ip = `t-${Math.random()}`;
    let blocked = false;
    for (let i = 0; i < 20; i++) {
      if (!rateLimit(ip, 1000).ok) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });

  it("resets after the window elapses", () => {
    const ip = `t-${Math.random()}`;
    for (let i = 0; i < 20; i++) rateLimit(ip, 1000);
    expect(rateLimit(ip, 1000 + 61_000).ok).toBe(true);
  });

  it("globalDailyOk allows a request initially", async () => {
    expect(await globalDailyOk(1000)).toBe(true);
  });

  it("globalDailyOk counts in Redis (shared by every instance) and fails open to memory", async () => {
    fake.on = true;
    const now = Date.UTC(2026, 8, 26);
    const key = "chat:day:2026-09-26";

    expect(await globalDailyOk(now)).toBe(true);
    expect(fake.counts.get(key)).toBe(1);
    expect(fake.expired).toEqual([key]); // EXPIRE only on the day's first request

    fake.counts.set(key, 1000); // other instances already spent the default cap
    expect(await globalDailyOk(now)).toBe(false);
    expect(fake.expired).toHaveLength(1);

    fake.broken = true; // a Redis outage must not take the chat down
    expect(await globalDailyOk(now)).toBe(true);
  });
});
