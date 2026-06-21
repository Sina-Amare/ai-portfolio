# ScrapeGPT

## ScrapeGPT — overview
ScrapeGPT is a self-hosted AI web data-extraction app built by Sina with FastAPI, SQLAlchemy, and a React/TypeScript frontend. It turns any URL into structured data through a guided analyze → preview → extract workflow, so a user can go from a raw web page to clean, structured fields.

## ScrapeGPT — production-grade engineering
ScrapeGPT was built for production use. It features SSRF-safe fetching (to prevent server-side request forgery), anti-bot handling for Cloudflare and CAPTCHA challenges, crash-tolerant crawling, and encrypted bring-your-own-key credentials so users can safely supply their own provider API keys. The repository is at github.com/Sina-Amare/ScrapeGpt.
