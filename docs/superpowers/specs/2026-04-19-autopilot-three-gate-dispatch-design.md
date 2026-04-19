# Autopilot Three-Gate Dispatch — Design

**Date:** 2026-04-19
**Status:** Draft
**Scope:** Refine `autopilot`, `podcast`, and `podcast-pimsleur` skills around a disciplined three-gate dispatch model.

## Problem

Current workflow assumption was "decide what goes into the session, then dispatch." Actual workflow is different: work locally until time runs out, then **finish the session in the cloud**. Dispatch is a session handoff, not a clean launch.

Every dispatch requires exactly three things, and the current `autopilot` skill allows any of them to be skipped. The three are non-negotiable:

1. **Credentials** — env/secrets the remote needs to act
2. **Outcome checklist** — concrete done-criteria the remote can self-verify against
3. **Behavior / process** — how to approach the work: exploration vs. exploitation path, decision heuristics, when to stop

Gates 2 and 3 together form **the brief**. Gate 1 is a pre-launch check.

## Architecture

Autopilot becomes a three-gate dispatch pipeline. No launch unless all three clear.

```
interview → draft brief → context pointers → payload manifest →
  user approves → verify credentials → launch
       (Gate 2+3 assembly)                    (Gate 1 check)
```

Each dispatch is a directory under `autopilot/briefs/YYYY-MM-DD-<slug>/` containing:

- `outcome.md` — checklist of done-criteria
- `behavior.md` — free-form process / exploration-exploitation path
- `context.md` — user-curated pointers to local session state (plan files, commits, notes)
- `payload.json` — resolved list of files mounted into the remote session
- `credentials.json` — results of the credentials check (what was verified, pass/fail)
- `dispatch.log` — launch record (timestamp, remote session ID, exit)

The directory is the permanent local record of that dispatch. `autopilot/briefs/` is **gitignored** — briefs are personal working state and may contain paths or references the skill repo shouldn't track.

Autopilot's core is skill-agnostic. Each remote skill (`remote-skills/podcast.md`, `podcast-pimsleur.md`, `investigate.md`) declares its own credentials, interview, and payload. Autopilot reads the selected remote skill and drives the flow uniformly.

## Remote-Skill Manifest Format

Each `remote-skills/<name>.md` gains three declarations in frontmatter:

```yaml
---
name: podcast
description: ...
credentials:
  - name: ANTHROPIC_API_KEY
    check: env
    required: true
  - name: FAL_KEY
    check: env
    required: true
interview:
  - id: topic_source
    prompt: "What's the source artifact? (path to spec/plan/doc)"
  - id: format
    prompt: "Standard podcast or pimsleur-style?"
  - id: episode_number
    prompt: "Episode number in the series?"
payload:
  - path: scripts/generate.sh
    required: true
  - path: scripts/verify-dialogue.py
    required: true
---

# (existing skill body: system prompt, tools, etc.)
```

### Credentials check types

- `env` — verify env var is set locally (for values passed into the remote)
- `remote-secret` — verify a named secret exists in the remote agent's environment (API call to the managed-agents service)
- `file` — verify a local file path exists (for artifacts the remote needs mounted)

Any `required: true` failure is a hard block with an actionable error (e.g., "Set `FAL_KEY` in env" or "Create remote secret named X").

### Interview questions

Free-form answers drive the `outcome.md` and `behavior.md` drafts. The skill synthesizes answers into the two files, shows them to the user for edit/approval, then validates both are non-empty before advancing.

### Payload

Declared per-skill files that must always be mounted (e.g., scripts the remote needs to run). Merged with user-curated context pointers to form the final payload list.

## Dispatch Flow

The `/autopilot` entry executes these steps in order. None are skippable; the skill refuses shortcuts and names the missing gate.

1. **Select remote skill** — menu listing `remote-skills/*.md`.
2. **Interview** — walks the manifest's `interview:` questions one at a time.
3. **Draft brief** — synthesizes answers into `outcome.md` and `behavior.md` under `briefs/YYYY-MM-DD-<slug>/`.
4. **Context pointers** — prompts the user for paths/links to local artifacts the remote should read. User curates the list (no auto-capture). Written to `context.md`.
5. **Payload manifest** — resolves `context.md` pointers plus the skill's declared `payload:` into a concrete file list. Displays the list, user confirms or edits. Missing files = hard block. Written to `payload.json`.
6. **User approval** — shows brief files + payload together. Edit cycle until approved.
7. **Credentials gate** — runs each check from the manifest. Displays a pass/fail table. Any required failure = hard block. Results written to `credentials.json`.
8. **Launch** — constructs the remote session from (skill body + brief + context + payload), uploads payload files, dispatches. Records session ID to `dispatch.log`.
9. **Post-launch** — prints remote session URL/ID. Brief dir remains as the permanent record.

## Local Podcast Skill Alignment

`.claude/skills/podcast/SKILL.md` adopts outcome-checklist thinking so the local and remote podcast flows stay conceptually in sync. There is no credentials gate and no payload step locally, but before audio generation the skill produces a short inline `outcome.md`:

- What's the source artifact?
- Episode number / series context?
- Done criteria (e.g., "3-segment dialogue, both voices clean, MP3 in `data/podcasts/`, committed")

User approves, then generation proceeds. This removes the cognitive switch when a session moves from local to remote mid-way.

## Migration

- **Delete** `autopilot/intake.md`, `autopilot/status.md`
- **Create** `autopilot/briefs/` (gitignored)
- **Update** `autopilot/.gitignore` to include `briefs/`
- **Update** `autopilot/SKILL.md` to document the three-gate flow and the new dispatch steps
- **Update** `autopilot/remote-skills/{podcast,podcast-pimsleur,investigate}.md` to add `credentials:`, `interview:`, and `payload:` sections
- **Update** `.claude/skills/podcast/SKILL.md` to add the outcome checklist step before generation
- **Audit** `autopilot/scripts/` for references to `intake.md` / `status.md` and update or remove

## Non-Goals

- No changes to the managed-agents service itself
- No structured template for `behavior.md` (remains free-form per user preference)
- No auto-capture of local session state; context pointers are user-curated
- No changes to `pimsleur` beyond the manifest additions it inherits as a `remote-skills/*.md` file

## Open Questions

None at design time. Any ambiguities should be raised during plan writing.
