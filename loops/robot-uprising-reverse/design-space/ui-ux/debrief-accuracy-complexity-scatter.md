# Accuracy-vs.-Complexity Scatter Plot in Career Stats

**Aspect:** 4.96 — Accuracy-vs.-complexity scatter plot in career stats: a two-axis visualization showing per-config-version data points: x-axis = architectural complexity (hooks x agents), y-axis = pre-ranking accuracy; the player can see the accuracy/complexity tradeoff curve of their own architecture history; identifies "high-complexity, low-accuracy" configs (high coupling, hard to diagnose) vs. "clean, well-calibrated" configs; the scatter plot as the signature career-arc diagnostic artifact

**Parent:** 4.64 — Pre-ranking accuracy as a displayed stat
**Siblings:** 4.93 — Accuracy stat confidence interval display; 4.94 — "Committed to QUICK" sessions only accuracy; 4.95 — Accuracy leaderboard opt-in
**Related:** 4.25 — EDT trajectory as career metric; 4.63 — Player-configurable pre-ranking weights; 4.58 — Pre-ranking transparency panel; 8.09 — Diagnostic layer as teaching arc

---

## The Core Concept

Every config version the player has ever deployed produces two numbers: a **complexity score** and a **pre-ranking accuracy rate**. Plot them as a dot on a two-axis chart — complexity on the horizontal axis, accuracy on the vertical — and the player's entire architectural history becomes a constellation of data points telling a story no single stat can tell.

**Complexity score** is computed as `active_hooks x active_agents`. A 3-agent architecture with 4 hooks has complexity 12. A 6-agent architecture with 14 hooks has complexity 84. The product captures the interaction surface — more agents and more hooks mean more causal pathways for the pre-ranking heuristic to untangle. This is not "total config elements" — it specifically measures the **wiring density** that determines how tangled the causal graph becomes when something goes wrong.

**Pre-ranking accuracy** is the match rate between QUICK mode's top-ranked candidate and THOROUGH mode's minimum fix, measured across the sessions where that config version was active. A config version that was deployed for 12 sessions and produced 9 QUICK-THOROUGH matches has accuracy 75% (if 9 matched) or whatever fraction the actual data shows.

**What the scatter plot reveals:**

The plot has four quadrants, each telling a different story about the player's architectural philosophy:

```
HIGH ACCURACY
    |
    |  Sweet Spot          Rare Mastery
    |  (clean, simple,     (complex but
    |   well-calibrated)    still legible)
    |
----+---------------------------------> HIGH COMPLEXITY
    |
    |  Broken Simple       Coupling Hell
    |  (few elements,      (many hooks,
    |   still confused)     can't diagnose)
    |
LOW ACCURACY
```

**Upper-left (The Sweet Spot):** Low complexity, high accuracy. The player built a clean, modular architecture with few hooks and few agents. The pre-ranking heuristic has no trouble isolating the causal element. These configs are easy to debug — but they may also be limited in capability. The sweet spot is safe but potentially boring.

**Upper-right (Rare Mastery):** High complexity, high accuracy. The player wired a dense architecture but kept the signal paths orthogonal enough that the heuristic can still isolate failures. This is the hardest quadrant to reach — it requires understanding both the game's systems and the diagnostic tooling well enough to build complex configs that remain legible. A cluster of dots here signals genuine mastery.

**Lower-left (Broken Simple):** Low complexity, low accuracy. Something is fundamentally wrong. Even simple configs confuse the heuristic. This usually means the few hooks that exist are wired in feedback loops — the architecture is small but circular, creating causal ambiguity disproportionate to its size. Or the player is changing configs so frequently that no version accumulates enough sessions for reliable accuracy measurement.

**Lower-right (Coupling Hell):** High complexity, low accuracy. The player added hooks and agents aggressively but created a tangled web where everything causes everything. When something fails, the heuristic sees 15 candidates with similar activity scores and can't distinguish them. This is the "enterprise software" quadrant — feature-rich but impossible to debug.

**The trajectory is the story.** Individual dots are interesting. But the line connecting them chronologically — from the player's first config version to their current one — is where the narrative lives. A player whose dots trace a path from lower-left to upper-right has grown from confused simplicity to masterful complexity. A player whose dots zigzag between upper-left and lower-right is repeatedly over-reaching, then retreating to safety. The trajectory shape is the signature of the player's learning curve.

---

## The Visualization Design

### "The Architect's Constellation"

The scatter plot lives on the **Career Stats** screen — a dedicated screen accessible from the main menu, separate from any individual mission debrief. It is not crammed into a drawer or a tooltip. It gets a full panel because it is the culminating view of the player's entire history with the diagnostic system.

**The chart itself:** A standard 2D scatter plot rendered in the game's UI. The horizontal axis is labeled "Architectural Complexity (hooks x agents)" with tick marks at 5, 10, 20, 40, 80 — logarithmic spacing, because complexity grows multiplicatively. The vertical axis is labeled "Pre-ranking Accuracy (%)" with tick marks at 20%, 40%, 60%, 80%, 100% — linear spacing.

**Data points:** Each config version that has at least 5 sessions of QUICK-THOROUGH comparison data gets a dot. Dots are rendered as small circles (6px radius at default zoom), with their color encoding the **pass rate** of that config version: green for >70% pass rate, amber for 50-70%, dull red for <50%. This third dimension — pass rate as color — prevents the naive read of "upper-left is always best." A green dot in the lower-right (high complexity, low accuracy, high pass rate) tells the player: "this architecture won matches even though it was hard to debug."

**The trajectory line:** A thin, semi-transparent line connects the dots in chronological order — oldest config version to newest. The line's color fades from dim (oldest) to bright (newest), creating a gradient that traces the player's path through the design space. The player can see at a glance whether they're trending toward mastery or away from it.

**The current config:** The newest data point is rendered larger (10px radius), with a subtle pulsing glow in teal. It is the only dot that pulses. It answers the question "where am I now?" instantly.

**Hover behavior:** Hovering over any dot shows a floating card with:
```
Config v7.2 — "Relay Storm" (player-named)
Sessions: 18   Pass rate: 74%
Accuracy: 68%  (12/18 sessions matched)
Complexity: 42 (6 agents x 7 hooks)
Used: Sessions 89–106 (3 weeks ago)
```

The config name (if the player named their versions) appears prominently. If the player doesn't name configs, it shows "Config v7.2" with the version number that auto-increments on every config change.

**Quadrant labels:** Faint text in each quadrant corner names the region: "Sweet Spot" (upper-left), "Rare Mastery" (upper-right), "Rethink" (lower-left), "Coupling Hell" (lower-right). The labels are dim enough to not clutter the chart but present enough to give vocabulary to the regions. Players will adopt these terms: "I finally got a config into Rare Mastery territory."

**The Pareto frontier:** An optional toggle (checkbox in the chart header: "Show efficiency frontier") draws a thin dashed curve connecting the dots that represent the best accuracy-at-each-complexity-level — the upper envelope of the scatter. This is the player's personal Pareto frontier: the boundary between "achievable" and "not yet achieved" accuracy-complexity combinations. Dots above the frontier don't exist. Dots on the frontier are the player's best-ever configs at each complexity level. Dots below the frontier were suboptimal — they achieved less accuracy than the player has demonstrated is possible at that complexity.

---

## Player Journeys

### Journey: Aya, 32, data scientist, 140 hours in

**Context:** Aya has been playing Robot Uprising for four months, primarily in Gauntlet mode. She has a background in machine learning and immediately understood the pre-ranking accuracy stat when it appeared. She has been mentally tracking the relationship between her config complexity and diagnostic quality for weeks. She's about to see it visualized for the first time.

**Minute 0:00 — First Visit to the Scatter Plot**

Aya opens the Career Stats screen after her 120th Gauntlet session. A notification badge has appeared on the Career Stats icon — the scatter plot unlocked after she accumulated 8 config versions with enough sessions each (the unlock threshold: 8+ data points, each with 5+ QUICK-THOROUGH sessions).

The screen loads. Center panel: a two-axis chart with 11 data points scattered across it. The horizontal axis reads "Architectural Complexity (hooks x agents)" from 4 to 65. The vertical axis reads "Pre-ranking Accuracy (%)" from 35% to 90%. A thin gradient line connects the dots chronologically — the oldest dot at the lower-left is dim grey; the newest dot at the upper-middle pulses teal.

Aya's eyes trace the trajectory line. It tells a story she already knows but has never seen rendered:

Her first three configs (v1 through v3) are clustered in the lower-left: complexity 4-8, accuracy 40-55%. These were her tutorial-era architectures — simple, but she didn't understand how the diagnostic system worked yet. Low complexity, low accuracy. The "Rethink" quadrant.

Then a jump: config v4, her first relay-chain build. Complexity leaps to 22 (4 agents, 5-6 hooks). Accuracy: 58%. She was adding complexity but the heuristic was starting to track — she had learned to build cleaner signal paths by this point.

Configs v5 through v7 march steadily upward and rightward: complexity 28, 35, 42. Accuracy: 62%, 67%, 71%. Each version added agents or hooks, and each time she kept the signal routing clean enough that accuracy improved alongside complexity. The trajectory line angles up and to the right — the ideal learning path.

Then v8: the outlier. Complexity 56 (7 agents, 8 hooks). Accuracy drops to 49%. A red-amber dot — pass rate was only 55% on that config.

Aya remembers v8. She had tried an ambitious command-agent architecture with multiple feedback loops. It won some spectacular matches but was impossible to debug when it failed. She abandoned it after 8 frustrating sessions where QUICK mode pointed her to the wrong element every other time.

The trajectory line shows the retreat: v9 drops back to complexity 34 with accuracy 73%. v10, her current config, sits at complexity 38 and accuracy 76%.

**Minute 1:30 — The Pareto Frontier**

Aya clicks the "Show efficiency frontier" toggle. A thin dashed cyan curve appears, tracing the upper edge of her scatter. It connects v3 (complexity 8, accuracy 55%), v6 (complexity 35, accuracy 67%), v7 (complexity 42, accuracy 71%), and v10 (complexity 38, accuracy 76%).

The frontier is her personal best. Every dot below the frontier represents a config that was worse than she's proven she can build at that complexity level. Config v8, with its 49% accuracy at complexity 56, sits far below the frontier — the largest gap between any dot and the curve.

She hovers over the gap between v10 (complexity 38) and the empty right side of the chart. The frontier simply ends at v7/v10. There is no data point at complexity 50+ that sits on the frontier. Her best config at high complexity was v7 at complexity 42.

The challenge is legible without words: can she push into higher complexity while staying on or above the frontier? Can she build a complexity-50 config with 70%+ accuracy? That would be "Rare Mastery" territory.

**Minute 3:00 — The Hypothesis**

Aya studies v8 (the failed high-complexity config) and v10 (her current, lower-complexity config). She hovers over both. V8 had 7 agents and 8 hooks — the hooks were wired in a star topology with the command agent at the center. V10 has 5 agents and 7-8 hooks — a more linear relay chain with clear directionality.

She forms a hypothesis: the star topology confuses the pre-ranking heuristic because activity radiates in all directions from the command agent. When something fails, every agent connected to the command agent shows elevated pivot-tick activity. The heuristic can't distinguish the cause from the effects.

A linear topology, by contrast, has a clear signal path. If the scout fails, the downstream relay shows reduced activity, and the upstream chain is unaffected. The heuristic can trace the causal chain directionally.

She decides to build v11: a hybrid — linear backbone with one secondary branch. Complexity ~48 (6 agents, 8 hooks). Her prediction: accuracy should land between 65-72%, above the v8 disaster but potentially below v10's clean-chain accuracy.

**Minute 5:00 — Resolution**

Aya closes the Career Stats screen and opens the Plan screen to build v11. She has a specific architectural goal: push complexity above 45 while keeping accuracy above 65%. The scatter plot gave her a visual target — a region of the chart she wants to place her next dot in. The game has transformed architectural design from "make it work" to "make it work AND keep it legible."

She will check the scatter plot after 8-10 sessions with v11. The new dot will either validate or invalidate her topology hypothesis.

**UI Annotations:**
- Scatter plot panel: center of Career Stats screen, 600x400px at 1080p; dark background (#1a1a2e) with subtle grid lines in dim blue-grey (#2a2a4e); axes labeled in the game's monospace UI font
- Data points: 6px radius circles; fill color mapped to pass rate (green #4ade80, amber #fbbf24, red #f87171); 1px border in slightly darker shade of fill color; hover enlarges to 8px with a 100ms ease-out transition
- Current config dot: 10px radius, teal (#2dd4bf) fill, subtle 2px glow that pulses on a 3-second cycle; the only dot that moves
- Trajectory line: 1.5px width, semi-transparent (40% opacity); color gradient from dim grey (#555) at oldest to bright white (#ddd) at newest; line uses slight bezier curves between points, not hard angles
- Pareto frontier: dashed line (4px dash, 4px gap), cyan (#22d3ee) at 60% opacity; appears with a 300ms fade-in when toggled; the area above the frontier is subtly tinted (3% opacity cyan fill) to visually mark "uncharted territory"
- Quadrant labels: 10px type, 20% opacity, positioned in the corners of each quadrant; not interactive, purely atmospheric

---

### Journey: Tomás, 19, first strategy game, 35 hours in

**Context:** Tomás picked up Robot Uprising because a friend streamed it. He has no background in programming, systems thinking, or strategy games. He's completed the 10-mission campaign and has played 15 Gauntlet matches. His configs are simple — 3 agents, 2-3 hooks. He hasn't engaged deeply with the diagnostic tools beyond the basic Fix Explorer. The scatter plot has just unlocked with the minimum 8 data points.

**Minute 0:00 — What Is This Chart?**

Tomás opens Career Stats because of the notification badge. The scatter plot fills the center panel. He sees 8 dots scattered on a chart with axes he doesn't immediately understand.

"Architectural Complexity (hooks x agents)" — he reads the x-axis label. He knows what hooks and agents are from the campaign. He doesn't know what multiplying them together means as a metric. The numbers on the axis (4, 6, 8, 10, 12) are small — his configs have been simple.

"Pre-ranking Accuracy (%)" — the y-axis. He vaguely remembers the "pre-ranking accuracy" stat from the transparency drawer. He thinks it has something to do with whether the game's suggestions are right.

His 8 dots are clustered in a small region: complexity 4-12, accuracy 35-65%. A thin line connects them. The line wobbles — no clear trend.

**Minute 0:30 — The Quadrant Labels**

He notices faint text in the corners: "Sweet Spot" (upper-left), "Rare Mastery" (upper-right), "Rethink" (lower-left), "Coupling Hell" (lower-right).

"Coupling Hell" — he laughs. He doesn't know what coupling means in an engineering context, but the label sounds ominous and funny. He screenshots it for his Discord group chat.

His dots are mostly in the "Rethink" and lower-"Sweet Spot" area. None of them are in "Rare Mastery" or "Coupling Hell" — his configs are too simple for either extreme.

**Minute 1:00 — Hovering the Dots**

He hovers over his worst dot — the lowest one, sitting at complexity 6, accuracy 38%.

```
Config v3 — (unnamed)
Sessions: 6   Pass rate: 33%
Accuracy: 38%  (2/6 sessions matched)
Complexity: 6 (2 agents x 3 hooks)
Used: Sessions 12–17 (6 weeks ago)
```

Pass rate 33%. He remembers this config. It was his first attempt after the tutorial where he tried to add hooks between his scout and striker without really understanding what the hooks did. The scout was broadcasting on a channel the striker wasn't listening to. The whole system was broken, not because it was complex, but because it was misconfigured.

He hovers over his best dot: complexity 10, accuracy 65%.

```
Config v7 — (unnamed)
Sessions: 7   Pass rate: 71%
Accuracy: 65%  (5/7 sessions matched — low sample)
Complexity: 10 (3 agents x 3-4 hooks)
Used: Sessions 28–34 (last week)
```

This is his current config. Pass rate 71% — his best yet. Accuracy 65%. The "(low sample)" note tells him the percentage might change as he plays more sessions.

**Minute 2:00 — The Implicit Lesson**

Tomás doesn't do any deep analysis. But looking at the chart, he absorbs something: his dots have been moving upward and slightly rightward over time. The trajectory line, even though it wobbles, trends from the bottom-left toward the middle. His configs are getting better — more complex and more accurate simultaneously.

He doesn't think of this as "learning architectural modularity." He thinks of it as "I'm getting better at the game." But the chart gives him a shape for that feeling. The trajectory is visible. The improvement is not just a win-rate number — it's a direction in a two-dimensional space.

He notices the "Sweet Spot" label in the upper-left. His trajectory is heading toward it. He doesn't need to understand coupling theory to know that "Sweet Spot" sounds like where he wants to be.

**Minute 3:00 — Resolution**

Tomás closes the screen. He doesn't change his behavior immediately. But the scatter plot has planted a seed: there is a relationship between how he builds his configs and how well the game can help him diagnose problems. Simpler, cleaner configs lead to better suggestions. That's a useful thing to know, even if he can't articulate why.

Over the next two weeks, he checks the scatter plot after every 3-4 sessions. He watches his newest dot move. When it drifts downward (accuracy dropping), he feels a mild unease — the same feeling as watching a grade drop. When it holds steady or rises, he feels confirmed. The chart becomes a passive feedback loop, shaping his config decisions without him consciously optimizing for it.

**What he does next:** Continues playing, occasionally checking the chart. In three weeks, he'll have enough dots that the trajectory tells a clear story. By then, he'll have internalized the heuristic: "when I add hooks, check if accuracy holds. If it drops, I added the wrong kind of complexity."

**UI Annotations:**
- Notification badge on Career Stats icon: small teal circle with number "1"; appears once, disappears after first visit; standard notification pattern, no special treatment
- "(low sample)" annotation: appears in dim italic text next to the accuracy percentage on hover cards when n < 10; signals statistical uncertainty without requiring the player to understand confidence intervals
- Trajectory line for 8 points: short, with visible wobble; the line is intentionally not smoothed (no bezier interpolation at this scale) — the wobble is honest, showing that early-career trajectories are noisy
- Quadrant labels at Tomás's scale: because his dots are clustered in the lower-left, only "Rethink" and "Sweet Spot" are visible in his viewport; "Rare Mastery" and "Coupling Hell" are off-screen to the right, discoverable by zooming out or scrolling

---

### Journey: Kira, 38, competitive Gauntlet player, 400+ hours

**Context:** Kira is in the top 50 on the Gauntlet leaderboard. She has 47 config versions with enough data for scatter plot inclusion. She uses the scatter plot weekly as a strategic planning tool. She is not a casual viewer of this chart — she treats it as a performance dashboard. She has just completed a two-week experiment with a new command-agent architecture and is about to evaluate the results.

**Minute 0:00 — The Dashboard View**

Kira opens Career Stats. The scatter plot is dense with 47 data points spanning a wide range: complexity from 6 (her tutorial-era configs) to 112 (her most ambitious 8-agent, 14-hook command architecture). Accuracy ranges from 31% to 88%.

She immediately enables two toggles: "Show efficiency frontier" and "Color by config era" (a toggle that assigns different hue shifts to configs from different 30-session windows — early career in blue, mid-career in green, recent in gold). The chart transforms: her trajectory is now a color-coded path from blue (lower-left cluster, simple early configs) through green (the broad middle, where she spent most of her mid-career iterating) to gold (the recent 8 dots, clustered in the upper portion of the high-complexity region).

Her Pareto frontier is a steep curve: it rises sharply from complexity 6 to complexity 30 (accuracy climbs from 55% to 78%), then flattens. Between complexity 30 and complexity 80, accuracy holds between 72% and 81%. Above complexity 80, accuracy drops — her frontier dips to 68% at complexity 112.

The frontier shape tells the story: beyond complexity 30, additional architectural complexity doesn't improve diagnostic quality. It's a plateau. And past complexity 80, it actively degrades.

**Minute 1:00 — Evaluating the Experiment**

Her two newest dots (gold, prominent) represent configs v46 and v47 — the command-agent experiment. V46: complexity 78, accuracy 69%. V47 (after tuning based on v46's results): complexity 74, accuracy 74%.

She traces the improvement: v46 was below the Pareto frontier (69% accuracy where her frontier shows she can achieve 75% at that complexity). V47 sits on the frontier — she recovered to her personal best at that complexity level.

But she's dissatisfied. V47's accuracy of 74% is no better than configs she ran at complexity 35 two months ago. The command-agent architecture is more capable (pass rate 82%, her highest ever) but no more debuggable than a config half its complexity.

She hovers over v47's dot. The card shows:

```
Config v47 — "Hydra-2" (player-named)
Sessions: 11   Pass rate: 82%
Accuracy: 74%  (8/11 sessions matched — sample growing)
Complexity: 74 (6 agents x 12-13 hooks)
Used: Sessions 388–398 (this week)
```

She compares to v31, a mid-career config she remembers fondly:

```
Config v31 — "Clean Chain"
Sessions: 22   Pass rate: 76%
Accuracy: 79%  (17/22 sessions matched)
Complexity: 28 (4 agents x 7 hooks)
Used: Sessions 201–222 (3 months ago)
```

V31: 28 complexity, 79% accuracy, 76% pass rate. V47: 74 complexity, 74% accuracy, 82% pass rate. She gained 6 percentage points of pass rate at the cost of 5 percentage points of accuracy and nearly 3x the complexity.

The scatter plot makes this tradeoff visual. V31 sits in the upper-left of the high-performing region. V47 sits lower and far to the right. The line between them is a diagonal that crosses the "is this worth it?" threshold.

**Minute 3:00 — The Strategic Decision**

Kira zooms into the complexity 60-90 range. She has 8 data points here, spanning configs v38 through v47. The local trajectory is revealing: her first attempts at high-complexity configs (v38, v39) had terrible accuracy (52%, 48%). She gradually improved: v42 hit 66%, v44 hit 71%, v47 hit 74%.

The local trajectory is climbing. She's learning to build complex configs that remain diagnostically legible. The slope of improvement is about +3 accuracy points per config version in this complexity range.

If the trend holds, v50 or v51 might break into "Rare Mastery" territory — complexity 70+ with accuracy above 78%. That would mean she can build architectures that are both highly capable AND highly debuggable. The scatter plot shows her how many iterations she needs.

She opens a text file on her second monitor and writes:

```
Hydra experiment — scatter plot review:
- v47 at 74% accuracy is ON my Pareto frontier at complexity 74
- But the frontier is flat: 74% at c74 vs 79% at c28
- The question: is 82% pass rate worth losing 5pp accuracy?
- Local trend: +3pp/version in c60-90 range. 2-3 more iterations to test if I can break 78% at c70+.
- Decision: continue iterating. Goal = complexity 70, accuracy 78%, pass rate 80%.
```

**Minute 5:00 — The Community Angle**

Kira exports a screenshot of her scatter plot (the game's built-in screenshot feature captures the chart at 2x resolution with the game's UI chrome). She posts it to the competitive channel on Discord with the caption: "11 months, 47 configs. The climb from Rethink to the edge of Rare Mastery."

The image generates discussion. Other top-50 players share their scatter plots. Kira notices a pattern: players who favor linear relay chains (like her "Clean Chain" v31) cluster in the Sweet Spot with high accuracy and moderate complexity. Players who use command-agent star topologies cluster in the lower-right with high complexity and variable accuracy. Players who use hybrid topologies — the ones consistently placing in the top 20 — have dots scattered across the upper half at all complexity levels.

The scatter plot becomes a community artifact. Config archetype conversations now reference quadrant positions: "My build is Sweet Spot at c30/a76, trying to push into Rare Mastery without dropping below a70."

**What she does next:** Builds v48, a hybrid topology informed by the community comparison. She predicts it will land at complexity 65, accuracy 76%. She'll check the scatter plot in 10 sessions.

**UI Annotations:**
- "Color by config era" toggle: cycles through 3 color modes — (1) pass rate (default green/amber/red), (2) config era (blue/green/gold gradient by chronological order), (3) monotone (all dots the same neutral grey, trajectory line only). The toggle is a small 3-state button in the chart header, icon-only (🎨) with tooltip explaining each mode
- Dense scatter plot (47 points): at default zoom, some dots overlap; scroll-wheel zooms in/out with the mouse position as the anchor; click-and-drag pans; double-click resets to fit-all; standard chart interaction model
- Export/screenshot button: camera icon in the chart header; captures the chart at 2x resolution as a PNG with the game's dark background; includes the player's name and total sessions in a small watermark in the lower-right corner
- Pareto frontier at 47 points: a smooth curve (cubic spline interpolation through the frontier points); the frontier shifts subtly each time a new config version is added if it extends the upper envelope; the shift is animated (300ms, the new segment of frontier curves into place)

---

## Strengths

**Makes the accuracy-complexity tradeoff viscerally tangible.** Every player intuitively suspects that more complex configs are harder to debug. The scatter plot transforms this suspicion into visual proof — their own data, plotted on their own chart. The tradeoff is no longer abstract. It's a dot below the frontier. It's a trajectory line that dips when they over-reach. The scatter plot externalizes an internal tension the player has been feeling.

**Creates a career-arc narrative that no single stat can capture.** Win rate is a number. EDT trajectory is a line. But the scatter plot is a *shape* — a two-dimensional trace of the player's entire history of architectural decisions. Players who share their scatter plots are sharing their learning story. The shape of the constellation IS the story: early confusion, gradual improvement, over-reach, retreat, consolidation, mastery push. No other game stat produces a shape with this much narrative resolution.

**Gives vocabulary to architectural strategies.** The quadrant names — Sweet Spot, Rare Mastery, Rethink, Coupling Hell — become community vocabulary. Players describe their current position in the space: "I'm stuck in the Sweet Spot at c30." Configs are evaluated not just by pass rate but by their position in the accuracy-complexity plane. This vocabulary enriches the meta-discussion without the game needing to teach it explicitly — the labels teach themselves.

**The Pareto frontier is a personal challenge.** The frontier says "this is the best you've ever done at each complexity level." Every new config version either extends the frontier (new personal best) or falls below it (suboptimal). The frontier becomes a quiet, persistent challenge: can you push it higher? Can you extend it to the right? The frontier is not a leaderboard — it's a mirror. Competition with your own history is less toxic and more motivating than competition with others.

**Connects diagnostic quality to architectural quality, teaching a real engineering principle.** The core insight the scatter plot teaches — that modular, loosely-coupled systems are easier to diagnose than tightly-coupled monoliths — is one of the foundational principles of software architecture. Players who internalize the scatter plot's lesson have learned something transferable to any engineering context. The game doesn't lecture. The scatter plot shows.

---

## Weaknesses

**The complexity metric (hooks x agents) is reductive.** Multiplying hooks by agents captures wiring density but not wiring topology. A 6-agent config with 12 hooks arranged in a clean pipeline has the same complexity score as a 6-agent config with 12 hooks arranged in a fully-connected mesh — but the mesh is dramatically harder to diagnose. The scatter plot may show two dots at the same x-position with wildly different y-values, and the player cannot tell from the chart why they differ. Topology matters, but the metric doesn't encode it.

**Potential mitigation:** Add a "topology complexity" variant that weights hooks by their fan-out (a hook that broadcasts to 3 agents contributes more complexity than a hook that broadcasts to 1). But this increases the metric's opacity — players can understand "hooks x agents" intuitively; they cannot understand a weighted fan-out score without explanation.

**Requires many data points to be meaningful.** The scatter plot unlocks at 8 config versions with 5+ sessions each — roughly 40-80 sessions of play. Casual players who change configs rarely may take 6+ months to accumulate enough data points. By then, their early configs are so distant in memory that the historical trajectory is not personally meaningful. The chart rewards players who iterate frequently and play long sessions — which is already the player profile least in need of motivational feedback.

**The "Rare Mastery" quadrant may be practically empty for most players.** Building configs with complexity 60+ that maintain 75%+ pre-ranking accuracy requires a level of architectural discipline that most players never reach. If the upper-right quadrant is always empty, the label "Rare Mastery" becomes aspirational at best and discouraging at worst. The quadrant exists as a design-space landmark, not a realistic destination for the median player.

**Chart literacy is assumed, not taught.** Scatter plots are not universally intuitive. Players without data visualization experience may not immediately understand what the axes mean, why the dot positions matter, or what the trajectory implies. The quadrant labels help, but the core mechanic — reading a two-axis chart and interpreting clusters and trends — is a learned skill. The game should consider a first-visit guided tour that walks through the player's first scatter plot dot by dot.

**Config version boundaries are ambiguous.** When does a new config version begin? If the player changes one hook, is that a new version? If they change a rule priority, is that a new version? The game needs a clear definition of "config version" — perhaps: any change to the blueprint editor that is followed by at least one EXECUTE creates a new version. But trivial changes (reordering one rule pair) would create sparse, noisy data points. A threshold may be needed: "a new config version is registered when the config differs from the previous version by 2+ elements (added/removed/changed skills, rules, hooks, or context settings)."

---

## Interaction Effects

**With 4.64 (Pre-ranking accuracy as a displayed stat):**
The scatter plot is the spatial extension of the accuracy stat. Where 4.64 gives a single number ("your accuracy is 71%"), the scatter plot contextualizes that number against complexity: "your accuracy is 71% *at complexity 42*, and here's how that compares to your accuracy at every other complexity level you've ever tried." The stat is a point; the scatter plot is the field. Players who engage with 4.64's accuracy number will naturally want the scatter plot; players who skip 4.64 will not understand what the y-axis means. The dependency is directional: scatter plot requires accuracy stat understanding.

**With 4.25 (EDT trajectory as career metric):**
Both the scatter plot and EDT trajectory are career-arc diagnostics. They belong on the same Career Stats screen, side by side or as tabbed views. A player whose EDT trajectory is improving (matches are becoming more contested) while their scatter plot shows increasing complexity with stable accuracy is in an ideal growth pattern: building more capable architectures that remain debuggable and create genuine contests. If EDT improves but accuracy drops, the player is winning harder but understanding less — a fragile state. The two metrics together create a richer diagnostic than either alone.

**With 4.63 (Player-configurable pre-ranking weights):**
When a player adjusts pre-ranking weights, the accuracy number at each complexity level may shift. The scatter plot could gain an overlay mode: "Show accuracy under previous weights" vs. "Show accuracy under current weights." This would let the player see whether their weight tuning improved accuracy across the board or only at specific complexity levels. Weight changes that improve accuracy at low complexity but degrade it at high complexity reveal a calibration mismatch: the weights are tuned for simple architectures and fail on complex ones.

**With 4.95 (Accuracy leaderboard opt-in):**
If the community leaderboard groups players by complexity tier, the scatter plot could overlay community benchmarks: "average accuracy at complexity 30-40 is 72%." The player's dot at complexity 35 / accuracy 68% is then legibly below-average for their complexity tier. This external reference point prevents the scatter plot from being purely self-referential — it connects the personal trajectory to the community distribution. But it also introduces comparison anxiety that the self-referential chart avoids.

**With 8.09 (Diagnostic layer as teaching arc):**
The scatter plot is the capstone of the teaching arc. The arc progresses: learn QUICK mode → learn THOROUGH mode → learn what pre-ranking accuracy means → see accuracy as a stat → see accuracy in context of complexity across your entire career. Each step builds vocabulary and conceptual scaffolding for the next. The scatter plot should unlock last in this sequence — it is the most information-dense diagnostic surface and requires all prior concepts to be understood.

**With campaign missions (missions 6-7, command agent introduction):**
The campaign teaches command agents in missions 6-7. After completing these missions, the player's first command-agent configs will appear as new dots on the scatter plot — likely at higher complexity and potentially lower accuracy than their pre-command configs. The scatter plot visually marks the "I learned command agents" transition as a rightward jump in complexity. If accuracy drops simultaneously, the chart shows that the new capability came at a diagnostic cost. This is a natural teaching moment: the game doesn't need to say "command agents are harder to debug." The chart says it.

---

## Comparable Games and Media

**GitHub's contribution heatmap (commit history):** GitHub's familiar green-square grid shows commit frequency over a year — a two-axis (day of week x week of year) visualization of a developer's activity. It is not a performance metric; it is a behavioral artifact. Players share it, judge it, build identity around it. The scatter plot serves the same role: it is not a score, it is a behavioral fingerprint. The fact that GitHub's contribution chart became a cultural phenomenon despite being a simple grid suggests that career-arc visualizations have inherent appeal when they encode identity.

**Chess.com's Insights dashboard (accuracy vs. game phase):** Chess.com's premium tier shows accuracy broken down by game phase: opening, middlegame, endgame. A player might have 89% opening accuracy but 67% endgame accuracy — revealing that they are book-strong but calculation-weak. The scatter plot is structurally similar: it breaks a single metric (pre-ranking accuracy) into a second dimension (complexity) and reveals where the player is strong and where they struggle. The insight is in the cross-tabulation, not the individual metric.

**Strava's fitness-fatigue chart (training load vs. performance):** Strava shows athletes a chart with two overlaid lines: fitness (long-term training load) and fatigue (short-term training load). The gap between them is "form" — readiness to perform. Athletes learn to read the chart intuitively: when fitness is high and fatigue is low, race. When both are high, rest. The scatter plot teaches a similar paired reading: complexity is "ambition" and accuracy is "legibility." When complexity is high and accuracy is high, the player is in form. When complexity is high and accuracy is low, they've overreached.

**Factorio's production statistics screen:** Factorio tracks production and consumption of every item over time, displayed as line charts with configurable time windows. Veteran Factorio players obsess over these charts — they reveal bottlenecks, over-production, and consumption spikes that are invisible during live gameplay. The scatter plot serves the same role: it reveals architectural patterns (the coupling-accuracy tradeoff) that are invisible during moment-to-moment config editing. Both charts reward players who step back from the immediate task to analyze the meta-pattern.

**"Moneyball" scatter plots (sabermetrics):** The book and film popularized the use of scatter plots to evaluate baseball players: on-base percentage vs. slugging percentage, with each dot being a player. The insight was that the upper-right quadrant (high OBP + high SLG) was undervalued by traditional scouting. Robot Uprising's scatter plot has the same aspirational geometry: the upper-right quadrant (high complexity + high accuracy) is the "Rare Mastery" zone that players want to reach. The visual language is borrowed directly from sports analytics.

---

## Sensory Description

**The chart background:** A dark, deep navy (#0f0f23) — darker than the game's standard panel background, giving the chart a "window into data" feeling. Subtle grid lines in a blue-grey (#1e1e3a) mark every 10% on the y-axis and every major tick on the x-axis. The grid is barely there — visible only when you look for it, never competing with the data points.

**The data points at rest:** Small circles, 6px radius, sitting quietly on the chart. Their fill colors — green, amber, dull red — are muted, not saturated. The green is a soft jade (#4ade80 at 70% opacity), the amber a warm gold (#fbbf24 at 70% opacity), the red a dusted rose (#f87171 at 70% opacity). They look like colored beads laid on dark velvet. No drop shadows. No outlines heavier than 1px. The dots are data, not decoration.

**The current config dot:** Larger (10px), brighter, rendered in the game's signature teal (#2dd4bf). It pulses gently — a 3-second sinusoidal cycle where the opacity breathes between 80% and 100% and a soft glow (4px gaussian blur, same teal, 30% opacity) expands and contracts by 2px. The pulse is heartbeat-slow. It says: "this is alive. This is now. This is you."

**The trajectory line:** A thin thread (1.5px) connecting the dots in chronological order. The oldest segment is ghostly — 20% opacity, barely distinguishable from the grid. Each subsequent segment is slightly brighter, building toward the newest segment at 60% opacity. The line uses subtle bezier curves at each bend, softening the angles into a continuous path. When the player's trajectory doubles back (retreating from high complexity to lower complexity), the line loops visibly — the retreat is not hidden. The shape of the line IS the learning story.

**On hover — the floating card:** When the cursor approaches within 20px of a dot, the dot swells to 8px (100ms ease-out). When the cursor enters the dot's hover zone (24px radius), a floating card appears 8px above and to the right, anchored to the dot. The card is a dark panel (#1a1a2e) with a thin border matching the dot's fill color. Inside: the config name in medium-weight type, then four lines of stats in regular weight. The card has a 2px rounded corner radius — just enough to soften, not enough to look bubbly. It appears with a 120ms fade-and-rise animation (translating 4px upward from its final position while fading in from 0% to 100% opacity).

**The Pareto frontier:** When toggled on, the frontier draws itself from left to right over 600ms — a cyan dashed line (#22d3ee, 60% opacity) that traces the upper envelope of the scatter. The line uses cubic spline interpolation, producing a smooth curve that touches the frontier dots without sharp bends. The area above the frontier fills with a barely-perceptible teal tint (3% opacity) — "uncharted territory." When a new config version extends the frontier, the new segment animates into place: the frontier's rightmost point glides to the new position over 300ms, the dashed pattern flowing along the line as it grows. The extension animation is satisfying — a visual reward for pushing the boundary.

**Sound design:** The scatter plot screen has no ambient music of its own — it inherits the Career Stats screen's ambient layer (low drone, data-center-hum texture, 40% volume). Hovering over a dot plays a soft, short tone — the pitch mapped to accuracy (higher accuracy = higher pitch, within a narrow range of a major third). The Pareto frontier toggle plays a subtle "connection" sound — a quiet ascending arpeggio of three notes, suggesting links forming. The export/screenshot button plays the game's standard UI capture sound: a crisp digital shutter click, mechanical and brief.

**The first-visit experience:** On the player's first visit to the scatter plot, the dots do not appear all at once. They fade in one by one, oldest to newest, at 200ms intervals. Each dot materializes with a tiny "pop" — a 30ms scale-up from 0% to 110% then settle to 100%. As each dot appears, the trajectory line segment connecting it to the previous dot draws itself (150ms). The full 8-dot entrance sequence takes about 2.5 seconds. It's a miniature ceremony — the player's history, dot by dot, assembling into a shape they've never seen before. The first time is an event. Subsequent visits load instantly.
