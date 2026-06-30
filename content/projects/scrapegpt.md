# ScrapeGPT

## What ScrapeGPT is
ScrapeGPT is a self-hosted, AI-assisted web data-extraction app that Sina built (FastAPI + PostgreSQL backend, React/TypeScript frontend). Instead of hand-writing brittle CSS selectors, the user pastes a URL and an LLM analyzes the page and proposes the extraction fields and selectors; the user reviews and edits them, previews the result, and runs an extraction that crawls same-site pages and exports clean CSV, JSON, or XLSX. It is AI-assisted, not fully autonomous — the AI proposes, the human reviews and confirms.

## The problem it solves
Scrapers built on hand-written selectors are fragile: a small layout change and they silently return nothing, and writing them by hand for every site is slow. ScrapeGPT lets an LLM discover the selectors from the page itself, then makes the extraction resilient so a wrong or imperfect AI guess doesn't mean zero results.

## How the AI selector works
The LLM never sees raw HTML. ScrapeGPT first builds a distilled "DOM summary" — it strips noise (script/style/svg), then surfaces structural signals like CSS classes repeated across sibling elements (likely list items), JSON-LD, table samples, and pagination candidates, capped to stay cheap. The LLM is asked for a strict JSON schema: a repeated-item selector plus candidate fields, each with its own selector, data type, and a confidence score. This is the "AI selector" — the model discovers structure rather than the user hardcoding it.

## Why it's resilient (self-healing selectors)
ScrapeGPT never trusts the AI's selectors blindly. Every selector is re-run against the real fetched HTML: if the repeated-item selector matches nothing its confidence is capped; if a field selector misses, it's automatically relaxed (dropping over-specified trailing tags) and only demoted if it still fails. On top of that there's a multi-tier extraction fallback — repeated-container extraction, then whole-page field extraction, then a table-structure fallback that reads the largest real table by column and fuzzy-matches field labels to headers. So even weak AI selectors still yield records.

## Dynamic, interaction-aware scraping
Beyond static HTML, ScrapeGPT detects interactive on-page controls — toggles, segmented buttons, and dropdowns (for example "Metric / Imperial" or "per 100 g / per serving") — then drives a real browser to flip each control, waits for the client-side re-render to actually change the DOM, and captures one snapshot per variant. The crawl scope is evidence-based: it only recommends a broad crawl (pagination, collection, full-site) when the selector actually matches real links on the page, avoiding the classic "the AI claimed pagination but the page has none" failure. The crawler stays same-origin.

## Safety and security
Security is built in. SSRF hardening blocks private, loopback, and cloud-metadata addresses, validates every redirect hop, and pins the actually-connected peer IP to defend against DNS rebinding. Provider API keys are bring-your-own and stored Fernet-encrypted (never plaintext); all LLM calls go through LiteLLM so any provider works, with JSON repair, schema validation with retries, rate-limit backoff, and secret redaction on every error path. Solving CAPTCHAs or Turnstile is explicitly a non-goal — ScrapeGPT does not bypass them.

## Crawl scope and trust signals
ScrapeGPT walks the user through a guided workspace — Review → Fields → Scope → Check → Extract. The crawl scope is an explicit, evidence-based choice: this page only, this list across pages, this dataset, or the whole site, with a broad-crawl confirmation gate. Before extracting, a frontier preview shows exactly which URLs are included or excluded and why, so the crawl is never a black box. After extraction, results carry field-coverage trust signals so the user can see how complete the data actually is, and records are served server-side paginated.

## How the pipeline runs
The flow is: validate the URL and fetch it (static httpx, escalating to a stealth browser only if needed) → build the DOM summary → the LLM proposes selectors and fields → re-validate and self-heal selectors against the real HTML → the user reviews fields, picks scope from the frontier preview, and previews a sample → bounded same-origin crawling with leased crawl-page tracking and idempotent inserts, plus a lease reaper and a stuck-project watchdog for reliability → results export to CSV / JSON / XLSX, with an honest failure taxonomy (no-records, bot-blocked, all-pages-failed → the project is marked FAILED) instead of a misleading empty success.

## ScrapeGPT tech stack
FastAPI, PostgreSQL (async SQLAlchemy + Alembic migrations), httpx and BeautifulSoup/lxml for parsing, optional Playwright/camoufox for JS-heavy pages, LiteLLM for provider-agnostic LLM calls, JWT auth, Prometheus metrics, and a React 18 + Vite + Tailwind frontend. It's the project where Sina's resilience and security engineering show up most clearly.
