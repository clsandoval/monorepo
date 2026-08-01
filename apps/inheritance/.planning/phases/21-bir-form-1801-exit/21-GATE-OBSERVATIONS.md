# Phase 21 — G37 `return-parity` falsification record

Gate: `frontend/journey/return-parity.ts`
Command: `cd frontend && npx tsx journey/return-parity.ts`

Every observation below is a real run against the live local Supabase stack, driving a real Chromium
against a real production build, clicking the product's own controls and reading the bytes the
browser actually downloaded. Nothing here is reasoned; all output is pasted.

Baseline, before any injection:

```
GATE-SKIPS total=33 skipped=0
RETURN PARITY PASS screen=33 pdf=33 csv=33
GATE_EXIT=0
```

> **Two injections initially PASSED and the gate was strengthened before they were accepted.**
> Both weaknesses are recorded in full below rather than quietly repaired, because a gate that was
> only ever seen passing is decoration. Injections 1 and 3 were re-run against the final gate so
> that every observation in this file describes the code that was committed.

---

## Injection 1 — display, plus one centavo

**Edit** (`frontend/src/components/tax/results/Form1801View.tsx`), the Col C cell:

```tsx
: formatPesos(line.id === 'sp-standard-deduction' ? line.total + 1 : line.total)}
```

**Gate output**

```
DISPLAY DISAGREES: line sp-standard-deduction screen=500000001 engine=500000000 centavos
RETURN PARITY FAIL rows=33 screen=33 csv=33 violations=1
INJ1_FINAL_EXIT=1
```

**Clean re-run after `git checkout --`**

```
RETURN PARITY PASS screen=33 pdf=33 csv=33
CLEAN1_EXIT=0
```

---

## Injection 2 — PDF, minus one centavo

**Edit** (`frontend/src/components/pdf/Form1801PDF.tsx`), the total cell:

```tsx
: amountText(line.id === 'sp-standard-deduction' && line.total !== null ? line.total - 1 : line.total)}
```

**First observation — THE GATE PASSED. This was a real hole in the gate.**

```
INJ2_EXIT=0
RETURN PARITY PASS screen=33 pdf=33 csv=33
```

Cause: the PDF check was a whole-document substring search for the expected token. On the TRAIN
fact set Item 37A (`sp-standard-deduction`) and Item 37 (`sp-total`) both carry ₱5,000,000, so
`includes('PHP 5,000,000')` remained true while Item 37A alone was corrupted. `pdftotext` emits this
document column-wise, so there is no reliable row boundary to key a per-row check on.

**Fix**: the PDF comparison was replaced with an exact **multiset equality** over every `PHP` amount
token in the document, built from the `exclusive`, `conjugal` and `total` of every line. It is
bidirectional by construction — a token the engine produced and the document lacks, and a token the
document prints that the engine never produced, are both reported.

**Second observation, against the strengthened gate**

```
PDF DISAGREES: the engine produced PHP 5,000,000 2 time(s) but the document prints it 1 time(s)
PDF DISAGREES: the document prints PHP 4,999,999.99 1 time(s), an amount the engine never produced
RETURN PARITY FAIL rows=33 screen=33 csv=33 violations=2
INJ2_EXIT=1
```

**Clean re-run after `git checkout --`**

```
RETURN PARITY PASS screen=33 pdf=33 csv=33
CLEAN2_EXIT=0
```

---

## Injection 3 — CSV, plus one centavo

**Edit** (`frontend/src/lib/form1801-csv.ts`), the total cell:

```ts
: centavoCell(line.id === 'sp-standard-deduction' ? line.total + 1 : line.total);
```

**Gate output**

```
CSV DISAGREES: row 16 csv=500000001 engine=500000000 centavos
RETURN PARITY FAIL rows=33 screen=33 csv=33 violations=1
INJ3_FINAL_EXIT=1
```

**Clean re-run after `git checkout --`**

```
RETURN PARITY PASS screen=33 pdf=33 csv=33
CLEAN3_EXIT=0
```

Injections 1 and 3 are plus one centavo and injection 2 is minus one centavo, which is roadmap
criterion 5's *"in each direction"* stated literally.

---

## Injection 4 — a dropped row

**Edit** (`frontend/src/lib/estate-tax-engine/form1801-lines.ts`), inside `buildForm1801Lines`:

```ts
const droppedLines = lines.filter((l) => l.id !== 'sp-standard-deduction');
lines.length = 0;
lines.push(...droppedLines);
```

**First observation — THE GATE PASSED. This was the more serious of the two holes.**

```
INJ4_EXIT=0
RETURN PARITY PASS screen=32 pdf=32 csv=32
```

Cause: this is the *agreeing with itself* hazard the plan's own threat model named, arriving one
layer lower than the plan expected. The gate built its expectation from `buildForm1801Lines` and all
three surfaces render `buildForm1801Lines`, so dropping a line from the shared model shrank the
expectation and the three surfaces **together**, and 32 rows agreed with 32 rows. The plan asserted
`LINE SET MISMATCH` would catch this; as originally written it could not, because every id it
compared came from the same regressed source.

**Fix**: a `LINE SET MISMATCH (model)` check comparing the model's id set against the **frozen**
`FORM1801_LINE_IDS` constant, which is not derived from any computation and is therefore the one
anchor in the file a model regression cannot move.

**Second observation, against the strengthened gate**

```
LINE SET MISMATCH (model): the line model does not match the frozen id set — missing=[sp-standard-deduction] unexpected=[]
RETURN PARITY FAIL rows=32 screen=32 csv=32 violations=1
INJ4_EXIT=1
```

**Clean re-run after `git checkout --`**

```
RETURN PARITY PASS screen=33 pdf=33 csv=33
CLEAN4_EXIT=0
```

---

## Deviation from the plan, recorded

`21-07` task 1 specifies the fixture's `decedent.dateOfDeath` as `2020-06-15`. It is committed as
**`2026-01-15`**, matching the succession spine in the Alpha case's `input_json`.

Reason, measured rather than assumed: the first gate run exited 2 at
`waiting for locator('[data-testid="compute-estate-tax"]')`. `lib/fact-set.ts` refuses to compute a
case holding two different dates of death, and the route only passes `onCompute` when the verdict is
`ok`, so the Compute control is correctly absent. A fixture disagreeing with the spine can therefore
never reach a computed return. This is the product behaving as Phase 18 designed and gate `G34`
enforces; aligning the fixture is the only option that does not either defeat that rule or mutate the
shared succession fixture other gates read. TRAIN still applies on the committed date, so the
₱5,000,000 standard deduction this phase exists to surface is still the figure under test.

No injected edit survives in the working tree, and no reference image was created, modified or
approved at any point.
