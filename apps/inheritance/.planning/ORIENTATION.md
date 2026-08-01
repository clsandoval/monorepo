# Start here

This page answers three questions — where am I, what is verified, what is next — by naming the file
that holds each answer. It deliberately restates no fact that lives elsewhere, because a page that
restates facts goes stale the moment the facts move, and this one is written to survive that.
`node scripts/check-planning-truth.mjs` fails the build when any pointer on this page stops
resolving, or when the one count it does carry drifts from the gate manifest.

## Where am I

`.planning/STATE.md` — the current position. Its frontmatter carries the phase and plan counters; its
body carries a phase-by-phase narrative record, newest first. Read the `Phase:` line first.

`.planning/ROADMAP.md` — the full phase list, the per-phase goal, requirements and success criteria,
and a Progress table whose counts are re-derived from the filesystem by the check named above.

`.planning/phases/<N>-*/` — the per-plan record for one phase: a `RESEARCH.md`, a `VALIDATION.md`, one
`PLAN.md` per plan and one `SUMMARY.md` per executed plan. A plan with no summary has not run.

## What is verified

`gate-results.json` — the machine-readable per-gate result of the last full run: id, command, exit
code, duration. This is the file to read when you want to know what actually ran.

`LOOP-STATUS.md` — the last run's outcome in prose, including whether the loop is stalled.

`GATES.md` — one numbered section per gate explaining what it checks and why that check exists. Read
this before touching any gate.

`gates.manifest.json` — the frozen gate set itself, paired with a lock file that may only grow.
The gate set holds 34 gates.

Run the whole suite with `bash scripts/ci-gates.sh` from the monorepo root.

## What is next

`.planning/REQUIREMENTS.md` — every requirement, its owning phase, and whether it is closed.

`.planning/BLOCKED-REQUIREMENTS.md` — the requirements no agent may implement, each quoting the exact
question awaiting the lawyer's answer. Nothing here is a decision anyone may take on the lawyer's
behalf.

`.planning/DOC-DEBT.md` — documentation claims the code contradicts that were accepted as debt rather
than fixed, each with an owning requirement or an explicit statement that none exists. Shrink-only.

`engine/BUGS.md` — open product defects, each with a reproduction. A bug with no reproduction is not a
bug report.

## The four documents that tell an agent what it may not do

`CLAUDE.md` — the invariants an implementing agent must not violate, each naming the command that
enforces it.

`.planning/PLAN-STANDARD.md` — what a closed-world plan must contain, and the exact shape of a BLOCKED
report. Section 3 is the one to read when you are stuck.

`.planning/LEGAL-CORRECTION-WORKFLOW.md` — the only route by which a lawyer's correction to an
existing legal rule becomes a change in the code.

`.planning/NEW-LEGAL-RULE.md` — the only route by which a rule the engine does not yet implement
becomes code: article, vector, failing run, one-site implementation, registration.
