# 1.07c — The Batch Script Coordination Pattern: Bitburner's HWGW Timing Attacks as Pure-Code Precursor to Robot Uprising's Hook/Channel Signal Chains

## Overview

Bitburner's **HWGW batch attack** is the most sophisticated coordination pattern that emerges organically from player-written code. HWGW stands for **Hack-Weaken-Grow-Weaken** — four operations that must land on a target server in precise sequence with millisecond-level timing offsets. The player writes an orchestrator script that spawns these four operations across distributed servers, calculates sleep delays so they arrive in the correct order, and manages the entire pipeline continuously. A mature batch controller handles 40-100+ simultaneous "batches" targeting multiple servers, each batch a four-operation wave staggered by 200ms intervals.

This pattern is the **pure-code ancestor** of what Robot Uprising accomplishes through visual hook/channel wiring. Every structural element maps directly: the orchestrator is the Command agent, the specialized scripts are unit blueprints, the sleep delays are signal latency, the target server is the enemy, and the timing window is the tick clock. The critical design question is: **what does Robot Uprising gain — and what does it lose — by extracting this coordination pattern from freeform code into visual wiring?**

---

## The HWGW Pattern in Detail

### Why Four Operations?

Every Bitburner server has two dynamic stats: **security level** (how hard it is to hack) and **money available** (how much you can steal). Three NS API functions interact with these:

- `ns.hack(target)` — steals a percentage of available money. Increases security by 0.002 per thread.
- `ns.grow(target)` — multiplies available money toward maximum. Increases security by 0.004 per thread.
- `ns.weaken(target)` — decreases security by 0.05 per thread. No effect on money.

The optimal cycle: hack the money out, weaken the security back down (undoing hack's security increase), grow the money back to maximum, weaken again (undoing grow's security increase). This is HWGW. All four operations must land in this exact sequence — if grow lands before weaken, you're growing against elevated security (less effective). If hack lands when security is high, you steal less.

### The Timing Problem: "The Conductor's Dilemma"

Each operation takes a different amount of time:
- `hack()` takes ~20-40 seconds (varies by server difficulty and player hacking level)
- `grow()` takes ~3-4× hack time
- `weaken()` takes ~4-5× hack time

But they must **land** in order: H, then W, then G, then W. So the orchestrator must:

1. Calculate the finish time of each operation using `ns.getHackTime()`, `ns.getGrowTime()`, `ns.getWeakenTime()`
2. Compute the **start time** for each so they finish in the right order, separated by a small buffer (typically 200ms)
3. Spawn all four with appropriate `sleep()` delays before starting
4. Repeat continuously — start a new batch every cycle, so dozens of batches are in flight simultaneously

The result is a pipeline: while batch #1's weaken-2 is finishing, batch #5's hack is being spawned, batch #12's grow is mid-flight, and batch #30's hack hasn't started yet. The orchestrator script maintains timing tables for all in-flight batches.

### The Thread Calculation Problem: "The Accountant's Nightmare"

Each operation needs the right number of threads to balance perfectly:
- Hack threads determine how much money is stolen
- Grow threads must restore exactly the money stolen (calculated via `ns.growthAnalyze()`)
- Weaken threads must exactly offset hack's security increase (hack_threads × 0.002 / 0.05)
- Second weaken threads must exactly offset grow's security increase (grow_threads × 0.004 / 0.05)

These four values are interdependent. Change hack threads and everything cascades. The player writes formulas, runs them against server stats, and distributes threads across available RAM.

### The Distribution Problem: "The Dispatcher's Headache"

Threads need RAM. Each `hack()` call costs 1.7GB per thread. A 100-thread hack needs 170GB. No single server has that much RAM. So the orchestrator distributes threads across every server the player controls — home server, purchased servers, and rooted enemy servers. The dispatch algorithm must:

1. Scan all available servers and their free RAM
2. Allocate threads to servers that have room
3. Copy the appropriate single-function script (hack.js, grow.js, or weaken.js) to each server
4. Execute with the right arguments (target, delay, batch ID)
5. Track which servers are running which operations for which batch

This is a scheduling problem. The community has built increasingly sophisticated schedulers — round-robin, best-fit, priority queues, even work-stealing implementations.

---

## The Design Pattern Extraction

### What the Bitburner Player Builds in Code

A mature HWGW batch controller is 200-800 lines of JavaScript implementing:

| Component | Code Implementation | Robot Uprising Analog |
|-----------|-------------------|----------------------|
| **Timing calculator** | `sleep()` delays per operation | **Signal latency** (1 tick per hop, locked spec) |
| **Thread calculator** | Formulas for balanced operations | **Skill parameterization** (engage damage, compress ratio) |
| **Server scanner** | `ns.scan()` network traversal | **Scout patrol** perception range |
| **RAM allocator** | Free RAM tracking per server | **Context window** slot management |
| **Batch spawner** | `ns.exec()` across servers | **Hook triggers** (ON_SIGNAL → fire skill) |
| **Pipeline manager** | In-flight batch tracking | **Channel topology** (signal chain state) |
| **Error recovery** | Desync detection, batch cancellation | **Context overload** recovery, eviction policy |
| **Target selector** | Profit/security analysis | **Rule conditions** (IF tagged THEN engage) |

### What Visual Wiring Replaces

The critical insight: **every line of the HWGW orchestrator maps to a drag-and-drop configuration element in Robot Uprising's workbench.** The Bitburner player typing `await ns.sleep(hackTime - growTime + 200)` is solving the same problem as the Robot Uprising player counting hop-pips on a signal chain and deciding whether to add a relay for compression or go direct for speed.

But the mediums produce radically different experiences:

| Dimension | Code (Bitburner) | Visual Wiring (Robot Uprising) |
|-----------|-------------------|-------------------------------|
| **Discovery** | Read the wiki, study community scripts, experiment | See the wires, watch signal dots travel, feel the latency |
| **Debugging** | Print statements, log files, mental simulation | Inspector decision trace, signal genealogy, timeline scrubber |
| **Iteration speed** | Edit code → deploy → wait 30+ seconds for full cycle → check | Edit blueprint → Execute → watch 20-tick battle → Inspector review |
| **Ceiling** | Unlimited (arbitrary JS = Turing complete) | Bounded (slot limits, fixed skill set, finite rules) |
| **Floor** | Very high (must write correct JS) | Low (drag, drop, equip, connect) |
| **Sharing** | Paste 500 lines of code in Discord | Share blueprint screenshot or export |
| **Spectacle** | Text log scrolling in a terminal | Isometric battlefield, signal lightning, combat flashes |
| **Emotional register** | "My script is running perfectly at 3 AM" (quiet pride) | "THAT FLANKING MANEUVER!" (visceral excitement) |

### What Visual Wiring Loses: "The Ceiling Tax"

Bitburner's freeform code allows patterns that Robot Uprising's visual workbench cannot express:

1. **Dynamic recalculation.** The HWGW orchestrator continuously recalculates thread counts as hack level increases. Robot Uprising blueprints are static — the player configures before battle, not during.
2. **Arbitrary branching.** The orchestrator can implement custom logic for edge cases (target money at 0%, security spiked, server rebooted). Robot Uprising rules are ordered condition→action pairs — powerful but not Turing complete.
3. **Meta-orchestration.** Advanced Bitburner scripts monitor batch controllers and restart/adjust them. Robot Uprising's Command agent approximates this but through the same visual primitives, not arbitrary code.
4. **Precision timing.** Bitburner batches are staggered by 200ms. Robot Uprising's tick clock snaps to 1-second intervals. The temporal resolution is coarser.

This ceiling tax is **intentional.** Robot Uprising trades infinite expressiveness for legibility, accessibility, and spectacle. The HWGW pattern demonstrates that coordination emerges even from code — but code makes that coordination invisible to everyone except the author.

---

## Naming the Pattern: "The Conductor's Score"

The extracted design pattern deserves a name. In Bitburner, the HWGW orchestrator is **The Conductor** — it doesn't perform any operation itself, it coordinates the timing and distribution of specialized performers. The timing spreadsheet is **The Score** — a precise temporal map of when each operation starts, where it executes, and when it must land.

In Robot Uprising, The Conductor is the **Command agent.** The Score is the **hook/channel topology** — the visual wiring diagram that determines signal routing, latency chains, and coordination timing. The Plan screen's channel map panel IS The Score, rendered visually instead of computed programmatically.

The fundamental pattern: **a non-performing coordinator schedules specialized performers through timed signal chains to achieve effects none could produce alone.** This appears in Bitburner as code, in Robot Uprising as visual wiring, in Factorio as circuit networks, in real orchestras as literal conducting, and in distributed systems as message queues and event buses.

---

## Strengths

1. **Proven coordination depth.** Bitburner's community spent years optimizing HWGW — the pattern supports hundreds of hours of iterative refinement. Robot Uprising's visual version can inherit this depth.
2. **Natural specialization incentive.** HWGW only works because each script does one thing. Robot Uprising's unit types (Scout=perceive, Relay=process, Striker=act) mirror this specialization naturally.
3. **Latency as drama.** The HWGW timing window where four operations must land in order creates genuine tension. Robot Uprising's 1-tick-per-hop latency and sealed watch recreate this tension visually.
4. **Pipeline thinking.** HWGW teaches pipeline architecture — overlapping batches, steady-state throughput, bottleneck identification. These skills transfer directly to Robot Uprising's signal chains and to real distributed systems.
5. **Failure modes that teach.** Batch desync in Bitburner (wrong order → wasted operations) maps to Robot Uprising's signal chain failures (late intelligence → striker engages wrong target). Both teach the same lesson: coordination timing matters.

## Weaknesses

1. **Invisible pattern in source game.** Bitburner's HWGW is emergent community knowledge — the game never teaches it explicitly. Many players quit before discovering it. Robot Uprising must surface the coordination pattern through progressive missions, not community wikis.
2. **Loss of dynamic adaptation.** Bitburner scripts adapt mid-batch (recalculate if conditions change). Robot Uprising's pre-battle configuration means the player commits to a coordination plan that must handle all scenarios. This shifts the challenge from reactive optimization to predictive architecture.
3. **Precision flattening.** HWGW's 200ms timing granularity allows fine-grained control. Robot Uprising's 1-second tick clock compresses coordination into coarser bins. Some timing finesse is lost.
4. **Orchestrator complexity hidden.** In Bitburner, writing the orchestrator IS the game. In Robot Uprising, the Command agent orchestrates through the same visual primitives as other units. The meta-level feeling of "building the conductor" may be diluted by the consistent interface.

---

## Interaction Effects

- **Signal latency (locked: 1 tick per hop):** The HWGW pattern validates that fixed-latency coordination creates deep gameplay. Each relay hop in Robot Uprising is analogous to each sleep delay in HWGW — a timing cost the player must budget.
- **Context overload (locked: 1 tick stun):** HWGW desync wastes operations. Context overload wastes ticks. Both punish bad information architecture — but Robot Uprising's punishment is more dramatic (visible stun, sparking unit) and more consequential in a one-shot-one-kill game.
- **Command agent (locked: 6 hook slots, reassign/reroute/prioritize):** The Command agent IS the HWGW orchestrator — but with only 6 hook slots and 14 context window slots instead of unlimited code. This compression forces elegant architectures. A Bitburner orchestrator can brute-force with 800 lines; a Command agent must express the same coordination in 6 channels.
- **EM emissions (locked):** HWGW has no stealth cost. Robot Uprising's hook transmissions emit detectable noise. Deep coordination architectures (many hops, many channels) are louder. The player faces a tradeoff Bitburner never poses: coordinate more precisely (loud, detectable) or coordinate less (quiet, imprecise).
- **Inspector (locked: timeline scrubber, decision trace):** The Inspector is the tool Bitburner players wished they had. HWGW debugging involves print statements and mental simulation. Robot Uprising's Inspector shows exactly which signal arrived at which tick, which rule matched, and which action resulted — the debugger that code players build piecemeal, delivered as a first-class game feature.
- **Sealed watch (locked: no pause, no tools):** Bitburner players can pause, debug, and modify scripts during execution. Robot Uprising's sealed watch forces the player to commit to their coordination plan and watch it succeed or fail without intervention — converting the quiet satisfaction of watching logs scroll into the visceral spectacle of watching agents execute your architecture.

---

## Comparable Games

| Game | Coordination Pattern | What Robot Uprising Can Learn |
|------|---------------------|-------------------------------|
| **Bitburner (HWGW)** | Code-based timing orchestration across distributed servers | The pattern's depth proves visual wiring can support 100+ hours of refinement |
| **Factorio (circuit networks)** | Conditional signals controlling insertion/production timing | Visual wiring with flow particles — Factorio proves players love seeing signals travel |
| **Opus Magnum** | Arm programming with cycle-counted simultaneous operations | The "clockwork satisfaction" of perfectly timed coordination; the GIF-sharing economy |
| **TIS-100** | Blocking port communication between spatial nodes | Fixed-latency inter-node communication creating pipeline hazards |
| **StarCraft (multi-prong attacks)** | Coordinating multiple army groups to arrive simultaneously | Timing coordination under fog of war; the "3-prong attack" as HWGW analog |
| **Into the Breach** | Pre-visualized consequence chains across multiple units | Perfect information about coordination outcomes; push/pull chain previews |
| **Screeps** | JavaScript-based creep coordination with CPU budget | Persistent-world coordination with real cost to orchestration complexity |

---

## Sensory Design: The Coordination Chain in Robot Uprising

### Plan Screen — "The Wiring Session"

The player opens the workbench. On the left, the 8x8 board preview shows spawn points and enemy spawners. On the right, the blueprint editor for a Relay unit sits open. The player is configuring a **two-relay compression chain**: Scout spots enemy → broadcasts on `recon-raw` → Relay-A compresses on `recon-raw` and outputs on `recon-filtered` → Relay-B amplifies on `recon-filtered` and outputs on `strike-orders` → Striker listens to `strike-orders`.

The channel map panel at the bottom auto-updates as the player types channel names. Four colored subway lines appear on the board preview: teal (`recon-raw`) from scout patrol zone to Relay-A's position, amber (`recon-filtered`) from Relay-A to Relay-B, crimson (`strike-orders`) from Relay-B toward the striker's spawn point. **Hop-count pips** — tiny diamond badges — appear on each line: 1 pip on `recon-raw`, 1 pip on `recon-filtered`, 1 pip on `strike-orders`. The player counts: three hops total. Scout spots enemy at tick T, striker receives orders at tick T+3.

The player hovers over the `recon-raw` channel line. A tooltip animates: a miniature scout detecting a holographic enemy, a signal dot traveling along the teal line at 1-tile-per-beat tempo, arriving at Relay-A which pulses amber as its compress skill activates — the dot shrinks, changes color to amber, and continues. The tooltip plays a soft ascending three-note chime: *ping* (detect), *whoosh* (compress), *ping* (forward). The player hears the coordination chain before executing it.

### Sealed Watch — "The Lightning Storm"

Tick 8. The scout spots the first enemy at E4. A teal flash pulses from the scout. A colored dashed line appears — the `recon-raw` channel — and a bright teal signal dot slides along it toward Relay-A at B3. The dot arrives at tick 9. Relay-A's compress skill activates: the unit brightens momentarily, a soft mechanical *click-whirr* plays, and the dot shrinks and shifts to amber as it departs on `recon-filtered`. Tick 10: Relay-B receives, amplifies — a louder *thrum* as the signal dot grows slightly brighter, shifts to crimson, departs on `strike-orders`. Tick 11: the crimson dot arrives at the Striker. The Striker's rule matches: IF `strike-orders` contains threat-within-2 THEN engage. The Striker pivots toward E4. A red combat flash at tick 12 as the Striker eliminates the enemy.

Four ticks. Three hops. One kill. The entire HWGW pipeline played out as a visible, audible chain of colored lightning across the board. The player grips the desk — *did I wire that?* The camera didn't cut. The speed didn't change. But the chain of teal→amber→crimson flashes told a story that 200 lines of Bitburner JavaScript could never show.

### Inspector — "The Autopsy Table"

The player clicks the Striker in the Inspector. The timeline scrubber shows ticks 1-20. At tick 11, the Striker's context window displays a single entry in slot 3: `[strike-orders] THREAT @ E4, compressed, amplified, T+3 latency`. The player clicks "Decision trace": Rule #2 matched ("IF threat-within-2 AND strike-orders → engage closest"). The trace shows the full signal genealogy: originating observation (Scout, tick 8, E4) → compress (Relay-A, tick 9, raw→filtered) → amplify (Relay-B, tick 10, filtered→orders) → delivery (Striker, tick 11). Each hop is a node in a horizontal chain diagram with tick numbers above.

The player notices: the Striker's context window had 7 entries at tick 11. The strike order arrived in slot 3 but the rule only checked slot 3 because of the eviction priority configuration — `strike-orders` entries were set to HIGH priority. If they'd been MEDIUM, the slot might have been evicted by the three noise entries from `ambient-scan` that arrived at ticks 9-10. The coordination chain succeeded not just because the wiring was right but because the **context configuration** preserved the critical signal through a noisy window.

This is the moment Bitburner's Inspector-less debugging can never produce. The Bitburner player staring at logs can infer timing. The Robot Uprising player can **see** the signal, **trace** the chain, and **understand** why it worked — including the context window dynamics that code logs never capture.

---

## Player Journeys

### Journey: Marcus, 28, Junior Backend Developer

**Context:** Mission 6 — first factory mission. Marcus has completed Missions 1-4 (pre-placed units) and Mission 5 (factory introduction). He played Bitburner for ~80 hours six months ago, built a working HWGW batch controller, and remembers the satisfaction of watching his scripts earn $2B/hour. He's about to discover that Robot Uprising's visual wiring is the same pattern he coded by hand.

**Minute 0:00 — "The Familiar Problem"**
Marcus reads the Mission 6 briefing: enemy spawner in the northeast produces strikers every 4 ticks. His factory is in the southwest. The boot log says: *"THREAT ANALYSIS: Periodic hostile generation detected. Recommend coordinated response chain — perception, processing, action."*

Marcus thinks: *"This is HWGW. Scout is hack, relay is weaken/grow, striker is the collection script. I need to time the chain."*

The Plan screen shows the 8x8 board. Enemy spawner at H8, glowing red. Factory at A1, glowing cyan. Marcus has 3 blueprints available: Scout (2 hook slots), Relay (4 hook slots), Striker (2 hook slots). He's already configured a basic Scout from Mission 5.

**Minute 1:00 — "Wiring the Chain"**
Marcus opens the Scout blueprint. Under Hooks, he adds: `ON_DETECT enemy → SEND recon-net`. He types `recon-net` as the channel name. A teal subway line appears on the board preview from the scout's projected patrol zone toward... nothing yet. No listener.

He opens the Relay blueprint. Under Hooks: `ON_RECEIVE recon-net → compress → SEND strike-cmd`. He types `strike-cmd`. Now two lines appear: teal from scout to relay, crimson from relay onward. But still no listener on `strike-cmd`.

He opens the Striker blueprint. Under Context Config, he toggles `strike-cmd` to LISTEN. Under Rules: `IF strike-cmd threat → engage closest`. The crimson line connects to the striker's spawn position. Three units. Two hops. Two ticks of latency.

Marcus counts the pips on the channel lines: 1 + 1 = 2 ticks. Enemy spawns at tick 0, scout detects at tick 1 (perception range), signal arrives at relay at tick 2, compressed signal arrives at striker at tick 3. Enemy moves 1 tile per tick — at tick 3 it's 3 tiles from spawn. Striker needs to be within 2 tiles (engage range) by tick 3.

*"This is the sleep delay calculation. Except I can see it on the board instead of computing it in my head."*

**Minute 2:30 — "The Production Queue"**
Marcus drags blueprints into the conveyor belt: Scout first (cheapest, 3 minerals), then Relay (5 minerals), then Striker (8 minerals). The cost preview shows he can afford all three by tick 6. But the enemy spawner starts producing at tick 4. He'll have two ticks where enemies arrive with no striker on the field.

He rethinks: Striker first? No — without the scout, the striker has no intelligence. It will wander blind. Scout first, striker second, relay last? The scout and striker can function together (direct channel, no compression) while waiting for the relay to provide the compression upgrade.

He adds a second hook to the Scout: `ON_DETECT enemy → SEND direct-alert`. Adds `direct-alert` to Striker's LISTEN list. Now the striker gets raw, uncompressed alerts immediately (1 hop) while the relay chain is being built. Once the relay is online, the compressed `strike-cmd` signal will have higher priority in the striker's context window (he sets eviction priority: `strike-cmd` HIGH, `direct-alert` LOW).

*"I just implemented the Bitburner pattern where you run a simple hack script first and upgrade to HWGW later. Except it took me 2 minutes instead of 2 hours."*

**Minute 4:00 — "Execute"**
Marcus hits EXECUTE. The sealed watch begins.

Tick 1: Factory hums. Scout blueprint enters production queue.
Tick 3: Scout spawns at A1, moves northeast. Its perception cone sweeps.
Tick 4: Enemy spawner pulses red. First enemy appears at H8. Scout hasn't reached detection range yet.
Tick 5: Striker spawns. Enemy at G7, moving southwest. Scout at C3, still no detection.
Tick 6: Scout reaches D4. Perception cone touches E5. Enemy at F6 — detected! Teal flash. Signal dot races along `direct-alert` toward the Striker.
Tick 7: Striker receives `direct-alert`. Rule matches. Pivots toward F6. Enemy at E5, continuing southwest.
Tick 8: Relay spawns at B2 (finally). Striker at D4 moving to intercept. Enemy at D4 — ADJACENT. Red combat flash. Enemy eliminated.

Marcus exhales. *"One tick margin. If the scout had been one tile slower, the enemy would have reached my factory."*

Tick 10: Second enemy spawns. Now the full chain is online. Scout detects at tick 12, relay compresses at tick 13 (Marcus sees the amber flash at Relay's position — compress activating), striker receives compressed signal at tick 14 with precise coordinates. The striker moves to intercept with 3 ticks of margin this time.

*"The relay adds a tick of latency but the compressed signal gave the striker better coordinates. Same tradeoff as HWGW — more processing = better results but more delay."*

**Minute 7:00 — "Inspector Revelation"**
Battle ends at tick 30. All enemies eliminated. Inspector opens. Marcus clicks the Striker and scrubs to tick 14 — the second kill's decision point. The context window shows:

- Slot 1: `[direct-alert] enemy @ E5, raw, T+1` (priority: LOW)
- Slot 2: `[strike-cmd] THREAT @ E5, compressed, T+2` (priority: HIGH)
- Slot 3: `[direct-alert] enemy @ D4, raw, STALE T+4` (priority: LOW, eviction candidate)

The compressed signal in slot 2 has additional metadata: threat level, approach vector, estimated arrival time. The raw signal in slot 1 has only position. Both point to E5 but the compressed version is why the Striker chose the optimal intercept path instead of chasing.

*"In Bitburner, I'd be reading a log file that says 'hack started at 23445ms, finished at 45221ms'. Here I can see the actual information that made the decision. This is what I was TRYING to debug with print statements."*

**UI Annotations:**
- Channel map panel: three colored subway lines (teal `recon-net`, amber `direct-alert`, crimson `strike-cmd`) with hop-count diamond pips
- Conveyor belt: three blueprint icons scrolling left-to-right with mineral cost badges
- Sealed watch signal dots: 3px bright circles traveling along channel lines at 1-tile-per-tick speed, color-shifting at relay nodes
- Inspector context window: 8 horizontal slots rendered as cards with channel-colored left border, content text, age badge, priority pip (gold HIGH, silver MEDIUM, dim LOW)

---

### Journey: Priya, 35, Data Scientist, Never Played Bitburner

**Context:** Mission 7 — Command agent introduction. Priya completed Missions 1-6 without any programming game background. She understands scouts, relays, and strikers. She's about to discover meta-coordination — the Command agent as orchestrator.

**Minute 0:00 — "The New Piece"**
Mission 7 briefing: *"SYSTEM UPGRADE: Command chassis unlocked. Purpose: manage the managers. Warning: this unit does not fight. It thinks."*

Priya opens the Blueprint Codex. The Command card shows: 14 context window slots, 6 hook slots, zero perception range, static (cannot move). Skills: reassign, reroute, prioritize. She reads the skill tooltips — hovers over `reassign` and watches the micro-scenario: a holographic Command unit sending a golden pulse to a nearby Striker, the Striker's skill loadout visibly swapping from `engage` to `evade`. The tooltip chime plays: authoritative low tone, then acknowledgment ping.

*"It's a manager. It changes what other units do."*

**Minute 1:30 — "Building the Brain"**
Priya creates a Command blueprint. She has 6 hook slots — the most of any unit. She starts wiring:

- Hook 1: `ON_RECEIVE recon-net → IF threat_count > 2 → SEND mobilize`
- Hook 2: `ON_RECEIVE recon-net → IF threat_count == 0 → SEND stand-down`
- Hook 3: `ON_RECEIVE casualty-report → reassign(nearest_scout, evade) → SEND retreat-order`

She's building a decision tree in hooks. When multiple threats appear, mobilize. When threats clear, stand down. When a unit is lost, reorganize. Each hook slot is precious — she has 6 total and the mission has 4 distinct scenarios to handle.

The channel map panel now shows a hub-and-spoke topology: the Command unit at the center with incoming lines from scouts (`recon-net`, `casualty-report`) and outgoing lines to all units (`mobilize`, `stand-down`, `retreat-order`). The Command unit's node is visibly larger than others — a golden circle where others are teal or crimson dots.

**Minute 3:00 — "The Slot Crunch"**
Priya realizes she wants a 7th hook: `ON_RECEIVE resource-low → prioritize(striker_production)`. But she only has 6 slots. She stares at the workbench. She can't have everything.

She merges hooks 1 and 2: `ON_RECEIVE recon-net → IF threat_count > 2 THEN SEND mobilize ELSE SEND stand-down`. One hook handles both cases. Now she has a free slot.

*"I'm doing what my team does in sprint planning. We can't work on everything. We combine related tickets. This is... prioritization."*

**Minute 5:00 — "The Latency Budget"**
Priya places the Command unit at B2, central to the formation. She counts hops: Scout at E5 → Command at B2 = 3 hops (3 ticks). Command → Striker at F3 = 4 hops (4 ticks). Total chain: scout detects → command decides → striker receives order = 7 ticks.

The hop-count pips on the channel lines spell it out: 3 + 4 = 7 diamonds. At 1 tick per second, that's 7 seconds of latency. Enemy strikers can cross 7 tiles in that time — nearly the entire board.

*"The Command unit is powerful but slow. My old direct scout-to-striker chain was 2 ticks. Adding the brain added 5 ticks of latency."*

She considers: move the Command closer to the front? But it has zero perception and no combat ability. It would die to the first enemy that reaches it. She decides to add a relay between scout and command to compress the recon data, reducing Command's context window pressure at the cost of one more tick of latency.

*"Every layer of intelligence costs time. The smarter the system, the slower it responds. This is... literally my ML pipeline at work."*

**Minute 8:00 — "Sealed Watch"**
She hits EXECUTE. The sealed watch reveals the Command unit sitting at B2, motionless. It never moves. But at tick 10, when the first scout report arrives, the Command's context bars flash as all 14 slots begin filling with incoming intelligence. At tick 11, a golden pulse radiates outward from the Command — the `mobilize` signal. Golden dashed lines streak toward every striker. At tick 13, all three strikers pivot simultaneously toward the threat axis.

The coordinated pivot is visually stunning — three units turning in unison, not because they each saw the enemy, but because a fourth unit **decided** they should. The channel lines flash crimson, gold, amber in rapid succession as the full coordination chain plays out.

*"That's not three robots seeing a thing. That's one robot TELLING three robots what to do. I built a manager."*

**UI Annotations:**
- Command unit tile: golden border, larger icon (crown symbol), context bars showing 14 slots filling like a rising thermometer
- Golden pulse: expanding ring animation (200ms) on command signals, distinct from teal/crimson standard signals
- Hub-and-spoke channel map: Command node centered with radiating golden lines, size proportional to hook count
- Hop-count budget: 3+4=7 pips displayed as a latency ruler when hovering the full chain

---

### Journey: Kai, 11, Sixth Grader, First Strategy Game

**Context:** Mission 4 — hooks tutorial. Kai has completed Missions 1-3 (context filtering, rules, basic skills). He doesn't know what Bitburner is. He doesn't know what HWGW stands for. He's about to discover the coordination pattern through pure play.

**Minute 0:00 — "The Two-Enemy Problem"**
Mission 4 briefing: two enemies approach from different directions. One scout, one striker, both pre-placed. The scout can see enemies but can't fight. The striker can fight but can't see far. The boot log says: *"SUBSYSTEM ONLINE: Hook Bus. Your units can talk to each other now."*

Kai's first attempt: he doesn't configure hooks. He hits EXECUTE. The scout spots the northern enemy but the striker, facing south, never reacts. The striker walks into the southern enemy and eliminates it, but the northern enemy reaches the base unchallenged. Mission failed.

*"The see-bot saw it but the fight-bot didn't know!"*

**Minute 1:00 — "Making Them Talk"**
Kai reopens the workbench. The hook panel on the Scout shows two empty slots with dashed outlines and a pulsing "+" icon. He clicks the "+". A tooltip animates: a miniature scout detecting a ghost enemy, a teal dot shooting across the board to a miniature striker, the striker turning toward the threat. The three-note chime plays. Kai gets it without reading.

He selects trigger: `ON_DETECT enemy`. The channel name field appears. Kai types "help" — his first channel name. A teal line appears on the board preview connecting the scout to... nothing. No listener yet.

He opens the Striker's context config. A new toggle has appeared: `help` channel, currently set to IGNORE. He toggles it to LISTEN. The teal line on the preview snaps to connect scout and striker. The hop-count pip appears: 1 diamond.

Under Striker rules, Kai adds: `IF help signal → engage closest`. He drags it above the existing rule to give it higher priority.

**Minute 2:30 — "The Lightning Bolt Moment"**
Kai hits EXECUTE. Tick 4: the scout spots the northern enemy. A teal flash — and the signal dot races across the board, a tiny bright circle skating along the dashed teal line. It arrives at the striker on tick 5. The striker PIVOTS — snapping north instead of continuing south. Tick 7: the striker eliminates the northern enemy. Tick 9: the southern enemy approaches, and the scout spots it too — another teal flash, another signal dot, another pivot.

Kai's mouth drops open. He watches the signal dots travel. He watches the striker obey. He didn't program a timing calculation. He didn't write a sleep delay. He didn't calculate thread counts. He connected two units with a wire called "help" and they coordinated.

*"They're TALKING! The see-bot told the fight-bot where to go!"*

**Minute 4:00 — "The Inspector Discovery"**
In the Inspector, Kai clicks the Striker at tick 5. The context window shows: Slot 1 contains `[help] enemy @ F7, age:1`. The decision trace shows Rule #1 matched: "IF help signal → engage closest." Kai traces the line back to the Scout — the signal genealogy shows a teal node (Scout, tick 4, detection) connected by an arrow to a crimson node (Striker, tick 5, action).

Kai doesn't know the word "latency." He doesn't know what HWGW stands for. But he sees the "1" in the age field and understands: the message took one tick to arrive. If he adds more units in between, it'll take longer. This is the same insight that Bitburner players reach after 50 hours of coding — delivered in 4 minutes through visual wiring and a named channel called "help."

**Minute 5:00 — "I Want More Wires"**
Kai wants to add a second scout to cover the south. He thinks about the channel name — should the second scout also send on "help"? He drags a second scout blueprint and adds the same hook: `ON_DETECT → SEND help`. Now two teal lines converge on the Striker. The channel map shows "help" with two senders, one listener.

He hits EXECUTE. Both scouts detect their respective enemies. Two teal signal dots race toward the Striker from different directions, arriving at the same tick. The Striker's context window shows two entries — and its rule picks the closest threat. Kai has accidentally built a **fan-in pattern**, the same topology that Bitburner's batch controller uses when aggregating results from multiple servers.

*"Two messages! It picked the closer one! What if I add MORE scouts..."*

**UI Annotations:**
- Hook slot "+": pulsing dashed outline, 1.5x scale on hover, tooltip micro-scenario plays automatically on first encounter (no hover delay for tutorials)
- Channel name field: text input with cyan border, real-time auto-generates colored subway line on board as player types
- Signal dot (sealed watch): 4px bright teal circle, 100ms glow trail, travels exactly 1 tile per tick, arrives with a soft *ding*
- Fan-in visualization: two teal subway lines converging on one node, lines brightening simultaneously when both signals are in-flight

---

## The TikTok Clip

**"The Lightning Chain"** — 15 seconds. Split screen. Left: a Bitburner terminal scrolling text logs of HWGW batch timing (green text on black, numbers scrolling). Right: Robot Uprising's sealed watch showing the same coordination pattern as visible lightning — teal flash, signal dot races across colored wires, relay pulses amber as it compresses, crimson bolt hits striker, striker pivots, red combat flash. Same pattern. One invisible. One spectacular. Caption: *"Same architecture. Different medium."* The left side keeps scrolling silently. The right side has the three-note ascending chime and combat impact sound. The contrast sells itself.

---

## Key Insight: "The Wiring Is the Game"

Bitburner's HWGW pattern proves that coordination architecture supports hundreds of hours of optimization depth. But Bitburner hides this depth behind a code wall — the pattern is invisible to spectators, inaccessible to non-programmers, and debuggable only through print statements.

Robot Uprising's core design bet is that extracting this pattern from code into visual wiring preserves the depth while unlocking spectacle, accessibility, and diagnostic clarity. The hook/channel system IS the HWGW batch controller, rendered as colored subway lines instead of sleep delay calculations. The signal dots ARE the in-flight operations, visible instead of logged. The Inspector IS the debugging tool that Bitburner players build piecemeal from print statements.

The ceiling is lower — Robot Uprising can't express arbitrary JavaScript logic. But the floor is incomparably lower too — Kai at 11 years old built his first coordination chain in 2 minutes, using a channel named "help." Marcus, who spent 80 hours in Bitburner, recognized the pattern immediately and configured it in 4 minutes instead of 4 hours. Priya, who never wrote code, discovered meta-coordination through slot constraints and latency counting.

The batch script coordination pattern is not lost in translation. It is **revealed** by translation — from invisible code into visible wiring, from silent logs into colored lightning, from a text editor into a workbench that a child can use and an engineer can respect.
