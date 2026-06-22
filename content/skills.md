# Skills in depth

## LLM application engineering
Sina builds LLM-powered applications end to end. This includes integrating multiple model providers behind a single interface, with automatic failover between providers and models and API-key rotation, so a system keeps working when one provider rate-limits or a key is exhausted. He works with RAG (retrieval-augmented generation) — grounding model answers in a curated knowledge base so they stay accurate — and with prompt design and token budgeting, which means fitting large inputs into a model's limited context window by selecting and trimming the most relevant content.

## Multi-provider failover and API-key rotation
A recurring theme in Sina's work is resilience for LLM systems. Providers go down or rate-limit, and keys hit quotas. Sina designs systems that automatically rotate API keys and fail over across providers and models, so the system keeps responding without manual restarts. He applied this pattern in SakaiBot and in his work at Dekamond — and this very portfolio chatbot uses the same approach.

## Resilient backend services
Sina builds resilient backend services: asynchronous APIs, retries, and graceful degradation under rate limits. He has implemented background-job crash recovery using lease/watchdog patterns, where a long-running job that crashes can be safely detected and resumed rather than lost or duplicated.

## Web data extraction
Sina has built web data-extraction systems. This includes SSRF-safe fetching — validating outbound requests so a malicious URL can't make the server reach internal or cloud-metadata addresses — anti-bot challenge handling (for example, waiting out Cloudflare JS challenges — it does not solve CAPTCHAs), and scope-controlled crawling with per-field quality scoring. ScrapeGPT is his main project in this area.

## Secure-by-default handling
Security is a default for Sina, not an afterthought. He uses encrypted credential storage with Fernet (symmetric encryption) so users can bring their own provider keys without storing them in plaintext, JWT authentication for APIs, and secret redaction in logs so sensitive values don't leak into log output.

## Core technologies
Sina's core stack is Python, FastAPI, and Django/DRF on the backend; PostgreSQL and Redis for data and caching; Celery for background jobs; Docker for containerization; SQLAlchemy and Alembic for ORM and migrations; and Git and Linux for everyday development. On the frontend he has worked with React and TypeScript (for example, the ScrapeGPT UI). For LLM work he uses RAG, LangGraph, and multi-provider integration with OpenRouter and Google AI.

## Testing and collaboration
Sina writes tests as part of shipping. He has used pytest and Postman for testing and API verification, and collaborated through GitLab and Trello in team settings. At Arnikup he worked in a five-person cross-functional team (two backend, three frontend).
