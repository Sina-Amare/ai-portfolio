# Visit analytics + `/admin`

A self-hosted, cookieless analytics panel at `/admin` that answers "who really visited,
how long did they actually engage, what did they look at and what did they do": visits
(not raw page views), engaged visits, active time, how far people get through each
page, their actions (chat questions, résumé, outbound links, contact), where they came
from, and a log of the last 50 visits. Runs entirely on free tiers — no third-party
script, no data leaving your own infrastructure.

## Why not just use Vercel Web Analytics?

It's free on Hobby (50k events/month) and worth enabling alongside this, but it
cannot answer most of the questions this panel was built for:

|                              | Vercel WA                        | Cloudflare WA          | This panel |
| ---------------------------- | -------------------------------- | ---------------------- | ---------- |
| Page views                   | ✅                               | ✅                     | ✅         |
| **Timezone**                 | ❌ (no such dimension, any tier) | ❌                     | ✅         |
| **New vs returning**         | ❌                               | ❌ (no uniques at all) | ✅         |
| **Active time, sections**    | ❌                               | ❌                     | ✅         |
| **Per-visit timeline (log)** | ❌                               | ❌                     | ✅         |

Vercel's visitor hash "is valid for a single day, at which point it is automatically
reset", so a person visiting on five days counts as five unique visitors and
"returning" is structurally unanswerable. Plausible and Fathom share that 24-hour
limitation by design.

## Setup (about 3 minutes, free, no card)

Note that **Integrations and Storage live in the account/team sidebar, not inside the
project** — Redis is provisioned once for the account and then _connected_ to a project.

### 1. Provision Redis

Dashboard → **Integrations** (sidebar) → **Browse Marketplace** → under **Native
Integrations** pick **Upstash** → **Install** → choose **Redis**, pick a **Region** near
you and the **Free** plan → **Continue** → give it a **Database Name** → **Create**.

### 2. Connect it to the project

On the new resource's page → **Projects** → **Connect Project** → select the portfolio →
**Connect**.

Vercel injects the credentials automatically. Any naming scheme works: the app reads
`UPSTASH_REDIS_REST_URL`/`_TOKEN` or `KV_REST_API_URL`/`_TOKEN`, and if the connect dialog's
**Custom Prefix** renamed them (e.g. `DB1_KV_REST_API_URL`) it finds any `…REST_API_URL` /
`…REST_API_TOKEN` pair.

### Or do steps 1–2 in one command

```bash
npm i -g vercel && vercel login
vercel link            # run inside the project folder
vercel install upstash # installs, connects to the linked project, writes .env.local
```

### 3. Set a password (and the digest secret)

Select the **project** → **Settings** → **Environment Variables** → add `ADMIN_PASSWORD`
for all environments, and `CRON_SECRET` if you want the daily Telegram digest (it
doesn't run without one). Also set `NEXT_PUBLIC_SITE_URL=https://sinaamareh.ir` for
Production: the beacon only counts visits whose `Origin` is that host, and without it the
site URL falls back to Vercel's production domain; if that is the `vercel.app` alias,
every visit is silently dropped. (The contact form
and the login also accept the host they were sent to, so they work on previews.)
Generate each secret with:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
```

### 4. Redeploy

Environment variables only apply to new builds: **Deployments** → newest → **⋯** →
**Redeploy**. Then open `/admin` (or `/fa/admin` in Persian) and sign in: the session
cookie lasts 12 hours, and the same sign-in marks your browser so your own visits aren't
counted.

Optional: `ADMIN_SESSION_SECRET`, a separate long random value for signing the session
cookie. Without it the key is derived from `ADMIN_PASSWORD` with HKDF (the cookie never
carries anything computed from the password itself), so changing the password signs
everyone out, which is usually what you want. Set it only if sessions should survive a
password change; removing `ADMIN_PASSWORD` ends them either way.

**Nothing breaks before you do any of this.** Without the Upstash vars the beacon
no-ops and `/admin` says analytics isn't connected; without `ADMIN_PASSWORD` the page
stays locked. The site behaves exactly as it did before.

## Free-tier headroom

Upstash free: **256 MB, 500,000 commands/month**, no credit card, and — unlike Neon
(sleeps after 5 min), Supabase (pauses after 7 days) or Turso (archives after 10 days)
— **no idle pause**, which matters for a portfolio that can go days without a visit.

Measured costs (pinned by `tests/unit/analytics-store.test.ts`): a visit's first beacon
~27 Redis commands (31 for a returning visitor), a page view inside a running visit 5–8,
an engagement flush 10–30 depending on sections and events. A typical 3-page visit
spends ~110 commands over ~8 beacons, gate included. TTLs are written only when a key
can be new, never per write. Vercel Hobby allows 1,000,000 function invocations/month,
so that is never the binding constraint.

`/api/track` is unauthenticated, so everything that costs nothing runs first: owner,
dev and bot filters, our own `Origin`, a ≤ 4 KB well-formed beacon, and an in-memory
per-IP limit (`ANALYTICS_RPM`, default 30/min). Only then does it spend commands: a
**shared** per-IP counter in Redis (the in-memory one is per-lambda, so concurrent
requests would each get a fresh budget), then the write. Each accepted beacon charges
what it actually spent to a daily budget (`ANALYTICS_DAILY_COMMANDS`, default 12,000
≈ 360k/month, leaving ~140k for the dashboard, chat recording and login); once an
instance sees the day over budget it refuses beacons without touching Redis. That is
~100 real visits a day, or ~400 beacons from a script inventing a new visitor each
time. (`ANALYTICS_DAILY_MAX`, a beacon count, is no longer read.)

Reading is cheap by comparison: a 30-day `/admin` load is about 90 commands (one hash
per day, one per month touched, two set sizes, 50 visit records; under 250 at 90 days),
and the daily digest about 210 (it reads up to 200 visit records to find yesterday's),
so ~6.5k a month.

## What the browser sends (`components/analytics/tracker.tsx`)

Two beacon types, both `POST /api/track` (contract in `lib/analytics/beacon.ts`):

- **Page view** `{t: "pv", path, referrer}` on every route change, including client-side
  navigation. Only the first beacon of a page load carries `document.referrer`, which
  otherwise keeps returning the original external referrer for the whole visit.
- **Engagement flush** `{t: "eng", path, ms, sections, events}` for the page being left:
  on route change, when the tab is hidden, on `pagehide`, and at most once a minute
  while active. Sent with `navigator.sendBeacon` (survives the tab closing), falling back
  to `fetch(…, {keepalive: true})`. A flush with under a second of active time and no
  action is not sent.

**Active time** is sampled once a second and counts only while the tab is visible AND the
visitor scrolled, pointed, tapped or typed in the last 60 s (opening a page counts as
activity). A background tab or someone who walked away adds nothing; a laptop waking
from sleep can't credit the hours it slept.

**Sections** are the elements marked `data-analytics-section` (home: `hero`, `featured`,
`workplace`, `about`, `contact`; `/projects`: `projects-list`, `workplace-detail`; a case
study: `case-study`). Each second the tracker checks which marked sections are on screen:
one on screen at two samples (about a second) is **seen**, and the one taking most of the
viewport gets that second as **dwell**. Rect checks on a handful of elements once a second
were chosen over an IntersectionObserver because they follow route changes and
re-rendered sections with no bookkeeping.

**Actions** are whitelisted names noted with `track()` (`lib/analytics/client.ts`) and
sent with the next flush: `chat_ask` (chip | typed), `contact_submit` (after the server
accepted it), `resume_download`, `outbound` (github | repo | linkedin | email | telegram),
`gallery_open`, `palette_open`, `lang_switch` (en | fa). Link clicks are classified by
one delegated listener, so every résumé and outbound link on the site is covered
without touching each component; command-palette links call it directly.

The tracker sends nothing on `/admin` or `/fa/admin`, and nothing at all when
`navigator.webdriver` is true (Playwright, Selenium, headless crawlers). Everything lives
in page memory; nothing is written to cookies or storage.

## Data model (v2, since the deploy that shipped it)

A **visit** is every beacon from one visitor hash with under 30 minutes of inactivity
(GA4's rule). The pointer `an:s:<vid>` → visit id slides 30 minutes on every beacon, so a
reload, the back button or a quick return is the same visit; activity after 30 idle
minutes starts a new one, with its page as entry and first page view. A flush with no
active time and no action (a background tab closed later) is not activity and starts
nothing. A reload of the same page within 15 s is not a new page view. The pointer is
created with `SET NX`, so tabs opened at the same moment share one visit.

| Key               | What                                                                                                                                                                                                             | TTL              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| `an:s:<vid>`      | current visit id                                                                                                                                                                                                 | 30 min, sliding  |
| `an:sess:<sid>`   | one visit: start/last, country, city, device, browser, lang, entry referrer + page, pages in order (first 20), active ms, per-section ms, events, returning, engaged                                             | 90 days          |
| `an:recent`       | last 500 visit ids, newest first                                                                                                                                                                                 | 90 days, sliding |
| `an:d:<day>`      | visits, engaged, returning, pages, active ms (`ms`, engaged-only `ems`), time buckets `b0`–`b5`, chat, contact                                                                                                   | 400 days         |
| `an:m:<month>`    | per visit: `ref:` `entry:` `co:` `city:` `dev:` `br:` `hr:` `wd:` `lang:` `tz:`; per page: `pv:` `pms:`; sections `sr:` (reach) `sms:` (dwell) `vk:` (visits per page kind); `ev:`; chat `chat:` `topic:` `ask:` | 400 days         |
| `an:seen:<month>` | distinct visitors                                                                                                                                                                                                | 400 days         |
| `an:ret:<month>`  | visitors with 2+ visits                                                                                                                                                                                          | 400 days         |
| `an:since`        | first day of v2 data (one date, nothing personal)                                                                                                                                                                | none             |

A visit counts as **engaged** once it has ≥ 10 s of active time, ≥ 2 pages, or a key event
(chat question, contact message, résumé download, outbound link, gallery open). Chat
turns are stored as outcome, topic (the knowledge-base source the answer leaned on) and
chip-or-typed only — never the question. The v1 per-pageview keys (`an:v`, `an:u`,
`an:path`, …) are no longer written; days before `an:since` still read `an:v`.

Nothing is written outside production (`ANALYTICS_IN_DEV=1` opts in locally), from bots,
or from the owner's browser: admin login sets a year-long `sa_owner` cookie (it grants
nothing), and a live admin session counts too.

## Privacy model

- **No cookies** are set for tracking, so no consent banner is triggered by _this_
  panel's storage. (The `/admin` login cookie and the `sa_owner` mark that keeps your
  own visits out are only ever set for you.) The 30-minute visit pointer lives in
  Redis, keyed by the pseudonymous hash, not on the device, and the tracker keeps its
  active-time and section counters in page memory only.
- **Raw IP addresses are never stored.** A visitor is
  `sha256(salt + ip + user-agent + host)`, truncated to 32 hex chars.
- **The salt is unique per calendar month** (`an:salt:<YYYY-MM>`) and expires with it,
  so once a month passes those hashes cannot be recomputed — by anyone, including you.
  Keying the salt to the month it stamps (rather than a rolling 30-day TTL) is
  deliberate: a rolling salt could rotate mid-month, silently giving every returning
  visitor a new hash and double-counting them in that month's "distinct people".
- **Timezone comes from Vercel's `x-vercel-ip-timezone` header, not the browser.**
  This is deliberate: reading `Intl.DateTimeFormat().resolvedOptions().timeZone`
  client-side and transmitting it is treated by EDPB Guidelines 2/2023 §53 as "gaining
  access to information stored in terminal equipment" — writing no cookie does not
  help — and a device-stable timezone would sharpen the visitor hash toward a
  fingerprint. The header never touches the device.
- **Referrers are reduced to a bare hostname** (`google.com`), never the full URL,
  which keeps search queries and tracking parameters out of storage.
- **Chat questions are never stored.** A turn is recorded as its outcome, its topic (the
  knowledge-base source the answer leaned on) and chip-or-typed. The question itself goes
  only to the LLM providers that answer it, which the privacy page names.
- **Bots are dropped** before any write, via `isbot`, the tracker staying silent in
  automated browsers (`navigator.webdriver`), and the fact that the beacon only
  fires from a real browser executing JS. This matters more than it sounds: Plausible
  reports raw server logs carrying ~18× the real pageview count.

### The trade-off you chose

A monthly salt (the Umami model) is what makes "returning visitor" answerable. A
24-hour salt (Plausible/Fathom) is more private but makes that metric impossible. The
cost of a month is a longer re-identification window: the pseudonymous id persists for
up to a month rather than a day.

Worth being precise about one thing: **"no cookies, so no consent banner" is a
defensible legal position, not a settled fact.** EDPB Guidelines 2/2023 ¶55 holds that
IP-based tracking can engage ePrivacy Article 5(3) even with zero cookies, though ¶56
confirms that engaging 5(3) does not automatically require consent, and national
regulators diverge (France, Italy, Spain and the Netherlands have audience-measurement
exemptions; Germany, Austria and Ireland do not; the UK added a statutory analytics
exemption in force 5 Feb 2026). For a personal portfolio measuring only its own
traffic, aggregated, with no cross-site tracking and no ad profiling, this sits in the
lowest-risk category — but it is a judgement call, not an exemption you can point at.

## Daily digest to Telegram

`vercel.json` registers a cron that hits `/api/cron/digest` once a day (07:00 UTC;
Hobby allows one run per day with ±59 min precision). It reports **yesterday**, a whole
UTC day, against the day before: visits, engaged visits and engagement rate, average
active time per engaged visit, yesterday's top sources and sections seen (from the visit
log), chat topics for the month or months those two days fall in (stored per month, and
labelled with them), and up to three notable visits (2+ minutes active, or a contact
message or résumé download). It reuses the `TELEGRAM_BOT_TOKEN` /
`TELEGRAM_CHAT_ID` the contact form already uses, so there's no email provider and no
extra cost. (It used to report "today" at 07:00, seven hours of data against a whole
day, so nearly every digest showed a drop.)

It stays silent when yesterday had no visits, and skips cleanly if Telegram or Upstash
isn't configured. `CRON_SECRET` is **required**: Vercel sends it as a bearer token and
the route rejects anything else. With no secret set the endpoint answers 401 to every
request (fail closed), so the digest simply doesn't run until you add it.

## Date range

The dashboard has 7 / 30 / 90-day views. The range is a plain link (`/admin?range=90`),
so each is bookmarkable and it works without JS. Only those three values are accepted —
the number sizes a Redis pipeline, so an arbitrary `?range=100000` would turn one page
load into a huge command burst.

Breakdowns are stored per month, so a 90-day range reads every month it touches and
merges them; `getInsights` returns those `months` so the dashboard can label them.
Unique and returning visitors always stay current-month: the salt rotates monthly, so
cross-month visitor identity genuinely doesn't exist.

## Reading the numbers honestly

The dashboard, top to bottom (EN/FA, Persian digits in Persian):

1. **Headline cards.** Lead with **engaged visits** and the engagement rate: a visit with
   10 s+ of active time, 2+ pages, or a key action (chat question, contact message, résumé,
   outbound link, gallery). All visits sit next to it, so bounces are visible but don't
   dominate. **Avg active time** is per engaged visit. **Pages per visit** divides page
   views by visits over the same days. Chat questions come from the chat route itself;
   contact messages from the form's success.
2. **Visits per day**, all vs engaged, with the peak day printed under the chart (touch
   screens can't show bar tooltips). The page-view total for the range includes the days
   before v2, which have page views only; the "since" date at the top says where visit
   data starts.
3. **Active time per visit** (buckets under 10 s … 10 min+) and **pages by average active
   time** (a page's active time ÷ its views).
4. **How far visits get.** For each section: **reach** = share of the visits that opened
   its page and had it on screen for about a second, and **avg** = how long it was the
   main thing on screen per visit that reached it. Reach divides by the visits that
   opened the section's page (home, /projects or a case study), not by all visits:
   someone who landed on a case study and left is not a drop-off in the home funnel.
5. **What visitors did.** Chat questions (suggested chip vs typed), chat outcomes
   (answered, from cache, declined as off-topic or abusive, small talk, daily limit,
   failed), chat topics, other actions and outbound links by target.
6. **Where visits come from**, counted once per visit: sources, entry pages, countries,
   cities, devices, browsers, language, and the local hour/weekday.
7. **Recent visits**, the last 50: when, where, device and browser, source, language,
   active time, the pages in order, sections seen (with dwell) and actions, with
   new/returning and engaged badges. This is the "who really visited" view.

The headline cards (except visitors and returning, which are this month's), the daily
trend and the active-time buckets follow the range to the day. Pages by active time and
sections 4–6 are stored per calendar month, so each is labelled with the months it
covers: "7 days" on the 3rd includes all of last month. That is why the chip/typed card
can show more questions than the chat-questions headline card.

Definitions worth keeping in mind:

- **Visits** are sessions (see the data model), not page views.
- **Visitors** = distinct people seen _this calendar month_, read from one set. It is
  deliberately not the sum of daily uniques — that would count a person who visits on
  five days as five people.
- **Returning visitors** = visitors with 2+ visits this month. A second page in the same
  visit is not a return. (v1's "came back" counted anyone with a second page view, which
  flattered the number — worth knowing if you compare against old screenshots.)
- **Active time** undercounts rather than overcounts: someone reading a long page without
  touching anything for over a minute stops accruing until they scroll again.
- In a new month everyone is new again, because the salt rotated. That is the privacy
  design working, not a gap in the data.

## Local development

Put `ADMIN_PASSWORD=dev-password` in `.env.local`, run `npm run dev`, and open `/admin` on
the local URL it prints. Next loads `.env.local` itself, so this works the same in
PowerShell, cmd and bash.

Without Upstash vars set locally, `/admin` renders the "not connected" state — which is
exactly what production looks like before step 1. With them (e.g. after `vercel env
pull`), `/admin` reads the real data but nothing local is written unless you set
`ANALYTICS_IN_DEV=1`.
