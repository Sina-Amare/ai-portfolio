# RubricEval

## What RubricEval is
RubricEval is a rubric-driven code-evaluation platform Sina built — a full-stack web app (Next.js + TypeScript frontend, FastAPI + async SQLAlchemy backend). Its repository is github.com/Sina-Amare/github-code-review (it started life as a GitHub code-review bot and grew into this platform). You define a rubric — a versioned set of weighted, gated criteria — then submit a GitHub repository URL or a ZIP upload; an LLM grades each criterion against the real code, and a deterministic policy in code makes the final accept / review / reject decision. It's aimed at standardizing and scaling the first-pass technical evaluation of code submissions (for example, candidate take-home repos).

## The problem it solves
Most "AI code reviewers" tangle three different jobs together: what to evaluate, how to judge it, and how to decide. That makes their output unreproducible — one prompt tweak can silently flip every result, and the model's mood decides who passes. RubricEval deliberately separates the three: the rubric is data (not code), the LLM only grades each criterion against the actual files, and a pure policy function makes the decision. So every result is reproducible and auditable.

## The model grades, code decides
The single most important design choice: the LLM never makes the final call. For each criterion the model returns a structured judgment (verdict, score, confidence, rationale, and evidence), but a pure, exhaustively unit-tested policy function decides the outcome — any failed gate means reject, an errored gate forces review, otherwise a weighted mean of the scores is compared to accept/review thresholds. Because the decision is plain deterministic code, it's reproducible and never at the mercy of LLM nondeterminism.

## Evidence verified against the real files
Every citation the model makes is checked against the actual code: the file path must exist, the line range must be in bounds, and any quoted snippet must really appear at those lines. Citations that fail are tagged as unverified and kept but never trusted. This directly defuses LLM hallucination — fabricated evidence can't masquerade as proof.

## Rubrics are versioned, content-hashed data
Each rubric is canonicalized and content-hashed (SHA-256), and every review records the rubric hash, the model id, and the prompt version. So a published rubric can't silently change underneath you, any past result is fully reproducible, and adding a new evaluation is a matter of authoring data rather than changing code.

## Built to run reliably
RubricEval is engineered like production software: ingestion guards against zip-slip and zip-bombs and against malicious git protocols; a durable leased job queue (Postgres FOR UPDATE SKIP LOCKED, with a SQLite fallback and boot-time orphan reclaim) means reviews survive crashes and scale across workers; results stream live to the browser over SSE with a durable, replayable event log; a FakeLLM port lets the whole engine run deterministically offline and in CI; and a golden-set regression harness measures every prompt or model change instead of guessing.

## Architecture
RubricEval uses a clean ports-and-adapters design: the engine depends only on an LLM port, with a LiteLLM adapter (provider-agnostic, bring-your-own-key) for real runs and a FakeLLM adapter for offline/CI. BYO keys are Fernet-encrypted at rest (only ciphertext and a short fingerprint are stored), and the LLM client is hardened for cheap, JSON-shaky models — it embeds the schema in the prompt, toggles JSON mode per model, and recovers/repairs malformed JSON.

## RubricEval tech stack
Backend: Python 3.11, FastAPI, async SQLAlchemy 2 over PostgreSQL or SQLite, Alembic, Pydantic v2, LiteLLM (provider-agnostic), GitPython, Fernet encryption, and SSE. Frontend: Next.js 14 (App Router) + TypeScript, Tailwind, a Monaco code viewer that highlights cited lines, and TanStack Query, with Playwright for end-to-end tests; deployed via Docker Compose. It's the project that best shows Sina's clean-architecture, determinism, and reliability engineering.
