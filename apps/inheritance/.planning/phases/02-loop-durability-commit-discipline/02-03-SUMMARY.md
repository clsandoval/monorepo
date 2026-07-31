---
phase: 02-loop-durability-commit-discipline
plan: 03
subsystem: loop-durability
tags: [commit-discipline, safe-commit, history-audit]
requires: []
provides:
  - scripts/safe-commit.sh
  - scripts/check-commit-discipline.mjs
affects:
  - scripts/ci-gates.sh (plan 02-04 registers this audit as gate G7)
tech-stack:
  added: []
  patterns:
    - bash wrapper with set -euo pipefail, refuses rather than warns
    - spawnSync with shell:false and explicit argv for every git call
    - path-scope filtering, never author or message filtering
key-files:
  created:
    - scripts/safe-commit.sh
    - scripts/check-commit-discipline.mjs
    - scripts/fixtures/commits-clean.json
    - scripts/fixtures/commits-mixed.json
  modified:
    - README.md
    - CLAUDE.md
key-decisions:
  - "The audit filters by path scope, never by author. Filtering out the auto-committer would hide the exact commit the audit exists to catch."
  - "The floor is the hard-coded SHA bdee3c498…, with no flag to advance it. A movable watermark is an escape hatch."
  - "No real mixed commit was created to test the audit; the failure path is driven entirely by --from-json fixtures."
requirements-completed: [LOOP-05]
duration: ~25 min
completed: 2026-07-31
---

# Phase 2 Plan 03: Safe-Commit Wrapper and Mixed-Commit History Audit Summary

The safe commit path is now one command that refuses every broad-stage form, refuses foreign paths,
refuses to commit on top of a pre-populated index, and verifies the staged set before writing. The
matching audit walks every commit since project init and fails on any commit that mixes
`apps/inheritance/` with paths outside it — in either direction.

**Tasks:** 4 of 4 · **Files:** 4 created, 2 modified · **Commit:** `d7cda08bf`

## The wrapper's refusal paths, all observed

| Invocation | Exit | Printed reason |
|---|---:|---|
| `safe-commit.sh -m "x" -A` | 1 | `REFUSED: '-A' is a broad stage. Name explicit file paths instead.` |
| `safe-commit.sh -m "x" .` | 1 | `REFUSED: '.' is a broad stage. Name explicit file paths instead.` |
| `safe-commit.sh -m "x"` (no paths) | 1 | `REFUSED: no paths given. This script never stages anything you did not name.` |
| `safe-commit.sh -m "x" projects/lessons/pymc-literacy.md` | 1 | `REFUSED: … is outside apps/inheritance/ (and is not .github/workflows/inheritance-ci.yml)` |
| `safe-commit.sh apps/inheritance/README.md` (no `-m`) | 1 | `REFUSED: no commit message. Use -m "<message>".` |
| `safe-commit.sh -m "x" <path>` with a pre-populated index | 1 | `REFUSED: the index is not empty. Something else already staged: …` |
| `safe-commit.sh --dry-run -m "x" apps/inheritance/README.md` | 0 | `SAFE COMMIT DRY RUN OK`; `git diff --cached --name-only` left empty |

The pre-populated-index refusal is the subtle one: committing on top of somebody else's stage is
exactly the absorption the wrapper exists to prevent, and the wrapper deliberately does not resolve
it — the operator does, with `git restore --staged`.

## The audit on real history

```
COMMIT DISCIPLINE OK — 33 commit(s) audited over bdee3c498c7c7a801125ab21e97be32f88b57593..HEAD,
                       13 touching apps/inheritance/, 0 mixed
```

**Pre-existing mixed commits found: zero.** The research measurement held — the audit starts green,
so any future red is a real finding rather than accumulated debt. After this plan's own commit the
count reads 34 audited / 14 app-touching / 0 mixed, so the commit the wrapper made is itself
scope-clean.

## Observed results — fixtures and internal errors

| Run | Exit | Marker matched |
|---|---:|---|
| `--from-json scripts/fixtures/commits-clean.json` | 0 | `COMMIT DISCIPLINE OK — 3 commit(s) audited …, 1 touching apps/inheritance/, 0 mixed` |
| `--from-json scripts/fixtures/commits-mixed.json` | 1 | `MIXED COMMIT: 4444… fitness log` naming `projects/fitness/log.md` |
| `--from-json /tmp/definitely-not-a-file.json` | 1 | `COMMIT LIST UNREADABLE` (marker, not a stack trace) |
| run inside an unrelated throwaway repo | 1 | `FLOOR NOT ANCESTOR: bdee3c498… is not an ancestor of HEAD` |

The clean fixture's middle commit — one touching only `projects/lessons/pymc-literacy.md` — is not
flagged, which proves the audit ignores the auto-committer's own work on the correct basis: path
scope, not identity. `git log --oneline -1` was byte-identical before and after the fixture runs; no
commit was created to test the audit.

## Documentation

- `README.md` — the existing `## Committing in this repo` section was **extended, not replaced**;
  its original sentence prohibiting `git add -A` is intact. It now carries the wrapper's usage line,
  its four refusal categories, and the audit command with the path-scope-not-author rationale.
- `CLAUDE.md` — a new `## Loop invariants` section with exactly three invariants, each naming its
  enforcement command: commit scope (`check-commit-discipline.mjs`), gate immutability
  (`check-gate-manifest.mjs`, `GATES.md`), halt over guess (`.planning/PLAN-STANDARD.md`). Inserted
  before the generated GSD sections; nothing else in the file was restructured. Phase 15 (EXT-05)
  still owns the final invariants pass.

## Verification

- `grep -cE "git add -A|git add \.|git commit -a|--amend|rebase|reset --hard|git push"` on
  `safe-commit.sh` → **0**
- `grep -nE "git add|git commit|git rebase|git reset|git push|writeFileSync"` on
  `check-commit-discipline.mjs` → no matches
- Imports: only `node:fs`, `node:path`, `node:child_process`
- Runs from any cwd: `cd /tmp && node <abs path>` → exit 0, same counts
- `grep -c "Loop invariants" CLAUDE.md` → 1
- The commit was made **with the wrapper itself**, which printed
  `SAFE COMMIT OK — d7cda08bf96d0392d0d65d266bb7acb44187ca24, 6 path(s) committed`
- `bash scripts/ci-gates.sh` → exit 0, `ALL GATES PASSED (4/4)` (unchanged by this plan)

## Deviations from Plan

**[Rule 1 — bug] Header comment tripped its own acceptance grep.** `safe-commit.sh`'s header
originally quoted the broad-stage flag inline while explaining why it cannot be blocked from a plan,
which made the zero-occurrence acceptance criterion fail on the script's own prose. Reworded to "A
broad stage cannot be blocked outright from inside a plan" — same meaning, zero hits. No behavior
changed.

**Total deviations:** 1 auto-fixed (prose-vs-grep collision). **Impact:** none on behavior.

## Issues Encountered

None.

## Next

Wave 1 complete. Ready for 02-04, which registers all three wave-1 checks as gates G5–G7 and turns
`ci-gates.sh` into a manifest interpreter.

## Self-Check: PASSED
