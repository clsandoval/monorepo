---
phase: 19
plan: 19-04
status: complete
requirements: [SAVE-01, SAVE-04]
---

# 19-04 — Keystrokes reach the database and the save state is on screen

Committed `e039733fd`, three files: `SaveStatusBadge.tsx`, its test, `$caseId.tsx`.

## What changed

| Measurement | Before | After |
|---|---|---|
| `grep -c setAutoSaveInput` in `$caseId.tsx` | 3 | **4** |
| Call sites **outside** the `[caseId]` load effect | **0** | **1** (line 156) |
| Hook's `status` captured | discarded | `const { status: autoSaveStatus }` |

`SaveStatusBadge` renders `Saving...`, `Saved`, `Save error` — copy and variants **copied verbatim**
from `EstateTaxWizard.tsx:99-104` so both wizards say the same thing — and **nothing at all** at
`idle`: no wrapper, no spacer. That rule is load-bearing, not stylistic: five registered journey steps
screenshot the succession wizard on a screen nobody has typed into.

## SAVE-04 checked in both directions

The error case asserts both that `Save error` is present **and** that `Saved` is absent from the
document. A lawyer seeing `Saved` over a rejected write is the worst outcome available here.
6 cases, `6 passed (6)`, skipped=0.

## DEVIATION — an assertion that could never fail, replaced by a stricter one

`19-04-PLAN.md` case 6 specified asserting the saved badge's `className` does **not** contain the
substring `destructive`. That assertion **cannot fail**: shadcn's `Badge` base class always contains
`aria-invalid:ring-destructive/20` and `aria-invalid:border-destructive`, so it is true of every
variant. Measured:

```
AssertionError: expected 'inline-flex items-center justify-cent…' not to contain 'destructive'
```

Replaced with the **variant's own** classes — error has `bg-destructive` and not `bg-secondary`,
saved the converse. This is a stricter check, not a looser one.

## Pre-existing failures, not caused here and not fixed here

The combined run over `src/__tests__/`, wizard, case, hook and lib paths reports
`7 failed | 524 passed (531)`. **All 7 are in `frontend/test-baseline.json` `known_failures`** and
live in `DonationsStep`, `HeirReferenceForm`, `ReviewStep` and `WillStep` test files, none of which
this phase touches. The plan's "0 failed across those paths" criterion is therefore **not met and not
claimed**. No test was edited, skipped or weakened.
