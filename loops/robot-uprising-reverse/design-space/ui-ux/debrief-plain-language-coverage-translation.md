# Plain-Language Translation of Coverage Deltas

**Aspect:** 4.69o — "4 extra wins" plain-language translation of coverage deltas: first-time-encounter tooltip that translates percentage deltas into absolute match counts ("4 more wins from 45 analyzed matches"); gradually replaced by percentage-only display as player gains experience; the match-count framing as accessibility layer for players who don't intuitively parse percentages.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined agent coverage score display; 4.69a — Multi-cluster threshold configurability; 4.69d — Multi-cluster persistence tracking
**Related:** 8.08 — Vocabulary claim (transferable engineering concepts); 4.93 — Confidence interval display; 4.68 — Coverage percentage as season health; onboarding progressive complexity

---

## The Core Problem

The career analysis system speaks in percentages. The combined coverage display (4.69b) says "+9pp architectural upside." The season health trend (4.68) says "coverage declined from 61% to 38%." The multi-cluster flag (4.69) says "combined coverage if all fixed: 71%."

Percentages are the correct unit of communication for this system. They normalize across different sample sizes, they scale with the player's career, and they are the lingua franca of statistical thinking. The problem is that a significant fraction of players do not intuitively parse percentages — and even players who do parse them need a moment of mental arithmetic to extract the actionable signal.

Consider the combined coverage delta from the multi-cluster flag:

```
Combined coverage if all three fixed: 71%
(vs. 62% from top fix alone — +9pp architectural upside)
```

A player who has internalized what "coverage" means in this game reads "+9pp" and immediately translates: "nine percentage points across 45 matches means roughly 4 extra matches fixed." They then compare that against the cost of a full agent overhaul. The mental path is: percentage -> absolute count -> effort comparison -> decision.

A player who has NOT internalized coverage reads "+9pp" and experiences a flatter signal. Nine percentage points. Is that a lot? More than five, less than fifteen. The number has no physical referent — it doesn't connect to anything they can count on their fingers. They cannot do the effort comparison because they haven't extracted the concrete payoff.

The plain-language translation layer bridges this gap by presenting the match-count framing alongside the percentage:

```
Combined coverage if all three fixed: 71% — 32 of 45 matches improved
(vs. 62% from top fix alone — +9pp = 4 more wins from 45 analyzed matches)
```

"4 more wins" is physically graspable. The player can picture four matches — they played those matches, they remember some of them, they know what a win feels like. The percentage provides the scaled metric; the match count provides the visceral one.

But there is a tension: experienced players do not need the match-count translation. For Priya at 300 hours, "4 more wins from 45 analyzed" is clutter — she reads "+9pp" instantly and the parenthetical takes up screen space she'd rather reclaim. The match-count framing is an accessibility scaffolding that should be erected for newcomers and gradually dismantled as the player's statistical fluency develops.

This is the progressive disclosure problem specific to numeric literacy: how does a game teach a unit of measurement by presenting it alongside a more intuitive unit, and then retire the intuitive unit once the new unit has been internalized?

---

## The Design

### The Translation Layer

Every percentage delta displayed in the career analysis system gains a companion annotation — the absolute match count — when the player's experience level is below a configurable threshold. The translation layer is not a separate tooltip or popup; it is inline text that occupies the same visual row as the percentage, separated by an equals sign or em-dash.

The core display states:

**State 1 — Full Translation (new player, < 100 matches analyzed total)**

```
+9pp = 4 more wins from 45 analyzed matches
```

The match count is displayed in the same font size as the percentage, in a slightly warmer color (amber-tinted white vs. pure white) to signal "this is the human-readable version." The word "wins" is used instead of "matches improved" because "wins" is concrete and emotive. The "from 45 analyzed matches" suffix is essential — it grounds the absolute count in the sample size, preventing the player from thinking "4 more wins" is a universal promise rather than a sample-specific projection.

**State 2 — Parenthetical Translation (intermediate player, 100-300 matches analyzed)**

```
+9pp (4 more wins)
```

The sample size qualifier drops. The match count moves into parentheses and shrinks by 2px. The percentage is now visually primary; the count is secondary but still present. The player has seen enough coverage deltas to understand that the count depends on sample size — they no longer need the reminder.

**State 3 — Percentage Only (experienced player, 300+ matches analyzed)**

```
+9pp
```

The match count disappears entirely. The player has internalized the percentage unit. Their mental model now processes "+9pp" directly without needing the translation step.

### The Transition Mechanism

The transition between states is not a hard cutoff. It uses a graduated opacity fade:

- At 80 matches analyzed, the match-count text begins fading: opacity drops from 1.0 to 0.8.
- At 100 matches, it reaches State 2 (parenthetical format, opacity 0.8).
- At 200 matches, the parenthetical opacity drops to 0.5.
- At 300 matches, the parenthetical fully fades to 0.0 and is removed from the DOM.

The player never experiences a jarring moment where "something disappeared." The translation text ghosts away over the course of roughly 200 matches — a span of 4-6 weeks of regular play. By the time it's gone, the player doesn't remember it was there.

### First-Encounter Tooltip

On the player's absolute first encounter with a coverage delta — the first time any "+Xpp" text appears in the career analysis panel — a tooltip anchors to the delta text and explains the dual representation:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Coverage Delta                                                      │
│                                                                      │
│  "+9pp" means this fix would improve 9 percentage points of          │
│  your analyzed matches.                                              │
│                                                                      │
│  In concrete terms: 4 more wins out of the 45 matches analyzed.      │
│                                                                      │
│  As you gain experience with coverage metrics, the match-count       │
│  translation will gradually disappear, leaving just the percentage.  │
│  [Got it]                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

This tooltip is unique: it tells the player that the scaffolding is temporary. Most tutorials hide their own expiration. This one names it. The player understands from minute one that match counts are training wheels, and percentages are the destination. This framing avoids a common complaint in progressive disclosure systems — "why did my UI change?" — by announcing the change in advance.

The tooltip fires once and never returns. It is stored in the player's session flags as `coverage_delta_tooltip_seen: true`.

### Where the Translation Appears

The match-count translation is applied to every coverage delta surface in the game:

1. **Career analysis runner-up list** — the primary surface. Each candidate's coverage percentage gains the translation: "62% — 28 of 45 matches" (State 1) or "62% (28)" (State 2).

2. **Multi-cluster flag banner** — the "+9pp architectural upside" line gains the translation: "+9pp = 4 more wins" (State 1) or "+9pp (4)" (State 2).

3. **Combined coverage display in agent audit** — "71% combined vs. 62% top candidate (+9pp)" gains the match count parenthetical.

4. **Season health coverage trend sparkline** — each historical data point's tooltip shows the match count alongside the percentage. "Run 3: 38% coverage — 9 of 23 matches dominated by one fix."

5. **Confidence interval display (4.93)** — when confidence intervals are shown as "62% +/- 8pp," the translation extends to "62% +/- 8pp = 28 +/- 4 matches." This is the most complex translation surface and the one most likely to cause visual clutter.

### The "Wins" vs. "Matches Improved" Vocabulary Choice

The translation layer uses the word "wins" deliberately. The career analysis system technically measures "matches that would have been improved by this fix" — but "improved" is abstract. Did the match go from a loss to a win? From a close loss to a wider loss? The answer is: the career analysis counts matches where the fix changes the outcome from loss to win (the binary metric). So "wins" is accurate, not just accessible.

Using "wins" has a second effect: it connects the statistical abstraction to the player's emotional experience. "+9pp" is a number. "4 more wins" is four matches where their agents would have succeeded instead of failed. The emotional weight is not manipulative — it is *accurate*. The player cares about wins, and the system is measuring wins. The percentage is a normalized lens on the same underlying count. The match-count framing just removes the lens.

---

## Player Journeys

### Journey 1: Tomoko, 22, Design Student — First Career Analysis, No Statistics Background

**Context:** Tomoko has played 18 matches. She just ran her first career analysis because the tutorial recommended it after a losing streak. She passed high school math but never took a statistics course. Percentages are not foreign to her but they don't feel *natural* — she thinks in images and spatial relationships, not ratios.

**Minute 0:00 — Career Analysis Loads**

The spinner finishes. The runner-up list fades in. Tomoko reads the top candidate:

```
#1  SCOUT-A hook threshold    58% — 15 of 26 matches improved    [Apply Fix →]
```

She reads "58%" and blinks. She reads "15 of 26 matches improved" and stops. *Fifteen matches.* She's played 26 matches in the analysis window. Fifteen of them would have gone better if she'd changed this one thing. That's more than half. She can feel the weight of fifteen matches — fifteen battle screens, fifteen result screens, fifteen moments of frustration.

The percentage confirmed the scale. The match count made it real.

**Minute 0:15 — The First-Encounter Tooltip**

A tooltip anchors to the "+12pp" delta text next to the runner-up row:

```
"Coverage Delta — +12pp means this fix would improve 12 percentage points of your
analyzed matches. In concrete terms: 3 more wins out of the 26 matches analyzed.
As you gain experience with coverage metrics, the match-count translation will
gradually disappear, leaving just the percentage. [Got it]"
```

Tomoko reads the tooltip carefully. She notes: "so 12 percentage points equals 3 wins. That means each percentage point is... about a quarter of a win?" She's doing the mental math. The tooltip is not just explaining — it's *teaching the conversion ratio*. Every time she sees a percentage delta, she'll unconsciously multiply by the rough conversion factor she just computed.

She clicks [Got it]. The tooltip collapses.

**Minute 0:30 — Comparing Candidates**

She looks at the next three candidates:

```
#2  RELAY-B fallback filter   31% — 8 of 26 matches improved     [Apply Fix →]
#3  STRIKER-C patrol radius   19% — 5 of 26 matches improved     [Apply Fix →]
#4  SCOUT-A attention depth   15% — 4 of 26 matches improved     [Apply Fix →]
```

She compares using the match counts, not the percentages. "8 matches vs. 5 matches vs. 4 matches." This is simple comparison — which number is bigger? She doesn't need to parse "31% vs. 19% vs. 15%" to make the ranking legible, though she is passively absorbing the percentage ordering as confirming her count-based reading.

**Minute 0:45 — Applying the Fix**

She clicks [Apply Fix] on candidate #1. A confirmation toast appears: "SCOUT-A hook threshold adjusted. Projected impact: 15 matches improved out of 26 analyzed."

The toast uses the match-count framing again. The number 15 is reinforced. Tomoko feels the decision was concrete.

**What Tomoko learned:**
- Coverage percentages map to actual match counts
- "+12pp" means "3 more wins" — she now has a conversion intuition
- The translation will disappear eventually — she knows this is a scaffolding layer

**UI Annotations:**
- Match count text rendered in `#FFD4A0` (warm amber) vs. percentage text in `#E8E8E8` (cool white) — the warmth visually codes "this is the friendly version"
- First-encounter tooltip: 280px wide, anchored below the delta text, white background with a 1px amber border, body text 13px, [Got it] button in the bottom-right corner
- Tooltip dismiss animation: 200ms fade-out, no bounce or slide — the tooltip should feel like closing a book, not swiping away a notification

---

### Journey 2: David, 41, Financial Analyst — Percentages Are Native, Translation Is Clutter

**Context:** David has played for 4 months. He's analyzed over 400 matches. He works with percentages daily in his job — basis points, yield spreads, coverage ratios. He adopted the percentage-first reading immediately and never relied on the match-count translation. He's now in State 3 (percentage-only display) and has been for 100+ matches.

**Minute 0:00 — Career Analysis with Multi-Cluster**

David's career analysis fires a multi-cluster flag on COMMAND-B. The amber banner slides down:

```
⚠ COMMAND-B multi-cluster detected
  3 elements — combined coverage if all fixed: 64%
  (vs. 55% from top fix alone — +9pp)
  [View Agent Audit →]  [Skip — apply #1 fix]
```

David reads "+9pp" and instantly computes: 9% of his 50-match analysis window is about 4-5 matches. He doesn't need the translation. The percentage is his native unit.

He clicks [View Agent Audit]. The audit panel shows the cluster members. No match counts anywhere — they faded out 150 matches ago. The panel is clean: percentages, sparklines, root cause hypotheses. David appreciates the density. Every pixel is information he uses.

**Minute 0:20 — A Friend Watches Over His Shoulder**

His friend Mei, who just started playing two days ago, is watching. She sees the audit panel and asks: "What does +9pp mean?"

David explains: "Nine percentage points. On fifty matches that's about four or five extra wins." The explanation comes naturally because he internalized the conversion months ago — but he learned it through the match-count translation that was present when he started.

**Minute 0:25 — The Settings Consideration**

David considers: what if Mei wants to play on his account to try the career analysis? His account is in State 3 — no match counts. She would see percentages-only and be lost.

In the Settings panel under "Career Analysis Display," there is a toggle:

```
Match-count annotations: [Auto] / On / Off
  Auto: gradually hides match counts as you gain experience
  On: always show match counts alongside percentages
  Off: never show match counts
```

David's account is set to [Auto], which resolved to Off at his experience level. If Mei were to play, he could switch it to [On] — the match counts would reappear at full opacity, State 1 format. The setting is per-account, not per-session, so switching back to [Auto] would return to his clean percentage-only view.

**What David demonstrates:**
- The translation layer doesn't annoy experienced players — it simply isn't there
- The conversion knowledge persists after the scaffolding is removed (he can explain it to Mei)
- The manual override in settings respects both player types without compromise

**UI Annotations:**
- Settings toggle location: Career Analysis section, between "Analysis Window Size" and "Confidence Display" options
- Toggle rendered as a three-way segmented control: [Auto | On | Off], 120px wide, amber highlight on active segment
- "Auto" label has a small info icon that expands to: "Match counts fade gradually after ~100 analyzed matches. Your current state: hidden (420 matches analyzed)."

---

### Journey 3: Soren, 17, Student — Mid-Transition, The Scaffolding Is Fading

**Context:** Soren has analyzed 180 matches — he is in State 2 (parenthetical translation, reduced opacity). He's been playing for 8 weeks. He has started reading percentages first but still glances at the match counts for confirmation.

**Minute 0:00 — Career Analysis Loads**

The runner-up list appears:

```
#1  RELAY-C context buffer    47% (11)    [Apply Fix →]
#2  SCOUT-A hook threshold    28% (7)     [Apply Fix →]
#3  STRIKER-B patrol radius   22% (5)     [Apply Fix →]
```

Soren reads "47%" first — he's started leading with the percentage. Then his eyes flick right to "(11)" for confirmation. Eleven matches. Yeah, that tracks with 47% of 23 analyzed matches. He doesn't do the exact math but the ballpark feels right.

He notices the "(11)" is slightly faded — not fully opaque. It was brighter a few weeks ago, he thinks, but he's not sure. The opacity is now at 0.65 — visible enough to read but clearly secondary.

**Minute 0:10 — Multi-Cluster Flag**

The amber banner fires:

```
⚠ RELAY-C multi-cluster detected
  3 elements — combined coverage if all fixed: 58%
  (vs. 47% from top fix alone — +11pp (3))
  [View Agent Audit →]  [Skip — apply #1 fix]
```

Soren reads "+11pp" and pauses. Eleven percentage points. He glances at the parenthetical: "(3)". Three more wins. He nods. The percentage told him the scale; the match count told him the stakes. Three wins is tangible — he remembers losing those matches.

But he notices he read the percentage first this time. Two months ago, he would have gone straight to the match count. The transition is working: the percentage is becoming his primary unit, and the match count is becoming his check digit.

**Minute 0:25 — Agent Audit**

In the audit panel, the combined coverage is displayed:

```
COMBINED SCENARIO COVERAGE IF ALL THREE FIXED: 58% (14)
(vs. 47% from top candidate alone — +11pp (3))
```

The "(14)" and "(3)" are at reduced opacity. Soren reads the percentages confidently. He mentally registers "14 out of 24 matches" and moves on to the root cause analysis. The match counts are becoming background confirmation — present but not primary.

**Minute 0:40 — The Percentage Clicks**

Soren is reading the root cause hypotheses. One says:

> "Buffer cascade: small buffer forces conservative filter. Combined coverage ceiling: 58%."

He reads "58%" and doesn't look for a match count. He just reads it. The percentage *means* something to him now — it means "more than half my matches, clustered around one agent's design." He doesn't need to convert to match counts because 58% has its own weight.

This is the moment the scaffolding has done its job. The percentage is no longer an abstract ratio — it is a direct representation of his match experience. The match-count parenthetical is still visible at 0.65 opacity, but he didn't use it. In another 120 matches, it will be gone.

**What Soren demonstrates:**
- The mid-transition state works — the player's reading pattern shifts gradually from count-first to percentage-first
- The parenthetical format "(3)" is compact enough to coexist without visual clutter
- The opacity fade is subliminal — the player doesn't consciously register the change
- The transition occurs at the right pace: by match 180, the percentage is primary but the scaffolding is still available for complex or unfamiliar surfaces

**UI Annotations:**
- State 2 parenthetical format: match count in parentheses, no "matches" or "wins" suffix, just the number — "(3)" not "(3 wins)" — because the compact format serves an intermediate player who already understands what the number means
- Opacity at 180 matches: 0.65, computed as `1.0 - ((matchesAnalyzed - 100) / (300 - 100))` clamped to [0.0, 1.0]
- Font size reduction: match count text is 2px smaller than percentage text in State 2, shrinking from the equal-size State 1 treatment
- Color shift: the match count text shifts from warm amber (#FFD4A0) toward the standard text color (#E8E8E8) over the transition, reaching full neutral at State 3 (which is irrelevant because opacity is 0 by then, but the color normalization prevents a visual "ghost" artifact during the final fade)

---

### Journey 4: Anika, 30, Teacher — Uses the Settings Override for Her Students

**Context:** Anika teaches game design at a community college. She uses Robot Uprising as a case study in her "Systems Thinking Through Games" module. She's an experienced player (500+ matches) but her students are beginners. She's demonstrating career analysis in class on a projector.

**Minute 0:00 — Pre-Class Setup**

Anika opens Settings and switches "Match-count annotations" from [Auto] to [On]. The match counts reappear at full opacity, State 1 format. She verifies by opening the career analysis panel:

```
#1  COMMAND-A priority queue   52% — 24 of 46 matches improved   [Apply Fix →]
```

Good. The full "24 of 46 matches improved" text is visible. Her students will be able to follow.

**Minute 5:00 — In-Class Demonstration**

She runs a career analysis live. The multi-cluster flag fires. She narrates:

"See this banner? It says combined coverage if all three elements are fixed: 68% — 31 of 46 matches. That means 31 out of the 46 matches I analyzed would have gone differently if I'd fixed all three problems in this one agent. But the top fix alone covers 52% — 24 matches. The delta is +16pp, which is 7 more wins. So the question is: is a full agent redesign worth 7 extra wins?"

A student raises her hand: "What's pp?"

"Percentage points. It's the unit for comparing percentages. If something goes from 52% to 68%, the change is 16 percentage points. The game shows it as +16pp."

The student nods. The match-count translation made the concept concrete before Anika had to explain the abstract unit. The "7 more wins" framing gave the student a foothold.

**Minute 10:00 — Post-Class Reflection**

Anika switches the setting back to [Auto] (which resolves to Off for her experience level). She prefers the clean percentage display for her own play. But she notes that the [On] override was essential for the teaching context — without it, she would have had to manually compute match counts on the projector, breaking the flow.

**What Anika demonstrates:**
- The settings override serves an explicit use case beyond individual play: teaching, streaming, and shared-screen scenarios
- The full State 1 format is pedagogically effective even when the audience has never played the game
- "7 more wins" is a better answer to "should I do a redesign?" than "+16pp" for an audience that doesn't have the percentage-to-effort calibration

---

## Strengths and Weaknesses

### Strengths

**Concrete grounding for abstract metrics.** The match-count framing converts a statistical signal into a physical one. Players who struggle with percentage reasoning gain immediate access to the system's insights without needing to develop statistical fluency first.

**Self-retiring scaffolding.** The progressive fade means the system never becomes permanent clutter. Unlike most accessibility features that remain visible forever (potentially irritating power users), this one has a defined lifecycle. The player is told up front that the scaffolding is temporary — no surprise UI changes.

**Correct vocabulary alignment.** Using "wins" instead of "matches improved" is both accurate (the career analysis measures outcome-changing fixes) and emotionally resonant. The word choice reinforces the game's core loop: you are trying to win matches, and this number tells you how many more you would win.

**Teachable conversion.** By displaying both representations side by side, the system teaches the percentage-to-count conversion implicitly. The player doesn't study the conversion formula — they absorb it through repeated exposure. By State 3, they can do the conversion in their head. The scaffolding didn't just help them read the current panel; it permanently upgraded their statistical literacy.

**Settings override for edge cases.** The [Auto/On/Off] toggle gracefully handles teaching, streaming, and account-sharing scenarios without complicating the default experience.

### Weaknesses

**Visual density in State 1.** The full translation format — "58% — 15 of 26 matches improved" — is long. On a runner-up list with 10 candidates, the match-count annotations add significant horizontal width. Small screens and narrow panels may struggle to fit the full text without wrapping.

**"Wins" is an oversimplification for edge cases.** The career analysis computes "outcome-changing" fixes, which is defined as changing the binary win/loss result. But some matches have partial scoring (Gauntlet tiebreakers, objective-based missions). For these, "wins" is not quite accurate — the fix might change a score from 2/5 to 3/5 without changing the win/loss outcome. The translation layer's use of "wins" is correct for standard matches but misleading for scored formats.

**The fade timing is one-size-fits-all.** The 100-300 match transition window is fixed. A player with a statistics background needs 0 matches of scaffolding. A player with strong math anxiety might need 500. The [Auto] curve is a compromise that will be too slow for some and too fast for others. The [On/Off] override mitigates this, but requires the player to know the setting exists.

**Potential for count-anchoring.** A player who reads "4 more wins" might anchor to the absolute count and ignore the sample size. If their next career analysis covers 80 matches instead of 45, the same "+9pp" might translate to "7 more wins" — and they might perceive this as a bigger improvement even though the percentage is identical. The State 1 format includes the sample size qualifier ("from 45 analyzed matches") to counteract this, but anchoring effects are difficult to fully prevent.

**Confidence interval translation is complex.** When the confidence interval display (4.93) shows "62% +/- 8pp = 28 +/- 4 matches," the player must understand that "+/- 4 matches" means the true count could be 24 to 32. This is a more complex statistical concept than simple counts, and the translation might create false confidence in the precision of the interval.

---

## Interaction Effects

### With 4.69b — Combined Coverage Display

The combined coverage display is the primary beneficiary of the translation layer. The coverage delta "+9pp architectural upside" is the most consequential number in the multi-cluster flow — it determines whether the player pursues a full redesign or applies the top fix. Translating this to "4 more wins" makes the redesign cost-benefit analysis concrete: is a 90-minute redesign worth 4 more wins? The player can answer this question immediately. Without the translation, they must first convert "+9pp" to a match count, which requires knowing the sample size and doing division — a step that interrupts the decision flow.

### With 4.93 — Confidence Interval Display

The confidence interval display and the plain-language translation are in tension. The confidence interval communicates *uncertainty*: "62% +/- 8pp." The match-count translation communicates *certainty*: "28 matches." Combining them — "28 +/- 4 matches" — is technically correct but conceptually dense. A player who reads "28 matches" may ignore the "+/- 4" qualifier and treat 28 as a fact rather than an estimate. Recommendation: when confidence intervals are active, the match-count translation should show the range format instead: "24-32 matches" rather than "28 +/- 4 matches." The range format avoids the center-point anchoring problem.

### With 8.08 — Vocabulary Claim (Transferable Engineering Concepts)

The vocabulary claim is that Robot Uprising teaches real engineering concepts — "coverage," "structural debt," "role drift" — that transfer to professional contexts. The plain-language translation layer is both an accelerator and a risk to this claim. It accelerates vocabulary acquisition by giving the player a physical referent for abstract terms (they can *feel* what "+9pp" means because they know it equals 4 wins). But it also risks becoming a crutch: if the player never transitions to percentage-native thinking, they haven't acquired the transferable vocabulary. The progressive fade is the critical mechanism that prevents the crutch outcome — the player must eventually think in percentages because the match counts disappear.

### With Onboarding Progressive Complexity

The first-encounter tooltip explicitly names the scaffolding's temporary nature. This interacts with the broader onboarding philosophy: Robot Uprising progressively complexifies its UI as the player advances. The match-count translation is one of many scaffolding layers that fade with experience. The tooltip's honesty — "this will gradually disappear" — sets a precedent for the onboarding system as a whole. If the player sees similar tooltips on other progressive features ("this simplified view will expand as you gain experience"), they learn a meta-pattern: the game is gradually revealing its full complexity, and the simplified views are training wheels that will be retired.

### With 4.68 — Coverage Percentage as Season Health

The season health sparkline tracks coverage percentages over time. In State 1, each data point's tooltip shows the match-count translation: "Run 3: 38% — 9 of 23 matches." This creates an interesting longitudinal effect: the player can see their match counts *declining* as their coverage percentages decline, which makes the improvement trend concrete. "61% (16 matches) -> 43% (10 matches) -> 38% (9 matches)" tells a clearer improvement story than "61% -> 43% -> 38%" for a player who hasn't yet internalized percentage comparison.

---

## Comparable Games / Media

### Civilization VI — Yield Tooltips

Civilization VI displays yields as both icons (food, production, gold) and numbers. When a player hovers over a tile, the tooltip shows "+3 food, +1 production." But the city screen shows the *aggregate* as percentages: "food surplus: 12% above consumption." New players read the tile-level absolute numbers; experienced players read the city-level percentages. The game never removes the tile-level numbers — they're always available on hover. Robot Uprising's translation layer differs in that it actively fades the absolute numbers, forcing a transition that Civ VI never requires. The tradeoff: Civ VI's approach is safer (no player ever loses information), but it also means some Civ VI players never develop percentage-native thinking about yields.

### Baseball Statistics — Batting Average vs. Hits

A batting average of .310 is abstract to a casual fan. "124 hits in 400 at-bats" is concrete. Baseball broadcasts routinely show both: ".310 (124-for-400)." This is permanent dual display — the broadcast never drops the raw count for experienced viewers. Robot Uprising's fade is more aggressive than baseball's convention, but baseball's audience is passive (watching a broadcast), while Robot Uprising's audience is active (making decisions based on the numbers). Active decision-makers benefit more from unit internalization than passive viewers.

### Duolingo — Streak and XP Dual Framing

Duolingo shows both "streak days" (concrete) and "XP earned" (abstract). New users focus on the streak; experienced users focus on XP and league ranking. Duolingo never hides the streak count, but it progressively de-emphasizes it by making XP and league position more visually prominent. The progressive de-emphasis is similar to Robot Uprising's opacity fade — the concrete metric doesn't disappear, but its visual weight decreases as the player's relationship with the abstract metric matures.

### Into the Breach — Damage Preview

Into the Breach shows exact damage numbers on every threatened tile: "3 damage to Building (2 HP)." This is permanent — the game never hides the numbers. But the *experienced player* stops reading individual damage numbers and reads the *pattern*: "the Vek will destroy the power grid on the right side." The pattern reading emerges from the player, not from the UI. Robot Uprising's translation layer makes the pattern-reading transition explicit by fading the concrete numbers, nudging the player toward pattern-level (percentage-level) comprehension.

---

## Sensory Description

### Visual: The Translation Text

**State 1 colors:** The percentage text renders in cool white (#E8E8E8). The match-count text renders in warm amber (#FFD4A0) — a golden-cream tone that reads as "friendly annotation" against the dark panel background (#1A1D23). The two colors sit side by side on the same line, separated by an em-dash rendered in medium gray (#888888). The warm-cool color contrast is subtle but legible: the player's eye can distinguish "the metric" (cool) from "the explanation" (warm) without conscious effort.

**State 2 colors:** The parenthetical match count shifts from #FFD4A0 toward #C8C8C8 — still slightly warm but converging toward the base text color. The opacity at 0.65-0.8 makes the text feel like a watermark: present, legible if sought, but not demanding attention.

**State 3:** The match count text is gone. The line is shorter. The runner-up list breathes — more whitespace to the right of each percentage. Experienced players perceive this as "cleaner" without being able to name what changed.

### Visual: The First-Encounter Tooltip

The tooltip has a white background (#FFFFFF) with a 1px border in soft amber (#E8B86D). It is 280px wide and positioned below the delta text, anchored with a small upward-pointing triangle (the classic tooltip caret). The body text is 13px in dark charcoal (#2A2A2A). The key phrases — "4 more wins" and "gradually disappear" — are rendered in medium-weight (600) to give them slight emphasis without full bold.

The [Got it] button is a small text button (not a full button component), positioned flush right in the tooltip's bottom row, rendered in amber (#D4944A) with a 1px underline on hover. Clicking it triggers a 200ms opacity fade on the entire tooltip — no bounce, no slide, just a quiet exit.

### Visual: The Opacity Fade Over Time

The fade is implemented as a CSS-style opacity transition that progresses over hundreds of matches. The player never sees an animation — there is no moment where the text visibly fades. Instead, each time the career analysis panel renders, the match-count text's opacity is calculated from the player's cumulative matches-analyzed count. From one session to the next, the opacity might drop by 0.02 — imperceptible in a single session, but over 10 sessions the cumulative change is 0.20, which registers as "the text is lighter than I remember, I think."

This is a slow dissolve measured in weeks, not seconds. It mirrors the way a player's need for the scaffolding dissolves.

### Audio: The First-Encounter Tooltip

When the first-encounter tooltip appears, a single soft note plays — a warm pluck on a synthetic marimba, mid-register (C4), 400ms duration with a fast decay. The note is the same one used for all first-encounter tooltips in the onboarding system, creating a Pavlovian association: "this sound means the game is about to teach me something I'll only hear once."

When the player clicks [Got it], a barely audible click sound plays — a dry tap, like a pen closing. The click-to-dismiss sound is shared with all tooltip dismissals throughout the game.

### Audio: No Ongoing Sound

The match-count translation text has no ongoing audio signature. It is purely visual. Adding a sound to the translation (e.g., a soft chime when the count is displayed) would draw attention to a feature that is designed to fade into the background. Silence is the correct audio treatment for scaffolding that should feel natural, not special.

### Animation: The State Transition

There is no animation for the State 1 -> State 2 -> State 3 transition. The format change (from full text to parenthetical to absent) happens between sessions — the player closes the game, plays more matches, and the next time they open the career analysis panel, the format has shifted. Animating the transition would draw attention to the scaffolding mechanism, breaking the subliminal design.

The only exception: if a player manually toggles the setting from [Auto] to [On] or [Off], the change is animated with a 300ms crossfade. The manual toggle is a conscious choice, so the animation confirms the action.
