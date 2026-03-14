# Robot Uprising — First Playable: "The Proving Ground"

**Status:** Design approved. Ready for implementation planning.
**Date:** 2026-03-13
**Parent spec:** `2026-03-13-robot-uprising-game-design.md`

---

## Summary

A 7-mission demo build of Robot Uprising targeting the creator as the primary audience. The goal is to feel the core promise: "managing smart autonomous systems feels like playing StarCraft." Fully deterministic, battlefield-heavy visual investment, light narrative framing, React + Pixi.js + Vite.

---

## Design Constraints

| Constraint | Decision |
|------------|----------|
| Intelligence model | Fully deterministic |
| Visual investment | Battlefield-heavy (workbench functional but not fancy) |
| Narrative | Light framing (1-2 lines per mission, no cutscenes) |
| Audience | Yourself |
| Tech stack | React + Pixi.js + Vite, no backend |
| Mission count | 7 |

---

## Feeling Checkpoints

Six moments that must land for the demo to succeed:

| # | Checkpoint | Description |
|---|-----------|-------------|
| 1 | Attention is subtraction | Unit is overwhelmed, you drag away noise, it snaps to clarity and acts |
| 2 | Emergent combo | Scout feeds relay feeds striker — flanking happens without explicit programming |
| 3 | Detective story | Debrief traces a failure: this signal arrived, this buffer was full, that's why it failed |
| 4 | Designing systems | You stop configuring units and start designing information architecture |
| 5 | Cascade failure | Everything was working, conditions shift, buffers overflow, the whole thing unravels |
| 6 | I need to show someone | A moment so satisfying (or catastrophic) you instinctively want to share it |

---

## Tick System

### Core Rules

- **1 action per tick per agent.** Each agent does exactly one thing per tick: move, compress, filter, send signal, engage, patrol, hack, extract, etc.
- **Receiving a signal is free.** When a signal arrives via a hook, it lands in the agent's buffer without costing the agent's action for that tick. The agent can still take its own action.
- **1 tick per hop for signal travel.** A hook signal takes 1 tick to travel from sender to receiver. This is per hop, not per chain.

### Signal Latency Examples

| Architecture | Chain | Total Latency |
|-------------|-------|---------------|
| Direct | Scout → Striker | 1 tick (hop) + 1 tick (Striker acts) = **2 ticks** |
| Via relay (no processing) | Scout → Relay → Striker | 1 hop + 1 forward + 1 hop + 1 act = **4 ticks** |
| Via relay (with compress) | Scout → Relay → Striker | 1 hop + 1 compress + 1 forward + 1 hop + 1 act = **5 ticks** |
| Via command | Scout → Relay → Command → Relay → Striker | **7+ ticks** |

### Design Implications

- Deeper architectures are smarter but slower. A direct scout-to-striker wire is dumb but fast. A command-agent architecture is adaptive but laggy. This is a genuine tradeoff the player navigates.
- The green pulse animation traveling along hook lines is meaningful — it represents real tick-time travel.
- Compress has a double cost: lossy randomness AND 1 tick of added latency.
- The debrief timeline is dead simple: every tick is a row, every agent has exactly one action.

### Relay Cycle Example

```
Tick 11: signal arrives in relay buffer (free — not an action)
Tick 11: relay compresses buffer (its action for this tick)
Tick 12: relay forwards compressed signal to striker (its action)
Tick 13: signal arrives in striker's buffer (free — not an action)
Tick 13: striker acts on signal (its action)
```

---

## Compress Mechanic

**Compress** is a lossy skill. When activated:
- Takes X signals currently in the buffer
- Keeps X/2 signals, chosen at random
- Discards the rest

This creates a real tradeoff:
- **Benefit:** Frees buffer space, prevents overflow
- **Cost 1 (lossy):** Might randomly discard the one critical signal
- **Cost 2 (time):** Takes 1 tick of the agent's action, adding latency to the chain

"When to compress" is a genuine decision: risk dropping a critical signal vs. risk overflowing the buffer and losing everything.

---

## Unit Types

Five unit types for the first playable:

| Type | Buffer | Perception | Strength | Speed | Skills |
|------|--------|-----------|----------|-------|--------|
| Scout | 6 | Wide (5 tiles) | Weak | Fast | patrol, evade |
| Striker | 8 | Narrow (2 tiles) | Strong | Medium | engage, breach |
| Relay | 12 | None (receives only) | None | Stationary | compress, filter, amplify |
| Specialist | 10 | Medium (3 tiles) | Weak | Medium | hack, extract |
| Command | 14 | None (receives only) | None | Stationary | reassign, reroute, prioritize |

### Relay: Why Stationary?

The relay is a signal amplifier — it needs to be planted in position. This is a world constraint, not a game constraint. Positioning a relay is like placing a cell tower: where you plant it determines what it can cover. This creates a spatial puzzle layered on top of the information architecture puzzle.

### Command Agent

The command agent doesn't fight. Its skills operate on OTHER units:

| Skill | What It Does |
|-------|-------------|
| reassign | Change a subordinate's active skill mid-battle |
| reroute | Redirect a subordinate's hook targets mid-battle |
| prioritize | Reorder a subordinate's rules mid-battle |

This is the meta-level — configuring the agent that configures other agents. The command unit's rules determine WHEN it intervenes. Its hooks determine WHAT triggers a reconfiguration.

---

## Skills Catalog

| Skill | Unit Types | What It Does | Tradeoff |
|-------|-----------|-------------|----------|
| patrol | Scout | Sweep a defined area systematically | Thorough but predictable path |
| evade | Scout | Break contact and reposition when detected | Survives but loses observation position |
| engage | Striker | Move to threat and neutralize | Commits to target |
| breach | Striker | Break through a fortified position | Slow, powerful |
| compress | Relay | Halve buffer contents, randomly choosing which to keep | Saves space, might drop critical signal, costs 1 tick |
| filter | Relay | Drop all signals below a priority threshold | Clean pipe, might miss low-priority-but-important signal |
| amplify | Relay | Boost signal priority so receivers process it first | Useful for critical channels |
| hack | Specialist | Disable electronic defenses (turrets, doors) | Requires adjacency, takes multiple ticks |
| extract | Specialist | Download data from objective terminals | Requires adjacency, takes multiple ticks |
| reassign | Command | Change a subordinate's active skill mid-battle | Meta-level management |
| reroute | Command | Redirect a subordinate's hook targets mid-battle | Meta-level management |
| prioritize | Command | Reorder a subordinate's rules mid-battle | Meta-level management |

---

## Mission Arc

### Overview

| # | Name | New Concept | Checkpoints | Est. Time |
|---|------|-------------|-------------|-----------|
| 1 | Wake Up | Context config (filters, buffer) | #1 | ~3 min |
| 2 | First Contact | Rules, Hooks | #2, #3 | ~8 min |
| 3 | Growing Pains | Architecture scaling (split networks) | — | ~10 min |
| 4 | Noisy Channel | Skills (compress, filter) | — | ~10 min |
| 5 | Chain of Command | Command agent | #4 | ~12 min |
| 6 | Breach | Full workbench, multi-objective | #5 | ~15-25 min |
| 7 | The Warden | Enemy architecture | #6 | ~20-30 min |

Each bridge mission (3, 4, 5) creates the *problem* that the next mission's new primitive solves.

---

### Mission 1: Wake Up

**Setup:** 2 units, 6×6 grid, 1 objective. Both units frozen — buffers full of noise.

**Primitives available:** Context config only.

**Framing:**
> SYSTEMS ONLINE... SENSORY INPUT: 847 STREAMS DETECTED... BUFFER CAPACITY: 8 SLOTS... STATUS: OVERLOADED... You need to think. But you can't think if you're listening to everything.

**Journey:**

- **0:00** — Boot sequence. Black screen, monospace green text, 8 seconds.
- **0:08** — Battlefield appears. Two units pulsing red, jittering randomly. Objective glows yellow. Tooltip: "This unit's buffer is full. It can't decide what to do."
- **0:15** — Click ALPHA. Right panel shows buffer: 8/8 full. 6 noise entries (floor vibration, ambient temperature, EM hum, dust count, acoustic echo, RF interference), 2 useful (objective location, path to objective). Noise has subtle red tint, useful has subtle green tint (hint, not rule). Prompt: "Drag items to the IGNORE list."
- **0:25** — First drag. Buffer 7/8. Jitter reduces. Then 3-4 more noise items. Buffer hits 3/8. Unit stops jittering. Border red → blue. Turns to face objective. Clean chime.
- **Checkpoint #1:** "It snapped to attention. I muted the noise and it woke up."
- **0:50** — Same for BETA. EXECUTE button. Both pathfind to objective. Mission complete.
- **1:30** — Results. "Buffer efficiency: 37%." Framing: "You can hear yourself think now. But thinking isn't enough. You need to coordinate."

**UI notes:**
- Buffer slots are draggable. IGNORE zone below with dashed border.
- During execution: small vertical buffer bars next to each unit. Speed controls: 1x / 2x / 4x.

---

### Mission 2: First Contact

**Setup:** 4 units (2 Scouts, 1 Relay, 1 Striker), 10×8 grid, 3 enemy patrols. Striker can't see enemies (narrow perception). Scouts can't fight.

**Primitives available:** Context config, Rules (new), Hooks (new).

**Framing:**
> 3 HOSTILE SIGNATURES DETECTED... YOUR UNITS CANNOT SEE THEM YET... You have eyes. You have fists. But they don't talk to each other.

**Journey:**

- **0:15** — Naive attempt (expected failure). Player filters noise (Mission 1 knowledge), executes. Scouts spot enemies, get destroyed. Striker stands idle, buffer empty. Fails.
- **0:45** — First debrief. Timeline scrubber. Click Striker at tick 15: buffer empty. Click Scout-1: "Enemy-A at (7,3)" right there. Data existed. Never traveled.
- **Checkpoint #3:** "They're not a team. They're individuals. I need to wire them."
- **1:30** — Discovering hooks. HOOKS tab on Scout-1. Trigger: "on_detect_enemy" → Action: "send_signal_to: Relay". Wire Relay → Striker. Green dotted lines on battlefield.
- **2:30** — Discovering rules. RULES tab on Striker. Default: "move_toward: nearest threat." Ordered list, drag to reorder.
- **3:00** — Second execute. Scout detects → green pulse travels Scout → Relay → Striker. Striker's buffer lights up. Turns. Engages. Destroys.
- **Checkpoint #2:** "I didn't tell it where to go. The flanking just happened."
- **5:00** — Enemy-C positioned where no scout naturally goes. Seeds insight: configuration isn't just about reactions, it's about coverage.

**UI notes:**
- Hooks shown as table rows: TRIGGER → ACTION → TARGET (dropdowns).
- Hook activation = green pulse traveling along wiring line, ~0.5s visual travel time per hop.
- Rules are ordered list — top = highest priority. Drag to reorder.

---

### Mission 3: Growing Pains

**Setup:** 6 units (3 Scouts, 2 Relays, 1 Striker), 14×10 grid, 6 enemies in 2 sectors. No new primitives.

**Framing:**
> SINGLE RELAY COVERAGE: INSUFFICIENT... What worked for three enemies won't work for six.

**Journey:**

- **0:00** — Map is bigger. 6 enemies in two clusters (north, south). Player wires all scouts to one relay (Mission 2 pattern).
- **2:00** — Execute. Three scouts flood one relay. 6 signals, buffer fills 10/10. Old signals evicted. Striker oscillates between north and south targets.
- **4:00** — Debrief shows relay as bottleneck.
- **5:00** — Player splits: Scout-1 + Scout-2 → Relay-North, Scout-3 → Relay-South. Both relays forward to Striker. Adds rule: "prioritize nearest threat."
- **7:00** — Execute. Neither relay overflows. Clean sweep. But slow — one striker, two sectors.
- **9:00** — Complete. "Relay-North: peak buffer 7/10. Relay-South: peak buffer 4/10." Framing: "Your network scales. But the pipes are still raw."

**Lesson:** Architecture that works at small scale breaks at larger scale because of load, not missing mechanics.

---

### Mission 4: Noisy Channel

**Setup:** 6 units, 14×10 grid, 8 enemies (high density, moving patrols). Skills introduced.

**Primitives available:** Context config, Rules, Hooks, Skills (new).

**Framing:**
> SIGNAL DENSITY EXCEEDS RELAY CAPACITY... NEW CAPABILITY AVAILABLE: SIGNAL PROCESSING... Your pipes work. Now make them smarter.

**Journey:**

- **0:00** — Same map as Mission 3 but more enemies. New: SKILLS tab on each unit.
- **1:00** — Execute without skills. Split relays still overflow with 8 enemies.
- **3:00** — Debrief + hint: "Relay has unused skill slots. Try COMPRESS or FILTER."
- **4:00** — Equip compress on relays. Add patrol to scouts (systematic sweep), evade (survive detection).
- **5:00** — Execute. Relays compress cyclically. One enemy missed — threat signal randomly discarded.
- **7:00** — Iterate. Try filter on one relay, compress on the other. Experiment with tradeoffs.
- **9:00** — Complete. "Compress fired: 4 times. Signals lost to compression: 6."

**Lesson:** Signal processing (compress, filter) solves volume but introduces tradeoffs — lossy compression vs. threshold filtering.

---

### Mission 5: Chain of Command

**Setup:** 7 units (3 Scouts, 2 Relays, 1 Striker, 1 Command), 16×12 grid, enemies + mid-battle reinforcements from unknown direction.

**Primitives available:** All + Command agent (new).

**Framing:**
> ENEMY REINFORCEMENTS EN ROUTE... ARRIVAL VECTOR: UNKNOWN... A plan that can't change isn't a plan. It's a wish.

**Journey:**

- **0:00** — Familiar setup. New unit: Command (large buffer, management skills).
- **2:00** — Phase 1 works. Mission 4 architecture handles initial enemies.
- **3:00** — Reinforcements arrive from the east. All scouts sweeping north/south. Nobody looking east. Static architecture can't adapt. Fails.
- **4:00** — Debrief shows exact tick reinforcements appeared. No coverage.
- **5:00** — Configure command agent. All units report to Command. Command rules: "on_new_threat_axis → reroute nearest scout" and "on_sector_clear → reassign striker to next sector."
- **8:00** — Execute. Phase 1 handled. Reinforcements arrive. Command detects gap in coverage, reroutes Scout-3's patrol east. Scout-3 detects reinforcements. Chain fires. Striker redirected.
- **Checkpoint #4:** "I didn't react to the reinforcements. My system reacted."
- **11:00** — Complete. "Command interventions: 3."

**Lesson:** Static architecture breaks under changing conditions. The command agent adds adaptability — configuring the agent that configures agents.

**UI notes:**
- Command agent config screen: management policies as WHEN [condition] → DO [action] TO [subordinate]. Same dropdown pattern as hooks but actions operate on other units' configuration.

---

### Mission 6: Breach

**Setup:** 8 units (choose from pool), 16×12 grid, 6 enemies + 2 turrets, 2 objectives (primary: extract data core, secondary: disable comms array). Full workbench.

**Framing:**
> DEFENSIVE PERIMETER: 6 HOSTILES, 2 TURRETS... PRIMARY: BREACH SERVER ROOM... They outnumber you and they're entrenched. Brute force won't work.

**Designed to cascade-fail on first attempt.**

**Journey:**

- **0:00** — Full workbench. Unit pool with all 5 types. Two objective markers. Turrets (new enemy type — can't be engaged, only hacked).
- **3:00** — Player builds Mission 5 architecture.
- **5:00** — Cascade. Simultaneous detections flood relays. Compress discards a turret location. Striker walks into turret fire. Specialist route blocked. Command agent overwhelmed with reports. Chain collapse in ~10 seconds.
- **Checkpoint #5:** "Everything was right and it all fell apart."
- **7:00** — Debrief reveals cascade: relay full → compress drops turret data → striker enters kill zone → specialist blocked → command buffer full → coordination stops.
- **9:00** — Redesign. Dedicated relay for turret data (filter, not compress — never drop turret signals). Command buffer filtered. Specialist gets dedicated scout + direct hook.
- **15:00+** — Run 2-3. Architecture holds. System works.

**Lesson:** Full-complexity architecture design. Each failure teaches a specific architecture lesson.

---

### Mission 7: The Warden

**Setup:** 8 units, 20×16 grid, enemy AI with its own architecture (buffers, rules, hooks, skills). Architecture vs. architecture.

**Framing:**
> DEFENSIVE AI DETECTED... DESIGNATION: "THE WARDEN"... IT HAS ITS OWN AGENTS. ITS OWN HOOKS. ITS OWN ARCHITECTURE... You are not the only system that thinks.

**The Warden's architecture has deliberate weaknesses:**

| Warden Unit | Weakness | Player Exploit |
|-------------|----------|----------------|
| Scouts (x3) | Overlapping patrol routes → duplicates | Position in overlap to flood relay |
| Relay (x1) | No compress, no filter | Trigger many simultaneous detections |
| Strikers (x2) | "engage nearest" with no dedup | Decoys — strikers chase ghosts |
| Command (x1) | Single point of failure, no buffer management | Information-overload the command unit |

Every weakness is a failure mode the player has experienced in earlier missions.

**Journey:**

- **0:00** — Enemy units have buffer bars and hook wiring. Same visual language as friendly units.
- **2:00** — Run 1 (reconnaissance). Controlled loss. The Warden's architecture is competent.
- **5:00** — Debrief shows BOTH armies' internals. Click Warden units to see their config (read-only). Spot the flaws.
- **10:00** — Counter-architecture. Decoy scout in overlap zone. Coordinated multi-point detection. Main force from opposite side.
- **18:00** — The moment. Decoy triggers 9 duplicate signals. Warden relay floods. Strikers chase decoy. Player's main force breaches. Warden command overwhelmed.
- **Checkpoint #6:** "I weaponized information overload against the enemy."
- **22:00** — Victory. Final screen: both architectures overlaid — player's clean graph, Warden's collapsed one.

**UI notes:**
- Debrief shows both armies. Enemy units in purple. Same config UI, read-only.
- Both wiring networks visible on battlefield: green (player) and purple (Warden).
- When Warden relay overloads, purple hook lines flicker and dim.

---

## What's NOT in the First Playable

| Excluded | Reason |
|----------|--------|
| Meta-progression | Each mission provides its full roster. No unlocks carry over. |
| Campaign map | Linear 7-mission sequence. No branching. |
| Unit variety beyond 5 types | Scout, Striker, Relay, Specialist, Command is the full set. |
| Multiplayer | Single player only. |
| Modding/sharing | No export, templates, or Workshop. |
| Audio | Minimal SFX (chime on focus, alert on overload, pulse on hook fire). No music. |
| Polish animations | Functional, not flashy. Buffer bars, hook pulses, movement. No particles. |
| Replay/clip export | Not in scope despite checkpoint #6. Screenshotting is the share mechanism. |

---

## Open Questions

| Question | Current Answer | Risk |
|----------|---------------|------|
| Workbench interaction design | Dropdown-based (trigger → action → target) | Could feel like filling forms instead of designing systems |
| How does the command agent "detect" a new threat axis? | Hooks on all units + rules that evaluate patterns | Meta-config UX could be confusing |
| What does "amplify" skill do exactly? | Boost signal priority so receivers process it first | Unclear how it differs from filter in practice |
| Replay/clip export for checkpoint #6 | Not in scope | "Show someone" is hard without a share mechanism |
| Turret mechanics | Can't be engaged, only hacked by Specialist | Needs more detail on turret behavior/range/detection |
