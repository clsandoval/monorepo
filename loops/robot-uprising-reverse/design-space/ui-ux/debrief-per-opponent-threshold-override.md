# Per-Opponent Threshold Override in Competitive Contexts

**Aspect:** 4.69e-iii — Per-opponent threshold override in competitive contexts: suppressing cluster contributions from specific opponents below a concentration threshold; interaction with match-source breakdown display; comparison with 4.69j per-agent threshold override.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-iv — Counter-poisoning config design; 4.69e-v — Adversarial density as career season metric; 4.69e-vi — Concentration threshold calibration for dense opponent pools; 4.69e-vii — Per-cluster adversarial exclusion
**Related:** 4.69j — Per-agent threshold override; 4.69a — Multi-cluster threshold configurability; Option D in 4.69e-ii (graduated tag levels); 4.69e-i — Match-scope filter UI design

---

## The Core Design Problem

The adversarial opponent tag (4.69e-ii) is a binary instrument: an opponent's matches are either fully included or fully excluded from career analysis. Marcus's journey in 4.69e-ii revealed the fundamental tension — IronPulse99's matches polluted STRIKER-A's cluster analysis (pure adversarial noise) but simultaneously exposed real structural weaknesses in RELAY-B. Tagging IronPulse99 as adversarial cleaned STRIKER-A but also hid RELAY-B's real problems.

The "Include adversarial" toggle lets the player flip between views, but this is a cognitive workaround, not a solution. The player must remember: *when I look at RELAY-B, turn adversarial back on; when I look at STRIKER-A, turn it off.* This is the kind of manual state-tracking that diagnostic tools are supposed to eliminate.

**The per-opponent threshold override solves this by making the exclusion conditional.** Instead of "exclude all of NebulaFang's matches," the player says: "Only suppress NebulaFang's contribution to a cluster when their concentration exceeds X%." If NebulaFang contributes 78% to RELAY-C's cluster (adversarial), suppress. If NebulaFang contributes 18% to SCOUT-A's cluster (proportional to match frequency), include. The threshold discriminates between adversarial domination and normal competitive contribution — automatically, per-cluster, without requiring the player to toggle anything.

This is the **surgical scalpel** to the binary tag's **sledgehammer**.

---

## Option A: The Concentration Cap — "Suppress Above X%"

### How It Works

The player sets a **concentration ceiling** for a specific opponent. Any cluster where that opponent's contribution exceeds the ceiling has the opponent's matches suppressed for that cluster only. Clusters where the opponent's contribution falls below the ceiling include the matches normally.

**The setting:** Within the adversarial tag UI (4.69e-ii), a new option appears between "Normal" and "Exclude":

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                            │
│                                                                             │
│  ○ Normal — include all matches at full weight                              │
│  ● ⚡ Cap — suppress when concentration exceeds:  [====●=====] 50%          │
│  ○ ⚑ Exclude — remove from all career analysis                             │
│                                                                             │
│  Preview with cap at 50%:                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  STRIKER-A cluster:                                                │     │
│  │    IronPulse99 concentration: 82% → SUPPRESSED (above cap)        │     │
│  │    Result: 0 elements. Cluster flag DOES NOT FIRE. ✓              │     │
│  │                                                                    │     │
│  │  RELAY-B cluster:                                                  │     │
│  │    IronPulse99 concentration: 38% → INCLUDED (below cap)          │     │
│  │    Result: 3 elements, coverage 67%. Cluster flag FIRES. ⚠        │     │
│  │                                                                    │     │
│  │  SCOUT-A:                                                          │     │
│  │    IronPulse99 concentration: 12% → INCLUDED (below cap)          │     │
│  │    No cluster detected. ✓                                          │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│                              [Cancel]   [Apply Cap ⚡]                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The slider:** A horizontal slider from 20% to 80%, with tick marks at 10% intervals. Default position: 50%. The slider has a "snap" feel — it prefers round numbers (30%, 40%, 50%) but allows finer positioning. As the player drags, the preview panel updates live with a 150ms debounce. The preview shows every agent cluster, indicating which would be suppressed and which included at the current threshold.

**The key insight:** The preview must show ALL agent clusters simultaneously, not just the one the player opened from. This is what makes the cap different from the binary tag — the player sees the per-cluster impact in one view and can tune the threshold to the exact point where adversarial noise is suppressed but structural signals are preserved.

### The Math

For each agent cluster in career analysis:
1. Compute the opponent's match-source concentration (same as the existing match-source breakdown)
2. If concentration ≥ cap threshold: exclude the opponent's matches from that cluster's computation
3. If concentration < cap threshold: include the opponent's matches at full weight

This is a binary gate per cluster, not a weight reduction. The opponent's matches are either fully in or fully out for each cluster. The cap just determines which clusters get the exclusion.

**Why binary per-cluster rather than proportional weighting:** Option D in 4.69e-ii explored the "Discount" approach (50% weight) and identified the arbitrary-weight problem. The concentration cap avoids this — it uses the opponent's own concentration as the discriminant, and the output is clean: in or out. No partial weights muddying the diagnostic math.

### Persistence

The cap persists per-opponent in the player's profile settings, alongside the existing tag types:

```
opponent_treatments: [
  {
    opponent: "IronPulse99",
    treatment: "cap",
    cap_threshold: 50,
    set_at: "Season 5, Analysis #4",
    reason_context: "82% concentration on STRIKER-A (adversarial), 38% on RELAY-B (structural)"
  }
]
```

The cap applies automatically in every subsequent career analysis. The player doesn't need to remember which clusters are affected — the cap's concentration check runs automatically and suppresses or includes per cluster.

### Interaction with Match-Source Breakdown Display

When a cap is active, the match-source breakdown for each cluster shows the treatment status:

```
STRIKER-A cluster — Match-Source Breakdown
vs. IronPulse99  ░░░░░░░░░░░░░░░░░░░░  82% ⚡ SUPPRESSED (above 50% cap)
vs. CrystalNet   ████████░░░░░░░░░░░░  28%
vs. Others (8)   ███░░░░░░░░░░░░░░░░░  11%
```

The suppressed opponent's bar renders in a ghosted style — thin diagonal hatching over a muted gray background, with the ⚡ icon and "SUPPRESSED" label in small caps. The bar is still visible (the player can see the concentration) but visually distinct from included opponents. Hovering the ghosted bar shows a tooltip: `IronPulse99's matches are suppressed in this cluster (concentration 82% exceeds your 50% cap). Included in clusters where concentration < 50%.`

For clusters where the opponent is below the cap:

```
RELAY-B cluster — Match-Source Breakdown
vs. IronPulse99  ████████████████░░░░  38% ⚡ included (below 50% cap)
vs. Others (12)  ██████████████░░░░░░  44%
```

IronPulse99's bar renders normally but with a small ⚡ icon — a reminder that a cap exists for this opponent, but it's not active for this cluster. The distinction between "suppressed" and "included (below cap)" is the feedback that teaches the player why the cap works.

### Sensory Description

**Setting the cap:** The player selects the "⚡ Cap" radio button. The slider animates into view below the radio group — sliding in from the left with a 300ms ease-out, the track appearing first (a thin groove, dark steel gray), then the thumb (a circular knob with a lightning bolt etched into it, in electric yellow-white). The knob has a slight 3D bevel that catches imagined light from above.

**Dragging the slider:** Each tick mark produces a soft tactile *click* (like a physical detent on a rotary knob). The preview panel below updates live — numbers cascade and bars redraw with a smooth interpolation. When a cluster flips from "included" to "suppressed" (or vice versa) as the slider crosses the opponent's concentration for that cluster, the cluster entry flashes briefly — a quick white flash for suppression (the noise disappearing) or a quick amber flash for inclusion (the signal returning). These flashes make the threshold's boundary viscerally legible: drag right past 38% and RELAY-B's entry flashes amber as IronPulse99's matches flood back in. Drag left past 82% and STRIKER-A's entry flashes white as the adversarial signal vanishes.

**The cap icon in career analysis header:** When a cap is active, the career analysis header shows: `⚡ 1 opponent capped (IronPulse99: 50%)`. Clicking expands the inline list, same pattern as the adversarial tag's `⚑` note. The ⚡ icon is electric yellow against the dark panel background — distinct from the ⚑ flag's crimson. The two icons can coexist if the player has some opponents tagged and others capped.

**The suppressed bar in match-source breakdown:** Diagonal hatching at 45°, thin white lines over muted gray, 4px spacing. The hatching gently pulses — not enough to attract attention, but enough to signal "this bar is not like the others" at a glance. The concentration percentage is rendered in a lighter font weight than included opponents.

---

## Option B: The Auto-Cap — System-Computed Threshold

### How It Works

Instead of the player manually choosing a concentration percentage, the system computes a **proportional expectation** for each opponent based on match frequency and automatically suppresses above-expectation concentration.

**The math:** If IronPulse99 played 20 of the player's 50 total matches, their "expected" concentration in any random cluster is ~40% (proportional to match share). The system sets the cap at `expected_concentration × 1.5` — in this case, 60%. Any cluster where IronPulse99 contributes >60% is suppressed; ≤60% is included.

The `1.5×` multiplier is the system's tolerance factor: it accepts that an opponent who plays 40% of your matches might naturally contribute up to 60% of a cluster (due to match-count variance, specific agent matchups, etc.), but anything beyond that suggests targeted behavior.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                            │
│                                                                             │
│  ○ Normal — include all matches at full weight                              │
│  ● ⚡ Auto-cap — suppress disproportionate concentration                    │
│  ○ ⚑ Exclude — remove from all career analysis                             │
│                                                                             │
│  IronPulse99 played 20 of your 50 matches (40%)                            │
│  Auto-cap threshold: 60% (1.5× match share)                                │
│                                                                             │
│  Preview:                                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  STRIKER-A: 82% concentration → SUPPRESSED (above 60%)            │     │
│  │  RELAY-B:   38% concentration → INCLUDED (below 60%)              │     │
│  │  SCOUT-A:   12% concentration → INCLUDED (below 60%)              │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Multiplier: [===●======] 1.5×   (lower = stricter, higher = looser)       │
│                                                                             │
│                              [Cancel]   [Apply Auto-Cap ⚡]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why Auto-Cap

The auto-cap solves the "what number do I pick?" problem. Option A's slider requires the player to understand what concentration percentage is meaningful — a 50% cap means different things when the opponent played 20% of your matches vs. 45% of your matches. The auto-cap normalizes for match frequency: it only suppresses when the opponent's diagnostic impact is disproportionate to how often they appear in the match history.

The multiplier slider (1.0× to 3.0×) lets advanced players tune the tolerance. At 1.0×, the system suppresses any above-proportional concentration (aggressive — will suppress many clusters). At 3.0×, the system only suppresses extreme outliers (conservative — similar to the binary tag's behavior at high concentrations). The default 1.5× is a moderate position.

### The Proportional Expectation Display

When the auto-cap is active, the match-source breakdown adds a thin vertical line to each cluster's bar chart — the **expected concentration marker**:

```
STRIKER-A cluster — Match-Source Breakdown
                                    ↓ expected (40%)     ↓ cap (60%)
vs. IronPulse99  ░░░░░░░░░░░░░░░░░░|░░░░░░░░░░░|██  82% ⚡ SUPPRESSED
vs. CrystalNet   ████████░░░░░░░░░░░░░░░░░░░░░░░░░  28%
vs. Others (8)   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  11%
```

The expected-concentration marker is a thin dashed line in white. The cap threshold is a solid line in electric yellow. The region between expected and cap is the "tolerance zone" — faintly shaded in amber. The region beyond the cap is the "suppression zone" — faintly shaded in red. This three-zone visualization teaches the player what "disproportionate" means: being above expected is normal; being way above expected (past the cap) is suspicious.

### Sensory Description

**The multiplier slider:** Styled as a scientific instrument — a narrow track with etched tick marks at 0.5× intervals, labeled "STRICTER" on the left and "LOOSER" on the right. The thumb is a small triangle pointer (like a frequency dial on a radio), colored electric yellow. Dragging it produces a continuous low hum that changes pitch — lower pitch at 1.0× (tight, focused, everything suppressed) and higher pitch at 3.0× (loose, relaxed, almost nothing suppressed). The pitch change is subtle enough to be subconscious, but it maps tightness to tension in a way that reinforces the mental model.

**The expected-concentration markers appearing:** When the player selects "Auto-cap," thin dashed lines materialize on every cluster's bar chart simultaneously — a cascade from top to bottom, each line fading in with a 50ms stagger. The lines are synchronized across clusters but the cap lines shift as the match-frequency ratio differs per cluster. This visual cascade is the "calibration" moment — the system is computing and showing its proportional model.

---

## Option C: The Per-Cluster Override Panel — Granular Control

### How It Works

Rather than a single per-opponent threshold, Option C gives the player explicit per-cluster control: for each cluster where the opponent appears, the player can independently choose to include or suppress.

**The flow:** The player clicks into the opponent treatment UI and sees every cluster where this opponent has measurable contribution, with individual toggles:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                            │
│  Per-cluster override                                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  STRIKER-A  │  Concentration: 82%  │  [■ Suppress] [□ Include] │        │
│  │  Preview: 0 elements, cluster DOES NOT FIRE                     │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  RELAY-B    │  Concentration: 38%  │  [□ Suppress] [■ Include] │        │
│  │  Preview: 3 elements, coverage 67%, cluster FIRES              │        │
│  ├─────────────────────────────────────────────────────────────────┤        │
│  │  SCOUT-A    │  Concentration: 12%  │  [□ Suppress] [■ Include] │        │
│  │  Preview: no cluster detected                                   │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  Default for future clusters: ○ Include  ● Use cap (50%)  ○ Suppress       │
│                                                                             │
│                              [Cancel]   [Apply Overrides]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

Each cluster row is a toggle: suppress or include. The "default for future clusters" setting handles new clusters that might appear in future analyses (as the player's config evolves and new clusters emerge).

### Why Per-Cluster Control

This is the **maximum-granularity** approach. The player gets exactly what Marcus wanted in 4.69e-ii: suppress IronPulse99 in STRIKER-A, include in RELAY-B, include in SCOUT-A. No threshold math, no concentration models — direct per-cluster decisions.

### The Maintenance Problem

Option C's weakness is **maintenance burden**. Every time career analysis runs, clusters may shift — new agents might cluster, old clusters might dissolve, concentration percentages change. The per-cluster override list becomes stale. The player would need to review and update overrides every analysis cycle.

The "default for future clusters" setting mitigates this but doesn't eliminate it: if the default is "include" and a new adversarial cluster emerges, the player must notice and manually suppress it. If the default is "suppress" and a new structural cluster emerges, the player misses real signals.

This creates an **override management tax** — ongoing cognitive overhead to keep per-cluster decisions current. Option A's concentration cap avoids this because the threshold adapts automatically as concentrations change.

### Sensory Description

**The per-cluster override panel:** A vertical stack of cluster rows, each separated by a thin divider line (1px, 10% white). Each row has a subtle background tint reflecting the cluster's severity: amber for firing clusters, neutral gray for non-firing. The suppress/include toggles are styled as physical switches — small rectangular buttons that depress when selected, with "Suppress" in muted red and "Include" in muted blue. Selecting "Suppress" on a row triggers a quick left-to-right wipe animation: the cluster preview text fades to the suppressed state, the background tint drains from amber to gray (if the cluster was firing and no longer does).

**The "default for future clusters" row:** Positioned below the cluster list with a thin border-top, slightly indented. Three radio buttons with the same styling as the main opponent treatment selector. A small crystal ball icon (🔮) next to the label "Default for future clusters" — indicating this is a predictive setting. The icon has a gentle shimmer animation on hover.

---

## Comparison: 4.69e-iii (Per-Opponent Threshold) vs. 4.69j (Per-Agent Threshold)

These two systems operate on perpendicular axes of the same diagnostic space. Understanding their relationship is critical for the UI design.

### The Two Axes

**4.69j — Per-agent threshold override** adjusts the **sensitivity of cluster detection** for a specific agent. "Always flag RELAY-C at N=2 even if global threshold is N=4." This says: *I know RELAY-C is fragile. I want early warnings about it.*

**4.69e-iii — Per-opponent threshold override** adjusts the **composition of the match sample** that feeds into cluster detection. "Suppress IronPulse99's matches in clusters where they dominate." This says: *I know IronPulse99 distorts my diagnostics. I want their noise filtered before analysis runs.*

The two systems are orthogonal:

```
                    Per-Agent Threshold (4.69j)
                    Low sensitivity ←──→ High sensitivity
                    (N=4)                (N=2)
                    │                    │
Per-Opponent  ──────┼────────────────────┼──────
Threshold     Full  │ A: Standard view   │ B: Paranoid about
(4.69e-iii)  Include│    of all data      │    this agent, all
                    │                    │    opponents included
                    │                    │
              ──────┼────────────────────┼──────
              Cap/  │ C: Filtered view,  │ D: Maximum scrutiny:
              Suppress│ normal sensitivity │    filtered AND
                    │                    │    high sensitivity
                    │                    │
```

**Quadrant A (both default):** Standard career analysis. All matches included, global threshold.

**Quadrant B (per-agent low threshold, no opponent filter):** The player is hyper-vigilant about a specific agent but trusts all match data. Useful for recently redesigned agents that need close monitoring.

**Quadrant C (opponent capped, standard agent threshold):** The player has identified adversarial opponents and filters their noise, but uses standard sensitivity. Useful for established configs with known adversarial rivals.

**Quadrant D (opponent capped AND per-agent low threshold):** Maximum diagnostic intensity. The player filters adversarial noise AND increases sensitivity for a specific agent. Useful for the paranoid expert: "I want to catch the smallest structural weakness in RELAY-C, but only from legitimate opponents, not NebulaFang's noise."

### UI Integration

The two settings should be **visible in the same panel but configured separately**. The agent inspector (workbench sidebar) could show both:

```
┌─────────────────────────────────────────────┐
│  RELAY-C — Diagnostic Settings              │
│                                             │
│  Cluster threshold: N=2 (global: N=3)  [✎] │
│  Opponent treatments:                       │
│    IronPulse99: ⚡ capped at 50%       [✎]  │
│    NebulaFang:  ⚑ excluded             [✎]  │
│                                             │
│  Effective mode: Filtered + Sensitive (D)   │
└─────────────────────────────────────────────┘
```

The "Effective mode" label at the bottom is a teaching tool — it tells the player which quadrant they're operating in, using natural language rather than forcing them to understand the 2×2 matrix.

### The Composition Problem

When both overrides are active, the system must compute results in a specific order:
1. **First, apply opponent treatment** (exclude/cap/suppress per opponent)
2. **Then, apply per-agent threshold** to the filtered match set

The order matters. If the system applied the per-agent threshold first (lowering to N=2), an adversarial opponent's concentrated matches might fire the cluster flag before the opponent cap has a chance to suppress them. Opponent filtering must happen at the data layer, before threshold detection runs at the analysis layer.

This sequencing should be transparent: a tooltip on the "Effective mode" label explains: *"Opponent treatments are applied first (filtering the match sample), then cluster detection runs with your agent-specific threshold over the filtered sample."*

---

## Interaction Effects

### With 4.69e-ii (Adversarial opponent tagging — binary)

The per-opponent threshold override (4.69e-iii) is a **strict superset** of the binary tag (4.69e-ii). A binary exclude tag is equivalent to a cap at 0% (suppress in all clusters regardless of concentration). A binary include is equivalent to no cap (100%).

**Design question:** Should both systems coexist, or should the cap replace the binary tag entirely?

**Argument for coexistence:** The binary tag is simpler. New players and casual competitors don't need concentration thresholds — they just need "exclude this noise." The cap is an advanced tool for players who've experienced the Marcus problem (opponent is adversarial for some agents but structural for others). The progressive disclosure pattern: introduce binary tags in Season 3's tutorial, introduce caps in a later competitive milestone.

**Argument for replacement:** Two systems that both control "how this opponent's matches affect my analysis" creates confusion. A player might have IronPulse99 set to "Exclude" (binary tag) and also to "Cap at 50%" (threshold) — which takes precedence? The interaction creates edge cases. Better to have one system with a slider where 0% = exclude and no-cap = include.

**Recommendation:** Coexist with clear hierarchy. The binary tag takes precedence — if an opponent is tagged ⚑ Exclude, no cap applies. If the player wants to switch to a cap, they must first remove the binary tag. The UI routes through a single opponent treatment panel (as shown in Option A's mockup) where the three options are mutually exclusive radio buttons: Normal / Cap / Exclude.

### With 4.69e-vi (Concentration threshold calibration for dense pools)

In small competitive brackets (≤5 opponents), concentration is naturally high because the same opponents recur. Option B's auto-cap (proportional expectation model) partially addresses this — the expected concentration is already higher in small pools, so the cap is higher too. But explicit interaction is needed: in a 5-opponent pool where one player accounts for 40% of matches, a 1.5× auto-cap sets the threshold at 60%. If that opponent naturally contributes 55% to a cluster (not adversarial, just frequent), they're barely below the cap. The player might still need to adjust the multiplier upward.

The system could show a **pool size advisory**: *"Your opponent pool has 5 players. IronPulse99 accounts for 40% of your matches. Concentration above 60% is more likely due to match frequency than targeting. Consider a higher cap."*

### With 4.69e-vii (Per-cluster adversarial exclusion)

Option C in this exploration IS essentially 4.69e-vii — per-cluster exclusion. The distinction: 4.69e-iii frames it as a threshold override (concentration-based), while 4.69e-vii frames it as explicit per-cluster tagging. The implementation differs but the outcome is the same: per-cluster control over whether an opponent's matches are included.

The cap approach (Options A/B) is preferable to explicit per-cluster control (Option C) because it's **self-maintaining** — the cap adapts as concentrations shift across analyses. Per-cluster overrides (4.69e-vii) require manual maintenance.

### With 4.69e-viii (Tag expiry and automatic sunset)

The cap threshold should also sunset. If the player set a 50% cap on IronPulse99 three seasons ago, the competitive meta may have shifted — IronPulse99's config may no longer target the same agents. The cap's automatic per-cluster discrimination means stale caps are less harmful than stale binary tags (a stale cap only suppresses if concentration is still disproportionate), but periodic review prompts are still valuable. The review prompt for caps could include: *"IronPulse99 hasn't exceeded your 50% cap in any cluster for the last 2 analyses. Consider removing the cap."*

### With 4.69a (Multi-cluster threshold configurability — global)

The global threshold controls how many fix-candidate appearances trigger a cluster flag (N=3 default). The per-opponent cap controls which matches feed into the computation. These are independent axes:

- **Raising the global threshold** is a blunt response to too many cluster flags. It reduces all signals.
- **Setting per-opponent caps** is a surgical response to specific opponents distorting specific clusters. It preserves legitimate signals.

The diagnostic settings panel should position these as different tools for different problems — threshold for noise floor, caps for specific adversarial opponents. A contextual hint: *"Getting too many cluster flags? If specific opponents dominate, try per-opponent caps. If all clusters seem noisy, try raising the global threshold."*

---

## Comparable Games & Media

### StarCraft II — Opponent-Specific Build Order Analysis

In SC2's replay analysis ecosystem, players filter their match history by opponent race (Zerg, Protoss, Terran) and by specific opponents when preparing for tournaments. A player might study their win rate against specific high-level opponents and exclude "learning games" against lower-ranked players from their performance metrics. Third-party tools like Spawning Tool let players tag replays and filter analysis by tag. The per-opponent cap is analogous to: "Show me my build order performance, but weight down games against SOS because his early aggression distorts my macro metrics."

### Poker — Player-Specific Hand History Filtering

Online poker tracking tools (PokerTracker, Hold'em Manager) let players filter their hand history database by specific opponents and compute stats per opponent. A player might notice their VPIP (voluntarily put in pot %) is inflated because 30% of their hands were against a super-aggressive villain who forced them to play wider. They can filter that opponent out to see their "true" tendencies. The auto-cap model (Option B) is directly analogous to poker's "adjust for villain frequency" — normalize for how often you face someone before interpreting your stats.

### Baseball — Park-Adjusted and Opponent-Adjusted Statistics

MLB analytics adjusts batting statistics for ballpark factors (Coors Field inflates home runs) and opposing pitcher quality. A batter's "true" slugging percentage removes the noise of specific contexts. The per-opponent cap does the same: it removes the noise of specific opponents to reveal the "true" structural health of an agent. Park factors are automatic (every stat service applies them); opponent adjustment is manual (analysts choose which opponents to examine). Robot Uprising's design sits in between: the auto-cap (Option B) is automatic like park factors, while the manual cap (Option A) is explicit like opponent filtering.

### Scientific Research — Outlier Exclusion Criteria

In experimental statistics, researchers define outlier exclusion criteria before analyzing data: "exclude data points more than 2 standard deviations from the mean." The per-opponent cap is the same pattern: define a concentration threshold, and any opponent whose contribution exceeds it is excluded from the analysis for that variable. The scientific parallel suggests the cap should be set BEFORE running analysis (to avoid p-hacking — choosing the threshold that gives the desired result after seeing the data). This argues for the auto-cap (Option B), where the threshold is computed from match frequency, not cherry-picked by the player.

---

## Player Journeys

### Journey: Marcus, 31, Returning Player — The Resolution

**Context:** Season 5, two weeks after the events in his 4.69e-ii journey. Marcus tagged IronPulse99 as adversarial to clean up STRIKER-A's cluster, but he knows the tag also hides IronPulse99's legitimate impact on RELAY-B. He's been using the "include adversarial" toggle to manually switch views, but he's frustrated by the cognitive overhead. This week's update introduces per-opponent threshold overrides.

**Minute 0:00 — The Notification**

Marcus opens the debrief panel after a session. A small amber note at the top of career analysis reads: `✦ New: Per-opponent concentration caps now available. Fine-tune how specific opponents affect your diagnostics. [Learn more]`

He ignores it and runs career analysis. With IronPulse99 tagged as adversarial, STRIKER-A is clean but RELAY-B's cluster only shows 2 elements at 31% coverage — he knows the real number is higher with IronPulse99 included. He clicks the "include adversarial" toggle. RELAY-B jumps to 3 elements, 67% coverage. STRIKER-A's cluster also reappears — 82% concentration from IronPulse99.

He sighs. Same dance as last week. He goes back to the notification and clicks `[Learn more]`.

**Minute 0:30 — Learning the Cap System**

A tooltip panel explains: *"Concentration caps let you suppress an opponent's matches only in clusters where they dominate. Set a cap at 50%: clusters where the opponent contributes >50% will exclude their matches. Clusters where they contribute <50% will include them. This lets you filter adversarial noise without losing structural signals."*

Marcus's eyes widen. This is exactly what he needs. He navigates to Settings → Opponents → IronPulse99. The opponent treatment panel shows three radio options: Normal, ⚡ Cap, ⚑ Exclude (currently selected).

He selects ⚡ Cap. The slider appears, defaulting to 50%. The preview panel loads immediately, showing all his agent clusters:

```
STRIKER-A: 82% concentration → SUPPRESSED ✓
RELAY-B:   38% concentration → INCLUDED ⚠ (3 elements, 67%)
SCOUT-A:   12% concentration → INCLUDED ✓ (no cluster)
```

**Minute 1:00 — Tuning the Threshold**

Marcus stares at the preview. At 50%, the result is perfect: STRIKER-A's adversarial noise is suppressed and RELAY-B's structural signal is preserved. But he wonders — what if IronPulse99's RELAY-B concentration creeps up to 55% next analysis? He'd want that included too.

He drags the slider to 60%. The preview doesn't change — STRIKER-A is still 82% (suppressed) and RELAY-B is still 38% (included). But the buffer is larger. He drags to 40%. Now RELAY-B flashes amber briefly — at 40%, RELAY-B would also be suppressed (38% is below 40%, so it stays included). Wait, 38% is below 40%, so it's fine. He drags to 35%. RELAY-B's row flashes — now suppressed. IronPulse99's 38% exceeds 35%.

The flash feedback is instant. Marcus drags back to 50% — the safe middle ground. He clicks `Apply Cap ⚡`.

**Minute 1:15 — The Clean View**

Career analysis recomputes. For the first time, Marcus sees a view that's simultaneously honest about both agents: STRIKER-A is clean (IronPulse99 suppressed at 82%), RELAY-B is flagged (IronPulse99 included at 38%, real structural problem visible). No toggle-switching required. No mental arithmetic.

The career analysis header shows: `⚡ 1 opponent capped (IronPulse99: 50%)`. He feels a deep satisfaction — like adjusting the focus on a microscope. The diagnostic was always there; the lens just needed calibration.

**Minute 1:30 — Noticing the Breakdown**

He expands STRIKER-A's cluster (which is now empty). The match-source breakdown still shows IronPulse99's bar, but ghosted with diagonal hatching: `IronPulse99: 82% ⚡ SUPPRESSED (above 50% cap)`. Below it, the remaining opponents contribute only enough for 0 elements. The visual contrast — the massive ghosted bar towering over the tiny included bars — makes the adversarial pattern obvious even to a spectator.

He expands RELAY-B's cluster. IronPulse99's bar is solid (included) with a small ⚡ icon: `IronPulse99: 38% ⚡ included (below 50% cap)`. The other opponents' bars fill in the rest. The cluster fires with 3 elements. This is a real problem that needs fixing.

Marcus opens the redesign flow for RELAY-B.

**UI Annotations:**
- Cap slider: horizontal, 200px wide, positioned below radio buttons in opponent treatment panel
- Preview panel: auto-scrolls to show all affected clusters, max-height 300px with internal scroll
- Flash feedback: 200ms white flash for suppression, 200ms amber flash for inclusion, on the cluster row background
- Ghosted bar: 45° diagonal hatching, 4px line spacing, 1px line width, 20% opacity white lines over 30% opacity gray fill
- ⚡ icon: 12×12px, electric yellow (#FFD700), positioned inline next to concentration percentage

---

### Journey: Priya, 28, Data Scientist, Competitive Architect II

**Context:** Season 7. Priya is a methodical player who approaches the game like a data analysis problem. She maintains a spreadsheet tracking her career analysis results over time. She's facing a complex adversarial landscape: three opponents in her bracket (CyberThorn, VoidPulse, NeonDrift) all run configs that stress different parts of her relay stack. She wants to understand which signals are structural vs. adversarial — but the interactions are non-trivial because multiple opponents contribute to the same clusters.

**Minute 0:00 — The Multi-Opponent Problem**

Priya opens career analysis. RELAY-A clusters with 4 elements, combined coverage 72%. She expands the match-source breakdown:

```
vs. CyberThorn    ████████████████░░░░  42%
vs. VoidPulse     ████████████░░░░░░░░  31%
vs. NeonDrift     █████░░░░░░░░░░░░░░░  15%
vs. Others (9)    ███░░░░░░░░░░░░░░░░░  9%
```

No single opponent dominates enough to trigger the ⚠ warning (none exceeds 60%). But Priya notices that the top two opponents together account for 73% of the cluster's coverage. CyberThorn and VoidPulse might both be partially adversarial — or RELAY-A might genuinely struggle against pressure configs.

**Minute 0:20 — Setting Multiple Caps**

She opens opponent treatments. She has no caps set yet. She starts with CyberThorn — the highest contributor at 42%.

She selects ⚡ Cap and considers the slider. CyberThorn played 12 of her 50 matches (24% match share). A proportional contribution would be ~24% per cluster. CyberThorn's 42% is 1.75× their match share. She could use the auto-cap (Option B) — she selects it.

The auto-cap computes: expected concentration 24%, cap at 36% (1.5× match share). At 36%, CyberThorn's 42% contribution to RELAY-A would be suppressed.

Preview:
```
RELAY-A: CyberThorn concentration 42% → SUPPRESSED
  Without CyberThorn: 3 elements, coverage 48%. Cluster FIRES. ⚠
```

The cluster still fires without CyberThorn — just at reduced severity. Priya nods. CyberThorn was amplifying but not fabricating the signal.

She applies the cap and moves to VoidPulse. Auto-cap: expected 18% (9/50 matches), cap at 27%. VoidPulse's 31% contribution would be suppressed.

Preview:
```
RELAY-A: VoidPulse concentration 31% → SUPPRESSED
  CyberThorn already capped. Combined effect: 2 elements, coverage 22%. Cluster DOES NOT FIRE. ✓
```

Interesting — with both CyberThorn and VoidPulse capped, the cluster dissolves. Only NeonDrift and the field remain, and they don't generate enough coverage to fire the flag.

**Minute 0:45 — The Diagnostic Interpretation**

Priya sits back. The data tells a story:
- With all opponents: RELAY-A clusters at 4 elements, 72% coverage (alarming)
- Without CyberThorn only: 3 elements, 48% coverage (still concerning)
- Without CyberThorn AND VoidPulse: 2 elements, 22% coverage (healthy)

RELAY-A has a **mild** structural sensitivity that CyberThorn and VoidPulse together amplify into a false alarm. Neither opponent alone fabricates the signal, but together their concentrated contributions create a cluster that wouldn't otherwise fire.

This is a **compound adversarial effect** — more subtle than single-opponent poisoning. Priya decides to keep both caps active and also investigate the mild structural sensitivity independently. She opens RELAY-A's redesign mode to see if a small buffer size increase would eliminate even the 22% residual.

**Minute 1:00 — The Spreadsheet Update**

Priya opens her external spreadsheet and logs: "Season 7 Analysis #4: RELAY-A cluster driven primarily by CyberThorn (42%) and VoidPulse (31%). Compound adversarial. Both capped (auto-cap 1.5×). Residual: 2 elements, 22%. Mild structural. Investigating buffer increase."

She appreciates that the cap system lets her decompose the problem systematically — peel off one opponent at a time and observe how the diagnostic changes. The preview's real-time update made this iterative analysis possible without running multiple career analyses.

**Minute 1:15 — Discovery: The Compound Adversarial Pattern**

Priya wonders: is there a way to detect compound adversarial effects automatically? What if the system checked whether removing any combination of 2 opponents would dissolve a cluster? She makes a mental note to check the community forums — someone else must have noticed this pattern.

This journey reveals: **compound adversarial detection** — where no single opponent dominates but 2–3 opponents together create a false signal — is a gap in the current system. The ⚠ warning only triggers for single-opponent concentration ≥40%. A new aspect should explore multi-opponent compound adversarial detection.

**UI Annotations:**
- Multiple caps displayed: career analysis header shows `⚡ 2 opponents capped` with expandable list
- Cumulative preview: when setting a second cap, the preview incorporates all existing caps, not just the new one
- Auto-cap computation visible: the expected-concentration and cap-threshold values shown inline, not hidden
- Compound effect: preview explicitly labels "Combined effect" when multiple caps are active

---

### Journey: Kai, 14, First Competitive Season, Mobile Player

**Context:** Season 2. Kai just reached competitive play after finishing the single-player campaign. He's in Bronze III, has played 20 matches against 4 opponents. He doesn't know what concentration thresholds mean and has never thought about adversarial strategies.

**Minute 0:00 — The Confusing UI**

Kai opens career analysis after losing several matches. One cluster fires: RELAY-A, 3 elements. He taps the cluster and sees the match-source breakdown. The ⚠ warning appears for "ShadowMech99" (65% concentration).

He taps the shield icon out of curiosity. The confirmation drawer (bottom sheet on mobile) slides up. He sees:

```
OPPONENT TREATMENT: ShadowMech99

○ Normal — include all matches at full weight
○ ⚡ Cap — suppress when concentration exceeds:  [====●=====] 50%
○ ⚑ Exclude — remove from all career analysis
```

He doesn't understand what "suppress when concentration exceeds" means. The words "concentration" and "threshold" are unfamiliar in this context. He taps "Normal" (it's already selected) and nothing happens. He taps "Exclude" — the preview updates, the cluster disappears. He taps "Normal" again — the cluster returns.

He gets that Exclude makes the problem go away, but he doesn't understand why or whether that's good. The Cap option is completely opaque to him — a slider with a percentage that means nothing without understanding proportional contribution.

**Minute 0:30 — The Tooltip Rescue**

He long-presses on "⚡ Cap" (mobile gesture for help). A tooltip appears: *"Set a concentration limit for this opponent. Their matches are excluded from agent analyses where they contribute more than this percentage. Useful when an opponent is adversarial against some of your agents but not others."*

He reads "adversarial" and thinks it means "enemy." All opponents are enemies. The tooltip doesn't help. He closes the drawer and goes back to the cluster result, feeling confused.

**Minute 0:45 — What He Actually Needed**

Kai's RELAY-A actually has a structural problem — ShadowMech99 is the most frequent opponent in his tiny bracket, and their config exposes RELAY-A's real weaknesses. If Kai had tagged or capped ShadowMech99, he would have hidden the signal.

For Kai, the correct action is: ignore the concentration warning, read the cluster result, and fix RELAY-A. The tagging/cap system is a tool for players who face genuine adversarial targeting — Kai faces normal competitive matchups concentrated by a small opponent pool.

**Minute 1:00 — The Design Lesson**

This journey reinforces 4.69e-vi: in small opponent pools, the entire adversarial treatment UI (tag, cap, exclude) should be gated or de-emphasized. For pools ≤5 opponents, the ⚠ warning could be replaced with a gentler message: *"ShadowMech99 contributed 65% of this cluster's coverage. With only 4 opponents in your bracket, high concentration from individual opponents is expected."*

The cap slider should not appear at all for players below a competitive milestone (e.g., Silver rank or 50+ matches in the competitive pool). Progressive disclosure: Bronze players see clusters and can fix agents. Silver+ players gain access to opponent treatments. This prevents Kai from accidentally suppressing signals he doesn't understand.

**UI Annotations (Mobile):**
- Bottom sheet: slides up to 50% screen height, scrollable within
- Cap slider: 44px touch target height, thumb is 48px diameter circle for mobile accuracy
- Tooltip on long-press: 300ms delay, appears as a semi-transparent overlay above the element, auto-dismisses on scroll
- Progressive disclosure gate: cap option grayed out with lock icon below Silver rank, label reads "Unlocks at Silver I"

---

## Strengths and Weaknesses

### Option A (Manual Concentration Cap)
**Strengths:**
- Player has direct control over the exact threshold
- Self-maintaining (adapts automatically as concentrations shift)
- Preview with live slider makes the threshold's effect viscerally legible
- Sits cleanly between binary tag (blunt) and per-cluster override (complex)

**Weaknesses:**
- Requires the player to know what concentration percentage is meaningful
- The "right" threshold differs by opponent pool size, match frequency, and context
- Single threshold per opponent — can't set 40% for RELAY-related clusters and 60% for STRIKER-related clusters

### Option B (Auto-Cap with Proportional Expectation)
**Strengths:**
- Self-calibrating — adjusts for match frequency automatically
- The proportional expectation model is defensible (suppresses disproportionate impact, not proportional impact)
- The multiplier slider provides advanced tunability without requiring raw percentages
- Expected-concentration markers in the bar chart teach the player the underlying model

**Weaknesses:**
- The 1.5× multiplier is arbitrary (why not 1.3× or 2.0×?)
- Obscures the actual mechanism — players may not understand why their cap is 36% vs. 60%
- In very small pools (3 opponents), the proportional expectation is so high that the cap may never trigger

### Option C (Per-Cluster Override Panel)
**Strengths:**
- Maximum granularity — the player gets exactly what they want per cluster
- No abstract thresholds to understand — binary include/suppress per cluster
- Directly addresses the Marcus problem without any concentration math

**Weaknesses:**
- High maintenance burden — overrides become stale as clusters shift
- Doesn't scale to many opponents × many clusters (combinatorial explosion)
- The "default for future clusters" setting is a guess — new clusters might need either treatment
- Encourages micro-management rather than systemic thinking

---

## Discovered Sub-Aspects

1. **4.69e-iii-a — Compound adversarial detection:** Automatic detection of cases where no single opponent dominates but 2–3 opponents together create a false cluster signal. The system could check all pairwise (and eventually N-wise) opponent removals and flag when removing a small group of opponents dissolves a cluster. UI for displaying compound adversarial patterns and applying group caps.

2. **4.69e-iii-b — Cap threshold calibration wizard:** A guided flow that helps the player set the right cap threshold by showing sensitivity analysis: "At 40%, 2 clusters are suppressed. At 50%, 1 cluster is suppressed. At 60%, 0 clusters are suppressed." The wizard visualizes the entire threshold-to-suppression-count curve and recommends a threshold based on the player's stated goal (aggressive filtering vs. conservative).

3. **4.69e-iii-c — Cap vs. tag migration path:** UI flow for converting an existing binary tag to a cap (and vice versa). When a player with a binary ⚑ Exclude tag discovers the cap system, the migration should show: "Your current tag excludes IronPulse99 from all clusters. A 50% cap would include them in 2 clusters where their concentration is proportional. [Preview migration] [Keep tag]."

4. **4.69e-iii-d — Per-opponent-per-agent threshold matrix:** The full combinatorial system: set a different concentration threshold for each (opponent × agent) pair. Maximum precision, maximum complexity. Is this ever needed, or do the simpler systems (per-opponent cap, per-agent threshold) cover 99% of cases? What would the UI look like for a 5-opponent × 8-agent matrix?

5. **4.69e-iii-e — Cap effectiveness tracking over time:** A log showing how many clusters were suppressed by each cap in each career analysis, and whether the suppressed clusters would have been false positives (opponent removed = cluster dissolves) or false negatives (opponent removed = cluster dissolves but structural weakness remains at lower severity). This is the cap's own diagnostic — is your cap helping or hurting?
