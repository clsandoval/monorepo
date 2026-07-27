---
type: lesson
topic: Frontier of agentic harnesses & agent frameworks
started: 2026-07-05
goal: Stay at the FRONTIER and be able to referee it. Not intro material — Carlos owns Daimon (a
  managed-agents platform, i.e. Multica's sibling). Mastery = carry a framework-agnostic set of DESIGN
  AXES in his head, so he can read ANY harness/framework (pi, Hermes, Multica, Claude Code, Codex, …)
  and instantly locate its bets, its tradeoffs, its failure modes — and steal/reject design ideas for
  Daimon on the merits. Critic IN, design judgment OUT.
level: EXPERT practitioner. Diagnostic was strong across the board — defined the model/harness
  boundary precisely AND found the contested edge himself (provider-side reasoning = opaque rented
  harness); carves the space by stack layer (engine/vehicle/platform); genuine critic (steelmanned
  Hermes then found two real failure modes cold — legibility/audit + multi-tenant scoping). Gap is
  NOT judgment — it's (a) legible NAMES for patterns he already reasons about, (b) the horizontal
  design-axes frame to compare same-layer engines, (c) currency on specific frontier frameworks.
hours_estimate: 25    # revised DOWN from 40 — he already owns the fundamentals + the critic reflex.
  What he's buying: vocabulary, breadth/currency, and reps. Moving target (field ships weekly).
hours_done: 0.8
next_up: Rung 3 — context & memory (window packing, compaction/summarization, procedural vs episodic,
  the rolling-window problem). Natural continuation: he ended 7/27 on "plans should be written to an
  artifact with guarantees, not just context storage" — that IS the memory rung, enter straight through it.
  Warm-up (interleave): grade ONE new framework cold (OpenCode or Codex) on the 7/27 axes — reversibility
  vs containment, context vs action surface, who holds the plan. Rotation cap: Rung 2 has had 1 session,
  Rung 3 next, do NOT return to loop shapes for a third.
---

# Frontier of agentic harnesses & agent frameworks

The "sharpen the critic" track, in Carlos's wheelhouse. Core thesis of the field (2026): frontier
models have converged, so **the harness is the differentiator**. This lesson builds the durable
analytical spine — the axes along which harnesses vary — and uses live frameworks as case studies.

## Roadmap (time-based, breadth-first — survey goal, so sweep shallow then deepen)
- [x] Rung 1 — Landscape & the core thesis: who's who (pi/earendil, Hermes/Nous, Multica, Claude
      Code, Codex, OpenCode, Aider…), and the harness-vs-model boundary (~3h) — pi/Hermes/Multica/
      Codex mapped on both axes; core thesis (harness > converged model) established
- [~] Rung 2 — The agent loop: control flow designs (ReAct vs plan-execute vs while-tools; stop
      conditions; who holds the plan) (~4h) — CORE SPINE CLEARED 7/27 (4 points, all self-produced).
      Remaining: concrete loop-shape reps on real frameworks; multi-agent/subagent loops untouched.
- [ ] Rung 3 — Context & memory: window packing, compaction/summarization, procedural vs episodic
      memory, the rolling-window problem (~5h)
- [ ] Rung 4 — Tool interface: tool-calling API vs code-as-action (CodeAct) vs bash/computer-use;
      tool search/deferral (~4h)
- [ ] Rung 5 — Skills & self-improvement: Hermes-style skill docs, learned reuse, where it breaks (~4h)
- [ ] Rung 6 — Multi-agent orchestration: subagents, fan-out, delegation — when it helps vs hurts
      (the Daimon/Multica lens) (~5h)
- [ ] Rung 7 — Execution & safety: sandboxing, worktrees, permissions, VMs (~4h)
- [ ] Rung 8 — Evals: how you actually know a harness is good (SWE-bench, terminal-bench, harness
      ablations, the measurement traps) (~5h)
- [ ] Rung 9 — Frontier synthesis: read & referee 2-3 specific frameworks end-to-end against ALL
      axes; extract design moves for Daimon (~6h)

## Sessions (newest at top)
### 2026-07-05 · 22 min · Diagnostic + Rung 1 (landscape)
- Covered: full diagnostic (nailed model/harness boundary + found the provider-reasoning edge;
  carves space by stack layer; strong critic — steelmanned Hermes, found audit + multi-tenant
  failure modes cold). Rung 1 landscape: pi (engine/SDK), Hermes (vehicle, SQLite+skills+curator),
  Multica (platform, workspace-scoped skills, runs the others as agents), Codex (isolated sessions,
  OS sandbox) mapped on engine/vehicle × design axes (context/memory, tools, self-improvement).
- Design dialogue: pressure-tested his Daimon vision against the field. His architecture =
  COMPOSITION over inheritance (agent = fully-materialized bundle; no shared mutable memory → both
  failure modes dissolve). Propagation = git PRs to pinned repos (reuses version control as the
  compounding substrate — audit + scope + revert for free). Residual cost he accepted on purpose:
  compounding bounded by review throughput; long-tail cheap learnings re-paid every session.
- Coined TWO reusable referee lenses (his own, from the diagnostic): "can I SEE it (audit/
  provenance)?" + "can I BOUND it (scope/tenancy)?". Closing thesis: in a multi-team non-flat org,
  automatic compounding = a bug (uncontrolled cross-principal coupling); explicit reviewed transfer
  = the feature.
- Stopped at: end of Rung 1, design loop closed. Next: Rung 2 agent-loop shapes.
- Next: warm-up = apply the two lenses to a NEW framework (OpenCode/Aider), then Rung 2 control flow.
