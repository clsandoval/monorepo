# Comparative Career Analysis Between Config Versions

**Aspect:** 4.71 — "If I had stayed on v2.3 and applied the career minimum fix vs. rebuilding to v3.8 — which would have produced better cross-match results?"; counterfactual on architectural strategy rather than parametric choices; requires counterfactual history (4.38).

**Parent:** 4.59 — Career minimum fix cross-match analysis
**Siblings:** 4.70 — Career analysis filtered by opponent archetype; 4.72 — "Debt-free" season achievement
**Related:** 4.38 — Counterfactual history; 4.25 — EDT trajectory as career metric; 4.69g — Agent cluster career stats; 4.37 — Fork-and-deploy

---

## The Core Problem

The career minimum fix (4.59) answers: **"What single change to my current config would have helped the most across my match history?"** The counterfactual history (4.38) preserves every config version ever deployed, storing the full fork tree of architectural decisions. Together they produce a powerful diagnostic — but they leave one question unanswered, the question that haunts every player who has ever torn down a working architecture and rebuilt from scratch:

**"Was the rebuild worth it?"**

Every player who reaches the Gauntlet's middle ranks faces this dilemma at least once. Their config is v2.3 — it works, it has known weaknesses, and the career minimum fix has identified the relay buffer slot that would patch 7 of 10 losses. The fix is incremental. Apply it. Move to v2.4. Keep iterating.

But the player has also been sketching a completely different architecture on paper. A different routing philosophy. Different agent roles. A ground-up rebuild that would become v3.0. The rebuild promises to solve not just the relay buffer problem but to eliminate the entire class of relay-dependent failures. It requires 15-20 matches of retuning before it stabilizes.

The player rebuilds. They eat 15 matches of losses while the new architecture finds its legs. Their eEDT craters. Their Gauntlet rank drops 200 positions. By match 20, the new config stabilizes at v3.8 and their win rate recovers — maybe even exceeds the old v2.3 baseline by a few percent.

But the nagging question persists: **what if they had just applied the relay buffer fix to v2.3 and kept iterating?** Would they have reached the same performance level faster? Was the ground-up rebuild the right strategic call, or did they burn 15 matches of progress on an ego-driven rewrite when an incremental patch would have served?

This is not a question about parameters. The career minimum fix handles parameters. This is a question about **architectural strategy** — the meta-level decision of when to patch vs. when to rebuild. It is the question that separates experienced engineers from novices in software, and it should separate experienced Robot Uprising architects from novices too.

The comparative career analysis answers this question concretely. It takes two config lineages — the path-not-taken (v2.3 + career minimum fix applied retroactively) and the path-taken (the actual rebuild to v3.8) — and simulates both against the same match history. It produces a side-by-side comparison: which architectural strategy would have produced better cross-match results?

The result is not always what the player expects. Sometimes the rebuild was clearly superior. Sometimes the incremental patch would have outperformed. Sometimes the two paths converge to nearly identical performance — revealing that the choice between patch and rebuild was architecturally neutral, and the real variable was the 15 matches of lost practice time during the transition.

---

## The Design

### The Branch Comparator

The comparative career analysis is accessed through the **Counterfactual History** panel (4.38), not through the Career Analysis button. The counterfactual history already displays the player's config version tree — a branching timeline of every config ever deployed, with fork points, merge points, and abandoned branches. The comparative analysis adds a new interaction to this tree: **Branch Compare**.

The player selects two nodes on the config tree by holding Shift and clicking. The first node is the **baseline** — the config version at the moment of the architectural decision. The second node is the **endpoint** — any later config version on either branch. A context menu appears: **"COMPARE BRANCHES (est. ~8 min)"**.

When the player clicks Compare, the system constructs two counterfactual lineages:

**Path A — The Road Taken:** The actual config evolution from baseline to endpoint. Every match between those two points is simulated with the config version that was active at the time of that match. This data already exists — it is the player's real match history. No simulation needed.

**Path B — The Road Not Taken:** The baseline config, with the career minimum fix (as computed at the time of the baseline) applied retroactively. This "patched baseline" is then simulated against every match in the same date range. Because the patched baseline is a single config (not an evolving one), every match is simulated against the same fixed config.

The result is a side-by-side comparison:

```
BRANCH COMPARISON — v2.3 → v3.8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        PATH TAKEN        PATH NOT TAKEN
                        (rebuild v3.8)    (v2.3 + fix)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Matches analyzed:       22                22
Wins (simulated):       14 (64%)          12 (55%)
Average EDT:            0.48              0.41
Transition cost:        15 losses         0 losses
Break-even match:       Match 17          —
Net advantage:          +2 wins           —
Verdict:                REBUILD JUSTIFIED (marginal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### The Transition Cost Metric

The most novel metric in the comparison is **transition cost** — the number of matches between the baseline decision point and the moment the new config's rolling win rate exceeds the patched baseline's simulated win rate. This is the "break-even match" — the point at which the rebuild investment pays off.

A rebuild with a break-even at match 5 was clearly worth it: the new architecture found its footing quickly and the transition was cheap. A rebuild with a break-even at match 35 — or worse, one that never breaks even — is an architectural indictment. The player spent 35 matches of career progress on a rebuild that produced equivalent or worse results than simply applying the known fix to the old config.

The transition cost number is displayed prominently because it is the most emotionally resonant metric in the comparison. Players who rebuilt because they were bored of v2.3 and wanted something new will see the exact cost of that decision in matches lost. Players who rebuilt because the career analysis showed a structural ceiling will see whether their intuition about the ceiling was correct.

### The Verdict System

The comparison panel includes a single-line **verdict** that classifies the architectural decision:

- **REBUILD JUSTIFIED (dominant):** Path Taken wins more matches AND has higher average EDT. The rebuild was unambiguously correct.
- **REBUILD JUSTIFIED (marginal):** Path Taken wins more matches but the advantage is small (< 10% win rate delta) or EDT is lower. The rebuild was slightly better but not transformatively so.
- **REBUILD NEUTRAL:** Both paths produce within 5% win rate of each other. The choice was architecturally neutral — the 15 matches of transition cost were the primary difference.
- **PATCH WOULD HAVE SUFFICED:** Path Not Taken wins more matches than Path Taken. The rebuild was unnecessary — the incremental fix would have produced better results with zero transition cost.
- **INSUFFICIENT DATA:** Fewer than 10 matches in the comparison window. The analysis is inconclusive.

The verdict is never hidden or softened. It is a factual assessment of the architectural decision, stated plainly. Players who made the wrong call see it clearly. This is consistent with Robot Uprising's philosophy of honest, unflinching diagnostic feedback.

### The Crossover Chart

Below the summary table, a chart plots both paths' cumulative win counts over the match range. The X-axis is match number (1 through N). The Y-axis is cumulative wins. Two lines: Path Taken (solid, the game's standard violet) and Path Not Taken (dashed, amber).

The lines diverge at the baseline decision point. In a typical rebuild scenario, Path Taken drops below Path Not Taken early (the transition cost — the player is losing while retuning) and then may cross over (the rebuild begins outperforming). The **crossover point** is marked with a small diamond glyph — the same gold diamond used for EDT in the match timeline, repurposed here as "the moment the architectural investment paid off."

If the lines never cross — Path Not Taken stays above Path Taken for the entire match range — no diamond appears. The absence of the diamond is its own statement.

### Multi-Branch Comparison

Advanced players may want to compare more than two branches. The system supports selecting up to four config versions for simultaneous comparison: the actual path taken, plus up to three counterfactual alternatives (e.g., v2.3 + fix A, v2.3 + fix B, v2.3 + a different rebuild direction). Each path gets its own line in the crossover chart and its own column in the summary table.

This is computationally expensive — four paths across 22 matches requires 4 x 22 x 200ms = 17.6 seconds of simulation, plus the career minimum fix computation for each branch. The estimated time is shown before the player commits.

---

## Player Journeys

### Journey 1: Rafael, 28, data engineer, Architect-tier Gauntlet player

**Context:** Rafael has been running v2.3 for 40 matches. Win rate: 55%. His career analysis has shown the same relay buffer fix for three consecutive runs. He is planning a ground-up rebuild — a new architecture centered on dual-scout routing instead of relay chains. He wants to know if the rebuild is worth it.

**Minute 0:00 — The Pre-Decision Snapshot**

Rafael opens the Counterfactual History panel. His config tree shows the familiar linear trunk: v1.0 through v2.3, each a small node along a vertical timeline. He has not branched yet. The trunk terminates at v2.3, which has a small amber debt badge: "RELAY-C — RECURRING FIX — 3 ANALYSES."

He right-clicks v2.3 and selects "SNAPSHOT FOR FUTURE COMPARISON." A small bookmark glyph appears on the v2.3 node — a pale blue pin. The system stores the current career minimum fix result (relay buffer +1 slot, coverage 7/10) alongside the config snapshot.

He then deploys his new v3.0 config.

**Minute 0:00 — 15 matches later**

Three weeks have passed. Rafael's new architecture has stabilized at v3.4 after four iterations. Win rate during transition: 38%. Current win rate on the last 10 matches: 61%. The relay debt badge is gone — the new architecture does not use relays at all.

He opens the Counterfactual History panel. The config tree now shows a fork at v2.3: one branch leads to v3.0 through v3.4 (the path taken), the other is an implied phantom branch — v2.3 with the bookmarked career fix, never actually deployed.

He Shift-clicks the v2.3 bookmark and then clicks v3.4. The context menu appears: "COMPARE BRANCHES (est. 6 min)."

He clicks it.

**Minute 0:30 — The Simulation Runs**

A split-screen panel opens. The left half is labeled "PATH TAKEN: v2.3 → v3.4 (actual)." The right half is labeled "PATH NOT TAKEN: v2.3 + relay fix (simulated)." Both halves show progress bars.

The Path Taken side fills instantly — no simulation needed, these are real match results. A cumulative win line begins drawing itself, 15 data points.

The Path Not Taken side begins simulating. Each match ticks through: the progress bar advances, and a running win count updates. After 30 seconds, the first 5 matches are simulated. The patched v2.3 would have won 3 of the first 5. Rafael's actual v3.0 won 1 of the first 5.

Rafael watches the two lines diverge. Path Not Taken is ahead.

**Minute 3:00 — The Crossover**

At match 12 (of 15 simulated), the Path Taken line catches up. Rafael's actual v3.4 has been winning consistently since match 10 — the architecture stabilized. The patched v2.3 is still winning at its historical rate of ~55%.

At match 13, the lines cross. A gold diamond appears on the crossover chart. Path Taken overtakes Path Not Taken.

**Minute 6:00 — The Verdict**

The full comparison table populates:

```
                        PATH TAKEN        PATH NOT TAKEN
                        (v3.4 actual)     (v2.3 + relay fix)
Matches analyzed:       15                15
Wins (simulated):       9 (60%)           8 (53%)
Average EDT:            0.44              0.39
Transition cost:        7 losses          0 losses
Break-even match:       Match 13          —
Net advantage:          +1 win            —
Verdict:                REBUILD JUSTIFIED (marginal)
```

Rafael stares at the verdict. "Marginal." One extra win. Seven matches of painful losses during the transition. The rebuild was barely better than applying the patch.

But then he looks at the EDT line: 0.44 vs. 0.39. The new architecture plays deeper into matches. And the trajectory matters — the patched v2.3 was flat at 0.39 EDT, while v3.4's EDT is climbing. Given 15 more matches, the gap will widen.

He screenshots the comparison and saves it to his config notebook. He writes: "Rebuild justified but barely. The relay fix would have been 90% as good with zero risk. Next time: apply the patch first, rebuild second."

**UI Annotations:**
- Snapshot bookmark: a small blue pin icon (12x12px) placed on the config node in the tree; tooltip: "Bookmarked at [date] with career fix: [element] [change]"; maximum 5 active bookmarks; older bookmarks auto-archive but remain accessible
- Split-screen comparison panel: 960x640px overlay; left and right halves separated by a thin vertical rule in dark grey; each half has its own header, progress bar, and running stats; the crossover chart spans the full width below both halves
- Crossover diamond: the same gold diamond glyph from the EDT timeline (visual vocabulary continuity); appears with a 200ms scale-up animation and a soft chime — the "determination chime" repurposed for architectural determination

---

### Journey 2: Priya, 35, product manager, casual Gauntlet player

**Context:** Priya rebuilt her config from v1.8 to v2.0 six weeks ago after a frustrating losing streak. She did not bookmark v1.8 first — she just tore it down and started over. Her new config is v2.3 and performing at 48% win rate, about the same as v1.8 was. She suspects the rebuild was pointless.

**Minute 0:00 — Discovering the Feature**

Priya opens the Counterfactual History panel for the first time. She has never used it before. The panel shows her config tree: a short trunk from v1.0 through v1.8, then a fork to v2.0 through v2.3.

She notices that v1.8 has a faint dashed line extending from it — the system has automatically inferred a "phantom branch" for v1.8 + career minimum fix, because the counterfactual history stored the career analysis result that was active at the time of the rebuild.

A tooltip on the phantom branch: "At the time you rebuilt from v1.8, the career analysis suggested: Scout hook threshold -2 (coverage: 6/8 matches). Compare what would have happened if you had applied this fix instead of rebuilding."

Priya did not know this data existed. She clicks the phantom branch.

**Minute 0:30 — Automatic Comparison**

The system pre-populates a comparison: v1.8 + scout hook fix vs. v2.3 (her current config). Because the career fix was stored with the counterfactual history, no manual setup is needed.

A comparison panel appears. It estimates 4 minutes.

**Minute 4:30 — The Uncomfortable Result**

```
                        PATH TAKEN        PATH NOT TAKEN
                        (v2.3 actual)     (v1.8 + scout fix)
Matches analyzed:       18                18
Wins (simulated):       9 (50%)           11 (61%)
Average EDT:            0.36              0.42
Transition cost:        8 losses          0 losses
Break-even match:       NEVER             —
Net advantage:          —                 +2 wins
Verdict:                PATCH WOULD HAVE SUFFICED
```

The crossover chart shows two lines. Path Not Taken (dashed amber) sits above Path Taken (solid violet) for the entire 18-match range. No gold diamond. The lines never cross.

Priya reads the verdict: "PATCH WOULD HAVE SUFFICED."

She exhales. The rebuild cost her 8 matches of losses during the transition AND produced a config that is still performing worse than the old config would have with one incremental fix applied.

**Minute 5:30 — The Recovery Option**

Below the comparison table, a small panel appears: "RECOVERY OPTIONS." Two buttons:

- **"RESTORE v1.8 + apply fix"** — Forks from v1.8, applies the scout hook threshold -2, deploys as a new config version (v1.9). The player's v2.3 remains in history but is no longer active.
- **"STAY ON v2.3"** — Dismisses the comparison. The player keeps their current architecture.

Priya hesitates. She has spent six weeks on v2.3. It feels like admitting defeat to roll back. But the numbers are clear.

She clicks "RESTORE v1.8 + apply fix."

A confirmation dialog: "This will deploy a new config version based on v1.8 with 1 change applied: Scout hook threshold -2. Your v2.3 config remains in your history and can be restored at any time. Continue?"

She confirms. The config tree updates: a new node appears branching from v1.8, labeled "v1.9 (restored + fix)." The active config badge moves to v1.9.

**Minute 7:00 — The First Match**

Priya queues into the Gauntlet with v1.9. The pre-match panel shows: "Config v1.9 — restored from v1.8 with 1 career fix applied." A small amber note: "This config has not been tested in live matches since the restore. Expect recalibration."

She plays. She wins. The familiar v1.8 architecture is back, but the scout responds differently — the hook threshold change is subtle, but matches feel less brittle in the mid-ticks.

She does not know whether one win proves anything. But she feels lighter. The six-week detour has been acknowledged, measured, and reversed.

**UI Annotations:**
- Phantom branch: dashed line extending from any config node that had an active career analysis result at the time of a fork; rendered in amber (matching the "path not taken" color); appears automatically without player configuration; tooltip explains the stored career fix
- "PATCH WOULD HAVE SUFFICED" verdict: rendered in the same amber as the phantom branch; the text does not include qualifiers or apologies — it states the factual result; a small footnote: "Based on simulated replay of [N] matches against both configs"
- Recovery buttons: appear only when the verdict is "PATCH WOULD HAVE SUFFICED" or "REBUILD NEUTRAL"; they are never forced — always dismissible; the restore option creates a new version node, never overwrites history
- Restore node on the config tree: a distinctive glyph — a small circular arrow icon indicating "returned to an earlier branch"; color: pale blue, matching the bookmark pin; connects to the original node with a curved line that visually represents the return path

---

### Journey 3: Tomasz, 40, systems architect, Commander-tier veteran

**Context:** Tomasz has been playing Robot Uprising for 8 months. He maintains a config notebook with detailed architectural retrospectives. He has performed three major rebuilds: v1.x to v2.x (Month 2), v2.x to v3.x (Month 4), v3.x to v4.x (Month 6). He wants to evaluate his entire architectural history using the comparative analysis — not just one rebuild, but the full sequence.

**Minute 0:00 — The Multi-Branch Setup**

Tomasz opens the Counterfactual History panel. His config tree is extensive: a trunk from v1.0 through v1.7, a fork to v2.0 through v2.9, another fork to v3.0 through v3.6, and the current trunk at v4.0 through v4.3. Three major rebuilds, each with 2-3 iterations of post-rebuild tuning.

He Shift-clicks four nodes: v1.7 (the pre-first-rebuild state), v2.9 (the pre-second-rebuild state), v3.6 (the pre-third-rebuild state), and v4.3 (current). The context menu shows: "COMPARE 4 BRANCHES (est. 14 min)."

Each historical node has a phantom branch with its career minimum fix stored. The system will simulate four lineages:
1. v4.3 — the actual current config (real match data, no simulation needed)
2. v3.6 + career fix — the "what if I had patched v3.6 instead of rebuilding to v4.0"
3. v2.9 + career fix — the "what if I had patched v2.9 instead of rebuilding to v3.0"
4. v1.7 + career fix — the "what if I had patched v1.7 instead of ever rebuilding at all"

He clicks Compare. The panel expands to a wide four-column layout.

**Minute 2:00 — Watching the Race**

The crossover chart now has four lines. Path Taken (v4.3, solid violet) and three phantom paths (dashed in amber, coral, and sage green respectively). The chart populates from left to right as simulations complete.

After 2 minutes, 20 of 45 matches are simulated across all three phantom branches. A preliminary picture emerges:

- v1.7 + fix (sage green) is at the bottom — it was the weakest architecture and the fix was not enough to keep up with the meta evolution over 8 months
- v2.9 + fix (coral) is competitive with the actual path for the first 25 matches, then diverges downward
- v3.6 + fix (amber) is nearly tied with the actual v4.3 path — the last rebuild may have been unnecessary

Tomasz leans forward. The v3.6 line is tracking the v4.3 line closely. Match by match, they trade positions.

**Minute 8:00 — The Convergence Pattern**

At match 35, the lines stabilize:

```
                    v4.3       v3.6+fix    v2.9+fix    v1.7+fix
                    (actual)   (patch)     (patch)     (patch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Wins (45 matches):  28 (62%)   26 (58%)    21 (47%)    15 (33%)
Average EDT:        0.51       0.46        0.38        0.29
Transition cost:    12 losses  0 losses    0 losses    0 losses
Break-even match:   Match 22   —           —           —
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Tomasz reads the verdict lines:
- v1.7 + fix: "REBUILD JUSTIFIED (dominant)" — the first rebuild was unambiguously necessary
- v2.9 + fix: "REBUILD JUSTIFIED (dominant)" — the second rebuild was clearly correct too
- v3.6 + fix: "REBUILD JUSTIFIED (marginal)" — the third rebuild was barely worth it

He expected this. The third rebuild was impulsive — he rebuilt because he was bored of the v3.x architecture, not because the career analysis showed a structural ceiling. The data confirms: the patch would have gotten him to 58% win rate, only 4 points below his current 62%, with zero transition cost.

**Minute 10:00 — The Architectural Maturity Insight**

Tomasz notices a pattern in the EDT column: 0.29 → 0.38 → 0.46 → 0.51. Each generation of config plays deeper into matches. The rebuilds are producing diminishing returns in win rate (the gap between v3.6+fix and v4.3 is only 4%) but consistent returns in architectural depth (each generation pushes EDT 0.05-0.08 higher).

He writes in his config notebook: "The rebuild tax is increasing. First rebuild: clear. Second: clear. Third: marginal. The patched v3.6 would have reached 58% — my v4.3 only adds 4 points. But the EDT improvement may compound over the next 30 matches. Verdict: my rebuild instinct is weakening in value. Next season: patch first, rebuild only if the patch plateaus."

He has discovered, through quantitative retrospective, the architectural maturity curve — the point at which incremental improvement outpaces revolutionary change. This is the same lesson that software teams learn about rewrites: early rewrites are justified, late rewrites produce diminishing returns.

**Minute 14:00 — The Export**

Tomasz exports the four-branch comparison as JSON. He also screenshots the crossover chart. In the chart, the gold diamond marking the break-even point for v4.3 vs. v3.6+fix sits at match 22 — late in the sequence. The first rebuild's diamond was at match 8. The second at match 14. The break-even point is migrating rightward with each generation — taking longer to justify.

He labels the screenshot: "The diminishing returns of architectural revolution."

**UI Annotations:**
- Four-column comparison: each column has a distinct line color; Path Taken is always solid violet; phantom paths cycle through amber, coral, and sage green; if more than four paths are selected, the system warns "maximum 4 branches for readability" and asks the player to deselect
- Multi-line crossover chart: 960px wide; lines rendered with 2px stroke and 60% opacity so overlapping lines are readable; gold diamonds appear only on the Path Taken line's crossover with each phantom path — up to three diamonds per chart; diamonds are labeled with the match number in small text
- JSON export: includes per-match breakdown for each path (which matches each path won, the EDT for each simulated match, the config version used); compatible with the career analysis JSON export format (4.59) for cross-tool analysis
- Architectural maturity annotation: when the break-even match is later than 25, a footnote appears: "Late break-even suggests diminishing returns from architectural overhaul. Consider incremental fixes for future improvements." This is a system-generated observation, not a verdict — phrased as suggestion, not judgment

---

## Strengths and Weaknesses

### Strengths

**Names the rebuild-vs-patch decision explicitly.** Every strategy game with iterative design has this decision, but no game has ever quantified it. Robot Uprising's comparative analysis turns "should I have patched or rebuilt?" from a philosophical debate into a measurable outcome. Players who experience this once carry the analytical framework into real engineering decisions — when to refactor vs. rewrite, when to iterate vs. start fresh.

**Repurposes existing infrastructure.** The feature requires no new simulation engine. Counterfactual history (4.38) already stores every config version. The career minimum fix (4.59) already computes the cross-match optimal fix. The branch comparator simply combines these two existing systems with a comparison visualization layer. The incremental engineering cost is moderate relative to the diagnostic value.

**Creates a new class of community content.** Multi-branch comparison screenshots — showing four lines diverging and converging across 45 matches — are visually rich, narratively dense, and immediately legible. The crossover chart with its migrating gold diamonds tells a story without annotation. Config necropsy threads (7.10) gain a new artifact type: the architectural decision retrospective.

**Teaches diminishing returns of revolution.** Tomasz's journey illustrates the central pedagogical payload: the insight that rebuilds produce diminishing returns as architecture matures. This is a foundational concept in software engineering, business strategy, and systems design. Players who graph their break-even migration across rebuilds discover the concept experientially, not through lecture.

**The verdict is honest.** "PATCH WOULD HAVE SUFFICED" is painful to read. It means the player burned 8-15 matches on a rebuild that was unnecessary. But the honesty is the feature. Players learn to trust the diagnostic system because it does not soften bad news. This builds the same relationship an engineer has with a good profiler or a thorough code review: the tool tells you what happened, not what you want to hear.

### Weaknesses

**The "Path Not Taken" simulation is fundamentally hypothetical.** The patched v2.3 is simulated against opponents the player actually faced — but in reality, if the player had deployed v2.3+fix, they would have faced different opponents at different ranks (because their rank trajectory would have been different). The simulation assumes a fixed opponent schedule, which is counterfactual in itself. This is an unavoidable limitation of any retroactive comparison, but it should be disclosed clearly.

**Computation cost scales with match history.** A 4-branch comparison across 45 matches requires approximately 3 x 45 simulations = 135 simulations for the phantom paths (the actual path uses real data). At 200ms each, that is 27 seconds of raw simulation time, plus career minimum fix computation for each historical node. The 14-minute estimate for Tomasz's journey includes overhead for career fix recomputation at each branch point. Players with long histories and multiple branches face increasing wait times.

**Emotional risk of the "PATCH WOULD HAVE SUFFICED" verdict.** Priya's journey shows a player who discovers, six weeks later, that her rebuild was counterproductive. This is valuable information but emotionally costly. Some players may avoid the feature entirely to protect their belief that the rebuild was worth it. The feature must be opt-in and the verdict must be accompanied by the recovery option — the ability to restore the old config is the emotional safety net.

**The phantom branch assumes the career fix was correct.** The "Path Not Taken" is always defined as "old config + career minimum fix." But the career fix at the time of the rebuild may have been wrong (limited match history, noisy data). The comparison is only as good as the career fix computation was at the time of the fork. If the player's career fix at v1.7 was based on 5 matches, the phantom branch for v1.7+fix is built on thin data.

**Requires counterfactual history infrastructure.** The feature is gated behind 4.38 (counterfactual history). Players who have not opted into config version storage — or who started playing before the feature was available — cannot use the branch comparator for historical decisions. The feature is forward-looking only for players who enable it late.

---

## Interaction Effects

**With 4.38 (Counterfactual History):**
The branch comparator is the counterfactual history's highest-value consumer. Without the comparative analysis, counterfactual history is a passive archive — a record of past configs that the player can browse but rarely acts on. With the branch comparator, every stored config version becomes a potential comparison baseline. The existence of the comparator retroactively justifies the storage cost of keeping every config version. This is the relationship between a version control system and a blame tool: the archive is inert without the diagnostic that queries it.

**With 4.59 (Career Minimum Fix):**
The career minimum fix at the time of a fork is the definition of "Path Not Taken." If the career minimum fix feature did not exist, the branch comparator would have no way to construct the phantom branch — the player would need to manually specify what fix they "would have" applied, which is unreliable. The career fix provides an objective, computed answer to "what was the best incremental option at the time?" This makes the comparison fair: not "what if I had applied my fantasy fix" but "what if I had applied the fix the game recommended."

**With 4.25 (EDT Trajectory):**
The comparison table includes average EDT for each path. This allows the player to evaluate rebuilds on two axes: win rate and architectural depth. A rebuild that produces marginal win rate improvement but significant EDT improvement (Tomasz's third rebuild: +4% win rate, +0.05 EDT) may still be justified on the depth axis. The EDT column prevents the comparison from collapsing to a single-metric win-rate judgment.

**With 4.69g (Agent Cluster Career Stats):**
The Agent Debt Ledger can be filtered by config version. After running a branch comparison, a player might check: "Which agents carried the most structural debt in v2.3 vs. v3.8?" If the rebuild eliminated debt from RELAY-C but introduced new debt on SCOUT-A, the comparison tells a more nuanced story: the rebuild was a debt transfer, not a debt reduction. The two features together reveal whether a rebuild solved the right problems or merely redistributed them.

**With 4.37 (Fork-and-Deploy):**
Fork-and-deploy creates a new config branch from the current config. The branch comparator evaluates branches retrospectively. Together, they create a full A/B testing workflow: fork-and-deploy creates the experiment, the branch comparator evaluates the result. A player who forks their config, runs 10 matches on each fork, and then compares the two branches has performed a controlled experiment on their own architecture. This is closer to real A/B testing methodology than any other game mechanic in the design space.

---

## Comparable Games and Media

**Git diff and git blame:** The branch comparator is conceptually identical to running `git diff branch-a..branch-b` and asking "which branch produced better outcomes." Software engineers who use branch comparison in code review will recognize the same cognitive structure: two divergent paths from a shared ancestor, evaluated against the same set of requirements (matches, in this case). The "PATCH WOULD HAVE SUFFICED" verdict maps to the senior engineer's observation: "You didn't need to rewrite this module. A one-line fix would have solved the bug."

**Chess opening theory and engine comparison:** Chess players frequently ask "should I have played the Sicilian or the French against this opponent?" Opening databases (Chessbase, Lichess studies) let players compare the statistical performance of two opening lines against the same opponent profile. The branch comparator is the same question applied to Robot Uprising configs: "should I have patched my opening or rebuilt it?"

**Civilization series — "what if" scenario replays:** Civilization VI's replay map shows the progression of empires across the game. Some players save at decision points and replay to test alternative strategies. The branch comparator formalizes this save-and-replay pattern as a first-class feature: the system automatically saves at decision points (config forks) and can replay alternatives on demand.

**A/B testing platforms (Optimizely, LaunchDarkly):** The closest real-world analogue. A/B testing platforms split traffic between two variants and measure which performs better. The branch comparator splits match history between two config variants and measures which would have performed better. The key difference is temporal: A/B tests run variants simultaneously, while the branch comparator compares one real variant with one simulated variant. The comparison is retroactive, not prospective. But the analytical framework — two variants, same audience, measured outcome — is identical.

**Dwarf Fortress Legends mode:** Dwarf Fortress Legends mode lets players explore the full history of a generated world, including the fates of civilizations, artifacts, and individuals. The branch comparator shares the "archaeological retrospective" quality — it lets the player dig into their own architectural history and understand how past decisions shaped current outcomes. The feeling is the same: seeing the consequences of choices you made months ago, rendered quantitatively.

---

## Sensory Description

### The Branch Comparison Panel — Opening

The panel slides in from the right side of the Counterfactual History view, pushing the config tree leftward to make room. The opening animation takes 600ms — deliberately slower than a standard panel open, communicating that this is a heavyweight diagnostic tool, not a quick glance. The panel background is a deep charcoal, darker than the standard debrief panels, with faint grid lines in dark slate that evoke graph paper. The header reads "BRANCH COMPARISON" in small caps, spaced wide, with the selected config versions listed beneath in monospace: "v2.3 → v3.8 vs. v2.3 + relay fix."

### The Split-Screen Simulation

The two halves of the panel are separated by a thin vertical rule — 1px, in the same dark violet used for the career analysis panel border. The left half (Path Taken) populates instantly: real match data appears as small dots along a horizontal timeline, each dot colored by outcome (green for win, muted red for loss). The right half (Path Not Taken) begins populating as simulations complete: dots appear one by one, each preceded by a brief 80ms pulse animation — a small ring expanding outward from the dot's position and fading, like a sonar ping. The pulse is in amber, the phantom branch color. The rhythm of pulses creates a heartbeat-like cadence as the simulation progresses: one ping every 200ms, steady, patient.

Audio: a low, filtered click for each simulated match completing — the same click used when the per-match MFE evaluates a candidate, but pitched down and with more reverb, suggesting depth. The clicks are quiet enough to be ambient but regular enough to communicate progress without watching the screen. The player can tab away and hear the simulation running.

### The Crossover Chart

The chart draws itself below the split-screen panels. The X-axis (match number) appears first, tick marks materializing left to right. Then the Y-axis (cumulative wins). Then the lines:

Path Taken draws first: a solid violet line moving left to right, each segment appearing as a match is plotted. The line has a subtle glow — a 2px halo in lighter violet, giving it a warm presence against the charcoal background.

Path Not Taken draws second: a dashed amber line, the same left-to-right motion. The dashing pattern is deliberate — 8px dash, 4px gap — long enough to read as a continuous line but clearly distinct from the solid Path Taken line. The amber is warm but muted, not as bright as the gold diamond color. It suggests possibility without asserting primacy.

When the lines cross — if they cross — the intersection point brightens. Both lines pulse once at the crossover, 150ms, and a gold diamond materializes at the intersection with a soft crystalline chime. The chime is a perfect fifth interval — the same interval used for the EDT determination diamond in match timelines, but sustained for 800ms instead of 400ms, and with a slow decay that suggests finality. This is the moment the architectural investment paid off.

If the lines never cross, no chime plays. The chart completes in silence. The ambient click-track of simulations fades out. The absence of sound is the diagnostic: the rebuild never broke even.

### The Verdict Text

The verdict appears last, after the chart is fully drawn. It fades in over 400ms in the center of the panel, below the chart. The font is the same monospace used throughout the diagnostic layer, but slightly larger — 18px instead of 14px. The color depends on the verdict:

- **REBUILD JUSTIFIED (dominant):** Violet text, matching the Path Taken line. A brief glow on the Path Taken line when the verdict appears, affirming the choice.
- **REBUILD JUSTIFIED (marginal):** Violet text, but dimmer — 70% opacity. No glow.
- **REBUILD NEUTRAL:** Grey text. Both lines pulse briefly. Neither is affirmed.
- **PATCH WOULD HAVE SUFFICED:** Amber text, matching the Path Not Taken line. The phantom branch line on the config tree pulses once. The amber is not aggressive — it is the color of something that could have been but was not. Warm. Slightly sad. Honest.

### The Recovery Buttons

When the verdict is "PATCH WOULD HAVE SUFFICED," the recovery buttons appear beneath the verdict with a 200ms slide-up animation. They are outlined buttons, not filled — communicating that the action is available but not insisted upon. The "RESTORE" button has an amber outline (matching the phantom branch). The "STAY" button has a grey outline. Neither button glows or pulses. The system is offering a choice, not making a recommendation. The player sits with the verdict for as long as they want before acting.

The entire panel, from opening animation to verdict display, takes approximately 6-14 minutes depending on the scope of the comparison. During this time, the low click-track audio, the sonar-ping dot appearances, and the gradual chart construction create a sustained atmosphere of measured retrospection. The panel does not hurry. The player is reviewing months of architectural decisions. The tool respects the weight of that review.

---

## Discovered New Aspects

1. **4.73 — Break-even migration rate as architectural maturity metric:** Tracking the break-even match number across sequential rebuilds (match 8, match 14, match 22) reveals a trend: increasing break-even times indicate diminishing rebuild returns. Graphing this as a "rebuild cost curve" creates a new career-arc metric — the player can predict when future rebuilds will no longer be worth the transition cost.

2. **4.74 — Pre-rebuild comparison preview:** Before committing to a rebuild, the player simulates "what would the patched current config achieve over the next 15 matches?" using the career minimum fix and opponent archetype distribution. A preview of the Path Not Taken *before* the fork, helping the player make the rebuild decision with data rather than intuition. Requires opponent archetype modeling (4.70).

3. **4.75 — Rebuild cadence as community identity signal:** Displaying the number of major rebuilds per season on the player profile. High-rebuild players ("architects who rewrite") vs. low-rebuild players ("architects who iterate") become visible community archetypes. Config necropsy threads gain a new axis: rebuild cadence as playstyle identity.

4. **4.76 — Debt transfer detection in rebuild comparison:** When a rebuild eliminates debt from one agent but introduces new debt on another (visible by cross-referencing the branch comparison with the Agent Debt Ledger, 4.69g), the system annotates the comparison: "This rebuild transferred structural debt from RELAY-C to SCOUT-A rather than reducing total debt." Teaches the concept of debt transfer vs. debt reduction.
