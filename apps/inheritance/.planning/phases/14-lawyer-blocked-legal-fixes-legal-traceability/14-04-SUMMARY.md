---
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
plan: 04
subsystem: specs
tags: [legal-text, spec-correction, aquino, art-900, art-972, gate]
requires: []
provides:
  - "scripts/check-spec-legal-text.mjs — gate G27's command (registered by 14-06)"
  - "specs corrected at 9 locations across 3 documents plus frontend/src/data/ncc-articles.ts"
affects:
  - "frontend/src/data/ncc-articles.ts (Art.992 description string)"
tech-stack:
  added: []
  patterns:
    - "Literal-string anchor+window check over named documents; no regex anywhere, because every searched string contains regex metacharacters"
key-files:
  created:
    - scripts/check-spec-legal-text.mjs
    - scripts/fixtures/spec-anchor-missing.md
    - scripts/fixtures/spec-correction-missing.md
    - scripts/fixtures/spec-misstatement-present.md
  modified:
    - specs/inheritance-engine-spec.md
    - specs/inheritance-v2-spec.md
    - frontend/src/data/ncc-articles.ts
key-decisions:
  - "The C1 correction adds text and deletes nothing: the pre-2021 paragraph stays and is followed by the post-Aquino qualification, so a reader can see what changed and when. The collateral-line question is stated as OPEN and attributed to LAWYER-04; no spec asserts an answer."
  - "C2 creates a real spec-to-code divergence and it is recorded loudly under the literal marker KNOWN DIVERGENCE: engine/src/step5_legitimes.rs rather than closed. No file under engine/src/ was edited — changing is_articulo_mortis would change legal numbers, and no requirement owns that fix."
  - "Two of Reference A's anchors were AMBIGUOUS in the real tree (each occurred twice). They were extended with the words that follow them on the same line rather than resolved to the first hit."
requirements-completed: [LAW-13]
duration: 35 min
completed: 2026-07-31
---

# Phase 14 Plan 04: The Spec's Four Misstatements of Law Summary

C1, C2 and C3 corrected; C4 verified intact from Phase 8 and pinned. Every legal sentence written is
a verbatim quotation already transcribed in `.planning/research/LEGAL-CONFORMANCE.md` section 2b, or a
statement that a question is open and recorded as `LAWYER-04`. **No point of Philippine law was
decided.**

## What Was Built

**C1 — Art. 992, seven locations.** Two prose sections (`### 7.4` engine spec, `### §7.3` v2 spec)
each gained two paragraphs: the *Aquino* citation with full docket and date, its direct-line holding
quoted verbatim, its own collateral reservation quoted verbatim, and an explicit statement that the
collateral question is `LAWYER-04`, `awaiting-answer`, and **not decided in this document**. Four
one-line table rows and the `Art.992` entry of `ncc-articles.ts` extended to carry `Aquino`; the NCC
string keeps the substring `Iron Curtain` its committed consumer test asserts. The repository had
**zero** mentions of *Aquino* before this plan.

**C2 — Art. 900 ¶2.** The three-condition block was replaced with the formulation this repository
already carries correctly in `specs/inheritance-v2-spec.md`: solemnized in *articulo mortis*, the
testator **died within three months**, and the spouses had not cohabited for **more than five years**.
Followed by a `KNOWN DIVERGENCE: engine/src/step5_legitimes.rs` note recording that
`pub fn is_articulo_mortis` tests `marriage_solemnized_in_articulo_mortis`, `was_ill_at_marriage`,
`illness_caused_death` and `years_of_cohabitation < 5`, never differences `date_of_marriage` against
`date_of_death`, and that no requirement owns that code fix. TV-16's row updated.

**C3 — Art. 972 ¶1.** A bullet above the pre-existing Art. 972 ¶2 bullet, stating that representation
takes place in the direct descending line but **never in the ascending**, and naming
`test_law04_no_representation_in_the_ascending_line` as the committed vector.

**C4 — pinned, not rewritten.** `git diff specs/estate-tax-engine-spec.md` empty.

**The checker.** `scripts/check-spec-legal-text.mjs`, 4 corrections, 11 locations, all literal
matching. 1 commit, `2754e38e2`, seven explicit paths.

## Verification Results

| Command | Result |
|---|---|
| `grep -rc "Aquino" specs/inheritance-engine-spec.md specs/inheritance-v2-spec.md frontend/src/data/ncc-articles.ts` | `3`, `3`, `1` (was `0`, `0`, `0`) |
| `grep -c "It is silent on collateral relatives"` both specs | `1`, `1` |
| `grep -c "LAWYER-04"` both specs | `2`, `1` |
| `grep -c "qualified to inherit from their direct ascendants…"` both specs | `1`, `1` |
| `npx vitest run src/data/__tests__/ncc-articles.test.ts` | 25 passed / 25, exit 0 |
| `grep -c "died within three months"` / `"more than five years"` / `"KNOWN DIVERGENCE: engine/src/step5_legitimes.rs"` | `1`, `1`, `1` |
| `grep -c "Marriage contracted during the illness that caused death"` / `"Decedent did not recover"` / `"3-condition check"` | `0`, `0`, `0` |
| `grep -c "never in the ascending"` / `"Art. 972 ¶1"` / `"test_law04_…"` | `1`, `1`, `1`; the fn exists in `engine/tests/integration.rs` (`1`) |
| C4 pin: `5F Transfers for Public Use` / `Corrected in Phase 8 (LAW-09)` / `elitTotal = sum of 5A + 5B + 5C + 5D` | `3`, `1`, `0`; `git diff specs/estate-tax-engine-spec.md` empty |
| `node scripts/check-spec-legal-text.mjs` | `SPEC LEGAL TEXT OK — 4 correction(s), 11 location(s) checked`, `GATE-SKIPS total=4 skipped=0`, `REAL=0` |
| `grep -cE "--fix\|--update\|--accept\|--regenerate\|writeFileSync\|appendFileSync"` | `0` |
| `--root scripts/fixtures/spec-anchor-missing.md` | `SPEC ANCHOR MISSING — C3: anchor '- **Collateral limit** (Art. 972)' occurs 0 time(s) … expected exactly 1 (the passage moved or was renamed)`, exit 1 |
| `--root scripts/fixtures/spec-correction-missing.md` | `CORRECTION MISSING — C3: … lacks the required text 'test_law04_no_representation_in_the_ascending_line' within the 3 line(s) before and 3 line(s) after '- **Collateral limit** (Art. 972)'`, exit 1 |
| `--root scripts/fixtures/spec-misstatement-present.md` | `MISSTATEMENT PRESENT — C2: … still contains the superseded text '3-condition check'`, exit 1 |
| `--root <empty dir>` | `SPEC SCAN UNREADABLE: specs/inheritance-engine-spec.md not found at …/empty-root/inheritance-engine-spec.md`, exit 1 |
| `npx tsc -b --force` | zero output, `TSC=0` |
| `npm run test:gate` | `GATE OK — test baseline matches exactly`, 2470 run / 2424 passed / 46 known failures met, `LEDGER SIZE (debt) 46` unchanged, `GATE-SKIPS total=2470 skipped=0`, exit 0 |
| `git diff --stat HEAD~1 HEAD -- apps/inheritance/engine` | empty — no engine source touched |
| `node scripts/check-commit-discipline.mjs` | `COMMIT DISCIPLINE OK — 206 commit(s) audited … 0 mixed`, exit 0 |
| `node scripts/check-plan-closed-world.mjs` | `PLANS OK — 86 plan file(s), 335 task(s) checked`, exit 0 |

## Deviations from Plan

**[Rule 1 — two of Reference A's anchors are ambiguous in the real tree] Anchor extension** — Found
during: Task 5. `**Articulo mortis** (Art. 900 ¶2)` occurs **twice** in
`specs/inheritance-engine-spec.md` (the rule block at §6.3 and a summary-table row at ~line 2588), and
`**Ordering constraint**` occurs **twice** in `specs/estate-tax-engine-spec.md` (vanishing deduction
and funeral limit). The script's own `SPEC ANCHOR MISSING` rule requires exactly one occurrence, so
both would have failed. Fix: each anchor was extended with the words that immediately follow it on
the same line —
`**Articulo mortis** (Art. 900 ¶2): the spouse's legitime is reduced` and
`**Ordering constraint**: Gross estate (Item 34)`. Same location, now unambiguous. The alternative —
resolving an ambiguous anchor to its first hit — would have made the check silently weaker, which is
the one direction this project never accepts. Both extensions are documented in the script beside the
constants.

**[Rule 1 — `--root <dir>` cannot address three flat fixture files] `--root` accepts a file too** —
Found during: Task 5. The script needs four differently-named documents present under a root, but
`files_modified` fixes the three fixtures as flat `.md` files at `scripts/fixtures/`, so one directory
cannot host three independent failure cases. Fix: `--root` accepts a directory **or** a single file;
in the file form every named document resolves to that one file, so a small stand-in drives one
failure path. Both forms are read-only. The three committed fixtures are exactly the three paths in
`files_modified`.

**[Rule 1 — acceptance criterion vs. its own doc comment] The rewrite-flag grep** — same wording
issue as 14-03; the header describes the absence without spelling the tokens, and the grep prints `0`.

**Total deviations:** 3, all mechanical.
**Impact:** None on the legal text. Every literal in `## Reference A` is checked at its intended
location.

## Issues Encountered

`specs/inheritance-engine-spec.md:2588`, the summary-table row
`| **Articulo mortis** (Art. 900 ¶2) | Marriage during terminal illness — reduces spouse's share from
½ to ⅓ |`, still omits the three-month window. It is **not** one of the four passages
`.planning/research/LEGAL-CONFORMANCE.md` section 2b names, contains none of the three forbidden
literals, and correcting it was outside this plan's scope. Recorded here rather than silently changed.

## Self-Check: PASSED

- C1/C2/C3 corrected, C4 pinned and untouched.
- No spec asserts an answer to the collateral-line question.
- Nothing under `engine/src/` edited; the divergence is written down.
- `npm run test:gate` ledger unchanged at 46.

## Next

Wave 2: `14-02` (BUGS.md reconciliation), which re-measures `cargo test` against the post-14-01
baseline of 543.
