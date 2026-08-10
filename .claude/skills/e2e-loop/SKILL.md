---
name: e2e-loop
description: |
  Autonomous build loop: interview Carlos up front (~20-30 questions), lock a contract
  (spend cap, gates, QA standards, report channel), then go off and ship end-to-end —
  subagent workflows, adversarial verification, live P0 gates, Telegram reporting —
  until done or a stop condition fires. Distilled from the bidkita/RFP-webapp sessions.
  Triggers: "/e2e-loop", "run the loop on X", "go build X overnight", "same loop as bidkita".
---

# E2E Loop

Ship a whole product increment autonomously. The user's time is spent ONCE, up front, in a
structured interview; after that the loop owns everything to "live, verified, reported".

## Phase 0 — Interview (the only synchronous part)

Ask in 3-4 batched rounds (AskUserQuestion or chat), ~20-30 questions total. Skip any the
user already answered in their ask. Capture VERBATIM answers into the contract.

**Round 1 — the goal:**
1. One sentence: what exists when this is done?
2. What is the TERMINAL USER ACTION? ("hit submit on PhilGEPS with documents in order" —
   everything on the path to that action is scope; everything after is not.)
3. Who is the user? (persona to dogfood as — role, constraints, what they scan first)
4. What's the peg/reference product, if any? ("peg is Google" beats paragraphs of spec)
5. Explicit NON-goals / never-do list (no login? no seals? no new deps?)

**Round 2 — resources & bounds:**
6. Spend cap in USD, and what counts against it (subagents? provider API? both?)
7. Time budget ("you have ~12 hours")
8. Deploy target + does it exist already (Fly app name, domain, creds assumed working?)
9. Data sources and which are LOCKED decisions (read the repo's DECISIONS/RESUME files —
   ask only about gaps)
10. Named design style? A named style = the exact approved artifact, pixel-faithful —
    open the file, change only what's asked (colour-swap rule). Get the file path.
11. What model(s) power the product, cost ceilings per user action?

**Round 3 — quality bar:**
12. What proves "done"? (default: ALL of — unit suites, eval suite w/ mechanical
    assertions, E2E incl. 390/768/1280, visual/palette gate, live P0 drive + video)
13. Which regressions are ship-blocking? (existing suites that must stay green)
14. Anything where wrong-but-confident output is worse than nothing? (money figures,
    quantities, legal requirements → those get reject-when-unsure or quotes-or-omits gates)
15. Accessibility / responsiveness bar?

**Round 4 — operations:**
16. Report channel (Telegram chat id? which bot?) + cadence (per-gate? per-milestone?)
17. Ship as PR? To which base? Push when?
18. On blocked gate or cap hit: stop+report (default) or decide-and-continue?
19. May the loop expand scope it discovers (e.g. "invert the script" persona walks), or
    propose-first?
20. Wake-me-for list: the ONLY things worth interrupting the user for.

## Phase 1 — Contract (before any code)

Write and COMMIT, so the loop has law when context is long:
- `BUILD-SPEC.md` section for this milestone: verbatim directive, locked decisions,
  architecture, GATES (each gate = mechanical checks, not vibes), wave plan, stop
  conditions. The spec is the contract; every cycle reads it.
- `spend-ledger.json` `{cap_usd, spent_usd, entries[]}` — log subagent tokens (estimate
  HIGH side) and provider spend per phase. Stop at cap, report, never ship around it.
- `gate-results.json` — one block per gate, updated as they go green.
- Frozen INTERFACE CONTRACTS (shared types file per boundary) — written by the
  orchestrator BEFORE parallel agents launch, so tracks can't drift.

## Phase 2 — The loop (repeat per milestone until done)

1. **Scout inline.** Read the code/data yourself first; measure, don't assume (run the
   query, time the call, open the mockup). Decisions the workflow needs must exist
   before the workflow does.
2. **Build via Workflow**: parallel builder agents with DISJOINT file ownership (list
   each track's files explicitly; shared types are pre-frozen). Builders test their own
   work with real data/ids and report tersely.
3. **Adversarial verify — always.** A separate verifier per track whose prompt is "try
   to REFUTE done", with fresh test ids the builder never touched. Verifiers report
   VERDICT green|red + repro commands, and never fix. (Every red found this way was
   real: relevance quota blowouts, garbage BOQ tables, bfcache-only restore.)
4. **Fix reds yourself, inline, empirically** — reproduce with the verifier's repro,
   tune against real-data scans (300-sample style), lock every fixed shape in as a test.
5. **Dogfood as the persona (P0 gate).** Green gates are NOT proof. Drive the running
   app like the target human — search, click, read, enrich — and fix what grates.
   Mid-loop: this is also where roadmap comes from ("invert the script"): walk the
   product toward its terminal action, list every question it can't answer, build those.
6. **QA workflow**: eval suites (faux + real model), full E2E, cross-device, regression.
7. **Style pass only after function is green**, as a token-level diff of the named
   artifact; the visual gate then enforces the palette mechanically.
8. **Deploy → live P0 on prod**: drive prod manually, run the recorded journey video,
   send video + screenshots to the channel.
9. **Report + bookkeeping**: Telegram message (outcome first, numbers, live URL),
   atomic commits throughout, push + PR per contract, ledger/gates/RESUME updated.

**Mid-loop user messages** (voice notes at 3am): fold them in as new tasks without
dropping the current thread; reprioritize openly; if the message names an artifact you
can't access, say so immediately and continue on what you have.

## Hard rules (paid for, do not relearn)

- **Spend cap and gates are law.** Red gate → stop+report, never ship around it.
- **Reject-when-unsure** for any user-facing derived data where wrong-but-confident
  beats-nothing is FALSE (quantities, money, legal requirements). Fallback to raw.
- **Quotes-or-omits + mechanical substring verification** for anything an LLM extracts
  from documents. Statutory/rule content comes from static tables, never the model.
- **Named style = the artifact.** One-variable diffs; never reinterpret.
- **Never reuse a dev/prod server across rebuilds** (stale chunk hashes fail everything);
  `reuseExistingServer: false`, kill by pid/port before serving.
- **Kill process TREES.** Stopping a wrapper task leaves children holding db locks
  (the daily.sh double-run collision). `pgrep -f` before relaunching anything.
- **Domain semantics live in the spec** (e.g. budget filters are per-LOT; corpus
  timestamps are naive Manila local) — tests assert them via the API, not the pixels.
- **Deterministic E2E**: wait on responses, not sleeps; state restore must not depend
  on bfcache; settle every mutation before the next test's assertions.
- **Subagents' "done" is a claim, not a fact** — nothing merges unverified.

## Stop conditions

(a) all gates green AND live P0 passed → final report; (b) spend cap → stop+report;
(c) a gate cannot go green within budget → stop+report with exact blocker; (d) the user
says stop. On every stop: ledger, gate-results, RESUME.md, and the channel are current.
