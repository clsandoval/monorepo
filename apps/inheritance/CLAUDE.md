<!-- GSD:project-start source:PROJECT.md -->
## Project

**Inheritance — Verification-First Foundation**

A Philippine inheritance and estate-tax computation product for lawyers: a Rust succession engine (Civil Code Book III) compiled to WASM, a TypeScript NIRC estate-tax engine, and a React web app that walks a lawyer from family facts to per-heir peso amounts with citable narratives and a printable PDF.

This project is not about adding features to that product. It is about building the **verification foundation** underneath it — QA gates, test-case catalogs, screenshot-plus-vision checks, observability, and documentation — precise enough that a cheap model can grind against the plans for a month without supervision and land a working app. The trigger for doing it now: the owner has abundant time now and scarce recurring time later, and a lawyer collaborator (currently sitting the bar) is expected to join later in the year to drive real-world testing with friends and colleagues.

**Core Value:** **A change to this codebase must be cheap and safe to make** — meaning a passing gate set genuinely implies a working app, and a wrong legal number can never reach a lawyer silently.

Note the ordering this implies: correctness is not the top-line goal, *low cost of change* is. The owner explicitly does not expect everything to be correct by the time the collaborator arrives. He expects everything to be easy — observable, tested, documented, extendable. A correct app with no gates is worth less here than a partly-wrong app whose wrongness is loud and whose fixes are one plan away.

### Constraints

- **Timeline**: Roughly the rest of 2026 (from 2026-07-27), paced by scarce recurring owner attention. A month of slow autonomous implementation is acceptable; a stalled loop is not.
- **Executor model**: Implementation is delegated to a deliberately cheap model whose only job is to follow plans. Plans must therefore be closed-world — no step may require legal judgment, design taste, or a decision the plan does not already contain.
- **Loop durability**: The agent loop must not suffer context drift or scope narrowing over a long horizon. This is a first-class design constraint, not a nice-to-have, and it is what motivates fine phase granularity and per-phase verification.
- **Legal authority**: No agent may decide a contested point of Philippine law. Contested readings go to the lawyer review agenda; the engine records a decision rather than guessing.
- **Correctness domain**: Wrong output means a lawyer files a wrong pleading. Silent wrongness is categorically worse than loud failure, and this ranking governs every tradeoff.
- **Tech stack**: Rust + wasm-pack + WASM engine; React 19, TanStack Router, Vite, vitest, Tailwind; Supabase (Postgres, auth, RLS, storage). Established and not up for revision.
- **Repo**: Lives inside the `monorepo` worktree alongside an active auto-committer; planning files track to the outer repo.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- Rust (edition 2021) — succession engine, `apps/inheritance/engine/src/*.rs` (~15,676 LOC across 15 files; step1-step10 pipeline + `fraction.rs`, `types.rs`, `pipeline.rs`, `wasm.rs`)
- TypeScript / TSX — frontend, `apps/inheritance/frontend/src/` (~63,250 LOC), includes a second, independent estate-tax computation engine written entirely in TS at `apps/inheritance/frontend/src/lib/estate-tax-engine/` (14 modules + `__tests__/`)
- SQL (PL/pgSQL) — Supabase migrations, `apps/inheritance/frontend/supabase/migrations/*.sql` (9 files, largest is `010_rls_org_scope.sql` at 492 lines, defines RLS policies)
- Bash / Python — engine test-case generators, `apps/inheritance/engine/examples/generate-test-cases.sh`, `generate-fuzz-cases.py`, `generate-testate-cases.py`, `validate.py`, `validate-testate.py`
## Runtime
- Rust: `rustc 1.96.0` / `cargo 1.96.0` (installed via rustup, toolchain `stable-x86_64-unknown-linux-gnu`)
- Node.js: `v20.19.5` present; `npm 10.8.2` present
- No `.nvmrc` / `.node-version` file in `apps/inheritance/frontend/` — Node version is not pinned in-repo. CI (`.github/workflows/inheritance.yml`) explicitly installs `node-version: 20` via `actions/setup-node@v4`.
- **npm** is the actual package manager for the frontend: `apps/inheritance/frontend/package-lock.json` (460KB, committed) is present; no `pnpm-lock.yaml` or `yarn.lock` exists anywhere under `apps/inheritance/`.
- **Discrepancy:** `.github/workflows/inheritance.yml` installs `pnpm` globally (`npm install -g pnpm`) but the loop scripts it triggers never actually invoke `pnpm install` against this frontend in a way that matches the npm lockfile — the lockfile in the tree is npm's. Any gate that installs deps should use `npm ci` in `apps/inheritance/frontend/`, not pnpm.
- Rust: `Cargo.lock` is committed at `apps/inheritance/engine/Cargo.lock`.
| Artifact | Requires | Observed state in this tree |
|---|---|---|
| Rust engine native binary/tests (`cargo test`, `cargo build`) | `rustc`/`cargo` 1.96+, no extra target | **Works.** `engine/target/debug/` already has build artifacts from a prior native build. |
| Rust engine WASM binary (`inheritance_engine_bg.wasm`) | `rustup target add wasm32-unknown-unknown` + `wasm-pack` (installed via `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh` or `cargo install wasm-pack`) | **NOT built.** `rustup target list --installed` shows only `x86_64-unknown-linux-gnu` — `wasm32-unknown-unknown` is available to add but not installed. `wasm-pack` is **not installed** (`which wasm-pack` → not found). `apps/inheritance/frontend/src/wasm/pkg/` contains only the tracked glue files `inheritance_engine.js` and `inheritance_engine.d.ts` — **no `.wasm` binary file exists in that directory.** Any gate relying on real WASM output must run `rustup target add wasm32-unknown-unknown && cargo install wasm-pack && wasm-pack build --target web` inside `engine/` first. |
| Frontend dev/build/test (`npm run dev`/`build`/`test`) | Node 20, npm, `npm ci` in `frontend/` | **NOT runnable as-is.** `apps/inheritance/frontend/node_modules/` is **absent**. `npx tsc -b` fails with "This is not the tsc command you are looking for" (no local install, npx falls through). Must run `npm ci` (or `npm install`) in `frontend/` before any command works. |
| wasm-bindgen version pin | wasm-bindgen CLI bundled inside wasm-pack must match `Cargo.toml`/`Cargo.lock` version | `Cargo.lock` pins `wasm-bindgen = 0.2.114`. `engine/Cargo.toml` specifies `wasm-bindgen = "0.2"` (unpinned minor). A wasm-pack install with a mismatched bundled wasm-bindgen version will fail the build (documented risk in `loops/reverse/v2/analysis/wasm-export.md`). |
## Frameworks
- React 19.2.4 + ReactDOM 19.2.4 — `apps/inheritance/frontend/package.json`
- TanStack Router 1.163.3 (`@tanstack/react-router`, `@tanstack/router-devtools`) — file-based routes in `apps/inheritance/frontend/src/routes/`
- Tailwind CSS 4.2.1 via `@tailwindcss/vite` plugin — no separate `tailwind.config.js`, config is CSS-first (Tailwind v4 style)
- Radix UI (`radix-ui` 1.4.3) + `class-variance-authority` + shadcn CLI (`shadcn` 3.8.5, dev dep) for component generation — `apps/inheritance/frontend/components.json`
- Vitest 4.0.18 (frontend) — config `apps/inheritance/frontend/vitest.config.ts` (jsdom environment, setup file `src/test-setup.ts`, 10s test/hook timeout)
- `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 6.9.1, `@testing-library/user-event` 14.6.1
- Rust built-in test harness (`#[test]`) — 450 `#[test]` functions total across `engine/src/*.rs` (unit tests) + `engine/tests/integration.rs`, `zz_probe.rs`, `zz_sweep.rs`, `fuzz_invariants.rs`
- Vite 7.3.1 — `apps/inheritance/frontend/vite.config.ts`, plugins: `@tailwindcss/vite`, `@vitejs/plugin-react`, `vite-plugin-wasm`, `vite-plugin-top-level-await`; build target `esnext`; path alias `@` → `src/`
- TypeScript 5.9.3, `tsc -b` (project-references build, used as the typecheck step before `vite build`)
- `tsx` 4.21.0 — runs `scripts/generate-sitemap.ts` as a `postbuild` step (generates static `sitemap.xml` listing hardcoded marketing/blog routes with `BASE_URL = https://inheritance-frontend.fly.dev`)
- wasm-bindgen 0.2 (Rust side) + `vite-plugin-wasm` (frontend side) — glue layer between Rust and browser
## Key Dependencies
- `@supabase/supabase-js` 2.98.0 — sole backend client; all data access, auth, and storage go through this
- `num-rational` / `num-bigint` / `num-traits` / `num-integer` (Rust) — exact rational-number arithmetic for legitime/share fractions, no floating point in the succession engine (`engine/src/fraction.rs`, 512 LOC)
- `zod` 4.3.6 — runtime schema validation for `EngineInput`/forms, `apps/inheritance/frontend/src/schemas/`
- `react-hook-form` 7.71.2 + `@hookform/resolvers` 5.2.2 — all intake/wizard forms
- `@react-pdf/renderer` 4.3.2 — client-side PDF generation (distribution summary, tax computation, demand letter)
- `thiserror` 2 (Rust) — structured engine error types
- `serde` / `serde_json` (Rust) — JSON in/out across the WASM boundary (`compute_json` in `engine/src/wasm.rs`)
- `jszip` 3.10.1 — client-side zip bundling (likely for multi-document export)
- `react-d3-tree` 3.6.6 — family-tree visualization
- `recharts` 3.7.0 — charts (e.g. estate-tax sensitivity visualizations)
- `sonner` 2.0.7 — toast notifications
- `qrcode.react` 4.2.0 — QR codes for share links
## Configuration
- Vite env vars, prefixed `VITE_`, read via `import.meta.env` in `apps/inheritance/frontend/src/lib/supabase.ts`
- Example file: `apps/inheritance/frontend/.env.local.example` — lists:
- No `.env` file exists in the tree (only the `.example`); actual secrets are not present in this repo checkout.
- `supabaseConfigured` boolean guard in `src/lib/supabase.ts` — client is `null` if URL/key env vars are missing, and calling code must check this before use.
- `apps/inheritance/frontend/vite.config.ts`, `tsconfig.json` (strict mode, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, path alias `@/*` → `./src/*`), `vitest.config.ts`
- `apps/inheritance/frontend/components.json` — shadcn component generator config
- `apps/inheritance/engine/Cargo.toml` — `crate-type = ["cdylib", "rlib"]` (both required: `rlib` for `cargo test`, `cdylib` for `wasm-pack build`)
- No ESLint, Prettier, or Biome config anywhere in `apps/inheritance/frontend/` — **no lint tooling exists**, and `package.json` has no `lint` script.
## Platform Requirements
- Rust stable toolchain + `wasm32-unknown-unknown` target + `wasm-pack` (none of the WASM-specific pieces are currently installed in this environment)
- Node.js 20.x + npm (frontend `node_modules` must be installed fresh — currently absent)
- Local Supabase stack via Supabase CLI (`apps/inheritance/frontend/supabase/config.toml`, project id `"app"`, API port 54321, DB port 54322, Studio, Inbucket for local email testing)
- Frontend deployed as a static build served by nginx in a Docker container on Fly.io:
- Backend is Supabase-hosted (managed Postgres + Auth + Storage + Realtime), no separate application server — this is a pure client-side SPA talking directly to Supabase.
## Build/Test/Lint Commands — current working state
| Command | Where | What it does | Currently works in this tree? |
|---|---|---|---|
| `npm run dev` | `frontend/` | `vite` dev server | No — `node_modules` absent, needs `npm ci` first |
| `npm run build` | `frontend/` | `tsc -b && vite build`, then `postbuild` runs `tsx scripts/generate-sitemap.ts` | No — same reason; also needs the WASM `.wasm` binary present in `src/wasm/pkg/` for a real (non-mock) build, though Vite may still bundle if code only imports the glue JS without the binary present |
| `npm run test` | `frontend/` | `vitest run` | No — `node_modules` absent |
| `npm run test:watch` | `frontend/` | `vitest` watch mode | No — same |
| `npm run preview` | `frontend/` | `vite preview` (serves `dist/`) | No — requires prior successful build |
| *(no lint script)* | `frontend/` | — | N/A — no lint tooling configured |
| `cargo test` / `cargo test --lib` | `engine/` | Runs Rust unit + doc tests | **Yes — verified: 411 tests pass** (`cargo test --lib`) |
| `cargo test --test integration` | `engine/` | Runs `engine/tests/integration.rs` (TV-series scenario tests) | **Yes — verified: 30 tests pass** |
| `cargo build` / `cargo build --release` | `engine/` | Native build (`rlib`+`cdylib`, but no wasm target) | Yes — native debug artifacts already present in `engine/target/debug/` |
| `wasm-pack build --target web` | `engine/` | Produces `inheritance_engine_bg.wasm` + JS glue into `pkg/` (copy step needed to sync into `frontend/src/wasm/pkg/`) | **No — `wasm-pack` not installed, `wasm32-unknown-unknown` target not installed.** Must install both before this can run. |
| `bash examples/generate-test-cases.sh` | `engine/` | Builds release binary, generates/validates JSON test cases into `examples/cases/`, writes `examples/test-results.md` | Not verified in this pass; requires `cargo build --release` |
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Files: `stepN_<name>.rs`, one file per pipeline stage (`step1_classify.rs` … `step10_finalize.rs`), plus `types.rs`, `fraction.rs`, `pipeline.rs`, `wasm.rs`, `main.rs`, `lib.rs`.
- Types: `PascalCase` structs/enums (`EngineInput`, `HeirLegitime`, `ScenarioCode`).
- Functions: `snake_case`, verbish and step-scoped (`step6_validate_will`, `effective_category`, `run_pipeline`).
- Test functions: `test_<condition>` for unit tests (`test_legitimate_child_maps_to_lc_group`, `engine/src/step1_classify.rs:304`); integration tests use spec vector IDs `test_tv01_...` through `test_tv23_...` (`engine/tests/integration.rs:528`); ad hoc debugging tests use `probe_*` (`engine/tests/zz_probe.rs`) and `sweep_*` (`engine/tests/zz_sweep.rs`).
- Constants: `SCREAMING_SNAKE_CASE` module-level (e.g. `FUZZ_DIR` in `engine/tests/fuzz_invariants.rs:16`).
- Components: `PascalCase.tsx`, one component per file, colocated in feature folders (`components/wizard/PersonCard.tsx`, `components/results/ResultsView.tsx`).
- Non-component modules: `kebab-case.ts` (`lib/pdf-export.ts`, `lib/tax-bridge.ts`, `lib/case-notes.ts`) — this differs from component files, so a new file's casing depends on whether it exports a component.
- Hooks: `useX.ts`/`useX.tsx` in `hooks/` (`hooks/useAuth.ts`, `hooks/useAutoSave.ts`).
- Test files: always `<subject>.test.ts(x)` inside a sibling `__tests__/` directory (never colocated flat, never `.spec.`).
- Types/enums: `PascalCase` (`Relationship`, `ScenarioCode`, `EffectiveCategory`); label lookup maps are `SCREAMING_SNAKE_CASE` (`EFFECTIVE_CATEGORY_LABELS`, `WARNING_SEVERITY`, `RELATIONSHIP_OPTIONS`).
- Zod schemas: `<Type>Schema` suffix (`PersonSchema`, `EngineInputSchema`) in `frontend/src/schemas/index.ts`.
## Code Style
- No `.prettierrc*` anywhere in `frontend/`. No `rustfmt.toml` in `engine/`. Formatting is whatever each contributor's editor/agent produced — there is no enforced style and no CI step that checks it.
- No `eslint.config.*` or `.eslintrc*` in `frontend/` (confirmed absent; sibling apps in the monorepo such as `apps/daimon-saas` and `apps/maceda-calculator` do have `eslint.config.mjs`, so this is a gap specific to `apps/inheritance`, not a monorepo-wide choice).
- No `clippy.toml` in `engine/`. `cargo clippy` is not run anywhere in CI (`.github/workflows/inheritance.yml` has no lint step at all — see TESTING.md CI Reality).
- TypeScript compiler is the only enforced gate: `frontend/tsconfig.json` sets `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`, `"noUncheckedIndexedAccess": true`, `"noFallthroughCasesInSwitch": true`. The build script (`frontend/package.json:7`, `"build": "tsc -b && vite build"`) is the de facto type-check gate, but it is not invoked by any CI workflow either (see TESTING.md).
## Import Organization
- `@/*` → `frontend/src/*`, configured in both `frontend/tsconfig.json:18-20` and `frontend/vitest.config.ts:8-10` (must be kept in sync manually — no shared config file).
- `use` blocks: external crates first (`num_bigint`, `serde`), then `crate::` internal modules, no blank-line grouping enforced but generally followed (`engine/src/step6_validation.rs:17-19`).
## Error Handling
- `thiserror = "2"` is declared in `engine/Cargo.toml:16` but **never used** — no `#[derive(Error)]` or custom error enum exists anywhere in `engine/src/`. This is a dead dependency.
- The pipeline does not use `Result<T, E>` for domain errors. `run_pipeline(&EngineInput) -> EngineOutput` (`engine/src/pipeline.rs:20`) always returns a value; illegal/edge states are represented as **data**, not errors:
- `unwrap()`/`expect()`/`panic!()` appear in source (highest concentration: `step5_legitimes.rs` has 40 occurrences, `step9_vacancy.rs` has 8, `step1_classify.rs` has 15) — used for internal invariants the authors believe cannot fail (e.g., converting a `BigInt` known to fit into `i64`), not for handling malformed input. New step code should follow this pattern: validate/normalize at the boundary (Step 1/6), then treat internal arithmetic as infallible.
- Fuzz/property tests (`engine/tests/fuzz_invariants.rs:53`, `engine/tests/zz_sweep.rs:197`) explicitly wrap `run_pipeline` in `std::panic::catch_unwind` because panics are an expected failure mode to detect, confirming the engine does not have a `Result`-based error channel.
- Supabase calls follow a uniform `{ data, error } = await supabase.X(...); if (error) throw error;` pattern — see `frontend/src/lib/auth.ts:5-8,11-17,21-23`. Every wrapper function in `lib/auth.ts`, and by convention other `lib/*.ts` Supabase wrappers, re-throws rather than swallowing errors.
- Zod (`EngineInputSchema.safeParse`) is used for input validation at the WASM boundary — see `frontend/src/wasm/bridge.ts:221-226` — failures are converted to a thrown `Error` with a joined message from `parseResult.error.issues`.
- No app-wide error boundary or centralized error-reporting utility was found; error handling is local to each call site.
## Comments
- Every step module opens with a `//!` doc comment naming the spec section it implements (e.g. `engine/src/step6_validation.rs:1-14` cites "Spec §9 Testate Validation (Step 6)" and enumerates the five-check pipeline). New step/module code should link back to the spec section the same way — the spec (not inline prose) is the source of truth referenced throughout.
- Struct fields get one-line `///` doc comments describing the domain meaning (`engine/src/types.rs:20-27`), especially where units matter (`centavos` vs `Frac`).
- Test files open with a block comment stating what stage/spec doc they correspond to and what "source of truth" they trace to, e.g. `frontend/src/wasm/__tests__/bridge.test.ts:1-9` ("Source of truth: engine-output.md ..."). New tests should include this provenance comment.
- No enforced JSDoc/TSDoc convention; documentation is prose comments above exported functions, inconsistently applied.
## Function Design
## Module Design
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
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## System Overview
```text
```
## Component Responsibilities
| Component | Responsibility | File |
|-----------|----------------|------|
| Router | Declares all routes, auth context shape | `frontend/src/router.ts` |
| Root layout | Picks layout (sidebar app shell / minimal / auth-centered) by pathname | `frontend/src/routes/__root.tsx` |
| App shell | Sidebar nav, mobile drawer, sign-in/out | `frontend/src/components/layout/AppLayout.tsx` |
| Case editor page | Orchestrates wizard → compute → results state machine for inheritance | `frontend/src/routes/cases/$caseId.tsx` |
| Estate tax page | Orchestrates tax wizard → compute → results + auto-bridge to succession engine | `frontend/src/routes/cases/$caseId.tax.tsx` |
| Inheritance wizard | 6-step react-hook-form wizard producing `EngineInput` | `frontend/src/components/wizard/WizardContainer.tsx` |
| Estate tax wizard | 8-tab form producing `EstateTaxWizardState` | `frontend/src/components/tax/EstateTaxWizard.tsx` |
| Guided intake | 7-step pre-wizard intake that creates client + case rows | `frontend/src/components/intake/GuidedIntakeForm.tsx` |
| WASM bridge | Marshals JSON across the WASM boundary, mock scenario predictor | `frontend/src/wasm/bridge.ts` |
| Succession pipeline (Rust) | 10-step orchestration of the succession computation | `engine/src/pipeline.rs` |
| Tax pipeline (TS) | 14-phase orchestration of the estate-tax computation | `frontend/src/lib/estate-tax-engine/pipeline.ts` |
| Tax bridge | Converts tax output → net estate, re-runs succession engine | `frontend/src/lib/tax-bridge.ts` |
| Results view | Renders `EngineOutput` (distribution, narratives, warnings, log) | `frontend/src/components/results/ResultsView.tsx` |
| Actions bar | Export JSON, export PDF, copy narratives, share toggle | `frontend/src/components/results/ActionsBar.tsx` |
| PDF export | Lazy-loads `@react-pdf/renderer`, builds downloadable blob | `frontend/src/lib/pdf-export.ts` |
| Share view | Public read-only case view via RPC token lookup | `frontend/src/routes/share/$token.tsx`, `frontend/src/lib/share.ts` |
| Cases data access | CRUD for the `cases` table (`input_json`/`output_json`/`tax_*_json`) | `frontend/src/lib/cases.ts` |
| Auth | Supabase auth session subscription | `frontend/src/hooks/useAuth.ts`, `frontend/src/lib/auth.ts` |
| Organization/org membership | Org + members + role permissions | `frontend/src/hooks/useOrganization.ts`, `frontend/src/lib/organizations.ts` |
| Firm profile | Letterhead/branding used in PDFs, React context | `frontend/src/contexts/FirmProfileContext.tsx` |
| Auto-save | Debounced (1.5s) autosave of wizard input to `cases.input_json` | `frontend/src/hooks/useAutoSave.ts` |
| Quick calc widget | Public/anonymous single-shot calculator on the landing page, gated after first use | `frontend/src/components/quick-calc/QuickCalcWidget.tsx` |
## Pattern Overview
- Two engines, two paradigms: Rust pipeline (steps 1–10, `BigRational` fractions, banker's rounding at the very end) vs. TypeScript pipeline (14 phases, plain `number` centavos throughout, no fraction type).
- Route-driven page-level state machines (`type PageState = 'loading' | 'wizard' | 'computing' | 'results' | 'error'`) rather than a global app store.
- Forms are the primary state container (`react-hook-form` for the inheritance wizard, manual `useState` object for the tax wizard and intake form) — there is no Redux/Zustand/Jotai.
- Persistence is "save the whole JSON blob" — `cases.input_json`, `cases.output_json`, `cases.tax_input_json`, `cases.tax_output_json`, `cases.comparison_input_json/output_json` are JSONB columns, not normalized tables. The wizard's shape *is* the DB schema.
- Auth/authorization is entirely RLS-based (`org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())`), not enforced in application code beyond route-level `beforeLoad` redirects.
## Layers
- Purpose: URL → page component mapping, auth guards, search-param parsing.
- Location: `frontend/src/routes/`
- Contains: One file per route, each exporting a `createRoute(...)` object; `router.ts` assembles the tree.
- Depends on: hooks (`useAuth`, `useOrganization`), lib data-access modules, top-level feature components (wizard, tax wizard, results).
- Used by: `frontend/src/router.ts` → `frontend/src/main.tsx`.
- Purpose: Multi-step forms and result renderers (the actual UI logic).
- Location: `frontend/src/components/{wizard,tax,intake,results,case,settings,quick-calc}/`
- Contains: Step/tab components, presentational sub-components, `__tests__/` co-located.
- Depends on: `frontend/src/hooks/`, `frontend/src/lib/`, `frontend/src/types/`, `frontend/src/components/ui/` (shadcn primitives).
- Used by: route layer.
- Purpose: All Supabase reads/writes, PDF/zip export, the standalone estate-tax engine, the tax bridge.
- Location: `frontend/src/lib/`
- Contains: One module per resource (`cases.ts`, `organizations.ts`, `share.ts`, `deadlines.ts`, `case-notes.ts`, `documents.ts`, `firm-profile.ts`, `conflict-check.ts`, `intake.ts`), plus the self-contained `estate-tax-engine/` subpackage.
- Depends on: `frontend/src/lib/supabase.ts` (the one Supabase client instance), `frontend/src/types/`.
- Used by: hooks and route/feature components.
- Purpose: Pure functions transforming input → output; no side effects, no I/O.
- Location: `engine/src/` (Rust, compiled to `frontend/src/wasm/pkg/`) and `frontend/src/lib/estate-tax-engine/` (TypeScript).
- Depends on: nothing outside itself (Rust engine has zero Supabase/React knowledge; TS tax engine same).
- Used by: `frontend/src/wasm/bridge.ts` (succession) and `frontend/src/routes/cases/$caseId.tax.tsx` (tax, called directly, no bridge needed since it's already JS).
- Purpose: Row storage, RLS-enforced multi-tenancy, RPC for anonymous share access.
- Location: `frontend/supabase/migrations/`
- Contains: `001_initial_schema.sql` (core tables) through `012_pdf_storage.sql`.
## Data Flow
### Primary Request Path — new inheritance case
### Estate Tax → Bridge → Succession Re-run
### Money Units Flow (repeated bug source — verify at every hop)
```text
```
- `Money.centavos` is typed `number | string` on the TS side (`frontend/src/types/index.ts:238`) — any code path that does `Number(centavos)` instead of using `BigInt`/`parseInt` string-safe helpers risks silent precision loss for estates > ~₱90 trillion in centavos (`Number.MAX_SAFE_INTEGER`). Grep for `parseInt(.*centavos` and `.centavos as number` when writing gates.
- The tax engine and succession engine represent money **structurally differently**: succession engine wraps in `{ centavos }` (`Money` type); tax engine uses bare `number` fields with a `// centavos` comment convention — no shared `Money` type. A gate should assert the *bridge* (`tax-bridge.ts`) never silently coerces `undefined`/`NaN` into `0`.
- `runCompute()` in `frontend/src/routes/cases/$caseId.tax.tsx` treats `item40_gross_estate === 0 && tax_due === 0` as "no assets entered" and **skips the bridge** — a gate should verify this heuristic doesn't also skip legitimate ₱0-tax-but-nonzero-estate scenarios (e.g., fully-deducted small estates).
- `computeMock()`'s scenario predictor in `frontend/src/wasm/bridge.ts` is a **hand-duplicated copy** of `engine/src/step3_scenario.rs` (comment: "Mirrors step3_scenario.rs:52-235 exactly") used only as a fallback/mock path — if the Rust logic changes without updating this TS copy, `computeMock()` silently diverges from the real engine. `computeMock` is not on the primary path (`compute()` always calls `computeWasm()`), but any test or fallback exercising it is at risk.
## Key Abstractions
- Purpose: The entire wire format across the WASM boundary; also the shape persisted in `cases.input_json`/`output_json`.
- Examples: `frontend/src/types/index.ts` (TS side), `engine/src/types.rs` (Rust side, `#[derive(Serialize, Deserialize)]`).
- Pattern: Both sides must serialize/deserialize identically via `serde_json`/`JSON.stringify`; there is no schema codegen — the two type definitions are hand-kept in sync.
- Purpose: The only monetary value shape in the succession engine.
- Examples: `frontend/src/types/index.ts:237`, `engine/src/types.rs:27`.
- Pattern: BigInt on Rust side (arbitrary precision), `number | string` on TS side (string escape hatch for values beyond `Number.MAX_SAFE_INTEGER`).
- Purpose: Exact rational arithmetic (`num_rational::BigRational`) so that legitime fractions (e.g., 1/2, 1/3, 2/9) never lose precision across Steps 1–9; only converted to centavos once, at the very end.
- Examples: `engine/src/fraction.rs`.
- Pattern: `money_to_frac()` at pipeline entry, `frac_to_centavos()` (banker's rounding + largest-remainder distribution) only in `step10_finalize.rs`.
- Purpose: Wire format for the TS tax engine; persisted in `cases.tax_input_json`/`tax_output_json`.
- Examples: `frontend/src/types/estate-tax.ts`, `frontend/src/lib/estate-tax-engine/types.ts`.
- Pattern: No Rust equivalent exists — this engine is TS-only, plain `number` centavos, no `Frac`-equivalent (rounding happens ad hoc per phase).
- Purpose: Explicit phase modeling for async compute flows (`loading` → `wizard`/`computing` → `results`/`error`).
- Examples: `frontend/src/routes/cases/$caseId.tsx:607-612`.
- Pattern: Discriminated union on `phase`, no external state library; each route component owns its own instance.
- Purpose: Declarative step lists driving both the stepper UI and validation gating.
- Examples: `frontend/src/components/wizard/WizardContainer.tsx:19-26` (6 steps, `will` conditional on `hasWill`), `frontend/src/types/estate-tax.ts` (`TAB_NAMES`, 8 tabs), `frontend/src/types/intake.ts` (`INTAKE_STEPS`, 7 steps).
- Pattern: Array of `{ key, label, conditional? }`, filtered per-render into `visibleSteps`; step index is local `useState`, not encoded in the URL.
## Entry Points
- `/cases` — `frontend/src/routes/cases/index.tsx` — case list.
- `/cases/new` — `frontend/src/routes/cases/new.tsx` — guided intake → new case.
- `/cases/$caseId` — `frontend/src/routes/cases/$caseId.tsx` — inheritance wizard/results state machine.
- `/cases/$caseId/tax` — `frontend/src/routes/cases/$caseId.tax.tsx` — estate tax wizard/results.
- `/` — `frontend/src/routes/index.tsx` — dashboard if signed in, marketing hero + `QuickCalcWidget` if not.
- `/settings` — `frontend/src/routes/settings/index.tsx` — firm profile, logo, brand colors.
- `/settings/team` — `frontend/src/routes/settings/team.tsx` — team members, invites, seat usage.
- `/auth` — `frontend/src/routes/auth.tsx` — sign in/sign up, redirects to `/` if already authenticated.
- `/auth/callback` — `frontend/src/routes/auth/callback.tsx`.
- `/auth/reset` — `frontend/src/routes/auth/reset.tsx`.
- `/auth/reset-confirm` — `frontend/src/routes/auth/reset-confirm.tsx`.
- `/onboarding` — `frontend/src/routes/onboarding.tsx` — post-signup firm creation (3-step: firm → profile → done); component-level redirect to `/auth` if unauthenticated, to `/` if already onboarded (has an org).
- `/invite/$token` — `frontend/src/routes/invite/$token.tsx` — accepts an org invitation, redirects to `/settings/team`.
- `/share/$token` — `frontend/src/routes/share/$token.tsx` — anonymous read-only case view via `get_shared_case` Postgres RPC (bypasses RLS org-scoping by design).
- `/intestate-succession-calculator`, `/legitimate-share-calculator`, `/spouse-and-children-inheritance`, `/illegitimate-child-inheritance`, `/parents-inheritance-share`, `/no-will-inheritance-philippines` — `frontend/src/routes/landing/*.tsx`.
- `/blog`, `/blog/intestate-vs-testate`, `/blog/how-to-compute-legitime`, `/blog/illegitimate-children-rights`, `/blog/no-will-philippines`, `/blog/preterition-explained`, `/blog/parents-inheritance-share` — `frontend/src/routes/blog/*.tsx`. Rendered without sidebar only when `!user`; with sidebar (`AppLayout`) when signed in.
## The WASM Boundary
- Rust crate `engine/` (`engine/Cargo.toml`, `crate-type = ["cdylib", "rlib"]`) compiled via `wasm-bindgen`/`wasm-pack` into `frontend/src/wasm/pkg/inheritance_engine.js` + `inheritance_engine_bg.wasm`, checked into the repo (generated artifact, not hand-written).
- Vite config (`frontend/vite.config.ts`) uses `vite-plugin-wasm` to load `.wasm` in the browser.
- `frontend/src/wasm/bridge.ts` → `ensureWasmInitialized()`: in Node/Vitest, reads the `.wasm` file synchronously via `fs.readFileSync` + `initSync`; in the browser, uses async `initAsync()` (fetch). Initialized once per session (`wasmInitialized` module-level flag).
- `engine/src/wasm.rs`: `#[wasm_bindgen] pub fn compute_json(input: &str) -> Result<String, JsValue>` — parses `EngineInput` via `serde_json::from_str`, runs `run_pipeline()`, serializes `EngineOutput` via `serde_json::to_string`. Parse/serialize errors become `JsValue` strings, not typed error objects.
- `frontend/src/wasm/bridge.ts`: `computeWasm(input)` does `JSON.stringify(input)` → `compute_json()` → `JSON.parse(resultJson)`. No runtime schema validation of the *output* — the Rust side is trusted; only the *input* is validated pre-flight (see below).
- Public entry point: `export async function compute(input: EngineInput): Promise<EngineOutput>` (`frontend/src/wasm/bridge.ts:351`) — currently a straight passthrough to `computeWasm`; `computeMock()` (schema-validated synthetic equal-split output) exists in the same file but is not wired into `compute()`.
- `EngineInputSchema.safeParse(input)` (Zod, `frontend/src/schemas/index.ts`) is run inside `computeMock()` only — the real `compute()`/`computeWasm()` path does **not** run Zod validation before calling into WASM. Malformed input can reach Rust; Rust's `serde_json::from_str` will reject it with a parse error surfaced as a rejected promise.
- `frontend/src/routes/cases/$caseId.tsx` `handleSubmit()`: wraps `compute(data)` in `Promise.race` against a 30s timeout; catches into `PageState = { phase: 'error', message }`, rendered as a destructive `Alert` with a "Back to Editor" button.
- `frontend/src/routes/cases/$caseId.tax.tsx`: tax computation (`computeEstateTax`) is synchronous and throws are caught around `handleCompute`/`handleApply`/`handleRevert`, surfaced via `sonner` `toast.error(...)`, not a full-page error state — the wizard remains visible.
- No global error boundary was found in `frontend/src/main.tsx` or `router.ts` — an uncaught throw inside a route component (e.g., a WASM panic) would hit React's default unhandled-error behavior (blank screen), not a graceful fallback. This is a gap for verification design: a screenshot gate that induces a WASM panic should assert *some* visible page, not just absence of a crash overlay.
## State Boundaries and Seeding Seams
| State | Lives in | Seed mechanism | File |
|---|---|---|---|
| Auth session | Supabase Auth (JWT in browser storage, managed by supabase-js) | Sign in via Supabase Admin API / test user, or directly set `supabase.auth.setSession()` before render | `frontend/src/lib/supabase.ts`, `frontend/src/hooks/useAuth.ts` |
| Router auth context | `RouterProvider context={{ auth: { user } }}` | Set at `main.tsx` render time from the Supabase session; not independently overridable without controlling the session | `frontend/src/main.tsx` |
| Org membership / role | `organizations` + `organization_members` rows | Insert rows directly via Supabase service-role client (test fixture), or `createOrganization()` / `acceptInvitation()` | `frontend/src/lib/organizations.ts`, migration `frontend/supabase/migrations/001_initial_schema.sql` |
| Case inheritance input/output | `cases.input_json` / `cases.output_json` (JSONB) | Insert/update the row directly (fastest seam — bypasses the entire wizard) | `frontend/src/lib/cases.ts` (`createCase`, `updateCaseInput`, `updateCaseOutput`) |
| Case tax input/output | `cases.tax_input_json` / `tax_output_json` (JSONB) | Insert/update the row directly | `frontend/src/lib/cases.ts` (`updateCaseTaxInput`), `frontend/src/lib/tax-bridge.ts` (`saveTaxOutput`) |
| Case comparison data | `cases.comparison_input_json` / `comparison_output_json` / `comparison_ran_at` | Insert/update directly | `frontend/src/lib/comparison.ts`, migration `001_initial_schema.sql` |
| Share link state | `cases.share_token` (UUID, default generated) / `cases.share_enabled` (bool) | Set `share_enabled = true` directly, then navigate to `/share/$token` with the known token — no need to click the ShareDialog | `frontend/src/lib/share.ts`, `frontend/src/components/case/ShareDialog.tsx` |
| Wizard in-progress form state (inheritance) | `react-hook-form` in-memory state, seeded via `defaultValues` prop | Pass `EngineInput` (partial) as `defaultValues` — in practice this is whatever `cases.input_json` currently holds, so seeding the row seeds the wizard | `frontend/src/components/wizard/WizardContainer.tsx:76-84` |
| Wizard current step index | Local `useState<number>` inside `WizardContainer`/`EstateTaxWizard`/`GuidedIntakeForm` | **Not URL-encoded** — cannot deep-link to "step 3"; must click Next, or mount the component with custom test harness state | `frontend/src/components/wizard/WizardContainer.tsx`, `frontend/src/components/tax/EstateTaxWizard.tsx` |
| Guided intake draft (pre-case-creation) | `localStorage['inheritance-intake-draft']` | Set this key directly before loading `/cases/new` to resume mid-intake | `frontend/src/components/intake/GuidedIntakeForm.tsx:23,41-51` |
| Quick-calc anonymous gate | `sessionStorage['quick-calc-used']` (session-scoped, not localStorage — verify key name in `frontend/src/components/quick-calc/QuickCalcWidget.tsx` at use-site, constant name is `SESSION_KEY`) | Clear/set this key to force gated vs. ungated first-visit state on `/` | `frontend/src/components/quick-calc/QuickCalcWidget.tsx:14` |
| Firm profile / branding | `user_profiles` row (letterhead color, logo, counsel info) | Insert/update row directly, or via `FirmProfileProvider` context which wraps `/settings` | `frontend/src/contexts/FirmProfileContext.tsx`, `frontend/src/lib/firm-profile.ts` |
| Route param state | URL path segments (`$caseId`, `$token`) | Navigate directly to the URL with a known ID/token — no click-through needed for case/tax/share/invite pages | `frontend/src/router.ts`, individual route files |
| Search param state (auth mode/redirect) | URL query string (`?mode=signup&redirect=/cases`) | Navigate directly with query params — `authRoute.validateSearch` | `frontend/src/routes/auth.tsx:180-183` |
| Onboarding step | Local `useState<OnboardingStep>` (`'firm' | 'profile' | 'done'`) | Not URL-encoded; seed by controlling whether an org already exists for the signed-in user (no org → step 'firm' shown; org exists → auto-redirect away from `/onboarding` entirely) | `frontend/src/routes/onboarding.tsx` |
## Architectural Constraints
- **Threading:** Single-threaded JS main thread for everything, including the "second engine" (TS estate-tax pipeline runs synchronously and can block the main thread on large inputs — no Web Worker offload observed). The Rust engine executes inside the same main thread via WASM (no worker either) — `compute()` is `async` only because of the WASM init fetch, not because computation is off-thread.
- **Global state:** `wasmInitialized` boolean is a module-level singleton in `frontend/src/wasm/bridge.ts` — once true, `ensureWasmInitialized()` is a no-op for the rest of the page session. The single `supabase` client (`frontend/src/lib/supabase.ts`) is a module-level singleton shared by every `lib/*.ts` module and hook.
- **No shared `Money` type across engines:** the succession engine's `Money { centavos }` wrapper type does not exist in the estate-tax engine, which uses bare `number` fields annotated only by comments (`// centavos`). Any future refactor unifying the two engines must reconcile this.
- **Two independently-versioned business-rule implementations of scenario prediction:** `engine/src/step3_scenario.rs` (source of truth) and its hand-copy in `frontend/src/wasm/bridge.ts` (`predictScenario`, used only by the unused `computeMock`). Not currently a runtime risk since `compute()` bypasses `computeMock`, but a latent trap if `computeMock` is ever re-wired.
- **JSONB-as-schema:** `cases.input_json`/`output_json`/`tax_input_json`/`tax_output_json` have no Postgres-level shape constraints (JSONB, no CHECK on structure) — all shape enforcement is client-side TypeScript types + the Rust `serde` deserializer. A malformed row inserted directly (e.g., by a test fixture) will not be caught until read back into the wizard or engine.
## Anti-Patterns
### Auth guard inconsistency across routes
### Duplicated business logic across the WASM boundary
### Orphaned top-level component
## Error Handling
- Route-level async operations set an explicit `phase: 'error'` state member with a human-readable `message` (`frontend/src/routes/cases/$caseId.tsx`, `frontend/src/routes/cases/$caseId.tax.tsx`).
- Non-critical background operations (bridge re-compute, deadline refresh, notes fetch) fail silently with `.catch(() => {})` or a toast, never crashing the primary view — see `handleApply`/`handleRevert` in `$caseId.tax.tsx` and `useEffect(() => { listNotes(caseId).then(...).catch(() => {}) })` in `$caseId.tsx`.
- Supabase errors are thrown as-is (`if (error) throw error`) from every `lib/*.ts` function; callers decide how to surface them.
- Auth errors are mapped to friendlier copy via a lookup table (`SUPABASE_ERROR_MAP`, `frontend/src/routes/auth.tsx:187-193`).
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

## Loop invariants

Three rules an implementing agent must not violate. Each names the command that enforces it, so none
of them depends on an agent remembering to be careful.

1. **Commit scope.** Every commit stages explicit paths. `git add -A`, `git add .` and
   `git commit -a` are prohibited, because a concurrent auto-committer runs on this monorepo and a
   broad stage absorbs its in-flight work — or lets its next commit absorb yours. Commit with
   `bash scripts/safe-commit.sh -m "<message>" <path> ...`. Enforced by
   `node scripts/check-commit-discipline.mjs`, which fails on any commit mixing `apps/inheritance/`
   with paths outside it.
2. **Gate immutability.** The gate set in `gates.manifest.json` may only grow. Removing a gate,
   changing a locked command string, or setting a blocking gate non-blocking requires owner action,
   never agent action. Enforced by `node scripts/check-gate-manifest.mjs`; see `GATES.md`.
3. **Halt over guess.** When a gate cannot run, when a plan does not contain a decision the task
   needs, or when any point of Philippine law arises, stop and report **BLOCKED** with the real,
   pasted command output. Do not guess, and do not pick whichever reading looks defensible. See
   `.planning/PLAN-STANDARD.md` for the report format and where a legal question is recorded.

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
