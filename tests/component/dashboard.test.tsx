import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Dashboard } from "@/components/analytics/dashboard";
import type { Insights } from "@/lib/analytics/insights";

const AT = Date.parse("2026-09-27T12:00:00Z");

const insights: Insights = {
  enabled: true,
  degraded: false,
  range: 30,
  at: AT,
  since: "2026-09-20",
  months: ["2026-08", "2026-09"],
  kpis: {
    visits: 20,
    engaged: 12,
    engagementRate: 0.6,
    uniqueVisitors: 15,
    returningVisitors: 3,
    returningVisits: 4,
    avgEngagedMs: 125_000,
    pagesPerVisit: 1.8,
    pageviews: 36,
    chatQuestions: 9,
    contactSubmits: 1,
  },
  series: [
    { day: "2026-09-26", visits: 14, engaged: 9, pageviews: 25 },
    { day: "2026-09-27", visits: 6, engaged: 3, pageviews: 11 },
  ],
  timeBuckets: [
    { label: "<10s", count: 8 },
    { label: "10–30s", count: 4 },
    { label: "30s–1m", count: 3 },
    { label: "1–3m", count: 3 },
    { label: "3–10m", count: 2 },
    { label: "10m+", count: 0 },
  ],
  pages: [{ path: "/projects/scrapegpt", views: 5, avgMs: 90_000 }],
  sections: [
    { section: "hero", visits: 18, reachPct: 1, avgMs: 20_000 },
    { section: "about", visits: 6, reachPct: 0.33, avgMs: 15_000 },
    { section: "case-study", visits: 5, reachPct: 1, avgMs: 60_000 },
  ],
  events: [
    {
      name: "outbound",
      count: 3,
      props: [
        { label: "github", count: 2 },
        { label: "linkedin", count: 1 },
      ],
    },
    { name: "resume_download", count: 2, props: [] },
  ],
  chat: {
    outcomes: [
      { label: "answered", count: 7 },
      { label: "refused", count: 2 },
    ],
    topics: [{ label: "ScrapeGPT", count: 4 }],
    chip: 5,
    typed: 4,
  },
  acquisition: {
    referrers: [
      { label: "Direct", count: 10 },
      { label: "linkedin.com", count: 6 },
    ],
    entryPages: [{ label: "/", count: 16 }],
    countries: [{ label: "NL", count: 8 }],
    cities: [{ label: "Amsterdam, NL", count: 8 }],
    devices: [{ label: "Mobile", count: 11 }],
    browsers: [{ label: "Chrome", count: 14 }],
    hours: [{ label: "09:00", count: 5 }],
    weekdays: [{ label: "Mon", count: 7 }],
    languages: [{ label: "fa", count: 4 }],
    timezones: [{ label: "Europe/Amsterdam", count: 8 }],
  },
  recent: [
    {
      id: "2026-09-27_abc",
      start: AT - 3 * 3_600_000,
      last: AT - 3 * 3_600_000 + 200_000,
      country: "NL",
      city: "Amsterdam, NL",
      device: "Desktop",
      browser: "Chrome",
      lang: "en",
      referrer: "linkedin.com",
      entry: "/",
      pages: ["/", "/projects/scrapegpt"],
      pageCount: 2,
      activeMs: 185_000,
      sections: [
        { section: "case-study", ms: 60_000 },
        { section: "hero", ms: 20_000 },
      ],
      events: [
        { name: "chat_ask:chip", count: 2 },
        { name: "resume_download", count: 1 },
      ],
      returning: true,
      engaged: true,
    },
  ],
};

describe("Dashboard", () => {
  it("renders engagement, sections, actions and the visit log from getInsights", () => {
    render(<Dashboard data={insights} locale="en" />);
    expect(screen.getByText("Engaged visits").nextSibling).toHaveTextContent("12");
    expect(screen.getByText(/60% of all visits/)).toBeInTheDocument();
    expect(screen.getByText("Avg active time").nextSibling).toHaveTextContent("2m 5s");
    // gap-5: breakdowns say which months they cover.
    expect(screen.getByText("Aug 2026 – Sep 2026")).toBeInTheDocument();
    expect(screen.getByText(/Peak:/).textContent).toContain("Sep 26");
    expect(screen.getByText("100% · avg 20s")).toBeInTheDocument();
    expect(screen.getByText("GitHub profile")).toBeInTheDocument();
    // The visit log: where, when, badges, what was seen and done.
    expect(screen.getAllByText("🇳🇱 Amsterdam").length).toBeGreaterThan(0);
    expect(screen.getByText("3 hours ago")).toBeInTheDocument();
    expect(screen.getByText("Returning")).toBeInTheDocument();
    expect(screen.getByText("/ → /projects/scrapegpt")).toBeInTheDocument();
    expect(
      screen.getByText("Chat question · Suggested question ×2 · Résumé download"),
    ).toBeInTheDocument();
  });

  it("speaks Persian with Persian digits (gap-13)", () => {
    render(<Dashboard data={insights} locale="fa" />);
    expect(screen.getByText("بازدیدهای با تعامل").nextSibling).toHaveTextContent("۱۲");
    expect(screen.getByText(/۶۰٪/)).toBeInTheDocument();
    expect(screen.getByText("۳۰ روز")).toBeInTheDocument();
    expect(screen.getByText("اوت ۲۰۲۶ – سپتامبر ۲۰۲۶")).toBeInTheDocument();
    expect(screen.getByText("۳ ساعت پیش")).toBeInTheDocument();
    expect(screen.getByText("🇳🇱 هلند")).toBeInTheDocument();
    expect(screen.getByText("د")).toBeInTheDocument();
  });

  it("shows the outage notice instead of zeros when Redis is unreachable", () => {
    render(<Dashboard data={{ ...insights, degraded: true }} locale="en" />);
    expect(screen.getByText("Couldn't reach the datastore")).toBeInTheDocument();
    expect(screen.queryByText("Engaged visits")).toBeNull();
  });
});
