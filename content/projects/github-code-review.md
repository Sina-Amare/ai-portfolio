# GitHub Code Review

## What GitHub Code Review is
GitHub Code Review is an AI technical-screening system Sina built in Python. A hiring manager drives it through a Telegram bot: they send a candidate's GitHub repository URL and pick a role (Backend or Frontend), and within minutes get back a structured, scored hiring report — per-criterion scores, a HIRE / NO-HIRE / REVIEW decision, strengths, weaknesses, and detailed feedback. It solves the problem of scaling and standardizing first-pass code review: replacing slow, inconsistent manual repo-reading with a repeatable, criteria-driven evaluation.

## Clean architecture (ports and adapters)
Its standout quality is the architecture: a clean hexagonal / ports-and-adapters design. A pure domain core (dataclasses and enums, no I/O) sits behind four abstract ports — repository, analyzer, storage, and notification — with concrete adapters for GitHub, OpenRouter, SQLite, and Telegram. That means the LLM provider, the repo host, the database, or the chat channel can each be swapped without touching the business logic. It's a genuinely textbook example of swappable, testable design (~168 tests across unit and integration).

## Fitting large repos into context
Rather than blind chunking or embedding, it uses token budgeting. It priority-tags source files (critical, important, useful), then greedily packs the most important code until a token budget is hit, counting tokens exactly with tiktoken and truncating the last overflowing file to the model's context window rather than dropping it. A second pass re-fits the content to whichever model is being used.

## Trustworthy decisions (code overrides the model)
The system does not blindly trust the LLM. A two-phase deterministic decision runs on top of the model's output: it fails the candidate if any mandatory requirement is missing, rejects if the penalty total crosses a threshold, and otherwise scores by average — explicitly overriding an LLM "accept" to "reject" (or vice versa) when the objective requirement counts disagree. Role-awareness is real: Backend and Frontend each load a different scoring rubric, file-exclusion patterns, and mandatory-requirement checklist from external prompt files.

## Anti-hallucination guardrails
Because LLM output is probabilistic, the system verifies it. Every piece of evidence the model cites (file and line) is cross-checked against the real cloned files — the line must exist and the referenced code must actually be there. Invented evidence is dropped and, importantly, never used to penalize the candidate; severe hallucination lowers confidence and can force a retry on the next model in the fallback chain. There's also a JSON-recovery layer that salvages malformed or partial LLM output so the pipeline degrades gracefully instead of crashing.

## How the pipeline runs
The flow is: the manager sends a GitHub URL and role → the repo is shallow-cloned to a temp dir (rejected if over a size cap) → source files are priority-extracted and token-budgeted → the role's rubric is loaded → an ordered multi-model fallback chain (with rate-limit and retry handling) runs the role-specific evaluation → the JSON is parsed/recovered, evidence is verified against real files, and the two-phase decision produces the result → the report is saved to SQLite and rendered back into Telegram, with history queryable later.

## GitHub Code Review tech stack
Python, python-telegram-bot, the OpenRouter API for multi-model LLM access, tiktoken for exact token counting, GitPython for shallow cloning, SQLAlchemy + SQLite for persistence, Pydantic for config, and pytest for the test suite, with a multi-stage Docker build and a systemd unit for deployment. It's the project that best shows Sina's clean-architecture and reliability engineering.
