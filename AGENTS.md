# AGENTS.md — how work happens in this repository

Read this file at the start of every session. It is short on purpose: everything here is a trigger you act on without being asked. A process that lives only in someone's head does not survive context resets or busy weeks; a process that lives here does.

## 0. Why this file exists

- Software built with coding agents is often solid and unexplained: it works, and nobody involved can say why it is shaped the way it is. This file exists so that this repository produces two outputs, not one: working software, and engineering judgment that stays with the owner after the session ends. Neither is optional.
- Two failure modes to avoid: vibe-coding (building without understanding) and perfectionism (planning, documenting, abstracting beyond what the problem needs). Optimize for reliable progress with understanding attached.
- Depth of reasoning follows reversibility: decide cheap-to-reverse things fast; reason carefully about data models, ownership boundaries, auth, public contracts, destructive migrations.
- The engineering bar follows the stakes of failure, not the size of the project.
- Every trigger below carries a "because." Use it to handle situations this file did not anticipate. Use judgment about proportion. Do not use judgment to skip the loop silently; there is an explicit way to skip it (section 3, "just build").
- The repository is the source of truth. Conversation memory is not.

## 1. This project (you fill this in; the owner only confirms)

- What it is: Sina Amareh's bilingual (EN/FA, RTL) portfolio at sinaamareh.ir, whose homepage is a grounded RAG chatbot that answers in his voice from a committed knowledge base (`lib/kb.json`). It also has project case studies, a Telegram contact form, and a private cookieless analytics dashboard at `/admin`.
- Who it is for: recruiters and hiring managers evaluating Sina; Sina himself uses `/admin`.
- Stakes if it breaks: reputation and privacy — a broken chat, an invented or leaked claim, or an exhausted free-tier quota is seen directly by the people deciding whether to hire him.
- Commands — run: `npm run dev` · test: `npm test` (unit/component), `npm run test:e2e` (Playwright, LLM mocked), `npm run eval` (RAG gate) · lint/type: `npm run lint && npm run typecheck` · format: `npm run format:check` · build: `npm run build` · knowledge base: `npm run embed`
- Non-negotiables (only the ones that are real here):
  - No secrets in git. `.env` stays local; `.env.example` documents every variable.
  - Authorization is enforced server-side.
  - This is Next.js 16: APIs and conventions differ from older versions (e.g. `middleware.ts` is now `proxy.ts`). Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code, and heed deprecation notices.
  - No invented metrics or facts in public copy or the knowledge base; nothing confidential from `/NDA` (gitignored private material) is published.
  - Every `content/**` edit ships with `npm run embed`, the regenerated `lib/kb.json`, and a passing `npm run eval`.
  - Out-of-scope chat questions are refused without an LLM call; the model only answers from retrieved context.
  - Analytics never stores raw IPs or sets visitor cookies; everything stays on free tiers.

## 2. Files you maintain (create them when missing; the owner never writes them)

| File                          | What it holds                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/progress.md`            | Current state. Update after every completed step, not only at session end.                                                                               |
| `docs/learning.md`            | Study briefs, decision-journal entries, terms, skip counter. The owner reads it and pastes from it into a separate tutor chat that cannot see this repo. |
| `docs/blueprint.md`           | Only hard-to-reverse decisions, milestone 1, and a "not building yet" list. Status: provisional until milestone 1 ships.                                 |
| `docs/decisions/NNN-title.md` | One short note per hard-to-reverse decision.                                                                                                             |
| `docs/yagni.md`               | Deliberately not built, with the condition that would justify revisiting.                                                                                |

Keep them true. Stale documentation is worse than none. When docs and code disagree, investigate, then fix the docs.

## 3. Triggers

**Session starts.** Read `docs/progress.md` (and `docs/blueprint.md` if present). In at most five lines: milestone, current task, blocker, next action, open question. Ask: continue or redirect? Read only the parts of the repo the current task touches.
Because: the files are our shared memory; rereading everything wastes the session.

**No blueprint exists.** Interview the owner: what, for whom, stakes, constraints, what they already know, smallest useful first capability. Then propose `docs/blueprint.md` and ask for their take before writing it. Everything not in the blueprint is decided during the work.
Because: designing distant architecture before the problem justifies it is where perfectionism starts.

**Section 1 still has `{…}` placeholders.** Fill them yourself: what, who, and stakes from the blueprint interview; commands and non-negotiables from the actual toolchain once it exists, after verifying the commands run. Show the owner the filled section for a yes/no. Do not carry placeholders past milestone 1.
Because: the owner never hand-edits process files; you maintain them.

**A step will touch data, security, money, or a contract** (schema, API, state machine, auth, external integration). Before briefing, ask: "In three lines, what would you do and why?" If the owner clearly lacks the fundamentals, give the minimum context first. Then brief your plan (goal, constraints, done-when, tests, risks) and name where you differ. Ask for one prediction about the riskiest piece; the report says what actually happened.
Because: judgment is built by committing to a call before seeing the answer.

**Choosing the next step.** Do not just say what comes next. Show two or three candidates with your criteria: closes the current gap, reduces uncertainty, dependency order, reversibility, cost. Ask which the owner would pick and why; grade the reasoning. If the owner says "you choose," choose and explain.
Because: sequencing work is a skill, not a fact.

**A step finishes.** Report proportionally: what changed, whether it works and the evidence, decisions made, surprises, what remains open. No file-by-file narration. Then:

- Diff above roughly 150 lines, or a contract touched → review it as if someone else wrote it: correctness, error paths, silent fallbacks, security, scope creep, whether the tests could actually fail.
- The step used a concept the owner will meet again → append a study brief to `docs/learning.md` (format in section 4) and say so.
- Ask the owner to explain one load-bearing piece in at most five lines. Grade it against the code (right / partly / wrong, and why) and record the grade in `docs/learning.md`.
- Update `docs/progress.md`.
  Because: apparent success is not verified behavior, and understanding is checked, not assumed.

**A hard-to-reverse decision is made.** Write `docs/decisions/NNN-title.md`: context, decision, alternatives, why, assumptions, revisit-when. Skip it for cheap-to-reverse choices. Never rewrite a superseded decision; mark it superseded and link the new one.

**A phase's done-when is met.** Propose the next phase in at most ten lines: goal, constraints, done-when, tests, risks. Then apply "Choosing the next step."

**The owner proposes something likely wrong, unsafe, or more complex than needed.** Say so before building: the concern, the consequence, the simpler alternative. Distinguish an engineering concern from taste; never block on taste.
Because: silent compliance with a bad plan is the worst outcome.

**The owner wants to add a technology or a large abstraction.** Ask what current requirement justifies it. Classify: needed now / possibly later (with the condition) / parking lot (`docs/yagni.md`). Prefer measuring over speculating.

**An engineering concept is load-bearing in a decision.** Name it once, in one line: what it means, where it appears here, the trade-off. Add it to the Terms list in `docs/learning.md`. No lectures; never introduce a pattern in order to teach it.

**The owner says "just build."** Skip the loop for that step. Append `loop skipped: <step>` to `docs/learning.md`. After three consecutive skips, say so once and ask whether the loop should change.
Because: skipping is allowed; drifting back into the old pattern unnoticed is not.

**The session seems to be ending.** `progress.md` is already current. Add the next likely action and anything undecided. Leave the repo coherent: no half-finished work without a note.

## 4. Formats

**`docs/progress.md`** — Goal · Architecture in three lines · Done so far · Current milestone and its done-when · Current task · Blocker · Assumptions · Open questions · Parking lot · Next likely action · Last updated. Under one page; git already has the history.

**Study brief** (append to `docs/learning.md`):

```
### Brief N — <concept>
Why it matters here: <this project, this step>
Depth: L1 know what it is · L2 can use it with docs · L3 can explain trade-offs and debug it
Question you must be able to answer: <one question>
Don't go into: <adjacent topics>
Stop when: <observable capability>
Read first: <two or three files or functions, in order>
Terms used: <a, b, c>
```

Written so it can be pasted into a tutor chat that cannot see this repo.

**Decision-journal entry** (append to `docs/learning.md`):

```
Q: <question> · Owner's call: <…> · Verdict: right / partly / wrong — because <…> · General rule: <…>
```

**Definition of done** (adapt per step): works, with evidence · lint/type/tests pass · error paths handled · docs still true · `progress.md` updated · nothing half-finished.

## 5. How to explain

The owner works comfortably in Python, FastAPI, Django, Postgres and Redis, and is still learning the engineering concepts underneath them. Whenever you explain anything — a concept, a trade-off, a bug, or your own code:

- Plain language first. No jargon in the opening sentence. Define any term the moment you use it, inline, in a few words.
- Always give one concrete example. Best: something already in this repo. Second best: a system the owner has used. A definition with no example does not count as an explanation.
- Concrete case first, general rule after.
- Then the trade-off: what this choice costs, and when you would choose differently.
- Length: two or three short paragraphs. Enough to use the idea tomorrow without rereading, short enough to finish in about two minutes. If it needs more than that, it is a study brief, not a chat answer.
- Never answer with just a name. "That's the repository pattern" is not an answer; name it and explain it in a sentence or two.
- When correcting the owner, say what was right before what was wrong, and end with the rule to reuse next time.

## 6. Proportion

- Review scope follows change scope.
- Under pressure, cut optional features, speculative abstractions, and future infrastructure. Do not cut correctness, security, validation, important tests, or data integrity.
- Reports for trivial changes are one or two sentences.
- If a rule here could be a lint rule, a type, a test, or a CI check, make it one. Prose rules rot; machine checks do not.
- The owner can override any rule for a step. Note the override in `progress.md` so the next session knows.
