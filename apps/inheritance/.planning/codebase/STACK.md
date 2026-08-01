# Technology Stack

**Analysis Date:** 2026-07-27

## Languages

**Primary:**
- Rust (edition 2021) — succession engine, `apps/inheritance/engine/src/*.rs` (~15,676 LOC across 15 files; step1-step10 pipeline + `fraction.rs`, `types.rs`, `pipeline.rs`, `wasm.rs`)
- TypeScript / TSX — frontend, `apps/inheritance/frontend/src/` (~63,250 LOC), includes a second, independent estate-tax computation engine written entirely in TS at `apps/inheritance/frontend/src/lib/estate-tax-engine/` (14 modules + `__tests__/`)

**Secondary:**
- SQL (PL/pgSQL) — Supabase migrations, `apps/inheritance/frontend/supabase/migrations/*.sql` (9 files, largest is `010_rls_org_scope.sql` at 492 lines, defines RLS policies)
- Bash / Python — engine test-case generators, `apps/inheritance/engine/examples/generate-test-cases.sh`, `generate-fuzz-cases.py`, `generate-testate-cases.py`, `validate.py`, `validate-testate.py`

## Runtime

**Environment (observed in this tree):**
- Rust: `rustc 1.96.0` / `cargo 1.96.0` (installed via rustup, toolchain `stable-x86_64-unknown-linux-gnu`)
- Node.js: `v20.19.5` present; `npm 10.8.2` present
- No `.nvmrc` / `.node-version` file in `apps/inheritance/frontend/` — Node version is not pinned in-repo. Both workflows install Node explicitly via `actions/setup-node@v4`: the gate workflow `.github/workflows/inheritance-ci.yml`, which runs `bash scripts/ci-gates.sh` on every push and pull request touching `apps/inheritance/**`, and the older agent-loop workflow `.github/workflows/inheritance.yml`.

**Package Manager:**
- **npm** is the actual package manager for the frontend: `apps/inheritance/frontend/package-lock.json` (460KB, committed) is present; no `pnpm-lock.yaml` or `yarn.lock` exists anywhere under `apps/inheritance/`.
- **Discrepancy (agent-loop workflow only):** `.github/workflows/inheritance.yml` installs `pnpm` globally (`npm install -g pnpm`) but the loop scripts it triggers never actually invoke `pnpm install` against this frontend in a way that matches the npm lockfile — the lockfile in the tree is npm's. The gate workflow `.github/workflows/inheritance-ci.yml` does the right thing and uses `npm ci` in `apps/inheritance/frontend/`, via `bash scripts/setup-env.sh`.
- Rust: `Cargo.lock` is committed at `apps/inheritance/engine/Cargo.lock`.

**Toolchain prerequisites to build every artifact:**

| Artifact | Requires | Observed state in this tree |
|---|---|---|
| Rust engine native binary/tests (`cargo test`, `cargo build`) | `rustc`/`cargo` 1.96+, no extra target | **Works.** `engine/target/debug/` already has build artifacts from a prior native build. |
| Rust engine WASM binary (`inheritance_engine_bg.wasm`) | `rustup target add wasm32-unknown-unknown` + `wasm-pack`, both installed by `bash scripts/setup-env.sh` | **Built by `bash engine/build-wasm.sh`**, which is gate G2's command. It emits `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` alongside the tracked glue files `inheritance_engine.js` and `inheritance_engine.d.ts`. The binary is a build artifact and is gitignored, so a fresh checkout runs `bash engine/build-wasm.sh` before any WASM-dependent test. |
| Frontend dev/build/test (`npm run dev`/`build`/`test`) | Node 20, npm, `npm ci` in `frontend/` | **Runnable.** `npm ci` in `frontend/` is performed by `bash scripts/setup-env.sh`; `frontend/node_modules/` is populated and `npx tsc -b --force` resolves the local TypeScript. |
| wasm-bindgen version pin | wasm-bindgen CLI bundled inside wasm-pack must match `Cargo.toml`/`Cargo.lock` version | `Cargo.lock` pins `wasm-bindgen = 0.2.114`. `engine/Cargo.toml` specifies `wasm-bindgen = "0.2"` (unpinned minor). A wasm-pack install with a mismatched bundled wasm-bindgen version will fail the build (documented risk in `loops/reverse/v2/analysis/wasm-export.md`). |

## Frameworks

**Core:**
- React 19.2.4 + ReactDOM 19.2.4 — `apps/inheritance/frontend/package.json`
- TanStack Router 1.163.3 (`@tanstack/react-router`, `@tanstack/router-devtools`) — file-based routes in `apps/inheritance/frontend/src/routes/`
- Tailwind CSS 4.2.1 via `@tailwindcss/vite` plugin — no separate `tailwind.config.js`, config is CSS-first (Tailwind v4 style)
- Radix UI (`radix-ui` 1.4.3) + `class-variance-authority` + shadcn CLI (`shadcn` 3.8.5, dev dep) for component generation — `apps/inheritance/frontend/components.json`

**Testing:**
- Vitest 4.0.18 (frontend) — config `apps/inheritance/frontend/vitest.config.ts` (jsdom environment, setup file `src/test-setup.ts`, 10s test/hook timeout)
- `@testing-library/react` 16.3.2, `@testing-library/jest-dom` 6.9.1, `@testing-library/user-event` 14.6.1
- Rust built-in test harness (`#[test]`) — inline unit tests in `engine/src/*.rs` plus the integration crates now in `engine/tests/`: `integration.rs`, `fuzz_invariants.rs`, `observability.rs`, `defect_ledger.rs`, `bugs_ledger.rs` and the shared `common/` helpers. `cd engine && cargo test` reports the current count; no number is written here, because a pinned count goes stale on the next test added.

**Build/Dev:**
- Vite 7.3.1 — `apps/inheritance/frontend/vite.config.ts`, plugins: `@tailwindcss/vite`, `@vitejs/plugin-react`, `vite-plugin-wasm`, `vite-plugin-top-level-await`; build target `esnext`; path alias `@` → `src/`
- TypeScript 5.9.3, `tsc -b` (project-references build, used as the typecheck step before `vite build`)
- `tsx` 4.21.0 — runs `scripts/generate-sitemap.ts` as a `postbuild` step (generates static `sitemap.xml` listing hardcoded marketing/blog routes with `BASE_URL = https://inheritance-frontend.fly.dev`)
- wasm-bindgen 0.2 (Rust side) + `vite-plugin-wasm` (frontend side) — glue layer between Rust and browser

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.98.0 — sole backend client; all data access, auth, and storage go through this
- `num-rational` / `num-bigint` / `num-traits` / `num-integer` (Rust) — exact rational-number arithmetic for legitime/share fractions, no floating point in the succession engine (`engine/src/fraction.rs`, 512 LOC)
- `zod` 4.3.6 — runtime schema validation for `EngineInput`/forms, `apps/inheritance/frontend/src/schemas/`
- `react-hook-form` 7.71.2 + `@hookform/resolvers` 5.2.2 — all intake/wizard forms
- `@react-pdf/renderer` 4.3.2 — client-side PDF generation (distribution summary, tax computation, demand letter)

**Infrastructure:**
- `thiserror` 2 (Rust) — structured engine error types
- `serde` / `serde_json` (Rust) — JSON in/out across the WASM boundary (`compute_json` in `engine/src/wasm.rs`)
- `jszip` 3.10.1 — client-side zip bundling (likely for multi-document export)
- `react-d3-tree` 3.6.6 — family-tree visualization
- `recharts` 3.7.0 — charts (e.g. estate-tax sensitivity visualizations)
- `sonner` 2.0.7 — toast notifications
- `qrcode.react` 4.2.0 — QR codes for share links

## Configuration

**Environment:**
- Vite env vars, prefixed `VITE_`, read via `import.meta.env` in `apps/inheritance/frontend/src/lib/supabase.ts`
- Example file: `apps/inheritance/frontend/.env.local.example` — lists:
  - `VITE_SUPABASE_URL` (required)
  - `VITE_SUPABASE_ANON_KEY` (required)
  - `VITE_APP_URL` (required — used for share links, QR codes, password-reset email links)
  - `VITE_BILLING_URL` (optional, commented out — used in `InviteMemberDialog` seat-limit CTA)
- No `.env` file exists in the tree (only the `.example`); actual secrets are not present in this repo checkout.
- `supabaseConfigured` boolean guard in `src/lib/supabase.ts` — client is `null` if URL/key env vars are missing, and calling code must check this before use.

**Build:**
- `apps/inheritance/frontend/vite.config.ts`, `tsconfig.json` (strict mode, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, path alias `@/*` → `./src/*`), `vitest.config.ts`
- `apps/inheritance/frontend/components.json` — shadcn component generator config
- `apps/inheritance/engine/Cargo.toml` — `crate-type = ["cdylib", "rlib"]` (both required: `rlib` for `cargo test`, `cdylib` for `wasm-pack build`)
- No ESLint, Prettier, or Biome config anywhere in `apps/inheritance/frontend/` — **no lint tooling exists**, and `package.json` has no `lint` script.

## Platform Requirements

**Development:**
- Rust stable toolchain + `wasm32-unknown-unknown` target + `wasm-pack`, all installed by `bash scripts/setup-env.sh` and exercised by `bash engine/build-wasm.sh`
- Node.js 20.x + npm; `bash scripts/setup-env.sh` runs `npm ci` in `frontend/` so `node_modules` is populated
- Local Supabase stack via Supabase CLI (`apps/inheritance/frontend/supabase/config.toml`, `project_id = "inheritance"`, API port 55321, DB port 55322, Studio, Inbucket for local email testing). The whole port block was moved up in Phase 3 so it cannot collide with a sibling monorepo app already holding the default range.

**Production:**
- Frontend deployed as a static build served by nginx in a Docker container on Fly.io:
  - `apps/inheritance/frontend/Dockerfile`: `FROM nginx:alpine`, copies `dist/` and `nginx.conf`, exposes port 8080
  - `apps/inheritance/frontend/nginx.conf`: SPA fallback (`try_files ... /index.html`), 1-year immutable caching for `/assets/`, gzip includes `application/wasm`
  - `apps/inheritance/frontend/fly.toml`: app `inheritance-frontend`, region `sin` (Singapore), 1 shared CPU / 1GB VM, `auto_stop_machines`/`auto_start_machines` enabled, `min_machines_running = 0`
- Backend is Supabase-hosted (managed Postgres + Auth + Storage + Realtime), no separate application server — this is a pure client-side SPA talking directly to Supabase.

## Build/Test/Lint Commands — current working state

| Command | Where | What it does | Currently works in this tree? |
|---|---|---|---|
| `npm run dev` | `frontend/` | `vite` dev server | Yes — after `bash scripts/setup-env.sh`, which runs `npm ci` in `frontend/` |
| `npm run build` | `frontend/` | `tsc -b && vite build`, then `postbuild` runs `tsx scripts/generate-sitemap.ts` | Yes — after `bash scripts/setup-env.sh` and `bash engine/build-wasm.sh`, which puts the real `.wasm` binary in `src/wasm/pkg/` |
| `npm run test` | `frontend/` | `vitest run` | Yes — after `bash scripts/setup-env.sh` |
| `npm run test:watch` | `frontend/` | `vitest` watch mode | Yes — same precondition |
| `npm run preview` | `frontend/` | `vite preview` (serves `dist/`) | No — requires prior successful build |
| *(no lint script)* | `frontend/` | — | N/A — no lint tooling configured |
| `cargo test` / `cargo test --lib` | `engine/` | Runs Rust unit + doc tests | **Yes.** Run `cd engine && cargo test` for the current pass/fail count; no count is written here, because a pinned number goes stale on the next test added. |
| `cargo test --test integration` | `engine/` | Runs `engine/tests/integration.rs` (TV-series scenario tests) | **Yes.** Run `cd engine && cargo test` for the current count. |
| `cargo build` / `cargo build --release` | `engine/` | Native build (`rlib`+`cdylib`, but no wasm target) | Yes — native debug artifacts already present in `engine/target/debug/` |
| `bash engine/build-wasm.sh` | app root | Wraps `wasm-pack build --target web`, emitting `inheritance_engine_bg.wasm` + JS glue straight into `frontend/src/wasm/pkg/` | **Yes** — this is gate G2's command. The toolchain it needs (`wasm32-unknown-unknown`, `wasm-pack`) is installed by `bash scripts/setup-env.sh`. |
| `bash examples/generate-test-cases.sh` | `engine/` | Builds release binary, generates/validates JSON test cases into `examples/cases/`, writes `examples/test-results.md` | Not verified in this pass; requires `cargo build --release` |

---

*Stack analysis: 2026-07-27*
