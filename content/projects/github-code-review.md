# GitHub Code Review

## GitHub Code Review — overview
GitHub Code Review is an automated technical-screening bot built by Sina in Python on top of OpenRouter. It clones a candidate's repository and runs a role-aware LLM evaluation, producing a scored hiring report to help technical screening.

## GitHub Code Review — architecture
The project is built on a clean ports-and-adapters (hexagonal) architecture with multi-model fallback and token budgeting for large repositories, so it stays reliable and cost-controlled even on big codebases. The repository is at github.com/Sina-Amare/github-code-review.
