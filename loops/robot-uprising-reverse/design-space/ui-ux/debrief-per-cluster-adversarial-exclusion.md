# Per-Cluster Adversarial Exclusion

**Aspect:** 4.69e-vii — Per-cluster adversarial exclusion: tag an opponent as adversarial for specific agent clusters but not others; "exclude IronPulse99 from STRIKER-A analysis but include in RELAY-B analysis"; surgical per-cluster tagging vs. blanket per-opponent tag; interaction with 4.69j per-agent threshold override.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-iii — Per-opponent threshold override (concentration cap); 4.69e-iv — Counter-poisoning config design; 4.69e-v — Adversarial density (APS); 4.69e-vi — Concentration threshold calibration for dense opponent pools; 4.69e-viii — Tag expiry and automatic sunset
**Related:** 4.69j — Per-agent threshold override; 4.69a — Multi-cluster threshold configurability; 4.69e-i — Match-scope filter UI design; 4.69d — Multi-cluster persistence tracking; 7.10 — Necropsy culture

---

## The Core Design Problem

The existing adversarial exclusion hierarchy has three levels:

1. **Binary tag** (4.69e-ii): Exclude an opponent from ALL career analysis. Sledgehammer.
2. **Concentration cap** (4.69e-iii): Suppress an opponent when their concentration exceeds X% in any cluster. Automated scalpel.
3. **Match-scope filter** (4.69e-i): Manually exclude specific opponents from a single analysis run. Temporary microscope.

The gap: none of these express **"IronPulse99 is adversarial toward my STRIKER-A, but legitimately exposing a real flaw in my RELAY-B."**

The binary tag removes IronPulse99 from everything — cleaning STRIKER-A but hiding RELAY-B's real problem. The concentration cap tries to automate this distinction based on a single percentage threshold, but a threshold that correctly suppresses STRIKER-A (where IronPulse99 is at 82%) might also suppress a legitimate 55% concentration in a small-cluster RELAY-B analysis. The match-scope filter requires the player to manually re-configure every analysis run.

**Per-cluster adversarial exclusion is the explicit, persistent, per-agent-cluster version of the tag.** The player says: "I have examined IronPulse99's impact on each of my agent clusters independently, and I'm making a deliberate judgment about which clusters their matches are adversarial noise and which they're legitimate signal."

This is the most *granular* tagging possible. It shifts the unit of analysis from "opponent" to "opponent × cluster pair." The question is whether this granularity justifies the cognitive cost.

---

## The Granularity Spectrum

Before exploring design options, it helps to see the full exclusion spectrum and where per-cluster tagging sits:

| Level | What it excludes | Granularity | Cognitive cost | Persistence |
|-------|-----------------|-------------|----------------|-------------|
| Binary tag (4.69e-ii) | All matches from opponent X | Opponent | Low — one decision | Permanent until removed |
| Concentration cap (4.69e-iii) | Opponent X where concentration > Y% | Opponent × threshold | Medium — one decision + threshold tuning | Permanent until removed |
| **Per-cluster tag (4.69e-vii)** | **Opponent X in cluster Z only** | **Opponent × cluster** | **High — one decision per cluster** | **Permanent until cluster dissolves** |
| Match-scope filter (4.69e-i) | Opponent X in this one analysis run | Opponent × session | Very high — every run | Ephemeral |

The concentration cap (4.69e-iii) was explicitly designed as the "surgical scalpel" to the binary tag's "sledgehammer." Per-cluster tagging is a step further — the **tweezers**. The question is whether tweezers are the right tool or whether the cap already handles this well enough.

**The case FOR per-cluster tagging:** The concentration cap makes an automated judgment based on a single percentage. But adversarial vs. structural is a *qualitative* judgment. IronPulse99 might contribute 55% to both STRIKER-A and RELAY-B — same concentration, same cap behavior — but the player knows from watching replays that STRIKER-A's cluster is pure targeting (IronPulse99 runs a specialized counter-config) while RELAY-B's cluster reflects a genuine weakness that IronPulse99 merely exploits more frequently than others. The cap can't distinguish these because they look identical statistically.

**The case AGAINST:** Every layer of granularity is a layer of cognitive load. The player must now maintain a mental model of not just "which opponents am I tagging" but "which opponent-cluster combinations am I tagging." If the player has 3 tagged opponents and 5 agent clusters, the per-cluster tag space is 15 individual decisions. The cognitive overhead scales multiplicatively.

---

## Option A: The Cluster Scope Drawer — "Tag With Scope"

### How It Works

The adversarial tag UI (4.69e-ii) gains a **scope selector** inside the confirmation drawer. After clicking `Flag as Adversarial`, instead of immediately applying a blanket tag, the system presents a cluster-by-cluster breakdown and lets the player check which clusters the tag should apply to.

**The UI flow:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FLAG OPPONENT AS ADVERSARIAL                                               │
│                                                                             │
│  Opponent: IronPulse99 (Operative II)                                       │
│  Matches analyzed: 28 of 52 total                                           │
│                                                                             │
│  TAG SCOPE:                                                                 │
│  ○ All clusters — exclude from entire career analysis                       │
│  ● Per-cluster — choose which clusters to exclude from:                     │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  ☑ STRIKER-A cluster (3 elements)                                  │     │
│  │    IronPulse99 concentration: 82%                                  │     │
│  │    Without IronPulse99: 0 elements → cluster DISSOLVES ✓           │     │
│  │                                                                    │     │
│  │  ☐ RELAY-B cluster (4 elements)                                    │     │
│  │    IronPulse99 concentration: 55%                                  │     │
│  │    Without IronPulse99: 2 elements → cluster PERSISTS ⚠            │     │
│  │                                                                    │     │
│  │  ☐ SCOUT-A cluster (2 elements)                                    │     │
│  │    IronPulse99 concentration: 18%                                  │     │
│  │    No change expected — below detection threshold                  │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  ⚠ RELAY-B cluster persists even without IronPulse99's matches.            │
│    This suggests a structural flaw — consider keeping their matches        │
│    included for RELAY-B to preserve diagnostic signal.                      │
│                                                                             │
│                              [Cancel]   [Apply Scoped Tag ⚑]               │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Key affordances:**

- The **radio toggle** at the top ("All clusters" vs. "Per-cluster") defaults to "All clusters" — the binary tag is the path of least resistance. Per-cluster is opt-in for players who want finer control.
- Each cluster row shows a **checkbox**, the current IronPulse99 concentration, and a **preview** of what happens if excluded. The preview is the teaching mechanism: it shows whether the cluster dissolves (adversarial) or persists (structural).
- The **advisory note** at the bottom highlights clusters that persist after exclusion — a gentle nudge that says "this cluster isn't just IronPulse99."
- The checkboxes pre-populate based on a heuristic: any cluster where IronPulse99's concentration exceeds the pool-adjusted threshold (4.69e-vi) starts checked. The player can override.

### Storage Model

```json
adversarial_tags: [
  {
    opponent: "IronPulse99",
    tagged_at: "Season 5, Analysis #2",
    tag_type: "per_cluster",
    cluster_scopes: [
      {
        agent: "STRIKER-A",
        cluster_id: "S5-A2-STRIKER-A-001",
        reason: "82% concentration, cluster dissolves on exclusion",
        status: "active"
      }
    ],
    excluded_clusters: ["STRIKER-A"],
    included_clusters: ["RELAY-B", "SCOUT-A"]
  }
]
```

The tag stores *which clusters are excluded*, not which are included. New clusters that appear in future analyses default to **included** — the player must explicitly extend the scope. This is the conservative default: new diagnostic signals are visible until the player decides otherwise.

### How It Interacts With the Concentration Cap (4.69e-iii)

The per-cluster tag and the concentration cap are **complementary but distinct**:

- The **concentration cap** is an automated rule: "suppress IronPulse99 when their concentration exceeds 50% in any cluster." It fires on any cluster that meets the threshold, present or future. It's a standing guard.
- The **per-cluster tag** is a manual judgment: "I've decided that IronPulse99's contribution to STRIKER-A specifically is adversarial." It fires only on the named cluster. It's a specific verdict.

**When both are set:** The per-cluster tag takes precedence for named clusters. If STRIKER-A is explicitly excluded by per-cluster tag, the cap's threshold is irrelevant for that cluster. If a new cluster appears that isn't in the per-cluster scope, the cap evaluates it normally.

**The interaction matrix:**

| Cluster | Per-cluster tag says... | Concentration cap says... | Result |
|---------|------------------------|---------------------------|--------|
| STRIKER-A | Exclude | Suppress (82% > 50%) | **Excluded** (tag wins) |
| RELAY-B | Include | Suppress (55% > 50%) | **Included** (tag wins — explicit include overrides cap) |
| SCOUT-A | Include | Include (18% < 50%) | **Included** (both agree) |
| NEW-CLUSTER-X | No opinion | Suppress (70% > 50%) | **Suppressed** (cap handles new clusters) |

This creates a clean separation: the cap handles unknown future clusters, the per-cluster tag handles known present clusters. The player's explicit judgment overrides automation for clusters they've examined, while automation guards against clusters they haven't seen yet.

---

## Option B: The Tag Matrix — "Opponent × Agent Grid"

### How It Works

Instead of scoping within the tag creation flow, a dedicated **Tag Matrix** view in Settings → Opponents presents all adversarial relationships as a 2D grid: opponents on rows, agent clusters on columns.

**The UI:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADVERSARIAL TAG MATRIX                                                     │
│                                                                             │
│  Rows: Tagged opponents       Columns: Current agent clusters               │
│                                                                             │
│                  │ STRIKER-A │ RELAY-B │ RELAY-C │ SCOUT-A │ CMD-α  │       │
│  ────────────────┼───────────┼─────────┼─────────┼─────────┼────────┤       │
│  IronPulse99     │  ⚑ 82%   │  · 55%  │  · 22%  │  · 18%  │  —     │       │
│  NebulaFang      │  · 15%   │  · 20%  │  ⚑ 78%  │  · 30%  │  —     │       │
│  DarkVolt        │  ⚑ 65%   │  ⚑ 70%  │  · 10%  │  · 12%  │  —     │       │
│                                                                             │
│  ⚑ = Excluded    · = Included    — = No cluster data                       │
│                                                                             │
│  Click any cell to toggle. Shift-click to toggle entire row (blanket tag).  │
│  Hover to see preview of cluster result with/without exclusion.             │
│                                                                             │
│  [Heatmap view]  [List view]  [Export]                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The heatmap view** colors cells by concentration intensity: cool blue for low concentration, warm amber for moderate, hot red for high. The ⚑ flags overlay on the heatmap, making it visually obvious where high-concentration cells are tagged (adversarial) vs. untouched (structural or irrelevant).

**Click interaction:** Clicking a cell toggles the ⚑ flag for that opponent × cluster pair. A brief 200ms animation — the ⚑ slides in from the right and the cell desaturates slightly — confirms the toggle. Hovering a cell before clicking shows a tooltip with the full preview (cluster with/without this opponent's matches, same data as Option A's inline preview).

**Shift-click on a row** toggles the entire row — equivalent to a blanket binary tag. The row fills with ⚑ flags in a left-to-right cascade animation (50ms per cell), which satisfies the "blanket exclusion is the common case" principle while making the per-cell option discoverable.

**Column behavior:** When the player's config changes and new clusters appear (or old ones dissolve), columns update. New columns appear at the right with no ⚑ flags. Dissolved columns fade to 50% opacity with a ~~strikethrough~~ on the cluster name, preserving the historical record. The player can clear dissolved columns with a "Remove dissolved" action.

### Strengths

- **At-a-glance overview.** The matrix makes it immediately visible who is tagged where, and what the entire adversarial landscape looks like across all agents. For a player managing 3-4 tagged opponents, this is a dashboard they can scan in seconds.
- **Batch operations.** Toggling multiple cells is fast. If the player decides IronPulse99 is adversarial across all clusters, shift-click one row. If they decide RELAY-C is compromised across all opponents, shift-click one column.
- **Discoverable patterns.** A column with ⚑ flags from multiple opponents might indicate a config that attracts targeting — a structural invitation. A row with ⚑ flags across most columns might indicate a pure adversary who should be blanket-tagged instead.

### Weaknesses

- **Requires dedicated navigation.** The matrix lives in Settings, not in the career analysis flow. The player must context-switch from "examining a cluster" to "configuring a matrix" — breaking the diagnostic workflow. Option A's inline integration keeps the player in context.
- **Cognitive scaling.** With 5 opponents × 6 clusters = 30 cells to potentially configure. This is manageable. But at 10 opponents × 10 clusters = 100 cells, the matrix becomes overwhelming. The design needs pagination, filtering, or column/row grouping to scale.
- **Cold start problem.** The matrix is empty until the player has both tagged opponents AND cluster data. For a new player who hasn't yet encountered adversarial behavior, the matrix is an empty grid with no teaching value. It only becomes useful after the player has developed enough competitive maturity to need it.

---

## Option C: The Implicit Scope — "Let the Cap Do It"

### How It Works

No new per-cluster tag UI at all. Instead, the existing concentration cap (4.69e-iii) is enhanced to behave per-cluster by default, and the player is taught to read the cap's per-cluster behavior as a de facto scoped tag.

**The argument:** The concentration cap already achieves per-cluster behavior automatically. If IronPulse99 is at 82% in STRIKER-A and 55% in RELAY-B, and the cap is set to 60%, STRIKER-A is suppressed and RELAY-B is included. The player doesn't need to tag individual clusters — they tune the single cap slider and the system does the per-cluster discrimination.

**The enhancement:** Instead of a single cap slider, the opponent's treatment panel shows a **per-cluster result table** that updates as the slider moves:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                            │
│                                                                             │
│  ○ Normal    ● ⚡ Cap: [==========●===] 60%    ○ ⚑ Exclude                 │
│                                                                             │
│  At 60% cap:                                                                │
│  ┌──────────────────────────────────────────────────────────┐               │
│  │  STRIKER-A  │ 82% ████████████░░░░░ │ SUPPRESSED │ ✓    │               │
│  │  RELAY-B    │ 55% ██████████░░░░░░░ │ included   │      │               │
│  │  SCOUT-A    │ 18% ████░░░░░░░░░░░░░ │ included   │      │               │
│  └──────────────────────────────────────────────────────────┘               │
│                                                                             │
│  Drag the slider to find the threshold where adversarial                    │
│  clusters are suppressed but structural ones remain.                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The teaching moment:** As the player drags the slider, they see clusters flip between "SUPPRESSED" and "included" at different threshold points. They learn to identify the "sweet spot" — the threshold value that cleanly separates adversarial from structural clusters. If no such sweet spot exists (two clusters flip at nearly the same threshold), that's diagnostic information too: the opponent's impact is ambiguous between adversarial and structural.

### Why This Might Be Enough

The concentration cap already provides per-cluster discrimination. The only case where a per-cluster tag is strictly necessary is when two clusters have the *same* concentration from an opponent but the player wants to treat them differently. This is the "55% in both STRIKER-A and RELAY-B but only STRIKER-A is adversarial" scenario.

**How often does this actually happen?** For the same opponent to have identical concentration in two different clusters, those clusters must:
1. Share roughly the same subset of matches contributing to them
2. Have the opponent's contribution be proportionally similar despite different agent behaviors

This is uncommon in practice. Different agent clusters, by definition, are detecting different diagnostic patterns — they're formed from different subsets of match data. The concentration of any given opponent varies naturally across clusters because the opponent's targeting behavior affects different agents differently.

### Why It Might Not Be Enough

The problem is categorical, not continuous. The player's judgment — "this is adversarial" vs. "this is structural" — is a binary classification informed by context the system doesn't have (watching replays, knowing the opponent's history, recognizing targeting patterns). A concentration threshold is a continuous proxy for a binary judgment. Sometimes the proxy works perfectly (82% is obviously adversarial, 18% is obviously not). Sometimes it doesn't (55% could go either way, and only the player knows which).

The cap forces the player to express a qualitative judgment ("adversarial vs. structural") through a quantitative control (slider percentage). When the two judgments map cleanly to different percentage ranges, the slider works. When they don't, the player is stuck.

---

## Option D: The Hybrid — "Cap Default, Override Per-Cluster"

### How It Works

The concentration cap (4.69e-iii) remains the primary mechanism. But each cluster row in the cap's preview table gains a **lock icon** that lets the player override the cap's judgment for that specific cluster.

**The UI:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                            │
│                                                                             │
│  ○ Normal    ● ⚡ Cap: [==========●===] 60%    ○ ⚑ Exclude                 │
│                                                                             │
│  At 60% cap:                                                                │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │  STRIKER-A  │ 82% │ SUPPRESSED │ ✓     │ 🔓 Locked: suppress   │      │
│  │  RELAY-B    │ 55% │ included   │       │ 🔓 Locked: include    │      │
│  │  SCOUT-A    │ 18% │ included   │       │ 🔓                    │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  🔓 = Cap-controlled (default)                                             │
│  🔒 Locked: include = always include regardless of cap                     │
│  🔒 Locked: suppress = always suppress regardless of cap                   │
│                                                                             │
│  Click any lock to cycle: auto → include → suppress → auto                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Lock states:**
- 🔓 **Auto** (default): The cap decides. If concentration exceeds the threshold, suppress; otherwise, include.
- 🔒 **Locked: include**: Always include this opponent's matches in this cluster, even if their concentration exceeds the cap. Used when the player knows the opponent is legitimately exposing a structural flaw.
- 🔒 **Locked: suppress**: Always suppress this opponent's matches in this cluster, even if their concentration is below the cap. Used when the player knows from context (replays, opponent history) that even a moderate concentration reflects adversarial targeting.

**Click interaction:** Clicking a lock icon cycles through the three states with a rotation animation — the lock icon rotates 120° as it transitions, landing on the new state with a soft click sound. The row's background tints slightly: neutral gray for auto, pale green for locked-include, pale red for locked-suppress.

### Why This Is the Recommended Design

The hybrid captures the best properties of all other options:

1. **Low floor.** A player who doesn't care about per-cluster granularity just sets the cap slider and ignores the locks. The default "auto" state means the cap handles everything. Zero additional cognitive cost.

2. **High ceiling.** A player who *does* care can lock individual clusters to override the cap. The override is always available, always visible, and always one click away.

3. **Gradual discovery.** The locks sit in the same preview table that already exists for the concentration cap (4.69e-iii). A player who's learned to read the preview table will eventually notice the lock icons and wonder what they do. No new screen, no navigation, no context switch.

4. **Clean interaction with the cap.** The cap is the default; locks are the exception. This mirrors how most players will use the system: the cap handles 90% of cases, and locks handle the 10% edge cases where the cap's statistical judgment doesn't match the player's qualitative judgment.

5. **No scaling problem.** The matrix (Option B) scales multiplicatively with opponents × clusters. The hybrid scales with the player's attention — they only lock clusters they've specifically examined and formed an opinion about. The rest remain auto.

### Storage Model

```json
adversarial_tags: [
  {
    opponent: "IronPulse99",
    tag_type: "cap",
    cap_threshold: 0.60,
    cluster_overrides: [
      {
        agent: "RELAY-B",
        override: "include",
        reason: "structural flaw confirmed via replay analysis",
        locked_at: "Season 5, Analysis #3"
      }
    ]
  }
]
```

---

## Player Journeys

### Journey: Yuna, 28, Data Analyst — First Per-Cluster Lock Discovery

**Context:** Season 6, mission 12 complete. Yuna has been playing ranked for 2 seasons. She tagged IronPulse99 as adversarial with a 55% concentration cap last season after discovering they were counter-configging her STRIKER-A. She's running her third career analysis of the season.

**Minute 0:00 — Career Analysis Opens**

Yuna opens Career Analysis from the season dashboard. The familiar summary loads: win rate 62%, eEDT trending upward, 2 cluster flags. At the top, the pale amber `⚑ 1 adversarial opponent excluded (cap 55%)` badge sits beside IronPulse99's name. She's used to this — it's been there all season.

She scrolls to the cluster section. STRIKER-A: no cluster detected (clean — IronPulse99's contribution suppressed). Good. But RELAY-B shows a persistent 3-element cluster: context buffer size, hook latency, signal compression ratio. It's been there for 3 analyses. The persistence counter shows `3/3` in amber.

**Minute 0:45 — The Confusion**

Yuna clicks RELAY-B's cluster to expand the Match-Source Breakdown. The pie chart shows: IronPulse99 38%, DarkVolt 25%, scattered opponents 37%. Wait — IronPulse99 is included in RELAY-B? She set a cap at 55%, and IronPulse99 is at 38% here — below the cap. The cap is working correctly. But...

She hovers over IronPulse99's slice. The tooltip shows: `38% concentration (below 55% cap — included)`. She frowns. She's watched the replays. IronPulse99 runs a specialized relay-flooding config that deliberately overwhelms RELAY-B's buffer — it's the same adversarial strategy they use against STRIKER-A, just less concentrated because RELAY-B has more match data diluting it. The 38% is still adversarial, just not adversarial *enough* to trigger the cap.

She considers lowering the cap to 35%. But she also knows that in SCOUT-A, IronPulse99 is at 32% — and that's legitimate competitive play, not targeting. Lowering the cap to 35% would suppress RELAY-B (good) but also suppress SCOUT-A (bad).

**Minute 1:30 — Discovering the Lock**

Yuna opens Settings → Opponents → IronPulse99 to adjust the cap. The concentration cap slider shows the familiar per-cluster preview table. She's seen it many times. But this time, she notices something she hasn't before: a small 🔓 icon at the right edge of each cluster row.

She hovers the lock on RELAY-B's row. A tooltip: `Currently: Auto (cap decides). Click to lock this cluster's include/suppress state independently of the cap.`

She clicks. The lock icon rotates — 🔓 becomes 🔒, and a micro-dropdown appears: `[Include always] [Suppress always]`. She clicks **Suppress always**. The lock settles with a satisfying click. RELAY-B's row background tints pale red, and the text changes: `38% — LOCKED: SUPPRESS (override)`.

She glances at SCOUT-A: `32% — included (below cap)`. Still 🔓 auto. She leaves it. The cap handles SCOUT-A correctly; only RELAY-B needed the override.

**Minute 2:15 — Applying and Verifying**

She clicks `Apply`. The career analysis refreshes. RELAY-B's cluster: now 2 elements instead of 3 — IronPulse99's matches removed. The persistence counter resets to `1/3` — a possible structural problem (2 elements from DarkVolt and others) but no longer an alarming persistent cluster. SCOUT-A: unchanged, IronPulse99's matches still included, no cluster detected.

Yuna smiles. For the first time, RELAY-B's diagnostic feels trustworthy. She knows the 2-element cluster is real signal worth investigating, not adversarial noise inflating the count.

**Minute 3:00 — The Aha Moment**

She opens the `⚑ adversarial exclusion summary` badge at the top of career analysis. It now reads: `⚑ IronPulse99: cap 55% + 1 cluster override`. Clicking it expands:

```
IronPulse99 (Operative II)
  Cap: suppress above 55%
  STRIKER-A: 82% → suppressed (above cap)
  RELAY-B: 38% → suppressed (locked override)
  SCOUT-A: 32% → included (below cap)
```

The summary is clean. She can see exactly what's happening per-cluster, in one glance. She takes a screenshot for her ranked notes and queues RELAY-B for next session's replay review.

**UI Annotations:**
- **Lock icon (🔓/🔒):** 16px, right-aligned in the cluster preview row. Three states: auto (gray), locked-include (green tint), locked-suppress (red tint). Click cycles with 200ms rotation animation. Tooltip on hover.
- **Row background tint:** 5% opacity color wash — red for suppress-locked, green for include-locked, transparent for auto. Provides at-a-glance visual differentiation without overwhelming the table.
- **Summary badge:** Appends `+ N cluster override(s)` text when any locks are set. Expandable to show full per-cluster breakdown.

---

### Journey: Marcus, 34, Competitive Player — The Dilemma of Identical Concentrations

**Context:** Season 8, Diamond tier. Marcus faces coordinated targeting from two opponents: VoltSurge (who floods his relays) and NeonGhost (who counter-configs his strikers). He's been managing both with concentration caps but just ran into a case where the cap can't handle.

**Minute 0:00 — The Problem Materializes**

Marcus runs career analysis after a difficult 15-match session. Three clusters flag. He opens the Match-Source Breakdown for each:

- **STRIKER-B cluster:** NeonGhost 61%, others 39%. Clearly adversarial. Cap at 55% handles this — NeonGhost suppressed.
- **RELAY-C cluster:** VoltSurge 61%, others 39%. This one he's less sure about. VoltSurge uses relay-flooding, yes — but RELAY-C has been weak for two seasons. Other opponents trigger the cluster too.
- **CMD-α cluster:** NeonGhost 58%, others 42%. CMD-α is Marcus's command agent — his pride. He's convinced this cluster is structural. He changed CMD-α's context filter last season, and the weakness is real. NeonGhost just happens to exploit it more than others.

**Minute 0:30 — The Cap Conflict**

Marcus stares at his two NeonGhost clusters: STRIKER-B at 61% (adversarial) and CMD-α at 58% (structural). He currently has a cap at 55% for NeonGhost. This suppresses STRIKER-B (good) — but also suppresses CMD-α (bad). He wants to see NeonGhost's matches in CMD-α to understand the structural weakness.

He can't raise the cap to 60% without including STRIKER-B. He can't lower it below 58% without excluding CMD-α. The two clusters are 3 percentage points apart. There's no cap value that correctly handles both.

**Minute 1:00 — Finding the Lock Solution**

Marcus has used the cap slider many times but hasn't locked a cluster before. He opens NeonGhost's treatment panel. The preview table shows:

```
STRIKER-B  │ 61% │ SUPPRESSED │ 🔓
CMD-α      │ 58% │ SUPPRESSED │ 🔓
RELAY-A    │ 22% │ included   │ 🔓
```

He clicks the lock on CMD-α. Cycles to **Include always**. The row turns pale green. CMD-α's text changes: `58% — LOCKED: INCLUDE (override)`.

He then opens VoltSurge's treatment panel. RELAY-C at 61%, cap at 55%. Currently suppressed. But Marcus has studied the replays — RELAY-C's weakness is real. VoltSurge exploits it, but so does everyone else. He locks RELAY-C to **Include always**. Pale green.

**Minute 1:45 — Verifying the New State**

He returns to career analysis and refreshes. The cluster results recalculate:

- **STRIKER-B:** NeonGhost's matches suppressed. Cluster drops to 1 element — adversarial noise removed. ✓
- **CMD-α:** NeonGhost's matches included. Cluster persists at 4 elements, 67% coverage. Real structural problem confirmed. Marcus nods — this is exactly what he expected. Time to redesign CMD-α's context filter.
- **RELAY-C:** VoltSurge's matches included. Cluster persists at 3 elements. Another real structural issue. He adds RELAY-C to his redesign queue.

The session health dashboard now shows: `Structural clusters: 2 (CMD-α, RELAY-C). Adversarial artifacts: 0.` Clean signal.

**Minute 2:30 — The Competitive Insight**

Marcus opens the Threat Model Report (4.57). NeonGhost's section now shows a refined picture: `Targets: STRIKER-B (confirmed adversarial — locked suppress). Exploits structural weakness: CMD-α (not targeting, locked include).` The distinction between "targeting" and "exploiting" is visible for the first time. Marcus screenshots this for his next counter-config session.

He realizes something: the lock system doesn't just fix diagnostic noise — it forces him to articulate his understanding of each opponent's behavior. Every lock is a hypothesis. If he locks CMD-α to "include" and later discovers NeonGhost IS specifically targeting CMD-α (not just exploiting it), he can flip the lock. The lock makes his judgment visible, reviewable, and changeable.

**UI Annotations:**
- **Cap conflict indicator:** When two clusters from the same opponent are on opposite sides of the cap threshold by <5%, a small ⚠ appears next to the slider: `Two clusters within 3% of cap — consider per-cluster locks for finer control.` This teaches the player that locks exist when they hit the exact problem locks solve.
- **Lock counter in summary:** `NeonGhost: cap 55% + 1 override (CMD-α: include)`. Visible at a glance.

---

### Journey: Tomas, 16, First-Time Competitive Player — Confusion and Recovery

**Context:** Season 3, Silver tier. Tomas just got his first adversarial opponent tag recommendation from the compound detection system (4.69e-iii-a). He's never tagged an opponent before.

**Minute 0:00 — The System Recommends a Tag**

Career analysis surfaces a banner: `⚠ Compound adversarial pattern detected: player "ShadowByte" appears to be targeting your RELAY-A config across multiple match types. [Review] [Dismiss]`

Tomas clicks [Review]. The confirmation drawer opens — the standard adversarial tag UI (4.69e-ii), pre-filled with ShadowByte's data. He sees the radio toggle: `○ All clusters ○ Per-cluster`. He's not sure what "per-cluster" means. He clicks "All clusters" and flags ShadowByte.

**Minute 0:30 — Immediate Relief**

Career analysis refreshes. The RELAY-A cluster that's been bugging him for 3 sessions disappears. His persistence counter resets. Clean. He's happy.

**Minute 2:00 — Three Sessions Later**

After three more ranked sessions, Tomas notices something weird. His SCOUT-B agent is underperforming, but career analysis shows no clusters. He toggles "Include adversarial" and the SCOUT-B cluster reappears: ShadowByte at 35% concentration, plus two other opponents. The cluster is real — SCOUT-B has a weakness — but it was hidden because ShadowByte's blanket tag removed all their matches.

Tomas remembers the "Per-cluster" option he skipped. He opens Settings → Opponents → ShadowByte. He sees the cap slider (which he hadn't set — his tag is a full binary exclusion). He switches from `Exclude` to `Cap` and sets it at 50%. Now the preview shows:

```
RELAY-A  │ 72% │ SUPPRESSED │ 🔓
SCOUT-B  │ 35% │ included   │ 🔓
```

He doesn't need the locks — the cap cleanly separates the two clusters. But he sees the 🔓 icons and hovers one. `Click to lock this cluster's state independently of the cap.` He files this away mentally: if he ever hits a case where the cap can't separate two clusters, the locks are there.

**Minute 3:00 — The Learning Completed**

Tomas returns to career analysis. RELAY-A cluster: gone (ShadowByte suppressed above cap). SCOUT-B cluster: visible, 3 elements, ShadowByte included. He can now diagnose SCOUT-B properly.

The path was: binary tag → over-exclusion → discovery of cap → cap solves it. The per-cluster locks remain undiscovered for now — correctly, because Tomas doesn't need them yet. The system taught itself through the failure of the simpler tool.

**UI Annotations:**
- **"Include adversarial" toggle position:** Top-right of career analysis panel, always visible. A small cyan toggle with a ⚑ icon. When toggled on, suppressed data appears with a translucent red overlay to distinguish it from primary data.
- **Progressive disclosure:** The binary tag is offered first (simplest). The cap is one level deeper (Settings → Opponents). The per-cluster locks are embedded within the cap's preview table. Each layer is discovered when the player outgrows the previous one.

---

## Interaction Effects

### With 4.69j — Per-Agent Threshold Override

Per-agent threshold override (4.69j) lets the player set different cluster detection thresholds for different agents. Per-cluster adversarial exclusion operates on the same dimension — per-agent granularity — but affects *data filtering* rather than *detection sensitivity*.

**Potential conflict:** A player who sets a high cluster detection threshold for STRIKER-A (making it harder to trigger) AND locks a per-cluster adversarial exclude on STRIKER-A is applying two layers of noise reduction. The risk: over-filtering hides real signals. The detection threshold says "ignore small clusters" and the adversarial lock says "ignore this opponent's contribution." Combined, they could suppress a meaningful cluster by reducing its element count below the detection threshold.

**Mitigation:** When a per-cluster lock is set and the remaining cluster would fall below the detection threshold, show a warning: `After excluding IronPulse99, STRIKER-A cluster has 2 elements — below your detection threshold of 3. The cluster will not appear in career analysis. [Lower threshold for STRIKER-A?]`

### With 4.69e-viii — Tag Expiry and Automatic Sunset

If adversarial tags expire after N seasons, per-cluster locks should expire with them. But there's a subtlety: a per-cluster lock might be attached to a cap that remains active. If the cap doesn't expire but the lock does, the cluster reverts to cap-controlled behavior — which might suppress it if concentration is above the cap.

**Recommendation:** Per-cluster locks expire on the same schedule as the parent tag/cap, but the review prompt should surface per-cluster locks specifically: `Your lock on RELAY-B (IronPulse99: include always) is 2 seasons old. Your config has changed. [Review lock] [Keep lock] [Remove lock]`

### With 4.69e-v — APS Computation

Per-cluster locks affect how adversarial density is calculated. If IronPulse99 is locked-include for RELAY-B, should their matches against RELAY-B count as "adversarial" for APS computation?

**The answer depends on the lock's semantics:** A locked-include says "this opponent is not adversarial *for this cluster*." That doesn't mean they're not adversarial overall. APS should compute at the opponent level, not the cluster level — if IronPulse99 has a cap + any cluster locks, they're still counted as an adversarial opponent for APS purposes. The per-cluster lock adjusts *diagnostic filtering*, not *adversarial classification*.

### With 4.69e-vi — Pool-Size Calibration

In small pools, the pool-size calibration adjusts expected concentrations. Per-cluster locks override this calibration for specific clusters. The interaction is clean: pool-size calibration affects the auto (cap) behavior, and locks bypass it. No conflict.

---

## Strengths and Weaknesses Summary

| Dimension | Option A (Scope Drawer) | Option B (Tag Matrix) | Option C (Cap Only) | Option D (Hybrid Lock) |
|-----------|------------------------|----------------------|--------------------|-----------------------|
| Cognitive cost | Medium | High | Low | Low-Medium |
| Discovery | Good (inline) | Poor (separate screen) | N/A (no new feature) | Good (embedded in existing cap UI) |
| Expressiveness | Full per-cluster | Full per-cluster + batch | Limited by single threshold | Full per-cluster |
| Scaling | Good | Poor at >50 cells | Perfect | Good |
| Learning curve | One new concept | New paradigm | None | One new concept (lock) |
| Integration | Inline in tag flow | Separate view | N/A | Inline in cap flow |

**Recommendation: Option D (Hybrid Lock).** It adds minimal new UI to the existing concentration cap while providing full per-cluster expressiveness. The lock is a single concept that layers cleanly on top of the cap. Progressive disclosure is natural: most players never touch locks, some players use them for edge cases, competitive veterans use them routinely.

---

## Sensory Description

**The lock rotation animation:** When the player clicks a lock icon, it doesn't just toggle — it *rotates*. The lock body spins 120° clockwise with an easing curve (fast start, slow settle). At the midpoint, a soft metallic click sounds — not a heavy clunk, more like a precision instrument engaging. A watch mechanism, not a deadbolt.

**The row tinting:** As a lock settles into its new state, the row background tints over 300ms. Suppress-locked rows wash with a color like watered-down port wine — barely there, but warm enough to register. Include-locked rows wash with a color like diluted mint — cool, faintly reassuring. Auto rows are untinted. Across a table of 5 clusters, the pattern of tints creates an at-a-glance fingerprint of the player's adversarial judgments.

**The cap conflict warning:** When two clusters straddle the cap threshold within 5%, a thin dashed line appears on the slider at the threshold value, and two tiny cluster labels float above and below it: `STRIKER-B 61%` above, `CMD-α 58%` below. The labels pulse gently when the slider is near the conflict zone — amber pulses that say *you're close to a decision boundary.* Moving the slider past either cluster's percentage triggers a subtle haptic bump (on supported devices) — the feel of a detent, like tuning a radio to a station.

**The summary badge evolution:** As the player adds locks, the adversarial summary badge in career analysis grows. It starts as `⚑ 1 opponent excluded` — clean, simple. With a cap, it becomes `⚑ 1 opponent (cap 55%)`. With locks, it becomes `⚑ 1 opponent (cap 55% + 2 locks)`. Each addition extends the badge with a tiny animation — the new text slides in from the right, character by character, like a teletype. The badge is a living record of the player's growing sophistication.

---

## Comparable Games and Media

**Chess.com's "Avoid Player" feature:** The closest real-world analog to per-opponent tagging. Chess.com lets you avoid matching against a specific player for 15 minutes after a match. It's binary (avoid/don't avoid) and temporary. Robot Uprising's per-cluster tagging is vastly more granular — not just "avoid this opponent" but "avoid this opponent's influence on this specific diagnostic."

**Spotify's "Hide Song" vs. "Don't Play This Artist":** Spotify offers two levels of exclusion: hide a specific song (granular) or block an entire artist (blanket). This maps directly to per-cluster lock (hide a specific cluster) vs. binary tag (block the opponent entirely). Users intuitively understand that an artist might have one song they hate and others they enjoy — the same mental model applies to an opponent who is adversarial in one dimension and legitimately challenging in another.

**Firewall rules:** The lock system mirrors the structure of firewall configuration: a default policy (the cap threshold) with per-rule overrides (allow/deny on specific ports). Network administrators understand this layered model intuitively. For players with technical backgrounds (Robot Uprising's target demographic), the analogy is immediate: "my cap is the default policy, and my locks are specific rule overrides."

**Git's `.gitignore` with `!` negation:** `.gitignore` lets you ignore a pattern and then negate the ignore for specific files: `*.log` followed by `!important.log`. The cap is the ignore pattern; the include-lock is the `!` negation. The suppress-lock is adding a more specific ignore rule. Git users will recognize this pattern instantly.

---

## The TikTok Clip

A 15-second clip: The player stares at a cluster that keeps appearing in career analysis. They drag the concentration cap slider left, right — two clusters on the preview table keep swapping between SUPPRESSED and included, never both correct at the same time. Cut: the player discovers the lock. One click. The lock rotates with that satisfying metallic click. One cluster locks to include, the other stays suppressed. The preview table settles — green tint on one row, red on another, both correct. The player exhales. Text overlay: *"When the slider can't decide, you decide."*
