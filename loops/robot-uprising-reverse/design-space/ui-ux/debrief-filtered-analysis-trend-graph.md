# Filtered Analysis Data Points in Season Health Trend Graph

**Aspect:** 4.69e-i-c — Filtered analysis data points in season health trend graph: should filtered analysis runs appear on the coverage-% trend graph as differentiated data points (lighter color, different shape); optional show/hide toggle; interaction with 4.68 coverage as season health.

**Parent:** 4.69e-i — Career analysis scope filter UI design
**Siblings:** 4.69e-i-a (sample size warning threshold); 4.69e-i-b (opponent list sorting at scale); 4.69e-i-d (scope summary legibility in exports); 4.69e-i-e (auto-filter suggestion engine)
**Related:** 4.68 (coverage % as season health trend graph); 4.69e (adversarial multi-cluster poisoning); 4.69e-ii (known adversarial opponent tagging); 4.69k (cluster flag history in career analysis log); 7.10 (config necropsy culture)

---

## The Design Problem

The season health trend graph (4.68) plots the top-candidate coverage score from each career analysis run over time. It is the game's **long-arc health record**: a declining line means the player is building better architectures; a spike means regression.

When the scope filter (4.69e-i) is introduced, every career analysis run now has a type: **full-scope** (all matches) or **filtered** (a subset). The filtered analysis often tells a *different story* — sometimes dramatically different. RELAY-C at 52% in the full-scope run might drop to 18% in the filtered run excluding adversarial opponents. These are two different measurements of two different things.

The question the trend graph now has to answer: **What is being charted?**

- "How structurally vulnerable is the player's config to any opponent?" → Only full-scope runs belong on the graph.
- "What is the player's genuine architectural health, excluding known bad-faith data?" → Only adversarial-excluded runs belong.
- "Both — because the divergence IS the story." → Both series belong, shown separately.
- "Whatever the player ran most recently." → All runs in chronological order.

Each choice implies a different philosophy about what "season health" means, what the trend graph is *for*, and how the game communicates with players who have poisoned data.

---

## Option Space

### Option 1: Exclusion (Filtered Runs Never Appear)

**What it is:** The trend graph only ever plots full-scope career analysis runs. Filtered runs exist in the history log and produce valid result panels, but they are not graphed. The trend line represents a single canonical series.

**Rationale:** The trend graph is a *canonical health record*. Full-scope analyses are comparable to each other across time: they always use the same match corpus (all matches in the career window). Filtered analyses are investigative snapshots using an arbitrary subset. Mixing them would pollute the longitudinal record with incompatible measurements.

**What it looks like:**
```
SEASON HEALTH TREND (full-scope runs only, 5 runs)
●────●────●────●────●
61%  43%  38%  32%  26%    ← declining = improving architecture

[Run filtered analysis] appears in history log but does NOT add a graph point
```

**Interaction effect with adversarial poisoning:** If an adversarial opponent has been poisoning the player's full-scope analyses for 6 runs, the trend graph shows a stubbornly high (bad) coverage score across all 6 runs. The player knows from their filtered analyses that their *actual* architectural health is 18% — but the trend graph never shows this. The graph lies — not through bad design, but because the canonical series is corrupted.

**Strengths:**
- Maximum clarity. Every data point on the graph is directly comparable to every other.
- No confusion about which type of run each data point represents.
- The "declining is good" mental model is never complicated by same-point having two values.

**Weaknesses:**
- The graph actively misrepresents the player's architectural health in the adversarial poisoning scenario. The player's "actual health" is never visible in the trend format — only in the individual result panel.
- A player who uses filtered analyses extensively will have a sparse trend graph (only their occasional full-scope runs appear), even though they have been doing deep diagnostic work.
- Encourages the player to keep running full-scope analyses even when they know the data is compromised, just to keep the trend graph updating.

---

### Option 2: Inclusion (All Runs Always Appear)

**What it is:** Every career analysis run — full-scope and filtered — appears as a data point on the trend graph. Filtered runs are visually distinct (lighter color, hollow marker, dashed connector line) but they are present.

**What it looks like:**
```
SEASON HEALTH TREND (all runs, 8 runs)
●────●────●────◇────●────◇────◇────●
61%  43%  38%  19%  45%  21%  18%  26%
         full  filt full  filt filt full
```

Where `●` = full-scope run (solid blue) and `◇` = filtered run (hollow amber diamond).

The coverage value plotted for filtered runs is the filtered analysis's top-candidate score (not the full-scope equivalent). This means adjacent data points may represent different match corpora — not directly comparable.

**Strengths:**
- Complete diagnostic history in one view. The player can see their full-scope corrupted trend alongside their filtered healthy trend in the same graph.
- Rewards players who run filtered analyses regularly — their work is acknowledged in the trend.

**Weaknesses:**
- **Apples and oranges on one axis.** The graph implies comparability between adjacent data points. A full-scope point at 45% and a filtered point at 21% look like a health improvement — but they're measuring different things. A new player will naturally read the line as one continuous story, when it's actually two interleaved stories.
- If the player has multiple saved filters (Quick assault only, Excluding adversarial, v3.0+ configs), each generates a different coverage score. Which filtered score gets plotted? Whichever was most recent? They all appear? This creates chaos quickly.
- The trend line segment connecting a full-scope point to a filtered point is actively misleading.

---

### Option 3: Dual-Series Overlay (The Adversarial Gap View)

**What it is:** The trend graph has **two distinct series** rendered as parallel lines on the same axes:

- **Series A — Full-scope** (dark line, solid circles): one data point per full-scope career analysis run.
- **Series B — Filtered baseline** (lighter amber line, hollow diamonds): one data point per run using the player's designated "adversarial-excluded" filter (see 4.69e-i, the auto-saved "Excluding adversarial opponents" filter).

Series B only appears if the player has tagged at least one opponent as adversarial and has run at least one filtered analysis using the adversarial-excluded filter. Until then, the graph shows only Series A.

When both series are present, the graph renders a **gap fill** between them — a translucent amber band between the two lines showing the **adversarial contribution**: the coverage percentage attributable to adversarial opponents. Wide gap = heavy poisoning impact. Narrow gap = poisoning has minimal effect (or was resolved).

**What it looks like:**
```
SEASON HEALTH TREND (dual series, last 6 runs)

70% ─────────────────────────────────────────
    ●
60% ─  ●──────────────────── (full-scope line)
       │∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷∷│  ← amber gap fill
50% ─  ◇──────────────────── (filtered baseline)
       ◇
40% ─     ●
          │∷∷∷∷∷∷∷│
30% ─     ◇
              ●  ●
20% ─             ◇  ◇  ◇
     run1  run2  run3 run4 run5 run6

● = full-scope   ◇ = adversarial-excluded filtered
∷∷ = amber gap fill (adversarial contribution)
```

The **gap** is the key story. A widening gap (Series A staying high while Series B stays low) tells the player: your architecture is actually healthy; adversarial targeting is making your full-scope data look worse than it is. A narrowing gap after the player removes the adversarial opponent from their ladder (or tags them out of the default filter) tells the story of restoration.

**Interaction with the "season health grade":** The grade (e.g., "B — improving") in the header of the Season Health dashboard could show both grades: "B (full-scope) / A (adversarial-adjusted)" — see newly discovered aspect 4.69e-i-c-i.

**What triggers Series B to appear:**
1. At least one opponent tagged as `⚠️ suspected` or `☠️ confirmed adversarial`
2. At least one filtered career analysis run using a filter that excludes the tagged opponent(s)
3. If both conditions are met, Series B auto-populates from the filtered analysis history; if the player hasn't yet run a filtered analysis, Series B shows a prompt: "Run a filtered analysis to see your adversarial-adjusted health trend."

**Strengths:**
- The gap visualization makes the adversarial impact *viscerally legible* — not a number, but a physical distance between two lines. A player who has been playing for 3 seasons with a poisoner can see the gap widening gradually, then closing sharply when they identified and tagged the poisoner and excluded them.
- Each series is internally consistent: full-scope runs only connect to full-scope runs; filtered runs only connect to filtered runs. No apples-and-oranges connector lines.
- The amber gap fill directly answers "what did adversarial opponents cost me?" — it is a continuous visual representation of the price of being targeted.

**Weaknesses:**
- **Two-series graph complexity.** Players unfamiliar with multi-line charts may not immediately grasp why there are two lines. The visual requires a legend.
- **Which filtered run contributes to Series B?** The player may have multiple saved filters (adversarial-excluded, Quick-assault-only, v3.0+). Only the adversarial-excluded filter should populate Series B; scenario-type filtered runs are *not* relevant to the health trend. This requires the system to categorize saved filters by purpose.
- **Interpolation gaps.** If the player runs 5 full-scope analyses but only 2 filtered analyses, Series B has 3 fewer data points than Series A. The amber line will be fragmentary — dashed segments between sparse actual data points may mislead. Alternatively, the latest filtered score can be projected forward as a dotted horizontal until the next filtered run.

---

### Option 4: Toggle Layer (Show/Hide Filtered Points)

**What it is:** The trend graph defaults to full-scope-only display (Option 1). A small toggle above or below the graph — "Show filtered analyses" — adds filtered run data points to the graph as a secondary visual layer, using the hollow diamond treatment from Option 2.

**What it looks like:**
```
SEASON HEALTH TREND

[● Full-scope only]  [◇ Show filtered runs ◁ toggle]

       ●──●──●──●──●
       61% 43% 38% 32% 26%
```

When toggled on:
```
SEASON HEALTH TREND

[● Full-scope]  [◇ Filtered ✓]

  ●──────────────────●──●
  │  ◇  ◇    ◇       │
  61% 19% 21% 18%  32% 26%
```

Filtered points appear as amber hollow diamonds without connecting lines between themselves or to full-scope points. They are contextual reference markers, not a trend line.

The toggle state persists in localStorage across sessions. Players who want the full picture always see filtered runs; players who want the clean canonical view stay in the default.

**Strengths:**
- Preserves the clean default (canonical full-scope trend) while allowing advanced players to add filtered context.
- Avoiding connecting lines for filtered points prevents the apples-and-oranges misread.
- Persisted toggle state respects player workflow preferences.

**Weaknesses:**
- Without connecting lines, the filtered points look like noise rather than a trend. The player may not see the pattern of consistent low scores in filtered runs vs. high scores in full-scope runs — the pattern that would reveal sustained adversarial poisoning.
- The toggle adds UI surface area that must be explained.

---

### Option 5: Separate Filtered History Track (The "True Health" Panel)

**What it is:** The season health dashboard has two separate panels. The primary panel (top) shows the full-scope coverage trend, as in Option 1. A secondary panel (below, collapsed by default, expandable with a click) shows the "adversarial-adjusted health history": a trend line built only from filtered analyses using the adversarial-excluded filter.

These are not overlaid — they are distinct panels with distinct Y axes and distinct value series.

**What it looks like:**
```
┌─────────────────────────────────────────────────────────────┐
│ SEASON HEALTH (full-scope)                                   │
│ ●──●──●──●──●──●     Overall trend: slightly declining ↓    │
│ 61% 57% 55% 52% 50% 52%                                     │
│                                                              │
│ [▸ Adversarial-adjusted health (4 filtered runs)]           │
└─────────────────────────────────────────────────────────────┘

Expanded:
┌─────────────────────────────────────────────────────────────┐
│ ADVERSARIAL-ADJUSTED HEALTH (excl. ☠️ tagged opponents)     │
│ ◇────◇────◇────◇      Actual trend: healthy ✓               │
│ 19%  21%  18%  17%                                           │
│                                                              │
│ Gap: adversarial opponents account for avg. 34% of your     │
│ full-scope coverage score. Your config is architecturally   │
│ healthy when measured without adversarial data.             │
└─────────────────────────────────────────────────────────────┘
```

**Strengths:**
- The two panels have completely separate semantics. No risk of misreading one as the continuation of the other.
- The "Gap" summary line in the secondary panel is a plain-language interpretation: "adversarial opponents account for 34% of your coverage score." This bridges the gap between the data and the implication.
- Collapsed by default — players without adversarial opponents never see the secondary panel and are not confused by its absence of data.

**Weaknesses:**
- The most actionable insight — the divergence between full-scope and adjusted health — is split across two panels. Players may not find or expand the secondary panel.
- Requires more vertical space than the single-graph options.

---

## Recommendation: The Layered Hybrid

The best solution combines Options 3 and 4:

**Default state:** Full-scope-only trend line (Option 1 / Option 4 base).

**When adversarial tagging is active:** The dual-series overlay (Option 3) auto-activates, but as a **secondary series of isolated points** (no connecting line between filtered data points), not a continuous second line. The amber gap fill appears between the most recent full-scope data point and the most recent filtered data point, labeled "adversarial contribution: Δ34%." This is smaller and less potentially confusing than a full dual-line chart.

**Advanced toggle:** "Show as dual trend" upgrades from the isolated-point treatment to the full dual-line overlay (Option 3) with connecting lines within each series but not between series.

This layered approach means:
- New players see a clean single-line trend
- Players with tagged adversarial opponents automatically see contextual filtered reference points appear
- Power users who want the full dual-series analysis can activate it explicitly

---

## Visual Treatment Specifications

### The Filtered Data Point Marker

Full-scope data points: **solid filled circle**, color #4B91D4 (medium blue), diameter 8px.

Filtered data points: **hollow diamond** (square rotated 45°), stroke color #D97706 (amber), stroke width 2px, transparent fill, diagonal dimension 9px — slightly larger than the circle so they're visually distinct at small sizes.

The diamond shape is deliberately chosen because:
- Diamonds visually signal "different kind of thing" rather than just "different value"
- The hollow center makes them feel less authoritative than solid circles (the full-scope data)
- Diamonds are recognizable from financial charts as a secondary data marker

### Connector Lines

Between consecutive full-scope points: **solid line**, #4B91D4, opacity 80%, width 1.5px.

Between consecutive filtered points (if the dual-series mode is active): **dashed line**, #D97706, opacity 60%, 4px dash 3px gap, width 1.5px. The dashed treatment signals "interpolated" or "supplementary" — the same visual language used in engineering diagrams for estimated values.

**Never connect a full-scope point to a filtered point.** If a full-scope run happened on Monday and a filtered run on Tuesday, there is no connector between them. They are separate series that happened to fall on adjacent dates.

### The Adversarial Gap Fill

When the dual-series mode is active and both series have data for overlapping time ranges, the area between the two lines is filled with a translucent amber: #D97706 at 12% opacity. This is barely perceptible — a warm tint rather than a solid block. On hover, the tint intensifies to 25% and a tooltip appears: "Adversarial contribution: opponents tagged as adversarial account for approximately X% of your top-candidate coverage score."

The tint is designed to be **ambient information**: visible without demanding attention, interpretable on hover without requiring understanding to read the graph casually.

---

## Player Journeys

### Journey: Vesper, 24, Competitive Ladder Player, Post-Discovery

**Context:** Vesper has spent 6 weeks on the competitive ladder. Last session they discovered VoidEater_Prime has been poisoning their career analysis (adversarial signal strength: 61%). They've tagged VoidEater_Prime as confirmed adversarial and run their first filtered analysis. Now they're looking at the Season Health dashboard for the first time since making the discovery.

**Minute 0:00 — Season Health Dashboard Opens**
Vesper opens the Season Health dashboard from the debrief. The trend graph shows 7 data points across their career — all full-scope runs. The line has been stubbornly high: 52%, 55%, 49%, 53%, 50%, 57%, 52%. It looks like plateau or mild oscillation. The season health grade reads "C — stuck."

Something has changed, though. A new amber diamond has appeared to the right of the last full-scope circle. A tooltip on the diamond reads: "Filtered analysis (excl. VoidEater_Prime) — 18% coverage." And the label beneath the graph now reads: "Adversarial contribution: +34% avg. · [Show as dual trend]."

[Vesper stares at the diamond. 18%. Their "actual" season health is 18% — a healthy A-tier — while the full-scope line has been sitting at 50%+ for their entire career. Six weeks of grind, and the whole time they were in the A tier; they just couldn't see it through the poisoned data.]

**Minute 0:30 — Running a Filtered Analysis**
Vesper opens the career analysis panel and runs a second filtered analysis (they want another data point). The amber diamond at the right edge of the graph appears and joins the isolated point: a second diamond, now connected by a dashed amber line to the first. "17%." The dashed line between the two filtered runs is short — five days — and nearly flat. The adversarial contribution label updates: "+35% avg."

[Two filtered points, both around 17–18%, bridged by a dashed amber line. Vesper zooms in mentally: the dashed line says "this isn't noise, this is a consistent signal." Their actual health has been stable at 17–18% even as the full-scope line bounced between 49% and 57%.]

**Minute 1:00 — "Show as Dual Trend"**
Vesper clicks the "Show as dual trend" link. The graph re-renders. Now two lines span the same time range:
- Dark blue solid line: 7 points ranging 49–57%, with a subtle downward tilt they'd interpreted as minimal progress.
- Dashed amber line: the 2 filtered points form a very short segment at 17–18% at the far right.

The amber gap fill between the two lines at the right edge is unmistakable: a translucent warm band spanning 35 percentage points. The tooltip on the band: "Adversarial contribution: approximately 35% of your current top-candidate score comes from matches against VoidEater_Prime."

[Vesper sees it. The two lines will diverge dramatically once they have more filtered data points. The visual is already beginning to tell the story. They resolve to run a filtered analysis after every session for the next month to fill in the dashed line and see the full extent of the poisoning.]

**Minute 1:45 — The Emotional Moment**
Vesper changes the display to show all 6 weeks of filtered analyses they could have had — not possible, they don't have that data — but they imagine what the dual trend would have shown: a flat, healthy amber dashed line around 18% running the entire length of the blue line that oscillated chaotically. The gap would have been visible from week one.

The season health grade panel has updated: "C (full-scope) / A (adversarial-adjusted)." A note reads: "Your adversarial-adjusted health grade is A — your architecture is robust. The C grade reflects adversarial match data that is distorting your full-scope analysis."

[Vesper takes a screenshot and posts it to the community Discord with one word: "six weeks."]

**UI Annotations:**
- Amber diamond placement: to the right of the most recent full-scope circle, offset slightly on the time axis by the actual run timestamp (typically within a few hours of the full-scope run).
- "Adversarial contribution" label: positioned below the trend graph, in secondary text (#8B92A3), reading "Adversarial contribution: +Δ% avg. · [Show as dual trend]". The link is underlined in amber.
- Dual trend mode: the graph's vertical axis remains unchanged. The layout does not expand. The change is purely in the rendering of the filtered points: they gain connecting dashed lines between consecutive filtered runs.
- Grade panel: two lines instead of one. The adversarial-adjusted grade only appears when at least 2 filtered data points exist.

---

### Journey: Korbin, 37, Mechanical Engineer, Factorio Veteran, PvE-First

**Context:** Korbin uses the scope filter not for adversarial defense but for scenario-type segmentation. They run career analyses with 4 different filters: full-scope, Quick-assault-only, Holdout-only, and Extraction-only. They want to see all 4 trends in the season health view simultaneously.

**Minute 0:00 — Multi-Filter Trend Discovery**
Korbin opens Season Health after 3 months of play. Their full-scope trend shows:
- 7 full-scope runs, coverage declining from 38% to 22%. Genuinely improving.
- A note beneath the graph: "3 saved filters have accumulated filtered analysis data. [View filter trends]."

Korbin clicks "View filter trends." A secondary panel expands below the main graph with three sub-graphs, one per non-adversarial saved filter:

```
QUICK ASSAULT (7 filtered runs)
◇────◇────◇────◇────◇────◇────◇
67% 63% 58% 61% 54% 48% 44%   ↓ improving (slowly)

HOLDOUT (5 filtered runs)
◇────◇────◇────◇────◇
31% 28% 24% 21% 20%   ↓ improving (fast)

EXTRACTION (4 filtered runs)
◇────◇────◇────◇
22% 19% 18% 15%   ↓ improving (very fast)
```

The three sub-graphs share the same Y-axis scale as the main trend. Korbin can see instantly:
- Quick assault: starting from 67%, still declining but slowly. This is the persistent failure mode.
- Holdout and Extraction: converging toward 15–20%, nearly fixed.
- The full-scope average (22% in the latest run) reflects the averaging of Quick assault's 44% and Extraction's 15%. The full-scope number is genuinely misleading about Quick assault's remaining severity.

**Minute 0:30 — Isolating the Problem**
Korbin notes that across 7 Quick assault runs, the coverage has declined from 67% to 44%. Meaningful improvement — but 44% is still in the "critical" band. The same element (STRIKER-A) has been the top candidate in 6 of the 7 Quick assault runs. The Quick assault trend is a long argument: STRIKER-A, in burst-tempo environments, is structurally overchallenged.

The sub-graph makes this argument visually, without Korbin having to cross-reference 7 separate result panels. The declining line is the argument; its slope is the diagnosis.

**Minute 1:00 — Cross-Scenario Rate-of-Improvement Comparison**
Korbin notices the slopes differ across the three sub-graphs. The Quick assault decline is roughly 3.3% per run. The Holdout decline was 2.75% per run. The Extraction decline was 2.3% per run — but Extraction is starting from much lower and approaching a floor.

The most striking observation: the Holdout and Extraction lines are approaching convergence with each other. Their failure profiles are merging — the player's config is handling both of these scenario types in similar ways. Only Quick assault remains structurally divergent.

[Korbin opens a note file and writes: "STRIKER-A is a Quick-assault-specific architectural debt. It performs well in every other scenario type. The fix is not general; it is tempo-specific. The burst-cadence buffer configuration needs its own mode."]

**Minute 1:30 — Design Decision: Quick Assault Specialization**
Korbin opens the agent workbench and navigates to STRIKER-A's context config. They create a second config variant: "STRIKER-A_v2_quickassault" with a modified buffer eviction policy for burst-tempo conditions. Next time they play Quick assault, they want to deploy v2 and see what it does to the filtered trend.

The season health sub-graph for Quick assault becomes the scoreboard for this experiment. If v2 is working, the Quick assault line should show a steeper decline in the next 2–3 filtered runs.

**UI Annotations:**
- "View filter trends" disclosure: a small text link below the main graph. Opens a collapsible panel. State persists in localStorage.
- Sub-graph sizing: each sub-graph is 60px tall (vs. 120px for the main graph). The same compressed sparkline format — Y-axis with min/max labels, run count, latest value, trend annotation (↓ improving / → flat / ↑ regressing).
- Sub-graph labels: the filter name (e.g., "QUICK ASSAULT") + match count (e.g., "(7 filtered runs)") + the actual saved filter name ("Quick assault only").
- Scenario-type filtered runs do not appear on the main trend graph at all. They are strictly in the sub-graph panel. No contamination of the main full-scope trend.

---

### Journey: Naledi, 16, First Time Strategy Game, Casual Player

**Context:** Naledi found Robot Uprising through a TikTok video. They've been playing for 3 weeks and have only run career analysis twice. They've never used the filter shelf and don't know what filtered analyses are. They open Season Health for the first time.

**Minute 0:00 — Season Health First Look**
Naledi opens Season Health from the main menu. The season health panel shows:

```
SEASON HEALTH
Grade: C-  (run 2 of 2)
Coverage trend:
●──●
48% 51%
↑ getting worse — your config has more concentrated weaknesses now
```

Two data points. The trend is negative — coverage went up between runs 1 and 2, which means the architecture got more brittle. The grade is C-.

No amber diamonds. No filtered analysis note. Just two blue circles connected by a short line going up-right (bad direction). Everything is clean and readable because Naledi has no filter history.

[Naledi reads: "↑ getting worse — your config has more concentrated weaknesses now." This is concerning. They open the career analysis to see what the top candidate is. The system directs them to SCOUT-B's patrol radius. They try to understand what that means.]

**Minute 0:30 — A Future Visit (After 3 Months)**
Naledi is now three months in. They've played 180 matches and run career analysis 8 times. They've never used the filter shelf — they didn't know it existed. The Season Health trend has 8 blue circles; the line has been declining (improving) with one bump. Grade: B+.

The filter shelf icon is visible in the career analysis panel but Naledi hasn't clicked it. The trend graph doesn't show any amber elements. The design has successfully kept the advanced feature out of Naledi's path until they're ready.

[The Season Health view is simple and legible. Two gradients of complexity — the trend graph for basic players, the filter overlay for advanced players — coexist without either contaminating the other.]

**Minute 5:00 — Discovering Filtered Analysis Through a Friend**
Naledi's friend (more experienced) shows them the scope filter. "See this?" they click the filter shelf. "If an opponent keeps specifically targeting one of your agents, you can exclude them and see what your actual health looks like." Naledi tries it — excludes one opponent (no adversarial tagging, just experimenting) and clicks Run Analysis.

A filtered result appears. And suddenly on the Season Health graph: a small amber diamond appears at the right edge, disconnected from the main line. A tooltip: "Filtered analysis (excl. 1 opponent) — 31% coverage."

The full-scope point is at 27% (the most recent run), and the filtered point is at 31% — slightly higher. The filtering actually made things look worse, because the excluded opponent wasn't poisoning the data, they were just a legitimate source of stress Naledi needed to address.

[Naledi learns both directions at once: filtering can reveal poisoning (if the filtered value drops dramatically) or confirm genuine structural weakness (if the filtered value stays the same or rises slightly). The filtered diamond on the graph communicates this in a single data point.]

**UI Annotations:**
- First-time experience: if the player has no tagged adversarial opponents and no saved filters, the Season Health dashboard shows no amber elements at all. No hint or prompt toward filtered analyses. The dashboard is clean.
- Diamond appearance: the first time a filtered analysis is run and a diamond appears on the graph, a brief explanatory tooltip fades in automatically: "This diamond shows your filtered analysis result. Diamonds are filtered runs; circles are full-scope runs." Auto-dismisses in 5 seconds.
- No confusion mitigation: because diamonds and circles are clearly different shapes, the player can distinguish them without relying on color alone. Accessibility-safe design: shape differentiation works without color vision; color reinforces the distinction rather than being the only signal.

---

## Strengths and Weaknesses (Cross-Option Analysis)

### What All Options Share

**The fundamental tension** is that filtered analyses and full-scope analyses are measuring different things. Any visualization that implies comparability between them is technically lying. The safest lie is a consistent visual code (diamond ≠ circle, dashed ≠ solid) that signals "these are different kinds of measurement."

### Strengths of the Recommended Hybrid

**Adversarial impact becomes viscerally legible.** A player who has been poisoned doesn't just see a number ("34% adversarial contribution") — they see two lines diverging over time. The gap has a shape. If poisoning started 4 weeks ago, the gap has a start point. If tagging and filtering resolved the issue, the gap has an end point. This is storytelling through chart design.

**Additive complexity.** The clean default (full-scope only) is never degraded for players who don't need the filtered layer. The amber elements appear only when earned (after tagging and filtering). Players who want more depth activate it; players who want clean signals keep the default.

**Separate sub-graphs for scenario-type filters prevent contamination.** Scenario-type filtered analyses answer a completely different question than adversarial-excluded analyses. Mixing them on the main trend graph would destroy the semantic coherence of both.

### Weaknesses

**The dual-series gap fill requires the player to understand that "lower is better"** for this graph. Most game dashboards trend upward when improving. Here, falling line = improving player. The gap fill, which shows full-scope *above* filtered (since full-scope coverage is higher due to adversarial contribution), reads visually as "you're getting worse" to someone who hasn't internalized the inverse metric. Mitigation: explicit annotation on the Y-axis ("lower = better") and labeling the gap as "adversarial inflation" rather than a delta.

**Multiple saved filters produce complexity.** The sub-graph panel for non-adversarial filters could accumulate many panels if the player creates many saved filters. A maximum of 5 sub-graphs with a "show all" collapse option is needed.

**Data sparsity makes trend lines unreliable.** If the player has run only 2 filtered analyses ever, the dashed line between them is two points — not a trend, just a line. The system should not call a 2-point filtered series a "trend"; it should be labeled as "2 data points — more runs needed for trend analysis."

---

## Interaction Effects

**4.68 (Coverage % as season health):** This aspect extends 4.68 by specifying how filtered runs integrate into the trend graph defined there. The full-scope trend defined in 4.68 is not altered; this aspect adds a secondary layer that operates on the same graph surface.

**4.69e-i (Scope filter UI):** The scope filter design notes (in the History Log Interaction section) that "filtered analyses appear with amber left-border stripe in the history log." The amber diamond on the trend graph is the graph-level equivalent of that amber stripe: the same semantic (non-canonical, filtered, advisory) expressed in graph-appropriate visual language.

**4.69e-ii (Known adversarial opponent tagging):** Series B (the adversarial-excluded filtered trend) only appears after the player has tagged opponents. The tagging act is the trigger that activates the dual-series display. This creates a meaningful gameplay moment: the act of formally naming an adversary changes what the Season Health dashboard shows. Tagging has a *consequence*.

**4.69k (Cluster flag history in career analysis log):** The cluster flag can appear on filtered analyses too. If the filtered trend graph shows a period where the filtered analysis *also* had a cluster flag, that point deserves special marking (a small warning icon overlaid on the diamond). This means the adversarial-excluded analysis *still* showed structural clustering — which is evidence of a genuine architectural problem, not adversarial poisoning.

**7.10 (Config necropsy culture):** The season health trend graph in dual-series mode is a perfect candidate for community sharing in necropsy discussions. A screenshot of a wide gap between full-scope and filtered trends is compelling evidence in a post-season retrospective. See newly discovered aspect 4.69e-i-c-iii — necropsy export formatting for dual-trend graphs.

---

## Comparable Systems

**Bloomberg Terminal "Comparison Mode":** Bloomberg allows overlaying multiple data series on the same chart axes, with each series rendered in a distinct color and line style. The legend is explicit about what each series represents. When the series measure the same thing but from different starting conditions (e.g., two stocks indexed to 100 at different dates), Bloomberg adds a "rebased" indicator. The lesson: overlaid series on the same axis are readable *if* the legend is clear and the axis semantics are consistent.

**Strava's "Multiple Activity Overlay":** Strava lets runners overlay their pace charts from multiple runs on the same graph, with each run in a different opacity. The earliest runs are lighter; the most recent is darkest. The gap between lines shows improvement (or regression) over time. The lesson: opacity as a time-depth signal is intuitive — players naturally read lighter lines as older/less authoritative.

**Zwift "Season Comparison" in training apps:** Cycling training apps like TrainingPeaks show a fitness/freshness curve in a dual-band format — the gap between "form" and "fatigue" tells the training story. The two lines represent different metrics (not different filters of the same metric), but the gap-fill visual treatment is directly applicable.

**Grafana's time series panel with "threshold bands":** Grafana renders threshold bands — constant-value horizontal bands — behind time series lines to provide context ("this value is in the warning zone"). The gap fill in the dual-trend graph is a dynamic version of this: the band's width changes over time, reflecting changing adversarial impact.

**Chess.com's rating graph:** Chess.com plots a single rating line across time, with bullet/blitz/rapid as separate color-coded lines on the same axis. Players naturally understand that bullet and rapid ratings are different measurements of the same underlying skill (chess ability), and the divergence between them is interesting (some players' bullet rating is much higher than their rapid). This is structurally analogous: the two trend lines are different measurements of the same underlying thing (architectural health).

---

## Sensory Description

The season health graph, in its default state, is **quiet and patient**. The full-scope trend line is a cool blue — the blue of clear water or calm sky, not vibrant or urgent. Each data point is a solid circle, slightly raised on hover with a subtle shadow animation (2px lift, 150ms ease-out). The connecting line is smooth, not jagged — even if the data jumps, the line interpolates with a slight curve (cubic bezier), giving the trend a feeling of organic evolution rather than mechanical sampling.

When the amber diamond appears for the first time, it materializes with a **warm pulse animation**: starting from a faint amber glow at the diamond's center, expanding outward and then fading, like a drop of warm light. The diamond itself settles into its hollow, stroke-only form. The effect is 400ms, non-repeating. It is saying: "something new has appeared; look here once, then move on."

The dashed amber line connecting filtered data points has a **subtle animation** when first drawn: the dashes appear sequentially from left to right, like the line being drawn by hand, over 600ms. This makes the "new series" feel like something being written, being argued — provisional and ongoing, not a fixed historical record.

The gap fill, when the dual-trend mode is activated, **breathes in** — the amber translucent band fades from 0% to 12% opacity over 800ms, as if the space between the lines is slowly revealing itself to exist. It is not jarring. It is illuminating.

When the player hovers over the gap fill, it brightens to 25% opacity and the tooltip reads: "Adversarial impact zone — this area represents the approximate coverage score that adversarial matches are contributing to your full-scope analysis. Narrowing gap = decreasing adversarial influence." The language is patient and explanatory, not alarming.

**The TikTok clip:** A timelapse of the dual-trend graph building over 3 months, showing the full-scope blue line staying stubbornly high (bad) while the amber dashed filtered trend sits low (good), with the amber gap fill widening gradually between them. The voiceover: "My career analysis said I had a 50% architecture failure rate for three months straight. My actual architecture failure rate was 17% the whole time. One player was poisoning my data." The visual — two lines diverging, the gap widening, the gap fill glowing amber — is the story. No narration needed; the chart tells it.

---

## Newly Discovered Aspects

These sub-questions emerged from designing the filtered trend graph in detail:

- **4.69e-i-c-i — Dual-grade display in season health header**: the season health header shows a letter grade computed from the full-scope coverage score. When adversarial-adjusted filtered data exists, should a second grade appear in parentheses — e.g., "C (B+ adversarial-adjusted)"? Exact format, color treatment, tooltip explaining the distinction, and conditions under which the second grade appears.

- **4.69e-i-c-ii — Filtered trend sparkline in campaign map unit profile card**: the Gauntlet/campaign map unit card (if one exists) shows a miniature sparkline from the Season Health dashboard. Does the miniature sparkline use full-scope only? Does it show both lines? At small sizes, the dual-series treatment may be unreadable; a single "best health" number may be the right summary.

- **4.69e-i-c-iii — Necropsy export formatting for dual-trend graphs**: when the player exports the Season Health graph as a PNG (for community sharing, discord discussion, post-season retrospective), does the export include both trend lines? Does it include the gap fill? Does it include a legend explaining that circles = full-scope and diamonds = filtered? The export format for the standard single-series graph versus the dual-series graph needs separate design.

- **4.69e-i-c-iv — Convergence moment annotation on the trend graph**: if the full-scope and filtered trend lines converge (their values become equal within a threshold), this means adversarial poisoning has been resolved — either the adversarial opponents were removed from the filter by the player or they stopped targeting the player. This convergence moment deserves a special annotation on the graph: a small ✓ mark where the lines meet, a one-line note "adversarial contribution eliminated," a brief celebration animation.

- **4.69e-i-c-v — Trend graph "projection mode"**: given the current trajectories of both the full-scope and filtered trend lines, project forward 3–5 runs and show dotted extensions indicating expected future values. "If you continue improving at this rate, your full-scope health should reach A tier in approximately 4 career analyses." The projection could also show the expected value if the player's adversarial situation changes (e.g., if VoidEater_Prime stops targeting them).

- **4.69e-i-c-vi — Minimum filtered data points for Series B display**: how many filtered analysis data points are needed before the dashed amber line appears? One data point is a marker, not a trend. Two is a line but not a trend. Three is the minimum for a meaningful slope. Should the graph show the first two as isolated diamonds and only draw the dashed connecting line once 3 or more exist?
