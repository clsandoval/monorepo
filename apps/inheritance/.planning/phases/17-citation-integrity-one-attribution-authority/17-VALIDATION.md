---
phase: 17
slug: citation-integrity-one-attribution-authority
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-01
---

# Phase 17 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 17 changes what the engine *says about itself* and adds a gate that fails when the four
display layers disagree. It changes no distribution arithmetic: no legitime, no fraction, no peso
figure moves. That split is what makes the phase cheap to validate — `cargo test`'s money assertions
are a full regression net for the half of the change that could silently corrupt a computation, and
the new gate is a full net for the half that could silently corrupt a citation.

The single highest-value feedback signal in this phase is the **corpus re-run**: 171 committed engine
inputs, 652 heir rows, computed in under two seconds through the compiled WASM artifact. Every
citation claim this phase makes is checkable against all 652 rows, not against a sampled few. There
is no reason for any citation assertion in this phase to be narrower than the whole corpus, and none
is.

Two results in this phase are expected to end **red**, by design, and are named here so a red result
is not mistaken for an execution failure:

1. `bash scripts/ci-gates.sh` (whole suite) stays at exit 1, halting at G3 on the owner-blocked test
   floor carried forward from Phase 16. This phase does not claim it. See `17-RESEARCH.md` section 9.
2. Journey steps `results-view` and `results-family-tree` stay failing. They were already withheld
   for human review in Phase 16, and this phase changes the results screen again.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `cargo test` (engine, Rust), Vitest 4 (frontend), `tsc -b` (typecheck), Node ESM gate scripts, all driven by `scripts/ci-gates.sh` |
| **Config file** | `gates.manifest.json` / `gates.manifest.lock`; `engine/legal-rules.json`; `frontend/test-baseline.json` |
| **Quick run command** | `cd frontend && npx tsc -b --force` |
| **Engine run command** | `cd engine && cargo test` |
| **Corpus run command** | `node scripts/check-citation-integrity.mjs` (this phase builds it) |
| **Full suite command** | `bash scripts/ci-gates.sh` |
| **Estimated runtime** | typecheck ~12s; `cargo test` ~90s; `build-wasm.sh` ~60s; corpus gate ~3s; frontend suite ~20s |

The tripwires this phase leans on, in order of how much work each one saves:

- **`noUnusedLocals`** in `frontend/tsconfig.json` — a partial deletion of the `bridge.ts` mock block
  is a compile error, not surviving dead code.
- **G28's recomputation** — `implemented_in` is re-derived from source on every run, so an article
  citation that moves between files fails loudly rather than rotting in the registry.
- **The corpus itself** — 171 files that exercise 24 distinct `legal_basis` strings. A citation
  regression cannot hide in a scenario nobody runs.

---

## Sampling Rate

- **After every engine source edit:** `cd engine && cargo test` — no engine edit in this phase is
  committed without it, because `step10_finalize.rs` holds both narrative prose and the rounding
  allocator, and the same file's tests assert exact centavo sums.
- **After every frontend source edit:** `cd frontend && npx tsc -b --force`.
- **After every plan:** the gate commands that plan's `<verification>` block names, run through
  `bash scripts/ci-gates.sh --only <ID>` so the runner's own precondition and exit contract apply
  rather than a bare invocation.
- **After the WASM rebuild:** the corpus re-run, because the frontend and every journey harness load
  the built artifact and not the Rust source.
- **Max feedback latency:** 90 seconds (the `cargo test` bound).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 17-01-01..04 | 01 | 1 | CITE-01..05 | T-17-01 | measurement only, no source touched | corpus | `node .../17-baseline.mjs` | ⬜ pending |
| 17-02-01 | 02 | 2 | CITE-01 | — | narrative gains a real `legal_basis`, cloned not derived | unit | `cd engine && cargo test` | ⬜ pending |
| 17-02-02..03 | 02 | 2 | CITE-01, CITE-02 | T-17-02 | prose states no article; literals survive as traceability comments | unit + gate | `cd engine && cargo test` · `bash scripts/ci-gates.sh --only G28` | ⬜ pending |
| 17-02-04 | 02 | 2 | CITE-02 | — | corpus disagreement count falls 615 → 0 | corpus | `node .../17-baseline.mjs` | ⬜ pending |
| 17-03-01 | 03 | 3 | CITE-03 | — | one resolver; `¶N` suffix normalises | unit | `cd frontend && npx vitest run src/data` | ⬜ pending |
| 17-03-02..04 | 03 | 3 | CITE-03 | T-17-03 | unresolvable key renders a loud state, never a silent chip | unit | `cd frontend && npx vitest run src/components/results src/components/pdf` | ⬜ pending |
| 17-04-01..02 | 04 | 2 | CITE-04 | T-17-04 | second implementation of a legal rule ceases to exist | typecheck | `cd frontend && npx tsc -b --force` | ⬜ pending |
| 17-05-01..03 | 05 | 4 | CITE-05 | T-17-05 | gate red on injected disagreement, green after revert | gate | `node scripts/check-citation-integrity.mjs` | ⬜ pending |
| 17-06-01..03 | 06 | 5 | CITE-05 | — | gate set grows by one; counts stay true | gate | `bash scripts/ci-gates.sh --only G5` · `--only G33` · `--only G14` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers every phase requirement. `cargo test`, Vitest, the gate runner and the
committed corpus all exist and all execute today. The one new artifact —
`scripts/check-citation-integrity.mjs` — is itself a deliverable of plan `17-05` and is written
before it is registered, which is why registration is a separate plan (`17-06`) rather than the same
commit: a gate that is registered before it has been observed both red and green has never been
tested.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The results screen's visual change is intended | CITE-01, CITE-03 | `journey/approve.mjs` exists so a human sees visual changes. This phase's diff touches citation chips and the narrative body — the exact region the deletion-milestone nav exemption does **not** cover. | A human opens `frontend/journey/artifacts/results-view.png` against `frontend/journey/references/results-view.png`, confirms the added description panels and citation row are wanted, and only then runs `node journey/approve.mjs results-view --by <their own reason>`. No agent approves it. |
| The two transcribed article descriptions read correctly to a lawyer | CITE-03 | The strings for `Art.983` and `Art.999` are transcribed from `specs/inheritance-engine-spec.md` §I3 and §I4. Transcription is mechanical; whether the gloss reads well to a practitioner is not. | Recorded in `.planning/DOC-DEBT.md` for the collaborator's review after the bar. It blocks nothing: both articles are already implemented, registered and gated. |

---

## Validation Sign-Off

- [x] All tasks have an automated `<verify>` command or are named above as manual-only
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references — none are missing
- [x] No watch-mode flags anywhere in this phase
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
