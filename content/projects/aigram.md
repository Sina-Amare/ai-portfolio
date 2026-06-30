# Aigram

## What Aigram is
Aigram is a self-hosted, installable AI messenger that Sina built in Python (it was formerly called SakaiBot — the GitHub repo is now github.com/Sina-Amare/Aigram, and the Python package and `sakaibot` CLI keep the old name for backward compatibility). It runs as a userbot on your own Telegram account (via Telethon/MTProto, not the Bot API), wrapped in a glassy, installable web app. Unlike the original slash-command-only userbot, Aigram is now a real messenger you can read and send from — grouped bubbles, inline media, replies, live updates, dark and light — with an AI co-pilot layered into every chat. The principle is "your account, your keys, your server": nobody else holds your session.

## The problem it solves
Telegram has no built-in AI, and the usual ways to add one are bad: copy-paste into a separate app, or hand a third-party bot access to your account. Aigram injects on-demand LLM superpowers directly into your own Telegram — analyze a chat, ask about its history, prompt anything, translate, generate images, do voice — right where the conversation already is. And because the AI's output renders in a side panel rather than auto-sending, you always decide what (if anything) actually gets sent.

## A real messenger, not just a bot
The web app feels like a genuine Telegram client: a chat sidebar with last-message previews, grouped message bubbles, date separators and relative timestamps, inline photos/stickers/video/voice/files, a per-message menu (reply, copy, edit, forward, delete), and a profile view with shared-media tabs — in a premium light or dark theme. New messages, live typing indicators, and online/last-seen presence are pushed over Server-Sent Events with no polling (and a polling fallback if the stream drops). It is an installable PWA (service worker, manifest, icons), so over a free Cloudflare Tunnel you can add it to your phone's home screen and use the full messenger on mobile.

## AI in every chat (the commands)
The AI is reached from an ✨ AI sheet inside any chat (or as /commands typed in Telegram itself), and results render in the panel:
- /prompt — ask the AI anything, with optional deep-thinking (reasoning) and web-search modes.
- /translate — translate text, returning Persian phonetics, with automatic source-language detection.
- /analyze — analyze the last N messages, with selectable modes (general, fun/roast, romance, and a deep-thinking mode).
- /tellme — answer a question from the chat's actual history (RAG over the last N messages).
- /image — generate an image (flux or sdxl); the prompt is auto-enhanced by an LLM first.
- /tts and /stt — two-way voice: synthesize speech, and transcribe a voice note and summarize it.

Every AI result is persisted and categorized (Analyze, Ask, Translate, Prompt, Image, Voice, Transcribe), so the panel keeps a filterable history that survives a reload — and whenever a provider or model has to fall back, an amber note in the result says so.

## One audited path to Telegram
Architecturally, the FastAPI web app and the Telethon client share a single MTProto session on the same asyncio event loop — one client, never a second login. The AI core returns values; the panel is a clean consumer that renders them. Critically, a single audited bridge (messenger_service.py) is the only place in the codebase that ever writes to Telegram, and it is guarded by a ban-safety throttle that paces sends and handles Telegram's FloodWait. This concentrates all the account-risk into one reviewed, rate-limited path.

## Why it's resilient
Resilience is a first-class feature — the same pattern Sina builds everywhere. Aigram runs on Google Gemini as the primary provider with OpenRouter as fallback, and rotates up to four API keys per provider, automatically failing over on rate limits or quota exhaustion. Defaults are pinned to free-tier-friendly models (gemini-2.5-flash / gemini-2.5-flash-lite). Keys and models are managed live in a Keys & Providers panel — add, test, and hot-swap them with no file editing and no restart.

## Self-host, private, and free
Aigram is built to be cheap and private to run: a setup wizard logs you in and writes config, and it deploys to a ~€1.49 crypto VPS (no credit card), a home device, Termux, or a Raspberry Pi, reachable over a Cloudflare Tunnel — including an explicitly Iran-friendly path. Because it logs in as a real account (a userbot), the README is candid that this is against Telegram's ToS and carries ban risk, which is exactly why the single audited send-bridge and FloodWait-safe throttling exist.

## Aigram tech stack
Python on Telethon (userbot on your own account), a FastAPI backend with a build-step-free vanilla-JS PWA front end on a shared asyncio loop, Google Gemini and OpenRouter as the two LLM providers (primary → fallback) with up to 4-key rotation each, image generation via external Cloudflare Worker endpoints, speech-to-text and text-to-speech for voice, a Click + Rich CLI (`sakaibot setup` / `panel` / `monitor`), Pydantic settings, Docker/compose deployment, and a pytest suite (with live Playwright E2E against real Chromium). It's the clearest showcase of Sina's multi-provider failover, API-key rotation, and "one audited side-effect path" engineering — now grown from a command bot into a full product.
