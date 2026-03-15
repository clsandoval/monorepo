# Persistence vs. Session Structure: The Ownership Feeling Without Always-On Anxiety

**Aspect:** 5.20 — Always-on anxiety vs. self-contained missions
**Category:** Campaign / Persistence & Ownership
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

Screeps runs 24/7. Your bots mine, fight, and die while you sleep. The thrill of checking your phone at 3 AM and seeing your colony survived an attack is intoxicating — but so is the dread of waking up to rubble. That's the **persistence fantasy**: the world goes on without you, and your creation endures.

Robot Uprising is the opposite. You design agents, hit EXECUTE, watch the sealed replay, debrief, iterate. Self-contained missions. No ticking clock when you close the browser tab. No "vacation death." No 3 AM check-ins. This is structurally correct — the game is about architecture design, not babysitting — but it creates a gap: **where does the sense of ownership live?**

Ownership is the feeling that something in the game is *mine*. Not a score, not a leaderboard position — something that exists, persists, accumulates, and reflects my choices over time. In Screeps, it's the colony. In XCOM, it's the named soldiers who survived Gatecrasher and are now Colonels. In Homeworld, it's the fleet of Ion Frigates you've nursed through six missions. In Darkest Dungeon, it's the Hamlet and the scarred heroes within it.

Robot Uprising's session-based structure naturally produces **ephemeral ownership** — you own the blueprint configurations, but they're abstract. You own the moment of the sealed watch, but it evaporates. The question is: **what compensatory design choices restore the ownership feeling without reintroducing always-on anxiety?**

---

## The Persistence Spectrum

Before exploring options, map the design space from "zero persistence" to "always-on":

| Level | Persistence Type | Example | Anxiety Level | Ownership Level |
|-------|-----------------|---------|---------------|-----------------|
| 0 | **Stateless sessions** | Each mission is independent, no carry-over | Zero | Minimal — you own nothing between sessions |
| 1 | **Progression persistence** | Unlock tree, completed missions, career stats | Zero | Low — you own a checklist |
| 2 | **Entity persistence** | Named units, blueprints with history, evolving configs | Zero | Medium — you own things with identity |
| 3 | **World-state persistence** | Between-mission base/camp that evolves, persistent roster | Zero | High — you own a place |
| 4 | **Async persistence** | Daily challenges, community blueprints, leaderboards that update | Low (FOMO) | Medium — you own a rank |
| 5 | **Ticking-clock persistence** | Systems that advance between sessions (cooldowns, timers, seasons) | Medium | High — you own ongoing processes |
| 6 | **Always-on persistence** | Screeps, Travian, Clash of Clans | High | Maximum — you own a living world |

Robot Uprising is locked at Level 1 (progression persistence via campaign completion and Blueprint Codex unlocks). The question is how far up this ladder to climb and which rungs to skip.

---

## Option A: "The Barracks" — Named Persistent Units

### How It Works

Every unit the factory produces gets a generated name and a persistent identity. SCOUT-7 "Whisper." STRIKER-12 "Fang." They're born from blueprints, but they accumulate history: missions survived, kills recorded, signals relayed, context overloads endured. Between missions, a **Barracks screen** shows your roster — small portraits in a grid, each with a service record.

Units don't carry between missions mechanically (the factory still produces fresh units per mission), but the game tracks a **lineage**. SCOUT-7 in Mission 4 was built from the same blueprint as SCOUT-3 in Mission 2. The blueprint's performance history accumulates across its children. A blueprint that's produced 30 units across 10 missions has a visible "bloodline" — a family tree of instances.

When a unit dies, it's recorded. The Barracks shows fallen units in a separate memorial section — ghosted portraits with cause of death. "RELAY-4 'Bridge': context overload, T17, Mission 6."

### The Ownership Hook

The player doesn't just own blueprints — they own a **lineage**. "My scout blueprint has produced 47 units across the campaign. 12 died. The average lifespan is 14 ticks. My best scout survived 31 ticks in Mission 8." The blueprint becomes a thing with a story.

### Strengths

- **Zero anxiety.** Nothing happens to your barracks when you're offline. It's a trophy case, not a living system.
- **Emotional weight for the sealed watch.** When SCOUT-7 dies in the replay, it's not "a scout died" — it's "Whisper died." The memorial updates. The blueprint's survival rate dips.
- **Natural narrativization.** Players will tell stories: "My relay blueprint is cursed — 80% fatality rate." Community sharing of ridiculous service records.
- **Minimal mechanical impact.** The barracks doesn't change gameplay. It's a cosmetic/emotional layer on top of existing systems.
- **The Homeworld feeling.** Homeworld's fleet persistence is widely cited as one of the most emotionally resonant RTS mechanics ever. Players describe caring about Ion Frigates they've had for three missions. Named Robot Uprising units capture this without the balancing nightmare (Homeworld had to add adaptive difficulty because large persistent fleets broke encounters).

### Weaknesses

- **No mechanical consequence.** If the barracks doesn't affect gameplay, some players won't engage. It's "just cosmetic."
- **Name fatigue.** If every unit gets a name, names lose meaning. 47 named scouts is noise. The player needs a reason to care about specific individuals.
- **Contradicts the factory model.** Units are mass-produced from blueprints. Naming them suggests individuality that the game's systems don't actually support — every unit from the same blueprint behaves identically.

### Interaction Effects

- **With the Inspector (locked):** Click-to-inspect already shows per-unit state. Adding a name and service record to the Inspector sidebar is trivial — and makes the forensic experience more personal. "Why did Whisper die?" instead of "Why did Scout #7 die?"
- **With Blueprint Codex (locked):** The Codex already catalogs capabilities. Adding lineage/service records to blueprint entries deepens it into a living document.
- **With the sealed watch (locked):** Unit names floating above sprites during battle. The player sees "Whisper" patrolling, not "Scout." When Whisper's tile flashes red, the name lingers for a beat before fading.

### Comparable Games

- **Homeworld:** Fleet persistence creates the deepest unit attachment in the RTS genre. Players describe caring about specific frigates "because that destroyer has been part of my fleet for the last three missions." But Homeworld's adaptive difficulty caused degenerate meta-gaming (players deleting ships to reduce encounter difficulty). Named units without carry-over avoids this entirely.
- **XCOM 2:** Named soldiers with nicknames, personal stats, and memorial wall. The emotional impact comes from permadeath + progression (soldiers gain abilities over time). Robot Uprising's units don't level up, but the blueprint's performance history serves a similar role.
- **Darkest Dungeon:** Named heroes with quirks and scars. The design tension: "A larger roster means individual characters are diminished in importance." The memorial system ("In Memoriam") of fallen heroes is one of the game's most emotionally resonant screens.

### Sensory Description

The Barracks screen: a dark gunmetal panel filling the right two-thirds of the screen. Rows of small unit portraits — each a 48x48 pixel icon in a rounded frame. Active blueprints glow with a thin cyan border. Below each portrait, the unit's name in small monospace type ("WHISPER") and a micro-stat: "M8 | T31 | 3K" (Mission 8, survived 31 ticks, 3 kills). Tapping a portrait expands it into a full service card: the blueprint it came from, every mission it participated in (horizontal timeline with colored dots — green for survived, red for destroyed), and cause of death if applicable.

The Memorial section at the bottom: portraits rendered in desaturated monochrome with a thin red border. A subtle particle effect — tiny floating motes of light rising from each portrait, like digital embers. Hovering over one plays a quiet, single-note chime — different pitch per unit type. The total count in the corner: "FALLEN: 23." Below that, a small text: "They served the architecture."

---

## Option B: "The Workshop" — Between-Mission Blueprint Lab

### How It Works

Between missions, the player enters the **Workshop** — a dedicated screen for blueprint experimentation outside of mission pressure. The Workshop has a sandbox simulator: drop units onto a small test grid, spawn dummy enemies, and run isolated 10-tick micro-battles to test configurations.

Critically, the Workshop persists. The test setups you build stay between sessions. You can save named **experiments** — "flanking-test-v3," "relay-chain-stress-test," "anti-swarm-config" — and return to them later. The Workshop accumulates the player's experimental history: a timeline of saved experiments with notes and results.

### The Ownership Hook

The player doesn't just own blueprints — they own a **laboratory**. The Workshop is their personal R&D space. It's where ideas get tested before they go live. The accumulation of experiments tells a story of iterative learning: early experiments are crude and scattered; late experiments are precise and targeted.

### Strengths

- **Mechanically meaningful.** Unlike the Barracks, the Workshop directly improves gameplay. Players who use it learn faster.
- **Reflects the real agentic AI workflow.** Actual AI engineers have sandboxes. The Workshop teaches the real practice of isolated testing before deployment.
- **Session bookmark.** "Where was I?" is answered by opening the Workshop and seeing your last experiment. It's a save-state for your thought process, not just your game state.
- **Scales with expertise.** Beginners use the Workshop for simple "does this config work?" tests. Veterans use it for rigorous stress-testing. The same space serves both.

### Weaknesses

- **Development cost.** A sandbox simulator is a significant engineering investment. It's effectively a mini-game-within-a-game.
- **Competes with the mission loop.** If the Workshop is too useful, players spend more time experimenting than playing actual missions. The sealed watch — the emotional core — gets starved of attention.
- **Breaks the sealed-watch philosophy.** The game's locked design says you can't predict the outcome. A Workshop that lets you simulate undercuts the mystery of EXECUTE.

### Interaction Effects

- **With the sealed watch (locked):** Tension. The Workshop lets you reduce uncertainty before hitting EXECUTE. If simulations are too faithful, the sealed watch becomes a formality. If simulations are too simplified, the Workshop feels useless. The goldilocks zone: Workshop simulations use a **different random seed** and simplified enemy AI, so they're directionally useful but never predictive.
- **With the Inspector (locked):** Workshop experiments could feed into the Inspector — "last Workshop test of this blueprint: 7/10 ticks survived." Inspector data enriches Workshop experiments.
- **With the Gauntlet:** Workshop becomes essential for competitive players — the practice arena before ranked play.

### Comparable Games

- **Factorio's sandbox mode:** A separate map where you can test production chains without consequences. Players love it for prototyping, but it can become a procrastination trap — spending hours optimizing in sandbox instead of playing the campaign.
- **Slay the Spire's lack of sandbox:** No way to test decks outside of runs. The inability to practice makes each run higher stakes. Some players love this; others find it frustrating.
- **StarCraft's unit tester maps:** Custom maps designed for testing unit compositions. Not an official feature, but the community built them because the need was there.

### Sensory Description

The Workshop screen: a split layout. Left third is a small 4x4 test grid — same isometric tiles as the battlefield but in a contained "terrarium" with glass-wall borders and glowing gridlines. Right two-thirds is the blueprint editor (same as Plan screen) plus a **test controls panel** at the bottom: a SPAWN ENEMIES dropdown (scout, striker, swarm), a SEED number (randomized by default, pinnable), a RUN 10 TICKS button, and a results readout showing which units survived, signals sent, ticks to first contact.

Saved experiments appear as tabbed cards along the top of the screen — each tab shows the experiment name and a micro-result icon (green check, red X, amber question mark). The active experiment's tab glows. Switching tabs animates the grid reconfiguring — units sliding into new positions, enemies morphing into the saved set. A small "NOTES" text field below the results lets the player jot thoughts. The notes render in a monospace typewriter font — lo-fi, technical, like an engineer's lab notebook.

---

## Option C: "Campaign Memory" — The World Remembers Your Choices

### How It Works

The campaign map (the Philippine archipelago) accumulates visible marks of the player's journey. Completed provinces don't just glow cyan — they show **artifacts of how you won**. If you won Mission 3 (Palawan jungle) with a relay-heavy architecture, tiny relay icons dot the province. If you won with a brute-force striker rush, the province shows scattered striker debris.

Between missions, the campaign map evolves. Previously conquered provinces show small vignettes — your units patrolling, signals pulsing between relay towers you built, factories humming. It's not gameplay — it's a screensaver of your past victories. A living diorama of your campaign.

Additionally, the game tracks **architectural style** across the campaign. After Mission 5, a small "Architect Profile" card appears on the campaign map: "Your style: Information-Dense (avg 4.2 relays per mission, 12 active channels). Comparable to: The Switchboard Operator." Style archetypes are named and described, giving the player a sense of identity.

### The Ownership Hook

The player owns the **map**. Not as a completion checklist, but as a visual autobiography. The campaign map becomes "my campaign" in a way that a list of completed missions never does. Sharing a screenshot of your campaign map tells a story — the provinces, the style artifacts, the architectural identity.

### Strengths

- **Zero mechanical impact.** Pure emotional/cosmetic layer. No balance implications.
- **Leverages the locked campaign map.** The Philippine archipelago is already locked as the campaign structure. This deepens it from a menu into a world.
- **Screenshot-worthy.** Campaign maps with personalized artifacts are inherently shareable. "Look at my archipelago" becomes a community artifact.
- **Architect identity is meta-game.** "I'm a Switchboard Operator" vs. "I'm a Blitz Rush" gives players vocabulary for their style and encourages replays to try different archetypes.

### Weaknesses

- **Low intensity ownership.** Compared to named units or a Workshop, a cosmetic map is passive. The player doesn't interact with it — they just observe.
- **Style archetypes risk pigeonholing.** If the game labels you "Relay-Heavy," players may feel judged or constrained rather than celebrated. The archetype must feel like a discovery, not a diagnosis.
- **Art asset cost.** Per-province, per-style artifacts mean a combinatorial explosion of vignette art. 10 provinces × 4-5 style archetypes = 40-50 unique vignettes.

### Interaction Effects

- **With the Blueprint Codex (locked):** The Architect Profile could live in the Codex as a persistent card alongside unlocked capabilities. "Your style" as a first-class Codex entry.
- **With replayability (5.09):** Different architectural styles on replays create visual variety on the campaign map. Players replaying to "paint the map differently" is a valid motivation.
- **With the Gauntlet:** Your Gauntlet rank card could show your campaign map as a background — your architectural autobiography as your competitive calling card.

### Comparable Games

- **FTL's galaxy map:** The starfield with visited beacons doesn't persist between runs, but within a run, it tells a story of your journey. Robot Uprising's campaign map makes this persistent across the entire campaign.
- **Celeste's chapter select:** Each completed chapter shows a small collectible count and a postcard screenshot. Simple, but the postcards make the chapter select feel like a scrapbook.
- **Hades' House of Hades:** The persistent hub that evolves with contractor upgrades and relationship progress. Returning between runs to see new furniture, new dialogue, new art — the house IS the persistence.

### Sensory Description

The campaign map after 7 completed missions: the Philippine archipelago rendered in deep teal ocean and warm terracotta landmasses, circuit-board cable connections glowing between provinces. Ifugao (Mission 1) pulses with a gentle cyan glow — and on the province surface, tiny pixelated rice terraces with blinking relay towers nestled between them, miniature signal lines arcing between towers like fireflies. Palawan (Mission 3) shows dense jungle canopy with scout units visible as moving cyan dots on patrol routes. Manila (Mission 6) is a neon megacity skyline with visible factory smokestacks puffing rhythmic production pulses.

The Architect Profile card floats in the lower-right corner: a dark panel with a stylized portrait (the player's "AI avatar" — an abstract geometric face that shifts shape based on style). Text reads: "ARCHITECT PROFILE: The Switchboard Operator. Information density: 87th percentile. Favored unit: Relay. Signature move: Triple-cascade signal chains." Below, a small radar chart showing five axes: Aggression, Information Density, Architecture Depth, Adaptability, Efficiency.

---

## Option D: "The Persistent Roster" — Darkest Dungeon Meets Robot Uprising

### How It Works

A hybrid of Option A (named units) with mechanical consequences. Between missions, the player manages a **roster** of blueprints (not individual units, but blueprints). Blueprints persist across the campaign and can be **upgraded** between missions using resources earned from completed missions.

Upgrades aren't stat buffs — they're **configuration slots**. A freshly unlocked blueprint starts with 1 skill slot, 1 hook slot, 1 rule slot. Upgrading it adds a 2nd hook slot, then a 2nd rule slot, then a 3rd skill slot. The blueprint grows from a simple tool into a complex agent over the campaign.

Critically, blueprints can be **damaged** in failed missions. If RELAY-B's context window overloaded 5+ times in a mission, it comes back with a "Trauma: Context Sensitivity" debuff — the next mission, it starts with 1 fewer context slot until the player spends a "maintenance" action to repair it. The maintenance screen shows blueprints on a workbench with visible damage indicators.

### The Ownership Hook

The player owns **evolving blueprints** that grow, scar, and need care. This is the Darkest Dungeon hero model applied to configurations: the blueprints are your heroes, their trauma is architectural debt, and maintenance is the Hamlet's Sanitarium.

### Strengths

- **Mechanical depth.** Blueprint evolution adds a metagame layer between missions. Resource allocation (which blueprint to upgrade?) creates meaningful decisions.
- **Carries the "your decisions have consequences" theme.** Failed missions leave scars. Successful missions earn growth. The campaign has momentum.
- **Natural difficulty curve.** Early missions with 1-slot blueprints are simple. By Mission 8, fully upgraded blueprints with 3 skills, 4 hooks, and 3 rules are complex systems. The complexity grows with the player's understanding.

### Weaknesses

- **Contradicts locked blueprint editor design.** The locked first playable has fixed slot limits per unit type (Scout: 6 buffer, 2 hooks, etc.). Adding upgradeable slots changes the core balance.
- **Darkest Dungeon's roster problem.** As the roster grows, individual blueprints lose meaning. The player develops "A-team" and "B-team" blueprints, and the B-team never gets used.
- **Maintenance as busywork.** If blueprint damage is too frequent, maintenance becomes a tax. If too rare, it's ignorable. The Darkest Dungeon critique applies: "all it really did was turn a 30-hour game into a 60-hour one due to needless padding."
- **Complexity ceiling risk.** Adding an entire between-mission management layer may push total complexity past the accessibility threshold. The game already has skills, rules, hooks, context config, channels, production queues. Adding blueprint evolution, damage, maintenance, and upgrades is a lot.

### Interaction Effects

- **With the factory model (locked):** Direct conflict. The factory produces units from blueprints every N ticks. If blueprints are persistent and upgradeable, the factory's role changes from "production line" to "deploying my roster." This may be acceptable or may violate the factory fantasy.
- **With Mission 1-4 (locked):** Hand-configured pre-placed units in Missions 1-4 can't use a blueprint roster. The roster activates at Mission 5 (factory introduction), which means the ownership layer doesn't exist for the tutorial.
- **With the Gauntlet:** Upgraded blueprints in competitive play require careful balancing. If Gauntlet uses campaign-upgraded blueprints, progression gates competitive viability. If Gauntlet uses standardized blueprints, the upgrades feel pointless.

### Comparable Games

- **Darkest Dungeon's Hamlet:** Heroes accumulate quirks, diseases, stress. Between dungeons, you heal them, upgrade them, dismiss the broken ones, recruit fresh ones. The Hamlet is beloved by some and criticized by others as padding. A key critique: players care about heroes by *playing with them*, not by shuffling them between buildings.
- **XCOM 2's soldier progression:** Soldiers gain abilities over time. Named soldiers who survive from early game become irreplaceable — losing Colonel Ramirez in Mission 18 after they survived 15 missions is devastating. The progression makes the naming meaningful.
- **Into the Breach's pilot persistence:** One pilot carries over between runs. This is the minimal persistence model — a single thread of continuity in a sea of resets. Robot Uprising could adopt this: one "legacy blueprint" carries between campaign replays.

### Sensory Description

The Maintenance screen: a horizontal workbench rendered in warm amber light, toolbox textures, oil-stained metal. Blueprint cards are laid out like patient files — each card shows the blueprint's portrait, name, slot configuration (bright icons for active slots, dim outlines for locked slots, red warning triangles for damaged slots). Tapping a damaged slot opens a repair animation: tiny robotic arms descend from above, sparks fly, the red triangle dissolves into a green checkmark. A resource counter in the corner ticks down. The "UPGRADE" action is a different animation: the card expands, a new slot outline glows, a satisfying *click-chunk* sound as the new slot locks into place.

---

## Option E: "The Async Shadow" — Your Architecture Lives On

### How It Works

When the player completes a mission, their winning architecture (blueprints + channel wiring + production queue) is **uploaded** as a ghost. Other players encountering the same mission can see ghost architectures — anonymized, partial shadows of how others solved it.

Between sessions, the player's uploaded architectures accumulate plays. A notification on return: "Your Mission 5 architecture was used as a reference by 12 players since you last played. 3 of them achieved higher pass rates." The player's architectures become **community artifacts** that live beyond the session.

Additionally, the player can subscribe to architectures — following another player's solutions across multiple missions, seeing how their approach evolves. This is the **Screeps open-source culture** translated to Robot Uprising: your code (architecture) is your identity.

### The Ownership Hook

The player owns **public artifacts** — their architectures exist in the world, being seen and used by others. This is the GitHub profile model: your contributions persist and accumulate reputation.

### Strengths

- **Social ownership is the deepest kind.** Knowing that other people have seen and used your architecture creates profound ownership — the same feeling as an open-source library with 1,000 stars.
- **Zero anxiety.** The architectures exist passively. Nothing bad happens to them while you're away. They only accumulate positive attention.
- **Natural content.** Ghost architectures create an endless supply of alternative solutions for stuck players. It's a built-in hint system that's also a social feature.
- **Reflects the real agentic AI culture.** The Screeps community publishes full bot code on GitHub and writes architectural blog posts. This is a deliberately-designed community mechanic.

### Weaknesses

- **Requires online infrastructure.** A backend for uploading, storing, and serving architectures. This conflicts with the locked "no backend" tech constraint — unless architectures are encoded as shareable strings (like Factorio blueprints) and shared via external channels.
- **Spoiler risk.** Seeing other solutions before solving a mission yourself can ruin the puzzle. The feature needs careful gating — only visible after you've completed the mission? Only partial views?
- **Cold start problem.** Early adopters have no ghosts to see. The feature only works with a player base.

### Interaction Effects

- **With the Inspector (locked):** Ghost architectures are inspectable. The player can debrief someone else's solution in the Inspector, learning from their approach.
- **With the Gauntlet:** Gauntlet architectures are inherently competitive — showing your winning architecture to opponents is risky. Competitive mode may need architecture privacy.
- **With the Blueprint Codex (locked):** Community architectures could appear as "featured builds" in the Codex — curated examples of how others use each capability.

### Comparable Games

- **Screeps' GitHub culture:** Players publish full bot codebases. "Reading other people's code" is a core part of the Screeps experience. Robot Uprising's architecture-sharing captures this without requiring JavaScript literacy.
- **Death Stranding's strand system:** Structures built by other players appear in your world. You benefit from them without direct interaction. The feeling of "someone was here before me" creates quiet connection.
- **Zachtronics' histogram:** After completing a puzzle, you see how your solution's efficiency compares to the global distribution. The histogram creates ownership of your position in the distribution — "I'm in the top 10% for cycles."

### Sensory Description

The ghost overlay: on the campaign map, completed provinces show a faint population counter — "47 architectures" in small translucent text. Tapping opens the **Architecture Gallery** — a grid of anonymized architecture thumbnails, each showing a miniaturized channel wiring diagram (like a circuit schematic). Thumbnails are sorted by pass rate, with the top performer glowing gold. Your own architecture has a distinct cyan border.

Tapping a ghost architecture opens a **Ghost Inspector** — same Inspector UI, but with desaturated colors and a watermark reading "GHOST // ANONYMOUS." Signal chains render as faded dotted lines. The player can scrub the timeline, inspect units, trace decisions — but names are replaced with generic labels (UNIT-A, UNIT-B). A "BOOKMARK" button saves it to your Codex for reference.

The return notification: a small toast in the corner when the game loads. "Your Mission 5 architecture was referenced 12 times. 3 players improved upon it." Tapping opens a comparison view — your architecture side-by-side with the top improver's, differences highlighted in amber.

---

## Option F: "The Camp" — A Persistent Between-Mission Space

### How It Works

Between missions, the player enters **The Camp** — a small isometric scene (2x3 tiles) showing your base of operations. It's not a gameplay space; it's a mood space. Your factory sits in the center. Around it, visual elements accumulate:

- **Trophies** from completed missions (a piece of enemy hardware from Mission 3, a recovered data crystal from Mission 5)
- **Blueprint workstations** where your active blueprints are "displayed" — small holographic projections of each blueprint's channel wiring
- **A message board** with notifications (next mission briefing, community events, daily challenges)
- **An equipment rack** showing unlocked capabilities

The Camp is the **Hades House of Hades** for Robot Uprising — a warm, persistent home base that evolves over the campaign. Each time you return, something has changed: a new trophy, a rearranged display, a new message.

### The Ownership Hook

The player owns **a place**. Not an abstract menu — a space that looks like it belongs to them and reflects their journey. The Camp is the answer to "what do I come back to?"

### Strengths

- **Emotionally grounding.** After the intensity of the sealed watch and the analytical rigor of the Inspector, the Camp is a decompression space. It's warm where the battlefield is cold.
- **Screenshot-worthy.** A personalized Camp with trophies and holographic blueprints is shareable and distinctive.
- **Low mechanical complexity.** The Camp is a visual wrapper around systems that already exist (blueprint editor, campaign map, Codex). It doesn't add mechanics — it adds atmosphere.
- **Narrative home for the boot log.** The Camp is where the player reads the boot log. The diegetic tutorial happens in a diegetic space.

### Weaknesses

- **Development cost for non-gameplay feature.** A fully realized isometric Camp scene with evolving props, trophies, and animations is expensive to build — especially for something that's "just vibes."
- **May feel hollow without mechanics.** If the Camp is just a pretty menu, players may skip it. Hades' House works because it has dialogue, relationships, and gifts — active engagement. A Camp with only passive observation risks being ignored after the novelty wears off.
- **Competes with the "start mission" impulse.** When a player opens the game, they want to play a mission. The Camp adds a step between opening the game and playing. This friction must be near-zero.

### Interaction Effects

- **With the boot log (locked):** The boot log plays in the Camp. The self-documenting AI initialization happens in the player's home space, making it feel like your own system booting.
- **With the Blueprint Codex (locked):** The Camp's equipment rack IS the Codex — a physical manifestation of the collection screen.
- **With the campaign map (locked):** The Camp's message board shows the campaign map as a wall-mounted display. The player sees the archipelago from their base.

### Comparable Games

- **Hades' House of Hades:** The gold standard for between-run persistence. The House evolves with contractor purchases, relationship progress, and story beats. Players spend 5-10 minutes between runs in the House, and it never feels wasted — because of the dialogue and relationships.
- **Slay the Spire's whale bone (lack of hub):** Slay the Spire has no between-run space. The next run starts immediately. This is fast and clean but creates zero sense of place.
- **FTL's ship (in-run hub):** The ship IS the hub and the gameplay space. Everything happens in one space. This conflation is elegant but only works because FTL's gameplay is real-time — you're always in the ship.

### Sensory Description

The Camp: a small isometric scene rendered in warm evening light. The factory — a repurposed Filipino *bahay kubo* (nipa hut) with visible circuit boards and server racks emerging from the bamboo frame — sits center-screen. Smoke rises gently from a cooling vent. To the left, a workbench displays holographic blueprint projections — tiny rotating schematics of your active blueprints, each glowing the color of its primary channel (cyan for recon, amber for command, green for assault). To the right, an equipment rack built from reclaimed industrial shelving, each shelf holding a glowing unlock icon from the Codex.

In the foreground, a small fire pit (digital campfire — blue-white flame, not orange) where the AI's boot log text appears line by line, typewriter-style, reflected in the metallic floor. Trophies accumulate around the fire pit: a cracked enemy circuit board leaning against a rice-terrace rock, a captured enemy blueprint chip embedded in a piece of coral, a recovered data crystal hovering in a magnetic cradle.

Ambient sound: distant tropical insects mixed with a low server hum. Occasional radio chatter from the next mission briefing, garbled and compressed. A wind chime made of salvaged circuit boards clinks softly.

---

## Player Journeys

### Journey: Maya, 24, CS student who discovered the game through a "games that teach AI" Reddit thread

**Context:** Mission 6 completed. She's been playing for two weeks in 45-minute evening sessions. She's just finished the first Command agent mission.

**Minute 0:00 — The Return**
Maya opens her laptop after dinner. The game loads to the Camp (Option F). The *bahay kubo* factory is center-screen, evening light, blue campfire. A new trophy sits by the fire — a holographic replica of the command agent she just built, slowly rotating. The boot log types: "COMMAND SUBSYSTEM: operational. Architecture depth: 3 layers. Notes: operator demonstrates recursive design instinct."

She smiles. The boot log noticed her three-layer architecture — command controlling relays controlling scouts. She taps the trophy and it expands into a mission summary card: "Mission 6: Manila. Architecture: 3-layer command cascade. Pass rate: 73%. Units deployed: 8. Units lost: 3. Notable event: RELAY-2 'Beacon' survived all 30 ticks."

**Minute 0:30 — The Roster**
She taps the Barracks panel (Option A). Her blueprint roster shows five blueprints, each with a small lineage chart. Her Scout blueprint has produced 12 units across 6 missions — 8 survived. She taps it and sees the service record scroll: names, missions, fates. She notices SCOUT-4 "Ghost" survived Missions 4, 5, AND 6 — the same scout blueprint instance kept living. The game highlights this with a gold border: "VETERAN: 3 consecutive missions." She feels a flush of pride. She screenshots the veteran badge.

**Minute 1:00 — The Workshop**
She opens the Workshop (Option B) to test a new idea. She'd noticed in the Inspector that her relay's compress skill was using 3 context slots instead of 2. She wants to test whether adjusting the eviction priority fixes it. The Workshop loads her last experiment: "relay-compress-test-v2." She tweaks the context config, hits RUN 10 TICKS. The test grid runs. Compress now uses 2 slots. She saves as "relay-compress-test-v3" and adds a note: "fixed! priority tweak works. deploy in M7."

**Minute 2:00 — Mission 7**
She navigates to the campaign map. The archipelago glows with her progress — six provinces lit cyan, each with small style artifacts. Manila shows a neon skyline with three pulsing relay towers (her architecture's signature). She taps Mindanao. The mission briefing loads. She's ready.

**What she felt:** Coming back to the Camp felt like coming home. The boot log's comment about "recursive design instinct" felt like the game *saw* her. The veteran scout badge was an unexpected joy. The Workshop experiment was quick and purposeful — she knew exactly what to test and why. The campaign map was beautiful but she barely looked at it; she was excited to play.

---

### Journey: Daniel, 38, engineering manager who plays for 20 minutes during lunch

**Context:** Mission 4 completed. He plays on his work laptop in short bursts. He hasn't opened the game in 4 days.

**Minute 0:00 — The Memory Jog**
Daniel opens the game. The Camp loads. He stares at the screen for a moment, trying to remember where he was. The message board shows: "MISSION 5: Factory Unlocked. Briefing available." He taps it — a short text explains that Mission 5 introduces the factory and production queues. The boot log types: "FACTORY SUBSYSTEM: initializing. Operator last active: 4 days ago. Previous architecture: dual-scout patrol with single relay."

That last line is key. He remembers now — he was running two scouts and a relay. The boot log acts as a session resume prompt, telling him exactly what his last configuration was.

**Minute 0:30 — Quick Prep**
He skips the Barracks and Workshop — no time during lunch. He goes straight to the campaign map. He sees his four completed provinces glowing. The Architect Profile says "Your style: Minimalist (avg 2.3 units per mission, 1.5 channels). Comparable to: The Sniper." He grins — he likes the efficiency label. He taps Mission 5.

**Minute 1:00 — Factory First Contact**
The Plan screen loads with the factory. New UI elements everywhere. He reads the boot log tutorial slowly, then starts building his first blueprint. He has 12 minutes of lunch left. He spends them configuring a single Scout blueprint and hitting EXECUTE.

**What he felt:** The 4-day gap was painless. The boot log's "operator last active" summary told him exactly where he was. He didn't need the Workshop or Barracks — those features existed but didn't demand his attention. The Architect Profile gave him a sense of identity in 2 seconds. The game respected his time.

---

### Journey: Priya, 16, competitive gamer who's in the top 500 Gauntlet players

**Context:** Campaign completed. She's deep in the Gauntlet. She opens the game specifically to check her async architecture stats.

**Minute 0:00 — The Dashboard**
Priya skips the Camp entirely (she's configured it to load directly to Gauntlet). But she tabs to the Architecture Gallery (Option E) to check her public architectures. Her Mission 8 architecture — a complex 5-agent network with triple-cascade signal chains — has been referenced 340 times. It's the 3rd most-referenced architecture for Mission 8 globally. She feels ownership of that ranking — it's like having a popular GitHub repo.

**Minute 0:15 — Competitive Intel**
She notices one ghost architecture that improved on her Mission 8 design: higher pass rate, fewer units. She opens the Ghost Inspector and scrubs through the replay. The anonymous architect used a relay configuration she hadn't considered — listen filters set to ignore low-fidelity signals, which she'd never tried. She bookmarks it and opens the Workshop to test the approach.

**Minute 1:00 — Workshop to Gauntlet**
She rebuilds the relay configuration in the Workshop, runs 5 test scenarios. It works. She incorporates it into her Gauntlet loadout. The Workshop experiment is saved as "stolen-relay-config-from-ghost-M8" — her notes read "credit to anonymous genius."

**What she felt:** The Architecture Gallery is her primary ownership mechanism. She doesn't care about trophies or camp decorations — she cares about her architectures being used by hundreds of players. The ghost system gave her a competitive edge AND a moment of humility. She learned from an anonymous stranger's architecture. That's the ownership loop at the competitive tier: your architectures define you.

---

### Journey: Tito, 72, retired engineer who plays slowly and reads everything

**Context:** Mission 3 completed. He's been playing for three weeks, one mission per week.

**Minute 0:00 — The Camp as Living Room**
Tito opens the game and sits in the Camp. He reads the boot log — all of it, slowly. He taps each trophy and reads the full mission summary. He opens the Barracks and reads every unit's service record. SCOUT-2 "Magpie" died in Mission 2 — context overload, tick 8. He remembers. He'd forgotten to set the listen filter. The memorial entry includes the cause: "Context window overflow: unfiltered enemy broadcast signal." He nods — that was the lesson.

**Minute 3:00 — The Blueprint Codex**
He opens the Codex from the equipment rack. He reads the full entry for the Compress skill — he unlocked it in Mission 3 but hasn't used it yet. The entry includes a "Community Usage" section: "73% of players equip Compress on Relay blueprints. Common pairing: Compress + Amplify." He decides to try it in Mission 4.

**Minute 5:00 — The Architect Profile**
He checks his profile: "Your style: Cautious Observer (avg context utilization 31%, avg units alive at end 89%). Comparable to: The Sentinel." He likes this. He IS cautious. The game reflecting that back to him feels like being understood.

**Minute 7:00 — No Rush**
He spends another 5 minutes looking at the campaign map, reading the province descriptions, appreciating the visual details of his completed provinces. He doesn't start Mission 4 tonight. He'll do that next weekend. He closes the game feeling satisfied — he spent 12 minutes in the game without playing a mission, and it felt worthwhile.

**What he felt:** The persistence features aren't obstacles between him and the gameplay — they ARE the gameplay for tonight. The Camp, Barracks, Codex, and campaign map together form a rich between-mission experience that rewards slow engagement. He's not anxious about anything expiring or decaying. Everything waits for him.

---

## Recommended Composite: "The Layered Homestead"

No single option captures the full ownership spectrum. The strongest design combines:

1. **Option A (Named Units)** — lightweight, low-dev-cost, high emotional ROI. Blueprint lineages and a memorial wall.
2. **Option C (Campaign Memory)** — Architect Profiles and style-marked provinces on the campaign map. Cosmetic layer that deepens the locked campaign map.
3. **Option F (The Camp)** — As a minimal hub (not a full Hades House). A single screen with factory, trophies, boot log, and links to other systems. Less than Hades, more than Slay the Spire's nothing.
4. **Option E (Async Shadow)** — Architecture Gallery as a post-campaign feature. Only activates after mission completion. Encoded as shareable strings to avoid backend dependency.

Skip Option B (Workshop) for v1 — it's high-cost and risks undermining the sealed watch's mystery. Skip Option D (Persistent Roster with damage) — it conflicts with the locked blueprint slot system and adds complexity beyond the accessibility threshold.

The composite gives each player archetype their ownership anchor:
- **Maya (learner):** Named units + Camp boot log
- **Daniel (time-pressed):** Architect Profile + boot log session resume
- **Priya (competitive):** Architecture Gallery
- **Tito (slow explorer):** Camp + Barracks memorial + Codex

---

## Discovered Aspects

The following new aspects emerged from this analysis:

1. **5.20a — Boot log as session resume mechanism:** The boot log's "operator last active" summary as a diegetic save-state recap; how much context to surface, how to handle multi-day gaps vs. same-day returns, whether the boot log's tone changes based on gap length
2. **5.20b — Architect Profile archetype design:** The full set of architectural style archetypes (Switchboard Operator, Sniper, Sentinel, etc.); how many, how they're computed, how they change over the campaign, whether they're visible to other players
3. **5.20c — Blueprint lineage as competitive stat:** Blueprint performance histories (survival rate, average lifespan, kills per unit) as competitive Gauntlet metadata; whether opponents can see your blueprint lineages; the "intimidation" factor of a blueprint with 200+ deployed units
4. **5.20d — The Camp's scope boundary:** How much is "too much Camp"? The line between a warm hub and a time-wasting distraction. Hades spends 5-10 minutes between runs in the House because of dialogue/relationships. Without those, how long does the Camp hold attention? Minimum viable Camp design.
5. **5.20e — Architecture Gallery encoding format:** How to encode a full architecture (blueprints + channels + production queue + context configs) as a shareable string without a backend. Factorio blueprint strings as model. Length constraints for Discord/Reddit sharing. QR codes for physical sharing.
