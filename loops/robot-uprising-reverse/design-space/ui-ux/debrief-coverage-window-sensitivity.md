# Combined Coverage Sensitivity to Match Window Size

**Aspect:** 4.69r — Combined coverage sensitivity to match window size: how different match window sizes (20 matches vs. 200 matches) affect the combined coverage number; small windows have high variance (one unusual match can swing the number significantly); recommended minimum window size for reliable combined coverage estimates; the "confidence interval" framing for coverage numbers.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined coverage display; 4.69q — Prospective coverage; 4.69o — Plain-language coverage translation
**Related:** 4.93 — Accuracy stat confidence interval; 4.64 — Pre-ranking accuracy as displayed stat; 4.68 — Coverage percentage as season health

---

## The Core Problem

The combined coverage number is a ratio: *matches improved by fixing all cluster elements* divided by *total matches analyzed*. Like every ratio computed from a finite sample, it has a variance that scales inversely with sample size. The game currently displays combined coverage as a single clean percentage -- "71%" -- without any indication of how trustworthy that number is.

Consider two players:

```
Player A — 20-match window:
  RELAY-C combined coverage: 71%  (improved 14.2 of 20 matches)
  One unusual match swings coverage by 5pp.
  True uncertainty: roughly +/-11pp

Player B — 200-match window:
  RELAY-C combined coverage: 71%  (improved 142 of 200 matches)
  One unusual match swings coverage by 0.5pp.
  True uncertainty: roughly +/-3pp
```

Both players see "71%." But Player A's 71% could easily be 60% or 82% if the window shifted by a handful of matches. Player B's 71% is a hard floor — it is not moving much regardless of what the next 10 matches look like. The identical display conceals a 4x difference in reliability.

This is not an academic concern. It directly affects the most consequential decision the coverage number informs: **should I redesign this agent or just patch the top fix?** If the combined coverage is 71% +/- 3pp and the top fix alone is 62%, the 9pp architectural upside is real. If the combined coverage is 71% +/- 11pp, the upside could be anywhere from 0pp to 20pp — the player cannot distinguish "holistic redesign is clearly better" from "the difference is noise."

Without surfacing the confidence level, the game hands players a decision instrument with an unmarked error bar and lets them make irreversible architecture decisions based on it.

---

## The Design

### Window Size Effects: The Variance Curve

The relationship between window size and coverage reliability follows a standard binomial confidence interval pattern. For a given true coverage rate p, the standard error is approximately `sqrt(p * (1-p) / n)` where n is the match window size:

```
Window     Coverage   Std Error   95% CI Width   One Match Impact
  Size       (p=0.70)
──────────────────────────────────────────────────────────────────
    10        70%       +/-14.5pp     29pp          10.0pp
    20        70%       +/-10.2pp     20pp           5.0pp
    30        70%        +/-8.4pp     17pp           3.3pp
    45        70%        +/-6.8pp     14pp           2.2pp
    60        70%        +/-5.9pp     12pp           1.7pp
   100        70%        +/-4.6pp      9pp           1.0pp
   150        70%        +/-3.7pp      7pp           0.7pp
   200        70%        +/-3.2pp      6pp           0.5pp
```

The confidence interval shrinks rapidly from 10 to 60 matches, then slows down. The inflection point — where additional matches produce diminishing returns in precision — is around 50-60 matches. This is the mechanical sweet spot: enough data for a 12pp-wide interval, which is tight enough to distinguish "holistic redesign is worth it" (9pp+ upside) from "just apply the top fix" (2pp upside) in most cases.

### Recommended Minimum Window Size

**Hard minimum: 30 matches.** Below 30, the 95% CI is wider than 17pp — the number is more noise than signal. The game should refuse to compute combined coverage below this threshold, or display a prominent warning.

**Recommended default: 45 matches.** The default career analysis window. At 45 matches and a typical coverage rate of 60-75%, the CI is 13-15pp wide. Tight enough to make directional decisions ("this agent has structural problems" vs. "this agent is mostly fine"), loose enough that the player should verify with THOROUGH mode before committing to a full redesign.

**High-confidence threshold: 100 matches.** For players who want to make confident architectural decisions, 100 matches produces a sub-10pp CI. The game can surface this as a recommendation: "Run 55 more matches for a high-confidence estimate."

### The Confidence Interval Display

The combined coverage number gains a visual confidence range. Three display options, presented from lightest to heaviest:

#### Tier 1 — Qualifier Badge (Default)

A single-word qualifier next to the coverage number, color-coded:

```
┌──────────────────────────────────────────────────────────────┐
│  RELAY-C multi-cluster detected                              │
│  3 elements — combined coverage if all fixed: 71%            │
│  Confidence: MODERATE (45 matches)                           │
│  (vs. 62% from top fix alone — +9pp architectural upside)    │
│  [View Agent Audit ->]  [Skip — apply #1 fix]                │
└──────────────────────────────────────────────────────────────┘
```

Qualifier tiers:
- **LOW** (10-29 matches) — Amber text, pulsing dot. "Coverage estimate is rough. Run more matches for a reliable number."
- **MODERATE** (30-59 matches) — Pale blue text, static. "Directionally reliable. Enough data for most decisions."
- **HIGH** (60-99 matches) — White text, static. No qualifier text shown — the number speaks for itself.
- **VERY HIGH** (100+ matches) — White text, faint lock icon. "High-confidence estimate."

The qualifier badge is a single glanceable signal. Players who don't care about statistics see a word and a color. Players who do care can hover for the interval.

#### Tier 2 — Range Whiskers (On Hover)

On hover over the confidence badge, the coverage number expands into a range:

```
Combined coverage: 71%  [64% — 78%]
                        ▔▔▔▔▔▔▔▔▔▔▔
                        95% range based on 45 matches
```

The whiskers are rendered as a thin horizontal bar centered on 71%, extending left to 64% and right to 78%. The bar is drawn in the same muted teal used for the coverage fill in the cluster diagram. The endpoints are labeled with small monospace numbers.

The "95% range" label is the game's diegetic translation of a confidence interval. No statistical jargon — just "range" and a match count. The match count is the anchor: players learn that more matches = tighter range.

#### Tier 3 — Range-Adjusted Upside (Full Detail)

In the expanded Agent Audit view, the architectural upside number (+9pp) gains its own range:

```
Architectural upside: +9pp  [+2pp — +16pp]
                             ▔▔▔▔▔▔▔▔▔▔▔▔▔
                             The upside could be as low as +2pp
                             or as high as +16pp.
                             Run 55 more matches for a tighter estimate.
```

This is the killer display. The upside range directly answers the player's question: "is this redesign worth it?" If the lower bound of the upside is positive (+2pp), the redesign is probably worth it — even in the worst case, the player gains something. If the lower bound is negative (-3pp), the redesign might not help at all. The sign of the lower bound is the binary decision signal.

The "Run 55 more matches" call-to-action is computed as: `100 - current_window_size` (since 100 is the high-confidence threshold). It gives the player a concrete number of matches to run before re-evaluating.

### Below-Minimum Handling

When the match window is below 30 matches, the combined coverage number is displayed in a degraded state:

```
┌──────────────────────────────────────────────────────────────┐
│  RELAY-C multi-cluster detected                              │
│  3 elements — combined coverage: ~71%                        │
│  ⚠ Low confidence — only 18 matches analyzed                 │
│  Coverage may shift by +/-20pp with more data.               │
│  Run 12 more matches for a reliable estimate.                │
│  [View Agent Audit ->]  [Skip — apply #1 fix]                │
└──────────────────────────────────────────────────────────────┘
```

The tilde prefix (`~71%`) is the visual marker for "this is an estimate, not a measurement." The amber warning block below replaces the normal confidence badge. The +/-20pp figure is computed from the actual CI, not hardcoded. The "12 more matches" target (30 - 18 = 12) gives the player a concrete next action.

---

## Player Journeys

### Journey 1: The Premature Architect (20 matches, high variance)

*[0:00]* KAEDE has been running a new RELAY-C build for 20 matches. She opens career analysis. The loading bar fills — 3 seconds. The result panel slides in from the right. The multi-cluster flag appears at the top: "RELAY-C multi-cluster detected. 3 elements — combined coverage: ~68%."

*[0:04]* She notices the tilde and the amber badge: "LOW (20 matches)." Below the number, amber text: "Coverage may shift by +/-20pp with more data. Run 10 more matches for a reliable estimate." The coverage number is rendered in a slightly washed-out typeface — not the crisp white of a high-confidence stat, but a translucent off-white that reads as "provisional."

*[0:08]* She hovers over the LOW badge. The range whiskers appear: "[48% — 88%]". A 40pp-wide interval. The top-fix coverage is 52%. So the architectural upside is "+16pp [range: -4pp — +36pp]." The lower bound is negative. She exhales. This number is essentially meaningless — the redesign could help enormously or not at all.

*[0:15]* She clicks "Skip — apply #1 fix." A soft confirmation chime. She queues 15 more matches. The game remembers the cluster flag and will re-evaluate at 35 matches.

*[0:30]* After 15 more matches, she re-runs career analysis. Window is now 35 matches. The cluster flag reappears: "combined coverage: 64%. Confidence: MODERATE (35 matches)." The range whiskers on hover: "[49% — 79%]." The upside is "+12pp [+0pp — +24pp]." The lower bound is now exactly zero — borderline. She decides to run 25 more matches to hit 60 and get a HIGH-confidence read.

*[1:45]* At 60 matches: "combined coverage: 61%. Confidence: HIGH." Range: "[55% — 67%]." Upside: "+9pp [+3pp — +15pp]." The lower bound is +3pp — firmly positive. She enters Agent Audit mode and begins the redesign. The confidence system prevented her from making a premature 20pp-uncertain decision at match 20 and guided her toward a well-informed one at match 60.

### Journey 2: The Veteran Statistician (200 matches, tight intervals)

*[0:00]* MIKHAIL has a 200-match career analysis window. He has been running the same STRIKER-B build for an entire season. Career analysis completes. The cluster flag: "STRIKER-B multi-cluster detected. 4 elements — combined coverage: 43%. Confidence: VERY HIGH (200 matches)." A faint lock icon sits next to the number — the visual signal for a high-confidence estimate.

*[0:03]* He hovers. Range whiskers: "[36% — 50%]." A 14pp interval with 4 cluster elements — tight. The top-fix coverage is 38%. Upside: "+5pp [+0pp — +10pp]." The lower bound is zero. Even with 200 matches, the upside is marginal.

*[0:07]* He scrolls down into the cluster detail. Each of the four elements has its own coverage bar with individual whiskers. He notices that elements #3 and #4 each cover less than 5% of matches individually, and their whiskers overlap zero on the low end. These are noise candidates — they appeared in the cluster because a few unusual matches triggered them.

*[0:12]* He hovers over element #3: "STRIKER-B hook threshold — 4% (8/200 matches). Range: [2% — 8%]." A faint tooltip: "This element's coverage is near the noise floor. It may not represent a systematic issue." The noise-floor warning appears when an individual element's lower CI bound is below 3% — meaning it could plausibly cover zero matches if the sample were different.

*[0:18]* MIKHAIL dismisses elements #3 and #4 as noise, applies the #1 fix, and notes the cluster for future review. The confidence system allowed him to quickly identify that two of the four cluster members were statistical artifacts, saving him from a redesign driven by sample noise.

### Journey 3: The Confidence Chaser (Optimizing the Range)

*[0:00]* LIN sees the cluster flag after a 45-match window. "HEALER-A multi-cluster detected. Combined coverage: 55%. Confidence: MODERATE." She hovers: "[42% — 68%]." The upside over the top fix: "+8pp [-5pp — +21pp]." The lower bound is -5pp. Not convincing.

*[0:05]* She reads the call-to-action beneath the upside range: "Run 55 more matches for a high-confidence estimate." She clicks it. A dialog appears: "Queue 55 auto-play matches? Your current queue is empty. Estimated time: 4 minutes." She confirms.

*[0:09]* The match queue runs. A subtle progress bar appears at the bottom of the screen — muted charcoal with a thin teal fill line. As each match completes, the fill advances. At matches 50, 60, 70, 80, 90, the career analysis preview in the sidebar live-updates the coverage estimate with progressively tighter whiskers. The animation is like watching a blurry photograph sharpen into focus.

*[0:13]* At match 75 (total window now 120), the confidence badge transitions from MODERATE to VERY HIGH with a quiet chime — a single struck bell note at C5, clean and unadorned. The whiskers have narrowed to "[48% — 60%]." The upside reads "+5pp [+0pp — +10pp]." Still borderline.

*[0:17]* She watches the last 25 matches complete. Final result at 145 matches total: "Combined coverage: 53%. Confidence: VERY HIGH. Range: [45% — 61%]. Upside: +6pp [+0pp — +12pp]." The lower bound is still zero. She has her answer: the redesign is marginal. She applies the top fix and moves on.

*[0:20]* A realization: the confidence-chasing flow itself was information. By watching the estimate converge, she developed an intuition for how much data she needs. Next time she sees a MODERATE badge, she will know whether to trust it or wait.

---

## Strengths and Weaknesses

### Strengths

**Prevents premature architectural decisions.** The single most expensive decision in the game — full agent redesign — currently rests on a number with no error bar. The confidence framing adds the error bar, preventing players from over-reacting to noisy small-sample results.

**Teaches statistical reasoning through play.** The game never says "binomial confidence interval." It says "range" and "run more matches." Players who engage with this system develop intuitions about sample size, variance, and convergence — transferable skills dressed in game mechanics.

**The "run N more matches" CTA is actionable.** Unlike most statistical displays that inform but don't suggest, the confidence system tells the player exactly what to do to reduce uncertainty. This bridges the gap between "I see the problem" and "I know the next step."

**Graceful degradation.** The system does not hide the coverage number when confidence is low — it shows it in a degraded visual state (tilde prefix, amber badge, washed-out text). Players who want to make fast decisions can still use the number. Players who want precision know the cost (more matches).

**Noise-floor detection on individual elements.** The per-element CI whiskers naturally surface cluster members that are statistical artifacts, saving the player from redesigning an agent to fix phantom problems.

### Weaknesses

**Complexity cost.** The combined coverage number was already the hardest stat in the debrief to interpret. Adding confidence intervals, range whiskers, upside ranges, and match-count targets pushes this toward information overload. Players who were already struggling with "what does 71% mean?" now also face "[64% — 78%]."

**Confidence-chasing as procrastination.** Some players will always want a tighter interval. The system recommends 100 matches for "high confidence," but a player who sees "+5pp [+0pp — +10pp]" may want 200 matches to push the lower bound above zero. The game should cap recommendations at 100 matches and not suggest further runs beyond that.

**The tilde prefix is subtle.** Players skimming past the cluster flag may read "~71%" as "71%." The degradation signal needs to be strong enough to register on a glance but not so loud that it obscures the number.

**False precision at high sample sizes.** A 200-match window with a 6pp CI sounds precise, but the underlying assumption — that match outcomes are independent and identically distributed — breaks down if the player changed their config mid-window. The CI is technically correct but substantively wrong when the sample is non-stationary. This is a limitation the game cannot fully address without tracking config-change timestamps and segmenting windows.

---

## Interaction Effects

**4.69b (Combined coverage display):** The confidence system layers directly onto the combined coverage number that 4.69b defines. The display format in 4.69b must accommodate the confidence badge, hover whiskers, and below-minimum degraded state. The two aspects are mechanically inseparable — 4.69b defines *what* is shown, 4.69r defines *how trustworthy* the display claims to be.

**4.93 (Accuracy stat confidence interval):** The pre-ranking accuracy stat (4.64) will also want a confidence interval (4.93). The visual vocabulary developed here — qualifier badges, hover whiskers, range labels — should be reused identically for 4.93 to establish a game-wide convention: "ranges look like this, confidence badges look like this." If the two systems use different visual languages, players must learn two interval notations. Unify them.

**4.69q (Prospective coverage):** Prospective coverage asks "what would the coverage be if I made this change?" That projection should inherit the same confidence framing — a prospective estimate computed from a 20-match window is even less reliable than a retrospective one, because it's predicting counterfactual outcomes, not counting actual ones. The confidence badge for prospective coverage might warrant a stricter minimum window (45 instead of 30).

**4.69o (Plain-language translation):** The plain-language system translates "71%" into prose like "fixing all three RELAY-C elements would improve roughly seven out of ten matches." The confidence framing adds a new translation task: "71% [64% — 78%]" becomes "roughly six to eight out of ten matches." The range naturally produces a more hedged plain-language output, which is appropriate — the hedge is the whole point.

**4.60 (Search budget as resource):** Running additional matches to tighten a confidence interval costs search budget. If the budget is limited, the player faces a trade-off: spend budget on getting a more precise diagnostic, or spend it on testing a new config. This is a healthy tension — it prevents confidence-chasing from being free and makes the "run 55 more matches" CTA carry real opportunity cost.

---

## Comparable Games and Media

**Nate Silver's FiveThirtyEight election forecasts.** The canonical mainstream example of presenting probabilistic estimates with uncertainty ranges to a general audience. FiveThirtyEight used needle gauges, probability distributions, and range bars to communicate "this is our estimate, but it could easily be wrong by this much." The lesson: even mass audiences can learn to read ranges if the visual language is consistent and the context is compelling. Robot Uprising's coverage whiskers serve the same function as FiveThirtyEight's probability bands.

**XCOM: Enemy Unknown (hit chance display).** XCOM shows "87% to hit" with no confidence interval, and players routinely rage when they miss. The community term "XCOM math" reflects the perception that displayed percentages are lies. Robot Uprising's confidence framing is explicitly designed to prevent "XCOM math" sentiment — by showing the range, the game inoculates against the feeling of betrayal when a number shifts. "71% [64% — 78%]" prepares the player for the possibility of 64%.

**Poker HUDs (Hold'em Manager, PokerTracker).** Heads-up displays in online poker show opponent statistics (VPIP, PFR, aggression factor) computed over observed hands. Experienced poker players know that stats computed over 20 hands are unreliable — the rule of thumb is "100+ hands for VPIP, 500+ for positional stats." Some HUDs display the sample size next to each stat; better ones color-code the stat by reliability. Robot Uprising's qualifier badges (LOW / MODERATE / HIGH / VERY HIGH) directly mirror this poker HUD convention.

**Hearthstone Deck Tracker (HSReplay).** HSReplay displays deck winrates computed over user-submitted games. Early in an expansion, a deck might show "68% winrate (23 games)" — and the community has learned to wait for 1000+ games before trusting a winrate. HSReplay eventually added sample-size indicators. The parallel to Robot Uprising: any displayed ratio needs a sample size context, and the game should provide it proactively rather than letting players discover sample-size effects through painful experience.

---

## Sensory Description

### Color Palette

The confidence system uses a four-tier color vocabulary that maps to the qualifier badges:

- **LOW (10-29 matches):** Amber (#D4A03C) — warm, attention-getting but not alarming. Used for the badge text, the tilde prefix, and the degraded coverage number. The amber is the same hue used for caution states elsewhere in the UI (low battery, queue nearly full), establishing a cross-system "this is provisional" signal.
- **MODERATE (30-59 matches):** Pale steel blue (#7A9CB8) — cool, neutral, functional. The default state. Most players will see this color most of the time. It reads as "this is working, nothing to worry about, but not exceptional."
- **HIGH (60-99 matches):** Clean white (#E8E8E8) — the standard text color. The confidence system deliberately *disappears* at HIGH confidence — no special color, no badge emphasis. The absence of color is the signal: the number is trustworthy enough that it doesn't need qualification.
- **VERY HIGH (100+ matches):** White with a hairline lock icon in pale teal (#5BA4A4). The lock is 8x8 pixels, rendered in the same teal as the coverage fill bar. It sits to the right of the number, barely visible — a quiet "this is locked in" signal for players who know to look for it.

### Range Whisker Rendering

The hover whiskers are drawn as a 1px horizontal line in pale teal (#5BA4A4, 60% opacity), with small vertical endcaps (3px tall). The center point (the estimate) is marked with a 4px filled circle in full-opacity teal. The range endpoints are labeled in 9px monospace text, positioned 2px above the whisker line. The entire whisker assembly fades in over 150ms on hover — fast enough to feel responsive, slow enough to be perceived as an animation rather than a state change.

When the range is wider than 20pp, the whisker line develops a subtle dashed pattern — alternating 3px solid and 2px gap — signaling "this range is wide." Below 10pp, the line is solid and the endcap labels fade to 40% opacity, signaling "this range is tight enough that the endpoints don't matter much."

### Audio

- **Confidence upgrade chime (MODERATE to HIGH, or HIGH to VERY HIGH):** A single struck bell note at C5, clean sine wave with a 400ms decay. No reverb. The sound evokes a lock clicking into place — a small, definitive mechanical event. It plays once, when the confidence tier transitions during a live-updating career analysis.
- **Below-minimum warning tone:** A soft two-note descending pair — G4 to E4, each 100ms, triangle wave. Not alarming — more like a gentle "hmm, not quite." It plays when career analysis completes with fewer than 30 matches in the window.
- **Range whisker hover:** No sound. The whiskers are a visual-only element — adding audio to a hover state would be intrusive on repeated use.

### Animation

- **Confidence badge fade-in:** The badge text (LOW / MODERATE / HIGH / VERY HIGH) types itself character-by-character at 40ms per character after the coverage number appears. This 200-280ms micro-animation draws the eye to the badge without being ostentatious.
- **Live convergence shimmer:** During auto-play match queues, the coverage number in the sidebar preview pulses gently — the text opacity oscillates between 70% and 100% on a 2-second sine cycle, like a value that hasn't settled yet. When the match queue completes and the final number is computed, the shimmer stops and the number snaps to 100% opacity. The shimmer-to-solid transition is the visual metaphor for "uncertain estimate becoming definitive measurement."
- **Whisker narrowing on re-analysis:** When a player re-runs career analysis with more matches (e.g., going from 45 to 100 matches), and the confidence whiskers are visible, the old whiskers animate inward to the new, tighter range over 300ms. The endpoints slide toward the center with an ease-out curve. This animation makes the abstract concept of "more data = tighter interval" viscerally visible — the player watches the uncertainty shrink.
