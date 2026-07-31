---
phase: 06-property-test-coverage-depth
plan: 01
subsystem: testing
tags: [property-testing, corpus, fuzz, defect-ledger, coverage]
requires:
  - phase: 05-engine-observability-restored
    provides: "run_pipeline_checked runtime conservation and duplicate-heir rejection, which is what makes a defect case exit 2 instead of passing silently"
provides:
  - "engine/examples/coverage-cases/ — 30 generated cases reaching five previously unreachable Relationship variants, all conserving the estate"
  - "engine/examples/defect-cases/ — 3 hand-written cases reproducing two documented conservation defects"
  - "engine/defect-baseline.json — shrink-only ledger naming the invariants each defect case violates and the requirement that closes it"
  - "engine/examples/report-corpus-shapes.py — one-command proof of which heir shapes the corpus reaches"
affects:
  - engine/tests/fuzz_invariants.rs
  - .planning/phases/06-property-test-coverage-depth/06-02-PLAN.md
tech-stack:
  added: []
  patterns:
    - "Second generator with its own seed and its own output directory, so the byte-stable 100-file fuzz corpus is never re-shuffled"
    - "Two-corpus split: asserting corpus (must stay green) vs defect corpus (frozen in a shrink-only ledger)"
key-files:
  created:
    - engine/examples/generate-coverage-cases.py
    - engine/examples/report-corpus-shapes.py
    - engine/examples/coverage-cases/ (30 files)
    - engine/examples/defect-cases/ (3 files)
    - engine/defect-baseline.json
  modified: []
key-decisions:
  - "A `Stranger` bystander person was added to the gen_legitimated_child shape. `Stranger` is the eleventh Relationship variant and appeared in zero of the 140 previously committed inputs; the plan's nine shapes did not otherwise produce it, so the plan's own acceptance criterion (all eleven PRESENT) was unreachable. Measured first: a Stranger in family_tree leaves the distribution and the estate sum completely unchanged."
  - "gen_heir_donation_at_or_below_one is pinned to exactly 2 legitimate children, not 2-3. With 3 children the same donation breaks sum conservation from ratio 0.6 upward — a new measurement, same LAW-06 mechanism. The plan instructs moving the shape's parameters back to the measured Group A row rather than shipping a red case in the asserting corpus."
  - "report-corpus-shapes.py totals donations per case rather than per donation, which reproduces the documented 0.5524 fuzz-corpus baseline exactly and keeps the number comparable to LEGAL-CONFORMANCE.md line 76."
requirements-completed: [COV-01]
duration: ~35 min
completed: 2026-07-31
---

# Phase 6 Plan 01: Corpus Reaches the Breaking Shapes

The property corpus can now reach every heir shape the engine implements. Five `Relationship`
variants that appeared in **zero** of the 140 committed inputs — `LegitimatedChild`,
`LegitimateAscendant`, `NephewNiece`, `OtherCollateral`, `Stranger` — are now present, a stranger
donee exists for the first time, and the maximum donation/estate ratio went from 0.5524 to 1.5000.

## What landed

| Artifact | Content |
|---|---|
| `engine/examples/generate-coverage-cases.py` | Second generator, `SEED = 20260731`, `CASES_DIR = "./examples/coverage-cases"`, nine shape functions |
| `engine/examples/coverage-cases/` | 30 generated cases, **all exit 0** through `inheritance-engine` |
| `engine/examples/defect-cases/` | 3 hand-written cases, **all exit 2** with `engine output check failed:` |
| `engine/defect-baseline.json` | 3 known violations with exact observed numbers, `MAY ONLY SHRINK` |
| `engine/examples/report-corpus-shapes.py` | Read-only report, exits 0 on `CORPUS SHAPES OK` |

`engine/examples/generate-fuzz-cases.py` was not edited and
`git status --porcelain examples/fuzz-cases examples/cases examples/testate-cases` is empty — the
100 fuzz cases, 20 curated cases and 20 testate cases are byte-identical.

## Measured results

```
ls examples/coverage-cases/*.json | wc -l   -> 30
ALL_ZERO_EXIT=1                              (30/30 exit 0)
grep -l NephewNiece examples/coverage-cases  -> 15 files  (plan floor: 8)
ls examples/defect-cases/*.json | wc -l      -> 3
```

Defect reproduction, verbatim from the CLI:

```
--- examples/defect-cases/01-collateral-halfblood-nephews.json
exit=2
engine output check failed: sum conservation violated: per-heir net_from_estate totals 480000000 centavos, distributable estate is 600000000 centavos
engine output check failed: duplicate heir_id in per_heir_shares: n1 appears 2 times
engine output check failed: duplicate heir_id in per_heir_shares: n2 appears 2 times
--- examples/defect-cases/02-heir-donation-above-estate.json
exit=2
engine output check failed: sum conservation violated: per-heir net_from_estate totals 125000000 centavos, distributable estate is 100000000 centavos
--- examples/defect-cases/03-stranger-donee.json
exit=2
engine output check failed: sum conservation violated: per-heir net_from_estate totals 110000000 centavos, distributable estate is 100000000 centavos
```

Every number matches `06-RESEARCH.md` section 2.4 to the centavo.

Corpus report, final block:

```
LegitimateChild 382, SurvivingSpouse 69, Sibling 44, NephewNiece 28, IllegitimateChild 26,
LegitimateParent 18, LegitimateAscendant 8, LegitimatedChild 6, AdoptedChild 4,
OtherCollateral 4, Stranger 2

max donation/estate ratio: cases 0.2500 | fuzz-cases 0.5524 | coverage-cases 0.9000 | defect-cases 1.5000
Files with a stranger donee: 1
All 11 Relationship variants PRESENT
CORPUS SHAPES OK        (exit 0)
```

The report's failure path was observed firing on a scratch copy containing only `fuzz-cases/`:
`MISSING variants: LegitimatedChild, AdoptedChild, LegitimateAscendant, NephewNiece,
OtherCollateral, Stranger` → `CORPUS SHAPES INCOMPLETE`, exit 1.

`cd engine && cargo test` — 6 binaries, **0 failed** on every one (442 + 0 + 1 + 35 + 3 + 0).

## New measurement not in the research doc

With **three** legitimate children instead of two, a donation to `lc1` breaks sum conservation from
ratio **0.6** upward, not only above 1.0:

```
nlc=2 ratio=0.6 exit=0
nlc=3 ratio=0.6 exit=2  per-heir net_from_estate totals 106666666, estate 100000000
nlc=3 ratio=1.0 exit=2  per-heir net_from_estate totals 133333332, estate 100000000
```

This is the same LAW-06 mechanism at a lower threshold, not a new defect and not a new legal
question. It is recorded here and in a comment on the generator function; no ledger entry was added
for it, because `engine/defect-baseline.json` ships with exactly the three entries the plan
specifies and appending to a shrink-only ledger is prohibited.

## Nothing weakened, nothing legal decided

No test, assertion or gate was modified, skipped or deleted. `frontend/test-baseline.json`,
`gate-skips.lock`, `gates.manifest.json` and `gates.manifest.lock` were not touched. No point of
Philippine law arose: every ledger entry records an arithmetic observation and cites the requirement
(`LAW-02`, `LAW-06`) that already owns the fix, and the two `LAW-06` entries cite the recorded
decision `LAWYER-06` (status `awaiting-answer`) without stating which reading is correct. Nothing
was added to `LAWYER-AGENDA.md`.
