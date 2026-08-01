# Blocked requirements

Six requirements in this project cannot be implemented by any agent, because each one requires a
point of Philippine law that only the lawyer collaborator may decide, and none of the six questions
has been answered — the lawyer is sitting the bar examination. Three of the six are estate-tax
penalty lines added by Phase 20: the NIRC Sec. 248 surcharge, the NIRC Sec. 249 interest, and the
compromise penalty. This file is the committed record of what each requirement waits on, quoted in
the lawyer's own requested wording.

`node scripts/check-blocked-requirements.mjs` holds this file to the registry in
`.planning/lawyer-decisions.json`. It fails when an entry drifts from the registry, when a
requirement is marked complete while its blocking decision is still `awaiting-answer`, and — most
importantly — when an **answer has arrived** and the requirement is still open. That last case is a
deliberate red on good news: the answer arriving is exactly the moment the work must start, and a
silent pass would let a month-long unattended loop walk straight past it.

Nothing in this file states, adopts, defaults to, or implies a reading of any contested provision.

| Requirement | Blocking decision | Question | Registry status |
|---|---|---|---|
| LAW-06 | LAWYER-06 | Q6 — an heir's entitlement exceeding the estate because of a donation *inter vivos* | awaiting-answer |
| LAW-07 | LAWYER-04 | Q4 — how far *Aquino v. Aquino* reaches into the collateral line | awaiting-answer |
| LAW-12 | LAWYER-08 | Q8 — RA 11642 Sec. 41 retroactivity to adoption decrees issued before 2022 | awaiting-answer |
| PEN-01 | LAWYER-10 | Q10 — the NIRC Sec. 248 surcharge on a late estate-tax return | awaiting-answer |
| PEN-02 | LAWYER-11 | Q11 — the NIRC Sec. 249 interest on late-paid estate tax | awaiting-answer |
| PEN-03 | LAWYER-12 | Q12 — whether a compromise penalty may be computed by an engine at all | awaiting-answer |

## LAW-06 — blocked on LAWYER-06

**Requirement:** A donation *inter vivos* never causes distributed shares to exceed the estate; an heir's excess entitlement is modelled as a reduction claim against a named donee (Arts. 771, 911)

**Blocking decision:** LAWYER-06 — Q6: An heir's entitlement exceeding the estate because of a donation *inter vivos* (articles: Art. 771)

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> Confirm that modelling the heir's remedy as a claim against the donee, rather than as estate pesos,
> is the right shape — since it changes the output schema.

**What already exists in the tree:** two entries in `engine/defect-baseline.json` record the
arithmetic without taking a position on the law. `02-heir-donation-above-estate.json` violates
`INV01` and `SAFETY01` — 2 rows, `sum_net_from_estate` 125000000 against an estate of 100000000.
`03-stranger-donee.json` violates `INV01` — 2 rows, `sum_net_from_estate` 110000000 against an
estate of 100000000, on a donation of only 0.1× the estate, which is itself the finding. Both entries
carry `requirement: LAW-06`, `fixed_by_phase: 14` and `blocked_on: LAWYER-06`. That ledger may only
shrink, so the two entries cannot be quietly retired without the fix.

**Why no agent may proceed:** `.planning/PLAN-STANDARD.md` section 3 makes any point of Philippine
law a BLOCKED trigger "without exception, and regardless of how clear the answer looks", and states
the prohibition directly: guessing is prohibited, picking whichever reading looks defensible is
prohibited, and silently choosing the option that makes the build green is prohibited. The choice
here is not cosmetic — it changes the output schema, so an agent that guessed would be freezing a
wire format around an unratified legal reading.

**Unblock procedure:** run the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md` in order —
step 1 record the claim and change no code, quoting the lawyer and never paraphrasing; step 2 name a
test vector, formatted `TV-L<NN>` with `NN` zero-padded from `01`, allocated in order and never
reused; step 3 watch it fail before any fix; step 4 fix in exactly one place; step 5 close the loop by
setting the decision's `status` and filling `answered_by`, `answered_on` and `answer`.

## LAW-07 — blocked on LAWYER-04

**Requirement:** Art. 992's iron curtain is implemented for the collateral line, per the answer to LAWYER-04

**Blocking decision:** LAWYER-04 — Q4: How far *Aquino v. Aquino* reaches into the collateral line (articles: Art. 992; authority: Aquino v. Aquino, G.R. Nos. 208912 and 209018, En Banc, 7 December 2021; Diaz v. IAC)

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> Two things, stated separately so they can be answered separately:
>
> 1. Confirm the narrow reading (Reading A), so the collateral barrier can be implemented.
> 2. State whether every case where the barrier is decisive should carry a `LAWYER_REVIEW` flag in the
>    output rather than being a silent computation.

**What already exists in the tree:** no iron curtain at all —
`grep -rn "IronCurtain\|iron_curtain" engine/src` returns zero hits, measured again during this plan.
`reading_implemented` in the registry is therefore recorded as `"neither"`, not as a reading. The
`LAWYER-04` anchor in `.planning/lawyer-decisions.json` points at
`engine/src/step1_classify.rs` → `pub fn check_eligibility`, which is where a barrier would land if
one is ever authorised. `specs/inheritance-v2-spec.md` defines an `ExclusionReason::IronCurtain` that
nothing implements.

**Why no agent may proceed:** `.planning/PLAN-STANDARD.md` section 3 — any point of Philippine law is
a BLOCKED trigger without exception; guessing is prohibited, adopting whichever reading looks
defensible is prohibited, and silently taking the option that makes a check green is prohibited. This
is the agenda's own highest-stakes item, and the second half of the question (whether a
barrier-decisive case must carry a `LAWYER_REVIEW` flag) is a second decision that the first answer
does not supply.

**Unblock procedure:** run the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md` in order —
step 1 record the claim and change no code, quoting the lawyer and never paraphrasing; step 2 name a
test vector, formatted `TV-L<NN>` with `NN` zero-padded from `01`, allocated in order and never
reused; step 3 watch it fail before any fix; step 4 fix in exactly one place; step 5 close the loop by
setting the decision's `status` and filling `answered_by`, `answered_on` and `answer`.

## LAW-12 — blocked on LAWYER-08

**Requirement:** The RA 11642 adoption regime is either implemented or made to refuse computation, replacing the currently inert `retroactive_ra_11642` flag and the repealed RA 8552 citations

**Blocking decision:** LAWYER-08 — Q8: RA 11642 Sec. 41 retroactivity to adoption decrees issued before 2022 (articles: RA 11642 Sec. 41, RA 11642 Sec. 43, RA 11642 Sec. 62, RA 8552 Sec. 20; authority: Sayson v. CA, G.R. No. 89224 (1992))

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> The answer becomes the default for a flag that currently does nothing.
>
> The audit put an explicit alternative on the table: "I would rather not decide" is itself an
> acceptable answer. The engine is then built to **refuse** to compute Sec. 41 fact patterns rather
> than guessing.

**What already exists in the tree:** `config.retroactive_ra_11642` is inert — it is declared at
`engine/src/types.rs:372`, defaulted to `false` at `engine/src/types.rs:381`, and read nowhere else
in `engine/src/`, so setting it changes no number today. The `AdoptionRegime` type exists at
`engine/src/types.rs:121`, and the only operative adoption rule, at
`engine/src/step1_classify.rs:284`, hardcodes `AdoptionRegime::Ra8552` — the statute RA 11642 Sec. 62
repealed. `engine/src/flags.rs:143` compares `regime == AdoptionRegime::Ra8552` against an
`RA_11642_BOUNDARY` date, which is a flag, not a rule.

**Why no agent may proceed:** `.planning/PLAN-STANDARD.md` section 3 — any point of Philippine law is
a BLOCKED trigger without exception. Here the prohibition bites unusually hard, because the question
itself offers "refuse to compute" as a legitimate answer; an agent that picked that option to make a
check green would be doing exactly what section 3 names as prohibited — silently choosing the option
that makes the build green — even though the option is one the lawyer might well pick.

**Unblock procedure:** run the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md` in order —
step 1 record the claim and change no code, quoting the lawyer and never paraphrasing; step 2 name a
test vector, formatted `TV-L<NN>` with `NN` zero-padded from `01`, allocated in order and never
reused; step 3 watch it fail before any fix; step 4 fix in exactly one place; step 5 close the loop by
setting the decision's `status` and filling `answered_by`, `answered_on` and `answer`.

## PEN-01 — blocked on LAWYER-10

**Requirement:** The surcharge on a late estate-tax return is computed from the date of death and the filing date, and the line carries NIRC Sec. 248

**Blocking decision:** LAWYER-10 — Q10: The NIRC Sec. 248 surcharge on a late estate-tax return (articles: NIRC Sec. 248)

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> Should this engine compute a Sec. 248 surcharge at all, and if so, which four inputs govern it: the
> rate, the amount the rate applies to, the date it begins to run, and the date it stops running?

**What already exists in the tree:** the delivered half is real and testable. The hardcoded
`surcharges: 0` is gone from both output sites in
`frontend/src/lib/estate-tax-engine/pipeline.ts`. The surcharge line carries `authority`
`NIRC Sec. 248`, `status` `declined`, `centavos` `null` and `lawyerDecision` `LAWYER-10`. The
statutory filing deadline and the whole-day lateness ARE computed from the date of death and the
entered filing date — a 2020-06-15 death filed 2025-06-15 is 1461 days past a 2021-06-15 deadline —
because `specs/estate-tax-engine-spec.md` section 21 states the deadline and transcribing a spec
sentence is not deciding a point of law. `Form1801View` prints the section and the words
`NOT COMPUTED` rather than a peso figure. The blocked half is the FIGURE itself.

**Why no agent may proceed:** `specs/estate-tax-engine-spec.md` section 1 lists *"Compute surcharges,
interest, or penalties for late filing"* under **What the engine does NOT do**, and section 2 lists
*"Surcharges, interest, compromise penalties"* under **Out of Scope**. No rate, base or accrual rule
for the section is stated anywhere in this repository, so writing one is authoring a statement of
Philippine law under `.planning/NEW-LEGAL-RULE.md` Step 1, which `CLAUDE.md` invariant 6 forbids
without exception and regardless of how clear the answer looks.

**Unblock procedure:** run the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md` in order —
step 1 record the lawyer's answer verbatim and change no code; step 2 name a test vector; step 3
watch it fail before any fix; step 4 fix in exactly one place, which for this requirement is
`declinedPenaltyLines` in `frontend/src/lib/estate-tax-engine/penalties.ts` and nowhere else; step 5
close the loop by setting `LAWYER-10`'s `status` and filling `answered_by`, `answered_on` and
`answer`. The summing rule the new figure feeds is already implemented and unit-tested as
`sumTotalAmountDue`, so no arithmetic needs inventing at that point.

## PEN-02 — blocked on LAWYER-11

**Requirement:** The interest on late-paid estate tax is computed from the date of death and the filing date, and the line carries NIRC Sec. 249

**Blocking decision:** LAWYER-11 — Q11: The NIRC Sec. 249 interest on late-paid estate tax (articles: NIRC Sec. 249)

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> Should this engine compute interest under Sec. 249, and if so, which four inputs govern it: the
> rate, the amount the rate applies to, the date it begins to run, and the date it stops running? May
> interest and the Sec. 248 surcharge run on the same liability at the same time?

**What already exists in the tree:** the hardcoded `interest: 0` is gone from both output sites in
`pipeline.ts`. The interest line carries `authority` `NIRC Sec. 249`, `status` `declined`, `centavos`
`null` and `lawyerDecision` `LAWYER-11`, and the same real statutory deadline and day count computed
for `PEN-01` are printed alongside it. `Form1801View` prints the section and the words
`NOT COMPUTED`. The blocked half is the figure, and additionally whether the line may be printed at
the same time as the surcharge line at all — the engine will not infer that.

**Why no agent may proceed:** the same two spec sentences quoted under `PEN-01` place interest out of
scope, and no rate, base or accrual rule for the section is stated anywhere in this repository.
Supplying one is the prohibited act under `.planning/NEW-LEGAL-RULE.md` Step 1 and `CLAUDE.md`
invariant 6.

**Unblock procedure:** the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md`, with step 4's
single site being `declinedPenaltyLines` in `frontend/src/lib/estate-tax-engine/penalties.ts`, and
step 5 closing `LAWYER-11`.

## PEN-03 — blocked on LAWYER-12

**Requirement:** The return publishes a total amount due that includes every penalty line, or no total at all

**Blocking decision:** LAWYER-12 — Q12: Whether a compromise penalty may be computed by an engine at all

**Registry status:** awaiting-answer

**Exact question awaiting an answer:**

> A compromise penalty is a negotiated figure rather than an arithmetic one, and no schedule for it
> is stated in either spec. Should the engine ever print an amount for it? If it should, which
> schedule governs, and what makes that schedule binding on a return this product generates?

**What already exists in the tree:** more of this requirement is delivered than of the other two.
`total_amount_due: taxComputation.estateTaxDue` is gone; the field is `null` on every computation
while any line is declined, and the return prints `NOT A TOTAL — SEE NOTE BELOW` with the engine's
own refusal underneath. The SUMMING RULE IS IMPLEMENTED AND UNIT-TESTED IN BOTH BRANCHES:
`sumTotalAmountDue` returns the exact integer sum of the base tax and three determined lines, and
`null` over any set containing a declined line. It was written and tested before any line was
determined precisely so that the total is a rule that was reviewed rather than one invented later
under pressure. The compromise-penalty line carries `authority`
`specs/estate-tax-engine-spec.md §2 Out of Scope`, `status` `declined` and `lawyerDecision`
`LAWYER-12`. A total that MOVES waits on all three of `LAWYER-10`, `LAWYER-11` and `LAWYER-12`.

**Why no agent may proceed:** `specs/estate-tax-engine-spec.md` section 2 lists compromise penalties
out of scope and no schedule for one is stated anywhere in this repository. The `articles` array for
`LAWYER-12` in `.planning/lawyer-decisions.json` is deliberately EMPTY for the same reason: naming a
provision would itself be the prohibited act.

**Unblock procedure:** the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md`. Step 4 has exactly
one site, `declinedPenaltyLines` in `frontend/src/lib/estate-tax-engine/penalties.ts`; nothing in
`pipeline.ts` or `Form1801View.tsx` needs editing, because both already read the object and both
branches — declined and determined — are implemented and covered by tests today.
