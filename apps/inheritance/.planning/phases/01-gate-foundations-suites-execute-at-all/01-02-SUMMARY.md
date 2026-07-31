---
phase: 01-gate-foundations-suites-execute-at-all
plan: 02
wave: 2
requirements: [GATE-01]
status: complete
commit: 181ae68c54933902949d3a153a5e04a59056136e
---

# 01-02 Summary — jsdom environment polyfills

## What was built

`frontend/src/test-setup.ts` grew from 15 to 118 lines. The pre-existing
`import '@testing-library/jest-dom/vitest'` and the `navigator.clipboard` getter/setter block are
untouched. Appended, each behind an existence guard so a real implementation always wins:

- `ResizeObserver` on `globalThis` — observe/unobserve/disconnect no-ops. Recharts + Radix popper.
- `DOMRect` on `globalThis` — constructor `(x, y, width, height)`, `top/left/right/bottom = 0`,
  static `fromRect()`, `toJSON()`. Radix positioning.
- `window.matchMedia` — `matches: false`, echoes `media`, no-op listener methods.
- On `window.Element.prototype`: `scrollIntoView`, `hasPointerCapture` (returns `false`),
  `setPointerCapture`, `releasePointerCapture`, `scrollTo`. Radix Select pointer/scroll APIs.

Nothing outside this list was added — no `IntersectionObserver`, no `crypto.randomUUID`, no `fetch`,
no `structuredClone`. `grep -c "if (!"` returns **8**.

## Measured result — exactly the planned target

```
 Test Files  11 failed | 98 passed (109)
      Tests  46 failed | 2370 passed (2416)
```

Before: `22 failed | 87 passed (109)` files, `342 failed | 2074 passed (2416)` tests, plus 2
unhandled Radix pointer-API exceptions. **296 failures eliminated (86.5%), and the 2 unhandled
exceptions are gone.** The total collected count is unchanged at 2416 — no test appeared or vanished.

## Environment errors eliminated — measured, not asserted

| grep over the full run log | count |
|---|---|
| `ResizeObserver is not defined` | **0** (was 1,465) |
| `hasPointerCapture is not a function` | **0** |
| `scrollIntoView is not a function` | **0** |

## The 11 still-failing files (46 failures)

| File | Failed |
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

This matches RESEARCH.md §2.1's independently-measured prediction file-for-file and count-for-count.
These 46 are genuine test-vs-product mismatches and were deliberately **not** fixed here.

## Proof nothing was weakened

- `git diff --name-only` over `**/*.test.ts` / `**/*.test.tsx` under `frontend/src` → **empty**.
- `grep -rnE "\.(skip|only|todo)\(|^\s*(xit|xdescribe)\("` across all test files → **no output**
  (exit 1). Zero skip/only/todo escape hatches exist anywhere in the suite.
- Exactly one source path modified: `frontend/src/test-setup.ts`.
- `npx tsc -b --force` → exit 0, zero output.

## Note

Running the plan-mandated `npx tsc -b --force` rewrites the tracked build cache
`frontend/tsconfig.tsbuildinfo`. It was deliberately left unstaged; plan 01-04 Task 4 untracks it
and adds it to `.gitignore` for exactly this reason.
