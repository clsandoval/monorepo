---
phase: 3
slug: reproducible-environment-gate-reporting
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None at `apps/inheritance/` root — direct command execution plus committed fixtures (carried forward unchanged from Phases 1 and 2) |
| **Config file** | none — every check is a standalone Node ESM or Bash script |
| **Quick run command** | `cd apps/inheritance && node scripts/check-storage-buckets.mjs && node scripts/check-seed-fixture.mjs && node scripts/check-gate-skips.mjs && node scripts/check-gate-results.mjs` |
| **Database command** | `cd apps/inheritance/frontend && supabase db reset` |
| **Full suite command** | `bash apps/inheritance/scripts/ci-gates.sh` |
| **Estimated runtime** | quick ~4 s · database reset ~40 s · full ~300 s |

Two verification surfaces exist in this phase rather than one, and the split is deliberate.
Static checks read only files in the repo and therefore run in GitHub Actions. Live checks
query a running Supabase through `docker exec supabase_db_inheritance psql` and therefore run
only on a developer machine. Every requirement in this phase has at least one static check, so
none of them is verifiable only where CI cannot reach.

---

## Sampling Rate

- **After every task:** run that task's `<verify>` block and read the printed exit code.
- **After every plan:** run the plan's full `<verification>` checklist, including every
  fixture-driven failure path.
- **After every wave:** run `bash apps/inheritance/scripts/ci-gates.sh` and confirm the exit
  code expected at that point in the phase.
- **After every task that edits `scripts/ci-gates.sh`:** run the full runner immediately, not
  at plan end. A runner that stops running gates correctly invalidates every other
  measurement in this project, so it is sampled at the highest rate of any artifact here.
- **Before phase sign-off:** the full runner exits 0 with `ALL GATES PASSED (9/9)`.
- **Max feedback latency:** 4 seconds for the static checks, 40 seconds for a database reset,
  300 seconds for the full runner.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | GATE-05 | T-3-01a | Ports moved off the block a sibling stack occupies | source | `grep -c 5532 frontend/supabase/config.toml` | ❌ W1 | ⬜ pending |
| 03-01-02 | 01 | 1 | GATE-05 | T-3-01b | Env template points at this app's API port | source | `grep -c "127.0.0.1:55321" frontend/.env.local.example` | ❌ W1 | ⬜ pending |
| 03-01-03 | 01 | 1 | GATE-05 | T-3-01c | One command installs the pinned CLI and starts the stack | behavior | `bash scripts/setup-env.sh` exits 0 | ❌ W1 | ⬜ pending |
| 03-01-04 | 01 | 1 | GATE-05 | T-3-01d | The verdict script observes and never repairs | source | `grep -cE "\-\-fix\|--install\|--start\|writeFileSync" scripts/check-env-ready.mjs` returns 0 | ❌ W1 | ⬜ pending |
| 03-01-05 | 01 | 1 | GATE-05 | T-3-01d | Every not-ready path exits 1 with a named reason | fixture | `node scripts/check-env-ready.mjs --api-port 1` exits 1 with `ENV NOT READY` | ❌ W1 | ⬜ pending |
| 03-02-01 | 02 | 2 | GATE-07 | T-3-02a | The bucket exists because a migration made it | behavior | `docker exec supabase_db_inheritance psql -U postgres -tAc "select id,public from storage.buckets"` | ❌ W2 | ⬜ pending |
| 03-02-02 | 02 | 2 | GATE-07 | T-3-02b | Write access is confined to the uploader's own folder | source | `grep -c "storage.foldername" frontend/supabase/migrations/013_storage_buckets.sql` | ❌ W2 | ⬜ pending |
| 03-02-03 | 02 | 2 | GATE-07 | T-3-02c | A referenced-but-unmigrated bucket fails the check | fixture | `node scripts/check-storage-buckets.mjs --src scripts/fixtures/buckets-unmigrated/src` exits 1 with `UNMIGRATED BUCKET` | ❌ W2 | ⬜ pending |
| 03-02-04 | 02 | 2 | GATE-07 | T-3-02d | A migrated-but-unreferenced bucket fails the check | fixture | `node scripts/check-storage-buckets.mjs --migrations scripts/fixtures/buckets-orphan/migrations` exits 1 with `ORPHAN BUCKET` | ❌ W2 | ⬜ pending |
| 03-02-05 | 02 | 2 | GATE-07 | T-3-02a | The bucket survives a reset rather than being hand-made once | behavior | `supabase db reset` then re-run 03-02-01 | ❌ W2 | ⬜ pending |
| 03-03-01 | 03 | 3 | GATE-06 | T-3-03a | Two orgs, two users, two clients, two cases seeded | behavior | `docker exec supabase_db_inheritance psql -U postgres -tAc "select count(*) from organizations"` returns 2 | ❌ W3 | ⬜ pending |
| 03-03-02 | 03 | 3 | GATE-06 | T-3-03b | Seeded users can actually sign in | behavior | `curl` the `/auth/v1/token?grant_type=password` endpoint on port 55321 and read a 200 | ❌ W3 | ⬜ pending |
| 03-03-03 | 03 | 3 | GATE-06 | T-3-03c | The id registry and the SQL cannot disagree | fixture | `node scripts/check-seed-fixture.mjs --seed scripts/fixtures/seed-drift.sql` exits 1 with `FIXTURE DRIFT` | ❌ W3 | ⬜ pending |
| 03-03-04 | 03 | 3 | GATE-06 | T-3-03d | The seeded case input is a copied fixture, not an authored one | behavior | `node scripts/check-seed-fixture.mjs` prints `INPUT COPIED FROM engine/examples/cases/02-married-3lc.json` | ❌ W3 | ⬜ pending |
| 03-03-05 | 03 | 3 | GATE-06 | T-3-03a | Re-running the reset is idempotent | behavior | `supabase db reset` twice, then re-run 03-03-01 | ❌ W3 | ⬜ pending |
| 03-04-01 | 04 | 4 | GATE-09 | T-3-04a | Gate output is captured without changing a locked command | source | `node scripts/check-gate-manifest.mjs` exits 0 with `MANIFEST OK` | ❌ W4 | ⬜ pending |
| 03-04-02 | 04 | 4 | GATE-09 | T-3-04b | Every gate reports an assertion count and a skip count | behavior | `bash scripts/ci-gates.sh` then `node scripts/check-gate-skips.mjs` prints `SKIPS OK` | ❌ W4 | ⬜ pending |
| 03-04-03 | 04 | 4 | GATE-09 | T-3-04c | An undeclared skip turns the gate red | fixture | `node scripts/check-gate-skips.mjs --logs scripts/fixtures/logs-ignored/` exits 1 with `UNDECLARED SKIP` | ❌ W4 | ⬜ pending |
| 03-04-04 | 04 | 4 | GATE-09 | T-3-04d | A declared skip that disappeared forces the ledger down | fixture | `node scripts/check-gate-skips.mjs --lock scripts/fixtures/skips-stale.lock` exits 1 with `STALE SKIP DECLARATION` | ❌ W4 | ⬜ pending |
| 03-04-05 | 04 | 4 | GATE-09 | T-3-04e | A missing report is a failure, never a silent zero | fixture | `node scripts/check-gate-skips.mjs --logs /tmp/empty-logs-dir` exits 1 with `SKIP REPORT MISSING` | ❌ W4 | ⬜ pending |
| 03-04-06 | 04 | 4 | GATE-09 | T-3-04e | A stale log cannot be read as the current run | fixture | `node scripts/check-gate-skips.mjs --logs scripts/fixtures/logs-stale/` exits 1 with `SKIP REPORT MISSING` | ❌ W4 | ⬜ pending |
| 03-05-01 | 05 | 5 | GATE-08 | T-3-05a | Published results carry name, proves and requirements | behavior | `node -e` assertion over `gate-results.json` keys | ❌ W5 | ⬜ pending |
| 03-05-02 | 05 | 5 | GATE-08 | T-3-05b | Results are published on the failure path too | behavior | `GATES_INJECT_GATE_FAIL=G1 bash scripts/ci-gates.sh` then `test -f gate-results.json` | ❌ W5 | ⬜ pending |
| 03-05-03 | 05 | 5 | GATE-08 | T-3-05b | Results are published on the halt path too | behavior | `GATES_INJECT_MISSING_TOOL=cargo bash scripts/ci-gates.sh` then read `run.outcome` | ❌ W5 | ⬜ pending |
| 03-05-04 | 05 | 5 | GATE-08, GATE-09 | T-3-05c | Skipped is never collapsed into passed | source | `grep -c "not-run" scripts/publish-gate-results.mjs` | ❌ W5 | ⬜ pending |
| 03-05-05 | 05 | 5 | GATE-08 | T-3-05d | A stale results file turns the gate red | fixture | `node scripts/check-gate-results.mjs --results scripts/fixtures/results-stale.json` exits 1 with `RESULTS STALE` | ❌ W5 | ⬜ pending |
| 03-05-06 | 05 | 5 | GATE-08 | T-3-05d | A results file missing a manifest gate turns the gate red | fixture | `node scripts/check-gate-results.mjs --results scripts/fixtures/results-incomplete.json` exits 1 with `RESULTS INCOMPLETE` | ❌ W5 | ⬜ pending |
| 03-05-07 | 05 | 5 | GATE-05 | T-3-05e | The bring-up sequence is documented end to end | source | `grep -c "setup-env.sh" README.md` | ❌ W5 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*
*"File Exists ❌ W\<n\>" means the artifact is created by that wave; there is no separate Wave 0.*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No framework install, no shared fixture
module, and no dependency is added to `apps/inheritance/`. The two external tools this phase
relies on are Docker, already present and measured reachable, and the Supabase CLI, installed
at a pinned version by `scripts/setup-env.sh` in wave 1 — which is itself the artifact GATE-05
asks for, not a prerequisite to building it.

---

## Manual-Only Verifications

Two, both stated so they are not mistaken for automated coverage.

1. **A truly clean checkout has not been exercised.** GATE-05's sequence is verified on this
   machine, where `node_modules`, a Rust toolchain, and `wasm-pack` already exist. The plans
   verify the sequence by running it, and `check-env-ready.mjs` asserts each precondition
   independently, but "clone into an empty directory and run it" is not performed by any plan
   here. No plan may claim a clean-checkout run it has not observed.
2. **The GitHub workflow has still never executed.** This caveat is carried forward from
   Phase 1 unchanged: the repository has unpushed commits, so every claim about CI behavior is
   verified by running locally the exact script CI runs
   (`bash apps/inheritance/scripts/ci-gates.sh`), plus structural inspection of the workflow
   YAML. Both gates added in this phase, G8 and G9, are static and need no database, so
   nothing added here makes CI less runnable — but nothing here observes CI running either.

---

## Validation Sign-Off

- [ ] All tasks have an automated `<verify>` command
- [ ] Sampling continuity: no 3 consecutive tasks without an automated verify
- [ ] Every violation marker in every checker has a committed fixture proving it fires
- [ ] Every requirement has at least one check that runs without a database
- [ ] No watch-mode flags anywhere
- [ ] Feedback latency < 4 s for static checks, < 300 s for the full runner
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
