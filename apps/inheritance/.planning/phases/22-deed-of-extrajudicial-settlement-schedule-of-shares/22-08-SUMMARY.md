# 22-08 — G38 registered, and the suite's real state

**Status:** complete for registration and documentation. `bash scripts/ci-gates.sh` exit 0 is
**NOT achieved and NOT claimed** — see below.

## What shipped

- `gates.manifest.json` — G38 appended at order 35; `G8` 35 -> 36 and `G9` 36 -> 37 so G9 stays last.
- `gates.manifest.lock` — one entry appended, command byte-identical to the manifest.
- `GATES.md` — new `## 28. Deed parity (G38)`.
- `.planning/ORIENTATION.md` — `The gate set holds 37 gates.`
- `RESUME.md` — `ALL GATES PASSED (37/37)`.

## The gate set only grew — proven, not asserted

```
node -e "<compare pre-edit manifest to post-edit>"
  removed:          []
  orderChanged:     [ 'G8: 35->36', 'G9: 36->37' ]
  otherFieldDiffs:  []
git diff -- gates.manifest.lock | grep -cE "^-[^-]"   -> 0
manifest gates 37   lock entries 37   G38 order 35 blocking true requirements DEED-05
last by order: G9 37
```

## Every command run, with its real exit code

```
$ node scripts/check-gate-manifest.mjs
MANIFEST OK — 37 gates, 37 locked
GATE-SKIPS total=37 skipped=0
EXIT=0

$ node scripts/check-plan-closed-world.mjs
PLANS OK — 138 plan file(s), 565 task(s) checked
GATE-SKIPS total=138 skipped=0
EXIT=0

$ node scripts/check-lawyer-agenda.mjs
AGENDA OK — 13 decisions, 15 anchors, 13 awaiting-answer
GATE-SKIPS total=13 skipped=0
EXIT=0

$ node scripts/check-citation-integrity.mjs
CITATION INTEGRITY OK — 652 heir rows across 171 corpus files, 24 distinct articles, all resolving
GATE-SKIPS total=652 skipped=0
EXIT=0

$ node scripts/check-blocked-requirements.mjs
BLOCKED REQUIREMENTS OK — 6 requirement(s) checked, all awaiting-answer
GATE-SKIPS total=6 skipped=0
EXIT=0

$ node scripts/check-planning-truth.mjs
IN-FLIGHT PHASE 22 — numerator relaxed, denominator and over-claim still checked
PLANNING TRUTH OK — 22 phase(s) reconciled, 4 document(s) checked
GATE-SKIPS total=8 skipped=0
EXIT=0

$ node scripts/check-commit-discipline.mjs
COMMIT DISCIPLINE OK — 302 commit(s) audited over bdee3c498c..HEAD, 267 touching apps/inheritance/, 0 mixed
GATE-SKIPS total=302 skipped=0
EXIT=0

$ cd frontend && npx tsc -b --force
EXIT=0

$ cd frontend && npx tsx journey/deed-parity.ts
GATE-SKIPS total=4 skipped=0
DEED PARITY PASS blocks=4 stated=4 refused=0 docxParagraphs=33
EXIT=0

$ cd frontend && npm run test
 Test Files  8 failed | 101 passed (109)
      Tests  31 failed | 2318 passed (2349)
EXIT=1   (the 31 are the ledgered pre-existing failures; see test:gate below)

$ cd frontend && npm run test:gate
GATE OK — test baseline matches exactly
  total tests run     : 2349 (floor 2119)
  passed              : 2318
  known failures met  : 31
  LEDGER SIZE (debt)  : 31   <-- this number must only go down
GATE-SKIPS total=2349 skipped=0
EXIT=0

$ bash scripts/ci-gates.sh
... 15 of 37 gates ran ...
JOURNEY STEP FAILED intake-step-0: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED intake-step-1: DIFF FAILURE
JOURNEY STEP FAILED intake-step-2: DIFF FAILURE
JOURNEY STEP FAILED intake-step-3: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED intake-draft-recovered: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED results-view: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED results-family-tree: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED tax-tab-0: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED tax-tab-1: DIFF FAILURE
JOURNEY STEP FAILED tax-tab-2: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED tax-tab-3: DIFF FAILURE
JOURNEY STEP FAILED tax-tab-4: DIFF FAILURE
JOURNEY STEP FAILED tax-tab-5: REFERENCE SIZE MISMATCH
JOURNEY STEP FAILED tax-tab-6: DIFF FAILURE
JOURNEY STEP FAILED tax-tab-7: REFERENCE SIZE MISMATCH
GATE-SKIPS total=25 skipped=0
JOURNEY FAIL steps=25 failed=15

GATE FAILED: G17 (exit 1)
EXIT=1
```

## `bash scripts/ci-gates.sh` exit 0 is NOT achieved and NOT claimed

It halts at **G17, gate 15 of 37**, with `JOURNEY FAIL steps=25 failed=15`. Three owner-blocked
causes stand and this phase touches none of them:

1. The **fifteen journey steps withheld for human review** since Phase 16. Their references still
   show screens that Phases 16-20 rebuilt. Re-approving any of them is a visual judgement.
2. **G20**, whose script `journey/share-exposure.mjs` commit `4ccf06270` deleted while its
   precondition still passes, so the runner executes it and it fails.
3. **G21**, which exits **2** — a HALT, not a failure — because both `seo-smoke.mjs` and
   `seo-routes.json` are gone.

Retiring or repairing any of them is owner action under CLAUDE.md invariant 2, enforced by G5.

**G38 at order 35 was therefore NOT REACHED by the suite.** Its green result above comes from running
it directly, which is what the plan intended when it placed the gate after the halt.

### One thing genuinely improved

**G3 now passes.** Phase 16's blocker A — `TEST COUNT DROPPED: ran 2073 tests, floor is 2119` — is
cleared, not by lowering the floor but by the 82 tests this phase added: the count is now **2349**
against the unchanged floor of **2119**. `frontend/test-baseline.json` was not edited by any commit in
this phase. G4 (typecheck) and G18 (tenant isolation) also ran and passed; before this phase the suite
halted at G3 and never reached them.

Gates **G19 and G35, and G20 through G33, G37, G38, G8 and G9 were never reached** by the suite this
run. No suite-level claim is made about any of them; the ones run directly are listed above.

## Journey references: nothing approved

```
git log --name-only 6996f0bc1..HEAD | grep -c "journey/references|journey/pdf-references"  -> 0
```

`node journey/approve.mjs` was run **zero** times. This phase adds a whole new section to the results
screen, so `results-view` and `results-family-tree` now differ by more than they did — that diff is
CONTENT, not the deleted sidebar navigation region, and the journey reference rule forbids approving
it. A human must confirm the new deed section is intended and re-approve.

## Other measured facts

- Frontend tests: **2349** total, **31** failed (the unchanged 31-entry ledger), **0** skipped.
  Ledger size 31 before and after; nothing appended to any ledger.
- Every entry in `.planning/lawyer-decisions.json` still reads `awaiting-answer` (13 of 13).
- `git diff 6996f0bc1..HEAD -- frontend/test-baseline.json frontend/assertion-baseline.json
  gate-skips.lock coverage-zero.lock engine/legal-traceability.lock` is **empty**.
- The branch is unpushed and unmerged: `gsd/deletion-milestone`, **73 commits ahead of main**, no
  upstream configured. Nothing pushed, merged, switched or created.
