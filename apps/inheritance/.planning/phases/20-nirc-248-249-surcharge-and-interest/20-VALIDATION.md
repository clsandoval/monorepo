---
phase: 20
slug: nirc-248-249-surcharge-and-interest
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 20 **adds no peso figure to any output**. It removes four: three hardcoded zeros and one total
that was silently equal to the base tax. Everything it adds is either a date, a day count, a section
string, or a refusal. That is the whole regression surface — one new pure module, one input mapper
line, one output assembly block, one wizard field, one display block — and it means the Rust engine is
available as a clean null control: if `cargo test` moves at all during this phase, something happened
that this phase did not intend.

The property being validated has an awkward shape: **a refusal is trivially easy to fake.** A module
that returns `null` from every function satisfies any test that only asserts `null`. Every negative
assertion in this phase is therefore paired with a positive one on the same object — a section string,
an exact deadline date, a positive day count, or an exact integer sum over injected determined lines.
`20-RESEARCH.md` § *Validation Architecture* tabulates the pairs; this document is the sampling and
failure-path contract.

Three results in this phase may legitimately end red or withheld. They are named here so a red result
is not mistaken for an execution failure:

1. `bash scripts/ci-gates.sh` is **not claimed to reach exit 0**. `G20` and `G21` remain registered
   blocking gates whose scripts commit `4ccf06270` deleted, and the suite halts at `G17` with 15
   withheld journey steps. Retiring a gate is owner action under `CLAUDE.md` invariant 2, enforced by
   `G5`. This phase does not own any of that and appends one gate without touching another.
2. Journey step `tax-tab-7` (the Filing tab) is **already failing and withheld** from Phases 16–19.
   `20-03` adds a field to that tab, which changes its reference further. No plan in this phase runs
   `node journey/approve.mjs`, and the step is left failing and reported for human review.
3. Roadmap criteria 2 and 3 are **not claimed as literally worded**, for the authority reason recorded
   in `20-RESEARCH.md` §0. That is a finding, not a gap in execution, and every plan repeats it.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 (frontend unit/component), `tsc -b` (typecheck), `cargo test` (engine null control), `npx tsx` (gate runner) |
| **Config files** | `gates.manifest.json` / `gates.manifest.lock`; `frontend/tsconfig.json`; `frontend/vitest.config.ts` |
| **Typecheck command** | `cd frontend && npx tsc -b --force` |
| **Scoped unit run** | `cd frontend && npx vitest run src/lib/estate-tax-engine/__tests__/penalties.test.ts src/lib/estate-tax-engine/__tests__/pipeline.test.ts src/components/tax/__tests__/Form1801View.test.tsx` |
| **Engine null control** | `cd engine && cargo test` — expected 546 passed / 0 failed |
| **New gate command** | `cd frontend && npx tsx scripts/check-penalty-refusal.ts` |
| **Fact-set null control** | `cd frontend && npx tsx scripts/check-one-fact-set.ts` — expected exit 0 |
| **Lawyer registry gate** | `node scripts/check-lawyer-agenda.mjs` — expected exit 0 |
| **Test-count gate** | `cd frontend && npm run test:gate` |
| **Full suite command** | `bash scripts/ci-gates.sh` |

## Sampling plan — what is measured, how often, against what prior

| Signal | Command | Prior it is read against | Plans |
|---|---|---|---|
| Hardcoded penalty zeros in `pipeline.ts` | `grep -cE "surcharges: 0\|interest: 0\|compromise_penalty: 0" frontend/src/lib/estate-tax-engine/pipeline.ts` | `6` today (two sites × three fields) → `0` after `20-04` | 20-04, 20-06 |
| `new Date()` inside the tax engine | `grep -rc "new Date()" frontend/src/lib/estate-tax-engine/` | `1` today (`pipeline.ts:308`) → `0` after `20-03` | 20-03, 20-06 |
| `total_amount_due` on a late estate | real `computeEstateTax` run | `=== tax_due` today → `null` after `20-04` | 20-04, 20-06 |
| Statutory deadline for a 2020-06-15 death | `penalties.test.ts` | no prior — new; must equal `2021-06-15` | 20-01 |
| Statutory deadline for a 2015-03-31 death | `penalties.test.ts` | no prior — new; must equal `2015-09-30` (month-end clamp) | 20-01 |
| `daysLate` moves with the date of death | real engine run at two dates | no prior — new; two distinct positive integers | 20-04, 20-06 |
| Sum rule over injected determined lines | `penalties.test.ts` | no prior — new; exact integer, no tolerance | 20-01 |
| Numeric literals in `penalties.ts` | literal extraction in `check-penalty-refusal.ts` | subset of `{0, 1, 2, 6, 10, 12, 86400000}` | 20-01, 20-06 |
| Registry ↔ agenda agreement | `node scripts/check-lawyer-agenda.mjs` | exit 0 at 9 entries → exit 0 at 12 entries | 20-02 |
| Unanswered agenda boxes | `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` | `0` → `0` (roadmap cross-cutting constraint) | 20-02, 20-07 |
| Engine regression (null control) | `cd engine && cargo test` | `546 passed; 0 failed` | 20-07 |
| One-fact-set gate (null control) | `cd frontend && npx tsx scripts/check-one-fact-set.ts` | exit 0 | 20-03, 20-07 |
| Gate count stated in docs | `grep "The gate set holds" .planning/ORIENTATION.md` | `35` → `36` | 20-07 |

## Nyquist compliance — why each property is sampled at the rate it is

| Property | Levels sampled | Why one level is not enough |
|---|---|---|
| The deadline is a real function of the date of death (PEN-01) | unit (four dates: two spec examples, one TRAIN boundary day either side) **and** engine-level (two full `computeEstateTax` runs) | The unit level proves the arithmetic; only a full run proves the value survives `wizardStateToEngineInput`, which is exactly where the wall-clock defect was hiding. |
| Each line carries its governing section (PEN-04) | unit (exact string equality on `authority`) **and** component (the string is rendered in the table) **and** gate (asserted against a real run) | A section held in the engine and dropped by the display is precisely the Item-35A class of defect the audit found. Two of the three levels are display-side for that reason. |
| The total refuses (PEN-03) | unit (`sumTotalAmountDue` both branches) **and** engine-level (`total_amount_due === null`) **and** gate | The sum rule and the refusal are different properties: one is arithmetic over determined lines, the other is the guard that no determined line exists yet. Sampling only the second would let the sum rule ship untested and unusable by Phase 21. |
| Nothing was stubbed or defaulted (PEN-05) | source-level (numeric-literal set, `%` and `Math.round` absence) **and** registry-level (every `lawyerDecision` id resolves in `lawyer-decisions.json`) | A behavioural test cannot distinguish "declined because no reading exists" from "declined today, stubbed at 25% next week". The literal-set assertion is the only sample that catches the second, and it catches it at the moment it is introduced. |
| The refusal reaches the lawyer's eye (PEN-05) | component test on `Form1801View` | The engine object is not the artifact; the printed line is. This is the one property with a single level, and it is compensated by asserting both the presence of the refusal text **and** the absence of any `0.00` in the four new rows. |

## Every failure path is observed before it is trusted

No gate in this project is registered until it has been seen failing. `20-06` observes
`frontend/scripts/check-penalty-refusal.ts` exit 1 on **four separately injected regressions**,
restoring the source between each and confirming the gate returns to exit 0:

1. Restore `total_amount_due: taxComputation.estateTaxDue` in `pipeline.ts` → expect
   `TOTAL CLAIMS COMPLETENESS`.
2. Blank the `SURCHARGE_SECTION` constant in `penalties.ts` → expect `LINE MISSING ITS SECTION`.
3. Add the numeric literal `0.25` to `penalties.ts` → expect `RATE INVENTED`.
4. Change a line's `lawyerDecision` to `LAWYER-99` → expect `DECLINED LINE UNRECORDED`.

Injection 3 is the load-bearing one. The other three catch a regression; that one catches the specific
future failure this phase exists to prevent — an agent supplying a rate because the code needed
something to compile against.

## Null controls

| Control | Expectation | Owner |
|---|---|---|
| `cd engine && cargo test` | `546 passed; 0 failed` — this phase edits no Rust | 20-07 |
| `cd frontend && npx tsx scripts/check-one-fact-set.ts` | exit 0 — the new field is a filing date, not a second date of death | 20-03, 20-07 |
| `frontend/test-baseline.json`, `assertion-baseline.json`, `gate-skips.lock` | unmodified by every commit in this phase, proven by `git log --name-only` | 20-07 |
| `frontend/journey/references/` | zero files touched, proven by `git log --name-only … \| grep -c` returning 0 | 20-07 |
| `engine/legal-rules.json`, `engine/legal-traceability.lock` | untouched — no Civil Code article is implemented here, so G28 has nothing to index | 20-07 |
| `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` | `0` before and after — an agent never ticks an answer box | 20-02, 20-07 |

## What a BLOCKED report looks like in this phase

Per `.planning/PLAN-STANDARD.md` §3: stop, paste the real command output, change nothing to make it
green. The four situations most likely to produce one here:

- **A task appears to require a rate, a base or an accrual window for §248 or §249.** Report BLOCKED
  naming `PEN-01` or `PEN-02` and the task. Do not supply the value, do not add it to a spec, and do
  not tick an agenda box. This is the expected terminal state of the computation half of this phase
  and it is already recorded as `LAWYER-10`/`LAWYER-11`.
- **`node scripts/check-lawyer-agenda.mjs` fails after `20-02`** with `DECISION ANCHOR BROKEN` or
  `DECISION MARKER MISSING`. Paste the marker line. The fix is the anchor pattern or the
  `LAWYER-DECISION:` comment in `penalties.ts` — never a deletion from `REQUIRED_IDS`.
- **`npx tsc -b --force` reports more `FilingData` sites than the plan enumerates.** Fix every site
  the compiler names and record the true count. Do not make the new field optional to silence it: an
  optional filing date reintroduces the silent path.
- **`npm run test:gate` reports a new failure not in the 31-entry ledger.** Report it red with the
  pasted line. Do **not** append to `frontend/test-baseline.json`; that ledger may only shrink.
