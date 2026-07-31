# Plan Standard — closed-world plans and the BLOCKED report

Every `.planning/phases/*/*-PLAN.md` in this project must satisfy this standard. The standard is
enforced by `node scripts/check-plan-closed-world.mjs`, which runs as gate **G6**. Each rule below
names the exact marker string the lint prints when the rule breaks, so a failure says which rule was
violated rather than that "the lint failed".

## 1. What closed-world means

PROJECT.md fixes the executor constraint: implementation is delegated to a deliberately cheap model
whose only job is to follow plans. Such a model does not stop and ask when a plan leaves something
open — it fills the hole. In this codebase, filling the hole means an invented reading of the Civil
Code, an invented money unit, or an invented naming convention, and each of those produces a number
a lawyer could file. A closed-world plan therefore **names every decision the executing agent
needs**, so that following the plan requires no judgment beyond reading it.

Three categories may never be left open in a plan:

1. **A legal judgment.** No plan may ask the executor to decide, interpret, or choose a reading of
   Philippine law. Contested readings go to the lawyer review agenda (section 3), never to the
   executor.
2. **A design or naming choice.** File names, function names, exit codes, markers, thresholds,
   schemas, and directory layout are decided in the plan, not discovered during execution.
3. **A value the executor would otherwise guess.** Command strings, paths, counts, dates, floors,
   and limits are written down literally. "Set a sensible timeout" is not a plan; "set the timeout
   to 30 seconds" is.

A plan that fails any rule in section 2 is not merely untidy — it is a plan that will produce
invented decisions when executed by the model this project actually uses.

## 2. The rules

1. **Frontmatter completeness** — marker `MISSING FRONTMATTER KEY`.
   The frontmatter must contain all of `phase`, `plan`, `wave`, `depends_on`, `files_modified`,
   `autonomous`, `requirements`, `must_haves`, and `must_haves` must contain a `truths:` entry.
   Rationale: these keys are what wave scheduling, requirement traceability, and file-conflict
   detection read; a plan missing them cannot be scheduled or verified.

2. **Requirement grounding** — marker `UNKNOWN REQUIREMENT`.
   Every id in `requirements` must appear in `.planning/REQUIREMENTS.md`.
   Rationale: a plan claiming an id that does not exist reports coverage it cannot deliver, which is
   exactly the false-completion failure LOOP-04 exists to prevent.

3. **Dependency grounding** — marker `BROKEN DEPENDENCY`.
   Every id in `depends_on` must resolve to an existing `*-PLAN.md` in the same phase directory.
   Rationale: an unresolvable dependency silently degrades into "no dependency", so a plan runs in
   the wrong wave against artifacts that do not exist yet.

4. **Section completeness** — marker `MISSING SECTION`.
   The plan must contain `<objective>`, `<constraints>`, `<tasks>`, `<verification>`, and
   `<success_criteria>`.
   Rationale: without `<verification>` and `<success_criteria>` there is no definition of done, and
   an executor's own claim of completion becomes the only evidence.

5. **Task completeness** — marker `INCOMPLETE TASK`.
   Every `<task>` must have a non-empty `<read_first>`, `<action>`, `<verify>`,
   `<acceptance_criteria>`, and `<done>`.
   Rationale: `<read_first>` establishes ground truth before editing, and `<verify>` plus
   `<acceptance_criteria>` are what turn "I did it" into "here is the command output".

6. **Acceptance depth** — marker `THIN ACCEPTANCE`.
   Every `<acceptance_criteria>` block must contain at least two bullet lines.
   Rationale: a single criterion is almost always a restatement of the task title; two or more force
   the plan to say what observable state distinguishes done from not done.

7. **No open-world prose** — marker `OPEN WORLD PHRASE`.
   No hedge phrase from the fixed list below may appear in plan prose. The list lives as a top-level
   `const` array in `scripts/check-plan-closed-world.mjs` so it is auditable in one place:

   ```text
   as appropriate
   if needed
   if necessary
   use your judgment
   use your best judgment
   best judgment
   you decide
   as you see fit
   choose an appropriate
   choose the best
   some reasonable
   the reasonable reading
   figure out
   something like
   as desired
   or similar
   whatever makes sense
   TBD
   TODO
   ???
   ```

   `TBD`, `TODO` and `???` match case-sensitively with word boundaries; the rest match
   case-insensitively. Rationale: each of these phrases delegates a decision to the executor, which
   is the exact thing a closed-world plan must not do. There is **no waiver mechanism** — the fix is
   to state the condition concretely, which is the requirement itself.

8. **No legal judgment** — marker `LEGAL JUDGMENT IN PLAN`.
   No phrase asking the executor to decide, interpret, or choose a reading of law may appear in plan
   prose. The list lives as a second top-level `const` array in the lint:

   ```text
   decide whether art
   interpret art
   the correct legal reading
   pick the reading
   choose the reading
   decide the legal
   determine the correct interpretation
   ```

   Rationale: PROJECT.md forbids any agent from deciding a contested point of Philippine law. This
   rule makes the prohibition visible at plan-authoring time rather than at execution time.

9. **Lawyer-blocked grounding** — marker `UNGROUNDED LEGAL FIX`.
   A plan whose `requirements` include `LAW-06`, `LAW-07`, or `LAW-12` must cite the corresponding
   recorded decision:

   | Requirement | Must cite | Question |
   |---|---|---|
   | `LAW-06` | `LAWYER-06` | Donation *inter vivos* exceeding the estate |
   | `LAW-07` | `LAWYER-04` | Art. 992's iron curtain in the collateral line |
   | `LAW-12` | `LAWYER-08` | The RA 11642 adoption regime |

   These three mappings are taken from ROADMAP.md Phase 14 and `.planning/REQUIREMENTS.md`; they are
   a transcription, not a new judgment. Rationale: these three fixes are hard-blocked on a lawyer's
   answer, and a plan that implements one without citing the answer is guessing at law.

### Scanning region for prose rules

Rules 7 and 8 scan **prose only**. Fenced code blocks (delimited by three backticks) are removed
entirely, and inline code spans (delimited by single backticks) are replaced by a space, before the
phrase lists are applied. Structural rules 1 through 6 and rule 9 scan the raw text.

This is not a loophole. Fenced and inline code is literal data — commands, JSON, grep patterns —
where a hedge word is inert rather than an instruction. It is also necessary: this very file has to
write the blacklist down, and Phase 1's plans legitimately quote prohibited tokens such as `.skip`
and `.todo` inside backticks in order to prohibit them. `scripts/fixtures/plan-fenced.md` is a
committed regression fixture that must exit 0, so a later refactor that starts scanning code blocks
turns the gate red immediately.

## 3. The BLOCKED report

### The three triggers

An executor reports **BLOCKED** — it does not proceed — in exactly these situations:

1. **A gate cannot run at all.** `scripts/ci-gates.sh` signals this with **exit code 2** and the
   marker `GATE CANNOT RUN`, which is deliberately distinct from exit code 1 ("a gate ran and
   failed"). A missing toolchain, a false precondition, a command exiting 127, or an unparseable
   `gates.manifest.json` are all cannot-run, not failure.
2. **A decision the plan does not contain.** If executing a task requires a choice the plan did not
   already make, the plan is not closed-world and the correct output is a report, not a choice.
3. **Any point of Philippine law.** Without exception, and regardless of how clear the answer looks.

### What the executor does

Stop at that task. Make no further edits. Do not proceed to later tasks, do not mark the plan
complete, and do not edit a gate, a test, an assertion, `gates.manifest.json`, or
`gates.manifest.lock` to make the halt go away. Weakening a check to clear a blocker converts a loud
failure into a silent wrong answer, which is the one tradeoff this project never accepts.

### The report shape

```text
BLOCKED
Requirement: <the requirement id this task was serving, e.g. LOOP-03>
Task: <plan id and task name, e.g. 02-04 Task 3: register the meta-gates>
What was attempted: <the concrete action, in one or two sentences>
Real command output:
<pasted, verbatim, unedited command output — never a paraphrase or a summary>
```

The `Real command output:` field holds pasted output. A paraphrase ("the tests failed") is not a
BLOCKED report, because the whole purpose of the field is that a reader can tell a product failure
from an environment failure without re-running anything.

### Where a legal question goes

A point of law is appended to `.planning/LAWYER-AGENDA.md`. If that file does not exist, create it
with the single heading line `# Lawyer Review Agenda` and append below it. Phase 4 owns that file's
full structure — an append made here is a placeholder that the Phase 4 pass absorbs, so match its
format if it already exists and do not restructure it.

### The prohibition

Guessing is prohibited. Picking whichever reading looks defensible is prohibited. Silently choosing
the option that makes the build green is prohibited. Report BLOCKED instead. A blocked plan that
reports honestly is a better outcome than a completed plan that invented an answer.

---

The lint enforcing sections 1 and 2 is `node scripts/check-plan-closed-world.mjs`, registered as
gate **G6** in `gates.manifest.json`.
