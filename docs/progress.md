# Progress

**Goal:** a premium bilingual portfolio whose centerpiece is a grounded RAG chatbot about Sina, plus
case studies, a contact form and private analytics — deployed free on Vercel.

**Architecture (3 lines):** Next.js 16 App Router on Vercel Hobby; routes live in `app/[lang]`, `proxy.ts`
serves English unprefixed and Persian at `/fa` (all public pages static). `/api/chat` = zod → rate limit →
in-memory cosine retrieval over committed `lib/kb.json` → relevance gate → Groq/Gemini/OpenRouter
failover ladder (streamed). Analytics = cookieless beacon → Upstash Redis → `/admin` + Telegram digest.

## Done so far

- Site live at sinaamareh.ir: chat hero, 4 project case studies, workplace-agents section, contact → Telegram,
  `/admin` analytics, EN/FA with RTL.
- 2026-09-26 onboarding audit (7 reviewers + critic, adversarially verified): ~110 findings. Fix plan in
  progress on branch `claude/audit-fixes` (not pushed — pushing `main` deploys).

## Current milestone — "audit fixes + /fa + analytics v2"

Done-when: every verified finding fixed or consciously skipped; Persian served at indexable `/fa/*` URLs;
`/admin` shows real visits (sessions, active time, section reach, actions); all checks green; owner has a
checklist to verify.

- [x] B0 hygiene — prettier width 100 + formatting commit, NDA excluded from tsc, AGENTS.md §1 filled
- [x] B1 dependency security (next 16.3.6, audit fix)
- [x] B2 security & correctness (chat input validation, cache poisoning, deadlines, admin login, cron)
      — 16 commits, 125 tests. Skipped on purpose: "stop the ladder on a 400" (Gemini answers an invalid
      key with 400, so one bad key would kill the whole ladder). `.env.example` not touched (CRON_SECRET
      now required, ADMIN_LOGIN_GLOBAL_MAX default now 500) — left for B9. Review follow-up: embed 8s
      timeout now has a test; the Redis daily chat cap stays shared across environments on purpose
      (same API keys) — B7's production-only gate (sec-5) is for analytics writes only.
- [x] B4 workplace section — rebuilt on `ProjectCardView` + `CaseStudySections` (home cards link to
      `/projects#<id>`, mini case studies on /projects), EN/FA copy rewritten, EN workplace chip + every
      chip in the golden set, gallery/arrows mirror in RTL, card focus ring, `.glass` layered.
      Review follow-up: `lib/kb.json` re-embedded (eval 88/88), headings in RTL islands use Vazirmatn,
      BI "every number traces to the data" outcome softened.
- [x] B3 `/fa` locale-prefixed routing + SEO metadata — `app/[lang]` + `proxy.ts` (rewrite to /en, 308
      /en/\*, Persian auto-detect on entry only), every public page SSG, per-page canonical/hreflang/og
      (`lib/seo.ts`), bilingual sitemap, Persian OG card (Chromium screenshot; Satori can't lay out
      Persian), link-based toggle, /privacy linked + counted, dark theme-color. Decision:
      `docs/decisions/001-locale-prefixed-urls.md`. Known cost: page-level 404s render after hydration
      (Next's error shell), status still 404. Local e2e: run with `--workers=2` (dev server times out
      under 8 parallel workers on this machine). `next dev` re-appends a block to AGENTS.md — revert it.
      Review follow-up: /privacy now names the `locale` cookie, manifest no longer claims `standalone`,
      the hero's language switch is locked while an answer streams (the nav toggle still drops an
      in-flight turn, like any navigation). `/nope` 404 regression (blank without JS) accepted and
      documented in decision 001 + yagni.md.
- [x] B5 chatbot Persian quality — Persian anti-calque + «بدونی/بدونم» prompt guards restored (and
      tested), Persian canned replies speak as Sina, a Persian-script question gets a Persian answer
      whatever the toggle (Finglish stays with it), Finglish small talk, majority-script bubble
      direction (BOM ignored), Arabic ي/ك folded before matching/embedding, Persian source chips,
      jailbreak filter matches commands not topics, cached replies at the live 4ms/word pace.
      `npm run eval` now also checks entity-swapped chips vs the 0.94 semantic-cache cut-off: 94/94,
      closest pair 0.62. The greeting keeps "I'm Sina's AI assistant" in both languages on purpose.
      Review follow-up: Persian words count double in `detectDir` (Persian heavy with Latin terms
      stays RTL); "ignore/forget … instructions" only refuses when it opens a clause, so descriptive
      questions about prompt injection get through.
- [x] B7a analytics v2, server side — visits are server-side sessions (sliding 30-min pointer, reload
      dedupe, acquisition once per visit), engaged mark, active-time buckets, section reach/dwell, events,
      returning = 2+ visits this month (gap-2), chat outcome/topic/chip per month (never the text), owner
      `sa_owner` cookie + dev gate (gap-10, sec-5), EXPIREs only on key creation (gap-6), in-memory
      beacon pre-check + a daily budget charged in real Redis commands (health-3, sec-2). `getInsights`
      is the new read side (KPIs, series, buckets, pages, sections, events, chat, acquisition + months,
      recent 50 visits, since). Decision 002. (The v1 dashboard/digest it left behind were replaced in
      B7b.) Review follow-up: an empty flush after 30 idle
      minutes no longer starts a ghost "returning" visit, racing first beacons (tabs opened together)
      share one visit (`SET NX`), section reach divides by the visits that opened the section's page
      (`vk:`); an engagement-started visit still counts its page once (documented choice).
- [x] B7b analytics v2, client + dashboard — tracker measures active time (visible + input in the
      last 60 s, sampled each second), sections seen/dwell (`data-analytics-section` on home, /projects,
      case study) and actions (`track()`: chat chip/typed, contact, résumé, outbound by target, gallery,
      palette, language; links via one delegated listener), flushed on route change/hide/pagehide/each
      minute with sendBeacon, silent under `navigator.webdriver`. `/admin` rebuilt on `getInsights`:
      KPIs, visits-vs-engaged chart (ui-10), active-time buckets, pages by time, section funnel, actions,
      acquisition labelled with its months (gap-5, gap-1), last-50 visit log; Persian digits (gap-13);
      two KPI cards per row on phones (checked at 390 px and 1440 px with a fixture page, not committed).
      Digest reports yesterday vs the day before, silent at zero (health-4). Privacy page discloses the
      v2 data, the 90-day visit log, chat providers, Telegram and owner-only cookies (gap-3, codex-6 —
      these B6 items are done). v1 `getOverview` removed. For B9: `.env.example` needs
      ANALYTICS_RPM=30, ANALYTICS_DAILY_COMMANDS=12000 (replaces ANALYTICS_DAILY_MAX) and
      ANALYTICS_IN_DEV. For B10: look at `/admin` with real data after deploy (flag emoji don't render
      on Windows Chromium; they do on phones).
- [ ] B6 UI/UX + accessibility polish
- [ ] B8 performance
- [ ] B9 tests, docs, CI
- [ ] B10 final verification + report

## Current task

B6 — UI/UX + accessibility polish (next in the execution order: B6 → B8 → B9 → B10). Its privacy-copy
items (codex-6, gap-3) were done in B7b.

## Blocker

None.

## Assumptions

- Workplace-agent claims (LangGraph, MCP, features) are true — owner confirmed 2026-09-26.
- Public résumé phone number and portrait are intentional — owner confirmed 2026-09-26.

## Open questions

- Should chat analytics ever store the free-text question? Default: no (topics + chip labels only).

## Parking lot

See `docs/yagni.md`.

## Next likely action

Start B6. Analytics v2 is complete end to end (B7a + B7b), so the branch no longer has a
half-migrated dashboard. Owner, before deploying: set `CRON_SECRET` in Vercel (the digest cron fails
closed without it).

_Last updated: 2026-09-27 (B7b done)_
