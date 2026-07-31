# The journey harness

This is the contract Phases 11 and 12 read before writing a single journey gate. Everything here
already exists and is proven by gate **G15** (`node journey/selftest.mjs`), so no later phase has to
re-derive a seam.

The harness is deliberately narrow: **no Docker, no Supabase, no built application, no network.** Every
mechanism below is proven against the committed fixtures in `journey/fixtures/`. Anything needing more
than that belongs to Phase 11, not here.

---

## Seeding seams

JRNY-01: any UI state a gate needs must be reachable **without clicking through the steps before it**.
A real browser cannot reach into a React tree — it can set a URL, a cookie, or web storage, and nothing
else. These are the seams that exist today.

| State | Seam | Driven by | Measured at |
|---|---|---|---|
| Auth session | `seedAuthSession(page, origin, session)` — writes a supabase-js session into `localStorage` under `sb-<projectRef>-auth-token` before first paint | `journey/seed.mjs` | `src/lib/supabase.ts`, `src/hooks/useAuth.ts`; the derived key is checked against a real session by `journey/seed-smoke.mjs` |
| Org + case rows | direct table writes with a service-role client; ids come from `readFixtures()` | `journey/seed.mjs`, `journey/seed-smoke.mjs` | `supabase/fixtures.json`, `supabase/seed.sql` |
| Guided-intake draft | `seedLocalStorage(page, origin, { [INTAKE_DRAFT_KEY]: … })` | `journey/seed.mjs` | `src/components/intake/GuidedIntakeForm.tsx:24` (`inheritance-intake-draft`) |
| Quick-calc anonymous gate | `seedSessionStorage(page, origin, { [QUICK_CALC_KEY]: 'true' })` | `journey/seed.mjs` | `src/components/quick-calc/QuickCalcWidget.tsx:14` (`quick-calc-used`, sessionStorage — not localStorage) |
| Route param (`$caseId`, `$token`) | navigate directly to the URL with a known id from `readFixtures()` | the URL | `src/router.ts` |
| Succession wizard step | search param **`step`** (integer `0`–`5`), applied with `seedSearchParams(url, { step })` | `src/components/wizard/WizardContainer.tsx` → `readInitialWizardState()` | added by plan 10-05 |
| Succession wizard will step | search param **`hasWill`**, the literal string `1` | same helper | see the known limitation below |
| Estate-tax tab | search param **`tab`** (integer `0`–`7`), applied with `seedSearchParams(url, { tab })` | `src/components/tax/EstateTaxWizard.tsx` → `readInitialTab()` | `TAB_COUNT` is `8` at `src/types/estate-tax.ts:282` |

Two rules that are easy to get wrong:

- **Seed storage with `addInitScript`, never with an `evaluate` after navigation.** An `evaluate` runs
  after the app has mounted and already read storage — too late for a draft-recovery path, which is
  exactly the path Phase 11 has to verify. `seedLocalStorage` and `seedSessionStorage` already do this.
- **All three search params are additive and clamped.** With no param present both wizards behave
  exactly as they did before plan 10-05. A value that is non-numeric, negative or out of range resolves
  to the first step or tab — never to an undefined step that renders a blank card a screenshot gate
  could then approve as a reference.

The wider inventory of application state and where each piece lives is
`.planning/codebase/ARCHITECTURE.md`, section **State Boundaries and Seeding Seams** (fifteen rows).
This table is not a replacement for it — it lists only the seams that have callable code today.

---

## Writing a rubric

A rubric is a committed JSON document: `{ "rubricId": "<string>", "assertions": [ … ] }`. Each assertion
needs an `id` (unique within the rubric) and a `kind`. **The kind set is closed.** A kind outside it is
rejected with a thrown `RUBRIC INVALID:` error — never skipped, never interpreted, never passed. That
rejection is what makes JRNY-09's "never free-form judgment" enforceable rather than aspirational.

| `kind` | Required fields | Passes when |
|---|---|---|
| `text_equals` | `selector`, `expect` | The selector's trimmed `innerText` equals `expect` exactly |
| `text_contains` | `selector`, `expect` | The selector's `innerText` contains `expect` |
| `text_absent` | `selector`, `expect` | No element matching the selector contains `expect` |
| `element_visible` | `selector` | Exactly one element matches and it is visible |
| `element_absent` | `selector` | Zero elements match |
| `element_count` | `selector`, `expect` | The number of matching elements equals the integer `expect` |
| `attribute_equals` | `selector`, `attr`, `expect` | The selector's `attr` attribute equals `expect` |
| `no_console_error` | none | `page.__journeyConsoleErrors` is empty |

Worked example: **`journey/rubrics/fixture-basic.json`** — eight assertions, one per kind, all holding
against `fixtures/basic.html` and three of them failing against `fixtures/mutated.html`.

`evaluateRubric(page, rubric)` returns `{ rubricId, passed, total, failedCount, assertions[] }`, and each
assertion result carries `id`, `kind`, `passed`, `expected` and `actual` — and deliberately no prose
field. Every assertion is evaluated; the loop never short-circuits.

Selectors that match zero elements **fail** their assertion (except `element_absent` and `text_absent`,
where zero is the passing outcome). Selectors that match more than one element fail `text_equals`,
`text_contains`, `element_visible` and `attribute_equals`, which are singular by intent.

---

## The five failure markers

Not restated here, so the two documents cannot drift apart: see **`journey/REFERENCES.md`**, section
"The five markers". That document also holds the re-approval flow, the prohibition on raising
`maxDiffPixels` to clear a red gate, and why no golden image of the real application is committed yet.

---

## Where artifacts land

Every step writes into a gitignored per-run tree:

```
frontend/.journey-runs/<runStamp>/<stepId>/actual.png       always
frontend/.journey-runs/<runStamp>/<stepId>/reference.png    when a reference existed
frontend/.journey-runs/<runStamp>/<stepId>/diff.png         when a pixel comparison ran
frontend/.journey-runs/<runStamp>/<stepId>/assertions.json  always — the full RubricResult
frontend/.journey-runs/<runStamp>/<stepId>/FAILURE.txt      only when the step failed
```

- `<runStamp>` is `new Date().toISOString().replace(/[:.]/g, '-')`, chosen so **lexical descending order
  equals newest-first** — that is what makes the approval command's "newest run" selection a sort.
- `.journey-runs/` is in `frontend/.gitignore`. A failing 3am run's images must never be absorbed into
  an unrelated commit by this monorepo's concurrent auto-committer.
- Retention is capped at **20 run directories** (`MAX_RETAINED_RUNS` in `journey/artifacts.mjs`), so a
  month-long unattended loop cannot fill the disk.
- `FAILURE.txt`'s first line names **every** marker that fired. A step failing both mechanisms names
  both; collapsing them would destroy the distinction the harness exists to preserve.

---

## Known limitation: the will step

`WizardContainer`'s `hasWill` is local React state initialised to `false`, and the `will` entry in
`WIZARD_STEPS` carries `conditional: true`. So the will step is **not reachable from `step` alone** — a
gate that wants it must pass `hasWill=1` alongside `step`, and with `hasWill=1` present the valid range
of `step` becomes `0`–`5` instead of `0`–`4`.

This is the only wizard state not reachable from `step` by itself.

---

## What Phase 10 deliberately did not build

- **No gate screenshots the real application.** Everything here runs against committed HTML fixtures.
  Driving the built app needs a build and, for most screens, a database — see `10-RESEARCH.md` §6.
  **Phases 11 and 12 own that.**
- **No golden reference of a real screen is committed.** `journey/references/` ships holding only
  `.gitkeep`. Cross-platform font rasterisation is unmeasured because no CI run has ever executed for
  this project, so a committed golden would be an unmeasured claim — `10-RESEARCH.md` §5. G15 generates
  its reference at run time from a fixture instead, which tests the mechanism without importing the
  portability problem. **Phases 11 and 12** capture the real references, using the flow in
  `REFERENCES.md`.
- **`journey/seed-smoke.mjs` is not a registered gate.** It needs Docker and a running local Supabase
  stack, which GitHub Actions has neither of. Run it on demand; it exits **2** (cannot-run), not 1, when
  the stack is down.

---

## The account journey, and what it does not cover

Phase 11 registered the JRNY-02 account steps. Each is a record in `journey/steps/account.json`,
driven by `node journey/run.mjs`, asserted by a rubric in `journey/rubrics/` and layout-frozen by a
reference in `journey/references/` at `maxDiffPixels` `0`.

**Covered — five steps, all green:**

| Step id | How it is reached |
|---|---|
| `auth-signin` | `/auth` with no session; the sign-in card is the default mode. |
| `auth-signup` | `/auth?mode=signup`; the mode is a validated search param, so the signup card needs no click-through. |
| `auth-verify-nocode` | `/auth/callback` with no `code`; the route redirects to `/auth?mode=signin`, which is the "verification link with nothing in it" state. |
| `auth-verify-badcode` | `/auth/callback?code=journey-invalid-code`; GoTrue refuses the exchange and the route renders its error block. |
| `auth-session-persisted` | `/` with a real Alpha session installed in `localStorage` before first paint; `src/main.tsx` reads it on mount, so the dashboard arrives with no reload. |

`auth-verify-badcode` is the **only** step in the whole registry that sets `allowConsoleErrors`. That
is not a concession: GoTrue legitimately answers 400 to a code with no verifier, so the console error
is the product behaving correctly. Every other step carries a `no_console_error` assertion and the
flag stays `false`.

### Deferred: the happy-path email confirmation

The confirmation-mail round trip is **not** verified, and the reason is measured rather than assumed.

`frontend/supabase/config.toml` sets `[auth.email] enable_confirmations = false`. With that setting
`signUp` returns a session immediately, `src/routes/auth.tsx` takes the auto-confirmed branch, and the
"Check your email" interstitial is **unreachable in this stack** — which is also why the
`auth-check-email` testid exists on a screen no step drives.

Even with confirmations enabled, the exchange cannot be driven from outside the browser that started
it: supabase-js uses PKCE, so `exchangeCodeForSession` needs a `code_verifier` that only the
initiating client holds. A link minted out of band therefore fails with exactly
`invalid request: both auth code and code verifier should be non-empty` — the live string that
`auth-verify-badcode` now asserts against.

The work is deferred, not impossible: the local mail container is Mailpit v1.30.2 on port 55324 and
its `GET /api/v1/messages` endpoint answers 200, so a future plan can read the real confirmation link
out of the inbox and drive it in the same browser context that initiated the signup.

### BLOCKED, not registered: `auth-signed-out`

Logout has **no** passing gate. `journey/rubrics/auth-signed-out.json` is committed but **no step
names it and no reference was approved for it**, so the registry does not claim coverage it does not
have.

What was measured, with a real Alpha session, clicking the real `sign-out-desktop` control on `/`:

```
URL before click: http://127.0.0.1:4173/
URL after click:  http://127.0.0.1:4173/
auth-page count: 0     dashboard-page count: 0     sign-out-desktop count: 0
console errors: []
sb- localStorage keys after signout: []
```

The sign-out itself works and works safely — the supabase session key is **removed** from
`localStorage`, so a reload cannot restore it, and the signed-in chrome is gone. But the application
stays on `/` and renders the anonymous marketing landing page; it does **not** navigate to `/auth`.
The planned rubric asserts `[data-testid="auth-page"]` visible and `auth-title` equal to `Sign In`,
neither of which exists on that page.

Whether logout should land on the sign-in card or on the public landing page is a **product decision
that plan 11-05 does not contain**, and no research measurement recorded this state. Deleting the two
failing assertions would have made the step pass while quietly redefining what "logout is verified"
means, so the step was withheld instead. An owner decision is needed: either the route redirects to
`/auth` after sign-out (a source change, and then the rubric as written is correct), or landing on the
public page is intended (and the rubric should assert the landing page plus the absence of the session
key).

---

## The organization journey, and two defects it found

**Covered — two steps, both green:**

| Step id | How it is reached |
|---|---|
| `org-invite-accepted` | `/invite/<the seeded pending token>` as the org-less Orphan user, after the `orphan-invitation-pending` reset. The captured page is `/settings/team` showing Test Firm Alpha at `Seats: 2 / 5` with `orphan@example.test` as `Attorney` — the acceptance really happened. |
| `org-invite-rejected` | `/invite/00000000-0000-4000-8000-0000000000ff`, a token deliberately absent from `fixtures.json`. The page renders `Invitation expired, revoked, or not found` and does **not** reach `/settings/team`. |

`org-invite-rejected` is the step that holds the D-2 fix in place. Before it, `/invite/<any token>`
navigated to `/settings/team` on any resolved promise, so a refused invitation was indistinguishable
from an accepted one.

Both steps name a reset, because both mutate the database. `journey/resets.mjs` defines
`orphan-no-org` and `orphan-invitation-pending`; a step that mutates and names no reset is
prohibited, since the second run would then assert against a different fixture than the first.

### BLOCKED, not registered: the three onboarding steps

`org-onboarding-firm`, `org-onboarding-profile` and `org-onboarding-done` have committed rubrics but
**no step record and no approved reference**. All three fail their `no_console_error` assertion, and
the cause is two real product defects rather than harness noise.

**Defect 1 — a 406 on every `/onboarding` load.**

```
HTTP 406 http://127.0.0.1:55321/rest/v1/organization_members?select=org_id&user_id=eq.<orphan>&limit=1
Console: "Failed to load resource: the server responded with a status of 406 (Not Acceptable)"
```

`getUserOrganization` (`src/lib/organizations.ts:32`) calls `.single()` on a query that legitimately
matches **zero** rows for a user with no organization. PostgREST answers 406 for `.single()` over an
empty result. The calling code handles it (`if (error || !data) return null`), so the screen is
correct — but every anonymous-of-org page load logs a browser error. `.maybeSingle()` is the query
that expresses "zero or one row".

**Defect 2 — the attorney profile is silently discarded.**

```
HTTP 400 http://127.0.0.1:55321/rest/v1/user_profiles
Console: "Failed to load resource: the server responded with a status of 400 (Bad Request)"

Reproduced directly:
UPSERT ERROR: { "code": "23502",
  "message": "null value in column \"email\" of relation \"user_profiles\" violates not-null constraint" }
```

`saveFirmProfile` (`src/lib/firm-profile.ts:97`) builds its upsert payload from the supplied fields
only and never includes `email`, but `user_profiles.email` is `NOT NULL` with no default. Postgres
evaluates the proposed INSERT row before the `ON CONFLICT` clause, so the upsert fails **for every
user**, not only for a new one.

`src/routes/onboarding.tsx:72` catches it with an empty `catch` commented "Non-fatal — profile can be
updated later in Settings" and advances to the done screen regardless. The user sees
`You're all set!` while nothing was saved:

```
select id, counsel_name from user_profiles where id='<orphan>';
c0000000-0000-4000-8000-000000000002|          <-- counsel_name is empty
```

That is silent data loss on a screen that reports success, which this project ranks as strictly worse
than a loud failure.

Neither defect could be fixed here: plan 11-06 constraint 4 forbids editing application source, and
constraint 5 forbids deleting or loosening the `no_console_error` assertion. Setting
`allowConsoleErrors` on these steps was also rejected — that flag exists for a console error that is
*correct* product behaviour, and silencing these two would hide exactly what the gate just found. The
three steps are therefore withheld until the defects are fixed, at which point the rubrics are ready
to register unchanged.

**Confirmed working despite the above:** the organization created through the real onboarding form is
named correctly, which is the D-1 fix taking effect in the running application:

```
select name from organizations where id not in (<alpha>, <beta>);
Journey Test Firm
```

Before the fix this row would have been named after the user's uuid, with the firm name stored as the
slug. No unit test in this repository covers that.
