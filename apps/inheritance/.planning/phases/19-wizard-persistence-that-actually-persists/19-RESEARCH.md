# Phase 19 Research — Wizard Persistence That Actually Persists

**Researched:** 2026-08-01
**Phase requirements:** SAVE-01, SAVE-02, SAVE-03, SAVE-04, SAVE-05

Every claim below was produced by a command run in this tree during this pass, on branch
`gsd/deletion-milestone`. Where the vision audit is quoted, the quotation is followed by the
measurement that confirms or corrects it.

---

## 1. The defect, measured rather than quoted

The audit says: *"`routes/cases/$caseId.tsx` calls `setAutoSaveInput` at exactly two sites, both
inside the load effect. Nothing between page load and pressing Compute reaches the database."*

**CONFIRMED, exactly.**

```
$ cd frontend && grep -n "setAutoSaveInput" -r src/
src/routes/cases/$caseId.tsx:37:  const [autoSaveInput, setAutoSaveInput] = useState<EngineInput | null>(null);
src/routes/cases/$caseId.tsx:52:          setAutoSaveInput(input);
src/routes/cases/$caseId.tsx:60:          setAutoSaveInput(input);
```

Lines 52 and 60 are both inside `fetchCase()` in the `useEffect(..., [caseId])` load effect
(`$caseId.tsx:41-77`). There is no third call site. `WizardContainer` (`$caseId.tsx:140`) is passed
`onSubmit` and `defaultValues` and nothing else; `WizardContainerProps` declares exactly those two
props (`WizardContainer.tsx:101-104`). The form's own state lives in `react-hook-form`
(`WizardContainer.tsx:111-113`) and leaves the component only through
`methods.handleSubmit` on the Review step (`WizardContainer.tsx:204`).

So the data path from a keystroke to the database has one segment and it is missing: nothing carries
form state out of `WizardContainer` until Compute is pressed.

### The reference-equality guard, and what it actually does

`useAutoSave.ts:40` reads `if (prevInputRef.current === input) return;`. With `setAutoSaveInput`
called only from the load effect, that guard is not merely useless — it produces one specific
observable behaviour worth naming, because a plan that removes it must not remove this too:

- First render: `autoSaveInput` is `null`, so `caseId` is passed as `null` and the effect returns at
  line 39 **before** touching `prevInputRef`. `prevInputRef.current` is still the first render's
  `input`, i.e. `null`.
- After the case loads, `setAutoSaveInput(row.input_json)` runs. Now `caseId` is non-null and
  `prevInputRef.current` (`null`) `!==` the loaded object, so the effect **does** schedule a save.

**Measured consequence: opening a case performs exactly one save, 1.5 s after load, whose payload is
byte-identical to what was just read.** Every subsequent edit performs none. The product writes when
it has nothing to write and does not write when it does.

That asymmetry decides a design point in this phase: the replacement comparison must treat the
**first observation of a value as adoption, not as a change**, or the redundant load-time write
survives the fix and the save indicator flashes on every page open with nothing to report.

### The unmount path throws work away

`useAutoSave.ts:46-48` returns a cleanup that clears the pending timer. That cleanup runs on every
re-run of the effect *and* on unmount, so a save scheduled 1.4 s ago and not yet fired is discarded
when the lawyer navigates from `/cases/<id>` to anywhere else. There is a committed test asserting
precisely this:

```
src/hooks/__tests__/useAutoSave.test.tsx:137  it('cancels pending save on unmount', () => {
src/hooks/__tests__/useAutoSave.test.tsx:148    expect(mockUpdateCaseInput).not.toHaveBeenCalled();
```

**This test asserts the data-loss behaviour the phase exists to remove.** ROADMAP Phase 19 success
criterion 3 — *"Unmounting the wizard with a save pending **flushes** it instead of clearing it,
proven by a test that unmounts inside the debounce window"* — is the owner's written instruction to
change it. Section 6 below states how the phase handles that without weakening anything.

### The whole file passes today

```
$ cd frontend && npx vitest run src/hooks/__tests__/useAutoSave.test.tsx
 ✓ src/hooks/__tests__/useAutoSave.test.tsx (7 tests) 27ms
 Test Files  1 passed (1)
      Tests  7 passed (7)
```

Seven passing tests against a hook that cannot save. That is the shape of the problem: the unit tests
drive the hook directly with changing props, which the application never does.

---

## 2. The seam that already exists on the other engine

The estate-tax route solves this exact problem and is the in-repo precedent to copy.

- `EstateTaxWizard` takes an `onChange` prop and calls it on every field edit through
  `updateState` (`EstateTaxWizard.tsx:91-97`).
- `$caseId.tax.tsx:81-91` is the handler: `setTaxState`, `setAutoSaveStatus('saving')`,
  `await updateCaseTaxInput(...)`, `setAutoSaveStatus('saved')`, `catch → setAutoSaveStatus('error')`.
- `EstateTaxWizard.tsx:99-104` renders the status as a `Badge`:
  `saving → 'Saving...'`, `saved → 'Saved'`, `error → 'Save error'` with
  `variant: 'destructive'`, and **`idle: null`** — at idle nothing renders at all.

`idle: null` is load-bearing for this phase and is not a stylistic detail. A save indicator that
renders nothing at idle changes zero pixels on a screen nobody has typed into, which is exactly the
state every succession-wizard journey step captures. Reusing that rule keeps the five approved wizard
reference images valid instead of invalidating them, and this phase therefore adopts it verbatim.

`AutoSaveStatus` is already the shared type: `src/types/index.ts:598`,
`export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';`. Both routes use it. No new
type is needed.

---

## 3. react-hook-form: the subscription that carries the value out

`react-hook-form` is pinned at `7.71.2`. The v7 `watch(callback)` overload subscribes to value
changes and returns a subscription object carrying `unsubscribe()`. It does **not** fire on mount —
only on change — which matters because a mount-time fire would resurrect the redundant load-time
write this phase is removing.

Two writers in the wizard must both reach that subscription, and both do in v7:

| Writer | Site | Notifies `watch(cb)` |
|---|---|---|
| `useFieldArray().append` / `.remove` | `FamilyTreeStep.tsx:123,140,159` | yes |
| `setValue(...)` | `PersonCard.tsx:165`, every step component | yes |

`FamilyTreeStep` adds a person through `append(createDefaultPerson(...))` (`FamilyTreeStep.tsx:140`),
and `PersonCard` writes the name through `setValue(\`family_tree.${index}.name\`, ...)`
(`PersonCard.tsx:165`). A subscription placed on `methods` in `WizardContainer` therefore sees both
adding an heir and naming one, which is the whole of the "nine-heir family tree" scenario.

### The comparison the debounce needs

Replacing `prevInputRef.current === input` with a value comparison needs a deterministic
serialization, because `watch` hands back a fresh object on every keystroke and `JSON.stringify` key
order is only stable for objects built by one code path — which is not guaranteed once a value has
round-tripped through Postgres JSONB, where key order is normalized.

Measured shape constraints on `EngineInput` that a serializer must survive:

- `Money.centavos` is typed `number | string` (`src/types/index.ts:238`). A comparison must not
  coerce to `Number`, or a string-carried estate above `Number.MAX_SAFE_INTEGER` compares equal to a
  different one.
- `family_tree` is an array whose **order is meaningful** (indices are used as form paths), so array
  order must be preserved, never sorted.
- `will` is `null` or a nested object; `donations` is an array of objects.

A recursive stringifier that sorts **object** keys and leaves **array** order alone satisfies all
three, uses no dependency, and is a pure function that can be unit-tested directly. That is the
approach this phase takes, and the money rule is: compare the serialized text, never the parsed
number.

---

## 4. The live-database proof for SAVE-05, and why it is not a screenshot step

ROADMAP criterion 5 requires the nine-heir tree to be proven against the live database, *"not by a
unit test alone"*. The journey harness offers two shapes and only one of them is available to an
agent:

| Shape | Example | Needs an approved reference image |
|---|---|---|
| Registry step (`journey/steps/*.json` + rubric + reference) | `wizard-family-tree` | **yes** |
| Standalone gate script | `journey/money-parity.mjs` (G19), `journey/rls-isolation.mjs` (G18) | **no** |

`scripts/check-journey-registry.mjs` (G16) fails with `REFERENCE MISSING` for any declared step
lacking `references/<id>.png`, so a new registry step cannot exist without a first reference image —
and producing a first reference is a human visual judgement that Phase 16 explicitly refused to make
on its own authority. The standalone-script shape has no reference image, no perceptual diff and no
approval step, and it still drives a real browser against a real local Supabase.

**Phase 19 therefore proves SAVE-05 with a standalone gate script,
`frontend/journey/persistence.mjs`, modelled on `journey/money-parity.mjs`.** No file under
`frontend/journey/references/` is created, modified or approved by this phase.

### What the harness provides that the script composes

Read from `money-parity.mjs:33-38` and its `main()`:

- `readStackEnv()`, `adminClient(env)`, `getSession(env, 'alpha')` — `journey/session.mjs`
- `readFixtures()`, `seedAuthSession(page, origin, session)` — `journey/seed.mjs`
- `buildApp()`, `startPreview()`, `JourneyCannotRun` — `journey/serve.mjs`
- `launchBrowser()`, `newJourneyPage(browser)` — `journey/browser.mjs`
- exit contract: `0` passed, `1` failed, `2` could not run, with the reason on stderr
- `console.log('GATE-SKIPS total=<n> skipped=0')` printed on **both** the pass and the fail path —
  `scripts/check-gate-skips.mjs:373-379` fails any gate ordered before its own with
  `SKIP REPORT MISSING` when that line is absent.

### The fixture-safety problem, measured

`RESETS['case-alpha-no-output']` (`journey/resets.mjs:104-120`) sets `output_json`, `decedent_name`
and `date_of_death` to null and `status` to `'draft'`. **It does not restore `input_json`.** A gate
that typed nine heirs into the seeded Alpha case would leave them there permanently, and `G19`
money-parity computes against `input_json` on that same row — so the persistence gate would silently
redefine what the money gate checks.

The script therefore **creates its own case row** through the admin client, using the ids
`frontend/supabase/fixtures.json` already publishes (`orgs.alpha.org_id`, `.user_id`, `.client_id`),
drives the browser against that row, and deletes it in a `finally` block. No seeded row is read,
written or reset.

### The DOM the script drives, and the two attributes it needs

```
$ grep -n "data-testid" src/components/wizard/FamilyTreeStep.tsx src/components/wizard/PersonCard.tsx
src/components/wizard/FamilyTreeStep.tsx:144:    <div data-testid="family-tree-step" ...>
src/components/wizard/PersonCard.tsx:119:    <Card data-testid="person-card">
```

`family-tree-step` and `person-card` exist. Two controls the script must drive have no stable handle:

- the **Add Person** button — `FamilyTreeStep.tsx:172`, currently addressable only by its text.
- the **Full Name** input inside each card — `PersonCard.tsx:162`, addressable only by DOM position.

Both need a `data-testid`. A `data-testid` attribute renders no pixels, so adding them does not
invalidate the approved `wizard-family-tree` reference image.

The step is URL-addressable: `readInitialWizardState()` (`WizardContainer.tsx:83-99`) reads
`?step=` once at mount and clamps it, and `steps/wizard.json` already uses
`/cases/<id>?step=2` to land on the family-tree step. The script uses the same form.

---

## 5. Gate placement, and the one number that decides whether the suite reaches it

### Current gate order (34 gates, `gates.manifest.json`)

Relevant window: `G34` order 11 → `G3` 12 → `G4` 13 → `G18` 14 → `G17` 15 → `G19` 16 → `G20` 17.

The new gate needs Docker, a running Supabase stack, a built application and a browser — the same
environment as `G18`, `G17` and `G19`, and a heavier environment than every gate before them.
Placing it at **order 17, immediately after `G19`**, keeps the manifest's existing cost ordering
(static checks, then unit suites, then browser gates) and shifts `G20` through `G9` down by one.
`gates.manifest.lock` gains exactly one appended entry; no locked command string changes.

### The floor, re-measured this pass

```
$ cd frontend && npm run test:gate
 Test Files  8 failed | 87 passed (95)
      Tests  31 failed | 2078 passed (2109)
...
TEST COUNT DROPPED: ran 2109 tests, floor is 2119
GATE-SKIPS total=2109 skipped=0
```

`frontend/test-baseline.json` holds `min_total_tests: 2119` and 31 `known_failures`; skipped is 0.
`scripts/check-test-baseline.mjs:186` is `if (numTotalTests < ledger.min_total_tests)` — a **floor**,
not an equality. Running *above* it passes.

**The gap is exactly 10 tests.** Phases 16, 17 and 18 each reported this as owner-blocked because
lowering the floor is owner action. It is worth stating plainly what that measurement now implies:

> **The floor can be cleared without touching the baseline, by adding ten or more passing tests.**
> Phase 19 adds test files to `useAutoSave`, `WizardContainer`, `$caseId` and the serializer, which
> is well above ten. Clearing `G3` this way is a legitimate pass — the floor exists to stop tests
> being deleted, and this adds them.

This is **not** claimed in advance. Plan `19-06` re-runs `npm run test:gate` and records the observed
number. If the count still lands below 2119, the phase reports `G3` as still red with the pasted
output and touches no baseline.

The second inherited blocker is unchanged and is **not** owned by this phase: `G20` and `G21` are
registered blocking gates whose scripts commit `4ccf06270` deleted. Retiring a gate is owner action
under CLAUDE.md invariant 2, enforced by `G5`. So clearing `G3` advances the suite from order 12 to
order 18 and it then halts at `G20`. Phase 19 does not claim `bash scripts/ci-gates.sh` exits 0.

---

## 6. The one test whose meaning must change, and how that is not a weakening

`src/hooks/__tests__/useAutoSave.test.tsx:137-149`, `cancels pending save on unmount`, asserts
`expect(mockUpdateCaseInput).not.toHaveBeenCalled()` after unmounting inside the debounce window.
SAVE-03 requires the opposite behaviour.

The phase's rule, which every plan repeats as a `must_haves` truth:

1. The test is **not deleted and not skipped**. It is renamed to state the new behaviour and its
   assertion is inverted to the stronger form — `toHaveBeenCalledWith(caseId, latestInput)`, which
   pins both the call and its payload where the old one pinned only absence.
2. The authorisation cited in the commit body and in the plan summary is **ROADMAP Phase 19 success
   criterion 3**, the owner's written instruction, quoted verbatim. No agent decided this.
3. The safety property the old test protected — *an unmount must not fire a save that was never
   scheduled* — is preserved by a **new** test that unmounts with no pending timer and asserts
   `updateCaseInput` was never called. The suite ends with strictly more coverage of the unmount
   path than it started with.
4. The file's test count goes **up**, never down. `frontend/test-baseline.json`,
   `assertion-baseline.json`, `gate-skips.lock` and `gates.manifest.lock` are untouched by every
   plan in this phase except `19-06`, which appends one entry to `gates.manifest.lock`.

The in-repo precedent for changing a test to assert corrected behaviour is commit `d71f9150e`
(owner ruled OBS-05/OBS-06; five tests rewritten to assert rejection — recorded in STATE.md as *"a
strengthening"*). This follows the same shape, with the owner's instruction quoted rather than
inferred.

---

## 7. Validation Architecture

Five properties this phase asserts, the frequency each is sampled at, and the gate that samples it.
No property is left to a single sample where a second is available.

| # | Property | Sampled by | Frequency | Failure marker |
|---|---|---|---|---|
| 1 | A field edit reaches `useAutoSave` without pressing Compute | `WizardContainer` unit tests (every field kind: text, checkbox, array append) + `journey/persistence.mjs` check 1 | every commit (G3) and every browser run (G35) | `ONCHANGE NOT FIRED` / `NOT PERSISTED` |
| 2 | The debounce fires on a changed value that preserves object identity | `useAutoSave` unit test mutating an object in place and re-passing the same reference | every commit (G3) | test failure |
| 3 | Unmount inside the debounce window flushes | `useAutoSave` unit test (`unmount()` at 1.4 s) + `journey/persistence.mjs` check 6 (client-side navigation away) | every commit and every browser run | `UNMOUNT LOST` |
| 4 | A failed save is never rendered as success | `$caseId` component test forcing `updateCaseInput` to reject, asserting the rendered text is the error copy and that the success copy is absent from the document | every commit (G3) | test failure |
| 5 | Nine heirs survive a reload | `journey/persistence.mjs` checks 1–5 against a real browser and a real Postgres row | every browser run (G35) | `RELOAD LOST` / `NAME LOST` |

**Nyquist rate.** Properties 1 and 3 are each sampled twice at different levels — in-process with
fake timers, and end-to-end in a browser with real timers — because the failure mode this phase
exists to fix (a hook that passes its unit tests while being unreachable from the application) is
precisely a failure that one level of sampling cannot see. Property 5 is sampled only end-to-end, by
construction: a unit test cannot prove a page reload.

**Every failure path is observed before the gate is registered.** Plan `19-05` writes
`journey/persistence.mjs` and observes it exit 1 on three separately injected regressions — the
`onChange` prop removed, the flush removed, the value comparison reverted to reference equality —
restoring the source between each. Plan `19-06` registers it only after that.

**No expected peso figure is committed.** The gate asserts structure and identity (nine rows, nine
names, `output_json` still null), never a money value, so it needs no engine run and cannot drift
from one.

---

## 8. Risks, each with the plan that owns it

| Risk | Owner | Mitigation written into the plan |
|---|---|---|
| A `watch` subscription firing on every keystroke re-renders the route on every keystroke | 19-03, 19-04 | The subscription writes to `useState` in the route, which is what the debounce absorbs; the wizard itself is not re-rendered by the route's state, because `WizardContainer` receives `defaultValues` (uncontrolled) and not `value`. A test asserts the wizard's inputs keep focus across ten consecutive keystrokes. |
| Key-order instability making every render look like a change | 19-02 | `stableStringify` sorts object keys; a unit test round-trips one `EngineInput` through two differently-ordered constructions and asserts identical output. |
| The flush firing on React StrictMode's development double-mount | 19-02 | The first observation of a value is adoption, so nothing is pending at first mount; a test mounts and immediately unmounts and asserts zero saves. |
| The new save indicator changing five approved wizard reference images | 19-04 | `idle` renders nothing, matching `EstateTaxWizard.tsx:103`. Journey steps never type, so they stay at idle. If any journey step nonetheless reports a diff, the plan requires reporting it for human review; `node journey/approve.mjs` is not run by any plan in this phase. |
| The persistence gate corrupting the seeded Alpha case for `G17`/`G19` | 19-05 | The gate creates and deletes its own case row and reads no seeded row; a final check asserts the row is gone and that `fixtures.json`'s Alpha case still holds its committed `input_json`. |
| The local Supabase stack or Chromium being unavailable on the runner | 19-05, 19-06 | Exit code 2 with `PERSISTENCE CANNOT RUN:` on stderr, the harness's existing three-valued contract. A cannot-run is reported as BLOCKED with pasted output, never as a pass. |

---

## 9. What this phase explicitly does not do

- It does not touch `engine/`, any Rust file, or any legal rule. No point of Philippine law arises.
  `.planning/lawyer-decisions.json` and `.planning/LAWYER-AGENDA.md` are untouched.
- It does not lower `min_total_tests`, and it does not append to `gate-skips.lock`,
  `assertion-baseline.json` or `frontend/test-baseline.json`.
- It does not retire `G20` or `G21`, and it does not claim `bash scripts/ci-gates.sh` exits 0.
- It does not run `node journey/approve.mjs` and creates no reference image.
- It does not change the estate-tax autosave path; `$caseId.tax.tsx` is read as a pattern and left
  alone.
