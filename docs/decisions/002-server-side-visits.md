# 002 — Visits are server-side sessions in Redis

Status: accepted · 2026-09-26 · batch B7a

## Context

The owner asked for "real analysis, no noise": who visited, how long they really engaged,
which sections they used, and "a return shouldn't always count as a new visit". v1 stored
per-pageview counters only, so a visit, its duration and a genuine return did not exist
as data. The site is cookieless for visitors and runs on Upstash's free 500k commands/month.

## Decision

A visit is every beacon from one visitor hash (monthly-salted, as before) with under 30
minutes of inactivity. The server keeps a pointer `an:s:<vid>` → visit id with a sliding
30-minute TTL and a 90-day per-visit record; daily and monthly hashes hold the aggregates.
Acquisition is counted once per visit, engagement GA4-style (10 s active, 2 pages or a key
event), returning = 2+ visits this month. The owner's browser is excluded by a year-long
`sa_owner` cookie set at admin login.

## Alternatives

- **Client-side session id** (sessionStorage or a cookie): simpler reads, but puts an
  identifier on the device, which the privacy model avoids.
- **Third-party analytics** (Vercel WA, Plausible): no per-visit timeline, no timezone, and
  a 24-hour hash makes "returning" unanswerable.
- **Lua scripts** for atomic multi-step writes: fewer round trips and exact races, but
  untestable with the in-memory fake Redis. Two small races are accepted instead (noted in
  `lib/analytics/session.ts`).

## Assumptions

- ~100 real visits a day fit the 12k-commands/day beacon budget; more is refused, not billed.
- A visitor hash is stable within a month (IP + user agent), so a network change mid-visit
  starts a new visit.

## Revisit when

- Daily traffic regularly hits the command budget (move to a paid tier or Lua scripts).
- The site needs cross-month identity (it would need a longer salt — a privacy trade).
