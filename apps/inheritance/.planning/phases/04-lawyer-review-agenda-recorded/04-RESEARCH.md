# Phase 4 Research — Lawyer Review Agenda Recorded

**Phase goal (ROADMAP):** the eight interpretive choices the engine has already made are written
down as recorded decisions the lawyer can confirm or overturn — sent out now, since the lawyer is
sitting the bar exam and may be unreachable for weeks, so the unblocked engineering work in
Phases 5–13 is never waiting on an answer that has not arrived.

**Requirements:** LAWYER-01 … LAWYER-10.

Every file path, line number, and grep count in this document was measured in this working tree on
2026-07-31. Nothing here is inferred from the audit alone; where a number came from
`.planning/research/LEGAL-CONFORMANCE.md` it was re-resolved against the current source.

---

## 0. What this phase is, and what it is not

This phase writes documents, one JSON registry, one gate script, and nine one-line comment markers.

It **does not**:

- change any engine computation, any legitime fraction, any scenario code, or any peso figure;
- answer any of the eight questions;
- implement Art. 992, RA 11642 Sec. 41, or the donation-excess data model — those are LAW-07,
  LAW-12 and LAW-06 in Phase 14, and each is hard-blocked on an answer this phase only *asks for*;
- touch `frontend/test-baseline.json`, `gate-skips.lock`, or any existing gate's locked command.

The one thing that makes this phase load-bearing rather than clerical: **`.planning/PLAN-STANDARD.md`
section 3 already routes every future legal question to `.planning/LAWYER-AGENDA.md`, and that file
does not exist.** Phase 2 deliberately shipped the BLOCKED protocol with a dangling reference and
recorded in STATE.md that Phase 4 owns the file's structure. Until this phase runs, an executor that
hits a point of law has been told to append to a file whose format nobody has defined.

---

## 1. Measured starting state

### 1.1 The source material already exists and is complete

`.planning/research/LEGAL-CONFORMANCE.md` section 3 (lines 81–132) contains all eight questions in a
uniform shape: a title line, `Reading A`, `Reading B`, `Engine implements:`, and `What I need:`.
Every article citation is a live reference-style markdown link into the link table at lines 209–222.

This matters more than it looks. The agenda is a **restructuring of an existing, already-verified
document**, not a re-derivation. No task in this phase has to state what Art. 996 says, decide which
reading is better, or find a citation. Copying is the whole job, and copying is exactly what a cheap
executor does reliably.

Measured: section 3 spans lines 81–132, contains the eight bold question headers `**Q1.` … `**Q8.`,
and the four labels `Reading A`, `Reading B`, `Engine implements:` and `**What I need:**` appear in
every one of the eight blocks.

### 1.2 `.planning/LAWYER-AGENDA.md` does not exist

```
$ ls .planning/
codebase  config.json  phases  PLAN-STANDARD.md  PROJECT.md  REQUIREMENTS.md  research  ROADMAP.md  STATE.md
```

No `LAWYER-AGENDA.md`, no decision registry, no correction workflow. `PLAN-STANDARD.md:180-183`
already says where a legal question goes and instructs an executor to create the file with a single
heading if it is absent — a placeholder that "the Phase 4 pass absorbs".

### 1.3 The nine anchor sites, re-resolved against current source

`LEGAL-CONFORMANCE.md` cites line numbers from 2026-07-27. Phases 1–3 did not modify `engine/src/`,
but line numbers still drifted slightly between the audit's ranges and today's file, so each anchor
below is recorded as **file + a literal grep pattern**, with the line number as of 2026-07-31 given
only for a human reader. A grep pattern survives an edit above it; a line number does not.

| Decision | File | Grep pattern (stable anchor) | Line today |
|---|---|---|---|
| LAWYER-01 (Q1, Art. 996 vs testate table) | `engine/src/step7_distribute.rs` | `I2: n LC + Spouse (Art. 996) — spouse = one child-line's share.` | 555 |
| LAWYER-02 (Q2, spouse legitime ¼ vs ½) | `engine/src/step5_legitimes.rs` | `1 LC + Spouse (Arts. 888, 892 ¶1): LC = E/2, Spouse = E/4` | 254 |
| LAWYER-03 (Q3, Art. 1006 ratio under per-capita nephews) | `engine/src/step7_distribute.rs` | `Branch 3: Nephews/nieces only — per capita (Art. 975)` | 944 |
| LAWYER-04 (Q4, *Aquino* reach into the collateral line) | `engine/src/step1_classify.rs` | `pub fn check_eligibility` | 176 |
| LAWYER-05 (Q5, Art. 907 self-executing vs a claim) | `engine/src/step6_validation.rs` | `pub fn reduce_inofficious` | 562 |
| LAWYER-06 (Q6, donation excess as pesos vs a claim) | `engine/src/step4_estate_base.rs` | `pub fn step4_compute_estate_base` | 75 |
| LAWYER-06 (Q6, second site) | `engine/src/step8_collation.rs` | `pub fn step8_collation_adjustment` | 106 |
| LAWYER-07 (Q7, conjugal family home) | `frontend/src/lib/estate-tax-engine/special-deductions.ts` | `familyHome.ownershipType === 'conjugal'` | 71 |
| LAWYER-08 (Q8, RA 11642 Sec. 41 retroactivity) | `engine/src/types.rs` | `pub retroactive_ra_11642: bool` | 346 |

Each pattern was confirmed to match **exactly once** in its file by `grep -Fc` on 2026-07-31. Two
shorter candidate patterns were rejected during that measurement because they matched twice:
`I2: n LC + Spouse (Art. 996)` also matches a test comment at line 1289, and `"Art. 892 ¶1".into()`
also matches the T4 arm at line 286. Uniqueness is not cosmetic — the gate in section 5 treats a
pattern matching zero times **or** more than once as a broken anchor, because an ambiguous anchor
does not identify a rule.

Two of these deserve a note:

- **LAWYER-04's anchor is a function where the rule is absent.** There is no Art. 992 code to mark:
  `grep -rn "992" engine/src/` returns two comment lines and no logic. `check_eligibility` is the
  §4.3 eligibility gate — the function that already excludes on filiation, rescinded adoption, the
  guilty spouse in legal separation, and unworthiness. It is where a barrier would be added, so a
  marker there is what an agent implementing LAW-07 will actually see.
- **LAWYER-06 gets two anchors** because the collated base is computed in one file
  (`step4_estate_base.rs`) and imputed in another (`step8_collation.rs`), and an agent could land in
  either. The registry format therefore has to allow an array of anchors, not a single one.

### 1.4 The Q7 spec hedge is a single line

```
specs/estate-tax-engine-spec.md:1008:
// Note: Some commentary uses full FMV for conjugal; this engine implements the NIRC text (½ for conjugal)
```

It sits inside a fenced pseudocode block, immediately below the `min(fmv * 0.5, cap)` branch at
line 1004. LAWYER-07 in `REQUIREMENTS.md:119` reads "The conjugal family-home deduction reading is
recorded **and the spec hedge removed**." Section 4 below records how that is done without deciding
the point of law.

### 1.5 The gate infrastructure a new gate must fit into

Nine gates exist. Three facts constrain any tenth:

1. **`gates.manifest.lock` freezes `{id, command, blocking}` and may only grow.** A new gate is
   added by appending to `gates.manifest.json` **and** `gates.manifest.lock` in the same edit;
   `scripts/check-gate-manifest.mjs` rejects a manifest gate absent from the lock with
   `UNLOCKED GATE`. `order`, `name`, `proves` and `requirements` are deliberately **not** locked, so
   renumbering `order` is legal and is not weakening.

2. **`order` and `id` are already decoupled.** The current manifest runs G5, G6, G7 at orders 1, 2, 3
   and G1 at order 4. `scripts/ci-gates.sh:260` sorts by `order`; nothing requires `Gn` to run nth.

3. **Two existing gates are position-sensitive, and this is the finding that determines where the new
   gate goes.**

   - `scripts/check-gate-skips.mjs` (G8, order 8) exempts every gate whose `order >= 8` from its
     log checks, because those logs are still being written while it runs.
   - `scripts/check-gate-results.mjs` (G9, order 9) fails with `RESULTS INCOMPLETE` when **any gate
     other than G9 itself** is `not-run` in `gate-results.json`. `scripts/ci-gates.sh:392-393`
     republishes after every gate, so at the moment G9 runs, every gate ordered *after* G9 is
     `not-run`.

   **Consequence: a new gate placed at `order: 10` would fail G9 on every run.** This is not a
   hypothetical — it is the mechanical reading of check 4 in `check-gate-results.mjs` combined with
   the publish-after-every-gate loop. G9 must stay last.

   The placement chosen in section 5: new gate `G10` at **`order: 8`**, `G8` moved to `order: 9`,
   `G9` moved to `order: 10`. That is one `order` field changed on each of two locked-but-unlocked-
   for-order gates, and it buys a strictly stronger property — the new gate runs *before* the skip
   accounting gate, so its own `GATE-SKIPS` line is checked rather than exempted.

4. **Every gate script must print `GATE-SKIPS total=<n> skipped=<n>` on every exit path.** G8 fails
   with `SKIP REPORT MISSING` on a log that lacks the line, and with `SKIP COUNT MISMATCH` when an
   emitted `skipped=<n>` disagrees with the collectable skip ids (which, for an emitted-source gate,
   is always zero). The new gate therefore emits `skipped=0` on success and on failure.

---

## 2. Design decision: three artifacts, each with one job

A single markdown file cannot satisfy all four success criteria. Criterion 1 wants prose a lawyer
reads in one sitting; criterion 2 wants something a machine can check; criterion 4 wants an internal
procedure. Merging them produces a document that is worse at all three.

| Artifact | Audience | Serves |
|---|---|---|
| `.planning/LAWYER-AGENDA.md` | the lawyer | LAWYER-01…08, criteria 1 and 3 |
| `.planning/lawyer-decisions.json` | agents and the gate | LAWYER-09, criterion 2 |
| `.planning/LEGAL-CORRECTION-WORKFLOW.md` | the owner and future executors | LAWYER-10, criterion 4 |

The agenda is what gets *sent*. The registry is what gets *checked*. The workflow is what happens
*after* an answer arrives. Keeping them separate is also what lets the gate compare two of them
against each other — a single file cannot disagree with itself.

---

## 3. Design decision: the registry is anchored by pattern, and the anchors are bidirectional

LAWYER-09 reads: "A recorded decision is machine-readable and linked from the rule it governs, so no
agent re-decides it." Two properties are needed, and they pull in opposite directions.

**Machine-readable** means JSON with a fixed schema. **Linked from the rule it governs** means an
agent editing `step7_distribute.rs` sees the decision without knowing the registry exists. So the
link is built twice:

- registry → code: each decision carries `anchors: [{file, pattern}]`;
- code → registry: each anchor site carries a one-line comment
  `LAWYER-DECISION: LAWYER-0N — see .planning/LAWYER-AGENDA.md`.

The gate verifies **both** directions. `DECISION ANCHOR BROKEN` fires when a registry pattern no
longer matches its file; `DECISION MARKER MISSING` fires when the anchor site has lost its comment.
Either failure means the link rotted, and rot is the specific way a recorded decision quietly stops
governing anything.

**Why patterns rather than line numbers.** Phase 5 rewrites `step10_finalize.rs`, Phase 7 rewrites
`step2_lines.rs`, Phase 8 rewrites `step7_distribute.rs`. Every one of those shifts line numbers in
files this registry points at. A line-number anchor would go stale on the first legitimate edit and
either fail spuriously or, worse, silently point at the wrong code. A grep pattern anchored on a
function signature or a cited article string survives any edit that does not remove the rule itself
— and if the rule *is* removed, a red gate is the correct outcome.

**Marker placement in Rust does shift line numbers.** Adding nine comment lines moves everything
below them down by one. This is accepted rather than avoided: no plan for Phases 5–15 exists yet, so
none of them has yet recorded a line number that this would invalidate, and `LEGAL-CONFORMANCE.md`'s
own citations always name a file and a function alongside the line. The plans record the shift in
their summaries.

---

## 4. Design decision: the Q7 spec hedge is replaced by a pointer, not deleted into an assertion

This is the one place in the phase where a careless edit becomes a decided point of law.

`specs/estate-tax-engine-spec.md:1008` currently says commentary is divided and the engine follows
one side. Three candidate edits:

| Edit | Effect | Verdict |
|---|---|---|
| Delete the line | The spec now asserts the ½ rule with no qualification | **Prohibited.** Deleting the record of a live disagreement is an unrecorded ruling on it |
| Rewrite it to state Reading A is correct | Same, but explicit | **Prohibited.** That is an agent deciding a contested point of Philippine law |
| Replace it with a pointer to the recorded decision | The invitation to a future agent to silently flip the implementation is gone; the disagreement is now *recorded* rather than *loose* | **Chosen** |

The replacement line names the decision id, the engine's implemented reading, the governing
authority already cited in the agenda entry (RR 12-2018 §7.2.3), the status `awaiting-answer`, and
the instruction that the implementation must not change without a recorded answer.

This satisfies "the spec hedge removed" on the reading that matters: the hedge is an **open-world
phrase in a specification** — precisely the class of prose `.planning/PLAN-STANDARD.md` rule 7
exists to eliminate. What replaces it is closed-world. What it says about the law is unchanged, so
no law was decided.

---

## 5. Design decision: the new gate is G10 at order 8, and it checks agreement, never correctness

`scripts/check-lawyer-agenda.mjs`, registered as gate **G10**.

**What it can check:** that all eight decisions exist in both files, that they agree, that every
required field is present, that every anchor still resolves, that every marker is still in place, and
that no status was advanced without an answer attached.

**What it must never check:** whether an answer is legally right. That is not a thing a script can
know, and a gate that appeared to bless a legal reading would be worse than no gate.

**Seven verdicts, each with its own literal marker:**

| Marker | Fires when |
|---|---|
| `AGENDA ENTRY MISSING` | a `LAWYER-0N` id for N in 1…8 has no registry entry, or no `## LAWYER-0N` section in the agenda |
| `DECISION FIELD MISSING` | a registry entry lacks one of the required keys |
| `DECISION STATUS INVALID` | `status` is outside `awaiting-answer`, `confirmed`, `changed`; or a status other than `awaiting-answer` carries no `answered_by`, `answered_on` and `answer` |
| `DECISION ANCHOR BROKEN` | an anchor's `file` does not exist, or its `pattern` matches that file zero times or more than once |
| `DECISION MARKER MISSING` | an anchor's file lacks the `LAWYER-DECISION: <id>` marker |
| `AGENDA DRIFT` | the agenda and the registry disagree on the id set, on `reading_implemented`, or on `status` |
| `AGENDA SCAN UNREADABLE` | an input is missing or unparseable — never exit 0 on an internal error |

`DECISION STATUS INVALID` is the load-bearing one. It is what stops an agent from writing
`"status": "confirmed"` to unblock itself. Confirming requires producing an `answered_by`, an
`answered_on` and an `answer` — three fields an agent cannot fabricate without lying in a way a
human reviewing the diff sees immediately.

**No write flags.** Consistent with every other check in this project: no `--fix`, `--update`,
`--accept`, `--regenerate`, or waiver flag. The two flags are `--registry` and `--agenda`, both
read-only path overrides that exist so fixtures can drive the failure paths.

Anchor `file` values always resolve against the app directory and are never overridable. That is
deliberate and it is what keeps the fixture set small: a fixture registry can point an anchor at a
committed fixture source file, so `DECISION ANCHOR BROKEN` and `DECISION MARKER MISSING` are both
driven through `--registry` alone, with no fixture tree of mirrored source files to maintain.

---

## 6. Design decision: the correction workflow is five fixed steps, and step 1 is "do not fix it yet"

LAWYER-10 asks for a workflow turning a lawyer's "this is wrong" into a named test vector, a failing
gate, and a fix. The steps are fixed rather than discovered:

1. **Record the claim** as a new numbered entry in `.planning/LAWYER-AGENDA.md`, with the lawyer's
   words quoted rather than paraphrased. No code changes at this step.
2. **Name a test vector** — `TV-L<NN>` — and write it as a failing test citing the governing article
   in its name. A correction with no vector is an opinion; a correction with a vector is a
   regression test.
3. **Watch it fail.** A vector that passes before the fix is testing the wrong thing.
4. **Fix**, in exactly one place. `EXT-02` forbids a second implementation of a legal rule.
5. **Close the loop**: set the registry entry's `status` and the three answer fields, run the gate
   set, and record the vector id in the registry's `vectors` array.

The reason step 2 precedes step 4 and not the reverse: this project's governing principle is that
silent wrongness is worse than loud failure. A fix without a vector is a silent change to a legal
number.

---

## 7. Wave plan and why it is ordered this way

Five plans, five waves, strictly sequential. The sequencing is forced by file ownership, not chosen
for tidiness.

| Wave | Plan | Produces | Blocked by |
|---|---|---|---|
| 1 | `04-01` | `LAWYER-AGENDA.md` skeleton + entries Q1–Q4 | — |
| 2 | `04-02` | entries Q5–Q8 appended to the same file | 04-01 writes the file 04-02 appends to |
| 3 | `04-03` | `lawyer-decisions.json` + nine code/spec markers | the registry mirrors agenda entries that must already exist |
| 4 | `04-04` | `check-lawyer-agenda.mjs`, fixtures, gate G10, docs | the gate has nothing to check until 04-03 lands |
| 5 | `04-05` | `LEGAL-CORRECTION-WORKFLOW.md`, `PLAN-STANDARD.md` §3 update | the workflow cites the gate registered in 04-04 |

Waves 1 and 2 share one file. Waves 4 and 5 both touch `README.md`. Neither pair can be parallel.

---

## 8. Implementation constraints inherited from Phases 1–3

Carried forward unchanged and repeated in every plan's `<constraints>` block:

1. All work happens under `apps/inheritance`. Commits stage explicit paths via
   `bash scripts/safe-commit.sh`; `git add -A`, `git add .` and `git commit -a` are prohibited.
2. No test, assertion, or gate may be weakened to pass. A gate that cannot legitimately pass is
   reported BLOCKED with the real pasted command output, per `PLAN-STANDARD.md` section 3.
3. No locked gate `command` string may change. G10 is added by appending to `gates.manifest.json`
   **and** `gates.manifest.lock` together.
4. No check may rewrite its own input — no `--fix`, `--update`, `--accept`, `--regenerate`, waiver
   flag, or any other write path.
5. Every failure path of every check must be observed firing against a committed fixture.
6. Every new check is dependency-free Node ESM using only `node:` builtins.
7. `frontend/test-baseline.json` and `gate-skips.lock` are not touched. Both are other phases'
   shrink-only ledgers.
8. No point of Philippine law may be decided. The eight questions are *recorded*, never *answered*,
   by any plan in this phase.

---

## 9. Validation Architecture

**Feedback loop.** Every artifact in this phase is a file in the repo, so every check is static and
runs in under four seconds with no database, no Docker, and no network. This is the fastest-sampling
phase in the project.

**Sampling points.**

- After each task: that task's `<verify>` block.
- After each plan: the plan's full `<verification>` checklist, including every fixture-driven
  failure path.
- After waves 3, 4 and 5: `bash scripts/ci-gates.sh`, because those waves touch the engine, the
  manifest, and the plan corpus that gate G6 lints.
- Before phase sign-off: `bash scripts/ci-gates.sh` exits 0 with `ALL GATES PASSED (10/10)`.

**What must not be mistaken for coverage.**

1. **No plan in this phase verifies that an answer is legally correct.** The gate verifies structural
   agreement and anchor liveness. Legal correctness arrives only with the lawyer's reply.
2. **No plan verifies that the agenda was actually delivered to the lawyer.** Sending is an owner
   action outside the repo. The phase's deliverable is that the agenda is *ready to send* and
   answerable in one sitting.
3. **The GitHub workflow has still never executed** (carried forward from Phases 1 and 3). Every CI
   claim is verified by running locally the exact script CI runs.

**Nyquist floor.** Twenty-three per-task checks across five plans, with no three consecutive tasks
lacking an automated `<verify>`. The full map is `04-VALIDATION.md`.

---

## 10. Points of Philippine law arising in this phase

Eight, and all eight are the subject matter rather than a blocker: they are recorded, not decided.
No plan asks an executor to choose between Reading A and Reading B, and the closed-world lint's
rule 8 (`LEGAL JUDGMENT IN PLAN`) is what mechanically enforces that at plan-authoring time.

One near-miss is worth naming, because it is the trap in this phase: **the Q7 spec hedge**. Deleting
that line is a one-character-easier edit than replacing it, and deleting it silently converts a
recorded disagreement into an asserted rule. Section 4 records the chosen edit, and plan `04-03`
states the replacement text literally so the executor copies rather than composes it.

Nothing else in this phase can produce a peso figure, and nothing added to
`.planning/LAWYER-AGENDA.md` by this phase is an answer.
