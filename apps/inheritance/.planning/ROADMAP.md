# Roadmap: Inheritance — Verification-First Foundation

## Overview

Nothing in this codebase is currently verifiable, and two hardcoded lines make every legal defect invisible even to a lawyer looking directly at the output. The roadmap therefore runs in a strict trust order: first make the test suites executable at all (Phase 1), lock in loop-durability discipline for the month-long unattended grind (Phase 2), finish the environment/reporting infrastructure the later DB-touching gates need (Phase 3), and send the lawyer's review agenda out early since the lawyer is currently sitting the bar exam and may be unreachable for weeks (Phase 4). Only then does observability get switched back on (Phase 5) and the property-test generator get strengthened to reach the shapes that actually break the engine (Phase 6) — both preconditions for the legal fixes that follow to be observably correct rather than silently correct-or-wrong. The nine silent legal defects split into a root-cause cluster fixable today (Phase 7), other unblocked defects (Phase 8), and three items that need a lawyer's answer and are deliberately sequenced last among the legal-fix work (Phase 14) so the loop never stalls waiting on them. Duplicate scenario classifiers are deleted before the succession wizard gets screenshot gates (Phase 9), because a gate that faithfully certifies a wrong "Predicted:" badge is worse than no gate. The journey-verification work — the largest single body of work — is split into infrastructure (Phase 10), then three journey-area phases (Phases 11–12) sized small on purpose, since per-step screenshot-plus-vision gates across a 24-route app are exactly the kind of long, repetitive grind that causes context drift in a cheap model. PDF verification (Phase 13) follows once engine output is trustworthy enough to assert exact peso figures against. The roadmap closes with the lawyer-blocked legal fixes plus legal traceability (Phase 14) and a documentation closeout (Phase 15) so a returning owner or a new collaborator can pick this up cold.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Gate Foundations — Suites Execute At All** - Make `npm test`, `tsc -b`, the WASM build, and CI itself real
- [x] **Phase 2: Loop Durability & Commit Discipline** - Make the month-long autonomous grind survivable and self-reporting (completed 2026-07-31)
- [x] **Phase 3: Reproducible Environment & Gate Reporting** - Local Supabase, seed data, storage buckets, machine-readable gate results (completed 2026-07-31)
- [x] **Phase 4: Lawyer Review Agenda Recorded** - Send the eight interpretive questions out now, while the lawyer is unreachable (completed 2026-07-31)
- [ ] **Phase 5: Engine Observability Restored** - Turn `warnings` and the legitime/free-portion split back on
- [ ] **Phase 6: Property-Test Coverage Depth** - Make the generator reach the heir shapes that currently break the engine
- [ ] **Phase 7: Intestate Order & Representation Root-Cause Fixes** - Fix the one line that causes four critical defects
- [ ] **Phase 8: Remaining Unblocked Legal & Tax-Bridge Defects** - Preterition, medical deduction, vanishing deduction, tax-bridge, reserva troncal
- [ ] **Phase 9: Single Source of Truth — Dedup Classifiers & Money Types** - Delete the two wrong scenario classifiers and dead mock output before wizard gates exist
- [ ] **Phase 10: Journey Gate Infrastructure — Seeding, Rubric, Artifacts** - Build the seams every per-step screenshot gate depends on
- [ ] **Phase 11: Account, Org & Case Journey Gates** - Signup, login, org, invites, case intake, RLS isolation
- [ ] **Phase 12: Wizard & Output Journey Gates** - Succession wizard, tax wizard, results, family tree, share link, SEO smoke
- [ ] **Phase 13: PDF Verification** - Structural, exact-peso, and perceptual gates on the generated PDF
- [ ] **Phase 14: Lawyer-Blocked Legal Fixes & Legal Traceability** - Apply the lawyer's answers; trace every rule to a named vector
- [ ] **Phase 15: Extendability & Documentation Closeout** - Invariants a cheap agent must not violate, and a planning dir a stranger can read

## Phase Details

### Phase 1: Gate Foundations — Suites Execute At All
**Goal**: A clean checkout can actually run the frontend test suite, typecheck, build the WASM artifact, and have all of that enforced by CI — none of which is true today.
**Depends on**: Nothing (first phase)
**Requirements**: GATE-01, GATE-02, GATE-03, GATE-04
**Success Criteria** (what must be TRUE):
  1. Running `npm test` from a clean checkout (after documented install steps) executes the full Vitest suite and prints real pass/fail counts instead of failing at module init.
  2. Running `npx tsc -b` in `frontend/` completes with zero type errors.
  3. A single documented command builds `inheritance_engine_bg.wasm` from `engine/` into `frontend/src/wasm/pkg/`, and the WASM-dependent test files (`wasm-real.test.ts`, `conformance.test.ts`, `scenario-coverage.test.ts`, `wasm-live.test.ts`, `bridge.test.ts`) no longer fail at `readFileSync` with ENOENT.
  4. A CI workflow triggers on every push and pull request, runs `cargo test`, the WASM build, `npm test`, and `npx tsc -b`, and fails the check when any of them fails.
**Plans**: 4 plans, 4 waves (strictly sequential — each wave's gate depends on the previous wave's artifact)
  - **Wave 1** — `01-01` Single reproducible WASM build command (GATE-03)
  - **Wave 2** *(blocked on Wave 1: the frontend suite cannot run without the WASM artifact)* — `01-02` jsdom environment polyfills, 342 failures to 46 (GATE-01)
  - **Wave 3** *(blocked on Wave 2: the ledger must record the post-polyfill failure set)* — `01-03` Known-failure ledger gate (GATE-01)
  - **Wave 4** *(blocked on Waves 1-3: CI runs all three artifacts)* — `01-04` Local gate runner, CI workflow, README (GATE-01, GATE-02, GATE-03, GATE-04)

  Cross-cutting constraints (appear in 2+ plans):
  - No test, assertion, or `vitest.config.ts` may be modified; `.skip`/`.only`/`.todo`/`xit`/`xdescribe` are prohibited and the gate treats a skipped test as a hard failure
  - Every commit stages explicit file paths; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - `npx tsc -b --force`, never bare `tsc -b` — the committed `tsconfig.tsbuildinfo` can otherwise mask errors
  - `engine/Cargo.lock`, `engine/Cargo.toml`, and everything under `engine/src/` are off-limits in this phase

### Phase 2: Loop Durability & Commit Discipline
**Goal**: The autonomous execution loop itself — not the product — is durable enough to run unattended for a month without drifting, narrowing scope, or losing work to the concurrent auto-committer.
**Depends on**: Phase 1
**Requirements**: LOOP-01, LOOP-02, LOOP-03, LOOP-04, LOOP-05, LOOP-06
**Success Criteria** (what must be TRUE):
  1. Every plan produced for this project is closed-world: it names every decision the executing agent needs, requiring no legal judgment, design taste, or ungrounded decision.
  2. When a plan's gates cannot run at all, execution halts and reports rather than proceeding or silently redefining success.
  3. The gate manifest lives where the executing agent is documented as forbidden to widen or weaken without explicit owner action.
  4. Progress is measured against the frozen gate manifest, so a narrowed scope becomes visible as reduced coverage rather than false completion.
  5. Every commit made during this project lists explicit files (never `git add -A`), documented as mandatory given the concurrent auto-committer on this monorepo.
  6. A stalled or repeatedly-failing loop produces a visible signal (a status file, a flagged report) without the owner needing to poll for it.
**Plans**: 6 plans, 4 waves (wave 1 is three independent artifacts; waves 2–4 are strictly sequential because each consumes the previous wave's output)
  - **Wave 1** — `02-01` Frozen, growth-only gate manifest (LOOP-03) · `02-02` Closed-world plan lint and the BLOCKED protocol (LOOP-01, LOOP-02) · `02-03` Safe-commit wrapper and mixed-commit history audit (LOOP-05)
  - **Wave 2** *(blocked on Wave 1: registers all three wave-1 checks as gates G5–G7)* — `02-04` Manifest-driven runner with a cannot-run halt distinct from a failure (LOOP-02, LOOP-03)
  - **Wave 3** *(blocked on Wave 2: consumes the per-gate run record the runner emits)* — `02-05` Coverage against the frozen manifest (LOOP-04)
  - **Wave 4** *(blocked on Waves 2–3: renders a status page from the run record and coverage)* — `02-06` Committed loop status with a fixed stall rule (LOOP-06)

  Cross-cutting constraints (appear in 2+ plans):
  - Every new check is dependency-free Node ESM or Bash using only `node:` builtins; no package.json is created at the app root and no dependency is installed
  - No check may rewrite its own input — no `--update`, `--fix`, `--accept`, `--regenerate`, or waiver flag on any artifact in this phase
  - Every failure path of every check must be observed firing against a committed fixture; a gate nobody has seen fail is not known to be a gate
  - Every commit stages explicit file paths; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test, or assertion may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - No point of Philippine law arises anywhere in this phase; if one appears, the executor halts rather than deciding it

### Phase 3: Reproducible Environment & Gate Reporting
**Goal**: A developer (or agent) can stand up a complete working environment from a clean checkout in one documented pass, and every gate run produces machine-readable, skip-aware results.
**Depends on**: Phase 1
**Requirements**: GATE-05, GATE-06, GATE-07, GATE-08, GATE-09
**Success Criteria** (what must be TRUE):
  1. Following one documented sequence from a clean checkout yields a working local environment: dependencies, WASM, local Supabase, and seed data all present.
  2. `supabase/seed.sql` exists and, once applied, produces a known org, user, and case fixture that later gates can reference by ID.
  3. The `firm-logos` bucket and every other runtime-required storage bucket are created by a migration file, not by a manual dashboard action.
  4. A gate run emits a machine-readable results file that a status page could consume for per-gate pass/fail.
  5. Every gate's output distinguishes "skipped" from "passed," so a partially-loaded suite can never be misread as a clean pass.
**Plans**: 5 plans, 5 waves (strictly sequential — waves 2 and 3 share one database, waves 4 and 5 share the same four gate-infrastructure files)
  - **Wave 1** — `03-01` Pinned Supabase CLI, a dedicated port block, one-command bring-up, read-only env verdict (GATE-05)
  - **Wave 2** *(blocked on Wave 1: the live half of its verification needs a running stack)* — `03-02` `firm-logos` bucket by migration, plus code-versus-migration bucket parity (GATE-07)
  - **Wave 3** *(blocked on Wave 2: both run `supabase db reset` against the same database, and this wave asserts the bucket survives a reseed)* — `03-03` Two-tenant `seed.sql` with a published id registry (GATE-06)
  - **Wave 4** *(blocked on Waves 1–3: edits `scripts/ci-gates.sh`, `gates.manifest.json`, `gates.manifest.lock` and `GATES.md`)* — `03-04` Per-gate skip accounting and a shrink-only declared-skip ledger, gate G8 (GATE-09)
  - **Wave 5** *(blocked on Wave 4: edits the same four files and consumes its skip report)* — `03-05` Published `gate-results.json`, gate G9, README bring-up sequence (GATE-05, GATE-08)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test, or assertion may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - No locked gate `command` string may change. Gates G8 and G9 are added by appending to `gates.manifest.json` and `gates.manifest.lock` together — the gate set may only grow
  - No check may rewrite its own input — no `--update`, `--fix`, `--accept`, `--regenerate`, or waiver flag on any artifact in this phase
  - Every failure path of every check must be observed firing against a committed fixture; a gate nobody has seen fail is not known to be a gate
  - Every new check is dependency-free Node ESM or Bash using only `node:` builtins; no package.json is created at the app root and no dependency is installed
  - No Docker container whose name does not end in `_inheritance` may be stopped, restarted, or reset — ports 54321–54324 belong to a sibling monorepo app
  - No point of Philippine law arises anywhere in this phase; the one place it could have (the seeded family tree) is removed by copying `engine/examples/cases/02-married-3lc.json` verbatim

### Phase 4: Lawyer Review Agenda Recorded
**Goal**: The eight interpretive choices already made by the engine are written down as recorded decisions the lawyer can confirm or overturn — sent out now, since the lawyer is sitting the bar exam and may be unreachable for weeks, so the unblocked engineering work in later phases is never waiting on an answer that hasn't arrived yet.
**Depends on**: Nothing structurally; sequenced early to maximize the lawyer's response window before Phase 14 needs the answers.
**Requirements**: LAWYER-01, LAWYER-02, LAWYER-03, LAWYER-04, LAWYER-05, LAWYER-06, LAWYER-07, LAWYER-08, LAWYER-09, LAWYER-10
**Success Criteria** (what must be TRUE):
  1. Each of the eight interpretive choices in `LEGAL-CONFORMANCE.md` §3 has a recorded-decision entry stating the engine's current reading and the exact question posed to the lawyer.
  2. Each recorded decision is machine-readable and linked from the specific code location or rule it governs, so no agent re-decides it later.
  3. The three highest-stakes questions that block later code changes (Q4/LAWYER-04 blocking LAW-07, Q6/LAWYER-06 blocking LAW-06, Q8/LAWYER-08 blocking LAW-12) are phrased so the lawyer can answer "confirm" or "change to B" in one sitting.
  4. A written workflow exists describing how a lawyer's future "this is wrong" turns into a named test vector, a failing gate, and a fix.
**Plans**: 5 plans, 5 waves (strictly sequential — waves 1 and 2 share one file, wave 3 mirrors what wave 2 wrote, wave 4 gates what wave 3 built, and waves 4 and 5 share `README.md`)
  - **Wave 1** — `04-01` Agenda file, answering instructions, blocking index, and entries LAWYER-01…04 (LAWYER-01, LAWYER-02, LAWYER-03, LAWYER-04)
  - **Wave 2** *(blocked on Wave 1: it appends to the file wave 1 creates and reuses its entry structure)* — `04-02` Entries LAWYER-05…08 and the status table (LAWYER-05, LAWYER-06, LAWYER-07, LAWYER-08)
  - **Wave 3** *(blocked on Wave 2: the registry is a copy of the completed agenda)* — `04-03` Machine-readable `lawyer-decisions.json`, ten `LAWYER-DECISION` markers, and the Q7 spec-hedge replacement (LAWYER-07, LAWYER-09)
  - **Wave 4** *(blocked on Wave 3: the gate has nothing to check until the registry and markers exist)* — `04-04` `check-lawyer-agenda.mjs`, seven fixtures, gate G10 at order 8, `GATES.md` section 8 (LAWYER-09)
  - **Wave 5** *(blocked on Wave 4: the workflow cites gate G10 by id and command)* — `04-05` `LEGAL-CORRECTION-WORKFLOW.md`, the `PLAN-STANDARD.md` section 3 closeout, README pointer (LAWYER-10)

  Cross-cutting constraints (appear in 2+ plans):
  - No point of Philippine law may be decided. Every entry is recorded with `**Status:** awaiting-answer`, all Answer boxes unticked, and `grep -c "\[x\]"` returning 0 is an acceptance criterion in four plans
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test, or assertion may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - No locked gate `command` string may change. Gate G10 is added by appending to `gates.manifest.json` and `gates.manifest.lock` together; `order` is unlocked, so G10 takes order 8 and G9 stays last
  - No check may rewrite its own input — no `--fix`, `--update`, `--accept`, `--regenerate`, or waiver flag on any artifact in this phase
  - Every failure path of every check must be observed firing against a committed fixture
  - Every new check is dependency-free Node ESM using only `node:` builtins; no package.json is created and no dependency is installed
  - Source-file edits add comment lines only; `cd engine && cargo test` must still report 442 passed and `npx tsc -b --force` must still produce zero output

### Phase 5: Engine Observability Restored
**Goal**: The two hardcoded lines that make every legal defect invisible are fixed, so from this phase forward a legal fix (or a legal bug) actually shows up in engine output instead of reproducing with an empty `warnings` array.
**Depends on**: Phase 1 (tests must run to verify this)
**Requirements**: OBS-01, OBS-02, OBS-03, OBS-04, OBS-05, OBS-06, OBS-07, OBS-08, OBS-09
**Success Criteria** (what must be TRUE):
  1. Running the engine on any of the nine defect-reproducing inputs from `LEGAL-CONFORMANCE.md` §2 now produces a nonempty `warnings` array reflecting the `ManualFlag` the pipeline actually builds, across all ten spec-defined flag categories.
  2. `from_legitime`, `from_free_portion`, and `from_intestate` are nonzero on heir rows where step 7 already computed a nonzero value, and `legitime_fraction` is populated — verified against the previously-measured "0 of 512 rows" baseline.
  3. A deliberately corrupted per-heir output (sum ≠ estate, or a duplicate `heir_id`) is rejected at runtime by a new conservation/duplicate check, not merely flagged by a test assertion.
  4. A malformed `EngineInput` produces a structured validation error at the WASM boundary in a frontend test, instead of an uncaught trap or unhandled rejection.
  5. A frontend error is captured and reportable, and the engine's per-step `computation_log` can be inspected for any case a lawyer questions.
**Plans**: 7 plans, 5 waves (wave 1 is two independent artifacts — one engine, one frontend; waves 2–5 are constrained by shared files, since six of the seven plans touch `engine/src/pipeline.rs`, `engine/src/step10_finalize.rs` or `engine/src/wasm.rs`)
  - **Wave 1** — `05-01` Warning and per-step computation-log propagation through the pipeline (OBS-01, OBS-09) · `05-02` Frontend error capture behind a root error boundary (OBS-08)
  - **Wave 2** *(blocked on Wave 1: `05-03` edits the file wave 1 reshaped, `05-04` edits the pipeline wave 1 rewired)* — `05-03` Per-heir legitime/free-portion/intestate rounding and `legitime_fraction` (OBS-03, OBS-04) · `05-04` All ten spec-defined manual review flag codes and their detectors (OBS-02)
  - **Wave 3** *(blocked on Waves 2: shares `engine/src/lib.rs` and `engine/src/pipeline.rs` with `05-04`)* — `05-05` Runtime conservation and duplicate-heir rejection at the checked entry point (OBS-05, OBS-06)
  - **Wave 4** *(blocked on Wave 3: shares `engine/src/wasm.rs`)* — `05-06` Structured validation error at the WASM boundary, typed on the frontend (OBS-07)
  - **Wave 5** *(blocked on Waves 1–4: asserts the inverted baseline every prior wave produced)* — `05-07` Corpus observability test, static anti-regression gate G11, `GATES.md` section 9 (OBS-01…OBS-09)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test, or assertion may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - `pub fn run_pipeline(input: &EngineInput) -> EngineOutput` keeps its signature; the checked behavior arrives as a new function, because `engine/tests/fuzz_invariants.rs` wraps the old one in `catch_unwind` and all 30 integration tests use a private copy
  - `engine/tests/integration.rs` holds its own inline copy of the pipeline and constructs `Step10Input` directly; any change to that struct must be mirrored there or the test binary does not compile
  - No peso amount may change anywhere in this phase. The estate-level sum invariant asserted over 100 fuzz cases must still pass, and the 140 committed inputs under `engine/examples/` may not be edited
  - `frontend/test-baseline.json` may only shrink and `gate-skips.lock` may only shrink; `gates.manifest.json` and `gates.manifest.lock` may only grow, and gate G9 must stay last
  - The `LAWYER-DECISION: LAWYER-08` marker on `pub retroactive_ra_11642: bool` in `engine/src/types.rs` must survive verbatim and adjacent; `node scripts/check-lawyer-agenda.mjs` is a per-plan verification step
  - No point of Philippine law arises anywhere in this phase. Emitting a manual review flag is the engine saying a human must decide, which decides nothing; every detector is a field comparison transcribed from `specs/inheritance-engine-spec.md` §13.1

### Phase 6: Property-Test Coverage Depth
**Goal**: The property-test generator and the assertion discipline around it are strong enough that the corpus can actually reach the shapes that break the engine, and a violation says which invariant broke.
**Depends on**: Phase 5 (violations must be observable to be worth generating)
**Requirements**: COV-01, COV-02, COV-03, COV-04, COV-05
**Success Criteria** (what must be TRUE):
  1. The property-test generator's corpus includes `NephewNiece` heirs, stranger donees, and donation/estate ratios above 1.0 — the exact shapes the current 100-case corpus cannot reach.
  2. A deliberately broken invariant in a generated case reports which named invariant failed, not just "a test failed."
  3. Every legal test vector asserts the exact expected scenario code and exact per-heir centavo amounts; none is left asserting a prefix or a range.
  4. A coverage report identifies, per engine module, which branches no test currently exercises.
  5. A CI check fails the build if any test asserts nothing, or asserts only `toBeDefined`/`toBeTruthy` as its sole check.
**Plans**: TBD

### Phase 7: Intestate Order & Representation Root-Cause Fixes
**Goal**: The single hardcoded `degree_from_decedent == 1` anchor filter — the root cause of four critical defects — is fixed, restoring the correct intestate order above the parent tier and correct representation/vacancy handling around it.
**Depends on**: Phase 5 (observability), Phase 6 (generator must reach these shapes to verify the fix)
**Requirements**: LAW-01, LAW-02, LAW-03, LAW-04
**Success Criteria** (what must be TRUE):
  1. A family with only grandparents surviving routes the estate to those grandparents under Regime B (Arts. 985–987), not to the State (I15) or wrongly to a spouse under Art. 995.
  2. Collateral succession through a predeceased sibling with living nephews produces no duplicate heir rows, and the per-heir sum equals the estate exactly (previously as low as 60% of the estate).
  3. Total repudiation by the nearest-degree heirs passes the estate to the next living degree in their own right (Art. 969) rather than escheating while living grandchildren exist.
  4. No representation scenario credits a predeceased ascendant's share by walking up the line; representation strictly follows the descending line only (Art. 972 ¶1).
  5. The property tests strengthened in Phase 6 (which now generate these exact shapes) pass against the fixed code.
**Plans**: TBD

### Phase 8: Remaining Unblocked Legal & Tax-Bridge Defects
**Goal**: The remaining critical and high-severity legal defects that need no lawyer input are fixed, closing the ₱30M-from-₱10M donation overpay, the 74.5% estate-tax-bridge understatement, the repealed medical deduction, the vanishing-deduction ratio gap, and the silent reserva troncal omission.
**Depends on**: Phase 5 (observability), Phase 6 (generator coverage)
**Requirements**: LAW-05, LAW-08, LAW-09, LAW-10, LAW-11
**Success Criteria** (what must be TRUE):
  1. A preterited-heir case preserves valid, non-inofficious devises/legacies and no longer fires preterition on an heir who received advances on their legitime.
  2. A 2018-or-later death case never applies the repealed ₱500,000 medical deduction, and the spec's TV-02 golden test is corrected to match.
  3. The vanishing-deduction reduction ratio includes Transfers for Public Use in both the TRAIN and pre-TRAIN branches.
  4. `tax-bridge.ts` passes the correct distributable estate — not net taxable estate minus tax — into the succession engine, verified against the ₱30M worked example in `LEGAL-CONFORMANCE.md` §6.
  5. A reserva troncal fact pattern produces a loud flag or an explicit "unsupported" refusal, never a silent, unencumbered distribution.
**Plans**: TBD

### Phase 9: Single Source of Truth — Dedup Classifiers & Money Types
**Goal**: Exactly one implementation of scenario classification and exactly one money representation survive, closing off the failure mode where a screenshot gate could faithfully certify a wrong "Predicted:" badge.
**Depends on**: Phase 1 (build/typecheck must work to verify deletions are safe)
**Requirements**: EXT-01, EXT-02, EXT-03, EXT-04
**Success Criteria** (what must be TRUE):
  1. `bridge.ts`'s dead `predictScenario()`/`computeMock()` and `ReviewStep.tsx`'s live, wrong `predictScenario()` are deleted; the "Predicted:" badge is backed by the real engine (or removed).
  2. A documented rule plus an automated check (lint rule, CI grep, or equivalent) fails the build if a second implementation of a legal rule is reintroduced.
  3. A peso value can no longer be passed where a centavo value is expected without a compile error, at every money-handling boundary in both wizards.
  4. `npm run build` produces a bundle with no remaining path capable of computing a legally meaningless number.
**Plans**: TBD

### Phase 10: Journey Gate Infrastructure — Seeding, Rubric, Artifacts
**Goal**: The seams every later per-step screenshot gate depends on — direct state seeding, a structured vision rubric, diff/rubric failure separation, and durable failure artifacts — exist before any journey-specific gate is written.
**Depends on**: Phase 1 (build), Phase 3 (local Supabase for DB-row seeding)
**Requirements**: JRNY-01, JRNY-09, JRNY-10, JRNY-12
**Success Criteria** (what must be TRUE):
  1. Any UI state needed by a later gate (a DB row, a `localStorage` draft, a route param, or app context) can be seeded directly by a test without clicking through preceding steps, with the seams documented.
  2. A vision rubric used by any gate is a fixed list of yes/no assertions returning structured output, never free-form judgment.
  3. A gate failure report clearly distinguishes a perceptual-diff failure from a rubric failure, and a documented flow exists for re-approving a reference image.
  4. Every gate failure writes the screenshot, the diff image, and the failing assertion text to a durable, inspectable location.
**Plans**: TBD

### Phase 11: Account, Org & Case Journey Gates
**Goal**: The account-level and case-intake money-path steps are verified end to end against a real local Supabase, including tenant isolation.
**Depends on**: Phase 10 (seeding/rubric infra), Phase 3 (local Supabase + seed fixture)
**Requirements**: JRNY-02, JRNY-03, JRNY-04, COV-06
**Success Criteria** (what must be TRUE):
  1. Signup, email verification, login, logout, and session persistence each have a passing screenshot-plus-rubric gate run against seeded state.
  2. Org creation and invite acceptance each have a passing screenshot-plus-rubric gate.
  3. Case intake, including recovery from a `localStorage` draft, is verified step by step.
  4. A test run against a real local Supabase proves a user in org A cannot read, write, or enumerate org B's cases, PDFs, or shared links.
**Plans**: TBD
**UI hint**: yes

### Phase 12: Wizard & Output Journey Gates
**Goal**: Every step of both wizards, the results view, the family-tree visualizer, the public share view, and the SEO/blog surface are verified — the deepest and largest single body of verification work in the project.
**Depends on**: Phase 9 (single scenario classifier must exist before this gate can be trusted), Phase 10 (seeding/rubric infra)
**Requirements**: JRNY-05, JRNY-06, JRNY-07, JRNY-08, JRNY-11
**Success Criteria** (what must be TRUE):
  1. Every step of the succession wizard has a passing screenshot-plus-rubric gate, run only after the single-classifier fix from Phase 9 is in place.
  2. Every tab of the estate-tax wizard has a passing screenshot-plus-rubric gate.
  3. The results view and family-tree visualizer are verified, including a deterministic assertion that every displayed peso figure matches engine output exactly.
  4. The public share-link view is verified, including an assertion that it exposes only the fields it should.
  5. Landing, blog, and SEO routes have a smoke gate checking render success, absence of console errors, and absence of 404s.
**Plans**: TBD
**UI hint**: yes

### Phase 13: PDF Verification
**Goal**: The generated PDF is verified structurally, exactly on money, and perceptually — closing the gap where `generatePDF` was previously "tested" only as `typeof mod.generatePDF === 'function'`.
**Depends on**: Phase 5 (correct legitime/free-portion breakdown must exist to assert on), Phase 12 (results view money must already be trustworthy)
**Requirements**: PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Success Criteria** (what must be TRUE):
  1. The PDF renders in CI and every required section is present when its text is extracted.
  2. Every peso figure appearing in the PDF is asserted, deterministically, to match engine output exactly.
  3. Article citations and a per-heir narrative appear for every heir in the PDF.
  4. Rendered PDF pages are perceptually diffed against approved reference images.
  5. Print layout is verified from rendered page output, not by pattern-matching CSS source text (closing the gap in `print-layout.test.ts`).
**Plans**: TBD

### Phase 14: Lawyer-Blocked Legal Fixes & Legal Traceability
**Goal**: The three legal fixes that needed a lawyer's answer are implemented per the recorded decision from Phase 4, and every legal rule the engine implements is traceable to exactly one named, article-citing test vector.
**Depends on**: Phase 4 (lawyer's recorded decisions, given weeks of elapsed time across Phases 5–13 for an answer to arrive), Phase 5 (observability)
**Requirements**: LAW-06, LAW-07, LAW-12, LAW-13, LAW-14, LAW-15
**Success Criteria** (what must be TRUE):
  1. Per the recorded answer to Q6, a donation-*inter-vivos* case no longer distributes more than the estate; the heir's excess entitlement is modelled per the lawyer's chosen reading.
  2. Per the recorded answer to Q4, Art. 992's iron curtain is implemented for the collateral line, and a marital half-sibling of an illegitimate decedent is correctly barred.
  3. Per the recorded answer to Q8, RA 11642 either computes the adoptee's extended succession rights or the engine explicitly refuses the fact pattern rather than silently applying the repealed rule.
  4. The spec's four misstated-law passages (Art. 992 pre-*Aquino* framing, Art. 900 ¶2 trigger, Art. 972 ¶1 omission, vanishing-deduction paragraph list) read correctly.
  5. Every implemented legal rule has exactly one named test vector citing its governing article, checkable by grep.
  6. `engine/BUGS.md` reflects reality: BUG-001 is closed as non-reproducing with a note, and a new entry is filed against the real defect at `step7_distribute.rs:313`.
**Plans**: TBD

### Phase 15: Extendability & Documentation Closeout
**Goal**: A returning owner or a new collaborator can determine current state, what's verified, and what's next from the planning directory alone, and `CLAUDE.md` states the invariants that prevent the regressions no test would catch.
**Depends on**: All prior phases (reflects final project state)
**Requirements**: EXT-05, EXT-06, EXT-07, EXT-08
**Success Criteria** (what must be TRUE):
  1. `CLAUDE.md` states the invariants an implementing agent must not violate: unit conventions, single-source-of-truth rules, and what requires a lawyer.
  2. A documented procedure exists for adding a new legal rule: article → vector → implementation → gate.
  3. A pass over `.planning/` and `specs/` finds no remaining claim contradicted by the current code, or each surviving one is explicitly listed as accepted debt.
  4. A returning owner can open the planning directory alone and determine current state, what is verified, and what is next.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Gate Foundations | 4/4 | Complete | 2026-07-31 |
| 2. Loop Durability & Commit Discipline | 6/6 | Complete   | 2026-07-31 |
| 3. Reproducible Environment & Gate Reporting | 5/5 | Complete    | 2026-07-31 |
| 4. Lawyer Review Agenda Recorded | 5/5 | Complete    | 2026-07-31 |
| 5. Engine Observability Restored | 3/7 | In Progress|  |
| 6. Property-Test Coverage Depth | 0/TBD | Not started | - |
| 7. Intestate Order & Representation Root-Cause Fixes | 0/TBD | Not started | - |
| 8. Remaining Unblocked Legal & Tax-Bridge Defects | 0/TBD | Not started | - |
| 9. Single Source of Truth — Dedup Classifiers & Money Types | 0/TBD | Not started | - |
| 10. Journey Gate Infrastructure | 0/TBD | Not started | - |
| 11. Account, Org & Case Journey Gates | 0/TBD | Not started | - |
| 12. Wizard & Output Journey Gates | 0/TBD | Not started | - |
| 13. PDF Verification | 0/TBD | Not started | - |
| 14. Lawyer-Blocked Legal Fixes & Legal Traceability | 0/TBD | Not started | - |
| 15. Extendability & Documentation Closeout | 0/TBD | Not started | - |
