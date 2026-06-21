# GitHub Code Review

## GitHub Code Review — overview
GitHub Code Review is an automated technical-screening bot built by Sina in Python on top of OpenRouter. It clones a candidate's repository and runs a role-aware LLM evaluation, producing a scored hiring report to help technical screening.

## GitHub Code Review — how it screens candidates
The bot takes a candidate's repository, clones it, and evaluates the code with an LLM in a way that is aware of the role being hired for. The output is a scored hiring report, so a reviewer gets a structured, consistent assessment instead of reading every repository from scratch.

## GitHub Code Review — architecture
The project is built on a clean ports-and-adapters (hexagonal) architecture, which keeps the core logic independent from external concerns like the LLM provider and version control, so they stay swappable and testable. It uses multi-model fallback so a provider hiccup doesn't break a review, and token budgeting to fit large repositories into model context windows while staying cost-controlled. The repository is at github.com/Sina-Amare/github-code-review.
