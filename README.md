<div align="center">

# Sina Amareh — AI Portfolio

**A premium, bilingual developer portfolio whose centerpiece is a _real_ RAG chatbot — not a mockup.**

Ask it anything about my work and it answers in my own first-person voice, grounded in my actual CV
and projects, streamed token-by-token. It runs on the same multi-provider failover pattern I build
into production systems — so the site itself is a live demo of the craft it describes.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-v6-000?logo=vercel&logoColor=white)](https://sdk.vercel.ai)

**Live:** <https://ai-portfolio-livid-phi.vercel.app>

</div>

<p align="center">
  <img src="docs/screenshots/hero-dark.png" alt="Home page — the chatbot is the hero" width="100%">
</p>

---

## Why this is different

Most portfolios _describe_ what someone can do. This one **proves it on the homepage**: the hero
isn't a tagline, it's a working retrieval-augmented chatbot. Visitors type a real question and get a
grounded, human answer with citation chips back to the source. Out-of-scope questions are refused
cleanly with **no LLM call**, so it never makes things up.

## Highlights

- **Chatbot-as-hero** — a real RAG chatbot is the homepage centerpiece. Answers stream in my own
  first-person voice (sub-second to first token via Groq) with source-citation chips.
- **Structurally anti-hallucination** — three guards: a retrieval **threshold gate** (refuses
  off-topic questions with no LLM call), a **strict grounded prompt**, and a **jailbreak pre-filter**.
- **Multi-provider failover + key rotation** — **Groq** (fastest first-token) → **Gemini 2.5 Flash**
  → **OpenRouter** free models, and **language-aware** (Persian leads with Gemini for fluent output).
  Each provider rotates across multiple comma-separated API keys; if one errors, times out, or hits
  quota, the next key/provider takes over automatically and invisibly.
- **Light LLM load** — greetings, thanks, and off-topic asks get instant canned replies with **no LLM
  call**; a **semantic answer cache** serves paraphrases of already-answered questions without a new
  model call; embeddings are cached and key-rotated too.
- **Bilingual + RTL** — viewer-selectable English / فارسی (Vazirmatn font, right-to-left layout,
  warm colloquial Persian — not stiff machine translation, tech terms kept in Latin).
- **Dark + light** — a refined "Warm Slate + Amber" palette with a toggle, a subtle ambient
  background, and motion that respects `prefers-reduced-motion`.
- **Polished details** — ⌘K command palette, cursor-spotlight cards, precise scroll-to-section nav,
  an auto-scrolling transcript, and a Telegram-delivered contact form.
- **Tested** — 61 unit/component/route tests, Playwright E2E specs (LLM mocked), and a RAG retrieval
  gate (100% refusal on out-of-scope).

---

## How the RAG chatbot works

```text
Browser ── React UI (useChat) ──▶ /api/chat  (Node serverless route)
                                     1. validate + rate-limit; canned reply for greeting/abuse (no LLM)
                                     2. embed the question (Gemini, 768-dim, key-rotated + cached)
                                     3. answer cache — exact + semantic paraphrase hit ▶ instant, no LLM
                                     4. cosine vs kb.json (in-memory, <1ms)
                                     5. THRESHOLD GATE ─ below 0.60? ▶ instant refusal, NO LLM call
                                     6. build a grounded prompt from the top-k chunks
                                     7. streamText() with the language-aware provider failover ladder
                                  SSE token stream ──▶ smooth render + source chips

content/*.md ──(npm run embed)──▶ lib/kb.json   (committed; deploys never re-embed)
```

<p align="center">
  <img src="docs/screenshots/chat-dark.png" alt="A grounded answer with source chips" width="70%"><br>
  <em>A grounded answer — first-person voice, citation chips, no hallucination.</em>
</p>

The failover ladder (in [`lib/rag/providers.ts`](lib/rag/providers.ts)) tries providers in order and
only includes ones whose API key is present. It's **language-aware**: English leads with **Groq**
(Llama 3.3 70B — fastest first-token), then **Gemini 2.5 Flash-Lite → Flash**, then **OpenRouter**
(Qwen3-Next-80B → Llama-3.3-70B); Persian leads with **Gemini** (stronger Persian) and keeps Groq
last. Every provider rotates across all of its comma-separated keys before falling through, so total
capacity ≈ the sum of your keys. Your API keys are **server-side only** and never reach the browser —
the client only ever calls our own `/api/chat`.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, RSC, React Compiler, Turbopack) |
| Language | **TypeScript** · **React 19** |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) · **Motion** |
| Chat / streaming | **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`, `@ai-sdk/groq`, `@ai-sdk/google`, `@openrouter/ai-sdk-provider`) |
| LLM providers | **Groq** (Llama, fastest first-token) · **Google Gemini** (chat + embeddings) · **OpenRouter** (free-model fallback) — language-aware failover + multi-key rotation |
| Retrieval | **In-memory cosine** over a committed `kb.json` — no vector DB, with exact + semantic answer caching |
| Contact | **Telegram bot** delivery (server-side) |
| Testing | **Vitest** · **Testing Library** · **Playwright** · custom RAG eval |
| Hosting | **Vercel** (Hobby / free tier) |

---

## 🚀 Run it yourself

### Prerequisites

- **[Node.js 20+](https://nodejs.org)** (check with `node -v`) and npm.
- **Free API keys** (no credit card). Google is required (it also does embeddings); Groq and
  OpenRouter are optional but recommended for speed and resilience:
  - **Google AI Studio** — chat + embeddings → <https://aistudio.google.com/app/apikey>
  - **Groq** — fastest streaming, leads the ladder → <https://console.groq.com/keys>
  - **OpenRouter** — free-model fallback → <https://openrouter.ai/keys>
  - _Tip:_ put **several keys comma-separated** in any one of these vars to multiply your quota — the
    ladder rotates across them automatically.

### 1 · Clone & install

```bash
git clone https://github.com/Sina-Amare/ai-portfolio.git
cd ai-portfolio
npm install
```

### 2 · Add your API keys

```bash
cp .env.example .env.local        # macOS / Linux
# Copy-Item .env.example .env.local   # Windows (PowerShell)
```

Then open `.env.local` and paste your keys:

```ini
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-studio-key
GROQ_API_KEY=your-groq-key                 # optional, recommended (speed)
OPENROUTER_API_KEY=your-openrouter-key     # optional (extra fallback)
# Optional: the contact form delivers to Telegram
# TELEGRAM_BOT_TOKEN=...
# TELEGRAM_CHAT_ID=...
```

> Any key var accepts **comma-separated** values for multi-key rotation.
> `.env.local` is gitignored — secrets never get committed.

### 3 · Start the dev server

```bash
npm run dev
```

Open **<http://localhost:3000>** and ask the chatbot anything. 🎉

### Common scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` / `npm start` | Production build / serve it |
| `npm test` | Unit + component + route tests (Vitest) |
| `npm run test:e2e` | Playwright E2E (LLM mocked — no keys needed) |
| `npm run eval` | RAG retrieval gate (needs the Google key) |
| `npm run embed` | Rebuild `lib/kb.json` from `content/` after editing the knowledge base |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |

---

## Editing the knowledge base

The chatbot answers from markdown in [`content/`](content/) — CV, FAQ, and one file per project.
After editing, re-embed:

```bash
npm run embed   # re-chunks + re-embeds → lib/kb.json (commit the result)
```

`kb.json` is committed, so deploys never re-embed. **Anything in it is publicly answerable once
deployed** — review before committing.

---

## Project structure

```text
app/
  api/chat/route.ts        # RAG + language-aware provider failover + streaming
  api/contact/route.ts     # contact form → Telegram (validated, rate-limited)
  page.tsx                 # home: chat hero + featured + about + contact
  projects/                # index + [slug] case studies
components/
  home/chat-hero.tsx       # the centerpiece chatbot
  chat/                    # transcript, input, message, suggestions, lang toggle
  ...                      # nav, footer, command palette, theme, motion, ui/
content/                   # the knowledge base (markdown → kb.json)
lib/rag/                   # chunker, cosine, retrieve, threshold, prompt, providers, cache
scripts/embed.ts           # content/*.md → lib/kb.json
tests/                     # unit · component · e2e
```

---

## Deploy (Vercel, free)

1. Push to GitHub and import at **[vercel.com/new](https://vercel.com/new)** (auto-detected as Next.js).
2. Add the environment variables under **Project → Settings → Environment Variables**.
3. Deploy. The chatbot works immediately — `kb.json` ships with the build, so there's no embedding
   step at deploy time.

---

<div align="center">

Built by **[Sina Amareh](https://github.com/Sina-Amare)** · Python backend + AI/LLM engineer
· [LinkedIn](https://www.linkedin.com/in/sina-amareh-909987286)

_The chatbot you're talking to runs on my own code._

</div>
