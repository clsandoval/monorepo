---
phase: 13-pdf-verification
plan: 02
subsystem: journey-harness
tags: [pdf, poppler, probe, gate-g22]
requires: []
provides:
  - "frontend/journey/pdf.mjs — extractPdfText, pdfPageInfo, rasterizePdfPages"
  - "frontend/journey/pdf-probe.mjs — the self-test that becomes gate G22"
affects: []
tech-stack:
  added: []
  patterns:
    - "Single external-tool seam with three named failure prefixes and a three-valued exit contract"
key-files:
  created:
    - frontend/journey/pdf.mjs
    - frontend/journey/pdf-probe.mjs
  modified: []
key-decisions:
  - "The three readers share one runPdfTool helper rather than each holding its own spawnSync call, so the failure classification cannot drift between them. Constraint 2 (single seam) is served better by centralising than by duplicating."
  - "Exit 127 is treated as TOOLCHAIN MISSING alongside ENOENT, since a shell-less spawn reports a missing binary either way depending on environment."
requirements-completed: [PDF-01]
duration: 14 min
completed: 2026-07-31
---

# Phase 13 Plan 02: The PDF-Reading Seam and Its Probe Summary

Built the one module in this repository that reads a PDF — three synchronous readers over poppler's
`pdftotext`, `pdfinfo` and `pdftoppm` — and proved all three against a document generated in the same
run, before any gate depends on them.

- 2 tasks, 2 files, 1 commit (`bff70292c`), 471 insertions
- `journey/pdf.mjs`: `extractPdfText`, `pdfPageInfo`, `rasterizePdfPages`, plus a frozen `PDF_MARKERS`
  with the three literal prefixes. Every reader writes only into an `fs.mkdtempSync` directory removed
  in a `finally`. `maxBuffer` is 64 MiB so a multi-page raster cannot be silently truncated.
- `journey/pdf-probe.mjs`: builds a two-page A4 document at run time with `@react-pdf/renderer` and
  `React.createElement`. **No binary fixture is committed**, so nothing can go stale against the
  renderer. Seven checks, all evaluated, never short-circuiting.
- Page ordering is by the **parsed integer suffix**, not string sort, because `pdftoppm` zero-pads once
  a document reaches ten pages.

## Verification Results — real output

Pass path:
```
$ node journey/pdf-probe.mjs
GATE-SKIPS total=7 skipped=0
PDF PROBE PASS checks=7 pages=2
PROBE_EXIT=0
```
Run a second time: exit `0` again (the probe writes nothing outside its temp directory).

Cannot-run path (`env PATH=/nonexistent "$(which node)" journey/pdf-probe.mjs`):
```
PDF PROBE CANNOT RUN: PDF TOOLCHAIN MISSING: pdftotext is not installed or not on PATH. Install poppler-utils (Debian/Ubuntu: apt-get install poppler-utils).
GATE-SKIPS total=7 skipped=7
MISSING_EXIT=2
```

Failure path — the probe's own `PHP 1,234,567.89` literal temporarily replaced with `₱1,234,567.89`:
```
PROBE TEXT — expected the extracted text to contain all five probe strings; missing: "₱1,234,567.89"
PROBE TEXT CONTIGUOUS — expected "₱1,234,567.89" to survive extraction as one uninterrupted substring; it did not. This is the failure mode 13-RESEARCH.md section 2.4 measured, where an unrepresentable currency mark splits the figure onto its own line.
PROBE NO CORRUPT GLYPH — expected the extracted text to contain neither U+00B1 nor U+20B1; observed U+00B1
GATE-SKIPS total=7 skipped=0
PDF PROBE FAIL checks=7 failed=3
INJECTED_EXIT=1
```
This is the direct confirmation that the seam **would** have caught the defect `13-RESEARCH.md`
section 2 measured: the peso sign really does come back out of the extractor as U+00B1, and the
figure really does stop being contiguous. Literal restored; probe back to exit `0`; tree clean.

Module contract:
```
$ node -e "import('./journey/pdf.mjs').then(...)"
EXPORTS=PDF_MARKERS,extractPdfText,pdfPageInfo,rasterizePdfPages
PDF MODULE OK
$ grep -c "PDF TOOLCHAIN MISSING" frontend/journey/pdf.mjs   -> 2
$ grep -c "spawnSync" frontend/journey/pdf.mjs               -> 5
$ grep -rc "spawnSync\|execSync" frontend/journey/pdf-structure.mjs -> (file absent)
```

## Deviations from Plan

**[Rule 1 - environment] `env PATH=/nonexistent node journey/pdf-probe.mjs` cannot find `node` itself**
— Found during: Task 2. Emptying `PATH` removes the Node binary along with poppler, so the literal
command in the plan fails with `env: 'node': No such file or directory` and exit `127` before the
probe ever starts. Fix: invoke Node by absolute path —
`env PATH=/nonexistent "$(which node)" journey/pdf-probe.mjs` — which removes poppler from `PATH` while
keeping the interpreter reachable. That is the condition the plan intended, and it produced the
expected `MISSING_EXIT=2`.

**[Rule 1 - restore mechanism] `git checkout --` could not restore the injected literal** — Found
during: Task 2. The plan says to restore with `git checkout --`, but `pdf-probe.mjs` was still untracked
at that point in the plan, so there was nothing to check out. Fix: the injection was reverted by the
inverse textual substitution and verified by `grep -n "1,234,567.89"` showing both sites back at
`PHP `, plus two clean exit-`0` runs, before the file was committed.

**Total deviations:** 2, both mechanical (how a command is spelled), neither affecting behaviour.
**Impact:** None. Both negative paths were observed as the plan required.

## Issues Encountered

None.

## Self-Check: PASSED

- `[ -f frontend/journey/pdf.mjs ]` → yes; `[ -f frontend/journey/pdf-probe.mjs ]` → yes
- `git log --oneline --all --grep="13-02"` → `bff70292c`
- All task `<acceptance_criteria>` re-run above; the plan-level `<verification>` block re-run above
  (probe twice at exit 0, emptied `PATH` at exit 2)
- `git status --porcelain apps/inheritance/frontend/journey/` empty after the commit

## Next

Wave 1 is complete. Ready for wave 2 — `13-03` (the shared browser capture of the product's own
Export PDF button) and `13-04` (the print-layout check), both of which import this seam.
