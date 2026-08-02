# Phase 23 — Research: The Instrument (Letterhead, Attribution, Warnings in the PDF)

**Written:** 2026-08-01
**Requirements:** INST-01, INST-02, INST-03, INST-04, INST-05

Every number, path and quoted string below was measured against the tree at
`gsd/deletion-milestone` on 2026-08-01. Nothing here is recalled from a prior phase's prose.
Where a prior document's claim turned out to be stale, this file says so and states what
replaced it.

---

## 1. The defect the audit named, confirmed at the line

`frontend/src/components/results/ActionsBar.tsx:46`

```
      await downloadPDF(input, output, null);
```

`downloadPDF`'s third parameter is `profile: FirmProfile | null`
(`frontend/src/lib/pdf-export.ts:71-75`), it is forwarded unchanged to `generatePDF`
(`:77`), which passes it to `EstatePDF({ input, output, profile, options })`
(`frontend/src/lib/pdf-export.ts:63`).

`frontend/src/components/pdf/EstatePDF.tsx:48-50` gates the letterhead on it:

```
        {options.includeFirmHeader && profile && (
          <FirmHeaderSection profile={profile} />
        )}
```

`DEFAULT_PDF_OPTIONS.includeFirmHeader` is `true` (`pdf-export.ts:19`), so the only reason the
letterhead never renders is the literal `null`. Measured: `grep -c "downloadPDF(" ` over
`frontend/src/` returns call sites in `ActionsBar.tsx` and `pdf-export.ts` only, so `ActionsBar`
is the sole production caller.

`FirmProfileProvider` is mounted at exactly one place — `frontend/src/routes/settings/index.tsx:49` —
so `useFirmProfile()` is not reachable from the results view. Whatever loads the profile for the
export has to do it itself. Measured: `grep -rn "FirmProfileProvider\|useFirmProfile" src/` outside
the context file and its test returns 3 lines, all in `routes/settings/index.tsx`.

`frontend/journey/pdf-structure.mjs:13-15` records the consequence as a deliberate gate exclusion:

> THE FIRM HEADER IS DELIBERATELY EXCLUDED. ActionsBar.tsx calls
> downloadPDF(input, output, null), so no PDF a user can obtain carries a firm header.

That exclusion is a true statement about today's product and becomes false the moment INST-01
lands. This phase therefore has to move the assertion, not merely add code.

---

## 2. What the firm profile actually stores, and the one field that does not exist

`frontend/src/lib/firm-profile.ts:3-17` and `frontend/supabase/migrations/001_initial_schema.sql:89-108`
agree exactly. The live database was queried and returns the same eighteen columns:

```
id, email, full_name, firm_name, firm_address, firm_phone, firm_email,
counsel_name, counsel_email, counsel_phone, ibp_roll_no, ptr_no,
mcle_compliance_no, logo_url, letterhead_color, secondary_color,
created_at, updated_at
```

ROADMAP Phase 23 success criterion 2 names **five** items: *name, Roll of Attorneys number, IBP
number, PTR number and MCLE compliance*. The store holds **four** of them —
`counsel_name`, `ibp_roll_no`, `ptr_no`, `mcle_compliance_no`. There is no
`roll_of_attorneys_no` column anywhere in the tree
(`grep -rn "roll_of_attorneys" .` returns zero hits outside this research file).

The existing UI labels `ibp_roll_no` as **"IBP Roll No."**
(`frontend/src/components/settings/FirmProfileForm.tsx:96`) and `FirmHeaderSection.tsx:67` prints
`| IBP Roll No. ${profile.ibpRollNo}`. Re-labelling that field to mean something else would
change what a stored value denotes without anyone re-entering it, which is silent wrongness of
exactly the kind this repository ranks worst. Printing one stored number under two different
labels is the same failure wearing a different hat.

**The decision this phase takes, written down here so no executor has to make it:** a new nullable
column `roll_of_attorneys_no` is added by migration `016`, the existing `ibp_roll_no` keeps its
existing label verbatim, and the attribution block prints five separately-sourced lines. No
existing column is renamed, dropped or re-interpreted.

This is not a point of Philippine law and no rule of succession or taxation is being written: it
is a storage decision about how many distinct identifiers a signature block records.
CLAUDE.md invariant 6 and `.planning/NEW-LEGAL-RULE.md` are not engaged, and
`.planning/lawyer-decisions.json` is not touched by this phase.

### How the column reaches the running database

`scripts/setup-env.sh` does **not** run `supabase db reset`. Measured precisely, because the naive
grep misleads: `grep -c "db reset" scripts/setup-env.sh` prints **1**, and that single hit is
line 105, inside a comment explaining why both CLI binaries must be installed
(*"`supabase db reset` fails with LegacyDbBootstrapError"*). There is no invocation. A migration
added to a tree whose stack is already running is therefore applied by
`cd frontend && supabase db reset`, which `frontend/supabase/config.toml` also makes re-apply
`seed.sql`. The seed is idempotent by construction (id-scoped deletes, then
`ON CONFLICT DO NOTHING`) and plan `03-03` proved a second reset leaves identical row counts. The
stack is currently up: `docker ps` lists `supabase_db_inheritance` and eleven sibling containers.

---

## 3. The letterhead has no logo, and that is in scope to state, not to build

`FirmHeaderSection` accepts `logoDataUrl?: string | null` (`FirmHeaderSection.tsx:10`) and renders
an `<Image>` only when it is truthy (`:54-56`). `EstatePDF` never passes it
(`EstatePDF.tsx:48-50` passes `profile` alone), so the logo is unreachable regardless of what the
firm configured. `frontend/supabase/seed.sql:106-107` records why nothing seeds one:

> user_profiles — firm and branding columns left at schema defaults. A seeded
> logo_url would point at a storage object that does not exist.

Rendering it needs the storage object fetched and base64-encoded inside a lazily-imported PDF
path. ROADMAP criterion 1 says *"a configured letterhead renders"* and names no logo; INST-01 says
the same. **The logo is therefore out of this phase's scope and stays unreachable.** It is recorded
in `23-GATE-OBSERVATIONS.md` as a measured, deliberate omission so it is not mistaken for an
oversight, exactly as `journey/JOURNEY.md` records its own two.

---

## 4. Warnings: what each surface prints today

**On screen** — `frontend/src/components/results/WarningsPanel.tsx`:

| Element | Source | Line |
|---|---|---|
| Heading `Manual Review Required` | literal | `:34` |
| Severity word (`error` / `warning` / `info`) | `getWarningSeverity(warning.category)` | `:37`, `:50` |
| Description | `warning.description` | `:53` |
| `Related heir: <name>` | `shares.find(s => s.heir_id === warning.related_heir_id)` | `:38-41`, `:55` |

**In the PDF** — `frontend/src/components/pdf/WarningsSection.tsx`:

| Element | Source |
|---|---|
| Heading `Warnings` | literal |
| `[{w.category}] {w.description}` | one `<Text>` per warning |

So the audit's sentence *"the refusal to guess … currently exists only in an on-screen panel"* is
**not literally true and this phase must not repeat it**: `EstatePDF.tsx:59` renders
`<WarningsSection warnings={output.warnings} />` unconditionally, so the count already matches. What
is true, and is what INST-03 has to close, is that **the two surfaces disagree about what a warning
says**: the PDF drops the severity, drops the related heir's name, and gives the section a
different title. Two renderers with two independent literal layouts is the same structural defect
Phase 21 fixed with `form1801-lines.ts` and Phase 22 fixed with `deed/schedule-lines.ts`.

`getWarningSeverity` lives in `frontend/src/components/results/utils.ts:52-63` and maps six
categories; anything else falls through to `'info'`.

### Which committed inputs actually produce a warning

Measured by running all twenty `engine/examples/cases/*.json` through the compiled WASM engine via
`frontend/journey/engine.mjs`. Eighteen produce zero warnings. Two do not:

| Case | warnings | category | `related_heir_id` | severity via the map |
|---|---|---|---|---|
| `06-testate-charity.json` | 1 | `preterition` | `null` | `error` |
| `17-adopted-child.json` | 1 | `RA_11642_RETROACTIVITY` | `"ac1"` | `info` (unmapped) |

Verbatim payloads:

```
06: {"category":"preterition",
     "description":"Art. 854: compulsory heir totally omitted — all institutions annulled",
     "related_heir_id":null}

17: {"category":"RA_11642_RETROACTIVITY",
     "description":"A pre-2022 adoption decree under RA 8552 raises the RA 11642 Sec. 41
                    retroactivity question. See .planning/LAWYER-AGENDA.md entry LAWYER-08.",
     "related_heir_id":"ac1"}
```

**The seeded journey case produces none.** `frontend/supabase/seed.sql:15` states that the Alpha
case `input_json` is a verbatim copy of `engine/examples/cases/02-married-3lc.json`, and
`scripts/check-seed-fixture.mjs` enforces that byte for byte with the marker
`SEED INPUT NOT COPIED`. That case yields zero warnings. A browser gate that captured the Alpha
case as it stands would assert warning parity over an empty set and pass vacuously — the exact
failure `journey/pdf-capture.mjs:24-27` was written to prevent.

`17-adopted-child.json` is the right browser fixture and `06-testate-charity.json` is not:

- `17` has `will: null`, so `?step=4` is the review step, matching what
  `journey/pdf-capture.mjs:115-117` navigates to and waits for. `06` carries a will, which inserts
  a visible wizard step and moves the review index.
- `17` carries `related_heir_id: "ac1"`, which is the only shape that exercises the heir-name
  lookup the screen performs and the PDF currently does not.
- `17`'s decedent date of death is `2026-01-15`, the same as the seeded case, so the fixed capture
  clock `2026-06-15T00:00:00Z` (`journey/pdf-capture.mjs:48`) still lies after it.
- `17` produces `net_distributable_estate` `600000000` centavos and two persons.

The `06` shape — `error` severity, `related_heir_id: null` — is covered at the unit layer over the
shared line model instead. That split is stated in the plans rather than left implicit.

---

## 5. Markdown asterisks: confirmed, and confined to narratives

`frontend/src/components/pdf/NarrativesSection.tsx:43` renders `{toPdfSafeText(n.text)}`.
`toPdfSafeText` (`frontend/src/components/pdf/pdf-text.ts`) replaces `₱` with `PHP ` and its own
doc comment says *"no markdown is stripped"*. `@react-pdf/renderer` does not parse markdown.

Measured across all twenty committed cases: **every one** produces at least one narrative
containing `**`. Example from `17-adopted-child.json`:

```
**Bio Child (legitimate child)** receives **₱3,000,000**. The decedent died intestate
(without a valid will). As a legitimate child, Bio Child is a compulsory heir.
```

Measured for the same case, `**` appears in **narratives only**: `JSON.stringify(computation_log)`
contains no `**`, and `JSON.stringify(warnings)` contains no `**`. So the fix has exactly one site.

`stripMarkdownBold` already exists at `frontend/src/components/results/utils.ts:44-46` and is used
by `ActionsBar.tsx:55` and `NarrativePanel.tsx:48`. Importing it into `NarrativesSection` is the
only change that keeps one implementation; writing a second regular expression in the PDF layer
would be a duplicate of a transform the product already owns.

`journey/JOURNEY.md:428-436` pins the asterisks as a deliberate non-fix with *"no requirement behind
it in PDF-01 through PDF-05"*. INST-04 is now that requirement, so that note becomes stale on the
day this phase lands and has to be corrected in the same commit series.

---

## 6. The duplicated citation line: the audit's string is stale, the defect is not

`journey/JOURNEY.md:439-441` records:

> citations render as `Art. 996: Art. 996` because `NCC_ARTICLE_DESCRIPTIONS` has no entry for
> that key and `PerHeirBreakdownSection` falls back to the key

**Both halves of that explanation are now false.** Phase 17 added
`"Art.996": "Surviving spouse with legitimate children (Art. 996 NCC)"`
(`frontend/src/data/ncc-articles.ts:48`) and replaced the key fallback with a loud
`'CITATION NOT RESOLVED'` (`PerHeirBreakdownSection.tsx:103`). The literal string
`Art. 996: Art. 996` occurs nowhere in `frontend/src/` — measured, `grep -rn` returns hits only in
planning prose and `journey/JOURNEY.md`.

What survives is the same duplication in its post-Phase-17 form.
`PerHeirBreakdownSection.tsx:100-105` renders:

```
                      {raw}: {resolved ? description : 'CITATION NOT RESOLVED'}
```

`raw` is the engine's own string, and 15 of the 75 entries in `NCC_ARTICLE_DESCRIPTIONS` end with
a `(Art. N NCC)` parenthetical naming the same article. The seeded Alpha case emits exactly one
distinct `legal_basis` value, `Art. 996`, so the line the current PDF prints is:

```
Art. 996: Surviving spouse with legitimate children (Art. 996 NCC)
```

— the article number, twice, on one line. The G39 fixture case `17-adopted-child.json` emits
`Art. 980`, whose description is
`Children of the deceased shall always inherit from him (Art. 980 NCC)`, so the fixture exercises
the same duplication.

**The mechanical rule this phase adopts, containing no judgement:** remove from the *description*
every substring matching a parenthetical of the form `(Art. <digits> NCC)` together with any
whitespace immediately preceding it, then join `raw`, `": "` and the remainder. The result carries
the article exactly once, and it is the engine's own `raw` string that survives — never a string
the display layer composed. Applied to the fifteen affected entries this removes fifteen
parentheticals and changes nothing else; the other sixty descriptions are untouched by the rule.

`frontend/src/data/ncc-articles.ts` is **not edited**. Gate G27
(`node scripts/check-spec-legal-text.mjs`) and gate G14
(`node scripts/check-citation-integrity.mjs`) both read that file's contents, and rewriting sixty
descriptions to fix a rendering defect would put a presentation change inside the attribution
authority. The transform belongs in the PDF text layer.

### The G14 trap, and where the helper must live

`scripts/check-citation-integrity.mjs:80-92` lists eleven `DISPLAY_LAYERS` and raises
`LAYER DERIVES ARTICLE` for any line in them matching `/Art\.\s*\d/`.
`frontend/src/components/pdf/PerHeirBreakdownSection.tsx` is on that list.
`frontend/src/components/pdf/pdf-text.ts` is not, and its own header declares it *"the only money
and text transforms the PDF layer uses"* — which is precisely what this transform is. The helper
goes there; the display layer calls it and states no article literal of its own.

---

## 7. The gate landscape this phase lands into

`gates.manifest.json` currently holds **37** gates (`node scripts/check-gate-manifest.mjs` →
`MANIFEST OK — 37 gates, 37 locked`, exit 0). The relevant ones:

| Order | Gate | Command | Bearing on this phase |
|---|---|---|---|
| 15 | G17 | `cd frontend && node journey/run.mjs --all` | **The suite halts here.** 15 steps withheld for human review since Phase 16. |
| 21 | G23 | `cd frontend && node journey/pdf-structure.mjs` | Its derived section list contains the literal `'Warnings'`; the PDF heading changes. |
| 22 | G24 | `cd frontend && node journey/pdf-visual.mjs` | Pixel-exact page references. **Already red before this phase** — Phase 21's report measured page 1 at 2627 and page 2 at 1975 differing pixels, caused by `b7cdb230e` (plan 17-03) changing `PerHeirBreakdownSection.tsx` after the last approval in `6f02c89e4`. |
| 34 | G37 | `cd frontend && npx tsx journey/return-parity.ts` | Untouched — this phase changes no estate-tax surface. |
| 35 | G38 | `cd frontend && npx tsx journey/deed-parity.ts` | Untouched. |
| 36 | G8 | `node scripts/check-gate-skips.mjs` | Shifts to 37 when a gate is inserted before it. |
| 37 | G9 | `node scripts/check-gate-results.mjs` | Must stay last. |

**Placement rule, inherited from Phases 21 and 22 and followed here:** a new blocking gate goes
*after* the halt at order 15, so registering it costs the run no coverage it has today. Phase 20's
`G36` was blocked precisely because its planned order 12 sat ahead of the halt. The new gate takes
**order 36**, `G8` moves to 37 and `G9` to 38, and `order` is the only field that changes on any
existing gate.

`gates.manifest.lock` may only grow: appending one `{id, command, blocking}` entry is permitted,
and `scripts/check-gate-manifest.mjs` (G5) enforces the difference.

`.planning/ORIENTATION.md:31` states *"The gate set holds 37 gates."* and gate G33
(`node scripts/check-planning-truth.mjs`) raises `ORIENTATION GATE COUNT` when that disagrees with
the manifest, so it moves to 38 in the same commit.

### G33 is already red because the phase directory exists

Measured at the moment the phase directory was created:

```
ROADMAP PLAN COUNT — .planning/phases/ holds a directory for phase 23 but the Progress table has no row for it.
STATE PLAN COUNT — total_phases reads 22 but the filesystem gives 23.
STATE PERCENT DRIFT — percent reads 95 but round(21/23 * 100) is 91.
```

Planning fixes all three before this file is committed: a Progress row for Phase 23, and
`total_phases: 23` with the recomputed percentage in `.planning/STATE.md`.

---

## 8. How the new gate obtains a PDF, and how it leaves the fixture as it found it

`frontend/journey/pdf-capture.mjs` exports `captureExportedPdf()`, which resets the Alpha case to
`case-alpha-no-output`, builds the app, starts a preview, opens a browser with the clock pinned to
`PDF_FIXED_CLOCK`, navigates to `/cases/<id>?step=4`, clicks `[data-testid="compute-distribution"]`,
waits for `[data-testid="results-view"]`, clicks `[data-testid="export-pdf"]` and returns the
downloaded bytes together with `{ expected, input, caseId }`. It refuses with `JourneyCannotRun`
for a stopped stack, a failed build, a missing browser, a download that never arrives, bytes not
beginning `%PDF-`, or a file under 1000 bytes. G23, G24 and G25 all go through it.

The new gate needs a *different* case in the row and a *configured* firm profile on the Alpha user,
and it must leave both exactly as it found them, because `input_json` is not restored by any
existing reset and G17, G19, G23, G24 and G25 all read the Alpha case afterwards.
`journey/resets.mjs:96-99` states the governing rule:

> a reset must restore every column any step can write, not merely the one its name mentions.

The lowest-risk shape, and the one the plans adopt: **`captureExportedPdf` gains one optional
parameter, `{ prepare }`**, an async callback invoked with the admin client after the reset and
before `input_json` is read. Called with no argument it behaves byte-identically to today, so G23,
G24 and G25 are unaffected. The new gate supplies a `prepare` that writes the fixture, and does its
own stash-and-restore in a `finally` block around the whole call, so a crash mid-run cannot leave
the fixture poisoned.

Precedent for seeding facts from a committed journey fixture:
`RESETS['case-alpha-tax-input']` (`journey/resets.mjs`) writes `tax_input_json` from
`journey/fixtures/tax-input-alpha.json`, described there as *"a COMMITTED FIXTURE OF FACTS"* — an
input the wizard itself would have written, distinct from the seeded engine *result*
`scripts/check-seed-fixture.mjs` rejects. `check-seed-fixture.mjs` reads
`frontend/supabase/seed.sql` only; nothing under `frontend/journey/fixtures/` is in its scope.

---

## 9. Re-approving G24's references, and the attribution that INST-05 requires

`journey/pdf-approve.mjs` is the only writer into `journey/pdf-references/`. Measured, it
**takes no arguments at all** (`:61-66` refuses any) and writes
`{ "maxDiffPixels": 0 }` and nothing else (`:86-90`). There is no `approvedBy` and no
`approvedOn`.

Its browser-step sibling `journey/approve.mjs` already has both: it accepts
`--by <string>` (`:45-49`) and writes
`{ maxDiffPixels, approvedOn, approvedBy }` (`:96-100`).

INST-05 requires *"each approval attributed"*. The mechanical change is to give
`pdf-approve.mjs` the same idiom, and to make `--by` **required** rather than defaulted — a
strengthening, since today's unattributed approval becomes impossible.
`journey/pdf-references/README.md` already states that raising a tolerance *"requires whoever
raised it to be named in an `approvedBy` field"*; this extends the naming to every approval at
tolerance zero.

`journey/diff.mjs:68-69` reads only `sidecar.maxDiffPixels` and ignores every other key, so the two
extra fields cannot change any comparison. `scripts/check-journey-registry.mjs` does not scan
`pdf-references/` at all — measured, `grep -n "pdf-references"` over that file returns zero hits,
and `journey/pdf-references/README.md` explains why the directory was kept separate.

### The inspection this phase can honestly perform

`pdf-visual.mjs` writes every rasterised page to `.journey-runs/<stamp>/pdf/page-<n>.png` and, for
each failing page, a side-by-side artifact set through `writeStepArtifacts`. Those are PNG files,
and the executor's `Read` tool renders images. So "each diff inspected" is a step an executor can
actually perform and an acceptance criterion can actually require.

The plans additionally make the approval a *consequence of an already-proven change* rather than a
visual judgement: the new gate proves the letterhead text, the five attribution lines, the warning
parity, the absence of `**` and the single-article citation line **deterministically, from the
extracted text of the same PDF**, before any image is approved. What the human-visible image
approval then records is a change whose content is already certified by a passing text gate.

The reference set currently holds two pages (`page-1.png`, `page-2.png`). Adding a letterhead and
an attribution block may push the document to three; `pdf-approve.mjs` handles both directions —
it writes every page the newest run produced and deletes references numbered above the highest.

---

## 10. Toolchain and environment, verified present

| Requirement | Verified |
|---|---|
| Local Supabase stack | `docker ps` lists `supabase_db_inheritance` + 11 siblings |
| `frontend/.env.local` | present |
| `pdftoppm`, `pdftotext` | `/usr/bin/pdftoppm`, `/usr/bin/pdftotext` |
| `@react-pdf/renderer` | `^4.3.2`, already a dependency |
| Compiled WASM | `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` present |

**No npm dependency is added, removed or upgraded by this phase.** ROADMAP Phase 26 pins the
runtime dependency count as one of five locked numbers.

`frontend/test-baseline.json` holds `min_total_tests: 2119` and 31 ledgered known failures. Phase 19
measured the live count at 2138. This phase only adds tests, so the floor is not approached, and
nothing is appended to any ledger.

---

## 11. Architectural Responsibility Map

| Tier | Module | Responsibility this phase gives it |
|---|---|---|
| Storage | `frontend/supabase/migrations/016_roll_of_attorneys.sql` | One nullable column |
| Data access | `frontend/src/lib/firm-profile.ts` | `rollOfAttorneysNo` on the type and both row mappers; `loadCurrentFirmProfile()` |
| Pure model | `frontend/src/lib/warnings-lines.ts` | The single warning line model both surfaces render, and the one `getWarningSeverity` |
| Pure text | `frontend/src/components/pdf/pdf-text.ts` | `citationLine(raw, description)` — the parenthetical strip |
| PDF render | `frontend/src/components/pdf/AttributionSection.tsx` | Five labelled lines, loud when absent |
| PDF render | `frontend/src/components/pdf/WarningsSection.tsx` | Renders the shared model |
| PDF render | `frontend/src/components/pdf/NarrativesSection.tsx` | Applies the existing `stripMarkdownBold` |
| PDF render | `frontend/src/components/pdf/PerHeirBreakdownSection.tsx` | Calls `citationLine`; states no article literal |
| Screen render | `frontend/src/components/results/WarningsPanel.tsx` | Renders the same shared model |
| Wiring | `frontend/src/components/results/ActionsBar.tsx` | Loads the profile and passes it |
| Verification | `frontend/journey/instrument-parity.mjs` | Gate G39 |
| Verification | `frontend/journey/pdf-approve.mjs` | Required `--by`, recorded attribution |

No tier reaches past its neighbour: nothing under `src/lib/` imports from `src/components/`, the
PDF components import the model and the text helpers and compose nothing of their own, and the gate
imports the product's own capture path rather than rendering a document for itself.

---

## 12. Validation Architecture

Six layers, each with a command an executor runs verbatim.

| Layer | Command | Proves |
|---|---|---|
| Type | `cd frontend && npx tsc -b --force` | Branded money units and the widened `FirmProfile` compile under `strict` + `noUncheckedIndexedAccess` |
| Unit — model | `cd frontend && npx vitest run src/lib/__tests__/warnings-lines.test.ts` | Both warning shapes, unmapped category, empty set, heir-name resolution |
| Unit — text | `cd frontend && npx vitest run src/components/pdf/__tests__/pdf-text.test.ts` | The parenthetical strip over all fifteen affected descriptions and the sixty untouched ones |
| Unit — render | `cd frontend && npx vitest run src/components/pdf src/components/results/__tests__/ActionsBar.test.tsx` | The third argument is the loaded profile; the attribution block renders five lines; asterisks are gone |
| Static | `node scripts/check-citation-integrity.mjs`, `node scripts/check-gate-manifest.mjs`, `node scripts/check-plan-closed-world.mjs`, `node scripts/check-planning-truth.mjs`, `node scripts/check-doc-claims.mjs` | No display layer derives an article; the gate set grew and did not shrink; the planning directory's counts are true |
| Live | `cd frontend && node journey/instrument-parity.mjs`, then `cd frontend && node journey/pdf-structure.mjs`, then `cd frontend && node journey/pdf-visual.mjs` | The five criteria against the bytes the product's own Export button produced |

The live layer needs Docker, a built app and a browser. It is verified present in §10, so a
cannot-run there is a real environment failure and is reported as exit 2, never absorbed.

---

## 13. Out of scope, stated so it is not mistaken for an omission

- **`Form1801PDF`** carries no letterhead and no attribution block, and this phase does not give it
  one. Measured: `frontend/src/lib/form1801-pdf.ts` takes no `profile` parameter and
  `Form1801ActionsBar` passes none. No `INST-*` requirement owns the return's letterhead, ROADMAP
  Phase 23's own criteria name `ActionsBar` and `EstatePDF`, and threading a profile through
  `$caseId.tax.tsx` → `TaxResultsPanel` → `Form1801ActionsBar` → `form1801-pdf.ts` would put new
  text into the document G37 parses. Recorded as a candidate for a later phase.
- **The firm logo**, for the measured reasons in §3.
- **`Legitime Fraction:` rendering a bare `0`**, the second cosmetic note in
  `journey/JOURNEY.md:441`. `PerHeirBreakdownSection.tsx:81` already suppresses `'0/1'`; whatever
  produces a bare `0` is a separate defect no `INST-*` requirement owns.
- **The 15 withheld journey steps and the G17 halt.** This phase changes no screen that any of them
  captures except `WarningsPanel`, whose seeded case has zero warnings and therefore renders the
  same empty `<div data-testid="warnings-panel" />` it renders today.
- **`bash scripts/ci-gates.sh` exiting 0.** It will not, for reasons this phase does not own:
  the G17 halt, and G20/G21 whose scripts commit `4ccf06270` deleted.
</content>
</invoke>
