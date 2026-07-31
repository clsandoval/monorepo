# Inheritance

A Philippine inheritance and estate-tax computation product for lawyers: a Rust succession engine
(Civil Code Book III) compiled to WASM, plus a React frontend that also contains a second,
independent TypeScript NIRC estate-tax engine. It walks a lawyer from family facts to per-heir peso
amounts with citable narratives and a printable PDF.

For full project context — architecture, conventions, the verification-first goal, and the rule that
no agent may decide a contested point of Philippine law — see [`CLAUDE.md`](./CLAUDE.md).

## Clean checkout to a working environment

**One command performs the whole bring-up**, from `apps/inheritance`:

```bash
bash scripts/setup-env.sh
```

It performs exactly these nine steps, in order, and is safe to re-run:

1. **Docker preflight** — confirms a Docker daemon is reachable, and refuses to touch any container
   whose name does not end in `_inheritance`.
2. **`rustup target add wasm32-unknown-unknown`** — the WASM compilation target.
3. **`cargo install wasm-pack`** — the WASM bundler, skipped when already present.
4. **`npm ci`** in `frontend/` — the frontend dependencies, from the committed lockfile.
5. **Supabase CLI pinned to `2.110.0`** — installed to `~/.local/bin` from the pinned release
   tarball, never "latest".
6. **`supabase start`** — brings the local Postgres, Auth, Storage, Studio and Inbucket stack up on
   this app's own port block.
7. **Writes `frontend/.env.local`** — the local API URL and anon key, read back from the running
   stack rather than guessed.
8. **`bash engine/build-wasm.sh`** — compiles the Rust engine to WebAssembly and verifies the
   artifact's existence, a 100 KB size floor, and the `0061736d` WebAssembly magic number.
9. **`node scripts/check-env-ready.mjs`** — the read-only verdict on whether the environment is
   actually usable.

### Prerequisites

**Docker is the one thing the script does not install.** Installing a container runtime changes
system state outside this repository — it is a system-administration act, not something a repo
script has the authority to perform on a developer's machine. Everything else in the list above is
installed for you.

### Ports

This app uses its own block. `frontend/supabase/config.toml` declares:

| Service | Port |
|---|---|
| API | 55321 |
| Database | 55322 |
| Studio | 55323 |
| Inbucket (local email) | 55324 |
| Analytics | 55327 |
| Shadow database | 55320 |
| Pooler | 55329 |

This app deliberately does **not** use 54321 through 54324: five sibling apps in this monorepo
declare those ports in their own `config.toml`, and one of them is typically running. The collision
is resolved by moving, never by stopping somebody else's containers.

### Database, seed data and storage

From `frontend/`:

```bash
supabase db reset
```

That applies every migration in `supabase/migrations/` and then runs `supabase/seed.sql`. The seed
creates **two** organizations with fixed ids published in
[`frontend/supabase/fixtures.json`](./frontend/supabase/fixtures.json), so later gates can reference
a known org, user and case by id — and so tenant-isolation tests have a second tenant to be excluded
from. Every seeded user shares the password `test-password-123`.

Migration `013_storage_buckets.sql` creates the `firm-logos` storage bucket and its RLS policies, so
**no bucket ever needs creating by hand in the dashboard**.

### Verifying the environment

```bash
node scripts/check-env-ready.mjs
```

It prints `ENV READY` when the environment is up, or `ENV NOT READY` with the specific named reason
when it is not. It is strictly read-only: it never starts, resets, installs or repairs anything.

### Then run the gates

```bash
bash scripts/ci-gates.sh
```

This prints `ALL GATES PASSED (10/10)` on success. It is the exact command CI executes, so a green
result locally is what the CI check verifies — nothing is reproducible only on a push.

You do not need to build the WASM artifact separately: gate G2 does it. Note that
`frontend/src/wasm/pkg/inheritance_engine_bg.wasm` is a build artifact and is gitignored, so a clean
checkout has no WASM binary until a build runs.

## The ten gates

The gate list is not hardcoded in the runner. It lives in `gates.manifest.json`, and
`scripts/ci-gates.sh` iterates it in `order`. The three cheap meta-gates run first, so a tampered
manifest or an open-world plan is caught in seconds rather than after a five-minute build. See
[`GATES.md`](./GATES.md).

| Gate | Command | What it proves |
|---|---|---|
| G5. Gate manifest integrity | `node scripts/check-gate-manifest.mjs` | The frozen gate set has not shrunk, had a locked command changed, or stopped blocking. The gate set may only grow. |
| G6. Plan closed-world lint | `node scripts/check-plan-closed-world.mjs` | Every plan file is closed-world by the nine rules in `.planning/PLAN-STANDARD.md` — no hedge phrasing, no request to decide law, no ungrounded requirement id. |
| G7. Commit discipline audit | `node scripts/check-commit-discipline.mjs` | No commit since project init mixes `apps/inheritance/` with paths outside it. |
| G1. Engine tests | `cd engine && cargo test` | The Rust succession engine's 442 unit, integration, and fuzz-invariant tests pass. |
| G2. WASM build | `bash engine/build-wasm.sh` | The engine compiles to WebAssembly and lands a real binary in `frontend/src/wasm/pkg/`. The script verifies existence, a 100 KB size floor, and the `0061736d` WebAssembly magic number — `wasm-pack` exiting 0 is not accepted as proof on its own. |
| G3. Frontend suite | `cd frontend && npm run test:gate` | The complete, unmodified 2,416-test Vitest suite runs and its failure set exactly equals the known-failure ledger. See below. |
| G4. Typecheck | `cd frontend && npx tsc -b --force` | Zero TypeScript errors. `--force` is required, not optional: `tsconfig.tsbuildinfo` was historically committed, and an incremental run can no-op against a stale cache and report clean on a tree that has type errors. |
| G10. Lawyer decision registry | `node scripts/check-lawyer-agenda.mjs` | Every recorded interpretive choice exists in both the agenda and the registry, still resolves to the rule it governs, and cannot have its status advanced without a recorded answer. See [`GATES.md`](./GATES.md) section 8. |
| G8. Gate skip accounting | `node scripts/check-gate-skips.mjs` | Every gate reports how many of its own assertions it skipped, and every skip is declared in the shrink-only `gate-skips.lock` ledger. See [`GATES.md`](./GATES.md) section 5. |
| G9. Published gate results | `node scripts/check-gate-results.mjs` | `gate-results.json` describes the current run, covers every manifest gate, and never reports a status outside `pass`, `fail`, `cannot-run` and `not-run`. See [`GATES.md`](./GATES.md) section 6. |

`bash scripts/ci-gates.sh --only <gate-id>` (for example `--only G5`) runs a single gate for local
iteration, and its final line says explicitly that the run was partial. There is no option
for omitting a gate — you cannot run "all gates except one" and get a success message.

### Exit codes

The runner has three exit values, because a gate that *failed* and a gate that *could not run* are
opposite situations:

| Exit | Meaning | Marker |
|---:|---|---|
| 0 | Every gate ran and passed | `ALL GATES PASSED (n/n)` |
| 1 | A gate ran and failed | `GATE FAILED: <id> (exit <rc>)` |
| 2 | A gate could not run at all | `GATE CANNOT RUN: <id>` + `HALT: <reason>` |

Exit 2 is a halt: report BLOCKED with the real command output rather than editing a gate to clear
it. Full detail, including the `.gate-runs/latest.json` run record, is in [`GATES.md`](./GATES.md).

## Legal decisions

`.planning/LAWYER-AGENDA.md` is the lawyer-facing review agenda: eight interpretive choices the
engine has already made, each stating the engine's current reading and the exact question posed, and
each answered by ticking one of three boxes. `.planning/lawyer-decisions.json` is the same eight
decisions in a fixed fourteen-key schema, anchored to the rule each one governs, and it is what gate
G10 checks — a status cannot advance without `answered_by`, `answered_on` and `answer` attached.
`.planning/LEGAL-CORRECTION-WORKFLOW.md` is the procedure followed when the lawyer answers an entry
or says an output is wrong: record the claim, name a `TV-L<NN>` vector, watch it fail, fix in one
place, close the loop.

| Document | Audience | Enforced by |
|---|---|---|
| `.planning/LAWYER-AGENDA.md` | the lawyer — this is what gets answered | G10, `node scripts/check-lawyer-agenda.mjs` |
| `.planning/lawyer-decisions.json` | the gate — the machine-readable copy | G10, `node scripts/check-lawyer-agenda.mjs` |
| `.planning/LEGAL-CORRECTION-WORKFLOW.md` | whoever is holding a correction | procedure, not a gate |

No agent may decide a contested point of Philippine law. See [`GATES.md`](./GATES.md) section 8.

## Published results

`gate-results.json` at the app root is regenerated by every gate run and is **committed**. It carries
each gate's name, `proves` text, requirement ids, status, exit code, timings and skip counts, plus a
per-requirement roll-up, so a status page can render the whole gate set without reading the manifest.

The four statuses `pass`, `fail`, `cannot-run` and `not-run` are copied verbatim from the run record;
nothing collapses into a pass. It is published after every gate and from the runner's EXIT trap, so
the file is current after a failure and after a halt, not only after a green run. Gate G9 rejects it
if it is stale, incomplete, or carries a status this project does not use. See
[`GATES.md`](./GATES.md) section 6.

## Is the loop healthy

Open [`LOOP-STATUS.md`](./LOOP-STATUS.md) first. It is committed, regenerated by every full gate
run, and leads with one of four states:

| State | Meaning |
|---|---|
| `GREEN` | The last run executed every gate in the manifest and passed. |
| `RED` | A gate ran and failed. |
| `BLOCKED — NEEDS OWNER ATTENTION` | A gate could not run. Report BLOCKED; do not edit the gate. |
| `STALLED — NEEDS OWNER ATTENTION` | The loop is repeating a failure and needs a human decision. |

For a scripted answer:

```bash
node scripts/loop-status.mjs check
```

It prints `LOOP STATUS <STATE>` and exits 1 only when the state is `STALLED`. It is deliberately not
run by `scripts/ci-gates.sh` — see [`GATES.md`](./GATES.md) section 4 for why, and for the stall
rule itself.

## Known test failures

`frontend/test-baseline.json` records every currently-known-failing frontend test by file and full
test name. **There are 46**, across 11 files.

`npm run test:gate` runs the whole suite unmodified and fails on any of:

- a failing test that is **not** in the ledger (`UNKNOWN FAILURE`);
- a ledgered test that has started **passing** (`STALE BASELINE`) — this forces the ledger to shrink
  rather than rot;
- **any** skipped, pending, or todo test (`SKIPPED TESTS`) — plain `npm test` reports a skip as
  green, which this project does not accept;
- the total collected test count dropping below the floor (`TEST COUNT DROPPED`).

Two rules govern the ledger:

- **The ledger may only shrink.**
- **Adding an entry to make the build pass is prohibited.** Fix the regression instead. The gate
  script cannot write the ledger, and it has no update flag, by design.

The largest single cluster is `src/routes/settings/__tests__/team.test.tsx` with 12 entries. That
one is a **genuine product bug** — an undefined import/export in the `/settings/team` route tree
producing `Element type is invalid ... got: undefined` — not a test-authoring artifact. The
remainder are Radix-Select-versus-testing-library query mismatches, copy drift, and one
test-versus-implementation disagreement about whether `lib/supabase.ts` should throw on missing env
vars.

## Committing in this repo

This app lives inside a monorepo that has a concurrent auto-committer running against it. Every
commit must therefore stage **explicit file paths**. `git add -A`, `git add .`, and `git commit -a`
are prohibited — a broad stage will absorb unrelated in-flight work that is not yours.

Use the wrapper. It is the shortest path as well as the safe one:

```bash
bash scripts/safe-commit.sh -m "<message>" <path> ...
```

`scripts/safe-commit.sh` refuses every broad-stage form (`-A`, `--all`, `-a`, `.`, `:/`, `*`),
refuses any path outside `apps/inheritance/` other than `.github/workflows/inheritance-ci.yml`,
refuses to commit on top of a pre-populated index (someone else staged that), and verifies that the
staged set is exactly what you asked for before it commits — unstaging and aborting if the stage
reached further.

`node scripts/check-commit-discipline.mjs` audits every commit since project init and fails on any
commit that touches `apps/inheritance/` together with paths outside it. It filters by path scope,
never by author: a commit where the auto-committer's stage swallowed our work is precisely the
commit that must be surfaced, so hiding it behind an author filter would defeat the audit.
