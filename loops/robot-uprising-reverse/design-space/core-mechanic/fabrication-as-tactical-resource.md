# Fabrication as Tactical Resource

**Aspect:** 2.17 — Fabrication as tactical resource: spawn cost as a per-mission resource that creates trade-offs between pre-placed agents and dynamic spawning; fabrication point allocation as a pre-mission decision; how the resource cap interacts with spawn storm failure mode
**Wave:** 2 (Core Mechanic Variations)

---

## The Design Question

The locked production system gives every unit a mineral cost (Scout 3m, Relay 5m, Specialist 7m, Striker 8m, Command 10m) and a passive per-tick income from tagged map nodes. But what happens when you layer a **hard fabrication cap** on top of the economy? Not "can you afford it?" but "do you have fabrication points left to spend at all?" The mineral economy answers "how much?" The fabrication budget answers "how many total units will ever exist in this battle?"

This creates a fundamentally different decision landscape. Without a fabrication cap, the optimal strategy trends toward "produce as many units as income allows." With one, every unit becomes a non-renewable investment. The scout you build in tick 5 is a fabrication point you can never spend on a striker in tick 40. The relay you place defensively is capacity you can't use offensively. The resource transforms production from a throughput problem into an allocation problem — and allocation problems are where the deepest strategy lives.

The design space here maps directly to real engineering resource management: cloud compute budgets, Kubernetes pod limits, API rate caps. You don't just ask "can I spin up another container?" — you ask "should I, given my total allocation?" The game's 1:1 vocabulary claim extends naturally: fabrication points ARE your pod quota.

---

## The Mechanic: "The Forge Budget"

### Core Rules

**Fabrication Points (FP)** are a per-mission resource, visible in the Plan screen as a row of hexagonal token slots along the top of the production queue conveyor belt. Each mission grants a fixed FP budget (e.g., Mission 5: 8 FP, Mission 10: 20 FP). Every unit produced by the factory consumes FP equal to its **Forge Cost** — a new stat distinct from mineral cost:

| Unit | Mineral Cost | Forge Cost (FP) | Energy/tick |
|------|-------------|-----------------|-------------|
| Scout | 3m | 1 FP | 1e/tick |
| Relay | 5m | 1 FP | 2e/tick |
| Specialist | 7m | 2 FP | 2e/tick |
| Striker | 8m | 2 FP | 3e/tick |
| Command | 10m | 3 FP | 4e/tick |

When FP reaches zero, the factory goes dark. The conveyor belt freezes. A heavy metallic **clunk** sounds. The factory sprite dims from warm amber to cold grey. No more units will ever be produced this battle, regardless of mineral reserves. The player watches the rest of the match with exactly the army they've built — no reinforcements, no replacements, no recovery from losses.

### Why Two Currencies?

Minerals gate **when** you can build (income accumulation over time). Fabrication points gate **whether** you can build (lifetime unit cap). The interaction creates four quadrants:

| | Low Minerals | High Minerals |
|---|---|---|
| **High FP** | Classic economy game — earn faster, build more | Unconstrained — spam freely (tutorial missions) |
| **Low FP** | Desperate — can't afford what you're allowed to build | **The Sweet Spot** — you CAN afford another striker but should you SPEND the FP? |

The sweet spot is bottom-right: the player has minerals but limited FP. This is where every production decision becomes agonizing. "I have 12 minerals and 3 FP left. A striker costs 8m/2FP. A scout costs 3m/1FP. If I build the striker, I can only build one more scout ever. If I build two scouts, I still have 1 FP for... what? A relay? Save it for replacement if something dies?"

### Pre-Mission Allocation: "The Forge Ledger"

Before hitting EXECUTE, the Plan screen shows a new panel: **The Forge Ledger**. A vertical column of hexagonal FP tokens, each one draggable into one of three lanes:

- **Pre-Placed Lane** (gold border): FP committed to units placed before battle starts. These units appear on the board at tick 0. The player drags blueprints from the production queue directly onto the board preview, each snap consuming FP from the ledger. Pre-placed units skip factory build time entirely — they're already deployed.
- **Factory Lane** (blue border): FP reserved for the factory's production queue. These points fuel runtime spawning. The conveyor belt's length visually corresponds to remaining factory FP.
- **Reserve Lane** (silver border, dashed outline): FP held back, uncommitted. These can be allocated to either lane mid-battle via a Command agent's `fabricate` skill — but only if a Command agent is alive and has the skill equipped. Without a Command agent, reserve FP is wasted.

The three-lane split creates the mission's strategic identity before a single tick fires. A player who puts 6/8 FP into pre-placed units is betting on their initial configuration. A player who puts 2/8 into pre-placed and 6/8 into factory is betting on adaptive production. A player who reserves 3/8 is betting on their Command agent surviving long enough to reallocate.

### Interaction with Spawn Storm Failure Mode

The spawn storm — agents spawning agents in runaway cascading loops — is identified in the spawn semantics analysis (1.04c) as a designed failure mode that teaches resource discipline. Fabrication points transform the spawn storm from "your army gets too big and clogs the board" to "your army eats all your FP in 8 ticks and then you have NOTHING left."

This is a harder, more instructive lesson. Without FP, a spawn storm just creates chaos. With FP, a spawn storm creates chaos AND permanently cripples your production capacity. The player watches their Forge Ledger drain to zero in seconds, the factory goes dark, and every subsequent unit loss is irreplaceable. The spawn storm becomes Robot Uprising's equivalent of spending your entire salary on day one of the month.

**The Anti-Windup Connection:** The reinforcement thermostat / PID control analysis (3.19a-i) maps directly. FP is the integral term's saturation limit. A Command agent monitoring `forge_remaining()` and throttling production is implementing anti-windup. The `queue_count` primitive from 3.19a-i-a extends naturally to `forge_remaining()` as a system-level oracle condition. A rule like "IF forge_remaining < 3 AND queue_count(striker) > 0 THEN cancel_queue(striker)" is a textbook anti-windup clamp.

---

## Six Design Variations

### Variation A: "The Hard Cap" (Fixed Budget, No Recharge)

FP is granted at mission start. Never regenerates. Every unit is a permanent deduction. The factory goes dark when FP hits zero. Period.

**Strengths:** Maximum decision weight per unit. Every spawn is consequential. Clean mental model.
**Weaknesses:** Late-game can feel hopeless if early mistakes consumed FP. No recovery path from spawn storms.

### Variation B: "The Slow Forge" (Regenerating FP)

FP regenerates at a slow rate (1 FP per 10 ticks). The cap still exists — maximum FP is fixed — but patience rewards. Building slowly is cheaper than building fast.

**Strengths:** Recovery from early mistakes. Rewards patient play. Creates pacing rhythm.
**Weaknesses:** Dilutes the allocation decision. Optimal play may be "wait and build one unit at a time" which is boring.

### Variation C: "The Salvage Economy" (FP Recovery from Destroyed Units)

When a player unit is destroyed, 50% of its Forge Cost (rounded down) returns to the Factory Lane. Scout destruction returns 0 FP (rounds down from 0.5). Striker destruction returns 1 FP. Command destruction returns 1 FP. Units are partially recyclable.

**Strengths:** Softens the permanence of losses. Creates "sacrifice play" strategies — intentionally sending a cheap scout to die doesn't waste FP. Mirrors real-world asset depreciation.
**Weaknesses:** Incentivizes building disposable scouts. The rounding makes math non-obvious. "Suicide rush" strategies where you throw scouts to recycle their... wait, scouts return 0. Hmm — the rounding actually prevents this. Interesting emergent constraint.

### Variation D: "The Forge Bid" (Auction-Style Allocation)

Both player and enemy AI receive FP from a shared pool. Each mission has a total FP supply (e.g., 16 FP). During a pre-mission "Forge Bid" phase, the player allocates 1-N FP per production category (scouts, relays, strikers, etc.), and the enemy AI does the same simultaneously. If total bids exceed pool, proportional reduction. A player who bids heavily on strikers may find their allocation cut because the enemy also bid on strikers.

**Strengths:** Creates pre-mission mindgames. Forces reading the enemy's likely strategy. Introduces drafting tension.
**Weaknesses:** Extremely complex for a game that's already teaching context windows and hooks. The auction mechanic pulls focus from the core attention-architecture design. May feel like a different game glued onto Robot Uprising.

### Variation E: "The Tiered Forge" (FP Cost Scales with Unit Count)

First scout costs 1 FP. Second scout costs 2 FP. Third costs 3 FP. Triangular scaling per unit type. This creates natural force composition diversity — you can't spam one type without exponentially increasing FP cost.

**Strengths:** Elegantly enforces diverse armies. Self-balancing. Rewards breadth of design.
**Weaknesses:** Math gets complex. Players must track per-type counts. Punishes players who genuinely need three scouts for a wide-area reconnaissance architecture. The mechanic fights against legitimate tactical decisions.

### Variation F: "The Mission Forge" (RECOMMENDED — FP as Mission Design Lever)

FP budget is a per-mission design parameter that the level designer uses to create specific tactical puzzles. Some missions are FP-rich (20+ FP, emphasizing production flow and factory optimization). Some are FP-starved (4-6 FP, emphasizing pre-placement and configuration quality over quantity). The budget IS the mission's personality.

**Teaching arc:**
- **Mission 5** (factory introduction): 12 FP, generous. Learn the factory. Make mistakes. Rebuild.
- **Mission 6**: 8 FP. Tighter. Start thinking about allocation.
- **Mission 7**: 6 FP. Every unit matters. Pre-placement becomes critical.
- **Mission 8**: 10 FP + Reserve lane introduced. Command agent can reallocate reserves.
- **Mission 9**: 15 FP but enemy has spawner flooding. Discipline not to match their pace.
- **Mission 10**: 20 FP. Full expression. The constraint is no longer FP — it's your architecture quality.

**Strengths:** Maximum designer control. Each mission feels different. FP budget communicates mission intent before the player reads anything else. A 6 FP mission screams "quality over quantity" the moment the Forge Ledger appears.
**Weaknesses:** Removes player agency over force size. Some players want to solve every mission with overwhelming numbers — the FP cap says no. This is a feature, not a bug, but it will frustrate certain archetypes.

---

## Player Journeys

### Journey: Reyna, 27, DevOps Engineer, Kubernetes daily, first strategy game

**Context:** Mission 6 — "The Narrow Pass" (Palawan jungle). Reyna breezed through Mission 5 with surplus minerals and a sprawling scout network. Mission 6 drops her FP budget from 12 to 8. She has unlocked: Scout, Relay, Striker, Specialist. No Command agent yet.

**Minute 0:00 — The Forge Ledger Appears**
The Plan screen loads. The board preview shows a narrow jungle corridor — dense canopy tiles on either side, a single clear path winding from her factory (bottom-left, bamboo-wrapped data rack nestled into limestone cliff) to the enemy spawner (top-right, red-lit drone hive in volcanic cave). Along the top of the production queue conveyor belt, eight hexagonal tokens glow warm amber, each stamped with a tiny anvil icon. A tooltip on hover reads: "Forge Budget: 8. Every unit produced costs Forge Points. When empty, no more units can be built this battle."

Reyna's eyes flick between the board (tight, dangerous) and the tokens (only eight). She's used to Mission 5's abundance. Eight feels claustrophobic.

**Minute 0:45 — Pre-Placement Temptation**
She drags a Scout blueprint onto the board preview. It snaps to a tile near the corridor entrance. One amber hex in the Pre-Placed Lane fills and dims — 7 remaining. She drags a Striker behind the scout. Two more hexes dim — 5 remaining (Striker costs 2 FP). She reaches for a Relay and pauses. Placing it would cost 1 FP, leaving 4 for the factory. Four FP means... two more scouts? One more striker? She pulls her hand back from the mouse.

The Forge Ledger's three-lane layout stares at her. Pre-Placed: 3 FP committed (1 scout + 1 striker). Factory: 5 FP available. Reserve: 0 (greyed out — no Command agent unlocked yet). She thinks: "This is like my pod quota at work. I've got 8 pods total for this namespace. Do I pre-deploy or leave room for autoscaling?"

**Minute 1:30 — The Conveyor Decision**
She moves to the production queue conveyor belt. She queues: Scout (1 FP), Scout (1 FP), Relay (1 FP), Striker (2 FP). Total factory allocation: 5 FP. That's her entire remaining budget. The conveyor belt shows four blueprint icons sliding left-to-right, each with a small amber hex badge showing its Forge Cost. Below the belt, a summary: "Factory FP: 5/5 allocated. Remaining after queue: 0."

Zero remaining. She stares at that number. Zero means the factory goes dark after building these four units. Her total army will be: 2 scouts, 1 relay, 2 strikers, 1 specialist (wait — she didn't queue a specialist). She reconsiders. Removes one scout from the queue (1 FP freed). Queues a Specialist instead (2 FP). But that's 6 FP for the factory — she only has 5. The conveyor flashes red. A soft warning tone sounds — two descending notes, like a cash register rejecting a card. She removes the second striker. Now: Scout (1), Relay (1), Specialist (2) = 4 FP. One FP unallocated in the Factory Lane.

"I'll save it," she mutters. One FP means one emergency scout if something dies. The Forge Ledger shows: Pre-Placed 3, Factory 4 committed + 1 unallocated, Reserve 0. She hits EXECUTE.

**Minute 3:00 — The Factory Goes Dark**
Sealed watch. Tick 1: her pre-placed scout and striker appear on the board. The factory's amber conveyor light pulses — it's building her first queued scout. By tick 8, the scout pops out. Tick 14, the relay. Tick 22, the specialist. Her factory FP reads 1 — one emergency point remaining. The conveyor belt still glows, dim but alive.

Tick 31: an enemy striker flanks through a canopy gap she didn't expect. Her front scout dies — the tile flashes crimson, the unit crumbles into sparking debris reclaimed by jungle vines. She winces. In Mission 5, she'd queue a replacement immediately. Here, she has 1 FP. She mentally weighs: "Replace the scout, or save it for something else?" The factory's single remaining amber hex pulses like a heartbeat.

Tick 38: she watches her surviving scout spot a second enemy flanker. The relay compresses and forwards. Her striker intercepts — one-shot elimination, the striker's blade arcs through the grid square with a sharp red flash. But her other striker is out of position, guarding a corridor that's empty. She thinks: "If I'd known, I'd have pre-placed differently. But I can't move the pre-placed units now, and I can't build more."

Tick 45: her last FP becomes critical. She needs a replacement scout for recon, but she also needs the striker alive. She queues a scout. The final amber hex dims. The factory produces it — tick 50, a fresh scout emerges. And then: the factory light dies. A heavy, resonant **clunk** echoes — like a blast furnace door slamming shut. The factory sprite shifts from warm amber glow to cold gunmetal grey. The conveyor belt stops. A small text overlay appears on the factory: "FORGE DEPLETED."

For the remaining 20 ticks, Reyna watches with a new kind of tension. Every unit on the board is irreplaceable. When her relay takes a hit from an enemy specialist's hack, she holds her breath. The relay survives (hack doesn't kill, it corrupts context) but she realizes: if it had died, that's a permanent gap in her communication chain. No replacement possible.

**Minute 5:30 — Victory, Barely**
Her surviving striker reaches the enemy spawner. One-shot elimination. Mission complete. The victory screen shows her Forge efficiency: "8/8 FP used. 1 unit lost. 6 surviving." She sees the number and thinks: "Next time, I'd put 2 FP in reserve and use 6 more carefully. Or maybe pre-place the relay and factory-build the strikers."

**UI Annotations:**
- **Forge Ledger**: Vertical column, right edge of Plan screen below conveyor belt. Three horizontal lanes with dashed borders. Amber hexagonal tokens. Drag tokens between lanes. Count displays update in real-time.
- **Conveyor FP badges**: Small amber hex overlaid on each blueprint icon in the production queue. Running total displayed below belt.
- **Factory depletion**: Sprite color shift (amber→grey), clunk audio, "FORGE DEPLETED" overlay text, conveyor belt stop animation (belt texture freezes, small dust particles settle).
- **Forge Budget header**: "FP: 3/8" counter in top-right corner during Sealed Watch, ticking down with each production.

---

### Journey: Datu, 38, Competitive Gamer, Diamond in StarCraft 2, Factorio megabase veteran

**Context:** Mission 9 — "The Flood" (Mindanao jungle). Datu has mastered Missions 5-8. He's seen the Forge Ledger, understands Reserve allocation, has a Command agent with `fabricate` skill. Mission 9 gives 15 FP but the enemy has a high-frequency spawner producing cheap units every 3 ticks. The mission brief reads: "The enemy manufactures faster than you. You cannot outproduce them. Outthink them."

**Minute 0:00 — Reading the Budget**
Fifteen FP. Datu's eyes narrow. The enemy spawner preview shows rapid-fire production icons. He counts the enemy's likely output: at 1 unit per 3 ticks over a 60-tick battle, that's 20 enemy units. His 15 FP can produce maybe 8-10 friendly units depending on composition. He's outnumbered before the battle starts.

He opens the Forge Ledger. Three lanes. He immediately drags 4 FP into Reserve. His Command agent has `fabricate` — the skill that converts Reserve FP into Factory FP mid-battle based on rules. He configures a Command rule: "IF forge_remaining(factory) < 2 AND unit_count(striker) < 3 THEN fabricate(striker)." This is his anti-windup clamp — the Command agent will only authorize striker production when factory FP is low AND strikers are understrength.

Pre-Placed Lane: 3 FP (1 Command, positioned at base). Factory Lane: 8 FP. Reserve Lane: 4 FP.

**Minute 1:00 — The Anti-Flood Architecture**
Datu's strategy: don't match the enemy's numbers. Use relays and hooks to create a detection-and-elimination pipeline. Enemy floods with cheap scouts? His relays compress and forward threat data. His strikers intercept at chokepoints. He queues: Relay (1 FP), Relay (1 FP), Striker (2 FP), Striker (2 FP), Scout (1 FP). That's 7 of his 8 Factory FP. One spare.

He configures the Command agent's second rule: "IF unit_destroyed_within(relay, 5) > 0 AND forge_remaining(reserve) > 0 THEN fabricate(relay)." If a relay dies, the Command agent dips into reserves to replace it. The communication backbone is prioritized over offensive units.

The Forge Ledger now shows: Pre-Placed 3 (Command), Factory 7 queued + 1 spare, Reserve 4. He studies it like a balance sheet. "My burn rate is 7 FP over roughly 30 ticks of production. If I lose units, the Command pulls from reserves. If the Command dies..." He pauses. If the Command dies, those 4 Reserve FP are stranded. Permanently inaccessible. That's a 27% waste of his total budget.

He adds a third pre-placed unit: a Relay, positioned adjacent to the Command agent. 1 FP from Pre-Placed Lane. Now: Pre-Placed 4 (Command 3 + Relay 1), Factory 7 queued + 1 spare, Reserve 4... wait, that's 4+8 = 12. He has 15 total. He recalculates: Pre-Placed 4, Factory 7+1 = 8, Reserve 3. One FP unaccounted for. He drags it to Reserve. Pre-Placed 4, Factory 8, Reserve 3. Total: 15. Good.

**Minute 2:30 — EXECUTE**
He hits EXECUTE. The adaptive trigger resistance on his DualSense is heavy — Mission 9 stakes. The conveyor spins up.

Sealed watch. The enemy flood begins immediately. Tick 3: first enemy scout appears. Tick 6: second. Tick 9: third. By tick 15, five enemy units are on the board. Datu's factory has produced his first relay (tick 8) and is building the second (tick 14). His pre-placed relay is already forwarding the Command agent's threat assessments.

Tick 18: the enemy flood reaches his first chokepoint. His newly-produced striker intercepts — red flash, one-shot kill. But another enemy is right behind. And another. The Forge Budget counter in the top-right reads "FP: 8/15" — he's spent 7 on pre-placed and produced units.

Tick 25: his forward scout dies to an enemy striker that emerged from the canopy. The Command agent processes the loss. Its rule evaluates: `unit_destroyed_within(relay, 5)` — no, it was a scout, not a relay. The rule doesn't fire. The Command's other rule: `forge_remaining(factory) < 2 AND unit_count(striker) < 3`. Factory FP is 3 (he's built 5 units from 8 factory FP). Strikers alive: 2. The condition doesn't match (factory FP is not < 2).

Datu watches his Command agent make the RIGHT decision — don't panic-produce. The scout loss is acceptable. The relay backbone is intact. The strikers are alive. Hold reserves.

Tick 34: disaster. An enemy specialist hacks his forward relay. The relay's context fills with corrupted data. It starts forwarding garbage. His striker, receiving garbled threat data, moves to the wrong tile. An enemy striker appears behind it. One-shot kill. Now: 1 striker alive. The Command evaluates: `unit_count(striker) < 3` — yes (1 < 3). `forge_remaining(factory)` — 3 FP. That's not < 2. Still doesn't fire. But Datu sees the danger — one more striker loss and he's defenseless.

Tick 37: the remaining striker kills two enemies in consecutive ticks (the chokepoint funnels them). But a third enemy flanks wide. The striker can't cover both paths.

Tick 40: the Command's `fabricate` rule finally fires — factory FP drops to 1 after producing a relay replacement (triggered by the relay's effective death-by-corruption, which Datu's hook detected and reported). The Command pulls 2 FP from Reserve to queue a striker. Reserve drops from 3 to 1. The Forge Budget counter: "FP: 13/15." Two points left in existence.

Tick 48: the fresh striker emerges from the factory. The relay backbone is restored (the corrupted relay was replaced). The fresh striker moves to cover the flank. Datu's architecture — designed for resilience, not numbers — holds against the flood.

**Minute 5:00 — The Forge Runs Dry**
Tick 55: FP hits 15/15. Everything spent. The factory goes dark with that resonant clunk. Datu has 5 units alive against the enemy's still-active spawner. But his architecture is self-sustaining — the communication pipeline identifies, prioritizes, and intercepts. The last 10 ticks play out like clockwork. His striker eliminates the final enemy wave. The spawner, exposed, falls to a breaching specialist.

Inspector debrief: "Forge Efficiency: 15/15 FP used. Peak army size: 7. Units lost: 3. Units replaced: 2. Reserve FP accessed by Command: 2. Unused Reserve FP at victory: 1." That unused 1 FP bothers him. He could have been more efficient. He opens the Inspector's Forge Timeline — a sparkline showing FP spend over ticks, with vertical markers for each production event and horizontal bars for reserve access.

**UI Annotations:**
- **Command `fabricate` skill**: In the workbench, displayed as a golden anvil icon in the Command's skill slot. Configuration panel shows Reserve access rules with condition→action pairs. During Sealed Watch, fabricate events show as a golden pulse from Command to factory.
- **Forge Timeline** (Inspector): Horizontal sparkline at bottom of Inspector sidebar. X-axis = ticks. Y-axis = FP remaining. Step-function line drops at each production event. Reserve access events shown as silver arrows flowing into the main line. Hover any point to see unit produced and remaining budget.
- **Reserve access animation**: During Sealed Watch, when Command triggers fabricate, a silver hex token visually floats from the Command unit's tile to the factory, dissolving into the conveyor belt. The factory briefly flashes back to amber before dimming again if no more FP remains.

---

### Journey: Sofia, 15, High School Student, Plays Mobile Legends, First PC Strategy Game

**Context:** Mission 5 — "The Factory" (Cebu urban). Sofia has completed Missions 1-4 with pre-placed units. This is her first encounter with the factory AND the Forge Budget. The mission grants 12 FP — generous, designed to teach without punishing.

**Minute 0:00 — Everything Is New**
The Plan screen changes. The production queue conveyor belt appears for the first time — a horizontal strip at the bottom of the workbench, textured like brushed metal with tiny LED indicators. Sofia has seen blueprint editing but never the conveyor. A boot log message types across the top of the screen in teal monospace:

```
SUBSYSTEM ONLINE: FABRICATION MODULE
> Manufacturing capacity detected.
> Forge budget allocated: 12 units of fabrication potential.
> Advisory: each unit produced consumes forge points.
> When forge points are depleted, manufacturing ceases permanently.
> Pre-placement available: commit units before battle.
> Recommendation: allocate deliberately. This resource does not regenerate.
```

The twelve amber hexagons appear along the top of the conveyor belt, materializing one by one with soft ascending chimes — **ping, ping, ping** — each slightly higher in pitch than the last. Sofia counts them. Twelve. The boot log's emphasis on "permanently" and "does not regenerate" registers. She's played enough gacha games to understand limited resources.

**Minute 0:30 — The Pre-Placement Discovery**
She drags a Scout blueprint toward the board preview (left side of screen). The board highlights valid spawn tiles in soft gold. She drops the scout on a tile near the factory. A hex dims in the Forge Ledger. The counter reads "11/12." She tries dragging another scout. "10/12." Another. "9/12."

Three scouts pre-placed. She looks at the remaining nine hexes and the empty conveyor belt. The tutorial whisper bar (thin text at bottom of screen) says: "Drag blueprints to the conveyor to queue factory production." She drags a Striker onto the belt. It snaps into position with a satisfying magnetic click. An amber badge appears on the striker icon: "2 FP." The counter reads "7/12." Wait — she placed three scouts (3 FP) and one striker (2 FP) = 5 FP spent. 12 - 5 = 7. The math checks out.

She queues more: Relay (1 FP → 6 remaining), Striker (2 FP → 4 remaining), Scout (1 FP → 3 remaining). She reaches for another striker — the amber badge shows "2 FP" but she only has 3 remaining. She drags it onto the belt. "1/12." One FP left. She tries queuing one more scout. The conveyor flashes amber. A soft two-note descending tone plays — **bwoo-bwup** — the cash register rejection sound. The scout bounces back to the blueprint library. A tooltip appears: "Insufficient Forge Points. 1 FP remaining; Scout requires 1 FP." Wait, that should work. She tries again. It snaps in. "0/12."

The conveyor belt's LED indicators all shift from amber to a steady cool blue — fully allocated. The Forge Ledger shows all twelve hexes dimmed. A small text appears: "Forge Budget: FULLY COMMITTED." She notices the text but doesn't yet understand the weight of it.

**Minute 2:00 — EXECUTE and the Flood Lesson**
She hits EXECUTE. The battle starts. Her three pre-placed scouts fan out. The factory begins building. By tick 10, her army is growing. She watches with the satisfaction of abundance — units appearing, moving, scouting. By tick 20, she has 8 units on the board.

Tick 22: an enemy flanking group hits her scouts. Two scouts die in consecutive ticks — red flash, red flash. She thinks: "I'll just build more." But the Forge Budget counter in the top-right reads "0/12." The factory is already dark — has been since tick 18 when the last unit was produced. She missed the depletion entirely because she was watching the battle.

Tick 25-40: she watches, increasingly anxious, as her remaining units fight without reinforcement. Every loss is permanent. A striker goes down. Then a relay. Her communication chain breaks. The remaining units, disconnected, start making bad decisions — moving without threat data, ignoring flanks they can't see.

She loses. The debrief shows: "12/12 FP spent. Peak army: 8. Final army: 3. Units lost: 5. No units replaced."

**Minute 4:00 — The Retry Revelation**
She hits retry. The Forge Ledger reappears with 12 fresh hexes. This time she pauses. She doesn't immediately drag everything onto the board and conveyor. She thinks about what happened: she committed everything upfront and had no ability to replace losses.

She tries a different split: 2 pre-placed scouts (2 FP), then a shorter conveyor queue — Striker (2), Relay (1), Scout (1) = 4 FP queued. Total: 6 FP committed, 6 FP remaining in the Factory Lane. She hits EXECUTE.

This time, when her first scout dies at tick 15, the factory is still glowing amber. She watches it produce a replacement scout from the queue backlog. The amber hex counter ticks: "7/12." She has headroom. She breathes easier. By tick 40, she's lost and replaced two units, still has 2 FP remaining, and her architecture holds. She wins.

The debrief comparison shows her two attempts side by side. Attempt 1: 0 FP at tick 18, all committed. Attempt 2: 2 FP remaining at victory. She sees the lesson in the numbers: "Don't spend everything at once." The Forge Budget taught budgeting without a single word of explanation.

**UI Annotations:**
- **Boot log forge introduction**: Teal monospace text, 8-second auto-scroll, "permanently" and "does not regenerate" in bold amber highlight.
- **Hex materialization**: Each FP token appears with a 150ms staggered delay and ascending chime (C4, D4, E4... scaling with count).
- **Depletion moment**: If player is watching the factory when it depletes — clunk + grey shift. If player is watching the battle (likely for new players) — a subtle amber flash on the FP counter in the top-right corner, easily missed on first play. This is intentional: the depletion should surprise new players, teaching them to watch the counter.
- **Retry comparison**: Two-column debrief with FP timeline sparklines side by side. Green highlights on the winning attempt's remaining FP.

---

## Strengths

1. **Every unit matters.** The FP cap transforms production from a throughput optimization into an allocation puzzle. Players remember individual units — "that was my last striker" — creating attachment through scarcity.

2. **Pre-mission identity.** The Forge Ledger's three-lane split gives each attempt a strategic identity before battle starts. Players develop "builds" — "I run a 3/6/3 split on Palawan" — creating a meta-language for strategy discussion.

3. **Natural spawn storm governor.** FP hard caps solve the runaway spawning problem elegantly. A spawn storm that eats 8 FP in 5 ticks is self-punishing — the factory dies, the lesson is learned, no additional anti-spawn-storm mechanics needed.

4. **Command agent value.** Reserve FP makes the Command agent the only unit that can access a portion of your budget. This creates a compelling reason to protect the Command — not just for its skills, but for its role as the key to your reserves. A dead Command with 4 Reserve FP is a 27% budget loss.

5. **Mission design lever.** The FP budget is the single most powerful dial a level designer has. A 6 FP mission plays fundamentally differently from a 20 FP mission, without changing any other parameters.

6. **1:1 vocabulary mapping.** FP maps to Kubernetes pod quotas, cloud compute budgets, API rate limits. "My namespace has 8 pods total" IS "my mission has 8 FP total." The lesson transfers.

## Weaknesses

1. **Double currency complexity.** Minerals AND FP is two resource systems to track. Players must understand both and their interaction. The "insufficient minerals but have FP" and "have minerals but no FP" states need clear, distinct feedback.

2. **Frustration ceiling.** FP depletion is permanent and irreversible. A player who commits all FP to pre-placed units and then gets flanked has no recovery path. This teaches a lesson but may cause rage-quits before the lesson lands.

3. **Factory darkness is boring.** Once FP hits zero, the factory becomes a dead sprite. The rest of the battle is "watch your existing army and hope." This may feel passive, especially for players who enjoyed the rhythm of continuous production.

4. **Reserve lane complexity.** The three-lane pre-mission allocation (Pre-Placed / Factory / Reserve) plus the Command agent's fabricate skill is a lot of mechanics layered on top of the already-complex blueprint editor. Mission 5 players are learning factory, conveyor, AND Forge Ledger simultaneously.

5. **Invisible depletion.** New players (Journey 3: Sofia) will miss the factory depletion moment because they're watching the battle. The clunk audio cue may not register. The lesson requires a failed run followed by a retry — which is fine for the game's design philosophy but adds a mandatory failure experience.

---

## Interaction Effects

- **× Spawn Semantics (1.04c):** FP is the natural limiter for all spawn models (explicit, implicit, hook-triggered). Every spawn variation now has a hard cost floor. The inheritance mask decision from 1.04c becomes even more important — you can't afford to waste FP on a child unit that starts with a bad buffer state.
- **× Reinforcement Thermostat (3.19a-i):** FP is the integral saturation limit in the PID control model. `forge_remaining()` is the anti-windup signal. The entire control theory curriculum applies directly.
- **× Command Agent Design (3.17):** The Reserve lane makes Command agents the strategic keystone. The "Org Chart" and "Control Room" paradigms from 3.17 gain a new dimension — Command isn't just routing signals, it's managing the forge budget.
- **× One-Shot-One-Kill:** FP scarcity + one-shot lethality = extreme consequence per positioning error. A unit out of position is a wasted FP. This amplifies the Into the Breach "every move matters" feeling.
- **× Sealed Watch Purity:** The factory depletion moment (clunk, grey shift) is a major emotional beat during Sealed Watch. The no-skip rule ensures every player experiences it.
- **× Context Overload:** A stunned unit wastes ticks. Wasted ticks in an FP-starved mission mean that unit produced less value per FP spent. Context overload becomes an economic inefficiency, not just a tactical one.
- **× Campaign Pacing (Mission Arc):** FP budget as mission parameter creates natural difficulty curve without touching enemy stats. Missions 5-6: generous FP (learn factory). Missions 7-8: tight FP (learn allocation). Missions 9-10: variable FP (master adaptation).

---

## Comparable Games

**StarCraft 2 — Supply Cap:** The 200 supply cap creates force composition decisions but regenerates through depots. Robot Uprising's FP is harsher — no regeneration, permanent depletion. StarCraft's supply is "how big can your army be at once?" FP is "how many units will ever exist in this battle?"

**Into the Breach — Fixed Mech Count:** You have exactly 3 mechs. No production. No replacement. Every mech matters infinitely. FP-starved missions (4-6 FP) approach this feeling — your army is small and irreplaceable.

**XCOM — Soldier Permadeath:** Losing a Colonel hurts because of the investment. FP creates a similar attachment but through scarcity rather than growth — you care about the scout not because it leveled up, but because replacing it costs one of your dwindling forge points.

**Slay the Spire — Card Removal as Resource:** Removing cards from your deck costs gold at shops. The decision "is this card worth removing?" parallels "is this unit worth building?" Both are about spending a limited resource on composition quality.

**Factorio — Blueprint Cost vs. Available Resources:** In Factorio, you can blueprint a perfect factory but lack the resources to build it. FP creates the same "I know what I want but can't afford all of it" tension in a combat context.

---

## Sensory Description

**The Forge Ledger** occupies a 200px-wide vertical strip on the right edge of the Plan screen, below the production queue. Background: dark gunmetal with a subtle hexagonal grid texture, like a honeycomb cross-section. The three lanes are separated by thin gold lines with labels in small caps: PRE-PLACED, FACTORY, RESERVE.

Each FP token is a 28×28 pixel hexagon. Unspent tokens glow warm amber (#D4A574) with a slow breathing animation (opacity oscillates 85%-100% over 2 seconds). Spent tokens dim to dark bronze (#4A3728) with no animation. The transition when a token is spent: a 300ms shrink-to-center → color shift → a tiny spark particle flies from the token toward the unit or conveyor belt that consumed it.

**The factory depletion moment:** The factory sprite — a bamboo-and-steel data rack with an amber conveyor belt running through its base — undergoes a 500ms transition. The conveyor belt slows (texture scroll speed decreases), the amber LEDs along its edge flicker twice, then all shift to cold grey (#6B7B8D). The main factory body dims 40%. A deep metallic **clunk** sounds — 200Hz fundamental with a 600ms decay, like a massive circuit breaker tripping. A small dust-particle effect settles around the base. Text overlay "FORGE DEPLETED" appears in grey monospace, 10px font, bottom of factory tile.

**The reserve access animation:** When a Command agent triggers `fabricate`, a silver hexagonal token (#C0C0C0) lifts from the Command unit's tile position, floats in a gentle arc over 800ms, and dissolves into the factory with a soft crystalline **ting** sound (high register, 1200Hz, 200ms decay). The factory briefly flashes amber — a 200ms pulse — before returning to its current state (amber if FP remains, grey if depleted).

**Audio vocabulary:**
- FP token spent (pre-placement): warm **thunk** — wooden mallet on padded surface, 150ms
- FP token spent (factory production): mechanical **ka-chunk** — stamping press, 200ms
- Factory depletion: deep **clunk** — circuit breaker trip, 600ms decay
- Reserve access: crystalline **ting** — glass on metal, 200ms
- Budget warning (3 FP remaining): subtle amber ping every 5 ticks during Sealed Watch
- Queue rejection: descending two-note **bwoo-bwup** — cash register decline, 300ms

---

## The TikTok Clip

Split screen. Left: a player's Forge Ledger, twelve amber hexes, all glowing. The player queues everything — drag, drag, drag, all twelve hexes dim in rapid succession. They hit EXECUTE looking confident. Fast-forward: their army floods the board, then starts dying. The FP counter reads 0/12 at tick 15. The factory is grey. Units fall one by one. Defeat.

Right side: same player, retry. They deliberately leave four hexes in reserve. Slower start, fewer units. But when units die, the factory produces replacements. The FP counter ticks down gradually — 8, 7, 6 — over the full battle. They win with 2 FP remaining. Caption: "learned budgeting from a robot war game." The factory's amber glow at victory versus the grey death on the left side tells the whole story in a single frame.
