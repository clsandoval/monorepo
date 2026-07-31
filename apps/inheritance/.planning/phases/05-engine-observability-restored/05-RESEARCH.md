# Phase 5 — Research: Engine Observability Restored

**Date:** 2026-07-31
**Requirements:** OBS-01 … OBS-09
**Measured in this tree, not assumed.** Every number below was produced by running a command in
`/home/clsandoval/cs/monorepo/apps/inheritance` during this planning pass. Line numbers were
re-measured after Phase 4 plan 04-03 inserted comment lines into seven `engine/src/*.rs` files.

---

## 0. Measured baseline

A debug CLI binary was built (`cargo build --bin inheritance-engine`) and run over every committed
input in the repository — 20 files in `engine/examples/cases/`, 100 in `engine/examples/fuzz-cases/`
and 20 in `engine/examples/testate-cases/`, 140 cases in total, all of which exit 0.

| Observation | Measured value |
|---|---|
| Per-heir rows produced across the 140 cases | 564 |
| Rows with nonzero `from_legitime` | **0** |
| Rows with nonzero `from_free_portion` | **0** |
| Rows with nonzero `from_intestate` | **0** |
| Rows with a nonempty `legitime_fraction` | **0** |
| Cases producing a nonempty `warnings` array | **0** |
| Distinct `computation_log.steps` lengths observed | **{1}** — every case, always exactly one entry |
| Cases producing a duplicate `heir_id` in `per_heir_shares` | **0** |
| Cases producing an empty `per_heir_shares` with a nonzero estate | **0** |

The last two rows are the load-bearing measurements for OBS-05 and OBS-06: both runtime checks this
phase introduces already hold across the entire committed corpus, so promoting them from
test-time to runtime cannot turn a currently-green suite red.

`engine/tests/fuzz_invariants.rs:65-72` already asserts the identical sum-conservation predicate
(`sum(net_from_estate) == net_distributable_estate`) over all 100 fuzz cases and passes today. OBS-05
is therefore not a new invariant — it is an existing, already-true invariant moved from a test
assertion into the code path that produces the value.

Toolchain state at the start of this phase (from the preflight baseline): `cargo test` 442 passed /
0 failed across 5 binaries; `npx tsc -b --force` zero output; `cd frontend && npm run test:gate`
green against a 46-entry known-failure ledger with a `min_total_tests` floor of 2416.

---

## 1. Where the observability was switched off

### 1.1 `warnings` (OBS-01)

`engine/src/step10_finalize.rs:619` is `warnings: vec![],` inside the returned `EngineOutput`.

That single line is only half the defect. The other half is structural: **`Step10Input` has no
`warnings` field at all** (`engine/src/step10_finalize.rs:89-120`). Seven of the ten steps build
`ManualFlag` values and expose them on their own `StepNOutput` struct —

| Step | Struct field | Categories actually constructed |
|---|---|---|
| 1 `step1_classify` | `Step1Output.warnings` | (none; `Vec::new()` at `:39`) |
| 2 `step2_lines` | `Step2Output.warnings` | (none; `Vec::new()` at `:65`) |
| 3 `step3_scenario` | `Step3Output.warnings` | (none) |
| 4 `step4_estate_base` | `Step4Output.warnings` | `unknown_donee` (`:98`) |
| 6 `step6_validation` | `Step6Output.warnings` | `preterition` (`:218`), `disinheritance` (`:258`), `inofficiousness` (`:269`) |
| 7 `step7_distribute` | `Step7Output.warnings` | (none constructed) |
| 8 `step8_collation` | `Step8Output.warnings` | (none) |
| 9 `step9_vacancy` | `Step9Output.warnings` | `max_restarts` (`:196`, `:344`), `vacancy_unresolved` (`:415`) |

— and `engine/src/pipeline.rs` **reads none of them**. `run_pipeline` (`:20-157`) and
`run_pipeline_with_restart` (`:160-257`) both discard every `warnings` field they receive. So the
fix is two-sided: the pipeline must collect, and step 10 must emit.

Six category strings exist in production code: `unknown_donee`, `preterition`, `disinheritance`,
`inofficiousness`, `max_restarts`, `vacancy_unresolved`. This is the "six" referred to in
`.planning/research/LEGAL-CONFORMANCE.md:74`.

### 1.2 The legitime/free-portion split (OBS-03, OBS-04)

`engine/src/step10_finalize.rs:538-542` and again at `:561-565`:

```
from_legitime: Money::new(0), // TODO: round sub-components
from_free_portion: Money::new(0),
from_intestate: Money::new(0),
...
legitime_fraction: String::new(),
```

The values are not missing — they are **thrown away**. `HeirDistribution`
(`engine/src/step7_distribute.rs:32-45`) carries `from_legitime`, `from_free_portion` and
`from_intestate` as `Frac`, with a documented contract at `:41` that
`total = from_legitime + from_free_portion + from_intestate`. `Step10Input.final_distributions`
already holds those values, and `Step10Input.heir_legitimes` already holds
`HeirLegitime.legitime_fraction: Frac` (`engine/src/step5_legitimes.rs:22-33`).

Step 10 therefore needs no new inputs for OBS-03/OBS-04 — only to round what it is already given.

### 1.3 `computation_log` (OBS-09)

`engine/src/step10_finalize.rs:604-613` constructs `ComputationLog` with a single hardcoded
`StepLog` for step 10. Steps 1–9 log nothing, and `Step10Input` has no field through which a prior
step's log could arrive. Measured consequence: every one of the 140 cases returns exactly one entry.

The frontend already renders the log — `frontend/src/components/results/ComputationLog.tsx` is
mounted at `ResultsView.tsx:88` and at `routes/share/$token.tsx:135`, and
`frontend/src/components/pdf/ComputationLogSection.tsx` prints it verbatim into the PDF. Nothing on
the display side needs building: the component has been rendering a one-item list.

---

## 2. OBS-02 — the ten spec flag categories

`specs/inheritance-engine-spec.md:2303-2321` (§13 "Edge Cases and Manual Review Flags", §13.1) is the
authority. It states "These 10 situations require human judgment" and tables them:

| Flag code | Spec trigger | Spec legal basis |
|---|---|---|
| `GRANDPARENT_OF_ILLEGITIMATE` | Art. 903 says "parents" not "ascendants" | Art. 903 |
| `CROSS_CLASS_ACCRETION` | IC renounces when concurring with LCs | Arts. 1018 vs 968 |
| `RESERVA_TRONCAL` | Property subject to Art. 891 reservation | Art. 891 |
| `COLLATION_DISPUTE` | Heirs disagree about collatability/value | Art. 1077 |
| `RA_11642_RETROACTIVITY` | Pre-2022 adoption with Sec. 41 question | RA 8552/11642 |
| `ARTICULO_MORTIS` | Art. 900 ¶2 conditions detected | Art. 900 ¶2 |
| `USUFRUCT_ANNUITY_OPTION` | Compulsory heirs must choose | Art. 911 ¶3 |
| `DUAL_LINE_ASCENDANT` | Same person in both paternal/maternal lines | Art. 890 |
| `POSTHUMOUS_DISINHERITANCE` | Will disinherits unborn child | Arts. 915-923 |
| `CONTRADICTORY_DISPOSITIONS` | Will has conflicting instructions | Court resolution |

`grep -rn "GRANDPARENT_OF_ILLEGITIMATE\|RESERVA_TRONCAL\|..." engine/src` returns zero hits: none of
the ten exists in the crate. The six categories the crate *does* construct are a disjoint set —
they are internal pipeline events, not the spec's human-judgment list. Both sets must survive: the
six are real signals that a lawyer needs, and the ten are the spec's contract.

### 2.1 Which triggers the current `EngineInput` can already express

Checked field by field against `engine/src/types.rs`:

| Flag code | Expressible today? | Fields that carry the trigger |
|---|---|---|
| `GRANDPARENT_OF_ILLEGITIMATE` | **yes** | `Decedent.is_illegitimate`, `Person.relationship_to_decedent == LegitimateAscendant`, `Person.degree`, `Person.is_alive_at_succession` |
| `CROSS_CLASS_ACCRETION` | **yes** | `Person.relationship_to_decedent == IllegitimateChild`, `Person.has_renounced`, presence of a living LC-group person |
| `RA_11642_RETROACTIVITY` | **yes** | `Person.adoption.regime == Ra8552`, `Adoption.decree_date` (ISO-8601 string, lexicographically ordered) |
| `ARTICULO_MORTIS` | **yes** | `Decedent.marriage_solemnized_in_articulo_mortis` |
| `CONTRADICTORY_DISPOSITIONS` | **yes** (structural) | duplicate `DispositionId` across `Will.institutions`/`legacies`/`devises`, or the same `person_id` instituted twice |
| `RESERVA_TRONCAL` | **no** | no asset inventory, no provenance field anywhere in `EngineInput` |
| `COLLATION_DISPUTE` | **no** | `Donation` has no "the parties dispute this" marker |
| `USUFRUCT_ANNUITY_OPTION` | **no** | `Legacy`/`Devise` cannot express a usufruct or a life annuity |
| `DUAL_LINE_ASCENDANT` | **no** | `Person.line` is a single `Option<LineOfDescent>`; one person cannot be in both |
| `POSTHUMOUS_DISINHERITANCE` | **no** | `Disinheritance` has no "not yet born when the will was executed" marker |

### 2.2 The additive-input decision (no struct-literal churn)

The five unexpressible triggers are all **facts a human asserts about the case**, never conclusions
the engine derives. They are therefore added as one new serde-defaulted struct hung off
`EngineConfig`, rather than as fields scattered across `Person`, `Donation`, `Legacy`, `Devise` and
`Disinheritance`.

Measured reason this shape was chosen: `grep -rn "EngineConfig {" engine/src engine/tests` finds
exactly **two** sites — the struct definition (`types.rs:346`) and `impl Default`
(`types.rs:351`) — plus one helper `default_config()` at `engine/tests/integration.rs:427`. By
contrast the alternative would have required editing every `Person {`, `Donation {`, `Legacy {`,
`Devise {` and `Disinheritance {` struct literal: 33 sites in `engine/src` and 13 in `engine/tests`,
89 counting `EngineInput {`. Rust struct literals must be exhaustive, so those edits are mandatory,
mechanical and a large regression surface for a cheap executor. The `EngineConfig` route reduces the
same capability to two edits.

On the TypeScript side, `frontend/src/types/index.ts:250-253` declares `EngineConfig` with exactly
two fields, and 14 test files plus `WizardContainer.tsx:65` construct config object literals. Adding
the new member as **optional** (`manual_review_facts?: ManualReviewFacts`) leaves every one of those
literals valid, so `npx tsc -b --force` stays clean with no test edits.

`frontend/src/schemas/index.ts:665` defines `EngineConfigSchema` as a plain `z.object` with no
`.strict()`, so an unknown extra key would already be stripped rather than rejected; adding an
`.optional()` member is additive there too.

### 2.3 What flagging is, and is not

Emitting a `ManualFlag` is the engine saying *a human must decide this*. It changes no peso amount,
resolves no ambiguity and takes no position on any reading. Every detector specified in this phase
is either a field comparison or a duplicate-id scan. No detector in this phase decides a point of
Philippine law, and none of the five new input members is a conclusion — each is a fact the lawyer
using the product asserts. **No question is added to `.planning/LAWYER-AGENDA.md` by this phase.**

`RESERVA_TRONCAL` deserves an explicit boundary note. ROADMAP Phase 8 / `LAW-11` owns "a reserva
troncal fact pattern produces a loud flag or an explicit unsupported refusal, never a silent,
unencumbered distribution". Phase 5 builds the flag code, the input member and the emission path;
Phase 8 decides what the engine then *does* about it. The two are complementary, not overlapping.

Likewise `RA_11642_RETROACTIVITY` sits next to `EngineConfig.retroactive_ra_11642`, which already
carries a `LAWYER-DECISION: LAWYER-08` marker (`engine/src/types.rs:347`). Phase 5 must not move,
rename or delete that marker — gate `G10` (`node scripts/check-lawyer-agenda.mjs`) fails with
`DECISION MARKER MISSING` if it does, and with `DECISION ANCHOR BROKEN` if the anchored pattern
`pub retroactive_ra_11642: bool` stops matching exactly once.

---

## 3. OBS-05 / OBS-06 — a runtime rejection, not a test assertion

`run_pipeline(&EngineInput) -> EngineOutput` (`engine/src/pipeline.rs:20`) is infallible. The crate
has no `Result`-based error channel at all: `thiserror = "2"` is declared in `engine/Cargo.toml:16`
and never used (zero `#[derive(Error)]` in `engine/src`).

Changing `run_pipeline`'s signature would be a wide break. Measured caller set:

| Caller | Site |
|---|---|
| `engine/src/wasm.rs:9` | the only production path — `compute_json` |
| `engine/src/main.rs:39` | CLI |
| `engine/tests/fuzz_invariants.rs:53` | wrapped in `catch_unwind` |
| `engine/tests/integration.rs` | **does not call it** — the file defines its own local `run_pipeline` at `:27` that inlines steps 1–10 and is used by all 30 integration tests |

The integration file's private copy is the single most important structural fact in this phase: any
change to `Step10Input`'s field set must be mirrored at `engine/tests/integration.rs:147-163` or the
test binary will not compile.

Chosen shape: keep `run_pipeline` infallible, and add a separate checked entry point that runs the
validator over the produced output. The validator is a free function so it can also be called
directly on a hand-corrupted `EngineOutput` in a unit test — which is what makes the rejection
observable without needing to break the pipeline to see it.

`per_heir_shares` may legitimately be empty (escheat to the State, scenario I15). Measured above:
zero committed cases produce an empty `per_heir_shares` alongside a nonzero estate, so requiring
`sum(net_from_estate) == net_distributable_estate` unconditionally does not break any existing case.

---

## 4. OBS-07 — the WASM boundary

`engine/src/wasm.rs` is 12 lines. Both failure paths return `JsValue::from_str` of an ad-hoc
`format!` string: `"Input parse error: {e}"` and `"Output serialize error: {e}"`. On the JS side,
`frontend/src/wasm/bridge.ts:342-347` (`computeWasm`) does `JSON.stringify` → `compute_json` →
`JSON.parse` with no try/catch and no schema validation, so a `serde` rejection surfaces as a bare
string thrown out of WASM.

Existing frontend expectations, checked so the change cannot break them:

| Test | Assertion | Compatible with a structured error? |
|---|---|---|
| `src/wasm/__tests__/wasm-live.test.ts:209` | `await expect(computeWasm(badInput)).rejects.toThrow()` | yes — no message matcher |
| `src/wasm/__tests__/conformance.test.ts:468, :493` | `expect(() => compute_json(...)).toThrow()` | yes — no message matcher |
| `src/wasm/__tests__/wasm-real.test.ts:377-379` | describe block "computeWasm() with invalid input throws/rejects" | yes |

No committed test asserts on the text of an engine error, so the error format is free to become
structured. All 5 wasm test files (53 + 31 + 14 + 14 + 7 = 119 tests) pass today.

`bridge.ts` is also touched by ROADMAP Phase 9 / `EXT-01`, which deletes `predictScenario()` and
`computeMock()` from it. Phase 5 must therefore confine its edits to `computeWasm`/`compute` and the
imports they need, and must not restructure the rest of the file, or Phase 9's deletion becomes a
merge problem.

---

## 5. OBS-08 — frontend error capture

`grep -rln "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" frontend/src` returns **zero
files**. `frontend/src/main.tsx` mounts `<RouterProvider>` inside `<React.StrictMode>` with no
boundary anywhere, so an uncaught throw inside a route component unmounts the tree to a blank page.
There is no error-reporting module, no `window.onerror` handler and no
`unhandledrejection` handler in the codebase.

There is no error-tracking service configured in this repository, and none of the deploy config
(`fly.toml`, the nginx Dockerfile) references one. Inventing a vendor would be an ungrounded
decision of exactly the kind `LOOP-01` forbids, so the sink is in-process: a module that records
errors in a bounded ring buffer, exposes them for reading, and mirrors each to `console.error`. That
is what makes an error *captured and reportable* without choosing a vendor.

`frontend/src/test-setup.ts` already installs the jsdom polyfills added in Phase 1 (ResizeObserver,
DOMRect, matchMedia, Radix pointer APIs) plus `@testing-library/jest-dom`, so a component test that
renders a throwing child works without further environment work.

---

## 6. Gate landscape this phase must respect

`gates.manifest.json` holds 10 gates; `gates.manifest.lock` freezes `{id, command, blocking}` for
all 10. Current `order` values:

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
| 9 | G8 | `node scripts/check-gate-skips.mjs` |
| 10 | G9 | `node scripts/check-gate-results.mjs` |

Two constraints carried forward from Phase 4's research and still true:

1. `scripts/check-gate-results.mjs` (G9) fails with `RESULTS INCOMPLETE` when any gate other than
   itself is `not-run`, and `scripts/ci-gates.sh` republishes after every gate. **G9 must stay
   last.** A new gate takes `order: 9`, pushing G8 to 10 and G9 to 11.
2. `scripts/check-gate-skips.mjs` (G8) fails with `SKIP REPORT MISSING` on any gate log lacking a
   `GATE-SKIPS total=<n> skipped=<m>` line, and with `SKIP COUNT MISMATCH` on an undeclared skip.
   Any new gate script must print that line **on every exit path**. Placing the new gate at order 9
   keeps it ahead of G8, so its own skip line is checked rather than exempted.

`gate-skips.lock` currently declares exactly one skip (`G4 / tsconfig.skipLibCheck`) and may only
shrink. This phase introduces no skip, so the file must not be edited.

`frontend/test-baseline.json` records 46 known failures with `min_total_tests: 2416`. It is a
**floor**, not an equality, so adding frontend tests is safe; the ledger may only shrink, so no
entry may be appended.

---

## 7. Architectural responsibility map

| Concern | Tier | Files |
|---|---|---|
| Collecting warnings and step logs across steps | pipeline orchestration | `engine/src/pipeline.rs`, mirrored in `engine/tests/integration.rs` |
| Emitting warnings, rounding sub-components, formatting fractions | step 10 | `engine/src/step10_finalize.rs` |
| Detecting the ten spec flag codes | new pure module | `engine/src/flags.rs` |
| Asserting conservation and heir-id uniqueness | new pure module | `engine/src/output_check.rs` |
| Rejecting a malformed input / corrupt output at the boundary | WASM shim | `engine/src/wasm.rs` |
| Surfacing a structured engine error to the app | bridge | `frontend/src/wasm/bridge.ts` |
| Capturing and reporting a frontend error | app shell | `frontend/src/lib/error-reporting.ts`, `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/main.tsx` |

Nothing in this phase belongs in steps 1–9: every one of them already builds the data this phase
needs, and editing them would enlarge the diff without adding observability.

---

## 8. Validation Architecture

Every claim this phase makes is checkable by one of four mechanisms, all of which exist today:

1. **`cd engine && cargo test`** (gate G1) — Rust unit tests inside each edited module, the 30
   integration tests, the 100-case fuzz invariant test, and one new corpus-wide observability test
   binary that re-runs the 140 committed cases and asserts the measured baseline has inverted.
2. **`cd frontend && npm run test:gate`** (gate G3) — the complete Vitest suite against the
   46-entry ledger and the 2416-test floor.
3. **`cd frontend && npx tsc -b --force`** (gate G4) — zero type errors after the optional
   `manual_review_facts` member is added.
4. **A new static gate** — `node scripts/check-observability.mjs`, registered as `G11` at order 9,
   which fails when the two hardcoded lines this phase removes reappear, when any of the ten spec
   flag codes stops being declared, or when any declared flag code has no test that observes it in
   `EngineOutput.warnings`.

Sampling is per task: no task in this phase may end without its own command having been run and its
real output read.

---

## 9. Open questions

None. Every decision this phase needs is recorded above or in the plan files:
the input-extension shape (§2.2), the flag-detection predicates (§2.1 and each plan's task table),
the rounding rule for sub-components (plan 05-03), the step-log contents and counts (plan 05-01),
the error-report sink (§5), and the gate registration slot (§6).

No point of Philippine law arises anywhere in this phase.
