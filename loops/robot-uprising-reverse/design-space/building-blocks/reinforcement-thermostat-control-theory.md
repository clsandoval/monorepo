# 3.19a-i — The Reinforcement Thermostat as Control Theory Tutorial

## Overview

The "reinforcement thermostat" is the simplest non-trivial Command unit rule pattern: **"when unit_count(type) < N, queue_blueprint(type)."** This single rule is a working feedback controller. It monitors a system variable (unit count), compares it to a reference (N), detects error (deficit), and applies a corrective action (queue production). The player who writes this rule has — without any lecture — implemented a bang-bang controller, the most fundamental concept in control theory.

This document maps the full design space of how Robot Uprising can teach control theory through the reinforcement thermostat pattern, escalating from the trivial bang-bang case through proportional control, derivative sensing, integral accumulation, and the full PID-equivalent. Each level is a deeper mission design challenge, not a textbook chapter. The player learns by watching their thermostat oscillate, overshoot, lag, and eventually stabilize — and by wanting to fix each failure mode badly enough to invent the next control concept themselves.

---

## The Control Theory Ladder

### Level 0: The Manual Player (No Control — Pre-Mission 6)

Before the Command unit exists (Missions 1-5), the player IS the controller. They observe the battle, note that they've lost a scout, mentally decide to build another, and would queue it if they could — but pre-placed units and no factory mean they can't. The frustration of watching attrition without recourse is the setup. The player's *desire* to automate reinforcement is the pedagogical fuel for Mission 6.

**What the player feels:** "I can see the problem. I know the fix. I can't act. If only the system could fix itself."

### Level 1: The Bang-Bang Controller (Mission 6 Introduction)

**The rule:** `IF unit_count(scout) < 2 THEN queue_blueprint(SCOUT-ALPHA)`

**Control theory mapping:**
- **Process variable (PV):** scout count on the battlefield
- **Set point (SP):** 2
- **Error signal:** SP - PV = 2 - current_count
- **Controller output:** binary — queue or don't queue (ON/OFF)
- **Actuator:** the factory production queue

This is bang-bang (on-off) control. The controller has exactly two states: "below threshold → act" and "at-or-above threshold → idle." There is no proportional response — losing 1 scout and losing all scouts trigger exactly the same action (queue one replacement). The controller cannot distinguish severity.

**Why it works for Mission 6:** Bang-bang is sufficient for the relatively calm Mission 6 scenario. Enemy pressure is moderate. Losses are infrequent. The factory has time to produce a replacement before the next loss. The thermostat never oscillates because the disturbance frequency (enemy kill rate) is much lower than the response frequency (factory production rate).

**The designed failure:** Mission 6 is calibrated so that bang-bang succeeds. The player feels clever. The thermostat hums along. This builds confidence before Mission 7 breaks it.

**Sensory:** When the Command unit evaluates the rule and finds `unit_count(scout) = 1 < 2`, the rule strip in Inspector lights up: the condition box glows green (matched), the action box glows amber (production order queued). The amber line arcs from Command to factory. A soft *tick-tock* metronome sound accompanies the evaluation — the thermostat checking its temperature. When the replacement deploys and `unit_count(scout) = 2`, the rule evaluates but doesn't fire: condition box shows a cool blue (checked, not matched), action box stays dim. The *tick* without the *tock* — the thermostat finding nothing to do.

---

### Level 2: The Oscillation Problem (Mission 7 — "Why Won't It Stop Building?")

**The scenario design:** Mission 7 introduces heavier enemy pressure. Enemy strikers come in waves — 3 strikers every 15 ticks. A wave kills 2 scouts simultaneously. The thermostat fires: queue scout. But the factory takes 4 ticks per scout. During those 4 ticks, the second scout loss triggers *another* queue command (the Command unit re-evaluates every tick and still sees `scout_count < 2`). By tick 8 post-loss, the factory queue has 4 scouts pending — far more than needed.

**What the player sees in Sealed Watch:** The conveyor belt fills with golden-bordered scout icons. Scouts deploy one after another into a now-quiet battlefield. Resources drain. When the *next* wave arrives, the player has 4 scouts (overkill) but no resources for the striker they desperately need. The thermostat overproduced.

**The oscillation pattern:**
```
Tick 0:  2 scouts (stable)
Tick 15: 0 scouts (wave kills both)
Tick 16: Command queues scout (queue: 1)
Tick 17: Command queues scout (queue: 2)  — still sees count < 2
Tick 18: Command queues scout (queue: 3)  — still sees count < 2
Tick 19: Scout deploys (queue: 2, field: 1) — still < 2
Tick 20: Command queues scout (queue: 3)
Tick 23: Scout deploys (queue: 2, field: 2) — now = 2, stops
...but queue still has 2 pending scouts that will deploy anyway
Tick 27: 3 scouts (field: 3, but set point was 2)
Tick 31: 4 scouts (overshoot)
```

The bang-bang controller + factory delay = classic oscillation. The corrective action takes time to manifest, but the controller keeps firing during the delay. This is **integral wind-up** — the accumulated error signal results in overshoot.

**What the player thinks:** "It keeps ordering scouts even though I already ordered enough. I need it to remember what it already ordered."

**The player's likely fix attempt #1 — adding a queue check:**
`IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)`

This is the player independently inventing **anti-windup** — a mechanism to prevent integral accumulation when the actuator is already saturated. The `queue_count` condition checks whether a corrective action is already in progress before issuing another.

**Does the game support this?** The condition vocabulary must include `queue_count(type)` — the number of pending production orders for a given unit type. This is a design decision: if the game provides this condition, it hands the anti-windup concept to the player. If it doesn't, the player must find a different approach (maybe adding a cooldown rule, or raising the resource threshold).

**Recommendation:** Provide `queue_count(type)` but don't highlight it in the boot log. Let the player discover it through autocomplete in the condition editor. When they type "queue" in the condition field, the autocomplete shows `queue_count(type)` as an option. The discovery should feel earned — the player thought "I need to check what's already queued" and found the tool waiting for them.

**Sensory:** The oscillation is viscerally visible on the conveyor belt — scout icons stacking up, each with a golden border, scrolling left as the queue backs up. The resource counter in the corner ticks down with each queued unit: 14m → 10.5m → 7m → 3.5m → 0m. A gentle alarm chime (two descending notes) plays when resources hit zero. In Inspector, the Command unit's decision trace for ticks 16-20 shows the same rule firing repeatedly — a repeating pattern of green condition + amber action, like a heartbeat that won't slow down. The context window chart shows a flat line (the Command unit isn't learning anything new, it's just re-evaluating the same deficit over and over).

---

### Level 3: Proportional Response (Mission 7-8 — "One Loss vs. Total Wipeout")

**The problem:** Bang-bang treats all deficits equally. Losing 1 scout from 3 and losing all 3 scouts trigger the same response: queue one replacement. But the severity is wildly different. After a total wipeout, the player needs rapid reinforcement. After losing one from three, one replacement on the normal production schedule is fine.

**The player's invention — priority scaling:**

The player creates two rules at different priorities:

```
Rule 3 (high priority): IF unit_count(scout) == 0 THEN queue_blueprint(SCOUT-ALPHA) × 2
Rule 5 (lower priority): IF unit_count(scout) < 3 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)
```

Rule 3 handles emergencies — total scout loss triggers a double order. Rule 5 handles attrition — gradual losses trigger single replacements. The player has independently invented **proportional control** — the corrective action scales with the error magnitude.

**The mapping:**
- **P-gain (Kp):** Encoded in the number of blueprints queued per error level (1 for small deficit, 2 for total loss)
- **Error bands:** Defined by the rule conditions (count == 0 vs. count < 3)
- **Dead band:** The range where no action is taken (count >= 3)

This isn't *continuous* proportional control — Robot Uprising's discrete rules create a step function approximation. But it's the same principle: bigger error → bigger response. The player discovers that two rules with different thresholds approximate a continuous response curve.

**Mission design teaching this:** Mission 8 should include an enemy that occasionally uses a devastating ability (e.g., a hack that disables 3 units for 2 ticks). The player's bang-bang thermostat from Mission 7 can't distinguish between "one scout wandered into an ambush" and "half my army was disabled simultaneously." The player needs proportional response to survive the mass-disable scenario without overproducing during normal attrition.

**Sensory:** In the Plan screen rule editor, the two rules sit at different positions in the priority stack. Rule 3 has a red accent (emergency) — the player can optionally color-tag rules (purely aesthetic, no mechanical effect, but helps visual organization). Rule 5 has a blue accent (routine). When both rules evaluate in Inspector, the decision trace shows Rule 3 checking first: `unit_count(scout) = 0 == 0 → TRUE → queue × 2`. Rule 5 is grayed out: `(preempted by Rule 3)`. The preemption is visually clear — Rule 3's green box casts a shadow over Rule 5's dim box. When only one scout is lost, Rule 3 evaluates false (count ≠ 0), and Rule 5 fires. The handoff between rules is visible: Rule 3's box shows blue (checked, not matched), Rule 5's box shows green (checked, matched).

---

### Level 4: Derivative Sensing (Mission 8-9 — "It's Getting Worse")

**The problem:** Proportional control reacts to the current state but can't anticipate trends. If the player is losing scouts at an accelerating rate (tick 30: lose 1, tick 35: lose 1, tick 38: lose 1, tick 40: lose 1), the increasing frequency signals an escalating threat. A proportional controller treats each loss identically. A derivative-aware controller would detect the acceleration and preemptively order extra reinforcements before the next wave hits.

**Can the player express this?** This requires a condition that measures *rate of change* rather than current state. Two approaches:

**Approach A: Event recency condition**
`IF unit_destroyed_within(scout, 5_ticks) >= 2 THEN queue_blueprint(SCOUT-ALPHA) × 2`

This checks: "have 2 or more scouts been destroyed in the last 5 ticks?" If yes, losses are accelerating. The player defines a time window and a threshold. This is a discrete approximation of the derivative — rate of change measured by counting events in a window.

**Approach B: Trend condition (more advanced)**
`IF unit_count_trend(scout, 10_ticks) == declining THEN queue_blueprint(SCOUT-ALPHA)`

This checks the direction of change over a window. More abstract, harder to configure, but captures the derivative concept more precisely.

**Recommendation:** Provide Approach A (`unit_destroyed_within(type, N_ticks) >= K`) as a condition primitive. It's concrete, countable, and the player can reason about it. Approach B is too abstract for the game's rule vocabulary and risks feeling like a black box.

**The teaching mission:** Mission 9 introduces enemy escalation — each wave is stronger than the last. The player's proportional thermostat handles early waves fine, but by wave 5 the kill rate outpaces production. The player who adds a recency condition discovers that anticipating escalation is better than reacting to deficits.

**Control theory mapping:**
- **D-term (derivative):** `unit_destroyed_within(type, N_ticks)` measures rate of change
- **D-gain (Kd):** Encoded in the threshold (`>= 2` is more sensitive than `>= 3`)
- **Derivative kick:** If the player sets too sensitive a derivative (e.g., `>= 1` within `10_ticks`), the controller overreacts to every single loss — derivative kick, the classic PID tuning problem

**Sensory:** In Inspector, the "recent losses" condition shows a mini-timeline within the decision trace — a horizontal bar covering the last 5 ticks, with red pips marking each scout destruction event. Two or more pips = condition fires (bar glows amber). One or zero pips = condition doesn't fire (bar stays cool blue). The temporal window is visually explicit — the player sees *exactly* which events the condition counted. When the player adjusts the window width (changing 5 to 10 ticks), the bar stretches, capturing more pips. The visual makes the tuning feel tactile: wider window = more sensitive = more amber bars in the timeline.

---

### Level 5: The PID Equivalent (Mission 9-10 — "The Stabilizer")

**The full pattern:** A player who has learned all three levels combines them into a multi-rule reinforcement system:

```
Rule 2 (emergency):      IF unit_count(scout) == 0 THEN queue_blueprint(SCOUT-ALPHA) × 2
Rule 4 (trend response):  IF unit_destroyed_within(scout, 5) >= 2 AND queue_count(scout) < 2 THEN queue_blueprint(SCOUT-ALPHA)
Rule 6 (steady state):    IF unit_count(scout) < 3 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)
Rule 8 (overshoot brake): IF unit_count(scout) >= 4 THEN cancel_queue(scout)
```

**The mapping:**
- **Rule 2 (P-term, high gain):** Proportional emergency response to catastrophic error
- **Rule 4 (D-term):** Derivative — reacts to rate of change, not absolute state
- **Rule 6 (I-term with anti-windup):** Integral — steady accumulation toward set point, with `queue_count` preventing windup
- **Rule 8 (Output limiting):** Clamps the actuator to prevent overshoot

This four-rule stack is a PID controller. The player didn't read a textbook — they iterated through failure modes (oscillation, under-response, over-response) and patched each one with a new rule. The final configuration is stable under: (a) single unit loss, (b) mass casualty, (c) accelerating loss rate, and (d) post-recovery surplus.

**The "cancel_queue" action:** A new action type (introduced Mission 8 or 9): the Command unit can cancel pending production orders. This is the "output clamp" — when the controller detects overshoot (more units than needed), it retracts pending orders. This is expensive information-wise: the cancel action uses 1 buffer slot to hold the cancellation intent. But it prevents the resource waste of producing units that will just stand idle.

**Does the game need all four rules?** No. Most players will discover Rules 2 and 6 (proportional + anti-windup) and succeed. Only optimization-focused players will add the derivative term and the output clamp. The game must be beatable with just Level 2 control — Level 5 is for efficiency, not survival. This matches the Zachtronics pattern: solutions exist at many optimization levels, and the histogram shows where you stand.

---

## Mission Design Sequence

### Mission 6: "The First Thermostat"

**Objective:** Survive 60 ticks. Enemy sends 1 striker every 20 ticks. Player has 1 Command unit, 2 scouts, 2 strikers, 1 relay.

**Teaching target:** Bang-bang control (Level 1).

**The setup:** The boot log introduces the Command unit's production capability: *"PRODUCTION INTERFACE ONLINE. You may now delegate factory operations to Command units. The factory obeys. The question is whether your instructions are wise."*

**The designed learning arc:**
1. Player configures Command with a basic reinforcement rule
2. Tick 20: first enemy kills a scout. Command queues replacement. Player watches the thermostat work.
3. Tick 40: second enemy kills the other scout. Command queues again. Player relaxes — the system heals itself.
4. Tick 55: third enemy approaches. Both scouts are alive (replacements deployed). The thermostat held.

**The victory condition feeling:** "I built something that takes care of itself." The emotional payload is autonomy — the player's creation operates without intervention.

### Mission 7: "The Flood"

**Objective:** Survive 80 ticks. Enemy sends 3-striker waves every 15 ticks.

**Teaching target:** Oscillation and anti-windup (Level 2).

**The designed failure:** The bang-bang thermostat from Mission 6 oscillates. The player's first attempt produces too many scouts and runs out of resources before the final wave. The Inspector reveals the queue stacking problem. The player must add `queue_count` to their rule.

**The "aha" moment:** When the player adds the queue check and re-runs, the conveyor belt stops piling up. One scout queued per deficit, deployed in time for the next wave. Clean, efficient, stable. The histogram comparison between attempt 1 (resource depletion spike) and attempt 2 (smooth resource curve) makes the improvement visceral.

### Mission 8: "The Escalation"

**Objective:** Survive 100 ticks. Enemy waves increase in size: 2 strikers, then 3, then 4, then 5.

**Teaching target:** Proportional response (Level 3) and optionally derivative sensing (Level 4).

**The designed failure:** Anti-windup from Mission 7 handles early waves. Wave 4 (4 strikers) overwhelms the single-replacement thermostat. By the time the replacement scout deploys, 2 more scouts are dead. The player needs emergency mass-production rules for catastrophic losses AND single-replacement for attrition.

**Optional discovery:** Players who experiment with `unit_destroyed_within` during Mission 8 are rewarded in Mission 9 (which requires trend sensing for optimal play). The game never forces derivative control — it just makes life easier for players who discover it.

### Mission 9-10: "The Stabilizer"

**Objective:** Sustained operations against adaptive enemies.

**Teaching target:** Full PID equivalent (Level 5). Optional — the game is beatable with Level 3.

**The design philosophy:** By this point, the player has 4-6 rules on their Command unit managing production across multiple unit types. The rule stack itself is a designed artifact — a control system they've built iteratively through failure. The player who examines their own rule stack and recognizes the feedback control pattern has learned the core concept. The Blueprint Codex could include a "Control Theory" card (unlocked after using 4+ production rules on a single Command unit) that makes the mapping explicit:

*"Your Command unit's reinforcement rules form a feedback controller. In control theory, this is called a PID controller: Proportional (respond to the current error), Integral (accumulate corrective actions over time), Derivative (anticipate future error from trends). You've been building one without knowing it."*

---

## Player Journeys

### Journey: Tomás, 16, High School Student, No Engineering Background

**Context:** Mission 7, second attempt. Tomás breezed through Mission 6 with a basic thermostat. Mission 7's first attempt was a disaster — the conveyor belt clogged with scouts, resources hit zero, and the final wave wiped his undefended base. He's staring at the Inspector replay trying to understand what went wrong.

**Minute 0:00 — The Autopsy**
Inspector screen. Board center shows the tick-35 state: 4 scouts wandering the east side of the board, 0 strikers (couldn't afford them), 3 enemy strikers advancing from the north. Tomás clicks COMMAND-ALPHA at E2. The decision trace panel slides open on the right: a vertical stack of rule evaluations, one per tick. Ticks 20 through 28 all show the same pattern — Rule 3 glowing green, action box amber, `queue_blueprint(SCOUT-ALPHA)` executed. Nine consecutive ticks of ordering scouts. The context window chart below shows a flat line — the Command unit's buffer isn't changing because it keeps re-reading the same `unit_count` value.

Tomás scrolls through the decision trace, counting the amber boxes. "It ordered nine scouts? I only needed two." He opens the conveyor belt history panel: 9 golden-bordered scout icons, stacked up at ticks 20-28, deploying one every 4 ticks. Resources graph: a cliff from 20m to 0m between ticks 20 and 34. "It spent everything on scouts."

**Minute 1:30 — The Condition Editor Discovery**
Plan screen. Tomás opens COMMAND-ALPHA's rule editor. Rule 3: `IF unit_count(scout) < 2 THEN queue_blueprint(SCOUT-ALPHA)`. He stares at it. "It checks if scouts are under 2, but it doesn't check if it already ordered one." He clicks the condition field and types "queue" — the autocomplete dropdown appears: `queue_count(type)`, `queue_empty`, `queue_length`. He selects `queue_count(scout)` and adds `< 1` as a second condition. The rule now reads:

`IF unit_count(scout) < 2 AND queue_count(scout) < 1 THEN queue_blueprint(SCOUT-ALPHA)`

The rule strip preview animates: the condition box shows two sub-conditions connected by an AND operator. A thin line connects them — both must glow green for the action to fire.

**Minute 2:15 — The Fix Works**
EXECUTE. Sealed Watch. Tick 15: first wave kills SCOUT-BRAVO. Tick 16: Command antenna rotates, amber arc to factory. One scout queued. Tick 17: Command evaluates — `unit_count(scout) = 1 < 2 = TRUE`, but `queue_count(scout) = 1 < 1 = FALSE`. AND fails. The rule doesn't fire. Tomás's eyes widen — it worked. The conveyor belt shows one scout icon, not nine. Resources hold at 16.5m. Tick 20: SCOUT-BRAVO-II deploys. The thermostat stabilizes.

Tick 30: second wave. Two scouts die simultaneously. Tick 31: Command queues one scout (queue = 0, so condition passes). Tick 32: `queue_count = 1`, rule blocks. One queued, not nine. Tick 35: scout deploys. Tick 36: Command sees `unit_count = 1 < 2, queue_count = 0 < 1` — fires again, orders the second replacement. Two replacements, sequentially, with no waste. Resources at 12m. Enough for the striker he'll need for wave 3.

**Minute 3:30 — Victory and Reflection**
Tick 80: mission complete. Inspector shows the resource graph: smooth, sustainable, no cliff. The conveyor belt history is clean — 4 total replacement scouts across the match, each ordered exactly when needed. Tomás opens the comparison view: attempt 1 (cliff resource graph, 9 scouts ordered) vs. attempt 2 (smooth graph, 4 scouts ordered). The difference is a single condition. He screenshots it for his Discord.

**UI Annotations:**
- **Autocomplete dropdown:** Appears 200ms after typing in condition field. Grouped by category: Unit Counts, Queue Status, Resources, Spatial, Temporal. `queue_count(type)` appears under Queue Status with a one-line description: "Number of pending production orders for this blueprint type."
- **AND operator visualization:** Two condition sub-boxes connected by a horizontal line with "AND" label. Both must glow green for action to fire. If one is blue (not matched), the connecting line shows a red X at the junction.
- **Comparison view:** Side-by-side replay panels (attempt 1 left, attempt 2 right) synced to same tick. Resource graphs overlaid as semi-transparent layers — the cliff vs. the smooth line is immediately legible. Available from Inspector when multiple attempts exist.

---

### Journey: Dr. Suki, 42, Control Systems Engineer, Mission 9

**Context:** Dr. Suki is a professional control engineer at a robotics company. She started Robot Uprising because a colleague described it as "PID tuning but fun." She's on Mission 9, first attempt, and has already built sophisticated multi-rule reinforcement systems. She's about to discover the limit of her approach.

**Minute 0:00 — The Architecture**
Plan screen. Dr. Suki's Command unit (COMMAND-REGULATOR) has 8 rules, color-coded by function:

```
Rule 1 (red):    IF unit_count(scout) == 0 THEN queue × 2        [Emergency P-high]
Rule 2 (red):    IF unit_count(striker) == 0 THEN queue × 2      [Emergency P-high]
Rule 3 (orange): IF destroyed_within(ANY, 3) >= 3 THEN reroute_all_to_defense [D-term]
Rule 4 (blue):   IF unit_count(scout) < 2 AND queue < 1 THEN queue [Steady-state I]
Rule 5 (blue):   IF unit_count(striker) < 3 AND queue < 1 THEN queue [Steady-state I]
Rule 6 (green):  IF unit_count(scout) >= 4 THEN cancel_queue(scout) [Overshoot clamp]
Rule 7 (green):  IF unit_count(striker) >= 5 THEN cancel_queue(striker) [Overshoot clamp]
Rule 8 (gray):   IF resources < 5m THEN suspend_production [Safety shutdown]
```

She's built a MIMO (multi-input, multi-output) controller with independent PID-like loops for scouts and strikers, a shared derivative alarm (Rule 3), overshoot clamping, and a safety shutdown. She annotates each rule with control engineering notation in the optional rule comment field: "Kp_emergency," "Kd_global," "Ki_scout," "output_limit," "safety_interlock."

The minimap sidebar (from 3.07a) shows all 8 rules as thin colored bars. The pattern looks like a traffic light: red-red-orange-blue-blue-green-green-gray. She's designed the visual layout deliberately — priority descending from emergency to steady-state to clamping to safety.

**Minute 1:30 — The Phase Shift**
EXECUTE. Sealed Watch. Ticks 1-40: the thermostat hums. Scouts maintain count 2, strikers maintain count 3. One loss, one replacement, smooth resource curve. Dr. Suki watches with professional satisfaction — her controller is stable.

Tick 41: the enemy changes behavior. Phase shift (from 5.08a-iv). Instead of sending striker waves, the enemy deploys 4 scouts that flood the board with EM noise. The noise fills every channel with junk data. Dr. Suki's relay compresses furiously but context windows fill. Tick 43: RELAY-ALPHA context overloads — stunned for 1 tick. Signal chain breaks.

Tick 44: without relay compression, the Command unit's buffer fills with raw uncompressed scout reports. Its decision rules still evaluate — but now the buffer is full of terrain observations instead of unit counts. The `unit_count(scout)` condition still reads correctly (it's a system-level query, not buffer-dependent), but Rule 3's derivative check (`destroyed_within`) triggers because 2 units were stunned (which the Command unit misinterprets as destroyed — the stun looks like a loss in the event stream).

Dr. Suki watches Rule 3 fire: `destroyed_within(ANY, 3) >= 3 → TRUE (false positive)`. The Command unit reroutes all strikers to defend... against nothing. The enemy scouts aren't a combat threat — they're a noise threat. The thermostat just diagnosed a noise attack as a kinetic attack.

**Minute 3:00 — Inspector Forensics**
Inspector. Dr. Suki scrubs to tick 44 and clicks COMMAND-REGULATOR. Decision trace: Rule 3 matched on `destroyed_within(ANY, 3) = 3`. She clicks the "3" — it expands to show which events: `RELAY-ALPHA stunned (T43), SCOUT-ALPHA stunned (T43), STRIKER-BETA stunned (T44)`. Her eyes narrow. "Those aren't destructions, they're stuns. The condition doesn't distinguish between stun and destroy."

She opens the condition vocabulary reference. `unit_destroyed_within` — counts destruction events. `unit_stunned_within` — counts stun events. They're separate conditions. Her rule used `destroyed_within` which... shouldn't count stuns. She re-reads: `destroyed_within(ANY, 3) = 3`. Wait — she clicks the event detail. The entries say `type: OFFLINE`, not `type: DESTROYED`. The `destroyed_within` condition counts OFFLINE events, which include both destruction AND stun.

"I need a more specific sensor," she mutters. She opens the Plan screen and modifies Rule 3:

`IF unit_destroyed_within(ANY, 3, type=DESTROYED) >= 3 THEN reroute_all_to_defense`

Adding `type=DESTROYED` filters out stun events. This is **sensor filtering** — refining the measurement to exclude noise from the feedback signal. A control engineer's instinct: if the sensor is noisy, filter the sensor, don't change the controller.

**Minute 4:30 — The Realization**
Dr. Suki stares at her 8-rule stack. She's been building PID controllers for 18 years. She's never had a game hand her the problem in such pure form. The rule stack IS a control diagram: inputs (unit_count, destroyed_within, resources) → controller (rules with conditions and priorities) → outputs (queue, cancel, reroute) → plant (the factory and battlefield). The Inspector IS a process historian. The Sealed Watch IS the plant running in real-time. And the noise attack she just faced IS the exact sensor interference problem she debugs in industrial systems.

She screenshots her rule stack and posts it to the game's community forum with the caption: "My Mission 9 regulator. I'm a control systems engineer. This game just taught me something about my own field."

**UI Annotations:**
- **Rule comment field:** Optional 30-character annotation per rule, displayed as faint gray text below the action. No mechanical effect. Professionals use it for engineering notation; casual players ignore it.
- **Color tags:** 6 colors available per rule (red, orange, yellow, blue, green, gray). Visual-only. The minimap sidebar renders rules as colored bars — the color pattern becomes a fingerprint for the control architecture.
- **Condition type filter:** When a condition like `destroyed_within` triggers, the event detail panel shows each counted event with its type tag (DESTROYED, STUNNED, OFFLINE). A dropdown filter on the condition allows restricting to specific event types. The dropdown is only visible in the expanded condition editor — not in the compact rule view.
- **Sensor noise diagnostic:** In Inspector, when a rule fires on events that include mixed types (destruction + stun), a small ⚠ icon appears on the decision trace: "This condition counted mixed event types. Consider filtering." The warning appears only on rules that matched — not on every evaluation.

---

### Journey: Rosa, 62, Retired Teacher, Playing with Grandson Tomás, Mission 6

**Context:** Rosa has never played a strategy game. She's watching Tomás play Mission 6 and asking questions. She's sitting beside him on the couch, iPad on the coffee table. This is her first exposure to the thermostat concept.

**Minute 0:00 — The Conversation**
Tomás is configuring the Command unit's rule. Rosa reads the screen: "If scout count less than two, queue scout." She asks: "What does that mean?" Tomás explains: "It tells the boss unit to build a new scout whenever one dies." Rosa: "Like a thermostat? Your grandfather's greenhouse had one. If the temperature dropped below 20, it turned on the heater."

Tomás pauses. He's never heard the word thermostat in this context. "Yeah... actually, exactly like that. The Command unit checks the temperature — scout count — and turns on the heater — the factory — when it drops."

Rosa points at the screen: "But what if it gets too hot? The greenhouse thermostat had a maximum too. If the temperature went above 25, it turned off."

**Minute 0:45 — The Insight**
Tomás looks at his rule: `IF unit_count(scout) < 2 THEN queue_blueprint(SCOUT-ALPHA)`. There's no upper bound. He adds a second rule: `IF unit_count(scout) >= 4 THEN cancel_queue(scout)`. Rosa nods approvingly: "Now it has a minimum and a maximum. A dead band."

Tomás stares at his grandmother. "Did you just use the word 'dead band'?" Rosa laughs: "Your grandfather talked about his greenhouse for forty years. I know what a dead band is."

**Minute 1:30 — EXECUTE**
They hit EXECUTE together — Rosa presses the button on the iPad (it's a large, satisfying target). Sealed Watch. Tick 14: scout dies. Rosa watches the amber arc from Command to factory. "There — it turned on." Tick 22: replacement deploys. "And now it's satisfied." Tick 50: two scouts die simultaneously. Rosa tenses. The Command unit orders one replacement (anti-windup from Tomás's queue_count condition). "Only one? It needs two." Tomás: "It'll order the second one after the first deploys." Rosa: "Ah — it only does one at a time. Smart. No waste."

**Minute 2:30 — The Teaching Loop**
Mission complete. Inspector. Tomás shows Rosa the resource graph — smooth and sustainable. Rosa traces the curve with her finger: "See these little dips? Each one is a replacement order. And the line always comes back up. That's a stable system." Tomás: "How do you know this?" Rosa: "Forty years of listening to your grandfather complain about temperature oscillation in the north wing. You just built a better greenhouse controller than he ever had."

**UI Annotations:**
- **iPad layout:** Plan screen uses "The Flip" layout (from 6.07) — workbench fills the screen, board preview in bottom strip. The EXECUTE button is large (64×64pt minimum touch target) in the top-right corner.
- **Sealed Watch on iPad:** Board fills the screen. Tick clock pips are large and well-spaced. Buffer bars on units are visible without zoom. The amber arc from Command to factory is a thick, clearly visible line — not a thin trace that gets lost on a tablet screen.
- **Intergenerational touchpoint:** The thermostat metaphor requires no gaming vocabulary. "If X drops below Y, turn on Z" is universally comprehensible. The game's rule editor uses this exact structure: condition (check) → action (response). No jargon required for the first rule.

---

### Journey: Kwame, 30, ML Engineer at a Startup, Mission 9 Gauntlet

**Context:** Kwame streams on Twitch. He's doing a Gauntlet run (competitive mode) and needs to optimize his Command unit's rule stack for minimum resource waste while maintaining army composition against unknown opponents. He's theory-crafting on stream.

**Minute 0:00 — The Whiteboard Stream**
Kwame has a drawing tablet open alongside the game. He sketches a control diagram on stream: "Chat, here's what I'm doing. This is a MIMO controller." He draws boxes: SCOUT_PV → ERROR → CONTROLLER → FACTORY → SCOUT_PV. "My Command unit has two control loops — one for scouts, one for strikers. They share the factory as an actuator. That means they compete for production time. If I'm replacing scouts, I can't build strikers. Resource contention."

Chat: "just build more factories lol"
Kwame: "One factory per base, chat. This is a single-actuator MIMO problem. I need to prioritize."

**Minute 1:00 — The Priority Inversion Problem**
Kwame's current config prioritizes scouts over strikers (Rule 4 above Rule 5 in the stack). He explains: "If I lose a scout AND a striker on the same tick, the Command unit orders the scout first because Rule 4 has higher priority. But in a Gauntlet game against an aggressive player, losing a striker is worse than losing a scout — strikers are my offense. I need conditional priority inversion."

He modifies his rules:

```
Rule 3 (dynamic): IF enemy_count > friendly_striker_count THEN prioritize_striker_replacement
Rule 4 (scout):   IF unit_count(scout) < 2 AND NOT Rule_3_active THEN queue scout
Rule 5 (striker):  IF unit_count(striker) < 3 AND NOT Rule_4_active THEN queue striker
```

"Wait, I can't reference other rules as conditions." He pauses. "Okay, let me restructure."

```
Rule 3: IF enemy_count > unit_count(striker) AND unit_count(striker) < 3 AND queue_count(striker) < 1 THEN queue striker
Rule 4: IF unit_count(scout) < 2 AND queue_count(scout) < 1 AND queue_count(striker) == 0 THEN queue scout
```

"Rule 3 fires first if there are more enemies than strikers. Rule 4 only fires if no striker is being built. The priority inverts based on battlefield conditions." Chat: "GIGABRAIN." Kwame: "This is just dynamic scheduling, chat. Every OS does this."

**Minute 2:30 — The Meta-Observation**
Kwame wins the Gauntlet match. In Inspector, he examines the resource utilization chart. His factory ran at 94% utilization (almost no idle ticks) with zero overshoot. The rule stack handled three phase shifts without manual intervention.

He turns to camera: "Chat. I've been building MLOps pipelines for three years. This Command unit rule stack is literally a Kubernetes pod autoscaler. `unit_count < 2` is a replica count threshold. `queue_count` is checking pending pod creation. The resource limit is a CPU quota. I am playing Kubernetes: The Game."

Chat goes wild. Someone clips it. The clip gets 12K views with the title "ML engineer realizes he's been playing Kubernetes."

**UI Annotations:**
- **Stream overlay:** The minimap sidebar (colored rule bars) is positioned where a stream overlay won't obscure it. Streamers use the rule bar pattern as a visual shorthand — "see the red-blue-green pattern? That's my control stack."
- **Inspector resource utilization:** A percentage showing factory uptime (ticks producing ÷ total ticks). Competitive players optimize for high utilization — an idle factory is wasted potential. The utilization stat appears in the match summary card (useful for streaming highlight cards).
- **Condition chaining visualization:** When a rule's condition includes multiple AND/OR sub-conditions, the rule strip shows them as linked nodes. Complex conditions (3+ sub-conditions) show a small topology diagram — a mini flowchart of the boolean evaluation. Kwame's 3-condition Rule 4 shows three connected boxes.

---

## Interaction Effects

### With the Inspector (Locked)
The thermostat pattern generates the most interesting Inspector data of any building block. The decision trace for a Command unit with production rules shows a repeating pattern: evaluate → fire/don't fire → evaluate → fire/don't fire. This oscillation pattern IS the control signal. Inspector should offer a "Control View" overlay that renders the production rules' firing pattern as a time-domain signal: a binary waveform (high = fired, low = idle) plotted against the unit count it's controlling. This visualization is exactly what a control engineer would plot in MATLAB — the game should provide it natively.

### With the Conveyor Belt (Locked)
The conveyor belt is the actuator's visible state. When the thermostat overproduces, the belt stacks up visually. When the thermostat is well-tuned, the belt flows smoothly — one icon at a time, deployed as needed. The belt is the first place the player sees thermostat malfunction. **Design implication:** the conveyor belt must show pending orders clearly, with golden borders for AI-ordered units and remaining build time visible on each icon.

### With Context Overload (Locked)
A Command unit running 6+ production rules evaluates many conditions per tick. Each evaluation consumes processing (a tick action). If the Command unit's buffer is full of production-management data, it has less room for battlefield intelligence. The player must balance production automation against tactical awareness. **Design implication:** production rules should be simple conditions (unit_count, queue_count, resources) that don't consume buffer slots, but complex conditions (destroyed_within) should consume a buffer slot to "hold" the temporal window data.

### With the Sealed Watch (Locked)
The thermostat's operation during Sealed Watch is one of the game's most satisfying moments. The player can't intervene — they just watch their control system work. When the thermostat stabilizes correctly, the feeling is parental pride. When it oscillates, the feeling is dread. The no-pause rule (Sealed Watch has no skip, no tools) means the player must sit through both success and failure at 1 second/tick. **Design implication:** the amber production-order arc from Command to factory is the thermostat's heartbeat — it must be visible, satisfying, and clear. It IS the control signal made visual.

### With Channels and Hooks (Locked)
The thermostat doesn't require hooks — it uses system-level conditions (`unit_count`), not information from channels. But a more advanced variant could: a Command unit that listens to a "casualty" channel and counts incoming signals to detect losses faster than the system-level count updates. This hooks-based thermostat is noisier (subject to false signals) but faster (learns about losses from the signal that reported the combat, not from the post-death system update). The hooks-based approach is a natural Level 6 extension for advanced players.

### With Blueprint Doctrines (5.09a — Locked)
Different Doctrines constrain the thermostat differently:
- **Stealth Doctrine:** Limits hook slots → Command can run fewer production rules → simpler thermostats
- **Swarm Doctrine:** Encourages high unit counts → thermostat set points are higher, oscillation risk increases
- **Singleton Doctrine:** Only 1 of each unit type → thermostat is binary (alive/dead), simplifying to pure bang-bang
- **Firewall Doctrine:** Emphasizes relay defense → thermostat prioritizes relay replacement over combat units

---

## Comparable Games and Systems

### Screeps (Creep Spawning Logic)
Screeps players write JavaScript functions to manage creep populations. The canonical beginner pattern is:
```javascript
if(harvesters.length < 2) {
    Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'Harvester' + Game.time);
}
```
This is *exactly* the bang-bang thermostat. Advanced Screeps players add queue checks, role-priority queues, energy-threshold gates, and body-part scaling based on available resources — the full PID equivalent. Screeps teaches this through pain (your base dies when the thermostat fails) over hundreds of hours. Robot Uprising must teach it in 10 missions. The advantage: visual Inspector feedback vs. Screeps' text console logging.

### Factorio (Logistics Network Circuit Conditions)
Factorio's circuit network allows setting insertion conditions: "insert into assembler IF iron plates in network < 200." This is a bang-bang controller for logistics. Advanced players build PID-equivalent circuits using arithmetic combinators. The community has published literal PID controller designs using combinators. Factorio's lesson: the circuit network is powerful enough for PID but most players never build one because the game doesn't teach the concept. Robot Uprising has the advantage of a dedicated Command unit with rule semantics that map directly to control primitives.

### Dwarf Fortress (Standing Work Orders)
Dwarf Fortress allows "standing orders" that produce items when stockpile counts drop below a threshold. "Brew drinks if count < 20." This is bang-bang control with hysteresis — the order fires at < 20 and doesn't fire again until the drinks are consumed back below 20. The oscillation problem is identical: dwarves brew too many drinks, the brewery is clogged, and they run out of barrels. Robot Uprising should study DF's standing order UI — it's simple, direct, and players understand it intuitively despite having no control theory background.

### Real PID Controllers (Industrial)
The thermostat rule progression maps 1:1 to the industrial PID tuning process:
1. Start with P-only (proportional). Observe offset error (the "droop").
2. Add I-term (integral) to eliminate offset. Observe wind-up oscillation.
3. Add anti-windup (clamp or conditional reset).
4. Add D-term (derivative) for faster response. Observe derivative kick.
5. Tune gains until stable.

Robot Uprising compresses this into 5 missions instead of a semester of control systems coursework. The abstraction level (discrete rules instead of continuous transfer functions) makes the concepts accessible without math.

---

## The TikTok Clip

**The clip:** A player's Command unit has 6 rules. During Sealed Watch, the enemy sends a massive wave. The conveyor belt goes into overdrive — replacement icons flowing left-to-right in a steady stream. But the resource counter holds. The unit count dips and recovers, dips and recovers, dips and recovers — a perfect oscillation dampened to stability. The minimap rule bars flicker: red fires, then blue fires, then green fires, cycling through the control logic. The player hasn't touched anything since hitting EXECUTE. Their system is alive.

Caption: "I didn't build units. I built a thermostat that builds units."

The clip works because it shows **autonomy** — the system self-regulating through a crisis. The viewer immediately wants to build their own thermostat.

---

## New Aspects Discovered

1. **3.19a-i-a — The `queue_count` condition as anti-windup primitive:** Detailed design of the queue checking mechanism — what exactly does queue_count return? Does it count only AI-ordered units or also player-queued? Does it update instantly or with delay? The queue_count semantics determine whether anti-windup is trivial or a puzzle.

2. **3.19a-i-b — The `cancel_queue` action as output clamping:** Detailed design of mid-production cancellation — does canceling refund resources? Partial refund? Does it cancel the oldest or newest order? Cancel semantics determine whether output clamping is a free safety valve or a costly last resort.

3. **3.19a-i-c — The "Control View" Inspector overlay:** A dedicated Inspector panel that renders production rule firing patterns as time-domain waveforms — binary fire/idle signals plotted against the controlled variable (unit count). The control engineer's MATLAB plot, built into the game. When should this unlock? Is it a standard Inspector feature or a Codex-gated power tool?

4. **3.19a-i-d — Multi-type resource contention in MIMO thermostats:** When one Command unit manages reinforcement for scouts AND strikers AND relays, the single-factory actuator creates resource contention. Dynamic priority inversion, conditional scheduling, and factory utilization optimization as emergent gameplay. The OS scheduler analogy.

5. **3.19a-i-e — Hooks-based thermostat vs. system-level thermostat:** The advanced variant where the Command unit learns about losses from channel signals rather than system-level queries. Faster response but noisier signal. The tradeoff between bandwidth and accuracy as a late-campaign design decision.
