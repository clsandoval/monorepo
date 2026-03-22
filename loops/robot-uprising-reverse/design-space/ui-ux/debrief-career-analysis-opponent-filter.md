# Career Analysis Filtered by Opponent Archetype

**Aspect:** 4.70 — Career analysis filtered by opponent archetype: running cross-match analysis filtered to "matches against heavy-hook opponents" or "matches ending before tick 60"; find structural weaknesses specific to opponent classes; interaction with 2.28 scenario fingerprinting.

**Parent:** 4.59 — Career Minimum Fix (cross-match architectural debt)
**Siblings:** 4.69m — Match-set scope label on combined coverage; 4.69 — Agent multi-cluster detection in career analysis
**Related:** 2.28 — Scenario fingerprinting; 4.36 — Multi-Scenario MFE; 4.49 — Cross-mission pattern detection; 4.25 — EDT trajectory as career metric; 4.68 — Coverage percentage as season health

---

## The Core Problem

Career analysis currently runs over all matches. It does not distinguish between a loss to a rush-spam opponent on tick 22 and a loss to a methodical hook-chain architect on tick 148. It treats the full history as a flat list, computes the career minimum fix across the entire corpus, and produces results that blend distinct failure modes into one averaged signal.

This averaging is the problem. A player who loses 40% of their matches might have two entirely separate vulnerabilities: a fragile opener that collapses against early aggression (responsible for 25% of losses) and a late-game buffer overflow condition that appears only against opponents running three or more concurrent hooks (responsible for the other 15%). The career minimum fix across all matches might find a change that partially addresses both — and fully addresses neither. The averaged fix is suboptimal for both failure modes because it was never optimizing for either one in isolation.

Real competitive analysis is always conditional. A chess player does not ask "what is my weakness?" in the abstract. They ask "what is my weakness against the London System?" or "why do I lose endgames against players rated 1800-2000?" The conditional frame makes the question tractable. It reduces the hypothesis space from "everything that could be wrong" to "what goes wrong in this specific structural situation."

Robot Uprising has all the raw data to support conditional career analysis. Every match has a scenario fingerprint (2.28) — a vector of structural properties describing the match conditions. Every opponent has an implicit archetype defined by their config's hook composition, attention allocation, and spawn timing. Every match has a duration, an EDT, a win/loss outcome, and a full tick-by-tick replay. The data is there. The career analysis system just does not expose a way to slice it.

Opponent archetype filtering transforms career analysis from a blunt instrument into a surgical one. Instead of "what is wrong with my architecture?" the player asks "what is wrong with my architecture when I face heavy-hook opponents?" — and the system answers with a career minimum fix computed only over that filtered match set, producing fixes that are precisely tuned to the structural properties of that opponent class.

### The Latent Archetype Problem

Opponents do not declare their archetype. There is no "heavy-hook" badge. The archetype must be inferred from the opponent's observed behavior across the match corpus. This inference is the core technical challenge: how does the system categorize opponents into archetypes from replay data alone?

The system must walk a line between too-coarse categories (which collapse distinct strategies into one bucket and reproduce the averaging problem) and too-fine categories (which create match sets so small that the filtered career analysis is statistically meaningless — the scope-mismatch problem from 4.69m, but self-inflicted by the filter taxonomy).

---

## The Design

### The Filter Taxonomy

Opponent archetype filtering uses a two-layer taxonomy: **structural filters** and **behavioral filters**. Structural filters describe measurable properties of the opponent's config at deployment time. Behavioral filters describe emergent properties of the match as it played out. Both are derived automatically from replay data — the player never needs to manually tag opponents.

#### Structural Filters (Config-Derived)

These describe what the opponent brought to the match, regardless of what happened:

| Filter | Description | Computed From |
|--------|-------------|---------------|
| **Hook density** | Low (0-2 hooks), Medium (3-5), High (6+) active hooks | Opponent config snapshot at deployment |
| **Spawn timing** | Early-heavy (>60% spawns before tick 40), Even, Late-heavy (>60% spawns after tick 80) | Opponent spawn schedule in replay |
| **Attention breadth** | Narrow (attention concentrated on 1-2 grid zones), Wide (3+ zones) | Opponent attention allocation heat map |
| **Buffer architecture** | Single-buffer, Multi-buffer, No-buffer | Opponent config structure |
| **Relay dependency** | Low (<20% of processing through relays), High (>50% through relays) | Opponent signal routing graph |

#### Behavioral Filters (Outcome-Derived)

These describe what happened during the match, regardless of what either player brought:

| Filter | Description | Computed From |
|--------|-------------|---------------|
| **Match duration** | Quick (<tick 60), Standard (60-140), Marathon (140+) | Match termination tick |
| **EDT band** | Early-resolved (EDT <0.25), Mid-resolved (0.25-0.60), Late-resolved (0.60+) | Effective Determination Tick |
| **Outcome** | Win, Loss, Draw | Match result |
| **Failure mode** | Overwhelmed (lost all units), Starved (ran out of processing budget), Outmaneuvered (lost positional control) | Debrief failure classification |
| **Scenario type** | Relay Flood, Hook Storm, Attrition, Mixed | 2.28 scenario fingerprint classification |

#### Compound Filters

Players can combine structural and behavioral filters using AND logic. The UI does not support OR — compound filters always narrow, never widen. This prevents the combinatorial explosion of arbitrary boolean queries while preserving the most common analytical patterns:

- "Heavy-hook opponents AND matches I lost" — what goes wrong specifically against hook-heavy strategies?
- "Early-heavy spawn AND quick matches" — am I getting rushed by aggressive openers?
- "High relay-dependency AND marathon matches" — do relay-heavy opponents grind me down in long games?

Each compound filter produces a match count in real time as filters are toggled, displayed beside the `[Run Analysis]` button: "23 matches selected." This count is the denominator for the scope label (4.69m) that will appear on the results.

### Archetype Presets

For players who do not want to construct filters manually, the system offers four named presets. These are compound filters with display names that map to common competitive archetypes:

| Preset Name | Filters Applied | Icon |
|-------------|----------------|------|
| **Rushdown** | Early-heavy spawn + Quick match + Hook density Low-Medium | A forward-pointing chevron, sharp, rendered in `#C44A2A` (aggressive red-orange) |
| **Hook Fortress** | Hook density High + Late-heavy or Even spawn + Marathon match | A layered shield with hook symbols inside, rendered in `#4A6AC4` (cold blue) |
| **Relay Weaver** | High relay dependency + Attention breadth Wide + Standard-Marathon match | Branching node graph, rendered in `#6A4AC4` (deep violet) |
| **Attrition Grinder** | Even spawn + Marathon match + EDT band Late-resolved | A slow-turning gear, rendered in `#8A8A5A` (muted olive) |

Presets are displayed as icon-label pills in a horizontal row above the filter panel. Tapping a preset fills the filter fields and updates the match count. Presets are not fixed — the player can modify the preset's filters after selecting it, at which point the preset label dims and a "(modified)" suffix appears.

### Interaction with Scenario Fingerprinting (2.28)

Scenario fingerprinting (2.28) categorizes each match by its structural properties — the "shape" of the match independent of who played it. Opponent archetype filtering categorizes matches by who the opponent was. These are orthogonal axes:

- **Scenario fingerprint** answers: "What kind of match was this?"
- **Opponent archetype** answers: "What kind of opponent was this?"

A match has both a scenario fingerprint and an opponent archetype. The filter panel displays both axes as separate filter groups, and compound filters can span both. This enables questions like:

- "Show me Relay Flood scenarios where I faced Hook Fortress opponents" — isolating a specific scenario-archetype intersection.
- "Show me all matches against Rushdown opponents regardless of scenario type" — isolating the opponent axis.
- "Show me all Attrition scenarios regardless of opponent" — isolating the scenario axis.

The scenario fingerprint filters populate from the 2.28 classification system. The opponent archetype filters populate from the structural/behavioral taxonomy above. The two filter groups render in visually distinct sections of the filter panel — scenario filters on the left with a grid-pattern background texture in `#2A2A3A` (deep slate), opponent filters on the right with a circuit-pattern background texture in `#2A3A2A` (deep teal). The visual distinction prevents the player from confusing the two axes, which is critical: "I always lose Relay Flood matches" is a fundamentally different diagnosis than "I always lose to Hook Fortress players," even though both might explain the same set of losses.

### The Filtered Career Minimum Fix

When the player runs career analysis with filters active, the career minimum fix computation (4.59) operates only over the filtered match set. The computation is identical — 150 candidate mutations tested against N matches — but N is now the filtered count, not the full career.

This produces a career minimum fix that is specific to the filtered opponent class. The fix for "matches against heavy-hook opponents" may be entirely different from the fix for "matches against rushdown opponents." This is the point: different opponent archetypes exploit different architectural weaknesses, and the filtered career minimum fix surfaces the weakness that matters for the class the player is investigating.

The filtered career minimum fix result card always displays the 4.69m scope label:

```
Career Minimum Fix (filtered)
Change: RELAY-C filter threshold 0.4 -> 0.6
Improves: 14/18 matches
Computed over 18 matches (vs. Hook Fortress opponents, M155-M200)
```

If the player has not applied any filters, the scope label reads "(full career)" as usual.

### The Weakness Heatmap

A synthesis view — the **Weakness Heatmap** — renders after the player has run filtered career analysis across two or more archetype presets. The heatmap is a grid where rows are agents (RELAY-C, GUARDIAN-A, ARBITER-D) and columns are opponent archetypes (Rushdown, Hook Fortress, Relay Weaver, Attrition Grinder). Each cell displays the combined coverage percentage for that agent against that archetype, colored on a gradient from `#2A3A2A` (dark, low coverage = not a weakness) through `#D4A053` (amber, moderate weakness) to `#C44A2A` (red-orange, severe weakness).

The heatmap makes structural patterns visible at a glance:

```
               Rushdown    Hook Fort    Relay Wvr    Attrition
RELAY-C          12%         78%          45%           8%
GUARDIAN-A       67%          5%          12%          31%
ARBITER-D        22%         14%          61%          55%
```

In this example, the player can immediately see: RELAY-C has a Hook Fortress problem. GUARDIAN-A has a Rushdown problem. ARBITER-D has a Relay Weaver and Attrition problem. Each of these is a distinct architectural weakness requiring a distinct fix. The unfiltered career analysis would have blended these into one averaged signal. The heatmap separates them.

The heatmap renders only after the player has computed at least two archetype-filtered analyses. Each new filtered analysis adds a column. The heatmap is not precomputed — it assembles from cached filtered results, filling in as the player explores. Empty cells (archetypes not yet analyzed) render as hatched grey (`#3A3A3A` diagonal lines at 45 degrees, 2px spacing), with a tooltip reading "Run career analysis vs. [archetype] to fill this cell."

---

## Player Journeys

### Journey 1 — The Plateau Player Discovers a Hidden Weakness

**FADE IN on the career analysis panel. MARCUS, a mid-Season 3 player with a 52% win rate that has not moved in 40 matches, opens career analysis after another frustrating loss.**

**[0:00]** Marcus runs a standard full-career analysis. The spinner — a thin ring of `#D4A053` amber orbiting a hollow center, one revolution per 800ms — completes after 6.2 seconds. A two-note ascending chime (C4-E4, soft sine wave, 120ms per note) signals completion. The candidate list renders with staggered 80ms delays. Five rows. The career minimum fix is RELAY-C filter threshold. Coverage: 28% across 85 matches. Marcus stares at it. He has seen this before. He has already adjusted RELAY-C's filter threshold three times. The 28% feels like noise — low enough that it might not be a real pattern.

**[0:12]** He notices the archetype preset pills above the filter panel for the first time. Four icons in a horizontal row: the red-orange chevron (Rushdown), the cold-blue shield (Hook Fortress), the violet node-graph (Relay Weaver), the olive gear (Attrition Grinder). Each pill is 36px tall, rounded corners at 8px radius, rendered with a subtle 1px inset shadow that gives a tactile, pressable quality. He taps **Hook Fortress**.

**[0:14]** The filter panel slides open — a 200ms downward expansion with spring easing. The structural filters auto-populate: Hook density HIGH checked, Spawn timing LATE-HEAVY and EVEN checked, Match duration MARATHON checked. The match count updates in real time beside the Run Analysis button: "22 matches selected." The count number animates from 85 to 22 with a fast-counting scroll effect (150ms), and the text color shifts from white to `#D4A053` amber to signal a narrowed scope.

**[0:17]** Marcus clicks `[Run Analysis]`. The spinner appears again, pitched slightly higher (F4 instead of C4 in the mechanical whir) to signal the narrowed scope. Completes in 3.1 seconds — faster, because fewer matches. The candidate list re-renders. RELAY-C filter threshold appears again — but now at **71% coverage**. The number counts up from 0% in a 400ms ease-out and the color shifts from white through amber to `#C44A2A` red-orange as it passes 60%. A scope label beneath reads: "Computed over 22 matches (vs. Hook Fortress opponents, M115-M200)."

**[0:22]** Marcus sits forward. 71% is not noise. Against Hook Fortress opponents specifically, his RELAY-C filter threshold is catastrophically wrong. The career minimum fix computed against Hook Fortress opponents is a different threshold value than the one he kept adjusting based on the full-career analysis. The averaged 28% across all matches was hiding a severe 71% weakness in one opponent class diluted by near-zero weakness in the other three classes.

**[0:28]** He taps **Rushdown** preset. Match count: 31 matches. Runs analysis. 2.8 seconds. RELAY-C does not appear in the top 10. The career minimum fix for Rushdown is GUARDIAN-A spawn delay — a completely different agent, a completely different fix. Coverage: 54%. The scope label reads: "Computed over 31 matches (vs. Rushdown opponents, M115-M200)."

**[0:35]** Marcus opens the Weakness Heatmap. It slides up from the bottom of the career analysis panel, a 300ms expansion with a slight bounce at terminal position. Two columns are filled: Hook Fortress and Rushdown. The RELAY-C row shows 71% under Hook Fortress, 4% under Rushdown. The GUARDIAN-A row shows 3% under Hook Fortress, 54% under Rushdown. The visual is immediate: two completely separate weaknesses, one per opponent class. The full-career analysis was averaging them into a single mediocre signal. The filtered analyses separated them into two strong, actionable signals.

**[0:42]** Marcus applies the RELAY-C fix specifically tuned for Hook Fortress opponents. He knows the fix might hurt his Rushdown matchup (it does not — RELAY-C was irrelevant against Rushdown). He queues for a Gauntlet match. His plateau is about to break.

**FADE OUT.**

### Journey 2 — The Analyst Hunts a Timing Vulnerability

**FADE IN on the career analysis filter panel. YUNA, a Season 5 analyst who maintains a spreadsheet of her match history, suspects she has a problem with matches that end before tick 60 but has never been able to prove it.**

**[0:00]** Yuna ignores the archetype presets and goes straight to the behavioral filter group on the right side of the filter panel. The circuit-pattern background texture in `#2A3A2A` (deep teal) distinguishes it from the scenario filters on the left. She checks **Match duration: Quick (<tick 60)** and **Outcome: Loss**. Match count updates: "14 matches selected." She does not apply any structural filters — she wants all opponent types, filtered only by the timing condition.

**[0:05]** She clicks `[Run Analysis]`. The spinner completes in 2.0 seconds. The candidate list renders. A single agent dominates: SENTRY-B attention allocation appears in positions #1, #2, and #4. The multi-cluster flag fires with a pulse of amber light expanding from center-out:

```
SENTRY-B appears in 3 of your top 5 candidates.
Combined coverage: 86%
Computed over 14 matches (Quick losses only, M120-M195)
```

**[0:09]** The scope-mismatch warning fades in:

```
Full-career combined coverage for SENTRY-B: 19%
This cluster is 67pp stronger in this filtered view.
```

**[0:12]** Yuna expected this. The 67pp delta does not alarm her — she deliberately created a narrow filter. The 86% is meaningful precisely because it is narrow: 86% of her quick losses share a SENTRY-B attention failure. She clicks into the career minimum fix detail. The fix is specific: SENTRY-B's attention priority list has "relay monitoring" ranked above "threat detection" in the first 40 ticks. In quick matches, threats arrive before relays matter. By the time SENTRY-B pivots to threat detection, the match is already lost.

**[0:18]** She applies a compound filter: **Quick match + Hook Fortress opponents**. Match count: 6. She runs analysis. The career minimum fix is the same SENTRY-B attention priority — but the coverage drops from 86% to 100% (6/6). Every single quick loss against Hook Fortress opponents was caused by the same attention ordering bug. She cross-references with the scenario fingerprint axis: she adds **Scenario type: Hook Storm** to the filter. Match count: 4. Coverage: 100% (4/4). The fingerprint and archetype filters converge on the same root cause.

**[0:25]** Yuna opens her spreadsheet, marks the four match IDs, and notes the fix. She swaps SENTRY-B's attention priority for ticks 0-40 so threat detection outranks relay monitoring. She re-runs full-career analysis to confirm the fix does not regress her other matchups. Full career minimum fix: SENTRY-B no longer appears in the top 10. The timing vulnerability is surgically resolved.

**FADE OUT.**

### Journey 3 — The Competitor Prepares for a Known Opponent

**FADE IN on the Gauntlet lobby. DESHI, a top-50 ranked player in Season 7, sees his next scheduled opponent: IronVeil, a player he has faced 11 times this season with a 4-7 record.**

**[0:00]** Deshi opens career analysis and applies a manual opponent filter — not an archetype preset but a specific opponent. He types "IronVeil" into the opponent search field. The search field has a monospaced font in `#A0C4A0` (pale green), matching the terminal aesthetic of the Inspector panel. An autocomplete dropdown appears after 2 characters, listing matching opponent names with their match counts: "IronVeil (11 matches)". He selects it.

**[0:04]** The filter panel reconfigures. The structural filters auto-populate from IronVeil's observed profile across 11 matches: Hook density MEDIUM-HIGH, Spawn timing EVEN, Relay dependency HIGH. The match count reads "11 matches selected." The text "(vs. IronVeil specifically)" appears beneath the match count in `#8A8A7A` muted sage, distinguishing this from an archetype filter — this is a named opponent, not a class.

**[0:07]** He runs analysis. The spinner whirs at the same F4 pitch that signals narrowed scope. 1.8 seconds. The career minimum fix: ARBITER-D threshold sensitivity. Coverage: 9/11 matches (82%). The scope label:

```
Career Minimum Fix (vs. IronVeil)
Change: ARBITER-D threshold sensitivity 0.7 -> 0.5
Improves: 9/11 matches
Computed over 11 matches (vs. IronVeil, M160-M198)
```

**[0:12]** Deshi exhales through his nose. 82%. Nine of eleven matches against IronVeil would have been improved by a single threshold change. IronVeil has been exploiting the same ARBITER-D sensitivity gap across the entire season. Deshi's ARBITER-D was set at 0.7 — a threshold tuned for average opponents. IronVeil's relay-heavy strategy produces signals that sit right at 0.65-0.69, just below ARBITER-D's detection threshold. Every match, IronVeil's signals slip under the wire.

**[0:18]** Deshi checks the scenario fingerprint axis. He adds **Scenario type: Relay Flood** to the filter. Match count drops to 7. Coverage stays at 100% (7/7). He removes Relay Flood and adds **Scenario type: Mixed**. Match count: 4. Coverage drops to 50% (2/4). The vulnerability is scenario-dependent: in Relay Flood conditions, IronVeil's exploit is perfect. In Mixed scenarios, it is inconsistent. This tells Deshi that the fix is safe — lowering ARBITER-D's threshold to 0.5 will catch IronVeil's relay signals without over-triggering in non-relay scenarios.

**[0:24]** He applies the change. ARBITER-D threshold: 0.5. He queues into the Gauntlet match against IronVeil. The match loads. For the first time in 11 encounters, ARBITER-D catches IronVeil's relay signals on tick 34 — a full 28 ticks earlier than it ever has before. The match plays out differently from tick 34 onward. Deshi wins. His record against IronVeil is now 5-7.

**FADE OUT.**

---

## Strengths and Weaknesses

### Strengths

**Transforms career analysis from descriptive to prescriptive.** The unfiltered career minimum fix describes what is most wrong on average. The filtered career minimum fix prescribes what to fix for a specific situation. The difference is the gap between a doctor saying "you have inflammation somewhere" and "you have inflammation in your left knee when you run downhill." The conditional diagnosis leads directly to targeted treatment.

**Leverages existing data with zero additional computation at match time.** Every match already produces scenario fingerprints, opponent config snapshots, EDT values, and full replays. The filter taxonomy is pure post-hoc classification over data that already exists. No new telemetry, no new match-time cost, no new storage requirements beyond the classification labels themselves.

**Creates a natural progression ramp for analytical sophistication.** New players ignore the filters entirely and use full-career analysis. Intermediate players discover the archetype presets and run two or three filtered analyses. Advanced players construct compound filters and build the full Weakness Heatmap. Expert players filter by specific named opponents before scheduled matches. Each tier adds analytical depth without invalidating the previous tier.

**The Weakness Heatmap is a genuine strategic artifact.** No other game in this genre produces a per-agent, per-archetype vulnerability matrix that the player assembled themselves through iterative filtered analysis. The heatmap is not a system-generated report — it is a research artifact built through the player's own analytical work, filled in one column at a time as they investigate different opponent classes. This gives it the weight of discovery rather than the passivity of a dashboard.

### Weaknesses

**Small match counts in filtered sets risk spurious signals.** A player with 80 career matches who filters to "Rushdown + Quick match + Losses" might have 4 matching matches. A career minimum fix computed over 4 matches is noise. The scope label (4.69m) mitigates this by displaying the match count prominently, but the system does not actively prevent the player from acting on a 4-match analysis. Design decision: should the system show a minimum-sample warning below N=8? Probably yes. A faded text line: "Low sample: 4 matches. Results may not reflect structural patterns." Threshold: N<8 triggers the warning.

**Archetype presets may not match the player's actual opponent distribution.** The four presets (Rushdown, Hook Fortress, Relay Weaver, Attrition Grinder) are the game designer's taxonomy. The actual Gauntlet meta may produce opponent archetypes that do not cleanly fit any preset — a hybrid rush-hook player, a relay-light attrition player. The presets are a starting point, not a comprehensive taxonomy. The manual filter controls exist precisely for this case, but the presets may create a false sense of completeness.

**Computation time scales with filter exploration.** Each filtered career analysis takes 2-6 seconds. A thorough player who runs four archetype presets plus three custom filters has spent 25-40 seconds waiting for spinners. This is tolerable but not invisible. If the system cached filtered results (which it should, keyed by filter hash), repeat investigations would be instant. Cache invalidation: whenever the player completes a new match, all cached filtered results become stale and must be recomputed on next access.

**The Weakness Heatmap can create analysis paralysis.** A player who sees four agents with four archetype columns — sixteen cells — may struggle to prioritize. Which weakness do they fix first? The heatmap shows the landscape but does not recommend a path. A potential mitigation: the heatmap highlights the single highest-coverage cell with a pulsing border, suggesting "start here."

---

## Interaction Effects

### With 2.28 — Scenario Fingerprinting

Scenario fingerprinting provides the classification vocabulary for one axis of the filter system. Without 2.28, the behavioral filter "Scenario type" would not exist — the system would have no way to categorize matches by structural shape. The interaction is foundational, not additive: 2.28 is a dependency, not a companion feature.

The deeper interaction is in compound filtering. When a player combines a scenario fingerprint filter (Relay Flood) with an opponent archetype filter (Hook Fortress), they are asking a question that neither system could answer alone: "What goes wrong when Hook Fortress opponents appear in Relay Flood conditions?" This intersection is where the most specific — and therefore most actionable — career minimum fixes live.

### With 4.59 — Career Minimum Fix

The career minimum fix computation is the engine that opponent archetype filtering feeds into. Without 4.59, the filter system would have nothing to compute. With filters, 4.59's computation becomes faster (fewer matches to simulate) and more precise (the fix is tuned to a specific opponent class, not the full distribution). The interaction is symbiotic: 4.59 provides the analytical power, 4.70 provides the analytical targeting.

A subtle tension: the career minimum fix across the full career (4.59 unfiltered) may differ from the career minimum fix for each filtered subset. The player now has multiple competing "minimum fixes" — one per archetype. This is a feature, not a bug: it reveals that there is no single universal fix, and different opponent classes require different adaptations. But it requires the player to hold multiple fix candidates in mind and choose which to apply based on their matchmaking distribution.

### With 4.69m — Match-Set Scope Label

The scope label is the safety mechanism that prevents filtered career analysis from being misinterpreted. Every design decision in 4.70 depends on 4.69m being present and mandatory. Without the scope label, a filtered career minimum fix of "82% coverage" looks identical to an unfiltered one — and the player might redesign their entire architecture based on a 12-match sample against one opponent. The scope label is not a companion feature to 4.70 — it is a prerequisite. 4.70 should not ship without 4.69m.

### With 4.36 — Multi-Scenario MFE

The MSMFE operates on PvE robustness scenarios. Opponent archetype filtering operates on PvP Gauntlet matches. They address different game modes but share the same underlying principle: computing minimum fixes over a filtered subset of matches rather than the full corpus. A player transitioning from PvE campaign to PvP Gauntlet will find the same analytical pattern — "narrow the scope, sharpen the fix" — in both modes. This cross-mode consistency reinforces the analytical skill that Robot Uprising teaches.

### With 4.49 — Cross-Mission Pattern Detection

Cross-mission pattern detection (4.49) automatically identifies patterns that repeat across matches. Opponent archetype filtering is the manual version of the same insight: the player is the one identifying the cross-match pattern ("I keep losing to hook-heavy opponents") and the filter system is the tool they use to validate or refute their hypothesis. In a mature implementation, 4.49 could suggest archetype filters: "You have lost 7 of your last 9 matches against opponents with High Hook Density. Run filtered career analysis for this archetype?" This suggestion bridges the automated detection and the manual investigation.

---

## Comparable Games / Media

**Chess.com's Opening Explorer filtered by opponent rating.** Chess players can filter their opening statistics by opponent rating band — "my performance with the Sicilian against 1800-2000 players" vs. "against 2200+ players." The insight is the same: aggregate performance masks rating-conditional weaknesses. A player might score 60% with the Sicilian overall but 35% against 2200+ opponents, revealing that the opening collapses against precise play. Robot Uprising's archetype filter is the equivalent: your config might perform well overall but collapse against a specific opponent class.

**Overwatch's hero matchup statistics on Overbuff/stats sites.** Third-party stat sites for Overwatch show hero-vs-hero win rates. A Reinhardt player might have a 55% overall win rate but a 38% win rate against teams running Reaper + Ana. The matchup-specific stat is more actionable than the aggregate. Robot Uprising makes this analysis first-party and integrated into the game's analytical toolset rather than requiring external sites.

**Poker HUDs (Heads-Up Displays) with opponent categorization.** Professional online poker players use HUDs that categorize opponents by VPIP/PFR (loose/tight, passive/aggressive) and filter their own performance stats against each category. "My win rate against loose-aggressive players in the blinds" is a filtered career analysis. The archetype presets in Robot Uprising (Rushdown, Hook Fortress, etc.) map directly to poker's loose-passive, tight-aggressive, etc. taxonomy.

**Baseball sabermetrics: platoon splits.** A batter's overall average might be .270, but their average against left-handed pitchers might be .310 while against right-handed pitchers it is .245. The "platoon split" is the original opponent-archetype filter — the same analytical move, applied to a different competitive domain. The Weakness Heatmap is Robot Uprising's version of a platoon splits table.

---

## Sensory Description

### The Filter Panel

The filter panel occupies the right third of the career analysis screen, divided vertically into two zones. The left zone (scenario filters from 2.28) has a background texture of faint grid lines in `#2A2A3A` (deep slate) — the pattern evokes graph paper, analysis, measurement. The right zone (opponent archetype filters) has a background texture of faint circuit traces in `#2A3A2A` (deep teal) — the pattern evokes the opponent's config structure, their wiring.

Each filter checkbox is a small square with rounded corners (4px radius, 1px border in `#5A5A5A`). When checked, the square fills with a directional wipe from left to right over 120ms, the fill color matching the filter category: `#D4A053` amber for behavioral filters, `#4A8A6A` muted green for structural filters. The checkmark renders as a single-stroke path that draws itself on over 80ms, white on the fill color.

### The Archetype Preset Pills

Four pills arranged horizontally above the filter panel. Each pill is 120px wide, 36px tall, with 8px corner radius. Unselected: background `#1A1A1A` (near-black), border 1px `#3A3A3A`, icon and label in `#6A6A6A` (muted grey). Selected: background fills with a horizontal gradient using the archetype's signature color (e.g., `#C44A2A` for Rushdown) at 15% opacity, border brightens to the full archetype color, icon and label shift to full white. The transition between states is a 180ms ease-in-out cross-fade.

Hovering over an unselected pill triggers a 100ms scale-up to 102% and the border brightens to `#5A5A5A`. A tooltip appears after 600ms of hover: "Rushdown: Early-heavy spawn, quick matches, low-medium hook density. 31 matches in your career." The tooltip has a `#1A2A1A` background with 1px `#3A3A3A` border and renders below the pill with an 8px offset.

### The Match Count Animator

When a filter is toggled, the match count beside the `[Run Analysis]` button updates with a counting-scroll animation. The old number scrolls upward and fades out (150ms) while the new number scrolls in from below (150ms). If the new count is lower than the old count, the text color transitions from white to `#D4A053` amber over 200ms, signaling a narrowing scope. If the new count equals the full career count (all filters cleared), the text returns to white over 200ms.

A subtle sound accompanies the count change: a soft click, like a mechanical counter incrementing — a single 40ms sample of a rotary counter, pitched at B3 for narrowing (count decreased) and D4 for widening (count increased). The click is mixed at -18dB, perceptible but not attention-demanding.

### The Weakness Heatmap

The heatmap renders in a dedicated panel that slides up from the bottom of the career analysis screen over 300ms with spring easing (slight 4px bounce at terminal position). The grid cells are 80px square with 2px gaps. Each cell's background color is computed from a three-stop gradient mapped to the coverage percentage:

- 0-20%: `#2A3A2A` (dark teal-green, the "safe" color)
- 20-50%: interpolated through `#D4A053` (amber, the "caution" color)
- 50-100%: interpolated through `#C44A2A` (red-orange, the "critical" color)

When the heatmap first appears, each filled cell animates its color from `#1A1A1A` (near-black) to its final color over 600ms with a 100ms stagger per cell, filling left-to-right, top-to-bottom. The coverage percentage in each cell counts up from 0% to its final value in sync with the color fill. Empty cells (unanalyzed archetypes) render with diagonal hatching — 2px lines at 45 degrees in `#3A3A3A` on a `#1A1A1A` background — with no animation.

The highest-coverage cell in the heatmap receives a slow-pulsing border: 2px solid, alternating between the cell's coverage color and white at a 2-second cycle (1s fade to white, 1s fade back). This pulse is the system's implicit recommendation: "this is your worst matchup-specific weakness."

### Audio During Filtered Analysis

The analysis spinner sound is a continuous mechanical whir — a synthesized motor loop at -12dB, pitched at C4 for full-career analysis and F4 for filtered analysis. The pitch difference is subtle (a perfect fourth higher) but consistent, training the player's ear to distinguish "analyzing everything" from "analyzing a slice."

The completion chime is two ascending notes. For full-career: C4-E4 (major third, warm, resolved). For filtered analysis: E4-A4 (perfect fourth, slightly brighter, more focused). The tonal shift mirrors the analytical shift: full-career analysis produces a broad, warm signal; filtered analysis produces a sharp, focused signal.

When a filtered career minimum fix exceeds 70% coverage, the completion chime adds a third note — a low undertone at C3, held for 400ms beneath the two-note chime. The undertone vibrates at the edge of perception, signaling: this number is significant. Pay attention. The player does not consciously parse the undertone, but over dozens of analyses, they learn to feel the difference between a routine result and a high-coverage finding.
