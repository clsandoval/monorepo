# Adaptive Weight Suggestion from Divergence History

**Aspect:** 4.88 — Adaptive weight suggestion from divergence history: after 10+ divergence events, the game surfaces a data-driven weight recommendation ("your pre-ranking accuracy improves 23% when recency is below 20% in sessions with ≤2 config changes"); automatic prior recommendation from empirical session data; teaches Bayesian updating of diagnostic priors; interaction with 4.63 and 4.64

**Parent:** 4.63 — Player-configurable pre-ranking weights
**Siblings:** 4.89 — Weight import/export as config file; 4.90 — Weight configuration persistence across campaign chapters; 4.91 — Visual weight interpolation animation; 4.92 — Per-mission-type weight performance heatmap
**Prerequisites:** Player must have (a) unlocked configurable weights (4.63 unlock gate — 3+ divergence events), (b) accumulated 10+ divergence events across sessions, and (c) used at least two distinct weight configurations so the system has comparative data.
**Related:** 4.64 — Pre-ranking accuracy as displayed stat; 4.58 — Pre-ranking transparency panel; 4.61 — QUICK vs. THOROUGH explainer; 4.92 — Per-mission-type weight performance heatmap; 8.08 — Real-language vocabulary claim; 8.09 — Diagnostic layer as teaching arc

---

## The Core Concept

After 10 or more divergence events — sessions where QUICK mode's pre-ranked #1 candidate did not match THOROUGH mode's minimum fix — the game has accumulated enough failure data to detect patterns. It can now answer a question the player has probably been asking themselves: *under what conditions does my pre-ranking configuration fail, and what configuration would have succeeded?*

The adaptive weight suggestion system performs a retrospective analysis across the player's divergence history. It identifies correlations between weight configurations, session context variables (number of config changes since last session, mission type, architectural complexity), and divergence outcomes. When it finds a statistically meaningful pattern, it surfaces a plain-language recommendation in the pre-ranking weight panel.

### What Data the System Collects

For every session where QUICK and THOROUGH are both run, the system records:

1. **Weight configuration at time of analysis** — the three slider values (pivot-activity, recency, volatility) the player had active
2. **Divergence outcome** — did QUICK #1 match THOROUGH minimum? If not, what was the rank of the minimum fix in the pre-ranked list?
3. **Session context variables:**
   - Config changes since last session (0, 1, 2, 3+)
   - Mission type classification (wave tier, relay-heavy, armor-heavy, etc.)
   - Architectural complexity metric (hooks × agents)
   - Time since last config modification (sessions)
   - Number of agents in active config
4. **Counterfactual weight scores** — for each divergence event, the system retroactively computes what rank the minimum fix *would have received* under alternative weight configurations (e.g., "if recency had been 0%, RELAY-C would have been ranked #1 instead of #3")

This counterfactual computation is the key technical mechanism. The system doesn't just track what happened — it simulates what *would have happened* under different weight settings. This creates a dataset of (context, weights, outcome) triples that can be mined for conditional patterns.

### How Recommendations Are Computed

The system uses conditional accuracy analysis. For each divergence event, it asks: "Given the session context at that time, which weight configuration would have produced a match?" It then aggregates across all divergence events to find weight-context pairs that consistently improve accuracy.

A recommendation is surfaced when the system finds a pattern with:
- **Statistical confidence**: at least 8 supporting divergence events (not all 10 — some events may not fit the pattern)
- **Magnitude**: the alternative weight configuration would have improved accuracy by at least 15 percentage points over the player's actual configuration in matching contexts
- **Actionability**: the recommendation involves adjusting a single weight dimension by a meaningful amount (not "change everything")

The recommendation is phrased as a conditional: "When [context condition], your accuracy improves [X]% if [weight adjustment]." This conditional framing is deliberate — it teaches the player that heuristic configuration is context-dependent, not globally optimal.

### When Suggestions Surface

Suggestions appear in the pre-ranking weight panel (inside the transparency drawer from 4.63) at the moment the player opens it. They do not interrupt gameplay. They do not appear during the Sealed Watch (Act 1). They appear only in the Inspector (Act 2) context, when the player has already shifted into analytical mode.

The first suggestion appears after the 10th divergence event. Subsequent suggestions appear when new patterns are detected or when existing patterns strengthen with additional data. The system never surfaces more than one suggestion per session — cognitive load discipline.

A suggestion expires (stops appearing) after the player has seen it three times without acting on it, or after the player explicitly dismisses it. Dismissed suggestions can be reviewed in the career stats panel under a "Past Recommendations" section.

### How the UI Presents Suggestions

The suggestion appears as a card inserted below the weight sliders in the transparency drawer, visually distinct from the slider controls:

```
┌─────────────────────────────────────────────────────────────┐
│ ◈ SUGGESTED ADJUSTMENT                                      │
│                                                              │
│ In sessions where you made ≤2 config changes,               │
│ setting recency below 20% improved your pre-ranking          │
│ accuracy by 23%.                                             │
│                                                              │
│ Based on 11 divergence events with similar context.          │
│                                                              │
│ [Apply this adjustment]  [Show me the data]  [Dismiss]       │
└─────────────────────────────────────────────────────────────┘
```

The card has a thin left border in a warm gold color — not amber (which is pivot-activity) or teal (which is recency) or violet (which is volatility), but gold: a neutral advisory color that says "recommendation" without claiming any specific signal identity.

Three actions are available:

1. **Apply this adjustment** — sets the recency slider to the suggested value (e.g., 15%) and triggers the results list reshuffle. The player immediately sees the effect. This is a one-click action, not a permanent change — the player can undo with Reset to Default or Ctrl+Z.

2. **Show me the data** — expands the card to reveal the underlying analysis: a mini-table showing each supporting divergence event, the weight configuration used, what the outcome was, and what the outcome would have been under the suggested configuration. This is the empirical evidence. The player can inspect every data point behind the recommendation.

3. **Dismiss** — collapses the card with a brief fade. The suggestion is marked as dismissed and will not reappear for this pattern. A small "1 dismissed suggestion" counter appears at the bottom of the weight panel, clickable to review.

---

## The Bayesian Updating Parallel

This is the teaching heart of the mechanic, and it must be made explicit.

The player's weight configuration is a **prior** — a belief about which diagnostic signals matter most, established before seeing the current session's data. When the player sets recency to 25%, they are saying: "I believe recent changes are moderately important for identifying root causes."

A divergence event is **evidence** — an observation that the prior was wrong in this specific instance. The minimum fix was not the element the prior predicted.

The adaptive weight suggestion is a **posterior update** — a revised belief, computed from the prior and the accumulated evidence. "Given that your prior (recency at 25%) was wrong in 11 sessions where you hadn't made many config changes, here is a revised prior (recency below 20%) that would have been correct more often."

This is Bayes' theorem as a game mechanic. The system is doing what a Bayesian agent does: collecting observations, updating beliefs conditional on context, and recommending revised priors. The player who engages with adaptive suggestions is practicing Bayesian reasoning, even if they never hear the word "Bayesian."

The "Show me the data" expansion makes this pedagogically complete. The player can see the evidence behind the posterior. They can evaluate whether the evidence is convincing. They can choose to accept or reject the update. This is not the game telling the player what to believe — it is the game showing the player how beliefs should be revised in light of evidence, and letting the player decide.

The conditional framing ("in sessions where you made ≤2 config changes") teaches an additional concept: **conditional priors**. The optimal belief about recency depends on the context. When the player is actively iterating on their config, recency is a strong signal — recent changes are likely culprits. When the player has a stable config, recency is noise — nothing was changed recently, so "recent change" can't distinguish candidates. The suggestion teaches this context-dependence directly.

---

## Player Journeys

#### Journey: Tomás, 34, backend engineer, Session 41
**Context:** Tomás has been playing for five weeks. He unlocked configurable weights at session 22 (documented in 4.63 journey) and has been using his "Stable Config — ignore recency" preset for 15 sessions. He has accumulated 14 divergence events total. Tonight he opens the Fix Explorer after a narrow loss on a relay-heavy mission.

**Minute 0:00 — The Suggestion Appears**

Tomás runs QUICK mode. Result: "FIRST VIABLE FIX: STRIKER-A — rule priority reorder." He's skeptical — this doesn't feel right. He opens the transparency drawer to check the pre-ranking reasoning.

Below the weight sliders, something new. A card with a thin gold left border:

```
◈ SUGGESTED ADJUSTMENT

In sessions where you made ≤2 config changes,
setting recency below 20% improved your pre-ranking
accuracy by 23%.

Based on 11 divergence events with similar context.

[Apply this adjustment]  [Show me the data]  [Dismiss]
```

Tomás reads it carefully. He hasn't changed his config in three sessions. He's currently using his "Stable Config" preset, which already has recency at 0%. Wait — the suggestion says "below 20%" and he's already at 0%. The suggestion is confirming what he already does.

He clicks "Show me the data."

**Minute 0:45 — The Evidence Table**

The card expands. A compact table appears:

```
DIVERGENCE EVENTS (config changes ≤2)
──────────────────────────────────────────────────────────
Session  Your Recency  Outcome           If Recency <20%
  S24      25%         Diverged (rank 4)  Would match (#1)
  S26      25%         Diverged (rank 3)  Would match (#1)
  S28       0%         Matched            Matched
  S31       0%         Matched            Matched
  S33      25%         Diverged (rank 2)  Would match (#1)
  S35       0%         Matched            Matched
  S37       0%         Diverged (rank 2)  Still diverged
  S38      25%         Diverged (rank 5)  Would match (#1)
  S39       0%         Matched            Matched
  S40       0%         Matched            Matched
  S41       0%         Matched            Matched
──────────────────────────────────────────────────────────
Your accuracy (actual):        64%  (7/11)
Your accuracy (if <20%):       82%  (9/11)
```

Tomás stares at this. Two things jump out:

First, sessions where he used 25% recency (before he created his preset) consistently diverged. Sessions where he used 0% mostly matched. The data supports what he already intuited — recency is noise when he's not actively iterating.

Second, even with recency at 0%, session S37 still diverged. The suggestion improved accuracy from 64% to 82%, not to 100%. The remaining 18% are failures the weight adjustment can't fix — they're caused by something deeper than signal weighting.

**Minute 2:00 — The Realization**

Tomás dismisses the suggestion — he's already following it. But the data table taught him something new: the suggestion system is showing him a *conditional posterior*. It's not saying "recency should always be low." It's saying "when your config is stable, recency should be low." He thinks about sessions where he IS actively iterating — in those sessions, recency at 50% might be correct.

He creates a mental model: "I need different priors for different contexts. The game is learning my patterns and telling me which prior fits which context."

He realizes this is what he does at work with monitoring alerts. When the team is in a deploy freeze, he adjusts alert thresholds differently than during active deployment. The game just taught him that this principle has a name: conditional priors.

**Minute 3:30 — Resolution**

Tomás saves a note in his session log: "The suggestion system is a Bayesian updating engine. It watches my failures, finds context-dependent patterns, and recommends revised priors. My job is to evaluate the evidence and decide whether to accept the update. This is exactly how I should be thinking about alert threshold configuration at work."

He types in the community Discord: "The adaptive suggestion system just confirmed my preset config with data. More interesting: it showed me that even the optimal weights still diverge 18% of the time. Some failures are structurally invisible to weight tuning."

**UI Annotations:**
- Suggestion card: 280px wide, flush with slider panel width; gold left border (3px, #c9a84c); background slightly warmer than the drawer background (#faf8f4 vs. #f5f5f5)
- "Show me the data" expansion: the card grows downward with a 200ms ease-out; the table uses monospace type for alignment; the "Your accuracy" summary row has a thin top border separating it from the event rows
- Session numbers in the table are teal hyperlinks — clicking any session number opens that session's full debrief in a side panel (if available in session history)
- The "Would match (#1)" cells are in soft green text; "Still diverged" cells are in dim amber; "Matched" cells are in neutral grey

---

#### Journey: Kira, 26, data analyst, Session 55 — "The Suggestion I Shouldn't Follow"
**Context:** Kira is an experienced player with a complex eight-agent architecture. She plays competitively and has a 79% pass rate. She has 18 divergence events. She uses a custom weight preset ("Kira's Balanced" — pivot 55%, recency 30%, volatility 15%) and rarely changes it. Tonight a suggestion appears that seems wrong.

**Minute 0:00 — The Counterintuitive Suggestion**

Kira opens the transparency drawer after a divergence event. The suggestion card reads:

```
◈ SUGGESTED ADJUSTMENT

In relay-heavy missions, setting volatility above 40%
improved your pre-ranking accuracy by 31%.

Based on 9 divergence events on relay-heavy missions.

[Apply this adjustment]  [Show me the data]  [Dismiss]
```

Kira's volatility is at 15%. The suggestion wants her to nearly triple it. She's skeptical — she's always considered volatility the least useful signal. High-volatility elements are noisy by definition; ranking them higher seems like chasing noise.

She clicks "Show me the data."

**Minute 0:30 — The Uncomfortable Evidence**

The evidence table shows 9 relay-heavy mission divergence events. In 7 of them, the minimum fix was a relay agent with high volatility (0.65+) that her pre-ranking consistently ranked below position #3. The relays were volatile because they were doing their job — compressing, routing, buffering — and the failures were caused by the specific *pattern* of their volatility (buffer saturation at specific intervals), not by their presence at the pivot tick.

Her current weights undervalue volatility, so the pre-ranking ranked these relays low. With volatility at 40%, the pre-ranking would have surfaced the correct relay in 6 of the 7 cases.

Kira sits with this. The data is clear. But she doesn't understand *why* volatility matters for relay missions. She needs to think about it.

**Minute 2:00 — The Hypothesis**

She constructs a hypothesis: relay agents in her architecture are inherently volatile because they handle variable traffic. In most missions, this volatility is normal and not diagnostic. But in relay-heavy missions — where the failure is almost always a relay issue — the *degree* of volatility becomes the discriminating signal. A relay that's unusually volatile (compared to its own baseline) is the one that's overloaded.

She decides to test this. She clicks "Apply this adjustment." The recency slider doesn't move. The volatility slider animates from 15% to 40%. The results list reshuffles.

The minimum fix — RELAY-D, buffer compression rate — jumps from rank #6 to rank #2. Not #1 (the pivot-activity signal still favors a different element), but close. Much closer than rank #6.

**Minute 3:00 — The Selective Adoption**

Kira doesn't change her default preset. Instead, she creates a new preset: "Relay Missions — high volatility" with pivot 45%, recency 15%, volatility 40%. She'll use this preset specifically for relay-heavy missions and keep her balanced preset for everything else.

She has just created a context-dependent prior configuration — different beliefs for different mission types. The suggestion system didn't force this. It surfaced a pattern. She evaluated the evidence. She created a targeted response.

**Minute 4:30 — The Doubt**

Three sessions later, using her new relay preset, she gets two matches in a row on relay missions. But on the third relay mission, the high-volatility configuration surfaces a false positive — a relay that was volatile but NOT the root cause. The minimum fix was a non-relay agent (SCOUT-B) with low volatility.

The suggestion improved her relay-mission accuracy from 33% to 67%. Not perfect. The remaining failures are cases where the volatility heuristic is fooled by normally-volatile relays.

She posts on Discord: "The suggestion system told me to increase volatility for relay missions. It was right 2/3 of the time. The other 1/3, it made things worse. Context-dependent priors are better than global priors, but they're still priors — they can still be wrong."

**UI Annotations:**
- "Apply this adjustment" animation: the relevant slider thumb (volatility, violet waveform icon) animates from its current position to the suggested position over 400ms with a gentle ease-out; the percentage label counts up smoothly (15% → 16% → ... → 40%)
- During slider animation, the results list cards begin their reshuffle 200ms after the slider starts moving — so the player sees the slider move first, then the consequences unfold; creates a cause-then-effect temporal sequence
- New preset save dialog: appears as a thin inline text field below the sliders when the player has applied a suggestion and the weights differ from any saved preset; placeholder text: "Save as new preset..."

---

#### Journey: Diego, 40, casual player, Session 35 — "The Suggestion That Did My Thinking For Me"
**Context:** Diego plays two sessions per week, casually. He unlocked weight configuration at session 25 but has never touched the sliders — he uses the default weights. He has accumulated 12 divergence events, mostly without noticing them. Tonight a suggestion appears for the first time.

**Minute 0:00 — The Unfamiliar Card**

Diego opens the Fix Explorer, runs QUICK mode, gets a result. He opens the transparency drawer because the tutorial tip is still suggesting he should. Below the sliders he's never used, a gold-bordered card:

```
◈ SUGGESTED ADJUSTMENT

In your recent sessions, setting pivot activity above 80%
improved your pre-ranking accuracy by 19%.

Based on 10 divergence events.

[Apply this adjustment]  [Show me the data]  [Dismiss]
```

Diego reads it once. He doesn't fully understand what "pivot activity above 80%" means. But he sees "improved accuracy by 19%" and "Apply this adjustment." He clicks Apply.

The pivot-activity slider animates from 66% to 82%. The results list reshuffles. Diego doesn't track which candidates moved — he just sees the list change.

**Minute 0:30 — The Thoughtless Adoption**

Diego applies the QUICK result (now different from what it would have been with default weights). He plays the next mission. Pass rate improves slightly. He attributes this to the suggestion.

Next session: same suggestion card appears (it persists until dismissed or applied permanently). He clicks Apply again without reading. He's treating the suggestion as an instruction, not a hypothesis. The game said to do it, so he does it.

**Minute 1:00 — The Dependency Pattern**

Over four sessions, Diego clicks Apply every time the suggestion appears. His pre-ranking accuracy does improve — from 64% to 73% on matching contexts. But he has no idea why. He doesn't know what pivot-activity means. He doesn't know why 82% is better than 66%. He's cargo-culting the recommendation.

When the suggestion eventually stops appearing (because the pattern has been fully applied and no new pattern has emerged), Diego feels slightly lost. The golden card was his guide. Now it's gone. He doesn't know what to do with the sliders on his own.

**Minute 3:00 — The Learned Helplessness Moment**

A new divergence event occurs. No suggestion appears (the system hasn't detected a new pattern yet). Diego opens the sliders and stares at them. He doesn't know which one to adjust. He hasn't built a mental model of what the signals mean or how they interact.

He clicks "Reset to default." The sliders snap back to 66/25/8. He loses the accuracy improvement the suggestion gave him. He doesn't know how to get it back.

Three sessions later, a different suggestion appears — this time about reducing volatility weight for a specific mission type. Diego clicks Apply immediately, without reading the context or clicking "Show me the data."

**Minute 5:00 — Resolution**

Diego's trajectory illustrates the learned helplessness problem. The suggestion system gave him better results without requiring understanding. When the suggestions stopped, he couldn't maintain the improvement on his own. He became dependent on the system's recommendations rather than learning the underlying principles.

**What this tells us about the design:** The "Apply this adjustment" button is too frictionless. It should not be the default action. The design needs a speed bump between seeing the suggestion and applying it — something that forces a moment of engagement with *why* the suggestion is being made.

**Proposed mitigation:** The first time a player encounters a suggestion, "Apply this adjustment" is greyed out. The only available actions are "Show me the data" and "Dismiss." After the player has expanded the evidence table at least once, the Apply button activates. This ensures every player sees the evidence at least once before accepting a recommendation. Subsequent suggestions for the same player have Apply available immediately — the speed bump is a one-time gate, not a permanent barrier.

**Additional mitigation:** After applying a suggestion, a small follow-up question appears in the next session's drawer: "You applied a weight adjustment last session. In one sentence, why do you think it helped?" with a free-text field. The player doesn't have to answer — it's dismissable — but the question prompts reflection. Players who can answer it are learning. Players who can't are identifying a gap. This is a metacognitive prompt, and it costs almost nothing to add.

**UI Annotations:**
- Greyed-out Apply button on first encounter: the button text is visible but at 40% opacity; hovering shows a tooltip: "Expand the data below to understand the recommendation before applying"
- Free-text reflection prompt: appears inline in the drawer at next session open; placeholder text: "Why did this adjustment help?"; 200-character max; dismissable with an [x]; responses are stored in the player's session history but not displayed anywhere — purely for the player's own reflection
- The reflection prompt is warm amber text on a cream background, styled like a journal entry, not a quiz question; no right/wrong framing

---

## Strengths

**Closes the feedback loop between weight configuration and outcomes.** Without adaptive suggestions, the player tunes weights by intuition and checks accuracy as a delayed stat. The suggestion system compresses this feedback loop: "here's what the data says would have worked better." The player doesn't have to run their own retrospective analysis — the system does it and presents the findings.

**Teaches conditional reasoning about heuristic configuration.** The conditional framing ("in sessions where you made ≤2 config changes") is the most pedagogically valuable aspect. It teaches that the optimal configuration depends on context — a concept that transfers directly to real engineering (alert threshold tuning, feature flag configuration, monitoring sensitivity in different deployment phases).

**Makes the Bayesian updating metaphor concrete and interactive.** Abstract concepts like "updating priors based on evidence" become tangible when the player sees a recommendation, inspects the evidence, evaluates whether to accept it, and observes the outcome. This is Bayesian reasoning as a gameplay loop, not as a lecture.

**Generates replayable depth in the weight configuration space.** Players who receive suggestions discover that the weight configuration space is richer than they thought. "I should use different weights for relay missions vs. armor missions" creates a new layer of strategic preparation before each mission — choosing the right diagnostic prior as part of mission prep.

**Respects player agency by defaulting to suggestion, not automation.** The system recommends; it does not auto-apply. The player retains full control over their weight configuration. The suggestion is an input to the player's decision, not a replacement for it.

---

## Weaknesses

**Learned helplessness is the primary risk.** Diego's journey illustrates this clearly. A player who follows suggestions without understanding them becomes dependent on the system. When suggestions stop (because all detectable patterns have been surfaced), the player is worse off than if suggestions had never existed — they've been trained to expect guidance and now have none. The mitigation (greying out Apply until evidence is viewed) helps but doesn't solve the problem for players who click "Show me the data" without reading it.

**False confidence from small samples.** A recommendation based on 8-11 divergence events is statistically fragile. A pattern that appears with p=0.05 significance might be noise. The player sees "accuracy improves 23%" and treats it as a fact, but the true improvement might be 5% or 35% — the confidence interval on 11 data points is wide. The system should communicate uncertainty, but doing so without overwhelming casual players is hard.

**Context classification is imprecise.** The system classifies sessions by context variables (config changes, mission type, complexity). These classifications may not capture the real causal structure. A pattern like "recency should be low when config changes ≤2" might actually be driven by a third variable (mission difficulty, or specific agent interactions) that the system doesn't measure. The recommendation is correct for the wrong reason — a form of confounding that's hard to detect with small samples.

**Suggestion fatigue if patterns are frequent.** A player who receives a new suggestion every 5-10 sessions may start ignoring them. The one-suggestion-per-session limit helps, but the cumulative effect of many suggestions is cognitive overhead. The system needs a clear "steady state" where suggestions become rare — ideally, the player converges on a set of context-dependent presets and divergence events become uncommon.

**Interaction with manual experimentation.** A player who is actively experimenting with weights (dragging sliders, observing reshuffles) may find the suggestion card intrusive — "I'm trying to figure this out myself, stop telling me what to do." The suggestion should be sensitive to recent manual weight changes: if the player has adjusted weights in the current session, the suggestion card should not appear until the next session.

---

## Interaction Effects

**With 4.63 (Player-configurable pre-ranking weights):** The suggestion system is the empirical feedback layer on top of the manual weight configuration system. 4.63 gives the player sliders; 4.88 tells the player which slider positions have historically worked. The interaction creates a complete calibration loop: configure → observe outcomes → receive data-driven recommendation → reconfigure. The suggestion card lives inside the same drawer as the sliders, making the connection between configuration and recommendation spatially explicit.

**With 4.64 (Pre-ranking accuracy as displayed stat):** The accuracy stat (4.64) provides the denominator; the suggestion system (4.88) provides the numerator. The accuracy stat says "your pre-ranking is right 64% of the time." The suggestion says "here's how to make it 82% in specific contexts." Together, they form a complete diagnostic: what's my current performance, and how can I improve it? The accuracy stat must update in real-time when the player applies a suggestion, so the player can see the projected improvement immediately.

**With 4.92 (Per-mission-type weight performance heatmap):** The heatmap shows performance across all mission types and weight configurations as a static visualization. The suggestion system surfaces the most impactful cell in that heatmap as an actionable recommendation. A player who has seen the heatmap can contextualize the suggestion: "the system is telling me to move to the green cell in the relay-mission row." A player who hasn't seen the heatmap gets the recommendation without the spatial context. The two features are complementary: the heatmap gives the overview, the suggestion gives the next action.

**With 4.65 (Pre-ranking adversarial surface):** In competitive play, the suggestion system creates a potential information leak. If the game suggests "increase volatility for relay missions," and the opponent knows the player follows suggestions, the opponent can design configs that exploit high-volatility pre-ranking — placing decoys in high-volatility positions. The suggestion system becomes a target for adversarial manipulation. Competitive players may deliberately ignore suggestions to avoid predictability, which is itself a sophisticated strategic decision.

**With 8.09 (Diagnostic layer as teaching arc):** The suggestion system is the capstone of the diagnostic teaching arc. The arc progresses: (1) observe failures → (2) use Fix Explorer → (3) understand pre-ranking via transparency panel → (4) configure weights manually → (5) track accuracy as a stat → (6) receive data-driven suggestions for weight optimization. Step 6 is the moment where the player transitions from "I tune my tools by feel" to "I tune my tools based on empirical evidence." This is the Bayesian updating lesson: beliefs should be revised in proportion to evidence, not in proportion to confidence.

**With the two-act debrief structure (4.04b):** Suggestions appear only in Act 2 (the Inspector). They never intrude on the Sealed Watch. This is structurally correct — the suggestion is an analytical instrument, not an emotional one. The player encounters it in the context of systematic analysis, not in the context of watching their units fail. The timing ensures the suggestion is processed rationally rather than emotionally.

---

## Comparable Games and Media

**Netflix's "Because you watched..." recommendations:** Netflix surfaces recommendations with an explicit rationale tied to the user's history. The key design lesson: the rationale must be legible and the user must have seen the referenced item. Netflix's system fails when it recommends based on something the user watched years ago and doesn't remember. Robot Uprising's suggestion system has the same risk: a recommendation based on session S24's divergence event is meaningless if the player doesn't remember session S24. The "Show me the data" expansion mitigates this by showing the evidence directly rather than relying on the player's memory.

**Spotify Discover Weekly's learning curve:** Spotify's Discover Weekly improves over time as the algorithm learns the user's preferences. Early recommendations are generic; later ones are surprisingly accurate. The emotional arc of "this is irrelevant → this is decent → how does it know me?" is exactly the arc the adaptive suggestion system should produce. The first suggestion will be broad ("reduce recency when stable"). Later suggestions will be eerily specific ("on relay-heavy wave 3 missions with 6+ agents and ≤1 config change, set volatility to 42-48%"). The increasing specificity is what makes the system feel like it's learning, not just pattern-matching.

**Game AI difficulty adaptation (Resident Evil 4, Left 4 Dead's Director):** These systems silently adjust game difficulty based on player performance. The key difference from Robot Uprising's system: they are invisible. The player doesn't know the Director is reducing zombie count because they're dying too often. Robot Uprising's suggestion system is explicitly visible — the player sees the recommendation and the evidence. This transparency is critical for the teaching purpose. An invisible adaptive system would improve the player's accuracy without teaching them anything. A visible one teaches them how to improve their own accuracy.

**Garmin and Strava training load recommendations:** Running watches analyze training history and suggest adjustments: "Your training load is higher than usual. Consider a recovery day." The recommendation is based on empirical data (heart rate, distance, pace) and surfaces as an advisory, not a mandate. The runner can ignore it. Robot Uprising's suggestion system follows the same pattern: empirical data → advisory recommendation → player decides. The key parallel is that both systems are trying to help the user develop their own calibration sense, not to replace their judgment permanently.

**scikit-learn's GridSearchCV as a player tool:** In machine learning, GridSearchCV systematically tests hyperparameter combinations to find the best-performing configuration. The adaptive suggestion system is doing a version of this — testing weight configurations against historical divergence events to find the best-performing weights for each context. The difference: GridSearchCV is automated and exhaustive; the suggestion system is advisory and selective. It doesn't show the player every possible weight configuration — it surfaces the single most impactful adjustment. This curation is what makes it usable as a game mechanic rather than overwhelming as a data tool.

**Weather forecast confidence intervals:** Modern weather forecasts include probability: "70% chance of rain." Sophisticated users learn to calibrate their behavior to these probabilities — 70% means bring an umbrella but don't cancel the picnic. The adaptive suggestion's "accuracy improves 23%" is a similar probabilistic claim. Players who learn to treat it as a probability rather than a certainty are developing exactly the calibration skill the game aims to teach.

---

## Sensory Description

**The suggestion card at rest:**

The card sits below the weight sliders, separated by 12px of empty space. It is 280px wide — the same width as the slider panel — and approximately 120px tall. The background is a warm off-white (#faf8f4), barely distinguishable from the drawer background (#f5f5f5) but perceptibly warmer, like aged paper next to fresh paper. The left border is 3px of gold (#c9a84c) — a color not used elsewhere in the weight panel, marking this as advisory content rather than control content.

The header "SUGGESTED ADJUSTMENT" is set in a small, spaced monospace typeface — the same typeface used for "PRE-RANKING WEIGHTS" above the sliders. The diamond icon (◈) is gold, matching the border. The body text is in the standard body typeface, slightly smaller than the slider labels, in dark warm grey (#3a3632).

The card enters the drawer with a 300ms ease-out slide-down animation when the drawer is first opened in a session where a suggestion is pending. It does not pop in — it unfolds, as if the drawer is revealing something that was always there. A faint sound accompanies the entrance: a soft two-note ascending chime, like a glass bell struck once. The chime is at 15% volume — barely audible over the ambient debrief soundscape, a whisper of "something to consider."

**The three action buttons:**

Arranged horizontally at the bottom of the card in small text. "Apply this adjustment" is in gold text (matching the border). "Show me the data" is in teal text (matching the recency signal color — a deliberate association with "looking at historical data"). "Dismiss" is in dim grey, smaller than the other two, right-aligned — visually deprioritized.

On hover, each button gains a thin underline in its respective color. On click, the button depresses 1px (a subtle physical affordance) before triggering its action.

**The "Show me the data" expansion:**

Clicking expands the card downward with a 200ms ease-out. The evidence table appears below the body text, growing from height 0 to full height. The table uses a monospace typeface for numerical alignment. Alternating rows have a barely-perceptible warm/cool tint — warm for divergence events that would have been fixed by the suggestion, cool for events that remained divergent.

The "Your accuracy" summary row at the bottom is separated by a thin gold line. The actual accuracy percentage is displayed in dim grey. The projected accuracy (under the suggested weights) is displayed in soft green (#5a8a5a) if it's an improvement, with a small upward-pointing triangle (▲) to the left. The improvement delta ("64% → 82%") uses a right-pointing arrow that is gold, connecting the summary back to the suggestion visually.

**The "Apply this adjustment" animation:**

When clicked, the relevant slider thumb begins moving toward its new position. The motion is smooth — a 400ms ease-in-out curve. The percentage label beside the slider counts up or down in integers, the number-roll animation from 4.63. The gold border of the suggestion card pulses once — brightening to a warm amber for 200ms then settling — as if acknowledging that its recommendation has been heard.

200ms after the slider reaches its destination, the results list begins reshuffling. Cards slide to new positions over 250ms. Rank numbers flash white for 100ms then settle. The temporal gap between slider-arrival and reshuffle-start is deliberate: it creates a beat of anticipation — "the setting changed; now let's see what happens."

**The dismissed state:**

When Dismiss is clicked, the card fades over 250ms — opacity 100% to 0%. The space it occupied collapses upward over 150ms. In its place, at the very bottom of the slider panel, a small dim line of text appears: "1 suggestion dismissed · review →". The text is at 50% opacity, in the same warm grey as the card body text. Clicking "review →" opens a small flyout listing all dismissed suggestions for the current campaign, each with a "Reconsider" button.

**The sound of dismissal:**

A single soft descending note — the inverse of the entrance chime. Not negative, not punishing. Just acknowledging: "noted, moving on." The note is at 10% volume — even quieter than the entrance. The game respects the player's decision to ignore the suggestion without making it feel like a mistake.
