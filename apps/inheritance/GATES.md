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
