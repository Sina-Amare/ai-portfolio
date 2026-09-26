# Learning

Study briefs, decision-journal entries, terms, and the loop-skip counter (see AGENTS.md §3–4).
Written so any entry can be pasted into a tutor chat that cannot see this repo.

## Loop log

- loop skipped: 2026-09-26 audit-fix milestone (B0–B10) — owner asked for uninterrupted execution and one
  report at the end. Skips in a row: 1.

## Terms

- **Canonical URL** — the one URL a page tells search engines is "the real one". Here: every page used to
  point at the homepage, so Google treated project pages as duplicates.
- **hreflang** — `<link rel="alternate" hreflang="fa">` tags that tell search engines "this page also
  exists in Persian at this URL". Needs one URL per language, which is why `/fa/*` routes exist.
- **Fail open / fail closed** — what a guard does when its own dependency breaks. The admin login limiter
  fails _open_ (lets you try) when Redis is down; the cron endpoint fails _closed_ (rejects) without its secret.
- **CSS cascade layers** — `@layer` groups decide which rules win before specificity does, and
  unlayered CSS beats every layer. Here `.glass` was unlayered, so Tailwind's `hover:bg-*` on the same
  card never applied; moving it into `@layer components` let utilities win again.
- **Rewrite vs redirect** — a redirect tells the browser "go to this other URL" (the address bar
  changes); a rewrite serves another route's content under the same URL. Here `proxy.ts` _rewrites_
  `/projects` to the internal `/en/projects` route, but _redirects_ a typed `/en/projects` to `/projects`.
- **Static generation (SSG)** — pages rendered to HTML once at build time and served from the CDN.
  Reading `cookies()` makes a page per-request; moving the language into the URL made every public
  page static (● in the `next build` route table).
- **Hydration mismatch** — React's error when the HTML the server rendered differs from the client's
  first render. Here `usePathname()` is `/en/projects` on the server but `/projects` in the browser, so
  rendered code uses `useBarePath()`, which strips the prefix on both sides.

## Study briefs

_(added as steps complete)_

## Decision journal

_(added as the owner answers check-questions)_
