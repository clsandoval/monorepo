# Escort Mission Anti-Frustration Design

**Aspect:** 5.08e — Escort mission anti-frustration design: why escort missions are hated in other games and how Robot Uprising's "design-then-watch" model avoids the core frustrations. The VIP-as-configured-agent insight as key differentiator.
**Category:** Campaign / Mission Design
**Wave:** 5 (Campaign & Progression)

---

## The Problem Space

Escort missions are the single most universally despised mission type in gaming. Tim Cain (Fallout creator) put it bluntly: "I've never seen a review asking for more escort quests." Every proposed fix introduces a new frustration — add a timer and you have two hated mechanics in one. Make the NPC invincible and the mission loses all stakes. Speed-match the player and the NPC feels robotic.

The core frustrations break into five categories. Robot Uprising's design-then-watch architecture dissolves most of them categorically, not through patches — but only if the escort mission is designed with deliberate anti-frustration architecture from the ground up.

---

## The Five Frustrations (and How They Dissolve)

### Frustration 1: "The Stupid NPC" — AI Makes Decisions the Player Would Never Make

**In other games:** The escorted NPC charges into enemy fire, stands in chokepoints, takes the longest possible route, and generally behaves like a drunk tourist in a warzone. The player screams "WHY DID YOU GO THERE" and has zero recourse. RE4's Ashley walking into bear traps. Zelda: BotW's escort NPCs stopping to stare at scenery during combat.

**Why it's hated:** The player's skill is irrelevant. They executed perfectly but still failed because an AI they don't control made an obviously bad decision. Agency is violated — the game punishes the player for someone else's mistake.

**Robot Uprising dissolution:** The VIP IS an agent the player configured. Its rules, its hooks, its context filters — all player-authored. If the VIP walks into danger, it's because the player's rule ordering prioritized "move toward objective" over "evade nearby threat." If it freezes in a chokepoint, it's because the player didn't configure an "IF path-blocked" rule. The VIP's stupidity is the player's design failure, not the game's AI failure.

This is the categorical dissolution. Every escort game has a gap between "what the player wants the NPC to do" and "what the NPC actually does." Robot Uprising closes that gap to zero — the NPC does exactly what the player designed it to do. The emotional response shifts from "stupid AI" to "I need to redesign my VIP's rules." The anger redirects from the game to the player's own architecture, which is productive anger — it motivates iteration, not rage-quitting.

**The anti-frustration design spec:**
- The VIP must use the same rule/hook/context system as every other agent. No special VIP logic that bypasses player configuration.
- The Inspector must show the VIP's decision trace with the same fidelity as any unit. Every tick: which rule fired, what context was in the window, why this movement was chosen.
- The Plan screen must allow the VIP blueprint to be configured with the same workbench tools. No locked-off "escort NPC" with hidden behavior.

### Frustration 2: "The Speed Mismatch" — Forced to Move at the NPC's Pace

**In other games:** The NPC walks at 0.7x player speed. The player sprints ahead, waits, the NPC catches up, the player sprints again. Or worse: the NPC moves faster than walking speed but slower than running speed, so there's no comfortable pace. The legendary "Natalya in GoldenEye" problem. FFXIV's initial escort quests where NPCs charged ahead then waited — better than slow NPCs, but created a "leapfrog" feel.

**Why it's hated:** The player's traversal skills (movement, pathfinding, situational awareness) are artificially suppressed. A fast player is punished for being good. The mission feels padded.

**Robot Uprising dissolution:** There is no direct player movement at all. The player doesn't control any unit in real-time. During sealed watch, ALL units move at their configured speed (determined by unit type stats). The VIP's movement speed is a known, locked value — the player designs around it during the plan phase. A Scout (fast) can be deployed as a forward escort, a Striker (medium) walks alongside, and the player's architecture accounts for the speed differential through timed hook chains.

The speed mismatch frustration is fundamentally a real-time control problem. Robot Uprising's tick-based, design-then-watch model eliminates it entirely. The player never walks alongside anyone. They watch all agents — VIP included — execute simultaneously at the same 1-second tick rate. There's no speed mismatch because there's no player-controlled movement.

**The anti-frustration design spec:**
- The VIP's speed stat must be visible on the Plan screen blueprint card. Clear text: "Speed: 1 tile/tick" or "Speed: Slow (1 tile/2 ticks)."
- If the VIP is slower than escort units, the Plan screen ghost preview must show movement projections — ghost silhouettes of where each unit will be after N ticks, making the speed differential visible before execution.
- The Production Queue preview should show estimated tick-count for VIP to reach destination, so the player can plan the build order accordingly.

### Frustration 3: "The Retry Lottery" — Identical Replays with Random Failure

**In other games:** The player retries the same escort section. The NPC follows the same path. But enemy spawns vary randomly, and sometimes the RNG produces an impossible ambush at the worst chokepoint. The player didn't learn anything — they just rolled better dice. Dead Rising's survivor AI. XCOM VIP extraction when a Sectopod spawns adjacent.

**Why it's hated:** Failure feels arbitrary, not earned. The player can't meaningfully improve because the variable isn't their skill — it's the RNG. Retries feel like slot machine pulls, not practice.

**Robot Uprising dissolution:** The invisible randomization system (locked design decision) varies each execution within constraints, but the Inspector lets the player diagnose EXACTLY what went wrong. The retry loop isn't "try again with fingers crossed" — it's "redesign the architecture that failed, then watch the new design handle the variance."

This is the deepest anti-frustration inversion. In traditional escort missions, retry means repeating the same actions hoping for better luck. In Robot Uprising, retry means redesigning the system. Every failure is a design lesson, not a dice roll.

**The anti-frustration design spec:**
- Inspector must show the VIP's destruction/failure moment with full causal trace: "VIP eliminated at T14 because Striker-A was 3 tiles away (engaged by enemy at T12, couldn't disengage due to rule priority ordering) and Scout-B's threat signal arrived at T13 but VIP's buffer was full (context overload at T12 from relay broadcast on shared channel)."
- The decision trace must suggest architectural hypotheses, not just report facts: "VIP's buffer was full → consider reducing relay broadcast frequency or adding a filter rule."
- Each retry should visibly differ in enemy behavior, but the player's architecture should be testable against the range of variance. Missions should be designed so a good architecture wins consistently, not sometimes.

### Frustration 4: "The Tether" — Punished for Exploring or Fighting

**In other games:** The player sees an interesting side path or a combat opportunity, but leaving the NPC's side triggers a fail state. "You strayed too far from the convoy." The NPC can't wait, can't follow, can't adapt. The player feels leashed. Assassin's Creed's desync radius. Any game where "NPC reached 100m away → mission failed."

**Why it's hated:** The escort reduces the game's possibility space. The open world becomes a corridor. Skills and systems the player developed for other mission types are suddenly useless.

**Robot Uprising dissolution:** There is no player avatar to tether. The player isn't ON the battlefield. They designed the entire architecture before execution, and now they watch. The question isn't "how far can I stray from the VIP?" but "did I design escorts with the right patrol routes and threat response rules to handle flanking while the VIP advances?"

The tether frustration is about player movement being constrained. Since Robot Uprising has no player movement, it can't have tether frustration. The design equivalent — "did I allocate enough escort units?" — is a strategic resource question decided during the plan phase, which feels like a real decision rather than a spatial constraint.

**The anti-frustration design spec:**
- Escort missions should never require ALL player units to stay near the VIP. The best architectures split forces: forward scouts, flanking strikers, VIP-adjacent bodyguards, distant relay infrastructure.
- The mission design must reward diverse architectures. A diamond escort formation should work, but a distributed sensor net with rapid-response strikers should also work. Multiple valid topologies prevent "one right answer" stagnation.
- The Plan screen ghost preview should show perception radii overlapping the VIP's projected path, making coverage gaps visible before execution.

### Frustration 5: "The Invincibility Cop-Out" — Stakes Removed to Avoid Frustration

**In other games:** The Last of Us makes Ellie invisible to enemies (she can literally walk in front of them). God of War makes Atreus invincible. BioShock Infinite makes Elizabeth untargetable. The escort mechanic is technically present but functionally neutered. The NPC exists narratively but not mechanically.

**Why it's hated (by designers, at least):** It works — players don't complain. But it's a concession, not a solution. The escort has no mechanical weight. The player doesn't need to protect Elizabeth because she can't be hurt. The "escort" is purely narrative.

**Robot Uprising alternative:** The VIP CAN be destroyed (one-shot, one-kill). But the player designed its survival architecture. The stakes are real — VIP death means mission failure. The key difference: the player has TOOLS to prevent VIP death (rules, hooks, escort blueprints, context filters, Command agent rerouting), and those tools are the same tools they've been mastering all campaign. Protecting the VIP tests mastery, not patience.

**The anti-frustration design spec:**
- The VIP must be vulnerable but not paper-thin. Two possible treatments:
  - **Option A: Glass Cannon.** VIP has one-shot-one-kill like everyone else, but has a skill (e.g., "evade" or "phase-shift") that gives it one escape per mission. The player must design architecture that prevents needing the escape, but the escape prevents instant frustration on first attempt.
  - **Option B: Shielded Start.** VIP begins with a shield (absorbed by first hit, like Into the Breach's grid defense). The shield is consumed — not renewable. The player must protect the VIP from all subsequent threats. First hit is free, second is fatal.
  - **Option C: Stun, Not Kill.** VIP hit → stunned for 3 ticks (not 1 like context overload). While stunned, VIP can be hit again for elimination. Escort units have a 3-tick window to clear threats. Creates a "rescue moment" rather than instant death.
- **Recommendation: Option C.** It creates the highest-drama sealed watch moments (VIP stunned, sparking, escort units converging, enemy closing in — will they make it?) while being forgiving enough for first attempts. The 3-tick stun window is long enough to feel "rescuable" but short enough to feel urgent.

---

## Six Escort Mission Variants

The core escort mechanic (VIP traverses board, player's architecture protects it) can be expressed as six distinct mission shapes, each testing different architectural skills.

### Variant 1: "The Straight Line" — Simple A-to-B Traverse

The VIP spawns at the player's base (left edge) and must reach the enemy base (right edge). The path is direct — no maze, no branching. Enemies spawn from the right side and must be intercepted before reaching the VIP.

**What it tests:** Basic escort formation design. Rule priority for "protect VIP" vs. "engage threats." Buffer management when scouts report multiple threats simultaneously.

**Difficulty scaling:** Number of enemy waves, wave timing relative to VIP position, enemy types (strikers that rush the VIP vs. scouts that tag for long-range threats).

**Sensory description:** The VIP glides steadily left-to-right across the 8x8 board, one tile per tick, golden border pulsing with a warm amber heartbeat glow. Escort strikers flank in a tight V-formation, their cyan engagement-range indicators overlapping the VIP's tile like a protective umbrella. When a threat is detected — a red ping on a forward scout's perception radius, a compressed signal flashing along a green relay line to the nearest striker — the striker peels away from formation. The V collapses to a half-V. The VIP's heartbeat quickens — two amber pulses per tick instead of one. The exposed flank is visible: no cyan overlay, no escort range circle. If an enemy reaches that gap, the screen flashes red, the VIP sparks and jitters (3-tick stun), and every escort unit's buffer bar spikes as "VIP-STUNNED" broadcasts on all channels.

**Audio:** The VIP's heartbeat is a soft, low-frequency pulse — more felt than heard. Escort formation: synchronized metallic footstep clicks, crisp and military. Striker peeling away: a sharp metallic *shink* (unsheathing). Threat near VIP: the heartbeat doubles in tempo and gains a distortion layer, like a speaker slightly overdriven. VIP stun: a horrible electrical crackle followed by dead silence for half a second before the rescue scramble audio kicks in — urgent, staccato pings on all channels.

### Variant 2: "The Gauntlet" — Ambush Corridor

The VIP must traverse a narrow corridor (2-tile-wide strip through the center of the board) with ambush points on both sides. Enemies spawn from pre-placed positions along the corridor. The player knows the ambush positions from the Plan screen but doesn't know timing or composition.

**What it tests:** Escort architecture under spatial constraint. Relay placement (corridor limits placement options). Context overload management (narrow corridor = dense signal environment). Rule design for prioritizing immediate vs. future threats.

**Why this is the hardest variant:** Two-tile corridors mean escort units block each other. A striker engaging an enemy at the corridor edge physically blocks a second striker from reaching the other side. The player must design rules for MOVEMENT PRIORITY — who yields to whom.

### Variant 3: "The Branching Path" — Route Selection as Architecture Decision

The board has two or three paths from A to B. The VIP must be configured with a route selection rule: which path to take based on scouted information. Forward scouts report threats on each path, and the VIP's rules choose the least-dangerous route.

**What it tests:** Information-to-action pipeline sophistication. The player must design scouts that report not just "threat exists" but "threat density" or "threat type," and the VIP must have rules that interpret these reports into route decisions.

**The key insight:** In other games, the player makes the route decision in real-time. Here, the VIP makes it autonomously based on the player's rules. If the VIP takes the wrong path, it's because the player's reporting or decision rules were inadequate. The player debugs the decision in the Inspector, seeing exactly which scout reports arrived, how they were interpreted, and why the VIP chose Path B over Path A.

### Variant 4: "The Relay Caravan" — Moving Information Infrastructure

The VIP is a relay unit being relocated. It has no combat capability but has 12-slot context window and 4 hook slots. The VIP IS the communication infrastructure — while it's in transit, units behind it lose relay connectivity. The escort must protect the relay while maintaining a temporary information network using remaining units.

**What it tests:** Network topology under stress. The player must design TWO networks: the permanent post-relocation network AND the temporary in-transit network. This is the architectural planning variant — protect the VIP AND manage the communication degradation during transit.

**Unique tension:** Every tick the relay is in transit, the player's information network has a gap. Scouts report to dead channels. Strikers act on stale data. The player must design hooks that handle "relay offline" gracefully — fallback channels, local decision-making, silence-tolerant rules.

### Variant 5: "The Extraction" — VIP Moves Toward the Player's Base

Inverted escort: the VIP starts at the ENEMY side of the board and must reach the PLAYER's base. The player must send units into hostile territory to rendezvous with the VIP, then escort it back. The outbound trip is unprotected; the return trip is the escort.

**What it tests:** Timing and rendezvous architecture. Scouts must locate the VIP, relay its position back, and the escort force must converge at the right place and time. Production queue timing matters — build escort units early enough to reach the VIP before enemies do.

**Comparable:** XCOM VIP extraction missions. The tension of pushing into unknown territory to find the extraction point.

### Variant 6: "The Active Escort" — VIP Does Something Useful in Transit

The VIP is a Specialist extracting data from nodes along the route. It must stop at 3 map nodes, spend 2 ticks extracting, then continue. During extraction, it's stationary and vulnerable. The escort must provide perimeter defense at each extraction point.

**What it tests:** Dynamic escort formation. The architecture must handle two modes: "VIP moving" (formation escorts) and "VIP extracting" (perimeter defense). Switching between modes based on VIP state requires hooks broadcasting "extracting"/"moving" signals, and escort rules that change behavior based on those signals.

**Why this is the best variant for anti-frustration:** The VIP is doing something useful, not just being helpless. The player designed the VIP's extraction skill and the extraction route. The VIP has agency — it's a productive member of the team, not dead weight. This fundamentally reframes the escort from "protect this liability" to "enable this specialist."

---

## Three Player Journeys

### Journey: Tomás, 16, First Strategy Game Ever

**Context:** Mission 8 (first escort mission). Has completed Missions 1-7, understands all primitives. Just unlocked the Specialist unit. This is the "Active Escort" variant — Specialist extracting data from 3 nodes.

**Minute 0:00 — Plan Screen: First Encounter with Escort Objective**
Tomás sees the Plan screen. Board left shows the familiar 8x8 grid — Cebu urban cyberpunk biome, neon-lit vertical slums, exposed fiber optic cables snaking between buildings. Three tiles glow with a pulsing cyan data-crystal icon — the extraction nodes. A golden dotted line shows the VIP's intended path: base → node 1 → node 2 → node 3 → base.

The workbench right shows a new blueprint card with a golden border: "VIP-SPECIALIST." It already has the `extract` skill equipped and a pre-configured rule: `IF adjacent-to-node → extract`. Tomás hovers over it. The tooltip reads: "This unit must survive and extract all 3 data nodes. One hit = 3-tick stun. Second hit = eliminated. Mission fails if eliminated before extraction complete."

Tomás thinks: "Okay, so I need to protect this thing while it stops at each node. That's like... a bodyguard setup."

**Minute 1:30 — Building the Escort Architecture**
He creates a blueprint called "BODYGUARD" — a Striker with rules:
1. IF VIP-under-threat on escort-chan → move toward VIP
2. IF enemy-adjacent → engage
3. IF VIP-extracting on escort-chan → patrol VIP perimeter
4. ELSE → follow VIP (move toward VIP position)

He gives the VIP a hook: ON_EXTRACT → broadcast "extracting" on escort-chan. ON_MOVE → broadcast "moving" on escort-chan. ON_THREAT_NEARBY → broadcast "VIP-under-threat" on escort-chan.

He builds two BODYGUARD units and a Scout with wide perception to provide early warning. Production queue: Scout first (fast, cheap, gets to position early), then two BODYGUARDs, then VIP-SPECIALIST last.

He hits EXECUTE.

**Minute 3:00 — Sealed Watch: First Extraction**
The board comes alive. Tick 1: Scout deploys from base, bolts north. Tick 3: BODYGUARDs deploy, medium speed, heading toward node 1. Tick 5: VIP deploys, golden border glowing, moving steadily toward node 1.

Tick 8: VIP reaches node 1. A green flash — "extracting" broadcasts on escort-chan. Both BODYGUARDs' rules shift: they stop following and begin patrolling a 1-tile perimeter around the VIP. The formation snaps into defensive position — one north, one south. The Scout's perception cone sweeps the surrounding tiles.

Tick 9: Scout spots enemies approaching from the east. Orange threat signal fires down a relay channel to the BODYGUARDs. The north BODYGUARD's rule 1 fires — but wait, the VIP isn't under DIRECT threat yet. Rule 3 (patrol VIP perimeter) is still active. The BODYGUARD stays in patrol.

Tick 10: VIP finishes extraction at node 1. "Moving" broadcasts. BODYGUARDs snap back to follow mode, flanking the VIP as it moves toward node 2. The enemy closes in from the east.

Tick 12: Enemy striker enters BODYGUARD engagement range. Rule 2 fires — BODYGUARD-A engages. One-shot-one-kill: enemy eliminated. But BODYGUARD-A is now 2 tiles away from the VIP, which has continued moving.

Tick 13: A SECOND enemy appears from the south. The VIP's "nearby threat" hook fires — "VIP-under-threat" broadcasts. BODYGUARD-B's rule 1 fires, but it's already adjacent to the VIP and the enemy is 2 tiles away. BODYGUARD-B moves to intercept... but the enemy reaches the VIP first.

Tick 14: Enemy strikes the VIP. RED FLASH. The VIP sparks, jitters, golden border flickering — 3-tick stun. A horrible electrical crackle. All escort channels flood with "VIP-STUNNED." BODYGUARD-B arrives at tick 15, eliminates the enemy. The VIP recovers at tick 17, resumes movement.

Tomás exhales. "That was close. But why didn't BODYGUARD-B intercept sooner?"

**Minute 5:00 — Second Extraction (Node 2) Goes Wrong**
VIP reaches node 2. Extraction begins. But Tomás's Scout has been destroyed by a flanking enemy it didn't see (narrow perception cone pointed the wrong way). Without early warning, two enemies approach node 2 simultaneously from opposite directions.

Tick 22: Both enemies reach the VIP at the same time. BODYGUARD-A engages one. BODYGUARD-B engages the other. Both enemies eliminated — but a THIRD enemy that was behind them reaches the stunned VIP. Second hit. VIP eliminated. Mission failed.

The screen holds on the frozen board for 2 seconds. Then the Inspector opens.

**Minute 6:00 — Inspector: Diagnosing the Failure**
Tomás clicks on the VIP at tick 22. The decision trace shows: "VIP stunned at T22 (hit by Enemy-3). BODYGUARD-A engaged Enemy-1 at T22. BODYGUARD-B engaged Enemy-2 at T22. No escort unit available for Enemy-3."

He scrubs back to tick 18. The Scout was eliminated at T18 — no early warning after that point. The context window chart shows VIP's buffer was healthy (only 3/10 slots full) — context overload wasn't the problem. The problem was loss of forward intelligence.

Tomás thinks: "I need a backup Scout. Or I need my Scout to be harder to kill. Or I need a Relay to extend perception range so I don't need the Scout so close to enemies."

**Minute 8:00 — Redesign and Retry**
Back in the Plan screen. Tomás adds a Relay unit positioned between nodes 1 and 2, configured to amplify Scout signals. He also adds an `evade` rule to the Scout (priority 1 — survive before report). And he redesigns the BODYGUARD formation: three BODYGUARDs instead of two, with one designated "roamer" whose rules prioritize intercepting threats before they reach escort range.

Second attempt: Scout evades the flanking enemy, Relay amplifies threat detection, three-BODYGUARD formation handles the simultaneous approach at node 2. VIP completes all 3 extractions. Mission success at tick 34.

**What Tomás learned:** Escort isn't just about surrounding the VIP with combat units. It's an information architecture problem — forward intelligence (scouts), reliable communication (relays), and layered defense (close escort + roaming interceptor). Losing the scout was the real failure, not the combat.

**UI Annotations:**
- **VIP golden border**: 3px golden glow, pulsing at 0.5Hz when healthy, doubling to 1Hz when threatened, flickering at 4Hz when stunned
- **Extraction node**: Cyan data-crystal icon embedded in tile, rotating slowly (15°/s), emitting upward particle stream during extraction
- **Escort-chan signals**: Amber dashed lines between VIP and BODYGUARDs, visible during sealed watch, brightening on signal delivery
- **Stun animation**: VIP sprite jitters ±2px randomly for 3 ticks, golden border flickers between gold and red, sparking particle effects (white-yellow)
- **Mission failed screen**: Board freezes, desaturates over 1 second, VIP's last position pulses red, "MISSION FAILED: VIP ELIMINATED" in sans-serif white text, center screen, 2-second hold before Inspector transition

---

### Journey: Dr. Priya, 38, ML Infrastructure Engineer

**Context:** Mission 8 on her second playthrough. First playthrough used a brute-force "surround the VIP with strikers" approach. Now she wants to build an elegant, minimal-unit escort architecture. She's playing "The Relay Caravan" variant — relocating a relay unit.

**Minute 0:00 — Plan Screen: The Architectural Challenge**
Priya sees the board: Palawan jungle biome, dense green canopy with gaps of golden light. Her relay unit (the VIP) must move from position B2 to G6 — nearly the full diagonal of the board. While in transit, units behind the relay lose signal connectivity.

She thinks: "This isn't a combat problem. It's a network partitioning problem. I'm moving a router — everything behind it goes offline."

She opens the channel map panel. Currently: Scout-A on "forward-recon" → Relay-VIP → Striker-A on "strike-cmd." When the relay moves, Scout-A's signals have no relay to reach Striker-A. The signal chain breaks.

**Minute 2:00 — Designing the Temporary Network**
Priya builds a secondary Relay — "RELAY-TEMP" — positioned at C4, equidistant between the VIP's start and end positions. It bridges the connectivity gap during transit. Its hooks: listen on "forward-recon" and "strike-cmd," compress and forward. It's stationary — it never moves. It exists solely as temporary infrastructure.

She configures the VIP relay's hooks to broadcast "in-transit" on a new channel "relay-status." RELAY-TEMP's rules: IF receive "in-transit" on relay-status → activate all hooks. IF receive "arrived" on relay-status → deactivate all hooks (self-deprioritize, let the VIP resume primary relay duties).

For escort, she builds only ONE Striker — "SHADOW" — with rules:
1. IF VIP-under-threat → engage nearest enemy to VIP
2. ELSE → maintain 1-tile distance from VIP, match VIP heading

Minimal. Elegant. One escort, one temporary relay, one forward scout.

**Minute 4:00 — Sealed Watch: The Network Partition**
Tick 1: All units deploy. VIP relay begins moving from B2 northeast toward G6.

Tick 4: VIP passes through C3. RELAY-TEMP at C4 receives "in-transit" — hooks activate. Green signal lines fork: Scout-A's reports now route through BOTH the moving VIP-relay AND the stationary RELAY-TEMP. Redundancy. Priya nods. "Dual-path. Nice."

Tick 7: VIP reaches D4. It's now equidistant between its origin and RELAY-TEMP. The signal topology has shifted — RELAY-TEMP is the primary relay now, VIP is in transit and less reliable (context window filling with movement observations).

Tick 9: Enemy scout appears at F5 — right on the VIP's projected path. Forward Scout-A detects it, sends threat signal on "forward-recon." Signal routes through RELAY-TEMP (2 ticks latency) to SHADOW striker. SHADOW's rules fire — move to intercept at E5.

Tick 11: SHADOW engages enemy scout at E5. One-shot kill. But SHADOW is now 2 tiles ahead of the VIP. A second enemy — a striker — appears at E3, south of the VIP. No one is nearby.

Tick 12: VIP's perception (none — it's a relay, stationary perception) doesn't detect the enemy. Scout-A is too far north. RELAY-TEMP can't perceive either. The enemy striker moves to D3, adjacent to the VIP.

Tick 13: Enemy strikes VIP-relay. Stun. 3-tick sparking. The temporary network ALSO degrades — VIP can't relay signals while stunned. RELAY-TEMP is now the ONLY communication path. SHADOW receives "VIP-STUNNED" broadcast (from VIP's built-in emergency hook) via RELAY-TEMP — but SHADOW is 3 tiles away. At medium speed, SHADOW reaches the VIP at tick 15. Enemy attacks again at tick 15 — same tick. Simultaneous resolution: SHADOW eliminates the enemy, but does the enemy's attack resolve first?

Tick 15: Into the Breach-style simultaneous resolution. The enemy's attack AND SHADOW's engage resolve simultaneously. The enemy is eliminated, but the attack on the stunned VIP — is it a kill? The rules: "stunned VIP can be eliminated by a second hit." The enemy's attack is the second hit. **VIP eliminated. SHADOW's kill doesn't prevent the attack that was already in progress.**

Mission failed. Priya stares at the board.

**Minute 7:00 — Inspector: The Timing Problem**
Priya scrubs to tick 11. SHADOW's kill at E5 pulled it out of escort range. She sees the gap: ticks 11-14, the VIP had no escort within 1 tile. Four ticks of exposure.

She thinks: "One escort isn't enough for diagonal traversal across 6 tiles. I need either faster response or closer positioning. Or..." She looks at the enemy spawn data. The T12 enemy appeared at E3 — 1 tile from the VIP's tick-12 position. "I need perception coverage on the VIP's flanks. The relay has no perception. That's the real problem — I'm escorting a blind unit through hostile territory."

**Minute 9:00 — Redesign: The Perception Bubble**
Second attempt. She adds a SECOND Scout — "SCOUT-FLANK" — with wide perception and a hook that broadcasts on "flank-alert." SCOUT-FLANK's movement rules: maintain 2-tile distance south of VIP, match VIP heading. This provides a perception bubble around the blind relay.

She also changes SHADOW's rules: instead of engaging threats ahead of the VIP, SHADOW stays within 1 tile at all times. New rule 0 (highest priority): "IF distance-to-VIP > 1 → move toward VIP." SHADOW never leaves the escort radius.

Third change: she adds a SECOND Striker — "INTERCEPTOR" — whose rules are purely threat-response: "IF receive threat on flank-alert → move toward threat position." INTERCEPTOR is the roamer; SHADOW is the bodyguard.

Second attempt: SCOUT-FLANK detects the E3 enemy at tick 11 (one tick earlier than before, because it's patrolling the southern flank). INTERCEPTOR responds to flank-alert, arrives at E3 at tick 12, eliminates enemy before it reaches VIP. SHADOW never leaves the relay's side. VIP arrives at G6, broadcasts "arrived." RELAY-TEMP deactivates. Network restored.

Mission complete. Priya leans back. "That's a distributed system architecture problem disguised as a combat mission."

**What Priya learned:** Escorting a unit with no perception is fundamentally different from escorting a unit with combat capability. The VIP's weaknesses (blindness, no combat) determine the escort architecture. One-size-fits-all escort doesn't work — you design the escort around the VIP's specific vulnerabilities.

**UI Annotations:**
- **Network partition visualization**: During sealed watch, signal lines that pass through the moving VIP-relay show a yellow "degraded" color when relay is in transit, versus green "healthy" through RELAY-TEMP
- **Relay "in-transit" indicator**: VIP-relay sprite shows small animated arrows indicating movement direction, golden border + movement trail (golden afterimages fading over 3 ticks)
- **Perception bubble overlay**: SCOUT-FLANK's perception radius shown as translucent cyan circle moving alongside VIP, making the "protection zone" visually explicit
- **SHADOW tether**: Thin white line connecting SHADOW to VIP, stretching visibly when SHADOW drifts more than 1 tile, snapping back when close

---

### Journey: Marcus, 52, High School History Teacher, Casual Player

**Context:** Mission 8, first playthrough. Has struggled with Missions 6-7 (command agents confused him). The escort mission is "The Branching Path" variant. He's not confident with complex architectures. He tends to build simple, obvious setups.

**Minute 0:00 — Plan Screen: Overwhelm**
Marcus sees the board: Batanes highlands, wind-swept grass on volcanic hills, low stone walls between tiles. The VIP (a Specialist) must reach a data node on the far side of the board. There are two paths: a short, exposed route through the center and a longer, sheltered route along the northern edge behind stone walls.

The boot log for this mission reads (Captain Reyes's voice): *"Two paths. The short one is faster but exposed. The long one is slower but has natural cover. Your agents need to scout both and decide. Configure the VIP to LISTEN to scout reports and CHOOSE."*

Marcus thinks: "I don't want to build some fancy decision system. Can I just... pick a path for the VIP?"

**Minute 1:00 — The Simple Approach**
He configures the VIP with simple movement rules: "Move north, then east." Hard-coded path along the sheltered northern route. No decision logic. He adds two Strikers as escorts — one in front, one behind. He adds one Scout on the exposed center path "just to see what's there."

No hooks between the Scout and the VIP. The Scout just... scouts. Marcus doesn't wire the information to anything.

He hits EXECUTE.

**Minute 2:30 — Sealed Watch: The Obvious Works (Sort Of)**
The VIP moves along the northern route. Stone walls provide visual cover — enemy units on the center path can't "see" the VIP through walls (walls block perception). The two Striker escorts handle the few enemies along the northern route. The mission is going fine.

But then: tick 16. An enemy appears at the northern route's exit point — right where the VIP is about to emerge from cover. The VIP has no threat-response rule. It walks into the enemy. Stun. 3 ticks of sparking on the highland grass, golden border flickering against grey stone. Escort Striker-B engages but is 2 tiles behind (following the VIP, not leading it). Striker-B arrives tick 18, eliminates enemy. VIP recovers tick 19.

Another enemy at tick 20, same exit point. This time: VIP is already through, but Striker-A (the lead escort) engaged a different enemy at tick 18 and hasn't returned. VIP is unescorted for 2 ticks. The enemy reaches the VIP. Second stun — but wait, the VIP was already stunned recently. Is there a stun cooldown? Yes — the VIP has a 5-tick stun immunity after recovering. The enemy's attack still connects: second hit while stun immunity is active → the hit is absorbed (stun immunity acts as a one-time shield).

Marcus watches this with his hands over his face. The VIP survives. It reaches the data node. Mission complete — barely.

**Minute 5:00 — Inspector: "Oh. The Scout Saw That."**
Marcus opens the Inspector. He clicks on the Scout that was patrolling the center path. At tick 12, the Scout detected the enemy that eventually ambushed the VIP at tick 16. The Scout's perception picked it up 4 ticks early. But the Scout's threat report went... nowhere. No hook configured. No channel. The information existed but was never communicated.

Marcus sees the decision trace for the VIP: "No threat data in context window. Movement rule fired: move north-then-east. No evasion rule present."

He thinks: "If I had wired the Scout to the VIP, the VIP could have... waited? Taken a different exit? I need to connect these things."

**Minute 7:00 — Redesign: Baby Steps Into Information Architecture**
Second attempt. Marcus adds one hook to the Scout: ON_ENEMY_DETECTED → broadcast on "path-info." He adds the VIP to listen on "path-info." He adds one new rule to the VIP: "IF receive threat-near-exit on path-info → wait 2 ticks." Simple. Not elegant. But functional.

Second run: Scout detects exit-point enemy at tick 12. Broadcasts on "path-info." VIP receives at tick 13 (1-tick latency). VIP's new rule fires: wait. The VIP stops for 2 ticks. During those 2 ticks, Striker-A (the lead escort) reaches the exit point, encounters the enemy, eliminates it. VIP resumes at tick 15. Clean passage.

Marcus pumps his fist. "That's it. That's what hooks are for."

**Minute 8:30 — The Teaching Moment**
The mission complete screen shows run stats: "VIP hits taken: 0. Escort engagements: 3. Scout reports delivered: 7. VIP decisions informed by scout data: 2."

Marcus sees that number — "2 decisions informed by scout data" — and realizes: only 2 out of 7 scout reports actually changed VIP behavior. The other 5 were noise (enemies on the center path that didn't matter). He thinks: "I should probably filter those. Only forward threats near the VIP's actual path."

He doesn't redesign again — the mission is complete. But the seed is planted. By Mission 9, he'll remember this and build tighter filters.

**What Marcus learned:** Information that exists but isn't connected is useless. The simplest escort architecture works until it doesn't — and when it fails, the fix is connecting information to decisions, not adding more combat units. The escort mission taught him hooks more effectively than the hooks tutorial mission did, because the stakes were tangible (VIP survival) rather than abstract (signal routing efficiency).

**UI Annotations:**
- **Stone wall tiles**: Dark grey volcanic rock texture, 2px taller than grass tiles to show elevation, perception-blocking (indicated by orange "blocked" icon when hovering during Plan phase)
- **Hard-coded path preview**: White dotted line showing the VIP's exact intended route on the Plan screen, with tick-number labels every 4 tiles
- **Scout perception with no hook**: During Inspector replay, Scout's detected enemies show as orange diamonds — but with no outgoing signal line. The absence of the line IS the diagnosis. A subtle but powerful visual: "I saw the threat but told no one."
- **"Decisions informed by scout data" stat**: Post-mission stat in small italic text, mint green color, positioned below the main completion stats. Not highlighted — just present. Players who notice it learn; players who don't will notice next time.

---

## Interaction Effects

### With Sealed Watch
Escort missions are the **best** sealed watch content. The moving VIP creates a geographic focus that shifts across the board over time. The viewer's eye follows the golden glow. Tension builds naturally as the VIP approaches chokepoints. The "VIP stunned" moment is the highest-drama event in the game — will the escort arrive in time? Every sealed watch clip of an escort mission is a natural story with beginning (VIP departs), middle (threats emerge), and climax (do the escorts hold?).

**TikTok clip:** 15 seconds. VIP golden glow crossing the board. Two enemies converge. Escort Striker intercepts one. Second enemy reaches VIP — STUN, sparks flying, heartbeat audio spiking. Cut to the roaming interceptor 3 tiles away, rule fires, it starts running. Tick counter: 3... 2... 1... Interceptor arrives. Enemy eliminated. VIP recovers. Golden glow stabilizes. Text overlay: "I didn't press a single button."

### With Inspector
Escort failures produce the richest Inspector content. Every VIP death has a full causal chain: which escort unit was out of position, why, what signal was delayed, what rule fired too late. The Inspector's decision trace panel is at its most useful when tracing "why was the VIP unprotected at tick 14?" — a concrete, emotionally-charged question that teaches abstract architectural debugging.

### With Command Agent (Missions 6-7)
Command agents paired with escort missions create the highest-skill-ceiling scenarios. A Command agent can: reroute escort units mid-battle (reassign), reprioritize which threats the escort responds to first (prioritize), reroute signals when a relay goes down (reroute). Escort + Command = the player designs a system that designs escort formations dynamically. Meta-level escort architecture.

### With Context Overload
Escort missions create natural context overload scenarios. The VIP receives signals from scouts, relays, and its own observations simultaneously. In dense-threat environments, the VIP's buffer fills, causing context overload → 1-tick stun → the VIP freezes BECAUSE IT'S OVERWHELMED WITH INFORMATION, not because of combat. This is thematically perfect — the escort mission teaches that too much communication is as dangerous as no communication.

### With Stealth (Emissions Model)
Escort + stealth creates "The Silent Escort" — the VIP must traverse the board without triggering enemy detection. Every hook transmission emits EM noise. Dense escort architecture (many hooks, many signals) is LOUDER. The player must design a minimal-communication escort: few hooks, compressed signals, silent scout reports. The safest escort is the quietest one. Tension between "communicate to protect" and "communicate and get detected."

### With Production Queue
Escort missions make production queue ordering critical. The VIP deploys last (needs escorts in position first). Scouts deploy first (need to establish perception before escorts arrive). Build order IS the deployment order. A bad production queue means the VIP deploys before its escorts are in position — instant vulnerability window.

### With One-Shot-One-Kill
The locked one-shot-one-kill rule makes escort missions visceral. No HP attrition, no gradual degradation. The VIP is either fine or stunned or dead. Every enemy that reaches the VIP is a binary crisis. This eliminates the "slow death" frustration of traditional escort missions where the NPC gradually loses HP and the player watches helplessly — instead, each threat is a sharp, decisive moment.

---

## Comparable Games

### ICO (2001) — The Gold Standard
ICO is the entire-game-as-escort that people love. Why it works: Yorda is semi-autonomous, can be called with a button press, is impervious to death (she's kidnapped, not killed), and the player develops genuine emotional attachment through 8 hours of shared puzzling. Robot Uprising's VIP-as-configured-agent goes further — Yorda's AI is fixed, but the VIP's behavior is entirely player-authored.

### Resident Evil 4 (2005) — Anti-Frustration Features as Patches
Ashley has a constellation of anti-frustration features: she ducks under the player's gun, can hide in dumpsters, can be commanded to wait or follow. Each feature is a PATCH on the fundamental problem (dumb NPC). Robot Uprising doesn't need patches because the fundamental problem doesn't exist — the VIP's behavior is the player's design.

### Into the Breach (2018) — Protect Objectives on a Grid
The Train mission is the closest analog. A multi-tile unit moves across an 8x8 grid while enemies try to reach it. Perfect information (enemy attacks telegraphed). One-shot destruction. The player uses push/pull mechanics to redirect enemies away from the train. Key insight from Into the Breach: the train MOVES, which creates constantly shifting protection requirements. Robot Uprising's VIP movement creates the same dynamic topology challenge.

The Armored Train variant (Advanced Edition) is instructive: giving the VIP some resilience (it shrugs off one hit) transforms the mission from frustrating to exciting. Robot Uprising's "3-tick stun instead of instant kill" serves the same function — a survivable first hit that creates a rescue window.

### BioShock Infinite (2013) — The Invisible Escort
Elizabeth is the anti-escort: invincible, helpful, stays out of the way. Robot Uprising should learn from this NOT to make the VIP invincible, but to learn from WHY Elizabeth works emotionally: she's useful. She finds ammo, opens tears, comments on the world. Robot Uprising's "Active Escort" variant (VIP extracts data at nodes) serves the same emotional function — the VIP is a productive team member, not dead weight.

### XCOM: Enemy Unknown (2012) — VIP Extraction
XCOM's VIP extraction missions (escort a civilian to the evac zone) are the best tactical escort missions in modern gaming. They work because: (1) the VIP has simple AI (move toward evac), (2) the player controls all other units with full agency, (3) the map has interesting cover geometry that creates meaningful tactical decisions, (4) failure is expensive but not campaign-ending. Robot Uprising's escort borrows the "meaningful tactical geometry" lesson — the 8x8 board with terrain, chokepoints, and ambush positions.

### Gladiabots (2017) — AI Escort via Programming
Gladiabots has a "protect the VIP" game mode where players program robots to defend a designated unit. This is the closest direct analog — the player designs AI behavior that protects a target. The difference: Gladiabots uses full behavior trees (complex visual programming), while Robot Uprising uses the simpler rule/hook/context system. Gladiabots' VIP mode is well-received by the community specifically because the player authored the escort behavior — same core insight as Robot Uprising.

---

## The Anti-Frustration Checklist

A Robot Uprising escort mission MUST satisfy all of these:

1. **VIP behavior is 100% player-authored.** Same rules/hooks/context system as all units. No hidden AI. No special NPC logic.
2. **VIP failure is diagnosable.** The Inspector shows the full causal chain from "VIP eliminated" back to "this specific design flaw."
3. **VIP failure is redesignable.** The player can modify the VIP's blueprint and retry with a different architecture, not just retry with fingers crossed.
4. **VIP has survivability.** Not invincible, but not instant-kill. 3-tick stun → rescue window. First hit is survivable, second is fatal.
5. **VIP is useful, not dead weight.** "Active Escort" variants where the VIP does something productive (extract, relay, command) are always preferred over pure "protect the helpless" variants.
6. **Multiple valid escort architectures.** Diamond formation, distributed sensor net, minimal stealth escort, roamer + bodyguard split, Command-agent-directed dynamic escort — all should be viable.
7. **No speed mismatch frustration.** All units move at tick-based speed. No player avatar to match pace with. Speed differentials are visible on the Plan screen.
8. **Escort teaches something.** Each escort mission should teach an architectural principle: information routing (Relay Caravan), multi-mode behavior (Active Escort), route decision-making (Branching Path), spatial coverage (Straight Line), timing (Extraction).
9. **The TikTok clip exists.** Every escort variant must produce a 15-second sealed watch moment that makes a viewer want to play the game.

---

## New Aspects Discovered

1. **5.08e-i — VIP stun vs. instant kill balancing:** Deep dive on the 3-tick stun window. Is 3 ticks too long (trivially rescued)? Too short (feels like instant kill with extra steps)? How does stun immunity cooldown work? Does stun duration scale with mission difficulty?
2. **5.08e-ii — Escort formation presets as accessibility layer:** Pre-built escort blueprint sets ("Diamond Formation," "Sensor Net," "Stealth Escort") that new players can use as templates. Interaction with 5.04a template-seeding. Reduces the cold-start problem for escort missions.
3. **5.08e-iii — Escort mission sound design vocabulary:** The VIP heartbeat, formation footsteps, stun crackle, rescue scramble audio — a complete audio vocabulary specific to escort missions that doesn't exist in other mission types. Interaction with 6.10 corruption audio.
4. **5.08e-iv — Dynamic escort formation visualization on Plan screen:** Ghost preview showing escort formation at each tick of the VIP's projected path. Shows coverage gaps, timing windows, perception overlaps. A planning tool unique to escort missions.
5. **5.08e-v — "The Silent Escort" as distinct mission archetype:** Escort + emissions model = stealth escort. Minimal communication, compressed signals, dark network tactics. The quietest escort wins. Distinct enough from standard escort to warrant its own mission design.
