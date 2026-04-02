# Coverage Goal and Improvement Countdown

**Aspect:** 4.116 — Coverage goal and improvement countdown: a player-settable "target coverage" (default: 20%) with a displayed "estimated runs to target" based on current improvement rate per career analysis; creates a named architectural goal; the countdown should factor in the player's historical rate of coverage reduction per career analysis run, not just linear extrapolation; interaction with 4.72 debt-free achievement

**Parent:** 4.68 — Coverage percentage as season health metric
**Siblings:** 4.114 — Coverage recurrence map; 4.115 — Opponent coverage as adversarial intelligence; 4.117 — The "coverage floor" design question
**Related:** 4.72 — Debt-free season achievement; 4.25 — EDT trajectory as career metric; 4.59 — Career minimum fix; 4.70 — Career analysis filtered by opponent archetype

---

## The Core Problem

The coverage trend (4.68) tells players where they have been. The debt-free achievement (4.72) tells them where they should go. Nothing tells them **how long it will take to get there**.

This is not a cosmetic gap. It is a motivational architecture problem. A player at 44% coverage who sees the debt-free threshold at 20% faces a 24-point journey with no milestones, no pacing information, and no feedback about whether their rate of improvement is fast, slow, stalling, or regressing. The trend sparkline shows direction but not velocity. The debt-free tracker shows eligibility but not proximity. The player is walking through fog toward a light they can see but cannot estimate the distance to.

Fitness apps solved this problem decades ago. A runner training for a sub-25-minute 5K does not just see their past times on a graph. They see: "At your current improvement rate of 12 seconds per week, you will hit your target in approximately 6 weeks." The estimate might be wrong. The runner might plateau. But the estimate transforms a vague aspiration into a concrete, temporally anchored plan. It converts "I want to get faster" into "I will be faster by mid-March." The psychological difference is enormous.

Robot Uprising's coverage metric has all the properties needed for this kind of goal-setting. It is numeric, bounded, directional (lower is better), and computed at discrete intervals (career analysis runs). It has a natural default target (20%, the debt-free threshold). And critically, it has historical data: a sequence of coverage scores across runs that implicitly encodes the player's rate of improvement. The countdown feature extracts that rate, projects it forward, and displays the result as a named goal with an estimated arrival time.

The design challenge is that coverage improvement is not linear. It follows a characteristic curve: steep early gains as the player fixes their most glaring weakness, followed by a plateau as the remaining weaknesses become more diffuse and harder to isolate, followed by occasional spikes when a meta shift or config experiment destabilizes the architecture. A linear countdown ("you've dropped 5 points per run, so 4 more runs") will be wrong — optimistically wrong at first, then frustratingly wrong later. The countdown must model the player's actual improvement trajectory, not a straight-line extrapolation.

---

## The Goal-Setting UI

### Setting a Coverage Target

The goal-setting entry point lives in the Coverage Trend panel (4.68), below the sparkline graph. A small prompt appears once the player has completed at least 3 career analyses:

```
SET A COVERAGE GOAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current coverage:  34%
Default target:    20%  (Debt-Free threshold)

[ Set target: 20% ▾ ]    [ Name this goal ]
```

The target dropdown offers presets at 5-point increments: 30%, 25%, 20%, 15%, 10%. The player can also type a custom value. The "Name this goal" field is optional — it accepts a short string like "Clean Architecture" or "Season 5 Debt-Free" or "Sub-25." Named goals persist in the career record; unnamed goals default to "Target: XX%."

The naming is more important than it appears. Fitness apps discovered that named goals ("Operation Beach Body" in MyFitnessPal, user-created challenges in Strava) have significantly higher completion rates than unnamed numeric targets. The name transforms a number into an identity — the player is no longer "trying to get to 20%" but "working toward Clean Architecture." The goal becomes a project, not a chore.

Visually, the goal-setting panel uses the same monospace diagnostic font as the career analysis output. The target field is outlined in a thin dashed border — not yet solid, not yet earned. The panel is muted: medium gray text on the existing background, not drawing attention until the player decides to engage with it. Goal-setting is opt-in, and the UI respects that by not shouting.

### The Countdown Display

Once a goal is set, the Coverage Trend panel gains a new row below the sparkline:

```
COVERAGE TREND (6 runs)
▅▄▃▃▂▃  [44% → 38% → 34% → 31% → 24% → 28%]

GOAL: "Clean Architecture" — Target 20%
Current: 28%    Gap: 8pts
Estimated: ~4 runs to target  (based on weighted regression)
Rate: −3.2 pts/run (last 6 runs, decelerating)
```

The countdown number ("~4 runs") is the headline. It is displayed larger than the surrounding text, in the same teal used for debt-free status when the estimate is reasonable, or in amber when the model detects a plateau or regression pattern that makes the estimate unreliable. A tilde prefix (~) is always present — the estimate is never displayed as exact.

Below the headline, two supporting metrics provide transparency: the computed improvement rate and the model type used. "Weighted regression" means the system used exponentially weighted recent runs rather than a simple average. "Decelerating" means the rate of improvement is slowing — later runs show smaller drops than earlier runs.

When the player hovers over the countdown number, a tooltip shows the computation:

```
Projection method: Exponential weighted regression (λ=0.7)
Data points: 6 career analysis runs
Weighted rate: −3.2 pts/run (recent runs weighted 2x)
Simple linear rate: −4.1 pts/run (would predict ~2 runs — likely too optimistic)
Plateau detection: mild deceleration detected (rate halved from runs 1-3 to runs 4-6)
Confidence: moderate — 6 data points, non-linear trajectory
```

This tooltip is deliberately verbose. Most players will not read it. But the players who do — the ones who care about whether the estimate is trustworthy — will find a transparent breakdown of the model's reasoning. This transparency prevents the countdown from feeling like a magic number. It is a computed estimate, and the computation is visible.

---

## Countdown Computation: Regression vs. Linear

### Why Linear Fails

Linear extrapolation takes the average per-run improvement and divides the remaining gap by it. If a player dropped from 44% to 28% across 6 runs, the average is (44-28)/6 = 2.67 points per run, and the estimate to 20% is 8/2.67 = 3 runs. This is almost certainly wrong.

The problem is that coverage improvement is front-loaded. Early runs often show 6-8 point drops as the player fixes their most dominant weakness. Later runs show 1-3 point drops — or even reversals — as the remaining weaknesses become smaller and more entangled. The historical average is dominated by the early steep phase and overpredicts the late shallow phase. The linear estimate says "3 runs" when the reality is closer to 5-8 runs, if the player does not plateau entirely.

This is the treadmill problem from fitness apps. Couch-to-5K programs universally abandon linear projections after the first two weeks because early cardiovascular improvement is rapid and non-representative of the long slog from "can run 2 miles" to "can run 3.1 miles comfortably." The apps that kept linear projections discovered that users became frustrated when the estimated date kept sliding backward — the app had promised "2 weeks to goal" and then two weeks later said "2 more weeks." Credibility collapsed and users stopped trusting the estimate.

### The Weighted Regression Model

The recommended approach uses **exponentially weighted regression** with a decay factor (lambda = 0.7 by default). Each career analysis run is weighted by recency: the most recent run has weight 1.0, the previous run has weight 0.7, the one before that 0.49, and so on. This means the rate estimate is dominated by recent performance, not the steep early drops that are no longer representative.

The model fits a line through the weighted data points and extrapolates forward. But critically, it also checks for two failure modes:

**Plateau detection.** If the last 3 runs show per-run improvement below 1 point, the model flags a plateau. The countdown display changes:

```
GOAL: "Clean Architecture" — Target 20%
Current: 23%    Gap: 3pts
Estimated: uncertain — plateau detected
Rate: −0.6 pts/run (last 3 runs near-flat)
```

The estimate becomes "uncertain" rather than a misleading number. The display shifts from teal to amber. A small note appears: "Your recent improvement rate has slowed significantly. Consider running a filtered career analysis (4.70) to identify remaining structural weaknesses." This is not a scolding — it is a diagnostic suggestion that redirects the player toward a tool that might break the plateau.

**Regression detection.** If coverage increased in the most recent run (regression), the model handles this separately from the trend. A single regression is normal — config experiments and meta shifts cause temporary coverage spikes. But two consecutive regressions suggest the player's architecture is destabilizing, not improving. The display:

```
GOAL: "Clean Architecture" — Target 20%
Current: 31%    Gap: 11pts
Estimated: paused — 2 consecutive regressions
Rate: +2.1 pts/run (recent trend is worsening)
```

"Paused" means the countdown has stopped — the model will not extrapolate a worsening trend forward. It waits for the player to stabilize before resuming the estimate. This prevents the absurd case of displaying "estimated: never" or a negative run count, both of which would be demoralizing and useless.

---

## Player Journeys

### Journey 1: The Motivated Architect

Kira has been playing for two seasons. Her coverage started at 58% in her first career analysis — a RELAY context buffer weakness that opponents exploited relentlessly. She fixed it. Her second run came back at 41%. She fixed the next dominant element (SCOUT hook threshold). Third run: 33%. She is hooked on the diagnostic loop and improving steadily.

After her third run, the goal-setting prompt appears. She sets a target of 20% and names it "Debt-Free by Season 3." The countdown displays: "~4 runs to target (based on weighted regression)." She runs a career analysis every 20 matches. Four runs later — roughly 80 matches — she checks the countdown.

Her coverage trajectory: 58 -> 41 -> 33 -> 29 -> 26 -> 24 -> 22. The countdown now reads "~2 runs to target." But her rate is decelerating. The weighted regression caught this: her early drops were 17, 8, 4 points. Her recent drops are 3, 2, 2 points. The model says 2 runs, but the tooltip says "decelerating — actual may be 2-4 runs."

Two runs later she hits 19%. The countdown reads: "GOAL REACHED." The display briefly flashes teal, then transforms into a completed-goal record:

```
GOAL COMPLETED: "Debt-Free by Season 3"
Target: 20%    Reached: 19%    Runs: 7 (estimated was 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The estimate was off by 3 runs. It predicted 4, took 7. But Kira does not care. The estimate gave her a number to work toward, and the deceleration warnings set expectations that it would take longer. The overshoot feels earned, not frustrating.

### Journey 2: The Plateau Player

Marcus is stuck. His coverage dropped from 47% to 31% across his first 4 runs — impressive early progress. He set a goal of 20% after run 3. The countdown said "~3 runs." But runs 5, 6, and 7 came back at 29%, 30%, 28%. He is oscillating around 29%, plus or minus a point. The plateau indicator triggered after run 6.

The countdown now reads: "uncertain — plateau detected." The amber text is visible every time he opens the Coverage Trend panel. It bothers him. Not in a punitive way — the message is clinical, not judgmental — but in a way that makes the plateau undeniable. Without the countdown, he might not have noticed. The sparkline looks roughly flat, but sparklines are easy to misread. The word "plateau" is not easy to misread.

The suggested action ("Consider running a filtered career analysis") sends him to the opponent archetype filter (4.70). He runs a career analysis filtered to "matches against high hook-density opponents" and discovers that his coverage against that archetype is 42% — far higher than his overall 29%. His generic architecture handles most opponents adequately but has a specific weakness against hook-heavy configs. He redesigns his attention allocation for hook scenarios.

Run 8: coverage drops to 24%. The plateau broke. The countdown resumes: "~2 runs to target." The display returns to teal. Marcus's journey from plateau to breakthrough was facilitated by the countdown's refusal to lie — it said "uncertain" rather than projecting a number it could not support, and it pointed toward the diagnostic tool that would help.

### Journey 3: The Overambitious Sprinter

Davi sets a goal of 10% after his second career analysis. His coverage is currently 51%. The countdown computes: "~8 runs to target (based on limited data — 2 runs only)." A small warning appears: "Estimates based on fewer than 4 data points are highly unreliable."

Davi ignores this. He is chasing the lowest possible coverage, treating it as a leaderboard metric. His first several runs go well: 51 -> 39 -> 30 -> 25. The countdown updates: "~4 runs to target." He is ahead of pace. But the 4.117 coverage floor problem begins to materialize. Below 20%, improvements become agonizingly small. His next runs: 23 -> 21 -> 20 -> 19 -> 20 -> 19.

The countdown has been recalculating with each run. After run 9, it reads: "~12 runs to target — severe deceleration detected." The rate of improvement below 20% is essentially zero — he is oscillating at the theoretical floor for his archetype's scenario distribution. The game's scenario variance means some fraction of failures will always cluster on one element, and that fraction is around 18-20% for his config class.

Davi hits the interaction with 4.117 — the coverage floor question. His goal of 10% may be structurally impossible. The countdown does not know this (it does not have access to the theoretical floor), but the severe deceleration signal communicates the same information empirically: "you are not improving at a rate that will ever reach this target." Davi either adjusts his goal to 18% (achievable, and would still earn debt-free) or accepts that 10% was aspirational and retires the goal.

---

## Strengths and Weaknesses

### Strengths

**Temporal anchoring.** The countdown converts a vague aspiration ("I want better coverage") into a time-bound project ("approximately 4 runs away"). This is the single most reliable motivational technique from behavioral psychology: deadlines, even self-imposed and estimated ones, increase follow-through rates compared to open-ended goals. The fitness app industry validated this at massive scale — Strava's "Estimated Time to Goal" feature increased training consistency by 23% in their 2021 cohort study.

**Deceleration honesty.** The weighted regression model acknowledges that improvement is non-linear. By showing "decelerating" and shifting to amber/uncertain, the system prevents the credibility collapse that linear countdowns create. The player never sees an estimate slide backward unexpectedly — instead, they see the system progressively hedge its prediction, which feels like honest analysis rather than a broken promise.

**Named goals as identity.** The optional naming transforms numeric targets into personal projects. "Debt-Free by Season 3" is a story. "Target: 20%" is a number. The story is stickier, more shareable, more memorable. When Kira tells another player "I'm working on Debt-Free by Season 3," she is communicating her architectural philosophy, her timeline, and her current status in a single phrase.

### Weaknesses

**Pressure from visibility.** The countdown is always visible in the Coverage Trend panel. For players who are plateauing or regressing, the amber "uncertain" or "paused" text is a persistent reminder of stalled progress. Some players will find this motivating (it surfaces the problem so they can fix it). Others will find it oppressive — a score that follows them around and makes every career analysis feel like a test. The debt-free achievement (4.72) has a similar pressure property, but it is evaluated only at season end. The countdown is live, always updating, always watching.

**Estimate inaccuracy frustration.** Even the weighted regression model will produce estimates that are wrong, often by 50-100%. A prediction of "~4 runs" that takes 7 is a 75% overshoot. Players who treat the estimate as a promise will feel misled. The tilde and the "approximate" language help set expectations, but some players will anchor on the number regardless. This is the same problem GPS navigation apps face: the estimated arrival time is probabilistic, but drivers treat it as a contract.

**Plateau as dead end.** When the countdown displays "uncertain — plateau detected," it offers a diagnostic suggestion but no guarantee that the plateau will break. A player who follows the suggestion, runs the filtered analysis, makes changes, and still plateaus will feel the system has failed them. The countdown diagnosed the problem but could not solve it. This is inherently frustrating — the tool raised expectations of improvement and then could not deliver.

**Goal obsolescence.** Named goals assume the player's architectural direction remains constant. But meta shifts, new unit unlocks, and experimental config changes can make a coverage target irrelevant. A player who sets a 20% goal, then completely redesigns their config around a different archetype, will see their coverage spike to 50% as the new config has entirely new weaknesses. The countdown resets to "~8 runs," and the named goal "Clean Architecture" no longer describes their project. The system needs a graceful way to retire or reset goals — but retirement feels like failure.

---

## Interaction Effects

### Debt-Free Achievement (4.72)

The coverage goal countdown is the natural companion to the debt-free tracker. The debt-free tracker answers "am I eligible this season?" The countdown answers "when will I be able to sustain eligibility?" A player at 28% who is not yet debt-free eligible can set a 20% goal and use the countdown to estimate when they will reach the threshold — and then use the debt-free tracker to verify they maintain it once there.

The interaction becomes interesting when the player's goal IS 20% (the default). In this case, "goal reached" and "debt-free eligible" should align — hitting the coverage target means the player has reached the threshold for the achievement. But the debt-free achievement requires sustained sub-20% coverage across an entire season, while the goal countdown fires the moment coverage drops below 20% in a single run. A player who "reaches their goal" at 19% but then regresses to 23% in the next run has reached their coverage target but is no longer debt-free eligible. The countdown says "GOAL REACHED." The debt-free tracker says "INELIGIBLE." This dissonance is confusing.

The resolution: when the goal target matches the debt-free threshold (20%), the goal completion message should reference the achievement explicitly: "GOAL REACHED — you are now in debt-free territory. Maintain sub-20% coverage across the season to earn the Debt-Free Season achievement." This connects the one-time goal to the sustained challenge, preventing premature celebration.

### Career Trajectory and eEDT (4.25)

The coverage countdown operates on a different timescale than the EDT trajectory. eEDT updates every match (30-match rolling window). Coverage updates every career analysis run (20-30 match intervals). A player improving their eEDT rapidly but seeing no coverage improvement is gaining contest quality without fixing structural weaknesses — they are fighting longer but losing for the same reason. The inverse — flat eEDT but declining coverage — means the player is fixing weaknesses without changing match dynamics. Both signals together paint the full picture.

The countdown could optionally display a small eEDT correlation indicator: "Your eEDT has risen 0.08 during this goal period — you are fighting longer, and your coverage is dropping. Both signals confirm architectural improvement." Or: "Your eEDT is flat while coverage is declining — you are fixing weaknesses without changing how matches play out. Consider whether your goal is improving your diagnostics or your gameplay."

### Coverage Percentile and Competitive Context

If the game ever surfaces coverage percentile (how your coverage compares to all players), the countdown gains a competitive dimension. A goal of 20% might be the debt-free threshold, but it might also be the 85th percentile — meaning only 15% of players have sustained sub-20% coverage. Displaying this context alongside the countdown ("Target: 20% — top 15% of all players") adds social motivation without requiring leaderboard competition. It answers the unspoken question: "Is this goal hard?"

### Practice Mode

If the game offers a practice or sandbox mode where matches do not count toward career stats, the countdown must decide whether to include practice matches in its computation. The recommended answer: no. Practice matches should not contribute to the career analysis corpus, so they should not affect coverage. But the countdown should acknowledge practice: "You have played 12 practice matches since your last career analysis. These matches will not affect your coverage score, but insights from practice may inform your next config revision." This prevents the frustrating experience of practicing extensively, expecting coverage improvement, and then seeing no change in the countdown.

---

## Comparable Systems

**Strava Estimated Time to Goal.** Strava's training goal feature lets runners set a target race time and displays estimated weeks to goal based on recent training load and pace improvements. The model uses a logarithmic decay curve, not linear projection, because athletic improvement follows a power law. Coverage improvement may follow a similar curve — steep early, asymptotic late. Strava's key lesson: always show the confidence interval, not just the point estimate. Players tolerate wide confidence bands ("4-8 runs") far better than precise-but-wrong point estimates ("5 runs").

**Duolingo Streaks.** Duolingo's streak counter is superficially similar — a displayed number that counts toward a goal. But the mechanisms are opposite. A streak counts consecutive completions (additive). The coverage countdown counts remaining distance (subtractive). Duolingo's streak punishes a single missed day with a full reset; the coverage countdown degrades gracefully through regression detection. The lesson from Duolingo: streak-based systems produce anxiety that drives engagement but also drives churn. The coverage countdown should avoid streak mechanics — it should never reset to zero on a bad run.

**GitHub Contribution Goals.** GitHub does not have formal contribution goals, but the contribution graph (the green squares) functions as an implicit goal-tracking system. Players set informal goals ("fill the entire year green") and track progress visually. The lesson: visual density communicates progress better than numbers. The coverage sparkline with the target line already provides this — the sparkline approaching and crossing the dashed 20% line is a visual completion signal that supplements the numeric countdown.

**Savings Calculators.** Bank and fintech savings calculators (Wealthsimple, YNAB) display "estimated time to savings goal" based on current contribution rate. They face the same non-linearity problem: early contributions are easy, later contributions compete with expenses. Their solution — re-estimating every time the user adds a contribution — maps exactly to the coverage countdown re-estimating every time the player runs a career analysis. YNAB's key lesson: show the historical estimate path alongside the current estimate. "Your first estimate was 12 months. Your current estimate is 8 months. You are ahead of pace." This kind of meta-estimate (the trend of the estimates themselves) adds a second layer of progress feedback.

---

## Open Questions

**Should goals be shareable?** Named goals with countdowns are natural social objects. "I'm 2 runs from Clean Architecture" is meaningful to another player who understands the system. But sharing goals creates social pressure — and social failure when goals are missed or retired. Should the game allow players to publish their goals to their profile? Should there be a "Goal Reached" notification visible to friends? The social dimension adds motivation but also adds stakes.

**Should the system suggest goals?** After a career analysis shows 38% coverage, should the system proactively suggest "Set a goal of 25%?" Proactive suggestions increase adoption but reduce autonomy. The current design waits for the player to engage with goal-setting. A middle path: the goal-setting prompt appears passively ("SET A COVERAGE GOAL" text at the bottom of the trend panel) but never pushes a notification or pop-up.

**Should multiple simultaneous goals be allowed?** A player might want a 25% goal for this season and a 15% long-term goal. Multiple goals create complexity in the UI — two countdown numbers, two progress bars, two named objectives. The recommendation: one active goal at a time, with the option to "graduate" a completed goal into a new, more ambitious target. "Clean Architecture" at 20% is reached; the player sets "Deep Clean" at 15%. The completed goal persists in the career record as a milestone.

**What happens when a goal becomes impossible?** If the coverage floor (4.117) means 10% is unreachable, should the system tell the player? The countdown would show severe deceleration, but it cannot distinguish "you've plateaued temporarily" from "this is the theoretical minimum." Integrating floor awareness into the countdown is a design decision that depends on whether the floor is computed and surfaced elsewhere in the game's systems.
