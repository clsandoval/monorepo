# 3.10f — Visualization Density Scaling Across the 10-Mission Arc

**Aspect:** 3.10f — 2 units/0 channels (M1) to 12+ units/8+ channels (M10); paradigm breakdown thresholds; progressive disclosure gates
**Category:** Building Blocks / Visual Systems
**Status:** Complete

---

## The Design Problem

Robot Uprising's visual system must communicate three categories of information simultaneously: **unit state** (context bars, buffer fill, active skill indicators), **inter-unit relationships** (channel wiring drawn as colored dashed lines), and **spatial awareness** (perception radii, waypoint paths, threat rings). At Mission 1, with 2 pre-placed units and 0 channels, this is trivial: two sprites on an 8x8 grid, each with a tiny context bar beneath it. At Mission 10, with 12+ units connected by 8+ named channels, the same visual vocabulary produces an unreadable tangle. The grid hasn't changed size. The tile count hasn't changed. The pixel budget hasn't changed. But the information density has increased by roughly 10x.

This analysis identifies the exact unit counts and channel counts at which each visualization paradigm breaks down, proposes progressive disclosure gates that unlock visual complexity in sync with the mission arc, and describes the sensory experience at each density tier.

---

## Density Tiers and Breakdown Thresholds

### Tier 1: Pristine (2-3 units, 0-1 channels) — Missions 1-2

Every visual element has room to breathe. Units occupy at most 3 of 64 tiles. Context bars (the tiny row of colored pips beneath each sprite showing buffer fill) are fully legible at default zoom. With 0-1 channels, there is either no wiring or a single colored dashed line connecting two units. Perception radii (the dashed circles showing what a unit can "see") never overlap. The board reads like a chess opening: sparse, clean, every piece individually identifiable.

**No breakdown at this tier.** The visualization system is dramatically underutilized. The risk is the opposite: the board looks empty and the player wonders where the game is.

### Tier 2: Comfortable (4-5 units, 1-3 channels) — Missions 3-4

Four to five units on 64 tiles means roughly 6-8% occupancy. Context bars are still individually readable. Channel wiring introduces the first visual complexity: 2-3 colored dashed lines crossing the board. At this density, lines rarely cross each other because units are spread out and channels typically connect adjacent or near-adjacent units (scout-to-relay, relay-to-striker).

**First mild pressure point at 5 units / 3 channels:** If two relay units both wire to the same striker, two channel lines converge on one tile, creating a small knot. The lines use distinct colors (each named channel gets a unique hue from a 12-color palette: cyan, magenta, amber, lime, coral, violet, teal, gold, rose, slate, mint, peach), so the overlap is distinguishable by color even when spatially tangled. But this is the first moment a player might squint.

### Tier 3: Busy (6-8 units, 3-5 channels) — Missions 5-6

The factory (Mission 5) is the inflection point. The player can now produce units, which means the unit count is no longer designer-controlled — it's player-controlled. A cautious player might field 5-6 units. An aggressive player might push to 8. With 3-5 channels, the wiring diagram starts to resemble an actual network topology.

**Signal line spaghetti threshold: 6 units / 4 channels.** At this density, channel lines begin crossing mid-board with regularity. A relay in the center of the grid with 3 outgoing channels produces a starburst pattern: three colored dashed lines radiating outward. If two relays are both centrally positioned, the starburst patterns overlap and individual lines become difficult to trace visually. The player can still identify which channel is which by color, but following a single line from source to destination requires deliberate focus.

**Context bar readability threshold: 7 units.** When 7 units are on the board, at least 2-3 will be on adjacent tiles. Context bars are positioned directly beneath sprites, extending 2px below the tile's isometric footprint. On adjacent tiles, the context bar of one unit sits within 4-6 pixels of the sprite body of the neighboring unit. At default zoom, the colored pips (each pip is 3x3 pixels, one per buffer slot) start blurring together. A scout's 6-pip bar next to a relay's 12-pip bar creates a visual run-on: 18 colored dots in a tight horizontal strip with only a 4px gap between them.

**Perception radius overlap threshold: 5-6 units.** Scout perception radii (dashed cyan circles, 3-tile radius) start overlapping at 5 units if even two scouts are deployed near each other. Overlapping dashed circles create moire-like interference patterns — the intersection regions show doubled dash frequency, which reads as a solid band rather than a dashed arc. This is visually confusing: the player cannot tell where one scout's vision ends and another's begins.

### Tier 4: Dense (9-12+ units, 5-8+ channels) — Missions 7-10

This is the paradigm breakdown zone. At 10 units on 64 tiles (15.6% occupancy), unit sprites frequently occupy adjacent or even diagonally adjacent tiles, creating clusters where individual identification requires zooming in. With 8 channels, the wiring diagram has 8+ colored dashed lines crossing the board, many of them intersecting. The board no longer reads "at a glance" — it requires active interrogation.

**Total spaghetti threshold: 8+ channels.** Beyond 8 channels, even the 12-color palette starts failing. The player must distinguish between cyan and teal, between coral and rose, between amber and gold — color pairs that are perceptually close. Under the dark battlefield palette (deep navy #091833 background), subtle color distinctions wash out further. A veteran can learn to read the colors; a newcomer sees a plate of glowing noodles.

**Buffer bar collapse threshold: 10+ units.** With 10 units, clusters of 3-4 units on adjacent tiles are common. The buffer bars merge into a continuous colored strip across 3-4 tile widths. Individual buffer state is unreadable without hover or selection.

**Board legibility total breakdown: 12+ units with 8+ channels.** At this density, every visualization element is competing for the same pixel budget. Channel lines cross perception radii cross buffer bars cross unit sprites. The holographic overlay (the floating cyan grid, the channel wiring, the ghost previews) becomes the dominant visual element; the battlefield beneath is barely visible. The player is no longer reading a board — they're interpreting a circuit diagram that happens to have a jungle underneath it.

---

## Progressive Disclosure Gates

Each mission tier unlocks visualization features that would be premature (or overwhelming) at earlier densities.

| Gate | Mission | Unlocked Visualization | Why Now |
|------|---------|----------------------|---------|
| G1 | M1 | Context bars (buffer pips beneath units) | Only 2 units; bars are trivially readable |
| G2 | M2 | Perception radii (dashed circles) | First rules-based mission; player needs to see what agents can detect |
| G3 | M3 | Channel wiring (colored dashed lines between units) | Hooks introduced; first inter-unit communication |
| G4 | M5 | Channel filter layer (toggle to show/hide individual channels by name) | Factory produces enough units/channels to need filtering |
| G5 | M5 | Cluster indicators (unit group badges replacing individual sprites when zoomed out) | Player-controlled unit count; clusters inevitable |
| G6 | M6 | Command overlay (hierarchical tree view showing command unit's subordination structure) | Command agent introduced; hierarchy must be visible |
| G7 | M7 | Signal activity heatmap (tile-level color wash showing message density per tick) | Eviction policies require understanding which channels are congested |
| G8 | M9 | Factory network overlay (production flow arrows showing blueprint-to-spawn-to-deploy pipeline) | Factory-vs-factory requires reading the opponent's production flow |

---

## Player Journeys

#### Journey: Mika, 24, Mobile Game Player (Casual)
**Context:** Mission 2, second playthrough. Has completed M1 (context config only). Now learning rules. 2 pre-placed units: 1 scout, 1 striker. 0 channels.

**Minute 0:00 — Plan Screen Opens**
Mika sees the 8x8 board with its holographic cyan grid overlay floating above the SE Asian jungle tiles. Two units sit on the board: a small scout with its single cyan eye-dome on tile D3, and a larger striker with its angular red-orange silhouette on tile F6. Beneath each sprite, a context bar: the scout's is 6 tiny pips (3x3px each), four of them lit soft blue (context items currently loaded), two dim gray (empty buffer slots). The striker's bar is 8 pips, three lit, five dim. The board is 87% empty tiles. The jungle tile detail is fully visible — tiny pixel fronds, embedded data-lights pulsing on even ticks. Mika can see every tile's terrain type without effort. There are no channel lines, no perception radii yet (those unlock next mission). The visual field is calm: two small robots on a big green-and-cyan grid.

**Minute 0:30 — Configuring Rules**
Mika opens the striker's config panel on the right. The workbench panel slides in, dark background with monospace text. She drags a condition ("enemy_in_range") to an action ("engage"). On the board, a red-orange threat ring flashes once around the striker's tile — a 2-tile radius circle that appears for 300ms and fades. This is the first dynamic overlay Mika has seen beyond the static grid. It's crisp, unambiguous, occupying empty space. No other visual element competes with it.

**Minute 1:15 — Sealed Watch**
Battle begins. The holographic overlay fades (300ms transition). The board returns to full saturation. The two units move. Mika watches the scout advance tile by tile. Its context bar updates each tick: a new blue pip appears as it detects an enemy (buffer filling), an old pip dims as stale data evicts. The bar is large enough to read at a glance. When the striker engages, a red flash fills the combat tile for one tick. Everything is perfectly legible. Two units, two context bars, two stories. The sealed watch feels like watching a chess game between two pieces.

**UI Annotations:**
- Context bars: 6 and 8 pips respectively, spaced 12 tiles apart, no overlap risk
- Threat ring: single 2-tile radius, no intersections, fades before battle starts
- Board occupancy: 3.1% (2/64 tiles), terrain fully readable
- Visual noise level: minimal — equivalent to a chess board with two pieces

---

#### Journey: Carlos, 31, Software Engineer
**Context:** Mission 6, first playthrough. Has completed factory introduction (M5), now learning command units. Has deployed 7 units: 2 scouts, 2 strikers, 2 relays, 1 command unit. 4 named channels ("recon-alpha", "recon-beta", "engage-primary", "command-override").

**Minute 0:00 — Plan Screen Opens**
Carlos sees a board that looks distinctly different from his M2 experience. Seven unit sprites occupy the grid — one cluster of 3 units (scout + relay + striker) near the center around tiles D4-E5, a second pair (scout + striker) on the western edge at B6-C6, and the command unit sitting alone on G2 with its gold-accented holographic dome. The relay anchors the center cluster, its tall antenna array the tallest sprite on the board. Beneath the sprites, context bars: the two relays have 12-pip bars that are nearly the full width of their tiles. The command unit's 14-pip bar extends slightly beyond its tile footprint and is clearly the largest bar on the board.

Four colored dashed lines crisscross the grid. Cyan ("recon-alpha") runs from the scout at B6 to the relay at D4 — a diagonal line crossing 3 tiles. Magenta ("recon-beta") connects the scout at E5 to the same relay. The two lines converge on the relay tile, creating a small junction knot: two dashed lines of different colors arriving at the same sprite. The relay's outgoing channel ("engage-primary," rendered in amber) fans out to both strikers. A fourth line, violet ("command-override"), traces from the command unit at G2 to the relay at D4 — the longest line on the board, crossing 5 tiles diagonally.

**Minute 0:45 — The First Density Pain Point**
Carlos wants to add a fifth channel connecting the command unit directly to the western striker. He hovers over the command unit to open its hook config. But the violet "command-override" line and the amber "engage-primary" line both pass within 8 pixels of each other near tile E3. When Carlos's cursor crosses this intersection, the tooltip system hesitates — which line is the player trying to inspect? The game shows a disambiguation popup: a small floating card listing both channel names with their colors, asking which one to select. This is the first moment Carlos encounters visual density friction. It takes 2 extra seconds.

**Minute 1:30 — Channel Filter Discovery**
Carlos notices the channel filter panel — a small collapsible section at the bottom-left of the Plan screen, unlocked at M5 (Gate G4). It lists all 4 channels by name with colored dots and visibility toggles. Carlos clicks the eye icon next to "recon-alpha" and "recon-beta." The two recon lines vanish from the board. Now only the amber and violet lines remain. The wiring diagram simplifies from a 4-line tangle to a clean 2-line structure. Carlos exhales. He can now clearly see the path from command to relay to strikers. He adds his fifth channel, toggles the recon lines back on, and inspects the full topology.

**Minute 3:00 — Sealed Watch at Moderate Density**
Seven units moving on the board. Context bars update every tick. The center cluster (3 units on adjacent tiles) creates a visual hotspot: three context bars in a tight group, colored pips flickering as buffers fill and drain. Carlos can identify which unit is which by sprite silhouette (scout's eye-dome vs relay's antenna vs striker's blade-arms), but reading individual buffer states within the cluster requires focusing on one unit at a time. He discovers he can click a unit during sealed watch to highlight its context bar in a bright outline while dimming others.

Channel lines pulse briefly when a signal traverses them — a bright dot travels along the dashed line from source to destination over 200ms, like a packet moving through a wire. With 4 channels, Carlos sees 2-3 signal pulses per tick. The pulses are distinguishable by color and timing, but in the center cluster where lines converge, two simultaneous pulses create a brief flash of mixed color — a visual artifact that looks intentional (like interference) but carries no game meaning.

**UI Annotations:**
- Context bars: 12-pip and 14-pip bars at tile width; cluster of 3 creates a 36-pip visual band
- Channel lines: 4 lines, 1 intersection point requiring disambiguation popup
- Board occupancy: 10.9% (7/64 tiles), two spatial clusters visible
- Visual noise level: moderate — equivalent to a circuit board with 4 traces; manageable with filtering
- Progressive disclosure: channel filter panel (G4) is critical quality-of-life at this density

---

#### Journey: Priya, 28, Systems Architect (Expert)
**Context:** Mission 10, third playthrough. Full factory-vs-factory climax. Has deployed 13 units: 3 scouts, 3 strikers, 3 relays, 2 specialists, 2 command units. 9 named channels. Enemy factory is also producing. Total board population: 20+ units at peak engagement.

**Minute 0:00 — Plan Screen Opens**
The board is transformed. Thirteen friendly sprites cluster in the western half of the grid, arranged in three deliberate formations: a forward recon line (3 scouts across row 3), a relay backbone (3 relays on column D), and a mixed assault group (strikers + specialists + commands) in the rear. The eastern half shows enemy spawner tiles and 4 pre-placed enemy units. Context bars are everywhere: the relay backbone alone presents three 12-pip bars stacked vertically on adjacent tiles, creating a 36-pip column of colored dots. Individual pip state is not readable at default zoom.

Nine channel lines fill the airspace. The three recon channels (cyan, teal, mint — perceptually similar colors) run from the scout line to the relay backbone. Three engagement channels (amber, coral, gold) fan from the relays to the assault group. Two command channels (violet, rose) connect the two command units to different relay nodes. One specialist channel (slate) runs from a specialist to a relay. The board looks like a London Underground map drawn in neon on black glass. Lines cross at 6-7 intersections. At three of these intersections, three or more lines converge, creating small colored knots that are individually traceable only by following a line from its source.

**Minute 0:30 — Navigating the Spaghetti**
Priya doesn't try to read the full wiring diagram. She's been through this before. She immediately opens the channel filter panel and selects "Solo" mode: clicking a single channel name shows ONLY that channel's wiring, hiding all others. She steps through each channel one at a time — 3 seconds per channel — verifying routing. Nine channels, 27 seconds. The full diagram is incomprehensible; the individual channels are trivial.

She then switches to "Group" mode: she selects the three recon channels together. Three lines appear — cyan, teal, mint — forming a clean fan from the scout line to the relay backbone. She verifies coverage. Then she selects the three engagement channels. Another clean fan. The full topology is legible when decomposed into logical groups, even though the composite view is not.

**Minute 1:30 — Cluster View at Maximum Density**
Priya zooms out one level (the board supports two zoom levels: default and tactical overview). At tactical overview, unit sprites shrink and cluster indicators appear (Gate G5): the three-scout formation collapses into a single badge showing "3x Scout" with a miniature cyan eye icon. The relay backbone becomes "3x Relay" with a magenta antenna icon. The assault group becomes a compound badge: "3 Striker / 2 Spec / 2 Cmd". Channel lines between clusters simplify too: instead of 9 individual lines, the view shows 3 thick bundled lines between cluster badges, each bundle labeled with a channel count ("3 ch", "3 ch", "3 ch"). The board transforms from a circuit diagram into a block diagram.

**Minute 3:00 — Sealed Watch at Maximum Density**
Twenty units moving on a 64-tile board (31% occupancy). The sealed watch is a controlled storm. Priya has learned not to try reading everything simultaneously. She uses the unit-focus mode (click a unit to spotlight it, dimming all others to 40% opacity). She watches her command unit's decision-making: its 14-pip context bar fills and drains as it processes incoming signals on its 6 hooks. When the command unit issues a reassign order, the violet command channel pulses brightly — a dot racing along the dashed line — while all other channels dim to 20% opacity for 500ms. This "active channel spotlight" prevents the signal pulse from getting lost in the visual noise.

Combat erupts in the center of the board. Three strikers engage three enemy units simultaneously. Red flashes on 6 tiles. Context bars drain rapidly as combat consumes buffer space. Two units are destroyed — their sprites shatter into pixel fragments that scatter across adjacent tiles (the death animation), and their context bars flash red three times before disappearing. The channel lines that connected to the destroyed units fade to gray dashed lines, then dissolve over 1 second. The network is visibly damaged — two holes in the wiring diagram where connections used to be.

**Minute 5:00 — Inspector at Maximum Density**
After the battle, Priya enters the inspector. The analytical replay shows the full battle timeline as a horizontal scrubber. But the inspector's key density management tool is the **signal genealogy view**: instead of showing all 9 channels simultaneously on the board, it renders a single selected signal's journey through the network as a highlighted path. Priya selects the moment at tick 34 when her left flank collapsed. The inspector highlights the specific chain: scout detected threat (buffer entry appears) -> scout emitted on recon-alpha (cyan pulse) -> relay received on recon-alpha (buffer entry) -> relay processed and emitted on engage-primary (amber pulse) -> striker received but buffer was full (amber pip blinks red, evicted) -> striker never engaged. The failure point is rendered as a red X on the striker's context bar at the evicted pip. Every other channel and unit is dimmed to 15% opacity. The density problem vanishes because the inspector isolates one causal chain at a time.

**UI Annotations:**
- Context bars: 13 bars totaling 130+ pips, unreadable at default zoom without selection
- Channel lines: 9 lines, 6-7 intersection points, 3 triple-convergence knots
- Board occupancy: 20-31% (13-20 units on 64 tiles), spatial clustering mandatory
- Visual noise level: maximum — raw composite view is illegible; requires decomposition tools
- Progressive disclosure: cluster view (G5), channel solo/group filter (G4), signal genealogy (inspector), active channel spotlight (sealed watch) are all essential
- Paradigm: the "read everything at a glance" promise of M1-M4 is fully abandoned; replaced by "interrogate specific subsystems on demand"

---

## Density Management Approaches: Strengths and Weaknesses

### Approach A: Spatial Clustering with Cluster Badges

Units that occupy adjacent tiles collapse into a single badge at zoomed-out views, showing unit count and type composition. Channel lines between clusters become bundled thick lines with channel counts.

**Strengths:** Dramatically reduces visual entity count (13 sprites become 3-4 badges). Preserves the spatial layout — clusters are positioned where their constituent units are, so the board's tactical geography remains readable. The bundled lines communicate network topology at a structural level ("this group talks to that group on 3 channels") without individual-line clutter. Works naturally with the isometric grid — adjacent tiles are visually adjacent, so clustering follows natural perception.

**Weaknesses:** Hides individual unit state. A cluster badge showing "3x Relay" doesn't tell you which relay has a full buffer. The player must zoom in or click the cluster to expand it. This creates a two-level reading task: "zoom out to see structure, zoom in to see state." If a critical failure happens inside a cluster during sealed watch, the player might miss it. Clustering also obscures spatial tactics — two units that are adjacent but serving completely different roles (a scout watching east and a striker facing west) become one badge, erasing their functional distinction.

### Approach B: Channel Filtering (Solo/Group Toggle)

A panel listing all named channels with visibility toggles. Solo mode shows one channel at a time. Group mode shows player-selected subsets.

**Strengths:** The single most effective density reducer. Removing 8 of 9 channel lines from the board transforms an illegible tangle into a clean pair of endpoints connected by a single colored line. The cognitive cost is near-zero for the player — they already know their channel names because they created them. Filtering is reversible, non-destructive, and instantaneous. It maps to how engineers actually debug networks: "show me just the recon traffic."

**Weaknesses:** Requires the player to actively manage their view. In the heat of sealed watch, switching channel filters adds interaction cost. If the player forgets to toggle a channel back on, they might miss signals on the hidden channel. Filtering also means the composite view is never clean — the player can see subsets or the full mess, but there's no intermediate "automatically decluttered" state.

### Approach C: Level-of-Detail (LOD) Rendering

Channel lines simplify at distance. Close-up: individual dashed lines with color and animation. Medium: solid colored lines without dash animation. Far: bundled gray lines with colored endpoints only.

**Strengths:** Passive density management — the player doesn't have to do anything. The system automatically adjusts detail based on zoom level. At tactical overview, the board becomes a clean block diagram. At close-up, full detail is available. This mirrors how real maps work (highways on the country map, individual streets on the city map).

**Weaknesses:** The 8x8 grid has limited zoom range. At most 2 meaningful zoom levels fit the viewport. With only 2 LOD tiers, the transitions are abrupt rather than gradual. The medium-zoom "solid lines" lose the dashed animation that communicates active vs. idle channels — a gameplay-relevant visual cue sacrificed for clarity.

### Approach D: Semantic Highlighting (Active-Only Rendering)

Only channels that are currently carrying a signal are rendered at full opacity. Idle channels dim to 10% opacity or become invisible entirely.

**Strengths:** During sealed watch, this approach is transformative. Instead of 9 static colored lines crossing the board, the player sees only the 2-3 channels that are active in any given tick. The board breathes — channels light up and fade with the rhythm of agent communication. The visual effect is like watching synapses fire: momentary bright connections in a mostly-dark field. This communicates the system's behavior, not just its structure.

**Weaknesses:** During the plan screen, every channel IS idle, so semantic highlighting renders nothing — the player can't see their wiring. Requires a separate "show all topology" toggle for planning. Also, if a channel fails to fire (the interesting debugging case), it's invisible by default. The absence of a visual is harder to notice than the presence of a wrong one. A silent channel should arguably be BRIGHT RED, not invisible.

---

## Interaction Effects Across Screens

### Plan Screen (Workbench)

The plan screen is where density problems are most acute because the player needs to see the FULL topology simultaneously — all channels, all perception radii, all unit positions — in order to design their architecture. This is the only screen where the composite view matters. The channel filter panel is essential at 5+ channels. The cluster view is useful at 8+ units for spatial planning but must be expandable for individual configuration. The holographic overlay (Option C from the overlay analysis, the volumetric projection floating above the battlefield at 80% terrain saturation) helps by providing a distinct visual layer for wiring, but at 9+ channels even the overlay layer itself becomes cluttered.

### Sealed Watch (Battle)

The sealed watch benefits most from semantic highlighting (Approach D). During battle, the player is watching behavior, not structure. They don't need to see all 9 channels — they need to see which channels are active right now. The unit-focus mode (click to spotlight one unit) is the primary density management tool here. The "active channel spotlight" (briefly dimming all channels except the one carrying a signal) should be the default sealed-watch rendering mode, with a toggle to show full topology.

### Inspector (Analytical Replay)

The inspector solves density by design. Its signal genealogy view isolates one causal chain at a time, reducing arbitrarily complex networks to a single highlighted path. The tick scrubber lets the player step through time and see exactly one signal's journey. This is the only screen where 12+ units and 8+ channels present zero readability problems, because the inspector never shows the composite view — it always shows a filtered, annotated subset. The inspector is where the player goes to understand what happened; the sealed watch is where they felt it happen.

---

## Comparable Games

### Factorio — Zoom Levels and Belt Spaghetti

Factorio is the canonical density scaling reference. Early game: a few miners and belts, everything readable. Mid game: hundreds of machines, belts crossing in every direction — "spaghetti base" is a rite of passage. Late game: players learn to organize into modular blocks ("main bus" pattern, city blocks) that impose human-readable structure on machine-readable complexity. Factorio manages density through effectively infinite zoom (from individual inserter to full-base satellite view) and through emergent player-imposed organization patterns. Robot Uprising has a fixed 8x8 grid with at most 2 zoom levels — it cannot rely on zoom to solve density. Instead, it must provide the filtering and clustering tools that Factorio players learn to build for themselves.

### StarCraft — Control Groups and Selection

StarCraft manages 200-supply armies (potentially 100+ units) through control groups (Ctrl+1 through Ctrl+0) and the minimap. Individual unit state is only visible when units are selected; unselected units are pure sprites. The key lesson: StarCraft never tries to show all unit state simultaneously. You see what you select. Robot Uprising's unit-focus mode during sealed watch follows this principle — you can see one unit's full state or all units' approximate silhouettes, but not both.

### Into the Breach — Perfect Information at Small Scale

Into the Breach maintains perfect readability with 3 player mechs and 4-8 enemy Vek on an 8x8 grid. Total unit count peaks around 11-12 (including environmental objects). The key constraint: Into the Breach NEVER exceeds 12 entities on the board. It maintains visual clarity by capping density. Robot Uprising cannot cap density in the same way (the factory's purpose is to let players produce units), so it must solve a problem Into the Breach designed away. ITB's consequence previews (arrows, damage numbers, push indicators) are the closest analog to channel wiring — multiple overlaid indicators on a shared grid. ITB keeps these readable by showing them only for the currently-selected action, never all actions simultaneously. This is exactly the channel filter solo-mode pattern.

---

## Sensory Description by Mission Tier

### Mission 1: The Empty Board

The 8x8 grid is a dark expanse of jungle tiles — deep green (#1B4332) with tiny pixel fronds at tile edges, data-lights embedded in the terrain pulsing cyan on even ticks. Two unit sprites sit in a sea of empty space: a scout on tile C4 (small, compact, single cyan eye-dome glowing softly) and a striker on tile F5 (angular, red-orange blade-arms folded). Beneath each, a thin bar of colored pips — 6 for the scout, 8 for the striker — like tiny LED indicator lights on a circuit board. The holographic cyan grid floats above, its dashed lines flowing gently rightward. The overall impression: a vast workspace with two small elements to consider. The visual noise level is near-zero. The board could be a screensaver.

### Mission 5: The Network Emerges

Six units populate the western half of the board. A relay anchor sits at D4, its tall magenta antenna rotating on idle. Three colored dashed lines radiate from it — cyan to a scout at B3, amber to a striker at F6, lime to a second striker at E7. A second relay at D6 has two lines of its own. The lines cross near tile D5, creating a small colored intersection: cyan over amber, visible as alternating dashed segments of different colors overlapping for about 8 pixels. Context bars beneath the relays are the widest on the board — 12 pips each — and the two relays being on adjacent tiles means their bars form a near-continuous 24-pip horizontal strip. The factory UI element is visible at the board's edge: a small dark panel showing the production queue. The overall impression: a working system. Not crowded, but purposeful. Every element connects to something else. The board has shifted from "pieces on a chess board" to "nodes in a network."

### Mission 10: The Storm

Thirteen friendly units fill the left side of the board. The right side shows 7+ enemy units, including 2 enemy relays with their own channel lines (rendered in desaturated red tones to distinguish from player channels). Total visible entities: 20+. Nine player channel lines and 3+ enemy channel lines create a web of colored dashes that covers roughly 60% of the board's airspace. The holographic overlay layer is dense with information: cluster badges at zoomed-out view show "3x Scout", "3x Relay", "5x Mixed" in compact icons. At default zoom, individual sprites are visible but their context bars merge into colored bands. The perception radii of three scouts overlap to create a coverage blanket across the forward tiles — a shimmering field of overlapping dashed cyan circles. During sealed watch, signal pulses fire continuously — bright dots racing along channel lines 4-5 times per tick, creating a strobing, flickering network of activity. Combat flashes (red tiles, shatter animations, dying unit pixel-fragment dispersal) punctuate the signal traffic. The overall impression: a living system under stress. Beautiful and chaotic, like watching traffic from a skyscraper at night — thousands of lights moving in patterns that are incomprehensible in aggregate but meaningful when you focus on one vehicle. The player is no longer reading the board. They are interrogating it, one subsystem at a time, through filters and focus modes and the inspector's genealogy view. The game has evolved from a readable puzzle into a complex system that rewards the player's own attention management — mirroring the attention management they've been designing for their agents all along.

---

## Design Recommendation

The visualization system must accept that **composite readability has a hard ceiling at approximately 6 units / 4 channels.** Beyond that threshold, no amount of color differentiation, line routing, or spatial arrangement makes the full composite view legible at a glance. The game must therefore provide **decomposition tools** — channel filters, cluster views, unit focus modes, semantic highlighting — and teach the player to use them as naturally as they use zoom in a map application. The progressive disclosure gates (G1-G8) ensure that each decomposition tool arrives exactly when density demands it: the channel filter at M5 when channels multiply, the cluster view at M5 when unit count becomes player-controlled, the command overlay at M6, the signal heatmap at M7.

The deepest design insight is the **thematic resonance**: the player's agents struggle with limited context windows, forced to prioritize which information to attend to. At high density, the player faces the exact same challenge with the visualization itself. The filtering and focus tools are the player's own "attention system" for the UI. This symmetry between gameplay theme and interface challenge is rare and should be leaned into, not designed away. The difficulty of reading a 12-unit / 9-channel board is not a bug — it is the game's thesis made visceral.
