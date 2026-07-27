# Coding Conventions

**Analysis Date:** 2026-07-27

**Scope:** `apps/inheritance/engine` (Rust, compiled to WASM) and `apps/inheritance/frontend` (React 19 + TypeScript). No monorepo-wide lint/format config applies to this app — see "Code Style" below for what is (not) enforced.

## Naming Patterns

**Rust (`engine/src/`):**
- Files: `stepN_<name>.rs`, one file per pipeline stage (`step1_classify.rs` … `step10_finalize.rs`), plus `types.rs`, `fraction.rs`, `pipeline.rs`, `wasm.rs`, `main.rs`, `lib.rs`.
- Types: `PascalCase` structs/enums (`EngineInput`, `HeirLegitime`, `ScenarioCode`).
- Functions: `snake_case`, verbish and step-scoped (`step6_validate_will`, `effective_category`, `run_pipeline`).
- Test functions: `test_<condition>` for unit tests (`test_legitimate_child_maps_to_lc_group`, `engine/src/step1_classify.rs:304`); integration tests use spec vector IDs `test_tv01_...` through `test_tv23_...` (`engine/tests/integration.rs:528`); ad hoc debugging tests use `probe_*` (`engine/tests/zz_probe.rs`) and `sweep_*` (`engine/tests/zz_sweep.rs`).
- Constants: `SCREAMING_SNAKE_CASE` module-level (e.g. `FUZZ_DIR` in `engine/tests/fuzz_invariants.rs:16`).

**TypeScript (`frontend/src/`):**
- Components: `PascalCase.tsx`, one component per file, colocated in feature folders (`components/wizard/PersonCard.tsx`, `components/results/ResultsView.tsx`).
- Non-component modules: `kebab-case.ts` (`lib/pdf-export.ts`, `lib/tax-bridge.ts`, `lib/case-notes.ts`) — this differs from component files, so a new file's casing depends on whether it exports a component.
- Hooks: `useX.ts`/`useX.tsx` in `hooks/` (`hooks/useAuth.ts`, `hooks/useAutoSave.ts`).
- Test files: always `<subject>.test.ts(x)` inside a sibling `__tests__/` directory (never colocated flat, never `.spec.`).
- Types/enums: `PascalCase` (`Relationship`, `ScenarioCode`, `EffectiveCategory`); label lookup maps are `SCREAMING_SNAKE_CASE` (`EFFECTIVE_CATEGORY_LABELS`, `WARNING_SEVERITY`, `RELATIONSHIP_OPTIONS`).
- Zod schemas: `<Type>Schema` suffix (`PersonSchema`, `EngineInputSchema`) in `frontend/src/schemas/index.ts`.

## Code Style

**Formatting:**
- No `.prettierrc*` anywhere in `frontend/`. No `rustfmt.toml` in `engine/`. Formatting is whatever each contributor's editor/agent produced — there is no enforced style and no CI step that checks it.

**Linting:**
- No `eslint.config.*` or `.eslintrc*` in `frontend/` (confirmed absent; sibling apps in the monorepo such as `apps/daimon-saas` and `apps/maceda-calculator` do have `eslint.config.mjs`, so this is a gap specific to `apps/inheritance`, not a monorepo-wide choice).
- No `clippy.toml` in `engine/`. `cargo clippy` is not run anywhere in CI (`.github/workflows/inheritance.yml` has no lint step at all — see TESTING.md CI Reality).
- TypeScript compiler is the only enforced gate: `frontend/tsconfig.json` sets `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noUncheckedIndexedAccess": true`, `"noFallthroughCasesInSwitch": true`. The build script (`frontend/package.json:7`, `"build": "tsc -b && vite build"`) is the de facto type-check gate, but it is not invoked by any CI workflow either (see TESTING.md).

## Import Organization

**TypeScript order (observed, not enforced by tooling):**
1. External packages (`react`, `react-hook-form`, `lucide-react`)
2. Type-only imports from local `types`/`schemas` (`import type { EngineInput, Person } from '../../types'`)
3. Local relative imports, deepest-feature-first (sibling helpers, then parent step components)
4. `@/` alias imports for shared UI (`@/components/ui/*`, `@/lib/utils`) — see `frontend/src/components/wizard/PersonCard.tsx:1-19`

**Path Aliases:**
- `@/*` → `frontend/src/*`, configured in both `frontend/tsconfig.json:18-20` and `frontend/vitest.config.ts:8-10` (must be kept in sync manually — no shared config file).

**Rust:**
- `use` blocks: external crates first (`num_bigint`, `serde`), then `crate::` internal modules, no blank-line grouping enforced but generally followed (`engine/src/step6_validation.rs:17-19`).

## Error Handling

**Rust (`engine/`):**
- `thiserror = "2"` is declared in `engine/Cargo.toml:16` but **never used** — no `#[derive(Error)]` or custom error enum exists anywhere in `engine/src/`. This is a dead dependency.
- The pipeline does not use `Result<T, E>` for domain errors. `run_pipeline(&EngineInput) -> EngineOutput` (`engine/src/pipeline.rs:20`) always returns a value; illegal/edge states are represented as **data**, not errors:
  - `Step6Output.warnings: Vec<Warning>` — validation problems (preterition, inofficiousness, disinheritance failure) become warnings attached to the output rather than propagated as `Err`.
  - `SuccessionType::IntestateByPreterition` and similar variants encode "the will was invalid, fall back to intestate" as a typed outcome, not an error.
- `unwrap()`/`expect()`/`panic!()` appear in source (highest concentration: `step5_legitimes.rs` has 40 occurrences, `step9_vacancy.rs` has 8, `step1_classify.rs` has 15) — used for internal invariants the authors believe cannot fail (e.g., converting a `BigInt` known to fit into `i64`), not for handling malformed input. New step code should follow this pattern: validate/normalize at the boundary (Step 1/6), then treat internal arithmetic as infallible.
- Fuzz/property tests (`engine/tests/fuzz_invariants.rs:53`, `engine/tests/zz_sweep.rs:197`) explicitly wrap `run_pipeline` in `std::panic::catch_unwind` because panics are an expected failure mode to detect, confirming the engine does not have a `Result`-based error channel.

**TypeScript (`frontend/`):**
- Supabase calls follow a uniform `{ data, error } = await supabase.X(...); if (error) throw error;` pattern — see `frontend/src/lib/auth.ts:5-8,11-17,21-23`. Every wrapper function in `lib/auth.ts`, and by convention other `lib/*.ts` Supabase wrappers, re-throws rather than swallowing errors.
- Zod (`EngineInputSchema.safeParse`) is used for input validation at the WASM boundary — see `frontend/src/wasm/bridge.ts:221-226` — failures are converted to a thrown `Error` with a joined message from `parseResult.error.issues`.
- No app-wide error boundary or centralized error-reporting utility was found; error handling is local to each call site.

## Comments

**Rust:**
- Every step module opens with a `//!` doc comment naming the spec section it implements (e.g. `engine/src/step6_validation.rs:1-14` cites "Spec §9 Testate Validation (Step 6)" and enumerates the five-check pipeline). New step/module code should link back to the spec section the same way — the spec (not inline prose) is the source of truth referenced throughout.
- Struct fields get one-line `///` doc comments describing the domain meaning (`engine/src/types.rs:20-27`), especially where units matter (`centavos` vs `Frac`).

**TypeScript:**
- Test files open with a block comment stating what stage/spec doc they correspond to and what "source of truth" they trace to, e.g. `frontend/src/wasm/__tests__/bridge.test.ts:1-9` ("Source of truth: engine-output.md ..."). New tests should include this provenance comment.
- No enforced JSDoc/TSDoc convention; documentation is prose comments above exported functions, inconsistently applied.

## Function Design

**Rust:** Each pipeline step exposes one `stepN_<verb>(&StepNInput) -> StepNOutput` entry point with a dedicated `StepNInput`/`StepNOutput` struct (see signatures imported in `engine/tests/integration.rs:9-19`). New pipeline stages should follow this Input-struct/Output-struct/one-function shape rather than adding parameters to existing functions.

**TypeScript:** Components take a single `props` object typed inline or via a named `<Component>Props` interface; hooks return a plain object of state + actions (see `useAuth` returning `{ user, loading, signIn, signUp, signOut }`, exercised in `frontend/src/hooks/__tests__/useAuth.test.tsx:36-38,108-112`).

## Module Design

**Rust:** `engine/src/lib.rs` re-exports the step modules; `pipeline.rs` is the only place that wires all ten steps together. Business rule constants and per-step types live inside each `stepN_*.rs` file rather than a shared `constants.rs`.

**TypeScript:**
- `frontend/src/schemas/index.ts` is a single barrel file holding every Zod schema (imported piecemeal by tests, e.g. `frontend/src/schemas/__tests__/schemas.test.ts:2-37`).
- `frontend/src/lib/estate-tax-engine/` is a self-contained sub-package with its own `index.ts`, `types.ts`, `pipeline.ts`, and per-rule modules (`amnesty.ts`, `spouse-share.ts`, `sec87-exclusions.ts`, etc.) plus its own `__tests__/`. New estate-tax rules should be added as a new module here plus a matching test file, following `pipeline.ts`'s composition of the smaller rule modules.
- `frontend/src/wasm/bridge.ts` is the single seam between the TypeScript app and the compiled Rust engine: `computeMock()` (synthetic, no WASM) and `computeWasm()` (real, requires the compiled `.wasm` binary) both exist, but the exported `compute()` (`frontend/src/wasm/bridge.ts:351-353`) **always delegates to `computeWasm()`** — the file's own header comment ("Falls back to computeMock() if WASM is not available", `frontend/src/wasm/bridge.ts:5`) is stale and does not match current behavior. Do not rely on that comment; `compute()` has no mock fallback today.

## How New Tests Are Conventionally Written Here

- **No shared fixture/factory module.** Every test file defines its own local `make*`/`build*` helper functions at the top (e.g. `makeDecedent`, `makePerson`, `makeInput` repeated near-identically in `frontend/src/wasm/__tests__/bridge.test.ts`, `frontend/src/wasm/__tests__/wasm-live.test.ts`, `frontend/src/__tests__/integration.test.tsx`, and the Rust equivalents `person()`/`decedent()` in `engine/tests/integration.rs:277-341`, `engine/tests/zz_probe.rs:9-79`, `engine/tests/zz_sweep.rs:10-65`). A new test file is expected to write its own minimal-valid-object builders rather than import shared ones — this is the dominant pattern, not an exception.
- **Rust unit tests live inline** at the bottom of the module they test, behind `#[cfg(test)] mod tests { use super::*; ... }` (every `stepN_*.rs` file, e.g. `engine/src/step1_classify.rs:237`). Cross-module/end-to-end behavior goes in `engine/tests/integration.rs` instead.
- **Rust integration tests are one function per spec test-vector**, named `test_tvNN_<description>`, that runs the full 10-step pipeline manually inline (not via `pipeline::run_pipeline`) and asserts against shared helper assertions `check_sum_invariant`, `check_adoption_equality`, `check_scenario_consistency` (`engine/tests/integration.rs:436-483`).
- **TypeScript unit tests for pure logic** (`lib/estate-tax-engine/__tests__/*.ts`, `schemas/__tests__/*.ts`, `types/__tests__/*.ts`) call exported functions directly with literal fixture objects, no mocking.
- **TypeScript component tests** use `@testing-library/react`'s `render`/`screen`/`fireEvent`/`waitFor`, mock only external boundaries (Supabase client, `lib/auth`) via `vi.mock(...)` at the top of the file (`frontend/src/hooks/__tests__/useAuth.test.tsx:9-15`), and otherwise render real component trees.
- **New tests belong next to what they test**: `src/<area>/__tests__/<name>.test.ts(x)`, mirroring the module's own directory, not a top-level `tests/` tree (the only top-level exception is `frontend/src/__tests__/` for app-shell-level smoke/router/integration tests).

---

*Convention analysis: 2026-07-27*
