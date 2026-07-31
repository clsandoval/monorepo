---
phase: 13-pdf-verification
plan: 06
subsystem: journey-harness
tags: [pdf, perceptual-diff, references, gate-g24]
requires:
  - "frontend/journey/pdf-capture.mjs (13-03)"
  - "frontend/journey/pdf.mjs (13-02)"
  - "frontend/journey/diff.mjs (Phase 10)"
provides:
  - "frontend/journey/pdf-visual.mjs — the perceptual gate (becomes G24)"
  - "frontend/journey/pdf-approve.mjs — the only writer into pdf-references/"
  - "frontend/journey/pdf-references/ — two approved page images at maxDiffPixels 0"
affects:
  - "frontend/journey/REFERENCES.md (one appended section)"
tech-stack:
  added: []
  patterns:
    - "Second reference store with its own approval command, so gate G16's registry contract stays untouched"
key-files:
  created:
    - frontend/journey/pdf-visual.mjs
    - frontend/journey/pdf-approve.mjs
    - frontend/journey/pdf-references/README.md
    - frontend/journey/pdf-references/page-1.png
    - frontend/journey/pdf-references/page-1.json
    - frontend/journey/pdf-references/page-2.png
    - frontend/journey/pdf-references/page-2.json
  modified:
    - frontend/journey/REFERENCES.md
key-decisions:
  - "The first run fails with PDF PAGE COUNT, not per-page REFERENCE MISSING, because page-count-first is a plan constraint and zero approved references is a count mismatch. REFERENCE MISSING was observed separately by removing one sidecar while leaving both PNGs, which keeps the count equal."
  - "Approval is whole-document and takes no arguments, so a half-approved reference set describing a document that never existed is unreachable."
requirements-completed: [PDF-04]
duration: 20 min
completed: 2026-07-31
---

# Phase 13 Plan 06: Perceptual PDF Page Diff Summary

Every page of the estate report the product's own Export button produces is now pinned to an approved
image at `maxDiffPixels` `0`.

- 3 tasks (one a human-verify checkpoint), 8 files, 1 commit (`b75803e98`), 345 insertions
- `pdf-visual.mjs` has **no write path into `journey/pdf-references/`**. Its only two write calls,
  `fs.mkdirSync` and `fs.writeFileSync` at lines 88 and 90, both target `.journey-runs/`; per-page
  failure artifacts go through `writeStepArtifacts`, which by its own contract writes only under
  `ARTIFACT_ROOT`.
- `pdf-approve.mjs` takes no arguments, sources only from `.journey-runs/<newest>/pdf/page-<n>.png`,
  and deletes references beyond the approved page count.
- The images live outside `journey/references/` so `scripts/check-journey-registry.mjs` (G16) needs no
  change. That gate still exits `0`: `JOURNEY REGISTRY ok steps=33 references=33`.

## Checkpoint — what was actually looked at

Both page images were opened and inspected against the plan's five criteria before anything was
approved. Config is `auto_advance=true`, so the checkpoint auto-approved, but the approval was not
blind:

1. Page 1 opens `Estate of Pedro`, and carries `Date of Death: 2026-01-15` and
   `Report Generated: 2026-06-15` — the pinned clock, visible on the page.
2. Every amount reads `PHP 6,000,000` or `PHP 1,500,000`. **No glyph is overprinted on any digit** —
   plan `13-01`'s fix is visibly working in the rasterised output, which is the first end-to-end
   confirmation of it.
3. `Distribution of Shares`, `Per-Heir Breakdown`, `Heir Narratives` (page 1), `Computation Log` and
   `Disclaimer` (page 2) all appear.
4. Neither page is blank and no text is clipped: the break falls cleanly between Ana's narrative and
   Ben's.

**Three pre-existing cosmetic defects were seen and deliberately not fixed** — no Phase 13 plan
authorises changing them, and `13-01`'s interface explicitly says `toPdfSafeText` strips no markdown:

- Citations render as `Art. 996: Art. 996`. `NCC_ARTICLE_DESCRIPTIONS` has no entry for that key, so
  `PerHeirBreakdownSection` falls back to printing the key twice.
- Narrative bodies print raw markdown: `**Ana (legitimate child)** receives **PHP 1,500,000**`.
  `@react-pdf/renderer` does not parse markdown, and the engine emits it.
- `Legitime Fraction: 0` renders a bare `0` rather than a fraction.

These are now **pinned by the approved references**, so any future change to them becomes a visible,
reviewable diff rather than a silent drift. Recorded here for the owner.

## Verification Results — real output

```
$ node journey/pdf-visual.mjs          # before any approval existed
PDF PAGE COUNT — the document rasterised to 2 page(s) but the approved reference set holds 0. No pixel comparison was attempted; a page appearing or disappearing is a structural change. ...
GATE-SKIPS total=2 skipped=0
PDF VISUAL FAIL pages=2 failed=1
VISUAL_EXIT=1

$ ls journey/pdf-references/           # the gate approved nothing
README.md

$ node journey/pdf-approve.mjs
PDF APPROVE OK pages=2 from=2026-07-31T22-17-08-563Z     (exit 0)

$ node journey/pdf-visual.mjs
GATE-SKIPS total=2 skipped=0
PDF VISUAL PASS pages=2 diffPixels=0                     (RUN1=0)
$ node journey/pdf-visual.mjs
PDF VISUAL PASS pages=2 diffPixels=0                     (RUN2=0)
```
Two consecutive `diffPixels=0` runs, **each regenerating the document from scratch** — build, browser,
click, download, rasterise. That is the evidence the raster is stable.

### Three observed failures, each restored

**`Disclaimer` → `Disclaimer Notice` in `DisclaimerSection.tsx`:**
```
DIFF FAILURE — page 2, 100 differing pixels against a tolerance of 0
PDF VISUAL FAIL pages=2 failed=1     (exit 1)
```

**An extra `<Page size="A4">` in `EstatePDF.tsx`:**
```
PDF PAGE COUNT — the document rasterised to 3 page(s) but the approved reference set holds 2. No pixel comparison was attempted; a page appearing or disappearing is a structural change. ...
PDF VISUAL FAIL pages=3 failed=1     (exit 1)
```
No pixel comparison attempted, as required.

**`page-2.json` sidecar removed, both PNGs left in place so the count still matches:**
```
REFERENCE MISSING — page 2, no differing pixels against a tolerance of n/a (no approved reference)
PDF VISUAL FAIL pages=2 failed=1     (exit 1)
```

After every restoration: `git diff --stat frontend/src/` empty, `PDF VISUAL PASS pages=2
diffPixels=0`, exit `0`. Both sidecars contain exactly `{"maxDiffPixels": 0}`.

Neighbouring gates undisturbed:
```
$ node journey/money-parity.mjs                MONEY PARITY PASS heirs=4 centavos=600000000   (exit 0)
$ node scripts/check-journey-registry.mjs      JOURNEY REGISTRY ok steps=33 references=33     (exit 0)
$ git status --porcelain frontend/journey/references/ frontend/journey/steps/ frontend/journey/rubrics/ scripts/check-journey-registry.mjs
  (empty)
```

## Deviations from Plan

**[Rule 1 - two plan requirements conflict] The first run names `PDF PAGE COUNT`, not
`REFERENCE MISSING` per page** — Found during: Task 1 acceptance. The plan requires both that the page
count be checked *before any pixel comparison* (constraint in `<interfaces>` step 5, and a stated
success criterion) and that the first, pre-approval run name `REFERENCE MISSING` once per page. Those
cannot both hold: with zero approved references, 2 ≠ 0 is a count mismatch and the count check fires
first by design. The page-count-first rule was kept, because weakening it to satisfy the other
criterion would have removed a stated success criterion. `REFERENCE MISSING` was then observed
properly, by removing one page's **sidecar JSON** while leaving both PNGs — which keeps the counts
equal and routes execution into `compareToReference`, where a missing sidecar is as fatal as a missing
image. Both behaviours are therefore proven, and neither was traded away.

**Total deviations:** 1.
**Impact:** The gate has three observed failure modes rather than the two the plan listed.

## Issues Encountered

**Recorded as a risk, not a claim.** The PDF's fonts are not embedded, so poppler substitutes from the
system font package. A different poppler version or substitution font package will rasterise
differently, and this project's CI has still never executed. This is the same exposure Phases 11 and
12 accepted for their browser references. Plan `13-07` installs `poppler-utils` and
`fonts-urw-base35` explicitly.

## Self-Check: PASSED

- `[ -f frontend/journey/pdf-visual.mjs ]`, `[ -f frontend/journey/pdf-approve.mjs ]`,
  `[ -f frontend/journey/pdf-references/page-1.png ]` → all yes
- `git log --oneline --all --grep="13-06"` → `b75803e98`
- Every task `<acceptance_criteria>` re-run above (with the one documented deviation); the plan-level
  `<verification>` block, all four commands, re-run above
- `git status --porcelain apps/inheritance/frontend/journey/` clean after the commit

## Next

Wave 3 is complete. Ready for wave 4 — `13-07`, which registers G22–G25 and renumbers the tail of the
manifest.
