# 3.19a — Self-Replicating Agent Configs: Von Neumann Machines on the 8×8 Grid

## Overview

Self-replication is the holy grail of agentic systems — the moment an agent stops being a tool and starts being a factory. In Robot Uprising, where the factory model is already locked (base produces units from blueprints every N ticks), the question isn't whether units physically reproduce. It's whether an agent's *configuration* can include instructions to spawn near-copies of itself — and whether this is the coolest advanced mechanic in the game or the most broken exploit that kills the design.

The core tension: the game's meta-level promise is "building systems that build systems." Self-replication is the purest expression of that promise. A Command unit that can spawn copies of its own subordinate architecture — that IS the factory-that-builds-the-factory. But it's also the most dangerous mechanic to balance, because exponential growth breaks everything.

This document maps five design approaches to self-replication, analyzes when each produces beautiful emergent gameplay vs. degenerate spam, and proposes guardrails that preserve the thrill without breaking the economy.

---

## The Design Space: Five Models of Self-Replication

### Model A: "The Blueprint Printer" — Command Unit Queues Its Own Subordinates

**How it works:** The Command unit's `reassign` skill is extended so that it can push blueprint definitions into the factory's production queue. A Command unit configured with "when striker count < 3, queue striker blueprint X" creates a closed feedback loop: it monitors the battlefield, detects losses, and orders replacements using its own preferred configuration. The "self-replication" isn't the Command unit copying itself — it's the Command unit copying its *subordinate architecture*.

**Mechanical rules:**
- Command unit can only queue blueprints that already exist in the player's loadout (no runtime blueprint creation)
- Queuing costs the same resources as manual queuing — no discount
- Command unit spends 1 tick issuing the queue command (it can't reassign or reroute that tick)
- The queued unit enters the factory's normal production pipeline — same build time, same cost
- Maximum queue depth per Command unit: 2 pending orders (prevents infinite queue spam)

**Why it's interesting:** This is the simplest form of self-replication that still feels magical. The player doesn't program "make copies of yourself." They program "when you notice the team is short-staffed, request reinforcements." The emergent behavior — a Command unit that keeps the team at optimal strength despite losses — feels alive. It's a thermostat, and thermostats feel smart.

**Where it breaks:** If the player creates two Command units, each monitoring a different unit type, they can create a self-sustaining army. Lose a scout? Command-A orders one. Lose a striker? Command-B orders one. The player's only job is designing the initial architecture — after that, the system perpetuates itself. This is exactly the "factory that builds the factory" promise, but it trivializes resource management if replacement cost is too low.

**The guardrail:** Replacement units cost 150% of the original. The Command unit is ordering a rush job — the factory prioritizes the emergency request but charges a premium. This makes self-sustaining architectures possible but *expensive*, creating a tension between resilient (self-repairing, costly) and fragile (efficient, one-loss-away-from-collapse) designs.

**Sensory:** When a Command unit issues a production order, its antenna sprite rotates 90° clockwise — a deliberate, mechanical motion like a telegraph arm. A thin amber line arcs from the Command unit to the factory building, tracing the order path. The factory's conveyor belt strip at the bottom of the Plan screen shows a new icon sliding in from the right with a golden border (distinguishing AI-ordered units from player-ordered ones). A soft mechanical *ka-chunk* sound — a stamp being pressed, a ticket being issued.

---

### Model B: "The Mitosis Protocol" — Units That Split Into Weaker Copies

**How it works:** A new skill, **replicate**, allows a unit to sacrifice itself to spawn two copies at half capability. A Scout with buffer 6 and 2 hook slots splits into two Scouts with buffer 3 and 1 hook slot each. The copies inherit the parent's rules and hooks (fitting what they can into reduced slots — lowest-priority rules are dropped). The split takes 2 ticks (like breach), during which the parent is vulnerable.

**Mechanical rules:**
- Replicate is a dedicated skill slot (uses one of the unit's limited skill slots — opportunity cost)
- Parent is eliminated; two copies appear in adjacent tiles
- Copies have exactly half stats (rounded down): buffer ÷ 2, hook slots ÷ 2, perception ÷ 2
- Copies inherit rules in priority order (drop lowest-priority rules that don't fit)
- Copies inherit hooks (drop excess hooks by most-recently-added)
- Cost: no material cost, but 2 ticks of vulnerability + loss of the full-strength parent
- A half-strength copy can replicate again → quarter-strength copies (buffer 1, 0 hook slots = useless but alive)
- Minimum viable buffer: 2 (buffer 1 units can observe but can't hold enough data to act meaningfully)

**Why it's interesting:** Mitosis creates a beautiful geometric tradeoff: fewer strong units vs. many weak units. Two half-scouts cover more ground but can't relay complex information (buffer 3 holds only basic observations). Four quarter-scouts are essentially decoys — alive on the board, occupying tiles, but unable to participate in information architecture. The player discovers that *replication without capability is just noise*.

**The puzzle of the minimal self-replicator:** What's the smallest, cheapest unit that can meaningfully replicate? A Scout with replicate + patrol (dropping evade) can split into two patrol-only micro-scouts. They can't evade, they can't hook (0 hook slots), but they can observe. They're biological drones — cheap, disposable, information-gathering swarms. This is a legitimate strategy: flood the board with micro-scouts that observe everything, pipe all observations to a single relay, and let the relay's compress skill handle the data explosion.

**Where it breaks:** The micro-swarm strategy collapses if the enemy has any area denial. One-shot-one-kill means every micro-scout dies to a single striker adjacency. But the micro-scouts are so numerous that the enemy can't kill them all. The degenerate case: 16 buffer-1 scouts occupying every other tile on the 8×8 board, making it impossible for enemy strikers to move without adjacency kills, but also impossible for the player's own strikers to move. The board locks up.

**The guardrail:** Copies have a **generation counter**. Gen-0 (original) can replicate. Gen-1 (first copy) can replicate. Gen-2 (second copy) cannot — the replicate skill is grayed out, showing a "GENE LIMIT" tag. Maximum population from one ancestor: 4 units (1 splits to 2, each splits to 2 = 4 gen-2 units). This caps the swarm without removing the mechanic. Additionally, replicated units cost half the parent's ongoing energy upkeep each — so 4 quarter-scouts still cost 2× the original scout's energy budget, creating economic pressure against infinite splitting.

**Sensory:** Mitosis is the most dramatic animation in the game. The parent unit's sprite begins vibrating — a rapid horizontal oscillation, 2 pixels left-right, increasing in frequency over the 2-tick duration. On tick 2, the sprite splits down the center with a white flash, and two smaller sprites snap to adjacent tiles. The copies glow with a faint generation marker: gen-1 copies have a small "II" watermark in their corner; gen-2 copies have "IV." The split sound is a crisp digital *crack* — like a crystal fracturing — followed by two tiny boot-up chimes (the copies initializing). In Inspector, the mitosis event shows a family tree: parent node connecting to two child nodes, with inherited rules/hooks listed and dropped ones shown with red strikethrough.

---

### Model C: "The Template Evolution" — Agents That Modify Their Own Blueprint Before Spawning

**How it works:** The Command unit's `reassign` skill is extended to allow in-battle blueprint modification. Not just "queue blueprint X" but "queue blueprint X with rule 3 modified to prioritize tagged enemies." The Command unit observes battle conditions, identifies suboptimal configurations, and orders improved versions of existing units. The spawned unit isn't a copy — it's an *evolved* copy.

**Mechanical rules:**
- Only Command units can modify blueprints (requires `reassign` skill + sufficient buffer to hold the modification context)
- Modifications are limited to: reordering rules (change priority), toggling one hook on/off, changing one listen/ignore filter
- Each modification costs 1 buffer slot to "hold" the modification intent (Command unit's buffer shrinks by 1 for each pending modification — released when the modified unit spawns)
- Modified blueprints are temporary — they don't persist to the player's permanent loadout
- Modified units cost 125% of the base blueprint cost

**Why it's interesting:** This is the closest the game gets to runtime machine learning. The Command unit is doing online adaptation — observing what works, tweaking what doesn't, and deploying improved agents. A Command unit that receives intelligence from a Specialist's hack (enemy buffer snapshot) might notice the enemy has no scouts on the east flank and modify the next striker's rules to prioritize eastward movement. The player didn't program this specific adaptation — they programmed the *capacity to adapt*.

**The teaching moment:** This directly maps to fine-tuning in ML. The base blueprint is the pre-trained model. The Command unit's modification is the fine-tuning step. The observation data that informed the modification is the training data. The player learns that good fine-tuning requires: (1) good training data (scout/specialist intel), (2) small targeted changes (one rule reorder, not a complete rewrite), (3) a cost (buffer slots + material premium).

**Where it breaks:** If the Command unit can modify blueprints, can it modify them in a way that makes the *next* Command unit even better at modifying? This recursive self-improvement is either the most exciting thing in the game or an infinite optimization spiral that the player can't control. If Command-A modifies Command-B's blueprint to be a better modifier, and Command-B modifies Command-C's blueprint even further... this is literally the alignment problem.

**The guardrail:** Command units cannot modify Command blueprints. A Command unit can improve scouts, strikers, relays, and specialists — but not other Command units. The player must manually design Command units. This is both a game balance constraint and a thematic statement: *the architect cannot automate the architecture*. At some level, human judgment must remain in the loop.

**Sensory:** Blueprint modification appears as a holographic overlay on the Command unit's tile. A translucent blueprint card materializes above the Command unit, showing the target blueprint with the modified element highlighted in amber. The modification itself animates: a rule sliding from position 3 to position 1 (reorder), or a hook toggling from green to gray (disabled). The blueprint card then dissolves into particles that drift toward the factory, where the modified blueprint icon appears on the conveyor belt with an amber tint instead of the usual blue. In Inspector, the modification event shows a diff view: original blueprint on the left, modified on the right, changed elements connected by amber lines. The sound is a soft synthesizer chord — ascending notes for improvement, descending for... well, the player won't know if it's an improvement until they see the result.

---

### Model D: "The Seed Pod" — Expendable Units That Become Spawn Points

**How it works:** A new skill, **root**, allows a unit to permanently anchor itself to a tile and become a secondary spawn point. The rooted unit can no longer move but continues using its other skills. New units produced from this spawn point inherit the rooted unit's blueprint configuration. The rooted unit essentially becomes a mini-factory — a forward operating base that can produce one unit type.

**Mechanical rules:**
- Root is irreversible (the unit is permanently stationary after rooting)
- Rooted unit retains all skills except movement-dependent ones (patrol becomes observe-in-place, evade is disabled)
- Rooted unit can produce one unit every 2N ticks (twice the main factory's production rate — slower but forward-positioned)
- Production from rooted units costs 125% (field manufacturing premium)
- Rooted unit has +2 buffer slots (the "root network" grants additional memory from terrain connection)
- Only one rooted unit per unit type allowed (can't have 5 rooted scouts)
- Rooted units are high-value targets — if destroyed, the spawn point is lost and all queued production is canceled

**Why it's interesting:** Root transforms the game's spatial dynamics. The locked factory model has one spawn point — the player's base. All units emerge from one location and must traverse the board. Root creates forward deployment options: root a relay at the center of the board, and future relays spawn there instead of at the base. This cuts signal latency in half for central operations.

**The strategic depth:** Root is a commitment mechanic. You sacrifice a mobile unit for a permanent positional advantage. A rooted scout at D4 becomes a permanent observation post with expanded buffer — it sees everything in its perception radius every tick, forever, and can hook signals to the network. But it can never retreat. If the enemy advances, the rooted scout dies. The decision to root is a bet on territorial control — "I believe I will hold this position for the rest of the battle."

**Interaction with the campaign arc:** Root is introduced in Mission 6 (factory mission), when the player first has enough resources to sacrifice a unit for infrastructure. By Mission 9, advanced players have 2-3 rooted units forming a mesh network of forward bases, each producing specialized units tuned to their sector of the board. This IS the "building systems that build systems" promise — the player designs an architecture of architectures.

**Where it breaks:** Rooted relays at strategic positions create an unbreachable information network. If the relay is rooted at the center with amplify, every signal reaches every unit in 1 hop instead of 2-3. The enemy has no information advantage — the player's network is omniscient. Combine with rooted scouts at flanking positions and the player has complete battlefield awareness with no mobile scouts needed.

**The guardrail:** Rooted units emit constant EM noise (they're always broadcasting). The EM emission is double a normal unit's — the root network connection is loud. Enemy AI specifically targets rooted units as high-value objectives. This means rooted units need protection (striker escorts), which costs resources and mobility. The root-everything strategy works until the enemy dedicates strikers to root-hunting, at which point the player's static network becomes a liability.

**Sensory:** Rooting is a 3-tick animation — the longest in the game. Tick 1: the unit's sprite begins descending, legs/base sinking into the grid tile. Translucent root tendrils (circuit-board trace patterns, glowing cyan) spread from the unit's base into adjacent tiles. Tick 2: the tendrils thicken, the unit sinks further, a ring of light pulses outward from the tile. Tick 3: the unit locks into place with a deep resonant *thoom* — a bass note that vibrates the screen slightly. The tile permanently changes: circuit-trace patterns glow faintly in the tile's surface, marking it as a root node. The unit's sprite shifts to a "fortified" variant — more angular, more embedded, with visible antenna arrays. A new spawn point indicator (small diamond) appears next to the unit's icon on the production queue. The whole animation feels like a building being constructed — weighty, permanent, consequential.

---

### Model E: "The Quine" — The Achievement Puzzle of True Self-Replication

**How it works:** This isn't a standard mechanic — it's a hidden achievement and puzzle challenge. True self-replication (a configuration that produces an exact functional copy of itself) is technically possible through a specific combination of: Command unit with `reassign` + `reroute`, hooked to a relay with `compress` + `amplify`, where the Command unit's rules include "when my_blueprint detected in buffer, queue identical blueprint." The "quine" is: the Command unit must be configured so that its own configuration, when processed through the information pipeline, produces a signal that triggers the Command unit to reproduce its own configuration.

**Mechanical rules:**
- No special mechanics needed — this emerges from existing primitives
- The player must configure: (1) a skill or hook that causes the Command unit's own blueprint to enter its buffer as data, (2) rules that recognize this self-referential data, (3) a reassign action that queues the same blueprint
- The "hard" part: the Command unit's buffer must contain a representation of its own configuration, which takes buffer slots, which are part of the configuration, creating a fixed-point problem
- The achievement triggers when a Command unit successfully queues a blueprint that is functionally identical to its own current configuration

**Why it's interesting:** This is a Gödel puzzle — a self-referential fixed-point problem disguised as a game mechanic. The player must construct a configuration that can describe itself completely enough to reproduce itself. This is literally the concept behind quines (programs that print their own source code), von Neumann self-replicating machines, and DNA replication. The player who solves it has understood something fundamental about computation.

**The puzzle layers:**
1. **Easy version** (most players who attempt it): Command unit's rules include "queue blueprint COMMAND-ALPHA" where COMMAND-ALPHA is its own pre-configured blueprint. This works but feels like cheating — the blueprint is stored externally (in the loadout), not in the unit's own data.
2. **Medium version**: The Command unit receives its own configuration via a Specialist's `extract` skill reading a tagged node that stores blueprint data. The configuration enters the buffer as intelligence, and rules process it into a queue command.
3. **Hard version** (the true quine): The Command unit's own hook emissions contain enough information to reconstruct its own configuration. A relay receives the emissions, compresses them, and bounces them back. The Command unit reads its own compressed description and queues a copy. The compression must be lossless enough that the copy is functional — but compression is inherently lossy. Finding the fixed point where compress(self-description) still encodes enough to reproduce self = the real puzzle.

**Where it breaks:** It doesn't break — it's a puzzle, not a viable strategy. The quine configuration is inherently inefficient: the Command unit spends most of its buffer holding self-referential data instead of battlefield intelligence. A self-replicating Command unit is a *worse* Command unit. The achievement rewards cleverness, not power.

**The teaching moment:** This maps directly to: quines in programming, Gödel numbers in mathematical logic, DNA as self-replicating code, and the halting problem (can you determine if an arbitrary configuration will replicate?). The game's Blueprint Codex could include a "Theoretical Foundations" section unlocked by this achievement, explicitly drawing the connections.

**Sensory:** When the quine achievement triggers, the screen does something it never does elsewhere: it pauses. Mid-Sealed-Watch, everything freezes for exactly 2 seconds. The Command unit that achieved self-replication glows gold. A special achievement banner unfurls — not the standard achievement pop-up, but a unique diegetic event: the boot log reappears briefly with a new entry: `> SELF-REFERENCE DETECTED. FIXED POINT ACHIEVED. THIS UNIT KNOWS WHAT IT IS.` The sound is a slow, ascending arpeggio — each note higher than the last, like a staircase climbing to infinity, then cutting off abruptly. In Inspector, the quine event has a special visualization: a Möbius strip connecting the Command unit to itself through the relay chain, buffer entries flowing in a loop.

---

## Cross-Model Comparison Matrix

| Dimension | A: Blueprint Printer | B: Mitosis | C: Template Evolution | D: Seed Pod | E: The Quine |
|-----------|---------------------|------------|----------------------|-------------|-------------|
| **Who replicates** | Command orders subordinates | Any unit with the skill | Command modifies then orders | Any unit sacrifices mobility | Command through self-reference |
| **What's copied** | Exact blueprint | Halved-stat clone | Modified blueprint | Blueprint + spawn location | Self-referential config |
| **Cost** | 150% material | 2 ticks vulnerability | 125% + 1 buffer slot | Permanent immobility + 125% | Massive buffer inefficiency |
| **Generation limit** | Unlimited (resource-gated) | 2 generations (4 max from 1) | 1 modification per spawn | 1 per unit type | N/A (achievement, not strategy) |
| **Degenerate risk** | Medium (economy drain) | High (board lockup) | Medium (recursive improvement) | Medium (static fortress) | None (self-balancing) |
| **Mission introduction** | Mission 6 (factory) | Mission 7 (advanced) | Mission 8 (meta-level) | Mission 6 (factory) | Hidden achievement |
| **Teaching concept** | Thermostat/feedback loop | Resource splitting tradeoff | Fine-tuning / adaptation | Forward deployment / commitment | Quines / self-reference / Gödel |
| **TikTok clip potential** | Low (subtle) | High (dramatic split anim) | Medium (holographic blueprint) | High (rooting animation) | Very High (pause + gold glow) |

---

## Interaction Effects with Other Systems

### With Production Economy (Locked)
All replication models interact with the passive income + factory production system. Models A, C, and D increase unit output beyond what the base factory alone produces. If passive income is balanced around single-factory production rates, replication creates economic inflation. **Design requirement:** replication cost premiums (125-150%) must exceed the tactical value of faster deployment, or replication dominates.

### With One-Shot-One-Kill (Locked)
Model B's mitosis is uniquely shaped by the no-HP rule. Half-stat copies aren't "weaker" in combat — a buffer-3 scout dies just as dead as a buffer-6 scout. The weakness is informational: smaller buffers mean less working memory, which means worse decisions, which means more likely to be in the wrong place. This is elegant — replication degrades intelligence, not durability.

### With EM Emissions (Locked)
Models A and D increase network size, which increases EM noise. More units = more hooks firing = more detectable signals. Self-replicating architectures are louder architectures. The enemy doesn't need to scout if the player's network is screaming its topology through emissions. **Design implication:** replication strategies pair naturally with the Specialist's hack skill (know what the enemy knows about you) and with filter-heavy relay configs (reduce emission surface).

### With Context Overload (Locked)
More units = more signals = more buffer pressure. Model B's micro-swarm is particularly dangerous: 8 micro-scouts observing simultaneously flood the relay network with observations. Even with compress, the relay's buffer fills in 2-3 ticks. Self-replication can cause network-wide context overload — a distributed denial-of-service attack on your own information architecture. **Teaching moment:** the player learns that more agents isn't always better. This is the scaling problem in real distributed systems.

### With the Inspector (Locked)
Replication events need special Inspector treatment. Model B's family tree, Model C's diff view, Model D's root network visualization, and Model E's Möbius strip all require dedicated Inspector views. **Design implication:** replication should be introduced at Mission 6+ when the player is already fluent with Inspector. Replication without post-hoc analysis is just chaos.

### With Tagging (Locked)
Model D's rooted units interact with the presence-based tagging system. A rooted unit permanently tags its tile and adjacent tiles — guaranteed resource income from a permanent position. Rooting on or adjacent to a resource node is a powerful economic play: permanent extraction + forward spawn point. **Design implication:** resource node placement on the 8×8 board must account for root-viable positions.

---

## Comparable Games

### Screeps (Self-Replicating Creeps)
Screeps allows players to write JavaScript that spawns new creeps with programmatic body part composition. Advanced players create "self-bootstrapping" bases: a single creep arrives in a new room and spawns progressively more capable creeps until a full economy is running. The key lesson: self-replication in Screeps is gated by energy harvesting, creating a natural exponential ramp-up that feels earned. Robot Uprising's passive income model lacks this energy constraint — replication needs alternative gates (cost premiums, generation limits, EM noise).

### Factorio (Self-Expanding Factories)
Factorio's endgame is building factories that build factories. The "bootstrap" phase — where a small manual factory produces the components for a larger automated factory — is the most satisfying loop in the game. Model D (Seed Pod) captures this: a rooted unit IS a forward factory that produces components (units) for the larger architecture. Factorio teaches that self-expansion works when each new factory node requires *more* infrastructure to support, creating diminishing returns that prevent runaway growth.

### Conway's Game of Life (Emergent Replication)
Life's gliders, guns, and replicators emerge from simple rules without being explicitly programmed. Model E (The Quine) is Robot Uprising's version of this: self-replication as an emergent property of the configuration space, not a designed feature. The Gosper Glider Gun (a Life pattern that produces gliders indefinitely) is the conceptual ancestor of Model A (Blueprint Printer). Life teaches that simple replication rules + spatial constraints = bounded complexity.

### Grey Goo (RTS Self-Replication)
The 2015 RTS Grey Goo features a faction (the Goo) that replicates by consuming resources — a blob that splits into smaller blobs, each capable of becoming a unit or splitting further. This is almost exactly Model B (Mitosis). Grey Goo's design lesson: the Goo faction was perceived as overpowered in early patches because replication outpaced the economy of the other two factions. Balance required making replication *visible* (the Goo blob is large and conspicuous) and *vulnerable* (mid-split units take bonus damage). Robot Uprising should learn: replication during the 2-tick split window must be a high-risk moment.

### DNA and Molecular Biology
The biological metaphor is unavoidable. Model B is mitosis. Model C is mutation + selection. Model D is colonization/rooting. Model E is the central dogma (DNA encoding its own replication machinery). The Blueprint Codex entries for replication skills should lean into these parallels — not as forced metaphors but as genuine isomorphisms. A player who understands Robot Uprising's replication mechanics has a serviceable mental model of molecular biology.

---

## Player Journeys

### Journey: Priya, 24, Computer Science Graduate Student

**Context:** Mission 7 (Command agent introduction). Priya has completed Missions 1-6 and is comfortable with basic information architectures. She's playing her second attempt at Mission 7 after losing her first attempt when enemy strikers overwhelmed her scouts. She's unlocked the Command unit and is building her first command architecture.

**Minute 0:00 — Plan Screen: The Reinforcement Problem**
Priya stares at the Plan screen. Board on the left shows the Mission 7 layout: her base at A1, enemy spawner at H8, resource nodes at C3 and F6. Workbench on the right shows her current loadout: 2 scout blueprints, 2 striker blueprints, 1 relay blueprint, 1 Command blueprint. Her last attempt failed because she lost both scouts early and had no way to rebuild them — she was blind for the last 30 ticks. She opens the Command unit's blueprint editor.

**Minute 0:45 — Discovering Reassign's Production Extension**
In the Command unit's skills panel, Priya toggles `reassign` into an active slot. A tooltip appears: "Reassign: Change subordinate skill allocation, hook routing, or — NEW — queue production orders." Her eyes widen. She clicks the (?) icon next to "queue production orders." A Blueprint Codex card slides in from the right: "The Command unit can push blueprints into the factory queue. Each order costs 150% of the base blueprint cost and uses 1 tick. Maximum 2 pending orders per Command unit." Priya's face lights up — this solves her scout attrition problem.

**Minute 1:30 — Writing the Thermostat Rule**
Priya drags a new rule into the Command unit's rule strip. She configures it:
- **Condition:** `unit_count(scout) < 2`
- **Action:** `queue_blueprint(SCOUT-ALPHA)`
- **Priority:** 3 (below "reroute strikers to threats" and "amplify breach signals" but above "idle scan")

She pauses. The 150% cost means each replacement scout costs 4.5m instead of 3m. At passive income of 2m/tick, that's 2.25 ticks of income per scout. She checks her resource projection on the conveyor belt cost preview: if she loses both scouts simultaneously, the Command unit will order two replacements at 9m total, which depletes her reserves. She adds a second condition: `resources > 6m` — only order replacements when she can afford them without starving striker production.

**Minute 2:15 — The "Aha" Moment**
Priya realizes she's written a feedback controller. The Command unit monitors scout population, compares to a desired count, and acts when there's a deficit — but only when resources permit. This is literally a PID controller with a resource constraint. She mutters "oh, that's a control loop" and adjusts the threshold: `unit_count(scout) < 1` instead of `< 2`, reasoning that she should tolerate one scout loss before spending resources on replacement. Conservative control. She can always tune the threshold later.

**Minute 3:00 — Execute and Watch**
She hits EXECUTE. Sealed Watch begins. Her two scouts patrol, her relay compresses, her strikers advance. Tick 14: an enemy striker eliminates SCOUT-BRAVO. Priya tenses. Tick 15: the Command unit's antenna rotates — the reassign animation. An amber line arcs to the factory. Tick 16: SCOUT-BRAVO-II appears on the conveyor belt with a golden border. Tick 22: SCOUT-BRAVO-II deploys from the base, already running SCOUT-BRAVO's patrol route. Priya exhales. The architecture healed itself.

**Minute 4:00 — Inspector Debrief**
In the Inspector, Priya scrubs to tick 15 and clicks the Command unit. The decision trace shows: "Rule 3 evaluated: unit_count(scout) = 1 < 2 AND resources = 8m > 6m → queue_blueprint(SCOUT-ALPHA)." She sees the 4.5m cost deducted from the resource counter. She opens the timeline view and notices that the 6-tick gap between scout loss and replacement (ticks 14-22) was exactly the window when her eastern flank was blind. She adds a note: "Can I reduce the deployment gap?" She considers rooting a relay closer to the east to act as a forward spawn point for Mission 8.

**UI Annotations:**
- **Command skill panel:** Reassign skill shows a sub-option dropdown: "target: subordinate skills / hook routing / production queue." The production queue option has a "NEW" badge for first-time encounters.
- **Rule editor:** Condition field supports `unit_count(type)` and `resources > N` as auto-completed options. The auto-complete learns from the player's vocabulary.
- **Conveyor belt:** AI-ordered units show with golden border. Hovering reveals "Ordered by COMMAND-ALPHA, tick 15, cost 4.5m (150% premium)."
- **Inspector decision trace:** Shows the complete rule evaluation chain with green highlights on matched conditions and amber highlights on resource cost.

---

### Journey: Marcus, 38, Factorio Veteran and Software Architect

**Context:** Mission 9 (full system). Marcus has been optimizing his architecture for 3 hours across multiple retries. He's discovered Model D (rooting) on Mission 7 and has been theory-crafting forward deployment networks. He's attempting what he calls "The Hydra" — a self-repairing mesh network of rooted relays and Command-driven reinforcement.

**Minute 0:00 — The Hydra Blueprint**
Marcus's Plan screen is dense. Five blueprints are active:
1. SCOUT-RECON: patrol + evade, hooks to "intel" channel, buffer 6
2. STRIKER-FANG: engage + breach, listens on "target" channel, buffer 8
3. RELAY-NODE: compress + filter + root, hooks to "intel" and "target" channels, buffer 12
4. COMMAND-HYDRA: reassign + reroute + prioritize, hooks to all channels, buffer 14, rules including the reinforcement thermostat AND a new rule: "when relay_count < rooted_relay_count, queue RELAY-NODE"
5. SPECIALIST-REAPER: hack + extract, hooks to "intel" channel, buffer 10

The production queue shows: RELAY-NODE, RELAY-NODE, SCOUT-RECON, COMMAND-HYDRA, STRIKER-FANG, STRIKER-FANG, RELAY-NODE.

His strategy: deploy 3 relays, root them at positions C3, E5, and F3 (forming a triangle covering 70% of the board). Then the Command unit maintains a standing army of 2 scouts and 3 strikers, with automatic replacement on loss.

**Minute 1:00 — The Root Sequence**
Marcus's opening is choreographed. He's run this mission 4 times and optimized the root positions. He hits EXECUTE. Sealed Watch: Tick 1-6: RELAY-ALPHA deploys, begins moving toward C3. Tick 7: RELAY-ALPHA arrives at C3 and begins rooting. The 3-tick root animation plays — tendrils spreading, the unit sinking, the deep *thoom*. Tick 10: RELAY-ALPHA is rooted. Circuit traces glow on C3. The production queue shifts — RELAY-BRAVO begins building.

By tick 25, all three relays are rooted. Marcus watches the channel wiring visualization: cyan lines connecting the three relay nodes in a triangle, with scout signal paths feeding in and striker command paths feeding out. The board looks like a circuit diagram. He whispers "there's the mesh."

**Minute 2:30 — The Stress Test**
Tick 30: Enemy sends a 3-striker push toward RELAY-BRAVO at E5. Marcus's scout detects them at tick 28, hooks to "intel." RELAY-ALPHA at C3 compresses the report and amplifies it on "target." Both STRIKER-FANGs converge on E5 to defend. Tick 33: one enemy striker reaches E5, adjacent to RELAY-BRAVO. Marcus grips his desk. Tick 34: STRIKER-FANG-ALPHA engages the enemy at E4. Red flash. The relay survives.

But STRIKER-FANG-ALPHA is now at E4, out of position. The other two enemy strikers flank to F5 and E6. Tick 35: RELAY-BRAVO is eliminated. The rooting animation plays in reverse — tendrils retracting, circuit traces dimming, the tile returning to normal. A low descending tone. The spawn point at E5 is gone.

**Minute 3:00 — The Hydra Regenerates**
Tick 36: COMMAND-HYDRA evaluates: `rooted_relay_count = 2, relay_count = 2 → no deficit.` Wait — the relay count equals the rooted count because BRAVO was the only unrooted relay... Marcus realizes his rule is wrong. He needs `relay_count < 3` not `relay_count < rooted_relay_count`. The Command unit doesn't order a replacement because it compares counts incorrectly. His self-healing architecture has a bug.

**Minute 4:00 — Inspector Forensics**
In Inspector, Marcus scrubs to tick 36 and examines COMMAND-HYDRA's decision trace. The rule evaluated as: `relay_count(2) < rooted_relay_count(2) → FALSE → no action.` He sees the problem immediately — the condition should be absolute (`relay_count < 3`), not relative. He also notices that RELAY-BRAVO's destruction at tick 35 caused a cascade: signals that were routing through E5 now take 2 extra ticks to reach STRIKER-FANG-BRAVO via the surviving relays. The information latency spike is visible on the latency sparkline: a sharp upward spike at tick 35 that never recovers.

Marcus opens a new text file on his second monitor and writes: "Root destruction must trigger re-rooting. Need a Command rule for 'when rooted_relay_destroyed, queue new relay AND designate next relay for rooting at same position.' The Hydra must literally regrow its head." He's designing a self-healing distributed system. He's been a software architect for 12 years and this is the first time a game has given him the same problem he solves at work.

**UI Annotations:**
- **Root animation:** 3 ticks. Tendrils spread as cyan circuit traces. Deep *thoom* bass note on completion. Tile permanently marked.
- **Root destruction:** Reverse animation over 1 tick. Tendrils retract, traces dim. Descending tone. Spawn point diamond disappears from conveyor belt.
- **Channel wiring visualization:** During Sealed Watch, dashed colored lines show active channels. Triangle mesh between three relays is clearly visible. When E5 relay is destroyed, the triangle breaks — the line to E5 fades, and the remaining two relays show only a single connecting line. The visual degradation is immediate and unmistakable.
- **Latency sparkline:** In Inspector, each unit has a "signal latency" sparkline showing average ticks-to-receive for incoming signals. The spike at tick 35 (relay loss) is sharp and persistent — a visual scar on the architecture's health.

---

### Journey: Anika, 14, First Strategy Game, Playing Mission 4

**Context:** Mission 4 (hooks tutorial). Anika has never heard of self-replication — she's still learning basic hooks. But she accidentally creates a proto-replication loop that teaches her the concept before the game formally introduces it.

**Minute 0:00 — The Accidental Loop**
Anika is configuring her first relay. The mission gives her pre-placed units: 1 scout, 1 relay, 1 striker. She's learning hooks — "when scout sees enemy, tell relay. Relay tells striker." She opens the relay's hook panel and types "help" as the channel name for the relay's outgoing hook. Then she opens the striker's listen config and adds "help."

But she also adds "help" to the relay's *listen* config — an accident. She meant to have the relay only *send* on "help," but now it listens to its own channel. She hits EXECUTE.

**Minute 0:30 — The Echo**
Sealed Watch. Tick 5: Scout spots enemy, hooks a signal to the relay. Tick 6: Relay receives the signal, amplifies it on "help." The signal goes to the striker — and back to the relay itself (because the relay listens on "help"). Tick 7: Relay receives its own amplified signal. Its rules treat it like a new incoming signal. It amplifies again. Tick 8: The relay receives another copy. Tick 9: another. The relay's buffer fills with copies of the same signal, each one amplified. Context overload hits at tick 10 — the relay sparks, jitters, and stuns for 1 tick. Its buffer compacts.

**Minute 1:00 — The Mystery**
Anika watches the relay spark with wide eyes. "Why did it break?" She doesn't understand yet. The relay recovers at tick 11, but immediately begins accumulating self-amplified signals again. Tick 15: overload again. The relay is cycling: receive→amplify→receive→amplify→overload→recover→repeat. It's a feedback loop — an infinite echo chamber.

**Minute 1:30 — Inspector Discovery**
Inspector mode. Anika scrubs to tick 6 and clicks the relay. She sees the buffer state: slot 1 has the scout's original signal. Slot 2 has the same signal, but marked "source: RELAY-ALPHA (self)." Slot 3: same signal, "source: RELAY-ALPHA (self)." She sees it — the relay is talking to itself. The channel map panel shows "help" with both a send arrow and a receive arrow pointing to the same relay. A small amber warning icon appears next to the self-connection: "⚠ Self-loop detected."

Anika removes "help" from the relay's listen config. But she remembers the self-loop. The game has planted a seed: an agent that references itself creates feedback. When she encounters true self-replication in Mission 7, she'll have a visceral memory of what self-reference does.

**Minute 2:00 — The Lesson Lands Later**
Mission 7, three sessions later. Anika encounters the Command unit's `reassign` skill and its production queue capability. She reads the Blueprint Codex entry: "The Command unit can order new units, creating a feedback loop between battlefield losses and factory production." She recognizes the word "feedback loop" — it's what her relay did when it talked to itself on "help." But this time the feedback is intentional: observe deficit → order replacement → deploy replacement → observe no deficit → stop ordering. A controlled loop, not an infinite echo.

She configures her first reinforcement thermostat rule, remembering to NOT create a self-loop: the Command unit orders scouts, but scouts don't order Command units. The directionality is intentional. She's learned the difference between feedback (controlled) and feedback (destructive) from a mistake she made three missions ago.

**UI Annotations:**
- **Self-loop warning:** Amber ⚠ icon appears on the channel map panel when any unit both sends and receives on the same channel. Hovering shows: "This unit listens to its own broadcasts. Signals may echo." Not blocking — the player can create self-loops intentionally.
- **Buffer echo visualization:** In Inspector, self-sourced buffer entries show with a distinctive looping arrow icon (↻) instead of the standard source arrow. The visual makes the self-reference unmistakable.
- **Overload recovery cycle:** In Inspector timeline, a unit that repeatedly overloads shows a sawtooth pattern on its context window chart: fill→red→compact→fill→red→compact. The sawtooth is visually distinct from normal operation's steady-state level.

---

## Recommended Design Integration

**Which models to include in the first playable:**

| Model | Include? | When | Why |
|-------|----------|------|-----|
| A: Blueprint Printer | **Yes** | Mission 6 | Core meta-level mechanic. Simple, teachable, directly maps to control theory and thermostat patterns. The minimum viable self-replication. |
| B: Mitosis | **No (defer to expansion)** | Post-launch | High degenerate risk, requires extensive balancing. The micro-swarm strategy warps the entire game around a mechanic that isn't the core thesis. Save for an expansion pack where unit variety is the theme. |
| C: Template Evolution | **Maybe (Mission 9-10)** | Late campaign | Extremely cool but requires the player to understand modification, which requires understanding blueprints deeply. Works as a capstone mechanic that rewards mastery. Only if the campaign has room for it in Missions 9-10. |
| D: Seed Pod | **Yes** | Mission 7 | Transforms spatial dynamics. Creates the most "Factorio moment" — forward deployment networks feel like building infrastructure. Natural progression from Mission 6's factory introduction. |
| E: The Quine | **Yes (hidden)** | Anytime | Zero balance risk (self-defeating by design). Adds intellectual depth for the puzzle-minded. The achievement moment is a viral-clip candidate. |

**The self-replication progression across the campaign:**
- Mission 1-5: No replication. Learn fundamentals.
- Mission 6: Model A (Blueprint Printer) — Command unit can queue reinforcements. The thermostat.
- Mission 7: Model D (Seed Pod) — Units can root to create forward spawn points. The infrastructure.
- Mission 9-10: Optional Model C (Template Evolution) — Command unit can modify blueprints. The adaptation.
- Hidden: Model E (The Quine) — Achievement for true self-replication. The puzzle.

---

## New Aspects Discovered

1. **3.19a-i — The reinforcement thermostat as control theory tutorial:** Detailed design of the "maintain N units" rule pattern — how it maps to PID controllers, set points, error signals, and corrective actions; mission design that teaches proportional vs. bang-bang control; when the thermostat oscillates (P-only) vs. stabilizes (PID-equivalent rules)
2. **3.19a-ii — Root network topology optimization:** The spatial puzzle of where to place rooted units on the 8×8 grid — coverage overlap analysis, signal latency graphs for different configurations, the tradeoff between coverage breadth and defensive depth; how mission terrain constrains root positions
3. **3.19a-iii — The Quine achievement puzzle design:** Detailed walkthrough of the three difficulty tiers — what configurations work at each level, what hints the game provides, how the Blueprint Codex entry is written to be suggestive without spoiling; the Gödel connection as educational payoff
4. **3.19a-iv — Self-replication as enemy tactic:** The enemy AI using Models A-D against the player — enemy forward bases that root and spawn, enemy command units that reinforce; how the player detects and counters enemy self-replication; the "whack-a-mole" mission pattern
5. **3.19a-v — Feedback loop visualization in Inspector:** Dedicated Inspector view for detecting and analyzing loops (self-loops, echo chambers, controlled feedback) — signal flow graph with cycle detection, oscillation warnings, "loop health" metrics; applicable beyond self-replication to any cyclic hook configuration
