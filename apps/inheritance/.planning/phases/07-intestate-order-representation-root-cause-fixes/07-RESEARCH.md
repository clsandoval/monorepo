---
phase: 7
slug: intestate-order-representation-root-cause-fixes
researched: 2026-07-31
requirements: [LAW-01, LAW-02, LAW-03, LAW-04]
---

# Phase 7 Research — Intestate Order & Representation Root-Cause Fixes

Every number in this document was produced by running
`engine/target/release/inheritance-engine` in this working tree on 2026-07-31, against either a
committed input or a scratch input whose full contents are reproduced below. Nothing here is a
code-reading inference alone.

---

## 0. Headline findings

1. **All four defects reproduce today, exactly as `.planning/research/LEGAL-CONFORMANCE.md` §2a
   describes them.** Measured output is in section 1.
2. **The root cause is one filter, but the fix is four filters.** `step2_lines.rs:70` selects
   anchors with `degree_from_decedent == 1`. Removing that constraint globally is wrong, because
   grandchildren (degree 2, `LegitimateChildGroup`) would become own-right lines in every ordinary
   family. The correct generalisation is **per effective category**, and each of the four clauses is
   a direct transcription of a codal sentence. Section 3 states all four.
3. **Step 7 duplicates step 2's anchoring in three places and must be moved in step with it.**
   `get_lc_lines` (`step7_distribute.rs:474`) re-derives descendant lines with its own
   `degree_from_decedent != 1` filter; `distribute_i5/i6/i9/i10` select ascendants by category alone,
   with no alive filter, no degree filter and no line filter; `distribute_collaterals`
   (`step7_distribute.rs:818-821`) selects siblings by `blood_type.is_some()`, which counts a
   predeceased sibling and misclassifies a nephew who happens to carry a `blood_type`.
4. **The correct ascendant selector already exists and is correct.**
   `step5_legitimes.rs:443 divide_among_ascendants` implements nearest-degree-first and the
   Art. 987 ¶2 paternal/maternal half split. `LEGAL-CONFORMANCE.md` §2a says in terms: route step 7
   through it, do not write a new one.
5. **Art. 969 needs no new restart machinery.** Under the per-category anchor rule, a degree at which
   every heir repudiates yields zero lines, so the next degree becomes the anchor set in its own
   right — which is what Art. 969 says. Measured: `check_total_renunciation` is not required to fire
   for the fix to land, and `run_pipeline_with_restart` is not required to run.
6. **The blast radius on committed inputs is bounded and was counted, not guessed.** Across all 140
   committed inputs: **0** have a predeceased `LegitimateParent` carrying children (so LAW-04 changes
   no committed input), **0** have every living legitimate child repudiating (so LAW-03 changes no
   committed input), **4** carry a `LegitimateAscendant` above the parent tier, and **15** carry a
   `NephewNiece`. Section 6 lists all 19 by name with their measured before-values.
7. **Exactly one lawyer-blocked boundary is touched, and the plans stop at it.** Making collateral
   representation real makes `distribute_nephews_only` reachable for the first time. That branch
   already carries the `LAWYER-DECISION: LAWYER-03` marker. The recorded question LAWYER-03 asks
   whether the Art. 1006 full/half-blood 2:1 ratio survives into the Art. 975 ¶2 per-capita case.
   Section 5 shows the question is decisive **only** when the surviving nephews' lines carry mixed
   blood types, that **no committed input is mixed in that way**, and specifies the containment: do
   not alter that branch's formula, emit a manual-review flag when the mixed case is reached, and
   pin no expected centavo value for a mixed case.

---

## 1. The four defects, measured

Binary: `cd engine && cargo build --release` then `./target/release/inheritance-engine <file>`.

### 1.1 LAW-01 — ascendants above the parent tier

Scratch input `law01.json`: three `LegitimateAscendant` persons at `degree: 2` — `gp1` and `gp2`
with `"line": "Paternal"`, `gp3` with `"line": "Maternal"` — all alive, no spouse, no descendants,
`net_distributable_estate.centavos = 1200000000` (₱12,000,000).

```
scenario I15
STATE=1200000000 basis=["Art. 1011"]
warnings 0
```

The three grandparents do not appear in the output at all. Committed input
`examples/coverage-cases/020-ascendants-grandparents.json` (two grandparents, one per line,
E = 463440000) reproduces the same shape: `I15`, `STATE=463440000`.

With a spouse added, committed input `examples/coverage-cases/019-ascendants-grandparents-sp.json`:

```
scenario I11
sp=2204680000
```

`I11` is Art. 995, which is conditioned on the *absence* of ascendants. The spouse takes 100%.

### 1.2 LAW-02 — collateral succession through a predeceased sibling

Committed input `engine/examples/defect-cases/01-collateral-halfblood-nephews.json`: `sib1` alive
full-blood, `sib2` predeceased half-blood with children `n1`/`n2`, both nephews alive with
`blood_type: "Half"`, E = 600000000.

```
engine output check failed: sum conservation violated: per-heir net_from_estate totals 480000000
  centavos, distributable estate is 600000000 centavos
engine output check failed: duplicate heir_id in per_heir_shares: n1 appears 2 times
engine output check failed: duplicate heir_id in per_heir_shares: n2 appears 2 times
```

The CLI exits 2. This is the entry already recorded in `engine/defect-baseline.json` under
requirement LAW-02, `fixed_by_phase: 7`.

### 1.3 LAW-03 — total repudiation by the nearest degree

Scratch input `law03.json`: `lc1`/`lc2`/`lc3` all `has_renounced: true`, each with one living child
(`gc1`/`gc2`/`gc3`, degree 2, `LegitimateChild`), E = 12000000000 (₱120,000,000).

```
scenario I15
STATE=12000000000 basis=["Art. 1011"] | lc1=0 | lc2=0 | lc3=0
warnings 0
```

The three living grandchildren are absent from the output while the State takes the whole estate.

### 1.4 LAW-04 — representation in the ascending line

Scratch input `law04.json`: `fa` is a `LegitimateParent`, `is_alive_at_succession: false`,
`"children": ["sib1"]`, `line: Paternal`; `mo` is a living `LegitimateParent`, `line: Maternal`;
`sib1` is a living full-blood `Sibling` at degree 2. E = 12000000000.

```
scenario I5
fa=6000000000 basis=["Art. 985"] | mo=6000000000 basis=["Art. 985"]
warnings 0
```

A dead man is credited ₱60,000,000. The control `law04ctl.json`, identical but with `sib1` omitted
from the family tree, gives:

```
scenario I5
fa=0 basis=["Art. 985"] | mo=12000000000 basis=["Art. 985"]
```

So the presence of a *sibling* is what makes the dead father non-vacant: `build_single_line` sees
his `Predecease` trigger, `find_representatives_recursive` walks his `children` — the decedent's
siblings — and returns them as representatives, which sets `represented_by` and makes step 9 skip
him as a vacancy. The control is the target output for the defect case.

---

## 2. The mechanism, read out of the source

### 2.1 `step2_lines.rs`

- `step2_build_lines` (`:64`) collects `anchor_ids` at `:68-73` with
  `.filter(|h| h.degree_from_decedent == 1)`.
- `build_single_line` (`:190`) returns a `Representation` line when
  `get_representation_trigger` is `Some`, an `OwnRight` line when the anchor is alive, eligible and
  has not repudiated, and `None` otherwise. A `None` is an *extinct line*.
- `find_representatives_recursive` (`:225`) walks `heir.children` with no category or direction
  check, which is what lets an ascendant be "represented" by the decedent's siblings.
- `LineCounts` (`:106-131`) counts lines per category. `legitimate_ascendant` is therefore 0 whenever
  every ascendant sits above degree 1, which is what makes Regime B unreachable in step 3.

### 2.2 `step3_scenario.rs`

`determine_intestate_scenario` (`:166`) reads only `LineCounts` plus the two booleans
`has_siblings_or_nephews` and `has_other_collaterals`, which `pipeline.rs:85-94` computes directly
from `input.family_tree` with an `is_alive_at_succession` test. Regime B fires on
`lc.legitimate_ascendant > 0`. **No change to step 3 is required by this phase**: once ascendants at
degree 2 form lines, `I5`/`I6`/`I9`/`I10` are selected by the existing code.

### 2.3 `step7_distribute.rs`

- `get_lc_lines` (`:467`) re-derives descendant lines and skips anything with
  `degree_from_decedent != 1` at `:474`.
- `distribute_i5` (`:638`), `distribute_i6` (`:651`), `distribute_i9` (`:705`) and `distribute_i10`
  (`:728`) each select `effective_category == LegitimateAscendantGroup` over the whole heir list —
  no `is_alive`, no degree filter, no `line` filter — and divide by `ascendants.len()`.
- `distribute_collaterals` (`:818`) splits the heir list into
  `siblings = inherits_by == OwnRight && blood_type.is_some()` and
  `nephews = inherits_by == Representation && represents.is_some()`. Because step 2 never marks a
  nephew as a representative, `nephews` is always empty, `distribute_siblings_with_representation`
  and `distribute_nephews_only` are both unreachable, and a nephew carrying a `blood_type` is counted
  as a sibling.
- `distribute_nephews_only` (`:958`) carries the comment
  `// LAWYER-DECISION: LAWYER-03 — recorded interpretive choice`. That marker is checked by gate G10
  (`node scripts/check-lawyer-agenda.mjs`) and must survive verbatim and adjacent to the function.

### 2.4 `step9_vacancy.rs`

- `collect_vacancies` (`:510`) skips a predeceased heir whose `represented_by` is non-empty. This is
  the single reason the collateral duplicate exists: because step 2 leaves `sib2.represented_by`
  empty, step 9 treats `sib2` as a vacancy and Priority 2 (`:261-305`) pushes a *fresh row* per
  representative without checking whether that heir already holds one, so `n1` and `n2` are paid
  twice. **Once step 2 populates `represented_by` on a predeceased sibling, `sib2` stops being a
  vacancy and the duplicate disappears without editing step 9.**
- `check_total_renunciation` (`:526`) pools by `effective_category` with no degree scoping, so a
  family holding both repudiating children and living grandchildren never reports `all_renounced`.

### 2.5 `step5_legitimes.rs:443` — the selector to reuse

`divide_among_ascendants(heirs, collective_fraction, estate_base) -> Vec<HeirLegitime>` filters to
`LegitimateAscendantGroup && is_eligible && is_alive`, takes the parent tier (degree 1) when it is
non-empty, otherwise the minimum degree present, then splits the collective in half between the
paternal and maternal groups when both are present and gives the whole collective to the single
surviving line otherwise. That is Art. 987 ¶1 and Art. 987 ¶2 verbatim. Its return type is
`HeirLegitime`, not `HeirDistribution`, so step 7 needs a selector with the same three tiers rather
than a call that returns the wrong struct. Section 3.3 specifies extracting the *selection* into one
shared function so both step 5 and step 7 read from one implementation.

---

## 3. The fix, stated as four codal clauses

### 3.1 The anchor rule, per effective category

An **anchor** is an heir for whom step 2 attempts to build a line. Today the anchor set is
`degree_from_decedent == 1` for every category. It becomes:

| Effective category | Anchor set | Representation | Authority |
|---|---|---|---|
| `LegitimateChildGroup`, `IllegitimateChildGroup` | the heirs of that category at the **lowest degree at which at least one heir yields a line** (own-right or representation) | descending line, unlimited depth | Arts. 970, 974, 982; Art. 969 for the promotion |
| `SurvivingSpouseGroup` | degree 1 (unchanged) | none | — |
| `LegitimateAscendantGroup` | the ascendants at the **lowest degree at which at least one ascendant is alive, eligible and has not repudiated** | **never** | Art. 987 ¶1; Art. 972 ¶1 |
| `CollateralGroup` | the heirs of that category at the **lowest degree at which at least one heir yields a line** (degree 2 siblings when any sibling record exists, degree 3 nephews when none does) | one level only — a nephew may represent a sibling, a grand-nephew may not | Arts. 972 ¶2, 975 ¶1 |

The descendant and collateral rows are the same sentence. The ascendant row differs in exactly two
ways, and both differences are statutory: representation is prohibited, and therefore a
non-inheriting ascendant cannot keep a degree "occupied" the way a predeceased child does.

Two consequences worth stating because they are what keep every existing test green:

- In an ordinary family with living children, degree 1 yields lines, so degree 2 grandchildren are
  never anchors. The rule reduces to today's behaviour.
- When every child predeceases and grandchildren survive, the predeceased children still yield
  `Representation` lines, so degree 1 remains the anchor degree and the distribution stays per
  stirpes. The rule reduces to today's behaviour.

### 3.2 Art. 972 ¶1 — never in the ascending line

For `LegitimateAscendantGroup`, `build_single_line` must not construct a `Representation` line and
must not call `find_representatives_recursive`. An ascendant who is not alive, not eligible, or has
repudiated yields no line, full stop. This alone turns `law04.json` into `law04ctl.json`.

### 3.3 Step 7 must select ascendants the same way step 5 does

`distribute_i5`, `distribute_i6`, `distribute_i9` and `distribute_i10` must replace their
`effective_category` filter with the three-tier selection already implemented at
`step5_legitimes.rs:465-509`: alive and eligible only, nearest degree only, half to each line when
both lines are present.

Worked target for `law01.json` (E = 1200000000, `gp1`/`gp2` paternal, `gp3` maternal):
paternal half = 600000000 split two ways = **300000000 each**; maternal half = **600000000** to
`gp3`. A flat `amount / 3` would give 400000000 each, which is the number Art. 987 ¶2 forbids.

### 3.4 Step 7 must select collaterals from the lines step 2 built

`distribute_collaterals`'s two filters become:

- **sibling line**: `raw_category == Sibling` and the heir is alive, eligible, has not repudiated,
  and `represented_by.is_empty()`
- **representative**: `inherits_by == Representation` and `represents.is_some()`

`blood_type` stops being the discriminator. It stays the *weight*: an absent `blood_type` is
weighted identically to `Full`, which is what both committed distributors already do — see
`distribute_siblings_with_representation`'s `s.blood_type.unwrap_or(BloodType::Full)` at `:895` and
`distribute_siblings`'s "either group empty means equal shares" at `:849`. This phase does not
change that convention and does not invent one.

Worked target for `defect-cases/01` (E = 600000000): `sib1` is a full-blood line worth 2 units, the
`sib2` line is half-blood worth 1 unit, total 3 units, per unit 200000000. `sib1` = **400000000**,
`n1` = `n2` = **100000000**. Sum = 600000000, three rows, no duplicates. This is the "Correct:
₱4M/₱1M/₱1M" figure recorded in `LEGAL-CONFORMANCE.md` §2a.

### 3.5 Art. 969 falls out of 3.1

`law03.json` under the rule in 3.1: at degree 1 all three children have repudiated, so
`build_single_line` returns `None` for each and degree 1 yields zero lines; the rule moves to degree
2, where `gc1`/`gc2`/`gc3` are alive and yield three own-right lines. `LineCounts.legitimate_child`
becomes 3, step 3 selects `I1`, and `get_lc_lines` — once it consumes the same anchor set — produces
three own-right lines of 4000000000 centavos each.

`check_total_renunciation` then reports nothing for this family, because the group it pools
(`LegitimateChildGroup`) contains three living non-repudiating grandchildren. No restart occurs and
`total_restarts` stays 0. The function is left in place and given the degree scoping its own doc
comment claims ("all nearest relatives of a degree"), so that its verdict matches its contract; the
measured consequence of that scoping on the committed corpus is zero, because **0 of 140 committed
inputs have every living legitimate child repudiating**.

---

## 4. Why the reachable-degree formulation, and not four hardcoded degrees

Three formulations were considered against the measured corpus. The plans use formulation C.

| # | Formulation | Rejected because |
|---|---|---|
| A | Drop the filter — anchor every heir | Grandchildren become own-right lines in every family with living children. `examples/cases/02-married-3lc.json` and 60+ fuzz inputs would double-count. |
| B | Anchor `degree == 1` for descendants and spouse, `min degree` for ascendants and collaterals | Does not deliver Art. 969: the repudiating-children case still yields zero descendant lines and escheats. |
| C | Per category, the lowest degree that yields at least one line (ascendants: the lowest degree that is alive and eligible, with representation prohibited) | — |

Formulation C is one predicate with one category-specific exception, which is what a single shared
helper can express and what step 7 can consume without re-deriving anything.

---

## 5. The one lawyer-blocked boundary, and its containment

`distribute_nephews_only` becomes reachable for the first time in this codebase's life. It divides
per capita and ignores `blood_type` entirely. Recorded question **LAWYER-03** in
`.planning/LAWYER-AGENDA.md` asks whether Art. 1006's 2:1 full/half ratio survives into the
Art. 975 ¶2 per-capita case. Its status in `.planning/lawyer-decisions.json` is `awaiting-answer`.

Three measured facts bound the exposure:

1. **The question is decisive only on mixed blood.** When every surviving nephew line carries the
   same blood type (or none carries one), a flat per-capita division and a 2:1-weighted division
   produce identical amounts, because every line carries the same weight. The two readings agree, so
   computing an answer decides nothing.
2. **No committed input is mixed in that way.** All 15 nephew-carrying inputs were inspected. In
   `examples/coverage-cases/006`…`009` — the four nephews-alone inputs — every `Sibling` and every
   `NephewNiece` has `"blood_type": null`. `defect-cases/01` has a living sibling, so it takes the
   sibling-plus-representative branch, not the nephews-alone branch.
3. **The branch's formula is already committed code carrying the marker.** Leaving it untouched
   records no new position.

Containment, written into plan 07-02 as three obligations:

- Do not change `distribute_nephews_only`'s arithmetic, its `Art. 975` legal basis, or the
  `LAWYER-DECISION: LAWYER-03` comment line above it.
- Emit a manual-review flag when that branch is reached **and** the surviving representative lines
  carry both `Full` and `Half` blood types, so the undecided point is loud rather than silent. This
  is the engine saying a human must decide, which decides nothing — the same standing this project
  gave every Phase 5 detector.
- Pin no expected centavo value, in any test, for a nephews-alone case with mixed blood types.

Two further recorded questions were checked and are **not** touched by this phase. LAWYER-04
(Art. 992's reach into the collateral line) governs LAW-07 in Phase 14; this phase adds no
Art. 992 rule and TV-20's family has a living parent, so its measured value does not move.
LAWYER-06 (donation reduction) governs LAW-06 in Phase 14; this phase touches no donation path.

---

## 6. Blast radius, counted

A script walked all 140 committed inputs across `examples/cases`, `examples/testate-cases`,
`examples/fuzz-cases` and `examples/coverage-cases` and classified them by shape.

| Shape | Count | Effect of this phase |
|---|---|---|
| Predeceased `LegitimateParent` carrying `children` | **0** | LAW-04 changes no committed input |
| Every living legitimate child has `has_renounced: true` | **0** | LAW-03 changes no committed input |
| Any `LegitimateAscendant` (degree 2) | **4** | all four change — listed below |
| Any `NephewNiece` | **15** | all fifteen change — listed below |
| Any `Sibling` | 22 | the 7 without a nephew are unaffected: living siblings stay anchors and `distribute_siblings` is untouched |

Measured before-values for the nineteen that move:

| Input | Before |
|---|---|
| `coverage-cases/019-ascendants-grandparents-sp.json` | `I11`, `sp=2204680000` |
| `coverage-cases/020-ascendants-grandparents.json` | `I15`, `STATE=463440000` |
| `coverage-cases/021-ascendants-grandparents-sp.json` | `I11` |
| `coverage-cases/022-ascendants-grandparents-sp.json` | `I11` |
| `coverage-cases/001`…`005-nephews-representing-*.json` | `I13`, the living sibling takes 100% and the nephew rows are absent |
| `coverage-cases/006`…`009-nephews-only-*.json` | `I13`, per stirpes via the step 9 improvisation (`008`: `n1=4450000, n3=4450000, n2=8900000`) |
| `coverage-cases/010`…`012-nephews-with-spouse-*.json` | `I12`, `sp` and `sib1` split, nephew rows absent |
| `defect-cases/01-collateral-halfblood-nephews.json` | CLI exit 2, five rows, Σ = 480000000 of 600000000 |

None of these nineteen is asserted at an exact amount by any test. `engine/tests/fuzz_invariants.rs`
evaluates named invariants (conservation, uniqueness, non-negativity) over
`examples/fuzz-cases` and `examples/coverage-cases` and asserts no per-case amount;
`engine/tests/observability.rs` asserts corpus-wide properties in the form "greater than zero" and
"at least ten steps", never an exact count; `engine/tests/defect_ledger.rs` reads
`examples/defect-cases` only.

### 6.1 The named vectors in `engine/tests/integration.rs`, checked one by one

The four vectors that could plausibly move were read in full and none of them moves:

- **TV-15 `test_tv15_collateral_siblings`** — three living siblings, no nephew. All three remain
  own-right sibling lines; `distribute_siblings` is not edited. Expected 400000000 / 400000000 /
  200000000 stands.
- **TV-19 `test_tv19_total_renunciation_restart`** — two repudiating children with **no**
  descendants, plus two living parents. Degree 1 yields zero descendant lines, degree 2 holds no
  descendant, so the descendant tier is empty exactly as today; both parents are alive at degree 1,
  the paternal and maternal lines are both present, and the half-and-half split gives 600000000
  each. Expected values stand.
- **TV-20 `test_tv20_iron_curtain`** — `victor` is a **living** `LegitimateParent` and the helper
  `person()` leaves `children` empty, so no ascending-line representation is attempted. Only the
  paternal line is present, so the whole collective goes to it: 800000000. Expected value stands.
- **TV-23 `test_tv23_ascendant_only`** — two living parents, one per line. Half and half gives
  400000000 each, identical to today's flat division. Expected values stand.

### 6.2 The frontend

`frontend/src/wasm/__tests__/scenario-coverage.test.ts` and `conformance.test.ts` exercise `I5` with
living degree-1 parents and `I13` with living siblings only. Neither shape moves. The WASM binary is
a build artifact and must be rebuilt (`bash engine/build-wasm.sh`, gate G2) after any engine change
so the frontend suite tests the new code rather than a stale binary.

---

## 7. Validation Architecture

Each requirement, the observable that proves it, and the exact command that produces the observable.

### LAW-01 — ascendants above the parent tier can inherit

- **Sampling point:** `engine/target/release/inheritance-engine` run on `law01.json` and on
  `examples/coverage-cases/020-ascendants-grandparents.json`, plus a named vector in
  `engine/tests/integration.rs`.
- **Signal:** `scenario_code` moves from `I15`/`I11` to `I5`/`I6`, and every grandparent holds a row.
- **Command:** `cd engine && cargo test --test integration` and the CLI run.
- **Falsifier:** the grandparent-only family still emits a `STATE` row, or the three-grandparent
  family divides flat at 400000000 each instead of 300000000 / 300000000 / 600000000.

### LAW-02 — collateral succession conserves the estate and emits no duplicate

- **Sampling point:** `engine/examples/defect-cases/01-collateral-halfblood-nephews.json` through
  the checked entry point, and the whole `examples/coverage-cases` corpus through the invariant
  suite.
- **Signal:** the CLI exits 0 with three rows summing to 600000000; `engine/tests/defect_ledger.rs`
  reports `STALE DEFECT DECLARATION` until the LAW-02 entry is deleted from
  `engine/defect-baseline.json`; `cargo test --test fuzz_invariants` stays green on INV01 and INV13.
- **Command:** `cd engine && cargo test --test defect_ledger --test fuzz_invariants`.
- **Falsifier:** any duplicate `heir_id`, or a per-heir sum other than the estate, or the ledger
  entry surviving the fix.

### LAW-03 — total repudiation passes to the next degree in own right

- **Sampling point:** `law03.json` and a named vector.
- **Signal:** `scenario_code` is `I1`, three grandchild rows at 4000000000 centavos each, no `STATE`
  row.
- **Command:** `cd engine && cargo test --test integration`.
- **Falsifier:** a `STATE` row appears while a living grandchild exists, or the grandchildren are
  paid by representation (which Art. 969 forbids) rather than in their own right.

### LAW-04 — representation never operates in the ascending line

- **Sampling point:** `law04.json` against its control `law04ctl.json`.
- **Signal:** the two outputs become byte-identical in their per-heir rows: `fa` at 0, `mo` at
  1200000000, no `sib1` row.
- **Command:** `cd engine && cargo test --test integration` plus the two CLI runs diffed.
- **Falsifier:** the predeceased father holds any nonzero amount, or the sibling appears while a
  parent survives.

### Cross-cutting

- **Regression floor:** `cd engine && cargo test` must report at least 481 passing and 0 failing,
  which is the count Phase 5 left behind.
- **WASM parity:** `bash engine/build-wasm.sh` must exit 0 and the rebuilt binary must be in place
  before any frontend gate is judged.
- **Runner:** `bash scripts/ci-gates.sh` still halts at `G3` for Phase 5's unresolved OBS-05/OBS-06
  product decision. `ALL GATES PASSED (13/13)` is **not** achievable in this phase and must not be
  claimed. Gates `G5`, `G6`, `G7`, `G12`, `G13`, `G1` and `G2` run ahead of `G3` and are the phase's
  provable set.

---

## 8. File contention and wave assignment

Three source files are shared by more than one unit of work, so the waves are strictly sequential.

| File | 07-01 | 07-02 | 07-03 | 07-04 |
|---|---|---|---|---|
| `engine/src/step2_lines.rs` | yes | yes | yes | — |
| `engine/src/step7_distribute.rs` | yes | yes | yes | — |
| `engine/src/step9_vacancy.rs` | — | — | yes | — |
| `engine/defect-baseline.json` | — | yes | — | — |
| `engine/tests/integration.rs` | — | — | — | yes |

Each wave must leave `cd engine && cargo test` green on its own, which is why the ascendant, the
collateral and the descendant tiers are each fixed **end to end** — step 2 and step 7 together —
rather than split into a step-2 wave and a step-7 wave. A step-2-only change to the ascendant anchor
set would make `distribute_i5` include a predeceased parent alongside the grandparents and would
leave the tree red between waves.

`engine/defect-baseline.json` is deleted-from in 07-02 rather than later, because
`engine/tests/defect_ledger.rs` fails with `STALE DEFECT DECLARATION` the moment the LAW-02 fix
lands. That failure is the intended signal, and the plan that causes it is the plan that closes it.

---

## 9. What this phase deliberately does not do

- It does not implement Art. 992's iron curtain in any line. That is LAW-07, blocked on LAWYER-04,
  owned by Phase 14.
- It does not touch any donation, collation or preterition path. Those are LAW-05 and LAW-06, owned
  by Phases 8 and 14. The two donation entries in `engine/defect-baseline.json` stay.
- It does not answer LAWYER-03. See section 5.
- It does not fix the Art. 1010 fifth-degree gate (`I14` with an empty distribution) or the
  Art. 900 ¶2 three-month window. Neither is in LAW-01…LAW-04.
- It does not edit `frontend/test-baseline.json`, `gate-skips.lock`, `gates.manifest.json` or
  `gates.manifest.lock`. No gate is added and none is removed.
- It does not edit `specs/`. The Art. 972 ¶1 spec omission is LAW-13, owned by Phase 14.

---

## 10. Anything not measured

- The post-fix numbers in sections 3.3, 3.4 and 3.5 are computed by hand from the codal fractions and
  the measured estates. They have not been produced by a run, because the fix does not exist yet.
  Every one of them is an acceptance criterion in a plan, so the executor produces the run.
- The effect of the fix on `engine/examples/test-results.md` was not examined. That file is a
  generated report and is not read by any gate.
- No frontend test was executed during this research pass. The frontend claim in section 6.2 rests
  on reading the two test files and matching their family shapes against the four rules in section 3.
