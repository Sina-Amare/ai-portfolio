import type { Breakdown, Overview } from "@/lib/analytics/store";

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="text-muted mt-1 text-xs">{hint}</div>}
    </div>
  );
}

/** Horizontal bars — proportions read faster than a column of raw numbers. */
function BreakdownCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: Breakdown;
  empty: string;
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
                  {r.label}
                </span>
                <span className="text-muted font-mono shrink-0 text-xs tabular-nums">
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
function Series({ series }: { series: Overview["series"] }) {
  const max = Math.max(1, ...series.map((d) => d.views));
  return (
    <div className="glass rounded-[var(--radius-card)] p-5">
      <div className="eyebrow text-[10px]">Views per day</div>
      <div className="mt-4 flex h-28 items-end gap-[3px]">
        {series.map((d) => (
          <div
            key={d.day}
            className="bg-accent/25 hover:bg-accent/60 min-h-[2px] flex-1 rounded-t-sm transition-colors"
            style={{ height: `${(d.views / max) * 100}%` }}
            title={`${d.day} — ${d.views} views · ${d.uniques} unique`}
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

export function Dashboard({ data }: { data: Overview }) {
  const { totals } = data;
  // Share of this month's distinct visitors who came back at least once. This
  // is a people ratio, not a page ratio — counting repeat *views* would just be
  // measuring pages-per-session and calling it loyalty.
  const repeatPct =
    totals.visitors > 0 ? Math.round((totals.repeatVisitors / totals.visitors) * 100) : 0;
  const viewsPerVisitor =
    totals.visitors > 0 ? (totals.views / totals.visitors).toFixed(1) : "—";

  if (data.degraded) {
    return (
      <div className="glass rounded-[var(--radius-card)] p-6">
        <h2 className="text-base font-semibold">Couldn&apos;t reach the datastore</h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          Upstash didn&apos;t respond — usually a transient blip, or the monthly free
          command quota being exhausted. Recording is unaffected on the visitor side;
          this page will fill back in once Redis answers again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={`Page views · ${data.range}d`}
          value={totals.views.toLocaleString()}
          hint="Every view, bots filtered out"
        />
        <Stat
          label="Visitors · month"
          value={totals.visitors.toLocaleString()}
          hint="Distinct people so far this month"
        />
        <Stat
          label="Came back"
          value={totals.repeatVisitors.toLocaleString()}
          hint={`${repeatPct}% of visitors returned at least once`}
        />
        <Stat
          label="Views per visitor"
          value={viewsPerVisitor}
          hint="How much of the site people read"
        />
      </div>

      <Series series={data.series} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownCard
          title="Timezones"
          rows={data.timezones}
          empty="No visits recorded yet."
        />
        <BreakdownCard
          title="Countries"
          rows={data.countries}
          empty="No visits recorded yet."
        />
        <BreakdownCard title="Top pages" rows={data.paths} empty="No visits recorded yet." />
        <BreakdownCard
          title="Referrers"
          rows={data.referrers}
          empty="No visits recorded yet."
        />
      </div>

      <p className="text-muted text-xs leading-relaxed">
        Aggregate counters only — no cookies, and raw IP addresses are never stored. A
        visitor is a salted SHA-256 hash of IP + user-agent; the salt is unique per
        calendar month and expires with it, after which those hashes can&apos;t be
        recomputed. So &ldquo;visitors&rdquo; and &ldquo;came back&rdquo; are always
        within the current month — someone returning in a later month counts as new,
        which is the privacy design working rather than a gap in the data.
      </p>
    </div>
  );
}
