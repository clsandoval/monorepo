# Gates and the loop

This file and [`gates.manifest.json`](./gates.manifest.json) are **owner-owned**. An executing
agent may **add** a gate, but may never remove one, rename one, retarget one by changing its
command, or weaken one by turning `blocking: true` into `blocking: false`. The enforcement is not a
request in prose — it is `node scripts/check-gate-manifest.mjs`, which diffs the manifest against
the freeze record in [`gates.manifest.lock`](./gates.manifest.lock) and exits 1 on any regression.
When a gate will not pass, the correct response is to report **BLOCKED** with the real command
output, never to edit the manifest.

## 1. The gate manifest

### Current gates

`scripts/ci-gates.sh` reads this table from `gates.manifest.json` and runs the gates in `order`. It
contains no hardcoded gate command, which is what makes the manifest real rather than documentation:
a gate can only stop running by being removed from the manifest, and that is rejected below.

| id | order | name | command (run from `apps/inheritance`) | what it proves |
|---|---:|---|---|---|
| G5 | 1 | gate manifest integrity | `node scripts/check-gate-manifest.mjs` | The frozen gate set has not shrunk, had a locked command changed, or stopped blocking. |
| G6 | 2 | plan closed-world lint | `node scripts/check-plan-closed-world.mjs` | Every plan file is closed-world by the nine rules in `.planning/PLAN-STANDARD.md`. |
| G7 | 3 | commit discipline audit | `node scripts/check-commit-discipline.mjs` | No commit since project init mixes `apps/inheritance/` with paths outside it. |
| G1 | 4 | engine tests | `cd engine && cargo test` | The Rust succession engine's 442 unit, integration, and fuzz-invariant tests pass. |
| G2 | 5 | wasm build | `bash engine/build-wasm.sh` | The engine compiles to WebAssembly and lands a real binary in `frontend/src/wasm/pkg/`, verified by existence, a 100 KB size floor, and the `0061736d` magic number. |
| G3 | 6 | frontend suite vs ledger | `cd frontend && npm run test:gate` | The complete, unmodified 2,416-test Vitest suite runs and its failure set exactly equals the known-failure ledger. |
| G4 | 7 | typecheck | `cd frontend && npx tsc -b --force` | Zero TypeScript errors, with `--force` so a stale `tsconfig.tsbuildinfo` cannot mask them. |

The three meta-gates run **first** on purpose. They finish in seconds, while G1–G4 take minutes, and
a tampered manifest or an open-world plan should be caught before a full Rust, WASM and Vitest run
rather than after it. `order` is deliberately not covered by the lock, so reordering is legal.

Each gate also carries a `cwd`, a `precondition` shell expression, a `blocking` flag, and the
requirement ids it proves. A false `precondition` means the gate **cannot run**, which is a halt
rather than a failure.

### The rule: the gate set may only grow

This project already has a ledger that may **only shrink** —
[`frontend/test-baseline.json`](./frontend/test-baseline.json), the 46-entry record of known
frontend test failures. A test may leave that ledger by being fixed; nothing may be added to it to
make a build green.

The gate manifest is that rule inverted. **The gate set may only grow.** A gate may be added when a
phase legitimately gains coverage; no gate may ever leave. Together the two rules pin the loop from
both sides: the set of things checked can only increase, and the set of accepted failures can only
decrease. Neither can be relaxed by the agent doing the work.

`gates.manifest.lock` freezes exactly the three properties whose change would reduce what the gate
set verifies: `id`, `command`, and `blocking`. Everything else — `order`, `name`, `proves`,
`requirements`, `cwd`, `precondition` — is deliberately unlocked, because reordering gates and
improving their prose are not weakening them.

### Adding a gate — the only legitimate path

1. Append the new gate object to `gates.manifest.json` with all nine keys: `id`, `name`, `order`,
   `command`, `cwd`, `precondition`, `blocking`, `proves`, `requirements`. Gate ids are permanent;
   never reuse a retired one.
2. Append the matching `{"id": ..., "command": ..., "blocking": ...}` entry to
   `gates.manifest.lock`. A manifest gate that is missing from the lock is an `UNLOCKED GATE`
   violation, not a silent pass — an unfrozen gate could be deleted later without tripping
   `GATE REMOVED`.
3. Run `node scripts/check-gate-manifest.mjs` and confirm it prints `MANIFEST OK` and exits 0.
4. Commit both files together, staging explicit paths:
   `git add apps/inheritance/gates.manifest.json apps/inheritance/gates.manifest.lock`.
   Never `git add -A`, `git add .`, or `git commit -a` — a concurrent auto-committer runs on this
   monorepo.

### What is forbidden

| Action | Marker raised | Why it is forbidden |
|---|---|---|
| Removing a gate from the manifest | `GATE REMOVED` | The remaining set reports green while covering less. |
| Changing a locked `command` | `GATE COMMAND CHANGED` | Swapping `npm run test:gate` for `npm test` keeps a gate named the same while making it certify nothing. |
| Setting a locked `blocking: true` to `false` | `GATE WEAKENED` | A red gate that no longer fails the build is worse than no gate. |
| Adding a gate to the manifest only | `UNLOCKED GATE` | An unfrozen gate can be silently dropped later. |

All four require **owner action**, not agent action. The correct response to a gate that will not
pass is to report **BLOCKED**, naming the requirement and pasting the real command output. Do not
route around a red gate, and do not redefine what the gate checks.

### The check has no update flag, by design

`scripts/check-gate-manifest.mjs` reads `gates.manifest.json` and `gates.manifest.lock` and never
writes either one. Its only two flags, `--manifest` and `--lock`, are read-only path overrides that
exist so the committed fixtures under `scripts/fixtures/` can drive each failure path. There is
deliberately no flag that rewrites, repairs, or regenerates the lock: a check that can rewrite its
own baseline is not a check, and adding one would make the freeze record meaningless. The same
decision was already made for the test ledger in `frontend/scripts/check-test-baseline.mjs`.

Every violation path is exercised by a committed fixture, because a gate nobody has seen fail is not
known to be a gate:

```bash
node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-removed.json          # GATE REMOVED
node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-command-changed.json  # GATE COMMAND CHANGED
node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-weakened.json         # GATE WEAKENED
node scripts/check-gate-manifest.mjs --manifest scripts/fixtures/manifest-grown.json            # UNLOCKED GATE
```

All four exit 1. `manifest-grown.json` exits 0 only when it is run against a lock that also contains
the added gate — which is the growth path above, demonstrated rather than asserted.

## 2. Halt and report

`scripts/ci-gates.sh` has a **three-valued exit contract**, because "the gate failed" and "the gate
could not run" are opposite situations. The first is information about the product; the second is
information about the environment. Conflating them is how a month-long unattended loop quietly
redefines success.

| Exit code | Meaning | Marker printed |
|---:|---|---|
| 0 | Every gate ran and passed | `ALL GATES PASSED (n/n)` |
| 1 | A gate ran and failed | `GATE FAILED: <id> (exit <rc>)` |
| 2 | A gate could not run at all | `GATE CANNOT RUN: <id>` followed by `HALT: <reason>` |

### The cannot-run conditions, enumerated

There are exactly four, so nobody has to judge which bucket a situation falls into:

1. A missing required tool — `cargo`, `rustup`, `wasm-pack`, `node`, `npm`, or `frontend/node_modules`.
2. A false `precondition` on the gate being run.
3. A gate command exiting **127** (command not found). A command that does not exist did not run.
4. An unreadable or unparseable `gates.manifest.json`.

### What to do on exit code 2

**Exit code 2 is a halt, not a failure to route around.** Stop at that point. Make no further edits.
Report **BLOCKED** using the five-field template in `.planning/PLAN-STANDARD.md` section 3, pasting
the real command output rather than a paraphrase.

Editing a gate, a precondition, `gates.manifest.json`, `gates.manifest.lock`, a test, or an
assertion in order to make the halt go away is **prohibited**. Doing so converts a loud failure into
a silent wrong answer, which is the one tradeoff this project never accepts.

### The run record

Every exit path — success, gate failure and halt alike — writes `.gate-runs/latest.json` from a bash
`trap ... EXIT`. A recorder that only fires on success records nothing about the situation it exists
to detect.

The record holds `schema`, `started_at`, `ended_at`, `outcome` (`pass` / `fail` / `cannot-run`),
`failure_signature`, `manifest_version`, `gates_total`, `only`, and a `gates` array carrying **every
manifest gate** with `{id, status, exit_code, started_at, ended_at}`. `status` is one of `pass`,
`fail`, `cannot-run`, `not-run`. Gates after the aborting gate are recorded as `not-run` — that
absence-as-data is what the coverage check reads.

`failure_signature` grammar:

| Outcome | Signature |
|---|---|
| pass | `""` |
| a gate ran and failed | `<gate_id>:<exit_code>` |
| a gate could not run | `CANNOT_RUN:<gate_id>` |
| preflight halted | `PREFLIGHT:<missing_tool_or_reason>` |

`.gate-runs/` is **gitignored**. Per-run records are pure churn in a repo with a concurrent
auto-committer; the committed, bounded summaries live elsewhere.

### Keeping the exit contract under test

Four environment variables exist solely so the three exit codes stay exercised. They are
**fail-closed only**: each can turn a green run red, and none can turn a red run green. There is no
variable and no flag anywhere in the runner that skips a gate, marks a gate optional, or converts a
nonzero result into a success. When any is set, the runner prints `INJECTED FAILURE ACTIVE`.

| Variable | Effect | Expected result |
|---|---|---|
| `GATES_INJECT_MISSING_TOOL=<tool>` | preflight treats the tool as absent | exit 2, `PREFLIGHT:<tool>` |
| `GATES_INJECT_PRECONDITION_FAIL=<gate id>` | that gate's precondition fails | exit 2, `CANNOT_RUN:<id>` |
| `GATES_INJECT_NOT_FOUND=<gate id>` | that gate's command becomes a nonexistent binary | exit 2, `CANNOT_RUN:<id>` |
| `GATES_INJECT_GATE_FAIL=<gate id>` | that gate's command becomes `exit 3` | exit 1, `<id>:3` |

The last two rows are the whole point: the same gate, one case exiting 2 because the command never
ran and one case exiting 1 because it ran and failed.

## 3. Coverage against the manifest

`scripts/gate-coverage.mjs` runs as the closeout of every full green gate run, **before** the
`ALL GATES PASSED` line. It exists to close the one failure mode that survives every other check in
this file: a run that legitimately passes everything it *executed*, while quietly executing less than
the manifest requires. From the outside that is indistinguishable from success — exit 0, a green CI
check, `ALL GATES PASSED`.

### The two reports

**Gate execution coverage.** One row per manifest gate, in `order`, showing id, order, whether it is
blocking, its name, its status from the run record, and its exit code. A manifest gate that does not
appear in the record at all is shown as `MISSING FROM RECORD` and treated exactly like `not-run`. The
table ends with `GATE COVERAGE <executed>/<total>`, where *executed* counts the gates that were
actually reached (`pass`, `fail` or `cannot-run`).

The report also flags `UNKNOWN GATE IN RECORD`: a gate id in the run record that the manifest does
not describe. That is drift in the opposite direction — the runner executing something unfrozen —
and it exits 1.

**Requirement coverage.** Every requirement id in `.planning/REQUIREMENTS.md` mapped to the manifest
gates that claim it via their `requirements` field, or reported as `UNGATED` when no gate claims it.
Ends with `REQUIREMENT COVERAGE <gated>/<total> gated`. Currently **6 of 94**: `GATE-01→G3`,
`GATE-02→G4`, `GATE-03→G2`, `LOOP-01→G6`, `LOOP-03→G5`, `LOOP-05→G7`. Every other id is `UNGATED`.

### The enforcement rule

> Fail with `SCOPE NARROWED` when the run's `outcome` is `pass` **and** any **blocking** manifest
> gate has status `not-run` (or `MISSING FROM RECORD`).

That is the whole rule. Three deliberate exemptions follow from it:

- **A failed run does not fail coverage.** The runner exits at the first failing gate, so later gates
  are legitimately unreached.
- **A halted run does not fail coverage.** Same reasoning, and stronger: a halt reaches fewer gates
  *by design*. Treating that as a narrowing would punish the halt behavior section 2 exists to
  create, and operators would disable the check within a week. `scripts/fixtures/run-halted.json` is
  the committed regression test — 2 of 7 gates reached, exit **0**.
- **An ungated requirement never fails the build.** Most v1 requirements are legitimately ungated
  until their phases land. Failing on that would make the loop unable to move at all, so requirement
  coverage is reported as information and referenced by no enforcement rule.

Coverage is also skipped on `--only` runs, which print `Coverage is not evaluated on a partial run`.
A partial run legitimately reaches one gate, and reporting a narrowing on every developer iteration
would train operators to ignore the signal.

### Why this check cannot be gamed by editing one file

Coverage is computed by joining **two independent sources**:

| Source | Role | Protected by |
|---|---|---|
| `gates.manifest.json` | the **expectation** — what should have run | gate G5 (`GATE REMOVED`, `GATE COMMAND CHANGED`, `GATE WEAKENED`) |
| `.gate-runs/latest.json` | the **observation** — what did run | written by the runner from a `trap … EXIT` on every path |

Narrowing the run alone trips `SCOPE NARROWED`. Narrowing the manifest to match trips `GATE REMOVED`
in G5, which runs first. That is what makes coverage the one check in this file that cannot be
satisfied by editing the thing being measured.

## 4. Loop status and the stall signal

PROJECT.md is explicit that a month of slow autonomous implementation is acceptable but a **stalled
loop is not**, and that the owner's attention is scarce and non-recurring. The realistic failure is
not a crash — it is a loop that keeps running, keeps producing output, and keeps hitting the same
wall for days.

`apps/inheritance/LOOP-STATUS.md` is the one file to open. It is regenerated by every full gate run
and leads with one of four states.

| State | Meaning |
|---|---|
| `GREEN` | The most recent run executed the whole frozen manifest and passed. |
| `RED` | A gate ran and failed (runner exit 1). |
| `BLOCKED — NEEDS OWNER ATTENTION` | A gate could not run (runner exit 2). Report BLOCKED per `.planning/PLAN-STANDARD.md` section 3. |
| `STALLED — NEEDS OWNER ATTENTION` | The loop is repeating a failure and is no longer making progress. A human decision is required. |

### The stall rule

> **STALLED** when the most recent **3** records are all non-`pass` **and** share an identical
> `failure_signature`; **or** when the most recent **5** records are all non-`pass` regardless of
> signature.

The rule is fixed, not discovered, so no executor has to invent a threshold. The two halves cover
the two shapes a stall takes: a loop wedged on one gate, and a loop thrashing across many.

State precedence is `STALLED` > `BLOCKED` > `RED` > `GREEN` > `UNKNOWN`. One consequence is
intended: **a single passing run after a failing streak yields `GREEN` immediately**, because the
rule requires the *most recent* records to be non-pass. A banner that stayed red after recovery
would train the owner to ignore it. `scripts/fixtures/history-recovered.jsonl` is the committed
regression test for that.

### The failure-signature grammar

| Outcome | Signature |
|---|---|
| pass | `""` |
| a gate ran and failed | `<gate_id>:<exit_code>` |
| a gate could not run | `CANNOT_RUN:<gate_id>` |
| preflight halted | `PREFLIGHT:<missing_tool_or_reason>` |

### The history file

`apps/inheritance/loop-history.jsonl` gains **one line per full gate run**, holding
`{ts, outcome, failure_signature, gates_run, gates_total, only}`. It is truncated to the most recent
**200** records, so churn stays at one line per run and the file never swamps a diff. Partial
`--only` runs are not recorded at all — they are developer iterations, and recording them would fill
the 200-line window with noise that hides real streaks.

The recorder runs from the runner's `trap … EXIT`, so it fires on the success path, the
gate-failure path and the halt path alike, and it captures and re-exits the incoming exit code
unconditionally. A status writer that could turn a red run green would be a defect; when the
recorder itself fails it prints `LOOP STATUS RECORDER FAILED` and the run's own exit code stands.

### Checking the state from a script

```bash
node scripts/loop-status.mjs check     # prints LOOP STATUS <STATE>; exit 1 only on STALLED
```

This is **deliberately not run by `scripts/ci-gates.sh`**. A stall detector that failed the gate run
would make the stall self-perpetuating: the failing run would itself become another non-pass record,
so the loop could never climb back out.

### Honest scope: there is no notification channel

No email, webhook, chat, or push integration exists here, and none was invented. No such channel is
configured in this repository, and adding one would be an ungrounded decision plus a secret and a
network dependency. The signal is exactly two things:

1. the **committed** `LOOP-STATUS.md`, which shows up in the repository the owner already reads; and
2. the **CI check**, which already fails on any nonzero runner exit and which GitHub surfaces
   without anyone polling for it.

`LOOP-STATUS.md` and `loop-history.jsonl` are regenerated by every full gate run, so they will show
as modified immediately after any commit of them. That is expected. They are always staged
explicitly — with `bash scripts/safe-commit.sh` or a named `git add` path — and **never** with a
broad stage, because this monorepo has a concurrent auto-committer.

## 5. Skip accounting

GATE-09 requires every gate's output to distinguish **skipped** from **passed**. The failure it
closes is specific: a gate that ran half its assertions and exited 0 is indistinguishable, from an
exit code alone, from a gate that ran all of them. A partially-loaded suite then reads as a clean
pass, and coverage falls with no signal at all. Silent wrongness is categorically worse than loud
failure, so absence of a skip report is treated as a failure rather than as zero skips.

### Where each gate's skip count comes from

`scripts/ci-gates.sh` tees each gate's combined stdout and stderr into
`.gate-runs/logs/<GATE_ID>.log`. `node scripts/check-gate-skips.mjs` (gate G8) reads those logs
against this fixed table. Nothing is inferred.

| Gate | Command | Source of `total` / `skipped` |
|---|---|---|
| G1. Engine tests | `cd engine && cargo test` | **Derived.** Every `test result:` line's `N ignored` and `N filtered out` fields are the skips; the `N passed` fields are the total. |
| G2. WASM build | `bash engine/build-wasm.sh` | **Emitted** `GATE-SKIPS` line. `total` is 3 — existence, size floor, magic number. |
| G3. Frontend suite | `cd frontend && npm run test:gate` | **Emitted.** `total` is the collected test count; `skipped` is `numPendingTests + numTodoTests + skippedNames.length`. |
| G4. Typecheck | `cd frontend && npx tsc -b --force` | **Static.** `skipLibCheck` and `skipDefaultLibCheck` in `frontend/tsconfig.json`, plus every `@ts-ignore`, `@ts-nocheck` and `@ts-expect-error` under `frontend/src`. `total` is those two switches plus the number of source files covered. |
| G5. Gate manifest integrity | `node scripts/check-gate-manifest.mjs` | **Emitted.** `total` is the manifest's gate count. |
| G6. Plan closed-world lint | `node scripts/check-plan-closed-world.mjs` | **Emitted.** `total` is the number of `*-PLAN.md` files discovered. |
| G7. Commit discipline audit | `node scripts/check-commit-discipline.mjs` | **Emitted.** `total` is the number of commits in the audited range. |
| G8. Gate skip accounting | `node scripts/check-gate-skips.mjs` | **Itself.** It accounts for one assertion per manifest gate. |

G1 and G4 are derived rather than emitted for one reason: `cargo test` and `tsc` are external tools.
They cannot be asked to print this project's accounting line, and `gates.manifest.lock` freezes their
command strings so they cannot be wrapped in something that would. Reading their real output — or,
for `tsc`, the configuration that governs what it checks — is the only honest option left.

### The declared-skip ledger may only shrink

`gate-skips.lock` at the app root declares every skip this gate set knowingly accepts. **The ledger
may only shrink.** Two checks enforce that in both directions:

- `UNDECLARED SKIP` — an observed skip that the ledger does not declare.
- `STALE SKIP DECLARATION` — a declared skip that was not observed. This is the direction that
  forces the ledger down: the day a skip is removed, its declaration must go with it or G8 turns red.

Three ledgers now exist in this project and all three point the same direction, toward more
verification over time, never less:

| Ledger | Direction | Enforced by |
|---|---|---|
| `gates.manifest.lock` | may only **grow** | `node scripts/check-gate-manifest.mjs` |
| `frontend/test-baseline.json` | may only **shrink** | `cd frontend && npm run test:gate` |
| `gate-skips.lock` | may only **shrink** | `node scripts/check-gate-skips.mjs` |

### What the ledger currently contains

Exactly one entry:

| Gate | Id | Source | Reason |
|---|---|---|---|
| G4 | `tsconfig.skipLibCheck` | `frontend/tsconfig.json` | TypeScript does not type-check the `.d.ts` files of dependencies. Turning this off is a real change to what gate G4 verifies and was not in scope for Phase 3. |

Every other skip mechanism measures zero: no `#[ignore]` in the engine, no `.skip`, `.only`,
`.todo`, `xit` or `xdescribe` under `frontend/src`, and no `@ts-ignore`, `@ts-nocheck` or
`@ts-expect-error` anywhere in the frontend sources.

### The prohibition

**Adding an entry to `gate-skips.lock` to turn a red run green is forbidden.** The fix is to remove
the skip, not to declare it. `scripts/check-gate-skips.mjs` has no flag of any kind that writes,
repairs or regenerates the ledger, by design — a check that can rewrite its own baseline is not a
check. Its only three flags are `--logs`, `--lock` and `--manifest`, all read-only path overrides.

### The logs are per-run detail, not a record

`.gate-runs/logs/` is gitignored. The directory is cleared at the start of every run, and every log
plus a sibling `RUN.stamp` carries that run's `GSD-RUN <timestamp>` start time on its first line. A
missing log, or one whose stamp does not match `RUN.stamp`, fires `SKIP REPORT MISSING` — it is
never read as zero skips, because otherwise deleting a log would be a way to look clean.

All five verdicts — `SKIP REPORT MISSING`, `UNDECLARED SKIP`, `STALE SKIP DECLARATION`,
`SKIP COUNT MISMATCH` and `SKIP SCAN UNREADABLE` — have been observed firing against the committed
fixtures in `scripts/fixtures/logs-ignored/`, `scripts/fixtures/logs-stale/` and
`scripts/fixtures/skips-stale.lock`. A check nobody has seen fail is not known to be a check.

## 6. Published results

`gate-results.json` at the app root is the **committed**, machine-readable view of the most recent
gate run. `.gate-runs/latest.json` stays gitignored per-run detail. They are two artifacts rather
than one file with the ignore rule deleted, for a concrete reason: the run record carries only
`{id, status, exit_code, started_at, ended_at}` — no gate name, no `proves` text and no requirement
mapping. `scripts/loop-status.mjs` already records the missing gate name as a known limitation. The
published file is the **join** of the frozen manifest's descriptive fields onto the run's
observations, plus the per-gate skip counts from section 5 and a per-requirement roll-up.

`scripts/publish-gate-results.mjs` writes it. `node scripts/check-gate-results.mjs` (gate G9)
validates it. Nothing else writes it, and the validator has no flag that repairs it.

### Schema

Four top-level keys:

| Key | Meaning |
|---|---|
| `schema` | the integer `1` |
| `generated_at` | ISO timestamp of the write |
| `run` | `started_at`, `ended_at`, `outcome`, `failure_signature`, `manifest_version`, `gates_total`, `gates_run` |
| `gates` | one entry per manifest gate, in `order` |
| `requirements` | one entry per distinct requirement id any gate carries |

Thirteen per-gate keys:

| Key | Source |
|---|---|
| `id`, `name`, `order`, `blocking`, `proves`, `requirements` | `gates.manifest.json` |
| `status`, `exit_code`, `started_at`, `ended_at` | `.gate-runs/latest.json` |
| `duration_seconds` | `ended_at` minus `started_at`, or `null` |
| `assertions_total`, `assertions_skipped` | the gate's `GATE-SKIPS` log line, or `null` for a gate that emits none (G1 and G4) |

Three per-requirement keys: `id`, `gates` (ids carrying it, in manifest order) and `status`.
A requirement is `pass` only when **every** one of its gates passed; `fail` when any failed;
`incomplete` otherwise. There is no fourth value and nothing defaults to `pass`.

### Statuses are copied verbatim

The four legal gate statuses are `pass`, `fail`, `cannot-run` and `not-run`. They are copied out of
the run record with no mapping, normalising, coalescing or defaulting. A gate absent from the run
record entirely becomes `not-run`, which is what `scripts/ci-gates.sh` already writes for a gate that
never started.

`RESULTS STATUS INVALID` rejects anything else. The value it was specifically observed rejecting is
**`skipped`** — the plausible-looking status this project does not use. Accepting it would be exactly
the collapse of "skipped" into "passed" that GATE-09 exists to prevent, in the one place a reader
would never think to check.

`RESULTS INCOMPLETE` additionally fails on any gate published as `not-run`, with a single exemption:
gate `G9` itself, whose own run-record entry is still being written while it runs.

### Published on every exit path

`publish_results` is called after every gate in the loop and again from the `on_exit` trap, so the
file exists and is current after a pass, after a gate failure, and after a halt. Observed:

| Run | Runner exit | `run.outcome` | Gate statuses |
|---|---|---|---|
| `bash scripts/ci-gates.sh` | 0 | `pass` | all nine `pass` |
| `GATES_INJECT_GATE_FAIL=G1 bash scripts/ci-gates.sh` | 1 | `fail`, signature `G1:3` | `G5 G6 G7` pass, `G1` fail, the rest `not-run` |
| `GATES_INJECT_MISSING_TOOL=cargo bash scripts/ci-gates.sh` | 2 | `cannot-run` | every gate `not-run` |

A failing publisher can **never** change the runner's exit code. It is wrapped in the same
`set +e` / capture / warn structure the run-record writer already uses; on failure it prints
`WARNING: could not publish gate-results.json` to stderr and nothing else happens. This was observed
directly: with the publisher removed from disk, a green run still exited 0 and an injected gate
failure still exited 1.

## 7. Reading the gate set as a whole

One table, the whole set, rendered from `gates.manifest.json`.

| Order | Gate | Command | Requirements |
|---|---|---|---|
| 1 | G5 gate manifest integrity | `node scripts/check-gate-manifest.mjs` | LOOP-03 |
| 2 | G6 plan closed-world lint | `node scripts/check-plan-closed-world.mjs` | LOOP-01 |
| 3 | G7 commit discipline audit | `node scripts/check-commit-discipline.mjs` | LOOP-05 |
| 4 | G1 engine tests | `cd engine && cargo test` | — |
| 5 | G2 wasm build | `bash engine/build-wasm.sh` | GATE-03 |
| 6 | G3 frontend suite vs ledger | `cd frontend && npm run test:gate` | GATE-01 |
| 7 | G4 typecheck | `cd frontend && npx tsc -b --force` | GATE-02 |
| 8 | G10 lawyer decision registry | `node scripts/check-lawyer-agenda.mjs` | LAWYER-09 |
| 9 | G8 gate skip accounting | `node scripts/check-gate-skips.mjs` | GATE-09 |
| 10 | G9 published gate results | `node scripts/check-gate-results.mjs` | GATE-08 |

The three cheap meta-gates run first, so a tampered manifest or an open-world plan is caught in
seconds rather than after a five-minute build. G8 and G9 run last, because both read artifacts the
preceding gates produce.

## 8. The lawyer decision registry

**What LAWYER-09 requires.** Every interpretive choice the engine has already made must be
machine-readable and linked from the specific rule it governs, so no agent re-decides it later.

**The failure being closed.** A recorded decision that nothing checks stops governing anything the
first time a function is renamed. The decision does not become wrong — it becomes *unattached*, and
nothing says so. The next agent to open that file sees code with no decision on it and invents one.

**Two files, two audiences.**

- `.planning/LAWYER-AGENDA.md` is what the lawyer answers. Prose, eight entries, three checkboxes
  each.
- `.planning/lawyer-decisions.json` is what the gate checks. Eight objects, fourteen fixed keys.

They are deliberately separate: a single file cannot disagree with itself, and the disagreement is
the signal. Gate **G10** (`node scripts/check-lawyer-agenda.mjs`) fails the build when they diverge.

**The seven verdicts.**

| Marker | Fires when |
|---|---|
| `AGENDA ENTRY MISSING` | One of `LAWYER-01`…`LAWYER-08` has no registry entry, or no `## <id>` heading in the agenda. |
| `DECISION FIELD MISSING` | A registry entry lacks one of the fourteen required keys, or carries a key outside the schema. |
| `DECISION STATUS INVALID` | `status` is outside `awaiting-answer` / `confirmed` / `changed`, **or** a status advanced with no answer attached. |
| `DECISION ANCHOR BROKEN` | An anchor's file is gone, or its pattern occurs in that file a number of times other than exactly one. |
| `DECISION MARKER MISSING` | An anchored file carries no `LAWYER-DECISION: <id>` comment. |
| `AGENDA DRIFT` | The agenda and the registry disagree on the id set, on `**Engine implements:**` vs `reading_implemented`, or on `**Status:**` vs `status`. |
| `AGENDA SCAN UNREADABLE` | An input is missing or unparseable. Exits 1 immediately; never exits 0 on an internal error. |

Each verdict has a committed fixture under `scripts/fixtures/` that was observed making it fire. A
check nobody has seen fail is not known to be a check.

**The rule: no agent may advance a status without a recorded answer.**

A `status` other than `awaiting-answer` requires `answered_by`, `answered_on` **and** `answer` to all
be present. `DECISION STATUS INVALID` enforces it. This is the load-bearing verdict of the whole
gate, because three requirements — **LAW-06**, **LAW-07** and **LAW-12** — are hard-blocked on a
lawyer's answer, and the cheapest way for a future agent to unblock itself is to edit one word of
JSON. It cannot: advancing a status now requires writing a person, a date and a sentence into the
diff, where a human reviewing it sees them. The fixture
`scripts/fixtures/lawyer-status-invalid.json` is exactly that edit, and it exits 1.

The gate never evaluates whether a legal reading is *correct*. It checks structural agreement, anchor
liveness and marker presence, and nothing else. Deciding a contested point of Philippine law is not
an agent's to do, and it is not a gate's either.

**Why anchors are grep patterns, not line numbers.** Phases 5, 7 and 8 rewrite the exact files the
registry points at, and plan 04-03's own marker insertion already shifted every line below nine
sites. A line number would have been stale the same day. A pattern matching **zero** times means the
rule moved or was renamed; a pattern matching **more than once** means the anchor no longer
identifies a single location. Both are failures, for different reasons, and the gate reports the
observed count either way. Patterns are matched **literally, never as a regular expression** — they
contain `(`, `)`, `+`, `*` and `.`, and treating them as a regex would silently change what is being
matched.

**Ordering note — do not move G9 off the end.** `scripts/check-gate-results.mjs` (G9) fails with
`RESULTS INCOMPLETE` when any gate other than itself is `not-run` in `gate-results.json`, and
`scripts/ci-gates.sh` republishes results after every gate. A gate ordered after G9 would therefore
fail G9 on every run. G10 takes `order: 8`, G8 moves to 9, and G9 stays last at 10. `order` is
deliberately unlocked (see section 1), so this is a reordering, not a weakening. Placing G10 ahead of
G8 is also strictly stronger: G10's own `GATE-SKIPS` line gets checked by the skip-accounting gate
rather than being emitted after it and ignored.

**Changing a status.** `.planning/LEGAL-CORRECTION-WORKFLOW.md` is the only procedure by which a
recorded decision's status changes. Editing the registry or the agenda directly is not it.

---

## 9. Engine observability

**The failure this closes: an empty warnings array is indistinguishable from a correct one.**

Two lines did the damage. `engine/src/step10_finalize.rs` hardcoded `warnings` to an empty vector, and
the same file hardcoded all three per-heir sub-components to zero with an empty `legitime_fraction`
beside them. Both survived for the whole life of this codebase, unnoticed. The consequence is the
reason this phase came before every legal-fix phase: **every one of the nine defects catalogued in
`.planning/research/LEGAL-CONFORMANCE.md` reproduced with `warnings: []`.** A lawyer reading engine
output could not tell a corrected case from a broken one, and neither could a gate.

### Measured, before and after

Taken live over all 140 committed inputs (20 `examples/cases`, 100 `examples/fuzz-cases`,
20 `examples/testate-cases`) and the 564 per-heir rows they produce.

| Quantity | Before Phase 5 | After Phase 5 |
|---|---|---|
| per-heir rows with a nonzero `from_legitime` | 0 | 105 |
| per-heir rows with a nonzero `from_free_portion` | 0 | 25 |
| per-heir rows with a nonzero `from_intestate` | 0 | 457 |
| per-heir rows with a non-empty `legitime_fraction` | 0 | 564 (every row) |
| cases emitting at least one warning | 0 of 140 | 42 of 140 |
| `computation_log.steps` length | exactly 1, every case | 10 with no restart, 18 with one |
| rows where the three sub-components ≠ `gross_entitlement` | n/a (all three were zero) | 0 |
| manual review flag codes declared in the crate | 0 of the spec's 10 | 10 of 10 |

### The six verdicts of `node scripts/check-observability.mjs`

| Marker | Fires when |
|---|---|
| `WARNINGS SUPPRESSED` | the finalize file re-hardcodes an empty warnings vector on a non-comment line |
| `SUBCOMPONENTS ZEROED` | the finalize file re-empties `legitime_fraction`, or the old round-sub-components TODO returns |
| `FLAG CODE MISSING` | one of the ten spec §13.1 flag codes is not declared in `engine/src/flags.rs` |
| `FLAG CODE UNTESTED` | a declared code appears in neither the flags file's `#[cfg(test)]` region nor `engine/tests/observability.rs` |
| `OUTPUT CHECK MISSING` | `SumMismatch` or `DuplicateHeirId` is gone, or `engine/src/wasm.rs` no longer calls `run_pipeline_checked` |
| `BOUNDARY ERROR UNSTRUCTURED` | `engine/src/wasm.rs` stops naming any of the three failure kinds `invalid_input`, `output_check`, `serialize` |

A seventh condition, `OBSERVABILITY SCAN UNREADABLE`, exits 1 immediately when a named file is missing
or unreadable. The script never exits 0 on an internal error, and has no `--fix`, `--update`,
`--accept`, `--regenerate` or waiver flag — its five flags are read-only path overrides so the
fixtures under `scripts/fixtures/obs-*.rs` can drive each failure path.

All matching is **literal, never regular-expression**. The searched strings contain `[`, `]`, `!`, `:`
and `(`, which are regex metacharacters; treating them as a pattern would silently change what is
checked. Verdicts 1 and 2 skip lines whose trimmed form begins with `//`, so this manual and the
script's own header can quote the forbidden literals as prose without re-triggering the gate that
documents them.

### Why two mechanisms rather than one

`engine/tests/observability.rs` runs under **G1** (`cd engine && cargo test`) and catches a
**behavioral** regression: a step changes, the fractions go empty again, and the corpus test says so
across every row of every case. **G11** catches a **source** regression: the literal reappears on a
path no test happens to cover. The two hardcoded lines this phase removed are the existence proof
that the second failure mode is real — they were never covered by a test, which is precisely why
nobody noticed them.

### The corpus floor

`engine/tests/observability.rs` asserts the committed corpus holds **at least 140** `.json` inputs
before it asserts anything else. Deleting committed inputs to make an assertion vacuous fails on that
line first, so the corpus cannot shrink silently.

### Ordering note — G9 still stays last

Same constraint section 8 records. `scripts/check-gate-results.mjs` (G9) fails with
`RESULTS INCOMPLETE` when any gate other than itself is `not-run`, and `scripts/ci-gates.sh`
republishes results after every gate, so a gate ordered after G9 would fail G9 on every run. **G11
takes `order: 9`, G8 moves to 10, and G9 moves to 11 and stays last.** `order` is deliberately unlocked
(see section 1), so this is a reordering, not a weakening. Placing G11 ahead of G8 is also strictly
stronger: G11's own `GATE-SKIPS` line gets checked by the skip-accounting gate rather than being
emitted after it and ignored.
