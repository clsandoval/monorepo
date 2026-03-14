# First Playable Decisions — Brainstorm Output

**Date:** 2026-03-13 (updated v4 — channels, no harvesters, plan-then-execute, aggregate debrief)
**Context:** These decisions were made during a brainstorming session about scoping the first playable demo. The reverse loop should treat these as locked preferences for the "minimum viable game" (aspect 8.04) and "full game configurations" (aspect 8.03) explorations.

**Full spec:** `docs/superpowers/specs/2026-03-13-robot-uprising-first-playable-design.md`

---

## Scope: Demo/Pitch Build (For Creator)

- **Audience:** Myself — I need to play it and feel the "managing smart autonomous systems" feeling
- **Intelligence model:** Fully deterministic (no LLMs, no RNG beyond compress)
- **Visual investment:** Battlefield-heavy (workbench functional but not fancy)
- **Narrative:** Light framing (1-2 terminal lines per mission, no cutscenes, no characters)
- **Mission count:** 7

---

## v3 Shift: Base + Spawning Model

The player designs **agent blueprints**, not individual agents. A base produces copies from blueprints. This makes "factory that builds the factory" literal:

- **Blueprints** replace individual unit config. Edit a blueprint → all future spawns change.
- **Base** produces agents from blueprints at a rate determined by energy.
- **Production queue** sets blueprint priority and caps. Order matters.
- **Resources** (energy, material, bandwidth) constrain production and architecture.
- **Old agents with bad configs die off naturally** — the army self-corrects through attrition + blueprint iteration.

### Missions 1-2 are still hand-configured (tutorial). Mission 3 introduces the base. Missions 4-7 use full blueprint+spawning.

### Channels (Locked)

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

No harvesters. Material income is passive per tick, boosted by controlling map nodes. Removes busywork.

### Debrief (Locked)

Aggregate, not individual. Systems dashboard:
- Channel-level metrics ("east-net: 23 signals, 2 dropped")
- Blueprint-level stats ("Scout-East: 5 instances, avg buffer 78%, 2 destroyed")
- Spatial heatmap of buffer overflows

---

## Tick System (Locked)

- **1 action per tick per agent.** Move, compress, filter, send signal, engage, patrol, hack, etc.
- **Receiving a signal is free.** Arrives in buffer, doesn't cost the agent's action.
- **1 tick per hop for signal travel.** Hook signals take 1 tick to travel per hop.

### World Tick Loop (Both Sides Simultaneously)

1. **Produce** — base spawns agents from blueprints (costs resources)
2. **Perceive** — all agents observe within radius (entries enter buffer, free)
3. **Receive** — hook signals arrive in buffers (free)
4. **Act** — each agent picks 1 action from rules (costs the tick)
5. **Transmit** — hook signals sent (arrive next tick)
6. **Resources** — energy regenerates, material extracted, bandwidth allocated

### Perception Model: Visual + Emissions

- **Visual (radius-based, mutual):** If you can see them, they can see you.
- **Emissions:** Certain actions emit detectable signals beyond visual range:
  - Movement → vibration (short range)
  - Combat → noise (medium range)
  - Hook transmission → EM signal (medium range)
  - Compression → processing noise (short range)
  - Base production → thermal + EM (long range)
- **Your architecture is a liability.** Complex hook chains = electromagnetically loud.

---

## Compress Mechanic (Locked)

Lossy. Takes X signals, keeps X/2 chosen at random, discards the rest.

- **Cost 1:** Might randomly discard the critical signal
- **Cost 2:** Takes 1 tick (adds latency to the chain)
- **Cost 3:** Emits processing noise (detectable)

---

## Resources

| Resource | Source | Spent On | Tension |
|----------|--------|----------|---------|
| Energy | Base generates per tick | Spawning, active skills | More agents = more drain |
| Material | Base generates per tick, boosted by map nodes | Spawning (initial cost) | Controlling nodes = exposure but faster production |
| Bandwidth | Fixed pool per mission | Hook transmissions | Complex architecture = bandwidth hungry = loud |

---

## 7-Mission Arc (v3)

| # | Name | New Concept | Checkpoints | Model |
|---|------|-------------|-------------|-------|
| 1 | Wake Up | Context config | #1 Attention is subtraction | Hand-configured |
| 2 | First Contact | Rules, Hooks | #2 Emergent combo, #3 Detective story | Hand-configured |
| 3 | Assembly Line | Base, Blueprints, Resources | — | First blueprint mission |
| 4 | Noisy Channel | Skills, Emissions | — | Blueprints + emissions |
| 5 | Chain of Command | Command agent | #4 Designing systems | Factory adapts itself |
| 6 | Breach | Full system, enemy spawner | #5 Cascade failure | Factory breaks itself |
| 7 | The Warden | Enemy base + architecture | #6 Show someone | Factory kills factory |

---

## 6 Feeling Checkpoints (Updated for v3)

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

- **Blueprint editor UX:** Same config UI as individual units. Needs to FEEL like designing a species.
- **Hook resolution for blueprints:** "on_detect → Relay" resolves by type — but what if there are 3 relays? Nearest? Random? Player-configured routing?
- **Production rate tuning:** Too fast = spam, too slow = boring. Needs playtesting.
- **Harvester gameplay:** Could feel like busywork. Should harvesting be automatic?
- **Emission balance:** Too punishing = nobody uses hooks. Too weak = irrelevant.
- **Command agent modifying blueprints mid-battle:** Could be OP. Needs constraints or cost.
- **Workbench interaction design:** Dropdowns risk feeling like forms. What makes configuration feel like designing?
