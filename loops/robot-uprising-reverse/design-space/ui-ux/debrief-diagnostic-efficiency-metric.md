# Diagnostic Efficiency as a Community-Visible Metric

**Aspect:** 4.74 — Diagnostic efficiency as a community-visible metric: a public stat showing "average THOROUGH tokens spent per session" for a given pass-rate band; players with better pre-run judgment (fewer tokens per unit of diagnostic improvement) earn a "precision diagnostician" badge; extends the Opus Magnum histogram pattern (1.03) to the Fix Explorer; risk of optimizing for the stat vs. actual diagnostic reasoning.

**Parent:** 4.60 — Search budget as resource
**Siblings:** 4.64 — Pre-ranking accuracy as displayed stat; 4.25 — EDT trajectory as career metric
**Related:** 1.03 (Opus Magnum histograms); 4.60 (search budget); 7.10 (config necropsy culture); 4.25 (EDT trajectory)

---

## The Core Problem

Robot Uprising has a diagnostic layer that costs real in-game resources. THOROUGH mode burns search budget tokens (4.60). Players who run THOROUGH on every single session are safe but wasteful — they treat diagnostics as a brute-force scan rather than a reasoning exercise. Players who never run THOROUGH save tokens but fly blind, applying QUICK-mode guesses that are wrong 20-40% of the time (4.64).

Between those extremes is the interesting player: the one who looks at the pre-ranking signals, forms a hypothesis about whether QUICK is sufficient for this particular config state, and only spends THOROUGH tokens when the heuristic feels uncertain. That player is doing something cognitively sophisticated — they are exercising **diagnostic judgment**, deciding when the cost of verification is justified by the ambiguity of the situation.

The game currently has no way to see this. Two players at the same pass rate and the same pre-ranking accuracy might have wildly different token expenditure patterns. One burns 8 tokens per session, running THOROUGH on every debrief and every multi-scenario analysis. The other burns 1.5 tokens per session, running THOROUGH only when the pre-ranking signals are ambiguous or when they are about to make a major architectural change. Both arrive at the same destination. One of them did it with a fraction of the diagnostic cost.

This is the efficiency gap. And the question is: should the game make it visible? Should other players be able to see it? And should there be a badge for it?

The answer touches something deeper than a UI feature. Making diagnostic efficiency visible creates a public statement about what the game values. If the stat exists, it says: "we think reasoning before searching is worth celebrating." If a badge exists, it says: "the community should know who does this well." These are value statements embedded in mechanic design.

---

## The Design

### The Metric: Diagnostic Efficiency Ratio (DER)

The core metric is the **Diagnostic Efficiency Ratio**: the number of THOROUGH tokens spent per percentage point of pass-rate improvement over a rolling 30-session window.

```
DER = THOROUGH tokens spent (last 30 sessions) / pass-rate delta (last 30 sessions)
```

A player who spent 12 tokens across 30 sessions and improved their pass rate by 6 percentage points has a DER of 2.0 tokens per point. A player who spent 45 tokens and improved by the same 6 points has a DER of 7.5 tokens per point. Lower is better — fewer tokens per unit of improvement.

**Edge cases and adjustments:**

- **Pass-rate regression (negative delta):** If the player's pass rate dropped, DER is undefined. The metric shows "N/A — pass rate did not improve in this window." No judgment, no negative value. A player in a regression phase is experimenting, and the metric shouldn't penalize experimentation.
- **Zero tokens spent (QUICK-only players):** DER is 0.0 — perfect efficiency on a literal reading, but meaningless. The metric shows "0 tokens spent — QUICK-only mode" rather than a misleading 0.0 value.
- **Pass rate already at ceiling (95%+):** Improvement becomes asymptotically harder. A player at 96% who spends 20 tokens to gain 0.5 points has a DER of 40.0, which looks terrible but reflects the difficulty frontier. The metric adjusts by using **marginal improvement relative to current ceiling**: at 96%, each 0.1 point counts as 1 "effective point" for DER calculation. Without this adjustment, the metric punishes high-performing players for doing hard work.
- **Minimum session threshold:** DER is only calculated after 30+ sessions with at least 5 THOROUGH uses. Below that, the display shows "collecting data (N/30 sessions)" in the same pattern as the pre-ranking accuracy stat (4.64).

### Band-Relative Display

DER in isolation is hard to interpret. Is 2.0 good? Is 7.5 bad? The answer depends on the player's pass-rate band — a player climbing from 45% to 55% faces different diagnostic challenges than one climbing from 82% to 88%.

The display shows DER alongside a **band-relative benchmark**:

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Your DER:        2.3 tokens/point
Band average:    4.1 tokens/point  (70–80% pass-rate band)
Band position:   top 18%
─────────────────────────────────────────────────
```

The "band average" comes from aggregated community data: what is the average DER for all players currently in the 70-80% pass-rate band? This is the Opus Magnum histogram pattern (1.03) applied to diagnostic behavior — showing the player where they sit relative to the community, not grading them in absolute terms.

### The Histogram: Opus Magnum Pattern Extended

Below the DER summary, a histogram shows the community distribution of DER values for the player's current pass-rate band:

```
DER DISTRIBUTION (70–80% pass-rate band, 2,847 players)

  ▓░░░░░░░░░░░░░░░  0.5–1.0  (3%)
  ▓▓▓░░░░░░░░░░░░░  1.0–2.0  (11%)
  ▓▓▓▓▓▓▓░░░░░░░░░  2.0–3.0  (24%)   ◄ YOU (2.3)
  ▓▓▓▓▓▓▓▓▓░░░░░░░  3.0–4.0  (31%)
  ▓▓▓▓▓▓░░░░░░░░░░  4.0–5.0  (19%)
  ▓▓░░░░░░░░░░░░░░  5.0–7.0  (8%)
  ▓░░░░░░░░░░░░░░░  7.0+     (4%)
```

The "YOU" marker sits in the histogram at the player's bucket. The distribution is a bell curve skewed right — most players are in the 3.0-4.0 range, with a long tail of high-spenders on the right and a narrow left shoulder of highly efficient diagnosticians.

This is pure Opus Magnum. In Opus Magnum, the histogram shows "here's how many cycles your solution took, and here's where the community clusters." The emotional payload is the same: you see the shape of the community, you find your position in it, and you feel either satisfaction (left of center) or motivation (right of center). But unlike Opus Magnum, where the metric is solution quality (lower cycles = objectively better), DER has interpretive complexity. A player on the far right might be wasteful — or might be exploring a fundamentally harder architectural space. The histogram invites this conversation rather than settling it.

### The Badge: Precision Diagnostician

When a player maintains a DER in the top 20% of their pass-rate band for 50+ sessions (roughly two months of regular play), they earn the **Precision Diagnostician** badge.

The badge has three tiers:

- **Precision Diagnostician (Bronze):** Top 20% DER for 50 sessions. Earned by roughly 15% of active Gauntlet players (some churn out of the window before reaching 50 sessions).
- **Precision Diagnostician (Silver):** Top 10% DER for 100 sessions. Earned by roughly 5% of active Gauntlet players.
- **Precision Diagnostician (Gold):** Top 5% DER for 200 sessions. Earned by roughly 1% of active Gauntlet players. This badge represents sustained excellence in diagnostic judgment across a significant portion of the player's career.

The badge appears on the player's profile card next to their Gauntlet rank and eEDT display. It is visible to other players in matchmaking lobbies, config workshop browsing, and community forums.

**What the badge communicates:** "This player gets more diagnostic value per token than most players at their skill level." It is a statement about reasoning quality, not architectural quality. A player can have a mediocre pass rate and still earn the badge — their efficiency is measured relative to their band, not absolutely.

---

## Player Journeys

### Journey: Marco, 34, data engineer, 120 hours in

**Context:** Marco approaches Robot Uprising like he approaches work: systematically. He keeps a spreadsheet. He tracks his token spend per session. He noticed weeks ago that his THOROUGH usage was declining — not because he was avoiding it, but because he was getting better at reading the pre-ranking signals. He runs THOROUGH only when the pivot-activity and recency signals disagree with each other, which he's learned correlates with ambiguous causality in his relay-chain architecture.

**Minute 0:00 — The New Panel**

Marco opens his career stats screen after his 95th Gauntlet session. A new section has appeared below the eEDT spark-line and above the pre-ranking accuracy stat:

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Your DER:        1.8 tokens/point
Band average:    3.9 tokens/point  (75–85% pass-rate band)
Band position:   top 9%
─────────────────────────────────────────────────
```

He reads it quickly. 1.8 tokens per point of pass-rate improvement. Band average 3.9. He's spending less than half the tokens of the typical player at his level.

He clicks the DER number. The histogram expands below:

```
DER DISTRIBUTION (75–85% pass-rate band, 1,421 players)

  ▓░░░░░░░░░░░░░░░  0.5–1.0  (2%)
  ▓▓▓░░░░░░░░░░░░░  1.0–2.0  (8%)    ◄ YOU (1.8)
  ▓▓▓▓▓▓▓░░░░░░░░░  2.0–3.0  (26%)
  ▓▓▓▓▓▓▓▓▓░░░░░░░  3.0–4.0  (33%)
  ▓▓▓▓▓░░░░░░░░░░░  4.0–5.0  (18%)
  ▓▓░░░░░░░░░░░░░░  5.0–7.0  (9%)
  ▓░░░░░░░░░░░░░░░  7.0+     (4%)
```

The "YOU" arrow sits in the narrow left shoulder. He's in the 8% bucket — the players who get significant pass-rate improvement per token spent.

**Minute 1:30 — The Validation**

Marco has been doing this intuitively. He never articulated his heuristic explicitly, but he knows what it is: he runs THOROUGH when the pre-ranking drawer shows a top candidate with a pivot-activity score below 0.70 and a recency score above 0.80. That combination — low activity signal but high recency — usually means something was recently modified but didn't actually contribute to the failure. The pre-ranking heuristic over-weights recency in those cases. THOROUGH catches the real cause, which is usually an older element with steady-state activity that the QUICK scan underweights.

The DER stat tells him his heuristic for "when to verify" is working. Not perfectly — he still burns some tokens on sessions where THOROUGH confirms QUICK. But his hit rate on when THOROUGH changes the result is high enough that his per-token return on diagnostic investment is in the top 10%.

**Minute 3:00 — The Badge Notification**

A small notification appears below the histogram:

```
PRECISION DIAGNOSTICIAN (BRONZE)
Unlocked: top 9% DER sustained for 50+ sessions
```

The badge icon appears: a small magnifying glass with a single clean beam — not the wide-spray magnifier used for general search, but a focused, narrow-beam diagnostic instrument. Bronze-tinted, with a faint pulse animation on the lens that plays once and settles.

Marco screenshots the badge and the histogram. He posts it to Discord with the comment: "the game now tracks what I've been doing manually in a spreadsheet." Three people ask what DER means. Marco explains it, which teaches the concept to three more players.

**Minute 5:00 — The Community Thread**

One of the three people who asked responds: "My DER is 6.2. I run THOROUGH on literally everything. Am I doing it wrong?"

Marco replies: "Not wrong. But you might be able to save tokens by checking the pre-ranking signals before running THOROUGH. If the top candidate has high pivot-activity AND high recency AND high volatility — all three signals agree — THOROUGH almost never changes the result. Save your tokens for the ambiguous cases."

This is the teaching loop. The stat made the behavior visible. The badge made it aspirational. The community conversation transmits the reasoning.

**UI Annotations:**
- DER panel location: below the eEDT spark-line on the career stats screen; separated by a horizontal rule; same visual weight as eEDT — not primary, not secondary, a peer metric
- Histogram expand: click-to-expand from the DER number; animates open with a 200ms slide-down; the histogram bars draw left-to-right over 400ms, each bar growing to its height with a slight overshoot spring
- Badge notification: appears inline below the histogram on the session where the threshold is met; no modal, no interruption; the player discovers it when they next look at their career stats; the notification persists for 3 sessions then disappears (the badge itself is permanent on the profile)

---

### Journey: Leila, 22, art student, 50 hours in

**Context:** Leila plays Robot Uprising casually, mainly for the aesthetic experience — the corruption animations, the sealed-watch tension, the satisfying moment when a config change resolves a cluster of failing scenarios. She uses QUICK mode almost exclusively. She has spent exactly 3 THOROUGH tokens in 50 hours of play — all three by accident, clicking the wrong button in the Fix Explorer.

**Minute 0:00 — The Invisible Metric**

Leila opens her career stats. The DER section shows:

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Collecting data: 3 THOROUGH uses (minimum 5 for DER)
─────────────────────────────────────────────────
```

She doesn't understand what "DER" means. She reads "collecting data" and treats it the same way she treated the pre-ranking accuracy counter — a progress bar for something she'll look at later. She closes the panel.

**Session 58 — Accidental Discovery**

Leila fails a mission she's been stuck on for three sessions. Pass rate: 62%. She opens the Fix Explorer in QUICK mode. The pre-ranking shows her top candidate: a relay agent's attention filter. She's changed this filter six times already. It never helps.

Out of frustration, she clicks THOROUGH. She didn't mean to — she was trying to click "Apply Fix" and missed. The search runs for 28 seconds. THOROUGH returns a different result: the minimum fix is not the relay filter at all. It's a scout agent's hook-wiring that's routing threat signals to the wrong buffer slot.

Leila stares at the result. She's been changing the relay for three sessions. The problem was the scout the entire time.

She applies the scout fix. Pass rate jumps to 78%.

**Minute 2:00 — The Emotional Recalibration**

Leila sits with this for a moment. QUICK told her to change the relay. THOROUGH told her to change the scout. THOROUGH was right. She wasted three sessions because she trusted QUICK.

She opens the career stats panel. The DER section now shows:

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Collecting data: 4 THOROUGH uses (minimum 5 for DER)
Pass-rate improvement from THOROUGH-informed fixes: +16pp (1 session)
─────────────────────────────────────────────────
```

She reads the "+16pp" — sixteen percentage points of improvement from one THOROUGH session. She doesn't know what DER is yet, but she knows what "+16pp from one THOROUGH" means. It means that one token, spent at the right moment, was worth three sessions of trial-and-error QUICK-mode guessing.

**Session 62 — The Fifth THOROUGH**

Leila now has a policy: she runs QUICK first, reads the result, and asks herself "does this feel like the relay filter again?" If it does — if the pre-ranking is suggesting the same element she's already tried — she spends a THOROUGH token. If QUICK suggests something new, she trusts it.

She runs her fifth THOROUGH on session 62. The DER panel unlocks:

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Your DER:        0.6 tokens/point
Band average:    4.3 tokens/point  (60–70% pass-rate band)
Band position:   top 2%
─────────────────────────────────────────────────
```

0.6 tokens per point. Top 2%. She has no idea this is extraordinary. She's only used THOROUGH 5 times. But every time she used it, it was because QUICK was wrong and she knew it was wrong. Her token-to-improvement ratio is almost impossibly efficient — because she spent tokens only at moments of maximum diagnostic leverage.

**Minute 1:00 — The Misleading Outlier**

This is also a design problem. Leila's DER is 0.6 because her sample size is tiny (5 uses) and each one happened at a crisis point. Her "efficiency" is real — she genuinely spent tokens at high-value moments — but it's also fragile. If she starts using THOROUGH more regularly (including on sessions where it confirms QUICK), her DER will rise toward the band average. The current 0.6 is a statistical artifact of extreme selectivity.

The game handles this with a sample-size indicator:

```
Your DER: 0.6 tokens/point (n=5, low confidence)
```

The "(n=5, low confidence)" suffix appears when the THOROUGH usage count is below 15. It tells the player: this number is real but preliminary. It will stabilize as you accumulate more data.

**What Leila does next:** She doesn't optimize for DER. She doesn't even know what the histogram means. But she has learned something more valuable — THOROUGH is worth spending when QUICK keeps suggesting the same thing. That heuristic will serve her for the rest of her time with the game.

**UI Annotations:**
- "Collecting data" state: same visual pattern as pre-ranking accuracy (4.64) — grey text, progress counter, no bar chart; familiar "not ready yet" affordance
- "+16pp" improvement callout: appears only in the collecting-data phase when THOROUGH uses are sparse; each THOROUGH use is individually attributed; disappears once DER is calculated (the aggregate replaces the individual)
- "(n=5, low confidence)" suffix: rendered in lighter type, same size as the DER number; disappears at n=15 when the game considers the sample sufficient for stable estimation

---

### Journey: Tomoko, 27, competitive player, 310 hours in

**Context:** Tomoko is a Gauntlet veteran at the 92nd percentile. Pass rate: 89%. She uses THOROUGH strategically — running it before Gauntlet matches against opponents she respects, skipping it for routine campaign tune-ups. She has a Silver Precision Diagnostician badge. Her DER is 2.1 in the 85-95% pass-rate band, which puts her in the top 8%.

**Minute 0:00 — The Badge as Social Signal**

Tomoko is browsing the config workshop for ideas. She filters by pass rate > 85% and sorts by "recently published." She sees a config posted by a player named `rho_vector` — pass rate 87%, eEDT 0.52, and next to the name: a Gold Precision Diagnostician badge.

She clicks into the config. Before reading the architecture, she reads the player's DER panel (visible on shared profiles):

```
rho_vector — DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
DER:             1.4 tokens/point
Band average:    3.6 tokens/point  (85–95% pass-rate band)
Band position:   top 3%
Badge:           Precision Diagnostician (Gold) — 200+ sessions
─────────────────────────────────────────────────
```

1.4 tokens per point. Gold badge. 200+ sessions of sustained top-5% efficiency. Tomoko reads this as: "this person doesn't waste diagnostic resources. When they publish a config, they've already done the hard reasoning work internally before verifying with THOROUGH. Their architectural choices are probably well-reasoned."

The badge is functioning as a **trust signal**. It's not telling Tomoko the config is good. It's telling her the person who made it thinks carefully about when to verify and when to trust their judgment. That's a proxy for architectural competence.

**Minute 2:00 — The Workshop Filter**

Tomoko discovers a new filter option in the workshop: "Published by Precision Diagnostician (any tier)." She enables it. The config list narrows from 340 results to 89. These 89 configs were all published by players who maintain efficient diagnostic habits.

She's now browsing a curated subset of the community — not curated by a moderator, but by the metric itself. The DER badge acts as a quality filter that nobody had to manually maintain.

**Minute 4:00 — The Adversarial Question**

Later, on Discord, someone posts: "Is the Precision Diagnostician badge gameable? Can't you just never run THOROUGH and get a DER of zero?"

Tomoko replies: "No. DER requires minimum 5 THOROUGH uses per 30-session window, and the badge requires 50+ sessions. If you run THOROUGH only 5 times in 50 sessions, your DER might be low but your pre-ranking accuracy (4.64) will be unverified — you don't know if your QUICK results were right. The badge rewards players who use THOROUGH *selectively and correctly*, not players who avoid it."

Someone responds: "But what about sandbagging? What if I tank my pass rate, then 'improve' it with cheap THOROUGH verifications?"

Tomoko: "Pass-rate band adjustment handles that. DER is measured relative to your current band. Dropping from 85% to 70% puts you in the 70-80% band where the benchmark is different. You can't game cross-band comparisons because the metric doesn't make cross-band comparisons."

**Minute 7:00 — The Meta-Observation**

Tomoko writes a longer post: "The Precision Diagnostician badge is interesting because it's the only badge in Robot Uprising that rewards a *process* rather than an *outcome*. Pass rate rewards winning. eEDT rewards architectural depth. Gauntlet rank rewards competitive performance. But DER rewards *how you think about diagnosis*. It's measuring reasoning efficiency, not results."

She continues: "This is also its biggest risk. If people start optimizing DER directly — hoarding THOROUGH tokens, only spending them when they're sure the fix will improve their pass rate — they'll miss the exploratory THOROUGH sessions where you learn something unexpected. The best diagnosticians don't just verify hypotheses. They sometimes run THOROUGH out of curiosity, with no specific hypothesis, just to see what the exhaustive search reveals. That kind of exploratory diagnosis has high DER (tokens spent without immediate pass-rate improvement) but high *learning value*. The metric can't see the difference."

This is the fundamental tension. She posts it. The thread gets 47 upvotes and becomes a reference in the game's design conversation.

**UI Annotations:**
- Workshop badge display: badge icon appears to the right of the player name on config cards; Bronze = warm copper icon, Silver = cool silver, Gold = warm gold with a faint radial glow; badge has a tooltip on hover showing the exact DER and band position
- Workshop filter: checkbox in the "Published By" filter group; "Precision Diagnostician (any tier)" with a small dropdown for specific tiers; the filter icon in the search bar gains a small badge dot when this filter is active
- Profile DER panel (public view): visible when viewing another player's profile from workshop or matchmaking; shows DER, band average, band position, and badge tier; does not show the histogram (histogram is private — only visible to the player themselves)

---

### Journey: Amir, 39, high school teacher, 30 hours in

**Context:** Amir teaches physics. He picked up Robot Uprising because a student mentioned it. He's mid-campaign, pass rate hovering around 55%. He's been using THOROUGH mode generously because he wants to understand the diagnostic system — he treats it like a teaching tool, running both QUICK and THOROUGH to see how they differ.

**Minute 0:00 — The Uncomfortable Number**

Amir opens his career stats after unlocking DER at session 35. He's run THOROUGH 22 times in 35 sessions.

```
DIAGNOSTIC EFFICIENCY
─────────────────────────────────────────────────
Your DER:        5.8 tokens/point
Band average:    4.5 tokens/point  (50–60% pass-rate band)
Band position:   bottom 38%
─────────────────────────────────────────────────
```

5.8 tokens per point. Below average. He clicks into the histogram:

```
DER DISTRIBUTION (50–60% pass-rate band, 3,102 players)

  ▓░░░░░░░░░░░░░░░  0.5–1.0  (2%)
  ▓▓░░░░░░░░░░░░░░  1.0–2.0  (7%)
  ▓▓▓▓▓░░░░░░░░░░░  2.0–3.0  (17%)
  ▓▓▓▓▓▓▓▓░░░░░░░░  3.0–4.0  (27%)
  ▓▓▓▓▓▓▓▓▓▓░░░░░░  4.0–5.0  (25%)
  ▓▓▓▓▓░░░░░░░░░░░  5.0–7.0  (15%)   ◄ YOU (5.8)
  ▓▓░░░░░░░░░░░░░░  7.0+     (7%)
─────────────────────────────────────────────────
```

He's in the right half of the distribution. Most players at his level spend fewer tokens per point of improvement.

**Minute 1:30 — The Teacher's Reframe**

Amir pauses. He's a physics teacher. He knows what over-measurement looks like. In the lab, students who take 50 measurements when 10 would suffice aren't being more careful — they're avoiding the intellectual work of understanding the system well enough to predict the result.

He's been doing this. He runs THOROUGH not because he's uncertain about QUICK but because he wants to see both results. He's treating the diagnostic tool as a demonstration aid, not as an instrument. He learns from the comparison — but the game is telling him this learning comes at a cost that other players don't pay.

**Minute 3:00 — The Deliberate Choice**

Amir decides to keep his current approach. He's still learning the game. Running both modes teaches him the pre-ranking signals faster than trusting QUICK alone would. His DER is high because he's in a learning phase. Once he's calibrated — once he can predict when QUICK will match THOROUGH — he'll stop running THOROUGH automatically and his DER will drop.

He makes a mental note: "Check this stat again in 20 sessions. If it hasn't improved, I'm not learning from the comparisons."

This is the correct response. The metric is surfacing a real cost. The player is choosing to pay it for a reason. The game doesn't judge the choice — it just makes the cost visible.

**UI Annotations:**
- "Bottom 38%" framing: the band position uses "bottom X%" when the player is in the lower half, "top X%" when in the upper half; this is asymmetric by design — "top 9%" feels positive, "bottom 38%" feels neutral-to-informative, not punishing; the language never says "poor" or "below average"
- Histogram "YOU" marker: positioned at the right-of-center; the visual weight of the histogram bars on the left makes the player's position contextually clear without needing color coding

---

## Strengths

**Makes diagnostic reasoning visible as a skill.** Most strategy games surface only outcomes — win rate, score, rank. DER surfaces the quality of the player's diagnostic *process*, independent of the diagnostic *result*. This is analogous to chess analysis accuracy (4.64 already draws this comparison), but applied to a meta-cognitive skill: knowing when to verify.

**Creates a new axis of community identity.** "Precision Diagnostician" joins the vocabulary alongside eEDT-defined archetypes and pass-rate-defined skill bands. A player can now be "high eEDT, high DER, moderate pass rate" — a midgame architect with excellent diagnostic instincts who hasn't yet translated those instincts into consistent wins. This three-dimensional profile is richer than any single metric.

**The Opus Magnum histogram drives community comparison without toxicity.** The histogram pattern (1.03) shows distribution, not ranking. A player in the right tail of the DER histogram isn't "bad" — they might be learning, experimenting, or working in a harder architectural space. The distribution shape tells a community story: if the histogram is heavily right-skewed, most players are over-spending on THOROUGH. If it's left-skewed, the pre-ranking heuristic is so good that THOROUGH is rarely needed. The shape is diagnostic of the game's balance, not just the player's skill.

**The badge functions as a trust signal in the workshop.** When a Gold Precision Diagnostician publishes a config, the badge says "this person is thoughtful about verification." This is a softer, more interesting trust signal than pass rate (which just says "this person wins"). It filters the workshop toward architecturally careful players, which raises the quality of shared configs.

**Teaches token conservation without a tutorial.** Players who see their DER above the band average will naturally ask: "how do other players spend fewer tokens?" The answer — reading pre-ranking signals, forming hypotheses before verifying — is the entire skill the diagnostic layer is trying to teach. The metric creates the pull; the community provides the curriculum.

---

## Weaknesses

**Penalizes exploratory THOROUGH usage.** Tomoko's meta-observation in Journey 3 identifies this precisely: running THOROUGH out of curiosity — to see what the exhaustive search reveals, with no specific hypothesis — is valuable learning behavior that DER treats as waste. A player who runs THOROUGH on a session where QUICK was correct gets no pass-rate improvement and pays a token, worsening their DER. The metric cannot distinguish "wasteful verification" from "valuable exploration."

**Mitigation considered and rejected:** Excluding "confirmatory" THOROUGH sessions (where THOROUGH matched QUICK) from DER calculation. This would solve the exploration penalty but create an incentive to run THOROUGH only when the player suspects QUICK is wrong — which defeats the purpose of occasional verification. The mitigation is worse than the disease.

**The badge creates a perverse incentive to hoard tokens.** A player pursuing Gold Precision Diagnostician might avoid running THOROUGH in borderline cases — cases where they're 60% confident QUICK is right but would benefit from verification. The marginal token cost isn't worth the DER hit. This means the badge incentivizes *under-verification* among ambitious players, which is the opposite of what the diagnostic layer should teach.

**DER is undefined during pass-rate regression.** A player who spends 30 tokens over 30 sessions while their pass rate drops 5 points has no DER — the metric shows "N/A." This is honest but frustrating. The player spent real resources; the metric dismisses them. An alternative formulation — "tokens spent per session" without the improvement denominator — would always be defined but would lose the efficiency interpretation that makes the metric interesting.

**Band-relative benchmarks require a large player base.** The histogram and "band average" are only meaningful with hundreds of players per band. At launch, before the community reaches critical mass, the benchmarks will be noisy or absent. The game must handle the cold-start gracefully — perhaps showing "band average: calculating (87 players in band)" until the player count exceeds a confidence threshold.

**Cross-band comparisons are misleading and the UI must prevent them.** A player at the 50-60% band cannot meaningfully compare their DER to a player at the 85-95% band. The architectural challenges, the pre-ranking heuristic's accuracy, and the marginal cost of improvement are all different. The UI must never show cross-band rankings. The histogram is always band-scoped. The badge is band-relative. But players will still compare raw DER numbers in Discord conversations, and those comparisons will be misleading.

---

## Interaction Effects

**With 4.60 (Search budget as resource):**
DER is the efficiency metric for the search budget. Without a search budget, DER is academic — THOROUGH is free, so "tokens per point" is a dimensionless curiosity. With a budget, DER becomes *strategic information*. A player with 8 tokens remaining and a DER of 2.0 can estimate: "I can probably generate 4 more points of improvement with my remaining budget." A player with DER 6.0 can estimate: "I'll get maybe 1.3 points." The budget makes DER actionable; DER makes the budget legible. This interaction is the core coupling that makes 4.74 viable.

**With 1.03 (Opus Magnum histogram pattern):**
4.74 is the second application of the histogram pattern after the original solution-quality histogram. The pattern expands from "how good is your solution?" to "how efficient is your diagnostic process?" This establishes a design precedent: any player metric that has a community distribution can get a histogram. Future aspects might apply the pattern to eEDT (4.25), pre-ranking accuracy (4.64), or config necropsy frequency (7.10). The histogram pattern becomes a design vocabulary, not a one-off feature.

**With 4.64 (Pre-ranking accuracy stat):**
DER and pre-ranking accuracy are complementary but distinct. Accuracy says "how often is QUICK right?" DER says "how much do I spend verifying?" A player with 80% accuracy and low DER is well-calibrated — they trust QUICK when it's reliable and verify when it's not. A player with 80% accuracy and high DER is over-verifying — spending tokens even when QUICK is usually right. A player with 60% accuracy and low DER is under-verifying — trusting QUICK even though it's often wrong. The pairing of the two metrics creates a 2x2 matrix of diagnostic behaviors, each with different teaching implications.

**With 7.10 (Config necropsy culture):**
The DER badge adds a new dimension to config necropsies. When a Gold Precision Diagnostician posts a version-history retrospective, the community reads it differently: "this person verified their changes efficiently — their diagnostic conclusions are likely well-grounded." The badge's trust signal extends from the workshop into the necropsy format. Necropsy authors might begin including their DER alongside their pass-rate trajectory, creating a richer narrative: "I improved from 72% to 84% over 8 versions, spending an average of 1.9 tokens per point."

**With 4.25 (EDT trajectory):**
DER and eEDT are both career-level metrics that live on the profile card. Together with pass rate and Gauntlet rank, they form a four-metric identity: how much you win (pass rate), how deeply your configs fight (eEDT), how efficiently you diagnose (DER), and how you rank against competitors (Gauntlet rank). Each metric captures a different dimension of player skill. The profile card becomes a character sheet — not for an RPG character, but for the player's cognitive style.

---

## Comparable Games and Media

**Opus Magnum (Zachtronics) — Community histogram as motivational instrument:** The direct ancestor. Opus Magnum shows a histogram of community cycle counts for each puzzle. The player sees where they sit. No judgment, just position. The emotional effect is powerful: players left of center feel earned satisfaction; players right of center feel pull. DER's histogram is the same mechanic applied to a behavioral metric (token spend) rather than a solution metric (cycle count). The key design lesson from Opus Magnum: **the histogram must appear after the player has already committed to their result.** Showing the distribution before the player acts turns the histogram into a target to optimize; showing it after preserves the organic behavior and lets the player evaluate retrospectively.

**Chess.com Accuracy rating — Process metric vs. outcome metric:** Chess.com's accuracy metric (Stockfish analysis of move quality) correlates weakly with win rate but strongly with improvement trajectory. DER has the same structural relationship to pass rate: high-pass-rate players can have mediocre DER (they spend tokens freely because they can afford it), and low-pass-rate players can have excellent DER (they spend tokens surgically because they have to). The metric measures process quality, not outcome quality.

**Medical diagnostic efficiency studies — "Number needed to test":** In clinical medicine, diagnostic efficiency is measured by "number needed to test" (NNT) — how many diagnostic tests must be ordered to find one actionable result. A physician with NNT=3 orders three tests per diagnosis; NNT=8 orders eight. Low NNT correlates with better clinical judgment, not better patients. DER is the game-design analogue: how many THOROUGH verifications must a player run per unit of architectural improvement? The medical precedent shows this metric is inherently controversial — it can be used to reward efficient diagnosticians or to pressure physicians into under-testing.

**Stack Overflow reputation badges — Process-based achievement:** Stack Overflow's "Electorate" badge (voted on 600 questions, with 25%+ on questions, not just answers) rewards a behavioral pattern, not an outcome. You don't earn it for writing good answers — you earn it for voting thoughtfully across the platform. Precision Diagnostician is the same design: it rewards a behavioral pattern (efficient token usage) rather than an outcome (high pass rate). The lesson from Stack Overflow: process badges create identity around behavior, which shapes community culture more than outcome badges do.

**Factorio efficiency metrics — SPM (science per minute) as community benchmark:** The Factorio community self-organized around SPM as the standard measure of factory performance. SPM isn't in the game's UI — the community invented it. The existence of DER as an official game metric shortcuts this community-invention process and ensures the metric is well-defined rather than ambiguously measured. The risk: an official metric can feel imposed rather than discovered, which reduces community ownership. Factorio's SPM works partly because the community chose it.

---

## Sensory Description

**The DER number at rest on the career stats panel:**

A single line of text in the same typographic family as the eEDT display. The DER value — "1.8 tokens/point" — is rendered in medium weight, slightly larger than the surrounding label text. The slash in "tokens/point" is rendered as a thin hairline diagonal, not a full glyph — giving the unit a clean, technical feel. The "tokens" and "point" are in regular weight flanking the number.

The color of the DER number shifts subtly with its band position:
- Top 10%: a cool teal, the same teal used for pre-ranking explanation text in the transparency drawer. Reads as "calibrated, precise, clinical."
- Middle 50%: neutral off-white, the default text color. Reads as "present, unremarkable."
- Bottom 20%: warm amber, the same amber used for pre-ranking divergence warnings. Not red. Not alarming. Just amber — "worth noticing."

These colors are not explained anywhere. They are not labeled. A player who tracks their DER over time will notice the color shift when their efficiency changes. The color is a felt signal, not an annotated one.

**The histogram when expanded:**

The histogram bars draw left-to-right with a staggered 40ms delay between each bar. Each bar grows from zero to full height with a gentle ease-out curve (200ms duration). The bars are filled with a gradient: the left edge of each bar is slightly lighter, the right edge slightly darker — giving a sense of depth, as if each bar is a column of stacked tokens viewed at an angle.

The "YOU" marker is a small triangle below the player's bucket, pointing upward. It appears 300ms after the histogram finishes drawing — a beat of delay that lets the eye scan the distribution shape before locating the self-reference. The triangle is the same teal/off-white/amber as the DER number, matching the player's band position.

The bars themselves are rendered in a desaturated blue-grey — not attention-grabbing, not colorless. The population counts at the right of each row ("24%", "31%") are in dim grey, small type. The histogram is the shape that matters, not the numbers. The numbers are there for players who want precision; the shape is there for everyone.

**The badge when earned:**

The Precision Diagnostician badge icon is a magnifying glass viewed from above — the lens is a perfect circle, the handle extends downward at 45 degrees. Inside the lens, a single converging beam pattern: three lines meeting at a point in the center, suggesting focused analysis rather than broad search.

- **Bronze:** The icon is rendered in warm copper with a matte finish. No glow, no shimmer. Solid, earned, understated. On first appearance, the icon materializes with a 600ms fade-in — slow enough to feel intentional, fast enough to not feel dramatic.
- **Silver:** The icon gains a subtle reflective quality — the lens has a faint specular highlight that shifts position as the user scrolls, simulating a polished surface catching ambient light. The beam pattern inside the lens brightens slightly.
- **Gold:** The lens has a warm radial glow — not a particle effect, not a starburst, just a gentle luminance that extends 4px beyond the icon boundary. The beam pattern inside pulses once every 8 seconds: a slow, breathing rhythm. The gold tint is warm but not yellow — closer to the color of late-afternoon light through clear glass.

**Audio on badge unlock:**

A single tone. Not a fanfare. Not a chime sequence. One note: a glass bell struck cleanly, with a 2-second sustain that decays naturally. The pitch is F#4 — high enough to feel bright, low enough to not feel shrill. The attack is sharp (10ms); the decay is slow and natural. It plays once. It does not repeat. It does not layer with any other audio.

The silence after the tone is part of the design. The game does not follow up with text ("Congratulations!"), does not show a modal, does not interrupt play. The tone says: "something just happened." The player finds the badge when they next open their career stats. The discovery is private and quiet.

**The DER panel in the workshop (viewing another player's profile):**

When hovering over another player's config card in the workshop, the DER appears as part of the expanded stats tooltip. The badge icon sits to the right of the player's name. The DER number appears on a line below eEDT and pass rate:

```
rho_vector                    [Gold badge icon]
Pass rate: 87%  ·  eEDT: 0.52
DER: 1.4 tokens/point  ·  top 3% (85–95% band)
```

The badge icon on another player's card is rendered at 16x16px — small, but distinctive enough that the magnifying-glass shape is recognizable. On hover, the icon scales to 24x24px with a smooth 100ms transition, and the tooltip extends to show the full badge description: "Precision Diagnostician (Gold) — top 5% diagnostic efficiency for 200+ sessions."

The tooltip background is the darkest grey in the game's palette, with text in soft white. The badge name is rendered in the badge's metallic color (gold text for Gold tier). The overall feel is: information-dense but not cluttered, clinical but not cold. A profile card that tells you who this player is without asking you to click through three menus.

---

## Discovered New Aspects

1. **4.75 — Exploratory THOROUGH sessions as a tracked category:** Distinguishing "hypothesis-testing THOROUGH" (player had a specific expectation) from "exploratory THOROUGH" (player ran it to see what would happen); tracking both separately for DER calculation; exploratory sessions might be excluded from DER to avoid penalizing curiosity-driven diagnosis; interaction with 8.09 (diagnostic layer as teaching arc)

2. **4.76 — DER cold-start histogram bootstrapping:** Designing the histogram display for launch-day when each pass-rate band has fewer than 100 players; options include synthetic benchmark data from playtesting, a "coming soon" placeholder, or showing raw distributions without band averages; interaction with community formation timing and first-impression design

3. **4.77 — Cross-session DER trend as a learning-rate indicator:** Plotting DER over time as a spark-line alongside eEDT — a falling DER curve means the player is getting better at knowing when to verify; the DER slope as a measure of meta-cognitive improvement speed; interaction with 4.25 (EDT trajectory) and 4.64 (pre-ranking accuracy trend)

4. **4.78 — "Precision Diagnostician" badge as Gauntlet matchmaking signal:** Using the badge tier as an input to matchmaking — pairing players with similar diagnostic styles creates more interesting post-match comparisons; risk of badge-based matchmaking creating skill-disconnected pairings; interaction with competitive integrity concerns

5. **4.79 — DER-weighted config workshop recommendations:** Recommending configs published by high-DER players more prominently in browse/search results; the badge as implicit quality curation; risk of creating a two-tier workshop where non-badged configs are systematically deprioritized; interaction with 7.10 (config necropsy) as an alternative trust signal
