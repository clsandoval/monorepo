# Multi-Scenario Minimum Fix Explorer (PvE Robustness)

**Aspect:** 4.36 — Multi-scenario Minimum Fix Explorer for PvE robustness missions: instead of "what change flips this match," ask "what change improves pass rate across the most failing scenarios simultaneously"; ranking changes by pass-rate delta rather than binary flip; the fix that wins 7/10 failing scenarios is more architecturally meaningful than the fix that wins 1; harder computation, stronger teaching signal.

**Parent:** 4.20 — Counterfactual Simulation as Advanced Debrief Feature
**Siblings:** 4.37 — Fork-and-deploy shortcut; 4.38 — Counterfactual history as config evolution record; 4.40 — First-viable-fix vs. minimum-fix toggle
**Related:** 1.04e — 100-test-case robustness pattern; 2.28 — Scenario fingerprinting; 4.14 — Scenario parameter panel; 8.07 — Robustness vs. efficiency tension; 5.19 — Pass-rate plateau problem

---

## The Core Concept

The single-match Minimum Fix Explorer (4.20) answers: **"Would this one small fix have flipped this specific loss?"** It finds the minimum mutation to a config that changes one binary outcome.

PvE robustness missions have no single match. They have a distribution of scenarios — 10, 25, or 100 randomized test cases, each with different enemy counts, approach vectors, timing variations, and constraint budgets. A player who fails 35/100 scenarios cannot ask "which change flips this match?" because there is no single match to flip.

The Multi-scenario Minimum Fix Explorer answers a different question: **"Which single config change improves the most failing scenarios simultaneously?"**

This is a harder computation, a more generalizing teaching signal, and a more architecturally meaningful diagnostic. Finding a fix that resolves the dominant failure cluster (22 failing scenarios share a root cause) is not the same as finding a fix that barely resolves one edge case. The MSMFE ranks candidate changes by **pass-rate delta** — the number of additional scenarios that would pass with this change applied — not by binary outcome flip.

The distinction between the two explorers mirrors a distinction in real engineering practice:
- **Single-match explorer** = "find the bug that caused this specific test failure"
- **Multi-scenario explorer** = "find the fix that resolves the most failing tests in the test suite simultaneously"

The second is what you do when you've run a full test run and 35 tests are red. You don't pick one red test and binary-search it. You look at the failure cluster, identify the underlying shared cause, and write one fix that closes the whole cluster.

Robot Uprising makes this professional discipline a visceral game mechanic.

---

## Computational Architecture

### The Naive Approach (Too Slow)

The single-match explorer runs:
```
150 candidate changes × 1 match × ~200ms = 30 seconds
```

Applied naively to the multi-scenario context:
```
150 candidate changes × 35 failing scenarios × ~200ms = 17 minutes
```

That's unacceptable for an interactive debrief feature. The player cannot wait 17 minutes.

### The Smart Approach: Cluster-First Sampling

The multi-scenario explorer does not run all failing scenarios for every candidate change. It uses a three-phase approach:

**Phase 1 — Cluster Identification (0–2 seconds):**
The game already ran all 100 scenarios. The failure data is in memory. The explorer reads the failure cluster annotations (produced by the debrief system during scenario processing) and identifies the dominant failure cluster — the largest group of failing scenarios that share a root cause variable (same approach direction, same enemy count range, same budget tier).

For a 35-scenario failure set, there are typically 1–3 dominant clusters. The dominant cluster accounts for 60–80% of failures.

**Phase 2 — Cluster-Representative Search (5–12 seconds):**
Instead of testing against all 35 failing scenarios, the explorer selects 3–5 representative cases from the dominant cluster. These are the "characteristic failures" — the ones that most cleanly express the cluster's failure mode. Each candidate change is tested against these representatives only.

```
150 candidate changes × 4 representative cases × ~200ms = 2 minutes → too slow still
```

Further optimization: the representative scenarios are already simulated (the player already watched them in the debrief). The fork only needs to simulate from the EDT of each representative case, not from tick 0. This reduces each simulation to ~50–80ms.

```
150 candidate changes × 4 representative cases × ~70ms = ~42 seconds
```

Acceptable. The explorer can display results while continuing to run.

**Phase 3 — Full Validation (background, 1–3 minutes):**
Once Phase 2 identifies promising candidates (changes that resolve the representative cases), Phase 3 validates them against the full set of failing scenarios. This runs in the background while the player examines the Phase 2 results. The full validation result updates the result list with a more precise pass-rate delta: "resolves 22/35 failing scenarios" rather than "resolved 4/4 representatives."

### What the Player Sees During Computation

The explorer panel shows a two-stage progress indicator:
```
Phase 1 — Identifying failure clusters...  ✓ Done (1.2s)
Phase 2 — Testing 150 candidates against 4 representative cases...  [███░░░░░░░] 47%
Phase 3 — Validating against all 35 failing scenarios...  (will start after Phase 2)
```

Phase 2 results appear in the list as they arrive — the player doesn't wait for the full search. Early results with partial validation get a `~` prefix ("~resolves 3/4 representatives") that upgrades to a precise count once Phase 3 validates it ("resolves 22/35 failing scenarios").

This design keeps the player engaged with arriving results rather than staring at a progress bar.

---

## What the Explorer Reports

The MSMFE panel shows a ranked list of candidate changes ordered by **pass-rate delta** — the number of additional scenarios that would pass if this change were applied.

```
Multi-Scenario Fix Explorer — 4 solutions found

1. SCOUT-01 › trigger: ENEMY_IN_SECTOR(NORTH) → ENEMY_IN_ZONE(perimeter_any)  [trigger generalization]
   Resolves 22/35 failing scenarios  (+22 pass rate)
   Cluster: "Direction-specific trigger" (south/east approach failures)
   Remaining failures after this fix: 13/100

2. RELAY-B › Hook "forward-alert": add fallback target STRIKER-A when primary STRIKER-B unavailable  [routing fallback]
   Resolves 11/35 failing scenarios  (+11 pass rate)
   Cluster: "Routing dead end" (striker unavailability failures)
   Remaining failures after this fix: 24/100

3. COMMAND › Buffer: 4 → 5 slots  [buffer expansion]
   Resolves 9/35 failing scenarios  (+9 pass rate)
   Cluster: "Buffer overflow" (late-match buffer exhaustion failures)
   Remaining failures after this fix: 26/100

4. SCOUT-01 › Rule 2: fidelity threshold 60% → 55%  [threshold adjustment]
   Resolves 5/35 failing scenarios  (+5 pass rate)
   Cluster: "Confidence filter over-restriction" (low-fidelity signal rejection failures)
   Remaining failures after this fix: 30/100
```

The list is ordered by pass-rate delta, not by change minimality (as in the single-match explorer). The fix that resolves 22 scenarios ranks first even if solution 2 is technically a "smaller" change. This reflects the MSMFE's fundamental principle: **coverage is the objective, not minimality**.

**Cluster annotations:** Each result shows which failure cluster it resolves. This is the key pedagogical surface — it directly connects the candidate fix to its failure cluster, making the causal link explicit. The player is not just seeing "change this value and more scenarios pass" — they're seeing "this specific type of failure was caused by this architectural assumption."

**"Remaining failures after this fix":** Shows the player what's left after the best fix is applied. If fix 1 brings them from 65/100 to 87/100, is that good enough to pass the mission gate? This number makes the decision concrete.

---

## The Two-Cluster Workflow

The MSMFE's most important emergent feature is the **iterative two-step fix discovery**:

**Step 1:** Player runs MSMFE. Dominant fix resolves 22/35 failures (cluster: direction-specific triggers). Player applies fix 1. Now at 87/100.

**Step 2:** Player runs MSMFE again on the remaining 13 failing scenarios. The dominant fix for the residual cluster resolves 11/13 (routing dead end). Player applies fix 2. Now at 98/100.

**Step 3:** Two scenarios remain failing. MSMFE finds no single-element fix for them. They require architectural changes — these are the 2% edge cases.

This workflow is fundamentally different from the single-match explorer's linear debugging process. It's a **progressive architectural refinement** workflow: identify the dominant failure cluster, close it, identify the next cluster, close it. Repeat until the remaining failures are irreducible edge cases or architectural issues.

The workflow teaches: **Most failure distributions have structure. Fix the dominant cluster, then the residual. Don't try to fix all failures simultaneously — identify what's clustered.**

This maps directly to the real engineering practice of triage and prioritization in incident response: close the biggest issue first, then address the long tail.

---

## The "0 Solutions" Case in Multi-Scenario Context

When the MSMFE finds no single-element fix that improves any failing scenario, the diagnosis is more nuanced than in the single-match case:

```
Multi-Scenario Fix Explorer — 0 single-element solutions found.

All 35 failing scenarios require multi-element config changes to resolve.
Failure clusters detected:
  - "Direction-specific trigger" (22 scenarios): requires trigger generalization
  - "Routing dead end" (13 scenarios): requires hook topology change (add fallback)

Recommendation: These failures are structural, not parametric.
Each cluster needs architectural changes that cannot be expressed as a single field edit.
Consider rebuilding the affected components using the workbench.
```

This is a stronger diagnostic than the single-match "0 solutions" message — it identifies *each cluster* that needs attention and labels them as structural, not parametric. The player knows exactly what's wrong; they just know it requires a bigger change than the explorer can apply in isolation.

The distinction between "no fix exists" and "the fix is multi-element" is communicated clearly. The player is not stuck — they have a diagnosis. They know they need to change their scout's trigger from position-specific to zone-based, and separately add a fallback to the routing hook. Those are two architectural changes, each simple on their own.

---

## The Coverage Map Visualization

In addition to the ranked results list, the MSMFE optionally displays a **Coverage Map** — a visual showing which fix resolves which failing scenarios.

The coverage map is a grid: rows are candidate fixes (top 5), columns are failing scenarios (up to 35). A filled square indicates "this fix resolves this scenario."

```
              Scenario cluster: Direction   Routing   Buffer
Fix 1 (direction trigger)     ████████████░░░░░░░░░░░░░░░░░░░░░
Fix 2 (routing fallback)      ░░░░░░░░░░░░████████████░░░░░░░░░
Fix 3 (buffer expansion)      ░░░░░░░░░░░░░░░░░░░░░░░░░░████████
Fix 1+2 combined              ████████████████████████░░░░░░░░░
```

The coverage map immediately reveals:
1. **Non-overlapping fixes** — Fix 1 resolves the direction cluster, Fix 2 resolves the routing cluster. Together they cover all but the buffer-overflow cluster.
2. **Redundant fixes** — If Fix 1 and Fix 3 both resolve many of the same scenarios, the player doesn't need both — pick the more fundamental one.
3. **The uncoverable residual** — The scenarios that no single fix covers appear as empty columns across all rows. These are the structural failures.

The coverage map also shows what happens if two fixes are combined — a "Fix 1 + Fix 2" row auto-generates, showing the combined coverage. This is not a two-element fix in the explorer's sense (the explorer only enumerates single-element changes), but it's the logical next step: "apply fix 1, then fix 2, then run MSMFE again on what's left."

---

## What the UI Looks Like

### Entry Point

The MSMFE panel appears in the robustness debrief — specifically after the pass/fail grid has rendered and failure clustering has been annotated. The standard Minimum Fix Explorer button (from single-match debrief) is **replaced** in the robustness context with the MSMFE button.

The button label makes the difference explicit:

```
[⑂ Run Fix Explorer]                    ← single-match context label
[⑂ Run Multi-Scenario Fix Explorer]     ← robustness context label
```

The button only becomes active after failure clustering completes (Phase 1 of the explorer needs the cluster data). A brief "analyzing failure clusters…" state displays while Phase 1 runs.

### Explorer Panel Layout

The MSMFE panel occupies the right third of the debrief screen, alongside the pass/fail grid on the left and the timeline in the center. Three sections:

**Section 1 — Progress (top)**
Two-line phase indicator (Phase 1 ✓, Phase 2 progress bar, Phase 3 pending). Small counter: "Testing 47/150 candidates…"

**Section 2 — Results list (middle, scrollable)**
Ranked results with cluster labels and pass-rate delta numbers. Each result has:
- An icon indicating the change type (same color coding as single-match explorer: blue for routing, amber for parameter, purple for filter, green for buffer)
- The agent, element, and change description
- The pass-rate delta in large, readable text: "+22 scenarios"
- The cluster label in smaller text below
- A "▶ Preview" button that loads the ghost overlay for a representative scenario from the resolved cluster

**Section 3 — Coverage Map (bottom, collapsible)**
A 5×N grid (top 5 fixes × failing scenarios), with cluster-labeled column bands. Collapsible — intermediate players won't need it, veterans will use it immediately.

### The Ghost Overlay in Multi-Scenario Context

Unlike the single-match ghost overlay (which compares one original match to one forked match), the MSMFE ghost overlay shows a **batch comparison**:
- 4 representative failing scenarios run in parallel (2×2 grid or sequential with a tab bar)
- Each shows original (grey) vs. forked (color)
- The specific agent whose change was applied is highlighted in both panels

The batch comparison answers: "Is this fix consistent across the representative cases, or does it only work in some?"

If the fix works in 3/4 representatives but fails on 1, the panel shows: "This fix works for 3 of 4 representatives. The exception (Case #37) has concurrent attacks from two directions — this fix may not handle simultaneous approaches."

---

## Player Journeys

### Journey 1: Maya, 24, Software Developer — First Multi-Scenario Explorer

**Context:** Mission 5 — "Ambush Protocol." Maya has cleared Missions 1–4. This is her first mission with a full 100-case randomization suite and multiple failure clusters. She's been playing 3 sessions, understands hooks, is comfortable with the single-scenario debrief.

**The Setup**

Maya runs her configuration. 71/100 — 29 failures. She's seen the debrief before. She reads the clustering annotation: two clusters. "Direction failures: 22 cases. Routing dead end: 7 cases." She knows how the single-match explorer works (she used it in Gauntlet). She notices the button says "Multi-Scenario Fix Explorer" this time. She clicks it.

**Minute 0:10 — Explorer Running**

Phase 1 completes instantly (clusters already identified). Phase 2 starts: "Testing 150 candidates against 5 representative cases…"

While waiting, Maya looks at the coverage map. It's showing in real-time as Phase 2 runs — each row fills in as candidates are tested. She can already see a pattern: one fix is lighting up most of the direction-cluster columns in green.

**Minute 0:48 — Phase 2 Complete**

Two clear results:

```
1. SCOUT-01 › trigger: ENEMY_IN_SECTOR(NORTH) → ENEMY_IN_ZONE(perimeter_any)   +22 scenarios
   Cluster: "Direction-specific trigger"

2. RELAY-C › Hook "dispatch": add fallback routing when STRIKER-B unavailable    +7 scenarios
   Cluster: "Routing dead end"
```

Maya stares at this. She recognizes result 1 immediately — she changed this in a much earlier version of her config and then accidentally overwrote it when trying to optimize. The zone trigger was the correct approach from the beginning; she'd drifted back to a position-specific trigger without noticing.

Result 2 she doesn't recognize. She clicks "▶ Preview" for result 2.

**Minute 1:10 — Ghost Overlay: Representative Routing Failure**

Four small scenario previews appear. In all four grey versions, RELAY-C sends the dispatch hook to STRIKER-B — which is already engaged in combat. The hook is received but STRIKER-B ignores it (busy flag active). The signal is lost. Nobody flanks. In all four color-fork versions, the fallback routing kicks in: when STRIKER-B is busy, the dispatch goes to STRIKER-A instead. The flank succeeds.

Maya's immediate reaction: "Oh, STRIKER-B was in use. I should have had a fallback." She hadn't modeled STRIKER-B as a shared resource that could be occupied. She'd assumed it was always available.

**Minute 2:00 — Applying Both Fixes**

Maya doesn't use Fork-and-Deploy — she navigates to the workbench manually and makes both changes herself. She wants to find the elements in her own architecture. She applies the trigger generalization in 30 seconds (she knows where it is). She finds the routing hook and adds the fallback in 45 seconds.

She re-runs. 100/100.

**What the MSMFE taught her beyond the single-match explorer:**
1. Her architecture had *two* distinct failure clusters, not one. The single-match explorer on any individual failure would have found one fix; the MSMFE found both architectural issues in the same pass.
2. The "+22 scenarios" and "+7 scenarios" numbers told her exactly how much each fix was worth. She could have applied just fix 1 (87/100, meeting a hypothetical 85% gate) and understood what she was leaving behind.
3. The ghost overlay batch comparison (4 representative cases, not 1) confirmed that the routing fix was consistent across all routing failures, not just one.

**UI Annotations:**
- Coverage map: 5×29 grid, each cell 6px, cluster bands labeled "DIRECTION (22)" and "ROUTING (7)" with amber bracket annotations matching the debrief style
- Ghost overlay batch tab bar: "Case #14, #22, #38, #51 (representatives)" — clicking each tab loads that case; "All 4" auto-cycles through them at 1.5× speed
- Pass-rate delta: shown in 24px bold green text — large enough to read without hovering

---

### Journey 2: Dev, 38, Middle-School Teacher — Casual Gamer Encountering the MSMFE

**Context:** Mission 6 — "Full Perimeter." Dev has been working through the campaign over two weeks. He's at 63/100 on his third attempt. He's frustrated because he feels like he's "almost there" but can't see what he's missing. The pass/fail grid shows a chaotic-looking pattern — he doesn't see a cluster.

**Minute 0:00 — Looking at the Grid**

Dev clicks a few red squares randomly. Three different failures — enemy from south, concurrent attacks, a striker that just doesn't engage. He doesn't understand why. He clicks the MSMFE button without knowing what to expect.

**Minute 0:30 — Phase 2 Completes**

The top result:

```
1. SCOUT-02 › position: move from GRID(12,3) to GRID(12,7)   +18 scenarios
   Cluster: "Southern approach dead zone"
```

Dev doesn't understand "position: move from GRID(12,3) to GRID(12,7)" at first. He clicks "▶ Preview."

**Minute 0:45 — The Ghost Overlay Explains It**

He sees it immediately in the batch preview — in all the grey failing versions, enemies enter from the south and his SCOUT-02 doesn't react. Its coverage zone doesn't reach far enough south. In the color fork, SCOUT-02 is positioned three grid units further south, and its coverage zone now catches the southern approach. It detects. Hook fires. Strikers engage.

Dev laughs. "He's too far away." His scout was in the wrong spot. Not a hook problem, not a rules problem — just a deployment position that didn't cover the southern approach.

He navigates to the pre-battle deployment screen (the game links him there with a "Adjust deployment" button in the explorer panel). He moves SCOUT-02 south. Re-runs. 81/100.

**Minute 2:00 — Second Run: Still Clustered**

New failure pattern. He runs MSMFE again. Top result:

```
1. STRIKER-A › Rule: add minimum-health check before engaging  [condition addition]
   +11 scenarios
   Cluster: "Overextended striker"
```

Preview: STRIKER-A is chasing enemies into open ground without checking its own health. It gets flanked and destroyed, leaving the objective undefended. The fork version includes a health-check rule: if health < 30%, return to base instead of pursuing.

Dev applies it. 94/100.

He decides to stop there. The mission gate is 85%. He's well above it. He moves to Mission 7.

**What the MSMFE did for Dev:**
It gave him a concrete, actionable first step from an overwhelming 37-scenario failure cloud. He didn't need to understand all 37 failures — he needed to know the biggest thing wrong. The explorer filtered the chaos into two clear fixes, one per session. Each fix had a human-legible explanation visible in 45 seconds of ghost overlay. He never needed to understand the full technical architecture of his failure; he just needed to know where to move the scout and what rule to add.

**The MSMFE as an accessibility lever:** For non-technical players, the multi-scenario explorer reduces a complex distribution of failures to a single actionable change. It doesn't require understanding *why* failures are clustered — it just surfaces the fix that matters most. This is the right design for the casual player tier.

**UI Annotations:**
- "Adjust deployment" button: appears in the explorer panel when the top result involves a positional change; deep-links to the deployment layout screen with the affected agent highlighted
- Pass-rate delta in plain English below the technical description: "This change would fix approximately 18 of your 37 failing scenarios" (not "+18 scenarios")
- Explorer panel title for Dev's level: "What to try next" (not "Minimum Fix Explorer" — rename in casual mode)

---

### Journey 3: Keiko, 19, Competitive Gamer — Expert MSMFE Workflow

**Context:** Mission 9 — "Adaptive Incursion" — a tier-3 randomization mission with constraint-varied fabrication budgets, variable enemy counts (4–12), and four approach vectors. Keiko is at 88/100 on her second attempt. She's methodical. She wants 100/100. The 12 remaining failures need to be systematically diagnosed.

**Minute 0:00 — Entering the MSMFE as a Diagnostic Tool**

Keiko doesn't go straight to the results. She opens the coverage map first and studies the failure cluster breakdown before Phase 2 completes.

She sees three clusters: "Budget constraint (4 scenarios)," "High-count concurrent (6 scenarios)," "Late-match eviction (2 scenarios)." These are three completely independent failure modes — her architecture has three distinct weaknesses.

**Minute 0:25 — Phase 2 Results**

```
1. COMMAND › Rule: add fabrication-check before spawn trigger   +4 scenarios
   Cluster: "Budget constraint" (all 4 resolved)

2. SCOUT › Context config: buffer 4 → 5 slots   +3 scenarios
   Cluster: "High-count concurrent" (partial — 3/6 resolved)

3. STRIKER assignment rule: replace static with nearest-available   +5 scenarios
   Cluster: "High-count concurrent" (partial — 5/6 resolved)
   Note: Overlaps with Fix 2 — applying Fix 3 makes Fix 2 redundant for most cases.
```

**The Expert's Read**

Keiko immediately notices: Fix 2 and Fix 3 both address the same cluster but through different mechanisms. Fix 2 (larger buffer) handles the information problem — agents run out of slots when receiving data about 12 simultaneous enemies. Fix 3 (dynamic assignment) handles the throughput problem — static assignment can't route 12 enemies to 4 strikers efficiently.

The "Overlaps with Fix 2 — applying Fix 3 makes Fix 2 redundant" note is the key insight. Fix 3 is the more fundamental fix. If she has dynamic assignment, the buffer problem becomes less critical because assignments process faster and buffer entries cycle out before overflow.

She applies Fix 1 (fabrication-check) and Fix 3 (dynamic assignment). She doesn't apply Fix 2 — the overlap note told her it wasn't necessary.

**Minute 1:30 — Third Run: 96/100**

4 scenarios still failing. She runs MSMFE. One remaining failure cluster: "late-match eviction (2 scenarios)" as expected, and 2 new failures she hadn't seen before.

Explorer result for the new cluster:

```
1. RELAY-B › Eviction policy: swap COMMS below TERRAIN  [priority swap]
   +2 new failures resolved
   Cluster: "Stale terrain data evicting active comms"
```

The new failure: late in the match, her relay's buffer is nearly full, and it's evicting communication signals (comms) in favor of keeping terrain data. This is an eviction priority setting she'd never touched — she'd left the default. At tick 80+ when the buffer is running hot, the wrong data type is being preserved.

**Minute 2:30 — 100/100**

The final 2 scenarios (late-match eviction from the original cluster) are resolved by a buffer-size increase that the explorer independently identifies. Total changes across three runs: 4 single-element changes, each identified by the MSMFE, each resolving its entire cluster.

**Keiko's post-100 reflection (annotated in her notes):**

```
Mission 9 diagnosis:
Run 1 (88/100): 3 independent failure clusters.
  - Budget constraint: fixed with fabrication-check rule (trivial)
  - High-count concurrent: fixed with dynamic assignment (structural)
  - Late-match eviction: left for next run

Run 2 (96/100): 1 new cluster appeared when high-count concurrent was fixed.
  - Stale terrain eviction: comms being evicted by terrain data at tick 80+
    → Fixed eviction priority: COMMS above TERRAIN
  - Late-match eviction: buffer expansion

Run 3 (100/100)

Key lesson: Three completely independent failure modes. None was caused by the others.
Fixing one cluster revealed a previously-masked cluster.
```

**What the MSMFE taught Keiko:**

The sequential application of fixes can **unmask hidden failure modes**. In her first run, all 12 failures looked like "concurrent attack failures." But fixing the concurrent-attack fix revealed that 2 of the "failures" were actually late-match eviction failures that were previously masked by the concurrent-attack failures occurring earlier in the same scenarios.

This is **failure masking** — a known phenomenon in software testing where one bug prevents a later bug from being reached in the same test case. The multi-scenario MSMFE surfaces this pattern because running the explorer after each fix reveals the residual cluster structure rather than the combined cluster structure.

**UI Annotations:**
- Overlap note: appears in small italic text below fix descriptions when two candidate fixes address the same cluster; explains which is more fundamental
- Run history: the MSMFE keeps a session history panel showing previous runs, their results, and what was applied; Keiko can see "Run 1 fixes: fabrication-check ✓ applied, dynamic assignment ✓ applied" as context for Run 2
- 100/100 state: the grid turns teal, a brief ascending tone, the session history panel shows all four applied fixes with a total improvement arc: "65/100 → 88/100 → 96/100 → 100/100 (+3 explorer sessions)"

---

## Strengths and Weaknesses

### Strengths

**Teaches the most important engineering skill in the game.** The multi-scenario MSMFE forces the player to think in terms of failure distributions, not individual failures. This is the single most transferable skill from Robot Uprising to real agentic AI engineering — production systems fail in distributions, not in specific instances. Every time a player resolves a failure cluster rather than fixing a single failing case, they're practicing the right cognitive habit.

**Reveals failure cluster independence.** Most players assume their architecture has one problem when they fail 35/100 cases. The MSMFE systematically proves that they typically have 2–3 independent failure modes. This corrects a common bias — "there must be one thing wrong" — that leads to increasingly complex fixes when the real issue is multiple independent simple problems.

**Failure masking discovery.** Sequential MSMFE application surfaces failure modes that were masked by more dominant failures in the first run. This is a rare mechanic — most debugging tools only show the top-level failure. The MSMFE's progressive reveal of residual clusters (after each fix is applied) teaches the professional practice of "run the test suite after each fix, not just at the end."

**The "+N scenarios" metric is immediately legible.** Unlike the single-match explorer's binary "would have won / wouldn't have won," the pass-rate delta is a concrete, meaningful number. "+22 scenarios" out of 35 failures is 63% cluster resolution — immediately legible as "this one fix does most of the work." Players can make triage decisions ("I only need 85% to pass the gate; Fix 1 gets me there") without running the full fix.

**Coverage map as architectural X-ray.** The coverage map makes the structure of failures visible in a way the failure cluster annotations alone cannot. Players who look at the coverage map see immediately whether their failure set is two independent clusters (two separate column bands) or one cluster with cascading causes (a single column band where multiple fixes apply to the same scenarios). This distinction changes the fixing strategy entirely.

**Computational feasibility argument for determinism (stronger than 4.20).** If the single-match explorer demonstrated that determinism enables counterfactual reasoning, the multi-scenario explorer demonstrates it at scale. Running 5,250 mini-simulations in 45 seconds is only possible with the fully-deterministic tick scheduler. An LLM-native model cannot do this without enormous API cost and 30+ minutes of compute time. The MSMFE is the apex argument for determinism as a *feature*.

### Weaknesses

**Cluster identification quality determines everything.** The explorer is only as good as the failure clustering. If the clustering algorithm misidentifies clusters (labels two independent failures as one cluster, or splits one cluster into two), the fix recommendations will be misleading. The failure clustering system (from the robustness scenario debrief) must be robust before the MSMFE can be trusted.

**The "false fix" problem is more severe.** In the single-match explorer, a false fix (one that resolves this specific match but doesn't generalize) is caught by subsequent Gauntlet matches. In the multi-scenario context, a false fix could resolve 22/35 test cases while introducing a new failure mode in 10 previously-passing cases. The explorer must test candidate fixes against *all* 100 scenarios (not just the 35 failing ones) to detect regression. Phase 3 should include: "this fix resolves 22 failing scenarios and does not break any currently-passing scenarios."

**Decision paralysis for complex failure sets.** When the explorer finds 5+ candidate fixes for multiple clusters, the player faces a decision tree: apply fix 1 then re-run? Apply fix 1 and fix 2 together? Try fix 3 instead of fix 2? The explorer should include a "Recommended sequence" path for new players: "Apply fix 1 first (highest pass-rate delta), then re-run the explorer on remaining failures." This sequence is not the optimal strategy for all players, but it's the correct starting point.

**Not applicable to Gauntlet mode.** The MSMFE is exclusively a PvE robustness feature. In Gauntlet (PvP), there are no randomized scenarios — there is one specific opponent config. Players who understand the MSMFE in PvE must understand that the single-match explorer is the correct tool for Gauntlet losses. The two explorers must be clearly differentiated in the UI so players don't expect multi-scenario functionality in PvP contexts.

**Coverage map complexity ceiling.** The coverage map is readable up to ~5 fixes × ~40 failing scenarios. Beyond that, it becomes a wall of tiny squares. For missions with 100+ failing scenarios (a very low-performing run), the coverage map needs a "zoom to cluster" mode — show only the largest cluster's scenarios rather than all 100 failures.

---

## Interaction Effects

### Multi-Scenario Explorer + Failure Clustering (1.04e)
The MSMFE is downstream of the failure clustering system. It cannot function without cluster identification. Failure clustering identifies *what* is wrong; the MSMFE identifies *how to fix it*. These are complementary — the debrief teaches through failure, the explorer teaches through directed repair. Neither works without the other in the robustness context.

### Multi-Scenario Explorer + Scenario Fingerprinting (2.28)
Scenario fingerprinting (giving each of the 100 test cases a persistent visual identity — a color tag or seed number) makes the coverage map significantly more useful. Instead of anonymous column indices, the coverage map columns would show the scenario's fingerprint tag, allowing players to recognize "failure cluster A always involves Scenario #TigerRed and its variants." Named scenarios create cognitive handles for failure modes.

### Multi-Scenario Explorer + Pass-Rate Plateau (5.19)
The pass-rate plateau problem (players who reach 80/100 and feel done) is directly addressed by the MSMFE. The "+N scenarios" delta metric makes it immediately clear how much each remaining fix is worth. A player at 80/100 who sees "Fix 1: +12 scenarios, Fix 2: +5 scenarios, Fix 3: +3 scenarios" knows they can reach 100/100 in three steps. The remaining work is legible, not abstract. This destroys the "it feels too hard to get from 80% to 100%" psychological barrier.

### Multi-Scenario Explorer + Fork-and-Deploy (4.37)
The Fork-and-Deploy shortcut (one-click application of the winning fork from the explorer) has a more nuanced interaction in the multi-scenario context. Applying fix 1 should not automatically also apply fix 2 — because the player needs to re-run after each fix to understand the residual cluster structure. The MSMFE's fork-and-deploy button should apply **one fix** and then automatically re-run the explorer on the remaining failures, creating the sequential diagnostic workflow rather than a bulk "apply all fixes" shortcut.

### Multi-Scenario Explorer + Robustness vs. Efficiency Tension (8.07)
The MSMFE operates exclusively in the pass-rate dimension, not the efficiency dimension. A fix that increases pass rate from 65/100 to 87/100 but adds 200 cycles per scenario is equally valid to a fix that achieves the same pass rate with no cycle cost. The explorer should display the efficiency delta alongside the pass-rate delta for efficiency-aware players: "+22 scenarios, +180 avg cycles per scenario." This surfaces the robustness/efficiency tradeoff explicitly without forcing it on players who don't care.

### Multi-Scenario Explorer + Deterministic Execution (2.00a)
The MSMFE is the strongest argument for the fully-deterministic execution model at the architectural level. Running 5,000+ mini-simulations in under a minute requires: (1) no I/O per simulation, (2) no graphics per simulation, (3) fast state serialization/deserialization, (4) reproducible execution from any saved state. These are properties that only a deterministic tick scheduler provides. An LLM-based execution model would require N × M API calls with ~1–5 second latency each — completely infeasible. Hybrid models (2.00c) could support the deterministic portion but couldn't account for LLM-generated decisions. The MSMFE is the feature that makes the entire determinism argument concrete and visceral.

---

## Comparable Games and Media

### Software: Property-Based Testing (QuickCheck, Hypothesis)
Property-based testing frameworks generate hundreds of random inputs to a function and report which inputs cause failure. The multi-scenario MSMFE's relationship to PvE missions is the property-based testing relationship to code: instead of testing one fixed example, run against a distribution of generated inputs and find which inputs reveal failures. The explorer is the automated fault localization layer on top of property-based test output — not just "here are the failing inputs" but "here's the minimum mutation that fixes the most failing inputs simultaneously." Hypothesis (Python) has a feature called "shrinking" that finds the minimal failing input; the MSMFE is "shrinking" applied to config changes rather than test inputs.

### Sports Analytics: Correcting Systematic Weaknesses
Professional sports analytics teams don't just analyze individual game failures — they analyze which opposing strategy types consistently beat a team and identify the minimum tactical adjustment that closes the largest gap. The 2015 Golden State Warriors film-room culture is the reference: systematic identification of defensive schemes that lost them games, followed by targeted adjustments, rather than gut-feel wholesale changes after each loss. The MSMFE applies the same methodology to robot configurations.

### Software Testing: Mutation Testing Score
Mutation testing frameworks (PIT, Mutmut) score a test suite by generating program mutations and measuring how many the tests catch. High mutation score = tests are sensitive to code changes. Robot Uprising's MSMFE inverts this: given a set of failing "mutations" (scenarios where the architecture fails), find the minimum change to the architecture that "catches" (resolves) the most mutations. It's mutation testing turned inside out — from "are your tests sensitive?" to "what is your architecture's blind spot?"

### Factorio: Belt Throughput Bottleneck Analysis
Experienced Factorio players analyze their factory's throughput by running it at full production and watching where items back up. They then look for the single belt segment or inserter rate that's bottlenecking the most throughput (the factory's dominant constraint, in the Theory of Constraints sense). The MSMFE applies the same principle: which single config element is the dominant constraint on pass rate? Fix that element first. Then find the next constraint.

### Incident Response: Prioritized Remediation
After a production incident with multiple contributing causes, SRE teams triage fixes by "which change prevents the most similar incidents in the future?" — not "which change specifically prevented this incident?" A patch that prevents 70% of incidents in this class is higher priority than a patch that specifically addresses the exact sequence that caused this one incident. The MSMFE formalizes this triage discipline as a game mechanic, teaching prioritized remediation as the natural way to respond to failure distributions.

---

## Sensory Description

**The MSMFE panel opening:**
Same hydraulic slide-in sound as the single-match explorer — this is the same family of tool. But the panel header has a subtle difference: instead of a single fork icon, a branching tree icon (one root, multiple branches each with a small outcome indicator). It says "many paths" rather than "one fork." The background tint is the same timeline-blue but with a slight green gradient at the bottom — hinting at the coverage-optimization nature of the feature.

**Phase 1 — Cluster identification:**
A single brief animation: the pass/fail grid on the left (still visible in the corner) has amber bracket annotations appear simultaneously with a soft click — as if a pattern-recognition algorithm just recognized the structure. The cluster labels materialize letter-by-letter in 0.3 seconds. This is the game "reading" the failure data.

**Phase 2 — The candidate search:**
The progress bar has a different visual treatment than the single-match explorer. Instead of binary digits scrolling left-to-right, the bar fills in a "coverage" pattern — segments of different widths appear in green, representing clusters being checked. When a candidate resolves a new cluster segment, that segment snaps into bright green with a clear click. The sound profile: deeper, more resonant clicks than the single-match explorer, because the decision space is larger. The pace is slightly slower — one click every 0.3 seconds rather than every 0.1 seconds. The emotional difference between "fast machine" and "thorough machine."

**The results list arriving:**
Results appear with a more prominent reveal animation than the single-match explorer — each row slides down from above with a brief green flash on the pass-rate delta number. The "+22 scenarios" text appears in a cooler green than the single-match "win/loss" binary — it's a quantitative signal, not a binary signal. The green is data, not celebration.

**The coverage map activating:**
When the coverage map first renders, the grid appears empty (white), then each cell fills in simultaneously across all rows — a brief fractal bloom from the center outward, fast enough to be aesthetic rather than functional (0.4 seconds). The cell fill colors: green for "resolved by this fix," grey for "not resolved," amber for "resolved by a different fix in the same run." The amber cells tell the player that some of the other fixes cover this territory too.

**The "+0" moment (no fixes found):**
A low, slow descending tone. Not the crisp failure click of the single-match explorer — more like a closing chord, unresolved. The panel header changes from blue-green to amber. The message appears in amber text rather than yellow — slightly warmer, communicating "this is worth understanding" not "this is an error." The accompanying diagram changes: instead of the cluster brackets, the diagram shows the failure scenarios connected to "multi-element required" nodes — visually indicating that these failures are structurally interconnected.

**The 100/100 terminal state (after MSMFE-guided iteration):**
The pass/fail grid's final teal wash has an additional beat: the coverage map (if open) also flashes teal simultaneously. A harmonic chord — the single-match explorer's resolving two-note chord plus a lower third note, creating a triad. More complete than the single match resolution. The session history panel shows the full arc: each run's starting pass rate, the fixes applied, the ending pass rate. The arc is displayed as a staircase chart — 65/100 → 87/100 → 96/100 → 100/100 — each step labeled with the fix applied. This staircase is the visual narrative of progressive architectural refinement.

---

## The TikTok Clip

**15-second scenario:** Player at 65/100. Opens MSMFE. Progress bar with two-phase indicator. Phase 1 pops instantly: "2 clusters identified." Phase 2 runs — 10 seconds of ascending progress. Result: "Fix 1: +22 scenarios." Player clicks "▶ Preview." Batch ghost overlay shows 4 scenarios: grey versions all fail in the same place (scout doesn't react to southern approach), color versions all succeed. Player applies fix. Re-runs. 87/100. They run MSMFE again. "Fix 2: +11 scenarios." They apply it. Re-run. 100/100. Grid turns teal. Text overlay: "two separate problems, two single-line fixes, 35 failures → 0. The machine found both in under a minute."

This clip works because:
1. "2 clusters identified" is dramatic — most players assumed they had one problem
2. The batch ghost overlay (4 cases, not 1) communicates "this fix works *in general*, not just once"
3. The two-run arc (65 → 87 → 100) shows that the explorer iterates with the player, not just once
4. "Two separate problems, two single-line fixes" is the visceral payoff — precision over chaos
5. The teal grid flash at the end is emotionally satisfying and clips cleanly

---

## Discovered Aspects

**4.41 — Cluster-masked failure discovery:** The phenomenon where fixing the dominant failure cluster reveals a previously-invisible sub-cluster (because prior failures in those scenarios terminated earlier, masking the later failure). Design question: should the game *warn* the player that fixing the dominant cluster may reveal new failures, or is the discovery experience more valuable without warning? The warning reduces surprise; the discovery builds insight. When does "surprise" become "frustration"?

**4.42 — Cross-mission failure pattern recognition:** After a player accumulates debrief data across 5+ missions, the game can identify recurring failure patterns across missions — "you have had the 'direction-specific trigger' cluster appear in Missions 3, 5, and 7. This suggests a systematic architectural assumption about enemy approach direction." Cross-mission pattern recognition as a career-level diagnostic feature; interaction with 4.25 EDT trajectory career metric.

**4.43 — MSMFE as mission designer tool:** During mission design (when the game eventually supports community-created missions), running the MSMFE against a designed mission's scenario distribution tells the designer whether the mission has clustered failure modes with clean fixes (good mission — teaches clear lessons) vs. chaotic failures with no dominant cluster (unclear mission — what is it teaching?). The MSMFE inverted: from "find the fix for my failure" to "is my mission's failure landscape teachable?"

**4.44 — The "regression check" during Fork-and-deploy:** When applying a fix via Fork-and-deploy, explicitly running the fix against all 100 scenarios (not just the failing 35) to check for newly-introduced failures in previously-passing scenarios. A brief "regression check" phase (5–10 seconds) before completing the apply action. If the fix breaks 3 previously-passing scenarios while fixing 22, the result is "+22 fixed, -3 regressed, net +19." This is the test suite regression principle applied to config changes.
