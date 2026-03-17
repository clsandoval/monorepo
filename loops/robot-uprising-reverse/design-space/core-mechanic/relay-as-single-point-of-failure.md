# 2.00f-i — Relay as Single Point of Failure: Network Resilience Design

**Aspect:** When the player builds a relay-centric information architecture, each relay becomes a critical node whose destruction fragments the entire network. How does the player protect critical relays? What defensive patterns emerge? What does network fragmentation feel like — and how does the game teach network resilience without a textbook?

**Category:** Core Mechanic (Wave 2)
**Dependencies:** 2.00f (No Global Coordinator), 2.14 (Spatial Routing), 3.19a-ii (Root Network Topology), 3.03 (Skill Interactions), 3.10b (Signal Latency Legibility)

---

## The Design Problem

The locked design creates a fundamental tension: relays are **stationary** (Speed: Static), have **no perception** (Perception: None), and possess **no combat skills** (skills: compress, filter, amplify). They are the game's most important units and its most defenseless. A single striker reaching an undefended relay destroys it instantly (one-shot, one-kill). Every signal chain routing through that relay goes dark. Every unit downstream loses its information feed. Context windows stop filling. Rules that depend on incoming signals stop matching. The army doesn't die — it goes *blind*.

This is the **Relay SPOF Problem**: the more centralized and efficient an architecture, the more catastrophically it fails when a single node is removed. The game must make this problem **visceral**, **diagnosable**, and **solvable through player skill** — not through brute-force redundancy.

---

## Six Defensive Paradigms

### Paradigm 1: "The Bodyguard" — Dedicated Striker Escort

The simplest defense: assign a striker to stand adjacent to each relay, configured with rules that prioritize defending the tile.

**Mechanical specification:**
- Striker blueprint with Rule 1: `IF enemy_adjacent_to(RELAY-A) → engage`
- Striker positioned one tile from the relay, within its narrow perception (radius 2)
- Cost: 8 minerals + 3 energy/tick per relay defended — expensive
- The striker's context window fills with relay-proximity data, reducing bandwidth for other signals

**What it feels like:** A sentry standing guard. The striker's idle animation should convey vigilance — head scanning, weapon tracking. When an enemy enters perception range, the striker snaps to attention. The tile around the relay feels *guarded* — the player can see the striker's narrow perception cone overlapping the relay's position.

**Strengths:**
- Simple to configure — one rule, one unit
- Deterministic — the bodyguard always responds
- Teaches basic rule-writing: the player's first "IF → THEN" that isn't about movement

**Weaknesses:**
- Expensive: doubles the cost of every relay node (5m relay + 8m striker = 13m per node)
- Inflexible: the bodyguard can't help elsewhere on the battlefield
- Vulnerable to multi-angle attack: two enemies approaching from opposite sides overwhelm the single defender
- Doesn't scale: 3 relays = 3 bodyguards = 24 minerals just for defense

**The TikTok clip:** A lone striker standing next to a relay. Two enemy scouts approach from different angles. The striker engages one — and the other slips past. The relay dies. Every signal chain on the board goes dark simultaneously. The army freezes. One tick of confusion. Then the cascade.

---

### Paradigm 2: "The Picket Line" — Distributed Perimeter Defense

Instead of guarding individual relays, create a perimeter of scouts and strikers that intercept threats before they reach relay positions.

**Mechanical specification:**
- Scout ring with hooks broadcasting `threat-detected` on channel `perimeter`
- Strikers listening on `perimeter`, with rules: `IF signal_on(perimeter) AND source_direction(signal) → move_toward(source)`
- Relays positioned behind the perimeter line, at least 2 tiles from any board edge
- Cost: distributed across existing combat units (scouts + strikers already deployed)

**What it feels like:** A military defense in depth. The scouts are the early warning system — their wide perception (radius 5) catches enemies 3-4 ticks before they reach relay range. The signal chain fires: scout sees enemy → broadcasts on `perimeter` → striker receives 1 tick later → striker moves to intercept → engagement happens 2 tiles from the relay.

**Strengths:**
- Multi-purpose units: scouts and strikers contribute to offense AND defense
- Depth: multiple layers of detection before the relay is threatened
- Scales naturally: more combat units = wider perimeter

**Weaknesses:**
- Latency vulnerability: signal from scout → striker takes 1-2 ticks. Fast enemies can slip through gaps during that delay
- EM exposure: the perimeter broadcasts constantly, making the relay cluster's location inferrable from emissions
- Requires correct spatial placement — a gap in the perimeter is an invitation
- Falls apart against enemies that ignore the perimeter (e.g., hacking specialist that disables a scout's perception)

---

### Paradigm 3: "The Redundant Mesh" — Parallel Relay Chains

Build two or more relay paths connecting the same source to the same destination. If one relay dies, the signal still reaches its target through the alternate path.

**Mechanical specification:**
- Two relay units (RELAY-A and RELAY-B) both listening on channel `raw-intel`
- Both broadcasting on channel `processed-intel` after applying compress/filter
- Downstream units listen on `processed-intel` and receive from whichever relay is still alive
- Cost: 10 minerals + 4 energy/tick (double relay investment) but zero additional striker cost

**What it feels like:** Redundancy you can *see*. In the Plan screen, the channel map shows two parallel subway lines connecting the same stations. The wires run through different tiles — RELAY-A positioned left of center, RELAY-B positioned right. During sealed watch, when one relay dies, the surviving relay's signal lines brighten as it absorbs the full traffic load. There's no stutter. No darkness. The army keeps moving. The context bars on downstream units flicker amber for one tick as they lose one source, then stabilize.

**Strengths:**
- True resilience: no single relay death causes network fragmentation
- Graceful degradation: losing one relay reduces capacity but doesn't kill the network
- Teaches a transferable concept: redundancy as engineering principle
- Combined processing: two relays can split the processing load (RELAY-A compresses, RELAY-B filters) for higher throughput

**Weaknesses:**
- Doubles relay cost (10m instead of 5m for one link)
- Doubles EM footprint — the mesh is *loud*
- Spatial challenge: two relays need two separate tiles, and the 8×8 board is small
- Context window pressure: downstream units receive signals from both relays, potentially filling buffers faster (context overload risk if both relays send simultaneously)

**The TikTok clip:** Split-screen. Left: a player's single-relay architecture. Right: the same player's mesh architecture. Same enemy attack. Left screen: relay dies, army goes dark, cascade loss. Right screen: relay dies, surviving relay glows brighter, army barely notices, victory. The before/after of redundancy.

---

### Paradigm 4: "The Relocator" — Dynamic Relay Repositioning (Advanced)

This paradigm uses the **Command agent's `reroute` skill** to dynamically reassign relay responsibilities when one is destroyed.

**Mechanical specification:**
- Command agent with hook: `WHEN unit_destroyed(type=RELAY) → reroute(channel=*, target=nearest_relay)`
- The `reroute` skill reassigns all channel subscriptions from the dead relay to the nearest surviving relay
- Signal latency increases temporarily (new routing may add hops) but network integrity is preserved
- Cost: 10 minerals for Command agent (one-time) + 4 energy/tick + the relay cost itself

**What it feels like:** The Command agent is the network's immune system. When a relay dies, there's a visible "rerouting" animation on the channel map — cyan dashed lines redraw themselves in real-time, snaking through the new path. For one tick, the downstream units receive nothing (the rerouting tick). Then new connections light up. The channel map reorganizes. It's not seamless — there's a visible scar where the dead relay was — but the network *heals*.

**Strengths:**
- No redundant hardware needed — the Command agent IS the redundancy
- Adapts to any failure pattern — works whether the enemy kills one relay or three
- Teaches the meta-level: building systems that manage systems
- The rerouting moment is the game's most dramatic expression of the "factory of factories" concept

**Weaknesses:**
- Requires Mission 6-7 unlock (Command agent not available until mid-campaign)
- Command agent itself becomes the ultimate SPOF — if Command dies, no rerouting
- Rerouting takes 1 tick of downtime — in a one-shot-one-kill game, that tick can be fatal
- The new routing may have worse latency (more hops = more delay)
- Command agent's 14-slot buffer fills with rerouting events, potentially crowding out other command signals

---

### Paradigm 5: "The Decoy" — Sacrificial Relay as Distraction

Deploy a relay with high EM emissions in a visible position to attract enemy strikers, while the real signal infrastructure runs through a quieter, hidden path.

**Mechanical specification:**
- RELAY-DECOY: amplify skill active (maximum EM), positioned forward on the board
- RELAY-REAL: filter skill active (low EM), positioned behind cover or in a defended position
- RELAY-DECOY broadcasts on dummy channel `noise` that no unit listens to
- RELAY-REAL carries actual signal traffic on `intel`
- Enemy AI targets high-EM sources first (assuming standard enemy behavior)

**What it feels like:** Deception. The Plan screen shows two relays, but one is a ghost — its channel map connections are fake. During sealed watch, enemies swarm the loud decoy. The decoy dies in a flash of sparks. The enemy pauses, recalculates. Meanwhile, the real relay quietly processes signals in the background, its EM signature hidden by the noise of battle. When the Inspector reveals the enemy's targeting decisions, the player sees the deception working — the enemy wasted 3 ticks engaging a worthless target.

**Strengths:**
- Cheap: the decoy relay costs 5m but buys 3-5 ticks of misdirection
- Teaches EM mechanics: the player learns that emissions are a targeting signal
- Creates emergent counter-intelligence gameplay
- Satisfying when it works — watching enemies waste time on a fake target

**Weaknesses:**
- Only works against enemies that target based on EM (may not work in all missions)
- Wastes a relay slot and minerals on a non-functional unit
- If the enemy ignores EM cues, the decoy is just a wasted investment
- Doesn't protect against enemies that stumble into the real relay by chance
- Advanced enemies may learn to distinguish decoy EM patterns from real traffic patterns

---

### Paradigm 6: "The Self-Healing Mesh" — Factory-Driven Relay Replacement

Use the production queue to automatically rebuild destroyed relays, treating relay attrition as an expected cost of battle rather than a catastrophic event.

**Mechanical specification:**
- Production queue includes RELAY blueprints after initial army deployment
- Command agent hook: `WHEN unit_destroyed(type=RELAY) → queue_priority(blueprint=RELAY, position=NEXT)`
- New relay spawns at factory, must physically move (or be placed) into position — but relays are stationary, so the new relay deploys at the factory's spawn point
- Alternative: Specialist with `extract` skill recovers relay components for faster rebuild

**What it feels like:** The factory hums. A relay dies in the field. Two ticks later, a new relay assembles on the factory conveyor — you can see the blueprint icon sliding along the belt. It spawns at the factory tile. The player must have pre-planned a relay position near the factory, or this replacement relay serves a different routing purpose than the original.

**Strengths:**
- Treats relay loss as operational cost, not existential threat
- Integrates relay defense into the production economy (resource management)
- Teaches real-world resilience pattern: replace rather than protect
- No dedicated defense units needed

**Weaknesses:**
- New relay spawns at factory, not at the dead relay's position — routing topology changes
- Production queue competition: relay replacement delays other unit production
- Stationary relays can't move to the original position — the replacement serves a different network role
- Only available from Mission 5+ (factory required)
- The rebuild latency (spawn time + routing reconfiguration) may be 3-5 ticks — too slow for critical moments

---

## The Network Fragmentation Cascade

When a relay dies, the consequences ripple outward in a predictable but devastating sequence. This is the game's most important teaching moment for network resilience:

**Tick 0: Relay destroyed.** The relay sprite snaps to its broken state — sparking, collapsed. A red combat flash on the tile. The relay's context bar disappears. All signal lines passing through this relay go dark simultaneously — cyan dashed lines fade to grey and dissolve over 200ms.

**Tick 1: Downstream silence.** Every unit that was receiving signals via the dead relay gets *nothing* this tick. Their context windows have one fewer new entry. Rules that check for recent signals (`IF signal_age(intel) < 3`) find stale data. Some rules stop matching. Some units default to their lowest-priority fallback rule (often `patrol` or `hold position`).

**Tick 2: Stale intelligence.** Units downstream are now acting on information that is 2+ ticks old. Scouts have moved. Enemies have repositioned. The world the units "see" in their context window is increasingly divergent from reality. Strikers engage phantom targets. Scouts patrol areas that are already clear.

**Tick 3+: Behavioral drift.** Without fresh signals, different units drift into different default behaviors based on their rule configurations. The army loses coherence. A formerly coordinated flanking maneuver degenerates into individual units wandering their default patrol routes. The *feeling* is of watching a flock of birds suddenly scatter when the lead bird is shot.

**The sound design:** The relay death should have a distinctive audio signature — a crackling electrical short followed by a descending hum, like a server powering down. Then: silence where there used to be channel audio. If the player has learned to hear their channels (see 6.02d), the absence of sound IS the diagnostic signal. The `perimeter` channel that used to whoosh every tick goes quiet. The processed-intel channel's compressed ping stops. The silence is louder than the explosion.

**Inspector visualization:** In the Inspector, the tick of relay death is marked with a red vertical line on the timeline. Clicking any downstream unit at tick+1 shows: "Context window: 2/8 slots occupied (was 6/8 at tick-1). No new entries this tick. Last signal on channel `intel`: tick N-2 (STALE)." The decision trace shows: "Rule 1 (IF signal_on(intel) AND signal_fresh → engage): NO MATCH — signal_fresh failed (age=3). Rule 2 (IF no_signal → patrol): MATCH. Action: patrol." The player can trace the causal chain from relay death → signal loss → rule mismatch → wrong behavior.

---

## Player Journeys

### Journey: Sofia, 15, First-Time Strategy Player

**Context:** Mission 5, first factory mission. Sofia has completed Missions 1-4 (pre-placed units). She's comfortable with rules and hooks but has never built a relay network from scratch. Her architecture from last mission was a simple scout → striker direct hook.

**Minute 0:00 — The Factory Opens**
Sofia stares at the Plan screen. The workbench is on the right, the 8×8 board on the left. Her factory sits in the bottom-left corner. The mission briefing mentioned "relay chains" but she's not sure why she needs them — direct hooks worked fine in Mission 4.

She builds two blueprints: SCOUT-A (patrol, wide perception, hooks broadcasting on `threat`) and STRIKER-A (engage, listening on `threat`). She drags them into the production queue. The conveyor belt shows scout icon → striker icon.

She does NOT build a relay.

**Minute 1:30 — EXECUTE**
She hits EXECUTE. The sealed watch begins. Scouts spawn and fan out. Strikers follow, listening for signals. A scout spots an enemy — broadcasts on `threat` — but the signal takes 2 ticks to reach the striker directly (scout → striker = 2 hops via the channel, 1 tick per hop). The striker engages... but the enemy has already moved. By tick 15, her scouts and strikers are playing tag with enemies who are always one step ahead.

**Minute 3:00 — Debrief: The Latency Lesson**
In the Inspector, Sofia clicks on STRIKER-A at tick 12. The decision trace shows: "Rule 1: IF signal_on(threat) → engage_toward(signal_source). Signal source: tile E4. But enemy was at E4 at tick 10 — now at D3." She sees the latency: the signal took 2 ticks, and the enemy moved.

She scrolls the Codex. The `relay` entry says: "compress skill reduces signal size. filter skill removes noise. amplify skill extends broadcast range." She realizes: a relay with compress could reduce the data flowing through the channel, freeing striker context window space. But more importantly, she reads: "Relays process and retransmit signals in 1 tick."

Wait — scout → relay → striker is 3 hops (3 ticks), which is SLOWER than scout → striker (2 hops). Why use a relay?

She re-reads. The relay's `compress` skill reduces a 3-slot signal to 1 slot. Her striker's 8-slot buffer was filling up with raw scout data, causing context overload stuns. The relay isn't about speed — it's about *quality*. Compressed signals arrive later but don't overwhelm the striker's brain.

**Minute 5:00 — Second Attempt: The Star**
She builds RELAY-A with compress + filter. Places it center-board. Scouts broadcast to `raw`, relay listens on `raw` and rebroadcasts compressed data on `intel`, strikers listen on `intel`. Classic star topology.

She hits EXECUTE. This time the strikers act on cleaner data. By tick 20, two enemies are eliminated. But at tick 22, an enemy striker that slipped past the scout perimeter reaches tile D4 — where RELAY-A sits.

One hit. RELAY-A dies.

The board goes dark. Every signal line fades. Her strikers freeze mid-movement, reverting to `patrol`. Her scouts keep scouting but their broadcasts go nowhere — no relay to compress and forward them. Within 3 ticks, the enemy overruns her disoriented army.

**Minute 7:00 — Debrief: The SPOF Revelation**
Sofia clicks RELAY-A's death tick in the Inspector. She sees the cascade: downstream signal loss → rule mismatch → behavioral drift. The context window chart for STRIKER-A shows a cliff — from 6/8 filled to 1/8 in one tick. She traces back: "Why did the enemy reach RELAY-A?" Her perimeter had a gap on the south side. One scout was eliminated at tick 18, creating a 3-tile blind spot.

This is the SPOF lesson. She sees it in the signal genealogy: every signal chain on the board ran through one relay. One node. One death. Total network failure.

**Minute 8:30 — Third Attempt: Redundant Mesh**
Sofia builds RELAY-A and RELAY-B. Both listen on `raw`, both compress, both output on `intel`. She places RELAY-A at C4 and RELAY-B at F4 — opposite sides of the center. Now even if one dies, the other carries the network.

Cost: 10 minerals on relays instead of 5. She has to cut one striker to afford it. But when she hits EXECUTE, the network survives the enemy breach. RELAY-A dies at tick 24, but RELAY-B keeps processing. The signal lines from RELAY-A fade to grey — and the ones from RELAY-B brighten. The strikers hiccup for one tick (processing the loss of one signal source) and then re-engage on RELAY-B's data.

Victory at tick 35.

**What Sofia learned:** Centralization is efficient but fragile. Redundancy costs resources but survives failure. The first time a relay dies and the network holds, the game's thesis about resilient architecture becomes *felt*, not just understood.

---

### Journey: Marcus, 42, DevOps Engineer

**Context:** Mission 8, factory vs. factory. Marcus has been playing for 6 hours. He's a Kubernetes admin by day, and the relay SPOF problem is immediately recognizable to him — it's the same as running a database without replicas.

**Minute 0:00 — Architecture Phase**
Marcus opens the Plan screen. He's facing an enemy factory for the first time. The board shows his factory bottom-left, enemy factory top-right. Terrain: Manila cyberpunk — neon-lit urban tiles, some blocked by buildings.

He immediately thinks in terms of network topology. His current architecture from Mission 7:
- 3 scout blueprints (different patrol zones)
- 2 striker blueprints (one anti-infantry, one anti-relay — he's already hunting enemy relays)
- 2 relay blueprints (RELAY-PRIMARY and RELAY-BACKUP)
- 1 command agent (reroute + reassign)

But Mission 8 introduces *enemy relays*. The enemy has its own network. Marcus realizes: if the enemy has the same SPOF vulnerability, he should be targeting their relays. And they'll be targeting his.

**Minute 2:00 — The Relay Hunting Blueprint**
He creates STRIKER-HUNTER: rules prioritize engaging enemy relays over enemy strikers. Hook: `WHEN enemy_tagged(type=RELAY) → engage_toward(tagged_target)`. The scout's tag system marks enemy relays, and the hunter-killer heads straight for them.

But this means his own relays are exposed. He needs defense AND offense. The resource budget is tight.

**Minute 3:30 — The N+1 Strategy**
Marcus applies the principle he uses at work: N+1 redundancy. For every critical relay, deploy one backup. But on an 8×8 board with factory costs, he can't afford 4 relays (2 primary + 2 backup). He compromises: one primary relay in a defended position (behind striker, near factory), one mobile relay concept — wait, relays are stationary. He can't move them after deployment.

He rethinks. Instead of positional redundancy, he uses the **Command agent's reroute skill** as his backup strategy. If RELAY-PRIMARY dies, the Command agent reroutes traffic through RELAY-SECONDARY. It's not true N+1 — it's failover.

He configures Command: `WHEN unit_destroyed(type=RELAY) → reroute(all_channels, target=RELAY-SECONDARY)`.

**Minute 5:00 — EXECUTE**
Sealed watch begins. His scouts fan out, tagging enemies. Signal chains light up: scouts → RELAY-PRIMARY (compress) → `intel` channel → strikers. STRIKER-HUNTER receives tagged-relay coordinates and moves toward the enemy's relay cluster.

Tick 12: STRIKER-HUNTER reaches the enemy's central relay and destroys it. The enemy's signal lines go dark. Enemy units visibly lose coordination — one enemy striker freezes, another wanders off its patrol route. Marcus grins. He just did to them what they'll try to do to him.

Tick 18: An enemy striker approaches RELAY-PRIMARY from the northeast — a gap in Marcus's perimeter he didn't notice. The striker reaches RELAY-PRIMARY's tile. One hit. Dead.

Tick 19: The Command agent fires its reroute hook. The channel map animates — cyan dashed lines dissolving from RELAY-PRIMARY's position and re-drawing through RELAY-SECONDARY's position. For one tick, downstream units receive nothing.

Tick 20: Signals resume through RELAY-SECONDARY. But the latency has increased — RELAY-SECONDARY is farther from the scout cluster, adding 1 hop. The strikers' signal age goes from 2 ticks to 3 ticks. Their reactions are slightly delayed.

Tick 28: A second enemy striker targets RELAY-SECONDARY. Marcus's bodyguard striker engages — and wins. The network holds.

Victory at tick 40.

**Minute 8:00 — Inspector Deep Dive**
Marcus scrubs to tick 18 (RELAY-PRIMARY death). He clicks the Command agent at tick 19. The decision trace shows: "Hook fired: unit_destroyed(RELAY-PRIMARY). Action: reroute(all_channels → RELAY-SECONDARY). Channels affected: raw-intel, processed-intel. Units affected: STRIKER-A, STRIKER-B, STRIKER-HUNTER. Reroute latency: 1 tick." He nods. The failover worked exactly as designed.

He switches to the signal genealogy view. The signal chain shows a clean break at tick 18 and reconnection at tick 20. Two missing ticks of data on STRIKER-A's timeline. He zooms into those two ticks: STRIKER-A's context window dropped from 7/8 to 4/8 (stale entries decaying). Rule evaluation fell back to priority 3 (patrol). No combat action taken. Acceptable.

**What Marcus learned:** The game's relay mechanics map 1:1 to his professional experience. Failover works but has latency cost. The rerouting tick is the "failover switchover time" he optimizes at work. The real lesson: defense of infrastructure IS the game, not just combat.

---

### Journey: Kai, 11, Minecraft Player

**Context:** Mission 6, first mission with Command agent. Kai has been playing casually with his older sister helping. He built a working relay network in Mission 5 but doesn't fully understand why signals go through relays.

**Minute 0:00 — The Setup**
Kai opens the Plan screen. The Mission 6 briefing says: "The enemy has learned to target your signal infrastructure. Protect your network." He's not sure what "signal infrastructure" means but he sees a new unit type available: the Command agent. Its description says "reassign, reroute, prioritize."

He builds his usual setup: scouts, one relay, strikers. He adds a Command agent because it's new and he wants to try it. He doesn't configure the Command's hooks — he just gives it default rules.

**Minute 1:30 — EXECUTE**
The battle starts. Things go well for 15 ticks. Then an enemy scout appears near his relay. It's tagged by his scout. But no striker is nearby — they're all on the other side of the board chasing enemies.

Tick 18: An enemy striker appears behind the enemy scout. It reaches the relay.

Tick 19: Relay destroyed. Signal lines go dark. Kai watches his army stall. "Wait, why did they stop?" His strikers are standing still, context windows depleting.

Tick 22: His army is overrun.

**Minute 3:00 — Confusion and Retry**
Kai doesn't understand what happened. He goes to the Inspector but the signal genealogy is too complex. He clicks his favorite striker at tick 19. The decision trace says: "Rule 1: IF signal_on(intel) AND signal_fresh → engage. NO MATCH (no signal received)." He clicks the "no signal received" text. It highlights the dead relay on the board with a red X.

"Oh! The relay died and nobody could hear anything!"

**Minute 4:00 — The Bodyguard Solution**
Kai's solution is the simplest one: he puts a striker RIGHT NEXT to the relay. He configures one rule: "IF enemy nearby → fight." He doesn't think about redundancy or failover. He thinks about a guard dog.

He hits EXECUTE. The bodyguard striker stands watch. At tick 16, an enemy approaches. The bodyguard engages. It wins. The relay survives. The signal lines stay bright.

Victory at tick 32.

**Minute 6:00 — The Sister's Suggestion**
His sister, watching over his shoulder, says: "What if two enemies come?" Kai thinks. "I'll put TWO bodyguards!" His sister shakes her head. "That's a lot of strikers just for guarding. What if you put a second relay somewhere else? Like a backup?"

Kai builds a second relay. He places it near his factory. Now even if the first relay dies, the second one can carry some signals. He doesn't configure it perfectly — some channels are only on one relay — but the principle lands. The network has a backup.

**What Kai learned:** Relays are important and fragile. The simplest defense (bodyguard) works. The concept of redundancy is planted by his sister's suggestion — the game created the conversational opening for a more sophisticated strategy to be introduced socially, not mechanically.

---

### Journey: Dr. Amara, 41, Network Security Researcher

**Context:** Mission 9, late campaign. Dr. Amara studies distributed systems security. She's been playing for 12 hours and treats the game as a research toy. Her current architecture is highly optimized — a mesh topology with 3 relays, a Command agent, and carefully tuned EM signatures.

**Minute 0:00 — The Adversarial Mindset**
Mission 9 introduces enemies that specifically target relays based on EM emissions. Dr. Amara reads the boot log: "ADVISORY: Hostile units exhibiting directed signal-source targeting. Recommend emission-aware deployment."

She immediately thinks: "This is a directed attack on my infrastructure. The enemy is doing threat modeling against my network topology."

She pulls up her Plan screen and starts a new approach: **the decoy relay**.

**Minute 1:30 — Emission Shaping**
She builds three relay blueprints:
- RELAY-DECOY: amplify skill active, maximum EM signature, broadcasts on dummy channel `noise-floor`, positioned at board center (visible, exposed)
- RELAY-PRIMARY: filter + compress, minimal EM, broadcasts on `intel`, positioned behind scout perimeter
- RELAY-BACKUP: filter only, minimal EM, same channels as PRIMARY, positioned near factory

The Plan screen's EM overlay shows a bright hotspot on the decoy and faint signatures on the real relays. She's shaping the enemy's targeting heuristic.

**Minute 3:00 — EXECUTE**
Sealed watch. Her scouts establish a perimeter. The decoy relay sits center-board, pulsing with EM energy — the Inspector's EM overlay would show it as a beacon. Enemies converge on it.

Tick 14: Two enemy strikers reach the decoy. It dies instantly. The enemies pause — their target is eliminated but the player's army hasn't lost coordination. The real relay chain is untouched.

Tick 16: The enemies recalculate. One turns toward the nearest EM source — RELAY-PRIMARY, which is emitting at a much lower level. The filter skill keeps its EM footprint small. The enemy striker moves toward it slowly, uncertain.

Tick 20: Dr. Amara's STRIKER-HUNTER intercepts the enemy before it reaches RELAY-PRIMARY. Clean kill. Network intact.

Tick 30: Victory. Zero relay losses on the real network.

**Minute 5:00 — Inspector: EM Forensics**
Dr. Amara opens the Inspector's EM emission overlay. She scrubs through the timeline. The enemy's targeting decisions are visible: at tick 8, enemy scouts detected the decoy's high EM and flagged it. At tick 10, enemy strikers received targeting coordinates. At tick 14, engagement. Then at tick 15, confusion — the enemy's "target relay" rule matches on RELAY-PRIMARY but with lower confidence (weaker EM signal). The hesitation cost the enemy 4 ticks.

She measures: the decoy bought her 4 ticks of misdirection at a cost of 5 minerals. The real relays were never threatened. She notes this in her mental model as a "cost-per-tick-of-deception" metric.

**What Dr. Amara learned:** EM emissions are an attackable information surface. Emission shaping is a form of active defense. The game's relay mechanics directly model real-world concepts she studies — signal intelligence, emission control, and deception operations. She's already planning a research paper comparing Robot Uprising's EM mechanic to real SIGINT countermeasures.

---

## Interaction Effects with Other Design Categories

### × Building Blocks (Hooks & Rules)
The relay SPOF problem generates demand for specific hook/rule patterns:
- `WHEN unit_destroyed(type=RELAY)` becomes one of the most-used hook triggers in the game
- Rules like `IF signal_age > N → fallback_behavior` become essential for graceful degradation
- Channel redundancy (same data on two channels via two relays) creates a new rule pattern: `IF signal_on(intel-primary) → use_primary ELSE IF signal_on(intel-backup) → use_backup`

### × UI/UX (Inspector)
Network fragmentation is the Inspector's most dramatic teaching moment. The signal genealogy view needs to clearly show:
- The moment of relay death (red vertical line)
- Which downstream units lost signal (highlighted nodes going dark)
- How long until signal recovery (if redundancy exists)
- The cascade chain: relay death → signal loss → rule mismatch → behavior change

### × Onboarding (Campaign Progression)
The SPOF lesson should be **experienced before it's named**. Recommended mission placement:
- **Mission 5:** Player builds first relay network. No enemy relay-targeting behavior. The relay works fine. The player trusts it.
- **Mission 6:** Enemy introduces relay-targeting behavior. The player's trusted relay dies. The SPOF lesson hits hard because the player has *invested* in the relay.
- **Mission 7:** Command agent unlocked. Reroute skill provides the first systemic defense.
- **Mission 8+:** Player must design relay defense as a first-class concern.

### × Aesthetics (Audio & Visual)
The relay death sound must be the game's most distinctive audio event — a crackling descending hum that players learn to dread. The subsequent silence (where channel audio used to be) should be palpable. When signal chains reconstitute through a backup relay, the channel audio should return with a slightly different timbre — the network sounds *different* after healing, like a voice after illness.

### × Multiplayer (Competitive)
In PvP, relay-hunting becomes a core strategy. The meta divides into:
- **Relay hunters:** architectures optimized to find and destroy enemy relays
- **Relay defenders:** architectures with deep redundancy and decoy networks
- **Relay-light:** architectures that minimize relay dependency, using direct peer-to-peer hooks (higher latency, lower SPOF risk)
The PvP meta-game around relay offense/defense mirrors real-world network security: attackers vs. defenders, centralization vs. distribution.

### × Campaign (Mission Design)
Specific mission types that teach relay resilience:
- **The Siege:** Enemy waves specifically target relays. The player must defend infrastructure.
- **The Blackout:** Start with a working relay network that gets progressively destroyed. Survive with degrading communications.
- **The Rebuild:** Mid-mission relay destruction forces real-time rerouting via Command agent.
- **The Mirror:** Both player and enemy have relay networks. First to destroy the other's network wins.

---

## Comparable Games and Systems

### StarCraft II — Supply Depots and Chokepoints
Terran supply depots serve as raisable/lowerable walls at ramp chokepoints. The supply depot isn't a relay, but the defensive pattern is analogous: critical infrastructure (supply) placed at vulnerable positions (ramps), defended by adjacent units (marines behind depots). The key difference: StarCraft's supply depots are primarily spatial blockers, not information conduits. Robot Uprising's relays are information conduits that happen to be spatially positioned — the vulnerability is about information flow, not physical access.

### Factorio — Train Network Deadlocks
Factorio train networks exhibit SPOF behavior when a junction is blocked — all trains using that junction halt, cascading through the network. The community's response: redundant paths, bypass routes, and station-level buffering. Robot Uprising's relay mesh paradigm directly mirrors Factorio's "don't route everything through one junction" wisdom. The key insight from Factorio: players learn redundancy through painful deadlocks, not through tutorials. Robot Uprising should follow the same pattern.

### Company of Heroes — Territory Control Points
CoH's territory system creates supply lines that can be cut. When an enemy captures a node behind your front line, all downstream nodes are "cut off" — no longer generating resources. The feeling of watching your territory network fragment when a single node is captured is the closest existing analog to Robot Uprising's relay death cascade. The key transfer: CoH players learn to defend supply lines, not just front-line positions. Robot Uprising players must learn to defend relay positions, not just combat engagements.

### Real-World Distributed Systems — Circuit Breakers and Failover
The engineering patterns are directly transferable:
- **Circuit breaker pattern:** When a relay dies, downstream units should "open the circuit" — stop expecting signals and switch to degraded-mode behavior. This maps to rule fallbacks.
- **Active-passive failover:** RELAY-PRIMARY handles traffic; RELAY-BACKUP sits idle until PRIMARY fails. This maps to the Redundant Mesh paradigm.
- **Active-active load balancing:** Both relays handle traffic simultaneously. This maps to the Split Processing variant of the Redundant Mesh.
- **Health checks:** A hook that pings the relay every N ticks and triggers an alert if no response. This could be a player-configurable hook pattern.

---

## Sensory Description: The Moment of Network Death

The most important 3 seconds in the game happen when a critical relay dies without backup:

**Visual:** The relay sprite snaps from idle (glowing cyan core, slowly rotating antenna dish) to destroyed (chassis collapsed inward, sparks arcing from broken joints, the cyan core flickering amber → red → dark). Simultaneously, every signal line on the board that passes through this relay — those cyan dashed subway-map lines — flickers white for one frame (the last signal pulse) then fades to dark grey, dissolving from the relay outward like ink running off paper in the rain. Within 400ms, the board's signal layer goes from a web of bright connections to a scatter of disconnected fragments. Units downstream lose their context bar color — the tiny horizontal pips at the bottom of each tile shift from cool blue to dim grey as entries stop arriving.

**Audio:** A sharp electrical *crack* (the relay dying) followed by a descending synthesizer hum — the pitch drops over 800ms from high to subsonic, like a server room losing power. Then: silence. The channel audio that was playing (compressed pings, filtered whooshes, amplified hums) cuts to nothing. If the player was in a section of the board with 4-5 active channels, the silence is deafening. A low, ominous drone fades in — the ambience of a network with no traffic. Think of the sound an office makes when the internet goes down: the absence of the hum you didn't know you were hearing.

**Feel (Controller):** On DualSense, a sharp haptic pulse in the left grip (the destruction) followed by the adaptive trigger going slack — the L2 trigger, which had been providing subtle resistance proportional to network load, suddenly offers zero resistance. The network's weight disappears from the controller. On subsequent ticks, the right grip provides a faint irregular buzz — the "lost signal" static — for 3-5 ticks until the player's next action.

---

## New Aspects Discovered

1. **2.00f-i-a — Relay defense as resource allocation problem:** The explicit tradeoff between spending minerals on combat units vs. relay defense; the "defense budget" as a first-class mission constraint; how different mission economies push toward different defense paradigms.

2. **2.00f-i-b — Network fragmentation visualization in sealed watch:** Full specification of how signal chain dissolution animates during the sealed watch — per-line fade timing, downstream unit reaction animations, the "cascade darkness" visual language; how to make network death readable at 2× speed.

3. **2.00f-i-c — Relay-hunting AI behavior design:** How enemy AI decides to target relays — EM-based targeting, proximity targeting, random chance; mission-specific enemy relay-targeting profiles; the player's ability to read and predict enemy targeting behavior from the Inspector.

4. **2.00f-i-d — The "relay-light" architecture as competitive meta:** Architectures that minimize relay dependency by using direct peer-to-peer hooks; higher latency and EM cost but zero SPOF risk; when relay-light beats relay-heavy in competitive play; the Screeps "CPU-efficient" equivalent for Robot Uprising.

5. **2.00f-i-e — Graceful degradation rule patterns:** A catalog of rule configurations that maintain useful behavior when signals are lost — timeout fallbacks, dead-reckoning rules, "last known position" behaviors; the vocabulary of designing for failure as a transferable engineering skill.
