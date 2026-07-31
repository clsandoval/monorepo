---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: ready_to_plan
stopped_at: Phase 13 complete (7/7) — ready to discuss Phase 14
last_updated: 2026-07-31T23:06:06.698Z
last_activity: 2026-07-31 -- Phase 13 executed and verified
progress:
  total_phases: 15
  completed_phases: 12
  total_plans: 80
  completed_plans: 80
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-27)

**Core value:** A change to this codebase must be cheap and safe to make — a passing gate set genuinely implies a working app, and a wrong legal number can never reach a lawyer silently.
**Current focus:** Phase 14 — lawyer blocked legal fixes & legal traceability

## Current Position

Phase: 14 (Lawyer-Blocked Legal Fixes & Legal Traceability) — not started
Plan: Not started
Status: Phase 13 COMPLETE and verified. Ready to discuss Phase 14.

## Phase 13 — PDF Verification, COMPLETE

7 of 7 plans executed, all with committed summaries. `bash scripts/ci-gates.sh` prints
**`ALL GATES PASSED (24/24)`** and exits 0 — observed on five separate runs at ~5m25s each, including
two consecutive and once more independently after every commit. All five requirements PDF-01…PDF-05
are gate-proven; requirement coverage rose 29/94 → **34/94**.

Four gates registered, at the planned orders: **G22** pdf toolchain (17), **G23** pdf structure (18),
**G24** pdf visual (19), **G25** print layout (20). G10, G11, G8 and G9 shifted to 21–24 with G9 still
last. `order` is the only field that changed on any pre-existing gate; `gates.manifest.lock` grew by
exactly four. `G14` remains reserved and unregistered for Phase 9's `09-06`.

**A real product defect was found and fixed, measured rather than hypothesised.** The exported PDF's
three fonts are PDF base-14 (`Times-Roman`, `Times-Bold`, `Helvetica`), **not embedded**,
WinAnsi-encoded — confirmed by `pdffonts`. WinAnsi has no peso sign, so `₱` (U+20B1) was written as
the byte `0xB1`, extracted as `±`, and rasterised at near-zero advance width **overprinting the first
digit of every amount in every exported estate report**. Plan `13-01` fixed it with a PDF-local
formatter confined to `src/components/pdf/`; `src/types/index.ts` and everything under `engine/` are
untouched, so the web interface still renders `₱`. The fix is confirmed end-to-end in G24's approved
page images.

**Nothing was deleted, skipped or weakened.** The two weak tests the roadmap named — 
`frontend/src/__tests__/print-layout.test.ts` and the `typeof mod.generatePDF` assertion — **do not
exist in the tree**, so every requirement was closed by adding verification that was absent. Six
committed `₱` expectations were *corrected*, not removed, and four tests were added; the frontend
ledger is unchanged at `LEDGER SIZE (debt) 46`. All five shrink-only ledgers are byte-identical.

Every new gate was observed failing against an injection before being trusted: `SECTION MISSING`,
`PDF AMOUNT UNEXPECTED` **and** `PDF AMOUNT MISSING` (a one-centavo change turns G23 red in both
directions), `HEIR EVIDENCE MISSING`, `DIFF FAILURE`, `PDF PAGE COUNT`, `REFERENCE MISSING`,
`PRINT TOP MARGIN`, `PRINT LEFT MARGIN`, `PRINT CHROME VISIBLE`, plus G22's cannot-run path on an
emptied `PATH`. Every injection was restored and `git diff --stat frontend/src/` left empty.

No point of Philippine law arose. `grep -c "[x]" .planning/LAWYER-AGENDA.md` still prints `0`.
G23 asserts the engine's own `legal_basis` string appears in the document — never that the article is
correct.

### Carried forward from Phase 13, recorded not hidden

1. **G3 is intermittently flaky.** `ReviewStep.test.tsx :: … predicted scenario badge shows the engine
   scenario code for testate` failed the full suite twice in ~12 runs and passed 6/6 standalone right
   after. Proven **pre-existing** — reproduced with Phase 13's source edits stashed away. No ledger was
   appended and no test touched. A flaky *blocking* gate will occasionally paint the unattended loop
   red for no product reason.
2. **CI has still never executed.** Whether 24 gates fit the 60-minute timeout on a hosted runner, and
   whether its substitution fonts match `fonts-urw-base35 20200910-1`, are unmeasured. The workflow
   installs `poppler-utils` and `fonts-urw-base35` and records both as risks.
3. **Three cosmetic PDF issues, deliberately not fixed** (no requirement covers them, no plan
   authorised the change): raw `**` markdown reaches the page, citations render `Art. 996: Art. 996`,
   `Legitime Fraction:` prints a bare `0`. All three are now pinned by G24's zero-tolerance references.
4. **The firm header is uncovered because no PDF a user can obtain has one** — `ActionsBar` calls
   `downloadPDF(input, output, null)`. Recorded in `frontend/journey/JOURNEY.md`.

Phase 12 remains COMPLETE. Phase 11 remains EXECUTED, NOT COMPLETE — its four withheld steps are
JRNY-02 and JRNY-03 work and Phase 13 did not absorb them. Phase 09 remains PARTIAL — 09-01, 09-02,
09-04, 09-06 BLOCKED.

The detail below is Phase 11's and is unchanged.

`bash scripts/ci-gates.sh` exits **0** and prints `ALL GATES PASSED (17/17)`, measured twice. Three
gates were registered: **G16** journey registry integrity (static, order 7), **G18** tenant isolation
(order 12) and **G17** live journey run (order 13). `gates.manifest.lock` grew by exactly three with
no existing entry changed, and `G9` is still last.

**Complete and gate-proven:** COV-06 (fourteen isolation cases over four surfaces against a real
local Supabase, every negative paired with a positive control; observed going red when
`cases_org_member` was widened to `USING (true)` and green again after a reset) and JRNY-04 (all
seven guided-intake steps plus the `localStorage` draft-recovery path).

**PARTIAL — four steps withheld rather than passed by weakening.** Each keeps its rubric committed
but has **no step record and no approved reference**, so G16 cannot certify coverage that does not
exist:

1. **`auth-signed-out` (JRNY-02).** Sign-out works and works safely — the `sb-*` session key is
   removed from `localStorage`, the signed-in chrome disappears, zero console errors — but the app
   stays on `/` rendering the anonymous marketing page rather than navigating to `/auth`. The rubric
   asserts the sign-in card. **Whether logout should redirect to `/auth` or remain on the public page
   is a product decision no plan contains**, and research never measured this state. Not a point of
   law.

2-4. **The three onboarding steps (JRNY-03).** All three fail `no_console_error` on **two real
   defects**, both reproduced directly:

   - `getUserOrganization` (`src/lib/organizations.ts:32`) calls `.single()` on a query that
     legitimately matches zero rows for an org-less user, so PostgREST answers **406** on every
     `/onboarding` load. `.maybeSingle()` is the query that expresses "zero or one row".

   - `saveFirmProfile` (`src/lib/firm-profile.ts:97`) builds its upsert payload from supplied fields
     only and never includes `email`, which is `NOT NULL` with no default, so the upsert fails **for
     every user** with `23502`. `src/routes/onboarding.tsx:72` swallows it in an empty `catch` and
     advances anyway, so the user sees `You're all set!` while nothing was saved — confirmed:
     `counsel_name` is empty after a completed run. **Silent data loss on a screen reporting
     success.**

   Plan 11-06 forbade editing application source and forbade weakening the assertion, and
   `allowConsoleErrors` was rejected on principle — that flag exists for a console error that is
   *correct* behaviour, and using it here would hide exactly what the gate had just found.

**Proven in the running application, which no unit test covers:** the `createOrganization`
argument-order fix took effect — an organization created through the real onboarding form is named
`Journey Test Firm`, not the user's uuid. The `/invite/<refused token>` fix is also held in place by
a green gate: it renders `Invitation expired, revoked, or not found` instead of silently redirecting
to `/settings/team`.

Registry: 15 steps, 15 references, every sidecar at `maxDiffPixels` `0`, `--all` green twice in a row.

Also open: Phase 09 remains PARTIAL — 09-01, 09-02, 09-04, 09-06 BLOCKED. `G14` is still reserved
and unused for Phase 9's `09-06`.

**Unmeasured:** this project's CI has still never executed, so whether `supabase start` succeeds on a
GitHub-hosted runner is a recorded risk in the workflow file, not a claim.

Last activity: 2026-07-31

Progress: [███████░░░] 73%

## Performance Metrics

**Velocity:**

- Total plans completed: 27
- Average duration: ~5 min
- Total execution time: ~0.35 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Gate Foundations | 4 | ~21 min | ~5 min |
| 02 | 6 | - | - |
| 3 | 5 | - | - |
| 4 | 5 | - | - |
| 13 | 7 | - | - |

**Recent Trend:**

- Last 5 plans: 01-01, 01-02, 01-03, 01-04 (all complete, no blocks)
- Trend: steady — each wave's gate depended on the previous wave's artifact and all landed first-pass

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 6: the corpus split into TWO directories rather than one. `examples/coverage-cases/` holds shapes that conserve the estate and must stay green; `examples/defect-cases/` holds the three that do not, frozen in a shrink-only `engine/defect-baseline.json`. Putting the breaking shapes into the asserting corpus would have turned G1 red with no legitimate way to make it green this phase, since both defects are lawyer-blocked or owned by a later phase.
- Phase 6: `generate-fuzz-cases.py` was NOT edited. Its seed is fixed and its RNG stream is consumed in generator-declaration order, so inserting a function would have rewritten all 100 committed files. A second generator with its own seed and its own directory produced zero churn.
- Phase 6: the defect ledger is BIDIRECTIONAL. A defect case violating an undeclared invariant fails (the defect got worse); a declared violation that stops reproducing fails with STALE DEFECT DECLARATION (the fix landed and the ledger must shrink). This is what makes Phases 7 and 14 self-verifying rather than self-reported.
- Phase 6: no coverage percentage threshold, anywhere. COV-04 asks for a report and nothing in the requirement or the repo grounds a number, so gate G12 asserts only that the report is producible, that no module vanished from it, and that the zero-coverage set has not grown.
- Phase 6: the fifteen weak-only tests are LEDGERED, not rewritten. Strengthening each requires deciding what the stronger assertion should be, and several are product questions; three depend on Phase 5's open OBS-05/OBS-06 decision. Fifteen judgment calls handed to a cheap executor is the failure mode this project exists to prevent.
- Phase 6: G12 and G13 take orders 4 and 5, ahead of G1, because the runner halts at G3. This is a placement decision about two static checks, not a route around a red gate — G3 still runs, still fails, and still stops the run.
- Phase 6 (DEVIATION, recorded deliberately): `engine/defect-baseline.json` was corrected during 06-02 even though that plan declared it read-only. Its bidirectional test failed on its first run and found two real inaccuracies: unpadded invariant ids, and an under-declared SAFETY01 violation on `02-heir-donation-above-estate.json` (lc2 receives 125,000,000 centavos against a 100,000,000 estate, verified by dumping the rows). The correction declares MORE observed wrongness and added no case entry.
- Phase 6 (new measurement): a donation to an heir breaks sum conservation from ratio 0.6 upward when there are THREE legitimate children, not only above 1.0 as with two. Same LAW-06 mechanism at a lower threshold, not a new defect and not a new legal question.

- Roadmap: fine granularity produced 15 phases (above the typical 8-12) — deliberate, per owner's explicit instruction that small phases are the primary defense against context-drift in the cheap executor model over a month-long horizon.
- Roadmap: LAWYER review agenda placed at Phase 4 (early) specifically to maximize the lawyer's response window while unblocked engineering work (Phases 5-13) proceeds without waiting on it. The three lawyer-blocked legal fixes (LAW-06, LAW-07, LAW-12) are deliberately deferred to Phase 14 (late).
- Roadmap: OBS (Phase 5) sequenced before all LAW-* fix phases — with `warnings: []` hardcoded, no legal fix is observably correct.
- Roadmap: EXT-01 (delete duplicate scenario classifiers, Phase 9) sequenced before JRNY-05 (succession wizard screenshot gates, Phase 12) — a screenshot gate would otherwise certify a wrong "Predicted:" badge as passing.
- Phase 1: measured, not assumed — 296 of the 342 frontend test failures (86.5%) are a missing jsdom polyfill in `src/test-setup.ts`, not product or test defects. A probe run with `ResizeObserver`/`DOMRect`/`matchMedia`/Radix pointer-API shims dropped the suite from 342 failures across 22 files to 46 across 11. Plan 01-02 applies exactly that fix and nothing else.
- Phase 1: the 46 residual failures are NOT fixed in this phase. They are genuine test-vs-product mismatches, several requiring product judgment, and repairing them via test-query rewrites is the test-weakening this project forbids. They are recorded in `frontend/test-baseline.json` instead.
- Phase 1: CI enforces a **known-failure ledger**, not a bare `npm test`. The complete unmodified suite runs; the gate fails on any failure not in the ledger, on any ledger entry that starts passing (forcing the ledger to shrink), on any skipped/pending/todo test, and on the total test count dropping below 2416. This is strictly stronger than plain `npm test`, where a `.skip` is silently green. The ledger may only shrink; appending to it to go green is prohibited.
- Phase 1: all gate logic lives in `apps/inheritance/scripts/ci-gates.sh`, and the GitHub workflow's only project-check step invokes that script. CI behavior is therefore reproducible and debuggable on a developer machine rather than only after a push.
- Phase 1: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda.
- Phase 2: LOOP-03 is enforced by a **growth-only** gate manifest — the exact inverse of Phase 1's shrink-only test ledger. `gates.manifest.lock` freezes `{id, command, blocking}`; `order`, `name`, `proves` and `requirements` are deliberately unlocked, because reordering and prose are not weakening.
- Phase 2: `scripts/ci-gates.sh` becomes a **manifest interpreter** rather than a hardcoded list. This is what makes the manifest real: a gate can only stop running by being removed from the manifest, which the integrity check rejects.
- Phase 2: the runner adopts a **three-valued exit contract** — 0 all gates ran and passed, 1 a gate ran and failed, 2 a gate could not run. Conflating the last two is how a month-long loop silently redefines success.
- Phase 2: coverage is computed by joining two independent sources — the frozen manifest as expectation, the run record as observation — and fails a *passing* run that skipped a blocking gate (`SCOPE NARROWED`). A halted run is exempt, so the halt behavior stays usable.
- Phase 2: the commit-discipline audit filters by **path scope, not author**. Filtering out the auto-committer would hide the exact commit the audit exists to catch. Measured: zero mixed commits over `bdee3c498..HEAD`, so the audit starts green.
- Phase 2: the closed-world lint skips fenced code blocks and inline code spans. Measured against the Phase 1 corpus, all 20 candidate hedge phrases score zero hits (`TODO` only matched case-insensitively on `.todo`/`numTodoTests`), so the blacklist is satisfiable with no waiver mechanism — and none is built.
- Phase 2: the stall rule is fixed, not discovered — three consecutive non-pass runs sharing a failure signature, or five consecutive non-pass runs regardless. `loop-status.mjs check` is deliberately **not** wired into `ci-gates.sh`, because a stall detector that fails the gate run makes the stall self-perpetuating.
- Phase 2: no notification channel is invented. None is configured in this repo, so the visible signal is a committed `LOOP-STATUS.md` plus the CI check that already fails on any nonzero runner exit. Inventing a channel would be an ungrounded decision.
- Phase 2: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda.
- Phase 3: measured, not assumed — ports 54321–54324 are **occupied right now** by a sibling monorepo app's Supabase stack, and five sibling `config.toml` files all claim 54321. `apps/inheritance` moves to the measured-free 55320–55329 block and renames `project_id` from `app` to `inheritance`. Stopping the other app's containers is prohibited; the collision is resolved by moving, not by evicting.
- Phase 3: the runtime storage-bucket set has exactly **one** member, `firm-logos`, measured from two `supabase.storage.from` call sites with zero `createBucket` calls anywhere. `case_pdfs` exists as a table but no code reads or writes it, so it implies no second bucket.
- Phase 3: the bucket is `public = true`. Grounded in three observations, not preference — `LogoUpload.tsx:43-44` renders the stored value directly as `<img src>`, `firm-profile.test.ts:23` mocks `getPublicUrl`, and a firm logo is branding printed onto third-party PDFs rather than case data. Write access stays confined to the uploader's own user-id folder.
- Phase 3: the seed carries **two** tenants, not one. ROADMAP Phase 11 criterion 4 needs an excluded org to test RLS isolation against, and extending a fixture that later gates already reference by id is the churn a fixture exists to prevent.
- Phase 3: the seeded case `input_json` is a **byte-for-byte copy** of `engine/examples/cases/02-married-3lc.json`, verified by comparison in the gate. Authoring a family tree is choosing which succession rules the fixture exercises, which is the beginning of a legal judgment. Copying removes the risk entirely.
- Phase 3: GATE-09 cannot be met by wrapping gate commands — `gates.manifest.lock` freezes every `command` string. Skip accounting therefore goes in the **unlocked** runner (which tees each gate's output to a run-stamped log) and in the **unlocked** bodies of the five gate scripts this project owns. `cargo test` and `tsc` are external, so their skip counts are derived rather than emitted.
- Phase 3: `gate-skips.lock` is a **shrink-only** ledger opening with exactly one entry (`G4 / tsconfig.skipLibCheck`). Three ledgers now point the same direction: `gates.manifest.lock` may only grow, `frontend/test-baseline.json` may only shrink, `gate-skips.lock` may only shrink.
- Phase 3: `gate-results.json` is a **new committed artifact**, not an un-gitignoring of `.gate-runs/latest.json`. The run record carries no gate name, no `proves` text and no requirement mapping; the published file is the join. The four statuses `pass`, `fail`, `cannot-run`, `not-run` reach it verbatim, and a status of `skipped` is explicitly rejected.
- Phase 3: `check-env-ready.mjs` is deliberately **not** registered as a blocking gate. It needs Docker and a running stack, which GitHub Actions has neither of; that registration belongs to Phase 11 alongside the DB-touching journey gates.
- Phase 3: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda.
- Phase 4: the agenda is a **restructuring of `.planning/research/LEGAL-CONFORMANCE.md` section 3**, not a re-derivation. All eight questions already exist there in a uniform shape with verified citations, so no plan asks an executor to state what an article says or to weigh a reading. Copying is the whole job.
- Phase 4: three artifacts rather than one, because the audiences differ — `.planning/LAWYER-AGENDA.md` is what the lawyer answers, `.planning/lawyer-decisions.json` is what the gate checks, `.planning/LEGAL-CORRECTION-WORKFLOW.md` is what happens after an answer arrives. Keeping them separate is also what lets gate G10 compare two of them; a single file cannot disagree with itself.
- Phase 4: the decision-to-code link is **bidirectional and gate-checked in both directions** — the registry names `{file, pattern}` anchors, and each anchored site carries a `LAWYER-DECISION: LAWYER-0N` comment. `DECISION ANCHOR BROKEN` catches a renamed rule; `DECISION MARKER MISSING` catches a dropped comment.
- Phase 4: anchors are **grep patterns, never line numbers**. Phases 5, 7 and 8 rewrite the exact files the registry points at. Measured: all ten patterns match exactly once; two shorter candidates were rejected for matching twice, and the gate treats a count other than 1 as broken.
- Phase 4: `DECISION STATUS INVALID` is the load-bearing verdict. Any status other than `awaiting-answer` requires `answered_by`, `answered_on` and `answer`, so an agent cannot unblock LAW-06, LAW-07 or LAW-12 by editing one word of JSON without writing a visible lie into the diff.
- Phase 4: measured structural constraint — `scripts/check-gate-results.mjs` (G9) fails with `RESULTS INCOMPLETE` when any gate other than itself is `not-run`, and the runner republishes after every gate. A gate ordered after G9 would therefore fail G9 on every run. New gate **G10 takes order 8**, G8 moves to 9, G9 moves to 10. `order` is deliberately unlocked, and this placement also puts G10 ahead of the skip-accounting gate so its own `GATE-SKIPS` line is checked rather than exempted.
- Phase 4: the Q7 spec hedge at `specs/estate-tax-engine-spec.md:1008` is **replaced by a pointer, never deleted**. Deleting it would leave the spec asserting the ½ rule unqualified, which is an unrecorded ruling on a contested point of law. The replacement text is written literally into plan 04-03 so the executor copies rather than composes it.
- Phase 5: measured live, not assumed — a debug CLI was built and run over all 140 committed inputs (20 examples, 100 fuzz, 20 testate). Across 564 per-heir rows: **0** nonzero `from_legitime`, **0** nonzero `from_free_portion`, **0** nonzero `from_intestate`, **0** non-empty `legitime_fraction`; **0 of 140** cases emit any warning; `computation_log.steps` has length **1** in every case. Those six numbers are what Phase 5 inverts, and `05-VALIDATION.md` records them as the before column.
- Phase 5: OBS-05 and OBS-06 are safe to promote from test assertion to runtime rejection because both predicates already hold today. `engine/tests/fuzz_invariants.rs:65-72` asserts the identical sum-conservation predicate over 100 cases and passes; the corpus run found **0** duplicate `heir_id` values and **0** empty distributions with a nonzero estate. The escheat case was checked specifically: `integration.rs:1283` asserts I15 produces one synthesised State share, not an empty distribution, so the conservation check needs no carve-out.
- Phase 5: `pipeline::run_pipeline` keeps its infallible signature and the checked behavior arrives as a **new** `run_pipeline_checked`. `engine/tests/fuzz_invariants.rs` wraps the old one in `catch_unwind` deliberately, and all 30 integration tests use a private inline copy of the pipeline defined at `integration.rs:27` — that file never calls `pipeline.rs` at all, so any `Step10Input` field change must be mirrored there or the test binary does not compile.
- Phase 5: the spec's ten manual review flag codes (`specs/inheritance-engine-spec.md:2303-2321`) are a set **disjoint** from the six category strings the crate constructs today. Both survive. `.planning/research/LEGAL-CONFORMANCE.md:74` describing the six as "6 of the spec's 10" is imprecise; the six are internal pipeline events and the ten are the spec's human-judgment list.
- Phase 5: five of the ten spec triggers cannot be expressed by the current `EngineInput`. They arrive as one serde-defaulted `ManualReviewFacts` struct hung off `EngineConfig` rather than as fields scattered across `Person`, `Donation`, `Legacy`, `Devise` and `Disinheritance`. Measured reason: `grep -rn "EngineConfig {"` finds two sites plus one test helper, whereas the alternative requires editing 89 exhaustive Rust struct literals. On the TypeScript side every new member is optional, so all 14 config object literals in tests plus `WizardContainer.tsx:65` stay valid and `tsc` stays clean with zero test edits.
- Phase 5: emitting a `ManualFlag` decides nothing — it is the engine saying a human must decide. Every detector is a field comparison transcribed from the spec table, and the five new input members are facts the person entering the case asserts, never conclusions the engine derives. **No point of Philippine law arises in this phase and nothing was added to the lawyer review agenda.**
- Phase 5: two anti-regression mechanisms rather than one. `engine/tests/observability.rs` (under existing gate G1) catches a behavioral regression across the whole 140-case corpus; new gate `G11` (`node scripts/check-observability.mjs`) catches a source regression — the reappearance of the empty-warnings literal or a re-zeroed sub-component on a path no test happens to cover. Both hardcoded lines survived unnoticed for the codebase's entire life, which is what justifies a grep-level guard alongside a behavioral one.
- Phase 5: G11 takes `order` 9, pushing G8 to 10 and G9 to 11 — the same constraint Phase 4 discovered, that `scripts/check-gate-results.mjs` fails with `RESULTS INCOMPLETE` on any gate it sees as `not-run`, so G9 must stay last. The phase ends at 11 gates.
- Phase 4: eight points of Philippine law arise and all eight are *recorded, never decided*. Every agenda entry ships `**Status:** Ready to plan

- Phase 6: measured, not assumed — `LEGAL-CONFORMANCE.md:76`'s three claims all reproduce. Across all 140 committed inputs, `NephewNiece` appears in **0** files, `recipient_is_stranger: true` in **0** files, and the maximum donation/estate ratio is **0.5524**. Five of eleven `Relationship` variants appear nowhere at all.
- Phase 6: two of COV-01's three shapes BREAK sum conservation today. A donation to an heir at ratio > 1.0 and a donation to a **stranger at any ratio** (measured at 0.1) both make the per-heir sum exceed the estate. Both are the documented LAW-06 defect, lawyer-blocked on LAWYER-06 and owned by Phase 14.
- Phase 6: the collateral defect's trigger was found by bisection — **`blood_type` set on the `NephewNiece` rows**. The exact `LEGAL-CONFORMANCE.md` reproduction landed to the centavo: 5 rows, both nephews duplicated, Σ = ₱4,800,000 against a ₱6,000,000 estate. The identical family with `blood_type` null conserves the estate and produces 3 clean rows.
- Phase 6: therefore **two corpora, not one**. `examples/coverage-cases/` (30 generated, all green, read by the invariant suite) and `examples/defect-cases/` (3 hand-written, all violating) governed by a shrink-only `engine/defect-baseline.json`. The ledger test fails both when a defect worsens and when a declared violation stops reproducing, which makes Phases 7 and 14 self-verifying.
- Phase 6: `generate-fuzz-cases.py` is **not edited**. It has a fixed seed and was verified to regenerate all 100 committed files byte-for-byte, so inserting a generator would shift the RNG stream and rewrite the whole corpus. A second generator with its own seed and directory produces zero churn.
- Phase 6: COV-03 is not about loosening — it is about absence. `check_scenario_consistency` is `#[allow(dead_code)]` and called **0** times, so **0 of 23** legal vectors assert a scenario code, and `grep -n starts_with` over `integration.rs` returns nothing. The spec's table at `specs/inheritance-engine-spec.md:2371-2393` supplies all 23 expected codes; 19 match the engine literally and the other four are notation (`T3→I2`, `MIXED`, `T12-AM`, `I2→I5`, plus `I-ID` which is not an enum variant), all reconciled in `06-RESEARCH.md` §4.2. **Zero legal decisions were required.**
- Phase 6: TV-13's spec figure `₱1,666,666.67` repeated three times sums to ₱5,000,000.01. The engine emits 166666667/166666667/166666666 under largest-remainder rounding. The engine is right, conservation requires it, and the assertion uses centavos — which is why a new `assert_total_centavos` helper is added alongside the whole-peso one rather than replacing it.
- Phase 6: COV-04 needs **no crate and no npm package** — only the rustup component `llvm-tools-preview`, installed and exercised end to end during planning. Stable Rust coverage is region-based and `llvm-cov`'s `Branches` column is empty, so "which branches no test exercises" is implemented as "which regions and functions no test enters", the finer granularity.
- Phase 6: the coverage gate asserts **no percentage threshold**, because no number in the requirement or the repo grounds one. It asserts that the report is producible, that no engine module has vanished from it, and that the set of modules at exactly zero coverage (`src/main.rs`, `src/wasm.rs`) matches a shrink-only ledger.
- Phase 6: COV-05 measured **0** assertion-free tests and **15** weak-only tests across 112 files and 2383 blocks, each verified by eye. The 15 are ledgered in a shrink-only `assertion-baseline.json` keyed by file plus full test name (never line number), rather than rewritten, because rewriting them is 15 per-test product decisions and three of them sit on Phase 5's unresolved question.
- Phase 6: both new gates take `order` 4 and 5, **ahead of G1**. `gates.manifest.lock` freezes only `{id, command, blocking}` and `GATES.md` §1 states `order` is unlocked. This is placement of two static checks, not routing around a red gate: G3 still runs, still fails, and still stops the run. **`ALL GATES PASSED (13/13)` is not achievable in Phase 6 and must not be claimed.**
- Phase 6: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda. Two assertions cite LAWYER-03 (Art. 1006 blood ratio, TV-15) and LAWYER-04 (Art. 992 iron curtain, TV-20); citing a recorded question is not answering it.

- Phase 8: `check_preterition` gained a THIRD PARAMETER rather than a new `Step6Input` field. Measured reason: `engine/tests/integration.rs` holds an inline copy of the pipeline that constructs `Step6Input` and `Step7Input` directly, so any struct change breaks the test binary. No struct in step 6 or step 7 changed shape anywhere in this phase, and the inline copy compiled untouched — the single biggest risk reducer the plans identified, and it held.
- Phase 8: `SuccessionType::Intestate` and `SuccessionType::IntestateByPreterition` were SPLIT into separate match arms in `step7_distribute.rs`. They shared one arm, which is why Art. 854's "the devises and legacies shall be valid insofar as they are not inofficious" was unreachable: the preterition path returned a hand-built zeroed `InofficiousnessResult`, so step 7 had no reduction to consult and no ceiling.
- Phase 8: an unvaluable disposition is FLAGGED, not paid zero. `compute_devise_value` returns zero for both `DeviseSpec` variants and `compute_legacy_value` returns zero for `LegacySpec::SpecificAsset`, because `EngineInput` carries no asset inventory. Under preterition these now emit `preterition_unvalued_disposition` rather than silently crediting ₱0, which would imply the devisee was considered and found entitled to nothing.
- Phase 8: the `advisor.ts` medical-deduction date gate was INVERTED relative to the statute — it fired only for deaths on or after 2018-01-01, the exact regime where RA 10963 Sec. 23 had repealed the deduction. Six committed test expectations asserted the repealed rule; all six were CORRECTED to the statute and four tests were ADDED. Nothing was deleted, skipped or loosened.
- Phase 8: `sensitivity.ts` was deliberately NOT edited for LAW-08. `leverMedicalExpenses` already returns null on a zero delta, so the lever disappears under TRAIN as a consequence of the `special-deductions.ts` gate. Editing it would have been a second implementation of the same rule.
- Phase 8: the tax bridge keeps `item40_gross_estate` and `item44_total_deductions` even though neither name means what it says. `cases.tax_output_json` is a JSONB blob and rows written before this phase must still parse. The four new Art. 908 components arrive beside them, and `computeDistributableCharges` THROWS on a missing one — `grep -c "?? 0\||| 0"` over `tax-bridge.ts` returns 0. A stale blob fails loudly rather than understating every heir's share.
- Phase 8 (DEVIATION, recorded deliberately): three pre-existing bridge tests supplied their INPUTS through the historical field names as `createTaxOutput` overrides, so after the fix they no longer drove the computation. Their inputs were restated in the new field names; every expected value (0, 0, 600000000) is unchanged and each carries a comment saying so. No assertion was weakened.
- Phase 8: Phase 5 had already built the `RESERVA_TRONCAL` detector and its input field. What was missing was REACHABILITY — zero `manual_review_facts` references in any `.tsx` — and an express scope declaration. LAW-11 was therefore closed with one wizard checkbox and one spec subsection, and NO file under `engine/src/` was edited.
- Phase 8: ONE point of Philippine law arose and was RECORDED, NEVER DECIDED. Whether a donation the Code exempts from collation (Arts. 1062, 1066, 1067, 1068, 1070) nevertheless defeats *Morales*' total-omission test is `LAWYER-09`, `awaiting-answer`, added to `REQUIRED_IDS` so it is mandatory rather than tolerated, and anchored bidirectionally to `pub fn heir_received_advance_on_legitime`. The engine implements Reading A and says so out loud via a `preterition_exempt_donation` flag. `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` is still 0.
- Phase 8: every asserted centavo figure was derived in `08-RESEARCH.md` BEFORE the fix and asserted afterwards. All four LAW-05 vectors and the LAW-11 vector passed on their FIRST run at exactly those values — meaningful confirmation, since a vector written to match whatever the engine produced would be vacuous.

- Phase 9: the "Predicted:" badge is BACKED BY THE ENGINE, not removed. ROADMAP criterion 1 offered both endings and the plans choose one so the executor never has to. Grounds: ROADMAP sequences Phase 9 before Phase 12 specifically so the wizard screenshot gate has a correct badge to certify; `ReviewStep` already holds a complete `EngineInput` via `watch()`; and removal would require deleting three committed tests, whereas engine-backing lets all three be strengthened.
- Phase 9: measured live, not assumed — the live classifier at `ReviewStep.tsx:34-63` returns `I1` where the release engine returns **I2**, and `T1` where it returns **T2**, on the exact one-legitimate-child-plus-spouse fixtures its own tests use. Two purpose-built inputs were run through `engine/target/release/inheritance-engine` to get those figures. That is the wrong-badge defect, one code off on the most common Philippine family shape.
- Phase 9: the classification entry point is a NEW `classify_scenario` in `engine/src/pipeline.rs`, and `run_pipeline` is deliberately NOT refactored. Measured justification: all nine `scenario_code` assignments in `pipeline.rs` (including both inside `run_pipeline_with_restart`) are `step3.scenario_code`, so equivalence with the full pipeline is exact and directly testable over all 173 committed inputs. A test that re-checks agreement on every `cargo test` run is a stronger guarantee than a one-time refactor, and it leaves `integration.rs`'s inline pipeline copy untouched.
- Phase 9: `classify_json` in `wasm.rs` is a two-line parse/call/serialize wrapper with NO native test, on purpose. `coverage-zero.lock` declares `src/wasm.rs` at zero coverage and `check-coverage.mjs` fails with `STALE ZERO COVERAGE DECLARATION` if a declared module gains a covered region. Putting the logic in `pipeline.rs` keeps that ledger untouched.
- Phase 9: money units use a FLAVOUR (an optional brand property), never a hard brand. Verified end to end against this repo's own TypeScript 5.9.3 before planning: numeric literals and plain `number` stay assignable, `Pesos` and `Centavos` are mutually unassignable, and with the brand removed the proof file emits four `TS2578: Unused '@ts-expect-error' directive` errors. A hard brand would have broken hundreds of fixture literals.
- Phase 9: measured constraint that moves the EXT-03 proof — **`frontend/tsconfig.json` excludes every test file** (`src/**/__tests__/**`, `*.test.ts(x)`, `*.spec.ts(x)`). Gate G4 typechecks no test. The negative type test therefore lives at `frontend/src/types/money-units.typetest.ts`, a path `include` covers. Recorded and not acted on: that exclusion is arguably a second undeclared G4 skip beside `skipLibCheck`, but `gate-skips.lock` may only shrink and appending is prohibited.
- Phase 9: EXT-02 is a REGISTRY of four measured rules, not a general duplicated-logic heuristic. `as ScenarioCode` appears in exactly one file today (12 hits, all `ReviewStep.tsx`) and zero elsewhere, which makes it a zero-false-positive detector; the deleted classifier evaded a literal-density grep entirely by building codes with template strings. `SSOT-02` and `SSOT-04` exclude `__tests__` with named evidence, and `SSOT-04` allows three files, two of which compute percentages rather than money.
- Phase 9: the registry cannot be gutted because `REQUIRED_IDS` is hardcoded in `scripts/check-single-source.mjs` — the same mechanism `check-lawyer-agenda.mjs` already uses and Phase 8 extended. That is why no fourth lock file is introduced.
- Phase 9: `G14` takes `order` 6, ahead of the `G3` halt at order 9, so it is observable in a real runner invocation rather than merely registered. `G9` stays last, per the constraint Phase 4 measured. **`ALL GATES PASSED (14/14)` is not achievable this phase and must not be claimed.**
- Phase 9: `check_adoption_equality` is REVIVED BY BEING CALLED, never deleted. It is invariant 6 (adopted share equals legitimate share) with zero call sites; deleting an unused assertion removes verification, which is the one direction this project never moves. Only the three helpers with no assertion and no legal content are deleted. `check_scenario_consistency` keeps its 28 call sites and merely loses a stale attribute.
- Phase 9: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda. Every task deletes a duplicate, routes a caller to the engine, or separates two units of currency.

- Phase 10: measured, not assumed — this repo has **no browser tooling at all**. The single `@vitest/browser-playwright@4.0.18` hit at `frontend/package-lock.json:12363` is vitest's own optional peer dep with no `test.browser` block anywhere, so it is not wired up. Phase 10 introduces the first browser automation in the project.
- Phase 10: the whole stack was probed live before planning, not reasoned about. `playwright@1.56.1` + `pixelmatch@7.2.0` + `pngjs@7.0.0` installed in a scratch dir, chromium downloaded (104.3 MiB, build v1194) and launched headless, a screenshot captured, and a diff produced `DIFF pixels = 69` with an 11,448-byte diff image — `PROBE_EXIT=0`. Those three exact versions are what the plans pin; no plan may resolve a range.
- Phase 10: a rubric assertion is a **deterministic DOM predicate, never a model call**. JRNY-09's own words are "never free-form judgment", and a model verdict is that judgment; `.github/workflows/inheritance.yml` also declares no model secret, so a vision-API rubric could not run in CI at all. The kind set is closed at **eight** and an unrecognised kind throws rather than being interpreted — that rejection is what makes the requirement mechanically true. `PROJECT.md:111`'s diff-plus-rubric pairing survives intact: the measured predicate distinguishes ₱1,000,000.00 from ₱1,500,000.00, which is exactly the blind spot that entry assigns to the rubric.
- Phase 10: **five named failure markers**, not one — `RUBRIC FAILURE`, `DIFF FAILURE`, `REFERENCE MISSING`, `REFERENCE SIZE MISMATCH`, `STEP ERROR`. JRNY-10 needs a gate to *branch* on which mechanism failed, because the remedies differ: a rubric failure means the app shows a wrong value; a diff failure means either the layout moved or the reference is stale. A step failing both reports both markers, and `FAILURE.txt`'s first line carries them into the durable record.
- Phase 10: **approval is a separate command, never a flag on the gate.** A gate that can approve its own reference goes green by rewriting its own expectation. `approve.mjs` is the only module permitted to write into `frontend/journey/references/`, it sources only from `.journey-runs/<run>/<stepId>/actual.png`, and it refuses when no run produced one.
- Phase 10: **no golden reference image of the real app is committed.** Font rasterisation differs between a dev machine and a CI container, and no CI run has ever executed for this project (25+ commits unpushed), so a committed golden would be an unmeasured claim. G15's self-test generates its reference at run time from a committed HTML fixture, testing the diff *mechanism* without inheriting the portability problem. Phases 11-12 own real references, using the documented re-approval flow.
- Phase 10: the one real seeding gap is that **neither wizard's step index is URL-encoded** (`WizardContainer.tsx:76`, `EstateTaxWizard.tsx:51`). A React prop cannot fix it — Phases 11-12 drive a real browser, which can only set a URL, a cookie or web storage. So `?step=`, `?hasWill=1` and `?tab=` are added as additive, clamped, read-once-at-mount seams; with no param present both components behave byte-identically to today, which is why no committed test is edited.
- Phase 10: storage seeding uses `page.addInitScript`, never `page.evaluate` after navigation. An `evaluate` call runs after the app has mounted and already read storage, which is too late for the draft-recovery path JRNY-04 must verify.
- Phase 10: the gate is **G15, not G14**. Phase 9's unstarted `09-06-PLAN.md:59` reserves G14 for `check-single-source.mjs`; reserved-but-unregistered is still reserved. G15 takes `order` **6**, ahead of the inherited G3 halt (now order 9), and G9 stays last per the constraint Phase 4 measured. The phase ends at 14 gates and **`ALL GATES PASSED (14/14)` is not achievable — it needs Phase 5's OBS-05/OBS-06 answer.**
- Phase 10: the DB-seeding half is proven by an on-demand `seed-smoke.mjs` rather than a registered gate, mirroring Phase 3's handling of `check-env-ready.mjs` — GitHub Actions has neither Docker nor Supabase. It exits **2** (cannot-run) when the stack is down, never 1.
- Phase 10: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda. Every task installs a dependency, writes a browser-driving helper, or registers a gate.

- Phase 12: measured live, not assumed — `ReviewStep.tsx:34 predictScenario` returns **I1** where the release engine returns **I2** on `engine/examples/cases/02-married-3lc.json`, and **I2** where the engine returns **I1** on `01-single-lc.json`. The two codes are SWAPPED on the two commonest Philippine family shapes, and `seed.sql:15` states the seeded fixture case is a verbatim copy of the first. A `wizard-review` reference approved before the fix would freeze a wrong legal answer, which is exactly what ROADMAP Phase 12 criterion 1 exists to prevent.
- Phase 12: the EXT-01 fix is absorbed as plan `12-01` and it needs NO engine change. The badge renders `scenario_code` only (`ReviewStep.tsx:289`); the succession type shown beside it is `hasWill ? 'Testate' : 'Intestate'`, a form field. `scenario_code` already crosses the boundary through the existing `compute_json` export and the existing `compute()` bridge, so neither of Phase 9's two blockers — the `succession_type` equality false on 59/173 inputs, and the missing `classify_json` — applies. The dead `bridge.ts` copies stay Phase 9's to delete.
- Phase 12: the badge's empty and rejected states render the literal `—`, transcribed from `ReviewStep.tsx` lines 253, 268 and 269, which already use it for an absent amount, name and date. This is the file's own convention rather than a new design choice, which is what keeps the plan closed-world.
- Phase 12: **no seed row and no fixture id is added anywhere in the phase.** `scripts/check-seed-fixture.mjs` rejects a seeded `output_json` with the marker `SEED WRITES OUTPUT` — "a seeded engine result is a per-heir peso figure nothing computed" — and byte-compares every `$json$` block against the engine case. So the results view is reached by clicking the real compute button in a real browser, which is strictly stronger verification, and the one share state needing a computed case gets it from a `case-alpha-computed` reset that runs the real WASM at run time.
- Phase 12: **no rubric anywhere in the phase carries a peso figure.** A `text_equals` holding a formatted amount is a transcription of engine output that stops tracking it. Money is asserted only by gate G19, which recomputes with the same `inheritance_engine_bg.wasm` the product loads and compares `BigInt` centavos, and which **parses** displayed text back rather than formatting — so no second money formatter is introduced.
- Phase 12: the twenty-eight new screens need no new gate. `G16` (static registry integrity) and `G17` (`node journey/run.mjs --all`) already cover every record in `frontend/journey/steps/`, which is why those two were written the way they were. The three new gates cover only what a DOM rubric cannot express.
- Phase 12: JRNY-11 is a script and not fourteen reference images. The requirement asks for a smoke check, not layout freezing, and fourteen PNGs of long marketing pages would be fourteen re-approvals per copy edit on the one surface with no peso figure. "No 404" is implemented as the checkable thing — no response observed during the navigation carried HTTP 400 or above — because `src/router.ts` declares no `notFoundComponent`.
- Phase 12: JRNY-08's field set was already decided and written down by migration `015`, whose `RETURNS TABLE` list is exactly six columns and whose header states that widening an anonymous share link is an owner decision. Gate G20 makes that decision checked rather than re-deciding it, and pairs the six-name equality with a nine-name forbidden list.
- Phase 12: the two frozen requirement lists in `journey/run.mjs` and `scripts/check-journey-registry.mjs` are WIDENED, never relaxed. Every other rule stays byte-identical and plan 12-02 observes a `JRNY-99` record still producing `STEP FIELD INVALID` and `JOURNEY CANNOT RUN` before it commits.
- Phase 12: the four Phase 11 steps withheld as BLOCKED stay withheld. `auth-signed-out` and the three onboarding screens are JRNY-02 and JRNY-03 work, and absorbing them here would mix an owner product decision and two source defects into a verification phase.
- Phase 12: no point of Philippine law arises anywhere in this phase — nothing added to the lawyer review agenda. The single legal value asserted, the scenario code `I2`, is read out of the engine's own output by running a command.

- Phase 13: measured live, not assumed — the exported PDF's fonts are base-14 `Times-Roman`/`Times-Bold`/`Helvetica`, **not embedded**, WinAnsi-encoded (`pdffonts`). `₱` U+20B1 is written as the byte `0xB1`, extracts as `±` U+00B1, and rasterises at near-zero advance width overprinting the first digit. Every amount in a lawyer's exported report carries a corrupted currency mark. The same probe with `PHP ` extracts as one contiguous line.
- Phase 13: the fix is a PDF-LOCAL formatter, not a font and not a change to `formatPeso`. Four alternatives were each closed off by a measurement: no `.ttf`/`.otf`/`.woff` exists anywhere in the dependency tree (`@fontsource-variable` ships `woff2` only, which `@react-pdf/renderer` cannot load); a system font path differs between this machine and a CI container; `formatPeso` is the web user interface's formatter and a browser renders `₱` correctly; and the `₱` inside `narratives[].text` is Rust engine output, so editing it would rewrite committed Rust expectations for a display problem the engine does not have. `PHP` is the ISO 4217 code, so no wording is invented.
- Phase 13: nothing in this phase closes a weak assertion. `.planning/codebase/TESTING.md` names `frontend/src/__tests__/print-layout.test.ts` and a `typeof mod.generatePDF` check; **neither exists in the tree** and the print-layout file has no git history at all. Every requirement is closed by adding verification that was absent, so no test is deleted, skipped or loosened anywhere in the phase.
- Phase 13: the required-section list is DERIVED FROM THE RUN, never committed. `WarningsSection` returns `null` when the engine emits no warning and the seeded case emits none; `NarrativesSection` returns `null` when there are none and the seeded case has four. `FirmHeaderSection` is excluded outright because `ActionsBar.tsx:49` calls `downloadPDF(input, output, null)`, so no PDF a user can obtain carries a firm header.
- Phase 13: the PDF is obtained by CLICKING THE PRODUCT'S OWN EXPORT BUTTON in a real browser, extending the Phase 12 decision that the results view is reached by clicking the real compute button. A PDF the harness rendered itself would prove the harness works, not that the lazy `import('@react-pdf/renderer')`, the `profile: null` argument and the blob download all work. One attribute is added to application source, plus one pre-authorised single-line change to `pdf-export.ts`'s blob revocation that applies only if the download probe fails.
- Phase 13: determinism blocker measured and fixed — `CaseSummarySection` prints `Report Generated:` from `new Date()`, so a zero-tolerance reference would fail the next calendar day. `page.clock.setFixedTime` is used and `page.clock.install` is not: Playwright's own types document the former as keeping timers running, and the latter would stall React scheduling and the debounced autosave. The fixed instant `2026-06-15` is after the seeded decedent's date of death `2026-01-15` and before real time, so a session token minted at real time has its expiry in the fake future and `supabase-js` treats it as live.
- Phase 13: PDF page references get their OWN directory. `scripts/check-journey-registry.mjs:275` raises `ORPHAN REFERENCE` for any image under `journey/references/` that is not a declared browser step, and its requirement list is frozen to `JRNY-02…JRNY-08`. Widening it would make PDF pages masquerade as browser steps carrying `url`, `session` and `rubric` fields they do not have. `compareToReference` already takes `referencesDir` as a parameter, so the comparator, the five frozen markers and the `maxDiffPixels` contract are reused with no second implementation.
- Phase 13: no npm package is added for PDF handling. poppler's `pdftotext`, `pdfinfo` and `pdftoppm` cover all five requirements through one seam; `pdfjs-dist` was rejected because rasterising through it needs a native canvas binding, and this project's gates install no compiled dependency. `pdftoppm -png -r 100` was observed byte-identical across two consecutive runs.
- Phase 13: **recorded as a risk, not a claim** — the base-14 fonts are not embedded, so poppler substitutes from `fonts-urw-base35 20200910-1`. A different poppler or font package on a hosted runner would rasterise differently, and this project's CI has still never executed. Same exposure Phases 11 and 12 accepted for browser references; the workflow installs both packages explicitly and `GATES.md` records both versions.
- Phase 13: no point of Philippine law arises anywhere in this phase. Article citations are asserted **present and matching the engine's own `legal_basis` entries**, never asserted correct. Nothing is added to `.planning/LAWYER-AGENDA.md`.

### Pending Todos

- Phase 7 owns `engine/examples/defect-cases/01-collateral-halfblood-nephews.json`. When LAW-02 lands, `engine/tests/defect_ledger.rs` fails with `STALE DEFECT DECLARATION` until that entry is deleted from `engine/defect-baseline.json`. That failure is the intended signal, not a regression.
- Phase 14 owns the two donation defect cases the same way, once LAW-06 is unblocked by the answer to LAWYER-06.
- Phase 5's five failing frontend tests include three of the fifteen weak-only tests ledgered by Phase 6. Answering the OBS-05/OBS-06 product decision clears rows in both `frontend/test-baseline.json` and `assertion-baseline.json` at once.
- **Closed by Phase 9 plan 09-02**: `check_adoption_equality` is revived by being called from `test_tv09_adopted_equals_legitimate`, `find_share_by_name` is deleted, and `check_scenario_consistency`'s stale `#[allow(dead_code)]` is removed. Two `#[cfg(test)]` helpers in `step2_lines.rs` and `step8_collation.rs` are deleted with them; the serde `requirement` field in `defect_ledger.rs` stays.
- Phase 15 or later owns `SSOT-05`, the eleven display-side centavo-to-peso conversions Phase 9 records as out of scope in `SINGLE-SOURCE.md` section 5. The procedure for adding it is section 4 of that document.

- Phase 11 owns registering `node scripts/check-env-ready.mjs` as a blocking gate. Phase 3 builds it but leaves it out of the manifest, because GitHub Actions has no Docker and no Supabase.
- Phase 11 or 12 owns the `logo_url`-holds-a-path defect surfaced by Phase 3 research: `uploadLogo` returns `data.path` (for example `user-1/logo.png`), which is stored in `logo_url` and fed straight to `<img src>`. A path is not a URL. Recorded in `03-RESEARCH.md` section 4.3 so a screenshot gate does not certify a broken image as expected.
- Phase 10 owns any seed growth the journey gates need beyond Phase 3's two-tenant fixture (invitations, deadlines, PDFs). `frontend/supabase/fixtures.json` is designed to be appended to.
- Phase 15 (EXT-05) owns the final `CLAUDE.md` invariants pass. Phase 2 adds only the three loop invariants: commit scope, gate immutability, halt over guess.
- `.planning/LAWYER-AGENDA.md` is referenced by the BLOCKED protocol but is created and populated by Phase 4. Plan 02-02 documents append-and-create-if-absent without creating the file. **Closed by Phase 4 plans 04-01 (creates the file) and 04-05 (rewrites `PLAN-STANDARD.md` section 3 to point at the real structure).**
- Phase 4 plan 04-03 inserts nine comment lines into seven `engine/src/*.rs` files, shifting every line below them by one. Any later phase citing an engine line number should re-measure rather than trust `LEGAL-CONFORMANCE.md`'s 2026-07-27 numbers. The decision anchors themselves are patterns and are unaffected.
- Phase 14 owns filling `answered_by`, `answered_on`, `answer` and `vectors` in `.planning/lawyer-decisions.json`. Phase 4 ships all eight entries `awaiting-answer` with those four fields empty, and gate G10 rejects any other status without them.

### Blockers/Concerns

- Phase 8 leaves the G3 halt exactly where Phase 5 left it. The five `UNKNOWN FAILURE` entries are byte-identical to the set recorded in Phases 5, 6 and 7, and the WASM was rebuilt from the fixed engine before the frontend was measured, so the comparison is against the new engine. One product decision still unblocks it: should `computeWasm` reject a non-distributable input (what OBS-05/OBS-06 require) or return a best-effort distribution (what those five tests assert)?
- LAW-06, LAW-07, LAW-12 (Phase 14) are hard-blocked on lawyer answers to Q6, Q4, Q8 respectively (LAWYER-06, LAWYER-04, LAWYER-08 in Phase 4). The lawyer is currently sitting the bar exam. If no answer has arrived by the time Phase 14 is reached, that phase should report blocked rather than guess — per LOOP-02 (Phase 2).
- GATE-05..07 (Phase 3) must land before COV-06 and any DB-touching journey gate (Phase 11) can run for real reasons rather than environmental ones (missing seed.sql, missing storage bucket migrations).
- A concurrent auto-committer runs on this monorepo (three unrelated `fitness log` commits already landed during unrelated sessions). LOOP-05 (Phase 2, scoped commits, never `git add -A`) exists specifically to prevent this from absorbing staged work.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Test debt | 46 known-failing frontend tests, recorded in `frontend/test-baseline.json`. Burn-down is not scheduled to a phase yet. | Ledgered, gate-enforced (may only shrink) | Phase 1 planning |
| Product bug | `src/routes/settings/__tests__/team.test.tsx` — 12 failures, all `Element type is invalid ... got: undefined`. A genuine undefined import/export in the `/settings/team` route tree, not a test-authoring artifact. The only true product defect among the 46. | Ledgered | Phase 1 planning |
| Test-authoring debt | 21 of the 46 are Radix Select vs. testing-library mismatches (`selectOptions()` against a non-native trigger; `getByText` matching both trigger and listbox) across `EnumSelect`, `PersonPicker`, `InviteMemberDialog`, `HeirReferenceForm`, `DonationsStep`. Fixing them means rewriting queries — must not be done by loosening assertions. | Ledgered | Phase 1 planning |
| Copy/behavior drift | 11 of the 46 are assertion-vs-UI drift in `EstateTaxWizard` (5, tab checkmarks), `ReviewStep` (4, summary strings), `WillStep` (1), `landing-integration` (1). Several need a product decision about intended behavior. | Ledgered | Phase 1 planning |
| Test-vs-impl mismatch | `src/lib/__tests__/supabase.test.ts` — 2 failures; the tests expect a throw on missing env vars but `lib/supabase.ts` uses the `supabaseConfigured` guard. One of the two is wrong; deciding which is a design call. | Ledgered | Phase 1 planning |

## Session Continuity

Last session: 2026-07-31T22:10:00.000Z
Stopped at: Phase 13 PLANNED. `13-RESEARCH.md`, `13-VALIDATION.md` and seven `PLAN.md` files across 4 waves (wave 1 = 13-01 currency formatter and 13-02 poppler seam in parallel; wave 2 = 13-03 capture and 13-04 print layout; wave 3 = 13-05 structure and 13-06 visual; wave 4 = 13-07 gate registration). PDF-01..05 all covered and marked Planned in REQUIREMENTS.md. Verified rather than claimed: `node scripts/check-plan-closed-world.mjs` exits 0 with `PLANS OK — 80 plan file(s), 302 task(s) checked`, and `gsd-sdk query frontmatter.validate --schema plan` reports valid with zero missing keys on each of the seven new plans. Every number in the research was measured live in this tree: `@react-pdf/renderer` rendering a PDF in plain Node, `pdffonts` showing three non-embedded WinAnsi base-14 fonts, `pdftotext` extracting the peso sign as `M-BM-1` (U+00B1), a crop image showing the glyph overprinting the leading digit, the same probe extracting cleanly with `PHP `, `pdftoppm` producing identical `md5sum` twice, `pdfinfo` reporting `595.28 x 841.89 pts (A4)`, and the release engine returning 4 heirs at 150000000 centavos each with `legal_basis` `["Art. 996"]` and 4 narratives containing `₱`. The phase ends at 24 gates. Note for the executor: `gsd-sdk query verify.plan-structure` reports `Task missing <name> element` on all seven, exactly as it does on every one of the 73 pre-existing plans, because this project uses the `<task id="1" name="...">` attribute form throughout; the authoritative check is gate G6, which passes. Next step is `/gsd:execute-phase 13`.
Previously stopped at: Phase 12 EXECUTED. 9/9 plans complete, ci-gates.sh ALL GATES PASSED (20/20) three times. JRNY-06/07/08/11 Complete; JRNY-05 PARTIAL (wizard-will BLOCKED: ?hasWill=1 never constructs the will object so WillStep renders an empty div). G19/G20/G21 registered at order 14/15/16.
Previously stopped at: Phase 8 EXECUTED (8/8 plans, 8 commits: 3583786fa, 6a4361db0, 85319b6b9, 6de15f5cc, 6dde94c9f, 7489bbe90, 780b36a9f, a47d289e5). LAW-05, LAW-08, LAW-09, LAW-10, LAW-11 all Complete. cargo test 543/0 (from 527). Frontend UNKNOWN FAILURE set identical to Phase 5's five, total 2449 tests. Twelve of thirteen gates pass; ci-gates.sh halts at G3 (8/13) on OBS-05/OBS-06. LAWYER-09 recorded awaiting-answer. Next step: /gsd:plan-phase 9.
Previously stopped at: Phase 6 PLANNED. `06-RESEARCH.md`, `06-VALIDATION.md` and five `PLAN.md` files across 4 waves (wave 1 = 06-01 corpus and 06-03 vector tightening in parallel; wave 2 = 06-02 invariant split; waves 3 and 4 serialize on the four gate-infrastructure files). COV-01..05 all covered and marked Planned in REQUIREMENTS.md. Verified rather than claimed: `node scripts/check-plan-closed-world.mjs` exits 0 with `PLANS OK — 32 plan file(s), 117 task(s) checked`, and `gsd-sdk query frontmatter.validate --schema plan` plus `verify.plan-structure` report valid with zero errors on each of the five new plans. Every number in the research was measured live in this tree, including a bisection that reproduced the collateral duplicate-heir defect to the centavo. The phase ends at 13 gates; a full `ci-gates.sh` run will still halt at G3 until Phase 5's product decision is answered. Next step is `/gsd:execute-phase 6`.
Previously stopped at: Phase 5 EXECUTED (7/7 plans, 14 commits) but NOT VERIFIED. OBS-01,02,03,04,07,08,09 complete and gate-proven. OBS-05/OBS-06 BLOCKED: the runtime conservation + duplicate-heir rejection is implemented and correct per the requirement text, but 5 committed frontend tests across integration.test.tsx, bridge.test.ts and wasm-real.test.ts assert the OLD silent-pass behavior for a negative distributable estate and for duplicate person IDs, so gate G3 (frontend known-failure ledger) exits 1 and scripts/ci-gates.sh halts at gate 6 of 11. Nothing was weakened to hide this: no test edited/skipped/deleted, test-baseline.json and gate-skips.lock untouched, no carve-out added to check_output. ONE product decision unblocks it, stated in 05-05-SUMMARY.md: should computeWasm reject a non-distributable input (A, current, what OBS-05/06 require) or return a best-effort distribution (B, what those 5 tests assert)? If A, those 5 tests must be rewritten to assert the rejection. Verified by direct measurement: cargo test 481 passing 0 failed across 6 binaries; 564/564 rows carry a legitime_fraction (was 0); nonzero from_legitime 105, from_free_portion 25, from_intestate 457 (all were 0); 42/140 cases emit a warning (was 0); computation_log.steps is 10 on every corpus case (was 1); 0 sub-component sum mismatches; all ten spec flag detectors have a passing test; G4/G10/G11 each exit 0 run directly; G8/G9 fail only as a cascade of the G3 halt. No point of Philippine law arose; nothing added to LAWYER-AGENDA.md. Next step: answer the OBS-05/06 question, then re-run bash scripts/ci-gates.sh.
Previously stopped at: Phase 4 PLANNED. `04-RESEARCH.md`, `04-VALIDATION.md` and five `PLAN.md` files written across 5 strictly sequential waves (waves 1 and 2 share `.planning/LAWYER-AGENDA.md`; wave 3 mirrors it into `.planning/lawyer-decisions.json` and marks nine code sites plus one spec site; wave 4 gates the pair as G10; waves 4 and 5 share `README.md`). LAWYER-01..10 all covered and marked Planned in REQUIREMENTS.md. Verified rather than claimed: `node scripts/check-plan-closed-world.mjs` exits 0 with `PLANS OK — 20 plan file(s), 83 task(s) checked`, and `gsd-sdk query frontmatter.validate --schema plan` plus `verify.plan-structure` report valid with zero errors on each of the five new plans. Planning measurements taken live in this tree: all ten decision-to-code anchor patterns match their file exactly once under `grep -Fc` (two shorter candidates were rejected for matching twice), `.planning/LAWYER-AGENDA.md` does not yet exist while `PLAN-STANDARD.md:180-183` already routes legal questions to it, the Q7 spec hedge sits at exactly `specs/estate-tax-engine-spec.md:1008`, and gate G9 fails with `RESULTS INCOMPLETE` on any gate ordered after it — so G10 takes order 8 and G9 moves to order 10. The phase ends at 10 gates. Next step is `/gsd:execute-phase 4`.
Previously stopped at: Phase 3 PLANNED. `03-RESEARCH.md`, `03-VALIDATION.md` and five `PLAN.md` files written across 5 strictly sequential waves (waves 2 and 3 share one database; waves 4 and 5 share `scripts/ci-gates.sh`, `gates.manifest.json`, `gates.manifest.lock` and `GATES.md`). GATE-05..09 all covered and marked Planned in REQUIREMENTS.md. Verified rather than claimed: `node scripts/check-plan-closed-world.mjs` passes on all 15 plan files across 68 tasks, and `bash scripts/ci-gates.sh` exits 0 with `ALL GATES PASSED (7/7)`. The phase ends at 9 gates. Planning measurements taken live in this tree: Supabase CLI absent but v2.110.0 downloadable, Docker reachable, ports 54321–54324 bound by a sibling app, 55320–55329 free, one storage bucket referenced in code and zero created by migration, `seed.sql` absent while `[db.seed]` already points at it, and a skip baseline of exactly one declared skip (`skipLibCheck`) with zero undeclared. Next step is `/gsd:execute-phase 3`.
Previously stopped at: Phase 2 PLANNED. `02-RESEARCH.md`, `02-VALIDATION.md` and six `PLAN.md` files written across 4 waves (wave 1 = 02-01/02-02/02-03 in parallel with disjoint file sets; waves 2, 3, 4 strictly sequential, each editing `scripts/ci-gates.sh` in turn). LOOP-01..06 all covered and marked Planned in REQUIREMENTS.md. The closed-world lint specified in 02-02 was implemented as a throwaway pre-check and run against all ten existing plan files — Phase 1's four unmodified plus Phase 2's six — and passed with zero violations, so plan 02-02's central feasibility claim is measured rather than assumed. Next step is `/gsd:execute-phase 2`.
Previously stopped at: Phase 1 EXECUTED AND VERIFIED. Four commits: a89d58b6 (WASM build command), 181ae68c (jsdom polyfills, 342 to 46 failures), c79e8714 (known-failure ledger gate), 0edf861b (CI workflow + runner + README). `bash apps/inheritance/scripts/ci-gates.sh` exits 0 with ALL GATES PASSED (4/4) from a WASM-less starting state. GATE-01..04 all Complete. Caveat: the GitHub workflow has never actually executed — 24 commits including this phase's four are unpushed, so criterion 4 is verified structurally (parsed YAML triggers) and behaviorally (the runner it invokes was observed exiting 1 on an injected regression), not by a real CI run. Next step is `/gsd:plan-phase 2`.
Previously stopped at: Phase 1 planned — 01-RESEARCH.md, 01-VALIDATION.md, and 4 PLAN.md files written across 4 sequential waves. GATE-01..04 all covered and marked Planned in REQUIREMENTS.md. Baseline was measured, not assumed: engine 442/442 green, `tsc -b --force` clean, WASM builds, frontend 342/2416 failing of which 296 are a jsdom polyfill gap. Next step is `/gsd:execute-phase 1`.
Resume file: None
