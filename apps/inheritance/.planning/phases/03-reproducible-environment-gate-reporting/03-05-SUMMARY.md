---
phase: 03-reproducible-environment-gate-reporting
plan: 05
completed: 2026-07-31
commit: 4a4bf37c9837b3177e008edb114d3eacbb2dd916
requirements: [GATE-05, GATE-08]
---

# 03-05 Summary — published gate results and the one bring-up sequence

`gate-results.json` is now a committed artifact at the app root, republished after every gate and
from the runner's EXIT trap, and validated by new blocking gate **G9**. `README.md` documents the
whole clean-checkout-to-working-environment sequence in one section. The gate set ends this phase
at **nine**.

## The published shape

```
$ node -e "...read gate-results.json..."
toplevel schema,generated_at,run,gates,requirements
schema 1 gates 9 outcome pass
gatekeys id,name,order,blocking,proves,requirements,status,exit_code,started_at,ended_at,duration_seconds,assertions_total,assertions_skipped  n=13
1 G5 pass total=9 skipped=0 ["LOOP-03"]
2 G6 pass total=15 skipped=0 ["LOOP-01"]
3 G7 pass total=59 skipped=0 ["LOOP-05"]
4 G1 pass total=null skipped=null []
5 G2 pass total=3 skipped=0 ["GATE-03"]
6 G3 pass total=2416 skipped=0 ["GATE-01"]
7 G4 pass total=null skipped=null ["GATE-02"]
8 G8 pass total=9 skipped=0 ["GATE-09"]
9 G9 pass total=9 skipped=0 ["GATE-08"]
REQ LOOP-03:pass LOOP-01:pass LOOP-05:pass GATE-03:pass GATE-01:pass GATE-02:pass GATE-09:pass GATE-08:pass
```

`assertions_total` / `assertions_skipped` are `null` for exactly G1 and G4 — the two gates that emit
no `GATE-SKIPS` line because `cargo test` and `tsc` are external tools with frozen command strings.
Their skip accounting lives in gate G8 by derivation, per plan 03-04; the published file records the
absence honestly rather than inventing a zero.

## All three exit paths observed publishing

| Injection | Runner exit | `run.outcome` | `failure_signature` | Gate statuses |
|---|---|---|---|---|
| none | 0 | `pass` | `""` | all `pass` |
| `GATES_INJECT_GATE_FAIL=G1` | 1 | `fail` | `"G1:3"` | `G5 G6 G7` pass, `G1` fail, `G2 G3 G4 G8` **not-run** |
| `GATES_INJECT_MISSING_TOOL=cargo` | 2 | `cannot-run` | `"PREFLIGHT:cargo"` | every gate **not-run** |

The requirement roll-up followed correctly: on the injected gate failure `GATE-01`, `GATE-02`,
`GATE-03` and `GATE-09` all became `incomplete`, never `pass`.

**The publisher cannot change the runner's exit code.** Observed directly by moving
`scripts/publish-gate-results.mjs` off disk and re-running: a green `--only G5` still exited **0**,
and `GATES_INJECT_GATE_FAIL=G5 --only G5` still exited **1**; both printed
`WARNING: could not publish gate-results.json` on stderr and nothing else changed.

## All six validator verdicts observed firing

| Command | Exit | Marker |
|---|---|---|
| `--results scripts/fixtures/results-stale.json` | 1 | `RESULTS STALE: published run.started_at is "2020-01-01T00:00:00Z" but the run record says …` |
| `--results scripts/fixtures/results-incomplete.json` | 1 | `RESULTS INCOMPLETE: manifest gate G3 has no entry …` **and** `RESULTS REQUIREMENT DRIFT: GATE-01 is carried by a manifest gate but has no entry in the published requirements roll-up` |
| `--results /tmp/definitely-not-a-file.json` | 1 | `RESULTS MISSING` |
| `--results /tmp/bad-results.json` (bytes `{ x`) | 1 | `RESULTS UNREADABLE: … is not valid JSON` |
| `--results /tmp/bad-status.json` (`gates[0].status = "skipped"`) | 1 | `RESULTS STATUS INVALID: gate G5 carries status "skipped", which is not one of pass, fail, cannot-run, not-run` |
| no flags | 0 | `RESULTS OK — 9 gates, 8 requirements` |

The rejection of `skipped` is the load-bearing one. It is the plausible-looking status this project
does not use, and accepting it in the published file would be the exact collapse of "skipped" into
"passed" that GATE-09 exists to prevent.

Both fixtures are generated from the real `gate-results.json` rather than hand-typed, so they cannot
drift from its schema.

## Manifest growth — addition only

```
$ git diff HEAD~1 -- gates.manifest.lock
@@ -41,6 +41,11 @@
       "id": "G8",
       "command": "node scripts/check-gate-skips.mjs",
       "blocking": true
+    },
+    {
+      "id": "G9",
+      "command": "node scripts/check-gate-results.mjs",
+      "blocking": true
     }
```

`node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 9 gates, 9 locked` (exit 0). None of the
eight pre-existing command strings changed.

## Final runner state

```
GATE COVERAGE 9/9
REQUIREMENT COVERAGE 8/94 gated
COVERAGE OK
ALL GATES PASSED (9/9)
LOOP STATUS GREEN — recorded pass (29/200 records)
EXIT=0
```

## Requirement ids now gated — the figure Phase 5 onward reports against

Eight of 94, across nine gates:

| Requirement | Gate |
|---|---|
| GATE-01 | G3 |
| GATE-02 | G4 |
| GATE-03 | G2 |
| GATE-08 | G9 |
| GATE-09 | G8 |
| LOOP-01 | G6 |
| LOOP-03 | G5 |
| LOOP-05 | G7 |

G1 (engine tests) carries no requirement id, which is why nine gates cover eight requirements.
GATE-05, GATE-06 and GATE-07 are satisfied by artifacts (`scripts/setup-env.sh`, `supabase/seed.sql`
plus `fixtures.json`, `013_storage_buckets.sql`) rather than by a gate registered in the manifest —
`node scripts/check-env-ready.mjs`, `node scripts/check-seed-fixture.mjs` and
`node scripts/check-storage-buckets.mjs` all need Docker and a running Supabase stack, which GitHub
Actions has neither of. Registering them is Phase 11's, per the STATE.md pending todo.

## README

`## Clean checkout to green gates` was replaced by `## Clean checkout to a working environment`,
covering: the single `bash scripts/setup-env.sh` command; its nine steps; Docker as the one
prerequisite the script deliberately does not install; the full 55320–55329 port table with the
reason this app avoids 54321–54324; `supabase db reset` applying migrations then `seed.sql`; the two
seeded orgs with ids published in `frontend/supabase/fixtures.json` and the shared password
`test-password-123`; `013_storage_buckets.sql` creating the `firm-logos` bucket so none is made by
hand; and `node scripts/check-env-ready.mjs` printing `ENV READY` / `ENV NOT READY`. Every one of
those claims was checked against the file it describes before being written. `## The eight gates`
became `## The nine gates` with a G9 row, a `## Published results` section was added, and
`grep -c "(7/7)" README.md` returns 0.

## Deviations

1. **`publish_results` is called after the passing branch of the gate loop only**, not after all
   four `record_gate` call sites. The plan said "immediately after each `record_gate` call". The
   `cannot-run` and `fail` branches call `record_gate` and then immediately `halt` or `exit`, so they
   reach `write_run_record` + `publish_results` through the EXIT trap one line later; adding the pair
   inline would have been dead duplication. Both behaviours were observed producing the correct
   published file (see the exit-path table above).

## Not done here

No status page. GATE-08's wording is that a gate run publishes results *a status page can consume*;
no phase in the roadmap builds the consumer. `scripts/gate-coverage.mjs` and `scripts/loop-status.mjs`
were not modified — this plan adds a third consumer of the run record rather than changing the two
that existed.

No point of Philippine law arose. Nothing was added to the lawyer review agenda.
