---
phase: 19
plan: 19-02
status: complete
requirements: [SAVE-02, SAVE-03]
---

# 19-02 — The hook compares values and flushes instead of discarding

Committed `69102c962`, four files: `stable-stringify.ts`, its test, `useAutoSave.ts`, its test.

## What changed

- **`stableStringify`** — a dependency-free deterministic serializer. Object keys sorted, **array
  order preserved** (`family_tree` indices are form paths), `undefined` properties omitted, a named
  error above 32 levels. Money is compared as **text, never parsed**: `Money.centavos` is
  `number | string`, so `1000000` and `'1000000'` serialize differently. 8 cases, all passing.
- **`useAutoSave`** — the reference guard is gone, the pending save is a record carrying **its own
  `caseId`** so a flush can never write to the wrong case, and the unmount cleanup **flushes**.

## Measured against 19-01's baseline

| Behaviour | Before | After | Pinned by |
|---|---|---|---|
| Open a case, type nothing | 1 save | **0** | `adopts the first value without saving` |
| Mutate in place, re-pass same ref | 0 saves | **1** | `saves when the same object is mutated in place` |
| Unmount inside debounce window | 0 saves | **1**, with the latest value | `flushes pending save on unmount` |

`useAutoSave.test.tsx` goes **7 → 14** cases, skipped=0, none deleted. Combined run: **22 passed (22)**.

## The one committed test whose meaning changed

`cancels pending save on unmount` asserted the data-loss behaviour this phase removes. It was
**renamed** to `flushes pending save on unmount` and its assertion **inverted** to the stronger
`toHaveBeenCalledWith` form — not deleted, not skipped. The authorisation is ROADMAP Phase 19 success
criterion 3, quoted verbatim in the test file, in the source and in the commit body. The safety
property it protected is preserved by the new case `does not flush on unmount when nothing is pending`.

## DEVIATION — the plan's specified structure could not pass the plan's own criterion

`19-02-PLAN.md` Task 3 specified the debounce effect depend on `[caseId, input, doSave]`. Built
exactly that way, success criterion 5 **failed**:

```
× saves when the same object is mutated in place
AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times
```

**React's dependency array itself compares with `Object.is`.** An object mutated in place is
reference-identical between renders, so the effect never re-runs and the new value guard inside it is
never reached — replacing the guard is not sufficient. The serialization is therefore computed during
render and **is** the dependency. No test, assertion or baseline was weakened to reach green.
