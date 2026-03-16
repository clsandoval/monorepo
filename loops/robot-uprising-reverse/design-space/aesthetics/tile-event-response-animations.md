# 6.01a-vii — Tile Animation Response to Game Events

## The Question: Should the World Notice What's Happening On It?

The tile-animation-budget (6.01a-i) established that tiles *breathe* — slow, ambient cycles that make the SE Asian cyberpunk setting feel alive. Dynamic-tile-damage-states (6.01a-iii) established that tiles can *scar* from combat. But between breathing and scarring lies a vast middle ground: **should tiles react to moment-by-moment gameplay events that aren't combat?**

When a scout steps onto a rice terrace tile, should the water ripple? When a signal packet travels through the Siquijor bioluminescent network, should the tile's organic lights pulse brighter? When an enemy passes through jungle, should leaves rustle? When a unit enters context overload on a city tile, should the neon flicker in sympathy?

This is the difference between a *backdrop* and a *stage*. A backdrop is painted scenery — beautiful, static, disconnected from the drama. A stage is a living participant — the floor creaks under footsteps, the lights respond to the scene, the environment is an actor. The question is which model serves Robot Uprising better, and where on the spectrum each biome should sit.

The core tension: **Into the Breach's board is a pristine information display (backdrop).** Every pixel serves gameplay readability. Adding tile reactions to events risks obscuring the board state with decorative noise. But Robot Uprising's SE Asian cyberpunk aesthetic and "living server farm" conceit demand a world that *feels* alive — a world that merely looks alive (ambient breathing) without responding to events feels like a screensaver, not a battlefield.

---

## The Event Taxonomy: What Can Tiles React To?

Before exploring design options, we need to catalog every game event that *could* trigger a tile reaction:

### Movement Events
| Event | Frequency | Biomes Affected | Notes |
|-------|-----------|----------------|-------|
| **Unit arrives on tile** | Every tick with moving units (scouts fast, strikers medium) | All | Most frequent event. Scout patrol covers 3-5 tiles/turn. |
| **Unit departs tile** | Same frequency as arrival | All | The "settling" after departure. |
| **Multiple units on same tile** | Uncommon (units are on grid) | All | Only during simultaneous-resolution movement. |

### Signal Events
| Event | Frequency | Biomes Affected | Notes |
|-------|-----------|----------------|-------|
| **Signal packet crosses tile** | Very frequent in mid-late game | All | Signals travel 1 tile/tick along channel paths. |
| **Signal delivery (green flash)** | Per successful signal receipt | Destination tile | Already has the existing 200ms green flash. |
| **EM emission from hook** | Per hook fire | Source tile | Hook transmissions emit detectable EM. |

### State Events
| Event | Frequency | Biomes Affected | Notes |
|-------|-----------|----------------|-------|
| **Context overload (stun)** | Uncommon but dramatic | Unit's tile | 1-tick stun with sparking/jittering visual. |
| **Unit destruction** | Rare (one-shot-one-kill) | Combat tile | Already handled by damage states (6.01a-iii). |
| **Tagging a tile/unit** | Moderate | Tagged tile | Cyan diamond marker on tagged targets. |

### Perception Events
| Event | Frequency | Biomes Affected | Notes |
|-------|-----------|----------------|-------|
| **Tile enters perception radius** | When units move | Radius tiles | Scout's 5-tile perception radius sweeps across board. |
| **Enemy detected in perception** | Moderate | Detecting unit's tiles | High-value information event. |

### Production Events
| Event | Frequency | Biomes Affected | Notes |
|-------|-----------|----------------|-------|
| **Factory spawns unit** | Every N ticks | Factory tile + adjacent | Assembly line glow already specified. |

---

## Design Option A: "The Backdrop" — No Event Reactions

Tiles breathe (ambient) and scar (combat) but are completely inert to non-combat events. What happens ON the tile doesn't affect the tile's animation.

**The philosophy:** The tile layer is scenery. Gameplay information is communicated through overlay layers (perception radii, signal lines, buffer bars, unit sprites). These layers are visually distinct from the terrain layer. Mixing gameplay information INTO the terrain layer creates ambiguity: "is that flicker a neon sign breathing, or did something just happen?"

**How it feels:** The battlefield is a beautiful, living diorama — but the robots move through it like ghosts. The terraces shimmer whether or not anyone is standing on them. The bioluminescence pulses regardless of signal activity. The jungle breathes without knowing there's a war happening in its canopy. There's a haunting beauty to this disconnection: the ancient Philippine landscape doesn't care about your robot uprising.

**Strengths:**
- Maximum board readability. No ambiguity about what's terrain vs. what's gameplay.
- Simplest implementation. Tile animations are fire-and-forget at mission start.
- Preserves the Breathing Rule (6.01a-i) absolutely — tile animation stays at 4-16s cycles.
- Into the Breach proven. The most commercially successful tactical game uses this approach.
- Artistic unity: the world's indifference to the robots creates a specific mood.

**Weaknesses:**
- The world feels disconnected from play. "Living server farm" conceit weakens when the server farm doesn't notice its occupants.
- Missed teaching opportunity: reactive tiles could reinforce what events mean (signal delivery, context overload).
- The sealed watch feels less visceral — you're watching a war on a postcard.
- Streams and TikTok clips lose a visual richness layer.

**Comparable games:** Into the Breach (pristine tiles), Advance Wars (static terrain), Fire Emblem (gentle ambient-only). These games succeed because their drama lives in unit interaction, not environmental reaction.

---

## Design Option B: "The Footprint" — Movement-Only Reactions

Tiles react only to units arriving and departing. The world acknowledges *presence* but not *activity*.

**Per-biome footprint reactions:**

| Biome | Unit Arrives | Unit Departs | Duration | Pixel Impact |
|-------|-------------|-------------|----------|-------------|
| **Ifugao Terraces** | Water displacement ripple: 3-4 concentric arcs of bright pixels expanding from unit position over 400ms, like dropping a pebble in a flooded paddy. The ripple pixels are 20% brighter than the ambient shimmer — the same blue-white, just a brief intensification. | Water settles: ripple in reverse, contracting back to stillness over 300ms. A tiny "sloshing" residual — one pixel oscillating bright/dark twice at 200ms — then back to ambient. | 700ms total | 8-12 pixels at peak (ripple ring) |
| **Siquijor Mystic** | Bioluminescence brightens: the tile's organic lights pulse to 100% opacity simultaneously (normally staggered). A brief "startled" response — all the fireflies wake up at once. 200ms unified bright, then they de-sync over 400ms back to their individual rhythms. | Bioluminescence dims: a 300ms dip to 40% opacity (all lights simultaneously go quiet, like fireflies hiding) before resuming their staggered pulse. The organism sensed something, went still, then relaxed. | 600ms total | 10-15 pixels |
| **Palawan Jungle** | Canopy rustle: the three leaf clusters shift 1 pixel in the unit's movement direction over 200ms, then drift back over 600ms. As if the canopy above was disturbed by something passing below. A single "leaf" — a 1px green dot — drifts from the cluster to a new position, settling. | Shadow shift: the dappled shadow pattern on the tile surface shifts 1 pixel toward the departed unit's exit direction, as if the canopy, briefly parted, is closing back. Slower than the arrival reaction — 800ms to complete. The jungle is slow to forget. | 800ms total | 4-6 pixels |
| **Cebu/Manila City** | Neon acknowledgment: the primary neon accent on the tile brightens by 30% for 200ms — a brief, involuntary flicker, like a motion sensor activating a security light. If the tile has fiber optic cable accents, they pulse once (bright→dim→ambient in 300ms). The city *notices*. | Neon fade: 400ms gradual return to ambient brightness. No dramatic effect — the city loses interest immediately. The security light turns off. | 400ms total | 3-5 pixels |
| **Taal Volcanic** | Seismic micro-tremor: the entire tile shifts 1 pixel down for 100ms then snaps back — a sub-pixel "shake" that's felt more than seen. The ember accents on the tile surface brighten momentarily (100% for 150ms), as if the footfall disturbed the crust. | Ember fade: brightened embers return to ambient over 400ms. No shake on departure — the ground doesn't care you're leaving, only that you arrived. | 400ms total | 2-4 pixels + 1px position shift |

**How it feels:** The world is *aware*. Robots aren't ghosts — they have mass, they disturb the environment. The rice paddy water ripples when the scout wades through it. The jungle canopy rustles when the striker pushes through. The volcanic ground trembles when the heavy Command unit is placed. But the world only cares about *presence* — it doesn't know or care about signals, context windows, or information architecture. It's a physical world reacting to physical beings.

**Strengths:**
- Creates "weight" — units feel like they exist in a physical space.
- Low visual noise — reactions are brief (400-800ms) and small (4-15 pixels).
- Doesn't compete with gameplay overlay information (signals, perception, buffer bars).
- Trainable: after 2-3 missions, players stop consciously noticing footprints but subconsciously register unit movement through peripheral tile changes.
- Each biome's personality deepens: the jungle is slow, the city is indifferent, Siquijor is startled, Taal is seismic.

**Weaknesses:**
- On a board with 8+ moving units, footprint reactions fire every tick on multiple tiles, potentially creating visual busyness.
- Still doesn't connect tile reactions to *information architecture* events (the game's actual subject).
- Animation complexity increases: each biome needs arrival + departure sprites/animations.
- Risk of "uncanny valley" — the world reacts to movement but not to signals, which are the game's core drama.

**The TikTok clip:** A scout patrol route filmed in slow motion. Each tile the scout crosses ripples, shimmers, trembles as it passes. The trail of slowly-settling tiles behind the scout traces its path across the board like footprints in sand. Caption: "Every step leaves a mark."

---

## Design Option C: "The Nervous System" — Signal-Reactive Tiles

Tiles react to signals passing through or near them. The environment becomes a visible extension of the information network — the world's infrastructure responds to the data flowing through it.

**Per-biome signal reactions:**

| Biome | Signal Crosses Tile | EM Emission On Tile | Signal Overload (3+ signals same tick) |
|-------|-------------------|--------------------|-----------------------------------------|
| **Ifugao Terraces** | The data-lights embedded in terrace stonework briefly shift from their ambient green (#00FF87) to the signal's channel color for 300ms, then fade back through white to green over 400ms. The signal literally *lights up the infrastructure* — the ancient terraces are conduits. The water shimmer pauses during the color shift (water freezes when data flows). | The data-lights pulse at double frequency (0.5 Hz) for 2 seconds, and a faint amber ring (#FFB347, 15% opacity) radiates outward from the unit by 4 pixels over 1 second — the EM "noise" is visible as a warm glow in the cool terrace light. | All three data-lights flash white simultaneously (200ms), the water shimmer inverts (bright pixels go dark, dark go bright) for one frame, then everything resettles. The terrace had a "hiccup." |
| **Siquijor Mystic** | The bioluminescent organisms along the signal's path pulse in sequence — a wave of brightness traveling from source-tile to destination-tile at 1 tile per tick, like a bioluminescent "wake" following the signal packet. The pulse color matches the channel color, bleeding through the cyan-green biology. The coral accents on the signal tile's edges flush warm (#FF6B9D → brighter #FF8FB4) for 200ms — the coral detects the signal as warmth. | Bioluminescence on the EM source tile goes arrhythmic for 2 seconds — normally independent organic rhythms suddenly synchronize to a rapid 0.25s pulse, then slowly desync. The electromagnetic emission *disturbs* the biology. Mangrove root shadows flicker (skip one sway frame). | All bioluminescence on the tile extinguishes for 500ms (total darkness on that tile), then reignites in a burst — all organisms at 100% simultaneously, then rapidly de-syncing. A "nervous system overload" — too many signals overwhelmed the organic network. |
| **Palawan Jungle** | A subtle "wind" effect: the leaf clusters on the signal tile shift 1 pixel in the signal's travel direction for 200ms, as if a gust from the data packet disturbed the canopy. The bamboo tips lean 1 pixel further than their normal sway. More felt than seen — the data moves like wind through the trees. | The canopy shadow darkens by 20% for 1 second — the EM emission heats the air above, creating a denser shadow. The flower accent (if present) shifts to a warmer color (red → orange). The jungle *warms* with the emission. | The bamboo accent snaps to maximum lean (2 pixels) and holds for 300ms before slowly returning — as if a strong gust blew through. Two "leaf" dots (1px each) detach from canopy clusters and drift downward 2 pixels, settling in the midline zone. Signal overload = windstorm in the canopy. |
| **Cebu/Manila City** | Fiber optic cable accents on the tile flash with the signal's channel color — a rapid pulse traveling along the cable's 3-4 pixel length in 100ms. This is the most literal: city infrastructure IS data infrastructure. The signal literally travels through the visible cables. If the tile has a neon sign, it flickers once (50ms blink-off, 50ms blink-on) — electromagnetic interference from the passing data packet. | Neon signs on the tile and adjacent tiles flicker arrhythmically for 2 seconds — the EM emission creates visible interference. The fiber optic cables glow steady amber instead of pulsing (#FFB347, the EM color). The city's electronic nervous system is agitated. A new animation element appears: a 1px "spark" jumps between two cable endpoints over 200ms. | Total neon brownout on the tile — all neon elements dim to 30% for 400ms, then surge back to 120% for 200ms, then settle to normal. The fiber optic cables flash white. Every electronic element on the tile briefly overloaded. The city had a "rolling brownout." |
| **Taal Volcanic** | Ember accents along the signal path brighten sequentially — each ember the signal crosses flares from its ambient orange to bright white for 150ms, creating a "fuse burning" effect that traces the signal's path across volcanic rock. | The seismic micro-tremor fires (1px down-shift, same as Footprint movement), but this time accompanied by a new element: a hairline crack appears on the tile surface (1px dark line, 3-4 pixels long) that heals over 2 seconds (pixels returning to surrounding color). The emission disturbs the crust. Ember count temporarily doubles. | The tile surface flashes the magma orange (#FF4500) through ALL cracks and edges for 300ms — the volcanic ground "pulses" with heat, as if the signal overload triggered a magmatic response. Temporary lava glow seeping through the rock. Then 1-second cool-down to ambient. The volcano WOKE UP. |

**How it feels:** The world is a living network. The Philippine landscape isn't just beautiful scenery — it's infrastructure. The rice terraces ARE the data conduits. The bioluminescent reef IS the relay network. The city's neon and fiber ARE the communication layer. When your agents send signals, the environment itself carries them. When EM emissions radiate, the ecology reacts. The battlefield isn't a board you fight ON — it's a system you fight THROUGH.

**Strengths:**
- Directly reinforces the game's core theme: information architecture is everywhere.
- Signals become spatially legible through environment — you can "read" network activity by watching tile reactions.
- Each biome's signal reaction deepens its personality: terraces = ancient conduit, Siquijor = biological network, jungle = invisible wind, city = literal infrastructure, Taal = seismic transmission.
- EM emission becomes viscerally visible — not just an abstract mechanic but something that disturbs the world.
- Signal overload creates memorable visual moments that generate clips.

**Weaknesses:**
- Signal-reactive tiles compete with existing signal visualization layers (colored dashed lines, green delivery flash).
- In late game with complex networks, 5+ signals per tick could create visual noise across many tiles simultaneously.
- Significant implementation complexity: each biome needs signal-path, EM, and overload animations.
- Risk of "christmas tree effect" — too many tiles reacting to too many events simultaneously looks chaotic.
- May violate the Breathing Rule if signal-frequency reactions (100-400ms) push tile animation speed above the 2-second minimum.

**The TikTok clip:** A relay node fires its amplify skill, and the signal propagates outward. As it travels, each Siquijor tile's bioluminescence lights up in sequence — a wave of blue-green fire sweeping across the dark volcanic board. The signal reaches three scouts simultaneously, their tiles erupting with light. Caption: "When the network lights up."

---

## Design Option D: "The Empathy Field" — State-Reactive Tiles

Tiles react to unit *state changes* — context overload, tagging, perception radius entry/exit, destruction. The world responds not to movement or data but to *condition*.

**Per-event state reactions:**

### Context Overload (Unit Stunned)
The most dramatic non-combat event in the game. When a unit's context window fills and overload triggers:

| Biome | Overload Reaction | Duration |
|-------|------------------|----------|
| **Ifugao Terraces** | ALL data-lights on the tile and the 4 adjacent tiles shift to emergency red (#FF3333) and pulse at 1 Hz (fast, urgent) for the full 1-tick stun duration. The water shimmer inverts to a warm amber reflection. The terrace's embedded systems are overheating. The surrounding tiles' data-lights dim to 20% — the overloaded unit is consuming all local processing power. | 1 tick (1 second) |
| **Siquijor Mystic** | Bioluminescence death spiral: all organic lights on the tile rapidly cycle through colors (cyan → magenta → amber → white → dark) in 500ms, then go completely dark for 500ms. The organism experienced a seizure. Adjacent tiles' bioluminescence dims sympathetically — the organic network feels the shock. | 1 tick |
| **Palawan Jungle** | The canopy "flinches" — all leaf clusters retract 2 pixels toward tile center (shrinking inward) over 200ms, creating a visible gap at the tile edges. Bamboo snaps to maximum lean. Flower dots vanish temporarily. The jungle is recoiling from electromagnetic pain. | 1 tick |
| **Cebu/Manila City** | Total brownout: ALL neon on the tile dies (0% opacity) for 600ms, then flickers back in staccato bursts (100ms on, 100ms off, 3 times), then stabilizes at 80% — not fully recovered. Fiber optic cables flash white, then go amber. Sparks: two 1px bright white dots appear at random positions on the tile surface, persist for 100ms each, representing electrical arcing. The grid is destabilized. | 1 tick + 500ms recovery |
| **Taal Volcanic** | Seismic event: the tile shifts 2px down (double the normal micro-tremor), adjacent tiles shift 1px. Ember accents flare to white. A new crack appears (3px, does NOT heal — persists as a permanent minor scar, but much subtler than combat damage). Lava glow seeps through the crack: 2px of #FF4500 visible beneath the surface. The overload was an earthquake. | 1 tick + crack persists |

### Tagging (Cyan Diamond Marker Applied)
When a unit tags a tile or target:

| Biome | Tagging Reaction |
|-------|-----------------|
| **Ifugao Terraces** | The data-lights on the tagged tile shift from green to cyan (#00E5FF) permanently (for the rest of the battle), joining the player's color vocabulary. The terrace's infrastructure has been claimed — it now serves YOUR network. Water shimmer takes on a faint cyan tint. |
| **Siquijor Mystic** | One bioluminescent organism at the tile's center grows brighter than the others and shifts to cyan — a "tagged" organism that pulses at a distinct 2s rhythm (faster than ambient, slower than signal reaction). The coral accents shift to cool cyan-tinged pink. |
| **Palawan Jungle** | A single pixel of cyan light appears in the canopy gap — like a marker flag planted in the undergrowth. The canopy clusters on the tagged tile shift 5% brighter, as if the tag cleared a path for more sunlight. |
| **Cebu/Manila City** | The primary neon accent on the tagged tile permanently shifts to cyan. In a biome dominated by magenta, gold, and warm neon, a single cyan neon sign is instantly conspicuous — your territory marker in the urban landscape. |
| **Taal Volcanic** | A cool cyan ember appears among the warm orange ones — visually alien, a point of order in volcanic chaos. The temperature contrast (cool cyan in hot orange) makes tagged Taal tiles the most visually striking. |

### Perception Radius Edge
When a tile enters a scout's perception radius (the boundary tiles):

| Biome | Entering Perception | Exiting Perception |
|-------|--------------------|--------------------|
| **All biomes** | Tile ambient animation speed increases by 25% for the tiles at the radius edge — they "wake up" slightly when being observed. This is extremely subtle: a 4-second shimmer cycle becomes a 3-second cycle. The effect is subliminal — the player shouldn't consciously notice, but the board feels slightly more alive in the perception zone. | Animation speed returns to default over 2 seconds (gradual, not instant). The tile "falls asleep" again. |

**How it feels:** The world has *empathy*. It doesn't just notice physical presence (footprints) or data flow (signals) — it feels the *emotional state* of the battle. Context overload is an earthquake. Tagging is territorial claiming. Perception is attention itself — the world wakes up when you look at it. This is the most thematically coherent option: the game is about attention and information, and the world responds to attention and information.

**Strengths:**
- Context overload becomes UNMISSABLE — you can see it in the environment even without watching the specific unit.
- Tagging becomes visually territorial — you're literally coloring the landscape with your network.
- Perception radius has a physical manifestation beyond the overlay circle.
- Thematic coherence: the world IS the attention system.
- Creates the most dramatic sealed watch moments: the moment an overload triggers and adjacent tiles go dark/red/brown is a FEELING.

**Weaknesses:**
- Context overload tile reaction competes with the unit's own stun visual (sparking/jittering) — is this redundant?
- Tag persistence changes tile appearance for the rest of the battle, which could clutter the board on tag-heavy strategies.
- Perception radius animation speed changes are SO subtle they may be wasted dev effort.
- State reactions happen at unpredictable intervals, making the board's visual rhythm irregular.

**The TikTok clip:** Three units hit context overload simultaneously (enemy noise flood tactic). Three tiles go dark. The neon brownout cascades across the city board — an entire district going dark like a blackout wave. Caption: "The grid went down."

---

## Design Option E: "The Living Stage" — Selective Event Reactions (RECOMMENDED)

A curated subset of event reactions, chosen for maximum thematic impact with minimum visual noise. Not every event gets a tile reaction — only the ones that make the game MORE legible, not less.

**The Selection Criteria:**
1. **Does the tile reaction communicate something the existing overlay doesn't?** If the overlay already shows it clearly (signal delivery green flash, perception radius circle), the tile doesn't need to duplicate it.
2. **Does the tile reaction reinforce a core learning?** Context overload = the WORLD breaks, not just the unit. This teaches "overload is systemic, not personal."
3. **Is the reaction brief enough to stay below gameplay events on the motion hierarchy?** Nothing faster than 200ms (signal delivery owns that speed).
4. **Is the reaction rare enough to feel meaningful?** High-frequency events (every-tick movement) dilute reaction impact. Low-frequency events (overload, tagging) stay special.

**The Curated Event Set:**

### Tier 1: Always Active (All Missions)

**Context Overload Tile Reaction** — The most important reactive animation in the game.

When a unit enters context overload stun on a tile:
- The tile's ambient animation **inverts** for the 1-tick duration: water that was bright goes dark, bioluminescence that was pulsing freezes, neon that was flickering dies, jungle shadows that were shifting lock in place.
- The **4 adjacent tiles** dim their ambient animation to 50% intensity for 500ms — the overload "radiates."
- The tile itself gets a 1px bright border flash in the overloaded unit's buffer bar color (amber/red depending on severity) for 200ms — a brief, hot outline that draws the eye.

This is the *only* tile reaction in Missions 1-4. It teaches the lesson hard: context overload is so catastrophic that the GROUND reacts. The world flinches.

**Sensory description:** Tick 14. Your scout's buffer bar was amber, and you watched it with growing dread. Tick 15: context overload triggers. The rice terrace tile under the scout goes DARK — the shimmering water freezes mid-ripple, the three green data-lights snap to amber and pulse double-speed, frantic, like a server alarm. The four surrounding tiles dim — their water stops shimmering, their data-lights fade to half-brightness, as if the processing power was sucked toward the crisis. A hot amber border flashes around the scout's tile for one-fifth of a second. And the scout itself sparks and jitters, unable to act. The entire southeast corner of the board just gasped. Two seconds later, everything settles back to ambient. But you remember.

### Tier 2: Unlocks at Mission 5 (Factory Introduction)

**Tagging Tile Tint** — Persistent, subtle, strategic.

When a tile or unit is tagged:
- The tile's primary accent color shifts to include a cyan component. Not a full color change — a *tint*. The green data-lights gain a cyan edge. The bioluminescence shifts cooler. The neon acquires a cyan reflected glow on the tile surface.
- The shift is permanent for the battle duration.
- This creates a slowly-growing "territory map" in the tile layer itself, legible WITHOUT the tagging overlay enabled.

**Why Mission 5:** Tagging is introduced as a production/factory mechanic. The tile tint makes tagged territory viscerally visible as the player learns resource control.

### Tier 3: Unlocks at Mission 7 (Command Agent)

**EM Emission Environmental Disturbance** — Makes emissions tangible.

When a hook fires and emits EM:
- The emitting unit's tile experiences a brief environmental "disturbance" specific to biome:
  - Terraces: water shimmer pauses for 200ms (electromagnetic interference freezes the water's reflective pattern)
  - Siquijor: bioluminescence briefly synchronizes (200ms all-at-once pulse, then de-syncs)
  - Jungle: one leaf cluster shifts 1px toward the unit (canopy attracted by the EM field)
  - City: fiber optic cables flash amber for 200ms (the cables carry the emission involuntarily)
  - Taal: embers brighten 30% for 200ms (the heat from computation)
- **Crucially, enemy hooks do this too.** On the sealed watch, an alert player can spot EM disturbances on tiles where they can't see enemy units — the ENVIRONMENT betrays enemy communication.

**Why Mission 7:** Command agents are introduced, creating deep hook architectures with significant EM output. The environmental disturbance becomes a readability aid for the player's growing network AND a detection tool for enemy activity.

### NOT Included

- **Movement footprints:** Too frequent, too subtle to notice, too disconnected from the core theme.
- **Signal path tile reactions:** Redundant with existing signal visualization (colored dashed lines + green delivery flash). The overlay is clearer than subtle tile changes.
- **Perception radius tile changes:** Too subtle to justify implementation cost. The existing perception radius circle overlay is sufficient.
- **Factory production tile reactions:** The factory already has its own production animation (assembly line glow, conveyor movement).

**Interaction with motion hierarchy (updated from 6.01a-i):**
1. **Combat flash** (100ms, red) — fastest
2. **Signal delivery** (200ms, green line)
3. **Context overload tile flash** (200ms, amber border) — NEW, same tier as signal delivery
4. **EM disturbance** (200ms, per-biome) — NEW
5. **Tick resolution snap** (instant, unit repositioning)
6. **Buffer bar changes** (300ms transition)
7. **Tag tint shift** (500ms crossfade) — NEW
8. **Context overload radiation** (500ms fade on adjacent tiles) — NEW
9. **Unit idle animation** (2-4s cycle)
10. **Tile ambient animation** (4-16s cycle) — slowest

**Implementation cost:** 3 new animation systems (overload, tag tint, EM disturbance) × 5 biomes = 15 biome-specific reaction animations, plus the adjacency radiation system for overload. Significant but bounded.

---

## Player Journeys

#### Journey: Sofia, 15, Manila — First-time strategy game player

**Context:** Mission 3 (Siquijor). Sofia has learned context windows and basic rules. She hasn't experienced context overload yet. Her scout has a 6-slot buffer with default listen-all, no filters.

**Minute 0:00 — Plan Screen**
Sofia equips her scout with patrol and a basic hook (ON_DETECT → send to "alert" channel). She doesn't adjust the context config — the default listen-all seems fine, why would you ignore information? She hits EXECUTE.

**Minute 0:15 — Sealed Watch, Tick 1-8**
The scout patrols northeast, its perception radius sweeping across Siquijor tiles. The bioluminescent tiles breathe their slow, firefly-like rhythms. Signal dashed lines appear as the scout spots enemies and fires hooks. The board is alive but calm. Sofia watches the buffer bar at the scout's feet — five of six slots are filled. She doesn't know what that means yet.

**Minute 0:30 — Sealed Watch, Tick 9 — The Overload**
Two enemies enter the scout's perception simultaneously. Two observations fill slots. A signal arrives from the relay. Buffer: 6/6. Another observation tries to enter. CONTEXT OVERLOAD.

The Siquijor tile under Sofia's scout goes BLACK. Every bioluminescent organism — the pulsing cyan-green lights she'd been watching for 8 seconds — extinguishes simultaneously. The four adjacent tiles dim, their bioluminescence fading to half-brightness, like a circle of darkness spreading from the scout. A hot amber border flashes around the dark tile for a split second.

Sofia physically startles. "What happened?!" She leans forward. The scout is sparking, jittering, frozen in place. The surrounding tiles slowly re-illuminate over the next tick. But the scout doesn't move. It missed its action. The striker, waiting for the scout's signal that never came, also stalls.

The moment costs her the mission.

**Minute 1:15 — Inspector**
Sofia clicks the scout at Tick 9. The context window detail shows: all 6 slots full, new entry couldn't fit, OVERLOAD triggered. She drags the timeline scrubber back and forth across Tick 8-9. At Tick 8, the tile was bright. At Tick 9, dark. The darkness IS the overload. She understands: the world went dark because her scout's mind was full.

**Minute 1:45 — Plan Screen (Retry)**
Sofia opens context config for the first time. She toggles "listen to enemy-position" to IGNORE for the relay channel — the scout can see enemies itself, it doesn't need to be told. She hits EXECUTE. This time, the buffer stays at 5/6 through Tick 9. The Siquijor tile keeps glowing. The scout acts. The mission succeeds.

**What she learned:** Context overload is visible in the WORLD, not just the UI. Filtering isn't about optimization — it's about preventing the ground from going dark under your agents' feet.

---

#### Journey: Marcus, 38, Portland — Factorio veteran, Mission 8 (Manila cyberpunk)

**Context:** Marcus runs a complex relay network with a Command agent managing 4 subordinates. He's optimizing EM exposure across his architecture. He has 6 hooks firing across 3 channels.

**Minute 0:00 — Plan Screen**
Marcus studies the channel map. He's running "recon-net," "strike-cmd," and "emergency." His Command agent has 6 hook slots, all filled. He's aware that hook emissions create EM noise, but he's never *seen* it — he's been relying on the EM emission ring overlay (which he often turns off because it clutters the board).

**Minute 0:20 — Sealed Watch, Tick 1-5 — The City Lights Up**
Marcus's relay fires its first hook on Tick 2. On the Manila tile beneath the relay, the fiber optic cable accents flash amber — just for 200ms, a quick pulse of warm light along the 3-pixel cable run. Marcus barely notices. On Tick 3, two hooks fire simultaneously (relay compress → Command reroute). Two tiles flash amber. The neon on the relay's tile stutters once — a 50ms blink-off that reads as electrical interference.

Marcus frowns. "Did the neon just—?"

**Minute 0:45 — Sealed Watch, Tick 8-12 — The Enemy's Ghost**
A tile in the northeast corner — a tile Marcus has no units near, a tile deep in enemy territory — flashes amber. Fiber optic cables on that tile pulse. Then another tile. Then another. A trail of amber flashes moving east to west.

"Those are enemy hooks." Marcus leans in. He can't see the enemy units (they're outside his perception), but he can see the CITY REACTING to their communications. The Manila infrastructure doesn't discriminate — it carries everyone's signals, and it flickers for everyone's emissions.

Marcus mentally maps the amber flash trail. Northeast to west. Three hops. The enemy has a relay chain running parallel to his own, one row north. He hadn't seen it on his scout passes. But the city told him.

**Minute 1:10 — Plan Screen (Next Round)**
Marcus adjusts his scout's patrol route to sweep the northeast corridor. He extends a hook to monitor that area. He also starts thinking about his OWN emission footprint — if he can see the enemy's hooks through tile flickers, the enemy can see his. He opens context config and starts adding signal filters to reduce unnecessary hook firings. Stealth through infrastructure silence.

**What he learned:** EM emissions are physically visible in the environment, not just as an abstract overlay. The city is a shared nervous system — it reveals your enemy's architecture, but also yours.

---

#### Journey: Aisha, 42, Lagos — Accessibility tester, low-vision (uses 150% zoom), Mission 6

**Context:** Aisha tests games for accessibility compliance. She's playing at 150% browser zoom, which means fewer tiles on screen but larger tile details. She's evaluating whether tile reactions are readable at her zoom level.

**Minute 0:00 — Plan Screen**
At 150% zoom, the workbench fills the right two-thirds of the screen. The 8×8 board preview is small but the individual tiles are large enough to see detail — each tile is roughly 96×48 pixels at her zoom level, up from the native 64×32. The data-light dots on the Cebu city tiles are clearly visible as individual glowing points. Aisha configures a standard relay-scout-striker setup for Mission 6.

**Minute 0:15 — Sealed Watch — Overload as Lifeline**
Aisha's zoom level means she can see only 5×4 tiles at once without scrolling. Her striker is off-screen to the southeast. On Tick 7, something happens off-screen: her striker hits context overload. She didn't see the striker's buffer bar fill.

But she DID see the *adjacent tiles* dim. Two tiles at the edge of her viewport — the northeast corner — suddenly drop their ambient animation intensity. The neon on one tile fades. The fiber optic cable on the other stops pulsing. Something happened nearby. Aisha scrolls southeast and finds her striker stunned.

"That radiation effect saved me." Without the adjacency dimming, she would have missed the overload entirely because the unit was off-screen. The tile reaction extended the overload's visibility beyond the unit itself.

**Minute 0:40 — Inspector Analysis**
Aisha scrubs to Tick 7. At her zoom level, the overload tile is large and the amber border flash is prominently visible — the 1px border at native resolution is approximately 1.5px at 150%, which is within her readability threshold. She notes: the tile reaction is MORE readable at zoom than the buffer bar text ("6/6 OVERLOAD"), which requires reading tiny numbers. The tile going dark is a spatial, non-text signal.

**Minute 1:00 — Assessment**
Aisha writes in her evaluation: "Tile overload reaction: passes. Adjacency radiation: critical for off-screen awareness at zoom levels. Recommend: ensure adjacency dimming radius is at least 2 tiles to cover common zoom viewport gaps. Tag tint: passes — color shift is visible at 150% but the cyan-in-neon contrast should be tested with colorblind simulation. EM disturbance: marginal — 200ms ambient flash is at the edge of readability at this zoom level; consider extending to 300ms."

**What she learned:** Tile reactions serve an accessibility function beyond aesthetics — they extend event visibility spatially, which matters more as viewport size decreases with zoom.

---

#### Journey: Kwame, 28, Accra — Twitch streamer, Diamond-ranked Gauntlet player, Mission 10 (Taal Volcano)

**Context:** Kwame is streaming his Gauntlet qualifying run. 2,400 viewers. Mission 10 is the climax — factory vs. factory on the Taal volcanic board. He's running a "Stealth Doctrine" build: minimal hook architecture, maximum context filtering, low EM signature.

**Minute 0:00 — Plan Screen, Stream Commentary**
"Chat, look at this. Zero hooks on the scouts. ZERO. They only report via a single compressed relay chain. One channel. One hop. My opponent last round was running six channels — his board was flickering like a Christmas tree. That's how I found his Command unit in four ticks."

Kwame points to his channel map: one line. "Recon-whisper." His production queue: 4 scouts, 1 relay, 2 strikers. Minimal, silent, lethal.

**Minute 0:30 — Sealed Watch — The Quiet Board**
Kwame's units deploy. His scouts patrol in calculated routes — and the Taal tiles barely react. The embers breathe their slow ambient pulse. No EM disturbances. No amber fiber flashes. His relay fires its single hook every 3 ticks — a brief 200ms ember brightening on one tile, barely visible.

"See that? Nothing. My board is QUIET." Chat: "ghost mode activated 👻" "monkaStealth"

Meanwhile, the opponent's side of the board (enemy spawner, northeast) is alive with activity. Amber EM disturbances ripple across Taal tiles in the far corner — ember brightening, micro-tremors, crack flashes. The enemy is running a heavy communication architecture.

"Chat. COUNT the flashes. Three... four... five hooks per tick cycle. He's running a full Command cascade. I can see it from HERE. He's LOUD."

**Minute 0:55 — The Kill**
Kwame's silent scout has mapped the enemy's relay position by watching tile EM disturbances from 3 tiles away — never entering perception range, just watching the volcanic ground react to enemy signals. The striker advances through a dead-signal corridor (tiles that never flash amber) to avoid enemy detection.

Tick 22: Striker adjacent to enemy relay. One-shot kill. The Taal tile under the destroyed relay cracks (combat damage). But more importantly: the northeast corner of the board goes QUIET. The EM disturbances that had been rippling through 4-5 tiles every tick... stop. The embers return to their slow ambient pulse. The volcano calms.

"THE SILENCE." Kwame's voice drops. "Chat. Listen. His network just died. You can HEAR it — no, you can SEE it. The tiles are calm. His relays are gone. He's blind."

Chat erupts: "STEALTH DOCTRINE SUPREMACY" "the tiles told the story" "clip it CLIP IT"

**Minute 1:30 — Post-match**
Kwame pulls up the replay in Inspector. He scrubs back and forth across Tick 20-22, watching the EM activity on the enemy's tiles. "Look at this tile here. See the ember flashing? That's his Command agent firing hooks. Now Tick 22 — relay dies. Tick 23 — this tile goes dark. The Command agent can't reach anyone. The tiles SHOW YOU the network collapse."

2,400 viewers. 47 clips created. Top clip title: "He won by watching the ground."

**What he learned:** Stealth is visually legible through tile EM reactions. Network health is readable in the environment. The most dramatic moment isn't the kill — it's the silence that follows.

---

## Interaction Effects

### With Dynamic Tile Damage (6.01a-iii)
The curated reactions (Option E) are designed to coexist with damage states. Overload tile reactions are *temporary* (1 tick), while damage is *permanent*. EM disturbances are *brief* (200ms), while scars are *lasting*. The two systems communicate different things: damage says "combat happened here," reactions say "something is happening here RIGHT NOW."

Potential conflict: if a tile is already damaged AND an overload triggers on it, the overload's "ambient inversion" effect needs to work on the damaged tile's animation state, not the pristine one. Implementation detail: overload → invert whatever the current tile state is, including damaged.

### With Signal Visualization (3.10)
The Nervous System approach (Option C) would compete with the locked signal chain visualization (colored dashed lines). Option E avoids this by NOT including signal-path tile reactions. The EM disturbance is subtler — it shows WHERE emissions originate, not where signals travel. The dashed lines show the path; the tile EM shows the source.

### With Tile Animation Budget (6.01a-i)
Option E's reactions are brief (200-500ms) and infrequent (overload is rare, EM fires once per hook per tick, tagging is occasional). They don't violate the Breathing Rule because they're *events*, not *cycles* — they interrupt the ambient breathing momentarily but don't sustain faster-than-2-second loops. The 200ms EM disturbance is a momentary spike, not a new animation cycle.

### With Accessibility (6.01a-v)
Overload radiation (adjacent tile dimming) is an accessibility WIN — it extends event visibility spatially, helping players using zoom or with limited viewport. The EM disturbance is the weakest accessibility case — 200ms ambient changes are at the edge of perception for low-vision players. Tag tint changes are persistent and high-contrast (cyan in non-cyan environments).

### With Inspector (Locked)
In Inspector mode with timeline scrubber, tile reactions should replay at the scrubbed tick. This means: scrubbing to Tick 9 should show the overload tile reaction frozen at its peak state. Scrubbing to Tick 8 shows the tile in ambient state. This makes the Inspector timeline a tool for reading environmental evidence.

### With Sealed Watch Pacing
The sealed watch is 1-tick-per-second with no pause. Tile reactions that complete within one tick (1 second) are naturally paced by the tick clock. The overload reaction starts and resolves within 1 tick. EM disturbances (200ms) are visible for one-fifth of a tick. This is intentional — blink and you miss the EM. Pay attention and you see everything.

### With Streaming and Content Creation
Kwame's journey demonstrates the clip-generation value. The EM visibility system creates a new dimension of strategic legibility that rewards attentive viewers. "Watch the tiles, not the units" becomes an advanced spectator skill.

---

## Comparable Games

**Into the Breach:** No tile reactions at all. Tiles are pristine surfaces. All information is in overlay icons and unit sprites. This works because Into the Breach's decision space is small (4 units, 8×8 grid, full information). Robot Uprising's larger information space (5+ unit types, channels, context windows, EM emissions) benefits from environmental reinforcement that Into the Breach doesn't need.

**Advance Wars: Re-Boot Camp (2023):** Tiles change weather effects (rain, snow) globally but never react to unit actions. Units interact with terrain mechanically (forest = defense bonus) but the terrain doesn't visually respond. A missed opportunity that Robot Uprising can exploit.

**Factorio:** The ground under factories develops visual wear (darker tiles, oil stains, biome death). This is permanent environmental change, not reactive animation. However, the fluid pipe system has visible fluid level indicators that respond to throughput — the closest analogue to Robot Uprising's signal-reactive tiles. Players report that visible pipe flow helps debug factory logistics problems.

**Oxygen Not Included:** Has "overlay" modes that change what tiles show (temperature, germs, gas pressure). The base tile doesn't react to events, but the overlay system lets players *choose* to see environmental response data. Robot Uprising's Option E bakes a subset of this into the base tile layer permanently — you don't need to toggle an overlay to see overload radiation.

**Disco Elysium:** The thought cabinet and dialogue system create a world that "reacts" to internal state through UI changes, but this is character-internal, not environmental. The philosophical parallel holds: the environment as expression of cognitive state.

**Ori and the Blind Forest / Ori and the Will of the Wisps:** Environmental tile reactions to player movement (grass bends, water ripples, light follows). These are 100% aesthetic (no gameplay information). Robot Uprising's Option B (Footprint) draws from this tradition, but Option E upgrades it by making reactions informationally meaningful.

---

## Sensory Summary

**What it LOOKS like (Option E, The Living Stage):**
- Most of the time: tiles breathe their slow ambient cycles. The board is calm, beautiful, alive but unhurried.
- When overload triggers: a localized SHOCK. One tile goes dark, adjacent tiles dim, an amber border flashes. A visible flinch in the landscape. Then recovery — slow return to ambient.
- When hooks fire: a brief amber flicker in the tile's infrastructure — data-lights, fiber optics, embers — lasting a fifth of a second. Barely visible unless you're looking. But if you're looking, you see everything.
- When tiles are tagged: a permanent cyan tint creeping into the environment. Over the course of a battle, the board develops a territory map in its own ambient aesthetics. Your half of the board glows subtly cooler.
- The overall feeling: the world isn't a backdrop. It's a nervous system. It flinches when your agents are overwhelmed, it whispers when data flows, it marks what you claim. You are fighting inside a living thing.

**What it SOUNDS like:**
- Overload tile reaction: a low, reverberant "throom" sound (tuned to biome — lower for Taal, organic for Siquijor, electrical for City). Plays simultaneously with the unit's sparking stun sound, creating a dual-layer audio event: mechanical spark (unit) + environmental rumble (tile). The combination says: "this affected more than just the unit."
- EM disturbance: silence. The tile reaction is visual-only for EM. The absence of sound for this event is intentional — EM emissions are *supposed* to be invisible/inaudible. The tile reaction betrays them visually, but adding sound would make them too obvious and undermine the detection skill.
- Tagging: a soft, sustained "hmm" — a resonance that fades in as the tile's cyan tint takes hold, then blends into the ambient biome audio. The sound of infrastructure being claimed.

**What it FEELS like:**
- You're managing a server farm and the floor tiles are LED panels reflecting system health. When a service goes down, the floor flashes red. When traffic flows, the floor glows with data. When you provision new capacity, the floor turns your team's color. The building IS the dashboard.

---

## New Aspects Discovered

1. **6.01a-vii-a — Overload radiation radius tuning:** Should adjacency dimming be 1-tile (4 neighbors), 2-tile (12 neighbors), or proportional to unit buffer size? Larger Command unit overloads radiating further than scout overloads creates visual hierarchy matching severity.

2. **6.01a-vii-b — Enemy overload tile reactions as intelligence:** When an ENEMY unit overloads (even one you can't see), should the tile reaction be visible from outside perception range? This creates a detection mechanic: "I saw tiles dim over there — an enemy just overloaded." Interaction with EM emissions model.

3. **6.01a-vii-c — Tag tint in competitive/PvP context:** In PvP, both players tag tiles. Does each player see only their own tag tints? Does the opponent's tag tint appear in a different color (orange)? Dual-tint territory visualization as contested-space readability.

4. **6.01a-vii-d — Tile reaction intensity as difficulty signal:** Should tile reactions become more dramatic on higher-difficulty missions (Gauntlet, Doctrines)? The same overload that causes a subtle dim in Mission 3 causes a board-wide ripple in Mission 10. Environmental drama scaling with stakes.

5. **6.01a-vii-e — Inspector tile reaction replay controls:** In Inspector mode, should tile reactions be replayable at slow-motion? A "show tile reactions" toggle that replays environmental responses at 0.25x speed, making EM detection patterns visible to players who missed them in real-time sealed watch.
