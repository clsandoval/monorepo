# 3.10a — Hook Range as Spatial Mechanic: The Geography of Listening

## Overview

Hooks in Robot Uprising currently fire **globally** — any listener subscribed to a channel receives every signal broadcast on it, regardless of where the sender and receiver sit on the 8x8 grid. A scout in tile A1 fires a hook on `recon-net`, and a striker in tile H8 — seven tiles away, on the far diagonal — receives it instantly (plus signal latency from hop count). The physical distance between units is irrelevant to signal delivery. The grid is a battlefield for movement and combat, but a flat, dimensionless plane for communication.

This is a fundamental architectural decision. **Hook range** — the idea that a hook's signal only reaches listeners within a configurable spatial radius — transforms the grid from a movement surface into a **communication topology**. Distance stops being cosmetic and becomes the primary constraint on information architecture. The player no longer asks "which channels should my units listen to?" alone — they must also ask "can my units *hear* each other from where they're standing?"

The design question: should hooks have range? If so, how is range determined, how does it interact with the existing 1-tick-per-hop latency system, and what does it do to the relay unit's role in the game?

---

## The Range Spectrum: Four Approaches

### Approach A: Global Range (Current Default — "The Open Air")

**Philosophy:** Signals are radio broadcasts. Every listener on the channel receives every signal, everywhere on the board. Distance is irrelevant. The only constraint on communication is channel subscription and buffer capacity.

**How it works:** No change from the locked spec. A hook fires on channel `recon-net`. All units listening on `recon-net` receive the signal after hop-count-determined latency. A Scout in A1 and a Striker in H8 can communicate as easily as two units on adjacent tiles.

**Sensory description:** On the plan screen, channel wires run in colored dashed lines between all subscribed units regardless of distance. The wires span the entire board — long, confident arcs from corner to corner. There is no visual indication that distance matters, because it doesn't. During sealed watch, signal dots travel along these wires at 1-tile-per-tick, but the length of the wire only affects animation duration, not delivery success. The board looks like a circuit diagram overlaid on a battlefield — wires everywhere, connecting everything.

**Strengths:**
- **Zero spatial cognitive load.** The player thinks purely about information architecture — channels, hooks, rules, buffer management. Position matters only for combat and perception. This keeps the game focused on its core identity as a programming puzzle.
- **Relay positioning is simple.** Relays go wherever makes sense for hop reduction. No coverage calculation required.
- **Fewer "why didn't my unit receive the signal?" failures.** The answer is always "wrong channel" or "buffer full," never "too far away." Debugging stays in the information domain.
- **8x8 grid is small.** On a board this compact, range restrictions might feel arbitrary. The maximum distance between any two tiles is ~10 tiles (diagonal). Range limits on a board this size could feel like artificial constraints rather than meaningful spatial decisions.

**Weaknesses:**
- **No spatial signal strategy.** The entire domain of "relay positioning as infrastructure" doesn't exist. Relays are just hop-reducers and signal processors, not coverage extenders. The grid's spatial dimension is underutilized for the game's core mechanic (communication).
- **EM emission has no spatial falloff.** If hooks emit EM noise (per locked spec), but signals reach everywhere, EM is purely a detection cost with no spatial nuance. An enemy detects your emissions but the emissions have no geographic footprint.
- **The relay's identity problem.** Without range constraints, relays are compression/filter boxes. With range constraints, relays become infrastructure — the cell towers of the battlefield. The latter is a richer fantasy.
- **Misses the StarCraft pylon lesson.** The single most satisfying spatial mechanic in RTS history is the pylon power field — a glowing circle that defines where you can build. Range-limited hooks could create the same "coverage planning as mini-game" feeling.

---

### Approach B: Fixed Range Per Unit Type ("The Radio Tower")

**Philosophy:** Each unit type has a fixed broadcast range. Scouts broadcast short (range 2-3 tiles), relays broadcast medium-long (range 5-6 tiles), and Command units broadcast far (range 7-8 tiles, nearly board-wide). Range is a stat, like buffer size or hook slots. The player cannot change it — they adapt to it through positioning.

**How it works:** When a hook fires, the signal only reaches listeners within the sender's broadcast range. Range is measured in tile distance (Chebyshev distance — the max of horizontal and vertical difference, so diagonals count as 1). A Scout with range 3 in tile D4 can reach any unit within tiles A1 to G7. A Relay with range 6 in tile D4 can reach any unit on the board except H8, A8, H1 (corners beyond range 6).

**Proposed ranges:**
- **Scout:** Range 3. Short-range forward intelligence. Must be close to a relay or other unit to communicate. Creates the "forward observer" fantasy — scouts push ahead but need a relay within earshot.
- **Striker:** Range 2. Combat units communicate only with nearby allies. Tight squad coordination, not long-range reporting.
- **Relay:** Range 6. The backbone. A single relay in the center of the 8x8 board covers most tiles. Two relays in a staggered formation cover everything. This IS the relay fantasy — infrastructure that extends your communication reach.
- **Command:** Range 7. Nearly board-wide authority. The general doesn't need to be adjacent to issue orders, but a Command unit in a far corner has blind spots.

**Sensory description:** On the plan screen, selecting any unit reveals its **broadcast radius** as a translucent circle in the unit's type color — cyan for scouts, amber for relays, gold for command. The circle is a soft-edged glow, brightest at the unit's tile and fading toward the perimeter. Tiles outside the radius are subtly dimmed — not darkened completely, but the grid lines fade from white to grey. The effect is a warm pool of light around each unit, like a lantern in fog.

When the player drags a unit to reposition it during the plan phase, the circle moves with the ghost, and the tiles it covers shift in real-time. Overlapping circles blend their colors — a relay's amber overlapping a scout's cyan creates a warm green zone of dual coverage. Tiles covered by no unit's range pulse with a faint red outline on hover: **dead zones**. A tooltip reads: "No broadcast coverage. Units in this area cannot send or receive hook signals."

During sealed watch, when a hook fires, the broadcast circle flashes briefly — a quick sonar-ping ripple expanding from the sender to its range limit. The signal dot spawns and travels along the wire, but only toward listeners within the circle. Listeners outside the circle see nothing. The visual is immediate: the sonar ping hits the range boundary and dissolves. The signal stops. No delivery.

If a signal fails to reach a unit because it's out of range, the Inspector shows a **dashed grey wire** from sender to the out-of-range listener, with a small red X at the range boundary. The tooltip reads: "Signal lost — receiver outside broadcast range (distance: 5, range: 3)." The player sees exactly where the signal died and why.

**Strengths:**
- **Relay positioning becomes a first-class tactical decision.** "Where do I put my relays?" is now "where do I build my cell towers?" The player plans communication infrastructure before combat strategy. This matches the game's core thesis: you design the information architecture, not the combat moves.
- **Creates meaningful dead zones.** Tiles outside any unit's range are communication voids. An enemy that moves into a dead zone is invisible to your network. A scout pushed into a dead zone can't report. Dead zones are the spatial equivalent of buffer overload — loss of information, but caused by geography instead of capacity.
- **Fixed ranges are learnable.** The player memorizes "scouts reach 3, relays reach 6" and plans accordingly. No configuration complexity. The ranges become physical intuition, like knowing a rook moves in straight lines.
- **Naturally differentiates unit roles.** Scouts are close-range sensors that need relay support. Relays are the infrastructure backbone. Command units have authority range matching their organizational role. The range stat reinforces the unit's identity.

**Weaknesses:**
- **Range 6 on an 8x8 board covers almost everything.** A relay at D4 with range 6 covers all but the extreme corners. On a board this small, fixed ranges may not create enough dead zones to matter tactically. The mini-game degenerates into "put relay near center, done."
- **No player agency over range.** The player cannot trade range for stealth, or invest resources to extend range. It's a constraint to work around, not a knob to turn. For a game about configurable systems, a non-configurable stat feels like a missed opportunity.
- **Scout range 3 may be punishing.** A scout's entire purpose is forward observation. If it can only broadcast to units within 3 tiles, it must always have a relay escort. This could make scouts feel tethered rather than independent, reducing the "forward operating base" fantasy.
- **Diagonal weirdness.** Chebyshev distance means range 3 covers a square area, not a circle. On an isometric view, this square is rendered as a diamond. The mismatch between "range circle" language and diamond-shaped coverage could confuse players.

---

### Approach C: Configurable Range Per Hook ("The Tuning Dial")

**Philosophy:** Each hook has a range slider (1-8 tiles) that the player sets during the plan phase. Short range = quiet signal (low EM emission). Long range = loud broadcast (high EM emission). Range is a resource to allocate, not a fixed constraint.

**How it works:** In the hook configuration UI, each hook slot includes a **range dial** — a small circular slider from 1 to 8. The player sets the range for each hook independently. A scout might have Hook 1 (recon-net, range 2, stealth) and Hook 2 (emergency, range 8, board-wide alarm). The range setting affects:
1. **Delivery radius:** Only listeners within range receive the signal.
2. **EM emission:** EM noise scales with range. Range 1 emits minimal EM (barely detectable by adjacent enemies). Range 8 emits maximum EM (detectable from anywhere on the board). The scaling is quadratic — doubling range quadruples emission — because signal power must increase with the square of distance to maintain coverage.
3. **Context cost:** Higher range costs 1 additional context slot per 3 tiles of range beyond the base (range 1-3 = 0 extra, range 4-6 = 1 extra, range 7-8 = 2 extra). Broadcasting far requires more processing power.

**Sensory description:** The range dial appears as a small amber circle in the hook configuration strip, between the channel name and the trigger type. It resembles a volume knob on a mixing board — a circular arc from 1 to 8 with a bright notch indicating the current setting. As the player drags the notch clockwise (increasing range), the tactical preview on the board expands: a translucent amber ring grows outward from the unit's tile, tile by tile. At range 1, the ring barely extends beyond the unit. At range 8, it engulfs the entire board in warm amber light.

Crucially, as the range increases, a second visualization appears: the **EM footprint**. A red-tinted halo grows outside the broadcast ring, showing the area where enemies can detect the emission. At range 1, the EM footprint is invisible — the signal is a whisper. At range 4, a faint red shimmer appears outside the amber circle. At range 8, the red halo engulfs the entire board and bleeds off the edges — you are screaming into the void, and everything hears you.

The sound design reinforces this. At range 1, adjusting the dial produces a soft, intimate click — like tuning a pocket radio. At range 4, a low hum appears beneath the click. At range 8, the hum becomes a resonant buzz, almost uncomfortable — the player feels the volume increase through audio alone. The dial *feels* dangerous at high settings.

During sealed watch, low-range signals travel as thin, pale dots along short wires — subtle, easy to miss in the action. High-range signals travel as bright, pulsing dots along long wires with visible comet trails — impossible to miss, spectacular but exposing.

**Strengths:**
- **Range-as-resource creates meaningful decisions.** Every hook is a tradeoff: reach vs. stealth. The player designing a stealth network keeps all ranges at 1-2 and positions units close together. The player designing a rapid-response network sets emergency hooks to range 8 and accepts the EM cost. This is the game's core design philosophy — no free lunches, every configuration has consequences.
- **EM emission scaling is elegant.** The locked spec says hooks emit EM noise. Tying emission to range gives the player direct control over their electromagnetic signature. "Quiet networks" (short range, tight positioning) vs. "loud networks" (long range, scattered positioning) becomes a strategic axis. Stealth missions demand short range. Time-critical missions demand long range.
- **Per-hook granularity enables mixed strategies.** A scout can whisper routine intelligence on range 2 and scream emergencies on range 8. The hook's range becomes part of its semantic meaning — "this hook is important enough to broadcast far."
- **The tuning dial is a beautiful UI element.** It fits naturally into the hook configuration strip. The visual feedback (expanding ring + EM halo) teaches the mechanic instantly. The audio feedback (escalating hum) reinforces it. No text explanation needed.

**Weaknesses:**
- **Adds configuration complexity to every hook.** Current hook configuration: trigger + channel + payload. With range: trigger + channel + payload + range. On a Scout with 2 hook slots, this is manageable. On a Command unit with 6 hooks, the player is managing 6 range dials. Each dial requires a positioning decision. The workbench gets heavier.
- **Optimal range is often "just enough."** In practice, the player calculates the distance to the intended receiver and sets range to exactly that distance. The dial becomes arithmetic rather than strategy. "My relay is 4 tiles away, set range to 4." No real decision.
- **Context slot cost may over-punish.** If high-range hooks cost extra context slots, units with small context windows (scouts) can't afford long-range hooks anyway. The cost is redundant with the unit's inherent limitations. The scout's 2 hook slots and small buffer already limit its broadcast capability — adding context cost may be stacking penalties.
- **The 8x8 board size undermines range granularity.** Range 1 vs. range 8 on a board with maximum diagonal ~10 tiles doesn't create the sweeping tactical variation it would on a 16x16 or 32x32 board. The resolution is coarse — 8 range settings for 10 meaningful distances.

---

### Approach D: Range as Skill Modifier ("The Amplifier")

**Philosophy:** Base hook range is fixed and short (range 3 for all units). The **amplify** skill — one of the 12 locked skills — extends a unit's broadcast range. Range extension is earned through skill allocation and relay architecture, not through per-hook configuration.

**How it works:** Without amplify, all hooks broadcast at range 3. When a unit has the amplify skill equipped and active:
- **Relay with amplify:** Broadcast range extends to 6 (+3 tiles). The relay becomes a proper signal tower.
- **Command with amplify:** Broadcast range extends to 7 (+4 tiles). Board-wide authority.
- **Scout/Striker with amplify:** Broadcast range extends to 5 (+2 tiles). Moderate improvement, but costs one of their precious few skill slots.

The amplify skill consumes one of the unit's skill slots (Scouts have limited slots, so equipping amplify means unequipping something else — perhaps evade or patrol). This creates a skill-slot tradeoff: a scout with amplify can broadcast farther but cannot evade.

**Extension: Range Relay Chains.** A relay with amplify doesn't just extend its own range — it **rebroadcasts** received signals at its own extended range. This means a chain of relays with amplify creates a signal corridor across the entire board. Scout (range 3) → Relay A (receives at range 3, amplifies and rebroadcasts at range 6) → Relay B (receives at range 6, rebroadcasts at range 6) → Striker (receives at range 6 from Relay B). The relay chain IS the range extension. This is the cell-tower-chain fantasy made literal.

**Sensory description:** On the plan screen, the base range circle (range 3) appears as a translucent circle in the unit's type color — identical to Approach B. But when the player equips the amplify skill, the circle **expands with a visible pulse** — a ring of brighter color sweeps outward from the unit, and the coverage circle grows from 3 to 6 tiles. The expansion has a satisfying *whooomph* quality, like a sonar ping finding new territory. The newly covered tiles flash once — a gold shimmer — before settling into the extended circle.

When a relay chain is configured — multiple relays with amplify forming a corridor — the plan screen shows their overlapping circles as a **continuous coverage band**. The overlapping zones glow brighter (additive blending), creating a visible spine of strong signal running across the board. Dead zones between relays appear as dark gaps in the band. The player sees immediately: "my corridor has a gap between relay A and relay B — I need to move relay B one tile north."

During the sealed watch, amplified signals look different from base signals. Base-range signal dots are small and pale. Amplified signal dots are larger, brighter, and leave a longer comet trail — they look like they're carrying more energy. When an amplified signal crosses from one relay's range into the next relay's range (the handoff point), there's a brief double-flash at the relay as it receives and rebroadcasts. The chain of double-flashes across a relay corridor looks like lights on a runway, guiding the signal home.

The audio for amplified signals is distinct: a deeper, more resonant ping at each hop, compared to the higher-pitched blip of base-range signals. A three-relay amplified chain produces a descending three-note chime — *BONG... bong... bong* — as the signal hops closer to its destination. The pitch drops because the signal is traveling farther from its origin, a subtle audio cue for distance.

**Strengths:**
- **Amplify becomes the most tactically important skill for relay units.** Currently, amplify is one of 12 skills. Under this approach, it defines the relay's core function. A relay without amplify is a local processor. A relay with amplify is infrastructure. This gives the amplify skill a clear, unique identity that other skills don't compete with.
- **Relay positioning becomes "the tactical mini-game."** Building a relay chain across the board — calculating overlapping ranges, ensuring no dead zones, choosing where to place the corridor — IS the pre-battle planning game. It's Factorio logistics network planning compressed into 30 seconds on an 8x8 grid.
- **Skill-slot tradeoff creates real decisions.** A scout that takes amplify instead of evade can broadcast farther but dies faster. A relay that takes amplify instead of compress can reach farther but transmits raw data. These tradeoffs are the game's bread and butter.
- **Scales with campaign progression.** Early missions (before amplify is unlocked) force short-range, tight-formation play. When amplify unlocks (perhaps Mission 5-6), the board "opens up" — suddenly the player can spread units out and maintain communication. This is a dramatic expansion of possibility space that teaches through contrast.

**Weaknesses:**
- **Amplify skill becomes mandatory for relays.** If range is short without amplify, every relay must equip it. This reduces the relay's skill-slot diversity. The "choice" is illusory — you always take amplify.
- **No per-hook granularity.** A unit's range is binary: base or amplified. No ability to whisper on one hook and shout on another. The stealth-vs-reach tradeoff applies to the entire unit, not to individual communications. This is less expressive than Approach C.
- **Relay chain math may be tedious.** Calculating overlapping Chebyshev distances across 3-4 relays requires spatial arithmetic that may feel like homework rather than strategy. The plan screen must provide excellent visual tools (coverage circles, gap indicators) to avoid this.

---

## Recommended Approach: "The Signal Horizon" (B + D Hybrid)

Fixed ranges per unit type (Approach B) as the foundation, with amplify as the range extender (Approach D). The player learns the base ranges first (Scout 3, Striker 2, Relay 4, Command 5), then discovers that the amplify skill extends range by the unit's hook-slot count (Scout +2, Relay +4, Command +6). This progression mirrors the game's campaign arc: early missions teach formation (stay close), mid-missions unlock amplify (spread out), late missions require relay corridor planning (build infrastructure across the board).

Per-hook configurable range (Approach C) is deferred — it adds workbench complexity without proportional tactical depth on the 8x8 board. However, the EM-scales-with-range principle from Approach C is preserved: amplified signals emit more EM than base-range signals. The amplify skill is loud. Infrastructure is detectable.

---

## Player Journeys

#### Journey: Mika, 14, First-Time Strategy Game Player

The plan screen shows Mission 4: two scouts, one relay, one striker. Mika has been placing units near the center of the board, close together, because that's what worked in Missions 1-3. She drags Scout-A to tile B2 — the far corner, near where enemy movement was detected last mission.

The moment she drops the scout, a translucent cyan circle appears around it. Three tiles in every direction. The circle covers B1 to E5. But the relay is on tile F4. She hovers over the wire connecting Scout-A to the relay. A dashed grey line appears with a small red X at the circle's edge. A tooltip fades in: "Signal lost — receiver outside broadcast range (distance: 4, range: 3)."

She stares at the screen. "It can't reach."

She drags Scout-A one tile closer — to C3. The cyan circle shifts. Now the relay on F4 is still outside — barely. Distance: 3.16... rounded up to 4 in Chebyshev. She drags to C4. The circle shifts again. The relay at F4 is now 3 tiles away. The dashed grey line transforms into a solid colored wire. The red X disappears. The tooltip changes to green: "Signal path: Scout-A → Relay-A | Latency: 1 tick."

"There." She grins. But now the scout is only two tiles from center. It won't see the enemy approach from the corner. She looks at the scout, then the relay, then the corner. She thinks: "I need the relay closer to the scout. Or..." She looks at the relay's amplify skill, still locked — Mission 5. She reads the greyed-out tooltip: "Amplify: Extends broadcast range by 4 tiles."

For the first time, she understands what the relay is *for*. It's not just a box that compresses signals. It's a signal tower. And she needs it closer to her scouts.

She repositions the relay to D3. Both scouts are within range. The striker at E5 is within range. The board is tighter, more compact. She hits EXECUTE.

During the sealed watch, the scout spots the enemy at tick 3. A cyan circle flashes outward — the sonar ping — and a signal dot races from the scout to the relay. One second. The relay's amber circle flashes — rebroadcast — and the dot races to the striker. One more second. Two ticks total. The striker pivots and moves to intercept. The timing works because the formation was tight enough.

After the match, she opens the Inspector and scrolls to tick 3. She clicks the scout. The range circle appears in the timeline view: a 3-tile radius frozen at the moment of broadcast. Every unit within the circle is highlighted. The relay, just inside. The striker, just inside. She sees how close she cut it. One tile farther and the signal would have died.

She whispers to herself: "Mission 5. Amplify. I can spread out."

#### Journey: Datu, 32, Network Engineer, Gauntlet Rank: Operative

Datu loads the Gauntlet map: 8x8, jungle terrain (signal interference reduces all ranges by 1). His standard build: two scouts forward, relay chain through the center, command unit at the back, two strikers mid-board. But jungle terrain means his relay range drops from 4+4 (amplify) = 8 to 7. And his scouts drop from 3+2 = 5 to 4.

He studies the coverage. His relay chain of two units, positioned at C4 and F4, normally covers the entire board. But with the -1 jungle penalty, there's a dead zone at tiles A1-A2 and H7-H8. The corners are dark.

His opponent in the last match exploited exactly this — running a striker through the dead corner to flank his command unit. Datu lost in 12 ticks. The Inspector showed the kill shot: his scout spotted the flanking striker at tick 8, fired a hook, signal died at the range boundary. The red X in the Inspector was seared into his memory.

Today he restructures. He pulls one relay to B3 — covering the A-column corner. The second relay stays at F5 — covering the H-column corner. But now the relays are 5 tiles apart. His relays have amplified range 7 (8 base minus 1 jungle). Distance between relays: 4 tiles (Chebyshev from B3 to F5). Still within mutual range. The relay-to-relay wire stays solid.

But the command unit at D1 is now 3 tiles from relay-B3 (within range) but 5 tiles from relay-F5 (within range 7 — fine). He traces every wire. Every range circle overlaps with at least one other. No dead zones. Full coverage.

He checks the EM overlay. Two relays with amplify running at range 7 produce significant EM. The combined EM footprint covers the entire board in a faint red haze. His opponent will know he's running a relay network — the emission pattern is distinctive. But he'll have coverage everywhere.

He considers an alternative: drop amplify on one relay. Replace with compress. That relay runs at base range 4 (minus 1 jungle = 3). Much quieter. But now there's a dead zone in one corner again. He weighs: full coverage + loud, or partial coverage + stealthy?

He splits the difference. Relay-B3 keeps amplify (covering the dangerous flank corner). Relay-F5 drops amplify for compress (shorter range but processes intelligence). He repositions Relay-F5 to E5 — one tile closer to center — to compensate for the shorter range. The wire from command to Relay-F5 still holds. One corner (H7-H8) goes dark.

He places his striker at G6, within Relay-F5's base range. If anything comes through the dark corner, the striker is there to meet it in combat — no signal needed, just proximity.

He hits deploy. Watches the sealed watch. At tick 6, the opponent's scout enters the dark corner at H8. Nothing happens — no signal, no detection. But at tick 7, the scout moves to G7 — one tile into the striker's patrol zone. The striker spots it directly (no hook needed, just perception). Engage fires. One shot. The opponent's scout crumples.

Datu leans back. "Range is infrastructure. But sometimes you don't need infrastructure. You need a guard dog."

#### Journey: Prof. Adaora, 52, CS Professor, Teaching Distributed Systems

Prof. Adaora projects the Robot Uprising plan screen onto the lecture hall display. Twenty-three undergraduates watch. Today's lesson: wireless network topology and coverage planning.

"This," she says, tapping the relay unit, "is a wireless access point. Its range" — she clicks it, and the amber circle expands to 4 tiles — "is its coverage radius. The question isn't where to put ONE access point. The question is where to put four of them so that every tile has coverage and no signal has to hop more than twice to reach the command unit."

She drags four relays onto the board, spacing them evenly. The coverage circles overlap in a neat grid pattern. Every tile on the 8x8 board is covered by at least one relay. She enables amplify on two of them — the circles expand, eating the remaining gaps.

"Now watch what happens when I add terrain." She selects the jungle map modifier. All ranges drop by 1. Suddenly, gaps appear in the coverage — thin dark lines between the shrunken circles. Two tiles in the center go dark. The students murmur.

"This," she says, "is the hidden node problem. In 802.11 wireless, two stations can both reach the access point but not each other. Here, two scouts can both reach relay A, but relay A can't reach relay B because the jungle ate one tile of range. Your entire network partitions."

She repositions one relay closer. The gap closes. But now the coverage on the far side thins. She shows the tradeoff. A student raises her hand: "Can you just amplify all of them?"

"You can. But amplify costs a skill slot. And amplified relays emit four times the EM of base relays. In a real wireless network, higher transmit power means more interference. Here, it means the enemy detects you sooner. Full coverage at the cost of full visibility."

She hits EXECUTE. The sealed watch plays. Both teams' relays are running amplify. The board is a sea of overlapping amber and cyan circles. Signals race everywhere. At tick 4, a cascade of hooks fires — six signals in two ticks, the board lighting up like a switchboard. But the EM overlay shows both teams' positions clearly. Every unit is visible through its emissions. The battle devolves into a mutual slugfest — no stealth, no surprise, just raw coordination speed.

"Full coverage, zero stealth. Now compare." She loads a student's config from last week — two relays, no amplify, tight formation. The coverage circles are small, concentrated in one quadrant. The EM overlay is nearly invisible — the network is whispering. An enemy scout enters the covered quadrant at tick 3 and is immediately detected, flanked, and eliminated. The enemy's other scouts, in the uncovered quadrant, wander freely — but there's nothing there to protect. The student deliberately left three quadrants dark, concentrating all assets in one defensible zone.

"This student independently discovered the cell-clustering strategy from 4G LTE network planning. Small cells, tight coverage, low interference. The game taught her wireless network design without a single equation."

The students lean forward. A hand goes up: "What if you put relays at the edges and used directional range instead of circular?"

Adaora smiles. "That's aspect 3.10a-ii — directional antennas. We'll get there."

---

## Strengths and Weaknesses Summary

**Strengths of range as a mechanic:**
- Transforms the grid from movement surface to communication topology — the 8x8 board does double duty
- Relay positioning becomes a satisfying spatial puzzle (the "coverage planning mini-game")
- Creates dead zones as meaningful battlefield features — gaps in coverage are exploitable
- EM emission scaling with range creates a stealth-vs-reach tradeoff axis
- Teaches real-world network concepts (coverage radius, hidden node problem, relay chains) through play
- The amplify skill gains clear tactical identity as range extender, differentiating it from other skills
- Progressive unlock (base range early, amplify mid-campaign) creates a dramatic expansion of player agency

**Weaknesses of range as a mechanic:**
- 8x8 grid may be too small for range to create enough meaningful dead zones — at range 6, a centered relay covers 90%+ of the board
- Adds spatial calculation to every plan phase — some players want to think about information architecture, not geometry
- Risk of "mandatory amplify" on relays, reducing skill-slot diversity
- Chebyshev distance (square coverage) vs. Euclidean (circular coverage) creates visual confusion on the isometric grid
- Debugging "signal lost — out of range" adds a new failure mode that may frustrate beginners before it teaches them
- Range visualization (circles, EM halos) adds visual complexity to an already information-dense plan screen

---

## Interaction Effects

### Signal Latency (1 tick per hop)
Range and latency are independent but compounding constraints. A short-range scout (range 3) forces relay placement within 3 tiles — which means 1 hop, 1 tick latency. But if the scout needs to report to a command unit 7 tiles away, the signal must hop through 2-3 relays: 3 ticks of latency. Range creates the need for relay chains; latency is the cost of those chains. The player optimizing for speed wants flat architectures (few hops), but range constraints force deep architectures (many hops through relays). This tension is the heart of the spatial mini-game: **range says "you need relays," latency says "fewer relays is better."**

### EM Emissions
EM emission scaling with range (quadratic in Approach C, binary in B/D) creates a detection surface that the enemy can read. A player running amplified relays across the board creates a distinctive EM signature — the opponent sees "two high-emission sources at B3 and F5, looks like a relay corridor." The opponent can then plan their approach through the dead zones between the corridors, or send a striker to eliminate the relay (one-shot-one-kill on a relay collapses the range network). EM emission from range makes relay positioning a double-edged sword: relays extend your reach but advertise their location.

### Relay Unit Role
Without range, relays are signal processors (compress, filter, amplify). With range, relays become **infrastructure** — the cell towers, the backbone, the load-bearing pillars of the communication network. Destroying a relay doesn't just lose a processor; it creates a dead zone in your coverage. This elevates the relay from "useful utility" to "critical infrastructure" and creates the asymmetric target-priority dynamic that makes tactical games interesting. "Kill the relay first" becomes a viable strategy because the relay's death doesn't just remove a unit — it partitions the network.

### The 8x8 Grid Size
The board is small. Maximum Chebyshev distance is 7 (corner to corner). A relay with amplified range 8 covers everything from a corner. This means range constraints only bite when: (a) terrain reduces range, (b) the player doesn't equip amplify, or (c) multiple units need independent coverage areas. The recommendation: terrain modifiers should frequently reduce range (jungle -1, storm -2, jamming terrain -3) to make range planning relevant on most maps. Without terrain interaction, range is too easy to solve on 8x8.

### Map Terrain
Terrain is range's best friend. Jungle reduces range by 1. Urban terrain blocks line-of-sight for signals (requiring relays to route around buildings). Mountain tiles boost range by 1 for units on high ground. Water tiles cannot host units but signals can cross them (range still applies). Storm tiles temporarily reduce range by 2 for 3 ticks. This terrain vocabulary transforms range from a static constraint into a dynamic, map-specific puzzle. The player must study the map before deploying — "this jungle corridor cuts my relay range, I need a third relay" — which is exactly the pre-battle planning behavior the game wants to encourage.

### Production Queue (Building Relay Chains)
If the game includes production (spawning units mid-match), relay chains become a **construction sequence problem**. The player must build relays in order from back to front — each relay must be within range of the previous one before it can receive build orders. Building a relay chain across the board takes multiple production ticks. An opponent who destroys a mid-chain relay forces a rebuild that takes several ticks — during which the forward scouts are cut off. Relay chains as production-dependent infrastructure create a macro-economic dimension to range planning.

---

## Comparable Games

### StarCraft Pylon Fields
The Protoss pylon creates a circular power field; buildings can only be placed within it. Pylon placement is a spatial puzzle: maximize coverage, minimize pylons (they cost resources), avoid chaining too deep (one snipe removes coverage for multiple buildings). **Exact parallel:** relay placement for hook range IS pylon placement for building coverage. The "pylon snipe" (killing a pylon to depower buildings) maps to "relay snipe" (killing a relay to create dead zones). StarCraft proved that circular coverage planning is inherently satisfying — players spend significant time on pylon geometry.

### Factorio Logistics Networks
Roboports create circular logistics zones. Items can be transported by logistics robots only within connected zones. Players build chains of roboports across the factory to extend coverage. The "logistics network" is visible as colored circles on the map. **Key lesson:** Factorio's logistics network is one of the game's most satisfying systems because coverage planning is visible, spatial, and has clear failure modes (gaps in coverage = items don't move). Robot Uprising's relay range creates the same satisfaction on a tactical timescale.

### XCOM Squad Sight
In XCOM, snipers with the Squad Sight ability can fire at any enemy visible to any squad member, regardless of the sniper's personal line of sight. This creates a "coverage network" — the team's collective perception is the sniper's firing range. **Translation:** in Robot Uprising, a relay with amplify extends the "squad sight" of the communication network. A scout spots an enemy, and any striker within the relay's range can act on that intelligence. The relay is the connective tissue that turns individual perception into collective action.

### RTS Radio Tower Mechanics (Company of Heroes, Men of War)
Several RTS games implement "radio range" or "command radius" — units must be within range of a command unit to receive orders or benefit from leadership bonuses. Units outside command range suffer morale penalties or act autonomously (often poorly). **Translation:** Robot Uprising's hook range is the formalized version of command radius. The Command unit's range 5-7 defines its area of authority. Units outside command range don't receive reassignment orders. The "out of range" failure is the same as the "out of command radius" morale break — but expressed through signal architecture rather than stat modifiers.

### Into the Breach Consequence Preview
Into the Breach shows the exact consequences of every action before the player commits. **Translation:** the range circle on the plan screen is a consequence preview — the player sees exactly which units can and cannot communicate before deploying. The red X on out-of-range wires is the equivalent of Into the Breach's red damage preview. The principle is identical: perfect information creates meaningful decisions. The player doesn't discover range failures during battle; they see them during planning and fix them.

---

## Sensory Descriptions

### Plan Screen — Range Visualization
The plan screen is quiet before placement. An 8x8 grid of dark tiles with faint isometric grid lines. The player drags a relay from the production tray to tile D4. The moment it lands, a **soft amber pulse** expands from the tile — not a hard circle, but a warm glow that fades at the edges, like candlelight in a dark room. The glow covers a diamond of tiles (Chebyshev distance rendered isometrically). Tiles within range brighten slightly. Tiles outside range stay dark. The boundary between lit and dark is not a hard line — it's a gradient over one tile width, creating a soft horizon effect. This is the **signal horizon**.

When the player equips amplify on the relay, the horizon **pushes outward** with an audible *whooomph* — a deep, satisfying bass pulse like a speaker cone pushing air. The newly covered tiles shimmer gold for 400ms before settling to the standard amber glow. The expansion feels physical, like the relay is projecting force.

Multiple units' ranges blend additively. Two overlapping amber circles create a brighter center. A scout's cyan circle overlapping a relay's amber creates teal. The plan screen becomes a topographical map of communication density — bright areas are well-covered, dark areas are dead zones. The player reads the map like a heat map: hot zones are safe, cold zones are dangerous.

Dead zones pulse with a faint **crimson thread** along their borders — not alarming, but noticeable. If the player hovers over a dead zone tile, a quiet audio cue plays: a low, descending two-note tone, like a phone losing signal. The tooltip reads: "No broadcast coverage."

### Battle Screen — Range in Action
During sealed watch, range is invisible unless a signal fires. When a hook triggers, the sender's range circle flashes into view for exactly 1 second — a sonar-ping ripple expanding from the unit to its range limit. The ripple is the unit's type color (cyan for scout, amber for relay) and fades from bright at the center to transparent at the edge.

Successful signal delivery: the dot spawns and races along the wire, accompanied by a bright ascending chime. The receiver flashes when the signal arrives — a small, satisfied pulse.

Failed signal delivery (out of range): the dot spawns, races along the wire, and **dissolves into static** at the range boundary. The wire flickers red for 200ms. A descending minor-third tone plays — *doh-dah* — quiet but unmistakable. The signal dies mid-flight. The receiver never reacts. The absence of response is the failure.

For relay chains, each hop produces its own sonar ping and signal dot. A three-relay chain creates a sequential cascade: *ping*... dot travels... *ping*... dot travels... *ping*... dot arrives. The rhythm of the pings is the latency made audible. Fast chains (1 hop) are a single quick *ping-arrive*. Slow chains (3 hops) are a measured *ping... ping... ping... arrive*. The player hears the speed of their network.

### Inspector — Range Forensics
In the post-battle Inspector, the player can toggle a **Range Overlay** that shows every unit's broadcast radius at any tick. Scrubbing through the timeline shows how unit movement changed coverage — a scout that moved from D4 to D7 shifted its coverage circle, potentially leaving a relay outside range at tick 6.

Failed signals appear as **dashed grey wires** with red X markers at the range boundary. Hovering the X shows: "Tick 6: Scout-A fired on recon-net. Signal reached range boundary at 3 tiles. Relay-A was 4 tiles away. Signal lost." The player sees exactly when and where their range failed, and the Inspector's counterfactual mode asks: "Move Scout-A 1 tile closer? Re-simulate."

The range overlay in the Inspector uses the same visual language as the plan screen — amber circles, cyan circles, crimson dead zone borders — creating continuity between planning and diagnosis. The player trained to read the plan screen's range map can immediately read the Inspector's range forensics.

---

## New Aspects Discovered

- **3.10a-i — Directional hook range:** non-circular broadcast patterns (cone-shaped, forward-only, directional antenna) as an advanced unlock; interaction with unit facing/orientation on the isometric grid
- **3.10a-ii — Terrain signal modifiers catalog:** full taxonomy of terrain effects on hook range (jungle absorption, mountain boost, urban occlusion, storm interference, jamming tiles); how terrain transforms range planning per map
- **3.10a-iii — Range visualization toggle for spectators/streamers:** simplified vs. detailed range overlays; "comm net" spectator mode that shows only coverage topology, not individual unit details; interaction with 1.13c spectator legibility
- **3.10a-iv — Dynamic range during battle:** range changes from movement, terrain transitions, skill activation/deactivation, and unit destruction; the "coverage collapse" event when a relay dies mid-match and the network partitions live
- **3.10a-v — Range-based matchmaking map design:** maps designed specifically to stress range constraints (narrow corridors, island clusters separated by no-deploy water, mountain ridges that boost range for hilltop units); range as a map-design dimension alongside terrain and spawn points
