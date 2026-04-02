# 2.14d — Factory-Spawned Relay Positioning Problem

**Aspect:** 2.14d — Factory-spawned relay positioning problem: relays are stationary; the factory spawns units at the base; a replacement relay spawns at the base position, not the destroyed relay's position; pre-positioned backup relays vs. "deploy to position" mechanic for stationary units

**Category:** Core Mechanic (Wave 2)
**Dependencies:** 2.14 (Spatial Routing), 2.00f (No Global Coordinator), 2.14a (Dynamic Connectivity), 2.14b (Relay Chain Latency vs. Range), 3.10a (Hook Range as Spatial Mechanic), 2.17 (Fabrication as Tactical Resource), 1.04c (Spawn Semantics)

---

## The Fundamental Contradiction

Robot Uprising has a clean factory metaphor: every unit is produced at the base tile, one at a time, from a production queue the player designs before execution. Scouts spawn at the base and walk to their patrol routes. Strikers spawn at the base and march toward objectives. The factory is the origin point, the base is home, and every unit's life begins there.

Relays break this metaphor.

A relay is stationary. Speed: Static. It cannot move. It has no legs, no patrol path, no waypoints. It is infrastructure, not personnel. When the factory produces a relay, that relay appears at the base tile and stays at the base tile forever. But the base tile is the worst possible position for a relay. The whole point of a relay is to sit in the middle of the board, bridging the gap between scouts at the frontier and strikers in the field. A relay at the base serves nothing.

This is the factory-spawned relay positioning problem. The factory can only produce things at one location. Relays can only exist at one location. If those two locations are the same, the relay is useless. If they differ, the relay needs some mechanism to get from the factory to its operational position. But it cannot move.

The contradiction sharpens when a relay is destroyed mid-battle. The player's network fragments. The production queue advances. A replacement relay rolls off the factory line. It appears at the base. The network node it needs to replace is six tiles away, deep in contested territory. The replacement relay sits at base, perfectly functional, perfectly useless. The player watches through Sealed Watch, unable to intervene, as the replacement relay idles at base while their army goes blind.

This is not a bug. This is a design tension that demands a resolution mechanic. The question is which resolution preserves the most gameplay while introducing the least mechanical complexity.

---

## Four Resolution Mechanics

### Mechanic A: Rally Point Deployment

**How it works:** The factory gains a rally point system, borrowed directly from RTS tradition. During the Plan screen, the player assigns a deployment target to each unit in the production queue. For mobile units, this is a waypoint — the unit spawns at base and walks to the rally point. For relays (stationary units), the rally point is a deployment target — the relay spawns at base, then undergoes a multi-tick transit phase where it is carried or towed to the target position by an invisible logistics system.

During transit, the relay exists on the board as a "deploying" unit. It occupies a tile, moves one tile per tick along the shortest path, and is vulnerable to attack. It has no relay functionality during transit — no compress, no filter, no amplify. It is cargo, not infrastructure. When it reaches the rally point, it anchors: a one-tick deployment animation plays, and the relay becomes fully operational.

**The critical rule:** If the relay is destroyed during transit, the minerals are lost and the production slot is wasted. Transit is risk.

**Plan screen interaction:** The player drags a relay from the production queue to a tile on the board. A dotted path draws from the base to the target tile. A tooltip reads: "Transit: 5 ticks. Vulnerable during transit. No relay functionality until deployed." The player can see the path overlaid on the terrain and judge whether it passes through dangerous territory.

**What it preserves:** The factory-as-origin metaphor stays clean. Every unit begins at the base. The relay just has a longer journey to usefulness.

**What it sacrifices:** The relay's identity as purely stationary. During transit, the relay moves. This is a conceptual crack — if a relay can move during deployment, why can it never move again? The answer is mechanical (the logistics system that towed it is a one-time service, not an ongoing capability), but it requires explanation.

### Mechanic B: Pre-Positioned Dormant Relays

**How it works:** During the Plan screen, the player places relay positions directly on the board. Each placement consumes one relay from the production queue immediately — the relay is committed to that tile before execution begins. When execution starts, the pre-positioned relay is already on the board in a dormant state (holographic, translucent sprite). It activates when the factory's production queue reaches its slot.

The activation sequence: the factory "builds" the relay at the designated tick (consuming minerals and the queue slot), and the dormant hologram at the pre-assigned tile fills in with solid color. The relay was always there in the plan; the factory just needed time to fabricate it.

Backup relays work the same way. The player places a second relay at the same tile (or an adjacent tile) and assigns it a conditional activation: "Activate when RELAY-PRIMARY at this tile is destroyed." The backup sits dormant, invisible to enemies, until the trigger fires.

**The critical rule:** Dormant relays are committed resources. The minerals are spent when the production queue slot fires, whether the relay is needed or not. If the player pre-positions three backup relays and none are ever needed, that is 15 minerals of insurance premium that bought peace of mind but no combat power.

**What it preserves:** The relay's identity as purely stationary. A relay never moves. It was always at its position — it was just waiting to be fabricated.

**What it sacrifices:** The factory-as-physical-origin metaphor. The relay doesn't really "come from" the factory in any spatial sense. The factory is an abstraction that represents production time and resource cost, not a physical location. Some players will find this satisfying (the factory is a concept, not a building). Others will find it inconsistent (scouts walk from the factory but relays teleport to their positions).

### Mechanic C: Courier Units

**How it works:** A new unit type or skill — the courier — physically carries relay components from the factory to a designated position. The courier is a fast, fragile mobile unit (Speed: 2 tiles/tick, HP: 1) that picks up a relay blueprint at the base and delivers it to a target tile. Upon delivery, the courier "builds" the relay at the destination (a 2-tick construction animation) and then returns to base or is consumed.

The relay itself never moves. The courier moves. The relay appears at the destination fully formed, as if it were built on-site.

**The critical rule:** Couriers are targetable. An enemy striker can intercept a courier carrying relay components, destroying both the courier and the relay blueprint. The minerals for both are lost. Courier routes must be protected.

**Plan screen interaction:** The player configures a courier blueprint with a delivery target. The courier's path is drawn on the board. The player can see where the courier will be at each tick and judge the risk of interception.

**What it preserves:** Both the factory-as-origin metaphor and the relay-as-stationary identity. The factory produces things. The courier carries things. The relay stays put once built. Every concept is clean.

**What it sacrifices:** Simplicity. A new unit type adds to the vocabulary the player must learn. The courier is a logistics unit with no combat or information function — it exists solely to solve the relay positioning problem. If the game can avoid introducing a unit type that exists only to patch a design tension, it should.

### Mechanic D: Scaffold Markers

**How it works:** The player places scaffold markers on tiles during the Plan screen. Scaffolds cost 1 mineral each and are visible on the board as faint wireframe outlines. When the factory produces a relay and a scaffold exists at the relay's assigned tile, the relay is instantly placed at the scaffold position — zero transit time, zero vulnerability window. The scaffold is consumed.

If no scaffold exists at the assigned tile (because an enemy destroyed it during battle), the relay spawns at base with no target. It sits at base, stationary and functionless, until the player can do something about it in the next run.

**The critical rule:** Scaffolds are destructible. Any enemy unit that moves through a scaffold tile destroys the scaffold automatically. Scaffolds have no HP — they shatter on contact. This creates a pre-battle gambit: the player bets 1 mineral that a tile will remain uncontested long enough for a relay to claim it.

**What it preserves:** Speed and simplicity. The relay appears where needed, instantly. No transit, no couriers, no waiting.

**What it sacrifices:** Verisimilitude. A relay "teleporting" to a scaffold position is mechanically clean but narratively bizarre. Where did the relay come from? The factory is at the base. The scaffold is at D4. The relay appeared at D4 with no transit. The answer is "the scaffold pre-positioned the infrastructure for instant deployment," but this is a hand-wave that some players will accept and others will not.

---

## Player Journey A: The First Relay Replacement Failure (No Resolution Mechanic)

### Elena, 24, League of Legends player, Mission 5

Elena has just unlocked the factory. Missions 1-4 used pre-placed units. She understands relays — she built a nice star topology in Mission 4 with the pre-placed relay at center board. Now she needs to build one herself.

**Tick 0 — Plan screen.** Elena opens the production queue. She adds a relay blueprint. She sees it appear in the queue after her scout and striker. She does not assign it a position because the UI does not yet show her how (this is the problem the resolution mechanic solves). She assumes it will go where she needs it, like the pre-placed relay did in Mission 4.

**Tick 3 — Factory produces the relay.** The relay appears at the base tile. Elena watches. The relay sits there. It does not move. The base tile is in the bottom-left corner. Her scouts are fanning out toward the center and right side. The relay's 7-tile range covers some of the left quadrant, but her scouts are already out of range on their patrol paths.

**Tick 6 — Realization.** Elena's scouts are broadcasting on the `raw-intel` channel. The relay is listening. But the scouts are 8 tiles away. The signals never arrive. The relay sits at base, processing nothing, forwarding nothing. The signal chain visualization shows: scout (broadcasting) --x-- relay (listening, no input). The X marks the range break.

**Tick 12 — Confusion.** Elena's strikers are acting on stale data. Their context windows show "no new entries since tick 0." The entire right side of the board is information-dark. Elena watches her army stumble into an ambush they should have seen coming.

**Tick 20 — Mission failure.** In the debrief, Elena clicks the relay. Its decision trace reads: "Buffer: 0/12 entries. No signals received. All channels idle. RELAY at BASE (0,0). Nearest broadcasting unit: SCOUT-1 at (6,3), distance 9 tiles. SCOUT-1 range: 3 tiles. Signal cannot reach relay." 

Elena stares at the trace. The relay was alive and healthy for the entire battle. It just never received a single signal because it was at the wrong position and could not move.

**The lesson:** The factory produces at the base. Relays need to be elsewhere. Something must bridge that gap. This is the teaching moment that motivates whichever resolution mechanic the game provides.

---

## Player Journey B: Rally Point Deployment Under Fire

### Joaquin, 31, Factorio veteran, Mission 8

Joaquin has been using rally point deployment for three missions. He understands the transit risk. His standard approach: queue relays early in the production order so they begin transit before enemies are close, and route the transit path along the left edge of the board where his scouts provide early warning.

**Tick 0 — Plan screen.** Mission 8 is dense urban terrain with two enemy spawners at the top corners. Joaquin studies the board. He needs a relay at D4 (center) for his star topology. He drags the relay from the production queue to D4. The transit path draws: base (0,0) to D4, passing through tiles A1, B2, C3, D4. Five ticks of transit. The path skirts the left edge, away from the enemy spawner at the top-right.

He queues a second relay for F6 (east coverage). Transit path: base to F6, passing through D2, E4, F6. Six ticks. This path cuts across the center of the board — riskier.

**Tick 4 — Relay-1 in transit.** The deploying relay is at C3, one tile from its target. Its sprite is compact — antenna folded, no glow, a faint dotted path trailing behind it. Joaquin watches it inch forward. His scout on the left flank has cleared the area. No enemies nearby.

**Tick 5 — Relay-1 deploys.** The relay reaches D4. The deployment animation fires: legs unfold with a hydraulic hiss, the chassis rises, the antenna telescopes upward in three clicking segments. A pulse of cyan light radiates outward. Signal chains from the scout to the relay illuminate. The relay begins compressing and forwarding. Joaquin's network is live.

**Tick 8 — Relay-2 in transit, intercepted.** Relay-2 is at E4, two tiles from F6. An enemy striker rounds a building corner. The striker's perception range includes E4. The enemy AI evaluates: a defenseless unit moving slowly through open terrain. The striker attacks.

Joaquin watches, unable to intervene during Sealed Watch. The deploying relay has no combat capability. The enemy striker hits it once. The relay's transit sprite shatters — components scatter across the tile with a metallic crash. 5 minerals lost. The east side of the board has no relay coverage.

**Tick 9 — Adaptation.** Joaquin's production queue has a third relay queued (he learned to build spares). It rolls off the factory line at tick 12. He pre-assigned it to F6 as well. But now the enemy striker is patrolling the E4 corridor. The replacement relay's transit path goes through the same danger zone.

**Tick 15 — The replacement makes it.** Joaquin's scout spots the enemy striker and triggers a hook. A friendly striker repositions to intercept. The enemy striker is eliminated at tick 14. The replacement relay transits through E4 at tick 15, uncontested, and deploys at F6 at tick 17.

**Tick 17 — Network complete.** Both relays operational. East and center coverage live. Joaquin's army has full connectivity for the first time since tick 5.

**Debrief analysis:** Joaquin scrubs the timeline. The 9-tick gap in east coverage (tick 8 to 17) cost him: one striker acting on stale data engaged a phantom target and walked into an ambush. He could have avoided this by routing Relay-2's transit through the safer left edge (longer path, 8 ticks instead of 6, but avoids the contested corridor). He files the lesson: transit paths are as important as relay positions. Route through safe territory, even if it takes longer.

---

## Player Journey C: The Scaffold Gambit

### Yumi, 38, Into the Breach veteran, Mission 11

Yumi plays for efficiency. She hates redundancy — every mineral on a backup relay is a mineral not spent on a striker. She discovered scaffolding two missions ago and now uses it exclusively for relay deployment.

**Tick 0 — Plan screen.** Mission 11 is the caldera map. Impassable terrain in the center forces relay chains around the perimeter. Yumi places six scaffolds (the maximum): two on the north path, two on the east path, one on the west path, one near her base as an emergency fallback. Total cost: 6 minerals. She assigns four relays in her production queue to specific scaffolds. The remaining two scaffolds are unassigned insurance.

She studies the scaffold positions. The north scaffolds are at C2 and D2 — close to the enemy's north spawner. High risk. She assigns them to relays 3 and 4 (later in the queue, giving her scouts time to clear the area first).

The east scaffolds at F5 and G5 are safer — behind her scout's patrol line. She assigns relays 1 and 2 to those.

**Tick 3 — Relay-1 claims scaffold at F5.** The factory produces Relay-1. A scaffold exists at F5. Instant deployment. The wireframe at F5 fills: geometric segments snap into place with rapid zip-zip-zip sounds, the antenna clicks into its final position, and a pulse of cyan radiates outward. Network coverage for the east quadrant is live at tick 3, with zero transit vulnerability.

**Tick 5 — Relay-2 claims scaffold at G5.** Same instant deployment. East quadrant now has redundant coverage. Yumi's east strikers have two signal sources.

**Tick 9 — Scaffold destruction at C2.** An enemy scout, patrolling the north edge, passes through tile C2. The scaffold shatters on contact — a brief crackle of breaking wireframe, cyan fragments dissolving into the tile. The scaffold is gone. When Relay-3's queue slot fires at tick 11, there is no scaffold at C2. Relay-3 spawns at base, stationary, functionless.

**Tick 11 — The decision point.** Yumi has one unassigned scaffold at D2 (the second north scaffold) and one near her base. Relay-3 is stuck at base. But Relay-4 is next in the queue, assigned to D2. If D2's scaffold survives, Relay-4 deploys there. If not, Yumi loses north coverage entirely.

**Tick 14 — Relay-4 claims scaffold at D2.** The D2 scaffold survived. Relay-4 deploys instantly. North coverage is partial — one relay instead of two — but the signal chain to the north strikers is live. The north flank holds.

**Tick 22 — Yumi redirects the wasted relay.** Relay-3 sits at base. Its queue slot and 5 minerals are spent but it serves no purpose at base. However, Yumi's base-area scaffold is still intact. In her production queue planning, she had assigned "Relay-3 fallback: base scaffold" as a secondary assignment. The system checks: primary scaffold (C2) destroyed. Fallback scaffold (base area) available. Relay-3 claims the base scaffold and deploys near the factory.

This base relay serves a different purpose than originally intended — it compresses signals from a nearby scout that patrols the south edge, providing a defensive early-warning chain that Yumi did not originally plan for but which turns out to be useful.

**Debrief:** Yumi reviews her scaffold survival rates. Of 6 scaffolds placed, 5 survived to be claimed (83% survival rate). The C2 scaffold was destroyed by a predictable enemy patrol that she should have accounted for. Next run, she delays the C2 scaffold or places it one tile south, outside the enemy's patrol path.

---

## Player Journey D: Pre-Positioned Dormant Backups

### Kwame, 52, Chess player, Mission 9

Kwame approaches Robot Uprising like a chess problem. He spends 80% of his time in the Plan screen and 20% watching execution. He favors deterministic solutions — no transit risk, no scaffold gambling. He uses pre-positioned dormant relays because they guarantee the network reconstitutes instantly when a relay dies.

**Tick 0 — Plan screen.** Kwame places RELAY-PRIMARY at D4 with production slot 3. He places RELAY-BACKUP at D4 with production slot 7, conditional activation: "Activate when RELAY-PRIMARY is destroyed." On the board, two relay icons overlap at D4 — the primary is solid cyan, the backup is translucent cyan with a dashed border. A tooltip reads: "RELAY-BACKUP: Dormant. Activates on RELAY-PRIMARY destruction. Cost: 5m (deducted at tick 7)."

He places a second pair at F5: RELAY-PRIMARY-EAST (slot 4) and RELAY-BACKUP-EAST (slot 8). His production queue is relay-heavy: Scout, Striker, Relay, Relay, Striker, Striker, Relay-backup, Relay-backup. Eight queue slots, four of which are relays.

His combat force is thin: two strikers and one scout. But his network is armored. Every relay has a spare.

**Tick 18 — RELAY-PRIMARY destroyed.** An enemy specialist hacks a friendly scout, which walks into D4 and damages the relay. The primary relay crumbles. Signal chains go dark for half a tick.

Then the backup activates. The translucent hologram at D4 fills with solid color. The antenna telescopes up. The signal chains snap back to life. Context bars on downstream units flicker amber and return to green. Total downtime: 0.5 ticks — effectively invisible in the battle's rhythm.

**Tick 30 — Victory.** Kwame's thin combat force barely holds, losing one striker in the final push. But his network never went down. The chess player's lesson: sacrifice material for positional solidity. The backup relays were the positional anchor that held everything together.

**Debrief analysis:** Kwame checks his resource efficiency. He spent 20 minerals on relays (4 relays at 5m each). One backup activated. The other backup was never needed — 5 minerals of insurance that bought nothing tangible. Total "wasted" minerals on unused backup: 5m. But the 5m backup that DID activate saved the mission. Kwame considers this an acceptable insurance premium.

He compares to a hypothetical run without backups: 10 minerals saved, two more strikers, but a relay death at tick 18 would have caused a 6-10 tick network blackout. In those ticks, both strikers would have been acting blind. The math favors the backup.

---

## Strengths and Weaknesses

### Rally Point Deployment (Mechanic A)
**Strengths:** Preserves the factory-as-physical-origin metaphor. Creates interesting transit risk decisions. The vulnerability window during deployment generates dramatic moments — will the relay make it? Compatible with the game's existing movement system. Scales naturally: replacement relays use the same mechanic, with the same risk-reward calculation.

**Weaknesses:** Violates the relay's "stationary" identity during transit. Slow transit (5-6 ticks) means the network takes a long time to come online at battle start. Transit paths through contested territory are frustrating to watch during Sealed Watch. Adds pathfinding complexity for a unit type that was supposed to be simple.

### Pre-Positioned Dormant Relays (Mechanic B)
**Strengths:** Zero deployment time — the network is live as soon as the factory produces each relay. Zero vulnerability — no transit interception possible. Clean metaphor for chess-minded players who think in terms of prepared positions. The "dormant-to-active" bloom animation is emotionally satisfying. Backup activation is instant, maintaining network uptime.

**Weaknesses:** High mineral cost for redundancy. Inflexible — once committed to a position, the relay cannot adapt if the battlefield shifts. Does not teach the player about spatial logistics (transit routing), which is a missed learning opportunity. The "teleportation" to pre-assigned position is narratively unclear.

### Courier Units (Mechanic C)
**Strengths:** Cleanest conceptual model — factory produces, courier carries, relay stays put. Creates a new tactical layer around courier protection. The courier interception moment is highly legible and dramatic. Preserves both the factory metaphor and the relay's stationary identity.

**Weaknesses:** Introduces a new unit type that exists solely to solve one problem. Courier protection adds cognitive load. If the courier is too fragile (1 HP), losing it feels unfair. If the courier is too durable, it trivializes the positioning problem. The courier competes for production queue slots with combat units.

### Scaffold Markers (Mechanic D)
**Strengths:** Cheapest option (1 mineral per scaffold). Instant deployment when scaffold is available. Creates a pre-battle gambling element — will the scaffold survive? Scaffolds double as terrain manipulation (blocking enemy pathing). Minimal new mechanics — just a Plan screen placement tool.

**Weaknesses:** The instant teleportation to scaffold position lacks physical explanation. Scaffold destruction feels random and punishing when an enemy patrol happens to pass through. The 6-scaffold cap is an arbitrary limit that may frustrate advanced players. Creates a binary outcome — scaffold survives and relay deploys perfectly, or scaffold dies and relay is wasted at base.

---

## Interaction Effects

### With the Production Economy (2.17)

Every resolution mechanic creates a different pressure on the mineral budget. Rally point deployment costs only the relay itself (5m) but imposes a time cost. Pre-positioned dormant backups cost 5m per backup — doubling or tripling relay investment. Couriers cost their own production (3m each) plus the relay (5m). Scaffolds cost 1m each but risk total loss if destroyed.

The mineral pressure is the hidden mechanism that balances relay network resilience against combat power. A player who spends 25 minerals on a bomb-proof relay network has 15 minerals left for combat units. A player who spends 10 minerals on a minimal relay setup has 30 minerals for combat. The first player's army is weaker but coordinated. The second player's army is stronger but fragile. This is the central trade-off of the game's economy, and the relay positioning mechanic directly shapes it.

### With Replacement Timing (2.14c)

When a relay dies during Sealed Watch, the replacement timing differs drastically across mechanics. Rally point deployment: replacement arrives in 5-8 ticks (production time + transit). Pre-positioned dormant backup: replacement activates in 0.5 ticks (activation animation only). Courier delivery: replacement arrives in 4-6 ticks (production + courier transit). Scaffold: replacement is instant if scaffold survives, infinite if scaffold was destroyed.

The replacement timing determines how long the network is fragmented. A 0.5-tick gap is invisible. A 6-tick gap is catastrophic in a game where decisions happen every tick. The mechanic the player chooses directly determines their army's resilience to relay loss — and by extension, how aggressively they can play on other fronts.

### With Network Resilience (2.00f-i)

The relay positioning mechanic interacts with the six defensive paradigms from the SPOF analysis. Bodyguard strikers protect relays from destruction but do not help with positioning. Redundant mesh topology requires multiple relays at different positions, amplifying the positioning problem. The Command agent's reroute skill provides a software-level backup that is independent of physical positioning — but only if the Command agent itself survives.

The strongest combination is probably pre-positioned dormant backups (for guaranteed instant replacement) paired with a Command agent reroute (for flexible failover when backups are exhausted). This creates a two-layer defense: hardware redundancy plus software adaptation.

### With Campaign Progression (4.01)

The relay positioning problem should emerge gradually across the campaign:

- **Mission 5 (factory introduction):** The player experiences the positioning problem for the first time. No resolution mechanic is available yet. The mission is designed so that a base-positioned relay partially works (the board is small enough that the base relay covers some useful territory). The player notices the problem but does not yet feel its full weight.
- **Mission 6:** The board is larger. A base-positioned relay is useless. The resolution mechanic unlocks (whichever one the game chooses). The player uses it for the first time.
- **Mission 7:** The enemy begins targeting relays. The player must use the resolution mechanic for replacements, not just initial deployment. The replacement timing becomes critical.
- **Mission 8+:** Multiple relays required. The player must manage positioning for a network of 2-4 relays, each with backup plans.

---

## Comparable Games

### Tower Defense (Bloons TD, Kingdom Rush) — Building Placement

Tower defense games let the player place towers directly at any valid position, instantly. There is no factory, no transit, no deployment — click a tile, pay the cost, tower appears. This is the simplest possible resolution to the positioning problem: eliminate the factory-to-position gap entirely.

Robot Uprising cannot adopt this model without destroying the factory metaphor. The factory is not just a production mechanic — it is the game's thematic anchor. Units are manufactured, not summoned. The production queue creates timing decisions that tower defense skips. But the tower defense model shows what players expect: when I buy a defensive structure, it should appear where I need it.

The scaffold mechanic is the closest Robot Uprising gets to tower defense placement. The 1-mineral scaffold is the "placement fee" and the relay production is the "build cost." The scaffold provides instant deployment, mimicking the tower defense experience while preserving the factory timeline.

### Factorio — Ghost Entities and Construction Bots

Factorio's blueprint-ghost-bot pipeline is the industrial-engineering version of this problem. The player places a ghost (a planned structure). Construction bots pick up materials and build the structure at the ghost's position. The ghost is fragile (any entity can walk through it), the bots are vulnerable to enemy attack, and the build takes time. This is a hybrid of scaffolding (ghost placement) and courier delivery (bots carrying materials).

The key Factorio lesson: the gap between planning and realization is itself a game. The ghost sits there, taunting the player with what will be. The bots fly toward it, vulnerable. The structure assembles piece by piece. Every step can fail. And when it finally completes, the satisfaction is enormous because the player earned it through planning AND execution.

Robot Uprising should capture this feeling regardless of which mechanic it chooses. The relay should not just "appear." It should feel like it was built, deployed, or assembled through the player's foresight.

### StarCraft — Protoss Warp-In

The Protoss warp-in mechanic is the most relevant RTS comparison. A Warp Gate can warp units directly to any position within a Pylon's power field. The unit does not walk from the factory — it materializes at the destination. But the Pylon must be placed first (and can be destroyed), and the warp-in takes several seconds during which the unit is vulnerable.

This maps almost exactly to the scaffold mechanic: the scaffold is the Pylon (placed in advance, fragile, defines where deployment is possible), and the relay warp-in is the unit appearing at the scaffold's position. The Protoss warp-in is widely considered one of the most satisfying mechanics in RTS because it rewards map control (having Pylons in forward positions) with rapid reinforcement.

### XCOM — Evac Zone Placement

XCOM lets the player call in an evac zone at a specific position, then units must walk to it. This is the inverse of the relay problem — instead of getting a unit TO a position, the player gets units AWAY from a position. But the mechanic is structurally identical: a target is placed on the board, and units must reach it. The tension is the same: will the units make it before the situation collapses?

---

## Sensory Descriptions

### Rally Point Deployment — The March

The deploying relay appears at the base tile as a compact package: chassis folded, antenna retracted, mounted on a low sled that glides one tile per tick. The sled leaves faint track marks on the tiles it crosses — parallel cyan lines that fade after two ticks. The relay's sprite is dimmed, muted, clearly not yet operational. A quiet mechanical hum accompanies each tile of movement — the sound of heavy equipment being transported, industrial and patient.

When the relay reaches its target tile, the sled stops. A half-second pause. Then the deployment sequence: hydraulic pistons fire (a sharp PSHHH sound), lifting the chassis off the sled. The legs unfold outward, each one locking with a metallic CLICK. The antenna extends upward in three telescoping segments — each segment accompanied by a rising tone, like a tuning fork being struck at ascending pitches. The final segment locks with a resonant CLANG, and a circular pulse of cyan light sweeps outward from the base of the antenna, illuminating adjacent tiles for a brief moment. Signal chains from nearby units connect with soft pings, each connection producing a small cyan flash at both endpoints.

### Dormant Relay Activation — The Bloom

The dormant backup relay exists on the board as a ghost: translucent cyan wireframe, faintly pulsing at a slow rhythm like a heartbeat. The pulse is barely visible — players learn to look for it as a sign that backup infrastructure exists. The wireframe shows the relay's full deployed form but rendered in thin lines with visible gaps, like an architectural blueprint overlaid on the tile.

When the primary relay dies, there is a half-tick of silence. The signal chains dissolve. Context bars flicker amber.

Then the bloom. The dormant relay's wireframe brightens — the slow pulse accelerates to a rapid strobe for exactly three frames. The wireframe segments fill with solid material, starting from the base and rising upward. Each segment fills with a brief flash of white that cools to the relay's operational cyan. The antenna segments fill last, each one accompanied by a sharp ascending chime. When the final segment completes, the relay emits a full-power cyan pulse — brighter and wider than a normal deployment pulse, signaling to the player that this is a recovery event, not a first deployment.

The sound design distinguishes the bloom from a normal deployment. Normal deployment has a building-sequence sound (mechanical, constructive). The bloom has a rescue-sequence sound: a brief klaxon tone (attention!), followed by the rapid-fill mechanical sounds, followed by a relief tone — a sustained warm chord that resolves the tension of the klaxon. The player hears: alarm, construction, resolution. Crisis averted.

### Scaffold Claiming — The Snap

Scaffolds on the board are delicate: thin cyan wireframe bases, like a relay's footprint drawn in light. They emit no sound. They barely register visually unless the player is looking for them.

When a relay claims a scaffold, the transformation is instantaneous and percussive. The wireframe does not gradually fill — it SNAPS. In a single frame, the scaffold wireframe is replaced by the full relay sprite, fully deployed. The visual transition is accompanied by a sharp metallic SNAP sound, like a powerful magnet locking into place. A single frame of white flash on the tile. Then the relay is simply there, antenna already extended, signal chains already connecting.

The snap deployment is designed to feel like a magic trick. The scaffold was a promise. The snap is the promise fulfilled. The speed is the payoff for the planning: the player placed the scaffold, protected it, timed the production queue to deliver a relay when the scaffold was ready. The instant deployment is the reward.

When a scaffold is destroyed by an enemy passing through it, the sound is the opposite of the snap: a fragile TINKLE, like thin glass breaking. The wireframe shatters into small fragments that dissolve before they hit the ground. The destruction is quiet, almost gentle, contrasting with the relay's dramatic death animation. A scaffold dying is a plan failing, not a unit falling.

---

## Discovered New Aspects

- **2.14d-a — Transit path planning as spatial puzzle:** If rally point deployment is chosen, the transit path from base to target becomes a planning challenge — shortest path vs. safest path, avoiding enemy patrol routes, timing transit to coincide with friendly scout coverage of the corridor.

- **2.14d-b — Scaffold economy as meta-game:** With a 6-scaffold cap and 1m cost, scaffold placement becomes its own optimization problem — forward scaffolds for aggressive relay networks vs. rear scaffolds for safe deployment; scaffold placement patterns that emerge in competitive play.

- **2.14d-c — Dormant relay visibility to enemies:** Can enemies see dormant backup relays? If yes, enemies can target backup positions before activation. If no, the backup is a hidden strategic reserve. This interacts with EM emission mechanics — a dormant relay might emit a faint signature that advanced enemies can detect.

- **2.14d-d — Mixed deployment mechanics across unit types:** If relays use scaffolds but scouts use rally points, does the player need to learn two different deployment systems? The consistency cost of having different deployment mechanics for different unit types vs. the thematic benefit of each unit type having a deployment that matches its identity.
