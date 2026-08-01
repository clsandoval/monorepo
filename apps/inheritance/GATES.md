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
| G12 | 4 | engine coverage report | `bash scripts/coverage-report.sh && node scripts/check-coverage.mjs` | A per-module coverage report is producible for every engine module, no module has vanished from it, and the set of modules no test enters at all has not grown. Section 10. |
| G13 | 5 | assertion discipline | `node scripts/check-assertion-discipline.mjs` | No frontend test asserts nothing, and no test whose only matcher is `toBeDefined` or `toBeTruthy` exists outside the shrink-only ledger. Section 11. |
| G15 | 6 | journey harness self-test | `cd frontend && node journey/selftest.mjs` | The journey harness still works: a rubric returns structured per-assertion output and rejects an unknown kind, a perceptual diff separates a reference miss from a size mismatch from a pixel failure, a failing step writes five durable artifacts naming both failing mechanisms, and the database-free seeding seams reach a page before first paint. Section 12. |
| G16 | 7 | journey registry integrity | `node scripts/check-journey-registry.mjs` | Every declared journey step has a rubric built from the closed eight-kind assertion set and an approved reference with a tolerance sidecar, and no reference exists without a step. Static. Section 13. |
| G1 | 8 | engine tests | `cd engine && cargo test` | The Rust succession engine's unit, integration, property-invariant and defect-ledger tests pass. |
| G2 | 9 | wasm build | `bash engine/build-wasm.sh` | The engine compiles to WebAssembly and lands a real binary in `frontend/src/wasm/pkg/`, verified by existence, a 100 KB size floor, and the `0061736d` magic number. |
| G3 | 10 | frontend suite vs ledger | `cd frontend && npm run test:gate` | The complete, unmodified 2,416-test Vitest suite runs and its failure set exactly equals the known-failure ledger. |
| G4 | 11 | typecheck | `cd frontend && npx tsc -b --force` | Zero TypeScript errors, with `--force` so a stale `tsconfig.tsbuildinfo` cannot mask them. |
| G18 | 12 | tenant isolation | `cd frontend && node journey/rls-isolation.mjs` | Against a real local Supabase, a user in org A reads zero of org B's cases, PDFs and share tokens, changes zero of org B's rows, and is refused a cross-tenant insert — each paired with a positive control. Section 13. |
| G17 | 13 | live journey run | `cd frontend && node journey/run.mjs --all` | Every declared account, organization and case-intake screen is driven in a real headless browser against the built application and a real local Supabase, checked by both a DOM rubric and a zero-tolerance perceptual diff. Section 13. |
| G19 | 14 | money parity | `cd frontend && node journey/money-parity.mjs` | Every peso figure the results view displays equals, as an exact integer number of centavos, a distribution the compiled engine computed during the same run — and the row the product stored equals it too. No expected figure is committed anywhere. Section 14. |
| G20 | 15 | share exposure | `cd frontend && node journey/share-exposure.mjs` | The product's one anonymous data path returns exactly the six columns migration 015 enumerates and none of nine forbidden ones; a disabled share and an unknown token each return zero rows. Section 14. |
| G21 | 16 | seo smoke | `cd frontend && node journey/seo-smoke.mjs` | All fourteen public landing, blog and marketing routes load in a real browser, each rendering a non-empty `h1`, logging no console error, and fetching nothing answering HTTP 400 or above. Section 14. |
| G22 | 17 | pdf toolchain | `cd frontend && node journey/pdf-probe.mjs` | A PDF's text, page count, page dimensions and page images are all readable by the harness, a generated document extracts its money token as one uninterrupted string with no corrupted glyph, and rasterising the same document twice produces identical images. Section 15. |
| G23 | 18 | pdf structure | `cd frontend && node journey/pdf-structure.mjs` | The generated estate report carries every required section and every peso figure it shows equals a figure the engine computed in the same run. Section 15. |
| G24 | 19 | pdf visual | `cd frontend && node journey/pdf-visual.mjs` | The rendered pages match approved reference images pixel for pixel, so a corrupted glyph or a collapsed layout is caught perceptually and not only structurally. Section 15. |
| G25 | 20 | print layout | `cd frontend && node journey/print-layout.mjs` | The print stylesheet is measured in a real browser under print emulation: typeface, body size, hidden chrome, shown print headers, A4 paper and the top and left margins read as the distance to first ink. Section 15. |
| G26 | 21 | blocked requirements | `node scripts/check-blocked-requirements.mjs` | LAW-06, LAW-07 and LAW-12 are recorded against the decision each waits on, the record agrees with `.planning/lawyer-decisions.json`, none is marked complete while blocked, and an arriving answer raises `ANSWER ARRIVED` rather than passing. Section 16. |
| G27 | 22 | spec legal text | `node scripts/check-spec-legal-text.mjs` | The four passages of law named in `.planning/research/LEGAL-CONFORMANCE.md` section 2b read correctly, checked as literal strings at named anchors, with the superseded wording proven absent. Section 17. |
| G28 | 23 | legal traceability | `node scripts/check-legal-traceability.mjs` | Every Civil Code article the engine's production code cites is mapped to exactly one named test function carrying its `LEGAL-VECTOR` marker, or declared in the shrink-only `engine/legal-traceability.lock`. Section 18. |
| G29 | 24 | bugs ledger | `node scripts/check-bugs-ledger.mjs` | `engine/BUGS.md` keeps its fixed entry shape, every open entry keeps a runnable reproduction, every closed entry keeps a stated reason, and every legal claim stays attributed. Section 19. |
| G10 | 25 | lawyer decision registry | `node scripts/check-lawyer-agenda.mjs` | Every recorded interpretive choice exists in both the agenda and the registry and cannot have its status advanced without a recorded answer. Section 8. |
| G11 | 26 | engine observability | `node scripts/check-observability.mjs` | The engine still emits warnings, the legitime/free-portion split and a structured boundary error. Section 9. |
| G8 | 27 | gate skip accounting | `node scripts/check-gate-skips.mjs` | Every gate reports how many of its own assertions it skipped, and every skip is declared in `gate-skips.lock`. Section 5. |
| G9 | 28 | published gate results | `node scripts/check-gate-results.mjs` | `gate-results.json` describes the current run and covers every manifest gate. Section 6. |

**The gate set is now twenty-eight.** Phase 13 added **G22**–**G25** (the PDF gates, section 15) at
`order` **17–20**, and Phase 14 added **G26**–**G29** (section 16 through section 19) at `order`
**21–24**, shifting G10, G11, G8 and G9 to **25, 26, 27 and 28** with **G9 still last**. The four
Phase 14 gates are static, dependency-free Node checks that read committed files, so they sit after
the container-and-browser block and before the bookkeeping gates. `order` was the only field that
moved on any pre-existing gate; `gates.manifest.lock` gained four entries and lost none.

Phase 6 added **G12** (engine coverage, section 10) and **G13**
(assertion discipline, section 11) and placed them at `order` **4 and 5, ahead of G1**, shifting
every gate from G1 down by two. Phase 10 then added **G15** (journey harness self-test, section 12)
at `order` **6**, shifting every gate from G1 down by one more. Phase 11 added three more
(section 13): **G16** at `order` **7**, static and ahead of G1 for the same reason; and **G18** and
**G17** at `order` **12 and 13**, after the typecheck because both need a running local Supabase and
G17 additionally needs a build and a browser.
Phase 12 added three more (section 14): **G19** at `order` **14**, **G20** at **15** and **G21** at
**16**, immediately after G17 so that every gate needing a container, a build or a browser sits in
one contiguous block, and ahead of the four bookkeeping gates that close a run. **G9 stays last**,
because `scripts/check-gate-results.mjs` inspects the record of a completed run. **G14 remains
reserved and unused** for Phase 9's `scripts/check-single-source.mjs`; reserved-but-unregistered is
still reserved, which is why Phase 10 took G15 and this phase took G19 through G21.

The gates placed **ahead of G1** — G12, G13, G15 and G16 — are all static, engine-only or
fixture-only checks that do not depend on the frontend suite. The reason for those placements was
that `scripts/ci-gates.sh` halted at **G3** through Phases 5 to 9, red for Phase 5's then-unresolved
OBS-05/OBS-06 product decision, so a gate ordered after G3 would never have executed at all. That
halt is gone, but the ordering is kept: a seconds-long static check should still fail before a
minutes-long Rust, WASM and Vitest run rather than after it.

State this plainly, because the distinction matters: **these were placement decisions about static,
dependency-free checks, not a way of routing around a red gate.** G3 always still ran, still failed,
and still stopped the run. Nothing was ever added to `frontend/test-baseline.json` and no failing
test was edited to clear it.

**That halt is now gone.** The owner ruled OBS-05/OBS-06 in commit `d71f9150e` — the engine rejects
inputs it cannot distribute conservatively rather than returning a best-effort distribution — and the
five tests that encoded the old silent behaviour were rewritten to assert the rejection. As of the
Phase 11 run, `bash scripts/ci-gates.sh` exits **0** and prints `ALL GATES PASSED (17/17)`, with G15
green at order 6, G16 at 7, G3 at 10, G18 at 12 and G17 at 13.

**`G14` is deliberately absent.** It is reserved for Phase 9's unstarted `09-06` plan (single-source-
of-truth rules), which is BLOCKED rather than abandoned. Phase 10 took `G15` precisely so that a
Phase 9 replan can still claim its reserved id. The gap in the numbering is not an error.

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

---

## 10. Engine coverage

**Gate G12** — `bash scripts/coverage-report.sh && node scripts/check-coverage.mjs`, `order: 4`,
blocking. Requirement **COV-04**.

### What it proves

Three things, and deliberately nothing else:

1. A per-module coverage report for the Rust engine can be **produced at all**.
2. **Every** module under `engine/src/` appears in it.
3. The set of modules at **exactly zero** coverage matches `coverage-zero.lock`, in both
   directions.

### There is no percentage threshold, and that is deliberate

COV-04 asks for a report identifying, per engine module, what no test exercises. It does not name a
target, and nothing else in this repository grounds one. Picking a coverage percentage would be
precisely the ungrounded decision `.planning/PLAN-STANDARD.md` forbids — a number nobody can defend,
that later ratchets or gets quietly lowered. So no threshold appears in `coverage-report.sh`, in
`check-coverage.mjs`, or in `coverage-zero.lock`. The report tells you what is uncovered; a human
decides whether that matters.

### Regions, not branches

Stable Rust's coverage instrumentation is **region-based**. The `Branches` column of
`llvm-cov report` is empty on stable, because MC/DC branch counters require a nightly flag. COV-04's
phrase "which branches no test exercises" is therefore implemented as "which coverage **regions** and
which **functions** no test enters" — the finer of the two granularities stable Rust can actually
answer with, and what `llvm-cov` itself calls a region. `engine/COVERAGE.md` says so in its own
header, so no reader is left wondering why a Branches column is missing.

### No crate is installed

Neither `cargo-llvm-cov` nor `cargo-tarpaulin` is used. `llvm-profdata` and `llvm-cov` ship inside
the rustc sysroot via the **rustup component** `llvm-tools-preview`, which
`scripts/coverage-report.sh` resolves through `rustc --print sysroot` rather than assuming `PATH`.
`engine/Cargo.toml` and `engine/Cargo.lock` are never touched. CI installs the component through the
existing `dtolnay/rust-toolchain@stable` step.

### The four verdicts

| Marker | Meaning |
|---|---|
| `COVERAGE REPORT UNAVAILABLE` | The summary is missing, unparseable, or lists no modules. The gate does not exit 0 on its own internal failure. |
| `MODULE ABSENT FROM REPORT` | A `.rs` file under `engine/src/` has no entry in the report. A module silently vanishing from a coverage report is the exact failure a coverage report exists to prevent. |
| `UNDECLARED ZERO COVERAGE` | A module every region of which is uncovered, that `coverage-zero.lock` does not declare. |
| `STALE ZERO COVERAGE DECLARATION` | A declared module that now has at least one covered region, or that no longer exists. |

All four were observed firing before the gate was registered — three against the committed fixtures
in `scripts/fixtures/`, and `COVERAGE REPORT UNAVAILABLE` by pointing `--summary` at a path that does
not exist. A verdict nobody has seen fire is not known to be a verdict.

**One narrow exemption to `MODULE ABSENT FROM REPORT`:** a source file that declares no function at
all is not required to appear. `llvm-cov` emits an entry per file with at least one coverage region,
and a file with no `fn` has none, so its absence is correct rather than suspicious.
`engine/src/lib.rs` — four doc-comment lines and seventeen `pub mod` declarations — is the only such
file today. The exemption cannot hide a real module: every engine module that computes anything
declares functions, which is why `scripts/fixtures/coverage-missing-module.json` (which removes
`src/step7_distribute.rs`) still fails.

### `coverage-zero.lock` may only shrink

It declares exactly two modules today:

| Module | Why no test enters it |
|---|---|
| `src/main.rs` | The CLI entry point. No native test invokes `main()`. |
| `src/wasm.rs` | The `wasm_bindgen` boundary. Unreachable from a native `cargo test`; exercised by the frontend WASM suite through the compiled binary instead. |

Adding an entry to turn a red gate green is prohibited — the fix is to write a test that enters the
module, not to declare that nobody does. The `STALE ZERO COVERAGE DECLARATION` direction is what
forces the ledger **down**: the day a module gains its first test, its declaration must go with it.
This is the exact inverse of `gates.manifest.lock`, which may only **grow**. Both point the same
direction: more verification over time, never less. No script writes `coverage-zero.lock`.

### Regenerating the committed report

```bash
bash apps/inheritance/scripts/coverage-report.sh
```

Writes `engine/COVERAGE.md` (committed) plus `.gate-runs/coverage/export.json` and
`.gate-runs/coverage/summary.json` (gitignored by the existing `.gate-runs/` entry).

### A missing toolchain halts, it does not fail

G12's `precondition` tests for `llvm-profdata` inside the sysroot. If the component is not installed,
`scripts/ci-gates.sh` reports **`cannot-run` and exits 2**, per the three-valued exit contract at the
top of that script. A missing tool is information about the environment and never about the product;
conflating the two is how a long-running loop silently redefines success.

### Ordering note — why G12 runs at order 4

`scripts/ci-gates.sh` currently halts at **G3** because of Phase 5's unresolved OBS-05/OBS-06 product
decision, so a gate ordered after G3 would never execute at all. G12 therefore takes `order: 4`,
ahead of G1, and every gate from G1 down shifted by two (G1→6, G2→7, G3→8, G4→9, G10→10, G11→11,
G8→12, G9→13). `order` is deliberately unlocked (see section 1), so this is a reordering, not a
weakening. **G9 remains the highest order and stays last**, for the reason section 8 records.

One consequence worth stating plainly: because G12 builds the engine under instrumentation, a Rust
compile error now surfaces as `GATE FAILED: G12` **before** G1 is reached.

---

## 11. Assertion discipline

**Gate G13** — `node scripts/check-assertion-discipline.mjs`, `order: 5`, blocking.
Requirement **COV-05**.

### What it proves

Two things:

1. **No frontend test asserts nothing.** A test with no assertion cannot fail. In a product where a
   wrong number becomes a wrong pleading, a suite padded with such tests is worse than a smaller
   honest one, because it reports coverage it does not have.
2. **No test whose only matcher is `toBeDefined` or `toBeTruthy`** exists outside the shrink-only
   `assertion-baseline.json` ledger. Both matchers pass on almost any value — `toBeDefined` fails
   only on `undefined`, `toBeTruthy` only on the six falsy values — so neither states what the code
   should have produced.

### It is a static source scan

The gate reads test files and **never runs Vitest**. It therefore passes independently of **G3**,
which Phase 5 leaves red. That independence is why G13 can sit at order 5, ahead of G1, and still be
meaningful.

### Measured starting numbers

| Metric | Value |
|---|---:|
| Test files scanned | 112 |
| `it` / `test` blocks | 2383 |
| Assertion-free | **0** |
| Weak-only | **15** |

Re-measured live while executing plan 06-05 and identical to the planning measurement, down to the
matcher set of each of the fifteen.

### The four verdicts

| Marker | Meaning |
|---|---|
| `ASSERTION-FREE TEST` | A block with no matcher and none of `expect(`, `assert`, `toMatchSnapshot`, `toMatchInlineSnapshot`. **There is no ledger for this verdict and there never will be** — the count today is zero and a test that cannot fail is never acceptable. |
| `UNDECLARED WEAK ASSERTION` | A block whose every matcher is weak, with no ledger entry. |
| `STALE WEAK DECLARATION` | A ledger entry matching no weak-only block any more. |
| `ASSERTION SCAN UNREADABLE` | The ledger or the root is missing or unparseable. Exits 1 at once; the gate never exits 0 on its own internal error. |

All four were observed firing before the gate was registered. `ASSERTION-FREE TEST` and
`UNDECLARED WEAK ASSERTION` came from the committed fixtures in `scripts/fixtures/`
(`assert-none.test.ts`, `assert-weak-only.test.ts`), alongside a negative control
(`assert-strong.test.ts`, including a nested `describe`) that produces no violation.
`STALE WEAK DECLARATION` was driven against a scratch copy of the ledger outside the repository, and
`ASSERTION SCAN UNREADABLE` by pointing `--ledger` at a nonexistent path. The fixtures end in
`.test.ts` but live **outside `frontend/src`**, so Vitest never collects them.

### Why the fifteen are ledgered rather than rewritten

Rewriting them would require, per test, deciding what the stronger assertion should be — and several
of those are genuine **product** questions rather than test fixes. What a money input should do with
the text `abc` (reject the keystroke, clear the field, show an error) is one. Three more, all in
`src/wasm/__tests__/wasm-real.test.ts`, sit directly on top of Phase 5's unresolved OBS-05/OBS-06
decision recorded in `.planning/phases/05-engine-observability-restored/05-05-SUMMARY.md`; whoever
answers that question clears those three ledger rows at the same time.

Fifteen judgment calls handed to a cheap executing agent is the precise failure mode this project
exists to prevent. So the gate ships red-proof rather than red: the ledger records exactly the
fifteen that exist, a **sixteenth fails the build**, and a ledger entry that no longer matches a real
weak-only test also fails the build, which is what forces the ledger down as these are strengthened.
This is the identical mechanism, key shape and prohibition language Phase 1 chose for
`frontend/test-baseline.json`, for the identical reason.

### Keyed by file plus full test name, never by line number

Line numbers move whenever anything above a test is edited. A line-keyed ledger would produce false
failures on unrelated changes — noise that trains a reader to ignore the gate, which is how a gate
stops being a gate. `file` is relative to `frontend/`; `fullName` is the block's own name string
exactly as it appears in the source.

### No suppression flag

`scripts/check-assertion-discipline.mjs` has no `--fix`, `--update`, `--accept`, `--regenerate` or
waiver flag, and no script anywhere writes `assertion-baseline.json`. Its only two flags, `--root`
and `--ledger`, are read-only path overrides that exist so the fixtures can drive the failure paths.
A check that can rewrite its own baseline is not a check.

---

## 12. Journey harness self-test

**Gate G15** — `cd frontend && node journey/selftest.mjs`, `order: 6`, blocking.
Requirements **JRNY-01**, **JRNY-09**, **JRNY-10**, **JRNY-12**.

### What it proves

Four mechanisms, in eleven named cases:

1. **The rubric evaluator** returns structured per-assertion output, passes 8/8 on the committed
   basic fixture, fails the *named* three assertions on the mutated one, and **throws**
   `RUBRIC INVALID:` on a kind outside its closed eight-kind set. The eleven cases cover **all eight
   rubric kinds**.
2. **The perceptual comparator** separates `REFERENCE MISSING` from `REFERENCE SIZE MISMATCH` from
   `DIFF FAILURE` from a pass — **all four diff outcomes** — and reports exactly zero differing pixels
   when an image is compared with itself, which is the determinism claim the whole diff mechanism
   rests on.
3. **The artifact writer** leaves five non-empty files for a failing step, and `FAILURE.txt`'s first
   line names **both** `RUBRIC FAILURE` and `DIFF FAILURE` when both fired. That is the JRNY-10
   distinction surviving into the durable record.
4. **The seeding seams** — a `localStorage` draft, a `sessionStorage` flag and a search param all
   reach a real page on its **first paint**, with no reload.

### It needs no Docker, no Supabase, no built application and no network

Every case runs against the committed HTML fixtures in `frontend/journey/fixtures/`. That boundary is
deliberate: G15 has to be runnable on a bare CI runner, and a gate that silently depends on a database
is a gate that reports environment problems as product failures. The gates that drive the **real**
application belong to Phases 11 and 12.

For the same reason `frontend/journey/seed-smoke.mjs` — which proves the live-database seeding half —
is **not registered as a gate**. It needs Docker and a running local Supabase stack, and exits 2
(cannot-run), not 1, when the stack is down. Phase 3 set that precedent with
`scripts/check-env-ready.mjs`.

### Three-valued exit contract

| Exit | Meaning |
|---:|---|
| 0 | Every self-test case passed; the `GATE-SKIPS` line was printed |
| 1 | A self-test case failed; each failing case is named on stdout as `SELFTEST FAILED <caseName>: <message>` |
| 2 | The harness **could not run** — chromium is not installed; run `npx playwright install chromium` |

Exit 2 on a missing browser matters: a machine that has never run `npx playwright install chromium`
has an environment problem, not a broken harness, and conflating the two is what section 2 exists to
prevent. The `GATE-SKIPS total=11 skipped=0` line prints on **both** the pass and the fail path,
because G8 reads it from the gate's log regardless of outcome.

### The gate cannot approve its own expectation

G15 never invokes `journey/approve.mjs` for an approval — its single reference to that command is the
case asserting it **refuses** when no artifact exists. Every case needing a reference directory uses a
temp directory, so `frontend/journey/references/` still holds only `.gitkeep` after a gate run. A gate
that could write its own reference would go green by rewriting its own expectation.

### The harness documents itself

- [`frontend/journey/JOURNEY.md`](./frontend/journey/JOURNEY.md) — every seeding seam, the eight rubric
  kinds, the artifact layout, and the known will-step limitation.
- [`frontend/journey/REFERENCES.md`](./frontend/journey/REFERENCES.md) — the five failure markers, the
  reference re-approval flow, and why raising `maxDiffPixels` to clear a red gate is prohibited.

---

## 13. Account, organization and case journey gates

Three gates, added by Phase 11. They are three rather than one because a red run must say **which**
kind of thing broke, and a screen regression, a tenant-boundary regression and a registry rot are
three different investigations.

### Gate G16 — journey registry integrity

`node scripts/check-journey-registry.mjs`, `order: 7`, blocking.
Requirements **JRNY-02**, **JRNY-03**, **JRNY-04**.

Reads every `frontend/journey/steps/*.json`, every `frontend/journey/rubrics/*.json` and the contents
of `frontend/journey/references/`, and fails when a step is declared with an unknown field or an
out-of-set enumerated value (`STEP FIELD INVALID`), when two records share an id
(`DUPLICATE STEP ID`), when a step's rubric file is absent (`RUBRIC MISSING`), when a rubric names an
assertion kind outside the closed eight or omits a field that kind requires (`RUBRIC KIND INVALID`),
when a rubric's `rubricId` disagrees with the step naming it (`RUBRIC ID MISMATCH`), when a step has
no approved reference or no tolerance sidecar (`REFERENCE MISSING`), when a sidecar carries a
non-zero `maxDiffPixels` with nobody named for it (`TOLERANCE RAISED`), when a reference image has no
declared step (`ORPHAN REFERENCE`), or when a step url carries a uuid that is neither in
`frontend/supabase/fixtures.json` nor the single declared refusal token (`UNKNOWN URL TOKEN`).

It imports `ASSERTION_KINDS` and `ACTION_KINDS` from the harness rather than re-typing them, so the
closed sets have exactly one definition.

### Gate G18 — tenant isolation

`cd frontend && node journey/rls-isolation.mjs`, `order: 12`, blocking. Requirement **COV-06**.

Runs a committed fourteen-case table across four surfaces — organizations, cases, PDFs and share
links — through **real** signed-in sessions, never through the service-role client, which bypasses RLS
and would make every assertion vacuous. Every negative is paired with a positive control on the same
table with the same verb, because a denial and an empty table are indistinguishable from the negative
alone. `no-rows` (row-level security) and `denied` (a missing grant) are distinct expectations, so a
failure says which mechanism produced it.

### Gate G17 — live journey run

`cd frontend && node journey/run.mjs --all`, `order: 13`, blocking.
Requirements **JRNY-02**, **JRNY-03**, **JRNY-04**.

Builds the application, serves it on a fixed port, and drives every declared step in real headless
chromium against a real local Supabase. Each step is checked **twice** and the two checks are kept
apart on purpose: a fixed list of yes/no DOM assertions (the rubric — content), and a zero-tolerance
perceptual diff against an approved reference (the layout).

### What each gate needs

| Gate | Repository | Docker + local Supabase | `npm run build` | chromium |
|---|:--:|:--:|:--:|:--:|
| G16 | yes | — | — | — |
| G18 | yes | yes | — | — |
| G17 | yes | yes | yes | yes |

G16 is the half that runs on a bare runner. A static gate that quietly needed Docker would report an
environment problem as a product failure, so `check-journey-registry.mjs` opens no network
connection, launches no browser and invokes no external command.

### Three-valued exit contract, and why a cannot-run still stops the run

`journey/run.mjs` and `journey/rls-isolation.mjs` both use this project's established contract:

| Exit | Meaning | Literal line |
|---:|---|---|
| 0 | every step / case passed | `JOURNEY PASS steps=<n> failed=0` · `ISOLATION ok cases=<n> surfaces=4` |
| 1 | ran and failed | `JOURNEY FAIL steps=<n> failed=<k>` · `ISOLATION FAILED cases=<n> failed=<k>` |
| 2 | could not start | `JOURNEY CANNOT RUN: <reason>` · `ISOLATION cannot-run: <reason>` |

`scripts/ci-gates.sh` maps every nonzero exit other than 127 to `GATE FAILED`. So an exit 2 from
either gate is reported as a **gate failure** whose log carries the literal line
`JOURNEY CANNOT RUN:` or `ISOLATION cannot-run:`.

That is deliberate, not an oversight. There is no way to make these gates quietly not run: a false
`precondition` halts the whole runner with exit 2, and any other nonzero fails the gate. Both
outcomes are loud. An environment that cannot run them must stop the run, because a gate that quietly
did not execute certifies nothing, and `PROJECT.md` ranks silent wrongness as categorically worse
than loud failure.

### No gate approves its own reference

`journey/approve.mjs` is the only writer into `frontend/journey/references/`, and **no gate invokes
it**. `journey/run.mjs` contains no reference-promotion path at all — the literal substring naming
that command is absent from the file so the property is checkable by grep. A gate able to overwrite
its own reference could turn any failure green by rewriting its own expectation, and the change would
never appear in front of a human.

The same reasoning is why G16 flags `TOLERANCE RAISED`: `REFERENCES.md` permits exactly one measured
reason to raise `maxDiffPixels` above `0`, and requires that whoever raised it be named. An
unattributed non-zero tolerance is the silent widening that document prohibits.

### Where the detail lives

This section deliberately does not restate them:

- `frontend/journey/JOURNEY.md` — which steps exist, how each is reached, what is deferred and why,
  and the blockers currently keeping specific steps out of the registry.
- `frontend/journey/REFERENCES.md` — the approval flow and the two legitimate reasons to replace a
  reference.

## 14. The wizard and output gates

Three gates, added by Phase 12, alongside twenty-eight new screens that need no gate of their own.

### What the twenty-eight new screens are covered by

Phase 12 registered five succession-wizard screens, eight estate-tax tabs, the results view, the
family-tree visualizer and three share-link states — twenty-eight step records in total across
`steps/wizard.json`, `steps/tax.json`, `steps/output.json` and `steps/share.json`. **None of them
adds a gate.** `G16` already validates every step record and rubric statically, and `G17` already
drives every registered step in a real browser and checks it twice. A screen is covered the moment
its record is committed, which is the property that makes the registry worth having: adding a screen
is a data change, not a manifest change.

### Gate G19 — money parity

`cd frontend && node journey/money-parity.mjs`, `order: 14`, blocking. Requirement **JRNY-07**.

Resets the seeded case to a wizard state, asks the compiled engine for the distribution, then makes
the product compute the same case in a real browser and compares **what it displays**. Five
comparisons, none short-circuiting: each heir's amount, the *set* of heir rows, the total estate
against both the input and the sum of the rows, the breakdown section against the distribution table,
and the `output_json` the product persisted against the same engine result.

Every comparison is between two `BigInt` centavo counts. There is no approximate comparison and no
rounding helper anywhere in the file — a figure that is "close" is a wrong figure — and
`parsePesoText` is a proven inverse of `formatPeso`, exercised up to `900719925474099` centavos,
above the largest exactly-representable double.

**It commits no expected peso figure and formats none.** The expected value is computed during the
run, so this gate cannot drift into asserting a stale number: if the engine's answer changes, the
gate compares against the new answer and the product is what must agree. That is also why the
results screens compute in the browser rather than reading a seeded result — see G21's neighbour note
below and `scripts/check-seed-fixture.mjs`, which rejects a seeded `output_json` outright.

`HEIR ROW SET MISMATCH` is the assertion that makes the check total rather than sampled: without it,
a results view that dropped an heir entirely would display only correct figures and pass.

### Gate G20 — share exposure

`cd frontend && node journey/share-exposure.mjs`, `order: 15`, blocking. Requirement **JRNY-08**.

`get_shared_case` is the only function an unauthenticated caller may execute, and it is
`SECURITY DEFINER` precisely so it can bypass RLS for the one row a valid token names. That makes its
returned column list a security boundary, not an implementation detail. The gate calls it through the
**anon** key — never service-role, which bypasses everything and would pass against any function at
all — and checks six things: exactly one row for a valid enabled token, a key set **equal** to the
expected six, none of nine forbidden names, zero rows for a real token whose sharing is off, zero
rows for an unknown token, and no PostgREST error.

**The six names are transcribed from `supabase/migrations/015_shared_case_single_signature.sql`.**
Widening what an anonymous share link exposes is an owner decision, so a red run here means the
contract moved — not that the check is stale. Editing the array to match a new response is the one
change that would turn this gate into a mirror of whatever the database happens to return.

The set is compared for equality rather than containment for the same reason: containment would pass
a widened response silently.

### Gate G21 — seo smoke

`cd frontend && node journey/seo-smoke.mjs`, `order: 16`, blocking. Requirement **JRNY-11**.

Loads all fourteen committed public routes in a real browser against the built application and
asserts three things per route: an `h1` exists with non-empty text, nothing was logged to
`console.error`, and no response observed while loading carried an HTTP status of 400 or above.
Failures are collected per route rather than short-circuited. No route is exempted and no status is
allow-listed.

`src/router.ts` declares no `notFoundComponent`, so "no 404" cannot mean "no not-found screen
rendered"; it is implemented as the checkable thing, the network status.

**It freezes no layout, on purpose.** JRNY-11 asks for a smoke check, not for layout verification,
and fourteen reference images of long marketing pages would be fourteen images to re-bless on every
copy edit — on the one part of the product where no peso figure appears. Its route list is committed
data rather than a scan of `src/routes/`, so a route that stops being covered is a visible deletion
in a diff; the price is that a *new* public route is covered only once someone adds it to
`frontend/journey/seo-routes.json`, and no check enforces that.

## 15. The PDF gates

Four gates, added by Phase 13, covering the estate report a lawyer actually receives. Until this
phase nothing verified the generated PDF at all: `.planning/codebase/TESTING.md` describes a
`frontend/src/__tests__/print-layout.test.ts` that asserted substrings of a stylesheet through
`readFileSync`, but **that file does not exist in the tree and has no git history**. So none of these
gates replaces a weak check; each closes a verification that was simply absent.

**They run in this order for a reason.** `G22` is first and needs no Docker, no Supabase, no browser
and no application build, so a missing PDF toolchain reports itself in seconds rather than as three
slow, mysterious browser-gate failures forty minutes later.

### The toolchain, and why its version is part of the contract

All four gates read the PDF through `frontend/journey/pdf.mjs`, the single seam in this repository
that spawns a PDF tool. Observed locally:

| Package | Observed version |
|---|---|
| `poppler-utils` | `22.02.0-2ubuntu0.13` (`pdftotext version 22.02.0`) |
| `fonts-urw-base35` | `20200910-1` |

`fonts-urw-base35` is **not** an incidental dependency. The generated PDF's three fonts are PDF
base-14 (`Times-Roman`, `Times-Bold`, `Helvetica`) and **none of them is embedded** — `pdffonts`
confirms it. Poppler therefore substitutes from the system font package when rasterising, so a
different poppler version or a different substitution font package **will** produce different pixels
and `G24` will go red for a reason that has nothing to do with the product. The workflow installs
both packages explicitly. Whether a hosted runner rasterises identically to the versions above is
**unmeasured**: this project's continuous integration has still never executed.

### Why the currency token in the PDF is `PHP `, not the peso sign

Measured during Phase 13 planning, not assumed. WinAnsi — the encoding those non-embedded fonts use —
has no peso sign, so U+20B1 is written into the content stream as the single byte `0xB1`. That byte
extracts as U+00B1 and rasterises at near-zero advance width, **overprinting the first digit of the
amount it prefixes**. Every figure in an exported report carried a corrupted currency mark, and text
extraction split the amount onto its own line, which made any deterministic assertion impossible.
`frontend/src/components/pdf/pdf-text.ts` converts at the PDF boundary only;
`formatPeso` in `src/types/index.ts` is untouched, so every screen in the web interface still renders
the peso sign.

### Gate G22 — pdf toolchain

`cd frontend && node journey/pdf-probe.mjs`, `order: 17`, blocking. Requirement **PDF-01**.

Generates a two-page A4 document at run time with `@react-pdf/renderer` — **no binary fixture is
committed**, so nothing can go stale against the renderer — and runs seven checks over it, every one
evaluated even after an earlier one fails: the bytes are a PDF, all five probe strings extract, the
money token extracts as **one uninterrupted substring**, neither U+00B1 nor U+20B1 appears, `pdfinfo`
reports 2 pages at 595×842 points, `pdftoppm` returns two PNGs, and a **second rasterisation of the
same document has identical SHA-256 digests page for page**. That last check is the precondition
`G24`'s zero-tolerance comparison depends on.

Exit contract: `0` passed, `1` a check failed, `2` the toolchain is missing
(`PDF PROBE CANNOT RUN:` on stderr). A missing binary is never reported as an empty result — an
`extractPdfText` that returned `''` when `pdftotext` was absent would let `G23` certify a blank
document as conforming.

**Reading a failure:** each failing check prints its own name and what was observed. `PROBE TEXT
CONTIGUOUS` and `PROBE NO CORRUPT GLYPH` firing together means an unrepresentable character is back
in the document.

### Gate G23 — pdf structure

`cd frontend && node journey/pdf-structure.mjs`, `order: 18`, blocking. Requirements **PDF-01**,
**PDF-02**, **PDF-03**.

Inspects the PDF **the product's own Export PDF button produced during this run**, reached by
resetting the seeded case, clicking the real compute button and clicking the real export button in a
real browser. A PDF the harness rendered for itself would prove the harness works, not that the
product's lazy `import('@react-pdf/renderer')`, its `profile: null` argument and its blob download
all work.

Four verdict families:

- **`SECTION MISSING`** — the required-section list is **derived from the run**, not committed:
  `WarningsSection` returns `null` when the engine emits no warning and `NarrativesSection` returns
  `null` when there are none, so a fixed list of headings would raise a false failure on a case that
  legitimately has no warnings. `FirmHeaderSection` is deliberately **excluded** — `ActionsBar` calls
  `downloadPDF(input, output, null)`, so no PDF a user can obtain carries a firm header.
- **`PDF AMOUNT UNEXPECTED`** — every `PHP` token the document prints must parse to a centavo value
  the engine produced. This direction is what catches a figure the PDF invented.
- **`PDF AMOUNT MISSING`** — every structured engine amount must appear in the document.
- **`HEIR EVIDENCE MISSING`** — every heir with a positive share must have their name, at least one
  of their own `legal_basis` entries, and a narrative body after the `Heir Narratives` heading.

**No expected peso figure is committed anywhere** — not in the script, not in a JSON file, not in a
comment. Every expected amount comes from `computeEngineOutput` during the run, the discipline
`G19` established and `scripts/check-seed-fixture.mjs` enforces from the other side.

**Every comparison is `BigInt` and there is no tolerance of any kind.** `Number(`, `toFixed`,
`Math.abs`, `epsilon` and `tolerance` appear nowhere in the file. The gate **parses and never
formats**: `parsePdfPesoText` is the inverse of `formatPesoPdf`, so the gate agrees with the product
rather than with a second formatter of its own. A one-centavo injection was observed turning it red.

**Citations are asserted present and matching the engine's own `legal_basis` — never asserted
correct.** Whether `Art. 996` is the right article for a family is a point of Philippine law and
nothing in this gate decides it.

### Gate G24 — pdf visual

`cd frontend && node journey/pdf-visual.mjs`, `order: 19`, blocking. Requirement **PDF-04**.

Rasterises every page and compares it pixel for pixel against an approved reference, reusing
`compareToReference` from `journey/diff.mjs` and its five frozen markers.

**The page count is checked first, before any pixel comparison.** A page appearing or disappearing is
a structural change; reporting it as a pile of per-page diffs — page 2 now looking like page 3, and a
missing reference at the end — would bury the one fact that matters.

**The rasterisation parameters are part of the reference contract: `pdftoppm -png` at 100 dots per
inch.** Changing either **invalidates every approved image** and requires a human to re-approve every
page, exactly as `journey/browser.mjs` states for its viewport.

**References live in `frontend/journey/pdf-references/`, not `frontend/journey/references/.`**
`scripts/check-journey-registry.mjs` (`G16`) raises `ORPHAN REFERENCE` for any image in the latter
that is not a declared browser step, and a PDF page has no `url`, no `session` and no `rubric`.
Putting them there would either break `G16` or force PDF pages to masquerade as browser steps
carrying fields they do not have.

**`journey/pdf-approve.mjs` is the only writer into that directory, and no gate invokes it.**
`pdf-visual.mjs` has no write path into it at all — its only writes are under `.journey-runs/`. A gate
that could approve its own reference would turn any failure green by rewriting its own expectation and
nobody would see the change. Approval is whole-document rather than per-page, because approving one
page of a two-page report while leaving the other at an older revision would describe a document that
never existed. Every sidecar carries `maxDiffPixels: 0`; raising it to clear a red gate is prohibited
by `journey/REFERENCES.md`.

**Reading a failure:** `PDF PAGE COUNT` names both integers and no pixel comparison was attempted.
`DIFF FAILURE` names the page and the differing-pixel count; the actual, reference and diff images are
written to `.journey-runs/<stamp>/pdf/page-<n>/`. `REFERENCE MISSING` means that page has no approved
image or no sidecar — an unapproved page is a real failure, exit `1`, not an environment problem.

### Gate G25 — print layout

`cd frontend && node journey/print-layout.mjs`, `order: 20`, blocking. Requirement **PDF-05**.

Verifies the print stylesheet **by its rendered effect, never by its source text**. A stylesheet's
text says nothing about what a browser did with it: a rule can be overridden by specificity, dropped
by a parse error, scoped to a media query that never matches, or shipped in a bundle the page never
loads — and a check that greps the source file passes in every one of those cases. `grep -c "css"`
and `grep -c "readFileSync"` over this file both print `0`.

Seven checks, each read from `getComputedStyle` under `page.emulateMedia({ media: 'print' })` or from
the bytes `page.pdf()` produced: the print typeface, the body size, navigation and `.no-print`
elements proven hidden, `.print-header` elements proven shown **and proven hidden on screen first**
(otherwise a stylesheet that did nothing at all would pass), the page size read as A4 out of the
printed document, and the top and left margins measured as **the distance from the paper edge to the
first non-white pixel**.

`page.pdf` is called with `preferCSSPageSize: true` and **no `margin` option**, so the paper size and
the margins come from the document's own `@page` rule rather than from an argument the check supplied
itself — supplying one would make the check agree with its own input.

The two margin thresholds are fixed integers: **90 px from the top and 70 px from the left at 100 dots
per inch**. The basis is arithmetic — 25 mm is 98.4 px and 20 mm is 78.7 px at that resolution — and
each sits a few pixels inside its nominal value to absorb glyph bearing while remaining far above the
near-zero offset a page ignoring `@page` would produce. Neither is ever adjusted to make a run pass.
Removing the `@page` margin was observed moving first ink from 126/97 px to 33/34 px and turning the
gate red.

---

## 16. Blocked requirements (G26)

```
node scripts/check-blocked-requirements.mjs
```

Three requirements in this project cannot be implemented by any agent. LAW-06 waits on **LAWYER-06**,
LAW-07 on **LAWYER-04**, LAW-12 on **LAWYER-08**, and all three decisions are `awaiting-answer`
because the lawyer collaborator is sitting the bar examination. `.planning/PLAN-STANDARD.md` section 3
forbids an agent from adopting a reading in the meantime, so the deliverable for those three is
`.planning/BLOCKED-REQUIREMENTS.md`: a record, not an implementation. This gate keeps that record
honest.

**This is the one gate in the set that can turn red on good news.** When a blocking decision stops
being `awaiting-answer` while its requirement is still unchecked in `.planning/REQUIREMENTS.md`, the
check raises `ANSWER ARRIVED` and exits 1. That is deliberate. The answer arriving is exactly the
moment the work must start, and a silent pass would let a month-long unattended loop walk straight
past it. **The remedy is to run the five steps of `.planning/LEGAL-CORRECTION-WORKFLOW.md` — record
the claim, name a `TV-L<NN>` vector, watch it fail, fix in one place, close the loop — never to edit
this gate.**

| Marker | Fires when | Driven by |
|---|---|---|
| `BLOCKED ENTRY MISSING` | a required requirement has no `## LAW-NN — blocked on LAWYER-NN` heading | `scripts/fixtures/blocked-entry-missing.md` |
| `WRONG BLOCKING DECISION` | a heading names a decision whose `blocks` array omits that requirement | `scripts/fixtures/blocked-wrong-decision.md` |
| `MISSING FIELD` | an entry lacks one of the seven bold field lines | observed against a scratchpad copy with one field stripped |
| `STATUS DRIFT` | an entry's `**Registry status:**` differs from the registry's `status` | `scripts/fixtures/blocked-status-drift.md` |
| `REQUIREMENT CLAIMED COMPLETE` | `.planning/REQUIREMENTS.md` marks a blocked requirement `[x]` while its decision is open | observed against a scratchpad `REQUIREMENTS.md` with LAW-06 ticked |
| `ANSWER ARRIVED` | a blocking decision is no longer `awaiting-answer` while its requirement is open | `scripts/fixtures/blocked-answered-decisions.json` |
| `BLOCKED LEDGER UNREADABLE` | any of the three inputs is missing or unparseable | a nonexistent `--ledger` path |

**What this gate does not check.** It never evaluates whether a legal reading is correct, and never
states one. It checks that the record agrees with the registry and that nobody quietly closed a
blocked requirement. The three questions themselves are quoted verbatim in
`.planning/BLOCKED-REQUIREMENTS.md`; a paraphrase of a legal question is already an interpretation,
so none appears there.

---

## 17. The spec's legal text (G27)

```
node scripts/check-spec-legal-text.mjs
```

A wrong spec is worse than a wrong line of code, because the spec is what a lawyer reads to sign off
and what a later agent diffs code against. `.planning/research/LEGAL-CONFORMANCE.md` section 2b named
four passages in this repository's specs that misstate the law. Phase 14 corrected three of them and
Phase 8 had already corrected the fourth; this gate pins all four.

| # | Correction |
|---|---|
| C1 | Art. 992 is stated post-*Aquino v. Aquino* (2021) in the direct line, with the collateral question recorded as the **open** decision `LAWYER-04` rather than answered |
| C2 | Art. 900 ¶2 states the statutory three-month window and the five-year cohabitation defeater, and the resulting spec-to-code divergence is recorded under `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs` |
| C3 | Art. 972 ¶1's prohibition on representation in the ascending line is stated, naming `test_law04_no_representation_in_the_ascending_line` as its committed vector |
| C4 | the vanishing-deduction reduction ratio includes `5F Transfers for Public Use` (corrected in Phase 8 under LAW-09) |

Eleven locations across four files. **All matching is literal `String.prototype.includes`, never a
regular expression**, because every searched string contains `*`, `(`, `)`, `.`, `¶` or `|`. An anchor
must occur **exactly once** in its file: an anchor matching two places does not identify a location,
so it is reported as a defect rather than silently resolved to the first hit. Two of the anchors
needed extending for that reason — `**Articulo mortis** (Art. 900 ¶2)` and `**Ordering constraint**`
each occur twice — and both are documented beside the constants.

| Marker | Fires when | Driven by |
|---|---|---|
| `SPEC ANCHOR MISSING` | an anchor is absent from its file, or occurs more than once | `scripts/fixtures/spec-anchor-missing.md` |
| `CORRECTION MISSING` | a required literal is absent from the anchor's window | `scripts/fixtures/spec-correction-missing.md` |
| `MISSTATEMENT PRESENT` | a superseded literal is still present anywhere in the file | `scripts/fixtures/spec-misstatement-present.md` |
| `SPEC SCAN UNREADABLE` | a named file is missing or unreadable | `--root` pointed at an empty directory |

**What this gate does not check.** It never evaluates whether a legal reading is correct. It checks
that specific literal strings are present at specific places and that specific superseded strings are
absent. In particular it does **not** assert anything about the collateral line: C1's required text
includes the literal `LAWYER-04`, precisely because that question is open.

---

## 18. Legal-rule traceability (G28)

```
node scripts/check-legal-traceability.mjs
```

LAW-14 asks that every implemented legal rule have exactly one named test vector citing its governing
article, checkable by grep. A hand-written map cannot deliver that, because it decays the moment
someone adds an article to production code — and it decays silently. This gate makes the decay loud.

Two derivation rules, both **recomputed from source on every run**, so a hand-edit of
`engine/legal-rules.json` that disagrees with the code fails rather than passes:

1. **Production region.** For each file under `engine/src/`, the production region is its content up
   to but not including the first `#[cfg(test)]`. Citations after that point belong to tests.
2. **`implemented_in`.** For an article, the sorted list of every `engine/src/` file whose production
   region contains that article's citation string.

Current coverage: **63 of 79 articles traced, 16 declared untraced.**

`engine/legal-traceability.lock` is a **shrink-only** ledger — it **may only shrink**, the same
direction as `gate-skips.lock` and `engine/defect-baseline.json`, and the exact inverse of
`gates.manifest.lock`, which may only grow. This project now carries three shrink-only ledgers
alongside the frontend's `test-baseline.json` and the assertion-discipline ledger. It currently holds
**16** articles and that number may only fall. Appending an article to turn a red check green is
prohibited: the fix for an untraced article is a named test vector, not a declaration.
`STALE UNTRACED DECLARATION` is the direction that enforces it — the moment an article acquires a
vector, its lock entry becomes a hard failure until it is deleted.

| Marker | Fires when | Driven by |
|---|---|---|
| `ARTICLE NOT REGISTERED` | an article cited in a production region has no registry element | `scripts/fixtures/legal-rules-unregistered.json` |
| `REGISTERED ARTICLE ABSENT` | a registry article no longer appears in any production region | observed against a scratchpad registry carrying a fictitious `Art. 9999` |
| `IMPLEMENTED_IN DRIFTED` | a declared `implemented_in` differs from the recomputed list | observed against a scratchpad registry with `Art. 888` repointed |
| `VECTOR MISSING` | a vector names a function that does not occur exactly once in its file | `scripts/fixtures/legal-rules-vector-missing.json` |
| `VECTOR NOT MARKED` | the `LEGAL-VECTOR` line is not inside the named function's body | observed against a scratchpad registry pointing `Art. 888` at another function |
| `MARKER NOT UNIQUE` | one article's marker line occurs more than once across `engine/` | observed against a scratchpad **copy** of `engine/` with a duplicate marker |
| `UNTRACED NOT DECLARED` | a null-vector article is absent from the lock | `scripts/fixtures/legal-rules-undeclared-untraced.json` |
| `STALE UNTRACED DECLARATION` | a lock article now has a vector | `scripts/fixtures/legal-traceability-stale.lock` |
| `TRACEABILITY SCAN UNREADABLE` | an input is missing or unparseable | a nonexistent `--rules` path |

**What this gate does not check.** It records **where** a rule is tested, never **what** a rule
requires. That distinction is what keeps it free of legal judgment: naming the existing passing test
function that already cites an article decides nothing. It also does not assert that a traced article
is *correctly* implemented — only that a named, passing test carries its marker.

---

## 19. The bugs ledger (G29)

```
node scripts/check-bugs-ledger.mjs
```

`engine/BUGS.md` is a document about numbers, and a document about numbers rots silently. Two
independent checks hold it to reality, the same split this project uses for observability:

- **`engine/tests/bugs_ledger.rs`** (behavioural, runs under gate **G1**) re-runs every entry's
  committed reproduction JSON through the current engine and fails when a recorded figure drifts by
  one centavo, and re-proves that every closed entry still conserves the estate. Its markers are
  `MISSING REPRODUCTION`, `UNKNOWN STATUS`, `HEIR SET DRIFTED`, `ACTUAL DRIFTED`,
  `OUTPUT CHECK REJECTED` and `CLOSURE INVALIDATED`.
- **this gate** (structural) validates the document's shape.

Either half alone can be satisfied by a document that lies in the other's direction, which is why
there are two.

Phase 14 reconciled the file: **BUG-001 was closed as non-reproducing** (its own committed JSON now
sums to exactly ₱30,000,000 with both disinherited children at ₱0, which is what its `### Expected`
section always asked for), and **BUG-002 was filed** against the still-open defect at
`engine/src/step7_distribute.rs:421`, where the excess of an institution over the instituted heir's
legitime is computed unconditionally — including for `ShareSpec::EntireFreePort` — so free-portion
pesos are redistributed intestate while the sum invariant still holds. **BUG-002 is documented, not
fixed, and no requirement owns its fix**; that is stated in its own `### Owning requirement` section
rather than left implicit.

| Marker | Fires when | Driven by |
|---|---|---|
| `ENTRY HEADING MALFORMED` | a `## BUG-` heading is not `## BUG-<three digits>: <title>` | observed against a scratchpad copy with a two-digit id |
| `DUPLICATE ENTRY ID` | the same BUG id appears twice | observed against a scratchpad copy with a repeated id |
| `MISSING HEADING` | an entry lacks a heading or bold field its status requires | `scripts/fixtures/bugs-missing-heading.md` |
| `UNKNOWN STATUS` | a `**Status:**` value outside `Open` and `Closed — does not reproduce` | `scripts/fixtures/bugs-unknown-status.md` |
| `OPEN WITHOUT REPRODUCTION` | an Open entry has no fenced `json` block under `### Reproduction` | `scripts/fixtures/bugs-open-without-repro.md` |
| `CLOSED WITHOUT REASON` | a closed entry has no `### Why it was closed` section | observed against a scratchpad copy with the section removed |
| `UNATTRIBUTED LEGAL CLAIM` | an `### Expected` section lacks `Quoted from .planning/research/LEGAL-CONFORMANCE.md` | observed against a scratchpad copy with the attribution replaced |
| `BUGS LEDGER UNREADABLE` | the input is missing or unreadable | a nonexistent `--file` path |

**What this gate does not check.** It never evaluates whether a legal statement in the ledger is
correct — only that every such statement carries its attribution, so no agent can slip an unsourced
reading of Philippine law into a bug entry. Whether a bug is *important* is also outside its scope.

## 20. The CLAUDE.md invariants (G30)

```
node scripts/check-claude-invariants.mjs
```

`CLAUDE.md` is the first file an implementing agent reads, and its `## Invariants an implementing
agent must not violate` section is where the rules that no test would otherwise catch live: commit
scope, gate immutability, halting over guessing, money units, one implementation per legal rule, and
what requires a lawyer. Each of the six names the command that enforces it, so none depends on an
agent remembering to be careful.

A section of prose with nothing checking it rots in three distinct ways, and this gate covers all
three. **It disappears** — `CLAUDE.md`'s middle is regenerated from `.planning/codebase/`, delimited
by `<!-- GSD:*-start -->` / `<!-- GSD:*-end -->` marker pairs, and a section that drifts inside a
span is destroyed by the next regeneration without a word. **It shrinks** — an invariant deleted or
renamed is an invariant nobody is following. **It lies** — an invariant citing a command that no gate
runs reads like enforcement while enforcing nothing, which is the worst of the three, because it buys
false confidence.

The generated spans are computed from the file on every run, never hardcoded, so adding a new
generated block to `CLAUDE.md` is covered automatically.

| Marker | Fires when | Driven by |
|---|---|---|
| `INVARIANT SECTION MISSING` | no `## Invariants an implementing agent must not violate` line | `scripts/fixtures/claude-invariants-missing.md` |
| `INVARIANT INSIDE GENERATED BLOCK` | the heading sits inside a `<!-- GSD:*-start/end -->` span | `scripts/fixtures/claude-invariants-swallowed.md` |
| `INVARIANT COUNT` | the section holds a number of invariants other than six | `scripts/fixtures/claude-invariants-short.md` |
| `INVARIANT TITLE MISSING` | an invariant's bolded title differs from the expected one at that position | `scripts/fixtures/claude-invariants-untitled.md` |
| `INVARIANT COMMAND UNGATED` | a cited command is not a `command` value in `gates.manifest.json` | `scripts/fixtures/claude-invariants-ungated.md` |
| `CLAUDE MD UNREADABLE` | an input file is missing or unparseable — **exit 2**, cannot-run | a nonexistent `--claude` path |

**When it fires.** Restore or correct the section in `CLAUDE.md`. If `INVARIANT INSIDE GENERATED
BLOCK` fires, move the section back outside every marker pair — do not add a marker around it. If
`INVARIANT COMMAND UNGATED` fires, either register the cited command as a gate or cite the command
that actually runs. The remedy is never to weaken the check, and never to delete an invariant so the
count matches.

## 21. The new-legal-rule procedure (G31)

```
node scripts/check-new-rule-procedure.mjs
```

`.planning/NEW-LEGAL-RULE.md` is the single route by which a rule the engine does not yet implement
becomes code: article → vector → failing run → one-site implementation → registration. Its
neighbouring document, `.planning/LEGAL-CORRECTION-WORKFLOW.md`, covers correcting a rule that
already exists; the two are deliberately not interchangeable.

The load-bearing part of this gate is that it does more than count headings. It **re-resolves the
document's worked example against the tree on every run**: the example names one real article, one
real engine file and one real test function, and if that function is renamed, moved, or loses its
`// LEGAL-VECTOR:` marker, the procedure goes red and says which of the four resolutions failed. The
example is anchored by article, file path and function *name*, never by a line number — Phases 5, 7
and 8 each rewrote files that a registry pointed at, so a line-number anchor is a guaranteed future
false alarm. The marker-to-function association mirrors `scripts/check-legal-traceability.mjs`
exactly: a marker belongs to the nearest **preceding** `fn` line.

| Marker | Fires when | Driven by |
|---|---|---|
| `PROCEDURE MISSING` | the `# Adding a new legal rule` heading is absent | observed against a scratchpad copy with the heading deleted |
| `STEP MISSING` | there are not exactly five `## Step N — ` headings, or a title differs | `scripts/fixtures/rule-proc-step-missing.md` |
| `STEP ORDER` | the five step headings are not in ascending numeric order | `scripts/fixtures/rule-proc-step-order.md` |
| `ARTIFACT NOT NAMED` | one of the seven required artifact strings is absent | `scripts/fixtures/rule-proc-artifact-dropped.md` |
| `WORKED EXAMPLE BROKEN` | the example's article, file or function no longer resolves | `scripts/fixtures/rule-proc-example-broken.md` |
| `PROCEDURE UNREADABLE` | an input file is missing or unparseable — **exit 2**, cannot-run | a nonexistent `--procedure` path |

**When it fires.** Repair the document. If `WORKED EXAMPLE BROKEN` fires, re-anchor the example to a
vector that still exists — pick the lowest-numbered article in `engine/legal-rules.json` with a
non-null vector, which is the same deterministic rule the example was chosen by. Never delete a step
to clear `STEP MISSING`, and never remove an artifact name to clear `ARTIFACT NOT NAMED`.
`engine/legal-traceability.lock` is **shrink-only**; appending an article to it to clear a marker is
prohibited.

## 22. Documentation claims and the debt ledger (G32)

```
node scripts/check-doc-claims.mjs
```

`CLAUDE.md`'s stack, conventions and architecture sections are copies of `.planning/codebase/*.md`,
frozen on 2026-07-27 — before any phase ran. Eleven of their claims were measurably contradicted by
the tree: the WASM binary described as not built, `wasm-pack` as not installed, `node_modules` as
absent, the Supabase project id and API port from before Phase 3 moved them, two pinned engine test
counts, "no app-wide error boundary", the wizard step index as not URL-addressable, two deleted debug
harnesses, untyped WASM errors, and a CI workflow that is no longer the only one.

The design decision that keeps this gate from rotting into a list of strings someone once believed:
**no expected value is hardcoded.** Every claim is a pair — literal strings that must be absent or
present, and a **probe measured from the tree at run time** that establishes why. A claim counts as
stale only while its probe says the code contradicts it.

The corpus is exactly `CLAUDE.md` plus `.planning/codebase/*.md`. Other root-level documents are
deliberately excluded: `README.md` states that this app "deliberately does **not** use 54321", a
correct sentence that a forbidden string would match, and a gate that turns a correct sentence red is
worse than no gate.

`.planning/DOC-DEBT.md` is the accepted-debt ledger — every contradiction Phase 15 chose not to fix,
each with an owning requirement or the explicit sentence `No requirement owns this.` It is
**shrink-only**, in the same direction as `gate-skips.lock` and `engine/legal-traceability.lock`, and
this gate holds it in both directions.

| Marker | Fires when | Driven by |
|---|---|---|
| `STALE CLAIM` | a forbidden string is present while its probe is true | `scripts/fixtures/docclaims-stale/` |
| `CLAIM UNSUPPORTED` | a required string is absent while its probe is true | `scripts/fixtures/docclaims-stale/` |
| `PROBE FLIPPED` | a probe returns false — the **code** moved back, not the document | observed by temporarily renaming `frontend/src/components/ErrorBoundary.tsx` |
| `DEBT ENTRY MISSING` | one of `D1` … `D7` has no `## D<N>` heading in the ledger | `scripts/fixtures/docclaims-debt-short/` |
| `DEBT ENTRY STALE` | a debt entry's claim anchor no longer appears; the entry must be deleted | `scripts/fixtures/docclaims-debt-stale/` |
| `DOC SCAN UNREADABLE` | a scanned document or the ledger is missing — **exit 2**, cannot-run | a nonexistent `--docroot` path |

**`PROBE FLIPPED` is the one that surprises people.** It is not a document error. It means the tree
once again matches the *old* claim — someone deleted `node_modules`, or removed the error boundary,
or reverted the wizard's URL addressability. The operator **re-measures before editing any document**,
because correcting a doc to say something false is the exact failure this gate exists to prevent.

**When `DEBT ENTRY STALE` fires**, delete the entry: its claim has been corrected, and the ledger may
only shrink. Appending a new entry to `.planning/DOC-DEBT.md` to turn a red check green is prohibited
— the fix for a stale claim is to correct the claim.

## 23. Planning-directory truth (G33)

```
node scripts/check-planning-truth.mjs
```

EXT-08 asks that a returning owner can determine current state, what is verified and what is next
from the planning directory alone. The reason they could not was measurable: every number in that
directory was written by hand at a phase boundary and never touched again. `RESUME.md` went stale
within four days of being written; the ROADMAP Progress table drifted on seven of its fifteen rows,
reporting Phase 14 as `0/TBD Not started` against six committed plans and six committed summaries;
`.planning/STATE.md`'s frontmatter said `percent: 93` while its own body printed `73%`.

So a hand-written orientation page cannot be the fix on its own. This gate is the other half: it
counts `*-PLAN.md` and `*-SUMMARY.md` files under `.planning/phases/`, reads the length of
`gates.manifest.json`'s `gates` array, and compares those derived values against the four documents a
returning owner actually reads. Nothing is hardcoded — not the phase count, not the plan count, not
the gate count.

**Phase status is derived by counting files, never judged:**

| plans | summaries | Derived status |
|---|---|---|
| 0 | 0 | `Not started` |
| > 0 | 0 | `Planned` |
| > 0 | equal to plans | `Complete` |
| > 0 | > 0 and not equal to plans | `Executed` |

A checkbox is `[x]` exactly when the derived status is `Complete`. Note what this means: a phase whose
requirements are blocked on the lawyer still reads `Complete` here, because every one of its plans has
a committed summary. The nuance is not lost — it lives in each phase's untouched prose description, in
`.planning/BLOCKED-REQUIREMENTS.md` and in `.planning/STATE.md`'s narrative. This gate deliberately
holds no opinion about whether a phase went well.

**This gate is red-on-drift by design.** When the next phase lands and the roadmap table is not
updated, the build goes red and the message names the row. The remedy is to update the row, never to
edit the gate.

**The one exemption, and why it is asymmetric.** The phase currently under execution — identified from
`.planning/STATE.md`'s `Phase: <N>` line, never guessed — necessarily moves its own row while it runs,
because each landing summary changes the numerator.

| Field | Every other phase | The in-flight phase |
|---|---|---|
| denominator (`/<plans>`) | exact equality with the `*-PLAN.md` count | exact equality with the `*-PLAN.md` count |
| numerator | exact equality with the `*-SUMMARY.md` count | may be lower than the summary count; may never exceed it |
| `Status` cell | equal to the derived status | one of the four legal values |
| checkbox | `[x]` exactly when derived status is `Complete` | `[ ]` unless numerator equals denominator |

Under-reporting the phase you are standing in is harmless — the summaries are on disk and the next
closeout corrects the row. Over-reporting is not harmless: it is a claim of work that does not exist,
which is the exact failure this check exists to catch, so `ROADMAP OVER CLAIMS` is never relaxed. The
exemption is **printed on every run**, pass or fail, as
`IN-FLIGHT PHASE <N> — numerator relaxed, denominator and over-claim still checked`, so it is never
silent. If `.planning/STATE.md` carries no `Phase:` line the gate exits 2 rather than guessing which
phase is exempt.

| Marker | Fires when | Driven by |
|---|---|---|
| `ROADMAP PLAN COUNT` | a Progress-table row's counts differ from its phase directory | `scripts/fixtures/truth-roadmap-count.md` |
| `ROADMAP OVER CLAIMS` | the in-flight row reports more completed plans than there are summaries | observed against scratchpad copies naming phase 13 in-flight with a `9/7` cell |
| `ROADMAP STATUS DISAGREES` | a row's status or checkbox differs from the derived status | `scripts/fixtures/truth-roadmap-status.md` |
| `STATE PLAN COUNT` | a `progress:` counter differs from the derived value | `scripts/fixtures/truth-state-counts.md` |
| `STATE PERCENT DRIFT` | `percent` or the body's progress-bar percentage disagrees | `scripts/fixtures/truth-state-counts.md` |
| `ORIENTATION POINTER BROKEN` | a named path does not resolve, or a required path is absent | `scripts/fixtures/truth-orientation-pointer.md` |
| `ORIENTATION GATE COUNT` | a stated gate count differs from `gates.manifest.json` | `scripts/fixtures/truth-orientation-gates.md` |
| `PLANNING TRUTH UNREADABLE` | an input is missing or unparseable — **exit 2**, cannot-run | a nonexistent `--roadmap` path |

**When it fires.** Update the document the message names. Never edit this gate, and never delete a
phase directory or a summary file to make a count match.
