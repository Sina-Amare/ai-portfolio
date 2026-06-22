# SakaiBot

## What SakaiBot is
SakaiBot is an AI-powered Telegram userbot that Sina built in Python on Telethon. It runs on your own Telegram account (not the Bot API), so AI commands work inside any chat you're already in — private or group. The real problem it solves: Telegram has no built-in AI, so SakaiBot injects on-demand LLM superpowers — ask anything, translate, summarize and analyze chat history, generate images, and do voice in and out — just by typing a slash command, instead of copy-pasting into another app. It edits your own message in place with the answer.

## What it can do (the commands)
- /prompt — ask the AI anything, with an optional deep-reasoning mode and a web-grounded (search) mode.
- /translate — translate text, and for Persian it also returns a phonetic pronunciation; works as a reply to any message.
- /analyze — AI analysis of the last N messages, with selectable personas (a structured general mode, a comedic Persian "roast", and a relationship-signals mode).
- /tellme — RAG-style question answering over the last N messages of the actual chat history.
- /image — generate images from a prompt (the prompt is first rewritten/enhanced by an LLM).
- /tts and /stt — two-way voice: synthesize speech from text, and transcribe a voice message and then summarize it.

## Why it's resilient
Resilience is a first-class feature, the same pattern Sina builds everywhere. SakaiBot rotates across multiple API keys (marking a key exhausted until its quota resets), fails over from Gemini to OpenRouter on any error, and drops from the Pro tier to the Flash tier when a model is quota-exhausted. It adds circuit breakers and per-user rate limiting (a token bucket) so it keeps answering through rate limits and key exhaustion with no manual restarts.

## Thoughtful real-world details
SakaiBot is Persian-first and clearly built by someone who actually ran it: RTL-aware formatting, automatic pagination around Telegram's 4096-character message limit, in-place editing of your own message, per-chat concurrency locks so one chat can't run two heavy jobs at once, queued image generation with position updates, and partial retries on individual voice chunks. Every reply carries metadata about which model actually served it.

## Local web control panel
A recent addition is a local web control panel: a FastAPI app (started with `sakaibot panel`) that binds to loopback only, is guarded by a per-run bearer token, and reuses the same Telethon session and event loop as the running userbot. From a browser you can list chats and history and run every AI command — but it's deliberately read-only toward Telegram: it returns results to the browser and never sends, edits, or forwards messages, so you can drive the account from a GUI with no risk of accidental sends or a second login.

## SakaiBot tech stack
Python on Telethon (userbot on your own account), Google Gemini and OpenRouter as the two LLM providers in a primary→fallback relationship, image generation via external Cloudflare Worker endpoints, Google Web Speech for transcription and Gemini for text-to-speech, a FastAPI + uvicorn local control panel, plus a Click + Rich CLI, Pydantic settings, structured logging, Docker/compose deployment, and a pytest suite. It's the clearest showcase of Sina's multi-provider failover and API-key rotation work.
