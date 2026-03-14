# Spawn Semantics: Explicit vs. Implicit Agent Spawning

**Aspect:** 1.04c — REPL semantics for agent spawning
**Wave:** 1 (Competitive Analysis / Core Mechanic Bridge)
**Reference Model:** EXAPUNKS `REPL` instruction

---

## The Design Question

When an agent in Robot Uprising needs to create a new subordinate agent — a scout spawning a relay to forward position data, a command agent spinning up strike teams for a flanking maneuver, a repair drone cloning itself to address multiple casualties — **how does that spawn happen?**

This is not a trivial question. The answer shapes:
- Whether the game feels like **programming** (explicit, procedural) or **configuration** (implicit, declarative)
- How much the player's intent is **expressed in agent behavior** vs. **encoded in player-defined rules**
- Whether spawn storms (runaway spawning) are possible and how they're controlled
- What the "game of games" meta-level looks like — spawning agents that spawn agents

The EXAPUNKS `REPL` instruction is the clearest existing example of explicit spawn in a game context. Understanding its exact semantics is the starting point for mapping all possibilities.

---

## Reference Model: EXAPUNKS REPL

In EXAPUNKS, the programmer writes `REPL label` into an EXA's instruction sequence. When the EXA executes that line:

1. A child EXA is instantiated at the same host (network node)
2. The child begins execution at `label` — a programmer-defined jump point
3. The child inherits: the parent's current `X` register, the parent's `T` register, the parent's full code text
4. The child does NOT inherit: the `F` (file) register, `M` (message) state, the parent's children list
5. The parent continues executing its next instruction immediately — no waiting
6. Both parent and child now run concurrently, one instruction per cycle

The design implication: **spawn is a programmer act**. The player literally places `REPL label` in the instruction sequence. There's no way for spawning to happen unless the player explicitly coded it. The player controls **when** the spawn fires (what point in the instruction sequence), **how many** children get spawned (a loop calling REPL N times), and **what state** the children start with (via X and T register values set before REPL executes).

The "job parameter" pattern that emerges: parent sets `COPY 3 X`, then calls `REPL worker_loop`. The child starts `worker_loop` with X=3 — a job assignment baked into inheritance. Parent loops, incrementing X, spawning one child per iteration, each starting with a different job number.

**What EXAPUNKS REPL does NOT have:** implicit spawn, conditional spawn without explicit code, hook-triggered spawn. Everything is in the instruction stream.

---

## Option A: The REPL Pattern — Explicit Spawn as Skill

### What It Is

Robot Uprising adapts EXAPUNKS' REPL model: the player places a **Spawn skill** in an agent's skill list. The skill has parameters: template (which agent configuration to spawn), location (relative position or waypoint), initial context (key-value pairs pre-loaded into the child's buffer), and limit (max children spawnable). The agent executes Spawn when its rules dictate — which might mean "when I reach objective alpha," or "when my buffer has fewer than 3 threats recorded," or "after I relay my report."

The player writes the logic for WHEN Spawn fires in the agent's rule set. The Spawn skill is the action; rules are the conditional guard.

### Mechanical Detail

- **Spawn skill card** occupies one slot in the agent's skill list (competes with other skills)
- **Parameters panel**: when the Spawn skill is selected, a secondary panel opens: template dropdown (select from saved agent configs), spawn point (drag target onto battlefield grid or specify relative to current position), context pre-fill (key-value pairs injected into child's buffer before it activates), child limit (integer, prevents runaway spawning), cooldown (cycles between spawns)
- **Inheritance model**: child inherits the parent's current buffer snapshot (filtered by an inheritance mask the player sets) — so a scout that has seen terrain data can spawn a relay that starts with that terrain knowledge already loaded
- **Resource cost**: spawning costs a "fabrication token" — a mission resource that limits total spawns per run. Acts as a natural governor.

### The Inheritance Mask Decision

This is the deepest decision in explicit spawn. The player defines, per Spawn skill instance, which buffer entries the child gets. Options:
- **Full copy**: child starts with parent's complete buffer (expensive: child starts with a full buffer, may immediately evict old entries)
- **Tagged inheritance**: only entries tagged "transmit" or "priority" pass to child
- **Empty start**: child spawns with empty buffer, builds its own knowledge from scratch
- **Delta seed**: only entries added since last spawn pass to child (differential inheritance)

The inheritance mask turns spawn into an information routing decision. A scout that spawns a relay with tagged data "what I just saw" versus a scout that spawns a relay with "everything I know" creates fundamentally different network behaviors.

### Player Journey A: Explicit Spawn

#### Journey: Alex, 28, Software Engineer, Python background, no RTS experience

**Context:** Mission 7 — "Relay Web." Alex has beaten missions 1-6 by brute-forcing larger scout units. This mission has a range constraint: scouts can't relay data more than 3 tiles. The command agent needs to receive data from a scout 10 tiles away. The tutorial hint says "consider spawning relay units."

**Minute 0:00 — The Workbench Opens**
Alex sees his scout config on the left panel. Skills column shows: `[Scout Terrain]`, `[Return Fire]`, `[Rest Empty]`. He opens the skills library. "Spawn" appears under "Meta-skills" with a small robot-plus icon. The tooltip reads: "Spawns a child agent from a template. Competes with other skills for execution. Inherits your buffer based on inheritance mask."

Alex adds Spawn to the scout. An immediate UI transformation: a thin orange border appears around the Spawn skill card, indicating it has unset required parameters. A panel unfolds to the right: "Template: (none selected)," "Spawn Point: (tap battlefield to set)," "Inheritance: Full Copy," "Child Limit: 1," "Cooldown: 5 cycles."

**Minute 1:30 — Template Selection**
Alex opens the template dropdown. He sees his existing agent configs. He's never built a relay — he needs to make one. He clicks "New Template" — a mini workbench opens, scaled-down, in a modal overlay. Alex builds a simple relay: just a `[Forward Signal]` skill and a rule: "if message in buffer → execute Forward Signal." He names it "Basic Relay" and saves.

Back in the scout config, he selects Basic Relay as template. The orange border turns yellow (set but unverified). He clicks "Spawn Point" and a yellow crosshair appears on the battlefield preview. He taps a position halfway between the scout's starting position and the command agent. Spawn Point locks in. Yellow border turns green.

**Minute 3:00 — Rules Integration**
Alex now needs to configure WHEN the scout spawns. He goes to the Rules panel. He adds a rule: "IF buffer contains terrain_data > 3 entries → execute Spawn." He thinks for a moment — this is like writing `if len(terrain_data) > 3: spawn_relay()`. It maps immediately. He feels the programming analogy click.

**Minute 5:00 — Execution**
Alex hits Execute. The scout moves, terrain data accumulates in its buffer (visualized as the vertical thermometer filling with blue slots). On cycle 12, the 4th terrain entry loads — the Spawn condition fires. A small fabrication animation: a bright spark at the scout's position, a brief burst of particle effects, and a new unit icon slides into position at the mid-point Alex designated. The relay begins blinking, its forward-signal loop active.

The command agent receives data 3 cycles later. Alex watches the hook chain light up in sequence — the scout's buffer → the relay → the command agent. Three colored lines briefly glow like circuit traces.

**What Alex is thinking:** "That was exactly like writing a conditional function call. The inheritance mask question caught me off guard — I picked Full Copy without thinking. The relay started with a full buffer and immediately started evicting old terrain data. I need to think about that next time." He's already planning Mission 8's Spawn configuration.

**Minute 8:00 — Failure Recovery Lesson**
Alex notices one run ended with the relay spawning too early (buffer filled with noise, not terrain). He opens the debrief, scrubs to cycle 8, sees the buffer visualization: 4 slots loaded with "ambient signal" entries — noise, not terrain. The Spawn fired because the count was 4, not because the entries were the right type.

Alex returns to the workbench. He changes the rule to: "IF buffer contains terrain_data tagged 'confirmed' > 2 → execute Spawn." He adds a tag filter to the scout's context config. Re-runs. Spawn fires at cycle 17 — later, but correctly.

**UI Annotations:**
- Spawn skill card: 2x1 grid slot with robot-plus icon, orange/yellow/green border indicating parameter completeness
- Template dropdown: shows saved configs as thumbnail cards with name, skill count, rule count
- Spawn point selector: click-to-place crosshair on battlefield minimap; snaps to grid; shows ghost unit at target
- Inheritance mask panel: four options as radio buttons with visual previews showing "what the child's buffer will look like"
- Child limit spinner: integer input 1-10, with warning icon if set to 0 or >5 ("many children = high fabrication cost")
- Rule trigger: rule uses same syntax as other rules but "execute Spawn" is available as an action alongside other actions

---

## Option B: The Configuration Pattern — Implicit Spawn via Conditions

### What It Is

The player never writes a spawn instruction. Instead, spawn is a persistent condition rule configured in the **army-level configuration panel**, not inside individual agent configs. The player says: "If scout count falls below 2 AND fabrication resources available → spawn Scout from template 'Basic Scout' at spawn point Alpha."

This is declarative spawn. The system monitors the condition every tick and fires spawn automatically. The player configures the condition, the template, the spawn point, and the limits — but never places this logic "inside" an agent.

### Mechanical Detail

- **Army Config panel** (separate from individual agent workbenches): a dedicated "Spawn Conditions" section with rows, each row being one conditional rule
- **Condition builder**: drag-and-drop clauses — "unit_count(type: Scout) < 2", "resource(fabrication) >= 1", "mission_tick > 10" — combined with AND/OR logic
- **Template + location**: same as Option A, but configured at the army level rather than inside an agent
- **Trigger cadence**: spawn conditions check every N ticks (configurable) — prevents tick-perfect spawning that feels like cheating

### Player Journey B: Implicit Spawn

#### Journey: Maria, 45, Project Manager, no game programming background

**Context:** Same Mission 7 — Relay Web. Maria has been playing Robot Uprising for 2 hours. She's more comfortable with the rules system than the skills system. She tends to configure agents as sets of conditions rather than as instruction sequences.

**Minute 0:00 — The Army Panel**
Maria opens the army overview. She notices a panel on the right she hasn't used before: "Spawn Conditions." There's a "+" button and a grayed-out example row: `IF [unit_count(Scout) < ?] AND [resources >= ?] → spawn [template] at [location]`.

Maria clicks "+". A condition builder expands. She sees dropdowns for condition type, a comparison operator, a value. She sets: `unit_count(type: Relay) < 1`. The system shows a live preview: "This fires when: fewer than 1 Relay exists."

**Minute 2:00 — Template + Location**
She selects Basic Relay from the template dropdown (it's the only relay template she has). She clicks "set location" and taps the battlefield midpoint. The spawn location pin drops.

She looks at the condition row: `IF relay_count < 1 → spawn Basic Relay @ midpoint`. It reads like a sentence. She thinks of it as "the factory auto-orders restocks when inventory drops below 1." No code. Just inventory policy.

**Minute 3:00 — The Limit Question**
A small warning appears: "No spawn limit set. This condition will fire on every check tick where the condition is true. Consider adding a max-spawns limit or a cooldown."

Maria adds "max total spawns: 2" and a cooldown of 10 ticks. The condition row now reads: `IF relay_count < 1 → spawn Basic Relay @ midpoint (max: 2, cooldown: 10t)`.

**Minute 5:00 — Execution**
On Execute, the battlefield starts. No relays exist at tick 0. On tick 1 (the first condition check), the condition fires immediately — relay_count is 0 < 1. A relay spawns at midpoint. Maria watches it appear without any scout doing anything — the spawn came from "the system," not from any specific agent.

She notes: the relay doesn't start with any terrain data. It has an empty buffer. Unlike Option A, there's no inheritance — the child spawns fresh.

**What Maria is thinking:** "This feels like setting up an automated rule in our project management tool. If tasks drop below threshold, auto-generate a task from a template. I understand this." She's comfortable. But she notices the relay is useless for a few cycles because it has no terrain context — it's relaying nothing.

She goes back to the condition row and adds a "pre-fill" parameter: terrain data from the nearest scout. The system shows a live relationship arrow from the nearest scout to the spawn condition — "this condition seeds the spawn from Scout Unit 1's current buffer at spawn time."

**UI Annotations:**
- Army Config panel: separate screen from individual agent workbenches, accessible via "Army" tab in workbench toolbar
- Spawn Conditions section: table with "+" button; each row is one condition; rows are color-coded by condition type
- Condition builder: cascading dropdown system (condition type → operator → value); no text entry, fully pick-list driven
- Preview sentence: below the condition builder, a plain-language summary: "When fewer than 1 Relay exists and fabrication points are available, spawn Basic Relay at grid (7, 12). Maximum 2 spawns. 10-tick cooldown between spawns."
- Pre-fill selector: optional "seed from" dropdown that appears when a template is selected; connects the spawn to a nearby agent's buffer snapshot at spawn time

---

## Option C: Hook-Triggered Spawn — Event-Reactive Spawning

### What It Is

Spawn fires as the consequence of a hook. The player defines: "when [event X occurs] → spawn [agent Y at location Z]." This is neither purely explicit (a skill inside an agent) nor purely implicit (a standing condition check). It's event-driven — reactive to discrete events rather than polling conditions.

### The Critical Difference from Options A and B

- **Option A**: an agent decides to spawn (programmatic, inside the agent)
- **Option B**: the system checks a standing condition and spawns (declarative, external to agents)
- **Option C**: a specific event triggers a spawn (reactive, wired to the event system)

Example hooks:
- "When Scout Unit 1 reports an enemy contact → spawn a Striker at the last reported contact position"
- "When any agent's buffer reaches 90% full → spawn a Buffer Drain relay adjacent to that agent"
- "When Objective Alpha is captured → spawn a Garrison unit at Alpha to hold it"

Option C is the most natural fit with Robot Uprising's hook-first architecture. Hooks are already the reactive wiring system; spawn is just another hook consequence alongside "forward message" or "activate skill."

### Player Journey C: Hook-Triggered Spawn Discovery

#### Journey: Devon, 19, Competitive Gamer, streamer, Slay the Spire veteran

**Context:** Devon is on Mission 12 — "The Breach." He's been building increasingly complex hook chains. He accidentally discovers hook-triggered spawn while trying to do something else entirely.

**Minute 0:00 — The Accidental Discovery**
Devon is configuring a hook: "When Scout detects enemy → fire Forward Signal." He opens the consequence dropdown, looking for "Forward Signal." He scrolls past it and notices an option he hasn't seen before: "Spawn Agent." He stops. "Wait. What?"

He selects "Spawn Agent." A sub-panel appears: template selector, location parameter, count, context seed. Devon immediately understands the architecture: this is just another hook consequence. The hook wiring he already knows extends to spawning.

**Minute 1:30 — Building the Chain**
Devon builds a chain: "Scout detects high-priority target → spawn Striker at target position." He stacks another hook on the Striker template: "Striker completes objective → spawn Extraction unit at objective position."

He is essentially building a **spawn cascade** — enemy contact → striker → extraction → potentially another consequence. A factory line that assembles itself in response to events.

**Minute 3:00 — The Viral Moment**
Devon runs the simulation. An enemy cluster triggers the Scout's detection hook. A Striker spawns directly on the enemy position with a satisfying "FORGE" sound effect — a hot-metal clang followed by a digital boot sequence. The Striker immediately engages (its rules already loaded from template). It completes the objective. The Extraction spawns at the objective, begins moving toward the extraction point.

Devon is watching a domino chain of agents self-assemble. He leans forward. "Chat, are you seeing this." He clips the 30-second sequence: three agents, all spawned by hook chains, none of them controlled directly. The clip ends with the mission complete screen appearing while Devon's hands haven't touched the keyboard since hitting Execute.

**What Devon is thinking:** "This is the most StarCraft thing I've ever done in a game that doesn't have StarCraft in the name. I triggered one unit and a whole army built itself." He's already thinking about recursive spawn chains — what if the Striker's hook spawns another Scout, who can trigger another Striker?

**The TikTok Clip:** A 15-second clip beginning with a single scout unit blinking on screen, then three spawn animations in rapid succession — each unit appearing with a forge sound and immediately acting — followed by a mission complete explosion. Caption: "I programmed this to build itself. It did."

**UI Annotations:**
- Hook consequence dropdown: same dropdown used for all hook consequences (forward signal, activate skill, etc.); "Spawn Agent" appears as an option with a [+unit] icon
- Spawn sub-panel: slides out below the hook row when "Spawn Agent" is selected; same template/location/count controls as other options
- Spawn animation: a brief hot-metal forge effect — orange sparks from the spawn point, unit icon assembles from fragments with a satisfying snap — conveys fabrication, not teleportation
- Boot sequence sound: each spawned unit plays a short "system startup" chime as it activates, distinct from units that were pre-placed; communicates "this one was just built"
- Hook chain visualization: when a spawn hook fires, the chain visualization shows the spawn event as a special node — a circuit-board rectangle with a plus sign, bright orange, slightly larger than normal hook nodes

---

## Option D: Hybrid Spawn — Each Spawner Chooses Its Model

### What It Is

Different agents (or different game phases) use different spawn models. The player chooses per-agent which spawn model applies:
- **Player-designed master agents**: use explicit spawn (Spawn skill in skill list) — requires the most setup but gives the most control
- **Factory infrastructure**: uses implicit spawn (condition-based from army config) — for steady-state production, not tactical response
- **Reactive field agents**: use hook-triggered spawn — for opportunistic tactical responses during execution

### Why This Is Probably Correct

The hybrid model matches real agentic AI engineering practice:
- You have **standing infrastructure** that auto-scales (implicit, condition-based)
- You have **programmed agent logic** that explicitly forks worker agents (explicit, inside-agent REPL)
- You have **event hooks** that spin up responders on specific signals (hook-triggered)

All three exist in real systems. All three should probably exist in Robot Uprising for different game phases and player intents.

The question is whether exposing all three creates decision overload for new players. A reasonable progression:
1. First 5 missions: only implicit spawn (condition-based from army panel) — accessible, no programming required
2. Missions 6-12: hook-triggered spawn unlocks — natural fit with the hook system players are learning
3. Missions 13+: explicit spawn as skill unlocks — for players designing master agents that self-replicate

---

## Inheritance: What Does the Child Start With?

This is a cross-cutting decision that matters for all spawn models. Four options, each with different tactical implications:

| Inheritance Model | What Child Gets | Tactical Implication |
|-------------------|-----------------|---------------------|
| **Full Copy** | Complete parent buffer snapshot | Child starts informed but buffer is full; eviction starts immediately |
| **Tagged Inheritance** | Only entries tagged "transmit" by parent | Parent must annotate relevant data; clean but requires player effort |
| **Empty Start** | Nothing; child builds fresh | Simple; child must gather its own context; slower to productive behavior |
| **Delta Seed** | Only entries added since last spawn call | Useful for sequential spawns; each child gets only new data, not duplicate knowledge |

The inheritance decision is a **hidden optimization problem** that players discover over time. A scout that spawns five relays with Full Copy sends the same data to all five — redundant, costly. A scout that uses Tagged Inheritance sends only the confirmed threat data — lean and efficient.

The histogram (post-mission) should track "buffer utilization at spawn time" to teach this optimization. Players who spawn with Full Copy will see wastefully high initial buffer occupancy in their relays.

---

## Spawn Storms: The Failure Mode

All spawn models risk runaway spawning if not properly governed. The spawn storm failure mode:

1. Agent A spawns Agent B when buffer is full
2. Agent B has the same configuration as Agent A
3. Agent B's buffer fills immediately (inherited from A)
4. Agent B spawns Agent C
5. Fabrication resources drain to zero
6. Mission fails: "Fabrication quota exceeded"

The spawn storm is the equivalent of an infinite loop in EXAPUNKS. The game should make it:
- **Easy to trigger accidentally** (the first time) — creates a memorable learning moment
- **Visually alarming** (alarming red cascade of spawn animations, a warning klaxon)
- **Diagnosable in debrief** (the debrief shows the spawn chain clearly, cycle-by-cycle)
- **Fixable with one change** (adding a child limit or a spawn condition guard)

The spawn storm teaches the concept of **termination conditions** — the same lesson that recursion teaches in programming. It's a designed failure with high pedagogical value.

---

## Strengths and Weaknesses

### Explicit Spawn (Option A)
**Strengths:** Maximum control; pedagogically closest to real agentic AI engineering; creates the "programming" feel; spawning becomes part of agent strategy
**Weaknesses:** Intimidating for new players; requires building templates before configuring spawn; doesn't feel "hands-off" — you're writing spawn logic, not configuring a system

### Implicit Spawn (Option B)
**Strengths:** Accessible; reads as policy configuration, not programming; familiar to anyone who's used cloud auto-scaling or project management automation
**Weaknesses:** Less tactically interesting; removes agency from individual agents; spawn feels external to the agent model rather than emerging from it

### Hook-Triggered Spawn (Option C)
**Strengths:** Best fit with Robot Uprising's hook-first architecture; creates emergent chain reactions; the TikTok clip lives here; natural extension of existing hook system
**Weaknesses:** Requires players to already understand hooks; can create unexpected chains; harder to reason about timing

### Hybrid (Option D)
**Strengths:** Right tool for each situation; matches real agentic engineering practice; allows progressive complexity
**Weaknesses:** Three spawn models requires three tutorials; decision overload without clear guidance on which to use when

---

## Interaction Effects

**With buffer model (2.01–2.05):** Full Copy inheritance with a weighted buffer creates cascading size explosions — child starts with a full buffer of large entries, has no room to work. Forces players to use Tagged Inheritance.

**With blocking hook semantics (1.04d):** If spawn is triggered by a blocking hook, the spawn itself may block if fabrication resources aren't available — creating a deadlock where the parent waits for fabrication while fabrication waits for a parent signal. Need a non-blocking spawn-hook variant or a fabrication availability pre-check.

**With command agents (3.17):** Command agents that spawn worker agents using explicit spawn become factories. The "factory that builds the factory" moment emerges: a master command agent spawns command agents that spawn workers. The depth is fractal.

**With the debrief (4.04, 4.04a):** The debrief timeline needs to visualize spawn events distinctly — a branching tree of agent creation. A good debrief shows the spawn genealogy: which agents spawned which, when, with what inherited context. This is the primary tool for debugging spawn storms.

**With campaign progression (5.04):** If only one spawn model is available early and others unlock progressively, the spawn system becomes a complexity gate that manages onboarding. Hook-triggered spawn is probably the right first unlock — it builds on hooks the player already knows.

---

## Comparable Games and Patterns

**EXAPUNKS `REPL`**: the direct reference. Explicit, programmer-controlled, with inheritance of X and T registers. The "job parameter via X" pattern translates to "context seed via inheritance mask" in Robot Uprising.

**Factorio's Roboport**: implicit spawn of construction bots when a build request exists and bots are available. Declarative, condition-based, factory-level configuration. Players set buffer sizes (how many bots to keep idle), not spawn instructions.

**Rimworld's Colonist Job Queue**: not spawn, but the same implicit-priority paradigm. The "pawns" (agents) autonomously pick up available jobs based on priority settings. Closest to Option B's standing condition model applied to behavior assignment rather than spawning.

**Oxygen Not Included Duplicant Auto-Replication**: in late game, players build cloning machines that produce new Duplicants automatically under resource conditions. Pure implicit spawn. Players set the condition (resource threshold), not the spawn logic.

**RTS games (StarCraft, Age of Empires)**: worker production queues as a form of implicit spawn — you set a queue, units produce automatically. The player's skill is in managing the production cadence, not in writing production logic. Robot Uprising's spawn system is more expressive than this but the cognitive model is similar.

**Self-replicating machines in Minecraft/Factorio mods**: infinite recursion as both goal and failure mode. The community challenge to build the smallest self-replicating machine translates to "build an agent whose spawn chain eventually produces a copy of itself" — a late-game puzzle/achievement.

---

## Sensory Description

### The Spawn Moment — What It Looks, Sounds, Feels Like

**Option A (Explicit spawn from skill):** The spawning agent briefly pulses — a white ring expands from its center like a sonar ping. A fabrication node materializes at the designated spawn point: first as a wireframe outline, white lines forming the unit silhouette in 0.3 seconds. Then — a fill, a hot orange-white that cools to the unit's team color as the "boot sequence" completes. A sharp metallic *clunk* followed by a startup chime, distinctly different from other sound effects — this unit was built, not placed.

**Option B (Implicit spawn):** No single agent takes credit. A small factory icon at the spawn point location pulses gold when the condition triggers, then the same wireframe-to-filled animation plays. More automated-feeling — the production system is doing it, not a specific unit.

**Option C (Hook-triggered spawn):** The hook chain visualization lights up, tracing the causal path from trigger event to spawn. The spawn animation is the final bead on the chain — instead of a factory icon, it's the chain terminus, a bright node that blooms outward. You see the cause (the hook event) and the effect (the spawn) as one connected visual moment.

**The Spawn Storm Warning:** A red progress bar labeled "FABRICATION" appears at the top of the screen when spawn rate exceeds 3 agents in 5 cycles. The bar fills rapidly. When it maxes: a harsh buzzer, all spawn animations freeze mid-wireframe, and a screen overlay reads "FABRICATION QUOTA EXCEEDED — reviewing spawn chain." The debrief opens automatically showing the spawn genealogy tree, the rogue branch highlighted in red.

---

## Discovered New Aspects

This analysis surfaces several unexplored aspects:

- **1.04f — The spawn genealogy tree**: how the debrief visualizes which agents spawned which, cycle-by-cycle ancestry; what information should be shown per spawn event (inherited buffer, spawn trigger, fabrication cost)
- **2.17 — Fabrication as tactical resource**: spawn cost as a mission resource that creates trade-offs between pre-placed agents and dynamic spawning; fabrication point allocation as a pre-mission decision
- **3.19a — Self-replicating agent configs**: agent configurations that explicitly include spawn of near-copies of themselves; the puzzle/achievement of the minimal self-replicator; when is this a cool advanced mechanic vs. a degenerate strategy that breaks missions?
- **5.13a — Spawn storm as designed tutorial failure**: the first spawn storm as a crafted learning moment — the mission is designed to make it almost inevitable, then the debrief teaches the fix; the Opus Magnum "first ugly solution" principle applied to spawn chain design
