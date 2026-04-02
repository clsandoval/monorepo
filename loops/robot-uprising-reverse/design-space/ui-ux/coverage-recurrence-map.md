# Coverage Recurrence Map

**Aspect:** 4.114 — Coverage recurrence map: a visualization showing which config elements have recurred across career analysis runs — not just the most recent recurrence, but all elements that have appeared in multiple runs across the player's entire history; a "structural debt ledger" across the career arc; elements that recur 3+ times are flagged as "persistent architectural debt" requiring holistic redesign, not incremental fix.

**Parent:** 4.68 — Coverage percentage as season health metric
**Siblings:** 4.112 — Coverage percentile vs. community distribution; 4.113 — Failure Concentration Ratio as advanced coverage metric; 4.115 — Opponent coverage as adversarial intelligence; 4.116 — Coverage goal and improvement countdown
**Related:** 4.69d — Multi-cluster persistence tracking; 4.59 — Career minimum fix; 4.72 — Debt-free season achievement; 7.10 — Config necropsy as community artifact; 4.117 — Coverage floor design question

---

## The Core Concept

The coverage percentage trend (4.68) tracks how concentrated your failures are across career analysis runs. The multi-cluster persistence tracker (4.69d) flags individual agents that keep appearing in cluster events. But neither of these answers the question that matters most at the scale of an entire career: **which specific config elements keep showing up as failure candidates, run after run, despite your best efforts to fix them?**

The Coverage Recurrence Map is a visualization that lays out the full history of every config element that has ever appeared as a career analysis candidate — not just the top-1 candidate, but the full runner-up list from every run — and maps their recurrence patterns across the player's entire Gauntlet history. It is a structural debt ledger: a single screen that shows which parts of your architecture are chronically fragile, which parts you fixed once and never saw again, and which parts keep returning like a leak you patched but never replumbed.

The distinction from 4.69d (multi-cluster persistence) is scope and granularity. Multi-cluster persistence tracks whether an **agent** clusters across runs. The recurrence map tracks whether specific **config elements** — individual parameters within agents — appear as failure candidates across runs. An agent might cluster persistently because different elements within it take turns being the top candidate. The recurrence map catches this: RELAY-C's context buffer was the candidate in run 2, its fallback filter in run 4, its priority queue in run 6. The agent-level persistence tracker sees "RELAY-C keeps clustering." The recurrence map sees "three different elements within RELAY-C have each appeared once — the agent has distributed fragility, not concentrated fragility." These require different redesign strategies, and the map makes the distinction visible.

The key threshold: **elements that recur in 3 or more career analysis runs are flagged as "persistent architectural debt."** This is a stronger claim than the multi-cluster persistence threshold (N=2 for agents). The element-level threshold is higher because config elements are more granular — a single element might appear as a runner-up at 12% coverage in one run and not be particularly alarming, then appear again at 15% two runs later. Two appearances might be coincidence in a scenario distribution that happens to stress the same subsystem twice. Three appearances establishes a pattern: this element is structurally fragile across enough scenario variation that incremental tuning is not resolving the underlying issue.

The "persistent architectural debt" label is borrowed deliberately from software engineering's "technical debt" metaphor. The point is the same: some problems cannot be fixed by patching. They require rethinking the design that produces them. A context buffer that keeps appearing as a failure candidate across three career analyses is not misconfigured — it is architecturally load-bearing in a way that creates brittleness. The fix is not "tune the buffer size from 4 to 5." The fix is "reconsider why so many of your agent's decisions flow through this single buffer."

---

## The Visualization

### Layout: The Ledger Grid

The recurrence map is a grid. The horizontal axis is career analysis runs (Run 1, Run 2, ... Run N), left to right, chronological. The vertical axis is config elements, grouped by agent, sorted by total recurrence count (most recurring at top).

Each cell is either empty (element did not appear as a candidate in that run) or filled (element appeared). Filled cells show the element's coverage percentage for that run, encoded as both a number and a fill intensity — darker fill = higher coverage.

```
Coverage Recurrence Map (8 career analysis runs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        Run1  Run2  Run3  Run4  Run5  Run6  Run7  Run8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  RELAY-C
    context buffer      [61%] [  ]  [  ]  [  ]  [  ]  [26%] [  ]  [22%]  ◆ DEBT
    fallback filter      [  ]  [  ]  [  ]  [32%] [  ]  [  ]  [19%] [  ]
    priority queue       [  ]  [  ]  [  ]  [  ]  [21%] [  ]  [  ]  [17%]

  SCOUT-A
    hook threshold       [  ]  [43%] [  ]  [  ]  [  ]  [  ]  [  ]  [  ]
    attention filter     [  ]  [  ]  [  ]  [  ]  [  ]  [14%] [  ]  [  ]

  STRIKER-B
    patrol radius        [  ]  [  ]  [38%] [  ]  [  ]  [  ]  [  ]  [  ]

  COMMAND
    priority queue       [  ]  [  ]  [  ]  [  ]  [21%] [  ]  [  ]  [  ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ◆ Persistent Architectural Debt: 1 element (RELAY-C context buffer)
```

The grid tells you things that no other surface in the game communicates:

1. **RELAY-C's context buffer appeared in runs 1, 6, and 8.** That is persistent architectural debt. The player fixed it after run 1 (it vanished for four runs), but it came back — and it came back twice more. The fix was temporary or the meta shifted to re-expose the weakness.

2. **RELAY-C has three different elements that each appeared in different runs.** The agent has distributed fragility — no single element dominates, but the agent as a whole keeps producing candidates. This is the "leaky abstraction" pattern: the agent's design philosophy creates brittleness wherever it touches scenario variation.

3. **SCOUT-A and STRIKER-B each appeared once and never again.** These were genuine one-time fixes. The player tuned them, they stopped being candidates. Healthy architectural maintenance.

### Visual Language

The filled cells use a continuous color scale:

- **Coverage < 15%**: pale teal fill, thin border. Runner-up territory — appeared in the analysis but was not the dominant candidate. Text in muted grey.
- **Coverage 15%–30%**: medium amber fill. Meaningful contributor to the failure profile. Text in dark amber.
- **Coverage 30%–50%**: deep amber fill, slightly thicker border. Top-candidate territory for most runs. Text in near-black.
- **Coverage > 50%**: dark rust fill with a subtle pulse animation on hover. Dominant structural weakness. Text in white.

Empty cells are not blank — they are a very faint crosshatch pattern in the background color of the grid, communicating "this element was examined and not found" rather than "no data." The crosshatch is important: it distinguishes "element existed but was clean" from "element didn't exist yet at this run" (which is shown as a truly blank cell with a thin dashed border).

The **persistent architectural debt flag** (the diamond glyph) appears to the right of any element row with 3+ filled cells. The diamond is the same gold used for the EDT diamond in the match timeline — a deliberate visual connection. The EDT diamond marks "the moment the match was decided." The debt diamond marks "the element that keeps deciding your matches." The shared glyph says: these are the same kind of signal at different timescales.

When an element's recurrence count hits 3, the debt diamond does not simply appear — it materializes with a brief animation. The three filled cells in that row flash in sequence (left to right, chronologically), tracing the history of recurrence, and then the diamond solidifies at the end of the row. The animation takes 1.2 seconds. It is the game saying: *here is the evidence, presented in order.* The player watches the pattern assemble itself.

### Agent Grouping and Collapse

Elements are grouped under their parent agent with a collapsible header. The agent header shows a summary:

```
▼ RELAY-C  [3 elements tracked | 1 debt-flagged | 6 total appearances]
```

Collapsed view shows only the agent-level summary, which is useful when a player has 8+ agents and 50+ tracked elements across 12+ runs. The collapsed view is a heatmap row showing the agent's total element appearances per run — a denser view that sacrifices element-level detail for pattern visibility.

Expanded view shows every element. Default state: agents with debt-flagged elements are expanded; agents without debt are collapsed.

---

## Player Journeys

### Journey: Ren, 28, Methodical player, 350 Gauntlet matches, 11 career analysis runs

**Context:** Ren runs career analysis religiously every 30 matches. He has a spreadsheet where he logs every top candidate and what he changed. He considers himself systematic. He has never used the recurrence map because it unlocked at run 5 and he did not notice the new tab.

**Run 11 — The Confrontation**

After his 11th career analysis, the result panel shows a new element in the header bar: "Recurrence Map (11 runs)." He clicks it.

The grid fills in. Eleven columns. Seven agents. Twenty-two tracked elements across his career. Most of the grid is crosshatched — clean cells, elements examined and cleared. But RELAY-C's context buffer row has five filled cells. Five out of eleven runs. The debt diamond is gold and prominent.

Ren stares at this. He fixed the context buffer after run 1. He *knows* he fixed it — he remembers the session, remembers tuning the buffer size from 4 to 6, remembers the coverage dropping from 61% to under 20%. But the map shows it came back in run 4 (at 28%), run 6 (at 26%), run 9 (at 19%), and run 11 (at 22%). He fixed it four times. It recurred four times.

He scrolls back through his spreadsheet. Every entry says the same thing: "RELAY-C context buffer — increased buffer size." He has been applying the same fix for 200 matches. The buffer was at 4, then 6, then 8, then 10, then 12. Each time, coverage drops for one or two runs, then the buffer reappears.

The recurrence map made visible what his spreadsheet could not: the temporal pattern. Not just "this element appeared again" but "this element has appeared five times across eleven runs, with increasing buffer values each time, and the coverage has barely decreased." The shape of the row — five amber cells scattered across eleven columns — is the shape of a whack-a-mole cycle. He was not fixing the problem. He was postponing it by 60 matches each time.

**The redesign decision:**

Ren opens the RELAY-C agent in the config editor. He does not change the buffer size. He redesigns the relay's attention routing — replacing the single context buffer with a dual-path architecture that routes high-priority signals through a dedicated channel and low-priority signals through a shared buffer. The context buffer element ceases to exist in its previous form.

Two career analysis runs later, no RELAY-C elements appear as candidates. The recurrence map shows two new blank columns at the right edge — clean. The five amber cells in the context buffer row are now historical artifacts, and the debt diamond is greyed out with a small "resolved" label. The row remains visible (the history is preserved) but visually recedes.

**UI moment:** Ren hovers over the greyed-out diamond. A tooltip shows: "Persistent debt resolved. Element redesigned at Match 330. No recurrence in 2 subsequent analyses." The tooltip includes a small inline sparkline showing the coverage values across the five recurrence events — 61%, 28%, 26%, 19%, 22% — and then two zeroes at the end. The sparkline drops to zero and stays there. The shape of a problem solved.

---

### Journey: Priya, 22, Aggressive player, 180 Gauntlet matches, 6 career analysis runs

**Context:** Priya plays fast. She runs career analysis when the game prompts her (every 30 matches) but rarely spends more than two minutes on the results. She applies the top fix and moves on. She has never drilled down into runner-up lists.

**Run 6 — The Debt Reveal**

Priya opens her career analysis result. Top candidate: STRIKER-A patrol radius, 34% coverage. She's about to apply the fix when she notices the recurrence map tab. She opens it.

Six columns, five agents, fourteen tracked elements. Three elements have the debt diamond:

```
STRIKER-A patrol radius     [  ] [31%] [  ] [29%] [  ] [34%]  ◆ DEBT
RELAY-B  fallback filter    [22%] [  ] [18%] [  ] [20%] [  ]  ◆ DEBT
SCOUT-C  attention range    [  ] [  ] [25%] [21%] [  ] [23%]  ◆ DEBT
```

Three persistent debt elements. She has never noticed the relay or scout issues because they were never the *top* candidate — they were always runners-up at 18-25%, overshadowed by whatever element was at 30%+ that run. The recurrence map surfaces the runner-up pattern that single-run analysis hides.

**The pattern recognition:**

Priya sees something else in the grid. STRIKER-A appears in runs 2, 4, and 6 — every even-numbered run. RELAY-B appears in runs 1, 3, and 5 — every odd-numbered run. They are alternating. She fixes the striker, the relay surfaces. She fixes the relay (or it gets pushed down by a new top candidate), the striker surfaces.

This is the **seesaw pattern**: two elements that are structurally coupled. Tuning one shifts load to the other. The recurrence map makes the alternation visible because it shows the full history side by side. No single career analysis run reveals a seesaw — each run shows only one of the two elements.

**The compound fix:**

Priya enters the config editor and opens both STRIKER-A and RELAY-B simultaneously. She traces the dependency: STRIKER-A's patrol radius determines how far it roams from the relay's coverage zone. When the patrol radius is large, the striker operates outside relay support and fails independently (striker appears as candidate). When the patrol radius is small, the striker crowds the relay's operational zone and causes buffer overflows in the relay's fallback filter (relay appears as candidate).

The fix is not in either element alone. It is in the relationship between them. She redesigns the striker's patrol boundary to be relay-aware — dynamically adjusting radius based on the relay's current coverage zone rather than using a fixed parameter.

Three runs later, neither element has recurred. Both debt diamonds grey out. The seesaw row pair becomes a resolved historical artifact.

**UI moment:** When two debt-flagged elements from different agents have a perfectly alternating recurrence pattern (appearing in complementary run sets), the recurrence map draws a faint connecting line between their rows — a visual hint that these might be coupled. The line is dashed, not solid, because the system is inferring correlation, not proving causation. But the hint is enough to prompt the player to investigate the relationship.

---

### Journey: Tomasz, 35, Returning player, 500 Gauntlet matches across two seasons, 16 career analysis runs

**Context:** Tomasz took a three-month break after Season 1 (200 matches, 7 career analysis runs). He returned for Season 2, resumed with the same config, and has now completed 9 more runs. He has not opened the recurrence map since before his break.

**Run 16 — The Archaeology**

Tomasz opens the recurrence map expecting to see his Season 2 work. He sees sixteen columns. The first seven are from Season 1, separated from the last nine by a thin vertical divider labeled "Break — 94 days." The map preserves cross-season history.

The Season 1 columns are sobering. His COMMAND agent's priority queue appeared in runs 2, 3, 5, 6, and 7 — five of seven runs. A debt diamond with a severity that approaches deep rust. He remembers: he never fixed it. He burned out trying to fix it and quit.

The Season 2 columns tell a different story. His first act upon returning was to rebuild the COMMAND agent from scratch. The priority queue element no longer exists in its old form. Runs 8 through 16 show zero COMMAND appearances. The debt diamond for the old priority queue is greyed with "resolved (element removed)" — the element was not tuned, it was deleted. The most decisive fix.

But something new has emerged. His SCOUT-D attention filter has appeared in runs 12, 14, and 16 — a new debt pattern forming in the back half of Season 2. A fresh diamond, gold and pulsing.

Tomasz has a moment of recognition. He sees the career arc laid out in sixteen columns: a Season 1 dominated by a single intractable element, a break, a clean restart, and now a new pattern forming. The recurrence map is not a diagnostic tool for one problem. It is a biography of his relationship with architectural debt. The shape of the grid IS the shape of his career.

**The meta-insight:**

He hovers over the SCOUT-D debt diamond and reads the tooltip: "3 appearances in runs 12, 14, 16. Coverage trend: 18% to 21% to 24%. Severity: WORSENING."

He does not make the same mistake as Season 1. He does not tune the attention filter three more times and quit. He opens the SCOUT-D agent in the redesign workbench (4.69c), reviews the attention architecture holistically, and rebuilds it before the worsening trend produces a fourth recurrence.

**UI moment:** The season divider in the recurrence map is not just a visual separator. Hovering over it shows: "Break: 94 days. Config version at departure: v4.2. Config version at return: v5.0. Elements removed: 3. Elements added: 5. Debt resolved during break: 1 (COMMAND priority queue, removed in v5.0)." The break itself is a data point in the career narrative.

---

## Strengths

**Surfaces runner-up patterns invisible to single-run analysis.** The most dangerous debt is not the element that tops one career analysis. It is the element that appears as a runner-up in six analyses — never alarming enough to be the top priority, always present, accumulating structural risk. The recurrence map is the only surface that makes runner-up persistence visible across time.

**Distinguishes tuning failure from design failure.** When a player sees the same element recur 5 times despite applying fixes each time, the recurrence map communicates what no single diagnostic can: "your fix approach is wrong, not your fix values." This reframes the player's relationship with the problem from parameter optimization to architectural rethinking.

**Creates a career-scale narrative artifact.** The grid is a biography. Players with 15+ career analysis runs have a rich visual history of every structural weakness they have encountered and how they responded. Config necropsy posts (7.10) that include the recurrence map tell a more complete story than win rate curves or EDT trajectories alone — they show the internal architecture of improvement, not just its outcomes.

**Detects coupled-element patterns (seesaws).** The side-by-side display of element histories across runs makes alternating recurrence patterns visible in a way that no element-level metric can. Two elements that never co-occur but always alternate are structurally coupled, and the map's visual layout reveals this without requiring the player to correlate data manually.

**Rewards decisive action.** The greyed-out debt diamond with "resolved" label is a permanent record of a problem the player confronted and eliminated. The recurrence map accumulates resolved debt alongside active debt, creating a visual ratio of "problems I have solved" to "problems still open." Over a long career, a map with many greyed diamonds and few gold ones is a portrait of architectural maturity.

---

## Weaknesses

**Information overload at scale.** A player with 16 career analysis runs, 10 agents, and 40+ tracked elements produces a grid with 640+ cells. Even with agent grouping and collapse, the map becomes unwieldy. The collapsed agent-level heatmap helps, but the element-level detail — which is the map's core value — requires scrolling and scanning a large grid. Players who are not comfortable with spreadsheet-scale data may find the map intimidating rather than illuminating.

**False debt flags from meta shifts.** An element that appears in runs 2, 7, and 14 — three appearances across twelve runs — gets the debt diamond. But the three appearances might correspond to three different meta environments. In run 2, rush strategies dominated and the element was stressed by early aggression. In run 7, the meta had shifted to midgame control. In run 14, a new patch changed scenario distributions. The element appeared three times, but for three different reasons, and the "persistent architectural debt" frame may be misleading. The recurrence map cannot distinguish "same root cause recurring" from "different causes producing the same surface symptom."

**Encourages over-redesign.** The debt diamond is a strong visual signal. A player who sees any gold diamond may feel compelled to redesign the flagged element, even if its coverage percentages are low (12%, 14%, 11% across three runs). Persistent low-coverage recurrence might not warrant a full redesign — it might just mean the element is slightly suboptimal in a way that does not materially affect outcomes. The 3-run threshold does not account for severity, only frequency. Mitigation: display average coverage across recurrences beside the diamond, so players can distinguish "persistent and severe" from "persistent and minor."

**Requires significant play investment to populate.** The map is meaningless with fewer than 5 career analysis runs, and starts revealing genuine patterns only at 8+. At 30 matches per run, that is 240+ Gauntlet matches before the map produces actionable insight. Players who play casually (50-100 matches per season) may never accumulate enough data for the map to justify its screen space.

**Resolved debt clutters the view over time.** A player with 20+ runs and a history of successful redesigns will have many greyed-out rows of resolved debt. These are narratively satisfying but visually noisy. The map needs a "show active debt only" toggle, but defaulting to that toggle would hide the career biography that makes the map emotionally resonant. The default view is a design tension: comprehensive history vs. actionable present.

---

## Interaction Effects

**With 4.68 (Coverage percentage as season health):** The coverage trend sparkline shows the headline number declining over time. The recurrence map explains *why* it declined (or didn't): which specific elements were resolved, which persist, and which new ones emerged. The trend is the summary; the map is the detailed ledger behind it. A player whose coverage trend plateaus can open the recurrence map to diagnose whether the plateau is caused by one persistent debt element or by a rotating cast of new elements replacing resolved ones.

**With 4.69d (Multi-cluster persistence tracking):** Agent-level persistence and element-level recurrence are complementary views of the same underlying phenomenon. The recurrence map should link to the multi-cluster persistence log: clicking an agent header in the recurrence map opens the agent's cluster history (4.69d). Conversely, the persistence log should link back to the recurrence map when an agent's cluster is caused by rotating elements rather than a single repeated element.

**With 4.113 (Failure Concentration Ratio):** The FCR measures how concentrated failures are across elements in a single run. The recurrence map measures how persistent individual elements are across runs. A player with high FCR (concentrated) and high recurrence (persistent) has a single dominant weakness they cannot resolve — the worst case. A player with low FCR (distributed) and high recurrence across multiple elements has a different problem: architectural fragility spread across many subsystems, each individually minor but collectively unresolvable. The FCR-recurrence combination defines four quadrants of architectural health.

**With 4.116 (Coverage goal and improvement countdown):** The "estimated runs to target" countdown should factor in the recurrence map's debt count. A player with three active debt elements will reduce coverage more slowly than a player with zero debt, because debt elements resist incremental improvement. The countdown could display: "Estimated 4 runs to 20% coverage (adjusted for 2 persistent debt elements)."

**With 4.72 (Debt-free season achievement):** The debt-free achievement requires zero elements flagged as persistent debt. The recurrence map is the literal scorecard for this achievement — it shows exactly which elements still carry debt flags and how close the player is to clearing them all. The achievement becomes a named state of the recurrence map: every row either crosshatched (never appeared) or greyed (appeared and resolved). No gold diamonds.

**With 7.10 (Config necropsy as community artifact):** The recurrence map is the highest-information-density artifact a player can share in a necropsy post. A screenshot of a 12-run recurrence map with three resolved debt diamonds and one active one tells a complete architectural history in a single image. Community members can read the map like a medical chart: "I see you had a chronic relay issue in early career, resolved it with a redesign at run 7, then developed a new scout issue starting at run 10." The map becomes a shared diagnostic language.

---

## Comparable Games and Media

**SonarQube technical debt dashboard:** The most direct analogue. SonarQube tracks code quality issues across analysis runs, flags issues that persist across multiple scans as "technical debt," and visualizes the debt history as a timeline. Issues that appear in 3+ scans are highlighted as chronic. The key lesson from SonarQube: **the "debt ratio" (debt issues / total issues examined) is a better summary metric than raw debt count**, because it normalizes for codebase size. The recurrence map should show "3 debt elements / 22 tracked elements (14% debt ratio)" as a headline.

**Medical problem lists in electronic health records:** A patient's medical record maintains a "problem list" — chronic conditions that persist across visits. Each visit note references the problem list, adding or resolving entries. The recurrence map is structurally identical: a persistent record of architectural problems that spans individual diagnostic sessions (career analyses). The EHR pattern teaches an important principle: **resolved problems should remain visible in the history but visually distinct from active problems.** Doctors need to see that a patient had hypertension that was resolved — the history matters even after resolution.

**Git blame and code archaeology tools:** Tools like `git log --follow` track the history of a single file across renames and refactors. The recurrence map does the same for config elements across career analysis runs. The "element removed" state in the map (when a player deletes an element rather than tuning it) is analogous to a file being deleted in a repository — the history is preserved, the artifact is gone. The design lesson: **the map should handle element renames and restructures gracefully**, tracking continuity across redesigns when possible (e.g., "RELAY-C context buffer was replaced by RELAY-C dual-path router in v5.0 — recurrence history carries forward under the new name").

**Jira/Linear recurring issue patterns:** Project management tools surface issues that get reopened multiple times. A bug that gets closed and reopened three times triggers informal team recognition: "this is a systemic problem, not a bug." The recurrence map formalizes this pattern recognition. The lesson from project management tools: **the reopen count is more diagnostic than the issue severity.** A low-severity bug reopened five times is a bigger architectural problem than a high-severity bug that appeared once and was fixed. The recurrence map applies this principle: recurrence count matters more than per-run coverage percentage for identifying structural problems.

---

## Sensory Description

The recurrence map opens as a panel that slides in from the right side of the career analysis screen, overlaying the standard result view. The grid materializes column by column, left to right, each column corresponding to a career analysis run. The columns appear at 120ms intervals — fast enough to feel fluid, slow enough to register the progression of time. Each filled cell fades in with its coverage color already set, so the grid assembles itself as a heatmap building from the past toward the present.

The agent group headers are rendered in the same monospace font used throughout the debrief interface — the "engineering terminal" aesthetic. Each header has a thin left border in the agent's assigned color (the same color used in the match timeline for that agent's events). The elements beneath each header are indented with a subtle connector line, like a file tree.

Empty cells have a crosshatch pattern rendered at 8% opacity — barely visible, but present. It creates a faint texture across the grid that prevents the empty space from feeling void. The crosshatch uses the same 45-degree angle as the sealed-watch fog pattern, a subliminal connection: "this area has been examined and found clear," the same message the fog conveys when it lifts.

Filled cells glow faintly on hover, and a tooltip appears showing the full context: "Run 6 — Match 165-195 — Coverage: 26% — Rank: #2 of 5 candidates — Player action: Applied fix, no redesign." The tooltip is dense — it contains everything the cell represents, compressed into five data points.

The debt diamond, when it appears, is rendered in the same gold as the EDT diamond: `#D4A843`, slightly warm, slightly metallic. It has a 1px darker border and a subtle inner shadow that gives it dimensionality against the grid background. On the first frame it appears, the three (or more) filled cells that triggered it flash in sequence — a 400ms pulse of brighter saturation traveling left to right across the row, tracing the recurrence history. Then the diamond solidifies. The sound is a single low tone — a sustained note in the same register as the "signal detected" audio cue from the debrief, but held for 800ms instead of the usual 200ms. Longer. More serious. The length of the tone communicates weight.

When a debt diamond is resolved (greyed out after a successful redesign), the grey is not flat — it is the gold color desaturated to 15% and lightened. The shape remains. The history remains. But the urgency is gone. Hovering over a resolved diamond produces a tooltip with a green checkmark and the resolution date. The resolved diamond does not animate or produce sound. It is quiet. It is done.

---

## Discovered New Aspects

- **4.118 — Seesaw detection in the recurrence map:** Formalizing the automatic detection of alternating recurrence patterns between two or more elements from different agents; defining the threshold for declaring a seesaw (complementary appearance in N consecutive run-pairs); the dashed connector line as visual language for inferred structural coupling
- **4.119 — Recurrence map debt ratio as career headline stat:** The ratio of debt-flagged elements to total tracked elements as a single number shown on the player profile alongside eEDT and win rate; "Debt Ratio: 14% (3/22)" as a legible summary of architectural health; the design tension between showing a number that penalizes players with many tracked elements (more surface area = higher denominator) vs. rewarding thorough career analysis
- **4.120 — Element continuity tracking across redesigns:** When a player redesigns an element (replacing "context buffer" with "dual-path router"), should the recurrence map treat the new element as a fresh entity or carry forward the predecessor's history? The naming and identity problem for config elements across version boundaries; interaction with config version history
- **4.121 — Recurrence map as config necropsy export format:** Designing the shareable/exportable version of the recurrence map for community necropsy posts; what metadata to include, what to redact, how to render the grid as a static image or interactive embed; the map as the highest-density career artifact available for community sharing
- **4.122 — Active-only vs. full-history toggle default:** The design tension between showing all historical debt (including resolved diamonds) for narrative richness vs. showing only active debt for actionable clarity; which default serves new players vs. veterans; whether the toggle state should persist across sessions
