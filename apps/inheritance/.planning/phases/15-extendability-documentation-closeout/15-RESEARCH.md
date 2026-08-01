# Phase 15 Research — Extendability & Documentation Closeout

**Researched:** 2026-08-01
**Requirements:** EXT-05, EXT-06, EXT-07, EXT-08
**Method:** every claim below was measured against the tree at
`/home/clsandoval/cs/monorepo/apps/inheritance` on 2026-08-01. No number is inherited from an
earlier phase summary without re-measuring it.

---

## 1. Starting state, measured

| Fact | Command | Observed |
|---|---|---|
| Gate set size | `node -e "console.log(require('./gates.manifest.json').gates.length)"` | `28` |
| Last full run | `LOOP-STATUS.md` line 4 | `2026-08-01T00:30:31Z — outcome pass, 28/28 gates reached` |
| Reserved gate id | `gates.manifest.json` | `G14` absent — reserved for Phase 9 plan `09-06`, still unstarted |
| Next free gate ids | manifest scan | `G30`, `G31`, `G32`, `G33` |
| Terminal gate order | manifest | `G9` order 28, last; `G8` 27, `G11` 26, `G10` 25 |
| Requirement bullets | `grep -cE '^- \[[ x]\] \*\*[A-Z]+-[0-9]+\*\*' .planning/REQUIREMENTS.md` | `80` total, `63` checked, `17` unchecked |
| Requirement coverage | `node scripts/gate-coverage.mjs` | `REQUIREMENT COVERAGE 40/94 gated`, `COVERAGE OK` |
| Plans on disk | per-phase `ls` | 86 `*-PLAN.md`, 86 `*-SUMMARY.md`, across phases 01–14 |

The suite is green. Phase 15 starts from a passing 28-gate set and must end at a passing 32-gate set.

---

## 2. EXT-05 — the invariants CLAUDE.md must state

### What exists

`CLAUDE.md` already carries a hand-written `## Loop invariants` section (lines 311–328) with **three**
rules, each naming its enforcing command:

1. Commit scope → `node scripts/check-commit-discipline.mjs`
2. Gate immutability → `node scripts/check-gate-manifest.mjs`
3. Halt over guess → `.planning/PLAN-STANDARD.md` section 3

### What EXT-05 asks for that is missing

EXT-05 names three subjects: **unit conventions**, **single-source-of-truth rules**, and **what
requires a lawyer**. None of the three is stated as an invariant today.

- **Units.** `frontend/src/types/money-units.ts` exists (Phase 9 plan `09-03`) and exports
  `Pesos`, `Centavos`, `pesosToCentavos`, `asCentavos`, `asPesos`. Nothing in `CLAUDE.md` says a
  money value must carry a branded unit, and nothing says a unit error is fixed with a conversion
  rather than `as any`.
- **Single source of truth.** `scripts/check-legal-traceability.mjs` (gate G28) enforces that each
  cited Civil Code article maps to exactly one named test function, raising `MARKER NOT UNIQUE` on a
  second site. That is the only live SSOT enforcement in the tree — the registry gate `G14` that
  Phase 9 plan `09-06` was to add is still unregistered.
- **What requires a lawyer.** `.planning/PLAN-STANDARD.md` §3 and
  `.planning/LEGAL-CORRECTION-WORKFLOW.md` both exist and are precise, but `CLAUDE.md` points at
  neither by path.

### Structural constraint discovered

`CLAUDE.md` is **partly generated**. Lines 1–309 sit inside GSD marker pairs:

```
<!-- GSD:project-start source:PROJECT.md -->   … <!-- GSD:project-end -->
<!-- GSD:stack-start source:codebase/STACK.md --> … <!-- GSD:stack-end -->
<!-- GSD:conventions-start source:CONVENTIONS.md --> … <!-- GSD:conventions-end -->
<!-- GSD:architecture-start source:ARCHITECTURE.md --> … <!-- GSD:architecture-end -->
<!-- GSD:skills-start source:skills/ --> … <!-- GSD:skills-end -->
<!-- GSD:workflow-start source:GSD defaults --> … <!-- GSD:workflow-end -->
<!-- GSD:profile-start --> … <!-- GSD:profile-end -->
```

Anything written inside a marked span is overwritten the next time the block is regenerated from
`.planning/codebase/`. The existing `## Loop invariants` section is correctly placed **between** the
`GSD:skills-end` and `GSD:workflow-start` markers, i.e. outside every span. The invariants section
must stay there, and that placement is itself worth asserting mechanically — a regeneration that
swallowed the section would silently delete the project's own rules.

---

## 3. EXT-06 — the "add a new legal rule" procedure

### What exists, and what it deliberately does not cover

`.planning/LEGAL-CORRECTION-WORKFLOW.md` (145 lines, Phase 4 plan `04-05`) documents **correcting an
existing rule** in five steps. Its closing paragraph reads, verbatim:

> `EXT-06` in Phase 15 covers adding a **brand-new** legal rule — article → vector → implementation →
> gate. This document covers **correcting an existing one**. They are different procedures and should
> not be conflated.

So the separation is already a recorded project decision. Phase 15 writes the second document; it
does not extend the first.

### The machinery a new rule must plug into (Phase 14, gate G28)

- `engine/legal-rules.json` — `{ $comment, frozen_at, rules[] }`, **79** rule objects of shape
  `{ article, implemented_in[], vector: { file, fn } | null }`. `implemented_in` is recomputed from
  source on every run, so a hand-edited registry fails rather than passes.
- `engine/legal-traceability.lock` — shrink-only, currently **16** `untraced_articles`:
  Art. 890, 895, 908, 912, 918, 920, 921, 960, 970, 983, 999, 1004, 1009, 1071, 1073, 1077.
- `scripts/check-legal-traceability.mjs` — constants measured in the file:
  `MARKER_PREFIX = '// LEGAL-VECTOR: '`, `TEST_MODULE_SENTINEL = '#[cfg(test)]'`,
  `ARTICLE_RE = /Art\. (\d+)/g`. Markers include `MARKER NOT UNIQUE`, `UNTRACED NOT DECLARED`,
  `STALE UNTRACED DECLARATION`, `TRACEABILITY SCAN UNREADABLE`.
- Vector naming already fixed by `.planning/LEGAL-CORRECTION-WORKFLOW.md` step 2: spec vectors are
  `TV-<NN>` with functions `test_tvNN_<description>`; lawyer-driven vectors are `TV-L<NN>`.

### Where the boundary of agent authority sits

A new legal *rule* is not the same as a new legal *claim*. The engine's rules trace to
`specs/inheritance-engine-spec.md` and `specs/estate-tax-engine-spec.md`. If the article a rule would
implement is not already stated in one of those specs, writing that statement **is** deciding a point
of law, which `.planning/PLAN-STANDARD.md` §3 prohibits without exception. The procedure must say so
in its first step, or it becomes a documented route around the prohibition.

---

## 4. EXT-07 — stale claims, inventoried by measurement

`CLAUDE.md`'s stack, conventions and architecture sections are copies of `.planning/codebase/*.md`,
all dated **2026-07-27** — before any of the fourteen phases ran. Correcting `CLAUDE.md` alone would
be undone by the next regeneration, so every correction lands in **both** places.

Each row below was verified twice: the claim string was located by `grep`, and the contradicting fact
was measured independently.

| id | Claim, as written | Where | Measured contradiction |
|---|---|---|---|
| C1 | `**NOT built.**` (the WASM binary) | `CLAUDE.md`, `codebase/STACK.md` | `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` exists, 616,398 bytes, mtime 2026-08-01 |
| C2 | ``` `wasm-pack` is **not installed** ``` | `CLAUDE.md`, `codebase/STACK.md` | `engine/build-wasm.sh` exists and is gate **G2**'s locked command |
| C3 | `is **absent**` (`frontend/node_modules`) | `CLAUDE.md`, `codebase/STACK.md` | `frontend/node_modules/` is present |
| C4 | ``` project id `"app"` ``` | `CLAUDE.md`, `codebase/STACK.md` | `frontend/supabase/config.toml:5` → `project_id = "inheritance"` |
| C5 | `54321` (Supabase API port) | `CLAUDE.md`, `codebase/STACK.md`, `codebase/INTEGRATIONS.md`, `codebase/TESTING.md` | `config.toml` `[api] port = 55321`; the whole block moved to 55320–55329 in Phase 3 |
| C6 | `411 tests pass` / `30 tests pass` | `CLAUDE.md`, `codebase/STACK.md` | `engine/tests/integration.rs` now holds **44** `#[test]` functions; the whole suite is 546 |
| C7 | `No app-wide error boundary` | `CLAUDE.md`, `codebase/CONVENTIONS.md` | `frontend/src/components/ErrorBoundary.tsx` exists and is mounted in `frontend/src/main.tsx` (Phase 5, OBS-08) |
| C8 | `**Not URL-encoded**` (wizard step index) | `CLAUDE.md` ×2, `codebase/ARCHITECTURE.md` ×2 | `readInitialWizardState()` at `frontend/src/components/wizard/WizardContainer.tsx:83` reads the step from the URL; Phase 12 drives six wizard screens by `?step=` and eight tax tabs by `?tab=` alone |
| C9 | `zz_probe.rs`, `zz_sweep.rs` named as live test files | `CLAUDE.md`, `codebase/STACK.md`, `codebase/CONVENTIONS.md` | `ls engine/tests/` → `bugs_ledger.rs`, `common`, `defect_ledger.rs`, `fuzz_invariants.rs`, `integration.rs`, `observability.rs`. Neither file exists |
| C10 | `not typed error objects` (WASM errors) | `CLAUDE.md`, `codebase/ARCHITECTURE.md` | `engine/src/wasm.rs` emits `{"error":{"kind":…,"message":…,"detail":…}}` with `kind` one of exactly three strings; `frontend/src/wasm/bridge.ts` exports `EngineError` and `parseEngineError` |
| C11 | `.github/workflows/inheritance.yml` named as *the* CI workflow | `CLAUDE.md` ×3 and four `codebase/` files | Both `inheritance.yml` and `inheritance-ci.yml` exist; the gate-running workflow is `inheritance-ci.yml`, which no doc mentions |

### Claims checked and found still TRUE — do not "fix" these

- `frontend/src/wasm/bridge.ts` still contains a second `predictScenario` implementation and a
  `computeMock()` that is not on the primary path (`compute()` at line 436 returns `computeWasm(input)`
  with no fallback). `CLAUDE.md`'s architectural-constraint note about two implementations is accurate.
- The `compute()` path still does **not** run Zod validation before entering WASM
  (`computeWasm` at line 422 calls `compute_json` directly). Accurate.
- No ESLint / Prettier / clippy config anywhere; `grep -c clippy` over both workflow files → `0`.
  Accurate.
- "No separate application server." Accurate.

### Surviving contradictions that are not cheap to fix

These are the accepted-debt half of ROADMAP success criterion 3. Each already has an owner, or
provably does not:

| id | Item | Owner |
|---|---|---|
| D1 | The dead duplicate scenario classifier in `frontend/src/wasm/bridge.ts` | EXT-02, Phase 9 plan `09-04`, BLOCKED |
| D2 | `bridge.ts:5` header comment "Falls back to computeMock() if WASM is not available" — false | EXT-02 |
| D3 | `frontend/.gitignore` ignores `src/wasm/pkg/inheritance_engine_bg.js`, which `--target web` never emits | no requirement |
| D4 | `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs` — Art. 900 ¶2 three-month window in the spec, absent from `is_articulo_mortis` | no requirement (Phase 14 record) |
| D5 | BUG-002 at `engine/src/step7_distribute.rs:421` | no requirement (Phase 14 record, its own `### Owning requirement` section) |
| D6 | `thiserror = "2"` declared in `engine/Cargo.toml`, never used | no requirement |
| D7 | Two requirement denominators in one directory: `REQUIREMENTS.md` states **80**, `scripts/gate-coverage.mjs` prints **40/94**. Measured cause: `gate-coverage.mjs:153` counts every distinct `/\b[A-Z][A-Z0-9]*-[0-9]{2}\b/` token in the file, which sweeps up ids that are not requirements. The script's own header calls the report "informational — never fails the build" | no requirement |

`specs/` is 578 KB across six files. Its four legally-misstated passages were corrected in Phase 14
and are pinned by gate **G27** at eleven literal anchors. Phase 15 must not re-audit spec legal prose
— that would be re-deciding law. Anything else found in `specs/` goes to the debt ledger.

---

## 5. EXT-08 — what a returning owner can and cannot determine today

### The two artifacts that already try

- `RESUME.md` (85 lines, root). Written 2026-07-31. Says *"It should print `ALL GATES PASSED (13/13)`"*
  and *"Phases 1-9 attempted … Phase 10 running."* Both are false as of today (28 gates, phase 14
  executed). It also carries four genuinely useful open decisions the owner still owns.
- `.planning/STATE.md` (422 lines). Frontmatter is right about the position; the body's
  `Progress: [███████░░░] 73%` at line 215 disagrees with the frontmatter's `percent: 93` at line 14.

### The measured failure

`.planning/ROADMAP.md`'s Progress table disagrees with the filesystem on **7 of 15 rows**:

| Phase | Table says | Filesystem |
|---|---|---|
| 6 | `0/5` Planned | 5 plans, 5 summaries |
| 7 | `0/4` Planned | 4 plans, 4 summaries |
| 8 | `0/8` Planned | 8 plans, 8 summaries |
| 9 | `0/TBD` Not started | 6 plans, 6 summaries |
| 10 | `0/TBD` Not started | 6 plans, 6 summaries |
| 11 | `0/8` Planned | 8 plans, 8 summaries |
| 14 | `0/TBD` Not started | 6 plans, 6 summaries |

The same file's checkbox list above the table marks phases 6, 7, 8 as `[x]` — so the ROADMAP
contradicts **itself** as well as the tree. A returning owner reading the table concludes Phase 14
has not started. It has: six plans, six summaries, four new gates, and three requirements recorded as
lawyer-blocked.

`.planning/STATE.md` frontmatter is also unverified against the tree: `total_plans: 86` and
`completed_plans: 86` happen to be right today, `completed_phases: 13` against 9 `[x]` checkboxes in
ROADMAP is not.

### Why a document alone will not hold

Every one of these numbers is rewritten by tooling at phase boundaries. A hand-written orientation
page decays exactly as `RESUME.md` did within four days. The only durable form is a **check that
re-derives each number from the filesystem and fails when a document disagrees** — the same shape as
`check-legal-traceability.mjs`, which recomputes `implemented_in` from source so a hand-edited
registry fails rather than passes.

---

## 6. Established project idioms these plans must follow

Measured from the 28 gates and 17 check scripts already in the tree:

1. **One check script per gate**, dependency-free Node ESM using `node:` builtins only. No
   `package.json` at the app root, no dependency installed.
2. **Named literal markers.** Every violation prints its own uppercase marker string so a failure
   says which rule broke. Marker lists live in the script header comment.
3. **Every failure path observed firing** against a committed fixture under `scripts/fixtures/`
   before the gate is trusted. `ls scripts/fixtures/` already holds the Phase 4 / 13 / 14 fixtures.
4. **Read-only path-override flags only** (`--ledger`, `--decisions`, …) so fixtures can drive each
   path. No `--fix`, `--update`, `--accept`, `--regenerate` or waiver flag anywhere.
5. **`GATE-SKIPS total=<n> skipped=<n>`** printed exactly once on both the pass and the fail path.
   `scripts/check-gate-skips.mjs` (G8) reads it out of `.gate-runs/logs/<ID>.log`.
6. **Three-valued exit contract**: 0 pass, 1 fail, 2 cannot-run.
7. **Ledger direction is explicit and one-way.** Five shrink-only ledgers exist today
   (`frontend/test-baseline.json`, `gate-skips.lock`, `engine/defect-baseline.json`,
   `assertion-baseline.json`, `coverage-zero.lock`, plus `engine/legal-traceability.lock`);
   `gates.manifest.lock` is the only grow-only one. No script writes any of them.
8. **Gate registration is its own final plan**, appending to `gates.manifest.json` and
   `gates.manifest.lock` together, with `order` — the one unlocked field — shifting `G10`, `G11`,
   `G8`, `G9` so `G9` stays last.
9. **Commits stage explicit paths** through `bash scripts/safe-commit.sh`.

---

## 7. Validation Architecture

Phase 15 produces documentation and four static checks. Nothing it writes changes a peso figure, so
the validation question is not "is the arithmetic right" but "will these documents still be true in
six weeks". Three sampling levels, matched to how fast each artifact decays:

**Level 1 — structural, sampled once per gate run (fastest decay).**
The three derived-number checks (`ROADMAP` table vs filesystem, `STATE.md` counters vs filesystem,
`RESUME.md`/`ORIENTATION.md` gate count vs `gates.manifest.json`) re-derive every number from the
tree on every run. Decay horizon: one phase boundary. Sampling every gate run is well inside Nyquist.

**Level 2 — claim probes, sampled once per gate run (medium decay).**
Each of the eleven EXT-07 claims is paired with a filesystem probe measured at run time, never with a
hardcoded expected value. A doc claim can therefore only go stale if the probe also changes, and the
check goes red the moment they disagree. Decay horizon: one product change.

**Level 3 — anchor probes, sampled once per gate run (slowest decay).**
The invariants section's cited commands must exist as `command` strings in `gates.manifest.json`, and
the new-rule procedure's worked example must still resolve to a real article, file and function.
These are grep-pattern anchors, never line numbers — the same decision Phase 4 recorded for lawyer
decisions after measuring that Phases 5, 7 and 8 rewrite the exact files the registry points at.

**Anti-sampling rules.** No check may pin a test count, a peso figure, or a line number: all three
move for legitimate reasons and would produce false red. Counts are replaced in prose by the command
that produces them.

**Failure-path coverage.** Every marker in all four scripts must be observed firing against a
committed fixture before the gate is registered. A gate nobody has seen fail is not known to be a
gate.

---

## 8. Open questions

None. No point of Philippine law arises anywhere in Phase 15: the new-rule procedure *routes* a legal
question to `.planning/LAWYER-AGENDA.md`, which decides nothing, and the spec pass is explicitly
scoped away from legal prose because gate G27 already owns it.

## RESEARCH COMPLETE
