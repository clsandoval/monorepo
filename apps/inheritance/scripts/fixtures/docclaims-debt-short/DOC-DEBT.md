# Documentation debt

This ledger holds every claim in this repository's documents that the code contradicts and that
Phase 15 deliberately chose **not** to fix. EXT-07 asks that a pass over the docs leave no stale
claim standing *or* that each survivor be explicitly listed as accepted debt. This file is the
second branch: it is the complete list of survivors, so that "we didn't fix it" is a recorded
decision rather than an omission nobody noticed.

OWNER-OWNED FILE. This ledger is shrink-only: IT MAY ONLY SHRINK. Appending an entry here to turn a red check green is
prohibited: the fix for a stale claim is to correct the claim, not to declare the staleness
acceptable. Same direction as `gate-skips.lock`, `engine/defect-baseline.json`,
`assertion-baseline.json`, `coverage-zero.lock` and `engine/legal-traceability.lock`; the exact
inverse of `gates.manifest.lock`, which may only grow. No script writes this file, by design: a check
that can rewrite its own baseline is not a check.

`node scripts/check-doc-claims.mjs` holds this ledger to the tree in both directions. An entry that
is missing fails with `DEBT ENTRY MISSING`; an entry whose claim anchor no longer appears anywhere
fails with `DEBT ENTRY STALE` until the entry is deleted.

| id | Claim | Where | Contradicted by | Owning requirement |
|---|---|---|---|---|
| D1 | a single implementation of scenario classification | `frontend/src/wasm/bridge.ts`, `predictScenario` | a second, dead copy survives beside `engine/src/step3_scenario.rs` | `EXT-02` |
| D2 | `Falls back to computeMock() if WASM is not available` | `frontend/src/wasm/bridge.ts` header comment | `compute()` returns `computeWasm(input)` with no fallback | `EXT-02` |
| D3 | `src/wasm/pkg/inheritance_engine_bg.js` is an emitted artifact that `.gitignore` excludes | `.planning/codebase/CONCERNS.md` | `wasm-pack --target web` emits `inheritance_engine.js`, never a `_bg.js`; the ignore rule itself was deleted in Phase 1 | — |
| D4 | the spec's Art. 900 ¶2 three-month window is implemented | `specs/inheritance-engine-spec.md`, marker `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs` | `is_articulo_mortis` never differences `date_of_marriage` against `date_of_death` | — |
| D5 | the sum invariant catches every free-portion misallocation | `engine/BUGS.md`, `BUG-002` | free-portion pesos move to an uninstituted heir in `engine/src/step7_distribute.rs` while the sum still holds | — |
| D6 | `thiserror` provides the engine's error type | `engine/Cargo.toml` | no `#[derive(Error)]` exists anywhere under `engine/src/` | — |
| D7 | the requirement denominator is one number | `.planning/REQUIREMENTS.md` states 80; `scripts/gate-coverage.mjs` prints `40/94` | `gate-coverage.mjs` counts every distinct `[A-Z][A-Z0-9]*-[0-9]{2}` token, and its own header calls the report informational | — |

## D1 — a second, dead scenario classifier

**Claim:** `predictScenario`
**Where:** `frontend/src/wasm/bridge.ts` — the module-level `function predictScenario(` and the
`computeMock()` that calls it. Its own comment says it "Mirrors step3_scenario.rs:52-235 exactly".
**Contradicted by:** `engine/src/step3_scenario.rs` is the source of truth for scenario
classification, and this is a hand-maintained second implementation of the same rules. It is
currently unreachable — `compute()` always delegates to `computeWasm()` — but a dead copy of a legal
rule is a copy that will be silently wrong the moment anyone re-wires it.
**Owning requirement:** `EXT-02`

## D2 — the stale fallback comment

**Claim:** `Falls back to computeMock() if WASM is not available`
**Where:** `frontend/src/wasm/bridge.ts`, in the file header comment block.
**Contradicted by:** `compute()` returns `computeWasm(input)` unconditionally. There is no fallback
path, so the comment describes behaviour the module does not have — the most misleading kind of
stale claim, because a reader debugging a WASM failure will look for a fallback that cannot fire.
**Owning requirement:** `EXT-02`

## D3 — a gitignore rule that was already deleted

**Claim:** `src/wasm/pkg/inheritance_engine_bg.js`
**Where:** `.planning/codebase/CONCERNS.md`, in the WASM-artifact section, which still reports that
`frontend/.gitignore` excludes this path.
**Contradicted by:** `wasm-pack build --target web` emits `inheritance_engine.js` and never a
`_bg.js`, and Phase 1 plan `01-01` deleted the dead rule from `frontend/.gitignore` — the file no
longer contains the string. The surviving claim is in the mapping document, not in the tree.
`.planning/codebase/CONCERNS.md` is outside this plan's editable set, so the correction is recorded
here rather than made.
**Owning requirement:** No requirement owns this.

## D5 — the sum invariant is not a sufficient check

**Claim:** `BUG-002`
**Where:** `engine/BUGS.md`, the `## BUG-002` section.
**Contradicted by:** an institution of the entire free portion is reduced by the instituted heir's
legitime, so free-portion pesos emerge as `from_intestate` on an uninstituted heir — and the
per-heir split is wrong while the total still sums to the estate. The sum invariant therefore cannot
detect this class of defect. BUG-002 is documented and open, not fixed, and Phase 14 recorded that no
requirement owns it.
**Owning requirement:** No requirement owns this.

## D6 — a dependency that provides nothing

**Claim:** `thiserror`
**Where:** `engine/Cargo.toml`, the dependency line.
**Contradicted by:** no `#[derive(Error)]` and no custom error enum exists anywhere under
`engine/src/`. The pipeline represents illegal states as data and never returns a `Result` for a
domain error, so the dependency is dead weight that suggests an error channel the engine does not
have. Removing it is a build change, not a documentation change, so it is recorded rather than done
in a docs plan.
**Owning requirement:** No requirement owns this.

## D7 — two different requirement denominators

**Claim:** `- v1 requirements: **80** total`
**Where:** `.planning/REQUIREMENTS.md`, the totals block near the end.
**Contradicted by:** `node scripts/gate-coverage.mjs` prints `REQUIREMENT COVERAGE 40/94 gated`. The
two numbers count different things: the requirements file counts the ids it enumerates by category,
while `gate-coverage.mjs` counts every distinct `[A-Z][A-Z0-9]*-[0-9]{2}` token it finds. Neither is
wrong on its own terms and the coverage script's own header calls its report informational, but a
reader who sees both will not know which denominator to trust. Reconciling them means choosing a
counting rule, which is a decision no plan contains.
**Owning requirement:** No requirement owns this.

## How this ledger shrinks

An entry is deleted only when the claim it records has been **corrected** — never to make a check
pass. `node scripts/check-doc-claims.mjs` enforces both directions:

- `DEBT ENTRY MISSING` fires when one of `D1` … `D7` has no `## D<N>` heading here, so an entry
  cannot be quietly dropped.
- `DEBT ENTRY STALE` fires when an entry's `**Claim:**` anchor no longer appears in any scanned
  document or in the file its `**Where:**` line names. That is the direction that forces the ledger
  down: once the claim is corrected, the entry becomes a hard failure until it is deleted.

This is the same bidirectional discipline `engine/legal-traceability.lock` uses — an undeclared gap
fails, and a declared gap that has since closed also fails, so the ledger can only move one way.
