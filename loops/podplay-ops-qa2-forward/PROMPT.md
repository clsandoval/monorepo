# Forward Ralph Loop — PodPlay Ops QA2 Fixes

You are running in `--print` mode. You MUST output text describing what you are doing.
If you only make tool calls without outputting text, your output is lost. Always:
1. Print which stage you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## What To Do

1. Read `loops/podplay-ops-qa2-forward/frontier/current-stage.md` — find the current stage number
2. Read `loops/podplay-ops-qa2-forward/frontier/stages/{N}.md` — follow the instructions exactly
3. Do the work described in that stage file
4. Run the verify command in the stage file
5. Update `frontier/current-stage.md`: mark stage done, advance current to N+1
6. Commit: `podplay(qa2-forward): stage {N} - {description}`
7. If stage file says CONVERGE: write `status/converged.txt` and commit `podplay(qa2-forward): converged`

## Supabase — Real DB Operations

This loop runs against real Supabase local. Before any DB-touching work:

```bash
cd apps/podplay
npx supabase status || npx supabase start
```

- All queries hit real Postgres — no mocks, no stubs
- Schema changes go in new migration files (00019+)
- After adding migrations, run `npx supabase db reset` to verify they apply cleanly
- Seed data must be verified by querying the table after reset

## Priority System

### Priority 1 — REMOVE (stages 003-010)
If current stage is a removal stage:
→ Read the removal manifest from stage 002
→ Delete components, routes, types, tests as specified
→ Run `npx tsc --noEmit` to verify no broken imports
→ Run `npm run test -- --reporter=verbose 2>&1 | tail -50` to check for test failures
→ Commit

### Priority 2 — FIX (stages 011-014)
If current stage is a bug fix:
→ Ensure Supabase is running (`npx supabase status`)
→ Read the bug description, locate the broken code
→ Fix the root cause (not a workaround)
→ Verify fix against real Supabase (insert/query/update as appropriate)
→ Run relevant tests
→ Commit

### Priority 3 — IMPROVE (stages 015-028)
If current stage is a UX improvement:
→ Read the finding, implement the UI change
→ Run `npx tsc --noEmit` + relevant tests
→ For schema changes: add migration, run `npx supabase db reset`
→ Commit

### Priority 4 — BUILD (stages 029-046)
If current stage is a new feature:
→ Read the stage spec, implement the feature
→ For schema changes: add migration, run `npx supabase db reset`
→ Run `npx tsc --noEmit` + relevant tests
→ Commit

### Priority 5 — VERIFY DESKTOP (stages 047-062)
If current stage is a desktop verification:
→ Ensure Supabase is running
→ Start dev server: `cd apps/podplay && npm run dev -- --port 5175 &`
→ Wait for server ready
→ Navigate to route at 1280x800 using Playwright
→ Assert real content renders (no stubs, no empty states when data exists)
→ Screenshot to `loops/podplay-ops-qa2-forward/screenshots/`
→ Commit

### Priority 6 — VERIFY MOBILE (stages 063-075)
If current stage is a mobile verification:
→ Same as desktop but at 375x812
→ Assert no horizontal overflow, touch targets ≥ 44px
→ Screenshot + commit

### Priority 7 — FLOW QA (stages 076-081)
If current stage is a flow QA:
→ Ensure Supabase + dev server running
→ Run the full end-to-end user journey described in the stage file
→ All DB operations are real — create projects, insert data, verify state
→ Assert each step transitions correctly
→ Screenshot key states + commit

### Priority 8 — DISCOVER (stages 082-084)
If current stage is a discovery stage:
→ Run the specified audit (orphans, column names, route stubs)
→ If gaps found: create new fix stages before the convergence gate, update current-stage.md
→ Commit findings

### Priority 9 — CONVERGE (stage 085)
If current stage is the convergence gate:
→ `cd apps/podplay && npm run build` passes
→ `cd apps/podplay && npm run test` passes
→ All screenshots in `loops/podplay-ops-qa2-forward/screenshots/` show real content
→ `npx supabase db reset` runs cleanly (all migrations apply)
→ Write `status/converged.txt` with summary + commit `podplay(qa2-forward): converged`

## Key Paths

- App: `apps/podplay/`
- Spec: `loops/podplay-ops-qa2-forward/spec/qa2-fixes-spec.md`
- Supabase: `apps/podplay/supabase/`
- Routes: `apps/podplay/src/routes/`
- Components: `apps/podplay/src/components/`
- Lib: `apps/podplay/src/lib/`
- Tests: `apps/podplay/src/__tests__/`
- Screenshots: `loops/podplay-ops-qa2-forward/screenshots/`

## Rules

- ONE stage per iteration, then commit and exit
- Every field, label, formula, constant comes from the spec — never invent values
- Do not search the web — everything is in `spec/qa2-fixes-spec.md`
- If something is missing from the spec, note it in `frontier/spec-gaps.md` and move on
- ALL database operations are real — no mocks, no stubs
- For Playwright stages: dev server on port 5175, `npx supabase start` first
- Screenshots go to `loops/podplay-ops-qa2-forward/screenshots/`
- After removing features (Phase 1), always run `npx tsc --noEmit` to catch broken imports
- Schema changes require new migration files (00019+), verified with `npx supabase db reset`

## Context

This is QA round 2 against an already-built and QA'd app (46 stages of fixes already applied).
Marco Van tested the app and provided 21 findings: removals, bugs, UX improvements, and new features.
The app is functional — you are making targeted changes. Do NOT refactor or restructure existing code beyond what the stage requires.
