# Phase 18 — Research: One Fact Set, Keyed on Date of Death

**Written:** 2026-08-01
**Method:** every number below came from a command run in this session against this working tree
(`gsd/deletion-milestone`, HEAD at the Phase 17 commits). Nothing here is quoted from the vision
audit without re-measurement, and where the audit and the tree disagree the tree wins and the
disagreement is called out.

---

## 1. The claim under test

The vision audit ranks this third: *"One fact set across both engines, with date of death as the
single keyed spine. Today only `decedent_name` crosses. Date of death is entered twice with no
equality check, and it drives TRAIN vs pre-TRAIN, the repealed ₱500K medical deduction, and RA 11642
retroactivity."*

Three of those four sub-claims are confirmed exactly. **One is false**, and it is load-bearing for
how this phase must be planned.

| Sub-claim | Verdict | Evidence (section) |
|---|---|---|
| Only `decedent_name` crosses the boundary | **CONFIRMED** | §2 |
| The date is entered twice with no equality check | **CONFIRMED** | §3 |
| The date drives TRAIN vs pre-TRAIN and the repealed medical deduction | **CONFIRMED, with figures** | §5 |
| The date drives RA 11642 retroactivity | **FALSE as implemented** | §6 |

---

## 2. What crosses the engine boundary today

`frontend/src/routes/cases/$caseId.tax.tsx:56` is the whole of it:

```
setDecedentName(row.decedent_name ?? 'Decedent');
if (row.tax_input_json) { setTaxState(row.tax_input_json as EstateTaxWizardState); }
```

`decedentName` is a bare `useState('')` string passed to `EstateTaxWizard` as a display prop. Nothing
else from the succession fact set reaches the tax path. When `tax_input_json` is null the tax wizard
starts from `createDefaultEstateTaxState()`, whose `decedent.dateOfDeath` is the empty string
(`frontend/src/types/estate-tax.ts:292`) — measured directly, printing `default dod=[]`.

**A ready-made adapter already exists and has zero production importers.**
`prePopulateFromEngineInput` (`frontend/src/types/estate-tax.ts:364`) takes an `EngineInput` and
returns a partial wizard state carrying `dateOfDeath: decedent.date_of_death`. Measured:

```
$ grep -rn "prePopulateFromEngineInput" src/ | grep -v __tests__
src/types/estate-tax.ts:364:export function prePopulateFromEngineInput(
```

One hit, its own definition. The function that would have crossed the date was written and never
wired. This is the shape of the defect: not an oversight about *whether* to share the fact, but a
seam that was built and left unconnected.

## 3. The two date-of-death fields

| Path | File | Binding | Storage |
|---|---|---|---|
| Guided intake (case creation) | `frontend/src/components/intake/DecedentInfoStep.tsx:74-75` | `update({ date_of_death: e.target.value })` | → `EngineInput.decedent.date_of_death` via `lib/intake.ts:75` |
| Succession wizard | `frontend/src/components/wizard/DecedentStep.tsx:90` | `<DateInput name="decedent.date_of_death">` | `EngineInput.decedent.date_of_death` |
| **Estate-tax wizard** | `frontend/src/components/tax/tabs/DecedentTab.tsx:92-93` | `update({ dateOfDeath: e.target.value })` | **`EstateTaxWizardState.decedent.dateOfDeath`** |

The first two write **the same field of the same object**. Intake creates the case and the succession
wizard edits it thereafter; they are one editor over one storage location, not two spines. The third
writes a **different field of a different object**, persisted to a **different JSONB column**
(`cases.tax_input_json` versus `cases.input_json`). That is the seam.

`frontend/src/lib/cases.ts:25,54` projects `input_json.decedent.date_of_death` into the
`cases.date_of_death` column on every create and every succession-side update.
`updateCaseTaxInput` (`cases.ts:61-71`) writes `tax_input_json` **and nothing else** — the tax path
has never touched the column. So the column is already a faithful projection of the succession spine
and needs no migration; what is missing is a reader on the tax side and a check that the two agree.

**There is no equality check anywhere.** Measured: zero occurrences of any comparison between
`input_json`'s date and `tax_input_json`'s date in `frontend/src/`.

## 4. An absent date of death is currently silent, not loud

`frontend/src/lib/estate-tax-engine/validation.ts:27` raises `ERR_DATE_REQUIRED` for an empty date,
and `pipeline.ts:373` routes that to `makeErrorOutput(warnings)`. Measured behaviour of the real
engine on a default wizard state:

```
$ npx tsx  # computeEstateTax(createDefaultEstateTaxState())
NO THROW tax_due= 0 rules= TRAIN warnings= 1
```

It does not throw. It returns a complete, zero-filled return with `deductionRules: TRAIN` and one
warning buried in a `warnings` array. A lawyer with no date entered gets a ₱0 Form 1801 rather than a
refusal. This is the same failure mode the product identity forbids, one layer down from the seam
this phase closes, and it is why FACT-04's refusal has to live at the route rather than only in the
engine's warning list.

## 5. What the date actually drives on the tax side — with figures

Measured on one fact set (₱10,000,000 cash, ₱400,000 medical expenses, single, resident Filipino),
computed twice through the real `computeEstateTax` with only the date of death changed:

```
2017-12-31 regime=PRE_TRAIN rules=PRE_TRAIN medical=40000000 tax_due=100500000
2018-01-01 regime=TRAIN     rules=TRAIN     medical=0        tax_due=30000000
```

All figures in centavos. One day of difference in the date of death moves:

- **the regime**, `PRE_TRAIN` → `TRAIN` (`regime-detection.ts:detectRegime`, keyed on
  `TRAIN_EFFECTIVE_DATE`);
- **the repealed medical deduction**, ₱400,000 → ₱0 (`special-deductions.ts:computeMedicalDeduction`,
  gated on `deductionRules === 'PRE_TRAIN'`, capped at `MEDICAL_EXPENSE_CAP`);
- **the tax due**, ₱1,005,000 → ₱300,000 — a **₱705,000** swing on a ₱10M estate.

`getDeductionRules` (`types/estate-tax.ts:357`) is the second reader of the same boundary and feeds
`OrdinaryDeductionsTab` (`EstateTaxWizard.tsx:221`), which is why the funeral and judicial-admin
expense fields appear or vanish with the date.

This is the honest, provable form of the roadmap's success criterion 5 — *changing the date of death
once changes the engine's output* — and it needs no legal judgment to assert.

## 6. RA 11642 retroactivity does NOT read the date of death — measured

`engine/src/flags.rs:140-150` raises `RA_11642_RETROACTIVITY` when any family-tree member carries an
adoption whose `regime == Ra8552` and whose **`decree_date`** is before `RA_11642_BOUNDARY`
(`2022-01-01`). The decedent's date of death is not read.

That is not an inference from one file. Across the whole Rust engine:

```
$ grep -rn "date_of_death" engine/src/ | grep -v "^src/types.rs"
src/pipeline.rs:442:  date_of_death: "2024-01-01".to_string(),
src/step3_scenario.rs:250:  ...
src/step1_classify.rs:268,607,626,644,662
src/step10_finalize.rs:1379
src/step5_legitimes.rs:551
src/flags.rs:242
```

**Every single occurrence is a test fixture.** The succession engine reads
`decedent.date_of_death` at **zero production sites**.

Confirmed end-to-end by running the compiled WASM artifact over the whole committed corpus, computing
each input twice with two wildly different dates of death and comparing the serialized outputs:

```
files=173 rejected=2 ra8552_inputs=4 outputs_changed_by_dod=0
```

171 computable inputs, four of which carry an `Ra8552` adoption. **Zero outputs changed.** The
succession engine's output is today completely invariant to the date of death.

### The consequence for planning, stated plainly

Roadmap success criterion 5 reads *"Changing the date of death once changes **both** engines' output,
proven on a real case."* Against the tree as measured, that criterion **cannot be met without
deciding a contested point of Philippine law**, because the only Civil-Code rule the date of death
would key on the succession side is RA 11642 Sec. 41 retroactivity — question `LAWYER-08`, status
`awaiting-answer`, blocking requirement `LAW-12`, and named in this milestone's own overview as one
of the three questions no agent may decide.

The same phase's cross-cutting constraint settles it in the opposite direction:

> *"No peso figure and no legal outcome may change as a side effect of unifying the field. If one
> moves, that is a finding to report, not a result to accept."*

Making the succession output move **is** a legal outcome changing. The two lines of the roadmap
contradict each other, and the constraint is the one that binds: this phase routes the shared date
into the succession engine's input and proves it arrives there unchanged, proves the tax engine's
output moves with it, and reports the invariance as the finding it is. `config.retroactive_ra_11642`
stays inert and `engine/src/flags.rs` is not edited.

## 7. Where the new gate can actually execute

`bash scripts/ci-gates.sh` runs gates in manifest `order` and stops at the first blocking failure. On
this branch it halts at **G3** (`cd frontend && npm run test:gate`) on the Phase 16 owner-blocked test
floor (`min_total_tests: 2119`, currently ran 2079). Every gate at a later order — including the whole
journey suite G17–G25 — therefore never executes here.

Current order, measured from `gates.manifest.json`:

```
 9 G2  bash engine/build-wasm.sh
10 G14 node scripts/check-citation-integrity.mjs
11 G3  cd frontend && npm run test:gate     <-- halts
12 G4  cd frontend && npx tsc -b --force
...
34 G9  node scripts/check-gate-results.mjs  (stays last)
```

Phase 17 solved exactly this problem by registering G14 at order 10 — after G2, which builds the
artifact it reads, and deliberately before the halt. **Phase 18 takes order 11**, pushing G3 to 12 and
every later gate by one. `order` is not a locked field (`gates.manifest.lock` freezes only
`{id, command, blocking}`), so reordering is permitted and G5 stays green.

**A journey step is not an option for this phase's proof.** G17 sits at order 15 and needs a live
local Supabase plus a browser; it has never run on this branch. A journey step added here would be a
claim nobody could observe. Worse, the tax `DecedentTab` change guarantees the committed reference
for `tax-tab-0` no longer matches — and that diff is a wizard field, not the deleted sidebar nav, so
the journey reference rule **forbids** approving it. It is left failing and reported.

### The runner technology, spiked rather than assumed

The check has to execute the TypeScript estate-tax engine, so it cannot be a plain `.mjs` script like
every other gate. Four things were spiked in this session:

| Question | Result |
|---|---|
| Does `npx tsx` run a TS file in this tree? | **Yes** — `npx tsx ./spike.ts` → `TSX OK` |
| Can it import the real tax engine and execute it? | **Yes** — `computeEstateTax` returned real figures (§5) |
| Does it resolve the `@/*` tsconfig path alias? | **Yes** — resolution reached `src/types/index.ts` |
| Can it load the compiled WASM engine through `journey/engine.mjs`? | **Yes** — `per_heir_shares` returned for `02-married-3lc.json` |
| Can the script live at app level, `apps/inheritance/scripts/`? | **No** — `ERROR: Top-level await is currently not supported with the "cjs" output format`. The app root has no `package.json`; `frontend/package.json` declares `"type": "module"`. |

So the gate script lives at **`frontend/scripts/check-one-fact-set.ts`** and its command is
`cd frontend && npx tsx scripts/check-one-fact-set.ts`. `frontend/scripts/` already exists and already
holds `check-test-baseline.mjs` (gate G3's own runner) and a `fixtures/` directory, so this follows
the local convention rather than inventing one.

`frontend/tsconfig.json` has `"include": ["src"]`, so a file under `frontend/scripts/` is **not**
typechecked by G4. That is the reason every rule in this phase lives in `frontend/src/lib/fact-set.ts`
— typechecked by G4, unit-tested by G3 — and the runner only composes imported functions and scans
source text. A runner that carried a rule of its own would be a second implementation of that rule,
outside the typechecker and outside the test suite.

## 8. The journey and test surface this phase disturbs

| Artifact | Effect |
|---|---|
| `frontend/src/components/tax/__tests__/EstateTaxWizard.test.tsx:216-223` | Asserts `getByTestId('decedent-dod').value === '2024-03-15'`. Survives unchanged if the testid and the rendered value are preserved, which is why the field becomes read-only rather than being removed. |
| `frontend/journey/rubrics/tax-tab-0.json` | Asserts element visibility and `aria-selected` only. No date assertion. Stays green. |
| `frontend/journey/references/tax-tab-0.png` | **Will not match** — the field gains a read-only treatment and a source line. Left failing, reported for human review, **not approved**. |
| `frontend/journey/resets.mjs:104` | `case-alpha-no-output` already nulls `decedent_name` and `date_of_death`. Unchanged by this phase. |

## 9. What this phase must not touch

- `frontend/test-baseline.json`, `gate-skips.lock`, `assertion-baseline.json` — the Phase 16 floor is
  an owner decision and stays untouched. Adding real tests raises the observed count, which narrows
  the gap; that is a side effect to report, never a target to aim at.
- `engine/src/flags.rs`, `engine/legal-rules.json`, `.planning/lawyer-decisions.json`,
  `.planning/LAWYER-AGENDA.md` — RA 11642 is `LAWYER-08` and stays exactly where it is.
- `gates.manifest.lock` entries for existing gates — the file gains exactly one appended entry.
- Any journey reference image.

## 10. Open questions this research closes

| Question | Answer |
|---|---|
| Which column is the spine? | `cases.date_of_death`, already written from `input_json.decedent.date_of_death` by `lib/cases.ts:25,54`. No migration needed. |
| Which field does the tax path read? | `input_json.decedent.date_of_death`, via the case row the route already loads. `tax_input_json.decedent.dateOfDeath` becomes a derived copy, never an editor. |
| What happens to a legacy row whose two dates already differ? | It refuses to compute and prints both values. It is never silently overwritten — an overwrite would destroy the evidence that they disagreed. |
| What happens when the succession date is empty? | It refuses to compute and names the succession Decedent step. An empty tax date is absence, not disagreement, and is filled from the spine. |
| Can the succession engine's output be made to move with the date? | Not without answering `LAWYER-08`. Out of scope, reported as a finding. |
