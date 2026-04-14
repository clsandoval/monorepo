# Investigative Podcast — Spec-to-Execution-to-Audio

**Date:** 2026-04-14
**Status:** Draft

## Problem

The existing `/podcast` skill turns specs into commentary — two hosts riff on what a doc *says*. But the most interesting question about any spec is whether it *works*. Nobody finds out until someone actually runs the code, hits the APIs, and sees what happens. That investigation is where the real story lives.

## Idea

A new skill that reads a spec, identifies every testable claim and executable step, actually runs them, collects all artifacts, and then generates a podcast dialogue grounded in real results. The hosts narrate a completed investigation as if discovering things live — referencing actual API responses, real coordinates, real error messages, real costs.

## How It Differs From `/podcast`

| | `/podcast` | `/investigate` |
|---|---|---|
| Input | Spec/plan/doc | Spec/plan/doc |
| What happens | Reads the doc, generates opinions | Reads the doc, **executes the steps**, generates narrative |
| Data in dialogue | Hypothetical ("they say it'll geolocate...") | Real ("we sent a frame and got back 14.6510, 121.0325") |
| Artifacts | MP3 + transcript | MP3 + transcript + investigation directory + report |
| Cost | ElevenLabs TTS only | ElevenLabs TTS + whatever the spec's pipeline costs |
| Duration | ~30 seconds | Minutes to hours depending on what's being tested |

These are separate skills. `/investigate` does not modify or replace `/podcast`.

## Invocation

```
/investigate <filepath>
```

## Phases

### Phase 0 — Credential Gate

Before any execution, the skill must:

1. Read the spec and identify all external services, APIs, and tools required
2. Map each to a credential (env var, API key, CLI tool, account)
3. Check which credentials are already available:
   - Read `.env` files in the project and repo root
   - Check environment variables
   - Check CLI tool availability (`which yt-dlp`, `ffmpeg -version`, etc.)
4. For any missing credential that the agent cannot create on its own, **stop and ask the user**
5. Validate every credential with a smoke test (ping the API, verify the key works)
6. Report a summary: what's available, what's missing, estimated cost for the investigation
7. Wait for user confirmation before proceeding

**Hard gate:** Investigation MUST NOT start until all required credentials are confirmed present and validated. No skipping steps because a key is missing. No guessing at credentials.

**Cost estimate:** Before asking the user to confirm, provide a rough cost estimate based on the number of API calls, GPU time, etc. the investigation will require. The user should know they're about to spend $2 or $50 before it happens.

### Phase 1 — Investigation

Read the spec and extract an ordered list of testable steps. Execute each one.

#### Step Extraction

Parse the spec for:
- API calls with example payloads (geolocation prompts, detection prompts, OCR prompts)
- Scripts and CLI commands (yt-dlp downloads, ffmpeg extraction, fuzzy matching)
- Data pipeline stages (extract → geolocate → detect → identify → assemble)
- Success criteria and thresholds (hit rates, confidence scores)
- Any "how to validate" or "smoke test" sections

Each extracted step becomes a task with:
- **Name:** What this step tests (e.g., "Geolocate a dashcam frame with Claude")
- **Command or code:** The actual thing to run
- **Expected outcome:** What success looks like (from the spec)
- **Timeout:** Default 5 minutes per step, configurable
- **Dependencies:** Which previous steps must complete first

#### Execution

For each step, in order:
1. Log the step name and what's about to happen
2. Execute the command/code
3. Capture: stdout, stderr, response payloads, generated files, wall-clock time, cost (if measurable)
4. Record the outcome: success, failure, unexpected result
5. Save all artifacts to the investigation directory

If a step fails:
- Log the failure with the actual error
- Continue to the next step if it doesn't depend on the failed step
- If it does depend, skip it and log why

If a step exceeds its timeout:
- Kill it
- Log as timeout failure
- Continue

#### Investigation Directory

```
docs/superpowers/podcasts/<name>-investigation/
├── report.md                    # Structured summary
├── steps/
│   ├── 01-frame-extraction/
│   │   ├── command.sh           # What was run
│   │   ├── stdout.txt           # Output
│   │   ├── stderr.txt           # Errors
│   │   └── artifacts/           # Generated files (frames, etc.)
│   ├── 02-geolocation/
│   │   ├── command.sh
│   │   ├── response.json        # API response
│   │   └── artifacts/
│   └── ...
└── cost-summary.json            # Total cost breakdown by service
```

#### Investigation Report

After all steps complete, generate `report.md`:

- Total steps attempted / succeeded / failed / skipped
- Per-step summary: what was tried, what happened, key findings
- Surprises: anything that contradicted the spec's expectations
- Cost breakdown: actual API costs by service
- Artifacts index: what files were generated and where

### Phase 2 — Narration

Take the investigation report and artifacts and generate a podcast dialogue.

#### Dialogue Generation

The hosts narrate the investigation as if discovering things live:
- A is the one who set up the investigation and is walking through results
- B is reacting to real data, not hypothetical claims
- When results match the spec's predictions, they confirm it with specifics ("the spec said 40% hit rate, we got 43%")
- When results diverge, that's the interesting part — dig into why
- Failures are content, not problems — a timeout or bad API response makes for a better story than everything working perfectly

#### Tone

Same rules as `/podcast`:
- Two friends riffing, not an interview
- Short sentences, interruptions, false starts
- Never use "honestly", "genuinely", or "literally"
- A and B carry equal weight
- Reference actual data from the investigation — the more specific, the better

#### Key difference from `/podcast` tone

The hosts are practitioners, not commentators. They say "when I ran this" and "look at what came back" instead of "the spec says" and "they claim." They have opinions informed by having actually tried the thing.

### Phase 3 — Audio Generation

Same as `/podcast`:
1. Generate dialogue as JSON array
2. Save transcript to `docs/superpowers/podcasts/<name>-transcript.md`
3. Write JSON to temp file
4. Run `bash .claude/skills/podcast/scripts/generate.sh <temp-json> <output.mp3>`

Reuses the same audio generation script, same voices, same ElevenLabs setup.

## Output

All files go to `docs/superpowers/podcasts/`:
- `<name>.mp3` — the podcast audio
- `<name>-transcript.md` — readable dialogue
- `<name>-investigation/` — directory of all artifacts and logs
- `<name>-investigation/report.md` — structured investigation summary

## Scope Boundaries

- **Cost cap:** The skill estimates cost before running and reports it. User must confirm. No silent expensive runs.
- **Step timeout:** Default 5 minutes per step. Configurable via `--step-timeout`.
- **Total timeout:** Default 30 minutes for the entire investigation. Configurable via `--timeout`.
- **No cleanup:** Artifacts are kept. The investigation directory is evidence.
- **Credential safety:** Never log or include API keys in transcripts, reports, or dialogue. Redact from stdout/stderr captures.
- **Sandboxing:** Steps execute in the project directory. No rm -rf, no destructive operations. The skill should review extracted commands for safety before execution.

## CLI Interface

```
/investigate <filepath>
/investigate <filepath> --step-timeout 300 --timeout 1800
```

## Error Handling

- `ELEVENLABS_API_KEY` not set → tell user, stop (same as `/podcast`)
- Missing project credentials → Phase 0 catches this, asks user, waits
- All investigation steps fail → still generate a podcast about what went wrong (failures are content)
- Audio generation fails → keep transcript and investigation artifacts (creative + research work preserved)

## What This Is NOT

- Not a replacement for `/podcast` — that skill stays as-is for commentary on docs
- Not a CI system — this is a one-shot investigation, not a recurring pipeline
- Not an autopilot dispatch — everything runs in the current session, not on remote infrastructure
