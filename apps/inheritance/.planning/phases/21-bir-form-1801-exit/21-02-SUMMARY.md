---
phase: 21
plan: 21-02
status: complete
requirements: [RET-01, RET-04]
---

# 21-02 — One Form 1801 line model, with the standard deduction on Item 37A

Committed `67ebb876f`, 3 files.

`frontend/src/lib/estate-tax-engine/form1801-lines.ts` is now the only site in the repository that
constructs a Form 1801 line, item number, label or authority.

| Check | Result |
|---|---|
| `IDS` in the frozen `FORM1801_LINE_IDS` | **33** |
| `AUTH_KEYS` in the frozen authority table | **29** (33 minus the 4 penalty lines) |
| `PENALTY_IN_TABLE` | **0** — penalty authorities come from `penalties.lines[n].authority` |
| `READS_BRIDGE_FIELDS` | **0** |
| `HARDCODED_NIRC_OUTSIDE_TABLE` | **0** |
| `TOLERANCE` | **0** |
| Unit cases | **11 passed / 0 failed** |

Every authority literal is a transcription of a heading already committed in
`specs/estate-tax-engine-spec.md`. Funeral (§9.8) and judicial (§9.9) have **no statutory section
anywhere in the repository** and carry a spec reference; no section was invented for them.

The reconciliation invariant is executable rather than eyeballed, and was **observed failing**: case 10
removes `sp-standard-deduction` and asserts the reported gap contains `500000000`.

## Found and deliberately not fixed

Funeral and judicial expenses are computed twice and land in both `ordinaryDeductions` and
`specialDeductions`. Surfaced as a manual-review warning naming both schedules; no amount, row or total
was altered. No `RET-*` requirement owns the fix.

## Controls

G14 exit 0. `cargo test` 546 / 0. `npm run test:gate` GATE OK, ledger 31, skipped=0.
