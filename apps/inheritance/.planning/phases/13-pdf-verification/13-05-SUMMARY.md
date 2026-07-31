---
phase: 13-pdf-verification
plan: 05
subsystem: journey-harness
tags: [pdf, exact-money, citations, gate-g23]
requires:
  - "frontend/journey/pdf-capture.mjs (13-03)"
  - "frontend/journey/pdf.mjs (13-02)"
provides:
  - "frontend/journey/pdf-structure.mjs — the structural/money/citation gate (becomes G23)"
affects: []
tech-stack:
  added: []
  patterns:
    - "Bidirectional exact-integer money comparison between a produced document and a same-run engine computation"
key-files:
  created:
    - frontend/journey/pdf-structure.mjs
  modified: []
key-decisions:
  - "The PASS line reports amounts= as the number of money TOKENS verified in the document (21) plus distinct= for the number of distinct engine values (2). The seeded case awards four heirs identical shares, so a set of distinct values cannot reach the plan's expected count of 5 while the document really does print 21 checked amounts."
  - "Two of the plan's three injections could not fire as written against this case; substitutes that genuinely remove the evidence were used instead and are documented below."
requirements-completed: [PDF-01, PDF-02, PDF-03]
duration: 28 min
completed: 2026-07-31
---

# Phase 13 Plan 05: PDF Structure, Exact Money and Per-Heir Evidence Summary

One gate over one captured document closes PDF-01, PDF-02 and PDF-03.

- 3 tasks, 1 file, 1 commit (`9b36b1abd`), 353 insertions
- 18 required sections, **derived from the run**: `Heir Narratives` is required only because
  `expected.narratives.length > 0`, and `Warnings` is correctly *not* required because the seeded case
  emits none. The firm header is deliberately excluded — `ActionsBar` passes `null` as the profile, so
  no PDF a user can obtain carries one.
- `parsePdfPesoText` is the exact inverse of `formatPesoPdf`. The gate parses; it never formats.
  `grep -c "toLocaleString"` → `0`.
- `grep -c "Number(\|toFixed\|Math.abs\|epsilon\|tolerance"` → `0`. Every comparison is `BigInt`.
- The money check runs **in both directions** against two run-derived sets: a structured set from
  `per_heir_shares` plus `input.net_distributable_estate`, and a narrative set parsed out of the
  engine's own narrative prose.

## Verification Results — real output

```
$ node journey/pdf-structure.mjs
GATE-SKIPS total=4 skipped=0
PDF STRUCTURE PASS sections=18 amounts=21 distinct=2 heirs=4
STRUCT_EXIT=0
```
Run twice, identical, exit `0` both times.

```
$ node journey/money-parity.mjs
MONEY PARITY PASS heirs=4 centavos=600000000     (exit 0 — Phase 12's gate undisturbed)

$ npm run test:gate
GATE OK — test baseline matches exactly           (exit 0, zero unknown failures)

$ git diff --stat frontend/src/                   (empty — no injection survived)
```

### Five observed failures, each restored

**1. `<DisclaimerSection />` removed from `EstatePDF.tsx`:**
```
SECTION MISSING — the extracted text does not contain "Disclaimer"
SECTION MISSING — the extracted text does not contain "informational purposes"
PDF STRUCTURE FAIL checks=4 failed=2      (exit 1)
```
(The first attempt at this injection produced `PDF STRUCTURE CANNOT RUN: npm run build exited 1`,
exit `2` — `noUnusedLocals` rejected the orphaned import. That is the cannot-run path working
correctly, and is itself a useful observation: a build failure is exit 2, never a pass.)

**2. `formatPesoPdf(BigInt(share.net_from_estate.centavos) + 1n)` in `DistributionTableSection.tsx` —
the load-bearing one-centavo injection:**
```
PDF AMOUNT UNEXPECTED — the document prints "PHP 1,500,000.01" = 150000001 centavos, which the engine did not produce for this case. Engine amounts this run: [150000000, 600000000]
   ... (x4, one per heir row)
PDF STRUCTURE FAIL checks=4 failed=4      (exit 1)
```
**A one-centavo change turns the run red.**

**3. `+ 1n` on the estate total in `CaseSummarySection.tsx` — added to observe the other direction:**
```
PDF AMOUNT UNEXPECTED — the document prints "PHP 6,000,000.01" = 600000001 centavos, which the engine did not produce for this case. Engine amounts this run: [150000000, 600000000]
PDF AMOUNT MISSING — the engine produced 600000000 centavos for this case but no amount in the document parses to it. Amounts the document printed: [150000000, 600000001]
PDF STRUCTURE FAIL checks=4 failed=2      (exit 1)
```

**4. The whole `Legal Basis` block removed from `PerHeirBreakdownSection.tsx`:**
```
HEIR EVIDENCE MISSING — heir 'c1' has legal_basis ["Art. 996"] but the document contains none of those citations
   ... (x4)
PDF STRUCTURE FAIL checks=4 failed=4      (exit 1)
```

**5. `<NarrativesSection />` removed from `EstatePDF.tsx`:**
```
SECTION MISSING — the extracted text does not contain "Heir Narratives"
HEIR EVIDENCE MISSING — heir 'c1' has a narrative but the document has no "Heir Narratives" heading at all
   ... (x4)
PDF STRUCTURE FAIL checks=4 failed=5      (exit 1)
```

All four verdict families were observed firing. After every restoration,
`PDF STRUCTURE PASS sections=18 amounts=21 distinct=2 heirs=4`, exit `0`.

## Deviations from Plan

**[Rule 1 - measured-wrong expectation] `amounts=` cannot reach 5 as a count of distinct values** —
Found during: Task 2 acceptance. The plan expects `amounts=` "at least 5, covering the estate total and
the four heirs' net amounts", but the seeded Alpha case awards all four heirs **the same**
₱1,500,000, so the set of distinct engine amounts has exactly **2** members and no implementation can
make it 5. Fix: the PASS line now reports `amounts=` as the number of money **tokens verified in the
document** (21 — every one of them checked against the engine) and `distinct=` as the set size. The
criterion's intent (the money check really covered the estate total and every heir amount) is met and
is now legible from the output. Nothing was loosened.

**[Rule 1 - injection cannot fire as written] Plan injection 3 is a no-op for this case** — Found
during: Task 3. The plan's third injection is "render only the first entry of `share.legal_basis` and
drop the heir name line" in `PerHeirBreakdownSection.tsx`. For the seeded case that changes nothing
observable: every heir's `legal_basis` has exactly **one** entry, so `slice(0, 1)` is an identity, and
`heir_name` is also printed by `DistributionTableSection` and `NarrativesSection`, so dropping the
breakdown's copy leaves the name in the document. Accepting a green run from that injection would have
been the exact self-deception the plan warns against. Fix: two substitute injections that genuinely
remove the evidence were run instead — the whole `Legal Basis` block, and the whole
`NarrativesSection` — and both were observed firing `HEIR EVIDENCE MISSING` (four heirs each).

**[Rule 1 - injection does not exercise both directions] Plan injection 2 cannot fire
`PDF AMOUNT MISSING`** — Found during: Task 3. The plan's acceptance says the `+1n` distribution-table
injection "also names `PDF AMOUNT MISSING` for the original value". It does not, and correctly so: the
Per-Heir Breakdown still prints the untouched `PHP 1,500,000`, so `150000000` **is** present in the
document and the missing-direction check has nothing to report. Fix: an additional injection was run
against `CaseSummarySection`'s estate total, which appears **nowhere else** in the document, and both
`PDF AMOUNT UNEXPECTED` and `PDF AMOUNT MISSING` were observed firing together. The both-directions
claim is therefore proven — by an injection that can actually prove it.

**Total deviations:** 3, all of them cases where the plan's stated expectation was false against the
real seeded case and was replaced by a stronger observation rather than by a weaker assertion.
**Impact:** The gate is verified more thoroughly than the plan specified (five observed failures
instead of three, covering all four verdict families).

## Issues Encountered

None beyond the deviations above. No point of Philippine law arose: the gate asserts that the engine's
own `legal_basis` string appears in the document, and never that the article is the right one.

## Self-Check: PASSED

- `[ -f frontend/journey/pdf-structure.mjs ]` → yes
- `git log --oneline --all --grep="13-05"` → `9b36b1abd`
- Every task `<acceptance_criteria>` re-run above (with the three documented deviations); the
  plan-level `<verification>` block re-run above
- `git diff --stat frontend/src/` empty; `git status --porcelain` clean of Phase 13 files

## Next

Ready for `13-06` (the perceptual gate), the other wave-3 plan.
