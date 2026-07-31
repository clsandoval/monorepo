---
phase: 08-remaining-unblocked-legal-tax-bridge-defects
researched: 2026-07-31
requirements: [LAW-05, LAW-08, LAW-09, LAW-10, LAW-11]
---

# Phase 8 Research — Remaining Unblocked Legal & Tax-Bridge Defects

Every number in this document was measured in this working tree on 2026-07-31, either by running
`engine/target/release/inheritance-engine` over a purpose-built or committed input, or by reading the
exact source line cited. Nothing here is inferred from the 2026-07-27 audit without re-checking,
because Phases 4, 5 and 7 have since edited every engine file the audit cites and shifted its line
numbers.

The five requirements are independent defects that happen to share a phase. They are researched
separately below and share only the closeout.

---

## 0. Measured baseline

| Measurement | Value | How |
|---|---|---|
| `cd engine && cargo test` | **527 passed, 0 failed** across 6 binaries (lib 465, defect_ledger 3, fuzz_invariants 17, integration 39, observability 3, doc 0) | run |
| `frontend/test-baseline.json` | 46 known failures over 11 files; `total_tests` 2416, `min_total_tests` 2416 | read |
| `bash scripts/ci-gates.sh` | halts at **G3**, gate 8 of 13, on Phase 5's unresolved OBS-05/OBS-06 decision | recorded by Phases 5, 6, 7 |
| Committed engine inputs | 173 JSON files: `cases` 20, `testate-cases` 20, `fuzz-cases` 100, `coverage-cases` 31, `defect-cases` 2 | `ls` |
| `engine/defect-baseline.json` | 2 entries, both `LAW-06`, both `fixed_by_phase: 14`, both `blocked_on: LAWYER-06` | read |
| Gate set | 13 gates in `gates.manifest.json`; G9 last at order 13 | read |
| Recorded lawyer decisions | 8, `LAWYER-01`…`LAWYER-08`, all `awaiting-answer` | read |

### The G3 halt is inherited, not caused here

`scripts/ci-gates.sh` has stopped at `G3` since Phase 5. The five failing frontend tests live in
`src/__tests__/integration.test.tsx`, `src/wasm/__tests__/bridge.test.ts` and
`src/wasm/__tests__/wasm-real.test.ts`; none of those three files appears in
`frontend/test-baseline.json`, which is why the gate reports them as `UNKNOWN FAILURE`. Phase 8 does
not touch them and does not resolve the OBS-05/OBS-06 product decision. **`ALL GATES PASSED (13/13)`
is not achievable in this phase and must not be claimed.**

---

## 1. LAW-05 — Preterition (Art. 854, *Morales v. Olondriz*)

### 1.1 The two defects are independent and sit in different files

**(a) Legacies are not paid.** `engine/src/step7_distribute.rs:176` handles
`SuccessionType::Intestate` and `SuccessionType::IntestateByPreterition` in a **single match arm**
that calls `compute_intestate_distribution(&input.estate_base, …)` over the whole estate. `will.legacies`
is never read on that path. Art. 854 says the institution of heir is annulled "but the devises and
legacies shall be valid insofar as they are not inofficious."

**(b) Donations are not consulted.** `engine/src/step6_validation.rs:344` calls
`heir_addressed_in_will(will, &heir.id)`, defined at `:829`, which reads only `will.institutions`,
`will.legacies`, `will.devises` and `will.disinheritances`. `input.donations` is never consulted, even
though `Step6Input` already carries a `donations: Vec<Donation>` field (`step6_validation.rs:37`).

### 1.2 Measured before-state, four purpose-built inputs

All four were run through `engine/target/release/inheritance-engine`, exit code 0 in every case.

| Input | Family / will | Observed today |
|---|---|---|
| A — legacy within the free portion | E=₱30,000,000; 2 LC `ana`,`ben`; institution of stranger `Kevin` at `EntireFreePort`; legacy `L1` `FixedAmount ₱3,000,000` to `carlos`, non-preferred | `IntestateByPreterition` `T1`; `ana=1500000000`, `ben=1500000000`; **`carlos` has no row at all**; Σ=3000000000 |
| A2 — legacy exceeding the free portion | same, legacy `L1` = `FixedAmount ₱20,000,000` | identical: `ana=1500000000`, `ben=1500000000`, no `carlos` row |
| B — sole child holding a donation | E=₱30,000,000; 1 LC `ben`; institution of stranger `Kevin` at `EntireFreePort`; donation `don1` ₱10,000,000 to `ben`, every exemption flag `false` | `IntestateByPreterition` `T1`; `ben=3000000000`; warning category `preterition`; **the will is destroyed** |
| B-proxy — the same tree with `ben` named in the will | same as B plus an institution of `ben` at `ShareSpec::Unspecified` | `Testate` `T1`; `ben=1500000000` (all from legitime), `Kevin=1500000000` (all from free portion); Σ=3000000000; **zero warnings** |

B-proxy is the load-bearing measurement for LAW-05(b): the only difference between B and B-proxy is
whether `heir_addressed_in_will` returns true, so B-proxy's output **is** the post-fix expected output
for B. It does not have to be predicted.

### 1.3 Blast radius across the committed corpus

Every one of the 173 committed inputs was run and its `succession_type` read.

- **36 inputs currently produce `IntestateByPreterition`**: `cases/06-testate-charity.json`;
  `testate-cases/{02,03,08,13,14,15,18}.json`; `fuzz-cases/{037,039,040,041,045,048,049,050,053,055,060,061,062,066,067,068,069,071,072,073,074,075,076,077,078,079,080,082}`.
- **Of those 36, exactly 7 have a non-empty `will.legacies`** and will therefore move under fix (a):
  `testate-cases/08.json`, `fuzz-cases/061`, `062`, `066`, `067`, `068`, `069`.
- **Zero committed inputs have a non-empty `will.devises`.** The whole corpus has no devise anywhere.
- The 10 `fuzz-cases/07x-testate-donations-*` files hold a donation to one heir but omit *all*
  children from the will, so fix (b) alone does not lift any of them out of preterition.

Nothing in the corpus pins per-heir amounts for those 7 files: `engine/examples/test-results.md` and
`testate-test-results.md` are written by `generate-test-cases.sh` and are read by no test and no gate.
`engine/tests/fuzz_invariants.rs` evaluates the 16 named invariants in `engine/tests/common/invariants.rs`,
and `INV07 preterition_annulment` (`invariants.rs:283`) only requires that at least one heir has
`total > 0` — a fix that pays a legatee and distributes the residue satisfies it. `INV01 sum_conservation`
and `INV13 unique_heir_id` are satisfied by construction, since the legatee row is one new row and the
residue is `estate_base − payable_total`.

### 1.4 The machinery both fixes need already exists

- `add_fp_to_distributions(&mut Vec<HeirDistribution>, &str, Frac)` at `step7_distribute.rs:393`
  creates a legatee row when none exists. The testate arm at `:327-351` already uses it for legacies,
  including reading reduced amounts out of `validation.inofficiousness.reductions`. The preterition
  arm can reuse both verbatim.
- `check_inofficiousness(will, donations, free_portion, estate_base)` at `step6_validation.rs:496`
  computes `excess = Σlegacies − fp_disposable` and calls `reduce_inofficious`, which reduces
  non-preferred legacies pro rata (Phase 1a) before preferred ones (Phase 1b). Today the preterition
  early return at `step6_validation.rs:201-220` **hardcodes a zeroed `InofficiousnessResult`** instead
  of calling it, which is precisely why no reduction is available to step 7 on that path.
- `Step6Input` already carries `donations`; `Step7Input` already carries `will`, `validation`,
  `free_portion` and `donations`. **Neither struct needs a new field**, so
  `engine/tests/integration.rs`'s inline copy of the pipeline (`integration.rs:120-165`) does not need
  mirroring. This is the single biggest risk reducer in the phase.

### 1.5 Arithmetic, derived from quoted text only

Input A. Art. 888 gives 2 legitimate children a collective legitime of ½, so on E=₱30,000,000 the
free portion is ₱15,000,000 and `FreePortion.fp_disposable` = 1500000000 centavos (no spouse, no
illegitimate children, so `spouse_from_fp` and `ic_from_fp` are zero). The ₱3,000,000 legacy is below
that, so it is not inofficious and survives in full under Art. 854. The residue
3000000000 − 300000000 = 2700000000 is distributed intestate; `derive_intestate_scenario`
(`step7_distribute.rs:120`) returns `I1` for 2 LC with no spouse and no ascendant, and `distribute_i1`
divides equally: **`carlos=300000000`, `ana=1350000000`, `ben=1350000000`**.

Input A2. Σ legacies = 2000000000 against `fp_disposable` 1500000000, so `excess` = 500000000. In
`reduce_inofficious` the single non-preferred legacy gives `non_pref_total` = 2000000000 and
`ratio = min(500000000/2000000000, 1) = 1/4`; `cut` = 500000000 and `remaining_amount` = 1500000000.
The residue is 1500000000 and `I1` splits it: **`carlos=1500000000`, `ana=750000000`,
`ben=750000000`** — each child receiving exactly the ₱7,500,000 legitime Art. 888 guarantees, which is
the check that the reduction stopped in the right place.

Input B, post-fix, is B-proxy measured: **`ben=1500000000`, `Kevin=1500000000`, `Testate`**.

### 1.6 The one point of law this phase does NOT decide

*Morales v. Olondriz* states the test as: "the omission is total, meaning the heir did not also
receive any legacies, devises, **or advances on his legitime**." Art. 1061 defines an advance on the
legitime as property received from the decedent by donation and brought into the mass "in order that
it may be computed in the determination of the legitime." Several articles then declare specific
donations **not** collated at all:

| Article | `Donation` field | Effect |
|---|---|---|
| Art. 1062 | `is_expressly_exempt` | donor expressly provided against collation |
| Art. 1067 | `is_support_education_medical`, `is_customary_gift` | not brought to collation |
| Art. 1066 | `is_to_child_spouse_only` | received by the child's spouse, not the child |
| Art. 1068 | `is_professional_expense` with `professional_expense_parent_required == false` | not collated |
| Art. 1070 | `is_wedding_gift` | not brought to collation |

A donation in one of those five categories is, by the Code's own words, not an advance on the
legitime. Whether it nevertheless makes the omission less than "total" under *Morales* is an open
interpretive question. **This phase does not answer it.** It implements only the part the quoted text
forces — a collated donation is an advance and defeats preterition — and where an omitted heir's only
donations all fall in an exempted category, preterition still fires **and a manual-review flag is
emitted** naming the articles. The question is recorded as a ninth agenda entry, `LAWYER-09 — Q9`.

`scripts/check-lawyer-agenda.mjs:55-58` hardcodes `REQUIRED_IDS` as `LAWYER-01`…`LAWYER-08`, and
sections 1 and 6 of that script mean an extra id is permitted only if it appears in **both** the
registry and the agenda with matching `Status` and `Engine implements` lines. Adding `LAWYER-09` to
`REQUIRED_IDS` makes the new entry mandatory from then on — that is growth of the checked set, which
is the direction `GATES.md` allows.

Note the id namespace collision: `.planning/REQUIREMENTS.md` also has a **requirement** called
`LAWYER-09` (the machine-readable registry itself). The two live in different namespaces and are
never compared to each other; the registry's `LAWYER-09` is question Q9.

### 1.7 Devises and specific-asset legacies cannot be valued

`compute_devise_value` (`step7_distribute.rs:165`) returns `Frac::zero()` for both `DeviseSpec`
variants, and `compute_legacy_value` returns zero for `LegacySpec::SpecificAsset`, because both
reference an `AssetId` and `EngineInput` carries no asset inventory. Art. 854 preserves devises, so an
engine that silently pays them ₱0 is exactly the silent wrongness this project forbids. The fix emits a
flag rather than inventing a valuation. No committed input is affected — the corpus contains zero
devises and zero `SpecificAsset` legacies.

---

## 2. LAW-08 — the TRAIN-repealed ₱500,000 medical deduction

### 2.1 The defect

`frontend/src/lib/estate-tax-engine/special-deductions.ts:106-115`:

```
function computeMedicalDeduction(
  decedent: DecedentInfo,
  medicalExpenses?: MedicalExpense[],
): number {
```

It does not accept `deductionRules` at all. Its two siblings do and both gate on it:
`computeFuneralDeduction` at `:82` and `computeJudicialAdminDeduction` at `:99` each carry
`if (deductionRules === 'TRAIN') return 0;`. The call site is `:150`, inside
`computeSpecialDeductions`, which already holds `deductionRules` in scope. RA 10963 Sec. 23 deleted
funeral, judicial **and** medical from NIRC Sec. 86(A) together; RR 12-2018 Sec. 6 is an exhaustive
nine-item list with no medical item.

`regime-detection.ts:96` sets `deductionRules: 'TRAIN'` for any `dateOfDeath >= TRAIN_EFFECTIVE_DATE`,
so the gate is a one-line addition on an already-resolved flag.

### 2.2 Second site: the advisor actively recommends the repealed deduction

`frontend/src/lib/estate-tax-engine/advisor.ts:231-262`, rule `no-medical-claimed`, returns `null`
when `dateOfDeath < '2018-01-01'` — that is, it fires **only** under TRAIN, the exact regime where the
deduction no longer exists — and its description reads "Under TRAIN, up to ₱500,000 of medical
expenses incurred within one year before death are deductible. This could save up to ₱30,000 in tax."
The date gate is inverted relative to the statute. Under pre-TRAIN law the deduction was real, so the
rule is kept and its gate flipped rather than deleted.

`frontend/src/lib/estate-tax-engine/sensitivity.ts:205-229`, lever `medical-expenses`, needs no
source change: once the deduction computes to 0 under TRAIN the lever's `delta` is 0 and the function
already returns `null` on that branch.

### 2.3 Tests that assert the repealed rule

These four assert the pre-TRAIN answer against a TRAIN regime. They are **corrected to assert the
statute**, never deleted, skipped or loosened, and each keeps a comment recording the figure it used
to assert and the statute that repealed it.

| File | Test | Asserts today | Must assert |
|---|---|---|---|
| `special-deductions.test.ts:208` | `medical expenses` / happy path | `item37d_medical_expenses` `40_000_000` | `0` |
| `special-deductions.test.ts:217` | caps at ₱500K | `MEDICAL_EXPENSE_CAP` | `0` |
| `special-deductions.test.ts:245` | TRAIN citizen total | total includes ₱400K medical | total excludes it |
| `special-deductions.test.ts:269` | `TV-02 scenario` | `₱11.4M` | `₱11.0M` |
| `advisor.test.ts:267` | suggestion appears | `medSuggestion` defined, savings > 0 | undefined under a 2022 death |
| `sensitivity.test.ts:228` | positive delta | `medLever` defined, delta > 0 | undefined under a TRAIN death |

`special-deductions.test.ts:226` (`NRA → 0`) and `:235` (`no medical expenses → 0`) already assert 0
and do not move. `constants.test.ts:41` asserts `MEDICAL_EXPENSE_CAP === 50_000_000`; the constant
stays, because it is still the pre-TRAIN cap.

`sensitivity.test.ts` and `advisor.test.ts` both build state through a local `makeWizardState`
helper, so the death date each test uses must be read at the call site rather than assumed.

### 2.4 The spec's golden test TV-02 is arithmetically wrong

`specs/estate-tax-engine-spec.md:1774` states TV-02's date of death as **2023-06-20**, which is TRAIN,
and then allows ₱400,000 of medical. Correcting only that one line changes four downstream rows. Every
other input in the vector is unchanged.

| Row | Spec says | Correct |
|---|---|---|
| 37C medical | ₱400,000 | **₱0** |
| Item 37 special deductions | ₱11,400,000 | **₱11,000,000** |
| Item 38 net estate | ₱3,100,000 | **₱3,500,000** |
| Item 40 net taxable estate | ₱1,850,000 | **₱2,250,000** |
| Item 42 / Item 44 tax | ₱111,000 | **₱135,000** |

Derivation: gross ₱15,000,000 − ordinary ₱500,000 = ₱14,500,000; − special ₱11,000,000 = ₱3,500,000;
− spouse share ₱1,250,000 = ₱2,250,000; × 6% = ₱135,000. Items 29-36 and Schedule 6A are untouched.

`specs/estate-tax-engine-spec.md:1015` §10.3 and `:141-142` (the `MEDICAL_EXPENSE_CAP` constant block)
also state the rule without a regime gate and are corrected in the same pass.

`frontend/src/lib/estate-tax-engine/__tests__/pipeline.test.ts:344`'s `TV-02` test is a different
fact pattern that claims no medical expenses and asserts `netEstateTaxDue === 0`; it does not move.

---

## 3. LAW-09 — Transfers for Public Use missing from the vanishing-deduction ratio

### 3.1 The defect and its one-line shape

`frontend/src/lib/estate-tax-engine/ordinary-deductions.ts:361-364`:

```
  const elitForVD =
    deductionRules === 'PRE_TRAIN'
      ? elitBase + funeral.total + judicial.total
      : elitBase;
```

`elitBase` is `claims + insolvent + mortgages + casualties`. NIRC Sec. 86(A)(5) as amended computes the
reduction against "the amounts allowed as deductions under paragraphs (2), (3), (4), **and (6)**", and
paragraph (6) is Transfers for Public Use. RA 8424 Sec. 86(A)(2) pointed at "paragraphs (1) and (3)",
and pre-TRAIN paragraph (3) was also Transfers for Public Use, so **both branches** are short by the
same term. This is recorded in `.planning/research/LEGAL-CONFORMANCE.md` §2b with the explicit fixer
note "Add `publicTransfers.total` unconditionally."

### 3.2 An ordering constraint, not a signature change

`computePublicUseTransfers(input.publicUseTransfers, nraFactor)` is currently called at `:375`,
**after** `computeVanishingDeduction` at `:367`. It depends only on `input` and `nraFactor`, so moving
it above the vanishing-deduction call introduces no cycle.

`computeVanishingDeduction(properties, grossEstateTotal, elitTotal, dateOfDeath)` keeps its four-parameter
signature. Nine tests in `ordinary-deductions.test.ts` (`:175`-`:258`) call it directly with a literal
`elitTotal`; changing the arity would churn all nine for no gain. Only the **value passed** as the
third argument changes, plus the parameter's name and doc comment.

### 3.3 Worked example, from `.planning/research/LEGAL-CONFORMANCE.md` §2b

Gross estate ₱30,000,000; claims ₱1,000,000; transfer for public use ₱5,000,000; one qualifying
property with net value ₱10,000,000 at 100% (transferred within one year).

- today: `ratio = (30 − 1)/30 = 29/30`; `VD = 10,000,000 × 29/30 = ₱9,666,666` (the code floors)
- statute: `ratio = (30 − 1 − 5)/30 = 24/30 = 0.8`; `VD = ₱8,000,000`

The audit records the downstream tax as ₱560,000 today against ₱660,000 required.

### 3.4 No existing test moves

Every direct `computeVanishingDeduction` test passes `elitTotal` explicitly, so none is affected. The
two `computeOrdinaryDeductions` integration tests at `ordinary-deductions.test.ts:368` and `:392` both
pass `vanishingDeductionProperties: []` **and** `publicUseTransfers: []`, so both branches of the
change are inert for them. No test in the repo currently combines a vanishing-deduction property with
a public-use transfer — which is why the defect was invisible.

### 3.5 The spec is the root cause and must move with the code

`specs/estate-tax-engine-spec.md:846-847` states the rule as "elitTotal = sum of 5A + 5B + 5C + 5D
(NOT including 5G funeral or 5H judicial for pre-TRAIN)" with a following note, and `:879` repeats the
ordering constraint as "Gross estate (Item 34) and ELIT (5A–5D) must be finalized BEFORE computing the
vanishing deduction ratio." Both are corrected; leaving them would invite a later agent to revert the
code to match the spec.

---

## 4. LAW-10 — the estate-tax → succession bridge

### 4.1 The defect, measured at the source line

`frontend/src/lib/estate-tax-engine/pipeline.ts:575-576`:

```
    item40_gross_estate: netTaxableEstate, // NTE, NOT gross estate (backward compat)
    item44_total_deductions: taxComputation.netEstateTaxDue, // Net estate tax due
```

`frontend/src/lib/tax-bridge.ts:46-51` then computes `max(0, item40 − item44)`, so the value handed to
the succession engine as `net_distributable_estate` is **net taxable estate minus estate tax**. Net
taxable estate is already net of the ₱5,000,000 standard deduction, the family-home deduction, the
RA 4917 deduction and the vanishing deduction — none of which is property that left the estate. Both
field names are lies, and both are consumed a second time at `frontend/src/hooks/useTaxBridge.ts:65-68`
and in the `taxOutputKey` at `:85-87`.

Art. 908 sets the base as the property left at death "deducting all debts and charges." A deduction
"allowed without need of substantiation" is neither a debt nor a charge; neither is a family home that
passes to the heirs; neither is relief for property previously taxed.

### 4.2 Worked example, from `.planning/research/LEGAL-CONFORMANCE.md` §2a and §6

₱30,000,000 all-conjugal estate, ₱12,000,000 conjugal family home, surviving spouse plus 2 children,
death 2024-03-01. The §6 audit confirmed the tax side end to end: gross ₱30,000,000; standard
₱5,000,000; 37A family home ₱6,000,000; special total ₱11,000,000; Item 38 ₱19,000,000; Item 39 spouse
share ₱15,000,000; Item 40 NTE ₱4,000,000; **tax due ₱240,000**.

- today: NDE = 4,000,000 − 240,000 = **₱3,760,000**, each of the three heirs **₱1,253,333**
- correct: 30,000,000 − 0 (no debts) − 15,000,000 (spouse) − 240,000 (tax) = **₱14,760,000**, each heir
  **₱4,920,000** — a 74.5% understatement today

### 4.3 The subtraction set, fixed here and not open to the executor

The bridge subtracts exactly four things from `grossEstate.total.total`:

1. the **debts-and-charges** subtotal of the ordinary deductions:
   `item5a_standard_deduction` (which actually holds funeral, see the mapping comment at
   `ordinary-deductions.ts:407`) `+ item5b_claims_against_estate` (claims and judicial)
   `+ item5c_claims_vs_insolvent + item5d_unpaid_mortgages + item5e_unpaid_taxes
   + item5f_casualty_losses`. This is `ordinaryDeductions.total.total` **minus**
   `item5g_vanishing_deduction.total` **minus** `item5h_transfers_for_public_use.total`.
2. `spouseShare.spouseShare` — the surviving spouse's net conjugal half. The audit's fixer note is
   explicit: "subtracting the spouse's conjugal half is **correct** and must be retained."
3. `taxComputation.netEstateTaxDue` — the tax the estate must pay before distribution.
4. nothing else. The standard deduction, the family-home deduction, the RA 4917 deduction, the medical
   deduction and the vanishing deduction are **not** subtracted.

Transfers for public use are also **not** subtracted, for a reason that is arithmetic rather than
interpretive: RR 12-2018 Sec. 6(6) defines them as "bequests, legacies, devises or transfers to or for
the use of the Government," and a bequest, legacy or devise is entered in the succession engine's
`will.legacies` / `will.devises` and paid out of the free portion by step 7. Subtracting it in the
bridge as well would pay it twice. Because a non-testamentary transfer would not be double-counted, the
bridge **emits an explicit warning string** whenever `item5h_transfers_for_public_use.total > 0`, so
the case is never silently computed on an assumption the user did not make.

### 4.4 Backward compatibility with persisted rows

`cases.tax_output_json` is a JSONB blob written by `saveTaxOutput` (`tax-bridge.ts:86`). Rows written
before this phase have no new fields. `computeNetDistributableEstate(a, b) = max(0, a − b)` is pure
arithmetic exercised by 4 of the 31 tests in `frontend/src/lib/__tests__/tax-bridge.test.ts`
(`:180`-`:200`), so it keeps its name, its signature and its behaviour; only the caller changes what it
passes. The new fields are **added** to `EstateTaxEngineOutput` and to `pipeline.ts`'s return, and
`item40_gross_estate` / `item44_total_deductions` are retained so old blobs still parse.

A missing new field must **throw**, never coerce. `.planning/research/LEGAL-CONFORMANCE.md` names this
directly: "a gate should assert that the *bridge* never silently coerces `undefined`/`NaN` into `0`."

### 4.5 Call sites that must move together

- `frontend/src/lib/tax-bridge.ts` — `runTaxBridge` at `:69`, the `EstateTaxEngineOutput` interface at `:12`
- `frontend/src/hooks/useTaxBridge.ts:65-68` and the `taxOutputKey` at `:85-87`
- `frontend/src/lib/estate-tax-engine/pipeline.ts:558-582` (the real return) and `:588-640`
  (`makeErrorOutput`, which must gain the same new fields at 0)
- `frontend/src/lib/estate-tax-engine/types.ts:196-197`

`frontend/src/routes/cases/$caseId.tax.tsx` reads `item40_gross_estate === 0 && tax_due === 0` as
"no assets entered" and skips the bridge. That heuristic is **not** changed here; it is recorded in
`.planning/research/LEGAL-CONFORMANCE.md` and owned by a later phase.

---

## 5. LAW-11 — Reserva troncal (Art. 891)

### 5.1 Half the requirement is already satisfied by Phase 5

`grep -rn "reserva" engine/src/` now returns real code, not the audit's zero matches:

- `engine/src/flags.rs:31` declares `SPEC_FLAG_RESERVA_TRONCAL`
- `engine/src/flags.rs:122-128` detects it from `facts.reserva_troncal_property_present`
- `engine/src/types.rs:366` declares `pub reserva_troncal_property_present: bool` inside
  `ManualReviewFacts`
- `engine/src/flags.rs:340` and `:495` are its two tests
- `frontend/src/types/index.ts:268` and `frontend/src/schemas/index.ts:670` mirror the field on the
  TypeScript side, both optional

`scripts/check-observability.mjs` requires all ten spec flag codes to be declared and exercised, so
this detector is already gate-protected.

### 5.2 What is still missing: the fact is unreachable and unstated

`grep -rn "manual_review_facts" frontend/src --include=*.tsx` returns **zero** hits. No wizard control
writes the field, so in the running product the flag can never fire and the fact pattern still produces
a silent, unencumbered distribution. `WizardContainer.tsx:64-67` builds `config` with exactly two keys
and no `manual_review_facts`.

Separately, `specs/inheritance-engine-spec.md` advertises the flag at `:2313` and a `RESERVATION`
narrative section at `:2123` without ever stating that Art. 891 reservation is **not computed**.
`NarrativeSectionType::Reservation` exists at `engine/src/step10_finalize.rs:50` and is referenced
once more at `:1327`. Art. 891 attaches to specific property by how the propositus acquired it and from
which line; `EngineInput` is a single scalar `net_distributable_estate` with no asset inventory, so the
rule is structurally unimplementable, which makes an express declaration the honest answer.

### 5.3 Where the flag surfaces once set

`frontend/src/components/results/ResultsView.tsx:84` passes `output.warnings` to
`WarningsPanel`, which renders every entry and returns an empty `div` only when the array is empty
(`WarningsPanel.tsx:28-29`). So a set fact produces a visible on-screen warning with no further UI work.

### 5.4 The wizard seam

`EstateStep.tsx` is 89 lines, receives `control`, `setValue` and `watch` from
`WizardContainer`'s `useForm<EngineInput>`, and already renders a `RadioGroup` from
`@/components/ui/radio-group` and `Label` from `@/components/ui/label`. A checkbox bound to
`config.manual_review_facts.reserva_troncal_property_present` is one control in the same file using the
same primitives. `frontend/src/components/wizard/__tests__/EstateStep.test.tsx` is **not** in
`frontend/test-baseline.json`, so all of its tests pass today and must still pass afterwards.

---

## 6. Cross-cutting constraints measured for this phase

- **Commit scope.** `bash scripts/safe-commit.sh -m "<msg>" <path> ...` with repo-root-relative paths.
  `git add -A`, `git add .` and `git commit -a` are prohibited; `node scripts/check-commit-discipline.mjs`
  is gate G7.
- **The plans are themselves gated.** `node scripts/check-plan-closed-world.mjs` (G6) requires each
  plan to carry frontmatter keys `phase, plan, wave, depends_on, files_modified, autonomous,
  requirements, must_haves` (with `must_haves.truths`), the sections `<objective>`, `<constraints>`,
  `<tasks>`, `<verification>`, `<success_criteria>`, and on every task the fields `read_first`,
  `action`, `verify`, `acceptance_criteria` (two bullets minimum) and `done`.
- **Ledgers.** `frontend/test-baseline.json` and `gate-skips.lock` may only shrink;
  `engine/defect-baseline.json` may only shrink; `gates.manifest.json` and `gates.manifest.lock` may
  only grow with G9 last. No plan in this phase adds a gate.
- **`min_total_tests` is a floor, not an equality.** `frontend/scripts/check-test-baseline.mjs:186`
  fails only when the count drops below 2416, so added tests are safe.
- **Engine floor.** `cd engine && cargo test` must report 0 failed with at least 527 passing at the end
  of every plan.
- **WASM.** `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` is ignored by `frontend/.gitignore` and
  is never staged. It must be rebuilt with `bash engine/build-wasm.sh` before the frontend suite is
  used to judge an engine change.

---

## Validation Architecture

Every requirement in this phase is a wrong number that reproduces today. The validation strategy is
therefore before-and-after measurement against a named, committed vector, never a self-report.

**Sampling rate.** Each of the five requirements gets at least one named test that fails on the
pre-fix code and passes on the post-fix code, plus at least one *control* that must not move. That
pairing is the Nyquist floor here: a single post-fix assertion cannot distinguish "the fix worked" from
"the assertion was written to match whatever the code already did."

| Requirement | Signal | Instrument | Control that must not move |
|---|---|---|---|
| LAW-05(a) | a legatee's row appears and the residue divides | `test_law05a_*` in `engine/tests/integration.rs` | the 29 preterition cases with no legacy keep their amounts; `INV01`, `INV07`, `INV13` stay green |
| LAW-05(b) | preterition stops firing on a donee heir | `test_law05b_*` in `engine/tests/integration.rs`, pinned to the measured B-proxy output | the exempt-donation case still preterites and now also flags |
| LAW-08 | 37D is 0 for a TRAIN death | corrected tests in `special-deductions.test.ts` | `NRA → 0` and `no medical → 0` already assert 0; `constants.test.ts` cap unchanged |
| LAW-09 | the ratio drops when a public-use transfer exists | a new test in `ordinary-deductions.test.ts` | the nine direct `computeVanishingDeduction` tests pass an explicit `elitTotal` and must all still pass |
| LAW-10 | NDE is the Art. 908 base | a new worked-example test in `frontend/src/lib/__tests__/tax-bridge.test.ts` | the four `computeNetDistributableEstate` arithmetic tests must still pass unchanged |
| LAW-11 | the flag reaches `EngineOutput.warnings` from wizard input | `test_law11_*` in `engine/tests/integration.rs` plus an `EstateStep.test.tsx` case | the 16 existing `EstateStep` tests stay green and out of `test-baseline.json` |

**Instrumentation already in place.** `engine/tests/fuzz_invariants.rs` evaluates 16 named invariants
per case and reports which one broke; `engine/tests/observability.rs` runs the whole 173-file corpus;
`engine/tests/defect_ledger.rs` fails in both directions; `frontend/scripts/check-test-baseline.mjs`
fails on any failure outside the ledger and on any newly-passing ledger entry.

**What is deliberately not instrumented.** No coverage percentage threshold is asserted (Phase 6's
recorded decision). No screenshot or vision gate is added (Phases 10-12 own those). No new gate is
added to `gates.manifest.json` in this phase.
