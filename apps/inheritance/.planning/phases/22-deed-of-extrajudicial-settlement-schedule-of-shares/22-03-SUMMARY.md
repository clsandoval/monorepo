# 22-03 — The pasteable clause text

**Status:** complete. Commit `d007c0825`.

## What shipped

- `frontend/src/lib/deed/clause-text.ts` — `buildDeedClauseText`, `deedClauseBaseName`.
- `frontend/src/lib/deed/__tests__/clause-text.test.ts` — 28 passing tests.

## Measured

```
cd frontend && npx tsc -b --force                              -> exit 0
npx vitest run src/lib/deed/__tests__/clause-text.test.ts
  Tests  28 passed (28)                                        -> exit 0
npx vitest run src/lib/deed
  Test Files  3 passed (3)   Tests  77 passed (77)             -> exit 0
grep -cE "Art\.[[:space:]]*[0-9]" clause-text.ts               -> 0
grep -cE "BigInt\(|Number\(|parseInt|parseFloat|formatDeedPesos|new Date\(\)" -> 0
grep -cE "\\r" clause-text.ts                                  -> 0
imports: only './schedule-lines' and '../pdf-export'
```

## Deviation — criterion 6, reported rather than worked around

The plan asked the criterion-6 test to assert that the **whole** lower-cased clause contains none of
`parties`, `publication`, `bond`, `undertake`, `acknowledg`, `jurat`, `notar`, `witness whereof`,
`hereby adjudicate`, `signature`. That assertion cannot pass, because `DEED_SCOPE_NOTICE` — a
constant plan 22-02 specified verbatim, and which the clause prints — names those clauses in order
to **disclaim** them.

Rather than weaken the assertion or silently rewrite a committed constant, the test measures what the
generator EMITS: it removes the single `DEED_SCOPE_NOTICE` line and asserts every forbidden term is
absent from the remainder, and then separately asserts that the scope notice is the ONLY line in the
whole clause naming any of them and that it disclaims them. That is strictly stronger than the
original: it would still catch a generated signature block, and it additionally pins the disclaimer.
