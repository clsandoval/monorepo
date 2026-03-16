# 5.00a-i — The Mission 4 Wall: Detailed Mission Design for the Rules Introduction

**Aspect ID:** 5.00a-i
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00a (vocabulary pacing bottleneck), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.04 (complexity ramp), 3.05 (rules language), 3.07a (rules panel layout at scale), 2.00g (personality ceiling), 5.04a (Mission 5 Wall)

---

## The Problem in Detail

Mission 4 — codenamed "Chorus" — introduces **six new terms** in a single mission: rule, condition, action, priority, perception radius, and skill. This is double the density of Missions 1-3 and introduces **three genuinely new conceptual categories** (behavioral logic, spatial sensing, unit capabilities) rather than variations on a single theme. The vocabulary pacing analysis (5.00a) identified this as the cognitive load cliff — the point where the "hands before head" principle faces its hardest test.

This document doesn't ask *whether* Mission 4 is a wall. It asks: **what does the wall look like brick by brick?** What are the exact puzzle scenarios, enemy placements, designed failure states, and rule complexity ramps within a single mission that could make six terms feel natural rather than overwhelming?

The fundamental tension: **rules require context that earlier missions provided (buffers contain information), but they introduce a qualitatively different interaction modality.** Missions 1-3 ask the player to curate — remove noise, reorder observations, set filters. Mission 4 asks the player to *author* — write behavioral logic from scratch. The shift from curation to authorship is the real wall, and the six terms are symptoms of its structural difficulty.

---

## Five Architectural Approaches to Mission 4

Each approach structures the same six terms differently within the mission's runtime (~8-15 minutes for a first-time player).

### Approach A: "The Nested Onion" — One Term Per Puzzle Phase

**Philosophy:** Mission 4 is not one mission. It's six micro-missions (30-90 seconds each) chained by a narrative thread. Each micro-mission teaches exactly one term. The player never encounters more than one new concept at a time.

**Structure:**

| Phase | Duration | New Term | Puzzle | What the Player Does |
|-------|----------|----------|--------|---------------------|
| 4.1 "Instinct" | 60s | **Skill** | A striker has two skills: `engage` and `evade`. The player toggles which skill is active. | Click one of two skill buttons. Execute. Watch result. Toggle the other. Execute again. See the difference. |
| 4.2 "Reflex" | 90s | **Condition** | Same striker, but now skills trigger based on observable conditions. "Enemy adjacent" or "no enemy nearby." | Select a condition from a visual dropdown. The skill fires only when the condition is met. |
| 4.3 "Decision" | 90s | **Action** | Reframe: the condition is fixed, but the player chooses which action (skill) pairs with it. Two conditions, two actions — the player wires them together. | Drag-connect condition cards to action cards using visual wires. |
| 4.4 "First Rule" | 60s | **Rule** | Name the compound: a condition-action pair IS a rule. The boot log names it. The player builds one complete rule from scratch using the vocabulary they already know. | Assemble a complete rule in the rule editor slot. |
| 4.5 "Priority" | 120s | **Priority** | Two rules that conflict. The designed failure: wrong ordering causes the unit to die. The player reorders and retries. | Drag to reorder rules. Execute. See the consequence. Swap. Execute again. |
| 4.6 "Awareness" | 120s | **Perception radius** | The existing rules work perfectly — but the unit can't see the enemy because perception radius is too narrow. The player widens it. Then discovers that wider perception floods the buffer with noise, introducing a callback to M1-3's filter lessons. | Adjust a slider or toggle that controls perception radius. Manage the noise tradeoff. |

**Total runtime:** ~9 minutes for a cautious player. ~4 minutes for a veteran.

**The sensory arc:** Phase 4.1 opens on the familiar 8×8 board — the same isometric grid, the same checkerboard tiles, the same single striker from Mission 3's last puzzle. But the right panel is different. Where the buffer display used to be, there's a new section with two large, rounded-corner buttons side by side — one with a sword icon (engage), one with a running-figure icon (evade). Both buttons glow with a soft amber outline, inviting touch. The striker's tile edge pulses faintly cyan — it's waiting for orders. Hovering over "engage" shows a ghost arrow from the striker toward the nearest enemy. Hovering over "evade" shows the striker's ghost stepping backward. The player clicks one. The ghost solidifies. EXECUTE. The result is immediate: the striker either lunges or retreats. The other button dims. The term "skill" has been learned through a single click, even if the word hasn't been spoken yet.

By Phase 4.5, the right panel has transformed. The two skill buttons are gone, replaced by a compact rule list — two horizontal bars stacked vertically, each containing a condition icon on the left, an arrow in the middle, and an action icon on the right. A grip handle between them. The panel has evolved visually in six steps, each one adding one layer of complexity on top of the last. The player has watched the panel grow. They were never presented with the final form all at once.

**Strengths:**
- Absolute minimum cognitive load per phase. Every phase adds exactly ONE new concept.
- The visual panel evolves gradually — the player watches it being built, layer by layer.
- Designed failures are isolated to single concepts (priority, perception) rather than compound failures requiring multi-concept debugging.
- Natural fast-track exit points: a veteran can skip phases that test below their level.

**Weaknesses:**
- Six sequential micro-missions risk feeling tutorial-heavy. After five minutes of guided scenarios, the player may feel patronized.
- The final "full rule" experience — building multiple rules with perception and skills — gets only the last 2 minutes of a 9-minute mission. The synthesis is rushed.
- The narrative thread must justify six phase transitions without losing momentum. Six boot log pauses could feel like six loading screens.

**The TikTok clip:** Phase 4.5 — the moment the player swaps two rules and the striker's behavior flips from death to victory. The ghost arrow visibly pivots when the rules swap. A streamer's face cam catches the realization. "WAIT. THE ORDER MATTERS?!" 15 seconds. Share.

---

### Approach B: "The Broken Machine" — Reverse-Engineer a Working Configuration

**Philosophy:** Don't teach rules by building them from nothing. Give the player a fully-configured unit with 4 rules, skills, and perception — and **break one thing**. The player's job is to find and fix the break. Missions 1-3 taught curation (remove noise from buffers). Mission 4 teaches curation of *logic* (find the bad rule in a rule list).

**Structure:**

The player receives a striker with four pre-loaded rules:
```
Rule 1: IF enemy_adjacent → engage       [CORRECT]
Rule 2: IF ally_damaged → evade           [BROKEN — condition should be "enemy_in_perception"]
Rule 3: IF channel_silent → patrol_east   [CORRECT]
Rule 4: IF default → hold_position        [CORRECT]
```

The unit also has two skills (engage, evade), perception radius set to 3, and a 8-slot buffer. Everything works except Rule 2's condition — it's watching for a signal ("ally_damaged") that will never appear in this mission, so the unit freezes when an enemy enters its perception range instead of pursuing.

**Phase 1 — "Observe the Malfunction" (2 min):**
The player executes with the pre-loaded config. The sealed watch plays. The striker engages an adjacent enemy (Rule 1 fires). Good. Then a second enemy appears at range 3. The striker has perception — it CAN see the enemy. But it does nothing. It holds position. The enemy approaches. Adjacent. Rule 1 fires again. Kill. But the player can see: the unit should have pursued at range instead of waiting.

The debrief inspector shows the rule evaluation trace:
- Tick 4: Rule 1 — FALSE (no adjacent enemy). Rule 2 — FALSE ("ally_damaged" not in buffer). Rule 3 — TRUE ("channel_silent"). Striker patrols east. **AWAY from the approaching enemy.**

The player reads this and thinks: "Rule 2 should be doing something about that enemy at range. But it's checking for 'ally_damaged'... that's wrong."

**Phase 2 — "Diagnose" (1 min):**
The player clicks Rule 2's condition. A dropdown appears showing available conditions. They see "enemy_in_perception" — an option that would trigger when any enemy is within the unit's perception radius. They swap the condition. The arrow between condition and action turns from red (broken) to green (valid).

**Phase 3 — "Verify" (1 min):**
Execute again. This time, when the second enemy appears at range 3, Rule 2 fires: "enemy_in_perception → move_toward." The striker pursues. Closes distance. Rule 1 fires at adjacency. Kill. Clean.

**Phase 4 — "Extend" (3 min):**
New scenario. Three enemies, staggered approach. The four rules aren't enough — the player needs to add a fifth rule and reorder. The game provides empty rule slots. The player must compose a new rule from scratch, using the vocabulary they absorbed by reading the pre-loaded rules. This is the authorship moment, but scaffolded by the examples they just debugged.

**Phase 5 — "Perception Reckoning" (2 min):**
A puzzle where the perception radius is set to 1 (too narrow — the striker can only see adjacent tiles). The player must widen it to 3. But at radius 3, the buffer floods with six observations. The striker's rules start evaluating noisy data — false positives. The player must adjust context config (listen/ignore filters from M3) to manage the increased perception. This phase explicitly bridges M3 vocabulary (buffer management) with M4 vocabulary (rules + perception), showing how they interact.

**Total runtime:** ~9 minutes.

**Sensory description:** Phase 1 opens with a fully armed workbench — the rule panel already populated with four glowing rule bars, each with condition and action icons. The player has never seen this panel populated before. It's like opening someone else's toolbox. The rules are color-coded: green arrows for valid wiring, but Rule 2's arrow pulses with a subtle red-orange glow — the game's only hint that something is wrong. The condition icon for Rule 2 shows a heart with a crack (ally_damaged) instead of the expected eye icon (enemy_in_perception). When the player hovers over Rule 2, the board shows... nothing. No ghost overlay. The unit doesn't know what to do with this condition in this context. That absence — the missing ghost — is the diagnostic signal.

During the sealed watch, when the striker fails to pursue the ranging enemy, its context bars show a full buffer with "enemy_at_C6" clearly visible in slot 3 — the data is THERE, the unit KNOWS, but no rule triggers on it. The mismatch between "the data is available" and "the unit does nothing" is viscerally frustrating. The player wants to reach in and fix it. That frustration is the teaching force.

**Strengths:**
- **Reading before writing.** The player absorbs rule syntax by reading a working (mostly) configuration, not by authoring from scratch. This mirrors how most people learn programming — reading code before writing it.
- **Debugging as pedagogy.** The diagnostic mindset ("find what's wrong") is more engaging than the construction mindset ("build from nothing") for many player archetypes.
- **Inspector becomes essential.** The debrief trace (which rule fired, which didn't, why) is the tool that reveals the break. This teaches the Inspector's value immediately.
- **Bridge to M1-M3.** Phase 5 explicitly connects perception → buffer flood → filter, showing the player that M1-3's lessons still apply.

**Weaknesses:**
- **Assumes rule readability.** The player must be able to parse four pre-loaded rules they've never seen before. If the rule language is too terse or too abstract, the "Broken Machine" is just a wall of symbols.
- **Diagnosis is harder than construction for some archetypes.** Tomás (14, Fortnite player) might not have the patience to read four rules and find the broken one. He wants to touch things and see results, not analyze a trace.
- **The "I fixed it but I don't know why" risk.** If the player stumbles onto the correct fix by clicking randomly through the dropdown, they learn nothing. The fix must require understanding.

---

### Approach C: "The Mentor Echo" — Watch an AI Solve, Then Replicate

**Philosophy:** Before the player writes any rules, they watch a mentor unit (a ghost-tinted ally controlled by an invisible "predecessor" AI) solve a puzzle using rules. The player sees the rules being evaluated in real-time — condition flashes, arrow blazes, action fires. Then the mentor disappears and the player must replicate the same behavior by writing rules that produce the same result.

**Structure:**

**Phase 1 — "Watch" (2 min):**
The board has two units side by side. The left unit is the player's striker — empty rule list. The right unit is a ghost-tinted "mentor striker" with a full set of 3 rules, visible in a translucent overlay panel. The player cannot edit the mentor's rules — only read them.

Execute. Both units face the same enemies. The mentor striker performs perfectly — engages adjacent enemies, pursues enemies in perception, patrols when idle. The player's striker does nothing (no rules). The mentor's rules flash in sequence during execution — the player can see the evaluation happening in real-time: condition check (white flash) → match (gold blaze) → action (green flash) → skip (grey dimming when condition fails).

The contrast is stark: the mentor moves with purpose, the player's unit stands frozen.

**Phase 2 — "Copy" (3 min):**
The mentor disappears. Its ghost rules linger in the translucent overlay for 30 seconds, then fade. The player must now write rules from memory (or from the mental model built during observation). They construct rules in their own panel. Each time they add a rule, they can execute and compare their striker's behavior to a recorded ghost replay of the mentor's behavior — showing divergence points.

When the player's striker matches the mentor's behavior exactly, a chime sounds. The ghost replay dissolves. The rules were internalized — not copied from a clipboard, but reconstructed from observation.

**Phase 3 — "Surpass" (3 min):**
A new scenario the mentor never faced. Three enemies from two directions. The mentor's 3 rules aren't sufficient. The player must add new rules, reorder, and adjust perception. No mentor. No ghost. Just the rule editor, the board, and the debrief inspector.

**Sensory description:** The mentor striker has a subtle holographic shimmer — its sprite is rendered at 80% opacity with a faint cyan edge glow, distinguishing it from the player's solid-color striker. During execution, the mentor's rule panel shows each evaluation step with a 200ms staggered animation: the condition card briefly enlarges (as if inspected), the arrow illuminates in sequence like a fuse burning from left to right, and the action card punches outward with a micro-bounce. When a condition fails, the entire row dims to 30% opacity for 500ms — a visual "nah, not this one." The player watches this evaluation cascade across 3 rules per tick, building an intuitive model of top-to-bottom evaluation before they've ever dragged a rule themselves.

When the mentor disappears, its translucent rule overlays fade slowly — like writing disappearing from a chalkboard. The player's empty rule panel is starkly bare by comparison. The emotional shift from "watching someone competent" to "I have to do this myself now" is a designed beat — the same feeling as a training wheels removal moment.

**Strengths:**
- **Observation before action.** The player builds a complete mental model of how rules evaluate before writing their first rule. No guessing.
- **The evaluation animation teaches priority implicitly.** The top-to-bottom cascade — check, check, match, fire — shows priority as a visual sequence, not an abstract concept.
- **The "surpass" phase creates genuine challenge.** The player can't just copy the mentor — they must extend the mentor's approach. This creates the authorship moment at the right time.
- **Natural fast-track:** A veteran skips Phase 1 entirely and jumps to Phase 3 (or gets the mentor observation as a 5-second fast-forward).

**Weaknesses:**
- **Passive observation risk.** Phase 1 has 2 minutes of watching. Younger players or action-oriented players may tune out. The evaluation animation must be riveting enough to hold attention.
- **Memory dependency.** Phase 2 asks the player to reconstruct rules from memory. Some players will forget the mentor's rules and feel lost. A "replay mentor" button as a safety net weakens the learning but prevents frustration.
- **Two-unit setup requires more board real estate.** The mentor unit occupies a tile, reducing available enemy placement space on the 8×8 grid. Manageable but constraining.

---

### Approach D: "The Escalating Emergency" — Crisis-Driven Rule Discovery

**Philosophy:** Don't teach rules in isolation. Create a crisis that REQUIRES rules and let the player discover them under pressure. Missions 1-3 taught buffer management. Mission 4 opens with a scenario where buffer management alone isn't enough — the unit has a clean buffer, sees the enemy clearly, but DOES NOTHING. The player must figure out why.

**Structure:**

**Phase 1 — "The Frozen Striker" (2 min):**
A striker unit on the board. Buffer perfectly clean — only relevant observations (enemy positions, terrain). Context config set correctly from M3 lessons. The player hits EXECUTE expecting the striker to engage. It doesn't move. The sealed watch shows a perfectly functioning perception system that feeds perfect data into... nothing. There are no rules. The unit has information but no behavior.

The boot log prints: `DECISION ENGINE: OFFLINE. Agent has observations but no rules. Observations without rules are like seeing without deciding.`

The player's reaction: "Wait, it can see the enemy but it won't act? What am I missing?" They look at the workbench. A new panel is visible — grayed out, with empty slots and a faint label: "Rules." They click it. It activates.

**Phase 2 — "Emergency Rule" (90s):**
An enemy is approaching. Tick count visible. In 4 ticks, the enemy will reach the striker. The player must create at least one rule before the enemy arrives. The EXECUTE button pulses with increasing urgency (amber → orange → red as the implied timer progresses). The first condition dropdown is pre-filtered to show only "enemy_adjacent" and "enemy_in_perception" — a gentle constraint that prevents paralysis.

The player builds a rule. Hits EXECUTE. The rule fires. The striker acts. Crisis averted. The time pressure makes the learning feel like survival, not homework.

**Phase 3 — "Escalation" (3 min):**
Three waves of enemies with varied approach patterns. One rule isn't enough. The player must add rules for different conditions, discover that order matters when rules conflict (designed failure: wave 2 hits a priority bug), and expand the skill set (Phase 3.3 introduces a scenario where "engage" isn't available — the unit only has "evade" and "patrol," forcing a different kind of rule).

**Phase 4 — "Perception Crisis" (2 min):**
Enemies approach from OUTSIDE the striker's current perception radius. The buffer is empty — not because of noise (M1-3 problem), but because the unit literally cannot see far enough. The player discovers perception radius as the parameter controlling sensory range. They widen it. Enemies appear in the buffer. Rules fire. But now there's too much data — the buffer floods. They must balance perception width against buffer capacity, explicitly connecting M4 to M1-3.

**Sensory description:** Phase 1's "frozen striker" is the emotional anchor. The board renders normally — enemy sprites approaching, terrain tiles in place, the soft ambient hum of the battlefield. But the striker is *perfectly still*. No idle animation. No fidget. No eye-flash. It's a statue. Its context bars show full slots — all green, all relevant data. Its perception cone is lit up, scanning correctly. Everything is working EXCEPT the thing that matters most: it can't decide. The boot log's message appears letter by letter: "Observations without rules are like seeing without deciding." Each word drops with a soft typewriter click. On the word "deciding," the empty Rules panel briefly flashes — a one-frame white pulse, almost subliminal, drawing the eye.

When the player finally creates their first rule and the striker acts for the first time, the moment is electric. The unit unfreezes. Its idle animation kicks in — the coiled, predatory sway of a striker coming to life. The perception cone pulses once. The first rule's condition flash → arrow blaze → action flash sequence plays at 150% normal speed (faster than it will ever play again), making the first action feel explosive. A deep, resonant bass note sounds — the "decision engine online" motif. It's designed to feel like jumpstarting a machine.

**Strengths:**
- **Emotional immediacy.** The "frozen striker" is viscerally wrong. The player has spent three missions watching units act. A unit that CAN'T act creates a powerful problem-seeking drive.
- **Urgency creates retention.** Learning under time pressure (even implied pressure) creates stronger memory encoding than relaxed tutorial pace. The rule the player writes under Phase 2's urgency will be remembered.
- **Connects M3→M4 causally.** The transition is: "You fixed the buffer. You fixed the filters. The data is perfect. And it's STILL not enough. You need something else." The need for rules arises from the insufficiency of prior tools.
- **No passive phases.** Every phase requires immediate action. No watching, no reading, no observation-then-reproduction delay.

**Weaknesses:**
- **Panic learners vs. panic freezers.** Time pressure helps some players and hurts others. Players with anxiety may feel overwhelmed rather than energized. The urgency must be carefully calibrated — implied, not punitive. Failing the "emergency" should retry instantly, not reset the mission.
- **Risk of accidental success.** If the player clicks randomly and happens to create a valid rule, they may pass Phase 2 without understanding what they did. The rule must be specific enough that random clicking won't produce a working result.
- **The "frozen striker" requires an explanation gap.** The player must notice the absence of rules on their own (or with a boot log hint). If they don't look at the Rules panel, they might think the unit is bugged.

---

### Approach E: "The Two-Mission Split" — Mission 4a (Rules) + Mission 4b (Senses)

**Philosophy:** Accept that six terms in one mission is structurally wrong. Split Mission 4 into two missions, each handling half the load. This matches the vocabulary pacing analysis's Option A ("The Split") and extends it with detailed puzzle design.

**Mission 4a: "Reflex" — Rules + Priority + Skills (3 terms)**

The player has a single striker on the board. The mission teaches three things:
1. Rules exist (condition→action pairs)
2. Priority determines evaluation order
3. Skills are the action vocabulary

**Puzzle 1 — "One Rule" (2 min):**
A striker with one empty rule slot. One enemy approaching. The player builds a single rule: IF enemy_adjacent → engage. Execute. The striker fights. The boot log names "rule," "condition," and "action" — three terms, but they form one conceptual unit (the rule IS a condition-action pair, so it's really one concept with three labels).

**Puzzle 2 — "Two Rules, Wrong Order" (2 min):**
Two rule slots pre-filled in wrong order. Designed failure: the patrol rule fires before the engage rule. The player swaps them. Priority becomes visceral.

**Puzzle 3 — "Skill Choice" (2 min):**
A scenario where engaging is suicide (two enemies flanking). The player must switch the striker's loaded skills from {engage, patrol} to {evade, patrol} and write rules using evade instead. Skills as a finite vocabulary of available actions — you can't "engage" if the engage skill isn't loaded.

**Mission 4b: "Awareness" — Perception Radius + Buffer Interaction (1 new term + callback)**

The player's units from 4a carry forward, rules intact. The mission adds perception radius and shows how it interacts with everything learned so far.

**Puzzle 1 — "Blind Striker" (2 min):**
The striker has great rules but perception radius = 0. It can only react to things already in its buffer (put there by hooks from scouts in M3). The player realizes: without perception, the unit depends entirely on communication from allies. This reinforces M3's hook lesson while motivating perception as the alternative.

**Puzzle 2 — "Wide Eyes" (2 min):**
Perception radius set to 5 (maximum for a striker, which normally has 2). The buffer floods with every observation in range. Rules fire on the FIRST matching condition, which may not be the most important one — a distant enemy triggers "move_toward" when a closer enemy should trigger "engage." The player must narrow perception OR add higher-priority rules for close threats.

**Puzzle 3 — "The Tradeoff" (3 min):**
A scenario that can be solved two ways: narrow perception + clean buffer + simple rules, OR wide perception + noise management + complex rules. The player discovers that there's no single correct answer — the tradeoff between seeing more (noise risk) and seeing less (blind spots) is a permanent design tension.

**Total runtime:** ~7 min (4a) + ~7 min (4b) = 14 min across two missions, or ~8 min for veterans using fast-track.

**Strengths:**
- Each mission stays within the 2-3 new term comfort zone.
- The gap between 4a and 4b (even if just a loading screen and campaign map transition) gives the player time to consolidate.
- Each half has its own dramatic arc (4a: "I taught an agent to think." 4b: "I taught it to see.")
- The 10-mission structure becomes 11 missions, but missions are shorter. The pacing matches modern mobile-influenced design where sessions can be 5-8 minutes.

**Weaknesses:**
- Breaks the locked 10-mission arc. Either the spec must change, or two existing missions must be merged elsewhere to compensate.
- Mission 4a might feel trivial for veterans. Fast-track detection (5.01e) must be aggressive here.
- The campaign map gains an extra node. Province assignment must shift (perhaps Batanes highlands gets split into two regions).

---

## Comparative Analysis: Which Approach When?

| Dimension | A: Nested Onion | B: Broken Machine | C: Mentor Echo | D: Escalating Emergency | E: Two-Mission Split |
|-----------|-----------------|-------------------|----------------|------------------------|---------------------|
| **Cognitive load per phase** | Lowest (1 term) | Medium (4 terms visible, 1 active) | Medium (3 rules observed) | Medium-High (urgency + novelty) | Low (3 terms per mission) |
| **Time to first rule written** | ~3 min | ~4 min (diagnosis first) | ~5 min (observation first) | ~90 sec | ~2 min |
| **Designed failure count** | 2 (priority, perception) | 1 (broken condition) | 1 (reconstruction gap) | 2 (priority, perception) | 3 (across two missions) |
| **Emotional arc** | Gradual build | Detective mystery | Apprenticeship | Crisis → mastery | Two small arcs |
| **Veteran friendliness** | High (skip phases) | High (fast diagnosis) | Medium (forced observation) | Highest (immediate action) | Medium (two separate missions) |
| **Beginner safety** | Highest | Medium (reading prereq) | High (observation scaffolds) | Medium (panic risk) | Highest |
| **Inspector integration** | Late (Phase 5+) | Early (Phase 1 debrief) | Medium (Phase 2 comparison) | Medium (Phase 3 debrief) | Late (4b Phase 2+) |
| **Narrative fit (boot log)** | 6 micro-logs (fragmented) | "Diagnose the broken AI" (cohesive) | "Learn from the predecessor" (lore-heavy) | "Emergency awakening" (dramatic) | 2 clean boot sequences |

---

## Recommended Hybrid: "The Emergency Onion"

**Combine Approach D's emotional hook with Approach A's granular sequencing.**

The mission opens with the "frozen striker" from Approach D — the unit that sees everything but does nothing. This creates the *need* for rules. Then, instead of throwing the player into time-pressured rule writing immediately, the game enters Approach A's phased sequence, but each phase is framed as an escalating emergency response rather than a tutorial exercise.

**The sequence:**

1. **"The Frozen Striker" (60s):** Execute with no rules. The unit freezes. The boot log diagnoses: "DECISION ENGINE: OFFLINE." The player discovers the Rules panel. (Establishes the NEED.)

2. **"Emergency Skill" (60s):** A single skill toggle — engage vs. evade. No rules yet, just "what can this unit DO?" The skill activates and the unit acts on the most prominent buffer entry. (Teaches SKILL as vocabulary.)

3. **"Emergency Condition" (90s):** The skill fires at the wrong time — engaging when the player wanted evasion. "The unit needs to know WHEN to act." Conditions appear as filters on the skill. (Teaches CONDITION.)

4. **"The First Rule" (30s):** The boot log names it: "A condition and an action together. That's a RULE." The player has already built one. The naming is retroactive. (Teaches RULE as a name for what they already did.)

5. **"The Priority Crisis" (120s):** Two rules. Wrong order. The designed failure plays. The player reorders. (Teaches PRIORITY through consequence.)

6. **"The Blind Spot" (120s):** An enemy approaches from outside perception range. Rules work but data doesn't arrive. The player discovers perception radius. Widens it. Buffer floods. Connects to M1-3 filter skills. (Teaches PERCEPTION RADIUS and bridges to prior knowledge.)

**Total: ~8 minutes.** Each phase is an escalation of the previous one. The emotional through-line is: "This agent is coming online, system by system, and every new system is the thing that saves it from the CURRENT crisis."

**The boot log narrative:** The boot log frames this as a system initialization sequence — each phase corresponds to a subsystem coming online.
- Phase 1: `DECISION ENGINE: OFFLINE. No rules loaded. Agent cannot act.`
- Phase 2: `SKILL MODULE: LOADING... engage.exe found. Agent has capabilities.`
- Phase 3: `CONDITIONAL LOGIC: INITIALIZING... Agent needs triggers.`
- Phase 4: `RULE COMPILER: ONLINE. Condition + Action = Rule. Decision framework active.`
- Phase 5: `PRIORITY RESOLVER: WARNING — Rule conflict detected. Order matters.`
- Phase 6: `PERCEPTION ARRAY: EXPANDING... New data sources online. Buffer management required.`

This is the diegetic boot sequence — the AI player character is literally bringing its own decision-making systems online, one at a time. Each system's activation solves the current problem and creates the next one. The player IS the AI coming to consciousness.

---

## Player Journeys

### Journey: Mia, 28, UX Designer (First Strategy Game)

**Context:** Completed Missions 1-3 over two sessions. Comfortable dragging observations out of buffers. Has used IFTTT for smart home automations but has never thought about it as "programming." This is her third play session.

**Minute 0:00 — The Frozen Striker**
The Plan screen loads. The familiar 8×8 board on the left — isometric checkerboard, warm amber terrain tones. Ifugao rice terraces in the background tiles. A single striker unit at position E4. Right panel: the buffer display she knows from M3 — 8 slots, clearly showing "ENEMY_POSITION: D6" in slot 1 and "TERRAIN: open_ground" in slot 2. Clean buffer. No noise.

Below the buffer, a new section: a darker panel with a dimmed header and empty horizontal slots. She hasn't noticed it yet.

She hits EXECUTE. The tick clock runs. Tick 1: the enemy at D6 moves to D5. Tick 2: D5 to D4 — adjacent to the striker. The striker doesn't move. Its idle animation is absent — no coiled sway, no weapon-arm cycling. Just... stillness. A chrome statue on a living battlefield. The enemy reaches E4. Combat flash. The striker is eliminated.

"What?! It had the data! It could SEE the enemy!"

**Minute 0:45 — The Discovery**
The debrief loads. She clicks the striker's last tick. The context window panel shows all 8 slots — enemy position, terrain, threat level. Perfect data. But below the context window, a panel labeled "Decision Trace" shows: `No rules loaded. No evaluation performed. Agent defaulted to: HOLD_POSITION.`

She stares at "No rules loaded." Her eyes drift to the Plan screen's new panel — the dark, empty section below the buffer. The boot log types: `DECISION ENGINE: OFFLINE. This unit observes but cannot decide. Rules tell it WHEN and WHAT.`

"Oh. I need to tell it what to DO with the information."

**Minute 1:15 — First Skill**
She clicks the new panel. It activates — the dark background brightens to the workbench's standard slate grey. Two large buttons appear: a sword icon labeled "engage" and a running-figure icon labeled "evade." A subtle prompt: "Choose a skill. This is what the agent CAN do."

She clicks "engage." The button depresses with a satisfying click-thunk sound. On the board, the striker's idle animation kicks in — the coiled sway begins. A ghost arrow appears from E4 toward D6 (the enemy's position). The unit is armed.

She hits EXECUTE again. Tick 1: the enemy approaches. Tick 2: adjacent. The striker lunges — engage fires. The flash sequence plays: condition check (automatic "enemy nearby?") → action fire. The enemy is eliminated.

"THERE it is. But I didn't really control when..."

**Minute 2:00 — The Condition Revelation**
A second scenario loads. Two enemies: one approaching from the west (D3), one from the east (F6). The striker has "engage" active. Execute. The striker lunges toward D3 — the closer enemy — and gets flanked by F6. Eliminated.

The boot log: `CONDITIONAL LOGIC: INITIALIZING. The agent needs to know WHEN, not just WHAT. Conditions are the WHEN.`

A dropdown appears on the skill button — it splits into a condition (left) and action (right). Available conditions: "enemy_adjacent" (red diamond + touching squares), "enemy_in_perception" (red diamond + cone), "no_threat" (green circle). She picks "enemy_adjacent → engage."

Execute. The striker waits. D3 approaches. Adjacent. ENGAGE. Kill. F6 is still distant. The striker holds — no rule for that situation. Mia adds a second pair: "enemy_in_perception → evade." Execute. The striker engages D3 at adjacency, then evades away from F6 when it enters perception. Both actions fire correctly in sequence.

"Okay, so the left side is the IF and the right side is the THEN. Like my IFTTT recipes."

**Minute 3:30 — The Priority Swap**
The boot log: `RULE COMPILER: ONLINE. A condition paired with an action is a RULE.`

Two rules are now stacked vertically. A grip handle appears between them. The scenario changes: a single enemy approaches, entering perception at tick 2, reaching adjacency at tick 4. Rules: 1) "enemy_in_perception → evade," 2) "enemy_adjacent → engage."

Execute. Tick 2: enemy enters perception. Rule 1 fires: evade. The striker runs away. Tick 3: enemy still in perception. Evade again. Tick 4: enemy catches up. Adjacent. But Rule 1 (evade) is still checked first — enemy is still in perception. Evade. The striker runs forever.

"Wait! Engage should fire when it's adjacent! But the other rule keeps winning..." She sees the boot log: `PRIORITY RESOLVER: WARNING — Rule evaluation is top-to-bottom. Rule 1 matched first.`

She drags "enemy_adjacent → engage" above "enemy_in_perception → evade." The grip snaps into place — a satisfying mechanical click. Execute. Tick 2: perception triggers evade (good — distance). Tick 4: adjacent triggers engage FIRST (because it's now Rule 1). Kill. Clean.

"OH. So the order IS the priority. The top one wins." She drags the rules back and forth twice more, watching different outcomes, building the priority model through muscle memory.

**Minute 5:00 — The Blind Spot**
New scenario. The striker has good rules but perception radius is set to 2 (narrow). An enemy spawns at H1 — far across the board. It approaches slowly. At range 2, it finally appears in the buffer. The striker's rules fire — but the enemy has been approaching for 6 ticks with zero response. Six wasted ticks.

The boot log: `PERCEPTION ARRAY: Current range = 2. Expanding...`

A slider appears next to the perception cone visualization. Mia drags it from 2 to 4. The perception cone on the board visibly widens — a translucent blue fan expanding outward. Execute. The enemy is detected at tick 2 instead of tick 6. Four extra ticks of response time. The evade-then-engage sequence plays smoothly.

But now, with perception at 4, the buffer shows six observations instead of two. Terrain tiles, ally positions, even environmental noise — all flooding in. Her rules start triggering on irrelevant data.

"Oh no, it's like Mission 1 all over again! Too much noise!"

She adjusts the context config's listen/ignore filter — familiar from M3. Ignore terrain observations. Ignore ally positions. The buffer clears. Only enemy data remains. Rules fire correctly.

"So it's a balance. See more, filter more. See less, miss things."

**Minute 7:30 — Resolution**
The boot log: `DECISION ENGINE: FULLY OPERATIONAL. Skills loaded. Conditions armed. Rules compiled. Priority resolved. Perception calibrated. This unit can think.`

Six glossary entries materialize in the Blueprint Codex: skill, condition, action, rule, priority, perception radius. Each entry links to the specific moment in the mission where Mia encountered it — a 2-second replay clip embedded in the glossary card.

Mia feels competent. She's not just a janitor cleaning buffers anymore. She's an architect designing behavior.

---

### Journey: Dev, 34, Software Engineer (Factorio Veteran)

**Context:** Speedran Missions 1-3 in 12 minutes. Already frustrated by the tutorial pacing. Wants depth. Has been reading the Blueprint Codex entries proactively.

**Minute 0:00 — Immediate Diagnosis**
Dev sees the frozen striker and immediately guesses: "No behavior rules. Classic empty policy." He's read ahead in the Codex. He clicks the Rules panel before the boot log even starts typing.

"Yep. Empty rule set. Let me wire this up."

**Minute 0:15 — Speedrun**
He creates three rules in 25 seconds:
1. enemy_adjacent → engage
2. enemy_in_perception → move_toward
3. default → patrol_east

He hits EXECUTE. The striker performs flawlessly across three enemy waves. The priority ordering is correct on the first try — Dev understands priority queues from his day job.

**Minute 0:40 — Fast-Track Detection**
The system detects: 100% efficiency, sub-30s solve, no hints used, all concepts applied correctly without iterating. A thin amber bar appears at the bottom: `FAST-TRACK: Skip remaining tutorials? You'll proceed to Phase 6 (perception).`

Dev accepts. Phase 6 loads.

**Minute 0:55 — The Perception Problem**
Dev finds the perception puzzle interesting. He immediately sets perception to maximum and watches the buffer flood. "Okay, so perception width trades against buffer noise. This is a receiver sensitivity problem." He adjusts the listen/ignore filter by category, not by individual observations — a bulk operation that shows he understands the underlying model.

He then tries something the mission didn't ask for: setting perception to 0 and relying entirely on hook-received data from M3's relay setup. "Can I run this striker deaf to its own perception and only listen to relayed signals?" The system allows it. The striker acts only on data forwarded by relays. This works — but with 2-tick latency (signal hop delay from M3). Dev writes a rule that accounts for the latency: "enemy_at_range_3 → move_toward" (because by the time the data arrives, the enemy has moved 2 tiles closer).

"Oh. That's elegant. The signal propagation delay IS a gameplay mechanic."

**Minute 2:30 — Resolution**
The boot log offers the full glossary expansion. Dev opens it, reads the precise evaluation semantics (per-tick, first-match-wins, simultaneous tick resolution for all units), nods, and immediately starts thinking about Mission 5.

"When do I get to build my own blueprints?"

---

### Journey: Tomás, 14, High School Student (Plays Fortnite, First Puzzle Game)

**Context:** Made it through Missions 1-3 by dragging things around and seeing what happens. Doesn't read most of the boot log text. Learns by doing, not reading.

**Minute 0:00 — "Why Won't It Move?"**
Tomás hits EXECUTE immediately. The striker freezes. The enemy kills it. He hits retry without reading anything.

"Bruh, it's broken."

**Minute 0:20 — The Hint System Activates**
After the second failed execution, the adaptive hint fires. The Rules panel pulses with a golden glow. A tiny arrow icon points at it. The boot log's first sentence highlights in white: "DECISION ENGINE: OFFLINE."

Tomás taps the Rules panel. It opens.

"Oh, new stuff."

**Minute 0:35 — Button Mashing as Learning**
He sees the two skill buttons (engage/evade) and immediately clicks "engage" because it has a sword icon. The striker's ghost arrow appears.

"Let's go."

EXECUTE. The striker engages the approaching enemy. Kill.

"YOOO that's what I'm talking about!"

He doesn't know the word "skill." But he knows: sword button = fight mode.

**Minute 1:00 — Conditions as Visual Puzzles**
The second scenario loads with the condition dropdown. Tomás sees icons, not text. Red diamond + touching squares = enemy close. Red diamond + cone = enemy in range. He picks the first one because the touching squares look like "right next to me."

It works. He adds the second condition with evade. It works. He's pattern-matching icons, not reading condition labels.

**Minute 2:30 — The Priority Rage**
The priority failure scenario hits. His striker runs away when it should fight. "WHAT?! I TOLD it to fight!"

He sees the grip handle. He drags it. The rules swap. A very satisfying snap sound. He hits EXECUTE. The striker fights.

"Okay, top one goes first. Like a playlist. Got it."

He drags the rules back and forth three more times. The snap sound is satisfying enough to be a fidget toy.

**Minute 4:00 — Perception Slider**
The blind spot scenario. Tomás doesn't understand why the striker can't see. He finds the perception slider and MAXES it immediately. The buffer explodes with data. Rules fire randomly.

"Yo this is garbage."

He drags the slider back. Finds a sweet spot at 3. Adjusts the listen/ignore filter (familiar from M3 — he remembers dragging things out of the buffer). Gets it working.

**Minute 6:00 — Resolution**
Tomás skips the boot log resolution text. He doesn't read the glossary entries. But he's internalized: sword button = engage, top rule = first, slider = see more (maybe too much). He'll learn the formal terms when he needs them — probably never from the game itself, but from watching a streamer's YouTube breakdown.

"Next mission. Let's GO."

---

### Journey: Priya, 42, Product Manager (Played Into the Breach, Casual Strategy Fan)

**Context:** Takes her time. Reads every boot log line. Appreciates the narrative framing. Plays one mission per evening after her kids go to bed.

**Minute 0:00 — Noticing the Stillness**
Priya doesn't hit EXECUTE right away. She examines the board. She notices the Rules panel is new — empty, dark, unlike the populated buffer panel. She reads the boot log's ambient text: `Subsystems ready. Decision engine: pending initialization.`

"Decision engine. So this is where the agent learns to think."

She hits EXECUTE to see what "no decisions" looks like. The frozen striker confirms her hypothesis. She reads the debrief trace carefully: "No rules loaded. No evaluation performed." She nods.

"Clear. The previous missions were about information. This one is about decisions."

**Minute 1:00 — Deliberate Skill Selection**
She reads both skill descriptions before choosing. "Engage: move to adjacent enemy and eliminate. Evade: move away from nearest threat." She notes the tradeoff: offensive vs. defensive. She selects engage first, tests it, then switches to evade and tests that too. She compares the debrief traces side by side.

"I see. The skill determines the PALETTE of actions. You can't paint if you don't have the right colors."

**Minute 3:00 — Savoring the Condition**
When conditions appear, Priya builds both conditions before executing either. She predicts what will happen: "If I set 'enemy_adjacent → engage,' the striker should fight when threatened. If I set 'enemy_in_perception → evade,' it should retreat from distant threats." She executes. Her prediction is confirmed. She feels smart.

**Minute 4:30 — The Priority as Design Decision**
The priority puzzle plays out. Priya doesn't just fix the ordering — she experiments with three different orderings and notes each outcome in her head:
1. Evade first → striker runs forever (learned: too defensive)
2. Engage first → striker fights but never retreats (learned: too aggressive)
3. Engage first + evade second → fights when close, retreats when not (learned: the sweet spot depends on the scenario)

She realizes priority isn't just "which fires first" — it's a design philosophy encoded in ordering. She's thinking like an architect.

**Minute 6:30 — The Perception Meditation**
Priya treats the perception slider as an Into the Breach-style optimization puzzle. She tries perception = 1, 2, 3, 4, 5 systematically, noting the buffer fill at each level. At 3, she finds the cleanest tradeoff — enough range to see approaching threats with 2 ticks of warning, but not so wide that terrain noise overwhelms the buffer.

She then does something unexpected: she sets perception to 5 but creates a RULE specifically to handle the noise: "IF observation_type = terrain → ignore." She's using M4 rules to solve M1-3's buffer management problem. The systems are connecting.

"Oh. The rules aren't just for combat. They're for information management too."

**Minute 8:30 — Resolution**
Priya reads every glossary entry. She appreciates the 2-second replay clips embedded in each card. She bookmarks the Blueprint Codex and plans to revisit it before Mission 5.

"This is good. The game respects my intelligence but doesn't punish my pace."

---

## Interaction Effects

### With Building Blocks (Wave 3)
- The rules language choice (3.05) directly determines Mission 4's difficulty. The Dispatch Table (Approach A) is the simplest for Mission 4 — pure signal→response. The Sentence Builder (Approach D) is richest but requires more tutorial scaffolding. The Mission 4 design should be evaluated against ALL six rules language approaches to ensure compatibility.
- The rules panel layout (3.07a) at scale is irrelevant for Mission 4 (the player has 2-4 rules at most), but the panel's INITIAL appearance must foreshadow its future growth. If Mission 4 shows 4 rule slots and Mission 10 shows 20, the visual language must be consistent.

### With Core Mechanic (Wave 2)
- The intelligence model (2.00a-d) affects how rules FEEL during Mission 4. In a fully deterministic model, the player sees rules as a program to be optimized. In a simulated-intelligence model, rules feel like personality traits being assigned. Mission 4's emotional tone shifts significantly depending on whether the player is "programming" or "raising."
- Perception radius interacts with buffer model (2.01-2.02). If the buffer uses weighted slots (2.02), perception-generated observations may have different weights than hook-received observations. Mission 4 must decide: does perception data arrive with default weight, or does the player configure perception-data weight as part of the lesson?

### With Onboarding (Wave 5)
- The fast-track detection (5.01e) must fire correctly during Mission 4. Dev's journey shows the ideal: detect mastery in Phase 1 and skip to Phase 6. Tomás's journey shows the failure case: false-positive fast-track that skips a concept Tomás actually needs.
- The vocabulary pacing (5.00a) defines the ceiling: no more than 6 terms. If the mission design generates emergent sub-concepts (e.g., "default rule" as a concept distinct from "rule"), the vocabulary budget overflows.

### With Campaign (Wave 5)
- The campaign map (locked as Philippine archipelago) assigns Mission 4 to a specific province. The terrain of that province determines the battlefield layout — rice terraces create chokepoints, urban tiles create open sightlines. The Mission 4 puzzles must be designed for the specific terrain of the assigned province.
- If Approach E (two-mission split) is chosen, the campaign map gains an extra node. This affects the visual pacing of the archipelago progression.

### With UI/UX (Wave 4)
- The Inspector debrief design (4.04b) determines how effectively Mission 4's "designed failures" teach. If the debrief shows a clear rule evaluation trace (condition checked → passed/failed → next rule), the priority lesson lands. If the debrief is too abstract, the player won't understand why their rules fired in the wrong order.
- The sealed watch design (locked as no-pause, no-skip) means Mission 4's execution phases must be SHORT. A 10-tick scenario takes 10 seconds at 1× speed. A 30-tick scenario takes 30 seconds of mandatory watching. For tutorial phases where the player needs to iterate quickly, short scenarios (5-8 ticks) are essential.

---

## Comparable Games

### Into the Breach — The Puzzle Tutorial Pipeline
Into the Breach introduces push mechanics, attack previews, and environmental hazards across its first 5 missions. Each mission adds ONE new element type. The player never faces two new enemy types simultaneously. Mission 4 of Robot Uprising should follow this cadence: one new interaction type per puzzle phase, never two.

### Baba Is You — The Naming Delay
Baba Is You never names its mechanics. There's no tooltip that says "this is rule manipulation." The player pushes word blocks and discovers that "BABA IS YOU" means they control Baba. The naming is implicit — the words ARE the rules. Robot Uprising's boot log naming (retroactive naming after the player has already used the concept) mirrors this philosophy: hands before head, name after use.

### Gladiabots — The Behavior Tree Onramp
Gladiabots' tutorial starts with a single condition node and builds toward full behavior trees across 10+ tutorial levels. The first 3 levels have ONE node each. Level 4 introduces branching (two conditions). Level 7 introduces priority (which branch is checked first). This granularity is the model for Approach A's phased structure.

### Shenzhen I/O — The Manual Problem
Shenzhen I/O's first puzzle assumes you've read the 30-page manual's section on assembly instructions. Players who haven't read the manual hit a wall. Players who have breeze through. This split is exactly what Robot Uprising must avoid — hence the "hands before head" principle. Mission 4's rules must be discoverable through play, not through prerequisite reading.

---

## Discovered New Aspects

1. **5.00a-ii — Physical term placement as naming mechanic:** The Baba Is You inspiration — dragging term labels from boot log to workbench headers as a physical naming ritual. The term becomes real when you place it. (Already in frontier.)

2. **5.00a-vi — The "frozen striker" as a reusable diagnostic template:** Can the Mission 4 opener (unit sees everything, does nothing) be recreated deliberately by players in later missions as a diagnostic tool? "Strip all rules to see raw data" as an advanced technique taught accidentally in the tutorial.

3. **5.00a-vii — Perception radius as the third slider (alongside buffer size and filter strictness):** Three continuous parameters that interact multiplicatively. The tutorial must decide whether to introduce all three sliders or simplify to binary toggles during Mission 4 and graduate to sliders in Mission 5+.

4. **5.04a-v — The "rules-only" sandbox between Mission 4 and Mission 5:** A freeplay mode (accessible from campaign map) where the player can experiment with rules, skills, and perception on various pre-built scenarios without consequences. The "practice range" for the new toolset.

5. **5.00a-viii — Designed failure cadence across the tutorial arc:** Missions 1-3 each have designed failures (noise causes bad behavior). Mission 4 has 2-3 designed failures (priority bug, perception blindness). Is the failure density increasing too fast? What's the optimal failure-to-success ratio per mission for learning without frustration?
