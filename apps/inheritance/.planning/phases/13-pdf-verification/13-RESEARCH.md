# Phase 13 Research — PDF Verification

**Measured:** 2026-07-31, live in this tree. Every number, glyph and command output below was
produced by running the command shown, not recalled.

Requirements in scope: **PDF-01, PDF-02, PDF-03, PDF-04, PDF-05**.

---

## 1. What exists today

### 1.1 The generation path

`frontend/src/lib/pdf-export.ts` (84 lines) is the whole public surface:

| Export | Behaviour |
|---|---|
| `slugifyName(name)` | lower-cases, strips punctuation, hyphenates |
| `buildPDFFilename(name, date?)` | `estate-<slug>-<YYYY-MM-DD>.pdf`, defaulting the date to `new Date()` |
| `generatePDF(input, output, profile, options)` | dynamically imports `@react-pdf/renderer` and `../components/pdf/EstatePDF`, calls `pdf(doc).toBlob()` |
| `downloadPDF(...)` | `generatePDF`, then `URL.createObjectURL` → detached `<a download>` → `a.click()` → `URL.revokeObjectURL(url)` |

`frontend/src/components/results/ActionsBar.tsx:45-53` is the only caller. It runs
`downloadPDF(input, output, null)` — **the firm profile is always `null` on the real product path**,
so `FirmHeaderSection` never renders in a PDF a user can actually obtain. The button carries no
`data-testid`.

### 1.2 The document

`frontend/src/components/pdf/EstatePDF.tsx` renders one `<Page size="A4">` with
`fontFamily: 'Times-Roman'`, `fontSize: 10`, and padding `30mm/25mm/38mm/25mm`. Eight section
components, in order:

| Section | Component | Rendered when |
|---|---|---|
| Firm header | `FirmHeaderSection` | `options.includeFirmHeader && profile` — never, on the product path |
| Case summary | `CaseSummarySection` | always |
| Distribution table | `DistributionTableSection` | always |
| Per-heir breakdown | `PerHeirBreakdownSection` | always |
| Heir narratives | `NarrativesSection` | returns `null` when `narratives.length === 0` |
| Computation log | `ComputationLogSection` | always |
| Warnings | `WarningsSection` | returns `null` when `warnings.length === 0` |
| Disclaimer | `DisclaimerSection` | always |

### 1.3 The verification gap the ROADMAP names

`.planning/codebase/TESTING.md:81` records `generatePDF` being "tested" only as
`expect(typeof mod.generatePDF).toBe('function')`. **That assertion is no longer in the tree** —
`grep -rn "typeof.*generatePDF" frontend/src` returns nothing and
`frontend/src/lib/__tests__/pdf-export.test.ts` is 202 lines covering only `slugifyName`,
`buildPDFFilename` and `DEFAULT_PDF_OPTIONS`. The gap is therefore not a weak assertion to delete;
it is **total absence**: no test anywhere calls `generatePDF`, and
`frontend/src/components/pdf/__tests__/pdf.test.tsx` (820 lines) asserts on the React element tree
via `@testing-library/react`, never on PDF bytes.

`.planning/codebase/TESTING.md:98` likewise names `frontend/src/__tests__/print-layout.test.ts` as
asserting the *source text* of `frontend/src/styles/print.css`. **That file does not exist either** —
`find frontend -name "print-layout.test.ts"` returns nothing and
`git log --all -- '**/print-layout.test.ts'` is empty. `frontend/src/styles/print.css` (40 lines) does
exist and is imported by `src/index.css:4`. So PDF-05 is likewise absence, not weakening: there is
**no** verification of print layout at all, from rendered output or from CSS text.

Consequence for planning: **no test, assertion or file is deleted anywhere in Phase 13.** Every
requirement is closed by adding verification that did not previously exist.

---

## 2. The measured blocker: `₱` does not survive into the PDF

### 2.1 What was run

A standalone Node script built a `@react-pdf/renderer` document with `React.createElement` (no JSX,
no TypeScript), from `apps/inheritance/frontend`, and wrote the bytes to disk:

```
PDF bytes = 2087 magic = %PDF-
```

So **`@react-pdf/renderer` renders a real PDF in plain Node**, outside a browser and outside vitest.
That is the foundation the whole phase rests on.

### 2.2 The corruption

`pdftotext out.pdf - | cat -A` on that PDF:

```
Estate of Juan dela Cruz$
Net Distributable Estate: M-BM-1$
1,000,000.00$
Distribution of Shares$
Maria Santos Legitimate Child OwnRight M-BM-1$
500,000.00$
Art. 888: The legitime of legitimate children$
Disclaimer$
```

`M-BM-1` is `cat -A` for the bytes `C2 B1`, which is UTF-8 for **U+00B1 PLUS-MINUS SIGN**. The source
string was `₱` — **U+20B1 PESO SIGN**. `0x20B1 & 0xFF = 0xB1`, which is the low-byte truncation a
WinAnsi encoder performs on a code point it cannot represent.

`pdffonts out.pdf` explains why:

```
name                     type       encoding    emb sub uni
Times-Bold               Type 1     WinAnsi     no  no  no
Times-Roman              Type 1     WinAnsi     no  no  no
Helvetica                Type 1     WinAnsi     no  no  no
```

All three fonts are PDF base-14: **not embedded**, WinAnsi-encoded. WinAnsi has no peso sign.

### 2.3 It is visibly wrong, not merely an extraction artefact

`pdftoppm -png -r 150 -x 200 -y 250 -W 900 -H 200 out.pdf crop` and viewing the image shows
`₱500,000.00` drawn as `500,000.00` with a stray mark struck through the leading `5`: the substituted
glyph is emitted at (or near) zero advance width, so it overprints the first digit. A lawyer reading
the exported PDF sees a corrupted currency mark on every amount.

### 2.4 It also breaks deterministic text assertions

Note the extraction above: the amount landed on a **separate line** from its label. That is not
`-layout` grouping — the run above is plain `pdftotext`. Any PDF-01/PDF-02/PDF-03 assertion of the
form "the extracted text contains `Net Distributable Estate: ₱6,000,000`" is unimplementable while
the glyph is broken.

### 2.5 The fix, measured

The same probe with `PHP ` substituted for `₱` extracts cleanly:

```
Estate of Juan dela Cruz$
Net Distributable Estate: PHP 1,000,000.00$
Distribution of Shares$
Maria Santos Legitimate Child OwnRight PHP 500,000.00$
Art. 888: The legitime of legitimate children$
Disclaimer$
```

One line per label, contiguous, ASCII, and byte-stable.

### 2.6 Why the fix is a PDF-local formatter and nothing else

Four alternatives were checked and each is closed off by a measurement:

| Alternative | Why it is not available |
|---|---|
| Register a Unicode font with `Font.register` | `find node_modules/@fontsource-variable -type f \| sed 's/.*\.//' \| sort -u` yields only `css json md scss woff2`. `@react-pdf/renderer` cannot load `woff2`, and no `.ttf`/`.otf`/`.woff` exists anywhere in the dependency tree. |
| Point `Font.register` at a system font path | The path differs between this machine and a CI container, which is the non-reproducibility this project exists to remove. |
| Change `formatPeso` in `src/types/index.ts:509` | It is the web UI's formatter. Changing it changes every screen and every committed expectation across the frontend suite, and the web UI renders `₱` correctly because a browser has a peso glyph. |
| Change the Rust engine's narrative formatter | The `₱` in `narratives[].text` is engine output (measured below). Editing it rewrites committed Rust expectations for a browser-display problem the engine does not have. |

**Decision, locked for the phase:** a new PDF-only module `frontend/src/components/pdf/pdf-text.ts`
exports `formatPesoPdf(centavos)` emitting `PHP ` followed by the same digits `formatPeso` produces,
and `toPdfSafeText(text)` replacing every U+20B1 with `PHP `. Only the eight PDF section components
use them. `PHP` is the ISO 4217 alphabetic code for the Philippine peso, so no wording is invented.

Six committed expectations in `frontend/src/components/pdf/__tests__/pdf.test.tsx` assert `'₱…'`
(lines 453, 525, 578, 619, 630, 641). They are **corrected to the new rendered string**, following the
Phase 8 precedent recorded in `.planning/STATE.md`: where a committed expectation asserts behaviour
that has been shown wrong, the expectation is corrected and the file *gains* tests. No test is
deleted, skipped or loosened.

---

## 3. The engine's own money strings

`engine/target/release/inheritance-engine < engine/examples/cases/02-married-3lc.json` — the case
`frontend/supabase/seed.sql` copies byte-for-byte into the Alpha fixture — returns:

```
heirs 4
  c1 Ana    150000000  legal_basis=["Art. 996"]
  c2 Ben    150000000  legal_basis=["Art. 996"]
  c3 Carlos 150000000  legal_basis=["Art. 996"]
  s  Rosa   150000000  legal_basis=["Art. 996"]
narratives 4  (c1,c2,c3,s)
narratives[0].text begins: "**Ana (legitimate child)** receives **₱1,500,000**. The decedent died
  intestate (without a valid will). As a legitimate child (Art. 887 of the Civil Code), Ana …"
warnings 0
computation_log.steps 10, final_scenario I2, total_restarts 0
scenario_code I2, succession_type Intestate
```

`net_distributable_estate.centavos` is `600000000`; decedent `Pedro`, date of death `2026-01-15`.

Three consequences:

1. **Narrative text carries `₱` and literal `**` markdown markers.** `NarrativesSection` renders
   `{n.text}` verbatim, so `toPdfSafeText` must be applied there too.
2. **`warnings` is empty for this case**, so `WarningsSection` returns `null` and the PDF has no
   Warnings heading. A required-section list containing "Warnings" would be wrong.
3. **`narratives` is non-empty** (4 entries), so `NarrativesSection` does render.

Because both of those sections are conditional on run-time data, the section list a gate asserts must
be **derived from the engine output computed in the same run**, never from a committed list of eight
names.

Recorded and deliberately **not** acted on in this phase: the literal `**` markers reach the PDF.
`ActionsBar` already has a `stripMarkdownBold` helper for the clipboard path. Removing them from the
PDF is a presentation change with no requirement behind it in PDF-01…PDF-05, so Phase 13 leaves it
alone rather than widening scope; it is written down here so it is not mistaken for something nobody
noticed.

---

## 4. The toolchain

### 4.1 What is installed on this machine

```
/usr/bin/pdftotext   poppler 22.02.0
/usr/bin/pdftoppm    poppler 22.02.0
/usr/bin/pdfinfo     poppler 22.02.0
/usr/bin/qpdf
/usr/bin/gs
```

`dpkg -l` shows `poppler-utils 22.02.0-2ubuntu0.13`, `poppler-data 0.4.11-1`,
`fonts-urw-base35 20200910-1`, `fonts-liberation 1:1.07.4-11`.

Three poppler binaries cover all five requirements:

| Requirement | Binary | Command |
|---|---|---|
| PDF-01, PDF-02, PDF-03 | `pdftotext` | `pdftotext <in> -` |
| PDF-04 | `pdftoppm` | `pdftoppm -png -r 100 <in> <prefix>` |
| PDF-05 | `pdfinfo` + `pdftoppm` | `pdfinfo <in>` → `Page size:` line |

No npm package is added for PDF handling. `pdfjs-dist` was rejected because page rasterisation
through it needs a native canvas binding, which is a compiled dependency in a project whose gates
currently install none.

### 4.2 Rasterisation is deterministic run-to-run here

```
pdftoppm -png -r 100 out.pdf p1 ; md5sum p1-1.png
fafb4e6a71f61ac6fc8428895b6ca1a8  p1-1.png
rm p1-1.png ; pdftoppm -png -r 100 out.pdf p1 ; md5sum p1-1.png
fafb4e6a71f61ac6fc8428895b6ca1a8  p1-1.png
```

Byte-identical. PDF metadata (`/CreationDate`, `/ID`) changes per generation but is never drawn, so it
does not reach the raster.

**UNMEASURED, and recorded as a risk rather than a claim:** because the base-14 fonts are not
embedded, poppler substitutes from `fonts-urw-base35`. A different poppler version or a different
substitution font package on a GitHub-hosted runner would rasterise differently, and this project's CI
has still never executed (Phase 1's GATE-04 finding). This is the same exposure Phases 11 and 12
accepted for their browser reference images. Plan `13-07` therefore installs `poppler-utils` and
`fonts-urw-base35` explicitly in the workflow and records the two observed versions in `GATES.md`.

### 4.3 Page size is readable from rendered output

```
pdfinfo out.pdf | grep 'Page size'
Page size:       595.28 x 841.89 pts (A4)
```

That is A4 read out of the produced document, which is what PDF-05 asks for in place of matching
`A4` against the text of `print.css`.

---

## 5. The determinism blocker for PDF-04, and its fix

`frontend/src/components/pdf/CaseSummarySection.tsx:30` computes
`const today = new Date().toISOString().slice(0, 10)` and renders `Report Generated: {today}`.

A reference image approved at `maxDiffPixels: 0` would therefore fail on the following calendar day.
Phase 10's `REFERENCES.md` permits raising a tolerance for exactly one measured reason — a platform
whose text rasterisation differs — and a date-shaped tolerance is not that.

Playwright 1.56.1 is already a devDependency, and `node_modules/playwright-core/types/types.d.ts`
documents `clock.setFixedTime`:

> Makes `Date.now` and `new Date()` return fixed fake time at all times, **keeps all the timers
> running**.

That is the needed shape: `clock.install()` fakes timers too, which would stall React scheduling and
the debounced autosave, whereas `setFixedTime` does not.

**Decision, locked for the phase:** the PDF capture calls
`await page.clock.setFixedTime(new Date('2026-06-15T00:00:00Z'))` before the first navigation.
`2026-06-15` is chosen for two measured reasons: it is after the seeded decedent's date of death
(`2026-01-15`), so the report date is not before the death it reports; and it is before the real clock
on this machine, so a Supabase session token minted at real time has an `expires_at` in the fake
future and `supabase-js` treats it as live rather than expired.

---

## 6. Where the PDF comes from

The gate obtains the PDF by **clicking the product's own Export PDF button in a real browser** and
capturing the download, mirroring the Phase 12 decision recorded in `.planning/STATE.md` that the
results view is reached by clicking the real compute button rather than by seeding an output.

Sequence, reusing existing harness modules unchanged:

1. `readStackEnv()`, `adminClient(env)`, `readFixtures()` — `journey/session.mjs`, `journey/seed.mjs`
2. `RESETS['case-alpha-no-output'](admin)` — `journey/resets.mjs`
3. read `input_json`; `computeEngineOutput(input_json)` — `journey/engine.mjs`
4. `buildApp()`, `startPreview()` — `journey/serve.mjs`
5. `launchBrowser()`, `newJourneyPage(browser)` — `journey/browser.mjs`
6. `page.clock.setFixedTime(...)`, `seedAuthSession(...)`, goto `/cases/<alpha>?step=4`, click
   `[data-testid="compute-distribution"]`, wait for `[data-testid="results-view"]`
7. `page.waitForEvent('download')` raced against a click on `[data-testid="export-pdf"]`
8. `download.path()` → `fs.readFileSync` → the PDF buffer

`ActionsBar` needs one added attribute, `data-testid="export-pdf"`, on the existing Export PDF
button. That is the same kind of change Phase 12 made when it added seven per-heir hooks.

**Known hazard, with a pre-decided remedy so no executor has to invent one.** `downloadPDF`
(`pdf-export.ts:78-83`) calls `URL.revokeObjectURL(url)` on the statement after `a.click()`, and the
anchor is never appended to the document. Chromium normally resolves a blob URL during click
dispatch, so the download survives. Plan `13-03` proves this with a probe. If the probe shows the
`download` event never firing, the plan authorises exactly one product change and no other: wrap the
`URL.revokeObjectURL(url)` call in `setTimeout(() => URL.revokeObjectURL(url), 0)` so revocation
happens after the current task. That is a named, bounded remedy, not a judgement call.

---

## 7. Where reference images live

`scripts/check-journey-registry.mjs:275` scans `frontend/journey/references/` and raises
`ORPHAN REFERENCE` for any `<name>.png` whose `<name>` is not a declared step id, and its
`REQUIREMENTS` list (line 59) is frozen to `JRNY-02 … JRNY-08`. Putting PDF page images in that
directory would break gate G16, and widening the requirement list would make PDF pages pretend to be
browser steps with `url`, `session` and `rubric` fields they do not have.

**Decision, locked for the phase:** PDF page references live in a separate directory,
`frontend/journey/pdf-references/`, written only by a separate command
`frontend/journey/pdf-approve.mjs`. The comparator is reused verbatim: `compareToReference` in
`journey/diff.mjs` already takes `referencesDir` as its third parameter and writes nothing, so the
five failure markers (`RUBRIC FAILURE`, `DIFF FAILURE`, `REFERENCE MISSING`,
`REFERENCE SIZE MISMATCH`, `STEP ERROR`) and the `maxDiffPixels` sidecar contract carry over with no
second implementation.

---

## 8. What PDF-05 asserts, from rendered output only

`frontend/src/styles/print.css` declares `@page { size: A4; margin: 25mm 20mm }` and, inside
`@media print`, `body { font-family: 'Times New Roman', Times, serif; font-size: 12pt }`,
`display: none !important` for `nav`, `[data-sidebar]`, `.sidebar` and `.no-print`, and
`display: block !important` for `.print-header` and `.print-only` (which are `display: none` on
screen).

Every one of those is checkable from what the browser actually rendered:

| Claim | How it is read from rendered output |
|---|---|
| Print typeface applied | `getComputedStyle(document.body).fontFamily` under `page.emulateMedia({ media: 'print' })` contains `Times New Roman` |
| Print body size applied | the same call's `fontSize` is `16px` — 12pt at the CSS reference 96 dpi |
| Chrome hidden | every `nav`, `[data-sidebar]`, `.sidebar`, `.no-print` element has computed `display` `none` |
| Print-only content shown | every `.print-header` element has computed `display` `block`, having been `none` before the media switch |
| Page size honoured | `page.pdf({ preferCSSPageSize: true })` output, read with `pdfinfo`, reports `595.28 x 841.89 pts (A4)` |
| Margins honoured | page 1 of that PDF rasterised at `-r 100`: the first non-white pixel row is at least `90` px from the top and the first non-white column at least `70` px from the left |

The two margin thresholds are stated as concrete integers so no executor picks them. Their basis:
25 mm at 100 dpi is 98.4 px and 20 mm is 78.7 px; `90` and `70` sit a few pixels inside those to
absorb glyph bearing, and both are far above the `0`-ish offset a zero-margin layout would produce, so
the check cannot pass on a page that ignored `@page`.

---

## 9. Gate placement

Current manifest orders: G5=1, G6=2, G7=3, G12=4, G13=5, G15=6, G16=7, G1=8, G2=9, G3=10, G4=11,
G18=12, G17=13, G19=14, G20=15, G21=16, G10=17, G11=18, G8=19, G9=20.

`G14` stays reserved and unused for Phase 9's unstarted `09-06`. Four new ids are taken:

| New gate | Command | `order` |
|---|---|---|
| **G22** pdf toolchain | `cd frontend && node journey/pdf-probe.mjs` | 17 |
| **G23** pdf structure | `cd frontend && node journey/pdf-structure.mjs` | 18 |
| **G24** pdf visual | `cd frontend && node journey/pdf-visual.mjs` | 19 |
| **G25** print layout | `cd frontend && node journey/print-layout.mjs` | 20 |

G10 moves 17→21, G11 18→22, G8 19→23, G9 20→24. `G9` stays last, which is the constraint Phase 4
measured: `scripts/check-gate-results.mjs` fails with `RESULTS INCOMPLETE` when it sees any other gate
as `not-run`. The phase ends at **24 gates** and `ALL GATES PASSED (24/24)`.

G22 is deliberately first of the four and needs no Docker, no Supabase and no browser, so a missing
poppler reports itself in seconds rather than as three mysterious browser-gate failures.

---

## 10. Cost

Each of G23, G24 and G25 runs `buildApp()` (`npm run build`) and launches chromium; `journey/serve.mjs`
has no build cache. Phase 12 measured the whole 20-gate set at 4m12s on this machine with
`timeout-minutes: 60`. Three more builds plus three more browser sessions is the added cost. The
timeout is left at 60. Sharing one build across gates was rejected: a gate that consumes another
gate's artefact acquires an order dependency and a silent failure mode when the producing gate is
skipped, which is exactly what the three-valued exit contract exists to avoid.

---

## 11. No point of Philippine law arises

Every check in this phase compares a rendered string, an integer number of centavos, a pixel, or a
page dimension against a value the compiled engine produced during the same run. Article citations are
asserted to be **present** and to **match the engine's own `legal_basis` entries** — never to be
correct. Nothing is added to `.planning/LAWYER-AGENDA.md`, and `grep -c "\[x\]"` over it must still
print `0` at the end of the phase.
