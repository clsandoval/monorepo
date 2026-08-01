---
phase: 18
plan: 18-02
status: complete
requirements: [FACT-02, FACT-04]
---

# 18-02 — The single fact-set rule

Committed `6e4e766d6` (`frontend/src/lib/fact-set.ts`, `frontend/src/lib/__tests__/fact-set.test.ts`).

## What it builds

One module holding the whole of the phase's decision logic, so `18-03`, `18-04` and `18-05` are
wiring rather than reasoning — and so the gate runner in `18-05`, which sits outside
`frontend/tsconfig.json`'s `include` and is therefore not typechecked by G4, carries no rule of its
own.

Eight exports: `CaseFactSet`, `FactSetVerdict`, `FACT_SET_MISSING_DATE_MESSAGE`,
`factSetConflictMessage`, `factSetFromCaseRow`, `storedTaxDateOfDeath`, `assertOneFactSet`,
`applyFactSet`.

**The rule, in the order it is evaluated:**

| # | Condition | Verdict |
|---|---|---|
| 1 | succession date `''` | `missing-date` — no spine to read from |
| 2 | stored tax date `''` | `ok` — absence is filled, not refused |
| 3 | stored tax date differs | `disagreement`, carrying **both** values |
| 4 | otherwise | `ok` |

Two decisions worth naming:

- **A disagreement is refused, never reconciled.** Overwriting one date with the other would destroy
  the only evidence the case ever disagreed, and would produce a return keyed on a date the schedule
  of shares does not share. `factSetConflictMessage` interpolates both values, which is what FACT-04
  requires: a refusal that does not print what it found is not actionable.
- **`applyFactSet` writes only `decedent.dateOfDeath`.** `name`, `address`, `citizenship`,
  `maritalStatus` and `propertyRegime` are BIR-form fields the lawyer fills on the tax tab;
  overwriting them at every load would discard entered work. This is why
  `prePopulateFromEngineInput` is *not* the home for this — it returns a whole `DecedentDetails`
  block and cannot express a refusal. It is left untouched and uncalled.

The spine is `cases.input_json.decedent.date_of_death`. The `cases.date_of_death` column is a
projection written alongside it by `lib/cases.ts:25,54`; a projection is not an authority, and this
module does not read it.

## Verification

`npx tsc -b --force` exit 0. `EXPORTS 8`, `FORBIDDEN 0` (no `as any`, no `as unknown as`, no
`console`, no `process.exit`, no React import, no Supabase reference), `TRIM 1`.
`npx vitest run src/lib/__tests__/fact-set.test.ts` → **17 passed, 0 failed**; `MARKERS 0` (no
`.skip`/`.only`/`.todo`). `node scripts/check-commit-discipline.mjs` exit 0.
`node scripts/check-assertion-discipline.mjs` exit 0 (`93 files, 2028 blocks, 0 assertion-free`).
`git diff --stat HEAD~1` over `test-baseline.json`, `gate-skips.lock` and `assertion-baseline.json`
prints nothing.

## Observation, recorded not acted on

`npm run test:gate` reports `Tests 31 failed | 2065 passed (2096)`, `skipped=0`. The ledger is still
the same **31** and the skip count is still **0** — unchanged debt.

The gate itself still **fails**: `TEST COUNT DROPPED: ran 2096 tests, floor is 2119`. This is Phase
16's owner-blocked blocker, unchanged. My 17 cases moved the count 2079 → 2096, narrowing the gap by
17 but not closing it. `frontend/test-baseline.json` was **not** edited, and no comparison against
`min_total_tests` was acted on.
