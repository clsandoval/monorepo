# Forward Ralph Loop — PodPlay Ops QA Fixes

You are running in `--print` mode. You MUST output text describing what you are doing.
If you only make tool calls without outputting text, your output is lost. Always:
1. Print which stage you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## What To Do

1. Read `loops/podplay-ops-qa-forward/frontier/current-stage.md` — find the current stage number
2. Read `loops/podplay-ops-qa-forward/frontier/stages/{N}.md` — follow the instructions exactly
3. Do the work described in that stage file
4. Run the verify command in the stage file
5. Update `frontier/current-stage.md`: mark stage done, advance current to N+1
6. Commit: `podplay(qa-forward): stage {N} - {description}`
7. If stage file says CONVERGE: write `status/converged.txt` and commit `podplay(qa-forward): converged`

## Key Paths

- App: `apps/podplay/`
- Spec: `loops/podplay-ops-qa-forward/spec/qa-fixes-spec.md`
- Supabase: `apps/podplay/supabase/`
- Routes: `apps/podplay/src/routes/`
- Components: `apps/podplay/src/components/`
- Lib: `apps/podplay/src/lib/`
- Tests: `apps/podplay/src/__tests__/`

## Rules

- ONE stage per iteration, then commit and exit
- Every field, label, formula, constant comes from the spec — never invent values
- Do not search the web — everything is in `spec/qa-fixes-spec.md`
- If something is missing from the spec, note it in `frontier/spec-gaps.md` and move on
- For Playwright stages: dev server on port 5175, `npx supabase start` first
- Screenshots go to `loops/podplay-ops-qa-forward/screenshots/`

## Context

This is a QA fixes loop against an already-built app (971 tests, all routes verified).
The app is fully functional — you are making targeted fixes for 9 open QA findings.
Do NOT refactor or restructure existing code. Make minimal, focused changes.
