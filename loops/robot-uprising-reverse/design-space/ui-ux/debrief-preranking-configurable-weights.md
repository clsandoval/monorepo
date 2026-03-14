# Pre-Ranking Configurable Weights

**Aspect:** 4.63 — Player-configurable pre-ranking weights: a late-game unlock allowing the player to adjust the three heuristic signals (pivot-activity, recency, volatility) by slider; teaches that the pre-ranking is a configurable belief system, not a fixed algorithm; interaction with 8.08 vocabulary claim ("tuning a heuristic").

**Parent:** 4.58 — Pre-ranking transparency panel
**Siblings:** 4.64 — Pre-ranking accuracy as displayed stat; 4.65 — Pre-ranking adversarial surface; 4.66 — Signal genealogy as pre-ranking source; 4.67 — Probe hook suggestion from transparency panel
**Prerequisite:** Player must have engaged with the transparency panel (4.58) enough to understand what the three signals mean before weight configuration becomes meaningful.
**Related:** 8.08 — Real-language vocabulary claim ("tuning a heuristic"); 4.40 — QUICK vs. THOROUGH toggle; 4.65 — Pre-ranking poisoning as adversarial mechanic; 8.09 — Diagnostic layer as teaching arc

---

## The Core Concept

The pre-ranking heuristic combines three signals into a single rank score for each candidate fix. In the base design (4.58), those weights are fixed and invisible — the game decides how much pivot-activity, recency, and volatility each contribute. The player sees the signals but not the weights.

**Player-configurable weights** breaks the fourth wall: the player can adjust the relative importance of those three signals. The pre-ranking is no longer a black-box oracle with a mysterious ranking order. It's a **belief-weighting system** the player can tune to match their diagnostic model of the current campaign.

```
PRE-RANKING WEIGHTS  [Season 7 Config]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pivot Activity   ████████████░░░░  75%
Recency          ████░░░░░░░░░░░░  25%
Volatility       ░░░░░░░░░░░░░░░░   0%
                                  [Save as preset...]
```

Dragging the sliders reshuffles the Fix Explorer results list in real time. A player who has diagnosed that their current failures are almost never caused by recent changes (because they haven't touched their config in three sessions) can dial recency to zero, boosting the signal-to-noise ratio of the remaining signals.

**What this teaches:** A heuristic is a configurable prior. It reflects the designer's beliefs about what's likely to be wrong. Those beliefs can be right or wrong, and they can be tuned to match the specific context. This is directly analogous to configuring a code quality linter, tuning a monitoring alert threshold, or adjusting a machine learning model's feature importance weights. The game teaches this not as an abstraction but as a mechanical action with immediate, visible consequences.

---

## The Unlock Gate

This feature should NOT be available from the start. Three possible unlock conditions:

**Option A: Time-gated (sessions)**
Unlocked after 20 sessions. Simple. Arbitrary. Doesn't require the player to have demonstrated understanding of what they're configuring.

**Option B: Engagement-gated (drawer opens)**
Unlocked after the player has opened the transparency drawer at least 10 times. Ensures the player has engaged with the signals before getting sliders for them. The theory: if you've read "ranked because pivot-active + recent-change" 10 times, you have a working model of what those signals mean.

**Option C: Insight-gated (divergence event)**
Unlocked after the player has experienced at least 3 sessions where QUICK mode and THOROUGH mode returned different results. This is the moment when the pre-ranking's fallibility becomes salient — the QUICK result wasn't the minimum fix. After three such divergences, the game surfaces the weight panel with a message:

> "The pre-ranking heuristic has led you to a different conclusion than the exhaustive search. You can now adjust how the heuristic weights its signals. Some diagnostic priors are better suited to some mission types than others."

**Recommended: Option C.** The unlock is tied to a moment of recognized failure. The player isn't given a new tool as a reward — they're given a new tool because they've hit the edge of the default configuration. The moment of insight ("QUICK was wrong again") is the exact moment configuring weights becomes meaningful.

---

## The Full Design Space

### Option A: Sliders in the Transparency Drawer

**What happens:** The transparency drawer (4.58) gains a new section at the bottom, unlocked after the gate condition:

```
▼ WHY IS THIS RANKED #1?
──────────────────────────────────────────────────────────────
[...existing explanation prose...]

PRE-RANKING WEIGHTS (drag to adjust)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pivot Activity    ██████████░░░░░  66% ─────────────[●]────
Recency           █████░░░░░░░░░░  33% ───[●]──────────────
Volatility        ░░░░░░░░░░░░░░░   0% [●]─────────────────
                                      [Reset to default]
                                      [Save preset →]
```

As the player drags a slider, three things happen simultaneously:
1. The rank scores for all candidates update (shown on the `score: 0.84` chip next to each card)
2. The order of candidates in the Fix Explorer results list reshuffles
3. The explanation prose in the drawer updates: "Ranked #1 primarily because of pivot-tick activity (66% weight). Recency contributed (33% weight). Volatility not considered (0% weight)."

The sliders are normalized: they don't have to sum to 100%, but the displayed percentages always show relative weight (if all three are equal, they each show 33%). Dragging one up doesn't force others down — the normalization is computed separately.

**The visual logic:**
- Slider tracks are color-coded to match the signal icons throughout the debrief: amber for pivot-activity, teal for recency, violet for volatility
- The thumb is a small diamond (◆) on the amber track, a clock face on the teal track, a waveform on the violet track — matching the icons used in the explanation prose
- An undo ring appears if the player drags a slider significantly: "← undo weight change"

**Strengths:**
- Contextual — sliders appear inside the drawer that explains what they affect, so the feedback loop is tight
- Immediate — results update in real time, the player sees the consequence before committing
- Low commitment — no "apply" button, changes are exploratory until the player saves a preset

**Weaknesses:**
- Slider interaction in a scrollable drawer is ergonomically awkward — horizontal sliders inside a vertically scrolled panel create conflicting gesture interpretations on touch devices
- Normalization math can feel surprising: if the player sets all three to zero, the display shows 33%/33%/33% — "I set them all to zero and they're equal?" requires explanation

---

### Option B: Ternary Plot — The Belief Triangle

**What happens:** Instead of three independent sliders, the weight configuration is a single point in a triangle where each corner represents one signal dominating entirely.

```
                 PIVOT ACTIVITY
                      ◆
                     /|\
                    / | \
                   /  |  \
                  /   ●   \         ← player-draggable dot
                 /    |    \
                /     |     \
    RECENCY ───●─────────────●─── VOLATILITY
```

Moving the dot toward the PIVOT ACTIVITY corner increases its weight. Moving it to the center gives equal weight to all three. Hovering shows the exact percentage breakdown in a tooltip.

**Why this is different:** The ternary plot makes the three-way relationship legible at a glance. It's not three independent sliders — it's one belief point in a space of possible beliefs. Moving the dot doesn't feel like adjusting parameters; it feels like choosing a position on a philosophical map.

**The named positions:**
- **Center** (equal weight): "Balanced"
- **PIVOT corner**: "Pivot-First" — for missions where the failure is always traceable to a specific moment
- **RECENCY corner**: "Churn-First" — for missions where the problem is almost always recent config changes
- **VOLATILITY corner**: "Noise-Hunter" — for missions where the high-churn element is likely the culprit regardless of timing
- **PIVOT-RECENCY edge**: "Fresh Pivot" — weighted toward things that were both active at the pivot and recently changed (the default heuristic lives here, roughly)
- **PIVOT-VOLATILITY edge**: "Active Noise" — things that were busy at the pivot AND stayed busy throughout

**Strengths:**
- Visceral and spatial — the player develops a spatial intuition for the belief space
- Named positions give reference points for sharing with others ("I use Fresh Pivot for wave 3 missions")
- The ternary structure reveals a constraint the slider version doesn't: the three weights are not independent — they're in a compositional relationship

**Weaknesses:**
- Ternary plots are a non-obvious UI pattern — most players have never interacted with one; requires an introduction
- Harder to express "ignore this signal entirely" — moving to the PIVOT corner still leaves small residual weights for the other two
- No slider affordances — the one-dot interaction doesn't suggest to players that they're doing weight configuration

**The TikTok clip for this option:** Player drags the belief dot slowly from "Recency-heavy" toward "Pivot-heavy" and the candidate list visibly reshuffles on screen — what was #1 falls to #4, what was #4 jumps to #1. The player says "oh THAT'S why it kept surfacing the wrong element — I was overweighting recency." Cut to the updated run with the new pre-ranking config. Win.

---

### Option C: Preset Library — Named Diagnostic Strategies

**What happens:** Instead of raw slider values, the player chooses from (and contributes to) a library of named weight configurations:

```
PRE-RANKING STRATEGY                    [this match]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
● BALANCED (default)                    Recommended for new campaigns
○ PIVOT-FIRST                           When failure is traceable to one moment
○ FRESH CHANGES                         When you've been iterating configs rapidly
○ NOISE INVESTIGATION                   When the failure pattern is inconsistent
○ MY CONFIG — "Early campaign stable"   Recency: 0%, Pivot: 70%, Volatility: 30%
                                        [+ New preset...] [Edit my preset]
```

The player picks a strategy before running QUICK mode. The strategy applies globally until changed. The "Edit my preset" action opens the slider panel (Option A) or the ternary plot (Option B) with the current preset's weights loaded.

**The community dimension:** In multiplayer or a competitive Gauntlet context, players can share named presets. "I use Tomás's RELAY-CHAIN preset for wave 4 missions — he discovered that pivot-activity alone outperforms the default in relay-heavy mission types." The preset library becomes a piece of community knowledge about the game's meta.

**Strengths:**
- Low cognitive overhead — pick a strategy from a list, not configure three values
- Named strategies are discussable and shareable — community knowledge can crystallize around names
- Preset authoring is a form of self-expression: players who think carefully about their diagnostic approach can encode it

**Weaknesses:**
- Picking from a list doesn't teach the player what the weights are or what they mean — the opaque preset is almost as mysterious as the opaque default
- If the game provides four named presets and the player never clicks "New preset," they've gained a choice but not insight
- Preset naming is creative friction — players who don't want to name their configuration may feel blocked

---

### Option D: Weight Configuration as Campaign Mechanic

**What happens:** Weight configuration is not a UI setting — it's a strategic decision that matters for the meta-game. Different mission types reward different pre-ranking strategies. The Fix Explorer tracks which strategy you used for each session and, after enough sessions, surfaces "strategy accuracy" stats:

```
STRATEGY PERFORMANCE — Last 30 Sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BALANCED (used 18 sessions):  QUICK=THOROUGH 72% of sessions
PIVOT-FIRST (used 8 sessions): QUICK=THOROUGH 81% of sessions
FRESH CHANGES (used 4 sessions): QUICK=THOROUGH 44% of sessions
                                [i] FRESH CHANGES performs poorly for you —
                                    your recent sessions show low config churn
```

The game is now giving the player a feedback loop on their meta-strategy. PIVOT-FIRST is measurably better for them than FRESH CHANGES in their current campaign phase.

**Strengths:**
- Makes weight configuration meaningful beyond "it feels right" — there's actual performance data
- Ties the pre-ranking configuration to the campaign arc: which strategy works best in wave 1 vs. wave 4?
- The performance tracking is directly analogous to A/B testing a heuristic — a real engineering practice

**Weaknesses:**
- Complex to implement and communicate without becoming a stats screen that no one reads
- Risk of players cargo-culting the best-performing strategy without understanding it
- "Strategy accuracy" as a metric may interact badly with 4.64 (pre-ranking accuracy as displayed stat) — two similar stats could create confusion

---

### Recommended Design: Option A + Option C

**The hybrid:** Sliders (Option A) for configuring weights, preset library (Option C) for saving and recalling named configurations. The ternary plot (Option B) is surfaced as an "advanced view" for players who hover a help icon asking "what's the relationship between these signals?"

Flow:
1. **Early game:** Transparent panel with fixed weights, no configuration
2. **After 3 divergence events (gate condition):** Sliders appear at the bottom of the transparency drawer with a tooltip: "The pre-ranking heuristic led you to a different candidate than the exhaustive search. You can now adjust how it weights its signals."
3. **First interaction with sliders:** Moving any slider triggers a small guided overlay: "This changes how the pre-ranking orders candidates. More weight on PIVOT ACTIVITY means elements active at the pivot tick are ranked higher. Try dragging recency to 0% if you haven't changed your config recently."
4. **After saving first preset:** Preset library appears in a compact dropdown above the Fix Explorer run button. Player can switch presets before running QUICK mode.
5. **Late game (after 10+ sessions with custom presets):** Strategy performance tracking (Option D's best feature) appears in the career stats screen.

---

## Player Journeys

### Journey: Tomás, 34, backend engineer, Session 22 — "The Sender-Receiver Problem"

**Context:** Tomás is three weeks in. He's been using the Fix Explorer heavily. He's experienced the SCOUT-B vs. RELAY-C divergence (from 4.58's journey) and has since been aware that QUICK mode overweights "active at pivot" vs. "actually causal." He's been running THOROUGH mode more often as a result — but THOROUGH takes 30+ seconds and he wants QUICK to be smarter.

After his 4th divergence event tonight, the sliders appear in the drawer for the first time.

**Minute 0:00 — The Unlock**

Tomás runs QUICK. Result: "FIRST VIABLE FIX: SCOUT-B — beacon threshold –2 ticks." He recognizes this immediately — this is the wrong candidate again. He opens the transparency drawer and reads the familiar explanation: pivot-active, recently changed, high volatility.

But below the explanation, something is new:

```
PRE-RANKING WEIGHTS (drag to adjust)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pivot Activity   ████████████░░░  66%  ────────────[◆]───
Recency          █████░░░░░░░░░░  25%  ────[🕐]──────────
Volatility       ████░░░░░░░░░░░   8%  ───[〜]───────────
```

A tooltip appears automatically: "The pre-ranking heuristic has led you to a different result than THOROUGH search on 4 sessions. You can now configure how it weights its signals."

Tomás reads this carefully. He understands it immediately — he's been thinking about exactly this: the recency signal was misleading because SCOUT-B WAS recently modified (by him), but SCOUT-B isn't actually the root cause.

**Minute 0:45 — The Configuration**

He grabs the Recency slider and drags it to 0%.

Immediately, the results list reshuffles:

```
BEFORE (recency weighted):
#1 SCOUT-B — beacon threshold –2    score: 0.87
#2 RELAY-C — buffer +1 slot         score: 0.68
#3 STRIKER-A — rule priority order  score: 0.22

AFTER (recency zeroed):
#1 RELAY-C — buffer +1 slot         score: 0.74
#2 SCOUT-B — beacon threshold –2    score: 0.71
#3 STRIKER-A — rule priority order  score: 0.22
```

RELAY-C jumped to #1. SCOUT-B fell to #2. The pivot-activity and volatility scores are close between the two — without recency breaking the tie, RELAY-C edges ahead because its volatility is slightly higher.

Tomás stares at this. He recalibrated the pre-ranking, and the pre-ranking immediately surfaced the correct candidate from THOROUGH mode.

**Minute 1:30 — The Realization**

He clicks "Save as preset..." and types: "Stable config — ignore recency." The preset is saved.

He runs QUICK mode with the new weights:

5 seconds. "FIRST VIABLE FIX: RELAY-C — context buffer +1 slot."

He applies it. Pass rate: 79/100.

He types to himself: "Zero out recency when I haven't been changing things for 2+ sessions. The heuristic was penalizing me for doing iterative debugging."

**Minute 3:00 — The Analogy**

Tomás is thinking about a work parallel. In his production monitoring, they have alert thresholds. When the team is actively deploying, they sometimes lower the alert sensitivity (ignore recency-of-change as a factor) because everything is recent. When they're in a stable period, recency becomes highly diagnostic again — if something changed in a stable system, that's a strong signal.

He's doing the same thing here. He hasn't changed his config much lately. Recency is noise, not signal. Zeroing it out is the right call.

He thinks: the game just taught me something about configuring diagnostic heuristics. This is the same thing I do at work.

**Minute 4:00 — Resolution**

He creates a second preset: "Active iteration — weight recency high" with recency at 50%, pivot-activity at 40%, volatility at 10%. He'll use this when he's actively modifying configs.

He posts on the game's community Discord: "After 22 sessions I figured out that you can configure the pre-ranking weights. Zero out recency when you haven't modified anything recently — it totally changes which candidate QUICK surfaces."

**What Tomás wants to do next:** Figure out whether there's a way to automatically adjust weights based on detected config churn (how much has the player changed configs recently?).

**UI Annotations:**
- Slider track: 180px wide, color-coded thumb icon (◆ amber for pivot, 🕐 teal for recency, 〜 violet for volatility)
- Results list reshuffle animation: cards slide vertically with a 150ms ease, score chips update with a brief number-roll animation (0.87 → 0.71 counted down over 300ms)
- "Save as preset..." link: appears as teal text at the bottom of the slider section; clicking opens an inline text field with a placeholder "Name this strategy..." and a confirm button
- Preset dropdown: appears above the Run Analysis button as a compact pill-shaped selector; shows current preset name; clicking opens a small dropdown of saved presets with a "Manage presets →" link

---

### Journey: Priya, 28, competitive player, Gauntlet season prep — "Poisoning the Prior"

**Context:** Priya is 80 hours in and preparing for a rated Gauntlet match. She's been experimenting with weight configurations for three weeks. She's discovered a dirty trick: when playing against human opponents in the Gauntlet, she can design her config so that the opponent's QUICK mode pre-ranking consistently surfaces the WRONG candidate (because her configs engineer high pivot-activity and high recency in decoy elements while hiding the real vulnerability in a low-activity, stable element).

She's testing whether her pre-ranking configuration choices affect her ability to diagnose her own potential vulnerabilities.

**Minute 0:00 — The Adversarial Frame**

Priya opens the Fix Explorer on her own config (using the self-diagnostic mode). She runs QUICK with default weights.

Result: "FIRST VIABLE FIX: RELAY-C — compression rate +15%."

She knows this is wrong. She engineered RELAY-C to look suspicious. The real vulnerability is DISPATCH-OMEGA, a low-key relay that has never been modified and is barely active at the pivot tick — it has a subtle buffer saturation condition that only triggers in edge cases.

QUICK mode's pre-ranking didn't surface DISPATCH-OMEGA. DISPATCH-OMEGA has low pivot-activity (0.21), low recency (never changed), and low volatility (0.15). The pre-ranking scored it 0.08.

**Minute 1:00 — The Heuristic Inversion**

Priya opens the weight sliders. She's thinking: what pre-ranking configuration would surface DISPATCH-OMEGA?

She tries zeroing recency and pivot-activity and maximizing volatility:
- Pivot Activity: 0%
- Recency: 0%
- Volatility: 100%

Results reshuffle. DISPATCH-OMEGA's volatility score, though low (0.15), is now the only signal. But it's still low — other elements have higher volatility (RELAY-C has volatility 0.77). DISPATCH-OMEGA doesn't surface.

She tries a different angle: minimum-activity filter. What if the pre-ranking excluded all high-pivot-activity elements (on the theory that "if it's very active, it might be a decoy")?

The game doesn't support this filter natively. The sliders control weights, not exclusions.

**Minute 2:30 — The Diagnostic Limit**

Priya hits the limit of what weight configuration can do. She can tune the relative importance of the three signals, but she can't invert the signal meaning ("rank LOW pivot-activity first instead of HIGH"). The slider system is a linear weight, not a full heuristic design tool.

She opens THOROUGH mode. 47 seconds. THOROUGH surfaces DISPATCH-OMEGA at rank 14.

She can't make QUICK find it. DISPATCH-OMEGA's design is specifically optimized to be invisible to any reasonable pre-ranking heuristic.

**Minute 4:00 — The Insight**

This is exactly the point. A well-designed adversarial config creates a vulnerability that is orthogonal to all common diagnostic priors. DISPATCH-OMEGA doesn't show up under "what was active at the pivot," "what was recently changed," or "what was volatile." Those are the only signals in the pre-ranking. A vulnerability that scores low on all three is immune to QUICK mode.

Priya starts designing her Gauntlet configs with this in mind: engineer decoys that score high on all three signals, and hide the real vulnerability in a stable, quiet, never-modified element.

She documents this in her personal config notes.

**Minute 5:30 — Resolution**

Priya switches back to default weights and accepts that THOROUGH is required for this type of deep vulnerability. She's learned something about the fundamental limitations of heuristic search — not just in this game, but as a general principle.

She posts a theory thread: "The pre-ranking can be adversarially poisoned by any config that presents high-activity decoys while hiding vulnerabilities in low-activity, stable elements. This is a structural limitation of the heuristic's signal design, not a bug."

**What Priya wants to do next:** Find the pre-ranking configuration that minimizes susceptibility to poisoning — is there a weights configuration that is hardest to game?

**UI Annotations:**
- Weight configuration shows "live candidate count" as sliders are dragged: a dim label updates "DISPATCH-OMEGA: rank 22/89 → rank 18/89 → rank 14/89" as the player experiments; this makes the effect on a specific watched candidate visible
- A "watch this candidate" pin: right-clicking any candidate in the results list adds a pin; pinned candidates show their rank position as a number that updates in real time during slider adjustment; Priya would pin DISPATCH-OMEGA and watch it stay at rank 14–22 regardless of weight configuration

---

### Journey: Marcus, 45, casual gamer, evening play — "Why Did The List Change"

**Context:** Marcus is 25 sessions in, relatively casual. He's used the Fix Explorer without ever opening the transparency drawer until tonight, when a tutorial tip pushed him to open it. He accidentally triggered the weight unlock condition (3 divergences he never noticed), and now the sliders are there.

**Minute 0:00 — The Confusion**

Marcus runs QUICK mode. Gets a result. Opens the drawer for the first time (following the tutorial tip).

He reads the prose explanation. He sort of understands "active at tick 52." He sees the sliders at the bottom.

He drags the Recency slider to 100%, pushing pivot-activity and volatility to effectively 0%.

The results list reshuffles dramatically. His original result (rank #1) drops to rank #7. A completely different element is now #1.

Marcus stares at this. He doesn't understand why the list changed. He drags Recency back to somewhere near the middle, trying to get back to the original result.

He can't quite reproduce the original order. He's flustered.

**Minute 1:30 — The Recovery**

He sees the "Reset to default" button and clicks it. The weights snap back to 66%/25%/8%. The original result is #1 again.

Marcus feels relieved but mildly annoyed. He wasn't ready for this level of configurability.

**Minute 2:00 — The Alternative Outcome**

He closes the drawer entirely and just applies the QUICK result. He doesn't touch the sliders again this session.

He hasn't learned what the sliders do. He's learned "there are sliders, they change the list in a confusing way, the reset button fixes things."

**Minute 3:00 — Resolution**

Three sessions later, Marcus casually mentions in a Discord server that "there are sliders in the Fix Explorer that mess with the order." Someone responds: "Those are the pre-ranking weight sliders — here's how they work..." and links to a community guide.

Marcus reads the guide and has an "oh!" moment. He goes back and experiments deliberately, with the guide open.

**What this tells us about the design:** The sliders are powerful but dangerously live. A casual player who drags a slider accidentally gets a confusing result. The reset button is essential. The unlock mechanism (3 divergences) didn't actually prepare Marcus for what the sliders do — he hit the divergences without consciously noticing them, so the unlock arrived without context.

**What the design needs:** A more deliberate introduction to the sliders, even if weight configuration was already unlocked. When the player first interacts with any slider, a one-time explanation overlay should appear:

> "You're adjusting the pre-ranking weights. The results list is reshuffling based on your new weights. Each signal (pivot-activity, recency, volatility) affects how candidates are ordered. [Try dragging recency to 0% to see the effect.] [Reset to default]"

**UI Annotations:**
- "Reset to default" button: always visible in the slider section, not hidden until weights are changed; styled as a dim secondary button (light grey background, not amber/teal); placement directly below the slider tracks, not at the bottom of the drawer
- First-interaction overlay: appears on the first slider drag, not the first time the section is visible; triggered by mousedown on any slider thumb; covers the results list with a brief explanation before the reshuffle happens; disappears after 4 seconds or on any click
- Slider changes are reversible with Ctrl+Z / Cmd+Z at the session level — undoing a slider drag restores previous weights and re-reshuffles the list

---

## Strengths

**Makes the heuristic legible as a system, not an oracle.** The default pre-ranking is experienced as a black box that returns a result. With weight configuration, the player understands that the black box has inputs they can tune. The shift from "the tool gave me an answer" to "I configured a tool that gave me an answer" is a significant epistemological upgrade. The player becomes a participant in the diagnostic process rather than a consumer of results.

**Directly models real heuristic engineering.** Tuning weights is what you do when a heuristic isn't working well in a specific context. A spam filter with poor precision might need its recency-of-domain weight adjusted. A recommendation system that's surfacing stale content might need its volatility weight reduced. The mechanic teaches this directly.

**Creates replayable configuration depth.** Players who have solved a mission optimally on their default pre-ranking can revisit it and ask: "what's the minimum configuration required to surface the correct fix in QUICK mode?" This is a Zachtronics-style optimization puzzle — not for the mission itself, but for the diagnostic tool.

**Community-shareable as vocabulary.** "I use Pivot-First for relay missions, Fresh-Changes for wave 2, and Stable-Config for late-game" is a sentence that a community player can say and be understood by other community players. Named presets generate shared vocabulary.

---

## Weaknesses

**Discoverability problem.** Players who never open the transparency drawer never encounter the sliders. Players who open the drawer but don't read it closely miss the slider section at the bottom (below the fold in small windows). Weight configuration requires the player to have already engaged with the transparency panel, which requires the player to have been curious about the pre-ranking explanation. It stacks three layers of curiosity-gating.

**The casual player danger zone.** As Marcus's journey shows, live slider effects on an active results list can be disorienting. A player who drags a slider without understanding what they're doing gets a confusing result that undermines their trust in the tool. The "Reset to default" button is load-bearing.

**Requires all three signals to be understood before configuration is meaningful.** If the player doesn't know what "pivot-activity" is, adjusting its weight is cargo-cult configuration. The unlock gate should ensure signal understanding, not just signal exposure.

**Doesn't expose the combination function.** The pre-ranking scores aren't just weighted sums — they're combined in a specific formula. A player who sets pivot-activity to 100% might expect RELAY-C (pivot score 0.68) to beat SCOUT-B (pivot score 0.91), but if RELAY-C's pivot score is lower because it was a receiver not a sender, zeroing the other weights doesn't fix the underlying issue. The sliders tune a formula the player can't inspect.

---

## Interaction Effects

**With 4.58 (Pre-ranking transparency panel):** The sliders live inside the transparency drawer. The weight section is a natural extension of the explanation section — after the panel explains *why* the current ranking was produced, the sliders offer *how to change* the basis for future rankings. The two sections should feel like one coherent tool: "here's how the ranking was produced; here's how to tune the production."

**With 4.61 (QUICK vs. THOROUGH explainer):** When QUICK and THOROUGH diverge, the comparison view should show the player's current weight configuration alongside the comparison: "Your weights: Pivot 66% / Recency 25% / Volatility 8%. With these weights, the pre-ranking surfaced SCOUT-B (#1) but RELAY-C is the minimum fix (#4 in pre-ranking)." This makes the weight configuration a concrete variable in the divergence analysis.

**With 4.64 (Pre-ranking accuracy as displayed stat):** Per-preset accuracy data is the feedback loop that makes weight configuration strategic. If "Stable Config — ignore recency" has 85% accuracy vs. the 71% default, the player has empirical evidence that their custom prior outperforms the default for their play style. This is the most important interaction in the cluster.

**With 4.65 (Pre-ranking adversarial surface):** As Priya's journey shows, the weight configuration space is finite — there are only three signals, and a vulnerability that scores low on all three is immune to any linear weighting. Adversarial config design exploits this limitation. The weight sliders give players a way to explore the edges of the heuristic's coverage, which makes them useful for thinking about adversarial defense as well as standard diagnostics.

**With 8.08 (Real-language vocabulary claim):** This mechanic is the strongest gameplay instantiation of the vocabulary claim. "Tuning a heuristic" is exactly what the player does with the weight sliders. The vocabulary claim says that the game uses real engineering vocabulary — weight configuration is a real engineering action with a real name. The mechanic should use the phrase "heuristic weight" explicitly in its UI copy, not "ranking preference" or "importance setting."

**With 8.09 (Diagnostic layer as teaching arc):** Weight configuration is the final layer of the diagnostic arc: (1) observe failures → (2) identify pivot tick → (3) use Fix Explorer → (4) understand pre-ranking via transparency panel → (5) configure pre-ranking weights to match your diagnostic model → (6) track per-weight-config accuracy over time. Layer 5 is where the player transitions from "using a tool" to "building a tool."

---

## Comparable Games and Media

**scikit-learn's GridSearchCV and RandomizedSearchCV:** Hyperparameter tuning for machine learning models. You define a parameter grid (the equivalent of "pivot-activity: [0, 33, 66, 100%]") and the search finds the best configuration on a validation set. Robot Uprising's weight sliders are manual hyperparameter tuning. The `Per-preset accuracy` stat is the validation score. The analogy is exact.

**Catan's victory point calculation:** Different strategies (settlers, knights, roads) contribute to winning in different ways. Players mentally weight different paths to victory based on the board state and opponent behavior. The pre-ranking weight configuration is similar: the player is choosing which signals to prioritize based on their current campaign context. The difference is that Catan's weights are implicit in player decision-making; Robot Uprising makes them explicit and configurable.

**Factorio's priority splitter belts:** In Factorio's advanced logistics, belt splitters can be configured to prioritize one output lane over another. If the priority input is full, items overflow to the secondary. This is weight configuration for throughput systems. The Factorio player who understands priority splitters is the same player who would intuitively understand pre-ranking weight sliders.

**Excel's conditional formatting with custom formulas:** Power users write custom formula rules to highlight cells: `=AND(A1>0.8, B1<0.2)` — "highlight cells where pivot-activity is high but recency is low." This is a filter-as-belief-configuration. Robot Uprising's sliders are the same kind of "custom formula for your beliefs" made accessible without syntax.

**Google Search's site: operator and date filter:** Power users configure Google Search to limit results by site, date, or file type — adjusting the search's prior toward certain categories of information. The pre-ranking weight sliders are the same kind of search configuration made explicit. "Recency: 0%" is "I don't want Google to use date as a signal right now."

---

## Sensory Description

**The slider section's visual weight:**

The slider section sits below the prose explanation in the drawer, separated by a thin horizontal rule the color of old amber — not a harsh line, a suggestion of division. The section header is in a smaller, cooler typeface than the explanation prose: "PRE-RANKING WEIGHTS" in a subdued monospace, like a config file header. This distinguishes the configuration section from the explanation section — one is the game explaining itself, the other is the player configuring the game.

**The slider tracks:**

Three horizontal tracks, each 200px wide, stacked vertically with 8px between them. Each track is a thin (4px) rounded rail:
- Amber rail for pivot-activity: warm, slightly glowing, the same amber used for EDT annotations throughout the debrief
- Teal rail for recency: cool, muted, the clock-blue used elsewhere for temporal information
- Violet rail for volatility: deep, slightly purple, the waveform color from the explanation icons

The track background is dim (20% filled) when a signal has zero weight. Dragging the thumb brightens the fill proportionally.

**The thumbs:**

Each thumb is a distinctive 12×12 icon — not a generic circle:
- Pivot-activity thumb: a small amber diamond (◆) — the EDT shape
- Recency thumb: a miniature clock face, the hands set to "12:30" (arbitrary but consistent)
- Volatility thumb: three horizontal lines of different lengths, suggesting a waveform

Hovering any thumb reveals a tooltip: "Pivot Activity: 66% — elements active at the pivot tick are weighted 66% of the total ranking signal."

**Dragging a slider:**

As the thumb moves, the numerical percentage label to the right of the track counts up or down in integers. The count is a gentle number-roll animation — not an abrupt jump, a smooth increment like an odometer.

Simultaneously, the results list to the left (or below, depending on layout) experiences a slow reshuffle: cards ease to their new positions over 200ms, the rank numbers on each card (a small "01", "02", "03" in the upper left corner) update with a brief flash — white-out for 100ms then back to normal.

**The emotional texture of weight configuration:**

The slider section feels like a control panel — precise, calibrated, deliberate. The rest of the debrief is narrative and explanatory. The slider section is operational. Dragging a slider breaks from "the game is telling me something" into "I am telling the game something." That shift is legible. The player is no longer reading an explanation. They are authoring a belief.

When the player saves a preset, a small confirmation appears at the top of the drawer: "Strategy 'Stable Config' saved. Used in: next analysis." The word "saved" appears in a soft teal, the word "Used in: next analysis" in dim gray. The confirmation fades after 3 seconds.

---

## Discovered New Aspects

1. **4.88 — Adaptive weight suggestion from divergence history**: After 10+ divergence events, the game surfaces a recommendation: "Based on your session history, pre-ranking accuracy improves 23% when recency is set below 20% in sessions with fewer than 2 config changes. Try adjusting your weights →"; automatic prior recommendation from empirical session data; teaches Bayesian updating of diagnostic priors.

2. **4.89 — Weight import/export as config file**: Pre-ranking weight presets are serializable to a short config string (e.g., `PA:66,R:25,V:8`) that can be shared in external channels; community players share "optimal presets" for specific mission types; connects the in-game mechanic to real-world config-sharing culture.

3. **4.90 — Weight configuration persistence across campaign chapters**: Does your "Stable Config" preset from Chapter 1 still serve you in Chapter 4? A campaign chapter transition could optionally prompt: "Your current pre-ranking weights were saved in Chapter 2. The mission landscape has changed — do you want to review your diagnostic priors?"; temporal configuration hygiene as campaign mechanic.

4. **4.91 — Visual weight interpolation animation when switching presets**: When the player changes from one named preset to another, the three slider thumbs animate from their current positions to the new positions over 500ms, in sequence; the results list reshuffles during the animation; visceral, tactile preset switching that makes the weight change legible as motion; could also help players remember what each preset "feels like."

5. **4.92 — Per-mission-type weight performance heatmap**: A career stats panel shows which weight configurations produced the highest QUICK accuracy for each mission type (wave 1 relay missions, wave 3 armor missions, etc.); a color-coded grid where rows are mission types and columns are preset configurations; teaches that heuristic configuration is context-dependent, not globally optimal.
