---
phase: 02-loop-durability-commit-discipline
plan: 01
subsystem: loop-durability
tags: [gates, manifest, integrity-check]
requires: []
provides:
  - gates.manifest.json
  - gates.manifest.lock
  - scripts/check-gate-manifest.mjs
  - GATES.md
affects:
  - scripts/ci-gates.sh (plan 02-04 makes it read the manifest)
tech-stack:
  added: []
  patterns:
    - dependency-free Node ESM check, node: builtins only
    - collect-all-violations then exit once (same shape as check-test-baseline.mjs)
    - growth-only lock, the inverse of the shrink-only test ledger
key-files:
  created:
    - gates.manifest.json
    - gates.manifest.lock
    - scripts/check-gate-manifest.mjs
    - scripts/fixtures/manifest-removed.json
    - scripts/fixtures/manifest-command-changed.json
    - scripts/fixtures/manifest-weakened.json
    - scripts/fixtures/manifest-grown.json
    - GATES.md
  modified: []
key-decisions:
  - "The lock covers {id, command, blocking} only. order/name/proves/requirements/cwd/precondition are deliberately unlocked, because reordering and prose are not weakening."
  - "UNLOCKED GATE is a violation, not a silent pass: a manifest gate absent from the lock could be deleted later without tripping GATE REMOVED."
  - "No update/fix/accept/regenerate flag exists, and the acceptance criteria grep the script to keep it that way."
requirements-completed: [LOOP-03]
duration: ~25 min
completed: 2026-07-31
---

# Phase 2 Plan 01: Frozen, Growth-Only Gate Manifest Summary

The four gates that `scripts/ci-gates.sh` already runs are now **data** rather than four hardcoded
shell blocks, frozen by a lock file whose three fields are exactly the ones whose change would
reduce what the gate set verifies. `scripts/check-gate-manifest.mjs` diffs manifest against lock and
has no code path that writes either file.

**Tasks:** 5 of 5 · **Files:** 8 created, 0 modified · **Commit:** `62aa93721`

## The frozen gate set (phase opening coverage: 4 blocking gates)

| id | order | command (byte-identical to `ci-gates.sh`) | blocking | requirements |
|---|---:|---|---|---|
| G1 | 1 | `cd engine && cargo test` | true | — |
| G2 | 2 | `bash engine/build-wasm.sh` | true | GATE-03 |
| G3 | 3 | `cd frontend && npm run test:gate` | true | GATE-01 |
| G4 | 4 | `cd frontend && npx tsc -b --force` | true | GATE-02 |

`gates.manifest.lock` was generated *from* the manifest by script, not hand-typed, so the two could
not disagree at birth. Verified: all 4 locked entries match the manifest on both `command` and
`blocking`.

## Observed results — every failure path fired

| Run | Exit | Marker matched |
|---|---:|---|
| `check-gate-manifest.mjs` (no flags) | 0 | `MANIFEST OK — 4 gates, 4 locked` |
| `--manifest scripts/fixtures/manifest-removed.json` | 1 | `GATE REMOVED: G3` |
| `--manifest scripts/fixtures/manifest-command-changed.json` | 1 | `GATE COMMAND CHANGED: G3` |
| `--manifest scripts/fixtures/manifest-weakened.json` | 1 | `GATE WEAKENED: G1` |
| `--manifest scripts/fixtures/manifest-grown.json` | 1 | `UNLOCKED GATE: G99` |
| `--manifest /tmp/definitely-not-a-file.json` | 1 | `MANIFEST UNREADABLE` |
| ad-hoc malformed manifest (dropped `proves`, non-integer `order`) | 1 | `MALFORMED GATE: G2`, `MALFORMED GATE: G3` |
| `--manifest manifest-grown.json --lock /tmp/grown.lock` (growth path) | **0** | `MANIFEST OK — 5 gates, 5 locked` |

The last row is the point: the rule is **growth-only**, not change-nothing. Appending to the
manifest and the lock together is legal and was observed passing. `G99` was not added to the real
manifest or the real lock.

The `manifest-command-changed.json` mutation is the realistic attack — swapping G3's ledger gate for
plain `npm test`, which is red today and therefore certifies nothing. It exits 1.

## Verification

- `node scripts/check-gate-manifest.mjs` → exit 0, `MANIFEST OK — 4 gates, 4 locked`
- Runs from any cwd: `cd /tmp && node <abs path>` → exit 0
- `grep -cE "writeFileSync|appendFileSync|--update|--fix|--accept|--regenerate"` → **0**
- Imports: only `node:fs` and `node:path`
- `bash scripts/ci-gates.sh` → exit 0, `ALL GATES PASSED (4/4)`; engine 411+1+30 pass, ledger gate
  `GATE OK — test baseline matches exactly`, `LEDGER SIZE (debt) : 46`
- `git log -1 --name-only` → exactly the 8 intended paths, nothing else

## Deviations from Plan

**[Rule 1 — bug] Doc comment tripped its own acceptance grep.** The script's header originally read
"has no `--update` / `--fix` / `--accept` / `--regenerate` flag", which made the
zero-occurrence acceptance criterion fail on its own prose. Reworded to "no flag of any kind that
rewrites, repairs, or regenerates the manifest or the lock" — same meaning, zero hits. No behavior
changed.

**[Rule 1 — bug] Same issue in `gates.manifest.lock`'s `$comment`.** It listed the unlocked field
names (`order`, `proves`, `requirements`), which a naive grep for those key names would hit.
Reworded to "Every other manifest field is deliberately left unlocked". The JSON keys themselves
were already absent.

**Total deviations:** 2 auto-fixed (both prose-vs-grep collisions). **Impact:** none on behavior.

## Issues Encountered

None.

## Next

Ready for 02-04, which appends G5–G7 and makes `ci-gates.sh` read this manifest instead of
hardcoding its gate list.

## Self-Check: PASSED
