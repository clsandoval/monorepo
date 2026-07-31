# Inheritance

A Philippine inheritance and estate-tax computation product for lawyers: a Rust succession engine
(Civil Code Book III) compiled to WASM, plus a React frontend that also contains a second,
independent TypeScript NIRC estate-tax engine. It walks a lawyer from family facts to per-heir peso
amounts with citable narratives and a printable PDF.

For full project context — architecture, conventions, the verification-first goal, and the rule that
no agent may decide a contested point of Philippine law — see [`CLAUDE.md`](./CLAUDE.md).

## Clean checkout to green gates

Run these four commands in order. Steps 1 and 2 are one-time toolchain setup.

1. Add the WASM compilation target (from anywhere):

   ```bash
   rustup target add wasm32-unknown-unknown
   ```

2. Install `wasm-pack` (from anywhere):

   ```bash
   cargo install wasm-pack
   ```

3. Install the frontend dependencies (from `apps/inheritance/frontend`):

   ```bash
   npm ci
   ```

4. Run every gate (from `apps/inheritance`):

   ```bash
   bash scripts/ci-gates.sh
   ```

The fourth command runs all four gates and prints `ALL GATES PASSED (4/4)` on success. It is the
exact command CI executes, so a green result there is what the CI check verifies — nothing is
reproducible only on a push.

You do not need to build the WASM artifact separately: gate 2 does it. Note that
`frontend/src/wasm/pkg/inheritance_engine_bg.wasm` is a build artifact and is gitignored, so a clean
checkout has no WASM binary until a build runs.

## The four gates

| Gate | Command | What it proves |
|---|---|---|
| 1. Engine tests | `cd engine && cargo test` | The Rust succession engine's 442 unit, integration, and fuzz-invariant tests pass. |
| 2. WASM build | `bash engine/build-wasm.sh` | The engine compiles to WebAssembly and lands a real binary in `frontend/src/wasm/pkg/`. The script verifies existence, a 100 KB size floor, and the `0061736d` WebAssembly magic number — `wasm-pack` exiting 0 is not accepted as proof on its own. |
| 3. Frontend suite | `cd frontend && npm run test:gate` | The complete, unmodified 2,416-test Vitest suite runs and its failure set exactly equals the known-failure ledger. See below. |
| 4. Typecheck | `cd frontend && npx tsc -b --force` | Zero TypeScript errors. `--force` is required, not optional: `tsconfig.tsbuildinfo` was historically committed, and an incremental run can no-op against a stale cache and report clean on a tree that has type errors. |

`bash scripts/ci-gates.sh --only <1-4>` runs a single gate for local iteration. There is no option
for omitting a gate — you cannot run "all gates except one" and get a success message.

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
