# The Consequence Preview Gap — Competitive Analysis

**Aspect:** 1.17b — The consequence preview gap: Into the Breach previews every consequence before execution; Robot Uprising's sealed watch removes this entirely; where does consequence preview live in the plan screen (ghost preview, simulated first 5 ticks, "dry run" mode)?
**Status:** Complete
**Category:** Competitive Analysis (Wave 1)

---

## The Spectrum of Consequence Visibility

Strategy games sit on a spectrum from full consequence preview (Into the Breach, Tactical Breach Wizards) to total opacity (Dwarf Fortress adventure mode, auto-battlers). Robot Uprising's sealed watch — no pause, no skip, no tools — places it firmly at the opaque end during execution. But the plan screen is where consequence preview must live, and the design space for what "preview" means in a system-design game (as opposed to a direct-control game) is wide open.

This analysis examines how comparable games handle consequence preview, what Robot Uprising can steal, and where the unique tension of previewing emergent agent behavior creates design opportunities no existing game has explored.

---

## How Into the Breach Does It: The Gold Standard

Into the Breach's consequence preview is the most complete in any strategy game. Every single action the player considers shows its exact outcome before commitment.

### The Mechanical Stack

1. **Enemy telegraphing.** At the start of each player turn, every Vek displays exactly where it will attack, what damage it will deal, and in what direction. Red-highlighted tiles, directional arrows, damage numbers — all visible simultaneously. The board is a solved puzzle waiting for the player's input.

2. **Hover-to-preview player actions.** When you select a mech and hover over a target tile, the game shows: which tiles will be affected, what damage will be dealt, what direction units will be pushed, and — critically — the chain reactions. Push a Vek into another Vek? Both take bump damage. Push a Vek into a building? Building takes damage (from your action, not the Vek's). Push a Vek so its telegraphed attack now hits a different tile? The attack indicator updates in real time.

3. **Attack order visualization.** Holding Alt reveals the precise order of resolution: which environmental effects trigger first, which Vek attacks resolve in what sequence, where chain reactions cascade. This turns a complex simultaneous-resolution system into a readable sequential story.

4. **No hidden dice.** Zero randomness in combat. If the preview says 3 damage, it deals 3 damage. If it says the Vek dies, the Vek dies. The only randomness is Vek spawning positions (shown one turn ahead) and some environmental events.

### Why It Works

The consequence preview IS the game. Into the Breach is not about executing plans — it's about reading the board state, considering options, and selecting the optimal sequence. The preview system makes this possible by eliminating the gap between "what I think will happen" and "what actually happens." Every failure is a failure of player reasoning, never a failure of information.

### What It Costs

Perfect preview means no surprises. No "oh no, I didn't realize that would happen" moments during execution. The drama is entirely in the planning phase. Execution is confirmation, not revelation. This is the correct trade for Into the Breach because the player directly controls units. But it would destroy Robot Uprising's core loop, where the drama IS the gap between design intent and emergent execution.

---

## How Tactical Breach Wizards Does It: Preview Plus Rewind

Tactical Breach Wizards (Suspicious Developments, 2024) takes Into the Breach's preview system and adds a radical extension: unlimited undo within a turn.

### The Mechanical Stack

1. **Full action preview.** Like Into the Breach, hovering an ability shows exact consequences — which enemies will be pushed, where they'll land, what chain reactions occur (enemies pushed through windows, into each other, off rooftops).

2. **Unlimited rewind.** Players can undo any action within the current turn. Move a wizard, use an ability, see the result, decide it's suboptimal, rewind to before the move, try something else. No cost, no limit. The turn is a sandbox until you hit "End Turn."

3. **Foresight ability.** The character Zan can preview what enemies will do after the player's turn ends — showing the next turn's enemy actions before you commit. This is Into the Breach's enemy telegraphing, but as an opt-in ability rather than always-on information.

4. **Commit gate.** The "End Turn" button has a confirmation step. The game warns you if you haven't used all your actions. Once you end your turn, enemy actions resolve and you cannot rewind.

### The Design Insight

Tom Francis (the developer) discovered something crucial: even with full preview, players still wanted to rewind. Seeing the consequence is not the same as understanding the consequence. Players would preview an action, execute it, watch the result play out with full animation, and only THEN realize it wasn't what they wanted. The preview showed the information; the execution gave them the comprehension.

This is directly relevant to Robot Uprising. Even if the plan screen shows a "dry run" simulation, players may not understand what they're seeing until they watch it happen at full speed during the sealed watch. The question is whether they get to go back.

---

## How XCOM Does It: Partial Preview with Probability

XCOM (Firaxis, 2012/2016) occupies the middle ground: partial consequence preview with probabilistic outcomes.

### The Mechanical Stack

1. **Shot percentage.** Before firing, the player sees hit chance (e.g., 73%), critical chance (e.g., 15%), and damage range (e.g., 4-6). They know the probability distribution but not the outcome.

2. **Movement preview.** Moving to a tile shows the cover value (full/half/flanked), whether the move will trigger overwatch fire, and sight lines to enemies. The spatial consequence is deterministic; the combat consequence is probabilistic.

3. **No undo.** Once you move, you've moved. Once you fire, the dice roll. You can't take it back. This creates a fundamentally different emotional texture — every action carries real risk, and "I had 95% and missed" stories are community folklore.

### The Design Lesson

XCOM's partial preview creates stories. "I had 95% and missed" is a meme, a shared experience, a bonding moment. Into the Breach's perfect preview creates satisfaction but rarely creates stories. Robot Uprising's agents, governed by rules the player wrote but with emergent outcomes the player can't fully predict, sit closer to XCOM's emotional register — "I designed it to do X, and it did Y instead" is the Robot Uprising version of "95% and missed."

---

## The Robot Uprising Preview Problem

Robot Uprising has a unique preview challenge that no existing game shares. The player doesn't control units during battle — they design behavioral systems before battle. The question "what will happen?" is not answerable with a simple hover-to-preview, because the answer depends on:

1. What the enemy does (unknown at plan time)
2. What information reaches each agent's context window (dependent on signal chains, latency, noise)
3. How each agent's rules interact with that information (combinatorial explosion)
4. How multiple agents' actions interact with each other (emergent behavior)

This is fundamentally different from Into the Breach (where you know the board state and can preview exact outcomes) and from XCOM (where you know the probability distribution). Robot Uprising's consequences are **deterministic but computationally opaque** — like asking "what will this program do?" before running it.

---

## Four Preview Models for the Plan Screen

### Model 1: "The Ghost Preview" — Static Placement Visualization

Show where units will spawn, their perception radii, and channel wiring as transparent overlays on the board. No simulation — just spatial relationships.

**What the player sees:** Ghost-blue unit silhouettes at spawn positions, with dashed circles showing perception range, colored lines showing channel connections between units, and small icons indicating which skills are equipped. The board shows terrain, enemy spawner positions, and resource nodes. It's a wiring diagram overlaid on a map.

**What it previews:** Spatial coverage (are there gaps in perception?), channel topology (is every scout connected to a striker?), spawn order (which blueprint builds first?). It does NOT preview behavior, timing, or emergent outcomes.

**Comparable game:** Factorio's blueprint preview — shows where machines will go and how belts connect, but doesn't simulate throughput until you place it and let it run.

### Model 2: "The Dry Run" — Full Simulation with Scrubbing

Run a complete simulation of the battle in the plan screen. Show the full tick-by-tick execution, scrubable, pausable, with inspector tools available. Then let the player modify blueprints and run again.

**What the player sees:** A miniature version of the sealed watch, but with full control — pause, rewind, step forward, inspect any unit's context window at any tick. The board animates the full battle. After watching, the player returns to the workbench, adjusts blueprints, and runs another dry run.

**What it previews:** Everything. Full deterministic simulation of the exact battle that will play out.

**The fatal problem:** This eliminates the sealed watch. If the player has already seen the battle play out, the sealed watch is just re-watching a movie they've already seen. The emotional core — the anxiety of watching your design face reality for the first time — is destroyed. Robot Uprising becomes a Zachtronics optimization game where you iterate until the simulation passes, then "submit" for a grade. That's a valid game, but it's not the game described in the spec.

### Model 3: "The First Five" — Partial Simulation Preview

Simulate only the first 5 ticks of the battle. Show the opening moves — units spawning, initial scouting, first signals sent — then fade to black. The rest is sealed.

**What the player sees:** A 5-second preview animation showing units deploying from the factory, scouts moving to initial patrol positions, the first perception events, the first signals transmitted on channels. After 5 ticks, the preview fades with a message: "Simulation limit reached. Execute to see full battle." The preview uses a simplified rendering — no full isometric art, perhaps a top-down wireframe view with unit icons and signal lines.

**What it previews:** Whether the opening setup works — do scouts patrol the right areas? Do signals reach the right channels? Are blueprints building in the right order? It does NOT preview combat, mid-game adaptation, or emergent behavior.

**Comparable game:** Screeps' simulation mode, where you can test code against a simplified environment but the real game runs on live servers with real opponents.

### Model 4: "The Scenario Probe" — Targeted What-If Testing

Let the player pose specific questions: "What does this scout do if an enemy appears at D4?" The plan screen places a phantom enemy on the board and shows how the scout's rules would respond — which rule matches, what action triggers, what signal goes out on what channel.

**What the player sees:** A "Test" button on each blueprint. Clicking it opens a mini-sandbox: the 8x8 board with just that unit at its spawn point. The player can place phantom enemies, phantom signals, phantom context entries, and step through ticks one at a time to see how the agent responds. Each tick shows the rule evaluation trace — which rules were checked, which matched, which action was selected.

**What it previews:** Individual agent behavior in controlled conditions. It is a unit test, not an integration test. It answers "does this blueprint do what I think it does?" but not "does my system of blueprints work together?"

**Comparable game:** Gladiabots' test arena, where you can pit your AI against a test opponent to see how your behavior tree responds. Also similar to Zachtronics games where you can step through execution one cycle at a time.

---

## Player Journeys

### Journey: Maya, 28, Data Engineer

**Context:** Mission 5 — the first factory mission. Maya has completed the four tutorial missions where units were pre-placed and pre-configured. She now has to design blueprints from scratch for the first time. She's built a scout blueprint and a striker blueprint, wired them with a "threat-alert" channel, and is staring at the EXECUTE button.

**Minute 0:00 — The Hesitation**
The plan screen fills Maya's monitor. On the left, the 8x8 board shows terrain — rice terrace tiles in the north, jungle in the south, her factory glowing cyan in the bottom-left corner, an enemy spawner pulsing red in the top-right. On the right, the workbench displays her two blueprints: "Recon-1" (scout with patrol skill, a hook broadcasting on "threat-alert" when enemies enter perception) and "Vanguard" (striker with engage skill, listening on "threat-alert", rule: "if threat-alert received, move toward source").

Her production queue shows Recon-1 first, then Vanguard. The conveyor belt strip at the bottom displays both icons left-to-right with a cost summary: 3m + 8m = 11m, starting resources: 15m.

Maya hovers over the EXECUTE button. A tooltip appears: "Launch battle. No take-backs." She pulls her cursor away.

**Minute 0:30 — Reaching for Reassurance**
Maya clicks on the board preview. Ghost-blue silhouettes appear: Recon-1 at the factory spawn point (B2), with a dashed cyan circle showing its perception radius (5 tiles — covering B2 through G2 horizontally and B2 through B7 vertically). A thin cyan line runs from Recon-1's position to where Vanguard will eventually spawn, labeled "threat-alert" in small text. Vanguard's ghost appears dimmer — it won't spawn until tick 4 (the production queue shows timing).

She can see that Recon-1's perception radius doesn't reach the enemy spawner at H7. There's a dark zone — the top-right quadrant where enemies will appear but her scout can't see. She frowns. Should she add a second scout? But she only has 15m and two blueprints already cost 11m.

**Minute 1:15 — The Ghost Preview's Limit**
Maya right-clicks the board and selects "Show Channels." The read-only channel map panel slides out: one channel listed, "threat-alert", with Recon-1 as broadcaster and Vanguard as listener. A colored line on the board connects their spawn positions. She can see the wiring. She can see the coverage gaps. But she cannot see what will happen.

She thinks: "If the scout patrols north and an enemy comes from the east, will the scout see it? If it sees it, will the signal reach the striker in time? The signal takes 1 tick per hop — scout to striker is 2 ticks. The enemy moves 1 tile per tick. So the enemy could be 2 tiles closer before the striker even knows."

She's doing the simulation in her head. The plan screen shows her the spatial layout — the wiring diagram — but the temporal dynamics are invisible. She doesn't know if her timing works.

**Minute 2:00 — The Leap of Faith**
Maya decides she can't know more without seeing it play out. She clicks EXECUTE. The screen transitions to sealed watch: the board expands to fill the center, the tick clock appears at top, the workbench vanishes. Tick 1 fires. Her factory hums. Recon-1 materializes at B2. The context bar beneath it shows 0/6 slots filled — empty, waiting.

She watches, hands clasped, as her design meets reality for the first time.

**Minute 4:30 — The Aftermath**
The battle ends in failure — an enemy flanked from the east, outside Recon-1's patrol route. The striker never received a threat-alert because the scout never saw the enemy. In the inspector, Maya scrubs back to tick 8 and sees the enemy at G6, two tiles outside Recon-1's perception radius at E4. The decision trace for Vanguard shows "No matching rules — no signals received — IDLE" for ticks 8 through 12, when the enemy reached the factory.

She returns to the plan screen and adds a second scout blueprint with a patrol route covering the east quadrant. The ghost preview now shows two perception circles with overlapping coverage. She can see the gap is closed — spatially. But temporally? She still doesn't know. She hits EXECUTE again.

**UI Annotations:**
- Ghost preview: Transparent blue unit silhouettes at spawn positions, dashed perception circles, channel wiring lines
- Channel map panel: Read-only sidebar listing channel name, broadcasters, listeners
- Production queue: Conveyor belt strip showing build order with per-unit cost and cumulative total
- EXECUTE button: Top-right, pulsing amber glow, tooltip "Launch battle. No take-backs."

---

### Journey: Tomasz, 35, Into the Breach Veteran (200+ hours)

**Context:** Mission 7 — Tomasz has been playing Robot Uprising for four hours. He has internalized the core mechanics and is now building multi-agent systems with command agents. He has three blueprints: two scouts feeding a relay, which compresses and forwards to two strikers. A command agent oversees the relay and can reroute hooks if a scout dies.

**Minute 0:00 — The Missing Preview**
Tomasz stares at the plan screen with the practiced eye of someone who has spent hundreds of hours reading Into the Breach boards. In Into the Breach, he could hover over any mech, consider any action, and see the exact board state that would result. He could chain-reason: "If I push this Vek here, it bumps that Vek there, which redirects its attack into the water, saving the building." Every consequence was visible before commitment.

Here, he sees ghost previews: six units with perception radii, channel wiring forming a tree structure (scouts → relay → strikers, command → relay). The spatial coverage looks good. But he has no idea what will happen at tick 15 when three enemies converge on the relay's position and the scouts' signals start competing for the relay's 12-slot context window.

He mutters, "In Into the Breach, I would know."

**Minute 0:45 — Mental Simulation**
Tomasz begins simulating in his head, the way a chess player calculates variations. "Scout-Alpha sees Enemy-1 at tick 3, transmits on recon-net. Signal arrives at relay tick 4. Relay compresses, forwards on strike-net tick 5. Striker-1 receives tick 6, moves toward Enemy-1 at tick 7. But Scout-Beta sees Enemy-2 at tick 4, transmits on recon-net. Signal arrives at relay tick 5 — same tick the relay is processing Scout-Alpha's signal. Relay has 12 slots; both fit. Relay compresses both, forwards both on strike-net. Striker-1 receives both signals tick 6. Its rule says 'engage nearest threat.' Which is nearer? Depends on where Striker-1 is at tick 6, which depends on..." He trails off. The combinatorics are exploding.

**Minute 1:30 — The Scenario Probe Desire**
Tomasz wishes he could place a phantom enemy on the board and step through ticks. He wants the Gladiabots test arena — put one scout and one striker on the board, drop a phantom enemy at D5, and watch what happens tick by tick. Not the full battle, just a targeted what-if.

Instead, he adjusts the relay's context config. He sets eviction priority to "oldest first" and listen filters to "recon-net only." He checks the scout hooks: Scout-Alpha broadcasts on "recon-net" with priority HIGH, Scout-Beta broadcasts on "recon-net" with priority MEDIUM. He's reasoning about the system architecture instead of simulating the execution. This is the design skill Robot Uprising is teaching — but the lack of consequence preview makes the learning curve steep.

**Minute 2:15 — The Trust Fall**
Tomasz clicks EXECUTE. During the sealed watch, he watches with arms crossed, tracking signal chain animations between units. At tick 8, he sees something unexpected: the command agent reroutes Scout-Beta's hook from "recon-net" to a new channel "flank-net" because Scout-Beta reported enemies approaching from the east. Striker-2 picks up the flank-net signal and peels off to intercept. This emergent behavior — the command agent dynamically rerouting communications — was something Tomasz configured but couldn't preview. He grins. "I couldn't have predicted that exact moment, but I designed the system that produced it."

This is the emotional payoff Robot Uprising offers that Into the Breach cannot: surprise from your own design. Into the Breach's consequence preview eliminates surprise entirely. Robot Uprising's sealed watch preserves it.

**Minute 5:00 — The Inspector Revelation**
In the inspector, Tomasz scrubs to tick 8 and clicks the command agent. The decision trace shows: "Rule 3 matched: IF any scout reports >2 enemies in sector AND only 1 striker assigned to sector THEN reroute nearest scout to dedicated channel for that sector." The context window chart shows the command agent's 14-slot buffer hitting amber (11/14) at tick 7 as both scouts' reports arrived simultaneously.

He sees a near-miss: if one more signal had arrived at tick 7, the command agent would have hit context overload and been stunned for tick 8, missing the reroute entirely. He adjusts the command agent's listen filters to ignore low-priority status pings, freeing two context slots. The ghost preview updates — but it can't show him whether those two slots will save him from overload next time.

**UI Annotations:**
- Ghost preview: Six unit silhouettes with perception radii, channel wiring shown as a tree diagram
- Decision trace (inspector): Sequential display of rule matching — rule number, condition checked, context entries evaluated, action taken
- Context window chart: Sparkline across all ticks, green/amber/red color coding, tick 7 highlighted with amber spike
- Command agent buffer: 14 horizontal slots, 11 lit (entries visible on hover), 3 dim (empty)

---

### Journey: Priya, 22, Game Design Student, No Strategy Game Experience

**Context:** Mission 2 — Priya is in the tutorial arc. She has one pre-placed scout and one pre-placed striker. The mission teaches hooks: she needs to configure the scout to broadcast "enemy-spotted" when it sees an enemy, and the striker to listen on "enemy-spotted" and move toward the source.

**Minute 0:00 — The Configuration**
The plan screen shows the board with two units pre-placed: a scout at C3 and a striker at F6. An enemy spawner pulses at A8. The workbench panel on the right shows two blueprint cards, already populated with skills but with empty hook slots — dashed outlines pulsing gently, inviting interaction.

Priya drags the "broadcast on enemy detection" hook into Scout's Hook Slot 1. A text field appears: "Channel name:" She types "enemy-spotted" and presses Enter. The hook card snaps into place, now showing a small broadcast icon with the channel name in cyan text.

She drags "listen and approach" into Striker's Hook Slot 1. The same channel field appears. She types "enemy-spotted." When she presses Enter, something happens on the board: a thin cyan dashed line appears connecting the scout at C3 to the striker at F6, labeled "enemy-spotted." The channel map panel updates: one channel, one broadcaster, one listener.

**Minute 1:00 — The Preview That Teaches**
Priya hovers over the scout on the board. Its perception radius appears — a dashed circle extending 5 tiles. She can see that the perception radius reaches the enemy spawner's zone. Good, the scout will see enemies when they spawn. But she notices the striker at F6 is far away — 6 tiles from the scout. With 1-tick signal latency and the striker's medium speed (1 tile per tick), it will take at least 3 ticks for the striker to reach the scout after receiving a signal (1 tick scout-to-striker transmission + at least 2 ticks movement).

She doesn't think in these terms yet. She just sees two units, a line connecting them, and circles showing what they can see. The ghost preview tells her WHERE things are, but not WHEN things will happen.

**Minute 1:30 — The Tutorial Nudge**
A boot-log-style tooltip appears at the bottom of the screen: "Signal latency: 1 tick per hop. Your striker will receive the scout's signal 1 tick after it's sent. Plan accordingly." The text renders character by character, terminal-style, green on dark.

Priya re-reads it. She looks at the board. She counts tiles between scout and striker. She's learning to think temporally — not just "can my units see the enemy?" but "can they respond in time?" This is the cognitive skill the ghost preview supports: spatial reasoning with temporal implications.

**Minute 2:00 — EXECUTE and Discover**
Priya clicks EXECUTE. The sealed watch begins. Tick 1: nothing happens, units idle. Tick 2: an enemy appears at B8, inside the scout's perception radius. The scout's context bar gains one pip — a small orange square appears at the bottom of its tile. Tick 3: the scout's hook fires. A cyan dashed line pulses from the scout toward the striker, a small packet of light traveling along the channel wire. Tick 4: the striker's context bar gains a pip. The striker turns toward the scout's last known position. Tick 5: the striker begins moving.

Priya watches the striker moving toward the enemy, arriving at tick 7. The enemy is at A6 by then. The striker engages at tick 8 — adjacent, one-shot kill, the enemy tile flashes red and the enemy vanishes.

She exhales. It worked. But she notices: the enemy was 2 tiles from the scout by the time the striker arrived. If the enemy had been faster, or the scout's perception range shorter, the interception might have failed. She wants to try again with different positions. She wants to preview what would have happened if the enemy had gone south instead of west.

In Into the Breach, she would have KNOWN the enemy's path before moving. Here, she had to execute to find out. The sealed watch was the preview — but it was the only preview, and it was irreversible.

**Minute 3:30 — The Learning Loop**
Back in the plan screen for her second attempt, Priya adjusts the striker's position (in tutorial missions, she can reposition pre-placed units). She moves the striker from F6 to D5 — closer to the scout, reducing signal travel time. The ghost preview updates: the channel wiring line is shorter, the perception circles overlap slightly. She can see the spatial improvement but can't simulate the temporal improvement.

She clicks EXECUTE again, knowing she'll learn more from watching than from staring at ghosts.

**UI Annotations:**
- Hook slot: Dashed outline pulsing gently until filled; filled slot shows hook icon + channel name in cyan
- Channel name field: Text input that appears inline when a hook is placed, auto-completes if channel name already exists
- Channel wiring on board: Cyan dashed line connecting broadcaster to listener(s), labeled with channel name
- Perception radius: Dashed circle on hover, color-matched to unit type (cyan for scout)
- Signal animation (sealed watch): Small light packet traveling along channel wire from broadcaster to listener, 1 tile-width per tick
- Boot log tooltip: Terminal-style text at bottom of screen, green monospace on dark background, character-by-character rendering

---

## Strengths and Weaknesses of Each Preview Model

### Ghost Preview (Model 1) — The Recommended Baseline

**Strengths:**
- Preserves the sealed watch's emotional power entirely. No spoilers.
- Teaches spatial reasoning — coverage gaps, channel topology, production timing.
- Low implementation complexity. No simulation needed in the plan screen.
- Scales to complex setups: 10 blueprints with 30 channel connections are still readable as a wiring diagram.
- Matches the "workbench" metaphor: you're designing a circuit board, not running it.

**Weaknesses:**
- Temporal dynamics are invisible. Players cannot preview timing, latency, context overload, or emergent behavior.
- Learning curve is steep. Players must develop mental simulation skills to predict outcomes.
- Frustration risk for players accustomed to Into the Breach's consequence preview.

### First Five Ticks (Model 3) — The Compromise

**Strengths:**
- Shows enough to validate the opening setup without spoiling mid-battle emergence.
- Reduces the "blind leap" feeling for new players.
- Creates a natural learning scaffold: first five ticks in preview, remaining ticks in sealed watch.

**Weaknesses:**
- Arbitrary cutoff. Why 5 ticks, not 3 or 8? Players will ask for more.
- Still doesn't show combat, which typically starts after tick 5.
- Creates a false sense of confidence — "the first 5 ticks looked good" doesn't mean tick 15 won't be a disaster.
- Partial preview may be worse than no preview: players trust a simulation that only showed them the easy part.

### Scenario Probe (Model 4) — The Power Tool

**Strengths:**
- Answers specific questions without spoiling the full battle.
- Teaches rule evaluation and decision logic by showing the trace.
- Supports deliberate learning: "I wonder what happens if..." → test → learn → adjust.
- Comparable to unit testing in software engineering, reinforcing the agentic AI vocabulary.

**Weaknesses:**
- Only tests individual agents, not multi-agent systems. The combinatorial interactions — the emergent behavior — remain opaque.
- Implementation complexity is high: requires a sandboxed simulation environment.
- Risk of players optimizing for probe scenarios instead of general robustness.

### Dry Run (Model 2) — The Anti-Pattern

**Strengths:**
- Full information. No surprises.

**Weaknesses:**
- Destroys the sealed watch. If you've already seen the battle, watching it again is boring.
- Transforms Robot Uprising into a Zachtronics iteration game, which is fine but is not the design intent.
- Eliminates the emotional core: the anxiety of "will my design work?" becomes "let me iterate until it does."
- The spec explicitly says "no skip, no pause, no tools" during sealed watch as a quality signal. A dry run in the plan screen is functionally a skippable, pausable, tool-equipped sealed watch.

---

## Interaction Effects

### With the Sealed Watch
The ghost preview and scenario probe models preserve the sealed watch's emotional arc. The dry run and first-five models partially or fully undermine it. The sealed watch's value is directly proportional to the player's uncertainty about the outcome.

### With the Inspector
The inspector already provides full post-hoc analysis with timeline scrubbing, decision traces, and context window charts. Adding pre-battle simulation would make the inspector redundant — why scrub through a past battle when you already scrubbed through the preview? The ghost preview keeps inspector analysis valuable because players are seeing the execution for the first time and need the analytical tools to understand what happened.

### With the Boot Log Tutorial
The boot log teaches mechanics diegetically. A ghost preview supports this: the boot log can explain "your scout's perception radius is 5 tiles" and the ghost preview immediately shows it on the board. A dry run would bypass the tutorial — players would learn by simulating instead of by reading the boot log.

### With the Meta-Level (Command Agents)
Command agents that reroute hooks mid-battle produce emergent behavior that is inherently unpredictable from the plan screen. Even a dry run couldn't fully preview a command agent's decisions because they depend on runtime context. The ghost preview is honest: it shows the wiring, not the emergent outcome. This honesty prepares players for the reality that complex systems are not fully predictable.

---

## Comparable Games Summary

| Game | Preview Model | Consequence Visibility | Undo? | Emotional Register |
|------|--------------|----------------------|-------|-------------------|
| Into the Breach | Full hover preview | 100% — every action shows exact outcome | No (but full information means fewer mistakes) | Satisfaction of perfect planning |
| Tactical Breach Wizards | Full preview + unlimited rewind | 100% + ability to undo and retry | Yes, unlimited within turn | Puzzle-solving joy |
| XCOM | Partial (probabilities shown) | ~70% — know the odds, not the outcome | No | Tension, stories from bad luck |
| Gladiabots | Test arena for AI | ~50% — controlled test, no live opponent | Yes (test mode only) | Iteration, debugging satisfaction |
| Screeps | Simulation mode | ~30% — simplified environment, no real opponents | Yes (simulation only) | Engineering confidence |
| Auto-battlers (TFT, etc.) | None | 0% — place units, watch fight | No | Excitement from uncertainty |
| **Robot Uprising (recommended)** | **Ghost preview + scenario probe** | **~25% — spatial layout + individual unit tests** | **No (sealed watch is final)** | **Anxiety, surprise, pride** |

---

## Sensory Description: The Ghost Preview in Action

When the player hovers over a blueprint in the workbench, the board on the left responds. A ghost unit fades in at its spawn position — not a solid sprite but a holographic shimmer, the unit's silhouette rendered in translucent cyan with scan-line artifacts rippling upward, like a projector warming up. The ghost pulses gently, once per second, breathing.

Its perception radius unfurls like a radar sweep — a dashed circle expanding from the ghost's position, the dashes themselves pulsing outward for a moment before settling into a steady boundary. Tiles within the radius receive a subtle tint — a barely-perceptible blue wash that says "this unit can see here."

Channel wires spring to life: thin dashed lines in the channel's color (auto-assigned from a palette of cyan, amber, magenta, lime) connecting this ghost to every other ghost that shares a channel. The lines have a gentle flow animation — tiny dots traveling along the dash gaps like data packets in transit. A broadcaster's line flows outward; a listener's line flows inward. The direction of data is visible at a glance.

When the player removes the hover, the ghosts linger for 300ms before fading — a soft dissolve, not an abrupt cut. The perception radius contracts back to the ghost's center like a closing iris. The channel wires retract, the flowing dots decelerating before vanishing.

During this entire interaction, there is no sound except a barely-audible hum — a resonant electronic tone that fades in when ghosts appear and fades out when they dissolve. Not a beep or a click. A presence. The ghosts are not decorative — they are the plan screen's primary analytical tool, and they feel like it.

---

## Recommendation

**Use the Ghost Preview (Model 1) as the default, with the Scenario Probe (Model 4) unlocked at Mission 5 when the factory introduces blueprint complexity.**

Missions 1-4 (tutorial): Ghost preview only. Players learn spatial reasoning — coverage, wiring, production timing. The simplicity matches the tutorial's limited mechanics (pre-placed units, one or two blueprints). The sealed watch is the preview — play, watch, learn, adjust, replay.

Mission 5+ (factory): Ghost preview + scenario probe. When blueprints become the primary design tool and players are building multi-agent systems, the ability to unit-test individual blueprints against phantom scenarios provides targeted learning without spoiling the sealed watch. The scenario probe is framed diegetically as "running a diagnostic" — your AI testing a subsystem before deployment.

Never offer a dry run or full simulation preview. The sealed watch is the heart of Robot Uprising's emotional loop. Protect it.

---

## The TikTok Clip

A player drags five channel wires into place. Ghost units shimmer on the board, perception radii overlapping in a beautiful Venn diagram of coverage. The player stares at the board, visibly nervous. They hover over EXECUTE. The tooltip says "No take-backs." They click. Cut to the sealed watch: tick 1, tick 2, tick 3 — scouts deploy, signals fire, the channel wires light up with flowing data packets. The player's face shifts from anxiety to wonder as their design comes alive, doing things they configured but couldn't fully predict. At tick 12, two strikers converge on an enemy from opposite sides — a pincer maneuver that emerged from the channel wiring, not from any explicit instruction. The player whispers: "I didn't tell them to do that." Cut to black. Title card: ROBOT UPRISING.
