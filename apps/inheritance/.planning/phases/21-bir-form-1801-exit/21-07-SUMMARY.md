---
phase: 21
plan: 21-07
status: complete
requirements: [RET-05]
---

# 21-07 — The return-parity gate, observed failing on each surface

Committed `322d8f58d`, 4 files, **unregistered on purpose**; registration is 21-08.

`RETURN PARITY PASS screen=33 pdf=33 csv=33` against the live stack, driving a real Chromium against a
real production build and clicking the product's own export controls.

| Check | Result |
|---|---|
| `PARSERS` | 5 |
| `TOLERANCE` / `USES_NUMBER_MATH` / `MUTATING_FLAG` | 0 / 0 / 0 |
| `FIXTURE_HAS_AMOUNTS` | **0** — the fixture holds facts only |
| `COMMA_IN_LOCATION` | 2 |

## Two injections initially PASSED — recorded, not hidden

Full pasted record in `21-GATE-OBSERVATIONS.md`.

1. **PDF, −1 centavo → gate PASSED.** The PDF check was a whole-document substring search, and
   `sp-total` carries the same ₱5,000,000 as Item 37A, so `includes('PHP 5,000,000')` stayed true.
   Replaced with an exact **multiset equality** over every amount token. Re-observed: exit 1.
2. **Dropped row → gate PASSED at 32 == 32.** The *agreeing with itself* hazard, one layer lower than
   the plan expected: the expectation and all three surfaces are built from `buildForm1801Lines`, so
   dropping a line shrank them together. Anchored to the frozen `FORM1801_LINE_IDS`. Re-observed: exit 1.

Injections 1 (display, +1) and 3 (CSV, +1) were re-run against the final gate so every observation
describes the committed code. Each injection was followed by a clean re-run at exit 0;
`INJECTIONS_LEFT 0`.

## Deviation

The fixture's `decedent.dateOfDeath` is **2026-01-15**, not the plan's `2020-06-15`. The first run
exited 2 waiting for `compute-estate-tax`: `lib/fact-set.ts` refuses to compute a case holding two
different dates of death, so a fixture disagreeing with the succession spine can never reach a computed
return. Aligning the fixture is the only option that neither defeats that rule nor mutates the shared
succession fixture other gates read.
