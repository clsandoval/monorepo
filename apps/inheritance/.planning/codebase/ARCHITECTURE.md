<!-- refreshed: 2026-07-27 -->
# Architecture

**Analysis Date:** 2026-07-27

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  BROWSER — React 19 + TanStack Router SPA                                │
│  `frontend/src/`                                                         │
├───────────────┬───────────────────┬───────────────────┬─────────────────┤
│  Public/       │  Auth-gated case  │  Estate-tax        │  Results /      │
│  Marketing     │  workflow          │  workflow          │  Export         │
│  routes        │  `routes/cases/*` │  `routes/cases/    │  `components/   │
│  `routes/      │  `components/     │  $caseId.tax.tsx`  │  results/*`,    │
│  landing|blog` │  wizard/*`,        │  `components/tax/  │  `lib/pdf-      │
│                │  `components/     │  tabs/*`, `lib/    │  export.ts`     │
│                │  intake/*`        │  estate-tax-engine`│                 │
└───────┬────────┴─────────┬─────────┴─────────┬──────────┴────────┬───────┘
        │                  │                   │                    │
        │                  ▼                   ▼                    │
        │      ┌────────────────────┐  ┌──────────────────────┐     │
        │      │ WASM BOUNDARY      │  │ TS Estate-Tax Engine │     │
        │      │ `wasm/bridge.ts`   │  │ (in-process, no WASM)│     │
        │      │  → Rust succession │  │ `lib/estate-tax-     │     │
        │      │  engine compiled   │  │  engine/pipeline.ts` │     │
        │      │  to WASM           │  │  (14 phases)         │     │
        │      │  `engine/src/*`    │  └──────────┬───────────┘     │
        │      │  (10-step pipeline)│             │                 │
        │      └─────────┬──────────┘             │ tax-bridge.ts   │
        │                │                        │ (net estate     │
        │                │◄───────────────────────┘  → re-run        │
        │                │        engine)                            │
        ▼                ▼                                           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Supabase (Postgres + RLS + Auth + Storage)                              │
│  `frontend/supabase/migrations/`                                         │
│  Tables: organizations, organization_members, organization_invitations,  │
│  user_profiles, clients, cases, case_notes, case_deadlines,              │
│  case_documents, conflict_check_log                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

Two independently-implemented computation engines exist:

1. **Succession engine** — Rust, `engine/src/`, compiled to WASM (`frontend/src/wasm/pkg/inheritance_engine.js` + `.wasm`), invoked via `frontend/src/wasm/bridge.ts`. Computes per-heir inheritance distribution (legitimes, free portion, representation, collation).
2. **Estate-tax engine** — pure TypeScript, `frontend/src/lib/estate-tax-engine/`, runs synchronously in the main JS thread (no WASM, no async boundary). Computes BIR Form 1801 estate tax (gross estate, deductions, tax due).

They are bridged one-directionally by `frontend/src/lib/tax-bridge.ts`: tax engine output → net distributable estate (centavos) → fed back into the succession engine as a new `net_distributable_estate` and the whole succession pipeline is **re-run**.

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Router | Declares all routes, auth context shape | `frontend/src/router.ts` |
| Root layout | Picks layout (sidebar app shell / minimal / auth-centered) by pathname | `frontend/src/routes/__root.tsx` |
| App shell | Sidebar nav, mobile drawer, sign-in/out | `frontend/src/components/layout/AppLayout.tsx` |
| Case editor page | Orchestrates wizard → compute → results state machine for inheritance | `frontend/src/routes/cases/$caseId.tsx` |
| Estate tax page | Orchestrates tax wizard → compute → results + auto-bridge to succession engine | `frontend/src/routes/cases/$caseId.tax.tsx` |
| Inheritance wizard | 6-step react-hook-form wizard producing `EngineInput` | `frontend/src/components/wizard/WizardContainer.tsx` |
| Estate tax wizard | 8-tab form producing `EstateTaxWizardState` | `frontend/src/components/tax/EstateTaxWizard.tsx` |
| Guided intake | 7-step pre-wizard intake that creates client + case rows | `frontend/src/components/intake/GuidedIntakeForm.tsx` |
| WASM bridge | Marshals JSON across the WASM boundary, mock scenario predictor | `frontend/src/wasm/bridge.ts` |
| Succession pipeline (Rust) | 10-step orchestration of the succession computation | `engine/src/pipeline.rs` |
| Tax pipeline (TS) | 14-phase orchestration of the estate-tax computation | `frontend/src/lib/estate-tax-engine/pipeline.ts` |
| Tax bridge | Converts tax output → net estate, re-runs succession engine | `frontend/src/lib/tax-bridge.ts` |
| Results view | Renders `EngineOutput` (distribution, narratives, warnings, log) | `frontend/src/components/results/ResultsView.tsx` |
| Actions bar | Export JSON, export PDF, copy narratives, share toggle | `frontend/src/components/results/ActionsBar.tsx` |
| PDF export | Lazy-loads `@react-pdf/renderer`, builds downloadable blob | `frontend/src/lib/pdf-export.ts` |
| Share view | Public read-only case view via RPC token lookup | `frontend/src/routes/share/$token.tsx`, `frontend/src/lib/share.ts` |
| Cases data access | CRUD for the `cases` table (`input_json`/`output_json`/`tax_*_json`) | `frontend/src/lib/cases.ts` |
| Auth | Supabase auth session subscription | `frontend/src/hooks/useAuth.ts`, `frontend/src/lib/auth.ts` |
| Organization/org membership | Org + members + role permissions | `frontend/src/hooks/useOrganization.ts`, `frontend/src/lib/organizations.ts` |
| Firm profile | Letterhead/branding used in PDFs, React context | `frontend/src/contexts/FirmProfileContext.tsx` |
| Auto-save | Debounced (1.5s) autosave of wizard input to `cases.input_json` | `frontend/src/hooks/useAutoSave.ts` |
| Quick calc widget | Public/anonymous single-shot calculator on the landing page, gated after first use | `frontend/src/components/quick-calc/QuickCalcWidget.tsx` |

## Pattern Overview

**Overall:** Layered SPA with a computational core split across a language boundary (Rust/WASM) and a parallel same-language (TypeScript) engine, backed by a BaaS (Supabase: Postgres + RLS + Auth + Storage). No custom backend server — all business rules for auth/data access are Postgres RLS policies; all domain computation runs client-side.

**Key Characteristics:**
- Two engines, two paradigms: Rust pipeline (steps 1–10, `BigRational` fractions, banker's rounding at the very end) vs. TypeScript pipeline (14 phases, plain `number` centavos throughout, no fraction type).
- Route-driven page-level state machines (`type PageState = 'loading' | 'wizard' | 'computing' | 'results' | 'error'`) rather than a global app store.
- Forms are the primary state container (`react-hook-form` for the inheritance wizard, manual `useState` object for the tax wizard and intake form) — there is no Redux/Zustand/Jotai.
- Persistence is "save the whole JSON blob" — `cases.input_json`, `cases.output_json`, `cases.tax_input_json`, `cases.tax_output_json`, `cases.comparison_input_json/output_json` are JSONB columns, not normalized tables. The wizard's shape *is* the DB schema.
- Auth/authorization is entirely RLS-based (`org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())`), not enforced in application code beyond route-level `beforeLoad` redirects.

## Layers

**Route layer:**
- Purpose: URL → page component mapping, auth guards, search-param parsing.
- Location: `frontend/src/routes/`
- Contains: One file per route, each exporting a `createRoute(...)` object; `router.ts` assembles the tree.
- Depends on: hooks (`useAuth`, `useOrganization`), lib data-access modules, top-level feature components (wizard, tax wizard, results).
- Used by: `frontend/src/router.ts` → `frontend/src/main.tsx`.

**Feature component layer:**
- Purpose: Multi-step forms and result renderers (the actual UI logic).
- Location: `frontend/src/components/{wizard,tax,intake,results,case,settings,quick-calc}/`
- Contains: Step/tab components, presentational sub-components, `__tests__/` co-located.
- Depends on: `frontend/src/hooks/`, `frontend/src/lib/`, `frontend/src/types/`, `frontend/src/components/ui/` (shadcn primitives).
- Used by: route layer.

**Data-access layer (`lib/`):**
- Purpose: All Supabase reads/writes, PDF/zip export, the standalone estate-tax engine, the tax bridge.
- Location: `frontend/src/lib/`
- Contains: One module per resource (`cases.ts`, `organizations.ts`, `share.ts`, `deadlines.ts`, `case-notes.ts`, `documents.ts`, `firm-profile.ts`, `conflict-check.ts`, `intake.ts`), plus the self-contained `estate-tax-engine/` subpackage.
- Depends on: `frontend/src/lib/supabase.ts` (the one Supabase client instance), `frontend/src/types/`.
- Used by: hooks and route/feature components.

**Computation layer (cross-language):**
- Purpose: Pure functions transforming input → output; no side effects, no I/O.
- Location: `engine/src/` (Rust, compiled to `frontend/src/wasm/pkg/`) and `frontend/src/lib/estate-tax-engine/` (TypeScript).
- Depends on: nothing outside itself (Rust engine has zero Supabase/React knowledge; TS tax engine same).
- Used by: `frontend/src/wasm/bridge.ts` (succession) and `frontend/src/routes/cases/$caseId.tax.tsx` (tax, called directly, no bridge needed since it's already JS).

**Persistence layer:**
- Purpose: Row storage, RLS-enforced multi-tenancy, RPC for anonymous share access.
- Location: `frontend/supabase/migrations/`
- Contains: `001_initial_schema.sql` (core tables) through `012_pdf_storage.sql`.

## Data Flow

### Primary Request Path — new inheritance case

1. User authenticated, lands on `/cases/new` → `frontend/src/routes/cases/new.tsx` (`beforeLoad` guard redirects to `/auth` if no session).
2. `GuidedIntakeForm` (`frontend/src/components/intake/GuidedIntakeForm.tsx`) collects a 7-step intake, buffered in `localStorage['inheritance-intake-draft']` on every keystroke.
3. On submit, `mapIntakeToEngineInput()` (`frontend/src/lib/intake.ts`) converts intake state → `EngineInput`; `createCase()` (`frontend/src/lib/cases.ts`) inserts a `cases` row with `input_json` populated, `output_json` null.
4. Navigate to `/cases/$caseId` → `CaseEditorPage` (`frontend/src/routes/cases/$caseId.tsx`) loads the row via `loadCase()`, derives `PageState` from presence of `output_json`/`input_json`.
5. `phase: 'wizard'` renders `WizardContainer` (`frontend/src/components/wizard/WizardContainer.tsx`), pre-filled with `input_json` as `defaultValues` to `useForm<EngineInput>`.
6. Every render, the live form value is pushed into `useAutoSave` (`frontend/src/hooks/useAutoSave.ts`), which debounces 1500ms then calls `updateCaseInput()` → `cases.input_json` UPDATE.
7. On wizard submit, `handleSubmit()` sets `phase: 'computing'`, calls `compute(data)` (`frontend/src/wasm/bridge.ts`) with a 30s client-side timeout race.
8. `compute()` → `computeWasm()` → `ensureWasmInitialized()` (loads `.wasm` via `initSync`/`initAsync`) → `compute_json(JSON.stringify(input))` (Rust, `engine/src/wasm.rs`) → `run_pipeline()` (`engine/src/pipeline.rs`, steps 1–10) → JSON string → `JSON.parse()` → `EngineOutput`.
9. `updateCaseOutput()` persists `EngineOutput` to `cases.output_json`; `setState({phase:'results', ...})` renders `ResultsView` (`frontend/src/components/results/ResultsView.tsx`).
10. `ActionsBar` (`frontend/src/components/results/ActionsBar.tsx`) offers JSON export, PDF export (`frontend/src/lib/pdf-export.ts`, lazy-loads `@react-pdf/renderer`), narrative copy, and share-link toggle (`frontend/src/lib/share.ts` → `cases.share_enabled`/`share_token`).

### Estate Tax → Bridge → Succession Re-run

1. From case results, "Estate Tax →" link navigates to `/cases/$caseId/tax` (`frontend/src/routes/cases/$caseId.tax.tsx`).
2. `EstateTaxWizard` (`frontend/src/components/tax/EstateTaxWizard.tsx`) is an 8-tab form over `EstateTaxWizardState` (Decedent, Executor, Real Properties, Personal Properties, Other Assets, Ordinary Deductions, Special Deductions, Filing/Amnesty — tab components in `frontend/src/components/tax/tabs/`). Each `onChange` autosaves to `cases.tax_input_json` (no debounce — fires on every field change via `updateCaseTaxInput`).
3. "Compute" calls `computeEstateTax(state)` (`frontend/src/lib/estate-tax-engine/pipeline.ts`) synchronously, in-process — no WASM, no async boundary, no timeout race. 14 phases: validation → regime detection → §87 exclusions → gross estate → ordinary deductions → special deductions → spouse share → tax rate → foreign tax credit → amnesty/dual-path comparison → NRA proportional factor → explainer.
4. Output saved via `saveTaxOutput()` (`frontend/src/lib/tax-bridge.ts`) to `cases.tax_output_json`.
5. **Auto-bridge** (only if `item40_gross_estate > 0 || tax_due > 0`, to avoid zeroing out a real inheritance estate): `runTaxBridge(inheritanceInput, taxOutput)` computes `netDistributableEstate = max(0, item40_gross_estate - item44_total_deductions)`, builds a new `EngineInput` with that value substituted for `net_distributable_estate.centavos`, and calls `compute()` (the WASM succession engine) again. The bridged `EngineOutput` overwrites `cases.output_json` — silently, with a toast, non-fatal on failure.
6. `TaxResultsPanel` (`frontend/src/components/tax/results/TaxResultsPanel.tsx`) renders schedules, advisor suggestions (`runAdvisor`), sensitivity analysis (`runSensitivity`), Form 1801 view, what-if panel (which calls `computeEstateTax` again with a patched state, purely client-side, no persistence).

### Money Units Flow (repeated bug source — verify at every hop)

All monetary values are **integer centavos** end-to-end; there is no floating-point peso anywhere in either engine. The only place pesos (decimal) appear is raw user input widgets and final display formatting.

```text
User types pesos (decimal string, e.g. "1500000.50")
   │  frontend/src/components/wizard/EstateStep.tsx, quick-calc/QuickCalcWidget.tsx
   ▼
pesosToCentavos() — frontend/src/types/index.ts
   │  → integer centavos (number | string; string used only when > Number.MAX_SAFE_INTEGER)
   ▼
EngineInput.net_distributable_estate: { centavos }  — frontend/src/types/index.ts:237-242
   │
   ├──► Estate-tax engine (TS): all Real/Personal/Other property `fmv`, deduction
   │    `amount` fields are plain `number` centavos throughout
   │    frontend/src/lib/estate-tax-engine/types.ts (comment: "All monetary values
   │    are in centavos (integer) throughout the engine")
   │    → gross-estate.ts / ordinary-deductions.ts / special-deductions.ts
   │    → EstateTaxFullOutput.item40_gross_estate / item44_total_deductions (centavos, number)
   │
   ▼ (tax-bridge.ts: computeNetDistributableEstate = max(0, gross - deductions))
   │
EngineInput.net_distributable_estate.centavos  (re-injected, still integer centavos)
   │
   ▼
Rust succession engine (engine/src/fraction.rs):
   money_to_frac(centavos: &BigInt) → Frac (BigRational, exact — no precision loss)
   … all Steps 1-9 operate on Frac (arbitrary-precision rational) …
   frac_to_centavos() → BigInt, banker's rounding, ONLY at Step 10
   (engine/src/step10_finalize.rs: "Floor each share to centavos, distribute
   remainder 1 centavo at a time, largest share first — sum invariant MUST hold")
   │
   ▼
EngineOutput.per_heir_shares[].total: Money { centavos }  (BigInt on Rust side,
   number|string on TS side — Money.centavos serializes as a JSON string only
   when it exceeds i64/safe-integer range; engine/src/types.rs:27-68)
   │
   ▼
Display: formatPeso(centavos) — frontend/src/types/index.ts:483
   (BigInt-safe: divides by 100, formats with 2 decimals, "₱" prefix)
   │
   ▼
PDF export: frontend/src/lib/pdf-export.ts → components/pdf/EstatePDF.tsx
   (re-reads Money.centavos from EngineOutput, no re-conversion)
```

**Where drift/bugs have historically mattered (verification checkpoints for QA gates):**
- `Money.centavos` is typed `number | string` on the TS side (`frontend/src/types/index.ts:238`) — any code path that does `Number(centavos)` instead of using `BigInt`/`parseInt` string-safe helpers risks silent precision loss for estates > ~₱90 trillion in centavos (`Number.MAX_SAFE_INTEGER`). Grep for `parseInt(.*centavos` and `.centavos as number` when writing gates.
- The tax engine and succession engine represent money **structurally differently**: succession engine wraps in `{ centavos }` (`Money` type); tax engine uses bare `number` fields with a `// centavos` comment convention — no shared `Money` type. A gate should assert the *bridge* (`tax-bridge.ts`) never silently coerces `undefined`/`NaN` into `0`.
- `runCompute()` in `frontend/src/routes/cases/$caseId.tax.tsx` treats `item40_gross_estate === 0 && tax_due === 0` as "no assets entered" and **skips the bridge** — a gate should verify this heuristic doesn't also skip legitimate ₱0-tax-but-nonzero-estate scenarios (e.g., fully-deducted small estates).
- `computeMock()`'s scenario predictor in `frontend/src/wasm/bridge.ts` is a **hand-duplicated copy** of `engine/src/step3_scenario.rs` (comment: "Mirrors step3_scenario.rs:52-235 exactly") used only as a fallback/mock path — if the Rust logic changes without updating this TS copy, `computeMock()` silently diverges from the real engine. `computeMock` is not on the primary path (`compute()` always calls `computeWasm()`), but any test or fallback exercising it is at risk.

## Key Abstractions

**`EngineInput` / `EngineOutput`** (succession engine contract):
- Purpose: The entire wire format across the WASM boundary; also the shape persisted in `cases.input_json`/`output_json`.
- Examples: `frontend/src/types/index.ts` (TS side), `engine/src/types.rs` (Rust side, `#[derive(Serialize, Deserialize)]`).
- Pattern: Both sides must serialize/deserialize identically via `serde_json`/`JSON.stringify`; there is no schema codegen — the two type definitions are hand-kept in sync.

**`Money { centavos }`:**
- Purpose: The only monetary value shape in the succession engine.
- Examples: `frontend/src/types/index.ts:237`, `engine/src/types.rs:27`.
- Pattern: BigInt on Rust side (arbitrary precision), `number | string` on TS side (string escape hatch for values beyond `Number.MAX_SAFE_INTEGER`).

**`Frac` (Rust-only):**
- Purpose: Exact rational arithmetic (`num_rational::BigRational`) so that legitime fractions (e.g., 1/2, 1/3, 2/9) never lose precision across Steps 1–9; only converted to centavos once, at the very end.
- Examples: `engine/src/fraction.rs`.
- Pattern: `money_to_frac()` at pipeline entry, `frac_to_centavos()` (banker's rounding + largest-remainder distribution) only in `step10_finalize.rs`.

**`EstateTaxWizardState` / `EstateTaxFullOutput`:**
- Purpose: Wire format for the TS tax engine; persisted in `cases.tax_input_json`/`tax_output_json`.
- Examples: `frontend/src/types/estate-tax.ts`, `frontend/src/lib/estate-tax-engine/types.ts`.
- Pattern: No Rust equivalent exists — this engine is TS-only, plain `number` centavos, no `Frac`-equivalent (rounding happens ad hoc per phase).

**`PageState` union (route-level state machine):**
- Purpose: Explicit phase modeling for async compute flows (`loading` → `wizard`/`computing` → `results`/`error`).
- Examples: `frontend/src/routes/cases/$caseId.tsx:607-612`.
- Pattern: Discriminated union on `phase`, no external state library; each route component owns its own instance.

**Wizard step registry (`WIZARD_STEPS`, `TAB_NAMES`, `INTAKE_STEPS`):**
- Purpose: Declarative step lists driving both the stepper UI and validation gating.
- Examples: `frontend/src/components/wizard/WizardContainer.tsx:19-26` (6 steps, `will` conditional on `hasWill`), `frontend/src/types/estate-tax.ts` (`TAB_NAMES`, 8 tabs), `frontend/src/types/intake.ts` (`INTAKE_STEPS`, 7 steps).
- Pattern: Array of `{ key, label, conditional? }`, filtered per-render into `visibleSteps`; step index is local `useState`, not encoded in the URL.

## Entry Points

All routes are declared as `createRoute()` objects and assembled in `frontend/src/router.ts`. There are 24 leaf routes.

**Authenticated app routes** (guarded by `beforeLoad` → redirect to `/auth` if no session):
- `/cases` — `frontend/src/routes/cases/index.tsx` — case list.
- `/cases/new` — `frontend/src/routes/cases/new.tsx` — guided intake → new case.
- `/cases/$caseId` — `frontend/src/routes/cases/$caseId.tsx` — inheritance wizard/results state machine.
- `/cases/$caseId/tax` — `frontend/src/routes/cases/$caseId.tax.tsx` — estate tax wizard/results.

**Authenticated-in-practice but NOT route-guarded** (component checks `user`/`organization` itself and renders a soft "please sign in" / "set up firm" state instead of redirecting):
- `/` — `frontend/src/routes/index.tsx` — dashboard if signed in, marketing hero + `QuickCalcWidget` if not.
- `/settings` — `frontend/src/routes/settings/index.tsx` — firm profile, logo, brand colors.
- `/settings/team` — `frontend/src/routes/settings/team.tsx` — team members, invites, seat usage.

**Public — auth flow:**
- `/auth` — `frontend/src/routes/auth.tsx` — sign in/sign up, redirects to `/` if already authenticated.
- `/auth/callback` — `frontend/src/routes/auth/callback.tsx`.
- `/auth/reset` — `frontend/src/routes/auth/reset.tsx`.
- `/auth/reset-confirm` — `frontend/src/routes/auth/reset-confirm.tsx`.
- `/onboarding` — `frontend/src/routes/onboarding.tsx` — post-signup firm creation (3-step: firm → profile → done); component-level redirect to `/auth` if unauthenticated, to `/` if already onboarded (has an org).
- `/invite/$token` — `frontend/src/routes/invite/$token.tsx` — accepts an org invitation, redirects to `/settings/team`.

**Public — read-only share:**
- `/share/$token` — `frontend/src/routes/share/$token.tsx` — anonymous read-only case view via `get_shared_case` Postgres RPC (bypasses RLS org-scoping by design).

**Public — marketing/content (no sidebar, `MinimalLayout`/content layout regardless of auth):**
- `/intestate-succession-calculator`, `/legitimate-share-calculator`, `/spouse-and-children-inheritance`, `/illegitimate-child-inheritance`, `/parents-inheritance-share`, `/no-will-inheritance-philippines` — `frontend/src/routes/landing/*.tsx`.
- `/blog`, `/blog/intestate-vs-testate`, `/blog/how-to-compute-legitime`, `/blog/illegitimate-children-rights`, `/blog/no-will-philippines`, `/blog/preterition-explained`, `/blog/parents-inheritance-share` — `frontend/src/routes/blog/*.tsx`. Rendered without sidebar only when `!user`; with sidebar (`AppLayout`) when signed in.

**No payment/paywall route exists.** Org `plan` (`solo`/`team`/`firm`) and `seat_limit` are set at org creation (`createOrganization()`, `frontend/src/lib/organizations.ts`) with no Stripe/billing integration found anywhere in `frontend/src/`. The only "gate" in the product is the anonymous `QuickCalcWidget` session-based one-time-use gate (`SESSION_KEY = 'quick-calc-used'`, `frontend/src/components/quick-calc/QuickCalcWidget.tsx`), which sets `gated: true` after first computation for anonymous users and prompts sign-up — this is a soft UX nudge, not an enforced paywall.

**Dead/orphaned entry point:** `frontend/src/App.tsx` defines a full standalone wizard→results flow but is never imported by `frontend/src/main.tsx` (which renders `RouterWithAuth` → `router.ts` directly) or any route file. Treat `App.tsx` as legacy — do not use it as a reference for current wiring, and do not target it with QA gates.

## The WASM Boundary

**Build/load:**
- Rust crate `engine/` (`engine/Cargo.toml`, `crate-type = ["cdylib", "rlib"]`) compiled via `wasm-bindgen`/`wasm-pack` into `frontend/src/wasm/pkg/inheritance_engine.js` + `inheritance_engine_bg.wasm`, checked into the repo (generated artifact, not hand-written).
- Vite config (`frontend/vite.config.ts`) uses `vite-plugin-wasm` to load `.wasm` in the browser.
- `frontend/src/wasm/bridge.ts` → `ensureWasmInitialized()`: in Node/Vitest, reads the `.wasm` file synchronously via `fs.readFileSync` + `initSync`; in the browser, uses async `initAsync()` (fetch). Initialized once per session (`wasmInitialized` module-level flag).

**Call shape — single exported function, both directions are JSON strings:**
- `engine/src/wasm.rs`: `#[wasm_bindgen] pub fn compute_json(input: &str) -> Result<String, JsValue>` — parses `EngineInput` via `serde_json::from_str`, runs `run_pipeline()`, serializes `EngineOutput` via `serde_json::to_string`. Parse/serialize errors become `JsValue` strings, not typed error objects.
- `frontend/src/wasm/bridge.ts`: `computeWasm(input)` does `JSON.stringify(input)` → `compute_json()` → `JSON.parse(resultJson)`. No runtime schema validation of the *output* — the Rust side is trusted; only the *input* is validated pre-flight (see below).
- Public entry point: `export async function compute(input: EngineInput): Promise<EngineOutput>` (`frontend/src/wasm/bridge.ts:351`) — currently a straight passthrough to `computeWasm`; `computeMock()` (schema-validated synthetic equal-split output) exists in the same file but is not wired into `compute()`.

**Validation before crossing:**
- `EngineInputSchema.safeParse(input)` (Zod, `frontend/src/schemas/index.ts`) is run inside `computeMock()` only — the real `compute()`/`computeWasm()` path does **not** run Zod validation before calling into WASM. Malformed input can reach Rust; Rust's `serde_json::from_str` will reject it with a parse error surfaced as a rejected promise.

**Where errors surface:**
- `frontend/src/routes/cases/$caseId.tsx` `handleSubmit()`: wraps `compute(data)` in `Promise.race` against a 30s timeout; catches into `PageState = { phase: 'error', message }`, rendered as a destructive `Alert` with a "Back to Editor" button.
- `frontend/src/routes/cases/$caseId.tax.tsx`: tax computation (`computeEstateTax`) is synchronous and throws are caught around `handleCompute`/`handleApply`/`handleRevert`, surfaced via `sonner` `toast.error(...)`, not a full-page error state — the wizard remains visible.
- No global error boundary was found in `frontend/src/main.tsx` or `router.ts` — an uncaught throw inside a route component (e.g., a WASM panic) would hit React's default unhandled-error behavior (blank screen), not a graceful fallback. This is a gap for verification design: a screenshot gate that induces a WASM panic should assert *some* visible page, not just absence of a crash overlay.

**What crosses the boundary:** the entire `EngineInput` JSON tree (decedent, family tree, will, donations, config) in; the entire `EngineOutput` JSON tree (per-heir shares, narratives, computation log, warnings, scenario code) out. No incremental/streaming calls — always one full compute per submit.

## State Boundaries and Seeding Seams

For screenshot/vision gates that need to seed a UI state without clicking through, these are the injection points:

| State | Lives in | Seed mechanism | File |
|---|---|---|---|
| Auth session | Supabase Auth (JWT in browser storage, managed by supabase-js) | Sign in via Supabase Admin API / test user, or directly set `supabase.auth.setSession()` before render | `frontend/src/lib/supabase.ts`, `frontend/src/hooks/useAuth.ts` |
| Router auth context | `RouterProvider context={{ auth: { user } }}` | Set at `main.tsx` render time from the Supabase session; not independently overridable without controlling the session | `frontend/src/main.tsx` |
| Org membership / role | `organizations` + `organization_members` rows | Insert rows directly via Supabase service-role client (test fixture), or `createOrganization()` / `acceptInvitation()` | `frontend/src/lib/organizations.ts`, migration `frontend/supabase/migrations/001_initial_schema.sql` |
| Case inheritance input/output | `cases.input_json` / `cases.output_json` (JSONB) | Insert/update the row directly (fastest seam — bypasses the entire wizard) | `frontend/src/lib/cases.ts` (`createCase`, `updateCaseInput`, `updateCaseOutput`) |
| Case tax input/output | `cases.tax_input_json` / `tax_output_json` (JSONB) | Insert/update the row directly | `frontend/src/lib/cases.ts` (`updateCaseTaxInput`), `frontend/src/lib/tax-bridge.ts` (`saveTaxOutput`) |
| Case comparison data | `cases.comparison_input_json` / `comparison_output_json` / `comparison_ran_at` | Insert/update directly | `frontend/src/lib/comparison.ts`, migration `001_initial_schema.sql` |
| Share link state | `cases.share_token` (UUID, default generated) / `cases.share_enabled` (bool) | Set `share_enabled = true` directly, then navigate to `/share/$token` with the known token — no need to click the ShareDialog | `frontend/src/lib/share.ts`, `frontend/src/components/case/ShareDialog.tsx` |
| Wizard in-progress form state (inheritance) | `react-hook-form` in-memory state, seeded via `defaultValues` prop | Pass `EngineInput` (partial) as `defaultValues` — in practice this is whatever `cases.input_json` currently holds, so seeding the row seeds the wizard | `frontend/src/components/wizard/WizardContainer.tsx:76-84` |
| Wizard current step index | Local `useState<number>` inside `WizardContainer`/`EstateTaxWizard`/`GuidedIntakeForm` | **Not URL-encoded** — cannot deep-link to "step 3"; must click Next, or mount the component with custom test harness state | `frontend/src/components/wizard/WizardContainer.tsx`, `frontend/src/components/tax/EstateTaxWizard.tsx` |
| Guided intake draft (pre-case-creation) | `localStorage['inheritance-intake-draft']` | Set this key directly before loading `/cases/new` to resume mid-intake | `frontend/src/components/intake/GuidedIntakeForm.tsx:23,41-51` |
| Quick-calc anonymous gate | `sessionStorage['quick-calc-used']` (session-scoped, not localStorage — verify key name in `frontend/src/components/quick-calc/QuickCalcWidget.tsx` at use-site, constant name is `SESSION_KEY`) | Clear/set this key to force gated vs. ungated first-visit state on `/` | `frontend/src/components/quick-calc/QuickCalcWidget.tsx:14` |
| Firm profile / branding | `user_profiles` row (letterhead color, logo, counsel info) | Insert/update row directly, or via `FirmProfileProvider` context which wraps `/settings` | `frontend/src/contexts/FirmProfileContext.tsx`, `frontend/src/lib/firm-profile.ts` |
| Route param state | URL path segments (`$caseId`, `$token`) | Navigate directly to the URL with a known ID/token — no click-through needed for case/tax/share/invite pages | `frontend/src/router.ts`, individual route files |
| Search param state (auth mode/redirect) | URL query string (`?mode=signup&redirect=/cases`) | Navigate directly with query params — `authRoute.validateSearch` | `frontend/src/routes/auth.tsx:180-183` |
| Onboarding step | Local `useState<OnboardingStep>` (`'firm' | 'profile' | 'done'`) | Not URL-encoded; seed by controlling whether an org already exists for the signed-in user (no org → step 'firm' shown; org exists → auto-redirect away from `/onboarding` entirely) | `frontend/src/routes/onboarding.tsx` |

**No global client-side store** (no Redux/Zustand/Jotai/Context-as-store for domain data) — the two real state stores that matter for seeding are (1) Supabase Postgres rows and (2) the URL. Everything else is ephemeral per-mount `useState`/`react-hook-form` state that must be reconstructed by either clicking through or passing props/`defaultValues` in a test harness.

## Architectural Constraints

- **Threading:** Single-threaded JS main thread for everything, including the "second engine" (TS estate-tax pipeline runs synchronously and can block the main thread on large inputs — no Web Worker offload observed). The Rust engine executes inside the same main thread via WASM (no worker either) — `compute()` is `async` only because of the WASM init fetch, not because computation is off-thread.
- **Global state:** `wasmInitialized` boolean is a module-level singleton in `frontend/src/wasm/bridge.ts` — once true, `ensureWasmInitialized()` is a no-op for the rest of the page session. The single `supabase` client (`frontend/src/lib/supabase.ts`) is a module-level singleton shared by every `lib/*.ts` module and hook.
- **No shared `Money` type across engines:** the succession engine's `Money { centavos }` wrapper type does not exist in the estate-tax engine, which uses bare `number` fields annotated only by comments (`// centavos`). Any future refactor unifying the two engines must reconcile this.
- **Two independently-versioned business-rule implementations of scenario prediction:** `engine/src/step3_scenario.rs` (source of truth) and its hand-copy in `frontend/src/wasm/bridge.ts` (`predictScenario`, used only by the unused `computeMock`). Not currently a runtime risk since `compute()` bypasses `computeMock`, but a latent trap if `computeMock` is ever re-wired.
- **JSONB-as-schema:** `cases.input_json`/`output_json`/`tax_input_json`/`tax_output_json` have no Postgres-level shape constraints (JSONB, no CHECK on structure) — all shape enforcement is client-side TypeScript types + the Rust `serde` deserializer. A malformed row inserted directly (e.g., by a test fixture) will not be caught until read back into the wizard or engine.

## Anti-Patterns

### Auth guard inconsistency across routes

**What happens:** Some authenticated-only routes use `beforeLoad` redirects (`/cases`, `/cases/new`, `/cases/$caseId`, `/cases/$caseId/tax`), while others (`/`, `/settings`, `/settings/team`) rely purely on component-level `if (!user) return <...>` branches with no redirect.
**Why it's wrong:** Inconsistent UX (some pages bounce to `/auth`, others silently show a degraded "please sign in" state) and makes it easy to add a new authenticated page that forgets the guard entirely.
**Do this instead:** Follow the `beforeLoad` pattern already used in `frontend/src/routes/cases/index.tsx:463-466` for any new route that requires a session.

### Duplicated business logic across the WASM boundary

**What happens:** `predictScenario()` in `frontend/src/wasm/bridge.ts:86-209` is a hand-maintained TypeScript re-implementation of `engine/src/step3_scenario.rs`.
**Why it's wrong:** Two sources of truth for the same 30-branch legal decision table; the comment "Mirrors step3_scenario.rs:52-235 exactly" is a maintenance promise with no test or codegen enforcing it.
**Do this instead:** Either delete `computeMock`/`predictScenario` entirely (dead code on the primary path) or generate it from the Rust source.

### Orphaned top-level component

**What happens:** `frontend/src/App.tsx` implements a complete, self-contained wizard→compute→results flow, but nothing imports it.
**Why it's wrong:** Anyone reading `App.tsx` first (natural entry-point guess) will build a mental model of the app that has nothing to do with the actual routed app in `router.ts`.
**Do this instead:** Treat `frontend/src/main.tsx` + `frontend/src/router.ts` as the only entry point; ignore or remove `App.tsx`.

## Error Handling

**Strategy:** Local, per-feature try/catch with UI-level fallback state; no global error boundary.

**Patterns:**
- Route-level async operations set an explicit `phase: 'error'` state member with a human-readable `message` (`frontend/src/routes/cases/$caseId.tsx`, `frontend/src/routes/cases/$caseId.tax.tsx`).
- Non-critical background operations (bridge re-compute, deadline refresh, notes fetch) fail silently with `.catch(() => {})` or a toast, never crashing the primary view — see `handleApply`/`handleRevert` in `$caseId.tax.tsx` and `useEffect(() => { listNotes(caseId).then(...).catch(() => {}) })` in `$caseId.tsx`.
- Supabase errors are thrown as-is (`if (error) throw error`) from every `lib/*.ts` function; callers decide how to surface them.
- Auth errors are mapped to friendlier copy via a lookup table (`SUPABASE_ERROR_MAP`, `frontend/src/routes/auth.tsx:187-193`).

## Cross-Cutting Concerns

**Logging:** No structured logging/telemetry framework found beyond `frontend/src/lib/analytics.ts` (`trackQuickCalcUsed` — a single lightweight event tracker for the anonymous quick-calc widget) and scattered `console.error` in catch blocks (e.g., `GuidedIntakeForm.tsx`).

**Validation:** Zod schemas (`frontend/src/schemas/`) validate `EngineInput`/estate-tax input shapes, but are only invoked inside `computeMock()` and form-level validators — not on the real WASM compute path, and not as a pre-save gate before writing to `cases.input_json`.

**Authentication:** Supabase Auth (email/password, magic link, Google OAuth support exists in `frontend/src/lib/auth.ts` though no UI wires `signInWithGoogle`/`signInWithMagicLink` observed in `auth.tsx`). Session state is a single subscription (`onAuthStateChange`) fanned out via the `useAuth` hook to every component that needs it — no context provider wraps the whole app for auth (each component calls `useAuth()` independently, relying on supabase-js's own internal session cache to avoid duplicate network calls).

---

*Architecture analysis: 2026-07-27*
