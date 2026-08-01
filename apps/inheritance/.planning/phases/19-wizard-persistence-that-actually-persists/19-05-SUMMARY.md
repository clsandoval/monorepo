---
phase: 19
plan: 19-05
status: complete
requirements: [SAVE-05]
---

# 19-05 — A live-database gate, observed failing before it was registered

Committed `e1ccdd6e1`, one file: `frontend/journey/persistence.mjs`. Deliberately **not** registered
here — `19-06` does that.

## What it does

Enters nine heirs through the real succession wizard in a real headless browser against a real local
Supabase, **never clicks Compute**, and asserts seven properties with seven literal markers:
`NOT PERSISTED`, `COMPUTE LEAKED`, `NAME LOST`, `RELOAD LOST`, `STATUS NOT SHOWN`, `UNMOUNT LOST`,
`FIXTURE MUTATED`. Three-valued exit contract: 0 pass, 1 fail, 2 `PERSISTENCE CANNOT RUN:`.

A unit test cannot reload a page, and every unit test in this area passed for months against a hook
the application could not reach. That is exactly the sampling that certified this defect.

## Standalone script, not a registry step

`scripts/check-journey-registry.mjs` fails `REFERENCE MISSING` for any step without an approved
reference PNG, and producing a **first** reference is a human visual judgement no agent may make. So
this is the `money-parity.mjs` / `rls-isolation.mjs` shape: no step, no rubric, no reference image, no
approval. `node scripts/check-journey-registry.mjs` still exits 0
(`JOURNEY REGISTRY ok steps=25 references=25`).

## The fixture hazard, avoided by construction

The `case-alpha-no-output` reset does **not** restore `input_json`. Typing nine heirs into the seeded
Alpha case would have left them there permanently and silently redefined what **G19 money parity**
computes against. The gate inserts its **own** row, deletes it in a teardown that runs on every exit
path, and check 7 asserts Alpha's `input_json` is byte-identical before and after.

## Observed green → red → green

| Injection | Exit | First failure line |
|---|---|---|
| Baseline, no injection | **0** | `PERSISTENCE PASS heirs=9 checks=7` |
| **A** — deleted `onChange={setAutoSaveInput}` | **1** | `NOT PERSISTED: the database holds 4 family_tree entries, expected 9` |
| revert A | **0** | `PERSISTENCE PASS heirs=9 checks=7` |
| **B** — unmount cleanup discards instead of flushing | **1** | `UNMOUNT LOST: family_tree[0].name is "Heir 1" … expected "Flushed Heir"` |
| revert B | **0** | `PERSISTENCE PASS heirs=9 checks=7` |
| **C** — reference equality restored | **0** | *(none — the gate stayed GREEN)* |
| revert C | **0** | `PERSISTENCE PASS heirs=9 checks=7` |

## The third injection did not turn the gate red, and that is reported

**Regression C left G35 green.** Mechanism: through the real wizard `react-hook-form` emits a *new*
object on every notification, so reference inequality and value inequality **coincide** and the
browser path cannot distinguish them. The value-comparison rule is covered instead at the unit layer —
`useAutoSave.test.tsx` → `saves when the same object is mutated in place` **does** fail under that
injection (`1 failed | 13 passed`). **G35 makes no coverage claim for that rule**, and `GATES.md`
section 26 says so.

`git status --porcelain -- frontend/src` printed nothing after the third revert;
`git diff --stat -- frontend/src | wc -l` printed `0`.
