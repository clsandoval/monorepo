# Onboarding: The "Overcautious" Diagnostic in Inspector

**Aspect ID:** 5.14f
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding / Inspector Teaching Tools
**Parent:** 5.14a — Fidelity threshold as onboarding gate (global threshold slider)
**Related aspects:** 5.14b (per-channel fidelity thresholds), 5.14c (fidelity threshold as rule condition), 5.14d (adaptive fidelity threshold), 5.14e (enemy fidelity spoofing), 2.11 (signal fidelity degradation), 4.04 (debrief screen), 4.04b (two-act debrief structure), 8.09 (diagnostic teaching layer), 4.03 (buffer visualization), 5.04 (complexity ramp)

---

## The Design Question

The player has just learned about fidelity thresholds (5.14a). They understand the concept: set a minimum quality bar, and signals below it get rejected. The Fog Mission taught them what happens when you have NO threshold — context poisoning, erratic behavior, cascade failure. The emotional lesson was clear: filter your signals or die.

But the game has now created a predictable overcorrection. The player, burned by the Fog Mission's context overload, cranks the fidelity threshold to 0.8 or 0.9. "I'll only accept the best signals." This feels safe. This feels like the lesson learned. And it IS a lesson learned — but it's the wrong one, or rather, it's the first half of a two-part lesson.

The second half: **a threshold set too high starves your units of information.** A scout reporting through one relay hop delivers signals at fidelity 80. Through two hops, fidelity 60. A threshold of 0.8 means anything that touched a relay twice is invisible. The player's network goes deaf to everything except adjacent, direct observations. Units with no relay-sourced intelligence sit idle, unable to act, while enemies maneuver in the gaps between their perception radii. The architecture is blind — not because information doesn't exist, but because the player told their units to throw it away.

The overcautious diagnostic is the Inspector screen's answer to this overcorrection. It appears in the post-mission debrief — Act 2, after the seal breaks — as a contextual annotation on units that rejected a disproportionate number of useful signals. It does not tell the player what to do. It shows them what they missed, with numbers, and lets the realization arrive on its own.

The teaching question: **How do you show a player that the safety they built is actually blindness, without lecturing them?** The answer is quantified counterfactual evidence. "You rejected 47 signals. Only 3 were genuine noise. 44 were usable intelligence that never reached your unit's decision engine."

---

## Mechanical Specification

### What Triggers the Diagnostic

The overcautious diagnostic fires when a unit's **rejection-to-noise ratio** exceeds a threshold across the mission. The calculation:

```
total_rejected = signals received but discarded by fidelity threshold
genuine_noise  = rejected signals with fidelity < 0.2 (truly unusable)
useful_rejected = total_rejected - genuine_noise
rejection_waste_ratio = useful_rejected / total_rejected

IF rejection_waste_ratio > 0.6 AND total_rejected > 10:
    flag unit as OVERCAUTIOUS
```

The 0.6 threshold means: more than 60% of what the unit threw away was actually usable. The minimum of 10 total rejections prevents the diagnostic from firing on units that only rejected one or two signals (too little data to be meaningful).

"Usable" means fidelity >= 0.2 — the signal contained at least some actionable information (a quadrant, a unit class, a cardinal direction). This is a generous definition. The diagnostic is not claiming the unit should have accepted everything. It is claiming that most of what the unit rejected was not garbage.

### What the Diagnostic Shows

When the player clicks on an overcautious-flagged unit in the Inspector, a diagnostic card appears in the unit's inspection panel. The card is distinct from the standard decision trace and context window panels — it has a different border treatment (amber dashed, not solid cyan) to signal that this is a **meta-observation** about the unit's configuration, not a replay of what happened.

The card contains:

```
SIGNAL FILTER DIAGNOSTIC
────────────────────────────────────────────
Fidelity threshold: 0.85

Signals received this mission:     63
Signals accepted (above 0.85):     16  ████░░░░░░
Signals rejected (below 0.85):     47  ░░░░░░░░░░

Of the 47 rejected signals:
  Genuine noise (fidelity < 0.2):   3  ▓▓▓
  Usable intelligence (0.2-0.84):  44  ████████████████████████████████

Your unit operated on 25% of available intelligence.
A threshold of 0.45 would have accepted 58 of 63 signals
while still rejecting all 3 noise entries.
────────────────────────────────────────────
```

The critical line: **"Your unit operated on 25% of available intelligence."** This is the gut punch. Not "your threshold was too high" — which is a prescription. Instead, a factual measurement of how much of the world the unit could see versus how much it chose to ignore.

The suggested threshold ("0.45 would have accepted 58 of 63") is presented as a counterfactual, not a recommendation. The game is not telling the player to set their threshold to 0.45. It is showing them what 0.45 would have looked like with this mission's signal distribution. Different missions, different enemy compositions, different relay topologies will produce different optimal thresholds. The counterfactual teaches calibration thinking, not a specific number.

### The Rejected Signal Timeline

Below the summary card, the diagnostic expands into a **rejected signal timeline** — a horizontal strip aligned with the main mission timeline scrubber, showing each rejected signal as a colored pip at the tick it was rejected.

Each pip is color-coded by fidelity:
- **Red pips** (fidelity 0.0-0.19): genuine noise. These were correctly rejected.
- **Amber pips** (fidelity 0.2-0.49): degraded but usable. Position approximate, type known.
- **Teal pips** (fidelity 0.5-0.84): good intelligence. Position within one tile, full type and direction.

The visual is immediate: a timeline dominated by amber and teal pips, with only a scattering of red. The player sees at a glance that the threshold caught almost nothing it should have caught, and threw away almost everything it shouldn't have.

Clicking any pip scrubs the main timeline to that tick and shows, in the unit's context window panel, what the signal contained — rendered as a greyed-out context entry with the text "REJECTED (fidelity 0.62, threshold 0.85)" in amber type. The player can see the signal's content: "ENEMY STRIKER, approx. D3-F5, heading west." They can see that this was real intelligence. They can see that their unit never knew about it.

### The "What If" Toggle

A toggle at the bottom of the diagnostic card: **"Show accepted signals at threshold 0.45."** When enabled, the rejected signal timeline transforms: amber and teal pips turn solid (accepted), red pips remain hollow (still rejected). The unit's context window panel replays with the lower threshold — showing what the buffer would have looked like at each tick if the threshold had been 0.45 instead of 0.85.

This is a lightweight counterfactual simulation. It does not re-simulate the entire mission (that would require replaying all agent decisions with different context states). It only shows what would have been in the buffer — the raw inputs, not the outputs. The player must infer for themselves how the additional intelligence might have changed the unit's behavior. This incompleteness is intentional: the game gives evidence, not answers. The player does the reasoning.

---

## Player Journeys

### Journey: Dante, 26, Network Engineer, Mission 7 (Post-Fog Mission)

**Context:** Dante just experienced the Fog Mission (5.14a). His entire network collapsed from signal flooding. He lost every unit. During the debrief, he saw context bars saturated with red noise pips, event logs showing "RECEIVED fidelity 0.18... RECEIVED fidelity 0.22... RECEIVED fidelity 0.14" in an unbroken cascade. He was angry. He was not going to let that happen again.

**Minute 0:00 — The Overreaction (Plan Phase, Mission 7)**

Dante opens the Plan screen for Mission 7. Before reading the mission briefing, before looking at the map, before placing a single unit, he goes to his blueprint library and opens every blueprint's Context Config panel. He drags the fidelity threshold slider to 0.85 on every unit. Scouts, relays, strikers — all of them. His internal monologue: "Nothing gets through unless it's nearly perfect."

He places his architecture. Three scouts with wide perception. Two relays in a compression cascade. Four strikers defending the western approach. The relay topology is clean — scouts feed relays, relays compress and forward to strikers. Two hops maximum from any scout to any striker.

He hits EXECUTE.

**Minute 1:30 — The Sealed Watch (Ticks 1-35)**

The battle begins. Scouts spot enemies immediately — green observation pips fill their buffer bars. Signal lines fire from scouts to relays. The relays receive the signals... and something is wrong. The relay buffer bars barely change. Signals arrive (green flash on the tile edge) but the bars stay sparse. Signal delivery lines flash green at the relay, then — nothing. No forwarding lines to the strikers.

Dante watches, uneasy. His strikers are idle. Their buffer bars are empty or nearly empty. They stand on their defensive positions with no context about incoming threats. An enemy scout appears at E6, clearly visible to SCOUT-A three tiles away. SCOUT-A's hook fires. A signal travels to RELAY-B. RELAY-B's tile flashes green. But RELAY-B's buffer bar doesn't change, and no signal line appears toward the strikers.

The enemy striker advances from E6 to D6 to C6. Dante's STRIKER-1, positioned at B5, does nothing. Its rule says "IF enemy in adjacent tile, engage." But STRIKER-1 doesn't know the enemy is at C6 because the relay signal about that enemy was fidelity 0.62 after compression and one hop — below the 0.85 threshold. STRIKER-1's context window contains a single self-perceived observation from three ticks ago: "TERRAIN: forest." Nothing else.

**Tick 28:** The enemy striker reaches B6 — adjacent to STRIKER-1. Now STRIKER-1 perceives it directly, fidelity 100. The rule fires. Engage. But the enemy also fires. One-shot-one-kill. Both units destroy each other. Dante has traded a striker for a striker — a clean exchange, but one that should have been an easy interception at C6 if STRIKER-1 had known the enemy was coming two ticks earlier.

**Tick 31-35:** The same pattern repeats across the western flank. Three enemies approach through gaps in perception coverage. Dante's strikers react only when enemies reach adjacent tiles — reactive, never proactive. Two more trades. One outright loss where the enemy striker approached from an angle that Dante's striker couldn't match.

The mission ends. Dante passes, barely — 61/100. He knows something went wrong with his information network. He just doesn't know what.

**Minute 4:00 — The Inspector (Act 2)**

The seal breaks. Dante clicks RELAY-B first — the central relay that should have been the intelligence hub. The context window shows 4 entries at tick 35. He expected 12. He opens the event log and sees the cascade:

```
T03  threat-net  RECEIVED  fidelity 0.78  → REJECTED (below threshold 0.85)
T04  threat-net  RECEIVED  fidelity 0.62  → REJECTED (below threshold 0.85)
T06  threat-net  RECEIVED  fidelity 0.71  → REJECTED (below threshold 0.85)
T07  threat-net  RECEIVED  fidelity 0.58  → REJECTED (below threshold 0.85)
T08  scout-net   RECEIVED  fidelity 0.80  → REJECTED (below threshold 0.85)
T09  threat-net  RECEIVED  fidelity 0.69  → REJECTED (below threshold 0.85)
...
```

Forty-seven lines of REJECTED. Dante stares. The signals weren't noise. They were real intelligence — enemy positions, movement vectors, threat assessments — arriving at fidelities between 0.5 and 0.82. His relay rejected them all because he told it to demand 0.85.

Then the diagnostic card materializes below the event log — amber dashed border, distinct from the cyan panels around it:

```
SIGNAL FILTER DIAGNOSTIC
────────────────────────────────────────────
Fidelity threshold: 0.85

Signals received this mission:     63
Signals accepted (above 0.85):     16  ████░░░░░░
Signals rejected (below 0.85):     47  ░░░░░░░░░░

Of the 47 rejected signals:
  Genuine noise (fidelity < 0.2):   3  ▓▓▓
  Usable intelligence (0.2-0.84):  44  ████████████████████████████████

Your unit operated on 25% of available intelligence.
A threshold of 0.45 would have accepted 58 of 63 signals
while still rejecting all 3 noise entries.
────────────────────────────────────────────
```

**Minute 5:30 — The Realization**

Dante reads it three times. "Only 3 were genuine noise." He set his threshold to 0.85 to protect against noise, and in this mission there were only three noise signals total. He rejected 44 perfectly good intelligence reports to avoid three pieces of junk. His protection-to-cost ratio was 3:44 — he burned 44 real observations to catch 3 fake ones.

He looks at the rejected signal timeline below the card. A strip of pips: forty-four teal and amber, three red. The teal pips are clustered in the early and middle ticks — the period when his scouts were actively reporting enemy movement. The red pips are scattered, inconsequential. The visual is overwhelming: a wall of useful intelligence his unit threw away.

He clicks a teal pip at tick 7. The main timeline scrubs to tick 7. RELAY-B's context window shows a greyed-out entry: "ENEMY STRIKER, position D5 (exact), heading west, speed 2 — REJECTED (fidelity 0.71, threshold 0.85)." The signal had exact position, exact heading, exact speed. Fidelity 0.71 is one-hop degraded from an 0.91 original — a scout two tiles away that reported clean intelligence. The relay threw it out because 0.71 is not 0.85.

**Minute 7:00 — The Calibration**

Dante clicks the "What If" toggle: "Show accepted signals at threshold 0.45." The rejected timeline transforms — amber and teal pips solidify. The three red pips stay hollow. He watches the counterfactual context window replay: at tick 7, the buffer would have contained the enemy striker's position, heading, and speed. At tick 8, a second enemy report. By tick 12, the relay's buffer would have held a comprehensive threat picture of the western approach.

He scrubs to tick 26 — two ticks before his STRIKER-1 was surprised by the adjacent enemy. In the counterfactual, the striker's context window contains "ENEMY STRIKER, position C6, heading west" — the signal that would have triggered the "IF enemy approaching, intercept" rule at C6 instead of waiting for adjacent contact at B6. The interception would have happened two ticks earlier, with no risk of a mutual trade.

Dante drags the threshold slider to 0.5 in his head. He goes back to the Plan screen. He adjusts RELAY-B's threshold to 0.50. He adjusts the strikers to 0.45. He leaves the scouts at 0.85 — scouts perceive directly at fidelity 100, so their threshold only affects incoming relay intelligence, and scouts are mostly senders, not receivers.

He replays Mission 7. Score: 89/100. No surprise engagements. The strikers knew about approaching enemies three to four ticks in advance.

**UI Annotations:**
- Diagnostic card: appears in the unit inspection panel below the event log and decision trace; amber dashed border (2px, #d4a03c, dash pattern 6px-4px); separated from standard panels by 16px vertical space and a label "DIAGNOSTICS" in small caps, amber text
- Rejected signal timeline: 24px tall horizontal strip below the diagnostic card; aligned with the master timeline scrubber at the top of the Inspector; pips are 4px diameter circles with 2px spacing; red (#c24a3e), amber (#d4a03c), teal (#3eb5a5); hover on pip shows fidelity value as a small floating number
- "What If" toggle: pill-shaped toggle, 80px wide, at the bottom-left of the diagnostic card; "0.45" value displayed inside the pill; toggling on triggers a 300ms transition where the timeline pips cross-fade from hollow to solid

---

### Journey: Amara, 34, High School Teacher, Mission 8 (No Engineering Background)

**Context:** Amara plays slowly and carefully. She reads every Inspector panel. She understood the Fog Mission's lesson as "filter bad signals" but hasn't thought deeply about calibration — she set her fidelity thresholds to 0.7 across the board because it felt like a reasonable "high but not too high" number. She's been passing missions at 65-75/100, not realizing she's leaving performance on the table.

**Minute 0:00 — A Passing Mission with Hidden Cost (Inspector, Mission 8)**

Amara passes Mission 8 with 72/100. She's satisfied — 72 is her average. She opens the Inspector to review a specific moment where STRIKER-2 failed to engage an enemy that walked past its position. She clicks STRIKER-2.

The event log shows the expected activity — some signals received, some rules matched. Then she notices the amber dashed panel below:

```
SIGNAL FILTER DIAGNOSTIC
────────────────────────────────────────────
Fidelity threshold: 0.70

Signals received this mission:     41
Signals accepted (above 0.70):     27  ██████░░░░
Signals rejected (below 0.70):     14  ░░░░░░░░░░

Of the 14 rejected signals:
  Genuine noise (fidelity < 0.2):   1  ▓
  Usable intelligence (0.2-0.69):  13  ███████████████

Your unit operated on 66% of available intelligence.
A threshold of 0.35 would have accepted 40 of 41 signals
while still rejecting the 1 noise entry.
────────────────────────────────────────────
```

Amara's first reaction is not alarm — 66% sounds okay. She's a teacher. She thinks in percentages constantly. 66% is a D. She pauses. *My unit was working with a D's worth of information?*

**Minute 1:30 — Following the Rejected Signals**

She looks at the rejected signal timeline. Thirteen amber and teal pips. One red. She clicks the amber pip at tick 19 — the tick just before STRIKER-2 failed to engage the passing enemy.

The greyed-out context entry: "ENEMY SCOUT, position F4, heading south — REJECTED (fidelity 0.58, threshold 0.70)." The enemy scout that walked past STRIKER-2 at F5. The signal arrived at fidelity 0.58 — two relay hops from the original scout observation. STRIKER-2's rule would have matched: "IF enemy in perception radius AND heading toward base, intercept." But the signal never entered the context window. The rule never saw it. STRIKER-2 stood still while the enemy walked past.

Amara clicks adjacent pips. Tick 17: "ENEMY STRIKER, approx. E3-G5, heading south — REJECTED (fidelity 0.52)." Tick 21: "ENEMY RELAY, position G6, stationary — REJECTED (fidelity 0.48)." Each signal was a piece of the tactical picture that STRIKER-2 needed and never received.

**Minute 3:00 — The Teacher's Instinct**

Amara understands what's happening. She frames it to herself the way she'd explain it to a student: "The threshold is like a teacher who only listens to students who speak perfectly clearly. The quiet students — the ones who stammer, who speak softly — they have real things to say but they never get heard because the bar is set for confidence, not content."

She doesn't need the "What If" toggle. She understands the principle. She goes back to the Plan screen and adjusts STRIKER-2's threshold to 0.40. She adjusts RELAY-A to 0.35. She leaves SCOUT-1 at 0.70 because she's learned (from the diagnostic showing "signals received" vs. "signals rejected" ratios per unit) that scouts receive fewer relay signals anyway.

She replays Mission 8. Score: 81/100. STRIKER-2 intercepts the enemy scout at F5 on tick 20. The nine-point improvement comes entirely from better information flow, not better placement or rules.

**Minute 5:00 — The Pedagogical Insight**

Amara opens the Inspector on the replay. She checks STRIKER-2's diagnostic. It now shows:

```
Signals received: 41  |  Accepted: 39  |  Rejected: 2
Genuine noise: 1  |  Usable rejected: 1
Your unit operated on 95% of available intelligence.
```

No overcautious flag. The amber dashed border is gone — the diagnostic card only appears when the waste ratio exceeds 60%. Its absence is the confirmation: the threshold is calibrated.

She sits back and thinks about how this diagnostic pattern could work in her classroom. Not the fidelity numbers — the feedback structure. Showing students not "you got a C" but "you attempted 20 problems and skipped 8, but 7 of the 8 you skipped were problems you could have solved." Quantified missed opportunity as teaching tool, not judgment as punishment.

**UI Annotations:**
- The diagnostic card's absence on the replay is a teaching signal in itself — the player learns that the diagnostic only appears when there's a calibration problem, which trains them to notice its presence as meaningful
- The "66% of available intelligence" framing uses language that maps to report card percentages, which Amara parses instantly; this is not accidental — the phrasing is designed to recruit existing mental models about what "66%" means
- On units where the diagnostic does NOT appear, the event log still shows RECEIVED/REJECTED entries for individual signals; the diagnostic card aggregates and contextualizes, but the raw data is always available

---

### Journey: Kwame, 22, Competitive Player, Mission 14 (Late Campaign, Enemy Spoofing Active)

**Context:** Kwame is in the late campaign where enemies use fidelity spoofing (5.14e) — injecting signals with artificially inflated fidelity scores to bypass thresholds. He's learned to use secondary source verification. His thresholds are carefully tuned per-channel: threat-net at 0.55, scout-net at 0.45, command-net at 0.70. He's experienced with the overcautious diagnostic and hasn't triggered it in five missions. Then Mission 14 introduces a new enemy pattern.

**Minute 0:00 — The Arms Race Shifts**

Mission 14's enemy deploys a new tactic: **fidelity suppression.** Instead of flooding with fake high-fidelity signals (spoofing), the enemy broadcasts interference that degrades ALL signals on the battlefield by 15 fidelity points. Kwame's scout observations that would normally arrive at a relay at fidelity 80 now arrive at 65. Two-hop signals that would arrive at 60 now arrive at 45. Three-hop signals drop to 25.

Kwame doesn't know about the suppression field. He designed his architecture with his usual thresholds and hit EXECUTE.

**Minute 1:30 — The Sealed Watch (Ticks 1-40)**

The battle plays normally for the first eight ticks — the suppression field hasn't activated yet. Then, at tick 9, a subtle visual shift: the colored signal lines on the battlefield dim slightly, as if the brightness was turned down one notch. This is the suppression field's only visual tell during sealed watch. Signal delivery flashes continue, but the lines are dimmer. Buffer bars on relays and strikers begin to thin — fewer signals accepted per tick.

By tick 20, Kwame's strikers are operating on partial information. Not blind — they're still receiving direct perceptions and one-hop signals above their thresholds — but the deep relay intelligence from his three-hop chain is gone. His back-line command agent, which synthesizes relay reports to issue strategic repositioning orders, has an almost empty buffer. It's issuing no commands because it has no context to reason about.

The enemy, unaffected by its own suppression field, maneuvers through the information gaps. Two flanking strikers bypass Kwame's forward scouts by moving through the zones where his relay chain provides no coverage. His architecture was designed for a 55-fidelity world; the suppression field turned it into a 40-fidelity world, and his thresholds didn't adapt.

Mission result: 54/100. A near-failure.

**Minute 3:00 — The Inspector Reveals the Pattern**

Kwame opens the Inspector. He clicks his command agent first — the unit that went silent. The overcautious diagnostic appears:

```
SIGNAL FILTER DIAGNOSTIC
────────────────────────────────────────────
Fidelity threshold: 0.70

Signals received this mission:     89
Signals accepted (above 0.70):      8  █░░░░░░░░░
Signals rejected (below 0.70):     81  ░░░░░░░░░░

Of the 81 rejected signals:
  Genuine noise (fidelity < 0.2):   7  ▓▓▓▓▓▓▓
  Usable intelligence (0.2-0.69):  74  ████████████████████████████████████████

Your unit operated on 9% of available intelligence.
A threshold of 0.30 would have accepted 82 of 89 signals
while still rejecting all 7 noise entries.
────────────────────────────────────────────
```

Nine percent. Kwame exhales. His command agent was virtually deaf for the entire mission. He looks at the rejected signal timeline — a solid wall of teal and amber pips from tick 9 onward, with seven scattered red pips. The teal cluster begins exactly at tick 9.

He scrubs to tick 9 on the main timeline. The battlefield view shows the suppression field activating — a faint reddish overlay shimmering across the grid. He didn't notice it during the sealed watch. Now, in the Inspector, he sees it clearly because the signal lines dimmed at exactly this tick.

**Minute 5:00 — Cross-Referencing Units**

Kwame clicks through his other units. RELAY-C shows a diagnostic too — threshold 0.55, 34 signals rejected, 29 usable. But SCOUT-A shows no diagnostic — scouts perceive directly at fidelity 100, and the suppression field only degrades transmitted signals, not direct observations. The diagnostic's selective appearance across units tells Kwame exactly where the problem lives: in his relay chain, not his sensing.

He opens the "What If" toggle on the command agent. Threshold 0.30 — the counterfactual. The command agent's buffer fills with compressed relay intelligence starting at tick 10. At tick 15, it would have issued a repositioning command to STRIKER-3, redirecting it to cover the gap in the western flank. At tick 22, it would have flagged the flanking maneuver two ticks before contact.

Kwame sees the entire mission unravel differently in the counterfactual. Not perfectly — a threshold of 0.30 admits some degraded signals that would have produced imprecise actions. But the command agent would have been *thinking* instead of *deaf*.

**Minute 7:00 — The Strategic Response**

Kwame doesn't simply lower his thresholds. He recognizes the suppression field as an enemy tool that changes the fidelity landscape dynamically. Static thresholds — even well-calibrated ones — can be invalidated by environmental changes.

He opens the adaptive fidelity threshold panel (5.14d). He hadn't used it before because his static thresholds were working. Now he configures the command agent with: base threshold 0.30, pressure sensitivity 0.40, exponential curve. When the buffer is empty (deaf from suppression), the threshold stays low at 0.30 — accept anything usable. When the buffer fills (normal conditions or overload), the threshold rises to 0.70 — be selective. The immune system model, designed precisely for environments that shift between feast and famine.

He replays Mission 14. Score: 83/100. The command agent's adaptive threshold drops to 0.32 when the suppression field activates at tick 9, accepting the degraded-but-still-useful relay intelligence. The flanking maneuver is detected. The repositioning command fires. The strikers cover the gap.

**UI Annotations:**
- The suppression field's visual in the Inspector: a translucent reddish overlay (#c24a3e at 8% opacity) that pulses gently at 0.5Hz; scrubbing past tick 9 shows it fading in over 2 ticks; clicking the overlay shows a tooltip: "Enemy suppression field active — all transmitted signals degraded by 15 fidelity points"
- Multiple overcautious diagnostics across units: when 3+ units are flagged, the Inspector's summary bar (at the top, next to mission score) shows a small amber diamond with a count: "3 units overcautious"; clicking the diamond cycles through the flagged units
- The adaptive threshold panel is accessible from the overcautious diagnostic card via a subtle link: "Adaptive thresholds may address this pattern" in small amber text below the suggested threshold; this is the diagnostic teaching the player about the adaptive system's existence without forcing a tutorial

---

## Strengths

**Teaches through evidence, not prescription.** The diagnostic shows what happened — 47 rejected, 3 noise, 44 usable — and lets the player draw the conclusion. This is the "show, don't tell" principle applied to calibration feedback. Players who reach the insight themselves retain it longer than players who are told "your threshold is too high." The game respects the player's intelligence by providing the data and trusting them with the interpretation.

**Quantifies the invisible.** Without the diagnostic, the cost of an overcautious threshold is invisible. The unit doesn't crash. It doesn't error. It just... doesn't act. The diagnostic makes the invisible visible by counting what was lost. "You operated on 25% of available intelligence" transforms a vague feeling ("my unit seemed passive") into a specific, actionable measurement.

**Creates the complete calibration arc.** The Fog Mission (5.14a) teaches "too low is death." The overcautious diagnostic teaches "too high is blindness." Together, they form the complete lesson: the threshold is a dial with failure modes on both ends. The player must find the middle ground. This two-sided lesson is rare in games — most mechanics have a single failure mode. The fidelity threshold has two, and the game has a dedicated teaching tool for each.

**Scales with complexity.** For early-game players with simple architectures and one threshold slider, the diagnostic is a simple message: "you rejected too much." For late-game players with per-channel thresholds, adaptive curves, and enemy spoofing, the same diagnostic framework reveals which channels are overcautious and which are correctly calibrated. The diagnostic grows with the player.

**Connects to real-world signal theory.** The false-positive/false-negative tradeoff is one of the most fundamental concepts in statistics, security, and machine learning. Players who internalize "setting the bar too high means you miss real signals" carry this insight into spam filters, medical screening, security alerts, and anomaly detection. The game teaches Bayesian intuition through play.

---

## Weaknesses

**Hindsight bias.** The diagnostic evaluates the threshold against this specific mission's signal distribution. A threshold of 0.85 that was overcautious in Mission 7 (where only 3 of 63 signals were noise) might be perfectly calibrated in Mission 12 (where 40 of 63 are enemy spoofed signals). The player might learn "0.45 is the right number" from one mission and carry it into a mission where 0.45 admits a flood of poisoned signals. The diagnostic must be understood as mission-specific feedback, not universal guidance — and the game has no mechanism to enforce that understanding.

**The "suggested threshold" can be misread as a recommendation.** The line "A threshold of 0.45 would have accepted 58 of 63" looks like the game is telling the player what to set. Some players will treat this as a prescribed value rather than a counterfactual illustration. The risk: players adopt the suggested value without understanding that it is specific to this mission's signal distribution, then encounter a different distribution and blame the game's suggestion.

**Requires enough signal traffic to be meaningful.** On missions with few signals (simple maps, few enemies, short duration), the diagnostic may not fire even if the threshold is poorly calibrated. The minimum of 10 rejected signals means sparse missions produce no feedback. The player can carry an overcautious threshold through several low-traffic missions without learning about it, then get hit hard on a high-traffic mission.

**Can conflict with enemy spoofing lessons (5.14e).** The late campaign teaches players that low thresholds admit spoofed signals. The overcautious diagnostic teaches that high thresholds reject useful signals. These lessons pull in opposite directions. A player who just learned (from a spoofing mission) to raise thresholds may receive an overcautious diagnostic on the next mission and feel whiplashed. The calibration lesson requires holding both ideas simultaneously — which is the point, but is genuinely hard for some players.

**No positive feedback for good calibration.** The diagnostic only appears when the threshold is too high. There is no "well-calibrated" badge or green confirmation. The player learns that the diagnostic's absence means "no problem" — but absence of feedback is a weaker signal than presence of feedback. Some players may never feel confident that their threshold is correct, only that it isn't flagged as wrong.

---

## Interaction Effects

**With 5.14a (Fidelity threshold onboarding gate):** The overcautious diagnostic is the second act of the fidelity threshold teaching arc. 5.14a introduces the concept through failure (no threshold = death). 5.14f refines the concept through overcorrection feedback (too high = blindness). The two aspects form a call-and-response across 1-2 missions that teaches the full calibration spectrum.

**With 5.14d (Adaptive fidelity threshold):** The overcautious diagnostic is the primary motivation for players to adopt adaptive thresholds. A player who sees "your unit operated on 9% of available intelligence" in a suppression-field mission will seek a solution that adapts to environmental conditions. The diagnostic creates the problem; the adaptive threshold is the tool. The diagnostic card's subtle link to the adaptive panel completes the loop.

**With 5.14e (Enemy fidelity spoofing):** The overcautious diagnostic and fidelity spoofing create a calibration tension. Spoofing missions push thresholds up; overcautious diagnostics push thresholds down. The player must learn to calibrate per-mission, per-channel, and eventually per-situation (adaptive). This tension is the game's core information-warfare lesson: there is no permanently correct threshold.

**With 4.04 (Debrief screen) and 4.04b (Two-act structure):** The diagnostic lives in Act 2 (Inspector), after the emotional experience of Act 1 (sealed watch). The player has already felt their units being passive and unresponsive during sealed watch. The diagnostic provides the causal explanation in the analytical phase. The emotional setup makes the diagnostic's numbers land harder — the player already knows something was wrong, and now they know exactly what.

**With 8.09 (Diagnostic teaching layer):** The overcautious diagnostic is one entry in a larger system of Inspector-phase teaching tools. It follows the diagnostic layer's design principles: contextual (appears only when relevant), quantified (shows numbers, not judgments), actionable (suggests a counterfactual), and progressive (grows in sophistication as the player encounters per-channel thresholds and adaptive systems).

**With 2.11 (Signal fidelity degradation):** The diagnostic makes the fidelity degradation system's consequences legible. A player who sets threshold 0.85 on a unit receiving two-hop signals will always be overcautious, because two-hop signals max out at fidelity 60-70. The diagnostic teaches the player that their threshold must account for their network's depth — a deeper network requires a lower threshold. This insight connects threshold calibration to architectural design.

---

## Comparable Games and Media

**Spam filter calibration (Gmail, Fastmail):** Every email user has experienced the overcautious spam filter — important messages buried in the spam folder because the filter's threshold was too aggressive. The "Check your spam folder" ritual is the real-world overcautious diagnostic. Gmail's approach to this — showing a count of messages in spam and letting users mark false positives to recalibrate — is the direct analog of the overcautious diagnostic's "you rejected 44 usable signals" feedback.

**Into the Breach's preview system:** Into the Breach shows you exactly what the enemy will do next turn, making every decision fully informed. The overcautious diagnostic achieves a similar transparency but post-hoc: it shows you what you *could* have known, after the fact. Both games trust players with full information rather than hiding it behind fog.

**Medical screening false-positive rates:** Cancer screening tests face the same calibration dilemma: set the sensitivity too low and you miss real cancers (false negatives); set it too high and healthy patients get unnecessary biopsies (false positives). The overcautious diagnostic is the game's equivalent of a screening test's specificity report — "of the signals you flagged as noise, how many were actually clean?" Medical professionals calibrate based on these reports. Players calibrate based on the diagnostic card.

**Chess clock management:** In speed chess, a player who spends too much time on early moves (overcautious positional analysis) runs out of time in the endgame. The clock is the diagnostic: it shows the cost of overcaution in real time. Robot Uprising's diagnostic shows the cost after the mission, but the structural lesson is the same — being too careful has a measurable price.

**Factorio's bottleneck visualization:** Factorio doesn't tell you where your factory is slow. But when you turn on the bottleneck mod, red indicators appear on machines that are starving for inputs. The overcautious diagnostic serves the same role: it identifies units that are "starving" for information because their quality filter is set too high. The red indicators in Factorio and the amber diagnostic border in Robot Uprising both make invisible bottlenecks visible.

**Signal detection theory (psychology):** The academic framework for the overcautious diagnostic is signal detection theory (SDT) — specifically, the concept of criterion placement. A conservative criterion (high threshold) minimizes false alarms but maximizes misses. A liberal criterion (low threshold) catches everything but admits noise. The overcautious diagnostic teaches SDT through play: the rejection-to-noise ratio IS the player's empirical criterion evaluation, expressed in game terms rather than d-prime and beta values.

---

## Sensory Description

### The Diagnostic Card's Arrival

The player clicks an overcautious-flagged unit in the Inspector. The standard panels expand — context window, decision trace, event log — in their usual 200ms accordion with the quiet paper-unfolding sound. Then, 400ms after the last panel settles, a new card slides into view from the bottom of the panel stack. It doesn't accordion-expand like the others. It *materializes* — starting as a thin amber line that widens over 300ms into a full card. The amber dashed border draws itself clockwise from the top-left corner, like a pen tracing the edge of a document. A faint crystalline tone accompanies the draw — two notes, ascending, minor key, soft. The sound says: *here is something you should see.*

The card's background is slightly warmer than the standard panel backgrounds — not white-on-dark-navy like the cyan panels, but a barely perceptible amber tint (#0d0f1c vs. the standard #0a0e1a). The difference is subliminal. The player doesn't consciously see the warmth, but the card *feels* different from the analytical panels. It feels like a note left by someone who noticed something.

### The Numbers

The rejection ratio bar renders in two segments: a solid teal bar (accepted signals) and a hollow bar (rejected signals). The hollow bar is just an outline — the empty space inside it is the visual metaphor for what was lost. Below it, the breakdown of rejected signals uses two textures: the "genuine noise" segment is a dense crosshatch pattern (like static on a dead TV channel), and the "usable intelligence" segment is a clean solid fill in a warm amber. The visual reads immediately: the solid amber dwarfs the crosshatch. Most of what was thrown away was good.

The "operated on X% of available intelligence" line renders in slightly larger type than the surrounding text — 14px vs. 12px — and in a weight that's heavier without being bold. It's the emotional center of the card. The percentage itself is colored: below 33% renders in a muted red (#c24a3e at 80% opacity), 33-66% in amber (#d4a03c), above 66% in teal (#3eb5a5). For Dante's 25%, the red is unmistakable.

### The Rejected Signal Timeline

The timeline strip sits below the card, separated by 8px of dark space. It is quiet — 24px tall, no labels, no axis. Just pips. The pips are small circles, 4px diameter, spaced 2px apart. Red pips (#c24a3e) glow faintly, as if warm. Teal pips (#3eb5a5) are cool and steady. Amber pips (#d4a03c) pulse subtly at 0.3Hz — slow enough to feel organic, like a breathing indicator. The pulse says: *these were alive. These were real signals. They were discarded.*

Hovering over a pip causes it to expand from 4px to 8px over 100ms, and a floating micro-card appears above it: the signal's fidelity value, source channel, and a one-line summary of its content. The micro-card is positioned above the pip, tethered by a thin 1px line. It appears with a 100ms fade-in and a quiet "click" sound — the same sound as opening a dossier in the Crime Scene debrief paradigm. The player is investigating discarded evidence.

### The "What If" Toggle

The toggle sits at the bottom-left of the diagnostic card — a pill shape, 80px wide, 24px tall. Untoggled: dark background, thin amber outline, text reads "WHAT IF 0.45" in amber. The suggested threshold value is the only number on the toggle, making it specific rather than abstract.

Toggling it on: the pill fills with a teal wash over 200ms. The text inverts to dark-on-teal. Simultaneously, the rejected signal timeline undergoes a transformation — the teal and amber pips brighten, expand from 4px to 6px, and their outlines thicken from 0px to 1px. They become solid, present, *accepted*. The red pips dim and shrink from 4px to 3px — still visible, still rejected. The transition takes 400ms and feels like a door opening: the timeline goes from sparse and hollow to rich and full. The counterfactual context window fades in alongside with a 300ms ease-in.

The sound for the toggle: a soft ascending chord — three notes, teal-coded (the same timbre used for teal UI elements throughout the game), spaced 80ms apart. The chord resolves upward, suggesting possibility. The un-toggle plays the same chord in reverse, descending, as the counterfactual fades and the pips return to their rejected state.

### The Absence

On a well-calibrated unit — one whose threshold admits usable signals and rejects noise without excessive waste — the diagnostic card does not appear. The panel stack shows context window, decision trace, event log. No amber border. No materialization sound. No numbers.

This silence is the positive feedback. The player who adjusts their threshold and replays the mission will notice the card's absence. The inspection panel is shorter. The bottom edge of the panel stack has more dark space. The amber dashed border is gone. The unit's panels are all cyan. The feeling is clean — clinical, professional, correct. No notes left by the someone-who-noticed-something. Nothing to notice.

---

## The TikTok Clip

**Setup (0:00-0:03):** Split screen. Left: the Plan phase. The player's cursor drags a fidelity threshold slider to 0.90. The slider snaps into place with a satisfying click. Text overlay in bold: "MAXIMUM FILTER. NOTHING GETS THROUGH." The player hits EXECUTE with confidence.

**The Watch (0:03-0:08):** Sealed watch. Signal lines fire from scouts to relays. Green delivery flashes on relay tiles — signals arriving. But the relay buffer bars don't move. Flash after flash, nothing sticks. Signal lines fire from relays toward strikers — nothing. The strikers stand still, buffer bars empty, while enemies advance across the grid. An enemy striker walks directly past a player striker. No reaction. The player striker stands there like a statue. Kill. Another kill. The mission score appears: 54/100.

**The Inspector (0:08-0:15):** Cut to the Inspector. The player clicks the relay. The diagnostic card materializes — amber border drawing itself, crystalline ascending tone. The camera zooms into the card. The numbers fill in:

```
Rejected: 81
Genuine noise: 7
Usable intelligence: 74
```

The "9% of available intelligence" line renders in red. The rejected signal timeline expands below — a wall of teal and amber pips, seven red specks lost in the crowd.

**The Reveal (0:15-0:20):** The player clicks the "WHAT IF 0.30" toggle. The timeline transforms — pips solidifying, filling in, the hollow becoming full. The counterfactual context window shows a rich, detailed buffer. The camera pulls back to reveal the player's face (or avatar) with the expression of someone who just realized they locked themselves in a soundproof room and wondered why it was so quiet.

**Text overlay (0:18-0:20):** "I set the filter to keep out noise. I kept out everything."

**Audio:** The sealed watch section plays with the game's ambient synth — tense, pulsing. When the diagnostic card appears, the synth drops to silence, leaving only the crystalline two-note tone. When the "What If" toggle activates, a single warm pad chord fades in — the sound of information flowing. The emotional arc in 20 seconds: confidence, confusion, silence, understanding.

---

## Discovered Aspects

1. **5.14g — The "information-starved" sealed watch visualization**: during the sealed watch, units with near-empty buffers (because of overcautious thresholds) could display a subtle visual state — a dimmer sprite, a flickering outline, a desaturated tile — that gives the player an emotional preview of the problem before they reach the Inspector. The sealed watch doesn't explain why, but it shows the symptom. The diagnostic explains the cause.

2. **5.14h — Threshold calibration history as career metric**: tracking the player's average threshold settings and overcautious diagnostic frequency over their career. A chart showing "missions where overcautious fired" vs. "missions where context overload occurred" traces the player's calibration journey — from one extreme to the other to (eventually) the middle. The chart as a portrait of learning.

3. **5.14i — Per-channel overcautious diagnostics**: when per-channel thresholds are unlocked (5.14b), the overcautious diagnostic shows per-channel breakdowns — "threat-net: 2 rejected, 0 noise; scout-net: 31 rejected, 3 noise; command-net: 8 rejected, 0 noise." This teaches the player which channels carry more usable intelligence at lower fidelity and which can tolerate higher thresholds.

4. **5.14j — Comparative diagnostic: overcautious vs. overload in the same mission**: a combined view showing units that were overcautious alongside units that were overloaded with noise, on the same mission, in the same architecture. This highlights the calibration spectrum within a single deployment — some units filtering too aggressively, others not aggressively enough — and teaches that threshold calibration is per-unit, not global.
