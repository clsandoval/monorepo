# Podcast Skill — Spec-to-Audio Design Doc

**Date:** 2026-04-13
**Status:** Draft

## Purpose

A skill that turns any brainstorming artifact (spec, plan, design doc) into an engaging podcast-style audio conversation between two people. The goal is to increase genuine engagement with artifacts — listening to two people discuss your spec forces deeper processing than skimming and approving.

## Format

Late-night talk show dynamic:
- **Host:** Witty interviewer. Asks pointed questions, roasts weak ideas, pushes on implications. Deeper/authoritative voice.
- **Guest:** The person who "built" the thing. Enthusiastic, a bit defensive, funny. Lighter/energetic voice.

They genuinely explore the artifact's ideas through humor and skepticism.

## Components

### 1. Skill File (`.claude/skills/podcast/SKILL.md`)

The skill contains persona instructions and the creative workflow. When invoked with a file path (e.g., `podcast docs/superpowers/specs/2026-04-13-whatever-design.md`), Claude:

1. Validates the file exists and is readable (markdown, text)
2. Reads the artifact
3. Identifies key ideas: the thesis, interesting decisions, questionable parts, implications
4. Generates a dialogue as a structured JSON array:
   ```json
   [
     {"speaker": "host", "text": "So tonight we have someone who apparently decided the world needs... a podcast generator for design specs."},
     {"speaker": "guest", "text": "Look, I'm not saying people don't read specs. I'm saying they read them the way I read terms of service."}
   ]
   ```
5. Saves the transcript to `docs/superpowers/podcasts/<derived-name>-transcript.md`
6. Writes the dialogue JSON to a temp file
7. Runs `scripts/podcast-generate.sh <temp-json> <output-mp3-path>`
8. Reports back: file paths, duration, and a one-liner summary of what the hosts thought

**Length scaling:** Target roughly 1 minute of dialogue per 500 words of input artifact.

**No git commits.** The podcast and transcript are generated artifacts — the user decides whether to commit.

### 2. Helper Script (`scripts/podcast-generate.sh`)

A bash script that takes dialogue JSON and produces an MP3. Handles all ElevenLabs API and audio plumbing.

**Input:** JSON dialogue file path + output MP3 path
**Output:** Final concatenated MP3

**Steps:**
1. Parse JSON dialogue using `jq`
2. Iterate through entries, call ElevenLabs API for each line with the appropriate voice
3. Save numbered audio chunks to a temp directory (`001-host.mp3`, `002-guest.mp3`, ...)
4. Use ffmpeg to concatenate all chunks into a single MP3
5. Clean up temp chunks

**ElevenLabs API details:**
- Endpoint: `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- Auth header: `xi-api-key: $ELEVENLABS_API_KEY`
- Content-Type: `application/json`
- Model: `eleven_multilingual_v2`
- Request body:
  ```json
  {
    "text": "...",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.65,
      "similarity_boost": 0.80,
      "style": 0.15,
      "use_speaker_boost": true
    }
  }
  ```
- Response: raw audio bytes (MP3)

**Voice assignment:**
- Host: `pNInz6obpgDQGcFmaJgB` (Adam — deeper, authoritative)
- Guest: `ErXwobaYiN019PkySvjV` (Antoni — lighter, more energetic)

**Dependencies:** `ELEVENLABS_API_KEY` env var, `curl`, `ffmpeg`, `jq`

### 3. Output Location

All outputs go to `docs/superpowers/podcasts/`:
- `<derived-name>.mp3` — the podcast audio
- `<derived-name>-transcript.md` — readable dialogue script

Filename is derived from the input artifact's filename (e.g., input `2026-04-13-whatever-design.md` produces `2026-04-13-whatever-design.mp3`).

## Error Handling

- Missing `ELEVENLABS_API_KEY` — tell the user to set it
- Missing `ffmpeg`/`jq`/`curl` — tell the user to install
- ElevenLabs API failure — show the error, keep the transcript so creative work isn't lost

## Invocation

Manual only: `podcast <filepath>`

Not wired into any automatic flow. The user points it at any artifact they want to hear discussed.
