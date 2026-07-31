---
phase: 04-lawyer-review-agenda-recorded
plan: 04
status: complete
requirements: [LAWYER-09]
commit: 7519e6cb4707c7f3ff38804cf59ea29075845a8e
---

# Summary — 04-04 `check-lawyer-agenda.mjs`, seven fixtures, gate G10

## The gate, verbatim (plan 04-05 cites both)

- **id:** `G10`
- **command:** `node scripts/check-lawyer-agenda.mjs`

Success line on the current tree:

```
AGENDA OK — 8 decisions, 10 anchors, 8 awaiting-answer
GATE-SKIPS total=8 skipped=0
```

`scripts/check-lawyer-agenda.mjs` is 332 lines, imports only `node:fs` and `node:path`, and
`grep -cE "writeFileSync|appendFileSync|--fix|--update|--accept|--regenerate|execSync|spawnSync"`
returns `0`. Its only two flags are `--registry` and `--agenda`, both read-only path overrides.

## The seven verdicts, each observed firing (exit code and matched marker)

| Run | Exit | Marker matched |
|---|---|---|
| `--registry scripts/fixtures/lawyer-missing-entry.json` | 1 | `AGENDA ENTRY MISSING — LAWYER-05 has no entry in …` |
| `--registry scripts/fixtures/lawyer-missing-field.json` | 1 | `DECISION FIELD MISSING — LAWYER-02 lacks required key(s): anchors` |
| `--registry scripts/fixtures/lawyer-status-invalid.json` | 1 | `DECISION STATUS INVALID — LAWYER-04 has status 'confirmed' but no answer attached: answered_by, answered_on, answer are absent.` |
| `--registry scripts/fixtures/lawyer-anchor-broken.json` | 1 | `DECISION ANCHOR BROKEN — LAWYER-01 anchor pattern 'fn this_function_does_not_exist' occurs 0 time(s) in engine/src/step7_distribute.rs` |
| `--registry scripts/fixtures/lawyer-marker-missing.json` | 1 | `DECISION MARKER MISSING — scripts/fixtures/lawyer-unmarked-source.rs carries no 'LAWYER-DECISION: LAWYER-01' comment` |
| `--agenda scripts/fixtures/lawyer-agenda-drift.md` | 1 | `AGENDA DRIFT — LAWYER-03: agenda says '**Engine implements:** A' but … says reading_implemented 'neither'` |
| `--registry /tmp/definitely-not-a-registry.json` | 1 | `AGENDA SCAN UNREADABLE: registry file … does not exist` |

All seven failure paths printed a `GATE-SKIPS` line. Two fixtures legitimately raise a second
verdict as well (`lawyer-missing-entry` and `lawyer-status-invalid` also trip `AGENDA DRIFT`,
because a registry that lost an entry or advanced a status genuinely *has* drifted from the agenda).
That is correct behaviour, not fixture bleed.

The drift fixture differs from the real agenda by exactly one line, confirmed by `diff`:
line 160, `**Engine implements:** neither` → `**Engine implements:** A`.

`scripts/fixtures/lawyer-unmarked-source.rs` lives outside `engine/src`, and `cargo test` after
creating it still reports 411 + 0 + 1 + 30 + 0 = **442 passed, 0 failed**.

## One script fix during task 2 (fix the script, never the fixture)

`lawyer-missing-field.json` initially reported `AGENDA SCAN UNREADABLE` instead of
`DECISION FIELD MISSING`: the anchor loop called `unreadable()` when `d.anchors` was not an array,
and that exits immediately, before the collected `DECISION FIELD MISSING` violation could print. A
missing `anchors` **key** is a schema defect the field check already covers, not an unparseable
input. The loop now skips such a decision and continues. `AGENDA SCAN UNREADABLE` remains reserved
for what plan 04-04 names: a missing/unparseable file, `decisions` not an array, or an anchor entry
lacking `file`/`pattern`. The fixture was not touched.

## Manifest order after the reorder

```
1  G5  true | node scripts/check-gate-manifest.mjs
2  G6  true | node scripts/check-plan-closed-world.mjs
3  G7  true | node scripts/check-commit-discipline.mjs
4  G1  true | cd engine && cargo test
5  G2  true | bash engine/build-wasm.sh
6  G3  true | cd frontend && npm run test:gate
7  G4  true | cd frontend && npx tsc -b --force
8  G10 true | node scripts/check-lawyer-agenda.mjs
9  G8  true | node scripts/check-gate-skips.mjs
10 G9  true | node scripts/check-gate-results.mjs
```

G9 is still the highest order, which is what keeps `RESULTS INCOMPLETE` from firing on every run.

## `git diff -- gates.manifest.lock` (pure addition, no locked field altered)

```diff
@@ -46,6 +46,11 @@
       "id": "G9",
       "command": "node scripts/check-gate-results.mjs",
       "blocking": true
+    },
+    {
+      "id": "G10",
+      "command": "node scripts/check-lawyer-agenda.mjs",
+      "blocking": true
     }
   ]
 }
```

## Gate results (run, not assumed)

```
node scripts/check-gate-manifest.mjs → MANIFEST OK — 10 gates, 10 locked          (exit 0)
node scripts/check-gate-skips.mjs    → SKIPS OK — 10 gates accounted, 1 declared skip, 0 undeclared (exit 0)
node scripts/check-gate-results.mjs  → RESULTS OK — 10 gates, 9 requirements      (exit 0)
cd engine && cargo test              → 442 passed, 0 failed                        (exit 0)
bash scripts/ci-gates.sh             → ALL GATES PASSED (10/10)                    (exit 0)
ls .gate-runs/logs/                  → G1..G10.log + RUN.stamp (11 entries)
grep -c GATE-SKIPS .gate-runs/logs/G10.log → 1
REQUIREMENT COVERAGE                 → 9/94 gated (was 8/94; LAWYER-09 → G10)
git status --porcelain .planning/lawyer-decisions.json .planning/LAWYER-AGENDA.md engine/ specs/ → empty
```

`GATES.md` gained `## 8. The lawyer decision registry`, containing the literal rule
**no agent may advance a status without a recorded answer**, the seven-verdict table, the
patterns-not-line-numbers rationale, and the ordering note that keeps G9 last. `README.md` now says
`## The ten gates`, carries a `G10` row, and `grep -c "(9/9)"` returns `0`.

## Deviation

`safe-commit.sh` path form — repo-root-relative paths, as in every prior plan this phase.

## No law was decided

The gate checks structural agreement, anchor liveness and marker presence only. It contains no rule
about which reading a decision should carry. Its inputs (`.planning/lawyer-decisions.json`,
`.planning/LAWYER-AGENDA.md`, `engine/`, `specs/`) are byte-unchanged by this plan.

## Self-Check: PASSED
