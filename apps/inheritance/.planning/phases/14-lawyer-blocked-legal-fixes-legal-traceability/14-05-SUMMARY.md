---
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
plan: 05
subsystem: engine
tags: [legal-traceability, registry, shrink-only-ledger, gate]
requires: ["14-01", "14-02"]
provides:
  - "engine/legal-rules.json — 79 articles, 63 mapped to a named test function, 16 to null"
  - "engine/legal-traceability.lock — shrink-only ledger of the 16 untraced articles"
  - "scripts/check-legal-traceability.mjs — gate G28's command (registered by 14-06)"
affects: []
tech-stack:
  added: []
  patterns:
    - "Registry whose derived field (implemented_in) is RECOMPUTED from source on every run, so a hand-edit that disagrees with the code fails rather than passes"
key-files:
  created:
    - engine/legal-rules.json
    - engine/legal-traceability.lock
    - scripts/check-legal-traceability.mjs
    - scripts/fixtures/legal-rules-unregistered.json
    - scripts/fixtures/legal-rules-vector-missing.json
    - scripts/fixtures/legal-rules-undeclared-untraced.json
    - scripts/fixtures/legal-traceability-stale.lock
  modified: []
key-decisions:
  - "The registry records WHERE a rule is tested, never WHAT a rule requires. That is what keeps it free of legal judgment: naming the existing passing test function that already cites an article decides nothing."
  - "The 16 untraced articles are a visible number in a shrink-only ledger, not a silent absence. STALE UNTRACED DECLARATION is the direction that forces the ledger down: the moment an article acquires a vector, its lock entry becomes a hard failure until deleted."
requirements-completed: [LAW-14]
duration: 30 min
completed: 2026-08-01
---

# Phase 14 Plan 05: Legal-Rule Traceability Registry Summary

The 63 markers `14-01` placed are now an enforced map, and the 16-article gap is a number a reader
can see rather than an absence nobody mentions.

## What Was Built

- `engine/legal-rules.json` — 79 elements sorted by article number, each with exactly the three keys
  `article`, `implemented_in`, `vector`. 63 have a non-null vector, 16 have `null`.
- `engine/legal-traceability.lock` — the 16 untraced articles, `$comment` modelled on
  `gate-skips.lock`, stating that the file is owner-owned, that it **may only shrink**, that
  appending an article to turn a red check green is prohibited because the fix is a vector rather
  than a declaration, and that no script writes it.
- `scripts/check-legal-traceability.mjs` — 9 violation markers, both derivation rules restated
  verbatim in the header, `implemented_in` recomputed from source on every run.
- 4 committed fixtures. 1 commit, `0ff67c2cf`, seven explicit paths, none under `engine/src/` or
  `engine/tests/`.

## The derivation, re-measured rather than trusted

Applying the two fixed rules to the current tree independently reproduced the plan's sizing:

```
distinct production articles: 79
markers: 63
traced: 63   untraced: 16
marked but NOT cited in production: []
untraced list: ['Art. 890', 'Art. 895', 'Art. 908', 'Art. 912', 'Art. 918', 'Art. 920',
                'Art. 921', 'Art. 960', 'Art. 970', 'Art. 983', 'Art. 999', 'Art. 1004',
                'Art. 1009', 'Art. 1071', 'Art. 1073', 'Art. 1077']
```

That list is identical to `## Reference A` of this plan, article for article. And the extracted
article→file→function triples were compared row for row against `14-01`'s `## Reference A`:
`plan rows: 63`, `mismatches: []`, `plan articles == marker articles: True`.

## Verification Results

| Command | Result |
|---|---|
| `grep -rho "// LEGAL-VECTOR: Art\. [0-9]*" src tests \| wc -l` / `sort -u \| wc -l` / `grep -rn \| wc -l` | `63`, `63`, `63` |
| triples vs `14-01` Reference A | 63 rows, **0 mismatches** |
| registry shape | `rules 79`, `traced 63`, `untraced 16`, `sorted true`, `keys ok true` |
| lock shape | `lock 16`, `match true`, `topkeys ["$comment","frozen_at","untraced_articles"]`, contains `may only shrink` and `No script writes this file` |
| `node scripts/check-legal-traceability.mjs` | `LEGAL TRACEABILITY OK` / `LEGAL TRACEABILITY COVERAGE 63/79 articles traced, 16 declared untraced` / `GATE-SKIPS total=63 skipped=0`, `REAL=0` |
| `grep -cE "--fix\|--update\|--accept\|--regenerate\|writeFileSync\|appendFileSync"` | `0` |
| header contains both derivation rules | `#[cfg(test)]` ×1, `implemented_in` ×2 in the header block |
| `--rules …/legal-rules-unregistered.json` | `ARTICLE NOT REGISTERED — Art. 888 is cited in the production region of src/step5_legitimes.rs, src/step7_distribute.rs but has no element in …`, exit 1 |
| `--rules …/legal-rules-vector-missing.json` | `VECTOR MISSING — Art. 888's vector names tests/integration.rs fn test_this_function_does_not_exist, which occurs 0 time(s) in that file, expected exactly 1`, exit 1 |
| `--rules …/legal-rules-undeclared-untraced.json` | `UNTRACED NOT DECLARED — Art. 888 has a null vector … but is not declared in engine/legal-traceability.lock`, exit 1 |
| `--lock …/legal-traceability-stale.lock` | `STALE UNTRACED DECLARATION — Art. 888 is declared untraced … but now has the vector tests/integration.rs fn test_law03_total_repudiation_promotes_the_following_degree. DELETE that entry from the lock — this ledger may only shrink, and landing a vector is what forces it down.`, exit 1 |
| `--rules scripts/fixtures/nope.json` | `TRACEABILITY SCAN UNREADABLE: rules path … does not exist`, exit 1 |
| fixture minimality (`diff` changed-line count vs the real file) | 11 / 2 / 5 / 1 — each a single element or a single entry |
| real run after fixtures exist | still exit 0 |
| `cd engine && cargo test` | 8 binaries, all `test result: ok`, all `0 failed` |
| `git diff --stat HEAD~1 HEAD -- engine/src engine/tests` | empty |
| `node scripts/check-commit-discipline.mjs` | `COMMIT DISCIPLINE OK — 210 commit(s) audited … 0 mixed`, exit 0 |

The four markers the plan did not name a fixture for were also observed firing on throwaway
scratchpad inputs (not committed, because `files_modified` fixes the fixture set at four):

- `REGISTERED ARTICLE ABSENT — Art. 9999 is registered but no longer appears in the production region of any engine/src file.` exit 1
- `IMPLEMENTED_IN DRIFTED — Art. 888 declares implemented_in ["src/step1_classify.rs"] but the fixed rule recomputes ["src/step5_legitimes.rs","src/step7_distribute.rs"] from the source` exit 1
- `VECTOR NOT MARKED — Art. 888: no '// LEGAL-VECTOR: Art. 888' line sits inside tests/integration.rs fn test_tv01_single_lc_entire_estate (the marker is in … fn test_law03_…)` exit 1
- `MARKER NOT UNIQUE — Art. 888's '// LEGAL-VECTOR: Art. 888' line occurs 2 times across engine/ (tests/integration.rs:2043, tests/integration.rs:2997)` exit 1 — driven against a **copy** of `engine/` in the scratchpad, which is why `git status --porcelain engine/src engine/tests` stayed empty throughout.

All 9 of the script's markers have therefore been seen firing.

## Deviations from Plan

**[Rule 1 — verify command uses `require()` on a `.lock` file] Task 3's verify** — Found during:
Task 3. `require('./engine/legal-traceability.lock')` fails with `SyntaxError: Unexpected token ':'`
because Node's CJS loader treats an unknown extension as JavaScript, not JSON. The file is valid JSON.
Fix: the same assertions were run through `JSON.parse(readFileSync(...))`, which is also what the
checker itself does. No file content changed to accommodate the command.

**[Rule 1 — acceptance wording] `$comment` casing** — the lock's emphasis sentence is
`IT MAY ONLY SHRINK`, matching `engine/defect-baseline.json`'s house style, which does not literally
contain the lowercase `may only shrink` the acceptance criterion greps for. A second, lowercase
occurrence was added in the enforcement sentence rather than downcasing the emphasis.

**Total deviations:** 2, both mechanical.

## Issues Encountered

None. No point of Philippine law arose: this plan records where a rule is tested and never states
what a rule requires.

## Self-Check: PASSED

- 63/79 traced, 16 declared, coverage line printed by the check itself.
- Both directions of the shrink-only ledger observed firing.
- No file under `engine/src/` or `engine/tests/` modified; the engine suite is unchanged.

## Next

Wave 4: `14-06` — register G26–G29 at orders 21–24 and run the full 28-gate set.
