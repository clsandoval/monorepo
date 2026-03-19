# 4.06 — Campaign Map: Mission Presentation, Navigation, and Narrative Integration

## The Locked Context

The campaign map is a **Philippine archipelago** — stylized with recognizable geography (Luzon, Visayas, Mindanao). Ten missions map to ten provinces: Ifugao (rice terraces), Siquijor (mystic island), Palawan (jungle), Batanes (highlands), Cebu (urban), Manila (megacity), Mindanao (jungle), Bohol (hills), Zambales (volcanic coast), Taal (volcano — final boss). Visual style: stylized archipelago silhouettes with circuit-board data cable connections between provinces. Completed = cyan glow, current = gold pulse, locked = dim. Into the Breach inspired aesthetic.

The design space question is: **how does the player interact with this map?** How much information is on it? How does it frame the narrative? What happens between missions? How does the map evolve? The locked constraints establish the geography and visual language — everything else is open.

---

## Approach A: "The Boot Terminal" — Map as CLI Output

### The Concept

The campaign map isn't a traditional illustrated map. It's a **terminal readout** — the AI (you) viewing its operational theater through a command-line interface. The Philippines appears as an ASCII/monospace rendering in a dark terminal window, with provinces marked by coordinate labels and status codes. The player navigates by hovering/clicking nodes, but the aesthetic is a military command terminal, not a tourist map.

### Layout (1920×1080)

**Left panel (1280×1080): The Map Terminal**
A dark background (#0A0F14) with a subtle scanline effect (horizontal lines at 2px intervals, 3% opacity). The Philippine archipelago rendered as a simplified vector outline — not photorealistic, not ASCII, but clean line-art in cool teal (#4ECDC4) reminiscent of radar displays. Each province is a node: a small hexagonal icon at the province's approximate geographic position on the outline.

- **Completed nodes:** Filled hex, cyan (#4ECDC4), steady glow. A thin teal data cable (1px solid line with tiny traveling dots) connects to the next province in sequence.
- **Current node:** Filled hex, gold (#FFD700), pulsing glow (60 BPM, synchronized with the agung tick clock metaphor). Gold cable pulses toward it from the last completed node.
- **Locked nodes:** Hollow hex outline, dim grey (#2A3040). No cable connection. Faintly visible but clearly inaccessible.
- **Data cables:** Run between provinces following approximate real Philippine inter-island cable routes (undersea cables between Luzon-Visayas-Mindanao). The cables have tiny dots traveling along them (3px, traveling at 40px/s) — data flowing between provinces. Completed cables: teal dots. Active cable (to current mission): gold dots. Locked cables: no dots, dim grey line.

**Right panel (640×1080): Mission Briefing**
When a node is selected (hovered or clicked), the right panel fills with mission data, rendered in monospace font on the same dark background. The text appears line-by-line with a typewriter effect (40 characters per second), as if the AI is reading its own operational briefing.

```
> MISSION 03: PALAWAN JUNGLE NETWORK
> Province: Palawan | Terrain: Dense Jungle
> Threat Level: ██████░░░░ (6/10)
>
> OBJECTIVE: Establish relay chain through
>   jungle canopy. Enemy signal jammers
>   detected in grid sectors C4-E6.
>
> AVAILABLE UNITS:
>   Scout (×2) | Relay (×1) | Striker (×1)
>   [Pre-placed — no factory this mission]
>
> NEW CONCEPT INTRODUCED:
>   → Signal Interference (jungle terrain
>     reduces hook range by 1 tile)
>
> TERRAIN PREVIEW:
>   [8×8 grid thumbnail, 200×200px]
>
> ─────────────────────────────────
> [DEPLOY →]
```

### Sensory Description

The screen is dark. Faint scanlines ripple across the surface. In the center-left, the Philippine archipelago glows — a teal outline that looks like it was drawn on a radar screen. Luzon's broad northern mass, the scattered Visayas in the center, Mindanao's spread to the south. Data cables thread between islands, tiny dots traveling like signals along fiber optics. Three provinces glow cyan — Ifugao, Siquijor, Palawan, all completed. The fourth — Batanes, far north — pulses gold, a gentle heartbeat.

The player hovers over Batanes. The right panel comes alive. Green-on-dark text types itself into existence, line by line. "MISSION 04: BATANES HIGHLAND RELAY." A terrain preview materializes — the 8x8 grid rendered as a tiny isometric thumbnail showing highland plateaus and stone walls. At the bottom, the DEPLOY button pulses gold, matching the node's heartbeat.

Between the typing lines, a subtle audio: the click-clack of a teletype machine, modernized — electronic keyboard taps at half volume, each character producing a barely-audible click. Not intrusive. A texture. The background audio is a low ambient hum — the sound of a data center, ventilation and distant server fans. When the player moves to a different node, the right panel clears (a brief flicker, like a CRT switching inputs) and re-types the new mission briefing.

### Player Journeys

#### Journey: Tala, 19, CS student in Manila, Mission 3

**Context:** Completed Missions 1 (Ifugao) and 2 (Siquijor). Both were tutorials — hand-placed units, learning context, rules, and hooks. She's about to enter Palawan, the first mission with more than 3 units.

**Minute 0:00 — The Map**
Tala sees the archipelago. She recognizes it immediately — she's Filipino, she knows these islands. Ifugao and Siquijor glow cyan on the map. She hovers over Ifugao — the right panel types out a completed mission summary: "MISSION 01: IFUGAO RICE TERRACE ARRAY. STATUS: COMPLETE. Performance: 12 ticks, 0 losses. Concepts mastered: Context Window basics." A small stats card, not a replay option (replays are elsewhere). She smiles — 0 losses.

She moves to the current node: Palawan, pulsing gold. The cable from Siquijor to Palawan animates — gold dots traveling across the ocean between islands. The right panel clears with a CRT flicker and begins typing the Mission 3 briefing. "Province: Palawan | Terrain: Dense Jungle." She reads about signal interference — jungle reduces hook range. She sees the terrain preview — thick green tiles with leaf icons.

**Minute 0:45 — Exploring the Locked Future**
She hovers over Cebu — locked, dim grey. The right panel shows:

```
> MISSION 05: CEBU URBAN NETWORK
> STATUS: LOCKED
> Prerequisite: Complete Mission 04
>
> [CLASSIFIED — intel unavailable]
```

Just enough to know what's coming. The word "CLASSIFIED" makes her want to get there. She hovers over Taal — the final boss. Its node is different: a red-tinged hollow hex, slightly larger than the others, with a faint pulse. The right panel shows only:

```
> MISSION 10: TAAL CALDERA
> STATUS: LOCKED
> Prerequisite: Complete Missions 01-09
>
> [DATA CORRUPTED — ███████████████]
```

Corrupted data. The final mission is shrouded in mystery even at the UI level. Tala's curiosity spikes.

**Minute 1:30 — Deploy**
She clicks DEPLOY on Palawan. The map zooms into the Palawan node — the archipelago fades, the hexagon expands, and the terrain preview grows to fill the left panel. A transition animation: the data cable connecting to Palawan brightens to full gold, and the gold light rushes along it toward the node, like data being uploaded. The screen flashes white for 100ms. The plan screen appears — board left, workbench right. The boot log begins.

**UI Annotations:**
- Map zoom transition: 400ms ease-out, archipelago alpha fades from 1.0 to 0.0 as selected node scales from 1x to fullscreen
- Cable "upload" animation: gold pulse travels along cable at 800px/s, arriving at node triggers the white flash
- Boot log begins immediately after transition — no loading screen between map and plan phase
- Terrain preview in mission briefing: 200×200px isometric mini-board, non-interactive

#### Journey: Javier, 37, game designer, first playthrough, Mission 7

**Context:** Deep in the campaign. Five provinces glow cyan. He's entering Mission 7 — the first mission after Mission 6 introduced the Command agent. The map now shows a complex web of data cables, some undersea, some overland. The archipelago feels like a living network.

**Minute 0:00 — The Network View**
Javier notices something he hadn't before: the data cables between completed provinces have changed. What started as simple point-to-point lines now form a mesh — Ifugao connects to Siquijor which connects to Palawan which connects to Cebu. But there's also a faint new cable directly from Ifugao to Cebu (shortcutting through the archipelago), with data dots traveling faster than the original chain. The cable network is evolving — each completed mission adds redundancy. His map looks like an actual network topology now, not just a linear path.

He hovers over the current node: Mindanao. The briefing types out and mentions enemy Command agents for the first time. "ENEMY INTELLIGENCE: Adversary has deployed command-level agents. Expect coordinated enemy behavior." His completed missions' summaries now show additional data: "Ifugao: Signal chains = 12. Mindanao estimated: Signal chains = 40+." The game is showing him that the mission scale is escalating.

**Minute 1:00 — The Network Metaphor**
He realizes the map IS the game's theme. The Philippine archipelago, connected by data cables with traveling dots, is a literal signal network — the same kind of network he's building inside each mission with scouts, relays, and strikers. The map is the macro version of the game's core mechanic. Province-to-province = agent-to-agent. Cable routes = channels. Data dots = signals. He's been building the same thing at two scales and didn't notice until now.

**UI Annotations:**
- Network evolution: after completing Mission N, a new shortcut cable appears connecting Mission N-2 to Mission N (every 3rd mission creates a diagonal shortcut)
- Cable data dots speed up on shortcuts (80px/s vs 40px/s on standard cables), suggesting efficiency gains
- Mission summaries for completed provinces expand over time: initially just "COMPLETE", later showing signal chain count, buffer utilization peak, and ticks elapsed

---

## Approach B: "The Satellite View" — Illustrated Cartographic Map

### The Concept

A beautifully illustrated top-down map of the Philippine archipelago, rendered in the game's SE Asian cyberpunk pixel art style. Not a terminal — a proper *map*. Rice terraces visible on Luzon. Bioluminescent glow around Siquijor. Jungle canopy over Palawan. Urban sprawl on Cebu and Manila. The map is a piece of art that rewards lingering.

### Layout (1920×1080)

**Full-bleed map (1920×1080)** with overlay UI elements:

The entire screen is the map. The Philippine archipelago fills the space, rendered in isometric pixel art at macro scale. Ocean tiles are dark navy (#0D1B2A) with subtle wave animations (pixel-level rippling every 2 seconds). Land masses use the terrain palette from each province's mission — rice terrace greens for Ifugao, volcanic blacks and reds for Taal, jungle emerald for Palawan, neon-lit greys for Manila.

- **Province nodes:** Small fortress icons at each province location. Each fortress matches its terrain — a bamboo server farm for Ifugao, a bioluminescent tower for Siquijor, a jeepney drone depot for Manila. Completed = lit up, cyan data streams emanating upward like searchlights. Current = gold pulse. Locked = dark silhouette.
- **Data cables:** Undersea fiber optic lines rendered as glowing lines beneath the ocean surface (visible through semi-transparent water tiles). Dots travel along them. Where cables make landfall, small cable landing stations are visible on the coast.
- **Mission info:** Hovering a province node opens a tooltip card (320×240px) anchored to the node. Clean dark panel with mission name, terrain type, threat level bar, available units, and DEPLOY button. No typewriter effect — this is visual, not terminal.

### Sensory Description

The Philippine archipelago stretches across the screen. Luzon dominates the north — you can see the Cordillera mountains as stepped rice terraces in miniature, glowing green with server-farm heat signatures. Zoom toward Siquijor: the small island pulses with bioluminescent purple, mangrove antennas visible as tiny pixel art features along the coastline. Between the islands, underwater cables glow faintly — cyan threads beneath dark ocean tiles, carrying data dots south.

The current mission — Batanes, the northernmost island chain — burns gold. Its fortress icon is a highland relay station: stone walls with antenna arrays on top, a golden searchlight sweeping in slow circles. The surrounding ocean churns with slightly more active wave animation, suggesting turbulence, danger.

When the player hovers over Batanes, a tooltip card materializes — not with a type-writer, but with a quick fade-in (200ms). The card shows a tiny landscape illustration at the top (the Batanes highlands rendered in a 280×120px pixel art panorama), followed by crisp text: mission name, terrain, threat level, units. The DEPLOY button is a solid gold rectangle that brightens on hover.

The ambient audio is ocean — distant waves, wind, the creak of cable rigging. When hovering over a specific province, the ambient shifts to match: Ifugao adds faint bamboo wind chimes. Siquijor adds a low hum of bioluminescent insects. Manila adds distant traffic and neon buzz. The audio is a preview of the mission's soundscape.

### Player Journeys

#### Journey: Mei, 33, Product Manager from Singapore, Mission 1

**Context:** First time seeing the campaign map. She just completed the boot log introduction — the diegetic startup sequence that frames her as an AI. Now the map appears for the first time.

**Minute 0:00 — The Reveal**
The screen fades from the boot log's terminal text to... an island. Then more islands. The camera pulls back smoothly over 2 seconds, revealing the Philippine archipelago in isometric pixel art. Mei watches the coastlines appear, the ocean fill in, the undersea cables draw themselves like roots growing. One island glows gold — Ifugao, in the mountainous north of Luzon. All other nodes are dim silhouettes.

"Oh, it's the Philippines," she says aloud. She recognizes the geography from a trip years ago. The rice terraces of Banaue are visible on the map as tiny green steps — she hiked those. The emotional connection is immediate and unearned: the game just placed its fiction in a real place she has a memory of.

**Minute 0:30 — Exploration**
She hovers over Ifugao. The tooltip card fades in: a panoramic pixel art of rice terraces at dawn, mist rising between server racks nestled into the terrace walls. "MISSION 01: IFUGAO RICE TERRACE ARRAY." She hovers over other nodes — all locked, showing only the province name and "CLASSIFIED." But she can see their fortress silhouettes: a bioluminescent tower on Siquijor, a jungle canopy dome on Palawan, a massive data center on Manila.

**Minute 1:00 — Deploy**
She clicks DEPLOY on Ifugao. The camera zooms into the node — the archipelago falls away, the rice terrace fortress grows, and the camera descends into it. A seamless transition: the isometric world map becomes the isometric battle board. The rice terraces on the map ARE the tiles on the battlefield. No loading screen. The continuity is geographic — the battle takes place IN the world she was just looking at.

**UI Annotations:**
- First reveal: 2-second pullback camera animation, dark → full map
- Tooltip card: 320×240px, 200ms fade-in, anchored below-right of node
- Province panorama: 280×120px pixel art landscape at top of tooltip
- Deploy zoom: 600ms camera descent into node, map fades during zoom
- Audio crossfade: ocean ambient → mission-specific ambient over 1.5 seconds during zoom

#### Journey: Dante, 47, Filipino diaspora in Chicago, Mission 5

**Context:** Completed four missions. Half the map glows cyan. He's been recognizing the provinces — he grew up in Cebu and has family in Mindanao. The game keeps showing him home.

**Minute 0:00 — The Network Grows**
Dante opens the map. Four provinces glow cyan. The data cables connecting them are a small web across the northern Philippines. He sees the cable route: Ifugao → Siquijor → Palawan → Batanes. Undersea cables thread between islands, data dots flowing.

He notices that completed provinces have changed since last session. Ifugao's fortress, which was a simple server farm in Mission 1, now shows a small antenna array that wasn't there before — his relay configuration from Mission 1 is *reflected in the map*. The fortress evolved to show what he built there. A small but startling detail: the map remembers.

**Minute 0:30 — Home**
He hovers over Cebu — still locked, Mission 5. The silhouette shows a dense urban grid with fiber optic spires. The tooltip: "MISSION 05: CEBU URBAN NETWORK. STATUS: LOCKED." But the panorama at the top shows a pixel art Cebu — the Basilica, SM City, the strait separating Cebu from Mactan — all cyberpunk-ified. Data cables woven through familiar streets. His chest tightens. He's going to deploy robots in the streets he walked as a kid.

When he reaches Cebu (two more missions), the battle board will have terrain tiles that reference real Cebu landmarks. The Carbon Market as a resource node. The Mactan bridge as a chokepoint. The design team researched the geography enough to make each province *feel specific*, not generic.

**UI Annotations:**
- Fortress evolution: completed provinces' fortress icons add small details per mission (antenna for relays, patrol paths for scouts, breach marks for strikers)
- Provincial panoramas: each province has a unique 280×120px pixel art scene referencing real landmarks, cyberpunk-adapted
- Emotional pacing: provinces the player hasn't reached yet are partially revealed (silhouette + panorama) to create anticipation

---

## Approach C: "The War Table" — Minimalist Strategic Overview

### The Concept

No illustration. No pixel art. The campaign map is a **strategic display** — flat colored shapes on a dark grid, with clean data readouts. Each province is a colored block connected by straight lines. The focus is entirely on mission data, progression, and the player's combat record. Emotion comes from the numbers, not the art.

### Layout (1920×1080)

**Left (1280×720): Strategic Grid**
A flat dark background with the Philippine landmass rendered as simplified geometric shapes — Luzon as a rough polygon, Visayas as scattered rectangles, Mindanao as a triangle-ish form. No terrain detail. No pixel art. Just shapes in dark grey (#1A1A2E) on a slightly darker background (#0F0F1A), with a subtle grid overlay (32px squares, 5% opacity lines).

Province nodes are **square blocks** (48×48px) positioned at approximate geographic locations. Each block shows:
- Color fill: cyan (complete), gold (current), dim grey (locked)
- A 2-character mission number in the center: "01", "02", ... "10"
- A thin progress bar at the bottom: green (passing), red (failed attempts), empty (unattempted)

Connecting lines are straight (not curved, not geographic) — simply the shortest path between nodes. Data dots travel along these lines.

**Right (640×360, top): Mission Data Panel**
Selected mission's detailed stats in clean sans-serif:
- Mission name, province, terrain
- Best performance: ticks, losses, signal chains
- Current config version
- Available units and constraints

**Right (640×360, bottom): Campaign Stats**
Aggregate campaign data:
- Total missions complete
- Average ticks per mission
- Most-used unit type
- Longest signal chain ever achieved
- Total combos discovered (from Combo Codex)

### Sensory Description

Clean. Dark. Functional. The Philippine outline is barely recognizable — it's a collection of grey shapes, not an island. But the data is everything. Ten numbered squares form a rough archipelago pattern. Three glow cyan. One pulses gold. Six are dim. Lines connect them, data dots flowing. It looks like a network monitoring dashboard — Grafana for a robot army.

The audio is a low hum. No ocean. No wind chimes. Just the data center ambient — fans, electricity, the occasional click of a cooling system. When hovering a province, a subtle beep — the sound of selecting a row in a database. The right panel updates instantly — no typewriter, no fade. Just data replacing data.

### Strengths
- **Fastest navigation.** No animations to wait for. Select, read, deploy. Three clicks and you're in-mission.
- **Data-dense.** Campaign stats surface patterns the other approaches hide — "my average ticks are climbing, I need to optimize."
- **Consistent with War Room/Clockwork configurations.** The map feels like the Inspector's campaign-level equivalent.

### Weaknesses
- **No emotional payload.** The Philippines isn't recognizable. There's no cultural connection. No "that's where I grew up."
- **No anticipation.** Locked missions show numbers, not mysterious fortresses or corrupted data. Nothing to be curious about.
- **Streaming death.** This map is boring on Twitch. Nobody clips a campaign map that looks like a dashboard.

---

## Interaction Effects

**× Configuration Modes (8.03):** Each approach naturally maps to a configuration:
- Boot Terminal (A) → The Clockwork / War Room (analytical, terminal aesthetic)
- Satellite View (B) → The Greenhouse / Arcade Cabinet (emotional, illustrated, warm)
- War Table (C) → The War Room competitive variant (pure data)
If the game ships with configuration mixing (8.03a), the campaign map should morph between approaches as the player's analytical index shifts. A Greenhouse player sees the Satellite View; as they drift toward War Room competitive play, the map gradually flattens toward the War Table.

**× Boot Log Tutorial (locked):** The first time the campaign map appears, it should be introduced by the boot log. "SUBSYSTEM: STRATEGIC THEATER VISUALIZATION. Rendering operational map of Philippine archipelago. 10 provinces identified. 10 targets." This frames the map as the AI's own military planning display, regardless of visual approach.

**× Province-to-Battlefield Continuity:** If the map is illustrated (Approach B), the zoom-to-deploy transition should show geographic continuity — the battle board IS a zoomed-in section of the map. Rice terraces on the map become rice terrace tiles on the board. This requires the terrain art to be consistent at both scales.

**× Locked Narrative (boot log):** The boot log plays at mission start, not on the campaign map. But the map should preview the narrative beat. A locked mission's briefing might include a single line of boot log preview: "SUBSYSTEM: [ENCRYPTED] — decryption required on-site." This creates narrative pull without spoiling.

**× The 10-Mission Arc:** The map must communicate *pacing*. Missions 1-4 (tutorials) should feel small and intimate — close-together nodes in the northern Philippines. Missions 5-7 (factory introduction, command agents) spread south through the Visayas. Missions 8-10 (full system, factory-vs-factory climax) reach Mindanao and Taal — the geographic spread mirrors the mechanical escalation. On the map, this means the data cable network starts dense and local, then stretches across hundreds of nautical miles.

## Comparable Games

- **Into the Breach:** Island selection map. Four corporate islands on a simplified map, each with 8 regions. Clean, minimal, functional. The player picks the island order. Robot Uprising's 10-province linear map is more narrative than Into the Breach's player-chosen order, but the visual clarity is the same benchmark.
- **FTL:** Sector map with branching paths, fog-of-war ahead, clear nodes behind. The "what's coming next?" tension. Robot Uprising's linear map reduces choice but increases narrative pull — you can see the locked provinces ahead, building anticipation.
- **Slay the Spire:** Map as branching node graph. Each node is a known encounter type. The map IS the decision — which path do you take? Robot Uprising's linear map removes this choice but gains narrative specificity (each province is a real place with real geography).
- **Celeste:** Mountain map showing chapters as labeled sections of a single mountain. Each chapter has its own visual theme visible on the map. The map communicates "you're climbing something." Robot Uprising's archipelago communicates "you're connecting something" — building a network across real geography.
- **Hollow Knight:** A hand-drawn map that fills in as you explore. The incomplete map creates desire to complete it. Robot Uprising's locked/completed node system creates similar collect-them-all satisfaction.

## The TikTok Clip

A 10-second timelapse of the campaign map evolving from Mission 1 to Mission 10: the first node lights up cyan, data cables extend, more nodes illuminate, the network grows more complex, shortcuts appear, until the entire archipelago is a glowing web of data — a nervous system across the Philippines. The final node (Taal) flashes red, then cyan. The whole archipelago pulses once in unison. Caption: "My robots conquered the Philippines."
