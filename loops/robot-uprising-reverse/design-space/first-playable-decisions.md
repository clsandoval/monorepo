# First Playable Decisions — Brainstorm Output

**Date:** 2026-03-13 (updated 2026-03-14: v5 — research-informed pacing, boot log, two-act debrief, invisible randomization, 10 missions, tagging)
**Context:** These decisions were made during brainstorming sessions. v5 incorporated findings from the reverse loop's research on spawn semantics, hook semantics, Gladiabots debugging patterns, and debrief structure. The reverse loop should treat these as locked preferences.

**Full spec:** `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md`

---

## Scope: Demo/Pitch Build (For Creator)

- **Audience:** Myself — I need to play it and feel the "managing smart autonomous systems" feeling
- **Intelligence model:** Fully deterministic (no LLMs, no RNG beyond compress)
- **Visual investment:** Battlefield-heavy (workbench functional but not fancy)
- **Narrative:** Boot log — self-documenting subsystem initialization (diegetic)
- **Mission count:** 10 (was 7 in v4)

---

## v5 Shift: Research-Informed Pacing

Key change from v4: **Missions 1-4 are hand-configured (pre-placed units).** Factory (base + blueprints + spawning) doesn't appear until Mission 5. This gives core mechanics — context management and signal routing — room to breathe.

Research that informed this:
- **Spawn semantics analysis:** Spawning too early is pedagogically risky. Pre-placed units let players master wiring first.
- **Hook semantics analysis:** Fire-and-forget messaging should be invisible in early missions. Queue depth becomes visible in Mission 3 debrief.
- **Gladiabots debugging pattern:** Diagnostic tools (Inspector) must be designed in from Mission 1, not bolted on later.
- **Two-act debrief structure:** Sealed watch (emotional) then inspector (analytical) — temporal separation makes both phases work.

---

## Cross-Cutting Systems (Locked)

### Boot Log (Diegetic Tutorial)
- Self-documenting subsystem initialization. You're an AI reading your own spec sheet as it writes itself.
- 3-5 lines per mission. No lore, no character, just clinical self-documentation.
- Persists in "System Status" panel. The boot log IS the manual.

### Two-Act Debrief
- **Sealed watch:** No tools, no skip (not even on retry). Quality signal — if watching isn't fun, the game isn't fun.
- **Inspector:** Full analytical tools. Buffer inspector, action trace, hooks, pressure thermometer, emission overlay, channel metrics.

### Invisible Randomization
- Each execute varies within constraints. No explicit test suite UI.
- Debrief shows "runs: N, passed: M" so player discovers generalization naturally.

### Tagging (Map Node Control)
- Presence-based control. Agent proximity = tagged. Contested = untagged.
- Tagging nodes boosts resource income. Creates map control as positioning consequence.

---

## 10-Mission Arc (v5)

| # | Name | New Concept | Checkpoints | Model |
|---|------|-------------|-------------|-------|
| 1 | Wake Up | Context config | #1 Attention is subtraction | Hand-configured (2 units) |
| 2 | First Contact | Rules, Hooks (fire-and-forget) | #2 Emergent combo, #3 Detective story | Hand-configured (4 units) |
| 3 | Blind Spots | Relay chains, queue depth in debrief | — | Hand-configured (6 units) |
| 4 | Noisy Channel | Skills (compress, filter), Emissions | — | Hand-configured (6-8 units) |
| 5 | Assembly Line | Base, Blueprints, Channels, Resources | — | First blueprint mission |
| 6 | Chain of Command | Command agent | #4 Designing systems | Blueprints + meta-level |
| 7 | Pressure Test | Production tuning, tagging | — | Full production |
| 8 | Breach | Multi-objective, enemy spawner, Specialist | #5 Cascade failure | Full system |
| 9 | Arms Race | Enemy base | — | Factory vs factory (intro) |
| 10 | The Warden | Enemy base + full architecture | #6 Show someone | Factory kills factory |

---

## Channels (Locked)

Named communication pipes that connect blueprints at the type level:
- A hook fires ON a channel: "on_detect → send on `east-net`"
- A hook listens ON a channel: "on_receive[`east-net`] → forward on `strike-net`"
- **One channel per hook slot.** Each hook = one slot = one channel.
- **All instances receive.** 3 relays on `east-net` = all 3 get every signal.
- The player's real design artifact is the **channel map** — the topology of named pipes.

### Hook Slots (Locked)

| Type | Hook Slots | Implication |
|------|-----------|-------------|
| Scout | 2 | Detect + report on one channel |
| Striker | 2 | Receive orders + report kills |
| Relay | 4 | The routing hub — but even it has limits |
| Specialist | 2 | Receive orders + report status |
| Command | 6 | Needs to listen to everything |

Hook slots create a natural complexity ceiling. Can't build infinitely connected architecture.

### Plan Phase (Locked)

Pre-execution only. Design blueprints, set channels, set production, hit execute. No pausing to redesign. Command agent is the only mid-battle adaptation.

### Resource Model (Locked)

No harvesters. Material income is passive per tick, boosted by tagging map nodes.

### Debrief (Locked)

Aggregate, not individual. Systems dashboard:
- Channel-level metrics ("east-net: 23 signals, 2 dropped")
- Blueprint-level stats ("Scout-East: 5 instances, avg buffer 78%, 2 destroyed")
- Spatial heatmap of buffer overflows

---

## 6 Feeling Checkpoints (Locked)

1. **Attention is subtraction** — drag noise to ignore, unit snaps from overloaded to focused
2. **Emergent combo** — scout → relay → striker chain fires, flanking emerges unscripted
3. **Detective story** — debrief traces failure through the signal chain
4. **Designing systems** — factory adapts its own production to a new threat without player intervention
5. **Cascade failure** — factory breaks itself, keeps producing the wrong thing while the system fails
6. **Show someone** — your factory kills the enemy's factory

---

## Unit Types (5 Total)

| Type | Buffer | Hook Slots | Speed | Skills | Cost |
|------|--------|-----------|-------|--------|------|
| Scout | 6 | 2 | Fast | patrol, evade | 3 mat, 1 energy/tick |
| Striker | 8 | 2 | Medium | engage, breach | 8 mat, 3 energy/tick |
| Relay | 12 | 4 | Stationary | compress, filter, amplify | 5 mat, 2 energy/tick |
| Specialist | 10 | 2 | Medium | hack, extract | 7 mat, 2 energy/tick |
| Command | 14 | 6 | Stationary | reassign, reroute, prioritize | 10 mat, 4 energy/tick |

---

## Full Game Vision: Tech Tree Branches (Not in First Playable)

Five branches, all centered on information as the weapon:

1. **Signal Engineering** — improve your own architecture (smart compress, wider buffers, predictive filtering)
2. **Information Warfare** — attack enemy architecture (decoys, signal jamming, false data injection, EMP)
3. **Counter-Intelligence** — defend against enemy info attacks (signal authentication, hardened buffers)
4. **Architecture** — new wiring options (conditional hooks, broadcast hooks, feedback loops, shared memory)
5. **Unit Evolution** — new unit types (stealth, saboteur, spawner, hivemind)

---

## Open Questions (For Loop to Explore)

- **Production rate tuning:** Too fast = spam, too slow = boring. Mission 7 stress-tests this.
- **Emission balance:** Too punishing = nobody uses hooks. Too weak = irrelevant. Mission 4 dedicated to this.
- **Command agent modifying blueprints mid-battle:** Could be OP. Mission 6 will reveal if it needs cost/cooldown.
- **Channel capacity limits:** Currently unlimited. Revisit if channels feel consequence-free.
- **Inspector layout:** Confirmed tools needed. Visual layout TBD during implementation.
