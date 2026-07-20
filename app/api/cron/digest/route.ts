/**
 * Daily traffic digest, delivered to the Telegram bot the contact form already
 * uses — no email provider, no new dependency, no extra cost.
 *
 * Triggered by the Vercel cron defined in vercel.json. Hobby allows one run per
 * day with ±59 min precision, which is exactly the right granularity for this.
 */
import { getOverview } from "@/lib/analytics/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";

/** Vercel attaches `Authorization: Bearer <CRON_SECRET>` when that var is set. */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // With no secret configured we only accept Vercel's own cron header, so the
  // endpoint can't be triggered by a random visitor hitting the URL.
  if (!secret) return req.headers.get("x-vercel-cron") !== null;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function bar(value: number, max: number, width = 10): string {
  if (max <= 0) return "▁".repeat(width);
  const filled = Math.max(1, Math.round((value / max) * width));
  return "█".repeat(filled) + "░".repeat(Math.max(0, width - filled));
}

function buildMessage(o: Awaited<ReturnType<typeof getOverview>>): string {
  const today = o.series[o.series.length - 1];
  const yesterday = o.series[o.series.length - 2];
  const delta =
    yesterday && today
      ? today.views - yesterday.views
      : 0;
  const arrow = delta > 0 ? `▲ +${delta}` : delta < 0 ? `▼ ${delta}` : "no change";

  const top = (rows: { label: string; count: number }[], n = 3) =>
    rows.length
      ? rows
          .slice(0, n)
          .map((r) => `  • ${r.label} — ${r.count}`)
          .join("\n")
      : "  • (none yet)";

  const busiest = o.hours.length
    ? [...o.hours].sort((a, b) => b.count - a.count)[0]!
    : null;
  const max = Math.max(...o.series.map((d) => d.views), 1);
  const spark = o.series
    .slice(-14)
    .map((d) => bar(d.views, max, 1))
    .join("");

  return [
    `📊 *${site.name} — daily traffic*`,
    ``,
    `*Today:* ${today?.views ?? 0} views · ${today?.uniques ?? 0} visitors (${arrow} vs yesterday)`,
    `*Last ${o.range}d:* ${o.totals.views} views`,
    `*This month:* ${o.totals.visitors} visitors · ${o.totals.repeatVisitors} came back`,
    ``,
    `\`${spark}\`  _last 14 days_`,
    ``,
    `*Top pages*`,
    top(o.paths),
    ``,
    `*Referrers*`,
    top(o.referrers),
    ``,
    `*Cities*`,
    top(o.cities),
    ``,
    `*Devices*`,
    top(o.devices, 3),
    ``,
    busiest ? `Busiest hour (visitor local time): *${busiest.label}*` : "",
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

  const overview = await getOverview(30);
  if (!overview.enabled) {
    return Response.json({ skipped: "analytics_not_configured" }, { status: 200 });
  }
  if (overview.degraded) {
    return Response.json({ skipped: "datastore_unavailable" }, { status: 200 });
  }
  // Nothing happened — don't send a message just to say zero.
  if (overview.totals.views === 0) {
    return Response.json({ skipped: "no_traffic" }, { status: 200 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildMessage(overview),
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
