# The Gauntlet Rotation Meta-Structure: How Gauntlet Cycles Through Mission Types

**Aspect:** 5.08d — The Gauntlet Rotation meta-structure: how Gauntlet cycles through mission types; rotation schedule as meta-puzzle
**Category:** Onboarding / Gauntlet / Competitive
**Wave:** 5 (Campaign & Progression)
**Related aspects:** 5.22 (Gauntlet as third act), 7.01 (PvP attention vs. attention), 1.09c (cumulative Gauntlet modifiers), 5.08a (Phase Shift missions), 5.09a (blueprint presets as replay currency), 5.08c (mission type as difficulty language)

---

## The Core Design Problem

The Gauntlet is Robot Uprising's infinite endgame: asynchronous PvP where attention architectures fight other attention architectures. But "infinite" has a structural risk. If the Gauntlet is always the same map pool, the same conditions, the same available units, the meta crystallizes. A dominant architecture emerges. Players who found it climb; players who didn't copy it or quit. This is the Gladiabots stagnation problem — when the metagame solves itself, the game is over.

Rotation is the answer. Not rotation as cosmetic variety — not "this week's map is different" — but rotation as a recurring disruption event that invalidates portions of your configuration library and forces re-engagement with the design tools. The rotation is a meta-puzzle layered on top of the match-level puzzle. You are not just building an architecture that beats your opponent; you are building an architecture that beats your opponent *under this week's constraints*.

The question is: how does the rotation work, what does it rotate, and how does the announcement/preview/transition feel?

---

## The Rotation Anatomy

### What Rotates

The Gauntlet rotation has four independent axes, each on its own schedule:

**1. Map Pool (Weekly)**
The active map pool contains 5 maps drawn from a permanent pool of ~20. Each week, 2 maps rotate out and 2 rotate in. One slot is the "Featured Map" — a new or recently revised map given spotlight placement in the queue UI. Featured maps run for two consecutive weeks before entering the permanent pool or retiring to the vault.

Maps are not cosmetic. Each map has terrain features (chokepoints, elevation, destructible cover, emission-absorbing fog zones, relay-advantageous ridgelines) that favor different architectural approaches. A map with long sightlines and open terrain rewards scout-heavy perimeter architectures. A map with dense urban blocks and narrow corridors rewards close-range striker swarms with hook-based coordination. Changing the map pool changes what wins.

**2. Mutators (Biweekly)**
Mutators are rule modifications that alter the match conditions. Each biweekly rotation activates 1-2 mutators from a catalog of ~15. Examples:

- **Fog of War:** Perception cones reduced by 40%. Units cannot see beyond their immediate surroundings. Rewards aggressive scouting and relay chains for information forwarding.
- **Restricted Arsenal:** 3 of the 12 skills are locked for the rotation. Players must build around the gaps. If compress and filter are locked, context management becomes manual — you need architectural solutions (smaller buffers, more relays) instead of skill-based solutions.
- **Resource Drought:** Starting materials halved. Production queue decisions become existential. Do you build 4 cheap scouts or 1 expensive command agent? The factory becomes a rationing problem.
- **Signal Jamming:** Hook range reduced by 50%. Inter-agent communication requires physical proximity. Distributed architectures collapse; tight cluster formations thrive.
- **Accelerated Tick:** Match speed doubled. Architectures with long decision chains (deep rule trees, multi-hop relay networks) fall behind architectures with shallow, fast reactions.
- **The Blackout:** No EM emissions from any unit. Stealth-based strategies lose their detection advantage. Everyone is invisible. Everyone is blind beyond perception range.

Mutators interact with each other. Fog of War + Signal Jamming creates a suffocating information desert where units operate nearly autonomously. Resource Drought + Restricted Arsenal creates brutal optimization puzzles. The biweekly schedule means mutator combinations shift at a different cadence than map rotations, creating a combinatorial variety that resists meta-solving.

**3. Mission Type Emphasis (Monthly)**
Each month, one mission type receives a weighting bonus in the matchmaking queue. If "Relay Network" is the monthly emphasis, players are more likely to be matched on maps and conditions that favor relay-heavy play. This is softer than a hard requirement — you still encounter all mission types — but the emphasis shifts the meta conversation toward a particular architectural family.

**4. Seasonal Themes (Quarterly)**
Four times a year, a seasonal event reshapes the entire Gauntlet for 2-3 weeks. Seasonal themes introduce temporary mechanics not present in the base game — environmental hazards (ion storms that periodically disable electronics, terrain that shifts between ticks), NPC factions (neutral units that attack both players unless bribed with resources), or asymmetric starts (one player begins with a factory, the other with pre-placed elite units). Seasonal events have their own leaderboard, separate from the main Gauntlet rating.

### Random vs. Curated vs. Seasonal

The rotation is **curated, not random.** A design team (or, post-launch, a rotation committee informed by telemetry) selects each week's map pool and each biweekly mutator set. The curation serves two purposes:

1. **Pedagogical sequencing.** Early rotations after a player enters the Gauntlet feature simpler mutators (single mutator, familiar maps). As the player's career progresses, they encounter more complex combinations. The system tracks which mutator combinations a player has experienced and gently prioritizes novel ones.

2. **Meta disruption targeting.** If telemetry shows that 60% of Diamond-tier players are running scout-rush variants, the next rotation can introduce Fog of War (which punishes scouts' reliance on wide perception) or Signal Jamming (which breaks their relay-dependent information chains). The rotation is a balance lever — not patching units, but changing the environment so that different architectures become optimal.

The curation is published as a **Rotation Forecast** — a 4-week lookahead visible in the Gauntlet lobby. Players can see the upcoming map pool and mutator set before they arrive. This transforms rotation from a surprise disruption into a *planning horizon*. The meta-puzzle is not "react to what happened" but "prepare for what's coming."

### How New Maps Enter Rotation

New maps follow a three-stage pipeline:

1. **Community Workshop.** The mission editor (5.08b) lets players create custom maps. Maps with high play counts and positive ratings in the Workshop are flagged for review.
2. **Featured Map Trial.** Selected maps enter the Featured Map slot for two weeks. During the trial, telemetry tracks win rates, average match length, architecture diversity, and player-reported "fun" ratings.
3. **Permanent Pool or Vault.** Maps that pass the trial join the permanent pool (~20 maps). Maps that don't are "vaulted" — available in custom matches but removed from ranked rotation. Vaulted maps can be recalled for seasonal events or special rotations.

### The Preview Period

Each rotation has a **48-hour preview window** before it goes live. During the preview:

- The upcoming map pool and mutators are visible in the Gauntlet lobby.
- Players can enter a **Rotation Lab** — an unranked sandbox where they can test configurations against AI opponents under the new conditions. The Lab uses the same maps and mutators that will go live.
- The community discussion channels (Discord, Reddit, in-game forums) light up with rotation prediction threads, counter-strategy debates, and config-sharing for the new conditions.

The preview is not optional downtime. It is *part of the competitive loop.* The players who spend 48 hours in the Lab experimenting with new architectures for Signal Jamming + Urban Corridor maps have an advantage over players who queue blind on rotation day. The preview rewards preparation, theory-crafting, and community engagement — the same skills the campaign taught through the Predecessor's guidance and the Inspector's diagnostic tools.

---

## Player Journeys

#### Journey: Ren, 29, DevOps Engineer, Gold Tier Gauntlet Regular

**Context:** Ren has been playing Robot Uprising for six weeks. He finished the campaign in the first weekend and has been climbing the Gauntlet since. His main architecture is a relay-chain with scout perimeter — versatile, solid, what got him through Gold. It is Tuesday evening. He opens the game and sees the Rotation Forecast panel in the Gauntlet lobby.

**Minute 0:00 — The Forecast**
The Gauntlet lobby's left panel shows the current rotation: Coastal Ridgeline, Foundry District, Signal Relay Hub, Overgrown Interchange, and the Featured Map "Volcanic Caldera" (new this week). Mutators: Fog of War. Below the current rotation, a translucent divider line labeled "NEXT ROTATION — 3d 14h" separates the upcoming set. Two maps rotating out are dimmed and crossed with a faint red diagonal. Two incoming maps glow with a soft amber border: "Subterranean Complex" and "Tidal Flats." The next mutator pair glows beneath: "Resource Drought + Accelerated Tick."

Ren's stomach drops. Resource Drought means his relay chain — which requires 6 units before it reaches operational coverage — might not get built in time. Accelerated Tick means his deep rule trees (7-condition cascades per blueprint) will process too slowly relative to simpler architectures. His Gold-tier workhorse is about to become a liability.

**Minute 0:30 — The Lab**
He clicks "ROTATION LAB" — a teal button that pulses gently beside the forecast panel. The screen transitions to the Plan screen, but the header bar reads "ROTATION LAB — UNRANKED" in teal instead of the usual amber. The map selector shows only the incoming rotation's five maps. The mutator badges are pre-applied: a cracked coin icon for Resource Drought, a double-arrow icon for Accelerated Tick.

He loads his relay-chain config and runs it against the Medium AI on Subterranean Complex. The sealed watch begins. His factory queues 6 relay units. By tick 12, he has burned 80% of his starting materials on relays alone, leaving nothing for strikers. The enemy AI — running a cheap 3-scout rush — overwhelms his half-built chain at tick 20. The match lasts 34 seconds of real time because of Accelerated Tick. The debrief shows his production curve as a steep cliff: all resources spent in the first quarter, nothing left for adaptation.

**Minute 4:00 — The Redesign**
Ren opens a new blueprint tab. He starts from scratch: a 3-unit architecture. One command agent with broad perception. Two strikers with minimal rule trees (2 conditions each — engage if hostile in range, retreat if health below 30%). No relays. No chain. The architecture is ugly by his standards — no elegance, no information forwarding, just brute reaction. He names the blueprint "DROUGHT_RUSH_v1."

He runs it in the Lab. The match lasts longer. His 3 units deploy by tick 4 (cheap, fast). The strikers engage immediately. The command agent repositions them based on what it sees. No hooks, no inter-agent communication — just the command agent's direct perception driving reassign orders. He wins against Medium AI. He loses against Hard AI. He tweaks the command agent's rule priority, swapping "engage nearest" to "engage weakest." He wins against Hard.

**Minute 12:00 — The Deploy Decision**
The current rotation still has 3 days. Ren could keep running his relay chain in the current Fog of War meta (where it excels — relays pierce fog by forwarding information across the map). Or he could start practicing the drought build now, accepting short-term rating loss for long-term readiness. He checks the Gauntlet lobby's "Rotation History" tab — a scrollable timeline showing past rotations, his win rate in each, and which configs he used. His Fog of War win rate is 67%. His last Resource Drought rotation (three weeks ago) was 41%.

He deploys DROUGHT_RUSH_v1 into the current rotation as a secondary ghost. His primary relay chain stays deployed. The system will match him using whichever config the opponent's rating bracket suggests. He closes the game, opens Discord, and searches for "resource drought" in #gauntlet-strategy. Fourteen new posts since the forecast went live.

---

#### Journey: Hana, 17, High School Student, Bronze Tier, Two Weeks Post-Campaign

**Context:** Hana finished the campaign last week. She loved the narrative — the Predecessor's gradual silence, the Warden fight, the boot log completion. She entered the Gauntlet cautiously and has been hovering in Bronze, running the same architecture she used to beat Mission 10: a balanced 5-blueprint setup with one of everything (scout, relay, striker, command agent, reserve). She does not yet think about rotations. She treats the Gauntlet as "more missions."

**Minute 0:00 — The Rotation Arrives**
Hana opens the Gauntlet on Thursday. The lobby looks different. The header bar, normally a steady amber, pulses with a slow cyan wash — the rotation transition animation. A banner at the top reads: "NEW ROTATION ACTIVE" with the date range. Below it, the mutator badges: a crossed-out skill icon (Restricted Arsenal — Compress, Filter, and Hack are locked) and a shrinking circle icon (Fog of War).

She doesn't process the mutator implications. She queues for a match. The map is Subterranean Complex — tight corridors, low ceilings, no long sightlines. Her balanced architecture deploys. Her scouts, configured with wide perception cones, see nothing useful in the tight corridors — their range is wasted. Her relay, configured to compress incoming signals, cannot compress — the skill is locked. The relay's context window floods with raw, unfiltered signals. By tick 15, the relay is processing noise. By tick 20, her command agent — relying on the relay's forwarded intelligence — issues contradictory orders based on garbage data. She loses.

**Minute 3:00 — The Debrief Revelation**
The Inspector opens. She clicks on her relay unit. The context window panel shows 14 signals, 11 of which are noise (enemy emissions bouncing off corridor walls). Normally, compress would have reduced these to 3 clean signals. A small amber notice at the bottom of the panel reads: "[compress] LOCKED — Rotation: Restricted Arsenal." She stares at it. For the first time, she understands what compress *was doing for her* — because now it is gone.

She opens the Rotation Lab (she noticed the teal button for the first time during the loss screen's "Try Rotation Lab?" prompt). She loads her config and looks at the relay blueprint. Without compress, what can she do? She remembers Mission 4 — the first time she configured context windows. The Predecessor's voice in her memory: "Your agents see everything. Your job is to decide what matters." She manually tightens the relay's perception cone from 120 degrees to 45. She adds a rule: "If signal source is further than 3 tiles, ignore." She runs the Lab match. The relay's context window shows 4 signals, all relevant. She wins.

**Minute 8:00 — The Conceptual Shift**
Hana realizes something: the rotation taught her what the campaign couldn't. The campaign gave her compress as a tool. The rotation took it away and forced her to understand the *problem* compress solves. She opens her blueprint notes (a text field in the Plan screen) and types: "compress = auto-filter for noise. without it: tighten perception + distance rules. remember this."

She is no longer treating the Gauntlet as "more missions." She is treating it as a design laboratory where the constraints change and her understanding must deepen. She queues for a ranked match with her modified config.

---

#### Journey: Dmitri, 42, Software Architect, Diamond Tier, Twitch Streamer (2.4K Followers)

**Context:** Dmitri streams Robot Uprising three nights a week. His content calendar is built around the rotation schedule. He publishes a "Rotation Breakdown" video on the first day of each new rotation and a "Meta Report" video on the last day. His audience watches him theory-craft builds in the Lab, test them live, and then deploy them in ranked. The rotation schedule IS his content schedule.

**Minute 0:00 — The Forecast Drop**
It is Saturday. The rotation forecast updates at midnight UTC. Dmitri has a stream scheduled for Sunday titled "FORECAST REACT — What's Coming in Rotation 14." He opens the Gauntlet lobby at 12:05 AM. The Forecast panel updates with a subtle animation — the upcoming rotation's cards flip from the muted "PENDING" state (grey, face-down) to full visibility. The maps fan out like dealt cards: Canyon Network, Signal Relay Hub, Tidal Flats (returning from vault), Factory Ruins, and Featured Map "The Antenna Farm" (community-designed, first ranked appearance). The mutator badges materialize: Signal Jamming + The Blackout.

Dmitri exhales. Signal Jamming (hook range halved) plus The Blackout (no EM emissions) is the most information-hostile combination possible. Units cannot communicate over distance. Units cannot detect each other passively. The only information source is direct visual perception — what each unit sees with its own sensors. This rotation will annihilate every relay-chain architecture in Diamond tier. It will reward autonomous units with robust local rule sets that make good decisions independently.

He opens OBS, starts his stream overlay, and begins talking.

**Minute 2:00 — The Theory-Craft Stream**
"Chat, this is the autonomy rotation. If your architecture needs hooks to function, you're dead. If your command agent is doing all the thinking, you're dead. Every unit needs to be a self-contained decision-maker." He opens the Plan screen on stream, sharing his blueprint editor. He starts designing what he calls "The Lone Wolf Doctrine" — a single blueprint where every unit has a complete rule set (12 conditions, covering every scenario: engage, retreat, reposition, scavenge, hold position) and zero hooks. No communication. No coordination. Just individual competence.

Chat responds: "what about command agent?" Dmitri: "Command agent is useless this rotation. It can't see what your frontline sees because there's no relay chain. It can't send orders because hooks are range-limited. You'd need the command agent physically next to each unit, which defeats the purpose." He deletes the command agent from his production queue. Chat clips this moment. The clip title: "Diamond player deletes command agent."

**Minute 15:00 — The Lab Session**
Dmitri runs Lone Wolf Doctrine against the Gauntlet's highest AI difficulty on The Antenna Farm. The map is a flat plain dotted with tall antenna structures that block line of sight. His 8 autonomous units spread out based on their perception — each one moves toward the nearest unexplored area. They encounter enemy units individually. Without coordination, two of his units attack the same enemy while three others wander into an ambush on the far side. He loses.

He adjusts. He adds a single spatial rule: "If friendly unit visible within 2 tiles, do not engage the same target." This creates emergent spacing — units naturally distribute across the map because engaging the same target is penalized. He runs again. The spacing works. His units cover more ground. They still can't coordinate, but they stop wasting effort on duplicate engagements. He wins narrowly.

Chat: "this is going to be the most watched rotation ever." Dmitri titles his VOD: "Rotation 14 Prep — The Death of Command."

**Minute 30:00 — The Content Calendar**
After the stream, Dmitri updates his content schedule: Sunday "Forecast React" (done), Monday "Lone Wolf Doctrine — Full Build Guide," Wednesday "Rotation 14 Day 1 — Ranked Climb," Friday "Rotation 14 Mid-Week Meta Report — Who's Adapted?" The rotation gives him four distinct content pieces over seven days. Without rotation, he would have one topic: "I played ranked and here's what happened." The rotation transforms the content from match logs into narrative arcs — prediction, preparation, execution, analysis.

---

## Strengths

- **Meta freshness as a design guarantee.** The rotation mechanically prevents the metagame from solving itself. Even if a dominant architecture emerges, it dominates for at most two weeks before the environment shifts. This extends the game's competitive lifespan indefinitely — the puzzle is never "solved" because the puzzle changes.
- **Forced architectural flexibility.** Players cannot specialize in one build forever. The rotation rewards having a library of configurations, each tuned for different conditions. This maps to the game's core fantasy: you are an engineer who adapts to constraints, not a soldier who executes one plan.
- **Pedagogical reinforcement of campaign lessons.** The Restricted Arsenal mutator teaches players what each skill does by removing it — the same subtractive teaching method used in the campaign's early missions (5.01). The rotation extends the campaign's pedagogy into the endgame.
- **Natural content calendar for streamers and community.** Every rotation is a content event. Forecast reactions, Lab streams, meta reports, build guides, community tier lists — the rotation generates discussion topics on a predictable schedule without requiring developer-authored patch notes.
- **Combinatorial depth from independent axes.** Four rotation axes (maps, mutators, mission type emphasis, seasonal) on different cadences produce enormous variety. 20 maps x 15 mutators x 6 mission types = 1,800 unique combinations before considering multi-mutator interactions. The design space is vast enough that players never feel they have "seen everything."

## Weaknesses

- **Rotation anxiety for casual players.** A player who spent three weeks perfecting a relay-chain build may feel punished when the rotation makes relays suboptimal. The emotional cost of "your favorite build doesn't work this week" is real. This is the Hearthstone Tavern Brawl complaint: players who hate the current brawl simply don't play until it changes.
- **Balance sensitivity.** If a mutator is too punishing (e.g., Resource Drought makes 80% of architectures nonviable), the rotation becomes a filter rather than a meta-shift. Only hyper-optimized drought builds survive. This requires careful tuning of every mutator's severity and combination interaction.
- **Curation labor.** Curated rotations require a design team to select, test, and balance each rotation's combination. This is ongoing labor that scales with the mutator catalog. Random rotations eliminate this cost but risk degenerate combinations.
- **Preview period as information asymmetry.** Players who engage with the preview (Lab testing, community discussion, forecast analysis) have a structural advantage over players who queue blind. This rewards time investment outside of matches, which some players experience as "homework."
- **Vault nostalgia.** When a beloved map rotates out, players who built their identity around that map feel loss. "Coastal Ridgeline was MY map" becomes a real sentiment. The vault system mitigates this (maps return) but doesn't eliminate the grief cycle.

---

## Interaction Effects

### Career Stats and Per-Rotation Config Tracking
The career stats system (5.22) tracks win rates per rotation, per config, per map. This creates a personal meta-history: "My relay chain wins 72% in Fog rotations but only 38% in Drought rotations." Players who study their career stats can identify which architectural families they need to develop. The rotation doesn't just change what wins — it reveals what the player is *bad at*, and the career stats make that visible.

Config naming becomes strategic. Players develop naming conventions tied to rotations: "DROUGHT_RUSH_v3," "FOG_RELAY_DEEP," "BLACKOUT_WOLVES." The config library becomes a rotation response toolkit. The Plan screen's config list becomes a strategic asset — not just saved builds, but a *vocabulary of environmental responses*.

### Community Discussion and Rotation Prediction
The 48-hour preview window creates a structured community rhythm. Forecast threads appear on schedule. Theory-craft discussions follow. Build-sharing surges during the Lab period. Post-rotation retrospectives analyze what actually worked versus what was predicted. This rhythm mirrors patch-cycle discussion in games like League of Legends, but with a key difference: Robot Uprising's rotations don't change the units (no balance patches), only the environment. The community discusses strategy, not grievances.

Rotation prediction becomes its own metagame. Experienced players notice patterns in the curation: "They always follow an information-hostile rotation with a resource-hostile one." "The Featured Map last month was urban, so this month's will be open terrain." Whether these patterns are real or apophenia, the discussion generates engagement. The Forecast panel's 4-week lookahead partially satisfies this — but only partially, because the 4th week is always "PENDING," leaving room for speculation.

### Config Flexibility vs. Specialization
The rotation creates a fundamental tension in player identity. A specialist — someone who perfects one architectural family (relay chains, striker swarms, command hierarchies) — will dominate in favorable rotations and suffer in unfavorable ones. A generalist — someone who maintains a broad config library — will perform consistently but never dominate. The optimal strategy is somewhere between: deep expertise in 2-3 architectural families that cover the most common rotation conditions, with lightweight "emergency configs" for hostile rotations.

This mirrors real engineering: you don't rebuild your entire infrastructure every quarter, but you need contingency plans for scenarios that stress your primary architecture. The rotation teaches this implicitly.

### Streaming Content Calendars
The rotation schedule is a content creator's gift. Every rotation is a narrative arc: prediction, preparation, execution, analysis. A weekly streamer gets 4 distinct content types from one rotation cycle. A biweekly video creator gets 2 high-value videos (Forecast Breakdown, Meta Report) timed to rotation transitions. Tournament organizers can schedule events around specific rotations, creating themed tournaments ("The Blackout Invitational"). The rotation is not just a game mechanic — it is a content infrastructure.

---

## Comparable Games

### Hearthstone Tavern Brawl
Weekly rotation of custom game modes with unique rules. Each Brawl changes what cards and strategies are viable. Strengths: generates weekly discussion, brings lapsed players back for interesting Brawls, low-stakes experimentation. Weaknesses: quality variance (some Brawls are brilliant, others are "play on curve with good cards"), separate from the main competitive mode (Standard/Wild), no carryover — your Brawl performance doesn't affect your ranked rating. Robot Uprising differs by making rotation *the* competitive mode, not a side attraction. Your rotation performance IS your Gauntlet rating.

### Apex Legends Map Rotation
Timed rotation between 2-3 maps in the ranked pool. Each map favors different legend compositions and engagement patterns (World's Edge rewards long-range, Olympus rewards mobility). Strengths: forces legend flexibility, creates map-specific metas, generates "which map is in rotation?" as a daily question. Weaknesses: players who hate the current map simply don't play, rotation is time-based (not skill-based), no preview or preparation period. Robot Uprising improves on this with the 48-hour preview and the Rotation Lab — players can prepare instead of just reacting.

### League of Legends Patch Cycles
Biweekly balance patches change champion strength, item effectiveness, and objective tuning. The meta shifts after every patch. Strengths: keeps the meta evolving over years, generates enormous community discussion (patch notes as content), professional play adapts visibly. Weaknesses: patches change the GAME (champion stats), not just the ENVIRONMENT — players feel their favorite champion was "nerfed" personally. Balance patches are reactive (fix what's too strong) rather than proactive (create interesting constraints). Robot Uprising's rotation changes the environment, not the units. Your relay chain isn't nerfed — the conditions just don't favor it this week. The unit is waiting, intact, for its rotation to return.

### Splatoon Stage Rotation
Two stages rotate every 2 hours for each game mode. Players see the current and next rotation in the lobby. Strengths: extremely fast rotation prevents staleness, creates "I'll play when my favorite stage comes back" anticipation, the lobby display is clean and informative. Weaknesses: 2-hour rotations are too fast for deep adaptation (you don't rebuild your loadout, you just wait), the rotation is random rather than curated, no preview or preparation mechanic. Robot Uprising's weekly/biweekly cadence gives players time to actually adapt their architectures — the rotation is long enough to develop new strategies but short enough to prevent stagnation.

---

## The Rotation Announcement: Sensory Design

### The Forecast Panel

The Gauntlet lobby's left third is the Forecast Panel. Its background is a deeper charcoal than the lobby's standard dark grey — the color of planning, of looking ahead. The current rotation's five maps are displayed as overhead-view thumbnails arranged in a horizontal strip, each thumbnail a square with rounded corners and a thin amber border. Below each map thumbnail, a small terrain icon (mountain, building, water, forest) classifies the map's dominant feature. The mutator badges sit beneath the map strip: circular icons with thin white outlines, each containing a minimal glyph (crossed-out skill icon for Restricted Arsenal, a shrinking circle for Fog of War, a cracked coin for Resource Drought). Active mutators glow with a steady amber fill. Upcoming mutators pulse with a slow cyan heartbeat.

The divider between current and upcoming rotation is a horizontal line that breathes — it expands and contracts by one pixel every two seconds, like a sleeping system's power indicator. Above the line: "CURRENT — 5d 2h remaining." Below the line: "NEXT — preview available in 3d 2h." The upcoming maps are slightly desaturated, their amber borders replaced by cyan outlines. They are visible but not yet real. Not yet yours to fight on.

### The Rotation Transition

When the rotation goes live, the transition is a 6-second ceremony:

**Second 0-2:** The current rotation's map thumbnails dim. Their amber borders fade to grey. The mutator badges drain of color, their glyphs fading to thin white outlines. A low, resonant tone — a single bass note from the game's synthesizer palette — sounds. The Forecast Panel's background darkens one shade further.

**Second 2-4:** The divider line between current and upcoming brightens to white, then expands vertically — splitting the panel in half. The old rotation slides upward and off-screen. The new rotation slides upward from below. The map thumbnails sharpen as they cross the center line, their cyan outlines warming to amber. The mutator badges fill with amber light, each one igniting with a soft pop — a percussive click, like a relay engaging.

**Second 4-6:** The new header text types itself character by character: "ROTATION 14 — ACTIVE." Each character produces a faint keystroke sound — the monospace terminal typing that runs through every Robot Uprising interface. The Featured Map's thumbnail expands slightly, a gold "FEATURED" badge fading in at its top-left corner. The Rotation Lab button, previously greyed, ignites teal. The bass note resolves upward into a clean fifth interval — an open, expectant sound. Not celebratory. Not threatening. Just: *the conditions have changed. Adapt.*

### The Rotation Lab

The Lab's Plan screen is identical to the ranked Plan screen with two differences. First, the header bar reads "ROTATION LAB" in teal monospace instead of "GAUNTLET" in amber. The teal is the game's "safe space" color — the same teal used for the Inspector's diagnostic mode, for the campaign's tutorial prompts, for anything that says "you can experiment here without consequence." Second, a small panel in the bottom-right shows the active mutators as interactive badges. Hovering over a mutator badge expands a tooltip: "SIGNAL JAMMING — Hook effective range reduced to 50%. Architectures relying on long-range hook coordination will need to cluster units or develop autonomous decision-making." The tooltip text is written in the Predecessor's voice — clinical, precise, faintly concerned.

The Lab's soundscape is quieter than ranked. The ambient hum that underlies the ranked Gauntlet — a tense, low-frequency drone suggesting stakes and consequence — is absent. In its place, a softer ambient: the electrical hum of the Plan screen's circuitry, the occasional click of a relay cycling, the faint whir of the factory in idle mode. The Lab sounds like a workshop, not an arena. You are here to think, not to prove.

---

## New Aspects Discovered

- **5.08d-i — Mutator interaction matrix:** The combinatorial space of mutator pairs and their emergent effects on architectural viability; which combinations are degenerate (should never be paired) and which create the richest adaptation puzzles.
- **5.08d-ii — Rotation rating memory:** Whether Gauntlet rating should be per-rotation (reset each cycle) or continuous (carry across rotations); the tradeoff between fresh starts and persistent progress.
- **5.08d-iii — The rotation calendar as community ritual:** How the forecast/preview/live/retrospective cycle creates weekly community rhythms analogous to sports seasons; in-game rotation history as shared cultural artifact.
- **5.08d-iv — Casual rotation protection:** Mechanisms to protect casual players from rotation-induced frustration — "Rotation Assist" mode that suggests config adjustments, unranked permanent playlist with no mutators, rotation difficulty warnings.
- **5.08d-v — Vault nostalgia and map identity:** How players develop emotional attachment to specific maps and the design of vault/recall systems that honor that attachment while maintaining rotation freshness.
