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
      on Windows Chromium; they do on phones). Review follow-up: every card read from the month hashes
      (pages by time, sections, what visitors did, acquisition) now shows its months (gap-5), the
      chip/typed card no longer shares the chat KPI's title, the visit log's "+N" uses Persian digits,
      the digest names the months its chat topics cover, and a route-change flush credits time only
      (it no longer reads the next page's sections).
- [x] B6 UI/UX + accessibility polish — skip link above the header (start-4), --danger token and no
      opacity on muted small text (light-theme AA), focus ring keeps a control's corners, .eyebrow and
      h1–h5 defaults layered, Send/Stop focus ring, Persian mono text in Vazirmatn (JetBrains Mono named
      directly: Turbopack keeps next/font's Arial fallback even with adjustFontFallback: false), fa palette
      headings untracked, gallery = native `<dialog>` (focus back to its thumbnail, caption on focus),
      palette = cmdk Command.Dialog (focus restored, "Ctrl K" off a Mac), /projects h1 + sr-only h1 in
      chat, titles outside `<Reveal>` above the fold, one auto-retry, Escape closes the mobile menu,
      password-manager login, aria-busy log + spoken "Thinking…", focus after New chat, LTR code in
      Persian answers, chat saved only on "ready", markdown while streaming (useChat throttle 50 ms),
      contact form keeps focus, IME-safe Enter, avatar eager (no deprecated priority), bidi-isolated
      /projects in Persian privacy copy. Already done earlier: ui-1 (B4), hero LocaleToggle (B3), gallery
      RTL arrows (B4). Not done: 40px suggestion chips (30px passes AA's 24px), outside-tap closing
      the mobile menu. e2e 20/20 on `next dev -p 3100` (port 3000 is in a Windows excluded range here).
      Review follow-up: Ctrl/Cmd+K is ignored while the gallery `<dialog>` is open (the palette opened
      inert beneath it and froze the lightbox); the mobile menu's Search hands focus to the menu button,
      so closing the palette lands there, not on `<body>`. Accepted: naming JetBrains Mono directly drops
      next/font's metric fallback, so Latin mono labels may shift slightly while it loads — measure in B8.
- [x] B8 performance — measured on the production build (`.next/diagnostics/route-bundle-stats.json`,
      gzip; Playwright traces on a 390 px @3x, 4x-CPU-throttled phone profile). First-load JS: home
      436 → 380 KB, /privacy and /admin −15 KB (cmdk), /projects 258 → 248 and case studies 237 → 228
      (cmdk out, next/image's client code in). react-markdown loads with the
      first answer (plain text meanwhile, warmed on send) (web-6); cmdk loads on the first ⌘K, the
      layout keeps only the shortcut listener (web-7). Covers + gallery thumbnails via next/image: four
      home covers 205 KB → ~45 KB on desktop, ~100 KB on a 3x phone; lightbox keeps the full file
      (web-15). Motion (web-8): the endless sheen repainted the headline ~45×/s forever → 3 passes;
      orb `blur(80px)` was redone by the GPU every frame (scroll ~25 fps) → same glow drawn with
      gradient stops (mean pixel diff < 1/255), orbs still on phones: idle phone page 0 frames after
      the sheen, scroll ~52 fps. While the sheen runs (first 21 s) it now paints at full frame rate.
      CLS on a slow-4G phone load: / 0.012, /fa 0 (the JetBrains Mono swap is not a problem). e2e 20/20
      against `next start`. The 14 screenshots now go through Vercel Image Optimization (the avatar
      already did), a few widths each; check its usage page after deploy (Hobby has a monthly quota).
      Review follow-up: the first ⌘K shows the dialog's backdrop while cmdk loads (a click or Escape
      cancels), so it no longer looks dead on a slow network; a video media item must have a poster
      (the type enforces it: next/image can't resize an .mp4); the static-orb rule is `width < 40rem`,
      the exact complement of Tailwind's `sm`. e2e 20/20 again.
- [x] B9 tests, docs, CI — tests: admin login 401 / cookie flags / 429 (in-memory and shared) /
      Redis down still signs in, beacon with no Origin (health-5; the digest's 401 and silent-at-0
      were already covered); EN/FA ladder order (health-6; rotation was covered); `lib/kb.json` ↔
      `content/` sync with no network, using the embed script's own walk, now
      `scripts/collect-docs.ts` (health-7); dead coverage config gone (health-16). Already done
      earlier: chat-10 realistic stream mocks (B2), e2e for /fa + hreflang (B3) and workplace (B4).
      Docs: README (analytics at /admin, /fa URLs, exact cache before embed, env, structure, scripts)
      (health-10), docs/analytics.md checked against the code (HKDF session key, prefixed Redis
      vars, CRON*SECRET in setup, monthly salt, PowerShell-friendly local dev) (health-11, sec-10),
      `.env.example` lists every variable the code reads with current defaults (health-12; the
      0.60 threshold comment was already right). CI (health-13): `vercel.json` runs `npm test`
      before the build, so a red unit test blocks the deploy; vitest pins NODE_ENV=test because 53
      tests fail if the build shell exports production; a skipped RAG eval shows a ::warning::.
      Four study briefs + terms in learning.md. `npm test && npm run build` passes locally.
      Review follow-up: the Vercel build hands the tests the production env, and the Upstash
      integration's `KV_REST_API*\*`made one fail (every deploy blocked). vitest.config.ts now drops
    every variable`.env.example`documents plus any Redis REST credential, so tests never read
    real secrets or tuned limits; CI runs them with fakes to prove it. The admin cookies'`Secure`
      flag in production is pinned too. 226 tests, green under a fake full Vercel env.
- [ ] B10 final verification + report

## Current task

B10 — final verification + report (last batch in the execution order).

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

Start B10: production build + `npm start` + e2e, the Playwright visual QA matrix, curl checks,
final independent review of the branch, then the owner report. After deploy: check that
`/_next/image` serves the covers on Vercel, and that the first Vercel build log shows the unit tests
running before `next build`. Owner, before deploying: set `CRON_SECRET` in Vercel (the digest cron
fails closed without it).

_Last updated: 2026-09-27 (B9 done, review fixes in)_
