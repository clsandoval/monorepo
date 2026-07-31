# Phase 12: Wizard & Output Journey Gates - Research

**Researched:** 2026-07-31
**Domain:** Browser-driven verification of an existing React 19 / TanStack Router SPA against a real
local Supabase, using the journey harness Phases 10 and 11 already built.
**Confidence:** HIGH — every number, path, exit code and defect below was measured in this working
tree during planning, not recalled.

## Summary

Phase 12 adds no new technology. Phase 10 installed and pinned the entire stack
(`playwright@1.56.1`, `pixelmatch@7.2.0`, `pngjs@7.0.0`), Phase 10 built the harness
(`frontend/journey/`), and Phase 11 proved it end to end against a real local stack — fifteen
registered steps, fifteen approved references, `bash scripts/ci-gates.sh` exiting **0** with
`ALL GATES PASSED (17/17)`. This phase's job is to point that same harness at the five remaining
surfaces named by JRNY-05, JRNY-06, JRNY-07, JRNY-08 and JRNY-11, and to add the two deterministic
non-screenshot checks those requirements need that a DOM rubric cannot express: exact peso parity
against engine output, and the exact field set an anonymous share link exposes.

One precondition is **not** satisfied and had to be measured rather than assumed. ROADMAP Phase 12
criterion 1 requires the succession-wizard gates to run "only after the single-classifier fix from
Phase 9 is in place". Phase 9's `09-04` is BLOCKED, so `ReviewStep.tsx:34` still carries its own
`predictScenario()`. It is live, and it is wrong: on the exact case this project already seeds into
its fixture database, it prints one code and the engine prints another. Approving a screenshot of
that badge would freeze a wrong legal answer as the expected result, which the ROADMAP calls out as
worse than no gate at all. Section 2 records the measurement and section 3 records the fix, which
turns out to need no Rust change, no new WASM export, and none of the three things that blocked
Phase 9.

**Primary recommendation:** land the engine-backed badge first (one component, one hook, three
tests, zero engine changes), grow the seed by one already-computed case, widen the journey
registry's frozen requirement list, then register the twenty-eight remaining screens plus three new
gates — **G19** money parity, **G20** share exposure, **G21** SEO smoke — ending at
`ALL GATES PASSED (20/20)`.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| JRNY-05 | Every step of the succession wizard is verified step by step | §4.1 — six screens, all with root testids, all reachable from `?step=` / `?hasWill=1`; §3 removes the wrong-badge blocker |
| JRNY-06 | Every tab of the estate-tax wizard is verified tab by tab | §4.2 — eight tabs, all eight already carry root testids, all reachable from `?tab=` |
| JRNY-07 | The results view and family-tree visualizer are verified, including that displayed peso figures match engine output exactly | §4.3 (screens) and §5 (the parity mechanism, which a DOM rubric cannot express) |
| JRNY-08 | The public share-link view is verified, including that it exposes only what it should | §4.4 — three reachable states; §6 — the RPC returns exactly six columns, enumerated in migration 015 |
| JRNY-11 | Landing, blog, and SEO routes have a smoke gate: renders, no console error, no 404 | §4.5 — fourteen routes measured; §7 — why this is a separate script and not fourteen reference images |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Transcribed, not paraphrased. Every plan in this phase inherits all five.

1. **Commit scope.** Every commit stages explicit paths via `bash scripts/safe-commit.sh`.
   `git add -A`, `git add .` and `git commit -a` are prohibited — a concurrent auto-committer runs on
   this monorepo. Enforced by `node scripts/check-commit-discipline.mjs` (gate G7).
2. **Gate immutability.** `gates.manifest.json` may only grow. Removing a gate, changing a locked
   command string, or turning a blocking gate non-blocking is owner action, never agent action.
   Enforced by `node scripts/check-gate-manifest.mjs` (gate G5).
3. **Halt over guess.** A gate that cannot run, a decision a plan does not contain, or any point of
   Philippine law produces a **BLOCKED** report with pasted command output.
4. **Silent wrongness is categorically worse than loud failure.** This governs every tradeoff in
   this phase, and it is the whole argument of §2 and §3.
5. **No test, assertion or gate may be weakened.** `frontend/test-baseline.json`,
   `gate-skips.lock`, `engine/defect-baseline.json`, `assertion-baseline.json` and
   `coverage-zero.lock` may only shrink and are read-only in this phase.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Reaching a wizard step or tax tab without click-through | Browser / Client | — | Phase 10 added `?step=`, `?hasWill=1` and `?tab=` read-once-at-mount seams; a browser can set a URL and nothing else |
| Reaching a results view, a family tree, a share page | Database / Storage | Browser | These render from `cases.output_json`; the only seam is seeding the row |
| Deciding what a peso figure should be | Engine (Rust → WASM) | — | The engine is the single source of truth for money; the parity gate recomputes rather than restating |
| Deciding which fields an anonymous link exposes | Database (RPC) | — | `get_shared_case` is `SECURITY DEFINER` and its `RETURNS TABLE` list is the exposure contract |
| Rendering landing/blog content | Browser / Client | CDN / Static | Pure client routes with no data access; hence a render-plus-console-plus-network smoke, not a data assertion |

## 1. What already exists — measured, not assumed

The harness is complete and does not need extending except in one enumerated place (§8).

| Module | What it gives Phase 12 | Measured |
|---|---|---|
| `frontend/journey/run.mjs` (416 lines) | Registry reader, validator, per-step driver, three-valued exit 0/1/2 | Read in full |
| `frontend/journey/rubric.mjs` | Eight closed assertion kinds; an unknown kind throws `RUBRIC INVALID:` | `ASSERTION_KINDS` exported and imported by the static gate |
| `frontend/journey/actions.mjs` | Four action kinds: `click`, `fill`, `waitForSelector`, `waitForUrlContains` | Read in full |
| `frontend/journey/seed.mjs` | `seedAuthSession`, `seedLocalStorage`, `seedSessionStorage`, `seedSearchParams`, `readFixtures` | Read in full |
| `frontend/journey/session.mjs` | `SESSION_KINDS = ['none','alpha','beta','orphan']`, real password grants, `adminClient` | Read in full |
| `frontend/journey/resets.mjs` | `RESETS = { noop, 'orphan-no-org', 'orphan-invitation-pending' }` | Read in full |
| `frontend/journey/diff.mjs` | Five markers: `RUBRIC FAILURE`, `DIFF FAILURE`, `REFERENCE MISSING`, `REFERENCE SIZE MISMATCH`, `STEP ERROR` | Named in `REFERENCES.md` |
| `frontend/journey/approve.mjs` | The only writer into `journey/references/` | `run.mjs` header states and greps clean |
| `scripts/check-journey-registry.mjs` (289 lines) | Static gate G16: nine violation markers | Read in full |

Environment, probed on this machine during planning:

| Dependency | Required by | Available | Version |
|---|---|---|---|
| Local Supabase stack | G17, G18, and every Phase 12 live gate | ✓ running | `supabase status -o env` returns keys; ports 55320–55329 |
| `playwright` | all browser gates | ✓ | `frontend/node_modules/playwright` present |
| `engine/target/release/inheritance-engine` | generating the seeded `output_json` | ✓ | ran successfully on two example cases |
| Built WASM (`frontend/src/wasm/pkg/inheritance_engine_bg.wasm`) | the money-parity gate | ✓ | gate G2 rebuilds it every run |

**Missing dependencies with no fallback:** none.

## 2. The blocker, measured live

`ReviewStep.tsx:34-63` defines a local `predictScenario(hasWill, familyTree)`. It is not dead code:
line 223 calls it and line 289 renders its result inside the "Predicted:" badge.

Two engine runs, executed during planning against the committed release binary:

```
$ ./target/release/inheritance-engine < examples/cases/02-married-3lc.json   →  I2 Intestate
$ ./target/release/inheritance-engine < examples/cases/01-single-lc.json     →  I1 Intestate
```

`predictScenario` on the same two shapes:

| Case | Family | `predictScenario` branch | It returns | Engine returns |
|---|---|---|---|---|
| `02-married-3lc.json` | 3 legitimate children + spouse | `hasLC && hasSS` → `` `${prefix}1` `` | **I1** | **I2** |
| `01-single-lc.json` | 1 legitimate child, no spouse | `hasLC` → `` `${prefix}2` `` | **I2** | **I1** |

The two codes are **swapped** on the most common Philippine family shapes. `02-married-3lc.json` is
not an arbitrary example: `frontend/supabase/seed.sql:15` states that the seeded case's `input_json`
is a **verbatim copy** of that file, so the divergence sits on the exact row every Phase 12 wizard
gate will drive.

Consequence, stated plainly: registering a `wizard-review` step and approving its reference without
fixing this would commit a PNG in which the badge reads `I1` for a case the engine calls `I2`, and
a green gate would then certify it every run. ROADMAP Phase 12 criterion 1 exists to prevent exactly
that.

## 3. Why the fix is cheap here, and why it is not the thing that blocked Phase 9

Phase 9's `09-01` was BLOCKED because it asserted `classify_scenario().succession_type ==
run_pipeline().succession_type`, which is false on 59 of 173 committed inputs (step 6 overrides step
3's provisional value). `09-04` was BLOCKED because it needed a `classify_json` export that
`frontend/src/wasm/pkg/inheritance_engine.d.ts` does not have.

Both obstacles are irrelevant to the badge, and this was verified by reading the component:

1. **The badge renders `scenario_code` only.** `ReviewStep.tsx:289` renders `{scenario}`, typed
   `ScenarioCode`. The succession type shown at line 259 is `hasWill ? 'Testate' : 'Intestate'` — a
   form field, not an engine value. So no `succession_type` claim is needed anywhere.
2. **`scenario_code` already crosses the WASM boundary.** `engine/src/wasm.rs` exports
   `compute_json`, `frontend/src/wasm/bridge.ts:436` exports `compute()`, and `EngineOutput` carries
   `scenario_code` — `ResultsHeader.tsx:54` already renders it as `data-testid="scenario-badge"`.
   Agreement with the pipeline is therefore exact by construction, not a 173-case measurement.
3. **`ReviewStep` already holds a complete `EngineInput`.** Line 215: `const formValues = watch()`.

The remaining question is what the badge shows when the engine has not answered yet or refuses the
input — and that question is **answered in this file rather than left to an executor**, because
`ReviewStep.tsx` already answers it three times for other values: lines 253, 268 and 269 render the
literal `—` for an absent amount, an absent decedent name and an absent date of death. The badge
follows the file's own existing convention: `—` until a scenario code arrives, and `—` if the engine
rejects the input. That is a transcription of an existing convention, not a new design choice.

`compute()` can reject: the owner's ruling in `d71f9150e` made the engine refuse inputs it cannot
distribute conservatively. A half-filled wizard form is exactly such an input, so the rejection path
is the common case during editing and must not surface as an unhandled rejection.

Three committed tests exercise the badge, all currently passing and none in
`frontend/test-baseline.json`:

- `renders predicted scenario badge` — `getByText(/Predicted/i)`; unaffected.
- `shows I-prefix scenario for intestate with LC + spouse` — asserts `/I\d/`.
- `shows T-prefix scenario for testate` — asserts a `T` prefix.

Phase 9's recorded decision was to **strengthen** these from a regex to exact codes. Phase 12 keeps
that: each becomes an exact-code assertion whose expected value is obtained by running the release
binary on the exact input the test builds. Adding `await`/`findBy` to reach an async render is not
loosening — that is Phase 9's own recorded finding and it carries over unchanged.

Blast radius, measured: `grep -rln "ReviewStep" src` returns exactly three files besides the
component — `WizardContainer.tsx`, `ReviewStep.test.tsx` and `intake/GuidedIntakeForm.tsx`. The
third imports `IntakeReviewStep`, a different component with its own `intake-review-step` testid.

## 4. The twenty-eight screens, and how each is reached

### 4.1 Succession wizard — six screens (JRNY-05)

`WIZARD_STEPS` at `WizardContainer.tsx:19-26`, in order: `estate`, `decedent`, `family-tree`,
`will` (`conditional: true`), `donations`, `review`. Root testids exist on all six:
`estate-step`, `decedent-step`, `family-tree-step`, `will-step`, `donations-step`, `review-step`.

Index arithmetic, transcribed from `readInitialWizardState()`:

| Screen | URL |
|---|---|
| Estate | `/cases/<alpha case>?step=0` |
| Decedent | `/cases/<alpha case>?step=1` |
| Family tree | `/cases/<alpha case>?step=2` |
| Will | `/cases/<alpha case>?step=3&hasWill=1` |
| Donations | `/cases/<alpha case>?step=3` |
| Review | `/cases/<alpha case>?step=4` |

`src/routes/cases/$caseId.tsx` declares no `validateSearch`, so the router does not strip the extra
params and `readInitialWizardState()` reads `window.location.search` directly.

### 4.2 Estate-tax wizard — eight screens (JRNY-06)

`TAB_NAMES` at `src/types/estate-tax.ts:271-281` and `TAB_COUNT = 8`. Every tab component carries a
root testid, verified one file at a time:

| `tab` | Name | Root testid |
|---:|---|---|
| 0 | Decedent | `decedent-tab` |
| 1 | Executor | `executor-tab` |
| 2 | Real Props | `real-properties-tab` |
| 3 | Personal | `personal-properties-tab` |
| 4 | Other | `other-assets-tab` |
| 5 | Deductions | `ordinary-deductions-tab` |
| 6 | Spec. Ded. | `special-deductions-tab` |
| 7 | Filing | `filing-amnesty-tab` |

URL: `/cases/<alpha case>/tax?tab=<n>`, session `alpha` (the route's `beforeLoad` redirects an
anonymous visitor to `/auth`).

**Decision recorded here so no plan has to make it:** the tax wizard is driven from
`createDefaultEstateTaxState()` and **no `tax_input_json` is seeded**. `$caseId.tax.tsx:56` applies
the stored blob only when present. Seeding one would mean inventing property valuations and
deduction figures, which is the beginning of a tax judgment; the default state is deterministic,
renders every tab, and carries no legal content at all.

### 4.3 Results view and family tree — two screens (JRNY-07)

`ResultsView.tsx:42` is `data-testid="results-view"`; it composes `results-header`,
`distribution-section` (containing `heir-table` and `distribution-chart`),
`share-breakdown-section`, `narrative-panel`, `warnings-panel`, `computation-log`, `actions-bar`
and a lazily-imported `FamilyTreeTab` (`family-tree-tab`, `tree-controls`, `tree-container`,
`tree-legend`, and per-node `tree-node-<personId>`).

Reaching it needs `cases.output_json`, which the seed does not currently write —
`grep -n output_json frontend/supabase/seed.sql` returns nothing. `$caseId.tsx:66` routes to
`phase: 'results'` when the row has one and to `phase: 'wizard'` when it does not.

**The seed must not be made to write one.** `scripts/check-seed-fixture.mjs` carries an explicit
Phase 3 rule with its own marker:

```
SEED WRITES OUTPUT — <seed.sql> mentions output_json; a seeded engine result is a per-heir
                     peso figure nothing computed
```

The same script also byte-compares every `$json$`-quoted block in the seed against
`engine/examples/cases/02-married-3lc.json`, so a third block carrying a different family tree is
rejected as `SEED INPUT NOT COPIED`. Both rules are correct and neither is weakened in this phase.

**So the results view is reached by making the product compute it.** The results step lands on
`/cases/<alpha case>?step=4`, clicks the review screen's compute button, and waits for
`results-view`. That path is strictly stronger verification than a seeded blob — it exercises the
real WASM call, the real `updateCaseOutput` write and the real render — and it uses only action
kinds the harness already has (`click`, `waitForSelector`). Plan 12-01 adds the one hook it needs,
`data-testid="compute-distribution"`, while it is already editing that file.

Two named resets carry the repeatability, added to `journey/resets.mjs`:

| Reset | What it does | Which steps declare it |
|---|---|---|
| `case-alpha-no-output` | sets the Alpha case's `output_json` to `null` | all six wizard steps, both results steps, the computed-not-yet share step |
| `case-alpha-computed` | reads the Alpha case's own `input_json`, runs the built engine over it, writes the result to `output_json` | the populated share step |

`case-alpha-computed` does not violate the `SEED WRITES OUTPUT` rule, and the distinction is exact
rather than convenient: that rule forbids a **static peso literal committed to SQL that nothing
computed**. This reset computes, at run time, with the same `inheritance_engine_bg.wasm` the product
loads and gate G2 rebuilds. The shared loader lives in one place — `journey/engine.mjs` — and both
this reset and the money-parity gate of §5 import it, so no second engine call site exists.

**Consequence for the wizard steps of §4.1:** every one of them declares `case-alpha-no-output`,
because the results step leaves an `output_json` behind and a wizard URL on a computed case would
render results instead of a wizard.

`FamilyTreeTab` is `React.lazy`; its chunk loads after first paint, so its step needs a
`waitForSelector` on `[data-testid="tree-container"]` before the screenshot.

### 4.4 Share view — three screens (JRNY-08)

`src/routes/share/$token.tsx` has exactly three terminal states, each with a root testid:
`shared-case-loading`, `shared-case-not-found`, `shared-case-content`. Within `shared-case-content`
there are two sub-states, chosen at line 106 by whether `output_json` and `input_json` are both
present.

Seeded reachability, from `seed.sql:134` (`share_enabled` true for alpha, false for beta). No new
fixture id and no seed row is added; the two Alpha states are separated by which reset the step
declares:

| State | URL | Reset | Renders |
|---|---|---|---|
| Populated | `/share/<alpha share token>` | `case-alpha-computed` | `shared-case-content` with a heir table |
| Computed-not-yet | `/share/<alpha share token>` | `case-alpha-no-output` | `shared-case-content` with `Results have not been computed for this case yet.` |
| Disabled | `/share/<beta share token>` | `noop` | `shared-case-not-found` |

All three are anonymous (`session: "none"`), because the route hangs off `publicRootRoute`.

### 4.5 Landing, blog and SEO — fourteen routes (JRNY-11)

Enumerated by `grep -n "path: '"`:

```
/                                     /blog
/intestate-succession-calculator      /blog/intestate-vs-testate
/legitimate-share-calculator          /blog/how-to-compute-legitime
/spouse-and-children-inheritance      /blog/illegitimate-children-rights
/illegitimate-child-inheritance       /blog/no-will-philippines
/parents-inheritance-share            /blog/preterition-explained
/no-will-inheritance-philippines      /blog/parents-inheritance-share
```

Every landing route renders `LandingPageLayout`, whose line 52 is an `<h1>`. Every blog post renders
`BlogLayout`, whose line 42 is an `<h1>`. `/blog` renders `BlogIndex`, whose line 38 is an `<h1>`.
`/` renders two `<h1>` elements. None of the thirteen non-root routes carries a `data-testid`.

## 5. Peso parity — the mechanism a rubric cannot express

The rubric's eight kinds are DOM predicates over **literal expected strings** written into a
committed JSON file. JRNY-07 asks for something stronger: that a displayed figure equals what the
engine computes, checked against the engine and not against a transcription of it. A `text_equals`
assertion carrying `₱2,500,000` would be a transcription — correct on the day it is written and
silently wrong the day the engine changes.

The measured design:

1. Read the Alpha case's `input_json` from the database with the service-role client.
2. Recompute with the **same artifact the product uses**: `initSync` over
   `src/wasm/pkg/inheritance_engine_bg.wasm` and `compute_json`, exactly as
   `src/wasm/__tests__/wasm-real.test.ts` already does from Node — through the single shared loader
   `journey/engine.mjs` that `journey/resets.mjs` also imports. Gate G2 rebuilds that binary every
   run, so the gate can never test a stale engine.
3. Drive `/cases/<alpha case>?step=4` in the browser, click `compute-distribution`, wait for
   `results-view`.
4. Read each heir row's displayed amount and **parse it back to centavos** —
   `₱1,234.56` → `123456n`. Parsing is the inverse of `formatPeso`, not a second implementation of
   it, so it introduces no second source of truth for money.
5. Assert, as integers: per-heir amounts match by heir id; the row count matches
   `per_heir_shares.length` filtered to non-zero; the displayed total estate equals
   `input_json.net_distributable_estate.centavos`; the sum of displayed heir amounts equals that
   same total.
6. Assert that the `output_json` the product itself wrote through `updateCaseOutput` during step 3
   equals the recomputed output field for field, and print the marker `STORED OUTPUT DIVERGED` when
   it does not. That closes the loop between what the browser computed, what the database holds and
   what the engine says, without any of the three being a transcription of another.

`formatPeso` (`src/types/index.ts:509-518`) is BigInt-based: `₱` + thousands-separated pesos, and
`.NN` appended only when the centavo remainder is non-zero. The parser must accept both forms.

`DistributionSection.tsx` renders amounts in table cells with **no per-row testid**, and the column
index shifts with `showDonations`, `showRepresentation` and the collateral layout. Depending on
column position would be brittle, so Phase 12 adds per-row hooks — the same additive
`data-testid` technique plan 11-02 used for nineteen hooks.

## 6. Share exposure — the field set is already enumerated

`supabase/migrations/015_shared_case_single_signature.sql` collapses `get_shared_case` to one
`UUID` signature whose `RETURNS TABLE` list is exactly six columns:

```
title, status, input_json, output_json, decedent_name, date_of_death
```

The migration's own header states that the discarded `TEXT` overload returned two extra blobs "that
no client reads, and widening what an anonymous share link exposes is a decision this plan does not
contain". JRNY-08's "exposes only what it should" is therefore already decided and written down;
Phase 12's job is to make it **checked**, by calling `/rest/v1/rpc/get_shared_case` with the `anon`
key and asserting the returned object's key set equals that six-element set exactly — and, as a
paired negative, that it contains none of `id`, `org_id`, `user_id`, `client_id`, `share_token`,
`tax_input_json`, `tax_output_json`, `comparison_input_json`, `comparison_output_json`.

This is a field-set assertion over a JSON response, not a DOM predicate, so like
`journey/rls-isolation.mjs` it is a script and a gate of its own rather than a rubric.

Gate G18 already proves a **cross-tenant** share-token read returns nothing. It does not inspect the
column set of a legitimate read, so there is no overlap.

## 7. Why the SEO surface is a script, not fourteen reference images

JRNY-11 asks for a smoke gate: "renders, no console error, no 404". It does not ask for layout
freezing, and fourteen committed reference PNGs of long marketing pages would be fourteen images to
re-approve on every copy edit — a maintenance cost with no verification return, on the one part of
the product where no peso figure appears.

The measured design: one script, `journey/seo-smoke.mjs`, driving a committed list of the fourteen
routes from §4.5 and asserting per route:

- an `h1` element exists and its text is non-empty (renders);
- `page.__journeyConsoleErrors` is empty (no console error);
- no network response observed during the navigation carried an HTTP status `>= 400` (no 404).

It needs a build and a browser but **no database**, so it can be ordered before the stack-dependent
gates if that ever becomes useful.

`src/router.ts` declares no `notFoundComponent`, so a mistyped path has no explicit 404 screen; the
network-status assertion is what actually catches a broken asset or a failed chunk fetch.

## 8. The one place the harness must be widened

`frontend/journey/run.mjs:57` freezes the requirement ids a step may claim:

```js
const REQUIREMENTS = Object.freeze(['JRNY-02', 'JRNY-03', 'JRNY-04']);
```

`scripts/check-journey-registry.mjs:59` carries the same list. A Phase 12 step record naming
`JRNY-05` is rejected today with `STEPS INVALID`. Both lists must gain `JRNY-05`, `JRNY-06`,
`JRNY-07` and `JRNY-08`. `JRNY-11` is **not** added, because the SEO smoke is a separate script with
no step records (§7).

This is a widening of an input validator, not a weakening of a check: every other rule — unknown
field, duplicate id, missing rubric, missing reference, raised tolerance, orphan reference — stays
byte-identical, and a step naming an id outside the widened set is still rejected.

`journey/resets.mjs` gains the two entries named in §4.3, `case-alpha-no-output` and
`case-alpha-computed`, and `scripts/check-journey-registry.mjs:68` — which carries its own hardcoded
copy of `RESET_NAMES` — gains the same two. The estate-tax steps declare `noop`: `EstateTaxWizard`
autosaves `tax_input_json` on edit, and those steps perform no `fill` and no `click`, so they mutate
nothing.

### Pitfall 6: seeding an engine result into `seed.sql`

**What goes wrong:** `scripts/check-seed-fixture.mjs` fails with `SEED WRITES OUTPUT`, and — worse
than the failure — a per-heir peso figure that nothing computed becomes the expected result.
**How to avoid:** §4.3's compute-in-the-browser path and the `case-alpha-computed` reset, which runs
the real engine at run time.

## 9. Gate placement

Current state, from `gates.manifest.json`: seventeen gates, `G9` last at order 17, `G14` reserved
and unused for Phase 9's `09-06`.

Three new gates, all live and therefore ordered after `G4` (typecheck) alongside `G18` and `G17`:

| id | order | command (from `apps/inheritance`) | needs |
|---|---:|---|---|
| **G19** | 14 | `cd frontend && node journey/money-parity.mjs` | stack + WASM + build + browser |
| **G20** | 15 | `cd frontend && node journey/share-exposure.mjs` | stack only |
| **G21** | 16 | `cd frontend && node journey/seo-smoke.mjs` | build + browser |

Existing gates then renumber `G10` 14→17, `G11` 15→18, `G8` 16→19, `G9` 17→20. `G9` stays last
because `scripts/check-gate-results.mjs` fails with `RESULTS INCOMPLETE` on any gate it sees as
`not-run` — the constraint Phase 4 measured and Phases 6, 10 and 11 all respected. `order` is
deliberately outside `gates.manifest.lock`, so renumbering is legal; `id`, `command` and `blocking`
are locked and no existing one changes.

The phase ends at **twenty** gates and `ALL GATES PASSED (20/20)` is achievable.

Every new gate must print `GATE-SKIPS total=<n> skipped=<n>` on stdout on both its pass and its fail
path — `scripts/check-gate-skips.mjs` (G8) reads that line out of each gate's log and treats a
missing line as a failure rather than as zero skips.

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Driving a page and screenshotting it | A new runner | `journey/run.mjs` + a step record | The registry is data; a second runner is a second unreviewed framework and G16 could not read it |
| Asserting DOM content | A new matcher | one of the eight `ASSERTION_KINDS` | An unknown kind throws; that rejection is what makes JRNY-09 enforceable |
| Installing a browser session | `page.evaluate` after navigation | `seedAuthSession` / `seedLocalStorage` | `addInitScript` runs before first paint; an `evaluate` is one render too late |
| Formatting a peso figure in a gate | A second `formatPeso` | parse the displayed string back to centavos | A second formatter is a second source of truth for money — the exact thing EXT-02 exists to prevent |
| Approving a reference | A `--update` flag on a gate | `node journey/approve.mjs <stepId>` | A gate that can rewrite its own expectation goes green by lowering it |
| Predicting a scenario code | A hand-written classifier | `compute()` → `output.scenario_code` | §2 is what a hand-written one costs |

## Common Pitfalls

### Pitfall 1: approving a reference before its rubric passes
**What goes wrong:** the PNG freezes a wrong screen as correct, and the gate then certifies it every
run. **How to avoid:** Phase 11's rule, carried forward verbatim — a reference is approved only
after that step's rubric has already passed, and `maxDiffPixels` stays `0`.

### Pitfall 2: a leftover `output_json` making the wizard unreachable
**What goes wrong:** the results step computes and stores a result, and on the next run
`$caseId.tsx:66` routes the same case to `phase: 'results'`, so all six wizard screens render
results instead. **How to avoid:** every wizard step declares the `case-alpha-no-output` reset;
`run.mjs` applies a step's reset before that step navigates.

### Pitfall 3: a `text_equals` assertion carrying a peso figure
**What goes wrong:** the rubric becomes a transcription of engine output and stops tracking it.
**How to avoid:** peso figures are asserted by G19 against a live recomputation; wizard and results
rubrics assert structure, labels and counts.

### Pitfall 4: a lazily-loaded chunk screenshotted before it arrives
**What goes wrong:** `FamilyTreeTab` is `React.lazy`, so a capture taken too early freezes a
`Skeleton`. **How to avoid:** `waitForSelector` on `[data-testid="tree-container"]`.

### Pitfall 5: the tax wizard's autosave mutating the fixture mid-run
**What goes wrong:** `EstateTaxWizard` autosaves `tax_input_json`, so an interaction would make run
two assert against a different row than run one. **How to avoid:** the tax steps perform no `fill`
and no `click`; navigation plus `waitForSelector` only.

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Vitest 4.0.18 (frontend), cargo test (engine), the journey harness (browser) |
| Config file | `frontend/vitest.config.ts` |
| Quick run command | `cd frontend && node journey/run.mjs --step <stepId>` |
| Full suite command | `bash scripts/ci-gates.sh` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test type | Automated command | Exists? |
|---|---|---|---|---|
| JRNY-05 | Six wizard screens render correctly | screenshot + rubric | `cd frontend && node journey/run.mjs --step wizard-estate` (and five siblings) | ❌ this phase |
| JRNY-05 | The badge shows the engine's scenario code | unit | `cd frontend && npm run test:gate` | ❌ this phase (12-01) |
| JRNY-06 | Eight tax tabs render correctly | screenshot + rubric | `cd frontend && node journey/run.mjs --step tax-tab-0` (and seven siblings) | ❌ this phase |
| JRNY-07 | Results view and family tree render correctly | screenshot + rubric | `cd frontend && node journey/run.mjs --step results-view` | ❌ this phase |
| JRNY-07 | Every displayed peso figure equals engine output | integration | `cd frontend && node journey/money-parity.mjs` | ❌ this phase |
| JRNY-08 | Three share states render correctly | screenshot + rubric | `cd frontend && node journey/run.mjs --step share-populated` | ❌ this phase |
| JRNY-08 | The RPC exposes exactly six fields | integration | `cd frontend && node journey/share-exposure.mjs` | ❌ this phase |
| JRNY-11 | Fourteen routes render with no console error and no 4xx | smoke | `cd frontend && node journey/seo-smoke.mjs` | ❌ this phase |

### Sampling Rate

- **Per task commit:** the single named command in that task's `<verify>` block.
- **Per wave merge:** `node scripts/check-journey-registry.mjs` (static, seconds) plus
  `cd frontend && node journey/run.mjs --all`.
- **Phase gate:** `bash scripts/ci-gates.sh` printing `ALL GATES PASSED (20/20)`.

### Wave 0 Gaps

None. Every framework, dependency and harness module this phase needs already exists and was probed
during planning.

## Security Domain

### Applicable ASVS categories

| Category | Applies | Standard control |
|---|---|---|
| V2 Authentication | no | No auth code changes; sessions come from real password grants against the local stack |
| V3 Session Management | no | Unchanged |
| V4 Access Control | **yes** | JRNY-08's exposure check is an access-control assertion on the one anonymous data path; G18 already covers cross-tenant reads |
| V5 Input Validation | **yes** | The registry validator is input validation over step records; §8 widens one enumerated list and weakens no rule |
| V6 Cryptography | no | None introduced |

### Known threat patterns for this stack

| Pattern | STRIDE | Mitigation, already present |
|---|---|---|
| Anonymous share link over-exposing case data | Information disclosure | `get_shared_case` returns six enumerated columns; G20 asserts the set |
| A service-role key leaking into a committed file | Information disclosure | `journey/session.mjs` reads it at runtime from `supabase status -o env` and never writes or prints it; Phase 12 scripts follow the same rule |
| A gate rewriting its own expected result | Tampering | `approve.mjs` is the only writer into `references/`; no gate imports it |

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | `?step=` and `?tab=` survive TanStack Router on `/cases/$caseId` and `/cases/$caseId/tax` | §4.1, §4.2 | The seam was proven against a page by G15 but not against these two routes in a built app. Plans 12-03 and 12-04 each open with a measurement task that navigates and prints the reached step before any reference is approved. |
| A2 | Chromium rasterises identically enough across runs on this machine for `maxDiffPixels: 0` | §1 | Phase 11 approved fifteen references at zero and ran `--all` green twice, so this is measured for this machine; it remains unmeasured for a GitHub runner, where no CI run has ever executed. |
| A3 | Clicking `compute-distribution` on the seeded case succeeds in a headless browser within the step's settle window | §4.3 | `$caseId.tsx` races `compute()` against a 30 s timeout. Plan 12-06 opens with a measurement task that drives the click once and prints the reached page state before any reference is approved; a failure there is a BLOCKED report, not a widened tolerance. |

## Open Questions

1. **Does CI survive twenty gates?**
   - What we know: `.github/workflows/inheritance-ci.yml` gained Supabase CLI, `supabase start` and
     a chromium install in plan 11-08, and its `timeout-minutes` was raised to 45.
   - What is unclear: this project's CI has still never executed — Phase 1's GATE-04 finding — so
     the workflow's viability is inferred, never observed.
   - Recommendation: plan 12-09 raises `timeout-minutes` to 60 for the three added gates and records
     the non-execution as a risk, exactly as plan 11-08 did. It is not claimed as working.

2. **Should the four Phase 11 steps withheld as BLOCKED be revisited here?**
   - What we know: `auth-signed-out` needs a product decision on the logout destination, and the
     three onboarding steps need two source fixes (`getUserOrganization`'s `.single()`,
     `saveFirmProfile`'s missing `email`).
   - What is unclear: nothing technical; both are owner decisions about application behaviour.
   - Recommendation: **out of scope for Phase 12.** They belong to JRNY-02 and JRNY-03, which are
     Phase 11 requirements. No plan in this phase touches them, and `JOURNEY.md`'s two BLOCKED
     sections stay as written.

## Sources

### Primary (HIGH confidence)
- This working tree, read directly: `frontend/journey/*.mjs`, `frontend/journey/JOURNEY.md`,
  `frontend/journey/REFERENCES.md`, `scripts/check-journey-registry.mjs`, `gates.manifest.json`,
  `GATES.md`, `frontend/supabase/fixtures.json`, `frontend/supabase/migrations/015_*.sql`,
  `.planning/PLAN-STANDARD.md`.
- Component sources read in full or in the relevant range: `ReviewStep.tsx`, `WizardContainer.tsx`,
  `EstateTaxWizard.tsx`, `ResultsView.tsx`, `ResultsHeader.tsx`, `DistributionSection.tsx`,
  `ShareBreakdownSection.tsx`, `share/$token.tsx`, `cases/$caseId.tsx`, `cases/$caseId.tax.tsx`,
  `LandingPageLayout.tsx`, `BlogLayout.tsx`, `BlogIndex.tsx`.
- Commands executed during planning: `./target/release/inheritance-engine` on two example cases;
  `supabase status -o env`; testid inventories by `grep` across `src/components/tax/tabs/`,
  `src/components/results/`, `src/components/wizard/`.

### Secondary (MEDIUM confidence)
- `.planning/phases/11-*/11-08-PLAN.md` and `.planning/STATE.md` for the Phase 11 outcome and the
  gate-ordering constraint.

### Tertiary (LOW confidence)
- None. No external source was consulted; this phase introduces no new library.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — nothing new is installed; every module already exists and was read.
- Architecture: HIGH — every screen, testid, URL seam and page state was located in source.
- Pitfalls: HIGH — four of the five were derived from code read during planning, and the fifth
  (reference-before-rubric) is Phase 11's recorded rule.
- The blocker in §2: HIGH — reproduced by two engine runs against committed inputs.

**Research date:** 2026-07-31
**Valid until:** 30 days, or the next change to `frontend/journey/`, `frontend/supabase/seed.sql`,
or `src/components/wizard/ReviewStep.tsx`.
