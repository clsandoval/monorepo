# Lawyer Review Agenda

This file holds eight interpretive choices the engine has **already made**. Each one needs a
lawyer's signature, not a bug fix.

None of the eight is a defect. Each current reading is defensible, and several are the mainstream
one. What is missing is a *recorded* decision — a named person saying "yes, that is how I would
advise," so that no later agent silently re-decides it.

The source of every entry below is `.planning/research/LEGAL-CONFORMANCE.md` section 3, an audit in
which every legal proposition was verified against primary text and every code claim was reproduced
by running the engine. Nothing here restates the law in new words; each entry is a transcription of
that audit's question, with an answer block attached.

Three of the eight block code changes already scheduled for Phase 14. They are listed first.

## How to answer

- Each entry ends with an **Answer** block holding three checkboxes. **Tick exactly one.**
- Ticking box 1, *confirm Reading A*, means the engine's current behaviour stands.
- Ticking box 2, *change to Reading B*, means the engine changes to the stated alternative.
- Ticking box 3, *neither — see notes*, means the answer is written in the `Notes:` field below it.
- Fill in who answered, and the date, on every entry you answer.
- Answering the **three** entries in the table below is enough to unblock the scheduled work.
  Answering all eight closes the agenda.
- Nothing in the codebase changes because a box was ticked. An answer becomes a code change only
  through the procedure in `.planning/LEGAL-CORRECTION-WORKFLOW.md`.

## Answer these three first

| Decision | Question | Blocks | One-line ask |
|---|---|---|---|
| `LAWYER-04` | Q4 — the reach of *Aquino v. Aquino* into the collateral line | `LAW-07` | Confirm the collateral bar survives, so it can be implemented |
| `LAWYER-06` | Q6 — an heir's donation-excess entitlement, estate pesos or a claim against the donee | `LAW-06` | Confirm the claim-against-donee shape, which changes the output schema |
| `LAWYER-08` | Q8 — RA 11642 Sec. 41 retroactivity to pre-2022 decrees | `LAW-12` | Answer, or say the engine should refuse the fact pattern |
| `LAWYER-09` | Q9 — does a donation exempt from collation defeat preterition | none | Confirm Reading A, or change to Reading B |

The remaining five entries can be answered at any time, and no scheduled work waits on them.

## Entry format

Every entry carries the same eight headings, in this order, so the set is uniform to a reader and
parsable by a machine:

1. `## LAWYER-0N — QN: <short title>` — the entry heading
2. `**Status:**` — one of `awaiting-answer`, `confirmed`, `changed`
3. `**Engine implements:**` — one of `A`, `B`, `neither`
4. `**Blocks:**` — a requirement id such as `LAW-07`, or `nothing scheduled`
5. `**Governing code:**` — the file and the rule site the decision governs

then six level-three (`###`) headings, in this order, spelled exactly as shown:

6. `The question`
7. `Reading A`
8. `Reading B`
9. `What the engine does today`
10. `What I need from you`
11. `Answer`

`**Engine implements:** neither` means the engine implements **no rule on the point at all**. That
is itself an unrecorded position, not a neutral one: the engine still produces a number, it just
produces it by omission.

---

## LAWYER-01 — Q1: One legitimate child plus surviving spouse, intestate

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** nothing scheduled
**Governing code:** `engine/src/step7_distribute.rs` — `I2: n LC + Spouse (Art. 996)`

### The question

Is the split ½/½, or ½ to the child and ¼ to the spouse?

### Reading A

Art. 996 — the spouse takes "the same share as that of each of the children," so the lone child and
the spouse each take one share: **½/½**. This is *Santillon v. Miranda*, G.R. No. L-19281 (1965).

### Reading B

Apply the testate legitime table — child ½ (Art. 888), spouse ¼ (Art. 892 ¶1), remainder intestate.

### What the engine does today

Reading A. One legitimate child plus spouse, estate ₱12,000,000 → **₱6,000,000 each**, scenario code
I2, legal basis `["Art. 996"]`.

This is the single most common intestate family shape in the Philippines. Everything downstream
inherits it.

### What I need from you

Confirm *Santillon* is still how you would advise, and that no post-1965 decision has unsettled it.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q1.*

---

## LAWYER-02 — Q2: One legitimate child plus spouse plus illegitimate children, testate

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** nothing scheduled
**Governing code:** `engine/src/step5_legitimes.rs` — `"Art. 892 ¶1".into()`

### The question

Is the spouse's legitime ¼, or equal to the child's ½?

### Reading A

Art. 892 ¶1 controls — "If only one legitimate child... survives, the widow or widower shall be
entitled to **one-fourth**."

### Reading B

Art. 897's literal text — where the spouse survives with "legitimate children or descendants, and
acknowledged natural children," the spouse takes "a portion **equal to the legitime of each of the
legitimate children**," i.e. ½ where there is one child.

### What the engine does today

Reading A (¼), following the prevailing doctrinal table. The spec cites Art. 897 only for the
multi-child case T5b, so the choice is unrecorded.

### What I need from you

Confirm Art. 897 is read as addressing the plural case only, so that reading can be written into the
spec with your name on it.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q2.*

---

## LAWYER-03 — Q3: Nephews and nieces alone surviving, per capita under Art. 975 ¶2

**Status:** awaiting-answer
**Engine implements:** neither
**Blocks:** nothing scheduled
**Governing code:** `engine/src/step7_distribute.rs` — `Branch 3: Nephews/nieces only — per capita (Art. 975)`

### The question

When nephews and nieces alone succeed per capita, does the Art. 1006 full/half-blood 2:1 ratio still
apply?

### Reading A

Art. 975 ¶2 — "if they alone survive, they shall inherit **in equal portions**" — flat per capita,
ratio gone.

### Reading B

Art. 1008 — children of half-blood siblings succeed "in accordance with the rules laid down for
brothers and sisters of the full blood," which imports Art. 1006's doubling. Tolentino and Jurado
are cited for this reading.

### What the engine does today

Neither. The per-capita branch is unreachable dead code, so the engine currently produces per
stirpes regardless. `specs/inheritance-engine-spec.md:1400-1412` flags the debate and proposes a
config flag.

### What I need from you

An answer before the dead branch is enabled, so the fix does not hardcode an unreviewed position. A
config flag defaulting to the answer given is acceptable.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q3.*

---

## LAWYER-04 — Q4: How far *Aquino v. Aquino* reaches into the collateral line

**Status:** awaiting-answer
**Engine implements:** neither
**Blocks:** LAW-07
**Governing code:** `engine/src/step1_classify.rs` — `pub fn check_eligibility`

### The question

Does Art. 992's iron curtain still bar a nonmarital claimant in the collateral line after
*Aquino v. Aquino*, G.R. Nos. 208912 and 209018, En Banc, 7 December 2021?

### Reading A

The narrow reading, and what the Court said about itself: *Aquino* limited its own holding — "this
ruling will only apply when the nonmarital child has a right of representation to their parent's
share in her grandparent's legitime. **It is silent on collateral relatives** where the nonmarital
child may inherit by themself." Art. 992 therefore survives intact for collaterals, and
*Diaz v. IAC* remains operative there.

### Reading B

The broad reading: the Court's equal-protection reasoning about birth status cannot coherently stop
at the direct line, so lower courts should extend it.

### What the engine does today

Neither as a rule. No iron curtain exists anywhere:
`grep -rn "IronCurtain\|iron_curtain" engine/src` returns zero hits. That happens to match Reading A
in the direct line and contradicts Reading A in the collateral line. Two reproduced consequences,
transcribed from the audit:

- An illegitimate decedent whose sole survivor is a legitimate half-blood sibling, estate
  ₱8,000,000 → the sibling takes **₱8,000,000**, scenario I13, warnings `[]`. The
  `is_illegitimate=false` control is bit-identical, proving no rule runs. Under Reading A the
  sibling is barred and the estate escheats.
- A nonmarital nephew currently inherits from a marital uncle.

The suite's only Art. 992 test, `engine/tests/integration.rs:1336`, passes with the rule entirely
absent. `specs/inheritance-v2-spec.md:524` defines an `ExclusionReason::IronCurtain` that nothing
implements.

### What I need from you

Two things, stated separately so they can be answered separately:

1. Confirm the narrow reading (Reading A), so the collateral barrier can be implemented.
2. State whether every case where the barrier is decisive should carry a `LAWYER_REVIEW` flag in the
   output rather than being a silent computation.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:
Flag every barrier-decisive case for manual review? yes / no:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q4, with supporting rows from
sections 2a and 4.*

This is the highest-stakes item on the agenda. `LAW-07` in Phase 14 cannot start without it.

---

## LAWYER-05 — Q5: Art. 907 reduction, self-executing or a claim the heir must assert

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** nothing scheduled
**Governing code:** `engine/src/step6_validation.rs` — `pub fn reduce_inofficious`

### The question

When a compulsory heir's legitime is impaired, does the engine compute the corrected partition
directly, or report the impairment as a claim the heir must assert?

### Reading A

Compute the corrected partition. Art. 907 reduction is applied and the output presents the result as
if it were the will's own disposition.

### Reading B

Art. 907 reduction happens "**on petition of the same**," and Art. 906 gives the heir a right to
"**demand**" completion. Neither is self-executing. The output should show the will's figures, the
legitime, the shortfall, and who must petition.

### What the engine does today

Reading A, silently. Reproduced: estate ₱30,000,000, two children each given 1/10 with a stranger
given 8/10 → the engine returns the corrected 250,000,000 / 250,000,000 / 500,000,000 centavos with
`warnings: []`, and a narrative that never mentions that the stranger's 80% bequest was cut by
₱3,000,000 or that the first child's own gift was increased. The disappointed voluntary heir has no
notice of the fact he would litigate.

### What I need from you

Decide whether the deliverable is a computed partition, or a computed partition **plus** a
disclosure of the procedural posture. In the audit's own words: "This is a product decision with
legal consequences and I should not make it."

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q5.*

---

## LAWYER-06 — Q6: An heir's entitlement exceeding the estate because of a donation *inter vivos*

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** LAW-06
**Governing code:** `engine/src/step4_estate_base.rs` — `pub fn step4_compute_estate_base`; `engine/src/step8_collation.rs` — `pub fn step8_collation_adjustment`

### The question

Should the output show one number or two?

### Reading A

One number, drawn from the collated base.

### Reading B

Two distinct outputs: payable-from-estate, and a reduction or return claim against a *named donee*.
Art. 771 is explicit that reduction "shall not prevent the donations from taking effect during the
life of the donor, nor shall it bar the donee from appropriating the fruits," so the heir gets an
*accion de reduccion*, not estate property. Only compulsory heirs may sue, and only for the excess.

### What the engine does today

Reading A, and the audit records it as wrong as implemented:

- A ₱10,000,000 estate with one child and a ₱20,000,000 stranger donation produces **₱30,000,000**
  to that child — three times the entire estate.
- A ₱10,000,000 estate with two children and a ₱20,000,000 donation to the first produces
  **₱15,000,000** to the second, ₱5,000,000 more than the whole estate.

The `LAW-06` fix requires Reading B's data model. An answer of "confirm Reading A" therefore changes
what the fix looks like; it does not remove the need for one.

### What I need from you

Confirm that modelling the heir's remedy as a claim against the donee, rather than as estate pesos,
is the right shape — since it changes the output schema.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q6.*

---

## LAWYER-07 — Q7: Family home deduction on a conjugal home, half of FMV or full FMV

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** nothing scheduled
**Governing code:** `frontend/src/lib/estate-tax-engine/special-deductions.ts` — `familyHome.ownershipType === 'conjugal'`; `specs/estate-tax-engine-spec.md` — `min(fmv * 0.5, cap)`

### The question

Is the deduction half of fair market value, or full fair market value up to the cap?

### Reading A

`min(fmv × 0.5, ₱10,000,000)`, the decedent's interest. RR 12-2018 §7.2.3: "the current fair market
value... or the extent of the decedent's interest (whether conjugal/community or exclusive
property), **whichever is lower**, but not exceeding P10,000,000."

### Reading B

Full fair market value up to the cap. The engine's own spec hedges at
`specs/estate-tax-engine-spec.md:1008`: "Some commentary uses full FMV for conjugal."

### What the engine does today

Reading A. A conjugal ₱12,000,000 home yields a **₱6,000,000** deduction; an exclusive ₱12,000,000
home yields ₱10,000,000, capped.

### What I need from you

One line confirming Reading A, so the spec hedge can be replaced with a recorded decision and a
regression test can pin it. ₱6,000,000 of deduction turns on it — roughly ₱360,000 of tax.

The auditor reads §7.2.3 as settling this in the engine's favour and would delete the hedge. That is
recorded here as the auditor's reading, not as a conclusion; the hedge stays until you answer.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q7.*

---

## LAWYER-08 — Q8: RA 11642 Sec. 41 retroactivity to adoption decrees issued before 2022

**Status:** awaiting-answer
**Engine implements:** neither
**Blocks:** LAW-12
**Governing code:** `engine/src/types.rs` — `pub retroactive_ra_11642: bool`

### The question

Does RA 11642 Sec. 41 apply retroactively to adoption decrees issued before 2022?

### Reading A

Yes. Sec. 41 extends legitimate filiation to "the adopter's parents, adopter's legitimate siblings,
and legitimate descendants," and Sec. 43 gives reciprocal succession "without distinction from
legitimate filiations." Applied to a pre-2022 decree this reverses *Sayson v. CA* ("The relationship
created by the adoption is between only the adopting parents and the adopted child and does not
extend to the blood relatives of either party"), letting an adoptee represent the adopter in the
adopter's parent's estate.

### Reading B

No. Succession rights vest under the law at the decedent's death, and Sec. 41 is prospective as to
decrees.

### What the engine does today

Neither. `config.retroactive_ra_11642` and `AdoptionRegime` exist and are provably dead: the audit
ran the identical family tree as `{Ra8552, retroactive: false}` and as
`{Ra11642, retroactive: true}` and the diff of the two complete outputs is empty. The engine
silently computes every case under the pre-2022 *Sayson* rule.

Separately, `engine/src/step1_classify.rs` justifies its one operative adoption rule by citing
"RA 8552 Sec. 20" — a provision repealed by RA 11642 Sec. 62.

### What I need from you

The answer becomes the default for a flag that currently does nothing.

The audit put an explicit alternative on the table: "I would rather not decide" is itself an
acceptable answer. The engine is then built to **refuse** to compute Sec. 41 fact patterns rather
than guessing.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:
Refuse to compute Sec. 41 fact patterns instead of answering? yes / no:

*Source: `.planning/research/LEGAL-CONFORMANCE.md` section 3, question Q8.*

---

## LAWYER-09 — Q9: Does a donation the Code exempts from collation defeat preterition?

**Status:** awaiting-answer
**Engine implements:** A
**Blocks:** nothing scheduled
**Governing code:** `engine/src/step6_validation.rs` — `pub fn heir_received_advance_on_legitime`

### The question

*Morales v. Olondriz* requires the omission to be total: the heir "did not also receive any legacies,
devises, or advances on his legitime." Arts. 1062, 1066, 1067, 1068 and 1070 each declare a class of
donation not brought to collation. Does such a donation nevertheless make the omission less than
total?

### Reading A

No. Art. 1061 makes a donation an advance on the legitime because it is brought into the mass "in
order that it may be computed in the determination of the legitime." A donation the Code removes
from collation is by definition not an advance on the legitime, so it does not satisfy that limb of
the *Morales* test and preterition still applies.

### Reading B

Yes. *Morales*' operative word is "total". An heir who received property from the decedent during
the decedent's lifetime was not totally omitted, whatever the collation treatment of that property,
so preterition does not apply.

### What the engine does today

Reading A, and it now says so out loud. A collated donation defeats preterition; a donation in one of
the five exempted classes does not, and the engine emits a manual-review flag with category
`preterition_exempt_donation` naming the heir and the articles. Before Phase 8 the engine consulted
no donation at all, so a child holding a ₱10,000,000 plain donation destroyed the will.

### What I need from you

Confirm Reading A, or change to Reading B. The stakes are the whole will: under Reading A the
institution of heirs is annulled and the estate distributes intestate; under Reading B the will
stands.

### Answer

- [ ] Confirm Reading A
- [ ] Change to Reading B
- [ ] Neither — see notes

Answered by:
Date:
Notes:

*Source: engine behaviour recorded during Phase 8, plan 08-01; the underlying test is quoted in `.planning/research/LEGAL-CONFORMANCE.md` section 2a, Art. 854 row.*

---

## Status at a glance

| Decision | Question | Engine implements | Blocks | Status |
|---|---|---|---|---|
| `LAWYER-01` | Q1 — one legitimate child plus spouse, intestate | A | nothing scheduled | awaiting-answer |
| `LAWYER-02` | Q2 — spouse's legitime with one legitimate child, testate | A | nothing scheduled | awaiting-answer |
| `LAWYER-03` | Q3 — nephews and nieces alone, per capita under Art. 975 ¶2 | neither | nothing scheduled | awaiting-answer |
| `LAWYER-04` | Q4 — reach of *Aquino v. Aquino* into the collateral line | neither | LAW-07 | awaiting-answer |
| `LAWYER-05` | Q5 — Art. 907 reduction, self-executing or a claim | A | nothing scheduled | awaiting-answer |
| `LAWYER-06` | Q6 — donation-excess entitlement, estate pesos or a claim | A | LAW-06 | awaiting-answer |
| `LAWYER-07` | Q7 — family home deduction on a conjugal home | A | nothing scheduled | awaiting-answer |
| `LAWYER-08` | Q8 — RA 11642 Sec. 41 retroactivity to pre-2022 decrees | neither | LAW-12 | awaiting-answer |
| `LAWYER-09` | Q9 — does a donation exempt from collation defeat preterition | A | nothing scheduled | awaiting-answer |

Nine of nine decisions are awaiting an answer.

`.planning/lawyer-decisions.json` is the machine-readable form of this table, and gate `G10` fails
the build when the two disagree.

A status is changed only through `.planning/LEGAL-CORRECTION-WORKFLOW.md`, never by editing this
table alone.
