# Cross-Session Divergence Frequency as Architecture Health Metric

**Aspect:** 4.78 — Tracking what percentage of Fix Explorer sessions produce QUICK/THOROUGH divergence over time; a player whose divergence rate drops from 35% to 15% has configs generating cleaner causal chains; a config quality metric orthogonal to pass rate; interaction with 4.25 EDT trajectory and career stat dashboard.

**Parent:** 4.64 — Pre-ranking accuracy as displayed stat
**Siblings:** 4.25 — EDT trajectory as career progress metric; 4.63 — Player-configurable pre-ranking weights; 4.64 — Pre-ranking accuracy as displayed stat
**Related:** 4.61 — QUICK vs. THOROUGH explainer; 4.58 — Pre-ranking transparency panel; 4.62 — Agree-to-disagree result; 7.10 — Config necropsy as community artifact; 8.09 — Diagnostic layer as teaching arc

---

## The Core Problem

Pre-ranking accuracy (4.64) tells a player how often QUICK and THOROUGH agreed in recent sessions. That is a snapshot — a 30-session rolling average displayed as a percentage. Divergence frequency as an architecture health metric is something different: it is the **longitudinal shape** of that divergence rate across a player's entire career, tracked per config version, correlated with architectural changes, and displayed as a first-class trajectory alongside EDT and win rate.

The distinction matters. Pre-ranking accuracy says "right now, your heuristic agrees with the exhaustive search 71% of the time." Divergence frequency trajectory says "six months ago, your configs produced divergence in 38% of sessions; three months ago, 27%; today, 14%. Your architectures are becoming more legible to diagnostic tools because they are becoming more legible, period."

This is not a stat about the pre-ranking heuristic's quality. It is a stat about the **causal clarity of the player's architecture.** A config where every failure has one unambiguous root cause will produce near-zero divergence: QUICK finds the obvious suspect, THOROUGH confirms it, done. A config where failures propagate through tangled hook chains, shared buffers, and cascading attention conflicts will produce high divergence: the pre-ranking cannot distinguish the symptom from the cause because the architecture itself does not distinguish them.

Divergence frequency trajectory is therefore an **architecture health metric orthogonal to both win rate and EDT.** A player can have high win rate (the config works), high EDT (the matches are contested), and high divergence frequency (the config is a tangled mess that happens to work). That player is fragile — one meta shift and the tangle unravels, and they will not be able to diagnose why because the Fix Explorer cannot isolate the root cause cleanly.

The inverse is equally revealing: low win rate, low EDT, low divergence frequency. This player has a clean, modular architecture that is easy to diagnose — it is just not competitive yet. The architectural foundation is healthy; the tactical content needs work. This player is in a better position than the high-win-rate tangle, because they can iterate rapidly using QUICK mode with confidence.

**The core design question:** How does the game surface divergence frequency trajectory so that it communicates architectural health — not diagnostic tool performance — and integrates naturally with the existing career stat dashboard alongside EDT trajectory (4.25) and win rate?

---

## The Design

### What Gets Tracked

Every Fix Explorer session where the player runs both QUICK and THOROUGH produces a binary outcome: **convergence** (same element, same fix) or **divergence** (different element or same element but different fix magnitude beyond a threshold). This binary is already computed for the pre-ranking accuracy stat (4.64). What 4.78 adds is the **time series**.

The system stores, per session:
- Session ID and timestamp
- Config version hash at time of session
- Convergence/divergence result (binary)
- If divergent: the divergence scenario type (symptom-before-cause, recency bias, volatility false signal, magnitude gap — the four types from 4.61)
- The QUICK rank of the THOROUGH minimum fix (the "how far off was QUICK?" metric)

From this data, the system computes:
- **Rolling divergence rate**: percentage of last N sessions that diverged (default N=30, configurable to 15/50/90)
- **Divergence rate trajectory**: the slope of the rolling divergence rate over a selectable time window
- **Per-config-version divergence rate**: the rate computed only for sessions using a specific config version, enabling before/after comparison when the player modifies their config
- **Divergence type distribution**: the breakdown of which divergence scenarios dominate (is this player mostly hitting symptom-before-cause, or mostly recency bias?)

### Where It Lives

The divergence frequency trajectory appears in three surfaces:

**1. The Architecture Health Panel (Career Dashboard)**

A dedicated section of the career dashboard titled "CONFIG CLARITY" — distinct from win rate, distinct from EDT, distinct from pre-ranking accuracy. The panel shows:

```
CONFIG CLARITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Divergence rate (30):    14%    ▼ from 31%
Trend:                   ▼ –0.6pp/session
Dominant type:           Magnitude gap (60%)
Config version:          v12.1 (last 8 sessions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[▁▂▃▅▇█▇▅▃▂▁▁▁▁░░░░░░░░░░░░░░░░]  ← 90-session sparkline
  ^config v9    ^v10   ^v11  ^v12.1
```

The sparkline is rendered as a **bar chart in miniature** — each session is a thin vertical bar, filled (diverged) or empty (converged). The rolling average is overlaid as a smooth curve. The visual effect is a barcode-like strip where dense clusters of filled bars represent high-divergence periods and sparse bars represent clean stretches. Config version boundaries are marked as small vertical ticks below the sparkline, labeled with the version number.

The color gradient of the sparkline curve runs inverted from the EDT trajectory: **low divergence is green** (healthy, clean architecture), **high divergence is amber-to-red** (tangled, hard to diagnose). This inversion is deliberate — in divergence frequency, lower is better, which is the opposite of EDT where higher is better. The color vocabulary remains consistent: green = good, red = concerning.

**2. Post-Match Debrief Summary (Compact)**

After the two-act debrief, the summary panel that currently shows WIN RATE / eEDT / GAUNTLET RANK gains an optional fourth column:

```
WIN RATE (30)   eEDT (30)   DIV RATE (30)   GAUNTLET RANK
    58%           0.47          14%              #812
                 ↑ 0.06       ↓ 3pp
```

The divergence rate is shown in the same compact format as eEDT — a number, a delta arrow, and the direction of the delta. Downward arrow on divergence rate is green (improving). Upward arrow is amber (more divergence, architecturally concerning).

This column only appears after 30 qualifying sessions (sessions where both QUICK and THOROUGH were run). Before that threshold, the column space is absent — the three-column layout persists until the fourth column unlocks.

**3. Config Workshop Publish Card**

When a player publishes a config to the workshop, the publish card shows divergence rate alongside eEDT and win rate. This lets browsing players assess not just "does this config win?" and "does this config play long games?" but "is this config diagnostically clean?" A config with 8% divergence rate is architecturally modular and easy to iterate on. A config with 40% divergence rate is a black box that happens to work.

### The Trajectory View (Full Screen)

Clicking on the CONFIG CLARITY panel in the career dashboard opens the full trajectory view. This is a dedicated chart occupying the center of the screen, showing divergence rate over the player's entire career:

```
DIVERGENCE FREQUENCY TRAJECTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
100%│
    │ ██
    │ ████
 50%│ ██████                              ← "the tangle" (v4-v6)
    │ ████████
    │ ██████████████
 25%│ ██████████████████
    │ ████████████████████████
    │ ██████████████████████████████
  0%│───────────────────────────────────────────────
    Session 1        50        100       150       200
         v1  v2  v3  v4 v5 v6  v7  v8  v9 v10 v11 v12
```

The trajectory is rendered as a filled area chart — the area beneath the curve is filled with a gradient from green (near 0%) through amber through red (near 50%+). The filled area creates a visual metaphor: a thick, red region is a period of architectural tangle; a thin, green ribbon is a period of clean clarity. Config version boundaries are drawn as thin vertical lines with version labels at the bottom.

**Overlay toggle:** The player can toggle an EDT trajectory overlay onto the same chart. When active, the EDT curve appears as a thin line overlaid on the divergence area chart. This creates the composite view — the player can see periods where EDT was climbing (architectural improvement in match quality) while divergence was also climbing (architectural improvement in match quality at the cost of diagnostic clarity). The two trajectories tell a richer story together than either tells alone.

**Zoom and brush:** The player can drag to select a time range and zoom in. Within a zoomed view, individual session bars become visible (the barcode effect from the compact sparkline). Hovering over a single session bar shows a tooltip with the session details: mission name, pass rate, QUICK result, THOROUGH result, divergence type if applicable.

---

## Player Journeys

### Journey 1: Tomás, 29, Backend Engineer, 180 Gauntlet Matches

**Context:** Tomás has been playing Robot Uprising for four months. He's a methodical player — he tracks his own stats in a spreadsheet outside the game. Win rate 64%. eEDT 0.43. He uses QUICK mode for routine debriefs and runs THOROUGH when the QUICK result "feels wrong." He has never paid attention to his divergence rate because the metric doesn't exist yet.

**Minute 0:00 — The Unlock**

Tomás opens his career dashboard after his 32nd qualifying session (both modes run). A new section has appeared in the dashboard, below the EDT trajectory panel:

```
CONFIG CLARITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Divergence rate (30):    34%
Trend:                   → stable
Dominant type:           Symptom-before-cause (55%)
```

The sparkline is short — only 32 bars — but already shows a pattern. Dense filled bars throughout. The rolling curve sits flat at 34%, colored amber. A small "NEW" badge pulses once in the upper-right corner of the panel, then fades.

Tomás reads "34%" and his first instinct is comparison. He looks for a benchmark. A tooltip on hover:

```
Typical divergence rate: 20–35%
Your rate of 34% is within the typical range but toward the high end.
High divergence often indicates complex inter-agent signal routing.
```

He is not alarmed. 34% is within range. But the "dominant type: symptom-before-cause" line catches his eye.

**Minute 1:30 — The Dominant Type Drill-Down**

He clicks on "Symptom-before-cause (55%)." A small panel expands below:

```
YOUR DIVERGENCE BREAKDOWN (last 30 qualifying sessions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Symptom-before-cause:  ██████████░░░░░░░░░░  55%  (6/11 divergences)
Recency bias:          ████░░░░░░░░░░░░░░░░  18%  (2/11 divergences)
Volatility false sig:  ████░░░░░░░░░░░░░░░░  18%  (2/11 divergences)
Magnitude gap:         ██░░░░░░░░░░░░░░░░░░   9%  (1/11 divergences)
```

Each bar is color-coded: symptom-before-cause in a dusty rose, recency bias in teal, volatility false signal in violet, magnitude gap in pale grey. The colors match the divergence scenario labels used in the 4.61 explainer view.

Tomás recognizes the pattern immediately. More than half his divergences are symptom-before-cause — the pre-ranking finds the reactive element, not the upstream failure. He knows what this means in software terms: his architecture has downstream components that are loud during failure (high activity at the pivot tick) while the actual root cause is a quieter upstream component.

**Minute 3:00 — The Architecture Session**

He opens his config in the Plan screen. He identifies three relay agents that act as intermediaries between his scout cluster and his defense cluster. When the scout cluster fails, all three relays activate simultaneously — they are loud, visible, present at the pivot tick. The pre-ranking heuristic sees three prime suspects. But the actual root cause is almost always the scout's attention filter, which is upstream, quiet, and produces a single miscalculated output that cascades through the relays.

He refactors. He consolidates the three relay agents into one relay with a wider context buffer. The single relay will still activate during failures, but now it is one suspect instead of three. The pre-ranking heuristic will have a cleaner signal.

**Minute 8:00 — Five Sessions Later**

Tomás has played five sessions with the consolidated relay. He opens the career dashboard. The sparkline has grown by five bars on the right side. Four of them are empty (convergence). One is filled.

```
Divergence rate (30):    28%    ▼ from 34%
Trend:                   ▼ –1.2pp/session
Dominant type:           Recency bias (40%)
```

The rate dropped. The dominant type shifted — symptom-before-cause is no longer dominant because the relay consolidation eliminated the noisy downstream components. The remaining divergences are now mostly recency bias (the pre-ranking overweighting his recent config changes).

Tomás grins. The consolidation worked — not because his win rate changed (it didn't, still 64%), not because his EDT moved (it stayed at 0.43), but because the Fix Explorer now finds the right answer faster. His architecture became more legible to the diagnostic tool because it became more legible, period.

**Minute 10:00 — The Overlay**

He toggles the EDT trajectory overlay onto the divergence chart. The two curves paint a clear picture: EDT has been flat at 0.43 for two months. Divergence rate had a visible drop in the last five sessions. The architectural change improved diagnostic clarity without affecting match quality. He takes a screenshot and posts it to the community forum with the caption: "Relay consolidation. Win rate flat. EDT flat. Divergence rate dropped 6 points. Cleaner configs, cleaner diagnosis."

**UI Annotations:**
- CONFIG CLARITY panel: positioned below the EDT trajectory panel on the career dashboard; separated by a 2px horizontal rule in the dashboard's muted border color (charcoal, `#2a2d2e`)
- "NEW" badge: appears once on first qualifying session; 400ms pulse animation using the amber glow keyframe shared with the eEDT unlock; badge disappears permanently after the player hovers over the panel
- Divergence breakdown bars: horizontal bars in the expanded drill-down; each bar animated from left to right over 300ms on expand; bar segments are rounded-cap rectangles with 2px corner radius
- Overlay toggle: small toggle switch in the upper-right of the full trajectory view labeled "EDT overlay"; when toggled, the EDT curve fades in over 400ms with a slight scale-up animation from 0.95 to 1.0

---

### Journey 2: Mei, 22, Art Student, 50 Gauntlet Matches

**Context:** Mei plays Robot Uprising for the aesthetic experience. She loves the sealed watch phase — the anxiety of not knowing, the reveal of the gold diamond. She uses QUICK mode because it is fast. She has only run THOROUGH mode 31 times, mostly early in her career when she was exploring all the buttons. She does not think of herself as a "diagnostic" player. She builds configs intuitively, by feel.

**Minute 0:00 — The Number Appears**

Mei finishes a session and the post-match summary shows a new fourth column:

```
WIN RATE (30)   eEDT (30)   DIV RATE (30)   GAUNTLET RANK
    52%           0.38          38%              #1,204
                 ↑ 0.02       → 0pp
```

She notices "38%" but does not know what it means. She hovers. The tooltip:

```
Divergence rate: In 38% of your recent Fix Explorer sessions,
QUICK and THOROUGH found different fixes.
Lower = your config has clearer cause-and-effect.
Higher = your config has tangled signal chains.
```

She reads "tangled signal chains." She likes the phrase. She does not act on it.

**Minute 0:00 (Session 67) — The Trend Becomes Visible**

Three weeks later, after iterating on her config through fifteen more sessions, Mei opens the career dashboard for the first time. The CONFIG CLARITY sparkline catches her attention — it is a strip of amber and red, densely packed with filled bars.

```
Divergence rate (30):    41%    ↑ from 38%
Trend:                   ↑ +0.3pp/session
```

The sparkline is rising. The color has shifted from amber to amber-red. She clicks on the full trajectory view.

The area chart fills the screen. Her divergence history is a rising slope — starting at 25% when she first had enough data, climbing steadily to 41% over 35 sessions. The filled area beneath the curve is orange at the left edge, deepening toward red at the right.

She does not know what to do with this information. She closes the chart.

**Minute 0:00 (Session 74) — The Community Encounter**

Mei is browsing the config workshop. She finds a config from a top-50 player. The publish card shows:

```
"Quiet Cathedral" by AxisNull
Win rate: 71%  ·  eEDT: 0.52  ·  Div rate: 9%
```

9%. She looks at her own: 41%. The gap is enormous. She opens the config details. AxisNull's config has six agents, three hooks, no shared buffers. Her config has eight agents, eleven hooks, and two shared context buffers.

She reads a community comment on the config page: "9% div rate is insane. This config has almost no causal ambiguity. Every failure points at one element."

Something clicks. Her configs are tangled because she kept adding hooks between agents whenever she needed agents to coordinate. Each hook added another potential suspect during failures. AxisNull's config achieves coordination through buffer design instead of hook proliferation — fewer connections, cleaner signals.

**Minute 3:00 — The Experiment**

Mei does not refactor her entire config. Instead she removes three hooks that she suspects are redundant — hooks she added months ago that she can no longer remember the purpose of. She plays four sessions.

```
Divergence rate (30):    35%    ▼ from 41%
```

Six percentage points. The sparkline shows four empty bars on the right edge. She removed three hooks and the divergence rate dropped measurably. The architecture became cleaner not through a principled refactor but through **pruning forgotten connections.**

She does not fully understand why it worked. But the number moved in the right direction, and the sparkline shows it.

**UI Annotations:**
- Post-match fourth column: appears flush-right of the existing three columns; column header "DIV RATE (30)" in the same 9px uppercase tracking as the other column headers; the percentage is rendered in the same monospace font as win rate
- Workshop publish card: divergence rate appears after eEDT, separated by a centered dot (·); if the config has fewer than 30 qualifying sessions, the stat is omitted (no provisional display on published configs)
- Full trajectory area chart: rendered with a subtle paper-texture background matching the debrief screen's aesthetic; the gradient fill uses the same amber-to-red-to-green palette as the eEDT sparkline but inverted; chart gridlines are 1px dashed lines in `#3a3d3e` at 25% intervals

---

### Journey 3: Kenji, 35, Systems Analyst, 400 Gauntlet Matches

**Context:** Kenji is a veteran. He has been playing since early access. He tracks divergence rate manually — he has a column in his personal spreadsheet labeled "Q/T match?" with Y/N entries for every session. He has wanted a first-class divergence trajectory for months. He has posted about it in the community forum three times.

**Minute 0:00 — The Feature He Asked For**

Kenji opens the career dashboard after the update. The CONFIG CLARITY panel is there. He exhales.

```
Divergence rate (30):    12%
Trend:                   → stable (±1pp over 90 sessions)
Dominant type:           Magnitude gap (75%)
```

12%. He already knew this from his spreadsheet. But seeing it in the game, with the sparkline, with the trend, with the dominant type breakdown — the data has weight now.

He clicks into the full trajectory view. The area chart stretches back 400 sessions. The story of his career is painted in color:

Sessions 1-50: a thick red band, divergence at 45-50%. He was new. His configs were chaotic. Every failure pointed at five suspects.

Sessions 50-120: a steep decline from red through amber to yellow-green. He discovered modular design. He separated his agents into functional clusters with clean interfaces. Divergence dropped from 45% to 22%.

Sessions 120-250: a plateau at 18-22%, amber. He was iterating within a stable architectural paradigm. The divergences that remained were structural — they reflected genuine causal ambiguity in his relay-chain design, not architectural sloppiness.

Sessions 250-320: a second decline, from 22% to 14%. He rebuilt his relay chain with dedicated context buffers per agent instead of shared buffers. The shared buffers had been the primary source of symptom-before-cause divergences — multiple agents reading from the same buffer meant the heuristic could not determine which reader was the root cause.

Sessions 320-400: stable at 12-14%, green. The remaining divergences are almost entirely magnitude gap — QUICK and THOROUGH find the same element but different fix sizes. The architecture is so clean that when they disagree, it is only about dosage, not about diagnosis.

**Minute 2:00 — The EDT Overlay**

Kenji toggles the EDT overlay. The two curves tell a story he has intuited but never visualized:

EDT rose from 0.20 to 0.45 during sessions 50-120 — the same period divergence was falling. Architectural modularization improved both diagnostic clarity AND match depth simultaneously. The curves moved in opposite directions during the same architectural phase.

Then EDT plateaued at 0.45-0.50 while divergence continued to drop from 22% to 14% during sessions 120-320. Diagnostic clarity kept improving after match depth stabilized. The two metrics decoupled — divergence rate continued to respond to architectural refinement that EDT could no longer detect.

He screenshots this. He has been arguing in the forums that divergence rate measures a different axis of improvement than EDT. The overlay chart proves it visually: two curves, correlated early, decoupled late.

**Minute 5:00 — The Config Version Drill-Down**

Kenji clicks on the config version boundary between v8 and v9 (session 250, the shared-buffer removal). A comparison panel appears:

```
CONFIG VERSION COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    v8 (sessions 200-249)    v9 (sessions 250-299)
Divergence rate:    21%                      15%
Dominant type:      Symptom-before-cause     Magnitude gap
Avg QUICK rank of
  THOROUGH minimum: 3.8                      1.4
Win rate:           66%                      65%
eEDT:              0.48                      0.49
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Win rate dropped one point. EDT was unchanged. Divergence rate dropped six points and the dominant type shifted from symptom-before-cause to magnitude gap. The average QUICK rank of the THOROUGH minimum dropped from 3.8 to 1.4 — meaning even when QUICK was "wrong," it was only off by one rank position.

Kenji prepares a config necropsy post. The config version comparison table is the centerpiece. He titles it: "How I dropped divergence from 21% to 15% by removing shared buffers."

**Minute 8:00 — The Community Ripple**

The necropsy post generates 47 upvotes and a thread about shared buffers as a diagnostic anti-pattern. Three other veteran players reply with their own divergence trajectory screenshots showing the same pattern: shared buffers → high symptom-before-cause divergence → refactor to dedicated buffers → divergence drops, dominant type shifts to magnitude gap.

A new piece of community knowledge crystallizes: **shared context buffers are an architectural choice with a divergence cost.** They enable powerful multi-agent coordination but they make the Fix Explorer less reliable. The divergence rate metric made this tradeoff visible and quantifiable.

**UI Annotations:**
- Config version comparison panel: slides in from the right when a version boundary is clicked on the trajectory chart; 450ms ease-out animation; the panel has a frosted-glass background over the chart beneath it
- Version boundary markers: small triangular ticks below the x-axis of the trajectory chart; hover reveals version number and session range; clicking opens the comparison panel
- Necropsy export: a small "Export as image" button in the upper-right of the full trajectory view; exports the chart as a PNG with the player's handle, current divergence rate, and date watermarked in the bottom-right corner; the export includes whatever overlays are currently active (EDT, version boundaries)

---

## Strengths

**Measures architectural quality that no other metric captures.** Win rate measures competitive performance. EDT measures match depth. Pre-ranking accuracy measures diagnostic tool reliability. Divergence frequency trajectory measures **causal clarity** — the degree to which the player's architecture has unambiguous failure modes. This is a genuinely new axis. A player can have perfect win rate, perfect EDT, and terrible divergence rate, and that is meaningful: they have a fragile, tangled config that is winning by luck or brute force, not by design.

**Creates a feedback loop for architectural cleanliness.** Without divergence rate, a player has no quantitative incentive to simplify their architecture. Win rate rewards whatever works. EDT rewards configs that fight long. Divergence rate rewards configs that fail clearly — configs where, when something goes wrong, the diagnostic tools can identify exactly what went wrong. This incentive pushes the player toward the same architectural principles that make real software systems maintainable: modularity, single responsibility, clean interfaces.

**Transforms the Fix Explorer from a tool into a mirror.** When divergence rate is high, the Fix Explorer is not "broken" — the player's architecture is opaque. The metric reframes diagnostic difficulty as an architectural property, not a tool limitation. Players stop blaming the pre-ranking heuristic and start examining their own design. This is a profound teaching moment: the diagnostic tool is only as good as the system it is diagnosing.

**Provides temporal resolution that pre-ranking accuracy cannot.** The 4.64 accuracy stat is a single number. The 4.78 trajectory is a curve over time. Curves tell stories. The shapes players see in their divergence trajectory — the steep drop after a refactor, the plateau during a stable period, the slow climb during a hook-accumulation phase — become narrative landmarks in their career.

**Enables community knowledge production.** Config necropsy posts with divergence trajectory screenshots generate architectural discussion that pure win-rate analysis cannot. "I removed shared buffers and my divergence rate dropped 6 points" is a concrete, reproducible, testable claim. The metric creates a vocabulary for talking about architectural quality.

---

## Weaknesses

**Requires running both QUICK and THOROUGH to generate data.** Players who use only QUICK mode never produce divergence data points. The metric is invisible to them. This creates a participation gate: the divergence trajectory only becomes meaningful for players who have a habit of running both modes. Players who rely on QUICK exclusively — potentially the majority — will see "collecting data" indefinitely.

**Can incentivize oversimplification.** A player chasing a low divergence rate might strip their config down to three agents with zero hooks — producing a 2% divergence rate that is architecturally pristine but competitively useless. The metric does not distinguish between "low divergence because the architecture is clean" and "low divergence because the architecture is trivially simple." Mitigation: always display divergence rate alongside win rate and EDT. A 2% divergence rate at 35% win rate is not health — it is poverty.

**The "dominant type" breakdown may be too granular for casual players.** The four divergence scenarios (symptom-before-cause, recency bias, volatility false signal, magnitude gap) require significant understanding of the pre-ranking heuristic to interpret. A player who does not know what "symptom-before-cause" means will not benefit from knowing it accounts for 55% of their divergences. The breakdown should be available but not foregrounded — perhaps behind one click in an expandable section.

**Divergence rate is sensitive to mission type, not just config quality.** Some missions produce inherently more divergence because they have complex failure scenarios with multiple interacting causes. A player's divergence rate will fluctuate based on what missions they play, not just how clean their architecture is. Mitigation: track a "mission-adjusted divergence rate" that normalizes against the community baseline divergence rate for each mission.

**The metric inverts the natural "higher is better" instinct.** Win rate: higher is better. EDT: higher is better (contested matches). Divergence rate: lower is better. Players accustomed to the first two metrics may initially misread a high divergence rate as good. The inverted color scheme (green for low, red for high) mitigates this, but the cognitive friction is real.

---

## Interaction Effects

**With 4.25 (EDT trajectory):** The dual-overlay view — divergence trajectory and EDT trajectory on the same chart — is the highest-value interaction. During early career phases, the two curves often move in opposite directions (EDT rising, divergence falling) as the player learns modular design. During mid-career, they decouple — divergence continues to improve after EDT plateaus. During late career, both may plateau at healthy levels, and the player's attention shifts to other metrics. The two curves together tell a three-act career story that neither tells alone.

**With 4.61 (QUICK vs. THOROUGH explainer):** The divergence frequency metric gives the 4.61 explainer a longitudinal context. When a divergence occurs and the explainer shows "this was a symptom-before-cause divergence," the player can now check: "is symptom-before-cause my dominant type? Is this a pattern or an anomaly?" The single-session explainer gains diagnostic power from the career-length frequency tracking.

**With 4.63 (Pre-ranking configurable weights):** A player who identifies that their dominant divergence type is "recency bias" can dial down the recency weight in the pre-ranking config (4.63) and observe whether divergence rate drops. This creates a feedback loop between two late-game systems: weight configuration and divergence tracking. The weight config is the intervention; the divergence trajectory is the measurement. Together they teach the player to tune diagnostic tools to their specific architectural style.

**With 4.64 (Pre-ranking accuracy stat):** Divergence rate is the complement of pre-ranking accuracy. Accuracy = 100% - divergence rate (approximately, with nuance around magnitude-gap divergences that some accuracy definitions might still count as "matches"). The two metrics should be displayed in proximity but framed differently: accuracy is tool-centric ("how good is the heuristic for your config?"), divergence frequency is architecture-centric ("how tangled is your config?"). Same data, different frame, different insight.

**With 7.10 (Config necropsy as community artifact):** The divergence trajectory chart — especially with config version boundaries and the comparison panel — becomes the signature artifact of high-quality config necropsies. Win rate and EDT tell a performance story. Divergence trajectory tells an architecture story. The best necropsies will show all three.

---

## Comparable Games and Media

**Chess.com Accuracy + Game Review History:** Chess.com stores per-game accuracy and shows trends over time. A player can view their last 100 games' accuracy as a list or chart and identify periods of improvement or decline. The divergence frequency trajectory is structurally identical: a per-session binary (match/diverge) tracked over time, displayed as a trend, used to identify architectural inflection points. The key lesson from Chess.com: **the trend view is more engaging than the number.** Players check their accuracy trend more often than their current accuracy. The shape of the curve is the reward.

**Factorio circuit network complexity metrics (community tools):** Factorio players who build complex circuit networks use community tools to measure "network complexity" — the number of signal connections, the depth of cascading logic, the degree of cross-network coupling. These metrics are not in the base game but are beloved by advanced players because they quantify a quality that is otherwise felt but not measured: "is this elegant or is this spaghetti?" Divergence rate serves the same function in Robot Uprising. It quantifies the spaghetti. It makes the felt quality of architectural clarity into a number.

**Slay the Spire deck thinning as diagnostic clarity analogue:** In Slay the Spire, a smaller deck draws key cards more reliably. Deck thinning is not about power — it is about predictability. A 15-card deck is easier to reason about than a 35-card deck. The same principle maps to divergence rate: a config with fewer inter-agent hooks is easier for the pre-ranking heuristic to reason about. Divergence rate is the architectural equivalent of deck thickness. Low divergence = thin deck = clean draws = diagnostic predictability.

**Software engineering code coverage and cyclomatic complexity dashboards:** CI/CD dashboards that show code coverage trending over time, or cyclomatic complexity per module, provide the closest real-world analogue. Engineers check these dashboards not because the numbers directly affect users but because they are leading indicators of maintainability. A module whose complexity is rising will eventually produce bugs that are hard to diagnose. Divergence rate is the Robot Uprising equivalent: a leading indicator of diagnostic difficulty, tracked longitudinally, used to catch architectural decay before it becomes a competitive problem.

---

## Sensory Description

The CONFIG CLARITY sparkline is a **barcode.** Thirty thin vertical bars, each 2px wide, spaced 1px apart, laid out left to right. Filled bars are solid — colored in the inverted health gradient: the filled bars representing divergence sessions are a warm amber at moderate rates, deepening to a dusty terracotta-red at high rates. Empty bars (convergence sessions) are rendered as thin hairlines in the background color, barely visible, negative space. The rolling average curve is overlaid as a 1.5px line in a slightly lighter shade of whatever the current rate's color is, with a 0.5px ambient shadow beneath it that makes it float above the barcode field.

The barcode aesthetic is deliberate. It looks like a diagnostic readout — something you would see on an oscilloscope or a system health monitor. It does not look like a chart. It looks like a signal. The filled bars are events; the empty bars are silence. A healthy architecture produces a barcode that is mostly silence with occasional events. A tangled architecture produces a barcode that is mostly events with occasional silence. The visual density of the barcode communicates health at a glance, before the player reads a single number.

When the full trajectory view opens, the area chart fills the screen with a slow 600ms fade-in. The gradient fill renders from left to right over 800ms — the player watches their architectural history paint itself across the screen, from whatever color the early career was (usually red-amber) through the transitions to the current state. The effect is a time-lapse of architectural evolution. The sound design: a low, continuous tone that shifts pitch as the gradient renders — lower pitch for red regions, rising to a clear mid-tone for green regions. Not music. A frequency. The sound of a system being measured.

Config version boundary markers appear as thin vertical lines that pulse once when the rendering reaches them — a brief 200ms brightening in white, then fade to the muted charcoal of the chart gridlines. Each pulse is accompanied by a soft, dry click — the same click used when config version increments in the Plan screen. The clicks anchor the visual timeline to the player's memory of their config changes. Click. That was when I removed the shared buffer. Click. That was when I added the relay chain.

The divergence type breakdown bars in the drill-down panel use the same color vocabulary as the 4.61 explainer: dusty rose for symptom-before-cause, teal for recency bias, soft violet for volatility false signal, pale grey for magnitude gap. The bars animate in from left to right on expand, each bar sliding out 50ms after the previous one, creating a staggered cascade. The total animation time is approximately 250ms — fast enough to feel responsive, slow enough for the eye to register each bar individually. No sound on the breakdown — the silence is the contrast to the trajectory view's tonal rendering. The breakdown is a quiet, analytical space.

The overlay toggle for EDT trajectory produces a distinctive interaction: when toggled on, the EDT curve materializes as a thin line that descends from the top of the chart and settles into its data path over 400ms, like a thread being laid onto a surface. The line is rendered in the EDT trajectory's own color vocabulary (the red-amber-green-violet gradient from 4.25), creating a visual contrast with the divergence area chart's inverted gradient beneath it. Two color systems occupying the same space, each with its own meaning, layered but legible. The moment the overlay settles, a brief harmonic tone sounds — two notes, the lower note matching the divergence area's pitch register and the higher note matching the EDT curve's current position. The harmony or dissonance of the two notes communicates whether the two metrics are moving together or apart.

---

## Discovered New Aspects

- **4.79 — Mission-adjusted divergence rate:** Normalizing divergence rate against the community baseline per mission, so players can distinguish "my architecture is tangled" from "this mission is inherently ambiguous." Requires population-level divergence data per mission, surfaced as a "your rate vs. expected rate" comparison.
- **4.80 — Divergence type progression as career arc signal:** Tracking how a player's dominant divergence type shifts over their career — from symptom-before-cause (early, tangled) to magnitude-gap (late, clean). The type progression is itself a metric of architectural maturity, distinct from the rate.
- **4.81 — Config version A/B comparison panel as refactoring validation tool:** The comparison panel between config versions, showing divergence rate delta alongside win rate and EDT deltas, as a dedicated tool for validating architectural refactors. Could become a first-class feature in the Plan screen, not just the career dashboard.
- **4.82 — Divergence rate as matchmaking signal:** Using a player's divergence rate as an input to matchmaking — pairing high-divergence players against other high-divergence players to create "messy" brackets, and low-divergence players against other low-divergence players to create "clean" brackets. The matchmaking pool stratification could produce qualitatively different Gauntlet experiences.
- **7.16 — Community divergence rate distributions as meta-health signal:** Tracking the population-wide divergence rate distribution per season. A season where the community average divergence rate is rising may indicate that the meta rewards tangled, over-hooked configs — a design signal that the game's incentive structure needs adjustment.
