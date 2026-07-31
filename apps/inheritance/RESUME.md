# Resuming the autonomous 15-phase run

Written 2026-07-31 for an owner returning after several days away.

## One command

The whole run is a single background workflow. To continue it from wherever it
stopped, in a Claude Code session at the monorepo root:

```
Workflow({
  scriptPath: "/home/clsandoval/.claude/projects/-home-clsandoval-cs-monorepo-apps-inheritance/ba0262ab-dc9f-47d8-83a3-ddf973495452/workflows/scripts/inheritance-autonomous-15-phases-wf_c44e9af1-807.js",
  resumeFromRunId: "wf_c44e9af1-807"
})
```

Completed phases return from cache instantly; only the first unfinished phase
and everything after it runs live. Resuming is free and idempotent — if it
reports "still running", the run is alive and needs nothing.

Or just say "continue the inheritance run" and the assistant will do the above.

## Why it keeps stopping

The workflow lives inside the Claude Code process. When that process exits, the
run stops mid-phase with no completion record. Nothing is lost — the journal
holds every finished phase — but it does not restart itself. There is no
in-session mechanism that survives process exit: `CronCreate` jobs are
explicitly session-only.

The only genuinely durable option is CI, and it is not wired for it yet. See
"Open decisions" below.

## Where to look

| What | Where |
|---|---|
| Per-phase results (the source of truth) | `<transcriptDir>/journal.jsonl` |
| Live/most recent gate outcome | `apps/inheritance/LOOP-STATUS.md` |
| Machine-readable gate results | `apps/inheritance/gate-results.json` |
| Roadmap + phase status table | `.planning/ROADMAP.md` |
| Current position | `.planning/STATE.md` |

`<transcriptDir>` is
`/home/clsandoval/.claude/projects/-home-clsandoval-cs-monorepo/ba0262ab-dc9f-47d8-83a3-ddf973495452/subagents/workflows/wf_c44e9af1-807/`.

Full gate suite, any time: `bash apps/inheritance/scripts/ci-gates.sh` from the
monorepo root. It should print `ALL GATES PASSED (13/13)`.

## State as of 2026-07-31

Phases 1-9 attempted; 1, 2, 3, 4, 6 complete, 5/7/8/9 partial. Phase 10 running.

The long-standing G3 halt — inherited by every phase from 5 onward — is fixed.
The suite went fully green for the first time (`ALL GATES PASSED (13/13)`) after
two commits:

- `d71f9150e` — the five tests that encoded the pre-Phase-5 silent behavior now
  assert `EngineError` / `kind: output_check`, per the owner's OBS-05/OBS-06
  ruling that the engine rejects rather than best-effort-distributes.
- `ee438dc94` — G8 no longer counts `@ts-expect-error` in a `*.typetest.ts` as a
  skip. It is self-verifying (TS2578 fires if the guarded protection regresses),
  so it cannot hide a regression. Narrow: `@ts-ignore` / `@ts-nocheck` are still
  skips everywhere, verified by injecting one and watching G8 catch it.

## Open decisions waiting on the owner

1. **127 unpushed commits.** GATE-04 cannot be verified until they are pushed,
   because the CI workflow has never actually executed on GitHub. Not done
   unattended: pushing is outward-facing and permanent.

2. **CI does not self-drive.** `.github/workflows/inheritance.yml` is
   `workflow_dispatch` only. Adding a `schedule:` trigger (plus the push above)
   is the one change that would make this loop survive without a live session —
   and is what the project's own "grind for a month unattended" goal implies.

3. **Phase 14 is blocked on the lawyer.** LAW-06 / LAW-07 / LAW-12 need answers
   to Q4 (Art. 992 iron curtain), Q6 (donation *inter vivos* excess) and Q8
   (RA 11642 adoptee rights). Recorded in the lawyer agenda; G10 reports 9
   decisions still awaiting answer. LAW-13/14/15 will land regardless.

4. **`multiple SurvivingSpouse` weak assertion** survives in
   `assertion-baseline.json`. The OBS-05/06 ruling did not cover it — two spouse
   entries are a distinct input class the engine still accepts. Needs its own
   call.
