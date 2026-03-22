# Match-Set Scope Label on Combined Coverage

**Aspect:** 4.69m — Match-set scope label on combined coverage: requiring the career analysis panel to display which match set the combined coverage was computed over (full career, filtered-by-opponent, filtered-by-scenario-type); prevents misinterpretation of adversarially-high coverage in narrow match sets; "clustered vs. Opponent X only" vs. "clustered across all opponents" as structural vs. adversarial disambiguation.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined agent coverage score display; 4.69e — Adversarial multi-cluster poisoning; 4.69d — Multi-cluster persistence tracking
**Related:** 4.70 — Career analysis filtered by opponent archetype; 2.28 — Scenario fingerprinting; 4.59 — Career minimum fix; 4.68 — Coverage percentage as season health

---

## The Core Problem

The combined coverage score (4.69b) is a powerful number. "71% of your matches would improve if all RELAY-C elements were fixed" creates conviction. It is a ceiling metric, an architectural ROI argument, a reason to rebuild. But the number has no provenance. It does not say *which matches* were included in the computation. It does not say whether the 71% was computed over your full 200-match career, a filtered 20-match window against a single opponent, or a 35-match slice of one scenario type. The number floats, untethered from its denominator.

This is dangerous because the denominator changes the meaning of the number completely.

**71% combined coverage across 200 matches (full career):** RELAY-C has a structural problem. It fails in more than two-thirds of all matches you have ever played, regardless of opponent or scenario. Rebuild it.

**71% combined coverage across 20 matches (vs. NebulaFang only):** RELAY-C has a NebulaFang problem. NebulaFang is targeting it. The 71% describes your performance against one opponent, not your architecture's health. Hardening against NebulaFang is the fix, not a holistic redesign.

**71% combined coverage across 15 matches (Relay Flood scenarios only):** RELAY-C has a scenario-type problem. It was never designed for relay flood conditions. The 71% describes a gap in your roster's scenario coverage, not a flaw in RELAY-C's core design.

Without the scope label, the player cannot distinguish between these three radically different diagnoses. The number 71% is identical in all three cases. The action the player should take is completely different. The scope label is not decorative metadata — it is the semantic frame that makes the combined coverage number interpretable.

### The Adversarial Amplification Problem

This is not merely a readability concern. The absence of scope labeling has an active adversarial surface. The career analysis system supports opponent filtering (4.70) and scenario filtering (2.28). A player can choose to run career analysis on a narrow match set — "show me only my matches against NebulaFang" — and receive a combined coverage score computed over that narrow slice.

In this mode, the combined coverage is almost always higher than the full-career equivalent. Narrow match sets have less diversity: fewer opponents means fewer distinct failure modes, which means the cluster members are more concentrated (they all fail against the same opponent for the same reasons). The coverage numbers are inflated by the reduced denominator.

If the scope label is absent, the player sees "combined coverage: 84%" and panics. If the scope label reads "combined coverage: 84% (computed over 12 matches vs. NebulaFang)," the player sees the 84% in context and asks the correct follow-up question: "What is it across my full career?"

The adversarial case from 4.69e compounds this. A poisoning opponent wants the player to see an inflated cluster signal. If the player has already filtered by opponent (to investigate the NebulaFang matchup), the poisoning attack is at maximum effectiveness — and the only defense is the scope label making the narrow basis explicit. Without it, the combined coverage number becomes the opponent's weapon: a number the player's own tools generated, pointing to a problem that does not exist at the structural level.

---

## The Design

### The Scope Label Anatomy

Every combined coverage display in the career analysis panel includes a mandatory scope label directly beneath or inline with the percentage. The label has three components:

1. **Match count** — the denominator: how many matches were included in the computation
2. **Scope type** — one of three values: `Full career`, `vs. [Opponent Name]`, or `[Scenario Type] only`
3. **Date range** — the temporal window: "M145-M190" or "Season 3, weeks 1-6"

The visual format is a secondary text line in a muted color, always present, never collapsible:

```
Combined coverage: 71%
Computed over 45 matches (full career, M145-M190)
```

or:

```
Combined coverage: 84%
Computed over 12 matches (vs. NebulaFang, M178-M190)
```

or:

```
Combined coverage: 63%
Computed over 15 matches (Relay Flood scenarios only, M150-M190)
```

The scope label is not a tooltip, not a hover-reveal, not a collapsible detail section. It is always visible. It renders in the same card as the combined coverage percentage, one line below, in a smaller font weight but the same font family. It cannot be dismissed or hidden. The rationale is simple: the scope label is not additional detail — it is the denominator of the fraction. Displaying 71% without its denominator is like displaying "28" without saying "28 out of 45." The label completes the number.

### Scope-Mismatch Warning

When the player has an active filter applied to their career analysis (opponent filter or scenario filter), and the combined coverage exceeds the full-career combined coverage by more than 15 percentage points, a scope-mismatch warning renders beneath the scope label:

```
Combined coverage: 84%
Computed over 12 matches (vs. NebulaFang, M178-M190)
⚠ Full-career combined coverage for RELAY-C: 41%
   This cluster is 43pp stronger in this filtered view.
```

The warning performs a structural-vs-adversarial disambiguation passively. The player does not need to manually compare two career analysis runs. The system pre-computes the full-career combined coverage for any clustered agent when a filter is active, and surfaces the delta automatically. If the filtered coverage is similar to the full-career coverage (within 15pp), no warning appears — the cluster is real regardless of scope.

The 15pp threshold is tunable. At 10pp, the warning fires frequently and may feel noisy. At 20pp, it misses moderate adversarial inflation. 15pp is the default — a filtered combined coverage of 56% when the full-career is 41% is a notable gap (15pp exactly) that merits a label but not an alarm.

### Scope Comparison Mode

A dedicated comparison affordance allows the player to see the same cluster's combined coverage across all three scope types simultaneously:

```
┌────────────────────────────────────────────────────────────────┐
│  RELAY-C — Combined Coverage by Scope                          │
│                                                                │
│  Full career (200 matches):           ████████░░░░ 41%         │
│  vs. NebulaFang (12 matches):         █████████████████ 84%    │
│  vs. All others (188 matches):        ███████░░░░░ 34%         │
│  Relay Flood only (15 matches):       ████████████░ 63%        │
│  Non-Relay Flood (185 matches):       ███████░░░░░ 38%         │
│                                                                │
│  Diagnosis: RELAY-C clusters primarily vs. NebulaFang          │
│  and in Relay Flood scenarios. Full-career cluster is weak.    │
└────────────────────────────────────────────────────────────────┘
```

This view is accessible via a `[Compare scopes]` button on any combined coverage display. It is not the default view — it requires one click — because it introduces significant information density. The comparison is the definitive disambiguation tool: if the full-career coverage is 41% but the opponent-filtered coverage is 84%, the cluster is adversarial. If the full-career and filtered views are similar, the cluster is structural.

---

## Player Journeys

### Journey 1 — The Misled Veteran (Adversarial Poisoning Discovery)

**FADE IN on the career analysis panel. NORA, a Season 4 veteran with a 58% win rate, has just run career analysis over her last 45 matches.**

**[0:00]** The candidate list renders. Five rows slide in with staggered 80ms delays, each row fading from transparent to full opacity over 200ms. The coverage percentages count up from 0% to their final values in a 400ms ease-out animation. A low-register chime sounds — a two-note ascending tone (C4-E4, soft sine wave, 120ms per note) — signaling the analysis is complete.

**[0:02]** The multi-cluster flag pulses into view at the top of the panel. A horizontal amber line expands from center-out across the full width of the card (300ms, ease-in-out), then the flag text fades in above it. The amber line color is `#D4A053` — warm, cautionary, not alarming. The flag reads:

```
⚠ RELAY-C appears in 3 of your top 5 candidates.
  Combined coverage: 71%
  Computed over 45 matches (full career, M145-M190)
```

Nora reads the scope label. Full career. 45 matches. She notes this is legitimate — the cluster covers her entire recent history. She opens the Agent Audit.

**[0:08]** Inside the Agent Audit, she scans the match-source breakdown (4.69e). The per-opponent bars render left-to-right with a 150ms stagger. NebulaFang's bar fills to 38pp — visibly dominating the breakdown. The scope label beneath the combined coverage inside the audit reads identically: "Computed over 45 matches (full career, M145-M190)." Nora's eyes track between the scope label and the opponent bar. Full career, but one opponent dominates.

**[0:14]** She clicks `[Compare scopes]`. The comparison panel slides up from the bottom of the audit card (250ms, spring easing with a slight bounce at terminal position). Five horizontal bar charts render simultaneously, each bar filling from left-to-right over 500ms with a gradient fill — the bar transitions from `#2A3A2A` (dark teal-black) at the left edge to `#D4A053` (amber) at the tip. The numbers count up beside each bar.

```
Full career (45 matches):            71%
vs. NebulaFang (20 matches):         92%
vs. All others (25 matches):         34%
```

**[0:18]** Nora sees it. The 71% full-career number is real, but it is inflated by NebulaFang's 20 matches driving 92% coverage in isolation. Against all other opponents, RELAY-C clusters at only 34% — below the meaningful threshold. She exhales. RELAY-C is not broken. NebulaFang has been targeting it.

**[0:22]** She dismisses the audit and selects `[Counter NebulaFang's Strategy]`. The scope label on the combined coverage persists in the top-right corner of the counter-strategy panel as a persistent reminder: the analysis she is working from was computed over a narrow opponent set. The label reads "Scope: vs. NebulaFang (20 matches)" in `#8A8A7A` (muted sage), anchored in the panel header.

**FADE OUT.**

### Journey 2 — The Rookie's First Filter (Accidental Narrow Scope)

**FADE IN on the career analysis setup screen. KAITO, a Season 1 player with 30 career matches, is experimenting with the opponent filter for the first time.**

**[0:00]** Kaito selects "Analyze vs. specific opponent only" and picks "SteelThorn" — an opponent he lost to three times in a row yesterday. He clicks `[Run Career Analysis]`. The analysis spinner rotates — a thin amber ring (`#D4A053`) orbiting a hollow center, completing one revolution per 800ms. A faint mechanical whir plays, pitched slightly higher than the standard career analysis sound (F4 instead of C4) to signal the narrowed scope. The spinner completes after 2.4 seconds.

**[0:03]** The candidate list renders. Three entries, all from GUARDIAN-A. The multi-cluster flag fires:

```
⚠ GUARDIAN-A appears in 3 of your top 3 candidates.
  Combined coverage: 100%
  Computed over 3 matches (vs. SteelThorn, M28-M30)
```

100% combined coverage. Every match in the scope would be improved by fixing GUARDIAN-A. The number is alarming — but the scope label immediately contextualizes it. Three matches. One opponent. The denominator is tiny.

**[0:06]** The scope-mismatch warning fades in beneath the scope label, a 300ms opacity transition from 0% to 100%. The warning text renders in `#C47A3A` (deeper amber) — slightly warmer than the scope label's `#8A8A7A`, signaling escalated attention:

```
⚠ Full-career combined coverage for GUARDIAN-A: 22%
   This cluster is 78pp stronger in this filtered view.
```

**[0:09]** Kaito pauses. The 78pp delta is enormous. He has never seen a scope-mismatch warning before. The warning text is concise but he understands: the 100% is an artifact of his narrow filter. Across all 30 career matches, GUARDIAN-A clusters at only 22% — barely above noise. He lost three specific matches to SteelThorn, and GUARDIAN-A happened to be involved in all three. That is not a structural problem — that is three bad matches.

**[0:13]** He clears the opponent filter and re-runs career analysis over his full career. The spinner runs again. The results show no multi-cluster flag. GUARDIAN-A does not appear more than once in the top 10. The cluster was entirely an artifact of the narrow filter. Kaito has learned to read the scope label.

**FADE OUT.**

### Journey 3 — The Analyst's Scenario Decomposition (Genuine Structural Find)

**FADE IN on the career analysis panel. PRIYA, a Season 6 analyst-archetype player who reviews career analysis after every 15 matches, has run a full-career analysis over 180 matches.**

**[0:00]** The candidate list renders. ARBITER-D appears in positions #2, #4, and #7. The multi-cluster flag fires:

```
⚠ ARBITER-D appears in 3 of your top 10 candidates.
  Combined coverage: 38%
  Computed over 180 matches (full career, M1-M180)
```

38% combined coverage over 180 matches. This is meaningful but not alarming. The scope label confirms: full career, all matches, no filters. Priya opens `[Compare scopes]`.

**[0:06]** The comparison panel renders. Priya has configured her career analysis to track three scenario types (via 2.28 scenario fingerprinting): Standard Patrol, Relay Flood, and Ambush Corridor.

```
Full career (180 matches):                 38%
Standard Patrol (95 matches):              12%
Relay Flood (40 matches):                  71%
Ambush Corridor (45 matches):              58%
```

**[0:10]** The bars render in sequence. Standard Patrol fills to 12% and stops — a short bar in `#2A3A2A`, barely extending past the left margin. Relay Flood fills to 71% — a long bar reaching deep amber. Ambush Corridor fills to 58%. A subtle audio cue plays when the longest bar passes the 60% mark: a faint harmonic ring (A4, triangle wave, 80ms, panned slightly right) that draws the eye to the dominant bar without being intrusive.

**[0:14]** Priya reads the decomposition. ARBITER-D's cluster is genuine — it exists in the full-career scope — but it is heavily concentrated in two scenario types. In Standard Patrol, ARBITER-D barely registers. The architecture is fine for patrol duties. But in Relay Flood and Ambush Corridor — high-stress scenarios where ARBITER-D's arbitration logic is tested under load — it fails systematically.

**[0:18]** She clicks on the "Relay Flood (40 matches)" row. The scope label on the main combined coverage display transitions smoothly (200ms crossfade) from "Computed over 180 matches (full career)" to "Computed over 40 matches (Relay Flood scenarios only, M12-M175)." The candidate list re-sorts for the Relay Flood scope. Now ARBITER-D occupies positions #1, #2, and #3. Combined coverage: 71%. No scope-mismatch warning fires — the full-career coverage (38%) is within 33pp, but the system recognizes this is a scenario filter, not an opponent filter, and applies a different threshold calculation: the mismatch warning for scenario filters fires at 25pp delta, not 15pp. At 33pp delta, the warning appears:

```
⚠ Full-career combined coverage for ARBITER-D: 38%
   This cluster is 33pp stronger in Relay Flood scenarios.
   Consider: ARBITER-D may need a scenario-specific variant.
```

**[0:24]** The scenario-specific suggestion is new to Priya. The system has identified that the cluster is neither adversarial (it spans many opponents within Relay Flood) nor fully structural (it barely appears in Standard Patrol). The correct diagnosis is **scenario-architectural**: ARBITER-D needs a Relay Flood variant, not a holistic rebuild.

**[0:28]** Priya opens the Agent Redesign Mode (4.69c) with the scope locked to Relay Flood. The scope label persists in the redesign panel header: "Redesigning for: Relay Flood (40 matches)." Every fix candidate shown in redesign mode is computed against the Relay Flood scope, not the full career. The scope label keeps Priya oriented — she is solving the Relay Flood problem, not the general problem.

**FADE OUT.**

### Journey 4 — The Tournament Preparer (Gauntlet Scope Awareness)

**FADE IN on the Gauntlet preparation screen. DESHI is preparing for a Gauntlet bracket against four known opponents. He runs career analysis filtered to Gauntlet matches only.**

**[0:00]** The career analysis completes. INTERCEPTOR-B clusters in positions #1, #3, and #5. Combined coverage: 67%.

```
Combined coverage: 67%
Computed over 28 matches (Gauntlet mode, M92-M180)
```

The scope label specifies "Gauntlet mode" — a fourth scope type beyond full career, opponent, and scenario. Gauntlet matches have distinct characteristics: opponents are generally stronger, the meta is narrower, and agents face more coordinated opposition. A cluster in Gauntlet scope may not exist in the full career.

**[0:04]** Deshi clicks `[Compare scopes]`:

```
Full career (180 matches):              31%
Gauntlet only (28 matches):             67%
Casual/Ladder only (152 matches):       26%
```

**[0:08]** The 36pp delta between Gauntlet and full career tells a clear story. INTERCEPTOR-B is fine in casual play but fails under Gauntlet pressure. This is not adversarial (Gauntlet matches span many opponents) and not scenario-specific (Gauntlet matches include all scenario types). It is a **competitive-tier problem**: INTERCEPTOR-B's design is adequate for casual play but insufficient for high-level competition.

**[0:12]** The scope-mismatch warning renders:

```
⚠ Full-career combined coverage for INTERCEPTOR-B: 31%
   This cluster is 36pp stronger in Gauntlet matches.
   INTERCEPTOR-B may need competitive-tier hardening.
```

Deshi nods. This is exactly the information he needs before the tournament. The scope label told him the 67% was a Gauntlet-specific number, and the comparison confirmed the cluster is real within that competitive context.

**FADE OUT.**

---

## Strengths and Weaknesses

### Strengths

**Prevents catastrophic misreads.** The single most dangerous moment in the career analysis flow is when a player sees "combined coverage: 84%" and decides to rebuild an agent. If that 84% was computed over 12 matches against one opponent, the rebuild is wasted. The scope label is a one-line intervention that prevents hours of misguided work.

**Zero interaction cost.** The scope label is always visible, requires no clicks, no hover, no expand. It is a passive safety net. Players who need it will read it. Players who do not need it will skim past it without friction.

**Enables the comparison workflow.** The `[Compare scopes]` mode is only meaningful if the player knows what scope they are currently viewing. Without the scope label, the comparison has no anchor — the player cannot tell which bar in the comparison corresponds to their current view.

**Completes the adversarial disambiguation chain.** The poisoning detection system (4.69e) identifies *that* an opponent is dominating a cluster. The scope label identifies *which analysis scope* produced the inflated number. Together, they form a complete adversarial defense: detection + context.

**Teaches statistical literacy.** Over time, players learn that coverage percentages are meaningless without denominators. This is a transferable analytical skill. The game is teaching the player to distrust uncontextualized statistics — a meta-skill that improves their overall analytical reasoning.

### Weaknesses

**Visual clutter on a dense panel.** The career analysis panel already shows candidate rank, element name, coverage percentage, match count, and action buttons. Adding a scope label line beneath the combined coverage increases the panel's text density. For players who run full-career analysis without filters (the majority), the scope label always reads the same thing — "full career, M145-M190" — and becomes visual noise they learn to ignore.

**The scope-mismatch warning may create false confidence.** When the warning does *not* fire (filtered coverage is within 15pp of full-career), the player may interpret this as "the filtered result is trustworthy" — when in fact a 14pp delta might still be meaningful in context. The absence of a warning is not the same as the presence of confirmation.

**Requires pre-computation of full-career baseline.** The scope-mismatch warning requires the system to always compute the full-career combined coverage as a reference, even when the player has requested a filtered analysis. This doubles the computation for filtered runs — the system computes both the filtered result and the full-career baseline. For large career histories (500+ matches), this may extend analysis time by 1-3 seconds.

**Does not solve the multi-filter problem.** A player can apply both an opponent filter and a scenario filter simultaneously — "show me RELAY-C's cluster in Relay Flood matches against NebulaFang only." The scope label would read "Computed over 4 matches (vs. NebulaFang, Relay Flood only, M170-M182)." At 4 matches, any cluster signal is statistically meaningless, but the scope label merely displays the number — it does not warn that the sample size is too small to support conclusions. A minimum-sample warning ("fewer than 10 matches — results may be unreliable") is a related but separate feature.

---

## Interaction Effects

**With 4.69b (Combined coverage display):** The scope label is physically attached to the combined coverage number. It is the denominator to 4.69b's numerator. Every display format option in 4.69b (absolute percentage, absolute + delta, bar chart) gains a scope label line. The two features are inseparable — deploying 4.69b without 4.69m means deploying a fraction without a denominator.

**With 4.69e (Adversarial poisoning):** The scope label is the passive layer of adversarial defense. The poisoning detection system (4.69e) is the active layer. A player who reads the scope label may detect adversarial inflation before the poisoning detection system flags it — "Computed over 12 matches (vs. NebulaFang)" is already suspicious to an experienced player, even without a formal adversarial concentration warning. The two systems are defense-in-depth.

**With 4.70 (Career analysis filtered by opponent archetype):** When the player filters by opponent archetype (e.g., "all aggro opponents"), the scope label reads "Computed over 32 matches (vs. Aggro archetype, M100-M190)." This is a scope type that sits between full-career and single-opponent — broader than a single opponent but narrower than the full career. The scope label must handle this gracefully, and the scope-mismatch warning threshold may need adjustment for archetype-level filters (perhaps 20pp instead of 15pp, since archetype groupings are inherently broader).

**With 2.28 (Scenario fingerprinting):** Scenario-type filtering depends on accurate scenario classification. If the scenario fingerprinting system miscategorizes a Relay Flood match as Standard Patrol, the scope label will display "Standard Patrol (96 matches)" when the true count should be 95 — a small error that could compound if the cluster analysis is sensitive to individual match inclusion. The scope label inherits the accuracy of the scenario fingerprinting system.

**With 4.69d (Multi-cluster persistence tracking):** The persistence tracker records how many consecutive career analyses have flagged a cluster. If the player alternates between full-career and filtered analyses, the persistence counter may tick inconsistently — a cluster that appears in filtered view but not in full-career view would increment the counter only on filtered runs. The scope label should be recorded alongside the persistence event, so the tracker can distinguish "clustered 3 times in full career" from "clustered 3 times in opponent-filtered view."

---

## Comparable Games / Media

**Dota 2 — Dotabuff hero performance by opponent.** Dotabuff displays win rate percentages for each hero, filterable by opposing hero. A player's 75% win rate on Invoker becomes 35% when filtered to "vs. Anti-Mage." The filter label ("vs. Anti-Mage") is always visible next to the percentage — without it, 35% would look like a general crisis. Robot Uprising's scope label serves the same function: contextualizing a filtered statistic so the player knows not to generalize it.

**League of Legends — Champion analytics by rank tier.** Sites like op.gg show champion win rates filtered by rank (Iron, Bronze, Silver, etc.). A champion with a 54% win rate in Diamond and a 47% win rate in Iron tells two different stories. The rank filter label is always displayed alongside the percentage. The scope label in Robot Uprising mirrors this: the same metric computed over different populations tells different stories, and the population label is the key to interpretation.

**Baseball — Splits statistics (vs. LHP / vs. RHP).** A batter who hits .320 against right-handed pitchers and .210 against left-handed pitchers has a meaningful split. Baseball statistics always display the split label ("vs. LHP") next to the number. Without it, ".210" looks like a struggling batter. With it, ".210 vs. LHP" looks like a platoon candidate. The scope label is Robot Uprising's equivalent of the baseball split label.

**Financial dashboards — Bloomberg Terminal time-range labels.** Bloomberg terminal charts always display the time range (1D, 1W, 1M, YTD, 5Y) as a prominent selector with the active range highlighted. A stock that is "up 8%" on the 1-day view might be "down 22%" on the YTD view. The time-range label prevents misinterpretation. Robot Uprising's scope label is the match-history equivalent of a Bloomberg time-range selector — both answer "over what period was this number computed?"

**Competitive FPS — HLTV.org filtered stats in CS2.** HLTV displays player ratings filterable by event, map, and opponent team. A player's 1.35 rating "at the Major, on Inferno, vs. Navi" tells a very different story than their 1.08 career rating. The filter tags are always visible in the stat header. Scope labels in Robot Uprising work identically — tagging the combined coverage with its filter context so the number is never read in a vacuum.

---

## Sensory Description

### Colors

The scope label renders in **`#8A8A7A`** — a muted sage-grey that reads as secondary text. It is legible but visually subordinate to the combined coverage percentage, which renders in **`#E8E4DC`** (warm off-white, primary text color). The scope label must not compete with the coverage number for attention; it is contextual metadata, not the headline.

The scope-mismatch warning renders in **`#C47A3A`** — a deeper amber than the standard multi-cluster flag color (`#D4A053`). The two ambers are related but distinct: `#D4A053` says "pay attention" and `#C47A3A` says "something is specifically wrong with the scope." The delta number within the mismatch warning ("43pp stronger") renders in **`#E4A060`** — a slightly brighter amber that draws the eye to the quantified discrepancy.

The `[Compare scopes]` button renders in **`#4A5A4A`** — a dark muted green that matches the standard action-button palette of the audit panel. On hover, it brightens to **`#5A7A5A`** with a 120ms ease-in transition. On click, it flashes to **`#7A9A7A`** for 80ms before the comparison panel renders.

The comparison bar chart uses a gradient fill per bar: left edge at **`#2A3A2A`** (dark teal-black, the panel background color) graduating to **`#D4A053`** (amber) at the bar tip. Bars that exceed 60% coverage gain a subtle glow — a 2px outer shadow in `#D4A053` at 30% opacity, pulsing slowly (2s period, sinusoidal opacity between 20% and 40%). This glow draws attention to the high-coverage scopes without being distracting.

### Animations

**Scope label entrance:** The scope label fades in 150ms after the combined coverage number finishes its count-up animation. The stagger ensures the player reads the coverage number first, then the scope context. The fade is a simple opacity transition from 0% to 100% over 200ms, ease-out.

**Scope-mismatch warning entrance:** When the warning fires, it does not simply appear. The scope label line shifts downward by one line height (16px) over 250ms (spring easing, damping 0.7, stiffness 300) to make room for the warning. The warning text then fades in from 0% to 100% over 300ms, with the amber color (`#C47A3A`) starting at 50% saturation and increasing to full saturation over the same 300ms — the warning literally "warms up" as it appears, a chromatic emphasis that signals escalation.

**Comparison panel entrance:** The panel slides up from the bottom of the audit card with spring easing (300ms, damping 0.6, stiffness 250, slight overshoot bounce of 4px at terminal position). The bar charts begin filling simultaneously 100ms after the panel reaches its final position. Each bar fills left-to-right over 500ms (ease-out), with the percentage number counting up from 0% in sync with the bar width. If a bar crosses the 60% threshold during fill, the glow effect activates at the moment of crossing — a subtle bloom that says "this is high."

**Scope transition on filter change:** When the player changes the analysis scope (e.g., clicks a scenario row in the comparison panel to re-scope), the scope label text crossfades. The old text fades to 0% opacity over 150ms while the new text fades in from 0% over 150ms, offset by 50ms — a brief 100ms overlap where both texts are partially visible at 50% opacity each, creating a smooth blend rather than a hard cut.

### Audio

**Scope label read:** No dedicated sound. The scope label is passive text — adding a sound cue to it would over-signal its importance and train the player to dread seeing it. Silence is the correct audio design for metadata that should feel normal.

**Scope-mismatch warning:** A single low-register tone — **E3 on a soft mallet percussion** (wooden marimba timbre), 200ms duration, 40% velocity. The tone is warm, not sharp. It says "notice this" without saying "danger." The marimba timbre connects to the amber color palette — both are warm, wooden, grounded. If the delta exceeds 40pp, the tone is doubled: two marimba strikes 120ms apart (E3, then G3), creating a rising interval that signals greater concern.

**Comparison panel open:** A brief mechanical unfold sound — three short clicks in ascending pitch (C5, D5, E5, each 40ms, 30% velocity, metallic click timbre), spaced 60ms apart. The sound suggests panels sliding into place, tabs being flipped, a diagnostic interface extending. It is utilitarian, not musical.

**Bar chart fill completion:** When all bars finish filling, a single soft chime — **A5 on a crystal bell**, 150ms, 25% velocity, with a gentle 400ms reverb tail. The chime signals "the data is ready to read" and marks the transition from animation to analysis. It is the same chime family used throughout the career analysis interface, maintaining sonic consistency.

**Scope transition:** A brief whoosh — a filtered white noise sweep (high-pass at 2kHz, sweep duration 200ms, 15% velocity) that accompanies the scope label crossfade. The whoosh is nearly subliminal — it registers as "something changed" without demanding conscious attention. It prevents the scope transition from feeling silent and dead (which could cause the player to miss that the scope changed at all).
