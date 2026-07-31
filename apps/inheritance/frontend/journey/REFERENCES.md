# Reference images and the re-approval flow

A journey gate judges a screen two ways at once. A **rubric** is a fixed list of yes/no DOM
assertions; a **perceptual diff** compares the captured pixels against an approved reference image.
They have opposite blind spots — a diff cannot see that a spouse's share reads ₱1.5M instead of
₱1.0M, and a rubric cannot see a layout silently collapse — which is why both run and why a failure
must say *which one* fired.

## The five markers

Every journey failure is labelled with one or more of exactly these strings. A step that fails both
mechanisms reports **both** markers; collapsing them into one destroys the distinction this document
exists to preserve.

| Marker | Meaning | What it usually means you should do |
|---|---|---|
| `RUBRIC FAILURE` | At least one rubric assertion evaluated false. The failing assertion's `id`, `expected` and `actual` are in the run's `rubric.json`. | Read the assertion. This is a content/behaviour claim — usually a real product defect, not a reference problem. |
| `DIFF FAILURE` | A pixel comparison ran and `diffPixels` exceeded the reference's `maxDiffPixels`. | Open `diff.png`. Either the UI changed on purpose (re-approve), or it changed by accident (fix it). |
| `REFERENCE MISSING` | No `references/<stepId>.png`, or the PNG exists but its `references/<stepId>.json` sidecar does not. | Capture a run, then approve. An image with no declared tolerance has no pass condition, so a missing sidecar is as fatal as a missing image. |
| `REFERENCE SIZE MISMATCH` | The reference and the capture differ in width or height. No pixel comparison was attempted, because `pixelmatch` requires equal dimensions, so `diffPixels` is `null`. | Usually a viewport or page-length change. Confirm the change is intended, then re-approve. |
| `STEP ERROR` | The step threw before a verdict could be reached — navigation failed, a seed failed, the browser died. | Read the error text in the run artifacts. This is never a reference problem. |

## When to re-approve

There are exactly two legitimate reasons to replace an approved reference:

1. **An intentional UI change landed.** The screen is supposed to look different now, and a human has
   looked at the new screenshot and agrees it is correct.
2. **The reference was captured on a platform whose text rasterisation differs from the one the gate
   runs on.** Fonts hint and antialias differently between a developer machine and a CI container, so
   a reference approved on one can be legitimately unreachable on the other.

Anything else — most of all "the gate is red and I want it green" — is not a reason to re-approve.

## How to re-approve

From `frontend/`:

```bash
# 1. Produce the artifact. Re-run the journey gate so the step writes
#    .journey-runs/<timestamp>/<stepId>/actual.png.
node journey/<the runner for that step>.mjs

# 2. Look at the new screenshot and the diff image with your own eyes.
#    This step has no command. It is the step that makes the approval mean something.

# 3. Approve it.
node journey/approve.mjs <stepId>

# …optionally, when a platform genuinely cannot reach a zero-pixel match:
node journey/approve.mjs <stepId> --max-diff-pixels <int> --by "<who approved it>"
```

Then commit the two changed files with explicit paths (never `git add -A`):

```bash
bash scripts/safe-commit.sh -m "chore(journey): re-approve <stepId> reference" \
  apps/inheritance/frontend/journey/references/<stepId>.png \
  apps/inheritance/frontend/journey/references/<stepId>.json
```

`approve.mjs` refuses — exits 1 with `APPROVE REFUSED: no artifact found for step <stepId>` — when no
run has produced that step's `actual.png`. Approval may never invent an image; it can only promote one
that a real run actually captured.

## What is prohibited

- **Raising `maxDiffPixels` to clear a red gate is prohibited.** It is the perceptual equivalent of
  widening a test tolerance, which this project forbids everywhere else, and it is worse here because
  the widening hides inside a JSON sidecar nobody reads. `maxDiffPixels` defaults to `0`. Raise it
  only for a measured platform-rasterisation reason, and record who raised it in `approvedBy`.
- **No gate invokes `approve.mjs`.** The gate registered in plan 10-06 calls `diff.mjs` only, and
  `diff.mjs` contains no write call of any kind. A gate that could approve its own reference would go
  green by rewriting its own expectation.
- **Never hand-place a PNG into `references/`.** It would not correspond to anything a run produced.
  The only sanctioned path in is `approve.mjs`.

## Why Phase 10 ships no golden image

`frontend/journey/references/` contains only `.gitkeep` at the end of Phase 10, deliberately.

Per `10-RESEARCH.md` §5: cross-platform font rasterisation for this project is **unmeasured**, because
no CI run has ever executed here. Committing a golden image of the real application now would be an
unmeasured claim — it would encode one machine's antialiasing as the definition of correct, and the
first CI run would fail for a reason that has nothing to do with the product.

So the Phase 10 self-test generates its reference **at run time** from a committed HTML fixture. That
tests the mechanism without importing the portability problem. Phases 11 and 12 capture and commit the
real application's references, using exactly the flow written down above.

## PDF page references

Phase 13 added a second reference store, `frontend/journey/pdf-references/`, holding one image per
page of the estate report that the product's own Export PDF button produces. Gate **G24**
(`journey/pdf-visual.mjs`) reads it; `journey/pdf-approve.mjs` is the only writer.

Everything above applies unchanged: the five markers, the `maxDiffPixels` default of `0`, the
prohibition on raising it to clear a red gate, the prohibition on hand-placing a PNG, and the rule
that no gate ever invokes an approval command.

**The one difference: approval is whole-document, not per-step.** `pdf-approve.mjs` takes no step id
and approves every page of the newest run at once, because approving one page of a two-page report
while leaving the other at an older revision would leave the reference set describing a document that
never existed. It also deletes any reference whose page number exceeds the count just approved, so a
report that lost a page cannot leave a stale image behind.

```bash
# 1. Produce the artifact. The gate writes .journey-runs/<timestamp>/pdf/page-<n>.png.
node journey/pdf-visual.mjs

# 2. Look at every page image with your own eyes. No command. This is the step that
#    makes the approval mean something.

# 3. Approve the whole document.
node journey/pdf-approve.mjs
```

These images live outside `journey/references/` on purpose:
`scripts/check-journey-registry.mjs` (gate G16) raises `ORPHAN REFERENCE` for any image there that is
not a declared browser step, and a PDF page has no `url`, no `session` and no `rubric`. See
`frontend/journey/pdf-references/README.md` for the rasterisation contract — `pdftoppm -png` at 100
dots per inch — and for the recorded non-embedded-font portability exposure.
