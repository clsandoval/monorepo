---
type: spec
name: Dev Environment Setup
description: Exact restoration spec for Carlos's WSL + tmux + Claude Code + GSD setup. Snapshot date 2026-05-08.
---

# Dev Environment Restoration Spec

Snapshot date: **2026-05-08**
Host: WSL2 Ubuntu on Windows (`Linux 6.6.87.2-microsoft-standard-WSL2`)
User: `clsandoval` / `carlos.sandoval@pymc-labs.com` (work) · git commits as `mmrbeast2@gmail.com`

This is a complete recipe to rebuild the exact terminal + Claude Code + tmux setup from scratch. All referenced files live under `configs/` next to this README — copy them into place verbatim.

---

## 1. Terminal (Windows Terminal)

- **Profile**: WSL Ubuntu-22.04 (`{17bf3de4-5353-5709-bcf9-835bd952a95e}`) set as default
- **Color scheme**: `Solarized Light` (built-in, no custom edits)
- **Font**: `JetBrains Mono`, weight `semi-bold`, cellWidth `0.6`
- **Foreground override**: `#073642` (Solarized base02)
- **Selection background**: `#268BD2` (Solarized blue)
- **Keybindings**: `ctrl+c` copy, `ctrl+v` paste, `ctrl+shift+f` find, `alt+shift+d` split-pane (duplicate)

File: `configs/windows-terminal-settings.json` → drop into
`%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json`

JetBrains Mono install: download from jetbrains.com/mono and install at OS level.

---

## 2. Shell (bash)

- `~/.bashrc` — stock Ubuntu bashrc plus appended lines for cargo, nvm, fly, pixi, opencode, and `alias claude="claude --dangerously-skip-permissions"`
- `~/.bash_aliases` — `claude-switch` helper
- `~/.gitconfig` — name `clsandoval`, email `mmrbeast2@gmail.com`, push.default current, gh credential helper

Files: `configs/bashrc`, `configs/bash_aliases`, `configs/gitconfig`

Required toolchains (installed in this order):
1. `nvm` → Node v20.19.5 (Claude hooks reference this exact path)
2. Rust via rustup (`~/.cargo/env`)
3. `pixi` (`~/.pixi/bin`)
4. `flyctl` (`~/.fly/bin`)
5. `opencode` (`~/.opencode/bin`) — needs `OPENCODE_API_KEY` env var (rotate, do **not** commit the value from bashrc as-is)
6. `gh` CLI (used as git credential helper)
7. Claude Code CLI (`npm i -g @anthropic-ai/claude-code` or equivalent)

⚠️ The `OPENCODE_API_KEY` currently in `configs/bashrc` is a real key — **rotate it before committing this directory to a public repo**, or strip it out of the saved copy.

---

## 3. tmux

- **Prefix**: backtick `` ` `` (not C-b)
- **Splits**: `prefix |` vertical, `prefix -` horizontal, both inherit cwd
- **Pane nav**: vim-style `hjkl`; resize repeatable with capital `HJKL`
- **Window nav**: `Alt-[` / `Alt-]` (no prefix)
- **Mouse**: on
- **History limit**: 50000
- **Copy mode**: vi keys; `y` pipes selection to `clip.exe` (Windows clipboard)
- **Status bar**: bottom; left `session │`, right `HH:MM Day DD-Mon`; current window highlighted yellow (`#ffd75f`)

### Auto-logging (the bit you care about)

Every pane is auto-piped to `~/.tmux-logs/YYYY-MM-DD/<session>-<window>-<pane>.log` via session/window/split hooks. After installing the config, run `prefix W` once to arm logging on already-running panes. `prefix S` snapshots the current pane's full 50k scrollback to a timestamped file.

### Plugins (TPM)

- `tmux-plugins/tpm`
- `tmux-plugins/tmux-sensible`
- `tmux-plugins/tmux-resurrect` — `@resurrect-capture-pane-contents on`
- `tmux-plugins/tmux-continuum` — `@continuum-restore on` (auto-restores last session on tmux server start; this is what makes pane contents survive reboots)
- `tmux-plugins/tmux-yank`

Install:
```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
cp configs/tmux.conf ~/.tmux.conf
tmux source ~/.tmux.conf
# inside tmux: prefix + I  (capital i) to install plugins
```

File: `configs/tmux.conf`

---

## 4. Claude Code

### Settings (`~/.claude/settings.json`)
Key choices:
- `model: opus[1m]`, `effortLevel: medium`, `alwaysThinkingEnabled: true`
- `theme: light`, `skipDangerousModePermissionPrompt: true`
- `statusLine`: runs `bash ~/.claude/statusline-command.sh`
- Enabled plugins: `document-skills`, `pyright-lsp`, `frontend-design`, `superpowers` (both marketplaces), `cheerful`
- Extra marketplace: `nuts-and-bolts-ai-cheerful-plugin` from `nuts-and-bolts-ai/cheerful-plugin`

File: `configs/claude/settings.json`

### Statusline
Custom bash statusline showing: context % bar (green/yellow/red), 5h rate-limit countdown, git branch (magenta), and cwd (light-green pill). Also flips Windows Terminal background color via OSC 11 escape between idle (default) and running (`#f0f3f7` very light grey) — driven by `~/.claude/.statusline-state` which is updated by the `Stop` and `UserPromptSubmit` hooks.

File: `configs/claude/statusline-command.sh` → `~/.claude/statusline-command.sh` (chmod +x)

### Hooks (`~/.claude/hooks/`)

| Hook file | Event(s) | Purpose |
|---|---|---|
| `inject-tmux-scrollback.sh` | SessionStart | **The "tmux restore" feature**: captures last ~200 lines of the current tmux pane and injects as `additionalContext` so Claude sees what you were doing before the session started. Capped at 9000 chars. |
| `gsd-session-state.sh` | SessionStart | GSD plugin session bookkeeping |
| `gsd-check-update.js` | SessionStart | Checks GSD plugin for updates |
| `gsd-context-monitor.js` | PostToolUse (Bash/Edit/Write/MultiEdit/Agent/Task) | Tracks context burn |
| `gsd-read-injection-scanner.js` | PostToolUse (Read) | Scans Read output for prompt-injection attempts |
| `gsd-phase-boundary.sh` | PostToolUse (Write/Edit) | GSD phase boundary detection |
| `gsd-prompt-guard.js` | PreToolUse (Write/Edit) | Guards against prompt-leak edits |
| `gsd-read-guard.js` | PreToolUse (Write/Edit) | Enforces read-before-edit |
| `gsd-workflow-guard.js` | PreToolUse (Write/Edit) | GSD workflow enforcement |
| `gsd-validate-commit.sh` | PreToolUse (Bash) | Validates `git commit` invocations |
| `gsd-statusline.js` | (lib for statusline) | Helpers |
| `gsd-update-banner.js` | (lib) | Update banner rendering |
| `gsd-check-update-worker.js` | (lib, child proc) | Background update check |
| **Stop hook (inline)** | Stop | Writes `idle` to `.statusline-state`, resets terminal bg via OSC 111 |
| **UserPromptSubmit (inline)** | UserPromptSubmit | Writes `running` to `.statusline-state`, sets terminal bg `#f0f3f7` via OSC 11 |

Files: `configs/claude/hooks/*` → `~/.claude/hooks/` (chmod +x the .sh files; node hooks are invoked with explicit `~/.nvm/versions/node/v20.19.5/bin/node` path so that exact node version must exist).

### GSD plugin

The hooks above are part of the GSD (get-shit-done) plugin / superpowers marketplace. After a fresh Claude Code install, run `/plugin install superpowers` from the official marketplace; the hook scripts here are the canonical versions in use as of 2026-05-08.

---

## 5. Restore procedure (clean WSL)

```bash
# 1. Ubuntu-22.04 from Microsoft Store, then in WSL:
sudo apt update && sudo apt install -y build-essential git curl jq tmux

# 2. nvm + node 20.19.5
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh && nvm install 20.19.5 && nvm alias default 20.19.5

# 3. rust, pixi, fly, gh, opencode (as above)

# 4. Claude Code
npm i -g @anthropic-ai/claude-code

# 5. Drop configs from this repo into place
REPO=~/cs/monorepo/docs/setup/configs
cp $REPO/tmux.conf ~/.tmux.conf
cp $REPO/bashrc ~/.bashrc
cp $REPO/bash_aliases ~/.bash_aliases
cp $REPO/gitconfig ~/.gitconfig
mkdir -p ~/.claude/hooks
cp $REPO/claude/settings.json ~/.claude/settings.json
cp $REPO/claude/statusline-command.sh ~/.claude/statusline-command.sh
cp $REPO/claude/hooks/* ~/.claude/hooks/
chmod +x ~/.claude/statusline-command.sh ~/.claude/hooks/*.sh

# 6. tmux plugins
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
tmux new -s main \; source ~/.tmux.conf
# inside tmux: prefix + I  to install plugins, then prefix + W to arm logging

# 7. Windows Terminal (Windows side)
# copy configs/windows-terminal-settings.json into:
# %LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json

# 8. Claude Code login + plugin install
claude
# /login, then enable plugins per settings.json (document-skills, pyright-lsp,
# frontend-design, superpowers x2, cheerful)
```

---

## 6. What's NOT captured here (snapshot scope)

- Project source under `~/cs/` — recovered from git remotes, not this spec
- MCP server configs (`.mcp.json` per repo) — repo-local, lives in each project
- Per-project `.claude/settings.local.json` — repo-local
- Secrets: SSH keys, GitHub auth, API keys (`.cheerful/`, `.fly/`, `.codex/`, `OPENCODE_API_KEY`) — must be re-issued, never copy
- VS Code / Cursor / IDE settings — separate (lives in `~/.cursor/`, `~/.cursor-server/`)
- Bash history — not portable
- Telegram NanoClaw bot — runs on Fly.io, see `automations/nanoclaw/`

## 7. Refreshing this spec

When the setup drifts, re-run the copy commands in §1, §3, §4 above (or just re-copy everything under `configs/`) and bump the snapshot date at the top.
