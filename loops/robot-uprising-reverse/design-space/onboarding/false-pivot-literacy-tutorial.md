# The False Pivot Literacy Tutorial Mission

**Aspect ID:** 5.24
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Dependencies:** 4.18 (Effective Outcome Timestamp), 4.04b (Two-Act Debrief Structure), 4.26 (False Pivot Gap Metric), 4.16 (Signal Genealogy Visualization), 5.01 (Tutorial as Puzzle / Filter Puzzles), 5.04a (Mission 5 Factory Introduction)
**Related aspects:** 4.19 (False Pivot Annotation Opt-Out), 4.25 (EDT Trajectory Career Metric), 4.27 (Pivot Accuracy Stat), 7.10 (Config Necropsy as Community Artifact), 7.13 ("Find the Pivot" Tournament Format), 1.06c-ext-A-ii (The False Pivot Anti-Pattern), 5.02 (Tutorial as Narrative), 8.09 (Diagnostic Layer as Teaching Arc)

---

## The Design Question

How do you teach a player that what they *saw* was wrong?

The entire sealed watch experience is built on emotional commitment. The player watches their agents execute, unable to intervene, and their brain narrativizes in real time: *that flanking move was the turning point, that relay failure was the disaster, that scout elimination sealed the outcome*. The sealed watch trains the player to feel decisive moments as they happen. This is good. This is the emotional core of the game.

But the brain is wrong roughly half the time. The most dramatic visible event in a match is frequently *not* the causal origin of the outcome. The real pivot -- the Effective Determination Tick -- often happens quietly, several ticks earlier or later, in a buffer overflow or a signal drop that produces no visible fireworks. The false pivot phenomenon is structurally embedded in the game's architecture: agents act based on attention systems, and attention system failures are often invisible during real-time observation.

Every other diagnostic tool in the debrief -- the EDT diamond, the FPG bracket, the signal genealogy graph -- assumes the player already understands that dramatic moments can be decoys. But where does that understanding come from? A tooltip? A loading screen tip? A paragraph in a manual no one reads?

No. It comes from a mission. A mission where the player watches a scripted battle, *feels* the false pivot happen, commits to a wrong interpretation, and then is asked to find the real one by scrubbing backward through time. The mission doesn't explain the concept. The mission makes the player *experience being wrong* and then hands them the tools to discover why.

This is the false pivot literacy tutorial: Mission 7 in the 10-mission campaign. It arrives after the player has mastered filter puzzles (Missions 1-4), factory building (Missions 5-6), and basic debrief reading. It is the first mission where the debrief is not optional analysis but the **primary gameplay**. The battle is pre-scripted. The player cannot change the outcome. Their only task is diagnostic: find the gold diamond.

---

## Mechanical Specification

### Mission Structure: "The Replay"

**Mission name:** "After-Action" (internal codename: REPLAY_DIAGNOSTIC)
**Campaign position:** Mission 7 of 10
**Estimated play time:** 8-14 minutes (including debrief scrubbing)
**Win condition:** Correctly identify the EDT tick within a +/-2 tick tolerance window
**Fail condition:** Identifying a false pivot tick as the EDT (the mission does not end on wrong guess -- the player can keep scrubbing and guessing)

### Phase 1: The Boot Log Briefing

The mission opens with the Predecessor's voice (the AI narrator) delivering a briefing through the boot terminal. The text types itself in green monospace:

```
[>>] INCOMING: ARCHIVED BATTLE REPLAY
[>>] SOURCE: OPERATIVE DIVISION — CEBU CORRIDOR
[>>] STATUS: OUTCOME DETERMINED. AGENTS DECOMMISSIONED.
[>>] YOUR TASK: FIND THE MOMENT IT WAS DECIDED.
[>>] WARNING: YOUR FIRST INSTINCT WILL BE WRONG.
```

The last line holds on screen for 2.5 seconds longer than the others. It pulses once -- a slow amber throb -- before the terminal clears and the sealed watch begins.

### Phase 2: The Scripted Sealed Watch

The player watches a pre-recorded battle. This is not their config. They did not plan it. They are watching someone else's match -- an archived battle from the campaign's narrative (a failed operation in the Cebu Corridor, referenced in earlier mission briefings).

The battle is **authored to contain exactly three candidate pivot moments**, each designed to feel progressively more decisive:

**Tick 18 -- "The Ambush" (False Pivot A):** A relay unit is destroyed by an enemy flanking maneuver. The relay was the primary signal conduit between the scout cluster and the striker line. Its destruction is visually spectacular -- the unit's sprite fragments, the signal lines it was maintaining snap and dissolve, and the scout cluster's perception cones visibly scatter. The audio punctuates: a deep metallic clang followed by signal static. This *looks* catastrophic. Every instinct says: this is where it went wrong.

**Tick 34 -- "The Overrun" (False Pivot B):** The striker line, now operating without relay signals, advances into an enemy concentration. Two strikers are eliminated in rapid succession. The board position swings dramatically -- the player's side goes from 5 units to 3 in two ticks. The score overlay (if the player has it enabled from previous missions) lurches. This *feels* like the killing blow. Surely it's over now.

**Tick 27 -- "The Buffer Spill" (True EDT):** Between the two false pivots, at tick 27, something much quieter happened. A backup relay unit -- the one that could have replaced the destroyed relay at tick 18 -- experienced a buffer overflow. Three high-priority routing signals were evicted from its context window in favor of stale environmental data. The backup relay had the capacity to restore the signal chain. It didn't, because its buffer was full of noise. No unit died. No dramatic animation played. The backup relay simply... didn't do what it should have done. The eviction happened in a single frame. The only visible indication was a brief amber pulse on the backup relay's buffer indicator pip -- the same pip the player learned to read in Missions 1-4.

The sealed watch is 45 ticks total. The match ends with the player's side losing decisively. The sealed bar holds for its full duration -- no skip, no pause, standard sealed watch rules.

### Phase 3: The Diagnostic Challenge

After the sealed watch completes, the screen does NOT transition to the standard Act 2 debrief with pre-materialized tools. Instead, a new prompt appears:

```
[>>] REPLAY COMPLETE. OUTCOME: DEFEAT.
[>>] QUESTION: AT WHICH TICK WAS THE OUTCOME DETERMINED?
[>>] SCRUB THE TIMELINE. FIND THE GOLD DIAMOND.
[>>] NOTE: THE GOLD DIAMOND IS HIDDEN. YOU MUST PLACE IT.
```

The debrief timeline scrubber appears, but the gold EDT diamond is **absent**. The grey false pivot triangles are also absent. The timeline is bare -- just 45 tick marks on a horizontal strip with a draggable playhead. The player has the full replay available: they can scrub forward, backward, play at any speed, and inspect any agent's buffer state at any tick.

A new UI element appears below the timeline: **the Pivot Marker**. This is a draggable gold diamond icon sitting in a dock below the scrubber. The player must drag it onto the timeline and drop it at the tick they believe is the EDT. When dropped, the diamond locks to the nearest tick mark.

**First guess behavior:** Most players will place the diamond at tick 18 (the relay destruction) or tick 34 (the striker overrun). When they do, the game responds:

```
[>>] TICK 18: RELAY DESTRUCTION.
[>>] THIS WAS DRAMATIC. BUT WAS IT DECISIVE?
[>>] QUESTION: COULD THE OUTCOME HAVE BEEN DIFFERENT
[>>]   IF NOTHING CHANGED EXCEPT EVENTS AFTER TICK 18?
[>>] SCRUB BACKWARD. LOOK AT WHAT HAPPENED BEFORE.
```

or

```
[>>] TICK 34: STRIKER OVERRUN.
[>>] TWO UNITS LOST. BUT WERE THEY ALREADY LOST?
[>>] QUESTION: WAS THE STRIKER LINE DOOMED BEFORE
[>>]   THE OVERRUN BEGAN?
[>>] SCRUB BACKWARD. LOOK FOR THE CAUSE OF THE CAUSE.
```

The prompts are Socratic, not corrective. They don't say "wrong." They ask a question that directs the player's attention backward in time. The player picks up the diamond and tries again.

**Guided scrubbing:** As the player scrubs backward from tick 34 toward tick 18, they see the buffer states of each agent at each tick. At tick 27, if they inspect the backup relay (RELAY-B), they see the buffer overflow: three routing signals evicted, replaced by stale environmental data. The buffer visualization they learned in Missions 1-4 shows the familiar amber-to-cool-blue thermometer -- except here it's hot amber, full of noise, at the exact tick when it needed to be clean.

The player recognizes the pattern. This is the same problem they solved in Mission 1 -- a buffer clogged with irrelevant data, preventing the agent from doing its job. But this time, they didn't get to clean it. The buffer was already dirty when the match ran. The eviction policy failed. The backup relay was blinded by its own noise at the critical moment.

**Correct placement:** When the player places the diamond at tick 27 (within the +/-2 tolerance), the mission responds:

```
[>>] TICK 27: BUFFER OVERFLOW — RELAY-B.
[>>] CORRECT.
[>>] THE RELAY DESTRUCTION AT TICK 18 WAS VISIBLE.
[>>] THE STRIKER OVERRUN AT TICK 34 WAS DRAMATIC.
[>>] BUT THE OUTCOME WAS SEALED AT TICK 27,
[>>]   WHEN THE BACKUP RELAY'S BUFFER SPILLED
[>>]   AND THE SIGNAL CHAIN COULD NOT BE RESTORED.
[>>] THE LOUDEST MOMENT IS RARELY THE DECISIVE ONE.
```

The terminal holds on the last line for 3 seconds.

### Phase 4: The Reveal and Unlock

After correct placement, the full debrief materializes. The gold diamond is now locked at tick 27 -- the position the player chose. Grey triangles materialize at ticks 18 and 34. The teal FPG bracket sweeps from tick 18 to tick 27: `FPG: 9 ticks`. A second, lighter dotted bracket spans from tick 27 to tick 34, labeled `secondary gap: 7 ticks`.

Then a new visualization unfolds: **the signal genealogy graph**. This is the player's first exposure to signal genealogy -- the network view showing which agents were sending and receiving signals across the match timeline. The graph animates from tick 1 to tick 45, and at tick 27, the player can see the exact moment RELAY-B's signal chain went dark. The routing signals that should have flowed from RELAY-B to the striker line simply... stop. The edges in the graph that represented those signal paths fade from bright cyan to dim grey at tick 27 and never recover.

The signal genealogy view is labeled with a tooltip: `SIGNAL GENEALOGY — Unlocked. Available in all future debriefs.`

Two unlocks trigger:

1. **Achievement: "Diagnostic"** -- A gold badge with the text "You found the real pivot. Not the loud one -- the right one." This achievement is visible on the player's profile and in community features.

2. **Signal Genealogy Visualization Mode** -- The signal genealogy panel is now available in all future mission debriefs and Gauntlet match debriefs. Before this mission, the signal genealogy panel did not appear in the debrief UI. After this mission, it is a permanent addition to the player's diagnostic toolkit. The unlock is diegetic: the Predecessor explains that the player has demonstrated sufficient diagnostic maturity to access the full signal trace.

```
[>>] DIAGNOSTIC CERTIFICATION: PASSED.
[>>] SIGNAL GENEALOGY VISUALIZATION: UNLOCKED.
[>>] YOU CAN NOW SEE THE FULL SIGNAL TRACE
[>>]   IN ALL FUTURE DEBRIEFS.
[>>] USE IT TO FIND WHAT THE SEALED WATCH HIDES.
```

---

## Player Journey 1: Tomoko, 31, Product Designer, First Playthrough

**Context:** Tomoko has played Missions 1-6 over two evenings. She's comfortable with buffer management and has built her first factory army in Mission 6. She's never heard the term "false pivot." She reads the mission briefing and thinks: "Find the moment it was decided. Okay. Like a murder mystery -- when was the time of death?"

**Minute 0:00 -- Boot Log**

Green text types on black. Tomoko reads the briefing. `YOUR FIRST INSTINCT WILL BE WRONG.` She raises an eyebrow. "Okay, game. Challenge accepted."

**Minute 0:15 -- Sealed Watch Begins**

The 8x8 grid fills with units. She doesn't recognize the config -- it's not hers. She's watching an archived battle. Tick counter at the top: 1... 2... 3... Agents move. Scouts fan out. Relays establish signal chains -- she can see the faint cyan lines connecting relay nodes to scouts and strikers. The battle develops.

**Minute 0:40 -- Tick 18: The Ambush**

An enemy unit flanks from behind a wall tile. The relay unit at D5 takes a hit. One-shot-one-kill -- the relay's sprite shatters into angular fragments that scatter across the tile. The cyan signal lines that were flowing through it snap with a sharp *crack-fizz* sound, like a power cable severing. The scout cluster's perception cones immediately scatter -- they lose their focused beam and revert to the wide, jittery spray she remembers from Mission 1's contaminated buffers.

Tomoko's gut reaction: "That's it. The relay died and everything fell apart." She mentally places the pivot at tick 18.

**Minute 1:10 -- Tick 27: The Buffer Spill**

The backup relay at E3 has a tiny amber pip at its base. For one frame, the pip flares brighter -- then settles back. Nothing else happens. No unit moves. No signal line snaps. Tomoko doesn't notice. She's watching the scouts, which are now wandering without guidance.

**Minute 1:30 -- Tick 34: The Overrun**

Two strikers advance into a cluster of enemy units. Without relay-forwarded target data, they're walking blind -- attacking based on proximity rather than coordinated signals. Both are eliminated in consecutive ticks. The board swings from 5v5 to 3v5. Tomoko winces. "Yeah, that's done. The relay death at 18 caused this."

**Minute 2:00 -- Sealed Watch Ends**

The remaining three units are picked off by tick 42. Match over. The terminal prompt appears: `AT WHICH TICK WAS THE OUTCOME DETERMINED?`

**Minute 2:15 -- First Guess**

Tomoko drags the gold diamond from its dock and drops it on tick 18. The relay destruction. She's confident.

The terminal responds: `TICK 18: RELAY DESTRUCTION. THIS WAS DRAMATIC. BUT WAS IT DECISIVE? COULD THE OUTCOME HAVE BEEN DIFFERENT IF NOTHING CHANGED EXCEPT EVENTS AFTER TICK 18? SCRUB BACKWARD. LOOK AT WHAT HAPPENED BEFORE.`

Tomoko pauses. "Wait. It says 'after tick 18.' So it's asking: if the relay still died, could the outcome have changed based on what happened later?" She starts scrubbing forward from tick 18, tick by tick. The relay is gone. But she notices RELAY-B at E3 -- the backup. "Oh. There was a backup relay. Why didn't it take over?"

**Minute 3:00 -- Discovery**

She clicks on RELAY-B at tick 19. Its buffer is visible: 12 slots, 11 full. The routing signals from the scout cluster are there, queued but not being forwarded. She scrubs forward. At tick 22, a new environmental scan enters the buffer. At tick 25, another. By tick 27, the buffer is maxed -- 12/12 slots, the thermometer glowing hot amber. Three routing signals from SCOUT-A are evicted to make room for environmental noise.

"Oh no." She recognizes this. It's Mission 1 all over again. The backup relay was drowning in noise. It couldn't forward the critical routing signals because its buffer was full of wind direction reports and calibration pings. The eviction happened at tick 27.

She scrubs forward from tick 27. The routing signals never come back. RELAY-B continues to hold noise. The strikers never receive coordinated targeting data. The overrun at tick 34 was inevitable *because* of tick 27, not because of tick 18.

**Minute 4:30 -- Second Guess**

She picks up the diamond and drops it on tick 27. The terminal confirms: `TICK 27: BUFFER OVERFLOW -- RELAY-B. CORRECT.` The explanation types itself. She reads the final line: `THE LOUDEST MOMENT IS RARELY THE DECISIVE ONE.`

She exhales. "Holy shit. I was so sure it was tick 18." She sits back. The debrief materializes -- gold diamond at 27, grey triangles at 18 and 34, teal bracket connecting them. The signal genealogy graph unfolds. She watches the signal flow go dark at tick 27 and stays dark for the rest of the match.

**Minute 5:30 -- Processing**

She's not thinking about the game anymore. She's thinking about product design meetings where the loudest objection wasn't the real blocker. The metaphor landed. She clicks "NEXT MISSION" with a different relationship to the debrief tools than she had ten minutes ago.

**UI annotations:**
- Diamond dock: positioned center-bottom below the timeline, 48x48px gold diamond icon with a subtle float animation, grab cursor on hover
- Diamond drop: snaps to nearest tick mark with a magnetic *click* sound, gold glow radiates outward from the drop point for 0.3s
- Wrong-guess prompt: appears in the boot terminal area (top-left), types at 40 characters per second, amber text instead of green to signal "not quite"
- Correct-guess prompt: green text, each line punctuated by a soft ascending chime, the final line displayed in brighter white

---

## Player Journey 2: Darnell, 22, Computer Science Student, Methodical Player

**Context:** Darnell plays everything methodically. He took notes during Missions 1-6 in a physical notebook. He already understands buffers conceptually -- he's studied operating systems. He reads the mission briefing and immediately thinks: "The warning says my first instinct will be wrong. So whatever looks most dramatic is probably NOT the answer. I need to look for something quiet."

**Minute 0:00 -- Boot Log**

He reads `YOUR FIRST INSTINCT WILL BE WRONG` and writes in his notebook: "Game is priming me to distrust the obvious. Look for subtle failures -- buffer eviction, hook misfires, signal drops."

**Minute 0:15 -- Sealed Watch**

He watches attentively but with a detached analytical posture. When the relay is destroyed at tick 18, he notes it: "Tick 18 -- relay destroyed. Dramatic. Probably NOT the EDT." When the strikers are overrun at tick 34: "Tick 34 -- consequence of tick 18, probably. Still not the root cause."

He's specifically looking for buffer-related events in the background. But the sealed watch doesn't provide buffer state visibility (it's sealed -- no inspection tools). He's watching for visual indicators: the small colored pips at the base of each unit that show buffer health. He notices RELAY-B's pip flare amber at tick 27. He circles "tick 27?" in his notebook.

**Minute 2:00 -- Diagnostic Phase**

The sealed watch ends. The timeline and scrubber appear. Darnell does NOT immediately place the diamond. He scrubs to tick 27 first. He clicks on RELAY-B. Buffer state: 12/12, routing signals evicted, environmental noise retained.

He nods. "Buffer overflow on the backup relay. Classic." He checks: could the backup relay have restored the signal chain if its buffer was clean? He scrubs to tick 19 (one tick after the relay's death) and inspects RELAY-B's buffer. At tick 19, RELAY-B had 9/12 slots occupied, with the three routing signals still present. The eviction hadn't happened yet. The backup was viable. Then at tick 27, the eviction killed the recovery path.

He places the diamond at tick 27 on his first attempt.

**Minute 3:30 -- Correct on First Try**

The terminal confirms. Darnell writes in his notebook: "EDT = tick 27. False pivots at 18 (relay death) and 34 (striker overrun). The real cause was buffer policy failure on the backup relay. The mission's lesson: look for attention system failures, not combat casualties."

The signal genealogy unlocks. He spends 4 minutes exploring it -- tracing each signal path, understanding the network topology, watching how RELAY-B's failure propagated silence through the system. He's building a mental model of signal flow that will serve him for every future mission.

**Minute 7:30 -- Achievement**

The "Diagnostic" badge appears. Darnell screenshots it for his Discord. He's proud not of the badge but of the first-try solve. He understood the game's epistemology before the game tried to teach it.

**UI annotations:**
- Buffer pip during sealed watch: RELAY-B's pip at tile base is a 6x6px circle, transitions from teal to amber over 2 ticks (26-27), holds amber for 1 tick, then returns to a dim state -- the only visual tell during the sealed watch
- First-try detection: if the player places the diamond correctly on the first attempt, the terminal adds an additional line: `[>>] FIRST ATTEMPT. YOUR INSTINCTS ARE ALREADY CALIBRATED.` -- acknowledging the player's skill without being patronizing
- Signal genealogy first-exposure: the graph animates node by node, with each agent appearing as a circle labeled with its designation (SCOUT-A, RELAY-B, STRIKER-C), edges drawing themselves as signal transmissions occur; at tick 27, the RELAY-B node's outgoing edges dim simultaneously -- a visible "going dark" that is unmistakable in the genealogy view even though it was invisible in the sealed watch

---

## Player Journey 3: Nina, 45, Retired Military Analyst, Plays Strategy Games Recreationally

**Context:** Nina served as an intelligence analyst before transitioning to civilian consulting. She plays strategy games to unwind -- XCOM, Into the Breach, Civilization. She recognizes the after-action review format immediately. "This is an AAR. They want me to find the root cause, not the proximate cause."

**Minute 0:00 -- Boot Log**

She reads the briefing and smiles. "Classic analyst trap. The spectacular failure is the one everyone writes about. The actual point of failure is always three steps earlier and completely unglamorous."

**Minute 0:15 -- Sealed Watch**

Nina watches with professional detachment. She's trained to suppress narrative instinct during first observation. When the relay dies at tick 18, she notes it as a "kinetic event" but doesn't assign causality. When the strikers overrun at tick 34, she categorizes it as "downstream consequence, likely not root." She's watching the entire board periphery -- checking for units that *aren't* acting, not just the ones that are.

At tick 27, she catches the RELAY-B pip flare. Her eyes narrow. "Backup relay just went amber. Something happened to its stack."

**Minute 2:00 -- Diagnostic Phase**

She scrubs directly to tick 25. She inspects RELAY-B's buffer at ticks 25, 26, 27, 28 in sequence. She watches the routing signals get evicted one by one as environmental scans pile in. She checks the eviction policy: LRU (least recently used). The routing signals were the oldest entries because they arrived first and hadn't been refreshed since SCOUT-A's last ping at tick 16. The environmental scans were newer -- arriving every 3-4 ticks from an automated environmental sensor hook.

"The eviction policy is wrong for this use case. LRU evicted the most important signals because they were the oldest. A priority-based eviction policy would have kept the routing signals and dumped the environmental data. This is a configuration error, not a combat error."

She places the diamond at tick 27. First try.

**Minute 3:30 -- The Unlock**

When the signal genealogy materializes, Nina leans forward. This is the tool she's been wanting since Mission 3. She traces the signal flow backward from the striker overrun, through the dead relay, to the backup relay's buffer failure, to the original scout transmission chain. She builds the full causal graph in her head.

"This is an incident postmortem tool. The game just gave me Jaeger/PagerDuty in a video game." She unlocks the signal genealogy and immediately starts planning how she'll use it on her next factory mission. She wants to see whether her own configs have backup relay buffer vulnerabilities.

**Minute 6:00 -- Reflection**

Nina spends time in the debrief not because the mission requires it but because the tools are genuinely useful. She examines the FPG bracket (9 ticks between tick 18 and tick 27) and the secondary gap (7 ticks between tick 27 and tick 34). She notes that the two false pivots *bracketed* the real EDT -- one before, one after. The real failure was sandwiched between two spectacular distractions.

She writes in the game's note field: "Classic analyst error -- spectacular events mask subtle system failures. The relay death was the proximate trigger, but the buffer overflow was the enabling condition. If the backup relay's buffer had been clean, the signal chain would have been restored within 2 ticks of the relay's destruction. EDT sits between the two false pivots, invisible unless you look at buffer state."

**UI annotations:**
- Scrubber tick inspection: clicking any tick while an agent is selected shows that agent's full buffer state in a side panel, identical to the buffer column visualization from Missions 1-4 -- the familiarity is deliberate; the player uses Mission 1's learned visual vocabulary to read Mission 7's diagnostic challenge
- Note field: a collapsible text area at the bottom of the debrief, auto-saves, persists with the mission record, visible in the player's mission history -- designed for exactly this kind of analytical journaling
- FPG bracket with secondary gaps: the primary teal bracket (tick 18 to tick 27) uses the standard 4px solid style; the secondary bracket (tick 27 to tick 34) uses 2px dotted style in a lighter teal; both brackets have tick labels above them in 10pt grey text

---

## Player Journey 4: Santi, 14, Plays Mobile Games and Watches Gaming TikToks

**Context:** Santi downloaded Robot Uprising because he saw a clip of the filter puzzle on TikTok (the Mission 1 "drag the junk out" clip). He's breezed through Missions 1-6 mostly on instinct -- good spatial reasoning, minimal analytical engagement with the debrief tools. He's never voluntarily scrubbed a timeline.

**Minute 0:00 -- Boot Log**

He reads the briefing fast. `FIND THE MOMENT IT WAS DECIDED.` Cool. `YOUR FIRST INSTINCT WILL BE WRONG.` Whatever. He's ready to watch a battle.

**Minute 0:15 -- Sealed Watch**

Santi watches the battle like a movie. The relay destruction at tick 18 is awesome -- the shatter animation is sick. The striker overrun at tick 34 is brutal. He's narrativizing hard: "The relay died and then everything collapsed, GG."

He does not notice RELAY-B's pip flare at tick 27. He wasn't looking at background units.

**Minute 2:00 -- First Guess**

He grabs the diamond and slams it on tick 18. Instant.

The terminal responds: `THIS WAS DRAMATIC. BUT WAS IT DECISIVE?` Santi frowns. "What? That was clearly the turning point." He reads the prompt: `SCRUB BACKWARD. LOOK AT WHAT HAPPENED BEFORE.`

"But tick 18 IS early. What could have happened before tick 18 that matters?" He's confused. He tries tick 34 instead -- the striker overrun.

The terminal: `TWO UNITS LOST. BUT WERE THEY ALREADY LOST? SCRUB BACKWARD. LOOK FOR THE CAUSE OF THE CAUSE.`

**Minute 3:00 -- Frustration and Learning**

Santi realizes the game won't accept either dramatic moment. He starts scrubbing -- for the first time in his entire playthrough, he's actually using the timeline scrubber to inspect agent states. He's scrubbing backward from tick 34, clicking on different agents at each tick.

At tick 30, he clicks a striker. Its buffer shows: no targeting data. Where's the targeting data? He remembers from Mission 3 that strikers get targeting data from relays. He clicks RELAY-B. Buffer: 12/12, all environmental noise. "Wait. Why is the backup relay full of junk? This is like Mission 1!"

He scrubs backward to find when RELAY-B's buffer filled up. Tick 27: three routing signals evicted. Tick 26: buffer at 11/12. Tick 25: buffer at 10/12.

"Oh! The backup relay's memory got filled with garbage and it couldn't forward the targeting signals. That's why the strikers walked into the trap!"

**Minute 5:00 -- Correct Placement**

He places the diamond at tick 27. The terminal confirms. Santi's face changes. He didn't just solve a puzzle -- he understood something about cause and effect that he hadn't grasped before. The dramatic event wasn't the cause. The invisible buffer failure was.

He watches the signal genealogy unlock animation with genuine interest. For the first time, he voluntarily explores a debrief tool.

**Minute 7:00 -- The Shift**

On his next mission (Mission 8), Santi opens the debrief and looks for the signal genealogy panel. He's never voluntarily entered the debrief before. The false pivot literacy tutorial didn't just teach him a concept -- it changed his relationship with the analytical layer of the game.

**UI annotations:**
- Multiple wrong guesses: the game tracks guess count; after 3 wrong guesses, an additional hint appears: `[>>] HINT: INSPECT THE BACKUP RELAY'S BUFFER STATE BETWEEN TICK 20 AND TICK 30.` -- this prevents hard-stuck players from abandoning the mission without becoming overly directive
- Hint escalation: after 5 wrong guesses, the hint becomes more specific: `[>>] HINT: CLICK ON RELAY-B AT TICK 27. LOOK AT WHAT WAS EVICTED.` -- the game would rather give away the answer than lose the player
- First voluntary debrief tracking: the game internally notes when a player opens the debrief voluntarily for the first time after this mission, as a metric of tutorial effectiveness

---

## Strengths

### Teaches Through Experience, Not Explanation
The mission never defines "false pivot." It never explains the EDT algorithm. It never says "dramatic events can be misleading." Instead, the player commits to a wrong interpretation and discovers the right one through their own investigation. The lesson is discovered, not delivered. This follows the same pedagogical principle as Mission 1's filter puzzles -- hands before head, tactile before conceptual -- but applied to a metacognitive skill (questioning your own narrative instincts) rather than a mechanical one (dragging cards out of a buffer).

### Recontextualizes Every Previous Debrief
After this mission, the player retrospectively understands that every debrief they've done in Missions 1-6 may have contained false pivots they didn't notice. The tutorial doesn't just teach forward -- it reframes backward. This creates a powerful motivation to replay earlier missions with the newly unlocked signal genealogy, extending content value without creating new content.

### Creates a Natural Unlock Gate for Signal Genealogy
Signal genealogy is a complex visualization tool that would be overwhelming if available from Mission 1. Gating it behind the false pivot tutorial means the player first encounters the tool in a context where they have a *specific question to answer* ("where did RELAY-B's signals go?"), not as an abstract visualization to explore. The tool is discovered as an answer to a felt need, not as a feature in a menu.

### The Socratic Wrong-Guess System Preserves Dignity
The mission doesn't say "wrong." It asks a question. This is critical for player psychology -- being told you're wrong is punishing; being asked to think harder is engaging. The escalating hint system ensures no player is permanently stuck while preserving the discovery moment for as long as possible.

### Campaign Pacing Reset
After Missions 5-6 (factory building, open-ended design), Mission 7 is a deliberate tempo change. The player isn't building anything. They're analyzing. This rest-from-creation provides cognitive recovery while teaching a skill that makes all future creation more informed.

---

## Weaknesses

### The Pre-Scripted Battle Breaks Player Agency
For six missions, the player has been the architect. In Mission 7, they're a spectator. This can feel like the game took away their tools. Some players will resent watching "someone else's failure" and want to fix the config rather than analyze it. **Mitigation:** The narrative frames this as forensic analysis of a past operation -- the player is an intelligence analyst reviewing a historical event, not a commander who lost their army. The Predecessor's briefing reinforces this: "This is not your battle. This is your lesson."

### The Correct Answer Requires Buffer State Inspection
If a player has not internalized the buffer visualization from Missions 1-4, they may not know to click on RELAY-B and inspect its buffer at tick 27. They might scrub the timeline watching only unit movements on the board, which won't reveal the buffer overflow. **Mitigation:** The Socratic prompts after wrong guesses direct attention toward "what happened before" and eventually toward specific agents and tick ranges. The hint escalation system ensures even a player with weak buffer-reading skills will be guided to the answer.

### The +/-2 Tick Tolerance May Feel Arbitrary
The EDT is at tick 27. If a player places the diamond at tick 25 or tick 29, they're technically wrong. But the buffer overflow began at tick 25 (buffer at 10/12, beginning to stress) and wasn't fully manifest until tick 28 (all routing signals evicted by tick 28). A player who places the diamond at tick 25 has the right *intuition* but the wrong *precision*. **Mitigation:** The +/-2 tolerance window (ticks 25-29) accommodates this. If a player places the diamond at tick 25 exactly, they're within tolerance and the mission accepts it. If they're at tick 24 or earlier, the Socratic prompt says: `YOU'RE CLOSE. THE FAILURE WAS BUILDING AT THIS POINT, BUT HAD NOT YET BECOME IRREVERSIBLE. SCRUB FORWARD SLIGHTLY.`

### Signal Genealogy Unlock Creates a "Before/After" Split in Campaign
Players who replay Missions 1-6 after Mission 7 have signal genealogy available. Players playing linearly through the campaign do not have it until Mission 7. This means the "best" way to play Missions 1-6 is to play them a second time with signal genealogy. This is either a feature (replay value) or a frustration (incomplete first playthrough), depending on the player.

---

## Interaction Effects

### With Two-Act Debrief (4.04b)
Mission 7 inverts the two-act structure. Normally, Act 1 is the sealed watch (emotional) and Act 2 is the debrief (analytical). In Mission 7, Act 1 is the sealed watch as usual, but Act 2 is a *puzzle* -- the diagnostic challenge. The debrief tools don't materialize automatically; they emerge as the player scrubs and investigates. This teaches the player that the debrief is not a passive summary but an active investigation space -- a lesson that transfers to all future debriefs.

### With False Pivot Gap Metric (4.26)
The FPG bracket that appears after correct identification teaches the player to read FPG in a context where they already viscerally understand what it represents. They experienced a 9-tick gap between the most dramatic event and the true cause. The teal bracket spanning from tick 18 to tick 27 *is* that experience, quantified. Every future FPG number they encounter will map to this first embodied understanding.

### With EDT Trajectory Career Metric (4.25)
The Diagnostic achievement is the player's first explicit engagement with EDT as a concept. After this mission, the player will notice their EDT stats in career metrics and understand what they represent -- not just a number, but the location of a hidden truth in every match they play.

### With Config Necropsy Culture (7.10)
The false pivot literacy tutorial teaches the vocabulary that config necropsy posts use. A player who has completed Mission 7 reads `FPG: 48` in a community post and immediately understands: "The poster found a hidden cause that was 48 ticks earlier than the obvious one." Without Mission 7, that number is meaningless jargon. This mission is the community vocabulary onboarding.

### With Filter Puzzles (5.01)
The buffer overflow that constitutes the real EDT is deliberately designed to echo Mission 1's core lesson: buffers full of noise cause agent failure. The player who cleaned a contaminated buffer in Mission 1 now sees what happens when a contaminated buffer is NOT cleaned -- in real-time, with consequences. The pedagogical loop closes: Mission 1 taught the mechanic, Mission 7 teaches the stakes.

### With Pivot Accuracy Stat (4.27)
If pivot accuracy tracking is implemented, Mission 7 is the calibration event. The player's first recorded pivot guess (correct or incorrect) establishes a baseline for their diagnostic accuracy trajectory. Players who get it right on the first try start with 100% pivot accuracy; players who take three guesses start lower. This creates an early-career stat that the player can track and improve.

---

## Comparable Games and Media

### Return of the Obra Dinn -- Forensic Deduction as Primary Gameplay
Lucas Pope's masterpiece puts the player in a position of watching scripted death scenes and deducing the identities and fates of 60 crew members. The player watches events unfold, then uses logical deduction to figure out what actually happened. Mission 7 compresses this structure into a single scene: watch the battle, deduce the true pivot. The key parallel is that both games make *watching and reasoning* the primary verb, not *acting*.

### Ace Attorney -- Cross-Examination as Puzzle
In Phoenix Wright, the player listens to witness testimony (a narrative), identifies contradictions (false pivots in the testimony), and presents evidence that reveals the true version of events. The Socratic wrong-guess prompts in Mission 7 function like the "Press" action in Ace Attorney -- asking the witness (the timeline) to elaborate until the contradiction is exposed.

### Into the Breach -- Perfect Information Puzzle Meets Consequence
Into the Breach shows you exactly what the enemy will do next turn. The puzzle is figuring out how to prevent it. Mission 7 inverts this: it shows you what happened, and the puzzle is figuring out *why*. Both games treat the visible as the surface layer of a deeper mechanical truth.

### Flight Accident Investigation (Real-World)
Aviation crash investigation methodology teaches investigators to look past the "probable cause" (the dramatic final event) and find the "root cause" (the systemic failure that enabled the final event). The NTSB's famous distinction between "contributing factors" and "probable cause" maps exactly to the false pivot / EDT distinction. Mission 7 is, structurally, a simplified NTSB investigation where the player traces a failure chain backward through time.

### Chess Post-Game Analysis
In competitive chess, the "critical moment" of a game is often not the blunder that ended it, but a subtle inaccuracy 10-15 moves earlier that created the structural weakness the blunder exploited. Chess engines show this: the evaluation graph's first significant dip is rarely the same move as the game-ending mistake. Mission 7 teaches the same lesson: the moment the game *looked* lost and the moment the game *was* lost are different moments.

---

## Sensory Description

### The Boot Log Warning

The terminal text is the standard green monospace on black. But the final line -- `YOUR FIRST INSTINCT WILL BE WRONG` -- types in amber instead of green. Each letter appears with a slightly heavier keystroke sound than normal terminal text: a deeper *tock* instead of the usual light *tick*. After the line completes, it pulses once -- the amber brightens to near-white for 0.3 seconds, then dims back to amber. The pulse is accompanied by a low sub-bass thrum, felt more than heard, like a distant warning siren dampened by concrete walls. The line holds for 2.5 seconds before the terminal clears.

### The Relay Destruction (Tick 18)

The most spectacular visual moment in the mission. The relay unit at D5 is a small cylindrical sprite with rotating signal rings -- two concentric circles of cyan dots orbiting the central body, representing active signal routing. When the enemy unit strikes, the impact is a sharp white flash at the point of contact, followed by the relay's sprite fragmenting into 12-16 angular shards that scatter in a radial pattern. The signal rings shatter simultaneously -- each cyan dot becomes an independent particle that spirals outward, trailing a fading cyan streak. The signal lines that connected the relay to scouts and strikers snap sequentially, left to right, each snap producing a descending pitch *crack* -- like guitar strings breaking one after another, each lower than the last. The soundscape shifts: where there was a subtle hum of active relay traffic (a warm harmonic drone at 220Hz), there is now static -- grey noise that rises to fill the harmonic void, then fades over 2 seconds. The destroyed relay leaves behind a dark scorch mark on the tile and a faint ghost-outline of its signal rings that persists for 5 ticks, gradually fading.

### The Buffer Spill (Tick 27)

Almost nothing happens visually. RELAY-B's sprite continues its idle animation -- the signal rings orbit normally. The only tell is the buffer health pip: a 6x6px circle at the tile's base that transitions from teal (healthy) to amber (stressed) over two ticks. At tick 27, the pip flares to bright amber for exactly one frame -- 16.7 milliseconds at 60fps -- before settling to a dim amber glow. There is no sound effect. The background ambient track continues uninterrupted. The buffer spill is, by design, the quietest moment in the entire mission. The contrast between tick 18's spectacular destruction and tick 27's silent failure is the entire lesson, rendered in audiovisual terms.

### The Diamond Dock

The pivot marker sits in a rectangular dock centered below the timeline scrubber. The dock is a dark translucent panel, 200x60px, with rounded corners and a 1px border in dim gold. The diamond icon inside is 32x32px, rendered in the same warm gold as the EDT diamond in standard debriefs, with a subtle bobbing animation -- rising and falling 2px on a 3-second cycle, like something buoyant floating in still water. When the player hovers, the diamond brightens and the dock border glows. When grabbed, the diamond lifts out of the dock with a soft *click* (a dry mechanical sound, like unlatching a case), and a thin gold thread trails from the diamond to the dock like an umbilical, stretching and fading as the diamond moves toward the timeline.

### The Correct Placement Reveal

When the diamond locks at tick 27, a gold pulse radiates outward from the placement point along the timeline in both directions -- a warm light wave that reaches both ends of the scrubber in 0.5 seconds. The pulse passes through the false pivot positions (ticks 18 and 34), and as it passes, the grey triangles materialize -- as if the gold light revealed what was hidden. The teal FPG bracket sweeps in immediately after, with its standard left-to-right highlighter animation and ascending fifth chord.

Then the signal genealogy graph draws itself below the timeline. Agent nodes appear one by one in a left-to-right sequence, each accompanied by a soft *blip* (a short sine wave at the agent's characteristic frequency -- scouts are higher pitch, relays midrange, strikers lower). Edges draw themselves as signal transmissions: thin cyan lines that animate along their path, like electrical current flowing through a circuit diagram. When the animation reaches tick 27, RELAY-B's outgoing edges stop drawing. The partial edges that were in progress fade from cyan to grey to nothing. A 0.8-second silence follows -- no ambient, no interface sounds, just the absence of the signals that should have continued. Then the remaining edges resume drawing, but now they're fewer, thinner, dimmer. The visual story of the signal chain's death is told through what *stops happening*, not through what starts.

### The Achievement Toast

The "Diagnostic" achievement slides in from the right edge of the screen: a dark panel with a gold border, containing the gold diamond icon (now earned, no longer a dock item) and the text in clean sans-serif: "DIAGNOSTIC -- You found the real pivot." Below, in smaller grey italic text: "Not the loud one -- the right one." The toast holds for 4 seconds, accompanied by a warm two-note ascending chime (root and major third, in the same harmonic family as the FPG bracket's fifth). The toast then slides back off-screen to the right.

---

## The TikTok Clip

**15-second scenario:** Split-screen. Left: the sealed watch. Right: the player's face (or a generic reaction overlay). The relay explodes at tick 18 -- player reacts: "Oh that's GG, relay's done." Striker overrun at tick 34 -- player nods: "Yep, it's over." Cut to the diagnostic phase. Player confidently drops diamond on tick 18. Terminal text: `THIS WAS DRAMATIC. BUT WAS IT DECISIVE?` Player's face: confusion. Fast-forward scrubbing. They click on the backup relay. Buffer visualization: amber, full, noise everywhere. Player's eyes widen. They scrub to tick 27. The buffer spill frame. "IT WAS THE BACKUP RELAY'S BUFFER?!" They drop the diamond at 27. `CORRECT. THE LOUDEST MOMENT IS RARELY THE DECISIVE ONE.` Player sits back, staring at the screen. Text overlay: "this game teaches you to think differently." Cut to black. Game logo.

This clip works because:
1. The reversal is emotionally readable without game knowledge -- "they thought X caused it, but actually Y did" is universal
2. The backup relay's dirty buffer is visually recognizable from Mission 1 clips already circulating on TikTok -- viewers who've seen the filter puzzle clip will connect them
3. The terminal's final line is quotable and screenshot-worthy
4. The player's genuine surprise is the content -- no acting needed, the mission is designed to produce it

---

## Open Questions / Discovered Aspects

**5.24a -- Difficulty variants of the scripted battle:** Should the campaign offer one scripted battle or should there be a "hard mode" variant where the EDT is harder to find (e.g., two buffer-related failures at adjacent ticks, requiring the player to determine which was causal and which was downstream)? A harder variant could serve as a Gauntlet challenge ("Find the Pivot" solo challenge mode).

**5.24b -- Community-submitted "Find the Pivot" replays:** After completing Mission 7, the player could access a curated library of real player matches where the EDT is known but hidden, and attempt to identify the pivot as a replayable diagnostic challenge. This extends the tutorial format into endgame content.

**5.24c -- The "over-diagnostic" risk:** Does teaching false pivot literacy cause players to *always* distrust the obvious? In matches with FPG: 0 (where the dramatic moment IS the real pivot), will Mission 7 graduates waste time looking for a hidden cause that doesn't exist? Should a follow-up mission (Mission 8?) include a match with FPG: 0 to calibrate: "Sometimes the obvious answer is correct."

**5.24d -- Accessibility of the buffer pip tell:** The 6x6px amber pip at tick 27 is the only visual tell during the sealed watch. For players with low vision or color-differentiation challenges, this tell is effectively invisible. Should the sealed watch include an optional "attention indicator" overlay for accessibility -- a subtle highlight on units experiencing buffer stress?

**5.24e -- Signal genealogy unlock timing vs. player readiness:** Some players may reach Mission 7 without strong buffer-reading skills (having brute-forced Missions 5-6 through factory volume rather than config quality). For these players, signal genealogy unlocking is premature -- they won't use it effectively. Should the unlock be gated on Mission 7 completion *and* a minimum debrief engagement metric from Missions 5-6?
