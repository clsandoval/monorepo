# Phase 11 Research — Account, Org & Case Journey Gates

**Measured:** 2026-07-31, live in this tree, against the running local Supabase stack
(`supabase_db_inheritance`, up 10 hours) and a real `vite preview` build. Every number, HTTP status,
SQL result and browser body string below was produced by a command run during planning. Where a claim
could not be measured it is labelled **unmeasured** in as many words.

Every mutation made during measurement was reverted. The final state of the database was re-checked:
`has_table_privilege('authenticated','public.cases','SELECT')` is `f`, both `get_shared_case`
overloads are present, and `git status --porcelain` for `apps/inheritance/` shows no plan-relevant
modification.

---

## 1. What this phase owes

| Requirement | One-line obligation |
|---|---|
| JRNY-02 | Signup, email verification, login, logout, session persistence each produce a screenshot checked against an approved reference plus a rubric |
| JRNY-03 | Org creation and invite acceptance verified the same way |
| JRNY-04 | Case intake, including the `localStorage` draft-recovery path, verified step by step |
| COV-06 | Against a real local Supabase: a user in org A cannot read, write or enumerate org B's cases, PDFs or shared links |

Phase 10 built the harness (`frontend/journey/`) and proved it against committed HTML fixtures under
gate **G15**. Phase 11 is the first phase that points that harness at the **real application backed by
the real database**. `GATES.md` §12 states the boundary explicitly: *"The gates that drive the real
application belong to Phases 11 and 12."*

---

## 2. The inherited blocker, re-measured — and the Phase 10 diagnosis was incomplete

`STATE.md` records Phase 10's finding: no `public` table grants SELECT/INSERT/UPDATE/DELETE to
`anon`, `authenticated` or `service_role`, so `journey/seed-smoke.mjs` and a raw REST call both get
PG `42501` / HTTP 403. That reproduces exactly. Reproduced end to end, with a real password grant for
the seeded Alpha user:

```
POST /auth/v1/token?grant_type=password  → 200, access_token length 744
GET  /rest/v1/organizations?select=id,name
  {"code":"42501","hint":"Grant the required privileges to the current role with:
    GRANT SELECT ON public.organizations TO authenticated;",
   "message":"permission denied for table organizations"}   HTTP=403
```

Note what this proves and what it does not. **GoTrue is unaffected** — sign-in returns a real session.
Only PostgREST table access is denied. So signup, login, logout and session persistence are not
blocked by this; every screen that reads a table is.

### 2.1 The cause, measured precisely

`pg_default_acl` was read directly. The `postgres`-owned entry for schema `public` is:

```
postgres | public | r | {postgres=arwdDxtm/postgres,anon=Dxtm/postgres,
                          authenticated=Dxtm/postgres,service_role=Dxtm/postgres}
```

`Dxtm` is TRUNCATE, REFERENCES, TRIGGER, MAINTAIN. It contains **no** `a` (INSERT), `r` (SELECT),
`w` (UPDATE) or `d` (DELETE). The `supabase_admin`-owned entry for the same schema *does* carry
`arwdDxtm`, which is why Phase 10 concluded the default ACLs "never applied". That framing is not
quite right: the `postgres` default ACL applied, and it deliberately excludes DML. Every one of the
eleven `public` tables carries exactly that ACL, and it is what a fresh `supabase db reset` produces —
verified by running a full reset during this research and re-reading the ACLs afterwards.

No migration contains a `REVOKE`. There are **zero** sequences and **zero** views in `public`, so the
grant surface is exactly eleven tables.

### 2.2 It is fixable without inventing a security posture, and the fix was proven

RLS is enabled on all eleven tables and every one carries at least one policy. The policy set was read
from `pg_policies` and is reproduced verbatim in §7 below. Granting DML to `authenticated` therefore
does not widen row visibility — RLS remains the row filter. This was not reasoned about; it was run.

With per-table grants applied to `authenticated` (and blanket DML to `service_role`, which bypasses
RLS and is the seeding identity):

```
A = alpha@example.test JWT, B = beta@example.test JWT

A GET /rest/v1/organizations           → 200 [{"id":"a0…001","name":"Test Firm Alpha"}]
A GET /rest/v1/cases                   → 200 [{"id":"a0…004","title":"Seeded Case Alpha"}]
B GET /rest/v1/cases                   → 200 [{"id":"b0…004","title":"Seeded Case Beta"}]
A GET /rest/v1/cases?id=eq.b0…004      → 200 []            ← the isolation claim
anon GET /rest/v1/cases                → 401 42501         ← anon still fully denied
```

`anon` was granted nothing and stays denied. That is the correct end state and it is the one this
phase adopts: **`anon` receives no table privilege at all**, because the only anonymous data path in
the product is the `get_shared_case` RPC, which is `SECURITY DEFINER` and carries its own
`GRANT EXECUTE … TO anon`.

The grants were then revoked and the baseline restored.

---

## 3. A second blocker Phase 10 did not see: the share RPC is broken three ways

Phase 11 criterion 4 names **shared links** as one of the three things org A must not be able to read.
The shared-link path does not work at all today. Measured, as `anon`, against the pristine stack:

```
POST /rest/v1/rpc/get_shared_case {"p_token":"a0000000-0000-4000-8000-000000000005"}
  {"code":"PGRST203","message":"Could not choose the best candidate function between:
     public.get_shared_case(p_token => text), public.get_shared_case(p_token => uuid)"}   HTTP=300
```

Three stacked defects, each confirmed:

1. **Two overloads exist.** `migrations/004_shared_case_rpc.sql:11` creates `get_shared_case(UUID)`;
   `migrations/011_create_org_rpc.sql:39` creates `get_shared_case(TEXT)`. Migration 004 drops the
   TEXT form before creating the UUID form, but 011 runs after 004 and re-creates TEXT, so both
   survive a reset. `pg_proc` confirms both rows.
2. **The TEXT form is non-functional.** Its predicate is `c.share_token = p_token` where
   `cases.share_token` is `uuid`. With the UUID overload dropped so PostgREST could resolve the call,
   the TEXT form returned
   `{"code":"42883","message":"operator does not exist: uuid = text"}` HTTP 404. It has never worked.
3. **User-visible consequence.** Driving the built application in a real browser at
   `/share/a0000000-0000-4000-8000-000000000005` — a case whose `share_enabled` is `true` — renders
   `Case Not Found  This shared link is invalid, expired, or sharing has been disabled.`

With the TEXT overload dropped, the UUID form re-created from `004`'s own text, and PostgREST's schema
cache reloaded (`NOTIFY pgrst, 'reload schema'`), the path works and discriminates correctly:

```
anon rpc, alpha token (share_enabled = true)   → 200, full case row
anon rpc, beta  token (share_enabled = false)  → 200, []
```

The UUID form is also the one whose column set matches what the client consumes: `src/lib/share.ts`
declares `SharedCaseData` with exactly the six fields `004` returns, and `grep` finds **zero** uses of
`tax_output_json` or `comparison_output_json` in `src/routes/share/$token.tsx`. Keeping `004`'s form
is therefore both the working choice and the narrower field exposure — which is the property JRNY-08
(Phase 12) will later have to assert.

---

## 4. Feasibility of the whole phase, proven end to end

Nothing below is inferred. A build was produced, a preview server started, Playwright driven through
Phase 10's own `journey/browser.mjs`, and a real session seeded through `journey/seed.mjs`.

### 4.1 Build and serve

```
$ npm run build            → tsc -b && vite build && postbuild sitemap   exit 0, 17.2 s real
$ npx vite preview --port 4173 --strictPort
$ curl -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/      → 200
$ curl -o /dev/null -w '%{http_code}' http://127.0.0.1:4173/auth  → 200
```

Vite preview serves the SPA history fallback, so deep routes such as `/auth`, `/share/<token>` and
`/cases/new` are reachable directly. Port 4173 was measured free.

### 4.2 The seeded session reaches the app

`supabase-js` was driven with a capturing storage shim to record exactly what it writes:

```
KEY   = sb-127-auth-token
VALUE = {"access_token":…,"token_type":…,"expires_in":…,"expires_at":…,
         "refresh_token":…,"user":{…},"weak_password":…}
```

The key is derived as `sb-<first hostname label>-auth-token`; with
`VITE_SUPABASE_URL=http://127.0.0.1:55321` the label is `127`. That is precisely what
`journey/seed.mjs:seedAuthSession` derives, and the derivation was confirmed against a real session
rather than trusted.

`src/main.tsx:20` calls `supabase.auth.getSession()` on mount and passes the resulting user into the
router context, so a session written before first paint is picked up with no reload.

### 4.3 The authenticated dashboard renders, with the grants applied

```
storage key = sb-127-auth-token
screenshot bytes = 32631
BODY: Inheritance Philippine Succession Law Dashboard Cases New Case Blog Settings
      alpha@example.test Sign Out Dashboard New Case RECENT CASES View all →
      Seeded Case Alpha draft
consoleErrors: []
```

Zero console errors, the seeded case visible, a PNG captured through `captureScreenshot`. **This is
the single most important measurement in this document**: the entire Phase 11 approach — build,
serve, seed a real session, drive a real browser, screenshot a real database-backed screen — works.

### 4.4 Intake step seeding works through `localStorage` alone, with one trap

`GuidedIntakeForm.tsx:39-44` initialises its whole state from
`localStorage['inheritance-intake-draft']`, and that state **includes `currentStep`**. So no new
search param is needed for JRNY-04: a seeded draft reaches any of the seven steps directly.

The trap, measured: a **partial** draft crashes the application.

```
seed {"currentStep":2,"conflictCheck":{"outcome":"skipped"}}
 → BODY: "Something went wrong! Show Error"
 → TypeError: Cannot read properties of undefined (reading 'full_name')
```

The seeded value must be a complete `IntakeFormState`. The exact initial object was captured from a
live run and is reproduced verbatim in §8; overriding `currentStep` on that object works:

```
seed {…full initial state…, "currentStep":3}
 → BODY: "New Estate Case — Guided Intake Step 4 of 7 … Step 4: Family Composition"
 → consoleErrors: []
```

`INTAKE_STEPS` (`src/types/intake.ts:154`) is the seven-name list:
Conflict Check, Client Details, Decedent Info, Family Composition, Asset Summary, Settlement Track,
Review & Save. The runtime order matches this list; the ordering in `GuidedIntakeForm.tsx`'s file
header comment (which puts Settlement Track fourth) does not, and the runtime is authoritative.

### 4.5 Public route behaviour, measured in the browser

| URL | Landed at | Body (truncated) | Console errors |
|---|---|---|---|
| `/auth` | `/auth?mode=signin&redirect=` | `Sign In … Email Password Forgot password? Sign In` | none |
| `/auth?mode=signup` | `/auth?mode=signup&redirect=` | `Create Account … Firm Name Full Name Email Password Confirm Password` | none |
| `/auth/callback` | `/auth?mode=signin&redirect=` | sign-in card | none |
| `/auth/callback?code=not-a-real-code` | unchanged | `invalid request: both auth code and code verifier should be non-empty  Your confirmation link may have expired.  Return to sign in` | **one** — `Failed to load resource: 400` |
| `/share/<alpha token>` | unchanged | `Case Not Found …` | none |
| `/invite/<unknown token>` | **`/settings/team`** | `No organization found…` | none |
| `/onboarding` (anonymous) | `/auth?mode=signin&redirect=` | sign-in card | none |

Two consequences for plan authoring:

- The `/auth/callback?code=…` failure screen emits a console error. A rubric for that step must not
  carry the `no_console_error` assertion, because the 400 is the product behaving correctly.
- `/invite/<bad token>` **silently redirects to the team page** instead of showing an error. See §5.

---

## 5. Product defects found by measurement, and what this phase does with each

Every one of these was found by running the real application, which is the whole point of the phase.
None is a point of Philippine law; all four are mechanical.

### D-1. `createOrganization` is called with the wrong arguments

`src/lib/organizations.ts:10` — `createOrganization(firmName: string, slug?: string)`. The RPC
`create_organization(p_name TEXT, p_slug TEXT DEFAULT NULL)` derives the owner from `auth.uid()`;
it takes no user id. Two call sites pass a user id as the first argument:

```
src/routes/auth.tsx:85          createOrganization(result.user!.id, firmName || 'My Firm')
src/routes/auth/callback.tsx:32 createOrganization(data.user.id, 'My Firm')
```

`src/routes/onboarding.tsx:58` calls it correctly with one argument. So a signup creates an
organization **named after the user's UUID**, with the firm name stored as the slug. `grep` over
`src/` finds no test asserting either call site, so the fix conflicts with nothing.

**Phase 11 fixes it.** A signup journey gate cannot be written against a screen that stores the wrong
firm name.

### D-2. `/invite/$token` swallows a failed acceptance

`accept_invitation` returns `{"success": false, "error": …}` **without raising**, and
`src/routes/invite/$token.tsx:22` does `acceptInvitation(token).then(() => navigate('/settings/team'))`.
An invalid, expired or revoked invitation therefore navigates to the team page as though it had been
accepted. Measured above: `/invite/00000000-0000-4000-8000-0000000000ff` landed on `/settings/team`.

**Phase 11 fixes it** by branching on `result.success`, because JRNY-03's invite-acceptance gate needs
a distinguishable failure state to assert.

### D-3. `settings/team.tsx` reads a table that does not exist

`src/routes/settings/team.tsx:48` does `.from('profiles')`. There is no `profiles` table; the table is
`user_profiles` (confirmed against `information_schema` — the eleven `public` tables are
`case_deadlines, case_documents, case_notes, case_pdfs, cases, clients, conflict_check_log,
organization_invitations, organization_members, organizations, user_profiles`). The `.catch(() => {})`
on line 58 swallows the resulting error, so member names silently never load.

**Phase 11 fixes it.** Invite acceptance lands on `/settings/team`, so this screen is inside JRNY-03.

### D-4. The share RPC — §3 above

**Phase 11 fixes it** with a migration, because COV-06 names shared links.

---

## 6. The decisions this phase must make

`.planning/PLAN-STANDARD.md` §1 requires a plan to name every decision the executor would otherwise
invent. Nine are made here.

### D-A. Table privileges are granted to `authenticated` and `service_role` only, never to `anon`

Per-table, and per-verb: each table receives exactly the verbs its own RLS policies cover. The
complete map is §7. `service_role` receives blanket DML because it bypasses RLS and is the identity
`journey/seed-smoke.mjs` and the isolation suite use. `anon` receives nothing; the only anonymous data
path is `get_shared_case`, which is `SECURITY DEFINER`.

Rejected alternative: `GRANT ALL … TO anon, authenticated, service_role`, the Supabase boilerplate.
Rejected because it hands `anon` privileges the product never uses, and because per-verb grants make
the grant file a readable statement of intent rather than a blanket.

### D-B. The migration also sets `ALTER DEFAULT PRIVILEGES`

Without it, a table added by a future migration silently lands unreachable and the failure appears as
a product bug. The default privileges are set for role `postgres` in schema `public`, matching the
owner every current table already has.

### D-C. The share RPC keeps `004`'s `get_shared_case(UUID)` and drops the `TEXT` overload

Grounded in §3: the TEXT form has never worked (`uuid = text`), and the UUID form's six columns are
exactly the six fields `src/lib/share.ts` declares. Dropping the broken newer form is the smaller
change and the narrower exposure.

### D-D. The live journey runner is `frontend/journey/run.mjs`, exit 0 / 1 / 2

0 = every selected step passed. 1 = a step failed. 2 = the run could not start (stack down, build
failed, chromium missing). This matches `journey/seed-smoke.mjs`'s established contract exactly.

`scripts/ci-gates.sh` maps every nonzero other than 127 to `GATE FAILED`, so an exit 2 is reported as
a gate failure carrying the literal line `JOURNEY CANNOT RUN: <reason>` in the gate log. That is
deliberate and it is the honest outcome: an environment that cannot run the journey gate must stop the
run loudly rather than report a green partial.

### D-E. Three gates, not one

- **G16 — journey registry integrity.** Static. No Docker, no Supabase, no build, no browser. It
  checks that every step in every `journey/steps/*.json` file has a rubric file whose assertion kinds
  are inside Phase 10's closed eight-kind set, that every step has both `references/<stepId>.png` and
  `references/<stepId>.json`, and that no reference exists without a step. Runs on a bare CI runner.
- **G17 — live journey run.** `cd frontend && node journey/run.mjs --all`. Needs Docker, the local
  stack, a build and chromium.
- **G18 — tenant isolation.** `cd frontend && node journey/rls-isolation.mjs`. Needs Docker and the
  local stack, but no build and no browser.

G17 and G18 are separate gates rather than one conjoined command because a red run must say whether
a screen regressed or a tenant boundary did. Those are different investigations.

`G14` stays reserved for Phase 9's unstarted `09-06`; `G15` is Phase 10's. Confirmed unused today:
`grep -c '"G16"' gates.manifest.json gates.manifest.lock` returns 0 and 0, same for `G17` and `G18`.

### D-F. Gate ordering

The current orders are `G5`=1, `G6`=2, `G7`=3, `G12`=4, `G13`=5, `G15`=6, `G1`=7, `G2`=8, `G3`=9,
`G4`=10, `G10`=11, `G11`=12, `G8`=13, `G9`=14. The phase inserts three and renumbers the rest:

| Gate | Before | After |
|---|---:|---:|
| `G5`, `G6`, `G7`, `G12`, `G13`, `G15` | 1–6 | 1–6 unchanged |
| **`G16`** | — | **7** |
| `G1`, `G2`, `G3`, `G4` | 7–10 | 8–11 |
| **`G18`** | — | **12** |
| **`G17`** | — | **13** |
| `G10`, `G11`, `G8`, `G9` | 11–14 | 14–17 |

`G16` sits at 7 because it is static and cheap and belongs with the other static checks. `G18` and
`G17` sit after `G4` because `G17` consumes the WASM binary `G2` produces and the type-clean tree
`G4` proves, and `G18` runs before `G17` because it is the cheaper of the two and a broken tenant
boundary invalidates every screen assertion after it. `order` is explicitly unlocked — `GATES.md` §1:
*"`order` is deliberately not covered by the lock, so reordering is legal."* `G9` stays last, which is
the constraint Phase 4 measured.

### D-G. The CI workflow gains Supabase provisioning

`.github/workflows/inheritance-ci.yml` currently installs Rust, wasm-pack, Node and npm dependencies
and then runs `scripts/ci-gates.sh`. It has no Supabase CLI and never starts a stack, so `G17` would
be red there. The workflow gains a Supabase CLI install and a `supabase start` step before the gate
run. **Unmeasured:** no CI run has ever executed for this project (Phase 1's GATE-04 finding), so
whether `supabase start` succeeds on a GitHub-hosted runner is not known here. It is recorded as a
risk in plan 11-08 rather than asserted.

### D-H. References are approved by `journey/approve.mjs` only, after the rubric passes

`REFERENCES.md` already fixes the flow and forbids a gate from approving its own reference. The
additional rule this phase adds, so an executor cannot approve a broken screen: a step's reference may
be approved **only after** that step's `assertions.json` shows `"passed": true`. The rubric is the
content check; the reference is the layout check; approving before the content check passes would
freeze a wrong screen as correct.

`maxDiffPixels` stays at its default of `0` for every reference this phase approves. Cross-platform
font rasterisation remains **unmeasured**, and `REFERENCES.md` already names that as one of exactly
two legitimate re-approval reasons.

### D-I. Email verification is scoped to the verification **surface**, not to a live confirmation mail

`frontend/supabase/config.toml:209` sets `[auth.email] enable_confirmations = false`. With it false,
`signUp` returns a session, `src/routes/auth.tsx:83` takes the auto-confirmed branch, and the
"Check your email" interstitial is unreachable. The mail container is Mailpit v1.30.2 on port 55324
and its API answers (`GET /api/v1/messages` → 200, `GET /api/v1/info` → 200), so a mail-driven
confirmation journey is *possible*.

It is nonetheless **out of scope for Phase 11**, and the reason is measured: the client is
`supabase-js` v2 with default options, whose `exchangeCodeForSession` is the PKCE flow and requires a
`code_verifier` the initiating client stored — a link minted out of band has none. Confirmed live:
`/auth/callback?code=not-a-real-code` returns
`invalid request: both auth code and code verifier should be non-empty`. Building that path needs
either a config flip plus a stack restart plus a Mailpit reader, or a change to the client's flow
type. All three are unmeasured, and a closed-world plan may not rest on three unmeasured hops.

What Phase 11 verifies instead, and it is real product behaviour on the real verification route:
`/auth/callback` with no code redirects to sign-in, and `/auth/callback?code=<invalid>` renders the
expired-link card. Both are URL-seedable and deterministic. The happy-path confirmation exchange is
recorded as explicitly deferred in plan 11-05 and in `journey/JOURNEY.md`.

---

## 7. The measured policy map — the grant table, transcribed not invented

Read from `pg_policies` on the pristine stack. Each table's grant is the union of the commands its
policies cover; `ALL` expands to the four DML verbs.

| Table | Policies (cmd) | Grant to `authenticated` |
|---|---|---|
| `case_deadlines` | SELECT, INSERT, UPDATE, DELETE | `SELECT, INSERT, UPDATE, DELETE` |
| `case_documents` | SELECT, INSERT, UPDATE, DELETE | `SELECT, INSERT, UPDATE, DELETE` |
| `case_notes` | SELECT, INSERT, DELETE | `SELECT, INSERT, DELETE` |
| `case_pdfs` | ALL | `SELECT, INSERT, UPDATE, DELETE` |
| `cases` | ALL | `SELECT, INSERT, UPDATE, DELETE` |
| `clients` | ALL | `SELECT, INSERT, UPDATE, DELETE` |
| `conflict_check_log` | SELECT, INSERT | `SELECT, INSERT` |
| `organization_invitations` | SELECT, INSERT, UPDATE | `SELECT, INSERT, UPDATE` |
| `organization_members` | SELECT, INSERT, UPDATE, DELETE | `SELECT, INSERT, UPDATE, DELETE` |
| `organizations` | SELECT, UPDATE | `SELECT, UPDATE` |
| `user_profiles` | ALL | `SELECT, INSERT, UPDATE, DELETE` |

`organizations` has no INSERT and no DELETE policy because organizations are created by the
`create_organization` RPC and are never deleted by the product. Granting a verb with no policy would
be inert, and leaving it out keeps the grant file an accurate statement of what the product does.

---

## 8. The exact initial intake draft, captured from a live run

Written by `GuidedIntakeForm` on first mount at `/cases/new`, read back out of `localStorage`:

```json
{"currentStep":0,"conflictCheck":{"outcome":null,"checkedName":"","checkedTin":null,"notes":""},"clientDetails":{"full_name":"","nickname":"","date_of_birth":"","email":"","phone":"","address":"","tin":"","gov_id_type":null,"gov_id_number":"","civil_status":null,"referral_source":"","relationship_to_decedent":null},"decedentInfo":{"full_name":"","date_of_death":"","place_of_death":"","last_known_address":"","civil_status":null,"has_will":false,"property_regime":null,"citizenship":"Filipino","tin":""},"familyComposition":{"heirs":[]},"assetSummary":{"real_property_count":0,"real_property_total_value":0,"has_cash":false,"has_vehicles":false,"vehicle_count":0},"settlementTrack":{"track":null}}
```

This exact object is what plan 11-07 commits as `frontend/journey/fixtures/intake-draft.json`, with
only `currentStep` varied per step.

---

## 9. Fixture rows the phase must add

`frontend/supabase/seed.sql` and `frontend/supabase/fixtures.json` must change together;
`scripts/check-seed-fixture.mjs` fails when a uuid appears in one and not the other. Four additions:

| Purpose | Table | Id | Why it is needed |
|---|---|---|---|
| PDF isolation, Alpha | `case_pdfs` | `a0000000-0000-4000-8000-000000000006` | COV-06 names PDFs; `case_pdfs` is empty today, and an isolation assertion over an empty table passes for the wrong reason |
| PDF isolation, Beta | `case_pdfs` | `b0000000-0000-4000-8000-000000000006` | the row org A must not see |
| Orphan user (no org) | `auth.users`, `auth.identities`, `user_profiles` | `c0000000-0000-4000-8000-000000000002`, `orphan@example.test` | `/onboarding` shows its first step only for a user with no organization; both seeded users already have one |
| Pending invitation | `organization_invitations` | `c0000000-0000-4000-8000-000000000003`, token `c0000000-0000-4000-8000-000000000004` | invite acceptance needs a `pending`, unexpired row whose `email` equals the accepting user's |

`organization_invitations` columns, read from `information_schema`:
`id, org_id, email, role, token, status, invited_by, expires_at, accepted_at, created_at`.
`accept_invitation` matches on `token = p_token AND status = 'pending' AND email = <caller's email>
AND expires_at > NOW()`, and Alpha's `seat_limit` is 5 with 1 member, so the acceptance succeeds.

`case_pdfs` columns: `id, case_id, user_id, org_id, pdf_type, storage_key, file_size, created_at`,
with `pdf_type` constrained to `distribution_summary | tax_computation | demand_letter`.

---

## 10. Steps this phase gates

Eighteen steps. Every one is reachable from a URL plus seeded storage plus, for four of them, a fixed
click sequence.

**JRNY-02 — account (5 steps)**

| Step id | How it is reached |
|---|---|
| `auth-signin` | `GET /auth`, no session |
| `auth-signup` | `GET /auth?mode=signup`, no session |
| `auth-verify-nocode` | `GET /auth/callback`, no session — redirects to sign-in |
| `auth-verify-badcode` | `GET /auth/callback?code=journey-invalid-code`, no session |
| `auth-session-persisted` | seeded Alpha session, `GET /` |
| `auth-signed-out` | seeded Alpha session, `GET /`, click `Sign Out`, land on `/auth` |

(Six ids; "login" and "session persistence" are the same screen reached two ways, so `auth-signin`
covers the login form and `auth-session-persisted` covers persistence.)

**JRNY-03 — org (4 steps)**

| Step id | How it is reached |
|---|---|
| `org-onboarding-firm` | seeded Orphan session, `GET /onboarding` |
| `org-onboarding-profile` | same, then fill `#firm-name` and submit |
| `org-onboarding-done` | same, then submit the profile form |
| `org-invite-accepted` | seeded Orphan session, `GET /invite/<seeded token>` → `/settings/team` |
| `org-invite-rejected` | seeded Orphan session, `GET /invite/00000000-0000-4000-8000-0000000000ff` |

**JRNY-04 — intake (8 steps)**

`intake-step-0` … `intake-step-6`, each seeded with the §8 draft at that `currentStep`, plus
`intake-draft-recovered`, which seeds a draft carrying a filled client name and asserts the value is
present on first paint with no reload.

---

## 11. Environment, measured

```
node -v            → v20.19.5          npm -v → 10.8.2
supabase --version → 2.110.0           docker info → reachable
playwright         → 1.56.1 (devDependency, chromium headless shell v1194 in ~/.cache/ms-playwright)
local stack        → 55321 api, 55322 db, 55323 studio, 55324 mailpit, 55327 analytics — all LISTEN
vite preview       → port 4173 free
npm run build      → exit 0 in 17.2 s
```

`frontend/.env.local` holds `VITE_SUPABASE_URL=http://127.0.0.1:55321` and the anon key;
`scripts/setup-env.sh` deliberately keeps the service-role key out of that file, and
`journey/seed-smoke.mjs` obtains it at runtime from `supabase status -o env` and never writes it
anywhere. Every new script in this phase follows that same rule.

---

## 12. Validation architecture

The feedback loop for this phase is three-tiered, fastest first:

1. **Per task, static** — `node scripts/check-journey-registry.mjs` (new, ~1 s) and
   `node scripts/check-plan-closed-world.mjs`. No Docker, no browser.
2. **Per task, live single step** — `cd frontend && node journey/run.mjs --step <stepId>` (~15 s once
   a build exists). This is the loop the step-authoring plans iterate on.
3. **Per wave** — `cd frontend && node journey/run.mjs --all` and
   `cd frontend && node journey/rls-isolation.mjs`.
4. **Before phase verification** — `bash scripts/ci-gates.sh`, expected to print
   `ALL GATES PASSED (17/17)`.

The whole-suite counter moves from 14 to 17 because this phase registers exactly three gates.

---

## 13. No point of Philippine law arises in this phase

Every decision above is a schema privilege, a function signature, a route, a selector, an exit code or
a file path. Nothing in this phase reads, interprets or applies the Civil Code, and nothing is added to
`.planning/LAWYER-AGENDA.md`.
