import Link from "next/link";
import type { Breakdown, Overview } from "@/lib/analytics/store";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/dictionary";
import { pageCopy } from "@/lib/page-copy";

/** "NL" → 🇳🇱, by mapping the two letters to regional-indicator code points. */
function flagOf(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

// Intl gives real country names for free — no lookup table to maintain.
function countryLabel(code: string, locale: Locale): string {
  if (code === "Unknown") return `🌐 ${pageCopy[locale].admin.unknown}`;
  let name = code;
  try {
    name = new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    /* invalid code — fall back to the raw value */
  }
  return `${flagOf(code)} ${name}`;
}

const RANGES = [7, 30, 90] as const;

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="text-muted mt-1 text-xs">{hint}</div>}
    </div>
  );
}

/** Horizontal bars — proportions read faster than a column of raw numbers. */
function BreakdownCard({
  title,
  rows,
  empty,
  format,
}: {
  title: string;
  rows: Breakdown;
  empty: string;
  format?: (label: string) => string;
}) {
  const max = rows.length ? Math.max(...rows.map((r) => r.count)) : 0;
  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="eyebrow text-[10px]">{title}</div>
      {rows.length === 0 ? (
        <p className="text-muted mt-3 text-sm">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="relative">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate" title={r.label}>
                  {format ? format(r.label) : r.label}
                </span>
                <span className="text-muted shrink-0 font-mono text-xs tabular-nums">
                  {r.count.toLocaleString()}
                </span>
              </div>
              <div className="bg-border/40 mt-1 h-1 overflow-hidden rounded-full">
                <div
                  className="bg-accent/60 h-full rounded-full"
                  style={{ width: `${max ? (r.count / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Pure-CSS sparkline; no chart dependency for one small graph. */
function Series({
  series,
  locale,
}: {
  series: Overview["series"];
  locale: Locale;
}) {
  const p = pageCopy[locale].admin;
  const max = Math.max(1, ...series.map((d) => d.views));
  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="eyebrow text-[10px]">{p.viewsDay}</div>
      <div className="mt-4 flex h-28 items-end gap-[3px]">
        {series.map((d) => (
          <div
            key={d.day}
            className="bg-accent/25 hover:bg-accent/60 min-h-[2px] flex-1 rounded-t-sm transition-colors"
            style={{ height: `${(d.views / max) * 100}%` }}
            title={`${d.day} — ${d.views} ${p.views} · ${d.uniques} ${p.unique}`}
          />
        ))}
      </div>
      <div className="text-muted mt-2 flex justify-between text-[11px]">
        <span>{series[0]?.day}</span>
        <span>{series[series.length - 1]?.day}</span>
      </div>
    </div>
  );
}

/**
 * When people actually read the site, in THEIR local time — derived from the
 * timezone Vercel reports, so it needs nothing from the device. Bars stay in
 * clock order; sorting a histogram by size would destroy the shape.
 */
function WhenCard({
  hours,
  weekdays,
  locale,
}: {
  hours: Breakdown;
  weekdays: Breakdown;
  locale: Locale;
}) {
  const p = pageCopy[locale].admin;
  const byHour = new Map(hours.map((h) => [h.label, h.count]));
  const slots = Array.from({ length: 24 }, (_, i) => {
    const label = `${String(i).padStart(2, "0")}:00`;
    return { label, count: byHour.get(label) ?? 0 };
  });
  const maxH = Math.max(1, ...slots.map((s) => s.count));
  const maxD = Math.max(1, ...weekdays.map((d) => d.count));
  const busiest = hours.length
    ? [...hours].sort((a, b) => b.count - a.count)[0]!
    : null;

  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="eyebrow text-[10px]">{p.when}</div>
        {busiest && (
          <div className="text-muted text-xs">
            {p.busiest} <span className="text-text">{busiest.label}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex h-24 items-end gap-[2px]">
        {slots.map((s) => (
          <div
            key={s.label}
            className="bg-accent/25 hover:bg-accent/60 min-h-[2px] flex-1 rounded-t-sm transition-colors"
            style={{ height: `${(s.count / maxH) * 100}%` }}
            title={`${s.label} — ${s.count} ${p.views}`}
          />
        ))}
      </div>
      <div className="text-muted mt-1.5 flex justify-between text-[10px]">
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
                  title={`${d.label} — ${d.count} ${p.views}`}
                />
              </div>
              <div className="text-muted mt-1 text-[10px]">
                {locale === "fa"
                  ? ((
                      {
                        Mon: "دوشنبه",
                        Tue: "سه‌شنبه",
                        Wed: "چهارشنبه",
                        Thu: "پنجشنبه",
                        Fri: "جمعه",
                        Sat: "شنبه",
                        Sun: "یکشنبه",
                      } as Record<string, string>
                    )[d.label] ?? d.label)
                  : d.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Dashboard({
  data,
  locale,
}: {
  data: Overview;
  locale: Locale;
}) {
  const p = pageCopy[locale].admin;
  const { totals } = data;
  // Share of this month's distinct visitors who came back at least once. This
  // is a people ratio, not a page ratio — counting repeat *views* would just be
  // measuring pages-per-session and calling it loyalty.
  const repeatPct =
    totals.visitors > 0
      ? Math.round((totals.repeatVisitors / totals.visitors) * 100)
      : 0;
  const viewsPerVisitor =
    totals.visitors > 0 ? (totals.views / totals.visitors).toFixed(1) : "—";

  if (data.degraded) {
    return (
      <div className="glass rounded-[var(--radius-card)] p-6">
        <h2 className="text-base font-semibold">{p.datastore}</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          {p.datastoreBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Range selector. Plain links, so it works without JS and each range is
          a shareable/bookmarkable URL. */}
      <div className="flex items-center gap-1.5">
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin?range=${r}`}
            scroll={false}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              r === data.range
                ? "border-accent/50 text-text bg-accent/10"
                : "text-muted hover:text-text border-border hover:border-accent/40",
            )}
          >
            {r} {p.days}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={`${p.pageViews} · ${data.range} ${p.days}`}
          value={totals.views.toLocaleString()}
          hint={p.pageViewsHint}
        />
        <Stat
          label={p.visitors}
          value={totals.visitors.toLocaleString()}
          hint={p.visitorsHint}
        />
        <Stat
          label={p.returned}
          value={totals.repeatVisitors.toLocaleString()}
          hint={`${repeatPct}% ${p.returnedHint}`}
        />
        <Stat
          label={p.perVisitor}
          value={viewsPerVisitor}
          hint={p.perVisitorHint}
        />
      </div>

      <Series series={data.series} locale={locale} />

      <WhenCard hours={data.hours} weekdays={data.weekdays} locale={locale} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard title={p.cities} rows={data.cities} empty={p.noVisits} />
        <BreakdownCard
          title={p.countries}
          rows={data.countries}
          empty={p.noVisits}
          format={(code) => countryLabel(code, locale)}
        />
        <BreakdownCard title={p.pages} rows={data.paths} empty={p.noVisits} />
        <BreakdownCard
          title={p.referrers}
          rows={data.referrers}
          empty={p.noVisits}
        />
        <BreakdownCard
          title={p.timezones}
          rows={data.timezones}
          empty={p.noVisits}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-4">
          <BreakdownCard
            title={p.devices}
            rows={data.devices}
            empty={p.noVisits}
          />
          <BreakdownCard
            title={p.browsers}
            rows={data.browsers}
            empty={p.noVisits}
          />
        </div>
      </div>

      <p className="text-muted text-xs leading-relaxed">{p.note}</p>
    </div>
  );
}
