---
phase: 03-reproducible-environment-gate-reporting
plan: 04
completed: 2026-07-31
commit: 3c29896bb52f651140b36ef9307afeb8c59bc66c
requirements: [GATE-09]
---

# 03-04 Summary — per-gate skip accounting and a shrink-only ledger

Every gate now states, in its own output, how many of its own assertions it made and how many it
skipped. Gate **G8** (`node scripts/check-gate-skips.mjs`) reads those statements back and fails the
build on any skip that `gate-skips.lock` does not declare — and on any declaration no longer
observed, which is what forces the ledger down over time.

## What each gate reported

The five scripts this project owns emit the line directly. `cargo test` and `tsc` are external tools
whose command strings are frozen in `gates.manifest.lock`, so their counts are derived instead.

| Gate | Source | Observed line / derivation |
|---|---|---|
| G5 `check-gate-manifest.mjs` | emitted | `GATE-SKIPS total=8 skipped=0` (7 before G8 was registered) |
| G6 `check-plan-closed-world.mjs` | emitted | `GATE-SKIPS total=15 skipped=0` |
| G7 `check-commit-discipline.mjs` | emitted | `GATE-SKIPS total=57 skipped=0` |
| G2 `engine/build-wasm.sh` | emitted | `GATE-SKIPS total=3 skipped=0` |
| G3 `check-test-baseline.mjs` | emitted | `GATE-SKIPS total=2416 skipped=0` |
| G1 `cd engine && cargo test` | derived | five `test result:` lines summing to `total=442`, every one `0 ignored; … 0 filtered out` → `skipped=0` |
| G4 `npx tsc -b --force` | derived (static) | `total=319` = 2 tsconfig switches + 317 `.ts`/`.tsx` files under `frontend/src`; one skip, `tsconfig.skipLibCheck` |
| G8 itself | self | `GATE-SKIPS total=8 skipped=0` |

`SKIPS OK — 8 gates accounted, 1 declared skip, 0 undeclared` (exit 0).

## The five verdicts, each observed firing

Fixtures are committed under `scripts/fixtures/`. A check nobody has seen fail is not known to be a
check.

| Command | Exit | Marker matched |
|---|---|---|
| `node scripts/check-gate-skips.mjs --logs scripts/fixtures/logs-ignored` | 1 | `UNDECLARED SKIP: gate G1 skipped cargo.ignored:1:1` **and** `SKIP COUNT MISMATCH: gate G5 emitted skipped=2 but 0 skip id(s) are collectable` |
| `node scripts/check-gate-skips.mjs --logs scripts/fixtures/logs-stale` | 1 | `SKIP REPORT MISSING: gate G1 log … carries stamp "GSD-RUN 2020-01-01T00:00:00Z" which does not match the run stamp` |
| `node scripts/check-gate-skips.mjs --lock scripts/fixtures/skips-stale.lock` | 1 | `STALE SKIP DECLARATION: … declares G1 / engine.ignored.example … but it was not observed on this run` |
| `node scripts/check-gate-skips.mjs --logs /tmp/empty-logs-dir` | 1 | `SKIP REPORT MISSING` × 8 (RUN.stamp plus every gate log) |
| `node scripts/check-gate-skips.mjs --lock /tmp/definitely-not-a-file.lock` | 1 | `SKIP SCAN UNREADABLE: no such skip ledger file` |
| `node scripts/check-gate-skips.mjs` (no flags) | 0 | `SKIPS OK` |

## Log directory layout and the run stamp — read this before plan 03-05

`scripts/ci-gates.sh` clears `.gate-runs/logs/` at the start of every run, writes
`GSD-RUN <STARTED_AT>` into `.gate-runs/logs/RUN.stamp`, and then, per gate, writes that same line as
the first line of `.gate-runs/logs/<GATE_ID>.log` before teeing the gate's combined stdout and
stderr into it. The gate's exit status is read from `${PIPESTATUS[0]}`, never `$?`, so piping through
`tee` cannot turn a red gate green.

```
.gate-runs/logs/
  RUN.stamp     GSD-RUN 2026-07-31T07:34:01Z
  G1.log … G8.log   first line identical to RUN.stamp
```

The directory is gitignored per-run detail. A missing log, or one whose stamp differs, is
`SKIP REPORT MISSING` — never zero skips, because otherwise deleting a log would be a way to look
clean.

**Exemption that plan 03-05 depends on:** the gate this script backs (`G8`) and every gate ordered
*after* it are exempt from all log-derived verdicts, because their logs are still being written while
the check runs. When plan 03-05 appends `G9` at `order: 9`, `G9` is covered by the same exemption
automatically and `scripts/check-gate-skips.mjs` needs no change. Any gate that emits no
`GATE-SKIPS` line and is *not* in that tail is a hard failure.

## Manifest growth — addition only

```
$ git diff HEAD~1 -- gates.manifest.lock
@@ -36,6 +36,11 @@
       "id": "G7",
       "command": "node scripts/check-commit-discipline.mjs",
       "blocking": true
+    },
+    {
+      "id": "G8",
+      "command": "node scripts/check-gate-skips.mjs",
+      "blocking": true
     }
```

No pre-existing `command` string changed. `node scripts/check-gate-manifest.mjs` →
`MANIFEST OK — 8 gates, 8 locked` (exit 0).

## Final runner state

```
ALL GATES PASSED (8/8)
LOOP STATUS GREEN — recorded pass (24/200 records)
EXIT=0
```

`GATE COVERAGE 8/8`, `REQUIREMENT COVERAGE 7/94 gated`, with `GATE-09 -> G8` newly present.

## Deviations

1. **Fixture log bodies for G1 and G3 are excerpted, not byte-complete.** The plan said "a full set
   of the eight log files copied from a real run". All eight files are present in both fixture
   directories and every one is copied from the real 2026-07-31T07:27:57Z run, but `G1.log`
   (32 KB of cargo output) and `G3.log` (286 KB of vitest output) are reduced to their run stamp plus
   the lines the check actually reads — the `test result:` lines and the `GATE-SKIPS` line. Copying
   them whole would have committed ~640 KB of test-runner noise across two directories into a repo
   with a concurrent auto-committer. Nothing load-bearing was dropped: both fixtures produce exactly
   the verdicts the plan required.
2. **`SKIP COUNT MISMATCH` can never be silenced for an emitted gate.** By the plan's own design
   (task 5 states "no skip ids are collectable for G5"), an emitted `skipped=<n>` with `n > 0`
   always trips the mismatch verdict, because this check collects skip ids only for the derived
   gates. That is strictly stronger than the plan's minimum — an emitted nonzero skip is a loud
   failure rather than a quiet number — and it is what makes the fixture fire.

## Not done here

`gate-results.json`, `scripts/publish-gate-results.mjs` and gate G9 are plan 03-05's, per this
plan's constraint 10. Nothing in that set was created or modified.

No point of Philippine law arose. Nothing was added to the lawyer review agenda.
