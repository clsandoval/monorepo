---
phase: 16
plan: 16-06
status: blocked
requirements: [CUT-04]
---

# 16-06 — Full gate suite: CUT-04 is BLOCKED on the owner

`bash scripts/ci-gates.sh` → **exit 1**. CUT-04 is **not claimed**. This was predicted at planning
time and is recorded in the Expected-Red Register in `16-VALIDATION.md`.

## What actually ran

Nine gates passed before the halt:

```
=== GATE G5  (1/32): gate manifest integrity ===      GATE-SKIPS total=32   skipped=0
=== GATE G6  (2/32): plan closed-world lint ===       GATE-SKIPS total=97   skipped=0
=== GATE G7  (3/32): commit discipline audit ===      GATE-SKIPS total=242  skipped=0
=== GATE G12 (4/32): engine coverage report ===       GATE-SKIPS total=17   skipped=0
=== GATE G13 (5/32): assertion discipline ===         GATE-SKIPS total=2009 skipped=0
=== GATE G15 (6/32): journey harness self-test ===    GATE-SKIPS total=11   skipped=0
=== GATE G16 (7/32): journey registry integrity ===   GATE-SKIPS total=350  skipped=0
=== GATE G1  (8/32): engine tests ===
=== GATE G2  (9/32): wasm build ===                   GATE-SKIPS total=3    skipped=0
=== GATE G3  (10/32): frontend suite vs ledger ===    GATE-SKIPS total=2073 skipped=0
GATE FAILED: G3 (exit 1)
```

`G16` passing at `steps=25` is the gate's own endorsement of 16-05's registry restructure.
`G13` passing at 2009 assertions is the machine check that nothing was weakened.

## Blocker B — the test-count floor (this is what stops the run)

```
TEST BASELINE GATE FAILED — 1 violation(s)
TEST COUNT DROPPED: ran 2073 tests, floor is 2119
  Tests were removed or failed to collect. Restore them.
GATE-SKIPS total=2073 skipped=0
```

The 46-test gap is exactly the tests whose subject modules the cut deleted (see `16-04-SUMMARY.md`).
Clearing it means lowering `min_total_tests` in `frontend/test-baseline.json` to the newly measured
2073 — **owner action**, with precedent at `4ccf06270`. Not taken.

## Blocker A — G20/G21 have no scripts (not reached, still real)

Commit `4ccf06270` deleted `frontend/journey/share-exposure.mjs` and `frontend/journey/seo-smoke.mjs`
but left **G20** and **G21** registered and *blocking* at orders 15 and 16. The suite halts at G3
(order 10), so this run never reached them — Blocker A is therefore **not observed in this output**
and is carried forward from planning as a static finding, not a measured one. Retiring a gate is
owner action under `CLAUDE.md` invariant 2, enforced by G5.

**Consequence: clearing Blocker B alone will not make the suite green.** It will advance the failure
to G20.

## Nothing was weakened to get here

```
$ git log --oneline becfb6c27..HEAD -- frontend/test-baseline.json frontend/gate-skips.lock \
      frontend/assertion-baseline.json gates.manifest.json gates.manifest.lock
(no output)
```

No phase-16 commit touches any baseline, ledger or gate manifest, and no `.skip`/`.todo`/`.only`
marker was introduced anywhere under `frontend/src`.
