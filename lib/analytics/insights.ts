/**
 * The v2 read side: everything /admin needs for a 7/30/90-day range.
 *
 * Two round trips and a bounded number of commands: one hash per day in the
 * range, the old per-pageview counter only for days up to v2's first, one hash
 * per month touched, two set sizes and at most 50 visit records (about 90 for
 * the default 30 days, under 250 for 90). Never throws: an outage or a spent
 * quota returns a degraded, empty result and /admin shows a notice.
 */
import { SECTION_PAGE, SECTIONS, type Section } from "./beacon";
import { BUCKET_LABELS, CHAT_LOG_DAYS, type ChatLogEntry } from "./session";
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

export type DayStats = {
  day: string;
  visits: number;
  engaged: number;
  pageviews: number;
  /** Active time of the day's engaged visits. */
  engagedMs: number;
};
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
  /** When this was read (epoch ms): "3 hours ago" is relative to it. */
  at: number;
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
  /**
   * In page order. Reach is a share of the visits in `months` that opened the
   * section's page (home, /projects, a case study), so a visit that landed on a
   * case study isn't a drop-off in the home funnel.
   */
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

function emptyInsights(days: number, now: Date, enabled: boolean, degraded: boolean): Insights {
  const none: Breakdown = [];
  return {
    enabled,
    degraded,
    range: days,
    at: now.getTime(),
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

/** `recentShown` visit records are read (one command each); the digest asks for more. */
export async function getInsights(
  days = 30,
  now = new Date(),
  recentShown = RECENT_SHOWN,
): Promise<Insights> {
  const r = redis();
  if (!r) return emptyInsights(days, now, false, false);

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
    first.lrange(K.recent, 0, recentShown - 1);
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
      engagedMs: num(perDay[i]!.ems),
    }));
    const visits = sum("visits");
    const engaged = sum("engaged");

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
      at: now.getTime(),
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
        const opened = m(`vk:${SECTION_PAGE[section]}`);
        return {
          section,
          visits: reached,
          reachPct: opened ? reached / opened : 0,
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
    return emptyInsights(days, now, true, true);
  }
}

/** Conversations shown by default; `?conv=` asks for more, up to CONV_MAX. */
export const CONV_SHOWN = 50;
export const CONV_MAX = 200;

/** One visit's chat, or one turn whose visit wasn't found. */
export type Conversation = {
  /** The visit id, or `turn-<n>` for a turn without one. */
  id: string;
  visit: RecentVisit | null;
  /** Oldest first. */
  turns: ChatLogEntry[];
};
export type Conversations = {
  /** Newest conversation first. */
  list: Conversation[];
  /** Older conversations exist in the range. */
  more: boolean;
  /** Days actually read: transcripts only live CHAT_LOG_DAYS. */
  days: number;
  degraded: boolean;
};

function asEntry(x: unknown): ChatLogEntry | null {
  // Upstash parses JSON elements itself; a string is one it couldn't.
  if (typeof x === "string") {
    try {
      x = JSON.parse(x);
    } catch {
      return null;
    }
  }
  const e = x as ChatLogEntry | null;
  return e && typeof e.question === "string" && typeof e.reply === "string" ? e : null;
}

/**
 * The newest `limit` chat conversations in the last `days` (at most the 30 days
 * transcripts are kept), grouped by visit. Reads a week of day lists per round
 * trip, newest first, and stops once it knows more than `limit` conversations,
 * then one visit record per conversation. Never throws.
 *
 * ponytail: a conversation crossing a week boundary at the very end of the list
 * can miss its older turns; read one more week if that ever shows.
 */
export async function getConversations(
  days = 30,
  limit = CONV_SHOWN,
  now = new Date(),
): Promise<Conversations> {
  const span = Math.min(days, CHAT_LOG_DAYS);
  const r = redis();
  if (!r) return { list: [], more: false, days: span, degraded: false };
  try {
    const byId = new Map<string, Conversation>();
    let lone = 0;
    for (let i = 0; i < span && byId.size <= limit; i += 7) {
      const p = r.pipeline();
      for (let j = i; j < Math.min(i + 7, span); j++) {
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - j);
        p.lrange(K.chat(dayKey(d)), 0, -1);
      }
      for (const list of (await p.exec()) as unknown[]) {
        for (const raw of Array.isArray(list) ? list : []) {
          const e = asEntry(raw);
          if (!e) continue;
          const id = e.sid || `turn-${lone++}`;
          const c = byId.get(id) ?? { id, visit: null, turns: [] };
          c.turns.push(e);
          byId.set(id, c);
        }
      }
    }
    const list = [...byId.values()].slice(0, limit);
    for (const c of list) c.turns.reverse();

    const linked = list.filter((c) => !c.id.startsWith("turn-"));
    if (linked.length) {
      const p = r.pipeline();
      for (const c of linked) p.hgetall(K.sess(c.id));
      const visits = (await p.exec()) as unknown[];
      linked.forEach((c, i) => {
        if (visits[i]) c.visit = toRecent(c.id, asHash(visits[i]));
      });
    }
    return { list, more: byId.size > limit, days: span, degraded: false };
  } catch {
    return { list: [], more: false, days: span, degraded: true };
  }
}
