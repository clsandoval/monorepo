# Monorepo Memory

## Feedback
- [Use existing logo/icon files](feedback_use_existing_logo.md) — NEVER recreate logos as SVG shapes; always use the actual image files from `docs/brand/`
- [No 30-minute loop schedules](feedback_loop_schedule.md) — Don't default loops to `*/30 * * * *`; ask the user what schedule they want
- [Spec before coding](feedback_spec_before_code.md) — Always produce a gap analysis/spec before implementing; never cowboy code features

## Critical: Loop Premature Convergence Pattern

Forward loops consistently converge at 20-30 stages while leaving work undone. See `docs/plans/2026-03-06-loop-premature-convergence.md` for full analysis.

**Key rules for future loop brainstorms:**
1. **Enumerate, don't compress** — every file = its own stage, max 3 files per stage
2. **Target 80-150 stages** for full-stack apps, not 20-30
3. **Every loop gets a Playwright verification stage** — no convergence without browser check
4. **Discovery stages** — last 3-5 stages hunt for gaps, can extend the stage list
5. **Convergence = every QA-testable flow works** — not just primary flow; every route, form, and edge case a QA tester could reach must be verified in-browser

## TaxKlaro

- **Forward loop** (`apps/taxklaro/loops/forward/`): 28 stages, converged but missed all route page wiring
- **UI loop** (`loops/taxklaro-ui-forward/`): 10 stages, DM Serif Display + DM Sans, active
- Route pages manually wired 2026-03-06 (15 routes, all were stubs returning placeholder divs)
- App-level registry: `apps/taxklaro/loops/_registry.yaml`
- Root CI registry: `loops/_registry.yaml`

## Loop Infrastructure

- CI workflow: `.github/workflows/ralph-loops.yml`
- CI only auto-runs **reverse** loops; forward loops need `gh workflow run ralph-loops.yml -f loop=<name>`
- Root `loops/` dir is what CI reads — app-level loop dirs are for organization only
- Forward loops excluded from cron schedule (line 34 of ralph-loops.yml filters `type == "reverse"`)

## PodPlay

- [Submodule migration planned](project_podplay_submodule.md) — After Cost Analysis feature, extract apps/podplay into its own public repo and convert to submodule
