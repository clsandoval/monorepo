# EDT Trajectory as Career Progress Metric

**Aspect:** 4.25 — A 30-match rolling EDT average as a first-class career stat, showing whether a player's architectures trend toward more-contested matches over time; EDT trajectory as the measure of architectural improvement orthogonal to win/loss rate; a player whose EDT moves from 0.20 to 0.45 has improved their opener even if their win rate stayed flat

**Parent:** 4.18 — Effective Outcome Timestamp as First-Class Metric
**Siblings:** 4.26 — False Pivot Gap as Standalone Metric; 4.27 — Pivot Accuracy as Displayed Stat; 7.12 — Community-Visible EDT Distributions per Config Archetype
**Related:** 8.12 — EDT as Campaign Difficulty Calibration; 7.11 — Match Duration as Community Health Signal; 7.09 — Arms Race as Designed Meta-Evolution

---

## The Core Concept

Every Robot Uprising match produces an EDT: the normalized ratio of (Effective Determination Tick / Max Ticks), ranging from 0.00 to 1.00. A match with EDT 0.18 resolved its outcome in the first fifth of available time — whether it was a fast stomp or a fast collapse. A match with EDT 0.67 was genuinely contested for two-thirds of the match before fate was sealed.

The 30-match rolling EDT average — call it **eEDT** (effective career EDT) — tracks a simple question: **are your architectures creating genuine contests, or are they resolving fast?**

This is orthogonal to win rate in a way that unlocks an entirely new axis of improvement feedback:

| Win rate | eEDT | What's happening |
|----------|------|-----------------|
| 70% | 0.18 | Rush player. Wins fast, loses fast. Not learning late-game architecture. |
| 70% | 0.52 | Balanced architect. Wins are earned across the full match. |
| 50% | 0.18 | Being countered hard OR countering hard in alternation — no midgame. |
| 50% | 0.55 | Fair fights. Architecture is competitive, just needs refinement to close. |
| 60% | 0.15 → 0.42 | Opener improved dramatically. Even if win rate barely moved, now playing in a new game. |

The last row is the unlock: **EDT trajectory reveals opener improvement that win rate cannot detect.** A player who was getting rolled in 12 ticks on 40% of their matches but who redesigned their opener now loses slower (or wins slower). Win rate might not shift yet. But EDT moved 0.27 points upward — and that shift is diagnostic and real.

This makes eEDT the "accuracy score" of Robot Uprising. Chess.com's Accuracy metric (powered by Stockfish analysis) correlates weakly with win rate but strongly with game-quality improvement over time. Players who watch their Accuracy trending up feel tangible progress even during losing streaks. eEDT serves the same function — a signal of architectural quality that doesn't collapse when the meta punishes your current win strategy.

---

## The eEDT Display

### Location and Context

The 30-match rolling eEDT appears in three surfaces:

**1. Player Profile Card** — Beside win rate and Gauntlet rank, a small spark-line graph shows the last 90 matches of EDT values, with the 30-match rolling average overlaid as a smooth curve. Hovering over the card shows the exact current eEDT and its 30-day delta (↑0.08 = "improving contest quality"). The color of the spark-line gradient shifts from red (eEDT < 0.25) through amber (0.25–0.40) through green (0.40–0.60) through a distinctive deep violet (0.60+, rare "midgame master" territory).

**2. Post-Match Summary Panel** — After the two-act debrief, the summary panel shows three numbers side by side:
```
WIN RATE (30)   eEDT (30)   GAUNTLET RANK
    58%           0.47           #812
                 ↑ 0.06
```
The eEDT delta (↑ or ↓ from the previous 30-match window) is shown in smaller text below. If the delta is positive, it glows briefly in the same green as the EDT diamond in the timeline — a subtle connection between the individual match metric and the career metric.

**3. Workshop Config Profile** — When a player publishes a config to the workshop, its eEDT at time of publishing is shown on the config card. Community members browsing builds can see not just win rate but whether this is an "early-resolver" or "late-resolver" config. This creates a new axis of discovery: players looking for configs that play into the midgame can filter for eEDT > 0.40.

---

## The Mechanics of the Rolling Window

A 30-match window creates several interesting edge cases that require deliberate design:

**New player problem**: A player with only 8 matches doesn't have 30 data points. Options:
- Show eEDT only when ≥10 matches played (with a "10 matches to unlock EDT trajectory" nudge)
- Show the N-match average with N displayed: "eEDT (8)" in grey italics, becomes "eEDT (30)" in full color at 30

The second approach is better — it lets new players see the metric early, when it's most motivating, while communicating its provisional nature.

**Gauntlet-only vs. all matches**: Campaign missions have scripted configurations and will have artificially low EDT (because the campaign config is designed to be beatable, not perfectly matched). Including campaign matches would contaminate eEDT.
Design decision: **eEDT tracks Gauntlet matches only.** Campaign has a separate "Campaign EDT" metric that appears on the campaign overview screen but is never shown on a player profile — it's a private learning metric, not an identity signal.

**Forfeit/abandon handling**: A player who abandons a match mid-execution doesn't get an EDT (match never resolved). Options:
- Exclude from rolling average (clean but gameable — players could abandon early-looking losses to preserve eEDT)
- Assign EDT = 0.00 for forfeits (punishing, incentivizes watching the full match)
- Assign EDT = the tick at which they abandoned, normalized (most honest)

The third option is most honest and connects to the sealed replay philosophy — you should watch your matches.

---

## Player Journeys

### Journey: Marcus, 24, Competitive player, 200 Gauntlet matches

**Context:** Marcus has been in the Gauntlet for two months. Win rate holding at 63%. Rank 340. He's never thought much about EDT — he noticed it on the timeline but assumed it was just a cosmetic diagnostic tool.

**Week 1 — Discovery**

Marcus is posting his match stats in a Discord community channel. Someone replies: "Your eEDT is 0.19 — that's really low. You're basically a coin flip strategy. When it works you stomp fast, when it doesn't you die fast."

Marcus opens his profile. The spark-line is almost entirely red, clustered near the bottom. The rolling curve barely moves — flat at 0.19 for 30 matches.

He'd never noticed this. His win rate felt fine.

**The shift in perspective:**
He looks at his last 10 match replays with new eyes. He's not watching who won — he's watching WHEN. And yes: every match is decided in the first 20 ticks. Either his scout-rush overwhelms the enemy opener and it's over, or the enemy has a counter and he's dead by tick 18.

He never plays a midgame. His architecture has no midgame. His entire config is an opener with nothing behind it.

**Week 3 — Redesign**

Marcus spends a week building a relay-chain architecture behind his scout-rush — a fallback path that activates when the rush fails to close. The new architecture is harder to tune. Win rate drops to 57% while he iterates.

But eEDT moves: 0.19 → 0.27 → 0.31.

Even at 57% win rate, he's playing matches that last into tick 45, 50. He's experiencing the mid-game for the first time. He's losing differently — losing because his relay timing is off, not because he has no answer at all.

**Week 5 — The Career Chart Moment**

eEDT hits 0.38. Win rate recovers to 61%.

Marcus screenshots the spark-line: 30 matches of low-red, then a visible elbow upward into amber. He posts it to Discord with no caption. The community understands immediately. One person comments: "The elbow." Another: "First midgame, when?"

The eEDT trajectory has become a narrative artifact — the shape of someone learning.

**UI Annotations:**
- Spark-line graph: 90-match window, each match is a dot at its EDT value, 30-match rolling average as a bezier curve, gradient color keyed to the curve value (not individual dots)
- "The elbow" shape: when eEDT rises more than 0.10 over a 15-match window, the spark-line UI adds a subtle gold glow at the inflection point — a "growth event" visual marker
- Profile card hover: shows "eEDT: 0.38 (+0.19 from 30 days ago)" with a mini-histogram of EDT distribution for those 30 matches

---

### Journey: Yuki, 31, Analytical player, 80 Gauntlet matches

**Context:** Yuki came from competitive chess and StarCraft. She immediately understood the debrief tools — gold diamond, signal genealogy, two-act structure. She's been tracking her eEDT as a primary metric from match 15 onward.

**The Diagnostic Session**

Yuki's eEDT has been holding at 0.51 for six weeks. Win rate 61%. She wants to push eEDT to 0.60 — she believes high eEDT architectures are more robust to meta shifts and she wants to test the theory.

**Opening the season analytics:**
She pulls up her 30-match EDT distribution histogram. It's bimodal: a cluster at 0.15–0.25 (fast wins or losses against rush strategies) and a cluster at 0.55–0.70 (long contested matches against other balanced players).

The bimodal distribution means she's being matchmade against two different types of opponent. The 0.15–0.25 cluster is not her architecture failing — it's her architecture succeeding or failing fast against rush configs.

**The insight:**
Her eEDT plateau at 0.51 isn't architectural mediocrity — it's a matchmaking artifact. Against balanced opponents, she's at 0.62 average. Against rushers, she's at 0.20 average (win rate 50/50).

She can either: build a rusher-detector (context config that recognizes early-rush signals and collapses to counter-rush mode) or accept that her eEDT will stay bimodal and focus on winning more of the 0.55–0.70 cluster matches.

**The choice and its shape:**
She builds the rusher-detector. After 15 matches, her EDT distribution loses the low cluster — the bimodal shape collapses to a single cluster around 0.48–0.65. eEDT doesn't go up as much as she expected (from 0.51 to 0.55) but the *shape* changes fundamentally.

She posts the distribution comparison in a "config necropsy" thread: before (bimodal) and after (unimodal). The thread becomes a reference for "how to read EDT distributions rather than just averages."

**UI Annotations:**
- EDT distribution histogram: shown as a small bar chart (15 buckets, each 0.067 wide) in the extended stats panel; available after match 30; bimodal shape is visually obvious; player can toggle "Gauntlet Matches Only" vs. "By Opponent Archetype" if they've unlocked the archetype detection feature
- Rolling window selector: a small slider (15 / 30 / 50 / 90 matches) lets analysts like Yuki see different window sizes; default is 30; the 90-match view is labeled "Career Arc"

---

### Journey: Daniela, 16, New player, 12 Gauntlet matches

**Context:** Daniela finished the campaign last week. She just entered the Gauntlet for the first time. She has no idea what eEDT means. The game shows her "eEDT (12): 0.33" on her profile — in grey, provisional styling.

**First encounter:**

After her 12th match, she hovers over the eEDT number on her post-match summary. A tooltip appears:

> **eEDT (12)** — Your Effective EDT average. Shows how deep into a match your architectures create genuine contests. Low = outcomes resolved early (fast wins or fast losses). High = outcomes decided late (long fights).
> Tracked over 30 Gauntlet matches. Unlocks full display at 30 matches.

She reads it twice. She doesn't fully understand it. She moves on.

**Match 19:**

After losing a match she thought she was winning (sealed reveal shows she was already decided at tick 22 despite robots still fighting through tick 68), the debrief is particularly striking. She scrubs to the gold diamond: tick 22. Then looks at the match length: tick 68. The game was over for 46 ticks and nobody told her robots.

Post-match summary shows: `eEDT (19): 0.22 ↓ 0.04`

She connects the debrief experience to the number for the first time. *Oh. 0.22 means it gets decided at 22% of the way through. That's what that feels like.*

**Match 30 unlock:**

The eEDT number turns from grey to full color — amber, at 0.29. A small animation plays: the spark-line fills in behind the rolling curve for the first time, 30 dots appearing in sequence.

The UI shows a single line of explanatory text beneath the graph: *"Your matches tend to resolve in the first third. Consider whether your opener can fight into the midgame."*

Daniela doesn't know what "the midgame" means in Robot Uprising terms yet. But she knows what she's being asked to do. And she has a number to improve.

**UI Annotations:**
- Provisional display (< 30 matches): grey text, italic, number in parentheses shows actual count; tooltip explains the unlock threshold
- Unlock animation at 30 matches: spark-line animates in over 1.5 seconds, curve overlays, color saturates to full; a single line of plain-language coaching text appears below
- Coaching text: generated from eEDT value bracket, not hardcoded per player; four brackets: < 0.25 (opener-dependent), 0.25–0.40 (developing contest), 0.40–0.60 (midgame-capable), > 0.60 (late-game specialist); text is one sentence, non-condescending, actionable

---

## Strengths

**Detects architectural improvement that win rate misses.** A player who redesigns their opener may see win rate unchanged for 20 matches while eEDT climbs 0.15 points. eEDT provides validation of the change during the lag before win rate catches up. This is psychologically crucial — it keeps players iterating through losing streaks.

**Creates a new dimension of community identity.** "Midgame architect" is now a real identity. Players whose eEDT is high are respected for architectural completeness, not just for winning. Config pages with eEDT displayed create a browsable taxonomy of playing style.

**Incentivizes richer match play.** The metric creates an indirect incentive: designing architectures that fight longer. Rush strategies are still viable (win rate still matters) but they carry a visible cost: a low eEDT profile that community members read as "one-trick."

**Quantifies what a good opener means.** Before eEDT, "improve your opener" was advice without a measurement. After eEDT, opener improvement is visible in the career arc. The slope of the spark-line *is* opener improvement.

**Config necropsy culture gets richer.** When a player posts a config evolution retrospective, they now have two parallel graphs to tell the story: win rate and eEDT over time. These tell a more complete narrative — you can see when a player got lucky wins with a fragile config (high win rate, low eEDT) and when they built something durable (eEDT rising even as they retool a losing config).

---

## Weaknesses

**Can be gamed by sandbagging.** A player who deliberately plays long, grinding matches against weak opponents will inflate eEDT. The metric assumes you're trying to win, not trying to maximize EDT. Mitigation: weight EDT by opponent strength — a 0.60 EDT against a Rank 1200 opponent counts less than 0.60 EDT against a Rank 200 opponent.

**Bimodal matchmaking contamination.** As Yuki's journey shows, a matchmaking pool with both rush and balanced configs creates bimodal EDT distributions where the average is uninformative. The per-session EDT histogram is more useful than the rolling average in this case. The rolling average becomes a reliable signal only in a mature Gauntlet with homogeneous strategy mix — which may take months of community development.

**High eEDT can mean you're losing late.** A player who always loses on tick 70 of 80 has very high EDT — but they're consistently losing. eEDT makes no moral judgment about *who* wins the contested late-game. This is a feature (eEDT is orthogonal to win rate) but a potential frustration point for players who think "high eEDT = winning."

**Requires fluency in the EDT concept first.** Until players understand what EDT means — which requires at least 5-10 debrief experiences with the gold diamond — the eEDT career metric is inert text on the profile. The onboarding sequence for eEDT depends entirely on the onboarding sequence for EDT. If the EDT concept is underintroduced, eEDT is invisible noise.

---

## Interaction Effects

**With 8.12 (EDT as campaign difficulty calibration):** Campaign mission designers target specific EDT ranges per mission. If early campaign missions are designed for EDT 0.15–0.30 (quick resolution), players entering the Gauntlet from campaign will have a naturally low eEDT baseline. The ramp from campaign EDT to Gauntlet eEDT mirrors the architectural ramp the game is trying to teach.

**With 7.12 (Community-visible EDT distributions per config archetype):** Season analytics showing EDT distribution by archetype lets players compare their personal eEDT against their chosen archetype's expected EDT. A relay-chain player with eEDT 0.30 who sees "relay-chain archetype average: 0.52" has a named benchmark. The community average becomes a goal.

**With 4.27 (Pivot accuracy as displayed stat):** A player with high eEDT and high pivot accuracy is a "calibrated midgame architect" — someone who builds deep fights AND correctly identifies when they turn. This combination could be a named achievement tier, visible in the community.

**With 7.10 (Config necropsy as community artifact):** Version history export paired with eEDT-over-time creates the definitive config necropsy format: show both win rate and eEDT trajectories across config versions, with version boundaries marked. High-elo players posting necropsies with both graphs tell a richer story about *how* they improved, not just *that* they improved.

**With 5.22 (The Gauntlet as a third act):** If the Gauntlet is the designed destination, eEDT is the primary career arc it tracks. Campaign is about win rate (pass/fail). Advanced campaign is about robustness (pass rate across 100 scenarios). Gauntlet is about architectural maturity — and eEDT is its measurement. The three acts each have a primary stat. eEDT belongs to Act 3.

---

## Comparable Games and Media

**Chess.com Accuracy (computer analysis overlay):** The most direct analogue. Chess.com's Accuracy metric runs Stockfish analysis on completed games and produces a 0–100 accuracy score per player. It correlates weakly with win rate (blunders can still win games against lower-rated opponents) but strongly with improvement trajectory. The metric is often more useful than ELO change for identifying skill growth. eEDT serves the same role. Key lesson from Chess.com: **the distribution display (accuracy histogram for your last 50 games) is as important as the number itself** — players understand "my accuracy peaks around 82 but I have too many 65-accuracy outliers" as actionable information.

**StarCraft 2 match length statistics (professional analysis):** SC2 esports analysts track game length as a meta-health indicator — when games are too short on average, one strategy is dominant and needs nerfing. The same logic applies to Robot Uprising's Gauntlet health. A community-wide average eEDT below 0.25 signals a rush-dominant meta. eEDT trajectory at the individual level maps to what pro-scene analysts do at the population level.

**Slay the Spire floor analytics (fan tools):** The Slay the Spire modding community built floor-by-floor win rate trackers that identify at which floor most run deaths happen. These tools revealed that most deaths cluster around floor 7 (boss) and floor 16 (second boss) — not evenly distributed. The equivalent in Robot Uprising: EDT distribution by match position (which tick bucket concentrates the most EDT values across your last 30 Gauntlet matches) as a floor-by-floor analogue. Where does your architecture break?

**Fighting game "health percentage" dominance tracking:** Some fighting games track not just W/L but how much health remains after victories — "perfect" victories (full health) vs. close wins. The dominance metric is orthogonal to win rate in the same way eEDT is. A player who wins 60% but almost always by surviving on low health is more fragile than a player who wins 55% but regularly dominating. eEDT is the time-dimension version of health-dominance.

---

## Sensory Description

The eEDT spark-line on the player profile is a **waveform, not a chart.** 90 dots, each one an EDT value from a past match, laid out left-to-right in chronological order. Each dot is a pinprick — just 3px in radius — colored by value (dark red for < 0.20, fading to bright amber, then soft green, then deep violet). The 30-match rolling average is a smooth bezier curve drawn over them in a slightly thicker weight, the same color but with 80% opacity and a subtle 1px drop shadow that makes it float above the dot field.

When the spark-line unlocks at match 30, the dots materialize left-to-right over 1.5 seconds, each one appearing with a barely-audible tick, the rolling curve drawing itself after the dots are placed — like a signal being received, decoded, and plotted. The sound is the same tonal register as the signal-in-buffer visualization: short, electronic, clear. Twenty-nine soft ticks, then the curve appears in one smooth motion, then one full second of silence.

If the spark-line contains a "growth event" (eEDT rising more than 0.10 over 15 matches), the inflection point glows briefly in gold — the same gold as the EDT diamond in the match timeline — and the dots around it pulse once. It's the visual language saying: *something changed here.* The game never labels it. The player names it themselves.

---

## The TikTok Clip

A player opens their profile. The spark-line is fully red at the left, flat at 0.17 for 40 matches. Then an elbow. The right half of the line climbs — amber, green, amber again — and the rolling curve is clearly trending upward. 0.17 to 0.44 over the visible window.

Win rate is shown beside it: 59%. Barely changed.

The player hovers over the elbow point. A gold dot glows. The profile caption reads: "Week 5. First relay chain." The camera zooms in on that elbow. The curve literally bends upward on screen, 30 matches of history pointing toward somewhere different.

Text appears: "win rate didn't move. my game completely changed."

**That** is what the clip shows. Not the win. The shape of the learning.

---

## Discovered New Aspects

- **4.29 — eEDT rolling window granularity options:** Should players be able to select 15 / 30 / 50 / 90 match windows for the career chart? What does each window communicate, and what's the cognitive tradeoff between granularity and legibility?
- **4.30 — Bimodal EDT distribution as matchmaking diagnostic:** When a player's EDT histogram shows two distinct clusters rather than a single distribution, it may indicate a structured matchmaking pool problem (being matched against two incompatible strategy tiers). Should the game detect bimodal distributions and surface a "opponent style diversity" warning?
- **4.31 — The career "growth event" detection and celebration:** Designing the exact threshold and presentation for the gold-dot inflection point on the spark-line — what constitutes a meaningful architectural shift vs. noise, and how to celebrate it without feeling patronizing to veterans
- **7.15 — The "eEDT as archetype signal" in config browsing:** When filtering workshop configs by eEDT range, what does the browsing experience look like? How does a player communicate "I want configs that play into the midgame" as an explicit search filter?
- **8.13 — Three-act metric mapping:** Formally defining the primary career stat for each act (Campaign: pass rate / Advanced Campaign: robustness % / Gauntlet: eEDT) and designing the transition moments where a new primary stat becomes visible for the first time
