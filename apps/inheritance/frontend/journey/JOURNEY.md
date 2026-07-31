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
