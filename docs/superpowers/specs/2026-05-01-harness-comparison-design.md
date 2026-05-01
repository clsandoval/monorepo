# Harness Comparison: opencode vs pi-mono vs GitHub Copilot CLI (with MiMo V2.5 Pro)

**Date:** 2026-05-01
**Author:** carlos
**Status:** Draft

## Goal

Investigate three Claude Code alternatives — `sst/opencode`, `badlogic/pi-mono`, and GitHub Copilot CLI — paired with Xiaomi MiMo V2.5 Pro as the target model. Produce a capability matrix, a hands-on bake-off across four task types, a cost comparison vs Opus 4.7, and a recommendation.

## Non-goals

- Benchmarking MiMo's raw model quality vs other LLMs (the model is held constant; we're comparing harnesses).
- Long-running production evaluation. This is a single-session investigation, ~half-day budget.
- Refactoring or improving the testbed (`hermit-cma`) — it's a substrate, not the subject.

## Approach

Capability matrix (doc-research) **plus** hands-on bake-off on a shared testbed. The matrix gives the vocabulary for evaluating any harness; the bake-off grounds it in MiMo-specific reality (tool-call format, prompt handling).

## Harnesses under test

1. **opencode** — `sst/opencode`. Open-source TUI agent, supports any OpenAI-compatible provider.
2. **pi-mono** — `badlogic/pi-mono`. Single-binary agent CLI.
3. **GitHub Copilot CLI** — user has confirmed BYO/MiMo wiring is feasible; exact mechanism to be documented in phase 1.

## Model

**Xiaomi MiMo V2.5 Pro** via Xiaomi's native API (not OpenRouter). Per-harness shim work may be required if MiMo's tool-call schema diverges from strict OpenAI format.

## Testbed

`~/cs/hermit-cma` — Python FastAPI + Slack Bolt + Supabase + fastmcp. Real, non-trivial codebase. All bake-off tasks operate on a clean checkout per run.

## Directory layout

```
research/2026-05-01-harness-comparison/
├── README.md                    # final report (the deliverable)
├── spec.md                      # link to this design doc
├── capability-matrix.md         # phase-2 output
├── runs/
│   ├── _prompts/{A,B,C,D}.md    # identical prompts shared across harnesses
│   ├── opencode/{taskA,taskB,taskC,taskD}/
│   ├── pi-mono/{taskA,taskB,taskC,taskD}/
│   └── copilot-cli/{taskA,taskB,taskC,taskD}/
│       └── (per run: transcript.md, metrics.json, artifact.diff, notes.md)
├── wiring/
│   ├── opencode-mimo.md
│   ├── pi-mono-mimo.md
│   └── copilot-cli-mimo.md
└── podcast/                     # /investigate output
```

## Phases

### Phase 1 — Wiring + smoke tests (gating)

Per harness, two gates before proceeding:

- **Gate 1 — Hello-world chat:** single-turn, no tools. Prompt: *"What is 2+2?"* Confirms auth + endpoint + base inference.
- **Gate 2 — Tool-call sanity:** minimal task with one shell + one file-read tool call. Prompt: *"Run `pwd`, then read `pyproject.toml` and tell me the project name."* Confirms MiMo's tool-call format round-trips through the harness.

Each smoke test produces `wiring/<harness>-mimo.md` with: redacted config, Gate 1 result + raw response, Gate 2 result + tool-call trace, pass/fail, any required shims.

If a harness fails Gate 2: document the failure, optionally try one workaround (e.g., proxy that rewrites tool-call schema). If still failing, drop from bake-off with a clear note in the report.

Phase 1 also pins **exact MiMo pricing** (input/output $/M tokens) from Xiaomi's API docs for use in the cost section.

### Phase 2 — Capability matrix (doc/source research, no runs)

Same 14 dimensions for all three harnesses. Output: `capability-matrix.md` with table + short prose per harness highlighting standouts.

Dimensions:

1. **Model wiring** — BYO endpoint? OpenAI-compat? Native tool-call schema or translated?
2. **Tool calling** — built-in tools list, MCP support, custom tool definitions
3. **File ops** — read/write/edit primitives, diff handling
4. **Shell exec** — sandboxing, approval model, output capture
5. **Agent loop** — planning, todo/task tracking, replanning, max iterations
6. **Context management** — auto-compaction, summarization, manual context controls
7. **Session persistence** — resume, transcript export, branching
8. **Permissions/safety** — allowlists, approval prompts, dangerous-action gating
9. **Hooks/extensibility** — pre/post hooks, plugins, lifecycle events
10. **Sub-agents / parallelism** — can spawn workers, isolation model
11. **TUI/UX** — output quality, streaming, error surfacing
12. **License + cost** — OSS? hosted? telemetry?
13. **Skills / prompt packs** — composable skill abstraction? user-defined skills with frontmatter? auto-discovery and matching? bundled skill libraries?
14. **CLI scriptability** — non-interactive/headless mode? stdin/stdout piping? machine-readable output (JSON)? exit codes? cron/CI-friendly invocation? slash commands?

### Phase 3 — Bake-off (4 tasks × 3 harnesses = 12 runs)

Each task uses an identical prompt across harnesses, saved in `runs/_prompts/{A,B,C,D}.md`. Run from a clean `git checkout` of `hermit-cma` each time.

**Task A — Bug fix.** Synthesize a bug: revert commit `783a487` (slack disconnect ordering) on a branch. Prompt: *"There's a bug where if Managed Agent disconnect fails, the database is left in an inconsistent state. Find and fix it. Tests should still pass."* Target: 5–10 min.

**Task B — Greenfield.** Prompt: *"Add a script `scripts/list_active_sessions.py` that connects to Supabase using the project's env config and prints active sessions as a table (session_id, slack_user, repo, last_activity). Include a `--json` flag."* Target: 10–15 min.

**Task C — Codebase Q&A.** Prompt: *"Walk me through the GitHub PAT + default-repo flow end-to-end: what happens from the moment a Slack user submits their PAT to when a session_plan can use it? Cite files and line numbers."* Target: 5–10 min.

**Task D — Multi-step refactor.** Prompt: *"Rename `NeedsGitHubLinkError` to `MissingGitHubCredentialError` everywhere it's used. Update raises, catches, and any string references. Tests should still pass."* Target: 10–15 min.

**Per-run capture:**

- Wall-clock time
- Token usage in/out (if API exposes it)
- Tool-call count + types
- Success Y/N (did it produce a runnable artifact / correct answer?)
- Quality 1–5 across: correctness, style match, follow-through
- Notable observations
- Final diff saved as `artifact.diff`
- Full transcript saved as `transcript.md`

### Phase 4 — Synthesis & deliverables

**`README.md`** — the report, written last:

1. TL;DR — 3–5 bullets, recommended harness, biggest surprises
2. Wiring summary — which harnesses needed shims, MiMo tool-call gotchas
3. Capability matrix — full table (link to `capability-matrix.md`)
4. Bake-off results — per-task table (rows = harness; cols = time / tokens / tool-calls / success / quality) + short prose per task
5. Cost commentary — MiMo vs Opus 4.7 numbers (verified in phase 1) + suite-level extrapolation
6. Recommendation — which harness for which use case, blockers, what to revisit
7. Open questions / follow-ups

**Podcast** — invoke `/investigate` with `README.md` as input. Generates conversation grounded in actual data from phase 3.

## Cost reference (preliminary, verify in phase 1)

| | Input $/M | Output $/M |
|---|---|---|
| Opus 4.7 (≤200k) | ~$15 | ~$75 |
| Opus 4.7 (1M context) | ~$30 | ~$150 |
| MiMo V2.5 Pro | ~$0.30–1.00 | ~$1–3 |

Order of magnitude: MiMo ~30–50× cheaper on input, ~50–75× cheaper on output. Phase 1 pins exact MiMo numbers from Xiaomi's API docs.

## Commit cadence

- Commit after phase 1 (wiring docs)
- Commit after phase 2 (capability matrix)
- Commit after each harness's bake-off completes (3 commits in phase 3)
- Final commit with README + podcast artifacts

## Risks & mitigations

- **MiMo tool-call format incompat with one or more harnesses.** Mitigation: document failure clearly; try one shim attempt; drop harness from bake-off if needed rather than expanding scope mid-investigation.
- **Copilot CLI BYO-endpoint mechanism turns out to be brittle / undocumented.** Mitigation: phase 1 is gating — failure here means harness is dropped or noted as "not viable for MiMo as of 2026-05-01."
- **Scope creep** during bake-off. Mitigation: strict per-task time targets; if a harness blows past 2× target, mark partial-success and move on.
- **Token-usage telemetry not exposed by all harnesses.** Mitigation: fall back to wall-clock + tool-call counts as primary metrics; note where token data is missing.

## Success criteria

- All three harnesses have a wiring doc with pass/fail recorded.
- Capability matrix complete for all 14 dimensions × 3 harnesses (cells may be "N/A" or "unclear" but not blank).
- Bake-off run for every (harness, task) cell that passed phase 1.
- README contains a defended recommendation tied to evidence in the run logs.
- Podcast generated from real run data via `/investigate`.
