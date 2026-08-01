# Phase 16 Research — Stabilise the Deletion Milestone

**Researched:** 2026-08-01
**Requirements:** CUT-01, CUT-02, CUT-03, CUT-04
**Branch:** `gsd/deletion-milestone` at `6d06d7473`

Every number and every command output quoted here was produced by running the command in this
tree during research. Nothing below is inferred from a prior phase summary, because the whole
point of this phase is that the prior milestone's record and the tree disagree.

---

## 1. The headline: two of the phase's four success criteria are already false in ways nobody recorded

The phase brief inherited three assumptions from commit `4ccf06270`. Research confirmed one,
refuted one, and found a third problem the brief does not mention at all.

| Brief's assumption | Measured reality |
|---|---|
| "~1,465 frontend failures traceable to one missing jsdom global (ResizeObserver)" | **Refuted.** The polyfill is already present and G3 passes at exit 0. |
| "24 failing journey references" | **Confirmed exactly.** `JOURNEY FAIL steps=28 failed=24`. |
| *(not mentioned)* | **G20 and G21 are registered blocking gates whose scripts were deleted.** `ci-gates.sh` cannot reach exit 0 by any agent-permitted action. |

Plus one interaction the brief does not anticipate: **the guided-intake cut necessarily trips the
frontend test-count floor**, and raising or lowering that floor is prohibited.

---

## 2. CUT-02 — the jsdom globals are already there

`frontend/src/test-setup.ts` already installs `ResizeObserver`, `scrollIntoView`,
`hasPointerCapture`, and beyond them `DOMRect`, `matchMedia`, `setPointerCapture`,
`releasePointerCapture` and `Element.prototype.scrollTo`. Each is installed behind an
`if (!existing)` guard with a comment explaining that an unconditional assignment would shadow a
future real implementation.

Provenance: commit `181ae68c5`, *"test(01): add jsdom polyfills — 342 failures to 46, none
skipped"*. `git diff HEAD -- src/test-setup.ts` is empty, so this is the committed state, not an
uncommitted local edit.

Measured, `cd frontend && npm run test:gate`:

```
Test Files  8 failed | 85 passed (93)
Tests      31 failed | 2088 passed (2119)
GATE OK — test baseline matches exactly
  total tests run     : 2119 (floor 2119)
  passed              : 2088
  known failures met  : 31
  LEDGER SIZE (debt)  : 31
GATE-SKIPS total=2119 skipped=0
```

**G3 passes.** `cd frontend && npx tsc -b --force` exits 0 with no output, so **G4 passes** too.

There is no population of ~1,465 environment failures anywhere in this tree. The 31 remaining
failures are the ledgered debt set — the sampled one is
`src/components/wizard/__tests__/WillStep.test.tsx` *"renders 4 sub-tabs"*, a Radix tabs query
assertion, not a missing global.

**Design consequence.** CUT-02 must be closed by *measuring and recording*, not by writing a
second copy of polyfills that already exist. Adding a duplicate would be pure motion, and worse,
an unguarded duplicate would shadow the guarded original. The one piece of genuine work left in
CUT-02 is to classify the 31 ledgered failures and prove that none of them is a missing jsdom
global — because if one is, that shim genuinely is missing and belongs in `test-setup.ts`. The
classification rule is mechanical and is written into plan `16-01` so the executor chooses
nothing: a failure whose message matches `is not a function` or `is not defined` naming a DOM or
BOM global is an environment failure and gets a guarded shim; every other failure is recorded as
product debt and left alone.

---

## 3. CUT-01 — the guided-intake cut, measured

### What exists

| File | LOC | Fate |
|---|---|---|
| `frontend/src/components/intake/GuidedIntakeForm.tsx` | 246 | edited |
| `frontend/src/components/intake/ConflictCheckStep.tsx` | 214 | deleted |
| `frontend/src/components/intake/ClientDetailsStep.tsx` | 218 | deleted |
| `frontend/src/components/intake/SettlementTrackStep.tsx` | 119 | deleted |
| `frontend/src/lib/conflict-check.ts` | 71 | deleted |
| `frontend/src/types/intake.ts` | 167 | edited |
| `frontend/src/lib/intake.ts` | 367 | edited |
| `frontend/src/components/intake/IntakeReviewStep.tsx` | 180 | edited |

### The step table

`INTAKE_STEPS` at `frontend/src/types/intake.ts:154` is a 7-name `as const` tuple, and
`INTAKE_STEP_COUNT` is its `.length`. `GuidedIntakeForm.renderStep()` is a `switch (currentStep)`
over cases `0`–`6`, one case per name, in the same order.

| Old index | Step name | Component | Fate |
|---|---|---|---|
| 0 | Conflict Check | `ConflictCheckStep` | **cut** |
| 1 | Client Details | `ClientDetailsStep` | **cut** |
| 2 | Decedent Info | `DecedentInfoStep` | survives → new index 0 |
| 3 | Family Composition | `FamilyCompositionStep` | survives → new index 1 |
| 4 | Asset Summary | `AssetSummaryStep` | survives → new index 2 |
| 5 | Settlement Track | `SettlementTrackStep` | **cut** |
| 6 | Review & Save | `IntakeReviewStep` | survives → new index 3 |

`INTAKE_STEP_COUNT` goes 7 → 4.

**Editing order matters and is fixed in the plan: highest index first.** Removing index 5 before
index 1 before index 0 means each removal only renumbers cases *after* it, so at no point does the
executor hold two different renumbering schemes in its head. Removing index 0 first would shift
every remaining case immediately and is exactly the shape of edit that produced the mangled file
the owner reverted. `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters`, so
`npx tsc -b --force` is a genuine per-edit tripwire: a stale import or an orphaned handler fails
the build rather than lingering.

### What the cut orphans

In `frontend/src/types/intake.ts`: `ConflictCheckStepState`, `ClientDetailsStepState`,
`SettlementTrackStepState`, `SettlementTrack`, `ClientRelationship`, `CLIENT_RELATIONSHIPS`,
`CLIENT_RELATIONSHIP_LABELS`, and the `conflictCheck` / `clientDetails` / `settlementTrack`
members of `IntakeFormState`.

`frontend/src/lib/conflict-check.ts` goes in full — it is the only definition of
`ConflictOutcome`, which `types/intake.ts:8` imports.

In `frontend/src/lib/intake.ts` the touch sites are: `createInitialIntakeState` (~40, ~46, ~81),
`mapIntakeToEngineInput` (~182), the `IntakeData` construction (~222–223),
`getSettlementMilestones` (~326), and `isStepComplete`'s per-index cases (~337, ~341, ~359).

`IntakeData.settlement_track` also appears at `frontend/src/types/index.ts:679`.

`frontend/src/types/client.ts` is imported by `DecedentInfoStep.tsx` and `IntakeReviewStep.tsx`
as well as by the deleted `ClientDetailsStep.tsx`, so it survives the cut. Only
`ClientDetailsStep`'s import of it goes.

---

## 4. CUT-03 — the journey references, measured exactly

`cd frontend && node journey/run.mjs --all` was run to completion against the live local Supabase
(`supabase status` reports the stack up; `supabase_db_inheritance` is running). Result:

```
GATE-SKIPS total=28 skipped=0
JOURNEY FAIL steps=28 failed=24
G17 EXIT: 1
```

The exact 24, with their markers — and there are **two distinct markers**, which is the single
most important detail in this section:

| Marker | Count | Steps |
|---|---|---|
| `DIFF FAILURE` | 22 | `auth-session-persisted`; `intake-step-0` … `intake-step-6`; `intake-draft-recovered`; `tax-tab-0` … `tax-tab-7`; `wizard-estate`, `wizard-decedent`, `wizard-family-tree`, `wizard-donations`, `wizard-review` |
| `REFERENCE SIZE MISMATCH` | 2 | `results-view`, `results-family-tree` |

The **4 passing** steps are `auth-signin`, `auth-signup`, `auth-verify-nocode` and
`auth-verify-badcode` — every one unauthenticated, therefore sidebar-free. That is strong
corroboration for the sidebar-nav story on the authenticated set. It is corroboration, not proof,
and the phase rule still requires each diff to be looked at individually.

`results-view` and `results-family-tree` failed on **size**, so no pixel diff was computed at all.
A page-height change is not self-evidently "confined to the deleted sidebar navigation region" and
these two cannot be lumped in with the 22.

### The interaction the brief misses: the intake journey steps break at the DOM level, not the pixel level

The intake rubrics assert the wizard's *text*, not only its pixels:

```
journey/rubrics/intake-step-0.json → "Step 1 of 7" and "Step 1: Conflict Check"
journey/rubrics/intake-step-5.json → "Step 6 of 7" and "Step 6: Settlement Track"
```

and each step record seeds a complete `IntakeFormState` from
`journey/fixtures/intake-draft-step-N.json` into `localStorage['inheritance-intake-draft']`.
The step file's own `$comment` records why the fixtures are complete states: seeding a partial
draft crashes the app into its error boundary.

So the CUT-01 cut invalidates all eight intake journey steps *twice over* — the rubric text and
the seeded state shape both stop matching. Their diffs will touch wizard fields and step labels,
which the phase's journey rule explicitly forbids re-approving. **These eight are not
sidebar-shifted references. They describe a surface that will no longer exist in that shape, and
approving them would be precisely the act `journey/approve.mjs` was written to prevent.** The
plan therefore routes all eight to human review and approves none of them.

Precedent for the alternative — retiring a step whose surface was deleted outright — is commit
`4ccf06270`, which deleted `journey/steps/{org,share}.json` and their reference PNGs. That
precedent is *not* applied to the intake steps here, because the guided intake still exists; only
three of its seven screens were removed. Retiring a step for a surface that still exists would be
weakening a gate, which this phase may not do.

### Registry state

28 steps across `journey/steps/{account,intake,output,tax,wizard}.json` — account 5, intake 8,
output 2, tax 8, wizard 5 — and 28 approved reference PNGs.
`node scripts/check-journey-registry.mjs` (G16) exits 0 with `JOURNEY REGISTRY ok steps=28
references=28`.

Residue from `4ccf06270`, harmless to G16 but worth sweeping: five orphan tolerance sidecars with
no PNG and no owning step —
`journey/references/{org-invite-accepted,org-invite-rejected,share-disabled,share-populated,share-uncomputed}.json`.

---

## 5. BLOCKER A — G20 and G21 are registered gates with deleted scripts

Commit `4ccf06270` deleted `frontend/journey/share-exposure.mjs` and
`frontend/journey/seo-smoke.mjs` but left both gates registered and blocking:

```
15 G20  BLK cd frontend && node journey/share-exposure.mjs
16 G21  BLK cd frontend && node journey/seo-smoke.mjs
```

Verified:

```
$ ls frontend/journey/share-exposure.mjs frontend/journey/seo-smoke.mjs
ls: cannot access 'frontend/journey/share-exposure.mjs': No such file or directory
ls: cannot access 'frontend/journey/seo-smoke.mjs': No such file or directory
```

G20's `precondition` is `test -f frontend/supabase/fixtures.json`, and that file exists, so the
runner will *execute* both gates rather than skip them, and both will fail. `ci-gates.sh` states
in its own header that there is deliberately no option for omitting a gate and no flag for
pointing it at a different manifest.

Retiring a gate is **owner action, never agent action** — `CLAUDE.md` invariant 2, enforced by
`node scripts/check-gate-manifest.mjs` (G5). An agent may not remove these gates from the
manifest, edit their command strings, or set them non-blocking.

**Therefore success criterion 4 — `bash scripts/ci-gates.sh` exits 0 — is not reachable by any
permitted action in this phase.** The correct output is a BLOCKED report naming the owner
decision, not a manifest edit. Any plan that promised exit 0 here would be promising to break
invariant 2.

---

## 6. BLOCKER B — the intake cut trips the frontend test-count floor

`frontend/test-baseline.json` carries `min_total_tests: 2119`, and
`frontend/scripts/check-test-baseline.mjs:186` fails with `TEST COUNT DROPPED` when the measured
total falls below it.

Measured test counts for the files the cut orphans:

| File | Tests |
|---|---|
| `src/lib/__tests__/conflict-check.test.ts` | 11 |
| `src/lib/__tests__/intake.test.ts` | 73 |
| `src/components/intake/__tests__/intake-form.test.tsx` | 16 |

`conflict-check.test.ts` dies in full with its subject — all 11. That alone takes the total to at
most 2108, below the 2119 floor, and G3 turns red with `TEST COUNT DROPPED`. The other two files
lose only their client-details / settlement-track / conflict-check cases and keep the rest.

The baseline file does carry a `floor_lowered` record, and `4ccf06270` used it once with explicit
owner authorisation. **This phase may not use it.** The phase's own constraints prohibit lowering
a baseline floor and prohibit editing `test-baseline.json` to turn a red run green, without
exception and without an authorisation path an agent can invoke.

So the honest sequence is: make the cut, run the gate, observe `TEST COUNT DROPPED`, and stop
with the pasted output. Lowering the floor is the owner's call, exactly as it was in
`4ccf06270`.

---

## 7. What this means for the phase's shape

Three of the four requirements are fully achievable by agent action:

- **CUT-01** — the cut itself lands cleanly, proven by `npx tsc -b --force` exit 0 after each
  edit.
- **CUT-02** — closed by measurement plus the mechanical classification of the 31 ledgered
  failures.
- **CUT-03** — every one of the 24 is either approved under the nav rule with the diff inspected,
  or reported for human review. "Reported for human review" is a *pass* for CUT-03 as written;
  the requirement says "either passing or explicitly reported", not "all passing".

**CUT-04 — `ci-gates.sh` exits 0 — cannot be met**, for two independent reasons that both require
owner action (§5, §6). The phase closes with a BLOCKED report enumerating both, and that is the
correct outcome rather than a failure of the phase. The loop is already `STALLED` in
`LOOP-STATUS.md` with 5 consecutive non-pass runs and signature `G17:1`, and the stall rule
already says a human decision is required — this phase's job is to make that decision precise
and small, not to route around it.

## 8. Unmeasured territory

The last full run halted at G17 having reached 13 of 32 gates. **G19, G22–G25 and G30–G33 have
not executed since the deletion commits.** G19 (`money-parity.mjs`), G24 (`pdf-visual.mjs`) and
G25 (`print-layout.mjs`) all drive the post-deletion application and may carry their own fallout.
Their state is genuinely unknown. The final plan measures them by running the whole suite rather
than assuming, and reports whatever it finds.

## 9. Numbering note

The invoking brief calls this "Phase 1". `.planning/ROADMAP.md` and `.planning/REQUIREMENTS.md`
call the identical goal **Phase 16** of milestone v2.0, owning CUT-01…CUT-04. Phase 16 is the
repo-true number and is used throughout.

`.planning/PHASE-16-BRIEF.md` is a stale artifact describing an earlier, different "perpetual
verification loop" idea. The ROADMAP now consumes its five scope-lock numbers in **Phase 26**, not
here. It is not an input to this phase.

## Validation Architecture

| Claim this phase will make | How it is sampled | Why that sample is sufficient |
|---|---|---|
| The three intake steps are gone | `grep` for each component name across `frontend/src/` returning zero hits, plus `npx tsc -b --force` exit 0 | `noUnusedLocals` makes a partial removal a build failure, so a clean typecheck is a strong signal, not a weak one |
| No orphaned intake type survives | `grep` for each of the seven orphaned identifiers returning zero hits | The identifier list is enumerated in §3, so the sample is the whole population |
| The jsdom globals are present and sufficient | `npm run test:gate` exit 0, plus the mechanical classification of all 31 ledgered failures | 31 is the whole population of failures, not a sample |
| Every journey reference is resolved | `node journey/run.mjs --all` output enumerating all 28 steps, plus a per-step disposition table | The gate itself enumerates the population |
| A re-approved reference was legitimately re-approvable | Per-step visual inspection of `.journey-runs/<newest>/<stepId>/` artifacts before any approve call | One-by-one inspection is the only sample that honours the journey rule |
| Nothing was weakened | `git diff` on `gate-skips.lock`, `assertion-baseline.json`, `test-baseline.json` and `gates.manifest.json` printing nothing | Those four files are the complete set of weakening surfaces named by the constraints |
