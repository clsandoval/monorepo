# 6.01a-iii-b — Damage States as Inspector Filter Layer: The "Combat Density" Heat Map

## The Question: Can the Board's Scars Become a Diagnostic Instrument?

The parent analysis (6.01a-iii) established that tile damage creates readable battle history during the sealed watch. The Inspector, however, is a fundamentally different mode — analytical, not emotional. Here, damage data transforms from ambient visual storytelling into a formal diagnostic overlay: a translucent heat map showing *where* combat was densest, *when* it peaked, and *how* the engagement zone shifted over time. The "Combat Density" overlay is the Inspector's version of what a Factorio player does when they squint at their factory and say "where are the bottlenecks?" — except the game draws the answer directly onto the board.

This aspect fully specifies: the heat map's visual grammar (gradient, opacity, legend), its placement within the Inspector's existing overlay hierarchy, its interaction with the timeline scrubber, and five variant approaches to what "combat density" actually means.

---

## Design Axis: What Does "Combat Density" Measure?

"Where was the fighting?" seems straightforward, but there are at least five legitimate interpretations. Each produces a different heat map. Each tells a different story.

### Metric A: "Raw Event Count" — Simple Combat Tally

Each tile gets +1 for every combat event that occurred on it (striker elimination, unit destruction, tag application if counted). The heat map is a simple count: tiles with 0 events are unshaded, tiles with 1 event are warm yellow, tiles with 3+ events are deep crimson.

**Visual specification:**
- 0 events: no overlay (pristine tile shows through)
- 1 event: translucent warm gold (#FFD700) at 20% opacity. Barely visible — a suggestion of activity.
- 2 events: amber (#FF8C00) at 35% opacity. Clearly tinted. "Something happened here more than once."
- 3 events: burnt orange (#FF4500) at 50% opacity. Hot zone. Draws the eye.
- 4+ events: deep crimson (#DC143C) at 60% opacity. The maximum. The tile pulses softly (0.3 Hz) at this level — a slow heartbeat indicating sustained violence.

**The pulse at max density is the key visual.** On an otherwise static heat map, one or two pulsing crimson tiles immediately draw the eye and say: "This is where your architecture broke down. This is where combat concentrated. This is the chokepoint." The pulse rate (0.3 Hz — one beat every 3.3 seconds) is slow enough to feel ominous, not alarming.

**Strengths:** Simplest to implement, most intuitive to read, directly maps to tile damage state data. A player glances at the heat map and instantly knows "red = lots of fighting, yellow = some, nothing = none."

**Weaknesses:** Treats all combat events equally. Losing a relay (catastrophic for signal architecture) looks the same as eliminating an enemy scout (routine). Doesn't distinguish offensive kills from defensive losses.

### Metric B: "Weighted Impact" — Event Significance

Each combat event is weighted by significance: destroying an enemy scout = 1 point, destroying an enemy striker = 2, losing YOUR scout = 2 (defensive failure), losing your relay = 4 (architecture disruption), losing your command = 6 (catastrophic). The heat map shows weighted density rather than raw count.

**Visual specification:** Same gradient as Metric A, but the thresholds shift: 1-2 weighted points = gold, 3-5 = amber, 6-8 = burnt orange, 9+ = crimson with pulse.

**Strengths:** A single relay destruction paints the tile amber immediately — the map screams "you lost something important HERE." Two enemy scout kills barely register. The map reflects strategic significance, not just activity.

**Weaknesses:** The weighting is opaque. "Why is this tile so red when only one unit died here?" requires understanding the weight table. Adds a learning hurdle. The weight values become balance decisions — is losing a relay really 4× worse than eliminating an enemy scout? Players may disagree.

### Metric C: "Temporal Flow" — Engagement Zone Migration

Instead of a static heat map, the overlay animates across the timeline scrubber. At tick 1, the map is empty. At tick 5, a gold bloom appears at tiles C6-D6 (first contact). By tick 12, that bloom has faded to a ghost while a new crimson bloom forms at E4-E5 (the main engagement). The heat map FLOWS, showing how the battlefield's center of gravity shifted over time.

**Visual specification:**
- Each combat event produces a radial bloom: a circle of color expanding from the event tile outward by 1 tile radius, peaking at the event tick, then decaying over 5 ticks.
- Bloom color: warm gold at creation → amber as it ages → cool grey as it fades. The color temperature itself encodes time: warm = recent, cool = old.
- Overlapping blooms ADD their intensities. Two overlapping decaying blooms create a brighter zone than either alone.
- The scrubber controls which blooms are visible. Scrub to tick 10: all events from ticks 1-10 are visible at their respective decay states. Scrub to tick 5: only events from ticks 1-5.

**The radial bloom extending beyond the event tile is critical.** A combat event at E5 doesn't just heat E5 — it heats E4, E6, D5, F5 as well (the four orthogonal neighbors). This creates smooth gradients instead of isolated colored squares. A cluster of three combats in adjacent tiles produces a large warm zone that reads as "engagement area" rather than "three individual events."

**Strengths:** By far the richest diagnostic tool. Players can scrub through the timeline and watch the engagement zone migrate across the board. "The fighting started in the northeast and moved southwest over 10 ticks" — this IS the battle's story rendered as a data visualization. The temporal dimension makes this unique among strategy game debriefs.

**Weaknesses:** Computationally more expensive to render (per-tick bloom calculation). The animated overlay may overwhelm new players. The bloom radius bleeds into adjacent tiles, which could feel inaccurate ("why is this tile warm? Nothing happened here!"). The visual complexity competes with other Inspector overlays (signal lines, buffer bars, perception radii).

### Metric D: "Friend vs. Foe" — Asymmetric Combat Density

Two overlapping heat maps, one for player kills (cyan/blue) and one for player losses (red/magenta). Where the player killed enemies, tiles glow cool blue. Where the player lost units, tiles glow warm red. Where BOTH happened (contested tiles), the overlay shows a split gradient — half blue, half red — or a purple composite.

**Visual specification:**
- Player kill: cyan (#00E5FF) at 25% opacity per event, stacking up to 70%.
- Player loss: hot magenta (#FF2D6F) at 35% opacity per event (losses weighted heavier — each loss matters more), stacking up to 70%.
- Contested tile (both kill and loss): the tile splits diagonally — upper-left triangle shows the kill color (cyan), lower-right triangle shows the loss color (magenta). The split angle is the ratio of kills to losses on that tile. A tile where you killed 3 enemies and lost 1 unit shows a mostly-cyan tile with a small magenta corner. A tile where you lost 2 and killed 1 shows the inverse.

**The diagonal split is the hero visual.** A board painted in cyan and magenta — cool killing grounds and hot loss zones — is instantly readable as a strategic assessment. The player's eye jumps to the magenta zones: "I'm hemorrhaging units here." Then to the cyan zones: "My architecture works here." Then to the purple contested tiles: "These are the margins."

**Strengths:** The richest single-glance strategic summary. Answers "where am I winning?" and "where am I losing?" simultaneously. The cyan/magenta pairing is colorblind-friendly across protan and deutan modes (cyan remains visible; magenta desaturates but maintains distinct luminance). Creates stunning board screenshots — the "battle report as art" moment.

**Weaknesses:** The diagonal split is visually complex at the per-tile level, especially at isometric scale. On an 8×8 grid, some tiles might be too small to read the split. The two-color overlay competes visually with signal lines (green dashed) and perception radii (cyan). The cyan kill color overlaps with existing cyan gameplay colors (tagging, perception). Magenta loss color might conflict with some biome palettes (Siquijor's bioluminescence uses cyan-green).

### Metric E: "Cluster Analysis" — Automated Engagement Zone Detection

Rather than painting every tile individually, an algorithm identifies discrete engagement zones: contiguous regions where 3+ combat events occurred within a 5-tick window. Each cluster is outlined with a colored boundary (gold for the first cluster, amber for the second, crimson for the third). The cluster outline pulses faintly. Non-cluster tiles show no overlay at all.

**Visual specification:**
- Cluster detection: any group of 2+ adjacent tiles (orthogonally connected) where each tile had at least 1 combat event within the same 5-tick window. The 5-tick window groups events that were part of the same skirmish.
- Cluster boundary: a 2px dashed outline around the cluster's perimeter. Color assigned by chronological order: first cluster = gold (#FFD700), second = amber (#FF8C00), third = crimson (#DC143C), fourth+ = cycling.
- Interior tiles: light fill at 15% opacity matching the cluster color.
- Cluster label: small floating text above the cluster center showing "Skirmish 1 (T8-T12)" — the cluster name and the tick range.
- On the timeline scrubber: clusters appear and disappear as the scrubber moves through their active tick range. A cluster from ticks 8-12 is visible only when the scrubber is at tick 8 or later.

**The cluster labeling with tick ranges is the key insight.** Instead of "this area was hot," the overlay says "Skirmish 1 happened at ticks 8-12 in the northeast, Skirmish 2 happened at ticks 15-20 in the center." The battle decomposes into named, bounded engagements. This is the analytical equivalent of a military after-action review's "Phase 1, Phase 2, Phase 3" structure.

**Strengths:** Cleanest visual — no gradient noise, no overlapping colors. Just crisp boundaries around identified skirmish zones. The cluster labels tell a story: "three skirmishes, migrating south." Works beautifully with the timeline scrubber: clusters materialize and dissolve as you scrub, making the battle's phases visually distinct. Most "professional" feel — this is what a real data analyst would produce.

**Weaknesses:** The clustering algorithm introduces subjective parameters (what counts as "adjacent"? what's the 5-tick window threshold? what's the minimum cluster size?). Some players will disagree with the algorithm's cluster boundaries — "that was clearly ONE fight, not two separate skirmishes." Algorithmically determined zones may miss diffuse combat (a scout dying alone at the board edge doesn't form a cluster). No intensity gradient within clusters — a tile where 5 units died looks the same as a tile where 1 unit died, as long as both are inside the cluster boundary.

---

## Recommended Design: "The Three Lenses" — Progressive Toggle Set

Rather than choosing one metric, the Inspector offers three toggleable overlays, each revealing a different analytical lens:

1. **Heat Map** (Metric A — raw event count): The default. Toggle ON by clicking the 🔥 icon in the Inspector sidebar's "Overlays" section. Simple, intuitive, always available.

2. **Battle Flow** (Metric C — temporal flow): Unlocked after Mission 5 when the factory introduces longer battles where temporal flow matters. Toggle ON via the 🌊 icon. The blooms animate as the player scrubs the timeline.

3. **Kill Map** (Metric D — friend vs. foe): Unlocked after the first Gauntlet match, where understanding offensive vs. defensive performance matters. Toggle ON via the ⚔ icon. Cyan/magenta split.

**Mutual exclusivity:** Only one combat density overlay active at a time. Clicking one deactivates the others. The three icons sit in a row in the sidebar, with the active one lit and the others dimmed. This prevents visual overload from stacking multiple heat maps.

**Interaction with the timeline scrubber:**
- **Heat Map (Metric A):** Shows cumulative density up to the current scrubber position. Scrub to tick 10 → density reflects events from ticks 1-10 only. The map builds as you scrub forward.
- **Battle Flow (Metric C):** Shows the bloom animation state at the current scrubber tick. Blooms appear, peak, and decay as you scrub through time. This is the "time-lapse" experience.
- **Kill Map (Metric D):** Shows cumulative friend/foe density up to the current scrubber position. The cyan/magenta pattern shifts as you scrub — "I was winning at tick 10 but losing by tick 20" is visible as the cyan zone shrinks and the magenta zone grows.

---

## The Heat Map Overlay: Full Visual Specification

### Rendering Layer

The combat density overlay renders ABOVE tile sprites and tile damage effects, but BELOW unit sprites, signal lines, and gameplay overlays (perception radii, EM rings). This means:

| Layer (bottom to top) | Content |
|---|---|
| 1. Tile base sprite | Biome-specific terrain |
| 2. Tile damage state | Scars, cracks, broken neon (from 6.01a-iii) |
| **3. Combat density overlay** | **Heat map / Battle Flow / Kill Map** |
| 4. Unit sprites | Scout, Striker, Relay, etc. |
| 5. Signal lines | Channel wiring (colored dashed lines) |
| 6. Gameplay overlays | Perception radii, EM rings, tag markers |
| 7. UI annotations | Decision trace highlights, event labels |

Rendering above damage states but below units means: damage scars are tinted by the overlay (a cracked terrace tile with an amber heat map overlay looks like a warm-tinted wound), while units standing on hot tiles are clearly visible (no overlay bleeds onto unit sprites).

### Color Gradient (Heat Map — Metric A)

The gradient follows a warm-only spectrum to avoid confusion with cyan/green gameplay colors:

```
Events: 0     1         2          3          4+
Color:  none  #FFD700   #FF8C00    #FF4500    #DC143C
Opacity: 0%   20%       35%        50%        60%
Name:   clear warm gold  amber      hot orange crimson
Pulse:  none  none      none       none       0.3 Hz glow ±5% opacity
```

The gradient is **warm-only** (gold → crimson) because:
- Green is taken (signal delivery flash, channel wiring)
- Blue/cyan is taken (tagging, perception radii, player kills in Metric D)
- Purple is taken (EM emission rings)
- Warm colors (gold/amber/red) are associated with "heat" and "intensity" in universal visual grammar
- The warm gradient works under protan, deutan, and tritan colorblind modes (all retain luminance contrast)

### Tile Coverage

The overlay fills the entire tile face (the isometric diamond's top surface). It does NOT extend to the wall face (the angled sides visible in isometric view). This is important: the wall face retains the tile's biome texture (rice terrace stone, volcanic rock, neon panels), keeping the aesthetic grounding while the top surface shows analytical data.

The overlay has a 1px inset from the tile edge, creating a visible gap between adjacent overlay cells. This gap (which shows the tile's true color beneath) acts as a grid line, maintaining the Into the Breach visual clarity of distinct tile boundaries.

### Legend

A compact legend appears in the Inspector sidebar when any combat density overlay is active:

```
┌──────────────────────────┐
│  COMBAT DENSITY          │
│                          │
│  ■ 0 events              │
│  ■ 1 event     (gold)    │
│  ■ 2 events    (amber)   │
│  ■ 3 events    (orange)  │
│  ■ 4+ events   (crimson) │
│                          │
│  Total events: 14        │
│  Unique tiles: 9 / 64    │
│  Densest: E5 (4 events)  │
│                          │
│  [■ Heat Map] [□ Flow]   │
│  [□ Kill Map]             │
└──────────────────────────┘
```

The three summary stats at the bottom are critical: **Total events** (how much combat happened), **Unique tiles** (how spread out the fighting was — 9/64 means concentrated, 30/64 means widespread), and **Densest** (which tile was the hottest, with coordinate + count).

The **Densest** tile stat is clickable — clicking it centers the board on that tile and opens the unit inspector for whatever unit was last active there. This creates a one-click path from "where was the fighting?" to "what happened there?"

### Audio

The overlay itself is silent (it's a passive analytical layer). However:
- **Activation:** A soft "thermal imaging" chime when toggling ON — a descending two-note electronic tone (C4→G3) suggesting "scanning." 200ms total.
- **Deactivation:** The reverse ascending chime (G3→C4). "Scan complete."
- **Hovering over a hot tile:** A subtle low hum proportional to the tile's event count. 0 events = silence. 1 event = barely audible warm tone. 4+ events = a low throb (60 Hz, 15% volume). This provides audio redundancy for colorblind players — they can "hear" the hottest tile even if the gradient isn't perfectly visible.
- **Crimson pulse tile:** The audio throb pulses in sync with the visual pulse (0.3 Hz). The throb is a felt frequency as much as a heard one — on headphones, it should vibrate slightly in the earpiece.

---

## Inspector Sidebar Integration

The combat density overlay controls live in the Inspector's **"Overlays" panel** — a collapsible section of the sidebar (below the timeline scrubber, above the unit inspector). The Overlays panel manages ALL visual overlays:

```
OVERLAYS                              [▼]
──────────────────────────────────────
Combat Density
  [🔥 Heat Map] [🌊 Flow] [⚔ Kill]

Signal Channels
  [□ recon-net]  [□ threat-alert]
  [□ all-clear]  [☑ emergency-net]

Perception Radii
  [☑ Show]  [□ Enemy perception]

EM Emissions
  [□ Show]

Battle Scars
  [☑ Show]  [□ Ghost scars (prev)]
```

The **Combat Density** row shows three icon toggles. The active overlay's icon is highlighted (bright fill + 1px white outline). Inactive overlays show dimmed icons. Clicking an active overlay's icon again deactivates it (toggle behavior).

The Overlays panel follows a consistent grammar:
- Each overlay category has a label and one or more toggle icons
- Toggles within a category are mutually exclusive where noted (Combat Density modes) or independently togglable (Signal Channels per-channel)
- All overlays can be active simultaneously EXCEPT combat density modes (only one at a time) — a heat map can coexist with signal channel lines, perception radii, and EM rings

### Interaction with Existing Inspector Tools

**Timeline scrubber + Heat Map:** As the player scrubs the timeline, the heat map updates to reflect cumulative events up to the scrubber's current tick. Scrubbing from tick 1 to tick 30 shows the heat map growing — tiles lighting up one by one as combat events occur. This creates an "incremental painting" effect that's deeply satisfying to watch. The heat map literally tells the story of the battle as a slow accumulation of warmth.

**Decision trace + Heat Map:** When inspecting a unit's decision at a specific tick, the decision trace highlights which context window entries influenced the decision. If the heat map is active, the player can see BOTH "this unit decided to move west" AND "the west side of the board was the coldest zone." The spatial context of the decision becomes legible. "It moved toward the quiet zone — smart."

**Context window chart + Heat Map:** The sparkline showing a unit's context utilization over time can be correlated with the heat map. A scout whose context spikes at tick 12 might be standing on a tile that turned amber at tick 12 — the spatial and temporal data converge. The Inspector doesn't draw this correlation explicitly, but the visual coexistence of both overlays lets the player discover it.

**Signal genealogy (4.16) + Heat Map:** If signal genealogy graphs exist showing how a piece of intelligence traveled through the network, the heat map adds a spatial layer. A signal that originated at a crimson tile (heavy combat) and traveled to a calm tile (no combat) tells a story: "intelligence from the front reached the safe rear."

---

## Player Journeys

### Journey: Sofia, 28, UX Designer, First Strategy Game

**Context:** Mission 3 (Siquijor Mystic Island). Sofia just lost — her scouts walked into an ambush in the northeast corner. She's in the Inspector for the first time after a real defeat.

**Minute 0:00 — The Debrief Opens**
The sealed watch ended 10 seconds ago. The "seal breaking" transition plays — the board center-zooms, the tick clock dissolves into a timeline scrubber, and the Inspector sidebar slides in from the right. Sofia sees: the 8×8 Siquijor board, her destroyed units greyed out at their death positions, the timeline scrubber showing 22 ticks. The sidebar has sections: "Timeline," "Unit Inspector," "Overlays," "Event Log."

She's not sure what to look at first. The board is just... a board. Some damaged tiles (bioluminescence dimmed, cracks in volcanic rock) but the spatial pattern isn't jumping out.

**Minute 0:15 — Discovering the Heat Map**
Sofia's eye drifts to the Overlays panel. She sees "Combat Density" with three icons. The 🔥 icon is the most recognizable — she clicks it.

The board transforms. A warm gold wash appears over tiles F6 and G6 — barely visible, just a tint. Then brighter amber at E7 and F7. And at F6, the overlay deepens to burnt orange. She hasn't moved the scrubber yet, so this is the FULL battle's cumulative heat map.

The pattern is immediate: a warm blob in the northeast quadrant. The rest of the board is cold — no overlay at all. Her entire battle happened in one corner. The legend in the sidebar confirms: "Densest: F6 (3 events). Unique tiles: 5/64."

Five out of sixty-four tiles. Her entire battle was fought on less than 8% of the board.

**Minute 0:30 — "Oh. That's the Problem."**
Sofia doesn't need to understand signal architectures or hook topologies to read this heat map. The warm blob in the corner says: "All your units went to the same place and died." She's a UX designer — she recognizes a clustering problem. Her scouts had no diversity in their patrol paths. They all converged on the northeast because her rules didn't differentiate their behavior.

She clicks on the "Densest: F6" stat in the legend. The board centers on F6. The unit inspector opens, showing the last combat event at F6: her scout was eliminated by an enemy striker at tick 9. She scrubs back to tick 6 — F6's overlay disappears (no events yet). Tick 7 — first event, gold wash appears. Tick 9 — second event, amber. Tick 14 — third event, orange. She's watching the battle concentrate in one tile, tick by tick.

Sofia thinks: "Next time, I'm going to make my scouts go in different directions." She doesn't know the word "patrol path differentiation" but the heat map taught her the concept in 30 seconds.

**Minute 0:50 — Comparing to the Empty Board**
She scrubs the timeline all the way back to tick 1. The heat map goes blank — no events. The board is pristine and cool. She slowly scrubs forward, watching the first gold bloom appear at tick 7... then amber at tick 9... then the northeast corner warming up tick by tick while the rest of the board stays cold. It's a time-lapse of failure: all the heat migrating to one corner.

She screenshots the final heat map state and sends it to her friend who recommended the game, with the message: "lol my entire battle happened in one corner." The heat map IS the story. No further explanation needed.

**What she learned:** The heat map is the most accessible analytical tool in the Inspector. It requires zero understanding of game mechanics to read. "Warm = fighting happened here, cold = nothing happened here" is universal visual grammar. The spatial clustering pattern taught her the concept of patrol diversity without any text.

**UI Annotations:**
- Heat Map activation: click 🔥 icon in Overlays panel, 200ms descending chime, gradient fills tiles simultaneously
- Legend stat "Densest: F6 (3 events)" is a clickable link to the unit inspector for that tile
- Timeline scrub: heat map updates per-tick, gold blooms appear at event ticks, creating "painting in time" effect
- Board composition: warm northeast quadrant against cold rest-of-board, clear at full zoom

---

### Journey: Marcus, 34, Software Engineer, Factorio Veteran (800 hours)

**Context:** Mission 8 (Bohol Hills). Marcus's complex factory produces 3 unit types across 4 channel networks. He's analyzing a near-victory that collapsed at tick 35 when his relay network got overwhelmed.

**Minute 0:00 — Layered Overlays**
Marcus opens the Inspector and immediately enables three overlays simultaneously: Signal Channels (specifically "recon-net" and "command-relay"), Perception Radii, and Combat Density (Heat Map). The board now shows green dashed signal lines, cyan perception circles, AND warm combat density gradients — a dense analytical canvas.

He notices the heat map shows two distinct clusters: tiles C3-D4 (amber, moderate combat) and tiles F6-G7 (crimson, heavy combat, two tiles pulsing at 0.3 Hz). The signal lines pass through BOTH clusters but are denser through the crimson zone.

**Minute 0:20 — The "Pipeline Through Fire" Insight**
Marcus makes the connection: his "recon-net" signal path runs directly through the crimson zone. His relay at F6 — the densest combat tile — was processing signals while under constant attack. Three combat events on its tile means the relay was in the most dangerous location on the board. No wonder it got overwhelmed — it was trying to process intelligence while absorbing context entries about nearby combat.

He switches from Heat Map to Kill Map (⚔ icon). The board repaints: tiles F6-G7 are now mostly magenta (player losses) with small cyan corners (a few enemy kills). The D3-D4 cluster is mixed — half cyan, half magenta. The Kill Map tells him: the northeast was a rout (he lost badly there), while the center was contested (he traded blows).

Marcus mutters: "I routed my critical signal infrastructure through the loss zone. That's like running your production database through the DMZ."

**Minute 0:40 — Temporal Flow Discovery**
He switches to Battle Flow (🌊 icon) and scrubs from tick 1 forward. The temporal blooms tell a different story than the static heat map:

- Ticks 1-10: First bloom appears at D3 (warm gold). Early skirmish in the center.
- Ticks 10-15: D3 bloom fading to grey (cooling). New bloom at F6 (gold, just starting).
- Ticks 15-25: D3 fully grey (old history). F6 amber, expanding to G6 and G7. The engagement zone MIGRATED northeast.
- Ticks 25-35: F6 zone turning crimson. Blooms expanding, overlapping, intensifying. This is where the battle concentrated and his architecture collapsed.

The Battle Flow shows him the TIMING: the center fight was a minor skirmish (came and went), but the northeast fight escalated over 20 ticks. His relay was in the path of a progressively intensifying engagement. He needed to either move the relay earlier or route around the hot zone.

**Minute 1:00 — Redesign Decision**
Marcus takes a screenshot of the Battle Flow at tick 30 — the board showing a grey ghost of the early center skirmish and a blazing crimson northeast — and opens his workbench. He moves the relay from F6 to B3 (the coldest zone on the board) and reroutes "recon-net" to arc around the anticipated engagement zone. The heat map TAUGHT him where to NOT place infrastructure.

**What he learned:** The three combat density modes serve different analytical needs. Heat Map = "where was it densest?" Kill Map = "where was I winning vs. losing?" Battle Flow = "how did the engagement migrate over time?" Cycling through all three in sequence builds a complete picture. For a Factorio veteran, this feels like reading a factory throughput graph — the same pattern recognition, applied to spatial combat data.

**UI Annotations:**
- Three overlay toggles: click to cycle 🔥→🌊→⚔, previous mode deactivates with ascending chime, new mode activates with descending chime
- Battle Flow blooms: radial gradient expanding 1 tile radius from event point, warm gold→grey color temperature shift over 5 ticks of decay
- Kill Map diagonal split: upper-left triangle = cyan (player kills), lower-right triangle = magenta (player losses), split angle proportional to kill/loss ratio
- Simultaneous overlay rendering: heat map (layer 3) + signal lines (layer 5) + perception radii (layer 6) all visible, no z-fighting

---

### Journey: Kai, 16, Twitch Streamer, Into the Breach Fan

**Context:** Gauntlet match against another player. Kai lost a close game and is analyzing in the Inspector while streaming to 340 viewers.

**Minute 0:00 — "Chat, Let's Do Forensics"**
Kai enables the Kill Map immediately. "Okay chat, let's see who controlled what." The board paints: the western half is mostly cyan (Kai's kills), the eastern half is mostly magenta (Kai's losses). The center has two contested tiles — split diagonally, roughly 50/50.

"It's literally a battle line. Cyan west, magenta east. I won the west, they won the east. Chat, look at D4 — it's perfectly split." The chat explodes: "MAP ART" / "that's a flag" / "cyan vs magenta civil war" / "frame this"

**Minute 0:15 — The Decisive Tile**
Kai clicks on the one deep-magenta tile at F5 — 4 events, all losses. The unit inspector shows: three scouts and one striker destroyed on this tile across ticks 12-28. "F5 was a KILL BOX. They set up some kind of trap here. Four of my units walked into F5 and died." He scrubs to tick 12 and watches in slow motion: his scout enters F5, an enemy striker was already adjacent at G5, instant elimination. "I had no perception into G5. My scout walked in blind."

He enables the Heat Map over the Kill Map — no, they're mutually exclusive. He switches to Heat Map. F5 pulses crimson. E5 and F6 are amber. G5 is warm gold. "The heat map version tells a different story — it says F5 was the hottest tile, but it doesn't say it was ALL MY LOSSES. The Kill Map was more useful here. Switching back." He returns to Kill Map.

**Minute 0:30 — The Clip**
Kai records a 12-second clip: he toggles through all three combat density overlays on the same board, one second apart. Heat Map (warm blob in center-east) → Battle Flow (blooms expanding and migrating, animated as he scrubs) → Kill Map (sharp cyan/magenta divide). "Three views, one battle." He overlays the text "FORENSICS MODE" in his streaming software. Chat demands he make it a TikTok.

The clip works because each overlay tells a recognizably DIFFERENT story about the same battle:
- Heat Map: "the fighting was mostly in the center-east" (WHERE)
- Battle Flow: "it started south and migrated north" (WHEN)
- Kill Map: "I controlled the west, they controlled the east" (WHO WON)

Three toggles, three narratives, same 8×8 board. The visual switching is immediately understandable to viewers who've never played the game.

**Minute 0:50 — Teaching the Chat**
A viewer asks: "what do the pulsing tiles mean?" Kai hovers over a crimson pulsing tile — the audio throb plays through his stream. "The pulse means 4+ events on one tile. It's the hot zone. The throb is the heartbeat of the war." He moves his cursor to a gold tile — the throb quiets to a barely audible hum. "And here's a calm zone. One event. Listen to how quiet it is." The audio gradient teaches the viewer through sound, not explanation.

**What he learned:** The three combat density modes are excellent streaming content because they're visually distinct, immediately readable, and create "a-ha" moments when switching between them. The Kill Map's cyan/magenta visual is the most stream-friendly — it looks like a map of territory control, which every viewer understands even without game knowledge.

**UI Annotations:**
- Toggle cycling animation: 300ms crossfade between overlay modes (heat map dissolves, kill map fades in)
- Kill Map on stream: cyan (#00E5FF) and magenta (#FF2D6F) are both vivid on stream encoding, high contrast against dark biome backgrounds
- Crimson pulse: 0.3 Hz glow visible at stream resolution (720p+), synced audio throb audible on stream audio
- Hover audio: per-tile low hum proportional to event count, audible through stream mix at 15% volume

---

### Journey: Amara, 55, Retired Teacher, Accessibility Needs (Low Vision, 150% Zoom)

**Context:** Mission 4. Amara plays at 150% zoom with high-contrast mode enabled. She's in the Inspector after her third retry.

**Minute 0:00 — Accessible Heat Map**
Amara enables the Heat Map. At 150% zoom, each tile's overlay is large enough to read clearly. But she's using high-contrast mode — does the warm gradient still work?

In high-contrast mode, the heat map gradient shifts to a **luminance-primary** rendering: instead of gold→amber→orange→crimson (which relies on color differentiation), the overlay uses brightness steps:

| Events | Standard Color | High-Contrast Treatment |
|---|---|---|
| 1 | Gold, 20% | White, 15% + ○ circle marker |
| 2 | Amber, 35% | White, 30% + ◇ diamond marker |
| 3 | Orange, 50% | White, 50% + □ square marker |
| 4+ | Crimson, 60% + pulse | White, 65% + pulse + ★ star marker |

The **shape markers** (○, ◇, □, ★) provide a non-color channel for density information. At 150% zoom, these markers are clearly readable. Each tile with combat events shows both the brightness overlay AND the shape marker centered on the tile.

**Minute 0:15 — Hover Tooltips**
Amara hovers over a tile with a diamond marker. A tooltip appears (300ms delay, 16pt text at her accessibility font size): "Tile D5: 2 combat events. Tick 8: Scout-A eliminated enemy. Tick 14: Striker-B eliminated by enemy." The tooltip provides the exact same information as the color gradient, in text form. For Amara, the tooltip IS the heat map.

She can also hear the heat map: hovering over the diamond tile produces a moderate low hum. Moving to a star-marked tile, the hum deepens and pulses. Moving to an unmarked tile, silence. The audio heat map is a full alternative channel.

**Minute 0:30 — Screen Reader Integration**
If Amara had a screen reader active, tabbing through the heat map (keyboard navigation through the tile grid) announces: "Tile A1: no combat events. Tile A2: no combat events. ... Tile D5: 2 combat events, diamond. Tile E5: 3 combat events, square." The shape names ARE the screen reader vocabulary for density levels.

**What she learned:** The combat density overlay works across three accessibility channels: visual (brightness + shape markers), auditory (hover hum at proportional intensity), and textual (tooltips + screen reader). No single channel is necessary — any one provides the full analytical picture.

**UI Annotations:**
- High-contrast gradient: luminance-only (white at increasing opacity) instead of warm spectrum
- Shape markers: ○◇□★ centered on each tile, 6px at standard zoom (9px at 150%)
- Hover tooltip: 300ms delay, white background, 16pt minimum at accessibility setting, shows tile coordinate + event count + event list
- Audio feedback: low hum (80 Hz) at hover, intensity proportional to event count, 0.3 Hz pulse sync on 4+ event tiles
- Screen reader: tab navigation through grid, announces "Tile [coord]: [count] combat events, [shape name]"

---

## Interaction Effects

### With Tile Damage States (6.01a-iii)

The heat map and tile damage states encode related but distinct information. Tile damage shows WHERE combat happened (through visual scars). The heat map shows HOW MUCH combat happened (through color intensity). A tile with a single scar might be gold (1 event) or crimson (4 events if multiple combats happened there). The heat map adds QUANTITATIVE information on top of the damage state's QUALITATIVE information.

When both are visible simultaneously (Battle Scars toggle ON + Heat Map toggle ON), the rendering is: damaged tile sprite → heat map overlay on top. A cracked Siquijor tile with dead bioluminescence PLUS an amber heat wash = a tile that looks "warm and wounded." The aesthetic synergy is strong — damage shows the world's memory, heat shows the analyst's assessment.

### With Damage Persistence Across Retries (6.01a-iii-a)

If the Fading Memory model (Option E from 6.01a-iii-a) is used, ghost scars from previous attempts are visible at 30-60% opacity. The heat map in the Inspector, however, only reflects the CURRENT attempt's combat. This creates a useful contrast: ghost scars show "where fighting happened BEFORE," heat map shows "where fighting happened NOW." The player can compare spatial patterns across attempts without any overlay switching — ghosts are beneath the heat map, both visible at once.

### With the Two-Act Debrief (4.04b)

The heat map is exclusively an Inspector tool — it never appears during the sealed watch. This preserves the sealed watch's emotional purity (you experience the battle viscerally, through tile damage and combat flashes) and makes the heat map a reward for entering the analytical phase. The transition from "I SAW combat on those tiles" (sealed watch) to "I can MEASURE combat density on those tiles" (Inspector) is the two-act debrief's emotional→analytical transition applied to spatial data.

### With the Effective Outcome Timestamp (4.18)

The EDT identifies the tick at which the match's outcome was effectively determined. If the heat map is in Battle Flow mode (Metric C), the EDT tick can be marked with a vertical line on the timeline scrubber. Combat blooms BEFORE the EDT are "the decisive phase." Combat blooms AFTER the EDT are "playing out an already-decided game." The EDT divides the heat map into two temporal regions: "this fighting mattered" and "this fighting didn't."

### With Campaign Map Meta-Persistence (6.01a-iii-a-iii)

If the campaign map shows province battle scars proportional to retry count, the heat map provides the source data for those scars. A province retried 8 times with most heat concentrated in the northeast → the campaign map province icon could show a warm northeast corner. The per-mission heat map data FEEDS the campaign map's meta-visualization.

### With Signal Genealogy (4.16)

The heat map can serve as a spatial backdrop for signal genealogy traces. When examining how a specific signal traveled through the network, the genealogy line overlays on the heat map. A signal that traveled THROUGH a crimson zone is inherently more dramatic — "this intelligence passed through the firestorm to reach the striker." A signal that traveled through cool zones took a safer path. The heat map contextualizes signal paths as "dangerous" or "safe" routes.

---

## Sensory Description: What It Feels Like

**Activating the heat map** feels like putting on thermal goggles. The descending two-note chime is clinical, analytical — a "scanning" sound that shifts your mental mode from observer to analyst. The warm gold/amber/crimson gradient washes over the board like infrared vision: the cool tiles recede, the hot tiles demand attention. The pulsing crimson tiles feel like they're breathing — slow, ominous, alive with the memory of concentrated violence.

**Scrubbing the Battle Flow** feels like watching a weather radar. Blooms of warmth materialize, expand, peak, and cool to grey in a continuous cycle. As you scrub forward, the board MOVES — engagement zones drift across the surface like warm fronts on a meteorological map. The color temperature shift (warm gold → cool grey) gives each bloom a lifespan. You're watching the battle's circulatory system: where the blood pumped, and where it cooled.

**Reading the Kill Map** feels like looking at a political map. Cyan territory vs. magenta territory, with contested borders in between. The diagonal splits on contested tiles look like tectonic plate boundaries — two forces grinding against each other on a tile-sized fault line. The clean color division has a stark, almost cartographic quality: "this is mine, that is theirs."

**The audio layer** is the subtlest: hovering across the board with the heat map active is like running your hand over braille. Each tile hums or stays silent. The varying pitch and intensity of the hum creates a topographic audio surface — you're "feeling" the heat map through your headphones. The crimson pulse's synchronized audio throb is the emotional peak: a heartbeat in the war zone.

---

## The TikTok Clip

**"Three Views, One Battle."** A 15-second clip with no commentary. The Inspector opens on a Cebu Urban board — dark cyberpunk tiles, neon, scattered unit corpses. Three rapid cuts, one second each:

Cut 1: 🔥 Heat Map activates. Board paints warm gold→crimson. A northeast cluster pulses. "WHERE" fades in as text overlay.

Cut 2: 🌊 Battle Flow activates. The scrubber time-lapses from tick 1 to tick 30. Blooms materialize, migrate southward, cool to grey, new blooms form. A warm river flowing across the board. "WHEN" fades in.

Cut 3: ⚔ Kill Map activates. Board splits — western tiles glow cyan, eastern tiles glow magenta. Three contested tiles show diagonal splits. "WHO WON" fades in.

Final frame: the board with all three texts visible: WHERE / WHEN / WHO WON. Caption: "the game has an autopsy mode 🔬"

---

## New Aspects Discovered

- **6.01a-iii-b-i — Heat map as pre-battle prediction layer:** Can the Inspector's heat map from a PREVIOUS attempt be displayed as a ghost overlay during the PLAN phase of the next attempt? "Last time, combat concentrated here — plan accordingly." The heat map as a planning tool, not just a diagnostic tool. Interaction with damage persistence (6.01a-iii-a) and ghost scar model.
- **6.01a-iii-b-ii — Automated "engagement zone" narration in event log:** The Inspector's event log (timestamped signal events) could include auto-generated entries like "T8-T14: Engagement Zone Alpha (tiles D4-E5, 5 events)" derived from the cluster analysis (Metric E). The event log becomes a written battle narrative, not just a signal list.
- **6.01a-iii-b-iii — Heat map comparison across Gauntlet matches:** In Gauntlet mode, a meta-analysis tool showing heat map overlays from the last 5 matches against different opponents. "Against opponent A, my heat concentrates northeast. Against opponent B, it's center. Against opponent C, it's southwest." The spatial pattern varies by opponent — or doesn't, revealing rigid architecture.
- **6.01a-iii-b-iv — Enemy heat map as advanced unlock:** An "Enemy Combat Density" overlay showing where the OPPONENT's units fought from THEIR perspective. Available only after completing Mission 10 or reaching a Gauntlet rating threshold. Reveals whether your opponent's damage pattern was deliberate (concentrated on your relay positions) or chaotic (spread evenly). Interaction with adversarial counterfactual mode (4.39).
- **6.01a-iii-b-v — Heat map export as shareable image:** A one-click "Export Heat Map" button generating a standalone PNG of the heat map over the board — no UI chrome, just the 8×8 grid with the warm gradient. Sized for social sharing (1080×1080). Watermarked with match metadata (mission, attempt, date). The heat map as a "battle painting" — shareable art generated from gameplay data. Interaction with GIF economy (7.06c).
