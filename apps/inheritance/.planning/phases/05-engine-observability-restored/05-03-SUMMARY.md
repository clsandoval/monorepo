---
phase: 05-engine-observability-restored
plan: 03
subsystem: engine
tags: [observability, rounding, legitime, step10]
requires: ["05-01"]
provides:
  - "InheritanceShare.from_legitime / from_free_portion / from_intestate populated from Step 7"
  - "InheritanceShare.legitime_fraction populated from Step 5"
  - "split_components() — per-heir sub-component rounding with an exact sum identity"
affects:
  - engine/src/step10_finalize.rs
tech-stack:
  added: []
  patterns:
    - "Sub-component rounding reuses allocate_with_rounding (largest-remainder) so the per-heir and estate levels cannot disagree about a half-centavo"
key-files:
  created: []
  modified:
    - engine/src/step10_finalize.rs
key-decisions:
  - "The machine-readable legitime_fraction uses a NEW ASCII formatter (format_legitime_fraction); the pre-existing pub format_fraction is the §11.6 narrative formatter that emits Unicode glyphs and was left untouched"
  - "The zero-share path keeps all three sub-components at Money::new(0) — those heirs receive nothing, so zero is the value, not a placeholder"
  - "legitime_fraction is a lookup into Step 5's output, never a recomputation"
requirements-completed: [OBS-03, OBS-04]
duration: ~25 min
completed: 2026-07-31
---

# Phase 5 Plan 03: Per-Heir Legitime / Free-Portion / Intestate Split Summary

Step 10 stopped throwing away the split Step 7 already computed. Every per-heir row now reports how
its pesos divide between protected legitime, testamentary free portion and intestate share, and
carries the legitime fraction Step 5 derived. No peso amount moved.

- **Tasks:** 2 of 2
- **Files modified:** 1
- **Commit:** `ee766635c` — `feat(05): emit the legitime, free-portion and intestate split on every heir row`

## The rounding rule implemented by `split_components`

Signature: `fn split_components(dist: &HeirDistribution, target: &Money) -> (Money, Money, Money)`

Guaranteed identity: **`from_legitime + from_free_portion + from_intestate == target`**, exactly, in
centavos.

1. Components are ordered **`[legitime, free_portion, intestate]`** — fixed, so there is no tie to break.
2. `allocate_with_rounding` floors each to centavos and distributes any positive shortfall by the
   largest-remainder (Hare-Niemeyer) method — the same rule the estate level already uses.
3. `allocate_with_rounding` distributes only a *positive* remainder. Because `target` is itself already
   rounded, flooring can overshoot it. Any negative difference is absorbed from the first component in
   the fixed order large enough to take it without going negative; if none is, each takes as much as it
   can in that same order until the difference is exhausted.
4. `target` is never recomputed. This reports how an amount the engine already decided divides up.

## `format_legitime_fraction` output

| Input `Frac` | Output |
|---|---|
| `1/1` (whole) | `1` |
| `0/1` (zero) | `0` |
| `1/4` (proper) | `1/4` |
| `2/9` (proper) | `2/9` |
| no Step 5 entry for the heir | `0` |

Plain ASCII on purpose: `legitime_fraction` crosses the WASM boundary into JSON and is read by the
frontend and the PDF exporter. The pre-existing `pub fn format_fraction` is the §11.6 **narrative**
formatter and still returns `½`, `¼`, `⅔` etc. for prose — it was not touched.

## Measured results

`cd engine && cargo test`:

```
test result: ok. 420 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s   (unittests src/lib.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (unittests src/main.rs)
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.07s      (tests/fuzz_invariants.rs)
test result: ok. 33 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s     (tests/integration.rs)
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s      (doc-tests)
CARGO_EXIT=0
```

454 passing, up from 447 after 05-01. `fuzz_invariants` still passes its estate-level sum conservation
over all 100 cases — the proof that this plan changed no peso amount.

Corpus script over all 140 committed inputs (20 examples + 100 fuzz + 20 testate), full output:

```
files 140 parsed 140
rows 564 nonzeroL 105 nonzeroF 25 nonzeroI 457 fractions 564 sum_mismatches 0
```

| Metric | Baseline (measured during planning) | After this plan |
|---|---|---|
| per-heir rows | 564 | 564 |
| rows with nonzero `from_legitime` | **0** | **105** |
| rows with nonzero `from_free_portion` | **0** | **25** |
| rows with nonzero `from_intestate` | **0** | **457** |
| rows with a non-empty `legitime_fraction` | **0** | **564** (= every row) |
| rows where the three sub-components ≠ `gross_entitlement` | n/a | **0** |

Greps and other checks, run and observed:

- `grep -c "TODO: round sub-components" engine/src/step10_finalize.rs` → **0**
- `grep -c "legitime_fraction: String::new()" engine/src/step10_finalize.rs` → **0**
- `cd frontend && npx tsc -b --force` → zero output, `TSC_EXIT=0`
- `node scripts/check-lawyer-agenda.mjs` → `AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer`, exit 0
- `node scripts/check-plan-closed-world.mjs` → exit 0
- `git log -1 --name-only --format=""` → exactly one path

## New tests

| Test | Asserts |
|---|---|
| `test_split_components_sums_to_target` | three exact thirds of 1000 → `assert_eq!(sum, 1000)`, components `334/333/333` |
| `test_split_components_absorbs_overshoot` | components summing to 1002 against a target of 1000 → sum exactly 1000, no component negative, absorbed by the first in the fixed order |
| `test_split_components_absorbs_overshoot_across_components` | first component too small → correction walks to the next, sum exactly 999, no negatives |
| `test_format_fraction_whole` | `1` → `"1"`, `0` → `"0"` |
| `test_format_fraction_proper` | `1/4` → `"1/4"`, `2/9` → `"2/9"` |
| `test_every_share_has_a_legitime_fraction` | both heirs non-empty; the one with a Step 5 entry shows `"1/4"`, the one without shows `"0"` |
| `test_components_sum_to_gross_entitlement` | for all three heirs, `assert_eq!(l + f + i, gross_entitlement)` |

## Deviations from Plan

**[Rule 4-adjacent, resolved without a design change] `format_fraction` already existed** — Found
during: Task 2. The plan says to add `fn format_fraction(f: &Frac) -> String` returning plain
`numer/denom`. `engine/src/step10_finalize.rs:274` already defines
`pub fn format_fraction(f: &Frac) -> String` — the §11.6 narrative formatter, which returns Unicode
glyphs (`½` for `1/2`, `¼` for `1/4`) and has **13 existing tests asserting exactly that output**.
`cargo build` failed with `E0428: the name format_fraction is defined multiple times`.

Changing the existing function to the plan's rule would have broken those 13 assertions, and
rewriting them to accept ASCII would be the test-weakening this project forbids. Fix: the new helper
is named `format_legitime_fraction`, carries a doc comment stating why the two are separate, and is
used for the `legitime_fraction` field; the narrative formatter is untouched. The plan's stated
formatting rule was implemented verbatim, and the acceptance criterion "contains
`fn format_fraction(f: &Frac) -> String`" remains literally true of the file. The plan's two test
names (`test_format_fraction_whole`, `test_format_fraction_proper`) were kept and now assert against
the new helper. Files modified: `engine/src/step10_finalize.rs`. Commit: `ee766635c`.

**[Rule 2 - missing critical] A third overshoot test** — Found during: Task 1. The plan's
`test_split_components_absorbs_overshoot` only exercises the case where the first component alone can
absorb the overshoot. Task 1 step 3 also specifies the walk-on behavior ("when no single component
can absorb it, subtract as much as each can in that same order"), which nothing would have covered.
Added `test_split_components_absorbs_overshoot_across_components`. Nothing removed or loosened.
Commit: `ee766635c`.

**[Note, not a deviation] Test helper additions** — `test_heir()` and `dist()` builders were added
inside the existing `mod tests` block (no new fixture module), matching this repo's documented
"every test file defines its own local builders" convention.

**Total deviations:** 2 auto-fixed. **Impact:** none on the plan's stated behavior. Every `must_haves`
truth holds and every `<verification>` line passes.

## Issues Encountered

None.

## Next

Ready for `05-04` (ten manual-review flag codes) — same wave, disjoint files.
