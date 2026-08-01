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

**Milestone v2.0 — Launch Readiness (Phases 16–27).** Roadmapped 2026-08-01; Phase 16 executed, 17–27 not yet planned.

- [x] **Phase 16: Stabilise the Deletion Milestone** - Finish the deferred cuts and get `ci-gates.sh` back to exit 0 (6/6 plans executed 2026-08-01; **NOT complete — CUT-04 is BLOCKED on the owner and is explicitly not claimed**. `bash scripts/ci-gates.sh` exits **1**, failing at **G3** with `TEST COUNT DROPPED: ran 2073 tests, floor is 2119`. Nine gates pass first — G5, G6, G7, G12, G13 (2009 assertions), G15, G16 (`steps=25 references=25`), G1, G2. **CUT-01 complete**: the guided intake goes 7 steps → 4 (Decedent Info, Family Composition, Asset Summary, Review & Save), `lib/conflict-check.ts` and seven orphaned intake types deleted, indices removed highest-first with `tsc -b --force` green between every edit so the earlier reverted regex attempt was not repeated; 46 tests retired, every one a test whose subject module the cut deleted, none weakened and no skip/todo marker introduced. 16-05 also found and fixed a **product defect the cut left behind** — `16-03` renumbered one step heading and missed three, so the wizard rendered "Step 1 of 4" above "Step 3: About the Decedent". **CUT-02 closed by measurement, not by code**: the inherited "~1,465 failures from a missing ResizeObserver" premise is false — `src/test-setup.ts` has carried the polyfill plus the `scrollIntoView` and `hasPointerCapture` shims since `181ae68c5` ("342 failures to 46"), untouched by this phase. **CUT-03 complete**: journey `failed=24 → 7`. The sidebar region was made numeric before any approval (`AppLayout.tsx:40` `w-64` = 256px of a 1280×800 capture → x ∈ [0,255]) and differing pixels were measured exhaustively rather than sampled; the 14 approved steps shared a byte-identical `n=1688, x=[12,243], y=[215,287]` signature and were viewed to confirm the Blog nav removal, approved `--by deletion-milestone-nav-change` at `maxDiffPixels: 0`. **Ten steps were refused approval and reported for human review**: `results-view`/`results-family-tree` differ out to **x=1084** — the `Share` button, `Documents` and `Case Notes` sections are gone, content and not navigation — and the five surviving intake steps, whose registry was rebuilt to post-cut truth by a screen-preserving remap that wrote **no** reference image (their rubrics now pass 5/5 and 6/6 against the live DOM, proving the remap correct; only their reference images are stale). **CUT-04 BLOCKED, two independent owner decisions**: (A) lowering `min_total_tests` 2119 → 2073, precedent `4ccf06270`; (B) **G20/G21 are registered blocking gates whose scripts `4ccf06270` deleted** — not reached in this run because the suite halts at G3, so clearing (A) alone advances the failure to G20 rather than making the suite green. No baseline, ledger or gate manifest was touched by any phase-16 commit)
- [x] **Phase 17: Citation Integrity — One Attribution Authority** - The engine emits the article; no other layer may derive one
- [x] **Phase 18: One Fact Set, Keyed on Date of Death** - One date of death, shared, with a blocking equality check
- [x] **Phase 19: Wizard Persistence That Actually Persists** - A nine-heir family tree survives a refresh (6/6 plans executed 2026-08-01. **SAVE-01…SAVE-05 all closed and proven.** `useAutoSave` was dead code: `setAutoSaveInput` had 2 call sites, both inside the `[caseId]` load effect, 0 outside. Measured baseline of the unmodified hook: `OPEN_ONLY_SAVES=1`, `INPLACE_EDIT_SAVES=0`, `UNMOUNT_FLUSH_SAVES=0` — confirming planning correction 1, that the reference guard was **not** inert but wrote back exactly what it had just read. Now: a `methods.watch()` subscription reaches the hook through an optional `onChange` prop, the guard compares `stableStringify` values, the unmount cleanup **flushes**, and `SaveStatusBadge` shows the state. **Four test files grown, none weakened, skipped=0**: `useAutoSave` 7→14, `WizardContainer` 17→25, plus new `stable-stringify` 8 and `SaveStatusBadge` 6, +29 cases. **THE PHASE-16 TEST-FLOOR BLOCKER IS CLEARED WITHOUT EDITING ANY BASELINE**: the frontend gate went `2109` → **`2138`** against the unchanged floor of `2119`, and **G3 now passes** (`GATE OK — test baseline matches exactly`, ledger 31, skipped=0). `cargo test` 546 passed / 0 failed, unchanged — the engine null control. **Gate set grew 34 → 35**: new blocking **G35** at order 17, `order` provably the only field that moved on any pre-existing gate (`NON_ORDER_CHANGES 0`). G35 was observed green, then red, then green on injected regressions: removing `onChange` → `NOT PERSISTED`, removing the flush → `UNMOUNT LOST`; **the third injection, restoring reference equality, left the gate GREEN and that is reported rather than hidden** — react-hook-form emits a fresh object per notification so the browser path cannot distinguish reference from value inequality; that defect is covered at the unit layer instead. **`bash scripts/ci-gates.sh` STILL EXITS 1 AND EXIT 0 IS NOT CLAIMED.** It now advances from 12/34 to **15/35**, halting at **G17** (`JOURNEY FAIL steps=25 failed=15`), not at G3. All 15 failing steps are intake/results/tax steps withheld by Phases 16–18; **zero `wizard-*` steps failed**, confirming the badge renders nothing at idle and `data-testid` renders no pixels. **Nothing was approved**: `node journey/approve.mjs` was never run and no file under `journey/references/` was created or modified. No baseline, ledger, lawyer decision or engine file touched)
- [ ] **Phase 20: NIRC §§248/249 Surcharge and Interest** - The return states what a late estate actually owes
- [x] **Phase 21: BIR Form 1801 Exit** - Reconcile the deduction rows, then give the return a PDF and a CSV (8/8 plans executed 2026-08-01. **RET-01…RET-05 all closed and proven.** **The audit's Item-35A finding was a TYPE, not a display bug**: `computeSpecialDeductions` always returned `standardDeduction`/`ra4917` by shorthand, but `EstateTaxFullOutput.specialDeductions` was declared as the narrower `SpecialDeductionsResult`, so no typed consumer could read the ₱5,000,000 the engine had applied — measured shortfall exactly `500000000` centavos. Widening the type named exactly one construction site (`pipeline.ts` `makeErrorOutput`), repaired with no cast. **Two further contradictions on the same table, not in the audit, were found and removed**: row `40 Gross Estate` printed the net taxable estate while row `34` printed the real gross estate, and row `44 Total Deductions` printed the tax due; both read bridge fields whose own declarations at `tax-bridge.ts:26-27` say the names are historical. **One line model, three renderers**: `form1801-lines.ts` is now the only site constructing a Form 1801 line, item number, label or authority; the screen, the PDF and the CSV render it and build nothing. All 29 non-penalty authority literals are transcriptions of committed spec headings in one frozen table; the 4 penalty lines read `penalties.lines[n].authority`. **Funeral (§9.8) and judicial (§9.9) have no statutory section anywhere in the repo and carry a spec reference — no section was invented.** **Test files grown, none weakened, skipped=0**: +5 pipeline, +11 form1801-lines, +9 Form1801View, +16 csv, +9 pdf, +8 actions bar; frontend gate `2187` → **`2240`** against the unchanged floor of `2119`, ledger 31, `GATE OK`. `cargo test` 546 passed / 0 failed, unchanged — the engine null control. **Gate set grew 35 → 36**: new blocking **G37** `return parity` at order 34, `NON_ORDER_CHANGES 0`, G8→35, G9→36, G9 still last. G37 compares screen, PDF and CSV against a same-run `computeEstateTax` as exact BigInt centavos in both directions: `RETURN PARITY PASS screen=33 pdf=33 csv=33`. **TWO OF ITS FOUR INJECTIONS INITIALLY PASSED AND THAT IS RECORDED, NOT HIDDEN** (`21-GATE-OBSERVATIONS.md`): the PDF check was a whole-document substring search satisfied by `sp-total` carrying the same ₱5,000,000, and a row dropped from the shared line model shrank the expectation and all three surfaces together (32 == 32). Both were fixed — an exact multiset equality over every amount token, and a `LINE SET MISMATCH (model)` anchor against the frozen `FORM1801_LINE_IDS` — then re-observed failing. G14's `DISPLAY_LAYERS` grew 4 → 7 so no renderer on either output surface may state an attribution of its own. **A DEFECT WAS FOUND AND DELIBERATELY NOT FIXED**: funeral and judicial expenses are computed twice and land in both `ordinaryDeductions` and `specialDeductions`; a pre-TRAIN probe measured `5000000` centavos of judicial expense subtracted twice. No `RET-*` requirement owns it and fixing it moves a tax figure, so it is surfaced as a manual-review warning on all three surfaces and corrected nowhere. It could not be filed in `engine/BUGS.md` because `bugs_ledger.rs` deserialises every entry as a Rust succession `EngineInput`. **`bash scripts/ci-gates.sh` STILL EXITS 1 AND EXIT 0 IS NOT CLAIMED.** It halts at **G17** (`JOURNEY FAIL steps=25 failed=15`) having run **15 of 36** gates, so **G37 at order 34 was never reached by the suite** — deliberately ordered after the halt so registering it could not cost the run coverage. The 15 failing steps are the same intake/results/tax steps withheld since Phase 16; three owner-blocked causes remain (the 15 withheld steps, G20 whose script `4ccf06270` deleted, G21 which exits 2). **Nothing was approved**: `node journey/approve.mjs` run zero times, zero files touched under `journey/references/`, measured `FORM1801_STEPS 0` steps render the return. No baseline, ledger, lawyer decision, dependency or engine file touched)
- [ ] **Phase 22: Deed of Extrajudicial Settlement — Schedule of Shares** - The schedule clause as pasteable text and DOCX, nothing else of the deed
- [ ] **Phase 23: The Instrument — Letterhead, Attribution, Warnings in the PDF** - Make the output an instrument instead of a printout
- [ ] **Phase 24: Signed Computation Identity** - Every computation immutably stamped and reproducible
- [ ] **Phase 25: Loud Refusal Where the Lawyer Has Not Ruled** - Art. 992 and the over-estate donation refuse to compute
- [ ] **Phase 26: Scope Lock** - A lock file that stops the deleted 28% from growing back
- [ ] **Phase 27: Launch Readiness Closeout** - Final truth in the docs, and an honest `LAUNCH-READINESS.md`

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

---

# Milestone v2.0 — Launch Readiness

## Overview

Milestone v1.0 built the verification foundation and the deletion milestone narrowed the surface by
roughly 28%. The vision audit's finding about what remains is one sentence: **the engines are
excellent and the product has no output tray.** It abandons the lawyer at the two moments their name
goes on something — the schedule of shares inside the Deed of Extrajudicial Settlement, and BIR Form
1801.

The product identity every phase below serves:

> Inheritance produces the estate computation of record: from one fact set — date of death, family,
> asset schedule — a per-heir schedule of shares and a BIR Form 1801, every line carrying the Civil
> Code article or NIRC section that governs it, defensible enough to paste into the Deed of
> Extrajudicial Settlement and to file.

The twelve phases run in the audit's dependency ranking, not in order of visible value. Phase 16
repairs the deletion milestone, because nothing can be measured against a red suite. Phases 17 and 18
come before anything that prints a document: a product whose claim is defensibility cannot ship an
instrument while its own layers contradict each other about which article governs a heir (Phase 17)
or while two engines hold two independently-editable dates of death (Phase 18). Phase 19 is here
early for a blunt reason — a lawyer who loses a nine-heir family tree to a refresh does not come
back, so nothing downstream matters if they do not. Phases 20–23 build the output tray in the order
its parts depend on each other: the penalty clock, the return's exit, the deed clause, then the
instrument dressing that makes all three signable. Phase 24 makes any of it reproducible. Phase 25 is
sequenced late deliberately — implementing refusal is most tempting to convert into implementing the
rule, and it is the one place where guessing is unrecoverable. Phase 26 locks the surface so the
deleted 28% cannot grow back, and Phase 27 tells the truth about whether this is launchable.

**Three questions of Philippine law are open across this milestone and none may be decided by an
agent:** Q4 / `LAWYER-04` (Art. 992's iron curtain, blocking `LAW-07`), Q6 / `LAWYER-06` (a donation
*inter vivos* exceeding the estate, blocking `LAW-06`) and Q8 / `LAWYER-08` (RA 11642 adoptee rights,
blocking `LAW-12`). All three are `awaiting-answer` in `.planning/lawyer-decisions.json` and the
lawyer is unreachable. Phase 25 implements the **refusal**, never the rule. Gate G26 turns red the
first run after any answer arrives, which is the signal to start the work, not a gate to edit.

### Phase 16: Stabilise the Deletion Milestone
**Goal**: The deletion milestone's deferred cuts land cleanly and the gate suite is green again, so every later phase starts from a build that is measurably passing rather than one carrying ~1,465 environment failures and 24 unapproved journey references.
**Depends on**: Nothing — first phase of v2.0. It finishes what commits `81984437e`…`4ccf06270` left open.
**Requirements**: CUT-01, CUT-02, CUT-03, CUT-04
**Success Criteria** (what must be TRUE):
  1. The guided intake contains no conflict-check step, no client-details step and no settlement-track step; `frontend/src/lib/conflict-check.ts` and the intake types orphaned by those cuts do not exist; `cd frontend && npx tsc -b --force` exits 0.
  2. `frontend/src/test-setup.ts` provides the missing jsdom globals — a `ResizeObserver` polyfill plus `scrollIntoView` and `hasPointerCapture` shims — and the frontend failure count falls by the failures attributable to them, **measured before and after**, not estimated.
  3. Every journey step either passes or is explicitly reported for human review. Every re-approved reference was approved with `node journey/approve.mjs <stepId> --by deletion-milestone-nav-change`, and its diff was inspected and found confined to the deleted sidebar navigation region.
  4. `bash scripts/ci-gates.sh` exits 0.
  5. No test, assertion, gate or baseline floor was weakened, and no entry was appended to `gate-skips.lock`, `assertion-baseline.json` or `test-baseline.json` to turn a red run green.
**Cross-cutting constraints**:
  - The wizard is edited **step by step with a typecheck between edits**. A regex sweep over `GuidedIntakeForm.tsx` is prohibited: a previous attempt did exactly that, mangled the file, and was reverted.
  - A journey reference may be re-approved **only** when its visual diff is confined to the deleted sidebar navigation region. A diff touching a wizard field, a money figure, a table or a citation is left failing and reported for human review. Approving a diff nobody inspected is the exact failure `journey/approve.mjs` exists to prevent.
  - Every commit stages explicit file paths via `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited.
  - No point of Philippine law arises anywhere in this phase.

### Phase 17: Citation Integrity — One Attribution Authority
**Goal**: The engine emits the governing article for each heir row and no other layer derives one, enforced by a blocking gate — because in a citation-first product, contradicting your own citation on screen is not a defect, it is a refutation.
**Depends on**: Phase 16 (a green suite is the precondition for adding a blocking gate)
**Requirements**: CITE-01, CITE-02, CITE-03, CITE-04, CITE-05
**Success Criteria** (what must be TRUE):
  1. Exactly one layer produces the governing article for a heir row — the engine. The table, the narrative, the citation pill and the PDF all read that value; none computes, maps or infers its own.
  2. No narrative cites Art. 887 for heirs whose table row cites Art. 996. Table and narrative agree per heir across every committed corpus input.
  3. The citation pill resolves for every article the engine emits: the `Art. 996` versus `Art.996` key mismatch in `frontend/src/data/ncc-articles.ts` is gone, and an unresolvable key fails loudly rather than rendering a dead pill.
  4. `predictScenario` and `computeMock` no longer exist in `frontend/src/wasm/bridge.ts` — the surviving duplicate named by CLAUDE.md invariant 5 and owned by `EXT-02`, whose reserved gate `G14` this phase closes.
  5. A new **blocking** gate fails when the table, the narrative, the pill and the PDF disagree about the article for the same heir, and has been observed going red on an injected disagreement and green again after the injection was reverted.
**Cross-cutting constraints**:
  - No article string is corrected on its own authority. A citation that disagrees with the engine is made to **read** the engine; a citation the engine itself gets wrong is a legal question and goes to `.planning/LAWYER-AGENDA.md`.
  - The gate is added by appending to `gates.manifest.json` and `gates.manifest.lock` together; the gate set may only grow and `G9` stays last.
  - No test, assertion or gate may be weakened to pass; a gate that cannot legitimately pass is reported BLOCKED with the real pasted output.

### Phase 18: One Fact Set, Keyed on Date of Death
**Goal**: Date of death is entered once and shared by both engines, with a blocking check that they can never silently disagree about it — closing the seam where the product's entire defensibility claim rests on two spines that can drift.
**Depends on**: Phase 16, Phase 17
**Requirements**: FACT-01, FACT-02, FACT-03, FACT-04
**Success Criteria** (what must be TRUE):
  1. A lawyer enters the date of death exactly once per case. Neither the succession path nor the estate-tax path offers a second, independently editable field for it.
  2. Both engines read that one value. Today only `decedent_name` crosses; after this phase the fact set crossing the boundary carries the date of death as its keyed spine.
  3. The three rules the date drives read the shared value: TRAIN versus pre-TRAIN, the TRAIN-repealed medical deduction, and RA 11642 retroactivity.
  4. A stored case whose two fact sets disagree about the date of death **fails a blocking check** that prints both values, rather than computing on either.
  5. Changing the date of death once changes both engines' output, proven on a real case rather than in a unit test alone.
**Cross-cutting constraints**:
  - RA 11642 retroactivity stays BLOCKED on `LAWYER-08`. This phase routes the date to that rule; it does not decide the rule, and `config.retroactive_ra_11642` stays inert.
  - No peso figure and no legal outcome may change as a side effect of unifying the field. If one moves, that is a finding to report, not a result to accept.

### Phase 19: Wizard Persistence That Actually Persists
**Goal**: Work in the succession wizard survives a page reload, because `useAutoSave` is currently dead code and a lawyer who loses a nine-heir family tree does not open the app a second time.
**Depends on**: Phase 16
**Requirements**: SAVE-01, SAVE-02, SAVE-03, SAVE-04, SAVE-05
**Success Criteria** (what must be TRUE):
  1. Editing any field in the succession wizard schedules a save without pressing Compute: a `methods.watch()` subscription reaches `useAutoSave` through an `onChange` prop, so `setAutoSaveInput` is no longer called only inside the load effect.
  2. The debounce actually fires on a changed value — the `prevInputRef` reference-equality guard is replaced by a value comparison, observed firing on an edit that preserves object identity.
  3. Unmounting the wizard with a save pending **flushes** it instead of clearing it, proven by a test that unmounts inside the debounce window.
  4. The lawyer can see save state on screen — saving, saved, or failed — and a failed save is never rendered as success.
  5. A nine-heir family tree entered and then reloaded comes back, proven by a journey step against the live database, not by a unit test alone.
**Plans**: 6 plans, 5 waves — **ALL EXECUTED 2026-08-01** (`.planning/phases/19-wizard-persistence-that-actually-persists/`)
  - **Wave 1** — `19-01` Baseline: the dead-code proof, the three save behaviours and the test-count floor, all measured (SAVE-01…SAVE-05)
  - **Wave 2** *(blocked on Wave 1: every target is stated against a measured prior)* — `19-02` `useAutoSave` compares values and flushes on unmount (SAVE-02, SAVE-03) · `19-03` Wizard `onChange` subscription and two stable test handles (SAVE-01)
  - **Wave 3** *(blocked on Wave 2: joins the hook to the wizard)* — `19-04` Route wiring and the on-screen save status (SAVE-01, SAVE-04)
  - **Wave 4** *(blocked on Wave 3: the gate drives the wired application)* — `19-05` Live-database gate proving a nine-heir tree survives a reload, observed red on three injected regressions (SAVE-05)
  - **Wave 5** *(blocked on Wave 4: a gate is registered only after it has been seen failing)* — `19-06` Register G35 at order 17, document it, re-measure and close out (SAVE-01…SAVE-05)

  Cross-cutting constraints (appear in 2+ plans):
  - Every commit stages explicit file paths through `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited (concurrent auto-committer on this monorepo)
  - No test, assertion, gate or baseline floor may be weakened, deleted, skipped or loosened; a check that cannot legitimately pass is reported BLOCKED with the real pasted command output
  - `frontend/test-baseline.json`, `assertion-baseline.json` and `gate-skips.lock` are not edited by any plan. Whether the phase's added tests clear the `min_total_tests` floor is measured in 19-06, never engineered
  - No file under `frontend/journey/references/` is created, modified or approved, and `node journey/approve.mjs` is never run. A journey step that reports a diff is left failing and reported for human review
  - `G20` and `G21` remain owner-blocked registered gates whose scripts `4ccf06270` deleted; this phase does not claim `bash scripts/ci-gates.sh` exits 0
  - No point of Philippine law arises anywhere in this phase; no engine file, citation or legal rule is edited, and `cargo test` runs only as a null control

### Phase 20: NIRC §§248/249 Surcharge and Interest
**Goal**: The return states what a late estate actually owes. `pipeline.ts` hardcodes `surcharges: 0, interest: 0, compromise_penalty: 0` with `total_amount_due = estateTaxDue`, so for the years-late estates that walk into a small firm the product currently **understates the liability**.
**Depends on**: Phase 18 (the surcharge clock is a function of the shared date of death)
**Requirements**: PEN-01, PEN-02, PEN-03, PEN-04, PEN-05
**Success Criteria** (what must be TRUE):
  1. `surcharges`, `interest` and `total_amount_due` in `frontend/src/lib/estate-tax-engine/pipeline.ts` are computed from the date of death and the filing date. No hardcoded zero survives on the total's inputs.
  2. Surcharge is computed per NIRC §248 and interest per NIRC §249, on separate lines, each line carrying the section that governs it.
  3. `total_amount_due` equals estate tax plus surcharge plus interest plus compromise penalty, and a test proves the total moves when the date of death moves.
  4. Where the statute is ambiguous, the engine **refuses loudly**: it raises a manual-review flag, declines that line, and the question is recorded as a new `LAWYER-<NN>` entry in `.planning/LAWYER-AGENDA.md` with a matching object in `.planning/lawyer-decisions.json`, status `awaiting-answer`. No reading is adopted, defaulted or stubbed.
  5. The compromise penalty is either computed from a cited schedule or **expressly declared outside the engine's competence** on the face of the return. It is not left silently at 0 while the total claims to be complete.
**Cross-cutting constraints**:
  - `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` still returns 0 at the end of the phase.
  - Every penalty figure is an exact centavo integer; no float, no tolerance, no `toFixed` in any comparison path.

### Phase 21: BIR Form 1801 Exit
**Goal**: The estate-tax surface, which today has zero export of any kind, produces a filable return — and its displayed deduction rows stop contradicting its own arithmetic.
**Depends on**: Phase 17 (attribution authority), Phase 20 (the total the export prints)
**Requirements**: RET-01, RET-02, RET-03, RET-04, RET-05
**Success Criteria** (what must be TRUE):
  1. Every deduction row displayed on Form 1801 equals the amount the computation applied — Item 35A no longer shows `0.00` against ₱5,000,000 applied — proven by an exact centavo comparison in both directions.
  2. A lawyer can export the return as a PDF from the estate-tax surface.
  3. A lawyer can export the return as a CSV carrying the same centavo integers.
  4. Every line of both exports carries the NIRC section or RR provision that governs it, read from the engine and never derived in the export layer.
  5. A blocking gate compares the displayed figures, the exported PDF figures and the exported CSV figures against a **same-run** engine computation, and has been observed failing on a one-centavo injection in each direction.
**Cross-cutting constraints**:
  - Reconciliation lands **before** the exports. A return whose display contradicts its own arithmetic must not be given an exit.
  - No expected peso figure is committed. Every expected amount is produced by an engine run during the gate, the discipline gate G19 established.

### Phase 22: Deed of Extrajudicial Settlement — Schedule of Shares
**Goal**: The largest gap in the product closes — the numbers' only real destination becomes reachable. Today the Deed exists in this codebase only as a checklist label the deletion milestone removed, while the app computes to the centavo the exact figures whose sole purpose is that document.
**Depends on**: Phase 17 (every heir line carries its article), Phase 18 (one fact set)
**Requirements**: DEED-01, DEED-02, DEED-03, DEED-04, DEED-05
**Success Criteria** (what must be TRUE):
  1. From a computed case a lawyer obtains the schedule-of-shares clause as pasteable text.
  2. The same clause is obtainable as DOCX.
  3. Every heir line in the clause carries the Civil Code article the engine emitted for that heir.
  4. Where a share cannot be expressed without a lawyer's judgement, the clause **says so in place of that line** and names what must be decided. It never invents wording.
  5. Every peso figure in the clause equals the engine's centavo value exactly, proven by a gate against a same-run computation.
  6. Nothing else of the deed ships: no parties clause, no publication clause, no bond clause, no undertaking. Only the clause the engine can defend.
**Cross-cutting constraints**:
  - No clause wording asserts a legal conclusion the engine did not produce. Where the wording itself is a legal question, it is recorded for the lawyer and the clause refuses that line.

### Phase 23: The Instrument — Letterhead, Attribution, Warnings in the PDF
**Goal**: The exported document stops being a printout and becomes an instrument. `ActionsBar.tsx` calls `downloadPDF(input, output, null)` — the third argument is the firm profile, and `EstatePDF` gates the letterhead on it, so the letterhead the app captures and stores can never render.
**Depends on**: Phase 17, Phase 21, Phase 22
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05
**Success Criteria** (what must be TRUE):
  1. `ActionsBar` loads the firm profile and passes it to `downloadPDF`, so a configured letterhead renders in a PDF a user can actually obtain.
  2. The PDF carries an attorney attribution block: name, Roll of Attorneys number, IBP number, PTR number and MCLE compliance.
  3. Every engine warning shown on screen is printed **in** the PDF. The refusal to guess is a headline feature and currently exists only in an on-screen panel.
  4. No raw markdown asterisk reaches the page, and the duplicated `Art. 996: Art. 996` line renders once.
  5. Gate G24's perceptual references are re-approved deliberately for these changes, each diff inspected and each approval attributed.

### Phase 24: Signed Computation Identity
**Goal**: A computation can be reproduced and compared. `output_json` is overwritten in place today, so the document a lawyer filed last quarter cannot be re-derived.
**Depends on**: Phase 22, Phase 23 (the stamp must appear on the artifacts those phases produce)
**Requirements**: REPRO-01, REPRO-02, REPRO-03, REPRO-04
**Success Criteria** (what must be TRUE):
  1. Every computation is stamped immutably with engine version, ruleset-as-of date, input hash and timestamp, and the stamp appears in the PDF, the return exports and the deed clause.
  2. A computation is never overwritten in place: re-running a case produces a new stamped record and the previous record stays retrievable.
  3. Re-running a stored input on the same engine version reproduces the same output hash, proven by a gate.
  4. The lawyer-facing framing is **reproducibility**. No public verification portal, no anonymous re-run endpoint and no hash-addressable public route is built — the primary consumer of independent re-runnability is an adversary.

### Phase 25: Loud Refusal Where the Lawyer Has Not Ruled
**Goal**: The two fact patterns the engine currently gets silently wrong stop computing. Art. 992's iron curtain is not merely omitted — the engine distributes as though it did not exist — and a donation exceeding the estate reproduced a ₱30M distribution out of a ₱10M estate.
**Depends on**: Phase 17, Phase 22, Phase 23 (the refusal must be visible on every surface the computation would have reached)
**Requirements**: REFUSE-01, REFUSE-02, REFUSE-03, REFUSE-04
**Success Criteria** (what must be TRUE):
  1. A fact pattern engaging Art. 992's iron curtain raises a manual-review flag and the engine **declines to produce a distribution**, instead of distributing as though the article did not exist.
  2. A donation *inter vivos* exceeding the estate raises a manual-review flag and the engine **declines to compute**, instead of distributing more than the estate holds.
  3. Each refusal names and quotes the open question it is waiting on — `LAWYER-04` for Art. 992, `LAWYER-06` for the donation excess.
  4. The refusal is visible everywhere the computation would have gone: the results screen, the PDF, the deed clause and the exported return. A refusal that appears in one surface and not another is a failure of this phase.
**Cross-cutting constraints**:
  - **This is the phase where guessing would be most tempting and most damaging. Implement the refusal, not the rule.** `LAW-06` and `LAW-07` stay open; no reading of Art. 771, Art. 911 or Art. 992 is adopted, implemented, defaulted or stubbed.
  - `.planning/lawyer-decisions.json` and `.planning/LAWYER-AGENDA.md` are not edited to change any status. Gate G26 must still pass on `awaiting-answer` at the end of the phase.
  - "Refuse to compute" is itself a reading of what the product should do, not of what the law says — that distinction is what makes this phase permissible at all, and it must not be stretched.

### Phase 26: Scope Lock
**Goal**: The surface the deletion milestone narrowed cannot grow back silently. This is what makes the rest of the milestone affordable for one person with scarce recurring attention.
**Depends on**: Phase 16 (lock the post-deletion tree), Phases 21–25 (the surface those phases legitimately add is in the lock before it closes)
**Requirements**: SCOPE-01, SCOPE-02, SCOPE-03
**Success Criteria** (what must be TRUE):
  1. `scripts/check-scope.mjs` exists and a committed lock file pins five numbers per `.planning/PHASE-16-BRIEF.md`: route count, exported component count, runtime dependency count, migration count and public engine exports.
  2. Growing any of the five fails a **blocking** gate registered in `gates.manifest.json`.
  3. Adding to the lock is **owner action**, exactly like the gate manifest under CLAUDE.md invariant 2. The check has no `--fix`, `--update`, `--accept`, `--regenerate` or waiver flag of any kind, and cannot rewrite its own input.
  4. Every failure path has been observed firing against a committed fixture — a gate nobody has seen fail is not known to be a gate.
  5. The lock's committed values are measured from the tree, never hand-written.

### Phase 27: Launch Readiness Closeout
**Goal**: A returning owner, or the lawyer collaborator arriving after the bar, can determine from the planning directory alone what works, what is blocked and on whom, and what to do first — with no optimism anywhere in it.
**Depends on**: All prior phases (it states their final truth)
**Requirements**: CLOSE-01, CLOSE-02, CLOSE-03, CLOSE-04
**Success Criteria** (what must be TRUE):
  1. `CLAUDE.md`'s invariants read as final truth, including any invariant this milestone added, each naming the command and gate id that enforces it.
  2. `.planning/STATE.md` and `.planning/ROADMAP.md` agree with the filesystem and with the gate set, proven by gate G33.
  3. `LAUNCH-READINESS.md` exists and states plainly: what works end to end, what is still blocked on the lawyer and which question blocks it, and what a returning owner must do first.
  4. If the product is not launchable, `LAUNCH-READINESS.md` **says so and says why**. No claim of readiness survives a reading against the gate output.
  5. Every claim in `LAUNCH-READINESS.md` is either paired with the command that proves it or is explicitly labelled unmeasured — including the longest-standing one, that CI has never executed.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15
(milestone v1.0, complete) → 16 → 17 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27
(milestone v2.0, Launch Readiness, roadmapped 2026-08-01)

**Why phases 22–27 have no row in the table below.** Gate G33
(`node scripts/check-planning-truth.mjs`) derives every row from `.planning/phases/<NN>-<slug>/`, and
raises `ROADMAP PLAN COUNT` for a row whose phase directory does not exist. None of the six has
been planned, so none has a directory. Each gains its row when `/gsd-plan-phase <N>` creates it. This
is the same rule that keeps the table honest for phases 1–15; it is not an omission. Phases 16 through
19 were planned and executed on 2026-08-01 and have rows; Phases 20 and 21 were planned on 2026-08-01
and therefore have rows, reading `0/7` and `0/8` and `Planned`.

> **Read the `Status` column narrowly.** It is machine-derived by gate G33
> (`node scripts/check-planning-truth.mjs`) from one fact only: every `*-PLAN.md` in the phase
> directory has a matching `*-SUMMARY.md`. `Complete` therefore means **"every plan in this phase
> was executed and written up"** — it does **not** mean every requirement the phase owns is closed.
> G33 forbids any other value in that cell, by design, so requirement-level truth lives in the
> `Open requirements` column beside it and in `.planning/REQUIREMENTS.md`. A phase can read
> `Complete` and still own blocked work. Six of the fifteen below do.

| Phase | Plans Complete | Status | Completed | Open requirements (requirement-level truth) |
|-------|----------------|--------|-----------|---------------------------------------------|
| 1. Gate Foundations | 4/4 | Complete | 2026-07-31 | GATE-04 **unobserved** — the CI workflow is committed and structurally verified but has never executed on GitHub; 223 commits are unpushed |
| 2. Loop Durability & Commit Discipline | 6/6 | Complete | 2026-07-31 | none — LOOP-01..06 all gate-proven |
| 3. Reproducible Environment & Gate Reporting | 5/5 | Complete | 2026-07-31 | none gated in CI — GATE-05/06/07 pass locally but their checks need Docker and are not in `gates.manifest.json` |
| 4. Lawyer Review Agenda Recorded | 5/5 | Complete | 2026-07-31 | none — the agenda is recorded; the *answers* are Phase 14's block, not this one's |
| 5. Engine Observability Restored | 7/7 | Complete | 2026-07-31 | none — OBS-05/OBS-06 were unblocked by the owner in `d71f9150e`; `.planning/REQUIREMENTS.md` still reads `Blocked` for both and is **stale** |
| 6. Property-Test Coverage Depth | 5/5 | Complete | - | none — COV-01..05 all gate-proven |
| 7. Intestate Order & Representation Root-Cause Fixes | 4/4 | Complete | - | none — LAW-01..04 all gate-proven |
| 8. Remaining Unblocked Legal & Tax-Bridge Defects | 8/8 | Complete | - | none — LAW-05/08/09/10/11 all gate-proven |
| 9. Single Source of Truth — Dedup Classifiers & Money Types | 6/6 | Complete | - | **EXT-02 PARTIAL** — gate `G14` is still reserved and unregistered (`grep -c '"G14"' gates.manifest.json` = 0); the dead `predictScenario`/`computeMock` duplicate in `frontend/src/wasm/bridge.ts` survives. EXT-01/EXT-04 were closed later by Phase 12 |
| 10. Journey Gate Infrastructure | 6/6 | Complete | - | none — JRNY-01's DB half was unblocked by Phase 11 migration 014. `.planning/REQUIREMENTS.md` still reads `Planned` for JRNY-01/09/10/12 and is **stale** |
| 11. Account, Org & Case Journey Gates | 8/8 | Complete | - | **JRNY-02 PARTIAL** (logout step withheld) and **JRNY-03 PARTIAL** (three onboarding steps withheld on two real product defects — a `.single()` 406 and a silent `23502` that discards the attorney profile) |
| 12. Wizard & Output Journey Gates | 9/9 | Complete | 2026-07-31 | **JRNY-05 PARTIAL** — 5 of 6 succession-wizard screens gated; `wizard-will` withheld because `?hasWill=1` never constructs the `will` object |
| 13. PDF Verification | 7/7 | Complete | 2026-07-31 | none — PDF-01..05 all gate-proven |
| 14. Lawyer-Blocked Legal Fixes & Legal Traceability | 6/6 | Complete | - | **LAW-06, LAW-07, LAW-12 BLOCKED-ON-LAWYER** — LAWYER-06/04/08 are all `awaiting-answer`. No reading was adopted, defaulted or stubbed |
| 15. Extendability & Documentation Closeout | 5/5 | Complete | 2026-08-01 | EXT-05..08 gate-proven; the stale-doc sweep covered `CLAUDE.md` + `.planning/codebase/*.md` only — 14 other `.planning/*.md` files were never audited |
| 16. Stabilise the Deletion Milestone | 6/6 | Complete | 2026-08-01 | **CUT-04 BLOCKED on the owner — `bash scripts/ci-gates.sh` exits 1** at G3 (`TEST COUNT DROPPED: ran 2073 tests, floor is 2119`); nine gates pass first (G5, G6, G7, G12, G13, G15, G16, G1, G2). Two independent owner decisions: lower `min_total_tests` 2119 → 2073 (precedent `4ccf06270`), **and** retire **G20/G21**, registered blocking gates whose scripts `4ccf06270` deleted — not reached in this run because the suite halts at G3, so clearing the floor alone only advances the failure to G20. CUT-01 complete (intake 7 → 4 steps, `lib/conflict-check.ts` and 7 orphaned types deleted, 46 subject-dead tests retired, none weakened; a stale-heading defect the cut left behind was found and fixed). CUT-02 closed by measurement — the jsdom polyfills have been present since `181ae68c5`, so the inherited "~1,465 failures" figure has no referent. CUT-03 complete — journey `failed=24 → 7`; 14 references re-approved only after an exhaustive per-pixel measurement confined every diff to the sidebar (`x ∈ [12,243]`, region `[0,255]`) and the images were viewed; **10 steps were refused approval and reported for human review** (`results-view`/`results-family-tree` differ out to x=1084 — `Share`, `Documents`, `Case Notes` removed — and the 5 rebuilt intake steps need a first reference from a human) |

| 17. Citation Integrity — One Attribution Authority | 6/6 | Complete | - | CITE-01..05 all closed 2026-08-01; EXT-02 closed with them. **Measured, not estimated**, across the 171 computable committed corpus inputs (652 heir rows) through the compiled artifact: heir rows whose narrative cites an article absent from that row's `legal_basis` went **615 (94.3%) -> 0**, and `narrative.legal_basis` now equals `share.legal_basis` element-for-element on every row (`NARRATIVE_SHARE_MISMATCH 0`). Distinct `legal_basis` strings resolving to a description went **0 of 24 -> 24 of 24**, closing the `Art. 996`/`Art.996` mismatch, the `¶N` paragraph suffix and the two absent map entries (`Art.983`, `Art.999`, transcribed verbatim from the engine spec). An unresolvable citation is now LOUD — `data-citation-unresolved="true"` on screen, `CITATION NOT RESOLVED` in the PDF. `predictScenario`/`computeMock` deleted (bridge.ts 438 -> 140 lines), proven complete by `noUnusedLocals` rather than by reading. A **fourth derivation site the audit missed** was closed: `DistributionSection.tsx` hardcoded `Art. 1011` and `Art. 1004 / 1006` in its own banner prose (`grep -c` **2 -> 0**). **The G28 trap held**: all eight prose article literals survive verbatim as traceability comments, so `engine/legal-rules.json` was never edited and G28 stayed green. New BLOCKING gate **G14** registered at order 10 — after G2 which builds the artifact it reads, before G3 where the suite halts — observed RED on two committed fixtures before registration and green after; it carries no allow-list and no write flag, and a run examining zero rows exits 1 with `CORPUS EMPTY`. Gate set **32 -> 33**, `order` the only field touched on any existing gate (`NON_ORDER_CHANGES 0`). **NOT DELIVERED AND NOT CLAIMED**: `bash scripts/ci-gates.sh` still exits **1**, halting at **G3** on the two Phase 16 owner decisions this phase does not own (the `min_total_tests` floor, and the registered-but-deleted G20/G21) — G14 runs and PASSES at order 10 before that halt; and the journey steps `results-view`/`results-family-tree` remain **withheld for human review**, unapproved, since this phase changed the results screen again |
| 18. One Fact Set, Keyed on Date of Death | 6/6 | Complete | 2026-08-01 | FACT-01..04 all closed 2026-08-01. **Measured, not asserted.** FACT-01: controls writing `EstateTaxWizardState.decedent.dateOfDeath` went **1 -> 0** — `DecedentTab.tsx` keeps the field, its `data-testid` and its value but lost its `onChange`, gaining `readOnly` + `aria-readonly` and a visible note naming the succession wizard's Decedent step; a test types into it and asserts the `onChange` spy fired **exactly 0** times. FACT-02/03: `$caseId.tax.tsx` now reads the case's fact set through `factSetFromCaseRow` and adopts the shared date via `applyFactSet`, and no longer reads the projected `row.decedent_name` column (`grep -c` **5 -> 0** for that literal). FACT-04: a disagreement **refuses to compute** and prints **both** dates on screen under their own testids — all three compute paths (`handleCompute`, `handleApply`, `handleRevert`) are gated (`GUARDS 3`), not just `runCompute`, and the Compute button disappears because `onCompute` is `undefined`. The refusal **never overwrites** the stored tax date: `updateCaseTaxInput(` call sites are unchanged at **3**, because an overwrite would destroy the only evidence the case ever disagreed. All rules live at exactly one site, `frontend/src/lib/fact-set.ts` (17 unit cases); the route and the banner restate none of it (`OWN_DATE_COMPARISON 0`, `OWN_LOGIC 0`). New BLOCKING gate **G34** registered at order 11 — after G2 which builds the WASM artifact it loads, before G3 where the suite halts — **observed RED on three injected regressions before registration** (`SECOND DATE FIELD` on a restored writer, `FACT SET NOT SHARED` on a blinded route, `CORPUS EMPTY` on an empty fixtures dir), each clearing on its revert. It carries no exception list, no baseline and no write flag, and a run examining zero rows exits 1. Gate set **33 -> 34**, `NON_ORDER_CHANGES 0`. **THE ROADMAP'S SUCCESS CRITERION 5 IS NOT MET AND IS NOT CLAIMED**: the shared date cannot change *both* engines' output, because the succession engine is invariant to it — `flags.rs` keys RA 11642 retroactivity on the adoption *decree date*, and a corpus double-compute over all 171 computable inputs (652 heir rows, 4 carrying an `Ra8552` adoption) changed **0** outputs, re-measured unchanged at phase end. Making it vary is `LAWYER-08`, status `awaiting-answer`; `engine/src/flags.rs`, `lawyer-decisions.json` and `LAWYER-AGENDA.md` are untouched. **ALSO NOT CLAIMED**: `bash scripts/ci-gates.sh` still exits **1**, halting at **G3** (`ran 2109 tests, floor is 2119`) on the two Phase 16 owner decisions this phase does not own — the `min_total_tests` floor, and the registered-but-deleted **G20/G21** whose failure the floor merely postpones. G34 runs and **PASSES** at 11/34 before that halt. Journey step **`tax-tab-0` is withheld for human review**, unapproved: its diff is a wizard field, not the deleted sidebar nav region. Nothing weakened — 0 phase commits touch `test-baseline.json`, `gate-skips.lock`, `assertion-baseline.json` or any reference image |
| 19. Wizard Persistence That Actually Persists | 6/6 | Complete | 2026-08-01 | SAVE-01..05 **all closed**. `useAutoSave` was unreachable: `setAutoSaveInput` had **2** call sites, both inside the `[caseId]` load effect, **0** outside. Baseline of the unmodified hook: `OPEN_ONLY_SAVES=1`, `INPLACE_EDIT_SAVES=0`, `UNMOUNT_FLUSH_SAVES=0` — the guard was **not** inert, it wrote back exactly what it had just read and wrote nothing for any amount of typing. Now: an optional `onChange` prop fed by `methods.watch()`, a `stableStringify` value comparison, an unmount cleanup that **flushes** carrying its own `caseId`, and `SaveStatusBadge` (nothing at idle). Tests **+29, none weakened, skipped=0**: `useAutoSave` 7->14, `WizardContainer` 17->25, new `stable-stringify` 8, new `SaveStatusBadge` 6. **THE PHASE-16 FLOOR BLOCKER IS CLEARED WITH NO BASELINE EDITED**: 2109 -> **2138** against the unchanged floor of 2119, and **G3 now passes**. `cargo test` 546/0 unchanged. **Gates 34 -> 35**, new blocking **G35** at order 17, `NON_ORDER_CHANGES 0`. G35 observed red on 2 of 3 injections (`NOT PERSISTED`, `UNMOUNT LOST`); **the third, restoring reference equality, left it GREEN and that is reported** — react-hook-form emits a fresh object per notification, so the browser path cannot distinguish reference from value inequality; covered at the unit layer instead. **`ci-gates.sh` exit 0 is NOT claimed**: it exits 1 at **G17** (15/35, `steps=25 failed=15`), no longer at G3. All 15 are intake/results/tax steps withheld by Phases 16-18; **zero `wizard-*` steps fail**. `journey/approve.mjs` never run; 0 reference images touched; 0 baseline, ledger, lawyer or engine files touched |
| 20. NIRC §§248/249 Surcharge and Interest | 0/7 | Planned | - | PEN-01..05 planned 2026-08-01 across 7 plans in 5 waves. **PLANNING MEASURED THE AUTHORITY BOUNDARY AND IT CHANGES WHAT THE PHASE CAN CLAIM.** `specs/estate-tax-engine-spec.md` §1 lists *"Compute surcharges, interest, or penalties for late filing"* under **What the engine does NOT do** and §2 lists *"Surcharges, interest, compromise penalties"* under **Out of Scope**; `grep -rln "Sec. 248"` over the whole repo returns **4** hits, all four in planning prose naming this phase, and **0** in `specs/`, `engine/` or `frontend/src/`. `.planning/NEW-LEGAL-RULE.md` Step 1 makes writing a rule no spec states a point of Philippine law, so **success criteria 2 and 3 as literally worded are NOT claimed**: no rate, base or accrual window is supplied and every money line is `declined`. What IS claimed: the three hardcoded zeros and `total_amount_due = estateTaxDue` are removed (criterion 1), each line carries the section that governs it (criterion 4, PEN-04), and the compromise penalty is declared outside the engine's competence on the face of Form 1801 (criterion 5, PEN-05). Three new questions are recorded — **LAWYER-10** (Sec. 248 surcharge), **LAWYER-11** (Sec. 249 interest), **LAWYER-12** (whether a compromise penalty may be computed at all) — all `awaiting-answer`, framed as engine-scope questions carrying no rate, and `PEN-01/02/03` are registered in `.planning/BLOCKED-REQUIREMENTS.md` so **G26 goes red the day an answer arrives**. **AN UN-AUDITED DEFECT WAS FOUND AT PLANNING TIME**: `pipeline.ts:308` sets `FilingInfo.filingDate` from `new Date()` and **nothing reads it**, so the "fully deterministic" engine is not, and Phase 24's input hash is impossible while it stands; the phase replaces it with an entered `assumedFilingDate` defaulting to `''`. What the engine WILL compute from both dates: the statutory filing deadline per spec §21 (1 year TRAIN / 6 months pre-TRAIN, via `getDeductionRules` — the boundary is read, never restated) and a day count, pinned by the two committed worked examples `2020-06-15 -> 2021-06-15` and `2015-03-31 -> 2015-09-30`. New BLOCKING gate **G36** at order 12, whose load-bearing marker is `RATE INVENTED` — a numeric-literal whitelist over `penalties.ts` that turns red the moment anyone supplies a rate — to be observed red on 4 injections before registration. **`ci-gates.sh` exit 0 is NOT claimed**: G20/G21 remain owner-blocked and 15 journey steps stay withheld |
| 21. BIR Form 1801 Exit | 8/8 | Complete | 2026-08-01 | RET-01..05 planned 2026-08-01 across 8 plans in 7 waves. **THE AUDIT'S ITEM-35A FINDING IS TRUE, MEASURED, AND ITS ROOT CAUSE IS A TYPE.** A real `computeEstateTax` run (P9,000,000 gross, 2020-06-15 death) returns `specialDeductions.total` = `500000000` centavos while the four fields the display reads sum to `0`: `computeSpecialDeductions` returns `standardDeduction` and `ra4917`, and `EstateTaxFullOutput.specialDeductions` is declared as the narrower `SpecialDeductionsResult`, which has neither. **Two further contradictions were measured on the same table**: row `40 Gross Estate` prints `4,000,000.00` while row `34 Total Gross Estate` prints `9,000,000.00`, and row `44 Total Deductions` prints the tax due — both read bridge fields whose own declarations at `tax-bridge.ts:26-27` say the names are historical. **A LARGER DEFECT WAS FOUND AND IS DELIBERATELY NOT FIXED**: funeral and judicial expenses are computed twice and land in both `ordinaryDeductions` and `specialDeductions`, and a pre-TRAIN probe measured `5000000` centavos of judicial expense subtracted twice. No `RET-*` requirement owns the fix and it moves a tax figure, so the phase surfaces it as a manual-review warning on all three surfaces instead; it could not be filed in `engine/BUGS.md` because `engine/tests/bugs_ledger.rs` deserialises every entry as a Rust succession `EngineInput`. **Architecture**: one `form1801-lines.ts` inside the engine builds all 33 lines once, and the screen, the PDF and the CSV render that array — three renderers cannot disagree about which rows exist. Every authority literal is a transcription of a heading already committed in `specs/estate-tax-engine-spec.md`; funeral and judicial have no NIRC section anywhere in the repository and carry a spec reference, the same idiom `penalties.lines[2].authority` already ships. **No new npm dependency**: `@react-pdf/renderer` is already at `^4.3.2` and the CSV is written, never parsed. New BLOCKING gate **G37** at order 34 (after the current halt, so no coverage is lost), comparing displayed, PDF and CSV figures against a same-run engine computation as exact BigInt centavos in both directions, to be observed red on 4 injections — two of them one centavo in opposite directions — before registration. **`ci-gates.sh` exit 0 is NOT claimed**: the suite halts at G17, G20/G21 remain owner-blocked and 15 journey steps stay withheld |
| 22. Deed of Extrajudicial Settlement — Schedule of Shares | 8/8 | Complete | 2026-08-01 | DEED-01..05 planned 2026-08-01 across 8 plans in 6 waves. **THE ENGINE ALREADY EMITS EVERYTHING THE CLAUSE NEEDS, SO THIS PHASE NEEDS NO ENGINE CHANGE AND NO LAWYER ANSWER.** `EngineOutput.per_heir_shares[i]` carries `heir_name`, `heir_category`, `net_from_estate` and `legal_basis: string[]`; `ManualFlag.related_heir_id` is nullable, which makes DEED-04 mechanical — a flag naming a heir refuses that heir's line, a flag naming none refuses the whole schedule. **Architecture is Phase 21's, reused deliberately**: one line model (`src/lib/deed/schedule-lines.ts`) with three renderers (the `<pre>` on the results view, `clause-text.ts`, `docx.ts`), so no two surfaces can disagree about a figure — and the DOCX body IS the clause-text string, one `<w:p>` per line, which makes criterion 2's word *same* literally checkable. **The money field stated is `net_from_estate`**, the same field `journey/money-parity.mjs` (G19) already asserts on screen, so the deed cannot become a second disagreeing figure. **No npm dependency**: measured, `frontend/package.json` holds no `jszip`, `docx`, `fflate` or `pizzip`, and ROADMAP Phase 26 pins the runtime dependency count; a `.docx` is an OPC package and OPC permits STORED entries, so the exporter is a ~100-line deterministic ZIP writer with a fixed DOS date (`0x0021`) and no clock. **Four mechanical refusal rules, no reading of law**: empty `legal_basis`, a negative net share, a heir-scoped manual-review flag, and a document-scoped flag; every refusal string is a module constant plus verbatim engine text. `LAWYER-04`, `LAWYER-06` and `LAWYER-08` stay `awaiting-answer` and untouched, and Phase 25's engine-side refusals will ride these same rules. **ONE GENUINE LEGAL QUESTION IS RECORDED, NOT DECIDED**: a real Deed identifies specific property by TCT number, and the succession engine's only money input is the single scalar `net_distributable_estate.centavos` with no asset schedule anywhere — so **LAWYER-13** (peso-amount schedule versus per-property identification) is appended to `.planning/LAWYER-AGENDA.md` and `.planning/lawyer-decisions.json` at `awaiting-answer`, blocking nothing, and the clause discloses it by id on its own face. New BLOCKING gate **G38** `deed parity` at order 35 — after the halt at G17, so registering it costs no coverage, exactly as G37 was placed at 34 — comparing the clause and the DOCX against a same-run `computeEngineOutput` as exact BigInt centavos in both directions, plus an article-list check, a refusal-set check and a peso-token multiset check (the shape that let two of G37's injections initially pass). To be observed red on 4 injections, two of them one centavo in opposite directions, before registration. G14's `DISPLAY_LAYERS` grows 7 → 11. **`ci-gates.sh` exit 0 is NOT claimed**: the suite halts at G17 and G20/G21 remain owner-blocked. **No perceptual reference is approved** — `results-view` and `results-family-tree` have been withheld for human review since Phase 16 and this phase changes that screen again |

**Withheld journey steps, measured 2026-08-01:** the registry holds **33** steps and **33** approved
references. Five rubrics are committed with no registered step and no reference, so no gate certifies
them: `auth-signed-out`, `org-onboarding-firm`, `org-onboarding-profile`, `org-onboarding-done`,
`wizard-will`. That withholding is deliberate — each one failed on a real defect or an undecided
product question, and registering it would have required weakening its rubric.
