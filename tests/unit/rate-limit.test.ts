import { describe, it, expect } from "vitest";
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

  it("globalDailyOk allows a request initially", () => {
    expect(globalDailyOk(1000)).toBe(true);
  });
});
