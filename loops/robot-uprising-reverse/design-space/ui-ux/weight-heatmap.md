# The Kiln Grid — Per-Mission-Type Weight Performance Heatmap in Career Stats

**Aspect:** 4.92 — Per-mission-type weight performance heatmap in career stats: a career stats panel showing which weight configurations produced highest QUICK accuracy for each mission type (wave 1 relay missions, wave 3 armor missions, etc.); color-coded grid: rows = mission types, columns = presets; teaches that heuristic configuration is context-dependent, not globally optimal.

**Parent:** 4.63 — Player-configurable pre-ranking weights
**Siblings:** 4.88 — Adaptive weight suggestion from divergence history; 4.89 — Weight preset import/export as config string; 4.90 — Weight configuration persistence across campaign chapters; 4.91 — Visual weight interpolation animation
**Prerequisites:** Player must have (a) unlocked configurable weights (4.63 unlock gate — 3+ divergence events), (b) completed at least 4 missions spanning at least 2 mission types, and (c) accumulated 15+ sessions with both QUICK and THOROUGH runs, so the grid has meaningful data density.
**Related:** 4.64 — Pre-ranking accuracy as displayed stat; 4.58 — Pre-ranking transparency panel; 4.94 — Committed-to-QUICK accuracy; 4.96 — Accuracy-vs.-complexity scatter plot; 5.08 — Mission variety taxonomy; 5.14e — Fidelity spoofing campaign arc; 8.09 — Diagnostic layer as teaching arc

---

## The Name: "Kiln Grid"

A kiln fires clay at different temperatures to produce different results. The same clay in a different kiln yields a different vessel. The same weight preset in a different mission type yields a different accuracy. The Kiln Grid is the instrument that reveals this: a two-dimensional matrix where the vertical axis is the heat — the mission type, the environment — and the horizontal axis is the clay — the preset, the configuration. Each cell is the fired result: how well did this configuration survive in that environment? The name evokes transformation through context, not quality in isolation. There is no "best clay." There is only "best clay for this kiln."

---

## The Core Concept

The ten campaign missions span Philippine provinces and fall into distinct mission types: relay-chain missions where information must traverse long scout-to-striker paths across the Cordillera highlands; armor-push missions where concentrated force must be routed through narrow Visayan straits; factory cascade missions where one production error in a Batangas industrial complex ripples through interconnected agents; hybrid siege missions where Mindanao's dense terrain demands both relay coordination and direct combat. Each mission type stresses different aspects of the player's diagnostic heuristic.

A weight configuration that thrives on relay missions — where the minimum fix is almost always the element that *pivoted* most dramatically during signal routing — will underperform on factory cascade missions, where the minimum fix is typically the element with the highest *volatility* as production errors oscillate through feedback loops. The player who discovers this through painful trial and error across 50 sessions could instead discover it in a single glance at the Kiln Grid.

The grid's rows are mission types, not individual missions. This is the critical distinction from a raw mission-by-mission heatmap. Grouping by type collapses the ten missions into four to six rows — relay, armor, factory, hybrid, and possibly escalation variants — each row aggregating accuracy data across every mission of that type the player has attempted. The columns are the player's saved presets plus built-in reference presets. Each cell glows from deep indigo (0% QUICK accuracy) through electric cyan (50%) to molten gold (100%), and the player scans the grid for patterns that span not missions but *categories* of missions.

The lesson is categorical, not episodic. "Pivot-First works on Mission 3" is a fact. "Pivot-First works on relay missions" is wisdom. The Kiln Grid teaches wisdom.

### What Each Cell Contains

Each cell represents a (mission-type, weight-configuration) pair. The accuracy value is: across all sessions where the player attempted any mission of this type with this weight configuration active, what percentage of QUICK #1 results matched the THOROUGH minimum fix?

If the player has played three relay missions (M1, M2, M4) with the "Pivot-First" preset across 12 total sessions, and QUICK matched THOROUGH in 10 of those sessions, the cell reads 83%. The denominator is sessions, not missions. A player who replayed M2 eight times with Pivot-First contributes eight data points to the relay row, not one.

Counterfactual accuracy fills cells the player has never directly experienced. For every session the player has completed, the system retroactively computes what accuracy alternative weight configurations would have achieved — a lightweight reranking of stored pre-ranking scores under different weight values. Counterfactual cells carry a subtle diagonal hatch pattern overlaid on their color fill, distinguishing simulation from observation.

### The Row Axis: Mission Type Taxonomy

The rows are derived from the mission variety taxonomy (5.08):

| Row Label | Missions | Diagnostic Signature |
|-----------|----------|---------------------|
| Relay Chain | M1, M2, M4 | Pivot-dominant — the minimum fix is usually the element that changed direction most during signal routing |
| Armor Push | M3, M6 | Recency-dominant — the minimum fix is usually the most recent configuration change, because armor pushes are reactive |
| Factory Cascade | M5, M8 | Volatility-dominant — the minimum fix is the element oscillating most during production feedback loops |
| Hybrid Siege | M7, M9 | Mixed — no single weight dimension dominates; the best preset varies by the specific siege phase |
| Escalation | M10 | Adversarial — the enemy actively spoofs signals (5.14e), making all weight dimensions unreliable in different ways |

The player does not see these diagnostic signatures at first. The signatures are the *conclusion* the Kiln Grid teaches the player to draw. A player who stares at the grid and notices "Pivot-First is gold on the top two rows but indigo on the middle row" is deriving the relay-vs-factory distinction from their own data, through color, without being told.

### The Column Axis: Preset Library

Columns represent the player's saved presets and built-in reference presets:

1. **Built-in presets** — Balanced (PA:33, R:33, V:33), Pivot-First (PA:100, R:0, V:0), Fresh-Changes (PA:0, R:100, V:0), Noise-Hunter (PA:0, R:0, V:100). These four columns are always present, providing anchors and reference points.
2. **Player-created presets** — every named preset from the player's library (4.63/4.89), ordered by creation date. A player with six custom presets adds six columns.
3. **Adaptive suggestion** — if 4.88 has generated a recommendation, it appears as a final column with a small lightning-bolt icon in the header.
4. **Active config highlight** — the column representing the player's currently active preset has a 2px molten-gold border, pulsing faintly once every four seconds.

Typical column count: 6-12. Manageable width on a 1080p display at 48px per column.

### The Color Scale

The palette is sequential and avoids red-green:

- **0-30%**: Deep indigo — a rich, saturated blue-violet that reads as "cold" and "deep," like staring into still water at night. These cells feel sunken, with a subtle inner shadow at the bottom edge.
- **30-50%**: Slate with a cool cyan tint — transitional, uncertain, the heuristic is barely better than guessing among plausible candidates.
- **50-70%**: Electric cyan — the cell begins to glow. A faint radial gradient brighter at center gives the impression of light source warming up. Working. Functional. Not yet reliable.
- **70-85%**: Warm amber — the cell is distinctly warm against the dark background. The inner gradient shifts from cool to golden. The heuristic is doing its job and earning trust.
- **85-100%**: Molten gold with a subtle animated glow — not a pulse, but a slow luminance oscillation over 6 seconds that gives the cell a "breathing" quality, as if the gold is liquid and alive. Near-perfect calibration. The heuristic almost never misleads.

Empty cells — no data, no counterfactual — render as a charcoal crosshatch on the dark background, with a faint "?" glyph centered in the cell. Hovering the "?" reveals: "Play a relay mission with Signal Hunter to fill this cell." Each empty cell is a micro-quest.

### Hover Tooltips

When the cursor enters a cell, the cell brightens by 15% and gains a 1px white border. After 150ms, a tooltip fades in below the cell — a floating card with a frosted-glass backdrop (dark translucent blur of the content behind it, 8px border radius, 1px white-at-10%-opacity border). The tooltip contains:

```
RELAY CHAIN MISSIONS (M1, M2, M4)
Config: Pivot-First (PA:100, R:0, V:0)
Accuracy: 83% (10/12 sessions matched)
Avg rank of minimum fix when wrong: 2.4
Confidence: Medium (12 sessions)
Best single mission: M2 — 92% (11/12)
Worst single mission: M4 — 67% (4/6)

[Click to apply this config]
[Expand to per-mission breakdown]
```

The accuracy percentage is rendered in the same hue as the cell it belongs to — gold text for a gold cell, indigo text for an indigo cell — creating a visual echo between grid and tooltip. The frosted-glass backdrop ensures readability against any underlying grid pattern.

For counterfactual cells, an italic amber line appears at the top of the tooltip: "Simulated — accuracy estimated from retroactive weight recomputation." The session count shows as a decimal when interpolated: "10.3/12 interpolated matches."

### Click-to-Apply

Clicking a cell and selecting "Apply this config" sets the player's active weight configuration to that cell's values. The weight sliders animate via the interpolation animation (4.91) — a 400ms ease-out transition where each slider thumb travels from its current position to the new value, leaving a brief ghost trail in the slider's wake. The column border shifts from the old preset to the new one, the gold 2px highlight sliding horizontally with a 300ms ease-in-out, like a spotlight moving across a stage.

### Per-Mission Drill-Down

Clicking "Expand to per-mission breakdown" on the tooltip unfolds the row into its constituent missions. The relay row (M1, M2, M4) splits into three sub-rows, each showing the same preset columns but with mission-specific accuracy. The expansion animates vertically — the row stretches downward over 250ms, pushing other rows below it, and the sub-rows fade in with a staggered 50ms delay per row. This drill-down reveals whether the mission-type pattern holds uniformly or whether one mission is an outlier pulling the aggregate.

---

## The Cold-Start Problem and Progressive Reveal

The Kiln Grid is empty at unlock. Fifteen sessions across two mission types yields perhaps 8-12 cells with data in a potential grid of 30-60 cells. An empty grid communicates nothing and discourages return visits.

**Counterfactual seeding:** Even with one preset used, the system retroactively computes accuracy for all built-in presets across every completed session. A player with 15 sessions, all using Balanced, sees 4 columns of counterfactual data immediately — enough to show that Pivot-First outperforms Balanced on relay missions and underperforms on factory missions.

**Progressive reveal:** The grid shows only rows and columns with data. A player with relay and factory sessions sees a 2-row grid. As they complete armor and hybrid missions, new rows slide in from the bottom with a 200ms ease-out animation. The grid grows with the player's career.

**Narrative framing:** On first view, a message appears above the grid in small italic text against the dark background: "Your diagnostic presets perform differently across mission types. Patterns will emerge as you play." Forward-looking. Promising. Not apologizing for the emptiness.

---

## Player Journeys

#### Journey: Marco, 19, Computer Science Student, Quezon City

**Context:** Marco is 40 hours in. He has completed Missions 1 through 7 and replayed M2 and M5 several times. He has three custom presets: "Balanced Plus" (PA:40, R:40, V:20), "Scout Heavy" (PA:80, R:10, V:10), and "Chaos Mode" (PA:10, R:10, V:80). He is about to attempt Mission 8 — his first factory-vs-factory cascade — and he is nervous because Mission 5 (his first factory mission) took him nine attempts.

**Minute 0:00 — The Pre-Mission Check**

Marco is on the campaign map. The Batangas province node for Mission 8 pulses with an amber ring indicating an unplayed mission. Before entering, he navigates to Career Stats and opens the Kiln Grid. The grid is five rows by seven columns — Relay Chain, Armor Push, Factory Cascade, Hybrid Siege, and a greyed-out Escalation row with a lock icon. His three custom presets sit between the four built-in columns.

He scans the Factory Cascade row. His eyes track left to right across seven cells. Balanced: electric cyan, 58%. Pivot-First: slate with cool tint, 42%. Fresh-Changes: amber, 71%. Noise-Hunter: molten gold with the slow breathing luminance, 89%. His custom presets: "Balanced Plus" at cyan 54%, "Scout Heavy" at deep indigo 31%, "Chaos Mode" at warm amber 78%.

The row tells a story he has felt but never articulated: factory missions reward volatility weighting. Noise-Hunter (pure volatility) is gold. Scout Heavy (pure pivot-analysis) is the coldest cell in the entire grid, a sunken indigo rectangle with a visible inner shadow that makes it look like a hole in the surface.

**Minute 0:35 — The Hover Investigation**

Marco hovers the Noise-Hunter cell on Factory Cascade. The cell brightens. The frosted-glass tooltip appears:

```
FACTORY CASCADE MISSIONS (M5, M8)
Config: Noise-Hunter (PA:0, R:0, V:100)
Accuracy: 89% (8/9 sessions matched)
Avg rank of minimum fix when wrong: 1.0
Confidence: Medium (9 sessions)
Best single mission: M5 — 89% (8/9)
Worst single mission: M8 — no data yet

[Click to apply this config]
[Expand to per-mission breakdown]
```

He notices: "Worst single mission: M8 — no data yet." All the factory data comes from Mission 5 replays. Mission 8, the mission he is about to attempt, has contributed nothing. The 89% is a promise from Mission 5, not a guarantee for Mission 8. But it is the best signal he has.

He clicks "Apply this config." The weight sliders animate — three slider thumbs gliding from their current positions to PA:0, R:0, V:100. The ghost trails linger for 200ms behind each thumb, fading like comet tails. The active-preset column highlight slides from "Balanced Plus" to "Noise-Hunter" with a smooth horizontal translation. The gold 2px border settles around the new column.

**Minute 1:10 — The Mission Attempt**

Marco enters Mission 8. During sealed watch, he sees his Striker's Fix Explorer surfacing a candidate he has never seen ranked first before — a factory output buffer whose volatility score is off the charts. In his previous attempts at factory-adjacent scenarios, Balanced Plus always surfaced a different element first. Noise-Hunter has reordered his diagnostic view of the battlefield entirely.

He runs THOROUGH. The progress spinner resolves. Match. The volatile output buffer was the minimum fix. His stomach unclenches. He passes Mission 8 on the first attempt.

**Minute 2:45 — The Return to the Grid**

Back in Career Stats, the Kiln Grid has updated. The Factory Cascade row for Noise-Hunter now reads 90% (9/10 sessions matched). The cell's breathing gold glow is fractionally brighter. But more importantly, he clicks "Expand to per-mission breakdown" and sees:

```
M5: 89% (8/9)
M8: 100% (1/1) — Low confidence
```

One data point. The gold cell for M8 is small but blazing, and the "Low confidence" label in the tooltip keeps him honest. He knows one session proves nothing. But the Kiln Grid gave him the hypothesis, and the hypothesis survived its first test.

**Minute 3:30 — The Cross-Row Comparison**

Marco's gaze drifts upward to the Relay Chain row. Noise-Hunter is deep indigo there: 28%. He hovers it. "3/11 sessions matched. Avg rank of minimum fix when wrong: 5.2." On relay missions, pure volatility weighting ranks the actual minimum fix *fifth*. The heuristic is not just wrong — it is catastrophically wrong, burying the right answer under four incorrect candidates.

He looks at the Relay Chain row for Scout Heavy — his worst factory preset — and sees warm amber: 79%. The grid's message crystallizes in his mind like a photograph developing in solution: the presets that fail in one environment succeed in another. There is no universal winner. The indigo cell and the gold cell are the same configuration, separated only by context.

**UI Annotations:**
- Factory Cascade row: third from top, label in small monospace left-aligned, with a small factory-gear icon preceding the text
- Noise-Hunter column: sixth from left, header text truncated to "Noise-Hu..." with full name on hover
- Cell dimensions: 48px wide x 36px tall, with 1px separation borders in #1a1f2e (slightly lighter than the #0d1117 background)
- Breathing gold animation: CSS keyframe cycling opacity between 0.85 and 1.0 over 6 seconds, sinusoidal easing
- Drill-down sub-rows: indented 16px from the parent row label, with a thin connecting line from parent to children in dim white

---

#### Journey: Priya, 27, QA Engineer, Makati

**Context:** Priya is 90 hours in. She has completed the full campaign and is deep into Gauntlet season play. She has seven custom presets, each named after the mission type she built it for. She is debugging a recent accuracy regression: her "Relay Tuned" preset, which used to perform at 85% on relay missions, has dropped to 62% over her last 10 sessions. She suspects her architectural changes (adding a third relay hop) degraded the preset's effectiveness.

**Minute 0:00 — The Regression Hunt**

Priya opens the Kiln Grid in full-grid view. Five rows, eleven columns. The grid is dense — she has observed data in roughly 80% of cells. She immediately spots the problem: the Relay Chain row for "Relay Tuned" is no longer warm amber. It has cooled to electric cyan. The cell's color has shifted from a warm 82% gold two weeks ago to a tepid 62% cyan today.

She does not need to hover the cell to know something changed. The color shift is visible, visceral, like watching a bruise darken. Two weeks ago this cell was one of the warmest in the grid. Now it sits between the slate 48% of Fresh-Changes and the cyan 58% of Balanced — mediocre company.

**Minute 0:40 — The Drill-Down**

She clicks "Expand to per-mission breakdown" on the Relay Chain row. Three sub-rows appear, sliding in with the staggered fade animation:

```
M1 (Cordillera Relay): Relay Tuned — 78% (7/9)
M2 (Ilocos Chain): Relay Tuned — 71% (5/7)
M4 (Palawan Link): Relay Tuned — 33% (2/6)
```

Mission 4 is the outlier. Palawan Link — the longest relay chain in the campaign, four hops from scout to striker. Her "Relay Tuned" preset is 33% there. She hovers the cell: deep indigo, inner shadow making it look like a cavity in the grid surface. Tooltip: "Avg rank of minimum fix when wrong: 4.8. Confidence: Medium (6 sessions)."

Priya's eyes narrow. She added the third relay hop to her architecture *specifically for Mission 4*, to extend her scout range across Palawan's long map. The extra hop degraded signal fidelity, which changed the volatility profile of every signal in the chain, which means her "Relay Tuned" preset — calibrated for two-hop relay fidelity characteristics — is now miscalibrated for the three-hop reality.

**Minute 1:30 — The Counterfactual Comparison**

She scans across the M4 sub-row. Most presets are cool. But Noise-Hunter (PA:0, R:0, V:100) is warm amber at 72% — counterfactual, indicated by the diagonal hatch pattern over the amber fill. The frosted-glass tooltip reads: "Simulated — this config was never used on M4, but retroactive recomputation across 6 sessions estimates 72% accuracy."

She then checks Balanced: 55%. Pivot-First: 61%. The volatility dimension matters on M4 now that the extra hop is introducing signal degradation artifacts that look like volatility spikes. Her three-hop architecture changed the diagnostic signature of the mission from pivot-dominant to volatility-adjacent.

**Minute 2:15 — The Fix**

Priya creates a new preset: "Relay 3-Hop" (PA:45, R:5, V:50). She does not have to leave the Kiln Grid to do this — she right-clicks the Noise-Hunter column header, selects "Duplicate as new preset," and the weight editor opens in a slide-over panel. She adjusts the pivot-analysis weight upward to 45 (because relay missions still have a pivot component) and drops recency to 5. She names it "Relay 3-Hop" and saves.

A new column slides into the grid from the right with a 200ms ease-out. All cells in the new column are counterfactual — diagonal hatched — computed instantly from her stored session data. The Relay Chain row for "Relay 3-Hop" shows amber at 74%. The M4 sub-row: 69%. Not gold, but a significant improvement over 33%. She applies it and queues up Mission 4 for a test run.

**Minute 3:45 — The Regression Resolved**

After three M4 sessions with "Relay 3-Hop," the cell updates from counterfactual hatch to solid fill. 75% (observed, 3 sessions). The amber deepens. The Kiln Grid has functioned as a regression diagnostic tool: she identified the regression (color shift), isolated the affected mission (drill-down), diagnosed the cause (architectural change breaking calibration), and validated the fix (new preset, observed data matching counterfactual prediction).

**Minute 4:30 — The Meta-Insight**

Priya opens the Kiln Grid's chapter-grouped view. Relay missions aggregate into a single wide column. Her old "Relay Tuned" preset is still amber in the aggregate — the M1 and M2 data buoy the average despite M4's collapse. The aggregate hid the regression. She switches back to per-mission drill-down and makes a mental note: always drill down before trusting the aggregate.

She has just learned the base rate fallacy through a heatmap. An aggregate that looks fine can conceal a component that is catastrophically broken. This is the same lesson QA engineers learn about test suites: 95% pass rate means nothing if the 5% failures are all in the payment module.

**UI Annotations:**
- Regression color shift: the cell transitions from its previous color to the new color on grid load via a 600ms cross-fade, making the change visible even to players who don't remember the exact previous shade
- Drill-down expansion: parent row dims to 60% opacity when expanded, so sub-rows carry the visual focus
- Right-click context menu: dark card with 4 options — "Apply this config," "Duplicate as new preset," "Copy config string," "View session history"; each option has a small icon (checkmark, duplicate-pages, clipboard, clock)
- Slide-over preset editor: 320px wide panel that slides in from the right, overlapping the rightmost grid columns; contains three weight sliders, a name field, and Save/Cancel buttons; the grid behind it is still partially visible, providing spatial context

---

#### Journey: Tito Jun, 58, Retired Maritime Engineer, Cebu

**Context:** Tito Jun is 180 hours in. He has played through the campaign twice and spent most of his time replaying Missions 5 and 8 — the factory cascade missions — because they remind him of troubleshooting engine feedback loops on container ships. He uses only the default Balanced preset. He has never created a custom preset. He opens Career Stats for the first time because his grandson told him to look at "the colored grid thing."

**Minute 0:00 — The First Glance**

Tito Jun navigates to Career Stats. The Kiln Grid sits on the right side of the dark dashboard. His grid is four rows by four columns — only built-in presets, since he has never saved a custom one. The grid is small and dense, every cell populated. The progressive reveal has kept the grid compact rather than showing him a vast empty expanse.

He sees the grid and his first reaction is confusion. Rows of colored rectangles. He reads the row labels: "Relay Chain," "Armor Push," "Factory Cascade," "Hybrid Siege." He reads the column labels: "Balanced," "Pivot-Fir...," "Fresh-Ch...," "Noise-Hu..." He does not know what these column labels mean. He has never opened the weight configuration panel.

But he knows colors. The grid is a four-by-four square of cells, and one pattern is immediately legible: the "Balanced" column — the leftmost, the one with a faint pulsing gold border indicating it is his active config — is uniformly electric cyan. Every row is cyan. 55%, 61%, 58%, 52%. Adequate. Mediocre. Unremarkable.

The other three columns are varied. Pivot-First is gold on Relay Chain (87%) and indigo on Factory Cascade (34%). Fresh-Changes is amber on Armor Push (76%) and slate on everything else. Noise-Hunter is blazing gold on Factory Cascade (91%) and deep indigo on Relay Chain (22%).

His Balanced column looks like a row of identical cyan tiles next to columns of dramatic peaks and valleys. He is the flat line in a room full of heartbeats.

**Minute 0:50 — The Factory Discovery**

Tito Jun's eye goes to the row he cares about: Factory Cascade. His Balanced cell is cyan at 58%. The Noise-Hunter cell to its right is molten gold at 91%, the breathing luminance glow making it the most visually prominent cell in the entire grid. The difference is 33 percentage points. He has spent 80+ hours on factory missions running at 58% accuracy when a preset he never tried would have given him 91%.

He hovers the Noise-Hunter factory cell. The frosted-glass tooltip materializes:

```
FACTORY CASCADE MISSIONS (M5, M8)
Config: Noise-Hunter (PA:0, R:0, V:100)
Accuracy: 91% (counterfactual — simulated across 42 sessions)
Avg rank of minimum fix when wrong: 1.3
Confidence: High (42 sessions)

[Click to apply this config]
```

Forty-two sessions of factory gameplay, retroactively recomputed. The diagonal hatch pattern over the gold fill tells him this is simulated, not experienced. He does not fully understand the distinction, but the tooltip says "91%" in gold text against the frosted backdrop and the cell is the warmest thing on the screen.

He clicks "Apply this config."

**Minute 1:20 — The Weight Revelation**

The weight sliders animate for the first time in Tito Jun's 180-hour career. Three horizontal bars appear in a compact widget at the top of the Kiln Grid — the inline slider preview that activates on first-ever preset change. The "Pivot Analysis" slider thumb glides from 33 to 0. The "Recency" thumb glides from 33 to 0. The "Volatility" thumb glides from 33 to 100, leaving a comet-tail ghost in warm gold behind it. The motion takes 400ms and the ghost trails linger for another 200ms before fading.

Tito Jun watches the sliders move and understands, for the first time, that the diagnostic system has *controls*. He has been driving a car for 180 hours without knowing it had a gear shift. The Kiln Grid is not just showing him data — it is functioning as the discovery path into an entire game system he never engaged with.

A brief overlay appears — the same first-interaction explanation from the weight configuration panel (4.63): "These sliders control how your QUICK mode ranks diagnostic candidates. Pivot Analysis weights elements that changed direction. Recency weights recent changes. Volatility weights unstable elements." He reads it. He has been troubleshooting factory cascades for months. He knows what volatility means from his maritime career — engine oscillations, harmonic resonance, feedback loops. The word "volatility" connects his real-world expertise to the game mechanic.

**Minute 2:00 — The First Intentional QUICK**

He loads Mission 5 — the Batangas factory he has played forty-two times. QUICK mode fires. A candidate he has *never* seen ranked first appears at the top of the Fix Explorer: the thermal regulator on Production Line C, the element with the highest oscillation amplitude during the cascade. In 42 previous sessions with Balanced, this element was ranked third or fourth — visible but never prominent. Now it is first.

He runs THOROUGH. The progress spinner cycles through its phases. Resolution. Match. The thermal regulator was the minimum fix.

Tito Jun leans back. In 42 sessions he found this answer eventually, through THOROUGH brute force. But the Kiln Grid just showed him that a different weight configuration would have surfaced it immediately in QUICK, saving him the THOROUGH computation every time. The heatmap did not improve his architecture. It improved his heuristic. The ship is the same. The diagnostic instrument is recalibrated.

**Minute 3:15 — The Grandson's Visit**

The following Sunday, his grandson Miguel comes over to watch him play. Tito Jun opens the Kiln Grid and points at the screen: "See the gold square? That means this setting works best for factory missions. See the blue square in the same row? That means this other setting is terrible for factory missions. But look — on relay missions, the blue setting becomes gold and the gold becomes blue. Everything depends on the situation."

Miguel, who is sixteen and has been trying to explain machine learning hyperparameter tuning to his college prep class, recognizes what his grandfather is describing. "That's like how a learning rate that works for image classification doesn't work for text," he says. Tito Jun does not know what a learning rate is, but the Kiln Grid has given them a shared visual vocabulary for a concept that transcends both their domains.

**UI Annotations:**
- Compact 4x4 grid: 192px wide x 144px tall, each cell 48x36, positioned in the upper-right quadrant of the career stats panel; the small size makes the color pattern immediately scannable without eye movement
- First-ever preset change: triggers the inline slider preview widget (120px tall, spanning the grid width) to appear above the grid with a 200ms slide-down; the widget auto-dismisses after 8 seconds or on click-away
- First-interaction overlay: semi-transparent dark card (rgba(13,17,23,0.92)) centered over the grid, 280px wide, with three illustrated slider icons and one sentence each; dismiss via "Got it" button or click-outside
- Counterfactual hatch pattern: three diagonal lines at 45 degrees, 1px wide, spaced 6px apart, in rgba(255,255,255,0.08) — visible on close inspection, invisible at a casual glance

---

## Strengths

**Categorical insight from a single screen.** The Kiln Grid's mission-type grouping elevates the heatmap from episodic memory ("I did well on M3 with Pivot-First") to categorical understanding ("Pivot-First works on relay missions as a class"). This is the difference between a case study and a principle. Players who internalize the categorical pattern carry it forward to new missions, new Gauntlet scenarios, and — most importantly — real-world engineering contexts where configuration is always environment-dependent.

**Natural discovery path for hidden features.** Tito Jun's journey demonstrates the Kiln Grid's secondary function as an onboarding instrument for weight configuration. Players who never found the slider panel through the normal UI can discover it through the grid's click-to-apply action. The grid makes the weight system's *payoff* visible (gold cells vs. indigo cells) before the player encounters the *mechanism* (sliders), which inverts the typical feature-discovery flow and creates stronger motivation to learn.

**Regression detection through color memory.** Players develop unconscious color memories of their grid patterns. When a previously warm cell cools, the shift is noticeable even without explicit regression alerts. Priya's journey illustrates this: she did not need a notification to spot the regression; the color change was viscerally apparent. The grid leverages the human visual system's preattentive processing of color change — faster and more reliable than reading accuracy percentages.

**Counterfactual data as exploration incentive.** Hatched gold cells are invitations. A player who sees that an untested preset *would have* performed at 89% on factory missions has a concrete reason to try it. The counterfactual data lowers the experimentation barrier from "I wonder if this would work" to "I can see that it would work; let me confirm." This is the heatmap's most powerful contribution to player agency: it makes the value of unexplored options visible before the player commits.

**Replay motivation with structure.** The grid gives players a reason to replay that is neither grinding nor completionism. Each replay is an experiment — "does this preset's counterfactual gold cell hold up in observed play?" — with a visible outcome (the cell updates). The grid transforms replays from repetition into hypothesis testing.

---

## Weaknesses

**Mission-type grouping obscures intra-type variance.** M1 and M4 are both relay missions, but M4 (Palawan Link) has a much longer relay chain than M1 (Cordillera Relay). A preset that works on M1 may fail on M4, and the aggregated relay row will show a middling result that conceals both the strength and the weakness. Priya's drill-down journey demonstrates the mitigation (per-mission sub-rows), but players who never drill down will make decisions on misleading aggregates.

**The "click the gold cell" cargo cult.** The Kiln Grid makes it trivially easy to select the best-performing preset for each mission type without understanding *why* it performs well. A player who mechanically clicks gold cells before each mission gets higher accuracy but learns nothing about weight semantics. The grid optimizes behavior without necessarily optimizing understanding. The cargo-cult risk is amplified by the grid's visual legibility — the warm/cold distinction is so clear that it shortcuts analytical thinking.

**Counterfactual cells may mislead.** Retroactive weight recomputation assumes the player's behavior would be identical regardless of which candidate QUICK surfaces first. In practice, a different #1 candidate changes the player's investigation path, potentially leading to different THOROUGH outcomes. Counterfactual accuracy is "what rank would the minimum fix have received?" not "would the player have found the minimum fix?" Sophisticated players may over-trust counterfactual cells that happen to show gold.

**Cold-start sparsity for non-repeating players.** A player who plays each mission once and moves on will have at most 10 data points spread across 5 mission types. The grid will be sparse, the confidence low, and the mission-type aggregation will rest on 2-3 sessions per type — barely enough to show any pattern. The Kiln Grid rewards replayers disproportionately and may seem useless to once-through players.

**Visual density pressure on small displays.** A 5-row by 11-column grid with hover tooltips, drill-down expansion, counterfactual hatching, and a breathing gold animation is a desktop-native design. On mobile or tablet, cells shrink below legible size, hover is unavailable (requiring tap-and-hold), and the drill-down expansion competes with scroll behavior. The grid may require a completely different mobile presentation — perhaps a vertical stack of per-mission-type bar charts.

---

## Interaction Effects

**With 4.90 (Chapter transition review):** When the game prompts "your weights were saved in Chapter 2 — review for Chapter 3?" the player can open the Kiln Grid and see the evidence directly. Chapter 2 missions (Armor Push, Factory Cascade) demanded different weight profiles than Chapter 3 (Hybrid Siege, Escalation). The grid makes the chapter transition prompt answerable: "yes, review, because my Chapter 2 preset is indigo on the Hybrid Siege row."

**With 4.88 (Adaptive weight suggestion):** The adaptive suggestion appears as a column in the Kiln Grid. The player can evaluate 4.88's recommendation not as an opaque "the game thinks you should use this" but as a visible column of cells: "the suggested preset is gold on factory and hybrid but amber on relay — is that tradeoff worth it?" The grid provides the evidentiary context that makes the adaptive suggestion trustworthy.

**With 4.89 (Preset import/export):** Importing a community preset adds a new column to the grid, immediately populated with counterfactual data. The player evaluates the community preset against their own career data before using it in a real session. "Discord says this preset dominates M8. My grid shows it at 76% on factory missions — good but not as good as my Noise-Hunter at 91%. Maybe it's optimized for a different architecture."

**With 4.94 (Committed-to-QUICK accuracy):** The Kiln Grid shows standard accuracy (both modes run). The Committed-to-QUICK metric (4.94) tracks accuracy in sessions where the player trusted QUICK alone. A toggle on the Kiln Grid could switch the color scale from "verified accuracy" to "committed accuracy," revealing which mission types the player reliably trusts QUICK on versus which they always verify with THOROUGH. This intersection surfaces trust calibration: "I trust QUICK on relay missions, and the grid shows I'm right to — but I also trust QUICK on factory missions, where the grid shows I shouldn't."

**With 4.96 (Accuracy-vs.-complexity scatter plot):** The scatter plot (complexity on X, accuracy on Y) and the Kiln Grid (presets on X, mission types on Y, accuracy as color) are orthogonal views of the same data. Together: the scatter plot shows whether the player's architecture is *capable* of high accuracy; the Kiln Grid shows whether the player's weight configuration *realizes* that capability per mission type. Architecture sets the ceiling. Configuration determines how close you get.

**With 5.14e (Fidelity spoofing campaign arc):** The Escalation row (M10) in the Kiln Grid will show unusual patterns: no preset performs consistently well because the enemy actively spoofs signals, destabilizing every weight dimension in unpredictable ways. The Escalation row's color pattern — chaotic, no clear winner — teaches the player that adversarial environments resist optimization. This is the grid's darkest lesson: sometimes there is no gold cell, and the best you can do is amber.

---

## Comparable Games and Media

**Civilization VI's policy card adjacency bonuses.** Civ VI's policy system lets players slot policy cards into civic government slots. The cards' effectiveness varies by game era, victory condition, and current geopolitical context. There is no universally best policy loadout — an early-game military card is useless in a late-game science push. The Kiln Grid provides the same contextual optimization insight but makes the performance data *retrospective and empirical* rather than prospective and theoretical. The player does not have to imagine how a preset would perform; they can see how it already did.

**MLB Statcast's batting heatmaps.** Statcast overlays a heatmap on the strike zone showing a batter's performance by pitch location — batting average, slugging percentage, whiff rate. Each cell is a zone, each color is performance, and the pattern reveals that a batter who crushes low-inside fastballs struggles with high-outside changeups. The Kiln Grid is the same idea: each cell is a (mission-type, preset) zone, each color is diagnostic accuracy, and the pattern reveals that a preset that thrives on relay missions struggles on factory cascades. The visual language is nearly identical — rectangular grid, sequential color scale, performance as heat.

**Weights & Biases hyperparameter sweep visualizations.** ML practitioners use W&B's parallel coordinates and heatmap views to visualize model performance across hyperparameter combinations. A 2D heatmap of learning rate vs. batch size, colored by validation loss, is structurally identical to the Kiln Grid's preset vs. mission type, colored by QUICK accuracy. The Kiln Grid is deliberately designed to feel familiar to anyone who has tuned hyperparameters — the game is teaching the same skill through a different substrate.

**Guitar Hero's per-song difficulty ratings.** Guitar Hero shows star ratings per song, revealing that a player who 5-stars medium-tempo rock songs may 2-star fast shred songs. The insight is categorical: your skill profile has peaks and valleys across song types. The Kiln Grid provides the same categorical profile for diagnostic configuration rather than motor skill, with the additional affordance that the player can *change their configuration* to match the context — something a Guitar Hero player cannot do with their fingers.

**Hades' Mirror of Night stat allocation.** Hades lets players redistribute stat points between runs, and experienced players learn that certain mirror configurations favor certain weapon types. The Kiln Grid makes this weapon-to-configuration mapping explicit with data rather than leaving it to intuition. Where Hades players develop hunches ("I think extra dashes work better with the rail"), Kiln Grid players see evidence ("volatility weighting is 91% on factory missions, 22% on relay").

---

## Sensory Description

**The grid at rest.**

The career stats screen is a deep charcoal field (#0d1117) with subtle noise texture — not flat black but a surface with the faintest grain, like matte paper under dim light. The Kiln Grid occupies the right two-thirds of the screen, floating 24px from the right edge and vertically centered. The grid's overall shape is a wide rectangle, slightly wider than tall, with rounded 4px corners on the outermost cells.

Row labels run down the left side in 11px monospace, uppercase, letter-spaced at 0.5px — RELAY CHAIN, ARMOR PUSH, FACTORY CASCADE, HYBRID SIEGE, ESCALATION. Each label is preceded by a small icon: a zigzag line for relay, a chevron for armor, a gear for factory, a shield-plus-arrow for hybrid, a skull for escalation. The icons are rendered in dim white at 40% opacity — present but not competing with the grid's color information.

Column labels run across the top in the same monospace, truncated with ellipsis at 10 characters. The active preset's column label is rendered at full white opacity; all others at 60%.

**The cells breathing.**

The molten-gold cells in the 85-100% range are not static. They oscillate in luminance — not a harsh pulse but a slow, organic rhythm, like embers viewed through heat haze. The luminance cycles between 85% and 100% over 6 seconds with sinusoidal easing, so the peak and trough are gradual, never abrupt. At any given moment, the gold cells in the grid are at slightly different phases of their breathing cycle (seeded by cell position), creating a subtle living texture across the grid — a field of embers, each glowing at its own pace.

The indigo cells at the other extreme have no animation. They are still, deep, inert. The contrast between the living gold and the dead indigo reinforces the temperature metaphor: hot things move; cold things do not.

**The drill-down moment.**

When the player expands a mission-type row into its constituent missions, the animation is precise: the parent row's cells compress vertically to 24px (from 36px) and dim to 60% opacity. Below it, sub-rows fade in with a staggered 50ms delay — first M1, then M2, then M4 — each sliding down from the parent row's position as if being dealt from a deck. The sub-row labels are indented 16px and rendered at 9px, smaller than the parent. A thin vertical line in dim white connects the parent label to its children, like a tree branch.

The sub-rows may tell a different story than the parent. A parent cell at 68% amber might expand to reveal M1 at 89% gold, M2 at 72% amber, and M4 at 33% deep indigo — the aggregate concealed a dramatic range. The visual impact is immediate: three cells where there was one, and the colors diverge. The player's eyes track the divergence and the question forms naturally: why is M4 so different?

**The tooltip's frosted glass.**

The tooltip is not a flat card. It has a backdrop-filter blur of 12px applied to the content behind it, creating the frosted-glass effect — the grid cells behind the tooltip are visible but softened into abstract color fields, like looking through a shower door. The tooltip's border is 1px of white at 10% opacity. Its shadow is a 0 4px 16px spread of black at 30% opacity, giving it a slight float above the grid surface. The text inside is set in the same monospace as the grid labels but at 10px, with 16px line height, creating breathing room between data points. The accuracy percentage is rendered in a font weight of 600 (semi-bold) and colored to match the cell — a gold "91%" or an indigo "28%" — while all other text remains neutral white at 80% opacity.

When the tooltip appears, it does not pop. It fades in over 100ms with a simultaneous 4px upward translation — a gentle arrival, as if rising from the cell's surface. When the cursor leaves the cell, the tooltip fades out over 80ms with a 2px downward translation — sinking back into the grid. The asymmetry (slower in, faster out) makes the tooltip feel responsive on departure without being jarring on arrival.

---

## Discovered New Aspects

1. **4.97 — Mission-type diagnostic signature display**: Each mission type develops an empirically derived "diagnostic signature" — the weight dimension that most strongly predicts QUICK accuracy for that type. Relay missions are "pivot-dominant," factory missions are "volatility-dominant." The signature is computed from the Kiln Grid's data and displayed as a small label below each row: "Dominant axis: Volatility." This teaches the player *why* certain presets work on certain mission types, closing the loop between observation (color) and explanation (signature). Interaction with 5.08 (mission variety taxonomy) and 8.09 (diagnostic layer as teaching arc).

2. **4.98 — Kiln Grid accuracy regression alert**: When a preset's accuracy on a mission type drops by more than 15 percentage points over the player's last 8 sessions compared to their historical average, the cell gains a small downward-pointing triangle overlay in the lower-right corner. Hovering the triangle reveals: "Relay Tuned dropped from 82% to 62% on Relay Chain over your last 8 sessions. Your architecture may have changed." Teaches deployment regression monitoring — the concept that performance degrades when the environment changes and the configuration stays fixed.

3. **4.99 — Community Kiln Grid overlay**: An optional toggle that superimposes community median accuracy on each cell as a small diamond marker. The player's personal accuracy is the cell's fill color; the community median is a tiny diamond positioned vertically within the cell at the corresponding accuracy level. A player whose personal gold cell has the community diamond sitting at the cyan level knows their preset outperforms the community — their architecture is better suited to this mission type. Interaction with 4.95 (accuracy leaderboard opt-in) and 7.05 (community metrics).

4. **5.21 — Pre-mission Kiln Grid preview on campaign map**: A compact 1-row extract of the Kiln Grid appears when hovering a mission node on the campaign map, showing the player's preset accuracy for that mission's type. The single row lets the player make a preset-switching decision without navigating to Career Stats. The best-performing preset's cell has a small star icon. Interaction with campaign map UI and 4.97 (per-mission optimal preset badge).
