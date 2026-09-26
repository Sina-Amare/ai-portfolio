/**
 * Daily traffic digest, delivered to the Telegram bot the contact form already
 * uses — no email provider, no new dependency, no extra cost.
 *
 * Triggered by the Vercel cron defined in vercel.json at 07:00 UTC, so it
 * reports YESTERDAY, a complete UTC day, against the day before (health-4):
 * "today" at 07:00 would be seven hours of data compared with a full day.
 */
import { getInsights, type Insights, type RecentVisit } from "@/lib/analytics/insights";
import { dayKey } from "@/lib/analytics/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/** Visit records read to find yesterday's (the log is newest first, today's come first). */
const VISITS_READ = 200;
/** A visit worth a line of its own: this much active time, or one of these actions. */
const NOTABLE_MS = 120_000;
const NOTABLE_EVENTS = ["contact_submit", "resume_download"];
const EVENT_LABELS: Record<string, string> = {
  chat_ask: "chat",
  contact_submit: "contact form",
  resume_download: "résumé",
  outbound: "link",
  gallery_open: "gallery",
  palette_open: "palette",
  lang_switch: "language",
};

/**
 * Vercel attaches `Authorization: Bearer <CRON_SECRET>` when that var is set.
 * Fails CLOSED: with no secret nothing gets in. A header such as x-vercel-cron
 * is trivially spoofable, and every run costs Redis commands and pings Telegram.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}

/** Telegram's legacy Markdown breaks on a stray _ * ` or [ in a city or topic name. */
const esc = (s: string) => s.replace(/[_*`[]/g, "\\$&");

function dur(ms: number): string {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function delta(now: number, before: number): string {
  if (now === before) return "same as the day before";
  return `${now > before ? "▲ +" : "▼ "}${now - before} vs the day before`;
}

function top(counts: Map<string, number>, n = 3): string {
  const rows = [...counts].sort((a, b) => b[1] - a[1]).slice(0, n);
  return rows.length
    ? rows.map(([label, count]) => `  • ${esc(label)} — ${count}`).join("\n")
    : "  • (none)";
}

function tally(values: string[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const v of values) out.set(v, (out.get(v) ?? 0) + 1);
  return out;
}

function visitLine(v: RecentVisit): string {
  const actions = v.events.map(({ name, count }) => {
    const [ev, prop] = name.split(":") as [string, string?];
    const label = `${EVENT_LABELS[ev] ?? ev}${prop ? ` (${prop})` : ""}`;
    return count > 1 ? `${label} ×${count}` : label;
  });
  return [
    v.city === "Unknown" ? v.country : v.city,
    `${v.device}/${v.browser}`,
    `from ${v.referrer || "Direct"}`,
    `${dur(v.activeMs)} active`,
    `${v.pageCount} page${v.pageCount === 1 ? "" : "s"}`,
    ...(actions.length ? [actions.join(", ")] : []),
  ]
    .map(esc)
    .join(" · ");
}

function buildMessage(o: Insights, day: string): string | null {
  const [before, y] = o.series.slice(-2);
  if (!y || y.day !== day || !y.visits) return null;

  const visits = o.recent.filter((v) => v.id.startsWith(day));
  // ponytail: sources and sections come from the visit log; past VISITS_READ visits
  // a day they're a sample (labelled). A per-day breakdown hash if that ever happens.
  const sampled = o.recent.length === VISITS_READ && o.recent.at(-1)!.id.startsWith(day);
  const notable = visits
    .filter(
      (v) =>
        v.activeMs >= NOTABLE_MS ||
        v.events.some((e) => NOTABLE_EVENTS.includes(e.name.split(":")[0]!)),
    )
    .sort((a, b) => b.activeMs - a.activeMs)
    .slice(0, 3);
  const avg = (d: typeof y) => (d.engaged ? dur(d.engagedMs / d.engaged) : "—");
  const rate = Math.round((y.engaged / y.visits) * 100);

  return [
    `📊 *${esc(site.name)} — yesterday (${day})*`,
    ``,
    `*Visits:* ${y.visits} (${delta(y.visits, before?.visits ?? 0)})`,
    `*Engaged:* ${y.engaged} · ${rate}% (${delta(y.engaged, before?.engaged ?? 0)})`,
    `*Avg active time:* ${avg(y)} per engaged visit (day before: ${before ? avg(before) : "—"})`,
    ``,
    `*Sources*${sampled ? ` _(latest ${VISITS_READ} visits)_` : ""}`,
    top(tally(visits.map((v) => v.referrer || "Direct"))),
    ``,
    `*Sections seen*`,
    top(tally(visits.flatMap((v) => v.sections.map((s) => s.section)))),
    ``,
    `*Chat topics this month*`,
    top(new Map(o.chat.topics.map((t) => [t.label, t.count]))),
    ...(notable.length
      ? [``, `*Notable visits*`, ...notable.map((v) => `  • ${visitLine(v)}`)]
      : []),
    ``,
    `${site.url}/admin`,
  ].join("\n");
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return Response.json({ skipped: "telegram_not_configured" }, { status: 200 });
  }

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const insights = await getInsights(2, yesterday, VISITS_READ);
  if (!insights.enabled) {
    return Response.json({ skipped: "analytics_not_configured" }, { status: 200 });
  }
  if (insights.degraded) {
    return Response.json({ skipped: "datastore_unavailable" }, { status: 200 });
  }
  const text = buildMessage(insights, dayKey(yesterday));
  // Nobody came yesterday — don't send a message just to say zero.
  if (!text) {
    return Response.json({ skipped: "no_traffic" }, { status: 200 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      return Response.json({ error: "telegram_failed" }, { status: 502 });
    }
  } catch {
    return Response.json({ error: "telegram_unreachable" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
