---
type: spec
name: Roborev + Xiaomi MiMo Setup
description: How roborev is wired to run background code reviews via Xiaomi MiMo (mimo-v2-flash) on every commit, across all ~/cs repos. Snapshot date 2026-06-04.
---

# Roborev Code Review — Xiaomi MiMo Setup

Snapshot date: **2026-06-04**
Host: WSL2 Ubuntu, user `clsandoval`

[Roborev](https://github.com/kenn-io/roborev) runs background code reviews on every commit. We route the review/fix model to **Xiaomi MiMo (`mimo-v2-flash`)** through its Anthropic-compatible endpoint, using Claude Code as the agent harness. Your interactive Claude Code stays on Anthropic; only the background reviews use MiMo.

## How it works

```
git commit ─► .git/hooks/post-commit ─► roborev daemon (127.0.0.1:7373)
                                              │
                       daemon spawns `claude` in headless mode, with
                       ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN pointed at Xiaomi
                                              │
                       MiMo reviews the diff ─► findings stored in roborev's DB
```

The daemon invokes Claude Code as:
`claude -p --verbose --output-format stream-json --model mimo-v2-flash --effort high --allowedTools Read,Glob,Grep`
The reviewer is read-only (Read/Glob/Grep) — it sees the commit diff and may read repo files to verify claims, but cannot edit or run code during a review.

## Install (one-time, machine-wide)

```bash
curl -fsSL https://roborev.io/install.sh | bash   # -> ~/.local/bin/roborev (v0.56.0)
roborev skills install                            # -> ~/.claude/skills/roborev-*
```

## Global config — `~/.roborev/config.toml`

```toml
default_agent  = 'claude-code'
review_model   = 'mimo-v2-flash@https://api.xiaomimimo.com/anthropic'
fix_model      = 'mimo-v2-flash@https://api.xiaomimimo.com/anthropic'
claude_code_cmd = '/home/clsandoval/.nvm/versions/node/v20.19.5/bin/claude'  # absolute, so the daemon finds claude regardless of PATH
max_workers    = 4
```

The `<model>@<base_url>` syntax is a roborev `claude-code`-agent feature: the URL is forwarded to `ANTHROPIC_BASE_URL`. Only the `claude-code` agent supports it.

## Auth — proxy token

Roborev passes `ROBOREV_CLAUDE_PROXY_TOKEN` to the spawned agent as `ANTHROPIC_AUTH_TOKEN`. It lives in `~/.bashrc`:

```bash
export ROBOREV_CLAUDE_PROXY_TOKEN=<MiMo API key>
```

The key value is **not** stored here. Source of truth: `~/cs/neo4j-graphrag/.env` → `MIMO_API_KEY`
(also `MIMO_ANTHROPIC_BASE_URL=https://api.xiaomimimo.com/anthropic`). The daemon inherits this token because it's started from a shell that sourced `~/.bashrc`.

## Per-repo enablement

The model/agent/token are all global, so each repo needs only:

```bash
cd <repo> && roborev init      # installs post-commit + post-rewrite hooks, registers repo
```

Enabled repos (as of snapshot, all under `~/cs`): `neo4j-graphrag`, `monorepo`, `daimon-cma-open-source`, `lakbai`, `podplay-data`, `daimon`, `cheerful`, `cheerful-cma`. None has a per-repo `.roborev.toml` — they all inherit the global MiMo default. (`neo4j-graphrag` has a redundant committed `.roborev.toml` documenting the choice.)

## Daily use

- Commit as normal → review runs in the background.
- See findings: `roborev tui`, `roborev show HEAD`, `roborev status`, or ask Claude (`/roborev-review`, `/roborev-fix`, etc.).
- Reviews are **pull, not push** — nothing interrupts your session; you/Claude fetch findings when you want them.

## Cost

MiMo-v2-flash pricing: **$0.10/M input, $0.30/M output, $0.01/M cache-read**. Observed ~**$0.002 per review** (~50× cheaper than Anthropic rates). Authoritative usage: platform.xiaomimimo.com.

## Known caveat — rate limits

Xiaomi rate-limits (HTTP 429) under burst load. Firing many reviews at once (e.g. 8 repos × 4 workers) trips it; Claude Code auto-retries and usually recovers, but outright failures can happen under heavy bursts. Normal one-commit-at-a-time use does not hit this. Mitigation if needed: lower `max_workers` to 2.

## Privacy

Every review sends the commit diff (and any files the reviewer chooses to read) to Xiaomi's servers. Fine for these projects; reconsider before pointing roborev at anything sensitive.

## Restore checklist

1. `curl -fsSL https://roborev.io/install.sh | bash`
2. Recreate `~/.roborev/config.toml` fields above (or `roborev init --agent claude-code` then edit).
3. Ensure `ROBOREV_CLAUDE_PROXY_TOKEN` export is in `~/.bashrc` (value from `neo4j-graphrag/.env`).
4. `roborev skills install`
5. `roborev init` in each repo.
6. Verify: commit something, then `roborev log <job>` and confirm `"model":"mimo-v2-flash"`.
