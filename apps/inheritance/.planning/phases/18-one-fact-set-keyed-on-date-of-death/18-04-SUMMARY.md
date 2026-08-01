---
phase: 18
plan: 18-04
status: complete
requirements: [FACT-02, FACT-03, FACT-04]
---

# 18-04 — One fact set crosses the boundary, and a disagreement refuses to compute

Committed `dfe5b696f` (`$caseId.tax.tsx`, `FactSetConflictBanner.tsx`,
`FactSetConflictBanner.test.tsx`).

## What changed

Before this plan the whole boundary was line 56: `setDecedentName(row.decedent_name ?? 'Decedent')`.
One projected column crossed, and the two stored dates of death were never compared.

The route now reads the case's **fact set** through `factSetFromCaseRow(row)`, takes a verdict from
`assertOneFactSet(row)`, and adopts the shared date into the tax wizard state through
`applyFactSet` — **only when the verdict is `ok`**. On a refusal the stored state is loaded exactly
as the database holds it, so the banner and the tab show the evidence rather than a reconciliation.

`DECEDENT_NAME_COLUMN 0` — the route no longer reads the projected column.
`OWN_DATE_COMPARISON 0` — the route restates no part of the rule; every comparison, message and
verdict comes from `@/lib/fact-set`.

**All three compute paths are gated, not just one.** `handleCompute`, `handleApply` and
`handleRevert` each open with `if (!verdict || verdict.kind !== 'ok') return;` — `GUARDS 3`.
`handleApply` and `handleRevert` were the easy ones to miss, because both reach `runCompute`
indirectly after mutating state; gating `runCompute` alone would have left two paths by which a
disagreeing case still produced a Form 1801. The Compute button is additionally absent in that state,
because `onCompute` is passed as `undefined` and `FilingAmnestyTab.tsx:311` already renders it behind
`{onCompute && ...}` — an existing conditional, not edited.

**The refusal never hides the evidence.** `TAXINPUT_WRITES 3`, identical to the pre-plan count taken
from `git show HEAD:` — no write path was added on the refusal branch. Overwriting the stored tax
date with the succession date would make every case agree forever and would silently discard the date
a lawyer actually typed.

`FactSetConflictBanner` computes nothing: `OWN_LOGIC 0` (no comparison, no trimming, no `new Date`).
It renders `null` on a healthy case, and on a disagreement prints **both** dates under
`fact-set-succession-date` and `fact-set-tax-date`.

## Three rules now read the shared date, and no rule site was edited

| Rule | Site | Reads it via |
|---|---|---|
| TRAIN vs pre-TRAIN | `regime-detection.ts` `detectRegime` | `pipeline.ts:131` maps `ws.decedent.dateOfDeath`, which `applyFactSet` made the spine's value |
| TRAIN-repealed medical deduction | `special-deductions.ts` | gated on `deductionRules` from the same date |
| RA 11642 retroactivity | `engine/src/flags.rs` | reads the `EngineInput` the succession wizard already owns — whose `decedent.date_of_death` **is** the spine |

The third row is why no engine file was edited. `18-BASELINE.md` records the measurement:
`detect_spec_flags` keys on the adoption **decree date**, and the corpus double-compute found
`outputs_changed_by_dod=0`. Whether the date of death ought to gate that rule is `LAWYER-08`, status
`awaiting-answer`. This plan routes the date and leaves the rule where the lawyer left it.

## Verification

`npx tsc -b --force` exit 0. `GUARDS 3`, `DECEDENT_NAME_COLUMN 0`, `FACTSET_IMPORTS 2`,
`TAXINPUT_WRITES 3`, `OWN_DATE_COMPARISON 0`, `TESTIDS 4`, `OWN_LOGIC 0`, `NULL_RETURN 1`.

`FactSetConflictBanner.test.tsx` — **7 passed, 0 failed**, `MARKERS 0`. Cases 6 and 7 assert the
literal strings `2019-04-02` and `2021-11-30`, not the presence of an alert.

`ENGINE_TOUCHED 0`, `BASELINES_TOUCHED 0`, `JOURNEY_TOUCHED 0`. No arithmetic in either engine moved.
`node scripts/check-commit-discipline.mjs` exit 0 (`259 commit(s) audited, 0 mixed`).
`EstateTaxWizard.test.tsx` was not edited.

## Reported honestly, not worked around

`npm run test:gate` reports `31 failed | 2078 passed (2109)`, `skipped=0`. **Ledger 31, skips 0 —
both criteria met, unchanged debt.** The 5 failures inside `EstateTaxWizard.test.tsx` are part of
that pre-existing 31 and were proven in plan `18-03` to predate this phase.

The gate itself still fails: `TEST COUNT DROPPED: ran 2109 tests, floor is 2119`. That is Phase 16's
owner-blocked blocker. This plan's 7 cases moved the count 2102 → 2109; the phase so far has moved it
2073 → 2109. `frontend/test-baseline.json` was **not** edited and no action was taken on the
comparison.

## Journey

`node journey/approve.mjs` was **not run** for any step, and `JOURNEY_TOUCHED 0`. This plan adds a
banner that is invisible on a healthy case, so a healthy-case reference should be unaffected; any
diff that does appear is a wizard-region change and must not be approved.
