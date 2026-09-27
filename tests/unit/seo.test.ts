// @vitest-environment node
import { describe, it, expect } from "vitest";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

const copy = { title: "ScrapeGPT", description: "An LLM-assisted scraper." };

describe("pageMetadata", () => {
  it("gives every page its own canonical and the full hreflang set", () => {
    const en = pageMetadata("en", "/projects/scrapegpt", copy);
    expect(en.alternates).toEqual({
      canonical: "/projects/scrapegpt",
      languages: {
        en: "/projects/scrapegpt",
        fa: "/fa/projects/scrapegpt",
        "x-default": "/projects/scrapegpt",
      },
    });
    const fa = pageMetadata("fa", "/projects/scrapegpt", copy);
    expect(fa.alternates?.canonical).toBe("/fa/projects/scrapegpt");
    expect(fa.alternates?.languages).toEqual(en.alternates?.languages);
  });

  it("sets link-preview fields explicitly so nothing is inherited from the home page", () => {
    const m = pageMetadata("fa", "/projects/scrapegpt", copy);
    const og = m.openGraph as Record<string, unknown>;
    expect(og.url).toBe("/fa/projects/scrapegpt");
    expect(og.title).toBe("ScrapeGPT — سینا عماره");
    expect(og.siteName).toBe("سینا عماره");
    expect(og.locale).toBe("fa_IR");
    expect(og.alternateLocale).toEqual(["en_US"]);
    expect(og.images).toEqual([expect.objectContaining({ url: "/fa/opengraph-image" })]);
    const tw = m.twitter as Record<string, unknown>;
    expect(tw.title).toBe(og.title);
    expect(tw.images).toEqual(og.images);
    expect(m.title).toEqual({ absolute: "ScrapeGPT — سینا عماره" });
  });

  it("names Sina in Latin on English pages", () => {
    const m = pageMetadata("en", "/projects/scrapegpt", copy);
    expect(m.title).toEqual({ absolute: "ScrapeGPT — Sina Amareh" });
    expect((m.openGraph as Record<string, unknown>).siteName).toBe("Sina Amareh");
  });

  it("uses the home title as-is and the unprefixed OG image for English", () => {
    const m = pageMetadata("en", "/", { title: "Home title", description: "d" });
    expect(m.title).toEqual({ absolute: "Home title" });
    expect(m.alternates?.canonical).toBe("/");
    expect((m.openGraph as Record<string, unknown>).images).toEqual([
      expect.objectContaining({ url: "/opengraph-image" }),
    ]);
  });
});

describe("absoluteUrl", () => {
  it("prints the root as the bare origin, like Next's canonical", () => {
    expect(absoluteUrl("/")).toBe(new URL(site.url).origin);
    expect(absoluteUrl("/fa/projects")).toBe(`${new URL(site.url).origin}/fa/projects`);
  });
});

describe("sitemap", () => {
  it("lists every page in both languages with hreflang and no fake lastmod", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = sitemap();
    const origin = new URL(site.url).origin;
    const urls = entries.map((e) => e.url);
    expect(urls).toEqual(expect.arrayContaining([origin, `${origin}/fa`, `${origin}/privacy`]));
    expect(urls).toContain(`${origin}/fa/projects/scrapegpt`);
    expect(entries.every((e) => e.lastModified === undefined)).toBe(true);
    const fa = entries.find((e) => e.url === `${origin}/fa/projects`)!;
    expect(fa.alternates?.languages).toEqual({
      en: `${origin}/projects`,
      fa: `${origin}/fa/projects`,
      "x-default": `${origin}/projects`,
    });
  });
});

describe("opengraph-image", () => {
  it("serves the Chromium-rendered Persian card, since Satori reverses Persian word order", async () => {
    const { default: Image } = await import("@/app/[lang]/opengraph-image");
    const res = await Image({ params: Promise.resolve({ lang: "fa" }) });
    expect(res.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(bytes.slice(1, 4), (b) => String.fromCharCode(b)).join("")).toBe("PNG");
  });
});
