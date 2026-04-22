# Episode 17: thedotmack/claude-mem — Rendering Log

## Pipeline

1. **Dialogue source:** `/mnt/session/uploads/workspace/dialogue.md` (pre-written, approved)
2. **Converted to:** `docs/autopilot/ep-17-dialogue.json` (170 turns, ARK→A, RED→B)
3. **Verify-dialogue.py:** CJK=1690, vocab/grammar pass, pairing flagged (see below)
4. **TTS:** Gemini `gemini-2.5-flash-preview-tts`, voices Charon (A) / Kore (B)
5. **Output:** `/tmp/ep_17.mp3` — 25m 59s, 29.7MB
6. **Telegram:** Posted as message_id=698, caption "Ep 17: thedotmack/claude-mem (flight-podcast 2026-04)"

## Verification flags (logged, not fixed per brief)

- **Speaker balance:** A=63.8% (gate: 45-55%) — expected for Pimsleur teacher/student format
- **Banned phrase:** "literally" ×1 — conversational usage, not an AI-tell
- **JP-EN pairing:** 82% unpaired — many Japanese spans are contextually glossed in surrounding English but lack structural em-dash `"JP" — english` pattern the script checks for

## Curriculum update

See `ep-17-curriculum-update.yaml` for full vocab/grammar/review breakdown.
