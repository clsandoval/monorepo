# Practice reskin — implemented

Approved direction 01 is implemented through shared theme tokens, a light stone sidebar, burgundy actions, restrained serif headings and flatter controls. The results page uses a wider workspace, table-first distribution and responsive single-source heir rows. PDF export remains visible on mobile. Estate-tax components now use theme tokens instead of hard-coded navy/gold. Special-case fields, citations, warnings, calculations and export implementations are retained.

Validation:
- Production build passes.
- Full frontend suite: 115 files / 2,452 tests pass.
- Live local results rubric: 10/10 assertions pass, real WASM compute in the browser.
- Results checked at 320, 390, 768 and 1440px without horizontal overflow; mobile drawer and chart disclosure exercised.
- Tax form mobile: no horizontal overflow. Cases list and tax form inspected from screenshots.
- Real Export PDF action downloads a valid two-page A4 report.
- No browser console errors in the inspected journeys.

Artifacts: frontend/.journey-runs/practice/ (screenshots, PDF, smoke script and test/build logs). Local Vite preview: http://127.0.0.1:4186.

Not deployed. Existing visual golden images intentionally remain unchanged: journey/REFERENCES.md requires a human to view the new screenshots before reference promotion. The complete repository gate suite was not run; the old navy/gold pixel baselines will need that visual review. No legal-rule or backend changes.
