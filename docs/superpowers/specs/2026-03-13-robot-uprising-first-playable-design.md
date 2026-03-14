# Robot Uprising — First Playable: "The Proving Ground"

**Status:** Design approved (v6 — plan screen, sealed watch, inspector; discrete tick-based battlefield; one-shot combat).
**Date:** 2026-03-13 (updated 2026-03-14)
**Parent spec:** `2026-03-13-robot-uprising-game-design.md`

---

## Summary

A 10-mission demo build of Robot Uprising targeting the creator as the primary audience. The goal is to feel the core promise: "managing smart autonomous systems feels like playing StarCraft." Fully deterministic, battlefield-heavy visual investment, boot log narrative framing, React + Pixi.js + Vite.

**v5 shift (research-informed):** Missions 1-4 teach wiring and information architecture with pre-placed units. The factory (base + blueprints + spawning) doesn't appear until Mission 5. This gives the core mechanic — context management and signal routing — room to breathe before layering on production. Reverse loop research on spawn semantics, hook semantics, Gladiabots debugging patterns, and debrief structure informed this restructure.

---

## Design Constraints

| Constraint | Decision |
|------------|----------|
| Intelligence model | Fully deterministic |
| Visual investment | Battlefield-heavy (workbench functional but not fancy) |
| Narrative | Boot log — self-documenting subsystem initialization (see Boot Log section) |
| Audience | Yourself |
| Tech stack | React + Pixi.js + Vite, no backend |
| Mission count | 10 |
| Tutorial model | Missions 1-4 hand-configured (pre-placed units), Mission 5 introduces factory |
| Army model | Blueprint + base spawning (not individual unit config) |
| Plan phase | Pre-execution only. No pausing to redesign. Command agent is the only mid-battle adaptation. |
| Hook routing | Channel-based. One channel per hook. Blueprints wire to named channels, not individual units. |
| Resource model | Passive income per tick (no harvesters). Controlling map nodes boosts income via tagging. |
| Scenario model | Invisible randomization — each execute varies within constraints. Debrief shows run stats. |
| Debrief model | Two-act: sealed watch (no tools, no skip) → inspector (full analytical tools) |
| Combat model | One-shot, one-kill. No HP. Adjacent striker = instant elimination. |
| Battlefield feel | Discrete tick-based (Into the Breach pacing). Central tick clock fires → all units resolve → read state → next tick. No smooth animation between ticks. Units snap to grid positions. |
| Board size | 8x8 grid. Visible tiles with checkerboard, corner ticks, axis labels (A-H, 1-8). |

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

## Cross-Cutting Systems

### Boot Log (Diegetic Tutorial)

Each mission starts with a boot log entry — your own subsystems initializing. You're an AI reading your own spec sheet as it writes itself.

```
── SUBSYSTEM ONLINE ────────────────────
MODULE: Hook routing
CAPABILITY: Route typed signals between registered agents
CONSTRAINT: 1 channel per hook slot, 1 tick latency per hop
STATUS: Ready
────────────────────────────────────────
```

- Each entry is 3-5 lines. No lore, no character, just clinical self-documentation.
- Unlocked subsystems persist in a "System Status" panel accessible from the workbench.
- The boot log IS the manual — if a player forgets how compress works, they check their own system status.
- The document IS you waking up. Each mission = a new subsystem coming online.

### Two-Act Debrief

Every mission debrief has two temporally separated phases:

1. **Sealed watch** — the replay plays. No tools, no overlays, no skip (not even on retry). Just watch what happened. Player can speed up but can't pause or inspect. Ends with a result screen. If the player doesn't want to watch, the game isn't fun enough — the sealed watch is a quality signal, not a gate.
2. **Inspector** — full analytical tools unlock. Replay scrubbing, buffer inspector (per-slot contents with type/value/age), action trace, hook activity, pressure thermometer, emission overlay, channel metrics. Player digs into why.

The sealed watch builds emotional investment. The inspector turns that emotion into insight.

**Inspector tools (available from Mission 1):**
- Buffer inspector: per-slot contents (type, value, age, fidelity)
- Action trace: what each agent did each tick and why
- Active hooks: which hooks fired, which were silent
- Buffer pressure thermometer: visual fill indicator over time
- Channel metrics (from Mission 5): signals sent/dropped per channel, peak throughput
- Emission overlay (from Mission 4): EM signature heatmap
- Spatial heatmap: where buffer overflows clustered

### Invisible Randomization

Each time the player hits execute, the scenario varies within constraints. No explicit test suite UI.

| Mission | What Varies |
|---------|------------|
| 1 | Objective position, noise composition |
| 2 | Enemy count (2-4), approach direction, scout starting positions |
| 3 | Enemy count (4-6), attack timing (simultaneous vs staggered), direction distribution |
| 4 | Enemy detection sensitivity, relay starting position |
| 5+ | Enemy patrol routes, node positions, wave timing |
| 9-10 | Enemy blueprint priorities, relay placement, production rotation |

The debrief shows "runs: N, passed: M" so the player naturally discovers their architecture needs to generalize. Retry feels fresh because the scenario is different each time.

### Tagging (Map Node Control)

Tagging is the mechanic for controlling map nodes. An agent "tags" a node by being the only force in proximity — presence-based control, not a capture action. If contested, the node is untagged. Tagging a node boosts resource income while held. This creates map control as a passive consequence of positioning, not a separate minigame.

---

## Three-Screen Loop

The game has three screens that share the same 8x8 board. The board is always visible — only the surrounding UI changes. This makes transitions seamless and keeps the player spatially grounded.

1. **Plan screen** — board left, workbench right, EXECUTE button top-right
2. **Sealed watch** — board center, tick clock top, buffer bars on units, sidebar with live stats
3. **Inspector** — board center (scrubable), click-to-inspect units, analytical tools in sidebar

Transition: Plan → hit Execute → workbench slides out, tick clock slides in, ghost units solidify as base starts producing. Watch ends → tools fade in, scrubber appears. Inspector → hit Redesign → back to Plan with the same board.

---

## Plan Screen

The plan screen is where the player designs their architecture before hitting execute. Split view: 8x8 board on the left, workbench panel on the right.

### Layout

**Left: 8x8 board** — identical grid to the watch phase. Shows:
- Terrain, enemy starting positions, material nodes, your base
- Ghost units (semi-transparent) appear near the base as you add to the production queue
- Perception radii shown as dashed circles on ghost scouts
- Channel wiring shown as colored lines connecting ghost units that share a channel
- Ghost units use the same icons as the watch phase (👁📡⚔) but at 50% opacity

**Right: Workbench panel** — three vertically stacked sections, collapsible:
1. Blueprints — list of created blueprint configs
2. Production Queue — conveyor belt strip
3. Channel Map — auto-generated topology summary (read-only)

**Top: Mission briefing bar** — replaces the tick clock. Shows mission name, objective, boot log reference. EXECUTE button on the right — big, prominent, the moment of commitment.

### Blueprint Editor

Click a blueprint in the list (or "+ New Blueprint") to expand its config. Everything else collapses.

**Blueprint header:**
- Unit type selector (Scout / Relay / Striker / Specialist / Command)
- Name field — defaults to "Scout-Alpha", player can rename
- Stats shown as read-only: buffer size, hook slots, perception, speed, cost

**Four config sections, stacked vertically:**

**1. Skills** — checkboxes. Each unit type has 2 skills. Toggle on/off. Scout: patrol ☑ / evade ☐. Simple, no complexity.

**2. Rules** — ordered list. Each rule is a condition → action pair from dropdowns:
- `IF [threat in buffer] → [move_toward]`
- `IF [no threat] → [patrol]`
- Drag to reorder priority. Top rule wins. Max 4 rules per blueprint.
- Live feedback: adding a patrol rule shows a dotted patrol path on the ghost unit. A move_toward rule shows a small arrow icon.

**3. Hooks** — the core interaction. Each hook slot shows:
- Trigger: `on_detect` / `on_receive` / `on_buffer_full` (dropdown)
- Action: `send` / `forward` / `compress_then_forward` (dropdown)
- Channel: text field with autocomplete from existing channel names. Typing a new name creates a new channel.
- Live feedback: as you type a channel name, a colored line appears on the board connecting this ghost to all other ghosts on that channel.

**4. Context config** — the "what to ignore" panel (familiar from Mission 1):
- List of signal types (movement vibration, EM hum, thermal, etc.)
- Toggle each to LISTEN or IGNORE
- Priority slider for remaining types (threats > signals > noise)
- Ghost unit's perception radius dims ignored types visually.

**Channels emerge from hooks.** There is no separate channel editor. When you configure a hook and type a channel name, if it doesn't exist yet, it's created. The channel map assembles itself from the hook configs across all blueprints.

**No save button.** Config is always live. Every change = immediate spatial feedback on the board.

### Production Queue (Conveyor Belt)

A horizontal strip pinned to the bottom of the workbench panel. Always visible even when editing a blueprint.

- A row of slots left-to-right. Each slot holds one blueprint icon colored by type, with the blueprint name in tiny text below ("S-α", "R-m", "K-a").
- Drag blueprints from the list onto the strip. Drag within the strip to reorder. Click to remove.
- Left-to-right = build order. First slot = first unit produced.
- Subtle conveyor belt texture (dashes moving left-to-right) reinforces the factory metaphor.

**Cost preview below the strip:**
- Per-slot material cost (e.g. "3m")
- Running total: "Total: 34m | Base income: 5m/tick | First unit: tick 1 | Full queue: ~tick 18"

**Ghost units on the board:**
- First 3-4 ghosts visible near the base in queue order
- Beyond that, a "+3 more" indicator
- Each ghost shows its channel wiring lines — full architecture preview before execution

**Connection to command agent (Mission 6+):** The production queue is what the command agent rearranges mid-battle. Same visual strip, same interaction model — but during execution, only the command agent can touch it.

### Channel Map (Auto-Generated)

A small read-only panel below the production queue. Assembles itself as hooks are wired across blueprints.

**Format:**
```
recon-net    S-α →  R-m
strike-net   R-m →  K-a
```

Each row: channel name, colored dot matching the line color on the board, then the flow (senders → listeners).

**Interaction:**
- Hover a row → its line highlights on the board, all other lines dim
- Click a row → jumps to the first blueprint that sends on that channel
- Dead-end warning: `⚠ no listeners` if a channel has senders but no receivers
- Slot usage: `S-α: 1/2 hooks used` if a blueprint has empty hook slots

---

## Sealed Watch (Execution Phase)

The sealed watch is the execution phase. The player has hit Execute — hands off.

### Tick Clock

A prominent horizontal strip of pips at the top of the screen, replacing the mission briefing bar. Each pip represents one tick. When a tick fires:
1. The pip fills (amber)
2. All units resolve simultaneously (move, perceive, act, transmit)
3. The board snaps to the new state
4. The player reads the new state
5. Next tick fires

**Pacing:** 1 second per tick default. Speed controls: 0.5x (2s), 1x (1s), 2x (0.5s).

### Board During Watch

Same 8x8 grid. Units snap to grid positions each tick — no smooth movement, no traveling signal animations. Everything resolves discretely.

- **Units** show buffer bars (tiny colored pips at the bottom of each tile)
- **Overloaded units** jitter in place (buffer full)
- **Combat** flashes the cell red — one shot, one kill, enemy disappears next tick
- **Signal delivery** flashes the target cell green — signal arrived in buffer this tick
- **Dead enemies** show ☠ on the tile

### Sidebar During Watch

- Buffer state for all units (updating each tick)
- Hook activity (which hooks fired this tick)
- Signal log (scrolling list of events)

### No Skip, No Pause, No Tools

The sealed watch cannot be skipped, paused, or inspected — not even on retry. If the player doesn't want to watch, the game isn't fun enough. The sealed watch is a quality signal.

---

## Inspector (Debrief Phase)

After the sealed watch ends (pass or fail), the Inspector fades in. Same board, same grid — but now with full analytical tools.

### Scrubber

A timeline scrubber replaces the tick clock. The player can step forward/backward through every tick, or click anywhere on the timeline to jump. Arrow keys work. The board snaps to the state at that tick.

### Click-to-Inspect

Click any unit on the board to see its buffer state at the current tick:
- Per-slot contents (type, value, age)
- Signals that were dropped at this tick (highlighted in red)
- Root cause annotation: "DROPPED: ▲3 — buffer was 8/8"

### Queue Depth Chart

A bar chart showing K₁ (or any selected unit) buffer fill over time. Color-coded: green (healthy), amber (near capacity), red (full/dropping). A cyan marker shows the current scrub position. A dashed red line marks "FULL" capacity.

### Channel Metrics (Mission 5+)

Per-channel stats: signals sent, signals dropped, peak throughput, which tick peaked.

### Mission Summary

Final stats: ticks played, enemies killed, signals sent/dropped, relay usage, architecture type.

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

## Channels

The communication topology primitive. Channels are named pipes that connect blueprints at the type level.

### How Channels Work

- A hook fires ON a channel: "on_detect_enemy → send on `east-net`"
- A hook listens ON a channel: "on_receive[`east-net`] → forward on `strike-net`"
- **One channel per hook slot.** Each hook occupies one slot and is bound to one channel.
- **All instances receive.** If 3 relays listen on `east-net`, all 3 get every signal on that channel.

### Why Channels

Blueprints can't reference individual units ("send to Relay-1") because units are spawned copies. Channels solve this: blueprints reference named channels, not individuals. The player's real design artifact is the **channel map** — the topology of named communication pipes.

### Channel Map Example

```
east-net:    Scout-East → Relay-Tactical → Striker-Assault
west-net:    Scout-West → Relay-Main → Striker-Assault
command-net: Relay-Tactical + Relay-Main → Command-Overseer
strike-net:  Command-Overseer → Striker-Assault
```

### Debrief Shows Channel Metrics

The debrief is a **systems dashboard**, not a unit inspector:
- "east-net: 23 signals, 2 dropped, peak throughput tick 34"
- "west-net: 8 signals, 0 dropped"
- "command-net: 5 signals, 1 overflow at tick 52"
- Heatmap: where on the map buffer overflows clustered
- Aggregate per blueprint: "Scout-East: 5 instances, avg buffer 78%, 2 destroyed"

---

## Base + Spawning Model

### Plan Phase

The plan phase is **pre-execution only.** The player:
1. Designs blueprints (skills, rules, hooks with channel bindings, context config)
2. Designs the channel map (the communication topology)
3. Sets production queue (priority, caps)
4. Hits execute

No pausing to redesign. The command agent is the only way to adapt mid-battle.

### Blueprints

Agent templates. The base produces copies. Each copy inherits the blueprint's skills, rules, hooks, and context config.

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
| Material | Base generates per tick, boosted by tagging map nodes | Spawning agents (initial cost) | Tagging nodes = exposure but faster production |
| Bandwidth | Fixed pool per mission | Hook transmissions | Complex architecture = bandwidth hungry = loud emissions |

---

## Unit Types (5 Total)

| Type | Buffer | Hook Slots | Perception | Speed | Skills | Cost |
|------|--------|-----------|-----------|-------|--------|------|
| Scout | 6 | 2 | Wide (5 tiles) | Fast | patrol, evade | 3 mat, 1 energy/tick |
| Striker | 8 | 2 | Narrow (2 tiles) | Medium | engage, breach | 8 mat, 3 energy/tick |
| Relay | 12 | 4 | None (receives only) | Stationary | compress, filter, amplify | 5 mat, 2 energy/tick |
| Specialist | 10 | 2 | Medium (3 tiles) | Medium | hack, extract | 7 mat, 2 energy/tick |
| Command | 14 | 6 | None (receives only) | Stationary | reassign, reroute, prioritize | 10 mat, 4 energy/tick |

### Hook Slots as Constraint

Hook slots limit how many channels an agent can participate in. A relay with 4 hook slots can listen/send on 4 channels max. Need a 5th? You need a second relay. A command agent with 6 slots can monitor 6 channels — need a 7th? Either add another command agent or have a relay aggregate two channels into one.

This creates a natural complexity ceiling. You can't build an infinitely connected architecture.

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
| 2 | First Contact | Rules, Hooks (fire-and-forget, invisible drops) | #2, #3 | Hand-configured (4 units) |
| 3 | Blind Spots | Relay, hook chains, queue depth visible in debrief | — | Hand-configured (6 units) |
| 4 | Noisy Channel | Skills (compress, filter), Emissions | — | Hand-configured (6-8 units) |
| 5 | Assembly Line | Base, Blueprints, Channels, Resources | — | First blueprint mission |
| 6 | Chain of Command | Command agent, dynamic reconfig | #4 | Blueprints + meta-level |
| 7 | Pressure Test | Production tuning, resource denial via tagging | — | Full production |
| 8 | Breach | Multi-objective, enemy spawner, Specialist | #5 | Full system |
| 9 | Arms Race | Enemy base, counter-architectures | — | Factory vs factory (intro) |
| 10 | The Warden | Enemy base + full architecture | #6 | Factory kills factory |

Each bridge mission creates the problem that the next mission's new concept solves.

---

### Mission 1: Wake Up

**Setup:** 2 pre-spawned units, 6x6 grid, 1 objective. Both frozen — buffers full of noise.
**Boot log:** `MODULE: Context filtering — CAPABILITY: Designate observations as ignored, reducing buffer pressure`
**Primitives:** Context config only.

**Journey:**
- Battlefield fades in. Two units pulsing red, jittering. Objective across the grid.
- Click unit → buffer panel: 6/6, mostly noise (floor vibration, EM hum, dust count, thermal variance, acoustic echo, power fluctuation).
- Drag noise entries to IGNORE zone. Buffer drops to 2/6. Unit stops jittering, turns blue, faces objective.
- **Checkpoint #1:** "I muted the noise and it woke up."
- Hit execute. Sealed watch: ~5 seconds, both units pathfind to objective. Clean.
- Inspector unlocks. First exposure to buffer state over time — nothing went wrong, so it's just orientation.
- Hit execute again. Objective position shifted. Noise composition different. Still works? Architecture generalizes.

**Randomization:** Objective position and noise composition vary. Some runs have 5 noise entries, some have 7 (one unit has a larger buffer to compensate). Player learns that the specific noise doesn't matter — the act of filtering matters.

---

### Mission 2: First Contact

**Setup:** 4 pre-spawned units (2 Scouts, 1 Relay, 1 Striker), 10x8 grid, 2-4 enemies (randomized).
**Boot log:** `MODULE: Behavioral rules — CAPABILITY: Prioritized condition→action pairs governing agent decisions` then `MODULE: Hook routing — CAPABILITY: Route typed signals between agents, fire-and-forget delivery`
**Primitives:** Context config, Rules (new), Hooks (new).

**Journey:**
- Attempt 1: filter noise on all units, execute. Scouts spot enemies, get destroyed. Striker sits idle — buffer empty, no data, no action.
- Sealed watch: player watches the scouts die while the striker does nothing. Emotional.
- Inspector: striker's buffer was empty the entire run. Scout had threat data. No connection between them.
- Wire hooks: Scout on_detect → Striker. Add rule on Striker: "if threat in buffer → move toward."
- Execute again. Green pulse travels Scout → Striker. Striker engages. Flanking emerges from positioning, not from explicit programming.
- **Checkpoint #2:** "I didn't program flanking. It happened because of where the scout was."
- **Checkpoint #3:** Debrief reveals signal chain — where data flowed, where it didn't.
- Signal drops happen silently — if two scouts detect simultaneously and the striker's buffer is small, one signal just doesn't arrive. No error, no warning. The player might not even notice yet.

**Randomization:** Enemy count (2-4), approach direction, scout starting positions. Forces hooks to work regardless of specific geometry.

---

### Mission 3: Blind Spots

**Setup:** 6 pre-spawned units (3 Scouts, 1 Relay, 2 Strikers), 14x10 grid, 4-6 enemies from multiple directions.
**Boot log:** `MODULE: Signal relay — CAPABILITY: Receive, buffer, and forward signals across agent chains` then `MODULE: Queue diagnostics — CAPABILITY: Inspect signal queue depth and drop history in debrief`
**Primitives:** Context config, Rules, Hooks, Relay as wiring hub (new concept — relays were available in M2 but unused).

**Journey:**
- Direct Scout → Striker hooks from Mission 2 don't scale. 3 scouts all flooding 2 strikers. Striker buffers overflow. Signals drop. Enemies slip through.
- Sealed watch: one flank gets destroyed, the other striker wanders toward the wrong threat because its buffer has stale data from the opposite side.
- Inspector reveals the new diagnostic: **queue depth timeline**. Player sees the striker's buffer spike to 8/8 at tick 12, signal from east scout dropped at tick 13, that was the flank attack signal.
- "I can see exactly which signal got dropped and when. The east flank died because the striker was full of north data."
- Solution: route scouts through the relay. Relay has buffer 12, can hold more. The relay becomes the hub — hub-and-spoke topology discovered.
- Execute. Relay aggregates, strikers get cleaner data. Works on 4 enemies. Run again — 6 enemies, relay overflows. Player adjusts routing or adds priority rules.

**Randomization:** Enemy count (4-6), attack timing (simultaneous vs staggered), direction distribution. Staggered attacks are easier (relay processes sequentially). Simultaneous attacks expose buffer limits.

---

### Mission 4: Noisy Channel

**Setup:** 6-8 pre-spawned units (3 Scouts, 2 Relays, 2-3 Strikers), 16x12 grid, 6-8 enemies that detect hook transmissions.
**Boot log:** `MODULE: Signal compression — CAPABILITY: Halve buffer contents, lossy, 1 tick latency, emits processing noise` then `MODULE: Emission model — CAPABILITY: Actions produce detectable electromagnetic signatures`
**Primitives:** + Skills (compress, filter), Emissions (new).

**Journey:**
- Mission 3 architecture works initially. Then enemies converge on the relay — not by sight, but by detecting EM emissions from hook traffic.
- Sealed watch: enemies beeline for the relay. It gets destroyed. Architecture collapses. Scouts keep detecting but signals go nowhere.
- Inspector: emission overlay shows the relay as a bright EM beacon. Each signal transmission lit it up. Enemies tracked the emissions.
- Skills as the answer: compress (fewer signals = fewer transmissions = less EM), filter (drop low-priority before forwarding). Or architectural fix: shorter chains, multiple disposable relays spread across the map.
- Tradeoff becomes visceral: smarter architecture = louder architecture. Compress helps but is lossy — might randomly discard the critical signal.

**Randomization:** Enemy detection sensitivity varies, relay starting position varies. Some runs the relay is well-hidden and lasts longer — player learns that placement matters alongside wiring.

---

### Mission 5: Assembly Line

**Setup:** Empty board. Base in corner. 2 material nodes. 6 enemy patrols.
**Boot log:** `MODULE: Blueprint system — CAPABILITY: Design agent templates; base produces copies` then `MODULE: Channel routing — CAPABILITY: Named communication pipes connecting blueprint types` then `MODULE: Resource management — CAPABILITY: Energy, material, bandwidth allocation`
**Primitives:** All previous + Base, Blueprints, Channels, Resources (new).

**Journey:**
- Empty map. No friendly units. Just the base. Three boot log entries — biggest unlock so far.
- Create Scout blueprint — same config UI from Missions 1-4, but now editing a template. Assign hooks to a channel ("recon-net").
- Create Relay blueprint — listens on "recon-net", forwards on "strike-net".
- Create Striker blueprint — listens on "strike-net".
- Set production queue: 3 scouts, 1 relay, 2 strikers. Execute.
- Sealed watch: base hums. First scout emerges. Then another. Relay plants itself. Strikers roll out. The army assembles itself. Scouts patrol, detect enemies, report on recon-net. Relay receives, forwards on strike-net. Strikers engage.
- It's the Mission 2-4 architecture — but the player didn't place any units. The factory built it.
- Scouts dying because of bad rules → edit blueprint → future scouts fixed → old ones die off naturally. "I fixed a bug in the species, not in an individual."
- Tagging material nodes speeds up production — send a scout to hold a node for the income boost.
- Inspector shows channel-level metrics for the first time: "recon-net: 14 signals, 1 dropped. strike-net: 8 signals, 0 dropped." Blueprint-level stats: "Scout-Alpha: 5 spawned, 2 destroyed, avg buffer 62%."

**Randomization:** Enemy patrol routes and node positions vary. Some runs require tagging nodes early for income; others let you build up first.

---

### Mission 6: Chain of Command

**Setup:** Blueprint army + Command agent. Mid-battle reinforcements arrive from an unknown direction.
**Boot log:** `MODULE: Command delegation — CAPABILITY: Reassign skills, reroute hooks, reprioritize rules on subordinates mid-execution`
**Primitives:** + Command agent (new).

**Journey:**
- Phase 1: blueprint army handles initial enemies. Factory hums. Feels good.
- Phase 2: reinforcements arrive from the east. All scouts sweeping north/south (blueprint pattern). Production queue still making north/south scouts. Factory producing the wrong thing for the new threat.
- Sealed watch: player watches the east flank collapse while the factory keeps stamping out north-facing scouts. Painful.
- Inspector: command agent's buffer shows it received the east detection — but had no rules for rerouting production.
- Add command rules: "if threat reports from uncovered direction > 2 → reroute scout patrol patterns" and "if losses > production rate → adjust priority to replace losses."
- Execute. Command agent detects the east surge, reroutes scouts, adjusts production. Factory adapts.
- **Checkpoint #4:** "The factory noticed the problem and changed what it produces. I didn't intervene — the command agent did."

**Randomization:** Reinforcement direction and timing. Sometimes east, sometimes west, sometimes split. Sometimes early, sometimes late. The command agent's rules have to generalize.

---

### Mission 7: Pressure Test

**Setup:** Full production. Constrained resources. 3 material nodes (enemies guarding 2). Sustained enemy waves.
**Boot log:** `MODULE: Resource economics — CAPABILITY: Production rate scales with tagged territory`
**Primitives:** All previous. No new mechanics — mastery under constraint.

**Journey:**
- Resources are tight. Base income alone can't sustain the army needed to hold the map.
- Naive approach: build a big army. Runs out of material. Production stalls. Enemies overwhelm.
- Sealed watch: army crumbles as production flatlines.
- Inspector: resource graph shows material income vs spend. Crossover point where spend exceeded income. After that, army shrank while enemies didn't.
- Solution: tag material nodes for income boost. But nodes are guarded — need to invest units to take them. Risk/reward: send strikers to a node = fewer strikers on defense.
- Command agent managing production priority becomes critical: "if material < threshold → produce scouts to tag nodes, not strikers."
- Bandwidth as second constraint: complex channel maps eat bandwidth. Player might need to simplify architecture to afford more agents.

**Randomization:** Node positions, guard strength, wave timing. Some runs reward early aggression (tag nodes fast). Others punish it (guards too strong, lose the investment).

---

### Mission 8: Breach

**Setup:** Full system. Enemy has a reinforcement spawner. 2 objectives (data terminal + power core). Turrets. Walls.
**Boot log:** `MODULE: Tactical specialization — CAPABILITY: Hack disables electronic defenses; Extract downloads objective data`
**Primitives:** All previous. Specialist unit fully utilized for the first time.

**Journey:**
- Two objectives, each behind different defenses. Turrets cover approaches. Enemy spawner produces a patrol every 15 ticks.
- The longer you take, the harder it gets. Clock pressure is the new constraint.
- Naive approach: brute force with strikers. Turrets shred them. Specialists needed to hack turrets first.
- But specialists are fragile and need escort. Architecture challenge: coordinate a hack team and a strike team from one base, on one channel map.
- Parallel architectures from one factory: "hack-net" and "strike-net" as independent channel topologies. Two relay networks. Command agent coordinating timing.
- Things go wrong: more enemies → more detections → more hook traffic → relay overload → compress drops turret data → striker walks into active turret → command agent buffer fills with stale reports → factory keeps producing scouts nobody needs → resources depleted → everything collapses.
- **Checkpoint #5:** "The factory broke itself. It kept producing the wrong thing while everything collapsed."
- Redesign: kill the spawner first (stop the bleed), then split into hack team and strike team.

**Randomization:** Spawner position, turret placement, objective locations. Different runs require different split strategies.

---

### Mission 9: Arms Race

**Setup:** Enemy has a base producing units from blueprints. No enemy commander — predictable but relentless production.
**Boot log:** `MODULE: Adversarial systems — CAPABILITY: Opponent architectures follow the same rules you do`
**Primitives:** All previous. First encounter with an enemy factory.

**Journey:**
- Enemy base produces scouts and strikers on a fixed rotation. No command agent — it can't adapt. But it doesn't stop.
- Attrition stalemate: both factories produce, both armies clash, nobody wins.
- Sealed watch: endless grind. Neither side gaining ground.
- Inspector: enemy production is predictable. Fixed priority, fixed blueprints, fixed channel map. No command agent means no adaptation.
- Exploit the predictability: time your strikes for when enemy production is between cycles. Overwhelm with a burst while they're rebuilding.
- Or: resource denial. Tag nodes to starve the enemy factory. Their production slows, yours doesn't.
- The lesson: a dumb factory with resources can still overwhelm a smart factory without them. Economics matter.

**Randomization:** Enemy production rate, node distribution, map layout. Some runs favor rush strategies, others favor economic play.

---

### Mission 10: The Warden

**Setup:** Enemy has full base + blueprints + command agent + channel map. Factory vs factory.
**Boot log:** `MODULE: Full autonomy — STATUS: All subsystems nominal. No further initialization required. You are complete.`

**Warden's architecture:**

| System | Weakness | Exploit |
|--------|----------|---------|
| Blueprints | Identical patrol patterns | Predictable gaps |
| Production | Fixed priority, adapts slowly | Keeps making scouts when it needs strikers |
| Relay | Single, no compress/filter | Flood with detections → overload |
| Command | Single point of failure | Overwhelm with simultaneous events |
| Resources | Only tags 1 of 3 nodes | Tag others → resource advantage |

**Journey:**
- Two factories, one map. Both producing armies in real time.
- Run 1: attrition stalemate. Can't out-build, must out-design.
- Sealed watch: feels like watching two machines grind against each other. Neither breaking.
- Inspector: reveals the Warden's full architecture. Player can see its channel map, its production queue, its command agent's rules.
- The Warden is you from Mission 6 — competent but rigid. Player has learned things the Warden hasn't.
- Counter-factory: decoy blueprints (cheap units that clog enemy perception), resource denial team (tag contested nodes), relay strike team (target the single relay), main force.
- Decoys flood Warden's perception → relay overflows → architecture collapses → command agent gets stale data → factory keeps producing scouts into a flank that doesn't exist.
- **Checkpoint #6:** "I didn't beat an army. I killed a factory."
- Final boot log after victory: `FACILITY STATUS: LIBERATED. NEXT TARGET: [NETWORK UPLINK DETECTED]...`

**Randomization:** Warden's blueprint priorities shift between runs. Sometimes scout-heavy, sometimes striker-heavy. Relay placement varies. The weaknesses are structural (single relay, single command) but the specifics change.

---

## What's NOT in the First Playable

| Excluded | Reason |
|----------|--------|
| Tech tree | Full game feature. First playable has flat skill/blueprint access per mission. |
| Information warfare (spoofing, jamming, EMP) | Full game. Decoys in Mission 10 are the preview. |
| Counter-intelligence | Full game feature. |
| Meta-progression | Each mission provides its full blueprint library. |
| Multiplayer | Factory vs. factory is the PvP format, but not in first playable. |
| Modding/sharing | No export, templates, or Workshop. |
| Audio | Minimal SFX. No music. |
| Replay/clip export | Not in scope. |

---

## Resolved Design Questions

| Question | Resolution |
|----------|-----------|
| Hook resolution for blueprints | **Channels.** Hooks wire to named channels, not individual units. All listeners on a channel receive. |
| Plan phase timing | **Pre-execution only.** No pausing to redesign. Command agent is the only mid-battle adaptation. |
| Harvester gameplay | **Removed.** Passive income per tick. Tagging map nodes boosts income. No harvester unit type. |
| Debrief granularity | **Aggregate, not individual.** Channel-level metrics, blueprint-level stats, spatial heatmaps. Systems dashboard. |
| Hook semantics (early missions) | **Fire-and-forget.** Signal drops are invisible in Missions 1-2. Queue depth becomes visible diagnostic in Mission 3. |
| Spawn timing | **Mission 5, not Mission 3.** Research showed 4 missions of hand-configured wiring builds familiarity before factory. |
| Tutorial artifact | **Boot log.** Self-documenting subsystem initialization. Diegetic — the document IS you waking up. |
| Debrief structure | **Two-act.** Sealed watch (no skip, ever) → inspector. Quality signal: if watching isn't fun, the game isn't fun. |
| Scenario model | **Invisible randomization.** Each execute varies. Debrief shows run stats. No explicit test suite. |
| Blueprint editor UX | **Config panel + live board preview.** Same config UI as hand-configured units. Ghost units on board show perception, patrol paths, channel wires. 4 missions of hand-config means blueprints feel natural. |
| Map node control | **Tagging.** Presence-based. Agent proximity = control. Contested = untagged. |
| Sealed watch skip | **No skip, ever — not even on retry.** If the player doesn't want to watch, the game isn't fun enough. The sealed watch is a quality signal. |
| Plan screen layout | **Split view.** Board left (with ghost previews), workbench right (blueprints, queue, channel map). Same board as watch/inspector — transitions are seamless. |
| Channel editor | **No separate editor.** Channels emerge from hooks. Type a channel name in a hook config → channel created. Channel map panel is read-only summary. |
| Production queue UX | **Conveyor belt strip.** Drag blueprint icons onto a horizontal strip. Left-to-right = build order. Cost preview below. Ghost units appear on board. |
| Combat model | **One-shot, one-kill.** No HP. Adjacent striker eliminates enemy. Keeps the game about information architecture, not damage math. |
| Battlefield pacing | **Discrete tick-based.** Central tick clock fires → all resolve → read state → next tick. 1s/tick default. No smooth animation. Into the Breach clarity. |

## Open Questions

| Question | Current Answer | Risk |
|----------|---------------|------|
| Production rate tuning | 1 agent per N ticks, N depends on energy | Too fast = spam, too slow = boring. Mission 7 stress-tests this. |
| Emission balance | Hook transmissions detectable at medium range | Too punishing = nobody uses hooks. Too weak = irrelevant. Mission 4 dedicated to this. |
| Command agent modifying blueprints mid-battle | Allowed | Could be OP — changes all future spawns. Needs constraints or cost. Mission 6 will reveal. |
| Channel capacity | Unlimited signals per tick per channel | Should channels have throughput limits? Missions 3-4 stress buffer limits instead. Revisit if channels feel consequence-free. |
