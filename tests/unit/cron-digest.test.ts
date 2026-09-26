// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";
import type { Insights, RecentVisit } from "@/lib/analytics/insights";

const { getInsights } = vi.hoisted(() => ({ getInsights: vi.fn() }));
vi.mock("@/lib/analytics/insights", () => ({ getInsights }));

import { GET } from "@/app/api/cron/digest/route";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  getInsights.mockReset();
});

const call = (headers: Record<string, string>) =>
  GET(new Request("http://localhost/api/cron/digest", { headers }));

const visit = (id: string, over: Partial<RecentVisit> = {}): RecentVisit => ({
  id,
  start: 0,
  last: 0,
  country: "NL",
  city: "Amsterdam, NL",
  device: "Desktop",
  browser: "Chrome",
  lang: "en",
  referrer: "linkedin.com",
  entry: "/",
  pages: ["/"],
  pageCount: 1,
  activeMs: 5_000,
  sections: [{ section: "hero", ms: 5_000 }],
  events: [],
  returning: false,
  engaged: false,
  ...over,
});

/** Only what the digest reads. */
function insights(yesterdayVisits: number): Insights {
  const partial: Partial<Insights> = {
    enabled: true,
    degraded: false,
    series: [
      { day: "2026-09-25", visits: 4, engaged: 2, pageviews: 6, engagedMs: 100_000 },
      { day: "2026-09-26", visits: yesterdayVisits, engaged: 3, pageviews: 9, engagedMs: 375_000 },
    ],
    chat: { outcomes: [], topics: [{ label: "ScrapeGPT", count: 4 }], chip: 0, typed: 0 },
    recent: [
      // Today's visits come first in the log and must not be reported as yesterday's.
      visit("2026-09-27_today", { referrer: "google.com", activeMs: 900_000 }),
      visit("2026-09-26_long", {
        activeMs: 185_000,
        pageCount: 4,
        events: [{ name: "resume_download", count: 1 }],
      }),
      visit("2026-09-26_short"),
    ],
  };
  return partial as Insights;
}

async function digest(data: Insights) {
  vi.useFakeTimers({ now: new Date("2026-09-27T07:00:00Z"), toFake: ["Date"] });
  vi.stubEnv("CRON_SECRET", "s3cret");
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "bot");
  vi.stubEnv("TELEGRAM_CHAT_ID", "42");
  getInsights.mockResolvedValue(data);
  const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
  vi.stubGlobal("fetch", fetchMock);
  const res = await call({ authorization: "Bearer s3cret" });
  const sent = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).text as string);
  return { res, sent };
}

describe("GET /api/cron/digest", () => {
  it("fails closed without CRON_SECRET, even with a Vercel-looking header", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call({ "x-vercel-cron": "1" })).status).toBe(401);
  });

  it("accepts only the matching bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", ""); // stop before any network call
    expect((await call({ authorization: "Bearer wrong" })).status).toBe(401);
    expect((await call({ authorization: "Bearer s3cret" })).status).toBe(200);
  });

  it("reports yesterday, a whole UTC day, against the day before (health-4)", async () => {
    const { res, sent } = await digest(insights(6));
    expect(res.status).toBe(200);
    // Two days ending yesterday, and enough of the visit log to reach back to it.
    const [days, end] = getInsights.mock.calls[0]!;
    expect([days, (end as Date).toISOString().slice(0, 10)]).toEqual([2, "2026-09-26"]);

    const text = sent[0]!;
    expect(text).toContain("yesterday (2026-09-26)");
    expect(text).toContain("*Visits:* 6 (▲ +2 vs the day before)");
    expect(text).toContain("*Avg active time:* 2m 5s per engaged visit (day before: 50s)");
    expect(text).toContain("linkedin.com — 2");
    expect(text).not.toContain("google.com");
    expect(text).toContain("Amsterdam, NL · Desktop/Chrome · from linkedin.com · 3m 5s active");
    expect(text).toContain("résumé");
  });

  it("stays silent when nobody visited yesterday", async () => {
    const { res, sent } = await digest(insights(0));
    expect(await res.json()).toEqual({ skipped: "no_traffic" });
    expect(sent).toEqual([]);
  });
});
