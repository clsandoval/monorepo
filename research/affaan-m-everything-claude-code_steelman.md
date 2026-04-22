---
repo: affaan-m/everything-claude-code
slug: affaan-m-everything-claude-code
stars_at_research: 164029
pushed_at: 2026-04-21
sources:
  - https://api.github.com/repos/affaan-m/everything-claude-code/readme
  - https://api.github.com/repos/affaan-m/everything-claude-code/git/trees/main
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/package.json
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/.claude-plugin/plugin.json
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/.mcp.json
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/scripts/ecc.js
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/scripts/install-apply.js
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/hooks/hooks.json
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/ecc2/Cargo.toml
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/ecc2/src/main.rs
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/ecc2 (dir listing)
  - https://api.github.com/repos/affaan-m/everything-claude-code/contents/skills (dir listing)
  - https://api.github.com/repos/affaan-m/everything-claude-code/commits
researched_at: 2026-04-23
---

## What this repo actually achieves

`everything-claude-code` (ECC) is a packaged configuration and tooling surface for agentic coding harnesses — primarily Claude Code, but with first-class shims for Codex (CLI and app), Cursor, OpenCode, Gemini, Kiro, Trae, and Codebuddy. The repo's unit of delivery is not a runtime binary but a *layered content tree*: 38 agents, 156–183 skills (the top-level `skills/` tree lists 183 directories), 72 legacy command shims, a `hooks/hooks.json` file of PreToolUse/PostToolUse hook commands, per-language `rules/` trees (`common`, `typescript`, `python`, `golang`, `java`, `kotlin`, etc.), and per-harness directories (`.claude-plugin/`, `.codex-plugin/`, `.cursor/`, `.opencode/`, `.gemini/`, `.trae/`, `.kiro/`, `.codebuddy/`) that adapt the same content to each host's native extension schema.

The author ships this as two npm packages — `ecc-universal` (the installer and content) and `ecc-agentshield` (a security-scan surface) — plus a Claude Code plugin registered at `.claude-plugin/plugin.json`. A selective-install CLI (`scripts/ecc.js`) resolves install profiles and component IDs against `manifests/` and copies only the chosen subset into `~/.claude/`, `./.cursor/`, or `./.agent/`. Install state is tracked in a per-target state file, enabling `ecc list-installed`, `ecc doctor`, `ecc repair`, and `ecc uninstall`. Alongside the Node installer, an alpha Rust control-plane (`ecc2/`, crate `ecc-tui`) provides a Ratatui-based TUI dashboard with `start`, `sessions`, `delegate`, `assign`, `drain-inbox`, `template`, `status`, `stop`, `resume`, `daemon` subcommands — effectively an external orchestrator that spawns and tracks agent sessions, with a SQLite-backed session store and git worktree integration.

In other words: ECC treats "agent harness" as a configurable platform and ships the missing management layer — curated content, a coherent install/uninstall system, cross-harness adapters, runtime hooks, and (in 2.0 alpha) an out-of-process session dashboard.

## Six-axis walk (advocating)

### 1. Compute topology

The primary ECC lives in-process inside whichever harness the user runs (Claude Code, Codex, Cursor, etc.). Skills, commands, and rules are static content loaded by the harness itself; hooks are spawned as short-lived child processes by the harness at PreToolUse/PostToolUse boundaries, as declared in `hooks/hooks.json`. Each hook entry is an inline `node -e` bootstrap that resolves `CLAUDE_PLUGIN_ROOT` across several plausible install paths (`~/.claude/`, `~/.claude/plugins/ecc@ecc`, `~/.claude/plugins/marketplace/...`, the `plugins/cache/<name>/<ver>` tree) and then `require()`s `scripts/hooks/plugin-hook-bootstrap.js`. This is a deliberate choice: hooks have no stable cwd across harness versions, so the inline resolver lets one `hooks.json` work under multiple install modes.

The new `ecc2/` crate (`ecc-tui`) adds an optional out-of-process topology: a `daemon` subcommand plus a TUI `dashboard`, with TCP listener scaffolding (`std::net::TcpListener` is imported in `main.rs`) for control-plane IPC. The defense for having both is that harness-internal hooks are the right level for per-tool-call policy, while long-running orchestration (worktrees, delegated sessions, inbox draining) needs a supervisor that outlives any single harness process. `ecc2` is that supervisor, still marked as alpha.

### 2. LLM locus

ECC does not embed an LLM client — it is content and policy layered onto whichever harness the user already trusts. Provider selection is therefore the *harness's* concern (Claude Code talks to Anthropic; Codex talks to OpenAI; Cursor/OpenCode have their own routing). ECC's contribution at this axis is the `/model-route` command and a "harness performance system" framing: skills like `cost-aware-llm-pipeline`, commands like `/harness-audit`, and runtime knobs (`ECC_HOOK_PROFILE`, `ECC_DISABLED_HOOKS`) that let a user tune cost/latency behavior across providers without editing harness internals. The defensible stance: rather than re-implement provider routing and inherit every host's auth bugs, ECC rides on top and adds an *advice* layer.

Rate-limit handling is similarly delegated to the harness; ECC's rules and skills instead push the agent toward patterns (model selection, system-prompt slimming, content-hash caching as a skill, background processes) that reduce the chance of hitting limits in the first place.

### 3. Tool mechanics

The agent-facing primitives in ECC are built from what the harness already provides (Bash, Read, Write, Edit, MultiEdit, MCP tool calls). ECC's additions are (a) *framing* — 72 slash commands in `commands/` and skills in `skills/` that package multi-step tool recipes, and (b) *guardrails* — hooks in `hooks/hooks.json` that intercept tool calls. From the hook file alone: `pre:bash:dispatcher` runs a consolidated Bash preflight (quality checks, tmux, push, "GateGuard"); `pre:write:doc-file-warning` warns on non-standard doc files; `pre:edit-write:suggest-compact` nudges compaction; `pre:config-protection` blocks edits to linter/formatter configs ("steers the agent to fix code instead of weakening configs"); `pre:mcp-health-check` validates MCP server health before use; `pre:governance-capture` records secrets/policy/approval events when `ECC_GOVERNANCE_CAPTURE=1`; `pre:observe` asynchronously feeds the `continuous-learning-v2` skill on every tool call. Output framing is left to the harness; ECC's value-add is the *permission-and-policy* layer between intent and execution.

The permission model stacks three things: the harness's native allow/deny, the `ECC_HOOK_PROFILE=minimal|standard|strict` dial, and `ECC_DISABLED_HOOKS` for surgical disabling. This is a coherent story — one environment variable to change posture globally, without editing hook files.

### 4. Extension loading (skills + MCP)

Skills are loaded by the harness from the `skills/` tree — 183 subdirectories at `skills/` root, each a self-describing skill. The plugin manifest at `.claude-plugin/plugin.json` declares `"skills": ["./skills/"]` and `"commands": ["./commands/"]`, so for the plugin install path discovery is simply "scan these roots." For the manual install path, the `ecc` CLI (`scripts/ecc.js` → `scripts/install-apply.js`) resolves a profile/module set against `manifests/` and copies only the chosen skills into `~/.claude/`. The manifest-driven pipeline is a real architectural choice: the repo ships one content tree, but two selection lenses (the plugin loads everything; the CLI loads a profile), with idempotent `plan` → `apply` → `list-installed` → `doctor` → `repair` → `uninstall` operations.

MCP server resolution is declared in `.mcp.json` at the repo root: `github`, `context7`, `memory`, `playwright`, `sequential-thinking` all pinned via `npx -y <pkg>@<version>`, and `exa` as an `http` endpoint. Version pinning in `.mcp.json` is defensible — MCP servers change behavior quickly, and a loose `@latest` would make hook-driven flows non-reproducible. Error handling on load failure is explicit at `pre:mcp-health-check`, which is attached to the `*` matcher so every tool call first validates MCP posture before proceeding.

### 5. Context & memory strategy

Context engineering is the core pitch of the repo — the README's three guides ("Shorthand", "Longform", "Security") advertise token optimization, memory persistence, and continuous learning as the main value. Concretely: `pre:edit-write:suggest-compact` nudges the agent to compact at logical intervals; the `continuous-learning-v2` skill runs `skills/continuous-learning-v2/hooks/observe.sh` on *every* tool call (async, 10s timeout) so observations accumulate without blocking; a `/sessions` command surface and `ecc sessions` CLI read from a SQLite state store (also used by `ecc2` for session tracking). Instincts (in older releases) and skills (v2) are the persisted pattern layer: `/instinct-import` and `instinct-based learning with confidence scoring, import/export, evolution` are called out in v1.2.0 release notes.

The steelman here: context is pinned at the rules layer (`rules/common`, `rules/typescript`, etc., copied verbatim into the harness's rules directory), summarized at the skill layer (each skill is a short, retrievable recipe), and evicted by compaction hooks. Persistence is a SQLite file, not a vector DB — reasonable, because the retrieval surface is small (hundreds of skills, not millions of documents) and SQL keyword/metadata filters are sufficient.

### 6. Scaling topology

For a single developer, scaling is single-process: one harness, one repo, hooks fire per tool call. For multi-agent work, two escape hatches exist. First, the PM2 integration (v1.4.0) with `/pm2`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow` commands plus the `ccg-workflow` runtime treats each sub-agent as a PM2-managed process. Second — and this is where ECC 2.0 is placed — the `ecc2` Rust crate introduces `start` / `delegate` / `assign` / `drain-inbox` / `template` / `sweep` semantics (visible in `ecc2/src/main.rs` as `clap` subcommands), backed by a SQLite session store, git worktree management (`git2 = "0.20"`), and a daemon mode. The model is: a "lead session" has an inbox of task handoffs; `drain-inbox` routes them through an "assignment policy" that either reuses an existing delegate or spawns a new one (each in its own worktree, each recorded in the state store). The reference deployment is local — no queue, no serverless, no multi-tenant — but the building blocks (daemon, TCP listener imports, SQLite, worktree policy) are the honest starting points for a local-first orchestrator. The defense for not shipping Kubernetes manifests: agent harnesses run on developer laptops, and the scaling problem there is "coordinate N local processes across N worktrees without losing state," which is exactly what `ecc2` targets.

## The contribution

ECC's contribution is primarily *curation with structural teeth*. The raw ideas — skills, slash commands, hooks, per-language rules, MCP servers — are all first-party to each harness; what ECC adds that wasn't sitting in one place before is (a) a large, versioned, release-noted catalog of those artifacts (38 agents, 156–183 skills, 72 commands, hooks, rules for ten languages), (b) a cross-harness packaging layer so the same content installs into Claude Code, Codex, Cursor, OpenCode, Gemini, Kiro, and Trae via per-harness adapter directories and scripts like `scripts/codex/merge-codex-config.js` and `scripts/gemini-adapt-agents.js`, (c) a manifest-driven selective installer (`ecc`, `ecc-install`) with plan/apply/doctor/repair/uninstall symmetry that most individual config repos don't bother with, and (d) an emerging out-of-process control plane (`ecc2/`, Rust, Ratatui TUI, SQLite sessions, git worktree orchestration) that pushes beyond "config repo" into "local session supervisor." Calling it "curation" is not a dismissal — the value of a coherent, installable, release-noted, multi-harness config pack with first-class uninstall is real, and the repo is one of the few places that treats agent-harness configuration as a product surface rather than a personal dotfile.
