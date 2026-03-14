# Career Analysis Scope Filter UI

**Aspect:** 4.69e-i — Match-scope filter UI design: full design of the career analysis scope filter — how the player selects opponents to include/exclude, what the UI looks like, how filtered analyses are labeled and archived vs. full-scope analyses; interaction with career analysis history log.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii (known adversarial opponent tagging); 4.69e-iii (per-opponent threshold override); 4.69e-iv (counter-poisoning config design); 4.69e-v (adversarial density as season metric)
**Related:** 4.69 (agent multi-cluster detection); 4.69b (combined coverage score); 4.68 (coverage % as season health); 4.55 (cross-match adversarial aggregation); 4.57 (threat model report); 4.69k (cluster flag history)

---

## The Problem Being Solved

Career analysis aggregates data from every match in the player's career (or season) to surface structural weaknesses in their config. The output — a ranked list of fix candidates, cluster flags, coverage percentages — is only as trustworthy as the input data.

**The adversarial poisoning attack (4.69e) poisons this input.** An opponent who deliberately stresses the same 3+ elements of the player's agents across every match they share causes those elements to cluster in the player's career analysis, even if those elements aren't structurally weak. The analysis appears legitimate. The player's own diagnostic tool is turned against them.

**The scope filter is the countermeasure at the data layer.** Before running a career analysis, or retrospectively on a completed one, the player can specify *which matches to include*. Exclude the suspected poisoner's matches, and the "phantom cluster" collapses. The remaining analysis reflects only genuine structural patterns.

But scope filtering is not just a defensive tool. It's also a way to ask sharper questions:
- "What do my losses against fast-aggro opponents specifically look like?"
- "Has my config performance improved since the v4 rewrite against players in my skill tier?"
- "Is RELAY-C actually weak broadly, or only against tournament opponents?"

The scope filter transforms career analysis from a single omnibus verdict into a **configurable research instrument**.

---

## The Core Design: "The Filter Shelf"

### Visual Language

The scope filter lives as a **horizontal shelf** above the career analysis result list, collapsed by default and expanding downward when the player clicks a small toggle. When collapsed, it shows a **single pill** summarizing the active scope:

- **Full career** (no filter active): a dark neutral pill reading `All matches · 247 total`
- **Filtered**: an amber pill reading `Filtered · 89/247 matches · by opponent`

The amber color is the system's persistent signal that the analysis the player is viewing is **not full-scope**. Every filtered view is amber. This color follows the analysis into the history log, into exports, into the threat model report. There is never ambiguity about whether a cached analysis result was full-scope or filtered.

When expanded, the filter shelf occupies the top ~180px of the career analysis panel and shows three sections:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCOPE   [All matches ▼]                         [Save filter] [Run Analysis]│
│ ─────────────────────────────────────────────────────────────────────────────│
│  BY OPPONENT                        BY SCENARIO TYPE          BY CONFIG VER  │
│  ┌─────────────────────────┐        [ ] Quick assault (34)    [v1.0 - v2.9 ]│
│  │ [✓] All opponents       │        [✓] Standard (112)        [v3.0 - now  ]│
│  │ [✓] Ravenhorn ⚠️        │        [✓] Holdout (67)         [Custom range]│
│  │ [✓] Gx_Mako             │        [✓] Extraction (48)                     │
│  │ [✓] Synthetix_7         │        [ ] Elimination (22)                    │
│  │ [ ] VoidEater_Prime ☠️  │                                                │
│  │ [ ] ghost_protocol      │                                                │
│  └─────────────────────────┘                                                │
│                                                           89/247 matches     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The three filter axes** are independent and combinable:
1. **By Opponent** — include/exclude specific opponents
2. **By Scenario Type** — include/exclude match types (Quick assault, Standard, Holdout, Extraction, Elimination)
3. **By Config Version** — restrict to matches played with a specific version range of the player's config

A counter in the bottom right updates in real time as filters are toggled: `89/247 matches`. This number is the player's primary calibration signal — they can see immediately when a filter is excluding too many matches to be statistically meaningful.

---

## Opponent Selector Detail

The opponent list inside the By Opponent box shows every opponent the player has faced in their career, sorted by match count (most-played at top). Each row:

```
[✓] Ravenhorn ⚠️         12 matches   ⊕ details
[✓] Gx_Mako               8 matches   ⊕ details
[ ] VoidEater_Prime ☠️    7 matches   ⊕ details
```

**Icons on opponent names:**
- `⚠️` — the opponent is in the player's "suspect adversarial" list (soft tag — player added this manually; see 4.69e-ii for full tagging design)
- `☠️` — the opponent is in the player's "confirmed adversarial" list (hard tag — player explicitly marked after evidence)
- *(no icon)* — untagged opponent

The `⊕ details` button expands an inline sub-panel showing:
```
Ravenhorn · 12 matches · 5 wins / 7 losses
Scenario breakdown: 3 Standard, 4 Holdout, 5 Quick assault
Cluster flags in full analysis: RELAY-C appeared 3x (6.69e triggered)
Adversarial signal strength: 78% (Ravenhorn matches account for 78% of RELAY-C's coverage)
[Mark as suspect ⚠️]  [Mark as confirmed adversarial ☠️]  [View match history]
```

The **"Adversarial signal strength"** number is the key insight this sub-panel provides: it answers "how much of this cluster flag is coming from this one opponent?" If Ravenhorn accounts for 78% of RELAY-C's coverage score in the full analysis, that is strong evidence of adversarial poisoning — or at minimum, that RELAY-C is specifically weak against Ravenhorn's strategy. Either way, the player should run an analysis excluding Ravenhorn to see what the picture looks like without them.

The `[Mark as suspect]` and `[Mark as confirmed adversarial]` buttons link to the tagging system (4.69e-ii). Once tagged, the icon on the opponent row updates immediately.

---

## Saved Filters

The player can save any filter configuration by clicking `[Save filter]`. This opens a small modal:
```
Save scope filter

Name: [Excluding Ravenhorn              ]
      (auto-populated from active tags: "Excl. adversarial opponents")

□ Set as default for career analysis
□ Include in threat model report

[Cancel]  [Save]
```

Saved filters appear in a dropdown at the top of the filter shelf, labeled `[All matches ▼]`. Clicking opens:
```
All matches (full career)                    [default]
────────────────────────────────────────────
Excluding adversarial opponents              ← auto-saved when ☠️ tags exist
Excluding Ravenhorn                          ← manually saved
Quick assault only                           ← manually saved
v3.0+ configs, Standard matches             ← manually saved
────────────────────────────────────────────
[Manage saved filters...]
```

**"Excluding adversarial opponents"** is an auto-generated saved filter that updates dynamically. When the player has tagged any opponent with `⚠️` or `☠️`, this filter auto-exists and excludes all tagged opponents. It does not need to be manually created. This filter is the "paranoid mode" baseline that removes all known-suspect data before every analysis.

---

## Applying the Filter

When the player clicks `[Run Analysis]` with a non-default scope, the system runs the career analysis on the filtered match set and returns a result that is **visually distinct** from a full-scope analysis.

### Filtered Analysis Visual Treatment

The analysis result panel gets an **amber header band** replacing the normal dark header:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ● FILTERED ANALYSIS  ·  89 matches  ·  Excl. VoidEater_Prime + Ravenhorn  │
│    Full-scope analysis: 2026-03-12 → [Compare]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

The amber band contains:
- **"FILTERED ANALYSIS"** label with a bullet indicator (same amber dot used elsewhere to signal non-canonical state)
- Match count and scope summary (e.g., "Excl. VoidEater_Prime + Ravenhorn")
- A **comparison link** to the most recent full-scope analysis (clicking opens a diff view — see below)

Every metric in the filtered analysis shows a **parenthetical delta** relative to the full-scope analysis:

```
Top candidate:  RELAY-C · hook threshold · 34.2% coverage  (-18.4% from full)
Cluster flag:   ✅ No cluster detected  (was ⚠️ in full analysis)
Combined score: RELAY-C all elements: 41.2%  (-31.5% from full)
```

The `(-18.4% from full)` and `(-31.5% from full)` deltas are displayed in subdued amber text. The dramatic drops in coverage when poisoning opponents are excluded are the **"aha moment"** — the player sees with their own eyes that Ravenhorn was responsible for the phantom cluster.

---

## Comparison View (Filtered vs. Full-Scope)

Clicking `[Compare]` in the amber header opens a side-by-side diff:

```
┌──────────────────────────────┬──────────────────────────────┐
│  FULL ANALYSIS               │  FILTERED ANALYSIS           │
│  247 matches · 2026-03-12    │  89 matches · excl. 2 opp.   │
├──────────────────────────────┼──────────────────────────────┤
│  1. RELAY-C · hook thr.      │  1. STRIKER-A · scan range   │
│     52.6% coverage  ←⚠️     │     15.2% coverage           │
│                              │                              │
│  ⚠️ CLUSTER FLAG             │  ✅ No cluster detected      │
│  RELAY-C in 3 distinct slots │  (cluster absent w/o suspect  │
│                              │   opponents)                 │
├──────────────────────────────┼──────────────────────────────┤
│  Combined RELAY-C: 72.7%     │  Combined RELAY-C: 41.2%     │
│  ←  adversarial contribution │                              │
└──────────────────────────────┴──────────────────────────────┘

[Ravenhorn]  [VoidEater_Prime]  contributed 31.5% of RELAY-C's combined score.
Recommendation: Treat RELAY-C cluster as adversarial signal, not structural debt.
```

The comparison view uses **bracket annotations** (←) to flag metrics that changed substantially between full and filtered. The "Recommendation" line is system-generated: if the cluster flag disappears when removing suspected adversarial opponents, the system suggests treating it as adversarial rather than structural.

---

## History Log Interaction

Every career analysis run, whether full-scope or filtered, is archived in the **career analysis history log**. The log is a reverse-chronological list accessible from the Season Health dashboard.

Each entry in the log:

```
2026-03-14 · Full analysis · 247 matches                    CLUSTER FLAG ⚠️
  Top: RELAY-C (52.6%) · Season health: 52.6% (critical)

2026-03-14 · Filtered analysis · 89 matches ·  excl. Ravenhorn + VoidEater   [AMBER]
  Top: STRIKER-A (15.2%) · Season health: 15.2% (healthy) · [Compare to full →]

2026-03-11 · Full analysis · 231 matches
  Top: RELAY-C (48.1%) · Season health: 48.1% (critical)

2026-03-09 · Filtered analysis · 88 matches · Excl. Ravenhorn + VoidEater    [AMBER]
  Top: STRIKER-A (14.3%) · Season health: 14.3% (healthy)
```

**Visual treatment in the log:**
- Full-scope analyses: dark background, white text, no badge
- Filtered analyses: amber left-border stripe, badge reading `[AMBER]`, scope summary in secondary text
- Cluster flags: orange `⚠️` icon in the entry, visible in both full and filtered entries

**The chronological pattern tells a story.** The player can see that for the last 4 runs, their full-scope analysis screams RELAY-C cluster (critical) while their filtered analysis (excluding the same two suspects) consistently shows healthy season health with a completely different top candidate. This **pattern of divergence** is strong evidence of sustained adversarial poisoning — the player's config is structurally fine; two opponents have been gaming the analysis.

### Log Filters

The history log has its own filter row allowing the player to show:
- All analyses (default)
- Full-scope only
- Filtered only
- Analyses with cluster flags
- Analyses with a specific top candidate (e.g., "Show only analyses where RELAY-C appeared")

This last option — filtering the history by candidate — lets the player trace RELAY-C's career history across all analyses, seeing when it first appeared, how its coverage percentage has trended, and which analyses were full-scope vs. filtered. This is the **longitudinal view of a single element's diagnostic career**.

---

## Player Journeys

### Journey: Vesper, 24, Competitive Ladder Player, Intermediate

**Context:** Vesper has been grinding the ranked ladder for three weeks. Their career analysis keeps showing RELAY-C as a critical cluster with 60%+ combined coverage — it's been at the top for four consecutive seasons. They've rebuilt RELAY-C twice, each time seeing initial improvement followed by the cluster returning. They're starting to wonder if they're fundamentally misunderstanding something.

**Minute 0:00 — Opening the Career Analysis Panel**
Vesper opens the debrief after a loss. The career analysis is already open to the cached result — it shows the familiar amber cluster warning on RELAY-C. They've seen it so many times they almost don't read it anymore. But this time they notice something: in the match replay, their opponent (VoidEater_Prime) ran what looked like a deliberate multi-vector stress pattern against RELAY-C specifically — different angles, same target.
[Vesper pauses. Clicks the filter shelf toggle for the first time.]

**Minute 0:30 — Discovering the Filter Shelf**
The filter shelf expands downward. Vesper sees the By Opponent section with all opponents checked. They count: 11 opponents. VoidEater_Prime has 8 matches — second highest after some lower-skill player they've played 14 times. Vesper clicks `⊕ details` on VoidEater_Prime.
The sub-panel opens: 8 matches, 2 wins / 6 losses, cluster contribution: **VoidEater_Prime accounts for 61% of RELAY-C's combined coverage score.**
[Vesper's eyes widen. 61% from one opponent?]

**Minute 1:00 — Testing the Hypothesis**
Vesper unchecks VoidEater_Prime in the opponent list. The match counter drops: `247 → 183 matches`. They click `[Run Analysis]`. The panel flickers with a loading shimmer — about 1.5 seconds — then re-renders with an amber header band: "FILTERED ANALYSIS · 183 matches · Excl. VoidEater_Prime."
The cluster flag is gone. RELAY-C is still second on the list but at 18% coverage — concerning but not critical. STRIKER-A is now top candidate at 22%.
[A complicated feeling: vindication mixed with being a little played. They've spent two rebuilds chasing a phantom.]

**Minute 1:45 — Tagging and Saving**
Vesper clicks `⊕ details` on VoidEater_Prime again and clicks `[Mark as confirmed adversarial ☠️]`. A small confirmation toast appears: "VoidEater_Prime marked as adversarial. Future career analyses will show adversarial signal strength for this opponent." The opponent's row now shows the ☠️ icon.
Vesper notices the saved filter dropdown now auto-includes "Excluding adversarial opponents." They set it as default.
[From now on, every career analysis Vesper runs will default to excluding the poisoner. The phantom cluster is gone.]

**Minute 2:30 — Looking at the History**
Vesper opens the career analysis history log. They see 12 entries — 8 full-scope (all showing critical RELAY-C cluster, all amber-flagged in retrospect since VoidEater_Prime is now tagged), 4 filtered entries they never ran before (showing healthy season health from the rare times they experimented). The pattern is stark: every full-scope analysis has been poisoned; the few filtered analyses they ran on instinct were accurate.
[Vesper screenshots the log pattern and posts it to the community Discord: "Does anyone else think VoidEater_Prime is systematically poisoning career analysis?"]

**UI Annotations:**
- Filter shelf toggle: small chevron button at top-right of career analysis panel, right of the amber/dark scope pill. Clicking toggles the shelf open/closed with a smooth 200ms slide-down.
- Match counter: right-aligned in the filter shelf footer, updates in real time (no run required) as checkboxes are toggled.
- Adversarial signal strength: appears only in the expanded `⊕ details` sub-panel, displayed as a bold percentage with a bar visualization (e.g., a short amber bar proportional to %).
- Loading shimmer: the result list items animate with a left-to-right shimmer gradient while the filtered analysis computes. Duration: ~1.5 seconds for full career, ~0.5s for very filtered sets.
- Amber header band: fixed-height bar (36px) at the very top of the result list, amber background (#D97706), white text, persists even when scrolling the result list below.

---

### Journey: Korbin, 37, Mechanical Engineer, Factorio Veteran, PvE-First

**Context:** Korbin doesn't play the ladder. They use career analysis to understand their own config quality — specifically whether their seasonal architecture improvements are real or cosmetic. They've started segmenting career analysis by scenario type (Quick assault vs. Holdout vs. Extraction) because they suspect their config performs differently across modes.

**Minute 0:00 — Scenario-Type Filter Discovery**
Korbin opens career analysis after completing a month's worth of PvE campaign missions. Their usual analysis shows STRIKER-A as top candidate at 31% coverage across all scenario types. But they've had a feeling for weeks that Quick assault is the specific failure mode — they lose STRIKER-A to buffer overflow almost exclusively in high-tempo scenarios.
[Korbin expands the filter shelf, heads straight to "By Scenario Type." Four scenario types are available.]

**Minute 0:20 — Scenario-Type Filtering**
Korbin unchecks Standard, Holdout, and Extraction, leaving only Quick assault. Match counter: `247 → 58 matches`. They run the analysis. The filtered result shows STRIKER-A at **67% coverage in Quick assault only** — catastrophically concentrated. The same element that was at 31% in the full analysis is at 67% in this scenario type.
[The intuition was right. And the implication is clear: STRIKER-A's buffer configuration is specifically tuned for the longer signal cadences of Standard and Holdout. In Quick assault's burst-tempo environment, something is consistently overflowing.]

**Minute 0:50 — Cross-Scenario Comparison**
Korbin saves the Quick assault filter and then runs analyses for the other three types in turn. They screenshot each result and line them up:
- Quick assault: STRIKER-A 67%
- Holdout: RELAY-C 24%
- Extraction: SCOUT-B 18%
- Standard: SCOUT-B 15%

The config has **scenario-specific failure modes**, not one universal weakness. Full-scope analysis averaged these together and surfaced STRIKER-A at 31% — real, but obscuring that the underlying issue is tempo-specific, not structural. Korbin labels this in their notes as "The Averaging Trap."

**Minute 1:30 — Saving a Multi-Filter**
Korbin creates a saved filter: "Quick assault + Quick assault variants." Sets it to appear in the threat model report. Then creates "Holdout + Extraction" as a second saved filter — "combined slow-tempo modes." From now on their career analysis routine starts with three runs: full-scope (for long-arc tracking), quick-assault-only (the critical failure mode), and slow-tempo (the rest).
[Three runs takes maybe 10 seconds total. The segmented view of the config's actual health profile is 10x more actionable than the single omnibus result was.]

**UI Annotations:**
- Scenario type checkboxes: each labeled with the scenario name and match count in parentheses. Counts update in real time as opponent filters are also applied (cross-axis dependency).
- Saved filter name auto-populate: when scenario-type is the only active filter, the name field auto-fills "Quick assault only" or equivalent. Player can override.
- Screenshot annotation: the filtered analysis panel has a small `[Export]` button in the amber header that saves a PNG of the panel with scope, top candidates, and cluster status included. Designed for Discord sharing.

---

### Journey: Simone, 19, First Competitive Season, Learning the Meta

**Context:** Simone just started their first competitive season. They've heard about career analysis from community guides but have never used the filter shelf. They've seen the amber "FILTERED ANALYSIS" label in community screenshots and assumed it was for advanced players only.

**Minute 0:00 — First Career Analysis**
Simone opens career analysis for the first time. It shows a result with no cluster flags (they haven't played enough matches for the poisoning meta to matter yet). The filter shelf toggle is visible but they ignore it.
[Career analysis at this stage is working correctly for Simone — full-scope, no filter needed, the top candidate is a genuine structural weakness.]

**Minute 2:00 — Noticing the Amber Pill**
Three weeks later: Simone has played 60 matches. They open career analysis and notice the scope pill reads `All matches · 60 total` — but they remember a community screenshot showing an amber pill. Out of curiosity, they expand the filter shelf.
[The filter shelf is there, empty of saved filters, with a list of 14 opponents they've faced. It looks like a checklist. Simone doesn't know what to do with it yet but doesn't feel intimidated — it's just checkboxes.]

**Minute 2:30 — Passive Learning Through Tooltips**
Simone hovers over the `⊕ details` button on their most-played opponent (played 9 times). The tooltip reads: "See this opponent's contribution to your career analysis results — useful if you suspect they're specifically targeting one of your agents."
Simone clicks it. The sub-panel opens. "Adversarial signal strength: 12%." A tooltip on that number reads: "Less than 30% — this opponent is not a significant driver of any single element's coverage score. Your analysis is likely accurate."
[Simone closes the sub-panel and goes back to acting on the genuine fix candidate. The filter shelf taught them something by being there even when not needed: it introduced the concept of adversarial contribution without demanding they understand it first.]

**Minute 10:00 — Two Seasons Later (Mental Model Complete)**
Simone is now in their third competitive season. They've had their first experience of a player systematically stressing the same element across 6 matches. The cluster flag fires. Simone remembers the `⊕ details` button, opens it, sees 74% adversarial signal strength on that opponent. They know exactly what to do.
[The gradual on-ramp — filter shelf was always visible, tooltip introduced concepts passively, the adversarial signal strength number was interpretable without prior knowledge — means Simone never needed a tutorial for this feature. It was ready when they were ready.]

**UI Annotations:**
- Tooltip on `⊕ details`: appears on hover after 400ms delay. Text written to explain the mechanic to someone encountering it cold.
- Adversarial signal strength tooltip: uses traffic-light framing: "Less than 30% — likely not adversarial," "30-60% — worth investigating," "Above 60% — high probability of adversarial targeting." The thresholds are configurable (linked to 4.69a/4.69e-iii).
- Filter shelf on first visit: a single help line at the bottom of the shelf: "Filters let you run analysis on a subset of your matches — useful when one opponent may be targeting a specific part of your config." Auto-dismisses after 5 seconds, never shown again.

---

## Strengths and Weaknesses

### Strengths

**Separation of structural and adversarial signals.** The filter shelf's core value is making visible what full-scope analysis hides: which of the player's "weaknesses" are real vs. manufactured by opponent strategy. This transforms career analysis from a passive read-out into an active investigation tool.

**Non-destructive.** Full-scope analysis is never overwritten. The history log preserves every run. Filtered analyses are additive — they provide a second opinion, not a replacement. Players who don't need the feature can ignore it entirely.

**Graceful discovery curve.** The filter shelf is visible from the start but not prominent. The amber pill on filtered analyses is the key discovery hook — players see it in community screenshots before they need it, and when they finally expand the shelf, the checkboxes are immediately legible without a tutorial.

**Multi-axis filtering enables deep analysis.** The combination of opponent filtering + scenario type filtering + config version filtering can answer questions no single-axis filter could, e.g., "Has my config improved against fast-aggro opponents specifically since v3.0?"

### Weaknesses

**Sample size fragility.** Heavily filtered analyses (e.g., "Quick assault only against three opponents") may have too few matches to be statistically meaningful. The match counter mitigates this somewhat but doesn't prevent a player from running analysis on 8 matches and over-fitting to noise. A warning threshold (e.g., "Analysis below 30 matches may not be reliable") is needed.

**Tagging creates responsibility.** Once the player tags opponents as adversarial and excludes them by default, they may develop a false security — treating every cluster that disappears under the exclusion filter as adversarial, when it might reflect a genuine but hidden structural weakness that Ravenhorn is merely the first to have discovered.

**History log becomes unwieldy with multiple saved filters.** A player who runs career analysis with 6 different saved filters after each season session will accumulate dozens of entries quickly. The log needs intelligent grouping (by session? by config version?) to stay navigable.

**Opponent list scaling.** Long-term players who have faced 50+ distinct opponents need the opponent list to have search/sort functionality, not just a static scrollable list.

---

## Interaction Effects

**4.69e-ii (Known adversarial opponent tagging):** The filter shelf provides the *surface* for tagging (the `[Mark as suspect]` / `[Mark as confirmed adversarial]` buttons in the `⊕ details` sub-panel), but the tagging system's persistence, visual treatment, and behavioral changes when a tag is applied are defined separately. The two aspects are tightly coupled: the filter shelf is where tagging is initiated; the tagging system defines what the tags *mean*.

**4.69e-iii (Per-opponent threshold override):** While the filter shelf's approach is binary (include or exclude an opponent), the threshold override approach adjusts *how much* each opponent contributes without fully excluding them. The two mechanisms are complementary: exclude when confident of poisoning, threshold-adjust when uncertain.

**4.69k (Cluster flag history in career analysis log):** The history log in this design tracks which analyses had cluster flags and whether they were full-scope or filtered. Aspect 4.69k adds a deeper layer: tracking when each cluster flag fired, what threshold was active, and the player's response. The history log in this design is the substrate on which 4.69k's richer tracking is layered.

**4.68 (Coverage % as season health):** The season health metric is computed from full-scope career analysis by default. The filter shelf design must specify whether season health is recomputed for filtered analyses (yes, shown in the filtered result but in amber, not updating the season health dashboard's primary metric), and whether filtered analyses are included in the coverage trend graph (displayed as lighter, differentiated points).

**4.57 (Threat model report):** Filtered analyses that are saved with the "Include in threat model report" flag contribute a section to the report showing scope-specific vulnerability profiles. The report can include a matrix: full-scope vs. each saved filter, with coverage percentages for the top candidate in each scope.

**4.55 (Cross-match adversarial aggregation):** The adversarial signal strength number shown in the `⊕ details` sub-panel is a single-opponent view. Aspect 4.55 covers the cross-opponent version: finding attack vectors that multiple opponents independently discovered. The filter shelf complements this by letting the player exclude a subset of suspected opponents and seeing if a common vulnerability remains — if the cluster persists even after excluding two suspected poisoners, it may be structural.

**4.69m (Match-set scope label on combined coverage):** This aspect is essentially the label spec for what this design calls the amber pill and amber header band. The scope must be legible everywhere a filtered analysis result appears — the filter shelf design is the design of where and how this labeling originates.

---

## Comparable Systems

**Grafana / data observability dashboards**: The filter shelf's multi-axis filtering with real-time match count updates is essentially a dashboard filtering paradigm. Grafana's variable filters — dropdowns that constrain which time series are visualized, with a "X results" counter — are the direct analogue. The "amber when filtered" convention borrows from Grafana's convention of marking "non-default" dashboard states with visual differentiation.

**Chess.com "Opening Explorer" scope filter**: Chess.com lets players filter their game history by time control, color, date range, and opponent rating before running opening analysis. The scope filter here is the same paradigm: restrict the corpus, run analysis, see how the results differ. Chess.com shows a "based on X games" label on all filtered analysis outputs — the same "match count as reliability signal" pattern.

**Slay the Spire run history filter**: Slay the Spire's stats screen lets players filter their run history by character, ascension level, and outcome before computing win rates. The filtered stats are clearly labeled with the filter criteria. The "you are looking at a subset" pattern is identical.

**Halo's "Service Record" era match filters**: Bungie's Halo 3 and Reach service records allowed filtering by gametype, map, and playlist before computing K/D ratios. The same insight applied — your K/D in Team Slayer vs. Big Team Battle are genuinely different configurations being analyzed, not one blurry average.

---

## Sensory Description

The filter shelf expands with a **smooth drawer animation** — 200ms ease-out, the content sliding down from behind the scope pill. When it opens, there's a faint **mechanical click sound**: the sound of a panel unlocking, low and crisp, like the click of a physical switch.

The amber pill glows faintly — a very subtle pulsing breathing animation at 30% opacity, 2-second cycle, suggesting "this isn't the default state, pay attention." Not alarming, not constant — just present enough to be noticed when looking for it.

Checking or unchecking an opponent's checkbox produces a **tiny satisfying tick** — like a mechanical keyboard switch, very short, higher-pitched than the panel click. The match counter updates with a brief **number roll animation** (200ms, counting up or down through intermediate values), giving the sense that the system is recalculating — that these checkboxes are connected to something real.

When `[Run Analysis]` is clicked, the result list items **fade out simultaneously**, then shimmer from left to right (a loading bar that runs across each item), then **fade back in** with the new results. The transition takes about 1.5 seconds for a full career, making clear that something was computed, not just a filter applied to pre-existing data.

The **amber header band** appears at the top of the result list with a brief **flash** — the band slides in from the top, then settles. It's warm amber (#D97706) with white text, sitting atop the dark result list. The contrast is high enough to be readable but the warm color doesn't feel alarming — amber is "caution," not "danger."

The TikTok clip: player shows their career analysis showing a giant RELAY-C cluster warning, opens the filter shelf, unchecks one opponent, runs analysis — the cluster warning vanishes and the top candidate is entirely different at 15% coverage. The voiceover: "Wait. One opponent was causing this entire warning. My config was fine all along." The visual contrast between the full-scope cluster alarm and the filtered healthy state is the 15-second hook.

---

## Newly Discovered Aspects

These sub-questions emerged from designing the scope filter in detail:

- **4.69e-i-a — Sample size warning threshold**: what is the minimum match count for a filtered analysis to be considered reliable, and how should the UI communicate when a filtered set is too small? Exact UI: warning banner, disabled "Run Analysis" button, or advisory text only?
- **4.69e-i-b — Opponent list sorting and search**: when a player has faced 50+ opponents, how does the By Opponent list scale? Sort by match count, alphabetical, by adversarial signal strength, by most recent match? Search box? Grouping (tagged adversarial at top)?
- **4.69e-i-c — Filtered analysis in the season health dashboard**: the season health trend graph (4.68) plots coverage % over time. Should filtered analysis runs appear on this graph as differentiated data points? Lighter color, different shape, optional toggle to show/hide?
- **4.69e-i-d — "Why is this filtered?" disambiguation in exports**: when a filtered analysis PNG is shared to Discord or a threat model report, does the scope summary include enough information for a reader who didn't run the filter themselves to understand what they're looking at?
- **4.69e-i-e — Auto-filter suggestion engine**: if the system detects high adversarial signal strength (>50%) from any single opponent, should it proactively suggest: "Run a filtered analysis excluding Ravenhorn to see your actual structural health"? And what does this suggestion look like — a banner, a tooltip, an interstitial?
