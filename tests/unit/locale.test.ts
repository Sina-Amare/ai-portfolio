import { describe, it, expect } from "vitest";
import { hasLocale, localizedPath, preferredLocale, stripLocale, toLocale } from "@/lib/locale";

describe("localizedPath", () => {
  it("leaves English unprefixed", () => {
    expect(localizedPath("/", "en")).toBe("/");
    expect(localizedPath("/projects/scrapegpt", "en")).toBe("/projects/scrapegpt");
  });

  it("prefixes Persian with /fa and never adds a trailing slash", () => {
    expect(localizedPath("/", "fa")).toBe("/fa");
    expect(localizedPath("/#about", "fa")).toBe("/fa#about");
    expect(localizedPath("/?q=1", "fa")).toBe("/fa?q=1");
    expect(localizedPath("/projects", "fa")).toBe("/fa/projects");
    expect(localizedPath("/projects#workplace", "fa")).toBe("/fa/projects#workplace");
    expect(localizedPath("/admin?range=7", "fa")).toBe("/fa/admin?range=7");
  });
});

describe("stripLocale", () => {
  it("removes a locale prefix and round-trips localizedPath", () => {
    expect(stripLocale("/fa")).toBe("/");
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/fa/projects")).toBe("/projects");
    expect(stripLocale("/en/projects/scrapegpt")).toBe("/projects/scrapegpt");
    expect(stripLocale("/projects")).toBe("/projects");
    for (const p of ["/", "/projects", "/projects/scrapegpt", "/privacy"]) {
      expect(stripLocale(localizedPath(p, "fa"))).toBe(p);
    }
  });

  it("only strips a whole segment", () => {
    expect(stripLocale("/enterprise")).toBe("/enterprise");
    expect(stripLocale("/fast")).toBe("/fast");
  });
});

describe("preferredLocale", () => {
  it("picks the highest-weighted supported language", () => {
    expect(preferredLocale("fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("fa");
    expect(preferredLocale("en-US,en;q=0.9,fa;q=0.8")).toBe("en");
    expect(preferredLocale("en;q=0.5, fa;q=0.8")).toBe("fa");
    expect(preferredLocale("de-DE,fa;q=0.5")).toBe("fa");
  });

  it("defaults to English for missing, unsupported or zero-weighted input", () => {
    expect(preferredLocale(null)).toBe("en");
    expect(preferredLocale("")).toBe("en");
    expect(preferredLocale("*")).toBe("en");
    expect(preferredLocale("de,fr;q=0.9")).toBe("en");
    expect(preferredLocale("fa;q=0")).toBe("en");
    expect(preferredLocale("fa;q=abc")).toBe("en");
  });

  it("keeps header order on ties", () => {
    expect(preferredLocale("en,fa")).toBe("en");
    expect(preferredLocale("fa,en")).toBe("fa");
  });
});

describe("hasLocale / toLocale", () => {
  it("accepts only supported locales", () => {
    expect(hasLocale("fa")).toBe(true);
    expect(hasLocale("de")).toBe(false);
    expect(toLocale("fa")).toBe("fa");
    expect(toLocale("xx")).toBe("en");
  });
});
