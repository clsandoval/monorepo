# Robot Uprising — First Playable: "The Proving Ground"

**Status:** Design approved (v3 — base + spawning model). Ready for implementation planning.
**Date:** 2026-03-13
**Parent spec:** `2026-03-13-robot-uprising-game-design.md`

---

## Summary

A 7-mission demo build of Robot Uprising targeting the creator as the primary audience. The goal is to feel the core promise: "managing smart autonomous systems feels like playing StarCraft." Fully deterministic, battlefield-heavy visual investment, light narrative framing, React + Pixi.js + Vite.

**v3 shift:** The player designs agent **blueprints**, not individual agents. A base produces copies from blueprints. The "factory that builds the factory" metaphor is literal. Missions 1-2 teach fundamentals on hand-configured units, then Mission 3 introduces the base. Missions 4-7 use the full blueprint+spawning model.

---

## Design Constraints

| Constraint | Decision |
|------------|----------|
| Intelligence model | Fully deterministic |
| Visual investment | Battlefield-heavy (workbench functional but not fancy) |
| Narrative | Light framing (1-2 terminal lines per mission, no cutscenes) |
| Audience | Yourself |
| Tech stack | React + Pixi.js + Vite, no backend |
| Mission count | 7 |
| Army model | Blueprint + base spawning (not individual unit config) |

---

## Feeling Checkpoints

| # | Checkpoint | Description |
|---|-----------|-------------|
| 1 | Attention is subtraction | Unit is overwhelmed, you drag away noise, it snaps to clarity |
| 2 | Emergent combo | Scout feeds relay feeds striker — flanking happens without explicit programming |
| 3 | Detective story | Debrief traces a failure through the signal chain |
| 4 | Designing systems | Your factory adapts its own production to a new threat without player intervention |
| 5 | Cascade failure | The factory breaks itself — keeps producing the wrong thing while the system fails |
| 6 | I need to show someone | Your factory kills the enemy's factory |

---

## Tick System

### Core Rules

- **1 action per tick per agent.** Move, compress, filter, send signal, engage, patrol, hack, etc.
- **Receiving a signal is free.** Arrives in buffer without costing the agent's action.
- **1 tick per hop for signal travel.** Hook signals take 1 tick per hop.

### World Tick Loop

Each tick, both sides simultaneously execute:

1. **Produce** — base spawns agents from blueprints (costs resources)
2. **Perceive** — all agents observe within radius (entries enter buffer, free)
3. **Receive** — hook signals arrive in buffers (free)
4. **Act** — each agent picks 1 action from rules (costs the tick)
5. **Transmit** — hook signals sent (arrive next tick)
6. **Resources** — energy regenerates, material extracted, bandwidth allocated

### Signal Latency

| Architecture | Chain | Total Latency |
|-------------|-------|---------------|
| Direct | Scout → Striker | 2 ticks |
| Via relay (no processing) | Scout → Relay → Striker | 4 ticks |
| Via relay (with compress) | Scout → Relay → Striker | 5 ticks |
| Via command | Scout → Relay → Command → Relay → Striker | 7+ ticks |

Deeper architectures are smarter but slower.

### Perception Model: Visual + Emissions

**Visual perception (radius-based, mutual):** If agent A is within agent B's perception radius, B gains a buffer entry. Both sides see each other if in range.

**Emission detection:** Certain actions emit detectable signals beyond visual range:
- **Movement** — vibration (short range)
- **Combat** — noise (medium range)
- **Hook transmission** — EM signal (medium range)
- **Compression** — processing noise (short range)
- **Base production** — thermal + EM (long range)

**Your architecture is a liability.** A deep hook chain with lots of signal traffic is powerful but electromagnetically loud. A minimal direct-wire setup is quiet but dumb.

---

## Compress Mechanic

Lossy. Takes X signals, keeps X/2 chosen at random, discards the rest.

- **Cost 1 (lossy):** Might randomly discard the critical signal
- **Cost 2 (time):** Takes 1 tick, adds latency
- **Cost 3 (emissions):** Compression emits processing noise

---

## Base + Spawning Model

### Blueprints

In the plan phase, the player designs **blueprints** — agent templates. The base produces copies. Each copy inherits the blueprint's skills, rules, hooks, and context config.

- Tweaking a blueprint affects all FUTURE spawns
- Existing agents keep their config unless a Command agent updates them
- Old agents with bad configs die off naturally — the army self-corrects through attrition + improved blueprints

### Production Queue

The player sets blueprint priority and production cap:
- "Produce up to 4 Scout-Alphas, then 2 Relay-Mains, then 1 Striker-Assault"
- Base produces one agent per N ticks (rate depends on energy)
- Production order matters — it's part of the architecture

### Resources

| Resource | Source | Spent On | Design Tension |
|----------|--------|----------|----------------|
| Energy | Base generates per tick | Spawning agents, active skills | More agents = more eyes but more drain |
| Material | Extracted from map nodes | Spawning agents (initial cost) | Must send agents to harvest = exposure risk |
| Bandwidth | Fixed pool per mission | Hook transmissions | Complex architecture = bandwidth hungry = loud emissions |

---

## Unit Types

| Type | Buffer | Perception | Speed | Skills | Cost |
|------|--------|-----------|-------|--------|------|
| Harvester | 4 | Short (2 tiles) | Medium | extract_material | 2 mat, 1 energy/tick |
| Scout | 6 | Wide (5 tiles) | Fast | patrol, evade | 3 mat, 1 energy/tick |
| Striker | 8 | Narrow (2 tiles) | Medium | engage, breach | 8 mat, 3 energy/tick |
| Relay | 12 | None (receives only) | Stationary | compress, filter, amplify | 5 mat, 2 energy/tick |
| Specialist | 10 | Medium (3 tiles) | Medium | hack, extract | 7 mat, 2 energy/tick |
| Command | 14 | None (receives only) | Stationary | reassign, reroute, prioritize | 10 mat, 4 energy/tick |

### Relay: Why Stationary?

Signal amplifier — needs to be planted. Positioning a relay is like placing a cell tower.

### Command Agent (Meta-Level)

In the spawning model, the command agent can:
- **Modify blueprint configs mid-battle** — all future spawns use the updated blueprint
- **Reroute existing agents** — change hooks/rules on already-spawned units
- **Adjust production priority** — "stop making scouts, we need more strikers"

This is the meta-meta-level: the command agent manages the factory that produces the agents.

---

## Skills Catalog

| Skill | Unit Types | What It Does |
|-------|-----------|-------------|
| extract_material | Harvester | Harvest material from map nodes |
| patrol | Scout | Sweep a defined area systematically |
| evade | Scout | Break contact and reposition when detected |
| engage | Striker | Move to threat and neutralize |
| breach | Striker | Break through a fortified position |
| compress | Relay | Halve buffer contents, randomly choosing which to keep |
| filter | Relay | Drop all signals below a priority threshold |
| amplify | Relay | Boost signal priority so receivers process it first |
| hack | Specialist | Disable electronic defenses (turrets, doors) |
| extract | Specialist | Download data from objective terminals |
| reassign | Command | Change a subordinate's active skill mid-battle |
| reroute | Command | Redirect a subordinate's hook targets mid-battle |
| prioritize | Command | Reorder a subordinate's rules mid-battle |

---

## Mission Arc

### Overview

| # | Name | New Concept | Checkpoints | Model |
|---|------|-------------|-------------|-------|
| 1 | Wake Up | Context config (filters, buffer) | #1 | Hand-configured (2 units) |
| 2 | First Contact | Rules, Hooks, Debrief | #2, #3 | Hand-configured (4 units) |
| 3 | Assembly Line | Base, Blueprints, Spawning, Resources | — | First blueprint mission |
| 4 | Noisy Channel | Skills (compress, filter), Emissions | — | Blueprints + signal processing |
| 5 | Chain of Command | Command agent, dynamic reconfig | #4 | Blueprints + meta-level |
| 6 | Breach | Full system, multi-objective, enemy spawner | #5 | Full production + architecture |
| 7 | The Warden | Enemy base + architecture | #6 | Factory vs. factory |

Each bridge mission creates the problem that the next mission's new concept solves.

---

### Mission 1: Wake Up

**Setup:** 2 pre-spawned units, 6×6 grid, 1 objective. Both frozen — buffers full of noise.
**Primitives:** Context config only.
**Framing:** "SYSTEMS ONLINE... BUFFER CAPACITY: 8 SLOTS... STATUS: OVERLOADED... You need to think. But you can't think if you're listening to everything."

**Journey:**
- Battlefield fades in. Two units pulsing red, jittering. Objective across the grid.
- Click unit → buffer panel: 8/8, mostly noise (floor vibration, EM hum, dust count...).
- Drag noise to IGNORE zone. Buffer drops. Unit stops jittering, turns blue, faces objective.
- **Checkpoint #1:** "I muted the noise and it woke up."
- Execute. Both units pathfind to objective. Complete.

---

### Mission 2: First Contact

**Setup:** 4 pre-spawned units (2 Scouts, 1 Relay, 1 Striker), 10×8 grid, 3 enemies.
**Primitives:** Context config, Rules (new), Hooks (new).
**Framing:** "You have eyes. You have fists. But they don't talk to each other."

**Journey:**
- Naive attempt: filter noise, execute. Scouts spot enemies, get destroyed. Striker idle — buffer empty.
- **Checkpoint #3:** Debrief reveals Striker had no data. Scout had it. No wiring.
- Retry: wire hooks (Scout on_detect → Relay → Striker). Add rule on Striker: "move_toward nearest threat."
- **Checkpoint #2:** Execute. Green pulse travels Scout → Relay → Striker. Flanking emerges.

---

### Mission 3: Assembly Line

**Setup:** Empty board. Base in corner. 2 material nodes. 6 enemy patrols.
**Primitives:** Context config, Rules, Hooks, Base (new), Blueprints (new), Resources (new).
**Framing:** "You configured two agents by hand. Now build the machine that builds them."

**Journey:**
- Empty map. No friendly units. Just the base and material nodes.
- Create Scout blueprint (same config UI as missions 1-2, but editing a template).
- Set production: 3 Scout-Alphas. Execute. Base produces — but material runs out after 2.
- Create Harvester blueprint. Set production: 1 Harvester first. Harvester walks to node, extracts.
- Material flows. Base produces scouts, relay, strikers. Army assembles itself.
- Scouts dying because of bad rules → edit blueprint → future scouts fixed → old ones die off naturally.
- "I fixed a bug in the species, not in an individual."

---

### Mission 4: Noisy Channel

**Setup:** Blueprints + high enemy density. Enemies detect hook transmissions.
**Primitives:** + Skills (new), Emissions (new).
**Framing:** "Your network is powerful. It's also a beacon."

**Journey:**
- Mission 3 architecture works initially. But enemies converge on the relay — not by sight, but by detecting EM emissions from hook traffic.
- Relay destroyed. Architecture collapses.
- Skills as the answer: compress (fewer signals = less emission), filter (less traffic). Or: architectural fix (shorter chains, multiple disposable relays).
- Tradeoff: smarter architecture = louder architecture.

---

### Mission 5: Chain of Command

**Setup:** Blueprints + Command agent. Mid-battle reinforcements from unknown direction.
**Primitives:** + Command agent (new).
**Framing:** "A factory that can't adapt its own blueprints isn't a factory. It's a mold."

**Journey:**
- Blueprint army handles Phase 1. Factory hums.
- Reinforcements from the east. All scouts sweeping north/south (blueprint pattern). Production queue still making north/south scouts. Factory producing the wrong thing.
- Command agent: reroutes scouts, adjusts production priority mid-battle. Factory adapts.
- **Checkpoint #4:** "The factory noticed the problem and changed what it produces."

---

### Mission 6: Breach

**Setup:** Full system. Enemy has a reinforcement spawner. 2 objectives. Turrets.
**Primitives:** All available.
**Framing:** "They have a factory too. Theirs is already running."

**Journey:**
- Enemy spawner produces a patrol every 15 ticks. The longer you take, the harder it gets.
- More enemies → more detections → more hook traffic → relay overload → compress drops turret data → striker walks into turret → command agent buffer fills → factory keeps producing scouts nobody needs → resources depleted → everything collapses.
- **Checkpoint #5:** "The factory broke itself."
- Redesign: kill the spawner first (stop the bleed). Two parallel architectures from one base — strike team and holding force.

---

### Mission 7: The Warden

**Setup:** Enemy has full base + blueprints + factory. Factory vs. factory.
**Framing:** "You built a machine that builds armies. So did it."

**Warden's weaknesses:**

| System | Weakness | Exploit |
|--------|----------|---------|
| Blueprints | Identical patrol patterns | Predictable gaps |
| Production | Fixed priority, never adapts | Keeps making scouts when it needs strikers |
| Relay | Single, no compress/filter | Flood with detections → overload |
| Command | Single point of failure | Overwhelm with simultaneous events |
| Resources | Only harvests 1 of 3 nodes | Capture others → resource advantage |

**Journey:**
- Two factories, one map. Both producing armies in real time.
- Run 1: attrition stalemate. Can't out-build, must out-design.
- Debrief reveals Warden's full system. Player spots weaknesses.
- Counter-factory: decoy blueprints (cheap, clog enemy perception), resource denial team, relay strike team, main force.
- Decoys flood Warden perception → relay overload → architecture collapse → factory is blind.
- **Checkpoint #6:** "I didn't beat an army. I killed a factory."

---

## What's NOT in the First Playable

| Excluded | Reason |
|----------|--------|
| Tech tree | Full game feature. First playable has flat skill/blueprint access per mission. |
| Information warfare (spoofing, jamming, EMP) | Full game. Decoys in Mission 7 are the preview. |
| Counter-intelligence | Full game feature. |
| Meta-progression | Each mission provides its full blueprint library. |
| Multiplayer | Factory vs. factory is the PvP format, but not in first playable. |
| Modding/sharing | No export, templates, or Workshop. |
| Audio | Minimal SFX. No music. |
| Replay/clip export | Not in scope. |

---

## Open Questions

| Question | Current Answer | Risk |
|----------|---------------|------|
| Blueprint editor UX | Same config UI as individual units but editing a template | Could feel identical to v2 — needs to FEEL like designing a species |
| Hook resolution for blueprints | "on_detect → Relay" resolves by type, not individual | What if there are 3 relays? Nearest? Random? Player-configured routing? |
| Production rate tuning | 1 agent per N ticks, N depends on energy | Needs playtesting — too fast = spam, too slow = boring |
| Harvester gameplay | Walk to node, extract | Could feel like busywork. Should harvesting be automatic? |
| Emission balance | Hook transmissions detectable at medium range | Too punishing = nobody uses hooks. Too weak = emissions don't matter. |
| Command agent modifying blueprints mid-battle | Allowed | Could be OP — changes all future spawns. Needs constraints or cost. |
