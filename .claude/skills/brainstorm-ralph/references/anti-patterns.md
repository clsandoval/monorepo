# Loop Anti-Patterns & Guardrails

Source: `docs/plans/2026-03-06-loop-premature-convergence.md`

## The Core Problem

Forward loops converge at 20-30 stages while leaving significant work undone. TaxKlaro required 4 loops + 2 manual sessions (~120 iterations). Should have been 1.

## Root Causes

1. **Brainstorm scope compression** — "Implement all wizard steps" hides 17 stages in 1
2. **Introspective convergence** — `grep` for stubs passes, but app is broken in browser
3. **Stub-first illusion** — 549 tests pass, every file exists, app is a Potemkin village
4. **No self-discovery** — fixed stage list can't find gaps brainstorm missed

## Reverse Loop Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| Spec says "see external source" | Reproduce all data inline |
| "etc." or "similar to above" | Write every row, every case |
| Undecided vendor/tool ("TBD") | Pick one and spec it fully |
| Conflicting values across files | Single source of truth, reconciliation aspect |
| Missing files from directory structure | Every file in the tree must exist or be explicitly removed |
| No QA/screenshot manifest | Forward loop has no way to verify visual output |
| No local dev setup spec | Forward loop can't run tests against real DB |

## Forward Loop Anti-Patterns

| Anti-Pattern | Why It Fails | Do This Instead |
|-------------|-------------|-----------------|
| "Implement all X" as one stage | Agent does 2-3, declares done | One stage per X, max 3 per stage |
| `grep` for stubs as convergence | Misses non-obvious stubs | Playwright navigation + screenshot |
| Tests pass = done | Tests test stubs, not behavior | Smoke test in browser |
| Fixed stage list only | Brainstorm misses gaps | Discovery stages that extend the list |
| Component-level verification | Components exist but aren't wired | Route-level verification |
| 20-30 stages for a full app | Compressed stages hide work | 80-150 stages with granular decomposition |

## Stage Count Guidelines

| App Type | Target Stages | Breakdown |
|----------|--------------|-----------|
| Full-stack SaaS app | 80-150 | ~20 engine/backend, ~30 components, ~20 route pages, ~10 auth/layout/nav, ~10 data layer, ~10 polish, ~5 deploy, ~5 test, ~5 E2E verification |
| Content/marketing site | 30-60 | Pages + components + CMS + deploy |
| CLI tool / library | 15-30 | Core logic + tests + docs + publish |
| QA fix loop | 3x open findings | Each finding gets fix + verify + screenshot stages |

## Mandatory Stage Types

Every forward loop MUST include:

1. **Local dev setup stage** — `supabase start` or equivalent, seed data, dev server
2. **Playwright verification stages** — navigate every route, screenshot every state
3. **Discovery stages (last 3-5)** — actively hunt for gaps, extend stage list if found
4. **Convergence gate** — all screenshots pass visual check, zero broken flows

## Convergence Criteria

```
BAD:  "zero grep hits for placeholder/stub"
GOOD: "Playwright navigates to /computations/new and finds a radio group with 3 options"

BAD:  "primary flow works"
GOOD: "every route, every form, every edge case a QA tester could reach verified in-browser"
```
