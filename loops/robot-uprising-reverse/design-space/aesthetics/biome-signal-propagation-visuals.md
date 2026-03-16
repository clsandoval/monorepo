# 6.01a-ii — Biome-Specific Signal Propagation Visuals

## The Design Question

Signals are the lifeblood of Robot Uprising. Every tick, scouts emit observations, relays compress and forward, strikers receive targeting data — all via named channels. The locked design specifies **green cell flashes** for signal delivery and **colored dashed lines** for active channel communications. But the spec is silent on *how those signals travel visually across different biomes*.

If terrain-modified spatial routing is adopted (per 2.00f-ii), each biome could develop its own signal propagation aesthetic — signals don't just flash on arrival, they *trace a path* through the environment. Jungle signals snake through canopy. Terrace signals follow water channels. City signals route through fiber optic conduits. Siquijor signals ride bioluminescent pulse chains. Taal signals struggle against volcanic interference.

This analysis explores how signal propagation animation should vary across the five locked biomes, what each variation communicates about the biome's character, and how signal visuals interact with the existing animation budget (6.01a-i), tile art (6.01a), and the hierarchy of motion.

---

## The Animation Hierarchy Constraint

Per 6.01a-i, the Hierarchy of Motion is:

1. **Combat flash** (100ms, red) — fastest, highest priority
2. **Signal delivery** (200ms, green line) — second fastest
3. **Tick resolution snap** (instant, unit repositioning) — discrete event
4. **Buffer bar changes** (300ms transition) — smooth but brief
5. **Unit idle animation** (2-4s cycle) — slow ambient
6. **Tile animation** (4-16s cycle) — slowest, lowest priority

Signal propagation sits at **priority 2** — it must be faster and more prominent than any tile animation, but always subordinate to combat. This means signal visuals can afford to be *flashy* (they're high-priority game information), but they must never approach the 100ms red combat flash in urgency. The sweet spot: 150-250ms travel time per hop, with a distinctive visual trail that persists for ~500ms before fading.

**The Per-Hop Budget:**
- Signal latency is 1 tick (1 second) per hop
- Visual travel animation should play within the first 200ms of that tick
- A 500ms trail fade means the path is visible for 70% of the tick
- By the time the next tick fires, the trail has fully faded

---

## Universal Signal Anatomy (Shared Across All Biomes)

Before biome-specific treatment, every signal shares a common visual grammar:

### The Signal Packet
A 3×3 pixel bright core (channel color at 100% opacity) surrounded by a 1-pixel glow halo (channel color at 40% opacity). Total footprint: 5×5 pixels. The packet is the *thing that moves* — it leaves the source unit, traverses tiles, and arrives at the destination unit.

### Channel Color System
Each named channel has an auto-assigned color from a 12-color palette optimized for contrast against all five biome palettes:

| Channel Color | Hex | Best Against | Worst Against |
|---|---|---|---|
| Cyan | #00FFD4 | Jungle (dark green), Taal (orange-red) | Siquijor (teal bioluminescence) |
| Gold | #FFD700 | Jungle, City (dark backgrounds) | Terrace (warm stone) |
| Magenta | #FF00FF | All biomes (universally distinct) | None (strongest universal color) |
| Lime | #ADFF2F | City, Taal | Jungle (green-on-green) |
| Hot Pink | #FF69B4 | Jungle, Terrace | City (neon competition) |
| Electric Blue | #7DF9FF | Taal, Terrace | Siquijor |
| White | #FFFFFF | All dark tiles | Terrace (light stone) |
| Orange | #FF8C00 | Jungle, City | Taal (lava orange) |

The first channel created in any mission gets **Cyan** (the locked signal delivery color). Subsequent channels cycle through the palette. The player can override colors in the Plan screen's channel map panel.

### The Arrival Flash
When a signal packet reaches its destination unit, the destination tile flashes — a 3-frame sequence over 200ms:
- Frame 1 (0ms): Tile overlay at 30% channel color opacity
- Frame 2 (100ms): Tile overlay at 15% channel color opacity
- Frame 3 (200ms): Overlay gone

This is the "cell flash" from the locked spec. It's the same across all biomes — only the *travel path* varies.

---

## Biome 1: Ifugao Rice Terraces — "The Water Channel"

### The Concept
Signals in Ifugao flow like water through irrigation channels. The terraces are literally defined by their water management — ancient Cordillera engineering that routes water across mountainsides through carved stone channels. Data follows the same paths. The signal packet rides the terrace's water shimmer layer, visually indistinguishable from "data flowing through water" — a bioluminescent ripple traveling along the horizontal terrace lines.

### Visual Specification

**Path behavior:** The signal packet follows horizontal terrace lines. When a signal needs to cross from one tile to an adjacent tile, it travels along the nearest horizontal terrace groove (the 2-pixel-high water line in the tile art) to the tile edge, then continues along the matching groove in the adjacent tile. If the signal must travel diagonally, it follows an L-shaped path: horizontal along a groove, then a short 45° splash drop to the groove on the adjacent tile's terrace level.

**Packet modification:** Over rice terraces, the 3×3 bright core gets a 1-pixel "wake" trailing behind it — two trailing pixels at 60% opacity that give the packet a sense of liquid motion, like a paper boat pulled through a narrow stream. Total packet footprint stretches to 5×3 pixels (horizontal travel) or 3×5 pixels (vertical drops).

**Trail effect:** The path the packet followed glows for 500ms — but instead of a solid line, it's a *shimmer boost* on the existing water animation layer. The terrace grooves the signal traveled through briefly brighten from their normal blue-teal (#4A90A4) to the channel color at 60% opacity, then fade back over 500ms. The effect: the water itself carried the data, and the groove is still warm from its passage.

**The Terrace Drop:** When a signal crosses a vertical tile boundary where the terrace steps down, the packet pauses for 30ms at the edge, then drops with a tiny 2-pixel splash sprite — three pixels of white (#FFFFFF at 50% opacity) that spray upward for 1 frame (50ms) before disappearing. This is the "data waterfall" — information cascading down terrace levels. It's subtle (3 pixels for 1 frame), but when multiple signals chain through a relay positioned on a terrace, the repeated splash-splash-splash creates a visual rhythm: data pouring down a mountain.

**Sound:** A soft *plink* — like a single water drop hitting a still pool. Pitch rises slightly for terrace-drop splashes. When multiple signals chain through a multi-hop path (scout → relay → relay → striker), the plinks cascade into a tiny xylophone run.

### What It Communicates
- **Serenity.** Missions 1-2 are tutorial. Signals should feel gentle, natural, predictable. Water flows downhill — data flows through channels. The metaphor is literal.
- **Ancient infrastructure repurposed.** The terraces are 2,000 years old. The AI protagonist is using ancient water-routing infrastructure for data. The cultural detail carries meaning: Philippine engineering that endured millennia now serves artificial intelligence.
- **Readability.** Horizontal travel along terrace grooves is the most readable signal path in the game. The player can trace exactly which groove the data followed. This is the tutorial biome — signal propagation must be maximally legible.

### Interaction with Tile Animation
The water shimmer (4s cycle, 8-12 pixels) is already the terrace's primary ambient animation. Signal propagation *uses the same pixels* — the shimmer brightens into a signal trail, then returns to ambient shimmer. This means signal propagation on terraces costs zero additional animation budget — it modulates existing animation rather than adding new elements. This is the lightest signal visual in the game, appropriate for the tutorial biome where the player is still learning to read the board.

---

## Biome 2: Siquijor Mystic Island — "The Bioluminescent Pulse Chain"

### The Concept
Siquijor is the witch island. Bioluminescent flora already pulse independently in the tile animation spec (4s cycle, 3-5 pixels per tile). When a signal travels through Siquijor tiles, it *synchronizes* the bioluminescent pulses along its path — the independent, firefly-like ambient pulses briefly snap into a coordinated chain, rippling outward from source to destination like a neural signal jumping between synapses.

### Visual Specification

**Path behavior:** Unlike Ifugao's channel-following path, Siquijor signals travel in a straight line from source to destination, but the line is rendered as a series of *connected bioluminescent nodes*. Each tile the signal crosses has 2-3 bioluminescent elements (the existing tile art's pulse points). As the signal packet passes through, each node flares in sequence — a cascade of brightening coral-embedded lights.

**Packet modification:** The 3×3 core gets a subtle 1-pixel "pulse ring" — a single frame where the halo expands to 7×7 pixels (channel color at 20% opacity) then immediately contracts back. This happens once per tile crossed, creating a heartbeat effect: the signal pulses brighter each time it hits a bioluminescent node.

**Trail effect:** The bioluminescent nodes along the signal path remain synchronized for 800ms after the packet passes — longer than any other biome. They pulse together at the channel color, twice (two synchronized beats at 400ms each), then desynchronize back to their independent ambient rhythms. The visual effect is unmistakable: a string of lights flashing in unison, like a chain of Christmas lights being tested.

**The Coral Root Route:** When a signal crosses between tiles, it briefly follows a visible root-like connector — a 1-pixel-wide curved line (channel color at 50% opacity) that traces the mangrove root pattern from the tile art's wall face. This connector appears for 200ms, suggesting the signal traveled through the underground root network connecting Siquijor's bioluminescent flora. The root line is organic — not straight, but gently S-curved across the tile boundary.

**Sound:** A resonant *thoom* — like a crystal singing bowl struck softly. Lower pitch than the terrace plink, more reverb. When multiple nodes fire in sequence, the pitches descend slightly (each node a half-step lower), creating a descending chime cascade. The reverb tails overlap, building a brief wash of harmonic resonance that fades over 1 second.

### What It Communicates
- **Mystery.** Missions 3-4 teach hooks — reactive triggers. Siquijor's signal visuals should feel *magical*, like invisible forces connecting disparate things. The bioluminescent sync is the visual metaphor for hooks: independent elements suddenly coordinating.
- **The witch island.** Siquijor's reputation for mystical healers and sorcery is encoded in the signal aesthetic — data transmission looks like spell-casting, nodes lighting up like ritual candles in sequence.
- **Hook pedagogy.** The extended synchronization trail (800ms, two synchronized beats) gives the player extra time to watch the connection between units. Hooks are the new concept in Missions 3-4, so signal paths should linger longer, inviting study.

### Interaction with Tile Animation
Signal propagation temporarily *commandeers* the bioluminescent pulse layer. During the 800ms synchronization window, the affected tiles' ambient bioluminescent animation is overridden by the channel-colored synchronized pulse. After 800ms, control returns to the ambient animation, but the tiles resume at a random phase offset — they don't snap back to their pre-signal phase. This means heavy signal traffic through Siquijor tiles gradually disrupts the ambient bioluminescence pattern, making high-traffic tiles look "agitated" — their independent rhythm broken by repeated synchronization commands. Narratively: the island's natural light is being drafted into communication infrastructure.

---

## Biome 3: Palawan Jungle — "The Canopy Trace"

### The Concept
Palawan jungle is the densest, most visually complex biome. Signals here don't flow through clean channels or pulse through nodes — they *thread through canopy*. The signal packet navigates between leaf clusters, along bamboo stalks, through gaps in the understory. The visual is a signal fighting through interference, its path visible only in the brief disturbances it leaves: rustled leaves, swaying bamboo, startled orchid petals.

### Visual Specification

**Path behavior:** Signals in jungle follow an **irregular zigzag path** between source and destination tiles. The packet doesn't travel in a straight line — it bounces between the canopy cluster positions defined in the tile art (the 3-5px leaf blobs at rows 4-7). Each tile traversed adds one directional change, so a 3-tile signal path has 3 zigs. The overall direction is correct (toward destination), but the moment-to-moment motion is erratic.

**Packet modification:** The 3×3 core is dimmer here — channel color at 80% opacity instead of 100%. The glow halo is larger (2 pixels, 30% opacity) and tinged green (#00FF87 mixed 50/50 with channel color). The jungle filters the signal. The packet looks like it's being seen through leaves — slightly occluded, slightly green-shifted.

**Trail effect:** Instead of a glowing line, the jungle signal leaves *disturbance traces*:
- **Canopy clusters** the signal passed through shift 1 pixel in the direction of signal travel for 300ms, then shift back. The movement is tiny (1 pixel!) but across 3-4 clusters on a multi-tile path, it creates a wave of rustling foliage that traces the signal path.
- **Bamboo stalks** (the 2px yellow-green segments) in the path briefly tilt 1 pixel off-vertical for 200ms. Like a bird landing on a bamboo pole — brief deflection, then return.
- **One random orchid dot** (the single warm-toned pixel at row 8-11) along the path brightens to 100% white for a single frame (50ms) — a petal catching light as something brushes past.

**The Understory Fade:** In jungle, the signal packet's brightness decreases as it descends from the canopy (rows 4-7) through the understory (rows 8-11) to the forest floor (rows 12-15). If the path between two tiles crosses through the wall face (rows 16-27), the packet is nearly invisible — just a 1-pixel bright core at 40% opacity threading between root tendrils. This creates a depth effect: signals are bright in the canopy but dim as they descend into darkness.

**Sound:** A soft *rush* — like wind through bamboo. Not a clean tone like terraces or Siquijor, but a breathy, airy rustle. Each tile traversed adds a layer of foliage-rustle texture. The sound is widest (most stereo spread) for long signal paths — the rustle sweeps across the audio field from source to destination, giving the player directional audio cues about where the signal came from and where it went.

### What It Communicates
- **Density and difficulty.** Mission 5 (factory introduction) happens here. The jungle is thick with information, and signals struggle through it. The zigzag path and dimming packet visually demonstrate signal degradation through noisy environments — a core concept the player needs to internalize before building their first factory.
- **The real cost of communication.** In terrace and Siquijor biomes, signals are pretty and clean. In jungle, they're messy — harder to track, harder to read. This is the moment the player realizes that "just send more signals" has visual consequences: a board full of jungle signal traces is a board full of rustling, flickering chaos.
- **Organic intelligence.** The canopy trace makes the robots' communication look *biological* — neural impulses through a living network. The AI protagonist built its communication infrastructure on top of a jungle ecosystem. Everything grows from everything.

### Interaction with Tile Animation
Jungle has the slowest animations in the game (canopy shadow drift at 16s, flower color cycle at 24s). Signal propagation creates the *only fast movement* on jungle tiles — the 1-pixel canopy cluster shifts and bamboo tilts happen at gameplay speed (200-300ms), creating a sharp contrast against the glacial ambient animation. This makes signals maximally visible in jungle: they're the only thing moving quickly. The design is self-correcting — the very density that obscures the signal packet makes the trail disturbances (moving leaves) more prominent against the still background.

---

## Biome 4: Cebu/Manila Cyberpunk City — "The Fiber Optic Conduit"

### The Concept
The city is infrastructure. Fiber optic cables are visible in the tile art — exposed conduit lines running along building walls, tangled cable bundles between rooftops, neon signs wired to power grids. Signals in the city don't flow through nature; they route through *built infrastructure*. The signal packet snaps along cable paths with machine precision — no organic wandering, no bioluminescent magic. This is engineered communication, fast and clinical.

### Visual Specification

**Path behavior:** City signals follow **rectilinear paths** — strictly horizontal and vertical segments, with sharp 90° turns at tile boundaries. The packet travels along the tile art's cable/conduit detail (the 1-pixel fiber optic lines in the wall face, the exposed cables between buildings). If no cable detail exists on a tile face, the signal path defaults to the tile edge. The overall path from source to destination is an L-shaped or Z-shaped Manhattan-distance route.

**Packet modification:** The 3×3 core is sharper here — no soft glow halo. Instead, the packet has a 1-pixel-wide *hard edge outline* (black, #000000) around the channel color core, giving it a neon-sign crispness against the dark urban backdrop. The packet moves 20% faster through city tiles than any other biome (160ms travel vs. 200ms), reflecting the superior infrastructure.

**Trail effect:** The signal path leaves a **persistent wire glow** — a 1-pixel-wide line in the channel color at 40% opacity that follows the exact rectilinear path. Unlike other biomes where trails fade within 500ms, the city trail persists for **1200ms** — visually, it looks like a fiber optic cable lighting up along its length, staying lit while data flows, then dimming. On a busy board with multiple channels, the trails overlap into a visible network of glowing conduit lines — the cyberpunk aesthetic of visible data infrastructure.

**The Neon Bleed:** When a signal packet passes a neon sign element in the tile art (the 2s-cycle flickering element), the sign briefly flares to the channel color for 1 frame (50ms). A cyan signal passing a red neon sign makes the sign flash cyan for an instant. This creates a "the network bleeds into the cityscape" effect — signal traffic contaminating the urban aesthetic with channel-colored light. On high-traffic tiles, neon signs flicker through multiple channel colors in rapid succession, looking increasingly chaotic.

**Sound:** A sharp *tick-tick-tick* — a staccato digital pulse, one tick per tile traversed. Dry, clean, no reverb (unlike Siquijor's resonant thoom). The sound is the antithesis of the organic biomes — mechanical, precise. Pitch is fixed (no musical variation), but the speed of ticks increases on multi-hop chains, creating a machine-gun tapping when a complex relay network fires. When multiple signals fire simultaneously, the ticks layer into a brief burst of digital chatter — the sound of a busy network.

### What It Communicates
- **Efficiency vs. exposure.** City signals are the fastest and most persistent in the game. But the long trail persistence means the *enemy can see your network architecture*. The 1200ms trail glow effectively draws your communication topology on the board for all to see. This is the EM emissions mechanic made viscerally visible: city infrastructure amplifies signals but also amplifies detection risk.
- **Urban complexity.** Missions 6-8 (Command agent, competitive play) take place here. The rectilinear signal paths, persistent trails, and neon bleed create a board that looks like a circuit diagram under load. This is appropriate: the player is now managing complex multi-agent architectures, and the visual complexity of signal traffic reflects the cognitive complexity of the systems they're building.
- **The cyberpunk feeling.** This is the TikTok clip biome. A board full of city tiles with 4-5 active channels creates a kaleidoscope of colored wire-glow lines, neon signs flashing in channel colors, and staccato digital audio. It looks like a hacker's terminal made physical. The stream highlight.

### Interaction with Tile Animation
City tiles have the lowest ambient animation coverage (1.0-1.6% of surface pixels, primarily the 2s neon flicker). Signal trails temporarily add **substantial** animation coverage — a single signal path across 4 tiles adds 4 × 1-pixel lines = 4 pixels of glowing conduit per tile, and those lines persist for 1200ms. On a busy tick with 3-4 simultaneous signals, the city can momentarily reach 3-4% animated surface area — still within budget, but noticeably more alive than ambient state. This creates a dynamic where the city *looks dead* when no signals are flowing (minimal ambient animation) but *explodes with light* during heavy communication ticks. The contrast is dramatic and rewards active signal architectures: your city comes alive when your robots talk.

---

## Biome 5: Taal Volcano — "The Struggle Signal"

### The Concept
Taal is hostile. The tile animation spec declares no suppression — terrain animation competes directly with gameplay overlays. Signals in Taal don't flow, route, pulse, or trace. They **fight**. The volcanic environment actively degrades signal propagation. Lava glow interferes with channel colors. Steam vents create visual noise that obscures packet paths. The signal packet jitters, dims, and fragments as it traverses hostile terrain — arriving at the destination diminished, exhausted, barely intact.

### Visual Specification

**Path behavior:** Signals in Taal follow a **noisy straight line** — the intended path is direct, but every frame the packet's position is offset by 1-2 pixels randomly (horizontal and vertical jitter). The packet lurches toward its destination like a person walking through a wind tunnel. The jitter amplitude increases near volcanic vent tiles (specific high-activity tiles designated in mission layout), where the packet can offset up to 3 pixels — momentarily appearing to be on an adjacent tile before snapping back.

**Packet modification:** The 3×3 core flickers between channel color and the ambient lava glow color (#FF4500 at 50% opacity) on alternating frames (at 60fps, this creates a strobe effect). The glow halo expands to 3 pixels but is extremely faint (15% opacity) — the volcanic ambient light drowns it out. The packet is visually *fighting* to stay its own color against the overwhelming orange-red environment.

**Trail effect:** Taal signals leave **fragmented trails** — instead of a continuous line, the trail is a series of disconnected 2-3 pixel dashes with gaps between them. Each dash is the channel color at 30% opacity (dimmer than any other biome), and they fade in just 300ms (faster than any other biome). The trail looks like a dotted line drawn in disappearing ink on hot metal. Between the dashes, the lava glow fills in, making the trail intermittently visible — channel color dash, lava glow gap, channel color dash, lava glow gap.

**The Steam Occlusion:** When a signal path crosses a steam vent (the 4s-cycle animation from the tile spec), the packet disappears entirely for 1-2 frames as the steam sprite overlays it. The packet re-emerges on the other side, position-jittered by 2 pixels. The player sees the signal enter the steam, vanish, and reappear slightly offset. On boards with multiple steam vents, signals can disappear and reappear several times during a single hop — the communication infrastructure struggling against environmental interference.

**The Ember Scatter:** When a signal packet passes through a tile with active lava fissure glow (the 4s ember animation), 2-3 single-pixel "sparks" scatter from the packet's position at random 45° angles, traveling 3-4 pixels before fading. Colors: 50% channel color, 50% ember orange. The sparks look like the signal's energy is being stripped away by the volcanic heat, scattered into the environment as waste.

**Sound:** A distorted, low-frequency *groan* — the clean digital tick of the city, run through a bitcrusher and pitch-shifted down two octaves. The sound crackles and pops, with intermittent static bursts during steam occlusion. When a signal arrives at its destination, there's a brief *relief sigh* — a higher-pitched, cleaner tone that resolves the distortion, signaling "it made it through." The arrival sound is emotionally cathartic: you didn't know you were tense until the signal survived.

### What It Communicates
- **The final boss.** Mission 10 is on Taal. Everything is harder here, including communication itself. The struggle signal is the culmination of the game's visual language: the player has seen clean water channels (terrace), magical synchronization (Siquijor), organic threading (jungle), efficient conduits (city) — and now all of that elegance is stripped away. Communication is *hard* in hostile environments.
- **Context overload made visible.** The jittering, fragmenting, steam-occluded signal packet is a perfect visual metaphor for what happens to a unit's context window under information overload: data arrives corrupted, partial, delayed. The signal animation teaches the same lesson as the context overload mechanic, but through visuals rather than mechanics.
- **The emotional peak.** The struggle signal creates genuine tension. When you watch your scout's observation packet jitter through three steam vents, disappear twice, scatter sparks against lava, and finally — *finally* — arrive at the relay with a relief-sigh sound, you feel something. That feeling is the game's emotional climax. The signal *barely making it* is the sealed watch's most dramatic recurring micro-event.

### Interaction with Tile Animation
Taal is the only biome where signal propagation and tile animation directly compete for the same visual space. The lava glow (4s cycle, hot orange-red) actively interferes with channel-colored signals. Green/cyan signals (complementary to orange-red) maintain readability through color contrast. But warm-colored channels (gold, orange, hot pink) risk being *absorbed* into the lava glow — the player literally cannot tell signal from volcano. This creates a strategic consideration: **channel color choice matters on Taal**. Players who assigned their critical channels to warm colors in earlier missions will discover on Mission 10 that those colors are nearly invisible against volcanic terrain. The game rewards players who chose cool channel colors or who reassign colors before the final mission.

---

## Cross-Biome Comparison Table

| Property | Terrace | Siquijor | Jungle | City | Taal |
|---|---|---|---|---|---|
| **Path Shape** | Horizontal grooves | Straight line (node-to-node) | Zigzag through canopy | Rectilinear (90° turns) | Jittery straight line |
| **Packet Speed** | 200ms/tile | 200ms/tile | 200ms/tile | 160ms/tile (fastest) | 200ms/tile + jitter |
| **Trail Duration** | 500ms (shimmer boost) | 800ms (synchronized pulse) | 300ms (disturbance fade) | 1200ms (wire glow) | 300ms (fragmented dash) |
| **Trail Type** | Water groove brightens | Bioluminescent nodes sync | Canopy rustles, bamboo tilts | Persistent wire line | Disconnected dashes |
| **Audio** | Water plink | Crystal bowl thoom | Bamboo wind rush | Digital tick | Distorted groan |
| **Ambient Interaction** | Modulates water shimmer | Commandeers bioluminescence | Only fast motion on still bg | Dead ambient → alive on signal | Competes with lava glow |
| **Emotional Register** | Serene, natural | Magical, mysterious | Dense, biological | Efficient, exposed | Hostile, tense |
| **Extra Budget** | Zero (reuses water layer) | Low (extends existing pulse) | Low (1px shifts only) | Medium (persistent trails) | High (jitter + sparks + occlusion) |

---

## Player Journeys

### Journey: Mei, 24, CS Student — First Encounter with Terrace Signals

**Context:** Mission 1. Mei has never played a strategy game. She just finished the boot log tutorial and placed her first hook on a pre-configured scout. This is the first time a signal will fire on the board.

**Tick 1 — The First Signal**
The 8×8 board fills the center screen. Ifugao rice terraces — horizontal stone lines with shimmering water, green data-light LEDs pulsing slowly in the stone. Four pre-placed units: a scout (👁) at C3, a striker (⚔) at F6, and a relay (📡) at D5. Mei configured a hook on the scout: "when enemy spotted → send on recon-net." The enemy spawner sits at H8.

The tick clock fires. The scout's perception radius catches an enemy at G7. A tiny cyan light appears at the scout's tile — the signal packet, 3×3 pixels of bright cyan with a soft glow. It begins traveling *along the terrace groove* on tile C3 — sliding horizontally through the water channel toward the tile edge.

Mei watches the packet reach the edge of C3 and drop to D4 — a tiny 2-pixel white splash as the data cascades down one terrace level. The water groove on D4 brightens cyan for a moment, and the packet continues along the groove toward D5 where the relay sits.

**Tick 1 — Arrival**
The packet reaches the relay at D5. The tile flashes — a soft cyan overlay that brightens and fades over 200ms. A gentle *plink* sounds, like a drop falling into still water. The relay's context bar (tiny colored pips at the bottom of the tile) adds one cyan pip — the observation entered its context window.

Mei exhales. She didn't realize she was holding her breath. She thinks: "Oh, it follows the water. That makes sense."

**Tick 2 — The Relay Forwards**
The relay's compress skill fires, and the compressed signal departs toward the striker at F6. This time the path is longer — D5 to E5 to F6 — two hops. Two splashes, two plinks in quick succession, the second plink pitched slightly higher. The water grooves along the path glow cyan for half a second, then return to their normal teal shimmer.

Mei traces the glowing grooves with her eyes. She can see exactly where the data went. "It's like... irrigation. The data flows downhill through the channels." She's already intuiting the spatial routing without reading a tutorial popup.

**Tick 3 — The Strike**
The striker moves to G7. Adjacent to enemy. One-shot, one-kill. Red combat flash — 100ms, much faster and brighter than the cyan signal. The enemy is eliminated. Mei barely registers the combat — she's still thinking about the water channels.

**UI Annotations:**
- Signal packet: 5×5 pixel cyan glow traveling at 200ms/tile along horizontal terrace grooves
- Terrace drop splash: 3 pixels of white, 1 frame (50ms), at tile boundaries where elevation changes
- Trail: water grooves brighten to cyan for 500ms post-passage
- Audio: water plink at 1.2kHz, ascending pitch for multi-hop chains


### Journey: Darius, 42, Network Engineer — Siquijor Hook Chains

**Context:** Mission 4. Darius has a background in distributed systems. He's learning hooks, and has configured a three-unit chain: scout → relay → striker, each connected by hooks on the "threat-net" channel (auto-assigned magenta color). He's placed them in a triangle on the Siquijor board.

**Tick 5 — The Triple Chain**
The scout at B2 spots an enemy cluster at E4. Its hook fires. A magenta packet appears — 3×3 bright pink core with a 1-pixel glow. It launches toward the relay at D3 in a straight line, but the visual is distinctive: as the packet crosses tile C2, the tile's bioluminescent coral nodes — two tiny teal dots that were pulsing independently at their own rhythm — suddenly flare magenta and pulse together. The packet hits a node on C3, and the node there flares too, in sync with C2. A resonant *thoom* sounds, low and warm, like striking a crystal bowl.

The packet arrives at the relay. Tile D3 flashes magenta. The relay's four bioluminescent nodes all pulse magenta simultaneously — the entire tile briefly beating like a heart. Darius notices: for the next 800ms, the nodes along the signal path (C2 and C3) continue pulsing in unison with the relay's nodes. A chain of synchronized lights, five nodes across three tiles, all beating together at the magenta channel color.

*Thoom... thoom...* Two synchronized beats. Then the nodes desynchronize, returning to their independent teal rhythms.

"It's like a neural pathway," Darius mutters. "The signal temporarily recruited those bioluminescent nodes into a synchronized network. When the signal passes, they go back to independent operation." He pauses. "That's literally how hook-triggered communication works in a pub-sub system."

**Tick 6 — The Relay Forwards**
The relay compresses and forwards. A new magenta packet heads to the striker at F5. This path crosses two tiles: E4 and E5. Each tile's bioluminescent nodes flare and synchronize as the packet passes. The descending chime cascade plays — *thoom... thoom...* — each node a half-step lower than the last. The root-line connectors between tiles briefly appear as curved magenta lines under the surface, tracing the mangrove root network.

Now two signal trails are visible simultaneously: the scout→relay path (nodes on C2, C3, D3 still in their second synchronized beat) and the relay→striker path (nodes on E4, E5, F5 just beginning their first beat). For a brief moment, seven tiles across the board pulse magenta — a nervous system lighting up.

Darius leans forward. "The whole board looks like it's thinking."

**Tick 7 — The Strike**
The striker engages. Red combat flash at F5 — 100ms, hard and sudden, cutting through the lingering magenta bioluminescence. The magenta nodes continue their second beat, indifferent to the combat. The visual layering is clear: red flash (combat, priority 1) overlays magenta pulse (signal, priority 2) overlays teal ambient (tile animation, priority 6). Three layers of information, perfectly readable.

**UI Annotations:**
- Bioluminescent sync: 2-3 nodes per tile flash to channel color, two 400ms beats
- Coral root connector: 1-pixel S-curved magenta line at tile boundaries, 200ms visibility
- Audio: crystal bowl thoom, descending half-steps on multi-node chains, overlapping reverb tails
- Extended trail: 800ms total sync duration (longest of any biome)


### Journey: Sofia, 15, First-Timer — Taal Struggle Signals

**Context:** Mission 10. Final boss. Sofia has played through the entire campaign. She's built a sophisticated architecture: 3 scouts, 2 relays, 3 strikers, 1 specialist, 1 command unit. Her channels are color-coded: recon-net (cyan), threat-net (magenta), hack-net (lime). She's never played on Taal before.

**Minute 0:00 — The Hostile Board**
The sealed watch begins. The board is... wrong. Orange-red lava fissures glow between tiles. Steam vents pulse every 4 seconds, plumes of white obscuring tile surfaces. Ember sprites drift upward from cracks. Nothing is still. Unlike every previous biome where the terrain was a quiet backdrop, Taal's terrain is *loud* — competing for attention with her units.

Sofia's eyes dart between her units, trying to read context bars. The ambient animation makes it harder. "This is... a lot."

**Minute 0:05 — The First Jittery Signal**
Her scout at B3 spots the enemy. The hook fires. A cyan packet appears — but it doesn't travel cleanly. It lurches forward 1 pixel, jitters sideways 2 pixels, lurches again. The 3×3 core flickers between cyan and orange-red on alternating frames, strobing like a dying light bulb. A low, distorted *groan* replaces the clean plink she's used to. Static crackles.

"What the—" Sofia watches the packet cross tile C3. It hits a steam vent. The packet *disappears* — swallowed by the white plume. One frame. Two frames. It reappears on the far side of the vent, 2 pixels offset from where she expected it. Two single-pixel sparks scatter from the packet — half cyan, half ember orange — arcing away and fading.

The packet finally reaches the relay at D4. The arrival flash plays, but it's muted — the tile overlay is competing with the lava glow below. A higher-pitched tone sounds through the distortion: the relief sigh. "It made it," Sofia thinks, surprised by her own relief.

**Minute 0:12 — The Relay Forward Problem**
The relay forwards to the striker at G5 — a long path crossing four tiles. The packet departs, groaning and jittering. It crosses E4 — steam vent. Disappears. Reappears. Crosses F4 — lava fissure. Ember sparks scatter. The fragmented trail — disconnected cyan dashes in the packet's wake — is barely visible against the orange-red environment. The dashes fade in just 300ms, and the lava glow fills the gaps.

Sofia realizes: she can barely see her own signal paths. The gold channel (threat-net was supposed to be... wait. She reassigned it to gold for some early mission. Gold against lava. The gold signal from her second scout is nearly *invisible*.

"I can't see my threat-net. The gold doesn't show up against the lava." She suddenly understands why the channel color palette existed. She never cared before — on terrace and city tiles, every color worked. On Taal, warm colors disappear.

**Minute 0:30 — The Commander's Struggle**
Her command unit at C6 fires a reroute order — a complex multi-hop signal that chains through two relays before reaching the front-line strikers. The command channel is magenta (cool color — visible). But the path is long: C6 → D5 → E4 → F5 → G5 → G6. Five tiles. Five distorted groans overlapping. The packet disappears into steam at E4, reappears, hits a lava fissure at F5, scatters sparks. The fragmented trail is a dotted line of magenta dashes, each gap filled with volcanic orange.

When the packet finally arrives at G6 — the last striker in the chain — the relief sigh is audible even through the ambient volcanic rumble. Sofia realizes she's been leaning forward, hands gripping the desk edge.

"This is the final boss and my SIGNALS are fighting to survive."

**Minute 2:00 — Context Overload Cascade**
An enemy flooding tactic fills the board with noise signals. Sofia's scouts' context windows fill rapidly. On terrace, she'd see clean cyan water-channel signals calmly flowing to relays. On Taal, she sees a chaos of jittering packets, fragmenting trails, steam occlusions, and ember scatters — overlaid on enemy noise signals that are also jittering and scattering. The board becomes a conflagration of competing colors and distortion.

Her front-line relay's context bar fills to red. Context overload. The relay freezes — sparking, jittering, one tick stunned. The signal chain breaks. Her strikers don't receive the reroute command. One gets eliminated.

Sofia exhales. The volcanic terrain didn't just look hostile — it *was* hostile. The visual degradation of signals wasn't cosmetic; it was telling her that communication on Taal is genuinely harder. She needs better filters, more compression, cooler channel colors. She needs to redesign for this environment.

"I get it now. The game was teaching me all along. Clean water → magic forest → dense jungle → efficient city → THIS. Each biome was training me to handle a noisier environment."

**UI Annotations:**
- Jitter: 1-2px random offset per frame, 3px near steam vents
- Strobe: channel color / lava orange alternating at 60fps
- Steam occlusion: packet invisible for 1-2 frames when crossing steam vent
- Ember scatter: 2-3 single-pixel sparks at 45° angles, 3-4px travel, fade
- Trail: disconnected 2-3px dashes, 30% opacity, 300ms fade
- Audio: bitcrushed groan per tile, static bursts during occlusion, relief sigh on arrival


### Journey: Kwame, 32, Twitch Streamer — City Signal Spectacle

**Context:** Mission 7. Kwame is streaming to 400 viewers. He's built an elaborate 5-channel architecture on the Cebu/Manila cyberpunk board. His chat is watching him deploy a new command agent design with intricate hook wiring.

**Tick 12 — The Network Lights Up**
The enemy pushes. Kwame's scout network fires simultaneously — three scouts, each on different channels. Three signal packets launch at once. Cyan along the top row. Magenta down the right column. Lime cutting diagonally.

The city tiles come alive. Each packet snaps along rectilinear paths — sharp 90° turns at tile boundaries, following the fiber optic conduit lines in the tile art. The cyan packet traces a clean horizontal line across A1→B1→C1→D1, each tile's conduit glowing cyan. The magenta packet drops vertically H3→H4→H5, hard right-angle turns, conduit lines lighting magenta. The lime packet zigzags: B6→C6→C5→D5, L-shaped Manhattan routing.

The neon signs on tiles the packets cross flash in channel colors — a red neon sign on C1 briefly flashes cyan, a blue sign on H4 flashes magenta. *Tick-tick-tick-tick* — the staccato digital pulses overlap into a rapid-fire burst of machine chatter.

**Chat explodes:**
- "the board looks like a circuit board holy"
- "LIGHT IT UP"
- "those neon signs changing color tho"

**Tick 13 — Persistent Trails**
The packets arrive at relays. But the trail glow persists — 1200ms. The cyan horizontal line, the magenta vertical line, the lime zigzag are all still visible as glowing fiber optic conduit. For a moment, the board displays Kwame's entire communication architecture as a visible network diagram — colored wires showing exactly how information flows through his system.

"Chat, LOOK AT THIS," Kwame says, gesturing at the screen. "You can literally see my architecture. The cyan line is recon data going to the relay bank. The magenta is threat prioritization feeding the striker group. The lime is my hack channel for the specialist."

The trails begin to fade at 1200ms, but before they're gone, the relays process and forward — new packets launch along new paths, new trails light up. The result is a constantly-shifting fiber optic network visible on the board, trails overlapping and fading in a rhythm tied to the tick clock.

**Tick 14 — The Relay Fan**
Kwame's central relay at E4 fires compressed signals to three strikers simultaneously. Three packets launch from a single tile — magenta, magenta, magenta — each taking a different rectilinear path to a different striker. The tile's conduit lines glow triple-bright where paths overlap, then split into separate conduits as the packets diverge. Three neon signs flash magenta in rapid succession. *Tick-tick-tick* — one burst per packet.

"The relay fan looks BEAUTIFUL on city tiles," Kwame narrates. "Each signal has its own fiber optic line. You can literally see the fan-out pattern."

One viewer clips a 15-second segment: the relay fan illuminating three branching fiber optic paths across dark cyberpunk tiles, neon signs flashing in cascade, staccato digital audio building to a burst. The clip gets 23K views on TikTok. Title: "my robots built their own network."

**UI Annotations:**
- Rectilinear path: strictly horizontal/vertical segments, 90° turns at tile edges
- Travel speed: 160ms/tile (20% faster than other biomes)
- Trail persistence: 1200ms (2.4× default), glowing fiber optic conduit line
- Neon bleed: existing neon sign elements flash channel color for 1 frame (50ms)
- Audio: staccato tick per tile, no reverb, layered on simultaneous signals
- Network visibility: overlapping persistent trails create visible architecture diagram

---

## Interaction Effects

### With Context Overload (Locked Mechanic)
When a unit hits context overload (stunned for 1 tick), all incoming signal packets aimed at that unit should visually *bounce* — the packet reaches the destination tile but instead of the arrival flash, it rebounds 2 pixels upward and dissolves in a spray of channel-colored particles. The audio is the biome's arrival sound played in reverse. On Taal, where signal packets are already degraded, a bounced signal is barely visible — the player might miss that a critical signal was rejected.

### With EM Emissions (Locked Mechanic)
Signal propagation animations should scale with EM emission visibility. A "loud" signal (hook broadcast on a channel with many listeners) has a 20% larger packet glow halo. On city tiles, this means louder signals leave wider fiber optic trails — literally more visible to the enemy. The tactical tradeoff: efficient architectures are visible architectures.

### With Channel Color Assignment
Taal's visual interference with warm colors creates a late-game strategic consideration. Players who reach Mission 10 with warm-colored critical channels face a choice: reassign colors (breaking muscle memory) or operate with reduced signal visibility. This interaction should be foreshadowed — Mission 8 or 9 (city-to-volcano transition) could feature hybrid boards with both city and volcanic tiles, where warm-colored signals work on city tiles but struggle on volcanic ones.

### With Inspector (Locked Screen)
The Inspector's timeline scrubber should allow stepping through signal propagation frame-by-frame. At 1x speed, the player can watch a Taal signal jitter through steam in slow motion, seeing each frame of occlusion and spark scatter. The Inspector should also overlay the "ideal path" (straight line, no interference) vs. the "actual visual path" (with jitter offsets), quantifying how much the volcanic environment degraded signal readability.

### With Sealed Watch (Locked Screen)
During sealed watch (no tools, no pause), signal propagation visuals are the player's primary feedback channel for "is my architecture working?" Clean terrace signals = "everything's fine." Jittering Taal signals = "we're barely holding on." The biome-specific visual language doubles as an emotional barometer — the player reads the state of their system not from UI widgets but from *how their signals look*.

### With Colorblind Accessibility
The biome-specific signal treatments add texture, motion, and audio — not just color. A colorblind player on Taal can still see jitter, steam occlusion, and ember scatter even if they can't distinguish channel colors. The jungle's canopy rustle is motion-based, not color-based. The terrace water groove brightening is a luminance change, not a hue change. Each biome's signal identity works in grayscale.

---

## The TikTok Clip

**City, 15 seconds:** Three signals fire simultaneously from three scouts. Six fiber optic conduit lines light up across the dark cyberpunk board — cyan, magenta, lime — snapping along rectilinear paths with sharp 90° turns. Neon signs flash in channel colors as packets pass. The camera zooms to the central relay as it fans out three compressed signals to three strikers — the relay becomes a glowing hub with six conduit lines radiating outward, each a different color. Staccato digital ticks build to a burst. Caption: "I didn't write code. I designed a nervous system."

**Taal, 15 seconds:** A single signal fires from scout to command through five tiles of volcanic hellscape. The packet jitters through steam, disappears, reappears, scatters ember sparks. The distorted groan builds tension. The packet hits a lava fissure — three sparks arc away. The packet is barely visible. It reaches the command unit. Relief sigh. The command unit processes for one agonizing tick, then fires a reroute command — a magenta signal that departs into the volcanic chaos on the reverse path. Caption: "My robot screamed through fire to deliver a message."

---

## Discovered Aspects

During this analysis, the following new aspects emerged:

1. **6.01a-ii-a — Signal collision visuals:** What happens when two signal packets from different channels cross the same tile on the same tick? Do they pass through each other? Create a brief interference pattern? Merge momentarily? The visual treatment of signal collision varies by biome (city: overlapping fiber optic lines; jungle: canopy clusters double-rustle; Taal: amplified jitter).

2. **6.01a-ii-b — Enemy signal propagation visual distinction:** Enemy signals should have a distinct visual treatment from player signals — but how distinct? Same biome-specific path behavior with a red tint? Completely different animation (enemy signals as angular, aggressive, player signals as organic)? The visual distinction must be readable in 200ms during sealed watch.

3. **6.01a-ii-c — Signal volume visual scaling:** How does the visual change when 2 vs. 5 vs. 15 signals fire in a single tick? At some threshold, individual signal paths become unreadable noise. What's the "signal traffic jam" visual, and does it differ by biome? City: fiber optic conduit oversaturation glow. Taal: complete visual chaos. Terrace: peaceful overlapping plinks becoming a stream.

4. **6.01a-ii-d — Transition tile signal behavior:** When a signal path crosses from one biome type to another (e.g., jungle tile adjacent to city tile on a hybrid board), how does the signal visual transition? Does the packet change behavior mid-flight? Does the trail change style at the boundary? The biome boundary as a visible communication infrastructure change.

5. **6.01a-ii-e — Signal path persistence as replay tool:** In the Inspector, should the player be able to "pin" signal trails so they persist indefinitely? Pinned trails on city tiles create a permanent circuit diagram. Pinned trails on Taal tiles show the jitter path as a static squiggle — visualizing electromagnetic interference as frozen noise.
