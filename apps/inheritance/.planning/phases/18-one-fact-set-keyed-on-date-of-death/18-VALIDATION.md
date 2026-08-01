---
phase: 18
slug: one-fact-set-keyed-on-date-of-death
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 18 unifies an input field. It changes **no** arithmetic in either engine: no legitime, no
fraction, no deduction formula and no rate table is edited. What moves is *where the date of death
comes from* and *what happens when the two stored copies disagree*. That split is what makes the
phase cheap to validate — the two engines' own test suites are a complete regression net for the half
that could silently corrupt a computation, and one new gate is a complete net for the half that could
silently reintroduce a second spine.

The highest-value feedback signal here is a **paired recomputation**: one fact set, computed twice
with only the date of death changed, through the real engines. It runs in under two seconds, needs no
browser and no database, and it is the only evidence that answers "does the date actually drive
anything" without appeal to reading the source. `18-RESEARCH.md` §5 and §6 establish both halves of
the expected answer before any code is edited, so every later plan compares against a measured prior
rather than an assumption.

Three results in this phase are expected to end **red or withheld**, by design. They are named here
so a red result is not mistaken for an execution failure:

1. `bash scripts/ci-gates.sh` (whole suite) stays at **exit 1**, halting at G3 on the owner-blocked
   test floor carried forward from Phase 16 (`min_total_tests: 2119`). This phase does not own it,
   does not touch `frontend/test-baseline.json`, and must not claim exit 0.
2. Journey step `tax-tab-0` fails on its reference image, because the tax Decedent tab's date field
   changes. Its diff is a wizard field, not the deleted sidebar navigation region, so the journey
   reference rule forbids approving it. It is left failing and reported for human review.
3. Journey steps `results-view` and `results-family-tree` remain withheld from Phases 16 and 17. This
   phase does not touch them and does not approve them.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (frontend unit/component), `tsc -b` (typecheck), `cargo test` (engine), `npx tsx` (gate runner), all driven by `scripts/ci-gates.sh` |
| **Config files** | `gates.manifest.json` / `gates.manifest.lock`; `frontend/tsconfig.json`; `frontend/vitest.config.ts` |
| **Typecheck command** | `cd frontend && npx tsc -b --force` |
| **Scoped unit run** | `cd frontend && npx vitest run src/lib/__tests__/fact-set.test.ts` |
| **Engine regression** | `cd engine && cargo test` |
| **New gate command** | `cd frontend && npx tsx scripts/check-one-fact-set.ts` |
| **Full suite command** | `bash scripts/ci-gates.sh` |

## Sampling plan — what is measured, how often, against what prior

| Signal | Command | Prior it is read against | Plans |
|---|---|---|---|
| Succession engine invariance to the date of death | corpus double-compute through `frontend/journey/engine.mjs` | `files=173 rejected=2 outputs_changed_by_dod=0` (`18-RESEARCH.md` §6) | 18-01, 18-05 |
| Tax engine sensitivity to the date of death | `computeEstateTax` at `2017-12-31` and `2018-01-01` | `PRE_TRAIN/40000000/100500000` vs `TRAIN/0/30000000` (`18-RESEARCH.md` §5) | 18-01, 18-05 |
| Number of controls writing `EstateTaxWizardState.decedent.dateOfDeath` | source scan | 1 today (`DecedentTab.tsx:92-93`), 0 after 18-03 | 18-01, 18-03, 18-05 |
| Engine typecheck | `cd frontend && npx tsc -b --force` | exit 0 today | every plan that edits `src/` |
| Rust engine unchanged | `cd engine && cargo test` | 546 passed / 0 failed | 18-06 |
| Gate manifest integrity | `node scripts/check-gate-manifest.mjs` | exit 0 today | 18-06 |
| Planning-truth gate count | `node scripts/check-planning-truth.mjs` | exit 0 at 33 gates today | 18-06 |

## Nyquist rate — why this sampling is dense enough

The fastest-moving quantity in this phase is *which storage location a rendered date came from*. It
can change on any edit to four files (`DecedentTab.tsx`, `EstateTaxWizard.tsx`, `$caseId.tax.tsx`,
`fact-set.ts`), so it is sampled after **every one** of those edits by `npx tsc -b --force` plus the
scoped Vitest run, and once more at phase end by the new gate over the whole source tree. Nothing in
this phase can change that quantity between two samples without a sample seeing it.

The slowest-moving quantity is the pair of engine outputs. They are sampled twice — once as a prior
in 18-01 before any edit, once as the gate's own assertion in 18-05 — which is sufficient because no
plan in this phase edits either engine's arithmetic, and `cargo test` plus `npx tsc -b --force`
would fail first if one did.

## Falsification — what would prove this phase wrong

| Claim | What would falsify it | Where that check lives |
|---|---|---|
| The date of death is now entered once | Any control anywhere in `frontend/src/` writing `EstateTaxWizardState.decedent.dateOfDeath` | Gate marker `SECOND DATE FIELD` |
| Both engines read the one value | `$caseId.tax.tsx` computing without routing through the fact set | Gate marker `FACT SET NOT SHARED` |
| A disagreement refuses rather than computes | The disagreeing fixture returning `ok` | Gate marker `DISAGREEMENT NOT REFUSED` |
| The date still drives the tax rules | Equal `deductionRules`, equal medical deduction or equal `tax_due` across the TRAIN boundary | Gate marker `DATE NOT KEYED TO TAX` |
| The date reaches the succession engine | The `EngineInput` handed to the engine carrying a different date than the fact set | Gate marker `ENGINE INPUT DATE MISSING` |
| No peso figure moved as a side effect | `cargo test` regressing, or the tax figures in `18-BASELINE.md` moving for an unchanged date | 18-06 Task 1 |

## The one thing this strategy deliberately does not validate

It does not validate that the **succession** engine's output responds to the date of death, because
`18-RESEARCH.md` §6 measured that it does not, and making it respond means answering `LAWYER-08`.
The gate therefore asserts that the date **arrives** at the engine, never that it **changes** the
answer. An assertion of invariance would freeze today's behaviour as an expectation and would turn
red the day the lawyer's answer is implemented — which is precisely the shape of gate that gets
weakened rather than fixed.
