---
phase: 17
plan: 17-01
status: complete
requirements: [CITE-01, CITE-02, CITE-03, CITE-04, CITE-05]
---

# 17-01 — Measured the citation baseline before touching a citation

Committed `904aaf264` (`17-BASELINE.md`, `scripts/citation-corpus.mjs`).

## What it found

Every figure re-measured on this branch rather than quoted from the audit. The corpus is **173**
committed JSON inputs; the engine rejects **2** (the `defect-cases`, by design under OBS-05), leaving
**171 computable inputs and 652 heir rows**.

Four quantities, each with the later plan that drives it:

| Quantity | Baseline | Target |
|---|---|---|
| Heir rows whose narrative cites an article absent from `legal_basis` | **615 of 652 (94.3%)** | `17-02` → 0 |
| Distinct `legal_basis` strings resolving to a description | **0 of 24** | `17-03` → 24 |
| `predictScenario` / `computeMock` occurrences | **2 / 2** | `17-04` → 0 |
| Registered gates | **32** | `17-06` → 33 |

The disagreement histogram confirmed the audit exactly and extended it:
`Art. 887` ×564, `Art. 176` ×31, `Art. 972` ×25, `Art. 970` ×25, `Arts. 1003-1008` ×22,
`Art. 179` ×6, `Arts. 1009-1010` ×4. The two **range forms** matter for the repair — expanding them
would introduce unregistered articles and turn G28 red.

The pill is dead for **every** article on **every** case, not only `Art. 996`: the map holds 73 keys
and the engine's spaced strings never hit any of them.

## Deliverable

`scripts/citation-corpus.mjs` — a dependency-free measuring library that loads the same WASM artifact
the product loads. It measures and never judges: it holds no call that ends the process, so a gate
can reuse it and still print a full report before its own verdict.

## Verification

`node --check` exit 0; `grep -c "process.exit"` → `0`; exports exactly
`ARTICLE_TOKEN_RE,CORPUS_DIRS,articleKeys,computeCorpus,loadEngine`; `files=173 computed=171
rejected=2`; `keys=73`. `bash scripts/ci-gates.sh --only G6` exit 0 (`PLANS OK — 103 plan file(s),
421 task(s) checked`). `node scripts/check-commit-discipline.mjs` exit 0. No engine or frontend
source modified.
