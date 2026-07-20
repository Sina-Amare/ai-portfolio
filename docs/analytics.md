# Visit analytics + `/admin`

A self-hosted, cookieless analytics panel at `/admin`: page views, unique visitors,
new vs returning, timezones, countries, top pages and referrers. Runs entirely on
free tiers — no third-party script, no data leaving your own infrastructure.

## Why not just use Vercel Web Analytics?

It's free on Hobby (50k events/month) and worth enabling alongside this, but it
cannot answer two of the three questions this panel was built for:

| | Vercel WA | Cloudflare WA | This panel |
| --- | --- | --- | --- |
| Page views | ✅ | ✅ | ✅ |
| **Timezone** | ❌ (no such dimension, any tier) | ❌ | ✅ |
| **New vs returning** | ❌ | ❌ (no uniques at all) | ✅ |

Vercel's visitor hash "is valid for a single day, at which point it is automatically
reset", so a person visiting on five days counts as five unique visitors and
"returning" is structurally unanswerable. Plausible and Fathom share that 24-hour
limitation by design.

## Setup (about 2 minutes, free, no card)

1. **Provision Redis.** Vercel dashboard → your project → **Storage** → **Marketplace**
   → **Upstash Redis** → free plan. Vercel injects `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` automatically.
2. **Set a password.** Project → Settings → Environment Variables → add
   `ADMIN_PASSWORD` (use something long and random).
3. **Redeploy.** Visit `/admin`, sign in, done.

Optional: set `ADMIN_SESSION_SECRET` to a separate long random value. It defaults to
`ADMIN_PASSWORD`, which means changing the password also invalidates existing sessions
— usually what you want.

**Nothing breaks before you do any of this.** Without the Upstash vars the beacon
no-ops and `/admin` says analytics isn't connected; without `ADMIN_PASSWORD` the page
stays locked. The site behaves exactly as it did before.

## Free-tier headroom

Upstash free: **256 MB, 500,000 commands/month**, no credit card, and — unlike Neon
(sleeps after 5 min), Supabase (pauses after 7 days) or Turso (archives after 10 days)
— **no idle pause**, which matters for a portfolio that can go days without a visit.

A recorded page view costs ~10 Redis commands (the month's salt is cached in instance
memory, and TTLs are only written when a key is first created), so the free allowance
covers well over **40,000 views/month**. Vercel Hobby allows 1,000,000 function
invocations/month, so that is never the binding constraint.

`/api/track` is unauthenticated, so it is gated three ways before it can spend a single
command: the request must carry our own `Origin`, the caller must be under a **shared**
per-IP limit (`ANALYTICS_RPM`, default 20/min), and the site must be under a global
daily budget (`ANALYTICS_DAILY_MAX`, default 1200 accepted beacons/day). The shared part
matters — the in-memory limiter used elsewhere is per-lambda, so concurrent requests
would each be handed their own fresh budget and could drain a month of quota in hours.

## Privacy model

- **No cookies** are set for tracking, so no consent banner is triggered by *this*
  panel's storage. (The `/admin` login cookie is strictly functional and only ever set
  for you.)
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
- **Bots are dropped** before any write, via `isbot` plus the fact that the beacon only
  fires from a real browser executing JS. This matters more than it sounds: Plausible
  reports raw server logs carrying ~18× the real pageview count.

### The trade-off you chose

A 30-day salt (the Umami model) is what makes "returning visitor" answerable. A
24-hour salt (Plausible/Fathom) is more private but makes that metric impossible. The
cost of 30 days is a longer re-identification window: the pseudonymous id persists for
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

## Reading the numbers honestly

- **Visitors** = distinct people seen *this calendar month*, read from one set. It is
  deliberately not the sum of daily uniques — that would count a person who visits on
  five days as five people.
- **Came back** = how many of those visitors viewed more than once this month. It
  counts *people*, not page views: someone who reads six pages in one session is one
  visitor who came back once, not six returning visits. (An earlier version of this
  dashboard labelled pages-per-session as "returning visits", which flattered the
  numbers — worth knowing if you compare against old screenshots.)
- In a new month everyone is new again, because the salt rotated. That is the privacy
  design working, not a gap in the data.

## Local development

```bash
ADMIN_PASSWORD=dev-password npm run build && ADMIN_PASSWORD=dev-password npm start
```

Without Upstash vars set locally, `/admin` renders the "not connected" state — which is
exactly what production looks like before step 1.
