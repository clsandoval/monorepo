# 4.22 — Act 2 Tool Introduction Sequence

**Aspect:** 4.22 — Act 2 tool introduction sequence: the order in which Act 2 tools appear during the materialization and what the sequence communicates about priority; gold diamond first (primary diagnostic) vs. scrubber first (navigation) vs. signal genealogy last (expert); materialization as compressed onboarding arc; does tool order affect which tool players reach for first?

**Related:** 4.04b — Two-Act Debrief Structure; 4.04a — Debrief as Debugger; 4.16 — Signal Genealogy Visualization; 4.13 — Latency Visualization; 4.03 — Buffer Visualization

---

## The Core Question

Phase 4 of the seal break — "The Materialization" — takes approximately two seconds and assembles the Act 2 analytical interface piece by piece. The current locked spec describes a specific ordering: timeline scrubber first, gold diamond second, false pivot markers third, signal genealogy toggle fourth, expanded agent inspector fifth, buffer state detail sixth. But ordering is a design choice with consequences. The sequence of tool appearance is a **compressed onboarding arc** — it teaches the player what's important by showing it first, what's secondary by showing it second, and what's expert-level by showing it last. The first tool that appears is the first tool the player's eye tracks to. The last tool to materialize carries the implicit message: "You'll need this eventually, but not yet."

This analysis explores three candidate orderings and their effects on player behavior, learning curves, and diagnostic habits.

---

## The Design Variables

### The Tool Inventory

Six analytical elements materialize during Phase 4. Each has a distinct function and cognitive weight:

1. **Timeline scrubber** — A horizontal bar at the bottom of the board, marked at regular tick intervals. The foundational navigation tool. Without it, no other tool is useful because the player cannot move through time.

2. **Gold diamond** — A small amber pip on the timeline at the pivot tick, with a brief radiance pulse. The "start here" marker. It tells the player where the outcome was determined.

3. **False pivot grey markers** — Smaller grey circles on the timeline at dramatic-but-non-decisive moments. Counter-evidence markers. They say: "This looked important but wasn't."

4. **Signal genealogy toggle** — A button in the top-right that transforms the battlefield into a network graph. The most complex tool. It requires understanding of channels, signal chains, latency, and relay forwarding to interpret.

5. **Expanded agent inspector** — The compact Act 1 portraits grow, diagnostic rings expand to full display. The click-to-inspect gateway that opens the debugger panel (Zone B).

6. **Buffer state detail** — Opaque fill indicators become granular, showing individual context window slots in agent portraits. The fine-grained data layer.

### The Ordering Principle

The materialization takes ~2 seconds. At 0.8 seconds for the first element and staggered 200-250ms gaps for subsequent elements, the player's eye has time to register each tool arriving. This is not simultaneous — it's sequential, like instruments joining an orchestra one by one. The sequence creates a visual melody: bass (foundation) then melody (purpose) then harmony (depth).

---

## Ordering A: "The Navigator" — Scrubber First

**Sequence:** Timeline scrubber → gold diamond → false pivots → expanded inspector → buffer detail → signal genealogy

**Philosophy:** Navigation before diagnosis. The scrubber is the tool that makes all other tools useful. Without temporal navigation, the gold diamond is a static marker, the inspector shows a frozen state, the signal genealogy is a snapshot. By presenting the scrubber first, the sequence says: "Your first job is to move through time."

### The Visual Choreography

**T+0.0s:** The timeline scrubber assembles from the bottom edge of the board, sliding upward into position. It builds left-to-right: first the track (a thin dark bar, #1A2A3A, spanning the full board width), then tick marks appearing in rapid succession like a ruler being drawn, then the current-position playhead (a bright white vertical line) snapping to the final tick.

**T+0.8s:** The gold diamond materializes on the scrubber — not fading in, but crystallizing. A brief particle effect: tiny amber specks converge on the pivot tick's position, coalescing into the diamond shape over 200ms, then a radiance pulse expands outward (a concentric ring of amber light, 40px radius, fading over 300ms). The diamond settles to a steady warm glow, softly pulsing every 2 seconds.

**T+1.1s:** False pivot grey markers appear simultaneously — small grey circles popping into existence at their timeline positions with a 100ms scale-up animation (0% → 100% size). A thin grey connecting line briefly appears between each false pivot and the gold diamond, then fades — visually linking them as "not this, not this... THIS" before the connections dissolve.

**T+1.3s:** Agent portraits in the bottom tray expand. The compact Act 1 portraits (32px) grow to diagnostic size (48px) over 200ms. The diagnostic rings — previously showing only a simple amber fill arc — segment into individual slots, each slot boundary line appearing like the hour marks on a clock face materializing. The ring sectors are now individually colored: bright teal for used-in-decision, dim gray for present-but-not-consulted, pulsing amber for eviction-candidate.

**T+1.5s:** Buffer state detail resolves. The opaque fill indicators on agent portraits dissolve into granular slot views — like a blurred image snapping into focus. Each context window slot becomes individually visible: a tiny rectangle showing content-type icon, source label, and age badge. The transition feels like adjusting a microscope — the data was always there, now it's legible.

**T+1.8s:** Signal genealogy toggle slides in from the top-right corner of the board. The button appears as a ghost outline (30% opacity), then solidifies over 200ms. Its icon — three interconnected dots forming a triangle with directional arrows between them — draws itself stroke by stroke, like a pencil sketch becoming ink. The button settles at full opacity with a subtle border glow (the same teal as the network graph lines it will produce).

### Why This Ordering

The Navigator sequence follows a **spatial-first, semantic-second** hierarchy. The scrubber gives the player agency before it gives them meaning. "You can move" comes before "here's where to look." This mirrors how people explore physical spaces: you walk around first, read the signs second.

The gold diamond arriving second means the player has already registered the scrubber as "the thing I interact with" before the diamond appears on it. The diamond is then contextualized as a feature *of* the scrubber rather than an independent element. This is subtle but important: it trains the player to think of the timeline as the primary interface, with annotations layered on top.

Signal genealogy arriving last sends a clear message: this is the expert tool. By the time it appears, the player has already registered five other tools. The genealogy toggle materializes in a different screen zone (top-right, away from the bottom-anchored timeline), reinforcing its separation from the core tools. Players who are still learning the Inspector will ignore it. Players who are ready for it will notice it arriving and think: "Oh, there's more."

---

## Ordering B: "The Compass" — Gold Diamond First

**Sequence:** Gold diamond (on blank timeline) → timeline scrubber (around diamond) → false pivots → buffer detail → expanded inspector → signal genealogy

**Philosophy:** Purpose before navigation. The gold diamond answers the first question every player has after the seal breaks: "What happened? Where was the moment?" By showing the answer first — before the tool that navigates to it — the sequence says: "Here is what matters. Now here's how to get there."

### The Visual Choreography

**T+0.0s:** On the bare board (no timeline yet), the gold diamond materializes in mid-air at the bottom edge — floating at the position where the timeline will eventually sit, but with no scrubber beneath it. The diamond appears with its full crystallization effect: amber particles converge, the shape solidifies, the radiance pulse expands. For 0.8 seconds, the diamond hovers alone — a solitary golden beacon against the dark bottom edge of the board. It is the only new element on screen. The player's eye is pulled to it irresistibly.

**T+0.8s:** The timeline scrubber materializes *around* the diamond, assembling outward from the diamond's position. The track extends left and right simultaneously from the diamond's location, tick marks appearing in both directions like the ruler is being measured from the pivot outward. The playhead snaps to its current position. The effect is: the timeline grows around the diamond, not the other way around. The diamond was first. The timeline serves it.

**T+1.2s:** False pivot grey markers pop in at their positions, same as Ordering A.

**T+1.4s:** Buffer state detail resolves — the microscope-focus transition from opaque fills to granular slots.

**T+1.6s:** Agent portraits expand to diagnostic size. The ring segmentation animation plays.

**T+1.8s:** Signal genealogy toggle slides in from top-right.

### Why This Ordering

The Compass sequence follows a **meaning-first, mechanism-second** hierarchy. It answers the emotional question ("what happened?") before providing the analytical tool ("now navigate there"). This is pedagogically aggressive: it tells the player that the gold diamond is the most important element in the entire Inspector, and that everything else exists to serve the investigation it initiates.

The timeline growing *from* the diamond is the key visual innovation. It communicates a causal relationship: the pivot point defines the timeline, not the other way around. This is subtly different from Ordering A, where the diamond is an annotation on the timeline. Here, the timeline is a navigation system built around the diamond. The metaphor shifts from "a ruler with a mark on it" to "a compass needle pointing to true north, with a map drawn around it."

Buffer detail arriving before the expanded inspector inverts the "container before contents" logic. The player sees the data resolution improve (buffer fills become slot-level detail) before the diagnostic rings expand. This creates a bottom-up learning path: notice the data, then notice the tool that structures it.

---

## Ordering C: "The Crescendo" — Simple to Complex

**Sequence:** Buffer detail → expanded inspector → timeline scrubber → false pivots → gold diamond → signal genealogy

**Philosophy:** Familiarity before novelty. The player already knows what buffer fill looks like from Act 1. Start with the thing they recognize, refine it, then introduce progressively alien tools. The gold diamond arriving near the end — not first — makes it a revelation, not a given.

### The Visual Choreography

**T+0.0s:** Buffer state detail resolves on the already-visible agent portraits. The opaque fill arcs sharpen into granular slot views. This is the gentlest possible introduction: nothing moves, nothing slides in, nothing appears in a new location. Something the player was already looking at simply becomes more detailed. The microscope-focus transition takes 400ms.

**T+0.4s:** Agent portraits expand. The compact views grow to diagnostic size. Diagnostic rings segment. This is the second familiar element becoming more capable — the portraits were there in Act 1, now they're bigger and richer. Two elements in, nothing has appeared that wasn't already on screen.

**T+0.8s:** Timeline scrubber assembles from the bottom edge. Left-to-right construction. This is the first genuinely *new* element — the first thing that wasn't present during Act 1. Its appearance marks the shift from "refining what you had" to "giving you new tools."

**T+1.2s:** False pivot grey markers appear on the timeline. A momentary distraction — the player glances at them, registers "markers on the timeline," files them as secondary.

**T+1.5s:** The gold diamond materializes. Because it arrives after the timeline and the false pivots, it has a context that the other orderings lack: the player has already seen the grey circles and is now watching a *different* marker appear — brighter, warmer, pulsing. The contrast between the grey (muted, small, static) and the gold (warm, radiant, alive) is sharpened by their proximity in the sequence. The diamond's radiance pulse plays against a field of grey markers, making its significance unmistakable through pure visual contrast rather than primacy.

**T+1.8s:** Signal genealogy toggle slides in, same as other orderings.

### Why This Ordering

The Crescendo sequence follows a **familiarity-first, novelty-last** hierarchy. It addresses a specific player anxiety: the transition from Act 1 (where you only watched) to Act 2 (where you must analyze) can be overwhelming. By starting with elements the player already recognizes — buffer fills they were already watching, portraits they were already glancing at — the Crescendo eases the transition. "Nothing is changing dramatically. The things you know are just getting more detailed. Now here's a new tool. And another. And the most important one."

The gold diamond arriving fifth — near the end — means it functions as a climax rather than a starting point. The player has already absorbed four other tools. Their eye is moving around the screen, registering the new landscape. Then the diamond appears, and its visual treatment (warm amber against a field of cool greys and teals) makes it the sensory peak of the entire sequence. The radiance pulse, arriving after 1.5 seconds of relatively subtle animations, is the loudest visual event in the materialization. It says: "Everything you just saw? This is what it's for."

The risk: delayed gratification. Players who are impatient after the seal break want to know WHERE to look immediately. Making them wait 1.5 seconds for the gold diamond — while buffer detail and inspector expansion play out — might feel sluggish. The Crescendo assumes the player is willing to absorb the tools before receiving the directive. This works for contemplative players; it might frustrate action-oriented ones.

---

## Interaction Effects: What the Sequence Teaches

### The Primacy Effect

Cognitive psychology's primacy effect: people remember and prioritize the first thing they encounter. The first tool in the materialization sequence is the tool players will reach for first — not because of any instruction, but because it entered their awareness first.

- **Navigator (scrubber first):** Players reach for the timeline. They scrub. Their first instinct is to move through time, exploring the match non-linearly. They develop a "seek" habit — jumping around the timeline looking for moments that feel important.

- **Compass (diamond first):** Players reach for the gold diamond. They click it. Their first instinct is to go directly to the pivot tick and understand the decisive moment. They develop a "target" habit — going straight to the known-important moment.

- **Crescendo (buffer detail first):** Players inspect the nearest unit's buffer. They hover over slots, reading context window contents. Their first instinct is to examine data, not navigate or target. They develop an "examine" habit — studying the state at whatever tick they happen to be on.

### The Recency Effect

The last tool in the sequence is the one that lingers in working memory when the player begins interacting. Signal genealogy appears last in all three orderings because it is consistently the most complex tool. But the second-to-last tool varies, and the recency effect influences what players reach for after their first interaction:

- **Navigator:** Buffer detail is second-to-last. After scrubbing to a tick, the player's next instinct is to look at buffer contents — a productive combination.

- **Compass:** Expanded inspector is second-to-last (in the original spec ordering). After clicking the diamond, the player's next instinct is to click a unit — again, a productive combination.

- **Crescendo:** Gold diamond is second-to-last. After examining buffer detail, the player notices the diamond and clicks it — discovering the pivot. The Crescendo creates a mini "aha" moment: the player was looking at data, then the diamond says "look HERE specifically."

### The Anchor Tool

Whichever tool appears first becomes the player's **anchor tool** — the one they return to when confused, the one they trust most, the one that frames their understanding of the entire Inspector. Over many debriefs, this anchor shapes the player's analytical personality:

- **Scrubber-anchored players** think temporally. They ask: "What happened at tick 25?" They explore by scanning the timeline.

- **Diamond-anchored players** think causally. They ask: "What caused the outcome?" They start at the pivot and trace backward.

- **Buffer-anchored players** think structurally. They ask: "What was this unit thinking?" They start with individual agent states.

All three are valid analytical approaches. The question is which one the game should train by default.

---

## Player Journeys

### Journey: Dara, 27, Mobile Game Player

**Context:** Mission 3, second attempt. Dara lost her first attempt because her scout wandered into an enemy striker's range. She's watching the sealed replay of attempt 2, hoping the rule change she made (adding "if threat detected → evade" as Rule 1) worked.

**Ordering experienced: Navigator (Scrubber First)**

**Minute 0:00 — The Seal Breaks**
The SEALED bar dissolves. Amber-gold behind it — a win. Dara exhales. The resolution beat plays: three ascending notes, then silence. She stares at the amber bar, processing the relief. She didn't know she was holding her breath.

**Minute 0:04 — The Materialization Begins**
The timeline scrubber assembles from the bottom of the board. Dara's eyes drop from the amber result bar to the bottom edge, tracking the left-to-right construction. Tick marks appear like a measuring tape being unrolled. She sees the playhead sitting at the final tick. Her hand moves to the keyboard — she already wants to press the left arrow.

**Minute 0:05 — The Diamond Appears**
A golden pip crystallizes on the timeline. The radiance pulse catches her attention — a brief ring of amber light expanding outward. She doesn't know what it means yet, but she notes its position: about two-thirds of the way along the timeline. "Something happened there," she thinks.

**Minute 0:06 — The Rest Materializes**
Grey markers pop in on the timeline. Agent portraits expand. Buffer slots resolve. The signal genealogy button slides in from the top-right. Dara barely registers these — her attention is still on the scrubber and the diamond.

**Minute 0:08 — First Interaction**
Dara presses the left arrow key. The board rewinds one tick. She presses it again. And again. She's scrubbing backward from the end, watching her units un-move. This is the scrubber-first habit: navigation as first instinct. She doesn't click the diamond. She doesn't click a unit. She scrubs.

**Minute 0:20 — Finding the Moment**
She scrubs back to roughly where the diamond is. The playhead aligns with the gold pip. The board shows the state at the pivot tick. Her scout is at D4. An enemy striker is at E5. She sees the scout's buffer ring showing teal — context window used in a decision. She clicks the scout.

**Minute 0:22 — The Inspector Opens**
Zone B fills with the scout's state at the pivot tick. The context window view shows 6 slots: slot 1 has "ENEMY@E5 — threat" with a bright teal background (used in decision), slot 2 has "PATROL waypoint B3" in dim gray (present but unused). The decision trace reads: ACTION: evade → C3 / RULE 1: "if threat in range → evade" [MATCHED]. The rule she added worked. Dara grins.

**Minute 0:35 — The Learning Moment**
She scrubs to the tick before the pivot. Slot 1 is empty — the threat hasn't been detected yet. She advances one tick. Slot 1 fills: "ENEMY@E5 — threat" appears with a white flash animation (new entry). Rule 1 evaluates. The scout evades. She has traced the exact moment her design decision saved the unit. She presses right arrow to watch the next few ticks: the scout reaches the relay at C3, the relay forwards the threat data, the striker receives it and moves to engage. The chain worked.

**Minute 1:00 — Noticing the Genealogy Toggle**
Dara notices the signal genealogy button in the top-right. She doesn't click it. She's satisfied with what the scrubber and inspector showed her. The genealogy button sits unused, a promise for a future debrief when she needs deeper network-level analysis. The scrubber-first ordering gave her a satisfying diagnostic path without requiring the most complex tool.

**UI Annotations:**
- Timeline scrubber: bottom edge, full board width, dark track with white tick marks, bright white playhead, gold diamond at pivot tick
- Gold diamond: 8px amber rhombus, radiance pulse on materialization, soft 2s breathing pulse at rest
- Agent portraits: bottom tray, expanded from 32px to 48px during materialization, diagnostic rings with segmented slot indicators
- Signal genealogy toggle: top-right corner, 32x32 button, ghost-to-solid materialization, teal border glow

---

### Journey: Marcus, 34, Software Engineer

**Context:** Mission 6, first attempt. Marcus has been eagerly awaiting the factory introduction (Mission 5 unlocked it). He built a complex three-blueprint architecture: scouts feed relays, relays compress and forward to strikers. The match was a loss — his factory produced units in the wrong order and the strikers arrived too late.

**Ordering experienced: Compass (Gold Diamond First)**

**Minute 0:00 — The Seal Breaks**
Crimson wash behind the dissolving SEALED bar. Loss. The descending note plays. Marcus is already thinking: "Where did it go wrong?" He barely registers the emotional beat. He's in diagnostic mode before Act 2 even begins.

**Minute 0:02 — The Diamond Appears Alone**
The gold diamond crystallizes at the bottom of the board — hovering in empty space, no timeline beneath it. The amber particles converge. The radiance pulse expands. Marcus's eyes lock onto it. There is nothing else to look at. The diamond is alone against a dark edge. He thinks: "Tick... 18? 20?" He tries to read the diamond's position, estimating where it sits relative to the board's width.

**Minute 0:03 — The Timeline Grows Around It**
The timeline scrubber extends outward from the diamond's position — the track growing left and right simultaneously, tick marks appearing in both directions. Marcus watches the ruler materialize around the golden anchor point. The number "T22" appears beneath the diamond as the tick marks reach it. "Tick 22," he confirms. The playhead snaps to the final tick, far to the right of the diamond.

**Minute 0:04 — The Rest Materializes**
False pivots pop in. Buffer detail resolves. Portraits expand. Signal genealogy slides in. Marcus registers these peripherally. His attention is already committed: he's going to click the diamond.

**Minute 0:05 — First Interaction**
Marcus clicks the gold diamond. The playhead jumps to tick 22. The board snaps to show the state at that tick. His factory has produced two scouts and one relay — but no strikers. The enemy has already pushed to the center of the board. Marcus immediately sees the problem: the production queue prioritized scouts over strikers, and by tick 22 the enemy has map control with no striker to contest it.

**Minute 0:07 — Tracing the Cause**
He clicks his factory unit on the board. The inspector opens in Zone B, showing the production queue at tick 22: Scout → Scout → Relay → Striker. The queue visualization shows the first striker is three production cycles away. "I front-loaded scouts," Marcus mutters. He doesn't need the signal genealogy. He doesn't need to scrub through earlier ticks. The diamond took him straight to the failure point, and one click on the factory told him why.

**Minute 0:15 — Going Deeper (Optional)**
Satisfied with the primary diagnosis, Marcus notices the signal genealogy toggle. As a software engineer, network graphs are familiar. He clicks it. The battlefield transforms: colored arcs between his two scouts and the relay, showing the communication pattern. He notices something: the two scouts were both broadcasting on the same channel, and the relay was receiving duplicate data. "I need separate channels for each scout," he realizes. The genealogy — the expert tool — revealed a secondary optimization that the simpler tools missed.

**Minute 0:25 — Reconfigure**
Marcus clicks the "Reconfigure" shortcut. The workbench opens. He drags the striker blueprint higher in the production queue. He creates a second channel for the second scout. Two fixes, found in under 30 seconds. The diamond-first ordering gave him the root cause immediately; the genealogy gave him the bonus insight.

**UI Annotations:**
- Gold diamond: materializes alone at bottom edge before timeline exists; crystallization particle effect (200ms converge, 300ms radiance pulse); "T22" label appears when timeline tick marks reach its position
- Timeline scrubber: grows bidirectionally from diamond position; the diamond is the visual origin of the navigation tool
- Factory inspector: production queue rendered as horizontal strip of blueprint icons with cycle-countdown numbers; current production highlighted with pulsing border
- Signal genealogy: battlefield transforms over 300ms — unit sprites shrink slightly, colored arcs draw between connected agents, arc thickness = signal volume

---

### Journey: Yuki, 19, First Strategy Game

**Context:** Mission 2, third attempt. Yuki has only played casual games before. She's struggling with the concept of rules — her scout keeps walking into danger because her rules are in the wrong order. She just changed the rule ordering (move "evade" above "patrol") and is watching the result.

**Ordering experienced: Crescendo (Buffer Detail First)**

**Minute 0:00 — The Seal Breaks**
Amber-gold. A win. Yuki pumps her fist. The ascending tone plays. She smiles at the screen for a full two seconds during the resolution beat. She doesn't know what the analytical tools will show her. She's just happy she won.

**Minute 0:04 — The Buffer Detail Resolves**
The first change is subtle: on the agent portraits she's been watching for the entire sealed replay, the simple amber fill arcs sharpen into individual slots. Each slot becomes a small rectangle with an icon and label. Yuki doesn't immediately notice — she's still looking at the amber result bar. But when her eyes drift back to the portraits, she registers: "Wait, those look different." She leans forward. The scout's portrait now shows 6 distinct slots. Three are filled (bright teal), three are empty (dark). She can read tiny labels: "ENEMY@E5," "WAYPOINT@B3," "PATROL_ROUTE."

**Minute 0:05 — The Portraits Expand**
The portraits grow from 32px to 48px. The diagnostic rings segment. Yuki watches this happen in real time — her eyes widen slightly. The portraits she was casually glancing at during Act 1 are becoming detailed instruments. She hovers over the scout's portrait. A tooltip appears: "SCOUT-A — Context: 3/6 slots used — Click to inspect."

**Minute 0:06 — The Timeline Appears**
The scrubber assembles at the bottom of the board. Left-to-right. Tick marks. Playhead. This is the first element that's genuinely new — not a refinement of something she was already seeing but something that didn't exist in Act 1. Yuki looks at it but doesn't interact yet. "A timeline," she thinks. "I can rewind?"

**Minute 0:07 — The Grey Markers and the Diamond**
False pivot grey markers pop in. Yuki doesn't know what they mean. Then the gold diamond crystallizes — and against the backdrop of grey circles, the contrast is stark. The amber radiance pulse catches her eye. The diamond is warmer, brighter, more alive than anything else on the timeline. Yuki's cursor drifts toward it.

**Minute 0:08 — The Signal Genealogy Toggle**
Slides in from the top-right. Yuki doesn't notice it at all. Her attention is on the diamond.

**Minute 0:09 — First Interaction**
Yuki clicks the scout's portrait — not the diamond, not the scrubber. The Crescendo ordering primed her to interact with the portraits first (they were the first things that changed). The inspector panel opens in Zone B. She sees the context window view: 6 slots, 3 occupied. The decision trace shows: ACTION: evade → C3 / RULE 1: "if threat in range → evade" [MATCHED] / RULE 2: "if waypoint → patrol" [SKIPPED — higher rule matched].

**Minute 0:15 — The Aha Moment**
Yuki reads "SKIPPED — higher rule matched" and something clicks. The rule ordering matters. Evade is Rule 1 now (she just changed it). If it were still Rule 2, patrol would have matched first, and the scout would have walked into the enemy. The inspector is showing her *why* her change worked — not just that it worked, but the mechanism. She doesn't need the gold diamond or the signal genealogy. The buffer-first ordering led her to examine the nearest unit, which led her to the rule trace, which taught her how rule priority works.

**Minute 0:30 — Noticing the Diamond**
Now curious about the timeline, Yuki clicks the gold diamond. The playhead jumps to the pivot tick. The board shows a moment she remembers from the sealed watch — when the scout evaded and the enemy walked past. "Oh, that's what the gold thing means," she says. The diamond confirms what she already found through unit inspection, reinforcing the lesson from a different angle.

**Minute 0:45 — Done**
Yuki clicks "Next Mission." She never touched the signal genealogy toggle. She never used the false pivot markers. She learned one thing deeply (rule priority) through the tool that was presented first (buffer/portrait detail). The Crescendo ordering kept her in familiar territory and let the complex tools wait.

**UI Annotations:**
- Buffer detail resolution: existing portrait arcs sharpen into individual slot rectangles (400ms focus transition); no spatial movement, only detail increase
- Portrait expansion: 32px → 48px over 200ms; diagnostic ring segments materialize like clock hour marks appearing
- Gold diamond: arrives at T+1.5s, 1.5 seconds after first visual change; radiance pulse contrast heightened by preceding grey marker appearance
- Signal genealogy toggle: arrives last (T+1.8s), entirely unnoticed by novice player

---

### Journey: Tomás, 42, Factorio Veteran

**Context:** Mission 8, attempt 4. Factory-vs-factory stage. Tomás has 12 units on the board against 15 enemy units. His architecture is sophisticated: two scout channels feeding separate relays, a command agent reassigning striker priorities mid-battle. He lost this attempt because his command agent's context window overloaded at tick 38.

**Ordering experienced: Navigator (Scrubber First)**

**Minute 0:00 — The Seal Breaks**
Crimson. Loss. Tomás is already mentally replaying the match. He saw the command agent stun (the sparking/jittering visual during Act 1) and he knows that's where it broke. He doesn't need the resolution beat — he's through it before the silence ends.

**Minute 0:04 — Materialization**
The scrubber appears. The gold diamond crystallizes at tick 38 — exactly where he expected. He nods. False pivots at ticks 15, 27, 33. Agent portraits expand: twelve units, a wall of diagnostic rings. Buffer detail resolves. Signal genealogy slides in.

**Minute 0:06 — First Interaction: Genealogy**
Tomás ignores the scrubber, ignores the diamond, and clicks the signal genealogy toggle. He's not a novice following the materialization's guidance — he's an expert who already knows what he wants. The battlefield transforms into a network graph. Twelve agent columns, colored arcs flowing between them. The density bar at the top shows a massive spike at ticks 35-38 — white-hot signal volume.

**Minute 0:10 — Diagnosing the Overload**
Tomás zooms in on the spike region. He sees the problem immediately: both scout channels and the relay forwarding channels all converged on the command agent at tick 35. The command's 14-slot context window received 9 new signals in 3 ticks. The eviction policy couldn't keep up. He traces the arcs: SCOUT-A → RELAY-A → COMMAND, SCOUT-B → RELAY-B → COMMAND, SCOUT-A → RELAY-B → COMMAND (a cross-channel leak — SCOUT-A's hook was broadcasting on both channels).

**Minute 0:20 — Root Cause Found**
SCOUT-A has a hook configured to broadcast on "alpha-net" AND "beta-net." The second channel was a leftover from an earlier attempt's configuration. One errant hook slot, broadcasting duplicate signals, doubling the command agent's inbound signal volume. Tomás didn't need the scrubber. He didn't need the diamond. He needed the genealogy — the tool that arrived last, the "expert" tool — and he went straight to it because he already understood the system deeply enough to know where to look.

**Minute 0:25 — Reconfigure**
Tomás removes the second hook slot from SCOUT-A. Clean architecture: one scout per channel, no cross-talk. He re-executes.

**UI Annotations:**
- Signal genealogy: the first tool an expert reaches for despite being last to materialize; network graph mode shows 12 swim lanes with ~80 arcs across 60 ticks; density bar spike at ticks 35-38 is the diagnostic entry point
- Cross-channel leak: rendered as arcs from SCOUT-A reaching two different relay lanes, both forwarding to COMMAND lane — visually obvious as "too many arrows converging"
- Command agent overload: the COMMAND lane shows a color shift from teal to amber to red as signals pile up, matching the context bar behavior from the sealed watch

---

## Strengths and Weaknesses

### Navigator (Scrubber First)

**Strengths:**
- Gives immediate agency — the player can DO something (scrub) before being asked to THINK about something
- The scrubber is the lowest cognitive load tool — it doesn't require understanding, just arrow keys
- Natural "explore then target" flow matches how most people learn spaces
- The gold diamond arriving second is contextualized as a feature of the timeline, not a separate element

**Weaknesses:**
- Novice players may scrub aimlessly without knowing where to go — the diamond arrives 0.8 seconds later, but that's 0.8 seconds of "I have a tool but no direction"
- Emphasizes navigation over comprehension — scrubbing through ticks is less analytically productive than examining a specific moment deeply
- May train "scanning" behavior (scrubbing back and forth) rather than "targeting" behavior (going to the important moment)

### Compass (Diamond First)

**Strengths:**
- Answers the player's most urgent question immediately: "Where was the moment?"
- The diamond appearing alone — before the timeline — creates a visual drama that makes the pivot unforgettable
- The timeline growing *from* the diamond communicates their relationship: the diamond defines the timeline, not vice versa
- Most efficient for experienced players who want to diagnose and reconfigure quickly

**Weaknesses:**
- The 0.8 seconds of diamond-without-timeline is a moment where the player sees the answer but can't act on it — this could feel tantalizing or frustrating depending on temperament
- Over-emphasizes the pivot. Some losses have diffuse causes (gradually degrading architecture, not a single decisive tick). The diamond-first ordering trains players to look for "the moment" even when the real issue is systemic
- Less pedagogically gentle — the diamond assumes the player knows what a pivot is and why it matters

### Crescendo (Buffer Detail First)

**Strengths:**
- Gentlest transition from Act 1 to Act 2 — starts by refining familiar elements, not introducing new ones
- Trains examination behavior — players learn to read buffer state and rule traces before learning navigation
- The gold diamond arriving late makes it a climax — its visual contrast against preceding grey markers is maximized
- Best ordering for true novices who would be overwhelmed by timeline + diamond + markers all at once

**Weaknesses:**
- Delays the "where to look" directive — players who want direction must wait 1.5 seconds for the diamond
- The initial buffer detail refinement may go unnoticed by players who weren't closely watching the portraits
- Trains a bottom-up analytical approach (examine state → find patterns) that is slower than top-down (go to pivot → trace backward) for straightforward failures
- The 2-second materialization may feel slow for experienced players on their 30th debrief

---

## The Recommendation: Adaptive Sequencing

The strongest design is not a single fixed ordering but an **adaptive sequence that shifts over the player's career:**

**Missions 1-4 (tutorial):** Crescendo ordering. The player is learning what buffer state and rules mean. Start with the familiar. Let the diamond arrive as a late revelation. Train examination habits.

**Missions 5-7 (factory introduction):** Compass ordering. The player now understands the tools and needs direction. The diamond answers "where to look" immediately. The timeline growing from the diamond teaches the pivot concept through visual causation.

**Missions 8-10 (mastery):** Navigator ordering. The player is an expert. Give them the scrubber first and let them navigate freely. They'll reach for whichever tool they need — diamond, genealogy, buffer inspection — based on their diagnostic hypothesis. The scrubber-first ordering trusts the player's judgment.

This adaptive approach uses the materialization sequence itself as a **meta-tutorial** — the changing order communicates the player's growing competence. "We used to show you where to look. Now we trust you to find it yourself."

---

## Comparable Games

### Into the Breach — Post-Mission Timeline

Into the Breach's debrief is a simple results screen with no replay or diagnostic tools. The game relies on perfect information during gameplay — you don't need to trace what happened because you saw it all. Robot Uprising's Inspector exists precisely because sealed watch deliberately withholds the analytical layer. Into the Breach offers no lesson here on tool ordering, but it does demonstrate that post-mission screens can be minimal without losing engagement — the learning happens during play, not during review. The materialization sequence must justify its complexity by providing insights the sealed watch couldn't.

### Slay the Spire — Post-Combat Card Play History

Slay the Spire's post-combat screen shows cards played, damage dealt, and status effects in a simple chronological list. No ordering variation — it's always the same layout. But the list itself has an implicit ordering: the most recent combat events are at the top, and players scroll down to find earlier moments. This "recency first" approach is closest to the Navigator ordering — the timeline is the navigation tool, and the player explores from "now" backward.

### Chrome DevTools — Tab Ordering

Chrome DevTools presents its diagnostic panels in a consistent tab order: Elements → Console → Sources → Network → Performance → Memory. This ordering follows a rough frequency-of-use hierarchy (most developers start with Elements or Console). Notably, Performance and Memory — the expert tools — are furthest right. This is the Crescendo logic applied to a professional tool: familiar first, expert last. Robot Uprising's materialization sequence is doing the same thing in 2 seconds that DevTools does in a static tab bar.

### Factorio — Research Tree Reveal

When Factorio unlocks a new technology, the research tree panel highlights the newly available nodes while greying out locked ones. The visual language is: "here's what you just gained access to, in the context of everything that exists." The gold diamond's radiance pulse is doing the same thing — highlighting a specific element within a larger interface. Factorio's approach is always "new thing in context" (Compass-like), never "new thing alone" or "context first, then new thing."

---

## Sensory Summary

The materialization sequence is a 2-second symphony of assembly. Regardless of ordering, the sensory register is consistent:

**Visual:** Dark edges of the screen brighten as tools slide in. The dominant motion is convergence — elements arrive from the periphery (bottom edge, top-right corner) and settle into position. The gold diamond's radiance pulse is the visual peak — a warm amber ring expanding and fading, like dropping a stone into still water. The signal genealogy toggle's stroke-by-stroke icon drawing is the most intricate animation — three dots connecting themselves with directional arrows, like a schematic sketching itself into existence.

**Audio:** Each tool's arrival has a subtle mechanical sound — a clean, precise click or slide, like a precision instrument being seated in its mount. The gold diamond's radiance pulse has a soft tone — a single note, mid-register, 200ms, ascending slightly. The signal genealogy toggle has a faint electronic hum that fades in and out, suggesting "network active." The overall audio of the materialization is the sound of a control room powering on: quiet, sequential, purposeful.

**Feel:** The materialization should feel like opening a toolbox. Each tool arrives with deliberate precision — not rushed, not dramatic. The 2-second duration is long enough to register each element but short enough to not feel like waiting. The player's dominant sensation should be: "I have what I need. Let's work."
