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
- [x] **Phase 5: Engine Observability Restored** - Turn `warnings` and the legitime/free-portion split back on (7/7 plans executed 2026-07-31; NOT complete — gate G3 is red and OBS-05/OBS-06 are BLOCKED on one product decision, see `.planning/phases/05-engine-observability-restored/05-05-SUMMARY.md`)
- [x] **Phase 6: Property-Test Coverage Depth** - Make the generator reach the heir shapes that currently break the engine (5/5 plans executed 2026-07-31; COV-01…COV-05 all gate-proven. Gates G12 and G13 added at orders 4 and 5; the full runner passes G5, G6, G7, G12, G13, G1, G2 and then still fails at G3 for Phase 5's unresolved OBS-05/OBS-06 decision, which this phase did not touch)
- [x] **Phase 7: Intestate Order & Representation Root-Cause Fixes** - Fix the one line that causes four critical defects (4/4 plans executed 2026-07-31; LAW-01…LAW-04 all closed by named vectors `test_law01`…`test_law04` in `engine/tests/integration.rs`. `cargo test` 527 passed / 0 failed. Twelve of thirteen gates pass — G5, G6, G7, G12, G13, G1, G2 in the runner, plus G4, G8, G9, G10, G11 run directly past the halt. The runner still stops at G3 (gate 8/13) on the same five OBS-05/OBS-06 tests Phases 5 and 6 recorded, byte-identical; the frontend failure set did not grow. `engine/defect-baseline.json` shrank from 3 entries to 2)
- [x] **Phase 8: Remaining Unblocked Legal & Tax-Bridge Defects** - Preterition, medical deduction, vanishing deduction, tax-bridge, reserva troncal (8/8 plans executed 2026-07-31; LAW-05, LAW-08, LAW-09, LAW-10, LAW-11 all gate-proven. `cargo test` 543 passed / 0 failed, up from 527. Twelve of thirteen gates pass — G5, G6, G7, G12, G13, G1, G2 in the runner, plus G4, G10, G11 run directly past the halt. The runner still stops at G3 (gate 8/13) on the same five OBS-05/OBS-06 tests Phases 5, 6 and 7 recorded, byte-identical; the frontend failure set did not grow and the WASM was rebuilt from the fixed engine before it was measured. G8/G9 fail only as a cascade of that halt. One new legal question recorded, never decided: LAWYER-09)
- [x] **Phase 9: Single Source of Truth — Dedup Classifiers & Money Types** - Delete the two wrong scenario classifiers and dead mock output before wizard gates exist (2/6 plans executed 2026-07-31; NOT complete. EXT-03 is closed by 09-03 and 09-05 — branded `Pesos`/`Centavos` at both wizard boundaries, the duplicate peso→centavo converter deleted, `npx tsc -b --force` exit 0, estate-tax suite 252/252, `npm run test:gate` unchanged at 5 known UNKNOWN FAILURE / 2449. Four plans are BLOCKED: 09-01 asserts a `succession_type` equality that is false on 59 of 173 committed inputs because step 6 overrides step 3's provisional value (`scenario_code` agrees 173/173); 09-02's revived invariant 6 fails TV-09 by exposing a real defect at `engine/src/step7_distribute.rs:513`, where every instituted stranger is emitted as `EffectiveCategory::LegitimateChildGroup`; 09-04 needs 09-01's `classify_json`; 09-06's gate G14 would halt the runner ahead of G3 while three of its four rules are above ceiling)
- [x] **Phase 10: Journey Gate Infrastructure — Seeding, Rubric, Artifacts** - Build the seams every per-step screenshot gate depends on (6/6 plans executed 2026-07-31; NOT complete. JRNY-09, JRNY-10 and JRNY-12 are gate-proven by **G15** (`cd frontend && node journey/selftest.mjs`, order 6, blocking, eleven cases covering all eight rubric kinds and all four diff outcomes), observed exiting 1 on an injected fixture regression and 0 after reverting it. `bash scripts/ci-gates.sh` now exits **0** with `ALL GATES PASSED (14/14)` — the inherited G3 halt is gone, resolved by the owner in `d71f9150e` before this phase ran. JRNY-01 is PARTIAL: the four database-free seams (localStorage, sessionStorage, search param, URL-addressable wizard step and tax tab) are proven reaching a page on first paint, but the live-DB half is BLOCKED — no table in the local stack's `public` schema grants SELECT/INSERT/UPDATE/DELETE to `anon`, `authenticated` or `service_role`, so `journey/seed-smoke.mjs` gets HTTP 403 / PG 42501. Cause measured: `pg_default_acl` grants apply to objects created by `supabase_admin`, but every `public` table is owned by `postgres`. Fixing it needs an owner decision about schema privileges, so it was reported rather than guessed. Phase 11's DB-touching gates hit the same wall)
- [x] **Phase 11: Account, Org & Case Journey Gates** - Signup, login, org, invites, case intake, RLS isolation (8/8 plans executed 2026-07-31; NOT complete. `bash scripts/ci-gates.sh` exits **0** with `ALL GATES PASSED (17/17)` — three new gates: **G16** journey registry integrity (static, order 7), **G18** tenant isolation (order 12), **G17** live journey run (order 13). **COV-06 complete**: fourteen isolation cases over four surfaces against a real local Supabase, every negative paired with a positive control, observed going red when `cases_org_member` was widened to `USING (true)` and green again after a reset. **JRNY-04 complete**: all seven guided-intake steps plus the `localStorage` draft-recovery path, each seeded from a complete committed draft. **JRNY-02 PARTIAL**: signup, both email-verification route states, login and session persistence are gated; **logout is not** — sign-out clears the session correctly (`sb-*` keys removed, signed-in chrome gone, zero console errors) but stays on `/` rendering the anonymous landing page instead of the sign-in card the rubric asserts, and whether it should redirect is a product decision no plan contains. **JRNY-03 PARTIAL**: invite acceptance and refusal are gated; **org creation is not** — driving the three onboarding screens found two real defects, a 406 from `getUserOrganization`'s `.single()` over a legitimately empty result, and a 400/PG 23502 that makes `saveFirmProfile` fail for every user because its upsert omits the NOT NULL `email`, swallowed by an empty `catch` so the user sees "You're all set!" while the attorney profile is silently discarded. Four withheld steps keep their rubrics committed but are absent from the registry with no approved reference, so the gate set claims no coverage it does not have. 15 steps registered, 15 references, all at `maxDiffPixels` 0. **Unmeasured:** CI has still never executed, so `supabase start` on a GitHub-hosted runner remains a recorded risk, not a claim)
- [x] **Phase 12: Wizard & Output Journey Gates** - Succession wizard, tax wizard, results, family tree, share link, SEO smoke (completed 2026-07-31)
- [x] **Phase 13: PDF Verification** - Structural, exact-peso, and perceptual gates on the generated PDF (7 plans in 4 waves, planned 2026-07-31. Planning measured a real defect: the PDF's non-embedded WinAnsi base-14 fonts write `₱` as `±` at near-zero advance width, so every amount in an exported report carries a corrupted currency mark that also splits the figure across lines under text extraction. Plan 13-01 fixes it with a PDF-local formatter. Gates G22–G25 take orders 17–20; the phase ends at 24 gates) (completed 2026-07-31)
- [x] **Phase 14: Lawyer-Blocked Legal Fixes & Legal Traceability** - Apply the lawyer's answers; trace every rule to a named vector (6/6 plans executed 2026-08-01; NOT complete. **LAW-13, LAW-14 and LAW-15 are gate-proven**; **LAW-06, LAW-07 and LAW-12 remain BLOCKED-ON-LAWYER** on LAWYER-06, LAWYER-04 and LAWYER-08 respectively — all three statuses in `.planning/lawyer-decisions.json` are still `awaiting-answer` with `answered_by`/`answered_on`/`answer` null, because the lawyer is sitting the bar exam. No reading of Art. 771, Art. 911, Art. 992 or RA 11642 Sec. 41 was adopted, implemented, defaulted or stubbed anywhere in the tree; each question is quoted verbatim in `.planning/BLOCKED-REQUIREMENTS.md`. Four gates added at the planned orders: **G26** blocked requirements (21), **G27** spec legal text (22), **G28** legal traceability (23), **G29** bugs ledger (24); G10, G11, G8 and G9 shifted to 25–28 with G9 still last, `order` the only field that moved and `gates.manifest.lock` gaining exactly four entries. `bash scripts/ci-gates.sh` prints **`ALL GATES PASSED (28/28)`** and exits 0, observed on three runs at ~5m28s each including once against the committed tree; requirement coverage rose 34/94 → **40/94**. LAW-13: the Art. 992 pre-*Aquino* framing, the Art. 900 ¶2 three-month trigger and the Art. 972 ¶1 omission corrected across both succession specs and `frontend/src/data/ncc-articles.ts` (the repository had **zero** mentions of *Aquino* before this phase), the vanishing-deduction list verified intact from Phase 8, and the resulting Art. 900 ¶2 spec-to-code divergence recorded under the literal marker `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs` rather than silently closed. LAW-14: 63 `// LEGAL-VECTOR: Art. NNN` markers inserted comment-only into already-passing tests with `cargo test` byte-identical at 543, then `engine/legal-rules.json` mapping **63 of 79** cited articles to exactly one named test function and **16** declared in the new shrink-only `engine/legal-traceability.lock`. LAW-15: BUG-001 **closed as non-reproducing** — its own committed JSON now sums to exactly ₱30,000,000 with both disinherited children at ₱0 — and **BUG-002 filed** against the real open defect at `engine/src/step7_distribute.rs:421` (the audit's `:313` moved after the Phase 7 and 8 fixes), where an institution of the entire free portion is reduced by the instituted heir's legitime so ₱3,750,000 of free portion emerges as `from_intestate` on an uninstituted heir while the sum invariant still holds. **BUG-002 is documented, not fixed, and no requirement owns it** — recorded in its own `### Owning requirement` section. `cargo test` 546 passed / 0 failed, up from 543)
- [x] **Phase 15: Extendability & Documentation Closeout** - Invariants a cheap agent must not violate, and a planning dir a stranger can read

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
**Status**: 5/5 Complete
**Plans**: 5 plans, 4 waves (wave 1 is two independent artifacts — one corpus, one test file; waves 2–4 are constrained by shared files, since 06-04 and 06-05 both edit the four gate-infrastructure files)
  - **Wave 1** — `06-01` Second generator, thirty green coverage cases, three defect cases, shrink-only defect ledger (COV-01) · `06-03` Every legal vector pinned to an exact scenario code, succession type, row count and per-heir centavos (COV-03)
  - **Wave 2** *(blocked on Wave 1: the invariant suite reads the corpora `06-01` creates)* — `06-02` One cargo test per named invariant, plus the bidirectional defect-ledger test (COV-01, COV-02)
  - **Wave 3** *(blocked on Wave 2 and Wave 1's sibling: coverage is measured over the test set `06-02` and `06-03` produce)* — `06-04` Per-module engine coverage report, shrink-only zero-coverage ledger, gate G12 at order 4 (COV-04)
  - **Wave 4** *(blocked on Wave 3: edits the same `gates.manifest.json`, `gates.manifest.lock`, `GATES.md` and `README.md`)* — `06-05` Assertion-discipline scanner, shrink-only ledger of the fifteen weak-only tests, gate G13 at order 5 (COV-05)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test or assertion may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - No locked gate `command` string may change. Gates G12 and G13 are added by appending to `gates.manifest.json` and `gates.manifest.lock` together; `order` is unlocked, so both take orders 4 and 5 ahead of G1 and G9 stays last
  - Both new gates run ahead of G3, which stays red for Phase 5's unresolved OBS-05/OBS-06 product decision. `ALL GATES PASSED (13/13)` is NOT achievable in this phase and must not be claimed; Phase 6 neither edits the five failing tests nor appends to `frontend/test-baseline.json` or `gate-skips.lock`
  - No check may rewrite its own input — no `--update`, `--fix`, `--accept`, `--regenerate` or waiver flag on any artifact in this phase; the three new ledgers (`engine/defect-baseline.json`, `coverage-zero.lock`, `assertion-baseline.json`) are all shrink-only and no script writes them
  - Every failure path of every new check must be observed firing against a committed fixture or a scratch copy
  - Every new check is dependency-free Node ESM or Bash using only `node:` builtins; the only new dependency in the phase is the rustup component `llvm-tools-preview`, and neither `engine/Cargo.toml`, `engine/Cargo.lock` nor `frontend/package.json` is touched
  - No point of Philippine law arises anywhere in this phase. Every scenario-code expectation is transcribed from `specs/inheritance-engine-spec.md` §14.2, every peso figure is either the spec's own stated amount or a measured value pinned as a labelled characterization, and the two vectors governed by open questions cite LAWYER-03 and LAWYER-04 rather than answering them

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
**Plans**: 4 plans, 4 waves (strictly sequential — three of the four plans edit both `engine/src/step2_lines.rs` and `engine/src/step7_distribute.rs`, and each tier must be fixed end to end so `cargo test` is green between waves)
  - **Wave 1** — `07-01` Ascendant tier end to end: per-category anchor selection, the ascending-line representation ban, and Regime B distribution by nearest living degree and by line (LAW-01, LAW-04)
  - **Wave 2** *(blocked on Wave 1: extends the same `anchor_ids_for_category` function and the same step-7 file)* — `07-02` Collateral tier: sibling anchors at degree 2, one-level collateral representation, anchor-aware step-7 filters, the LAWYER-03 mixed-blood flag, and the defect-ledger shrink (LAW-02)
  - **Wave 3** *(blocked on Wave 2: reuses the `degree_yields_a_line` predicate wave 2 adds and edits the same two files plus step 9)* — `07-03` Descendant tier: Art. 969 promotion of the following degree, `get_lc_lines` routed through the shared anchor set, degree-scoped total-repudiation detection (LAW-03)
  - **Wave 4** *(blocked on Waves 1–3: the vectors assert the behaviour all three produce)* — `07-04` Four named regression vectors, WASM rebuild, frontend ledger comparison, requirement closeout (LAW-01, LAW-02, LAW-03, LAW-04)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No test, assertion or gate may be deleted, skipped, weakened or loosened; a gate that cannot legitimately pass is reported BLOCKED with the real command output. No pre-existing expected value in `engine/tests/integration.rs` may be edited — `07-RESEARCH.md` §6.1 establishes that TV-15, TV-19, TV-20 and TV-23 do not move
  - `cd engine && cargo test` must report 0 failed at the end of every task, and the passing count may not fall below 481
  - The recorded question LAWYER-03 must not be answered. Making collateral representation real makes `distribute_nephews_only` reachable for the first time; its arithmetic, its `Art. 975` basis and its `LAWYER-DECISION: LAWYER-03` marker stay untouched, a manual-review flag fires on the mixed-blood shape, and no test pins a centavo value for that shape
  - `engine/defect-baseline.json` may only shrink; the LAW-02 entry is deleted by the plan that makes it stale, and the two LAW-06 entries stay
  - No gate is added, removed, reordered or given a new command; `gates.manifest.json`, `gates.manifest.lock`, `gate-skips.lock`, `frontend/test-baseline.json` and `GATES.md` are not touched. `bash scripts/ci-gates.sh` still halts at G3 for Phase 5's unresolved OBS-05/OBS-06 decision, so `ALL GATES PASSED (13/13)` is not achievable in this phase and must not be claimed

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
**Plans**: 8 plans, 5 waves (each wave pairs one engine plan with one tax-engine plan whose file sets are disjoint; the pairs serialize because 08-01 and 08-03 share `step6_validation.rs`, 08-02 and 08-04 share `specs/estate-tax-engine-spec.md`, 08-05 and 08-07 share `engine/tests/integration.rs`, and 08-06 consumes the corrected tax numbers)
  - **Wave 1** — `08-01` A collated donation *inter vivos* defeats preterition; the Art. 1062 exempted case is flagged and recorded as `LAWYER-09` (LAW-05) · `08-02` The TRAIN-repealed medical deduction is no longer granted, recommended or certified by spec TV-02 (LAW-08)
  - **Wave 2** *(blocked on Wave 1: `08-03` edits the same `step6_validation.rs`, `08-04` edits the same spec file)* — `08-03` Preterition preserves non-inofficious legacies and flags the dispositions the engine cannot value (LAW-05) · `08-04` Transfers for public use enter the vanishing-deduction ratio in both regimes (LAW-09)
  - **Wave 3** *(blocked on Wave 2: `08-05` asserts the behaviour `08-03` produces, `08-06` consumes the deduction figures `08-04` corrects)* — `08-05` Four named LAW-05 regression vectors plus a corpus re-measurement (LAW-05) · `08-06` The bridge hands the succession engine the Art. 908 distributable estate, not net taxable estate minus tax (LAW-10)
  - **Wave 4** *(blocked on Wave 3: shares `engine/tests/integration.rs` with `08-05`)* — `08-07` Reserva troncal is enterable, flagged, and expressly declared uncomputed (LAW-11)
  - **Wave 5** *(blocked on Waves 3-4: rebuilds the WASM from every engine change and measures the frontend against it)* — `08-08` WASM rebuild, frontend ledger comparison, full gate run, requirement closeout (LAW-05, LAW-08, LAW-09, LAW-10, LAW-11)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No test, assertion or gate may be deleted, skipped, weakened or loosened; a gate that cannot legitimately pass is reported BLOCKED with the real pasted command output. Where a committed test asserts a repealed rule (the six medical-deduction expectations), the expectation is **corrected to the statute** and the file gains tests rather than losing them
  - `cd engine && cargo test` must report 0 failed at the end of every task, rising from the measured 527 baseline to at least 543
  - `cd frontend && npx tsc -b --force`, never bare `tsc -b` — the committed `tsconfig.tsbuildinfo` can otherwise mask errors
  - `frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json` and `assertion-baseline.json` may only shrink and are edited by no plan; a newly failing frontend test is a BLOCKED condition, never a reason to append a ledger entry
  - No gate is added, removed, reordered or given a new command. `bash scripts/ci-gates.sh` still halts at `G3` for Phase 5's unresolved OBS-05/OBS-06 decision, so `ALL GATES PASSED (13/13)` is not achievable in this phase and must not be claimed
  - Exactly one point of Philippine law arises and it is *recorded, never decided*: whether a donation the Code exempts from collation (Arts. 1062, 1066-1068, 1070) nevertheless defeats preterition under *Morales*' total-omission test. Plan 08-01 ships it as `LAWYER-09` with `**Status:** awaiting-answer`, adds it to `REQUIRED_IDS` in `scripts/check-lawyer-agenda.mjs`, and makes the engine emit a `preterition_exempt_donation` flag on exactly that shape. `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` returning 0 is an acceptance criterion in three plans

### Phase 9: Single Source of Truth — Dedup Classifiers & Money Types
**Goal**: Exactly one implementation of scenario classification and exactly one money representation survive, closing off the failure mode where a screenshot gate could faithfully certify a wrong "Predicted:" badge.
**Depends on**: Phase 1 (build/typecheck must work to verify deletions are safe)
**Requirements**: EXT-01, EXT-02, EXT-03, EXT-04
**Success Criteria** (what must be TRUE):
  1. `bridge.ts`'s dead `predictScenario()`/`computeMock()` and `ReviewStep.tsx`'s live, wrong `predictScenario()` are deleted; the "Predicted:" badge is backed by the real engine (or removed).
  2. A documented rule plus an automated check (lint rule, CI grep, or equivalent) fails the build if a second implementation of a legal rule is reintroduced.
  3. A peso value can no longer be passed where a centavo value is expected without a compile error, at every money-handling boundary in both wizards.
  4. `npm run build` produces a bundle with no remaining path capable of computing a legally meaningless number.
**Plans**: 6 plans, 3 waves (wave 1 is three independent artifacts across the engine and the type layer; waves 2 and 3 are strictly sequential because each consumes the previous wave's output)
  - **Wave 1** — `09-01` Engine-side classification entry point, proven equal to the pipeline on all 173 committed inputs (EXT-01, EXT-04) · `09-02` Revive invariant 6 and clear the engine dead-code inventory (EXT-04) · `09-03` Branded peso and centavo units, negative type test, succession-wizard boundary (EXT-03)
  - **Wave 2** *(blocked on Wave 1: `09-04` imports the `classify_json` export `09-01` builds, and `09-05` imports the converters `09-03` defines)* — `09-04` Delete both frontend scenario classifiers and back the badge with the engine (EXT-01, EXT-04) · `09-05` Peso and centavo units across the estate-tax wizard boundary, one converter (EXT-03, EXT-02)
  - **Wave 3** *(blocked on Wave 2: the four registry rules are only at their ceilings once `09-04` and `09-05` have deleted the duplicates)* — `09-06` Single-source-of-truth rule, registry and gate G14 at order 6 (EXT-02)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .`, and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test or assertion may be weakened to pass. The three badge tests are *strengthened* from `/I\d/` and `/T\d/` to the exact codes `I2` and `T2`; adding an `await` to reach an async render is not loosening
  - `npx tsc -b --force`, never bare `tsc -b`. Gate G4 becomes order 10 and therefore runs after the G3 halt, so EXT-03 is proven by running it directly
  - A unit error surfaced by the new money types is fixed with the correct conversion or reported BLOCKED — never with `as any`, `as unknown as`, or a field widened back to `number`
  - The five shrink-only ledgers (`frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json`, `coverage-zero.lock`) are read-only in this phase; a sixth `UNKNOWN FAILURE` is a BLOCKED condition, never a ledger append
  - G14 is added by appending to `gates.manifest.json` and `gates.manifest.lock` together; `order` is unlocked, so G14 takes order 6 ahead of the G3 halt and G9 stays last. `ALL GATES PASSED (14/14)` is NOT achievable in this phase and must not be claimed
  - No point of Philippine law arises anywhere in this phase; nothing is added to `.planning/LAWYER-AGENDA.md`

### Phase 10: Journey Gate Infrastructure — Seeding, Rubric, Artifacts
**Goal**: The seams every later per-step screenshot gate depends on — direct state seeding, a structured vision rubric, diff/rubric failure separation, and durable failure artifacts — exist before any journey-specific gate is written.
**Depends on**: Phase 1 (build), Phase 3 (local Supabase for DB-row seeding)
**Requirements**: JRNY-01, JRNY-09, JRNY-10, JRNY-12
**Success Criteria** (what must be TRUE):
  1. Any UI state needed by a later gate (a DB row, a `localStorage` draft, a route param, or app context) can be seeded directly by a test without clicking through preceding steps, with the seams documented.
  2. A vision rubric used by any gate is a fixed list of yes/no assertions returning structured output, never free-form judgment.
  3. A gate failure report clearly distinguishes a perceptual-diff failure from a rubric failure, and a documented flow exists for re-approving a reference image.
  4. Every gate failure writes the screenshot, the diff image, and the failing assertion text to a durable, inspectable location.
**Plans**:

**Wave 1**
  - 10-01 — pin playwright/pixelmatch/pngjs, the fixed-determinism browser launch helper, and two committed HTML fixtures

**Wave 2** *(blocked on Wave 1 completion)*
  - 10-02 — the deterministic rubric evaluator: eight assertion kinds, structured per-assertion output, unknown kinds rejected
  - 10-03 — perceptual diff, the five named failure markers, and the separate reference re-approval command

**Wave 3** *(blocked on Wave 2 completion)*
  - 10-04 — durable failure artifacts: screenshot, reference, diff image, assertions.json and FAILURE.txt, gitignored and pruned
  - 10-05 — URL-addressable wizard steps plus the seeding helpers, with a live-database smoke script

**Wave 4** *(blocked on Wave 3 completion)*
  - 10-06 — gate G15 registration at order 6, GATES.md section 12, and the JOURNEY.md seams document

Cross-cutting constraints:
  - The harness is plain `.mjs` under `frontend/journey/`, so `frontend/tsconfig.json` is untouched and gate G4 is unaffected
  - No golden reference image of the real application is committed in this phase; cross-platform rasterisation is unmeasured until CI runs, and Phases 11-12 own real references
  - Only `approve.mjs` may write into `frontend/journey/references/`; no gate may approve its own reference
  - The gate id is **G15**, not G14 — Phase 9's unstarted `09-06` reserves G14. G15 takes `order` 6, ahead of the inherited G3 halt, and G9 stays last
  - `ALL GATES PASSED (14/14)` is NOT achievable in this phase and must not be claimed
  - No point of Philippine law arises anywhere in this phase; nothing is added to `.planning/LAWYER-AGENDA.md`

### Phase 11: Account, Org & Case Journey Gates
**Goal**: The account-level and case-intake money-path steps are verified end to end against a real local Supabase, including tenant isolation.
**Depends on**: Phase 10 (seeding/rubric infra), Phase 3 (local Supabase + seed fixture)
**Requirements**: JRNY-02, JRNY-03, JRNY-04, COV-06
**Success Criteria** (what must be TRUE):
  1. Signup, email verification, login, logout, and session persistence each have a passing screenshot-plus-rubric gate run against seeded state.
  2. Org creation and invite acceptance each have a passing screenshot-plus-rubric gate.
  3. Case intake, including recovery from a `localStorage` draft, is verified step by step.
  4. A test run against a real local Supabase proves a user in org A cannot read, write, or enumerate org B's cases, PDFs, or shared links.
**Plans**: 8 plans in 4 waves.

**Wave 1** *(no dependencies)*
  - `11-01` — PostgREST role grants (migration 014), collapse `get_shared_case` to one signature (migration 015), extend `seed.sql`/`fixtures.json` with two `case_pdfs` rows, an org-less user and a pending invitation, plus `journey/db-access-probe.mjs` [COV-06]
  - `11-02` — fix the three measured product defects (`createOrganization` argument order at `auth.tsx:85` and `auth/callback.tsx:32`; `/invite/$token` swallowing `success:false`; `settings/team.tsx` reading a non-existent `profiles` table) and add nineteen `data-testid` hooks [JRNY-02, JRNY-03, JRNY-04]

**Wave 2** *(blocked on Wave 1 completion)*
  - `11-03` — the live journey runner: `journey/serve.mjs`, `session.mjs`, `actions.mjs`, `resets.mjs`, `run.mjs`, the `journey/steps/` registry directory and the first approved reference [JRNY-02]
  - `11-04` — `journey/rls-isolation.mjs` and its fourteen-case table across four surfaces, every negative paired with a positive control [COV-06]

**Wave 3** *(blocked on Wave 2 completion)*
  - `11-05` — five account steps: signup, the two email-verification route states, session persistence and logout [JRNY-02]
  - `11-06` — five org steps: three onboarding screens driven by real form submissions, plus invite acceptance and refusal, each with a named database reset [JRNY-03]
  - `11-07` — eight guided-intake steps, each seeded from a complete committed draft, including the `localStorage` recovery path [JRNY-04]

**Wave 4** *(blocked on Wave 3 completion)*
  - `11-08` — register **G16** (static journey registry integrity, order 7), **G18** (tenant isolation, order 12) and **G17** (live journey run, order 13); add `GATES.md` section 13; provision the Supabase CLI, the local stack and chromium in `.github/workflows/inheritance-ci.yml` [JRNY-02, JRNY-03, JRNY-04, COV-06]

**Cross-cutting constraints:**
  - A reference image may be approved only after that step's rubric has already passed, and `maxDiffPixels` stays at `0` on every sidecar; `journey/approve.mjs` remains the only writer into `journey/references/`.
  - `anon` receives no table privilege anywhere in this phase; the only anonymous data path is the `SECURITY DEFINER` `get_shared_case` RPC.
  - The whole gate run moves from 14 gates to 17, and `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (17/17)`.
  - No point of Philippine law arises anywhere in this phase; nothing is added to `.planning/LAWYER-AGENDA.md`.
  - **Unmeasured:** whether `supabase start` succeeds on a GitHub-hosted runner is unknown — this project's CI has never executed (Phase 1's GATE-04 finding) — so plan 11-08 records that as a risk rather than a claim.
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
**Plans**: 9 plans in 4 waves.

**Wave 1** *(no dependencies; three disjoint file sets)*
  - `12-01` — back the succession wizard's "Predicted:" badge with the real engine, deleting the live duplicate classifier in `ReviewStep.tsx`, and strengthen its three tests to exact engine-measured codes [EXT-01, EXT-04]
  - `12-02` — widen the journey registry's two frozen requirement lists, add `journey/engine.mjs` as the single harness-side engine loader, and add the `case-alpha-no-output` and `case-alpha-computed` resets [JRNY-05, JRNY-06, JRNY-07, JRNY-08]
  - `12-05` — the SEO smoke: fourteen committed public routes, each asserted to render an `h1`, log no console error, and fetch nothing answering HTTP 400 or above [JRNY-11]

**Wave 2** *(blocked on Wave 1 completion)*
  - `12-03` — six succession-wizard screens, each reached by `?step=` alone; the review rubric pins the badge to `I2` [JRNY-05]
  - `12-04` — eight estate-tax tabs, each reached by `?tab=` alone; each rubric pairs the selected tab button with the panel it renders [JRNY-06]
  - `12-06` — the results view and the family-tree visualizer, reached by clicking the real compute button, plus seven per-heir `data-testid` hooks [JRNY-07]
  - `12-07` — three share-link states plus `journey/share-exposure.mjs`, asserting the anonymous RPC's exact six-column set and nine forbidden names [JRNY-08]

**Wave 3** *(blocked on Wave 2 completion)*
  - `12-08` — `journey/money-parity.mjs`: every displayed peso figure compared as an exact centavo integer against an engine computation performed during the same run [JRNY-07]

**Wave 4** *(blocked on Wave 3 completion)*
  - `12-09` — register **G19** money parity (order 14), **G20** share exposure (order 15) and **G21** SEO smoke (order 16); `GATES.md` section 14; the `JOURNEY.md` wizard and output sections; raise the CI timeout to 60 minutes [JRNY-05, JRNY-06, JRNY-07, JRNY-08, JRNY-11]

Cross-cutting constraints (appear in 2+ plans):
  - A reference is approved only after that step's rubric has already passed; `maxDiffPixels` stays `0` on every sidecar and `node journey/approve.mjs <stepId>` remains the only writer into `journey/references/`
  - No rubric assertion carries a peso figure. Every money claim in the phase is made by G19 against a live recomputation, never by a committed expected figure
  - `frontend/supabase/seed.sql` and `frontend/supabase/fixtures.json` are not edited anywhere in the phase. `scripts/check-seed-fixture.mjs` rejects a seeded engine result with `SEED WRITES OUTPUT`, so the results view is reached by the product computing in the browser
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited
  - No test, assertion, rubric or gate may be weakened to pass; `allowConsoleErrors` is `false` on all twenty-eight new steps and a gate that cannot legitimately pass is reported BLOCKED with the real command output
  - The five shrink-only ledgers (`frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json`, `coverage-zero.lock`) are read-only; a newly failing test is a BLOCKED condition, never a ledger append
  - Every new gate prints `GATE-SKIPS total=<n> skipped=<n>` on both its pass and its fail path and uses the three-valued exit contract 0/1/2
  - `G14` stays reserved and unused for Phase 9's `09-06`; the new ids are G19, G20 and G21, `G9` stays last, and `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (20/20)`
  - The four Phase 11 steps withheld as BLOCKED (`auth-signed-out` and the three onboarding screens) stay withheld — they belong to JRNY-02 and JRNY-03
  - No point of Philippine law arises anywhere in this phase; the one legal value asserted, the scenario code `I2`, is read out of the engine's own output by running a command
  - **Unmeasured:** this project's CI has still never executed, so whether twenty gates fit inside the raised 60-minute timeout on a GitHub-hosted runner is a recorded risk, not a claim
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
**Plans**: 7 plans in 4 waves.

**Wave 1** *(no dependencies; two disjoint file sets)*
  - `13-01` — a PDF-only money and text formatter, because the PDF's non-embedded WinAnsi base-14 fonts write `₱` as `±` at near-zero width; the four sections that draw money or narrative text route through it and six committed expectations are corrected [PDF-02]
  - `13-02` — `journey/pdf.mjs`, the single PDF-reading seam over `pdftotext`, `pdfinfo` and `pdftoppm`, plus the probe that proves all three against a document it generates at run time [PDF-01]

**Wave 2** *(blocked on Wave 1 completion)*
  - `13-03` — the shared capture: `data-testid="export-pdf"` on the product's own button, a fixed page clock so the report date stops moving, and `captureExportedPdf` returning the downloaded bytes beside an engine computation of the same case [PDF-01]
  - `13-04` — `journey/print-layout.mjs`: print typeface, body size, hidden chrome, shown print-only elements, A4 read out of the browser's printed document, and margins measured as the distance from paper edge to first ink [PDF-05]

**Wave 3** *(blocked on Wave 2 completion)*
  - `13-05` — `journey/pdf-structure.mjs`: a run-derived required-section list, exact-centavo money comparison in both directions, and per-heir citation and narrative evidence [PDF-01, PDF-02, PDF-03]
  - `13-06` — `journey/pdf-visual.mjs` plus a separate `pdf-approve.mjs` and a separate `journey/pdf-references/` directory, so the perceptual gate cannot write its own expectation and G16 stays intact [PDF-04]

**Wave 4** *(blocked on Wave 3 completion)*
  - `13-07` — register **G22** pdf toolchain (order 17), **G23** pdf structure (18), **G24** pdf visual (19) and **G25** print layout (20); `GATES.md` section 15; the `JOURNEY.md` PDF section; the CI poppler install; requirement closeout [PDF-01…PDF-05]

Cross-cutting constraints (appear in 2+ plans):
  - No test, assertion or gate is deleted, skipped or weakened. Nothing in this phase closes a weak assertion: `print-layout.test.ts` and the `typeof mod.generatePDF` check both **no longer exist in the tree**, so every requirement is closed by adding verification that was absent
  - No expected peso figure is committed anywhere. Every expected amount is produced by `journey/engine.mjs` during the run, the same discipline gate G19 established
  - All money comparison is `BigInt`; no tolerance, epsilon, `Math.abs`, `toFixed` or `Number(` appears in any comparison path
  - `frontend/src/types/index.ts` is not edited and no file under `engine/` is edited — the currency-token fix is confined to `src/components/pdf/`, so the web user interface keeps rendering `₱`
  - Exactly one attribute is added to application source (`data-testid="export-pdf"`), plus one pre-authorised single-line change to `pdf-export.ts` that applies only if the download probe fails
  - Every new gate prints `GATE-SKIPS total=<n> skipped=<n>` on both its pass and its fail path and uses the three-valued exit contract 0/1/2, with a missing PDF toolchain always exit 2
  - PDF page references live under `frontend/journey/pdf-references/`, never `frontend/journey/references/`, because `scripts/check-journey-registry.mjs` raises `ORPHAN REFERENCE` for any image there that is not a declared browser step; `maxDiffPixels` stays `0` and only `journey/pdf-approve.mjs` writes a reference
  - The five shrink-only ledgers (`frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json`, `coverage-zero.lock`) are read-only; a newly failing test is a BLOCKED condition, never a ledger append
  - `G14` stays reserved and unused for Phase 9's `09-06`; the new ids are G22–G25, `G9` stays last, and `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (24/24)`
  - No point of Philippine law arises anywhere in this phase. Article citations are asserted **present and matching the engine's own `legal_basis`**, never asserted correct
  - **Unmeasured:** this project's CI has still never executed, so whether twenty-four gates fit inside the sixty-minute timeout, and whether a hosted runner's substitution fonts rasterise identically to the observed `fonts-urw-base35 20200910-1`, are recorded risks rather than claims

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
**Plans**: 6 plans, 4 waves (strictly sequential across the engine-touching plans, because 14-01, 14-02 and 14-05 each measure `cargo test` counts and a concurrent run would move another plan's baseline)

  Planning measured the ground truth for all six requirements, and it changes the shape of this phase:
  criteria 1–3 are **not achievable** — LAWYER-04, LAWYER-06 and LAWYER-08 are all still
  `awaiting-answer` in `.planning/lawyer-decisions.json` (the lawyer is sitting the bar exam), so
  LAW-06, LAW-07 and LAW-12 are planned as a gated BLOCKED record, never as a guessed implementation.
  Criterion 4 is three-quarters open and one-quarter already done: the vanishing-deduction paragraph
  list was corrected in Phase 8 under LAW-09, while the Art. 992, Art. 900 ¶2 and Art. 972 ¶1
  passages are untouched (`grep -rin aquino specs/` returns zero hits). Criterion 6's line number has
  moved: BUG-001's committed JSON now sums to exactly ₱30,000,000 with both disinherited children at
  ₱0, so it does not reproduce, and the real defect it was masking is at `step7_distribute.rs:421`
  after the Phase 7 and Phase 8 fixes, not `:313`. Criterion 5 is sized by measurement: the engine's
  production code cites 79 distinct articles, 63 of which already have a passing test that cites the
  same article, so the phase traces those 63 and declares the remaining 16 in a shrink-only ledger.

  - **Wave 1** — `14-01` 63 `LEGAL-VECTOR` markers, one per traced article (LAW-14) · `14-03` blocked-requirements ledger and gate G26 for LAW-06/LAW-07/LAW-12 (LAW-06, LAW-07, LAW-12) · `14-04` the spec's four misstatements of law and gate G27 (LAW-13)
  - **Wave 2** *(blocked on Wave 1: both plans measure `cargo test` counts)* — `14-02` BUGS.md reconciliation, `engine/tests/bugs_ledger.rs` and gate G29 (LAW-15)
  - **Wave 3** *(blocked on Wave 2: consumes 14-01's markers and must not race 14-02's new test file)* — `14-05` traceability registry, shrink-only untraced ledger and gate G28 (LAW-14)
  - **Wave 4** *(blocked on Waves 1–3: registers the four gates the earlier plans built)* — `14-06` gates G26–G29 at orders 21–24, `GATES.md`, requirement records, full runner (LAW-06, LAW-07, LAW-12, LAW-13, LAW-14, LAW-15)

  Cross-cutting constraints (appear in 2+ plans):
  - No point of Philippine law may be decided. LAW-06, LAW-07 and LAW-12 stay open on LAWYER-06, LAWYER-04 and LAWYER-08; every legal sentence written into a spec or into `engine/BUGS.md` is a verbatim quotation already transcribed in `.planning/research/LEGAL-CONFORMANCE.md`, attributed as such
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No gate, test or assertion may be weakened to pass; a check that cannot legitimately pass is reported BLOCKED with the real pasted command output
  - Every failure path of every new check is observed firing against a committed fixture, and no new check has a `--fix`, `--update`, `--accept`, `--regenerate` or waiver flag
  - Every new check emits exactly one `GATE-SKIPS total=<n> skipped=0` line; `gate-skips.lock` is owner-owned and gains no entry, so declared coverage gaps go in `engine/legal-traceability.lock` instead
  - `G14` stays reserved and unregistered for Phase 9's `09-06`; the new ids are G26–G29 at orders 21–24, G10/G11/G8/G9 shift to 25–28 with `G9` still last, and `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (28/28)`

### Phase 15: Extendability & Documentation Closeout
**Goal**: A returning owner or a new collaborator can determine current state, what's verified, and what's next from the planning directory alone, and `CLAUDE.md` states the invariants that prevent the regressions no test would catch.
**Depends on**: All prior phases (reflects final project state)
**Requirements**: EXT-05, EXT-06, EXT-07, EXT-08
**Success Criteria** (what must be TRUE):
  1. `CLAUDE.md` states the invariants an implementing agent must not violate: unit conventions, single-source-of-truth rules, and what requires a lawyer.
  2. A documented procedure exists for adding a new legal rule: article → vector → implementation → gate.
  3. A pass over `.planning/` and `specs/` finds no remaining claim contradicted by the current code, or each surviving one is explicitly listed as accepted debt.
  4. A returning owner can open the planning directory alone and determine current state, what is verified, and what is next.
**Plans**: 5 plans in 4 waves.

  Planning measured the ground truth for all four requirements, and two measurements shape the phase.
  First, `CLAUDE.md`'s stack, conventions and architecture sections are **copies** of
  `.planning/codebase/*.md` dated 2026-07-27, before any phase ran — so eleven measured stale claims
  must be corrected in both places or the next regeneration reinstates them. Second, EXT-08's failure
  is countable rather than impressionistic: `.planning/ROADMAP.md`'s own Progress table disagrees with
  the filesystem on **7 of 15 rows**, reporting Phase 14 as `0/TBD  Not started` against six committed
  plans and six committed summaries, while the checkbox list above it marks phases 6, 7 and 8 `[x]`.
  A hand-written orientation page decays the same way — `RESUME.md` went stale within four days — so
  every number Phase 15 writes is re-derived from the filesystem by a gate on every run.

**Wave 1** *(no dependencies; two disjoint file sets)*
  - `15-01` — grow `CLAUDE.md`'s invariants section from three rules to six, adding money units,
    single-source-of-truth and what requires a lawyer, each naming its enforcing gate command;
    `scripts/check-claude-invariants.mjs` holds the section and fails if a regeneration swallows it
    [EXT-05]
  - `15-02` — `.planning/NEW-LEGAL-RULE.md`: article → vector → failing run → one-site implementation
    → registration, with a worked example re-resolved against `engine/legal-rules.json` and the real
    engine tree on every run [EXT-06]

**Wave 2** *(blocked on Wave 1: `15-03` edits the same `CLAUDE.md`)*
  - `15-03` — correct eleven measured stale claims in `CLAUDE.md` and the five `.planning/codebase/*.md`
    files it is generated from; open the shrink-only `.planning/DOC-DEBT.md` with the seven surviving
    contradictions; `scripts/check-doc-claims.mjs` probes the tree at run time rather than pinning an
    expected value [EXT-07]

**Wave 3** *(blocked on Wave 2: `.planning/ORIENTATION.md` points at both `15-02`'s and `15-03`'s artifacts)*
  - `15-04` — `.planning/ORIENTATION.md`, the reconciled ROADMAP Progress table, `STATE.md`'s
    counters and `RESUME.md`'s gate count; `scripts/check-planning-truth.mjs` re-derives every number
    from `.planning/phases/` and the frozen manifest [EXT-08]

**Wave 4** *(blocked on Waves 1–3: registers the four gates the earlier plans built)*
  - `15-05` — register **G30** claude invariants (order 25), **G31** new rule procedure (26),
    **G32** doc claims (27) and **G33** planning truth (28); `GATES.md` sections 20–23; `README.md`
    pointers; close EXT-05…EXT-08 [EXT-05, EXT-06, EXT-07, EXT-08]

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No test, assertion or gate may be weakened, deleted, skipped or loosened to make anything pass; a check that cannot legitimately pass is reported BLOCKED with the real pasted command output
  - Every failure path of every new check is observed firing against a committed fixture, and no new check has a `--fix`, `--update`, `--accept`, `--regenerate` or waiver flag — the only flags are read-only path overrides so fixtures can drive each path
  - Every new check is dependency-free Node ESM using `node:` builtins only, prints exactly one `GATE-SKIPS total=<n> skipped=0` line on every exit path, and uses the three-valued exit contract 0/1/2 with a missing input always exit 2
  - No expected value is hardcoded in a documentation check. Every claim is paired with a probe measured from the tree at run time, and no check pins a test count, a peso figure or a line number — all three move for legitimate reasons and would produce false red
  - The five shrink-only ledgers plus `engine/legal-traceability.lock` and the new `.planning/DOC-DEBT.md` are read-only outside the plan that creates them; appending an entry to turn a check green is prohibited
  - `G14` stays reserved and unregistered for Phase 9's `09-06`; the new ids are G30–G33 at orders 25–28, G10/G11/G8/G9 shift to 29–32 with `G9` still last, and `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (32/32)`
  - No point of Philippine law arises anywhere in this phase; `specs/` legal prose is explicitly out of scope because gate G27 already owns it, and the new-rule procedure *routes* a legal question to `.planning/LAWYER-AGENDA.md` rather than answering one

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Gate Foundations | 4/4 | Complete | 2026-07-31 |
| 2. Loop Durability & Commit Discipline | 6/6 | Complete | 2026-07-31 |
| 3. Reproducible Environment & Gate Reporting | 5/5 | Complete | 2026-07-31 |
| 4. Lawyer Review Agenda Recorded | 5/5 | Complete | 2026-07-31 |
| 5. Engine Observability Restored | 7/7 | Complete | 2026-07-31 |
| 6. Property-Test Coverage Depth | 5/5 | Complete | - |
| 7. Intestate Order & Representation Root-Cause Fixes | 4/4 | Complete | - |
| 8. Remaining Unblocked Legal & Tax-Bridge Defects | 8/8 | Complete | - |
| 9. Single Source of Truth — Dedup Classifiers & Money Types | 6/6 | Complete | - |
| 10. Journey Gate Infrastructure | 6/6 | Complete | - |
| 11. Account, Org & Case Journey Gates | 8/8 | Complete | - |
| 12. Wizard & Output Journey Gates | 9/9 | Complete | 2026-07-31 |
| 13. PDF Verification | 7/7 | Complete | 2026-07-31 |
| 14. Lawyer-Blocked Legal Fixes & Legal Traceability | 6/6 | Complete | - |
| 15. Extendability & Documentation Closeout | 5/5 | Complete | 2026-08-01 |
