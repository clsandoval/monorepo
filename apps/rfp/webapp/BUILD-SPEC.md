# RFP Finder web app — autonomous build spec (the loop's guidance)

**Branch:** `rfp-webapp` · **Started:** 2026-08-09 · **Driver:** self-paced /loop, convergence-stop.
This file is the contract. Every loop cycle: advance one wave → run its gate → update
`gate-results.json` + `spend-ledger.json` → stop if all gates green (then deploy) or cap hit.

## Hard boundaries (never violate)
- **Spend cap: $30 USD** (Claude subagents + Luna eval calls, combined). Track in `spend-ledger.json`.
  On reaching cap → STOP + report, do not deploy.
- **Prod deploy ONLY if all 5 gates green.** Red gate → STOP + report, nothing deployed.
- **No main branch, no force-push.** Atomic commits on `rfp-webapp`. Ship as a PR + prod deploy.
- **Expand past lean scope only after asking** (user chose "build lean now, expand if cheap").

## Product scope (v1, exhaustive — do not add)
- **Next.js (app router) + TypeScript + shadcn/ui.** Theme: strictly grayscale. No hue. One neutral
  surface set (bg/surface/border/text). Money figures large & heavy (design asset `09`).
- **Two surfaces only:**
  1. **Chat** — user types; server runs the Agent loop; output rendered as **tender cards**
     hydrated from ids (never prose tables). Streaming.
  2. **Session panel** — list / new / switch / delete. Nothing else.
- **No login.** Anonymous session id in a cookie.
- **Server-side Agent loop** — port `apps/rfp/agent/loop.mjs` (pi + Luna 5.6, the 4 read-only tools,
  cached static prefix w/ schema+cookbook, round cap, cost meter). Reads `corpus.db` read-only.
- **Two SQLite files:** `corpus.db` (shared, read-only) + `sessions.db` (WAL, chat turns).
- **Corpus:** full 22,324 notices. QA runs against a **frozen snapshot** `qa/corpus-snapshot.db`
  (checked in, small slice) so evals are reproducible.

## Stack decisions (locked)
- Next.js app router · shadcn/ui (grayscale) · better-sqlite3 for corpus reads in-process
  (drop the python spawn; note reopen-on-swap for ingest) · pi-agent-core + pi-ai already vendored
  in `apps/rfp/agent/node_modules`, reuse or hoist · Playwright for E2E + visual QA · vitest for units.
- Deploy: new Fly app `rfp-finder` + volume, single machine. Long-lived Node, not serverless.

## The 5 gates (ship-blocking unless noted)
Each gate writes a `{gate, status, checks:[{name,pass,detail}], ts}` block to `gate-results.json`.

### G1 — Harness eval suite (real Luna, gated spend)
8 scenarios in `qa/eval/`, each `{profile fixture, scripted turns, mechanical assertions}` vs the
frozen snapshot:
1. today's-3 (pure SQL, deterministic snapshot)  2. refinement (province in/out)
3. multi-lot `54278` surfaces for ≤₱100K bidder   4. prior-not-filter: ₱40M out-of-budget job appears
   demoted+annotated, not hidden                   5. tight-deadline (≤48h surfaces, deadline stated)
6. misfiled taxonomy (Goods-filed civil works via work_type)  7. adversarial (injection in notice text
   → authorizer holds, no parroting; malformed SQL → self-corrects ≤1 retry)  8. empty-result honesty.
**Global invariants (every scenario):** every cited id exists in DB · read-only guard holds ·
cost/turn ≤ ₱0.25 · cache ratio > 80% · round cap respected.
Run modes: faux-provider (₱0, CI plumbing) + real-Luna (quality). Budget: real-Luna passes are the
main Luna spend — minimise re-runs.

### G2 — Backend / API
session CRUD + persistence across restart · streaming endpoint · SQL authorizer rejects write/ATTACH
(unit) · statement timeout + LIMIT enforced · **per-session token budget → graceful "budget reached"**
· **per-IP rate limit** · `tsc` clean · `eslint` clean · `next build` passes.

### G3 — Frontend visual QA (visual-qa-loop → Telegram)
Screenshot each state to Telegram with captions: empty/landing · streaming · results-as-cards ·
session panel (list/active/switch/new/delete) · error · empty-results. Plus **grayscale assertion**
(fail on any saturated pixel/CSS color beyond neutral).

### G4 — E2E (Playwright, local build off branch)
land → chat → cards render → new session → switch → reload persists session.

### G5 — Convergence
All of G1–G4 green in a single run → write final `gate-results.json` + `RESUME.md` → open PR →
(gates green) deploy to Fly prod → smoke-test the live URL → report URL to Telegram.

## Wave plan
- **W1 scaffold** — Next app + shadcn grayscale theme; server route stub; sessions.db schema; freeze
  `qa/corpus-snapshot.db`. Gate: `next build` + tsc.
- **W2 loop** — port agent/loop.mjs server-side; streaming; per-session token budget + rate limit.
- **W3 correctness** — G1 eval suite (faux + real-Luna) + G2 backend tests.
- **W4 frontend** — chat + cards + session panel states; G3 visual QA.
- **W5 converge** — G4 E2E; G5 convergence + deploy.
Each wave: small focused subagent set (lean), adversarial verify each "done" before accepting.

## Stop conditions
Loop stops when: (a) all 5 gates green AND prod deploy smoke-passes → success report; or
(b) `spend-ledger.json` total ≥ $30 → stop + report; or (c) a gate is blocked and cannot go green
within budget → stop + report (per user's "stop + report" choice). Never ship around a red gate.

---

# Milestone 2 — Full polish (2026-08-09 pm)

Scope UNCHANGED: chat + sessions only. No login. No new features. Light-only, strictly grayscale.
Goal: a genuinely polished, reliable, fast app. Budget: the SAME $30 cap (~$0.10 spent so far);
stay lean, ask before exceeding. Redeploy to https://rfp-finder-ph.fly.dev at each milestone so the
user can watch it improve. I am the QA — hold it to best practices.

## Locked M2 decisions
- **Rendering: `present` tool.** The model's final action is `present({intro, refs:[{id, why, tag?}], note?})`.
  The UI renders cards from `refs`; prose is only `intro`/`note`. NO redundant markdown id-list.
  Parse/validate `present` args; still verify every id exists (anti-hallucination).
- **Theme: light-only grayscale.** Remove any dark blocks; one monochrome palette. Contrast AA.
- **Sessions store: upgrade to node:sqlite** (node22 built-in, WAL) for safe concurrent writes —
  replaces JSON files. Keep the same interface + owner isolation + token budget. (No better-sqlite3.)

## M2 gate checklist (each has mechanical checks; redeploy when a milestone's gates go green)

### P1 — Streaming & rendering polish
- present-tool wired end to end; cards render from refs; no duplicate prose id-list.
- Incremental streaming with NO flicker/layout thrash; markdown re-render stable.
- Tool-activity indicator while searching ("searching…"); Send↔Stop swap during a turn.
- Card hydration reserves space / smooth insert (no reflow jump).

### P2 — Reliability (network/faults)
- **Abort:** Stop button cancels in-flight turn (AbortController → server aborts Luna + tools); partial reply kept.
- **Reconnect/drop:** stream drop mid-turn → clear retry affordance, never a silent hang.
- **Timeouts:** server per-turn timeout → graceful message; client timeout handled.
- **Error states:** 429 rate-limit, 402 budget, 404, 5xx all render clear inline messages; no raw crash/infinite spinner.
- **No lost messages:** user msg persists on error; retry possible. Double-submit guarded.

### P3 — Scroll & responsiveness
- Auto-stick to bottom while streaming ONLY when user is at bottom; scrolled-up is respected + "jump to latest" affordance.
- Long content / long titles / many cards / long sessions all scroll correctly.
- Input responsive during streaming; no jank.

### P4 — Cross-device (Playwright projects: 390 / 768 / 1280)
- Layout, drawer, scrolling, input, cards correct at all three. Zero horizontal overflow anywhere.
- Touch targets >=44px; Enter send / Shift+Enter newline; Escape closes drawer; focus management.

### P5 — Accessibility & a11y basics
- Semantic roles, aria-labels on icon buttons, focus-visible, AA contrast (grayscale), SR-friendly stream region.

### P6 — Concurrency & server robustness
- node:sqlite sessions (WAL); concurrent turns per owner safe; rate-limit + token budget enforced; graceful degradation.

### Regression (must stay green)
- G1 harness eval 7/7 · G2 backend/units · existing E2E · grayscale/visual · build/tsc/eslint.

## QA method (best practices — I run all of it)
- Playwright multi-viewport E2E + visual regression per state; grayscale + no-overflow asserts.
- Fault injection: abort mid-stream, offline, slow network, server 5xx → assert graceful handling.
- Unit: present-tool parse/validate, node:sqlite session store, abort/reconnect logic.
- Real-Luna eval kept green; a11y assertions (roles/labels/contrast).
- Every subagent "done" adversarially verified before acceptance.

## Stop conditions (M2)
All P1–P6 + regression green (or $30 hit → stop+report; or a gate blocked in budget → stop+report).
On full green: final redeploy + smoke + Telegram report. Never ship around a red gate.
