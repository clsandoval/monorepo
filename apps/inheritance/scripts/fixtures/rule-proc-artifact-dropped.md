# Adding a new legal rule

This is the single procedure by which a rule the engine does **not yet implement** becomes code:
article → vector → failing run → one-site implementation → registration. No other path exists. A
legal rule added outside this procedure is a new peso figure that no test names and no registry
knows about, and a silent wrong number is the exact failure this project ranks as worse than any
loud one.

`.planning/LEGAL-CORRECTION-WORKFLOW.md` is the neighbouring procedure, for **correcting a rule that
already exists** after a lawyer says an output is wrong. The two are not interchangeable. Correcting
an existing rule starts from the lawyer's words; adding a new rule starts from a spec section that
already states the article. If you are holding a lawyer's correction, you are in the other document.

`node scripts/check-new-rule-procedure.mjs` holds this document to the tree. It checks that the five
steps below are present and in order, that every artifact they name is still named, and that the
worked example at the bottom still resolves against `engine/legal-rules.json` and the real engine
source on every run. A procedure nobody runs decays; this one goes red instead.

## The five steps

The order is fixed, not discovered. The vector comes **before** the implementation, because an
implementation with no vector is a silent change to a legal number.

## Step 1 — Find the article in a spec, or stop

Locate the article the new rule implements in `specs/inheritance-engine-spec.md` or
`specs/estate-tax-engine-spec.md`, and record the section that states it. That spec sentence — not
your reading of the Civil Code, not a summary of a case — is the authority the implementation
answers to.

**The authority boundary.** If the article is **not** already stated in
`specs/inheritance-engine-spec.md` or `specs/estate-tax-engine-spec.md`, then writing that statement
is deciding a point of Philippine law. `.planning/PLAN-STANDARD.md` section 3 prohibits that without
exception, and regardless of how clear the answer looks. The correct output is **not** a spec edit.
It is:

1. A **BLOCKED** report in the shape `.planning/PLAN-STANDARD.md` section 3 fixes, naming the
   requirement and the task and pasting real command output.
2. A new `LAWYER-<NN>` entry appended to `.planning/LAWYER-AGENDA.md` using that file's own
   `## Entry format` eight-heading structure, taking the next free id.
3. A matching object added to `.planning/lawyer-decisions.json` using the fourteen-key schema the
   existing entries follow.

Gate `G10`, `node scripts/check-lawyer-agenda.mjs`, fails the build when those two files disagree,
so appending to one without the other is caught rather than silently accepted. Stop there. Do not
proceed to Step 2 on an article no spec states.

*Artifact produced:* a spec section citation, or a BLOCKED report plus a new `LAWYER-<NN>` entry.

## Step 2 — Name the vector and mark it

Every new rule gets exactly one test vector id, allocated in order and **never reused**:

- **`TV-<NN>`** when the rule traces to a vector the spec already numbers. The test function is named
  `test_tvNN_<description>`, matching the existing `TV-01` … `TV-23` series in
  `engine/tests/integration.rs`.
- **`TV-L<NN>`** when the rule is lawyer-driven, per `.planning/LEGAL-CORRECTION-WORKFLOW.md` step 2.
  The `L` distinguishes it from the spec series, and the function name contains both the vector id
  and the governing article.

Write the test function and give it a `// LEGAL-VECTOR: Art. NNN` comment line inside the function
body. That marker is what makes the rule traceable: `scripts/check-legal-traceability.mjs` (gate
`G28`) indexes every marker in `engine/src` and `engine/tests`, attributes it to the nearest
preceding `fn` line, and raises `MARKER NOT UNIQUE` if one article's marker appears at more than one
site. One article, one marker, one vector.

The rule: **a legal rule with no vector is an opinion; a legal rule with a vector is a regression
test.**

*Artifact produced:* a `TV-<NN>` or `TV-L<NN>` id, a test function carrying it, and a
`// LEGAL-VECTOR: Art. NNN` marker line.

## Step 3 — Watch it fail

Run the vector **before writing any implementation**:

```bash
cd engine && cargo test <function name>
```

Paste the failing output verbatim into the plan or summary carrying the change. Verbatim, not
paraphrased — the whole purpose of the pasted block is that a reader can tell a product failure from
an environment failure without re-running anything.

If the vector **passes** before the implementation exists, it is testing something else. The response
is to rewrite the vector until it fails for the right reason. It is never to proceed: a vector that
was green before the fix cannot prove the fix did anything.

*Artifact produced:* pasted failing output from `cd engine && cargo test <function name>`.

## Step 4 — Implement at exactly one site

Land the rule in **exactly one place**. A second implementation is a defect, not a convenience: two
copies drift, and the copy that drifts is the one nobody is testing. If the rule appears to need two
sites, that is a signal the shared part belongs in one function both call, not a licence to write it
twice.

No existing test or assertion may be weakened, skipped, widened or deleted to accommodate the new
rule. If an existing test now fails, either the new rule is wrong or the old test encoded a defect —
and deciding which of those it is, when the answer turns on a reading of the Civil Code, is a point
of law and therefore a **BLOCKED** report per `.planning/PLAN-STANDARD.md` section 3.

Run `cd engine && cargo test` and confirm the vector from Step 3 is now green with no other test
turning red.

*Artifact produced:* a one-site code change, with the vector from step 3 now passing.

## Step 5 — Register and close the loop

Append the object to `engine/legal-rules.json`'s `rules` array:

```json
{ "article": "Art. NNN", "vector": { "file": "tests/integration.rs", "fn": "test_tvNN_description" } }
```

`implemented_in` is **recomputed from source on every run** by
`node scripts/check-legal-traceability.mjs`, so hand-writing it fails rather than passes. Leave it to
the check.

If the article already appears in `the untraced ledger`'s `untraced_articles` array,
**delete that entry**. That ledger may only shrink, and landing a vector is exactly what forces it
down: the check raises `STALE UNTRACED DECLARATION` on an article that is declared untraced but has
since acquired a vector, and it stays red until the entry is gone. Appending to that ledger to turn a
red check green is prohibited.

Then both of these must exit 0:

```bash
node scripts/check-legal-traceability.mjs
bash scripts/ci-gates.sh
```

*Artifact produced:* a new object in `engine/legal-rules.json`, a shrunk
`the untraced ledger`, and gate G28 green.

## Worked example

This example is a rule that is **already implemented**. It is shown to make each step concrete, and
it takes no position on any point of law. Its three values are re-resolved against
`engine/legal-rules.json` and the engine source by `node scripts/check-new-rule-procedure.mjs` on
every gate run, so if the function is renamed, moved, or loses its marker, this document goes red
rather than quietly pointing at nothing.

**Article:** Art. 172
**Vector file:** src/step10_finalize.rs
**Vector function:** test_filiation_description_birth_certificate

Read as the five steps:

1. **Find it in a spec.** Art. 172 is a filiation-proof article the succession spec already states,
   so no lawyer entry was needed and Step 1 ends with a citation.
2. **Name the vector and mark it.** `test_filiation_description_birth_certificate` carries the line
   `// LEGAL-VECTOR: Art. 172`. That is the only site in `engine/src` and `engine/tests` where that
   article's marker appears — `MARKER NOT UNIQUE` would fire on a second one.
3. **Watch it fail.** `cd engine && cargo test test_filiation_description_birth_certificate` fails
   before `filiation_description` returns the article-citing string.
4. **Implement at one site.** `filiation_description` in `engine/src/step10_finalize.rs` is the one
   place the mapping lives; no other module reimplements it.
5. **Register.** `engine/legal-rules.json` holds
   `{"article": "Art. 172", "vector": {"file": "src/step10_finalize.rs", "fn": "test_filiation_description_birth_certificate"}}`,
   and `Art. 172` is absent from `the untraced ledger`, because it now has a vector.

## What an agent may never do

- Advance a decision's `status` in `.planning/lawyer-decisions.json` without an answer recorded from
  the lawyer.
- Change a rule anchored by a decision whose `status` is `awaiting-answer` — that is exactly the
  situation `LAW-06`, `LAW-07` and `LAW-12` are blocked on, and the correct output is BLOCKED.
- Delete, skip or weaken a test or an assertion to accommodate a legal change.
- Paraphrase the lawyer's words into the record.
- **Author a statement of law that no spec already contains.** Writing the rule down is the decision;
  it does not become an implementation detail because the code needed something to compile against.

## Where this fits

| Document | Covers | Enforced by |
|---|---|---|
| This document | adding a rule the engine does not yet implement | `G31`, `node scripts/check-new-rule-procedure.mjs` |
| `.planning/LEGAL-CORRECTION-WORKFLOW.md` | correcting a rule that already exists | procedure, not a gate |
| `.planning/LAWYER-AGENDA.md` | the questions the lawyer answers | `G10`, `node scripts/check-lawyer-agenda.mjs` |
| `.planning/PLAN-STANDARD.md` section 3 | an executor that just hit a point of law and must stop | `G6`, `node scripts/check-plan-closed-world.mjs` |
| `engine/legal-rules.json` | which article is proved by which named vector | `G28`, `node scripts/check-legal-traceability.mjs` |
