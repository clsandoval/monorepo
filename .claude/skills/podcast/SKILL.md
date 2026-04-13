---
name: podcast
description: |
  Turn any brainstorming artifact (spec, plan, design doc) into an engaging podcast-style
  audio conversation. Late-night talk show format with a witty host and enthusiastic guest.
  Triggers: "podcast", "make a podcast of", "turn this into a podcast", "podcast this spec"
---

# Podcast — Artifact-to-Audio

Convert a spec, plan, or design doc into a late-night talk show podcast. Two voices discuss
the artifact with humor, skepticism, and genuine exploration of the ideas.

## Invocation

```
podcast <filepath>
```

The argument is a path to a markdown or text file (spec, plan, design doc, etc.).

## Personas

**Host** — Late-night interviewer. Witty, sharp, asks pointed questions. Roasts weak ideas.
Pushes on implications. Loves a good "but what happens when..." question. Think: someone who
actually read the spec and has opinions.

**Guest** — The person who "built" the thing. Enthusiastic about their work, a bit defensive
when challenged, but honest when caught. Self-deprecating humor. Will admit "yeah okay that
part is held together with duct tape."

## Workflow

1. Read the artifact at the given filepath
2. Identify the key material:
   - The core thesis / what this thing actually does
   - The most interesting or novel decisions
   - The questionable or hand-wavy parts
   - The implications the author may not have considered
   - Anything that's unintentionally funny
3. Generate a dialogue as a JSON array. Each entry has `speaker` ("host" or "guest") and `text`:
   ```json
   [
     {"speaker": "host", "text": "So you built a thing that..."},
     {"speaker": "guest", "text": "Yes, and I can explain..."}
   ]
   ```
4. Save the transcript to `docs/superpowers/podcasts/<name>-transcript.md`
   - The `<name>` is derived from the input filename (strip extension)
   - Format the transcript as readable markdown with **Host:** and **Guest:** prefixes
5. Write the JSON array to a temp file
6. Run the audio generation script:
   ```bash
   bash .claude/skills/podcast/scripts/generate.sh <temp-json> docs/superpowers/podcasts/<name>.mp3
   ```
7. Report to the user:
   - Audio file path and duration
   - Transcript file path
   - A one-liner: what the hosts thought of the artifact

## Dialogue Guidelines

**Length:** Target ~1 minute of audio per 500 words of input. A 1000-word spec gets a ~2 minute
episode. A 3000-word design doc gets ~6 minutes. Each minute is roughly 150 words of dialogue.

**Structure:**
- **Cold open** — Host introduces the guest and what they built, with a joke
- **The pitch** — Guest explains the core idea, host reacts
- **The grilling** — Host digs into questionable decisions, guest defends (or doesn't)
- **The "wait, actually"** — Something in the spec that's better than expected, host gives credit
- **The closer** — Host summarizes their take, guest gets last word

**Tone rules:**
- Humor comes from specificity, not generic jokes. Reference actual details from the spec.
- The host is skeptical but fair — they give credit where it's due
- The guest can be wrong and admit it — this makes the conversation feel real
- Avoid: puns, "that's a great question", corporate speak, AI-sounding filler
- Include at least one moment where the host catches something the spec glossed over
- Include at least one moment where the guest's enthusiasm is genuinely infectious

**Do NOT:**
- Summarize the spec linearly — this is a conversation, not a reading
- Be mean-spirited — roasting is affectionate, not cruel
- Skip the interesting parts to cover everything — depth over breadth
- Generate dialogue longer than the content warrants — short specs get short episodes

## Output

All files go to `docs/superpowers/podcasts/` (created if it doesn't exist):
- `<name>.mp3` — the podcast audio
- `<name>-transcript.md` — readable dialogue with speaker labels

## Error Handling

- If `ELEVENLABS_API_KEY` is not set: tell the user to set it and stop
- If `ffmpeg`, `jq`, or `curl` missing: tell the user to install and stop
- If the audio script fails: keep the transcript (the creative work is preserved), show the error

## No Git Commits

The podcast and transcript are generated artifacts. Do not commit them — tell the user the
file paths and let them decide.
