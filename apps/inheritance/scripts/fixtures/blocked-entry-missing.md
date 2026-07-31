# Blocked requirements

Three requirements in this project cannot be implemented by any agent, because each one requires a
point of Philippine law that only the lawyer collaborator may decide, and none of the three questions
has been answered — the lawyer is sitting the bar examination. This file is the committed record of
what each requirement waits on, quoted in the lawyer's own requested wording.

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
