# Sample Size Warning Threshold for Filtered Career Analysis

**Aspect:** 4.69e-i-a — Sample size warning threshold: minimum match count for a reliable filtered analysis and how the UI communicates when a filtered set is too small; exact UI: warning banner, disabled Run Analysis button, or advisory text only?

**Parent:** 4.69e-i — Match-scope filter UI design (debrief-career-analysis-scope-filter.md)
**Grandparent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-i-b (Opponent list sorting and search at scale); 4.69e-i-c (Filtered analysis data points in season health trend graph); 4.69e-i-d (Scope summary legibility in exports); 4.69e-i-e (Auto-filter suggestion engine)
**Related:** 4.69 (agent multi-cluster detection); 4.69b (combined coverage score); 4.68 (coverage % as season health); 4.69i (combined coverage minimum as secondary threshold gate); 4.69l (threshold recommendation engine)

---

## The Problem Being Solved

The filter shelf (4.69e-i) lets players run career analysis on a subset of their match history. This is powerful and necessary — but subsets can be tiny. A player who filters to "Quick assault only against Ravenhorn" might end up with 4 matches. Career analysis on 4 matches is not meaningless, but it is fragile — a single anomalous match can dominate the coverage percentages, and the cluster detection logic that was calibrated for 50+ match sets will fire on patterns that are pure noise at this sample size.

**The core tension:** The system should not *prevent* small-sample analysis — sometimes a player genuinely wants to look at those 4 matches — but it should not let the player mistake that analysis for the same kind of reliable structural verdict that 200-match analysis delivers. The warning threshold design is about communicating **epistemic fragility** without blocking action.

This is subtler than it looks. Get it wrong in one direction and the UI screams warnings on every filtered analysis, training players to ignore them. Get it wrong in the other direction and players rebuild agents based on 6-match "evidence" that was noise.

There are three main design approaches, each with a different philosophy:

1. **The Soft Advisory Model** — always allow, show advisory text that scales with sample size
2. **The Hard Gate Model** — disable the Run Analysis button below a hard threshold
3. **The Contextual Warning Model** — allow running but surface prominent warnings that scale from subtle to alarming

Plus hybrid combinations. Each has distinct interaction consequences.

---

## Threshold Calibration: What Numbers Matter?

Before designing the UI, we need to think about what sample sizes actually mean for this system.

**Career analysis mechanics (inferred from context):**
- The system computes element coverage % — how often element E appeared in a "failure adjacency" across all matches in the set
- Cluster detection fires when an element appears in 3+ distinct contexts across matches
- Combined coverage score is the union of coverage from all contexts

**The statistics of small samples:**
- At N=4 matches: a single element appearing in all 4 failures registers at 100% coverage — completely uninformative
- At N=10: 3 appearances = 30% coverage — cluster threshold (N=3) fires, but 3 out of 10 is not statistically remarkable
- At N=20: 3 appearances = 15% coverage — starting to be more meaningful
- At N=30: coverage percentages begin to behave like the system was designed for
- At N=50: full statistical reliability for the cluster thresholds as calibrated

The right threshold model probably has **three zones**, not two:
- **Zone 1 (N < 10):** Critically small — analysis is exploratory only, structural conclusions are unreliable
- **Zone 2 (10 ≤ N < 30):** Marginal — analysis is directional but cluster flags have elevated false positive rates
- **Zone 3 (N ≥ 30):** Reliable — analysis behaves as designed

---

## Option A: The Soft Advisory Model — "Show Me Everything, Whisper The Caveats"

### How It Works

The Run Analysis button is **never disabled** regardless of match count. Analysis always runs on whatever the filter produces. Instead, the results themselves carry embedded reliability indicators that scale with sample size.

**Before running (the filter shelf):**
The match counter in the filter shelf footer changes color based on sample size zone:
- N ≥ 30: `89/247 matches` — neutral gray text, no special treatment
- 10 ≤ N < 30: `17/247 matches` — amber text, small info icon. Hovering the icon shows: "Fewer than 30 matches — coverage percentages may be less reliable. Results are directional."
- N < 10: `6/247 matches` — muted red text, small warning icon. Hovering: "Fewer than 10 matches — structural conclusions are not reliable at this sample size. Use results for exploration only."

**After running:**
The filtered analysis amber header band gains an additional line in small text:
```
● FILTERED ANALYSIS  ·  17 matches  ·  Excl. VoidEater_Prime
  ⚠ Small sample: results are directional, not diagnostic
```

Each element in the result list shows a small reliability bar — a secondary micro-visualization next to the coverage percentage:
```
RELAY-C · hook threshold · 41.2%  ████░░░░  (confidence: low)
```
The reliability bar fills proportionally to how far N is from 30: at N=6 the bar is 20% filled (very low confidence), at N=25 it's 83% filled (moderate confidence), at N=30+ it's full and doesn't appear.

For N < 10, the cluster flag display gets a disclaimer overlay:
```
⚠ CLUSTER FLAG (low confidence)
RELAY-C appeared in 3 distinct contexts
Note: At 6 matches, 3 appearances may be coincidental.
Minimum 30 matches recommended for reliable cluster detection.
```

### Strengths
- **Respects player agency.** Players who deliberately want exploratory analysis on small sets (e.g., "show me what happened in my last 6 Quick assaults against Ravenhorn before I make a decision") are not blocked.
- **Scales gracefully.** The warnings get louder as sample size shrinks — there's no cliff-edge behavior.
- **Teaches statistics passively.** Players who see the reliability bar fill up as they include more matches learn intuitively that more data = more reliable. The system models good epistemic hygiene without lecturing.
- **No frustration.** Experienced players who understand the limitations can run small-sample analysis without jumping through hoops.

### Weaknesses
- **Soft warnings are ignored.** The primary failure mode: players habituate to the amber text and small confidence bars and stop reading them. After the 10th "small sample" advisory, it becomes visual noise.
- **False confidence at the margin.** At N=28, the advisory says "directional, not diagnostic" but most players will treat 28-match analysis as close enough to reliable. The gradient creates uncertain ground.
- **No guidance on what to do.** The advisory tells the player the analysis is unreliable but doesn't tell them what to do about it. "Include more matches" is obvious but the UI doesn't facilitate that action from the warning.

---

## Option B: The Hard Gate Model — "Enough Data Or Nothing"

### How It Works

The Run Analysis button is **disabled** when the active filter produces fewer than N matches, where N is the configured minimum (default: 15 matches). The button becomes gray and non-interactive. Its tooltip reads: "Add more matches to run analysis — minimum 15 required (currently 8)."

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCOPE   [Excluding Ravenhorn ▼]                  [Save filter] [Run Analysis]│
│ ─────────────────────────────────────────────────────────────────────────────│
│  BY OPPONENT                        BY SCENARIO TYPE          BY CONFIG VER  │
│  ┌─────────────────────────┐        [✓] Quick assault (34)    [v3.0 - now  ]│
│  │ [✓] All opponents       │        [ ] Standard (112)                      │
│  │ [  ] Ravenhorn ⚠️        │        [ ] Holdout (67)                        │
│  │ [✓] Gx_Mako (2)         │        [ ] Extraction (48)                     │
│  │ [✓] Synthetix_7 (1)     │                                                │
│  └─────────────────────────┘                                                │
│                                                          8/247 matches ⛔    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ⛔ Minimum 15 matches required to run analysis.  [Add matches →]           │
│                                                          [Run Analysis] ░░░  │
└─────────────────────────────────────────────────────────────────────────────┘
```

The `[Add matches →]` button in the minimum-matches banner is a **quick-fix affordance** — clicking it cycles through three suggestions:
1. "Include Quick assault Standard too? (adds 112 matches)" — toggles Standard on immediately if clicked
2. "Include earlier config versions? (adds 40 matches)" — expands config version filter
3. "Include all opponents? (removes opponent filter entirely)"

The suggestions are ranked by "easiest path to N=15 with minimal scope change." If the player is filtered to one scenario type, adding another scenario type is suggested first. If they're filtered to two opponents, removing the rarest one is suggested.

**Above the minimum (15-29 matches):** The button becomes enabled, but amber. Clicking shows a confirmation:
```
Run Analysis with limited sample?
You have 17 matches — results will be directional.
Cluster flags at this sample size have elevated false-positive rates.
[Run Anyway]  [Expand scope first]
```

**At or above the reliable threshold (30+ matches):** No warnings. Button is normal.

### Strengths
- **Forces deliberate overrides.** Players cannot accidentally run and act on 6-match "evidence" — they have to explicitly acknowledge the limitation to proceed.
- **The suggestion engine is genuinely helpful.** Rather than just blocking, the `[Add matches →]` affordance tells the player *how* to get to reliable territory. This transforms the gate from a frustration into a guide.
- **Protects against over-fitting.** The system models that it knows something about what it can reliably detect. The hard gate is an expression of epistemic honesty: "I can't give you a useful answer with this data, here's how to give me more."
- **Confirmation at the margin.** The "Run Anyway" dialog at 15-29 matches teaches the statistics explicitly: "cluster flags have elevated false-positive rates" is a complete and correct explanation. Players who see this and still proceed do so knowingly.

### Weaknesses
- **Frustrating for power users.** A veteran who knows the analysis is unreliable and wants to run it anyway has to navigate a gate and confirmation dialog every time. This will generate resentment quickly among the players who most deeply understand the system.
- **Threshold feels arbitrary.** Why 15? Why not 12? Why not 20? Hard thresholds always feel arbitrary because they are. Players will notice and argue.
- **Kills exploratory workflows.** Part of the value of the filter shelf is enabling investigative queries: "let me look at just these 4 matches against Ravenhorn to understand the pattern before running a full analysis." Blocking this workflow for low match counts prevents legitimate use cases.
- **The `[Add matches →]` suggestions can feel paternalistic.** The system tells you what to include in your analysis. Some players want to define their own scope without suggestions.

---

## Option C: The Contextual Warning Model — "The Thermometer System"

### How It Works

This option treats the match counter as a **reliability thermometer** — a persistent, spatially stable element in the filter shelf that communicates sample size health continuously without interrupting the flow.

The thermometer is a small vertical element pinned to the right side of the filter shelf, always visible, updating in real time. It has four zones:

```
  ┌───┐
  │   │  ← top: N ≥ 50 (fully reliable)
  │█░█│
  │███│  ← upper-mid: 30-49 (reliable)
  │███│
  │▓▓▓│  ← lower-mid: 15-29 (directional, amber)
  │▒▒▒│  ← bottom: < 15 (unreliable, red)
  └───┘
   N=8
```

Fill color:
- Bottom zone (N < 15): soft red fill, pulsing at 1.5-second cycle — not alarming, but alive
- Lower-mid (15-29): amber fill, static
- Upper-mid (30-49): green fill, static
- Top (N ≥ 50): bright green fill, small checkmark appears at top

The thermometer replaces the match counter text — the number is displayed below the thermometer in small text. The visual height of the fill communicates reliability intuitively: "half full" means "half reliable."

**The Run Analysis button** is always enabled but changes appearance with sample size:
- N ≥ 30: Standard dark button, white text: `[Run Analysis]`
- 15 ≤ N < 30: Amber outline button (amber border, dark fill): `[Run Analysis]`
- N < 15: Red-tinted button with a small warning icon: `[⚠ Run Analysis]`

Clicking the amber or red-tinted button produces **no confirmation dialog** — the button click works immediately. The visual differentiation of the button is the warning; the click is still unimpeded.

**After running with a small sample:**
The results render normally, but each coverage percentage shows a second number in parentheses with subdued styling: the "effective confidence interval." Not a statistical interval (that would require more context) — rather a rough heuristic displayed as a percentage ± a margin based on sample size:

At N=8:
```
RELAY-C · hook threshold · 41.2% (±35%)
```

At N=17:
```
RELAY-C · hook threshold · 41.2% (±18%)
```

At N=35:
```
RELAY-C · hook threshold · 41.2% (±8%)
```

The ±% is computed as `25 / sqrt(N)` — a very rough but behaviorally correct approximation. At N=8, ±35% means "the true coverage could plausibly be anywhere from 6% to 76%." That's not a precise statistical interval but it communicates the right intuition: small sample, wide uncertainty. Hovering on the ±% shows a tooltip: "Coverage estimate confidence — based on sample size. Increase matches in scope for more reliable results."

**For cluster flags at small N:**
The cluster flag warning changes its icon and label by sample size:
- N ≥ 30: `⚠ CLUSTER FLAG` — standard
- N < 30: `⚠ CLUSTER FLAG (low confidence)` — same icon, slightly smaller text, a subtle downward-pointing chevron showing the confidence level
- N < 15: `⚠ POSSIBLE CLUSTER FLAG` — different text, acknowledging uncertainty in the detection itself

### Strengths
- **The thermometer is spatially stable.** Once a player learns to check the thermometer height before acting on results, that habit is effortless — the thermometer is always in the same place, always updating. It becomes a peripheral information channel requiring minimal attention.
- **No gates, no dialogs, no friction.** Players who understand the limitations can run any analysis at any sample size without being impeded. The system trusts player judgment while informing it.
- **The confidence interval is honest and intuitive.** "41.2% (±35%)" tells the player something true: that this number is very uncertain. It doesn't prevent the player from using it; it contextualizes it correctly.
- **Scales with visual prominence.** The thermometer's red pulsing at N < 15 is more prominent than the amber static at N = 25 — the system's concern increases visually as reliability decreases.

### Weaknesses
- **The thermometer requires learning.** Players who have never seen this visual pattern need to learn what it means. The first time they see a red-pulsing thermometer, they may not know what to do.
- **The confidence interval numbers require interpretation.** "41.2% (±35%)" is harder to parse than "small sample — not reliable." Players who don't think in statistical terms will not know what to do with a ±35% margin.
- **No actionable guidance.** Like Option A, the Contextual Warning Model tells the player the analysis is uncertain without telling them what to do to improve it. The thermometer shows the problem; it doesn't suggest the solution.
- **The `[⚠ Run Analysis]` button differentiation may not be noticed.** Button color changes are subtle — many players don't look closely at button appearance. The thermometer may be more legible than the button variant.

---

## Option D: The Hybrid — "Advisory With Escape Hatch"

The strongest approach combines elements of all three options, calibrated to be maximally informative without blocking legitimate workflows.

### Core Design: The Reliability Band

The filter shelf gains a **horizontal reliability band** at the bottom — a thin bar (12px height) running the full width of the shelf, always visible. Color-coded:
- N ≥ 30: solid green, no text
- 15 ≤ N < 30: solid amber, text `Directional (N=17)`
- N < 15: solid red with subtle pulse, text `Exploratory only (N=8)`

The text in the band is small (10px) but legible. It never obscures content. It's the consistent "current state" indicator.

The Run Analysis button remains **always enabled** (no hard gate, respecting player agency).

However, when clicked with N < 15, a **lightweight toast notification** appears (not a modal dialog — a bottom-screen toast that auto-dismisses after 4 seconds):

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠  Running with 8 matches — results are exploratory               │
│     Coverage percentages may not reflect structural patterns        │
│     [Expand scope to 30+ for reliable results]      [Dismiss]      │
└─────────────────────────────────────────────────────────────────────┘
```

The `[Expand scope to 30+ for reliable results]` link in the toast opens the filter shelf with a suggestion indicator — the easiest path to N=30 is highlighted. This provides the actionable guidance that Option A and C lacked without blocking the analysis.

**Post-analysis warnings** use the `(±%)` confidence interval from Option C, but only for N < 30. At N ≥ 30, no intervals appear.

For cluster flags at N < 30, the flag renders as:
```
⚠ POSSIBLE CLUSTER FLAG (N=8)
RELAY-C appeared in 3 of 8 matches (3 distinct contexts)
Coverage estimate: 41.2% (±35%)
At this sample size, cluster detection has elevated false-positive rates.
Consider: Include more matches to confirm. [+ Expand scope]
```

The `[+ Expand scope]` link is always present in small-N cluster flag warnings — it opens the filter shelf directly so the player can act immediately.

### Threshold Constants (with rationale)

| Zone | N | Label | Behavior |
|------|---|-------|----------|
| Exploratory | < 15 | "Exploratory only" | Red band, toast on run, ±% on results, "possible cluster" flag |
| Directional | 15-29 | "Directional (N=X)" | Amber band, ±% on results, "low confidence cluster" flag |
| Reliable | 30-49 | *(no label)* | Green band, no special treatment |
| Robust | ≥ 50 | *(no label)* | Green band, no special treatment |

15 was chosen as the exploratory/directional boundary because: at N=15 the coverage percentage stabilizes enough that the ranked order of candidates is likely to be correct even if the exact percentages are noisy. At N<15, even the ranking is unreliable.

30 was chosen as the directional/reliable boundary because: the cluster detection logic (3+ appearances) fires at about 10% coverage for N=30 — below this, clusters can appear from noise. At N<30, the cluster flag becomes unreliable as a diagnostic (though not worthless).

---

## Player Journeys

### Journey: Danh, 28, Data Engineer at a Startup, Competitive Ladder Mid-Tier

**Context:** Danh loves systems and dashboards. He has played 212 career matches and recently lost 4 consecutive Quick assault matches against a specific high-pressure opponent named "Parallax_9." He wants to understand whether these losses represent a structural vulnerability or just Parallax_9 having a counter-strategy. He's about to filter to those 4 matches.

**Minute 0:00 — Opening the Filter Shelf**
Danh opens career analysis after the fourth loss. The full-scope result shows RELAY-C at 31% coverage — a familiar number he's been working on for two weeks. He expands the filter shelf and checks VoidEater_Prime details: adversarial signal strength only 8%. Not the poisoning issue. He's genuinely curious about the Parallax_9 losses specifically.

He unchecks everyone except Parallax_9. Match counter drops: 212 → 4 matches.

**Minute 0:15 — Noticing the Warning**
The reliability band at the bottom of the filter shelf turns red with a gentle pulse. Text reads: `Exploratory only (N=4)`. Danh hovers over it. Tooltip: "At 4 matches, coverage percentages reflect only these specific interactions and may not indicate structural patterns. Results are useful for exploration, not diagnosis."

Danh nods to himself — he knows this intellectually, he's a data engineer. He clicks Run Analysis anyway.

**Minute 0:16 — The Toast**
A bottom-screen toast slides in: "⚠ Running with 4 matches — results are exploratory. Coverage percentages may not reflect structural patterns. [Expand scope to 30+ for reliable results]" The analysis results are already rendering behind the toast.

Danh dismisses the toast immediately. He knows what he's getting into. The Run Analysis button didn't block him. He appreciates that.

**Minute 0:20 — Examining the Exploratory Results**
The filtered analysis result panel renders with the full amber header band: "FILTERED ANALYSIS · 4 matches · Parallax_9 only." Below each coverage percentage is a ±% confidence interval:
```
STRIKER-A · response latency · 75.0% (±44%)
RELAY-C · hook threshold · 50.0% (±35%)
SCOUT-B · scan range · 25.0% (±31%)
```

Danh reads this correctly: STRIKER-A at 75% (±44%) means "in all 4 Parallax_9 matches, STRIKER-A's response latency was a factor — but I can't tell if this is structural or specific to Parallax_9's tempo." The confidence intervals communicate that these aren't reliable estimates, they're directional pointers.

There's no cluster flag — the cluster detection requires 3+ distinct contexts and all 4 matches are the same scenario type, so the conditions aren't met.

**Minute 0:45 — The Action**
Danh opens STRIKER-A's agent inspector and looks at the match replays for all 4 Parallax_9 losses. In all 4, STRIKER-A's response latency hook is firing too slowly for Parallax_9's unusually fast deployment cadence. This is specific to Parallax_9's strategy — it's probably a response latency tuning issue, not a general structural problem.

Danh makes a targeted change to STRIKER-A's response latency threshold: bumps it up by one step. He doesn't run full career analysis — there's no point yet; it's a speculative change based on exploratory data.

**Minute 2:00 — Confirming with Full Scope**
Two sessions later, with 6 new Parallax_9 matches included (10 total), Danh re-runs the filtered analysis on Parallax_9-only. N=10 now — directional zone, amber band. STRIKER-A drops to 30% (±16%). The adjustment helped. But he only deploys a bigger intervention after the N gets to 20+.

**What Danh learned:**
The warning system taught him the right workflow: exploratory query at N=4, directional confirmation at N=10, reliable diagnosis at N=30+. The system modeled the correct statistical workflow without requiring him to know statistics.

**UI Annotations:**
- Reliability band: 12px horizontal band at the bottom of the filter shelf, transitions color with 300ms ease as match count crosses thresholds. Text in the band at N < 30 only.
- Toast notification: 360px wide bottom-right position, 4 second auto-dismiss, slight spring animation on entry. The `[Expand scope to 30+]` link is a genuine action (clicking opens the filter shelf with path-to-30 suggestion highlighted).
- ±% confidence intervals: displayed in muted text (60% opacity) next to each coverage %, size 11px, only for N < 30. Font: monospace to distinguish from the primary metric.

---

### Journey: Mira, 45, Elementary School Teacher, Casual Player, First Competitive Season

**Context:** Mira is new to competitive play. She's heard the career analysis tool is powerful. She has 67 career matches. She's experimenting with the filter shelf after seeing a community post about adversarial poisoning — she wants to try excluding one opponent she's suspicious of.

**Minute 0:00 — First Filter Attempt**
Mira expands the filter shelf for the first time. She can see her 9 opponents in the By Opponent list. She unchecks the opponent she's suspicious of (Crystalline_X, 12 matches). Counter: 67 → 55 matches. The reliability band stays green. She clicks Run Analysis.

No warnings. 55 matches is fine. The filtered analysis runs normally.

**Minute 0:30 — Getting Curious, Going Too Far**
Mira unchecks three more opponents to "see what the analysis looks like when it's more focused." Counter drops: 55 → 14 matches. The reliability band shifts to amber: `Directional (N=14)`.

Mira pauses. The band is amber now. She hovers over it — the tooltip reads: "At 14 matches, coverage percentages are directional but cluster detection may be less reliable. Results are useful for understanding rough patterns."

Mira interprets "directional" correctly-ish: it means "pointing somewhere but not a definitive answer." She runs the analysis.

**Minute 0:35 — The Results With Caveats**
The result panel renders with the amber header band. She sees small numbers next to the coverage percentages: `28.6% (±18%)`. She doesn't fully understand what ±18% means. She hovers on the ±% number.

Tooltip: "This coverage estimate has higher uncertainty due to the sample size (14 matches). The true value could be ~18 percentage points higher or lower. Include more matches for a more reliable estimate."

Mira understands "18 percentage points higher or lower" — she teaches measurement to kids, she knows what uncertainty means. She decides not to act on this specific result — she includes two more opponents to get back over 30. The band turns green.

**What Mira learned:**
The system never blocked her or yelled at her. The amber band and tooltip explained themselves clearly enough that she self-corrected without a tutorial. The ±% phrasing was accessible because "higher or lower" is more concrete than "confidence interval."

**UI Annotations:**
- Tooltip text calibration: uses "higher or lower" rather than "confidence interval" or "margin of error" — accessible phrasing tested against non-technical vocabulary. Same concept, different register.
- Band color shift: happens in real time as each checkbox is toggled, not only on Run Analysis click — so the player sees the band change while still building their filter.

---

### Journey: Ouray, 33, Senior Software Engineer, Zachtronics Veteran, Hardcore Config Designer

**Context:** Ouray has played 890 career matches. He is well past the point of not understanding statistics. He runs career analysis multiple times per session for different purposes — full-scope for the longitudinal view, scenario-type filtered for mode-specific analysis, and occasionally very small filtered sets to investigate specific recent interactions. He finds warning systems in games deeply irritating when they can't be dismissed permanently.

**Minute 0:00 — Standard Workflow**
Ouray opens career analysis. He's already on his "Quick assault standard" saved filter (58 matches). Green band, no warnings, runs clean. He sees his normal diagnostic result.

He switches to a new saved filter: "Ouroboros_X" — an opponent he's played 8 times this season with an unusual strategy he's been trying to analyze. Counter: 8 matches. Band shifts to red, pulsing.

**Minute 0:10 — The Toast (Again)**
He clicks Run Analysis. Toast: "⚠ Running with 8 matches — results are exploratory." Ouray dismisses it with the `[Dismiss]` button before it auto-disappears.

The fifth time this session that this toast has appeared, he notices there's no "Don't show again" option. He opens settings.

**Minute 0:15 — Finding the Setting**
In Settings → Analysis → Sample Size Warnings, there's a toggle: "Show sample size toasts." Ouray turns it off. The toast never appears again for him.

The reliability band remains (can't be disabled — it's a status indicator, not a warning alert). The ±% confidence intervals remain. The cluster flag modified text remains. These are part of the data, not an interruption.

Ouray is satisfied: the interruption is gone, the information is still there.

**Minute 0:20 — Working With 8 Matches**
Ouray examines the 8-match result. He knows what the ±44% means. He's looking for the qualitative pattern — which elements appear in the top 3 most consistently across these 8 specific interactions with Ouroboros_X — not for a reliable coverage percentage.

He identifies that RELAY-C and COMMAND-A co-appear in the top 3 for 6 of 8 Ouroboros_X matches. This isn't statistical — it's exploratory pattern recognition on specific match data. The system's ±44% isn't the insight; the co-occurrence pattern is.

He opens the agent inspector for both elements and cross-references with the match replays.

**What Ouray needed:**
A setting to suppress the toast. The band and the ±% are information he uses, not noise — he doesn't want those disabled. Just the interruption.

**UI Annotations:**
- Settings path: Settings → Analysis → Sample Size Warnings. Three toggles: "Show sample size toasts" (default on), "Show ±% confidence intervals in results" (default on), "Show modified cluster flag text at small sample sizes" (default on). Granular — experts can disable interruptions while keeping information.
- "Don't show again" in-toast vs. settings: the current design puts this in settings rather than in the toast itself. Rationale: in-toast "don't show again" is more discoverable, but once the toast appears frequently, hunting through settings once to find a persistent toggle is acceptable. This is a deliberate design choice to keep the toast uncluttered.

---

## Strengths and Weaknesses (Option D Summary)

### Strengths

**Non-blocking with graduated signal.** The system never prevents analysis — it communicates reliability continuously through the band color and discretely through the post-run ±%. Players who understand the limitations proceed without friction; players who don't are informed without being lectured.

**Toast provides actionable path.** Unlike Options A and C, the toast includes `[Expand scope to 30+ for reliable results]` — a direct affordance to fix the problem rather than just naming it. This transforms the warning from a cul-de-sac into a guided path.

**The reliability band is peripherally readable.** Once a player has learned to interpret the band color (one session, not one week), glancing at it before running an analysis takes zero extra cognitive load. It becomes ambient information, like a WiFi signal strength indicator.

**Fully configurable for power users.** The Settings panel allows suppressing interruptions while preserving information-layer elements. Experts get out of the players' way; novices get the full guidance system.

**The confidence interval teaches the right mental model.** `41.2% (±35%)` trains the correct intuition: a single number isn't a fact, it's an estimate with uncertainty. Players who absorb this from the interface carry it into their strategic thinking — they develop appropriate skepticism of small-N results naturally.

### Weaknesses

**Toast fatigue at the margin.** Players who frequently use N=8-14 filtered sets will see the toast often. The Settings toggle is available but requires discovery. A faster "Don't show again" option in the toast itself might be more ergonomic.

**±% is still abstract for non-technical players.** "Higher or lower by 35 percentage points" is clearer than "confidence interval" but still requires knowing what 35 percentage points means in context. A simpler framing — "This estimate may change significantly with more data" — might be more accessible, though it loses the quantitative precision.

**The threshold constants are not self-explaining.** Why 15 for "directional" and 30 for "reliable"? Players who ask this question get no answer in the UI. A brief tooltip on the reliability band explaining the zones (and why these numbers) would add depth.

**History log ambiguity.** Filtered analyses in the history log are logged with match count, but the log itself doesn't show reliability zone badges. A player looking at a log entry showing "14 matches" needs to remember that 14 is in the directional zone — the log doesn't remind them.

---

## Interaction Effects

**4.69e-i (filter shelf):** The reliability band lives inside the filter shelf footer. The ±% confidence intervals live in the analysis result panel. These are the primary implementation surfaces — the sample size warning system is structurally dependent on the filter shelf design. Any change to the filter shelf layout must preserve the band's position and visibility.

**4.69i (combined coverage minimum as secondary threshold gate):** Aspect 4.69i requires BOTH N=3 appearances AND ≥30% combined coverage before a cluster flag fires. The sample size warning threshold interacts here: at N < 30, even a genuine N=3 cluster may not meet the ≥30% coverage bar, because coverage percentages are too noisy to be reliable at small sample sizes. This means the two threshold gates interact — the coverage minimum gate may naturally suppress false positives at small N even without the sample size warning. Worth specifying whether sample size warnings appear even when the combined coverage threshold suppresses the cluster flag.

**4.69l (threshold recommendation engine):** The recommendation engine analyzes past career analyses and suggests threshold adjustments. It should be trained only on analyses with N ≥ 30 — directional or exploratory analyses should be excluded from the recommendation training set, or the engine will learn from noisy data. The recommendation engine needs access to the N value of each historical analysis to filter appropriately.

**4.68 (coverage % as season health):** Season health is computed from the top-candidate coverage percentage. If the player's most recent career analysis was a filtered, small-N analysis, should it update the season health metric? Option D recommendation: filtered analyses never update the season health primary metric regardless of N (already specified in 4.69e-i). Sample size adds a second reason: small-N analyses are doubly unreliable for season health tracking.

**4.69e-i-c (filtered analysis data points in season health trend graph):** If filtered analyses appear on the trend graph, small-N filtered analyses should be visually differentiated from large-N ones. A possible convention: N < 15 = hollow data point; 15 ≤ N < 30 = quarter-filled; N ≥ 30 = full. The trend graph's legend would explain the fill levels.

**4.69k (cluster flag history in career analysis log):** The cluster flag history log tracks when each flag fired and what response the player took. Sample size should be recorded alongside each flag entry so the player can later assess whether a flag that fired on N=8 was reliable or noise-driven.

**4.69n (gap chart: actual coverage vs. cluster ceiling):** The gap chart is a longitudinal visualization of coverage trends. Small-N analyses entered into this chart create noisy artifacts — a spike from N=8 analysis followed by a return to N=200 baseline looks like a real trend but is just noise. Solution: the gap chart could show a shaded uncertainty region around small-N data points (width proportional to ±%) rather than a single dot.

---

## Comparable Systems

**Google Analytics data freshness indicator:** GA shows a small "Data freshness" note near the top of each report showing how recently the underlying data was updated. When data is less fresh, it adds a subtle yellow indicator. It never blocks interaction — it informs. The reliability band in Option D is the same pattern applied to sample size rather than recency.

**Chess.com game analysis "insufficient games" warning:** When players run opening analysis on fewer than 5 games, Chess.com shows a gentle "Insufficient games for reliable analysis" message below the result — but still renders the analysis. The message is gray text (not alarming), non-blocking, and doesn't suggest remediation. The Option D approach is more helpful: the toast suggests how to fix the sample size, not just noting it.

**Spotify's "Not enough data" for Wrapped:** When Spotify can't generate stats for a time period (e.g., user listened under the minimum threshold), it shows a friendly message explaining the limitation instead of fake data. The honesty-about-data-quality pattern is the same — don't pretend to know things you don't know.

**Strava's small segment leaderboards:** On Strava segment leaderboards with fewer than 5 athletes, Strava shows the raw times but adds a note "Not enough athletes for statistical comparison." The leaderboard still works; the note contextualizes it. Direct analogue to Option D's approach.

**Medical diagnostic tools (p-value display):** Clinical decision support tools routinely show confidence intervals alongside point estimates. "LDL: 142 mg/dL (95% CI: 138-146 mg/dL)" is standard medical practice — the interval communicates measurement precision. The ±% in Option D borrows this framing but simplified for non-expert users.

**Netlify build analytics "low sample" advisory:** Netlify's analytics module shows a yellow banner when a time window has fewer than 100 page views: "Data may not be representative at this sample size." Non-blocking, amber, informative. Directly maps to Option D's amber band.

---

## Sensory Description

The **reliability band** runs as a 12px horizontal stripe across the bottom edge of the filter shelf, color-filling from left to right as a proportion of "N / 30" — it literally looks like a progress bar toward reliability. When the band is green and full, it communicates completion: "you have enough data." When it's amber and half-full, it communicates incompleteness. When it's red at 20%, the thin red stripe pulses with a subtle breathing animation — not alarming, more like a slow, low heartbeat.

The breathing animation at red is 1.5-second cycle, 15% amplitude (opacity: 0.6 → 0.9 → 0.6). It's noticeable in peripheral vision — the player won't miss it — but it doesn't demand attention the way a flashing alert would. It's the visual equivalent of a system quietly saying "hmm."

The **toast notification** appears at the bottom-right of the screen with a spring animation: slides up from below the screen edge, slight overshoot (+4px), then settles. Sound: a soft, low-register chime — two notes, E♭4 then C4, approximately 200ms duration, quiet. The chime is designed to feel informational rather than alarming — the same register and velocity as a Slack notification, not a smoke alarm.

When the player hovers on the ±% confidence interval values next to coverage percentages, the numbers briefly **scale up** to 1.1x size (100ms ease-out) to signal interactivity. The tooltip that appears is white text on dark background (#1A1A2E), appearing above the element with a smooth 150ms fade-in. The tooltip text uses the phrase "higher or lower" in bold to anchor the key concept: *"Coverage estimate uncertainty. At 8 matches, this value could be **higher or lower** by up to 44 percentage points."*

The TikTok clip for this aspect: A player with 4-match filter is about to click Run Analysis. The reliability band is red and pulsing. They click the button. The toast appears, they dismiss it. The analysis renders with `75.0% (±44%)` next to the top candidate. Player voiceover: "Okay the system is basically saying: I only have 4 matches, here's what I saw, here's how uncertain I am, don't bet the house on it. I appreciate the honesty." Cut to the same player 20 matches later: band is green, no ±%, clean results. "Now I actually know." The 15-second hook is the system being intellectually honest about what it knows.

---

## Newly Discovered Aspects

These sub-questions emerged from designing the sample size warning in detail:

- **4.69e-i-a-i — "Don't show again" placement decision**: whether the toast's "don't show again" affordance lives in-toast (more discoverable) vs. in Settings only (cleaner toast) — two usability philosophies with measurable tradeoffs; user research approaches for deciding between them
- **4.69e-i-a-ii — N threshold display in history log entries**: when a history log entry shows "Filtered analysis · 14 matches," should it also show the zone label "Directional" or a color badge to remind the player of the reliability context when reviewing historical entries?
- **4.69e-i-a-iii — Minimum N for cluster detection hardcoded vs. configurable**: whether the exploratory/directional/reliable zone thresholds (15, 30) should be fixed constants vs. player-configurable (like the multi-cluster detection threshold 4.69h); design tension between power-user flexibility and statistical coherence
- **4.69e-i-a-iv — Confidence interval display for career-scope (full analysis)**: should the ±% confidence interval ever appear for full-scope analyses at N < 30 (early career, player has only played 12 total matches)? Or is the interval only for filtered analyses?
- **4.69e-i-a-v — "Path to 30" suggestion accuracy**: the toast's "Expand scope to 30+ for reliable results" link needs to find the optimal suggestion — minimum filter relaxation to cross N=30. Algorithm design for computing this suggestion from an arbitrary filter state.
