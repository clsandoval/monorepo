# 22-07 — The deed-parity gate, observed red four times

**Status:** complete. Commit `2a4ef6c1d`.

## What shipped

- `frontend/journey/deed-parity.ts` (473 lines) — drives a real Chromium against a real production
  build, clicks the product's own Compute and Download DOCX controls, and compares both surfaces
  against a `computeEngineOutput` run performed in the same process.
- `22-GATE-OBSERVATIONS.md` — the four injections, each with the exact patch, the exit code and the
  verbatim pasted output.

## Measured

```
cd frontend && npx tsc -b --force                          -> exit 0
cd frontend && npx tsx journey/deed-parity.ts
  GATE-SKIPS total=4 skipped=0
  DEED PARITY PASS blocks=4 stated=4 refused=0 docxParagraphs=33   -> exit 0

grep -cE "tolerance|epsilon|Math\.abs|toFixed|--fix|--update|--accept|--regenerate|--approve|--force" -> 0
grep -cE "writeFileSync|appendFileSync|mkdirSync|rmSync"                                              -> 0
grep -c "innerText"                                                                                    -> 0
grep -c "DEED PARITY COMPARED NOTHING"                                                                 -> 1
```

## The four injections, all red on the first attempt

| # | Injection | Exit | Marker observed |
|---|---|---|---|
| 1 | `formatDeedPesos(c + 1n)` in `schedule-lines.ts` | 1 | `DEED AMOUNT MISMATCH ... difference 1` × 4 |
| 2 | `formatDeedPesos(c - 1n)` in `schedule-lines.ts` | 1 | `DEED AMOUNT MISMATCH ... difference -1` × 4 |
| 3 | `schedule.lines.slice(0, -1)` in `clause-text.ts` | 1 | `HEIR LINE MISSING: the clause prints 3 block(s) but the engine returned 4` |
| 4 | `line.articles.slice(1)` in `clause-text.ts` | 1 | `DEED AUTHORITY MISMATCH: block 0 (Ana) prints [""] but the engine emitted ["Art. 996"]` × 4 |

Each was reverted with `git checkout --` before the next, and
`git status --porcelain -- apps/inheritance/frontend/src` printed nothing between them and after the
last. Final baseline re-run: `DEED PARITY PASS blocks=4 stated=4 refused=0 docxParagraphs=33`,
exit 0.

Unlike Phase 21's G37, **none of the four injections initially passed**; no strengthening pass was
needed and the gate committed is the gate observed.

## What is honestly NOT proven

- The DOCX is not proven to open in Microsoft Word. No OOXML consumer exists in this repository.
- The Alpha fixture raises no manual-review flag, so `refused=0`: the `REFUSAL SET MISMATCH` and
  `REFUSED LINE CARRIES AMOUNT` markers are structurally present but were not driven red in a
  browser. The refusal rules themselves are covered by the unit tests.

Both are recorded in `22-GATE-OBSERVATIONS.md` under *What this gate still does not prove*.

## Deviation

The plan's acceptance criterion required `grep -c "innerText"` to print 0 while its action text asked
the code comment to explain why `textContent` is used "never `innerText`". The comment was reworded
to "never the rendered-text property" so both hold.
