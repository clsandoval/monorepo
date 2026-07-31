---
status: passed
phase: 03-reproducible-environment-gate-reporting
verified: 2026-07-31
requirements: [GATE-05, GATE-06, GATE-07, GATE-08, GATE-09]
plans_complete: 5
plans_total: 5
---

# Phase 3 Verification — Reproducible Environment & Gate Reporting

Every claim below was verified by executing the named command in this working tree and reading its
real output. Nothing here is taken from a plan's or a summary's assertion. The DB-dependent claims
were additionally checked by querying the running Postgres directly through
`docker exec supabase_db_inheritance psql`, rather than by trusting the checking script that also
ships in this phase.

## Requirement traceability

| Req | Where implemented | Enforcing gate | Verified by |
|---|---|---|---|
| GATE-05 | `scripts/setup-env.sh`, `scripts/check-env-ready.mjs`, `README.md` §Clean checkout to a working environment | not registered (needs Docker; Phase 11 owns registration) | `node scripts/check-env-ready.mjs` → `ENV READY — api 55321, db 55322, container supabase_db_inheritance`, exit 0 |
| GATE-06 | `frontend/supabase/seed.sql`, `frontend/supabase/fixtures.json`, `scripts/check-seed-fixture.mjs` | not registered (needs a live DB) | `node scripts/check-seed-fixture.mjs` → `SEED OK — 2 orgs, 10 ids matched` + `INPUT COPIED FROM engine/examples/cases/02-married-3lc.json`, exit 0; live DB confirms both orgs and both cases |
| GATE-07 | `frontend/supabase/migrations/013_storage_buckets.sql`, `scripts/check-storage-buckets.mjs` | not registered (needs a live DB) | `node scripts/check-storage-buckets.mjs` → `BUCKETS OK — 1 referenced, 1 migrated`, exit 0; live DB confirms the bucket and its four policies |
| GATE-08 | `scripts/publish-gate-results.mjs`, `scripts/check-gate-results.mjs`, committed `gate-results.json` | **G9** (blocking) | `node scripts/check-gate-results.mjs` → `RESULTS OK — 9 gates, 8 requirements`, exit 0; six verdicts each observed exiting 1 |
| GATE-09 | `scripts/check-gate-skips.mjs`, `gate-skips.lock`, `GATE-SKIPS` lines in five owned scripts, per-gate logs in `scripts/ci-gates.sh` | **G8** (blocking) | `node scripts/check-gate-skips.mjs` → `SKIPS OK — 9 gates accounted, 1 declared skip, 0 undeclared`, exit 0; five verdicts each observed exiting 1 |

All five requirement ids are accounted for. Two are now enforced by newly registered blocking gates;
three are satisfied by artifacts whose checks exist and pass but are deliberately not in the manifest
— see "Honest caveats" below.

## Roadmap success criteria

**1. One documented sequence from a clean checkout yields a working local environment.**
`README.md` now opens with `## Clean checkout to a working environment`, naming
`bash scripts/setup-env.sh` as the single command and enumerating its nine steps. Every factual
claim in that section was checked against the file it describes before this verification passed:
the nine step headers exist in `scripts/setup-env.sh`; the port table matches
`frontend/supabase/config.toml` exactly (api 55321, db 55322, shadow 55320, pooler 55329, studio
55323, inbucket 55324, analytics 55327); `frontend/supabase/migrations/013_storage_buckets.sql`
exists; `frontend/supabase/fixtures.json` publishes `"password": "test-password-123"`;
`scripts/check-env-ready.mjs` contains both `ENV READY` and `ENV NOT READY`. The verdict command
runs clean: `node scripts/check-env-ready.mjs` → exit 0, `ENV READY`.

**2. `supabase/seed.sql` produces a known org, user and case fixture referenceable by id.**
`node scripts/check-seed-fixture.mjs` → exit 0. Confirmed independently against the live database:

```
$ docker exec supabase_db_inheritance psql -U postgres -d postgres -t \
    -c "select id, name from public.organizations order by id;"
 a0000000-0000-4000-8000-000000000001 | Test Firm Alpha
 b0000000-0000-4000-8000-000000000001 | Test Firm Beta

$ ... -c "select id, org_id from public.cases order by id;"
 a0000000-0000-4000-8000-000000000004 | a0000000-0000-4000-8000-000000000001
 b0000000-0000-4000-8000-000000000004 | b0000000-0000-4000-8000-000000000001
```

Both ids match `frontend/supabase/fixtures.json` literally. The second tenant exists so Phase 11 has
an org to prove exclusion from. The seeded `input_json` is gate-verified as a byte-for-byte copy of
`engine/examples/cases/02-married-3lc.json` — `INPUT COPIED FROM …` is printed by the check — which
is what keeps a legal judgment out of the fixture entirely.

**3. `firm-logos` and every other runtime-required bucket are created by migration.**
`node scripts/check-storage-buckets.mjs` → exit 0, `BUCKETS OK — 1 referenced, 1 migrated`, meaning
the set of buckets referenced anywhere in frontend code equals the set created by migration.
Confirmed independently:

```
$ ... -c "select id, public from storage.buckets;"
 firm-logos | t

$ ... -c "select policyname from pg_policies where schemaname='storage' and tablename='objects';"
 firm_logos_owner_delete
 firm_logos_owner_insert
 firm_logos_owner_update
 firm_logos_public_read
```

The bucket is present in a database whose current state came from applying migrations plus
`seed.sql`, so it survives a reseed by construction — it is migration state, not hand-made state.

**4. A gate run emits a machine-readable results file a status page could consume.**
`gate-results.json` is committed at the app root, schema 1, nine gates, eight requirements. Verified
present on all three exit paths, not just the green one:

| Injection | Runner exit | `run.outcome` | `failure_signature` | Gate statuses |
|---|---|---|---|---|
| none | 0 | `pass` | `""` | all `pass` |
| `GATES_INJECT_GATE_FAIL=G1` | 1 | `fail` | `"G1:3"` | `G5 G6 G7` pass, `G1` fail, rest `not-run` |
| `GATES_INJECT_MISSING_TOOL=cargo` | 2 | `cannot-run` | `"PREFLIGHT:cargo"` | every gate `not-run` |

A failing publisher cannot change the runner's exit code: with
`scripts/publish-gate-results.mjs` moved off disk, a green `--only G5` still exited 0 and an
injected failure still exited 1, both printing `WARNING: could not publish gate-results.json`.

**5. Every gate's output distinguishes skipped from passed.**
`node scripts/check-gate-skips.mjs` → exit 0, `SKIPS OK — 9 gates accounted, 1 declared skip, 0
undeclared`. Five gates emit `GATE-SKIPS total=<n> skipped=<n>` on every exit path (G2 `total=3`,
G3 `total=2416`, G5 `total=9`, G6 `total=15`, G7 `total=59`); G1 is derived from cargo's own
`N ignored` / `N filtered out` fields; G4 is derived statically from `frontend/tsconfig.json` plus a
suppression scan of `frontend/src`; G8 and G9 account for themselves. The single declared skip is
`G4 / tsconfig.skipLibCheck`, and `STALE SKIP DECLARATION` forces it out of the ledger the day it
stops being true.

## Failure paths observed firing

A gate nobody has seen fail is not known to be a gate. Every marker below was produced by running
the command and reading the output in this session.

| Command | Exit | Marker |
|---|---|---|
| `check-gate-skips.mjs --logs scripts/fixtures/logs-ignored` | 1 | `UNDECLARED SKIP` (G1) + `SKIP COUNT MISMATCH` (G5) |
| `check-gate-skips.mjs --logs scripts/fixtures/logs-stale` | 1 | `SKIP REPORT MISSING` (stamp mismatch, G1) |
| `check-gate-skips.mjs --lock scripts/fixtures/skips-stale.lock` | 1 | `STALE SKIP DECLARATION` (`engine.ignored.example`) |
| `check-gate-skips.mjs --logs /tmp/empty-logs-dir` | 1 | `SKIP REPORT MISSING` × 8 |
| `check-gate-skips.mjs --lock /tmp/definitely-not-a-file.lock` | 1 | `SKIP SCAN UNREADABLE` |
| `check-gate-results.mjs --results scripts/fixtures/results-stale.json` | 1 | `RESULTS STALE` |
| `check-gate-results.mjs --results scripts/fixtures/results-incomplete.json` | 1 | `RESULTS INCOMPLETE` + `RESULTS REQUIREMENT DRIFT` |
| `check-gate-results.mjs --results /tmp/definitely-not-a-file.json` | 1 | `RESULTS MISSING` |
| `check-gate-results.mjs --results /tmp/bad-results.json` | 1 | `RESULTS UNREADABLE` |
| `check-gate-results.mjs --results /tmp/bad-status.json` | 1 | `RESULTS STATUS INVALID` rejecting `"skipped"` |

## Gate immutability

`node scripts/check-gate-manifest.mjs` → exit 0, `MANIFEST OK — 9 gates, 9 locked`. The gate set
grew from 7 to 9. `git diff` on `gates.manifest.lock` for both commits shows **additions only** —
no `command` line was modified, no gate removed, no `blocking` value changed.

## Whole-suite state

```
GATE COVERAGE 9/9
REQUIREMENT COVERAGE 8/94 gated
COVERAGE OK
ALL GATES PASSED (9/9)
LOOP STATUS GREEN
EXIT=0
```

No test, assertion, tolerance or gate was weakened anywhere in this phase.
`grep -c "SKIPPED TESTS" frontend/scripts/check-test-baseline.mjs` returns 3, identical to its value
at `HEAD` before the phase, proving the known-failure gate is no less strict than it was.
`frontend/test-baseline.json` was not modified; the ledger still holds 46 known failures out of
2,416 collected tests.

## Honest caveats

1. **`setup-env.sh` was not re-run from a genuinely clean checkout during this verification.** The
   environment was already up when verification began. What was verified is that the documented
   sequence's every factual claim matches the files it describes, and that the read-only verdict
   `node scripts/check-env-ready.mjs` reports `ENV READY` against the live stack. Plan 03-01's
   summary records the end-to-end run; this session confirms the resulting state, not the act.
2. **GATE-05, GATE-06 and GATE-07 are not enforced by manifest-registered gates.** Their checks
   exist, are dependency-free, and pass — but all three need Docker and a running Supabase stack,
   which GitHub Actions has neither of. Registering them is Phase 11's, per the STATE.md pending
   todo. Until then those three requirements are satisfied by an artifact plus a passing manual
   check, not by CI.
3. **`gate-results.json` churns on every gate run.** It is committed by design (the same tradeoff
   already made for `LOOP-STATUS.md` and `loop-history.jsonl`), so it will show as modified
   immediately after any run. Every commit in this phase staged explicit paths through
   `scripts/safe-commit.sh`.
4. **CI has still never actually executed.** The Phase 1 caveat stands: the workflow is verified
   structurally and behaviourally, but the commits remain unpushed, so `ALL GATES PASSED (9/9)` is
   observed locally rather than on GitHub.

No point of Philippine law arose in this phase. Nothing was added to the lawyer review agenda.
