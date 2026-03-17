# 4.02 — Execute Phase: The Sealed Watch

The sealed watch is the emotional core of Robot Uprising. You've wired your agents. You've configured their context windows. You've set the production queue. Now you press EXECUTE and **lose all control**. For the next 30-90 seconds, you're a spectator watching your own creation either cohere into something beautiful or collapse into spectacular failure.

This is the moment that separates Robot Uprising from every other strategy game. In StarCraft, you can always click faster. In Into the Breach, you get perfect information before you commit. In Slay the Spire, every card play is your choice. Here? You designed the architecture. Now the architecture runs. The emotional payload is the gap between intention and outcome — the same feeling an engineer gets deploying to production, the same feeling a coach gets watching the game after the whistle.

The locked spec establishes: board center, tick clock top, context bars on units, no skip/no pause/no tools, 1s per tick at default speed, speed controls at 0.5x/1x/2x, cell flashes for signals and combat, signal chains as colored dashed lines. Within those constraints, there's a vast design space for HOW these elements are arranged, weighted, animated, and emotionally sequenced.

---

## The Fundamental Tension: Readability vs. Anxiety

The sealed watch must serve two contradictory masters:

1. **Readability.** The player needs to understand what's happening. Which unit sent a signal? Which rule fired? Why did that striker move east instead of west? If the watch is opaque, the player learns nothing and the inspector becomes the entire game.

2. **Anxiety.** The player should NOT have full comprehension. The watch should be slightly faster than comfortable parsing. You should catch *most* of what happens, miss some, and piece together the rest in retrospect. If the watch is perfectly readable, there's no reason for the inspector to exist, and the emotional arc (watch → debrief) collapses.

The sweet spot: you can always tell WHAT happened (unit moved, signal sent, combat occurred), but you can't always tell WHY in real-time. The "why" is what pulls you into the inspector.

Into the Breach solves this differently — it shows you everything BEFORE execution because the game IS the planning. Robot Uprising inverts this: you planned blind (no preview of enemy behavior), and now you watch the consequences. Closer to Frozen Synapse's simultaneous resolution: "I set my plans, the enemy set theirs, now we watch the collision."

---

## Approach A: "The Fishbowl" — Minimal HUD, Maximum Board

**Philosophy:** The battlefield IS the UI. Almost nothing is overlaid on the board. The player watches their robots like watching fish in an aquarium — you see movement, color, interaction, but the internal state is mostly hidden. The emotional experience is visceral, not analytical.

**Layout (1920×1080):**
- Board fills ~80% of screen (1536×864, centered)
- Tick clock: thin horizontal bar across top (full width, 32px tall). Each tick is a discrete pip. Current tick pulses white. Past ticks dim to gray. Future ticks are dark outlines.
- Speed controls: three small icons in top-right corner (0.5x / 1x / 2x), semi-transparent, no labels — just tortoise / normal / hare icons
- Context bars: tiny (3px tall) colored bar beneath each unit sprite on the board. Cool blue when healthy, amber at 75%, pulsing red when full. No slot detail — just a fill level.
- Signal chains: thin dashed colored lines connecting signaling units during the tick they fire. Lines appear, pulse once, fade over 500ms. Each channel gets a distinct color (generated from channel name hash).
- Kill flash: entire tile flashes red for 200ms, unit sprite shatters into 4-pixel debris particles that fade over 600ms.
- Signal flash: receiving tile pulses with a green ring that expands outward and fades, like a radar ping.
- Overload stun: unit sprite jitters rapidly (±2px random offset per frame), tiny lightning-bolt particles spray from the unit, context bar flashes white. On recovery next tick, a brief "decompression" animation — the jittering stops, a cyan ring contracts inward (the buffer being cleaned).
- No text. No numbers. No labels. No tooltips. Just the board, the clock, and the robots.

**Sensory description:**
The screen is dominated by the isometric grid. Rice terraces step down in green-brown tiers. A scout's cyan eye icon slides from tile to tile — not animated smoothly, but snapping per tick with a brief 100ms easing overshoot (snaps past the target tile by 2px, then settles back). When it hooks a signal to the relay channel, a thin cyan dashed line shoots from the scout to the relay across three tiles — the line appears instantly, holds for 400ms, then fades. The relay's context bar ticks up one notch (one of the tiny horizontal lines at its base lights up bright). Two ticks later, a striker on the other side of the board receives a compressed signal — amber dashed line from relay to striker, shorter hold (200ms, already compressed, information is dense). The striker pivots (sprite snaps to face a new direction) and advances toward a tagged enemy. The enemy tile glows faint red. Contact. The tile flashes crimson. The enemy sprite fractures into pixel shards. A tiny screen shake (2px for 100ms). Silence.

The tick clock at the top advances one pip. You exhale.

**Strengths:**
- **Maximally cinematic.** This is the version that produces the best TikTok clips. A full board of robots orchestrating a flanking maneuver through signal chains, with kills punctuated by screen shake and pixel debris — this is visually spectacular.
- **Emotional intensity.** With no analytical crutches, the player is forced to WATCH and FEEL. You can't analyze in real time. You experience success and failure bodily.
- **Into the Breach visual heritage.** Large board with clean pixel art and snap-movement. The visual language is immediately familiar to the target audience.
- **Clean streaming.** Viewers see everything the player sees. No information asymmetry between player and audience.

**Weaknesses:**
- **Context bars are nearly invisible.** At 3px tall on an isometric tile (~32px wide), context bars are just colored slivers. Players will miss overload building until the stun animation triggers. Prevention-oriented play (monitoring context pressure before it overloads) requires information that this approach doesn't surface.
- **Signal chains become spaghetti.** With 6+ active channels and 10+ units, the board becomes a mess of overlapping colored dashed lines. Even with per-channel coloring, visual parsing degrades rapidly.
- **No "why" whatsoever.** The player sees WHAT happened but has zero real-time insight into WHY. This maximally drives inspector usage — but it might make the sealed watch feel like watching a foreign film without subtitles. For first-time players, this could be alienating rather than exciting.
- **Speed controls are discoverable only by exploration.** Minimalist icons with no labels require the player to experiment.

---

## Approach B: "Mission Control" — Sidebar Telemetry

**Philosophy:** You're watching your robots from a command center. The board is large but shares screen space with a real-time telemetry sidebar showing aggregated system health. You can't intervene, but you can see the vital signs.

**Layout (1920×1080):**
- Board: left 70% of screen (1344×1080), centered vertically
- Telemetry sidebar: right 30% (576×1080), dark background (#0a0a14), monospaced font, terminal aesthetic
- Tick clock: integrated into sidebar header. Digital counter "T-14" format, large monospace numerals. Below it, a thin horizontal progress bar showing elapsed/total estimated ticks.
- Speed controls: below tick clock in sidebar. Three buttons styled as terminal commands: `[SLOW]` `[NORM]` `[FAST]` in green monospace text.

**Telemetry sidebar contents (top to bottom):**
1. **Tick counter** — "T-14" in large 32pt monospace, green on dark
2. **Speed controls** — `[0.5x]` `[1.0x]` `[2.0x]`
3. **Army health** — horizontal bar showing "alive/total" units. Each unit is a colored pip (cyan for scouts, orange for strikers, white for relays, purple for specialists, gold for command). Destroyed units dim to gray. Pips arranged left-to-right in production order.
4. **Context pressure** — stacked horizontal bars, one per living unit. Each bar shows context window fill percentage. Label: unit type icon + ID (e.g., "👁 S-01"). Bar color follows the standard blue→amber→red gradient. When a unit is stunned, its bar flashes white with "OVERLOAD" in tiny red text.
5. **Channel activity** — rolling log of last 5 signal events. Format: `T12 recon-net → S-01 → R-02` in the channel's assigned color. New entries push old ones down. When the log updates, the new line slides in from the right with a 200ms animation.
6. **Kill feed** — bottom of sidebar. Compact kill log: `T15 ⚔ K-01 → 🤖 E-03` (striker K-01 eliminated enemy E-03). Kill events flash red briefly.

**Board treatment:**
- Identical to Fishbowl: full isometric grid with snap movement
- Context bars on units are slightly larger (5px tall) since the sidebar carries the detailed information
- Signal chains on the board are thinner and more subdued — the sidebar log carries the primary signal narrative
- Kill flashes and stun animations identical to Fishbowl

**Sensory description:**
The board fills the left two-thirds of the screen. On the right, a dark terminal-style panel scrolls green text. It feels like you're in a submarine control room — watching sonar (the board) while monitoring instruments (the sidebar). The tick counter flips from T-11 to T-12 with a mechanical digit-roll animation (the "1" in "11" slides up and out while "12" slides in from below, 150ms). The context pressure bars shift in real time — S-01's bar creeps from 50% (blue) to 67% (greenish-amber) as a new observation fills a slot. You glance at the channel activity log: `T12 recon-net → S-01 sent` appears in cyan, sliding in from the right edge. One tick later: `T13 recon-net → R-02 received` slides in below it. You look at the board — the relay's context bar ticks up. The striker is two tiles from an enemy. `T14 strike-cmd → K-01 received` appears in orange. The striker snaps forward. `T15 ⚔ K-01 → 🤖 E-03` appears in the kill feed, pulsing red. The enemy sprite shatters. The army health bar: one red pip disappears from the enemy cluster (not shown in sidebar, but the kill feed confirms).

You notice S-02's context bar is at 83% — amber, almost red. Your eyes widen. Next tick, S-02 receives two observations. The bar hits 100%. `OVERLOAD` flashes in tiny red letters. On the board, S-02 jitters. You wince. One tick stunned. An enemy striker is two tiles away. You can't do anything. T-17: S-02 recovers. T-18: the enemy striker moves adjacent. T-19: `⚔ 🤖 E-07 → 👁 S-02`. S-02 is gone. The army health bar dims S-02's cyan pip to gray. The kill feed shows it in white text, emotionally muted — your unit dying, reported with clinical detachment.

**Strengths:**
- **Context pressure is legible.** You can actually see overload building and understand which units are under pressure. This enables the "oh no, S-02 is at 83%!" anxiety that the Fishbowl approach can't deliver — you see the danger coming but can't prevent it.
- **Channel activity creates narrative.** The rolling log turns abstract signal routing into a readable story. "S-01 sent on recon-net, R-02 received, compressed, forwarded on strike-cmd, K-01 received and engaged." You can follow the information chain in real time.
- **Terminal aesthetic fits the fiction.** You ARE an AI watching your own systems. A command terminal sidebar is diegetically appropriate.
- **Kill feed adds drama.** Seeing kills logged in text creates a sports-broadcast feel. Each kill is an event, named and timestamped.

**Weaknesses:**
- **Divided attention.** The player's eyes must split between board and sidebar. During intense multi-front engagements, you'll miss board events while reading the sidebar or miss sidebar data while watching the board. This division might create frustration rather than productive anxiety.
- **Sidebar is dense.** Context pressure bars for 8+ units, a 5-line channel log, and a kill feed — in 576px of width. This is a lot of information to parse at 1 tick per second.
- **Text is hard to read at speed.** At 1x speed (1 second per tick), channel activity lines appear, scroll, and disappear quickly. At 2x speed (0.5 seconds per tick), the sidebar becomes a blur of scrolling text. This approach degrades significantly at faster speeds.
- **Less cinematic.** The sidebar breaks the full-screen diorama effect. Streaming viewers see a split screen with text they can't read — less visually compelling than the Fishbowl.
- **Approaches "tools" territory.** The locked spec says "no tools" during sealed watch. A telemetry sidebar that shows real-time context fill and channel activity could be argued as a diagnostic tool. The line between "ambient information" and "analysis tool" is blurry.

---

## Approach C: "The Weather Map" — Atmospheric Overlays on the Board

**Philosophy:** Instead of a sidebar, all telemetry information is rendered as atmospheric effects ON the board itself. Context pressure becomes "heat." Signal chains become "weather fronts." The board is both the diorama AND the instrument panel. No UI chrome — just the world, expressing its own internal state through environmental visual language.

**Layout (1920×1080):**
- Board fills 90% of screen (1728×972, centered)
- Tick clock: horizontal pips across the very top of the screen (full width, 24px tall), nearly overlapping the board edge. Minimalist.
- Speed controls: three tiny circles in the upper-right (12px diameter), color-coded: blue=slow, white=normal, red=fast. Click to cycle.
- No sidebar. No text overlay. Everything is visual, rendered into the isometric world.

**Overlay systems:**

1. **Context heat haze.** Each unit emits a "heat shimmer" effect sized proportional to their context fill. At 0-30% fill, the shimmer is invisible. At 50%, a faint heat-distortion ripple surrounds the unit (like hot asphalt). At 75%, the ripple is visible and amber-tinted. At 90%+, the area around the unit actively warps and glows red-orange — the unit is radiating cognitive overload as literal heat. On stun, the heat flash-boils into a bright white burst, then collapses. Recovery: the heat dissipates inward, the tile cools.

2. **Signal weather fronts.** Active signals are rendered as moving colored bands between units — not thin dashed lines, but translucent colored ribbons (8px wide) that flow like wind bands on a weather map. The ribbon color matches the channel. When a signal is in transit (1 tick latency), the ribbon visually moves from sender to receiver tile by tile, arriving the next tick. Multiple signals on the same channel create parallel ribbons. High-traffic channels become dense colored corridors.

3. **Emission fog.** Hook transmissions emit detectable EM noise (per locked spec). This is rendered as a faint expanding fog ring centered on the transmitting unit. The fog is translucent white-cyan, expands outward 2 tiles per tick, and fades over 3 ticks. Dense communication networks create overlapping fog banks — visible representations of how "loud" your army is. Enemy units within the fog radius can detect the signal.

4. **Tagging glow.** Tagged enemies show a persistent cyan diamond marker (per locked spec), but the tagged TILE also emits a faint cyan ground glow that pulses slowly (2s period). This creates "hot zones" on the map where tagged entities cluster — the player can see at a glance where their perception network has flagged threats.

5. **Death echo.** When a unit is destroyed, instead of just pixel debris, the tile enters a brief "echo" state: a ghostly translucent afterimage of the unit remains for 2 ticks, fading. This creates a brief memorial — you see where your scout USED to be — before the tile goes cold.

**Sensory description:**
The board fills your screen. A jungle map — Palawan, Mission 3. Dense green canopy tiles in the northeast, a river cutting diagonally, open beach in the southwest where your factory hums. Your scout moves through the jungle, a thin heat shimmer trailing it — context is at 40%, comfortable. It spots an enemy. A cyan diamond pops onto the enemy tile, and the ground beneath it begins its slow cyan pulse. The scout's hook fires: a translucent cyan ribbon unfurls from the scout toward the relay two tiles south, flowing like a gentle stream. Around the scout, a faint fog ring expands — the EM emission. The relay receives the signal — its heat shimmer intensifies slightly (context went from 30% to 45%). The relay compresses and forwards: an orange ribbon (strike-cmd channel) flows westward toward the striker group. More fog rings.

The enemy AI notices the fog. Two enemy strikers pivot toward the fog's origin. Your scout is in danger. Its heat shimmer is climbing — 50%, 60%. More observations flooding in as enemies approach. The shimmer goes amber. The whole area around the scout looks like it's baking under desert sun. T-18: the scout's context hits 100%. The heat shimmer BOILS — a white flash, and the shimmer collapses into a tight jittering halo. Stunned. The scout can't move. The enemy striker is adjacent next tick. T-20: the tile flashes red. The scout shatters. A ghostly cyan afterimage lingers where it stood. Two ticks later, the afterimage fades. The tile goes dark. The jungle closes over the empty space.

**Strengths:**
- **Maximally atmospheric.** The board becomes a living painting. Context pressure isn't a bar — it's heat. Signals aren't lines — they're weather. The game LOOKS like nothing else. This is the version that wins art direction awards.
- **Diegetically coherent.** Heat, fog, weather — these are metaphors that make physical sense for an AI managing a robot army. The robots are literally generating heat (computation) and fog (EM emissions). The visual language reinforces the fiction.
- **No divided attention.** Everything is on the board. Your eyes stay in one place. The action IS the information.
- **Emission fog teaches a mechanic.** The EM noise mechanic (hooks are detectable) becomes visually obvious. Players can SEE that their chatty scout network is creating a fog bank that enemies can home in on. The visual teaches the mechanic without text.

**Weaknesses:**
- **Visual noise scales catastrophically.** With 12+ units, 6+ channels, heat hazes on everything, fog rings expanding, signal ribbons flowing, tagging glows pulsing — the board becomes an incomprehensible psychedelic soup. The very atmosphere that makes it beautiful at 4 units makes it unreadable at 12.
- **No precise data.** "The shimmer is amber" doesn't tell you if context is at 68% or 79%. The player can't make precise post-hoc claims ("S-02 was at 5/6 context on tick 14"). Atmospheric overlays are inherently imprecise.
- **Performance concerns.** Heat distortion, flowing ribbons, expanding fog rings, pulsing ground glows — all rendered on a Pixi.js canvas simultaneously. At 12+ units with overlapping effects, frame rate could drop, especially on lower-end hardware. And the game is web-based — no GPU compute shaders available.
- **Color blindness disaster.** Context heat (amber/red), signal ribbons (per-channel colors), emission fog (cyan), tagging glow (cyan), death ghost (unit color) — this approach relies heavily on color discrimination. Without careful accessibility work, it excludes a significant player population.
- **Fog conceals the board.** If EM fog is thick enough to be readable as "your army is loud," it's also thick enough to obscure the terrain and unit positions beneath it. The information layer can occlude the thing it's describing.

---

## Approach D: "The Broadcast" — Sports Commentary Framing

**Philosophy:** The sealed watch is framed as watching a live broadcast. A thin ticker-style info bar at the bottom of the screen provides running commentary, while the board is presented clean and central — like a camera covering a live sporting event. The ticker translates game events into readable text in real time.

**Layout (1920×1080):**
- Board: center-top, occupying the top 85% of the screen (1920×918)
- Ticker bar: bottom 15% (1920×162), dark translucent background, horizontally scrolling text
- Tick clock: left side of ticker bar, large numerals
- Speed controls: right side of ticker bar, three buttons

**Ticker bar contents:**
- **Left:** Tick counter in large monospace ("T-14"), below it: speed buttons
- **Center:** Scrolling event ticker. Events appear as short phrases that scroll right-to-left: "S-01 spots enemy at D4" → "R-02 compresses signal" → "K-01 receives strike order" → "K-01 eliminates E-03 at E5". Each event is color-coded by type (green=signal, red=combat, amber=overload, white=movement).
- **Right:** Miniature context pressure summary — five tiny vertical bars (one per unit type), showing average context fill for each unit type. Scout bar shows the average of all scout context fills. Simple, aggregate, not per-unit.

**Board treatment:**
- Clean and uncluttered. Minimal overlays.
- Signal chains shown as brief connecting flashes (thin line appears for 200ms, then gone — not persistent)
- Context bars on units are standard (5px tall)
- Kill and stun animations are punchy — screen shake, debris, full effects

**Sensory description:**
The board dominates the screen, clean and clear. Below it, a dark ticker bar scrolls events like a stock ticker. "T-12: 👁 S-01 detects 🤖 E-04 at C6" scrolls past in green text. A second later: "T-12: 📡 R-02 receives on recon-net" in cyan. The text flows from right to left at a steady pace. On the board above, you see the signal flash — a thin line blinks between the scout and relay. The ticker continues: "T-13: 📡 R-02 compresses, forwards on strike-cmd" in orange. Then: "T-14: ⚔ K-01 receives strike order." You see the striker pivot on the board. "T-15: ⚔ K-01 engages 🤖 E-04 — ELIMINATED." The tile flashes red, the enemy shatters, screen shakes. The ticker text for the kill is larger and bolder, lingering slightly before scrolling off.

In the bottom-right, the five context bars pulse gently. The scout bar is at 60%. The relay bar is climbing. You glance at it between board-watching, a quick vital-signs check, like glancing at the score bug during a sports broadcast.

**Strengths:**
- **Familiar UX pattern.** Sports tickers, news crawls, stock tickers — everyone knows how to read a horizontal scrolling bar. No learning curve for the chrome.
- **Board stays clean.** With the ticker carrying the narrative load, the board can be mostly overlay-free. Large, clear, cinematic.
- **Events become story.** The ticker literally narrates the battle. "S-01 spots enemy" → "R-02 compresses" → "K-01 engages" reads like a play-by-play. This is the version that most directly creates the "watching a sports broadcast of your own AI" feeling.
- **Speed-friendly.** At 2x speed, the ticker scrolls faster but remains parseable — horizontal scrolling text degrades more gracefully than stacked logs or overlapping visual effects.
- **Streaming gold.** Viewers who can't see tiny context bars CAN read ticker text. The broadcast format is inherently spectator-friendly.

**Weaknesses:**
- **Ticker competes with board.** The player's eyes must travel from the center-top (board) to the bottom (ticker) to read events. At intense moments, you'll watch the board and miss ticker events, or read the ticker and miss board action.
- **Text bandwidth limited.** At 1 tick per second with 8+ units acting, the ticker could have 3-5 events per tick. Scrolling 3-5 events per second is uncomfortable to read. Events get pushed off-screen before the player finishes reading them.
- **Not "no tools."** A real-time event ticker providing parsed information about game events might violate the "no tools" constraint. It's arguably an analysis tool dressed as a UI element.
- **Per-type context averages hide individual danger.** Showing "average scout context" at 55% doesn't tell you that S-01 is at 90% while S-02 is at 20%. The aggregation hides the specific danger.
- **Bottom bar eats vertical space.** 15% of vertical screen for the ticker means the board is smaller. On 768p screens, this is severe.

---

## Approach E: "The Heartbeat" — Audio-Forward Minimal Visual

**Philosophy:** The primary information channel during sealed watch is SOUND, not vision. The board is large and clean, visual overlays are minimal, but every game event has a distinct, layered audio signature. Context pressure is expressed through rising pitch. Signal chains are expressed through spatial audio panning. Combat is percussion. The player watches a quiet board and HEARS the battle unfold.

**Layout (1920×1080):**
- Board fills 90% (identical to Fishbowl / Weather Map)
- Tick clock: horizontal pips at top (24px)
- Speed controls: top-right corner, tiny
- No sidebar, no ticker, no telemetry
- Context bars: standard 5px bars on units
- Signal chains: brief flash-lines (200ms visibility)
- Audio is the primary information layer

**Audio design:**

1. **Tick heartbeat.** Every tick, a low bass pulse. Like a heartbeat. The base rhythm of the game. At 0.5x speed, the heartbeat is slow and deliberate (thump... thump...). At 1x, it's a steady 60bpm. At 2x, it doubles to 120bpm — anxious, urgent.

2. **Context pressure tone.** Each unit emits a continuous tone, pitched to its context fill level. At 0%: silence. At 30%: a very quiet, low hum. At 60%: a mid-pitch hum, now audible. At 80%: a high-pitched whine, uncomfortable. At 95%: a piercing, oscillating alarm tone. When a unit overloads: a harsh distortion burst (like speaker feedback) followed by silence (the stunned tick). Recovery: the hum returns at a lower pitch (buffer cleared partially). With 8 units, you hear a chord of context pressure — most units humming low, one whining high. You know someone's in danger before you find them on the board.

3. **Signal spatial audio.** When a signal is sent, a short chirp sound pans from the sender's board position to the receiver's. If the scout is on the left side of the board and the relay is center-right, the chirp sweeps left-to-right in the stereo field. Different channels have different chirp timbres (recon-net might be a metallic ping, strike-cmd might be a short buzz). Dense communication creates a spatial audio landscape of chirps crossing the stereo field.

4. **Combat percussion.** Kills are a sharp snare hit with a sub-bass thump. Your unit dying adds a descending pitch-bend (defeat tone). Enemy dying adds a brief ascending chime (victory tone). The board shake accompanies the audio — felt as much as heard.

5. **Emission hiss.** EM emissions from hooks produce a subtle static hiss localized to the transmitting unit's position. Heavy communication networks create a "white noise zone" on one side of the board. If the player pans attention there, they hear the noise their army is making.

**Sensory description:**
You press EXECUTE. The screen fills with the Ifugao rice terrace map. A deep bass pulse — THUMP — the first tick. Silence for a beat. THUMP — tick 2. Your scouts begin moving. You hear a faint hum — low, comfortable. Context pressure is low. A metallic ping chirps from the left side of your headphones to the center — a scout sent a signal on recon-net. A second later, a softer ping echoes from center to the right — the relay forwarded. The hums are building slightly. THUMP — tick 5. A high chirp from the right — the striker received its order. On the board, it pivots. THUMP. The striker advances. THUMP. Adjacent to an enemy. CRACK — snare hit, sub-bass thump, ascending chime. Enemy down. You feel the impact in your chest (if headphones or subwoofer).

Now the battle deepens. Multiple scouts are active. The hum-chord rises — three low hums, one mid-pitch, one climbing toward high. You hear it before you see it: one voice in the chord is getting shrill. You scan the board. S-02 — its context bar is amber. The hum keeps rising. A chirp ping sweeps across — another signal received. The pitch jumps. Now it's a whine. THUMP — tick 14. BZZZT — harsh distortion. The whine cuts to silence. S-02 overloaded. On the board, the scout jitters. The chord drops one voice — an absence. One fewer instrument in the orchestra. An enemy moves adjacent. THUMP. CRACK — but this time, a descending tone. Your scout is gone. The chord thins. The hum of the remaining units continues, but there's a hole where S-02's voice used to be.

**Strengths:**
- **Unique sensory experience.** No other strategy game uses spatial audio as its primary information channel during execution. This is genuinely novel — the game SOUNDS like no other game.
- **No visual clutter.** The board stays clean because audio carries the telemetry. No heat hazes, no sidebars, no tickers. Just the diorama and its soundscape.
- **Peripheral awareness.** Audio is processed pre-attentively. You don't need to look at a bar to know context pressure is rising — you HEAR it. You can watch one area of the board while hearing danger elsewhere. Audio and vision work in parallel, not in competition.
- **Emotional depth.** The ascending context-pressure chord, the combat percussion, the descending death tone — this creates an emotional arc through sound alone. The "chord thinning" as units die is gut-wrenching in a way visual bars can never match.
- **Accessibility for visually impaired players.** The audio-forward design is inherently more accessible to players with low vision.

**Weaknesses:**
- **Requires headphones or good speakers.** Spatial audio panning is inaudible on laptop speakers or in noisy environments. The game becomes half-deaf without proper audio equipment.
- **Audio fatigue.** Continuous tones (context pressure hums) can become irritating over multiple missions. Even well-designed ambient audio can cause listener fatigue in 30+ minute sessions.
- **Learning curve.** Players must learn an audio vocabulary from scratch. "High pitch = danger" is intuitive, but "metallic ping = recon-net channel" requires learning. New players will hear cacophony before they hear information.
- **Impossible to screenshot.** You can't share the audio experience in a static image. Clips and streams transmit it, but forum posts, reviews, and design docs cannot capture the appeal. This hurts discoverability and word-of-mouth.
- **Speed controls break audio.** At 2x speed, the heartbeat doubles, context hums pitch up (or compress unnaturally), chirps overlap. The entire soundscape falls apart at non-default speeds.

---

## Approach F: "The Hybrid" — Layered Legibility at Three Depths

**Philosophy:** Combine the best elements. The board is large with atmospheric overlays (from Weather Map), BUT the overlays are tuned to be subtle. A minimal bottom bar (from Broadcast) shows the 2-3 most recent events. Audio cues (from Heartbeat) provide peripheral awareness. The player gets three layers of information that reinforce rather than compete:

1. **Layer 1 — Board (eyes).** Unit movement, signal flash-lines (thin, brief), kill animations, context bars on units (5px, color-coded). Stun jitter. Subtle heat shimmer ONLY on units above 80% context (not on everything). Emission fog ONLY as a brief pulse (not persistent).
2. **Layer 2 — Audio (ears).** Tick heartbeat, context pressure chord (but quieter, more ambient), spatial signal chirps, combat percussion. All tuned to be a soundtrack, not an alarm panel.
3. **Layer 3 — Ticker (glance).** A slim, single-line ticker bar at the very bottom (48px tall, ~4.5% of screen). Shows only the MOST RECENT event. No scrolling — each event replaces the previous. Color-coded text. Format: "T14: K-01 engages E-04 — ELIMINATED". Fades to 30% opacity after 2 seconds. Fully unobtrusive.

**Layout (1920×1080):**
- Board: full screen minus 48px at bottom (1920×1032)
- Ticker: bottom 48px, dark translucent strip, single event line, centered text
- Tick clock: horizontal pips across top (24px), same as Fishbowl
- Speed controls: top-right, three small buttons

**Sensory description:**
The board fills your screen — nearly full. At the very bottom, a paper-thin dark bar. Almost invisible. The tick clock pips mark time at the top. Your scout advances. A faint chirp sweeps left-to-center in your headphones — recon-net signal. On the board, a thin cyan line blinks between scout and relay for 200ms. The relay's context bar ticks up. The bottom bar reads "T-12: 📡 R-02 receives on recon-net" in soft cyan text, then fades. You barely notice it — your eyes are on the board. The relay forwards. Orange line blinks to the striker. The bottom bar updates: "T-13: K-01 receives on strike-cmd" in orange. The striker moves. Contact. CRACK — percussion in your headphones, screen shake, pixel debris. "T-15: ⚔ K-01 → 🤖 E-04 — ELIMINATED" in bold red at the bottom, lingering an extra beat before fading.

Meanwhile, a scout on the east flank is getting warm. Its heat shimmer just became visible — it crossed the 80% context threshold. On the board, the air around the unit warps faintly. In your headphones, one voice in the ambient chord has risen above the others — a whine among hums. Your eyes find the shimmer, confirm the danger, then return to the main engagement. The bottom bar doesn't mention context pressure — it only shows discrete events. The shimmer and the audio told you. Three channels of information, none competing. You feel omniscient and helpless simultaneously — you know everything, can change nothing.

**Strengths:**
- **Graceful degradation.** Works with headphones (full experience), without headphones (visual only, still good), on mute (board + ticker, still functional), on a small screen (board shrinks, ticker stays readable).
- **No single channel overloaded.** Audio carries ambience. Board carries action. Ticker catches the events you missed. Each channel fills gaps in the others.
- **80% context threshold for heat shimmer prevents visual noise.** Only units in danger get the shimmer. A healthy army is a clean board.
- **Single-event ticker is minimal.** One line of text, auto-fading. It's not analysis — it's a caption.
- **Preserves cinematic quality.** The board is nearly full-screen. The ticker is nearly invisible. The audio is a soundtrack. It FEELS like watching a movie of your own robots.

**Weaknesses:**
- **Complexity of implementation.** Three information layers (visual overlays + spatial audio + ticker) require careful tuning to prevent any one from becoming annoying. A lot of design parameters to balance.
- **"Jack of all, master of none" risk.** The Fishbowl is more cinematic. Mission Control is more informative. The Heartbeat is more novel. The Hybrid might be "fine at everything, excellent at nothing."
- **Player confusion about audio.** If the player doesn't realize audio is carrying information (no tutorial for this), they might play on mute and miss context pressure warnings entirely.
- **Settings complexity.** Players will want to tune each layer independently (louder/quieter audio, ticker on/off, heat shimmer on/off). The settings menu balloons.

---

## Interaction Effects Across the Design Space

### × Plan Screen (4.01)
The transition from plan to execute is the most emotionally charged moment in the game. The plan screen's workbench-heavy layout must give way to the execute screen's board-heavy layout. The transition animation matters enormously:
- **Option A ("The Compile"):** When EXECUTE is pressed, the workbench panels slide off-screen to the right. The board expands from its preview size to full screen. Blueprint icons compress into unit icons and deploy onto the grid. This takes 2 seconds. It feels like compiling code — the abstract becomes concrete.
- **Option B ("The Curtain"):** The plan screen fades out entirely. 1 second of black screen. Then the execute screen fades in with the board already populated. The black screen is the moment of commitment — you've submitted your code, there's a breath of darkness, then reality begins.
- **Option C ("The Launch"):** The board zooms from its plan-screen preview size, the workbench dissolves into the expanding board. Units materialize at their spawn points with a brief teleportation flash. EXECUTE button transforms into the tick clock. Continuous transformation — no cut.

### × Inspector (4.04)
The sealed watch generates questions. The inspector answers them. The more opaque the sealed watch, the more the inspector matters. The Fishbowl approach (minimal information) makes the inspector ESSENTIAL. Mission Control (rich telemetry) makes the inspector supplementary — you already saw most of what happened. The game's two-act debrief structure (emotional watch THEN analytical inspector) argues for a more opaque sealed watch — the emotional act needs mystery.

### × Context Overload (4.07)
The locked spec says overload = 1 tick stunned. How this is SHOWN during the sealed watch varies dramatically across approaches. The Fishbowl shows a jitter animation. The Weather Map shows a heat explosion. The Heartbeat plays a distortion burst. The Broadcast narrates "S-02 OVERLOADED." Each approach gives the moment different weight. Overload should feel like a punch — the most catastrophic non-death event.

### × Signal Latency (locked: 1 tick per hop)
Multi-hop signals take multiple ticks. The sealed watch must make this visible. At 1x speed, a 3-hop signal takes 3 seconds — long enough to watch. At 2x speed, 1.5 seconds. The signal visualization (lines, ribbons, chirps, ticker text) must work at both speeds. Approach C (weather ribbons) is the most visually clear — you can literally SEE the signal moving tile by tile. Approach A (brief flash lines) is the fastest to parse but doesn't show the journey.

### × Emission Noise (locked: hooks emit detectable EM)
Only Approach C (Weather Map) and E (Heartbeat) make emissions naturally visible/audible. Approaches A, B, and D have no natural way to show "your army is being loud." This is a critical mechanic — players need to learn that communication has a cost. The Hybrid (F) solves this with subtle emission pulses.

---

## Comparable Games: How They Handle "Watch" Phases

| Game | Watch Phase Character | Key Technique |
|------|----------------------|---------------|
| **Into the Breach** | No "watch" — full information before execution. Resolution is instantaneous tile-to-tile. | Snap animations with directional arrows pre-shown. Resolution is 1-2 seconds total. |
| **Frozen Synapse** | Simultaneous resolution. Both plans play out. 5-10 second phase. | Split-screen replay showing your perspective and enemy perspective sequentially. Minimal HUD during playback. |
| **Gladiabots** | Real-time battle, AI-controlled. 30-60 seconds. | Top-down view, minimal HUD. Player watches for patterns. No signal/context visualization. |
| **Teamfight Tactics** | Auto-battle round, 10-20 seconds. | Health bars, damage numbers, ability VFX. Players often scout OTHER boards during their fight. |
| **Opus Magnum** | Player watches their machine execute. | Smooth mechanical animation. The machine IS the visual. No HUD needed — the joy is watching gears turn. |
| **Factorio** | Persistent "watch" — the factory runs continuously. | Zoom in/out. Information is in the world (belt items, fluid levels, pollution clouds). |
| **Combat Mission** | Orders-then-playback. 60-second turns. | Pauseable replay after each turn. Free camera. Unit status panels. |

The most relevant parallel is **Opus Magnum**: you built a machine, now you watch it work. The emotional payload is identical — "I designed this, and it's WORKING" or "oh no, I see the problem." Opus Magnum achieves this with zero HUD because the machine is its own visualization. Robot Uprising's challenge is that information flow (signals, context, hooks) is invisible by nature — it has no physical machinery to watch. The UI must MAKE the invisible visible.

---

## The TikTok Clip Test

For each approach, what's the 15-second clip?

- **Fishbowl:** Camera on the full board. Scout spots enemy. Signal line flashes across the map. Three ticks later, a striker materializes from the other side and eliminates the enemy. Screen shake. Pixel debris. The clip is CLEAN — no text, no chrome. Just robots executing a coordinated kill. 10M views.

- **Mission Control:** Split screen: board left, terminal right. Terminal scrolling green text. Kill event appears in red. Board shows the kill. The split-screen says "this game is serious" — it's a hacker movie. Niche but striking. 2M views.

- **Weather Map:** Board covered in flowing colored ribbons and heat shimmer. A unit's heat shimmer goes critical — white flash — stun. Enemy moves in. Kill. Death echo. The board looks like a painting coming alive. Art gallery crowd. 5M views, mostly from art/aesthetic accounts.

- **Broadcast:** Clean board with a ticker at the bottom narrating kills. Looks like esports. Familiar, professional, but nothing viral. 500K views.

- **Heartbeat:** This one needs AUDIO. A clip of the context-pressure chord rising, the distortion burst of an overload, the percussion crack of a kill. Set against a clean board. "This game SOUNDS amazing." 3M views — but only if the clip autoplays with sound.

- **Hybrid:** Clean board with subtle shimmer on one critical unit, faint signal flash, then the kill — screen shake, debris, a brief text caption fading at the bottom. It looks polished and complete. Not as striking as Fishbowl or Weather Map individually, but more "this is a real, finished game." 4M views.

---

## Player Journeys

### Journey: Mei, 28, Software Engineer (First Sealed Watch)

**Context:** Mission 1 (Ifugao, tutorial). Mei has just configured a single scout with a basic patrol route and one hook: "on enemy detected → send on recon-net." She's placed one striker with a rule: "if message on recon-net → move toward signal source." She has never pressed EXECUTE before.

**Minute 0:00 — The Button**
Mei stares at the EXECUTE button in the top-right. It pulses red-orange, gently, like a heartbeat. Her workbench shows her two configured blueprints. The small tactical preview shows the 8x8 grid with two ghost units at spawn positions. She clicks EXECUTE.

**Minute 0:02 — The Transition**
The workbench slides off-screen to the right. The board expands to fill the screen. The ghost units solidify — the scout materializes at B2 with a brief teleportation flash (cyan ring expanding outward). The striker appears at F7. The tick clock appears at the top: 20 empty pips. The first pip pulses white. A bass heartbeat thumps in her headphones.

**Minute 0:05 — Tick 1**
The scout snaps from B2 to C2. A tiny context bar beneath it is cool blue, nearly empty. Mei's eyes are wide. She didn't click anything. The scout just... moved. On its own. Because of the rules she wrote. The striker doesn't move — no signal yet, no reason to. Mei watches.

**Minute 0:10 — Tick 5**
The scout reaches E4. An enemy appears from the enemy spawner at H8 — a red robot icon slides onto G7. The scout's perception radius (not visible on the sealed watch, only on plan screen) detects it. A thin cyan dashed line shoots from the scout (E4) to... where? There's no relay. The striker at F7 isn't listening to recon-net. Wait — Mei realizes her mistake. She configured the striker to listen to recon-net, but did she toggle the context config? Did she set it to receive? She can't remember. The bottom ticker reads "T-05: 👁 S-01 detects 🤖 E-01 at G7. Signal sent on recon-net." She reads it, heart pounding. Then: "T-06: ⚔ K-01 receives on recon-net."

**Minute 0:15 — The Payoff**
It worked. The striker received the signal. It pivots — the sprite snaps to face northeast. Next tick, it moves to G7. Adjacent to the enemy. Tick 8: the tile flashes red. CRACK. Pixel debris. "T-08: ⚔ K-01 → 🤖 E-01 — ELIMINATED." Screen shake. Mei pumps her fist. She built that. Two agents, one hook, one rule, and they just COORDINATED to kill an enemy. The tick clock shows 8 of 20 ticks elapsed. The remaining enemy spawner is quiet. She watches the last 12 ticks — her scout continues patrolling, the striker returns to patrol. Nothing else happens. The screen fades to the inspector.

**Minute 0:30 — Reflection**
Mei is buzzing. She wants to make more complex chains. Three agents. Multiple channels. She's already thinking about relays. The sealed watch gave her the emotional hit: "I designed an AI and it WORKED." The inspector will show her exactly how — which rule fired, which context slot held the signal. But the feeling happened during the watch.

**UI Annotations:**
- EXECUTE button: 48×48px, top-right, red-orange gradient, 4s pulse cycle. Click triggers plan→execute transition.
- Tick clock: 20 horizontal pips at top of screen. Current tick = white pulse. Past = gray. Future = dark outline.
- Context bars: 5px tall colored bar beneath each unit sprite. Blue→amber→red gradient.
- Signal flash: thin dashed cyan line from sender to receiver, appears for 400ms, fades over 200ms.
- Kill flash: tile turns red for 200ms. Unit sprite fractures into 4px debris particles. 2px screen shake for 100ms.
- Bottom ticker: 48px tall, dark translucent bar. Single event, centered text, color-coded. Auto-fades to 30% opacity after 2s.

---

### Journey: Tomás, 35, Factorio Veteran (Mission 7, Complex Network)

**Context:** Mission 7 (Mindanao, jungle). Tomás has a factory producing scouts, strikers, relays, and a command agent. He has 5 channels and 3 blueprints with intricate hook chains. He's optimized his context configs to prevent overload. He's on his third retry of this mission.

**Minute 0:00 — Pre-Execute Ritual**
Tomás has a routine: before hitting EXECUTE, he mentally traces the signal path. Scout spots enemy → sends on "contact-alpha" → relay compresses → forwards on "priority-target" → command receives → evaluates → sends reassignment on "strike-cmd" → striker receives. Five hops. Five ticks of latency. He needs the enemy to be at least 5 ticks away from anything fragile when spotted. He's done the math. He clicks EXECUTE.

**Minute 0:05 — Factory Online**
The first 10 ticks are production. His factory at A1 glows and hums. Every 3 ticks, a new unit materializes — first a scout, then a relay, then a striker. The conveyor belt is working. On the board, units appear at the factory tile and immediately begin following their patrol routes. Tomás watches the deployment pattern, counting. Scout goes northeast. Relay anchors at C3 (stationary). Striker stages at D5. Good.

**Minute 0:15 — Contact**
Tick 12: the forward scout hits the enemy perimeter. A burst of activity. Cyan signal line shoots to the relay. The relay's context bar ticks up slightly. Next tick: orange line from relay to the command unit at B2. Command's context bar is at 4/14 — plenty of room. Tick 14: command evaluates. A gold signal line shoots from command to the striker on "strike-cmd." But Tomás notices something: a second enemy group has appeared in the northwest. His second scout is detecting them, sending on "contact-beta." That signal also routes through the same relay. The relay's context bar jumps — 6/12 slots now filled. Two incoming channels. One relay.

**Minute 0:25 — The Crisis**
Tick 18: the relay is at 9/12. Tomás watches the bar inch upward. "Come on, compress..." he mutters. The relay has the compress skill — it should be evicting old entries. But the incoming rate is outpacing compression. Tick 19: 10/12. The heat shimmer around the relay becomes visible — it crossed the 80% threshold. A faint whine rises in the audio chord. Tick 20: 11/12. The shimmer intensifies. Tomás leans forward. "No, no, no." Tick 21: an enemy scout sends a decoy ping. The relay receives it (context listen config is set too broadly — it's listening on recon-net AND contact-beta AND contact-alpha). 12/12. The relay overloads. BZZZT — distortion burst. The shimmer flash-boils white. The relay jitters. "OVERLOAD" — the bottom ticker reads "T-21: 📡 R-01 OVERLOADED — stunned 1 tick."

The signal chain breaks. The command unit is waiting for compressed data that isn't coming. The striker doesn't receive its order. An enemy striker advances. Tomás watches, jaw clenched. Tick 22: relay recovers. It compresses the backlog. But the enemy striker is now adjacent to his scout. Tick 23: scout eliminated. Tomás exhales through his teeth.

**Minute 0:40 — Salvage**
The remaining units regroup. The command agent reroutes hooks (it has the "reroute" skill) — contact-alpha now goes directly to the striker, bypassing the overloaded relay. Tomás watches this happen automatically — he configured the command's rule: "if relay overloaded → reroute contact-alpha to striker." It fires. The golden line rearranges on the board. He smiles grimly. At least the failover worked. The battle continues. He loses another scout but destroys 4 of 6 enemies. Mission incomplete — needed all 6.

**Minute 1:05 — Post-Battle**
Screen fades to inspector. Tomás already knows what he needs to fix: the relay's context listen config is too broad. It's receiving on three channels when it should be on two. And he needs a second relay to split the load. He scrubs to tick 21 in the inspector, clicks the relay, sees the exact context state: 12/12 slots, the last entry was the enemy's decoy ping on a channel the relay shouldn't have been listening to. "There it is." He notes the fix. Back to the plan screen.

**UI Annotations:**
- Factory production: unit materializes at factory tile with a 500ms assembly animation (parts sliding together). Production queue icon at bottom of factory tile shows next unit being built (tiny icon, progress bar).
- Multi-signal board: at peak activity, 3-4 signal lines visible simultaneously. Color-coding prevents confusion: cyan for recon-net, orange for strike-cmd, purple for contact-beta, gold for command channels.
- Heat shimmer threshold: only appears at 80%+ context fill. Below 80%, context bars are the only indicator.
- Command reroute: when command uses reroute skill, a golden pulse travels along the old signal path, then the path visually disconnects and a new golden line draws itself along the rerouted path. Takes 500ms. Visible confirmation that the failover happened.

---

### Journey: Aiko, 14, First Strategy Game (Mission 2, Learning Context)

**Context:** Mission 2 (Siquijor, mystic island). Aiko has completed Mission 1 (single scout + striker). Mission 2 introduces the context window concept. She has a scout with a 6-slot context window and must configure what it pays attention to.

**Minute 0:00 — Nervous Press**
Aiko presses EXECUTE with her heart in her throat. She understood Mission 1 — scout finds enemy, striker kills enemy. Mission 2 is different. The boot log told her about "context windows" — a unit's working memory. She configured her scout to listen to everything. She didn't know what to filter out. "Just let it notice everything, right?"

**Minute 0:08 — Early Ticks**
The scout moves. It spots terrain features, allies, distant movement — each observation fills a context slot. The context bar beneath the scout goes from empty (cool blue) to 2/6 (still blue) to 3/6 (starting to shift greenish). Aiko watches, curious. The bottom ticker reads: "T-03: 👁 S-01 observes terrain at D5." Then: "T-04: 👁 S-01 observes ally at B3." She thinks: "Why is it noticing terrain? That's not useful..."

**Minute 0:18 — Rising Pressure**
Context bar at 4/6 — amber now. Aiko notices the color change. "Wait, is that bad?" A faint heat shimmer around the scout — the 80% threshold visual. Actually, 4/6 = 67%, so no shimmer yet. But the bar color has shifted. Then 5/6. The bar is distinctly amber-orange. Now the shimmer appears — 83%. A whine in the audio. Aiko feels her stomach tighten. "What happens when it fills up?" She remembers the boot log: overload means stunned for one tick.

**Minute 0:25 — The Lesson**
Tick 10: 6/6. The scout overloads. BZZZT. Jitter animation. "T-10: 👁 S-01 OVERLOADED." Aiko gasps. The scout freezes. An enemy was two tiles away. Tick 11: still stunned. Tick 12: recovered — but the enemy is adjacent. Tick 13: eliminated. The scout shatters. Aiko says "No!" out loud.

**Minute 0:35 — Understanding**
The inspector shows her: the scout's context was filled with terrain observations, ally positions, and a single enemy detection. The enemy detection was in slot 5 of 6. The scout noticed EVERYTHING — and drowned in its own observations. Aiko understands: she needs to configure the context to IGNORE terrain and allies. Focus on enemies. Less is more. She goes back to the plan screen and toggles the context config: ignore terrain, ignore allies, listen only for enemies. "You don't need to know about everything. Just the important stuff." She's just learned the fundamental lesson of attention architecture.

**UI Annotations:**
- Context bar color gradient: 0-50% = cool blue, 50-70% = green-blue, 70-85% = amber, 85-100% = red-orange. The gradient is continuous, not stepped.
- Overload animation: unit jitters ±2px per frame. Tiny lightning spark particles. Context bar flashes white. Duration: 1 tick (1 second at default speed).
- Recovery animation: jittering stops. Cyan ring contracts inward (context cleared). Context bar drops to ~50% (eviction occurred).
- Tutorial reinforcement: after Aiko's first overload, the debrief screen highlights the overloaded tick with a special callout (not during sealed watch — this is an inspector feature).

---

## Recommendation Axes

The six approaches sit on three axes. The final design will be a point in this 3D space:

1. **Information density** (how much telemetry is shown)
   - Low: Fishbowl (board only) → High: Mission Control (full sidebar)

2. **Information channel** (where telemetry lives)
   - Visual-on-board: Weather Map → Visual-off-board: Mission Control/Broadcast → Audio: Heartbeat

3. **Chrome weight** (how much screen space is non-board)
   - Zero: Fishbowl/Weather Map → Medium: Broadcast ticker → Heavy: Mission Control sidebar

The Hybrid (Approach F) sits at a moderate point on all three axes. But the game's specific emotional needs might call for an extreme:

- If the priority is **"first impressions / TikTok virality"** → Fishbowl or Weather Map
- If the priority is **"teaching context mechanics"** → Mission Control or Hybrid
- If the priority is **"emotional separation from inspector"** → Fishbowl or Heartbeat (opacity drives inspector value)
- If the priority is **"accessibility"** → Hybrid (graceful degradation across audio/visual/screen size)
- If the priority is **"streaming / spectator experience"** → Broadcast or Fishbowl

The locked spec's "no tools" constraint most comfortably fits Fishbowl, Weather Map, Heartbeat, and Hybrid. Mission Control and Broadcast push against the boundary by providing parsed game events in real time.
