# Pre-ranking Accuracy as a Displayed Stat

**Aspect:** 4.64 — Pre-ranking accuracy as a displayed stat: after 30+ sessions, the transparency drawer shows "pre-ranking accuracy: your QUICK result matched THOROUGH minimum in X% of sessions"; teaches what a good heuristic accuracy looks like; risk of players optimizing the stat vs. using it diagnostically.

**Parent:** 4.58 — Pre-ranking transparency panel
**Siblings:** 4.63 — Player-configurable pre-ranking weights; 4.65 — Pre-ranking adversarial surface; 4.66 — Signal genealogy as pre-ranking source; 4.67 — Probe hook suggestion
**Related:** 4.60 — Search budget as resource; 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result; 4.25 — EDT trajectory; 8.09 — Diagnostic layer as teaching arc

---

## The Core Concept

After 30+ sessions of play, the pre-ranking transparency drawer gains a new section at the bottom: a running accuracy statistic showing how often QUICK mode's pre-ranked #1 candidate turned out to be the same as THOROUGH mode's minimum fix.

```
Pre-ranking accuracy (last 38 sessions):
QUICK #1 matched THOROUGH minimum: 71% (27/38 sessions)
Average rank of minimum fix: 2.1 (top 3, almost always)
```

This is not a score. It is not a performance rating. It is a **calibration instrument** — a readout of how well the pre-ranking heuristic is adapted to the player's current architecture style.

**What it actually measures:**

In any given session where the player ran both QUICK and THOROUGH mode, two outcomes are possible:
- **Match**: QUICK's top-ranked candidate and THOROUGH's minimum fix are the same config element. The heuristic worked.
- **Divergence**: QUICK surfaced element A; THOROUGH found the minimum fix is element B. The heuristic was fooled by circumstantial evidence.

The accuracy stat is the match rate: what percentage of sessions over the player's recent history (default: last 30 sessions where both modes were run) produced a match.

**Why 71% is interesting:**

The baseline for random chance is approximately 1/N, where N is the number of candidate elements. For a typical config with 50–150 candidate elements, random chance would produce roughly 1–2% accuracy. The pre-ranking heuristic achieves 65–80% accuracy on typical player architectures. That is an extraordinary compression — the heuristic is approximately 40–50× better than random chance at finding the minimum fix on the first try.

But the number also means: 29% of the time, the pre-ranking leads the player to the wrong place first. If a player runs QUICK and never verifies with THOROUGH, they are applying a potentially-wrong fix in roughly one out of three sessions.

The stat makes this trade-off legible. Players who see "71%" can make an informed decision: "QUICK is probably right, but I should verify when the stakes are high."

---

## The Design Space

### Framing Option A: "Accuracy" Framing — Percent Correct

```
Pre-ranking accuracy: 71%
(QUICK #1 = THOROUGH minimum in 27/38 sessions)
```

**Neutral, absolute.** Lets the player decide what 71% means.

**Risk:** Players with no engineering context may read "71%" as a grade. Is 71% good or bad? In school, 71% is a C+. In a diagnostic heuristic context, 71% is remarkable. Without context, the number is ambiguous.

**Mitigation:** Add a small contextualizer: "71% accuracy (typical range: 60–80%)" or "71% — heuristic is well-calibrated for your architecture." The range anchor tells the player where they sit.

---

### Framing Option B: "Calibration" Framing — Distance from Perfect

```
Pre-ranking calibration: 71% match rate
In 29% of sessions, QUICK surfaced a different candidate than the minimum fix.
The average rank of the minimum fix was 2.1 — meaning it was usually in your top 3.
```

**Richer context.** Two signals: the match rate and the average rank of the true minimum fix. The average rank matters enormously: a 29% divergence rate where the minimum fix is always ranked #2 is much less concerning than a 29% divergence rate where it sometimes ranks #30.

**Why "average rank of minimum fix" is the more diagnostic metric:**
- If accuracy = 65% but average rank = 1.4, the heuristic almost always surfaces the right answer in positions #1–2. Running THOROUGH would mostly confirm the QUICK result.
- If accuracy = 75% but average rank = 5.2, the minimum fix is sometimes far down the list. QUICK is "right" 75% of the time, but the 25% divergences are severe.

The pairing of match rate + average rank gives a complete picture of the heuristic's reliability.

---

### Framing Option C: "Trend" Framing — Accuracy Over Time

```
Pre-ranking accuracy trend:
  ▁▃▅▆▇██░░░ → 71% (last 30 sessions)
  ▲ improving since config restructure 4 sessions ago
```

**Longitudinal.** Instead of showing only the current rate, show the trend over time as a small sparkline graph. The most recent 30 sessions as bars, with the most recent on the right.

**What the trend reveals:**
- **Rising accuracy** after a config restructure: the player simplified their architecture, reducing noise in the causal chain, making the pre-ranking heuristic more reliable.
- **Falling accuracy** as the player adds hooks and complexity: more interconnected configs create more "circumstantial" activity at the pivot tick, confusing the heuristic.
- **Stable accuracy**: the player's architecture style is consistent; the heuristic is well-calibrated to their patterns.

**Why trend matters more than the number:** A player at 65% with a rising trend is in a better state than a player at 71% with a falling trend. The trend is the signal; the number is just a moment in time.

---

### Framing Option D: "Architecture Health" Framing — Embedded in a Larger Dashboard

Rather than showing the accuracy stat in isolation inside the transparency drawer, embed it in a "Config Health" dashboard on the career screen alongside other architecture quality metrics:

```
CONFIG HEALTH (v7.2 — current)
─────────────────────────────────────────────────────
Pre-ranking accuracy:     71%    [avg: 66%]  ▲ +8pp
Divergence rate:          29%    [avg: 34%]  ▼ –5pp
Avg rank of minimum fix:  2.1    [avg: 3.8]  ▲ +1.7
EDT trajectory (90d):     –2.1 ticks/session ▼
─────────────────────────────────────────────────────
```

Pre-ranking accuracy becomes one of several architecture health indicators, not the primary focus. It sits alongside EDT trajectory (4.25), giving players a multidimensional view of how their config is evolving.

**Risk:** The dashboard framing invites optimization of all metrics simultaneously. Players might chase a specific "build" optimized for diagnostic legibility rather than actual match performance.

---

### Framing Option E: "Contextless" Display — Just the Number, No Framing

```
pre-rank accuracy: 71%
```

Minimal. The stat is visible in the drawer footer; no explanation, no context, no trend. Curious players will click it or look it up. Players who don't care will ignore it.

**This is a valid design choice.** The game doesn't have to explain everything. Sophisticated players will seek out the meaning. Community content will emerge: "what's a good pre-ranking accuracy?" becomes a forum question, and the aggregate answer from community data is more compelling than any in-game tooltip.

---

## The Gamification Risk — And Its Mitigations

The core risk: **players optimize the stat rather than using it diagnostically.**

In practice, this manifests as two anti-patterns:

**Anti-pattern 1: "THOROUGH Every Time" to verify QUICK and never record a divergence.**

A player who always runs THOROUGH after QUICK will have near-100% accuracy (since they always apply the THOROUGH result). The accuracy stat inflates. The stat stops being informative.

**Mitigation A:** Track accuracy only in sessions where the player ran QUICK mode and did NOT run THOROUGH as follow-up (the "committed to QUICK" sessions). The stat measures "when you trusted QUICK, was it right?" not "when you ran both modes, did they match?"

**Mitigation B:** Don't show accuracy improvement as a positive feedback loop. Instead of: "your accuracy improved to 75% ▲", show it neutrally: "pre-ranking accuracy: 75% (30-session moving average)." No upward arrow, no celebration.

---

**Anti-pattern 2: Architecturally "simplifying" configs to improve accuracy rather than to improve match performance.**

A highly interconnected config with many hooks is harder for the pre-ranking heuristic to analyze. Its accuracy might be 55%. A simpler config with fewer cross-agent hooks might have 80% accuracy. A player who optimizes for accuracy would strip out the hooks — which might hurt their actual match win rate.

**Mitigation A:** Add a paired "pass rate" display whenever accuracy is shown:
```
Pre-ranking accuracy: 71%   ·   Pass rate: 79%
```
Both metrics are visible simultaneously. Improving accuracy at the cost of pass rate is immediately legible.

**Mitigation B:** Introduce explicit "high-complexity, low-accuracy" architectures as advanced-game showcases. An endgame config with 8 deeply wired agents and 52% pre-ranking accuracy might perform at 95% pass rate. Accuracy is a *convenience* metric (does QUICK save me time?), not a performance metric.

---

## Unlock Timing: When to Surface the Stat

Three design options for when the accuracy stat becomes available:

**Option 1: Time-gated unlock (30 sessions)**

The stat is hidden until the player has run both QUICK and THOROUGH in at least 30 separate sessions. Before that, there isn't enough data for the stat to be meaningful.

At session 30, the transparency drawer subtly gains a new footer section:
```
NEW: pre-ranking accuracy is now available (30+ sessions of data)
pre-ranking accuracy: 68%  ···
```

The "···" ellipsis on first appearance signals that this is a new piece of information worth exploring.

**Option 2: Campaign milestone unlock**

The stat unlocks at a specific campaign narrative moment — perhaps when the player reaches "Chapter 5: Systemic Analysis" and the game introduces the concept of "how well do you know your own architecture?" The narrative framing gives the stat meaning before the player sees the number.

**Option 3: Organic discovery, no unlock**

The stat is always in the drawer footer, but it shows "collecting data (5/30 sessions)" until threshold. It's always visible as a concept; it just doesn't have a meaningful value yet.

**Recommended: Option 3.** The "collecting data" pattern is familiar (progress toward a threshold) and primes the player to care about the stat before it's meaningful. When the threshold is hit, the transition from "collecting data (30/30)" to a real percentage feels earned rather than arbitrary.

---

## Player Journeys

### Journey: Nicolás, 41, software architect, 95 hours in

**Context:** Nicolás is a professional software architect who picked up the game after a colleague mentioned it was "like debugging but as a strategy game." He's now in the mid-game, managing a six-agent architecture with a sophisticated relay chain. He uses QUICK mode and THOROUGH mode almost interchangeably — he doesn't distinguish between them by design. He just clicks whichever feels appropriate. He has no systematic diagnostic workflow.

**Minute 0:00 — The New Drawer Section**

Nicolás opens the debrief for Mission 22 — "Data Flood Response." He got a passing result (73/100) but wants to understand why three specific scenarios failed. He runs the Fix Explorer in QUICK mode.

He clicks the transparency drawer out of habit. At the bottom, where there used to be nothing, a new section:

```
Pre-ranking accuracy (last 32 sessions where QUICK was run alone):
QUICK #1 = THOROUGH minimum: 59%  (19/32 sessions)
Average rank of minimum fix: 3.4
```

He reads it twice. 59%. He's a software architect. He thinks in percentages constantly.

His immediate reaction: *59% is not good enough.* At work, a diagnostic tool that's right 59% of the time would be rejected. You'd want 90%+ before trusting it in production.

**Minute 1:00 — The Reframe**

He hovers over the "59%" and a tooltip appears:

```
Typical pre-ranking accuracy: 62–78%
Your accuracy of 59% is below typical range.
This may indicate your config has high interconnectedness
(many hooks, complex cross-agent signal routing).
Heuristics work best on clean, modular architectures.
```

He stops. *Interconnectedness.* He looks at his config. He has 14 hooks wired between agents — he built them progressively over 20 sessions to handle increasingly complex scenarios. The relay chain has four intermediate agents. There are three attention filters that influence each other's outputs.

He is a software architect. He knows exactly what this means. The pre-ranking heuristic is having trouble isolating the causal element because everything in his architecture is connected to everything else.

**Minute 2:30 — The Diagnosis**

He switches to the "average rank of minimum fix" stat: 3.4. This means even when QUICK is "wrong" (surfaces #1 when the answer is elsewhere), the true minimum fix is usually in positions 2–4. The heuristic isn't wildly off — it's just being outcompeted by nearby candidates with similar signals.

He opens the comparison table (from 4.58 comparison view) and sorts by pivot-tick activity score. The top five candidates all have pivot-activity scores between 0.68 and 0.81. The heuristic can barely distinguish between them.

His diagnosis: *the architecture doesn't have a clear causal bottleneck. Everything is a suspect. The pre-ranking can't find the smoking gun because I've built a web instead of a pipeline.*

**Minute 4:00 — The Experiment**

Nicolás makes an architectural decision not driven by performance but by diagnostics: he's going to consolidate two of his relay agents into one. Single-responsibility principle. The consolidated relay will have one clear job; if it fails, it will be unambiguous.

He plays two missions with the consolidated architecture. Opens the debrief. Runs Fix Explorer.

New accuracy stat: 68% (first sample from new data). The average rank of minimum fix: 2.1.

Still not perfect. But the heuristic can now see the consolidated relay more clearly. When the relay fails, it's the obvious suspect. Pivot-activity, recency, volatility — all three signals converge on one element instead of spreading across a network of interconnected components.

**Minute 7:00 — Resolution**

After five sessions with the consolidated architecture, accuracy is at 74%. Nicolás is satisfied — not because he optimized the stat, but because the stat confirmed his architectural intuition. Consolidating the relay made the system more legible to the diagnostic tool *because* it made the system more legible to him.

He writes a note in the session log: "Pre-ranking accuracy is a proxy for architectural modularity. Low accuracy = high coupling. High accuracy = clear interfaces."

He realizes he's been doing software architecture in a strategy game and it works the same way.

**What he does next:** Looks for other areas of the config with low individual-element diagnostic clarity. The accuracy stat isn't the goal — it's the instrument.

**UI Annotations:**
- New drawer section: appears at the bottom of the transparency drawer on first qualifying session (30+ QUICK-only sessions); separated by a thin horizontal rule from the ranking explanation above
- Tooltip on "59%": appears on hover, 150ms delay; contains benchmark range + interpretation; plain language, no score framing
- "Average rank of minimum fix": appears below the accuracy percentage as a secondary metric in lighter type; provides the "how far off is it?" context the percentage alone can't give
- "Below typical range" indicator: appears as a small amber dot to the left of "59%" — amber, not red, because 59% is still informative, just less convenient than typical

---

### Journey: Priya, 24, UX designer, 45 hours in

**Context:** Priya plays casually, a few sessions per week. She doesn't have an engineering background — she was drawn to the game by its visual design language. She uses QUICK mode exclusively because THOROUGH "takes too long and shows a bunch of numbers." She has only run THOROUGH mode 8 times total — usually by accident. She's in the game for the tactical puzzle feeling, not the diagnostic depth.

**Minute 0:00 — The Confusing Number**

Priya opens the debrief after a successful mission (82/100 pass rate — her best yet). She opens the transparency drawer to see her explanation (she learned about it from the tutorial and opened it to understand why the game was recommending that specific fix).

At the bottom, a new section:

```
Pre-ranking accuracy (collecting data: 8/30 sessions where both modes run)
```

She doesn't understand what "pre-ranking accuracy" means. She reads it as "the game needs more data." She ignores it.

Three sessions later, she accidentally runs THOROUGH by hovering and clicking the wrong button. The session counter ticks to 9.

**Minute 0:00 (Session 48) — Still Collecting**

After more sessions, the counter is at 23/30. Priya barely notices it. She's used to seeing progress counters in games — she treats this like an achievement bar she doesn't know the reward for.

**Session 57 — The Unlock**

The drawer shows:

```
Pre-ranking accuracy (your history):
QUICK matched THOROUGH: 74%  (22/30 sessions)
```

Priya reads it. She doesn't know what this means. 74%? She clicks the "?" next to the percentage.

A popup:

```
What is pre-ranking accuracy?

When you use QUICK mode, the Fix Explorer picks the most
likely cause based on what was active when the match turned.
Sometimes QUICK finds exactly what THOROUGH would find.
Sometimes it's close but not the same.

74% means: out of the 30 times you used QUICK and then
also checked THOROUGH, they matched 74% of the time.

This is typical — most players see 60–80%.
If your accuracy drops below 55%, your architecture might
be getting complex enough that QUICK is frequently misleading.

For now: QUICK is working well for your architecture.
```

Priya reads this carefully. Two things land:

1. "74% is typical" — she's normal. Not above average, not below. She files this as a non-issue.
2. "If it drops below 55%, QUICK might be misleading" — she now has a threshold. She knows what would be a warning sign.

**Minute 2:00 — No Further Action**

Priya closes the popup and continues playing. The accuracy stat is now a piece of background information she has. She isn't going to change her behavior because of it. She'll notice if it drops to 55% and reconsider using QUICK mode then.

Three sessions later: she makes a big config change — adds three new hooks between her agents. She plays two missions. The accuracy stat ticks to 66%. Still above the threshold she internalized.

She makes a bigger change in session 62 — she completely reorganizes her relay chain in a way that felt "cleaner" aesthetically. She doesn't know if it'll work mechanically. She runs two missions. Accuracy is now 78%.

**Minute 0:00 (Session 63) — A Serendipitous Discovery**

Priya opens the debrief. The accuracy stat shows 78%. She notices something: the sessions where accuracy went up corresponded to when she made the config feel "cleaner." The sessions where it went down were when she'd added a lot of hooks because it seemed like it should work.

She doesn't have the engineering vocabulary for this. But she makes a UX-adjacent observation: *when the config feels organized, the game seems to understand it better.* When there are a lot of tangled connections, the game seems confused about what to suggest.

She doesn't know she's just identified the relationship between coupling and diagnostic legibility. But she's building an intuition.

**What she does next:** Uses the accuracy stat as a "does this feel organized?" sanity check. A drop in accuracy after a config change is a signal that the change added complexity. This is entirely correct as a heuristic, even though it's not how she'd describe it.

**UI Annotations:**
- "Collecting data: N/30" progress bar: appears as a thin grey progress bar below the label; fills left to right; no text beyond the fraction; familiar progress affordance, no explanation needed
- Unlock moment: no fanfare — the progress bar simply transitions to a percentage display; the visual language says "you've collected enough data, here it is"
- "?" help icon: appears inline next to the percentage; clicking opens a 4-sentence contextual popup, not a tooltip (popovers work on mobile/touch)
- Plain-language popup: uses "you used QUICK and then also checked THOROUGH" not "sessions where QUICK was run and THOROUGH result was compared"; uses "they matched" not "results converged"; no jargon

---

### Journey: Chen Wei, 29, competitive game analyst, 280 hours in

**Context:** Chen Wei plays exclusively in Gauntlet mode (competitive). He tracks every stat the game shows him. He's at the 87th percentile for pass rate. He's been using QUICK mode for initial diagnosis and THOROUGH for verification when the pre-ranking reasoning seems suspect. He is, in game terms, a semi-professional diagnostic analyst.

**Minute 0:00 — The Number He's Been Waiting For**

Chen Wei has known that a "heuristic accuracy" stat existed since week 3, when someone on the community Discord mentioned it. He's been playing specifically to generate enough data to unlock it. Session 31: the drawer shows:

```
Pre-ranking accuracy (last 30 QUICK-only sessions):
QUICK #1 = THOROUGH minimum: 83%  (25/30)
Average rank of minimum fix: 1.7
```

83%. He is immediately suspicious of this number. 83% seems too high.

He opens his session log mentally: he knows there were six sessions in the last 30 where he specifically *did not* run THOROUGH after QUICK because he was confident the pre-ranking was right. If those six sessions actually contained divergences he didn't catch, his real accuracy might be lower.

The accuracy stat measures "when you ran both modes and compared," not "when you ran QUICK and would have been right." There's a survivorship bias.

**Minute 2:00 — The Exploit Hypothesis**

Chen Wei thinks about this carefully. The accuracy stat is computed only on sessions where both modes were run. He could, in theory, selectively run THOROUGH only on sessions where he *thought* the pre-ranking would be right — sessions where the three signals (pivot-activity, recency, volatility) all pointed strongly to one candidate.

If he curated which sessions go into the accuracy calculation, he could inflate the stat to 90%+.

He thinks: *is this useful?*

No. He would be optimizing a measurement instrument, not improving his actual diagnostic quality. The stat would stop telling him anything true about his architecture.

He makes a deliberate choice: he will run THOROUGH in sessions where he's *uncertain* about the pre-ranking, not sessions where he's confident. This will produce a more honest accuracy number — one biased toward the hard cases, not the easy ones.

In six sessions, accuracy drops to 71%. Average rank of minimum fix: 2.8.

**Minute 5:00 — The Interesting Data Point**

Chen Wei now has two numbers: 83% (easy-case biased) and 71% (hard-case biased). The delta is 12 percentage points. This means: in sessions where his pre-ranking confidence was low, the heuristic failed 29% of the time. In sessions where his confidence was high, the heuristic failed 17% of the time.

His pre-ranking confidence is itself a heuristic — he's intuitively reading the three signals and making a judgment about whether they converge clearly. That judgment is only partially calibrated.

He wants to know: are there specific architectural conditions where his pre-ranking intuition is *wrong* in a consistent direction? Are there cases where he's confident but shouldn't be?

He exports his session log (if the game supports it) and starts building a manual analysis of "confident but wrong" sessions.

**Minute 10:00 — The Forum Post**

Chen Wei writes a post titled "Pre-ranking accuracy stat: what it actually measures, its biases, and how to use it for competitive Gauntlet prep."

Key points:
1. The stat is only computed on sessions where both modes were run. Selective THOROUGH usage inflates it.
2. The average rank of minimum fix is more informative than the match rate alone.
3. Using the stat honestly means deliberately running THOROUGH on your *hard* cases, not your easy cases.
4. A rising accuracy trend after architectural changes is signal. A falling trend is signal. A flat trend means your config style is consistent.

The post gets pinned by moderators. It becomes the canonical community guide for understanding the stat.

**What he does next:** Proposes (on Discord) a community-level "aggregate accuracy by architecture style" analysis — comparing accuracy across players who use specific building-block paradigms. Do card-deckbuilders have higher accuracy than node-graphers? Are certain hook patterns more heuristic-friendly?

**UI Annotations:**
- Accuracy stat in Gauntlet context: visible in the debrief drawer after Gauntlet matches; includes a comparative indicator "vs. median player: +12pp" (showing the player is above-median in pre-ranking accuracy)
- Session log export: a JSON download of per-session Fix Explorer results including pre-ranking rank of minimum fix; accessible from the career stats screen
- "Hard-case vs. easy-case" — no in-game distinction: the game does not separate these; the analysis Chen Wei is doing is manual; this is a feature gap that could become aspect 4.88 (adaptive weight suggestion from divergence history)

---

## Strengths

**Makes the heuristic's reliability legible without making it a judgment.** The stat says "71% of the time, QUICK finds what THOROUGH would have found." It doesn't say "QUICK is good" or "QUICK is bad." It gives the player raw information and trusts them to interpret it. This is rare in games — most games give players verdicts, not instruments.

**Reveals architecture quality as a side effect.** Low accuracy correlates with high architectural coupling. The stat accidentally teaches "clean, modular configs produce better diagnostic signals" without explicitly saying so. Players who see their accuracy improve after simplifying their architecture will internalize the design principle without being lectured.

**Generates longitudinal awareness.** Players who track the stat over time develop an awareness of how their config is evolving. A dropping trend is a warning. A rising trend after a restructure is confirmation. Most strategy games give only moment-to-moment feedback; the accuracy stat gives a ten-session arc.

**Creates the right kind of community comparison.** "What's your pre-ranking accuracy?" becomes a community question with interpretive complexity (see Chen Wei's forum post). The stat is not just a leaderboard number — it's a conversation starter about architecture philosophy.

**The 71% number is genuinely interesting.** Unlike most stats that converge toward "higher is better," a 71% pre-ranking accuracy that drops to 60% after a complex but effective architectural change is actually *fine* — the player just needs more THOROUGH sessions now. The stat doesn't have an obvious optimal value, which prevents naive optimization.

---

## Weaknesses

**The survivorship bias problem.** The stat is only computed on sessions where both QUICK and THOROUGH were run. Players who use QUICK exclusively don't generate any data. This means the stat measures "pre-ranking accuracy on sessions I was already uncertain about" — which systematically under-samples easy cases and over-samples hard cases (or vice versa, depending on the player's habits). The number is not a ground-truth measure of heuristic accuracy; it's a measure of heuristic accuracy conditional on the player's THOROUGH-usage habits.

**The "71% is bad" misread.** Players without statistical context will read 71% as a C grade. The game must actively contextualize this number — "typical range is 60–80%," "random chance would be ~1%," "71% means the heuristic is roughly 70× more accurate than guessing." Without this framing, players may abandon QUICK mode based on a number that would actually justify confidence in it.

**The optimization anti-pattern is not fully preventable.** The mitigations (pairing accuracy with pass rate, not showing an upward arrow) reduce the incentive to optimize, but they don't eliminate it. A player who decides to run THOROUGH on every session to verify QUICK will end up with a 97% accuracy stat that means nothing. The game has no way to prevent this without making the stat invisible to those players — which defeats the purpose.

**Requires calibration vocabulary to be established.** The stat is only meaningful if the player already understands the three pre-ranking signals (pivot-activity, recency, volatility) and what "minimum fix" means in context. If a player encounters the stat before understanding these concepts, it is opaque. The 30-session unlock threshold is intended to ensure the concepts are established first, but the threshold is not concept-gated — it's time-gated.

**The stat is session-count sensitive.** A 30-session accuracy rate is noisy. An 83% rate over 30 sessions is a 95% confidence interval of approximately [67%, 93%]. Players treating 83% as precisely meaningful are over-interpreting. The game should display the count prominently to remind players the rate is an estimate: "83% (25/30 sessions)" not just "83%."

---

## Interaction Effects

**With 4.63 (Player-configurable pre-ranking weights):**
The accuracy stat becomes the feedback mechanism for weight tuning. The player adjusts the weights (giving more importance to recency, less to volatility), plays sessions, and watches the accuracy stat respond. This is the empirical feedback loop that transforms weight tuning from arbitrary preference to hypothesis testing. The interaction is critical: weights without accuracy feedback are just knobs; accuracy without weight control is just a measurement. Together, they are a calibration system.

**With 4.60 (Search budget as resource):**
The accuracy stat informs how the player should spend their search budget. If accuracy is 82%, spending a search token on THOROUGH is low-value — QUICK is probably right. If accuracy is 58%, spending a search token on THOROUGH is high-value — the pre-ranking is frequently misleading. The accuracy stat is the input to the budget allocation decision.

**With 4.25 (EDT trajectory as career metric):**
Both the accuracy stat and the EDT trajectory are longitudinal architecture-quality metrics. They belong together on the same dashboard or in the same "config health" view. EDT trajectory measures "are my configs getting better over time?" Accuracy measures "does the diagnostic tooling understand my configs?" A player with improving EDT trajectory but falling accuracy is building more effective architectures that are harder to diagnose.

**With 4.65 (Pre-ranking adversarial surface):**
In a competitive context, accuracy becomes adversarial information. If a player's accuracy is known to be low (their architecture confuses the pre-ranking heuristic), an opponent can design enemy configs that exploit this — creating configurations specifically tailored to further confuse the heuristic and force time-consuming THOROUGH analysis. The accuracy stat that was a personal calibration tool becomes a strategic vulnerability indicator.

**With 4.88 (Adaptive weight suggestion from divergence history):**
The accuracy stat provides the training signal for adaptive weight suggestions. After 30+ sessions, the game can analyze patterns in divergence events: "in sessions where SCOUT was modified recently but not causally active, the pre-ranking frequently over-weighted recency — suggest reducing recency weight." The accuracy stat is the outcome metric; adaptive weight suggestion is the feedback-loop improvement layer.

**With 8.09 (Diagnostic layer as teaching arc):**
The accuracy stat appears at a specific point in the teaching arc — after the player has used QUICK mode many times and has internalized the pre-ranking heuristic. It provides the meta-level reflection: "you've been using this heuristic — here's how well it's working for your specific patterns." This is the teaching arc's "mastery check" moment — the student is asked to evaluate the tool rather than just use it.

---

## Comparable Games and Media

**A/B testing dashboards (Amplitude, Mixpanel):** Product analytics tools show conversion rates with confidence intervals and sample sizes. Experienced product teams know that a 71% conversion rate with 100 sessions is less meaningful than 71% with 10,000 sessions. The accuracy stat has the same statistical literacy requirement. Robot Uprising could borrow the sample-size display pattern: "71% (n=38)" communicates both the estimate and its precision.

**Chess engine analysis accuracy:** Chess.com and Lichess show "accuracy" ratings for games played — what percentage of your moves were "best" or "excellent" according to Stockfish. Chess players have spent years calibrating what 85% accuracy means (average club player) vs. 95% (strong amateur) vs. 99% (Magnus Carloff level). Robot Uprising's pre-ranking accuracy is a domain-specific accuracy score that needs its own calibration benchmark. The chess precedent shows this is learnable with community calibration.

**Blood glucose monitors (personal medical instruments):** A CGM (continuous glucose monitor) doesn't just show blood sugar — it shows trend arrows (rising fast ↑↑, rising ↓ slowly, stable →). The trend is often more actionable than the absolute number. Robot Uprising's accuracy trend sparkline is the same pattern: the absolute number is context; the direction of change is the action signal.

**Code coverage percentages in CI/CD:** Engineering teams track test coverage percentages (62% coverage, 87% coverage). The number has no universal threshold — some projects accept 70%, others require 95%. But the trend matters: falling coverage after a merge is always a warning, regardless of absolute value. Pre-ranking accuracy has the same structure: no universal threshold, but direction matters.

**Heuristic evaluation in UX research (Nielsen):** Nielsen's heuristic evaluation method gives usability findings a severity rating based on the reviewer's judgment. The accuracy of the evaluation depends on the evaluator's calibration to the specific domain. Expert evaluators have high accuracy; novices have lower. Robot Uprising's accuracy stat is a game-specific version of evaluator calibration: how well-tuned are your diagnostic instincts to your specific architecture's failure modes?

**Go/Weiqi territory estimation:** In Go, strong players can estimate territory by eye before counting — their heuristic territory estimation. Over years of play, this estimation becomes calibrated: they know their estimates are accurate to within a certain margin. The accuracy stat teaches the same calibration for diagnostic reasoning: players learn how far their first-hypothesis is from the root cause, and that knowledge informs how much they trust it.

---

## Sensory Description

**The stat at rest (inside the closed drawer):**

Not visible. The transparency drawer is collapsed. The accuracy stat lives inside it. There is no ambient signal that the stat exists before the player opens the drawer.

**The drawer footer when closed:**

A faint row of three dots below the rank score: `· · ·`. Not interactive. Not labeled. Just a visual signal that the drawer contains more than the visible preview. Curious players will open it.

**First appearance after unlock (session 30):**

The drawer opens as usual. The player sees the familiar explanation section. Then, below the horizontal rule that separates the ranking explanation from the footer:

```
pre-ranking accuracy  ·  71%  ·  n=30
```

Small type. Dim. The "71%" is rendered in a slightly different weight — medium vs. the regular weight of the surrounding text. Not bold, not highlighted. Just slightly more present. The `n=30` is dim grey.

On hover: the entire row brightens slightly. The tooltip appears after 150ms. The row responds to mouse proximity like a button that knows it's not quite a button — it offers information, not action.

**The accuracy trend sparkline (appears after n=45):**

After 45 sessions, a micro-sparkline (6 bars, 3px wide each, 12px tall, subtle) appears to the left of the percentage. Each bar represents the accuracy in the most recent 6 "cohorts" of 7–8 sessions. Green for above-median, amber for median, grey for below. The sparkline reads left-to-right: oldest cohort to newest.

The sparkline is deliberately small — not the focus, not a chart, just a directional indicator. Rising: the bars trend upward toward the right. Falling: they drop. Stable: flat.

**When accuracy changes significantly after a config restructure:**

The next session after a 5+ percentage point change in accuracy (up or down), the accuracy footer glows faintly for 2 seconds. Not alerting — just acknowledging. The color of the glow matches the direction: warm amber for a drop, soft teal for a rise. Then it settles back to its normal dim state.

The sound is subtle: a faint chime on rise, a faint low tone on drop. Both at low volume, just above ambient. A "this changed" signal, not a "pay attention now" alarm.

**The contextual popup (when "?" is clicked):**

A floating card, 300px wide, 180px tall. Clean white background with a thin border. No background blur. The popup appears from the row, expanding outward with a 120ms ease-out spring — slightly overshoots width by 4px, then settles. Closes on click-outside or Escape.

Inside: four short paragraphs in readable body type. The benchmark range ("typical: 60–80%") is in teal. The warning threshold ("if below 55%") is in amber. Both colors match the language used elsewhere in the pre-ranking drawer, creating vocabulary consistency.

---

## Discovered New Aspects

1. **4.93 — Accuracy stat confidence interval display**: showing not just "71%" but "71% ± 14pp (n=30)" — teaching statistical uncertainty; the confidence interval shrinks as n grows, making data accumulation feel meaningful; interaction with 8.08 vocabulary claim (statistical confidence as transferable concept)

2. **4.94 — "Committed to QUICK" sessions only accuracy**: tracking accuracy specifically in sessions where the player ran QUICK and made a config change without running THOROUGH — the "did you trust it correctly?" stat, eliminating survivorship bias from selective THOROUGH usage; requires the game to track whether THOROUGH was run *before* vs. *after* the config change was applied

3. **4.95 — Accuracy leaderboard opt-in**: an optional community leaderboard showing aggregate pre-ranking accuracy distributions by config complexity tier; players can compare "how does my accuracy compare to players with similar architectural complexity?"; requires a complexity metric (perhaps: number of active hooks × number of agents); interaction with community metrics and competitive context

4. **4.96 — Accuracy-vs.-complexity scatter plot in career stats**: a two-axis visualization showing per-config-version points: x-axis = architectural complexity (hooks × agents), y-axis = pre-ranking accuracy; the player can see the tradeoff curve of their architecture history; identifies "high-complexity, low-accuracy" configs (right + down) vs. "clean, well-calibrated" configs (left + up); the scatter plot as the signature diagnostic artifact of the full career arc
