---
phase: 13-pdf-verification
plan: 04
subsystem: journey-harness
tags: [print, css-effects, gate-g25, pdf]
requires:
  - "frontend/journey/pdf.mjs (13-02)"
provides:
  - "frontend/journey/print-layout.mjs — the print-layout gate (becomes G25)"
affects: []
tech-stack:
  added: []
  patterns:
    - "Verify a stylesheet by its rendered effect (computed style + printed bytes), never by its source text"
key-files:
  created:
    - frontend/journey/print-layout.mjs
  modified: []
key-decisions:
  - "The header comment was reworded to avoid the literal token `readFileSync`, because the plan's acceptance criterion is a grep count and a comment mentioning the call would have tripped it. The substance — the script reads no source file — is unchanged."
requirements-completed: [PDF-05]
duration: 15 min
completed: 2026-07-31
---

# Phase 13 Plan 04: Print Layout From Rendered Output Summary

Closed PDF-05 by writing the verification that was missing, not by strengthening a weak one. The
`frontend/src/__tests__/print-layout.test.ts` that `.planning/codebase/TESTING.md:98` describes does
not exist in the tree and has no git history, so nothing here deletes, skips or loosens a test.

`frontend/journey/print-layout.mjs` asserts seven properties, every one read from what the browser
computed or printed:

| Marker | Source of truth |
|---|---|
| `PRINT FONT FAMILY` | `getComputedStyle(document.body).fontFamily` under print media |
| `PRINT FONT SIZE` | same, `fontSize`, expected `16px` (12pt at 96 dpi) |
| `PRINT CHROME VISIBLE` | computed `display` of every `nav`, `[data-sidebar]`, `.sidebar`, `.no-print` |
| `PRINT ONLY HIDDEN` | `.print-header` computed `display`, compared **screen vs print** |
| `PRINT PAGE SIZE` | `pdfinfo` over the document `page.pdf()` produced |
| `PRINT TOP MARGIN` | first inked raster row at 100 dpi, threshold 90 px |
| `PRINT LEFT MARGIN` | first inked raster column at 100 dpi, threshold 70 px |

`page.pdf({ preferCSSPageSize: true })` — no `margin` argument, so paper size and margins come from
the document's own `@page` rule rather than from something the check supplied itself.

## Verification Results — real output

```
$ grep -c "css" frontend/journey/print-layout.mjs          -> 0
$ grep -c "readFileSync" frontend/journey/print-layout.mjs -> 0

$ node journey/print-layout.mjs
GATE-SKIPS total=7 skipped=0
PRINT LAYOUT PASS checks=7 topInk=126 leftInk=97
PRINT_EXIT=0
```
Run twice, identical output, exit `0` both times.

**Injection 1 — `margin: 25mm 20mm` → `margin: 0` in `print.css`, rebuilt:**
```
PRINT TOP MARGIN — expected the first ink on page 1 to be at least 90 px from the top edge at 100 dpi (25 mm is 98.4 px); observed 33 px on a 827x1170 raster
PRINT LEFT MARGIN — expected the first ink on page 1 to be at least 70 px from the left edge at 100 dpi (20 mm is 78.7 px); observed 34 px on a 827x1170 raster
GATE-SKIPS total=7 skipped=0
PRINT LAYOUT FAIL checks=7 failed=2
INJECT1_EXIT=1
```
This is the load-bearing observation: the margin scan really is measuring the printed page. Ink moved
from 126/97 px to 33/34 px when the `@page` margin was removed.

**Injection 2 — the `nav, [data-sidebar], .sidebar` rule's `display: none !important` →
`display: block !important`, rebuilt:**
```
PRINT CHROME VISIBLE — selector "nav" matched 1 element(s) under print media but only 0 computed display:none; 1 would still print
GATE-SKIPS total=7 skipped=0
PRINT LAYOUT FAIL checks=7 failed=1
INJECT2_EXIT=1
```

Both restored with `git checkout -- frontend/src/styles/print.css`;
`git diff --stat frontend/src/` is empty, and the restored run is
`PRINT LAYOUT PASS checks=7 topInk=126 leftInk=97`, exit `0`.

Frontend ledger gate after the work:
```
GATE OK — test baseline matches exactly
  total tests run     : 2470 (floor 2416)
  known failures met  : 46
GATE_EXIT=0
```

## Deviations from Plan

**[Rule 1 - grep-literal] The header comment could not say `readFileSync`** — Found during: Task 1
acceptance. The plan requires `grep -c "readFileSync" …` to print `0`, and the comment explaining that
the script deliberately does not call it contained the token, producing `1`. Fix: the sentence now
reads "reads no source file off disk at all". No behaviour changed; the count is `0`.

**Total deviations:** 1, a comment wording change.
**Impact:** None.

## Issues Encountered

None.

## Self-Check: PASSED

- `[ -f frontend/journey/print-layout.mjs ]` → yes
- `git log --oneline --all --grep="13-04"` → `04684302c`
- Every task `<acceptance_criteria>` re-run above; the plan-level `<verification>` block (two runs)
  re-run above
- `git status --porcelain apps/inheritance/frontend/journey/ apps/inheritance/frontend/src/` empty

## Next

Wave 2 is complete. Ready for wave 3 — `13-05` (structure, money, citations) and `13-06` (perceptual),
both of which consume `captureExportedPdf` from `13-03`.
