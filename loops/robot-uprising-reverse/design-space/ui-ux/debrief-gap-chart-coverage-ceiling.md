# Gap Chart: Actual Coverage vs. Cluster Ceiling Over Time

**Aspect:** 4.69n — A dual-line chart on the season health dashboard showing the top-candidate coverage trend alongside the combined cluster coverage ceiling trend; the widening gap between the two lines is a visual representation of accumulating architectural debt; narrowing gap = successful incremental improvement; the chart answers "how much of my loss surface am I leaving on the table by patching symptoms instead of rethinking agents?"

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined agent coverage score display; 4.69d — Multi-cluster persistence tracking; 4.69g — Agent cluster career stats
**Related:** 4.68 — Coverage percentage as season health metric; 4.25 — EDT trajectory as career metric; 4.59 — Career minimum fix; 4.72 — Debt-free season achievement; 8.08 — Real-language vocabulary claim (architectural debt)

---

## The Core Problem

Two numbers already exist in the career analysis result panel: the **top-candidate coverage** (the percentage of losses attributable to the single best fix) and the **combined cluster coverage ceiling** (the percentage of losses that would be addressed if every element of a clustered agent were fixed simultaneously). Each number is computed per career analysis run, shown once, and then forgotten. The player sees "62% top-candidate, 71% cluster ceiling" and thinks "okay, 9 percentage points of extra upside if I do the full overhaul." Then they apply the top fix, move on, and never compare those two numbers to the same two numbers from their last career analysis run, or the one before that.

The problem is temporal blindness. A single snapshot of the gap between top-candidate coverage and cluster ceiling coverage tells you "there is some architectural debt." But it cannot tell you whether that debt is growing, shrinking, or holding steady. Only the *trend* of that gap across multiple career analysis runs reveals the trajectory of architectural health.

Consider a player who runs career analysis six times across a season:

```
Run 1:  Top = 62%  |  Ceiling = 71%  |  Gap = 9pp
Run 2:  Top = 43%  |  Ceiling = 58%  |  Gap = 15pp
Run 3:  Top = 38%  |  Ceiling = 56%  |  Gap = 18pp
Run 4:  Top = 32%  |  Ceiling = 54%  |  Gap = 22pp
Run 5:  Top = 21%  |  Ceiling = 48%  |  Gap = 27pp
Run 6:  Top = 26%  |  Ceiling = 51%  |  Gap = 25pp
```

Top-candidate coverage is declining beautifully — the player is distributing their failure surface, applying fixes, growing more robust. By the coverage trend metric alone (4.68), this player is improving. But the cluster ceiling is declining *more slowly*. The gap is widening from 9pp to 27pp. What this means: the player's incremental fixes are shaving the visible symptoms while the underlying agent architecture accumulates more stranded upside. Each fix addresses the loudest symptom. None of the fixes addresses the systemic problem. The structural debt is growing silently beneath the surface of an apparently healthy coverage trend.

Without the gap chart, this player has no tool that can show them the divergence. The coverage trend says "improving." The cluster ceiling trend says "not improving enough." Only the *gap between them* says "your improvement strategy is creating architectural debt."

---

## The Design

### The Dual-Line Chart

The gap chart is a time-series line chart displayed on the season health dashboard, positioned directly below the existing coverage trend sparkline (4.68). It shares the same horizontal axis: career analysis run number, chronologically ordered left to right. Two lines occupy the chart:

**Line 1 — Top-Candidate Coverage (the "Actual" line).** This is the same data point the coverage trend sparkline already shows: the percentage of analyzed matches improved by the single best fix candidate. Color: a muted steel blue, designated `#5B8DB8`. Weight: 2px solid.

**Line 2 — Combined Cluster Coverage Ceiling (the "Ceiling" line).** This is the combined coverage metric from 4.69b: the union-set percentage of matches that would be improved if every element of the detected cluster were fixed together. Color: a warm ochre, designated `#C4883A`. Weight: 2px solid, dashed pattern (4px dash, 3px gap).

**The Gap Fill.** The vertical space between the two lines is filled with a semi-transparent gradient. When the gap is narrow (< 8pp), the fill is a pale neutral grey at 10% opacity — nearly invisible, signaling health. As the gap widens beyond 8pp, the fill transitions toward a warm amber at 20% opacity. Beyond 20pp, it becomes a muted rust-red at 30% opacity. The fill never screams; it murmurs. The color shift is perceptual — players notice it subconsciously before they read the numbers.

**The Gap Annotation.** At the rightmost data point (the most recent career analysis run), a small annotation label sits in the gap between the two lines:

```
         Ceiling: 51%
    ┌──────────────────────────────
    │  ░░░░░░░░░░░░░░ 25pp gap ░░░
    └──────────────────────────────
         Actual: 26%
```

The label shows the current gap in percentage points, right-aligned, in a condensed monospaced font at 11px. If the gap has widened since the previous run, a small `+2pp` delta appears beneath in red-amber. If the gap narrowed, the delta appears in soft green. If unchanged, no delta.

### Data Requirements

The chart requires storing two values per career analysis run:
1. Top-candidate coverage percentage (already stored for the coverage trend sparkline, 4.68)
2. Combined cluster coverage ceiling (from 4.69b)

**Runs without a cluster detection.** Not every career analysis run will produce a multi-cluster flag. If no cluster is detected, the cluster ceiling is undefined. Design options:

- **Option A — Collapse ceiling to top-candidate.** If no cluster exists, treat the ceiling as equal to the top-candidate coverage (gap = 0pp). This creates a visual where the lines converge during cluster-free periods and diverge during clustered periods. Pros: the chart always has two lines, the visual language is consistent, and convergence is visually rewarding. Cons: a gap of 0 doesn't actually mean "no architectural debt" — it means "no multi-cluster was detected this run," which is a different claim.

- **Option B — Break the ceiling line.** If no cluster is detected, the ceiling line shows a gap in the series (dotted grey placeholder, no data point). The chart becomes sparse during cluster-free periods, with the gap fill disappearing. Pros: honest about what the data does and does not show. Cons: visually inconsistent, harder to read trends.

**Recommended: Option A with a visual distinction.** The ceiling line collapses to the actual line during cluster-free runs, but the data point on the ceiling line uses an open circle (hollow dot) instead of a filled dot — signaling "this is an imputed value, not a measured cluster ceiling." The gap fill disappears to zero. Players learn: solid dot on the ceiling line = real cluster detected. Open dot = no cluster, ceiling defaulted to actual.

### Minimum Data for Chart Display

The chart requires at least 3 career analysis runs with at least 1 cluster detection among them. Before this threshold, the chart area shows a grey placeholder:

```
┌──────────────────────────────────────────────┐
│                                              │
│   Gap chart available after 3 career         │
│   analysis runs (with cluster detection)     │
│                                              │
│   Runs completed: 1 of 3                     │
└──────────────────────────────────────────────┘
```

### Hover and Drill-Down

Hovering over any data point on either line shows a tooltip with the full career analysis summary for that run:

```
┌──────────────────────────────────────────┐
│ Run 4 — Season 2, Match 130              │
│ Top candidate: RELAY-C fallback filter   │
│ Coverage: 32% (7/22 matches)             │
│                                          │
│ Cluster: RELAY-C (3 elements)            │
│ Ceiling: 54% (12/22 matches)             │
│ Gap: 22pp                                │
│                                          │
│ Gap trend: ↑ widening (+4pp from Run 3)  │
│ [View Full Career Analysis →]            │
└──────────────────────────────────────────┘
```

Clicking the tooltip opens the full career analysis result panel for that historical run — the same panel the player saw when they ran it originally, preserved as a read-only snapshot.

### The Gap Trend Label

Below the chart, a single-line trend summary is displayed:

```
Gap trend (6 runs): widening — 9pp → 25pp (+16pp cumulative)
```

or

```
Gap trend (8 runs): narrowing — 27pp → 12pp (-15pp cumulative)
```

or

```
Gap trend (4 runs): stable — 14pp ± 3pp
```

The trend is computed by linear regression across all data points. "Widening" if slope > +1pp per run. "Narrowing" if slope < -1pp per run. "Stable" if slope is between -1pp and +1pp. The threshold is deliberately generous — a slope of +0.8pp per run is called "stable" even though it is technically increasing, because per-run noise at that magnitude is not architecturally significant.

---

## Player Journeys

### Journey 1: Kira, Rank 280, Season 4, 8 career analysis runs

**MINUTE 0:00** — Kira opens the season health dashboard after her latest career analysis. The coverage trend sparkline shows a satisfying downward slope: 58% in Run 1 to 24% in Run 8. She's been applying top-fix candidates diligently for months. Below the sparkline, she notices the gap chart for the first time — it was greyed out until she had enough runs with cluster detections.

**MINUTE 0:15** — The gap chart shows two lines. The steel-blue actual line descends cleanly from upper-left to lower-right, matching the sparkline above. But the ochre dashed ceiling line is descending *much less steeply*. The gap fill between them has shifted from a barely visible grey in Run 1 to a visible amber-rust in Run 8. The annotation reads: `22pp gap (+3pp from Run 7)`.

**MINUTE 0:30** — Kira hovers over the gap annotation. She reads the trend label: `Gap trend (8 runs): widening — 6pp to 22pp (+16pp cumulative)`. She frowns. Her coverage is improving. Why is the gap growing?

**MINUTE 0:45** — She hovers over Run 8's ceiling data point. The tooltip shows: `Cluster: RELAY-C (4 elements) — Ceiling: 46%`. She hovers over Run 1: `Cluster: RELAY-C (2 elements) — Ceiling: 64%`. RELAY-C had 2 clustered elements in Run 1 and now has 4. The cluster is *growing*. Each time she fixes the top RELAY-C element, a new RELAY-C element surfaces in the candidate list. She is feeding the cluster by fixing its symptoms.

**MINUTE 1:15** — She clicks `[View Agent Audit]` from the Run 8 tooltip. The audit shows RELAY-C's four clustered elements and their overlap pattern. Three of the four are downstream of the same buffer size constraint — the same systemic issue from Run 1 that she never addressed at the architectural level. She applied the context buffer fix in Run 2, but the root cause (an undersized core buffer) cascaded to fallback filter, priority queue depth, and now attention threshold.

**MINUTE 2:00** — Kira opens the agent redesign mode (4.69c) and begins a full RELAY-C overhaul. The gap chart told her what no individual career analysis run could: her improvement strategy was band-aids on a structural wound.

---

### Journey 2: Tomasz, Rank 600, Season 2, first time seeing the gap narrow

**MINUTE 0:00** — Tomasz has been aware of his STRIKER-B cluster for three career analysis runs. The gap chart showed a consistent 18pp gap. He decided two weeks ago to stop applying incremental fixes and instead completely rebuild STRIKER-B from scratch — new patrol logic, new buffer model, new hook priorities.

**MINUTE 0:10** — He opens the season health dashboard after his post-rebuild career analysis (Run 7). The actual line (top-candidate coverage) ticked *up* slightly — from 19% to 23%. His immediate reaction: regression. But then he looks at the ceiling line. It dropped from 37% to 28%.

**MINUTE 0:25** — The gap annotation reads: `5pp gap (-13pp from Run 6)`. The gap fill has faded to near-invisible grey. The trend label: `Gap trend (7 runs): narrowing — 18pp to 5pp (-13pp over last 3 runs)`.

**MINUTE 0:40** — Tomasz understands what happened. The top-candidate coverage went up because his rebuild introduced a new element-level weakness (a tuning issue in the new patrol radius). But the cluster ceiling *collapsed* because STRIKER-B no longer has a systemic problem — its elements are independent now, not cascading from a shared upstream constraint. His architecture got temporarily worse at the element level but dramatically better at the structural level.

**MINUTE 1:00** — He applies the new top fix (the patrol radius tuning issue — a straightforward parameter adjustment). His next career analysis, 25 matches later, shows: Top = 17%, Ceiling = 20%, Gap = 3pp. The actual coverage dropped back down, and the gap stayed narrow. The rebuild worked. The gap chart confirmed it before win rate could.

**MINUTE 1:30** — He screenshots the gap chart showing the dramatic gap collapse and posts it to the community Discord: "rebuilt STRIKER-B from scratch. coverage went UP for one run. gap went DOWN by 13. trust the gap."

---

### Journey 3: Priya, Rank 1100, Season 1, cluster-free period transitioning to first cluster

**MINUTE 0:00** — Priya has run 4 career analyses. No multi-cluster has been detected in any of them. The gap chart shows two lines sitting directly on top of each other — the ceiling line collapses to the actual line with open circles at every data point. The gap fill is zero. The chart looks like a single line with two colors overlapping.

**MINUTE 0:05** — She barely notices the gap chart. The coverage trend sparkline above it shows 52% descending to 34%. She's improving. The gap chart seems redundant.

**MINUTE 0:10** — She hovers over the open circles on the ceiling line. A tooltip explains: `No multi-cluster detected — ceiling defaulted to top-candidate coverage`. She reads it, files it away, moves on.

**TWO WEEKS LATER — Run 5**

**MINUTE 0:00** — After a frustrating stretch where her COMMAND agent kept appearing in career analysis results, she runs her 5th career analysis. For the first time, the multi-cluster flag fires: COMMAND appears in 3 of 10 candidates.

**MINUTE 0:15** — She opens the season health dashboard. The gap chart has changed shape. Runs 1-4 still show overlapping lines. But Run 5 has a filled dot on the ceiling line (not open), sitting at 48% — above the actual line's 29%. A visible triangle of amber fill has appeared between the two lines at the right edge. The annotation: `19pp gap (new)`.

**MINUTE 0:30** — The visual contrast is immediate. Four runs of flat zero-gap, then a sudden 19pp emergence. The gap chart shows the *moment* architectural debt appeared in her config. It is timestamped, quantified, and visually unmistakable.

**MINUTE 0:45** — She hovers over Run 5's ceiling dot. `Cluster: COMMAND (3 elements) — Ceiling: 48%`. She opens the agent audit. The cluster is real: COMMAND's priority queue, attention filter, and response threshold are all in the candidate list because she copied COMMAND's architecture from a workshop build that was designed for a different meta. She never customized it. Now the meta has shifted and every facet of COMMAND's borrowed design is showing strain.

**MINUTE 1:15** — She decides to redesign COMMAND before it becomes a persistent cluster. The gap chart gave her a clear visual: the debt appeared at Run 5. If she acts now, Run 6 could show the gap closing. If she waits, the chart will show the debt accumulating. The chart has turned a vague feeling ("COMMAND keeps coming up") into a concrete visual narrative with a measurable trajectory.

---

## Strengths

**Reveals the failure mode of incremental fixes.** The most dangerous pattern in Robot Uprising is the player who diligently applies the #1 fix every career analysis cycle and never notices that the underlying agent keeps producing new symptoms. The gap chart makes this pattern visible as a widening gap — the single strongest visual signal that symptom-patching is not working.

**Provides a measurable target for architectural overhauls.** Before the gap chart, the decision to overhaul an agent was a gut call. After the gap chart, the player can say "my gap has been widening for 4 runs, I need to close it." The gap narrowing after a rebuild is a quantifiable success moment that arrives before win rate reflects the improvement.

**Creates a new temporal narrative.** The coverage trend sparkline (4.68) already provides a season-length narrative. The gap chart adds a second dimension to that narrative — not just "is my top-candidate coverage improving?" but "is the gap between my visible problem and my structural problem growing or shrinking?" Two-dimensional progress tracking is richer than one-dimensional.

**The visual language is self-teaching.** Widening gap = warm fill color = bad. Narrowing gap = fading fill = good. No label needed after the first encounter. Players who never read the tooltip will still absorb the signal from the fill color alone.

**Connects the per-run diagnostic to the season arc.** The combined cluster coverage (4.69b) is a per-run number. The coverage trend (4.68) is a season arc. The gap chart bridges them — showing the per-run number *in context of the season arc*, which is where its meaning actually lives.

---

## Weaknesses

**Requires multiple career analysis runs with cluster detections.** The chart is empty or trivial (zero-gap) until the player has at least 3 runs with at least 1 cluster detection. Many players in early seasons will never see this chart populated. It is a metric for committed diagnostic players — Gauntlet regulars with 100+ matches and deliberate career analysis habits.

**The "collapse ceiling to actual" design for cluster-free runs can mislead.** When the ceiling line sits on the actual line with open circles, it visually communicates "no gap" — which a player might read as "no architectural debt." The truth is "no cluster was detected," which is weaker. A player could have significant architectural debt that does not manifest as a multi-cluster because their problems are distributed across multiple agents rather than concentrated in one.

**Gap direction can temporarily contradict improvement.** As Tomasz's journey shows, the actual coverage can rise (temporarily worse) while the gap narrows (structurally better). Players who look only at whether the actual line went up or down will misread the chart during rebuilds. The gap requires a slightly more sophisticated reading than the coverage trend alone.

**Anchoring to zero-gap as a goal.** Players may fixate on closing the gap to 0pp — treating any gap as failure. But a small gap (3-5pp) is normal and healthy. It means the cluster elements have slightly more coverage in aggregate than any one of them alone, which is expected when multiple elements of the same agent appear in the candidate list. The chart could create anxiety about a gap that is architecturally insignificant.

**Sparse data density.** Career analysis runs happen every 20-30 matches. A 6-run chart represents 120-180 matches of play. Players who run career analysis infrequently will have 2-3 data points per season — too few to establish a trend. The chart rewards frequent diagnostic behavior, which may not align with how casual players engage.

---

## Interaction Effects

**With 4.68 (Coverage percentage as season health metric).** The gap chart is positioned directly below the coverage trend sparkline and shares its horizontal axis. The actual line on the gap chart *is* the coverage trend, redrawn in context. Together, they form a two-tier diagnostic: the sparkline gives the headline ("coverage is declining, good"), the gap chart gives the subtext ("but the structural ceiling isn't declining as fast, concerning"). Players who read only the sparkline get the simple story. Players who read the gap chart get the full story.

**With 4.69b (Combined cluster coverage display).** The ceiling line on the gap chart is the time-series history of the combined cluster coverage that 4.69b shows in the career analysis result panel. The gap chart elevates that per-run metric to a season-level visual. Without 4.69b, the gap chart has no ceiling data to plot.

**With 4.69 (Agent multi-cluster detection).** The gap chart is a downstream visualization of multi-cluster detection. Every filled dot on the ceiling line represents a career analysis run where multi-cluster was detected. The chart implicitly tracks cluster frequency — a chart with many filled ceiling dots indicates persistent multi-cluster issues across runs, while a chart with mostly open dots and one filled dot shows an isolated cluster event.

**With 4.25 (EDT trajectory).** The EDT trajectory measures match-level architectural quality (how deep into matches outcomes are contested). The gap chart measures diagnostic-level architectural quality (how much structural debt exists in the config). A player with rising eEDT and widening gap is in a specific state: they're building architectures that fight longer (good) but whose internal structure is accumulating systemic weaknesses (risky). The two metrics together predict fragility: the player is playing well now but is vulnerable to a meta shift that exploits the structural debt.

**With 4.69g (Agent cluster career stats).** The gap chart shows the aggregate gap trend. The agent cluster career stats show per-agent cluster persistence. A player whose gap chart is widening can drill into 4.69g to see *which* agent is responsible for the widening — is it the same agent every run (persistent debt) or different agents rotating through (distributed debt)? The gap chart is the alarm; 4.69g is the diagnostic.

**With 4.72 (Debt-free season achievement).** A "debt-free season" could be defined as a season where the gap never exceeds 5pp across all career analysis runs. The gap chart provides the exact visual record needed to evaluate this achievement — and the visual record of a flat, near-zero gap across a full season would be the achievement's trophy screenshot.

---

## Comparable Games and Media

**Technical debt dashboards in software engineering (SonarQube, CodeClimate).** The gap chart is a direct analogue of the "technical debt ratio over time" charts these tools display. SonarQube shows a "Maintainability Rating" trend line alongside a "Technical Debt Ratio" trend line. When the debt ratio rises while maintainability holds steady, it signals exactly what the gap chart signals: you're patching issues without addressing root causes. Robot Uprising borrows this concept and gives it a game-mechanical skin.

**Financial portfolio tracking: alpha vs. benchmark.** In portfolio management, the gap between a fund's actual returns and its benchmark (the "tracking error" or "alpha") is graphed as a dual-line chart with fill. A fund manager whose alpha narrows is underperforming relative to what their strategy should deliver. The gap chart applies the same visual language: the actual coverage is the player's "realized performance," the ceiling is the "benchmark" of what they could achieve with a full overhaul, and the gap is the unrealized potential.

**Heart rate zone training charts (Garmin, Strava).** Endurance athletes track their actual heart rate against target heart rate zones over a workout. The gap between actual and target — when sustained — signals an athlete working outside their optimal zone. The visual language of two lines with a fill between them, colored by distance, is directly borrowed from sports analytics dashboards. The aesthetic is familiar to anyone who has used a fitness tracker.

**StarCraft 2 macro gap analysis (community tools).** SC2 community tools compute a "macro gap" — the difference between a player's actual resource spending rate and the theoretical maximum spending rate given their income. The gap widens when a player is floating resources (not spending efficiently). A widening SC2 macro gap signals the same thing as a widening Robot Uprising coverage gap: the player's execution is falling behind what their infrastructure can support.

---

## Sensory Description

### The Lines

The actual line is drawn in **steel blue** (`#5B8DB8`), a cool, recessive color that reads as "measurement" — clinical, reliable, the baseline. The weight is 2px, anti-aliased, with circular data point markers at 4px radius filled solid. The line connects data points with gentle bezier curves, not angular segments — the visual language of a trend, not a bar chart.

The ceiling line is drawn in **warm ochre** (`#C4883A`), a color that reads as "potential" or "what could be." The weight is 2px but dashed — 4px dash, 3px gap — which separates it visually from the solid actual line even when they overlap. Data points are 4px radius. Filled dots for runs with real cluster detections; open circles (1.5px stroke, hollow center) for runs where the ceiling was imputed from the actual value. The dash pattern is the same pattern used for projected or hypothetical values elsewhere in the UI — a consistent visual vocabulary for "this is what would happen if."

### The Gap Fill

The fill between the two lines uses a vertical gradient that maps to gap magnitude. At gap = 0pp, the fill is fully transparent. At 1-7pp, a soft neutral grey (`#9E9E9E`) at 8% opacity — the barest tint, visible only if you look for it. At 8-19pp, the fill transitions to warm amber (`#C4883A`, matching the ceiling line) at 15% opacity. At 20pp+, the fill becomes a muted rust (`#A65D3F`) at 25% opacity. The transition between color bands is smooth, not stepped — a linear interpolation across the gap range.

The fill breathes. On the season health dashboard, a very slow CSS animation pulses the fill opacity by +/- 3% over a 6-second cycle. It is nearly imperceptible in isolation but creates a sense of the gap being alive — a pressure that exists, not a static annotation. When the gap is zero, there is nothing to pulse.

### The Gap Annotation

The annotation label sits in the vertical space between the two lines at the rightmost data point. The font is `IBM Plex Mono` at 11px, the same monospaced font used for numerical readouts throughout the debrief interface. The gap value is shown in a color that matches the fill intensity — grey for small gaps, amber for medium, rust for large. The delta (e.g., `+3pp` or `-5pp`) appears on a second line in a smaller 9px weight, colored green (`#5BA664`) for narrowing or red-amber (`#C45B3A`) for widening.

When a new career analysis run is added and the dashboard updates, the annotation animates: the previous gap value fades out over 0.3 seconds, the new value fades in over 0.3 seconds, and the delta appears 0.2 seconds after the new value with a subtle slide-up from 4px below. Total animation duration: 0.8 seconds. No bounce, no overshoot, no playfulness. The animation language is instrumentation updating — a gauge needle settling on a new reading.

### The Trend Label

Below the chart, the trend label is displayed in the same `IBM Plex Mono` 11px font. The word "widening" is colored in the rust-amber of an active gap. The word "narrowing" is colored in the soft green of a closing gap. The word "stable" is colored in neutral grey. The cumulative delta at the end of the label (`+16pp cumulative` or `-15pp cumulative`) is bold, the only bold text in the label — the one number the eye should land on.

### Audio

The gap chart has no persistent audio. But when a new data point is added (after a career analysis run completes and the dashboard refreshes), two sounds play in sequence:

**Sound 1 — Data point registration.** A soft percussive tick, 80ms duration, pitched at C4. This is the same tick used when EDT dots appear on the profile sparkline — a consistent "data recorded" sound across all career metrics.

**Sound 2 — Gap assessment tone.** A 200ms sustained tone that plays 0.5 seconds after the tick. The pitch encodes the gap delta:
- Gap narrowed: the tone resolves upward by a major second (C4 to D4). Clean, consonant, a signal of improvement.
- Gap widened: the tone bends downward by a minor second (C4 to B3). Slightly dissonant, not alarming — a nudge, not a siren.
- Gap stable: a single sustained C4 with no movement. Neutral.

The tones are generated from the same synthesizer palette as the signal-in-buffer sounds — clean sine waves with a light attack and moderate decay, no reverb. They exist in the same sonic register as every other diagnostic tool in the debrief interface: clinical, informative, not emotional. The gap chart sounds like an instrument panel, not a reward system.

### The Dashboard Composition

The gap chart sits in the "Structural Health" section of the season health dashboard, between the coverage trend sparkline (above) and the cluster persistence timeline (below, from 4.69d). The three visualizations share a horizontal axis (career analysis run number) and are vertically stacked with 12px gutters between them. Together, they form a triptych: the sparkline shows the headline metric, the gap chart shows the structural depth beneath it, and the persistence timeline shows which agents are responsible. The eye reads top-to-bottom as a progressive drill-down: summary, diagnosis, attribution.

The entire triptych panel has a subtle left-border accent — a 3px vertical line in the same steel blue as the actual line — that visually groups the three charts into a single analytical unit. The border extends the full height of the panel, from the sparkline's top edge to the persistence timeline's bottom edge. It says: these three charts are one thought.

---

## Discovered New Aspects

- **4.69p — Gap velocity as alert trigger:** Should the game automatically surface a warning when the gap widens by more than 5pp across 2 consecutive runs? A threshold-based alert that pulls the player's attention to the gap chart before the debt becomes severe, rather than waiting for the player to notice the fill color changing.
- **4.69q — Gap chart in config necropsy export:** When a player exports a config evolution history for community sharing, should the gap chart be included alongside win rate and eEDT trajectories? The gap chart would add a third narrative dimension to necropsy posts — showing not just performance and contest quality, but structural debt evolution.
- **4.69r — Per-agent gap decomposition:** When multiple agents have clusters detected across different runs, should the gap chart support a "color by agent" mode that shows which agent contributes how much to the total gap? A stacked-area variant of the gap fill, colored per agent, would let players see whether one agent dominates the debt or whether it's distributed.
- **4.69s — Gap-zero streak as season achievement:** A variant of 4.72 (debt-free season) that tracks consecutive career analysis runs with gap < 3pp, rewarding sustained structural health rather than single-run snapshots.
