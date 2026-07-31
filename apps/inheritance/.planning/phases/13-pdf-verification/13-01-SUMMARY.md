---
phase: 13-pdf-verification
plan: 01
subsystem: pdf
tags: [pdf, currency, fonts, regression-guard]
requires: []
provides:
  - "frontend/src/components/pdf/pdf-text.ts — formatPesoPdf and toPdfSafeText"
affects:
  - "frontend/src/components/pdf/*.tsx (four money/narrative sections)"
tech-stack:
  added: []
  patterns:
    - "PDF-local formatter mirroring the shared formatter's digit algorithm, BigInt throughout"
key-files:
  created:
    - frontend/src/components/pdf/pdf-text.ts
    - frontend/src/components/pdf/__tests__/pdf-text.test.ts
  modified:
    - frontend/src/components/pdf/CaseSummarySection.tsx
    - frontend/src/components/pdf/DistributionTableSection.tsx
    - frontend/src/components/pdf/PerHeirBreakdownSection.tsx
    - frontend/src/components/pdf/NarrativesSection.tsx
    - frontend/src/components/pdf/__tests__/pdf.test.tsx
key-decisions:
  - "The replacement token is exactly 'PHP ' (ISO 4217 alphabetic code plus one space), applied only inside src/components/pdf/. formatPeso in src/types/index.ts is untouched so the web UI keeps ₱."
  - "The plan's acceptance text called '900719925474099' a value above Number.MAX_SAFE_INTEGER. It is not (9.0e14 vs the 9.0e15 limit). The plan's pinned row was kept verbatim AND a genuinely-above-limit case ('90071992547409999') was added, rather than asserting something false."
requirements-completed: [PDF-02]
duration: 12 min
completed: 2026-07-31
---

# Phase 13 Plan 01: PDF-Local Currency and Text Transforms Summary

Replaced the PDF layer's currency token with an ASCII, WinAnsi-representable one, because the
exported document's fonts physically cannot draw the peso sign — `pdffonts` reports `Times-Roman`,
`Times-Bold` and `Helvetica`, all PDF base-14, **none embedded**, all WinAnsi-encoded. U+20B1 is
therefore written into the content stream as the byte `0xB1`, extracts as `±`, and rasterises at
near-zero advance width over the leading digit of the amount.

- 2 tasks' worth of source, 3 tasks total, 7 files, 1 commit (`e06fecfa2`)
- `frontend/src/components/pdf/pdf-text.ts` — `PDF_PESO_PREFIX`, `formatPesoPdf`, `toPdfSafeText`.
  All arithmetic is `BigInt`; `grep -c "Number(" pdf-text.ts` → `0`.
- Four sections routed through it: `CaseSummarySection`, `DistributionTableSection`,
  `PerHeirBreakdownSection` (helper + three unconditional lines), `NarrativesSection` (body).
  `FirmHeaderSection`, `ComputationLogSection`, `WarningsSection`, `DisclaimerSection` untouched.
- Six committed expectations **corrected, not deleted**; each carries a one-line comment naming the
  measured reason. Four regression tests added — `pdf.test.tsx` went 53 → 57 tests.

## Verification Results

| Command | Result |
|---|---|
| `npx vitest run src/components/pdf/__tests__/pdf-text.test.ts` | 16 passed / 0 failed, exit 0 |
| `npx vitest run src/components/pdf` | 73 passed / 0 failed across 2 files, exit 0 |
| `npm run test:gate` | `GATE OK — test baseline matches exactly`, 2469 run / 2423 passed / 46 known failures met, `UNKNOWN FAILURE` count `0`, `GATE-SKIPS total=2469 skipped=0`, exit 0 |
| `npx tsc -b --force` | zero diagnostic output, `TSC_EXIT=0` |
| `git diff HEAD~1 --stat` | no change to any of the five shrink-only ledgers |

## Deviations from Plan

**[Rule 1 - Incorrect acceptance text] The `MAX_SAFE_INTEGER` claim in task 1** — Found during: Task 1.
The plan's `<interfaces>` table row `"900719925474099"` is ~9.0e14; `Number.MAX_SAFE_INTEGER` is
~9.0e15, so the row is *below* the float-safe range and the acceptance sentence describing it as above
was false. Asserting it would have committed a wrong claim. Fix: the pinned row is kept verbatim as an
exact-equality test, and a **separate** test was added using `'90071992547409999'`, which is genuinely
above the limit, and which additionally proves a float round-trip would have lost the value. No test
was weakened; the file gained a test. Verification: `npx vitest run …/pdf-text.test.ts` → 16 passed.
Commit `e06fecfa2`.

**[Rule 1 - grep-count nit] `grep -c "toPdfSafeText" NarrativesSection.tsx` prints `2`, not `1`** —
Found during: Task 2 acceptance. `grep -c` counts matching *lines*; the import statement and the call
site are two lines, and the import is mandatory. Same arithmetic makes the `formatPesoPdf` counts 2/2/5
rather than 1/1/4. The substantive criterion — every money string and narrative body routed through the
PDF-local transforms — is satisfied and was verified by reading the diff. No code change was made to
chase the number.

**Total deviations:** 2 (1 corrected false assertion, 1 acceptance-criterion counting nit).
**Impact:** None on behaviour. The phase's PDF-02 obligation is met and the added test is stronger than
the one the plan specified.

## Issues Encountered

None.

## Self-Check: PASSED

- `[ -f frontend/src/components/pdf/pdf-text.ts ]` → yes
- `[ -f frontend/src/components/pdf/__tests__/pdf-text.test.ts ]` → yes
- `git log --oneline --all --grep="13-01"` → `e06fecfa2`
- All task `<acceptance_criteria>` re-run above; all plan-level `<verification>` commands re-run above.

## Next

Ready for `13-02` (the poppler reading seam), which is wave 1 and independent of this plan.
