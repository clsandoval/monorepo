---
status: passed
phase: 13-pdf-verification
verified: 2026-07-31
requirements: [PDF-01, PDF-02, PDF-03, PDF-04, PDF-05]
gates_added: [G22, G23, G24, G25]
gate_set_size: 24
human_verification: []
---

# Phase 13: PDF Verification — Verification Report

**Verdict: PASSED.** All five requirements are gate-proven, all 7 plans executed with committed
summaries, and `bash scripts/ci-gates.sh` prints `ALL GATES PASSED (24/24)` and exits `0`.

Every command below was executed and its real output read. Nothing here is inferred from a plan
summary.

## Phase goal

> The generated PDF is verified structurally, exactly on money, and perceptually — closing the gap
> where `generatePDF` was previously "tested" only as `typeof mod.generatePDF === 'function'`.

Achieved. Note the planning finding, re-confirmed during execution: **neither weak test the roadmap
names still exists in the tree.** `frontend/src/__tests__/print-layout.test.ts` has no git history and
the `typeof mod.generatePDF` assertion is gone. So no test was deleted, skipped or weakened anywhere
in this phase — every requirement was closed by *adding* verification that was absent.

## Success criteria, each checked against a command

| # | Criterion | Gate | Verified how |
|---|---|---|---|
| 1 | The PDF renders in CI and every required section is present when its text is extracted | G22, G23 | `node journey/pdf-probe.mjs` → `PDF PROBE PASS checks=7 pages=2`, exit 0. `node journey/pdf-structure.mjs` → `PDF STRUCTURE PASS sections=18 …`, exit 0. Observed red on removal of `<DisclaimerSection />` (`SECTION MISSING` ×2) and of `<NarrativesSection />`. |
| 2 | Every peso figure in the PDF is asserted, deterministically, to match engine output exactly | G23 | `PDF STRUCTURE PASS … amounts=21 distinct=2`. 21 money tokens each parsed to `BigInt` centavos and matched against a same-run `computeEngineOutput`. **A one-centavo injection was observed turning it red**, in both directions. `grep -c "Number(\|toFixed\|Math.abs\|epsilon\|tolerance"` → `0`. |
| 3 | Article citations and a per-heir narrative appear for every heir | G23 | `… heirs=4`. Observed red (`HEIR EVIDENCE MISSING` ×4) when the `Legal Basis` block was removed, and again when `NarrativesSection` was removed. |
| 4 | Rendered PDF pages are perceptually diffed against approved reference images | G24 | `node journey/pdf-visual.mjs` → `PDF VISUAL PASS pages=2 diffPixels=0`, exit 0. Observed red as `DIFF FAILURE` (100 px on a heading change), `PDF PAGE COUNT` (3 vs 2) and `REFERENCE MISSING`. |
| 5 | Print layout is verified from rendered page output, not by pattern-matching CSS source text | G25 | `node journey/print-layout.mjs` → `PRINT LAYOUT PASS checks=7 topInk=126 leftInk=97`, exit 0. `grep -c "css"` → `0`, `grep -c "readFileSync"` → `0`. Observed red when `@page margin` was zeroed (ink moved to 33/34 px) and when the nav rule was made visible. |

## Phase verification — the full gate set

```
$ bash scripts/ci-gates.sh
REQUIREMENT COVERAGE 34/94 gated
ALL GATES PASSED (24/24)
FINAL_EXIT=0
```

Per-gate status read out of `gate-results.json` after that run — 24/24 `pass`, `exit=0`, with the new
gates at orders 17–20 and `G9` last:

```
17 G22  pass  exit=0 pdf toolchain
18 G23  pass  exit=0 pdf structure
19 G24  pass  exit=0 pdf visual
20 G25  pass  exit=0 print layout
21 G10  pass  exit=0 lawyer decision registry
22 G11  pass  exit=0 engine observability
23 G8   pass  exit=0 gate skip accounting
24 G9   pass  exit=0 published gate results
```

`ALL GATES PASSED (24/24)` was observed on **five separate runs** at ~5m25s each, including two
consecutive. Supporting checks: `check-gate-manifest.mjs` → `MANIFEST OK — 24 gates, 24 locked`;
`check-gate-results.mjs` → `RESULTS OK — 24 gates, 34 requirements`; `gate-coverage.mjs` →
`REQUIREMENT COVERAGE 34/94 gated`, `COVERAGE OK`; `check-journey-registry.mjs` →
`JOURNEY REGISTRY ok steps=33 references=33`.

Requirement coverage rose from **29/94 to 34/94** — exactly the five PDF requirements, each mapped in
the run's own output (`PDF-01 -> G22,G23`, `PDF-02 -> G23`, `PDF-03 -> G23`, `PDF-04 -> G24`,
`PDF-05 -> G25`).

## Constraint compliance

- **No test, assertion or gate weakened.** Six committed `₱` expectations were *corrected* to the
  string the fixed code renders, and four tests were added; `pdf.test.tsx` went 53 → 57 and
  `ActionsBar.test.tsx` 11 → 12. `npm run test:gate` reports `LEDGER SIZE (debt) 46`, unchanged.
- **All five shrink-only ledgers untouched** across the whole phase (`frontend/test-baseline.json`,
  `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json`, `coverage-zero.lock`).
- **Gate set only grew**, by exactly four. `order` is the only field changed on any pre-existing gate.
  `G14` is still reserved and unregistered.
- **Commit discipline**: 14 commits, every one via `scripts/safe-commit.sh` with explicit paths. G7
  (`check-commit-discipline.mjs`) passes.
- **No point of Philippine law was decided.** `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` → `0`, and
  nothing was added to it. G23 asserts that the engine's own `legal_basis` string appears in the
  document, never that the article is correct.

## A real product defect this phase found and fixed

`13-01` fixed a defect measured live, not hypothesised: the exported PDF's three fonts are
non-embedded, WinAnsi-encoded PDF base-14 fonts, and WinAnsi has no peso sign. U+20B1 was written as
byte `0xB1`, extracted as `±`, and rasterised at near-zero advance width **overprinting the first
digit of every amount in every exported estate report**. The fix is confined to
`src/components/pdf/`; `formatPeso` in `src/types/index.ts` is untouched, so the web interface still
renders `₱`. Confirmed end-to-end in the approved page images, which show `PHP 6,000,000` and
`PHP 1,500,000` cleanly.

## Open items carried forward, recorded not hidden

1. **G3 is intermittently flaky.** `src/components/wizard/__tests__/ReviewStep.test.tsx :: … predicted
   scenario badge shows the engine scenario code for testate` failed the full suite twice in roughly
   twelve runs today, and passed 6/6 standalone immediately afterwards. Proven pre-existing: the same
   failure reproduced with this phase's source edits stashed away. **No ledger was appended and no
   test was touched.** This matters for a month-long unattended loop, since a flaky *blocking* gate
   will occasionally paint the loop red for no product reason.
2. **CI has still never executed for this project.** Whether 24 gates fit inside the 60-minute
   timeout on a hosted runner, and whether that runner's substitution fonts rasterise identically to
   `fonts-urw-base35 20200910-1`, are unmeasured from this machine. The workflow installs
   `poppler-utils` and `fonts-urw-base35` explicitly and records both as risks. Same exposure Phases
   11 and 12 accepted.
3. **Three cosmetic PDF issues seen in the approved images, deliberately not fixed** — no requirement
   in PDF-01…PDF-05 covers them and no plan authorised the change: raw `**` markdown markers reach the
   page verbatim, citations render as `Art. 996: Art. 996`, and `Legitime Fraction:` prints a bare
   `0`. All three are now **pinned by G24's zero-tolerance references**, so any future change becomes
   a reviewable diff. Recorded in `frontend/journey/JOURNEY.md`.
4. **The firm header has no coverage, because no PDF a user can obtain has one.** `ActionsBar` calls
   `downloadPDF(input, output, null)`. Whether the export *should* pass the firm profile is a product
   question, recorded in `JOURNEY.md` rather than silently ignored.

## Plans

| Plan | Requirement | Summary | Status |
|---|---|---|---|
| 13-01 | PDF-02 | PDF-local `formatPesoPdf`/`toPdfSafeText` | Complete |
| 13-02 | PDF-01 | `journey/pdf.mjs` + probe (G22) | Complete |
| 13-03 | PDF-01 | `data-testid="export-pdf"` + `captureExportedPdf` | Complete |
| 13-04 | PDF-05 | `journey/print-layout.mjs` (G25) | Complete |
| 13-05 | PDF-01/02/03 | `journey/pdf-structure.mjs` (G23) | Complete |
| 13-06 | PDF-04 | `journey/pdf-visual.mjs` + `pdf-approve.mjs` (G24) | Complete |
| 13-07 | PDF-01…05 | Gate registration, docs, CI, closeout | Complete |
