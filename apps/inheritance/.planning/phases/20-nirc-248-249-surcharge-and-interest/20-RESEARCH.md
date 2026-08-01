# Phase 20 — Research: NIRC §§248/249 Surcharge and Interest

**Measured in this tree on 2026-08-01, on branch `gsd/deletion-milestone`.** Every figure below came
from a command run in this session and is pasted, not paraphrased. Where a measurement contradicts
the roadmap's own framing, the measurement is recorded and the roadmap is not edited.

---

## 0. The decisive finding, stated first

**The surcharge and the interest cannot be computed in this phase, and the reason is not difficulty
— it is authority.**

`.planning/NEW-LEGAL-RULE.md` Step 1 fixes the authority boundary in this project:

> **The authority boundary.** If the article is **not** already stated in
> `specs/inheritance-engine-spec.md` or `specs/estate-tax-engine-spec.md`, then writing that
> statement is deciding a point of Philippine law. `.planning/PLAN-STANDARD.md` section 3 prohibits
> that without exception, and regardless of how clear the answer looks. The correct output is **not**
> a spec edit. It is: 1. A **BLOCKED** report … 2. A new `LAWYER-<NN>` entry … 3. A matching object
> added to `.planning/lawyer-decisions.json`.

Measured against that boundary, the estate-tax spec does not state the rule — it **expressly
disclaims it, twice**:

```
$ cd apps/inheritance && sed -n 30,95p specs/estate-tax-engine-spec.md
...
**What the engine does NOT do**:
- Determine asset valuations (user provides all FMV values)
- Compute surcharges, interest, or penalties for late filing
...
### Out of Scope
- Asset valuation (zonal values, book value computation, actuarial tables)
- Surcharges, interest, compromise penalties
```

And no rate, base, accrual rule or schedule for either section exists anywhere in the repository:

```
$ grep -rln "Sec. 248\|Section 248\|NIRC 248\|§248" --include=*.md --include=*.json . | grep -v node_modules
.planning/STATE.md
.planning/ROADMAP.md
.planning/PROJECT.md
.planning/REQUIREMENTS.md
```

Four hits, all four in planning prose that *names the phase*. Zero in `specs/`, zero in `engine/`,
zero in `frontend/src/`. The analysis corpus the spec was synthesised from says the same thing in its
own words:

```
$ grep -n "248\|249\|urcharge" loops/reverse/estate-tax/analysis/filing-rules.md
88:    // NOTE: Engine does NOT compute surcharges, interest, or penalties.
```

**Consequence for the phase.** Producing a surcharge figure requires an agent to supply the rate, the
base and the accrual window from its own knowledge of the NIRC. That is authoring a statement of law
no spec contains — prohibited by `CLAUDE.md` invariant 6, by `PLAN-STANDARD.md` §3, and by
`NEW-LEGAL-RULE.md`'s "What an agent may never do" (*"Author a statement of law that no spec already
contains. Writing the rule down is the decision; it does not become an implementation detail because
the code needed something to compile against."*).

So Phase 20 ships the **other half** of its own success criteria — the half that needs no lawyer and
is worth more than the arithmetic: it **stops the return from claiming to be a total**. Roadmap
criteria 4 and 5 anticipate exactly this state, and the project's ranking is explicit:
*silent wrongness is categorically worse than loud failure.* Today the product tells a four-years-late
estate that it owes the base tax and nothing more. After this phase it names the two sections that
govern what is missing, prints how late the return is, declines each line by name, refuses to publish
a total, and points at three recorded questions with a lawyer's name attached.

### What is therefore explicitly NOT claimed by this phase

| Roadmap criterion | Status | Why |
|---|---|---|
| 2 — "Surcharge is computed per NIRC §248 and interest per NIRC §249" | **NOT claimed.** Both lines are *declined*, each carrying its section. | No spec states either rule; supplying one is a legal judgment. |
| 3 — "`total_amount_due` equals estate tax plus surcharge plus interest plus compromise penalty, and a test proves the total moves when the date of death moves" | **PARTIALLY claimed, and the split is stated in the plans.** The **sum rule** is implemented and unit-tested against injected determined lines. `total_amount_due` is `null` whenever any line is declined, so no test asserts a moving total. What moves with the date of death is the statutory deadline and the day count, proven with real figures. | Same reason. A total that includes a fabricated surcharge is the exact failure this project ranks worst. |
| 1 — "computed from the date of death and the filing date. No hardcoded zero survives on the total's inputs." | **Claimed.** Every hardcoded `0` is gone; the lines are `null` + `declined`, and the lateness is a real function of both dates. | See §2 and §3 below. |
| 4 — refuse loudly, record a `LAWYER-<NN>` entry, status `awaiting-answer`, nothing defaulted or stubbed | **Claimed.** Three entries: `LAWYER-10`, `LAWYER-11`, `LAWYER-12`. | See §5. |
| 5 — compromise penalty computed from a cited schedule **or** expressly declared outside competence on the face of the return | **Claimed via the second branch.** No schedule is stated in any spec, so the line is declared outside competence and printed as such on Form 1801. | See §6. |

Precedent for reporting an unmeetable criterion instead of engineering around it: Phase 18's
criterion 5, recorded in `.planning/STATE.md` (*"roadmap success criterion 5 as literally worded
cannot be met without deciding LAWYER-08 … the constraint binds"*).

---

## 1. The defect, measured

```
$ grep -n "surcharges\|interest:\|compromise_penalty\|total_amount_due" frontend/src/lib/estate-tax-engine/pipeline.ts
614:    surcharges: 0,
615:    interest: 0,
616:    compromise_penalty: 0,
617:    total_amount_due: taxComputation.estateTaxDue, // No surcharges
665:    surcharges: 0,
666:    interest: 0,
667:    compromise_penalty: 0,
668:    total_amount_due: 0,
```

Two sites: the real output at 614–617 and `makeErrorOutput` at 665–668. The type comments assert the
same thing:

```
$ sed -n 227,230p frontend/src/lib/estate-tax-engine/types.ts
  surcharges: number; // always 0, centavos
  interest: number; // always 0, centavos
  compromise_penalty: number; // always 0, centavos
  total_amount_due: number; // centavos
```

**The blast radius is small, which is measured, not assumed.** Nothing under `frontend/src/` *reads*
`total_amount_due` or `compromise_penalty`:

```
$ grep -rn "total_amount_due\|compromise_penalty" src --include=*.ts --include=*.tsx | grep -v "estate-tax-engine/"
src/hooks/__tests__/useTaxBridge.test.tsx:91:    compromise_penalty: 0,
src/hooks/__tests__/useTaxBridge.test.tsx:92:    total_amount_due: 12000000,
src/lib/__tests__/tax-bridge.test.ts:116:    compromise_penalty: 0,
src/lib/__tests__/tax-bridge.test.ts:117:    total_amount_due: 12000000,
src/lib/__tests__/tax-bridge.test.ts:491:    expect(output).toHaveProperty('compromise_penalty');
src/lib/__tests__/tax-bridge.test.ts:492:    expect(output).toHaveProperty('total_amount_due');
src/lib/tax-bridge.ts:31:  compromise_penalty: number; // centavos
src/lib/tax-bridge.ts:32:  total_amount_due: number; // centavos
```

One interface declaration and four test fixtures. **The false total is not displayed anywhere today
— it is persisted.** `Form1801View.tsx`'s last line is `Net Estate Tax Due`; it never renders a total
amount due at all:

```
$ grep -n "surcharge\|Surcharge\|total_amount\|compromise" frontend/src/components/tax/results/Form1801View.tsx
72:      description: 'Business Interests',
(three further lines, all `businessInterest`)
```

So the wrong number's only current destination is `cases.tax_output_json`, which **Phase 21 (BIR Form
1801 Exit) is scheduled to print**. Fixing it now is what stops Phase 21 exporting it.

---

## 2. An un-audited defect found while measuring: the engine reads the wall clock

```
$ sed -n 306,310p frontend/src/lib/estate-tax-engine/pipeline.ts
  // Filing info
  const filing: FilingInfo = {
    filingDate: new Date().toISOString().slice(0, 10),
    rdoCode: '',
  };
```

```
$ grep -rn "filingDate" frontend/src
src/lib/estate-tax-engine/pipeline.ts:308:    filingDate: new Date().toISOString().slice(0, 10),
src/lib/estate-tax-engine/types.ts:401:  filingDate: string; // ISO date
src/lib/estate-tax-engine/__tests__/validation.test.ts:50:      filingDate: '2024-06-15',
```

`FilingInfo.filingDate` **already exists on the engine input**, is set from `new Date()` at every
compute, and is read by **nothing**. Two findings follow:

1. The roadmap's "filing date" input is not new work — it is an existing field with no source. Phase
   20 gives it one and deletes the `new Date()` call.
2. The spec's own first claim about this engine is that it is *"fully deterministic"*
   (`specs/estate-tax-engine-spec.md` §1). A wall-clock read in the input mapper contradicts that,
   and it makes Phase 24 (Signed Computation Identity — *engine version, ruleset-as-of date, input
   hash*) impossible while it stands: the same fact set hashes differently tomorrow.

**Decision fixed for the plans: the filing date is entered, never defaulted to today.** New field
`EstateTaxWizardState.filing.assumedFilingDate`, default `''`. An empty value makes the lateness
`undetermined` and is refused, exactly as Phase 18's `FACT-04` refuses an empty date of death. A
`new Date()` default was rejected for two measured reasons: it reintroduces the non-determinism just
removed, and it would change every estate-tax journey screenshot daily — the eight `tax-tab-*`
reference images are captured from `createDefaultEstateTaxState()`
(`frontend/journey/steps/tax.json` `$comment`: *"NO tax_input_json IS SEEDED anywhere in Phase 12;
these tabs render the wizard's own createDefaultEstateTaxState() defaults"*).

---

## 3. What *is* spec-stated, and is therefore transcription rather than judgment

`specs/estate-tax-engine-spec.md` §21 states the filing deadline:

```
## 21. Filing Rules (Informational Output)

These rules are **informational only** — no Form 1801 computation items are affected.

| Rule | TRAIN (death ≥ 2018-01-01) | Pre-TRAIN (death < 2018-01-01) |
|------|---------------------------|-------------------------------|
| Filing deadline | 1 year from date of death | 6 months from date of death |
```

Two worked arithmetic examples exist in the analysis corpus and are used as **test vectors for the
date arithmetic only** — not as statements of law:

```
$ grep -n "TRAIN deadline\|Pre-TRAIN deadline" loops/reverse/estate-tax/analysis/filing-rules.md
261:1. **TRAIN deadline**: For date of death 2020-06-15, filing deadline = 2021-06-15 (exactly 1 year). Engine must handle day-precision date arithmetic.
263:2. **Pre-TRAIN deadline**: For date of death 2015-03-31, filing deadline = 2015-09-30 (exactly 6 months).
```

The second example fixes the one arithmetic convention the plans must decide: `2015-03-31 + 6 months`
lands on a month with 30 days, and the committed example says `2015-09-30`, i.e. **clamp to the last
day of the target month** rather than roll into October. The plans adopt clamping because it
reproduces a committed example, and both examples become asserted vectors.

**Why the convention is safe to fix in a plan.** The spec itself labels §21 *"informational only — no
Form 1801 computation items are affected"*, and in this phase **no peso figure is derived from the
deadline at all** — every money line beneath the tax is declined. A one-day error in the deadline
therefore moves a day count on screen and moves no money. The regime boundary is not re-implemented:
the deadline reads `getDeductionRules(dateOfDeath)` from `frontend/src/types/estate-tax.ts:357`
(`return dateOfDeath < '2018-01-01' ? 'PRE_TRAIN' : 'TRAIN'`), so there is one implementation of the
TRAIN boundary, per `CLAUDE.md` invariant 5.

---

## 4. Traps found at planning time and cleared

**Trap 1 — G34 (`one fact set`) check 1 could have fired on a new date input.** Its writer literal is
narrow:

```
$ sed -n 104,104p frontend/scripts/check-one-fact-set.ts
const WRITER_LITERAL = ['dateOfDeath:', 'e.target.value'].join(' ');
```

It matches `dateOfDeath: e.target.value`. A filing-date input writes
`assumedFilingDate: e.target.value` and does not match. Cleared — and `20-03` re-runs G34 to prove it.

**Trap 2 — `check-lawyer-agenda.mjs` hardcodes the expected id set.**

```
$ sed -n 55,74p scripts/check-lawyer-agenda.mjs
const REQUIRED_IDS = [
  'LAWYER-01', 'LAWYER-02', 'LAWYER-03', 'LAWYER-04',
  'LAWYER-05', 'LAWYER-06', 'LAWYER-07', 'LAWYER-08',
  'LAWYER-09',
];
const REQUIRED_KEYS = [
  'id', 'question', 'title', 'articles', 'authority', 'reading_implemented',
  'status', 'blocks', 'agenda_section', 'anchors', 'vectors',
  'answered_by', 'answered_on', 'answer',
];
const VALID_STATUSES = ['awaiting-answer', 'confirmed', 'changed'];
const MARKER_PREFIX = 'LAWYER-DECISION: ';
```

Adding `LAWYER-10/11/12` to both files passes without touching `REQUIRED_IDS` (extra ids are checked
for agenda presence in both directions by the `AGENDA DRIFT` rule). `20-02` adds them to
`REQUIRED_IDS` anyway, because that **strengthens** the gate: it makes the three entries
undeletable. Two further mechanics, measured from the script:

- every decision's `anchors[]` entry needs a `pattern` occurring **exactly once** in its `file`
  (`DECISION ANCHOR BROKEN` otherwise), and
- that file must contain the literal `LAWYER-DECISION: LAWYER-10` (`DECISION MARKER MISSING`
  otherwise).

This forces the plan order: `penalties.ts` (with its markers) exists in wave 1; the registry entries
that anchor into it land in wave 2.

**Trap 3 — the agenda's own header prose is already stale by one.** It opens *"This file holds eight
interpretive choices"* while the registry holds nine (`LAWYER-09` was added later). `20-02` corrects
the count to twelve and records the pre-existing off-by-one as a finding rather than silently
absorbing it.

**Trap 4 — three committed assertions encode the defect.**

```
$ grep -n "surcharges).toBe(0)\|total_amount_due).toBe" frontend/src/lib/estate-tax-engine/__tests__/pipeline.test.ts
205:    expect(result.surcharges).toBe(0);
209:    expect(result.total_amount_due).toBe(result.tax_due);
296:    expect(result.total_amount_due).toBe(0);
483:    expect(result.surcharges).toBe(0);
```

They are **strengthened, never deleted or skipped**: `toBe(0)` becomes `toBeNull()` plus a new
assertion on the line's `status` and its section string. The authorisation is ROADMAP Phase 20
criterion 1 (*"No hardcoded zero survives on the total's inputs"*), quoted verbatim in `20-04` and in
its commit body — the same shape Phase 19 used when it renamed and inverted
`useAutoSave.test.tsx`'s unmount case.

**Trap 5 — `FilingData` is constructed literally in fourteen files.**

```
$ grep -rln "userElectsAmnesty:" src | wc -l
14
$ grep -rn "userElectsAmnesty:" src | wc -l
18
```

Adding a required field breaks all of them at `tsc`, including the Zod schema at
`src/schemas/estate-tax.ts`. That is the desired behaviour — G4 enumerates the sites — but the plan
budgets a task for it rather than discovering it.

**Trap 6 — the UI-SPEC gate fires on substrings, not on content.** `plan-phase` §5.6 greps the phase
section for frontend indicators and matched:

```
$ gsd-sdk query roadmap.get-phase 20 --pick section | grep -ioE "UI|frontend|view" | sort | uniq -c
      1 frontend
      1 ui
      1 view
```

All three are inside unrelated words: `frontend/src/lib/estate-tax-engine/pipeline.ts` is a file path,
`ui` is inside `req`**`ui`**`rements`, and `view` is inside `manual-re`**`view`**` flag`. No UI-SPEC
was generated. The one display change this phase makes is textual and small, and its exact strings,
testids and placement are fixed literally in `20-05` instead.

---

## 5. Where the three questions go, and what they ask

The agenda's `## Entry format` fixes eight headings; `20-02` follows it exactly. The questions are
framed as **engine-scope questions, not as readings of the NIRC**, because posing "Reading A: 25%"
would itself be the prohibited act. Each asks the lawyer for the four things the engine would need in
order to compute at all — rate, base, accrual start, accrual end — or for confirmation that the line
should stay refused:

| Id | Question | `**Engine implements:**` | Anchor |
|---|---|---|---|
| `LAWYER-10` | Q10 — the NIRC Sec. 248 surcharge on a late estate-tax return | `neither` | `penalties.ts`, `SURCHARGE_DECLINED_REASON` |
| `LAWYER-11` | Q11 — the NIRC Sec. 249 interest on late-paid estate tax | `neither` | `penalties.ts`, `INTEREST_DECLINED_REASON` |
| `LAWYER-12` | Q12 — whether a compromise penalty may be computed by an engine at all | `neither` | `penalties.ts`, `COMPROMISE_PENALTY_DECLINED_REASON` |

`**Engine implements:** neither` carries a specific meaning in this file: *"the engine implements no
rule on the point at all. That is itself an unrecorded position, not a neutral one: the engine still
produces a number, it just produces it by omission."* Each entry's `What the engine does today`
section states that Phase 20 removed the omission — the engine now produces **no** number and says so
— which is what makes `neither` a recorded position rather than a hidden one.

---

## 6. The shape being built

One new module, `frontend/src/lib/estate-tax-engine/penalties.ts`, is the single site of every rule in
this phase. Fixed exports (all literals are fixed in `20-01`, not chosen at execution time):

```ts
export const SURCHARGE_SECTION = 'NIRC Sec. 248';
export const INTEREST_SECTION = 'NIRC Sec. 249';
export const COMPROMISE_PENALTY_AUTHORITY = 'specs/estate-tax-engine-spec.md §2 Out of Scope';
export const FILING_DEADLINE_AUTHORITY = 'specs/estate-tax-engine-spec.md §21 Filing Rules';

export type PenaltyLineId = 'surcharge' | 'interest' | 'compromise_penalty';
export interface PenaltyLine {
  id: PenaltyLineId; label: string; authority: string;
  centavos: number | null;                       // null ⇔ status 'declined'
  status: 'determined' | 'declined';
  declinedReason: string | null; lawyerDecision: string | null;
}
export interface FilingLateness {
  statutoryDeadline: string; deadlineMonths: number; deadlineAuthority: string;
  filingDate: string; daysLate: number; isLate: boolean;
}
export type LatenessVerdict =
  | { kind: 'determined'; lateness: FilingLateness }
  | { kind: 'undetermined'; reason: string };
export interface PenaltyAssessment {
  lateness: LatenessVerdict;
  lines: readonly [PenaltyLine, PenaltyLine, PenaltyLine];
  complete: boolean; totalAmountDue: number | null; refusal: string;
}
```

`null` rather than `0` is the whole point: `0` is a claim that nothing is owed, `null` is an admission
that the engine does not know. The type change is what forces every reader to confront it —
`frontend/tsconfig.json` is `strict` with `noUncheckedIndexedAccess`, so `tsc -b` (G4) enumerates
every site that must handle the refusal.

The base of the total is left **exactly as it is today**, `taxComputation.estateTaxDue`. Moving it to
`netEstateTaxDue` (after the foreign tax credit) would decide whether penalties accrue before or
after the credit — a point of law this phase does not touch.

---

## 7. Gate registration mechanics, measured

Next free id is **G36** (`G1`–`G35` all in use). The insertion slot is **order 12**, which shifts the
current `G3`…`G9` from orders 12–35 to 13–36; `scripts/check-gate-manifest.mjs` locks only
`{id, command, blocking}` and its own header states *"reordering a gate and improving its prose are
not weakening it"*. Order 12 is chosen for the same reason Phase 18 chose order 11 for G34: it is
**after** G2 and **before** the point where the suite currently halts, so the gate actually executes
on this branch instead of never running.

```
$ node -e "…gates.manifest.json…"
1 G5 · 2 G6 · 3 G7 · 4 G12 · 5 G13 · 6 G15 · 7 G16 · 8 G1 · 9 G2 · 10 G14 · 11 G34 · 12 G3 · 13 G4
14 G18 · 15 G17 · 16 G19 · 17 G35 · 18 G20 · 19 G21 · 20 G22 … 31 G33 · 32 G10 · 33 G11 · 34 G8 · 35 G9
```

Two documents state the gate count and are checked by G33:

```
$ grep -n "The gate set holds" .planning/ORIENTATION.md
31:The gate set holds 35 gates.
$ grep -n "ALL GATES PASSED" RESUME.md
48:monorepo root. It should print `ALL GATES PASSED (35/35)` — the count is the
```

`scripts/check-planning-truth.mjs:409` reads the first with the regex
`/The gate set holds (\d+) gates\./` and the second with an `ALL GATES PASSED \((\d+)/(\d+)\)` form,
so both must move 35 → 36 in the same commit that registers G36 or G33 goes red.

---

## 8. Environment state this phase inherits and does not own

| Fact | Value | Source |
|---|---|---|
| `bash scripts/ci-gates.sh` | exits 1, reaching 15/35, halting at G17 (`JOURNEY FAIL steps=25 failed=15`) | Phase 19 record in `.planning/STATE.md` |
| `G20`, `G21` | registered blocking gates whose scripts commit `4ccf06270` deleted; G20 exits 1, G21 exits 2 | Phase 19 record; retiring a gate is owner action under `CLAUDE.md` invariant 2, enforced by G5 |
| Journey steps withheld for human review | 15, including all eight `tax-tab-*` | Phase 19 record |
| Frontend test ledger | 31 known failures, `skipped=0`, `min_total_tests: 2119`, last measured total 2138 | `frontend/test-baseline.json`, Phase 19 record |
| Engine null control | `cargo test` → 546 passed / 0 failed | Phase 19 record |

Phase 20 therefore **does not claim `bash scripts/ci-gates.sh` exits 0**, and touches no journey
reference image. `tax-tab-7` is the Filing tab and is already failing and withheld; `20-03` adds a
field to it and leaves it failing, reported for human review.

---

## Validation Architecture

**The property under test is a refusal, and a refusal is easy to fake.** A module that returns `null`
for everything passes any test that only checks for `null`. Every assertion in this phase is
therefore paired with a *positive* assertion that something real was computed and named:

| Property | Positive half | Negative half |
|---|---|---|
| The lines are declined | each line carries a non-empty `authority` string equal to `NIRC Sec. 248` / `NIRC Sec. 249` / the spec's out-of-scope section, and a `lawyerDecision` id present in the registry | `centavos` is `null` and `status` is `declined` |
| The total refuses | `refusal` is a non-empty string containing both section numbers | `totalAmountDue` is `null` and `complete` is `false` |
| Lateness is real | `statutoryDeadline` equals `2021-06-15` for a 2020-06-15 death and `2015-09-30` for a 2015-03-31 death; `daysLate` is a positive integer | an empty date of death or filing date yields `kind: 'undetermined'`, never `daysLate: 0` |
| The sum rule exists | `sumTotalAmountDue` over three *injected determined* lines returns the exact integer sum | over any set containing a declined line it returns `null` |
| No rate was invented | the numeric literals in `penalties.ts` are a subset of `{0, 1, 2, 6, 10, 12, 86400000}` | the file contains no `%` character and no `Math.round` |

**Levels.** The rule module is sampled at the unit level (Vitest, pure functions, exact integers).
The wiring is sampled at the pipeline level (a real `computeEstateTax` run). The display is sampled at
the component level (`@testing-library/react` against `Form1801View`). The whole contract is sampled
once more, independently of the test suite, by gate **G36** — which imports the real engine and
asserts against a real computation, the discipline G19 and G34 established.

**Every failure path is observed before it is trusted.** `20-06` observes G36 exit 1 on four
separately injected regressions, restoring the source between each: (1) reinstate
`total_amount_due: taxComputation.estateTaxDue` → `TOTAL CLAIMS COMPLETENESS`; (2) blank an
`authority` string → `LINE MISSING ITS SECTION`; (3) add the literal `0.25` to `penalties.ts` →
`RATE INVENTED`; (4) point a line's `lawyerDecision` at `LAWYER-99` → `DECLINED LINE UNRECORDED`.
`20-07` registers the gate only after those four observations are recorded with pasted output.

**Null controls.** `cd engine && cargo test` must stay at 546/0 — this phase edits no Rust. G34 must
stay at exit 0 — this phase adds a date field that is not a date of death. `cargo test`,
`frontend/test-baseline.json`, `assertion-baseline.json`, `gate-skips.lock` and every file under
`frontend/journey/references/` are proven untouched by `git log --name-only` over the phase range.
