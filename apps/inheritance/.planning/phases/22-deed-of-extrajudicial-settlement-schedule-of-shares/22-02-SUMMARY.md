# 22-02 — The single deed schedule line model

**Status:** complete. Commit `8661eff89`.

## What shipped

- `frontend/src/lib/deed/schedule-lines.ts` (213 lines) — `buildDeedSchedule`, `formatDeedPesos`,
  eleven notice constants including `DEED_WORDING_OPEN_QUESTION` behind the
  `LAWYER-DECISION: LAWYER-13` marker.
- `frontend/src/lib/deed/__tests__/schedule-lines.test.ts` — 27 passing tests.

## Measured

```
cd frontend && npx tsc -b --force                                  -> exit 0
npx vitest run src/lib/deed/__tests__/schedule-lines.test.ts
  Tests  27 passed (27)                                            -> exit 0
grep -c "DEED_WORDING_OPEN_QUESTION ="        -> 1
grep -c "LAWYER-DECISION: LAWYER-13"          -> 1
grep -cE "Art\.[[:space:]]*[0-9]"             -> 0   (no article literal)
grep -cE "Number\(|parseInt|parseFloat|new Date\(\)|Date\.now\(\)" -> 0
grep -c "net_from_estate"                     -> 2
grep -c "\.total\.centavos"                   -> 0
```

All four refusal rules (R0 negative, R1 no article, R2 heir-scoped flag, R3 document-scoped flag)
fire on measured properties of the engine output only. No point of Philippine law was decided;
LAWYER-04, LAWYER-06 and LAWYER-08 are untouched at `awaiting-answer`.

`formatDeedPesos('9007199254740993')` -> `PHP 90,071,992,547,409.93`, asserted, proving no double
coercion above the safe integer range.

## Deviations

None.
