// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Noise filtering happens in the route, before a single Redis command: the
 * owner and dev traffic get the same silent 204 as everything else and never
 * reach the store or the rate limiter.
 */
const { recordVisit } = vi.hoisted(() => ({ recordVisit: vi.fn(async () => {}) }));

vi.mock("@upstash/redis", () => ({ Redis: class {} })); // "configured", never called
vi.mock("@/lib/analytics/limit", () => ({
  beaconAllowed: vi.fn(async () => ({ ok: true })),
  loginAllowed: vi.fn(async () => true),
}));
vi.mock("@/lib/analytics/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics/store")>()),
  recordVisit,
}));

import { POST as track } from "@/app/api/track/route";
import { POST as login } from "@/app/api/admin/login/route";
import { createSessionToken } from "@/lib/analytics/auth";
import { beaconAllowed } from "@/lib/analytics/limit";

const CHROME = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/120 Safari/537.36";
const ORIGIN = "http://localhost:3000";

function send(body: unknown, headers: Record<string, string> = {}) {
  return track(
    new Request(`${ORIGIN}/api/track`, {
      method: "POST",
      headers: { origin: ORIGIN, "user-agent": CHROME, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}
const PV = { path: "/projects", referrer: "" };

beforeEach(() => {
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://fake.upstash.io");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "fake-token");
  vi.stubEnv("ANALYTICS_IN_DEV", "1");
  vi.stubEnv("ADMIN_PASSWORD", "correct-horse");
  vi.clearAllMocks();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/track", () => {
  it("records a visitor's beacon", async () => {
    expect((await send(PV)).status).toBe(204);
    expect(recordVisit).toHaveBeenCalledOnce();
  });

  it("skips the owner: the year-long mark or a live admin session", async () => {
    expect((await send(PV, { cookie: "sa_owner=1" })).status).toBe(204);
    await send(PV, { cookie: `theme=dark; sa_admin=${createSessionToken()}` });
    expect(recordVisit).not.toHaveBeenCalled();
    expect(beaconAllowed).not.toHaveBeenCalled(); // not even the rate limiter's INCR
  });

  it("writes nothing outside production unless ANALYTICS_IN_DEV=1", async () => {
    vi.stubEnv("ANALYTICS_IN_DEV", "");
    await send(PV);
    expect(recordVisit).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/login", () => {
  it("marks the owner's browser for a year at sign-in", async () => {
    const res = await login(
      new Request(`${ORIGIN}/api/admin/login`, {
        method: "POST",
        headers: { origin: ORIGIN, "content-type": "application/json" },
        body: JSON.stringify({ password: "correct-horse" }),
      }),
    );
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    expect(cookies.some((c) => c.startsWith("sa_admin="))).toBe(true);
    const owner = cookies.find((c) => c.startsWith("sa_owner=1;"));
    expect(owner).toContain("HttpOnly");
    expect(owner).toContain("Max-Age=31536000");
  });
});
