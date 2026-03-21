# 9.43 — Palette Exploration: SE Asian Cyberpunk Color Systems

## Overview

Robot Uprising's visual identity lives at an intersection no game has claimed: **Southeast Asian cyberpunk rendered in isometric pixel art.** The palette must simultaneously evoke the lush, humid, overgrown tropics of the Philippine archipelago AND the hard-edged neon glow of a machine intelligence network. It must work across radically different terrain biomes — from the jade-green stepped terraces of Ifugao to the electric vertical sprawl of a cyberpunk Manila — while maintaining a cohesive identity that reads as "one game."

This document presents four distinct palette options, each anchored in a different emotional center of the SE Asian cyberpunk spectrum. Every palette must solve the same core constraints:

- **Readability on an 8x8 grid.** Units must pop from terrain at 90px tile scale. Signal chains (colored dashed lines) must be visible against any terrain tile.
- **Three-screen coherence.** The Plan screen workbench (DOM/React) and the battlefield (Pixi.js canvas) share the same board but different rendering contexts. Palette must work in both CSS and pixel art.
- **Faction distinction.** Player units vs. enemy units must be instantly separable. Signal delivery (green flash) and combat (red flash) must read clearly.
- **Accessibility.** Context bars on units use color to show fill level (cool→amber→red). These must be distinguishable by players with deuteranopia (red-green color blindness, ~8% of males).
- **Mood escalation.** Mission 1 (Ifugao rice terraces) should feel different from Mission 10 (Taal volcano final boss). The palette must stretch across calm-to-intense without breaking.

---

## Palette A: "Monsoon Circuit" — The Humid Data Forest

### Philosophy

Rooted in the overwhelming green of Philippine jungle canopy after a downpour, cut through with bioluminescent data streams. This palette says: **nature has been networked, not replaced.** The machines grew out of the jungle like vines. Server racks are wrapped in moss. Fiber optic cables run alongside mangrove roots. The dominant mood is humid, dense, alive — with cold data-blue slicing through like lightning through rain clouds.

### Core Hex Values

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Background** | Deep Jungle Black-Green | `#0B1A14` | Night sky, deep shadow, UI panel backgrounds |
| **Terrain Base** | Wet Moss Green | `#2D5A3D` | Jungle floor, rice terrace walls, terrain fill |
| **Terrain Highlight** | Canopy Jade | `#4A9B6E` | Elevated terrain, terrace tops, foliage highlights |
| **Signal Accent** | Data Teal | `#00D4AA` | Signal chains, channel wiring, active connections |
| **Alert/Combat** | Ember Orange | `#E8742A` | Combat flash, damage indicators, enemy aggression |
| **Neon Accent** | Bioluminescent Magenta | `#D946A8` | Hook triggers, overload warnings, critical events |
| **Player Units** | Cool Cyan | `#5CE0D6` | Player unit outlines, friendly indicators |
| **Enemy Units** | Rust Crimson | `#C43A31` | Enemy unit tint, hostile territory markers |
| **UI Text** | Pale Fern | `#D4E8D0` | Body text, labels, secondary information |
| **UI Highlight** | Signal White | `#F0F7F4` | Headers, selected states, active elements |

### Province Mapping

- **Ifugao (Mission 1):** The palette's sweet spot. Terraces rendered in `#2D5A3D` and `#4A9B6E` with water channels glowing `#00D4AA` — the rice paddies are literally coolant systems. Mist particles in `#D4E8D0` at 30% opacity drift across the board. The tutorial unfolds in an environment that feels ancient and alive, the machines embedded so deeply in the landscape they might have always been there.
- **Siquijor (Mission 2):** The magenta accent `#D946A8` dominates here — bioluminescent fungi on volcanic rock, mystic relay towers pulsing violet through the jungle dark. The teal data streams become underwater fiber optic cables visible through the black `#0B1A14` ocean floor.
- **Palawan (Mission 3):** Turquoise water replaces jungle green — `#5CE0D6` and `#00D4AA` dominate the terrain palette. White sand tiles in `#F0F7F4` contrast with palm-shadow dark tiles. The jungle canopy colors pull back to the board edges while the center opens into bright beach light.
- **Manila (Mission 8):** The palette strains here. This is a jungle palette asked to render a megacity. The greens become neon signage on dark buildings — `#4A9B6E` as green neon tube light rather than foliage. `#0B1A14` becomes concrete shadow. It works, but the city feels overgrown, reclaimed — which may be intentional for a post-uprising Manila, but loses the electric vertical density of a living cyberpunk metropolis.
- **Taal Volcano (Mission 10):** `#E8742A` and `#C43A31` take over — molten data flows, volcanic ember particles, the green pushed to the margins. The palette's calm green baseline makes the volcano's orange-red dominance feel like genuine escalation, a biome that has caught fire.

### Strengths

- **Unique in the market.** No strategy game looks like this. The green-dominant cyberpunk aesthetic is almost unheard of — cyberpunk defaults to blue/purple/pink. This would be instantly recognizable in screenshots and trailers.
- **Philippine identity is front and center.** The jungle green immediately evokes the archipelago. Paired with rice terrace geometry and mangrove-root architecture, the cultural specificity is unmistakable.
- **Natural mood escalation.** The calm green baseline gives enormous dynamic range. When combat intensifies and orange/red flashes fill the board, it reads as genuine disruption of a peaceful system — emotionally effective.
- **Excellent for the TikTok clip.** A lush green isometric board with teal data streams suddenly erupting in orange combat flashes and magenta overload sparks — visually arresting, unlike anything in the strategy genre.

### Weaknesses

- **Urban missions suffer.** Manila, Cebu, and other city missions fight against the jungle palette. Green neon on buildings is a creative stretch.
- **Red-green accessibility risk.** The core terrain palette (green) against enemy indicators (red) is the exact pair that deuteranopia makes indistinguishable. Requires strong shape-coding in addition to color — enemy units need distinct silhouettes, not just red tint.
- **Context bar readability.** The standard green→amber→red context bar progression competes with the green terrain. Needs a cool-blue→amber→hot-pink alternative on green backgrounds.
- **Risk of muddiness.** Dense green pixel art at small scales can collapse into visual soup. Requires aggressive value contrast (light vs. dark) within the green hue range to maintain tile edge clarity.

---

## Palette B: "Neon Jeepney" — The Electric Street Festival

### Philosophy

Inspired by the maximalist color explosion of Philippine jeepney art, fiesta lighting, and sari-sari store signage. This palette says: **the machines inherited human culture's loudest tendencies.** Every surface is painted, decorated, lit. The robots didn't build a sterile future — they built a noisy, colorful, chaotic one. The dominant mood is vibrant, warm, celebratory — with cool accents cutting through like air conditioning in a Manila summer.

### Core Hex Values

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Background** | Midnight Asphalt | `#121018` | Deep shadows, UI panel backgrounds |
| **Terrain Base** | Warm Concrete | `#3D3345` | Urban floor, road surface, building foundations |
| **Terrain Highlight** | Jeepney Chrome | `#8B7FA3` | Elevated surfaces, metal structures, reflective elements |
| **Signal Accent** | Fiesta Gold | `#FFB627` | Signal chains, channel wiring, active connections |
| **Alert/Combat** | Hot Red-Orange | `#FF4D2A` | Combat flash, damage indicators, enemy aggression |
| **Neon Accent** | Jeepney Magenta | `#FF2D8A` | Hook triggers, overload warnings, neon signage |
| **Secondary Neon** | Electric Teal | `#00E5C7` | Secondary signals, data streams, coolant flows |
| **Player Units** | Clean Cyan | `#4DE8FF` | Player unit outlines, friendly indicators |
| **Enemy Units** | Toxic Orange | `#FF6B1A` | Enemy unit tint, hostile territory markers |
| **UI Text** | Warm White | `#F2EDE8` | Body text, labels, secondary information |
| **UI Highlight** | Neon White | `#FFFFFF` | Headers, selected states, active elements |

### Province Mapping

- **Ifugao (Mission 1):** The warm concrete `#3D3345` becomes sun-baked terrace stone. Fiesta gold `#FFB627` data streams run through irrigation channels like liquid circuitry. The palette feels like a mountain village at dusk when the generator kicks on and colored bulbs light the terraces for a harvest celebration. Less "ancient nature," more "ancient culture that adopted technology like it adopted everything else — loudly."
- **Siquijor (Mission 2):** The magenta `#FF2D8A` and teal `#00E5C7` play together as bioluminescence and dark magic — witch-island aesthetics rendered in neon. The dark background `#121018` is the ocean at night. Signal chains in gold cut through the darkness like fishing boat lights.
- **Palawan (Mission 3):** Teal `#00E5C7` takes the lead as ocean water. The warm palette makes the beach feel like a sunset-lit forward base — orange-gold light on sand, magenta sky gradients at the board edges. Palm tree silhouettes in `#121018` frame the composition.
- **Manila (Mission 8):** This is where the Neon Jeepney palette comes HOME. Every color fires at full intensity. Gold neon karaoke signs, magenta bar lights, teal convenience store glow, the warm concrete of brutalist buildings — the city is a full-spectrum assault. Jeepney-styled transport drones in chrome and magenta. Sari-sari store command nodes with hand-painted signage. This is the mission that justifies the entire palette.
- **Taal Volcano (Mission 10):** The hot red-orange `#FF4D2A` and toxic orange `#FF6B1A` dominate — but against the already-warm palette, the escalation is subtler than Monsoon Circuit's green-to-red shift. The gold becomes molten, the magenta becomes volcanic gas lit from below. Effective but less dramatic contrast.

### Strengths

- **Culturally specific and joyful.** Jeepney art is *the* iconic Philippine visual language — maximalist, hand-painted, unapologetically colorful. This palette immediately communicates "Philippines" to anyone who has seen a jeepney.
- **City missions are perfect.** The urban cyberpunk aesthetic is where this palette was born. Manila, Cebu, and Batanes urban areas will look spectacular.
- **High energy.** The warm, saturated palette creates an exciting, arcade-like feel that matches the "you are leading a robot uprising" fantasy. This feels like a game that is fun to watch.
- **Strong faction distinction.** Player cyan `#4DE8FF` vs. enemy orange `#FF6B1A` is a high-contrast pair that works even for most forms of color blindness.

### Weaknesses

- **Jungle/nature missions feel forced.** Ifugao terraces and Palawan jungle in warm concrete tones lose the lush greenery that defines those places. The palette imposes an urban lens on rural landscapes.
- **Visual fatigue.** Maximum saturation across the board is exciting for 15 minutes and exhausting for 2 hours. Strategy games are long-session experiences. The palette may need a significant desaturation pass for extended play.
- **Overload state is hard to escalate.** When everything is already neon, how does "context overload" read as MORE intense? The dynamic range from calm to crisis is compressed.
- **Readability at density.** Multiple neon colors on a dark background at small pixel scale can create chromatic vibration — adjacent saturated hues (magenta next to gold next to teal) shimmer unpleasantly, especially on LCD monitors with aggressive backlighting.

---

## Palette C: "Coral Reef Protocol" — The Submerged Network

### Philosophy

Drawn from the underwater world of Philippine coral reefs — the Tubbataha Reef, Apo Island, the Sulu Sea. This palette says: **the network infrastructure is submarine.** Data cables run along the ocean floor. Relay stations are built into coral formations. The dominant mood is deep, cool, luminous — with warm coral and anemone accents breaking through the blue like life finding a way through cold data.

### Core Hex Values

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Background** | Abyssal Blue-Black | `#0A0E1A` | Deep ocean, UI panel backgrounds |
| **Terrain Base** | Deep Reef Blue | `#1A3A5C` | Ocean floor, underwater terrain, deep shadow |
| **Terrain Highlight** | Shallow Lagoon | `#2E7D9B` | Elevated terrain, shallow water, reef platforms |
| **Signal Accent** | Bioluminescent Cyan | `#00F0E0` | Signal chains, channel wiring, data flow |
| **Alert/Combat** | Living Coral | `#FF6F61` | Combat flash, danger zones, damage indicators |
| **Neon Accent** | Anemone Magenta | `#E040A0` | Hook triggers, overload sparks, critical events |
| **Warm Accent** | Rusty Anchor Orange | `#D4874A` | Resource nodes, factory elements, warm metal |
| **Player Units** | Reef Teal | `#40C8B0` | Player unit outlines, friendly indicators |
| **Enemy Units** | Deep Red | `#B83030` | Enemy unit tint, hostile territory markers |
| **UI Text** | Sea Foam | `#C8E0E0` | Body text, labels, secondary information |
| **UI Highlight** | Phosphorescent White | `#E8F4F8` | Headers, selected states, active elements |

### Province Mapping

- **Ifugao (Mission 1):** The underwater palette reads surprisingly well for rice terraces — the stepped, flooded paddies become shallow reef shelves in graduated blues `#1A3A5C` → `#2E7D9B`. Water is the common element. Data streams in `#00F0E0` flow through irrigation channels like bioluminescent plankton following the current. Mist becomes suspended particles in deep water. The effect is dreamlike — you're looking DOWN at the terraces as if through clear tropical water.
- **Siquijor (Mission 2):** Perfect thematic fit. The "mystic island" rendered as an underwater grotto — anemone magenta `#E040A0` relay towers growing from volcanic rock, coral-encrusted signal boosters, bioluminescent everything. The deep blue-black background `#0A0E1A` is the ocean pressing in from all sides.
- **Palawan (Mission 3):** The palette's home ground. Shallow lagoon `#2E7D9B` dominates — the famous Puerto Princesa underground river reimagined as a data conduit. Coral formations in `#FF6F61` serve as natural fortifications. The jungle above the waterline uses the rusty orange `#D4874A` as filtered sunlight through canopy.
- **Manila (Mission 8):** The biggest stretch. An underwater-coded palette rendering a megacity requires a conceptual bridge — the city as a reef, the skyscrapers as coral pillars, the streets as ocean trenches. It can work as a stylistic choice (everything seen through the metaphor of a drowned city, flooded by data rather than water), but it is a *choice* that players will either embrace or resist.
- **Taal Volcano (Mission 10):** Taal sits inside a lake inside an island — the underwater palette becomes literal. The volcanic eruption is a hydrothermal vent blasting `#FF6F61` coral-red and `#D4874A` sulfurous orange through the deep blue. Bioluminescent `#00F0E0` data streams boil away on contact with the heat. The visual contrast is spectacular.

### Strengths

- **Deeply Philippine.** The Philippines is an archipelago — defined by water more than land. Anchoring the visual identity in the ocean rather than the jungle is both culturally authentic and visually distinctive. No other strategy game looks like a coral reef.
- **Beautiful dynamic range.** The cool blue baseline allows warm accents (coral, orange, magenta) to read as events against a calm field. Combat flashes in coral-red against deep blue have exceptional visibility and emotional impact.
- **Thematic resonance with the game's mechanics.** Data flowing like ocean currents, signals propagating like bioluminescence, context overflow as a pressure-depth effect — the metaphors write themselves.
- **Excellent context bar design.** Blue → amber → coral maps perfectly to the palette and avoids the green-red accessibility issue entirely.

### Weaknesses

- **Jungle and mountain missions lose terrestrial identity.** Ifugao, Palawan jungle, Batanes highlands — these are land places rendered through a water lens. Some players may feel the palette betrays the geography.
- **Too close to generic cyberpunk.** Blue/cyan/magenta is the standard cyberpunk palette. The coral-reef framing is novel, but in screenshots, this may read as "another blue cyberpunk game" rather than something distinctly Philippine.
- **Night-dominant mood.** The deep blue-black background means the game always feels like night or deep water. Missions set in daylight (Batanes highlands, Cebu urban) may feel inconsistent with expectations.
- **Emotional monotone.** The cool-dominant palette can feel somber over extended sessions. The warm accents are minority colors — the overall impression is contemplative rather than exciting, which may undercut the "uprising" energy.

---

## Palette D: "Typhoon Signal" — The Storm-Lit Network

### Philosophy

Inspired by the visual drama of Philippine typhoon season — split-second lightning illuminating entire mountain ranges, rain-slicked streets reflecting neon in warped streaks, the eerie amber glow of a sky before a super-typhoon makes landfall. This palette says: **the uprising is a storm.** The machines move through the archipelago like a weather system, lighting up each province as they pass. The dominant mood is electric, dramatic, volatile — a storm that is beautiful and dangerous in equal measure.

### Core Hex Values

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary Background** | Stormcloud Charcoal | `#141820` | Storm sky, UI panel backgrounds |
| **Terrain Base** | Wet Earth Brown-Green | `#2B3028` | Rain-soaked terrain, mud, wet stone |
| **Terrain Highlight** | Storm-Lit Green | `#4A7A52` | Lightning-lit vegetation, terrain highlights |
| **Signal Accent** | Lightning Teal | `#00C8E0` | Signal chains, channel wiring, data flow |
| **Alert/Combat** | Rust Storm Orange | `#E07830` | Combat flash, damage indicators, factory glow |
| **Neon Accent** | Signal Magenta | `#D03890` | Hook triggers, overload warnings, critical events |
| **Warm Accent** | Typhoon Amber | `#D4A838` | Warning signals, resource nodes, sun-through-clouds |
| **Player Units** | Clean Teal | `#38D0C0` | Player unit outlines, friendly indicators |
| **Enemy Units** | Blood Rust | `#A83828` | Enemy unit tint, hostile territory markers |
| **UI Text** | Rain-Washed Grey | `#C8D0D0` | Body text, labels, secondary information |
| **UI Highlight** | Lightning White | `#F0F4F8` | Headers, selected states, active elements |

### Province Mapping

- **Ifugao (Mission 1):** Rain-soaked terraces in `#2B3028` and `#4A7A52` with storm clouds rolling through. Lightning-teal `#00C8E0` data streams flicker through the irrigation channels. The tutorial plays out under gathering clouds — calm but charged, the storm approaching. Thunder rumble audio reinforces the palette's mood. The terraces glisten with rain.
- **Siquijor (Mission 2):** The mystic island during a tropical storm — magenta `#D03890` lightning illuminating bioluminescent relay towers, rain streaking across the board, the amber `#D4A838` glow of protective wards (or signal amplifiers) visible through the downpour. Dramatic, supernatural, visually rich.
- **Palawan (Mission 3):** Before-the-storm calm. The palette shifts lighter — more `#4A7A52` visible, the amber becomes sunset gold, the teal is shallow water. This mission uses the palette's gentler register, making the subsequent storm-intensity missions feel like genuine escalation.
- **Manila (Mission 8):** Neon signs reflected in rain-slicked asphalt. The charcoal `#141820` background is monsoon-darkened sky over the megacity. Every neon accent — teal, magenta, amber, orange — appears as both direct light and watery reflection, doubling the color intensity. Jeepney headlights cutting through rain. This is Blade Runner's Los Angeles transposed to Quezon City.
- **Taal Volcano (Mission 10):** The storm and the volcano collide. Lightning `#00C8E0` and lava `#E07830` alternate as the board's dominant accent. The amber `#D4A838` sky is volcanic ash lit from below. Rain turns to steam on hot rock. The palette's full intensity is deployed — every color at maximum, the storm hitting the volcano, the uprising reaching its climax.

### Strengths

- **Narrative arc built into the palette.** The typhoon metaphor provides a natural escalation structure across 10 missions: gathering clouds → first rain → full storm → eye of the storm → climax. Each mission's weather intensity maps to gameplay difficulty.
- **Works for every biome.** Storms hit every province in the Philippines. The rain-slicked, lightning-lit treatment applies equally well to jungle, mountain, beach, city, and volcano terrain. No biome feels forced.
- **Emotionally powerful.** Typhoons are deeply part of Philippine lived experience — Yolanda/Haiyan, Odette/Rai. This palette connects the game's drama to real emotional resonance without trivializing disaster. The storm as metaphor for upheaval is universal and specific.
- **Rain as a rendering trick.** Animated rain streaks and water reflections unify the visual style across all biomes. Even static screenshots show rain-slick surfaces with neon reflections, creating immediate visual interest.
- **Excellent readability.** The desaturated earth tones (`#2B3028`, `#4A7A52`) serve as a neutral background against which ALL accent colors pop. Signal chains, combat flashes, unit indicators — everything reads clearly because the base palette stays muted.

### Weaknesses

- **Heavy mood.** The perpetual storm atmosphere may feel oppressive over a full campaign. Strategy games need moments of triumph and calm. The palette's lightest register (Palawan before-the-storm) is still overcast.
- **Rain animation dependency.** The palette's mood relies partly on animated rain and reflection effects. In static screenshots, still-frame promotional art, or the pixel-art sprite sheets, the "storm" quality may not communicate. The palette needs to work without the rain.
- **Brown-green base risks "muddy" perception.** `#2B3028` wet earth and `#4A7A52` storm-lit green are muted, organic tones. At small pixel scale, they can read as "brown game" — the visual shorthand for uninspired art direction. Requires aggressive lighting effects to counteract.
- **Cultural sensitivity.** Typhoons cause real devastation in the Philippines. Framing the entire game's aesthetic around storm imagery requires thoughtful handling — the storm should feel like power and drama, not like disaster tourism.

---

## Player Journeys: Palette in Action

### Journey 1: Mira, 22, Casual Gamer — First Launch (Palette A: Monsoon Circuit)

**Context:** Mira downloaded Robot Uprising because a friend shared a clip on social media. She has never played a tactics game. This is Mission 1, Ifugao.

**Minute 0:00 — Title Screen to Board**
The title screen fades from black to deep jungle green `#0B1A14`. Teal data streams `#00D4AA` trace the outline of the Philippine archipelago before the map resolves. The word ROBOT UPRISING appears in `#F0F7F4` signal white against the dark canopy. She clicks CAMPAIGN. The Ifugao province glows gold on the map. She enters Mission 1.

The board loads: an 8x8 grid of stepped rice terraces. Each tile is a terrace platform in graduated greens — lower tiles in dark `#2D5A3D`, higher tiles in bright `#4A9B6E`. Thin lines of teal `#00D4AA` trace the water channels between tiers. Faint mist particles in `#D4E8D0` drift across the lower rows. The overall impression: a quiet mountain morning, technology humming beneath ancient stone.

**Minute 0:30 — Boot Log**
The boot log text appears in `#D4E8D0` pale fern on a `#0B1A14` panel to the right. Each line types itself out. System names glow `#00D4AA` teal when initialized. Mira reads along, not fully understanding the technical content but absorbing the mood — she is a machine waking up in a green world.

**Minute 2:00 — First Unit Action**
Her pre-placed Scout moves on the first tick. Its outline glows `#5CE0D6` cyan. Its perception radius fans out — a translucent `#5CE0D6` overlay across nearby tiles, the green terrain visible beneath. When the Scout spots an enemy, the enemy tile flashes `#C43A31` rust crimson for one tick. She flinches — the red is startling against all that green.

**Minute 4:00 — Signal Chain**
The Scout sends a message. A dashed line in `#00D4AA` teal shoots from the Scout to the Relay. The Relay's tile briefly brightens. The line continues from the Relay to the Striker in `#00D4AA`. When the Striker engages, the target tile erupts in `#E8742A` ember orange — a combat flash that lingers for half a second before fading. Against the green terraces, the orange burns like a signal fire on a mountainside.

**UI Annotations:**
- Board background: `#2D5A3D` → `#4A9B6E` gradient by elevation. Tile borders in `#0B1A14` at 1px.
- Unit outlines: `#5CE0D6` player, `#C43A31` enemy. 2px glow radius.
- Signal chains: `#00D4AA` dashed line, 1px, animated dash pattern moving source→target.
- Combat flash: `#E8742A` fills target tile, fades over 500ms.
- Context bars: 4px tall strip below each unit. `#00D4AA` (healthy) → `#FFB627` (amber at 75%) → `#D946A8` (magenta at 100% — avoids red-on-green).

---

### Journey 2: Carlos, 35, Factorio Veteran — Mid-Campaign Manila (Palette B: Neon Jeepney)

**Context:** Carlos is on Mission 8, the Manila megacity level. He has 6 hours in the game and has built increasingly complex agent architectures. He is running a 4-channel network with a Command unit managing production priorities.

**Minute 0:00 — Plan Screen**
The Plan screen splits: the 8x8 board on the left shows a dense urban grid — buildings in `#3D3345` warm concrete with `#8B7FA3` chrome accents on rooftops. Neon signs dot the buildings: a `#FF2D8A` magenta karaoke bar sign on tile C4, a `#FFB627` gold sari-sari store glow on E7, a `#00E5C7` teal data center on B2. The enemy base glows `#FF6B1A` toxic orange in the far corner. The board looks like a night market seen from above — every tile has character.

The workbench panel on the right has a `#121018` background. Blueprint slots are bordered in `#3D3345`. Carlos is editing his Command unit blueprint — its portrait glows `#4DE8FF` cyan. The 6 hook slots are arranged vertically, each wired to a named channel. Channel names appear in `#FFB627` gold. He drags a rule to reorder priority — the rule card slides smoothly, leaving a `#FF2D8A` magenta trail showing where it came from.

**Minute 1:30 — Channel Architecture Review**
Carlos opens the channel map panel. Four channels appear as horizontal lanes: `recon-net` in `#00E5C7` teal, `threat-alert` in `#FF4D2A` hot red, `production-order` in `#FFB627` gold, `position-update` in `#4DE8FF` cyan. Connected units appear as small icons on each lane. The panel background is `#121018`, making each colored channel line vivid. He notices `recon-net` has 3 listeners and only 1 sender — he needs another Scout.

**Minute 5:00 — Sealed Watch**
He hits EXECUTE. The Plan screen transitions — the workbench slides out, the board scales up to fill the screen. The tick clock appears at the top: 40 pips in `#3D3345`, each filling `#FFB627` gold as the battle progresses. His factory (built into a colonial-era church, conveyor belts visible through stained glass windows) begins production. The first Scout rolls out — a small `#4DE8FF` cyan icon moving into the neon-lit streets.

Enemy units pour from the opposite base. Each one is tinted `#FF6B1A` toxic orange. Signal chains light up — `#FFB627` gold dashes flying between his units. A Relay catches a compressed signal and amplifies it — the signal line thickens, pulses brighter. When his Striker engages, the combat flash is `#FF4D2A` hot red — a neon sign exploding. Against the warm city backdrop, the combat feels like fireworks at a fiesta.

**UI Annotations:**
- Tick clock: 40 pips, each 8px wide. Unfired: `#3D3345`. Fired: `#FFB627`. Current: `#FF2D8A` magenta pulse.
- Signal chains: colored by channel. Each color from the channel map panel. 1.5px dashed, animated.
- Context bars: `#00E5C7` (healthy) → `#FFB627` (amber) → `#FF4D2A` (danger). High contrast against unit icons.
- Overload state: unit jitters 2px randomly per frame. Context bar flashes `#FF2D8A` magenta. Sparks particle effect in `#FFB627` gold.

---

### Journey 3: Kai, 28, AI Engineer — Inspector Deep Dive (Palette D: Typhoon Signal)

**Context:** Kai just lost Mission 6 (Cebu urban). His agent network collapsed when the enemy flooded the `recon-net` channel with noise, causing cascading context overloads. He is in the Inspector, scrubbing through the replay to understand what happened.

**Minute 0:00 — Inspector Entry**
The Sealed Watch ends. The screen holds on the final board state — his last unit eliminated, the tile flash `#E07830` rust orange fading. A beat of silence. Then the Inspector UI slides in: the timeline scrubber replaces the tick clock at the top — 35 completed ticks rendered as a horizontal bar, each tick a `#2B3028` segment that shifts to `#4A7A52` storm-green on hover. The board remains center, now scrubable. The sidebar panel slides in from the right: `#141820` stormcloud background with `#C8D0D0` rain-washed text.

**Minute 0:30 — Finding the Failure Point**
Kai scrubs backwards. At tick 22, he sees the cascade begin. He clicks his Relay on tile D4. The unit inspector opens in the sidebar: the context window is visualized as a vertical column of 12 slots. At tick 22, all 12 are filled — each slot a horizontal bar. Occupied slots glow with their content type: observation data in `#4A7A52` storm-green, signal data in `#00C8E0` lightning-teal, noise entries in `#A83828` blood-rust. The bars pulse gently, most recent at top, oldest at bottom. At tick 22, 9 of 12 slots are noise — `#A83828` dominates the column, a stack of angry rust-red bars. The remaining 3 legitimate entries are drowning.

**Minute 1:30 — Decision Trace**
He clicks tick 23. The decision trace panel lights up: "Rule 1: IF `threat-alert` signal received → COMPRESS and FORWARD." The rule matched — but the signal it compressed was noise. The trace shows: input context entry (noise, tagged `#A83828` rust), rule match (highlighted in `#D4A838` amber), output action (compress → forward on `threat-alert`). A dashed line in `#D03890` signal-magenta connects the Relay to the Striker it poisoned — the Striker received compressed noise and broke formation.

The amber `#D4A838` rule-match highlight against the charcoal `#141820` background is the most important color moment in the Inspector — it means "this is where the decision happened." Kai learns to look for amber highlights in the sea of teal and green data.

**Minute 3:00 — Context Window Chart**
He opens the context fill chart for the Relay. A sparkline runs across 35 ticks: a thin `#00C8E0` teal line showing buffer fill percentage. For ticks 1-18, it hovers around 50% — comfortable, in the teal zone. At tick 19, it climbs to 75% — the line shifts to `#D4A838` amber. At tick 21, it hits 100% — the line turns `#D03890` magenta, and a small lightning-bolt icon marks the overload event. The chart background is `#141820` with faint `#2B3028` gridlines. The three-color progression (teal → amber → magenta) tells the story at a glance: comfortable, strained, overwhelmed.

**Minute 5:00 — Understanding and Exit**
Kai now sees the fix: his Relay needs an ignore filter on the noise channel, or a context eviction rule that deprioritizes unverified signals. He exits the Inspector. The rain intensifies briefly during the transition — a subtle atmospheric acknowledgment that the storm continues. He returns to the Plan screen, where the workbench awaits in `#141820` dark with `#C8D0D0` text, ready for reconfiguration.

**UI Annotations:**
- Timeline scrubber: each tick is 12px wide. Default: `#2B3028`. Hover: `#4A7A52`. Selected: `#00C8E0` teal border. Overload ticks: `#D03890` magenta pip below.
- Context window slots: 20px tall each, stacked vertically. Color-coded by content type. Glow intensity shows recency.
- Decision trace: matched rule highlighted `#D4A838` amber. Connected units linked by `#D03890` magenta dashed line.
- Sparkline chart: 1px line, color shifts at thresholds: `#00C8E0` (0-60%), `#D4A838` (60-85%), `#D03890` (85-100%).
- Sidebar background: `#141820`. Section dividers: `#2B3028` 1px horizontal lines.

---

### Journey 4: Amara, 19, Art Student — Campaign Map Navigation (Palette C: Coral Reef Protocol)

**Context:** Amara chose Robot Uprising because the art style caught her eye — she had never seen a strategy game that looked like an underwater world. She is on the campaign map after completing Mission 3 (Palawan).

**Minute 0:00 — Campaign Map**
The Philippine archipelago fills the screen, rendered as a bioluminescent reef system against the abyssal `#0A0E1A` background. Each province is a coral formation — Luzon is a massive brain coral in deep reef blue `#1A3A5C`, the Visayas are branching staghorn corals in `#2E7D9B`, Mindanao is a plate coral shelf. Circuit-board data cables in `#00F0E0` bioluminescent cyan connect the provinces like synaptic pathways, running along the ocean floor.

Completed missions glow — Ifugao pulses `#40C8B0` reef teal, Siquijor shimmers `#E040A0` anemone magenta, Palawan radiates `#D4874A` rusty anchor orange (the warm sunset of its beach biome). Each completed province sends a faint `#00F0E0` particle stream along the data cables to the next province. The current mission (Batanes) pulses gold `#D4874A` → `#FFB627` in a slow heartbeat rhythm. Locked missions are dim — barely visible outlines in `#1A3A5C`, like deep-water shapes not yet illuminated.

Amara hovers over Siquijor. A tooltip fades in: mission stats, best time, agent configuration used. The tooltip background is `#0A0E1A` with a `#2E7D9B` border. Text in `#C8E0E0` sea foam. She can see her Relay's portrait — tinted `#E040A0` magenta to match the Siquijor biome.

**Minute 1:00 — Aesthetic Reaction**
She screenshots the campaign map. The archipelago looks like a Jacques Cousteau documentary spliced with a circuit diagram — organic coral forms connected by precise data pathways, all pulsing with bioluminescence against infinite dark ocean. She posts it to social media with the caption "my new favorite game is an underwater circuit board." Three people ask what game it is.

**UI Annotations:**
- Province shapes: Coral formation silhouettes in `#1A3A5C` (locked), biome-specific accent color (completed), gold pulse (current).
- Data cables: `#00F0E0` 2px lines with animated particle flow (small bright dots moving along the line at ~30px/sec).
- Ocean background: `#0A0E1A` with faint `#1A3A5C` depth gradient from edges (deeper) to center (slightly lighter, as if a light source illuminates the archipelago from above).
- Tooltip: `#0A0E1A` bg, `#2E7D9B` 1px border, `#C8E0E0` text. Fade-in 200ms.

---

## Comparable Game Art References

### Into the Breach (Subset Games)
The gold standard for isometric grid clarity. Into the Breach uses a highly constrained palette per biome — desert missions are amber/brown, ice missions are blue/white, factory missions are grey/orange. Each biome has 3-4 colors total. Unit readability is achieved through high value contrast (dark units on light tiles, light units on dark tiles) and consistent 2px outlines. Robot Uprising should study how Into the Breach reserves its brightest colors exclusively for gameplay-critical information: red for enemy attack previews, green for player movement, yellow for environmental hazards. Background tiles are always desaturated.

### Hyper Light Drifter (Heart Machine)
The closest existing precedent for "nature + technology + neon" in an isometric game. Hyper Light Drifter uses a split-complementary palette — cool blues and teals for the world, warm pinks and magentas for danger and technology, with occasional cyan highlights for interactive elements. The game proves that a strongly color-coded world can communicate both serenity and threat without verbal language. Its terrain tiles are desaturated (blue-grey, green-grey) while interactive/dangerous elements are fully saturated — a pattern all four Robot Uprising palettes should adopt.

### Transistor (Supergiant Games)
Transistor's art direction combines Art Nouveau organic curves with glowing digital elements — relevant because Robot Uprising faces the same challenge of marrying organic (Philippine nature) with digital (AI network). Transistor uses a warm amber/gold as its primary accent against cool blue-green backgrounds, with hot red reserved exclusively for the enemy faction (the Process). The two-color faction coding (gold=player, red=enemy) is simple and effective.

### Stray Gods / Bayani (Filipino Game Dev References)
Philippine-developed games have begun exploring Filipino visual identity in game art. Bayani uses bold, saturated colors inspired by Philippine revolutionary art — strong reds, blues, and golds. The jeepney art tradition (Palette B's inspiration) has not yet been translated into a game palette at scale, representing an open opportunity.

### Cyberpunk 2077 / The Ascent
These represent the "standard" cyberpunk palette: cyan/teal primary, magenta secondary, dark backgrounds. The Ascent (isometric cyberpunk) is the most directly comparable — its dense urban environments use neon signage colors against dark interiors. Robot Uprising must differentiate from this standard by foregrounding its SE Asian identity rather than defaulting to the Tokyo/Hong Kong cyberpunk template that dominates the genre.

---

## Recommendation: Hybrid Approach

No single palette serves all 10 missions optimally. The strongest approach is a **biome-adaptive system** with a locked accent palette:

1. **Lock the signal/UI colors across all missions:** Lightning Teal `#00C8E0` for data/signals, Ember Orange `#E07830` for combat/alert, Signal Magenta `#D03890` for overload/critical. These are the player's "language" — they must be consistent.

2. **Vary the terrain base per biome cluster:**
   - Missions 1-2 (Ifugao, Siquijor): Monsoon Circuit greens (`#2D5A3D`, `#4A9B6E`)
   - Missions 3-4 (Palawan, Batanes): Coral Reef Protocol blues (`#1A3A5C`, `#2E7D9B`)
   - Missions 5-7 (Cebu, Manila, Mindanao): Neon Jeepney warm darks (`#3D3345`, `#8B7FA3`)
   - Missions 8-10 (Bohol, Zambales, Taal): Typhoon Signal storm tones (`#2B3028`, `#4A7A52`) intensifying to volcanic reds

3. **Campaign map uses Coral Reef Protocol** as the unifying view — the archipelago seen from above the water, each province rendered in its biome palette but connected by consistent `#00C8E0` data cables.

This hybrid approach gives each province its own visual identity while maintaining gameplay readability through consistent signal and UI colors. The player's learned color vocabulary (teal = data, orange = danger, magenta = overload) never changes, even as the world around them shifts from jungle to reef to city to volcano.
