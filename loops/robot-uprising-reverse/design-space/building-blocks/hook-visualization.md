# 3.10 — Hook Visualization: Making the Invisible Wiring Visible

## Overview

Hooks are the nervous system of Robot Uprising — they wire agents into reactive communication networks via named channels. But a nervous system you can't see is a nervous system you can't debug, can't teach, can't appreciate. The central design challenge: **how do you render an invisible web of asynchronous signal pathways on an 8×8 grid without turning the battlefield into spaghetti?**

This is arguably the single most important visualization problem in the game. The four primitives (skills, rules, hooks, context config) are the player's toolkit, but hooks are the only primitive that creates *spatial relationships between units*. Skills are local. Rules are local. Context config is local. Hooks are the wires that turn five isolated robots into a distributed intelligence network. If the player can't see the wiring, they can't design it, they can't debug it, and the "aha" moment of watching their architecture process information never lands.

The locked spec establishes:
- **Signal chains visible** during sealed watch: "colored dashed lines show active channel communications between units during battle"
- **Channel map panel** in plan screen: "read-only auto-generated summary"
- **Cell flashes** for signal delivery (green) and combat (red)
- **Hook slots** are per-unit (Scout: 2, Relay: 4, Command: 6)
- **Channels emerge from hooks** — type a name in a hook config → channel created

This document explores every possible approach to visualizing hooks across all three screens (Plan, Sealed Watch, Inspector), from the most minimal to the most information-dense, and maps the design tensions between readability and expressiveness.

---

## The Five Visualization Contexts

Hook visualization isn't one problem — it's five, each with different constraints:

| Context | Screen | State | Key Tension |
|---------|--------|-------|-------------|
| **Blueprint wiring** | Plan | Static (design-time) | Show potential connections between blueprint types without showing specific unit instances |
| **Ghost preview** | Plan | Preview (pre-execute) | Show where signals *will* flow based on spawn positions and channel subscriptions |
| **Live signals** | Sealed Watch | Dynamic (runtime) | Show signals traveling between units in real-time without overwhelming a 1-second-per-tick display |
| **Signal history** | Inspector | Retrospective (scrubable) | Show which signals fired at any given tick, traceable to source and effect |
| **Network topology** | Plan (channel map) | Structural (overview) | Show the shape of the entire communication graph at a glance |

---

## Paradigm 1: The Pulse Wire — Colored Dashed Lines with Traveling Dots

**Philosophy:** Wires exist between connected units at all times. When a signal fires, a bright dot travels along the wire from sender to receiver. The wire is the channel; the dot is the signal.

**How it works:**

*Plan screen:* Thin dashed lines connect units that share a channel. Each channel has a unique color (auto-assigned from a palette of 8 high-contrast colors: cyan, magenta, gold, lime, coral, violet, teal, rose). Lines are drawn as shallow Bézier curves that arc slightly above the grid to avoid overlapping unit tiles. When the player hovers a hook slot in the blueprint editor, all lines for that channel pulse brighter. Unrelated channels fade to 20% opacity.

*Sealed watch:* The dashed lines remain but at 30% opacity — background topology. When a hook fires at tick N, a luminous dot (same channel color, 6px diameter, soft glow) spawns at the sender and travels along the wire to the receiver over 0.3 seconds (fitting within the 1-second tick). The dot leaves a brief comet trail that fades over 0.2 seconds. Multiple simultaneous signals on the same channel create a train of dots — visually, it looks like data packets flowing through a fiber optic cable.

*Inspector:* The timeline scrubber controls which signals are visible. At any tick, all active signals are shown as frozen dots on their wires, positioned proportionally along the path based on when they fired within the tick. Clicking a dot opens the signal payload inspector.

**Sensory description:** The battlefield at rest shows a faint web of colored dashes — like a circuit board's trace lines visible through frosted glass. When the battle heats up, the web comes alive: cyan dots stream from scouts to relays, gold dots pulse from relays to strikers, the occasional magenta dot races diagonally across the board from a command unit reconfiguring a distant agent. In heavy communication, the wires look like a city's traffic at night seen from above — streams of colored light flowing through predetermined channels. When a unit is destroyed, its wires snap with a tiny white flash and dissolve from the break point outward, like a fuse burning in reverse.

**The TikTok clip:** A scout spots three enemies simultaneously. Three cyan dots explode outward from the scout along separate wires. One reaches a relay, which compresses the data — a single gold dot emerges from the relay, brighter than the three that entered, and races toward a striker. The striker snaps to action the tick the dot arrives. Fifteen seconds of pure signal flow choreography.

**Strengths:**
- Intuitive spatial metaphor — wires and signals are universally understood
- Layered information density — topology visible at rest, activity visible in motion
- Scales well from 2 units to 15: with 2 units, one clear line; with 15, a visible but readable web
- The traveling dot naturally communicates signal latency (1 tick per hop is visible as travel time)
- Wire persistence means the player always knows the network shape, even during quiet ticks

**Weaknesses:**
- With 6+ channels, the color palette starts to strain — distinguishing teal from cyan from lime at small scale
- Overlapping wires between close units (two relays next to each other both sending to the same striker) create visual ambiguity
- The dashed-line style may conflict with grid lines and terrain markers
- On a busy tick where 10+ signals fire simultaneously, the dot train can become a visual blur
- Color-blind players lose the channel-identification layer unless supplemented with line patterns (solid, dashed, dotted, dash-dot)

**Interaction effects:**
- Combines naturally with the locked "context bars" on units — dots arriving correlate with bars filling
- The EM emissions mechanic maps directly: more dots = more noise = more enemy detection. The player can *see* how loud their network is
- Works with the locked "signal chains visible" spec requirement — this IS the colored dashed lines described there

---

## Paradigm 2: The Heatmap Glow — Channel Activity as Ambient Light

**Philosophy:** Instead of drawing explicit wires, each channel manifests as an ambient glow that illuminates the tiles around participating units. Active channels glow brighter. The battlefield looks like a thermal camera view of information flow.

**How it works:**

*Plan screen:* Each unit emits a soft radial glow in its subscribed channel colors. When two units share a channel, their glows overlap in the tiles between them, creating a visible "corridor" of shared color. The overlap region's brightness indicates how many channels are shared. A scout subscribed to the cyan "recon-net" channel glows cool cyan; a relay on the same channel also glows cyan. The tiles between them — where the glows overlap — form a brighter cyan band, a visual "pipe" between them.

*Sealed watch:* The glow is normally subdued (10% opacity). When a signal fires, the sender's glow pulses outward in a ripple that reaches the receiver exactly when the signal arrives (1 tick later). The ripple moves at a visible speed — expanding from the sender tile like a sonar ping, channel-colored, fading as it expands. Multiple overlapping ripples from different channels create an aurora-like interference pattern on the battlefield. Tiles where multiple channel ripples intersect shimmer.

*Inspector:* A toggle switches between "wire view" (explicit connections) and "heatmap view" (ambient glow). The heatmap at any scrubbed tick shows the cumulative signal activity — tiles that have seen heavy traffic glow hot, tiles that have never carried a signal remain dark. This reveals "information highways" and "dead zones" on the board.

**Sensory description:** The battlefield breathes with light. In the opening ticks, faint colored halos surround each unit — a scout's cyan aura, a striker's coral warmth, a relay pulsing gold from its stationary position. As signals begin firing, the halos ripple outward in concentric waves. When a scout detects an enemy and fires its hook, a cyan ripple bursts from its tile and expands outward at one tile per tick, like dropping a stone in colored water. When it washes over the relay two tiles away, the relay's gold glow flares and sends its own ripple. The board during a complex engagement looks like a bioluminescent reef — pulsing, overlapping circles of light that reveal the invisible information architecture beneath the unit movements.

**The TikTok clip:** An overhead view of the board as a coordinated attack unfolds. Cyan ripples from scouts converge on a central relay. The relay flares gold, sending a ripple that washes over three strikers simultaneously. All three snap into formation. The whole sequence plays like a heartbeat — contract (information in), expand (commands out). Mesmerizing.

**Strengths:**
- Beautiful and distinctive — no other game looks like this
- Naturally communicates spatial relationships (glow overlap = shared channel)
- Signal latency is gorgeous — you can *watch* the ripple travel across the board
- Information density without visual clutter — no wires, no overlapping lines
- The "information highways" heatmap in the Inspector is an incredibly powerful debugging tool
- Works for color-blind players with brightness-only mode (channels differentiated by animation speed instead of color)

**Weaknesses:**
- Loses specificity — you can see THAT signals are flowing, but not exactly WHICH unit sent to WHICH
- With 6+ channels, the overlapping glows become muddy (cyan + gold + magenta = indistinct bright mess)
- Harder to teach than explicit wires — "why is my unit glowing?" is a more confusing question than "what does this wire connect to?"
- The ripple animation needs careful timing: too fast and it's just a flash; too slow and it doesn't resolve within the 1-second tick window
- Doesn't scale to large channel counts — works best with 2-3 active channels

**Interaction effects:**
- Pairs beautifully with the SE Asian cyberpunk aesthetic — bioluminescent tropical tech
- The EM emission mechanic becomes literally visible: glow = noise = detection risk. The player can *see* that their network is "too bright"
- Conflicts slightly with terrain readability — rice terrace tiles already have visual detail, and colored glow overlays may obscure terrain type
- The heatmap mode in the Inspector is a natural companion to the "context window chart" (sparkline of context fill) — heatmap shows where information flows, chart shows where it accumulates

---

## Paradigm 3: The Switchboard — Minimap-Style Network Topology Panel

**Philosophy:** Don't visualize hooks on the battlefield at all. Instead, dedicate a UI panel to showing the network topology as a schematic diagram — like a network monitoring dashboard. The battlefield stays clean; the topology is a separate layer.

**How it works:**

*Plan screen:* The channel map panel (already locked as "read-only auto-generated summary") is expanded into a full network topology view. Units are represented as labeled icons arranged in their approximate board positions but pulled apart for readability. Channels are drawn as colored lines between them. The panel supports zoom, pan, and hover-to-highlight. When the player edits a hook in the blueprint editor, the topology panel updates in real-time — the new channel connection appears as an animated line snapping into place.

*Sealed watch:* The topology panel shrinks to a corner minimap. Lines pulse when signals travel along them. The panel is passive — no interaction during sealed watch. But it provides a high-level view of network activity: "lots of cyan lines pulsing on the left side" tells the player where information is flowing without them having to scan every unit on the board.

*Inspector:* The topology panel becomes interactive. Click any connection line to see all signals that traveled along it during the battle. Filter by tick range. The panel can switch between "structural view" (all connections) and "activity view" (only connections that carried signals, thickness proportional to signal count).

**Sensory description:** In the plan screen's right sidebar, below the blueprint editor, sits a rectangular panel with a dark background. Five unit icons are arranged roughly matching their board positions — a cyan eye (scout) at the top, a gold diamond (relay) in the middle, a red sword (striker) at the bottom. Between them, thin lines trace the channel connections: a cyan line from scout to relay labeled "recon-net," a gold line from relay to striker labeled "threat-fwd." The lines are Bézier curves that avoid crossing when possible, with gentle arcs. When you hover a channel name in the blueprint editor, the corresponding line in the topology panel glows brighter and gains a dashed animation flowing in the signal direction. During sealed watch, this panel becomes a minimap in the bottom-right corner, about 120×120 pixels. The unit icons are smaller but still recognizable. Active signal lines flash their channel color in rhythm with the tick clock — each tick, lines that carried signals pulse once, then dim. In the Inspector, the panel expands to half the sidebar. Lines grow thicker with traffic: a channel that carried 47 signals is a bold highway; one that carried 2 is a whisper-thin thread. Hovering reveals a tooltip: "recon-net: 47 signals, 12 unique payloads, avg latency 2.1 ticks."

**The TikTok clip:** Split screen — the board on the left showing units moving and fighting, the topology panel on the right showing the network light up in sync. Every battle event has a corresponding network pulse. The viewer realizes: the action on the left is *caused* by the signals on the right. The game is happening in both views simultaneously.

**Strengths:**
- Keeps the battlefield visually clean — no wires, no glow, just units and terrain
- The topology panel can show information that would be unreadable on the board (channel names, signal counts, latency stats)
- Scales perfectly to any number of channels — the panel can be scrolled, zoomed, filtered
- Teaches real network monitoring skills — the panel resembles tools like Grafana, Datadog, network topology dashboards
- The "structural vs. activity" toggle in Inspector is a powerful analysis tool
- Accessible: the panel can use shapes and patterns in addition to color

**Weaknesses:**
- Splits the player's attention between two views — the board and the panel. During sealed watch, this is especially costly since the player should be watching the battle
- Loses the visceral spatial connection: on the board, you can SEE that the scout and the striker are 4 tiles apart and the signal has to cross that distance. In the panel, they're just icons connected by a line
- The "minimap during sealed watch" is competing for precious screen real estate with the tick clock and context bars
- Less cinematic — the topology panel is functional but doesn't create the "wow" moments that on-board visualization does
- Requires the player to learn a secondary visual language (the panel's icon and line conventions) on top of the board's visual language

**Interaction effects:**
- Works best when the board has OTHER visual information to display (terrain effects, perception radii, tag markers)
- Pairs well with the Inspector's analytical focus — the topology panel IS an analytical tool
- Conflicts with the "sealed watch = emotional" design goal. An analytical panel during the emotional phase undermines the two-act debrief structure
- The locked channel map panel spec suggests this approach was already considered, but limiting it to "read-only auto-generated summary" may have been intentional — keeping it small prevents it from competing with the blueprint editor

---

## Paradigm 4: The Lightning Flash — Signals as Momentary Events, Not Persistent Connections

**Philosophy:** Don't show wires at all. Don't show topology. Only show the moment of signal delivery — a flash of light from sender to receiver that appears and vanishes within the tick. The network is invisible until it acts.

**How it works:**

*Plan screen:* No signal visualization. The blueprint editor shows hook configurations as text/icons, and the channel map panel shows the structural connections, but the board itself shows nothing — just units at spawn points. The player must build a mental model of the network from the configurations alone.

*Sealed watch:* When a hook fires, a lightning bolt (colored line, jagged, bright) flashes from the sender to the receiver and fades within 0.4 seconds. The bolt originates at the sender's tile, strikes the receiver's tile, and leaves a brief afterimage. Multiple simultaneous signals create a web of lightning that appears and vanishes in a single moment — like a camera flash illuminating the network for one frame. Between signals, the board shows nothing. The network is invisible.

*Inspector:* The scrubber reveals signals as static lightning bolts frozen at their moment of delivery. Scrubbing forward plays the bolts as a flipbook — the player can see the rhythm and pattern of signal delivery across ticks. An "overlay all signals" toggle shows every signal in the battle simultaneously as a dense web of faint lightning, creating a "long exposure" photograph of the network.

**Sensory description:** The board is clean. Units move. Terrain is clear. Nothing suggests that information is flowing between agents. Then tick 7 hits: the scout spots the enemy. CRACK — a cyan lightning bolt snaps from the scout to the relay, bright enough to cast a faint shadow on the tiles it crosses. It's gone in a quarter second, leaving a ghostly afterimage that fades over the next half second. The relay processes. Tick 8: CRACK CRACK — two gold bolts snap simultaneously from the relay to two strikers. The triple-flash sequence tells the story in less than two seconds: spotted → relayed → mobilized. In quiet ticks, the board is peaceful. In combat ticks, it's a lightning storm. The contrast between silence and violence is dramatic.

**The TikTok clip:** A calm board. Units positioned. Then chaos erupts — a cascade of colored lightning bolts crisscrossing the board in a single tick, followed by every unit snapping to action simultaneously. The lightning reveals the network like a camera flash in a dark room — you see everything for one instant, then it's gone.

**Strengths:**
- Maximum dramatic impact — the contrast between silence and signal is powerful
- The board stays clean 90% of the time — terrain, units, tags are all clearly readable
- Signals feel like EVENTS, not infrastructure — each flash is memorable and distinct
- The "long exposure" overlay in Inspector creates beautiful diagnostic art
- The lightning metaphor maps directly to the EM emissions mechanic — each bolt IS a detectable emission. More bolts = more noise = more vulnerability
- Incredibly TikTok-friendly — the visual of a "lightning storm of coordination" is instantly shareable

**Weaknesses:**
- The player cannot see the network topology during sealed watch. They have to remember or infer the structure from the flashes. This makes debugging mid-battle impossible (though the sealed watch has no tools by design, so this may be fine)
- Flash timing is critical: 0.4 seconds in a 1-second tick means the flash is over before the player might notice it. At 2x speed (0.5s ticks), the flash would be nearly subliminal
- Multiple overlapping bolts in the same tick can be confusing — which went where?
- Signal latency (multi-tick travel) is invisible: a 3-tick signal chain appears as three separate flashes, not as a single signal traveling
- Beginners may not connect the lightning to their hook configurations — "why did that flash happen?" requires understanding the hook system
- No persistent visual = no passive learning. The player doesn't absorb the network shape just by watching

**Interaction effects:**
- Perfect for the sealed watch's "emotional first, analytical second" design. During sealed watch, you FEEL the signals without analyzing them. During Inspector, you trace them meticulously
- Conflicts with teaching goals in Missions 1-4: if the player can't see the network, they can't learn from watching it
- Pairs well with audio design — each flash can have a crackling sound effect at the channel's pitch, creating an audio landscape of signal activity
- The "long exposure" mode creates emergent art that players would screenshot and share — community gallery potential

---

## Paradigm 5: The Subway Map — Schematic Channel Lanes Along Grid Edges

**Philosophy:** Draw signal channels as permanent colored lanes that run along the edges of the grid (between tiles, not through them). Signals travel along these lanes like trains on subway tracks. The lanes are always visible, creating a readable infrastructure layer.

**How it works:**

*Plan screen:* When the player configures hooks, channel lanes appear as colored strips running along tile edges. A "recon-net" cyan lane might run along the north edge of row 3 from column B to column F, connecting a scout at B3 to a relay at F3. Lanes route automatically using shortest-path algorithms, preferring to run along grid edges and making right-angle turns at corners. Where multiple lanes share an edge, they stack vertically (like subway lines running parallel). Each lane is 3 pixels wide with a 1-pixel gap between parallel lanes. The player can manually reroute lanes by dragging waypoints.

*Sealed watch:* Lanes are permanently visible at 40% opacity. When a signal travels, a bright segment moves along the lane from sender to receiver, advancing one tile per tick. This makes signal latency directly readable: a scout at A1 sending to a relay at A4 has a bright cyan segment that takes 3 ticks to arrive, and you can watch it travel one tile each tick, like watching a subway car on a transit map. The bright segment is the "train" — the lane is the "track."

*Inspector:* The lanes persist. The scrubber controls which "trains" are visible. A cumulative heat overlay mode thickens lanes proportionally to total traffic — busy channels become 6-pixel highways; dormant channels become 1-pixel threads. The inspector also shows "station" markers at each unit on the lane, with tooltip showing arrival/departure counts.

**Sensory description:** The board acquires a subtle infrastructure layer, like the printed circuit traces on the back of a PCB. Between the rice terrace tiles of Mission 1, thin colored lanes weave along the grid edges — a cyan lane connecting the scout's position to the relay, a gold lane from relay to striker. The lanes have a slight embossed quality, like grooves carved into the terrain, with a dim inner glow. When a signal fires, it's unmistakable: a bright, saturated segment appears at the sender's position on the lane and begins sliding forward. One tile per tick. It passes through each intermediate tile with a tiny flash at each transition point. When it arrives at the receiver, the segment dissolves into the receiver's tile with a soft splash of color, and the unit's context bar gains a new pip. The moving segment looks like a capsule in a pneumatic tube — contained, purposeful, trackable.

**The TikTok clip:** Time-lapse of a full battle with the subway map visible. As the battle progresses, lanes light up with traveling segments creating a living transit system. The final frame freezes on the cumulative heatmap — the player's information architecture rendered as a glowing subway diagram. Caption: "This is what your AI's nervous system looks like."

**Strengths:**
- Signal latency is PERFECTLY communicated. One tile per tick is visible, trackable, countable. The player can literally count tiles to predict when a signal arrives
- The "subway map" metaphor is universally understood — tracks, trains, stations
- Lanes don't overlap with units or terrain — they run along grid EDGES, preserving tile readability
- The infrastructure-permanence creates a sense of investment: "I built this network"
- Scales well: parallel lanes along the same edge stack neatly
- The cumulative heatmap is a beautiful and informative diagnostic tool
- Teaches real concepts: message passing, network latency, routing, bandwidth

**Weaknesses:**
- Right-angle routing on an 8×8 grid can create very long paths for diagonally-connected units (A1 to H8 = 14 segments vs. 7 diagonal). This exaggerates latency visually
- With many channels and many units, the lane stacking along popular edges creates visual bulk — an edge with 5 parallel lanes is 15+ pixels wide, competing with tile art
- Automatic lane routing algorithms need to be deterministic (locked: deterministic tick scheduler) and produce readable results — suboptimal routes are visually confusing
- The "subway map" aesthetic may conflict with the SE Asian cyberpunk visual style (metro maps feel sterile/Western)
- Manual rerouting adds complexity to the plan phase — is it worth the player's time?
- The bright traveling segments can distract from unit actions happening simultaneously

**Interaction effects:**
- The lane infrastructure maps directly to the real-world concept of message buses and event channels
- Conflicts with the "sealed watch = no tools" principle only if manual rerouting is possible during watch (it shouldn't be)
- Pairs well with the Into the Breach visual clarity ethos — information is spatially precise and countable
- The lane-stacking creates a visual proxy for channel congestion: an edge crowded with lanes IS a potential communication bottleneck, teaching the player about network topology optimization
- Works beautifully with isometric perspective — lanes can follow the tile edges diagonally, creating a depth effect

---

## Paradigm 6: The Hybrid — Progressive Disclosure Across Screens

**Philosophy:** Different visualization paradigms for different screens, matched to each screen's purpose. This acknowledges that the same information serves different needs at different moments.

**Recommended hybrid configuration:**

| Screen | Primary Visualization | Why |
|--------|----------------------|-----|
| **Plan** | Subway Map (Paradigm 5) | Infrastructure planning needs permanence and precision. The player is building the network — they should see it as infrastructure |
| **Sealed Watch** | Lightning Flash (Paradigm 4) + subtle Pulse Wires (Paradigm 1) | The emotional phase needs drama. Lightning for active signals, faint dashed wires for topology |
| **Inspector** | Full Pulse Wire (Paradigm 1) + Heatmap toggle (Paradigm 2) + Topology Panel (Paradigm 3) | The analytical phase needs every tool. Let the player switch between visualization modes |

**How the transitions work:**

When the player hits EXECUTE, the Plan screen's subway map lanes animate: the rigid right-angle lanes curve into organic Bézier wires (Paradigm 1), the colored infrastructure softening into a living network. This transition takes 0.5 seconds and serves as the visual "bridge" between planning and watching.

During sealed watch, the faint Bézier wires provide topology awareness while lightning flashes provide drama. The wires pulse subtly in time with the tick clock — a gentle brightness oscillation that gives the network a "breathing" quality.

When the battle ends and the Inspector opens, the wires solidify, gaining thickness proportional to traffic. A toolbar appears offering view toggles: "Wire View" (Paradigm 1), "Heatmap" (Paradigm 2), "Topology" (Paradigm 3). The default is Wire View with traffic-weighted thickness.

**Sensory description:** The experience of watching a signal chain across the three screens becomes a narrative arc. In Plan, you see the rigid cyan lane of "recon-net" running along the grid edges from your scout spawn to your relay. Clean, precise, architectural. You hit EXECUTE. The lane softens into a curved wire, the grid edges releasing it into free space. The sealed watch begins. Faint dashed cyan line connecting scout and relay. Tick 3: the scout detects an enemy. CRACK — a cyan lightning bolt blazes along the wire's path, illuminating it for a split second. The wire itself flashes bright, then returns to its subdued state. The signal's arrival at the relay is marked by the relay's context bar gaining a new cyan pip. In the Inspector afterward, you scrub to tick 3. The wire is now solid, and a frozen cyan dot sits halfway between scout and relay (signal in transit). You click it: "Signal: enemy_spotted, Source: SCOUT-A, Destination: RELAY-B, Channel: recon-net, Payload: {type: enemy_striker, position: D5}, Tick Sent: 3, Tick Arrived: 4."

**Strengths:**
- Each screen uses the visualization paradigm best suited to its purpose
- The transition animations create visual continuity across screens
- Progressive disclosure: Plan shows structure, Watch shows drama, Inspector shows data
- The player naturally learns three "reading modes" for the same network, building multi-perspective understanding
- The view toggles in Inspector let the player find their preferred analysis style

**Weaknesses:**
- Three different visualization systems means three things to learn, three things to implement, three things to maintain
- The transition animations add complexity to the rendering pipeline
- Risk of "mode confusion" — the player might expect the Plan view's lane visualization during sealed watch and be disoriented when it changes
- The hybrid approach makes it harder to develop a single, iconic visual identity for the game's networking. "Robot Uprising is the game with the ___" — what fills the blank?

---

## Player Journeys

### Journey: Maya, 16, Plays Minecraft Redstone, First Strategy Game

**Context:** Mission 3 (hooks tutorial). Has played two missions learning context and rules. First time configuring hooks. Using Paradigm 6 (Hybrid).

**Minute 0:00 — The Hook Tutorial Boot Log**
Maya reads the boot log: "SUBSYSTEM: REACTIVE HOOKS — ONLINE. Your agents can now talk to each other. When something happens to one agent, it can broadcast a signal to all agents listening on the same channel. Think of channels like redstone frequencies — name one, and any agent tuned to that channel hears everything broadcast on it."

She smiles — she knows exactly what this means. In Minecraft, she's wired comparators to detect furnace output and trigger piston doors. This is the same thing with a different skin.

**Minute 0:30 — First Hook Configuration**
The workbench shows her scout's blueprint. Below the skills and rules sections, a new section: HOOKS. Two empty dashed-outline slots. She clicks the first slot. A configuration panel opens: TRIGGER (icon grid with 5 icons — eye, skull, inbox, crosshair, gear) → CHANNEL (text field). She clicks the skull icon (ON_THREAT). The text field blinks. She types "danger" and presses Enter.

On the board preview (left side), a subtle change: a thin coral lane appears along the grid edge from the scout's spawn point, extending outward in all directions — waiting for a listener. A tooltip appears: "Channel 'danger' created. No listeners yet."

**Minute 1:00 — Wiring the Second Agent**
She clicks her striker's blueprint. In the CONTEXT CONFIG section, a new toggle has appeared: LISTEN: [danger]. She toggles it on. Instantly, the board preview updates: the coral lane now has a destination — it routes from the scout's position to the striker's position along the grid edges, with tiny arrow markers showing the signal direction. A soft chime plays — the "connection established" sound.

Maya stares at the board. She can see the lane. She traces it with her eyes: scout → turn → turn → striker. She counts the tiles. Three tiles apart, so... "that signal's gonna take time to get there, isn't it?" she murmurs. She's already intuiting signal latency from the visual alone.

**Minute 1:30 — First Execute**
She hits EXECUTE. The lanes melt into curved wires (the plan-to-watch transition). The tick clock starts. Ticks 1-4: quiet. The faint dashed coral wire pulses gently. Nothing fires. Tick 5: the scout's perception radius touches an enemy. CRACK — a coral lightning bolt snaps from scout to striker along the wire path. Maya gasps. The bolt is bright, jagged, unmistakable. The striker's context bar gains a coral pip. Tick 6: the striker moves toward the enemy's last known position.

"IT WORKED!" Maya shouts. She didn't just configure a hook — she SAW the signal travel. The redstone circuit equivalent just fired.

**Minute 3:00 — Inspector Discovery**
In the Inspector, she scrubs back to tick 5. The coral wire is solid now, with a frozen dot on it. She clicks the dot. The signal detail panel opens: "Channel: danger, Trigger: ON_THREAT, Payload: {enemy at E4}." She traces the chain: "Scout saw enemy → fired 'danger' hook → striker received on tick 6 → striker moved toward E4 on tick 7." The decision trace confirms: "Rule 2: IF danger signal in context THEN move toward signal source."

She gets it. She sees the whole chain. She's already thinking about adding a relay in the middle to compress the data.

**UI Annotations:**
- Hook slot (blueprint editor): Dashed outline rectangle, 120×40px, icon + channel name when configured
- Trigger icon grid: 5 icons in a row, 32×32px each, highlight on hover with tooltip
- Channel text field: 140px wide, auto-complete from existing channels, coral color-coded once named
- Board lane (plan): 3px colored strip along grid edge, with 4px arrow markers every 2 tiles
- Lightning bolt (watch): Jagged polyline, 4px stroke, channel color, 0.4s duration, leaves 0.2s afterimage
- Signal dot (inspector): 8px circle, channel color, clickable, tooltip on hover

---

### Journey: Daniel, 34, Software Engineer, Factorio Veteran, Mission 7

**Context:** Mission 7 (command agent introduction). Has 6 units with 4 channels. Experienced with the hook system. Using Paradigm 6 (Hybrid).

**Minute 0:00 — The Spaghetti Problem**
Daniel opens the plan screen for Mission 7. He has 6 units: 2 scouts, 2 strikers, 1 relay, 1 command. Four channels: "recon-net" (cyan), "threat-fwd" (gold), "engage-cmd" (coral), "reroute" (magenta). The board preview shows a web of colored lanes along the grid edges. It's... dense. Lanes stack 3-deep along the E column edge. He can trace each one, but it takes effort.

He opens the channel map panel (bottom of sidebar). The topology view shows the same network as a clean schematic: two scout icons at top, lines converging on the relay, relay connecting to command, command fanning out to strikers. Labels on each line. This is readable — the abstracted view makes the architecture clear.

"This is my event bus," Daniel thinks, recognizing the pattern from his day job. Two publishers (scouts), one subscriber/republisher (relay), one orchestrator (command), two consumers (strikers).

**Minute 1:00 — Adding the Command Agent's Hooks**
The command agent has 6 hook slots — more than any other unit. Daniel configures them:
1. ON_RECEIVE (from "threat-fwd") → send on "engage-cmd" — forward threat intelligence to strikers
2. ON_RECEIVE (from "recon-net") → send on "reroute" — update relay routing based on scout data
3. ON_SKILL (reassign fires) → send on "engage-cmd" — notify strikers of role changes

As he configures each hook, the topology panel updates in real-time. New lines appear, labeled with the channel names. After configuring hook 3, the topology panel shows the command agent as a hub with 4 connections — the central node of the entire network. He hovers over it: "COMMAND-A: 3 hooks configured, 6 slots total, 3 channels subscribed, 2 channels publishing."

The board preview lanes have grown denser. But the topology panel stays clean because it's schematic, not spatial.

**Minute 2:30 — Execute and Watch the Network**
He hits EXECUTE. The lanes soften into wires. Tick 1: scouts begin patrol. Tick 4: Scout-A spots enemies. CRACK — cyan bolt from Scout-A to relay. 0.5 seconds later, the relay compresses. CRACK — gold bolt from relay to command. The command processes on tick 6: CRACK CRACK CRACK — three bolts simultaneously from command to both strikers (coral "engage-cmd") and back to the relay (magenta "reroute"). For one instant, the board is a web of colored lightning centered on the command agent.

Daniel watches with Factorio eyes. He's reading throughput. "The relay is the bottleneck — everything goes through it. If it dies, the scouts can't reach command. I need a redundant path." He's already thinking about Mission 8's architecture.

**Minute 4:00 — Inspector Deep Dive**
In the Inspector, he clicks the topology panel. It shows traffic-weighted connections. The relay→command line is thick — 23 signals. The command→striker lines are thinner — 8 signals each. But the command→relay "reroute" line is nearly invisible — only 2 signals all battle.

"My reroute hook barely fired," he mutters. He switches to the heatmap view. The tiles around the relay glow hot gold — heavy information throughput. The command position glows with overlapping colors. The scout positions are cool cyan — they broadcast but receive little. The strikers barely glow — they're pure consumers, acting on commands without sending back.

He toggles "overlay all signals" — the long-exposure view. Every signal from the entire battle appears as a faint lightning bolt. The composite image reveals the network's skeleton: a dense cluster of lines between scout→relay→command, branching out to strikers. The topology IS the strategy.

**UI Annotations:**
- Channel map panel: 200×300px sidebar panel, dark background, unit icons 24×24px, channel lines with labels
- Traffic-weighted lines (inspector): Stroke width 1-8px based on signal count, tooltip on hover
- Heatmap toggle: Pill button in inspector toolbar, "Wire | Heatmap | Topology"
- Long-exposure overlay: Activated by checkbox "Show all signals," renders all signals at 15% opacity
- Hub tooltip (topology): Shows hook count, slot usage, channel subscriptions/publications

---

### Journey: Liam, 52, Retired Teacher, Never Played a Strategy Game, Mission 2

**Context:** Mission 2 (rules tutorial, pre-hooks). No hooks configured yet. But this is his first time seeing the BOARD and needs to understand that units will eventually be connected. Using Paradigm 6 (Hybrid).

**Minute 0:00 — A Clean Board**
Liam opens Mission 2. The board shows two pre-placed units: a scout and a striker. No hooks. No channels. The board is pristine — checkerboard tiles with corner tick marks, axis labels A-H and 1-8. The units sit on their tiles with tiny context bars at the bottom. No wires. No lanes. No glow.

He breathes a sigh of relief. It's not overwhelming. It looks like a small chess board with two pieces.

**Minute 0:30 — The Rules Tutorial**
The boot log teaches rules: "IF enemy in sight THEN move away." Liam drags the condition and action into the rule slot. He hits EXECUTE. The scout patrols, spots an enemy, evades. Simple. No communication between units — each acts alone based on its own perception.

**Minute 1:00 — The Isolation Problem**
But the striker doesn't know about the enemy. It stands idle because it can't see far enough. Liam watches for 15 ticks as the scout evades beautifully but the striker never engages because it never learns about the threat. The scout and striker are in the same army but might as well be on different planets.

The mission debrief says: "Your scout detected 4 threats. Your striker engaged 0. Next mission: learn how to connect them."

**Minute 1:30 — The Preview of Hooks**
In the debrief, a preview animation plays: the same mission, but now a faint dashed cyan line appears between the scout and striker. When the scout spots the enemy, a cyan dot travels along the line. When it reaches the striker, the striker moves. The animation is simple, slow, and narrated: "With hooks, your scout can TELL your striker what it sees."

Liam watches the dot travel. He nods. "Like passing a note in class," he says. The visual metaphor is immediately clear because it's spatially grounded — the note travels through space, takes time, and arrives at a specific destination.

He's not overwhelmed because he hasn't been asked to configure anything yet. He's just seen what hooks LOOK like. The visual vocabulary has been seeded.

**UI Annotations:**
- Preview animation (debrief): Simplified board, 2 units, 1 wire, 1 traveling dot, narration text at bottom
- Wire in preview: Thicker than normal (4px vs 2px), slower dot travel (2 seconds vs 0.3), labeled "Signal: enemy spotted"
- Debrief text: "Your scout and striker couldn't communicate. Next mission: hooks."

---

### Journey: Priya, 28, Twitch Streamer, 200+ Hours, Mission 10 (Final Boss)

**Context:** Full factory-vs-factory battle. 12 units, 8 channels, complex multi-hop signal chains. Expert player. Using Paradigm 6 (Hybrid). Streaming to 400 viewers.

**Minute 0:00 — The Architecture**
Priya's plan screen shows a dense network. She has three "tiers" of communication:
- **Tier 1 (perception):** 3 scouts broadcasting on "eyes-north," "eyes-south," "eyes-flank"
- **Tier 2 (processing):** 2 relays compressing and filtering, forwarding on "intel-cmd"
- **Tier 3 (command):** 1 command agent orchestrating 3 strikers via "strike-alpha," "strike-bravo," and 2 specialists via "hack-priority"

The board preview shows 8 colored lanes weaving through the grid. The topology panel shows a clean three-tier pyramid. Her chat sees both views on her stream layout — board on the left, topology panel enlarged on the right.

"Chat, look at this topology," she says, pointing at the pyramid. "Three-tier pub-sub architecture. Scouts publish, relays aggregate, command decides, strikers execute. If the enemy takes out my relay tier, the whole thing collapses. But watch — I've got redundancy built in."

She hovers over the relay positions. Both are connected to "intel-cmd." "Two relays, same output channel. If one dies, the other still feeds command. Redundant consumers." Chat types "REDUNDANCY QUEEN" in all caps.

**Minute 2:00 — The Lightning Storm**
She hits EXECUTE. Mission 10 is dense — 20 ticks of setup, then combat explodes. Tick 21: all three scouts spot enemies simultaneously. CRACK CRACK CRACK — three colored bolts fire from three positions. Cyan, teal, lime — one per scout channel. The bolts converge on the two relays. Half a second of silence. Tick 22: the relays compress. CRACK CRACK — two gold bolts from relays to command. Tick 23: the command processes. CRACK CRACK CRACK CRACK CRACK — five bolts fan outward from command to three strikers and two specialists. The board erupts in a starburst of colored lightning centered on the command position.

Her chat explodes with "NEURAL ACTIVATION" memes. The visual of a three-tier cascade resolving in three ticks — perception → processing → action — is exactly the agentic AI architecture she designed, made visible.

**Minute 5:00 — The Inspector Analysis for Chat**
After the battle, she opens the Inspector and switches to heatmap view. "Chat, look at the heat distribution." The relay positions glow gold-hot — the network's throughput bottleneck. The command position shimmers with overlapping colors — the decision hub. The scout positions are cool single-color — pure producers. The striker positions barely glow — pure consumers.

She toggles to the long-exposure view. "THIS is my architecture." The composite shows a perfect information funnel: wide at the scouts (dispersed perception), narrowing through relays (compression), funneling through command (decision), spreading to strikers (execution). The shape is a diamond — wide at top (perception), narrow in middle (processing), wide at bottom (action).

"That's literally a transformer architecture," a CS student types in chat. "Attention heads → compression → MLP → output."

**UI Annotations:**
- Stream layout: Game window with enlarged topology panel as second monitor view
- Three-tier cascade: 3-tick signal chain visible as three sequential waves of lightning
- Long-exposure overlay: Diamond-shaped composite image, screenshot-worthy
- Heatmap gradient: Cool blue (low traffic) → warm amber → hot white (high traffic)

---

## Comparable Games & Reference Implementations

### Factorio Circuit Networks
Factorio uses colored wires (red/green) connecting buildings. The wires are always visible, drawn as thin lines between connection points. Signals are invisible — you can only see current values by hovering entities. Community mods like **Circuit Visualizer** add animated signal flow. **Lesson for Robot Uprising:** Persistent wires are good for plan phase; animated flow is essential for understanding timing. Factorio proves that even 2-color wires create rich systems. The community demand for visualization mods proves that players WANT to see signal flow, not just structure.

### Gladiabots
Gladiabots' AI editor uses a node graph with explicit connections. During execution, lines drawn from each bot to their action target provide real-time debugging. Selected bots show their AI graph with green (succeeded) and red (failed) highlights. The developer spent 90% of development time on UI. **Lesson:** Real-time debugging visualization (which node matched, which path was taken) is essential for player comprehension. The "translucent = not traversed, opaque + checkmark = succeeded" pattern is directly applicable to Robot Uprising's Inspector.

### Unreal Engine Blueprints
Blueprints use color-coded Bézier curve wires between nodes. Key UX patterns: reroute nodes for organization, left-to-right flow, comment boxes with color grouping. The known problem: spaghetti graphs at scale. Solutions include collapsible sub-graphs, spatial organization, and color coding by data type. **Lesson:** Wire visualization WILL become spaghetti at scale. Sub-graph abstraction (which Robot Uprising achieves via the topology panel) is essential.

### Oxygen Not Included
ONI uses overlay modes — toggle between pipe view, wire view, gas view. Each overlay strips the visual down to one system. The community modded in flow direction arrows and color-painted pipes. **Lesson:** Mode-switching (toggling between visualization layers) is a proven pattern for managing visual complexity. The Inspector's view toggles follow this pattern.

### Into the Breach
Into the Breach's core principle: "sacrifice cool ideas for the sake of clarity every time." Enemy intentions are telegraphed with absolute precision. Every piece of information is spatially grounded and immediately readable. **Lesson:** Robot Uprising's hook visualization must be equally clear. If a signal is traveling from A to B, the player must be able to see, at a glance, where it came from, where it's going, and when it will arrive.

---

## Cross-Paradigm Comparison Matrix

| Dimension | Pulse Wire | Heatmap Glow | Switchboard | Lightning Flash | Subway Map | Hybrid |
|-----------|-----------|-------------|-------------|----------------|-----------|--------|
| **Clarity (1 channel)** | ★★★★★ | ★★★★ | ★★★★ | ★★★ | ★★★★★ | ★★★★★ |
| **Clarity (6+ channels)** | ★★★ | ★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★ |
| **Latency visibility** | ★★★ | ★★★★ | ★★ | ★ | ★★★★★ | ★★★★ |
| **Dramatic impact** | ★★★ | ★★★★ | ★★ | ★★★★★ | ★★★ | ★★★★★ |
| **Beginner friendliness** | ★★★★ | ★★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ |
| **Expert depth** | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★★ |
| **Clean battlefield** | ★★★ | ★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★★ |
| **Screenshot/TikTok** | ★★★ | ★★★★★ | ★★ | ★★★★★ | ★★★★ | ★★★★★ |
| **Implementation cost** | Low | Medium | Medium | Low | High | Very High |
| **Accessibility** | ★★★ | ★★★★ | ★★★★★ | ★★★ | ★★★★ | ★★★★ |

---

## Discovered Aspects

Exploring hook visualization revealed several new aspects that need their own analyses:

1. **3.10b — Signal latency legibility:** How does the player learn and predict multi-tick signal travel times? The core tension between spatial distance (tiles apart) and temporal distance (ticks of latency). How each visualization paradigm communicates "this signal hasn't arrived yet."

2. **3.10c — Channel color assignment and palette management:** With up to 8 channels, how are colors assigned? Auto-assignment vs. player choice. Color-blind accessible palettes. What happens when the player names a channel — does the color appear immediately? The palette exhaustion problem.

3. **3.10d — Wire routing algorithms for the subway map paradigm:** Automatic path-finding along grid edges, handling crossings, parallel lane stacking, manual waypoints. The Bézier curve vs. right-angle debate for different screens.

4. **3.10e — EM emission visualization:** Hooks create detectable EM noise (locked). How is this visualized? Is it a separate overlay or integrated into the hook visualization? The relationship between "signals you can see" and "signals the enemy can detect."

5. **3.10f — Visualization density scaling across the 10-mission arc:** Mission 1 has 2 units, 0 channels. Mission 10 has 12+ units, 8+ channels. The visualization must scale gracefully. At what point does each paradigm break down? What progressive disclosure gates match the campaign's complexity ramp?
