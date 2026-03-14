# Compound Adversarial Detection

**Aspect:** 4.69e-iii-a — Compound adversarial detection: automatic detection of cases where no single opponent dominates but 2–3 opponents together create a false cluster signal; pairwise and N-wise opponent removal checks; UI for displaying compound adversarial patterns and applying group caps.

**Parent:** 4.69e-iii — Per-opponent threshold override
**Siblings:** 4.69e-iii-b — Cap threshold calibration wizard; 4.69e-iii-c — Cap vs. tag migration path; 4.69e-iii-d — Per-opponent-per-agent threshold matrix; 4.69e-iii-e — Cap effectiveness tracking over time
**Related:** 4.69e — Adversarial multi-cluster poisoning; 4.69e-ii — Known adversarial opponent tagging; 4.69e-iv — Counter-poisoning config design; 4.69e-vi — Concentration threshold calibration for dense opponent pools; 4.69a — Multi-cluster threshold configurability; 4.69j — Per-agent threshold override

---

## The Core Design Problem

The adversarial tagging system (4.69e-ii) and the per-opponent concentration cap (4.69e-iii) both operate on a **single-opponent assumption**: one opponent dominates a cluster's coverage, and the player identifies and suppresses that opponent. The match-source breakdown reveals NebulaFang at 78% of RELAY-C's cluster — the adversarial signal is loud and obvious. Tag or cap NebulaFang, and the noise vanishes.

But what happens when the adversarial signal is distributed?

**The Compound Attack Scenario:** The player's RELAY-C clusters in career analysis with 3 elements and 58% combined coverage. The match-source breakdown shows:

```
RELAY-C cluster — Match-Source Breakdown
vs. GhostFrame     ████████████░░░░░░░░  32%
vs. StratusLayer   ██████████░░░░░░░░░░  28%
vs. VoidKnot       ██████░░░░░░░░░░░░░░  22%
vs. Others (9)     ████░░░░░░░░░░░░░░░░  18%
```

No single opponent exceeds the ⚡ Cap threshold. GhostFrame at 32% is elevated but not alarming — they played 20% of the player's matches, so a 32% concentration is within the 1.5× auto-cap tolerance. StratusLayer at 28% is similarly unremarkable. VoidKnot at 22% is barely above their match frequency.

**But GhostFrame, StratusLayer, and VoidKnot are all members of the same competitive team.** They share strategy. They all run configs designed to stress RELAY-C's context buffer, fallback filter, and priority queue from different angles. No single player's contribution triggers the adversarial detection — but their combined contribution is 82% of the cluster's coverage, driven by 42% of the player's total matches.

The player who only has single-opponent tools will never see this. They'll spend three seasons rebuilding RELAY-C, never understanding why the cluster keeps recurring. The individual bars look proportional. The adversarial signal is invisible when examined one opponent at a time.

**This is the compound adversarial detection problem:** identifying cases where a *group* of opponents collectively drives a cluster signal that no individual member would trigger alone. It's the coalition attack — harder to detect, harder to attribute, and structurally different from single-attacker poisoning.

---

## The Detection Mechanics

### Pairwise Removal Check

The simplest form of compound detection: for every pair of opponents in a cluster's match-source breakdown, compute what happens to the cluster if both are removed simultaneously.

**The algorithm:**
1. Career analysis fires the cluster flag for RELAY-C (3 elements, N≥3 threshold met)
2. For each opponent pair (A, B) where combined match-source concentration ≥ 40%:
   - Remove all matches from A and B
   - Recompute the cluster candidates for the remaining match set
   - If the cluster flag no longer fires → flag the pair as a **compound adversarial candidate**
3. Record which pairs, when removed, dissolve the cluster

**The combinatorial cost:** With O opponents in the breakdown, the pairwise check runs O×(O-1)/2 re-computations. For a typical career analysis with 8–12 distinct opponents, that's 28–66 pairs. Each re-computation filters a subset of matches and re-ranks candidates — computationally comparable to a single career analysis. This is expensive but feasible as a **triggered check** (only runs when a cluster fires), not a routine computation.

**The threshold gate:** The pairwise check only runs for pairs whose combined concentration exceeds a minimum — say, 40%. This prunes the space dramatically: if the top opponent is at 32% and the second is at 28%, they pass. If two opponents at 8% each are tested, they're skipped. The threshold prevents testing irrelevant pairs and focuses computation on plausible coalitions.

### N-wise Extension

For teams of 3 or more coordinated opponents, pairwise removal is insufficient. GhostFrame + StratusLayer might not dissolve the cluster by themselves (VoidKnot's 22% still contributes enough), but all three together do.

**The algorithm:** After pairwise checks, if no pair dissolves the cluster, extend to triples — but only for opponents already identified in high-concentration pairs. If GhostFrame (32%) + StratusLayer (28%) was tested and reduced the cluster but didn't dissolve it, add VoidKnot (22%) — the next-highest-concentration opponent — and test the triple.

**The search strategy is greedy-descending:** Start with the two highest-concentration opponents. If removal doesn't dissolve the cluster, add the third-highest. Continue until either:
- The cluster dissolves → compound adversarial group found
- The combined concentration of the removed group exceeds 85% of the cluster → not meaningfully adversarial (removing almost everyone's matches would dissolve any cluster)
- The group reaches 4 opponents → stop (beyond 4, "coordinated adversarial group" is indistinguishable from "the meta just counters your agent")

**The 85% ceiling is crucial.** A compound detection that flags "if you remove 90% of your matches, the cluster disappears" is not useful — of course it does. The detection is only meaningful when a *minority* of opponents (by match count) produces a *majority* of the cluster signal.

### The Compound Adversarial Score

Each detected compound group gets a score that expresses how disproportionate their impact is:

```
Compound Score = (group's cluster coverage %) / (group's match share %)
```

For GhostFrame (32%, 20% match share) + StratusLayer (28%, 14% match share) + VoidKnot (22%, 8% match share):
- Group cluster coverage: 82%
- Group match share: 42%
- Compound score: 82/42 = **1.95×**

A compound score of 1.95× means the group's diagnostic impact is nearly double their match frequency. Compared to the auto-cap's single-opponent tolerance of 1.5×, this group is well into the "disproportionate" range — but no individual member crossed the 1.5× line.

**Score interpretation:**
- 1.0× = proportional (group contributes exactly their match share)
- 1.5× = elevated (the auto-cap's single-opponent threshold)
- 2.0× = strongly disproportionate
- 3.0×+ = almost certainly coordinated targeting

---

## Option A: The Coalition Warning — Passive Detection with Visual Alert

### How It Works

The system performs the compound detection automatically whenever a cluster fires, and surfaces the result as a **Coalition Warning** in the match-source breakdown — a new section below the individual opponent bars.

**The UI:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RELAY-C cluster — Match-Source Breakdown                                   │
│                                                                             │
│  vs. GhostFrame     ████████████░░░░░░░░  32%                              │
│  vs. StratusLayer   ██████████░░░░░░░░░░  28%                              │
│  vs. VoidKnot       ██████░░░░░░░░░░░░░░  22%                              │
│  vs. Others (9)     ████░░░░░░░░░░░░░░░░  18%                              │
│                                                                             │
│  ┌─ ⚡⚡ COALITION WARNING ─────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  Removing GhostFrame + StratusLayer + VoidKnot dissolves this        │   │
│  │  cluster entirely.                                                   │   │
│  │                                                                      │   │
│  │  Combined coverage:  82%  ████████████████░░░░                       │   │
│  │  Combined match %:   42%  ████████░░░░░░░░░░░░                       │   │
│  │  Compound score:     1.95× (disproportionate)                        │   │
│  │                                                                      │   │
│  │  Without these 3 opponents:                                          │   │
│  │    RELAY-C cluster: 0 elements. Flag does not fire. ✓                │   │
│  │                                                                      │   │
│  │  This may be coordinated targeting rather than a structural flaw.    │   │
│  │                                                                      │   │
│  │                       [Dismiss]   [Apply Group Cap ⚡⚡]             │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The double-lightning icon (⚡⚡)** distinguishes compound detection from single-opponent caps (⚡). The Coalition Warning box has a distinctive border — not the single solid line of normal UI panels but a **double-line border** in amber, pulsing very gently (one slow breathe cycle every 4 seconds). The amber color is midway between the crimson of the ⚑ Exclude tag and the electric yellow of the ⚡ Cap — a warning, not an alarm.

**The dual bar comparison** is the key affordance: "Combined coverage: 82%" on a long bar, directly above "Combined match %: 42%" on a shorter bar. The visual disparity between these two bars is the entire argument. When the coverage bar is nearly twice the match bar, the player can *see* disproportionality without doing any math. The compound score (1.95×) is the numerical version of the same insight, shown to the right.

### The Group Cap

Clicking "Apply Group Cap ⚡⚡" opens a **group cap configuration** panel:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  GROUP CAP: GhostFrame + StratusLayer + VoidKnot                           │
│                                                                             │
│  Treatment mode:                                                            │
│  ● Combined cap — suppress when group's COMBINED concentration exceeds:    │
│    [====●=====] 60%                                                         │
│                                                                             │
│  ○ Individual caps — apply separate ⚡ caps to each opponent               │
│    (GhostFrame: 48%, StratusLayer: 42%, VoidKnot: 33%)                    │
│    ↑ auto-computed at 1.5× each opponent's match share                    │
│                                                                             │
│  Preview with combined cap at 60%:                                          │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  RELAY-C cluster:                                                  │     │
│  │    Group combined concentration: 82% → SUPPRESSED (above 60%)     │     │
│  │    Remaining coverage: 18%. Cluster flag DOES NOT FIRE. ✓          │     │
│  │                                                                    │     │
│  │  SCOUT-A cluster:                                                  │     │
│  │    Group combined concentration: 31% → INCLUDED (below 60%)       │     │
│  │    Cluster flag does not fire regardless. ✓                        │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│                              [Cancel]   [Apply Group Cap ⚡⚡]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Two modes:**
1. **Combined cap** — treats the group as a single entity. If their combined cluster concentration exceeds the threshold, suppress all three opponents' matches for that cluster. Simple, but coarse: if one group member is genuinely exposing a structural weakness while the other two are poisoning, the combined cap hides everything.
2. **Individual caps** — applies separate ⚡ caps to each opponent, auto-computed at 1.5× their individual match share. More surgical: each opponent is evaluated independently. But this is just the existing cap system applied three times — it doesn't capture the compound effect.

The combined cap is the novel instrument. The individual caps are the fallback for players who want finer control.

### Persistence

```
compound_groups: [
  {
    members: ["GhostFrame", "StratusLayer", "VoidKnot"],
    treatment: "combined_cap",
    cap_threshold: 60,
    detected_at: "Season 6, Analysis #2",
    compound_score_at_detection: 1.95,
    affected_clusters: ["RELAY-C"]
  }
]
```

The group persists as a unit. If VoidKnot stops appearing in the match schedule, the compound detection will stop triggering for the triple — but the group definition persists, and if VoidKnot reappears, the cap reactivates automatically. The player can manually add or remove members from a group.

---

## Option B: The Concentration Heatmap — Visual Discovery Tool

### How It Works

Instead of the system detecting compound patterns and alerting the player, this option gives the player a **visual tool** to discover compound patterns themselves.

**The heatmap:** A matrix view accessible from the cluster detail panel. Rows are opponents. Columns are cluster elements (the individual elements of the flagged cluster). Each cell is colored by that opponent's contribution to that element's coverage. A small cluster with 3 elements and 6 opponents produces an 6×3 heatmap.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RELAY-C cluster — Opponent × Element Heatmap                               │
│                                                                             │
│                       │ buffer_size  │ fallback_filter │ priority_queue │   │
│  ─────────────────────┼──────────────┼─────────────────┼────────────────│   │
│  GhostFrame           │  ████ 38%    │  ████ 29%       │  ██ 12%        │   │
│  StratusLayer         │  ██ 18%      │  ████ 34%       │  ████ 40%      │   │
│  VoidKnot             │  ████ 30%    │  ██ 15%         │  ████ 26%      │   │
│  CrystalNet           │  █ 8%        │  █ 10%          │  ██ 14%        │   │
│  Others (8)           │  █ 6%        │  ██ 12%         │  █ 8%          │   │
│  ─────────────────────┼──────────────┼─────────────────┼────────────────│   │
│  Column total         │  100%        │  100%           │  100%          │   │
│                                                                             │
│  Color scale: □ 0%  ░ 10%  ▒ 20%  ▓ 30%  █ 40%+                          │
│                                                                             │
│  Row selection: [✓] GhostFrame  [✓] StratusLayer  [✓] VoidKnot            │
│  Selected group: 86% / 78% / 78% coverage across columns                  │
│  Combined match share: 42%     Compound score: 1.93×                       │
│                                                                             │
│                         [Clear Selection]   [Apply Group Cap ⚡⚡]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The discovery experience:** The player opens the heatmap and sees a wall of cells. But the coloring makes patterns pop: if three rows are consistently warm (amber-to-red) across all columns while the remaining rows are cool (blue-to-gray), the compound pattern is visually obvious — a warm band of 3 rows against a cool field. The player clicks to select those three rows, and the summary line at the bottom computes the compound score.

**The color scale:** Cool-to-warm gradient. Blue at 0%, white/gray at the expected-proportional level (match share %), amber above expected, red at 2× expected or higher. This means a row that's entirely "proportional" would appear in neutral gray — unremarkable. Rows above expected glow warm. Rows far above glow hot. The compound adversarial pattern manifests as a warm band that's visually distinct from the cool field.

### The Checkbox Selection Model

The player selects opponents by clicking rows or using checkboxes. As they select, the bottom summary updates in real time:

- **1 opponent selected:** Shows individual concentration per column. This is the existing single-opponent view.
- **2 opponents selected:** Shows combined concentration per column. If either column exceeds the compound threshold, the summary line turns amber.
- **3+ opponents selected:** Shows combined concentration. If the compound score exceeds 1.5×, the "Apply Group Cap" button illuminates.

This incremental selection teaches the compound concept: the player watches the compound score grow as they add opponents to the selection. "GhostFrame alone is 1.6× — high but not alarming. Adding StratusLayer makes it 1.8×. Adding VoidKnot... 1.95×. These three together are nearly double their match frequency."

### Sensory Description

**Opening the heatmap:** The cluster detail panel splits — the left half compresses to show the existing text summary, and the right half expands with the heatmap sliding in from the right edge, cells populating column by column with a staggered 50ms delay (left column first, then middle, then right). Each cell fades from transparent to its final color over 200ms. The effect is a wave of color washing across the matrix.

**The warm band:** When three opponents are consistently above-expected, their rows glow amber-red against the cool blue-gray of the other rows. The warm band has a subtle inner glow — a 2px diffuse shadow in orange inside each warm cell, creating a "heat shimmer" effect that makes the pattern almost physically warm to look at. The remaining rows feel cold by contrast — thin borders, muted fills, no glow.

**Selecting a row:** Clicking a row adds a thin electric-yellow border around the entire row — the same ⚡ yellow used for concentration caps. The row "lifts" slightly with a 1px drop shadow, as if it's being pulled out of the matrix for inspection. The compound score at the bottom updates with a number-flip animation (the digits roll like a mechanical counter), and if the score crosses the 1.5× threshold, the "Apply Group Cap" button transitions from gray to pulsing amber over 400ms.

**The compound score crossing 1.5×:** A soft *chime* — two ascending notes (C5 → E5), crystalline and clear, distinct from the single-opponent cap's *click*. The compound score number transitions from white text to amber text. The dual-bar comparison (coverage vs. match share) animates — the coverage bar extends while the match-share bar stays put, making the gap between them stretch visually.

---

## Option C: The Automatic Coalition Scanner — Proactive Background Detection

### How It Works

The compound detection runs automatically as part of every career analysis, not just when the player inspects a specific cluster. A **Coalition Scanner** pass runs after the primary cluster detection, checking all flagged clusters for compound patterns.

**The process:**
1. Career analysis fires, detecting clusters as normal
2. For each flagged cluster, the coalition scanner runs pairwise and N-wise checks
3. Any detected compound groups are tagged in the results
4. The career analysis summary includes a new line: "1 coalition pattern detected"

**The notification:** In the career analysis results header, alongside the existing cluster count:

```
Career Analysis — Season 6, Analysis #2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3 agent clusters detected
1 coalition pattern detected ⚡⚡          ← NEW
2 persistent offenders

▼ RELAY-C cluster (3 elements, 58% coverage)
  ⚡⚡ Coalition: GhostFrame + StratusLayer + VoidKnot
       Compound score: 1.95× — this cluster may be adversarial
       [Inspect Coalition]   [Apply Group Cap]   [Dismiss]
```

The coalition alert appears inline with the cluster it affects, directly below the cluster header. The ⚡⚡ icon appears in the left margin. The alert is collapsible — clicking "Inspect Coalition" expands the full compound analysis (Option A's Coalition Warning panel or Option B's heatmap, depending on which is implemented).

### The "Always-On" vs. "On-Demand" Debate

**Always-on scanning** means the player doesn't need to know that compound adversarial patterns exist in order to benefit from the detection. A Season 3 player who has never heard of compound poisoning will see the coalition warning and learn about it organically. The system does the detective work; the player decides how to act.

**The cost:** Always-on scanning is computationally expensive (pairwise checks for every cluster in every career analysis) and generates potential false positives. In small competitive pools (4.69e-vi addresses this), opponents naturally appear together frequently. A group of three opponents who happen to be the player's most common matchups will have high combined concentration in every cluster — not because they're coordinating, but because they're the only people on the ladder.

**The false positive mitigation:** The coalition scanner only flags groups whose compound score exceeds 1.5× AND whose combined concentration exceeds 60% AND where removing the group dissolves or significantly reduces the cluster (from N≥3 to N<3 elements, or coverage drops by ≥30 percentage points). This triple-gate dramatically reduces false positives while preserving detection of genuine compound attacks.

### Interaction with Existing Systems

- **Per-opponent caps (4.69e-iii):** If any member of a detected coalition already has an individual cap, the coalition warning shows the cap status: "GhostFrame ⚡ capped at 50%. Coalition persists because StratusLayer and VoidKnot are uncapped."
- **Adversarial tags (4.69e-ii):** If a coalition member is already tagged ⚑ Exclude, they're excluded from the compound calculation. The system re-checks whether the remaining members still form a compound pattern.
- **Match frequency (4.69e-vi):** In small pools, the compound score is adjusted by the expected-overlap factor — opponents who naturally co-appear in the player's match schedule get a higher compound score threshold before the alert fires.

---

## Player Journeys

### Journey: Yuki, 28, Competitive Ladder Player (Operator III)

**Context:** Season 6, mid-season. Yuki has been climbing the competitive ladder for four seasons. She has a well-tuned 8-agent roster. Her RELAY-C has been the backbone of her architecture — a specialized signal compression relay that feeds three strikers. In the last three career analyses, RELAY-C has clustered with 3 elements. She's rebuilt it once already this season, but the cluster keeps recurring.

**Minute 0:00 — Career Analysis Results**
Yuki opens her Season 6 Analysis #3. The header loads: "3 agent clusters detected. **1 coalition pattern detected ⚡⚡.**" She's never seen the double-lightning icon before. Her eyes go to it immediately — the amber text stands out against the standard white of the cluster count.

She scrolls to RELAY-C's cluster entry. Below the familiar 3-element cluster summary, a new amber-bordered box reads: "⚡⚡ Coalition: GhostFrame + StratusLayer + VoidKnot. Compound score: 1.95× — this cluster may be adversarial."

**Minute 0:30 — First Reaction**
Yuki's stomach drops for a second — she's been rebuilding RELAY-C for two analyses because of this cluster. Was it all wasted effort? She clicks "Inspect Coalition." The Coalition Warning panel expands, showing the dual-bar comparison: combined coverage 82%, combined match share 42%. The coverage bar is nearly twice the match bar. The compound score glows amber: 1.95×.

Below, the match-source breakdown now has the three opponents highlighted with thin amber outlines. GhostFrame 32%. StratusLayer 28%. VoidKnot 22%. Individually, none would have triggered her ⚡ cap threshold (she uses auto-cap at 1.5×). But together — 82%.

**Minute 1:00 — The Recognition**
Yuki recognizes the names. GhostFrame and StratusLayer have been on the ladder all season. She thought they were just good players. VoidKnot is newer — showed up around Analysis #1. She opens her match history sidebar and checks: yes, all three run configs with aggressive signal flooding. Different configs, but the same pattern — they all target RELAY-C's buffer capacity from different angles.

She hovers over the "Without these 3 opponents" preview: "RELAY-C cluster: 0 elements. Flag does not fire. ✓" Her heart lifts. RELAY-C is fine. The architecture is sound. The cluster was manufactured.

**Minute 1:45 — Applying the Group Cap**
She clicks "Apply Group Cap ⚡⚡." The configuration panel slides open. She sees two options: Combined Cap (treats the trio as a unit) or Individual Caps (separate caps per opponent). She chooses Combined Cap at 60% — if their combined concentration in any cluster exceeds 60%, suppress all three. The preview confirms: RELAY-C suppressed, SCOUT-A included (the trio's combined concentration there is only 31%).

She clicks "Apply Group Cap ⚡⚡." The amber border of the Coalition Warning transitions to electric yellow with a brief flash — the same "noise vanishing" white flash she recognizes from individual caps, but brighter, as if three lightning bolts fired simultaneously. The cluster entry updates: "RELAY-C cluster: ⚡⚡ suppressed by group cap. 0 structural elements detected."

**Minute 2:30 — The Emotional Shift**
Yuki leans back. Two seasons of worrying about RELAY-C's architecture — two rebuilds, hours of tuning — and the problem was never RELAY-C. It was three opponents who happened to share a strategy. She opens the career analysis again with the group cap applied and looks at her *actual* structural weaknesses: STRIKER-B has a small cluster (2 elements, just below threshold) that she'd been ignoring because RELAY-C was screaming louder. She now has the diagnostic clarity to address the real problem.

**UI Annotations:**
- Coalition Warning: amber double-line border, 4s breathe-pulse animation, positioned below cluster header
- Dual bar comparison: side-by-side horizontal bars, coverage bar in amber, match-share bar in cool gray
- Group cap application: triple-lightning flash (300ms), amber→yellow border transition
- "Without these opponents" preview: checkmark in green, cluster elements counter animates from 3 → 0

---

### Journey: Tomás, 34, Casual Player (Novice II)

**Context:** Season 2. Tomás plays 3–4 matches a week on the competitive ladder, mostly for fun. He's still learning career analysis — he's used it twice. His 5-agent roster is unoptimized but functional. He doesn't follow the competitive meta.

**Minute 0:00 — Career Analysis Results**
Tomás runs his second career analysis. The header shows "2 agent clusters detected. 1 coalition pattern detected ⚡⚡." He's never seen a coalition warning before. He doesn't know what "compound score" means.

He clicks the ⚡⚡ icon. The Coalition Warning panel expands. He reads: "Removing NovaBlade + RiftRunner dissolves this cluster entirely. Combined coverage: 71%. Combined match %: 38%. Compound score: 1.87×."

**Minute 0:20 — Confusion, Then Clarity**
Tomás doesn't immediately understand "compound score." But the dual-bar comparison is legible even without vocabulary: the top bar (coverage) is much longer than the bottom bar (match share). He reads the plain-language line: "This may be coordinated targeting rather than a structural flaw."

He thinks: *Wait, two people are ganging up on my SCOUT-B?* He scrolls to the match-source breakdown. NovaBlade at 38%, RiftRunner at 33%. He remembers NovaBlade — they've played five times this season, and NovaBlade always seemed to specifically target his scouts. RiftRunner he barely remembers.

**Minute 0:50 — The "What Do I Do?" Moment**
Tomás hovers over the "Dismiss" button, then the "Apply Group Cap" button. The tooltip for Group Cap reads: "Suppress NovaBlade + RiftRunner's combined contribution to clusters where their joint impact exceeds 60%. This doesn't change your match results — it changes what career analysis sees."

He's hesitant. The tooltip adds: "You can remove this at any time from Settings → Opponents."

**Minute 1:10 — Applying Without Full Understanding**
Tomás clicks "Apply Group Cap ⚡⚡" with the default 60% threshold. He doesn't adjust the slider. The preview shows SCOUT-B's cluster dissolving. He clicks confirm.

The career analysis updates. The SCOUT-B cluster disappears. His remaining cluster — STRIKER-A with 2 elements — is a genuine structural issue. For the first time, his career analysis accurately reflects his config's real weaknesses instead of being dominated by two opponents' targeting.

**Minute 1:40 — Learning Through Action**
Tomás doesn't fully understand compound adversarial detection yet. But he's learned the *shape* of the concept: sometimes your career analysis is wrong because specific opponents skew it. The ⚡⚡ icon and the dual-bar comparison taught him through visual contrast, not through vocabulary. Next season, when he sees a cluster that doesn't look right, he'll know to check the match-source breakdown before rebuilding.

**UI Annotations:**
- Coalition Warning tooltip: plain-language explanation, emphasizes reversibility ("remove at any time")
- Default threshold: 60% pre-set, no slider adjustment required for casual players
- Cluster dissolution animation: SCOUT-B's entry fades out (400ms ease-out), remaining clusters slide up to fill the gap
- Confirmation feedback: brief amber flash on the career analysis header, "coalition pattern resolved" toast notification (bottom-right, 3s, then fades)

---

### Journey: Marcus, 41, Competitive Streamer (Architect I)

**Context:** Season 8. Marcus streams Robot Uprising on Twitch twice a week. He's in the top 200 on the competitive ladder. His audience loves watching him do career analysis on stream — it's the "detective segment" of his broadcast. He has deep system knowledge and uses every diagnostic tool.

**Minute 0:00 — The Heatmap Discovery**
Marcus is doing his weekly on-stream career analysis. He opens COMMAND-A's cluster detail — 4 elements, 73% combined coverage, the most severe cluster he's seen this season. Before jumping to conclusions, he opens the Opponent × Element Heatmap.

The heatmap renders: 11 opponents × 4 elements. Marcus immediately sees the warm band — three rows glow amber-red across all four columns. "Chat, look at this. See those three rows? PhantomWire, CircuitBreak, and NovaStatic. They're ALL warm across every column. Let me check..."

**Minute 0:45 — Building the Case On Stream**
Marcus clicks PhantomWire's row — the row lifts with a yellow border, and the bottom summary shows: "1 opponent selected. Compound score: 1.4×." He narrates: "PhantomWire alone is 1.4× — elevated but below our 1.5 threshold. Let me add CircuitBreak..."

He clicks CircuitBreak. The compound score counter rolls from 1.4 to 1.7. The "Apply Group Cap" button transitions from gray to amber. "1.7×. Now that's interesting. These two together are 1.7 times their match share. One more — NovaStatic..."

Click. The counter rolls from 1.7 to 2.3. The two ascending notes of the compound chime play. The button pulses. "**2.3 times.** Chat, that's not variance. That's coordination. These three are running anti-COMMAND configs."

**Minute 1:30 — The Forensic Analysis**
Marcus doesn't immediately apply the cap. Instead, he examines the heatmap column by column. "Look at the buffer_size column. PhantomWire is 41%, CircuitBreak is 28%, NovaStatic is 19%. That's 88% from three opponents who played 35% of my matches. And in the hook_routing column — NovaStatic is the hot one, 44%. They each specialize in a different element. PhantomWire floods the buffer. CircuitBreak saturates the fallback. NovaStatic disrupts hook routing. Three different attack vectors, three different opponents, one target."

His chat explodes with speculation: are they a team? Is this intentional? Someone clips the moment he said "2.3 times."

**Minute 2:30 — The Strategic Decision**
Marcus pauses before applying the cap. "Here's the thing, chat. If I group-cap these three and they ARE coordinating — I've solved my diagnostic. But if they're not coordinating and they've each independently found that COMMAND-A has weak hooks, weak buffers, and weak fallbacks... then COMMAND-A genuinely has problems and I'm blinding myself."

He hovers over the "Without these 3 opponents" preview. COMMAND-A cluster: 1 element remaining (hook_routing, from other opponents). "One element still clusters from other opponents — hook_routing. So hook_routing is probably a real structural issue. The other three elements are coalition-driven."

He applies the group cap and also makes a mental note to investigate hook_routing independently. "Best of both worlds, chat. Group cap for the coalition noise. Real fix for the structural element."

**Minute 3:30 — The Content Moment**
Marcus reviews his stream footage later. The 15-second clip of the heatmap warm band appearing, his narration building the case opponent by opponent, and the compound score rolling up to 2.3× — that clip gets 40K views. The audience watches him doing *detective work on his own diagnostic tools*, which is exactly the meta-level feeling Robot Uprising is designed to create. He's not just playing the game — he's auditing his instruments for reliability. That's the TikTok clip.

**UI Annotations:**
- Heatmap cell-by-cell render: 50ms stagger, left-to-right column wave
- Warm-band inner glow: 2px diffuse orange shadow per warm cell, creates "heat shimmer" contrast against cool rows
- Row selection: yellow border, 1px drop shadow lift, compound score number-flip animation
- Compound chime at 1.5× threshold: C5 → E5 ascending crystalline tones, 200ms total, distinct from single-cap click
- "Apply Group Cap" button amber pulse: 2s cycle, synced with compound score visibility

---

## Strengths and Weaknesses

### Strengths

1. **Closes the detection gap.** Single-opponent tools are blind to distributed attacks. Compound detection catches the coalition pattern that would otherwise be invisible — a genuine expansion of the player's diagnostic capability.

2. **Teaches a transferable skill.** Recognizing that aggregate metrics can be skewed by correlated subgroups is a fundamental data analysis skill. The dual-bar comparison and compound score are visual statistics lessons disguised as gameplay.

3. **Creates compelling content.** Marcus's journey demonstrates that compound detection is inherently dramatic — building a case opponent by opponent, watching the score climb, making the strategic call. This is the forensic detective fantasy that makes career analysis a spectator activity.

4. **Handles the "team meta" organically.** In competitive ladders, opponents who share strategies (whether coordinated or independently convergent) create compound patterns. The detection system doesn't need to know *why* opponents share a strategy — it just detects the statistical signature and lets the player decide.

5. **Preserves agency.** The system detects and surfaces, but never auto-suppresses. The player always decides whether to apply the group cap, dismiss the warning, or investigate further. The heatmap (Option B) adds even more agency — the player discovers patterns themselves.

### Weaknesses

1. **Computational cost.** Pairwise checks for every flagged cluster in every career analysis are expensive. With 3 clusters and 12 opponents each, that's 3 × 66 = 198 pair-wise re-computations per analysis. N-wise extensions add more. This may need to be an on-demand feature (clicked, not automatic) to avoid making career analysis slow.

2. **False positive risk in small pools.** In competitive brackets with 20–30 active players, any 3 frequent opponents will naturally have high combined concentration. The triple-gate (compound score > 1.5×, combined coverage > 60%, cluster dissolution on removal) mitigates this, but players in small pools may see frequent coalition warnings that are statistical artifacts, not real coordination.

3. **Attribution uncertainty.** The system can detect that a group's combined impact is disproportionate, but cannot determine whether the coordination is intentional. Three players who independently discovered the same weakness produce the same compound pattern as three teammates executing a coordinated strategy. The "coalition" label may imply intentional coordination that doesn't exist.

4. **Cognitive load for casual players.** Tomás's journey shows that casual players can benefit from compound detection through the simple dual-bar comparison. But the heatmap (Option B) and the group cap configuration are complex instruments that casual players may not engage with. The system needs a "just suppress it" fast path alongside the analytical deep dive.

5. **Group cap maintenance.** Groups are more fragile than individual caps. If one member leaves the ladder, does the group cap still apply to the remaining two? If a new opponent joins who plays similarly, should they be added to the group? The system needs a group management UI that won't become stale as the competitive landscape shifts.

---

## Interaction Effects

### With Per-Opponent Caps (4.69e-iii)
The group cap is a strictly more powerful instrument than individual caps for compound patterns. Individual caps at 1.5× would NOT trigger for any member of the GhostFrame/StratusLayer/VoidKnot coalition (each is under their individual threshold). Only the group-level analysis catches the compound effect. However, if a group member also has an individual cap for other clusters, both should coexist — the individual cap handles clusters where that opponent independently dominates, while the group cap handles clusters where the group collectively dominates.

### With Tag Expiry (4.69e-viii)
Group caps should expire similarly to individual tags. If the group hasn't triggered a coalition warning in 2 consecutive career analyses, prompt the player to confirm or dissolve the group. Meta shifts may make the coalition no longer relevant.

### With Counter-Poisoning (4.69e-iv)
Compound detection makes counter-poisoning *harder*. An attacker who distributes their poisoning across alt accounts or coordinated teammates now faces a detection system that can see through the distribution. This creates an arms race: the attacker must ensure their coalition stays below the compound score threshold, which constrains how effectively they can poison.

### With Per-Cluster Adversarial Exclusion (4.69e-vii)
Per-cluster exclusion is the even more surgical version — tagging an opponent as adversarial for one cluster but not others. Compound detection should interact with this: a group cap might suppress the trio for RELAY-C's cluster but not SCOUT-A's, which is exactly what per-cluster exclusion does at the individual level. The group cap might decompose into per-cluster group exclusions as an advanced configuration.

### With Necropsy Culture (7.10)
Compound detection generates compelling community artifacts. The heatmap visualization — warm bands of coordinated opponents, the compound score climbing as the streamer builds the case — is the kind of forensic drama that drives necropsy posts. "I found a 3-player coalition targeting my COMMAND agent across 4 elements" is a community discussion catalyst.

### With Dense Opponent Pools (4.69e-vi)
Small ladders are the primary false positive vector for compound detection. The compound score threshold must be calibrated per pool size: in a 100-player pool, 1.5× is meaningful; in a 15-player pool, 2.5× might be the minimum for a credible coalition warning. This interaction is critical to avoid frustrating small-pool players with frequent spurious alerts.

---

## Comparable Games & Media

### Competitive Card Games — "The Metagame Is the Meta"
In Magic: The Gathering and Hearthstone competitive play, players track not just individual opponents but *archetypes* — groups of players running similar strategies. The compound detection is analogous to "this archetype collectively skews my matchup data." MTG sideboard guides explicitly address "if your local meta is 40% Aggro across three different aggro decks, you need different answers than if it's 40% from one deck."

### Anti-Cheat Systems — Collusion Detection
Online poker platforms (PokerStars, GGPoker) use collusion detection algorithms that identify groups of players who consistently act in coordination — soft-playing each other, sharing hand information through patterns. The compound adversarial detection is the gameplay-diagnostic analog: detecting groups whose combined impact on the player's analysis is disproportionate, whether or not they're actively coordinating.

### Sports Analytics — Lineup Impact Analysis
In basketball analytics, "lineup plus/minus" measures how much the team's performance changes when a specific group of players is on the court together, beyond what each individual's plus/minus would predict. The compound adversarial score is structurally identical: how much more diagnostic impact does the group create beyond the sum of individual contributions?

### Fraud Detection — Network Analysis
Financial fraud detection uses network analysis to identify groups of accounts that transact together in suspicious patterns, even when no individual account's behavior is flagged. The compound detection is the same principle applied to match-history analysis: no single opponent is suspicious, but the group's combined footprint is disproportionate.

---

## Sensory Description

**The Coalition Warning appearing:** The amber double-line border draws itself — top edge first, left-to-right in 200ms, then the right edge top-to-bottom in 150ms, then bottom right-to-left, then left side bottom-to-top. A complete rectangle drawn like a pen tracing a box. The interior fades from transparent to a very faint amber wash (5% opacity) over 300ms. The ⚡⚡ icon appears in the left margin with a brief spark animation — two tiny lightning bolts that crackle outward and dissolve.

**The dual-bar comparison growing:** Both bars start at zero width and grow rightward simultaneously, but at different speeds — the coverage bar grows faster because it's longer, creating a visual *pull* that makes the disparity feel dynamic rather than static. The gap between where the match-share bar stops and the coverage bar continues is filled with a thin hatched zone in amber — the "adversarial excess" — that appears only after both bars finish growing.

**The compound score number:** Rendered in a heavier font weight than surrounding text, with a subtle shadow. When the score exceeds 1.5×, the text color transitions from white to amber. At 2.0×+, it transitions to a warm red-amber. The × symbol is rendered smaller and raised, like a superscript multiplier, evoking mathematical notation rather than game-UI aesthetics.

**The group cap application flash:** Three rapid lightning-bolt flashes in sequence (100ms apart), each originating from one of the three opponents' bars in the match-source breakdown and converging at the cluster header. The flashes are electric yellow trails that leave a brief afterimage. When they converge, the cluster entry's border transitions from amber to the resolved electric-yellow of an applied cap. A soft *crackle* sound — like static electricity — plays alongside the visual.

**The heatmap's warm band:** The warm cells have a soft inner glow that shifts subtly in intensity, like embers breathing. The cool cells are flat and matte — no depth, no motion, no life. The contrast between the alive warm band and the inert cool field is the primary visual signal. When the player selects a warm row, the glow intensifies briefly (200ms pulse) as if responding to attention.

---

## New Aspects Discovered

1. **4.69e-iii-f — Coalition member departure handling:** What happens when one member of a detected coalition leaves the competitive ladder or stops appearing in matches? Does the group cap persist for the remaining members? Does the compound score recalculate with the reduced group? Grace period before group auto-dissolution? The "roster instability" problem for compound groups.

2. **4.69e-iii-g — Coalition growth detection:** The opposite of departure — detecting when a *new* opponent should be added to an existing coalition group. If the player has a GhostFrame + StratusLayer group cap and a new opponent VoidKnot starts contributing similarly, the system could suggest adding VoidKnot to the group. Proactive coalition expansion vs. manual group management.

3. **4.69e-iii-h — Intentional vs. convergent coordination signal:** Can the system distinguish between deliberate team coordination and independent meta convergence? If three opponents run similar configs because the current meta rewards that strategy (not because they're targeting the player), the compound detection is a false positive. Possible signals: match scheduling proximity (do they queue at the same times?), config similarity (do their configs share unusual element choices?), opponent overlap (do they also compound against other players?).

4. **4.69e-iii-i — Compound detection as a community-level metric:** Aggregating compound detection results across all players in a bracket to identify which groups of opponents trigger coalition warnings most frequently. "GhostFrame + StratusLayer are flagged by 8 of their 15 opponents" is a bracket-level insight. Privacy implications of surfacing this information. Interaction with adversarial tag as community signal (4.69e-ix).

5. **4.69e-iii-j — Compound score trend as a season metric:** Tracking the player's peak compound score across career analyses over a season. Rising compound score trend = increasing coordinated adversarial pressure. Interaction with adversarial density metric (4.69e-v) and season health dashboard (4.69n).
