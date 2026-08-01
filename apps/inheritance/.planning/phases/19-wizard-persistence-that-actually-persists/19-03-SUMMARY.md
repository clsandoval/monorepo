---
phase: 19
plan: 19-03
status: complete
requirements: [SAVE-01]
---

# 19-03 — Wizard state can now leave the component

Committed `769035d6e`, four files: `WizardContainer.tsx`, `FamilyTreeStep.tsx`, `PersonCard.tsx`,
`WizardContainer.test.tsx`.

## What changed

`WizardContainerProps` declared only `onSubmit` and `defaultValues` — the missing segment that is why
`useAutoSave` never had anything to save. Added an **optional** `onChange` prop fed by a
`methods.watch()` subscription, unsubscribed in the effect cleanup.

| Measurement | Before | After |
|---|---|---|
| `onChange?: (input: EngineInput) => void` declared | 0 | **1** |
| `methods.watch((` subscriptions | **0** | **1** |
| `unsubscribe()` calls | 0 | **1** |

## The prop is genuinely optional

Seventeen committed `WizardContainer` cases and five registered journey steps render this component
without an `onChange`, and all of them pass **unedited**: `144 passed (144)` across
`WizardContainer`, `FamilyTreeStep` and `PersonCard`. With no `onChange`, no subscription is created
at all.

## Two stable handles, zero pixels

`data-testid="add-person"` on the Add Person button and ``data-testid={`person-name-${index}`}`` on
each card's Full Name input, so `19-05`'s browser gate can drive them by index — which cannot be done
by DOM position when the number of cards is the quantity under test. A `data-testid` renders no
pixels; no visible text, class, element or ordering changed, so the approved `wizard-family-tree`
reference stays valid. Confirmed empirically in `19-06`: **zero `wizard-*` journey steps fail.**

## Test growth

`WizardContainer.test.tsx` **17 → 25** cases, skipped=0, none deleted. The new
`onChange subscription` block pins: no fire at mount (which would resurrect the redundant write-back
`19-02` removed), firing on a text change, the argument being the **whole** `EngineInput` (all six
top-level properties asserted by name), firing on append and on naming an appended person, silence
after unmount, rendering without the prop, and — the regression case — **focus surviving ten
consecutive keystrokes**, asserting both the full value and `document.activeElement`.
