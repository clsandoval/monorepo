---
phase: 16
plan: 16-04
status: complete-with-blocker
requirements: [CUT-01, CUT-04]
---

# 16-04 — Retire the orphaned intake tests; report the floor blocker

Committed `7c0c0f6bc` (+ `16-FLOOR-BLOCKED.md`).

46 tests removed, every one of them a test whose **subject code** 16-02 and 16-03 deleted:

| Count | File |
|---|---|
| 11 | `src/lib/__tests__/conflict-check.test.ts` — whole file, subject module gone |
| 30 | `src/lib/__tests__/intake.test.ts` — 43 kept |
| 5 | `src/components/intake/__tests__/intake-form.test.tsx` — 11 kept |

No surviving test was weakened; no skip, todo or pending marker anywhere. `isStepComplete` index
arguments and the `INTAKE_STEP_COUNT` expected value were repointed at the renumbered production
code, which changes what an assertion points at, not how strict it is.

## BLOCKED — owner action required

```
TEST COUNT DROPPED: ran 2073 tests, floor is 2119
```

2119 − 2073 = 46, reconciling exactly with the removals. `frontend/test-baseline.json` was **not**
edited. Lowering `min_total_tests` to 2073 would clear the gate and is precisely what commit
`4ccf06270` did once (2416 → 2119) **under explicit owner authorisation**. That is owner-only action
and this phase took none of it.

## Verification

`npx tsc -b --force` exit 0. `npm run test:gate` exit 1 with the marker above, `skipped=0`.
