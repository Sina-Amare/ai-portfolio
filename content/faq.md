# Frequently asked questions

## What is Sina's strongest area?
Sina is strongest in Python backend development and LLM application engineering. He builds resilient backend services with FastAPI and Django/DRF, and designs multi-provider LLM systems with RAG, automatic failover, and API-key rotation. He also works the other side of the problem — evaluating frontier models adversarially at Mercor to find where they break — which is what makes the systems he builds distrust model output by default and verify it instead.

## How many years of experience does Sina have?
Around a year of professional software-engineering experience: six months as a Software Developer at Dekamond (2025) and six months as a Django backend developer at Arnikup (2024, including a two-month internship). On top of that, since April 2026 he has been working remotely as an AI training and evaluation contractor with Mercor, doing adversarial evaluation of frontier language models. He is early in his career and actively growing.

## What does Sina do at Mercor?
Sina works with Mercor as an AI training and evaluation contractor (remote, since April 2026), and the work is adversarial evaluation — deliberately trying to break frontier language models. He designs prompts and evaluation tasks built to make strong models fail, aimed at the places they're weakest: web search and retrieval (forcing the model to actually find and use a source instead of recalling it from memory), multi-step reasoning (where one wrong intermediate step quietly poisons the final answer), and the edge cases where a model sounds completely confident and is simply wrong. For each task he writes a verified golden answer and a single-answer rubric, so every failure is reproducible and can be scored objectively instead of argued about. It's the flip side of building with LLMs: to make them reliable, you first have to know exactly how they break.

## What is Mercor?
Mercor is a talent marketplace that connects domain experts with frontier AI labs. It builds the benchmarks, evaluation environments, and large-scale human datasets used to post-train and stress-test frontier models — work like adversarial prompt writing, evaluation task design, rubrics, and verified reference answers. Sina contributes to that as an AI training and evaluation contractor.

## Does Sina have experience evaluating or red-teaming LLMs?
Yes — it's a core part of his current work. At Mercor he designs adversarial prompts and tasks that expose where frontier models fail on web search, multi-step reasoning, and edge cases, and writes verified golden answers and rubrics so each failure is reproducible and objectively scorable. The same instinct shows up in what he builds: RubricEval grades code against a versioned rubric but leaves the final accept / review / reject call to deterministic code rather than the model, and this portfolio's chatbot refuses out-of-scope questions instead of guessing.

## What is Sina's core tech stack?
Python, FastAPI, Django/DRF, PostgreSQL, Redis, Docker, SQLAlchemy/Alembic, Git, and Linux. For LLM work he uses RAG, LangGraph, multi-provider integration (OpenRouter and Google AI), prompt design, and token budgeting. On the frontend he has used React and TypeScript.

## Is Sina available for new opportunities?
Yes — Sina is a backend and AI engineer who is open to discussing new opportunities. He works remotely from Tehran (UTC+3:30). The best way to reach him is by email at sinaamareh0263@gmail.com.

## Does Sina work remotely?
Yes. Sina is based in Tehran, Iran, and works remotely (UTC+3:30). He has prior remote experience from his backend role at Arnikup.

## Where is Sina based?
Tehran, Iran, working remotely in the UTC+3:30 time zone.

## What is Sina's educational background?
Sina holds a B.Sc. in Computer Science from the University of Guilan (Rasht, 2020–2024) and is pursuing an M.Sc. in Software Engineering at Islamic Azad University, Science & Research Branch, Tehran (2025–present).

## What was Sina's undergraduate research about?
Sina's undergraduate research at the University of Guilan was on Particle Swarm Optimization (PSO) — a population-based optimization algorithm inspired by the collective behavior of swarms, used to search for good solutions to optimization problems.

## Has Sina won any awards?
Yes — Sina placed 2nd in a team Python programming competition at the University of Guilan in 2023.

## What languages does Sina speak?
English at a professional working proficiency, and Persian as his native language.

## What programming languages does Sina use?
Primarily Python. He also uses TypeScript and JavaScript on the frontend (for example, React in ScrapeGPT), and works day to day on Linux with Git.

## What did Sina do at Dekamond?
At Dekamond (2025, six months, Tehran, hybrid), Sina built AI and automation features for Kaleri.ai across business-intelligence tooling, RAG systems, and internal developer tools. He wrote a number of automation systems and data-scraping pipelines to collect and process the data those features run on. He developed multi-provider LLM workflows using LangGraph and RAG behind FastAPI services, integrating OpenRouter and Google AI, and cut LLM running costs by roughly 70% through model routing, caching, and prompt optimization.

## What did Sina do at Arnikup?
At Arnikup (2024, six months, remote, including a two-month internship), Sina built and maintained REST APIs for a food-delivery platform as part of a five-person team (two backend, three frontend). With Django REST Framework and PostgreSQL he modeled the catalog and order data; he offloaded background work like order processing and notifications to Celery, used Redis for caching and as the task broker, and containerized services with Docker. The team collaborated via GitLab and Trello, and tested with pytest and Postman.

## What is Kaleri.ai?
Kaleri.ai is the product Sina built AI and automation features for during his time at Dekamond — spanning business-intelligence tooling, RAG systems, and internal developer tools.

## What is RAG, and does Sina build it?
RAG (retrieval-augmented generation) means grounding a language model's answers in a retrieved knowledge base so they stay accurate instead of being made up. Sina builds RAG systems — at Dekamond, and in this very portfolio chatbot.

## What databases does Sina know?
PostgreSQL as his primary relational database and Redis for caching and queues. He uses SQLAlchemy and Alembic for ORM and migrations.

## What is Sina's experience with Docker?
Sina containerizes services with Docker. He did this on the food-delivery platform at Arnikup and in his own projects.

## Tell me about a hard problem Sina solved.
At Dekamond, Sina cut LLM running costs by roughly 70% through model routing, caching, and prompt optimization, while keeping multi-provider LLM workflows reliable under rate limits using automatic failover and API-key rotation.

## What kind of projects does Sina build?
Production-minded open-source tools: ScrapeGPT (a self-hosted, AI-assisted web scraper where an LLM proposes the selectors and the app re-validates and self-heals them against the real HTML), Aigram (formerly SakaiBot — a self-hosted, installable AI messenger on your own Telegram account: read and send messages with inline media, with an AI co-pilot in every chat for ask-anything, translate, summarize, image generation, and voice, backed by API-key rotation and provider failover), and RubricEval (a rubric-driven code-evaluation platform — repo github.com/Sina-Amare/github-code-review — where an LLM grades a submitted repo or ZIP against a versioned rubric but deterministic code makes the final accept / review / reject decision).

## Tell me about ScrapeGPT.
ScrapeGPT is a self-hosted, AI-assisted web data-extraction app (FastAPI + PostgreSQL + React). You paste a URL and an LLM proposes the extraction fields and CSS selectors from a distilled summary of the page; the app then re-validates those selectors against the real HTML and self-heals the ones that miss, with a table-structure fallback, so even an imperfect AI guess still returns data. It also detects interactive controls (like Metric/Imperial toggles) and drives a real browser to capture each variant, and it's secure by default — SSRF hardening and encrypted bring-your-own keys. It does not solve CAPTCHAs (that's a deliberate non-goal).

## What can Aigram do?
Aigram (formerly SakaiBot) turns your own Telegram account into a self-hosted, installable AI messenger. It's a real web-app messenger — read and send messages with inline media, grouped bubbles, dark/light — with an AI co-pilot in every chat: ask anything, translate (with Persian phonetics), summarize and analyze recent chat history, generate images, and do two-way voice (text-to-speech and transcription). AI results render in a side panel, so you decide what actually gets sent. The point is that Telegram has no built-in AI, and Aigram adds it without leaving the chat or handing your account to a third party. Under the hood it rotates across multiple API keys and fails over Gemini → OpenRouter so it keeps working through rate limits, and a single audited send-bridge with FloodWait-safe throttling keeps the account safe.

## What is RubricEval (the GitHub Code Review project)?
RubricEval is a rubric-driven code-evaluation platform (a Next.js + FastAPI web app; the repo is github.com/Sina-Amare/github-code-review). You define a versioned rubric of weighted, gated criteria, then submit a GitHub repo or a ZIP; an LLM grades each criterion against the real code, and — crucially — a deterministic policy function in code makes the final accept / review / reject decision, so the model never has the last word. Every citation the model makes is verified against the actual files (so hallucinated evidence is dropped), rubrics are content-hashed for reproducibility, and the whole engine can run offline with a FakeLLM for tests. It's built on a clean ports-and-adapters design and a durable, crash-tolerant job queue.

## Why should we hire Sina?
Sina ships production-minded work and writes tests. He's strong on the reliability and security details that matter for backend and LLM systems — multi-provider failover, crash-tolerant jobs, SSRF-safe fetching, and encrypted credentials — and he owns features end to end.

## Is Sina a student?
Sina is pursuing an M.Sc. in Software Engineering while working as a developer, so he balances graduate study with professional and open-source work.

## Does Sina write tests?
Yes — Sina treats tests as part of shipping. He has used pytest and Postman, and writing tests is something he highlights as part of how he works.

## How can I contact Sina?
By email at sinaamareh0263@gmail.com, on GitHub at github.com/Sina-Amare, or on LinkedIn at linkedin.com/in/sina-amareh-909987286.

## How does this chatbot work?
It's a retrieval-augmented chatbot: it turns your question into an embedding, finds the most relevant pieces of Sina's CV and project notes, and answers only from those — with multi-provider failover behind it, the same resilience pattern Sina uses in his work. If a question is outside what it knows, it says so rather than guessing.

## What is Sina's working style?
Sina likes to own a feature end to end — API, data model, tests, and the UI parts that matter. He learns by building, ships steadily with meaningful commits, writes tests as part of the work, and refactors when it helps rather than leaving things half-finished. He cares most about reliability, security by default, and code that's maintainable.

## How does Sina use AI in his work?
Sina treats AI tools as a serious part of his engineering workflow — a reasoning partner, not a replacement for engineering judgment. He uses coding agents like Claude Code, Cursor, Codex, and Antigravity, and works deliberately: analyze the problem and its edge cases, write a short PRD and design the architecture, then build an MVP incrementally with continuous testing. He keeps things simple, digs for root causes instead of patching symptoms, and never blindly accepts a suggestion.

## What is Sina like to work with?
He's a relentless problem solver who hunts root causes, tool-agnostic and always learning, fast and creative with unconventional solutions, and patient with hard problems. His employer at Dekamond summed up his strength as: "Never had to explain something twice. Never came back empty-handed. Your biggest strength? Being a problem solver."

## How quickly does Sina deliver and respond?
Quickly on both. He's comfortable going from prototype to production in days rather than weeks, and he usually replies to messages within about a day.

## What kind of work is Sina available for?
Remote, hybrid, contract, or full-time. He's based in Tehran (UTC+3:30), is available for work now, and has prior remote experience, so working across time zones is familiar.

## When can Sina start?
He's currently available and open to new opportunities. The exact timing is easy to work out — the best next step is to email him at sinaamareh0263@gmail.com so he can talk through the specifics of the role.

## What are Sina's salary or rate expectations?
That really depends on the role, scope, and arrangement, so Sina prefers to discuss compensation directly rather than quote a fixed number up front. Reach out by email at sinaamareh0263@gmail.com and he's happy to talk it through.

## Is Sina open to relocation?
Sina is remote-first and based in Tehran, and he's open to discussing what a role needs. The best way to talk through specifics like location is by email at sinaamareh0263@gmail.com.

## Can Sina work with US or European time zones?
Yes. He's in the UTC+3:30 zone, which overlaps comfortably with European hours and the start of the US day, and he has remote experience working across a distributed team, so he's used to coordinating asynchronously.

## Can Sina do frontend work?
Sina is primarily a backend and AI engineer, but he's comfortable on the frontend when a project needs it — he's built UIs with React and TypeScript, including the ScrapeGPT interface. His center of gravity is backend services and LLM systems.

## What is Sina focused on or learning right now?
AI and LLM engineering is his main focus — multi-provider systems, RAG, and agent workflows — alongside his M.Sc. in Software Engineering, where he's going deeper on software architecture and AI systems. Right now that also includes hands-on frontier-model evaluation: his contract work with Mercor has him designing adversarial prompts and tasks that find exactly where strong models fail (web search, multi-step reasoning, edge cases), which feeds straight back into building LLM systems that don't fall over in production.

## Why does Sina work on AI and LLM systems?
It fits how he thinks. He has an R&D mindset and enjoys problems where the ground shifts quickly, and he's drawn to the engineering challenges of making LLM systems reliable — failover across providers, cost control, and grounding answers so they stay accurate.

## What was Sina's biggest achievement?
At Dekamond he cut LLM running costs by roughly 70% through model routing, caching, and prompt optimization, while keeping multi-provider workflows reliable under rate limits.

## Does Sina have teaching or mentoring experience?
Yes — he taught English and Konkur (university-entrance) students, which sharpened how he explains technical ideas and works with people.

## Can I see Sina's code or resume?
His projects are open source on GitHub at github.com/Sina-Amare, and there's a downloadable résumé on this site. Feel free to dig in.

## How is Sina's English?
Professional working proficiency — he's comfortable interviewing, collaborating, and writing in English day to day. Persian is his native language.

## What's the difference between Sina's two jobs?
At Arnikup (2024) he was a Django backend developer on a food-delivery platform — REST APIs, PostgreSQL, Redis, Celery, Docker. At Dekamond (2025) he moved into AI/LLM engineering, building multi-provider LLM workflows with LangGraph and RAG behind FastAPI for Kaleri.ai. So the arc is backend foundations into applied AI.
