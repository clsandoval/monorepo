---
phase: 17
plan: 17-05
status: complete
requirements: [CITE-05]
---

# 17-05 — A blocking check for when the four layers disagree

Committed `10df74261` (`scripts/check-citation-integrity.mjs` and two fixtures).

## What it asserts

Five things over every committed corpus input, each with its own literal marker so a failure says
**which** rule broke:

| Marker | Assertion |
|---|---|
| `NARRATIVE DISAGREES` | `narrative.legal_basis` equals `share.legal_basis` element-for-element, per heir |
| `PROSE CITES ARTICLE` | `narrative.text` contains no `of the Civil Code` |
| `CITATION UNRESOLVED` | every emitted article resolves to a description |
| `LAYER DERIVES ARTICLE` | none of the four display layers contains `/Art\.\s*\d/` |
| `DUPLICATE RULE PRESENT` | `bridge.ts` contains neither `predictScenario` nor `computeMock` |

Plus `CORPUS EMPTY` and `CITATION SCAN UNREADABLE`, both exiting 1.

`LAYER DERIVES ARTICLE` is what turns "no other layer may derive one" from an intention into a
mechanical fact.

## Observed red before observed green

A gate that has never been seen red has never been tested. Two committed fixtures drive it:

```
--corpus <a>  FIXTURE-A-EXIT=1
  NARRATIVE DISAGREES — heir fixture-heir: narrative ["Art. 887"] vs table ["Art. 996"]
  PROSE CITES ARTICLE — heir fixture-heir: narrative prose contains "of the Civil Code"
--corpus <b>  FIXTURE-B-EXIT=1
  CITATION UNRESOLVED — heir fixture-heir: legal_basis "Art. 9999" resolves to no description
no flags      REAL-TREE-EXIT=0
  CITATION INTEGRITY OK — 652 heir rows across 171 corpus files, 24 distinct articles, all resolving
```

`git status --porcelain engine/src frontend/src` printed nothing between the red runs and the green
one: the injection is confined to fixtures, and the product source was never deliberately broken. The
fixtures are hand-written `EngineOutput`-shaped documents with invented heir names — never engine
inputs, never added to `engine/examples/`.

## Structural defences against a future green-by-convenience

- **No exception list.** There is no low-friction place to record a tolerated disagreement; making it
  pass requires fixing the code. `grep -ci` for allow-list and mutating-flag tokens → `0`.
- **No write flag.** Its only two flags are read-only path overrides. It cannot regenerate a baseline
  that would encode today's failures as tomorrow's expectation.
- **Measuring nothing is a failure.** Verified: an empty corpus directory exits **1** with
  `CORPUS EMPTY`. An unknown flag exits 1 with `CITATION SCAN UNREADABLE`.

It prints `GATE-SKIPS total=<n> skipped=0` on every exit path, success and failure alike.

## Verification

`node --check` exit 0. Marker grep count 15 (≥7 required). No manifest, lock or baseline touched by
this commit — registration is deliberately plan `17-06`, so the gate's own proof precedes its
enforcement.
