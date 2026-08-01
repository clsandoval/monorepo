# Phase 22 — Research: Deed of Extrajudicial Settlement, Schedule of Shares

**Researched:** 2026-08-01
**Phase:** 22 — Deed of Extrajudicial Settlement — Schedule of Shares
**Requirements:** DEED-01, DEED-02, DEED-03, DEED-04, DEED-05

Every number, path and line reference below was measured from the tree at
`gsd/deletion-milestone` on 2026-08-01. Nothing here is recalled.

---

## 0. The one-paragraph answer

The succession engine already emits everything the clause needs, in one array, with the
articles attached: `EngineOutput.per_heir_shares[i]` carries `heir_name`, `heir_category`,
`net_from_estate.centavos` and `legal_basis: string[]`. The phase therefore needs no engine
change, no new legal rule and no lawyer answer. It needs **one line model, three consumers**
— the exact architecture Phase 21 established for BIR Form 1801 and proved with gate G37 —
plus a deterministic DOCX writer that adds no npm dependency, plus a parity gate built from
the two gates that already do this job for the other two surfaces (`journey/money-parity.mjs`
for the succession screen, `journey/return-parity.ts` for the return).

---

## 1. What the engine already emits (measured)

`frontend/src/types/index.ts:415-439`:

```
export interface EngineOutput {
  per_heir_shares: InheritanceShare[];
  narratives: HeirNarrative[];
  computation_log: ComputationLog;
  warnings: ManualFlag[];
  succession_type: SuccessionType;
  scenario_code: ScenarioCode;
}

export interface InheritanceShare {
  heir_id: HeirId;
  heir_name: string;
  heir_category: EffectiveCategory;
  inherits_by: InheritanceMode;
  represents: HeirId | null;
  from_legitime: Money;
  from_free_portion: Money;
  from_intestate: Money;
  total: Money;
  legitime_fraction: string;
  legal_basis: string[];
  donations_imputed: Money;
  gross_entitlement: Money;
  net_from_estate: Money;
}
```

`ManualFlag` (`types/index.ts:471-475`) is `{ category: string; description: string;
related_heir_id: HeirId | null }`. The nullable `related_heir_id` is what makes DEED-04
mechanical rather than a judgement: a flag with a heir id refuses **that heir's line**, a
flag with `null` refuses **the whole schedule**.

### Which money field the clause states

`net_from_estate`, not `total`. Measured reason: `journey/money-parity.mjs` (gate G19)
compares the results screen against a same-run engine computation using
`centavosOf(s.net_from_estate)` for both the `heir-net-*` cells and the `breakdown-net-*`
cells. A deed clause stating a different field than the screen the lawyer just read would
be a second, silently-disagreeing figure — which is the failure this whole product exists to
prevent. The clause states `net_from_estate` so that G19 and the new gate assert the same
integer.

### `EFFECTIVE_CATEGORY_LABELS` already exists

`types/index.ts` exports `EFFECTIVE_CATEGORY_LABELS: Record<EffectiveCategory, string>` with
the five labels (`Legitimate Child`, `Illegitimate Child`, `Surviving Spouse`,
`Legitimate Ascendant`, `Collateral Relative`). The clause reuses it. No second label map
is written.

---

## 2. The precedent this phase copies, line for line

Phase 21 shipped **one line model, three renderers** for Form 1801, and the ROADMAP row for
Phase 21 records why: "three renderers cannot disagree about which rows exist."

| Form 1801 (shipped) | Deed clause (this phase) |
|---|---|
| `src/lib/estate-tax-engine/form1801-lines.ts` — the only site building a line, item, label or authority | `src/lib/deed/schedule-lines.ts` — the only site building a deed line, amount string or article list |
| `components/tax/results/Form1801View.tsx` — screen renderer | `components/results/DeedClauseSection.tsx` — screen renderer |
| `src/lib/form1801-csv.ts` — text renderer, writes and never parses | `src/lib/deed/clause-text.ts` — text renderer |
| `components/pdf/Form1801PDF.tsx` — binary renderer | `src/lib/deed/docx.ts` — binary renderer |
| `journey/return-parity.ts` (G37) — all three vs a same-run engine run | `journey/deed-parity.ts` (G38) — clause text and DOCX vs a same-run engine run |
| `FORM1801_LINE_IDS` frozen constant anchors the line set | the engine's own `per_heir_shares` **is** the anchor — the gate compares heir-id sets in both directions |

`frontend/src/lib/form1801-csv.ts:1-24` is the style model for the text renderer, including
the discipline it states in its own header: *"THIS MODULE WRITES CSV AND NEVER PARSES IT. No
CSV parsing library is added."* The deed modules write DOCX and never parse it; only the
gate parses, and the gate is the inverse of the writer.

---

## 3. DOCX without a dependency — measured, and the reason it is the right call

`frontend/package.json` was read in full. There is **no** `docx`, no `jszip`, no `pizzip`,
no `fflate` and no `adm-zip`. `jszip` was removed by the deletion milestone. The 24 runtime
dependencies are listed in the file; adding a 25th is a real cost, because ROADMAP Phase 26
(Scope Lock) pins **runtime dependency count** as one of its five locked numbers and states
that growing it fails a blocking gate.

A `.docx` is an OPC package: a ZIP holding XML parts. OPC permits both `Deflated` (method 8)
and `Stored` (method 0) entries. A **stored** ZIP needs no compressor at all — the payload
bytes are written verbatim — so the whole writer is a header layout plus a CRC-32, which is
about 100 lines of dependency-free code with no options to get wrong.

Three further reasons stored-ZIP beats a library here:

1. **Determinism.** Every field is fixed: modification date is the DOS epoch
   (1980-01-01 00:00:00, encoded `date=0x0021`, `time=0x0000`), no extra fields, no archive
   comment, no `zip64`. The same schedule produces byte-identical DOCX bytes on every run,
   which is what makes a byte-level assertion possible in a test and makes Phase 24's input
   hash reachable later.
2. **No wall clock.** `src/lib/pdf-export.ts:44` contains `new Date()` in the export
   filename path, and Phase 20 was blocked by exactly one such read
   (`estate-tax-engine/validation.ts`). Nothing under `src/lib/deed/` may contain
   `new Date()`; the date of death is already in `EngineInput.decedent.date_of_death`.
3. **The gate can read it back with zero dependencies.** Stored entries mean the gate slices
   bytes rather than inflating them; `node:zlib` is not even needed.

### The three parts, and nothing else

A minimal DOCX that Word and LibreOffice both open has exactly three parts:

| # | Part name | Purpose |
|---|---|---|
| 1 | `[Content_Types].xml` | declares the `rels` default and the `document.xml` override |
| 2 | `_rels/.rels` | points `rId1` at `word/document.xml` as the officeDocument |
| 3 | `word/document.xml` | the body: one `<w:p>` per line of the clause text |

No styles part, no theme, no fonts, no numbering, no settings. A deed clause is pasted into
the firm's own template, so shipping a style sheet would be shipping design taste the
product has no basis for.

### The DOCX body is the clause text

`word/document.xml` renders **the string `buildDeedClauseText` already produced**, one
`<w:p>` per line. That is deliberate: it makes ROADMAP criterion 2 — *"the same clause is
obtainable as DOCX"* — literally, checkably true, and it removes the whole class of defect
where the text and the DOCX disagree about a peso figure. The gate asserts exactly this
equality after re-extracting the text from the archive.

---

## 4. DEED-04 — the refusal rules, all mechanical

The ROADMAP's cross-cutting constraint is *"No clause wording asserts a legal conclusion the
engine did not produce."* Four rules discharge it, and every one is a property of the engine
output rather than a reading of law:

| # | Condition, measured on the engine output | Consequence in the clause |
|---|---|---|
| R1 | `share.legal_basis.length === 0` | that heir's line is **refused**: there is no article to carry, and DEED-03 requires one |
| R2 | some `output.warnings[j].related_heir_id === share.heir_id` | that heir's line is **refused**, quoting the flag's `category` and `description` verbatim |
| R3 | some `output.warnings[j].related_heir_id === null` | a **document-level refusal block** is printed directly under the heading, listing every such flag verbatim |
| R4 | always | a fixed notice naming `LAWYER-13` (see §6) states that the clause expresses shares as peso amounts and identifies no specific property |

Nothing in R1–R4 chooses a reading of the Civil Code. R1 and R2 are "the engine did not give
me a defensible line, so I do not write one." R3 is "the engine flagged the whole
computation." R4 is a standing disclosure of a known open question.

**Every character of a refusal is a constant in the module plus verbatim engine strings.**
No refusal is composed from the flag's meaning; the flag's own `category` and `description`
are interpolated unchanged.

### Why this phase does not implement the engine-side refusals

ROADMAP Phase 25 owns making the engine decline to compute for Art. 992 (`LAWYER-04`) and
for a donation *inter vivos* exceeding the estate (`LAWYER-06`), and its criterion 4 says the
refusal must be visible in the deed clause. R2 and R3 are the mechanism that will carry those
refusals when Phase 25 raises them. This phase builds the mechanism and adopts **no** reading
of Art. 771, Art. 911, Art. 992 or RA 11642 Sec. 41. `.planning/lawyer-decisions.json` keeps
`LAWYER-04`, `LAWYER-06` and `LAWYER-08` at `awaiting-answer`, untouched.

---

## 5. What the clause must NOT contain (ROADMAP criterion 6)

No parties clause, no publication clause (Rule 74 §1 of the Rules of Court), no bond clause,
no undertaking, no *jurat*, no acknowledgment, no signature blocks and no operative
adjudicating sentence. The clause is a schedule and says so on its face. The gate does not
police this — a grep for absent prose is a weak check — but the module is small enough that
its whole constant set is visible in one screen, and the plans fix every constant literally.

---

## 6. The one genuine legal question, and where it goes

A real Deed of Extrajudicial Settlement does not usually say *"Carlos — PHP 1,500,000.00."*
It says which specific property, by TCT number, area and Registry of Deeds, is adjudicated to
which heir. The succession engine consumes exactly **one** money scalar
(`EngineInput.net_distributable_estate.centavos`) and holds no asset schedule at all, so it
cannot express a per-property adjudication and the product must not invent one.

Whether a peso-amount schedule is acceptable in a Deed, or whether specific property
identification is required, is a point of Philippine law. Per `.planning/PLAN-STANDARD.md`
section 3 it is recorded, not decided: **`LAWYER-13`** is appended to
`.planning/LAWYER-AGENDA.md` and `.planning/lawyer-decisions.json` at `awaiting-answer`,
with `reading_implemented: "neither"`, and the clause prints a fixed notice naming it. Gate
G10 (`node scripts/check-lawyer-agenda.mjs`) holds the two files in agreement and requires
the anchor file to carry a `// LAWYER-13` comment at a pattern occurring exactly once.

---

## 7. Gate design — G38 `deed parity`

### Shape

`frontend/journey/deed-parity.ts`, run as `cd frontend && npx tsx journey/deed-parity.ts`,
modelled on `journey/return-parity.ts` (566 lines) and `journey/money-parity.mjs`.

The browser leg is not optional. `journey/money-parity.mjs:90-150` establishes the exact
sequence, and `steps/output.json` records why a seeded result is prohibited:
`scripts/check-seed-fixture.mjs` rejects a seeded `output_json` with the marker
`SEED WRITES OUTPUT` — *"a seeded engine result is a per-heir peso figure nothing computed."*
So the only honest path to a results view is to make the product compute one:

1. `RESETS['case-alpha-no-output'](admin)` — start from a wizard-phase case.
2. Read `cases.input_json` for the Alpha case id from `supabase/fixtures.json`.
3. `computeEngineOutput(input)` via `journey/engine.mjs` — **the expectation, computed this run.**
4. `buildApp()`, `startPreview()`, `launchBrowser()`, `seedAuthSession()`.
5. Navigate to `/cases/{id}?step=4`, wait for `[data-testid="review-step"]`, click
   `[data-testid="compute-distribution"]`, wait for `[data-testid="results-view"]`, settle 4000 ms
   (the measured settle time in `steps/output.json`, which names the Recharts 1500 ms animation
   and the `React.lazy` chunk as the reason 1200 ms was not enough).
6. Read `[data-testid="deed-clause-text"]` `textContent` — the pasteable clause.
7. Click `[data-testid="download-deed-docx"]`, capture the download with
   `page.waitForEvent('download')` exactly as `return-parity.ts:256-293` does, read the file.

### Comparisons — all exact, all bidirectional

| Check | Marker |
|---|---|
| every heir id the engine returned appears in the clause | `HEIR LINE MISSING` |
| every heir id the clause prints was returned by the engine | `HEIR LINE INVENTED` |
| each stated amount, parsed to BigInt centavos, equals `net_from_estate` | `DEED AMOUNT MISMATCH` |
| each line's article list equals `share.legal_basis` as an ordered list | `DEED AUTHORITY MISMATCH` |
| every heir the rules refuse is refused, and no other | `REFUSAL SET MISMATCH` |
| the DOCX, unzipped, yields text identical to the on-screen clause | `DOCX TEXT MISMATCH` |
| the archive holds exactly the three declared parts | `DOCX PART SET MISMATCH` |
| a run that compared zero heir lines | `DEED PARITY COMPARED NOTHING` |

There is no tolerance term, no rounding helper and no absolute-difference comparison
anywhere in the file — the prohibition `return-parity.ts:16-20` states, restated. There is no
`--fix`, `--update`, `--accept`, `--regenerate` or waiver flag. Exit contract is the project's
three-valued one: 0 passed, 1 failed, 2 cannot run (`DEED PARITY CANNOT RUN:` on stderr).

### The parser is the inverse of the product's formatter

`formatDeedPesos` emits `PHP ` + `en-US` comma-grouped pesos + `.` + **always** two centavo
digits. Note it deliberately differs from `formatPeso` (`types/index.ts:511`), which drops
`.00` when the remainder is zero — a deed states centavos explicitly or it states nothing.
The gate's `parseDeedPesos` accepts that grammar and **only** that grammar, and throws on
anything else. A formatter written inside the gate would make the gate agree with itself
rather than with the product, so the gate parses and never formats.

### Order 35, deliberately after the halt

`gates.manifest.json` holds **36** gates today; `G37 return parity` sits at order 34 and
`G9` is last. Phase 21's row records the reason it chose order 34: *"after the current halt,
so no coverage is lost."* `bash scripts/ci-gates.sh` currently exits 1 at **G17** (order 15),
so a gate registered before the halt would move the halt earlier and cost the run coverage —
the exact trap that blocked Phase 20's G36 registration. G38 goes at **order 35**, and the
phase runs it directly and pastes the output rather than claiming the suite reached it.

---

## 8. Registration checklist, measured against the checkers

Adding a gate touches five files, and three separate gates enforce the bookkeeping:

| File | What must change | Enforced by |
|---|---|---|
| `gates.manifest.json` | append the G38 object with all required keys, `order: 35` | `check-gate-manifest.mjs` MALFORMED GATE |
| `gates.manifest.lock` | append `{id, command, blocking}` for G38 | `check-gate-manifest.mjs` UNLOCKED GATE |
| `GATES.md` | a new `## 28. Deed parity (G38)` section, since `proves` cites it | (prose; G30/G32 read this file) |
| `.planning/ORIENTATION.md` | `The gate set holds 37 gates.` | G33 ORIENTATION GATE COUNT |
| `RESUME.md` | its `ALL GATES PASSED (N/N)` sentence | G33 ORIENTATION GATE COUNT |

`scripts/check-gate-manifest.mjs` was read: it fails on `GATE REMOVED`,
`GATE COMMAND CHANGED`, `GATE WEAKENED`, `MALFORMED GATE` and `UNLOCKED GATE`, and has only
two flags, `--manifest` and `--lock`, both read-only path overrides. Appending is the only
permitted mutation and it is what `gates.manifest.lock`'s own `$comment` describes:
*"the owner may APPEND an entry here when a phase legitimately adds coverage."*

### G33 is already red from the phase directory alone

Measured now, before any plan runs:

```
IN-FLIGHT PHASE 20 — numerator relaxed, denominator and over-claim still checked
ROADMAP PLAN COUNT — .planning/phases/ holds a directory for phase 22 but the Progress table has no row for it.
STATE PLAN COUNT — total_phases reads 21 but the filesystem gives 22.
STATE PERCENT DRIFT — percent reads 95 but round(20/22 * 100) is 91.
```

Creating the phase directory is what did it. The planning commit repairs all three:
a Progress-table row `| 22. ... | 0/8 | Planned | - | ... |`, `total_phases: 22`,
`total_plans: 145`, `percent: 91`, the body progress bar, and `Phase: 22` as the in-flight
line. `derivedStatus(8, 0)` is `Planned` and the Phase 22 checkbox at ROADMAP line 39 is
already `- [ ]`, which is correct for a non-Complete phase. Making 22 in-flight is safe for
phase 20, whose row reads `0/7 Planned` and whose `derivedStatus(7, 0)` is also `Planned`.

---

## 9. G14 — the new renderers must be declared display layers

`scripts/check-citation-integrity.mjs:73-81` holds `DISPLAY_LAYERS`, seven entries today,
grown 4 → 7 by Phase 21. Its own comment says: *"Adding a display layer means adding it
here."* `HARDCODED_ARTICLE_RE` is `/Art\.\s*\d/` and fires `LAYER DERIVES ARTICLE` on any
match.

The three new renderers — `src/lib/deed/clause-text.ts`, `src/lib/deed/docx.ts` and
`components/results/DeedClauseSection.tsx` — are appended, making nine. `schedule-lines.ts`
is appended too, making **ten**: it is the site that copies `legal_basis`, so it is precisely
the site that must be proven never to author one.

The check also requires each listed path to exist (`display layer ... does not exist` is a
`CITATION SCAN UNREADABLE` cannot-run), so the list is extended only after the files exist.

---

## 10. Test infrastructure — measured state

- Framework: `vitest 4.0.18`, `frontend/vitest.config.ts`, jsdom, setup `src/test-setup.ts`.
- Command: `cd frontend && npm run test` (`vitest run`); gate G3 wraps it as
  `npm run test:gate` → `node scripts/check-test-baseline.mjs`.
- `frontend/test-baseline.json` has `"min_total_tests": 2119`. **The floor is no longer the
  blocker it was in Phases 16–18:** Phase 21's ROADMAP row records the count moving
  `2187 → 2240` against that unchanged floor with `GATE OK`. This phase only adds tests and
  cannot approach the floor from above.
- The 31 ledgered frontend failures are pre-existing debt. No plan in this phase edits any
  ledger, baseline or lock, and none of the eight files this phase creates is in that ledger.
- Convention (from `.planning/codebase/`): tests live in a sibling `__tests__/` directory,
  named `<subject>.test.ts(x)`, each file writing its own local `make*` builders — there is
  no shared fixture module and one must not be introduced.
- `URL.createObjectURL` is already stubbed for download-button tests in
  `src/components/results/__tests__/ActionsBar.test.tsx`; the `DeedClauseSection` test reuses
  that pattern rather than inventing one.

---

## 11. The journey references trap

`journey/REFERENCES.md` and the run's standing rule: a step's perceptual reference may be
re-approved only when the diff is confined to the deleted sidebar navigation region.
`DeedClauseSection` adds a visible block to `[data-testid="results-view"]`, so
`results-view` and `results-family-tree` — **already failing and withheld for human review
since Phase 16** — will differ further. That is expected and must not be resolved by this
phase.

**No plan in Phase 22 runs `node journey/approve.mjs` or writes any file under
`frontend/journey/references/` or `frontend/journey/pdf-references/`.** The proof is
`git log --name-only` over the phase's commits returning zero matching paths, and it is a
`must_haves.truths` entry on every plan.

---

## 12. Validation Architecture

| Layer | What it samples | Command | Latency |
|---|---|---|---|
| Unit — pure builders | the ZIP writer, the line model, the clause text, the DOCX bytes | `cd frontend && npx vitest run src/lib/deed` | ~5 s |
| Unit — renderer | the section renders the clause and the buttons call the builders | `cd frontend && npx vitest run src/components/results/__tests__/DeedClauseSection.test.tsx` | ~8 s |
| Type | branded money units, `noUncheckedIndexedAccess` | `cd frontend && npx tsc -b --force` | ~40 s |
| Suite | no regression anywhere in the frontend | `cd frontend && npm run test` | ~4 min |
| Integration — live | clause and DOCX vs a same-run engine computation in a real browser | `cd frontend && npx tsx journey/deed-parity.ts` | ~3 min |
| Meta | the plan lint, the gate lock, planning truth | `node scripts/check-plan-closed-world.mjs`, `node scripts/check-gate-manifest.mjs`, `node scripts/check-planning-truth.mjs` | ~3 s |

Every task in every plan carries at least one of these as its `<verify>`. No three
consecutive tasks lack an automated verify.

### The gate must be observed failing before it is registered

`.planning/PLAN-STANDARD.md` and Phase 21's own `21-GATE-OBSERVATIONS.md` establish this:
a gate nobody has seen fail is not known to be a gate, and Phase 21 recorded that **two of
its four injections initially passed**. Phase 22 repeats the discipline with four injections
against G38, each applied to a scratch copy and reverted:

1. one centavo added to a heir's stated amount → `DEED AMOUNT MISMATCH`
2. one centavo subtracted from a different heir's stated amount → `DEED AMOUNT MISMATCH`
3. one heir line dropped from the clause → `HEIR LINE MISSING`
4. one article removed from a line's article list → `DEED AUTHORITY MISMATCH`

Injections 1 and 2 in opposite directions is the pattern the ROADMAP's Phase 21 criterion 5
demanded and Phase 21 delivered.

---

## 13. Open risks, named

| Risk | Mitigation in the plans |
|---|---|
| Word rejects a stored-entry DOCX | The gate re-reads the archive through its central directory and asserts the three-part set, which is the structural claim; a unit test additionally asserts the local-header and EOCD signatures and the CRC of each part. |
| `results-view` journey step drifts further | Expected and disclosed in §11. No reference is approved. |
| A refusal string is mistaken for a peso figure by the gate parser | `parseDeedPesos` throws on any string that is not the exact grammar, and refused lines carry no amount token at all — the gate asserts a refused line contains no `PHP ` token. |
| G38 is registered but never reached by the suite | Stated plainly, not papered over: order 35 is after the halt at G17. The phase runs G38 directly and pastes its output. |
| The clause is mistaken for a complete deed | Criterion 6. The clause's own fixed heading block states it is the schedule clause only and enumerates what it is not. |

---

## RESEARCH COMPLETE
