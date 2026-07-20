import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import {
  geoFrom,
  isBotRequest,
  normalizePath,
  normalizeReferrer,
} from "@/lib/analytics/collect";
import { visitorHash, dayKey, monthKey } from "@/lib/analytics/store";
import {
  createSessionToken,
  verifySessionToken,
  passwordMatches,
} from "@/lib/analytics/auth";

describe("analytics/collect", () => {
  it("treats crawlers and non-browsers as bots, real browsers as human", () => {
    const chrome =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
    expect(isBotRequest(chrome)).toBe(false);
    expect(isBotRequest("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBotRequest("curl/8.0.1")).toBe(true);
    expect(isBotRequest("")).toBe(true); // no UA is never a real visitor
  });

  it("normalizes paths and strips query/hash", () => {
    const slugs = ["scrapegpt", "aigram"];
    expect(normalizePath("/projects?utm_source=x", slugs)).toBe("/projects");
    expect(normalizePath("/projects#top", slugs)).toBe("/projects");
    expect(normalizePath("/projects/", slugs)).toBe("/projects");
    expect(normalizePath("projects", slugs)).toBe("/projects");
    expect(normalizePath("", slugs)).toBe("/");
    expect(normalizePath("/", slugs)).toBe("/");
    expect(normalizePath("/projects/scrapegpt", slugs)).toBe("/projects/scrapegpt");
  });

  it("folds unknown paths into one bucket so a flood can't grow the store", () => {
    const slugs = ["scrapegpt"];
    // Unknown routes and invented slugs must NOT become new hash fields.
    expect(normalizePath("/projects/not-a-real-project", slugs)).toBe("Other");
    expect(normalizePath("/random-page", slugs)).toBe("Other");
    expect(normalizePath("/a/b/c/d", slugs)).toBe("Other");
    // The attack this defends against: many distinct paths → still one field.
    const flood = Array.from({ length: 500 }, (_, i) => normalizePath(`/spam-${i}`, slugs));
    expect(new Set(flood).size).toBe(1);
  });

  it("bounds referrer hosts and rejects malformed ones", () => {
    expect(normalizeReferrer(`https://${"a".repeat(300)}.com/x`, "sinaamareh.ir")).toBe(
      "Other",
    );
  });

  it("reduces referrers to a bare host and treats self/invalid as Direct", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=secret", "sinaamareh.ir")).toBe(
      "google.com",
    );
    expect(normalizeReferrer("https://sinaamareh.ir/projects", "sinaamareh.ir")).toBe("Direct");
    expect(normalizeReferrer("https://www.sinaamareh.ir/x", "sinaamareh.ir")).toBe("Direct");
    expect(normalizeReferrer("", "sinaamareh.ir")).toBe("Direct");
    expect(normalizeReferrer("not-a-url", "sinaamareh.ir")).toBe("Direct");
  });

  it("reads geo from Vercel headers and rejects malformed values", () => {
    const ok = geoFrom(
      new Headers({ "x-vercel-ip-country": "de", "x-vercel-ip-timezone": "Europe/Berlin" }),
    );
    expect(ok).toEqual({ country: "DE", timezone: "Europe/Berlin" });

    const bad = geoFrom(
      new Headers({ "x-vercel-ip-country": "GERMANY", "x-vercel-ip-timezone": "nonsense" }),
    );
    expect(bad).toEqual({ country: "Unknown", timezone: "Unknown" });

    expect(geoFrom(new Headers())).toEqual({ country: "Unknown", timezone: "Unknown" });
  });
});

describe("analytics/store", () => {
  it("hashes visitors deterministically per salt, and unlinkably across salts", () => {
    const a = visitorHash("salt-1", "1.2.3.4", "UA", "host");
    expect(visitorHash("salt-1", "1.2.3.4", "UA", "host")).toBe(a);
    // Different person, same salt.
    expect(visitorHash("salt-1", "9.9.9.9", "UA", "host")).not.toBe(a);
    // Same person after the salt rotates — the whole point of rotation.
    expect(visitorHash("salt-2", "1.2.3.4", "UA", "host")).not.toBe(a);
    // The raw IP must not be recoverable from the stored value.
    expect(a).not.toContain("1.2.3.4");
    expect(a).toMatch(/^[a-f0-9]{32}$/);
  });

  it("buckets by UTC date so keys don't shift with server locale", () => {
    const d = new Date("2026-07-13T23:30:00Z");
    expect(dayKey(d)).toBe("2026-07-13");
    expect(monthKey(d)).toBe("2026-07");
  });
});

describe("analytics/auth", () => {
  const OLD = process.env.ADMIN_PASSWORD;
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-horse";
    delete process.env.ADMIN_SESSION_SECRET;
  });
  afterEach(() => {
    process.env.ADMIN_PASSWORD = OLD;
  });

  it("accepts the right password and rejects wrong ones (incl. length mismatch)", () => {
    expect(passwordMatches("correct-horse")).toBe(true);
    expect(passwordMatches("wrong-horse!!")).toBe(false);
    expect(passwordMatches("short")).toBe(false);
    expect(passwordMatches("")).toBe(false);
  });

  it("refuses everything when no password is configured", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(passwordMatches("")).toBe(false);
    expect(passwordMatches("anything")).toBe(false);
    expect(verifySessionToken(createSessionToken())).toBe(false);
  });

  it("round-trips a session token and rejects tampering or expiry", () => {
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);

    const [exp, nonce, mac] = token.split(".");
    // Extending the expiry without re-signing must fail.
    expect(verifySessionToken(`${Number(exp) + 60_000}.${nonce}.${mac}`)).toBe(false);
    // Garbage signature, wrong shape, and empty all fail.
    expect(verifySessionToken(`${exp}.${nonce}.deadbeef`)).toBe(false);
    expect(verifySessionToken("nope")).toBe(false);
    expect(verifySessionToken(undefined)).toBe(false);
    // Expired token.
    expect(verifySessionToken(createSessionToken(Date.now() - 48 * 3600 * 1000))).toBe(false);
  });

  it("invalidates existing sessions when the password changes", () => {
    const token = createSessionToken();
    expect(verifySessionToken(token)).toBe(true);
    process.env.ADMIN_PASSWORD = "a-brand-new-password";
    expect(verifySessionToken(token)).toBe(false);
  });

  it("never signs cookies with the raw password (a leaked cookie must not be a cracking oracle)", () => {
    const token = createSessionToken();
    const mac = token.split(".")[2]!;
    // The signature must not be derivable from the password directly.
    const naive = createHmac("sha256", "correct-horse")
      .update(token.split(".").slice(0, 2).join("."))
      .digest("hex");
    expect(mac).not.toBe(naive);
  });

  it("prefers an explicit ADMIN_SESSION_SECRET when set", () => {
    const withDerived = createSessionToken(1_000_000);
    process.env.ADMIN_SESSION_SECRET = "a-separate-long-random-secret";
    const withExplicit = createSessionToken(1_000_000);
    // Same payload timestamp, different key → different signature.
    expect(withExplicit.split(".")[2]).not.toBe(withDerived.split(".")[2]);
    // And a token signed with the old key no longer verifies.
    expect(verifySessionToken(withDerived)).toBe(false);
  });
});
