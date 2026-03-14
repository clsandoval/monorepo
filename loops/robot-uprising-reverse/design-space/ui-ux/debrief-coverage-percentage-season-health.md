# Coverage Percentage as Season Health Metric

**Aspect:** 4.68 — Cross-match coverage percentage as season health metric: graphing the top-candidate coverage percentage across each career analysis run as a "structural robustness trend"; declining coverage = improving architecture; flat or rising coverage = plateaued or regressing; the long-arc view of architectural quality no single match metric can provide.

**Parent:** 4.59 — Career minimum fix (cross-match exhaustive search)
**Siblings:** 4.25 — EDT trajectory as career metric; 4.64 — Pre-ranking accuracy as displayed stat; 4.69 — Agent multi-cluster detection; 4.72 — Debt-free season achievement
**Related:** 5.22 — Gauntlet as third act; 7.10 — Config necropsy culture; 8.07 — Robustness vs. efficiency tension; 8.08 — Real-language vocabulary claim; 8.13 — Three-act metric mapping

---

## The Core Concept

Every time the player runs a Career Analysis (4.59), the computation produces a **top-candidate coverage score**: the percentage of their recent matches that would have been improved by a single config change. A score of 61% means one element was responsible for 61% of their losses. A score of 18% means no single element accounts for more than 18%.

The coverage score is already shown in the career analysis result panel. But a *single* coverage score is a snapshot. The real signal emerges when you track that score across multiple career analysis runs over time.

**The Coverage Trend** is a per-run history of top-candidate coverage scores, displayed as a sparkline graph:

```
Career Analysis Coverage History (6 runs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run 1 (Season 1, Match 30):  ████████████ 61%  RELAY context buffer
Run 2 (Season 1, Match 60):  ████████░░░░ 43%  SCOUT hook threshold
Run 3 (Season 2, Match 95):  ██████░░░░░░ 38%  STRIKER patrol radius
Run 4 (Season 2, Match 130): █████░░░░░░░ 32%  RELAY fallback filter
Run 5 (Season 3, Match 165): ███░░░░░░░░░ 21%  COMMAND priority queue
Run 6 (Season 3, Match 200): ████░░░░░░░░ 26%  RELAY context buffer (again)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trend: generally declining ↓  (structural robustness improving)
Alert: Run 6 coverage is higher than Run 5 — possible regression
```

What this history says:
- Runs 1–5: the player is becoming architecturally more robust. Their config's failures are distributing across more elements rather than clustering in one place.
- Run 6: the coverage spiked back up, and the same element (RELAY context buffer) recurred. Something they changed between runs 5 and 6 re-introduced the structural weakness they fixed in Season 1.

The coverage trend is **the inverse of robustness** — lower is better. An architecture with 18% coverage has no obvious weak point. An architecture with 62% coverage has one component that opponents or scenario randomness will reliably exploit.

This is the longest timescale metric in the game. The EDT trajectory (4.25) tracks 30-match rolling averages. The pre-ranking accuracy stat (4.64) tracks 30-session windows. The coverage trend tracks career analysis *runs* — which happen every 20–30 matches, meaning a meaningful 5-run history requires 100–150 matches of play. It is the game's most patient metric.

And because it is the most patient, it can see what no other metric can: **the long-arc shape of how a player's architectural philosophy has evolved over an entire career.**

---

## The Mechanical Underpinning

### What the Coverage Score Actually Represents

The top-candidate coverage score is the career minimum fix result — the single config change that would have improved the highest fraction of analyzed matches. It is computed by the exhaustive cross-match search (Option C in 4.59):

```
Coverage score = matches_improved_by_best_candidate / matches_analyzed
```

At N=20 matches, a coverage score of 65% means the best single fix would have improved 13 of those 20 matches.

### What "Coverage Distribution" Actually Tells You

The coverage score for the top candidate is a meaningful headline. But the *distribution* across the runner-up list is equally meaningful:

**Concentrated failure profile** (bad):
```
#1 RELAY context buffer:  65% (13/20)
#2 SCOUT hook threshold:  30% (6/20)
#3 STRIKER patrol radius: 20% (4/20)
```
One element dominates. The architecture has a single critical path. Fixing it will dramatically reduce coverage — but until you fix it, opponents can reliably exploit it.

**Distributed failure profile** (good):
```
#1 COMMAND priority queue: 22% (5/23)
#2 RELAY fallback filter:  17% (4/23)
#3 SCOUT attention filter: 13% (3/23)
#4 STRIKER patrol radius: 13% (3/23)
```
No single element dominates. The architecture fails for diverse reasons across diverse matches. This is harder for opponents to predict and exploit — but it's also harder to improve systematically.

The coverage trend sparkline shows only the top-candidate score over time, which is the headline. A separate "Failure Distribution View" could show the runner-up distribution as a stacked bar per run — that is beyond the sparkline, available on drill-down.

### When Coverage Should Be Computed

Coverage is computed as part of the Career Analysis (4.59). The coverage trend only adds data points when the player deliberately runs a career analysis. This is a feature, not a bug: **the trend grows only through intentional diagnostic work.**

This gives the coverage trend a fundamentally different character from the EDT trajectory (which accumulates passively from every match). A player who never runs career analyses has no coverage trend. A player who runs a career analysis every 20–25 matches will have a rich 5-run history after 100 matches.

The metric rewards deliberate diagnostic practice.

---

## Design Options

### Option A: The Coverage Sparkline (Minimal)

**What it is:** A compact sparkline embedded in the Career Analysis result panel and the Gauntlet profile card, showing the top-candidate coverage percentage from each career analysis run.

**What it looks like:**

```
COVERAGE TREND (5 runs):
▅▄▃▂▃  [41% → 33% → 27% → 19% → 26%]
```

Five vertical bars, each representing one career analysis run. Height proportional to coverage percentage (taller bar = higher coverage = more concentrated structural weakness). Color: red (>50%), amber (30–50%), teal (15–30%), green (<15%). The most recent run is on the right.

A thin dashed "target line" at 20% (the "debt-free" zone, aspect 4.72) provides a reference point.

**Strengths:**
- Minimal footprint — one row of data
- Immediately legible as a trend (are bars getting shorter or taller?)
- Color-coded so status is scannable without reading numbers
- Tucks naturally into the existing career analysis panel, alongside the result card

**Weaknesses:**
- No axis labels in minimal form — requires a hover to get actual percentages
- Only shows the top-candidate coverage, not the runner-up distribution
- 5 bars is a small window; 3 or fewer is almost meaningless as a trend

**Recommended use:** Default display for all players who have 2+ career analyses. Compact enough to live in the debrief panel permanently.

---

### Option B: The Season Health Dashboard (Dedicated Screen)

**What it is:** A dedicated "Architectural Health" screen accessible from the Gauntlet hub. Shows the full coverage history with rich annotations: which element was the top candidate for each run, which elements were fixed between runs, and the coverage trajectory with regression alerts.

**What it looks like:**

```
ARCHITECTURAL HEALTH — Career Arc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  60% ┤╮
      │ ╲
  40% ┤  ╲   ╮
      │   ╲  │╲
  20% ┤    ╲╯  ╲─────────────
      │                      ╰────╮
   0% ┼────────────────────────────────→
      Run1  Run2  Run3  Run4  Run5  Run6

  Run 1 (M30):  61%  RELAY context buffer     [fixed M32]
  Run 2 (M60):  43%  SCOUT hook threshold     [fixed M65]
  Run 3 (M95):  38%  STRIKER patrol radius    [fixed M100]
  Run 4 (M130): 32%  RELAY fallback filter    [not yet fixed]
  Run 5 (M165): 19%  COMMAND priority queue   [fixed M167]
  Run 6 (M200): 26%  RELAY context buffer ⚠   [REGRESSION — element recurred]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Coverage trend: ↓ improving  (–35pp over 6 runs)
Current coverage: 26%  (Run 6 — potential regression, Run 5 was 19%)
Top structural debt: RELAY context buffer (recurred after Season 1)
```

The "fixed M32" annotations are inferred from the player's config history (4.38): the game detects when a flagged element was modified in the match window after a career analysis. "REGRESSION — element recurred" is a derived flag: the same element that appeared in Run 1 reappears in Run 6, suggesting the fix from Season 1 was partially undone by later config changes.

**Strengths:**
- Full context: which element was responsible for each run, whether it was fixed
- Regression detection visible at a glance
- Rich enough for the Keiko archetype of analytical veteran
- The "fixed" / "not yet fixed" annotations make the architectural debt lifecycle legible

**Weaknesses:**
- Dedicated screen adds navigation overhead — players must leave the debrief to see it
- Rich annotations require the counterfactual history (4.38) to detect "fixed" status
- The "fixed M32" inference may be wrong if the player modified the element for reasons unrelated to the career analysis result
- Risk of information overload for casual players

**Recommended use:** Late-game unlock, accessible from the Gauntlet hub as a persistent career overview. Not the first surface for the metric.

---

### Option C: The Structural Robustness Score (Normalized Single Number)

**What it is:** Instead of showing the raw coverage percentage, compute a normalized "Structural Robustness Score" (SRS) that inverts and scales the coverage percentage into a 0–100 score where higher is better.

```
SRS = 100 × (1 - coverage_percentage)

Coverage 61% → SRS 39  (Early game, centralized architecture)
Coverage 43% → SRS 57  (Improving)
Coverage 19% → SRS 81  (Mature architecture, well-distributed failures)
Coverage 8%  → SRS 92  (Exceptional robustness)
```

The SRS is displayed alongside win rate and eEDT on the player profile, as a third primary career stat.

**Strengths:**
- Higher-is-better framing eliminates the "lower is better" cognitive reversal
- Single number is easy to track and communicate ("my SRS is 81")
- Natural fit for community leaderboards and comparisons ("what's your SRS?")
- Creates a clear improvement direction: moving from SRS 39 to SRS 81 is obviously good

**Weaknesses:**
- Abstracts away the underlying coverage percentage — players may not understand what the SRS actually measures
- Loses the "which element caused this run?" context entirely
- Hides the regression alert (a player going from SRS 81 to SRS 74 may not realize RELAY returned)
- "Structural Robustness Score" is not intuitive vocabulary — "Robustness" is underspecified

**Design note:** This option trades clarity for accessibility. It may be useful as a surface-level summary while the full coverage trend lives behind it in a drill-down. But using it as the primary display risks players chasing the number without understanding architectural robustness.

**Not recommended as primary display.** Consider as a summary stat in the profile card, with the trend sparkline available on click.

---

### Option D: The Failure Concentration Ratio (HHI-Adjacent Debt Metric)

**What it is:** Instead of just the top-candidate coverage, compute a **failure concentration ratio** that captures the distribution of coverage across the entire runner-up list — similar to the Herfindahl-Hirschman Index (HHI) in economics, which measures market concentration.

```
Failure Concentration Ratio = Σ (coverage_i²) for top-5 candidates

Concentrated architecture:
  #1: 61%, #2: 30%, #3: 20%, #4: 15%, #5: 12%
  FCR = 0.61² + 0.30² + 0.20² + 0.15² + 0.12² = 0.37 + 0.09 + 0.04 + 0.02 + 0.01 = 0.53

Distributed architecture:
  #1: 22%, #2: 17%, #3: 13%, #4: 13%, #5: 11%
  FCR = 0.22² + 0.17² + 0.13² + 0.13² + 0.11² = 0.05 + 0.03 + 0.02 + 0.02 + 0.01 = 0.13
```

A concentrated architecture has FCR close to 1.0 (maximum: a single element responsible for 100% of losses = FCR 1.0). A distributed architecture has FCR close to 0.0 (maximum distribution: five equal elements at 20% each = FCR 0.20).

**What this adds over top-candidate coverage alone:**
Top-candidate coverage misses "cluster debt" — an architecture where the top element is 22% (seems fine) but elements 2–4 are all 20% (each is a critical weakness). The FCR catches this: 22²+20²+20²+20² = 0.05+0.04+0.04+0.04 = 0.17. Versus an architecture where element 1 is 22% and elements 2–4 are each 5%: 22²+5²+5²+5² = 0.05+0.003+0.003+0.003 = 0.059. The FCR distinguishes "spread across multiple near-equal weaknesses" from "one leader, everything else negligible."

**Strengths:**
- Richer signal than top-coverage alone — detects multi-cluster debt
- Maps to a real concept (HHI) that engineers and economists recognize
- The FCR trend is a strict improvement over the coverage trend for advanced players

**Weaknesses:**
- Significantly harder to explain than coverage percentage
- Players without statistics background may find FCR opaque
- Requires computing runner-up coverage scores, not just top-1
- Two metrics (top-1 coverage + FCR) may be redundant for most players

**Recommended use:** Late-game unlock, available as an advanced view in the Season Health Dashboard (Option B) rather than as a primary metric. The tooltip when hovering FCR: "Measures how clustered your architecture's weaknesses are. Lower = more distributed failures, harder for opponents to predict. Based on coverage distribution across top 5 candidates."

---

### Option E: The Regression Alert (Event-Triggered Notification)

**What it is:** Rather than a continuous sparkline, the primary user-facing surface for the coverage trend is a notification system: the game actively alerts the player when a new career analysis shows coverage *higher* than the previous run.

```
STRUCTURAL REGRESSION DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run 5 (M165): 19% coverage
Run 6 (M200): 26% coverage  (+7pp)

This may indicate a recent config change re-introduced a
centralized structural weakness. RELAY context buffer
(your Run 1 top candidate) appears again as Run 6's
top candidate.

[VIEW COVERAGE HISTORY]  [REVIEW CONFIG CHANGES M165–M200]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**The regression alert is triggered by:**
1. New career analysis coverage > previous career analysis coverage by 5+ percentage points (absolute)
2. Or: top-candidate element in new run matches a previously-flagged element from a prior run (recurrence detection)

**Strengths:**
- Removes the need for active monitoring — the game reaches out when something goes wrong
- The "recurrence detection" (same element returning) is a high-signal alert that doesn't appear in any other metric
- Actionable format: the "REVIEW CONFIG CHANGES" button links directly to the diff between config versions M165 and M200 (requires counterfactual history, 4.38)

**Weaknesses:**
- Reactive rather than proactive — doesn't build the habit of checking coverage trajectory
- Alerts can desensitize players if they fire too frequently
- "5pp regression" threshold requires calibration — some volatility in coverage is expected

**Recommended use:** The regression alert is the *event layer* on top of the sparkline or dashboard. Players who watch the sparkline see the same information continuously; players who don't watch get the alert when it matters. Option A (sparkline) + Option E (alert) are natural partners.

---

## Recommended Design: Layered Implementation

**Phase 1 — The Embedded Sparkline (Option A):**
After a player's 2nd career analysis, a 3-bar sparkline appears in the Career Analysis result panel immediately below the top-candidate card. After the 3rd run, the sparkline moves to a permanent position in the Gauntlet hub dashboard. The sparkline unlocks the concept: "coverage is tracked over time."

**Phase 2 — The Season Health Dashboard (Option B):**
After the 4th career analysis, the Gauntlet hub gains a "Architectural Health" tab showing the full coverage history with element annotations, regression flags, and the FCR for advanced players.

**Phase 3 — The Regression Alert (Option E, persistent):**
From the 3rd career analysis onward, coverage regressions (5pp+) trigger a notification. The alert links to the dashboard and the relevant config diff.

**Phase 4 — The Debt-Free Achievement (4.72):**
A coverage score below 20% for three consecutive career analyses unlocks a community-visible "structurally distributed" badge — the highest architectural health certificate.

---

## Player Journeys

### Journey: Keiko, 31, Software Engineer, 200 Gauntlet Matches, Commander-Tier

**Context:** Keiko is the player we met in the career minimum fix (4.59) journey. She has been manually tracking her coverage scores in an external notebook — Season 1: 61%, Season 2: 57%, Season 3: 43%. She's the archetype of an advanced diagnostic player. Today she runs her 6th career analysis and discovers the game has now started tracking this automatically.

**Minute 0:00 — The Familiar Ritual**

Keiko opens the Debrief hub after Match 200. She has 28 matches since her last career analysis. She navigates to the Career Analysis button without hesitation and clicks it. This is a quarterly ritual for her — like a code coverage report at the end of a sprint.

The computation runs for 5 minutes. She watches the live feed. The frontrunner stabilizes at "RELAY context buffer +1 slot — 26% (7/27 matches)." She writes it in her notebook.

Then she notices something new in the Career Analysis panel below the result: a section she hasn't seen before. Three small vertical bars, labeled "Coverage Trend."

```
COVERAGE TREND (6 runs):
█████░ 61%
████░░ 43%
███░░░ 38%
██░░░░ 32%
█░░░░░ 19%
██░░░░ 26%  ← today
```

She stares at this. The game has been recording her coverage scores. She has been manually tracking this — she pulls out her notebook to verify. The numbers match exactly.

**Minute 1:00 — The Annotation Layer**

She hovers over the 26% bar. A tooltip expands:

```
Run 6 — Match 200
Top candidate: RELAY context buffer  26%
⚠ REGRESSION: coverage increased vs. Run 5 (19%)
⚠ RECURRENCE: RELAY context buffer was flagged in Run 1 (61%)
     Config versions changed since Run 5: v7.2 → v8.0
     Major changes: relay chain rebuild (Mission 178)
```

She closes her notebook. She doesn't need it anymore.

The recurrence alert is the moment that matters. She remembers fixing the relay buffer in Season 1 — adding one slot, an obvious fix. Since then, she rebuilt her entire relay chain for Season 3's meta (mission 178). The rebuild inadvertently re-tightened the relay buffer because she started from a template rather than her Season 2 config.

She opens the "Review Config Changes" link: it shows the diff between v7.2 (Run 5) and v8.0 (Run 6), highlighting the relay chain section. The RELAY context buffer decreased from 5 (her Season 1 fix) back to 4 during the rebuild.

**Minute 3:00 — The Diagnosis**

Keiko feels a specific kind of chagrin: not at the game, at herself. She knows the pattern. She fixed this. She built from a template that didn't include the fix. The coverage trend caught something she would have caught manually — but not for another 20 matches, when she'd be confused about why the relay buffer kept appearing.

She opens the config and increases RELAY context buffer from 4 to 5. She also writes in her notebook: "Template problem. Season 3 relay template is missing Season 1 buffer fix. Update template."

**Minute 5:00 — The Retroactive Validation**

Keiko looks at the full sparkline and feels something she doesn't usually feel in strategy games: *longitudinal satisfaction.*

The bars tell a career story. 61% in Season 1 — when she was building haphazardly and everything broke for the same reason every time. Declining to 43%, 38%, 32%, 19% as she learned to architect for robustness. Then 26% today — a setback from a careless rebuild, immediately visible.

She realizes: this sparkline is what she's been manually computing for 18 months. And the game can see things she can't: the recurrence detection, the config version diff, the match-range annotation. The game's version is strictly better than her notebook.

She cancels the notebook entry she was about to write. The game is the notebook now.

**What she wants to do next:** Run a career analysis in 25 matches to confirm the relay buffer fix restored coverage to sub-20%.

**UI Annotations:**
- Coverage trend sparkline: 6 vertical bars in the Career Analysis result panel, positioned below the top-candidate card; bar height proportional to coverage %; color: red (>50%), amber (30–50%), teal (15–30%), green (<15%); most-recent bar on right, labeled "today"; thin dashed teal line at 20% as debt-free reference
- Hover tooltip: 200px card, 150ms hover delay; shows run number, match number, top-candidate element, coverage %, and any active flags (regression, recurrence); regression flag in amber ("⚠ REGRESSION"); recurrence flag in amber with link to Run 1 result
- "Review Config Changes" link: in the tooltip, below the recurrence flag; links to config diff view (requires counterfactual history, 4.38); diff view highlights the changed element with its coverage score
- Bar count: sparkline always shows the last 8 runs maximum (older runs viewable by clicking "View full history →" which opens the Season Health Dashboard)

---

### Journey: Dmitri, 38, Tech Lead, 130 Gauntlet Matches, Mid-Tier Competitive

**Context:** Dmitri has been in the Gauntlet for 4 months. Win rate: 55%. He has run 4 career analyses. He's never thought about coverage trend — he uses career analysis as a "what should I fix next?" tool, not as a historical record. Today, he runs his 5th career analysis and sees something alarming.

**Minute 0:00 — The Normal Debrief**

Dmitri finishes a match (loss, 34–71 EDT). He's been losing more than usual this week. He opens the debrief and navigates to the career analysis. He queues it, goes to make coffee.

5 minutes later, the result appears. He returns:

```
CAREER MINIMUM FIX
━━━━━━━━━━━━━━━━
COMMAND — signal priority queue: promote SCOUT entries
Coverage: 11/22 matches improved (50%)

Runners-up:
  RELAY — context buffer: +1 slot   (7/22)
  SCOUT — hook threshold: –2        (6/22)
━━━━━━━━━━━━━━━━
```

50% coverage. He's seen coverage scores before — his previous four analyses were 41%, 37%, 29%, and 23%. This is significantly higher.

The sparkline below the result card shows:

```
COVERAGE TREND (5 runs):
████░░ 41%
████░░ 37%
███░░░ 29%
██░░░░ 23%
█████░ 50%  ← today  ⚠
```

The amber "⚠" beside the today bar is new. He hovers it.

```
⚠ COVERAGE SPIKE DETECTED
Run 5 coverage (50%) is significantly higher than Run 4 (23%).
This is not typical improvement variance.
Possible causes:
  — Recent config change introduced centralized weakness
  — Meta shift exposing existing vulnerability
  — Sample composition changed (different opponent archetypes)
Review config changes since Run 4 (Match 105):
  v5.3 → v6.1 — major rework of COMMAND signal routing
```

**Minute 1:00 — The Reckoning**

Dmitri sits down. He ran the COMMAND signal routing rework at Match 110 after a competitive streamer posted a guide on "prioritized signal routing" — he applied the technique without fully understanding it. He thought it was an improvement.

He clicks "Review config changes." The diff shows the COMMAND agent's priority queue rules were replaced wholesale with the streamer's template. The template was designed for a different meta — one where COMMAND needed to prioritize strike signals over reconnaissance. Dmitri's config was designed to prioritize reconnaissance. He had replaced his custom priority logic with someone else's.

The coverage spike is the game telling him: *the import broke something.* 11 of his last 22 matches are traceable to a single mismatch he introduced when he copy-pasted an untested config component.

**Minute 3:00 — The Fix**

Dmitri reverts the COMMAND priority queue to v5.3 (his pre-import version). He applies the career minimum fix suggestion: promoting SCOUT entries relative to STRIKER entries in the priority order — not the streamer's template, but a targeted adjustment to his existing design.

He queues a match. Wins, 67–33 EDT. The priority queue is routing SCOUT signals correctly again.

**Minute 5:00 — The Lesson**

After the match, Dmitri thinks about what happened. He adopted an imported config component without understanding it. The coverage spike is the diagnostic artifact that proves the import was harmful — not a vague "feel like my win rate dropped" signal, but a concrete 50% vs. 23% coverage jump with a direct link to the config diff.

He makes a note to himself: before applying imported config components, run a career analysis first to get a baseline. After applying, run again after 20 matches. The coverage trend is the before/after measurement.

**What he wants to do next:** Run another career analysis after 20 matches with the reverted config to confirm coverage drops back toward 23%.

**UI Annotations:**
- Coverage spike visual treatment: the anomalous bar in the sparkline renders taller AND in red, even if the absolute coverage (50%) would normally be amber; it's always the outlier, not just the absolute value, that triggers the red treatment
- "⚠ COVERAGE SPIKE DETECTED" notification card: appears automatically after a run with coverage 15+pp above the previous run; amber border, white background, slightly wider than the standard sparkline tooltip; includes three "possible causes" in plain language; "Review config changes since Run N" is a deep link into the counterfactual history diff viewer
- The diff viewer, when opened from a coverage spike alert, opens pre-filtered to show only changes relevant to the top-candidate element — not the full config diff; the player can expand to "show all changes" if they want the broader context

---

### Journey: Yuki, 31, Analytical Player, 75 Gauntlet Matches, First Career Analysis Loop

**Context:** Yuki came to the Gauntlet from competitive chess and StarCraft. She ran her first career analysis after Match 30 (coverage: 57%). She ran her second after Match 55 (coverage: 41%). She is now starting her third career analysis after Match 75, and she is already thinking about the trend.

**Minute 0:00 — The Anticipation**

Yuki opens the debrief hub. She navigates to the career analysis button with a specific question in her mind: "Did my relay rework improve the structural distribution?"

After Match 55's career analysis (41% coverage, RELAY as top candidate), she applied the suggested fix (relay context buffer +1 slot) and then spent three sessions rewriting the relay's fallback path. She wanted to understand whether the relay buffer was the cause or a symptom of something deeper in her relay architecture.

She clicks Career Analysis.

**Minute 5:00 — The Third Bar**

The result appears:

```
CAREER MINIMUM FIX
━━━━━━━━━━━━━━━━
SCOUT — attention filter: narrow to 3 types (was 5)
Coverage: 7/20 matches improved (35%)

Runners-up:
  COMMAND — signal threshold: +1    (5/20)
  RELAY — fallback path: +1 branch  (4/20)
━━━━━━━━━━━━━━━━
```

35% coverage. Her sparkline:

```
COVERAGE TREND (3 runs):
█████░ 57%
████░░ 41%
███░░░ 35%  ← today
```

Three bars. Each shorter than the last. The trend is clearly downward.

**Minute 0:30 — The Reading**

Yuki reads the runner-up list carefully. RELAY appears as #3 — not #1. Her relay rework succeeded: the relay is no longer the dominant failure point. But the scout is.

She thinks about this with the analytical mind she brought from chess. In chess, when you fix a positional weakness, a new weakness often becomes the focus — because the first weakness was masking the second. The game is the same: she fixed the relay, and the scout's filter problem, which was always there but previously smaller than the relay problem, is now visible.

The sparkline shows her coverage declining. But the *composition* of the coverage is changing: relay → scout. She is rotating through her architecture's weak points, each one newly exposed as she resolves the previous.

**Minute 2:00 — The Naming**

Yuki opens her config notebook (an external document). She writes:

"Coverage trend after 3 career analyses: 57% → 41% → 35%. Pattern: each run surfaces a different top candidate (Relay × 2, Scout × 1). The relay appeared in runs 1 and 2; after fixing it, Scout leads run 3. This is 'the peeling onion structure' — each fix exposes the next layer. Predicted: after fixing the scout attention filter, COMMAND will lead run 4."

She's identified a concept she will later recognize in software engineering as "sequential bottleneck elimination" — each iteration removes the current bottleneck to expose the next. Eliyahu Goldratt's Theory of Constraints, unknown to her, is what she's describing.

**Minute 3:00 — The Goal**

Yuki sets herself a goal: below 20% by Run 6. She calculates: if the trend continues at –6pp per run (57 → 41 → 35), she'll hit 20% around Run 7. If she runs career analyses every 20 matches, that's 140 total matches.

She decides to accelerate: she'll try to drop 10pp per run instead of 6pp by doing more deliberate architectural refactoring rather than just applying the minimum suggested fix. She'll redesign the agent implicated in each run, not just increment a single parameter.

**Minute 4:00 — The Sparkline as Feedback Device**

Yuki realizes the sparkline is the only feedback mechanism that tells her whether her approach is working at the architectural level. Win rate is noisy — it depends on matchmaking, on opponent configuration, on randomness. EDT trajectory shows whether she's building contestable mid-game, which is valuable but not about structural robustness. The pre-ranking accuracy stat shows whether the diagnostic tooling understands her config — useful, but indirect.

The coverage trend is direct: it measures whether her failures are becoming more distributed. That is the thing she is actually trying to achieve. She is building an architecture with no single point of failure, and the coverage trend is the instrument that measures it.

**What she wants to do next:** Run a fourth career analysis after Match 95. Her prediction: COMMAND as top candidate, coverage below 30%. If the sparkline shows this, her peeling-onion model is correct.

**UI Annotations:**
- Third-run annotation: when the sparkline has exactly 3 bars, a faint text label below the bars says "trend detected"; before 3 bars, no trend language appears (2 runs = a single comparison, not a trend)
- Plain-language coaching footnote: below the 3-bar sparkline on first appearance: *"Coverage declining — your architecture is distributing its failure modes. Continued improvement means no single weakness dominates."* Appears once, then disappears on next session (not repeated every session — would become patronizing)
- "Goal-setting" interaction (late-game): clicking the dashed 20% reference line opens a small overlay: "Set coverage goal: below 20% by Run N." Player enters N. On subsequent career analyses, the sparkline shows a subtle goal-line animation if they're on track. Optional, dismissible.

---

## Strengths

**Detects long-arc architectural regression that moment-to-moment metrics miss.** A player who imports a foreign config component may see their win rate fluctuate for 20 matches — ambiguous signal. The coverage trend after a single career analysis shows the regression immediately and clearly. The spike is unambiguous.

**Rewards deliberate diagnostic practice.** The coverage trend only accumulates data when the player intentionally runs career analyses. Players who never diagnose architecturally never see this metric. Players who diagnose regularly get a progressively richer picture of their improvement. This creates a virtuous loop: diagnosis → trend → insight → diagnosis.

**The recurrence detection is a unique signal.** No other metric in the game can detect "you fixed this in Season 1 and it came back." Recurrence detection catches the specific failure mode of template-based rebuilds — where players start fresh but inherit old weaknesses from imported components without realizing it.

**Provides a named endpoint.** "Below 20% coverage" is a concrete architectural goal. Players who reach it can claim the "debt-free" achievement (4.72). Unlike EDT trajectory (which has no natural ceiling) or win rate (which plateaus against matched opponents), the coverage trend has a meaningful milestone: truly distributed failure modes.

**The coverage trend is the right signal for community posting.** A sparkline showing 61% → 43% → 38% → 32% → 19% tells a career story in five numbers. Players posting config necropsies (7.10) will embed their coverage sparklines as the headline of "how my architecture changed." The visual shape of a declining trend is the clearest narrative artifact the game produces.

**Maps cleanly to professional software practices.** "What percentage of your incidents are caused by one component?" is a real engineering health question. Organizations with well-designed systems have distributed incident causes. Organizations with brittle systems have one component that causes 60% of outages. The coverage trend teaches this structural principle implicitly — and the vocabulary ("coverage percentage," "structural debt," "distributed failure modes") transfers directly to real-world engineering conversations.

---

## Weaknesses

**Slow-updating.** A meaningful 5-run coverage history requires 100–150 matches of play and deliberate career analysis usage. Players in their first 50 matches will see a 2-bar sparkline that tells them almost nothing. The metric requires patience that some players may not have.

**Coverage percentage conflates architecture quality with opponent pool.** A coverage spike might indicate a config regression (internal cause) or a meta shift (external cause). If opponents start running more of one type of config, the coverage of the element that counters that config type might artificially spike. The game's "possible causes" tooltip acknowledges this, but the player must interpret which cause applies.

**The "improving coverage" signal has a ceiling artifact.** When coverage drops below 20%, further improvement becomes both harder to achieve and harder to measure meaningfully. The difference between 8% and 4% coverage is theoretically meaningful (half the concentration) but practically invisible in a career analysis with 20 matches analyzed. At low coverage levels, confidence intervals dominate the signal.

**The recurrence detection requires counterfactual history.** Detecting "RELAY context buffer appeared in Run 1 and Run 6" requires the game to maintain a persistent record of career analysis results across sessions. If this data is not stored client-side (a web-based constraint), recurrence detection fails silently. The feature degrades gracefully (recurrence is just not flagged) but loses its most distinctive capability.

**Regressions feel bad in a way that might be disproportionate.** Seeing the sparkline bar rise — especially with a red color — is viscerally unpleasant in a way that may make players reluctant to run career analyses. If the player suspects they've had a coverage regression, they might avoid running the analysis to avoid the bad feeling. This is the medical-appointment avoidance problem: the diagnostic reveals bad news, so the patient delays the diagnostic. Mitigations: frame regressions as "this is why you run the analysis — to catch these early," and make the notification warm (amber, not red).

---

## Interaction Effects

**With 4.59 (Career Minimum Fix):**
The coverage trend is built entirely from career analysis results. Every career analysis produces one data point for the trend. They are inseparable. The coverage trend is the career analysis seen at a higher time scale.

**With 4.38 (Counterfactual History):**
Recurrence detection (the most valuable aspect of the coverage trend) requires a persistent record of career analysis results: which element was the top candidate for each run, the coverage percentage, and the match window. Counterfactual history provides the infrastructure for this. Without counterfactual history, the coverage trend shows only coverage percentages — not which elements they correspond to.

**With 4.25 (EDT Trajectory):**
EDT trajectory and coverage trend are both long-arc career metrics, but they measure different things. EDT trajectory measures *when* matches are decided (architectural completeness). Coverage trend measures *how concentrated* the failure modes are (architectural robustness). A player can have a rising EDT trajectory (developing a midgame) while coverage stagnates (the midgame is still reliant on one critical component). A player can have improving coverage trend (distributed failures) while EDT is low (fast-deciding matches that just happen to fail for diverse reasons). The two metrics together are more informative than either alone.

**With 4.69 (Agent Multi-Cluster Detection):**
Multi-cluster detection flags when the same *agent* appears across 3+ runner-up slots in a single career analysis. The coverage trend flags when the same *element* recurs across career analyses. These are complementary: multi-cluster is a within-run signal (one analysis shows RELAY-C in positions #2, #4, #7 — agent needs holistic redesign). Coverage recurrence is an across-run signal (RELAY-C appeared as top candidate in Runs 1 and 6 — something keeps reintroducing this weakness). Together they create a two-timescale view of architectural debt: within-run and across-run.

**With 4.70 (Career Analysis Filtered by Opponent Archetype):**
Coverage trend with archetype filtering would be a "coverage trend against heavy-hook opponents" vs. "coverage trend against rush opponents." These sub-trends could reveal that the architecture is robust against one class of opponent but not another. The filtered coverage trend is a natural extension: instead of one sparkline, three archetype-segmented sparklines. Available as a deep-analysis view after unlocking the archetype filter.

**With 4.72 (Debt-Free Season Achievement):**
The coverage trend is the measurement instrument for the debt-free achievement. An achievement that requires coverage below 20% for three consecutive runs is only trackable via the coverage trend. The achievement is the narrative endpoint that the trend is building toward.

**With 7.10 (Config Necropsy Culture):**
Config necropsies are player-created retrospectives of their config's evolution. The coverage sparkline is the most concise way to represent architectural robustness improvement in a necropsy. Community norms will emerge around embedding sparklines in necropsies: "show your coverage trend as the headline stat." The sparkline becomes the canonical config biography artifact.

**With 8.08 (Real-Language Vocabulary Claim):**
"Structural robustness" and "distributed failure modes" are real software engineering concepts. The coverage trend teaches these concepts without naming them explicitly — players learn by watching their coverage decline as they build more robust architectures. The vocabulary claim: a player who achieves consistent coverage below 20% has internalized the concept of "no single component owns the failure distribution." This transfers directly to how engineers think about system design.

**With the Debate (4.60 Search Budget vs. 4.76 Voluntary Budget Cap):**
The coverage trend creates an implicit argument for running career analyses regularly, even for players who are budget-constrained. If coverage is visibly declining (trend is improving), a player might argue they don't need to spend budget on career analyses — they're improving. If coverage is stagnating or rising, the budget cost is justified. The trend mediates the "is it worth running the expensive analysis?" decision.

---

## Comparable Games and Media

**Code coverage trends in software engineering CI/CD:**
Engineering teams track not just "what is our test coverage today?" but "is coverage trending up or down over the last N commits?" A codebase whose test coverage has been declining for 6 sprints is accumulating technical debt that will manifest as unexpected outages. Robot Uprising's coverage trend is the same concept: the direction of the trend, not the absolute value, is the signal. The "coverage trend" label in the game is a direct vocabulary transplant from this domain.

**Herfindahl-Hirschman Index (antitrust economics):**
The HHI is used by regulators to measure market concentration — how much of a market is controlled by a few large players. A high HHI means one company dominates; a low HHI means the market is competitive and distributed. Robot Uprising's coverage trend (and the FCR variant in Option D) is conceptually an HHI for failure causes: "how concentrated are my architecture's failure modes?" The analogy is precise. Players who encounter HHI concepts later in economics classes or antitrust law will recognize the underlying measurement principle.

**Factorio train network bottleneck analysis:**
Experienced Factorio players track their train network's bottleneck structure over time: "in my current factory, what percentage of train delays are caused by one intersection?" A mature factory has distributed delays — no single intersection causes 60% of delays. An immature factory has one critical junction that slows everything. Players redesign their networks to eliminate the bottleneck, which exposes the next one. This is the exact "peeling onion" pattern Yuki identified: each bottleneck elimination reveals the next. The coverage trend is Robot Uprising's version of the Factorio network health metric.

**Incident distribution analysis in site reliability engineering:**
SRE teams track "what percentage of our incidents are caused by one service?" A well-designed system has distributed incident causes — no single component is the source of 60% of outages. A poorly designed system has one critical single point of failure. Coverage trend teaches the same principle: engineering for distributed failure modes is the goal, and the metric makes progress visible. Players who later encounter SRE practices will recognize "error budget by service" as a close analogue.

**Portfolio concentration risk in finance:**
A financial portfolio where 60% of value is in one stock is "concentrated" — high risk if that stock fails. A diversified portfolio has low concentration: no single asset represents more than 5–10% of the total. The coverage trend is a risk concentration metric for architectures. The "debt-free" threshold (20% coverage) is analogous to a financial advisor's rule: "no single position should be more than 20% of your portfolio." The vocabulary of diversification maps cleanly to the vocabulary of distributed failure modes.

**StarCraft II strategic vulnerability analysis (high-level):**
Professional SC2 analysts discuss "structural vulnerabilities" in a player's build order — decisions that, if exploited, will cause cascade failures. A build order with many independent development paths has low structural vulnerability. A build order dependent on a single critical timing (win by 8:00 or lose) has high structural vulnerability. The coverage trend measures the equivalent: an architecture with one critical component has a "concentrated" vulnerability that skilled opponents can exploit systematically.

**Sprint retrospectives in agile engineering:**
Agile teams run retrospectives after each sprint: "what went wrong this sprint, and how does that compare to last sprint?" A retrospective culture that tracks which categories of failure recur across sprints (same team dependency blocking us for the 3rd sprint in a row) is doing coverage trend analysis manually. Robot Uprising formalizes this: the career analysis is the retrospective, the coverage trend is the pattern-across-retrospectives metric. Players who later practice agile retrospectives will find the structure familiar.

---

## Sensory Description

**The coverage sparkline at rest:**

Five or six vertical bars live quietly below the top-candidate card in the Career Analysis result panel. They are unobtrusive — 8px wide each, 64px tall maximum, spaced 4px apart. The tallest bar (earliest or highest coverage run) sets the scale. Each bar is solid from the bottom, dark above the fill level.

Color per bar:
- Red, #C84040 (deep, not aggressive): coverage > 50%
- Amber, #D4830A: coverage 30–50%
- Teal, #3D9DA4: coverage 15–30%
- Soft green, #5AAA70: coverage < 15%

A dashed horizontal line at the 20% level — thin, teal, just 1px — marks the "debt-free zone." Above it: improvement is still available. Below it: architectural robustness achieved.

The sparkline does not animate unless there is something to say. No idle pulse. No ambient glow. It is a record, not a signal.

**When a new bar is added:**

The new bar materializes from the bottom of its column, growing upward over 600ms with an ease-out curve. If the bar is shorter than the previous (improvement), it settles into its height with a brief, barely-audible ascending tone — the same tonal register as the EDT gold diamond chime, but at half the volume, half the duration. A structural improvement deserves acknowledgment, not celebration.

If the bar is taller than the previous (regression), it grows to its height and then, at the moment it settles, emits a very short descending note — lower pitch, not alarming, like a single low piano key. Not punitive. Just: *something changed, and it's worth noticing.*

**The regression alert overlay:**

When a coverage spike is detected (+15pp+), an amber card overlays the sparkline for 3 seconds before settling into a dismiss-able state. The amber is warm — not emergency-red. The animation: the card slides in from the right edge of the result panel, decelerating to a stop with a 3px overshoot and settle. The card sits at 40% opacity until the player hovers it, at which point it brightens to 100%. It can be dismissed by clicking anywhere outside it or pressing Escape.

The card never auto-dismisses. It stays visible until the player intentionally closes it. The coverage spike is not noise; it earns persistence.

**The recurrence annotation:**

When an element in Run N matches an element from a prior run, the sparkline tooltip for Run N shows a thin amber line connecting it to the prior run bar (visible inside the tooltip as a pair of linked dots with a curved connector). The connector pulses amber once on tooltip open, then holds steady. It reads: *this run is not independent of that run. Something echoes.*

**The multi-run dashboard (Season Health Dashboard):**

The season health dashboard has a dark background — not midnight black, but dark warm grey, like a well-worn whiteboard. The coverage chart is plotted on it in light strokes: thin connecting lines between run dots, each dot sized to its coverage percentage (larger = higher coverage). The RELAY recurrence appears as a subtle double-ring on the dot: a thin outer ring matching the run's bar color, a white inner ring, indicating an element that appeared in multiple runs.

On first encountering the dashboard, the camera pans slowly left-to-right across the full history before settling. Not dramatic — just a slow orientation, giving the player time to read it before interacting. Like unrolling a scroll.

---

## The TikTok Clip

The player opens their career analysis panel. The sparkline is visible: 6 bars, the first tall and red (61%), each successive bar shorter, until the last — today's run — in soft green, just barely above the 20% dashed line. 19%.

They hover over the last bar. The tooltip says: "COMMAND — priority queue. 19% coverage. 4/21 matches."

The player says: "Four matches. Before, it was sixty-one." The camera zooms slowly onto the sparkline. The red bar on the left. The green bar on the right. The dashed line at 20%.

"One year of fixing things. This is what it looks like."

Cut.

---

## Discovered New Aspects

1. **4.112 — Coverage percentile vs. community distribution**: after 3+ career analyses, showing the player where their coverage trend sits relative to all players at similar match counts — "your current coverage (19%) is in the top 15% of Gauntlet players at 200 matches"; the community distribution makes the absolute coverage number meaningful and motivating

2. **4.113 — Failure Concentration Ratio as advanced coverage metric**: the HHI-adjacent multi-candidate coverage distribution metric (Option D in this file); sum of squared coverage percentages across top-5 candidates; distinguishes "one dominant weakness" from "several near-equal weaknesses"; unlockable after 5 career analyses

3. **4.114 — Coverage recurrence map**: a visualization showing which config elements have recurred across career analysis runs — not just the most recent recurrence, but all elements that have appeared in multiple runs across the player's entire history; a "structural debt ledger" showing which parts of the architecture keep breaking

4. **4.115 — Opponent coverage as adversarial intelligence**: after a Gauntlet match, an optional "Opponent Coverage Estimate" panel showing the likely structural concentration of the opponent's config based on their observable behavior — high concentration = one exploitable weakness; available to players who have unlocked career analysis; surface the concept of "my opponent also has a coverage score"

5. **4.116 — Coverage goal and countdown**: a player-settable "target coverage" (default: 20%) with a displayed "runs to target" estimate based on current improvement rate; creates a named goal for the coverage trend to work toward; the countdown should factor in the player's historical rate of improvement per run, not just the linear extrapolation

6. **4.117 — The "coverage floor" design question**: is there a theoretical minimum coverage achievable with any architecture? Does the game's scenario distribution guarantee that some single element will always account for at least X% of losses? The design question: if a perfectly distributed architecture is achievable, what does it look like? If not, what's the natural floor, and should the game tell players?
