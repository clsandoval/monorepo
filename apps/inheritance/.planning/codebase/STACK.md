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
- No `.nvmrc` / `.node-version` file in `apps/inheritance/frontend/` — Node version is not pinned in-repo. CI (`.github/workflows/inheritance.yml`) explicitly installs `node-version: 20` via `actions/setup-node@v4`.

**Package Manager:**
- **npm** is the actual package manager for the frontend: `apps/inheritance/frontend/package-lock.json` (460KB, committed) is present; no `pnpm-lock.yaml` or `yarn.lock` exists anywhere under `apps/inheritance/`.
- **Discrepancy:** `.github/workflows/inheritance.yml` installs `pnpm` globally (`npm install -g pnpm`) but the loop scripts it triggers never actually invoke `pnpm install` against this frontend in a way that matches the npm lockfile — the lockfile in the tree is npm's. Any gate that installs deps should use `npm ci` in `apps/inheritance/frontend/`, not pnpm.
- Rust: `Cargo.lock` is committed at `apps/inheritance/engine/Cargo.lock`.

**Toolchain prerequisites to build every artifact:**

| Artifact | Requires | Observed state in this tree |
|---|---|---|
| Rust engine native binary/tests (`cargo test`, `cargo build`) | `rustc`/`cargo` 1.96+, no extra target | **Works.** `engine/target/debug/` already has build artifacts from a prior native build. |
| Rust engine WASM binary (`inheritance_engine_bg.wasm`) | `rustup target add wasm32-unknown-unknown` + `wasm-pack` (installed via `curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf \| sh` or `cargo install wasm-pack`) | **NOT built.** `rustup target list --installed` shows only `x86_64-unknown-linux-gnu` — `wasm32-unknown-unknown` is available to add but not installed. `wasm-pack` is **not installed** (`which wasm-pack` → not found). `apps/inheritance/frontend/src/wasm/pkg/` contains only the tracked glue files `inheritance_engine.js` and `inheritance_engine.d.ts` — **no `.wasm` binary file exists in that directory.** Any gate relying on real WASM output must run `rustup target add wasm32-unknown-unknown && cargo install wasm-pack && wasm-pack build --target web` inside `engine/` first. |
| Frontend dev/build/test (`npm run dev`/`build`/`test`) | Node 20, npm, `npm ci` in `frontend/` | **NOT runnable as-is.** `apps/inheritance/frontend/node_modules/` is **absent**. `npx tsc -b` fails with "This is not the tsc command you are looking for" (no local install, npx falls through). Must run `npm ci` (or `npm install`) in `frontend/` before any command works. |
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
- Rust built-in test harness (`#[test]`) — 450 `#[test]` functions total across `engine/src/*.rs` (unit tests) + `engine/tests/integration.rs`, `zz_probe.rs`, `zz_sweep.rs`, `fuzz_invariants.rs`

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
- Rust stable toolchain + `wasm32-unknown-unknown` target + `wasm-pack` (none of the WASM-specific pieces are currently installed in this environment)
- Node.js 20.x + npm (frontend `node_modules` must be installed fresh — currently absent)
- Local Supabase stack via Supabase CLI (`apps/inheritance/frontend/supabase/config.toml`, project id `"app"`, API port 54321, DB port 54322, Studio, Inbucket for local email testing)

**Production:**
- Frontend deployed as a static build served by nginx in a Docker container on Fly.io:
  - `apps/inheritance/frontend/Dockerfile`: `FROM nginx:alpine`, copies `dist/` and `nginx.conf`, exposes port 8080
  - `apps/inheritance/frontend/nginx.conf`: SPA fallback (`try_files ... /index.html`), 1-year immutable caching for `/assets/`, gzip includes `application/wasm`
  - `apps/inheritance/frontend/fly.toml`: app `inheritance-frontend`, region `sin` (Singapore), 1 shared CPU / 1GB VM, `auto_stop_machines`/`auto_start_machines` enabled, `min_machines_running = 0`
- Backend is Supabase-hosted (managed Postgres + Auth + Storage + Realtime), no separate application server — this is a pure client-side SPA talking directly to Supabase.

## Build/Test/Lint Commands — current working state

| Command | Where | What it does | Currently works in this tree? |
|---|---|---|---|
| `npm run dev` | `frontend/` | `vite` dev server | No — `node_modules` absent, needs `npm ci` first |
| `npm run build` | `frontend/` | `tsc -b && vite build`, then `postbuild` runs `tsx scripts/generate-sitemap.ts` | No — same reason; also needs the WASM `.wasm` binary present in `src/wasm/pkg/` for a real (non-mock) build, though Vite may still bundle if code only imports the glue JS without the binary present |
| `npm run test` | `frontend/` | `vitest run` | No — `node_modules` absent |
| `npm run test:watch` | `frontend/` | `vitest` watch mode | No — same |
| `npm run preview` | `frontend/` | `vite preview` (serves `dist/`) | No — requires prior successful build |
| *(no lint script)* | `frontend/` | — | N/A — no lint tooling configured |
| `cargo test` / `cargo test --lib` | `engine/` | Runs Rust unit + doc tests | **Yes — verified: 411 tests pass** (`cargo test --lib`) |
| `cargo test --test integration` | `engine/` | Runs `engine/tests/integration.rs` (TV-series scenario tests) | **Yes — verified: 30 tests pass** |
| `cargo build` / `cargo build --release` | `engine/` | Native build (`rlib`+`cdylib`, but no wasm target) | Yes — native debug artifacts already present in `engine/target/debug/` |
| `wasm-pack build --target web` | `engine/` | Produces `inheritance_engine_bg.wasm` + JS glue into `pkg/` (copy step needed to sync into `frontend/src/wasm/pkg/`) | **No — `wasm-pack` not installed, `wasm32-unknown-unknown` target not installed.** Must install both before this can run. |
| `bash examples/generate-test-cases.sh` | `engine/` | Builds release binary, generates/validates JSON test cases into `examples/cases/`, writes `examples/test-results.md` | Not verified in this pass; requires `cargo build --release` |

---

*Stack analysis: 2026-07-27*
