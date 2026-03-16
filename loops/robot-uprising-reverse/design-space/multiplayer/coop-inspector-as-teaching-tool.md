# Co-op Inspector as Teaching Tool

**Aspect:** 7.02d — War Room co-op forces deep Inspector usage; how co-op debrief habits transfer to improved single-player analysis; co-op as the "Inspector tutorial" the game otherwise lacks

**Category:** multiplayer/cooperative
**Wave:** 7 — Multiplayer & Community

---

## The Teaching Problem the Inspector Faces

The Inspector is Robot Uprising's most important screen and its least likely to be used well. The locked three-screen loop mandates the emotional→analytical sequence (Sealed Watch THEN Inspector), but nothing forces the player to actually *engage* with the Inspector's depth. A player can click through the timeline once, glance at the context bars, mutter "I guess the relay died," and hit Plan without ever opening a decision trace, reading a signal genealogy, or understanding why tick 22 was the pivot point that killed their army.

This is not a hypothetical — it's a well-documented pattern across strategy games. Into the Breach's damage preview system is brilliant, but replays go unwatched. Slay the Spire's run history exists, but most players never cross-reference synergies between decks. StarCraft II's replay system is best-in-class and used by maybe 5% of the player base. The analytical tools exist. The motivation to use them doesn't.

The Inspector's analytical tools — timeline scrubber, click-to-inspect, decision trace, context window chart, event log — represent a full diagnostic workbench. Using them well is a *skill* that must be learned. And the game has no explicit mechanism to teach that skill. Missions teach context windows (M1), rules (M4), hooks (M3), skills (M2). No mission teaches "how to read a decision trace" or "how to find the root cause of a failure."

**War Room co-op solves this.** By making one player's *entire role* the Inspector, it creates the missing tutorial.

---

## The War Room Teaching Mechanism

### Why It Works: The Analyst Has No Other Job

In War Room co-op (Model C from 7.02), Player B — the Analyst — cannot edit blueprints. They cannot configure rules, hooks, skills, or context. During the Plan phase, they can only annotate and suggest. Their *only moment of agency* is the Inspector phase, where they have exclusive access to every analytical tool.

This structural constraint transforms the Inspector from "optional deep-dive" to "the thing you are here to do." The Analyst doesn't browse the Inspector casually — they mine it like their partner's success depends on it, because it does. Every diagnostic card they share, every tick they identify, every signal chain they trace is a tangible contribution to the team.

Compare this to solo play: the Inspector competes with the player's desire to "just try again." In War Room, trying again requires the Analyst's diagnosis first. The Inspector isn't competing with impatience — it's the rate-limiting step on the gameplay loop.

### The Verbalization Requirement

The Analyst must translate visual data into words. This is cognitively demanding in exactly the way that builds deep understanding. When you can *see* that RELAY-B's context bar turned red at tick 22, you know something happened. When you must *explain* to your partner "RELAY-B's context window filled with terrain observations because its filter wasn't set to deprioritize terrain, so when SCOUT-A's enemy alert arrived at tick 23, it got evicted immediately — the relay never forwarded it, which is why your strikers didn't converge" — you've performed root cause analysis.

Verbalization forces the Analyst to:
1. **Identify the failure** (strikers didn't converge)
2. **Trace backward** (no signal → relay didn't forward → alert was evicted)
3. **Find the root cause** (filter configuration → terrain flooding the buffer)
4. **Propose a fix** (change the filter priority or add a compress skill)

This is the exact diagnostic chain the game wants solo players to perform. War Room makes it mandatory and social.

### The Architect's Reflected Learning

The Architect (Player A) doesn't use the Inspector directly, but they *hear* Inspector-level analysis every retry cycle. Over 5-10 War Room sessions, the Architect develops a vocabulary for discussing failures: "buffer overflow," "signal latency," "eviction priority," "decision trace." They learn what questions to ask: "What was in the relay's buffer when the alert arrived?" "Did the hook fire or was the condition never met?" "How many ticks between the scout spotting and the striker engaging?"

When the Architect returns to solo play, they carry this vocabulary and these questions into their own Inspector sessions. They know what to look for because they've heard an Analyst describe it dozens of times.

---

## Five Teaching Configurations

### Configuration A: "The Apprenticeship" (Asymmetric Skill)

**How it works:** An experienced player takes the Analyst role. A newer player takes the Architect role. The experienced player uses Inspector fluency to teach the newer player how the game's systems work — not through abstract tutorials but through live diagnosis of the newer player's designs.

**The teaching loop:**
1. New player builds a configuration (their first Scout-Relay-Striker setup)
2. Both watch the Sealed Watch — the new player sees their design fail
3. The experienced Analyst opens the Inspector, finds the failure point, and walks the new player through it: "See this? Your scout spotted the enemy at tick 8. Look at the hook — it fired. The signal went to channel 'alert.' But your striker isn't listening on 'alert.' It's listening on 'danger.' The channel names don't match."
4. New player fixes the channel name. Both watch. This time it works.

**What the new player learned:** Not "hooks need matching channel names" as an abstract rule, but "MY hook didn't work because of THIS specific mismatch" as lived experience. The lesson is concrete, situated, and emotionally anchored in the failure they just watched.

**Strengths:**
- Teaches the game's deepest systems through concrete examples, not abstractions
- The experienced player naturally adapts explanations to the new player's level
- Creates social bonds — "remember when you had the wrong channel name?" becomes a shared story
- Experienced player finds teaching rewarding (explaining deepens their own understanding)

**Weaknesses:**
- Requires an experienced player willing to be Analyst instead of playing the full game
- Risk of backseat gaming — the Analyst tells the Architect exactly what to build, removing agency
- New player may become dependent on external diagnosis instead of developing their own Inspector skills

### Configuration B: "The Peer Investigation" (Matched Skill)

**How it works:** Two players of similar skill level alternate Architect/Analyst roles between missions. Each player develops both building and diagnostic skills, with the advantage that the Analyst role is explicitly scoped and supported by the Inspector's full toolkit.

**The teaching loop:**
1. Player A architects Mission 5. Player B analyzes.
2. Player B architects Mission 6. Player A analyzes.
3. Both players develop Inspector fluency because both spend every other mission as the Analyst.
4. The verbal debriefs create a shared analytical vocabulary that both players carry into solo play.

**Strengths:**
- Both players learn both roles — no skill imbalance
- Role alternation prevents either role from feeling secondary
- Matched skill means genuine collaborative problem-solving, not one-directional teaching

**Weaknesses:**
- The Analyst role is harder than the Architect role for new players — matched-skill pairs may both struggle with diagnosis
- Role switching between missions disrupts flow (must mentally context-switch from builder to analyst)

### Configuration C: "The Diagnostic Challenge" (Inspector Skill Drill)

**How it works:** Special co-op missions designed *specifically* to train Inspector skills. The mission has a pre-built configuration (no Plan phase). The Architect watches a replay of a failed battle. The Analyst uses the Inspector. Together, they must identify the failure and propose a fix — then the game reveals whether they were right.

**The teaching loop:**
1. Game presents a pre-configured battlefield mid-battle (tick 15 of 40)
2. The Analyst examines the Inspector data. The Architect watches the replay.
3. Both discuss: "What went wrong? When did it go wrong? What should change?"
4. They submit a diagnosis: "RELAY-B's buffer overflow at tick 22 caused by missing terrain filter"
5. Game reveals the intended diagnosis. Partial credit for close answers. A "model diagnostic" shows the ideal Inspector workflow — which tools to use, in what order, to find this failure.

**Strengths:**
- Directly teaches Inspector usage as a skill, not a side effect
- The "model diagnostic" explicitly demonstrates efficient Inspector workflows
- Removes Plan phase entirely — pure analytical training
- Can be replayed for practice (like training puzzles)

**Weaknesses:**
- Less game-like, more tutorial-like — may feel like homework
- Removes the emotional stake (not YOUR design that failed)
- Limited to pre-authored scenarios (can't surface emergent failures)

### Configuration D: "The Blind Debrief" (Communication Under Constraint)

**How it works:** After the Sealed Watch, the Analyst sees the Inspector but the Architect sees NOTHING — not even the board replay. The Architect's screen goes dark. The Analyst must verbally reconstruct the entire battle: what happened, when, why, and what to change. The Architect rebuilds entirely from the Analyst's description.

**The teaching loop:**
1. Both watch the Sealed Watch together
2. Screens diverge: Analyst gets full Inspector, Architect gets a black screen with only a notepad
3. Analyst must narrate: "Okay. The scout patrolled north. Tick 4, it spotted two enemies in column F. The hook fired — I can see the signal leaving on 'north-alert.' It reached the relay at tick 6. The relay's buffer... let me check... it was at 4/12, plenty of room. It forwarded to 'striker-command.' But the striker was at E3, three tiles away. By the time it arrived at tick 8, the enemies had already moved to D5 — adjacent to the relay. The relay was eliminated at tick 9. After that, no more signals. The second wave had no information."
4. The Architect takes notes and redesigns based entirely on this verbal account

**Strengths:**
- Maximum verbalization pressure — the Analyst must describe EVERYTHING
- Teaches the Analyst to build a complete narrative, not just identify one failure point
- The Architect develops a mental model of the Inspector's data without seeing it — when they later use the Inspector solo, they already know what's there
- Creates incredible "telephone game" moments when the verbal description leads to a creative misinterpretation that accidentally produces a better design

**Weaknesses:**
- Extremely demanding for the Analyst — cognitive overload risk
- Frustrating for the Architect who can't even see the board
- Slow — each debrief takes 3-5x longer than a visual one
- Only viable for experienced players who already know Inspector vocabulary

### Configuration E: "The Diagnostic Duel" (Competitive Inspector)

**How it works:** Two players both play the Analyst role on the SAME failed battle. Each independently analyzes the Inspector data and proposes a fix. Then they compare: whose diagnosis was more accurate? Whose proposed fix is more elegant? A scoring system evaluates diagnostic quality.

**The teaching loop:**
1. A pre-built configuration runs and fails (shared scenario)
2. Both players independently examine the Inspector (split screen, each seeing the full Inspector)
3. Timer: 90 seconds to identify the failure point, root cause, and proposed fix
4. Both submit diagnoses
5. Game evaluates: Was the failure point correct? (tick number within ±2) Was the root cause identified? (matching the "intended" root cause) Is the proposed fix valid? (would it actually work?)
6. Both see each other's analyses. Discussion follows.

**Strengths:**
- Gamifies Inspector usage — turns analysis into competition
- Teaches that multiple valid diagnoses can exist for the same failure
- The comparison reveals different analytical approaches (one player starts from the failure, the other traces from the beginning)
- Builds diagnostic confidence through validation ("I got the same answer as you")

**Weaknesses:**
- Requires pre-authored scenarios with "correct" answers — limits emergent learning
- Competitive framing may discourage players who are slower at analysis
- Not a full game mode — more of a training drill

---

## The Habit Transfer Mechanism

The core claim: **War Room co-op habits transfer to improved solo Inspector usage.** Here's how:

### What Transfers

1. **The question habit.** Solo players who've been Analysts learn to ask specific questions: "What was in the buffer when it overflowed?" "Did the hook condition evaluate true or false?" "How many ticks between detection and response?" These questions map directly to Inspector tools — buffer state at tick N, decision trace, event log.

2. **The root-cause instinct.** Analysts learn that the visible failure (striker didn't kill the enemy) is never the root cause. The root cause is upstream: a signal was late, a buffer was full, a rule didn't match. Solo players who've done War Room sessions skip the symptom and go straight to the context window chart looking for the inflection point.

3. **The signal genealogy reflex.** In War Room, when the Analyst says "the signal was late," the Architect asks "late from where?" This teaches both players to trace signals backward through the chain. In solo play, this becomes automatic — click the signal, trace it back, find the bottleneck.

4. **The tick vocabulary.** War Room players develop a habit of speaking in tick numbers: "tick 22 was the pivot," "the relay died at tick 9," "the scout's first signal was tick 4." This temporal precision transfers to solo Inspector usage — players scrub to specific ticks instead of watching the whole replay.

5. **The comparison habit.** After multiple War Room sessions, players naturally compare runs: "last time the relay died at tick 9, this time it survived to tick 15 — the filter change bought us 6 ticks." Solo players carry this comparative instinct into their own retries, using the Inspector to measure improvement quantitatively.

### What Doesn't Transfer

1. **The verbalization.** Solo players don't narrate their Inspector findings aloud. Some of the depth comes from having to explain to another person. Without the social pressure, solo analysis can remain shallow.

2. **The division of labor.** In War Room, the Analyst focuses exclusively on diagnosis. In solo play, the same player must also build — and the building impulse ("let me just try a different hook") competes with the diagnostic impulse ("let me understand why this hook failed").

3. **The emotional buffer.** In War Room, the Architect owns the failure ("my design broke") and the Analyst provides comfort through clinical analysis ("here's why it broke, here's how to fix it"). Solo players must be both emotionally invested and analytically detached — harder without a partner.

### Design Implications for Solo Inspector

War Room's success as a teaching tool reveals what the solo Inspector is missing:

1. **Guided diagnostic questions.** The Inspector should surface questions: "RELAY-B's context overloaded at tick 22. What was in the buffer? [Click to inspect]" This mimics the Analyst's guiding questions.

2. **Root cause highlighting.** When a unit is eliminated, the Inspector could automatically trace the causal chain backward and highlight the root cause tick with a gold diamond marker. This mimics the Analyst's "it wasn't the striker — it was the relay at tick 22" insight.

3. **Fix suggestions.** After identifying a failure, the Inspector could propose "Common fixes for context overload: add a filter (context config), add compress skill (skill slot), reduce hook listeners (context config)." This mimics the Analyst's proposed fix in the verbal debrief.

4. **Comparative metrics.** The Inspector should prominently display "Relay survived to tick 15 (was tick 9 last run)" when retrying. This mimics the War Room comparison habit.

These solo Inspector features should unlock *after* the player completes their first War Room session — diegetically, the AI learned from observing the human-human diagnostic conversation.

---

## The "Inspector Tutorial the Game Otherwise Lacks"

### The Gap in the Tutorial Arc

The locked 10-mission campaign teaches:
- M1: Context windows (what agents remember)
- M2: Skills (what agents can do)
- M3: Hooks (how agents communicate)
- M4: Rules (how agents decide)
- M5: Factory (building your army)
- M6-7: Command agent (meta-level design)
- M8-10: Full system (everything together)

Nowhere in this arc is there a mission dedicated to "how to use the Inspector to diagnose failures." The Inspector is always available, but it's treated as a tool, not a subject. It's as if a programming course taught variables, functions, loops, and classes — but never taught debugging.

### War Room as Mission 5.5

The ideal placement for War Room co-op as teaching tool is *between* Mission 5 (Factory) and Mission 6 (Command agent). At this point, the player has all four primitives and the factory system. Their configurations are complex enough to produce non-obvious failures. The Inspector's full toolkit is relevant.

A "War Room Training" mission:
1. The game prompts: "Incoming: collaborative diagnostic protocol. Pair with another operative." (Matchmaking or local co-op.)
2. The player takes the Analyst role first (to learn the Inspector deeply).
3. A pre-configured, pre-run battle plays out. Both players watch the Sealed Watch.
4. The Analyst (our player) must find the failure using the Inspector and communicate it.
5. The Architect (partner or AI) implements the fix.
6. Second run succeeds.
7. Roles swap. The player architects while the partner analyzes.
8. The boot log entry reads: "DIAGNOSTIC SUBSYSTEM CALIBRATED. You have learned to see what went wrong. You have learned to say what went wrong. These are not the same skill."

### The AI Analyst Fallback

Not every player has a co-op partner. The game needs a solo War Room mode where the AI plays Analyst. The AI Analyst:
- Uses the Inspector (visible to the player as animated cursor movements and highlight selections)
- Generates diagnostic cards with annotations
- Communicates findings through text bubbles in the suggestion tray
- Adjusts diagnostic depth based on the player's skill level (simple findings for new players, subtle root causes for veterans)
- NEVER directly tells the player what to build — only describes what went wrong and why

The AI Analyst's personality should match the game's narrative voice (see 5.15). If using the Reyes/Unit 0 hybrid, the AI Analyst speaks in Unit 0's observational-empirical register: "RELAY-B context utilization: 100% at tick 22. Contents: 8 terrain observations (all priority: low), 3 ally position signals (priority: medium), 1 evicted entry — the enemy alert from SCOUT-A. ASSESSMENT: terrain data crowded out the critical signal. CONFIDENCE: CERTAIN."

---

## Player Journeys

#### Journey: Anika, 24, Junior Data Engineer

**Context:** Just finished Mission 5 (Factory introduced). Her configurations work but she doesn't understand *why* they fail when they fail. She's been hitting retry and tweaking randomly. Her roommate Jess (a QA engineer, no gaming background) is on the couch watching and asking questions. "Can I try?" "Yeah, there's a co-op mode."

**Minute 0:00 — War Room Setup**
The main menu's co-op panel shows five models as cards with silhouette illustrations. Anika hovers "War Room" — the card flips to reveal: "One builds. One investigates. You meet in the middle." A small animation: two half-circles approaching each other, one glowing cyan (wrench icon), one amber (magnifying glass icon). They click "Start" and Jess picks up the second controller.

The role selection screen: two large cards side by side. LEFT: "Architect — You design the attention system. You configure skills, rules, hooks, and context. You cannot see the diagnostic data." RIGHT: "Analyst — You investigate failures. You have every diagnostic tool. You cannot touch the blueprints." Below each card, a one-sentence description in the game's boot log font: `ARCHITECT: WRITE ACCESS // ANALYST: READ ACCESS + DIAGNOSTICS`.

Anika takes Architect — she knows the systems. Jess takes Analyst — she's a QA engineer, investigation is literally her job.

**Minute 1:00 — The First Plan Phase**
Anika's screen: the standard Plan screen. Production queue with SCOUT-A, RELAY-B, STRIKER-C blueprints. She drags skill slots, sets rules, configures hooks. She's done this five times already in solo play. Comfortable.

Jess's screen: a read-only mirror of Anika's workbench with a notepad panel on the right side. The blueprints are rendered at 70% opacity with small lock icons — visible but untouchable. At the top, a soft amber banner: "Observe the Architect's design. Note what you want to watch during battle." Below the banner, a freeform text area with a blinking cursor.

Jess watches Anika configure. She types in the notepad: "watch the relay — its buffer looks small." A small amber pin appears on Anika's screen next to RELAY-B's blueprint. Anika glances at it, nods. "Yeah, twelve slots should be enough though."

**Minute 3:30 — The Sealed Watch**
Both screens show the same battlefield — Ifugao rice terraces, the board filling with terrace-green tiles and scattered bamboo server racks. The tick clock pulses. Both watch in silence. Scouts patrol. The relay sits in the center, context bar slowly filling — pale blue pips appearing one by one.

Tick 18: an enemy appears in column G. SCOUT-A spots it. A green delivery flash — signal sent on channel "threat-detected." The signal arc traces from the scout to the relay. RELAY-B's context bar jumps — now 10/12 slots filled. The relay forwards to STRIKER-C.

Tick 20: two more enemies appear. SCOUT-A's hook fires again. Another signal to RELAY-B. But the relay's bar is at 12/12 — full. A red pip flashes at the bottom of the bar. The relay jitters — sparking, frozen for one tick. Context overload. The signal was... dropped? The striker doesn't move. Tick 22: the enemies reach RELAY-B. Red flash. Eliminated.

Jess leans forward. "The relay. I told you."

**Minute 4:30 — The Inspector Split**
Anika's screen transitions to a simplified board replay — play/pause/step controls at the bottom, the board in muted colors. No analytical overlays. No buffer state. No signal traces. Just the board. A suggestion tray at the bottom, currently empty.

Jess's screen transforms. The full Inspector blooms: timeline scrubber across the top (40 tick marks, gold diamond at tick 20 marking a significant event). The board is in the center, frozen at tick 0. A sidebar panel shows: Click a unit to inspect. Context window chart. Event log. Decision trace.

Jess has never seen this screen before. But she's a QA engineer. She's read server logs for a living.

**Minute 5:00 — Jess Investigates**
Jess clicks RELAY-B on the board. The sidebar populates: 12 context slots displayed as horizontal bars, each with a label (content type, source, age). She scrubs the timeline to tick 18 — the moment before everything went wrong. The slots show:
- Slots 1-5: terrain observations (all from RELAY-B's own perception — wait, relays have no perception. These are from... she checks the source column... SCOUT-A, received at ticks 3, 5, 8, 11, 14)
- Slots 6-9: ally position signals (from SCOUT-A's position broadcasts)
- Slots 10-12: threat signal (from tick 18, SCOUT-A's enemy detection)

"Anika," Jess says, eyes still on the screen. "The relay's buffer is full of garbage." She scrubs to tick 20. The second threat signal arrives. The eviction logic fires — it evicts slot 1 (oldest terrain observation) to make room, but the incoming signal arrives during the same tick as three more terrain observations from the continuing patrol. The buffer is still full. The context overload triggers.

"The relay is listening to EVERYTHING the scout says," Jess explains. "Every terrain observation, every position broadcast, every single thing. By the time the actual threat signal arrives, there's no room."

She clicks the "Share" button on the context window view at tick 20. A diagnostic card — a static snapshot of the 12 slots with "FULL — 9/12 slots are terrain/position data" written in Jess's handwriting annotation — slides into Anika's suggestion tray.

**Minute 7:00 — The Conversation**
Anika opens the diagnostic card. She sees the buffer state. "Oh. I never set the relay's filter. It's receiving everything on every channel."

Jess: "Can you make it ignore terrain data?"

Anika: "I can set the context config to deprioritize terrain observations. Or I can add a filter that only listens on 'threat-detected' and ignores 'position-update.'" She pauses. "Actually... I think I need to change the scout too. It shouldn't be broadcasting terrain observations to the relay at all. That's the scout's hook — it's set to emit everything it sees."

Jess: "So the bug is in the scout's hook configuration, not the relay's filter?"

Anika stares at the diagnostic card. "It's both. The scout is too chatty AND the relay has no filter. Either fix would work but both together is better."

**Minute 8:30 — The Rebuild and Second Run**
Anika modifies SCOUT-A's hooks: remove the terrain broadcast hook, keep only the threat detection hook. She adds a filter to RELAY-B's context config: priority = [threat, command]; ignore = [terrain, position]. Jess watches on her read-only view, nods.

Second run. Sealed Watch. This time, tick 18: scout spots enemy. Signal fires on "threat-detected." Relay receives it — buffer is at 3/12 (only threat signals now). Relay forwards immediately. Striker converges. Tick 20: kill flash. Clean.

Jess pumps her fist. Anika laughs. "You found it faster than I would have."

**Minute 10:00 — The Transfer Moment**
Later that evening, Anika plays solo Mission 6. Her configuration fails. She opens the Inspector and — for the first time — immediately clicks the relay, scrubs to the failure tick, and checks the buffer state. She finds a different problem (a hook timing issue), but she found it using the same workflow Jess demonstrated. She never needed to be told "click the unit, check the buffer." She watched Jess do it.

**UI Annotations:**
- Analyst Inspector: timeline scrubber top, board center, sidebar right with tabs (Context / Decision / Events / Signals)
- Share button: small amber arrow icon on each Inspector panel, creates a diagnostic card
- Diagnostic card: 200×120px static screenshot with handwriting-style annotation layer, appears in Architect's suggestion tray
- Suggestion tray: horizontal strip at bottom of Architect's screen, cards slide in from right with a soft `plip` sound

---

#### Journey: Marcus, 52, Retired Teacher (Solo with AI Analyst)

**Context:** Mission 6, solo play. Marcus has been struggling with the Command agent — his configurations work in simple scenarios but collapse when enemies attack from two directions. He hasn't been using the Inspector much — he finds the timeline scrubber confusing and the signal traces overwhelming. He notices a new option in the pause menu: "Enable Diagnostic Partner (AI Analyst)."

**Minute 0:00 — Activating the AI Analyst**
Marcus toggles "Enable Diagnostic Partner." A boot log entry scrolls: `DIAGNOSTIC SUBSYSTEM ONLINE. Observation mode active. Analysis will be provided after each engagement.` The Plan screen doesn't change — Marcus still has full control. A small amber eye icon appears in the top-right corner, blinking slowly. The AI is watching.

**Minute 3:00 — After a Failed Sealed Watch**
Marcus's army collapses at tick 25 — both flanks crumble when the Command agent's reroute instruction arrives too late. The Sealed Watch ends. The Inspector loads.

But now, alongside the standard Inspector tools, a "Diagnostic Report" panel appears in the bottom-left. It contains three cards, each generated by the AI Analyst:

**Card 1 — "The Bottleneck":** A screenshot of COMMAND-A's context window at tick 20, with a gold circle around a specific slot. Below: `COMMAND-A received SCOUT-A's east-flank alert at tick 20. Decision trace: reroute instruction queued at tick 21. Signal delivered to STRIKER-B at tick 23. STRIKER-B's evade triggered at tick 24. Enemy arrived at tick 23. Total latency: 4 ticks (detection → response). Question: can you reduce the hop count?`

**Card 2 — "The Silent Scout":** A screenshot of the event log filtered to SCOUT-B. Below: `SCOUT-B detected 3 enemies on west flank between ticks 12-18. No hook fired. Decision trace: SCOUT-B has no rule matching 'enemy_count > 2'. Individual enemy detections don't trigger hooks because the hook condition is 'enemy_group_detected' — SCOUT-B has perception radius 5 but no 'group detection' skill. The enemies were seen one at a time.`

**Card 3 — "The Timing Window":** A context window chart for STRIKER-C with a red region highlighted. Below: `STRIKER-C received the reroute command at tick 23 but was already in 'engage' state from a previous tick 22 rule match. Rules are evaluated once per tick — by the time the reroute arrived, the previous action was committed. The timing window was 1 tick. This is a fundamental signal latency problem, not a configuration error.`

**Minute 4:30 — Marcus Follows the Breadcrumbs**
Marcus reads Card 1. He clicks the gold circle on the screenshot. The Inspector scrubs to tick 20 and opens COMMAND-A's context window. He sees it himself — the same data the AI described, but now he's looking at it directly. He hovers a slot. The tooltip says "Source: SCOUT-A via RELAY-D. Hops: 3. Latency: 3 ticks."

"Three hops," Marcus mutters. He'd never noticed the hop count before. He clicks RELAY-D on the board. Checks its context window. It has a 1-tick processing delay (compress skill runs before forwarding). "If I skip the relay and wire the scout directly to the Command agent..."

He reads Card 2. Clicks on SCOUT-B in the Inspector. Opens the decision trace for tick 14. Sees that the rule `IF enemy_detected → emit on "west-alert"` DID fire — for each individual enemy. But the hook condition `enemy_group_detected` never evaluated true because SCOUT-B doesn't have the group detection capability. "I need to change the hook condition to just 'enemy_detected,' or give the scout a group detection skill."

**Minute 7:00 — The Learning Leap**
Card 3 teaches Marcus something he hadn't understood: rule evaluation is once per tick, and a unit already in an action state can't be rerouted mid-tick. This is a *system constraint*, not a configuration error. The AI Analyst distinguished between "things you can fix" (Cards 1-2) and "things you must design around" (Card 3).

Marcus reconfigures: scouts wire directly to Command (reducing latency by 1 hop). SCOUT-B's hook condition changes to `enemy_detected`. STRIKER-C gets a new rule: `IF reroute_received AND NOT in_combat → change target` — the explicit combat check prevents the timing conflict.

**Minute 9:00 — Solo Mastery**
The next run succeeds. Marcus disables the AI Analyst for Mission 7. But when his configuration fails, he opens the Inspector and thinks: "What would the AI Analyst highlight?" He clicks the failed unit. Checks the context window at the failure tick. Traces the signal chain backward. He finds the problem in 90 seconds — a context overload on a relay that wasn't filtering position broadcasts.

He never needed the AI to find it. He just needed to learn the workflow once.

**UI Annotations:**
- AI Analyst icon: amber eye, 24×24px, top-right corner, blinks at 0.5Hz during Plan and Sealed Watch
- Diagnostic Report panel: bottom-left of Inspector, 300px wide, scrollable list of cards
- Each card: static screenshot with gold annotation circles, descriptive text below in monospace font, clickable elements that scrub the Inspector to the relevant tick/unit
- Card confidence indicator: small colored pip (green = CERTAIN, amber = PROBABLE, red = SPECULATIVE) in the card's top-right corner

---

#### Journey: Kwame, 32, Twitch Streamer & DevOps Engineer

**Context:** Kwame has been streaming Robot Uprising for three weeks. His audience loves the Sealed Watch reactions. But Inspector segments lose viewers — "ResidentSleeper" emotes flood chat when he opens the timeline scrubber. He decides to try War Room co-op live on stream, with his moderator Sasha (a graphic designer, casual gamer) as the Analyst.

**Minute 0:00 — Stream Setup**
Kwame's camera shows his face and Plan screen. A second camera feed (picture-in-picture, bottom-right) shows Sasha's Inspector screen. Chat can see both simultaneously. The overlay shows role labels: "KWAME: ARCHITECT" in cyan, "SASHA: ANALYST" in amber.

**Minute 2:00 — The Comedy of Miscommunication**
Kwame builds an elaborate 5-unit configuration for Mission 7 (the first Command agent mission). Scout, two relays, striker, command. Complex hook wiring. Chat is impressed — his configurations have gotten ambitious.

They run it. The Sealed Watch is beautiful for 15 ticks — scouts patrolling, relays humming, signals flowing. Then tick 16: three enemies appear from the south. SCOUT-A spots them. Signal fires. RELAY-B receives... but the Command agent doesn't react. Tick 18: the enemies reach the base. Game over.

**Minute 3:30 — Sasha's First Investigation**
Sasha has never used the Inspector before. Chat watches her cursor hesitate over the timeline scrubber. She drags it — the board jumps to tick 5. She overshoots — tick 35. She settles on tick 16.

"Okay I see the scout here," Sasha says. She clicks it. The sidebar fills with data she doesn't understand yet. "There's like... numbers? And colors?"

Chat types: "ANALYST DIFF" "This is content" "she's reading the logs like it's a git diff lmaooo"

But Sasha is a graphic designer. She notices the visual patterns before the data. "Kwame — the signal line. The green dashed line goes from the scout to the relay, but then it just... stops. There's no line from the relay to the Command agent."

"What?!" Kwame leans toward his screen. He can't see the signal lines — he only has the basic replay. "Are you sure?"

"Yeah. The line goes scout → relay. Then nothing. The relay is just sitting there, blinking."

**Minute 5:00 — The Debugging Conversation**
Sasha clicks the relay. The context window shows 12 slots — all occupied. She reads the labels aloud: "Terrain... terrain... ally position... terrain... threat from SCOUT-A... terrain... terrain." She pauses. "Kwame, the relay's memory is full of terrain."

Chat erupts: "THE RELAY IS FULL OF DIRT" "buffer overflow speedrun any%" "she found it faster than he would have"

Kwame: "Wait, the relay is receiving terrain observations? I didn't — " He checks his Plan screen's read-only Analyst view. He can see the relay's hooks. "Oh. I set the relay to listen on ALL channels. The scout is broadcasting terrain on 'patrol-data' and threats on 'threat-alert.' The relay is hearing both."

Sasha: "So it's like... the relay's inbox is full of spam and the important email got buried?"

Kwame, laughing: "That's EXACTLY what happened. The relay's context window overflowed because it was subscribed to the wrong channels."

Chat: "UNSUBSCRIBE FROM TERRAIN" "relay needs better email filters" "this is literally my work Slack"

**Minute 7:00 — The Fix and Redemption**
Kwame changes the relay's context config: listen = ["threat-alert"]; ignore = ["patrol-data"]. Second run. This time, tick 16: scout spots enemies. Signal fires on "threat-alert." Relay receives cleanly — buffer at 2/12. Relay forwards to Command. Command issues reroute at tick 17. Striker engages at tick 19. Clean victory.

Both celebrate. Chat spams hearts.

**Minute 8:00 — The Viewer Retention Discovery**
Kwame checks his analytics the next day. The War Room segment had 40% higher viewer retention than his solo Inspector segments. Chat was actively engaged — suggesting things for Sasha to check, debating root causes, celebrating the diagnosis. The Inspector wasn't boring when it was a *conversation*.

He makes War Room co-op a regular stream segment: "Debug Tuesdays." Sasha becomes a recurring guest. Their diagnostic banter — Sasha's visual intuitions translated into Kwame's technical vocabulary — becomes a content format. Chat learns Inspector skills by watching Sasha learn them.

**UI Annotations:**
- Stream overlay: role labels top-center, PIP for Analyst's screen bottom-right
- Signal lines on Inspector: green dashed for delivered, red dashed for failed/dropped, grey ghosted for "would have connected if buffer had room"
- Context window labels: left-aligned text in each slot bar showing content type + source + tick received
- Overflowed signal: a red-flashing slot-shaped outline at the bottom of the context window showing what WOULD have been there

---

#### Journey: Tomás, 14, First Strategy Game (Diagnostic Challenge Mode)

**Context:** Tomás heard about Robot Uprising from a TikTok clip of Kwame's stream. He's at Mission 4 — just learned rules. He's been struggling to figure out why his scouts keep dying. He discovers "Diagnostic Challenges" in the Practice menu — co-op puzzles he can play solo against the AI Analyst.

**Minute 0:00 — Challenge Selection**
The Practice menu shows a grid of diagnostic challenges as hexagonal tiles. Each has a difficulty rating (1-5 stars) and a category icon (buffer = context overload puzzle, hook = signal chain puzzle, rule = decision logic puzzle). Tomás picks a 1-star buffer challenge: "The Overloaded Relay."

**Minute 0:30 — The Pre-Run Setup**
The challenge loads a pre-configured battle. Tomás doesn't get to build anything — the configuration is shown in read-only, with key elements highlighted in gold: RELAY-B's context config panel has a gold border. A text prompt at the top: "This relay failed. Watch the battle. Find why."

The Sealed Watch plays. 30 ticks. At tick 22, the relay overloads and gets stunned. At tick 23, an enemy reaches it. Red flash. Eliminated.

**Minute 1:30 — The Guided Investigation**
The Inspector loads. But it's not the full Inspector — it's a *guided* version. A series of prompts appear, one at a time:

**Step 1:** "Click RELAY-B on the board." Tomás clicks. The sidebar populates.

**Step 2:** "Scrub the timeline to tick 22 — the moment the relay overloaded." Tomás drags the scrubber. A gold diamond marks tick 22. When he reaches it, a green checkmark appears.

**Step 3:** "Look at RELAY-B's context window. How many slots are filled?" Tomás counts the bars: 12/12. He types "12" in a small input field. Green checkmark.

**Step 4:** "How many of those slots contain terrain observations?" Tomás reads the labels. He counts. "8." Green checkmark.

**Step 5:** "SCOUT-A's enemy alert arrived at tick 22. There was no room. What should the relay's context config prioritize?" Three options appear as buttons: "Terrain observations" / "Threat signals" / "All signals equally." Tomás picks "Threat signals." Green checkmark — and a short animation plays showing the fix being applied and the battle replaying with the relay surviving.

**Minute 3:00 — The Debrief Card**
A "Diagnostic Report Card" appears:
- ✅ Found the overloaded unit (1/1)
- ✅ Identified the correct tick (1/1)
- ✅ Counted the buffer slots (1/1)
- ✅ Identified the garbage data type (1/1)
- ✅ Proposed the correct fix category (1/1)
- **Score: 5/5 — Perfect Diagnosis!**
- **New tool unlocked: Context Window Chart** (a sparkline showing buffer fill over time)

Tomás grins. The challenge taught him exactly one Inspector workflow: click the unit → scrub to the failure → read the buffer → identify the waste → prioritize the fix. He didn't need to understand the full Inspector toolkit. He just needed one diagnostic path, practiced once, that he'll now apply instinctively.

**Minute 4:00 — The Transfer**
Tomás returns to Mission 4. His scout dies at tick 15. He opens the Inspector. Without thinking, he clicks the dead scout. Scrubs to tick 14. Checks the context window. Sees that the rule `IF enemy_detected → use evade` evaluated false because the buffer was full of old terrain data and the fresh enemy observation had been evicted. "The same problem!" he realizes. Same fix — adjust the context config priority.

He never needed to understand the Inspector as a whole system. The Diagnostic Challenge taught him one *pattern* — click-scrub-read-identify-fix — that generalizes to every failure.

**UI Annotations:**
- Diagnostic Challenge selector: hexagonal grid, each tile shows category icon + star rating + challenge name
- Guided Inspector: same layout as full Inspector but with step-by-step prompt overlay (semi-transparent amber banner at top, 40px tall, with prompt text and input field/buttons)
- Progress indicators: green checkmarks appear next to completed steps, forming a vertical progress trail on the left edge
- Report card: centered modal, 400×300px, checklist format with animated checkmarks, score summary, tool unlock announcement with a brief demo animation

---

## Interaction Effects

### With the Locked Three-Screen Loop
War Room co-op maps perfectly to the three screens: Plan (Architect's domain), Sealed Watch (shared emotional peak), Inspector (Analyst's domain). The three-screen architecture was designed for solo play but *accidentally* creates the ideal co-op role split. This is not coincidence — the emotional→analytical sequence that justifies the Inspector's existence also justifies the Analyst role.

### With the Boot Log Narrative
The AI Analyst's activation fits the boot log's self-documenting aesthetic. "DIAGNOSTIC SUBSYSTEM INITIALIZED. Collaborative analysis protocol loaded." When the player first enables the AI Analyst, it feels like the AI protagonist bringing online a new capability — which it literally is.

### With the Blueprint Codex
Diagnostic Challenges can unlock Codex entries for Inspector tools. "Context Window Chart: unlocked by completing 'The Overloaded Relay' diagnostic challenge." This gives the Codex a second unlock track — one for game mechanics (through campaign), one for analytical tools (through diagnostic challenges).

### With Mission Design (5.00a)
Diagnostic Challenges can be mission-specific. After failing Mission 4, the game could surface: "New diagnostic challenge available: 'The Missing Rule.' Based on your Mission 4 attempt." The challenge recreates the player's actual failed configuration and guides them through the Inspector to find their specific mistake. This bridges the gap between generic tutorials and situated learning.

### With Competitive Play (7.01, 7.05)
Gauntlet players who developed Inspector skills through War Room co-op are better at post-match analysis — they scrub replays faster, identify failures more precisely, and iterate more efficiently. War Room co-op creates a diagnostic skill advantage that translates to competitive rating improvement. The community may develop "Inspector coaching" as a service — an experienced Analyst reviewing your replays in War Room mode.

### With Config Necropsy (7.10)
War Room Analyst habits are exactly the skills needed to write good config necropsies. Players who've been Analysts know how to identify the pivot tick, trace the signal chain, and explain the root cause. The "Senior Diagnostician" community badge (7.10b) may correlate strongly with War Room co-op hours.

### With the Sealed Watch's No-Tools Rule
The War Room strengthens the Sealed Watch's purity. During Sealed Watch, both players watch together — no tools, no analysis, just shared emotion. The Analyst must resist the urge to analyze until the Inspector phase. This reinforces the locked emotional→analytical sequence and teaches the Analyst that *observation* (watching without tools) precedes *analysis* (tools applied to what you observed). The discipline of waiting teaches something the Inspector alone cannot.

---

## Sensory Description

### The Role Selection Screen
Two large cards hover on a dark background, slowly rotating in 3D space — one cyan, one amber. The Architect card shows a wireframe blueprint dissolving into circuit traces. The Analyst card shows a magnifying glass with data streams flowing through its lens. Between them, a thin line of light pulses gently — the connection between the two roles. When both players have selected, the line flares bright white, the cards slide together and merge into a combined sigil, and a deep harmonic chord resolves (two notes becoming one). The screen transitions with the sigil shrinking to become the co-op session's icon in the top corner.

### The Diagnostic Card Creation
When the Analyst clicks "Share" on an Inspector element, the element's current view performs a brief "photograph" animation: a white flash (like a camera shutter), a subtle lens-click sound (`ka-chak`), then the element contracts into a small card shape that lifts off the Inspector panel and floats — trailing amber particles — across the screen toward the edge. On the Architect's screen, the card arrives from off-screen with a soft paper-sliding sound (`fwip`) and settles into the suggestion tray with a gentle bounce. The card's border pulses amber twice, then rests. If the Architect acknowledges (✓), a warm chime sounds — a two-note ascending phrase — and the card's border shifts from amber to green. If dismissed (✗), a soft crumple sound and the card folds in on itself, shrinking to nothing.

### The AI Analyst's Presence
The amber eye icon in the top-right corner blinks at resting heartbeat pace (0.5Hz) during normal play. During the Sealed Watch, the blink rate increases slightly as the AI "pays attention" to critical moments — faster near failures, slower during calm ticks. After the battle, the eye opens wide (pupil dilates) and stays open as the Diagnostic Report generates. Each card materializes with a soft typewriter-like sound — individual characters appearing in the annotation text at 40ms intervals, as if the AI is writing in real-time. The confidence pip pulses with its color (green/amber/red) for 2 seconds after appearing.

### The Guided Inspector
The step-by-step prompts appear with a typewriter animation and a soft ascending tone for each new step (each step one semitone higher than the last). Completing a step produces a green checkmark that stamps in with a satisfying `thunk` and a brief green radial pulse. The progress trail on the left edge fills like a thermometer — glowing green from bottom to top. When all steps complete, the trail flashes fully green, the report card slides up from the bottom with a fanfare (a 3-note ascending phrase played on a clean sine wave, reminiscent of a game show correct-answer sound), and confetti particles in amber and green scatter briefly from the top corners.

---

## Comparable Games and Precedents

### Keep Talking and Nobody Explodes
**The gold standard for asymmetric information co-op.** One player sees the bomb. The other reads the manual. All communication is verbal. Steel Crate Games' key design insight: "The best puzzles are the ones where the bomb expert and the manual expert are both working hard" — meaning the asymmetry must create effort on BOTH sides. War Room achieves this: the Analyst works hard to diagnose, the Architect works hard to translate diagnosis into configuration changes. 97% positive on Steam, 200k+ sales, still actively played 10 years after release.

### Spaceteam
**Shouting game where each player sees different controls and different instructions.** Player A's screen says "Set Player B's warp drive to 7" — Player A must shout the instruction, Player B must find the control. Pure communication under time pressure. War Room's verbal debrief has Spaceteam energy — the Analyst sees the data, the Architect has the controls, and the clock is ticking (both players want to try again).

### Overcooked
**Cooperative cooking where spatial division creates communication needs.** Two players in a kitchen — one chops, one cooks, one serves. The game's difficulty comes from coordination, not individual skill. War Room's difficulty similarly comes from the quality of the diagnostic conversation, not either player's individual skill.

### Medical Residency Teaching Model
**Not a game, but the pedagogical model War Room replicates.** In medical residency, a senior physician diagnoses while a junior physician observes and learns. Then roles gradually shift — the junior begins diagnosing while the senior supervises. The Apprenticeship Configuration (A) is literally this model applied to game Inspector skills.

### Rubber Duck Debugging
**The programming practice of explaining your code to an inanimate object to find bugs.** The act of verbalization forces the programmer to re-examine their assumptions. War Room co-op is rubber duck debugging where the duck talks back. The Analyst's questions ("Why did you put the relay there?" "What happens if the scout dies before the hook fires?") force the Architect to verbalize their design assumptions, which often reveals flaws before the battle even runs.

---

## The TikTok Clip

Split screen: left shows the Architect's hands on keyboard, right shows the Analyst's Inspector screen. The Analyst's cursor traces a signal chain backward — click, click, click — arriving at a relay with a glowing red context window. The Analyst says one word: "Filter." Cut to: the Architect's hands flying, changing one setting. Cut to: the Sealed Watch — the same battle, but this time the relay forwards the signal, the striker converges, kill flash. Both players' faces in frame — simultaneous realization, simultaneous celebration. Text overlay: "She saw what I couldn't. I built what she described."

---

## New Aspects Discovered

- **7.02d-i — AI Analyst personality calibration:** designing the AI Analyst's communication style across player skill levels; when to be explicit ("the buffer overflowed") vs. Socratic ("what do you notice about the buffer at tick 22?"); interaction with narrative voice (5.15) and difficulty curve (5.01)
- **7.02d-ii — Diagnostic Challenge curriculum design:** the full taxonomy and sequencing of guided Inspector challenges; which diagnostic patterns to teach first (context overload → signal chain breaks → rule mismatch → timing windows → emergent failures); how challenges unlock progressively based on campaign progress
- **7.02d-iii — War Room matchmaking and skill-gap handling:** how to pair Architects and Analysts of different skill levels; solo queue with AI partner vs. friend-code pairing; skill rating for diagnostic ability separate from architectural ability
- **7.02d-iv — Inspector skill transfer measurement:** how to measure whether co-op diagnostic habits actually transfer to solo play; tracking diagnostic workflow metrics (time-to-root-cause, tools-used-per-session, scrubber-usage-frequency) before and after War Room sessions; A/B testing within the player population
- **7.02d-v — "Analyst spectator" mode for streams and tournaments:** a third-party Analyst role for viewers watching competitive matches; stream chat voting on which unit to inspect; crowd-sourced diagnosis as a spectator sport; interaction with 7.01e spectator mode
