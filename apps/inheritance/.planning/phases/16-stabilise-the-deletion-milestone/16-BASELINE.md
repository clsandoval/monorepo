# Phase 16 Baseline — measured before the deletion-milestone repair

**Measured:** 2026-08-01, during plan `16-01`.

Every figure in this file was pasted from a command run during plan `16-01`, in this tree, on
branch `gsd/deletion-milestone`. No number here was copied from `LOOP-STATUS.md`,
`gate-results.json`, `16-RESEARCH.md` or any prior phase summary — reconciling those documents
with the tree is the reason this phase exists, so they are not admissible as sources.

---

## Frontend suite — before

`cd frontend && npm run test:gate`

```
 Test Files  8 failed | 85 passed (93)
      Tests  31 failed | 2088 passed (2119)
   Duration  20.73s

JSON report written to /tmp/test-baseline-mFRuhU/vitest-report.json

=========================================================
GATE OK — test baseline matches exactly
=========================================================
  total tests run     : 2119 (floor 2119)
  passed              : 2088
  known failures met  : 31
  LEDGER SIZE (debt)  : 31   <-- this number must only go down

GATE-SKIPS total=2119 skipped=0
GATE-EXIT=0
```

`frontend/test-baseline.json` → `min_total_tests 2119`, `known_failures` array length `31`.

The marker `frontend/scripts/check-test-baseline.mjs` prints when the measured total falls below
the floor is the literal string **`TEST COUNT DROPPED`**. Plan `16-04` expects to see it.

## Typecheck — before

`cd frontend && npx tsc -b --force`

```
TSC-EXIT=0
```

Zero output. G4 is green before this phase touches anything.

## jsdom globals present

`frontend/src/test-setup.ts` was added by commit **`181ae68c5`** — *"test(01): add jsdom polyfills
— 342 failures to 46, none skipped"*. `git diff --stat HEAD -- src/test-setup.ts` prints nothing,
so the state measured here is the committed state and not a local edit.

`frontend/vitest.config.ts:15` reads `setupFiles: ['./src/test-setup.ts']`, so the file is loaded
for the whole suite rather than sitting unreferenced.

| Global installed | Guard |
|---|---|
| `navigator.clipboard` (writable shadow) | `Object.defineProperty` with getter/setter |
| `globalThis.ResizeObserver` | `if (!(globalThis as any).ResizeObserver)` |
| `globalThis.DOMRect` | `if (!(globalThis as any).DOMRect)` |
| `window.matchMedia` | `if (!window.matchMedia)` |
| `Element.prototype.scrollIntoView` | `if (!elementProto.scrollIntoView)` |
| `Element.prototype.hasPointerCapture` | `if (!elementProto.hasPointerCapture)` |
| `Element.prototype.setPointerCapture` | `if (!elementProto.setPointerCapture)` |
| `Element.prototype.releasePointerCapture` | `if (!elementProto.releasePointerCapture)` |
| `Element.prototype.scrollTo` | `if (!elementProto.scrollTo)` |

The measured set matches the set research predicted, with no difference. All three globals CUT-02
names by name — `ResizeObserver`, `scrollIntoView`, `hasPointerCapture` — are present, guarded and
loaded.

**Finding on the inherited estimate.** The phase brief asserted "~1,465 of the frontend failures
are this one missing jsdom global". That population does not exist in this tree. The whole suite
runs 2119 tests with 31 failures. The failure-count drop CUT-02 asks to be measured was realised
by commit `181ae68c5` (342 → 46), not by this phase. Writing a second copy of the polyfills would
be motion rather than work, and an unguarded duplicate would shadow the guarded original.

## The 31 ledgered failures, classified

Extracted from the preserved vitest JSON report (`/tmp/16-01-vitest-report.json`, copied from the
gate's temp path immediately after the run). The report yields 39 failing nodes: **8 file-level
rows** (the 8 failed test files) and **31 test-level rows**, matching `known failures met : 31`
exactly.

**The rule, applied mechanically with no discretion:** a failure is an `environment` failure when
its message contains the literal substring `is not a function` or `is not defined` **and** the
identifier immediately preceding it is a DOM or BOM global absent under jsdom. Everything else is
`product-debt`.

| # | File | Test | First line of message | Verdict |
|---|---|---|---|---|
| 1 | `src/lib/__tests__/supabase.test.ts` | throws if VITE_SUPABASE_URL is missing | `Error: promise resolved "{ supabaseConfigured: false, …(1), …(1) }" instead of rejecting` | product-debt |
| 2 | `src/lib/__tests__/supabase.test.ts` | throws if VITE_SUPABASE_ANON_KEY is missing | `Error: promise resolved "{ supabaseConfigured: false, …(1), …(1) }" instead of rejecting` | product-debt |
| 3 | `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | shows "Error saving" when autoSaveStatus is error | `expect(element).toHaveTextContent()` | product-debt |
| 4 | `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | shows checkmark on tab 0 when decedent fields are filled | `AssertionError: expected '1Decedent' to contain '✓'` | product-debt |
| 5 | `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | shows checkmark on tab 1 when executor name is filled | `AssertionError: expected '2Executor' to contain '✓'` | product-debt |
| 6 | `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | tabs 2-7 always show checkmark (empty = valid) | `AssertionError: expected '3Real Props' to contain '✓'` | product-debt |
| 7 | `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | OtherAssetsTab renders three sections | `expect(element).toHaveTextContent()` | product-debt |
| 8 | `src/components/shared/__tests__/EnumSelect.test.tsx` | selection fires onChange and updates form value | `TestingLibraryElementError: Value "LegitimateChild" not found in options` | product-debt |
| 9 | `src/components/shared/__tests__/EnumSelect.test.tsx` | uses PascalCase enum values (not snake_case) | `TestingLibraryElementError: Value "SurvivingSpouse" not found in options` | product-debt |
| 10 | `src/components/shared/__tests__/EnumSelect.test.tsx` | pre-selects from default value | `AssertionError: expected '' to be 'AdoptedChild'` | product-debt |
| 11 | `src/components/shared/__tests__/EnumSelect.test.tsx` | renders exactly 2 blood type options | `TestingLibraryElementError: Found multiple elements with the text: Full` | product-debt |
| 12 | `src/components/shared/__tests__/EnumSelect.test.tsx` | selecting "Full" updates form value | `TestingLibraryElementError: Value "Full" not found in options` | product-debt |
| 13 | `src/components/shared/__tests__/EnumSelect.test.tsx` | renders option groups when options have group property | `TestingLibraryElementError: Unable to find an accessible element with the role "group"` | product-debt |
| 14 | `src/components/shared/__tests__/EnumSelect.test.tsx` | renders "Compulsory Heirs" group | `TestingLibraryElementError: Unable to find an accessible element with the role "group" and name "Compulsory Heirs"` | product-debt |
| 15 | `src/components/shared/__tests__/EnumSelect.test.tsx` | renders "Collateral Heirs" group | `TestingLibraryElementError: Unable to find an accessible element with the role "group" and name "Collateral Heirs"` | product-debt |
| 16 | `src/components/shared/__tests__/EnumSelect.test.tsx` | applies filter to restrict available options | `TestingLibraryElementError: Found multiple elements with the text: /Legitimate Child/` | product-debt |
| 17 | `src/components/shared/__tests__/PersonPicker.test.tsx` | renders all person options | `TestingLibraryElementError: Found multiple elements with the text: /Juan Dela Cruz/` | product-debt |
| 18 | `src/components/shared/__tests__/PersonPicker.test.tsx` | selects a person and updates form value to their ID | `TestingLibraryElementError: Value "lc1" not found in options` | product-debt |
| 19 | `src/components/shared/__tests__/PersonPicker.test.tsx` | shows person name + relationship badge in options | `TestingLibraryElementError: Found multiple elements with the text: /Juan Dela Cruz/` | product-debt |
| 20 | `src/components/shared/__tests__/PersonPicker.test.tsx` | pre-selects person from default value | `AssertionError: expected '' to be 'sp'` | product-debt |
| 21 | `src/components/shared/__tests__/PersonPicker.test.tsx` | shows "Other (not in family tree)" when allowStranger | `TestingLibraryElementError: Found multiple elements with the text: /not in family tree/i` | product-debt |
| 22 | `src/components/shared/__tests__/PersonPicker.test.tsx` | selecting stranger sets person_id to null | `TestingLibraryElementError: Value "__stranger__" not found in options` | product-debt |
| 23 | `src/components/shared/__tests__/PersonPicker.test.tsx` | applies filter to restrict available options | `TestingLibraryElementError: Found multiple elements with the text: /Juan Dela Cruz/` | product-debt |
| 24 | `src/components/shared/__tests__/PersonPicker.test.tsx` | applies excludeIds to hide specific persons | `TestingLibraryElementError: Found multiple elements with the text: /Maria Dela Cruz/` | product-debt |
| 25 | `src/components/wizard/__tests__/DonationsStep.test.tsx` | PersonPicker is populated from family_tree persons | `TestingLibraryElementError: Found multiple elements with the text: /Juan Cruz/` | product-debt |
| 26 | `src/components/wizard/__tests__/HeirReferenceForm.test.tsx` | selecting a person populates name as read-only | `TestingLibraryElementError: Value "lc1" not found in options` | product-debt |
| 27 | `src/components/wizard/__tests__/ReviewStep.test.tsx` | renders estate summary with formatted amount | `TestingLibraryElementError: Found multiple elements with the text: /Estate/i` | product-debt |
| 28 | `src/components/wizard/__tests__/ReviewStep.test.tsx` | renders family tree person count | `TestingLibraryElementError: Unable to find an element with the text: /3 persons/i` | product-debt |
| 29 | `src/components/wizard/__tests__/ReviewStep.test.tsx` | renders will disposition counts when hasWill=true | `TestingLibraryElementError: Unable to find an element with the text: /1 institution/i` | product-debt |
| 30 | `src/components/wizard/__tests__/ReviewStep.test.tsx` | renders donations count | `TestingLibraryElementError: Unable to find an element with the text: /2 donation/i` | product-debt |
| 31 | `src/components/wizard/__tests__/WillStep.test.tsx` | renders 4 sub-tabs | `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name /^Institutions$/i` | product-debt |

**Verdict counts: `environment` = 0, `product-debt` = 31.**

Reproducibility of the classification, run over the full multi-line message bodies rather than the
first line only:

```
MESSAGES MATCHING "is not a function|is not defined": 0
```

Zero matches, and zero rows classified `environment`. The two counts agree, so the classification
is derived from the rule and not from opinion.

**Therefore no shim was added.** `git diff --stat src/test-setup.ts` prints nothing. The jsdom
globals CUT-02 names are present *and sufficient*: not one of the 31 remaining failures is caused
by a missing DOM or BOM global. They are Radix/Testing-Library query and product assertions —
principally Radix `Select` options not being queryable in the way these tests query them — which
is product debt, ledgered and stable, and out of scope for this phase.

## Journey suite — before

`cd frontend && npx supabase status` → exit 0, stack up (`supabase_db_inheritance` serving on
`127.0.0.1:55322`). The run below was therefore taken against a live database.

`cd frontend && node journey/run.mjs --all` → **`G17-EXIT=1`**

```
GATE-SKIPS total=28 skipped=0
JOURNEY FAIL steps=28 failed=24
```

**Passing (4):** `auth-signin`, `auth-signup`, `auth-verify-nocode`, `auth-verify-badcode`.
Every one is an unauthenticated screen and therefore sidebar-free. This is the corroborating
evidence for the sidebar-nav explanation of the other 24 — corroboration, not proof, and the
phase's journey rule still requires each diff to be inspected individually.

**Failing (24), each with its literal marker as printed:**

| Step | Marker |
|---|---|
| `auth-session-persisted` | `DIFF FAILURE` |
| `intake-step-0` | `DIFF FAILURE` |
| `intake-step-1` | `DIFF FAILURE` |
| `intake-step-2` | `DIFF FAILURE` |
| `intake-step-3` | `DIFF FAILURE` |
| `intake-step-4` | `DIFF FAILURE` |
| `intake-step-5` | `DIFF FAILURE` |
| `intake-step-6` | `DIFF FAILURE` |
| `intake-draft-recovered` | `DIFF FAILURE` |
| `results-view` | `REFERENCE SIZE MISMATCH` |
| `results-family-tree` | `REFERENCE SIZE MISMATCH` |
| `tax-tab-0` | `DIFF FAILURE` |
| `tax-tab-1` | `DIFF FAILURE` |
| `tax-tab-2` | `DIFF FAILURE` |
| `tax-tab-3` | `DIFF FAILURE` |
| `tax-tab-4` | `DIFF FAILURE` |
| `tax-tab-5` | `DIFF FAILURE` |
| `tax-tab-6` | `DIFF FAILURE` |
| `tax-tab-7` | `DIFF FAILURE` |
| `wizard-estate` | `DIFF FAILURE` |
| `wizard-decedent` | `DIFF FAILURE` |
| `wizard-family-tree` | `DIFF FAILURE` |
| `wizard-donations` | `DIFF FAILURE` |
| `wizard-review` | `DIFF FAILURE` |

22 × `DIFF FAILURE`, 2 × `REFERENCE SIZE MISMATCH`. The distinction is load-bearing: on a size
mismatch the harness computes **no pixel diff at all**, so for `results-view` and
`results-family-tree` there is no `diff.png` to inspect and the nav rule cannot be applied to them
in the same way.

### The intake rubrics assert the pre-cut step count as DOM text

`grep` over `journey/rubrics/intake-*.json`:

```
intake-step-0.json  → "Step 1 of 7"  "Step 1: Conflict Check"
intake-step-1.json  → "Step 2 of 7"  "Step 2: Client Details"
intake-step-2.json  → "Step 3 of 7"  "Step 3: About the Decedent"
intake-step-3.json  → "Step 4 of 7"  "Step 4: Family Composition"
intake-step-4.json  → "Step 5 of 7"  "Step 5: Asset Summary"
intake-step-5.json  → "Step 6 of 7"  "Step 6: Settlement Track"
intake-step-6.json  → "Step 7 of 7"  "Step 7: Review & Save"
intake-draft-recovered.json → "Step 2 of 7"
```

All **eight** intake journey steps assert `Step N of 7` as DOM text. The CUT-01 cut takes the
wizard from 7 steps to 4 and removes the Conflict Check, Client Details and Settlement Track
screens outright. These eight rubrics therefore break at the DOM level, not only at the pixel
level, and any new screenshot of them necessarily differs in wizard content — step labels, step
counter, and in three cases the entire screen. **Their diffs cannot be confined to the deleted
sidebar navigation region, so under the phase's journey reference rule they may not be
re-approved.** Plan `16-05` routes all eight to human review.

`git status --porcelain frontend/journey/references/` prints nothing. No reference was approved or
altered by this plan.

## Numbers later plans compare against

```
total tests            : 2119
min_total_tests        : 2119
ledger size (debt)     : 31
journey steps total    : 28
journey steps failed   : 24
```
