---
phase: 17
plan: 17-06
status: complete
requirements: [CITE-05]
---

# 17-06 — Registered G14; the gate set grows to 33

## What changed

`G14` (citation integrity) is registered **blocking** at **order 10**, the id `EXT-02` reserved and
never used. The gate set went **32 → 33** and `G9` is still last, now at 33.

**Placement is load-bearing.** G14 sits after `G2` (order 9), which builds the WASM artifact it
reads, and before `G3` (order 11), which is where the suite currently halts on this branch. Placing
it after G3 would have registered a gate that never once executes here.

Twenty-three gates at order ≥10 were incremented by one. **`order` was the only field touched on any
existing gate** — proven by diffing the manifest against its previous revision: `ADDED G14`,
`NON_ORDER_CHANGES 0`, `PREV 32`, `NOW 33`. Manifest and lock were edited in the same commit, and
their `command` strings are byte-identical.

## Documents brought back to truth

`.planning/ORIENTATION.md` (33 gates), `RESUME.md` (33/33), `.planning/STATE.md` (two mentions),
`.planning/REQUIREMENTS.md` (CITE-01..05 and EXT-02 closed), `.planning/ROADMAP.md` (Phase 17 row),
and `GATES.md` (G14 row plus section 24).

`RESUME.md`'s `ALL GATES PASSED (33/33)` is a template of what a green run prints; a sentence
immediately below now says plainly that **this branch exits 1 at G3**, so the number cannot be read
as a claim about it.

**Pre-existing documentation gap found and flagged, not silently propagated:** `GATES.md`'s table
listed 28 of the 32 registered gates and its `order` column was stale. The column was re-derived from
the manifest (19 rows corrected) and the four genuinely missing rows — **G30, G31, G32, G33** — are
now called out in the document rather than left invisible.

## What this plan explicitly does NOT claim

- **`bash scripts/ci-gates.sh` exit 0.** Not achieved, not claimed. See the phase report.
- **The two withheld journey steps.** `node journey/approve.mjs` was not run for any step.
