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
- [ ] B1 dependency security (next 16.3.6, audit fix)
- [ ] B2 security & correctness (chat input validation, cache poisoning, deadlines, admin login, cron)
- [ ] B4 workplace section: design-system alignment + professional copy
- [ ] B3 `/fa` locale-prefixed routing + SEO metadata
- [ ] B5 chatbot Persian quality
- [ ] B7 analytics v2
- [ ] B6 UI/UX + accessibility polish
- [ ] B8 performance
- [ ] B9 tests, docs, CI
- [ ] B10 final verification + report

## Current task

B1.

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

Bump Next to 16.3.6, `npm audit fix`, full checks + build.

_Last updated: 2026-09-26_
