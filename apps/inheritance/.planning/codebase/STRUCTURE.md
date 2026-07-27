# Codebase Structure

**Analysis Date:** 2026-07-27

## Directory Layout

```
apps/inheritance/
├── engine/                       # Rust succession-computation crate (compiled to WASM)
│   ├── src/
│   │   ├── lib.rs                # Crate root, re-exports
│   │   ├── main.rs                # Native CLI entry (for local testing, not shipped)
│   │   ├── wasm.rs                # #[wasm_bindgen] boundary — compute_json(&str) -> String
│   │   ├── pipeline.rs            # Orchestrator: runs Steps 1-10 in sequence
│   │   ├── types.rs               # EngineInput / EngineOutput / Money / Person / etc.
│   │   ├── fraction.rs            # Frac (BigRational wrapper), money<->frac conversions
│   │   ├── step1_classify.rs      # Heir classification (compulsory status, eligibility)
│   │   ├── step2_lines.rs         # Representation / per-stirpes line building
│   │   ├── step3_scenario.rs      # Scenario code (T1-T15 / I1-I15) determination
│   │   ├── step4_estate_base.rs   # Collation add-back -> estate base
│   │   ├── step5_legitimes.rs     # Legitime + free-portion computation
│   │   ├── step6_validation.rs    # Will validation (preterition, disinheritance, etc.)
│   │   ├── step7_distribute.rs    # Per-heir distribution (testate/intestate/mixed)
│   │   ├── step8_collation.rs     # Collation imputation adjustment
│   │   ├── step9_vacancy.rs       # Vacancy resolution (substitution/representation/accretion)
│   │   └── step10_finalize.rs     # Frac -> Money rounding + narrative generation
│   ├── tests/                    # Integration/fuzz/sweep tests (Rust, cargo test)
│   ├── examples/                 # Sample JSON inputs + Python validation scripts
│   └── target/                   # Cargo build output (generated, not committed logic)
│
├── frontend/                     # React 19 + TanStack Router SPA
│   ├── src/
│   │   ├── main.tsx               # Real entry point: mounts RouterProvider + auth wiring
│   │   ├── router.ts              # Assembles the full route tree
│   │   ├── App.tsx                # ORPHANED — not imported anywhere, ignore
│   │   ├── routes/                # One file per route (see route-to-file map below)
│   │   ├── components/            # Feature + UI components (see below)
│   │   ├── hooks/                 # useAuth, useOrganization, useAutoSave, useTaxBridge, usePrintExpand
│   │   ├── contexts/               # FirmProfileContext (React context, settings page only)
│   │   ├── lib/                   # Data access (Supabase), engines, exports (see below)
│   │   ├── types/                 # Hand-written TS types mirroring Rust + tax engine shapes
│   │   ├── schemas/                # Zod schemas (EngineInput, estate-tax input validation)
│   │   ├── wasm/                   # WASM bridge + generated wasm-pack output (pkg/)
│   │   ├── data/                   # Static reference data (NCC articles, document templates)
│   │   ├── utils/                  # Small pure helpers (tin-format.ts)
│   │   ├── styles/                 # Global CSS partials
│   │   └── test-setup.ts           # Vitest setup (jsdom, testing-library matchers)
│   ├── public/                    # Static assets served as-is
│   ├── scripts/                   # Build/dev helper scripts
│   ├── supabase/
│   │   └── migrations/             # Numbered SQL migrations (schema + RLS + RPCs)
│   ├── vite.config.ts              # Vite + vite-plugin-wasm + Tailwind + @ alias -> src/
│   └── vitest.config.ts            # Vitest config
│
├── loops/                         # Ingestion/automation loop configs for this app (forward/reverse spec sync)
├── specs/                          # Markdown specs — source of truth for legal/tax rules
│   ├── inheritance-engine-spec.md
│   ├── inheritance-premium-spec.md
│   ├── inheritance-platform-spec.md
│   ├── inheritance-frontend-design.md
│   ├── inheritance-v2-spec.md
│   └── estate-tax-engine-spec.md
└── .planning/codebase/             # This directory — generated codebase maps
```

## Directory Purposes

**`engine/src/`:**
- Purpose: All succession-law computation logic, pure Rust, zero I/O, zero web/JS dependencies.
- Contains: One file per pipeline step (`stepN_*.rs`), plus `types.rs` (data model), `fraction.rs` (exact rational math), `pipeline.rs` (orchestration), `wasm.rs` (the only JS-facing surface).
- Key files: `engine/src/pipeline.rs` (start here to trace a computation), `engine/src/types.rs` (start here to see the full input/output contract).

**`frontend/src/routes/`:**
- Purpose: URL-addressable pages. One `createRoute()` export per file; no nested folder-based route magic beyond directory grouping for readability (`cases/`, `settings/`, `auth/`, `blog/`, `landing/`, `invite/`, `share/`).
- Contains: Route definitions plus their page component (co-located, not split into separate `page.tsx`).
- Key files: `frontend/src/routes/__root.tsx` (layout-selection logic), `frontend/src/router.ts` (the tree).

**`frontend/src/components/wizard/`:**
- Purpose: The 6-step inheritance-case intake wizard (Estate, Decedent, Family Tree, Will [conditional], Donations, Review).
- Contains: One component per step/tab (`EstateStep.tsx`, `DecedentStep.tsx`, `FamilyTreeStep.tsx`, `WillStep.tsx`, `DonationsStep.tsx`, `ReviewStep.tsx`), sub-forms (`PersonCard.tsx`, `HeirReferenceForm.tsx`, `AdoptionSubForm.tsx`, `FiliationSection.tsx`, `ShareSpecForm.tsx`, `DonationCard.tsx`), will sub-tabs (`InstitutionsTab.tsx`, `LegaciesTab.tsx`, `DevisesTab.tsx`, `DisinheritancesTab.tsx`), and the container (`WizardContainer.tsx`).
- Key files: `frontend/src/components/wizard/WizardContainer.tsx` (step orchestration + `react-hook-form` setup), `frontend/src/components/wizard/index.ts` (barrel export).

**`frontend/src/components/tax/`:**
- Purpose: The 8-tab estate-tax wizard and its results UI.
- Contains: `EstateTaxWizard.tsx` (container), `tabs/` (`DecedentTab.tsx`, `ExecutorTab.tsx`, `RealPropertiesTab.tsx`, `PersonalPropertiesTab.tsx`, `OtherAssetsTab.tsx`, `OrdinaryDeductionsTab.tsx`, `SpecialDeductionsTab.tsx`, `FilingAmnestyTab.tsx`), `results/` (`TaxResultsPanel.tsx`, `Form1801View.tsx`, `AdvisorPanel.tsx`, `SensitivityPanel.tsx`, `WhatIfPanel.tsx`, `ComparisonView.tsx`, `ExplainerView.tsx`, `WarningsBanner.tsx`).
- Key files: `frontend/src/components/tax/EstateTaxWizard.tsx`, `frontend/src/components/tax/results/TaxResultsPanel.tsx`.

**`frontend/src/components/intake/`:**
- Purpose: Pre-wizard guided client intake (7 steps: Conflict Check, Client Details, Decedent Info, Settlement Track, Family Composition, Asset Summary, Review & Save) that creates the `clients` row and seeds the first `cases` row.
- Key files: `frontend/src/components/intake/GuidedIntakeForm.tsx`.

**`frontend/src/components/results/`:**
- Purpose: Renders `EngineOutput` after a successful compute — the primary "read" surface of the app.
- Contains: `ResultsView.tsx` (container), `ResultsHeader.tsx`, `DistributionSection.tsx`, `ShareBreakdownSection.tsx`, `ComparisonPanel.tsx`, `DonationsSummaryPanel.tsx`, `NarrativePanel.tsx`, `WarningsPanel.tsx`, `ComputationLog.tsx`, `ActionsBar.tsx`, `StatuteCitationsSection.tsx`, and `visualizer/` (family tree diagram: `FamilyTreeTab.tsx`, `TreeNode.tsx`, `tree-utils.ts`).
- Key files: `frontend/src/components/results/ResultsView.tsx`, `frontend/src/components/results/ActionsBar.tsx` (export/share entry points).

**`frontend/src/components/case/`:**
- Purpose: Case-detail-page auxiliary panels shown below the results view.
- Contains: `CaseNotesPanel.tsx` + `NoteEditor.tsx`, `DeadlineTimeline.tsx` + `DeadlineCard.tsx`, `DocumentChecklist.tsx`, `ShareDialog.tsx`, `ClientTimeline.tsx` + `TimelineStageCard.tsx` + `TimelineReport.tsx`.

**`frontend/src/components/quick-calc/`:**
- Purpose: Anonymous, no-signup single-shot calculator embedded on the public landing page (`/`).
- Key files: `frontend/src/components/quick-calc/QuickCalcWidget.tsx` (widget + session gate), `QuickCalcResults.tsx`, `defaults.ts` (heir-type presets, `buildEngineInput` helper).

**`frontend/src/components/settings/`, `frontend/src/components/dashboard/`, `frontend/src/components/landing/`, `frontend/src/components/blog/`, `frontend/src/components/seo/`, `frontend/src/components/pdf/`, `frontend/src/components/shared/`:**
- Purpose (respectively): firm profile/logo/color settings + team management UI; dashboard case cards; marketing landing-page sections; blog post rendering; SEO head tags; the `@react-pdf/renderer` PDF document tree (`EstatePDF.tsx`); small shared widgets (e.g. `PrintHeader.tsx`).

**`frontend/src/components/ui/`:**
- Purpose: shadcn/ui-style design-system primitives (Radix-based). Not feature-specific.
- Contains: `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `tabs.tsx`, `table.tsx`, `badge.tsx`, `alert.tsx`, `checkbox.tsx`, `radio-group.tsx`, `separator.tsx`, `skeleton.tsx`, `textarea.tsx`, `tooltip.tsx`, `empty-state.tsx`.

**`frontend/src/lib/`:**
- Purpose: All Supabase data access, the standalone TS estate-tax engine, cross-cutting utilities (PDF, zip export, analytics, auth).
- Contains: One file per resource/domain (`cases.ts`, `organizations.ts`, `share.ts`, `case-notes.ts`, `deadlines.ts`, `documents.ts`, `firm-profile.ts`, `conflict-check.ts`, `intake.ts`, `comparison.ts`, `timeline.ts`, `blog-posts.ts`, `analytics.ts`, `auth.ts`, `supabase.ts`, `utils.ts`, `pdf-export.ts`, `export-zip.ts`, `tax-bridge.ts`), plus the `estate-tax-engine/` subpackage.
- Key files: `frontend/src/lib/supabase.ts` (the one client), `frontend/src/lib/cases.ts` (the central case CRUD module every route touches).

**`frontend/src/lib/estate-tax-engine/`:**
- Purpose: Self-contained TypeScript estate-tax computation engine (BIR Form 1801), independent of the Rust succession engine.
- Contains: `pipeline.ts` (orchestrator, 14 phases), `validation.ts`, `regime-detection.ts`, `sec87-exclusions.ts`, `gross-estate.ts`, `ordinary-deductions.ts`, `special-deductions.ts`, `spouse-share.ts`, `tax-rate.ts`, `foreign-tax-credit.ts`, `amnesty.ts`, `nra-proportional.ts`, `explainer.ts`, `advisor.ts` (suggestion engine), `sensitivity.ts` (what-if analysis), `constants.ts`, `types.ts`.
- Key files: `frontend/src/lib/estate-tax-engine/pipeline.ts`, `frontend/src/lib/estate-tax-engine/index.ts` (public barrel export).

**`frontend/src/wasm/`:**
- Purpose: The JS-side half of the WASM boundary.
- Contains: `bridge.ts` (hand-written — `compute()`, `computeWasm()`, `computeMock()`, `ensureWasmInitialized()`), `pkg/` (generated by `wasm-pack build` — `inheritance_engine.js`, `inheritance_engine.d.ts`, `inheritance_engine_bg.wasm`; do not hand-edit).
- Generated: `pkg/` is generated; `bridge.ts` is not.

**`frontend/supabase/migrations/`:**
- Purpose: Numbered, forward-only SQL migrations defining schema, RLS policies, and RPCs.
- Contains: `001_initial_schema.sql` (organizations, members, invitations, user_profiles, clients, cases, case_notes, case_deadlines, case_documents, conflict_check_log), `004_shared_case_rpc.sql` (`get_shared_case` RPC used by `/share/$token`), `005_case_deadlines.sql`, `006_case_documents.sql`, `007_conflict_check.sql`, `009_cases_intake_data.sql`, `010_rls_org_scope.sql`, `011_create_org_rpc.sql`, `012_pdf_storage.sql`.

**`specs/`:**
- Purpose: Markdown specifications that are the legal/tax source of truth referenced by doc-comments throughout `engine/src/` and `frontend/src/lib/estate-tax-engine/` (e.g. "spec §16", "spec §4.9").
- Not code — read before changing computation logic in either engine.

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx`: real app bootstrap (mounts `RouterProvider`, wires Supabase auth session into router context).
- `frontend/src/router.ts`: full route tree.
- `engine/src/wasm.rs`: the only function exported from Rust to JS (`compute_json`).
- `engine/src/main.rs`: native CLI entry, used for local Rust-side testing only, not part of the shipped product.

**Configuration:**
- `frontend/vite.config.ts`: build config, `@` path alias → `frontend/src`, WASM plugin.
- `frontend/tsconfig.json`: TS compiler config.
- `frontend/vitest.config.ts`: test runner config.
- `frontend/components.json`: shadcn/ui component generator config.
- `engine/Cargo.toml`: Rust crate manifest (`wasm-bindgen`, `num-rational`, `serde`).
- `frontend/.env.local.example`: documents required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL`) — never read the real `.env.local`.

**Core Logic:**
- `engine/src/pipeline.rs`: succession computation orchestration.
- `frontend/src/lib/estate-tax-engine/pipeline.ts`: tax computation orchestration.
- `frontend/src/lib/tax-bridge.ts`: the one place the two engines talk to each other.
- `frontend/src/wasm/bridge.ts`: the one place JS talks to Rust.

**Testing:**
- `engine/tests/`: Rust integration/fuzz/sweep tests (`cargo test`).
- `frontend/src/**/__tests__/`: co-located Vitest test files (110+ found), mirroring the source file name (`Foo.tsx` → `__tests__/Foo.test.tsx`).
- `frontend/src/test-setup.ts`: global Vitest setup.

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g. `WizardContainer.tsx`, `DecedentStep.tsx`).
- Hooks: `camelCase.ts` prefixed `use` (e.g. `useAuth.ts`, `useAutoSave.ts`).
- Non-component TS modules (lib, types, schemas, utils): `kebab-case.ts` (e.g. `tax-bridge.ts`, `firm-profile.ts`, `conflict-check.ts`) or single lowercase word (`cases.ts`, `share.ts`, `auth.ts`).
- Rust step modules: `stepN_snake_case.rs`, numbered to match the pipeline order (`step1_classify.rs` … `step10_finalize.rs`).
- Test files: co-located `__tests__/` subdirectory, same base name + `.test.tsx`/`.test.ts` (e.g. `frontend/src/components/wizard/__tests__/DecedentStep.test.tsx`).
- Route files: named after the URL segment, dynamic segments prefixed `$` (e.g. `$caseId.tsx`, `$token.tsx`), nested-path routes use dot-notation filenames (`$caseId.tax.tsx` for `/cases/$caseId/tax`).
- SQL migrations: `NNN_description.sql`, zero-padded 3-digit sequence number.

**Directories:**
- Feature grouping under `components/<feature>/` (lowercase, kebab if multi-word: `quick-calc/`).
- Sub-groupings inside a feature use plural nouns for collections of similar items: `tabs/`, `results/`, `visualizer/`.
- Barrel exports (`index.ts`) exist selectively — only where a feature is imported as a unit elsewhere (e.g. `frontend/src/components/wizard/index.ts` exports `WizardContainer`; most other component directories are imported by direct file path, not via a barrel).

## Where to Add New Code

**New inheritance wizard step:**
- Component: `frontend/src/components/wizard/<StepName>Step.tsx`, registered in `WIZARD_STEPS` array and `renderStep()` switch in `frontend/src/components/wizard/WizardContainer.tsx`.
- Tests: `frontend/src/components/wizard/__tests__/<StepName>Step.test.tsx`.
- If the step needs new input fields, extend `EngineInput` in both `frontend/src/types/index.ts` **and** `engine/src/types.rs` (keep the JSON shapes in sync manually — no shared codegen exists).

**New estate-tax wizard tab:**
- Component: `frontend/src/components/tax/tabs/<TabName>Tab.tsx`, registered in `TAB_NAMES`/`TAB_COUNT` (`frontend/src/types/estate-tax.ts`) and the switch in `frontend/src/components/tax/EstateTaxWizard.tsx`.
- Computation: add a new phase module in `frontend/src/lib/estate-tax-engine/` and wire it into `pipeline.ts`.

**New succession computation rule:**
- Add/modify logic inside the relevant `engine/src/stepN_*.rs` file (find the step whose spec section matches, per the doc-comment at the top of each file); update `engine/src/pipeline.rs` only if the step's inputs/outputs change.
- Rebuild WASM artifacts into `frontend/src/wasm/pkg/` (generated — do not hand-edit) before the frontend sees the change.
- Add a Rust unit test in the same file's `#[cfg(test)] mod tests` block, or an integration case in `engine/tests/`.

**New Supabase-backed feature (new resource type):**
- Migration: new numbered file in `frontend/supabase/migrations/` (RLS policy required — follow the `org_id IN (SELECT org_id FROM organization_members WHERE user_id = auth.uid())` pattern from `001_initial_schema.sql`).
- Data access module: new file in `frontend/src/lib/<resource>.ts`, exporting typed CRUD functions that throw on Supabase error.
- Hook (if reactive state needed): new file in `frontend/src/hooks/use<Resource>.ts`.

**New route/page:**
- New file in `frontend/src/routes/<path>.tsx` (or nested folder for grouped paths), export a `createRoute()` object.
- Register the exported route in `frontend/src/router.ts` (`addChildren([...])` under `rootRoute` for app-shell pages, or under `publicRootRoute` for pages without the sidebar).
- Add a `beforeLoad` guard if the page must be authenticated — follow `frontend/src/routes/cases/index.tsx:463-466`.

**Utilities:**
- Pure, feature-agnostic helpers: `frontend/src/utils/`.
- Shared UI primitives: `frontend/src/components/ui/` (generate via shadcn CLI per `frontend/components.json` rather than hand-rolling).
- Cross-feature domain helpers (still feature-tied, e.g. money formatting): `frontend/src/types/index.ts` (co-located with the types they operate on — see `formatPeso`, `centavosToPesos`, `pesosToCentavos`).

## Route-to-File Map

| URL | Route file | Page component | Auth |
|---|---|---|---|
| `/` | `frontend/src/routes/index.tsx` | `DashboardPage` | soft (component checks `user`) |
| `/auth` | `frontend/src/routes/auth.tsx` | `AuthPage` | public |
| `/auth/callback` | `frontend/src/routes/auth/callback.tsx` | — | public |
| `/auth/reset` | `frontend/src/routes/auth/reset.tsx` | — | public |
| `/auth/reset-confirm` | `frontend/src/routes/auth/reset-confirm.tsx` | — | public |
| `/onboarding` | `frontend/src/routes/onboarding.tsx` | `OnboardingPage` | soft (component redirects) |
| `/cases` | `frontend/src/routes/cases/index.tsx` | `CasesListPage` | guarded (`beforeLoad`) |
| `/cases/new` | `frontend/src/routes/cases/new.tsx` | `CasesNewPage` | guarded (`beforeLoad`) |
| `/cases/$caseId` | `frontend/src/routes/cases/$caseId.tsx` | `CaseEditorPage` | guarded (`beforeLoad`) |
| `/cases/$caseId/tax` | `frontend/src/routes/cases/$caseId.tax.tsx` | `CaseTaxPage` | guarded (`beforeLoad`) |
| `/settings` | `frontend/src/routes/settings/index.tsx` | `SettingsPage` | soft (component checks `user`) |
| `/settings/team` | `frontend/src/routes/settings/team.tsx` | `TeamSettingsPage` | soft (component checks `organization`) |
| `/share/$token` | `frontend/src/routes/share/$token.tsx` | `SharedCaseRouteComponent`/`SharedCasePage` | public (RPC-gated by token) |
| `/invite/$token` | `frontend/src/routes/invite/$token.tsx` | `InviteCallbackPage` | public |
| `/blog` | `frontend/src/routes/blog/index.tsx` | — | public |
| `/blog/intestate-vs-testate` | `frontend/src/routes/blog/intestate-vs-testate.tsx` | — | public |
| `/blog/how-to-compute-legitime` | `frontend/src/routes/blog/how-to-compute-legitime.tsx` | — | public |
| `/blog/illegitimate-children-rights` | `frontend/src/routes/blog/illegitimate-children-rights.tsx` | — | public |
| `/blog/no-will-philippines` | `frontend/src/routes/blog/no-will-philippines.tsx` | — | public |
| `/blog/preterition-explained` | `frontend/src/routes/blog/preterition-explained.tsx` | — | public |
| `/blog/parents-inheritance-share` | `frontend/src/routes/blog/parents-inheritance-share.tsx` | — | public |
| `/intestate-succession-calculator` | `frontend/src/routes/landing/intestate-succession-calculator.tsx` | — | public (content layout) |
| `/legitimate-share-calculator` | `frontend/src/routes/landing/legitimate-share-calculator.tsx` | — | public (content layout) |
| `/spouse-and-children-inheritance` | `frontend/src/routes/landing/spouse-and-children-inheritance.tsx` | — | public (content layout) |
| `/illegitimate-child-inheritance` | `frontend/src/routes/landing/illegitimate-child-inheritance.tsx` | — | public (content layout) |
| `/parents-inheritance-share` | `frontend/src/routes/landing/parents-inheritance-share.tsx` | — | public (content layout) |
| `/no-will-inheritance-philippines` | `frontend/src/routes/landing/no-will-inheritance-philippines.tsx` | — | public (content layout) |

Layout selection for every route is centralized in `frontend/src/routes/__root.tsx` (`RootLayout`), which branches on `pathname` prefix/exact-match rather than per-route config — check this file when adding a route that needs a non-default layout.

## Special Directories

**`frontend/src/wasm/pkg/`:**
- Purpose: `wasm-pack`-generated JS glue + compiled `.wasm` binary for the Rust engine.
- Generated: Yes (from `engine/` via `wasm-pack build`).
- Committed: Yes (checked into the repo so the frontend builds without a Rust toolchain).

**`engine/target/`:**
- Purpose: Cargo build cache/output.
- Generated: Yes.
- Committed: No (standard `.gitignore` entry for Rust).

**`frontend/supabase/migrations/`:**
- Purpose: Append-only schema history; never edit a already-applied migration, add a new numbered file.
- Generated: No (hand-written SQL).
- Committed: Yes.

**`frontend/src/**/__tests__/`:**
- Purpose: Co-located Vitest specs, one directory per parent directory that has tests, not a single top-level `tests/` tree.
- Generated: No.
- Committed: Yes.

**`engine/examples/`:**
- Purpose: Sample `EngineInput` JSON fixtures (e.g. `simple-intestate.json`, `testate-cases/01.json`…`15.json`) plus Python validation/generation scripts used for manual/exploratory testing of the Rust engine outside `cargo test`.
- Generated: Partially (some JSON generated by the Python scripts, some hand-written).
- Committed: Yes — useful as ready-made seed payloads for `cases.input_json` when constructing QA fixtures.

**`loops/`:**
- Purpose: Forward/reverse spec-sync automation configuration for this app (`forward/` and `reverse/` subdirectories per surface area: `frontend`, `engine`, `platform`, `premium`, `ui`, `wasm`, `v2`, `core`, `estate-tax`). Not application runtime code.

---

*Structure analysis: 2026-07-27*
