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

## Study briefs

_(added as steps complete)_

## Decision journal

_(added as the owner answers check-questions)_
