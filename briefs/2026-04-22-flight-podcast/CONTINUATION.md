# Flight Podcast Steelman Series — Continuation Notes

**Last session:** 2026-05-02. Dispatched ep 45 (3-way harness comparison interlude: jcode + pi-mono + opencode) as flight-prep. Brief drafted locally and ironed before dispatch.

## Where we are

### Dispatched

- **Ep 44** — milla-jovovich/mempalace — session `sesn_011CaKHL8rmGcm2dyVLzTxv7`, agent `agent_011CaKHKxUvpCn8asWGLfHgd`. Format: `repo-deep-dive` (straight, not steelman). Dialogue at `briefs/2026-04-22-flight-podcast/ep_44.md` — 2002 JP / 3909 EN, all gates pass.
- **Ep 45** — 1jehuang/jcode + badlogic/pi-mono + anomalyco/opencode (3-way interlude) — session `sesn_011CafAZSm9dxttVD7Zk8nKC`, agent `agent_011CafAZMux2dUp66szYQ9vw`. Format: `interlude-review`. Dialogue at `briefs/2026-04-22-flight-podcast/ep_45.md` — 1810 JP / 2354 EN. Slot was originally OpenHands; user repurposed it for harness comparison. Vocab/grammar kept (手を出す/代わり/自動/失敗/進める/頼る + 〜ずに) — fit harness theme cleanly.

### Queued, not yet researched

- **OpenHands/OpenHands (72k⭐)** — formerly ep_45, displaced by harness interlude. Re-queue at next available slot (ep_47+ since ep_46 = ruvnet/ruflo). Vocab/grammar to be re-picked when slot is assigned.

### Dropped

- **Original ep 44** = affaan-m/everything-claude-code. User dropped after steelman review. Slot removed, 45→44, 46→45 renumbered. Steelman artifact kept at `research/affaan-m-everything-claude-code_steelman.md` for future reference.

## Full 22-repo batch (pilot of 3 done via ep 44; 20 remaining)

From user's 2026-04-22 picks (verified exist via `gh api`):

Agent infra (8): 2 Gitlawb/openclaude, 3 shareAI-lab/learn-claude-code, 4 HKUDS/OpenHarness, 5 HKUDS/nanobot, 6 OpenHands/OpenHands [pilot 3], 8 Yeachan-Heo/oh-my-codex, 9 Yeachan-Heo/oh-my-claudecode, 11 santifer/career-ops

Vertical-suspect (1): 15 TheCraigHewitt/seomachine

Skills/MCP (1): 26 alchaincyf/nuwa-skill

Memory/KG/RAG (6): 30 getzep/graphiti, 31 garrytan/gbrain, 32 safishamsi/graphify, 33 yichuan-w/LEANN, 34 nashsu/llm_wiki (28 dropped as duplicate of 29 which was pilot 2)

LLM infra (1): 35 sgl-project/sglang

Dev tools (1): 45 screenpipe/screenpipe

Vertical (3): 46 farzaa/clicky, 47 saturndec/waoowaoo, 49 hotcoffeeshake/tong-jincheng-skill

**Dropped from batch:** 14 Loongphy/langAlpha (404), 1 affaan-m/everything-claude-code (user dropped after steelman), 28 MemPalace/mempalace (sibling duplicate of 29).

## How to continue

### Poll ep 44 status

```bash
set -a; source .env; set +a
curl -sS "https://api.anthropic.com/v1/sessions/sesn_011CaKHL8rmGcm2dyVLzTxv7" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" | jq '.status, .stop_reason'
```

If `status_idle` with `stop_reason: requires_action`, something needs `ask_user` resolution. If `status_idle` with `stop_reason: end_turn` and MP3 arrived in Telegram, done.

### Next dispatch (ep 45)

```
/autopilot podcast steelman OpenHands/OpenHands
```

Skill will:
1. Spawn steelman subagent → `research/openhands-openhands_steelman.md`
2. User gate: proceed with tells / tension hypothesis / straight deep-dive / drop
3. If tells: spawn tells subagent → `research/openhands-openhands_tells.md` (or `NO_TENSION_FOUND` drop-path)
4. Spawn dialogue subagent (respect-first-then-critique 5-segment format)
5. Density/pairing verify + debasement grep
6. User approves
7. `EP=45 bash automations/flight-podcast/dispatch-ep.sh`

### Dispatch script is now parameterized

`automations/flight-podcast/dispatch-ep.sh` reads repo/slug/vocab/grammar from `schedule.yaml` automatically. Just set `EP=NN` and run. Override slug with `SLUG_OVERRIDE=custom-slug` if needed.

### Credentials path (baked into the brief)

- PRIMARY: `/mnt/session/uploads/workspace/.env`
- FALLBACK: `/workspace/.env`
- LAST RESORT: `find / -name .env 2>/dev/null`
- `GOOGLE_API_KEY` exported from `GEMINI_API_KEY` for `generate.sh` compatibility
- Brief hard-stops via `ask_user` if any required credential is missing after the source loop

### Schedule slot creation for eps 46+

When picking the next repo from the 20 remaining, append a new slot to `data/japanese/schedule.yaml`:

```yaml
episode_NN:
  status: queued
  japanese_ratio: 0.2
  series: flight-podcast-2026-04-ext
  format: repo-steelman    # or repo-deep-dive
  theme: 'OWNER/REPO (Xk⭐ Lang) — one-line thesis. Context for hosts.'
  hosts: Ark vs Red
  vocab:
  - {word: ..., reading: ..., meaning: ...}     # 6 items
  grammar:
  - {pattern: 〜..., meaning: ...}
```

**Grammar patterns still unused** (from handoff, after ep 44 consumed 〜限り):
〜たところで, 〜うちに, 〜ちゃう, 〜ずに (claimed for ep 45), 〜こと(に)する, 〜ことになる, 〜ベき, 〜ため (cause), 〜わりに

### Skill lives at

`~/.claude/skills/autopilot/skills/podcast-steelman/SKILL.md` (committed + pushed to `clsandoval/claude-autopilot`).

## Open state

- `profile.yaml.episodes_completed` bumped 12 → 43. `japanese_ratio` frozen at 0.2 per user instruction — do NOT bump without explicit approval.
- `data/japanese/vocabulary.yaml` and `grammar.yaml` may be out of sync with what eps 13-43 actually introduced — remote agent is supposed to write `curriculum_update.yaml` for orchestrator merge, but that merge may not have landed. Not blocking dispatch; flag to user if they ask about review-pool coverage.
- Ep 44 dialogue uses the `〜限り` pattern in 31 places and `〜につれて` callback in 11 places — vocabulary.yaml won't reflect those exposures until the remote curriculum update is merged.
