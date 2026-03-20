# 8.10 — The Gauntlet Map Template System

## The Option

The Gauntlet — Robot Uprising's competitive mode — requires maps that produce consistently interesting matches. Not every 8x8 board layout generates good gameplay. Some maps end too quickly (rush layouts with adjacent spawn points), some drag on (fortress layouts with chokepoints that stalemate), and some produce degenerate strategies (one dominant topology that always wins). The Gauntlet Map Template System is a library of pre-approved map layouts with documented match-length distributions, community submission pipelines, and validation criteria that ensure competitive integrity.

### The Template Library: "The Atlas"

Each Gauntlet map template is a complete specification:

- **Board layout**: 8x8 grid with terrain type per tile (open, obstacle, resource node), player base position, enemy spawner position, and any special tiles
- **Match-length distribution**: Based on playtesting data — median ticks, 25th/75th percentile, percentage of matches in the "Gauntlet-eligible" range (60-150 ticks)
- **Strategy diversity index**: How many distinct architectural approaches can win the map. Measured by categorizing winning configurations into topology families (star, mesh, spine, etc.) and computing Shannon entropy. Higher entropy = more diverse strategies = better map.
- **EDT distribution**: Where the effective determination tick typically falls. Maps where EDT clusters early (< tick 30) feel "solved too fast." Maps where EDT is uniformly distributed across the match are ideal.
- **EM interaction profile**: How the map's terrain affects EM propagation. Some terrains block EM (urban buildings), others amplify (open rice terraces). The profile documents which stealth strategies are viable on this map.
- **Province association**: Which Philippine province the map represents, with terrain visually matching the geography (Palawan = jungle, Manila = urban, Taal = volcanic).

**The Atlas UI**: A browsable gallery showing each map template as an isometric thumbnail with key statistics overlaid. Players can filter by match length, strategy diversity, province, and terrain type. Each template card shows:

```
┌─────────────────────────────────┐
│  [Isometric Thumbnail]          │
│                                 │
│  PALAWAN RIVER CROSSING         │
│  Province: Palawan              │
│  ──────────────────────         │
│  Median: 92 ticks               │
│  Range: 65-140 (87% eligible)   │
│  Strategy diversity: 4.2 / 5.0  │
│  EDT: uniform                   │
│  EM profile: mixed (jungle+open)│
│  Season: S1, S3, S5             │
│  Community rating: ★★★★☆        │
└─────────────────────────────────┘
```

### Map Validation Criteria: "The Gauntlet Standard"

For a map to be Gauntlet-eligible, it must pass five automated tests:

1. **Match Length Test**: >= 80% of simulated matches must end between 60-150 ticks. Maps that produce too many quick kills (< 60 ticks) lack strategic depth. Maps that produce too many stalemates (> 150 ticks) drag on without resolution.

2. **Strategy Diversity Test**: At least 3 distinct topology families must have >= 15% win rate. A map where star topology wins 90% of the time is degenerate. The test runs 1,000 simulated matches using the AI opponent's config library (representative of human strategies from campaign mode and community submissions).

3. **EDT Distribution Test**: The EDT must not cluster in the first 20% or last 20% of the match more than 30% of the time. Early-EDT maps feel predetermined; late-EDT maps feel like nothing mattered until the end.

4. **Symmetry Test**: Both player positions must have win rates between 45-55% across 500+ simulated matches. Asymmetric maps give an unfair advantage based on spawn position.

5. **Degenerate Strategy Scan**: No single configuration (specific blueprint + production queue + channel topology) should achieve > 70% win rate. If one configuration dominates, the map rewards memorization over architectural thinking.

These tests are fully automated — community submissions are run through the validation pipeline before human review begins. The pipeline takes approximately 10 minutes for 1,000 simulated matches.

### Seasonal Map Selection: "The Season Atlas"

Each Gauntlet season (4-6 weeks) features a curated set of 5 maps from the Atlas. Map selection follows principles:

- **Terrain diversity**: No two maps in a season should share the same province or dominant terrain type
- **Length diversity**: At least one "short" map (median 65-80 ticks), one "standard" (80-110), and one "long" (110-140)
- **Strategy diversity**: The season set should collectively support all major topology families — no family should be unviable across all 5 maps
- **Rotation**: Maps that appeared in the previous season are ineligible for the next (minimum 1-season cooldown)
- **Community voice**: After each season, players vote on which maps to keep and which to retire. Top 2 voted maps get a 2-season residence guarantee.

The Season Atlas is announced 1 week before the season starts, giving players time to review maps, study terrain, and adapt their configurations. The announcement is a diegetic "deployment briefing" in the boot log — the AI summarizing each map's tactical characteristics.

### Community Map Submission: "The Architect's Workshop"

Players can design and submit maps for Gauntlet consideration. The submission pipeline:

**Step 1: Map Editor**
A dedicated editor within the game (accessible after completing the campaign) where players place terrain tiles, set spawn positions, and configure resource nodes on the 8x8 grid. The editor shows real-time previews: EM propagation overlay, shortest-path between bases, terrain type balance percentage.

The editor's constraint system prevents obviously broken designs:
- Both bases must be reachable from each other (pathfinding check)
- Obstacle density cannot exceed 40% (prevents maze maps)
- At least 2 distinct paths between bases must exist (prevents single-chokepoint camping)
- Resource nodes must be placed in contested zones (not adjacent to either base)

**Step 2: Self-Test**
Before submission, the creator runs the automated validation suite against their map. The results show pass/fail for each of the five criteria with detailed breakdowns. This lets creators iterate before submitting — adjusting terrain to fix match-length issues, widening chokepoints to improve strategy diversity.

**Step 3: Submission**
Passing all five tests makes a map eligible for submission. The creator writes a short description (title, province inspiration, intended tactical feel) and submits. The map enters a community review queue.

**Step 4: Community Review**
Submitted maps are available in a "Community Gauntlet" playlist — an unranked mode where players can try community maps and rate them on a 5-star scale. Maps accumulate play count and rating data over 2 weeks.

**Step 5: Official Selection**
Maps with 100+ plays, 4.0+ average rating, and passing validation are eligible for official Gauntlet seasons. A rotation committee (initially the developer, eventually a community panel) selects maps for upcoming seasons.

### Map Metadata as Competitive Intelligence

Each map template in the Atlas includes detailed metadata that functions as competitive intelligence for serious players:

- **Heatmaps**: Aggregate movement heatmaps showing where units most commonly travel. Hot zones are contested territory; cold zones are dead space.
- **Signal density maps**: Where signals are most commonly transmitted. High signal-density zones have higher EM detection risk.
- **Topology success rates**: Per-topology-family win rates on this specific map. "Star topology: 52%, Mesh: 48%, Spine: 35%, Picket Fence: 28%." This lets competitive players pre-adapt their architecture to the map.
- **Notable configurations**: A curated gallery of high-performing configurations that won on this map (with author permission). These are the "known answers" — players can study them, copy them, or design counters.
- **Map-specific tricks**: Community-discovered tactical nuances. "The C4 obstacle blocks EM from the western relay — stealth approaches from the north are viable." "Resource node at F6 is accessible from both bases within 8 ticks — early control decides the match."

## Player Journeys

#### Journey: Zara, 28, data scientist and Diamond I Gauntlet player

**Context:** Season 3 announcement. Five new maps revealed, including one community-submitted map ("Bohol Chocolate Hills") that Zara has never seen. She has 6 days before the season starts.

**Minute 0:00 — The Briefing**
Zara opens the Season Atlas. The boot log greets her with a deployment briefing: "Operator, Season 3 theaters of operation confirmed. Five provinces. Reconnaissance data follows." Each map thumbnail renders with key statistics.

She focuses on Bohol Chocolate Hills — the community map. Median 98 ticks, strategy diversity 4.5/5.0, EDT uniform. The province is Bohol — rounded green hills with scattered obstacles, two open lanes and one narrow passage through the center. Resource nodes at the center passage — whoever controls the chokepoint controls the economy.

Zara opens the map's detailed page. The heatmap shows heavy traffic in the center passage and along the two flanking lanes. Signal density is highest at the center (relays positioned to control both directions). The topology success rates show Mesh at 54% (distributed forces cover all three lanes), Star at 47% (centralized but vulnerable if the relay is in the center passage), and Spine at 38% (linear architectures struggle with three-lane maps).

**Minute 2:00 — The Study Session**
Zara opens the Notable Configurations gallery. Three high-performing configs are shared:
1. "The Trifecta" — three independent scout-striker pairs, one per lane, no central relay. Low EM, no single point of failure, but no coordination.
2. "The Watchtower" — central relay at the chokepoint with maximum perception, feeding two flanking striker groups. High EM but dominant map control.
3. "The Ghost" — minimal-EM stealth approach using terrain-blocked EM paths through the hills. Two scouts with no hooks, reporting via movement patterns instead of signals.

Zara studies each configuration for 15 minutes, loading them into the workbench to examine rules, hooks, and context configs in detail. She notices The Watchtower has a high win rate (61%) but a known counter — any architecture that can flood the central relay's context window wins, because the entire system depends on that one relay.

She decides to build a hybrid: distributed forces like The Trifecta but with a hidden relay behind the hills in the western lane, using terrain-blocked EM to stay invisible. If the opponent commits to the center, she flanks from the west. If they spread evenly, her hidden relay coordinates a focused strike.

**Minute 5:00 — The Practice Run**
Zara loads Bohol Chocolate Hills in unranked Community Gauntlet mode. She plays 5 practice matches against community opponents, testing her hybrid architecture. Match results: 3 wins, 2 losses. The losses both came from opponents who scouted her western relay early — the terrain blocks EM but not perception radius. She adjusts: adds an evade skill to the relay (costs more but makes it harder to tag) and reduces its hook firing rate to minimize signal activity.

After the 5 matches, she rates the map 4 stars. "Good tactical diversity but the center chokepoint is slightly too dominant — might want to widen it by one tile." Her rating and feedback join 83 other ratings in the community review data.

**UI Annotations:**
- Season Atlas: carousel of 5 map cards, horizontal scroll, gold border on current-selection card
- Map detail page: isometric thumbnail with toggleable overlays (heatmap, signal density, EM propagation), statistics panel on the right
- Notable Configurations: scrollable gallery below map detail, each config shown as a blueprint summary with win rate badge
- Community Gauntlet: separate queue button with "UNRANKED" label, map filter dropdown

#### Journey: Tomás, 16, Silver III, first-time map creator

**Context:** Tomás has completed the campaign and 2 Gauntlet seasons. He's noticed that no map in the Atlas represents his home province of Zambales (volcanic coast). He wants to create one.

**Minute 0:00 — The Editor**
Tomás opens the Map Editor (unlocked after campaign completion). A blank 8x8 grid appears with a terrain palette on the right: Open (light sand), Obstacle (dark volcanic rock), Resource Node (glowing crystal), Water (impassable, blue), and special tiles. He can also set the Province tag and biome style.

He sets Province: Zambales, Biome: Volcanic Coast. The grid background shifts to dark volcanic sand with ocean visible at the northern edge. He begins placing tiles:
- Player base: bottom-left (A1), on a rocky outcrop
- Enemy spawner: top-right (H8), on a cliff
- Central area: a volcanic ridge running diagonally from C6 to F3, made of obstacle tiles — units must go around it
- Two resource nodes: one on each side of the ridge (B5 and G4)
- Water tiles along the northern edge (row 8, columns A-E) — restricting northern approach paths

The real-time preview updates as he places tiles: shortest path between bases shows 12 tiles (around the ridge), EM propagation overlay shows the ridge blocks EM transmission (volcanic rock), obstacle density shows 18% (well under the 40% limit).

**Minute 3:00 — The First Self-Test**
Tomás runs the validation suite. Results:
- Match Length: PASS (median 88 ticks, 83% in 60-150 range)
- Strategy Diversity: FAIL (Star topology wins 68% — the ridge creates a natural relay position at D4 that dominates)
- EDT Distribution: PASS (uniform)
- Symmetry: PASS (48.5% / 51.5%)
- Degenerate Strategy: FAIL (one configuration at 74% win rate — a relay at D4 with maximum perception)

"The ridge is too good for relays," Tomás realizes. The D4 position has sightlines to both resource nodes and both lanes around the ridge. Any relay placed there controls the entire map.

**Minute 5:00 — The Iteration**
Tomás adds an obstacle tile at D4 — blocking the dominant relay position. He re-runs the validation:
- Strategy Diversity: PASS (Star 49%, Mesh 46%, Spine 42%, Picket Fence 38%)
- Degenerate Strategy: PASS (highest single config at 58%)

All five tests pass. The D4 obstacle forces distributed positioning — no single tile dominates anymore. The ridge becomes a terrain feature that MATTERS (blocks EM, forces pathing) without creating a dominant position.

**Minute 6:00 — The Submission**
Tomás writes his description: "Zambales Volcanic Shore — A diagonal volcanic ridge splits the battlefield, blocking EM transmission and forcing architecture decisions. Control both resource nodes or risk an economy deficit. Two viable approach lanes with a narrow ridge-crossing gap at E4."

He submits. The map enters the Community Gauntlet playlist. Over the next 2 weeks, 47 players try it. Average rating: 3.8 stars. Common feedback: "Ridge gap at E4 is slightly too narrow — maybe remove one obstacle." Tomás opens the editor, removes the E4 obstacle, re-runs validation (still passes), and resubmits. Rating improves to 4.1. The map is now eligible for official season selection.

**UI Annotations:**
- Map Editor: 8x8 grid center-screen, terrain palette right sidebar with drag-to-place, real-time overlays toggleable at bottom
- Validation results: modal overlay with 5 pass/fail indicators, click each to expand detailed breakdown
- Failed test: red indicator with specific failure detail ("Star topology: 68% win rate, threshold: 60%")
- Submission form: title, province dropdown, 200-character description, "Submit" button (greyed out until all tests pass)

#### Journey: The Season 5 Selection Committee (3 community members, 1 developer)

**Context:** Season 5 map selection meeting. The Atlas contains 28 approved templates (12 developer-created, 16 community-submitted). The committee must select 5 maps satisfying terrain diversity, length diversity, and strategy diversity constraints.

**Minute 0:00 — The Long List**
The committee reviews the Atlas filtered by eligibility (not in Season 4, validation passing, 4.0+ community rating). 18 maps qualify. They sort by community rating and discuss:

- "Bohol Chocolate Hills" (4.3 stars, 47 plays) — community favorite, three-lane tactical with center chokepoint
- "Ifugao Stacked Terraces" (4.1, 112 plays) — the original tutorial map adapted for Gauntlet, high-elevation relay positioning
- "Taal Lava Fields" (4.5, 89 plays) — volcanic terrain with EM-blocking lava flows, stealth-favoring
- "Manila Neon Grid" (4.2, 156 plays) — urban terrain with buildings blocking perception, short matches (median 72)
- "Siquijor Coral Maze" (3.9, 38 plays) — ocean-heavy, restricted movement, long matches (median 128)
- Several others at 3.8-4.0

**Minute 5:00 — The Diversity Check**
The committee builds a season composition matrix:

| Map | Province | Terrain | Median Ticks | Topology Bias |
|-----|----------|---------|-------------|---------------|
| Bohol | Bohol | Hills/Open | 98 | Mesh favored |
| Ifugao | Ifugao | Terraces | 85 | Star favored |
| Taal | Taal | Volcanic | 105 | Stealth favored |
| Manila | Manila | Urban | 72 | Spine favored |
| Siquijor | Siquijor | Coastal | 128 | Distributed favored |

Five different provinces, five different terrain types, length range from 72 to 128 (short/standard/standard/standard/long — they need one more short or one fewer standard). Topology bias covers all major families. The committee accepts this as the Season 5 set.

**Minute 8:00 — The Announcement**
The Season 5 Atlas is published. The boot log announcement writes itself across the screen in teal monospace: "DEPLOYMENT ORDER — SEASON 5. Five theaters confirmed. Bohol: three-lane contested terrain. Ifugao: elevated relay advantage. Taal: stealth corridor operations. Manila: close-quarters urban. Siquijor: extended coastal campaign. Reconnaissance packages attached. Prepare your architectures. Operation begins in 7 days."

Players who open the Atlas see the five map cards with a gold "SEASON 5" badge. Practice queues for Season 5 maps activate immediately in Community Gauntlet mode.

**UI Annotations:**
- Season badge: gold border + "S5" label on map cards in Atlas
- Practice queue: "PRACTICE — SEASON 5 MAPS" button in Community Gauntlet, rotates through all 5 maps
- Boot log announcement: full-screen monospace text, teal on dark navy, typed letter-by-letter at 40 characters/second, kulintang tone on each map name

## Strengths and Weaknesses

**Strengths:**
- Automated validation prevents broken maps from reaching competitive play, maintaining trust in the Gauntlet system
- Community submission creates infinite content pipeline — players invest in the game by designing for it
- Seasonal rotation prevents map staleness and rewards adaptation over memorization
- Map metadata (heatmaps, topology success rates) makes competitive preparation a meaningful strategic activity
- The validation criteria are transparent — players understand WHY a map is Gauntlet-eligible

**Weaknesses:**
- 1,000 simulated matches for validation requires good AI opponents — early in the game's life, the AI may not represent human strategy diversity
- Community map quality depends on the community being engaged enough to play test submissions — a chicken-and-egg problem for early player counts
- The 80% match-length threshold is a design choice that may be too strict (cutting interesting maps with bimodal length distributions) or too loose (allowing too much variance)
- Seasonal rotation means some beloved maps are unavailable — player frustration with "losing" their favorite map

## Interaction Effects

- **Gauntlet competitive mode**: The map template system IS the Gauntlet's content pipeline. Without it, competitive play stagnates on a few developer-made maps.
- **EDT metric (4.18)**: EDT distribution is a validation criterion — maps are rejected if EDT clusters unnaturally.
- **EM emission model (locked)**: Map terrain affects EM propagation, creating map-specific stealth strategies. The EM interaction profile is a first-class map property.
- **Community config necropsy (7.10)**: Notable configurations on each map's detail page extend the necropsy culture to map-specific tactical analysis.
- **Web demo (8.04e)**: The Community Gauntlet playlist serves as demo-compatible content — demo players can try community maps in unranked mode.
- **Root network topology (3.19a-ii)**: Map terrain directly affects which topologies are viable — the map template system is where topology optimization meets geographic reality.

## Comparable Games

- **Into the Breach**: Fixed squad + fixed map combinations create the strategic puzzle. Maps are developer-designed with known properties. Robot Uprising extends this with community creation.
- **StarCraft II Map Pool**: Seasonal rotation with community submission (TL Map Contest). The closest competitive precedent. SC2's map pool influences the entire metagame — specific maps favor specific races/strategies. Robot Uprising's strategy diversity test prevents the equivalent of "this map is a Zerg map."
- **Slay the Spire Ascension**: Not maps per se, but the escalating modifier system creates map-like variety. Each Ascension level changes the strategic landscape.
- **Tetris 99 / Tetris Effect Connected**: Fixed playfield but varied rule modifiers. The map template system is Robot Uprising's equivalent of Tetris rulesets.
- **Mario Maker**: Community-created content with automated validation (clear check — the creator must complete the level). Robot Uprising's self-test requirement is the clear-check analog.
- **Factorio blueprints + modding**: Community content as core engagement loop. Factorio's mod browser is the precedent for community map browsing.

## Sensory Description

The Atlas opens as a darkened gallery — map thumbnails rendered as isometric dioramas in recessed frames against a deep navy background. Each frame has a thin gold border. Hovering over a map lifts it slightly out of its frame (3px transform, 200ms ease) and illuminates the isometric tiles — jungle green for Palawan, volcanic orange for Taal, urban neon for Manila. The statistics panel slides in from the right as a translucent dark overlay with teal text.

In the Map Editor, placing terrain tiles produces satisfying tactile feedback — volcanic rock tiles land with a heavy "thunk" and send out tiny crack animations. Water tiles pour in with a liquid fill animation. Resource nodes descend from above with a crystalline chime and embed into the terrain with a brief glow. The validation suite runs with a progress bar showing test names in sequence — each passing test gets a green checkmark with an ascending two-note chime; a failing test gets a red X with a descending minor second.

The Season announcement in the boot log: teal monospace text on black, typed character by character. Each province name is highlighted in gold as it appears. After all five provinces are named, the text pauses for 1 second, then a final line types slowly: "Seven days to prepare. Choose your architectures wisely." A low kulintang gong sounds on "wisely."
