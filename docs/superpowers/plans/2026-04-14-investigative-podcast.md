# Investigative Podcast Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new `/investigate` skill that reads a spec, executes its testable steps for real, and generates a podcast grounded in actual results.

**Architecture:** Single SKILL.md file at `.claude/skills/investigate/SKILL.md`. No helper scripts — the skill instructs Claude to use bash, existing tools, and the existing `podcast/scripts/generate.sh` for audio. All investigation orchestration happens via Claude following the skill instructions.

**Tech Stack:** Claude Code skill (markdown), ElevenLabs TTS (via existing generate.sh), bash

---

### Task 1: Create the Skill Directory and SKILL.md

**Files:**
- Create: `.claude/skills/investigate/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/investigate
```

- [ ] **Step 2: Write the SKILL.md frontmatter and header**

Write the skill file with frontmatter that registers it as a separate skill from `/podcast`:

```markdown
---
name: investigate
description: |
  Investigative podcast — reads a spec, actually executes the pipeline steps, collects
  real artifacts, then generates a podcast grounded in actual results. Unlike /podcast
  which comments on docs, /investigate runs the code and narrates what happened.
  Triggers: "investigate", "investigate this spec", "run and podcast"
---

# Investigative Podcast — Spec-to-Execution-to-Audio

Read a spec, execute every testable step, collect all artifacts, then generate a podcast
dialogue grounded in real results. The hosts narrate a completed investigation as if
discovering things live.

## Invocation

\```
investigate <filepath>
\```

The argument is a path to a markdown file (spec, plan, design doc).
```

- [ ] **Step 3: Write Phase 0 — Credential Gate**

Append the credential gate section. This is the hard gate — nothing runs until all credentials are confirmed:

```markdown
## Phase 0 — Credential Gate

Before ANY execution, you MUST:

1. Read the spec at the given filepath
2. Identify every external service, API, and tool the spec references:
   - API keys (look for env vars like `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `REPLICATE_API_TOKEN`, etc.)
   - CLI tools (look for commands like `yt-dlp`, `ffmpeg`, `python3`, etc.)
   - Data files (look for paths like `data/routes.json`, config files, etc.)
3. Check which credentials are already available:
   - Source `.env` files: `set -a && source .env && set +a` (project root and spec's project dir)
   - Check env vars: `echo "${VAR_NAME:+SET}"`
   - Check CLI tools: `which <tool>`
   - Check data files: `test -f <path>`
4. For EVERY missing credential that you cannot create yourself, STOP and ask the user
   - List what's missing with clear instructions on how to get each one
   - Do not proceed until the user provides them
5. Validate every credential with a smoke test:
   - API keys: make a minimal API call (ping, list models, etc.)
   - CLI tools: run `--version`
   - Data files: verify they parse correctly
6. Estimate the investigation cost:
   - Count the number of API calls the investigation will make
   - Estimate cost per call based on the service
   - Report total estimated cost to the user
7. Present a summary and wait for user confirmation:

```
Credentials: 4/4 validated
  [OK] ANTHROPIC_API_KEY — Claude API
  [OK] GOOGLE_API_KEY — Gemini API
  [OK] REPLICATE_API_TOKEN — SAM 3
  [OK] yt-dlp — v2024.12.06

Estimated cost: ~$3-5
  - Claude API: ~120 calls × $0.015 = $1.80
  - Gemini API: ~60 calls × $0.005 = $0.30
  - Replicate SAM 3: ~60 calls × $0.02 = $1.20
  - ElevenLabs TTS: ~50 lines × $0.01 = $0.50

Proceed with investigation? (y/n)
```

**HARD GATE:** Do not proceed to Phase 1 until the user confirms. No skipping. No guessing.
```

- [ ] **Step 4: Write Phase 1 — Investigation**

Append the investigation phase:

```markdown
## Phase 1 — Investigation

### Step Extraction

Read the spec and extract an ordered list of testable steps. Look for:
- Code blocks with runnable commands (bash, python)
- API call examples with prompts and expected responses
- "How to validate" or "smoke test" sections
- Pipeline stages with inputs and outputs
- Success criteria with measurable thresholds

For each step, define:
- **Name:** What this tests
- **What to run:** The actual command or code
- **Expected outcome:** What the spec says should happen
- **Timeout:** 5 minutes default
- **Depends on:** Which previous steps must complete first

### Setting Up the Investigation Directory

Before executing, create the directory structure:

```bash
INVEST_DIR="docs/superpowers/podcasts/<name>-investigation"
mkdir -p "$INVEST_DIR/steps"
```

The `<name>` is derived from the input filename (strip path and extension).

### Executing Steps

For each step, in order:

1. Create the step directory: `mkdir -p "$INVEST_DIR/steps/NN-step-name/artifacts"`
2. Save the command: write what you're about to run to `command.sh`
3. Execute the command, capturing stdout to `stdout.txt` and stderr to `stderr.txt`
4. Save any generated files (API responses, images, data) to `artifacts/`
5. Record wall-clock time and estimated cost
6. Log the outcome: success, failure, unexpected, timeout

**On failure:**
- Log the actual error message
- If the next step depends on this one, skip it and log: "Skipped: depends on failed step NN"
- If independent, continue

**On timeout (5 min default):**
- Kill the process
- Log: "Timeout after 300s"
- Continue to next step

**Credential safety:** Before saving stdout/stderr, redact any API keys or tokens that appear
in the output. Replace with `[REDACTED]`.

### Investigation Report

After all steps complete, generate `$INVEST_DIR/report.md`:

```markdown
# Investigation Report: <spec name>

**Date:** YYYY-MM-DD
**Spec:** `<filepath>`
**Total steps:** N attempted, N succeeded, N failed, N skipped

## Cost Summary
| Service | Calls | Est. Cost |
|---------|-------|-----------|
| Claude API | N | $X.XX |
| ... | ... | ... |
| **Total** | | **$X.XX** |

## Step Results

### Step 1: <name>
- **Status:** SUCCESS / FAIL / TIMEOUT / SKIPPED
- **Duration:** Xs
- **Key finding:** <one line summary>
- **Artifacts:** `steps/01-name/artifacts/...`

### Step 2: ...

## Surprises
- <anything that contradicted the spec's expectations>

## Artifacts Index
- `steps/01-name/artifacts/frame.png` — extracted dashcam frame
- ...
```

Also generate `$INVEST_DIR/cost-summary.json`:
```json
{
  "total_estimated_usd": 3.80,
  "by_service": {
    "anthropic": {"calls": 120, "cost_usd": 1.80},
    "google": {"calls": 60, "cost_usd": 0.30},
    "replicate": {"calls": 60, "cost_usd": 1.20},
    "elevenlabs": {"calls": 50, "cost_usd": 0.50}
  }
}
```
```

- [ ] **Step 5: Write Phase 2 — Narration**

Append the narration phase:

```markdown
## Phase 2 — Narration

Take the investigation report and artifacts and generate a podcast dialogue.

### Personas

**Person A** — The investigator. Set up the experiment, ran the pipeline, has the results.
Walks B through what happened step by step, but not linearly — starts with the most
interesting finding, then fills in context. Says "when I ran this" and "look at what came
back" instead of "the spec says."

**Person B** — The skeptic turned believer (or not). Hasn't seen the results. Asks sharp
questions, catches when results don't match expectations, gets excited when something
works better than expected. Has their own expertise and challenges A's interpretations.
B carries equal weight — not a reaction machine.

### Dialogue Guidelines

**Length:** Same as /podcast — ~1 minute per 500 words of source material. But source material
here includes the investigation report, not just the original spec.

**Structure:**
- **The setup** — A says they actually ran the thing. B is immediately curious what happened.
- **The first result** — Lead with the most interesting finding, not step 1
- **The walkthrough** — Work through results, jumping between steps based on narrative interest
- **The surprise** — Something that contradicted the spec. This is the climax.
- **The verdict** — Based on real data, does this spec's idea actually work?
- **The closer** — What they'd try next. Quick, natural, no formal summary.

**Tone rules:**
- Same as /podcast: two friends riffing, short sentences, interruptions
- Never use "honestly", "genuinely", or "literally"
- A and B carry equal weight in word count
- Reference ACTUAL data: real coordinates, real confidence scores, real error messages, real costs
- When quoting API responses, use the real values from the investigation
- Failures are the best content — a timeout or weird error makes a better story than "it worked"

**Key difference from /podcast:**
The hosts are practitioners, not commentators. Every claim is backed by something they actually ran.
Don't say "the spec claims 40% hit rate" — say "we got 43% on the EDSA video, which is right
in the spec's viable range."

**Do NOT:**
- Summarize the investigation report linearly
- Skip failures or errors — they're the most interesting parts
- Fabricate results — every number in the dialogue must come from the actual investigation
- Make B a passive listener — B should challenge, question, and riff
- Fall into A explains → B reacts ping-pong
```

- [ ] **Step 6: Write Phase 3 — Audio Generation and Output**

Append the audio and output sections:

```markdown
## Phase 3 — Audio Generation

Same pipeline as /podcast:

1. Generate dialogue as a JSON array. Each entry has `speaker` ("a" or "b") and `text`
2. Save transcript to `docs/superpowers/podcasts/<name>-transcript.md`
   - Format as readable markdown with **A:** and **B:** prefixes
   - Include a header noting this is an investigative podcast with link to the investigation dir
3. Write JSON array to a temp file
4. Run: `bash .claude/skills/podcast/scripts/generate.sh <temp-json> docs/superpowers/podcasts/<name>.mp3`
5. Report to the user:
   - Audio file path and duration
   - Transcript file path
   - Investigation directory path
   - One-liner: what the hosts discovered

## Output

All files go to `docs/superpowers/podcasts/`:
- `<name>.mp3` — the podcast audio
- `<name>-transcript.md` — readable dialogue with speaker labels
- `<name>-investigation/` — all artifacts, logs, and report
- `<name>-investigation/report.md` — structured investigation summary
- `<name>-investigation/cost-summary.json` — cost breakdown

## Error Handling

- If `ELEVENLABS_API_KEY` is not set: tell the user to set it and stop
- If `ffmpeg`, `jq`, or `curl` missing: tell the user to install and stop
- Missing project credentials: Phase 0 catches this, asks user, waits
- All investigation steps fail: still generate a podcast about what went wrong
- Audio generation fails: keep transcript and investigation artifacts, show the error

## Scope Boundaries

- **Cost cap:** Phase 0 estimates cost and requires user confirmation before proceeding.
- **Step timeout:** 5 minutes per step. Log and continue on timeout.
- **Total timeout:** 30 minutes for the full investigation. If exceeded, generate the podcast
  with whatever results you have so far.
- **No cleanup:** Investigation artifacts are kept. They are the evidence.
- **Credential safety:** Never include API keys in transcripts, reports, or dialogue. Redact
  from captured stdout/stderr.
- **No destructive ops:** Do not run rm -rf, drop tables, or any destructive commands extracted
  from specs. Review commands for safety before execution.

## No Git Commits

The podcast, transcript, and investigation artifacts are generated output. Do not commit them —
tell the user the file paths and let them decide.
```

- [ ] **Step 7: Verify the complete SKILL.md**

Read back the full file and verify:
- Frontmatter has name and description
- All four phases are present (0, 1, 2, 3)
- Credential gate is a hard gate
- Tone rules match /podcast (including banned words)
- Output paths are consistent
- No placeholders or TODOs

```bash
wc -l .claude/skills/investigate/SKILL.md
grep -c "Phase" .claude/skills/investigate/SKILL.md
grep "honestly\|genuinely\|literally" .claude/skills/investigate/SKILL.md  # should appear only in the "never use" rule
```

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/investigate/SKILL.md
git commit -m "feat: add /investigate skill — investigative podcast with real execution"
```

---

### Task 2: Test the Skill on a Real Spec

**Files:**
- Read: `docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`
- Output: `docs/superpowers/podcasts/` (generated artifacts)

- [ ] **Step 1: Invoke the skill**

Run `/investigate docs/superpowers/specs/2026-04-08-jeepney-spotter-design.md`

- [ ] **Step 2: Verify Phase 0 — Credential Gate**

Confirm the skill:
- Identifies all required credentials (ANTHROPIC_API_KEY, GOOGLE_API_KEY, REPLICATE_API_TOKEN, ELEVENLABS_API_KEY, yt-dlp, ffmpeg)
- Checks each one against `.env` and environment
- Reports estimated cost
- Waits for user confirmation before proceeding

- [ ] **Step 3: Verify Phase 1 — Investigation runs**

Confirm:
- Steps are extracted from the spec (frame extraction, geolocation, detection, OCR, fuzzy matching)
- Each step executes with real API calls
- Artifacts are saved to the investigation directory
- Failures are logged, not fatal
- Investigation report is generated

- [ ] **Step 4: Verify Phase 2 — Dialogue references real data**

Check the transcript for:
- Actual coordinates from geolocation results
- Real confidence scores
- Actual error messages from any failures
- Real cost figures
- No fabricated numbers

- [ ] **Step 5: Verify Phase 3 — Audio generates**

Confirm:
- MP3 file is produced
- Transcript is saved
- Investigation directory contains all artifacts
- User is told file paths

- [ ] **Step 6: Send to Telegram for review**

```bash
curl -s -X POST \
  "https://api.telegram.org/bot<TOKEN>/sendAudio" \
  -F chat_id=<CHAT_ID> \
  -F audio=@"docs/superpowers/podcasts/<name>.mp3" \
  -F title="Investigative Podcast — <spec name>" \
  -F caption="First investigative podcast test run."
```
