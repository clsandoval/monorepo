# 22-05 — The exit on the results screen

**Status:** complete. Commit `9f1d59c59`.

## What shipped

- `frontend/src/components/results/DeedClauseSection.tsx` — the clause in a `<pre>`, a copy control
  and a DOCX download, with the four fixed test handles `deed-clause-section`, `deed-clause-text`,
  `copy-deed-clause`, `download-deed-docx`.
- `frontend/src/components/results/ResultsView.tsx` — one import line, one JSX element, mounted
  inside `results-view` and before `<ActionsBar`. `git diff --numstat` -> `3 0`.
- `frontend/src/components/results/__tests__/DeedClauseSection.test.tsx` — 13 passing tests.

## Measured

```
cd frontend && npx tsc -b --force                                        -> exit 0
npx vitest run src/components/results/__tests__/DeedClauseSection.test.tsx
  Tests  13 passed (13)                                                  -> exit 0
grep -cE "dangerouslySetInnerHTML|PHP |Art\.[[:space:]]*[0-9]|per_heir_shares|legal_basis|\.centavos"
  DeedClauseSection.tsx                                                  -> 0
grep -n "<DeedClauseSection" ResultsView.tsx  -> line 91
grep -n "<ActionsBar"        ResultsView.tsx  -> line 93   (section precedes the actions bar)

cd frontend && npm run test
  Test Files  8 failed | 101 passed (109)
       Tests  31 failed | 2318 passed (2349)

cd frontend && npm run test:gate
  GATE OK — test baseline matches exactly
  total tests run     : 2349 (floor 2119)
  passed              : 2318
  known failures met  : 31
  LEDGER SIZE (debt)  : 31
  GATE-SKIPS total=2349 skipped=0                                        -> exit 0

git diff -- frontend/test-baseline.json frontend/scripts/check-test-baseline.mjs -> empty
git diff --name-only -- frontend/journey/references frontend/journey/pdf-references -> empty
```

The load-bearing assertion is that `screen.getByTestId('deed-clause-text').textContent` equals
`buildDeedClauseText(buildDeedSchedule(input, output))` exactly — the screen renders the builder's
string and not a second composition.

## Deviation — one existing test was made more specific, and why

Mounting the section made `ResultsView.test.tsx > shows warnings when present` fail:
`screen.getByText(/Manual Review Required/i)` became ambiguous, because the clause legitimately
prints `MANUAL REVIEW REQUIRED BEFORE THIS SCHEDULE IS USED` alongside the `WarningsPanel` heading
`Manual Review Required`. Real regression, real failure — 32 failures against a 31-entry ledger.

`ResultsView.test.tsx` is outside this plan's `files_modified`, and the change is reported here
rather than buried. The query was scoped to `within(screen.getByTestId('warnings-panel'))` and an
assertion was **added** that the panel also carries the engine's warning text (`Heir omitted`). The
test is strictly stronger than before: it would still fail if the warnings panel stopped showing the
warning. No assertion was deleted, no test skipped, no ledger entry appended.

The alternatives were both worse: rewording `DOCUMENT_REFUSAL_HEADING`, a constant plan 22-02
specifies verbatim and 22-03's tests assert; or leaving a red regression.
