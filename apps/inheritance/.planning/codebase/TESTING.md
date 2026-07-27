# Testing Patterns

**Analysis Date:** 2026-07-27

This document is an evidence-based inventory for a verification-first QA design effort. Every claim below was checked by reading the file or running the command shown — nothing here is inferred from file names alone.

## Framework

**Rust (`engine/`):**
- Runner: built-in `cargo test` (no `nextest`, no `proptest`/`quickcheck` crate — "fuzz" and "sweep" tests are hand-rolled loops, not a property-testing library).
- No test framework config file; behavior is Cargo defaults.
- Run: `cd engine && cargo test`

**TypeScript (`frontend/`):**
- Runner: Vitest `^4.0.18` (`frontend/package.json:52`), config at `frontend/vitest.config.ts`.
- DOM: `jsdom ^28.1.0`, `environment: 'jsdom'` (`frontend/vitest.config.ts:12`).
- Component testing: `@testing-library/react ^16.3.2`, `@testing-library/jest-dom ^6.9.1`, `@testing-library/user-event ^14.6.1`.
- Setup file: `frontend/src/test-setup.ts` — imports `@testing-library/jest-dom/vitest` and patches `navigator.clipboard` to be writable in jsdom (only global setup; no MSW, no global fetch mock, no server).
- Run commands: `npm test` → `vitest run` (`frontend/package.json:8`); `npm run test:watch` → `vitest` (`frontend/package.json:9`). No `--coverage` script defined; no coverage tool (`@vitest/coverage-v8`/`istanbul`) is a devDependency at all.
- `@vitest/browser-playwright@4.0.18` appears in `frontend/package-lock.json:12363` but only as vitest's own optional peer dependency — there is no `test.browser` block in `frontend/vitest.config.ts` and no other reference to it anywhere in the repo. **It is not wired up; it does not mean Playwright-based browser testing exists.**

## Runnability Status (observed, not assumed)

**Rust — actually run in this environment:**
```
cd engine && cargo test
```
Result: **411 + 0 + 1 + 30 + 7 + 1 + 0(doctests) = 450 tests, all passing**, broken down by binary:
| Binary | Tests | Result |
|---|---|---|
| `unittests src/lib.rs` (inline `#[cfg(test)]` across all `stepN_*.rs` + `fraction.rs`) | 411 | ok |
| `unittests src/main.rs` | 0 | ok (no tests in the CLI binary) |
| `tests/fuzz_invariants.rs` | 1 | ok (0.06s) |
| `tests/integration.rs` | 30 | ok |
| `tests/zz_probe.rs` | 7 | ok |
| `tests/zz_sweep.rs` | 1 | ok (3.14s) |
| Doc-tests | 0 | ok |

The whole `cargo test` suite passes on a clean checkout (Rust toolchain: `cargo 1.96.0`, `rustc 1.96.0`, both present on this machine). This is the **only** part of the QA surface that is currently, verifiably green.

**TypeScript — cannot be run in this environment, confirmed:**
- `frontend/node_modules/` does not exist (`ls frontend/node_modules` → "No such file or directory"). `npm test` cannot execute without `npm install` first.
- The compiled WASM artifact is missing: `frontend/src/wasm/pkg/` contains only `inheritance_engine.d.ts` and `inheritance_engine.js` (the wasm-bindgen JS glue). **`inheritance_engine_bg.wasm` does not exist in the tree.** It is produced by `apps/inheritance/loops/forward/wasm/build-wasm.sh:10` (`wasm-pack build --target web --out-dir pkg`) and is not committed or built as part of any checked-in step.
- Consequence: any test that calls the real engine will fail at the `readFileSync(wasmPath)` call inside `ensureWasmInitialized()` (`frontend/src/wasm/bridge.ts:325-331`) — an `ENOENT`, thrown on the **first `await compute(...)`/`await computeWasm(...)` call inside a test**, not at module import and not at an assertion. This affects, at minimum: `frontend/src/wasm/__tests__/wasm-real.test.ts`, `wasm-live.test.ts`, `conformance.test.ts`, `scenario-coverage.test.ts` (these do their own `readFileSync` of the same missing path in a `beforeAll`, e.g. `frontend/src/wasm/__tests__/scenario-coverage.test.ts:27-31`), `bridge.test.ts` (862 lines — every one of its ~90 `await compute(input)` call sites), and the app-level `frontend/src/__tests__/integration.test.tsx` (imports `compute` from `../wasm/bridge` at line 10 and calls it directly on real inputs).
- Net effect: a large fraction of the "engine correctness as seen from the frontend" test surface is **not exercisable at all** in a fresh checkout without first running the wasm-pack build. This is not a hypothetical — it is the current state of this exact tree.

## CI Reality

Only one workflow in the monorepo touches this app: `/home/clsandoval/cs/monorepo/.github/workflows/inheritance.yml` ("Inheritance Forward Loops").

- **Trigger:** `workflow_dispatch` only (manual, with a `loop` input defaulting to `"all"`). **There is no `push` or `pull_request` trigger.** Nothing runs tests automatically on commit or PR.
- **What it does:** discovers active "forward loop" entries in `apps/inheritance/loops/_registry.yaml`, then for each one runs a matrix job that repeatedly invokes `claude --model claude-opus-4-6 --print --dangerously-skip-permissions` against `PROMPT.md` in a loop directory (`inheritance.yml:117-119`), auto-committing and pushing whatever the agent produces, until a `status/converged.txt` marker appears or 3 consecutive failures occur.
- **Test commands present in this workflow: none.** There is no `cargo test`, `npm test`, `npm run build`, `npm ci`, or `wasm-pack build` invocation anywhere in `inheritance.yml`, even though it installs the Rust toolchain, `wasm-pack`, Node 20, and `pnpm` as setup steps (`inheritance.yml:66-80`) — those tools are installed for the *agent* to use inside its own loop iterations, not run by the workflow itself as a gate.
- **Conclusion: no CI gate exists today that runs any test in this app on any trigger.** Whatever testing happens is either done ad hoc by a developer/agent locally, or not done at all before merge. If "all gates pass ⇒ the app works" is the goal, the gates first have to be created — none currently run automatically.

## Fixture and Seeding Story

**Rust engine fixtures (`engine/examples/`):**
- `examples/cases/` — 20 JSON files, intestate scenario vectors, driven by `examples/generate-test-cases.sh` and validated with `examples/validate.py` (Python, outside the Rust test run).
- `examples/testate-cases/` — 20 JSON files, generated by `examples/generate-testate-cases.py`, validated by `examples/validate-testate.py`.
- `examples/fuzz-cases/` — 100 JSON files, generated by `examples/generate-fuzz-cases.py`; these are the only fixtures actually consumed by a Rust test (`engine/tests/fuzz_invariants.rs:16-30` reads every `.json` in this directory). The `cases/` and `testate-cases/` directories are **not read by any `#[test]`** — they exist for the standalone Python validators and for manual/agent inspection, not for `cargo test`.
- `examples/simple-intestate.json` — single hand-written example, not referenced by any test.
- No factory/builder crate; every Rust test file defines its own local `person()`/`decedent()`/`will_of()` helpers (see CONVENTIONS.md).

**TypeScript fixtures:**
- No `fixtures/` directory, no `*.fixture.ts`, no shared factory module exists anywhere under `frontend/src`. Every one of the 110 test files builds its own inline `make*`/`build*`/`valid*()` helper objects (e.g. `frontend/src/lib/__tests__/pdf-export.test.ts:20-70`, `frontend/src/schemas/__tests__/schemas.test.ts:44-58`).

**Supabase / database:**
- `frontend/supabase/config.toml` exists — a real local-Supabase-CLI config (Postgres 17, API port 54321, DB port 54322, `[db.seed] enabled = true` pointing at `./seed.sql`).
- `frontend/supabase/migrations/` has 9 SQL files defining schema + RLS policies, including `010_rls_org_scope.sql` and `004_shared_case_rpc.sql` — i.e., **RLS policy logic exists and is nontrivial**, but:
- **`supabase/seed.sql` does not exist** despite being referenced by `config.toml`. There is no seed data file in the repo.
- **No test anywhere spins up local Postgres/Supabase.** Every test that touches `@supabase/supabase-js` mocks the entire client with `vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => mockSupabaseClient) }))` (e.g. `frontend/src/lib/__tests__/supabase.test.ts:8-14`, and the same pattern repeats in `organizations.test.ts`, `cases.test.ts`, `case-notes.test.ts`, `share.test.ts`, `firm-profile.test.ts`). **No RLS policy is exercised by any test in this repo** — RLS correctness depends entirely on the SQL migrations being correct by inspection; nothing in `cargo test` or `vitest run` would catch a broken policy.
- There is therefore no way today to seed a Supabase row or database state for a test — everything is a JS-level mock of the client's method surface, not the database.

## Coverage Gaps — Explicit and Blunt

- **No end-to-end/browser test exists.** No Playwright, Cypress, Puppeteer, or WebdriverIO config, script, or dependency anywhere in `apps/inheritance` (checked `package.json` devDependencies and did a repo-wide search — the only hit, `@vitest/browser-playwright`, is an unused transitive lockfile entry, see Framework section above).
- **No visual regression / screenshot testing exists.** No `*.png` snapshot directory, no `toMatchImageSnapshot`, no Percy/Chromatic/Playwright-screenshot config.
- **No test exercises real auth.** `frontend/src/lib/__tests__/auth.test.ts` and `frontend/src/hooks/__tests__/useAuth.test.tsx` both mock `supabase.auth`/`@/lib/auth` entirely (`useAuth.test.tsx:9-15`). No test signs up or logs in against a real (or even locally-run) Supabase auth service. There is no signup/login flow test at the routing level either — `frontend/src/routes/settings/__tests__/team.test.tsx` and `frontend/src/routes/share/__tests__/shared-case.test.tsx` are the only route-level tests, and neither covers `/auth`.
- **No payment/billing system exists in this codebase at all** (no Stripe or any billing SDK found in `package.json` or source) — this is a true N/A, not a gap, given the current feature set.
- **PDF generation output is not tested.** `frontend/src/lib/__tests__/pdf-export.test.ts:206-215` tests `generatePDF` only as `expect(typeof mod.generatePDF).toBe('function')` — it never calls the function, never renders a PDF, never inspects bytes/pages/text content. `frontend/src/components/pdf/__tests__/pdf.test.tsx` (820 lines) tests the `@react-pdf/renderer` React component tree via `@testing-library/react`, which validates JSX structure/props passed to `<Document>`/`<Page>` components, **not the rendered PDF file** — no test opens or inspects an actual generated `.pdf`.
- **No RLS test.** Covered above — SQL policies exist, nothing exercises them.
- **No test build/typecheck gate runs in CI.** `tsc -b` (the build's own type gate) and `cargo build` are never invoked by `inheritance.yml`.
- **No lint gate.** No ESLint config exists in `frontend/`; no `cargo clippy` step exists anywhere.
- **Fuzz/property tests do not assert; they only print.** See "Vacuous or Weak Tests" below — this is a coverage gap disguised as coverage.
- **`engine/BUGS.md`** documents one open, high-severity, self-reported gap: BUG-001 (`engine/BUGS.md:3`) — multiple simultaneous disinheritances produce a distribution where the shares sum to roughly double the estate. The bug report itself states "The existing test suite (TV-08) only tests **single** disinheritance" — i.e., the team already knows the integration-vector suite under-covers this path, and the bug remains open.

## Vacuous or Weak Tests — Named, with file:line

These are tests that will pass regardless of whether the underlying logic is correct — worse than no test, because a "green" run does not indicate correctness.

1. **`engine/tests/zz_sweep.rs:188-239`** (`sweep_inv1`) — generates thousands of pipeline cases (5 estate amounts × 4 LC counts × 3 IC counts × 2 spouse states × 3 parent counts × 3 sibling counts × 9 will variants) and checks for panics, invariant-1 violations, and negative shares — **but only ever `eprintln!`s the results (lines 233-238); it never calls `panic!`, `assert!`, or returns an error.** The test passes even if every single generated case violates every invariant. Its own header (`zz_sweep.rs:1`) says "TEMPORARY sweep harness — delete after investigation," confirming this was meant as a debug tool, not a real gate, yet it still runs on every `cargo test` and is counted as "1 passing test."
2. **`engine/tests/zz_probe.rs`** (all 7 tests, e.g. `probe_inofficious_donation_breaks_sum:104-118`, `probe_odd_estate_3lc:121-136`) — each calls a `report()` helper (`zz_probe.rs:81-101`) that `eprintln!`s a warning line ("`***** INV1 VIOLATED`") if the sum invariant fails, but **never asserts**. Same "TEMPORARY... delete after investigation" header (`zz_probe.rs:1`). All 7 currently pass unconditionally.
3. **`frontend/src/lib/__tests__/pdf-export.test.ts:206-215`** — `generatePDF` "test" only checks `typeof mod.generatePDF === 'function'`; it is a type check on an export, not a test of PDF generation. Named explicitly in Coverage Gaps above too.
4. **`frontend/src/wasm/__tests__/bridge.test.ts:162`** and **`:340`** — `expect(output.scenario_code).toMatch(/^I/)` and `expect(output.scenario_code).toMatch(/^T/)` assert only that the scenario code starts with the letter for "Intestate"/"Testate" (there are 15+ distinct `I`-prefixed and many `T`-prefixed scenario codes in `types.ts`'s `ScenarioCode` enum) — this passes for *any* intestate/testate scenario, correct or not, and does not verify the engine picked the *specific* expected scenario for the given family structure.
5. **`frontend/src/wasm/__tests__/wasm-real.test.ts:307`** and **`:316`** — identical `/^I/` / `/^T/` pattern, same weakness, against the real WASM output this time (when the wasm binary is present).
6. **`frontend/src/lib/__tests__/supabase.test.ts:19-51`** — every test in this file (`'exports a supabase client object'`, `'client has auth method'`, `'client has from method for table queries'`, etc.) asserts only that a property `toBeDefined()` on a fully `vi.mock`-ed client (the mock is defined at the top of the file, lines 5-13 — the assertions are checking that the mock itself has the shape the test author gave it). This test cannot fail unless someone breaks the mock definition; it says nothing about the real `@supabase/supabase-js` client or the app's `supabase.ts` wrapper logic.
7. **`frontend/src/__tests__/print-layout.test.ts:20-63`** — asserts the *source text* of `frontend/src/styles/print.css` contains substrings like `@media print`, `A4`, `25mm`, `Times New Roman`, `12pt` via `toMatch(...)` on the raw file content (`readFileSync`, line 12). This proves the CSS file contains certain tokens; it proves nothing about what actually renders when a browser prints the page (font actually applied, margins actually respected, `.no-print` elements actually hidden). No visual/print-preview verification exists to back this up.
8. **General pattern, not exhaustive** — 151 assertions across 30 test files use `toBeDefined()`/`toBeTruthy()`/`not.toBeNull()` as the sole check in a given `it(...)` block (grep count; representative example is finding 6 above). Not every occurrence is vacuous — many follow a stronger assertion in the same test — but this pattern should be spot-checked per file when auditing a specific feature area, since it is the single most common way a weak test hides in this codebase.

## Per-File Inventory

### Rust — inline unit tests (`#[cfg(test)] mod tests` in `engine/src/`)

| File | Test fns | Lines (file) | Layer | What it asserts |
|---|---|---|---|---|
| `engine/src/step1_classify.rs` | 46 | 1015 | Rust unit | Raw→effective heir category mapping, disinheritance pre-checks, illegitimate-child filiation rules |
| `engine/src/step2_lines.rs` | 31 | 1044 | Rust unit | Paternal/maternal line construction for ascendant succession |
| `engine/src/step3_scenario.rs` | 49 | 1089 | Rust unit | Scenario-code determination (I1-I15, T-prefixed) from heir composition |
| `engine/src/step4_estate_base.rs` | 33 | 910 | Rust unit | Estate base computation before legitime split |
| `engine/src/step5_legitimes.rs` | 41 | 1745 | Rust unit | Legitime fraction computation per heir category (highest `unwrap`/`expect` count in the codebase: 40) |
| `engine/src/step6_validation.rs` | 36 | 2026 | Rust unit | Five-check testate validation: preterition, disinheritance validity, underprovision, inofficiousness, condition stripping |
| `engine/src/step7_distribute.rs` | 38 | 2173 | Rust unit | Per-heir share distribution across legitime/free portion/intestate |
| `engine/src/step8_collation.rs` | 18 | 1382 | Rust unit | Donation collation adjustment |
| `engine/src/step9_vacancy.rs` | 33 | 1636 | Rust unit | Vacancy/accretion resolution when an instituted heir predeceases or is incapacitated |
| `engine/src/step10_finalize.rs` | 57 | 1230 | Rust unit | Fraction→centavo finalization, narrative text generation |
| `engine/src/fraction.rs` | 29 | 512 | Rust unit | `Frac`/`BigInt` arithmetic helpers, money↔fraction conversion |

**Total inline unit tests: 411** (matches `cargo test` output for the `lib.rs` unittest binary exactly).

### Rust — separate test binaries (`engine/tests/`)

| File | Lines | Test fns | Layer | What it asserts |
|---|---|---|---|---|
| `engine/tests/integration.rs` | 1882 | 30 | Rust integration | Full 10-step pipeline run per spec test-vector (`test_tv01`…`test_tv23`+variants); checks sum-conservation, adoption equality, and scenario-code consistency via shared helpers (`integration.rs:436-483`) |
| `engine/tests/fuzz_invariants.rs` | 270 | 1 | Rust property/invariant | Loads all 100 files in `examples/fuzz-cases/`, runs the pipeline, checks 10 spec invariants (§14.2) per case, and **does** `panic!` with a full failure report if any invariant is violated (`fuzz_invariants.rs:264-269`) — this one is a real gate, unlike the `zz_*` files below |
| `engine/tests/zz_sweep.rs` | 239 | 1 | Rust — **non-asserting debug harness** | See Vacuous Tests #1 |
| `engine/tests/zz_probe.rs` | 236 | 7 | Rust — **non-asserting debug harness** | See Vacuous Tests #2 |

### TypeScript — full file list (110 files, 35,293 lines total)

Grouped by directory/layer. "Layer" = `TS unit` (pure function/module, no DOM), `TS component` (renders via testing-library + jsdom), `TS integration` (multiple modules/real app composition, jsdom), or `WASM-dependent` (requires the missing `.wasm` binary to pass).

**App shell (`frontend/src/__tests__/`):**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `integration.test.tsx` | 624 | TS integration, **WASM-dependent** | Full data flow EngineInput → `compute()` (real WASM) → `ResultsView`; will fail without the wasm binary |
| `smoke.test.tsx` | 15 | TS component | Renders `<App />`, checks for the string "Inheritance Calculator" |
| `router.test.tsx` | 284 | TS integration | Route tree navigation |
| `dashboard.test.tsx` | 157 | TS component | Dashboard shell rendering |
| `print-layout.test.ts` | 64 | TS unit (weak) | See Vacuous Tests #7 |

**WASM bridge (`frontend/src/wasm/__tests__/`):**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `bridge.test.ts` | 862 | TS unit, **WASM-dependent** | Tests `compute()`, which now always calls real WASM despite the file's docstring claiming it tests "the mock implementation" (stale — see CONVENTIONS.md) |
| `scenario-coverage.test.ts` | 697 | TS integration, **WASM-dependent** | Loads real `.wasm` bytes via `readFileSync` in `beforeAll` |
| `wasm-real.test.ts` | 609 | TS integration, **WASM-dependent** | Same |
| `conformance.test.ts` | 496 | TS integration, **WASM-dependent** | Same |
| `wasm-live.test.ts` | 211 | TS integration, **WASM-dependent** | Calls `computeWasm` via bridge |

**Schemas & types (`frontend/src/schemas/__tests__/`, `frontend/src/types/__tests__/`):**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `schemas/__tests__/schemas.test.ts` | 1411 | TS unit | Valid/invalid parse checks for every Zod schema in `schemas/index.ts` — domain-schema-level, not app-logic |
| `schemas/__tests__/estate-tax.test.ts` | 475 | TS unit | Estate-tax-specific schema validation |
| `types/__tests__/types.test.ts` | 885 | TS unit | Enum values, money/fraction formatters (`formatPeso`, `pesosToCentavos`), label maps |
| `types/__tests__/estate-tax.test.ts` | 385 | TS unit | Estate-tax type structure checks |

**Data (`frontend/src/data/__tests__/`):**
| File | Lines | Layer |
|---|---|---|
| `ncc-articles.test.ts` | 158 | TS unit |
| `document-templates.test.ts` | 215 | TS unit |

**lib/ (`frontend/src/lib/__tests__/`) — Supabase-backed modules, all mock the client:**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `supabase.test.ts` | 83 | TS unit (weak) | See Vacuous Tests #6 |
| `organizations.test.ts` | 529 | TS unit | `vi.mock`s Supabase |
| `pdf-export.test.ts` | 222 | TS unit (partially weak) | `generatePDF` untested — see #3; filename/slug helpers are properly tested |
| `share.test.ts` | 185 | TS unit | `vi.mock`s Supabase |
| `documents.test.ts` | 443 | TS unit | `vi.mock`s Supabase |
| `intake.test.ts` | 698 | TS unit | Largest lib test; intake→EngineInput mapping logic |
| `conflict-check.test.ts` | 125 | TS unit | |
| `deadlines.test.ts` | 383 | TS unit | |
| `export-zip.test.ts` | 423 | TS unit | Uses `jszip`; tests archive structure, not visual output |
| `auth.test.ts` | 178 | TS unit | Mocks `supabase.auth` entirely — no real-auth path |
| `cases.test.ts` | 345 | TS unit | `vi.mock`s Supabase |
| `case-notes.test.ts` | 203 | TS unit | `vi.mock`s Supabase |
| `tax-bridge.test.ts` | 474 | TS unit | |
| `comparison.test.ts` | 460 | TS unit | |
| `firm-profile.test.ts` | 383 | TS unit | `vi.mock`s Supabase |

**lib/estate-tax-engine/__tests__/ (pure computation, no mocking needed):**
| File | Lines |
|---|---|
| `pipeline.test.ts` | 508 |
| `advisor.test.ts` | 467 |
| `ordinary-deductions.test.ts` | 458 |
| `gross-estate.test.ts` | 291 |
| `explainer.test.ts` | 287 |
| `special-deductions.test.ts` | 312 |
| `sensitivity.test.ts` | 281 |
| `validation.test.ts` | 268 |
| `regime-detection.test.ts` | 236 |
| `spouse-share.test.ts` | 208 |
| `amnesty.test.ts` | 212 |
| `tax-rate.test.ts` | 147 |
| `foreign-tax-credit.test.ts` | 131 |
| `sec87-exclusions.test.ts` | 83 |
| `nra-proportional.test.ts` | 73 |
| `constants.test.ts` | 47 |
All 15 are **TS unit**, all pure-function tests against literal fixture objects — this sub-package has the cleanest, least-mocked test coverage in the repo.

**Hooks (`frontend/src/hooks/__tests__/`):**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `useAuth.test.tsx` | 114 | TS unit (hook) | Mocks `@/lib/auth` fully — see Coverage Gaps |
| `useOrganization.test.tsx` | 283 | TS unit (hook) | |
| `useAutoSave.test.tsx` | 150 | TS unit (hook) | |
| `useTaxBridge.test.tsx` | 391 | TS unit (hook) | |
| `usePrintExpand.test.ts` | 116 | TS unit (hook) | |

**Contexts, routes, utils:**
| File | Lines | Layer |
|---|---|---|
| `contexts/__tests__/FirmProfileContext.test.tsx` | 213 | TS component |
| `routes/share/__tests__/shared-case.test.tsx` | 245 | TS component |
| `routes/settings/__tests__/team.test.tsx` | 218 | TS component |
| `utils/__tests__/tin-format.test.ts` | 44 | TS unit |

**Components — case (`frontend/src/components/case/__tests__/`):**
| File | Lines |
|---|---|
| `timeline-report.test.tsx` | 785 |
| `deadline-timeline.test.tsx` | 332 |
| `case-notes.test.tsx` | 324 |
| `document-checklist.test.tsx` | 296 |
| `share-dialog.test.tsx` | 219 |
All **TS component** (render + assert DOM/text).

**Components — quick-calc, settings, dashboard, shared:**
| File | Lines | Layer |
|---|---|---|
| `quick-calc/__tests__/QuickCalcWidget.test.tsx` | 138 | TS component |
| `quick-calc/__tests__/landing-integration.test.tsx` | 41 | TS component |
| `quick-calc/__tests__/QuickCalcResults.test.tsx` | 71 | TS component |
| `quick-calc/__tests__/defaults.test.ts` | 71 | TS unit |
| `settings/__tests__/InviteMemberDialog.test.tsx` | 171 | TS component |
| `settings/__tests__/TeamMemberList.test.tsx` | 170 | TS component |
| `settings/__tests__/firm-branding.test.tsx` | 367 | TS component |
| `dashboard/__tests__/CaseCard.test.tsx` | 84 | TS component |
| `shared/__tests__/FractionInput.test.tsx` | 203 | TS component |
| `shared/__tests__/DateInput.test.tsx` | 172 | TS component |
| `shared/__tests__/PrintHeader.test.tsx` | 41 | TS component |
| `shared/__tests__/PersonPicker.test.tsx` | 210 | TS component |
| `shared/__tests__/EnumSelect.test.tsx` | 253 | TS component |
| `shared/__tests__/MoneyInput.test.tsx` | 285 | TS component |

**Components — wizard (`frontend/src/components/wizard/__tests__/`) — largest component group:**
| File | Lines |
|---|---|
| `DecedentStep.test.tsx` | 689 |
| `PersonCard.test.tsx` | 642 |
| `ReviewStep.test.tsx` | 547 |
| `DisinheritancesTab.test.tsx` | 522 |
| `DonationCard.test.tsx` | 499 |
| `InstitutionsTab.test.tsx` | 478 |
| `FamilyTreeStep.test.tsx` | 460 |
| `LegaciesTab.test.tsx` | 375 |
| `AdoptionSubForm.test.tsx` | 327 |
| `DevisesTab.test.tsx` | 326 |
| `EstateStep.test.tsx` | 294 |
| `DonationsStep.test.tsx` | 282 |
| `FiliationSection.test.tsx` | 252 |
| `WillStep.test.tsx` | 226 |
| `ShareSpecForm.test.tsx` | 226 |
| `HeirReferenceForm.test.tsx` | 221 |
| `WizardContainer.test.tsx` | 164 |
All **TS component**, form-field-level render + interaction tests via `react-hook-form` + testing-library.

**Components — tax:**
| File | Lines | Layer |
|---|---|---|
| `tax/__tests__/EstateTaxWizard.test.tsx` | 509 | TS component |

**Components — results (`frontend/src/components/results/__tests__/` + `visualizer/__tests__/`):**
| File | Lines | Layer |
|---|---|---|
| `donation-summary.test.tsx` | 464 | TS component |
| `ComparisonPanel.test.tsx` | 435 | TS component |
| `DistributionSection.test.tsx` | 356 | TS component |
| `ResultsView.test.tsx` | 284 | TS component |
| `ActionsBar.test.tsx` | 271 | TS component |
| `share-breakdown.test.tsx` | 255 | TS component |
| `representation.test.tsx` | 226 | TS unit/component |
| `ResultsHeader.test.tsx` | 217 | TS component |
| `NarrativePanel.test.tsx` | 195 | TS component |
| `utils.test.ts` | 174 | TS unit |
| `statute-citations.test.tsx` | 170 | TS component |
| `WarningsPanel.test.tsx` | 143 | TS component |
| `ComputationLog.test.tsx` | 116 | TS component |
| `visualizer/__tests__/tree-tab.test.ts` | 549 | TS unit |
| `visualizer/__tests__/family-tree-viz.test.tsx` | 494 | TS component |

**Components — pdf:**
| File | Lines | Layer | Notes |
|---|---|---|---|
| `pdf/__tests__/pdf.test.tsx` | 820 | TS component | Tests `@react-pdf/renderer` JSX prop/structure — does not inspect a rendered PDF file (see Coverage Gaps) |

**Components — intake:**
| File | Lines | Layer |
|---|---|---|
| `intake/__tests__/intake-form.test.tsx` | 387 | TS component |

---

*Testing analysis: 2026-07-27*
