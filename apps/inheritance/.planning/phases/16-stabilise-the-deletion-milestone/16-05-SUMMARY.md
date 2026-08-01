---
phase: 16
plan: 16-05
status: complete
requirements: [CUT-03, CUT-01]
---

# 16-05 — Resolve the 24 journey references

Committed `2d55ce4a2` and `6f02c89e4`. Full record: `16-JOURNEY-DISPOSITION.md`.

`node journey/run.mjs --all`: **failed=24 → 10 → 7.**

## The rule was made numeric before anything was approved

`AppLayout.tsx:40` renders the sidebar as `w-64` = **256 px** at the left of a 1280×800 capture, so
the deleted navigation region is **x ∈ [0,255]**. Approval test: every differing pixel must have
x ≤ 255. Differing pixels were measured **exhaustively** — every pixel of every frame compared, not
sampled — so "every differing pixel" is measured, not eyeballed.

## Approved: 14, each inspected

All 14 produced a **byte-identical** signature: `n=1688, x=[12,243], y=[215,287]`. The identical
count and box across 14 independent screens is itself evidence of one shared DOM change. The images
were opened: reference reads `Cases / New Case / Blog / ─── / Settings`, actual reads
`Cases / New Case / ─── / Settings`. The authorised Blog nav removal, nothing else.
Approved `--by deletion-milestone-nav-change`, no other flags, all 14 sidecars at `maxDiffPixels: 0`.

## Refused: 2, and the element is named

`results-view`, `results-family-tree` — `REFERENCE SIZE MISMATCH` 2320 → 2106. Differing pixels
reach **x=1084**, far outside the sidebar. Row-banding separates the nav change (y 215–287) from a
main-content change (y 2017–2105): the **Share** button is gone from the results action bar, and the
**Documents** and **Case Notes** sections are gone entirely. Content, not navigation. Left failing.

## Refused: 5 intake steps, but repaired to post-cut truth

Their marker **changed** from `DIFF FAILURE` to `RUBRIC FAILURE REFERENCE SIZE MISMATCH` — a signal
this phase produced. Registry brought to truth by a **screen-preserving** remap (old 2/3/4/6 →
new 0/1/2/3; old 0/1/5 retired with their deleted screens), seed key moved to
`inheritance-intake-draft-v2`, fixtures rewritten to the four-key shape as complete states, and
`intake-draft-recovered` re-pointed from the deleted `#client-name` to the surviving
`#decedent-name`.

**No reference image was written, regenerated or approved.** Reference bytes are the previously
approved ones; only the filename moved with its screen, and every remapped step still fails, so no
step can go falsely green off the rename. Assertion shape is unchanged per surviving step — same
ids, kinds and counts, `no-crash` and `no_console_error` included.

**Proof the remap is correct, not merely self-consistent:** all five intake steps now **pass their
rubrics** against the live DOM (`intake-step-0` 5/5, `intake-draft-recovered` 6/6) where before they
failed at the rubric. A wrong screen-to-id mapping would have failed them.

## A product defect this uncovered and fixed

`16-03` renumbered one step heading and missed three, so the wizard rendered a progress line and a
heading contradicting each other on the same screen — "Step 1 of 4" above "Step 3: About the
Decedent". Corrected in `DecedentInfoStep`, `FamilyCompositionStep` and `AssetSummaryStep`.

## Verification

`npx tsc -b --force` exit 0. `node scripts/check-journey-registry.mjs` exit 0,
`JOURNEY REGISTRY ok steps=25 references=25`. G16 passes inside `ci-gates.sh`.
