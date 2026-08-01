---
phase: 21
plan: 21-03
status: complete
requirements: [RET-01, RET-04]
---

# 21-03 — The return's deduction rows agree with the computation

Committed `e6e8553ce`, 2 files. `Form1801View.tsx` was rewritten (78%): the inline array of ~24 object
literals is gone and the component renders `buildForm1801Lines(output)`.

## The three contradictions removed

| Row before | Printed | Now |
|---|---|---|
| `35A Standard Deduction` | funeral expenses, `0.00` | `5G Funeral Expenses (pre-TRAIN only)`, and `37A Standard Deduction` = `5,000,000.00` |
| `40 Gross Estate` | the **net taxable estate**, while row 34 printed the real gross estate | `40 Net Taxable Estate`; one gross-estate figure only |
| `44 Total Deductions` | the **tax due** | `44 Net Estate Tax Due` |

| Check | Result |
|---|---|
| `USES_MODEL` / `TESTID_BY_ID` | 1 / 1 |
| `INLINE_ROWS` / `LOCAL_INTERFACE` | 0 / 0 |
| `SECTION_LITERAL` / `DANGEROUS_HTML` | 0 / 0 |
| Component cases | **17 passed / 0 failed** (20-05's 8 kept, testids renamed to line ids; 9 added) |
| `formatPesos` body | unchanged, proven by `git diff` |

A fifth **Authority** column was added; every row carries one, asserted by count comparison rather than
a sample.

## Journey

Re-measured, not cited: `FORM1801_STEPS 0`. No reference image created, modified or approved.
