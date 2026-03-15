# 6.07b — Portrait-Landscape Orientation Strategy

## Overview

Every time a player picks up their phone, their body makes a decision before their brain does: hold it upright (portrait) or turn it sideways (landscape). That physical gesture — the rotation of a rectangle in space — determines the shape of every UI surface for the next several minutes. For Robot Uprising, a game with three radically different screens (Plan, Sealed Watch, Inspector), this isn't a settings toggle. It's a fundamental design axis that reshapes the entire mobile experience.

The question isn't "portrait or landscape?" It's: **should each of the three screens have its own preferred orientation, and what happens in the transitions between them?**

---

## The Orientation Landscape (Pun Intended)

### The Numbers

- **85% of mobile usage time** is spent in portrait. Users default to one-handed, phone-upright.
- **Strategy games overwhelmingly lock to landscape**: Slay the Spire, Civilization VI, Into the Breach (Netflix), XCOM, most auto-chess variants. The assumption: strategy = wide view = landscape.
- **Auto Chess Legends** was notable specifically because it offered portrait mode — and was praised for it despite being otherwise unpolished. Portrait strategy is an underserved niche.
- **49% of users** prefer one-thumb operation (Steven Hoober research). Portrait enables this; landscape requires two hands.
- **Android 16** (API 36) now requires apps to support all orientations on large-screen devices (≥600dp). Orientation flexibility is becoming a platform expectation, not a luxury.

### The Core Tension

Robot Uprising's three screens have fundamentally different spatial needs:

| Screen | Primary Content | Spatial Demand | Natural Fit |
|--------|----------------|----------------|-------------|
| **Plan** | 8x8 board + workbench editor | Wide: needs side-by-side panels | Landscape |
| **Sealed Watch** | 8x8 board + tick clock + buffer bars | Square: board is the star | Either |
| **Inspector** | Board + timeline scrubber + sidebar analytics | Wide: needs scrubber + detail panels | Landscape |

The board itself is **square** (8x8). A square fits inside both portrait and landscape rectangles — but the surrounding UI (workbench, scrubber, analytics) all want horizontal space. This creates the tension: the board doesn't care, but everything around it does.

---

## Option A: "The Lock" — Landscape-Only

**How it works:** The game locks to landscape orientation on all screens. Period. Like Slay the Spire, Into the Breach (Netflix), Civilization VI mobile. The player rotates their phone when they launch the game and holds it sideways for the entire session.

### Mechanical Details

- **Plan screen:** Board occupies left 55% of landscape viewport. Workbench slides in from right as a 45% panel (matching the desktop split-view spec). On phones narrower than 740px logical width in landscape, workbench becomes a slideable overlay.
- **Sealed Watch:** Board centers in the landscape rectangle. Tick clock spans the full width above. Buffer bars render below each unit. Generous horizontal margins become "breathing room" — dark chrome with subtle circuit-board texture.
- **Inspector:** Timeline scrubber stretches the full landscape width (beautiful — every tick gets a wide column). Click-to-inspect sidebar slides from right, identical to Plan workbench position.

### Sensory Description

The player rotates their phone. The status bar slides to the short edge. The game fills the wide rectangle with the 8x8 board glowing in the center-left, isometric tiles casting tiny shadows to the southeast. The workbench panel on the right has a dark gunmetal background with a subtle vertical grain — like brushed aluminum in a server rack. Channel wiring lines arc from the board, across the panel divide, into hook config fields on the right. The EXECUTE button pulses in the top-right corner, a contained supernova of electric cyan.

### Player Journeys

#### Journey: Ria, 24, Commuter (Manila MRT)

**Context:** Mission 3. First time playing on her phone (usually plays on laptop). Standing on the MRT during rush hour, holding a ceiling strap with her right hand.

**Minute 0:00 — The Awkward Hold**
Ria opens Robot Uprising on her phone. The screen rotates to landscape. She's holding the ceiling strap with her right hand, phone in her left. In landscape, the phone is wider than her palm. She shifts her grip, pinching the phone between thumb and pinky, three fingers bracing the back. The phone wobbles. She can reach the left side of the screen (the board) with her left thumb, but the workbench panel on the right is completely out of reach.

**Minute 0:30 — The Two-Hand Struggle**
The train lurches. Ria needs to configure her Scout's patrol path. She lets go of the ceiling strap, grabs the phone with both hands, taps the Scout on the board. The workbench slides in. She reaches for the rule list — the train jerks, her thumb slips, she accidentally selects the wrong rule. She curses under her breath. The person next to her glances over.

**Minute 1:00 — The Pocket**
The MRT reaches her station. Ria can't pocket the phone without closing the game or rotating it. Landscape phones don't fit in jeans pockets sideways. She closes the app. The session lasted 60 seconds. She didn't finish configuring a single unit.

**Minute 1:30 — Resolution**
On the platform, she reopens the game, finds a column to lean against, and plays with two hands. She finishes Mission 3 in 8 minutes. The landscape layout works fine when she's stationary. But she thinks: "This isn't a commute game."

**UI Annotations:**
- Board: 55% of 812×375 viewport (landscape iPhone 13) = ~446×375px. Each tile = ~47px. Comfortable tap target.
- Workbench: 45% = ~366×375px. Rule rows at 48px tall. Workable but tight.
- One-handed reach: left thumb covers board but not workbench. Right thumb covers workbench but not board.

#### Journey: Dex, 31, Tablet Power User (iPad Mini)

**Context:** Mission 7. Plays exclusively on iPad Mini in landscape. Sitting in a café.

**Minute 0:00 — The Ideal Surface**
Dex props the iPad Mini in landscape on the table, slightly tilted against his coffee cup. The 8.3" screen in landscape gives him a viewport of roughly 1133×744 logical points. The Plan screen's split view is luxurious: the board fills the left half at nearly desktop size, the workbench takes the right half with generous spacing. Channel wiring lines arc across the divider with pixel-perfect clarity.

**Minute 2:00 — The Command Agent**
He's configuring a Command agent with 6 hook slots and 14-buffer context. On the iPad landscape, all 6 hook fields are visible simultaneously without scrolling. The context config's listen/ignore toggles render as a 2-column grid. He drags rules to reorder them — the 48px drag handles feel solid under his fingertip. The ghost Command unit on the board shows its (empty) perception radius as a translucent circle.

**Minute 5:00 — The Inspector Deep Dive**
After a failed battle, Dex enters the Inspector. The timeline scrubber spans the full landscape width — 30 ticks render as wide columns, each big enough to tap precisely. He scrubs to tick 14, taps a Relay unit, and the sidebar reveals its buffer state: 12 slots, 9 filled, the most recent three entries glowing softly. The queue depth chart below shows a clean bar graph with green/amber/red segments.

**Minute 7:00 — Resolution**
Dex redesigns his hook routing and re-executes. The landscape iPad experience is indistinguishable from desktop. He thinks: "This is the way the game is meant to be played."

**UI Annotations:**
- iPad Mini landscape: 1133×744 logical points. Board: ~566×744. Tile: ~66px. Luxurious.
- Workbench: ~567×744. Full desktop-equivalent layout.
- Timeline scrubber: 1133px wide. 30 ticks = ~37px per tick column. Precise tapping.

#### Journey: Tomás, 14, Phone-Only Gamer (Samsung Galaxy A14)

**Context:** Mission 1. First strategy game ever. Playing in bed, phone held above his face.

**Minute 0:00 — The Rotation Prompt**
Tomás opens the game. A prompt says "Please rotate your phone to landscape." He rotates it. The phone is now wider than his face above him. He holds it with two hands, thumbs on the edges. The boot log text starts scrolling — teal monospace on black. He reads: "PERCEPTION SUBSYSTEM... ONLINE."

**Minute 0:45 — The Gravity Problem**
Lying in bed, holding the phone in landscape above his face, his arms get tired after 45 seconds. He rests the phone on his chest, but now he's looking at it at an extreme angle. The isometric tiles distort. He props himself up on a pillow, holds the phone in portrait out of habit — the game rotates to show a "Please rotate" screen with a spinning phone icon.

**Minute 1:30 — The Compromise**
Tomás sits up, crosses his legs, holds the phone in landscape on his knees. This works but feels "like homework." He thinks: "Why can't I just hold it normal?"

**Minute 3:00 — Resolution**
He finishes Mission 1 in landscape. The tutorial was clear, the board was readable. But the physical experience felt rigid. He'd prefer portrait — that's how he holds his phone for everything else.

**UI Annotations:**
- Galaxy A14 landscape: ~780×360 logical pixels. Board: ~429×360. Tile: ~42px. Minimum viable.
- Rotation prompt: centered phone icon with curved arrow, pulsing. Appears for 2 seconds before user action.

### Strengths
- Matches desktop layout 1:1. Minimal redesign. Everything the desktop version does, mobile landscape does at reduced scale.
- The timeline scrubber in Inspector benefits enormously from horizontal space.
- All comparable strategy games use this approach — players expect it.
- Channel wiring lines have room to arc without overlapping.

### Weaknesses
- **Kills casual/commute play.** The #1 mobile gaming context (transit, waiting rooms, standing in line) is one-handed portrait. Landscape-lock excludes it entirely.
- **The bed problem.** Landscape phones are uncomfortable to hold while lying down — arms tire quickly, phone is too wide for relaxed grip.
- **Pocket friction.** Landscape phones don't slide into pockets. Every session requires a conscious rotation → play → rotation → pocket cycle.
- **Slay the Spire's lesson.** Multiple reviewers cited eye strain and touch-accuracy issues with Slay the Spire's landscape-only mobile port. The text was too small, cards were hard to select. Robot Uprising's workbench text (rule conditions, channel names, buffer labels) is even denser.

### Interaction Effects
- **With mobile Plan screen options (6.07):** Option C "The Tray" requires landscape. Options A "The Drawer" and B "The Flip" can work in either orientation.
- **With sealed watch pacing:** Landscape sealed watch has generous margins — room for ambient visual effects, particle systems, circuit-board texturing in the chrome areas.
- **With accessibility (6.08):** Landscape-lock is hostile to one-handed motor-impaired players. Conflicts with switch-access and mouth-stick input methods that work better in portrait.

### Comparable Games
- **Slay the Spire (mobile):** Landscape-only. Widely criticized for small text and fiddly card selection on phones. Reviewers recommend tablets.
- **Civilization VI (mobile):** Landscape-only. Explicitly recommends tablet play.
- **Into the Breach (Netflix):** Landscape-only. Two-step tap-to-select pattern for grid interaction.
- **XCOM (mobile):** Landscape-only. Works well on tablets, cramped on phones.

---

## Option B: "The Unlock" — Portrait-Only

**How it works:** The game locks to portrait orientation. The board stacks above the workbench. Everything scrolls vertically. This is the radical counter-position — designing a strategy game for the way people actually hold their phones.

### Mechanical Details

- **Plan screen:** Board fills the top 45% of the portrait viewport (roughly 375×340px on an iPhone 13). Below it: the workbench as a scrollable panel. The board compresses to 340px wide → each tile is ~42px. Tight but tappable. When editing a blueprint, the board shrinks to a 120px thumbnail in the top-left corner (mirroring the Drawer pattern from 6.07).
- **Sealed Watch:** Board fills the top 55% of portrait. Tick clock renders as a vertical strip on the left edge (pips stacking downward like a thermometer). Buffer bars on units are visible. Below the board: a "battle feed" showing the most recent tick's events as a scrollable log (what happened, in text: "Scout-A transmitted on alarm_north. Striker-B received threat_detected.").
- **Inspector:** Board fills the top 40%. Timeline scrubber renders as a **vertical** strip on the left (ticks stack top-to-bottom, current tick highlighted). Sidebar analytics render below the board as scrollable cards. Queue depth chart renders as a horizontal bar inside a card.

### Sensory Description

The player's phone is upright. The 8x8 board sits at the top of the screen like a crown — isometric tiles gleaming in the SE Asian cyberpunk palette, neon reflections on wet terrace stones. Below the board, a dark panel stretches downward, scrollable, containing the workbench's blueprint editor. The player's thumb reaches up to tap a unit on the board, then scrolls down through the config panel. The EXECUTE button is a persistent floating action button (FAB) in the bottom-right corner, always within thumb reach. The board-to-workbench flow is vertical, like scrolling a feed — the most natural gesture on a phone.

The tick clock in Sealed Watch mode is a vertical thermometer on the left edge: a column of small circles, each one lighting up cyan as its tick fires, then dimming to grey. The current tick's circle pulses. The effect is a descending chain of light, like droplets falling down a pipe.

### Player Journeys

#### Journey: Ria, 24, Commuter (Manila MRT)

**Context:** Same scenario. Mission 3. Standing on MRT, right hand on ceiling strap, left hand holding phone.

**Minute 0:00 — The Natural Hold**
Ria opens Robot Uprising. The game loads in portrait — exactly how she's already holding her phone. No rotation needed. The board glows at the top of the screen. Her left thumb can reach every tile. Below the board, she sees her Scout's blueprint summary: "2 rules, 1 hook, buffer 6/6 listening."

**Minute 0:20 — One-Thumb Config**
She taps the Scout on the board. The blueprint editor slides up from below (Drawer pattern). She scrolls down with her thumb to see the rule list. Drag handles are oversized (56px). She reorders a rule — drags "IF buffer contains threat_detected" above "IF idle" — with a single thumb swipe. The train lurches. Her grip holds. The phone doesn't wobble because it's narrow enough for her palm.

**Minute 0:50 — The Board Peek**
While editing, she swipes the drawer down to peek at the board. The Scout's perception radius pulses on the grid. She confirms the cone covers the chokepoint at D4. Swipes the drawer back up. Back to editing.

**Minute 1:30 — The EXECUTE**
She taps the FAB in the bottom-right corner. EXECUTE. The Sealed Watch begins. The board fills the top of her screen. The tick clock descends on the left edge — pip, pip, pip. Her Scout moves. The Relay compresses a signal. She watches, one-handed, standing on the MRT. A passenger glances at her screen — the isometric pixel art with pulsing neon looks cool.

**Minute 3:00 — Resolution**
The battle ends. Inspector loads — board on top, analytics cards below. She scrolls through the debrief one-thumbed while the train rolls. She finishes the session as she exits at her station. Total time: 3 minutes. She thinks: "This is a commute game."

**UI Annotations:**
- Portrait iPhone 13: 375×812. Board: 375×340 (top). Tile: ~42px.
- Drawer peek: 80px strip at bottom showing blueprint summary. Half-rise: 406px tall.
- EXECUTE FAB: 56px circle, bottom-right, 16px from edge. Always visible.
- Vertical tick clock: 24px wide, left edge, pips at 20px intervals.

#### Journey: Yuki, 29, Bedtime Player (Pixel 8)

**Context:** Mission 5 (factory introduced). Playing in bed, phone held above face.

**Minute 0:00 — The Comfortable Hold**
Yuki lies on her back, phone held in portrait above her face. One hand. The board is at the top of the screen — smaller than landscape would be, but she can see every tile. The production queue renders as a vertical list below the board (not the horizontal conveyor belt of desktop). Blueprint icons stack vertically, each one showing the unit type icon and a cost badge.

**Minute 1:00 — The Factory Dance**
She drags a Relay blueprint up in the production queue — it'll build before the Striker now. The board above shows a ghost Relay appearing at the base. She scrolls down past the queue to the channel map summary: "alarm_north (3 listeners), scout_report (2 listeners)." All legible. All one-thumb reachable.

**Minute 3:00 — The Vertical Scrubber**
After the battle, the Inspector's vertical timeline scrubber feels natural — she scrolls ticks like scrolling a chat. Tap tick 14, tap a unit, see the buffer state. The queue depth chart renders as a horizontal bar inside a card: green-green-amber-amber-red-red-RED. She gets the story instantly.

**Minute 5:00 — Resolution**
Yuki finishes her session, locks her phone, sets it on her nightstand. No rotation needed. The whole experience was vertical — phone to face to sleep. She thinks: "This is my bedtime game."

**UI Annotations:**
- Production queue: vertical list, 64px per blueprint row, drag-to-reorder with 48px handle.
- Channel map: scrollable card below queue, auto-generated, hover (long-press) to highlight wiring on mini-board above.
- Inspector timeline: vertical left strip, 32px wide, ticks at 24px intervals, tap to select.

#### Journey: Hiro, 38, Accessibility User (iPhone SE)

**Context:** Mission 2. Has RSI in right hand, plays exclusively with left thumb in portrait.

**Minute 0:00 — The Reach Map**
The iPhone SE screen is 375×667 — the smallest mainstream viewport. In portrait, the board occupies 375×300 at the top. Tiles are ~37px. Tight, but Hiro's left thumb reaches every tile in the top half. The workbench below is entirely within the natural thumb arc's lower zone. The EXECUTE FAB is in the bottom-right — Hiro stretches slightly but hits it. Everything is reachable one-handed.

**Minute 0:30 — The Comparison**
In landscape, the same phone would be 667×375. The board would be ~367×375 on the left, workbench on the right. Hiro's left thumb could reach the left half (board) but not the right half (workbench). Every config edit would require reaching across the full phone width. In portrait, the same content stacks vertically, and vertical thumb scrolling is Hiro's most comfortable gesture.

**Minute 1:00 — Resolution**
Hiro configures two units, executes, and debriefs — all one-thumbed in portrait. He thinks: "This game gets it."

**UI Annotations:**
- iPhone SE portrait: 375×667. Board: 375×280. Tile: ~35px (minimum viable — consider 2px inner padding reduction).
- Thumb reach analysis: bottom 60% of screen comfortable, top 40% requires stretch. Board at top requires stretch for top rows (A1-A3). Consider: invert board placement for accessibility mode?

### Strengths
- **Commute-ready.** The #1 mobile gaming context works perfectly. One-handed, portrait, quick sessions.
- **The bed problem is solved.** Portrait phones are comfortable to hold above your face.
- **Pocket-friendly.** Phone doesn't need rotation to pocket.
- **Vertical scrolling is phone-native.** Every app on the phone scrolls vertically. The brain expects it.
- **Accessibility-forward.** One-handed, one-thumb play is the default, not an accommodation.
- **Differentiation.** Almost no strategy games offer portrait. Robot Uprising would stand out.

### Weaknesses
- **The timeline scrubber suffers.** A horizontal scrubber is more intuitive for a timeline (left = past, right = future). The vertical alternative works but feels unusual.
- **The board is small.** At 375px wide, tiles are 42px on standard phones, 35px on SE. Fat-finger errors increase. Complex battles with 12+ units become visually crowded.
- **Channel wiring is cramped.** Arcing wiring lines need horizontal space to avoid crossing. In a 375px-wide board, wiring for 4+ channels becomes visual spaghetti.
- **Desktop parity is lost.** The desktop split-view layout doesn't translate. Mobile portrait is a fully separate design system.
- **Inspector analytics are vertically stacked.** Comparing two charts requires scrolling between them instead of seeing them side-by-side. Analytical depth suffers.

### Interaction Effects
- **With Plan screen layout (6.07):** Forces Option A "The Drawer" or Option B "The Flip." Option C "The Tray" is impossible in portrait (no side panel space).
- **With production queue:** The horizontal conveyor belt becomes a vertical list. Loses the "conveyor" metaphor's directionality (left-to-right = build order). Vertical list implies "top = first" which is learnable but less visceral.
- **With sealed watch pacing:** Vertical tick clock is unconventional but creates a unique visual rhythm — ticks "falling" downward like droplets.
- **With onboarding (5.02):** Boot log text scrolls vertically — fits portrait perfectly. The boot sequence was designed for vertical reading.

### Comparable Games
- **Auto Chess Legends:** Portrait-only auto-chess. Praised for the orientation choice despite other flaws. Proved that strategic placement games can work vertically.
- **Clash Royale:** Portrait-only. The most successful mobile strategy game in history. Vertical battlefield, cards at bottom. Proves portrait strategy is commercially viable.
- **Marvel Snap:** Portrait-only card game with board positions. Three-lane vertical layout.

---

## Option C: "The Hybrid" — Per-Screen Orientation (RECOMMENDED FOR DEEP ANALYSIS)

**How it works:** Each of the three screens has a **preferred orientation**, and the game smoothly transitions between them. The player's phone physically rotates as they move between game phases, making the orientation change part of the game's rhythm.

### The Rotation Choreography

| Transition | From | To | Rotation | Physical Gesture |
|------------|------|----|----------|-----------------|
| Planning → Execute | Portrait Plan | Landscape Sealed Watch | 90° clockwise | Player turns phone sideways — "it's go time" |
| Execute → Debrief | Landscape Sealed Watch | Landscape Inspector | None | Same orientation — smooth transition |
| Debrief → Planning | Landscape Inspector | Portrait Plan | 90° counter-clockwise | Player turns phone upright — "back to work" |

### Mechanical Details

- **Plan screen (PORTRAIT):** Board at top, workbench below. The Drawer pattern (6.07 Option A). One-handed thumb editing. This is where the player spends the most time — it should be maximally comfortable. Portrait = comfort.
- **Sealed Watch (LANDSCAPE):** Board fills the center. Tick clock stretches across the top. Buffer bars visible. The wide viewport gives the battle room to breathe. Landscape = spectacle. The rotation itself — turning the phone sideways — becomes a physical metaphor for "launching the attack." You designed the system vertically; now you turn it sideways to watch it run.
- **Inspector (LANDSCAPE):** Timeline scrubber fills the width. Sidebar analytics. This is the desktop-native layout. Landscape = analysis.
- **Rotation transition:** When the player taps EXECUTE, the game doesn't immediately rotate. Instead, a 1-second "launch sequence" animation plays (a radial progress ring around the EXECUTE button fills clockwise). During this second, a gentle haptic nudge (two short pulses) signals "rotate now." If the player rotates, the Sealed Watch loads in landscape. If they don't, the game renders Sealed Watch in portrait with a subtle persistent banner: "↻ Rotate for best view" that fades after 3 seconds.

### Sensory Description

**The rotation moment.** The player has been hunched over their phone in portrait for three minutes, thumb-editing a Command agent's hook routing. They're satisfied. They tap EXECUTE. The button depresses with a meaty click (audio: metallic snap, 80ms). A cyan ring fills clockwise around the button — one full revolution in 800ms. The phone vibrates twice: *bzt-bzt*. The player's wrist twists clockwise. The phone is now landscape. The board expands to fill the wider viewport, isometric tiles stretching to their full resolution. The workbench is gone. The tick clock materializes across the top — 30 empty circles in a horizontal line. The first one fills with cyan light. *Tick.* The battle has begun.

**The return.** After the battle and the Inspector debrief, the player taps "Back to Plan." The screen dims to 40% for 500ms — a breathing pause. Two haptic pulses: *bzt-bzt*. The player rotates to portrait. The workbench slides up from below. They're home. The rhythm is: portrait (think) → landscape (watch) → landscape (analyze) → portrait (think). The rotation is a **ritual**, like opening and closing a book.

### Player Journeys

#### Journey: Ria, 24, Commuter (Manila MRT, Again)

**Context:** Mission 4. She's learned the rotation rhythm. Standing on the MRT, one hand on the strap.

**Minute 0:00 — Portrait Planning**
Ria holds the phone in portrait, one-handed. She's reconfiguring her Relay's hooks — changing the "alarm_north" channel to "alarm_all" to catch signals from both Scout groups. The Drawer is at half-height. She types "alarm_all" — the soft keyboard pushes the drawer up, but the mini-board thumbnail stays visible at the top. She sees the channel wiring update in real-time: two new lines converge on the Relay's position.

**Minute 1:30 — The Ritual**
She taps EXECUTE. The cyan ring fills. *Bzt-bzt.* She lets go of the ceiling strap (the train is stopped at a station). Grabs the phone with both hands. Rotates to landscape. The Sealed Watch loads — board wide and bright, tick clock spanning the top. Passengers are boarding. She watches the battle: tick 1, 2, 3... her Scouts fan out. Tick 7: the first alarm fires. The green flash on the relay. Tick 9: Striker-B receives the forwarded signal, pivots toward the threat. She grins.

**Minute 3:00 — Landscape Analysis**
The battle ends. Inspector loads (still landscape). She scrubs the timeline to tick 7 — taps the Relay — sees the buffer: slot 1 "alarm_north from Scout-A," slot 2 "alarm_south from Scout-C." The channel merge worked. Both alarms arrived. She swipes through the queue depth chart: green all the way. Clean run.

**Minute 4:00 — Return to Portrait**
She taps "Back to Plan." *Bzt-bzt.* She rotates the phone upright with one hand, grabs the ceiling strap again with the other. The Plan screen loads in portrait. She scrolls down to the production queue. Next mission needs a Specialist. She starts configuring.

**Minute 5:00 — Resolution**
The train reaches her station. She pockets the phone (portrait = pocket-friendly). Total session: 5 minutes across two orientations. The rotation felt natural — like shifting gears. She thinks: "Portrait for thinking, landscape for watching. Makes sense."

**UI Annotations:**
- Portrait Plan: 375×812. Board thumbnail when Drawer is full: 120×120 top-left.
- Landscape Sealed Watch: 812×375. Board: ~500×375 centered. Tick clock: 812px wide, 30 ticks.
- Rotation prompt: two haptic pulses + radial fill animation on EXECUTE button. Banner "↻ Rotate for best view" appears if player doesn't rotate within 2 seconds.

#### Journey: Kenji, 42, Factorio Veteran (iPad Air)

**Context:** Mission 8. Factory vs factory. Playing on iPad Air at a desk.

**Minute 0:00 — Portrait Planning on Tablet**
Kenji has the iPad in a case, propped up in portrait orientation. The screen is 820×1180 logical points. The Plan screen is luxurious: the board fills the top half at nearly 820px wide — tiles are 95px, enormous. The workbench fills the bottom half. He can see everything simultaneously without the Drawer pattern — on a tablet in portrait, the vertical split gives both board and workbench ample room.

**Minute 3:00 — The Rotation as Commitment**
He's spent 3 minutes configuring a complex hook network: Scout→Relay→Command→Striker chain with a fallback channel if the Relay dies. He taps EXECUTE. The cyan ring fills. He lifts the iPad from its case, rotates it to landscape, sets it back down. The gesture is deliberate — like slamming down a poker chip. "I'm committed to this design. Let's see if it works."

**Minute 3:30 — Landscape Spectacle**
The Sealed Watch in landscape on iPad Air: 1180×820 logical points. The board fills the center at ~750×820. Tiles are enormous. He can see every buffer bar, every signal flash, every unit icon at a glance. The tick clock spans 1180px — 30 ticks, each pip 35px wide with breathing room between. The battle plays out like a diorama on his desk. He leans forward. Tick 12: his Relay dies. The hook fallback chain fires — Scout-A switches to the backup channel. Tick 14: Striker-B receives the rerouted signal. The flanking maneuver succeeds despite the lost Relay. Kenji whispers "yes" and pumps his fist.

**Minute 6:00 — Landscape Inspector**
He scrubs to tick 12 — the moment the Relay died. He taps the dead Relay: buffer was at 11/12 (nearly full). The last signal it received was a compressed alarm that it tried to amplify and forward before the enemy Striker reached it. He checks the emission overlay: the Relay's amplification was broadcasting at maximum EM — that's how the enemy Striker found it. The cause of death: loudness. He notes this for the next config.

**Minute 8:00 — Return to Portrait**
He taps "Back to Plan," rotates the iPad to portrait, sets it in the case. The Plan screen loads with the same config, but now the dead Relay has a ghost "💀 destroyed in last run" overlay on the board. He redesigns the hook network to use the Relay's "filter" skill to strip unnecessary data before amplifying — less signal bulk, less EM noise. The rotation back to portrait marks the transition from "watching" to "thinking."

**Minute 10:00 — Resolution**
He re-executes with the quieter Relay. It survives to tick 25. The flanking maneuver happens earlier and cleaner. He thinks: "The rotation makes me feel like I'm operating a command center — vertical planning table, horizontal situation display."

**UI Annotations:**
- iPad Air portrait: 820×1180. Board: 820×520 (top). Workbench: 820×660 (bottom). No Drawer needed.
- iPad Air landscape: 1180×820. Board: 750×820 centered. Full spectacle mode.
- Tablet rotation: physical case manipulation = ritual. Heavier than phone rotation.

#### Journey: Amara, 19, Phone-Only Casual (iPhone 12 Mini)

**Context:** Mission 1 tutorial. First strategy game ever. iPhone 12 Mini (360×780 viewport).

**Minute 0:00 — Portrait Comfort**
Amara opens the game. It loads in portrait. She's sitting on a couch, phone in her right hand, idly. The boot log scrolls: "PERCEPTION SUBSYSTEM... ONLINE." Teal text on black. She reads, scrolls, reads. All portrait. Comfortable. She'd probably have closed the app if it had asked her to rotate.

**Minute 1:00 — First EXECUTE**
The tutorial has placed a single Scout on the board. "Tap EXECUTE to deploy." She taps the cyan button. The ring fills. *Bzt-bzt.* A banner appears: "↻ Rotate for best view." She ignores it — she doesn't want to rotate. The Sealed Watch loads in portrait. The board fills the top of the screen, tick clock on the left as a vertical strip. It works. The Scout moves. The ticks fire. She watches. It's not as cinematic as landscape would be, but it's perfectly legible.

**Minute 2:00 — The Optional Rotation**
Mission 2. Same thing. She taps EXECUTE, ignores the rotation prompt. The prompt fades after 3 seconds and doesn't reappear for the rest of the session (respects user preference). Sealed Watch in portrait works fine — the board is slightly smaller, the tick clock is vertical, but every game event is clear.

**Minute 4:00 — The Curiosity Rotation**
Mission 3. She's getting into it. When the *bzt-bzt* happens, she thinks "what the heck" and rotates to landscape. The board expands dramatically — tiles double in visual weight. The tick clock stretches across the top like a movie's timeline. "Whoa," she says. The battle feels more epic. After the battle, she rotates back to portrait for planning. The ritual has been learned.

**Minute 6:00 — Resolution**
By Mission 4, the rotation is automatic. She doesn't think about it. Portrait for configuring, landscape for watching. The game taught her the rhythm without ever forcing it. She thinks: "This feels different from other phone games."

**UI Annotations:**
- iPhone 12 Mini portrait: 360×780. Board: 360×320. Tile: ~40px. Minimum.
- Rotation banner: "↻ Rotate for best view" — 14px text, centered below tick clock, semi-transparent (70% opacity), fades after 3 seconds, suppressed after 2 consecutive ignores.
- Graceful fallback: all three screens must render correctly in both orientations. The "preferred" orientation is suggested, not enforced.

### Strengths
- **The rotation is a ritual.** It creates a physical marker between game phases. Portrait = thinking. Landscape = action. The body participates in the game loop.
- **Each screen gets its ideal layout.** Plan uses portrait's one-handed comfort. Sealed Watch and Inspector use landscape's width.
- **Graceful degradation.** Players who never rotate still get a working game in portrait-only. The hybrid is a suggestion, not a mandate.
- **The TikTok clip.** "Watch this person's phone rotate when they hit EXECUTE" — the physical gesture of commitment is filmable and memeable.
- **Accessibility.** Players who can't rotate (phone in a mount, one-handed, motor impairment) play portrait-only without penalty. Players who want spectacle rotate.
- **The commitment metaphor.** Rotating the phone = "I'm done designing, I'm committed to this architecture." The physical act mirrors the game's sealed-execution model.

### Weaknesses
- **Rotation fatigue.** Every Plan→Execute→Inspect→Plan cycle requires 2 rotations. Over a 30-minute session with 6 cycles, that's 12 rotations. Some players will find this annoying.
- **Gyroscope dependency.** The game needs reliable orientation detection. Cheap phones have imprecise gyroscopes. Lying in bed on your side confuses portrait/landscape detection.
- **Design cost is 2x.** Every screen must render correctly in both orientations (for graceful degradation). This is effectively two mobile UIs.
- **Cognitive load.** The rotation prompt during EXECUTE adds a decision point ("should I rotate?") to an already tense moment. Some players will fumble the rotation and miss the first tick.
- **Tablet on desk.** Tablets in cases don't rotate easily. The ritual works for phones but becomes clunky for propped-up tablets.

### Interaction Effects
- **With haptic vocabulary (6.06a):** The rotation-prompt haptics (*bzt-bzt*) join the haptic vocabulary. Must be distinct from other haptic events (combat, signal delivery, buffer overflow).
- **With sealed watch pacing:** The 1-second launch animation before rotation is a buffer — time for the player to shift grip. If the first tick fires before the player completes rotation, they miss it. The launch animation prevents this.
- **With streamer overlay (6.04d):** Phone rotation is visually dramatic for stream viewers. "Watch the phone turn" is a content moment.
- **With onboarding (5.02):** The boot log in Mission 1 is portrait-only. No rotation until Mission 1's first EXECUTE. The rotation is introduced as a gameplay mechanic, not a setup requirement.

---

## Option D: "The Adaptive" — Player-Chosen, Per-Screen Lock

**How it works:** The game supports both orientations on all screens. In Settings, the player configures their preferred orientation per screen:

```
Orientation Settings:
  Plan Screen:    [Auto] [Portrait] [Landscape]
  Sealed Watch:   [Auto] [Portrait] [Landscape]
  Inspector:      [Auto] [Portrait] [Landscape]
```

"Auto" uses the current physical orientation. The other options lock that screen regardless of phone position.

### Mechanical Details

- **Six layout variants** must exist: Plan-portrait, Plan-landscape, SealedWatch-portrait, SealedWatch-landscape, Inspector-portrait, Inspector-landscape.
- Each variant is fully designed and tested. No "letterboxed" fallbacks.
- The player discovers their preferred combination through play. Some will choose all-portrait, some all-landscape, some hybrid.
- A "recommended" preset (portrait Plan, landscape Watch, landscape Inspector) is the default but can be changed at any time.

### Sensory Description

The Settings panel has a "Display" section with three rows — one per screen. Each row shows the screen name, a tiny preview thumbnail of that screen in the current orientation, and three toggle pills (Auto / Portrait / Landscape). Tapping a pill updates the thumbnail live — the miniature screen rotates, layout rearranges, elements redistribute. It's a satisfying preview animation: the thumbnail is a working diorama of the actual screen layout.

### Player Journeys

#### Journey: Marcus, 55, Power User (Pixel Fold)

**Context:** Mission 6. Has a foldable phone. Plays unfolded (tablet-like, ~7.6" inner display) at home, folded (phone-like, ~5.8" outer display) on the go.

**Minute 0:00 — The Double Life**
At home, Marcus unfolds his Pixel Fold and sets all three screens to "Auto." In the tablet-like 7.6" unfolded mode, the game detects the wide viewport and renders landscape-style layouts in both orientations (the screen is nearly square when unfolded). The Plan screen shows board + workbench side by side regardless of how he holds it.

**Minute 5:00 — The Commute Switch**
On the train, Marcus folds his phone. The outer display is 5.8", portrait-oriented, narrow. The game detects the screen change and switches to portrait layouts. He opens Settings and locks Plan to "Portrait" and Sealed Watch to "Portrait" — he doesn't want to rotate on the train. The Inspector he leaves on "Auto" since he'll debrief later at home.

**Minute 10:00 — Resolution**
That evening, he unfolds the phone again. Plan and Sealed Watch are still locked to "Portrait" from his commute settings. He changes them back to "Auto." He thinks: "This game adapts to my life, not the other way around."

**UI Annotations:**
- Settings: three rows, three pills each. Active pill: cyan fill + white text. Inactive: dark grey fill + grey text.
- Preview thumbnail: 120×80px (landscape) or 80×120px (portrait), live-updating.
- Foldable detection: uses CSS media query `(fold-*)` and/or `screen.availWidth/Height` to detect fold state.

#### Journey: Dr. Reina, 63, Arthritis, Docked Phone

**Context:** Mission 4. Uses a phone dock/stand on her nightstand. The phone never rotates — it's always portrait in the dock.

**Minute 0:00 — The Configuration**
Dr. Reina opens Settings and locks all three screens to "Portrait." She'll never rotate her phone. The game respects this completely — no rotation prompts, no haptic nudges, no banners. Every screen renders in portrait. The Sealed Watch has the vertical tick clock. The Inspector has vertically stacked analytics cards.

**Minute 2:00 — Resolution**
She plays three missions entirely in portrait without ever feeling like she's getting a degraded experience. The vertical Inspector timeline scrubber feels natural to her — she scrolls ticks like scrolling text. She never learns that landscape exists, and that's fine.

**UI Annotations:**
- All-portrait lock: rotation prompt suppressed. Haptic rotation cues suppressed. No "Rotate for best view" banner.
- Vertical Inspector: timeline on left (32px wide), analytics as scrollable cards below board, queue depth chart as horizontal bar in card.

#### Journey: Kai, 16, Streamer (iPad Pro + Desk Mount)

**Context:** Mission 9. Streaming on TikTok from iPad Pro in landscape desk mount. Cannot rotate — the mount is fixed.

**Minute 0:00 — The Lock**
Kai has all screens locked to "Landscape" in Settings. His iPad Pro is in a desk mount, landscape, camera pointed at his face for the TikTok stream. The game fills the 12.9" landscape display. Every screen uses the wide layout. Plan: board left, workbench right. Watch: board center, wide tick clock. Inspector: full-width timeline scrubber.

**Minute 3:00 — The Stream Moment**
He hits EXECUTE. No rotation — the game transitions directly from Plan to Sealed Watch, both in landscape. The launch animation plays (cyan ring fill) but no rotation prompt (landscape lock suppresses it). The transition feels cinematic — one wide screen morphing into another. Chat goes wild when his Relay chain collapses at tick 11.

**UI Annotations:**
- All-landscape lock: transition between screens is a crossfade/morph, no rotation prompt.
- iPad Pro landscape: 1366×1024 logical points. Full desktop-equivalent experience.

### Strengths
- **Maximum player agency.** Every player gets exactly the orientation they want for every screen.
- **Accessibility gold.** Docked phones, mounted tablets, motor-impaired users who can't rotate — all served.
- **Foldable-ready.** The game adapts to Pixel Fold, Galaxy Z Fold, any future form factor.
- **No compromises.** Players who want the hybrid ritual get it (set all to Auto). Players who want all-portrait get it. Players who want all-landscape get it.

### Weaknesses
- **6 layout variants is expensive.** Each must be fully designed, tested, and maintained. QA matrix: 3 screens × 2 orientations × N device sizes = combinatorial explosion.
- **Settings overload.** Casual players don't want orientation settings. The default must be excellent.
- **The ritual is opt-in.** The powerful rotation-as-commitment metaphor only works if the player happens to choose Auto mode. It's not designed into the experience — it's discovered.
- **Testing burden.** Every new feature must work in all 6 layout variants. Development velocity drops.

### Interaction Effects
- **With Playwright testing (locked tech stack):** 6 layout variants × N device sizes = large test matrix. Playwright viewport emulation helps but doesn't replace real-device testing.
- **With onboarding:** First-time players see "Auto" by default. The orientation settings exist in the Settings menu but aren't surfaced during tutorial. The game works out of the box without configuration.

---

## Option E: "The Responsive" — Fluid Orientation with Dynamic Reflow

**How it works:** The game supports both orientations on every screen and responds instantly to physical rotation. There are no locks, no prompts, no settings. The player rotates the phone and the UI reflows in real-time, like a responsive website. Every game screen has two layouts that crossfade as the phone turns.

### Mechanical Details

- **Plan screen portrait:** Board top, workbench below (Drawer pattern).
- **Plan screen landscape:** Board left, workbench right (desktop pattern).
- **Rotation animation:** 200ms crossfade. Elements slide to new positions. The board smoothly scales and repositions. No jarring jump.
- **Mid-edit stability:** If the player is mid-drag (reordering a rule), rotation is suppressed until the gesture completes. The game won't pull the rug out during an active interaction.
- **Sealed Watch:** Both orientations supported simultaneously. Rotating mid-battle doesn't disrupt the tick clock — it smoothly re-renders from horizontal (landscape) to vertical (portrait).

### Sensory Description

The player is editing a rule in portrait. They rotate the phone to landscape. Over 200ms, the board glides from the top of the screen to the left side, expanding horizontally. The workbench panel slides from below the board to beside it on the right. Rule rows maintain their order and content — the text doesn't reflow, just the container repositions. The EXECUTE FAB slides from bottom-right to top-right. Channel wiring lines animate their new endpoints. Everything moves — nothing blinks or cuts. It feels like liquid.

### Player Journeys

#### Journey: Sam, 26, Fidgeter (Galaxy S24)

**Context:** Mission 5. Sam rotates their phone constantly. It's a fidget behavior — they turn the phone while thinking.

**Minute 0:00 — Portrait Start**
Sam opens Plan screen in portrait. Board on top, workbench below. They start configuring a Relay's hooks.

**Minute 0:15 — Unconscious Rotation**
While thinking about which channel to use, Sam absentmindedly rotates the phone to landscape. The UI silently reflows — board slides left, workbench slides right. Sam doesn't consciously notice the change. They continue editing. The hook config field is now to the right of the board instead of below it.

**Minute 0:30 — Back to Portrait**
Sam rotates back while reaching for their coffee. The UI reflows again. Board top, workbench below. No interruption. No prompt. They type "alarm_forward" into the channel field. The wiring line appears on the board — same behavior regardless of orientation.

**Minute 2:00 — The Battle Rotation**
During Sealed Watch, Sam watches the battle in portrait. At tick 8, they rotate to landscape to "see more" — the board expands, the tick clock goes from vertical to horizontal. They watch ticks 9-15 in landscape, then rotate back to portrait when the battle gets less interesting. Every rotation is seamless.

**Minute 3:00 — Resolution**
Sam doesn't think about orientation once. The game just works however they hold their phone. They think nothing — which is the point.

**UI Annotations:**
- Rotation suppression zone: during active touch gestures (drag, long-press), orientation changes are queued until touch-end. Prevents mid-drag layout reflow.
- Animation: 200ms crossfade with spring easing. Elements slide via CSS transform (GPU-accelerated). Board scales via Pixi.js renderer resize.
- Mid-battle safety: if a tick fires during a rotation animation, the tick's visual effects queue and play after the reflow completes (max 200ms delay, imperceptible).

### Strengths
- **Zero friction.** No prompts, no settings, no thought about orientation. It just works.
- **Fidget-friendly.** Players who rotate unconsciously never get punished.
- **Future-proof.** Works with any device, any orientation, any form factor, including foldables, tablets, and devices that don't exist yet.

### Weaknesses
- **Highest engineering cost.** Every UI element must have two positions, two sizes, two layouts, and a smooth transition between them. Pixi.js canvas resize during battle is performance-intensive.
- **Visual instability.** Frequent reflows can feel nauseating or disorienting for some players. The game "never sits still."
- **Accidental rotation.** Lying in bed with auto-rotate on, the phone can flip rapidly between orientations. The game needs a debounce (e.g., ignore rotations < 500ms apart), which adds latency.
- **No ritual.** The rotation-as-commitment metaphor is gone. The phone rotation has no meaning — it's just a display adaptation. The act of turning the phone doesn't mark a phase transition.
- **Testing nightmare.** Must test at every intermediate angle? What about 45 degrees? The game needs clear portrait/landscape breakpoints with a dead zone.

### Interaction Effects
- **With Pixi.js performance:** Canvas resize triggers a full re-render. On low-end phones, this can drop frames during rotation. Must profile: is 200ms enough for Pixi.js to resize + re-render 64 tiles + wiring overlays?
- **With sealed watch integrity:** The sealed watch is designed to be a "no tools" experience. Fluid rotation adds an implicit tool — the ability to change the view by rotating. Does this violate the sealed watch's philosophical constraint?

---

## Cross-Option Comparison Matrix

| Dimension | A: Lock (Landscape) | B: Lock (Portrait) | C: Hybrid | D: Adaptive | E: Responsive |
|-----------|--------------------|--------------------|-----------|-------------|---------------|
| **One-handed play** | ❌ | ✅ | ✅ (Plan only) | ✅ (configurable) | ✅ (in portrait) |
| **Commute-friendly** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Battle spectacle** | ✅ | ❌ | ✅ | ✅ (if landscape) | ✅ (if landscape) |
| **Inspector timeline** | ✅ | ❌ | ✅ | ✅ (if landscape) | ✅ (if landscape) |
| **Engineering cost** | Low | Medium | High | Very High | Extreme |
| **Accessibility** | ❌ | ✅ | ✅ (degraded) | ✅ | ✅ |
| **The ritual** | ❌ | ❌ | ✅ | ⚠️ (opt-in) | ❌ |
| **Foldable support** | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ |
| **Comparable precedent** | Many | Few (Clash Royale) | None (novel) | Some (Genshin) | Web apps |
| **Design cost** | 3 layouts | 3 layouts | 6 layouts | 6 layouts + UI | 6 layouts + animation |
| **TikTok clip** | ❌ (static) | ❌ (static) | ✅ (rotation!) | ❌ | ❌ |

---

## The Transition Animation Design Space

Regardless of which option is chosen, the **transition between Plan→Watch→Inspector** is a design surface. Even in landscape-only, the screen changes when you tap EXECUTE. These transitions deserve attention:

### "The Iris" Transition
A circular wipe centered on the EXECUTE button expands outward, revealing the Sealed Watch behind it. The Plan screen's workbench dissolves into the expanding circle's edge. Feels cinematic, like a camera iris opening.

### "The Board Holds" Transition
The board stays exactly where it is. Everything around it (workbench, menus, chrome) dissolves or slides away. The tick clock materializes above the board. Buffer bars fade in on units. The board is the constant — the context changes around it. This reinforces the board-as-reality metaphor.

### "The Seal" Transition
When EXECUTE fires, a translucent sheet descends over the board from top to bottom — like a glass cover being lowered onto a diorama. The seal effect has a subtle frost-on-glass texture. The workbench disappears behind the descending seal. This visualizes the "sealed" in Sealed Watch — you've sealed your design under glass, and now you can only watch.

### "The Heartbeat" Transition
The screen pulses black once — a single frame of darkness, like a blink — then the Sealed Watch is there. Abrupt. Startling. The battle has begun. No fanfare. This matches the Into the Breach philosophy of crisp, immediate state changes.

---

## New Aspects Discovered

1. **6.07b-i — Rotation debounce and gyroscope reliability:** Technical design for handling unreliable orientation sensors — debounce timing, dead-zone angles, bed-lying disambiguation, and low-cost phone gyroscope fallbacks (accelerometer-only orientation detection).

2. **6.07b-ii — Foldable phone adaptation:** Specific layout strategies for Galaxy Z Fold, Pixel Fold, and future foldables — inner display (tablet-like) vs. outer display (phone-like) transitions, fold-aware CSS media queries, hinge-position detection for "tent mode" and "tabletop mode."

3. **6.07b-iii — The rotation-as-commitment ritual:** Deep analysis of the physical rotation gesture as a game mechanic — parallels to physical board game rituals (flipping a timer, rolling dice), haptic design for the rotation prompt, and whether the commitment metaphor actually increases player investment in their designs.

4. **6.07b-iv — Transition animation vocabulary:** Full specification of Plan→Watch→Inspector screen transitions — iris wipe, board-holds, seal descend, heartbeat blink; animation timing, performance budget, orientation-aware variants, and interaction with the rotation moment.

5. **6.07b-v — Portrait-only competitive viability:** Whether portrait-locked players are at a strategic disadvantage vs. landscape players — Inspector timeline scrubber precision, Plan screen spatial awareness, board legibility — and whether PvP matchmaking should account for orientation.
