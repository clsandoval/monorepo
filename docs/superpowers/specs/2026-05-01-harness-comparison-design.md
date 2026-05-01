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

### Provider details (verified 2026-05-01 via P1 curl probes)

- **Service:** MiMo Code (Xiaomi)
- **Model ID:** `mimo-v2.5-pro` (confirmed via `/v1/models` listing; other available IDs include `mimo-v2-pro`, `mimo-v2.5`, `mimo-v2-omni`, plus several TTS variants)
- **OpenAI-compatible endpoint:** `https://token-plan-sgp.xiaomimimo.com/v1` — `/chat/completions` works with standard schema; `/models` lists the catalog
- **Anthropic-compatible endpoint:** `https://token-plan-sgp.xiaomimimo.com/anthropic` — `/v1/messages` works with standard Anthropic schema (including `x-api-key` + `anthropic-version` headers)
- **Auth:** Bearer token (OpenAI shape) or `x-api-key` header (Anthropic shape) — same key works for both

### Key MiMo behaviors discovered in P1 (must be accommodated)

1. **MiMo V2.5 Pro is a reasoning model.** Responses contain a separate reasoning channel:
   - OpenAI shape: `choices[0].message.reasoning_content` populated, `content` may be empty until reasoning completes
   - Anthropic shape: `content` array contains `{type: "thinking", thinking: "..."}` blocks before any `text` block
   - Implication: harnesses that ignore the reasoning channel will look stalled or empty; harnesses that surface it should display it cleanly. **Phase 2 capability matrix gains a sub-row under "Tool calling" or a new dimension: "reasoning-channel handling."**
2. **`max_tokens` must be generous.** A 20-token cap was fully consumed by reasoning, returning empty `content` with `finish_reason: "length"`. Bake-off probes and runs should set `max_tokens` ≥ 4096 (or whatever the harness exposes as a sensible default) to leave room for reasoning + visible answer.
3. **Server-side prompt caching is active.** First "What is 2+2?" call reported `cache_read_input_tokens: 192` on the Anthropic side (and equivalent in `prompt_tokens_details.cached_tokens` on OpenAI side). Xiaomi appears to cache a system preamble automatically — useful, but means token-cost extrapolations should report both raw and cache-adjusted numbers.
4. **Both endpoints inflate prompt size.** "What is 2+2?" measured `prompt_tokens=263` (OpenAI) — Xiaomi injects an internal system prompt. Cost math should account for this floor.

### Tangent worth noting

The Anthropic-compatible endpoint means **Claude Code itself could be pointed at MiMo** via `ANTHROPIC_BASE_URL` override. Out of scope for this investigation, but a useful follow-up to revisit.

## Credentials handling

- API key stored in `~/.config/mimo-code/env` (chmod 600), exporting `MIMO_API_KEY`, `MIMO_BASE_URL`, `MIMO_ANTHROPIC_URL`.
- Never committed to the repo. Never written into transcripts, notes, or run logs.
- Each harness config references the env vars by name; redact in any captured config snippets.

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

Three escalating probes per harness:

- **P1 — Raw curl baseline (DONE 2026-05-01).** Both OpenAI-compat and Anthropic-compat endpoints returned valid responses for a hello-world prompt. See "Key MiMo behaviors discovered in P1" above. Performed once, not per harness.
- **P2 — Harness hello.** Minimal config file pointing the harness at MiMo (OpenAI-compat for opencode and pi-mono; Anthropic-compat likely the right path for Copilot CLI's BYO). Single chat turn, no tools, `max_tokens` ≥ 4096. Confirms harness can speak the protocol AND surfaces reasoning content sensibly.
- **P3 — Harness tool round-trip.** Single shell tool call (e.g., `pwd`), then a file read. Confirms MiMo's tool-call schema survives the round trip through the harness. **Most likely failure point.**

Each probe writes `wiring/<harness>-mimo.md` with: redacted config snippet, P2 result + raw response excerpt, P3 result + tool-call trace, pass/fail, any required shims, plus notes on how the harness handles MiMo's reasoning channel.

If P3 fails: capture the raw request/response, attempt one workaround (e.g., proxy that rewrites tool-call schema, or switch the harness to the Anthropic-compat endpoint), then either fix or drop the harness from bake-off with a clear note in the report.

Phase 1 also pins **exact MiMo pricing** (input/output $/M tokens, cache discount) from Xiaomi's developer docs for use in the cost section.

### Phase 1 status as of 2026-05-01 (handoff state)

Picking this up later. Current state:

- **Credentials:** stored in `~/.config/mimo-code/env` (chmod 600). Verified working for both endpoints.
- **Research dir:** scaffolded at `research/2026-05-01-harness-comparison/` with full subtree (`runs/{harness}/{taskA-D}`, `wiring/`, `podcast/`).
- **opencode:** already installed at `~/.opencode/bin/opencode`. P2/P3 not yet run.
- **pi-mono:** cloned to `/tmp/pi-mono` (TypeScript monorepo with `packages/`). Build/install **not yet performed**. Decision still open: `npm link` global vs. local `node packages/.../dist/cli.js` invocation.
- **GitHub Copilot CLI:** `gh` is installed (v2.83.2), but the standalone Copilot CLI binary and its BYO-endpoint mechanism are **unconfirmed**. Open question for next session: which Copilot CLI does the user mean (`gh copilot` extension vs. the newer standalone CLI), and what's the documented path to a non-GitHub model endpoint?
- **P1 results:** both endpoints work; key behavior findings documented above.

### Open questions for next session

1. **Copilot CLI BYO-endpoint mechanism** — env var? config file? proxy? user has indicated it's possible but the exact path is unspecified.
2. **pi-mono install style** — global link vs. local invocation (mostly aesthetic; either works).
3. **Reasoning-channel handling per harness** — do opencode / pi-mono / Copilot CLI render `reasoning_content` / `thinking` blocks, hide them, or stall on them? P2 will answer.
4. **Tool-call schema compatibility** — does MiMo emit OpenAI-shape `tool_calls` correctly when the prompt requests one? P3 will answer; if not, decide between the OpenAI-compat endpoint with a shim vs. switching to the Anthropic-compat endpoint where applicable.

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
15. **Reasoning-channel handling** — does the harness render, hide, or stall on `reasoning_content` / `thinking` blocks from MiMo? Added in response to P1 findings.

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
