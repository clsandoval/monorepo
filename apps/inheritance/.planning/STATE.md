---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: ready_to_execute
stopped_at: "Phase 3 PLANNED. `03-RESEARCH.md`, `03-VALIDATION.md` and five `PLAN.md` files written across 5 strictly sequential waves. GATE-05..09 all covered and marked Planned in REQUIREMENTS.md. All 15 plan files pass `node scripts/check-plan-closed-world.mjs` (68 tasks checked) and `bash scripts/ci-gates.sh` exits 0 with ALL GATES PASSED (7/7). Next step is `/gsd:execute-phase 3`."
last_updated: "2026-07-31T06:48:00.886Z"
last_activity: 2026-07-31 -- Phase 3 planning complete
progress:
  total_phases: 15
  completed_phases: 2
  total_plans: 15
  completed_plans: 10
  percent: 13
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-27)

**Core value:** A change to this codebase must be cheap and safe to make — a passing gate set genuinely implies a working app, and a wrong legal number can never reach a lawyer silently.
**Current focus:** Phase 3 — reproducible environment & gate reporting

## Current Position

Phase: 3
Plan: Not started
Status: Ready to execute
Last activity: 2026-07-31 -- Phase 3 planning complete

Progress: [█░░░░░░░░░] 7%

## Performance Metrics

**Velocity:**

- Total plans completed: 10
- Average duration: ~5 min
- Total execution time: ~0.35 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Gate Foundations | 4 | ~21 min | ~5 min |
| 02 | 6 | - | - |

**Recent Trend:**

- Last 5 plans: 01-01, 01-02, 01-03, 01-04 (all complete, no blocks)
- Trend: steady — each wave's gate depended on the previous wave's artifact and all landed first-pass

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

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

### Pending Todos

- Phase 11 owns registering `node scripts/check-env-ready.mjs` as a blocking gate. Phase 3 builds it but leaves it out of the manifest, because GitHub Actions has no Docker and no Supabase.
- Phase 11 or 12 owns the `logo_url`-holds-a-path defect surfaced by Phase 3 research: `uploadLogo` returns `data.path` (for example `user-1/logo.png`), which is stored in `logo_url` and fed straight to `<img src>`. A path is not a URL. Recorded in `03-RESEARCH.md` section 4.3 so a screenshot gate does not certify a broken image as expected.
- Phase 10 owns any seed growth the journey gates need beyond Phase 3's two-tenant fixture (invitations, deadlines, PDFs). `frontend/supabase/fixtures.json` is designed to be appended to.
- Phase 15 (EXT-05) owns the final `CLAUDE.md` invariants pass. Phase 2 adds only the three loop invariants: commit scope, gate immutability, halt over guess.
- `.planning/LAWYER-AGENDA.md` is referenced by the BLOCKED protocol but is created and populated by Phase 4. Plan 02-02 documents append-and-create-if-absent without creating the file.

### Blockers/Concerns

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

Last session: 2026-07-31
Stopped at: Phase 3 PLANNED. `03-RESEARCH.md`, `03-VALIDATION.md` and five `PLAN.md` files written across 5 strictly sequential waves (waves 2 and 3 share one database; waves 4 and 5 share `scripts/ci-gates.sh`, `gates.manifest.json`, `gates.manifest.lock` and `GATES.md`). GATE-05..09 all covered and marked Planned in REQUIREMENTS.md. Verified rather than claimed: `node scripts/check-plan-closed-world.mjs` passes on all 15 plan files across 68 tasks, and `bash scripts/ci-gates.sh` exits 0 with `ALL GATES PASSED (7/7)`. The phase ends at 9 gates. Planning measurements taken live in this tree: Supabase CLI absent but v2.110.0 downloadable, Docker reachable, ports 54321–54324 bound by a sibling app, 55320–55329 free, one storage bucket referenced in code and zero created by migration, `seed.sql` absent while `[db.seed]` already points at it, and a skip baseline of exactly one declared skip (`skipLibCheck`) with zero undeclared. Next step is `/gsd:execute-phase 3`.
Previously stopped at: Phase 2 PLANNED. `02-RESEARCH.md`, `02-VALIDATION.md` and six `PLAN.md` files written across 4 waves (wave 1 = 02-01/02-02/02-03 in parallel with disjoint file sets; waves 2, 3, 4 strictly sequential, each editing `scripts/ci-gates.sh` in turn). LOOP-01..06 all covered and marked Planned in REQUIREMENTS.md. The closed-world lint specified in 02-02 was implemented as a throwaway pre-check and run against all ten existing plan files — Phase 1's four unmodified plus Phase 2's six — and passed with zero violations, so plan 02-02's central feasibility claim is measured rather than assumed. Next step is `/gsd:execute-phase 2`.
Previously stopped at: Phase 1 EXECUTED AND VERIFIED. Four commits: a89d58b6 (WASM build command), 181ae68c (jsdom polyfills, 342 to 46 failures), c79e8714 (known-failure ledger gate), 0edf861b (CI workflow + runner + README). `bash apps/inheritance/scripts/ci-gates.sh` exits 0 with ALL GATES PASSED (4/4) from a WASM-less starting state. GATE-01..04 all Complete. Caveat: the GitHub workflow has never actually executed — 24 commits including this phase's four are unpushed, so criterion 4 is verified structurally (parsed YAML triggers) and behaviorally (the runner it invokes was observed exiting 1 on an injected regression), not by a real CI run. Next step is `/gsd:plan-phase 2`.
Previously stopped at: Phase 1 planned — 01-RESEARCH.md, 01-VALIDATION.md, and 4 PLAN.md files written across 4 sequential waves. GATE-01..04 all covered and marked Planned in REQUIREMENTS.md. Baseline was measured, not assumed: engine 442/442 green, `tsc -b --force` clean, WASM builds, frontend 342/2416 failing of which 296 are a jsdom polyfill gap. Next step is `/gsd:execute-phase 1`.
Resume file: None
