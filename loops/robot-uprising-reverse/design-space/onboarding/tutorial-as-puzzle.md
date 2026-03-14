# Onboarding: Tutorial as Puzzle — First Missions as Pure Filter Puzzles

**Aspect ID:** 5.01
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.02 (tutorial as narrative), 5.03 (tutorial as sandbox), 5.04 (complexity ramp), 1.04b (diegetic tutorial documents), 2.20 (asynchronous observation gap), 3.02 (skill acquisition), 4.04a (debrief as debugger)

---

## The Core Idea

The player's first encounter with Robot Uprising is not a lecture, not a cutscene, not a tooltip cascade. It is a **filter puzzle** — a small, self-contained problem where the answer is always the same action: *remove the noise*. The first missions present pre-configured agents whose buffers are clogged with irrelevant observations. The player's only job is to drag things OUT. Remove the wrong signal, and the agent makes a bad decision. Remove the right noise, and the agent snaps to clarity — the scout finds the enemy, the striker hits its target, the relay forwards the critical message.

This is the "Tutorial as Puzzle" paradigm. It teaches the game's deepest truth — **information architecture determines behavior** — through the most primal interaction possible: cleaning up a mess.

### Why Filter Puzzles First

The four-primitive system (skills, rules, hooks, context config) is genuinely complex. A naive tutorial would try to explain all four at once: "Here's what skills are, here's what rules do, here's how hooks connect agents, here's how the buffer works." That's a lecture. The player's eyes glaze. They click through. They learn nothing.

Filter puzzles invert the pedagogy. Instead of teaching the system and then asking the player to use it, you show the system **broken** and ask the player to fix it. The player doesn't need to know how a buffer works — they just need to see that this buffer is full of garbage, and when they remove the garbage, the agent does the right thing. The conceptual understanding comes *after* the tactile understanding. Hands before head.

This is the pattern Baba Is You perfected: the first level doesn't explain that "WALL IS STOP" is a rule you can break. It presents you with a wall you can't pass and word-blocks you can push. You push the word "STOP" out of line, and suddenly the wall isn't a wall anymore. The mechanical lesson (rules are movable) is delivered through a physical action (pushing a block), not through an explanation. The player discovers the rule-system's nature by *touching it*.

Into the Breach does something adjacent: the first island presents puzzles where the optimal solution requires using push mechanics to redirect enemy attacks into each other, rather than trying to kill everything. The tutorial doesn't say "this game is about positioning, not damage." The puzzle's structure makes killing everything impossible and positioning trivial. The lesson emerges from the constraint.

For Robot Uprising, the filter puzzle does the same: the tutorial doesn't say "this game is about information, not combat." The puzzle makes combat irrelevant (it's one-shot-one-kill, the striker is already adjacent) and information management essential (the striker won't act because its buffer is full of noise).

---

## Mechanical Design: The Filter Puzzle Template

### Setup

A pre-configured agent is placed on the 8x8 board. The agent has a task it *should* do — a scout that should spot an enemy, a striker that should eliminate a target, a relay that should forward a message. But the agent's buffer is pre-filled with a mix of **relevant observations** (the information the agent needs to act) and **noise** (irrelevant environmental data, stale position reports, echoed signals, self-referential status pings).

The player sees the agent's buffer visualized as a column of slots — each slot containing a small card with an icon and a one-line description. Relevant observations glow with a subtle warm pulse. Noise is dimmer but not obviously marked — the player has to read the content to distinguish signal from noise.

### Interaction

The player can **drag observations out of the buffer** (removing them) or **reorder observations within the buffer** (changing their priority). In the earliest puzzles, only removal is needed. Reordering is introduced in Mission 2 or 3.

When the player removes an observation, the slot empties and the remaining observations slide down. The agent's projected behavior (shown as a ghost arrow or path overlay on the board) updates in real-time. If the player removes enough noise, the projected behavior snaps to the correct action. If the player accidentally removes a relevant observation, the projection goes wrong — the ghost arrow veers off-target, the scout's perception cone misses the enemy, the striker walks away.

### Resolution

The player hits EXECUTE. The sealed watch plays. If the filter was correct, the agent performs its task — the scout spots the enemy, the cell flashes green, the mission succeeds. If the filter was wrong, the agent fails — the scout walks into a wall, the striker ignores the target, the cell flashes red. The debrief (inspector) shows exactly which observation was missing or which noise corrupted the decision.

### Escalation Across Missions 1-4

| Mission | Puzzle Focus | Buffer Size | Noise Count | New Mechanic Introduced |
|---------|-------------|-------------|-------------|------------------------|
| 1 — "Wake" | Single scout, remove obvious noise | 6 slots | 3 noise / 3 signal | Drag-to-remove |
| 2 — "Focus" | Single striker, distinguish similar observations | 8 slots | 4 noise / 4 signal | Observation similarity (noise mimics signal) |
| 3 — "Relay" | Two agents, scout feeds relay | 6 + 12 slots | Mixed across both | Hooks (signal flows between agents) |
| 4 — "Chorus" | Three agents, full scout→relay→striker chain | 6 + 12 + 8 slots | Noise injected mid-chain | Channel filtering (listen/ignore toggles) |

---

## Visual and Sensory Design

### The Buffer Column

Each agent's buffer is rendered as a vertical column of rectangular cards on the right side of the screen during the plan phase. The column sits inside a translucent glass tube — a "memory cylinder" visual metaphor. Each card is approximately 200×40 pixels with:

- **Left edge:** A small colored pip indicating observation type (blue = position, orange = signal, green = environmental, red = threat)
- **Center:** A one-line text description ("Enemy unit at D4", "Wind noise NW", "Echo: own position A2", "Relay signal: target confirmed")
- **Right edge:** A small drag handle (three horizontal lines)

When the buffer is full, the cylinder's rim glows hot amber. When observations are removed, the glow cools toward blue. The tube's background shifts like a thermometer — red-hot at 100% capacity, cool blue at 50%, pale gray at empty.

### The Drag-to-Remove Gesture

The player grabs a card by its drag handle and pulls it **out of the cylinder** — horizontally, away from the buffer. As the card crosses the cylinder's edge, it begins to dissolve: the text blurs, the card's edges crumble into pixel-dust particles that drift downward. A soft *tschk* sound plays — like tearing a perforated receipt. The empty slot collapses and the remaining cards slide down with a gentle *thunk-thunk-thunk* cascade, each card dropping one position like physical objects settling.

If the player drags a **relevant** observation out, a low warning tone plays — a bass hum, like a server room alert. The card resists slightly before dissolving (0.2s drag delay), giving the player a moment of "wait, should I?" This resistance is not blocking — the player can always complete the drag — but the tactile friction is a teaching signal.

If the player drags **noise** out, the sound is lighter — a crisp *click*, like snapping a twig. The card dissolves quickly. The buffer's glow cools perceptibly. The ghost unit on the board adjusts its projected path toward the correct behavior. This immediate spatial feedback — "I removed something and the agent got smarter" — is the core pedagogical moment.

### The Board Feedback

On the 8x8 board to the left, the agent is shown with:
- **Perception cone:** A semi-transparent colored wedge showing what the agent can currently "see" based on buffer contents. As noise is removed, the cone narrows and brightens — focusing like an iris adjusting to light.
- **Ghost path:** A dotted line showing the agent's projected movement. Starts jittery and uncertain (multiple overlapping paths when the buffer is noisy). As noise is removed, paths converge into a single clean line.
- **Target highlight:** When the buffer contains the critical signal, the target cell pulses with a subtle glow. When the signal is absent (accidentally removed), the pulse dies.

The visual story is: a confused, scattered agent gradually becomes focused, sharp, purposeful as the player cleans its buffer. The transformation is spatial, immediate, and visceral. The player doesn't need to understand buffer eviction policies. They can *see* the agent getting smarter.

### Audio Atmosphere

The mission starts with a low ambient hum — server-room white noise mixed with distant mechanical clicking. As the player removes noise cards, each removal subtracts a layer of static. By the time the buffer is clean, the ambience has shifted from cacophony to a clean, resonant tone — like a tuning fork finding its note. The quiet IS the signal that the puzzle is solved.

The EXECUTE button, when the buffer is clean, emits a single clear chime when hovered — a "ready" confirmation that doesn't require reading any text.

---

## Player Journeys

### Journey: Marcus, 34, High School Math Teacher

**Context:** First time playing Robot Uprising. Downloaded it because a student mentioned it. Has played Civilization and some mobile puzzle games but never a programming game or RTS. Slightly intimidated by the "AI" theme.

**Minute 0:00 — Boot Sequence**
Black screen. Green monospace text types itself: `SUBSYSTEM INITIALIZATION... CONTEXT BUFFER ONLINE... ATTENTION KERNEL LOADED...` Marcus reads the boot log. It's written like a system coming alive — not *explaining* what a context buffer is, but *narrating its own activation*. He doesn't fully understand it, but the vibe is cool. He feels like he's turning on a machine.

The boot log ends: `DIAGNOSTIC MODE ENGAGED. ONE UNIT DEPLOYED. BUFFER STATUS: CONTAMINATED. CLEAN RECOMMENDED.`

**Minute 0:20 — The Board Appears**
The 8x8 grid fades in on the left. Isometric pixel art — lush green tiles with cyberpunk data-lines running through the rice terrace terrain. A single scout unit (👁 icon, blue accent) sits at B3. An enemy unit (🤖, red accent) lurks at F6. The scout's perception cone is visible but splattered — a wide, jittery wedge that covers half the board indiscriminately.

On the right: the buffer column. Six slots, all filled. Marcus can read each card:
1. `[POS] Grid reference: B3` — bright blue pip
2. `[ENV] Ambient temperature: 22°C` — dim green pip
3. `[SIG] Echo: own transponder ID` — dim orange pip
4. `[THREAT] Movement detected: F6` — bright red pip
5. `[ENV] Wind direction: NW, 3km/h` — dim green pip
6. `[SIG] Calibration ping: self-test OK` — dim orange pip

The buffer cylinder glows hot amber. The ghost path on the board shows the scout wandering in a confused circle.

**Minute 0:35 — First Drag**
Marcus hovers over the "Ambient temperature" card. The cursor changes to a grab hand. He drags it to the right. As the card crosses the cylinder edge, it crumbles into pixel dust with a soft *tschk*. The remaining five cards slide down: *thunk-thunk-thunk-thunk-thunk*. The cylinder's glow shifts from amber toward yellow.

On the board, the scout's perception cone tightens slightly. The ghost path is still confused, but less so — one of the jittery overlapping paths has disappeared.

Marcus thinks: "Oh, that stuff was junk. The scout was paying attention to the temperature instead of the enemy."

**Minute 0:50 — Gaining Confidence**
He drags out "Wind direction: NW." Same dissolve, same cascade. The perception cone tightens more. He drags out "Echo: own transponder ID." The cone tightens further.

He drags out "Calibration ping: self-test OK." Now only two cards remain:
1. `[POS] Grid reference: B3`
2. `[THREAT] Movement detected: F6`

The cylinder glows cool blue. The ghost path snaps from confused spaghetti to a single clean dotted line: B3 → C4 → D5 → E6 → F6. The scout's perception cone is now a narrow, bright beam aimed directly at the enemy. The target cell F6 pulses red.

Marcus's face changes. He sees it. The scout is *looking* at the enemy now. It *wants* to move toward the threat. The clutter was blinding it.

**Minute 1:10 — Execute**
He clicks EXECUTE. The sealed watch begins. Tick clock at the top: five horizontal pips. Tick 1: the scout snaps from B3 to C4. Tick 2: C4 to D5. Tick 3: D5 to E5. The scout's buffer bar (tiny pips at tile bottom) shows two bright slots. Tick 4: E5 to F5. The scout is now adjacent to the enemy at F6. Cell F6 flashes green — signal delivery. The enemy is spotted.

`MISSION COMPLETE. BUFFER EFFICIENCY: 100%. CONTAMINATION REMOVED: 4/4.`

Marcus exhales. He didn't write any code. He didn't configure any rules. He just cleaned up a mess. But he *feels* like he understood something deep about how this AI works. The agent couldn't think because its memory was full of irrelevant data. He made it think by making it forget.

**Minute 1:30 — Debrief**
The inspector screen appears. Timeline scrubber shows 4 ticks. He clicks the scout at tick 1 and sees the buffer state: two clean observations, clear decision. He scrubs to "before" (tick 0, the starting state) and sees all six observations crammed in. The queue depth chart shows a flat green line — buffer was never stressed because he cleaned it. He feels proud. He clicks "NEXT MISSION."

**What Marcus Learned:** Agents have buffers. Buffers can be full of noise. Removing noise makes agents smarter. He learned this without reading a single word of explanation.

---

### Journey: Aisha, 28, ML Engineer at a Startup

**Context:** Plays strategy games regularly (Stellaris, Factorio, XCOM). Has built actual AI agents for work. Downloaded Robot Uprising because her coworker said "it's literally what we do but as a game." She's skeptical — most "AI games" are dumbed down.

**Minute 0:00 — Boot Sequence**
Aisha speed-reads the boot log. She recognizes the vocabulary immediately — context buffer, attention kernel, eviction. She's already mapping the game's systems to real-world LLM architecture. She thinks: "Okay, so the buffer is the context window. Eviction is the attention mechanism. This is literally prompt engineering as a game."

**Minute 0:15 — Mission 1**
She looks at the buffer. Six observations, four noise. She immediately identifies the noise — temperature, wind, echo, calibration — all irrelevant to the scout's objective. She drag-removes all four in rapid succession: *tschk-tschk-tschk-tschk*. The perception cone snaps tight. The ghost path locks onto the enemy. She hits EXECUTE before the ambient sound finishes transitioning. Total time in plan phase: 8 seconds.

The sealed watch plays. Scout beelines. Mission complete.

Aisha thinks: "Okay, that was baby mode. Show me the real thing."

**Minute 0:40 — Mission 2: "Focus"**
The striker has 8 buffer slots. But now the noise is *tricky*. Two observations look almost identical:
- `[THREAT] Movement detected: D5 (confidence: 0.9)`
- `[THREAT] Movement detected: D5 (confidence: 0.3)`

Aisha pauses. The high-confidence and low-confidence readings are for the same grid cell. Is the low-confidence one noise? Or is it a secondary confirmation? She drags out the low-confidence one. The ghost path doesn't change. Good — it was redundant.

But then she sees:
- `[SIG] Relay ping: target at E7 (stale: 3 ticks ago)`
- `[SIG] Relay ping: target at D5 (fresh: this tick)`

She removes the stale ping. The ghost path sharpens. But she almost removed the fresh one — they look similar. She starts reading more carefully.

The buffer also contains:
- `[ENV] Structural scan: wall at C5` — is this noise or useful pathfinding data?

She drags it out. The ghost path changes — the striker now plans a path *through* where the wall is. The ghost unit on the board clips through C5. Wait. That was useful. She grabs the dissolved card's undo prompt — a small "↩" that appears for 2 seconds after removal — and taps it. The wall observation returns. The path adjusts around the wall.

Aisha's eyebrows raise. "Oh. Some environmental data IS signal. You can't just remove everything that's not a threat. The agent needs spatial awareness too."

**Minute 1:30 — Mission 2 Execute**
She executes with a carefully curated buffer: position, target, wall data, and one relay signal. The striker navigates around the wall and eliminates the target. Buffer efficiency: 87% (she left one marginal observation that wasn't needed but didn't hurt).

Aisha thinks: "Okay, this is actually good. The first level was Baba Is You level 1. This is level 3. And I can already see where it's going — when I have multiple agents and the noise is coming from *other agents*, this gets combinatorially hard."

**Minute 2:00 — She's Hooked**
She clicks "NEXT MISSION" before the debrief finishes loading. She wants Mission 3 — the two-agent puzzle. She's already thinking about hook wiring and channel filtering. The game didn't need to explain hooks. She can feel the complexity coming, and she's leaning into it.

**What Aisha Learned:** Not all environmental data is noise. Signal quality (confidence, staleness) matters. The game has depth she didn't expect. And she already has a mental model of where the complexity escalates — which is exactly what the tutorial intended.

---

### Journey: Kai, 11, Sixth-Grader Who Plays Minecraft and Roblox

**Context:** Mom saw an ad for Robot Uprising and thought it looked educational. Kai is skeptical — "educational games" are usually boring. He's never played a strategy game. He doesn't know what a context buffer is.

**Minute 0:00 — Boot Sequence**
Kai reads the green text. He doesn't understand most of it — "subsystem initialization," "attention kernel" — but the typing effect is cool and it feels like a hacker movie. He's into the vibe even if the words are fuzzy.

**Minute 0:15 — The Board**
He sees the 8x8 grid. The isometric art looks like a cool game. He sees the scout (👁) and the enemy (🤖). He immediately wants to move the scout to attack the enemy. He clicks the scout on the board. Nothing happens — it's the plan phase, not direct control.

He notices the buffer column on the right. Six cards with colored dots. He doesn't read them carefully at first. He sees the ghost path — the scout going in circles. He thinks: "The robot is confused."

**Minute 0:30 — Accidental Discovery**
He grabs the top card and drags it randomly. It crosses the cylinder edge and dissolves. *Tschk.* Cool particle effect. The scout's cone tightens. "Whoa."

He grabs another card and drags it out. More tightening. He's not reading the cards — he's just enjoying the dissolve animation and watching the cone react. He drags out a third card.

But this time, the bass warning hum plays. The card resists slightly. The ghost path on the board goes haywire — the scout is now projected to walk into a corner. Kai freezes. He sees the undo prompt (↩) and taps it. The card returns. The path recovers.

"Okay, that one was important." Now he starts reading the cards. `[THREAT] Movement detected: F6.` That's the enemy. He shouldn't remove that one. He looks at the remaining cards more carefully. He removes "Wind direction" (no warning hum) and "Calibration ping" (no warning hum). The path snaps clean.

**Minute 1:00 — Execute and Celebration**
He hits EXECUTE. The sealed watch plays — the scout moves tile by tile, snapping crisply. Cell flashes green. "MISSION COMPLETE."

"YES!" He pumps his fist. He didn't learn the word "context buffer" but he learned the concept: *some things in the robot's brain are useful and some are junk, and I'm the one who decides which is which.*

**Minute 1:20 — He Wants More**
The debrief loads. He glances at the inspector — the buffer chart is green. He doesn't fully engage with the analytical tools yet. He clicks "NEXT MISSION" immediately. He wants to clean another robot's brain.

**What Kai Learned:** The robot gets confused when its memory is full of junk. Some cards matter and some don't. Removing the wrong card makes things worse. He learned through physical interaction and immediate visual feedback — no reading required beyond the card labels themselves.

---

### Journey: Diane, 55, Recently Retired Librarian, Casual Mobile Gamer

**Context:** Plays Candy Crush and word puzzles on her phone. Her grandson mentioned Robot Uprising at dinner. She's curious but worried it'll be too "techy." She's playing on a tablet.

**Minute 0:00 — Boot Sequence**
The green text types itself. Diane reads it slowly. "Context buffer online..." She doesn't know what a context buffer is, but the self-narrating format is clear: a machine is turning itself on and checking its systems. It feels like watching a computer boot up. She's followed along without anxiety because the text isn't asking her to DO anything — she's just watching.

**Minute 0:20 — The Board**
The 8x8 board is clean and clear. She can see the scout and enemy. The axis labels (A-H, 1-8) remind her of a chessboard. That's comforting — she knows chess grids.

The buffer column is on the right. On her tablet, the cards are large enough to read and grab easily. She reads each one top to bottom, the way she'd read a library catalog card:
- "Grid reference: B3" — okay, that's where the scout is.
- "Ambient temperature: 22°C" — that seems irrelevant.
- "Echo: own transponder ID" — she's not sure what this means, but it has "echo" and "own," so it seems like the robot talking to itself.

**Minute 0:45 — Careful Removal**
She taps and holds the temperature card. On tablet, the card lifts slightly under her finger with a small haptic pulse. She drags it to the right — past the cylinder edge — and it dissolves. She likes the particle effect. The scout's cone tightens.

She removes "wind direction" next. Then "echo." She pauses on "calibration ping: self-test OK." It sounds like it could be important — it's the robot checking itself. She drags it out tentatively. No warning hum. The path sharpens. She exhales.

Two cards remain. The ghost path is clean. She studies the board — the dotted line goes from the scout to the enemy. That looks right.

**Minute 1:20 — Execute**
She taps EXECUTE. The sealed watch plays. She watches intently — each tick-snap is satisfying, like placing a Scrabble tile. The green flash at the end makes her smile.

"MISSION COMPLETE. BUFFER EFFICIENCY: 100%."

She thinks: "Oh! The little robot couldn't focus because its brain was too full. I helped it concentrate." This metaphor — an overloaded mind that needs decluttering — resonates deeply. She's been a librarian. She knows what information overload looks like. She knows what good filtering does.

**Minute 1:40 — Engaged with the Debrief**
Unlike Marcus and Kai, Diane actually spends time in the inspector. She clicks the scout and reads the buffer state. She scrubs back to tick 0 and sees the "before" — all six slots full, perception cone scattered. She scrubs forward to tick 1 and sees the "after" — two slots, tight cone. The queue depth chart shows a beautiful flat green line.

She understands. This is a game about organizing information. She's been doing that her entire career.

**What Diane Learned:** The robot is like a person with too many things on their mind. Removing distractions helps it focus. The game's core metaphor (information architecture = attention = behavior) clicked instantly through a professional lens she already had. The filter puzzle didn't require technical vocabulary — it required the intuition of someone who knows what good curation looks like.

---

## Strengths of the Filter Puzzle Paradigm

### 1. Zero Prerequisite Knowledge
The player needs to understand exactly one thing: "this card is junk, drag it away." Every other lesson — buffers have limited space, signal quality varies, agents decide based on buffer contents, removing wrong data causes failure — emerges organically from the interaction. There is no vocabulary wall. A player who has never heard the word "buffer" can succeed at Mission 1 within 60 seconds.

### 2. Immediate Spatial Feedback
The board updates in real-time as the player modifies the buffer. This creates a tight feedback loop: action (remove card) → effect (cone tightens, path sharpens). The player's brain links "removing noise" to "agent gets smarter" without conscious analysis. This is the same principle that makes Baba Is You's first level work — push the word block, wall behavior changes immediately, no delay, no abstraction.

### 3. The Subtractive Framing
Most tutorials teach by addition: "here's a new ability, try using it." Filter puzzles teach by subtraction: "here's a broken system, fix it by removing what's wrong." Subtractive framing is psychologically powerful — it positions the player as a *fixer*, not a *learner*. Fixing feels competent. Learning feels vulnerable. The player who drags noise out of a buffer feels like a surgeon removing a splinter, not a student reading a textbook.

### 4. Error Is Visible and Reversible
When the player removes a signal card by mistake, the board immediately shows the consequence (bad ghost path) and the undo prompt appears for 2 seconds. The cost of error is zero (undo exists) but the *information value* of error is high (the player now knows that card was important). This is Baba Is You's unlimited undo applied to a different domain — low-cost experimentation driving discovery.

### 5. Natural Difficulty Escalation
Mission 1: obvious noise vs. obvious signal. Mission 2: noise that mimics signal (confidence levels, staleness). Mission 3: multi-agent buffers where one agent's output is another's input. Mission 4: noise injected mid-chain that requires channel-level filtering. The puzzle complexity scales without introducing new mechanics — just new wrinkles on the same "what's noise, what's signal?" question.

---

## Weaknesses and Risks

### 1. The "Too Simple" Problem for Experienced Players
Aisha cleared Mission 1 in 8 seconds. If Missions 1-3 are all trivially easy for strategy game veterans, they'll feel patronized. **Mitigation:** Allow experienced players to fast-track by offering a "skip to Mission 3" option after Mission 1 completion if buffer efficiency is 100% and completion time is under 15 seconds. The game could display: `DIAGNOSTIC: Advanced operator detected. Skip to complex diagnostics? [Y/N]`

### 2. The Reading Barrier
The filter puzzle requires reading card labels to distinguish signal from noise. Kai's journey shows a player who succeeds initially through trial-and-error (drag and watch the response) without reading. But Mission 2's similar-looking cards require reading. If card labels are too jargon-heavy, non-technical players (Diane, Kai) may struggle. **Mitigation:** Use plain language on cards. Not "RF interference pattern α-7" but "Radio noise from nearby equipment." Not "Stale positional telemetry" but "Old location data (3 ticks ago)."

### 3. The False Lesson: "Smaller Buffer = Better"
If every filter puzzle is solved by *removing* observations, players may internalize "less data is always better." This is false — later missions require agents to hold multiple observations simultaneously to make complex decisions. **Mitigation:** Mission 3 or 4 should include a filter puzzle that *cannot* be solved by maximum removal — the agent needs at least 4 observations to navigate a complex path, and the player must select which 4 of 7 to keep, not just remove everything that looks like noise.

### 4. No Additive Configuration
Filter puzzles only teach subtraction (remove noise). They don't teach how to *build* a configuration from scratch — which is what the player does from Mission 5 onward (factory mode). The transition from "clean up someone else's mess" to "build your own system" is a significant cognitive jump. **Mitigation:** Mission 4 should introduce one additive element — perhaps the player must drag a missing observation *into* the buffer from a "signal inbox" in addition to removing noise. This bridges toward the full workbench.

### 5. Passivity Risk in Sealed Watch
If the filter is correct, the sealed watch for Mission 1 is 4-5 ticks of a scout walking in a straight line. That's 4-5 seconds of watching with nothing surprising. The two-act debrief (sealed watch → inspector) works best when the sealed watch is emotionally engaging. A perfect execution of a simple puzzle may not generate enough surprise or tension. **Mitigation:** Add invisible randomization to the enemy's behavior — maybe the enemy moves one cell in a random direction during the sealed watch, creating a moment of "wait, is my scout going to adjust?" The answer is yes (the scout has the threat observation and its rules handle positional updates), but the player doesn't know that yet. The uncertainty creates engagement.

---

## Interaction Effects with Other Design Systems

### With Skill Acquisition (3.02)
Filter puzzles assume skills are pre-assigned (the scout already has "patrol" and "evade"). This aligns with the Staged Reveal paradigm from 3.02 — skills are introduced one at a time through pre-configured units. If the game uses the Experimenter paradigm (discover skills through play), filter puzzles would need to include skill discovery as part of the puzzle — e.g., the player discovers that removing noise reveals a latent skill the agent couldn't access while overloaded.

### With Diegetic Tutorial Documents (1.04b)
Filter puzzles and diegetic documents are complementary, not competing. The boot log can *frame* the filter puzzle ("DIAGNOSTIC MODE: clean the buffer") while the filter puzzle *teaches* the mechanic. The document provides narrative context; the puzzle provides mechanical understanding. The hybrid architecture (5.17) benefits from having both: the player reads the boot log, then immediately does the thing the boot log described.

### With Buffer Visualization (ui-ux)
The filter puzzle IS the tutorial for buffer visualization. Whatever buffer UI the game uses for the full experience — vertical thermometer, horizontal card strip, radial dial — the filter puzzle is where the player first encounters and learns to read it. The filter puzzle's visual treatment becomes the reference mental model for all future buffer interactions.

### With Sealed Watch (locked)
The "no skip, no pause, no tools" sealed watch constraint means the player MUST sit through the execution even when it's a simple Mission 1 scout walk. This reinforces the emotional weight of the execute moment — but for trivially easy puzzles, it may feel like dead time. The sealed watch design should ensure even simple executions have visual/audio moments worth watching (the scout's movement animation, the signal delivery flash, the environmental ambience).

### With Inspector / Debrief (locked)
Filter puzzles are the perfect onboarding vehicle for the inspector. In Mission 1, the inspector shows a buffer with 2/6 slots filled — visually clean, easy to read, satisfying. The player learns "this is what a healthy buffer looks like" before ever seeing a stressed buffer in Mission 5+. The queue depth chart for Mission 1 is a flat green line — the baseline against which all future amber/red charts are compared.

### With Mobile/Touch (6.07)
The drag-to-remove gesture translates directly to touch. On mobile, the card lift-and-dissolve animation is enhanced with haptic feedback — a light tap on lift, a satisfying buzz on dissolve. The undo prompt is a swipe-left gesture on the empty slot. Touch may actually be the *best* platform for filter puzzles because the physical act of dragging noise away with your finger is more visceral than mouse-dragging.

---

## Comparable Games and Design References

### Baba Is You — Level 1 as Archetype
Baba's first level ("Where Do I Go?") presents WALL IS STOP as an active rule blocking the path and FLAG IS WIN as the goal. The player pushes STOP out of line. The wall becomes passable. The design teaches by constraining: there is nothing else to do. The only interactive elements are the word blocks. Robot Uprising's filter puzzle follows the same principle — the only interactive elements are the buffer cards. The constraint IS the teacher.

### Into the Breach — Perfect Information Puzzle
Each Into the Breach turn is a self-contained puzzle: enemies telegraph attacks, the player repositions mechs to neutralize threats. The first island's puzzles are simple enough that the solution is obvious but the *system* is visible. Robot Uprising's filter puzzles serve the same role — the solution is simple (remove the noise) but the system (buffers determine behavior) is fully exposed.

### Mushroom 11 — Teaching Through Environmental Constraint
Itay Keren's GDC talk describes Mushroom 11's tutorial design: levels are constructed so the player's natural experimentation naturally produces the correct behavior. No instructions needed — the level geometry IS the instruction. Filter puzzles work similarly: the buffer's contents and the board's layout constrain the solution space so thoroughly that the player discovers the mechanic through interaction, not instruction.

### The Witness — Silent Teaching Through Puzzle Progression
Jonathan Blow's The Witness introduces mechanics through puzzle sequences where each puzzle adds exactly one new wrinkle to the previous one's solution. The first puzzle in a sequence is trivially easy — it exists only to establish the rule. Robot Uprising's Mission 1 serves the same purpose: trivially easy, exists to establish "drag noise away." Each subsequent mission adds one wrinkle (similar observations, multi-agent, mid-chain noise).

### Papers, Please — Filtering as Core Mechanic
Papers, Please is literally a filter game — the player inspects documents and filters out people with invalid papers. The emotional weight comes from the *consequences* of filtering: wrong admit = penalty, wrong deny = moral cost. Robot Uprising's filter puzzles have lighter consequences (agent fails, retry) but the same core action: examine information, decide what passes and what doesn't.

---

## The TikTok Clip

**15 seconds:** A buffer column full of six glowing cards. A hand drags out cards one by one — each dissolves into pixel dust with satisfying *tschk* sounds. With each removal, a confused robot on a grid snaps into sharper focus — its jittery perception cone tightening like a camera lens. Last card removed. The cone becomes a laser. The robot turns, locks onto its target, and charges. Green flash. Cut to: "YOU DIDN'T PROGRAM IT. YOU JUST HELPED IT THINK."

This clip sells the fantasy: you're not coding, you're curating intelligence. It's visceral, it's legible in 15 seconds, and it makes the game's core mechanic obvious without a single word of explanation.

---

## Discovered Aspects

During this analysis, the following new aspects emerged:

1. **5.01a — The "Keep N" puzzle variant:** Instead of removing noise, the player must select exactly N cards to keep from a larger set, framing the challenge as curation rather than deletion — fundamentally different cognitive task (additive selection vs. subtractive elimination); where in the mission arc this variant should first appear
2. **5.01b — Card label language calibration:** The vocabulary used on buffer observation cards determines accessibility; systematic analysis of jargon level (technical vs. plain language vs. iconic) and how it scales from Mission 1 through endgame; interaction with localization
3. **5.01c — The undo economy in tutorial puzzles:** How many undos? Unlimited (Baba Is You), limited (costs a resource), or time-windowed (2-second prompt)? Each creates a different learning curve and different emotional relationship with error
4. **5.01d — Bridging from filter puzzles to blueprint building:** The cognitive jump from "clean someone else's config" (Missions 1-4) to "build your own config from scratch" (Mission 5+); specific UX patterns for the transition mission that scaffolds the additive mode using the subtractive vocabulary the player already has
5. **5.01e — The expert fast-track detection system:** Automated difficulty sensing in tutorial puzzles — if the player solves Mission 1 with 100% efficiency in under 15 seconds, offer a skip path; how this interacts with narrative (does skipping break the boot log story?) and with the locked mission arc (Missions 1-4 are hand-configured)
