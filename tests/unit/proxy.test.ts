// @vitest-environment node
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import {
  getRedirectUrl,
  getRewrittenUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";
import { config, proxy } from "@/proxy";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

function run(path: string, init: { headers?: Record<string, string>; method?: string } = {}) {
  const req = new NextRequest(`https://sinaamareh.ir${path}`, {
    method: init.method ?? "GET",
    headers: { "user-agent": CHROME, ...init.headers },
  });
  return proxy(req);
}

describe("proxy", () => {
  it("308s /en URLs to their unprefixed canonical, keeping the query", () => {
    const res = run("/en/projects?x=1");
    expect(res.status).toBe(308);
    expect(getRedirectUrl(res)).toBe("https://sinaamareh.ir/projects?x=1");
    expect(getRedirectUrl(run("/en"))).toBe("https://sinaamareh.ir/");
  });

  it("passes /fa through untouched", () => {
    const res = run("/fa/projects", { headers: { cookie: "locale=en" } });
    expect(getRedirectUrl(res)).toBeNull();
    expect(getRewrittenUrl(res)).toBeNull();
  });

  it("rewrites unprefixed English to /en internally", () => {
    expect(getRewrittenUrl(run("/projects"))).toBe("https://sinaamareh.ir/en/projects");
    expect(getRewrittenUrl(run("/"))).toBe("https://sinaamareh.ir/en");
  });

  it("sends a Persian browser to /fa on entry", () => {
    const res = run("/projects?x=1", { headers: { "accept-language": "fa-IR,fa;q=0.9,en;q=0.8" } });
    expect(res.status).toBe(307);
    expect(getRedirectUrl(res)).toBe("https://sinaamareh.ir/fa/projects?x=1");
    expect(getRedirectUrl(run("/", { headers: { "accept-language": "fa" } }))).toBe(
      "https://sinaamareh.ir/fa",
    );
  });

  it("never redirects in-site navigation, bots, or non-GET requests", () => {
    const fa = { "accept-language": "fa-IR", cookie: "locale=fa" };
    expect(
      getRewrittenUrl(run("/projects", { headers: { ...fa, "sec-fetch-site": "same-origin" } })),
    ).toBe("https://sinaamareh.ir/en/projects");
    expect(getRewrittenUrl(run("/projects", { headers: { ...fa, "user-agent": GOOGLEBOT } }))).toBe(
      "https://sinaamareh.ir/en/projects",
    );
    expect(getRewrittenUrl(run("/projects", { headers: fa, method: "POST" }))).toBe(
      "https://sinaamareh.ir/en/projects",
    );
  });

  it("lets the toggle's cookie beat the browser language, both ways", () => {
    expect(
      getRewrittenUrl(
        run("/projects", { headers: { "accept-language": "fa-IR", cookie: "locale=en" } }),
      ),
    ).toBe("https://sinaamareh.ir/en/projects");
    expect(
      getRedirectUrl(
        run("/projects", { headers: { "accept-language": "en-US", cookie: "locale=fa" } }),
      ),
    ).toBe("https://sinaamareh.ir/fa/projects");
  });
});

describe("proxy matcher", () => {
  const matches = (url: string) => unstable_doesMiddlewareMatch({ config, url });

  it("runs on pages, including the OG image route", () => {
    for (const url of ["/", "/fa", "/projects/scrapegpt", "/admin", "/opengraph-image"]) {
      expect(matches(url), url).toBe(true);
    }
  });

  it("skips API, Next internals, the icon and static files", () => {
    for (const url of [
      "/api/chat",
      "/api/track",
      "/_next/static/chunks/app.js",
      "/icon",
      "/sitemap.xml",
      "/robots.txt",
      "/manifest.webmanifest",
      "/resume.pdf",
      "/projects/aigram/a.png",
    ]) {
      expect(matches(url), url).toBe(false);
    }
  });
});
