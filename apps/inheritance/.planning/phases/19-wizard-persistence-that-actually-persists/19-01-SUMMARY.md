---
phase: 19
plan: 19-01
status: complete
requirements: [SAVE-01, SAVE-02, SAVE-03, SAVE-04, SAVE-05]
---

# 19-01 — Measured the dead-code claim before editing anything

Committed `bc5c27e7f` (`19-BASELINE.md`). No source file touched, one file in the commit.

## What it found

| Quantity | Baseline | Driven by | Target |
|---|---|---|---|
| `setAutoSaveInput` call sites | **2**, `$caseId.tsx:52` and `:60` | — | — |
| …of those, sites **outside** the `[caseId]` load effect | **0** | `19-04` | > 0 |
| `methods.watch((` subscriptions in `WizardContainer` | **0** | `19-03` | 1 |
| `OPEN_ONLY_SAVES` (open a case, type nothing) | **1** | `19-02` | 0 |
| `INPLACE_EDIT_SAVES` (mutate in place, re-pass) | **0** | `19-02` | ≥ 1 |
| `UNMOUNT_FLUSH_SAVES` (unmount mid-debounce) | **0** | `19-02` | 1 |
| Frontend tests run / floor | **2109 / 2119**, gap **10** | `19-06` | measured, never engineered |
| Gates registered / locked | **34 / 34**, orders 14-17 = G18, G17, G19, G20 | `19-06` | 35 / 35 |

Positive control `CONTROL_USEAUTOSAVE_REFS` printed **3**, so `SETTER_SITES 2` is a fact about the
product and not an artefact of a wrong search path.

## The correction this plan confirmed

`OPEN_ONLY_SAVES=1` **contradicts the vision audit's phrasing** that the debounce "never fires". The
reference guard was not inert: `prevInputRef` initialised to the first render's `null`, so the first
non-null value read as a change and the hook performed exactly **one redundant write per case
opened**, whose payload equalled what had just been read — and **zero** writes for any amount of
typing. The fix had to make the first observation an *adoption*, or that redundant write would have
survived.

## One measurement defect in the plan itself, recorded not reconciled

`19-01-PLAN.md`'s verify block greps `.planning/ROADMAP.md` for the literal
`flushes it instead of clearing it` and prints `0`, because the roadmap sets the verb in markdown
bold. Re-measured with `flushes\*\* it instead of clearing it` → **1**, at `ROADMAP.md:609`. The
criterion is genuinely present; the `0` was a defect in the plan's pattern, not evidence of a
paraphrase.

The throwaway probe was deleted in the same verify block that ran it;
`git status --porcelain -- frontend/src` printed nothing afterwards.
