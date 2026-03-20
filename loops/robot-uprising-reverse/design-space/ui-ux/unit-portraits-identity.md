# 4.08 — Unit Portraits and Identity: How Units Look, How You Distinguish Them, Personality

## The Locked Context

Five unit types: Scout (👁, buffer 6, fast, wide perception), Striker (⚔, buffer 8, medium, narrow perception), Relay (📡, buffer 12, stationary), Specialist (🤖, buffer 10, medium perception), Command (🤖, buffer 14, stationary). Visual assets are generated via the Anchor-First Pipeline: master sprite sheet per unit (3 states x 2 directions), sliced into individual PNGs with horizontal flips for 4 directions. States: idle, destroyed, hologram. Plus icon (32x32) and portrait per unit. Art direction: isometric pixel art, SE Asian cyberpunk aesthetic. Blueprints are the player's creation — each blueprint is a named configuration of a unit type. Multiple blueprints can share the same unit type.

The design space question: **How do units develop identity — visual, behavioral, and emotional — such that a player cares about RELAY-C specifically, not just "some relay"?** The game asks players to build information architectures from interchangeable parts. But the best moments in strategy games come from attachment to specific units. How does Robot Uprising create attachment to units that are mass-produced from blueprints?

---

## The Identity Hierarchy

Unit identity operates at four levels, each with distinct visual treatment:

### Level 1: Type Identity (What Am I?)

Each of the five unit types has a fundamentally different silhouette. At isometric battlefield scale (32x32px sprites), silhouette is the primary recognition signal. Players must distinguish types instantly at a glance — even at the periphery of their vision, even at 2x speed.

**Scout**: Low, sleek, horizontal profile. Insectoid — modeled after a Philippine water strider (Gerridae), with long antennae sweeping forward and a flat, wide body close to the ground. The wide perception radius is embodied in the antennae — they're the widest element of the sprite, extending 4px beyond the body on each side. Color accent: teal (#4ECDC4) — the information-gatherer, cool and alert.

**Striker**: Tall, angular, aggressive silhouette. Modeled after a Philippine eagle (Pithecophaga jefferyi) in attack posture — hunched forward, sharp edges, compact but with a distinctive vertical crest that makes it the tallest unit sprite by 3px. The narrow perception radius is embodied in the forward-focused posture — everything points forward. Color accent: orange-red (#E85D3A) — the aggressor, hot and immediate.

**Relay**: Wide, symmetrical, architectural. Modeled after a traditional Filipino bahay kubo (nipa hut) crossed with a satellite dish — a stable, grounded structure with a distinctive parabolic antenna element rising from the center. Stationary, so no directional variants — the sprite is the same from all angles, reinforcing that relays don't move. Color accent: purple (#8B5CF6) — the network node, calm and connective.

**Specialist**: Medium, asymmetric, mysterious. Modeled after a Philippine tarsier (Tarsius syrichta) — huge eyes, hunched posture, one arm extended with a tool/probe. The asymmetry is deliberate: the specialist is always doing something unusual, and the unbalanced silhouette communicates this. Color accent: green (#22C55E) — the hacker, technical and precise.

**Command**: Large, stable, imposing. The biggest sprite (36x36px, 4px larger than others). Modeled after a Filipino sari-sari store repurposed as a command center — a rectangular structure with multiple antenna arrays, screens visible through windows, and a distinctive awning. The size communicates authority. The extra sprite pixels make it the visual anchor of any formation. Color accent: gold (#F0A500) — the leader, warm and commanding.

### Level 2: Blueprint Identity (What Was I Designed To Be?)

Players create blueprints — named configurations of a unit type. "SCOUT-FLANKER" and "SCOUT-RECON" are both scouts, but with different skills, rules, and hooks. Blueprint identity is the player's creative expression.

**Visual differentiation per blueprint:**
Each blueprint gets a **color stripe** — a 2px horizontal line at the base of the sprite, in a player-chosen color (8 options: teal, coral, lavender, lime, amber, rose, sky, cream). The stripe is subtle at battlefield scale but visible on inspection. Two scouts with different stripes are distinguishable at a glance once the player knows to look.

**Blueprint icon modifier:** In the 32x32 icon (used in the production queue, Blueprint Codex, and workbench), the base unit icon is overlaid with a small glyph in the bottom-right corner — a 6x6px symbol chosen by the player from a set of 16 geometric shapes (circle, triangle, square, diamond, cross, star, arrow-up, arrow-down, slash, dot, ring, half-circle, zigzag, wave, bolt, drop). This glyph appears nowhere else in the game — it's purely a player-chosen marker. "My SCOUT-FLANKER has a lightning bolt. My SCOUT-RECON has a circle."

**Name plate:** During the Inspector (not the sealed watch — too much clutter), a tiny name plate appears below the unit sprite when hovered: "SCOUT-FLANKER" in 8px monospace, white on dark. The name is truncated to 14 characters. This is the only text-based identification at the unit level.

### Level 3: Instance Identity (Which One Am I?)

When the factory produces two SCOUT-FLANKER units from the same blueprint, they need instance-level identity. Each spawned unit gets an auto-assigned letter suffix: SCOUT-FLANKER-A, SCOUT-FLANKER-B. The suffix letter appears as a tiny character (6px, monospace) in the top-right corner of the sprite — barely visible at battlefield scale but readable when the camera hovers. Instance letters cycle A through Z.

**The key design decision:** Instance identity is MINIMAL. The game does NOT want players to become attached to individual instances — instances are expendable products of a factory. Attachment should be to BLUEPRINTS (the player's designs) not INSTANCES (interchangeable copies). The instance letter exists only for debugging ("SCOUT-FLANKER-A was the one that overloaded at tick 30") not for emotional investment.

### Level 4: Personality Through Behavior (Who Am I Becoming?)

This is the emergent layer. Units don't have scripted personalities. But their behavior — determined by the player's configuration — creates personality. A scout configured with aggressive patrolling and frequent hook firing "feels" different from a cautious scout with narrow perception and rare transmissions. The game reinforces this through:

**Behavioral tags in the Inspector:** After a match, the Inspector assigns descriptive tags to each unit instance based on its behavior during the match: "AGGRESSIVE" (engaged enemies more than average), "SILENT" (sent fewer signals than average), "OVERWORKED" (context window filled >80% for more than half the match), "EFFICIENT" (never overloaded, high action-per-tick ratio), "WASTED" (idle more than 60% of ticks). Tags are displayed in the unit's Inspector panel as small capsule badges (monospace text, colored by sentiment: teal for positive, amber for neutral, coral for negative).

These tags are NOT persistent — they describe one match's behavior. But over repeated plays, the player starts to recognize patterns: "My RELAY-CENTRAL is always tagged 'OVERWORKED.' I need to redesign it." The tag becomes the relay's personality in the player's mind.

---

## Portrait Design

### The Portrait Panel

Portraits appear in three locations:
1. **Workbench blueprint editor** — large (128x128px), centered in the blueprint panel header
2. **Blueprint Codex** — medium (96x96px), on each card
3. **Inspector identity bar** — small (32x32px), thumbnail in the unit panel header

The portrait is a close-up of the unit, rendered in the same isometric pixel art style as the battlefield sprite but at higher detail. The scout portrait shows the water-strider body from a 3/4 front angle, antennae fully extended, eyes (multiple small sensor dots) glowing teal. The background is a subtle gradient — unit type accent color at 10% opacity fading to black.

**Hologram portrait variant:** When a blueprint is in the production queue but no instances are on the battlefield, the portrait renders in hologram style — translucent blue-white, scan lines visible, edges flickering. This communicates "planned but not yet real." When the first instance spawns, the portrait transitions from hologram to solid with a brief scan-line sweep (200ms, bottom to top).

**Destroyed portrait variant:** When all instances of a blueprint are eliminated, the portrait renders in the destroyed state — the unit's broken sprite, desaturated, with a red crack overlay. The portrait in the Codex dims. If a new instance is produced later, the portrait revives.

### Portrait Personality Through Wear

An advanced feature (unlocked after Mission 7): portraits accumulate **wear marks** over the campaign. Each match adds micro-details to the portrait:
- **Overload scars**: If a unit overloaded during a match, a faint lightning-crack overlay appears on the portrait. Accumulates across matches — a relay that overloads every match develops a network of cracks.
- **Kill marks**: Each elimination achieved by a striker blueprint adds a tiny tally mark to the portrait's bottom edge. Not prominent, but a player who inspects closely sees the history.
- **Signal badges**: Relays that successfully forwarded more than 100 signals in a campaign earn a small antenna-glow effect on their portrait — the satellite dish in the portrait glows faintly.

These wear marks create visual history. A veteran RELAY-CENTRAL that has survived 8 missions looks different from a fresh RELAY-BACKUP created in mission 7. The wear is purely cosmetic — no gameplay effect — but it creates attachment.

---

## Player Journeys

### Journey 1: Tala, 19, CS Student — First Blueprint Naming Session

**Context:** Mission 5, factory introduction. Tala is creating her first blueprints. She has access to scouts, strikers, and relays. The workbench presents empty blueprint slots.

**Minute 0:00 — The Empty Blueprint**
The workbench shows a blank blueprint card — a dark rectangle with a dashed outline, a gray unit type selector at the top (Scout / Striker / Relay tabs), and a text field labeled "Blueprint Name:" with a blinking cursor. Below: empty skill slots (dashed outlines), empty rule slots, empty hook slots, empty context config panel. The portrait area shows a hologram of the selected unit type, flickering, waiting to be configured.

Tala selects "Scout." The hologram scout appears — translucent blue-white, antennae sweeping, scan lines rolling across the image. She types "SCOUT-FLANKER" in the name field. The hologram doesn't change — it's still generic. She fills in skills: patrol, evade. Adds a hook: "when enemy detected → send on 'alert'." Configures context: listen to nothing, broadcast only.

**Minute 1:30 — The Color Stripe**
Below the name field, a row of 8 color swatches appears: teal, coral, lavender, lime, amber, rose, sky, cream. Tala clicks coral. The hologram scout's base gains a 2px coral stripe. In the production queue preview (horizontal conveyor belt at the bottom), the scout icon shows a coral dot in the corner. Tala creates a second scout blueprint: "SCOUT-RECON" with a sky stripe. The two scouts are now visually distinct in the queue — coral flanker, sky recon.

**Minute 2:00 — The Glyph**
Next to the color swatches, a grid of 16 geometric glyphs. Tala picks a lightning bolt for SCOUT-FLANKER (fast, aggressive) and a circle for SCOUT-RECON (wide perception, observational). The glyphs appear as tiny overlays on the production queue icons. The workbench portrait header now shows "SCOUT-FLANKER" with a coral stripe and a lightning bolt badge.

**Minute 3:00 — First Production Run**
Tala hits EXECUTE. The sealed watch begins. The factory produces SCOUT-FLANKER-A — the hologram portrait in the production queue panel sweeps from translucent to solid (200ms scan-line animation, bottom-to-top). On the board, the scout appears at the factory tile with a brief spawn flash (white ring expanding outward from spawn point, 150ms). The scout's sprite has the coral stripe at its base — a thin line of warm color against the cool teal of the grid.

Tala watches as SCOUT-FLANKER-A patrols aggressively (the skills she configured), darting from tile to tile with edge-flashes at each move. A second scout, SCOUT-RECON-A, spawns two ticks later — sky stripe, moving more deliberately (different patrol configuration). On the 8x8 grid, two scouts with two different movement styles and two different stripes. Tala can tell them apart by color and by behavior.

**UI Annotations:**
- **Blueprint name field**: 14-character limit, monospace font, blinking cursor, validates uniqueness
- **Color swatch row**: 8 circular swatches (24px diameter), click to select, active swatch has white border
- **Glyph grid**: 4x4 grid of 16 symbols (16x16px each), click to select, preview updates live in production queue icon
- **Hologram → solid transition**: scan-line sweep bottom-to-top, 200ms, marks the moment a design becomes real

---

### Journey 2: Javier, 37, Game Designer — Reading the Battlefield at Speed

**Context:** Mission 8, full army on board. Javier has 3 blueprint types fielded: SCOUT-VIPER (coral, bolt glyph), RELAY-HUB (lavender, circle glyph), STRIKER-LANCE (amber, arrow glyph). The factory has produced multiple instances of each. 12 units on the board.

**Minute 0:00 — The Visual Parse**
Tick 15. The board is dense. 12 units across 64 tiles. Javier's eye performs the parse:
- **Silhouette scan**: The low, wide shapes are scouts (3). The tall, angular shapes are strikers (4). The wide, stable shapes are relays (2). The big shape is his command agent (1). Two medium asymmetric shapes are specialists (2). Silhouette alone sorts 12 units into 5 types in under a second.
- **Color stripe scan**: Within the 3 scouts, Javier looks for stripes. Two have coral (SCOUT-VIPER-A and B). One has sky (SCOUT-RECON-A). The coral scouts are on the left flank; the sky scout is center. His flanking strategy is executing as planned.
- **State scan**: All scouts are sharp and active (edge-flashes). Both relays are at full opacity, idle — no breathing, no thought bubbles. Good. STRIKER-LANCE-C at G6 is breathing — slow pulse, "..." thought bubble. Blocked. Waiting for intel that isn't coming. Javier files this for the debrief.

This three-layer parse — silhouette → stripe → state — takes under two seconds. It's the visual equivalent of scanning a monitoring dashboard: system type → instance → health status.

**Minute 0:30 — The Elimination Moment**
Tick 22. SCOUT-VIPER-B at C5 is eliminated by an enemy striker. The destruction animation plays: the sleek insectoid sprite fractures — legs splay, antennae snap, the body crumples into a pixelated heap. The coral stripe at the base is still visible in the wreckage — a sliver of warm color in the debris. A brief red flash on the tile.

In the production queue panel (visible even during sealed watch as a non-interactive reference), the SCOUT-VIPER portrait dims. A red "x1" badge appears on the portrait — one instance lost. The portrait itself shifts to the destroyed variant: the water-strider broken, desaturated, lightning-crack overlay from previous overload scars visible through the damage.

Javier feels a pang. Not "a scout died" — "SCOUT-VIPER-B died." The one with the coral stripe that was running the left flank. He'll build another, but this one's scouting data — 22 ticks of terrain knowledge — is gone with it.

**Minute 1:00 — Instance Replacement**
Tick 28. The factory produces SCOUT-VIPER-C (the next letter suffix). It spawns at the factory tile with the spawn flash. Fresh sprite — clean coral stripe, no wear marks, no overload scars. It looks NEW compared to SCOUT-VIPER-A, which after 28 ticks of battle has a faintly stressed context bar (amber tint, 70% full). The fresh instance and the veteran instance of the same blueprint look subtly different through accumulated state.

**UI Annotations:**
- **Silhouette distinctiveness**: 5 fundamentally different shapes readable at 32x32px, distinguishable in peripheral vision
- **Stripe at destruction**: coral stripe persists in wreckage sprite, maintaining identity even in death
- **Production queue portrait**: dims on elimination, red badge for instance count loss, destroyed variant portrait
- **Fresh vs. veteran**: new instances have clean sprites; existing instances have accumulated context bar state

---

### Journey 3: Mei, 33, Teacher — Emotional Attachment Through the Codex

**Context:** End of the campaign (mission 10). Mei has been playing for 3 weeks. She opens the Blueprint Codex to review her collection before the final mission.

**Minute 0:00 — The Collection Screen**
The Blueprint Codex opens as a full-screen overlay. Cards arranged in a grid — each card is a blueprint she's created or unlocked across 10 missions. The cards are sorted by type: Scout section, Striker section, Relay section, Specialist section, Command section. Each section has a header with the type icon and accent color.

Mei scrolls to the Relay section. Three cards: RELAY-CENTRAL, RELAY-BACKUP, RELAY-MOBILE. Each card shows:
- The 96x96px portrait (high detail)
- The blueprint name in bold monospace
- The color stripe and glyph
- Behavioral tags from the most recent match
- A small sparkline showing context window fill across the last 5 matches

**Minute 0:30 — Reading the Wear**
RELAY-CENTRAL's portrait tells a story. The bahay-kubo-satellite-dish hybrid has visible wear: three lightning-crack overlays from overloads in missions 5, 6, and 8. The antenna element glows faintly — the signal badge earned after 100+ forwarded signals. The portrait looks battle-hardened. Beneath: tags from the last match — "OVERWORKED," "ESSENTIAL" (forwarded data that led to 3+ eliminations).

RELAY-BACKUP's portrait is clean. Created in mission 7, used in only 3 missions. No overload scars. No signal badge. Tags: "UNDERUTILIZED," "EFFICIENT." The backup was well-designed but rarely stressed.

RELAY-MOBILE's portrait is a mess. This was Mei's experiment — a relay with movement (she modded the relay blueprint in mission 9 with a patrol skill, sacrificing two hook slots). The portrait has five overload cracks (it moved into high-signal areas without enough buffer), a partially destroyed overlay (it was eliminated in mission 9), and tags: "AGGRESSIVE," "FRAGILE," "EXPERIMENTAL."

**Minute 1:30 — The Emotional Layer**
Mei hovers over RELAY-CENTRAL. A tooltip expands showing campaign statistics: "Created: Mission 5. Matches survived: 12/14. Total signals forwarded: 847. Total overloads: 3. Longest streak without overload: 6 matches." This relay has been the backbone of her army for 6 missions. It's not sentient. It's a configuration file. But the wear marks, the statistics, the tags — they create a narrative of a reliable workhorse that occasionally gets pushed too hard.

Mei decides: RELAY-CENTRAL goes into the final mission unchanged. She's not going to mess with what works. RELAY-MOBILE gets a complete redesign — remove the patrol skill, restore the hook slots, accept that relays should stay still. The Codex has told her what her blueprints' personalities are through accumulated data, not scripted dialogue.

**UI Annotations:**
- **Codex card layout**: 96x96 portrait, name, stripe+glyph, tags, sparkline — information-dense but scannable
- **Wear marks**: lightning cracks (overload history), antenna glow (signal volume), tally marks (eliminations) — visual history without text
- **Campaign statistics tooltip**: hover-expanded, showing creation date, survival rate, total signals, overload count, streak — the unit's resume
- **Tags as personality**: "OVERWORKED" and "ESSENTIAL" together paint a picture of a dedicated relay that gives everything

---

## Information Hierarchy

### Prominent (Instantly Readable at Battlefield Scale)
- Unit type silhouette (5 distinct shapes)
- Unit state (active flash / idle dim / blocked pulse)
- Context bar fill and color

### Secondary (Readable on Hover or Close Inspection)
- Color stripe (2px at sprite base)
- Instance letter suffix (6px in sprite corner)
- Blueprint glyph (6x6px on icon)

### Hidden (Requires Inspector or Codex)
- Blueprint name plate
- Behavioral tags
- Wear marks and campaign statistics
- Full portrait with accumulated history

---

## Animations and Transitions

| Trigger | Animation | Duration | Purpose |
|---------|-----------|----------|---------|
| Unit spawns | White ring expanding from spawn tile + portrait scan-line sweep | 150ms ring + 200ms sweep | Birth moment — design becomes real |
| Unit destroyed | Sprite fracture + portrait dims + red badge | 300ms fracture | Death carries weight |
| Blueprint created | Hologram portrait flickers to life in workbench | 200ms flicker | Anticipation of deployment |
| Wear mark added | Lightning crack fades in on portrait between missions | 500ms fade | History accumulates gently |
| Tag assigned | Capsule badge slides in from right in Inspector | 150ms per tag, staggered | Post-match personality reveal |
| Codex card hovered | Card lifts 4px with drop shadow, portrait brightens | 200ms ease-out | Invites inspection |

---

## Accessibility Considerations

- **Silhouette-only mode**: A toggle that adds a high-contrast solid color fill to each unit type (teal fill for scouts, red fill for strikers, purple fill for relays, green for specialists, gold for command). Overrides the detailed pixel art with flat color for maximum type readability. Available in accessibility settings.
- **Name plate always-on mode**: For players who can't read the tiny stripes and glyphs, a toggle that shows the blueprint name plate below every unit at all times, not just on hover in the Inspector.
- **Instance letter size**: Configurable in accessibility settings. Default 6px, options for 8px and 10px. Larger letters overlap the sprite slightly but are readable for low-vision players.
- **Screen reader**: Each unit announces as "[blueprint name] [instance letter] at [grid position], [state], context [percentage]%." Example: "SCOUT-VIPER-A at C4, active, context 45%."
- **Color stripe alternatives**: For colorblind players, stripes can be replaced with pattern fills (solid, diagonal, dots, horizontal, vertical, zigzag, crosshatch, wavy) — 8 patterns matching 8 colors.

---

## Comparable Games

**Into the Breach's Mech Customization**: Into the Breach gives you 3 mechs with fixed silhouettes. You name pilots, and the pilot portrait creates attachment. Robot Uprising has 5 unit types (comparable silhouette variety) but mass-produces instances, creating a fundamentally different attachment model. The pilot portrait is replaced by the blueprint portrait with wear marks — attachment to the DESIGN, not the individual.

**XCOM's Soldier Personalization**: XCOM creates attachment through persistent soldiers with names, nationalities, appearances, and promotion trees. Losing a Colonel hurts because of 20 missions of shared history. Robot Uprising can't replicate this for factory-produced units — but the Blueprint Codex with campaign statistics and wear marks creates a parallel: losing a BLUEPRINT's track record (by redesigning it) has a similar emotional weight to losing an XCOM soldier.

**Slay the Spire's Card Art**: Each card in Slay the Spire has distinctive art that becomes associated with its function. "The Defect's Claw card has that robot fist image." Robot Uprising's portraits serve the same role: the water-strider scout portrait becomes associated with "fast reconnaissance" in the player's mind through repeated visual reinforcement.

**Factorio's Ghost Buildings**: Factorio shows planned but unbuilt structures as translucent ghosts. Robot Uprising's hologram portrait variant serves the same purpose — "this blueprint exists in the production queue but hasn't spawned yet." The scan-line transition from hologram to solid is the moment potential becomes actual.

---

## Sensory Description

The Blueprint Codex is a quiet place. The kulintang fades to a distant hum. The screen is dark — deep navy (#0A0F1A) — with cards floating in a grid like photographs on a darkroom wall. Each card has a subtle inner glow, the accent color of its unit type bleeding outward at 5% opacity.

RELAY-CENTRAL's card catches the eye. The portrait is rich with detail: the bahay-kubo structure rendered in warm wood tones and corrugated metal, the satellite dish rising from its roof, the circuit-board patterns etched into its walls. Three fine cracks run across the portrait like veins of lightning — the overload scars from missions past. The antenna glows faintly purple, a signal badge earned through hundreds of forwarded messages. Below the portrait, two capsule badges: "OVERWORKED" in amber, "ESSENTIAL" in teal. The contrast tells the story — this relay gives too much and the architecture depends on it.

Next to it, RELAY-BACKUP is pristine. Clean portrait. No cracks. No glow. The badge reads "UNDERUTILIZED" in cool gray. The card looks factory-fresh, almost unused. The two portraits side by side are like a senior engineer's laptop next to an intern's — one battered by years of heavy use, the other clean and waiting for its first real project.

At the bottom of the screen, the production queue sits as a horizontal conveyor belt. Blueprint icons slide gently left to right — small square thumbnails with stripes and glyphs. The scout icons are tiny but distinctive: the insectoid silhouette unmistakable even at 32x32. The coral stripe on SCOUT-VIPER glows warm against the cool interface. The sky stripe on SCOUT-RECON is barely there — a whisper of blue at the sprite's feet.

The factory icon at the left of the conveyor pulses with a faint amber light — it's producing. Every 6 ticks, a new icon materializes at the factory end and begins sliding right. The hologram shimmer on the incoming icon — translucent, scan-lined, flickering — resolves to solid as the unit spawns on the battlefield. In that 200ms transition, a player-designed configuration becomes a battlefield entity. A blueprint becomes a unit. A name becomes a life.
