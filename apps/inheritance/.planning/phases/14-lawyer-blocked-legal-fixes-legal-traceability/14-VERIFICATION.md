---
status: partial
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
verified: 2026-08-01
requirements_completed: [LAW-13, LAW-14, LAW-15]
requirements_blocked: [LAW-06, LAW-07, LAW-12]
gates_added: [G26, G27, G28, G29]
gate_set_size: 28
human_verification:
  - "LAWYER-06 (Q6), LAWYER-04 (Q4) and LAWYER-08 (Q8) need the lawyer's answers before LAW-06, LAW-07 and LAW-12 can be implemented. Gate G26 raises ANSWER ARRIVED and fails the build on the first run after any of those statuses changes."
---

# Phase 14: Lawyer-Blocked Legal Fixes & Legal Traceability — Verification Report

**Verdict: PARTIAL.** Six of six plans executed with committed summaries. **LAW-13, LAW-14 and LAW-15
are gate-proven.** **LAW-06, LAW-07 and LAW-12 are BLOCKED-ON-LAWYER** and were deliberately not
implemented. `bash scripts/ci-gates.sh` prints `ALL GATES PASSED (28/28)` and exits 0.

Every command below was executed and its real output read.

## Phase goal

> The three legal fixes that needed a lawyer's answer are implemented per the recorded decision from
> Phase 4, and every legal rule the engine implements is traceable to exactly one named,
> article-citing test vector.

**Half achieved, and the half that is not achieved is not achievable.** The recorded decisions do not
exist: `.planning/lawyer-decisions.json` still shows LAWYER-04, LAWYER-06 and LAWYER-08 as
`awaiting-answer` with `answered_by`, `answered_on` and `answer` all `null`. The lawyer is sitting the
bar examination. `.planning/PLAN-STANDARD.md` section 3 forbids an agent from adopting a reading in
the meantime, so those three requirements produced a gated record of the blockage instead of a guess.

## Success criteria, each checked against a command

| # | Criterion | Verdict | Verified how |
|---|---|---|---|
| 1 | Per the recorded answer to Q6, a donation-*inter vivos* case no longer distributes more than the estate | **NOT MET — blocked** | LAWYER-06 is `awaiting-answer`. Real output: `LAWYER-06 awaiting-answer ["LAW-06"] null null null`. The two `engine/defect-baseline.json` entries that record the arithmetic (125000000 and 110000000 against a 100000000 estate) are untouched and still owned by LAW-06. Recorded, with the question quoted verbatim, in `.planning/BLOCKED-REQUIREMENTS.md`; gated by **G26**. |
| 2 | Per the recorded answer to Q4, Art. 992's iron curtain is implemented for the collateral line | **NOT MET — blocked** | LAWYER-04 is `awaiting-answer`. `grep -rn "IronCurtain\|iron_curtain" engine/src` still returns **0** hits. Recorded and gated by **G26**. |
| 3 | Per the recorded answer to Q8, RA 11642 either computes or explicitly refuses | **NOT MET — blocked** | LAWYER-08 is `awaiting-answer`. `config.retroactive_ra_11642` remains inert (declared at `types.rs:372`, defaulted at `:381`, read nowhere else). "Refuse to compute" is an answer the question offers but **not one an agent may select** — section 3 names "silently choosing the option that makes the build green" as prohibited. Recorded and gated by **G26**. |
| 4 | The spec's four misstated-law passages read correctly | **MET** | Gate **G27**: `SPEC LEGAL TEXT OK — 4 correction(s), 11 location(s) checked`, exit 0. `grep -rc "Aquino"` → 3 / 3 / 1 where it was 0 / 0 / 0. `grep -c "never in the ascending"` → 1. `grep -c "3-condition check"` → 0. C4 pinned with `git diff specs/estate-tax-engine-spec.md` empty. Observed red on all four failure paths. |
| 5 | Every implemented legal rule has exactly one named test vector citing its governing article, checkable by grep | **MET, with a declared 16-article gap** | Gate **G28**: `LEGAL TRACEABILITY OK` / `LEGAL TRACEABILITY COVERAGE 63/79 articles traced, 16 declared untraced`, exit 0. 63 markers, 63 distinct, each resolvable by one `grep -rn`. The 16 remaining are a **visible number** in the shrink-only `engine/legal-traceability.lock`, not a silent absence. |
| 6 | `engine/BUGS.md` reflects reality: BUG-001 closed as non-reproducing with a note, new entry filed against the real defect | **MET, at a corrected line number** | Gate **G29** plus `engine/tests/bugs_ledger.rs` (3 tests, under G1). BUG-001's own JSON now gives `SUM 3000000000` with `lc2` and `lc3` at 0. BUG-002 is filed at **`step7_distribute.rs:421`**, not the roadmap's `:313` — the unconditional `let excess = &inst_value - &heir_legitime;` moved after the Phase 7 and 8 fixes, and the current line was read from the file. |

## The three BLOCKED requirements

Each is recorded in `.planning/BLOCKED-REQUIREMENTS.md` with the lawyer's question quoted **verbatim**
(proved by `grep -cF` returning 1 against `.planning/LAWYER-AGENDA.md` for each), and each carries a
five-field BLOCKED report in `14-03-SUMMARY.md`.

| Requirement | Waits on | The exact question |
|---|---|---|
| LAW-06 | LAWYER-06 (Q6) | "Confirm that modelling the heir's remedy as a claim against the donee, rather than as estate pesos, is the right shape — since it changes the output schema." |
| LAW-07 | LAWYER-04 (Q4) | "1. Confirm the narrow reading (Reading A), so the collateral barrier can be implemented. 2. State whether every case where the barrier is decisive should carry a `LAWYER_REVIEW` flag in the output rather than being a silent computation." |
| LAW-12 | LAWYER-08 (Q8) | "The answer becomes the default for a flag that currently does nothing. The audit put an explicit alternative on the table: 'I would rather not decide' is itself an acceptable answer. The engine is then built to **refuse** to compute Sec. 41 fact patterns rather than guessing." |

**No reading of Art. 771, Art. 911, Art. 992 or RA 11642 Sec. 41 was adopted, implemented, defaulted
or stubbed anywhere in the tree.** `.planning/LAWYER-AGENDA.md` and `.planning/lawyer-decisions.json`
are byte-identical to their pre-phase state and gate G10 still exits 0.

## Phase verification — the full gate set

```
$ bash scripts/ci-gates.sh
ALL GATES PASSED (28/28)
LOOP STATUS GREEN — recorded pass
RUNNER=0
```

Observed **three times**: 5m28.9s, 5m26.4s, and 5m25.6s — the last against the committed tree, so G6
(plan lint) and G7 (commit discipline) were seen passing after this phase's commits rather than only
before them.

- `node scripts/check-gate-manifest.mjs` → `MANIFEST OK — 28 gates, 28 locked`, exit 0.
- `gates.manifest.lock` gained **4** entries and lost **0** (`20	0` in `git diff --numstat`).
- The only field that moved on a pre-existing gate is `order`: G10 21→25, G11 22→26, G8 23→27,
  G9 24→28. **G9 is still last. G14 remains reserved and unregistered** for Phase 9's `09-06`.
- `node scripts/check-gate-skips.mjs` → `SKIPS OK — 28 gates accounted, 1 declared skip, 0 undeclared`.
  `gate-skips.lock` gained nothing.
- Requirement coverage rose **34/94 → 40/94**.

## Nothing was weakened

- `cargo test`: **543 → 546 passed, 0 failed.** The only additions are `bugs_ledger.rs`'s three tests.
  14-01's 63 markers left the counts byte-identical (543 before, 543 after).
- `npm run test:gate`: `GATE OK — test baseline matches exactly`, 2470 run / 2424 passed / 46 known
  failures, `LEDGER SIZE (debt) 46` **unchanged**.
- No test, assertion or gate was deleted, skipped, or loosened. No `.skip`, no widened tolerance, no
  `toBe` downgraded.
- Every failure path of every new check was observed firing: **7** markers on
  `check-blocked-requirements.mjs`, **4** on `check-spec-legal-text.mjs`, **9** on
  `check-legal-traceability.mjs`, **8** on `check-bugs-ledger.mjs`, plus **6** on
  `engine/tests/bugs_ledger.rs` — including a one-centavo injection that turned `ACTUAL DRIFTED` red
  and was then restored byte-identically.

## Findings recorded, not hidden

1. **BUG-002 is a real, open, unowned defect in a legal number.** An institution of the entire free
   portion is reduced by the instituted heir's legitime, so ₱3,750,000 of free portion emerges as
   `from_intestate` on an heir the will never instituted — invisible to every conservation check
   because the sum still equals the estate. Documented at `engine/src/step7_distribute.rs:421` with a
   runnable reproduction; **no requirement owns its fix**, stated in the entry itself.
2. **A spec-to-code divergence on Art. 900 ¶2.** The spec now states the statutory three-month window;
   `engine/src/step5_legitimes.rs`'s `is_articulo_mortis` never differences `date_of_marriage` against
   `date_of_death`. Recorded under the literal marker `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs`.
   No engine source was edited — changing that predicate changes legal numbers.
3. **16 articles have no test vector.** Declared in `engine/legal-traceability.lock`, which may only
   shrink.
4. **`GATES.md`'s current-gates table was two phases stale** — it listed 20 gates with no rows for
   G22–G25. Regenerated from the manifest.
5. **CI has still never executed on GitHub** (carried forward, unchanged by this phase). The 28-gate
   set takes ~5m26s locally; whether it fits a hosted runner is unmeasured from this machine.
6. **The runner dirties four tracked artifacts on every run** — `LOOP-STATUS.md`,
   `gate-results.json`, `loop-history.jsonl` and `engine/COVERAGE.md`. They are loop-owned output, are
   in no plan's `files_modified`, and were not committed by this phase.
