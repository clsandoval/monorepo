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

| id | order | name | command (run from `apps/inheritance`) | what it proves |
|---|---:|---|---|---|
| G1 | 1 | engine tests | `cd engine && cargo test` | The Rust succession engine's 442 unit, integration, and fuzz-invariant tests pass. |
| G2 | 2 | wasm build | `bash engine/build-wasm.sh` | The engine compiles to WebAssembly and lands a real binary in `frontend/src/wasm/pkg/`, verified by existence, a 100 KB size floor, and the `0061736d` magic number. |
| G3 | 3 | frontend suite vs ledger | `cd frontend && npm run test:gate` | The complete, unmodified 2,416-test Vitest suite runs and its failure set exactly equals the known-failure ledger. |
| G4 | 4 | typecheck | `cd frontend && npx tsc -b --force` | Zero TypeScript errors, with `--force` so a stale `tsconfig.tsbuildinfo` cannot mask them. |

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
