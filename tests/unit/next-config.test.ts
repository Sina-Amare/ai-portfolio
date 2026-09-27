// @vitest-environment node
import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";
import vercel from "@/vercel.json";

describe("next.config", () => {
  it("sends baseline security headers on every route and hides X-Powered-By", async () => {
    expect(nextConfig.poweredByHeader).toBe(false);
    const [rule] = await nextConfig.headers!();
    expect(rule!.source).toBe("/:path*");
    expect(Object.fromEntries(rule!.headers.map((h) => [h.key, h.value]))).toEqual({
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
  });
});

describe("vercel.json", () => {
  it("runs the unit tests before the build, so a red test blocks the deploy", () => {
    // Pushing main deploys; GitHub Actions results don't stop Vercel.
    expect(vercel.buildCommand).toMatch(/^npm test && /);
    expect(vercel.crons).toContainEqual({ path: "/api/cron/digest", schedule: "0 7 * * *" });
  });
});
