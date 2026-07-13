# Sina Amareh — Profile

## Summary
Sina Amareh is a Python developer with a Computer Science degree and around a year of professional experience, focused on backend services and LLM-powered applications. He is comfortable with Django/DRF and FastAPI, and learns mainly by building — his open-source projects are where ideas get tested and pushed toward production quality. Since April 2026 he has also been working remotely as an AI training and evaluation contractor with Mercor, doing adversarial evaluation of frontier language models. He is early in his career and still growing, but steady about shipping, writing tests, and seeing work through. He is based in Tehran, Iran, and works remotely (UTC+3:30).

## Experience — AI Training & Evaluation (contract) at Mercor (2026 – present)
Since April 2026 Sina has worked remotely as an AI training and evaluation contractor through Mercor. Mercor is a talent marketplace that connects domain experts with frontier AI labs, building the benchmarks, evaluation environments, and large-scale human datasets used to post-train and stress-test frontier models.

Sina's work there is adversarial evaluation — deliberately trying to break strong models. He designs prompts and evaluation tasks built to make frontier LLMs fail, targeting the places they are weakest: web search and retrieval (forcing a model to actually find and use a source rather than recall it from memory), multi-step reasoning (where a single wrong intermediate step quietly poisons the final answer), and the edge cases where a model sounds completely confident and is wrong. For every task he writes a verified golden answer and a single-answer rubric, so each failure is reproducible and can be scored objectively instead of argued about.

It is the same principle that runs through the rest of his engineering: never trust a model's output on faith — verify it against something real, and make the final judgment deterministic. That is literally what RubricEval does (the model grades each criterion; plain code makes the accept/review/reject call), and it is why this portfolio's own chatbot refuses out-of-scope questions rather than guessing. Building reliable LLM systems and knowing exactly how models break are two halves of the same job.

## Experience — Software Developer at Dekamond (2025, 6 months)
At Dekamond (Valiasr Square, Tehran · hybrid), Sina built AI and automation features for Kaleri.ai across business-intelligence tooling, RAG systems, and internal developer tools. He wrote a number of automation systems and data-scraping pipelines to collect and process the data those features run on. He developed multi-provider LLM workflows using LangGraph and RAG behind FastAPI services, integrating OpenRouter and Google AI. He cut LLM running costs by roughly 70% through model routing, caching, and prompt optimization.

## Experience — Django Developer (Backend) at Arnikup (2024, 6 months)
At Arnikup (remote, including a two-month internship), Sina built and maintained REST APIs for a food-delivery platform as part of a five-person team (two backend, three frontend). With Django REST Framework and PostgreSQL he modeled the catalog and order data; he offloaded background work like order processing and notifications to Celery, used Redis for caching and as the task broker, and containerized services with Docker. The team collaborated via GitLab and Trello, and tested with pytest and Postman.

## Skills — LLM application engineering
Sina builds LLM applications with multi-provider integration, automatic failover, and API-key rotation. His work includes RAG (retrieval-augmented generation), prompt design, and token-budgeting to fit large inputs into model context windows.

## Skills — Resilient backend services
Sina builds resilient backend services: asynchronous APIs, background-job crash recovery using lease/watchdog patterns, retries, and graceful degradation under rate limits.

## Skills — Web data extraction
Sina has built web data-extraction systems with SSRF-safe fetching, anti-bot challenge handling, and scope-controlled crawling with per-field quality scoring.

## Skills — Secure-by-default handling
Sina practices secure-by-default engineering: encrypted credential storage with Fernet, JWT authentication, and secret redaction in logs.

## Skills — Core technologies
Sina's core stack is Python, FastAPI, Django/DRF, PostgreSQL, Redis, Docker, SQLAlchemy and Alembic, Git, and Linux.

## Education
Sina is pursuing an M.Sc. in Software Engineering at Islamic Azad University, Science & Research Branch, Tehran (2025–present). He holds a B.Sc. in Computer Science from the University of Guilan, Rasht (2020–2024), where his undergraduate research was on Particle Swarm Optimization.

## Awards and languages
Sina placed 2nd in a team Python programming competition at the University of Guilan (2023). He speaks English at a professional working proficiency and Persian as his native language.

## Contact
You can reach Sina by email at sinaamareh0263@gmail.com. His GitHub is github.com/Sina-Amare and his LinkedIn is linkedin.com/in/sina-amareh-909987286.
