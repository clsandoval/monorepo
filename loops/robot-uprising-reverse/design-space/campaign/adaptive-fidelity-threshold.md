# 5.14d — Adaptive Fidelity Threshold (The Immune System Model)

**Aspect:** 5.14d — Adaptive fidelity threshold: auto-adjusting threshold that responds to buffer pressure; the pressure curve, two-parameter configuration, sealed watch visualization of threshold shifting in real-time
**Wave:** 5 (Onboarding & Campaign)
**Category:** Campaign / Autonomic Systems
**Parent:** 5.14a — Fidelity threshold as onboarding gate (global threshold slider)
**Related:** 5.14b (per-channel fidelity thresholds), 5.14c (fidelity as rule condition), 2.01 (fixed-slot buffer), 2.11 (signal fidelity degradation), 5.14e (enemy fidelity spoofing), 4.03 (buffer visualization), 5.04 (complexity ramp)

---

## The Core Problem

The fidelity threshold — whether global (5.14a) or per-channel (5.14b) — is a static value. The player sets it during the Plan phase, hits EXECUTE, and that number holds for the entire mission. A Relay configured with threshold 0.5 rejects signals below 0.5 on tick 1 when its buffer is empty and on tick 47 when its buffer is about to overload. The threshold has no memory, no awareness of what is happening inside the unit it protects. It is an immune system that cannot tell the difference between peacetime and pandemic.

This creates a class of failures that the player can diagnose in the Inspector but cannot prevent with static configuration. The pattern: a unit operates well for 20 ticks with threshold 0.5, accepting useful signals and maintaining healthy buffer levels. Then the battle shifts. Three enemy units converge on its perception radius. A relay chain begins flooding compressed intelligence. The unit's buffer fills from 4/12 to 11/12 in three ticks. At 12/12, context overload triggers a one-tick stun. The player scrubs back through the replay and sees the problem: between tick 20 and tick 23, the unit accepted six signals at fidelity 0.52-0.58 that were marginally above threshold but not worth the buffer slots they consumed. If the threshold had been 0.7 during those three critical ticks, the unit would have rejected the marginal signals and avoided the stun. But if the threshold had been 0.7 the entire mission, the unit would have starved for data during the quiet first 20 ticks.

The player wants to say: "Be permissive when you have room. Be selective when you are full." This is not a static number. It is a policy. It is the difference between a fixed gate and a living membrane.

---

## The Mechanical Specification

### The Adaptive Threshold Function

When adaptive mode is enabled on a blueprint, the fidelity threshold is no longer a constant. It is computed each tick as a function of buffer pressure:

```
effective_threshold = base_threshold + (pressure_sensitivity * pressure_curve(buffer_fill_ratio))
```

Where:

- **`base_threshold`** (parameter 1): the floor — the minimum fidelity the unit ever accepts, even when the buffer is completely empty. Range: 0.0 to 1.0. This is the "how permissive can I get?" knob. A base of 0.0 means the unit will accept dead signals when it has room. A base of 0.3 means even an empty buffer still rejects garbage.

- **`pressure_sensitivity`** (parameter 2): the ceiling delta — how much the threshold can rise above the base when buffer pressure is at maximum. Range: 0.0 to 0.7. This is the "how aggressive is the immune response?" knob. A sensitivity of 0.5 means the threshold can rise 0.5 above base at maximum pressure, so a base-0.3 unit at full buffer demands fidelity 0.8. A sensitivity of 0.0 disables adaptation entirely — the threshold is flat at the base value, equivalent to the static slider.

- **`buffer_fill_ratio`**: `occupied_slots / total_slots`, a value from 0.0 (empty) to 1.0 (full). This is not player-configured; it is read from the unit's live state each tick.

- **`pressure_curve(x)`**: a function mapping fill ratio to pressure response. The player selects one of three curve shapes:

### The Three Pressure Curves

**Linear** — `pressure_curve(x) = x`. The threshold rises proportionally with buffer fill. At 50% full, the threshold is at 50% of its maximum increase. Predictable, even, no surprises. The default.

```
Threshold
1.0 ─────────────────────── /
                           /
0.7 ─────────────────── /    ← base 0.3, sensitivity 0.5, at 80% fill
                       /
0.5 ──────────────── /
                   /
0.3 ── base ────/
    0%   25%   50%   75%  100%  Buffer Fill
```

**Exponential** — `pressure_curve(x) = x^2`. The threshold stays low for most of the buffer range, then rises sharply as the buffer approaches capacity. The unit is permissive through 70% fill, then becomes aggressively selective in the final 30%. This is the TCP slow-start model: operate freely until congestion is imminent, then slam the brakes.

```
Threshold
1.0 ────────────────────────── |
                               |
0.7 ───────────────────────  /
                            /
0.5 ──────────────────── ·
                       ·
0.3 ── base ──────·
    0%   25%   50%   75%  100%  Buffer Fill
```

**Step** — `pressure_curve(x) = 0 if x < 0.75, else 1`. The threshold is flat at the base value until buffer fill crosses 75%, at which point it jumps to maximum. Binary: calm or alert, nothing in between. The circuit breaker model: the system operates normally until a threshold is crossed, then trips into a protective state.

```
Threshold
1.0 ──────────────────────┐
                          │
0.8 ──────────────────────│── ← base 0.3, sensitivity 0.5
                          │
0.3 ── base ──────────────┘
    0%   25%   50%   75%  100%  Buffer Fill
```

Each curve creates a different personality for the unit. Linear units are steady, measured, gradually more selective. Exponential units are relaxed until sudden urgency. Step units are permissive-then-lockdown, with nothing in between. The curve choice is a character decision, not just an optimization — it determines how the unit *behaves* under stress, which the player observes during sealed watch and comes to recognize as a behavioral signature.

### Clamping and Edge Cases

- The effective threshold is clamped to [0.0, 1.0]. A base of 0.5 with sensitivity 0.7 at 100% fill computes to 1.2, clamped to 1.0 — the unit rejects everything.
- When the buffer is at 0/N (completely empty), `buffer_fill_ratio = 0.0`, and all three curves output 0.0. The effective threshold equals the base threshold exactly.
- Context overload stun (buffer full + overflow) resets the buffer to ~60% capacity after the stun tick (auto-eviction clears the oldest 40%). The adaptive threshold immediately recalculates — dropping from its maximum back toward the base. The unit "recovers" from its immune overreaction.
- Signals generated by the unit's own perception system bypass the fidelity threshold entirely (self-perceived observations are always fidelity 100). Adaptation only filters incoming hook messages.

---

## The Sealed Watch Visualization: The Moving Line

During sealed watch, the adaptive threshold manifests as a **moving horizontal line** on the buffer bar (the pip row from 4.03, Paradigm 2).

### What the Player Sees

The buffer bar shows N pips in a horizontal row. Above the pips, a thin line spans the bar's width, positioned vertically to represent the current effective threshold. The line's vertical position maps the threshold value: low on the bar = permissive (close to 0.0), high on the bar = strict (close to 1.0). Each pip's vertical glow intensity corresponds to the signal's fidelity — a pip at fidelity 0.8 glows high on the bar, a pip at fidelity 0.3 glows low. The threshold line divides the space: pips glowing above the line were accepted; any signal arriving below the line would be rejected.

### The Color Temperature Shift

The threshold line changes color as it rises:

- **Cool blue (#00d4ff)** when near the base threshold — the immune system is calm, accepting broadly.
- **Warm amber (#ffa500)** as it rises through the mid-range — the system is tightening, becoming more discerning.
- **Hot red (#ff3333)** when near maximum — the system is in full defensive lockdown, rejecting almost everything.

The color temperature shift is continuous, not stepped. The line gradually warms as buffer pressure builds. On a board with six units, the player can scan all buffer bars at once and immediately parse which units are "cool" (permissive, relaxed) and which are "hot" (pressured, rejecting). This mirrors the ICU-scanning requirement from 4.03: peripheral vision catches color temperature faster than it reads numbers.

### The Breathing Animation

When the adaptive threshold is active, the line has a subtle vertical oscillation — a 1-pixel "breathing" at approximately 1Hz. This distinguishes it from a static threshold (which would be a fixed, still line). The breathing says: "I am alive. I am responding." When the threshold rises under pressure, the breathing quickens slightly (1.5Hz at >80% fill), conveying urgency without being distracting. When the buffer drains and the threshold drops, the breathing slows back to its resting rate.

### The Rejection Flash

When an incoming signal is rejected by the adaptive threshold, the threshold line briefly brightens at the position where the signal attempted entry — a white flash that travels along the line from right to left over 100ms, like a ripple on a membrane. The rejected signal appears as a ghost pip below the line, dimming rapidly over 200ms. The player sees: "Something tried to get in and was turned away." In the Inspector, this ghost pip is scrubable and shows the full signal metadata — source, channel, fidelity score, and the effective threshold at the moment of rejection.

---

## Player Journeys

#### Journey: Yuki, 24, Biomedical Engineering Student

**Background:** Yuki studies immunology. She found Robot Uprising through a friend's Twitch stream and was hooked by the "design a brain" premise. She reached Mission 9 using static thresholds and per-channel overrides, but her architectures consistently stun under sudden signal bursts. She understands the buffer pressure problem intellectually but finds the static threshold too rigid. She has never worked in networking or cloud infrastructure.

**Minute 0:00 — The Pressure Spike**
Yuki attempts Mission 9 (Arms Race) with her standard architecture: two Scouts, three Relays in a diamond formation, two Strikers, one Command. Static threshold 0.45 globally, with per-channel overrides on `cmd-net` (0.8) and `recon-net` (0.25). She hits EXECUTE. For twenty ticks, her formation performs well. The Scouts feed recon through the relay diamond. Buffer fill on the central Relay hovers around 6/12. Then the enemy factory spawns a wave of four units. All three relay chains light up simultaneously. The central Relay hits 12/12 in two ticks. Context overload. Stun. The formation loses coordination for one tick. An enemy Striker slips through the gap and kills her eastern Scout.

**Minute 2:30 — Discovering Adaptive Mode**
Yuki opens the blueprint editor for the central Relay. In the Context Config strip, below the fidelity slider, she notices a new toggle: `Adaptive [off]`. The boot log reads: `[SUBSYSTEM UPGRADE] Dynamic threshold adjustment: AVAILABLE. Threshold auto-adjusts based on buffer pressure.` She clicks it. The single fidelity slider splits into two smaller sliders side by side — **Base: 0.25** and **Sensitivity: 0.40** — and below them, three curve icons: a diagonal line (linear), a swooping curve (exponential), and a staircase (step). Yuki hovers over each. The tooltip for exponential reads: "Threshold stays low until buffer nears capacity, then rises sharply." She thinks: "That is exactly how the complement system works — slow activation, rapid escalation." She selects exponential.

**Minute 4:00 — The Immune System Works**
She re-executes. Same architecture, same enemy wave. For twenty ticks, the central Relay's threshold line sits low and blue on the buffer bar — base 0.25, buffer barely half full. The breathing animation is slow, calm. Then the enemy wave arrives. Buffer fill jumps from 6/12 to 9/12 in one tick. The threshold line begins climbing — the exponential curve keeps it low through 75% but now at 9/12 it is rising fast. The line color shifts from blue to amber. At 10/12, the effective threshold is 0.52. A recon signal at fidelity 0.48 hits the membrane — the threshold line flashes white at the contact point, and a ghost pip appears below the line, fading out. Rejected. At 11/12, the threshold hits 0.61. Two more marginal signals bounce off. The buffer stabilizes at 11/12. No stun. The enemy wave passes, buffer drains to 7/12 over three ticks, and the threshold line sinks back to blue, breathing slowly. Yuki watches the line settle and says, quietly: "Homeostasis."

**Minute 6:30 — The Autoimmune Response**
But something is wrong on the eastern flank. The eastern Relay, also set to adaptive exponential with the same parameters, had its buffer spike during the enemy wave. Its threshold rose to 0.65. During that spike, the distant eastern Scout sent a critical recon observation at fidelity 0.42 — degraded from three hops but carrying the position of a flanking enemy Striker. The adaptive threshold rejected it. The eastern Striker never received the warning. The flanking enemy killed the Scout exactly as before. Yuki scrubs the Inspector to the moment of rejection and sees it: the threshold line was hot red, the recon signal arrived as a ghost pip below it, and the signal metadata reads `fidelity: 0.42, effective_threshold: 0.65, REJECTED`. The immune system attacked its own intelligence. Autoimmune failure.

**Minute 8:00 — The Fix**
Yuki realizes the eastern Relay needs a different adaptive profile. Its recon channel carries legitimately degraded signals from distant Scouts — fidelity 0.35-0.50 is normal for three-hop intelligence. She combines adaptive threshold with per-channel override (5.14b): the `recon-net` channel gets a per-channel base of 0.15 with sensitivity 0.20, so even under maximum pressure it never exceeds 0.35. The `cmd-net` channel keeps the global adaptive profile. She re-executes. The eastern Relay now accepts degraded recon even under pressure — its recon threshold line barely rises — while still tightening on commands. The flanking enemy is detected. The mission clears.

**UI Annotations:**
- Adaptive toggle discovered via boot log prompt, not exploration
- Exponential curve selected based on immunology intuition — the metaphor worked exactly as intended
- Autoimmune failure identified in Inspector via ghost pip + threshold line position
- Fix required combining adaptive threshold (5.14d) with per-channel override (5.14b) — the two systems compose
- Threshold line color temperature scanned across all units during sealed watch — "which units are running hot?"

---

#### Journey: Davi, 35, Site Reliability Engineer

**Background:** Davi manages auto-scaling infrastructure at a fintech company. He has configured TCP congestion windows, written circuit breaker policies, and debugged cascading failures in microservice meshes. He reached Mission 9 on his third evening and immediately recognized the adaptive threshold as a congestion control mechanism. He wants to push it to its limits.

**Minute 0:00 — TCP Mental Model**
Davi reads the adaptive threshold documentation and maps it instantly: base threshold = TCP's initial window, sensitivity = the scaling factor, linear curve = additive increase, exponential curve = multiplicative decrease (AIMD in reverse). He sets up an experiment: two identical Relays, one with linear adaptation and one with exponential, same base (0.2) and sensitivity (0.5). He wants to observe the behavioral difference during identical load.

**Minute 2:00 — The Congestion Comparison**
During sealed watch, the linear Relay's threshold line rises steadily as buffer fills — a smooth diagonal ascent from cool blue to warm amber. It rejects signals gradually, spreading the rejection evenly across the pressure curve. The exponential Relay's line stays low and blue through 70% fill, then rockets upward — blue to amber to red in two ticks as the buffer hits 85%. The linear Relay rejected 4 signals across 10 ticks. The exponential Relay rejected 0 signals for 8 ticks, then rejected 6 signals in 2 ticks. Same total rejections, completely different temporal distribution.

**Minute 4:00 — Oscillation Discovery**
Davi notices something he was looking for: the exponential Relay is oscillating. Its aggressive late-stage rejection causes the buffer to drain rapidly (signals rejected = fewer entries = fill drops). When the fill drops below 75%, the exponential curve's output plummets — the threshold falls back toward base. Low threshold means incoming signals are accepted again. Buffer refills. Threshold spikes. Buffer drains. Threshold drops. The Relay is sawtoothing: 3 ticks of accepting everything, 1 tick of rejecting everything, repeat. The threshold line on the buffer bar jitters up and down, the color flickering between blue and red. Davi recognizes this immediately: TCP congestion window oscillation. The exponential curve with high sensitivity is unstable.

**Minute 5:30 — Damping the Oscillation**
Davi lowers the exponential Relay's sensitivity from 0.5 to 0.25. The maximum threshold swing is now smaller — the immune response is less violent. The oscillation dampens. The threshold line still rises under pressure, but it does not spike high enough to drain the buffer completely, so the refill-reject cycle stabilizes into a gentle undulation rather than a sawtooth. The Relay now maintains steady-state buffer fill around 75-80%, accepting some signals and rejecting others each tick. Davi notes: "The sensitivity parameter is the damping coefficient. Too high and you oscillate. Too low and you do not respond fast enough." He settles on sensitivity 0.3 for exponential curves — his personal heuristic for this curve shape.

**Minute 7:00 — The Step Function as Circuit Breaker**
Davi tests the step curve: base 0.2, sensitivity 0.5, step at 75%. Below 75% fill, the threshold is flat at 0.2 — the Relay accepts anything with a pulse. Above 75%, it jumps to 0.7 — rejecting all degraded signals. No oscillation, because the step function has hysteresis: once tripped, the buffer must drain below 75% to reset, and the sudden high threshold ensures rapid draining. The threshold line on the buffer bar sits low and blue, then snaps upward to red, holds for 2-3 ticks while the buffer clears, then snaps back down. Clean, binary, decisive. Davi labels this blueprint "circuit-breaker-relay" and uses it for his rear-echelon nodes where stability matters more than throughput.

**UI Annotations:**
- Both parameters (base, sensitivity) adjusted through systematic experimentation, not guessing
- Oscillation pattern discovered through observation of sealed watch buffer bars — the jittering line was the tell
- Step function used as deliberate circuit breaker — the metaphor maps exactly
- Linear curve dismissed as "too even, does not match any real congestion control pattern I know"
- Blueprint naming reflects the infrastructure mental model the player imported

---

#### Journey: Lena, 52, Retired Schoolteacher, Casual Puzzler

**Background:** Lena plays puzzle games on her tablet before bed — Picross, Sudoku, occasionally Into the Breach. She found Robot Uprising charming and has been playing slowly over three weeks. She uses the global threshold slider (set to 0.4 on everything) and has never opened Advanced mode. She does not know what a buffer overflow is. She reached Mission 9 and is getting stunned every attempt.

**Minute 0:00 — The Repeated Stun**
Lena has attempted Mission 9 four times. Each time, her central Relay stuns during the enemy wave. She understands why — the Inspector shows "CONTEXT OVERLOAD" — but she does not know how to prevent it. She has tried lowering the threshold (more stuns, more junk signals). She has tried raising the threshold (fewer stuns, but her Scouts' data gets rejected and the Strikers cannot see enemies). She is considering giving up on this mission.

**Minute 1:30 — The Suggestion**
On her fifth attempt, the boot log includes a new line she has not seen before: `[ADVISORY] Unit RELAY-C has context-overloaded 4 times in recent missions. Consider enabling adaptive threshold mode to auto-manage buffer pressure. Toggle: Context Config → Adaptive.` The game is nudging her — not forcing, not tutorializing, but noticing her repeated failure pattern and surfacing the tool that addresses it.

**Minute 2:00 — The Toggle**
Lena opens RELAY-C's blueprint editor. She finds the Adaptive toggle. She turns it on. She sees two new sliders — Base and Sensitivity — and three curve icons. She does not understand the curves. She leaves them on the default (linear). She sets Base to 0.3 (slightly lower than her old static 0.4, because the tooltip says "minimum quality when buffer is empty") and Sensitivity to 0.4 (the default). She does not know what these numbers will do. She hits EXECUTE.

**Minute 4:00 — It Just Works**
The mission plays differently. Her central Relay's buffer bar has a thin line above the pips that she has not seen before. The line is blue. She watches. During the quiet phase, the line sits low — the Relay accepts signals as before. When the enemy wave arrives and the buffer fills, the line rises. Its color shifts to amber. She notices pips appearing briefly below the line and fading — rejected signals. The buffer stabilizes at 10/12. No stun. Lena does not fully understand the mechanism, but she watches the line and understands its story: "When the bar is full, the line goes up and keeps things out." The metaphor does not require immunology or TCP knowledge. It is a bouncer at a nightclub: when the room is crowded, the door policy tightens.

**Minute 5:30 — The Partial Cost**
Her eastern Scout reports an enemy flanking, but the recon signal is degraded (fidelity 0.41). The central Relay's threshold was 0.55 at that moment due to buffer pressure. The recon was rejected. Lena sees this in the debrief: a red X next to a signal she needed. She does not diagnose it as autoimmune failure. She thinks: "The automatic thing blocked something I wanted." She considers turning adaptive off. Instead, she lowers Sensitivity from 0.4 to 0.2 — making the threshold rise less aggressively. On the next attempt, the weaker adaptation lets the recon through at the cost of slightly more buffer pressure. The Relay hits 11/12 but does not stun. The flanking enemy is detected. Mission clears.

**Minute 7:00 — The Understanding**
Lena does not understand pressure curves or buffer fill ratios. She understands: "The low slider is the minimum pickiness. The high slider is how much pickier it gets when busy. I set the high slider lower so it does not get too picky." This is a complete and correct mental model for her level of engagement. The system served her without requiring systems engineering vocabulary.

**UI Annotations:**
- Adaptive mode discovered through game-initiated advisory, not self-directed exploration
- Curve selection ignored — default linear used, never examined
- Both parameters adjusted through single intuitive iteration (lower sensitivity = less aggressive)
- Threshold line understood as "bouncer at a door" — no technical metaphor required
- Autoimmune failure experienced but not named — understood as "the auto thing blocked something good"

---

## Strengths

1. **Automatic resilience.** Adaptive thresholds solve the "static config in a dynamic world" problem that causes the most common mid-game failure — context overload during signal spikes. The unit manages its own buffer pressure without requiring the player to predict exact load patterns during the Plan phase.

2. **Two-parameter elegance.** Base and sensitivity are a minimal, orthogonal parameter space. Base controls the floor (permissiveness when relaxed). Sensitivity controls the ceiling delta (aggressiveness when stressed). Together they define a behavioral envelope. The player does not need to understand the math — "pickiness floor" and "pickiness range" are intuitive framings.

3. **Curve shapes as personality.** Linear, exponential, and step are not just math — they are behavioral archetypes. The linear unit is steady and measured. The exponential unit is relaxed-then-panicked. The step unit is calm-then-lockdown. Players will develop preferences and associate curves with roles: "my front-line Relays use exponential because they need to stay open until the last moment; my rear-echelon Relays use step because they need stability."

4. **Sealed watch drama.** The moving threshold line transforms sealed watch from passive observation into tension. The player watches the line rise as pressure builds, the color shifting from blue to amber to red, and feels the unit straining. When a ghost pip appears below the line — a rejected signal — the player experiences a micro-event: "Was that important? Did the immune system just make a mistake?" This is emergent narrative from a mechanical visualization.

5. **Graceful skill ceiling.** Lena uses adaptive mode as a "just make it work" toggle with default settings. Davi uses it as a congestion control laboratory, systematically testing curve shapes and damping coefficients. Both are served. The mechanic scales from "turn it on and forget it" to "precisely engineer the pressure response curve."

---

## Weaknesses

1. **Unpredictable behavior.** Static thresholds are deterministic from the player's perspective — the player knows exactly what fidelity value will be accepted. Adaptive thresholds make the acceptance criterion dependent on runtime state. The player cannot look at a blueprint and know whether a fidelity-0.45 signal will be accepted; it depends on what the buffer looks like when the signal arrives. This makes Plan-phase reasoning harder. Sealed watch becomes the only way to verify behavior, which shifts the game's cognitive load from "design correctly" toward "observe and iterate."

2. **The autoimmune failure mode.** The most interesting and most dangerous emergent behavior: under sustained pressure, the adaptive threshold rises high enough to reject legitimately useful signals. A three-hop recon observation at fidelity 0.42 is valuable intelligence, but a Relay at 90% buffer fill with sensitivity 0.5 computes a threshold of 0.65 and rejects it. The immune system attacks the body's own tissue. This is not a bug — it is a fundamental tension of any adaptive filter — but it creates failures that are difficult to diagnose. The player sees "signal rejected" in the Inspector and must understand that the threshold was elevated *because* of pressure *at that moment*, not because the player configured a static value of 0.65. The causal chain crosses from configuration space to runtime state, which is a harder debugging problem than static thresholds present.

3. **Oscillation instability.** The exponential curve with high sensitivity can oscillate: threshold rises, buffer drains, threshold falls, buffer refills, repeat. This is TCP sawtoothing. Some players will discover it and find it fascinating (Davi). Others will find it baffling: "Why does my Relay keep switching between accepting everything and rejecting everything?" The oscillation is mechanically correct but experientially jarring. The step function avoids oscillation through its binary nature but introduces its own problem: the unit is either fully permissive or fully restrictive, with no middle ground.

4. **Configuration surface creep.** Adaptive threshold adds two sliders and a three-way selector per blueprint. Combined with per-channel thresholds (5.14b), each channel could have its own base, sensitivity, and curve — tripling the per-channel configuration from one slider to three controls. A Relay listening to four channels with per-channel adaptive thresholds has 12 configurable values plus 4 curve selections. This is dangerously close to the spreadsheet problem identified in 5.14b.

5. **Sealed watch readability at scale.** The moving threshold line is clear on one unit's buffer bar. On a board with 8-12 units, each with a moving line of different colors, the visual becomes noisy. The player scanning all buffer bars sees a field of jittering colored lines. The ICU-scanning use case (4.03) works for static color — "that bar is red" — but may not work for dynamic lines whose meaning depends on their position, color, and movement rate simultaneously.

---

## Interaction Effects

### With Per-Channel Thresholds (5.14b)

Adaptive threshold and per-channel thresholds compose naturally: each channel can have its own adaptive profile (base, sensitivity, curve) or inherit the global adaptive profile. The per-channel override now overrides not just a static value but an entire adaptive policy. This is powerful — the player can say "`recon-net`: adaptive with low base and low sensitivity (always permissive, barely reacts to pressure)" while "`cmd-net`: adaptive with high base and high sensitivity (strict and gets stricter fast)." The composition is mechanically clean but presents the configuration surface creep described above. The recommendation is that per-channel adaptive profiles are a late-game unlock (Mission 10+, gauntlet mode) — during the main campaign, adaptive mode applies globally to all channels on a blueprint, and per-channel overrides remain static.

### With Fidelity as Rule Condition (5.14c)

Adaptive thresholds and fidelity rule conditions operate at different pipeline stages, exactly as designed in 5.14c. The adaptive threshold (Stage 1, ingestion) decides what enters the buffer. The rule conditions (Stage 2, processing) decide what to do with what entered. But the adaptive threshold adds a wrinkle: the ingestion filter is no longer static, so the population of signals that reach Stage 2 changes dynamically. A rule that says `IF signal_fidelity < 0.5 → request_confirmation` assumes signals below 0.5 exist in the buffer. With an adaptive threshold that rises to 0.6 under pressure, no signals below 0.6 exist in the buffer — the rule's condition never fires. The rule has been "pre-empted" by the adaptive threshold. The player must reason about the interaction between their ingestion policy and their processing logic, which is a genuine systems-thinking exercise but also a genuine confusion source.

### With Fidelity Spoofing (Enemy Tactic)

Adaptive thresholds change the spoofing game. Against a static threshold, the enemy must spoof above a known constant. Against an adaptive threshold, the enemy must spoof above a moving target. If the enemy floods a unit's channels to drive buffer pressure up (raising the adaptive threshold), they simultaneously make their own spoofed signals harder to sneak through — the adaptive threshold that protects against overload also protects against spoofing during pressure. But there is a counter-counter: the enemy can time their spoofed signal for a moment of low buffer pressure (after the unit's buffer drains), when the adaptive threshold is at its base value. This creates a cat-and-mouse timing game between enemy signal floods and enemy spoofing attempts.

### With Buffer Pressure and Eviction

Adaptive thresholds create a negative feedback loop with buffer pressure: high fill -> high threshold -> fewer signals accepted -> fill decreases -> lower threshold -> more signals accepted -> fill increases. This is a self-regulating system that, with appropriate parameters, converges to a steady-state buffer fill level. The steady state depends on the incoming signal rate, the base threshold, the sensitivity, and the curve shape. The exponential curve's steady state is higher (more signals accepted, higher fill) because it stays permissive longer. The step function's steady state oscillates between the trip point and a lower level. The linear curve finds the smoothest equilibrium. This is the control-theory heart of the mechanic: the player is tuning a feedback controller.

### The Teaching Arc

The adaptive threshold teaches through direct biological and engineering metaphors:

- **Immune system:** Permissive when healthy, restrictive when under attack. Autoimmune failure = rejecting self when overactivated. This is the primary narrative metaphor, accessible to biology students and general audiences.
- **TCP congestion control:** Slow start (permissive at low fill), congestion avoidance (threshold rises with pressure), fast recovery (threshold drops when pressure resolves). This metaphor serves networking-literate players.
- **Circuit breaker pattern:** The step function is a literal circuit breaker — operates normally, trips under overload, resets when conditions improve. This metaphor serves software engineers.
- **Adaptive difficulty:** The system automatically adjusts its selectivity based on conditions, like a game that gets harder when you are doing well. This meta-metaphor helps non-technical players understand the concept through their existing gaming vocabulary.

The game does not need to teach all four metaphors. The immune system framing is the narrative voice; the others are recognition patterns that different player backgrounds will import on their own.

---

## Comparable Systems

### TCP Congestion Control (Slow Start / Congestion Avoidance)

The most precise analogy. TCP's congestion window starts large (permissive), shrinks when packet loss indicates congestion (buffer pressure), and gradually reopens as conditions improve. TCP's AIMD (Additive Increase, Multiplicative Decrease) algorithm is a pressure curve — linear increase in window size, exponential decrease on congestion signal. The adaptive fidelity threshold inverts the direction (threshold goes up under pressure instead of window going down) but the control loop is structurally identical. TCP's well-known oscillation patterns — sawtooth, slow convergence, unfairness between competing flows — all have analogs in the adaptive threshold system. Players who understand TCP will immediately recognize the oscillation behavior of the exponential curve.

### Biological Immune Response

The innate immune system operates on a threshold model: pathogen-associated molecular patterns (PAMPs) must exceed a detection threshold to trigger an immune response. Under infection (high pathogen load = high buffer pressure), the immune system upregulates — producing more antibodies, activating more white blood cells, raising inflammation. The autoimmune failure mode — the immune system attacking the body's own cells — is a direct analog to the adaptive threshold rejecting legitimate signals under pressure. The "cytokine storm" (immune overreaction that damages the host) maps to the scenario where sensitivity is set too high and the threshold overshoots, rejecting everything including critical command signals.

### Auto-Scaling in Cloud Infrastructure

Cloud auto-scalers adjust resource allocation based on load metrics. When CPU usage exceeds 70%, spawn more instances. When it drops below 30%, terminate instances. The scaling policy has a curve shape (linear, step, target-tracking), a cooldown period (to prevent oscillation), and min/max bounds (base threshold and sensitivity cap). The auto-scaler's classic failure mode — scaling up too aggressively during a traffic spike, then scaling down too fast when the spike passes, causing a second overload — mirrors the exponential curve oscillation. The step function's behavior mirrors the auto-scaler's step scaling policy with a single threshold trigger.

### Adaptive Difficulty Systems (Resident Evil 4, Left 4 Dead)

These games dynamically adjust difficulty based on player performance. When the player is doing well (low buffer pressure), the game increases challenge (lower threshold, accept more signals). When struggling (high pressure), it reduces challenge (higher threshold, reject more). The parallel is structural: both systems use a feedback loop between a measured performance metric and a system parameter. The key difference is that adaptive difficulty is designed to be invisible to the player, while the adaptive threshold is designed to be visible, understood, and configured — the player is the systems engineer, not the subject.

---

## Sensory Description: The Full Sealed Watch Experience

The central Relay sits at D4, its antenna sprite rotating. Below it, twelve pips in a row — seven lit (four green observations, three blue hook messages), five dark. Above the pips, a thin line hovers low over the row, glowing cool cyan, breathing slowly — one gentle oscillation per second. The threshold is at base: 0.25. The buffer is healthy. The line is calm.

Tick 23. The enemy wave arrives. Two new blue pips light up at the right end of the row — signals from the Scout chain. The bar is at 9/12. The line nudges upward, barely perceptible. Its color remains blue but with the faintest amber warmth at its edges, like a sunrise just beginning.

Tick 24. Three more signals arrive simultaneously. The leftmost green pip flashes red and goes dark — evicted. But two new pips push in from the right. Bar: 10/12. The line climbs noticeably now. Blue is giving way to amber. The breathing quickens — 1.2Hz. The player's eyes dart to this unit. Something is happening.

Tick 25. A flood: four signals on three channels. The bar tries to hold — evictions fire on the left, new pips blaze on the right. Bar: 11/12. The line is high now, amber going orange, breathing at 1.4Hz. A signal arrives at fidelity 0.48. The line is at 0.52. White flash ripples along the line — rejection. A ghost pip appears below the line, dim and fading, like a turned-away visitor pressing their face against the glass. The player watches the ghost pip dissolve and wonders: was that important?

Tick 26. Two more signals. One at fidelity 0.61 — above the line. Accepted. One at fidelity 0.44 — below. Rejected. Another ghost. The bar holds at 11/12. The line holds at amber-orange. No stun. The immune system is working. It is costing something — those ghost pips were real intelligence — but the unit is alive and processing.

Tick 28. The wave passes. Signal rate drops. Buffer drains to 8/12 over two ticks as old data ages out and eviction clears space. The line sinks. Orange fades to amber fades to blue. The breathing slows — 1.1Hz, 1.0Hz, settling. The Relay returns to its resting state. The player exhales. The membrane relaxes. Homeostasis restored.

Across the board, the player can see five other units' buffer bars. Two are blue and calm — rear-echelon Relays untouched by the wave. One is amber and rising — the eastern Relay catching the tail of the assault. Two have no threshold lines — Strikers with static thresholds, their bars red but their lines fixed. The adaptive units pulse with life. The static units hold their ground. The board tells a story in color temperature and rhythm: which parts of the architecture are adapting, which are rigid, which are stressed, which are at peace.

---

## Design Recommendation

Adaptive fidelity threshold should be implemented with the following principles:

1. **Two parameters, three curves, nothing more.** Base threshold and pressure sensitivity are sufficient. Do not add cooldown timers, hysteresis bands, or per-tick damping coefficients. The system's complexity should emerge from the interaction of simple parameters, not from the parameter count itself.

2. **Default to linear, let players discover exponential and step.** Linear is the most predictable curve and produces the fewest surprises. Exponential and step should be available from the moment adaptive mode unlocks, but the default selection should be linear. Tooltips should describe behavior in plain language: "rises steadily with buffer fill" / "stays low then rises sharply" / "flat, then jumps at 75% full."

3. **Adaptive mode is per-blueprint, not per-channel, during the campaign.** Combining adaptive profiles with per-channel overrides (5.14b) should be a post-campaign / gauntlet-mode unlock. During the campaign, the adaptive threshold applies uniformly to all channels on a blueprint. This prevents the configuration surface from exploding during the learning arc.

4. **The autoimmune failure mode is a feature, not a bug.** Do not add safeguards that prevent the threshold from rejecting useful signals. The autoimmune response is the mechanic's most interesting tension and the source of its deepest learning moments. The player who discovers autoimmune failure and learns to prevent it (by lowering sensitivity, using per-channel overrides, or redesigning relay chain lengths) has internalized a real systems principle: adaptive systems can over-correct.

5. **The moving threshold line is the primary feedback mechanism.** The sealed watch visualization — the breathing, color-shifting line on the buffer bar — must be readable at the board-scan level. If playtesting shows that moving lines on 8+ units are too noisy, consider showing the line only on the selected unit and reducing other units' adaptive indicators to a color temperature shift on the buffer bar itself (pips shift from blue to amber to red as threshold rises). The line is the detailed view; the color shift is the peripheral view.

6. **The advisory system should surface adaptive mode when the player is stuck.** After 3+ context overload stuns on the same unit across consecutive mission attempts, the boot log should include the advisory message that helped Lena. The mechanic should be discoverable through designed failure, not mandatory tutorial.
