# External Integrations

**Analysis Date:** 2026-07-27

## APIs & External Services

**Backend-as-a-Service (primary and only backend):**
- Supabase — `apps/inheritance/frontend/src/lib/supabase.ts`
  - SDK: `@supabase/supabase-js` 2.98.0
  - Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (env vars, see `.env.local.example`)
  - Client is conditionally created: `export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)`; if either var is missing, `supabase` is `null` and all call sites must guard on `supabaseConfigured` first.
  - **Gate implication:** any test that touches real data needs either (a) a running local Supabase stack (`supabase start`, config at `apps/inheritance/frontend/supabase/config.toml`) with the anon key it prints, or (b) a mocked `supabase` client. No mocking layer/test double is bundled by default — `src/lib/__tests__/supabase.test.ts` exists but check it for whether it mocks the SDK or asserts on `supabaseConfigured` only.

**Analytics:**
- Google Analytics (gtag.js) — `apps/inheritance/frontend/index.html` loads `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX` and calls `gtag('config', 'G-XXXXXXXXXX')`.
  - **The measurement ID is a placeholder (`G-XXXXXXXXXX`), not a real property.** This is effectively disabled/non-functional as shipped.
  - Tracking calls: `apps/inheritance/frontend/src/lib/analytics.ts` (`trackQuickCalcUsed`, `trackSignupStarted`, `trackSignupCompleted`), invoked from `src/components/quick-calc/QuickCalcWidget.tsx` and `src/routes/auth.tsx`. Function is a no-op unless `window.gtag` exists.
  - **Gate implication:** no real external call happens in tests; `window.gtag` is `undefined` in jsdom by default, so `trackEvent` silently skips — no mock needed, but a gate wanting to assert tracking fired would need to stub `window.gtag`.

**No payment provider integration found** — grep for stripe/paymongo/paypal/xendit/billing SDKs found nothing beyond a single env var placeholder `VITE_BILLING_URL` (commented out in `.env.local.example`) used only as an outbound link in `InviteMemberDialog`'s seat-limit CTA. There is no billing SDK, webhook handler, or checkout flow in this codebase.

**No error-tracking/APM SDK found** (no Sentry, no Bugsnag, no Datadog) — errors are handled in-app only.

## Data Storage

**Database:**
- Postgres via Supabase (local dev: major_version 17, `apps/inheritance/frontend/supabase/config.toml`)
- Multi-tenant via `organizations` table + `org_role` enum (`admin`, `attorney`, `paralegal`, `readonly`) — `apps/inheritance/frontend/supabase/migrations/001_initial_schema.sql`
- RLS (Row Level Security) is the tenant isolation mechanism: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies scoped via `user_org_ids()` helper — see `apps/inheritance/frontend/supabase/migrations/010_rls_org_scope.sql` (492 lines, the bulk of the RLS policy set) and `001_initial_schema.sql` (7 RLS statements), `012_pdf_storage.sql` (1 RLS statement for `case_pdfs`).
- 9 migrations total: `001_initial_schema.sql`, `004_shared_case_rpc.sql`, `005_case_deadlines.sql`, `006_case_documents.sql` (no-op, kept for history), `007_conflict_check.sql`, `009_cases_intake_data.sql`, `010_rls_org_scope.sql`, `011_create_org_rpc.sql`, `012_pdf_storage.sql`. Numbering gaps (002, 003, 008) suggest squashed/removed migrations — a fresh `supabase db reset` will apply only what's tracked, which is internally consistent, but any historical assumption about 002/003/008 content should not be made.
- **Gate implication:** exercising DB-backed features (cases, RLS, org scoping) requires a running local Supabase Postgres via `supabase db reset` / `supabase start` against these 9 migrations — real Postgres, not mockable at the RLS-policy level. Unit-level TS logic can be tested with a mocked `supabase` client instead.

**File Storage:**
- Supabase Storage, single named bucket referenced in code: `firm-logos` (`LOGO_BUCKET` constant in `apps/inheritance/frontend/src/lib/firm-profile.ts:23`), used for firm logo upload/list/remove (`bucket.upload`, `bucket.list`, `bucket.remove`).
  - **No migration or config creates this bucket.** `supabase/config.toml` has `[storage.buckets.images]` commented out (template default) and no migration contains `storage.buckets` inserts or bucket-creation SQL. The bucket must be created manually (dashboard or `supabase storage` CLI) before any test/gate that exercises firm-logo upload will succeed against a fresh local stack.
  - Separate, apparently orphaned storage reference: `case_pdfs` table (`apps/inheritance/frontend/supabase/migrations/012_pdf_storage.sql`) has a `storage_key TEXT NOT NULL` column implying PDFs are meant to be persisted to a bucket, but **no code path calls `supabase.storage` for PDFs** — grep across `src/` shows `storage_key`/`case_pdfs` only in the migration file itself. PDF generation (`@react-pdf/renderer`) appears to be client-side-only/download-only in the current implementation; the storage-persistence half of this feature is either unimplemented or removed. A gate should not assume PDFs get uploaded anywhere.

**Caching:**
- None detected — no Redis, no client-side cache layer beyond React Query-less TanStack Router loaders / component state.

## Authentication & Identity

**Auth Provider:** Supabase Auth (email/password + email OTP), configured entirely through Supabase, no third-party IdP.

- Methods actually called in code (`apps/inheritance/frontend/src/routes/auth.tsx`, grep for `supabase.auth.*`):
  `signUp`, `signInWithPassword`, `signInWithOtp`, `signInWithOAuth`, `signOut`, `getSession`, `getUser`, `onAuthStateChange`, `exchangeCodeForSession`, `resetPasswordForEmail`, `updateUser`, `resend`.
- `signInWithOAuth` is called somewhere in the auth flow, but `supabase/config.toml`'s `[auth.external.*]` providers (apple, etc.) are all commented out/disabled in local config — **no OAuth provider is actually configured for local dev**, so exercising that code path against a local stack will fail unless a provider block is uncommented and given real client id/secret.
- Local auth config specifics (`apps/inheritance/frontend/supabase/config.toml`):
  - `enable_confirmations = false` for email — signup does not require email confirmation locally.
  - `minimum_password_length = 6`, no password complexity rules by default.
  - Local email delivery goes to **Inbucket** (`[inbucket]` section, a fake SMTP catcher included with the Supabase CLI) — no real SMTP/SendGrid is configured (`[auth.email.smtp]` block is commented out).
  - SMS/Twilio (`[auth.sms.twilio]`) references `env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)` but is not enabled by default and no code path in `src/` sends SMS.
- **Gate implication:** email/password and OTP flows are testable end-to-end against local Supabase using Inbucket to read confirmation/reset emails (`http://127.0.0.1:54324` by default, per Supabase CLI convention). OAuth (`signInWithOAuth`) is not exercisable locally without manually configuring a real provider — treat as mock-only for gates unless that's explicitly set up.

## Monitoring & Observability

**Error Tracking:** None (no Sentry/Bugsnag/Rollbar found).

**Logs:** No structured logging framework; presumably `console.*` only (not exhaustively verified).

## CI/CD & Deployment

**Hosting:**
- Fly.io — `apps/inheritance/frontend/fly.toml` (app `inheritance-frontend`, region `sin`, single shared-CPU 1GB VM, scale-to-zero enabled)
- Docker: `apps/inheritance/frontend/Dockerfile` — static nginx image (no server-side app, no wasm-pack/cargo build inside the Dockerfile itself, implying the WASM artifact and JS bundle must be built and placed into `dist/` *before* the Docker build runs — the Dockerfile only does `COPY dist /usr/share/nginx/html`).

**CI Pipeline — actual behavior (verified by reading the workflow file, not assumed):**
- Root-level workflow `/.github/workflows/inheritance.yml` is the **only** workflow that references `apps/inheritance`.
- **Trigger: `workflow_dispatch` only** (manual trigger with an optional `loop` input). **There is no `push` or `pull_request` trigger anywhere in this workflow, and none of the other 5 workflows in `.github/workflows/` reference `apps/inheritance` either.**
- **This means: no CI currently runs automatically on commits or PRs against `apps/inheritance`.** Nothing gates merges. Any "CI check" work must be newly added — it does not exist today.
- What the existing workflow *does* run (when manually dispatched): it is a "Ralph loop" runner — it discovers active entries in `apps/inheritance/loops/_registry.yaml` with `type: forward` and `status: active`, then for each it repeatedly invokes Claude Code (`claude --model claude-opus-4-6 --print --dangerously-skip-permissions`) against a `PROMPT.md` in a loop directory (`apps/inheritance/loops/<loop>/`) until a `status/converged.txt` file appears or 3 consecutive failures occur, committing/pushing after each iteration. This is an autonomous development loop, not a test/build verification gate.
- The workflow does install real toolchain pieces before running loops: Rust stable + `wasm32-unknown-unknown` target (`dtolnay/rust-toolchain@stable`), `wasm-pack` (curl installer), Node 20 (`actions/setup-node@v4`), `pnpm` (`npm install -g pnpm` — inconsistent with the npm lockfile actually in the repo), and `@anthropic-ai/claude-code`. These installs exist to let the *loop* build/verify its own work, not to run a repo-wide test suite as a gate.
- Checking `apps/inheritance/loops/_registry.yaml`: all `reverse/*` loops are `status: converged`; this registry drives what `inheritance.yml` runs on dispatch, but does not run automatically.
- **Secrets referenced:** `ANTHROPIC_API_KEY`, `secrets.GH_PAT` (both at the GitHub Actions repo/org level, not inspectable from this tree).

## Environment Configuration

**Required env vars (frontend, `VITE_`-prefixed, read via `import.meta.env`):**
- `VITE_SUPABASE_URL` — required, Supabase project URL (local default `http://localhost:54321`)
- `VITE_SUPABASE_ANON_KEY` — required, Supabase anon/public key
- `VITE_APP_URL` — required, used for share links, QR codes, and password-reset email links (local default `http://localhost:3000`)
- `VITE_BILLING_URL` — optional, commented out by default, only used as a CTA link

**Secrets location:**
- No `.env` file present in this tree, only `apps/inheritance/frontend/.env.local.example` (template, no real secrets).
- GitHub Actions secrets used by `inheritance.yml`: `ANTHROPIC_API_KEY`, `GH_PAT` (not visible from the repo; managed at the GitHub org/repo settings level).
- Supabase-side secret placeholders in `supabase/config.toml` use the `env(VAR_NAME)` substitution syntax (e.g. `auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"`) but these are all inside commented-out or disabled sections in local config.

## Webhooks & Callbacks

**Incoming:** None found — no webhook endpoint/handler code in `src/` (no Stripe/payment webhook, no Supabase Edge Function webhook receiver in this repo — `supabase/` has no `functions/` directory).

**Outgoing:** None found — the app does not call out to any webhook URL.

## Summary: What a Test/Gate Needs, Per Integration

| Integration | Real service required? | Mock available? | Notes for gate design |
|---|---|---|---|
| Supabase Postgres + RLS | Yes (local Supabase via `supabase start`/`db reset`) | Only for pure-TS unit logic | Needed for anything touching `cases`, `organizations`, RLS scoping |
| Supabase Auth (email/password, OTP) | Yes, local stack; read confirmation/reset mail via Inbucket (`:54324`) | Not for real flow | `enable_confirmations = false` simplifies signup testing locally |
| Supabase Auth OAuth (`signInWithOAuth`) | Not configured locally (providers commented out) | Must mock — no real provider set up | Do not expect this to work against local stack out of the box |
| Supabase Storage (`firm-logos` bucket) | Yes, but **bucket must be manually created first** — no migration creates it | Mock `supabase.storage.from()` for unit tests | Fresh `db reset` does not provision this bucket |
| `case_pdfs` storage_key / PDF persistence | Not exercised by any code path found | N/A | Feature appears half-implemented; don't build a gate expecting uploads |
| Google Analytics (gtag) | No — ID is a placeholder | No mock needed; `window.gtag` is `undefined` under jsdom, calls are no-ops | Non-functional as shipped |
| Payment provider | None exists | N/A | No integration to test |
| Rust engine (native) | Local Rust toolchain only | N/A, deterministic pure function | `cargo test` fully exercises it, no external service |
| Rust engine (WASM) | Needs `wasm32-unknown-unknown` target + `wasm-pack` installed, then built | The frontend has a `computeMock()` fallback path referenced in `bridge.ts` comments — check `src/wasm/bridge.ts` for exact fallback trigger conditions | `.wasm` binary is **not present** in this tree; must build before any gate exercising the real engine (not the TS mock) can run |

---

*Integration audit: 2026-07-27*
