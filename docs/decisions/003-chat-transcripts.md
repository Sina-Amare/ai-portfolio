# 003 — Chat transcripts are kept 30 days, linked to the visit

Status: accepted · 2026-09-28 · owner request

## Context

Since B7a `/admin` counted chat turns only as aggregates (outcome, topic, chip or typed) and
never stored the text: visitors may type personal data, and `docs/yagni.md` parked "storing
chat question free text" until the owner explicitly wanted it and the privacy page said so.
On 2026-09-28 the owner asked for exactly that: "a section to be opened if I want to know
who asked what from the chatbot and the response". Topics can't answer "what did this
recruiter actually ask, and was the answer good?".

## Decision

Every chat turn that gets a reply is stored in `an:chat:<day>` (a Redis list, 30-day TTL
from the day's first turn): the question, the reply exactly as shown (≤ 4,000 chars), the
outcome and canned intent, source labels, language, answering model, latency, a cut-off
flag and the id of the anonymous visit it belongs to (found with the beacon's own
monthly-salted hash and visit pointer). No IP, no name, no new cookie. Writes happen after
the response (`after()`), are skipped outside production, for bots and in the owner's
browser, and stop with the existing 300-turns-a-day chat cap. `/admin` shows them in a
closed-by-default "Conversations" section, grouped by visit, as escaped plain text.
Visitors are told under the chat box and on the privacy page, which also asks them not
to share sensitive personal information.

## Alternatives

- **Topics only (status quo)**: no personal data at rest, but it can't show whether an
  answer was right or what a real recruiter wanted.
- **Store with automatic redaction** (emails, phone numbers): a regex redactor also mangles
  legitimate content (hiring asks that include an email are the point) and gives false
  comfort for names or free-form details. Parked in `docs/yagni.md`.
- **Opt-in per visitor** (a "share this chat" checkbox): most visitors would never tick it,
  so the owner would see a biased sample, and it adds UI to the hero for a private tool.
- **Longer retention (90 days, like visit records)**: more history, but the question text is
  the most sensitive thing stored; 30 days covers "what did people ask this month".

## Assumptions

- Portfolio traffic (tens of chats a day) keeps the cost at ~2 extra Redis commands a turn,
  well inside Upstash's free 500k a month.
- A notice under the chat box plus the privacy page is proportionate transparency for a
  personal portfolio with no profiling and no sharing; it is not a legal opinion.
- The owner reads the transcripts himself; nobody else gets the admin password.

## Revisit when

- A visitor asks for their chat to be deleted (today it expires on its own after 30 days;
  there is no per-turn delete).
- Sensitive personal data shows up in transcripts often (then redaction or a shorter TTL).
- The site adds other people with admin access, or starts using transcripts for anything
  beyond improving the assistant (the privacy copy would have to change first).
