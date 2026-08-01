---
phase: 18
plan: 18-06
status: complete
requirements: [FACT-01, FACT-02, FACT-03, FACT-04]
---

# 18-06 — G34 registered at order 11; the gate set grows to 34

Committed `f9036f492` (`gates.manifest.json`, `gates.manifest.lock`, `GATES.md`,
`.planning/ORIENTATION.md`, `RESUME.md`, `.planning/REQUIREMENTS.md`).

## Nothing moved before the manifest was touched

Re-measured, not asserted:

| Quantity | Baseline (`18-BASELINE.md`) | Re-measured now |
|---|---|---|
| `cargo test` | 546 passed (ROADMAP Phase 14) | **546 passed, 0 failed** |
| `deductionRules` / medical / `tax_due` @ `2017-12-31` | `PRE_TRAIN` / `40000000` / `100500000` | identical |
| `deductionRules` / medical / `tax_due` @ `2018-01-01` | `TRAIN` / `0` / `30000000` | identical |
| corpus `computed=` | 171 | **171** |
| `outputs_changed_by_dod=` | 0 | **0** |

No peso figure and no legal outcome moved during this phase.

## The registration

`GATE_COUNT 34`, `NON_ORDER_CHANGES 0`, `MISSING_OR_UNEXPECTED 0`, `ORDER_11 G34`, `LAST G9`,
`ORDERS_UNIQUE true`. `order` is provably the only field that moved on any pre-existing gate —
23 gates shifted `+1`, G3 to 12 and G9 to 34 and still last.

`gates.manifest.lock` holds **34** entries, having gained exactly one appended entry:
`{"id":"G34","command":"cd frontend && npx tsx scripts/check-one-fact-set.ts","blocking":true}`.
`git diff -- gates.manifest.lock` shows **0** removed or modified lines.
`node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 34 gates, 34 locked`.

G34 sits at order 11 for the same reason G14 sits at 10: it loads the WASM artifact G2 builds at
order 9, and a gate placed after G3 would never execute on this branch. A gate that never runs is a
gate in name only.

## Documentation

`GATES.md` gained section **25** and a table row; its count sentence now reads *thirty-four*
(`STALE_COUNT_PROSE 0`). `.planning/ORIENTATION.md` reads `The gate set holds 34 gates.`;
`RESUME.md` reads `ALL GATES PASSED (34/34)`. All four `FACT-0N` checkboxes are ticked and their four
traceability rows read `Complete`. `node scripts/check-doc-claims.mjs` exit 0.

Beyond the plan's letter, **19 table rows in `GATES.md` were renumbered** so the table's `order`
column still matches the manifest. Phase 17 had kept that column in sync, and leaving it stale would
have been documentation drift of exactly the kind section 23's gate exists to catch.

## The whole suite — real output, exit 0 NOT claimed

```
=== GATE G5  (1/34): gate manifest integrity ===   GATE-SKIPS total=34   skipped=0
=== GATE G6  (2/34): plan closed-world lint ===    GATE-SKIPS total=109  skipped=0
=== GATE G7  (3/34): commit discipline audit ===   GATE-SKIPS total=263  skipped=0
=== GATE G12 (4/34): engine coverage report ===    GATE-SKIPS total=17   skipped=0
=== GATE G13 (5/34): assertion discipline ===      GATE-SKIPS total=2041 skipped=0
=== GATE G15 (6/34): journey harness self-test === GATE-SKIPS total=11   skipped=0
=== GATE G16 (7/34): journey registry integrity == GATE-SKIPS total=350  skipped=0
=== GATE G1  (8/34): engine tests ===
=== GATE G2  (9/34): wasm build ===                GATE-SKIPS total=3    skipped=0
=== GATE G14 (10/34): citation integrity ===       GATE-SKIPS total=652  skipped=0
=== GATE G34 (11/34): one fact set ===
    ONE FACT SET CHECK — 3 fixture row(s) examined
    ONE FACT SET OK
=== GATE G3  (12/34): frontend suite vs ledger ===
     Test Files  8 failed | 87 passed (95)
          Tests  31 failed | 2078 passed (2109)
    TEST BASELINE GATE FAILED — 1 violation(s)
    TEST COUNT DROPPED: ran 2109 tests, floor is 2119
      Tests were removed or failed to collect. Restore them.
    GATE-SKIPS total=2109 skipped=0

GATE FAILED: G3 (exit 1)
SUITE_EXIT=1
```

**`SUITE_EXIT=1`. Exit 0 is not claimed anywhere.** **G34 executed at position 11/34 and PASSED**
before the halt, which is the placement working exactly as designed.

### BLOCKED — two owner decisions, neither owned by this phase

1. **`min_total_tests` in `frontend/test-baseline.json`.** `ran 2109 tests, floor is 2119`. The
   remaining 10-test gap is what the Phase 16 deletion removed. Lowering the floor is owner action —
   precedent `4ccf06270`, which did 2416 → 2119 under explicit authorisation. **The file was not
   touched.** This phase added 30 tests, moving the count 2079 → 2109.
2. **G20 and G21 remain registered BLOCKING gates whose scripts commit `4ccf06270` deleted.** Now at
   orders 17/18. **Not re-measured this run** — the suite halts at G3 (order 12) and never reaches
   them; this is carried forward as a static finding. Retiring a gate is owner action under
   `CLAUDE.md` invariant 2, enforced by G5. **Consequence: lowering the test floor alone will not
   make the suite green — it only advances the failure to G20.**

The 31 failures are the unchanged ledgered debt, `skipped=0`.

## Journey — withheld, nothing approved

`node journey/approve.mjs` was **not run for any step in this phase**. Across all of Phase 18's
commits, `git log --name-only | grep -c journey/references` → **0**.

Journey step **`tax-tab-0` is expected to fail on its reference image and is withheld for human
review.** Plan `18-03` made the estate-tax Decedent tab's date field read-only, added a muted
background, a source-note paragraph and a changed label. **That diff is a wizard field, not the
deleted sidebar navigation region**, so the journey reference rule forbids approving it. A human must
confirm the change is intended, then re-approve.

Also still withheld from earlier phases: `results-view` and `results-family-tree`, and the five
rebuilt intake steps.

## Nothing was weakened

`BASELINES_IN_PHASE_COMMITS 0` — across every commit in this phase, no change to
`frontend/test-baseline.json`, `gate-skips.lock` or `assertion-baseline.json`. No test, assertion,
gate or floor was deleted, skipped or loosened. `engine/src/flags.rs`,
`.planning/lawyer-decisions.json` and `.planning/LAWYER-AGENDA.md` are untouched: `LAWYER-08` stays
`awaiting-answer` and no point of Philippine law was decided.

## One incident worth recording

The workflow's own `gsd-sdk query state.begin-phase` step **corrupted `.planning/STATE.md`** at the
start of this run — it overwrote `stopped_at` with a stale Phase 13 message and reset the progress
counters from `18/17/109/103/94` to `12/2/18/12/17`. This surfaced as six `STATE PLAN COUNT` and
`STATE PERCENT DRIFT` violations from G33. The file was restored with `git checkout --` and the
counters re-derived at phase completion. No plan edited it.

## Verification

`node scripts/check-gate-manifest.mjs` exit 0. `node scripts/check-doc-claims.mjs` exit 0.
`node scripts/check-commit-discipline.mjs` exit 0 (`263 commit(s) audited, 0 mixed`).
`cd frontend && npx tsx scripts/check-one-fact-set.ts` exit 0.
`bash scripts/ci-gates.sh` exit **1** at G3, recorded above verbatim.
