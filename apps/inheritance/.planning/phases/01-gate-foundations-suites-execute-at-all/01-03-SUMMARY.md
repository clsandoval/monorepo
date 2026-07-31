---
phase: 01-gate-foundations-suites-execute-at-all
plan: 03
wave: 3
requirements: [GATE-01]
status: complete
commit: c79e871421d8e38856d2ba4b45044d3f6a2bfbbb
---

# 01-03 Summary — Known-failure ledger gate

## What was built

- **`frontend/test-baseline.json`** — 46 entries, generated programmatically from a real
  `npx vitest run --reporter=json` run, not hand-typed. Machine-independent (frontend-relative
  paths; `contains /home/ : false`), sorted by file then `fullName`, every entry carrying a
  non-empty `fullName` and a root-cause `note`. All 46 keys are unique.
- **`frontend/scripts/check-test-baseline.mjs`** — 205 lines, dependency-free (imports only
  `node:fs`, `node:child_process`, `node:path`, `node:os`).
- **`frontend/scripts/fixtures/{regression,fixed,skipped,shrunk}.json`** — generated from the
  ledger so they cannot drift from it.
- **`frontend/package.json`** — added `"test:gate": "node scripts/check-test-baseline.mjs"`.
  `"test": "vitest run"` left untouched; the raw suite is still directly runnable.

## Ledger distribution — matches the plan's table exactly

| file | entries |
|---|---:|
| `src/routes/settings/__tests__/team.test.tsx` | 12 |
| `src/components/shared/__tests__/EnumSelect.test.tsx` | 9 |
| `src/components/shared/__tests__/PersonPicker.test.tsx` | 8 |
| `src/components/tax/__tests__/EstateTaxWizard.test.tsx` | 5 |
| `src/components/wizard/__tests__/ReviewStep.test.tsx` | 4 |
| `src/lib/__tests__/supabase.test.ts` | 2 |
| `src/components/settings/__tests__/InviteMemberDialog.test.tsx` | 2 |
| `src/components/wizard/__tests__/WillStep.test.tsx` | 1 |
| `src/components/wizard/__tests__/HeirReferenceForm.test.tsx` | 1 |
| `src/components/wizard/__tests__/DonationsStep.test.tsx` | 1 |
| `src/components/quick-calc/__tests__/landing-integration.test.tsx` | 1 |
| **Total** | **46 across 11 files** |

`total_tests` = 2416, `min_total_tests` = 2416, `numPendingTests` = 0, `numTodoTests` = 0.

## Gate passing on the current tree

```
=========================================================
GATE OK — test baseline matches exactly
=========================================================
  total tests run     : 2416 (floor 2416)
  passed              : 2370
  known failures met  : 46
  LEDGER SIZE (debt)  : 46   <-- this number must only go down
```

`npm run test:gate` → exit 0. The dual-reporter invocation
(`--reporter=default --reporter=json --outputFile.json=<tmp>`) works on vitest 4.0.18: the
human-readable summary still reaches the log and the JSON report is written alongside it.

## All five failure paths observed firing — exit 1 each, one violation each

| Fixture / input | Exit | Message |
|---|---:|---|
| `scripts/fixtures/regression.json` | 1 | `UNKNOWN FAILURE: src/lib/__tests__/supabase.test.ts :: synthetic fixture a test that does not exist in the baseline` |
| `scripts/fixtures/fixed.json` | 1 | `STALE BASELINE: src/lib/__tests__/supabase.test.ts :: supabase client throws if VITE_SUPABASE_URL is missing` |
| `scripts/fixtures/skipped.json` | 1 | `SKIPPED TESTS: numPendingTests=1 numTodoTests=0 skippedAssertions=1` |
| `scripts/fixtures/shrunk.json` | 1 | `TEST COUNT DROPPED: ran 2000 tests, floor is 2416` |
| `/tmp/definitely-not-a-file.json` | 1 | `REPORT UNREADABLE: no such file` |

Each fixture produced exactly one violation, which shows the checks are independent rather than
one check masking another.

## Anti-weakening properties

- The script contains zero occurrences of `--bail`, `--passWithNoTests`, `--shard`, `--changed`,
  or any `writeFileSync` targeting `test-baseline.json`. There is no `--update` flag: the gate
  cannot edit its own baseline.
- vitest's exit status is explicitly *not* the verdict — the script comments say so and the code
  discards the `spawnSync` status entirely.
- Fixtures are `.json` under `scripts/fixtures/`, outside any `__tests__/` directory. After they
  existed, the gate still reported **2416** total tests, so collection was unaffected.

## Opening test-debt figure for burn-down tracking

**46.** Later phases measure against this. The ledger may only shrink; a `STALE BASELINE`
violation forces an entry out as soon as its test starts passing.
