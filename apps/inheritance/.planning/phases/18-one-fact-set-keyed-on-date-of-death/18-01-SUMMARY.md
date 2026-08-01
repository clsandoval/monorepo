---
phase: 18
plan: 18-01
status: complete
requirements: [FACT-01, FACT-02, FACT-03, FACT-04]
---

# 18-01 — Measured both date-of-death spines before unifying them

Committed `17988a737` (`18-BASELINE.md`). No source file touched.

## What it found

Four quantities, each re-measured by a command in this plan rather than quoted from
`18-RESEARCH.md`.

| Quantity | Baseline | Target |
|---|---|---|
| Controls writing `EstateTaxWizardState.decedent.dateOfDeath` | **1** (`DecedentTab.tsx:93`) | `18-03` → 0 |
| Controls writing `EngineInput.decedent.date_of_death` | **2**, one field, one spine | unchanged |
| `prePopulateFromEngineInput` production callers | **0** | unchanged |
| Corpus outputs changed by date of death | **0 of 171** | held fixed |

**The tax spine is genuinely date-driven.** One fact set at `2017-12-31` vs `2018-01-01`:

```
DOD[2017-12-31] rules=PRE_TRAIN medical=40000000 tax_due=100500000 warnings=1
DOD[2018-01-01] rules=TRAIN medical=0 tax_due=30000000 warnings=1
DOD[] rules=TRAIN medical=0 tax_due=0 warnings=1
```

One day moves `tax_due` by 70,500,000 centavos. That is the cost of two spines that can disagree.

**The empty date does not throw.** It returns a fully-formed, zero-filled return with
`rules=TRAIN` and *the same warning count* as a valid date — there is no signal distinguishing "no
date entered" from "date entered". This is the silent path `18-04` replaces with a refusal.

**The succession engine is invariant to the date of death.** `files=173 computed=171 rejected=2
ra8552_inputs=4 heir_rows=652 outputs_changed_by_dod=0`, `CHANGED_FILES (none)`. The three
anti-vacuity counts came back positive, so the `0` measures the engine and not an empty glob;
`ra8552_inputs=4` proves the adoption regime is actually exercised.

## The boundary, read line by line

`$caseId.tax.tsx` has 5 `row.` references. Only **line 56** (`row.decedent_name`) carries a decedent
fact across. Lines 57–58 rehydrate the tax spine's own saved state; lines 97–98 feed the tax
*bridge*, not the wizard state. The audit's "only `decedent_name` crosses" rests on read lines, not
on a count.

## Consequence for the roadmap

The roadmap criterion that unifying the date "changes **both** engines' output" **cannot be met
without deciding `LAWYER-08`** (RA 11642 Sec. 41 keys retroactivity on the adoption decree date, not
the death). It is reported unmet with this measurement as the reason, rather than met by moving a
rule nobody ruled on. `engine/src/flags.rs`, `.planning/lawyer-decisions.json` and
`.planning/LAWYER-AGENDA.md` are untouched by every plan in this phase.

## Verification

`18-BASELINE.md` carries all five required headings (each `grep -cF` → 1); the three load-bearing
tokens appear 9 times. Both probe files deleted — `git status` shows no `probe-18-01-*`.
`node scripts/check-commit-discipline.mjs` exit 0 (`253 commit(s) audited, 0 mixed`).
`node scripts/check-plan-closed-world.mjs` exit 0 (`PLANS OK — 109 plan file(s), 445 task(s)`).
`git status --porcelain` over `frontend/src`, `engine` and `scripts` shows only the pre-existing
`engine/COVERAGE.md` modification, which predates this plan.
