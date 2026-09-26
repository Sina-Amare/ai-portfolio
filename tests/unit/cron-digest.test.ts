// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/cron/digest/route";

afterEach(() => {
  vi.unstubAllEnvs();
});

const call = (headers: Record<string, string>) =>
  GET(new Request("http://localhost/api/cron/digest", { headers }));

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
});
