---
phase: 14-lawyer-blocked-legal-fixes-legal-traceability
plan: 02
subsystem: engine
tags: [bugs, ledger, reconciliation, gate]
requires: ["14-01"]
provides:
  - "engine/BUGS.md reconciled: BUG-001 closed as non-reproducing, BUG-002 filed against a real open defect"
  - "engine/tests/bugs_ledger.rs — the behavioural half (3 tests)"
  - "scripts/check-bugs-ledger.mjs — gate G29's command (registered by 14-06)"
affects:
  - "engine cargo test count: 543 -> 546"
tech-stack:
  added: []
  patterns:
    - "Two independent checks over one document: a Rust test that catches the numbers drifting, a Node check that catches the shape drifting"
key-files:
  created:
    - engine/tests/bugs_ledger.rs
    - scripts/check-bugs-ledger.mjs
    - scripts/fixtures/bugs-missing-heading.md
    - scripts/fixtures/bugs-open-without-repro.md
    - scripts/fixtures/bugs-unknown-status.md
  modified:
    - engine/BUGS.md
key-decisions:
  - "BUG-001 is closed as NON-REPRODUCING, not as fixed. The commit that changed the behaviour was not identified, and this ledger records only what was measured."
  - "BUG-002 is filed but NOT fixed, and no requirement was invented to own it. engine/src/ is untouched. Filing an entry is deliberately not the same as scheduling its fix."
  - "Reference B's heading table yields 9 '### ' headings (Open=5, Closed=4), not the 13 task 2's acceptance criterion states. The table was followed; no heading was invented to reach 13."
requirements-completed: [LAW-15]
duration: 40 min
completed: 2026-07-31
---

# Phase 14 Plan 02: BUGS.md Reconciliation Summary

`engine/BUGS.md` now describes reality, and two independent mechanisms keep it that way.

## The two measurements that shaped the plan

Both were run against the release binary built from the current tree, exit code 0 on both (the
runtime conservation check accepted both outputs).

**BUG-001 does not reproduce.** Its own committed JSON gives:

```
('lc1', 1928571429)
('sp', 1071428571)
('lc2', 0)
('lc3', 0)
SUM 3000000000    scenario T2 Mixed
```

The sum equals the estate exactly (₱30,000,000) and **both** disinherited children receive ₱0 — which
is precisely what the entry's own `### Expected` section demanded. The entry asserted a sum of
₱60,000,000 with all three children at ₱16,875,000.

**BUG-002 does reproduce.** The Reference A input gives:

```
('lc1', 1875000000, 750000000, 750000000, 375000000)   # (net, legitime, free_portion, intestate)
('lc2', 0, 0, 0, 0)
('gc1', 1125000000, 750000000, 0, 375000000)
SUM 3000000000    scenario T1 Mixed
```

₱3,750,000 of the free portion emerges as `from_intestate` on `gc1`, an heir the will never
instituted. The sum still equals the estate, which is exactly why no conservation check can see it.

## What Was Built

- `engine/BUGS.md` rewritten: preamble naming both checks, then BUG-001
  (`Status: Closed — does not reproduce`, `Closed: 2026-07-31`, measured `### Actual`, a
  `### Why it was closed` that says non-reproducing rather than fixed) and BUG-002
  (`Status: Open`, `Location: engine/src/step7_distribute.rs:421`, the unconditional
  `let excess = &inst_value - &heir_legitime;`, a runnable reproduction, an `### Expected` that is a
  verbatim attributed quotation of `.planning/research/LEGAL-CONFORMANCE.md` section 2a's
  Arts. 842 ¶2 / 888 / 914 row, and an `### Owning requirement` stating plainly that **no requirement
  owns this fix**).
- `engine/tests/bugs_ledger.rs` — 3 tests, 6 failure markers.
- `scripts/check-bugs-ledger.mjs` — 8 violation markers.
- 3 committed fixtures. 1 commit, `7de51e77e`, six explicit paths.

## Verification Results

| Command | Result |
|---|---|
| `./target/release/inheritance-engine /tmp/bug001.json` | exit 0, `SUM 3000000000`, `lc2` and `lc3` both `0` |
| `./target/release/inheritance-engine /tmp/bug002.json` | exit 0, 3 rows, `SUM 3000000000`, `lc1 1875000000` (> 1500000000), `lc2 0`, `gc1 from_intestate 375000000` (nonzero) |
| `grep -c "^## BUG-" engine/BUGS.md` | `2` |
| `grep -n "^\*\*Status:\*\*" engine/BUGS.md` | line 20 `Closed — does not reproduce`, line 91 `Open`, in that order |
| `grep -c "Quoted from .planning/research/LEGAL-CONFORMANCE.md"` | `1` |
| `grep -n "step7_distribute.rs:421"` | lines 93 and 97 |
| `grep -c "^### " engine/BUGS.md` | `9` — see deviation 1 |
| `cargo test --test bugs_ledger` | `3 passed; 0 failed; 0 ignored` |
| one-centavo injection (`gc1` 1125000000 → 1125000001) | `ACTUAL DRIFTED: BUG-002 records gc1 = 1125000001 centavos under '### Actual', but the engine now produces 1125000000 centavos. Re-run the reproduction and update BUGS.md to what the engine printed; never loosen this test.` — `test result: FAILED. 2 passed; 1 failed`, process exit 101 |
| restore | `diff` against the pre-injection copy → `RESTORED-IDENTICAL`; `3 passed; 0 failed` again |
| `cd engine && cargo test` | 476+0+3+3+17+44+3+0 = **546 passed, 0 failed** — exactly three higher than 14-01's post-edit 543 |
| `node scripts/check-bugs-ledger.mjs` | `BUGS LEDGER OK — 2 entries checked`, `GATE-SKIPS total=2 skipped=0`, `REAL=0` |
| `--file scripts/fixtures/bugs-missing-heading.md` | `MISSING HEADING — … BUG-901 (status 'Open') lacks the section '### Owning requirement'`, `F1=1`, no other marker |
| `--file scripts/fixtures/bugs-open-without-repro.md` | `OPEN WITHOUT REPRODUCTION — … BUG-901 is Open but has no fenced json block under '### Reproduction', so nobody can run it`, `F2=1`, no other marker |
| `--file scripts/fixtures/bugs-unknown-status.md` | `UNKNOWN STATUS — … BUG-901 has status 'Fixed', which is neither 'Open' nor 'Closed — does not reproduce'`, `F3=1`, no other marker |
| `--file scripts/fixtures/does-not-exist.md` | `BUGS LEDGER UNREADABLE: … does not exist`, `F4=1` |
| `grep -cE "--fix\|--update\|--accept\|--regenerate\|writeFileSync\|appendFileSync"` | `0` |
| `git status --porcelain engine/examples engine/defect-baseline.json engine/src` | empty — none touched |
| `node scripts/check-commit-discipline.mjs` | exit 0 |

The four markers the plan did not name a fixture for were also observed firing, on throwaway
scratchpad copies (not committed, because `files_modified` fixes the fixture set at three):
`ENTRY HEADING MALFORMED`, `DUPLICATE ENTRY ID`, `CLOSED WITHOUT REASON`, `UNATTRIBUTED LEGAL CLAIM`.
All 8 of the script's markers have therefore been seen firing.

## Deviations from Plan

**[Rule 1 — the plan's own arithmetic] `grep -c "^### "` prints 9, not 13** — Found during: Task 2
acceptance. Reference B's heading table is explicit: an Open entry carries Description, Reproduction,
Expected, Actual, Owning requirement (5); a Closed entry carries Description, Reproduction, Actual,
Why it was closed (4). BUG-001 is Closed and BUG-002 is Open, so 4 + 5 = **9**. Reference B's prose
then says "BUG-001 five … and BUG-002 five … plus the three headings of the document preamble", but
its own table gives Closed = 4, and task 2 describes a preamble with **no** `### ` headings at all.
The 13 is unreachable without inventing four headings. The table was followed. Nothing was added to
chase the number, because a heading invented to satisfy a count is exactly the kind of paperwork this
project's checks exist to prevent.

**[Rule 1 — acceptance-criterion wording] the rewrite-flag grep** — same as 14-03/14-04; the header
comment describes the absence without spelling the tokens, and the grep prints `0`.

**Total deviations:** 2, neither behavioural.

## Issues Encountered

BUG-002 is a **real, open, unowned engine defect** in a legal number. It is documented and gated, not
fixed. `engine/src/` was not edited, because no requirement in `.planning/REQUIREMENTS.md` covers
`ShareSpec::EntireFreePort` and inventing one would have been a decision this plan does not contain.
This is recorded loudly in the entry's `### Owning requirement` section rather than left implicit.

## Self-Check: PASSED

- Every centavo figure in `BUGS.md` came from a command that was run; nothing was estimated.
- The one legal proposition in the file is a verbatim attributed quotation.
- `cargo test` 546 passed / 0 failed.
- The drift path was observed firing and the injection restored byte-identically.

## Next

Wave 3: `14-05` (traceability registry), which consumes 14-01's markers and re-measures against the
new 546 baseline.
