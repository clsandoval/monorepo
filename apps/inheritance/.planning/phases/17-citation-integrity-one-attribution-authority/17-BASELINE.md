# Phase 17 Baseline — measured before a single citation was touched

**Measured:** 2026-08-01, during plan `17-01`, in this tree, on branch `gsd/deletion-milestone`.

Every figure in this file was pasted from a command run during plan `17-01`. Nothing here was
copied from `17-RESEARCH.md`, from `VERDICT.md`, or from any prior phase summary. A figure carried
over from a research document without being re-run is not a baseline, it is a quotation — and the
whole point of this phase is that a restatement and its source can silently disagree.

The measuring library is `scripts/citation-corpus.mjs`, committed alongside this file. It loads the
compiled engine exactly as `frontend/journey/engine.mjs` does, so every number below came through
the same WASM artifact the product loads.

---

## The corpus denominator

```
cases 20
coverage-cases 31
testate-cases 20
defect-cases 2
fuzz-cases 100
TOTAL 173
-rw-rw-r-- 1 clsandoval clsandoval 616398 Aug  1 05:14 frontend/src/wasm/pkg/inheritance_engine_bg.wasm
-rw-rw-r-- 1 clsandoval clsandoval   7099 Aug  1 05:14 frontend/src/wasm/pkg/inheritance_engine.js
```

`engine/examples/simple-intestate.json` sits at the top level of `examples/` and is excluded: it is
a hand-written example, not a case `engine/examples/generate-test-cases.sh` produces.

Of the 173, the engine **rejects 2** — the two `defect-cases`, which exit non-zero with a structured
sum-conservation message by design (OBS-05). A rejected input is counted and excluded, never coerced
into an empty result. So **171 computable inputs, 652 heir rows** is the denominator every count
below is read against.

---

## Quantity 1 — narrative versus table disagreement

**Target:** plan `17-02` drives `DISAGREEING_ROWS` to **0**.

A heir row disagrees when a token matched by `ARTICLE_TOKEN_RE` in `narrative.text` is absent from
that heir's `share.legal_basis`, joining narrative to share by `heir_id`.

```
FILES 173 COMPUTED 171 REJECTED 2 ROWS 652
DISAGREEING_ROWS 615
TOKEN_HISTOGRAM [["Art. 887",564],["Art. 176",31],["Art. 972",25],["Art. 970",25],["Arts. 1003-1008",22],["Art. 179",6],["Arts. 1009-1010",4]]
```

**615 of 652 heir rows — 94.3% — carry a narrative article the table does not carry.** The audit's
claim is confirmed exactly and is the largest single contributor: `Art. 887` appears in narrative
prose 564 times against table rows reading `Art. 996`, `Art. 980` or `Art. 999`.

The histogram also names four contributors the audit did not: `Art. 176` (31), `Art. 972` (25),
`Arts. 1003-1008` (22) and `Arts. 1009-1010` (4). The two range forms matter for the repair —
expanding `Arts. 1003-1008` into `Art. 1003` and `Art. 1008` would introduce `Art. 1003`, which is
not registered, and turn G28 red. They are preserved verbatim.

---

## Quantity 2 — pill resolution

**Target:** plan `17-03` drives `UNRESOLVED` to **empty**.

A `legal_basis` string resolves when it is a member of the key set of `NCC_ARTICLE_DESCRIPTIONS` —
the raw lookup `StatuteCitationsSection.tsx:73` and `PerHeirBreakdownSection.tsx:98` both perform
today.

```
DISTINCT_BASIS 24 RESOLVING 0
UNRESOLVED ["Art. 1001","Art. 1004","Art. 1005","Art. 1006","Art. 1008","Art. 1009","Art. 1011","Art. 888","Art. 892 ¶1","Art. 892 ¶2","Art. 895","Art. 900","Art. 923","Art. 970","Art. 975","Art. 980","Art. 983","Art. 985","Art. 988","Art. 995","Art. 996","Art. 997","Art. 998","Art. 999"]
```

**0 of 24 resolve.** The pill is dead for every article on every case, not only for `Art. 996`. The
map holds 73 keys and none of them is ever hit, because the engine emits `Art. 996` (spaced) and the
map is keyed `Art.996` (unspaced) — and `StatuteCitationsSection` never calls the `parseArticleKey`
normaliser that sits three lines above it in the same module.

---

## Quantity 3 — the duplicate legal rule

**Target:** plan `17-04` drives both counts to **0**.

```
$ grep -c "predictScenario" frontend/src/wasm/bridge.ts
2
$ grep -c "computeMock" frontend/src/wasm/bridge.ts
2
```

`predictScenario` is a hand-written TypeScript transcription of `engine/src/step3_scenario.rs:52-235`
— a second implementation of a legal rule, prohibited by `CLAUDE.md` invariant 5 and owned by
`EXT-02`.

---

## Quantity 4 — the gate count

**Target:** plan `17-06` takes `GATES` to **33** by registering `G14`.

```
$ node -e "console.log('GATES', require('./gates.manifest.json').gates.length)"
GATES 32
```

---

## What this plan did NOT run

`bash scripts/ci-gates.sh` — the whole suite — was **not** run by plan `17-01`, and **Phase 17 makes
no whole-suite claim.**

The suite exits 1 at G3 on this branch for two owner decisions carried forward from Phase 16 and
recorded in `.planning/phases/16-stabilise-the-deletion-milestone/16-FLOOR-BLOCKED.md`:

1. `TEST COUNT DROPPED: ran 2073 tests, floor is 2119` — clearing it means lowering
   `min_total_tests` in `frontend/test-baseline.json`, which is owner action.
2. `G20` and `G21` are registered blocking gates whose scripts commit `4ccf06270` deleted. Retiring
   a gate is owner action under `CLAUDE.md` invariant 2, enforced by G5.

Neither is this phase's to clear, and neither is touched. Lowering the floor alone would not make
the suite green — it would only advance the failure to G20.
