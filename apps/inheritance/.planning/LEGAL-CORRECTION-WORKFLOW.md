# Legal Correction Workflow

This is the single procedure by which a lawyer's correction — or an answer to one of the eight
recorded decisions in `.planning/LAWYER-AGENDA.md` — becomes a change in this codebase. No other
path exists. A legal change made outside this procedure is a silent change to a peso figure, and a
silent wrong number is the exact failure this project ranks as worse than any loud one.

## When this workflow applies

1. The lawyer answers one of the eight entries in `.planning/LAWYER-AGENDA.md`.
2. The lawyer says an output is wrong, whether or not it maps to an existing entry.
3. An executor reports BLOCKED on a point of law per `.planning/PLAN-STANDARD.md` section 3, and the
   owner obtains an answer.

## The five steps

The order is fixed, not discovered. Naming the vector comes **before** the fix, because a fix
without a vector is a silent change to a legal number.

### Step 1 — Record the claim, change no code

Append the lawyer's words to `.planning/LAWYER-AGENDA.md`, **quoted, never paraphrased**.

- If the claim matches one of the eight existing entries, it goes into that entry's `Notes:` field.
- If it does not, append a new entry using the same eight-heading structure documented in the
  agenda's own `## Entry format` section, taking the next free id — `LAWYER-09`, `LAWYER-10`, and so
  on — and add a matching object to `.planning/lawyer-decisions.json`.

**No source file is edited in this step.** Paraphrasing is prohibited: a paraphrase of a legal
correction is already an interpretation, and the interpretation is the thing the lawyer was asked
for.

*Artifact produced:* an agenda entry (and, for a new claim, a registry object) holding the lawyer's
own words.

### Step 2 — Name a test vector

Every correction gets exactly one test vector id, formatted **`TV-L<NN>`** with `NN` zero-padded
from `01`, allocated in order and **never reused**. `TV-L01`, `TV-L02`, `TV-L03`, and so on.

The `TV-L` prefix distinguishes a lawyer-driven vector from the spec's existing `TV-01` … `TV-23`
series in `engine/tests/integration.rs`. That series is one test function per spec vector, named
`test_tvNN_<description>`; a lawyer vector follows the same convention with the `l` included, and
its function name contains **both the vector id and the governing article**.

Record the vector id in the decision's `vectors` array in `.planning/lawyer-decisions.json`.

The rule: **a correction with no vector is an opinion; a correction with a vector is a regression
test.**

*Artifact produced:* a `TV-L<NN>` id, a test function carrying it, and an entry in the decision's
`vectors` array.

### Step 3 — Watch it fail

Run the vector and confirm it **fails before any fix**.

- Engine vector: `cd engine && cargo test <vector id>`
- Frontend vector: `cd frontend && npx vitest run -t <vector id>`

Record the failure output verbatim in the plan or the summary that carries the fix. A vector that
**passes** before the fix is testing something other than the correction; the correct response is to
rewrite the vector, never to proceed.

*Artifact produced:* pasted failing output, in the record.

### Step 4 — Fix in exactly one place

`EXT-02` forbids a legal rule from being implemented in more than one place, so the fix lands at one
site. Two places to look before editing, both of which already point at it:

- the decision's `anchors` in `.planning/lawyer-decisions.json`;
- its `LAWYER-DECISION: <id>` marker comment in the source.

The fix **must not weaken or delete an existing test or assertion** to accommodate itself. If the
fix cannot be made without doing so, the correct output is a BLOCKED report per
`.planning/PLAN-STANDARD.md` section 3, with the real command output pasted.

*Artifact produced:* a one-site code change, with the vector from step 3 now passing.

### Step 5 — Close the loop

Set the decision's `status` to `confirmed` or `changed`, and fill `answered_by`, `answered_on` and
`answer` with the lawyer's name, the date, and the answer **in the lawyer's own words**. Update the
matching agenda entry's `**Status:**` line and tick the box the lawyer chose.

Then run both and confirm each exits 0:

```bash
node scripts/check-lawyer-agenda.mjs
bash scripts/ci-gates.sh
```

This step cannot be skipped by an agent in a hurry: `DECISION STATUS INVALID` fails the build when a
status other than `awaiting-answer` carries no answer fields, and `AGENDA DRIFT` fails it when the
agenda and the registry disagree about the status or the reading.

*Artifact produced:* a closed decision, gate-verified in both files.

## What an agent may never do

- Advance a decision's `status` without an answer recorded from the lawyer.
- Change a rule anchored by a decision whose `status` is `awaiting-answer` — that is exactly the
  situation `LAW-06`, `LAW-07` and `LAW-12` are blocked on, and the correct output is BLOCKED.
- Delete, skip or weaken a test or an assertion to accommodate a legal fix.
- Paraphrase the lawyer's words into the record.

## Worked example

**Illustrative only. No answer to `LAWYER-04` has been received; its status is `awaiting-answer`
today, and `LAW-07` is blocked.** The example uses only facts already recorded in the agenda; it
invents none, and it takes no position on the question.

Suppose the lawyer confirms Reading A on `LAWYER-04` — that Art. 992's iron curtain survives
*Aquino v. Aquino* in the collateral line.

1. **Record.** The lawyer's sentence is quoted into the `Notes:` field of the `LAWYER-04` entry.
   No code is touched.
2. **Name.** The vector is `TV-L01`, citing Art. 992, written as a test function in
   `engine/tests/integration.rs` whose name carries both. `"TV-L01"` is added to `LAWYER-04`'s
   `vectors` array.
3. **Fail.** `cd engine && cargo test TV-L01` fails — the audit measured
   `grep -rn "IronCurtain|iron_curtain" engine/src` returning zero hits, so no barrier exists to
   enforce. The failure output is pasted into the fix plan.
4. **Fix.** The change lands at `engine/src/step1_classify.rs`, where the
   `LAWYER-DECISION: LAWYER-04` marker already sits above `check_eligibility` — the registry anchor
   pointed there before the answer arrived. `TV-L01` now passes; no existing test is weakened.
5. **Close.** `LAWYER-04`'s `status` becomes `confirmed`, with `answered_by`, `answered_on` and
   `answer` filled from the lawyer's reply, and the `Confirm Reading A` box ticked in the agenda.
   `node scripts/check-lawyer-agenda.mjs` and `bash scripts/ci-gates.sh` both exit 0. `LAW-07`
   unblocks.

## Where this fits

| Document | Audience | Enforced by |
|---|---|---|
| `.planning/LAWYER-AGENDA.md` | the lawyer — this is what gets answered | `G10`, `node scripts/check-lawyer-agenda.mjs` |
| `.planning/lawyer-decisions.json` | the gate — the machine-readable copy | `G10`, `node scripts/check-lawyer-agenda.mjs` |
| `GATES.md` section 8 | a human asking what the gate checks and why | — |
| `.planning/PLAN-STANDARD.md` section 3 | an executor that just hit a point of law and must stop | `G6`, `node scripts/check-plan-closed-world.mjs` |
| This document | whoever is holding a correction and needs the next step | procedure, not a gate |

`EXT-06` in Phase 15 covers adding a **brand-new** legal rule — article → vector → implementation →
gate. This document covers **correcting an existing one**. They are different procedures and should
not be conflated.
