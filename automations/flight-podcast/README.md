# Flight Podcast 2026-04-22 — 15-hour Pimsleur Japanese series

30-min bilingual podcast episodes on the top trending GitHub repos (April 2026), structured as Pimsleur language exposure. 20 repo deep-dives + 10 interludes = 30 episodes = ~15 hours of audio for a long flight.

**Host format:**
- **Ark** — deep-architecture, read-the-source host. Dry, cites files and function names.
- **Red** — layman "red-web" host. Only skimmed the README and HN. Asks dumb-smart questions.

**Episode structure (30 min, ~4,200 words, 0.2 JP ratio):**
1. Cold open (2 min) — Red's wrong assumption from the README
2. New core — architecture (16 min) — Ark walks through internals, JP vocab woven in naturally
3. Review interleave + grammar (6 min) — prior episode anchors + new grammar pattern demos
4. Synthesis (4 min) — Red restates, Ark corrects one detail
5. Tease next episode (2 min) — drop one JP word from next episode as callforward

**Interludes:** 6 segments, pure review, no new vocab/grammar. Ep 15, 18, 21, 24, 28, 32, 36, 40, 41, 42.

## Hard quality gates per dialogue

- **≥1,800 JP characters** (CJK gate floor for 30 min @ 0.2 ratio — below this the verifier fails)
- **Every JP span has English gloss within 40 chars** (em-dash or parenthetical; **NO** JP-for-EN substitution)
- Each new vocab item × 4+ exposures in varied sentence contexts (not just flashcard repeats)
- Each new grammar pattern × 5+ demonstrations in mini-dialogue form
- Prior episode's vocab reviewed × 2+ as contrast, not as flashcards
- First JP mention in episode: `[JP: 性格 (せいかく) — personality]`; subsequent plain `性格` or `せいかく`
- Speaker labels: `ARK:` and `RED:`. Segment breaks: `--- [segment name] ---`. YAML frontmatter at top.
- Output: `briefs/2026-04-22-flight-podcast/ep_XX.md`

## Workflow per batch

**Inputs:**
- `data/japanese/schedule.yaml` — episode slots have theme + vocab + grammar already locked for eps 13–42
- `data/japanese/profile.yaml` — learner state (episodes_completed, ratio, level)
- `data/japanese/vocabulary.yaml`, `grammar.yaml` — review pool

**Steps:**
1. **Spawn 5 parallel subagents** (one per episode in the batch). Each writes its own dialogue to `briefs/2026-04-22-flight-podcast/ep_XX.md`. See "Subagent prompt template" below.
2. **Verify density + pairing.** Script at the bottom — run it against the batch. Any ep failing CJK floor or pairing check gets re-dispatched tight.
3. **Review locally** — open each file, sanity-check the thesis, vocab handling, grammar demos.
4. **Dispatch autopilot** — run `dispatch-ep.sh` with `EP=NN` for each approved episode:
   ```bash
   EP=18 bash automations/flight-podcast/dispatch-ep.sh
   ```
   Each dispatch: uploads dialogue + schedule + profile + vocab + grammar + .env to Anthropic Managed Agents, creates fresh agent, creates session, sends `[PIMSLEUR]` brief with "use pre-written dialogue verbatim, render TTS only" instructions. Session ID lands in `.superpowers/autopilot-sessions.json`.
5. **Rescue each session once it starts** — after dispatch, send a follow-up message (see "Known blockers" below) because the agent container doesn't auto-source `.env` and the dialogue file mounts at a non-obvious path.

## Known blockers (fix immediately after dispatch)

The managed-agent container has two quirks every session hits:

1. **Shell env is empty.** `.env` is mounted at `/workspace/.env` but NOT auto-sourced. Agent needs:
   ```bash
   set -a; source /workspace/.env; set +a
   export GOOGLE_API_KEY=$GEMINI_API_KEY  # generate.sh uses GOOGLE_API_KEY
   ```
2. **Dialogue file path.** File resources mount under `/mnt/session/uploads/workspace/...` NOT `/workspace/...`. Try in order:
   - `/mnt/session/uploads/workspace/dialogue.md`
   - `/workspace/dialogue.md`
   - fallback `/workspace/repo/briefs/2026-04-22-flight-podcast/ep_XX.md`
   - `find / -name "dialogue.md" 2>/dev/null` if none resolve

Send this exact rescue text right after dispatch via:
```bash
curl -sS -X POST "https://api.anthropic.com/v1/sessions/$SID/events" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d "$(jq -n --arg t "$RESCUE_TEXT" '{events:[{type:"user.message",content:[{type:"text",text:$t}]}]}')"
```

## Subagent prompt template

For each repo episode, spawn a `general-purpose` subagent with a prompt like:

```
Write a 30-minute Japanese-learning podcast dialogue. Save to
`/home/clsandoval/cs/monorepo/briefs/2026-04-22-flight-podcast/ep_XX.md`.

## Episode spec
Repo: OWNER/REPO (STARS⭐, LANGUAGE) — ONE-LINE DESCRIPTION.
Format: repo-deep-dive
Hosts: Ark (deep) vs Red (layman "red-web")

JP ratio 0.2 — HARD FLOOR 1,800 CJK chars.

New vocab (each 4+ exposures, varied contexts):
- [6 items from schedule.yaml episode_N.vocab]

New grammar (5+ demonstrations in mini-dialogues):
- [pattern from schedule.yaml episode_N.grammar]

Review anchors from episode N-1 (each 2+):
- [prior episode's vocab + grammar, used as contrast]

## CRITICAL pairing rule
Every JP span needs an English gloss within 40 characters. Em-dash or parenthetical.
GOOD:  "切り替える" — switch over — is today's trick.
BAD:   You can 切り替える between CLIs.   ← no gloss

## Structure
1. Cold open 2 min — Red's README misread
2. New core 16 min — Ark walks architecture; vocab woven in
3. Review interleave + grammar 6 min
4. Synthesis 4 min — Red restates, Ark corrects
5. Tease next ep 2 min — drop one word from ep N+1 as callforward

## Format rules
- ARK:/RED: labels, --- [segment] --- markers
- First JP appearance: [JP: 切り替える (きりかえる) — switch over], then plain
- YAML frontmatter: episode, repo, format, vocab_count, grammar, review_anchors, target_word_count, estimated_duration_min
- JP reactions liberally: そうそう, なるほど, 確かに, やっぱり, わかった

Target ~3,200 EN words + 1,900–2,100 JP chars.
Write the full script in one pass. Don't stub.
```

For interludes, swap in: `format: interlude-review`, explicit `review_anchors` listing both source episodes' vocab + grammar, no new vocab, no new grammar, 6-segment structure (cold open → 3 review axes → meta-question → synthesis + tease).

## Density verifier

```bash
python3 <<'EOF'
import re, os
d = 'briefs/2026-04-22-flight-podcast'
for f in sorted(os.listdir(d)):
    if not re.match(r'ep_\d+\.md$', f): continue
    t = open(f'{d}/{f}').read()
    if t.startswith('---'): t = t.split('---',2)[2]
    jp = len(re.findall(r'[぀-ゟ゠-ヿ一-鿿]', t))
    en = len(re.findall(r'\b[A-Za-z]+\b', t))
    r = (jp*0.22)/(jp*0.22+en*0.40) if en else 0
    ok = 'PASS' if jp >= 1800 else f'FAIL -{1800-jp}'
    print(f'{f}: EN={en}  JP={jp}  ratio={r:.1%}  {ok}')
EOF
```

## Pairing check (approximate — verifier does the real one)

```bash
python3 <<'EOF'
import re
# For any JP span, look for an English gloss (alphabetic word) within 40 chars
# Fails if >20% of spans unpaired.
# Flag first-appearance spans especially.
EOF
```

Use `scripts/verify-dialogue.py` in the autopilot skill for the real check:
```bash
python3 /home/clsandoval/.claude/skills/autopilot/scripts/verify-dialogue.py /tmp/dialogue.json
```

## Session IDs dispatched (batch 1, 2026-04-22)

| Ep | Repo | Session ID |
|---|---|---|
| 13 | elizaOS/eliza | sesn_011CaJZZjUakV6mTp91Jh4vC |
| 14 | multica-ai/multica | sesn_011CaJZdeFfdJ2t1uCzLrTFa |
| 15 | interlude (13+14) | sesn_011CaJZewBwGw4p4mFAaJYqv |
| 16 | andrej-karpathy-skills | sesn_011CaJZgPD8MX5mXLmgPZVEy |
| 17 | thedotmack/claude-mem | sesn_011CaJZhjubxvkeXg3AF9R3y |

## Full episode manifest (eps 13–42)

Schedule is in `data/japanese/schedule.yaml`. Each episode has `theme`, `vocab`, `grammar`, `format`, `review_anchors`, `hosts` fields. The 20 repos selected:

Agents: multica, DeepTutor, eliza.
Claude Code ecosystem: karpathy-skills, claude-mem, cc-switch, huashu-design, awesome-cli-coding-agents, pi-mono.
Dev tools / runtimes: markitdown, microsandbox, monty, sniffnet, rio, dora-rs/dora.
Memory / context: CL4R1T4S, OpenMythos, cognee.
Wildcards: RuView, koharu.
