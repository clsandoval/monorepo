# The Bloodhound Signal — Cross-Match Consistency as Anti-Canary Pre-Ranking Heuristic

**Aspect:** 4.98 — Anti-canary heuristic as a fourth pre-ranking signal: a late-game pre-ranking upgrade adds "cross-match consistency" as a fourth signal — how consistent is this element's rank score across the current opponent's previous 5 matches? Elements with suspiciously consistent high scores across diverse match conditions are down-weighted; high consistency = possible canary; teaches the principle that a reliable signal is harder to poison than a volatile one; interaction with 4.63 configurable weights.

**Parent:** 4.65 — Pre-ranking adversarial surface
**Siblings:** 4.63 — Player-configurable pre-ranking weights; 4.64 — Pre-ranking accuracy as displayed stat; 4.92 — Weight performance heatmap (Kiln Grid)
**Prerequisites:** Player must have (a) unlocked configurable weights (4.63 unlock gate — 3+ divergence events), (b) encountered at least one confirmed canary element in adversarial analysis (4.65), and (c) completed at least 8 adversarial counterfactual sessions against opponents with match history available.
**Related:** 4.58 — Pre-ranking transparency panel; 4.39 — Adversarial counterfactual mode; 4.60 — Search budget as resource; 4.67 — Probe hook suggestion; 5.14e — Fidelity spoofing campaign arc; 8.08 — Real-language vocabulary claim; 8.09 — Diagnostic layer as teaching arc

---

## The Name: "Bloodhound Signal"

A bloodhound follows a scent — but it can be misled by a lure dragged across every trail. The Bloodhound Signal is the fourth pre-ranking heuristic that asks a question the first three signals cannot: *does this element smell the same in every direction?* A real vulnerability has a scent that shifts with terrain. It scores high in some match conditions and low in others because its causal importance depends on what the enemy brought, what the board state demanded, what chain of events unfolded. A canary — an element engineered to always look suspicious — has a scent that never changes. It was designed to score high regardless of conditions. The Bloodhound detects the difference. It is not a stronger nose. It is the realization that a scent that is everywhere is a lure, and a scent that is somewhere is a trail.

---

## The Core Concept

The pre-ranking heuristic combines three signals to rank candidate elements during adversarial counterfactual analysis (4.39): pivot-tick activity, recency, and volatility. These signals answer "what was this element doing in *this* match?" A canary element is engineered to score high on all three signals in every match — it fires at the pivot tick, it was recently modified, it cycles through many states. The canary's rank score is consistently high because the canary was built to be consistently suspicious.

The Bloodhound Signal asks a different question: "How consistent is this element's rank score *across* the opponent's recent matches?" It pulls the opponent's last 5 matches (available through the match history system), computes the pre-ranking score for every element in those historical matches, and then measures the **variance** of each element's score across the 5-match window.

An element whose pre-ranking score is 0.88, 0.91, 0.85, 0.89, 0.87 across five diverse matches has a suspiciously low variance. Its rank score barely moves despite facing different opponents, different board states, different tactical conditions. This is the fingerprint of a canary: an element that was designed to look important regardless of context.

An element whose pre-ranking score is 0.12, 0.78, 0.45, 0.91, 0.33 across five matches has high variance. It was pivotal in some matches and irrelevant in others. This is the fingerprint of a real functional element: its importance depends on what the match demanded.

The Bloodhound Signal converts this variance into a **consistency penalty** that is subtracted from the element's combined rank score. High consistency = high penalty. Low consistency = no penalty.

### The Math

For a given element `E` in the opponent's config, let `S_1, S_2, ..., S_5` be the pre-ranking scores (computed from the three base signals) across the opponent's last 5 matches. The Bloodhound Signal computes:

```
mean(S) = (S_1 + S_2 + ... + S_5) / 5

variance(S) = sum((S_i - mean(S))^2) / 5

coefficient_of_variation(S) = sqrt(variance(S)) / mean(S)

consistency_score(E) = 1 - coefficient_of_variation(S)
```

The `consistency_score` ranges from 0 to 1:
- **1.0** = perfectly consistent (coefficient of variation = 0; all scores identical). Maximum canary suspicion.
- **0.5** = moderate variation. Mild suspicion, mild penalty.
- **0.0** = wild variation (coefficient of variation >= 1.0). No canary suspicion. No penalty.

The consistency penalty is applied as a multiplicative factor:

```
penalty_factor = 1 - (bloodhound_weight * consistency_score(E))

adjusted_score(E) = base_rank_score(E) * penalty_factor
```

Where `bloodhound_weight` is the player-configurable weight for the Bloodhound Signal (default: 0.25), controlled by the same slider system as the other three signals (4.63). At default weight, an element with perfect consistency (1.0) receives a 25% score reduction. An element with zero consistency receives no reduction.

### Why Coefficient of Variation, Not Raw Variance

Raw variance is scale-dependent. An element with scores [0.80, 0.85, 0.82, 0.88, 0.81] (mean 0.83, variance 0.0008) looks stable. An element with scores [0.10, 0.15, 0.12, 0.18, 0.11] (mean 0.13, variance 0.0008) looks equally stable — same variance — but this second element is a low-scoring element that fluctuates within a narrow band near zero. It is not a canary; it is irrelevant.

The coefficient of variation normalizes for scale. The first element (CV = 0.034) is suspiciously consistent relative to its high mean. The second element (CV = 0.22) has moderate variation relative to its low mean. The Bloodhound correctly penalizes the first and ignores the second.

This normalization teaches a real statistical concept: consistency is relative to magnitude. A heart rate of 72, 73, 71, 72, 73 is suspiciously stable for a person running sprints. A heart rate of 72, 73, 71, 72, 73 is perfectly normal for a person sitting in a chair. The context (the magnitude) determines whether consistency is suspicious.

### The 5-Match Window

Why five matches? Three considerations:

1. **Statistical minimum.** With fewer than 5 data points, variance estimates are unreliable. A 3-match window could produce a low variance simply because there wasn't enough opportunity for variation to emerge. Five is the minimum where a low-variance result is meaningful.

2. **Recency relevance.** The opponent's config may have changed over time. Looking back 20 matches would include outdated configs where the canary didn't exist yet. Five matches captures the opponent's *current* config philosophy.

3. **Computational cost.** Each historical match requires retroactive pre-ranking score computation — evaluating the three base signals for every element against the stored match data. Five is a reasonable compute budget. The Bloodhound Signal should not cost more search budget (4.60) than a THOROUGH analysis.

**Edge case: opponent has fewer than 5 matches.** If the opponent has played 3 or 4 matches, the Bloodhound computes with available data but displays a confidence indicator: "Bloodhound confidence: LOW (3/5 matches available)." Below 3 matches, the Bloodhound Signal is suppressed entirely — not enough data to distinguish canary from coincidence. The transparency drawer (4.58) shows: "Cross-match consistency: insufficient match history (2 matches). This signal requires 3+ matches to activate."

### Unlock Conditions

The Bloodhound Signal is not available from the start. It unlocks when three conditions are met:

**Condition 1: Canary exposure.** The player must have encountered at least one confirmed canary in adversarial analysis. "Confirmed" means the player ran QUICK mode, applied the top-ranked fix, and the result was significantly worse than the THOROUGH minimum fix — the QUICK result was a trap. The game flags this retroactively: "The element you targeted in Session 41 was a decoy. The real vulnerability was elsewhere."

**Condition 2: Weight configuration experience.** The player must have the configurable weights feature (4.63) already unlocked and have used at least 2 different presets across 5+ sessions. This ensures the player understands that the pre-ranking is configurable — the Bloodhound is a fourth dimension in a system the player already knows how to tune.

**Condition 3: Adversarial match depth.** The player must have completed at least 8 adversarial counterfactual analyses (4.39) against opponents with match history. This ensures the player has enough experience with the adversarial mode to understand what the Bloodhound is protecting them against.

When all three conditions are met, the Bloodhound Signal unlocks with a narrative beat:

> "You've been burned by a canary. You know the pre-ranking can be poisoned. A new diagnostic signal is now available: **Cross-Match Consistency** — the Bloodhound. It examines whether an element's suspiciousness is *too* consistent across the opponent's recent matches. Perfect consistency is imperfect evidence. Enable it in your pre-ranking weights."

---

## The Transparency Drawer Integration

When the Bloodhound Signal is active, the transparency drawer (4.58) gains a fourth section in its explanation:

```
▼ WHY IS THIS RANKED #1?
──────────────────────────────────────────────────────────────
RELAY-C was active at tick 52 — the pivot tick.              [◆ pivot: 0.78]
RELAY-C was modified 2 sessions ago (recent change).         [🕐 recency: 0.62]
RELAY-C produced 18 distinct states (volatility: 0.71).      [〜 volatility: 0.71]
RELAY-C scored inconsistently across opponent's last 5 matches. [🐕 consistency: 0.31]
   Match history: 0.12 → 0.78 → 0.45 → 0.91 → 0.33
   Coefficient of variation: 0.56 — no canary penalty applied.

Overall rank score: 0.74 (no Bloodhound adjustment)
```

Contrast with a canary element further down the list:

```
▼ WHY IS SCOUT-OMEGA RANKED #14?
──────────────────────────────────────────────────────────────
SCOUT-OMEGA was active at tick 52 — the pivot tick.          [◆ pivot: 0.91]
SCOUT-OMEGA was modified last session (recent change).       [🕐 recency: 0.88]
SCOUT-OMEGA produced 22 distinct states (volatility: 0.81).  [〜 volatility: 0.81]
SCOUT-OMEGA scored suspiciously consistently across 5 matches. [🐕 consistency: 0.94]
   Match history: 0.88 → 0.91 → 0.85 → 0.89 → 0.87
   Coefficient of variation: 0.03 — HIGH CANARY SUSPICION.
   Bloodhound penalty: -23% applied to base score.

Base score: 0.87 → Adjusted score: 0.67
Rank dropped from #1 (without Bloodhound) to #14 (with Bloodhound).
```

The critical line: **"Rank dropped from #1 to #14."** This is the moment the Bloodhound teaches its lesson. Without the fourth signal, SCOUT-OMEGA would have been the top candidate — the exact outcome the poisoner intended. With the Bloodhound active, the suspiciously consistent element is demoted, and the real vulnerability surfaces higher in the list.

The match history sparkline — `0.88 → 0.91 → 0.85 → 0.89 → 0.87` — is displayed as a miniature line chart in the drawer, five dots connected by thin lines. A flat line means suspicion. A jagged line means legitimacy. The player learns to read the shape before the numbers.

---

## The Weight Slider Integration (4.63)

The Bloodhound Signal appears as a fourth slider in the pre-ranking weight configuration panel:

```
PRE-RANKING WEIGHTS  [Season 12 Config]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pivot Activity    ████████████░░░░  66%  ────────────[◆]───
Recency           █████░░░░░░░░░░░  25%  ────[🕐]──────────
Volatility        ████░░░░░░░░░░░░   8%  ───[〜]───────────
Bloodhound        ████░░░░░░░░░░░░  25%  ───[🐕]───────────
                                        [Reset to default]
                                        [Save preset →]
```

The Bloodhound slider operates differently from the other three:

- **The other three sliders are positive weights** — higher weight means the signal contributes more to the base rank score.
- **The Bloodhound slider is a penalty intensity** — higher weight means a stronger demotion for consistent elements.

The slider label reflects this: instead of a percentage fill bar that grows from left to right (like the other three), the Bloodhound slider's fill bar is rendered in reverse — it fills from right to left, with a red-amber gradient instead of the standard signal colors. Dragging the Bloodhound slider right *increases* the penalty. The visual reversal communicates that this slider subtracts rather than adds.

**Named preset implications.** A preset can now encode four values instead of three:

```
PRESET: Anti-Canary Sweep
PA: 50% | R: 10% | V: 15% | BH: 40%
Description: Heavy Bloodhound penalty for suspected poisoned configs
```

Existing presets from before the Bloodhound unlock retain `BH: 0%` — the default Bloodhound weight for legacy presets is zero, preserving backward compatibility. The game surfaces a one-time prompt when the player first opens the weight panel after Bloodhound unlock: "Your existing presets don't include the Bloodhound signal. You can add it to any preset by editing it."

---

## Player Journeys

#### Journey: Naia, 31, Security Engineer, Gauntlet Season 4

**Context:** Naia is 120 hours in, deep in competitive Gauntlet play. She's been running adversarial counterfactual analysis against her upcoming opponent, a player called "dr_carabao" who has a reputation for elaborately poisoned configs. In her last three analyses of dr_carabao's setups, QUICK mode surfaced the same element — a relay unit called RELAY-SENTINEL — as the top vulnerability. Each time she targeted RELAY-SENTINEL, her counterfactual improvement was minimal. She suspects a canary. Tonight, the Bloodhound Signal unlocks.

**Minute 0:00 — The Unlock**

Naia opens the adversarial counterfactual panel. She's about to run another QUICK analysis against dr_carabao's latest match replay. Before she hits Run, a new notification pulses at the top of the transparency drawer — a warm amber badge she hasn't seen before:

A small card unfolds beneath the badge with the unlock message. The word "Bloodhound" appears in a typeface she associates with system-level upgrades — the same monospace used for the configurable weights header. Below the prose, a toggle: "Enable Cross-Match Consistency signal in pre-ranking. [Enable] [Learn more]"

She clicks Enable. The weight panel at the bottom of the drawer expands to show a fourth slider. The Bloodhound slider is already set to 25% — its default activation weight. The slider track is not amber or teal or violet. It is a dark copper, like dried blood on industrial metal. The thumb icon is a small angular dog silhouette — minimalist, almost glyph-like.

**Minute 0:45 — The First Bloodhound Scan**

Naia runs QUICK analysis. The pre-ranking fires with four signals now instead of three. Results load in 6 seconds.

Previous result (three signals): `#1 RELAY-SENTINEL — routing threshold +3 (score: 0.89)`
New result (four signals): `#1 INTERCEPTOR-KRIS — buffer saturation cap -1 (score: 0.72)`

RELAY-SENTINEL has dropped. Naia opens the transparency drawer for RELAY-SENTINEL, now ranked #11:

```
RELAY-SENTINEL scored suspiciously consistently across 5 matches.
   Match history: 0.91 → 0.88 → 0.90 → 0.89 → 0.91
   Coefficient of variation: 0.013 — HIGH CANARY SUSPICION.
   Bloodhound penalty: -25% applied to base score.
   Base score: 0.89 → Adjusted score: 0.67
```

She stares at the sparkline. Five nearly identical scores. RELAY-SENTINEL scored 0.88 to 0.91 against five different opponents with five different army compositions on five different maps. That flatline is impossible for a legitimate element whose importance should shift with conditions. RELAY-SENTINEL was built to always look guilty.

She checks INTERCEPTOR-KRIS's Bloodhound profile:

```
INTERCEPTOR-KRIS scored inconsistently across 5 matches.
   Match history: 0.22 → 0.71 → 0.15 → 0.84 → 0.68
   Coefficient of variation: 0.54 — no canary penalty applied.
```

The sparkline is a jagged mountain range. INTERCEPTOR-KRIS was irrelevant in two matches, critical in three. Its importance is context-dependent — the hallmark of a real functional element whose causal role varies with match conditions.

Naia feels the hair on her arms rise. This is real. The Bloodhound just identified the decoy and surfaced a genuine vulnerability that three signals alone had buried at rank #8.

**Minute 2:00 — The Verification**

She runs THOROUGH mode. 52 seconds. Result: "MINIMUM FIX: INTERCEPTOR-KRIS — buffer saturation cap -1. Counterfactual improvement: +14% pass rate."

THOROUGH confirms what the Bloodhound suggested. INTERCEPTOR-KRIS is the real vulnerability. RELAY-SENTINEL, the canary, doesn't appear in the top 20 of THOROUGH's results.

She whispers to herself: "Got you." She saves a new preset: "Canary Hunter — BH:40%, PA:45%, R:5%, V:10%."

**Minute 3:30 — The Strategic Implication**

Naia realizes something deeper. The Bloodhound doesn't just detect canaries in this match — it changes the economics of canary construction. If her opponent knows the Bloodhound exists, building a canary that scores identically across all matches becomes a liability. The opponent would need to engineer a canary whose scores *vary* across matches — a canary that looks inconsistent — which is much harder to build. A canary that must appear inconsistent is a canary that sometimes doesn't activate, which means it sometimes doesn't distract the pre-ranking, which means it's a worse canary.

The Bloodhound doesn't just detect canaries. It makes canaries more expensive to build.

She opens her own config and starts thinking about whether her own defensive canaries need redesigning.

**Minute 5:00 — Resolution**

She deploys the counterfactual fix against INTERCEPTOR-KRIS and wins the simulation at +14%. She queues a Gauntlet challenge against dr_carabao, confident for the first time that she can see through the decoys.

She posts in the competitive Discord channel: "Bloodhound is live. Anyone still running flat-consistency canaries is going to get shredded. Time to build variable-output decoys — and good luck making those actually distracting."

**What Naia wants to do next:** Figure out whether the Bloodhound can be fooled by a canary with engineered variance — a second-generation canary that intentionally fluctuates its scores to avoid the consistency penalty.

**UI Annotations:**
- Unlock badge: 24px amber circle with a copper dog silhouette, pulsing at 1.5-second intervals, positioned at the top-right of the transparency drawer header
- Bloodhound slider track: 200px wide, copper-colored rail (#8B4513 to #A0522D gradient), fill direction reversed (fills right-to-left), thumb is angular dog glyph at 12x12px
- Sparkline in drawer: 5 dots connected by 1px lines, rendered inline with the explanation text, 80px wide by 16px tall; flat sparklines are rendered in warning red (#C0392B), jagged sparklines in neutral grey (#7F8C8D)
- "Rank dropped" annotation: appears as a small red arrow pointing downward beside the adjusted score, with the original rank in strikethrough text: "~~#1~~ → #14"
- Canary suspicion label: "HIGH CANARY SUSPICION" rendered in uppercase monospace, copper-colored, 10px font, positioned on its own line beneath the coefficient of variation

---

#### Journey: Jun-Jun, 17, High School Student, Campaign Mission 10 (Escalation)

**Context:** Jun-Jun is 45 hours in, playing through the campaign. He's just reached Mission 10 — the Escalation mission set in Mindanao's dense upland terrain — where the enemy AI actively spoofs signals (5.14e). He unlocked the Bloodhound Signal two sessions ago but hasn't used it yet because he didn't understand what "cross-match consistency" meant. Tonight, the Escalation mission's spoofing AI forces his hand.

**Minute 0:00 — The Wall**

Jun-Jun's QUICK analysis returns: "FIRST VIABLE FIX: VANGUARD-ALPHA — attention filter priority +2."

He applies it. Pass rate drops from 44% to 38%. Worse. He runs QUICK again. Same result: VANGUARD-ALPHA. He applies a different mutation to VANGUARD-ALPHA. Pass rate: 36%. Even worse.

He's been here before — he recognizes the pattern from when he first learned about canaries in the adversarial surface tutorial (4.65). The enemy AI on Mission 10 is deliberately spoofing signals. VANGUARD-ALPHA is probably a decoy.

But he doesn't know which element is real. The three base signals are all pointing at the decoy. He remembers the Bloodhound unlock message from two sessions ago. He opens the weight panel.

**Minute 1:00 — The Discovery**

The fourth slider is there, set to 0% (he never touched it after unlock). He drags the Bloodhound slider to 25%.

Nothing happens to the results. He stares. Then he realizes: the Bloodhound needs match history. This is Mission 10 against an AI opponent. The AI doesn't have "previous matches" in the traditional sense.

But the game handles this. A tooltip appears when he hovers the Bloodhound slider: "AI opponents: consistency computed across the AI's 5 deployment variants for this mission. Each mission has multiple AI configurations — the Bloodhound checks whether this element scores consistently across all of them."

The results reshuffle. VANGUARD-ALPHA drops from #1 to #9. A new element surfaces: SIGNAL-WEAVER-3, a small relay node he barely remembers placing in his config. The transparency drawer shows:

```
VANGUARD-ALPHA:
   Consistency across 5 AI variants: 0.92 → 0.94 → 0.91 → 0.93 → 0.92
   Coefficient of variation: 0.01 — HIGH CANARY SUSPICION.

SIGNAL-WEAVER-3:
   Consistency across 5 AI variants: 0.11 → 0.67 → 0.05 → 0.82 → 0.38
   Coefficient of variation: 0.71 — no penalty.
```

Jun-Jun reads the sparklines. VANGUARD-ALPHA's line is flat — almost a ruler edge. SIGNAL-WEAVER-3's line is a mess, spiking and crashing. He's starting to get it: the flat line means the AI *designed* VANGUARD-ALPHA to always look suspicious. The jagged line means SIGNAL-WEAVER-3's importance actually depends on the situation.

**Minute 2:30 — The Aha**

He applies the SIGNAL-WEAVER-3 fix. Pass rate jumps from 38% to 67%. A massive improvement. He pumps his fist.

He opens the drawer again and reads the Bloodhound explanation more carefully. "Elements with suspiciously consistent high scores across diverse match conditions are down-weighted." He translates this into his own words: "If something looks guilty in every single fight, it's probably fake, because real problems depend on what happens in the fight."

This is the first time Jun-Jun has internalized a statistical reasoning concept — that consistency across diverse conditions is evidence of manipulation, not evidence of importance. He doesn't know the phrase "overfitting" but he's feeling it.

**Minute 4:00 — The Experimentation**

He cranks the Bloodhound slider to 60%. The results change again — more aggressively now, demoting several elements he'd been treating as important. VANGUARD-ALPHA is at rank #22.

He cranks it to 100%. The results are bizarre — nearly every high-scoring element has been penalized, and obscure low-activity elements have risen to the top. He's over-correcting. The Bloodhound at 100% treats *all* consistency as suspicious, including the natural consistency of genuinely important elements that happen to be important in most match conditions.

He dials it back to 30% and saves a preset: "Mission 10 Anti-Spoof."

**Minute 5:30 — Resolution**

He clears Mission 10 on his third attempt with the Bloodhound active. The post-mission debrief shows a stat he hasn't seen before: "Bloodhound detected 3 probable canary elements in this mission." He feels clever. He feels like he outsmarted the AI's trick by using a tool the game gave him.

He texts his classmate who also plays: "bro turn on the bloodhound for mission 10. the AI is spoofing you. look at the sparklines — flat line = fake."

**What Jun-Jun wants to do next:** Go back and replay earlier missions with the Bloodhound active to see if there were canaries he missed.

**UI Annotations:**
- AI variant tooltip: appears on hover over the Bloodhound slider when facing an AI opponent; explains the match history substitution in plain language; 200px wide tooltip with a small diagram showing "5 AI variants" as 5 small robot icons
- Over-correction warning: when Bloodhound slider exceeds 50%, a small amber warning appears below the slider: "High Bloodhound weight may penalize legitimately important elements. Recommended range: 15-35%." The warning is gentle, not blocking — the player can ignore it
- Post-mission canary count: appears in the mission debrief summary card as "Bloodhound detections: 3" with three small copper dog icons beside the number
- Sparkline comparison: when two sparklines are visible in the drawer simultaneously (scrolling between candidates), the flat vs. jagged contrast is immediately legible without reading numbers

---

#### Journey: Ate Lani, 52, Retired Teacher, Casual Evening Play, Session 88

**Context:** Ate Lani plays Robot Uprising casually, an hour before bed. She's patient and methodical, reads every tutorial, and takes handwritten notes in a spiral notebook beside her laptop. She unlocked the Bloodhound Signal recently but finds the statistical explanation intimidating. She understands the three base signals well — she's written "pivot = what was busy when it broke, recency = what I changed lately, volatility = what was fidgeting" in her notebook — but "coefficient of variation" means nothing to her. Tonight she encounters the Bloodhound in practice for the first time.

**Minute 0:00 — The Gentle Introduction**

Ate Lani is running adversarial counterfactual analysis against an opponent from a casual match she just finished. She hasn't touched the Bloodhound slider — it's at 0% by default. Her QUICK result surfaces PATROL-ECHO as the top vulnerability.

She opens the transparency drawer. The familiar three-signal explanation is there. Below it, a new section with a copper header she hasn't seen before:

```
🐕 CROSS-MATCH CONSISTENCY (Bloodhound — disabled)
This signal checks whether this element is equally suspicious across
multiple matches. Elements that are always suspicious may be decoys.
[Enable Bloodhound →]
```

The section is collapsed and dimmed. The "disabled" label is prominent. It doesn't require action — it's just there, waiting.

Ate Lani reads the description twice. She writes in her notebook: "Bloodhound = checks if something is always suspicious. Always suspicious = maybe fake." She clicks Enable.

**Minute 1:30 — The First Scan with Bloodhound**

The Bloodhound slider activates at 25%. The results reshuffle. PATROL-ECHO stays at #1 — its match history shows genuine variation (scores: 0.45, 0.82, 0.71, 0.23, 0.79). The Bloodhound confirms it's probably real.

But Ate Lani notices something in the drawer she didn't expect: a second element, BROADCAST-NODE-7, which was previously ranked #3, has risen to #2. Its drawer section shows:

```
🐕 CROSS-MATCH CONSISTENCY:
   Match history: 0.34 → 0.81 → 0.22 → 0.77 → 0.56
   Variation: moderate — this element's importance changes with conditions.
   No Bloodhound penalty.
```

And a third element, DECOY-ARRAY-X (previously #2), has dropped to #8:

```
🐕 CROSS-MATCH CONSISTENCY:
   Match history: 0.82 → 0.84 → 0.81 → 0.83 → 0.82
   Variation: very low — this element looks equally suspicious in every match.
   Bloodhound penalty applied: this may be a decoy element.
   ⚠ POSSIBLE CANARY
```

The amber warning icon and the plain-language "this may be a decoy element" is what Ate Lani needs. She doesn't understand coefficient of variation. She understands "this may be a decoy." She writes in her notebook: "DECOY-ARRAY-X — bloodhound says it's a fake. Same score every time."

**Minute 3:00 — The Notebook Moment**

Ate Lani draws a small table in her notebook:

```
Element          | Score every match? | Bloodhound says
PATROL-ECHO      | Different          | Real
BROADCAST-NODE-7 | Different          | Real
DECOY-ARRAY-X    | Same every time    | Fake (canary)
```

She stares at this table. She's deriving the principle from data, in her own handwriting. She writes below the table: "Real problems change with the situation. Fake problems stay the same."

This is the moment the Bloodhound Signal teaches its deepest lesson — and it doesn't require understanding statistics. The plain-language explanation and the visual sparkline were enough.

**Minute 4:30 — Resolution**

She applies the PATROL-ECHO fix. Pass rate improves. She's satisfied.

She doesn't experiment with the Bloodhound slider weight. She leaves it at 25%. She trusts the default. But she looks at the sparklines every time she opens the drawer now. Flat line = suspicious. Jagged line = probably real. She's reading the shape, not the numbers.

Three sessions later, she encounters a match where the Bloodhound doesn't flag anything — all elements have moderate variation. She writes in her notebook: "Not every opponent uses canaries. Bloodhound is quiet when there's nothing fake."

**What Ate Lani wants to do next:** She wants a simple "canary count" displayed somewhere before she runs the analysis — how many suspected canaries are in this opponent's config? She doesn't want to open every drawer to find them.

**UI Annotations:**
- Disabled state: the Bloodhound section in the drawer is rendered at 40% opacity with a thin dashed copper border; the "Enable Bloodhound" link is teal, matching other interactive elements; clicking it activates the slider and triggers a 300ms fade-in of the section to full opacity
- Plain-language mode: for players below 100 hours of play (or who have "plain language" toggled in accessibility settings), the drawer uses "Variation: very low" instead of "Coefficient of variation: 0.013" and "this may be a decoy element" instead of "HIGH CANARY SUSPICION"; the statistical language is still available via a "[Show details]" toggle within the explanation block
- Warning icon: the amber triangle with "POSSIBLE CANARY" label appears only for elements with consistency score above 0.85; it is the single most important visual element in the Bloodhound system — it must be visible without scrolling when the drawer is open
- Sparkline rendering: 5 dots on a 80x16px canvas; dots are 3px circles; connecting lines are 1px; the vertical axis auto-scales per element (not global), so a sparkline for scores [0.81, 0.84, 0.82, 0.83, 0.82] looks flat, and a sparkline for [0.22, 0.71, 0.15, 0.84, 0.38] looks dramatic, reinforcing the visual contrast between suspicious and legitimate elements

---

## Strengths

**Directly addresses the canary problem without removing canaries from the game.** The Bloodhound doesn't eliminate canary poisoning as a strategy — it adds a diagnostic counter-tool. Canaries remain a valid tactic for adversarial config design. The Bloodhound makes them harder to deploy and more interesting to design around. The adversarial meta-game gains a new layer: canary design must now account for the consistency signal, which means canaries must be *variable* canaries, which are harder and more expensive to build. This is an arms-race dynamic that enriches competitive play.

**Teaches a transferable statistical reasoning principle.** "Consistency across diverse conditions is evidence of manipulation" is a principle that applies to spam detection (a link that appears in every spam email regardless of content is probably the spam payload), financial fraud (a trader who profits equally in bull and bear markets is probably cheating), and adversarial machine learning (a feature with suspiciously stable importance across all training splits may be a data leak). The Bloodhound makes this principle tangible.

**Integrates cleanly with the existing weight system.** The fourth slider is a natural extension of 4.63. Players who already understand the three-signal weight configuration system can immediately grasp the Bloodhound slider — it's the same pattern, applied to a penalty instead of a boost. The slider metaphor carries.

**Has a graceful degradation path for casual players.** At default weight (25%), the Bloodhound provides moderate canary detection without aggressive re-ranking. A player who enables it and never touches the slider still gets meaningful protection against obvious canaries. The system is useful at its default setting — slider tuning is optional depth.

**The sparkline is a powerful visual teaching tool.** Before the player reads any numbers, they can see the shape. Flat = suspicious. Jagged = legitimate. This visual heuristic is accessible to players who will never engage with coefficient of variation as a concept — including younger players and players without STEM backgrounds. The sparkline is the Bloodhound's most important UI element.

---

## Weaknesses

**Requires opponent match history, which may not always be available.** In campaign mode against AI opponents, the game can synthesize "AI variants" to provide the necessary data. But in casual PvP where both players are new or where match history is limited, the Bloodhound degrades to unusable. A signal that only works in some contexts is a signal the player can't rely on — they must remember when it's active and when it isn't.

**Creates a false sense of security against sophisticated canaries.** A second-generation canary — one engineered with variable output across matches — will evade the Bloodhound entirely. A poisoner who knows the Bloodhound exists can build canaries that intentionally fluctuate their scores across matches, producing a jagged sparkline that mimics a legitimate element. The Bloodhound only catches *naive* canaries. Expert players who rely on it against expert poisoners will be fooled by a different trick.

**The coefficient of variation is genuinely confusing for many players.** Even with plain-language alternatives, the underlying math is not intuitive. "Why is 0.03 suspicious and 0.54 not?" requires understanding normalization. The sparkline visual mitigates this, but players who want to understand the *numbers* face a steep conceptual cliff. The game must decide: does it teach the math, or does it hide the math behind sparklines and plain language?

**The 5-match window creates a gaming opportunity.** An opponent who knows the Bloodhound checks their last 5 matches can deliberately play 2-3 matches with a radically different config (making the canary's score vary), then switch to the real poisoned config for the competitive match. The 5-match window now includes the "cover" matches, inflating the canary's variance and defeating the Bloodhound. The window size is a tunable parameter, but any fixed window can be gamed with enough matches.

**Four signals may be one too many for the weight configuration panel.** Three sliders were already a complex interface. Four sliders — where the fourth operates on a different axis (penalty vs. boost) — may push the configuration panel past the complexity threshold where players disengage. The Bloodhound slider's reversed fill direction helps communicate the difference, but it's an additional cognitive load.

---

## Interaction Effects

**With 4.63 (Player-configurable pre-ranking weights):** This is the primary integration point. The Bloodhound is a fourth slider in the weight system, but it operates differently — as a penalty multiplier rather than a signal weight. The weight panel's visual design must communicate this distinction clearly. The recommended approach: the three signal sliders are grouped together under a "SIGNAL WEIGHTS" sub-header; the Bloodhound slider sits below a thin divider under a "CANARY DETECTION" sub-header. This grouping makes the architectural difference legible without requiring the player to understand multiplicative penalties.

**With 4.65 (Pre-ranking adversarial surface):** The Bloodhound is the mechanical answer to the problem 4.65 describes. Where 4.65 maps the attack surface (how canaries are built, what signals they exploit), the Bloodhound is the defense tool. The two aspects should be presented narratively in sequence: 4.65 teaches the player that canaries exist and how they work; 4.98 gives the player a tool to detect them. The campaign's Escalation mission (M10) is the natural setting for this sequence.

**With 4.58 (Pre-ranking transparency panel):** The Bloodhound section in the drawer is a fourth explanation block. The drawer's progressive disclosure design must accommodate this without feeling bloated. Recommendation: the Bloodhound section is collapsed by default even when the drawer is open — the player sees the three familiar signal explanations plus a one-line Bloodhound summary ("Consistency check: no canary suspicion" or "Consistency check: possible canary detected"). Expanding the Bloodhound line reveals the sparkline, coefficient of variation, and penalty details.

**With 4.64 (Pre-ranking accuracy as displayed stat):** When the Bloodhound is active, accuracy statistics should be tracked separately: "QUICK accuracy (3-signal): 71%; QUICK accuracy (4-signal with Bloodhound): 78%." If the Bloodhound improves accuracy against poisoned opponents, the delta is the empirical proof that it works. If it doesn't improve accuracy (or worsens it against non-poisoning opponents), the player has evidence to dial it down.

**With 4.92 (Kiln Grid — weight performance heatmap):** The Kiln Grid gains a new dimension. If presets now have four parameters, the heatmap could show Bloodhound-on vs. Bloodhound-off accuracy for each mission type. Against Escalation missions (M10), Bloodhound-on should dramatically outperform Bloodhound-off. Against early campaign missions with no canaries, the two should be roughly equal. This mission-type-dependent value reinforces the Kiln Grid's core lesson: no configuration is globally optimal.

**With 5.14e (Fidelity spoofing campaign arc):** The Escalation missions explicitly use AI-driven signal spoofing. The Bloodhound's unlock could be timed to the campaign progression — unlocking just before or during the Escalation arc, when the player needs it most. This creates a narrative beat: the player has been gradually learning about pre-ranking manipulation, and the Bloodhound arrives as the culminating tool in that learning arc.

**With 4.60 (Search budget as resource):** The Bloodhound's 5-match retroactive computation has a cost. Each match history lookup requires re-evaluating pre-ranking scores for all elements in 5 historical matches. This could consume search budget, creating a resource trade-off: the Bloodhound provides better canary detection but costs more compute. Players must decide whether the protection is worth the budget hit. Alternatively, the Bloodhound cost could be fixed and separate from search budget — a "subscription cost" rather than a per-analysis cost.

---

## Comparable Games and Media

**Poker tell detection — "too consistent" as a signal.** In competitive poker, an experienced player watches for tells. But a tell that appears too consistently — a player who *always* scratches their nose before bluffing — raises suspicion of a reverse tell: a deliberate signal designed to mislead. Good poker players learn that genuine tells are inconsistent across hands because genuine emotional leakage varies with context. The Bloodhound Signal formalizes this principle: a "tell" (high pre-ranking score) that appears identically across diverse conditions is probably manufactured.

**Spam filter evolution — Bayesian classifiers and adversarial adaptation.** Early Bayesian spam filters flagged emails containing certain words (the equivalent of high pivot-activity). Spammers responded by adding legitimate-looking content to their emails (canary construction). Filters evolved to check consistency across the sender's email history — does this sender always score the same on suspicious word frequency regardless of email topic? This is exactly the Bloodhound: a second-order check on whether the first-order signal is being gamed.

**Counter-Strike: Global Offensive — Overwatch system and suspicious consistency.** Valve's anti-cheat review system flags players whose accuracy statistics are suspiciously consistent across matches. A legitimate player's accuracy varies with map, opponent skill, weapon choice. An aimbot produces nearly identical accuracy regardless of conditions. The consistency check is the same principle: genuine performance varies with context; artificial performance does not.

**The Wire, Season 1 — Lester Freamon's "follow the money" principle.** In the show, the police initially follow the drug dealers' visible activity (the equivalent of pivot-tick activity). Freamon teaches them to follow the money — a signal that is harder to fake because it has real consequences. The Bloodhound teaches the same lesson: pivot-activity, recency, and volatility are surface signals that can be faked. Cross-match consistency is a meta-signal about the *behavior of the surface signals* — harder to game because it requires controlling your element's appearance across multiple independent contexts.

**Machine learning — out-of-distribution detection and ensemble disagreement.** In ML safety research, a common technique for detecting adversarial inputs is to check whether multiple models agree on the classification. If all models consistently classify an input identically despite diverse training data, the input may be adversarially constructed to exploit a shared vulnerability. If models disagree, the input is likely genuine but ambiguous. The Bloodhound is an ensemble disagreement detector: it checks whether the pre-ranking's assessment of an element is consistent across the "ensemble" of different match conditions.

**Among Us — the player who is "too helpful."** In the social deduction game, experienced players learn to suspect crewmates who are suspiciously consistent in their helpfulness — always completing tasks visibly, always reporting bodies first, always providing alibis. This consistency is a strategy an impostor uses to appear trustworthy. Genuine crewmates vary in their behavior because they're reacting to the specific conditions of each round. The principle transfers: consistency of apparent value is suspicious in adversarial contexts.

---

## Sensory Description

**The Bloodhound slider's visual identity:**

The slider track is 200px wide, like its three siblings, but its color is distinct from the signal-coded amber, teal, and violet. The track is **dark copper** — the color of oxidized bronze, of old machinery, of a tool that has seen use. The gradient runs from a warm brown (#6D4C41) on the left (minimum penalty) to a burnt sienna (#8B4513) on the right (maximum penalty). This is not a signal color. This is a detection color. The three signal sliders say "look here." The Bloodhound slider says "don't trust that."

The thumb icon is a small angular dog head in profile — two triangular ears, a pointed snout, one dot for an eye. 12x12 pixels. Copper on dark. When the player drags the thumb, the fill bar extends from right to left — the opposite direction from the other three sliders. This visual reversal is deliberate and unsettling on first encounter. The player's hand moves right. The bar fills left. The penalty grows. There is a 0.5-second adjustment period where the player recalibrates their spatial model. This dissonance is the point: the Bloodhound operates on a different axis than the other signals.

**The sparkline in the transparency drawer:**

Five dots. Connected by hairline threads. The entire visualization is 80px wide and 16px tall — a thumbnail embedded in the explanation text, not a chart in a panel. The dots are 3px circles, filled with the copper Bloodhound color.

For a canary element (flat sparkline): the five dots form a nearly straight horizontal line. The line is rendered in warning red (#C0392B). The flatness is alarming. It looks like an EKG flatline — a visual metaphor the player absorbs before they read the coefficient of variation. Dead-flat consistency. Something is wrong.

For a legitimate element (jagged sparkline): the five dots form a mountain range — peaks and valleys, dramatic swings. The line is rendered in neutral grey (#7F8C8D). The jaggedness feels alive, organic, like a real heartbeat. This element's importance changes with conditions. It is breathing.

The contrast between a red flatline and a grey heartbeat is the Bloodhound's single most powerful teaching moment. The player doesn't need to understand coefficient of variation. They need to see flat-red vs. jagged-grey and ask: "Why is flat bad?"

**The "POSSIBLE CANARY" warning:**

When the Bloodhound flags an element (consistency score above 0.85), a small amber triangle appears beside the element's name in the results list — before the drawer is opened. The triangle is 10px, copper-amber, with an exclamation mark inside. It is the visual equivalent of a dog's hackles rising. Something is off about this candidate.

Inside the drawer, the warning expands into a line: "POSSIBLE CANARY" in 10px uppercase monospace, copper-colored, positioned below the sparkline. The label is stark and unambiguous. There is no hedge — "possible" is the only softener. The label does not say "likely canary" or "confirmed canary" because the Bloodhound cannot confirm — it can only suspect. The distinction between suspicion and confirmation is load-bearing. The player must still decide whether to trust the Bloodhound or override it.

**The sound of the Bloodhound activating:**

When the player first enables the Bloodhound slider (dragging from 0% to any positive value), a brief audio cue plays: a low, resonant hum — like a tuning fork struck against dark metal. The hum lasts 400ms, fading from a grounded bass frequency (around 120Hz) to silence. It sounds like something waking up. Not an alarm, not a notification — an activation. The Bloodhound is now listening.

When the results reshuffle due to the Bloodhound penalty, the card-sliding animation has a subtle additional audio layer: a faint metallic scraping sound, like copper plates shifting against each other. The scraping is mixed at 20% volume — barely perceptible — but it gives the reshuffle a different texture from the standard weight-adjustment reshuffle (which uses a soft paper-shuffling sound). The player learns to associate the copper scraping with "the Bloodhound just moved something."

**The emotional texture:**

The three base signals feel analytical — they are measuring the element's behavior in this match. The Bloodhound feels *investigative*. It is looking not at this match but across matches. It is looking at patterns the element's designer might have left. It is, for the first time in the pre-ranking system, suspicious of intent rather than measuring behavior.

Enabling the Bloodhound changes the emotional register of the transparency drawer from "diagnostic tool" to "counter-intelligence tool." The drawer is no longer just explaining the ranking — it is warning you about manipulation. The copper color, the reversed slider, the red flatline sparkline, the "POSSIBLE CANARY" label — all of these elements create a tone of cautious vigilance. The player is no longer a diagnostician. They are a detective.

---

## Discovered New Aspects

1. **4.99 — Second-generation canary design: variable-output decoys.** If the Bloodhound catches flat-consistency canaries, expert poisoners will build canaries with engineered variance — elements designed to fluctuate their pre-ranking scores across matches to avoid the consistency penalty. This requires more complex canary construction (conditional behavior that changes with opponent archetype) and creates a deeper adversarial arms race. Teaching: the defense creates a new offense; the offense creates a new defense. The signal-poisoning meta-game is an infinite regress.

2. **5.00 — Bloodhound confidence indicator and data sufficiency display.** When the opponent has fewer than 5 matches, the Bloodhound operates with degraded confidence. A visual confidence indicator — from full copper (5/5 matches) to faded grey (2/5 matches) to absent (1/5 matches) — communicates how much the player should trust the Bloodhound's output. Teaching: a tool's reliability depends on the data it has access to. Insufficient data produces unreliable signals. This is directly analogous to statistical power in hypothesis testing.

3. **5.01 — Canary census: pre-analysis summary of suspected decoys.** Before running the full counterfactual analysis, a lightweight Bloodhound pre-scan counts suspected canaries in the opponent's config: "3 elements show high cross-match consistency. Bloodhound recommended." This gives the player a reason to enable the Bloodhound before they see results — currently, they only learn about canaries after running the analysis. The census converts the Bloodhound from a reactive tool to a proactive recommendation.

4. **5.02 — Bloodhound training mode: historical canary identification.** A practice mode where the player reviews their own past adversarial analyses and the Bloodhound retroactively highlights which elements were likely canaries. "In Session 41, you targeted RELAY-SENTINEL. The Bloodhound would have flagged it as a canary (consistency: 0.96). The real vulnerability was INTERCEPTOR-KRIS (consistency: 0.31)." This gives the player a history of their own deception — every time they were fooled — and shows what the Bloodhound would have caught.

5. **5.03 — Consistency signal genealogy: why is this element consistent?** A deep-dive panel that explains *why* a flagged element has consistent scores — "SCOUT-OMEGA scores high on pivot-activity in every match because it has 6 hooks that fire during the pivot window regardless of match conditions. Its recency is always high because it was edited before each of the last 5 matches. Its volatility is always high because it has 12 conditional rules that fire in sequence." This genealogy converts the Bloodhound from "this is suspicious" to "here is how the canary was built," teaching the construction principles of signal manipulation.
