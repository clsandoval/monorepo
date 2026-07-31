---
phase: 13
slug: pdf-verification
status: planned
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-31
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 (frontend units), the `frontend/journey/` harness (browser + diff), plain Node ESM scripts (structure, visual, print layout), poppler 22.02.0 CLI (`pdftotext`, `pdftoppm`, `pdfinfo`) |
| **Config file** | `frontend/vitest.config.ts`. The PDF checks have no config file by design — a reference image plus its `maxDiffPixels` sidecar is the whole configuration |
| **Quick run command** | `cd frontend && node journey/pdf-probe.mjs` — no Docker, no Supabase, no browser, no build |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | `pdf-probe` under 5 s. Each of the three browser-driving checks builds the app once; Phase 12 measured the whole 20-gate set at 4 m 12 s, and this phase adds three builds plus three browser sessions |

---

## Sampling Rate

- **After every task commit:** run the single named command in that task's `<verify>` block.
- **After every plan wave:** `cd frontend && node journey/pdf-probe.mjs` (seconds), then the
  wave's own browser check.
- **Before `/gsd:verify-work`:** `bash scripts/ci-gates.sh` must print `ALL GATES PASSED (24/24)`.
- **Max feedback latency:** under 5 seconds for `pdf-probe.mjs`, which is the check every
  text-extraction and rasterisation edit is measured by first.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | PDF-02 | — | N/A | unit | `cd frontend && npx vitest run src/components/pdf/__tests__/pdf-text.test.ts` | ❌ this plan | ⬜ pending |
| 13-01-02 | 01 | 1 | PDF-02 | — | N/A | unit | `cd frontend && npx vitest run src/components/pdf` | ✅ | ⬜ pending |
| 13-01-03 | 01 | 1 | PDF-02 | — | N/A | ledger + typecheck | `cd frontend && npm run test:gate && npx tsc -b --force` | ✅ | ⬜ pending |
| 13-02-01 | 02 | 1 | PDF-01 | T-13-02 | A missing poppler binary exits 2, never 0 | integration | `cd frontend && node journey/pdf-probe.mjs` | ❌ this plan | ⬜ pending |
| 13-02-02 | 02 | 1 | PDF-01 | T-13-02 | Rasterisation proven byte-identical across two runs | integration | `cd frontend && node journey/pdf-probe.mjs` | ❌ this plan | ⬜ pending |
| 13-03-01 | 03 | 2 | PDF-01 | — | N/A | unit | `cd frontend && npx vitest run src/components/results/__tests__/ActionsBar.test.tsx` | ✅ | ⬜ pending |
| 13-03-02 | 03 | 2 | PDF-01 | T-13-03 | A capture that yields no PDF exits 2, never a zero-byte pass | integration | `cd frontend && node journey/pdf-capture-probe.mjs` | ❌ this plan | ⬜ pending |
| 13-04-01 | 04 | 2 | PDF-05 | — | N/A | integration | `cd frontend && node journey/print-layout.mjs` | ❌ this plan | ⬜ pending |
| 13-04-02 | 04 | 2 | PDF-05 | T-13-04 | An injected zero margin and an injected visible nav each fail the check | integration | `cd frontend && node journey/print-layout.mjs` | ❌ this plan | ⬜ pending |
| 13-05-01 | 05 | 3 | PDF-01, PDF-03 | — | N/A | integration | `cd frontend && node journey/pdf-structure.mjs` | ❌ this plan | ⬜ pending |
| 13-05-02 | 05 | 3 | PDF-02 | T-13-05 | A one-centavo change to any displayed amount fails the check | integration | `cd frontend && node journey/pdf-structure.mjs` | ❌ this plan | ⬜ pending |
| 13-05-03 | 05 | 3 | PDF-01, PDF-02, PDF-03 | T-13-05 | Three injections observed firing, each restored | integration | `cd frontend && node journey/pdf-structure.mjs` | ❌ this plan | ⬜ pending |
| 13-06-01 | 06 | 3 | PDF-04 | T-13-06 | The visual gate cannot write its own reference | integration | `cd frontend && node journey/pdf-visual.mjs` | ❌ this plan | ⬜ pending |
| 13-06-02 | 06 | 3 | PDF-04 | T-13-06 | A page appearing or disappearing fails on count before any pixel is compared | integration | `cd frontend && node journey/pdf-visual.mjs` | ❌ this plan | ⬜ pending |
| 13-07-01 | 07 | 4 | PDF-01…PDF-05 | — | N/A | static | `node scripts/check-gate-manifest.mjs` | ✅ | ⬜ pending |
| 13-07-02 | 07 | 4 | PDF-01…PDF-05 | — | N/A | full suite | `bash scripts/ci-gates.sh` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No framework is installed and no npm dependency is added anywhere in this phase. Everything the phase
needs was verified present during planning by running it:

| Prerequisite | How it was verified | Result |
|---|---|---|
| `@react-pdf/renderer` renders in plain Node | a `React.createElement` document written to disk | `PDF bytes = 2087 magic = %PDF-` |
| `pdftotext` | `pdftotext out.pdf -` | text extracted |
| `pdftoppm` | `pdftoppm -png -r 100 out.pdf p1` twice | identical `md5sum` both times |
| `pdfinfo` | `pdfinfo out.pdf` | `Page size: 595.28 x 841.89 pts (A4)` |
| `playwright` 1.56.1 with `clock.setFixedTime` | `node_modules/playwright-core/types/types.d.ts` | method present, documented as keeping timers running |
| `pixelmatch` 7.2.0, `pngjs` 7.0.0 | `frontend/package.json` devDependencies | present, already used by `journey/diff.mjs` |
| Compiled engine | `engine/target/release/inheritance-engine < engine/examples/cases/02-married-3lc.json` | 4 heirs, 600000000 centavos, scenario `I2` |

The one thing that is **not** guaranteed present on an arbitrary machine is poppler. Plan `13-02`
makes that a first-class, self-reporting condition: `journey/pdf.mjs` throws
`PDF TOOLCHAIN MISSING:` and every consumer maps it to exit `2` (cannot run), never exit `0` and never
exit `1`. Plan `13-07` installs `poppler-utils` and `fonts-urw-base35` in the CI workflow.

---

## Manual-Only Verifications

| Behavior | Requirement | Why manual | Test instructions |
|----------|-------------|------------|-------------------|
| A rasterised PDF page is the page a human agrees is correct | PDF-04 | Approval is what makes a reference mean anything, and `journey/REFERENCES.md` deliberately leaves that step commandless. The gate that follows is fully automated and cannot write its own reference. | Run `cd frontend && node journey/pdf-visual.mjs`, open `.journey-runs/<stamp>/pdf/page-<n>.png`, then `node journey/pdf-approve.mjs` |

Every other phase behavior has an automated verification command in the table above.

---

## Threat References

| Ref | Threat | Plan | Mitigation asserted by |
|---|---|---|---|
| T-13-02 | poppler absent on a runner, and the PDF checks silently report success on empty text | 13-02 | Empty extracted text and a missing binary are both distinct named failures; the probe is observed exiting 2 with `PATH` emptied |
| T-13-03 | The capture returns a zero-byte or non-PDF file and downstream checks pass vacuously | 13-03 | The captured buffer must begin with the bytes `%PDF-` and exceed 1000 bytes, or the run exits 2 |
| T-13-04 | Print layout "verified" by reading CSS text rather than rendered output | 13-04 | Every assertion reads `getComputedStyle` under print media emulation or `pdfinfo` output; `grep` over the script for `print.css` must return 0 |
| T-13-05 | A money figure in the PDF drifting from the engine without any gate noticing | 13-05 | Every `PHP` token in the extracted text must parse to a centavo integer the engine produced in the same run, and every engine amount must appear |
| T-13-06 | A visual gate that turns itself green by rewriting its own reference | 13-06 | `journey/pdf-visual.mjs` contains no write call into `journey/pdf-references/`; only `journey/pdf-approve.mjs` writes there, and no gate invokes it |

---

## Validation Sign-Off

- [x] All tasks have an automated `<verify>` command or an explicit Wave dependency
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — none are missing
- [x] No watch-mode flags anywhere (`vitest run`, never `vitest`)
- [x] Feedback latency < 30 s for the per-task command in plans 13-01 and 13-02
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
