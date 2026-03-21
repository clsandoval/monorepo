# 3.10c — Channel Color Assignment and Palette Management

## Overview

Every channel in Robot Uprising needs a visual identity. When the player types `recon-net` into a hook's channel field, that channel must immediately become *something the eye can track* — a color, a line style, a tiny icon — so that the wiring on the board, the entries in the channel map panel, and the dashed signal chains during the sealed watch all feel like they belong to one coherent system. The question is not whether channels need colors. The question is **who decides the color, how many colors exist, what happens when colors run out, and how the palette degrades gracefully for the 8% of male players who cannot distinguish red from green.**

This is a surprisingly loaded design space. Auto-assignment is invisible and fast but strips player expression. Player-chosen colors are expressive but introduce bad choices (two channels both white, invisible on the light Plan screen background). Color-blind palettes solve one problem while introducing another (fewer perceptually distinct colors means exhaustion arrives sooner). And palette exhaustion at 8+ channels — the point where a typical isometric display cannot reliably distinguish hues at small scale — forces a shift from color-only identity to compound identity: color + dash pattern + shape marker.

The locked spec establishes:
- **Channels are named pipes** — type a name in a hook config, channel created
- **One channel per hook slot** — fixed wiring, not dynamic routing
- **Channel map panel** is read-only, auto-generated
- **Signal chains visible** during sealed watch as **colored dashed lines**
- **8-color palette** referenced in hook-visualization.md (cyan, magenta, gold, lime, coral, violet, teal, rose)
- **Shape-first design** recommended in accessibility-comprehensive.md (6.08) — color as redundant layer, unique dash patterns per channel

This document explores every possible approach to channel color identity — from fully automatic to fully manual — and maps the design tensions between speed, expression, accessibility, and palette exhaustion.

---

## The Color Assignment Spectrum

### Approach A: "The Registrar" — Strict Auto-Assignment, No Player Choice

**Philosophy:** The game assigns colors from a fixed palette in creation order. First channel = cyan. Second = magenta. Third = gold. The player never touches color. The channel map panel shows the assignment. Done.

**The palette (8-slot default):**

| Slot | Color | Hex | Shape Marker | Dash Pattern |
|------|-------|-----|-------------|--------------|
| 1 | Cyan | #00CCDD | Circle | Solid |
| 2 | Magenta | #CC44AA | Diamond | Dashed |
| 3 | Gold | #DDAA22 | Triangle-up | Dotted |
| 4 | Lime | #66CC44 | Square | Dash-dot |
| 5 | Coral | #DD6644 | Pentagon | Double-dash |
| 6 | Violet | #8855CC | Hexagon | Long-dash |
| 7 | Teal | #44AA99 | Star | Dash-dot-dot |
| 8 | Rose | #CC6688 | Cross | Short-dash |

**How it works:** When the player types a channel name and confirms, the system checks the channel registry. If the name already exists, the channel's existing color is applied. If it is new, the next unused slot in the palette is assigned. The channel map panel — a read-only sidebar on the Plan screen — lists all channels with their colored dots, dash patterns, and shape markers. The player never opens a color picker. The assignment is permanent for the duration of that blueprint set.

**Sensory description:** The player types `recon-net` and presses Enter. A small colored dot — cyan, the first palette slot — materializes next to the channel name in the hook config field. The dot is 8px, hard-edged, with a 1px darker border. On the board preview, a faint cyan dashed line appears connecting the hook's unit to any other unit already listening on `recon-net`. The line pulses once — a single bright sweep from sender to receiver, like a fiber optic cable testing its connection — then settles to 30% opacity. In the channel map panel at the bottom of the Plan screen, a new row appears: a cyan dot, the text "recon-net," and a count badge showing "2 units." The dot's shape is a circle — the first palette marker.

**Strengths:**
- Zero friction. The player thinks about channel architecture, not aesthetics.
- Deterministic. Two players building identical architectures get identical visual outputs. Streamers and tutorial videos have consistent color language.
- Exhaustion is predictable. The game always knows how many palette slots remain and can warn before exhaustion.
- Shape-first design slots in naturally — each palette position has a pre-assigned shape and dash pattern, no decisions needed.

**Weaknesses:**
- No player expression. Competitive players may want their squad to have a signature look. The "recon-net is always blue" identity is lost between matches if creation order changes.
- Channel deletion and recreation can cause palette drift — deleting the first channel and creating a new one may recycle slot 1, making "attack-net" cyan even though the player mentally associates cyan with reconnaissance.
- Color assignments are arbitrary. The player's mental model may want `alarm-net` to be red, but if alarm is the third channel created, it gets gold.

### Approach B: "The Painter" — Full Player Choice from a Curated Palette

**Philosophy:** When a channel is created, a color picker appears. The player selects from the same 8-slot palette (plus a "More Colors" expansion to 16). If two channels share a color, the game allows it but shows a soft amber warning: "2 channels share magenta — consider different colors for clarity."

**How it works:** The hook config's channel name field includes a color swatch. Tapping the swatch opens a compact palette grid (2×4 for the default 8, expandable to 4×4 for 16). The player taps a color. If the color is already in use by another channel, a subtle amber outline appears on the duplicate channel's entry in the channel map panel — not a blocker, just a nudge. The player can also tap a "Random" button to get the next auto-assignment.

**Sensory description:** The player types `alarm-net` and the cursor moves to the color swatch — a small grey circle with a subtle shimmer, inviting interaction. They tap it. Eight color circles bloom outward from the swatch in a 200ms fan animation, each circle 24px, each casting a faint colored shadow on the panel beneath it. They hover over coral — warm, alert-feeling. The other seven circles dim to 40% opacity. They tap. The swatch fills with coral, a tiny coral diamond appears next to the channel name, and on the board, the wiring lines for `alarm-net` flush coral with a brief ripple propagation from the edited unit outward.

**Strengths:**
- Expressive. The player's channel architecture becomes visually personalized. "My recon is always cyan, my command is always gold" creates identity.
- Semantic color choices. Red-ish for danger channels, green-ish for status channels, gold for command — the player's color map reflects their mental model.
- Streamers love it. "I'm going to make my kill channel hot pink" is content.

**Weaknesses:**
- Friction. Every new channel requires a color choice. For rapid prototyping, this interrupts flow.
- Bad choices. A player who makes two channels the same color, or picks a color that's invisible against the board's dark background, has self-inflicted a readability problem.
- Tutorial burden. The onboarding must now teach color choice in addition to channel naming.
- Color-blind players must still rely on non-color markers — the choice is aesthetic, not functional, for ~8% of players.

### Approach C: "The Hybrid" — Auto-Assign with Override (RECOMMENDED)

**Philosophy:** Channels get auto-assigned colors from the palette on creation. The player can override any channel's color at any time from the channel map panel. Default is fast; customization is available but never required.

**How it works:** Channel creation auto-assigns the next palette slot (Approach A behavior). The channel map panel shows each channel's color dot as a tappable swatch. Tapping opens the same curated palette from Approach B. Overrides persist for the current blueprint set. A "Reset to default" option restores auto-assignment order. The channel map panel gains a small palette icon in its header indicating "colors editable."

**Why this is recommended:** It eliminates the weaknesses of both extremes. Beginners (Missions 1-5) never notice the override — channels just have colors. Intermediate players discover the override when they want `alarm-net` to be red. Expert players use deliberate color coding as part of their architectural language. The tutorial never mentions color choice; it surfaces through the channel map panel's affordance.

**Interaction with progressive disclosure:** The color override swatch could be hidden until Mission 5 or first creation of 4+ channels. Before that, the swatch appears as a static (non-interactive) dot. This prevents the Mission 1 player from drowning in options while the Mission 7 player already knows exactly what they want.

---

## Color-Blind Palette Design

The default 8-color palette must survive three forms of color vision deficiency:

### Deuteranopia (red-green, ~6% of males)

The most common form. Red and green collapse to similar yellow-brown tones. The default palette's **lime** and **coral** become nearly indistinguishable. **Cyan** and **teal** also compress.

**Deuteranopia-safe substitutions:**
- Lime (#66CC44) → Bright Yellow (#DDDD22)
- Coral (#DD6644) → Deep Orange (#CC6622)
- Teal (#44AA99) → Sky Blue (#4499DD)

With substitutions, the eight colors become: Cyan, Magenta, Gold, Bright Yellow, Deep Orange, Violet, Sky Blue, Rose. All eight are perceptually distinct under simulated deuteranopia (verified with Coblis simulator).

### Protanopia (red-weak, ~1% of males)

Similar to deuteranopia but with stronger blue-shift. Coral collapses further toward brown. Rose becomes indistinguishable from grey.

**Protanopia-safe substitutions:**
- Coral → Warm Amber (#CC8822)
- Rose → Pale Lavender (#AA88CC)

### Tritanopia (blue-yellow, ~0.01%)

Blue and yellow collapse. Cyan and gold become similar. Violet and magenta compress.

**Tritanopia-safe substitutions:**
- Cyan → Bright Green (#44CC44)
- Gold → Deep Red (#CC4422)
- Violet → Dark Teal (#228877)

### The Shape-First Guarantee

Per the accessibility-comprehensive.md (6.08) recommendation, **every channel color is paired with a unique dash pattern and shape marker regardless of colorblind mode.** This means the palette swap is cosmetic — the actual identity system is the compound triple of (color, dash pattern, shape). A fully monochromatic player can distinguish all 8 channels by dash pattern alone. The shapes appear as small 6px markers at the midpoint of each channel's wiring line on the board, in the channel map panel's row prefix, and as overlay icons on signal dots during the sealed watch.

---

## Palette Exhaustion: The 8+ Channel Problem

Most matches will use 3-5 channels. Competitive players pushing architectural complexity will create 6-8. Degenerate experimental configurations — the "one channel per message type" player — might hit 10-12. When the 8-slot palette runs out, the system must generate distinguishable visual identities for channels 9, 10, 11, and beyond.

### Strategy 1: "The Second Octave" — Color Recycling with Dash-Pattern Variation

Channel 9 reuses Cyan but with a dotted pattern instead of solid. Channel 10 reuses Magenta with a dash-dot pattern. The color repeats, but the dash pattern differentiates. This gives 8 colors × 8 dash patterns = 64 theoretical slots. In practice, only 3 dash pattern variants per color are visually distinct at the wiring line scale — yielding 24 practical slots.

**Sensory description:** The player creates their 9th channel. In the channel map panel, the new row's dot is cyan — same as channel 1. But the dot has a tiny dashed ring around it, and the wiring line on the board is dotted rather than solid. During the sealed watch, the signal dot traveling the dotted cyan line wobbles slightly — a visual cue that this is not the solid cyan `recon-net` but the dotted cyan `backup-recon`. Side by side, the solid and dotted lines are clearly different; at a glance during a fast battle, a careful player can tell them apart.

### Strategy 2: "The Monogram" — Icon Overlays on Signal Lines

Each channel beyond 8 gets a small repeating icon embedded in the wiring line — a tiny letter, a number, or a symbol (⚡, ★, ●, ▲). The icon repeats every 32px along the line. This is visually dense but unambiguous.

### Strategy 3: "The Fade Warning" — Soft Limit with Architectural Feedback

At 7 channels, the channel map panel header shows a subtle amber badge: "7/8 colors." At 9 channels, it shifts to "9 channels — some share colors." This doesn't block creation but surfaces the complexity cost. Players who hit 9+ channels consistently are building architectures that benefit from simplification — the palette exhaustion is a gentle architectural code smell indicator.

**Recommended combination:** Strategy 1 (dash-pattern variation) as the mechanical solution + Strategy 3 (fade warning) as the pedagogical signal. Strategy 2 (icon overlays) reserved for Inspector mode where legibility is paramount and visual density is expected.

---

## Player Journeys

#### Journey: Tomás, 16, First-Timer from Manila

Tomás is building his first multi-unit configuration in Mission 4. He has a Scout and a Relay. He types `eyes` into the Scout's hook config. A cyan dot appears next to the name. He doesn't think about it. He types `eyes` into the Relay's listen config. The same cyan dot appears. On the board, a faint cyan dashed line connects the Scout tile to the Relay tile. He thinks: "Oh — they're connected." He adds a Striker. Types a new channel: `go`. A magenta dot. A magenta dashed line from the Relay to the Striker. Two colors, two connections, immediately readable. He never opened a color picker. He never read a tutorial about colors. The system taught him channel identity through two dots and two lines in under ten seconds.

He hits EXECUTE. The sealed watch plays. Tick 3: the Scout spots an enemy. A bright cyan dot — same color as the `eyes` channel — races along the dashed cyan line from Scout to Relay. Tick 4: the Relay compresses and sends. A bright magenta dot races from Relay to Striker along the magenta line. Tick 5: the Striker moves. Tomás grins. He understood the signal chain because the colors told the story: cyan in, magenta out. Two chapters of a tiny data narrative, color-coded.

After the match, he opens the channel map panel for the first time. Two rows: cyan dot + "eyes (2 units)" and magenta dot + "go (2 units)." He taps the cyan dot — nothing happens. (The override swatch is hidden until Mission 5.) He doesn't need it. The auto-assigned colors are already his mental model. Cyan is eyes. Magenta is go. Done.

#### Journey: Priya, 29, Deuteranopic Software Engineer from Bangalore

Priya has red-green color blindness. She's known this since childhood. Before her first match, she opens Settings → Accessibility → Color Vision. Three presets: Standard, Deuteranopia, Tritanopia. She selects Deuteranopia. The preview thumbnail shifts — the lime channel color brightens to yellow, the coral shifts to deep orange. She nods.

She's in Mission 6, building a four-channel architecture: `recon`, `relay-bus`, `alarm`, `command`. In the default palette, these would be cyan, magenta, gold, lime. With her deuteranopia preset, lime has become bright yellow. She can clearly distinguish all four colors. But more importantly, she has *never relied on color alone.* The channel map panel shows four rows, each with a colored dot AND a shape: circle (recon), diamond (relay-bus), triangle (alarm), square (command). On the board, the four wiring lines have four distinct dash patterns: solid, dashed, dotted, dash-dot. During the sealed watch, each signal dot has its channel's shape marker trailing behind it — a tiny circle follows the recon signal, a tiny triangle follows the alarm signal.

She barely notices the color swap. The shapes are her primary reading system. When she watches a replay with a friend who uses the default palette, the friend says "the green line went to —" and Priya says "the square-dashed line?" They're reading the same information through different channels. The architecture is legible to both.

In Mission 8, Priya creates her 9th channel — `overflow-drain`. The channel map panel shows an amber badge: "9 channels — some share colors." Her 9th channel gets cyan (recycled from slot 1) but with a dotted dash pattern instead of solid. The shape marker changes to a star. She glances at the board: the original `recon` channel is solid cyan with circles, the new `overflow-drain` is dotted cyan with stars. Distinguishable. She considers whether 9 channels is architecturally wise, recognizes the amber badge as a code smell, and refactors two channels into one. Back to 8. The badge disappears.

#### Journey: Kwame, 28, Competitive Streamer from Accra

Kwame is deep in Gauntlet preparation, streaming to 400 viewers. He has a 7-channel architecture for his signature "Hydra Mesh" strategy. His channels have deliberately chosen colors — he discovered the override in Mission 5 and never looked back. `recon-alpha` is cyan (cool, informational). `recon-bravo` is teal (same family, secondary). `alarm` is coral (warm, urgent). `command-primary` is gold (authority). `command-fallback` is violet (secondary authority). `relay-bus` is magenta (the backbone, flashy). `kill-order` is rose (the final signal, the bloom before the strike).

His viewers know the colors. "Gold line fired!" someone types in chat when the command signal travels. The color language has become community vocabulary. When Kwame reviews another player's configuration on stream, he says "their alarm is the third channel so it's auto-assigned gold — which is confusing because gold should be command." His audience agrees. Color semantics have crystallized through repetition.

Tonight he's experimenting with an 8th channel: `sensor-echo`, a secondary reconnaissance path for redundancy. He creates it — rose is already taken, so auto-assignment gives him the last slot. He overrides it to lime. Eight channels, eight colors, zero recycling. The board is dense with colored lines but each is visually distinct.

He considers a 9th: `emergency-flush`, a dead-man's-switch channel that fires if the command unit is destroyed. He types the name. The channel map panel header flashes amber: "8/8 colors." The 9th channel recycles cyan with a dotted pattern. He scrubs his chin. "Chat, nine channels. That's spaghetti. The palette is telling me to simplify." He pauses. "Actually — `sensor-echo` and `recon-bravo` overlap. Let me merge those." He deletes `sensor-echo`, routes its hooks to `recon-bravo`, and drops back to 7 channels. Clean. The amber badge disappears. "See that?" he tells the stream. "The palette is an architecture linter."

---

## Strengths and Weaknesses

**Strengths:**
- **Auto-assign + override** eliminates the beginner/expert tension entirely. Beginners never see color choice; experts use it as a design tool.
- **Shape-first design** means the color system is cosmetic for accessibility purposes — the game works in grayscale through dash patterns and shape markers.
- **Palette exhaustion as architecture feedback** turns a technical limitation into a design insight: "too many colors = too many channels = simplify."
- **Community color vocabulary** emerges naturally when streamers and competitive players develop semantic color conventions.
- **Colorblind preset palettes** are cheap to implement (palette swap in a CSS variable or theme config) and cover 99%+ of color vision deficiency types.

**Weaknesses:**
- **8 perceptually distinct colors** is a known hard limit for isometric game displays. The palette cannot grow without accepting confusion. Strategies 1-3 mitigate but don't eliminate the exhaustion cliff.
- **Auto-assignment is arbitrary.** A player who creates channels in a different order gets different colors, making cross-player communication ("the cyan channel") ambiguous unless both players happen to create channels in the same sequence.
- **Override persistence** must be scoped carefully. Per-blueprint-set? Per-player profile? If per-blueprint, importing a friend's configuration may bring unexpected colors. If per-profile, the color semantics are the player's own but don't transfer with shared configs.
- **Dash patterns at small scale** are subtle. On a zoomed-out board, the difference between solid and dashed may be invisible. Shape markers help but add visual noise.
- **Mobile/small screens** compress the board to ~320px wide. At that scale, colored lines are 1-2px wide and dash patterns are illegible. Mobile may need a simplified mode where only color + shape markers are used, with dash patterns reserved for desktop/tablet zoom levels.

---

## Interaction Effects

### Signal Chain Visualization (3.10)
Channel colors ARE signal chain colors. The Pulse Wire paradigm from 3.10 describes traveling dots in channel color along dashed lines. This document specifies how those colors are assigned, what happens when too many exist, and how they degrade under color-blind palettes. The two documents are tightly coupled — any change to the palette here directly affects the visual language of every signal chain.

### Inspector Mode
The Inspector's timeline scrubber shows frozen signal dots on wires at any given tick. Channel colors in the Inspector should be rendered at **full saturation** (vs. 30% opacity on the Plan screen) because the Inspector is an analytical tool where precision matters. The Inspector's signal chain detail panel should show the channel's color swatch, dash pattern, and shape marker in a compound legend row. In monochrome accessibility mode, the Inspector replaces color with high-contrast patterns: white-on-black for active signals, grey-on-black for idle wires.

### Channel Map Panel
The channel map panel — the read-only auto-generated summary in the Plan screen — is the canonical home of channel color identity. Each row: color swatch (tappable for override in Approach C), channel name, subscriber count, shape marker icon, and a miniature dash-pattern preview. When a channel row is hovered, all wiring lines for that channel pulse bright on the board and all other channels fade. This hover-highlight behavior is the primary tool for parsing dense multi-channel architectures.

### Accessibility Settings
The Settings → Accessibility → Color Vision panel should include:
- Preset palette selector (Standard / Deuteranopia / Protanopia / Tritanopia / High Contrast / Monochrome)
- Preview strip showing all 8 palette slots in the selected preset
- "Test on board" button that renders a sample 4-channel architecture on the board with the selected palette
- Shape marker toggle: "Always show shapes" (default ON) / "Colors only" (for players who find shapes distracting)
- Dash pattern toggle: "Always show patterns" (default ON on desktop, OFF on mobile due to scale)

### Streaming Readability
Streamers operating at 720p or 1080p with video compression face color banding and detail loss on thin lines. The existing "Streamer Overlay" mode from gif-clip-export-viral-mechanic.md (rendering lines 2px thicker, 150% buffer bars, white unit outlines) should also increase channel color saturation by 15% and replace pure dark backgrounds with charcoal (#1a1a1a) to reduce compression artifacts. Shape markers in Streamer Overlay mode increase from 6px to 10px for camera readability.

---

## Comparable Games

### Factorio — Circuit Network Wire Colors
Factorio has exactly two circuit network colors: red wire and green wire. This is both its greatest strength (no palette confusion, no colorblind issue beyond red-green which is handled by texture) and its greatest limitation (complex circuits must multiplex signals on two wires, creating architectural constraints that feel arbitrary). Robot Uprising's 8-color palette is dramatically richer but inherits the exhaustion problem Factorio avoids through scarcity.

### KiCad / Electronic CAD — Net Colors
PCB design tools auto-assign colors to electrical nets from palettes of 16-32 colors. Professional EDA tools learned decades ago that 8 is the practical limit for "distinguishable at a glance" — beyond 8, users rely on hover-to-highlight and net name labels rather than color differentiation. Robot Uprising's channel map panel hover-highlight behavior mirrors this professional workflow.

### Metro Map Color Systems
Transit maps worldwide use 8-12 line colors. London's Tube uses 11 (though several — Metropolitan/Jubilee/Northern — are close enough in color to cause tourist confusion). Tokyo's system uses route numbers alongside colors because 13+ lines exceed color distinctness. The lesson: color alone scales to ~8 lines. Beyond that, secondary identifiers (numbers, letters, patterns) are mandatory. Robot Uprising's shape markers serve the same function as Tokyo Metro's route numbers.

### VS Code — Bracket Pair Colorization
VS Code cycles through a palette of 6 bracket colors. Nested brackets reuse colors, creating potential ambiguity at depth 7+. The community accepted this because bracket matching rarely exceeds 4 levels in practice. Robot Uprising's 8-color palette with recycling at 9+ follows the same pragmatic philosophy: the common case (3-5 channels) is well-served; the edge case (9+) is handled through secondary markers rather than palette expansion.

### Oxygen Not Included — Overlay Color Systems
ONI uses dedicated overlay modes that each have their own color language (temperature = blue-to-red gradient, gas = per-element color, power = green wire). The key insight: ONI never shows all overlays simultaneously. Robot Uprising's channel wiring is always-visible during the sealed watch, meaning it must coexist with skill colors, combat flashes, and terrain tints. This raises the bar for palette distinctiveness — channel colors must be distinguishable not just from each other but from the game's other visual systems (cyan perception ripples, red combat flashes, amber sustained actions, green communication rings).

---

## Sensory Descriptions

### The Plan Screen Palette

The Plan screen's board is rendered in muted greys and dark teals — the isometric grid of tiles, the terrain textures, the unit silhouettes. Against this subdued backdrop, the channel wiring lines are the brightest elements on the board. A three-channel architecture produces three colored dashed lines arcing between unit tiles in shallow Bézier curves: cyan from Scout to Relay, magenta from Relay to Striker, gold from Command to all three. The lines are 1.5px wide, semi-transparent at 30% opacity when idle, with subtle dash patterns visible at normal zoom. Each line's midpoint carries a tiny shape marker — 6px circle, diamond, triangle — that sits on the line like a bead on a thread.

When the player hovers a channel in the channel map panel, its line surges to 100% opacity while the others fade to 10%. The hovered line glows softly — a 2px bloom around the 1.5px core — and the shape marker scales up to 10px with a gentle 200ms ease. The effect is like shining a blacklight on one specific wire in a bundle: everything else disappears, and the selected channel's architecture is perfectly legible.

### The Sealed Watch Signal Chains

Battle begins. The board brightens. The muted palette sharpens. The wiring lines persist at 20% opacity — ghost traces of the architecture, barely visible beneath the action. Then a Scout spots an enemy. A luminous cyan dot — 6px, hard-edged, with a soft 4px glow — spawns at the Scout's tile and races along the cyan dashed line toward the Relay. The dot leaves a comet trail: a 2-frame afterimage that fades from 100% to 0% over 0.2 seconds. It looks like a spark traveling along a wire.

The dot arrives at the Relay. A beat. Then a magenta dot spawns and races along the magenta line toward the Striker. Different color, different channel, different chapter of the signal chain story. A viewer watching at normal speed sees: cyan spark, pause, magenta spark. The color shift tells them the signal was processed — this is not a simple relay, it's a transformation. The two colors are the before and after of the Relay's compress skill.

In heavy combat, the board erupts with signal traffic. Cyan, magenta, and gold dots traveling in all directions. The lines they follow are barely visible — it's the dots themselves that carry the narrative. Three cyan dots in quick succession from a Scout that spotted three enemies. A single gold dot from the Command unit that consolidates them into one order. The color palette tells the story of information compression at a glance.

### Palette Exhaustion in the Wild

A competitive player's 8-channel board: eight colored dashed lines forming a web across the isometric grid. Each line has its own dash pattern and shape marker, but at this density, the visual impression is of a tapestry — threads of cyan, magenta, gold, lime, coral, violet, teal, and rose woven between unit tiles. The board is busy but readable because the colors are well-separated in hue space and the shape markers provide disambiguation at intersection points where lines cross.

Now the player adds a 9th channel. The amber badge glows in the channel map panel. On the board, a new dotted cyan line appears alongside the existing solid cyan line. At full zoom, they are clearly different — solid vs. dotted, circle markers vs. star markers. At half zoom, the dash pattern distinction blurs. At quarter zoom (the zoomed-out strategic view), they might as well be the same line. The architecture has exceeded the display's comfort zone. The palette is whispering: *simplify.*
