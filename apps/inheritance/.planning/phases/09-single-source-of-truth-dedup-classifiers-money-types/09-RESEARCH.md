---
phase: 09-single-source-of-truth-dedup-classifiers-money-types
researched: 2026-07-31
requirements: [EXT-01, EXT-02, EXT-03, EXT-04]
---

# Phase 9 Research — Single Source of Truth: Dedup Classifiers & Money Types

Every number, count, file path and line number in this document was measured in this working tree on
2026-07-31, by running the command shown or by reading the exact source line cited. Two of the design
decisions below (the money-unit typing technique, and the negative-type-test technique that proves it)
were additionally **run end to end** against this repository's own TypeScript 5.9.3 before being
written down, and the probe output is pasted in §4.2. Nothing in this file is inferred from an older
audit.

---

## 0. Measured baseline

| Signal | Command | Result |
|---|---|---|
| Engine tests | `cd engine && cargo test` | **543 passed, 0 failed** across 7 binaries |
| Committed corpus | `ls examples/{cases,testate-cases,fuzz-cases,coverage-cases,defect-cases}/*.json` | **173** files (20 + 20 + 100 + 31 + 2) |
| Frontend suite | `cd frontend && npm run test:gate` | **2449 tests**, gate FAILS with exactly **5** `UNKNOWN FAILURE` entries |
| Typecheck | `cd frontend && npx tsc -b --force` | clean, exit 0 |
| Gate set | `gates.manifest.json` | 13 gates, orders 1–13, `G9` last |

### The G3 halt is inherited, not caused here

`bash scripts/ci-gates.sh` halts at `G3` (order 8 of 13). The five `UNKNOWN FAILURE` entries printed
by `npm run test:gate` on 2026-07-31 at 16:00 are byte-identical to the set Phase 5 left behind:

```
UNKNOWN FAILURE: src/__tests__/integration.test.tsx :: integration > compute handles invalid input gracefully compute() handles duplicate person IDs
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles negative centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/bridge.test.ts :: wasm bridge invalid input handles duplicate person IDs without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles negative estate centavos without crashing
UNKNOWN FAILURE: src/wasm/__tests__/wasm-real.test.ts :: wasm-real engine computeWasm() with invalid input throws/rejects handles duplicate person IDs without crashing
GATE-SKIPS total=2449 skipped=0
```

Phase 9 does not touch that decision and must not grow that set. **`ALL GATES PASSED (14/14)` is not
achievable in this phase and must not be claimed.**

### Ordering consequence for this phase's proofs

The new gate this phase adds takes `order` **6**, ahead of the halt, so it is provable by a normal
runner invocation. `G4` (typecheck, which becomes order 10) sits **after** the halt, so the EXT-03
proof must be obtained by running `cd frontend && npx tsc -b --force` directly. Phases 5, 7 and 8 all
did exactly this for gates the runner never reaches.

---

## 1. EXT-01 — three scenario classifiers exist; two are wrong

### 1.1 Census, measured

`grep -rn "predictScenario\|computeMock" --include=*.ts --include=*.tsx src/` returns six lines in two
files:

| Site | Status | Reachability |
|---|---|---|
| `frontend/src/wasm/bridge.ts:86` `function predictScenario` | dead | called only by `computeMock` |
| `frontend/src/wasm/bridge.ts:219` `export async function computeMock` | dead | **zero** importers — `grep -rln "computeMock" src/` returns `src/wasm/bridge.ts` only |
| `frontend/src/components/wizard/ReviewStep.tsx:34` `function predictScenario` | **live** | called at `ReviewStep.tsx:223`, renders the "Predicted:" badge |

`compute()` at `bridge.ts:436` delegates straight to `computeWasm`. The header comment at
`bridge.ts:5` ("Falls back to computeMock() if WASM is not available") is stale and describes
behaviour that does not exist.

### 1.2 The live copy is wrong, measured against the engine

`ReviewStep.tsx`'s classifier is not a stale mirror of the engine — it is a different, shorter
decision tree. Its first two branches disagree with the engine on the single most common Philippine
family shape.

Two inputs were built to match `ReviewStep.test.tsx`'s own fixtures exactly (one
`LegitimateChild` `lc1` plus one `SurvivingSpouse` `sp`, all other flags at the fixture defaults) and
run through `engine/target/release/inheritance-engine`:

| Fixture | `ReviewStep.tsx` badge | Engine (`scenario_code` in the emitted JSON) |
|---|---|---|
| intestate, 1 LC + 1 SS | `I1` (line 52, `hasLC && hasSS`) | **`I2`** |
| testate, 1 LC + 1 SS, one institution | `T1` (line 52 with `prefix='T'`) | **`T2`** |

The intestate figure was produced by `./target/release/inheritance-engine rs_intestate.json`, which
printed `scenario_code= I2  succession_type= Intestate`. Both are off by one code, in the most common
shape the product handles. This is the "faithfully certifies a wrong badge" failure the ROADMAP
sequences Phase 9 ahead of Phase 12 to prevent.

### 1.3 The live copy evades a literal-density grep

`ReviewStep.tsx` never writes a scenario-code literal. It builds every code with a template string
and a cast:

```
if (hasLC && hasSS) return `${prefix}1` as ScenarioCode;
```

Measured: `grep -rEc "as\s+ScenarioCode"` over `frontend/src` returns exactly one non-zero file,
`src/components/wizard/ReviewStep.tsx: 12`. Every other file in the tree is at zero. That single fact
is what makes `as ScenarioCode` a precise, zero-false-positive detector for a re-introduced
classifier, and it is rule `SSOT-01` in §3.

### 1.4 There is no classification entry point on the WASM boundary

`engine/src/wasm.rs` exports exactly one function, `compute_json`, which runs
`run_pipeline_checked` — the full ten steps, including money. There is no way for the frontend to ask
the engine "which scenario is this?" without also asking it to distribute an estate.

The pieces to add one already exist and are all `pub`:

```rust
pub fn step1_classify(input: &Step1Input) -> Step1Output;          // src/step1_classify.rs:37
pub fn step2_build_lines(input: &Step2Input) -> Step2Output;       // src/step2_lines.rs
pub fn step3_determine_scenario(input: &Step3Input) -> Step3Output; // src/step3_scenario.rs:52
```

`Step1Input`, `Step2Input` and `Step3Input` carry **no money field at all** — the estate first enters
at `Step4Input`. A classification entry point therefore cannot compute a peso figure, which is the
property EXT-04 cares about.

### 1.5 The output scenario code is always step 3's code

`grep -n "scenario_code" src/pipeline.rs` returns nine lines, at 127, 149, 176, 217, 249, 327, 352,
391 and 417. **Every one of them is `scenario_code: step3.scenario_code`**, including the two inside
`run_pipeline_with_restart` (391, 417). The restart path re-runs steps 2–9 but never recomputes the
code.

Consequence, and it is load-bearing for plan 09-01: a new `classify_scenario(input)` that runs
steps 1→2→3 the same way `run_pipeline` does must agree with `run_pipeline(input).scenario_code` on
**every** input, with no exceptions for restarts or mixed succession. That equivalence is directly
testable over all 173 committed inputs, and it is a stronger guarantee than a refactor would give,
because it is re-checked on every `cargo test` run rather than once at authoring time.

`run_pipeline` is deliberately **not** refactored. Phase 8 recorded that `engine/tests/integration.rs`
holds an inline copy of the pipeline near line 27 that constructs step inputs directly; leaving
`run_pipeline`'s body alone is the cheapest way to keep that copy compiling.

### 1.6 What the badge must become

ROADMAP success criterion 1 offers two endings: the badge is "backed by the real engine (or
removed)". This phase chooses **backed by the real engine**, and the choice is made here rather than
left to the executor. Grounds:

1. ROADMAP sequences Phase 9 before Phase 12 *specifically* so the succession-wizard screenshot gate
   has a correct badge to certify. Removing the badge would satisfy the letter of EXT-01 and defeat
   its stated purpose.
2. `ReviewStep` already holds a complete `EngineInput` — `formValues = watch()` at `ReviewStep.tsx:215`
   returns the whole form object, which *is* `EngineInput`.
3. Three committed tests in `ReviewStep.test.tsx` assert the badge exists (lines 271, 282, 295).
   Removal would require deleting them. Engine-backing keeps all three and lets them be
   **strengthened** from `/I\d/` to the exact code the engine returns.

Cost, stated plainly: the engine is reachable only across an async WASM boundary, so the badge becomes
async, and the three tests must move from `getByText` to `await findByText`. That is not a weakening —
same query, same regex tightened to an exact string, only the await is added.

### 1.7 A test-fixture defect that blocks the testate badge test

`ReviewStep.test.tsx:300-306` builds an institution as:

```
{ heir_reference: {...}, share: 'EntireFreePort', conditions: [], substitutes: [], is_residuary: false }
```

Both `frontend/src/types/index.ts:335-342` and `engine/src/types.rs:400-407` declare
`InstitutionOfHeir { id, heir, share, conditions, substitutes, is_residuary }`. The fixture has no
`id` and names the field `heir_reference` instead of `heir`. The real engine rejects it — measured:

```
Error parsing input JSON: missing field `id` at line 1 column 1401
Error parsing input JSON: missing field `heir` at line 1 column 1416
```

This compiles today only because **`frontend/tsconfig.json` excludes every test file** (see §4.1), so
`tsc` never sees it. Correcting the fixture to `id` + `heir` is a prerequisite for the testate badge
test under an engine-backed badge. It is a fixture correction toward the declared type, not a
weakening; Phase 8 set the precedent when it corrected six wrong expectations to the statute.

---

## 2. EXT-04 — the dead code inventory

### 2.1 Frontend

Deleting `predictScenario` and `computeMock` from `bridge.ts` orphans four more symbols in the same
file. `frontend/tsconfig.json` sets `"noUnusedLocals": true`, so leaving any of them behind turns
`G4` red. Full list, with the reason each becomes unused:

| Symbol | `bridge.ts` line | Only consumer |
|---|---|---|
| `relationshipToCategory` | 31 | `computeMock` |
| `categoryLabel` | 55 | `computeMock` |
| `zeroMoney` | 211 | `computeMock` |
| `predictScenario` | 86 | `computeMock` |
| `EngineInputSchema` import | 12 | `computeMock` |
| `EFFECTIVE_CATEGORY_LABELS`, `formatPeso` imports | 25 | `computeMock` |
| type imports `EffectiveCategory`, `InheritanceShare`, `HeirNarrative`, `ScenarioCode`, `SuccessionType`, `Money`, `Person`, `Relationship` | 13–24 | the five functions above |

After the deletion the file's imports reduce to exactly two statements: the `EngineInput` /
`EngineOutput` type import and the `./pkg/inheritance_engine` import. `EngineError`,
`parseEngineError`, `ensureWasmInitialized`, `computeWasm` and `compute` all survive untouched.

`grep -rln "computeMock" src/` returns `src/wasm/bridge.ts` alone — **zero test files import it**, so
no test moves and the 2449 total is unchanged by this deletion.

### 2.2 Engine

`grep -rn "allow(dead_code)" src/ tests/` returns six sites. Measured disposition for each:

| Site | Call sites | Disposition |
|---|---|---|
| `tests/integration.rs:598` `check_scenario_consistency` | **28** | The attribute is stale — Phase 6 revived the function but left the attribute. Remove the attribute only. |
| `tests/integration.rs:578` `check_adoption_equality` | **0** | This is invariant 6 (adopted child share == legitimate child share). **Revive by calling it**, do not delete: `test_tv09_adopted_equals_legitimate` at line 1052 is its exact home. |
| `tests/integration.rs:620` `find_share_by_name` | **0** | A pure lookup by `heir_name`, no legal content, superseded by `find_share`. Delete. |
| `src/step2_lines.rs:621` `fn ineligible` | 0 | Test-module helper inside `#[cfg(test)]`. Delete. |
| `src/step8_collation.rs:386` `fn make_distribution` | 0 | Test-module helper inside `#[cfg(test)]`. Delete. |
| `tests/defect_ledger.rs:53` `requirement` field | n/a | A serde field that must exist for deserialization to accept the ledger's shape. **Keep.** |

The distinction that matters: `check_adoption_equality` is an *assertion*. Deleting an unused
assertion helper removes verification, which is the direction this project never moves. Calling it is
the correct disposal, and it is the same disposal Phase 6 chose for `check_scenario_consistency`.

### 2.3 A second implementation of peso→centavo conversion

`grep -rEn "Math\.round\(.*\*\s*100"` over `frontend/src`, excluding tests, returns four lines:

```
src/types/index.ts:497:              return Math.round(pesos * 100);
src/lib/estate-tax-engine/pipeline.ts:113:  const toCentavos = (pesos) => Math.round((pesos ?? 0) * 100);
src/lib/documents.ts:100:      const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
src/lib/timeline.ts:192:      const progressPercent = Math.round((completedStages / stages.length) * 100);
```

The first two are the same rule implemented twice. The last two are percentages, not money, and are
permanent legitimate residents of that grep — they are named in the registry with that reason rather
than being allowed to dilute the rule.

---

## 3. EXT-02 — what an automated single-source check can actually assert

A check that tries to detect "a duplicated legal rule" in general is a heuristic, and a heuristic gate
trains readers to ignore it. The tractable form is a **registry of named rules**, each with a literal
regex, a scan scope and an occurrence ceiling — the same shape `gates.manifest.lock`,
`gate-skips.lock`, `coverage-zero.lock` and `assertion-baseline.json` already use here.

Four rules were measured against this tree. Each is at a known count today and at its ceiling after
this phase's deletions land:

| Id | Rule | Pattern | Scope | Ceiling | Today | After |
|---|---|---|---|---|---|---|
| `SSOT-01` | Only the engine may fabricate a scenario code | `as\s+ScenarioCode` | `frontend/src/**/*.{ts,tsx}` | 0 | 12 (all `ReviewStep.tsx`) | 0 |
| `SSOT-02` | Only the engine may pair a scenario code with a succession type | `successionType\s*:\s*["'](Testate\|Intestate)` | `frontend/src/**/*.{ts,tsx}`, `__tests__` excluded | 0 | 27 (all `bridge.ts`) | 0 |
| `SSOT-03` | No function may be named `predictScenario` | `function\s+predictScenario` | `frontend/src/**/*.{ts,tsx}` | 0 | 2 files | 0 |
| `SSOT-04` | Peso→centavo conversion has one implementation | `Math\.round\(.*\*\s*100` | `frontend/src/**/*.{ts,tsx}`, `__tests__` excluded | 3 named files | 4 files | 3 files |

`SSOT-02` excludes `__tests__` deliberately and with evidence: the pattern matches
`src/components/results/__tests__/ResultsHeader.test.tsx` and
`src/components/results/__tests__/DistributionSection.test.tsx`, where it appears inside a literal
`EngineOutput` a test constructs as *expected data*. Constructing expected output is not implementing
a rule.

### 3.1 Why the registry cannot be gutted

Deleting a rule from `single-source.json` would make the gate pass. The countermeasure is the one
`scripts/check-lawyer-agenda.mjs` already uses and Phase 8 extended: a hardcoded `REQUIRED_IDS`
constant inside the check script, so removing a rule from the JSON fails with a named marker rather
than silently reducing coverage. That is why this phase adds no fourth lock file.

### 3.2 Where the new gate goes in the order

Current orders: `G5`=1, `G6`=2, `G7`=3, `G12`=4, `G13`=5, `G1`=6, `G2`=7, `G3`=8, `G4`=9, `G10`=10,
`G11`=11, `G8`=12, `G9`=13.

`G14` takes **order 6**, joining the static checks ahead of `G1`, and everything from `G1` down shifts
by one: `G1`=7, `G2`=8, `G3`=9, `G4`=10, `G10`=11, `G11`=12, `G8`=13, `G9`=14. `G9` stays last, which
is the constraint Phase 4 measured (`scripts/check-gate-results.mjs` fails with `RESULTS INCOMPLETE`
on any gate it sees as `not-run`). `order` is explicitly unlocked — `gates.manifest.lock` freezes only
`{id, command, blocking}`.

This placement is not a route around the red `G3`: `G3` still runs at order 9, still fails, and still
stops the run.

---

## 4. EXT-03 — making a peso unassignable to a centavo

### 4.1 A measured constraint that changes where the proof can live

`frontend/tsconfig.json` lines 25–32:

```json
"include": ["src"],
"exclude": ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.spec.ts", "src/**/*.spec.tsx"]
```

**Gate `G4` typechecks no test file.** A negative type test placed in a `__tests__` directory or given
a `.test.ts` suffix would never be compiled and would prove nothing. The proof file must therefore sit
at a non-excluded path. This phase uses `frontend/src/types/money-units.typetest.ts`, which matches
`include` and no `exclude` entry.

(Recorded, not acted on: this exclusion is arguably a second undeclared skip in `G4` alongside the
`skipLibCheck` entry already in `gate-skips.lock`. `gate-skips.lock` may only shrink and appending to
it is prohibited, so nothing is done about it here. It is noted so a later phase can see it.)

### 4.2 The technique, run end to end before being written down

A hard brand (`number & { __brand: 'pesos' }`) makes numeric literals unassignable, which would break
every `{ centavos: 0 }` literal and every money field in the tax wizard's fixtures — hundreds of
sites. A **flavour** (an *optional* brand property) keeps literals and plain `number` assignable while
still making the two units mutually unassignable.

The following file was written to a scratch directory and compiled with this repository's own
`frontend/node_modules/.bin/tsc` (TypeScript 5.9.3):

```ts
type Flavor<T, F extends string> = T & { readonly __unit?: F };
export type Pesos = Flavor<number, 'pesos'>;
export type Centavos = Flavor<number, 'centavos'>;

export function pesosToCentavos(pesos: Pesos): Centavos { return Math.round(pesos * 100) as Centavos; }
export function centavosToPesos(c: Centavos): Pesos { return (c / 100) as Pesos; }

const a: Pesos = 0;              // literal still assignable
const b: Centavos = 100;         // literal still assignable
declare const plain: number;
const d: Centavos = plain;       // plain number still flows in

// @ts-expect-error pesos may not be used where centavos are expected
const e: Centavos = a;
// @ts-expect-error centavos may not be used where pesos are expected
const f: Pesos = b;
// @ts-expect-error centavos may not be passed to pesosToCentavos
const g = pesosToCentavos(b);
// @ts-expect-error pesos may not be passed to centavosToPesos
const h = centavosToPesos(a);
```

Result: `tsc --strict --noEmit --target es2022` exited **0**. Because `@ts-expect-error` is itself an
error when the next line compiles, exit 0 proves all four cross-unit assignments *are* rejected.

The reverse direction was measured too. With `Flavor<T, F> = T` (the brand removed), the same file
produced:

```
t2.ts(18,1): error TS2578: Unused '@ts-expect-error' directive.
t2.ts(20,1): error TS2578: Unused '@ts-expect-error' directive.
t2.ts(22,1): error TS2578: Unused '@ts-expect-error' directive.
t2.ts(24,1): error TS2578: Unused '@ts-expect-error' directive.
TSC_EXIT_WITHOUT_BRAND=2
```

So the proof file is load-bearing in both directions: it passes only while the units are separated,
and it fails the moment anyone erases the separation. `G4` — an existing blocking gate whose command
string is frozen — becomes the enforcement mechanism with no new gate required.

### 4.3 Blast radius, measured call site by call site

`grep -rn "pesosToCentavos\|centavosToPesos"` over `frontend/src` returns exactly **four production
call sites**, and every argument at every one of them is a plain `number`, which stays assignable
under flavouring:

| Call site | Argument |
|---|---|
| `components/shared/MoneyInput.tsx:67` | `parseFloat(raw)` |
| `components/shared/MoneyInput.tsx:85` | `parseFloat(raw)` |
| `components/shared/MoneyInput.tsx:38`, `:45` | `Number(field.value)` |
| `components/quick-calc/QuickCalcWidget.tsx:34` | `Number(estatePesos) \|\| 0` |

The rest of the hits are in `src/types/__tests__/types.test.ts` and
`src/components/shared/__tests__/MoneyInput.test.tsx`, both of which pass numeric literals and are in
any case excluded from `tsc` by §4.1.

### 4.4 The two money boundaries, both single points

**Succession wizard.** `components/shared/MoneyInput.tsx` is the only user-facing money entry
control. Its own doc comment already states the contract: "Accepts peso amounts from user, stores as
centavos internally." It is used by `EstateStep.tsx:49`, `DonationCard.tsx:165` and `:238`, and
`LegaciesTab.tsx:183` and `:239`. Storage is `Money { centavos: number | string }`
(`types/index.ts:237`).

**Tax wizard.** `EstateTaxWizardState` stores money as bare `number` **in pesos**; the tax engine's
`EngineInput` stores bare `number` **in centavos**; the two are joined by exactly one adapter,
`wizardStateToEngineInput` at `lib/estate-tax-engine/pipeline.ts:110`, whose own comment says "Wizard
stores monetary values in pesos; engine uses centavos. All monetary fields are multiplied by 100 at
this boundary." Measured: `grep -c "toCentavos(" pipeline.ts` returns **24**. That local `toCentavos`
arrow is the second implementation named in §2.3, and replacing it with an import of the shared
`pesosToCentavos` closes `SSOT-04` and EXT-03's tax half at the same time.

---

## 5. Cross-cutting constraints measured for this phase

1. **`engine/tests/integration.rs` holds an inline copy of the pipeline** near line 27. No plan in
   this phase changes the shape of any `StepNInput` struct, so that copy compiles untouched.
2. **`src/wasm.rs` is declared at zero coverage** in `coverage-zero.lock` with the reason
   "unreachable from a native cargo test". `scripts/check-coverage.mjs` fails with
   `STALE ZERO COVERAGE DECLARATION` if a declared module gains a covered region. Consequence for
   plan 09-01: the classification *logic* goes in `engine/src/pipeline.rs` (already covered) and
   `wasm.rs` receives only a thin parse→call→serialize wrapper with **no native test**, so
   `coverage-zero.lock` is not touched at all.
3. **Every gate must print `GATE-SKIPS total=<n> skipped=<n>` on every exit path**, or `G8` fails with
   `SKIP REPORT MISSING`. Nine existing scripts do this; `scripts/check-observability.mjs:85` is the
   pattern to copy.
4. **`gates.manifest.lock` may only grow.** Adding `G14` means appending one `{id, command, blocking}`
   object to it. Removing or rewriting an existing entry is prohibited.
5. **Four shrink-only ledgers are read-only for this phase**: `frontend/test-baseline.json`,
   `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json`, plus
   `coverage-zero.lock`. No plan edits any of them.
6. **The WASM binary must be rebuilt before the frontend is measured.** `bash engine/build-wasm.sh`
   regenerates `frontend/src/wasm/pkg/`, of which exactly two files are tracked
   (`inheritance_engine.js`, `inheritance_engine.d.ts`); the `.wasm` binary is gitignored. Adding a
   `#[wasm_bindgen]` export changes both tracked files, and they must be committed with the engine
   change.
7. **No point of Philippine law arises anywhere in this phase.** Every task deletes a duplicate,
   routes a caller to the engine, or separates two units of currency. `classify_scenario` adds no
   rule — it calls the same three step functions `run_pipeline` already calls, and its correctness
   criterion is agreement with `run_pipeline`, not agreement with a reading of the Civil Code.
   **Nothing is added to `.planning/LAWYER-AGENDA.md`.**

---

## Validation Architecture

Every requirement in this phase is a *removal* or a *unification*, which creates a specific validation
hazard: deleting code makes tests pass trivially, and a type-level rule cannot be observed by a test
that runs. The strategy is therefore that each requirement is proved by an instrument that **fails
when the property is absent**, verified in both directions where the direction is cheap to measure.

**Sampling rate.** After every task, the narrowest command that can observe the change. After every
wave, `cd engine && cargo test`, `bash engine/build-wasm.sh`, `cd frontend && npm run test:gate` and
`cd frontend && npx tsc -b --force`. Maximum feedback latency 60 seconds.

| Requirement | Signal | Instrument | Control that must not move |
|---|---|---|---|
| EXT-01 | the badge shows the engine's code, not a local guess | `ReviewStep.test.tsx` strengthened from `/I\d/` to exactly `I2`, and from `/T\d/` to exactly `T2` | the other 27 `ReviewStep` tests stay green; the 4 ledgered `ReviewStep` entries stay ledgered |
| EXT-01 | one classifier, proven equivalent | `classify_scenario(x).scenario_code == run_pipeline(x).scenario_code` over all 173 committed inputs | `cargo test` stays at 0 failed and rises above 543 |
| EXT-02 | a re-introduced duplicate fails the build | `node scripts/check-single-source.mjs` plus two committed fixtures under `scripts/fixtures/` that must exit 1 | `G14` runs at order 6, ahead of the `G3` halt, so it is observable |
| EXT-03 | a peso cannot reach a centavo slot | `money-units.typetest.ts` under `npx tsc -b --force`; four `@ts-expect-error` lines | `tsc` exit 0 overall; 2449 frontend tests unchanged |
| EXT-04 | no dead path can compute a number | `grep -c "computeMock" frontend/src` returns 0; `grep -rc "allow(dead_code)" engine/` drops from 6 to 1 | `check_adoption_equality` is *called*, not deleted — invariant count goes up, never down |

**Instrumentation already in place and reused rather than rebuilt.**
`frontend/scripts/check-test-baseline.mjs` fails on any failure outside the ledger and on any ledger
entry that starts passing; `engine/tests/fuzz_invariants.rs` evaluates 16 named invariants per case;
`scripts/check-gate-manifest.mjs` rejects a shrunk gate set; `npx tsc -b --force` is already a blocking
gate whose command string is frozen.

**What is deliberately not instrumented.** No coverage percentage threshold (Phase 6's recorded
decision). No screenshot or vision gate (Phases 10–12 own those). No general-purpose "duplicated
logic" detector — only the four measured, named rules in §3, because a heuristic gate that cries wolf
is a gate people learn to skip.
