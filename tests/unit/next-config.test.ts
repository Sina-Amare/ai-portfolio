// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
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

  it("runs them without the deploy's secrets or tuned limits", () => {
    // vitest.config.ts drops every variable .env.example documents; CI sets fakes
    // to prove it. A variable the code reads but the file misses would slip through.
    const example = readFileSync(".env.example", "utf8");
    const files = ["app", "lib", "scripts"]
      .flatMap((dir) =>
        readdirSync(dir, { recursive: true, encoding: "utf8" }).map((f) => `${dir}/${f}`),
      )
      .concat("proxy.ts")
      .filter((f) => /\.tsx?$/.test(f));
    const read = new Set(
      files.flatMap((f) =>
        [...readFileSync(f, "utf8").matchAll(/process\.env\.([A-Z]\w*)/g)].map((m) => m[1]),
      ),
    );
    read.delete("NODE_ENV"); // pinned to "test" instead
    expect(read.size).toBeGreaterThan(15);
    for (const name of read) {
      expect(example, `${name} is missing from .env.example`).toContain(name);
      expect(process.env[name], name).toBeUndefined();
    }
    expect(Object.keys(process.env).filter((k) => /REST(_API)?_(URL|TOKEN)$/.test(k))).toEqual([]);
  });
});
