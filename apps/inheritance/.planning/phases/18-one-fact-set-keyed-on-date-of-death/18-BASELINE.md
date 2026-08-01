# Phase 18 Baseline — both date-of-death spines, measured before either was touched

**Measured:** 2026-08-01, during plan `18-01`, in this tree, on branch `gsd/deletion-milestone`.

Every figure in this file was printed by a command run inside plan `18-01`. Nothing here was copied
from `18-RESEARCH.md`. Where a figure agrees with the research document, it agrees because it was
re-run, not because it was quoted; where this file and `18-RESEARCH.md` disagree, **this file is the
authority**.

The two probe files (`frontend/scripts/probe-18-01-tax.ts` and
`frontend/scripts/probe-18-01-succession.ts`) were written, run and deleted inside the same
verify block. Neither survives, and this plan modified no file under `engine/`, `frontend/src/`,
`frontend/journey/` or `scripts/`.

The engine artifact every succession figure came through:

```
-rw-rw-r-- 1 clsandoval clsandoval 616408 Aug  1 06:09 src/wasm/pkg/inheritance_engine_bg.wasm
-rw-rw-r-- 1 clsandoval clsandoval   7099 Aug  1 06:09 src/wasm/pkg/inheritance_engine.js
```

---

## 1. Date-of-death editors and boundary crossings

```
TAX_EDITOR 1
INTAKE_EDITOR 1
WIZARD_EDITOR 1
PREPOPULATE_USES 0
TAX_ROUTE_CROSSINGS 5
```

Resolved to lines:

```
src/components/tax/tabs/DecedentTab.tsx:93:              onChange={(e) => update({ dateOfDeath: e.target.value })}
src/components/intake/DecedentInfoStep.tsx:75:            onChange={(e) => update({ date_of_death: e.target.value })}
src/components/wizard/DecedentStep.tsx:90:          name="decedent.date_of_death"
```

There are **two storage locations**, not two editors-per-location:

- `EstateTaxWizardState.decedent.dateOfDeath` — the tax spine. Exactly **one** control writes it,
  `DecedentTab.tsx:93`. This is the count plan `18-03` drives to **0**.
- `EngineInput.decedent.date_of_death` — the succession spine. **Two** controls write it, the intake
  step and the succession wizard step, but they write the *same* field of the *same* object. They
  are one editor of one spine, and no plan in this phase removes either.

`PREPOPULATE_USES 0` confirms `prePopulateFromEngineInput` — the adapter that would have carried the
date across — has **zero production callers**. It was written and never wired.

### The five `row.` lines: what actually crosses the engine boundary today

```
56:        setDecedentName(row.decedent_name ?? 'Decedent');
57:        if (row.tax_input_json) {
58:          setTaxState(row.tax_input_json as EstateTaxWizardState);
97:        if (row.input_json) {
98:          const { bridgedOutput } = await runTaxBridge(row.input_json, output);
```

Read line by line, only **line 56** carries a decedent fact from the case row into the tax path.
Lines 57–58 restore the tax spine's own previously-saved state — that is the second spine being
rehydrated, not a crossing. Lines 97–98 pass `input_json` to the tax *bridge*, not to the tax wizard
state. So the audit's claim holds against read lines and not merely against a count: **exactly one
field, `decedent_name`, crosses from the succession fact set into the tax fact set.** The date of
death does not.

`git status --porcelain -- apps/inheritance/frontend` after this task printed only the pre-existing
untracked `apps/inheritance/frontend/journey-measure-tmp.mjs`, which predates this plan and is not
attributable to it. No tracked file was modified.

---

## 2. Tax-engine response to the date of death

One fact set (`createDefaultEstateTaxState()`, decedent `Probe` of Quezon City, executor `Exec`, one
exclusive cash personal property of FMV 10,000,000, `specialDeductions.medicalExpenses` 400,000),
computed three times differing only in the date of death:

```
DOD[2017-12-31] rules=PRE_TRAIN medical=40000000 tax_due=100500000 warnings=1
DOD[2018-01-01] rules=TRAIN medical=0 tax_due=30000000 warnings=1
DOD[] rules=TRAIN medical=0 tax_due=0 warnings=1
```

| date of death | `deductionRules` | `item37d_medical_expenses` (centavos) | `tax_due` (centavos) | `warnings` |
|---|---|---|---|---|
| `2017-12-31` | `PRE_TRAIN` | `40000000` | `100500000` | 1 |
| `2018-01-01` | `TRAIN` | `0` | `30000000` | 1 |
| `` (empty) | `TRAIN` | `0` | `0` | 1 |

Three readings, each load-bearing for a later plan:

1. **One day moves the regime.** `2017-12-31` → `2018-01-01` flips `deductionRules` from `PRE_TRAIN`
   to `TRAIN`, zeroes the repealed medical deduction (40,000,000 → 0 centavos) and moves `tax_due`
   by 70,500,000 centavos (100,500,000 → 30,000,000). The two `tax_due` integers **differ**, which
   is the condition plan `18-01` required before believing the harness at all.
2. **The tax spine is genuinely date-driven.** This is the concrete cost of two spines that can
   disagree: a date typed correctly on one screen and incorrectly on the other changes the tax due
   by a factor of more than three, with nothing on either screen saying so.
3. **The empty date does not throw.** `computeEstateTax('')` returns a *fully-formed* return with
   `rules=TRAIN`, `medical=0` and `tax_due=0`, and exactly **one** warning — the same warning count
   the two valid dates produce. There is no signal in the warning count distinguishing "no date
   entered" from "date entered". This zero-filled, silently-TRAIN result is the behaviour plan
   `18-04` replaces with a loud refusal.

---

## 3. Succession-engine response to the date of death

Every committed corpus input under `engine/examples/{cases,coverage-cases,testate-cases,fuzz-cases,defect-cases}`
run twice through the compiled WASM engine — once as committed, once with `decedent.date_of_death`
replaced by `2010-05-05` (or `2030-05-05` where the committed date was already `2010-05-05`) — and
the serialized outputs compared:

```
files=173 computed=171 rejected=2 ra8552_inputs=4 heir_rows=652 outputs_changed_by_dod=0
CHANGED_FILES (none)
```

| quantity | value |
|---|---|
| corpus files found | `173` |
| inputs the engine computed | `171` |
| inputs the engine rejected | `2` |
| inputs containing the literal `Ra8552` | `4` |
| heir rows across the first computation | `652` |
| `outputs_changed_by_dod` | `0` |
| `CHANGED_FILES` | `(none)` |

The three anti-vacuity counts all came back positive — `files=173`, `computed=171`, `heir_rows=652`
— so the `0` is a measurement of the engine and not a glob that matched nothing. `ra8552_inputs=4`
proves the corpus actually exercises the adoption regime, so the `0` is not an artifact of the
adoption path never being reached. `rejected=2` are the two `defect-cases`, which exit non-zero by
design.

**The succession engine's output is invariant to the decedent's date of death, over the entire
committed corpus.** That is a measurement of what is, not a target and not a defect to repair here.

---

## 4. What this phase will hold fixed

Plan `18-06` re-measures the following and proves none of them moved. Any drift in these figures
means this phase changed a legal outcome, which it is forbidden to do.

| quantity | held-fixed value |
|---|---|
| `deductionRules` at `2017-12-31` | `PRE_TRAIN` |
| medical deduction at `2017-12-31` | `40000000` centavos |
| `tax_due` at `2017-12-31` | `100500000` centavos |
| `deductionRules` at `2018-01-01` | `TRAIN` |
| medical deduction at `2018-01-01` | `0` centavos |
| `tax_due` at `2018-01-01` | `30000000` centavos |
| `outputs_changed_by_dod` over 171 computable inputs | `0` |

The one figure this phase *does* move is `TAX_EDITOR`, from `1` to `0` (plan `18-03`). Everything
else above is a constant.

The `DOD[]` row is deliberately **not** in the held-fixed table. It is the one behaviour plan
`18-04` intends to change: from a silent zero-filled return to a refusal.

---

## 5. RA 11642 and LAWYER-08

Measured, in this document's own words:

**The succession engine reads the decedent's date of death at no production site.** Section 3's
`outputs_changed_by_dod=0` over 171 computable inputs and 652 heir rows is the evidence. The RA 11642
retroactivity flag keys on the **adoption decree date**, not on the date of death.

Whether the succession engine *ought* to read the date of death — whether RA 11642 Sec. 41's
retroactivity is properly keyed to the decedent's death rather than to the decree — is an
**unanswered point of Philippine law**, tracked as question **`LAWYER-08`** with status
`awaiting-answer`. The lawyer is unreachable. This phase therefore does not decide it, does not
guess a reading, and does not move the outcome in either direction.

Concretely, and by name: **no plan in Phase 18 edits `engine/src/flags.rs`,
`.planning/lawyer-decisions.json` or `.planning/LAWYER-AGENDA.md`.** Phase 18 routes one date to one
place and makes disagreement about it impossible to keep quiet. It does not change what the law says
about that date.

This has one consequence worth stating plainly, because it is a success criterion this phase cannot
meet: the roadmap's criterion that unifying the date "changes **both** engines' output" **cannot be
satisfied without deciding `LAWYER-08`.** The succession engine's output is invariant to the date of
death, and making it vary is the legal decision this phase is forbidden to take. The criterion is
reported unmet, with this measurement as the reason, rather than met by moving a rule nobody ruled on.
