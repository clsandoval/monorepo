# Phase 6 Research — Property-Test Coverage Depth

**Measured:** 2026-07-31, live in this tree. Every number below came from a command that was
actually run. Nothing here is inferred from documentation.

**Requirements covered:** COV-01, COV-02, COV-03, COV-04, COV-05

---

## 0. Headline findings

1. **The corpus cannot reach the breaking shapes, exactly as `LEGAL-CONFORMANCE.md:76` claims — and
   the three numbers it cites reproduce.** Across all 140 committed inputs: `NephewNiece` appears
   **0** times, `recipient_is_stranger: true` appears **0** times, and the maximum
   donation/estate ratio is **0.5524**.
2. **Two of COV-01's three shapes break the sum-conservation invariant today.** A donation to an
   heir at ratio > 1.0 and a donation to a *stranger* at **any** ratio both make
   `Σ net_from_estate > estate`. Both are the already-documented LAW-06 defect, whose fix is
   lawyer-blocked on LAWYER-06 and lives in Phase 14. Adding those cases to
   `examples/fuzz-cases/` would turn gate G1 red with no legitimate way to make it green in this
   phase.
3. **The `NephewNiece` shape breaks only when the nephews carry a `blood_type`.** This was found by
   bisection, and it reproduces `LEGAL-CONFORMANCE.md`'s collateral defect to the peso: 5 rows,
   every nephew duplicated, Σ = ₱4,800,000 against a ₱6,000,000 estate. Nephews **without**
   `blood_type` conserve the estate and produce no duplicates.
4. **Zero of the 23 legal test vectors currently assert a scenario code.**
   `check_scenario_consistency` is defined at `engine/tests/integration.rs:599` and is
   `#[allow(dead_code)]` — `grep -c "check_scenario_consistency("` returns **1**, the definition
   itself. `check_adoption_equality` and `find_share_by_name` are dead the same way.
5. **COV-03 is fully tightenable from an in-repo authority with zero legal decisions.** The spec's
   test-vector table at `specs/inheritance-engine-spec.md:2371-2393` names the expected scenario
   code for all 23 vectors, and §14.3–14.5 give worked per-heir amounts for TV-13, TV-14 and
   TV-22. The engine agrees with every one of them. Five entries use notation that is not an enum
   variant; all five are reconciled in §4.2 below with the measured engine value.
6. **COV-04 needs no crate and no npm package** — only the rustup component
   `llvm-tools-preview`, which was installed and exercised end to end during this research pass.
   A full per-module region/line/function report was produced.
7. **COV-05 finds 0 assertion-free tests and 15 weak-only tests** in the frontend suite, all
   enumerated in §6.2. Two of the 15 are among the five tests that currently make gate G3 red for
   Phase 5's blocker.

---

## 1. Baseline commands and their current output

### 1.1 The gate runner

```
cd /home/clsandoval/cs/monorepo/apps/inheritance && bash scripts/ci-gates.sh
```

`CI_GATES_EXIT=1`. Gates in order and their observed result:

| # | Gate | Result |
|---|---|---|
| 1 | G5 gate manifest integrity | pass |
| 2 | G6 plan closed-world lint | pass |
| 3 | G7 commit discipline audit | pass |
| 4 | **G1 engine tests** | **pass** |
| 5 | G2 wasm build | pass |
| 6 | G3 frontend suite vs ledger | **FAIL — `TEST BASELINE GATE FAILED — 5 violation(s)`** |
| 7–11 | G4, G10, G11, G8, G9 | never reached |

The five G3 violations are the Phase 5 OBS-05/OBS-06 blocker verbatim:

```
UNKNOWN FAILURE: src/__tests__/integration.test.tsx :: integration > compute handles invalid input gracefully compute() handles duplicate person IDs
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles negative centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles duplicate person IDs without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles negative estate centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles duplicate person IDs without crashing
```

**Consequence for Phase 6, and this is the single most important sequencing fact in this
document:** `G1` runs at position 4, **before** `G3`. Every engine-side Phase 6 deliverable
(COV-01, COV-02, COV-03) is therefore provable on a full runner invocation even while Phase 5 is
blocked. But any **new** gate placed after `G3` in `order` would never execute on a full run.

The runner's own semantics make the fix trivial and legitimate: `gates.manifest.lock` freezes only
`{id, command, blocking}`; `order` is explicitly unlocked and `GATES.md` section 1 says so. **Both
new Phase 6 gates therefore take `order` values before `G1`**, so they run on every invocation of
`scripts/ci-gates.sh` regardless of Phase 5's state. This is not a workaround for a red gate — it
is placing two static, fast, engine-independent checks where they belong.

Phase 6 must not, and does not, touch any of the five failing tests.

### 1.2 The engine suite

```
cd engine && cargo test
```

Passes. 5 test binaries. `engine/tests/` holds `fuzz_invariants.rs`, `integration.rs`,
`observability.rs`.

### 1.3 The gate manifest today

`gates.manifest.json` version 1, 11 gates. Current `order` values:

| order | id | command |
|---|---|---|
| 1 | G5 | `node scripts/check-gate-manifest.mjs` |
| 2 | G6 | `node scripts/check-plan-closed-world.mjs` |
| 3 | G7 | `node scripts/check-commit-discipline.mjs` |
| 4 | G1 | `cd engine && cargo test` |
| 5 | G2 | `bash engine/build-wasm.sh` |
| 6 | G3 | `cd frontend && npm run test:gate` |
| 7 | G4 | `cd frontend && npx tsc -b --force` |
| 8 | G10 | `node scripts/check-lawyer-agenda.mjs` |
| 9 | G11 | `node scripts/check-observability.mjs` |
| 10 | G8 | `node scripts/check-gate-skips.mjs` |
| 11 | G9 | `node scripts/check-gate-results.mjs` |

Adding a gate requires appending the **same** `{id, command, blocking}` entry to
`gates.manifest.json` and to `gates.manifest.lock` in one edit. Doing only the manifest produces
`UNLOCKED GATE`; doing only the lock produces `GATE REMOVED`. `check-gate-manifest.mjs` requires
`order` to be an integer and nothing more.

Two further contracts every new gate script must honour, read from
`scripts/check-gate-skips.mjs:14-31` and `:349`:

- The script must print `GATE-SKIPS total=<n> skipped=<n>` on **every** exit path. A log without
  that line fails G8 with `SKIP REPORT MISSING`.
- Any skip it reports must be declared in `gate-skips.lock`, which may only shrink. Phase 6
  introduces **zero** skips, so `gate-skips.lock` is not modified and every new gate emits
  `skipped=0`.

`G9` must remain last: `scripts/check-gate-results.mjs` fails with `RESULTS INCOMPLETE` when any
gate other than itself is `not-run`, and the runner republishes after each gate.

---

## 2. COV-01 — what the corpus cannot reach, measured

### 2.1 The generators and the corpus

| Path | Role | File count |
|---|---|---|
| `engine/examples/generate-fuzz-cases.py` | generates the property corpus, `SEED = 20260224` | — |
| `engine/examples/fuzz-cases/` | the property corpus `fuzz_invariants.rs` reads | **100** |
| `engine/examples/cases/` | 20 hand-curated intestate/testate cases | **20** |
| `engine/examples/testate-cases/` | 20 testate cases | **20** |

`python3 --version` → `Python 3.10.12`. The generator runs. **It is deterministic**: re-running it
over a copy of the committed corpus regenerated all 100 files byte-for-byte
(`diff -rq` produced no output).

> That determinism is load-bearing for planning. Because the seed is fixed and the RNG stream is
> consumed in generator-declaration order, **adding a new generator function to
> `generate-fuzz-cases.py` would shift the stream and rewrite all 100 committed files.** Phase 6
> therefore adds a *separate* generator writing to a *separate* directory, and leaves the existing
> 100 files untouched. Zero churn, zero risk of a re-shuffled corpus silently changing what is
> tested.

### 2.2 Relationship coverage across all 140 inputs

```
LegitimateChild  402
SurvivingSpouse   76
IllegitimateChild 31
LegitimateParent  22
Sibling           14
AdoptedChild       1
```

`Relationship` has 11 variants (`engine/src/types.rs:96-108`). **Five never appear anywhere in the
corpus**: `LegitimatedChild`, `LegitimateAscendant`, `NephewNiece`, `OtherCollateral`, `Stranger`.

`grep -l "NephewNiece" engine/examples/*/*.json` → 0 files, in all three directories.
`gen_nephews()` exists at `generate-fuzz-cases.py:209` and **is never called** — `grep -n
gen_nephews examples/*.py` returns only the definition line.

Effective-category histogram of the *output* over the same 140 inputs:
`LegitimateChildGroup 428, SurvivingSpouseGroup 76, IllegitimateChildGroup 31,
LegitimateAscendantGroup 22, CollateralGroup 7`.

### 2.3 Donations

- Files with at least one donation: **13** of 140.
- `grep -rl '"recipient_is_stranger": true' engine/examples/` → **0 files**.
- Maximum donation/estate ratio: **0.5524**, in
  `engine/examples/fuzz-cases/075-testate-donations-3don-2lc-sp.json`.

`generate-fuzz-cases.py:128-139` hardcodes `"recipient_is_stranger": False` and
`:394` caps each donation at 5–25 % of the estate with at most 3 donations, so **the generator is
structurally incapable of producing either shape.**

### 2.4 What happens when the missing shapes ARE fed to the engine

Every case below was hand-built and run through `engine/target/release/inheritance-engine`
(which calls `run_pipeline_checked`, exit 2 = the runtime conservation/uniqueness check rejected
the output).

**Group A — shapes that PASS every current invariant (safe to add to the asserting corpus):**

| Shape | Scenario | Rows | Σ net_from_estate vs estate | Duplicate ids |
|---|---|---|---|---|
| 1 living sibling + 1 predeceased sibling with 2 nephews (no `blood_type` on nephews) | I13 | 3 | equal | no |
| nephews only, all siblings predeceased | I13 | 1 | equal | no |
| 2 predeceased siblings, 4 nephews | I13 | 4 | equal | no |
| 1 full-blood sibling alive + 1 half-blood predeceased with 3 nephews (nephews no `blood_type`) | I13 | 4 | equal | no |
| nephews + surviving spouse | I12 | 3 | equal | no |
| living sibling that has children (children do not inherit) | I13 | 1 | equal | no |
| sibling renounces, second sibling alive | I13 | 2 | equal | no |
| `OtherCollateral` only | I14 | 1 | equal | no |
| `LegitimateAscendant` (grandparents) only | I15 → `STATE` | 1 | equal | no |
| `LegitimatedChild` only | I1 | 1 | equal | no |
| heir donee, ratio 0.1 | I1 | 2 | equal | no |
| heir donee, ratio **exactly 1.0** | I1 | 2 | equal | no |
| `AdoptedChild` + 2 `LegitimateChild`, `adoption` object populated | I1 | 3 | equal | no |

The grandparents-only row is worth flagging: it is the Phase 7 / LAW-01 defect (the estate escheats
to the State while grandparents live) and it **passes every invariant that exists today**. That is
precisely the class of silent wrongness this project exists to make loud. It is safe to add to the
asserting corpus now, and Phase 7 will change its expected output.

**Group B — shapes that VIOLATE sum conservation today (must NOT go into the asserting corpus):**

| # | Shape | Observed | Governing requirement |
|---|---|---|---|
| B1 | 1 full-blood living sibling + 1 half-blood predeceased sibling with 2 nephews, **nephews carry `blood_type: "Half"`**, E = ₱6,000,000 | **5 rows, both nephews duplicated**, Σ = **480,000,000** centavos vs estate 600,000,000 | **LAW-02** (Phase 7) |
| B2 | 2 legitimate children, donation to `lc1` at ratio 1.5 | Σ = **125,000,000** vs estate 100,000,000 | **LAW-06** (Phase 14, blocked on **LAWYER-06**) |
| B3 | 2 legitimate children, donation to a **stranger** at ratio **0.1** | Σ = **110,000,000** vs estate 100,000,000 | **LAW-06** (Phase 14, blocked on **LAWYER-06**) |

Full per-heir output for B1, taken from `run_pipeline` directly (the checked entry point rejects it):

```
id=sib1  cat=CollateralGroup by=OwnRight nfe=240000000 total=240000000
id=n1    cat=CollateralGroup by=OwnRight nfe=60000000  total=60000000
id=n2    cat=CollateralGroup by=OwnRight nfe=60000000  total=60000000
id=n1    cat=CollateralGroup by=OwnRight nfe=60000000  total=60000000     <-- duplicate
id=n2    cat=CollateralGroup by=OwnRight nfe=60000000  total=60000000     <-- duplicate
ROWS=5 SUM=480000000 ESTATE=600000000
```

`.planning/research/LEGAL-CONFORMANCE.md` predicts exactly this: *"1 living full-blood sibling +
1 predeceased half-blood sibling with 2 children, E=₱6M → 5 rows, every heir duplicated,
Σ = ₱4,800,000 against a ₱6,000,000 estate."* The measurement matches to the centavo. The
**trigger is `blood_type` on the nephew rows** — the identical family with `blood_type: null` on
the nephews conserves the estate and produces 3 clean rows.

B2 and B3 reproduce `LEGAL-CONFORMANCE.md:45`: *"₱10M estate, 1 child, ₱20M stranger donation →
Ana ₱30,000,000, three times the entire estate."*

`engine/src/step4_estate_base.rs:82` branches on `donation.recipient_is_stranger`, so the field is
read; the stranger donation is added to the collation base and then fully distributed to the heirs.

**No new point of Philippine law arises from any of this.** Requirement **LAW-06** already states
the rule in the project's own words — *"A donation inter vivos never causes distributed shares to
exceed the estate"* — and **LAW-02** already states *"Collateral succession through predeceased
siblings produces no duplicate heirs and conserves the estate."* Phase 6 records that these
defects reproduce; it decides nothing.

### 2.5 The design this forces

COV-01 says the generator's corpus must *include* these shapes. It does not say every generated
case must satisfy the invariant test. Two corpora, both executed on every `cargo test`:

- **`engine/examples/coverage-cases/`** — Group A shapes. Read by the invariant tests alongside
  `fuzz-cases/`. Must stay green.
- **`engine/examples/defect-cases/`** — Group B shapes, exactly three, hand-written so they are
  stable and reviewable. Read by a **known-violation ledger test** driven by a shrink-only
  `engine/defect-baseline.json` that names, per case, precisely which invariants it violates and
  the observed numbers.

The ledger test is bidirectional and therefore strictly stronger than omitting the cases:
- a defect case that violates a **new** invariant → RED (the defect got worse);
- a defect case that **stops** violating a ledgered invariant → RED with `STALE DEFECT
  DECLARATION` until the entry is deleted (the ledger is forced down when Phase 7 or Phase 14
  lands the fix).

This is the same shape as the three ledgers the project already runs — `frontend/test-baseline.json`
(shrink-only), `gate-skips.lock` (shrink-only), `gates.manifest.lock` (grow-only).

### 2.6 One input-shape trap the generator must avoid

An `AdoptedChild` whose `adoption` field is `null` receives **₱0** while its legitimate siblings
split the estate, with no warning:

```
lc1 LegitimateChildGroup 450000000
lc2 LegitimateChildGroup 450000000
ac1 LegitimateChildGroup 0            <-- adoption: null
```

With the `adoption` object populated as in `engine/examples/cases/17-adopted-child.json`, the
adopted child receives an equal share (₱3,000,000 each on a ₱6,000,000 estate) and one warning is
emitted. **The Phase 6 generator must populate `adoption`**, copying the field shape from
`17-adopted-child.json` verbatim. This is an input-completeness fact, not a legal reading.

---

## 3. COV-02 — named invariants

### 3.1 Current state

`engine/tests/fuzz_invariants.rs` is **one** `#[test] fn test_fuzz_invariants()` (line 19) that
loops all 100 fuzz cases and evaluates ten invariants plus two safety checks inline. Its failure
messages **already carry invariant names** — `INV1 sum_conservation`, `INV2 legitime_floor`,
`INV3 ic_lc_ratio`, `INV4 ic_cap`, `INV5 representation_sum`, `INV6 adoption_equality`,
`INV7 preterition_annulment`, `INV8 disinheritance`, `INV10 scenario_consistency`,
`SAFETY single_share_cap`, `SAFETY no_negative_nfe`.

So COV-02 is not "add names". The three real gaps, read from the source:

1. **All twelve checks are one test.** A break in INV3 and a break in INV7 are the same cargo test
   failure. Cargo's own output cannot say which invariant broke.
2. **Three invariants are degenerate, and the file says so in its own comments.**
   - `INV9 collation` (line 203-206) is **a comment and nothing else** — *"Already checked in INV1;
     this is a conceptual duplicate."* It evaluates zero assertions.
   - `INV6 adoption_equality` (line 146-158) does not check adoption at all; its body is
     `net_from_estate >= 0`, byte-identical in effect to `SAFETY no_negative_nfe` at line 243.
   - `INV5 representation_sum` (line 122-144) checks only that a representation group's sum is
     non-negative.
   - `INV3` and `INV4` are gated on `Testate | Mixed` only.
3. **No invariant carries a stable machine-readable id.** The strings are free text inside a
   `format!`.

### 3.2 Strengthenings measured to hold on the existing 140-case corpus

Each was evaluated over all 140 inputs / 564 heir rows before being proposed. **Violations found:**

| Candidate invariant | Violations |
|---|---|
| `INV3` extended from testate-only to **all** succession types (`max(IC total) <= min(LC total)` where both are nonzero) | **0** |
| `INV5a` — `represents.is_some()` ⟹ `inherits_by == Representation` | **0** |
| `INV5b` — `inherits_by == Representation` ⟹ `represents.is_some()` | **0** |
| `INV9` (real form) — per row, `gross_entitlement == net_from_estate + donations_imputed` | **0** |
| `INV11` — per row, `gross_entitlement >= net_from_estate` | **0** |
| `INV12` — per row, `donations_imputed >= 0` | **0** |
| `INV13` — `heir_id` values unique within `per_heir_shares` | **0** |
| `INV14` — every row has a non-empty `legitime_fraction` | **0** |
| naive "all own-right legitimate-child totals are equal" | **37** — REJECTED, breaks legitimately on disinheritance (0-shares) and representation |
| `INV6` guarded adoption equality (adopted vs legitimate, both own-right, both nonzero, no donations imputed) | **0**, but **vacuous today**: `AdoptedChildGroup` never appears in output because adoption equality is implemented by mapping an adopted child into `LegitimateChildGroup`. Becomes non-vacuous only once the coverage corpus adds adopted children, and the correct assertion is on the *mapping* plus equal totals. |

`INV13` and `INV14` restate at corpus scale what Phase 5 already enforces at runtime
(`output_check.rs`) and in `engine/tests/observability.rs`. Including them as named property
invariants is deliberate: it is the difference between "the checked entry point rejects it" and
"the property suite says which invariant broke".

### 3.3 The design COV-02 forces

`engine/tests/fuzz_invariants.rs` becomes a table of named invariants — `(id, name, fn(&EngineInput,
&EngineOutput) -> Vec<String>)` — with **one `#[test]` per invariant**, each iterating the whole
corpus (`fuzz-cases/` + `coverage-cases/`) and reporting only its own invariant. A violation is
then identified by cargo itself (`test test_inv03_ic_le_lc ... FAILED`) *and* by a message naming
the invariant id, the case file, and expected-vs-actual.

`test_fuzz_invariants` is **not deleted**; it is kept as a whole-corpus roll-up that runs every
invariant so a case failing several is still reported once, in full. Splitting into per-invariant
tests adds tests; it removes none.

---

## 4. COV-03 — exact scenario codes and exact centavos

### 4.1 The gap, measured

`engine/tests/integration.rs` has 35 `#[test]` functions, 23 of them the TV legal vectors.

| Helper | Call sites (1 = definition only) |
|---|---|
| `check_sum_invariant` | 24 → called by all 23 TV tests |
| `assert_total_pesos` | 41 |
| `assert_net_from_estate_pesos` | 8 |
| **`check_scenario_consistency`** | **1 — never called** |
| **`check_adoption_equality`** | **1 — never called** |
| `find_share_by_name` | 1 — never called |

`grep -n "starts_with" engine/tests/integration.rs` returns **nothing**, and no TV test contains a
peso inequality. So COV-03's "never a prefix or a range" is not describing a loose *assertion* that
must be tightened — it is describing an assertion that is **absent**. **0 of 23** legal vectors
assert a scenario code; several assert amounts for only some of their heirs (TV-08 asserts 0 of 7
rows, TV-18 asserts 0 of 1).

The only prefix logic in the tree is `INV10` inside `fuzz_invariants.rs:216-224`, which is
deliberately a *prefix* check because it runs over generated cases whose exact code is not known in
advance. That one stays a prefix check; COV-03 governs the **legal test vectors**, which do have a
known expected code.

### 4.2 The authority, and the engine's agreement with it

`specs/inheritance-engine-spec.md:2371-2393` is a table of all 23 vectors with the expected
scenario code. §14.3, §14.4 and §14.5 give full per-heir amounts for TV-13, TV-14 and TV-22.

The engine's actual scenario code for every vector was measured by instrumenting a **scratch copy**
of the engine (the repo was not modified) and running `cargo test --test integration --
--test-threads=1 --nocapture`.

| TV | Spec label | Engine `scenario_code` | Engine `succession_type` | Verdict |
|---|---|---|---|---|
| 01 | I1 | `I1` | Intestate | exact |
| 02 | I2 | `I2` | Intestate | exact |
| 03 | I3 | `I3` | Intestate | exact |
| 04 | I11 | `I11` | Intestate | exact |
| 05 | I6 | `I6` | Intestate | exact |
| 06 | T1 | `T1` | Testate | exact |
| 07 | `T3→I2` | `T3` | **IntestateByPreterition** | notation: the arrow means "T3 detected, annulled into an I2 distribution". `fuzz_invariants.rs:208-212` documents the same thing. Assert `T3` **and** `IntestateByPreterition`. |
| 08 | T3 | `T3` | Testate | exact |
| 09 | T3 | `T3` | Testate | exact |
| 10 | I2 | `I2` | Intestate | exact |
| 11 | T5b | `T5b` | Testate | exact |
| 12 | T2 | `T2` | Testate | exact |
| 13 | T5a | `T5a` | Testate | exact |
| 14 | `MIXED` | `T3` | **Mixed** | notation: `MIXED` is the *succession type*, not a `ScenarioCode` variant; the spec's own §14.4 says "Scenario T3, detected as MIXED". Assert `T3` **and** `Mixed`. |
| 15 | I13 | `I13` | Intestate | exact |
| 16 | `T12-AM` | `T12` | Testate | notation: `-AM` is the spec's articulo-mortis annotation; `T12` is the enum variant. |
| 17 | I7 | `I7` | Intestate | exact |
| 18 | I15 | `I15` | Intestate | exact |
| 19 | `I2→I5` | `I5` | Intestate | notation: the arrow is the restart; `I5` is the final code. `integration.rs` names the test `..._restart`. |
| 20 | `I-ID` | `I5` | Intestate | **`I-ID` is not a `ScenarioCode` variant** (`engine/src/types.rs:249-283` lists T1–T15 and I1–I15 only). `I5` is the measured value. This row is governed by **LAWYER-04** / **LAW-07** and must be asserted as a characterization with that citation. |
| 21 | T1 | `T1` | **Mixed** | code exact; type is `Mixed`, not `Testate`. |
| 22 | I1 | `I1` | Intestate | exact |
| 23 | I5 | `I5` | Intestate | exact |

**19 of 23 are literal matches. The other four are notation reconciliations, all resolved above
from the spec's own prose. No entry required a legal judgment, and none is left open.**

### 4.3 The complete measured per-heir table

`total.centavos` for every row of every vector, measured. This is the table the plan hands to the
executor so no value has to be derived.

| TV | code / type | rows | per-heir `total.centavos` |
|---|---|---|---|
| 01 | I1 / Intestate | 1 | `lc1`=500000000 |
| 02 | I2 / Intestate | 4 | `lc1`=`lc2`=`lc3`=`sp`=300000000 |
| 03 | I3 / Intestate | 3 | `lc1`=400000000, `lc2`=400000000, `ic1`=200000000 |
| 04 | I11 / Intestate | 1 | `sp`=800000000 |
| 05 | I6 / Intestate | 3 | `f`=250000000, `m`=250000000, `sp`=500000000 |
| 06 | T1 / Testate | 3 | `lc1`=250000000, `lc2`=250000000, `Charity C`=500000000 |
| 07 | T3 / IntestateByPreterition | 4 | `lc1`=`lc2`=`lc3`=`sp`=300000000 |
| 08 | T3 / Testate | 7 | `lc1`=266666667, `lc2`=266666667, `lc3`=0, `gc1`=133333333, `gc2`=133333333, `sp`=266666667, `Friend F`=533333333 |
| 09 | T3 / Testate | 5 | `lc1`=250000000, `lc2`=250000000, `ac1`=250000000, `sp`=250000000, `University U`=500000000 |
| 10 | I2 / Intestate | 7 | `lc1`=500000000, `lc2`=0, `gc1`=166666667, `gc2`=166666667, `gc3`=166666666, `lc3`=500000000, `sp`=500000000 |
| 11 | T5b / Testate | 5 | `lc1`=500000000, `lc2`=500000000, `sp`=500000000, `ic1`=250000000, `Friend G`=250000000 |
| 12 | T2 / Testate | 3 | `lc1`=500000000, `sp`=250000000, `Friend H`=250000000 |
| 13 | T5a / Testate | 5 | `lc1`=1000000000, `sp`=500000000, `ic1`=166666667, `ic2`=166666667, `ic3`=166666666 |
| 14 | T3 / Mixed | 4 | `lc1`=300000000, `lc2`=300000000, `sp`=300000000, `Charity A`=100000000 |
| 15 | I13 / Intestate | 3 | `sib1`=400000000, `sib2`=400000000, `sib3`=200000000 |
| 16 | T12 / Testate | 2 | `sp`=300000000, `Nephew N`=600000000 |
| 17 | I7 / Intestate | 3 | `ic1`=`ic2`=`ic3`=200000000 |
| 18 | I15 / Intestate | 1 | `STATE`=500000000 |
| 19 | I5 / Intestate | 4 | `f`=600000000, `m`=600000000, `lc1`=0, `lc2`=0 |
| 20 | I5 / Intestate | 1 | `f`=800000000 |
| 21 | T1 / Mixed | 2 | `lc1`=500000000, `lc2`=500000000 |
| 22 | I1 / Intestate | 4 | `lc1`=600000000, `lc2`=300000000, `gc1`=300000000, `gc2`=300000000 |
| 23 | I5 / Intestate | 2 | `f`=400000000, `m`=400000000 |

Cross-checks performed against the spec's stated amounts, all agreeing:

- TV-02 ₱3M each ✓ · TV-03 ₱4M/₱4M/₱2M ✓ · TV-05 ₱5M spouse, ₱2.5M each parent ✓ ·
  TV-06 ₱2.5M each, charity ₱5M ✓ · TV-07 ₱3M each ✓ · TV-15 ₱4M/₱4M/₱2M ✓ · TV-23 ₱4M each ✓
- TV-13 §14.3: Bianca ₱10M ✓, Fiona ₱5M ✓. The spec displays **₱1,666,666.67 for all three ICs**,
  which sums to ₱5,000,000.01. The engine emits `166666667, 166666667, 166666666`, summing to
  exactly ₱5,000,000 — the largest-remainder centavo distribution `step10_finalize.rs` implements.
  **The engine is right and conservation requires it**; the spec figure is a rounded display. The
  assertion must use the three centavo values, not the repeated peso figure.
- TV-14 §14.4: ₱3M/₱3M/₱3M/₱1M ✓ exact.
- TV-22 §14.5 entitlements ₱6M / ₱3M / ₱3M ✓; the engine emits a fourth row for the predeceased
  donee `lc2` carrying the ₱3M imputed donation.

Because `assert_total_pesos` takes whole pesos and multiplies by 100, it cannot express
166666666 or 166666667 centavos. COV-03 therefore requires a new helper
`assert_total_centavos(share, expected_centavos, label)`. Adding a helper that can express a value
the old one could not is a strengthening, not a weakening; `assert_total_pesos` is left in place.

### 4.4 Classification demanded by the phase constraints

- **TIGHTENABLE-FROM-SOURCE: 23 of 23 scenario codes** (spec table + the four notation
  reconciliations in §4.2) and **all per-heir amounts** (spec §14 where stated, otherwise the
  measured engine value pinned as a characterization).
- **REQUIRES-A-LEGAL-DECISION: 0.** Nothing in COV-03 requires anyone to choose a reading. The
  spec table is a recorded expectation, not a live question, and the engine already agrees with it.

Two rows are nevertheless governed by open lawyer questions and must carry a citation in the
assertion comment so a future reader does not mistake a characterization lock for a settled answer:

| TV | Governing decision | `.planning/lawyer-decisions.json` status |
|---|---|---|
| TV-15 collateral siblings, Art. 1006 full/half-blood ratio | **LAWYER-03** | `awaiting-answer` |
| TV-20 iron curtain, Art. 992 | **LAWYER-04** (blocks LAW-07) | `awaiting-answer` |

Nothing is added to `.planning/LAWYER-AGENDA.md` by this phase: both questions are already
recorded there, and Phase 6 only cites them.

---

## 5. COV-04 — per-module coverage

### 5.1 What is available, measured

| Tool | Probe | Result |
|---|---|---|
| `cargo llvm-cov` | `cargo llvm-cov --version` | `error: no such command` |
| `cargo tarpaulin` | `cargo tarpaulin --version` | `error: no such command` |
| `grcov` | not present | — |
| rustup component `llvm-tools-preview` | `rustup component list --installed` | absent before this pass |
| network | `rustup component add llvm-tools-preview` | **succeeded**, exit 0 |

After installing the component, `$(rustc --print sysroot)/lib/rustlib/x86_64-unknown-linux-gnu/bin`
contains `llvm-profdata`, `llvm-cov`, `llvm-ar`, `llvm-nm` and others. Toolchain is stable 1.96.0.

**No crate is added to `engine/Cargo.toml`, no npm package is added, and `Cargo.lock` is not
touched.** The only new dependency is a rustup component, which CI installs by adding
`components: llvm-tools-preview` to the existing `dtolnay/rust-toolchain@stable` step in
`.github/workflows/inheritance-ci.yml`.

### 5.2 The pipeline, run end to end

```bash
RUSTFLAGS="-C instrument-coverage" \
LLVM_PROFILE_FILE="<dir>/cov-%p-%m.profraw" \
CARGO_TARGET_DIR="<dir>/cov-target" \
  cargo test --tests                                   # 36 .profraw files produced

"$LLVM_BIN/llvm-profdata" merge -sparse <dir>/*.profraw -o cov.profdata
"$LLVM_BIN/llvm-cov" report  $OBJECTS -instr-profile=cov.profdata ...
"$LLVM_BIN/llvm-cov" export  $OBJECTS -instr-profile=cov.profdata -format=text > cov.json
```

`report` produced this per-module table (Regions / Missed Regions / Cover):

```
src/flags.rs              538     3   99.44%
src/fraction.rs           492    25   94.92%
src/main.rs                54    54    0.00%
src/output_check.rs       200     9   95.50%
src/pipeline.rs           516   221   57.17%
src/step10_finalize.rs   1537    23   98.50%
src/step1_classify.rs     944     7   99.26%
src/step2_lines.rs       1117    17   98.48%
src/step3_scenario.rs     651     1   99.85%
src/step4_estate_base.rs 1138     9   99.21%
src/step5_legitimes.rs   1877     3   99.84%
src/step6_validation.rs  1936    23   98.81%
src/step7_distribute.rs  3015   114   96.22%
src/step8_collation.rs   1431    17   98.81%
src/step9_vacancy.rs     1808   184   89.82%
src/types.rs               49    28   42.86%
src/wasm.rs                52    52    0.00%
TOTAL                   20427   952   95.34%
```

`export -format=text` emits JSON carrying, per file, `summary.regions.{count,notcovered}`,
`summary.functions.{count,covered}` and a `functions` array with per-function region counts —
enough to list, by name, every function in every engine module that no test enters.

### 5.3 Two facts the plan must encode

1. **The `Branches` column is empty (`-`) on stable.** Rust's stable coverage instrumentation is
   *region*-based; MC/DC branch counters need a nightly `-Zcoverage-options=branch`. **"Which
   branches no test exercises" is therefore implemented as "which coverage regions and which
   functions no test enters"**, which is the finer granularity of the two and is what
   `llvm-cov` calls a region. This reading is fixed here so the executor never has to choose it.
2. **Two engine modules are at exactly 0.00 %:** `src/main.rs` (the CLI) and `src/wasm.rs` (the
   `#[wasm_bindgen]` boundary, unreachable from a native test). These are the initial and only
   contents of the shrink-only ledger described below.

### 5.4 Gate shape — no arbitrary number anywhere

COV-04's text is *"A coverage report shows, per engine module, which branches no test exercises."*
It does not ask for a threshold, and choosing a percentage would be exactly the ungrounded decision
this project forbids. The gate therefore asserts three things, none of which is a chosen number:

1. The report **can be produced** — instrumentation runs, profiles merge, export parses. Otherwise
   `COVERAGE REPORT UNAVAILABLE`.
2. **Every `.rs` file under `engine/src/` appears in the report.** A module silently absent from a
   coverage report is the failure mode a coverage report exists to prevent. Otherwise
   `MODULE ABSENT FROM REPORT`.
3. The set of modules at **exactly zero** region coverage is a subset of `coverage-zero.lock`, and
   every ledger entry is still observed at zero. A new zero-coverage module → `UNDECLARED ZERO
   COVERAGE`. A ledger entry that has gained coverage → `STALE ZERO COVERAGE DECLARATION`, forcing
   the ledger down. Ledger opens with exactly `src/main.rs` and `src/wasm.rs`.

The human-readable artifact is `engine/COVERAGE.md`, regenerated by the same script and committed
once by this phase. The gate reads a **freshly generated** report from `.gate-runs/`, never the
committed markdown, so the gate cannot be satisfied by editing a document.

Tool availability is expressed as the gate's manifest `precondition`, so a missing
`llvm-profdata` produces the runner's `cannot-run` **exit 2 halt** rather than a gate failure —
matching the exit contract in `scripts/ci-gates.sh`, where a missing tool is information about the
environment and never about the product.

### 5.5 Frontend coverage is out of scope, measured

`grep -c "coverage-v8" frontend/package-lock.json` → **0**.
`grep -c "vitest/coverage-istanbul" frontend/package-lock.json` → **0**.
`ls frontend/node_modules/@vitest/` → `expect mocker pretty-format runner snapshot spy utils` — no
coverage provider. Enabling frontend coverage requires adding a dependency and regenerating
`package-lock.json`. COV-04 says *"per engine module"*; the engine is the Rust crate. Frontend
coverage is therefore explicitly out of scope for COV-04 and is not planned.

---

## 6. COV-05 — assertion discipline

### 6.1 Frontend, measured

A brace-matched body scanner was written and run over `frontend/src` (112 `*.test.ts(x)` files,
**2383** `it`/`test` blocks located; the suite reports 2416 tests because `it.each` expands at
runtime).

- **Zero-assertion blocks: 0.**
- **Weak-only blocks (every matcher in the body is `toBeDefined` or `toBeTruthy`): 15.**

### 6.2 The complete list of 15

| # | File | Line | Test name | Matchers |
|---|---|---|---|---|
| 1 | `src/__tests__/dashboard.test.tsx` | 150 | `"Sign in to Save" text concept exists for unauthenticated results` | toBeTruthy |
| 2 | `src/__tests__/router.test.tsx` | 217 | `renders the shared case page at /share/:token` | toBeTruthy |
| 3 | `src/__tests__/smoke.test.tsx` | 12 | `React is importable and functional` | toBeDefined |
| 4 | `src/components/case/__tests__/timeline-report.test.tsx` | 311 | `stage has estimatedDate for non-complete stages` | toBeTruthy |
| 5 | `src/components/case/__tests__/timeline-report.test.tsx` | 655 | `renders without auth (no auth-dependent props)` | toBeTruthy |
| 6 | `src/components/shared/__tests__/DateInput.test.tsx` | 112 | `renders with maxDate attribute when provided` | toBeTruthy |
| 7 | `src/components/shared/__tests__/DateInput.test.tsx` | 119 | `renders with minDate attribute when provided` | toBeTruthy |
| 8 | `src/components/shared/__tests__/MoneyInput.test.tsx` | 237 | `rejects non-numeric input` | toBeTruthy |
| 9 | `src/data/__tests__/document-templates.test.ts` | 36 | `every template has required fields` | toBeTruthy |
| 10 | `src/lib/__tests__/comparison.test.ts` | 452 | `throws on Supabase error` | toBeDefined |
| 11 | `src/lib/__tests__/tax-bridge.test.ts` | 371 | `throws on Supabase error` | toBeDefined |
| 12 | `src/lib/estate-tax-engine/__tests__/advisor.test.ts` | 128 | `death before 2022-06-01, amnesty not elected → suggestion produced` | toBeDefined |
| 13 | `src/wasm/__tests__/wasm-real.test.ts` | 381 | `handles negative estate centavos without crashing` | toBeDefined, toBeTruthy |
| 14 | `src/wasm/__tests__/wasm-real.test.ts` | 393 | `handles duplicate person IDs without crashing` | toBeDefined |
| 15 | `src/wasm/__tests__/wasm-real.test.ts` | 404 | `handles multiple SurvivingSpouse without crashing` | toBeDefined |

Every one was opened and read; **all 15 are true positives**, confirmed by eye. Entries 13 and 14
are two of the five tests currently making gate G3 red for Phase 5's OBS-05/OBS-06 blocker.

### 6.3 Consequence for the gate, and the resolution

A COV-05 gate is **red on day one** with 15 offenders. Neither permitted response is to weaken
anything:

- Rewriting all 15 requires, per test, deciding what the stronger assertion should be. Several are
  genuine product questions (what *should* `MoneyInput` do with `"abc"`?), and three sit on top of
  Phase 5's unresolved product decision. Fifteen judgment calls handed to a cheap executor is
  exactly the failure mode this project is built to prevent.
- Ledgering them, in a **shrink-only** `assertion-baseline.json` keyed by
  `file` + `fullName` (never by line number — line numbers move), makes the gate fail on any
  **16th** weak-only test and on any ledger entry that no longer matches a real test. It is the
  identical mechanism, key shape and prohibition language as `frontend/test-baseline.json`, which
  the project already runs and which Phase 1 chose for the same reason.

The ledger is the plan. Entries 13–15 additionally carry a note pointing at Phase 5's blocker so
whoever resolves that decision also clears three ledger rows.

### 6.4 Detector accuracy — measured, because a naive one is not good enough

A first scanner regex mis-parsed matchers inside nested `expect(...)` arguments. A second scanner
using brace-matched bodies plus `/\.\s*(to[A-Z]\w*)\s*\(/g` over the body produced the same 15 with
zero disagreement, and each was verified by reading the source. **The plan specifies the second
technique literally**, plus committed fixtures that force each verdict.

Node-only, `node:` builtins only, no dependency — consistent with every other check in `scripts/`.

### 6.5 Rust side

479 `#[test]` functions across `engine/src/*.rs` and `engine/tests/*.rs`. A scan for
`assert!`/`assert_eq!`/`assert_ne!`/`panic!`/`#[should_panic]` flags **2**:
`test_tv20_iron_curtain` and `test_tv21_fideicommissary`. Both were read: each asserts through the
helper `assert_total_pesos(...)`, which contains `assert_eq!` internally. **Adjusting the detector
to also accept a call to a `assert_*`-named helper yields 0.** Rust is therefore already clean;
COV-05's `toBeDefined`/`toBeTruthy` wording is Vitest-specific and the gate is scoped to
`frontend/src`. Plan 06-03 nonetheless raises TV-20 and TV-21 from 1 and 2 assertions to full
per-row coverage as part of COV-03.

---

## 7. Validation Architecture

Per requirement: the exact command, the exact expected output, whether it can be a blocking gate
today, and the measured baseline before any Phase 6 work.

### COV-01 — generator reaches the missing shapes

| | |
|---|---|
| **Command** | `cd apps/inheritance/engine && python3 examples/generate-coverage-cases.py && ls examples/coverage-cases/*.json \| wc -l && grep -l NephewNiece examples/coverage-cases/*.json \| wc -l && grep -l '"recipient_is_stranger": true' examples/defect-cases/*.json \| wc -l && python3 examples/report-corpus-shapes.py` |
| **Expected** | 30 coverage cases; ≥ 8 containing `NephewNiece`; ≥ 1 defect case with a stranger donee; `report-corpus-shapes.py` prints a max donation/estate ratio ≥ 1.5 over `defect-cases/` and lists all 11 `Relationship` variants as present across `fuzz-cases/ + coverage-cases/ + defect-cases/` |
| **Blocking gate today?** | Yes — indirectly, via `G1` (`cd engine && cargo test`), because the new corpora are read by `engine/tests/fuzz_invariants.rs` and `engine/tests/defect_ledger.rs`. No new gate id is needed for COV-01. |
| **Measured baseline** | 100 fuzz cases; `NephewNiece` in 0 files; `recipient_is_stranger: true` in 0 files; max ratio 0.5524; 5 of 11 `Relationship` variants entirely absent |

### COV-02 — a violation says which invariant broke

| | |
|---|---|
| **Command** | `cd apps/inheritance/engine && cargo test --test fuzz_invariants 2>&1 \| tail -5` |
| **Expected** | `test result: ok. 15 passed; 0 failed` — one test per named invariant (`test_inv01_sum_conservation` … `test_inv14_legitime_fraction_present`, plus the roll-up `test_fuzz_invariants`) |
| **Blocking gate today?** | Yes, under existing gate `G1`. |
| **Measured baseline** | `cargo test --test fuzz_invariants` runs exactly **1** test; INV9 evaluates nothing; INV6 duplicates a safety check |

### COV-03 — every legal vector asserts exact code and exact centavos

| | |
|---|---|
| **Command** | `cd apps/inheritance/engine && cargo test --test integration 2>&1 \| tail -3 && grep -c "check_scenario_consistency(&output" tests/integration.rs && grep -c "assert_total_centavos(" tests/integration.rs` |
| **Expected** | integration suite passes with `0 failed`; `check_scenario_consistency(&output` appears **23** times; `assert_total_centavos(` appears at least **74** times (one per row in §4.3, plus the helper definition) |
| **Blocking gate today?** | Yes, under existing gate `G1`. |
| **Measured baseline** | 30 integration tests pass; `check_scenario_consistency` called **0** times; `assert_total_centavos` does not exist; 2 vectors assert no peso amount at all |

### COV-04 — per-module coverage report

| | |
|---|---|
| **Command** | `cd apps/inheritance && bash scripts/coverage-report.sh && node scripts/check-coverage.mjs` |
| **Expected** | `coverage-report.sh` exits 0 and writes `.gate-runs/coverage/summary.json` + `engine/COVERAGE.md`; `check-coverage.mjs` prints `COVERAGE OK — 17 engine modules, 2 at zero coverage, all declared` then `GATE-SKIPS total=17 skipped=0`, exit 0 |
| **Blocking gate today?** | Yes, as new gate `G12` at `order: 4`, ahead of `G1`, with `precondition` asserting `llvm-profdata` exists in the rustc sysroot so a missing toolchain halts with exit 2 rather than failing. |
| **Measured baseline** | Neither script exists. Coverage measured by hand this pass: 17 engine modules, 20427 regions, 952 uncovered, `src/main.rs` and `src/wasm.rs` at 0.00 % |

### COV-05 — no test asserts nothing or only `toBeDefined`/`toBeTruthy`

| | |
|---|---|
| **Command** | `cd apps/inheritance && node scripts/check-assertion-discipline.mjs` |
| **Expected** | `ASSERTION DISCIPLINE OK — 112 files, 2383 blocks, 0 assertion-free, 15 weak-only all declared` then `GATE-SKIPS total=2383 skipped=0`, exit 0. Exit 1 with `ASSERTION-FREE TEST`, `UNDECLARED WEAK ASSERTION` or `STALE WEAK DECLARATION` otherwise. |
| **Blocking gate today?** | Yes, as new gate `G13` at `order: 5`, ahead of `G1`. It is a static source scan, so it does not depend on the frontend suite and is unaffected by Phase 5's G3 blocker. |
| **Measured baseline** | Script does not exist. Scanner run by hand this pass: 112 files, 2383 blocks, **0** assertion-free, **15** weak-only (all listed in §6.2) |

---

## 8. File contention and wave assignment

| Plan | Files it writes |
|---|---|
| 06-01 | `engine/examples/generate-coverage-cases.py`, `engine/examples/report-corpus-shapes.py`, `engine/examples/coverage-cases/*.json`, `engine/examples/defect-cases/*.json`, `engine/defect-baseline.json` |
| 06-02 | `engine/tests/fuzz_invariants.rs`, `engine/tests/defect_ledger.rs` |
| 06-03 | `engine/tests/integration.rs` |
| 06-04 | `scripts/coverage-report.sh`, `scripts/check-coverage.mjs`, `coverage-zero.lock`, `engine/COVERAGE.md`, `scripts/fixtures/*`, `gates.manifest.json`, `gates.manifest.lock`, `GATES.md`, `.github/workflows/inheritance-ci.yml`, `README.md`, `.gitignore` |
| 06-05 | `scripts/check-assertion-discipline.mjs`, `assertion-baseline.json`, `scripts/fixtures/*`, `gates.manifest.json`, `gates.manifest.lock`, `GATES.md`, `README.md` |

- 06-01 and 06-03 share nothing → **wave 1**, parallel.
- 06-02 reads the corpora 06-01 creates → **wave 2**.
- 06-04 measures coverage of the test set 06-02 and 06-03 produce → **wave 3**.
- 06-05 edits the same four gate-infrastructure files as 06-04 → **wave 4**, strictly after.

---

## 9. Things this phase deliberately does NOT do

1. **It does not touch Phase 5's five failing tests, `frontend/test-baseline.json`, or
   `gate-skips.lock`.** The Phase 5 blocker is untouched and unhidden. Both new gates are ordered
   ahead of `G3` so Phase 6's own verification is independent of it — see §1.1.
2. **It does not fix LAW-02 or LAW-06.** It makes both reproduce inside `cargo test`, with the
   exact violated invariant and the exact numbers recorded in a ledger that must shrink when
   Phases 7 and 14 land the fixes.
3. **It does not add a coverage percentage threshold**, because no number in the requirement or the
   repo grounds one.
4. **It does not enable frontend coverage**, which would require a new npm dependency; COV-04 is
   scoped to the engine by its own wording.
5. **It decides no point of Philippine law and adds nothing to `.planning/LAWYER-AGENDA.md`.**
   Two assertions cite already-recorded questions (LAWYER-03 on TV-15, LAWYER-04 on TV-20); citing
   is not deciding.

## 10. Anything not measured

- The GitHub Actions runner's behaviour with `components: llvm-tools-preview` was **not** observed,
  because 25+ commits in this repository are unpushed and the workflow has never executed. The
  component installs locally and the action documents the input. Labelled `UNMEASURED` and carried
  as a risk in plan 06-04.
- The wall-clock cost of the instrumented `cargo test` inside CI is `UNMEASURED`; locally the
  instrumented build plus merge plus report completed well inside the workflow's 30-minute
  `timeout-minutes`.
