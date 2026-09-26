import Link from "next/link";
import type { Breakdown } from "@/lib/analytics/store";
import type { Insights, RecentVisit } from "@/lib/analytics/insights";
import { SECTION_PAGE, SECTIONS } from "@/lib/analytics/beacon";
import { cn } from "@/lib/utils";
import { localizedPath, type Locale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";

type Copy = (typeof pageCopy)[Locale]["admin"];
const RANGES = [7, 30, 90] as const;

/** "NL" → 🇳🇱, by mapping the two letters to regional-indicator code points. */
function flagOf(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/**
 * Every number, date and duration on the page, in the viewer's language: Persian
 * digits in Persian (gap-13). Gregorian months in both, because the stored
 * buckets are Gregorian UTC days and months.
 */
function formatters(locale: Locale, now: number) {
  const p = pageCopy[locale].admin;
  const tag = locale === "fa" ? "fa-IR-u-ca-gregory" : "en-US";
  const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
  const pct = new Intl.NumberFormat(tag, { style: "percent" });
  const day = new Intl.DateTimeFormat(tag, { month: "short", day: "numeric", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(tag, { month: "short", year: "numeric", timeZone: "UTC" });
  const rel = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  // Intl gives real country names for free — no lookup table to maintain.
  let regions: Intl.DisplayNames | null = null;
  try {
    regions = new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    /* very old runtime — fall back to codes */
  }

  const n = (x: number) => num.format(x);
  const country = (code: string) => {
    if (!/^[A-Z]{2}$/.test(code)) return `🌐 ${p.unknown}`;
    return `${flagOf(code)} ${regions?.of(code) ?? code}`;
  };
  return {
    n,
    pct: (x: number) => pct.format(x),
    day: (d: string) => day.format(new Date(d)),
    month: (m: string) => month.format(new Date(`${m}-01`)),
    dur(ms: number) {
      const s = Math.round(ms / 1000);
      if (s < 60) return `${n(s)}${p.sec}`;
      return `${n(Math.floor(s / 60))}${p.min} ${n(s % 60)}${p.sec}`;
    },
    ago(ts: number) {
      const s = Math.round((ts - now) / 1000);
      if (s > -60) return rel.format(s, "second");
      if (s > -3600) return rel.format(Math.round(s / 60), "minute");
      if (s > -86_400) return rel.format(Math.round(s / 3600), "hour");
      return rel.format(Math.round(s / 86_400), "day");
    },
    country,
    /** "Amsterdam, NL" → "🇳🇱 Amsterdam". */
    city(label: string) {
      const m = /^(.*), ([A-Z]{2})$/.exec(label);
      if (m) return `${flagOf(m[2]!)} ${m[1]}`;
      return label === "Unknown" ? `🌐 ${p.unknown}` : label;
    },
  };
}
type Fmt = ReturnType<typeof formatters>;

const labelOf = (map: Record<string, string>, key: string) => map[key] ?? key;

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("glass rounded-[var(--radius-card)] p-5", className)}>{children}</div>;
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </div>
      <div className="text-muted mt-1 text-xs leading-relaxed">{hint}</div>
    </Card>
  );
}

type Row = { label: string; count: number; value?: string; share?: number };

/** Horizontal bars: proportions read faster than a column of raw numbers. */
function Bars({
  title,
  note,
  rows,
  f,
  empty,
}: {
  title: string;
  /** Beside the title, e.g. the months a card covers. */
  note?: string;
  rows: Row[];
  f: Fmt;
  empty: string;
}) {
  const max = Math.max(0, ...rows.map((r) => r.count));
  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow text-[10px]">{title}</div>
        {note && <div className="text-muted text-xs">{note}</div>}
      </div>
      {rows.length === 0 || max === 0 ? (
        <p className="text-muted mt-3 text-sm">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate" dir="auto" title={r.label}>
                  {r.label}
                </span>
                <span className="text-muted shrink-0 text-xs tabular-nums">
                  {r.value ?? f.n(r.count)}
                </span>
              </div>
              <div className="bg-border/40 mt-1 h-1 overflow-hidden rounded-full">
                <div
                  className="bg-accent/60 h-full rounded-full"
                  style={{ width: `${(r.share ?? r.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/**
 * Visits vs engaged visits per day. Pure CSS, no chart dependency; 1px gaps on
 * phones so 90 bars stay visible (ui-10), and the peak day is printed because
 * touch screens can't show the bars' tooltips.
 */
function Trend({ data, f, p }: { data: Insights; f: Fmt; p: Copy }) {
  const { series } = data;
  const max = Math.max(1, ...series.map((d) => d.visits));
  const peak = series.reduce<(typeof series)[number] | null>(
    (best, d) => (d.visits > (best?.visits ?? 0) ? d : best),
    null,
  );
  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow text-[10px]">{p.trend}</div>
        <div className="text-muted flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent/25 size-2 rounded-sm" /> {p.allVisits}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent size-2 rounded-sm" /> {p.engaged}
          </span>
        </div>
      </div>
      {/* Time runs left to right in both languages, like the axis labels under it. */}
      <div dir="ltr" className="mt-4 flex h-32 items-end gap-px sm:gap-[3px]">
        {series.map((d) => (
          <div
            key={d.day}
            className="relative h-full flex-1"
            title={`${f.day(d.day)} — ${f.n(d.visits)} · ${p.engaged} ${f.n(d.engaged)}`}
          >
            <div
              className="bg-accent/25 absolute inset-x-0 bottom-0 min-h-[2px] rounded-t-sm"
              style={{ height: `${(d.visits / max) * 100}%` }}
            />
            <div
              className="bg-accent absolute inset-x-0 bottom-0 rounded-t-sm"
              style={{ height: `${(d.engaged / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div dir="ltr" className="text-muted mt-2 flex justify-between text-[11px]">
        <span>{series[0] && f.day(series[0].day)}</span>
        <span>{series.at(-1) && f.day(series.at(-1)!.day)}</span>
      </div>
      {peak && (
        <p className="text-muted mt-3 text-xs">
          {p.peak}: <span className="text-text">{f.day(peak.day)}</span>, {f.n(peak.visits)}{" "}
          {p.visitsWord} ({f.n(peak.engaged)} {p.engaged.toLowerCase()})
        </p>
      )}
      <p className="text-muted mt-1 text-xs">
        {f.n(data.kpis.pageviews)} {p.pageviews}
      </p>
    </Card>
  );
}

/**
 * When people actually read the site, in THEIR local time — derived from the
 * timezone Vercel reports, so it needs nothing from the device. Bars stay in
 * clock order; sorting a histogram by size would destroy the shape.
 */
function When({ data, f, p }: { data: Insights; f: Fmt; p: Copy }) {
  const { hours, weekdays } = data.acquisition;
  const byHour = new Map(hours.map((h) => [h.label, h.count]));
  const slots = Array.from({ length: 24 }, (_, i) => {
    const label = `${String(i).padStart(2, "0")}:00`;
    return { label, count: byHour.get(label) ?? 0 };
  });
  const maxH = Math.max(1, ...slots.map((s) => s.count));
  const maxD = Math.max(1, ...weekdays.map((d) => d.count));
  const busiest = hours.length ? [...hours].sort((a, b) => b.count - a.count)[0]! : null;

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow text-[10px]">{p.when}</div>
        {busiest && (
          <div className="text-muted text-xs">
            {p.busiest} <span className="text-text">{busiest.label}</span>
          </div>
        )}
      </div>
      <div dir="ltr" className="mt-4 flex h-24 items-end gap-[2px]">
        {slots.map((s) => (
          <div
            key={s.label}
            className="bg-accent/25 hover:bg-accent/60 min-h-[2px] flex-1 rounded-t-sm transition-colors"
            style={{ height: `${(s.count / maxH) * 100}%` }}
            title={`${s.label} — ${f.n(s.count)}`}
          />
        ))}
      </div>
      <div dir="ltr" className="text-muted mt-1.5 flex justify-between text-[10px]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
      {weekdays.length > 0 && (
        <div className="mt-5 grid grid-cols-7 gap-1.5">
          {weekdays.map((d) => (
            <div key={d.label} className="text-center">
              {/* items-end anchors the bar to the bottom. A percentage
                  margin-top would NOT work here: percentage margins resolve
                  against the container's width, not its height. */}
              <div className="bg-border/40 flex h-10 items-end overflow-hidden rounded-md">
                <div
                  className="bg-accent/40 min-h-[2px] w-full"
                  style={{ height: `${(d.count / maxD) * 100}%` }}
                  title={`${d.label} — ${f.n(d.count)}`}
                />
              </div>
              <div className="text-muted mt-1 text-[10px]">{labelOf(p.weekdays, d.label)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Badge({ accent, children }: { accent?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
        accent ? "border-accent/40 bg-accent-soft text-accent-text" : "border-border text-muted",
      )}
    >
      {children}
    </span>
  );
}

const sectionOrder = (s: string) => (SECTIONS as readonly string[]).indexOf(s);

/** One visit: where from, on what, how long, the pages in order, what was seen and done. */
function Visit({ v, f, p }: { v: RecentVisit; f: Fmt; p: Copy }) {
  const where = v.city && v.city !== "Unknown" ? f.city(v.city) : f.country(v.country);
  const propLabel = (prop: string) =>
    labelOf({ ...p.targets, ...p.langNames, chip: p.chip, typed: p.typed }, prop);
  const actions = v.events.map(({ name, count }) => {
    const [ev, prop] = name.split(":") as [string, string?];
    return `${labelOf(p.events, ev)}${prop ? ` · ${propLabel(prop)}` : ""}${count > 1 ? ` ×${f.n(count)}` : ""}`;
  });
  const sections = [...v.sections].sort(
    (a, b) => sectionOrder(a.section) - sectionOrder(b.section),
  );
  const more = v.pageCount - v.pages.length;

  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="text-sm font-medium" dir="auto">
          {where}
        </span>
        <span className="text-muted text-xs">{f.ago(v.start)}</span>
        <span className="ms-auto flex gap-1.5">
          {v.engaged && <Badge accent>{p.engagedBadge}</Badge>}
          <Badge>{v.returning ? p.returningVisitor : p.newVisitor}</Badge>
        </span>
      </div>
      <div className="text-muted mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span>
          {labelOf(p.deviceNames, v.device)} · {v.browser === "Other" ? p.unknown : v.browser}
        </span>
        <span dir="auto">{!v.referrer || v.referrer === "Direct" ? p.direct : v.referrer}</span>
        <span>{labelOf(p.langNames, v.lang)}</span>
        <span>
          {f.dur(v.activeMs)} {p.active}
        </span>
      </div>
      <p dir="ltr" className="text-muted mt-2 font-mono text-[11px] wrap-break-word rtl:text-right">
        {v.pages.join(" → ")}
        {more > 0 && ` +${f.n(more)}`}
      </p>
      {sections.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sections.map((s) => (
            <span
              key={s.section}
              className="border-border text-muted rounded-full border px-2 py-0.5 text-[11px]"
            >
              {labelOf(p.sectionNames, s.section)}
              {s.ms > 0 && ` · ${f.dur(s.ms)}`}
            </span>
          ))}
        </div>
      )}
      {actions.length > 0 && <p className="text-text mt-2 text-xs">{actions.join(" · ")}</p>}
    </li>
  );
}

export function Dashboard({ data, locale }: { data: Insights; locale: Locale }) {
  const p = pageCopy[locale].admin;
  const f = formatters(locale, data.at);
  const k = data.kpis;

  if (data.degraded) {
    return (
      <Card className="p-6">
        <h2 className="text-base font-semibold">{p.datastore}</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">{p.datastoreBody}</p>
      </Card>
    );
  }

  const none = p.noData;
  const rows = (b: Breakdown, label: (l: string) => string = (l) => l): Row[] =>
    b.map((r) => ({ label: label(r.label), count: r.count }));
  const sectionRows = (home: boolean): Row[] =>
    data.sections
      .filter((s) => (SECTION_PAGE[s.section] === "home") === home)
      .map((s) => ({
        label: labelOf(p.sectionNames, s.section),
        count: s.visits,
        share: s.reachPct,
        value: `${f.pct(s.reachPct)} · ${p.avg} ${f.dur(s.avgMs)}`,
      }));
  const outbound = data.events.find((e) => e.name === "outbound");
  const outboundRows: Row[] = outbound
    ? [
        ...rows(outbound.props, (l) => labelOf(p.targets, l)),
        {
          label: p.events.outbound,
          count: outbound.count - outbound.props.reduce((a, r) => a + r.count, 0),
        },
      ].filter((r) => r.count > 0)
    : [];
  const actionRows: Row[] = data.events
    .filter((e) => e.name !== "chat_ask" && e.name !== "outbound")
    .map((e) => ({ label: labelOf(p.events, e.name), count: e.count }));
  const months = [...new Set([data.months[0], data.months.at(-1)])]
    .filter((m) => m !== undefined)
    .map(f.month)
    .join(" – ");
  // Everything read from the month hashes says so: under "7 days" on the 3rd,
  // these cards still include all of last month (gap-5).
  const period = (
    <>
      {p.monthsNote} <span className="text-text">{months || "—"}</span>
    </>
  );

  return (
    <div className="space-y-4">
      {/* Range selector. Plain links, so it works without JS and each range is
          a shareable/bookmarkable URL. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={localizedPath(`/admin?range=${r}`, locale)}
              scroll={false}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                r === data.range
                  ? "border-accent/50 text-text bg-accent/10"
                  : "text-muted hover:text-text border-border hover:border-accent/40",
              )}
            >
              {f.n(r)} {p.days}
            </Link>
          ))}
        </div>
        <p className="text-muted text-xs">
          {data.since ? `${p.since} ${f.day(data.since)}` : p.noData}
        </p>
      </div>

      {/* Two per row even on phones: eight full-width cards would bury the chart. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat
          label={p.kpi.engaged}
          value={f.n(k.engaged)}
          hint={`${f.pct(k.engagementRate)} ${p.kpi.engagedHint}`}
        />
        <Stat label={p.kpi.visits} value={f.n(k.visits)} hint={p.kpi.visitsHint} />
        <Stat label={p.kpi.visitors} value={f.n(k.uniqueVisitors)} hint={p.kpi.visitorsHint} />
        <Stat label={p.kpi.returning} value={f.n(k.returningVisitors)} hint={p.kpi.returningHint} />
        <Stat label={p.kpi.avgTime} value={f.dur(k.avgEngagedMs)} hint={p.kpi.avgTimeHint} />
        <Stat
          label={p.kpi.pagesPerVisit}
          value={f.n(k.pagesPerVisit)}
          hint={p.kpi.pagesPerVisitHint}
        />
        <Stat label={p.kpi.chat} value={f.n(k.chatQuestions)} hint={p.kpi.chatHint} />
        <Stat label={p.kpi.contact} value={f.n(k.contactSubmits)} hint={p.kpi.contactHint} />
      </div>

      <Trend data={data} f={f} p={p} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars
          title={p.timeTitle}
          rows={data.timeBuckets.map((b, i) => ({
            label: p.buckets[i] ?? b.label,
            count: b.count,
          }))}
          f={f}
          empty={none}
        />
        <Bars
          title={p.pagesTitle}
          note={months}
          rows={data.pages.map((pg) => ({
            label: pg.path,
            count: pg.avgMs,
            value: `${f.dur(pg.avgMs)} · ${f.n(pg.views)} ${p.views}`,
          }))}
          f={f}
          empty={none}
        />
      </div>

      <section className="space-y-4 pt-6">
        <div>
          <h2 className="eyebrow">{p.sectionsTitle}</h2>
          <p className="text-muted mt-2 max-w-3xl text-xs leading-relaxed">
            {p.sectionsHint} {period}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Bars title={p.homeSections} rows={sectionRows(true)} f={f} empty={none} />
          <Bars title={p.otherSections} rows={sectionRows(false)} f={f} empty={none} />
        </div>
      </section>

      <section className="space-y-4 pt-6">
        <div>
          <h2 className="eyebrow">{p.doTitle}</h2>
          <p className="text-muted mt-2 text-xs leading-relaxed">{period}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Bars
            title={p.chatAsked}
            rows={[
              { label: p.chip, count: data.chat.chip },
              { label: p.typed, count: data.chat.typed },
            ]}
            f={f}
            empty={none}
          />
          <Bars
            title={p.outcomesTitle}
            rows={rows(data.chat.outcomes, (l) => labelOf(p.outcomes, l))}
            f={f}
            empty={none}
          />
          <Bars title={p.topicsTitle} rows={rows(data.chat.topics)} f={f} empty={none} />
          <Bars title={p.actionsTitle} rows={actionRows} f={f} empty={none} />
          <Bars title={p.outboundTitle} rows={outboundRows} f={f} empty={none} />
        </div>
      </section>

      <section className="space-y-4 pt-6">
        <div>
          <h2 className="eyebrow">{p.acqTitle}</h2>
          <p className="text-muted mt-2 text-xs leading-relaxed">
            {p.acqHint} {period}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Bars
            title={p.sources}
            rows={rows(data.acquisition.referrers, (l) => (l === "Direct" ? p.direct : l))}
            f={f}
            empty={none}
          />
          <Bars title={p.entryPages} rows={rows(data.acquisition.entryPages)} f={f} empty={none} />
          <Bars
            title={p.countries}
            rows={rows(data.acquisition.countries, f.country)}
            f={f}
            empty={none}
          />
          <Bars title={p.cities} rows={rows(data.acquisition.cities, f.city)} f={f} empty={none} />
          <Bars
            title={p.devices}
            rows={rows(data.acquisition.devices, (l) => labelOf(p.deviceNames, l))}
            f={f}
            empty={none}
          />
          <Bars
            title={p.browsers}
            rows={rows(data.acquisition.browsers, (l) => (l === "Other" ? p.unknown : l))}
            f={f}
            empty={none}
          />
          <Bars
            title={p.languages}
            rows={rows(data.acquisition.languages, (l) => labelOf(p.langNames, l))}
            f={f}
            empty={none}
          />
        </div>
        <When data={data} f={f} p={p} />
      </section>

      <section className="space-y-4 pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="eyebrow">{p.recentTitle}</h2>
          <span className="text-muted text-xs">{p.recentHint}</span>
        </div>
        <Card>
          {data.recent.length === 0 ? (
            <p className="text-muted text-sm">{none}</p>
          ) : (
            <ul className="divide-border divide-y">
              {data.recent.map((v) => (
                <Visit key={v.id} v={v} f={f} p={p} />
              ))}
            </ul>
          )}
        </Card>
      </section>

      <p className="text-muted text-xs leading-relaxed">{p.note}</p>
    </div>
  );
}
