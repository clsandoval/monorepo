# Phase 21 — Research: BIR Form 1801 Exit

**Measured:** 2026-08-01, against the working tree at branch `gsd/deletion-milestone`.
Every number below was produced by a command run during this research pass. Nothing here is quoted
from an earlier phase's prose without being re-measured.

---

## 0. The authority boundary, established before anything is designed

Phase 20 recorded that supplying a §248 rate is a point of Philippine law and refused. This phase has
the mirror-image question and it resolves the other way, so the boundary is drawn explicitly here
before any plan uses it.

**What this phase must NOT do.** Decide which BIR line a deduction belongs on, invent a NIRC section
for a line, or resolve a contested reading. Q4 (Art. 992), Q6 (over-estate donation) and Q8 (RA 11642)
stay untouched — none of them is on the estate-tax path.

**What this phase MAY do, and why it is not a legal judgment.** `specs/estate-tax-engine-spec.md`
already assigns every Form 1801 item number and, where one exists, the NIRC section, in its own
section headings and in its §17 *Form 1801 Output Contract* table. Reading a mapping out of the
committed spec and writing it into code is a **transcription**, the same operation
`lib/estate-tax-engine/penalties.ts` performed on spec §21 for the filing deadline. The test that
separates the two: if the answer is already written down in a repository spec, transcribing it is
allowed; if it is not, inventing it is prohibited and the line carries a spec reference instead.

Two lines have no NIRC section anywhere in the repository — funeral (spec §9.8) and
judicial/administrative (spec §9.9), both headed only *"Pre-TRAIN Only"*. **No section is invented for
them.** They carry a spec reference as their authority, exactly as the compromise-penalty line already
does today: measured, `penalties.lines[2].authority` is the literal string
`specs/estate-tax-engine-spec.md §2 Out of Scope`. The precedent exists in shipped code.

---

## 1. The reconciliation defect, measured rather than assumed

The audit claims *"Item 35A shows 0.00 against ₱5,000,000 applied"*. It is true, it is worse than
stated, and the root cause is a **type**, not a display bug.

### 1.1 The measurement

A probe was written at `frontend/scripts/_probe1801.ts`, run with `npx tsx`, and deleted afterwards.
It built a default `EstateTaxWizardState` with a `2020-06-15` date of death and one exclusive real
property (`fmvTaxDec` ₱8,000,000, `fmvBirZonal` ₱9,000,000) and called the real `computeEstateTax`.

```
SPECIAL_DEDUCTIONS_OBJECT {"item37a_family_home":0,"item37b_funeral_expenses":0,
                           "item37c_judicial_admin_expenses":0,"item37d_medical_expenses":0,
                           "total":500000000,"standardDeduction":500000000,"ra4917":0}
DISPLAYED_SPECIAL_SUM   0
ENGINE_SPECIAL_TOTAL    500000000
SPECIAL_SHORTFALL       500000000
ITEM_35A_DISPLAYED      0
GROSS_TOTAL             900000000
NET_TAXABLE             400000000   TAX_DUE 24000000
ITEM40_GROSS 400000000  ITEM44_TOTAL_DED 24000000
HAS_standardDeduction_KEY true
HAS_ra4917_KEY true
```

`SPECIAL_SHORTFALL 500000000` is ₱5,000,000 — the exact figure in the audit, now a measured integer.

### 1.2 What the lawyer sees today

On that fact set, `Form1801View` renders: Item 34 Total Gross Estate **9,000,000.00**, then every one
of its twelve deduction rows as **0.00**, then Net Taxable Estate **4,000,000.00**. Nine million minus
nothing is four million, printed on a return.

### 1.3 Three separate contradictions, not one

| # | Row as rendered | What it actually prints | What the engine computed |
|---|---|---|---|
| 1 | `35A` *Standard Deduction* | `ordinaryDeductions.item5a_standard_deduction` — which holds **funeral expenses**, 0 under TRAIN | the ₱5,000,000 standard deduction, in `specialDeductions.standardDeduction`, **displayed nowhere** |
| 2 | `40` *Gross Estate* → `4,000,000.00` | `output.item40_gross_estate` | that field holds the **net taxable estate**; row `34` on the same table already printed the gross estate as `9,000,000.00` |
| 3 | `44` *Total Deductions* → `240,000.00` | `output.item44_total_deductions` | that field holds the **net estate tax due**; total deductions is ₱5,000,000 |

Contradictions 2 and 3 are attested by the source itself. `frontend/src/lib/tax-bridge.ts:26-27`:

```
item40_gross_estate: number; // centavos — HISTORICAL name, holds net taxable estate
item44_total_deductions: number; // centavos — HISTORICAL name, holds net estate tax due
```

and `pipeline.ts:637-638` repeats it (`// NTE, NOT gross estate (backward compat)`). Rows `40`/`NTE`
and `44`/`Net Due` are therefore **duplicate values printed under contradictory labels**.

### 1.4 The root cause is one narrowed type

`computeSpecialDeductions` returns `SpecialDeductionsResultExtended`, which has `standardDeduction`
and `ra4917`. `EstateTaxFullOutput.specialDeductions` is typed as the **narrower**
`SpecialDeductionsResult`, which has neither. The values survive at runtime by object shorthand
(`HAS_standardDeduction_KEY true`), but no type-safe consumer can read them. The display did the only
thing the type permitted: it trusted the field *names*, and every misleading name in this engine —
`item5a_standard_deduction` holding funeral, `item40_gross_estate` holding NTE — became a wrong label
on a signed document.

Two sites construct the narrowed shape: the real return (`pipeline.ts`, shorthand) and
`makeErrorOutput` (`pipeline.ts:670-676`, an object literal with five keys and no
`standardDeduction`/`ra4917`). Widening the type breaks the second, which is correct: the compiler
names the site.

### 1.5 The engine's field names disagree with the spec's line letters

`ordinary-deductions.ts` documents its own mapping in its header, and it is **not** the spec's:

| Engine field | Holds | Spec line | Spec section |
|---|---|---|---|
| `item5a_standard_deduction` | funeral expenses | 5G | §9.8 |
| `item5b_claims_against_estate` | claims **plus** judicial/administrative | 5A + 5H | §9.2, §9.9 |
| `item5c_claims_vs_insolvent` | claims vs insolvent | 5B | §9.3 |
| `item5d_unpaid_mortgages` | unpaid mortgages | 5C | §9.4 |
| `item5e_unpaid_taxes` | unpaid taxes | 5C | §9.4 |
| `item5f_casualty_losses` | casualty losses | 5D | §9.5 |
| `item5g_vanishing_deduction` | vanishing deduction | 5E | §9.6 |
| `item5h_transfers_for_public_use` | transfers for public use | 5F | §9.7 |

`item5b` conflates two spec lines. `ordinary-deductions.ts:395-410` contains the author's own
reasoning about that decision, ending *"CLEANEST: item5a = funeral, item5b = claims + judicial"*. The
sum stays correct, so **this phase does not unpick it** — it labels the row for what it holds and
records the conflation. Renaming eight engine fields is a separate change with a wide blast radius
and no requirement owning it.

---

## 1a. A second, larger contradiction found while measuring the first — funeral and judicial are in BOTH schedules

Designing the line model required knowing which schedule each engine field belongs to. Reading them
side by side showed that funeral and judicial/administrative expenses are computed **twice**, by two
different modules, and land in both `ordinaryDeductions` and `specialDeductions`. Both totals are then
subtracted. A second probe was written, run and deleted:

```
--- DOD 2015-06-15 rules PRE_TRAIN     (funeral P100,000, judicial P50,000, gross P9,000,000)
  ord.item5a(funeral) 10000000   ord.item5b(claims+jud) 5000000   ord.total 15000000
  sp.item37b(funeral) 10000000   sp.item37c(judicial) 5000000
  sp.std 100000000               sp.total 115000000
  gross 900000000  afterOrd 895000000  netEstate 780000000  NTE 780000000

--- DOD 2020-06-15 rules TRAIN
  ord.item5a(funeral) 0   ord.item5b 0   ord.total 0
  sp.item37b 0            sp.item37c 0   sp.std 500000000   sp.total 500000000
  gross 900000000  afterOrd 900000000  netEstate 400000000  NTE 400000000
```

Arithmetic on the pre-TRAIN row: a single count of each deduction gives
`900000000 − (100000000 + 10000000 + 5000000) = 785000000`. The engine produced `780000000`. The
difference is `5000000` centavos — **the judicial/administrative expense, deducted twice**. The funeral
duplicate did not also land because `estateAfterOrdinary` clamps each column at zero and the funeral
copy sat alone in an empty conjugal column, so it was silently discarded instead. Both behaviours are
wrong and they are wrong in opposite directions.

**This phase does not fix it, and no plan here may.** Fixing it changes a tax figure, which needs its
own requirement, its own named test vector and its own gate; none of the five `RET-*` requirements
covers it, and inventing one during execution is precisely the open-world move `PLAN-STANDARD.md` §1
forbids. It is also not filed in `engine/BUGS.md`: `engine/tests/bugs_ledger.rs` deserialises every
entry's reproduction as a Rust `EngineInput` and runs the **succession** pipeline, so a TypeScript
estate-tax reproduction placed there would make `cargo test` fail to parse it. Filing it correctly
needs a change to that harness, which this phase also does not own.

**What this phase does instead is make it loud.** The roadmap's cross-cutting constraint for Phase 21
is that a return whose display contradicts its own arithmetic must not be given an exit. A pre-TRAIN
return that deducts the same expense in Schedule 5 and Schedule 6 is such a return. So the line model
detects the condition — a non-zero funeral or judicial amount present in both schedules — and emits a
manual-review warning that the screen, the PDF and the CSV all print. Detecting an arithmetic
self-inconsistency the engine produced is not a point of law and requires no reading of the NIRC; the
warning names the condition and declines to say which schedule is right.

Both rows are still rendered, each under its own schedule, because each schedule must reconcile to its
own engine total. Hiding one row would make the return *look* consistent while the tax due stayed
wrong, which is the failure this project ranks as worse than a loud stop.

---

## 2. There is no export of any kind, and the audit's grep is reproduced

```
$ grep -rn "react-pdf\|downloadPDF\|generatePDF" src/components/tax/
(no output)
$ grep -rln "form-1801-view\|form-line-" journey/ | wc -l
0
```

Zero. Confirmed twice: no export from the estate-tax surface, and **no journey step renders
`Form1801View`** — the eight `tax-tab-*` steps capture wizard tabs at `?tab=0..7` and never press
Compute. The journey reference rule therefore has nothing to bite on in this phase, and no plan here
may create, modify or approve a reference image.

`@react-pdf/renderer` **is** already a dependency at `^4.3.2` (`package.json:19`) — the estate-tax
surface simply never used it. No new npm dependency is required by this phase, for the PDF or the CSV.

---

## 3. The export patterns this phase copies rather than invents

Everything needed already exists on the succession side and is gate-proven by G22–G25.

| Concern | Existing artifact | What Phase 21 does |
|---|---|---|
| Blob generation + download | `src/lib/pdf-export.ts` (`generatePDF`, `downloadPDF`, `buildPDFFilename`, `slugifyName`) | mirror the shape for the return |
| Document composition | `src/components/pdf/EstatePDF.tsx` + eight section components | one new document, one new table section |
| PDF-safe money | `src/components/pdf/pdf-text.ts` (`formatPesoPdf`, `PDF_PESO_PREFIX = 'PHP '`) | **reuse, never re-write** |
| Reading a produced PDF | `journey/pdf.mjs` — the single `pdftotext` seam, poppler 22.02.0 | reuse |
| Obtaining a PDF as a user does | `journey/pdf-capture.mjs` — clicks the real button, `PDF_FIXED_CLOCK = '2026-06-15T00:00:00Z'` | mirror for the tax route |
| Exact-centavo parity discipline | `journey/money-parity.mjs` (G19) and `journey/pdf-structure.mjs` (G23) | mirror; BigInt only, both directions, no tolerance |
| Component test of a PDF tree | `src/components/pdf/__tests__/pdf.test.tsx` — mocks `@react-pdf/renderer` to HTML | reuse the mock block |

**The peso sign is the landmine.** `pdf-text.ts` records the measurement: the base-14 WinAnsi fonts
write `₱` as byte `0xB1`, which extracts as `±` at near-zero advance width and overprints the first
digit. Any new PDF text that prints a peso amount must go through `formatPesoPdf`. A second formatter
in the export layer would be the duplicate-implementation defect EXT-02 forbids.

`Form1801View` currently carries a **third** money formatter — a local `formatPesos` at
`Form1801View.tsx:29` that emits `en-US` grouped digits with exactly two decimals and **no currency
mark** (`5,000,000.00`). It is not `formatPeso` from `src/types/index.ts` and not `formatPesoPdf`. The
gate's screen parser must invert *that* function, and the plan says so explicitly rather than assuming
the `₱`-prefixed grammar the succession gates parse.

---

## 4. Attribution: the engine emits the section, no other layer derives one

Phase 17 made the engine the single attribution authority and gate **G14**
(`scripts/check-citation-integrity.mjs`) enforces it with the marker `LAYER DERIVES ARTICLE`, over a
hardcoded `DISPLAY_LAYERS` array. Today that array lists four succession components and its regex is
`/Art\.\s*\d/` — Civil Code articles only. It does not yet cover the tax surface or NIRC sections.

The tax engine has exactly one attribution site today: `PenaltyLine.authority`
(`penalties.ts:151,300,309,318`). Measured on a real run:

```
PENALTY_LINES [{"a":"NIRC Sec. 248","s":"declined","c":null},
               {"a":"NIRC Sec. 249","s":"declined","c":null},
               {"a":"specs/estate-tax-engine-spec.md §2 Out of Scope","s":"declined","c":null}]
```

**RET-04 therefore needs an authority on every Form 1801 line, emitted by the engine.** The design
consequence is the central architectural decision of this phase (§6).

### 4.1 The authority literal for every line, transcribed from the spec

Rule, mechanical and free of judgment: *the authority is the NIRC section stated in the heading of the
spec section that defines the rule producing the line; where the heading states none, it is the spec
section reference itself.* Applied:

| Line | Authority literal |
|---|---|
| 29, 30, 31, 33 (gross estate components) | `specs/estate-tax-engine-spec.md §8 Gross Estate Computation` |
| 32 taxable transfers | `NIRC Sec. 85(B)–(G)` — spec §8.3 heading, line 746 |
| 34 total gross estate | `specs/estate-tax-engine-spec.md §8 Gross Estate Computation` |
| 5A claims against estate (+ judicial, see §1.5) | `NIRC Sec. 86(A)(1)(a)` — spec §9.2 heading, line 778 |
| 5B claims vs insolvent | `NIRC Sec. 86(A)(1)(b)` — spec §9.3 heading, line 794 |
| 5C unpaid mortgages; 5C unpaid taxes | `NIRC Sec. 86(A)(1)(c)` — spec §9.4 heading, line 808 |
| 5D casualty losses | `NIRC Sec. 86(A)(1)(e)` — spec §9.5 heading, line 830 |
| 5E vanishing deduction | `NIRC Sec. 86(A)(2)` — spec §9.6 heading, line 845 |
| 5F transfers for public use | `NIRC Sec. 86(A)(3)` — spec §9.7 heading, line 890 |
| 5G funeral expenses | `specs/estate-tax-engine-spec.md §9.8` — **no NIRC section stated anywhere in the repository** |
| 5H judicial/administrative | `specs/estate-tax-engine-spec.md §9.9` — **no NIRC section stated anywhere in the repository** |
| 35 total ordinary deductions | `specs/estate-tax-engine-spec.md §9.10` — spec line 955 |
| 37A standard deduction | `NIRC Sec. 86(A)(4) / 86(B)(1)` — spec §10.1 heading, line 975 |
| 37B family home | `NIRC Sec. 86(A)(5)` — spec §10.2 heading, line 993 |
| 37C medical expenses | `RA 8424 Sec. 86(A)(6)` — spec §10.3 heading, line 1017 |
| 37D RA 4917 | `NIRC Sec. 86(A)(7)` — spec §10.4 heading, line 1040 |
| 37 total special deductions | `specs/estate-tax-engine-spec.md §10.5` — spec line 1052 |
| 39 spouse share | `specs/estate-tax-engine-spec.md §11 Surviving Spouse Share (Schedule 6A)` — spec line 1064 |
| 40 net taxable estate | `specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract` — spec line 1544 |
| 41/42 rate and tax due | `specs/estate-tax-engine-spec.md §12 Tax Rate Application` — spec line 1139 |
| 43 foreign tax credit | `specs/estate-tax-engine-spec.md §13 Foreign Tax Credit` — spec line 1196 |
| 44 net estate tax due | `specs/estate-tax-engine-spec.md §17 Form 1801 Output Contract` |
| S-248 / I-249 / CP / Total | already emitted — read `penalties.lines[n].authority` verbatim |

Every literal in that table is a copy of a heading already in the repository. None is a new claim.

---

## 5. The spec's own Form 1801 contract, which fixes the item numbering

`specs/estate-tax-engine-spec.md` §17 (line 1544) is the authority for which engine value belongs on
which item. Where the display disagrees with it today, the display is wrong:

```
| 37A | Standard Deduction | specialDeductions.standardDeduction |
| 37B | Family Home        | specialDeductions.familyHome        |
| 37C | Medical Expenses   | specialDeductions.medicalExpenses   |
| 37D | RA 4917            | specialDeductions.ra4917            |
| 38  | Net Estate         | max(0, Item36.total − Item37)       |
| 39  | Share of Surviving Spouse | spouseShare.spouseShare      |
| 40  | Net Taxable Estate | max(0, Item38 − Item39)             |
| 44  | Net Estate Tax Due | max(0, Item42 − Item43)             |
```

Validation rule 9 in the same section states `Item37A = 5_000_000` for a citizen/resident under TRAIN
— which is the number the probe measured as invisible.

The display today numbers the special deductions `37A family home / 37B funeral / 37C judicial / 37D
medical` and calls the spouse share `38`. All five disagree with §17. Funeral and judicial have no
Part IV item number in §17 at all, because TRAIN repealed them; they are Schedule 5 lines and belong
in the ordinary block, which is where the engine already puts them.

---

## 6. The architectural decision: one line model, three renderers

**Decision.** A single engine-side module builds the Form 1801 line array once; the screen, the PDF
and the CSV all render that array and none of them constructs a line, a label, an item number or an
authority of its own.

**Why this and not three renderers reading the output object.** Criterion 5 requires the three
surfaces to agree. Three independent mappings from `EstateTaxFullOutput` to rows is three chances to
reproduce the Item-35A defect, in three places, with one gate hoping to catch all of them. With one
line model the surfaces *cannot* disagree about which rows exist or what they are called — the gate is
then verifying rendering fidelity, which is a much smaller and much more tractable property. It is
also the only shape in which CLAUDE.md invariant 5 (*one implementation per rule*) survives contact
with an export layer, and the only shape in which G14's `LAYER DERIVES ARTICLE` rule can be extended
to the tax surface without an exception list.

**Where it lives.** `frontend/src/lib/estate-tax-engine/form1801-lines.ts`, inside the engine package,
because the authority strings are engine data. Not in `components/`, which would make a display layer
the attribution authority.

**The reconciliation invariant travels with the model.** The module exports a checker asserting, in
exact integers and in both directions, that the ordinary rows sum to `ordinaryDeductions.total` per
column and the special rows sum to `specialDeductions.total`. Today the second fails by exactly
500000000 centavos. That is criterion 1 made executable rather than eyeballed.

---

## 7. CSV: written, never parsed

The audit's `papaparse` recommendation is about **import**, a future phase. This phase only writes.

**No dependency is added.** A writer with a stated escaping rule is a dozen lines; the classic
quoted-comma corruption is a *parser* hazard. The rule is fixed in the plan: a field is wrapped in
double quotes when it contains a comma, a double quote, CR or LF; an embedded double quote is doubled;
the line terminator is CRLF; the file opens with a header row. Property locations and title numbers do
contain commas, which is exactly why the rule is stated rather than assumed.

**The CSV carries the raw centavo integer in its own column**, alongside the formatted peso string.
Criterion 3 says *"carrying the same centavo integers"*, and a CSV that only carries `5,000,000.00`
forces its reader to re-parse a locale-formatted string. The integer column is what the gate compares.

---

## 8. The gate

**Id.** `G37`. Not `G36`: `frontend/scripts/check-penalty-refusal.ts` exists on disk from Phase 20 but
was never registered (its registration is owner-blocked). Reusing `G36` would collide.

**Order.** `34`, with `G8` shifting to `35` and `G9` to `36`. `G9` stays last, the invariant every
prior phase has kept. Registering ahead of the current halt at `G17` (order 15) would move the halt
earlier and cost the run coverage it has today — the mistake Phase 20 identified and avoided.

**Shape.** `frontend/journey/return-parity.ts`, run as `cd frontend && npx tsx journey/return-parity.ts`.
TypeScript rather than `.mjs` because it must import the TS tax engine directly;
`scripts/check-one-fact-set.ts` is the precedent and it already imports both
`../src/lib/estate-tax-engine` and `../journey/engine.mjs` under `npx tsx`.

**What it does.** Seeds `cases.tax_input_json` (an input, not a result — `check-seed-fixture.mjs`
rejects a seeded `output_json` with `SEED WRITES OUTPUT`, and this is not that), drives a real browser
to the tax route, presses the real Compute button, then:

1. scrapes every `[data-testid^="form-line-"]` row and parses the total cell with the exact inverse of
   `Form1801View`'s local `formatPesos`;
2. clicks the real Export PDF button, takes the download bytes, extracts text through `journey/pdf.mjs`;
3. clicks the real Export CSV button, takes the download bytes, parses the centavo column;
4. computes the expected values by calling `computeEstateTax` on the same seeded state **in the same
   run**, and compares all three sets as BigInt, in both directions.

**Both directions matters.** A one-directional check passes a surface that silently dropped Item 37A
— which is precisely today's bug. The set of item ids must match exactly, not merely overlap.

**Exit contract.** The project's three-valued one: 0 pass, 1 fail, 2 cannot run. A stopped Supabase
stack, a missing `pdftotext`, a download that never arrives, or bytes that do not begin `%PDF-` are all
exit 2 — never a pass, and never a failure.

**No expected figure is committed.** Roadmap cross-cutting constraint, and the discipline G19
established. The seeded fixture holds *facts*; every peso figure the gate compares is computed during
the run.

---

## Validation Architecture

### The property being validated, and why it is easy to fake

*"The three surfaces agree with the engine"* is trivially satisfiable by a surface that renders
nothing. An empty table agrees with everything. Every positive assertion in this phase is therefore
paired with a **set-identity** assertion: the set of item ids the surface shows must equal the set the
line model produced. That single pairing is what turns "no disagreement found" into "nothing was
dropped", and it is the assertion that would have caught Item 37A on the day it went missing.

The second fakeable property is the reconciliation itself. `sum(rows) === total` passes when both
sides are zero. Every reconciliation assertion is therefore run against a fact set whose expected
special-deduction total is a **non-zero** 500000000 centavos, and the test asserts that figure is
non-zero before asserting the equality.

### Sampling levels

| Property | Levels | Why one is not enough |
|---|---|---|
| Item 37A carries the standard deduction (RET-01) | type (`tsc`), unit (`form1801-lines`), component (rendered row), gate (real browser) | The defect was invisible at the type level and at the unit level simultaneously — the value existed at runtime and the type forbade reading it. Only sampling both catches that class. |
| Rows reconcile to the engine totals (RET-01) | unit, both columns and both directions | A per-column check catches a row assigned to the wrong column; a total-only check does not. |
| PDF carries the same integers (RET-02) | component (mocked renderer), gate (real `pdftotext` over real bytes) | The mocked-component level proves composition; only the real extraction catches the WinAnsi peso corruption that `pdf-text.ts` documents. |
| CSV carries the same integers (RET-03) | unit (escaping table), gate (real download) | The escaping rule is testable only at the unit level; that the browser actually produced the file is testable only at the gate level. |
| Every line carries its section (RET-04) | unit (every line has non-empty `authority`), source (`grep` for a hardcoded section literal in any renderer), gate | A section held in the engine and dropped by the renderer is the Item-35A defect wearing different clothes. |
| The gate can fail (RET-05) | four injections, observed | An unfalsified gate is decoration. |

### Every failure path is observed before it is trusted

`21-07` observes `journey/return-parity.ts` exit 1 on four separately injected regressions, restoring
the source between each and confirming a return to exit 0:

1. add one centavo to a displayed row → `DISPLAY DISAGREES`;
2. subtract one centavo from a PDF row → `PDF DISAGREES`;
3. add one centavo to a CSV centavo cell → `CSV DISAGREES`;
4. delete the Item 37A row from the line model → `LINE SET MISMATCH`.

Injection 4 is the load-bearing one. The first three catch arithmetic drift; only the fourth catches
the failure this phase exists to remove — a row that is simply not there.

### Null controls

| Control | Expectation |
|---|---|
| `cd engine && cargo test` | `546 passed; 0 failed` — this phase edits no Rust |
| `node scripts/check-citation-integrity.mjs` (G14) | exit 0 before and after |
| `cd frontend && npx tsx scripts/check-one-fact-set.ts` (G34) | exit 0 — no date field is added |
| `node scripts/check-lawyer-agenda.mjs` (G10) | exit 0 — no legal question is opened or answered |
| `grep -c "\[x\]" .planning/LAWYER-AGENDA.md` | `0` before and after |
| `frontend/test-baseline.json`, `assertion-baseline.json`, `gate-skips.lock` | unmodified by every commit in this phase |
| `frontend/journey/references/` | zero files touched — no step renders `Form1801View` (measured, §2) |

---

## 9. What this phase does not claim

- **`bash scripts/ci-gates.sh` exit 0 is not achievable here and must not be claimed.** The suite halts
  at `G17` (order 15) with 15 journey steps withheld for human review since Phase 16, and `G20`/`G21`
  remain registered blocking gates whose scripts commit `4ccf06270` deleted. All three are owner
  actions under CLAUDE.md invariant 2, enforced by `G5`. This phase appends one gate at order 34 and
  touches no other gate.
- **The `item5b` claims/judicial conflation is not unpicked** (§1.5). It is labelled honestly and
  recorded; renaming eight engine fields has no requirement owning it.
- **No surcharge, interest or compromise-penalty figure is computed.** Those lines render exactly what
  Phase 20 emits — `NOT COMPUTED` and `OUTSIDE ENGINE COMPETENCE` — in the PDF and the CSV as well as
  on screen. An export that printed `0.00` where the screen prints `NOT COMPUTED` would reintroduce the
  understatement Phase 20 removed, one layer down.
