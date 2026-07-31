---
phase: 12-wizard-output-journey-gates
plan: 08
subsystem: journey-harness
tags: [money, parity, bigint, results]
requires: [12-02, 12-06]
provides:
  - "frontend/journey/money-parity.mjs — the exact-centavo parity gate (G19)"
  - "parsePesoText, the proven inverse of formatPeso"
affects: []
tech-stack:
  added: []
  patterns:
    - "compare money as BigInt centavos against a computation performed in the same run"
key-files:
  created:
    - frontend/journey/money-parity.mjs
  modified: []
key-decisions:
  - "The expected figure is computed during the run, never committed: a stored expected number stops tracking the engine."
  - "The heir row SET is compared, not only the amounts, so a dropped heir cannot pass."
requirements-completed: []
duration: 19 min
completed: 2026-07-31
---

# Phase 12 Plan 08: Money Parity Summary

Every peso figure the results view displays is compared, as an exact `BigInt` centavo count, against
an engine computation performed in the same run.

3 tasks, 1 file created, 1 commit (`97b834415`).

## Verification

```
node journey/money-parity.mjs   -> exit 0
    GATE-SKIPS total=5 skipped=0
    MONEY PARITY PASS heirs=4 centavos=600000000
npx tsc -b --force              -> exit 0, no output
npm run test:gate               -> exit 0
    GATE OK — test baseline matches exactly
    total tests run : 2449 (floor 2416)   passed : 2403
    known failures met : 46   LEDGER SIZE (debt) : 46
grep -c "Number("       journey/money-parity.mjs -> 0
grep -c "toLocaleString" journey/money-parity.mjs -> 0
grep -c "epsilon\|tolerance\|Math.abs\|toFixed" journey/money-parity.mjs -> 0
```

`centavos=600000000` is exactly the seeded case's `net_distributable_estate`.

## The parser is a proven inverse, not an assumed one

`PARSER OK` over `0`, `1`, `99`, `100`, `123456`, `600000000` and `900719925474099` centavos. The
last exceeds the largest exactly-representable integer in double-precision floating point, which is
the case the BigInt-only rule exists for. `parsePesoText('₱1,000.5')` throws `PESO UNPARSEABLE`
rather than silently reading a one-digit fraction as five centavos.

## The three observed failures

```
HEIR AMOUNT MISMATCH — heir 'c1' displayed 150000001 centavos, engine computed 150000000 centavos (difference 1)
HEIR AMOUNT MISMATCH — heir 'c2' displayed 150000001 centavos, engine computed 150000000 centavos (difference 1)
HEIR AMOUNT MISMATCH — heir 'c3' displayed 150000001 centavos, engine computed 150000000 centavos (difference 1)
HEIR AMOUNT MISMATCH — heir 's'  displayed 150000001 centavos, engine computed 150000000 centavos (difference 1)
TOTAL ESTATE MISMATCH — displayed heir amounts sum to 600000004 centavos, the estate is 600000000 centavos (difference 4)
BREAKDOWN MISMATCH — heir 'c1' breakdown shows 150000000 centavos, the distribution table shows 150000001 centavos (difference -1)
EXIT=1
```

```
HEIR ROW SET MISMATCH — displayed heir ids [c2, c3, s], engine's non-zero heir ids [c1, c2, c3, s]
TOTAL ESTATE MISMATCH — displayed heir amounts sum to 450000000 centavos, the estate is 600000000 centavos (difference -150000000)
MONEY PARITY FAIL checks=5 failed=3
EXIT=1
```

```
TOTAL ESTATE MISMATCH — total displayed 600000100 centavos, input_json.net_distributable_estate is 600000000 centavos (difference 100)
MONEY PARITY FAIL checks=5 failed=1
EXIT=1
```

Each injection was restored with `git checkout --`; `git diff --stat frontend/src/` came back empty
and the check returned to `MONEY PARITY PASS heirs=4 centavos=600000000`.

Worth noting from the first run: a single one-centavo error in the distribution table cascaded into
six named failures across three different markers — the amount, the sum, and the breakdown's
disagreement with the table. The five comparisons are not independent samples of the same fact; they
triangulate it.

## Deviations from Plan

**[Rule 1 - Bug] The module executed its gate on import** — Found during: Task 1, when the parser
round-trip proof instead built the whole application and ran the browser gate. | Cause: `main()` was
called unconditionally at module scope, so `import('./journey/money-parity.mjs')` ran the gate.
| Fix: `main()` now runs only when the file is executed directly
(`import.meta.url === file://${process.argv[1]}`), so importing it is side-effect free and the
round-trip proof stays cheaply re-runnable. | Verification: the proof prints `PARSER OK` in under a
second and `node journey/money-parity.mjs` still exits 0. | Commit: `97b834415`

**[Rule 1 - Bug] Two constraint greps were tripped by the header comment, not by code** — Found
during: Task 1 verification: `grep -c "Number("` printed `2` and the approximate-helper grep printed
`1`, both from prose that named the forbidden constructs in order to forbid them
("never calls Number()", "no epsilon, no tolerance, no Math.abs and no toFixed"). | Fix: the comment
was reworded to say the same thing without the literal tokens, so the greps mean what they claim.
No behaviour changed. | Verification: all three greps now print `0`. | Commit: `97b834415`

**Total deviations:** 2 auto-fixed (2 bugs, both in this plan's own new file). **Impact:** none on
scope.

## Issues Encountered

None.

## Next

Wave 3 complete. Ready for 12-09, the gate registration.
