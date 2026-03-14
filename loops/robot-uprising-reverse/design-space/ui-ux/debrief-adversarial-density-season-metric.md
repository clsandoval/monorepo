# Adversarial Density as a Career Season Metric

**Aspect:** 4.69e-v — Adversarial density as a career season metric: tracking how many of the player's matches in a season were adversarially targeted; "adversarial pressure" as a context variable in season health; adjusting season health thresholds for high-adversarial-pressure seasons.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-iii — Per-opponent threshold override; 4.69e-iv — Counter-poisoning config design; 4.69e-vi — Concentration threshold calibration for dense opponent pools
**Related:** 4.25 — EDT trajectory as career progress metric; 4.69d — Multi-cluster persistence tracking; 4.69e-iii-a — Compound adversarial detection; 4.69e-viii — Tag expiry and automatic sunset; 7.10 — Necropsy culture; 7.11 — Match duration as community health signal

---

## The Core Concept

A player who faces zero adversarial targeting and a player who faces relentless, multi-opponent poisoning campaigns are playing fundamentally different games — but the career analysis system currently treats their seasons identically. Win rate, eEDT, cluster flags, persistence tracking — all operate on raw match data without accounting for how much of that data was generated under adversarial conditions.

**Adversarial density** is the ratio of matches in a season (or rolling window) that were played against opponents the player has tagged as adversarial, or that the system's automatic detection (4.69e-iii-a compound detection, concentration threshold violations) has flagged as likely adversarial.

```
adversarial_density = adversarial_matches / total_matches
```

A season with adversarial density 0.05 (5% of matches against tagged opponents) is "clean" — the player's career analysis is overwhelmingly structural signal. A season with density 0.45 (nearly half of all matches against tagged/detected adversarial opponents) is "under siege" — nearly every diagnostic the player runs is contaminated by intentional targeting.

**Why this matters as a first-class metric:**

1. **Diagnostic calibration.** When adversarial density is high, multi-cluster flags should fire less aggressively — or at least present with a contextual annotation ("this cluster appeared during a high-adversarial-pressure season"). A cluster that persists across 3 analyses in a clean season is a strong structural signal. The same cluster persisting across 3 analyses when 40% of matches are adversarial is much weaker evidence.

2. **Season health contextualization.** The season health dashboard (which synthesizes win rate, eEDT, cluster frequency, redesign frequency) currently has no way to distinguish "this was a rough season because my configs are bad" from "this was a rough season because I was targeted by 3 opponents running dedicated counter-configs." Adversarial density gives the dashboard a lens for this distinction.

3. **Player psychology.** Competitive frustration is amplified when the player can't distinguish skill gap from targeting. A visible adversarial pressure metric externalizes a feeling that many competitive players have — "I'm not losing because I'm bad, I'm losing because I'm being targeted" — and either validates or refutes it with data. This is psychologically powerful: it either relieves frustration (yes, you are under heavy targeting, your structural config is fine) or provides clarity (no, adversarial density is only 8%, these are real structural problems).

4. **Community health signal.** Aggregated adversarial density across the player base becomes a meta-health metric. If average adversarial density is climbing season over season, the competitive ecosystem may be shifting toward more poisoning strategies — which might indicate the diagnostic system is too exploitable, or that counter-poisoning tools (4.69e-iv) need strengthening.

---

## The Adversarial Pressure Score (APS)

Raw adversarial density is a useful starting point, but it underweights intensity. A player who faces one tagged opponent in 40% of their matches has high density but uniform adversarial source. A player who faces four distinct tagged opponents (each contributing 10%) has the same density but is under qualitatively different pressure — multiple opponents have independently decided to target them.

The **Adversarial Pressure Score** incorporates both density and diversity:

```
APS = adversarial_density × (1 + log₂(distinct_adversarial_opponents))
```

| Density | Opponents | APS | Interpretation |
|---------|-----------|-----|----------------|
| 0.05 | 1 | 0.05 | Negligible — one persistent rival |
| 0.20 | 1 | 0.20 | Moderate — one dedicated counter-player |
| 0.20 | 3 | 0.52 | Elevated — three independent targeters |
| 0.40 | 1 | 0.40 | High — one dominant adversary |
| 0.40 | 4 | 1.20 | Extreme — under siege from multiple directions |
| 0.60 | 5 | 1.99 | Critical — majority of season is adversarial |

The log₂ multiplier ensures that going from 1→2 opponents is a bigger jump than 4→5, reflecting the qualitative reality: the first evidence of *multiple* independent targeters is far more significant than the fifth.

**APS thresholds:**

| APS Range | Label | Color | Dashboard Treatment |
|-----------|-------|-------|---------------------|
| 0.00–0.10 | Clean | No indicator | Standard analysis, no annotations |
| 0.10–0.30 | Light Pressure | Pale amber dot | Advisory footnote on cluster flags |
| 0.30–0.60 | Moderate Pressure | Amber shield | Cluster persistence thresholds relaxed by +1 |
| 0.60–1.00 | Heavy Pressure | Orange shield with exclamation | Dual-score presentation on all career stats |
| 1.00+ | Under Siege | Red pulsing shield | Full adversarial overlay on season dashboard |

---

## Option A: The Season Health Sidebar — "Adversarial Weather Report"

### How It Works

Adversarial pressure is displayed as a persistent contextual sidebar element on the career analysis screen, visually analogous to a weather report: atmospheric conditions that affect everything but aren't themselves the thing being measured.

**The sidebar widget:**

```
┌─────────────────────────────────┐
│  SEASON 7 — ADVERSARIAL WEATHER │
│                                 │
│  ╔═══════════════════╗          │
│  ║  APS: 0.47        ║          │
│  ║  ████████░░░░░░░  ║          │
│  ║  MODERATE PRESSURE ║          │
│  ╚═══════════════════╝          │
│                                 │
│  Density: 32% (19/60 matches)  │
│  Sources: 3 tagged opponents    │
│                                 │
│  ┌───────────────────────────┐  │
│  │ NebulaFang     12 matches │  │
│  │ ████████████              │  │
│  │ CyberThorn      5 matches │  │
│  │ █████                     │  │
│  │ VoidPulse       2 matches │  │
│  │ ██                        │  │
│  └───────────────────────────┘  │
│                                 │
│  Season trend:  ↗ Rising        │
│  (S5: 0.12 → S6: 0.29 → S7:   │
│   0.47)                         │
│                                 │
│  ⚠ Cluster thresholds relaxed  │
│    by +1 for this season        │
└─────────────────────────────────┘
```

The widget lives in the top-right corner of the career analysis screen, always visible but not dominant. Its background tints from transparent (clean) through pale amber (light) through warm amber (moderate) through deep orange (heavy) through a slow-pulsing dark red (under siege). The tint subtly colors the entire career analysis panel — so even before reading numbers, the player gets an atmospheric read: "this season's diagnostics are happening under adversarial conditions."

**The season trend sparkline** is the critical secondary feature. Three seasons of APS values rendered as a tiny line chart (3 data points, no axis labels, just the shape). Rising adversarial pressure is a signal that the player's competitive success is drawing targeted attention — which is actually a compliment in disguise. The trend helps players understand whether their current adversarial situation is stable, escalating, or resolving.

**Threshold relaxation notice:** When APS exceeds 0.30, the sidebar displays a notice that cluster thresholds have been automatically relaxed. The exact mechanics: the multi-cluster detection flag (4.69) normally fires at N=3 (three elements of the same agent appearing in runner-up slots). Under moderate pressure, the threshold shifts to N=4. Under heavy pressure, N=5. This means a player under siege needs stronger structural evidence before the system recommends a redesign — because the noise floor from adversarial matches is higher.

The relaxation is opt-in by default and can be disabled in Settings → Career Analysis → Adversarial Adjustments. Power users who want to see unmodified diagnostics can turn it off. The toggle state is displayed in the sidebar: either "⚠ Cluster thresholds relaxed by +1" or "ℹ Cluster thresholds at standard (adversarial adjustment disabled)".

### Strengths
- Always visible, never intrusive — atmospheric rather than demanding
- Trend data across seasons is enormously valuable for competitive players
- Threshold relaxation is the most directly useful feature (prevents false redesigns)
- Per-opponent breakdown lets the player see exactly who is contributing to pressure

### Weaknesses
- Sidebar real estate on an already information-dense screen
- Risk of players using APS as an excuse to ignore legitimate structural problems ("my APS is 0.35, so this cluster is probably fake")
- The threshold relaxation is a blunt instrument — affects all clusters equally even when adversarial targeting is agent-specific

---

## Option B: The Dual-Score Career Dashboard — "Clean vs. Full"

### How It Works

Every career statistic is displayed as a pair: the "full" score (computed over all matches) and the "clean" score (computed after excluding adversarial-tagged matches). The player always sees both, side by side.

**Post-match summary panel:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SEASON 7 SUMMARY                                  │
│                                                                      │
│              WIN RATE       eEDT         CLUSTERS      APS           │
│   Full:       52%          0.41            4          0.47           │
│   Clean:      61%          0.48            1          ░░░░           │
│   Delta:     +9%          +0.07           -3                         │
│                                                                      │
│   ▓▓▓▓▓▓▓░░░░░  adversarial matches (32%)                          │
│                                                                      │
│   The clean scores exclude 19 matches against 3 tagged opponents.   │
│   Your structural performance is significantly stronger than your    │
│   full-season numbers suggest.                                       │
└──────────────────────────────────────────────────────────────────────┘
```

The "clean" row is rendered in a slightly different font weight — not grayed out (it's not secondary), not bold (it's not primary) — but in the career analysis accent color (a cool teal that contrasts with the standard warm amber of full-season stats). This communicates: these are an alternative lens, not a correction.

The **delta row** is the psychologically powerful element. +9% win rate when adversarial matches are removed means the player's structural play is strong and their losses are concentrated against targeting opponents. This is precisely the information that prevents false redesigns and reduces competitive frustration.

**The dual-score philosophy:** This option does NOT recommend which score to trust. It presents both and lets the player decide. Some players will anchor on clean scores for confidence. Others will study the delta to understand how much adversarial pressure costs them. Veterans will notice when clean-score clusters persist — proving structural problems that adversarial noise was masking.

**Per-agent dual scoring:** The cluster detection system also runs twice — once on full data, once on clean data. The Agent Audit panel shows:

```
RELAY-C CLUSTER FLAG
  Full analysis:   3 elements (buffer, fallback, queue) — FIRES at N=3
  Clean analysis:  1 element (buffer only) — does NOT fire at N=3

  → 2 of 3 cluster elements are adversarial artifacts.
    The buffer issue may be structural.
```

This is dramatically more useful than the sidebar's blunt threshold relaxation. It tells the player exactly which elements of the cluster are adversarial and which are structural — per agent, per cluster.

### Strengths
- Maximum information — the player sees exactly what adversarial pressure costs them
- Per-agent dual scoring is the most precise diagnostic possible
- No blunt threshold manipulation — raw data with two lenses
- The delta is motivating (structural performance is usually better than full-season)
- Naturally teaches the structural/adversarial distinction through repeated exposure

### Weaknesses
- Doubles the visual complexity of every career stat
- Players who never encounter adversarial opponents still see "Full / Clean" labels everywhere (wasted UI for them)
- Requires running career analysis twice (performance cost, though likely negligible)
- Risk of anchoring on clean scores even when adversarial opponents ARE exposing real weaknesses

---

## Option C: The Pressure Graph — "Season Weather Map"

### How It Works

A dedicated visualization that shows adversarial pressure as a time-series across the season, overlaid with key career events (cluster flags, redesigns, win rate shifts). This is a standalone panel accessible from the career dashboard, not an always-visible element.

**The visualization:**

The x-axis is match number (1 through N, left to right). The y-axis is a rolling 10-match APS, computed at each match. The resulting line shows how adversarial pressure waxes and wanes across the season.

Overlaid on this line:
- **Red diamonds** at matches where a multi-cluster flag fired
- **Blue squares** at matches where the player entered redesign mode
- **Green circles** at matches where the player tagged a new adversarial opponent
- **Amber triangles** at matches where the player's win rate crossed a threshold (50%, 40%, etc.)

The correlation — or lack thereof — between adversarial pressure spikes and career events tells a story:

```
APS │                    ╱╲
    │                   ╱  ╲         ◆ cluster flag
    │          ╱╲      ╱    ╲   ■ redesign
    │    ●    ╱  ╲    ╱      ╲────
    │   tag  ╱    ╲──╱
    │  ╱╲   ╱
    │ ╱  ╲ ╱
    │╱    ╲╱
    └──────────────────────────────── match #
     1    10   20   30   40   50  60
```

In this example, the player tagged an opponent around match 8. APS rose through mid-season. A cluster flag fired near the APS peak (match 38). The player redesigned shortly after (match 42). But APS was already declining by then. Reading the graph, the player can see: "I redesigned during a period of high adversarial pressure — was that cluster flag structural, or was it driven by the pressure spike?" If they flip to the dual-score view (Option B), they can answer that question definitively.

**The temporal correlation insight** is this option's unique contribution. Neither the sidebar (Option A) nor the dual-score (Option B) shows when adversarial pressure arrived relative to diagnostic events. The pressure graph reveals patterns like:
- "Every time APS spikes, I redesign within 5 matches" (reactive redesign under pressure — probably bad)
- "APS has been rising for 20 matches and I haven't redesigned — my config is resilient" (validation)
- "I tagged NebulaFang at match 15 and APS immediately dropped — the tag was the right call" (tag validation)
- "APS has been rising despite three new tags — there's a systemic targeting problem" (escalation awareness)

### Sensory Description

The pressure graph panel opens as a full-width drawer that pushes the career stats down. The background is a deep midnight blue — darker than the career analysis background — with the APS line rendered in a luminous amber that fades to a warm red when APS exceeds 0.60. The line has a subtle glow effect, like a pressure gauge reading. Below the line, the area is filled with a translucent gradient: cool blue when APS is low, warming through amber to a deep saturated orange at high values. The overall effect is barometric — you're reading atmospheric pressure.

The event markers (diamonds, squares, circles, triangles) are rendered at twice the line weight, with a tiny pulsing animation on hover. Hovering over any marker shows a tooltip with the exact match details: opponent, result, what diagnostic fired, what action the player took. Clicking a marker opens the specific match in the Inspector — seamless drill-down from season-level to match-level analysis.

The x-axis has subtle vertical gridlines every 10 matches, with season boundaries (if the window spans seasons) marked as dashed white lines with the season number above.

### Strengths
- Reveals temporal patterns that no other visualization can show
- Helps players identify reactive vs. strategic redesign patterns
- Beautiful standalone visualization that feels like a professional analytics tool
- Drill-down to individual matches via event markers
- Historical value — players can study past seasons' pressure profiles

### Weaknesses
- Requires enough data to be useful (at least 20-30 matches, preferably a full season)
- Additional screen real estate for a panel most players access rarely
- Temporal correlation doesn't prove causation — players might over-interpret coincidences
- Doesn't directly modify diagnostic behavior (unlike Option A's threshold relaxation or Option B's dual scoring)

---

## Option D: The Composite — "Adversarial Lens"

### How It Works

A synthesis of all three options, gated by APS level:

- **APS 0.00–0.10 (Clean):** No adversarial UI visible anywhere. Career analysis operates normally.
- **APS 0.10–0.30 (Light):** A small amber dot appears next to the season label. Hovering shows the sidebar (Option A) as a tooltip. No behavioral changes.
- **APS 0.30–0.60 (Moderate):** The sidebar becomes permanent (Option A). Dual-score appears for cluster flags only (Option B, limited scope). Pressure graph accessible via a link in the sidebar.
- **APS 0.60+ (Heavy / Under Siege):** Full dual-score dashboard (Option B). Pressure graph auto-opens on season review. Threshold relaxation is automatically applied (with opt-out).

This progressive disclosure ensures that clean-season players never see adversarial UI, while heavily-targeted players get the full toolkit.

**The key UX principle:** adversarial pressure UI should scale with adversarial pressure itself. A player under siege needs powerful analytical tools. A player in a clean season needs a clean dashboard.

### Strengths
- No UI overhead for clean-season players
- Graduated experience matches the severity of the situation
- Combines the best of all three options at appropriate trigger points
- Teaches the adversarial vocabulary gradually as pressure increases

### Weaknesses
- Complex implementation with four distinct UI states
- APS threshold boundaries create cliff effects (going from 0.29 to 0.31 suddenly shows a sidebar)
- Players might game their tagging to keep APS below thresholds (undertag to avoid UI complexity)
- Difficult to document/teach because the UI changes based on invisible context

---

## Threshold Adjustment Mechanics

Regardless of which display option is chosen, the core question is: **how should adversarial density modify diagnostic thresholds?**

### Approach 1: Global Threshold Relaxation

The simplest approach: add a flat +N to the multi-cluster threshold based on APS.

| APS Range | Threshold Adjustment | Effective N (from base N=3) |
|-----------|---------------------|----------------------------|
| 0.00–0.30 | +0 | 3 |
| 0.30–0.60 | +1 | 4 |
| 0.60–1.00 | +2 | 5 |
| 1.00+ | +3 | 6 |

**Problem:** This is too blunt. A player under siege from opponents targeting RELAY-C shouldn't have relaxed thresholds on STRIKER-A diagnostics — STRIKER-A analysis is clean.

### Approach 2: Per-Agent Pressure-Weighted Threshold

Each agent gets its own effective APS, computed from the adversarial matches that actually affected that agent's cluster candidates.

```
agent_APS(RELAY-C) = adversarial_matches_affecting_RELAY-C / total_matches
agent_APS(STRIKER-A) = adversarial_matches_affecting_STRIKER-A / total_matches
```

A match "affects" an agent's cluster if it contributed at least one candidate entry for that agent. This means RELAY-C might have an agent_APS of 0.55 while STRIKER-A has an agent_APS of 0.02 — even though the overall season APS is 0.35.

Threshold relaxation is then per-agent:
- RELAY-C: agent_APS 0.55 → +2 → effective N=5
- STRIKER-A: agent_APS 0.02 → +0 → effective N=3

**This is the correct approach.** It applies surgical threshold adjustment where adversarial targeting is concentrated, without blinding the player to structural problems in untargeted agents.

### Approach 3: Bayesian Confidence Interval

Instead of modifying thresholds, annotate each cluster flag with a **confidence interval** that incorporates adversarial pressure as a noise parameter.

```
RELAY-C cluster flag (3 elements)
Confidence: 42% (adj. for APS 0.47 on this agent)
Without adversarial adjustment: 87%
```

The confidence number tells the player: given the amount of adversarial noise in this agent's data, there is a 42% chance this cluster represents a genuine structural problem. Without any adversarial noise, the confidence would be 87%.

**This is the most honest approach** — it doesn't hide or modify anything, it just quantifies uncertainty. But it requires players to understand confidence intervals, which is a significant accessibility barrier.

### Recommendation

**Approach 2 (per-agent pressure-weighted threshold) as default**, with Approach 3 available as an advanced toggle in Settings → Career Analysis → Show Confidence Intervals.

The per-agent threshold adjustment is intuitive: "your RELAY-C diagnostics require stronger evidence because RELAY-C is heavily targeted." The confidence interval is more precise but more abstract. Power users who want the full picture can enable it.

---

## Interaction Effects

### With eEDT Trajectory (4.25)

A player's eEDT should also be available as clean/full dual-score. Against adversarial opponents, matches often resolve faster (the opponent's config is optimized to exploit, not to contest) — which means high adversarial density artificially depresses eEDT. A player whose full eEDT is 0.38 but clean eEDT is 0.51 is having genuine midgame contests against everyone except their targeted opponents. This is crucial career feedback.

### With Multi-Cluster Persistence Tracking (4.69d)

The persistence counter ("RELAY-C has clustered in 3 consecutive analyses") should be aware of adversarial density during each analysis. If two of those three analyses occurred during high-pressure windows, the persistence signal is weaker than if all three occurred during clean windows. The persistence badge could show: "3 occurrences (1 in clean window, 2 during elevated APS)" — allowing the player to weight the signal appropriately.

### With Tag Expiry (4.69e-viii)

Adversarial density dropping to near-zero after tag expiry is a natural validation signal: either the opponent stopped targeting (the tag served its purpose) or the tag expired and the opponent resumed (the tag needs renewal). APS trend across tag expiry events helps players decide whether to renew.

### With Counter-Poisoning Config Design (4.69e-iv)

A player engaged in active counter-poisoning (building configs that disrupt opponents' diagnostics) is simultaneously generating adversarial pressure for their opponents. The APS metric, if visible in community profiles, creates an interesting social dynamic: being a high-APS-generator becomes a visible identity ("I cause adversarial weather for my opponents").

### With Compound Adversarial Detection (4.69e-iii-a)

Compound adversarial detection identifies coordinated multi-opponent targeting. When a coalition is detected, all coalition members' matches should be treated as a single adversarial source for APS diversity calculation — otherwise a 3-player coalition artificially inflates the diversity multiplier. The compound detection system should feed directly into APS computation.

### With Necropsy Culture (7.10)

Season-level APS becomes a community discussion topic: "I survived a 0.72 APS season and still made Diamond" is a narrative that the community can celebrate. APS leaderboards (highest APS while maintaining a given rank) create a new axis of competitive prestige — resilience under fire.

---

## Comparable Games & Systems

### Chess.com Accuracy During Rapid Events

Chess.com's Accuracy metric is computed game-by-game, but during rapid events (bullet tournaments where players face the same opponents repeatedly), accuracy correlates heavily with opponent strength. A player facing three GMs in a row shows lower accuracy than one facing three 1200s — not because they played worse, but because the moves were harder to find. The platform partially addresses this with "expected accuracy at your rating vs. opponent rating," contextualizing the raw number. APS serves the same function for Robot Uprising's career analysis: contextualizing raw diagnostics with adversarial conditions.

### Poker Tracker's "Playing Against Regulars" Filter

Poker tracking software (PokerTracker, Hold'em Manager) has long allowed filtering stats by opponent type: recreational players, regulars, tough regulars. Filtering out hands against exploitative regulars reveals a player's structural game. The "reg filter" is the direct analog of the adversarial tag exclusion — and poker players universally consider it essential for honest self-assessment.

### Baseball Park-Adjusted Statistics

MLB statistics are routinely adjusted for ballpark effects (Coors Field inflates offense, Petco Park deflates it). A player's "road OPS" is considered more representative than their home OPS at Coors. APS serves the same function: adversarial matches are the "Coors Field" of Robot Uprising — they inflate diagnostic signals. The "clean score" is the "road score" — what the player's config does without environmental distortion.

### Overwatch's Competitive Season Reports

Overwatch's end-of-season reports show win rate, SR change, heroes played, and top stats. They do NOT show any measure of how much the player was specifically targeted by enemy compositions. In Overwatch this barely matters (matchmaking is random), but in Robot Uprising's persistent-identity competitive ecosystem with repeated opponents, adversarial pressure is a real, measurable phenomenon that the season report should capture.

---

## Player Journeys

### Journey: Zara, 29, Architect II, Season 7 competitive player

**Context:** Zara has been Architect II for two seasons. She's been tagged by three opponents (NebulaFang, CyberThorn, VoidPulse) who she identified as adversarial during Season 6. Season 7 is 60 matches in. She's about to open the career analysis for her first mid-season review.

**Minute 0:00 — Opening Career Analysis**

Zara clicks the Career Analysis button on the main menu. The screen transitions to the career dashboard. In the top-right corner, where last season she saw nothing, there's a new element: a small amber shield icon next to the text "SEASON 7." She notices it immediately — it wasn't there in Season 5.

She hovers over the shield. A tooltip sidebar slides out from the right edge, rendered on a midnight-blue panel with warm amber accents. The header reads "SEASON 7 — ADVERSARIAL WEATHER." Below it: APS: 0.47, MODERATE PRESSURE. A horizontal bar, two-thirds filled with amber, glows softly. Below the bar: "Density: 32% (19/60 matches). Sources: 3 tagged opponents." Three rows show her tagged opponents with proportional bars — NebulaFang dominates with 12 matches, CyberThorn at 5, VoidPulse at 2.

She thinks: *Forty-seven percent pressure? That feels right — I've been running into Nebula constantly.* The season trend sparkline at the bottom shows a rising line across S5→S6→S7 (0.12→0.29→0.47). *It's getting worse every season.*

**Minute 0:30 — Reading the Dual-Score Dashboard**

Below the sidebar, the career stats area looks different than she remembers. Every number has two rows:

```
WIN RATE       eEDT         CLUSTERS
Full:  52%     0.41            4
Clean: 61%     0.48            1
```

Zara's eyes lock on the delta. *Nine percent win rate difference.* She knew adversarial matches were dragging her stats down, but seeing it quantified — 61% clean win rate versus 52% full — is both validating and sobering. The cluster count drop is even more dramatic: 4 clusters in full analysis, only 1 in clean.

She clicks on the cluster detail view. The Agent Audit panel shows four clusters:

```
RELAY-C:  3 elements (buffer, fallback, queue)     Full only
SCOUT-A:  2 elements (context, hook routing)        Full only
RELAY-C:  1 element (buffer capacity)               Full + Clean
STRIKER-B: 2 elements (priority, range)             Full only
```

Three of four clusters exist only in the full analysis. Only one persists in clean: RELAY-C's buffer capacity. That's her real structural problem. The other three are adversarial artifacts.

She breathes. *I was about to redesign SCOUT-A last week. It doesn't need redesigning. NebulaFang's flooding strategy makes it look broken, but my Scout is fine against everyone else.*

**Minute 1:30 — Exploring the Pressure Graph**

In the sidebar, a small "View pressure timeline →" link catches her eye. She clicks it. A full-width drawer pushes the career stats down. The midnight-blue panel shows a luminous amber line plotting her 10-match rolling APS across 60 matches.

The line is low and flat for the first 15 matches (APS ~0.10 — she didn't face tagged opponents early in the season). Then it ramps sharply from match 16 to 30 as NebulaFang appears in a cluster of matchups. A red diamond at match 28 marks where her RELAY-C cluster flag first fired. Then a slight dip from 30-40 (fewer NebulaFang matches), then another surge from 40-55 as CyberThorn joins the targeting.

She sees it clearly: *The cluster flag at match 28 fired during the first pressure spike. Of course it did.* She hovers over the red diamond — the tooltip shows: "Multi-cluster flag: RELAY-C (3 elements), context: APS 0.38, Clean analysis: 1 element." The system is telling her: at the moment this flag fired, adversarial pressure was moderate, and the clean analysis only supported 1 element — the flag was mostly adversarial.

**Minute 2:30 — The Decision**

Zara closes the pressure graph. She now has three layers of evidence:
1. The dual-score shows her clean stats are significantly better than full
2. Three of four clusters are adversarial artifacts
3. The pressure timeline shows cluster flags correlating with APS spikes

She decides: fix the one structural issue (RELAY-C buffer capacity) and ignore the rest. She clicks into the Agent Audit for RELAY-C buffer capacity. The clean-analysis version shows 14% coverage — it's a minor issue, not an emergency. She makes a note to address it in her next iteration but doesn't enter redesign mode.

Without APS, she would have entered a full RELAY-C redesign based on the 3-element cluster. Instead, she identified the one real problem and saved herself an unnecessary architectural overhaul.

**Minute 3:00 — Checking the Trend**

Before closing career analysis, she glances back at the season trend sparkline. S5: 0.12. S6: 0.29. S7: 0.47. Rising every season. She thinks: *I'm becoming a target because I'm getting better. NebulaFang didn't bother counter-building me when I was in Operative tier.* This realization reframes adversarial pressure from frustrating to flattering — she's important enough to target.

**UI Annotations:**
- Amber shield icon: 16×16px, positioned 8px right of "SEASON 7" label, subtle glow animation at APS > 0.30
- Sidebar tooltip: 280px wide, slides from right edge, midnight-blue (#0D1B2A) background with amber (#F5A623) accents
- Dual-score rows: Full row in standard weight (400), Clean row in medium weight (500) with teal (#2EC4B6) text
- Pressure graph drawer: full-width, 240px tall, midnight-blue background, amber line with 2px glow radius
- Event markers: 8px diameter, 50% opacity at rest, 100% on hover, tooltip on click

---

### Journey: Tomás, 16, Bronze II, first competitive season, 25 matches

**Context:** Tomás just started competitive play this season. He has 25 matches, no adversarial tags, and no awareness of the adversarial meta-game. He opens career analysis for the first time.

**Minute 0:00 — A Clean Dashboard**

Tomás opens career analysis. There is no amber shield. No sidebar. No dual-score. The dashboard shows his stats cleanly:

```
WIN RATE       eEDT         CLUSTERS
   38%          0.31            2
```

He doesn't know the adversarial system exists. Nothing has prompted him to learn about it. This is correct — with an APS of 0.00, the adversarial UI is hidden entirely (Option D progressive disclosure). Tomás can focus on learning the structural diagnostic tools without additional cognitive load.

**Minute 0:30 — Two Seasons Later**

*Fast forward.* Tomás is now Silver I, 120 matches across three seasons. In Season 3, he's been matched against the same opponent (GlitchWire) 8 times in 30 matches. GlitchWire seems to specifically target Tomás's SCOUT-B with high-frequency signal floods. Tomás noticed the pattern but doesn't know about adversarial tagging.

He runs career analysis. SCOUT-B shows a 3-element cluster. He's about to enter redesign mode when he notices something new in the match-source breakdown (4.69e): a ⚠ warning that reads "72% of this cluster's coverage comes from GlitchWire."

He clicks the "Flag as Adversarial" button (4.69e-ii). The confirmation drawer shows the preview: without GlitchWire, SCOUT-B has 0 cluster elements. He confirms the tag.

The amber shield appears for the first time. APS: 0.27. Light Pressure. A small amber dot next to the season label. Hovering shows the sidebar tooltip with GlitchWire's contribution.

*This is the designed learning moment.* Tomás discovers the adversarial system at the exact moment he needs it — when an opponent's targeting would otherwise mislead his diagnostics. The progressive disclosure gating ensured he didn't encounter adversarial UI before he had adversarial problems.

**Minute 1:00 — Understanding the Metric**

Tomás looks at his dual-score for the first time:

```
WIN RATE       eEDT         CLUSTERS
Full:  42%     0.35            3
Clean: 47%     0.39            1
```

The +5% win rate delta is modest — GlitchWire is only one opponent. But the cluster drop from 3 to 1 is dramatic. Tomás thinks: *Wait, two of my three clusters were GlitchWire's fault? My configs aren't as broken as I thought?*

This is his first exposure to the structural/adversarial distinction. It reshapes his mental model of career analysis from "this tells me what's wrong" to "this tells me what's wrong, accounting for who I've been playing against."

**UI Annotations:**
- APS 0.00: No adversarial UI elements rendered anywhere. Zero visual overhead.
- APS 0.10–0.30: Small amber dot (6px circle, #F5A623, 70% opacity) appears next to season label
- First-time tooltip: On first hover of the amber dot, a gentle callout explains: "Some of your matches may have been adversarially targeted. Hover to see details."
- Learning moment callout: subtle one-time animation (dot pulsates 3× at 1Hz) when APS first crosses 0.10 threshold

---

### Journey: Marcus, 41, Architect I, streamer, 400+ Gauntlet matches

**Context:** Marcus has been streaming Robot Uprising for four seasons. He's currently under siege — APS 1.15 across Season 8, with five tagged opponents. His stream audience loves the adversarial meta-drama. He's about to do a live career analysis review.

**Minute 0:00 — The Red Shield**

Marcus opens career analysis on stream. Chat immediately reacts to the red pulsing shield in the top-right: "UNDER SIEGE LMAO." The shield pulses slowly — a deep crimson with a 2-second fade cycle, like a slow heartbeat. Next to it: "APS: 1.15 — UNDER SIEGE."

The sidebar is permanently visible, taking 300px of right-side real estate. Five opponents listed with their match contributions:

```
IronPulse99      18 matches
NebulaFang       14 matches
VoidKnot          9 matches
CyberThorn        7 matches
StratusLayer      4 matches
                 ──────────
                 52/94 total (55%)
```

Marcus reads it to chat: "Fifty-five percent of my matches this season were against people who are specifically trying to break my configs. More than half." Chat explodes.

**Minute 0:30 — The Devastating Dual-Score**

The dashboard shows full dual-score with the adversarial overlay fully active:

```
              WIN RATE       eEDT         CLUSTERS      REDESIGNS
Full:           48%          0.33            7              4
Clean:          71%          0.52            1              1
Delta:         +23%         +0.19           -6             -3
```

Marcus pauses. "+23% win rate. Chat. Twenty-three percent." He lets the number breathe. "My clean win rate is 71%. Architect I. Against everyone who ISN'T specifically targeting me, I win 71% of my matches. The five people who spend their evenings studying my VODs and building counter-configs drag me to 48%."

The cluster count delta is even more striking: 7 clusters in full analysis, 1 in clean. Six phantom structural problems, all generated by adversarial targeting. If Marcus had trusted full-season diagnostics, he would have redesigned his entire roster.

**Minute 1:30 — The Pressure Graph as Content**

Marcus opens the pressure graph. The audience sees the full-width visualization: a luminous line that starts low, spikes at match 20 (IronPulse99 appears), dips briefly, then surges from match 40 onward as four more opponents start targeting simultaneously. The line crosses the "Under Siege" threshold at match 55 and stays above it.

Red diamonds (cluster flags) are clustered densely around the high-pressure zones. Blue squares (redesigns) appear shortly after. Marcus traces the correlation on stream: "Look — every redesign I did this season happened within five matches of an APS spike. I was reacting to adversarial pressure, not structural problems." He pauses. "I redesigned four times this season. Three of those redesigns were unnecessary."

Chat: "F" "Bro got poisoned" "NebulaFang living rent-free" "That graph is INSANE content"

**Minute 2:30 — The TikTok Moment**

Marcus flips between Full and Clean views rapidly — a toggle in the dashboard header. Full view: messy, 7 clusters, 48% win rate, orange and red everywhere. Clean view: pristine, 1 cluster, 71% win rate, green and teal. Full. Clean. Full. Clean. The visual contrast is visceral — the dashboard transforms between chaos and clarity with a single click.

"Chat, clip that. Clip the toggle." This 5-second toggle clip — chaos to clarity, red to green, 48% to 71% — becomes the most shared Robot Uprising content of the week. It communicates instantly: adversarial pressure is real, the tools to see through it are real, and the difference is dramatic.

**Minute 3:30 — Strategic Response**

Having identified that his clean stats are strong, Marcus makes a strategic decision on stream: instead of redesigning, he's going to invest in counter-poisoning (4.69e-iv). He opens the Adversarial Lab and starts building a config specifically designed to disrupt IronPulse99's targeting strategy. Chat loves this — it's the detective/counter-attack narrative arc that makes competitive Robot Uprising compelling.

**UI Annotations:**
- Red pulsing shield: 24×24px, #DC2626 base color, sinusoidal opacity oscillation 0.7–1.0 over 2s, subtle glow radius 4px
- Under Siege sidebar: 300px wide, permanently visible (not tooltip), dark red (#7F1D1D) background with white text
- Full/Clean toggle: pill-shaped toggle switch in dashboard header, left = "Full" (amber), right = "Clean" (teal), 200ms slide transition
- Toggle animation: when switching, all numbers count-animate from old to new value over 300ms (win rate 48→71 counts up smoothly)
- Pressure graph Under Siege threshold: dashed red horizontal line at APS 1.00, area above filled with translucent red (#DC2626 at 15% opacity)

---

### Journey: Keiko, 37, accessibility-focused player, partial color blindness (deuteranopia)

**Context:** Keiko has deuteranopia (red-green color blindness). She's been playing Robot Uprising for two seasons and recently enabled the accessibility color palette in Settings. She has moderate adversarial pressure (APS 0.41) from two tagged opponents.

**Minute 0:00 — The Accessible Palette**

With the accessibility palette enabled, the adversarial weather system uses a different color vocabulary:
- Clean: no indicator (same as standard)
- Light pressure: pale blue dot (replacing amber — blue is deuteranopia-safe)
- Moderate pressure: blue shield with hatched fill pattern (replacing solid amber)
- Heavy pressure: high-contrast black shield with white exclamation (replacing orange)
- Under Siege: black pulsing shield with white outline (replacing red)

The dual-score rows use high-contrast patterns instead of color alone:
- Full: standard weight, no underline
- Clean: bold weight, dotted underline

Keiko can distinguish every state through shape, pattern, and weight — not just color. The pressure graph uses a dashed line for APS (with circular point markers every 5 matches) and solid lines for thresholds, plus texture fills instead of color gradients.

**Minute 0:30 — Reading Through Pattern**

The hatched-fill shield tells Keiko immediately: moderate pressure. She doesn't need to read the number — the pattern communicates the band. She hovers and reads the sidebar. The opponent bars use different fill patterns (horizontal stripes for the first, diagonal for the second) instead of just colored bars.

In the pressure graph, the APS line's circular markers make it easy to trace even where the line crosses threshold lines. Event markers use distinct shapes (diamonds, squares, circles, triangles) that are already accessible by default — this was a good design choice even without the accessibility palette.

**UI Annotations:**
- Accessibility palette: toggled in Settings → Accessibility → Color Mode → "High Contrast Patterns"
- Shield patterns: SVG pattern fills (hatched at 45° for moderate, cross-hatched for heavy, solid black for siege)
- Graph line markers: 6px circles every 5 data points, ensuring line is traceable even with color-only deficiency
- All color-carrying elements have redundant shape/pattern/weight encoding

---

## Sensory Description

**The ambient shift:** When adversarial pressure rises, the career analysis screen itself changes atmosphere. It's not just the shield icon — the entire panel's background hue shifts imperceptibly. At APS 0.00, the career analysis background is a neutral dark gray (#1A1A2E). At APS 0.30, a faint warm tint appears (#1F1A2E — barely perceptible, like a room warming). At APS 0.60, the tint is visible: a deep amber wash (#2A1F1E). At APS 1.00+, the screen has a dark crimson undertone (#2A1A1A) — like looking at data under emergency lighting. Players who spend enough time in career analysis will eventually sense the pressure before reading any numbers, simply from the ambient color.

**The toggle sound:** When flipping between Full and Clean views, a subtle audio cue differentiates the states. Full view: a low hum, like machinery under load — subtle, almost subliminal. Clean view: the hum drops away, replaced by a clean silence with a tiny high-pitched ping — like clearing interference from a radio signal. The contrast is felt more than heard.

**The pressure graph sound:** Scrubbing through the pressure graph (dragging a playhead along the x-axis) produces a continuous tone whose pitch maps to APS. Low APS = a low, comfortable rumble. High APS = a rising whine, like pressure building in a pipe. Crossing the "Under Siege" threshold triggers a brief alarm-like tone — not aggressive, but unmistakable. This makes the graph scrubbing feel physical: you're moving through a season's pressure landscape and hearing its contours.

**The shield pulse:** At Under Siege level, the shield's pulsing is not just visual — it produces a faint, rhythmic bass thump at 0.5Hz, audible only when the career analysis screen is open. Subtle enough to be atmospheric, noticeable enough that players will feel "something is different" about their career analysis experience during high-pressure seasons. Closing the career analysis screen silences it immediately — the pulse only exists in the diagnostic context, not as a persistent game-wide effect.

---

## The TikTok Clip

The 15-second clip: A player opens career analysis. The screen is bathed in warm crimson — Under Siege. The dashboard shows 48% win rate, 7 clusters. A single click on the Full/Clean toggle. Numbers cascade: 71% win rate, 1 cluster. The screen cools to neutral gray. Then back: Full. Red. 48%. Seven clusters. Clean. Cool. 71%. One cluster. The toggle becomes a heartbeat between chaos and clarity. Text overlay: "55% of my matches were targeted. This is what my real stats look like."

---

## Discovered Aspects

1. **4.69e-v-a — APS as matchmaking input:** Should the matchmaking system use APS to protect high-pressure players? If a player's APS exceeds a threshold, reduce the probability of matching them against their tagged opponents. Tension between competitive fairness (any opponent should face any opponent) and player wellbeing (constant targeting is exhausting). Comparable: chess.com's "avoid player" feature for arena tournaments.

2. **4.69e-v-b — Community APS leaderboard and "resilience" prestige:** Aggregated APS data as a community feature — "Most Resilient Players" showing high-rank players who maintained their position despite extreme adversarial pressure. New axis of competitive prestige beyond raw win rate. Interaction with necropsy culture (7.10) and community sharing.

3. **4.69e-v-c — APS false inflation from small opponent pools:** In low-population brackets, players naturally face the same opponents repeatedly. High match frequency against the same tagged opponent inflates APS even when the targeting isn't intensifying. Closely related to 4.69e-vi (concentration threshold calibration for dense pools) but specifically about how APS computation should normalize for pool size.

4. **4.69e-v-d — Seasonal APS decay and historical archiving:** How does APS reset between seasons? Hard reset to 0.00 (clean slate every season) vs. carry-over with decay (e.g., previous season's APS starts at 50% and decays). Affects whether season-start diagnostics are clean or pre-contaminated by last season's adversarial context.

5. **4.69e-v-e — APS-aware redesign guard:** A "safety net" that warns the player before entering redesign mode during high APS: "You are about to redesign RELAY-C during a period of heavy adversarial pressure (APS 0.72). 2 of 3 cluster elements are adversarial artifacts in clean analysis. Consider waiting for pressure to subside, or reviewing clean-analysis diagnostics first." Prevents the most costly adversarial effect: unnecessary redesigns driven by poisoned diagnostics.
