// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";
import { sameOrigin } from "@/lib/http";

const from = (origin?: string) =>
  new Request("https://sinaamareh.ir/api/contact", {
    method: "POST",
    headers: origin ? { origin } : {},
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("sameOrigin", () => {
  it("accepts the site (with or without www) and refuses other or missing origins", () => {
    expect(sameOrigin(from("https://sinaamareh.ir"), "sinaamareh.ir")).toBe(true);
    expect(sameOrigin(from("https://www.sinaamareh.ir"), "sinaamareh.ir")).toBe(true);
    expect(sameOrigin(from("https://evil.example"), "sinaamareh.ir")).toBe(false);
    expect(sameOrigin(from(), "sinaamareh.ir")).toBe(false);
  });

  it("without a host, also trusts the host the request was sent to (a preview URL)", () => {
    vi.stubEnv("NODE_ENV", "production");
    const to = (origin: string) =>
      new Request("https://portfolio-git-x.vercel.app/api/contact", {
        method: "POST",
        headers: { origin },
      });
    expect(sameOrigin(to("https://portfolio-git-x.vercel.app"))).toBe(true);
    expect(sameOrigin(to("https://evil.example"))).toBe(false);
  });

  it("trusts localhost only outside production", () => {
    expect(sameOrigin(from("http://localhost:3000"), "sinaamareh.ir")).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    expect(sameOrigin(from("http://localhost:3000"), "sinaamareh.ir")).toBe(false);
  });
});
