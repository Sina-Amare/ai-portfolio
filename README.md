# Sina Amareh — AI Portfolio

A premium, bilingual (English / فارسی) developer portfolio whose centerpiece is a **real
retrieval-augmented chatbot** grounded in my CV — not a mockup. Built with Next.js 16 and
deployed 100% free on Vercel.

**Live:** _coming soon on `*.vercel.app`_

---

## Highlights

- **Live RAG chatbot** — answers questions about me in my own first-person voice, streamed
  token-by-token. Grounded in a curated knowledge base; it never makes things up.
- **Bilingual + RTL** — viewer-selectable English / Persian, with a proper Vazirmatn font,
  right-to-left layout, and warm, colloquial Persian answers.
- **Multi-provider failover** — Gemini 2.5 Flash → Gemini Flash-Lite → OpenRouter free models,
  with key rotation (the same resilience pattern from my CV).
- **Structurally anti-hallucination** — three guards: a retrieval threshold gate (refuses
  out-of-scope questions with no LLM call), a strict grounded prompt, and a jailbreak pre-filter.
- **Premium, restrained design** — dark glassmorphism, a single violet accent, Geist type,
  surgical motion that respects `prefers-reduced-motion`.
- **Tested** — 42 unit/component/route tests, 7 Playwright E2E specs (LLM mocked), and a
  23-item RAG retrieval gate (100% refusal on out-of-scope).

## Stack

Next.js 16 (App Router, RSC, React Compiler) · TypeScript · Tailwind v4 · Vercel AI SDK v6 ·
Google Gemini + OpenRouter · in-memory cosine RAG (no vector DB) · Motion · Vitest · Playwright.

## Architecture

```text
Browser ── React UI (useChat) ──▶ /api/chat (Node serverless route)
                                     1. validate + rate-limit
                                     2. embed query (Gemini)
                                     3. cosine vs kb.json (in-memory, <1ms)
                                     4. threshold gate ─ below? ▶ instant refusal (no LLM)
                                     5. grounded prompt (top-k chunks)
                                     6. streamText() with provider failover
                                  SSE token stream ──▶ smooth render + source chips

content/*.md ──(npm run embed)──▶ lib/kb.json   (committed; no embedding at deploy time)
```

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the keys below
npm run dev                  # http://localhost:3000
```

## Environment variables

All keys are **server-side only** (never exposed to the client).

| Variable | Purpose | Free? |
| --- | --- | --- |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Embeddings + chat (Gemini) | Yes — [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `OPENROUTER_API_KEY` | Chat fallback (free models) | Yes — [openrouter.ai](https://openrouter.ai/keys) |
| `GROQ_API_KEY` _(optional)_ | Extra-fast streaming | Yes — [console.groq.com](https://console.groq.com/keys) |
| `RAG_THRESHOLD` _(optional)_ | Override relevance gate (default `0.62`) | — |

## Knowledge base

The chatbot's knowledge lives as markdown in [`content/`](content/). After editing it:

```bash
npm run embed   # re-chunks + re-embeds → lib/kb.json (commit the result)
```

`kb.json` is committed, so deploys never need to re-embed. Anything in it is publicly answerable.

## Testing

```bash
npm test          # unit + component + route (Vitest)
npm run test:e2e  # Playwright E2E (LLM mocked — deterministic, no keys)
npm run eval      # RAG retrieval gate (needs the embedding key)
npm run typecheck && npm run lint
```

## Deploy (Vercel, free)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) (framework auto-detected as Next.js).
3. Add the environment variables above in **Project → Settings → Environment Variables**.
4. Deploy. The chatbot works immediately — `kb.json` ships with the build.

---

Built by Sina Amareh. The chatbot you're talking to runs on my own code.
