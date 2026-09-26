/**
 * The v2 read side: everything /admin needs for a 7/30/90-day range.
 *
 * Two round trips and a bounded number of commands: one hash per day in the
 * range, the old per-pageview counter only for days up to v2's first, one hash
 * per month touched, two set sizes and at most 50 visit records (about 90 for
 * the default 30 days, under 250 for 90). Never throws: an outage or a spent
 * quota returns a degraded, empty result and /admin shows a notice.
 */
import { SECTIONS, type Section } from "./beacon";
import { BUCKET_LABELS } from "./session";
import {
  type Breakdown,
  dayKey,
  K,
  monthKey,
  monthsFor,
  orderWeekdays,
  redis,
  toBreakdown,
} from "./store";

const RECENT_SHOWN = 50;

export type DayStats = { day: string; visits: number; engaged: number; pageviews: number };
export type PageStats = { path: string; views: number; avgMs: number };
export type SectionStats = { section: Section; visits: number; reachPct: number; avgMs: number };
export type EventStats = { name: string; count: number; props: Breakdown };

export type RecentVisit = {
  id: string;
  start: number;
  last: number;
  country: string;
  city: string;
  device: string;
  browser: string;
  lang: string;
  referrer: string;
  entry: string;
  /** Page sequence, first 20. */
  pages: string[];
  pageCount: number;
  activeMs: number;
  sections: { section: string; ms: number }[];
  /** "name" or "name:prop" with its count. */
  events: { name: string; count: number }[];
  returning: boolean;
  engaged: boolean;
};

export type Insights = {
  enabled: boolean;
  degraded: boolean;
  range: number;
  /** First day with visit data; older days only have page views. */
  since: string | null;
  /** Months the breakdowns cover: they are stored per month, not per day (gap-5). */
  months: string[];
  kpis: {
    visits: number;
    engaged: number;
    engagementRate: number;
    /** This calendar month (the visitor salt is monthly). */
    uniqueVisitors: number;
    /** This calendar month: visitors with 2+ visits. */
    returningVisitors: number;
    returningVisits: number;
    avgEngagedMs: number;
    /** Page views ÷ visits over the same days (gap-1: both sides one period). */
    pagesPerVisit: number;
    /** Includes the old per-pageview counter for days before `since`. */
    pageviews: number;
    chatQuestions: number;
    contactSubmits: number;
  };
  series: DayStats[];
  timeBuckets: Breakdown;
  /** By average active time. */
  pages: PageStats[];
  /** In page order; reach is a share of all visits in `months`. */
  sections: SectionStats[];
  events: EventStats[];
  chat: { outcomes: Breakdown; topics: Breakdown; chip: number; typed: number };
  /** Counted once per visit. */
  acquisition: {
    referrers: Breakdown;
    entryPages: Breakdown;
    countries: Breakdown;
    cities: Breakdown;
    devices: Breakdown;
    browsers: Breakdown;
    hours: Breakdown;
    weekdays: Breakdown;
    languages: Breakdown;
    timezones: Breakdown;
  };
  /** Newest first. */
  recent: RecentVisit[];
};

type Hash = Record<string, unknown>;
const num = (x: unknown) => Number(x) || 0;
const str = (x: unknown) => (x == null ? "" : String(x));
const asHash = (x: unknown): Hash => (x && typeof x === "object" ? (x as Hash) : {});

function emptyInsights(days: number, enabled: boolean, degraded: boolean): Insights {
  const none: Breakdown = [];
  return {
    enabled,
    degraded,
    range: days,
    since: null,
    months: [],
    kpis: {
      visits: 0,
      engaged: 0,
      engagementRate: 0,
      uniqueVisitors: 0,
      returningVisitors: 0,
      returningVisits: 0,
      avgEngagedMs: 0,
      pagesPerVisit: 0,
      pageviews: 0,
      chatQuestions: 0,
      contactSubmits: 0,
    },
    series: [],
    timeBuckets: [],
    pages: [],
    sections: [],
    events: [],
    chat: { outcomes: none, topics: none, chip: 0, typed: 0 },
    acquisition: {
      referrers: none,
      entryPages: none,
      countries: none,
      cities: none,
      devices: none,
      browsers: none,
      hours: none,
      weekdays: none,
      languages: none,
      timezones: none,
    },
    recent: [],
  };
}

function toRecent(id: string, h: Hash): RecentVisit {
  const sections: RecentVisit["sections"] = [];
  const events: RecentVisit["events"] = [];
  for (const [field, value] of Object.entries(h)) {
    if (field.startsWith("s:")) sections.push({ section: field.slice(2), ms: num(value) });
    else if (field.startsWith("e:")) events.push({ name: field.slice(2), count: num(value) });
  }
  return {
    id,
    start: num(h.start),
    last: num(h.last),
    country: str(h.country),
    city: str(h.city),
    device: str(h.device),
    browser: str(h.browser),
    lang: str(h.lang),
    referrer: str(h.ref),
    entry: str(h.entry),
    pages: str(h.seq).split(" ").filter(Boolean),
    pageCount: num(h.pages),
    activeMs: num(h.ms),
    sections,
    events,
    returning: num(h.ret) === 1,
    engaged: num(h.eng) === 1,
  };
}

export async function getInsights(days = 30, now = new Date()): Promise<Insights> {
  const r = redis();
  if (!r) return emptyInsights(days, false, false);

  try {
    const dayList: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      dayList.push(dayKey(d));
    }
    const months = monthsFor(dayList);
    const month = monthKey(now);

    const first = r.pipeline();
    first.get(K.since);
    first.lrange(K.recent, 0, RECENT_SHOWN - 1);
    const [sinceRaw, idsRaw] = (await first.exec()) as unknown[];
    const since = sinceRaw ? str(sinceRaw) : null;
    const ids = Array.isArray(idsRaw) ? idsRaw.map(str) : [];
    // Days up to v2's first also have page views in the v1 counter.
    const legacyDays = dayList.filter((d) => !since || d <= since);

    const p = r.pipeline();
    for (const d of dayList) p.hgetall(K.day(d));
    for (const d of legacyDays) p.get(K.views(d));
    for (const m of months) p.hgetall(K.month(m));
    p.scard(K.seen(month));
    p.scard(K.ret(month));
    for (const id of ids) p.hgetall(K.sess(id));
    const res = (await p.exec()) as unknown[];
    let at = 0;
    const take = (n: number) => res.slice(at, (at += n));

    const perDay = take(dayList.length).map(asHash);
    const legacy = new Map(take(legacyDays.length).map((v, i) => [legacyDays[i]!, num(v)]));
    const merged = new Map<string, number>();
    for (const h of take(months.length).map(asHash)) {
      for (const [field, v] of Object.entries(h))
        merged.set(field, (merged.get(field) ?? 0) + num(v));
    }
    const [uniqueVisitors, returningVisitors] = take(2).map(num);
    const sessions = take(ids.length);

    const sum = (field: string) => perDay.reduce((a, h) => a + num(h[field]), 0);
    const m = (field: string) => merged.get(field) ?? 0;
    /** Fields `<prefix>:<label>` of the merged month hashes, as { label: count }. */
    const group = (prefix: string): Hash => {
      const out: Hash = {};
      for (const [field, v] of merged) {
        if (field.startsWith(`${prefix}:`)) out[field.slice(prefix.length + 1)] = v;
      }
      return out;
    };
    const top = (prefix: string, limit?: number) => toBreakdown([group(prefix)], limit);

    const series = dayList.map((day, i) => ({
      day,
      visits: num(perDay[i]!.visits),
      engaged: num(perDay[i]!.engaged),
      pageviews: num(perDay[i]!.pages) + (legacy.get(day) ?? 0),
    }));
    const visits = sum("visits");
    const engaged = sum("engaged");
    const monthVisits = m("visits");

    const pageTime = group("pms");
    const pages = Object.entries(group("pv"))
      .map(([path, views]) => ({
        path,
        views: num(views),
        avgMs: Math.round(num(pageTime[path]) / num(views)),
      }))
      .sort((a, b) => b.avgMs - a.avgMs)
      .slice(0, 12);

    const events = new Map<string, EventStats>();
    for (const [key, count] of Object.entries(group("ev"))) {
      const [name, prop] = key.split(":") as [string, string?];
      const e = events.get(name) ?? { name, count: 0, props: [] };
      e.count += num(count);
      if (prop) e.props.push({ label: prop, count: num(count) });
      events.set(name, e);
    }

    return {
      enabled: true,
      degraded: false,
      range: days,
      since,
      months,
      kpis: {
        visits,
        engaged,
        engagementRate: visits ? engaged / visits : 0,
        uniqueVisitors,
        returningVisitors,
        returningVisits: sum("returning"),
        avgEngagedMs: engaged ? Math.round(sum("ems") / engaged) : 0,
        pagesPerVisit: visits ? sum("pages") / visits : 0,
        pageviews: series.reduce((a, d) => a + d.pageviews, 0),
        chatQuestions: sum("chat"),
        contactSubmits: sum("contact"),
      },
      series,
      timeBuckets: BUCKET_LABELS.map((label, b) => ({ label, count: sum(`b${b}`) })),
      pages,
      sections: SECTIONS.map((section) => {
        const reached = m(`sr:${section}`);
        return {
          section,
          visits: reached,
          reachPct: monthVisits ? reached / monthVisits : 0,
          avgMs: reached ? Math.round(m(`sms:${section}`) / reached) : 0,
        };
      }),
      events: [...events.values()]
        .map((e) => ({ ...e, props: e.props.sort((a, b) => b.count - a.count) }))
        .sort((a, b) => b.count - a.count),
      chat: {
        outcomes: top("chat"),
        topics: top("topic"),
        chip: m("ask:chip"),
        typed: m("ask:typed"),
      },
      acquisition: {
        referrers: top("ref"),
        entryPages: top("entry"),
        countries: top("co"),
        cities: top("city"),
        devices: top("dev", 5),
        browsers: top("br", 6),
        hours: top("hr", 24).sort((a, b) => a.label.localeCompare(b.label)),
        weekdays: orderWeekdays(top("wd", 7)),
        languages: top("lang"),
        timezones: top("tz"),
      },
      recent: ids.flatMap((id, i) => (sessions[i] ? [toRecent(id, asHash(sessions[i]))] : [])),
    };
  } catch {
    return emptyInsights(days, true, true);
  }
}
