# ScrapeGPT

## ScrapeGPT — overview
ScrapeGPT is a self-hosted AI web data-extraction app built by Sina with FastAPI, SQLAlchemy, and a React/TypeScript frontend. It turns any URL into structured data through a guided analyze → preview → extract workflow, so a user can go from a raw web page to clean, structured fields.

## ScrapeGPT — the analyze, preview, extract workflow
The app is built around a guided flow. First it analyzes a page and proposes a schema for the data it can extract. The user previews the fields before committing. Then it extracts the structured data. This step-by-step approach keeps extraction predictable and lets the user correct the schema before running a full extraction.

## ScrapeGPT — production-grade engineering
ScrapeGPT was built for production use. It features SSRF-safe fetching (validating outbound requests so a malicious URL can't make the server reach internal or cloud-metadata addresses), anti-bot handling for Cloudflare and CAPTCHA challenges, crash-tolerant crawling that survives restarts, and encrypted bring-your-own-key credentials so users can safely supply their own provider API keys. The repository is at github.com/Sina-Amare/ScrapeGpt.

## ScrapeGPT — tech stack
The backend is FastAPI with SQLAlchemy for persistence; the frontend is React with TypeScript. It is self-hosted, and credentials are stored encrypted rather than in plaintext. This project is where Sina's web data-extraction and secure-by-default skills come together in one full-stack tool.
