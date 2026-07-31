# Phase 2 Research — Loop Durability & Commit Discipline

**Researched:** 2026-07-31
**Phase:** 2 of 15
**Requirements:** LOOP-01, LOOP-02, LOOP-03, LOOP-04, LOOP-05, LOOP-06

---

## 0. What this phase is, and what it is not

This phase does not touch the product. It hardens the *execution loop* that will grind on
the product for the rest of 2026. The measurable failure modes it must close are the four
named in PROJECT.md's constraints:

| Failure mode | Requirement | Closed by |
|---|---|---|
| A plan hands the executor a decision it cannot make, so the executor invents one | LOOP-01 | A machine-checkable definition of "closed-world" plus a lint that fails the build |
| A gate cannot run, and the loop proceeds anyway or quietly redefines success | LOOP-02 | Distinct exit code 2 + a `GATE CANNOT RUN` marker + a documented BLOCKED report |
| The gate set silently shrinks and the smaller set reports green | LOOP-03, LOOP-04 | A frozen, growth-only gate manifest that *drives* the runner, plus coverage reporting |
| The concurrent auto-committer absorbs staged work, or a broad stage absorbs the auto-committer's | LOOP-05 | A safe-commit wrapper plus a history audit that fails on mixed commits |
| The loop grinds on a repeating failure for days and nobody notices | LOOP-06 | A committed status file with a stall banner, plus a bounded run history |

Every artifact in this phase is a *check that can fail loudly*. Per PROJECT.md, silent
wrongness is categorically worse than loud failure, and that ranking governs every design
choice below — including accepting some false positives from the closed-world lint.

---

## 1. Measured starting state

All figures below were measured on 2026-07-31, not assumed.

**Toolchain:** `node v20.19.5`, `npm 10.8.2`, `rustc/cargo 1.96.0`, TypeScript 5.9.3,
`wasm-pack 0.15.0`. Git root is `/home/clsandoval/cs/monorepo`; the app lives at
`apps/inheritance/`.

**Phase 1 artifacts that this phase builds on:**

| Path | What it is |
|---|---|
| `apps/inheritance/scripts/ci-gates.sh` | The single fail-closed runner. 113 lines. Four hardcoded gates, `--only <1-4>`, `set -euo pipefail`, preflight `require_tool` checks that currently `exit 1`. |
| `apps/inheritance/engine/build-wasm.sh` | Gate 2's implementation. Verifies existence, a 100 KB floor, and the `0061736d` magic number. |
| `apps/inheritance/frontend/scripts/check-test-baseline.mjs` | Gate 3's implementation. Dependency-free Node ESM, `node:` builtins only, no `--update` flag by design. |
| `apps/inheritance/frontend/test-baseline.json` | The 46-entry known-failure ledger. Shrink-only. |
| `.github/workflows/inheritance-ci.yml` | Invokes `bash apps/inheritance/scripts/ci-gates.sh` and nothing else. |
| `apps/inheritance/README.md` | Documents the four gates and already has a "Committing in this repo" section forbidding `git add -A`. |

**Phase 1 plan corpus** (the regression corpus for the LOOP-01 lint): four files at
`.planning/phases/01-gate-foundations-suites-execute-at-all/01-0{1,2,3,4}-PLAN.md`.
Measured structure — every one of them has exactly one each of `<objective>`,
`<constraints>`, `<tasks>`, `<verification>`, `<success_criteria>`, `<threat_model>`,
`<output>`; task counts are 4, 3, 4, 5; and **every** task carries all seven of `<name>`,
`<files>`, `<read_first>`, `<action>`, `<verify>`, `<acceptance_criteria>`, `<done>`.
Frontmatter keys are identical across all four: `phase, plan, type, wave, depends_on,
files_modified, autonomous, requirements, user_setup, must_haves`.

**Git history is currently clean.** Measured: over the range `bdee3c498..HEAD` (project
init to now), *every* commit that touches `apps/inheritance/**` touches nothing outside
`apps/inheritance/**` and `.github/workflows/inheritance-ci.yml`. Zero mixed commits. This
matters: it means the commit-discipline audit in §5 can use `bdee3c498` as a permanent
floor and will pass on today's tree without any exception list.

The auto-committer's own commits (`fitness log`, `lessons: …`, `bot:`) touch only
`projects/`, `entities/`, and similar — never `apps/inheritance/`. So a rule of the form
"any commit touching `apps/inheritance/**` must touch nothing else" is satisfiable today
and catches exactly the damage mode PROJECT.md warns about, in both directions.

---

## 2. Design decision: the manifest drives the runner

The naive reading of LOOP-03 is "write down the gates somewhere and tell the agent not to
edit it." That is not a gate; it is a wish. A file an agent is merely *asked* not to edit
is edited.

Two mechanisms make it real, and both are used:

**2.1 Growth-only lock.** `gates.manifest.lock` records the `{id, command, blocking}`
triple of every gate at the moment the owner froze it. `scripts/check-gate-manifest.mjs`
fails when a locked id is absent from the manifest (`GATE REMOVED`), when a locked
command string changed (`GATE COMMAND CHANGED`), or when a locked `blocking: true` became
`false` (`GATE WEAKENED`). Adding a new gate is allowed and requires appending to both
files — the legitimate path, exercised in this very phase when plan 02-04 adds three
gates. The check script has no regenerate flag, mirroring the Phase 1 decision that a gate
which can rewrite its own baseline is not a gate.

This is the same trick as the test ledger, inverted: **the test ledger may only shrink; the
gate set may only grow.**

**2.2 The runner reads the manifest.** `ci-gates.sh` stops hardcoding its gate list and
instead iterates the manifest in `order`, running each gate's `command`. This closes the
gap where an agent deletes a gate from the runner while leaving the manifest untouched: the
manifest *is* the runner's input, so a gate can only stop running if it is removed from the
manifest, which §2.1 forbids. Combined with the coverage closeout in §4, scope narrowing
becomes structurally impossible to hide.

`order` is deliberately **not** locked — reordering is not weakening, and this phase
reorders so the three cheap meta-checks run before the five-minute Rust/WASM/Vitest gates.

**Canonical manifest schema** (fixed here so no plan has to invent it):

```json
{
  "$comment": "...",
  "version": 1,
  "gates": [
    {
      "id": "G1",
      "name": "engine tests",
      "order": 4,
      "command": "cd engine && cargo test",
      "cwd": "apps/inheritance",
      "precondition": "test -f engine/Cargo.toml",
      "blocking": true,
      "proves": "The Rust succession engine's unit, integration and fuzz-invariant tests pass.",
      "requirements": []
    }
  ]
}
```

`precondition` is a shell expression evaluated before the gate runs. A false precondition
means **cannot run**, not **failed** — this is the machine half of LOOP-02.

**Canonical gate table** (ids are permanent; `order` is the post-02-04 order):

| id | order | name | command (from `apps/inheritance`) | precondition | added by |
|---|---:|---|---|---|---|
| G5 | 1 | gate manifest integrity | `node scripts/check-gate-manifest.mjs` | `test -f gates.manifest.json` | 02-04 |
| G6 | 2 | plan closed-world lint | `node scripts/check-plan-closed-world.mjs` | `test -d .planning/phases` | 02-04 |
| G7 | 3 | commit discipline audit | `node scripts/check-commit-discipline.mjs` | `git rev-parse --git-dir` | 02-04 |
| G1 | 4 | engine tests | `cd engine && cargo test` | `test -f engine/Cargo.toml` | 02-01 |
| G2 | 5 | wasm build | `bash engine/build-wasm.sh` | `test -f engine/build-wasm.sh` | 02-01 |
| G3 | 6 | frontend suite vs ledger | `cd frontend && npm run test:gate` | `test -d frontend/node_modules` | 02-01 |
| G4 | 7 | typecheck | `cd frontend && npx tsc -b --force` | `test -d frontend/node_modules` | 02-01 |

Plan 02-01 seeds G1–G4 (matching what the runner already does, so the tree is consistent
at the end of every wave). Plan 02-04 appends G5–G7 and reorders. Every intermediate state
is internally consistent — that property is itself a loop-durability requirement, since
execution can halt between waves.

---

## 3. Design decision: cannot-run is not the same as failed

Today `ci-gates.sh` exits 1 both when `cargo test` fails and when `cargo` is missing.
Those are opposite situations: the first is information about the product, the second is
information about the environment, and conflating them is exactly how a loop "silently
redefines success."

**Exit-code contract**, fixed here:

| Code | Meaning | Marker printed |
|---|---|---|
| 0 | Every manifest gate ran and passed | `ALL GATES PASSED (n/n)` |
| 1 | A gate ran and failed | `GATE FAILED: <id>` |
| 2 | A gate could not run at all | `GATE CANNOT RUN: <id>` and `HALT: <reason>` |

Cannot-run conditions, enumerated so no executor has to judge: a `require_tool` miss; a
false `precondition`; a gate command exiting **127** (command not found); an unreadable or
unparseable `gates.manifest.json`.

Exit 2 is a *halt*, not a failure to route around. The human half is the **BLOCKED report**
format defined in `.planning/PLAN-STANDARD.md`: the executor stops, reports `BLOCKED`,
names the requirement, and pastes the real command output. It never proceeds to later
tasks, never marks the plan complete, and never edits a gate to make the halt go away.

A note on `set -e`: capturing a gate's exit code requires `set +e` around the invocation.
The Phase 1 prohibition on `|| true` and `if`-wrapping stands — the difference is that
`rc=$?` immediately followed by an explicit `exit` is fail-closed, whereas `|| true` is
fail-open. Plans must use the former shape and never the latter.

---

## 4. Design decision: coverage is computed from run records, not claims

`ci-gates.sh` writes `apps/inheritance/.gate-runs/latest.json` — one record per gate with
`{id, status, exit_code, started_at, ended_at}` plus a run-level
`{outcome, failure_signature, manifest_version, gates_total}`. The directory is
**gitignored**: per-run artifacts against a repo with a concurrent auto-committer are pure
churn.

`scripts/gate-coverage.mjs` joins the manifest against the latest run record and prints:

1. **Gate execution coverage** — one row per manifest gate: id, blocking, status
   (`pass` / `fail` / `cannot-run` / `NOT RUN`). Ends with `GATE COVERAGE n/m`.
2. **Requirement coverage** — every requirement id in `.planning/REQUIREMENTS.md` mapped to
   the manifest gates that claim it via their `requirements` field, or `UNGATED`. Ends with
   `REQUIREMENT COVERAGE n/m gated`.

**Enforcement rule** (the LOOP-04 mechanism): the coverage check exits 1 when the run's
outcome is `pass` but some **blocking** manifest gate has status `NOT RUN`, printing
`SCOPE NARROWED`. It never fails merely because requirements are ungated — on today's tree
85 of 93 v1 requirements are legitimately ungated and will stay that way until their phases
land. Failing on that would make the loop unable to move at all.

This is precisely the roadmap's success criterion 4: a narrowed scope shows up as reduced
coverage rather than as a false `ALL GATES PASSED`.

---

## 5. Design decision: commit discipline is enforced from history, not from intent

`git add -A` cannot be blocked from inside a plan — the executor has a shell. What *can*
be done is make the damage visible within one gate run, and give the executor a correct
path that is easier than the wrong one.

**The wrapper** — `scripts/safe-commit.sh -m "<msg>" <path>...`. Refuses when given zero
paths, or any of `-A`, `--all`, `-a`, `.`, `:/`, or a path outside `apps/inheritance/` and
`.github/workflows/inheritance-ci.yml`. Stages exactly the listed paths, diffs
`git diff --cached --name-only` against the requested set, aborts on any difference, then
commits. This makes the safe path a single command.

**The audit** — `scripts/check-commit-discipline.mjs` walks `bdee3c498..HEAD` and, for
every commit that touches `apps/inheritance/**`, asserts that *all* of that commit's paths
lie inside the allowlist. Any foreign path is a `MIXED COMMIT` violation naming the commit
SHA, subject and foreign paths.

Why this rule and not an author or message filter: if the auto-committer ever absorbs our
staged work, the resulting commit *will* touch `apps/inheritance/**` alongside `projects/`
or `entities/`, and that is exactly the commit we need surfaced. Filtering by author would
hide the one case the requirement exists for. Measured: this rule produces zero violations
on `bdee3c498..HEAD` today, so it starts green and any red is real.

`bdee3c498` is a fixed, permanent floor written into the script as a constant. It is not a
movable watermark, because a movable watermark is an escape hatch — an agent could advance
it past its own violation.

---

## 6. Design decision: "closed-world" made machine-checkable

LOOP-01 is the requirement most likely to degrade into a slogan. It is made concrete as
`.planning/PLAN-STANDARD.md` plus `scripts/check-plan-closed-world.mjs`, which lints every
`.planning/phases/**/*-PLAN.md`.

**Checks** (each with a distinct literal marker so a failure says which rule broke):

| Marker | Rule |
|---|---|
| `MISSING FRONTMATTER KEY` | Frontmatter has all of `phase, plan, wave, depends_on, files_modified, autonomous, requirements, must_haves` |
| `UNKNOWN REQUIREMENT` | Every id in `requirements` appears in `.planning/REQUIREMENTS.md` |
| `BROKEN DEPENDENCY` | Every id in `depends_on` resolves to an existing `*-PLAN.md` in the same phase directory |
| `MISSING SECTION` | The plan has `<objective>`, `<constraints>`, `<tasks>`, `<verification>`, `<success_criteria>` |
| `INCOMPLETE TASK` | Every `<task>` has non-empty `<read_first>`, `<action>`, `<verify>`, `<acceptance_criteria>`, `<done>` |
| `THIN ACCEPTANCE` | Every `<acceptance_criteria>` block has at least 2 bullet lines |
| `OPEN WORLD PHRASE` | No hedge phrase from the fixed list appears in prose |
| `LEGAL JUDGMENT IN PLAN` | No phrase asking the executor to decide law appears in prose |
| `UNGROUNDED LEGAL FIX` | A plan whose `requirements` include `LAW-06`, `LAW-07` or `LAW-12` must cite the corresponding `LAWYER-06` / `LAWYER-04` / `LAWYER-08` recorded decision |

**Scanning region.** Prose checks skip fenced code blocks (between ``` delimiters) and
inline code spans (single backticks). This is not a loophole: fenced and inline code is
literal data — commands, JSON, greps — where a hedge word is inert. It is also *necessary*,
because the plan that specifies this lint has to write the blacklist down, and because
Phase 1's plans legitimately contain `.skip` / `.todo` inside backticks as prohibitions.

**Measured against the corpus.** Every candidate hedge phrase was counted against the four
Phase 1 plans. Result: `as appropriate`, `if needed`, `if necessary`, `use your judgment`,
`best judgment`, `you decide`, `as you see fit`, `choose an appropriate`, `some reasonable`,
`reasonable reading`, `TBD`, `???`, `figure out`, `something like`, `as desired`,
`or similar` — **all zero hits**. `TODO` produced 16 hits, but every one is a
case-insensitive match on `.todo` / `numTodoTests` / `todo` in a lowercase context; with
case-sensitive `\bTODO\b` matching the count is **zero**. So the blacklist is satisfiable
by the existing corpus with no waiver mechanism, and no waiver mechanism will be built.

**Accepted cost.** `if needed` and `if necessary` will occasionally false-positive on a
legitimate sentence. That is accepted: the failure is loud, points at file and line, and
the fix is to state the condition concretely — which is the requirement itself.

---

## 7. Design decision: the stall signal is a committed file plus CI, and nothing more

LOOP-06 asks for a signal the owner does not have to poll for. Push notification,
email, and chat integration are all out of scope for this phase — no such channel is
configured in this repo, and inventing one would be an ungrounded decision.

What is available and sufficient:

- **`apps/inheritance/LOOP-STATUS.md`** — committed, regenerated on every gate run,
  one screen. Leads with a state banner: `GREEN`, `RED`, `BLOCKED`, or
  `STALLED — NEEDS OWNER ATTENTION`. Below it: last-run timestamp, per-gate status table,
  consecutive non-green streak, and the current failure signature.
- **`apps/inheritance/loop-history.jsonl`** — committed, append-then-truncate to the most
  recent **200** records, one JSON object per line:
  `{ts, outcome, failure_signature, gates_run, gates_total}`. Bounded, so churn is one
  line per run.
- **CI** — already fails the check on any nonzero runner exit, which is a push signal the
  owner receives from GitHub without polling.

**Stall rule**, fixed here so no executor has to invent a threshold:

> STALLED when the most recent 3 records are all non-`pass` **and** share an identical
> `failure_signature`; or when the most recent 5 records are all non-`pass` regardless of
> signature.

**Failure signature**, computable in bash with no output capture:

| Outcome | Signature |
|---|---|
| pass | `""` |
| fail | `"<gate_id>:<exit_code>"` |
| cannot-run | `"CANNOT_RUN:<gate_id>"` |
| preflight halt | `"PREFLIGHT:<missing_tool_or_reason>"` |

`scripts/loop-status.mjs record --run <path>` appends, truncates and regenerates.
`scripts/loop-status.mjs check` exits 1 when the derived state is `STALLED` — available to
an autonomous driver that wants to halt itself, and deliberately **not** wired into
`ci-gates.sh`, because a stall detector that fails the gate run would make the stall
self-perpetuating.

`loop-status.mjs record` runs from a bash `trap ... EXIT` in `ci-gates.sh`, so the record
is written on the success path, the gate-failure path, and the halt path alike. A recorder
that only runs on success records nothing about the situation it exists to detect.

---

## 8. Wave plan and why it is ordered this way

| Wave | Plans | Rationale |
|---:|---|---|
| 1 | 02-01 manifest · 02-02 plan lint · 02-03 commit discipline | Three genuinely independent artifacts with disjoint file sets. Each produces a script that later waves wire in. |
| 2 | 02-04 halt protocol + manifest-driven runner | Sole owner of the `ci-gates.sh` restructure. Needs the manifest (02-01) and the three scripts from wave 1 to exist before it can register them as gates. |
| 3 | 02-05 coverage | Needs the run-record format that 02-04 emits. |
| 4 | 02-06 loop status + stall signal | Needs both the run record (02-04) and coverage (02-05) to render a status page. |

**File ownership, so no two plans in the same wave touch the same file:**

| Plan | Files |
|---|---|
| 02-01 | `GATES.md` (create), `gates.manifest.json`, `gates.manifest.lock`, `scripts/check-gate-manifest.mjs`, `scripts/fixtures/manifest-*.json` |
| 02-02 | `.planning/PLAN-STANDARD.md`, `scripts/check-plan-closed-world.mjs`, `scripts/fixtures/plan-*.md` |
| 02-03 | `scripts/safe-commit.sh`, `scripts/check-commit-discipline.mjs`, `README.md`, `CLAUDE.md` |
| 02-04 | `scripts/ci-gates.sh`, `gates.manifest.json`, `gates.manifest.lock`, `GATES.md`, `.gitignore`, `README.md` |
| 02-05 | `scripts/gate-coverage.mjs`, `scripts/ci-gates.sh`, `GATES.md`, `scripts/fixtures/run-*.json` |
| 02-06 | `scripts/loop-status.mjs`, `LOOP-STATUS.md`, `loop-history.jsonl`, `scripts/ci-gates.sh`, `GATES.md`, `scripts/fixtures/history-*.jsonl` |

Waves 2, 3 and 4 each edit `scripts/ci-gates.sh` and `GATES.md`, which is safe because
they are strictly sequential.

---

## 9. Implementation constraints inherited from Phase 1

These are not new decisions; they are carried forward and every plan restates them.

1. **Dependency-free Node ESM.** All new scripts import only `node:` builtins, matching
   `check-test-baseline.mjs`. No package.json in `apps/inheritance/` root, no npm install
   at the app root, zero new supply-chain surface. Frontmatter YAML is parsed with a
   line-based extractor rather than a YAML library, which is sufficient for the flat
   scalar-and-flow-array frontmatter this project uses.
2. **No check may rewrite its own input.** No `--update`, `--fix`, `--accept` or
   `--regenerate` flag on any checker in this phase.
3. **Every failure path must be observed firing.** A gate nobody has seen fail is not known
   to be a gate. Every checker ships with committed fixtures that drive each violation
   marker, and the plan requires exit 1 with the specific marker for each.
4. **Explicit-path staging only.** `git add -A`, `git add .`, `git commit -a` are
   prohibited in every task.
5. **No test, assertion or gate may be weakened to pass.** If a gate cannot legitimately
   pass, report BLOCKED with the real output.

---

## 10. Validation Architecture

**Framework.** There is no test framework at `apps/inheritance/` root and this phase does
not add one. Validation is by direct execution of each artifact plus committed fixtures —
the same approach Phase 1 used for `check-test-baseline.mjs`, and appropriate because every
artifact here *is* a command-line check whose observable contract is `(exit code, marker
string on stdout)`.

**Sampling.** Each task's `<verify>` block runs the artifact it just produced and prints
the exit code. Each plan's `<verification>` block re-runs every fixture-driven failure path
plus the full `bash scripts/ci-gates.sh`. Feedback latency for the meta-checks is under 5
seconds; the full runner is ~5 minutes, dominated by `cargo test` and the Vitest suite.

**Per-artifact verification map:**

| Artifact | Requirement | Command | Proves |
|---|---|---|---|
| `scripts/check-gate-manifest.mjs` | LOOP-03 | `node scripts/check-gate-manifest.mjs` | Manifest matches lock |
| ″ (fixtures) | LOOP-03 | `node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-removed.json` | Exit 1 + `GATE REMOVED` |
| `scripts/check-plan-closed-world.mjs` | LOOP-01 | `node scripts/check-plan-closed-world.mjs` | All 10 plan files pass |
| ″ (fixtures) | LOOP-01 | `node scripts/check-plan-closed-world.mjs --file scripts/fixtures/plan-openworld.md` | Exit 1 + `OPEN WORLD PHRASE` |
| `scripts/safe-commit.sh` | LOOP-05 | `bash scripts/safe-commit.sh -m x -A` | Exit 1 + `REFUSED` |
| `scripts/check-commit-discipline.mjs` | LOOP-05 | `node scripts/check-commit-discipline.mjs` | Zero mixed commits since `bdee3c498` |
| `scripts/ci-gates.sh` halt path | LOOP-02 | `PATH=/usr/bin:/bin bash scripts/ci-gates.sh` with `cargo` absent | Exit 2 + `GATE CANNOT RUN` |
| `scripts/gate-coverage.mjs` | LOOP-04 | `node scripts/gate-coverage.mjs --run scripts/fixtures/run-narrowed.json` | Exit 1 + `SCOPE NARROWED` |
| `scripts/loop-status.mjs` | LOOP-06 | `node scripts/loop-status.mjs check --history scripts/fixtures/history-stalled.jsonl` | Exit 1 + `STALLED` |

**Manual-only verifications:** none. Every behavior in this phase has an automated command.

---

## 11. Open items deliberately left to later phases

- **GATE-08 (Phase 3)** asks for a machine-readable gate-results file a status page could
  consume. `.gate-runs/latest.json` from 02-04 is its precursor; Phase 3 extends the schema
  and decides publication. Phase 2 does not build a status page.
- **EXT-05 (Phase 15)** owns the final `CLAUDE.md` invariants pass. Plan 02-03 adds only the
  loop-durability invariants (commit discipline, manifest immutability, halt protocol);
  Phase 15 folds in the unit and single-source-of-truth invariants.
- **`.planning/LAWYER-AGENDA.md`** is referenced by the BLOCKED protocol but is created and
  populated by Phase 4. Plan 02-02 documents the append-and-create-if-absent behavior
  without creating the file, so Phase 4 owns its structure.

---

## 12. Points of Philippine law arising in this phase

**None.** This phase is entirely process and tooling. Nothing here interprets the Civil
Code or the NIRC. Nothing is added to the lawyer review agenda.
