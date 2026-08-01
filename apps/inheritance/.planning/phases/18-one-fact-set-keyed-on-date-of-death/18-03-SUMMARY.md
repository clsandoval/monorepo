---
phase: 18
plan: 18-03
status: complete
requirements: [FACT-01]
---

# 18-03 — The estate-tax date of death is read, not typed

Committed `0308a4cec` (`DecedentTab.tsx`, `DecedentTab.test.tsx`).

## What changed

The one control that wrote `EstateTaxWizardState.decedent.dateOfDeath` — `DecedentTab.tsx:92-93` —
lost its `onChange` entirely. It did not lose the field: it keeps `id`, `data-testid="decedent-dod"`,
`type="date"` and `value={data.dateOfDeath}`, and gains `readOnly`, `aria-readonly="true"` and
`className="bg-muted"`.

Deleting the control outright was rejected. The date of death is the single most consequential field
on a Form 1801 and a lawyer proof-reading the return needs to see it; and its `data-testid` is
asserted by a committed test, so deleting it would have turned a coverage question into a deletion.

`disabled` was not used: a disabled input is excluded from form submission and reads as broken to a
screen reader. `readOnly` + `aria-readonly="true"` is the pair that says "shown, not edited".

A visible note (`data-testid="decedent-dod-source"`) now says the value is *"Entered once on the
Decedent step of the succession wizard. This return reads it from there."* — so a lawyer is told
where the field moved rather than discovering that typing does nothing. The label reads
`Date of Death (from the case fact set)`.

**`TAX_TREE_WRITERS 0`** — no control anywhere under `frontend/src` writes
`EstateTaxWizardState.decedent.dateOfDeath` any more. That is FACT-01's measurable target, met.

## Verification

`npx tsc -b --force` exit 0. `DOD_WRITER 0`, `READONLY 1`, `SOURCE_NOTE 1`, `TESTID_KEPT 1`,
`TAX_TREE_WRITERS 0`. Diff confined to one file, 11 insertions / 2 deletions, all inside the Date of
Death block.

`DecedentTab.test.tsx` — **6 passed, 0 failed**, `MARKERS 0`. Case 4 types `2021-01-01` into the
control with `userEvent` and asserts `onChange` was called **exactly 0 times**: a value that fails to
update is a symptom, an `onChange` that never fires is the guarantee. Case 6 types into the Full Name
control and asserts `onChange` fired, proving the read-only treatment is scoped to the date rather
than applied to the tab.

`EstateTaxWizard.test.tsx` was **not edited** (`EXISTING_UNCHANGED 0`) and its committed
`renders pre-populated date of death` case passes.

## Reported honestly, not worked around

`EstateTaxWizard.test.tsx` reports **5 failures**. These are **pre-existing ledgered debt, not caused
by this plan** — proven by stashing this plan's `DecedentTab.tsx` edit and re-running the file
against the unmodified component: `5 failed | 42 passed (47)`, the same five names
(`shows "Error saving" when autoSaveStatus is error`, `shows checkmark on tab 0 when decedent fields
are filled`, `shows checkmark on tab 1 when executor name is filled`, `tabs 2-7 always show
checkmark (empty = valid)`, `OtherAssetsTab > renders three sections`). The plan's "0 failed across
both files" criterion is therefore **not met**, and no test was edited, skipped or weakened to meet
it.

## Journey consequence — withheld, not approved

`frontend/journey/rubrics/tax-tab-0.json` asserts only element visibility, `tab-0`'s `aria-selected`,
the absence of the executor panel, and no console errors. `grep -rl "decedent-dod" journey/rubrics`
returns **0** — no committed rubric asserts on the date-of-death control, so the rubric layer stays
green.

The committed **reference image** `frontend/journey/references/tax-tab-0.png` will no longer match:
the control gained a muted background and a source-note paragraph, and the label text changed. **That
diff is a wizard field, not the deleted sidebar navigation region**, so the journey reference rule
forbids approving it. `tax-tab-0` is left **failing and withheld for human review**.
`node journey/approve.mjs` was **not run** for any step. `REFERENCES_TOUCHED 0` and
`git log -1 --name-only | grep -c journey/references` → `0`.
