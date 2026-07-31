# Phase 1 Research: Gate Foundations — Suites Execute At All

**Researched:** 2026-07-31
**Requirements covered:** GATE-01, GATE-02, GATE-03, GATE-04
**Method:** Every number below was measured by running the command on this tree, not inferred. Commands and raw counts are reproduced so a plan-checker can re-run them.

---

## 1. Measured Baseline (2026-07-31)

| Gate | Command | Result |
|---|---|---|
| Engine tests | `cargo test` in `engine/` | **PASS**, exit 0. 442 passed / 0 failed / 0 ignored across 5 binaries (411 lib, 30 integration, 1 fuzz). |
| Frontend typecheck | `npx tsc -b` and `npx tsc -b --force` in `frontend/` | **CLEAN**, exit 0, zero diagnostics both incremental and forced. TypeScript 5.9.3. |
| WASM artifact | `wasm-pack build --target web --out-dir ../frontend/src/wasm/pkg` in `engine/` | **Builds**, 533,807-byte `inheritance_engine_bg.wasm`, valid `\0asm` header. No wasm-bindgen version conflict — wasm-pack 0.15.0 reads `Cargo.lock` (`wasm-bindgen 0.2.114`) and fetches the exactly matching CLI. |
| Frontend tests | `npm test` (`vitest run`) in `frontend/` | **FAIL**, exit 1. 342 failed / 2074 passed of 2416; 22 of 109 files failing. **Zero module-init/collection errors** — every file was collected and executed. |
| CI | `.github/workflows/inheritance.yml` (monorepo root) | **No gate exists.** `workflow_dispatch` only. Contains zero invocations of `cargo test`, `npm test`, `npm ci`, `tsc`, or `wasm-pack build` — it installs those toolchains for a Ralph agent loop, it does not run them as checks. |

### 1.1 What GATE-01 already satisfies, and what it does not

The roadmap's Phase 1 success criterion 1 is *"executes the full Vitest suite and prints real pass/fail counts instead of failing at module init."* Measured: this is **already true** — 0 collection errors, all 109 files execute. Grepping the full 28,928-line log for `failed to load url`, `cannot find module`, `failed to resolve import`, `does not provide an export` returns 0 hits.

But GATE-01's actual text is *"`npm test` executes the frontend suite **from a clean checkout**"*. On a clean checkout two things are absent that are present here:

1. `frontend/node_modules/` — fixed by `npm ci` (lockfileVersion 3, `package-lock.json` committed, 460 KB). This is npm, not pnpm; the existing workflow's `npm install -g pnpm` step is misleading and matches no lockfile in this tree.
2. `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` — **gitignored** (`frontend/.gitignore` line `src/wasm/pkg/*.wasm`). Only `inheritance_engine.js` and `inheritance_engine.d.ts` are tracked. Without the binary, `bridge.ts:330` `readFileSync(resolve(__dirname, "pkg/inheritance_engine_bg.wasm"))` throws ENOENT and the 5 WASM test files fail. This is precisely roadmap criterion 3.

So the real Phase 1 work on GATE-01 is: (a) a reproducible way to produce the missing binary, and (b) making the residual failures into a *meaningful* signal rather than a permanent red.

---

## 2. The 342 failures decompose cleanly — measured, not guessed

`frontend/src/test-setup.ts` is 15 lines: `@testing-library/jest-dom/vitest` plus a `navigator.clipboard` shim. It installs **no** jsdom polyfills. The dominant failure cluster is `ReferenceError: ResizeObserver is not defined` — **1,465 occurrences** in the log.

**Experiment performed.** A probe run was executed with an alternate setup file adding only environment polyfills — `ResizeObserver`, `DOMRect`, `window.matchMedia`, and `Element.prototype.{scrollIntoView, hasPointerCapture, setPointerCapture, releasePointerCapture, scrollTo}`. No test file, assertion, or source file was touched. Probe artifacts were deleted afterward; `git status --porcelain apps/inheritance/` is empty.

**Result:**

```
BEFORE:  Test Files  22 failed | 87 passed (109)
               Tests  342 failed | 2074 passed (2416)

AFTER:   Test Files  11 failed | 98 passed (109)
               Tests   46 failed | 2370 passed (2416)
```

**296 of 342 failures (86.5%) are a missing jsdom polyfill, not a product or test defect.** Fixing them requires editing exactly one file (`src/test-setup.ts`) and weakens nothing.

### 2.1 The 46 residual failures — full enumeration and cause

These are **genuine test-vs-product mismatches**, not environment gaps. They are heterogeneous, several require product judgment ("should this checkmark render?"), and fixing them would mean rewriting test queries — which risks exactly the test-weakening this project forbids. They are therefore **out of Phase 1 scope** and must be recorded, not repaired.

| File | Failed | Dominant error | Root-cause class |
|---|---:|---|---|
| `src/routes/settings/__tests__/team.test.tsx` | 12 | `Element type is invalid ... got: undefined` | Genuine bad import/export in the `/settings/team` route tree. The only true product bug in the set. |
| `src/components/shared/__tests__/EnumSelect.test.tsx` | 9 | `Found multiple elements with the text`, `Unable to find role "group"`, `expected '' to be 'AdoptedChild'` | Tests written against a Radix Select API that renders trigger text *and* listbox text; queries match twice. |
| `src/components/shared/__tests__/PersonPicker.test.tsx` | 8 | `Value "lc1" not found in options`, `Found multiple elements` | Tests call `selectOptions()` (native `<select>` helper) against a Radix trigger. |
| `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | 5 | `expected '1Decedent' to contain '✓'` | Tab-completion checkmark not rendered — product-behavior question. |
| `src/components/wizard/__tests__/ReviewStep.test.tsx` | 4 | `Unable to find text /3 persons/i`, `/2 donation/i` | Summary copy drifted from the strings the tests assert. |
| `src/lib/__tests__/supabase.test.ts` | 2 | `promise resolved ... instead of rejecting` | Test expects a throw on missing env vars; `lib/supabase.ts` uses the `supabaseConfigured` guard instead. |
| `src/components/settings/__tests__/InviteMemberDialog.test.tsx` | 2 | `Found multiple elements with the text /admin/i` | Same Radix Select duplicate-text class. |
| `src/components/wizard/__tests__/WillStep.test.tsx` | 1 | `Unable to find role "button" name /^Institutions$/i` | Sub-tab markup drift. |
| `src/components/wizard/__tests__/HeirReferenceForm.test.tsx` | 1 | `Value "lc1" not found in options` | Radix/`selectOptions` class. |
| `src/components/wizard/__tests__/DonationsStep.test.tsx` | 1 | `Found multiple elements with the text /Juan Cruz/` | Radix duplicate-text class. |
| `src/components/quick-calc/__tests__/landing-integration.test.tsx` | 1 | `Unable to find text "All Succession Types"` | Landing copy drift. |
| **Total** | **46** | | |

---

## 3. The design problem this phase must solve

Roadmap criterion 4 requires CI that *"fails the check when any of them fails."* With 46 residual failures, a naive `npm test` step makes CI **red on day one and red for the next fourteen phases**. A permanently-red check is indistinguishable from a broken check: it detects nothing, and by Phase 7 nobody can tell a new regression from the standing 46.

The forbidden resolutions are exactly the obvious ones: `.skip`, `--passWithNoTests`, deleting assertions, `continue-on-error: true`, `|| true`. All of them convert loud failure into silence, which this project ranks as categorically worse than the failure itself.

### 3.1 Chosen mechanism: a frozen known-failure ledger

**Decision (made here so no executor has to make it):** CI runs the **complete, unmodified** suite and diffs the result against a committed ledger of the 46 known failures.

The gate fails when **any** of these is true:
1. A test fails that is **not** in the ledger → a regression.
2. A test in the ledger now **passes** → the ledger is stale and must shrink; forces progress to be recorded rather than pocketed.
3. Any test is **skipped, pending, or todo** (`numPendingTests > 0 || numTodoTests > 0`) → makes the forbidden escape hatch itself a hard failure.
4. Total collected test count **drops** below the recorded 2416 → catches deletion of tests as a way to go green.

Why this is not weakening: every assertion still runs, every failure is still reported and counted, and the 46 are enumerated by name in a file a human reads. The ledger can only shrink. Rule 3 makes `.skip` fail the build, which is *stronger* than plain `npm test`, where a skipped test is silently green.

This also gives Phase 2 (LOOP-03/LOOP-04, "frozen gate manifest", "narrowed scope becomes visible as reduced coverage") a concrete artifact to build on rather than an abstraction.

### 3.2 Runnable-locally-first CI

CI logic that only exists inside YAML cannot be debugged by a cheap executor and cannot be verified during planning. **Decision:** all four gates live in one committed shell script, `apps/inheritance/scripts/ci-gates.sh`, with `set -euo pipefail`. The GitHub workflow does toolchain setup and then calls that one script. The phase gate is therefore `bash apps/inheritance/scripts/ci-gates.sh` exiting 0 on a developer machine — provable now, not only after a push.

---

## 4. Toolchain facts the plans depend on

- `rustup target add wasm32-unknown-unknown` — already installed here; must be an explicit step in CI and in the build script.
- `cargo install wasm-pack` installs **wasm-pack 0.15.0**. It carries no bundled wasm-bindgen; it reads the crate's `Cargo.lock` and downloads the matching CLI. Verified three ways: `Cargo.lock` pins `0.2.114`; the fetched CLI reports `wasm-bindgen 0.2.114`; the emitted binary embeds the string `wasm-bindgen0.2.114`. **No version pinning work is required and `Cargo.lock` must not be edited.**
- `wasm-pack build --target web --out-dir ../frontend/src/wasm/pkg` regenerates `inheritance_engine.js` and `inheritance_engine.d.ts` **byte-identically** to the committed copies (`git diff --stat` empty). So the build is reproducible and cannot create spurious diffs.
- `engine/Cargo.toml` declares `crate-type = ["cdylib", "rlib"]` — both are needed (`rlib` for `cargo test`, `cdylib` for `wasm-pack`). Do not change.
- `loops/forward/wasm/build-wasm.sh` exists but is **dead**: it points at `../inheritance-rust-forward` and `../inheritance-frontend-forward/app/src/wasm/pkg`, neither of which exists. It is not a usable starting point; a new script is required.
- `frontend/.gitignore` contains `src/wasm/pkg/inheritance_engine_bg.js` — a **stale/dead rule**. `--target web` emits `inheritance_engine.js`, never a `_bg.js`.
- `frontend/tsconfig.tsbuildinfo` is **committed**. An incremental `tsc -b` can therefore no-op against a stale cache and report clean when it is not. CI must use `tsc -b --force`.
- Vitest 4 JSON reporter confirmed working, both forms measured on this tree:
  - single reporter — `npx vitest run --reporter=json --outputFile=<path>`
  - dual reporter — `npx vitest run --reporter=default --reporter=json --outputFile.json=<path>`, which keeps the human-readable summary on stdout *and* writes the JSON. Note the dotted `--outputFile.json=` form is required once more than one reporter is active; bare `--outputFile=` is only valid with a single reporter.
  Shape: `{ numTotalTests, numPassedTests, numFailedTests, numPendingTests, numTodoTests, success, testResults: [{ name: <absolute file path>, assertionResults: [{ fullName, title, status, failureMessages }] }] }`. `status` is one of `passed | failed | pending | skipped | todo`.

---

## 5. Repo hazards the plans must respect

- **Concurrent auto-committer.** The monorepo has a live auto-committer (three unrelated `fitness log` commits landed during earlier sessions). Every commit in this phase must name explicit paths. `git add -A`, `git add .`, and `git commit -a` are prohibited without exception.
- **Two git scopes.** GSD's project root is `apps/inheritance/`, but `.github/workflows/` lives at the monorepo root `/home/clsandoval/cs/monorepo/`. The CI workflow file is therefore *outside* the GSD project root and must be referenced by its monorepo-relative path.
- **Push-trigger blast radius.** A push-triggered workflow at the monorepo root fires on every unrelated monorepo commit, including the auto-committer's. It must be scoped with `paths:` to `apps/inheritance/**` plus the workflow file itself.
- **No lint tooling.** No ESLint, Prettier, Biome, rustfmt, or clippy config anywhere in `apps/inheritance/`. Phase 1 does not add any — `tsc` is the only static gate and that is intentional.

---

## 6. Validation Architecture

What must be sampled to know each gate is real rather than nominally present.

| Gate | Failure mode it must catch | Sampling method | Frequency |
|---|---|---|---|
| WASM build (GATE-03) | Script "succeeds" without producing a binary; stale binary from a previous build passes as fresh | Delete `inheritance_engine_bg.wasm`, run the script, assert the file exists, is >100 KB, and its first 4 bytes are `\0asm` | Every run of the script's own gate |
| WASM wiring | Binary present but not the one the tests load | Run the 5 WASM-dependent test files after a forced rebuild; all must pass | Every CI run |
| Frontend suite (GATE-01) | Green by skipping; green by deleting tests; new regression hidden among known failures | Ledger diff: unknown-failure check, stale-ledger check, `numPendingTests`/`numTodoTests` = 0, total-count floor 2416 | Every CI run |
| Ledger checker itself | Checker always exits 0 | Run it against two committed malformed fixtures (an injected new failure; a baselined test that passes) and assert exit 1 with the specific message | Ledger plan's gate |
| Typecheck (GATE-02) | Stale `tsconfig.tsbuildinfo` masks errors | `tsc -b --force`, never bare `tsc -b`, in CI | Every CI run |
| CI (GATE-04) | Workflow exists but never runs, or runs and cannot fail | Parse the YAML and assert `on.push` and `on.pull_request` exist; assert zero occurrences of `continue-on-error`, `|| true`, and `if: always()` on gate steps; run the identical script locally and require exit 0 | CI plan's gate |

**Signal that would falsify this phase's success:** `bash apps/inheritance/scripts/ci-gates.sh` exits 0 on a tree where a deliberately broken assertion has been introduced. The ledger plan's fixture tests exist to make that falsifiable now rather than in Phase 7.

---

## 7. Explicitly out of scope for Phase 1

| Item | Why deferred | Where it belongs |
|---|---|---|
| Fixing the 46 residual test failures | Heterogeneous; several need product judgment; repairing them via query rewrites risks weakening assertions | Recorded in the ledger; burn-down is later work |
| `team.test.tsx`'s undefined-component bug | A real defect, but a product fix, not a gate foundation | Ledger entry + STATE.md deferred item |
| Local Supabase, `seed.sql`, storage-bucket migrations | Explicitly Phase 3 (GATE-05..07) | Phase 3 |
| Machine-readable per-gate results file, skip-aware reporting | Explicitly Phase 3 (GATE-08, GATE-09). The ledger's JSON output is a stepping stone, not the deliverable | Phase 3 |
| Any engine behavior change | Phase 5 onward; Phase 1 must not alter a single peso of output | Phases 5–8, 14 |
| Lint tooling | Not a Phase 1 requirement | Not scheduled |

**No point of Philippine law arises anywhere in Phase 1.** Nothing in this phase touches the succession or tax engines' behavior. Nothing goes to the lawyer review agenda.
