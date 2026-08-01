# Phase 16 — Journey Reference Disposition (CUT-03)

Run inspected: `frontend/.journey-runs/2026-08-01T04-54-52-524Z`
Result of that run: `JOURNEY FAIL steps=28 failed=24`
Captured viewport: 1280 x 800, `deviceScaleFactor: 1` (`frontend/journey/browser.mjs:43-44`)

## The pixel rule, stated before it was applied

`src/components/layout/AppLayout.tsx:40` renders the sidebar as
`<aside className="hidden md:flex w-64 ...">`. Tailwind `w-64` is **256 px**, and the aside is the
first child of the row, so the deleted sidebar navigation region is:

> **x ∈ [0, 255]** across the full height of the capture.

**Approval test applied to every step below:** a step is approvable when *every* differing pixel has
`x <= 255`. Any differing pixel at `x >= 256` disqualifies the step, which is then left failing and
routed to human review with the changed element named.

Differing pixels were measured exhaustively, not sampled: for each step, every pixel of
`reference.png` was compared against `actual.png` and the bounding box of all pixels differing by
more than 8/255 on any channel was recorded. The measurement covers 100% of the frame, so
"every differing pixel" is a measured claim rather than an eyeballed one. The images were then also
opened and viewed, because a bounding box cannot say *what* changed.

## Group 1 — 14 authenticated non-intake steps: APPROVED

Every one of these fourteen produced a **byte-identical diff signature**:

```
n=1688  x=[12,243]  y=[215,287]
```

1688 differing pixels, all with `x <= 243 < 256`. The identical pixel count and identical bounding
box across fourteen independent screens is itself evidence that a single shared DOM element changed
rather than fourteen unrelated things.

Visual inspection of the region (`auth-session-persisted` and `tax-tab-5`, cropped to x∈[0,300],
y∈[150,550]) confirms the cause directly:

| reference.png | actual.png |
|---|---|
| Cases / New Case / **Blog** / ──── / Settings | Cases / New Case / ──── / Settings |

The **Blog** nav item is gone and the divider and Settings shifted up by one row height. This is the
removal the owner authorised. Nothing else in the frame differs.

| Step | Marker | Differing-pixel x-range | Verdict |
|---|---|---|---|
| `auth-session-persisted` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-0` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-1` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-2` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-3` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-4` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-5` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-6` | DIFF FAILURE | [12,243] | **approve** |
| `tax-tab-7` | DIFF FAILURE | [12,243] | **approve** |
| `wizard-estate` | DIFF FAILURE | [12,243] | **approve** |
| `wizard-decedent` | DIFF FAILURE | [12,243] | **approve** |
| `wizard-family-tree` | DIFF FAILURE | [12,243] | **approve** |
| `wizard-donations` | DIFF FAILURE | [12,243] | **approve** |
| `wizard-review` | DIFF FAILURE | [12,243] | **approve** |

All fourteen approved with `node journey/approve.mjs <stepId> --by deletion-milestone-nav-change`,
no other flags, so `maxDiffPixels` stays at its default of **0**.

## Group 3 — `results-view`, `results-family-tree`: NOT APPROVED, human review

Both are `REFERENCE SIZE MISMATCH`: `reference.png` is 1280x**2320**, `actual.png` is 1280x**2106**.
The harness computes no pixel diff when dimensions differ, so the overlapping 2106 rows were
compared directly. Both steps produced the same result:

```
common-rows=2106  n=3629  x=[0,1084]
```

**`x` reaches 1084, which is far outside the sidebar region.** The rule rejects them. Banding the
differences by row separates two independent causes:

| Band | x-range | Cause |
|---|---|---|
| y ∈ [215,287] | [12,243] | the Blog nav removal — the same 1688-pixel signature as Group 1 |
| y ∈ [2017,2105] | [0,1084] | **main content**, disqualifying |
| below y=2106 | — | 214 px of page height that no longer exists |

Cropping and viewing y ∈ [1980,2320] names the changed elements exactly:

- The results action bar lost its **Share** button. The reference row reads
  `Edit Input · Export PDF · Export JSON · Copy Narratives · Share`; the actual row ends at
  `Copy Narratives`.
- The **Documents** section heading and its `0 of 0 obtained (0%)` progress bar are gone entirely.
- The **Case Notes** section heading and its `+ Add Note` button are gone entirely.

Those three removals account for the 214 px height loss. They are plausibly the intended
consequence of the share-link, documents and case-notes cuts — but they are **content changes, not
navigation changes**, and the journey reference rule permits approval only for a diff confined to
the deleted sidebar navigation region. Approving them would silently bless a new expectation for a
region of the page nobody was asked to look at.

| Step | Marker | Dimensions ref → act | Disqualifying element | Verdict |
|---|---|---|---|---|
| `results-view` | REFERENCE SIZE MISMATCH | 1280x2320 → 1280x2106 | `Share` button removed from the results action bar; `Documents` section removed; `Case Notes` section removed | **human-review** |
| `results-family-tree` | REFERENCE SIZE MISMATCH | 1280x2320 → 1280x2106 | identical to `results-view` — same measured band, same three elements | **human-review** |

## Group 2 — the 8 intake steps: NOT APPROVED, human review

`intake-step-0` … `intake-step-6` and `intake-draft-recovered`.

Their marker **changed** between the plan-16-01 baseline and this run, which makes them a signal
this phase produced rather than an inherited failure:

| Step | Marker in 16-BASELINE.md | Marker now |
|---|---|---|
| `intake-step-0` … `intake-step-6`, `intake-draft-recovered` | `DIFF FAILURE` | `RUBRIC FAILURE REFERENCE SIZE MISMATCH` |

They now fail the **rubric** before any pixel is compared, because the rubrics assert `Step 1 of 7`
and `Step 6: Settlement Track` as DOM text against a wizard the cut reduced to four steps, and
because plan `16-03` moved the draft storage key to `inheritance-intake-draft-v2` while the step
records still seed `inheritance-intake-draft`. Their reference heights (800, 936, 912, 1195) also
disagree with the post-cut 896.

Their diffs therefore necessarily touch wizard content, which the journey reference rule forbids
approving. **None is approved.** None is deleted from the registry either — the guided intake still
exists; three of its seven screens went, not the surface.

Producing a first reference for a rebuilt screen is a visual judgement that belongs to a human, so
all eight are reported rather than re-baselined by this phase.

## A product defect the intake repair uncovered

Bringing the rubrics to post-cut truth required reading the real DOM, and that surfaced a defect the
cut left behind. `16-03` renumbered **one** step heading — `IntakeReviewStep.tsx`, "Step 7: Review &
Save" → "Step 4: Review & Save" — and missed the other three. The wizard was rendering a progress
line and a heading that contradicted each other on the same screen:

| Screen | Progress line | Heading (before) | Heading (after) |
|---|---|---|---|
| Decedent Info | Step 1 of 4 | **Step 3: About the Decedent** | Step 1: About the Decedent |
| Family Composition | Step 2 of 4 | **Step 4: Family Composition** | Step 2: Family Composition |
| Asset Summary | Step 3 of 4 | **Step 5: Asset Summary** | Step 3: Asset Summary |
| Review & Save | Step 4 of 4 | Step 4: Review & Save | unchanged — `16-03` had already fixed it |

Fixed in `DecedentInfoStep.tsx`, `FamilyCompositionStep.tsx` and `AssetSummaryStep.tsx` (heading and
the file's own doc comment). `npx tsc -b --force` exits 0. This is CUT-01 work that the cut left
undone, not new surface.

## The intake registry, brought to post-cut truth (not approved)

The wizard went 7 screens → 4, so three step records described surfaces that no longer exist. The
remap is **screen-preserving**: each surviving record, its rubric and its already-approved reference
image travel together to the id matching the screen's new position. No reference image was written,
regenerated or approved — the bytes are the previously approved ones, only the filename changed, and
every remapped step still **fails**, so no step can go falsely green off the rename.

| Old id | Screen | New id |
|---|---|---|
| `intake-step-0` | Conflict Check | **deleted** — surface gone |
| `intake-step-1` | Client Details | **deleted** — surface gone |
| `intake-step-2` | About the Decedent | `intake-step-0` |
| `intake-step-3` | Family Composition | `intake-step-1` |
| `intake-step-4` | Asset Summary | `intake-step-2` |
| `intake-step-5` | Settlement Track | **deleted** — surface gone |
| `intake-step-6` | Review & Save | `intake-step-3` |
| `intake-draft-recovered` | draft recovery | unchanged id, re-pointed |

Three further repairs, none of which changes an assertion's strength:

- The step records seeded `localStorage['inheritance-intake-draft']`; `16-03` moved the key to
  `inheritance-intake-draft-v2`. All five records updated.
- Every fixture carried the seven-key `IntakeFormState`. All five rewritten to the four-key post-cut
  shape (`currentStep`, `decedentInfo`, `familyComposition`, `assetSummary`), values preserved, each
  still a **complete** state — the step file records that a partial draft crashes the app into its
  error boundary.
- `intake-draft-recovered` seeded the deleted Client Details screen and asserted `#client-name`.
  Re-pointed at the surviving Decedent Info screen and `#decedent-name`, carrying the same
  `Recovered Client` value.

Assertion shape is byte-for-byte unchanged per surviving step — same assertion ids, same kinds, same
counts (5 per intake step, 6 for draft-recovery), including the `no-crash` and `no_console_error`
assertions. Only what they point at moved.

**Proof the remap is correct rather than merely consistent:** all five intake steps now pass their
rubrics against the live DOM (`intake-step-0` 5/5, `intake-draft-recovered` 6/6), where before they
failed at the rubric. A wrong screen-to-id mapping would have failed these. The captured DOM reads
`Step 1 of 4 … 1 Decedent Info 2 Family Composition 3 Asset Summary 4 Review & Save … Step 1: About
the Decedent`.

They still fail on `REFERENCE SIZE MISMATCH` / `DIFF FAILURE`, because their reference images show
the old seven-step chrome. **That is the reported state, and it is deliberate:** producing a first
reference for a rebuilt screen is a visual judgement, and this phase approves none of them.

`node scripts/check-journey-registry.mjs` → exit 0, `JOURNEY REGISTRY ok steps=25 references=25`.

## Summary

`node journey/run.mjs --all`: **failed=24 → 10 → 7**.

| Disposition | Count | Steps |
|---|---|---|
| Approved (nav-confined, measured and viewed) | 14 | `auth-session-persisted`, `tax-tab-0`…`tax-tab-7`, the five `wizard-*` |
| Human review — content changed outside the nav region | 2 | `results-view`, `results-family-tree` |
| Human review — rubric now green, reference needs a human re-baseline | 5 | `intake-step-0`…`intake-step-3`, `intake-draft-recovered` |
| Retired with their deleted screens | 3 | old `intake-step-0`, `intake-step-1`, `intake-step-5` |
| Already passing (unauthenticated, no sidebar) | 4 | `auth-signin`, `auth-signup`, `auth-verify-nocode`, `auth-verify-badcode` |

No step is left in an undecided state, which is what CUT-03 asks for. Seven steps remain red on
purpose, each listed above with the specific reason.

**What a human must decide** (neither is an agent's call):
1. `results-view` / `results-family-tree` — confirm the `Share` button, `Documents` and `Case Notes`
   removals are intended, then re-approve those two references.
2. The five intake steps — look at the rebuilt four-step wizard and approve its first references.
