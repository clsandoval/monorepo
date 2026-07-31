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
