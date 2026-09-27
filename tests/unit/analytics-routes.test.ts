// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Noise filtering happens in the route, before a single Redis command: the
 * owner, dev traffic, bots, foreign origins and malformed beacons all get the
 * same silent 204 and never reach the store or the rate limiter.
 */
const { recordBeacon } = vi.hoisted(() => ({ recordBeacon: vi.fn(async () => 5) }));

// "Configured", and every command fails like an outage or a spent quota. The
// track tests never reach Redis; the login test below leans on the failure.
vi.mock("@upstash/redis", () => ({
  Redis: class {
    incr = () => Promise.reject(new Error("ERR max requests limit exceeded"));
  },
}));
vi.mock("@/lib/analytics/limit", () => ({
  beaconAllowed: vi.fn(async () => ({ ok: true })),
  chargeBeacon: vi.fn(async () => {}),
  loginAllowed: vi.fn(async () => true),
}));
vi.mock("@/lib/analytics/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/analytics/session")>()),
  recordBeacon,
}));

import { POST as track } from "@/app/api/track/route";
import { POST as login } from "@/app/api/admin/login/route";
import { createSessionToken } from "@/lib/analytics/auth";
import { beaconAllowed, loginAllowed } from "@/lib/analytics/limit";

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
const PV = { t: "pv", path: "/projects", referrer: "" };

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
  it("records a well-formed beacon from a visitor", async () => {
    const res = await send(PV);
    expect(res.status).toBe(204);
    expect(recordBeacon).toHaveBeenCalledOnce();
    expect(recordBeacon).toHaveBeenCalledWith(
      expect.objectContaining({ userAgent: CHROME, browser: "Chrome" }),
      { t: "pv", path: "/projects", referrer: "Direct" },
    );
  });

  it("skips the owner: the year-long mark or a live admin session", async () => {
    expect((await send(PV, { cookie: "sa_owner=1" })).status).toBe(204);
    await send(PV, { cookie: `theme=dark; sa_admin=${createSessionToken()}` });
    expect(recordBeacon).not.toHaveBeenCalled();
    expect(beaconAllowed).not.toHaveBeenCalled(); // not even the rate limiter's INCR
  });

  it("writes nothing outside production unless ANALYTICS_IN_DEV=1", async () => {
    vi.stubEnv("ANALYTICS_IN_DEV", "");
    await send(PV);
    expect(recordBeacon).not.toHaveBeenCalled();
  });

  it("drops bots, foreign origins, malformed and oversized beacons before any command", async () => {
    await send(PV, { "user-agent": "curl/8.0.1" });
    await send(PV, { origin: "https://evil.example" });
    await send({ t: "eng", path: "/", ms: -5 });
    await send("not json");
    // No Origin at all (a script, not a browser POST).
    const bare = await track(
      new Request(`${ORIGIN}/api/track`, {
        method: "POST",
        headers: { "user-agent": CHROME },
        body: JSON.stringify(PV),
      }),
    );
    expect(bare.status).toBe(204);
    await send({ t: "pv", path: "/", referrer: `https://x.com/${"a".repeat(5000)}` });
    expect(recordBeacon).not.toHaveBeenCalled();
    expect(beaconAllowed).not.toHaveBeenCalled(); // not even the rate limiter's INCR
  });
});

describe("POST /api/admin/login", () => {
  // Each test signs in from its own IP: the in-memory limiter allows 5 per 10 minutes.
  let n = 0;
  const signIn = (password: string, ip = `198.51.100.${++n}`) =>
    login(
      new Request(`${ORIGIN}/api/admin/login`, {
        method: "POST",
        headers: { origin: ORIGIN, "content-type": "application/json", "x-forwarded-for": ip },
        body: JSON.stringify({ password }),
      }),
    );

  it("answers a wrong password with 401 and no cookie", async () => {
    const res = await signIn("wrong-horse");
    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it("signs in with an HttpOnly session and marks the owner's browser for a year", async () => {
    const res = await signIn("correct-horse");
    expect(res.status).toBe(200);
    const cookies = res.headers.getSetCookie();
    const session = cookies.find((c) => c.startsWith("sa_admin="));
    expect(session).toContain("HttpOnly");
    expect(session).toContain("SameSite=Lax");
    expect(session).toContain("Max-Age=43200");
    const owner = cookies.find((c) => c.startsWith("sa_owner=1;"));
    expect(owner).toContain("HttpOnly");
    expect(owner).toContain("Max-Age=31536000");
  });

  it("answers 429 past the limit, even to the right password", async () => {
    const ip = "198.51.100.200";
    for (let i = 0; i < 5; i++) expect((await signIn("wrong-horse", ip)).status).toBe(401);
    expect((await signIn("correct-horse", ip)).status).toBe(429);
    // The shared (Redis) counter refuses on its own too.
    vi.mocked(loginAllowed).mockResolvedValueOnce(false);
    expect((await signIn("correct-horse")).status).toBe(429);
  });

  it("still signs in when Redis is down: the shared limiter fails open, never a 500", async () => {
    const real =
      await vi.importActual<typeof import("@/lib/analytics/limit")>("@/lib/analytics/limit");
    vi.mocked(loginAllowed).mockImplementationOnce(real.loginAllowed);
    vi.mocked(loginAllowed).mockImplementationOnce(real.loginAllowed);
    expect((await signIn("wrong-horse")).status).toBe(401); // the form's "wrong password"
    expect((await signIn("correct-horse")).status).toBe(200);
  });
});
