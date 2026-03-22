# The "Consistent Divergence" Flag

**Aspect:** 4.81 — When a player gets QUICK/THOROUGH divergence on the same config version 3+ times, the game surfaces "your config consistently produces pre-ranking mismatches — the heuristic signals may not be well-calibrated for your architecture style"; prompts exploring pre-ranking weight configuration (4.63) or the heuristic autopsy.

**Parent:** 4.64 — Pre-ranking accuracy as displayed stat
**Siblings:** 4.78 — Divergence frequency metric; 4.88 — Adaptive weight suggestion from divergence history
**Related:** 4.63 — Player-configurable pre-ranking weights; 4.58 — Pre-ranking transparency panel; 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result; 4.40 — First viable vs. minimum fix toggle; 8.09 — Diagnostic layer as teaching arc

---

## The Core Problem

Most divergence between QUICK and THOROUGH is transient. The pre-ranking surfaces the wrong candidate, the player runs THOROUGH, applies the correct fix, moves on. The divergence is a one-off event — an artifact of the heuristic's limits in that specific scenario. It happens, it resolves, the player forgets about it.

**Consistent divergence is structurally different.** It means the player's architecture has a persistent property that causes the three heuristic signals (pivot-activity, recency, volatility) to reliably misrank candidates. The player isn't hitting an unlucky edge case — they're running a config whose structure is systematically adversarial to the pre-ranking formula. Every time they run QUICK, the heuristic makes the same category of mistake. Not the same candidate necessarily, but the same type of error: the pre-ranking is systematically distracted by high-signal decoy elements while the actual minimum fix sits at rank 4, rank 7, rank 11.

The player doesn't know this is happening. They experience each divergence as isolated bad luck. "QUICK was wrong again — whatever, I'll run THOROUGH." They might never connect the dots that the divergences share a structural cause: their architecture's coupling pattern, their hook topology, the specific way their relay chain distributes activity signals across multiple agents.

The consistent divergence flag is the game saying: **this isn't bad luck. This is a pattern. Your pre-ranking beliefs and your architecture's failure signature are misaligned, and that misalignment is stable.**

---

## The Design

### When the Flag Fires

The flag tracks divergence events per config version. A "config version" increments whenever the player modifies their agent architecture — changing a rule, adding a hook, adjusting a buffer size, any structural change that the game would track as a new version in the config history.

The flag fires when:
1. The player has run both QUICK and THOROUGH on the **same config version** in at least 3 separate sessions (sessions, not runs — the player must have left the debrief and returned to the match at least three times with this exact config)
2. In all 3+ of those sessions, QUICK's #1 candidate and THOROUGH's minimum fix **diverged** (they were different elements)
3. The player's current pre-ranking weight configuration has not changed between any of those sessions (they're using the same heuristic weights across all divergences)

Condition 3 is important: if the player changed their weights between sessions, the divergences might have different causes. The flag is specifically about a stable config + stable weights = consistent mismatch. That triple stability is what makes the flag meaningful.

### What the Flag Says

The flag appears as a notification banner at the top of the Fix Explorer results, above the candidate list, below the mode toggle:

```
CONSISTENT DIVERGENCE DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your pre-ranking has surfaced a different candidate than
THOROUGH search in your last 3 sessions on this config version.

The heuristic signals may not be well-calibrated for your
architecture style.

[Adjust pre-ranking weights →]  [View heuristic autopsy →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Two actions, both optional:

**"Adjust pre-ranking weights"** opens the weight configuration panel (4.63). If the player hasn't unlocked weight configuration yet, this action triggers the unlock — the consistent divergence flag is itself a valid unlock gate for weight configuration.

**"View heuristic autopsy"** opens a new diagnostic view (described below) showing the three sessions side-by-side: what QUICK ranked #1, what THOROUGH found, and which signals drove the mismatch in each case. The autopsy reveals the structural pattern behind the divergences.

### The Heuristic Autopsy

The autopsy is the analytical core of this aspect. It answers: **why does the pre-ranking keep getting it wrong on this config?**

```
HEURISTIC AUTOPSY — Config v14.2, last 3 sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session 47    QUICK: SCOUT-B (score 0.87)    THOROUGH: RELAY-C
Session 49    QUICK: SCOUT-B (score 0.81)    THOROUGH: DISPATCH-A
Session 51    QUICK: SENTRY-D (score 0.79)   THOROUGH: RELAY-C

PATTERN DETECTED:
Elements with high pivot-activity (SCOUT-B, SENTRY-D) are
consistently ranked above the actual minimum fix.

Signal breakdown — pre-ranking #1 vs. THOROUGH minimum:
              QUICK #1 avg     THOROUGH min avg
Pivot-act:    0.84              0.31
Recency:      0.62              0.44
Volatility:   0.55              0.28

The minimum fix elements have LOW pivot-activity and LOW
volatility — they are quiet, stable elements that fail in
specific edge cases. Your pre-ranking weights (Pivot: 66%,
Recency: 25%, Volatility: 8%) strongly favor active, noisy
elements.

SUGGESTION: Reduce pivot-activity weight. Your architecture
produces many high-activity elements that are not causal.
Consider: Pivot 30% / Recency 40% / Volatility 30%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The autopsy surfaces three things the player cannot easily see on their own:

1. **The consistent QUICK candidate pattern:** Is it always the same element? Always the same type of element? The autopsy names the pattern explicitly.
2. **The signal asymmetry:** A side-by-side comparison of the average signal values for QUICK's picks vs. THOROUGH's picks. This makes visible *which signal is doing the misleading*.
3. **A concrete weight suggestion:** Based on the signal asymmetry, the autopsy proposes a weight adjustment. This bridges to 4.88 (adaptive weight suggestion) — the autopsy is the manual, player-facing version of what 4.88 would automate.

### The Dismissal and Recurrence Pattern

The flag can be dismissed. A small "x" in the top-right corner of the banner closes it for the current session.

If dismissed, the flag does not reappear until:
- The player runs another QUICK/THOROUGH divergence on the same config version (extending the streak to 4+), OR
- The player changes their pre-ranking weights — in which case the streak counter resets, and the flag re-evaluates from scratch with the new weights

If the player adjusts weights and the divergence streak breaks (QUICK now matches THOROUGH), the flag never reappears for that config version + weight combination. The player solved the calibration problem.

If the player adjusts weights and divergence continues, the flag fires again after 3 new divergences under the new weights. The banner now reads:

```
CONSISTENT DIVERGENCE PERSISTS (new weights)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your adjusted weights still produce pre-ranking mismatches.
This config version may have structural properties that
resist heuristic pre-ranking.

[View updated autopsy →]  [Accept: use THOROUGH for this config →]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The second action — "Accept: use THOROUGH for this config" — is a deliberate concession. The player acknowledges that QUICK mode is not reliable for this architecture and commits to running THOROUGH. The game marks this config version with a small indicator: a tiny amber dot next to the config version number, visible in the config history, meaning "heuristic-resistant." This is not a penalty. It is information.

---

## Player Journeys

### Journey: Lena, 31, DevOps engineer, Session 44 — "The Relay Chain Problem"

**Context:** Lena has a six-agent config with a three-hop relay chain. Her relays pass contextual signals between her Scout agents and her Striker. She's been iterating on the relay buffer sizes for three sessions without modifying anything else — her config version hasn't changed since session 41. She uses QUICK mode first, then THOROUGH when she's unsure. In each of her last three sessions, QUICK suggested modifying SCOUT-A's attention filter, but THOROUGH found that RELAY-B's buffer overflow was the actual minimum fix.

LENA runs QUICK mode. The results load — SCOUT-A is #1 again. She sighs.

She's about to click THOROUGH when a banner appears above the results list. She hasn't seen this before.

LENA
(reading the banner aloud)
"Consistent divergence detected." Huh.

She reads the full text. "Your pre-ranking has surfaced a different candidate than THOROUGH search in your last 3 sessions on this config version."

LENA
(leaning forward)
Wait — it's tracking that?

She clicks "View heuristic autopsy."

The autopsy panel slides open from the right side of the Fix Explorer. Three rows, one per session. In each row: QUICK picked SCOUT-A, THOROUGH found RELAY-B. The pattern column reads: "SCOUT-A has high pivot-activity (0.88 avg) because it processes every incoming signal at the pivot tick. RELAY-B has low pivot-activity (0.22) because it only forwards signals — it is not active when messages are in transit."

LENA
(recognizing the pattern immediately)
Oh. The relay is a passthrough — it doesn't show up as "active" because its activity is forwarding, not processing. The heuristic sees the Scout lighting up and thinks that's where the problem is.

She looks at the signal breakdown. Pivot-activity for QUICK's picks: 0.88. For THOROUGH's picks: 0.22. The gap is enormous. The heuristic is being completely fooled by the relay chain's invisible forwarding behavior.

LENA clicks "Adjust pre-ranking weights." The slider panel opens. She drags pivot-activity from 66% down to 25%. She drags volatility up to 45% — her theory is that the relay's buffer overflow is a volatility event (it happens inconsistently, depending on traffic load).

She re-runs QUICK with the new weights.

Five seconds. "FIRST VIABLE FIX: RELAY-B — context buffer +1 slot."

LENA
(quietly)
There it is.

She saves the preset: "Relay-heavy — low pivot, high volatility." She applies the fix. Pass rate: 81/100.

She dismisses the consistent divergence banner. It doesn't reappear. The streak is broken.

LENA closes the debrief and opens her personal notes app. She types: "Relay chains make the pre-ranking heuristic overweight Scout activity. Reduce pivot-activity weight when running relay-heavy configs. The forwarding agents are invisible to the pivot-activity signal."

She thinks about work. Her production monitoring has the same blind spot — the load balancer doesn't generate error logs when it's the bottleneck. It just silently queues. The backend services behind it throw errors and look like the problem. She's been troubleshooting the wrong layer for months.

LENA
(to herself)
I need to add load balancer latency metrics to the dashboard.

---

### Journey: Kai, 22, computer science student, Session 19 — "The Dismissal"

**Context:** Kai is relatively early in the game. He doesn't have weight configuration unlocked yet. He uses QUICK mode almost exclusively — he's never voluntarily run THOROUGH. The game has been running THOROUGH automatically in the background on three occasions to build comparison data. In all three cases, the results diverged.

KAI runs QUICK mode after a failed mission. The Fix Explorer loads. A banner appears above the results.

KAI
(reading quickly)
"Consistent divergence detected... heuristic signals may not be well-calibrated..."

He doesn't understand what "heuristic signals" means. He hasn't opened the transparency drawer more than once. The banner is dense text. He's looking for a close button.

KAI clicks the "x" in the top-right corner. The banner disappears. He applies the QUICK result. It works — pass rate goes from 62 to 71.

Two sessions later, the banner reappears. Divergence streak is now at 4.

KAI
(slightly annoyed)
This again.

He reads it more carefully this time. "Adjust pre-ranking weights" — he clicks it, curious.

A tooltip appears: "Weight configuration unlocked. The pre-ranking heuristic uses three signals to rank candidates. You can now adjust how much each signal matters."

The slider panel opens. Kai sees three sliders labeled "Pivot Activity," "Recency," "Volatility." He has a vague understanding of "recency" but doesn't know what "pivot activity" means in this context.

He drags the Recency slider to 100% and the others to 0%. The results list reshuffles dramatically. His original QUICK #1 drops to #5. A different element is now #1.

KAI
(confused)
What did that do?

He clicks "Reset to default." The list snaps back. He's not ready for this.

He closes the slider panel. He clicks "View heuristic autopsy" instead.

The autopsy shows three sessions side-by-side. Kai reads the "PATTERN DETECTED" section: "Elements with high pivot-activity are consistently ranked above the actual minimum fix."

KAI
(slowly processing)
So... QUICK keeps picking the wrong thing because it's looking at the wrong signal?

He doesn't change anything. He closes the autopsy. He runs THOROUGH manually for the first time by choice.

THOROUGH finds a different fix. Kai applies it. Better pass rate.

Over the next five sessions, Kai starts running THOROUGH first instead of QUICK. The consistent divergence banner stops appearing — not because the underlying mismatch is fixed, but because Kai has changed his workflow. He's bypassing the pre-ranking entirely.

Three weeks later, after reading a community guide about weight configuration, Kai returns to the sliders. He adjusts pivot-activity down. He runs QUICK. It surfaces the correct candidate. He saves a preset. The divergence streak breaks.

KAI's arc is slower than Lena's. The flag planted a seed that took three weeks to germinate. But the seed was planted precisely because the flag appeared at the right moment — when the pattern was undeniable (4 consecutive divergences) and the player was beginning to feel frustrated with QUICK's reliability.

---

### Journey: Mariana, 38, Gauntlet competitor, Session 112 — "The Weaponized Divergence"

**Context:** Mariana is a competitive player who already has deep familiarity with weight configuration. She uses different presets for different mission types. She's aware of the consistent divergence flag because she's hit it before and fixed it. Now she's interested in something else: can she *engineer* consistent divergence in an opponent's diagnostic experience?

MARIANA is designing a config for a Gauntlet match. She opens her test harness — a self-diagnostic mode where she runs the Fix Explorer against her own config to see what an opponent would experience.

She runs QUICK with default weights (the most common opponent configuration). Result: SCOUT-B ranked #1.

She runs THOROUGH. Minimum fix: DISPATCH-OMEGA, a low-activity, low-volatility, never-modified relay.

She smiles. This is divergence by design. SCOUT-B was engineered to have high pivot-activity, high recency (she modified it recently on purpose), and high volatility. It's a decoy. DISPATCH-OMEGA is the real vulnerability, but its signal profile is invisible to the default pre-ranking weights.

She runs the simulation again. Same divergence. And again. Same divergence.

MARIANA
(to herself)
If an opponent runs this config for three sessions without changing their weights, they'll hit the consistent divergence flag. The flag will tell them to adjust weights or view the autopsy.

She pauses. The flag is working *against* her adversarial strategy. It's telling her opponent that their heuristic is failing — and pointing them toward the autopsy that would reveal the decoy pattern.

She has two options:

1. **Design the config so the divergence streak is exactly 2.** If she can ensure that QUICK sometimes gets it right (by engineering a second, less-hidden vulnerability that QUICK occasionally finds), the streak never reaches 3 and the flag never fires. The opponent stays in transient-divergence territory, never getting the systematic alert.

2. **Accept the flag and design around it.** The autopsy reveals the signal asymmetry — QUICK's picks have high pivot-activity, THOROUGH's minimum fix has low pivot-activity. But the autopsy's suggested weight adjustment might not actually help: even with reduced pivot-activity weight, DISPATCH-OMEGA's low scores on all three signals mean it resists any linear re-weighting.

MARIANA chooses option 2. She tests the autopsy's suggested weights (Pivot 30%, Recency 40%, Volatility 30%) against her own config. QUICK with the adjusted weights: DISPATCH-OMEGA is now at rank 6. Better than rank 14, but still not #1.

MARIANA
(satisfied)
The flag fires. The autopsy suggests weights. The suggested weights don't fully solve it. The opponent has to run THOROUGH anyway.

She's designed a config that *survives* the consistent divergence flag. The flag tells the opponent something is wrong, but the correction doesn't fully work. The opponent is now in a worse position — they know QUICK is unreliable AND they can't fix it with weight adjustment. They're forced into THOROUGH for every session against this config.

In a timed Gauntlet match, forcing the opponent to run 47-second THOROUGH searches instead of 5-second QUICK searches is a significant time advantage.

MARIANA saves this config and queues it for her next Gauntlet match.

---

## Strengths

**Transforms isolated frustration into structural insight.** Without the flag, a player who experiences three consecutive divergences might blame bad luck, lose trust in QUICK mode, or just stop using the Fix Explorer entirely. The flag reframes the experience: this isn't noise, it's signal. The divergences have a cause, the cause is identifiable, and there are concrete actions to take. The flag converts "QUICK keeps being wrong" into "your pre-ranking beliefs are miscalibrated for this specific architecture."

**Creates a natural bridge to weight configuration.** The consistent divergence flag is the most organic unlock gate for 4.63 (pre-ranking weight configuration). The player doesn't receive weight sliders as a reward for time spent — they receive them as a response to a diagnosed problem. The moment the flag fires is the moment weight configuration becomes meaningful, because the player has a concrete reason to change the weights and a concrete way to verify the change worked (does the streak break?).

**The autopsy teaches heuristic failure modes.** The signal breakdown in the autopsy — showing the average pivot-activity, recency, and volatility scores for QUICK's picks vs. THOROUGH's picks — teaches the player to read heuristic failures analytically. The player doesn't just know that QUICK was wrong; they know *why* it was wrong, *which signal* was misleading, and *what kind of architecture* produces that signal distortion. This is transferable knowledge: understanding why a heuristic fails in a specific domain is a general diagnostic skill.

**Respects the player's attention.** The flag requires 3 consecutive divergences on the same config version with the same weights before appearing. It doesn't fire on a single divergence (which could be transient), doesn't fire when the player is actively changing their config (which would create noise), and doesn't fire when weights are being adjusted (which means the player is already investigating). The triple gate ensures the flag arrives at the moment it's maximally informative.

**The dismissal-and-recurrence pattern avoids alarm fatigue.** The flag can be dismissed. If dismissed, it only returns with new evidence (an additional divergence). This means the player is never asked twice about the same data — they're only re-prompted when the pattern has deepened.

---

## Weaknesses

**The 3-session threshold is arbitrary and may fire too early or too late.** Three sessions is enough to establish a pattern for players who run both modes every session. But a casual player who runs THOROUGH once every five sessions would need 15+ sessions of play before the flag accumulates enough data. Conversely, a player who runs both modes rapidly in a single evening might trigger the flag before they've had time to organically discover the problem themselves. The threshold is a design parameter that may need tuning per-player or per-difficulty.

**"Config version" tracking is fragile.** The flag tracks divergence per config version. But "config version" has a boundary problem: does changing a single buffer size create a new version? Does reordering rules? If the version boundary is too sensitive, the streak counter resets too frequently and the flag never fires. If it's too coarse, the flag fires on a config that was actually modified in ways that should have reset the counter. The definition of "same config version" is load-bearing.

**The autopsy's weight suggestion may over-simplify.** The autopsy proposes a concrete weight adjustment based on signal asymmetry. But the asymmetry is a symptom, not the full picture. A player who follows the suggestion might improve QUICK accuracy for the current config but develop a false confidence that the suggested weights are universally better. The suggestion should be framed as "try this for this config" not "this is better in general" — and that framing is hard to communicate in a compact UI.

**Adversarial exploitation (Mariana's journey) turns the flag into a signal leak.** In competitive contexts, the flag informs the opponent that their diagnostic approach is failing — which is useful for the opponent but strategically costly for the config designer who engineered the mismatch. The flag could be suppressed in competitive modes, but suppression removes a learning opportunity. This is a genuine design tension without a clean resolution.

**Players who dismiss the flag and never return.** Kai's journey shows that the flag can be dismissed without action. If a player dismisses the flag three times, they've been told three times that their pre-ranking is miscalibrated and chosen not to act. At what point does the flag stop appearing? The design must include a "max dismissals" count after which the flag stops firing entirely — perhaps 5 dismissals — to avoid becoming an ignored persistent notification.

---

## Interaction Effects

**With 4.63 (Player-configurable pre-ranking weights):**
The consistent divergence flag is the primary entry point to weight configuration. For many players, the flag will be their first encounter with the idea that the pre-ranking has adjustable weights. The flag's "Adjust pre-ranking weights" action should open the weight panel with the current divergence context pre-loaded: the autopsy's signal breakdown is visible alongside the sliders, so the player can see exactly which signal to adjust and why. Weight configuration without the flag is an abstract tool; weight configuration prompted by the flag is a targeted intervention.

**With 4.64 (Pre-ranking accuracy stat):**
The consistent divergence flag and the accuracy stat measure related but different things. The accuracy stat is a rolling average across all sessions — it shows general heuristic reliability. The flag is per-config-version — it detects a specific structural mismatch. A player can have 75% overall accuracy (good) but still trigger the flag on a specific config version that produces 0% accuracy across 3 sessions. The flag catches what the rolling average smooths over.

**With 4.78 (Divergence frequency metric):**
The divergence frequency metric tracks how often QUICK and THOROUGH disagree across all sessions. The consistent divergence flag tracks consecutive disagreements on a single config version. The frequency metric is the broad trend; the flag is the acute alert. If divergence frequency is already high (40%+), the flag may fire frequently — in which case it should reference the frequency metric: "Your overall divergence rate is 43%. On this specific config version, divergence has occurred in 3/3 sessions."

**With 4.88 (Adaptive weight suggestion):**
The autopsy's weight suggestion is the manual precursor to 4.88. The autopsy analyzes three sessions and proposes a weight change. 4.88 would analyze 30+ sessions and propose an optimized weight configuration. The flag is the "you should investigate" prompt; 4.88 is the "here's what the data suggests" automation. They should coexist: the flag fires with the autopsy's quick suggestion, and a link at the bottom of the autopsy says "For a more comprehensive analysis based on your full session history, see adaptive weight suggestions →" (linking to 4.88 if unlocked).

**With 4.62 (Agree-to-disagree result):**
The consistent divergence flag should distinguish between agree-to-disagree divergences (both fixes are valid, different failure clusters) and accuracy divergences (QUICK's pick is genuinely worse than THOROUGH's). If all three divergences in a streak are agree-to-disagree type, the flag's message should be softer: "Your pre-ranking consistently identifies a different valid fix than THOROUGH — both are correct, but they address different weaknesses." The flag still fires, but the tone shifts from "miscalibrated" to "differently calibrated."

**With 8.09 (Diagnostic layer as teaching arc):**
The consistent divergence flag is a late-middle chapter in the diagnostic teaching arc. The arc proceeds: (1) observe failures, (2) identify pivot tick, (3) use Fix Explorer, (4) encounter QUICK/THOROUGH divergence, (5) understand pre-ranking via transparency panel, (6) **experience consistent divergence and recognize it as structural** (this aspect), (7) configure pre-ranking weights to resolve the mismatch, (8) track accuracy improvement. Step 6 is the moment the player transitions from "understanding how the tool works" to "understanding how the tool fails and what to do about it."

---

## Comparable Games and Media

**Slack's "You're getting a lot of notifications from this channel" prompt.** Slack detects when a user is receiving an unusually high volume of notifications from a single channel and offers to mute or customize notification settings. The prompt is triggered by a frequency threshold, dismissible, and leads to a configuration action. The consistent divergence flag follows the same pattern: detect a repeated friction, surface it as a prompt, offer configuration as the resolution.

**IDE linter warnings that accumulate.** In VS Code or IntelliJ, a single linter warning is ignorable. But when the same warning appears on every save, across multiple files, the aggregate pattern becomes a signal that the project's linting rules need adjustment. The consistent divergence flag is the game's version of "this warning keeps appearing — maybe adjust your linter config." The autopsy is the equivalent of clicking "why is this rule firing?" and reading the rule's documentation.

**Netflix's "Are you still watching?" but inverted.** Netflix detects inactivity and asks if the user is still engaged. The consistent divergence flag detects over-activity of a specific type (repeated mismatches) and asks if the user wants to reconfigure. Both are attention-pattern detections that prompt a meta-level question about the user's relationship with the system.

**Car dashboard warning lights with progressive severity.** A single check-engine flash is "monitor this." Three consecutive check-engine activations trigger a persistent warning light. The consistent divergence flag follows this escalation pattern: a single divergence is noted in the accuracy stat (ambient monitoring); three consecutive divergences trigger the flag (active alert). The autopsy is the OBD-II diagnostic readout that tells you why the light is on.

**Medical diagnostic guidelines for persistent symptoms.** In clinical medicine, a symptom that occurs once is "acute." A symptom that recurs three or more times in the same context is a "pattern" that warrants investigation into the underlying cause rather than treating each occurrence individually. The consistent divergence flag applies the same clinical logic: isolated divergence is treated with THOROUGH mode; consistent divergence warrants investigating the diagnostic framework itself.

---

## Sensory Description

**The banner's first appearance:**

The player runs QUICK mode. The results list begins to populate — candidate cards sliding in from the right, one by one, with the familiar 80ms stagger. But before the first card finishes its entrance animation, a banner descends from the top of the Fix Explorer panel.

The banner is a horizontal strip, 48px tall, spanning the full width of the Fix Explorer. Its background is a muted amber — not the warm orange-amber of the pivot-activity signal, but a cooler, more cautionary amber, the color of aged parchment held up to a desk lamp. The amber is at 12% opacity over the panel's dark background, creating a translucent wash rather than a solid block.

The text is set in the same monospace used for system messages throughout the debrief — not the body typeface of explanatory prose, not the display typeface of section headers. This is the game's *operational* voice: the voice it uses for status indicators, version numbers, and configuration labels. The word "CONSISTENT DIVERGENCE DETECTED" is in all-caps, letter-spaced at 1.5px, the same weight as the "PRE-RANKING WEIGHTS" header in the configuration panel. It reads like a system log entry, not an alert.

Below the header, two lines of body text in regular weight, left-aligned, 13px. The text uses the second person ("your pre-ranking," "your architecture style") — direct, not abstract. No exclamation marks. No urgency markers. The tone is clinical, almost documentary: here is what happened, here is what it means, here is what you can do.

**The two action buttons:**

At the bottom-right of the banner, two text links in teal — the same teal used for interactive elements throughout the transparency drawer. "Adjust pre-ranking weights" and "View heuristic autopsy" are separated by a thin vertical pipe character. Neither is styled as a primary button; both are text links. The banner is informational first, actionable second.

On hover, each link underlines with a 100ms fade. No color change, no background highlight. The underline is enough.

**The dismiss "x":**

Top-right corner of the banner. A 16x16 icon, rendered in dim grey (40% opacity against the banner background). On hover, it brightens to 80% opacity. Clicking it produces no animation — the banner simply disappears in a 150ms fade-out, and the candidate cards below shift upward to fill the space with a matching 150ms ease.

**The autopsy panel opening:**

Clicking "View heuristic autopsy" slides a panel in from the right edge of the Fix Explorer, 360px wide, pushing the candidate list to the left with a 200ms ease-out. The panel has a slightly darker background than the main Fix Explorer — a 4% opacity difference, just enough to register as a separate surface without feeling like a different context.

The panel's content loads in three beats:
1. The session rows appear first (three horizontal strips, each containing the session number, QUICK result, and THOROUGH result), staggered at 60ms intervals. Each row is a card with a thin left-border colored to match the session outcome: amber for divergence.
2. The "PATTERN DETECTED" section fades in 200ms after the last session row, as though the game is analyzing the data before presenting its conclusion.
3. The signal breakdown table renders last, appearing as a grid of numbers with column headers. The numbers in the "QUICK #1 avg" column are tinted amber (high values). The numbers in the "THOROUGH min avg" column are tinted teal (low values). The color asymmetry makes the signal gap visible before the player reads any individual number.

**The sound of the flag:**

When the banner first descends, a single tone plays: a low, resonant note — not a chime, not an alert, more like the sound of a tuning fork touched to a surface. 400ms duration. The frequency is in the alto range, below the bright chimes of success notifications but above the bass tones of failure events. It sits in the register of *observation* — the game has noticed something and is mentioning it, not demanding attention.

If the player has heard the divergence event sound before (a brief descending two-note motif played when QUICK and THOROUGH disagree), the consistent divergence tone is recognizably related — the same two notes, but played simultaneously as a chord rather than sequentially. The single-divergence motif compressed into one moment. Three occurrences condensed into one sound.

**The emotional register of the banner:**

The banner does not feel like an error. It does not feel like a warning. It feels like a colleague leaning over and saying, quietly, "Hey — this keeps happening. Have you noticed?" The amber wash is warm, not alarming. The monospace text is matter-of-fact, not urgent. The two actions are offers, not demands. The dismiss button is prominent enough to use without guilt.

A player who reads the banner and dismisses it should feel: "noted." A player who reads the banner and clicks the autopsy should feel: "let me understand." A player who reads the banner and adjusts weights should feel: "let me fix this." All three responses are valid. The banner's design does not privilege any of them.

---

## Discovered New Aspects

1. **4.97 — Divergence streak history in career stats**: A career-level view showing all past consistent divergence flags — which config versions triggered them, what the autopsy found, whether the player resolved the mismatch (by adjusting weights or accepting THOROUGH-only), and how many sessions each streak lasted before resolution. This gives the player a longitudinal view of their calibration journey: "I've had 7 consistent divergence events across my career, and in 5 of them the root cause was overweighted pivot-activity." Pattern recognition across patterns.

2. **4.98 — "Heuristic-resistant" config badge**: When a config version triggers consistent divergence AND the player adjusts weights AND divergence persists under the new weights, the config earns a visible "heuristic-resistant" badge in the config history. This badge is not a penalty — it's a classification. Some architectures are genuinely resistant to pre-ranking heuristics because their failure modes are orthogonal to all three signals. The badge teaches the player that heuristic resistance is an architectural property, not a configuration error.

3. **4.99 — Autopsy diff between weight iterations**: When the player adjusts weights in response to consistent divergence and the flag fires again under the new weights, the autopsy shows a diff: "Under your previous weights (Pivot 66%, Recency 25%, Volatility 8%), the minimum fix was at rank 14. Under your current weights (Pivot 30%, Recency 40%, Volatility 30%), the minimum fix is at rank 6. Improvement: +8 ranks, but still not #1." The diff makes weight iteration feel like experimental refinement rather than blind guessing.

4. **4.100 — Competitive divergence flag suppression toggle**: In Gauntlet mode, an option to suppress the consistent divergence flag for opponents diagnosing your config. If enabled, the opponent's Fix Explorer does not display the flag, even if the divergence streak threshold is met. This creates a strategic dimension: the flag is useful but reveals that the opponent's diagnostic approach is failing, which is itself information. Suppressing it keeps the opponent in the dark but removes a learning cue. The toggle itself teaches that diagnostic transparency has strategic cost.

5. **4.101 — Cross-config-version divergence pattern**: When the player triggers consistent divergence on multiple different config versions that share a structural property (e.g., all have relay chains longer than 2 hops), the game surfaces a higher-order pattern: "You've experienced consistent divergence on 3 config versions. All of them share: relay chain length > 2. Your architecture style may be systematically heuristic-resistant." This elevates the flag from per-config to per-player-style, teaching that diagnostic calibration is tied to design philosophy, not just individual configurations.
