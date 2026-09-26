# Progress

**Goal:** a premium bilingual portfolio whose centerpiece is a grounded RAG chatbot about Sina, plus
case studies, a contact form and private analytics — deployed free on Vercel.

**Architecture (3 lines):** Next.js 16 App Router on Vercel Hobby. `/api/chat` = zod → rate limit →
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
      **Open:** `lib/kb.json` not re-embedded — Google answered 403 (region block) during B4, so
      `npm run embed && npm run eval` is still owed (content + golden are committed).
- [ ] B3 `/fa` locale-prefixed routing + SEO metadata
- [ ] B5 chatbot Persian quality
- [ ] B7 analytics v2
- [ ] B6 UI/UX + accessibility polish
- [ ] B8 performance
- [ ] B9 tests, docs, CI
- [ ] B10 final verification + report

## Current task

B3 — `/fa` locale-prefixed routing + SEO metadata.

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

Start B3. With VPN on: `npm run embed && npm run eval`, commit `lib/kb.json` (B4 content is not in the
chatbot until then).
Owner, before deploying B2: set `CRON_SECRET` in Vercel (the digest cron now fails closed without it).

_Last updated: 2026-09-26_
