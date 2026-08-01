---
phase: 15-extendability-documentation-closeout
plan: 03
subsystem: docs
tags: [doc-claims, accepted-debt, shrink-only-ledger, gate, ext-07]
requires: ["15-01"]
provides:
  - ".planning/DOC-DEBT.md — shrink-only ledger of the 7 surviving contradictions"
  - "scripts/check-doc-claims.mjs — gate G32's command (registered by 15-05)"
  - "eleven measured stale claims corrected in CLAUDE.md and the 5 .planning/codebase/*.md it is generated from"
affects: []
tech-stack:
  added: []
  patterns:
    - "Claim = (forbidden/required strings, probe measured from the tree at run time). No expected value is hardcoded, so a doc cannot pass by luck and a code regression surfaces as PROBE FLIPPED rather than as a green doc check."
key-files:
  created:
    - .planning/DOC-DEBT.md
    - scripts/check-doc-claims.mjs
    - scripts/fixtures/docclaims-stale/STACK.md
    - scripts/fixtures/docclaims-debt-short/DOC-DEBT.md
    - scripts/fixtures/docclaims-debt-stale/DOC-DEBT.md
  modified:
    - CLAUDE.md
    - .planning/codebase/STACK.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/INTEGRATIONS.md
    - .planning/codebase/TESTING.md
key-decisions:
  - "The scanned corpus is exactly CLAUDE.md + .planning/codebase/*.md, as the plan defines it. Widening it to every root-level *.md was tried and produced a FALSE POSITIVE: README.md line 58 says the app 'deliberately does **not** use 54321', a correct sentence that C5's forbidden string matches. The corpus was narrowed back and the reason recorded in the script."
  - "DEVIATION on D3. Reference B anchors D3 at frontend/.gitignore, but Phase 1 plan 01-01 already deleted that rule — the file no longer contains the string, so writing D3 as specified would have fired DEBT ENTRY STALE on the ledger's first run. The surviving stale claim is in .planning/codebase/CONCERNS.md, which is outside this plan's editable set, so D3 was re-anchored there. Seven entries, all live; nothing was dropped or weakened."
  - "C6 is closed by naming `cd engine && cargo test` instead of a number. grep -rcE '[0-9]+ tests pass' prints 0 across CLAUDE.md and every .planning/codebase/*.md."
requirements-completed: [EXT-07]
duration: 55 min
completed: 2026-08-01
---

# Phase 15 Plan 03: Eleven Stale Claims Corrected, Seven Recorded as Debt

`CLAUDE.md`'s middle is regenerated from `.planning/codebase/*.md`, which were frozen on 2026-07-27
— before any of the fourteen phases ran. Every correction therefore landed in **both** places, or
the next regeneration would have reinstated it.

## What Was Built

**Task 1 — re-measured every probe before changing a word.** All eleven agreed with research:

```
engine/build-wasm.sh                                   exists
frontend/src/components/ErrorBoundary.tsx              exists
frontend/src/wasm/pkg/inheritance_engine_bg.wasm       exists
../../.github/workflows/inheritance-ci.yml             exists
node_modules PRESENT
project_id = "inheritance"
[api] port = 55321
readInitialWizardState in WizardContainer.tsx          2 hits
engine/tests/  →  bugs_ledger.rs common defect_ledger.rs fuzz_invariants.rs integration.rs observability.rs
"kind" in engine/src/wasm.rs                           2 hits
"NOT built" in CLAUDE.md and .planning/codebase/STACK.md   1 each
```

No probe returned the value that would make its claim true, so nothing was reported BLOCKED.

**Task 2 — corrected all eleven in the five source documents.** After the pass, the plan's own
forbidden-string grep prints `0` for every file in `.planning/codebase/`, `inheritance-ci.yml` is
named in `STACK.md` (2), `TESTING.md` (2) and `INTEGRATIONS.md` (1), and
`grep -rcE "[0-9]+ tests pass"` prints `0` everywhere. `git status --porcelain specs/ CLAUDE.md` was
empty at the end of this task, proving neither was touched by it.

**Task 3 — `.planning/DOC-DEBT.md`.** Seven `## D1` … `## D7` sections in ascending order, 28 bolded
field lines (four per entry), 5 occurrences of `No requirement owns this.` (D1 and D2 are owned by
`EXT-02`). The shrink-only rationale is copied from `engine/legal-traceability.lock`'s `$comment`
pattern rather than newly composed.

**D3 was re-anchored — recorded, not silently changed.** Reference B places D3's claim in
`frontend/.gitignore`. Measured: `frontend/.gitignore` contains only `src/wasm/pkg/*.wasm`; Phase 1
plan `01-01` deleted the dead `inheritance_engine_bg.js` rule and its own summary records
`grep -c inheritance_engine_bg.js frontend/.gitignore` → 0. The claim that *survives* is in
`.planning/codebase/CONCERNS.md`, which still reports the ignore rule and is outside this plan's
editable set. D3 now anchors there. Writing it as specified would have made the ledger fail
`DEBT ENTRY STALE` on its first run.

**Task 4 — the check.** `scripts/check-doc-claims.mjs`. Against the committed tree:

```
DOC CLAIMS OK — 11 claim(s) probed, 7 debt entr(ies) live
GATE-SKIPS total=11 skipped=0
```

`grep -cE '\-\-fix|\-\-update|\-\-accept|\-\-regenerate|writeFileSync|appendFileSync|mkdirSync'`
prints **0**. `--docroot` moves only where documents are read from; the probes always measure the
real tree.

**Task 5 — all six markers observed firing:**

| Input | Marker observed | Exit |
|---|---|---|
| `docclaims-stale/` | `STALE CLAIM` (C1, `**NOT built.**`) **and** `CLAIM UNSUPPORTED` (C1…C10) in one run | 1 |
| `docclaims-debt-short/` | `DEBT ENTRY MISSING` naming `D4` | 1 |
| `docclaims-debt-stale/` | `DEBT ENTRY STALE` naming `D3` and its dead anchor | 1 |
| `ErrorBoundary.tsx` temporarily renamed | `PROBE FLIPPED — C7's probe returned false, so the tree once again matches the old claim` | 1 |
| `scripts/fixtures/nope` | `DOC SCAN UNREADABLE` | **2** |

The rename was undone immediately; `git status --porcelain frontend/src/` printed nothing
afterwards, and `cd engine && cargo test` (476+3+3+17+44+3 passed, **0 failed**) and
`cd frontend && npx tsc -b --force` (zero output, exit 0) both confirm it left nothing behind.

**Task 6 — `CLAUDE.md`'s copies.** Re-read from disk first: `## Invariants an implementing agent must
not violate` = 1, `## Loop invariants` = 0, so `15-01` had landed. The same eleven corrections were
applied inside the `stack`, `conventions` and `architecture` spans. Afterwards
`grep -c "<!-- GSD:"` = **14** (unchanged) and `grep -cE "^[0-9]\. \*\*"` = **6**, so no marker moved
and the invariants section survived intact.

**Commit** `f71c409b6`, exactly the eleven paths, staged explicitly.

## Verification

```
node scripts/check-doc-claims.mjs        → DOC CLAIMS OK — 11 claim(s) probed, 7 debt entr(ies) live  (exit 0)
node scripts/check-claude-invariants.mjs → CLAUDE INVARIANTS OK — 6 invariant(s) checked, all commands gated
node scripts/check-spec-legal-text.mjs   → SPEC LEGAL TEXT OK — 4 correction(s), 11 location(s) checked
node scripts/check-commit-discipline.mjs → 220 commit(s) audited, 191 touching apps/inheritance/, 0 mixed
node scripts/check-gate-manifest.mjs     → MANIFEST OK — 28 gates, 28 locked
cd engine && cargo test                  → 0 failed across all binaries
cd frontend && npx tsc -b --force        → zero output, exit 0
git status --porcelain CLAUDE.md .planning/ scripts/ specs/ → (empty)
```

## Notes

`specs/` is byte-identical and gate G27 is unchanged — its legal prose was deliberately out of scope,
because re-auditing it would be re-deciding law. No point of Philippine law was decided. Nothing
under `engine/`, `frontend/src/` or `frontend/supabase/` was edited.

Registration as **G32** is plan `15-05`'s work; the gate set is still 28.
