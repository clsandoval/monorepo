# Agent Multi-Cluster Detection in Career Analysis

**Aspect:** 4.69 — "Agent multi-cluster" detection in career analysis: automatic flag when the same agent appears in 3+ distinct runner-up slots in a career analysis result — surfaces "consider reviewing this agent holistically, not element-by-element"; interaction with 4.49 cross-mission pattern detection.

**Parent:** 4.59 — Career minimum fix (cross-match exhaustive search)
**Siblings:** 4.49 — Cross-mission pattern detection; 4.68 — Coverage percentage as season health; 4.72 — Debt-free season achievement
**Related:** 4.36 — Multi-scenario minimum fix explorer; 4.38 — Counterfactual history; 4.37 — Fork-and-deploy shortcut; 8.08 — Vocabulary claim (architectural debt)

---

## The Core Concept

The career analysis result panel shows a ranked list of fix candidates — config changes that would improve the most matches if applied. Normally, the player reads this list top-to-bottom and applies the #1 fix. But there is a failure mode baked into this reading: **the player treats each candidate as an independent problem**.

Consider this result:

```
Career Analysis (M145–M190, 45 matches analyzed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#1  RELAY-C context buffer size    62%  (28/45)  [Apply Fix →]
#2  SCOUT-A hook threshold         31%  (14/45)  [Apply Fix →]
#3  RELAY-C fallback filter        24%  (11/45)  [Apply Fix →]
#4  STRIKER-B patrol radius        18%   (8/45)  [Apply Fix →]
#5  RELAY-C priority queue depth   17%   (8/45)  [Apply Fix →]
```

The player applies the #1 fix (RELAY-C context buffer), runs 30 more matches, and runs career analysis again. Now RELAY-C fallback filter is #1. They fix that. Another 30 matches. Now RELAY-C priority queue is #1. It is a Whack-A-Mole pattern: each fix reveals the next symptom. The player is patching an architecture that needs to be rethought.

**Agent multi-cluster detection** is the automatic flag that interrupts this cycle. When the same agent name appears in 3 or more distinct candidate slots in a career analysis result, the game surfaces a diagnostic:

> ⚠ **RELAY-C appears in 3 of your top 5 candidates.**
> Individual fixes address symptoms. This agent may have a structural problem that element-by-element patching won't resolve.
> `[View Agent Audit →]`  `[Dismiss — continue element-by-element]`

The flag is not a command — it doesn't block the player from applying the #1 fix. It is a prompt to *think differently about the diagnostic frame*. The element-level analysis said "fix RELAY-C context buffer." The cluster flag says "why does RELAY-C keep appearing?"

The answer is almost always one of three things:
1. **The agent's role has outgrown its design.** RELAY-C was designed for short-range compression in wave 1. By wave 3, it handles three-hop relay chains. Its individual parameters are all suboptimal because the whole architecture is wrong for the job.
2. **A systemic constraint cascades.** RELAY-C has a small buffer (set in wave 1). That small buffer forces conservative fallback filters. The conservative filters create shallow priority queues. Every individual element looks fixable, but they are all downstream effects of one upstream size decision.
3. **An external dependency has changed.** RELAY-C was tuned for the signals SCOUT-A was producing. SCOUT-A was rebuilt in season 2. RELAY-C has never been retuned to match.

None of these root causes are visible in the runner-up list. The list shows elements, not architectures. Multi-cluster detection is the game saying: *you may be looking at the wrong level.*

---

## The Mechanical Underpinning

### The Detection Algorithm

The cluster detection algorithm is simple:

```
clusters = {}
for candidate in top_N_candidates:
    agent = candidate.agent_name
    if agent not in clusters:
        clusters[agent] = []
    clusters[agent].append(candidate)

for agent, entries in clusters.items():
    if len(entries) >= CLUSTER_THRESHOLD:
        flag_multi_cluster(agent, entries)
```

Default threshold: 3 appearances in the top 10 candidates. This is configurable (see 4.69a — Multi-cluster threshold configurability).

The top-N window matters. If N=5, the threshold is effectively "3/5 candidates are the same agent" — a very concentrated result. If N=10, "3/10" is still notable but less alarming. The recommended default is N=10 candidates, threshold=3, which fires when roughly 30% of the candidate pool points to the same agent.

### Combined Cluster Coverage

When multi-cluster is detected, the system computes an additional metric: **combined cluster coverage** — the percentage of matches that would be improved if *all* cluster entries were applied together, versus the sum of individual coverages (which double-counts overlap).

```
Individual coverage (sum):  62% + 24% + 17% = 103% (overlapping)
Combined cluster coverage:  71%  (matches improved by fixing all three)
Coverage increment:         71% - 62% = +9pp over just applying #1
Remaining non-RELAY-C loss: 29% (matches where RELAY-C was not causal)
```

The combined cluster coverage tells the player: "fixing all three RELAY-C elements together is worth 9pp more than fixing just the top one." Whether that 9pp is worth a full agent redesign is a judgment call — but the player now has the number.

### The Agent Audit View

Clicking `[View Agent Audit →]` opens a dedicated agent-centric analysis panel:

```
┌─────────────────────────────────────────────────────────────────────┐
│  RELAY-C — Agent Audit                                    [Close X] │
├─────────────────────────────────────────────────────────────────────┤
│  Agent version: v3.2 (unchanged for 43 matches)                     │
│  Role: Mid-range relay, signal compression, fallback routing        │
│  Created: Season 1, Match 12                                        │
├─────────────────────────────────────────────────────────────────────┤
│  MULTI-CLUSTER MEMBERS (3 elements, combined coverage: 71%)         │
│                                                                     │
│  ① context buffer size      [CAREER BEST: 80 slots → try: 120]     │
│     Coverage: 62%  •  Active in 28/45 analyzed matches             │
│                                                                     │
│  ② fallback filter          [CAREER BEST: filter_depth: 2 → try: 4]│
│     Coverage: 24%  •  Active in 11/45 analyzed matches             │
│                                                                     │
│  ③ priority queue depth     [CAREER BEST: depth: 3 → try: 5]       │
│     Coverage: 17%  •  Active in 8/45 analyzed matches             │
├─────────────────────────────────────────────────────────────────────┤
│  COMBINED SCENARIO COVERAGE IF ALL THREE FIXED: 71%                │
│  (vs. 62% from top candidate alone — +9pp from complete overhaul)  │
├─────────────────────────────────────────────────────────────────────┤
│  POSSIBLE ROOT CAUSES:                                              │
│  • Buffer cascade: small buffer → conservative filter → shallow    │
│    queue. All three elements downstream of one size decision.       │
│  • Role drift: agent design last updated Season 1. Role changed    │
│    from short-range to 3-hop relay since Season 2.                 │
│  • Dependency gap: signal input profile changed when SCOUT-A was   │
│    rebuilt (Match 87). RELAY-C config has not been retuned.        │
├─────────────────────────────────────────────────────────────────────┤
│  [Apply All Three Fixes →]  [Redesign RELAY-C →]  [Dismiss]        │
└─────────────────────────────────────────────────────────────────────┘
```

The "Redesign RELAY-C" button opens the workbench with RELAY-C isolated — all other agents grayed out, buffer visualization focused on RELAY-C's internal state, a modal "redesign mode" where changes to RELAY-C are simulated before deployment.

---

## Design Options

### Option A — Flag-Only (Minimal)

The career analysis runner-up list gains a visual cluster annotation. No new panel, no agent audit. When 3+ entries share an agent, those rows are visually connected:

```
#1  RELAY-C context buffer    62% ─┐  [Apply Fix →]
#2  SCOUT-A hook threshold    31%  │  [Apply Fix →]
#3  RELAY-C fallback filter   24% ─┤  [Apply Fix →]  ⚠ RELAY-C cluster (3)
#4  STRIKER-B patrol radius   18%  │  [Apply Fix →]
#5  RELAY-C priority queue    17% ─┘  [Apply Fix →]
```

A bracket connects rows #1, #3, #5. A label "RELAY-C cluster (3)" floats to the right. A small info icon `[?]` expands to one line of explanation: "This agent appears 3x — consider a holistic review."

**Strengths:** Non-intrusive. The player can ignore it. No extra UI screen needed.
**Weaknesses:** Easy to ignore. No combined coverage number. No agent audit. Teaches nothing about *why* this matters.

### Option B — Modal Flag + Agent Audit (Recommended Default)

The flag interrupts the result display with a soft modal (not blocking — can be dismissed with Escape or the X button). The modal shows the cluster, the combined coverage, the possible root cause hypotheses, and the Agent Audit button. This is the full design described above.

**Strengths:** High visibility. Delivers the combined coverage number. The root cause hypothesis list is generative — it gives the player a lens to re-examine their agent. The "Redesign RELAY-C" shortcut removes friction.
**Weaknesses:** Disruptive on first encounter. Players may dismiss without reading. Root cause hypotheses are inferential and may be wrong — the game can surface them as possibilities, not conclusions.

### Option C — Agent Health Score Integration

Multi-cluster detection feeds into a persistent "Agent Health Score" — a per-agent metric visible in the workbench agent inspector at all times. Each multi-cluster event increments the "structural review flag" counter. The agent's health score shows:

```
RELAY-C
  Match history: 145 matches
  Last redesign: Season 1 (Match 12)
  Cluster events: 2  [last: Career Analysis run 4]
  Health score: ⚠ STALE — last reviewed 133 matches ago
```

**Strengths:** Persistent visibility. The signal doesn't disappear after one debrief. Players who ignore the debrief modal will still encounter the health score in the workbench.
**Weaknesses:** Requires agent inspector UI investment. "Stale" framing could feel like nagging. What does "healthy" actually mean mechanically?

### Option D — Multi-Cluster as Mission Trigger

When multi-cluster is detected for the third consecutive career analysis run on the same agent, a side mission unlocks: **"The RELAY-C Audit."** This is a structured mission where the player is given a pre-designed scenario that specifically stresses all three of the clustered elements simultaneously. The mission can only be completed by a holistic redesign — patching any one element will not produce a passing score.

**Strengths:** Makes the diagnostic insight concrete through challenge. Forces holistic thinking by mechanical requirement. The mission is highly teachable (designer can construct a scenario where element-by-element is demonstrably suboptimal).
**Weaknesses:** Delays the insight — player must encounter multi-cluster 3x before the mission triggers. Mission-design complexity: the scenario must be constructed so that no single-element fix succeeds. Potentially too prescriptive — removes player agency.

---

## Player Journeys

#### Journey: Marcus, 34, Product Manager — First Multi-Cluster Encounter

**Context:** Marcus has been playing for 5 weeks. He's in Season 2, Match 190. He just ran his career analysis after noticing his win rate plateau. He's applied element-by-element fixes three times over the last two seasons and keeps seeing "fix this, then fix that" on the same RELAY-C agent. He doesn't have language for what's happening.

**Minute 0:00 — Career Analysis Loads**

Marcus clicks "Run Career Analysis" from the post-match debrief. The analysis runs for 3 seconds (spinner). The result panel fades in.

He sees the runner-up list, skims to #1, and reaches for the [Apply Fix] button on RELAY-C context buffer.

Then the flag fires.

A soft amber banner slides down from the top of the panel — smooth 300ms ease-out, not jarring. The banner reads:

> ⚠ **Agent Multi-Cluster Detected**
> RELAY-C appears in 3 of your top 5 candidates. Individual fixes address symptoms. This agent may have a structural problem.
> `[View Agent Audit →]`  `[Skip — apply #1 fix anyway]`

Marcus pauses. He's never seen this banner before. The word "structural" catches him — it sounds like an engineering diagnosis, not a game message.

He reads the banner twice.

"Structural problem" — he's heard that phrase at work. Not "broken" but "designed wrong from the start."

He clicks `[View Agent Audit →]`.

**Minute 0:45 — Agent Audit Panel**

The agent audit opens as an overlay panel, sliding in from the right at 400ms. The left half of the screen still shows the runner-up list (dimmed), the right half shows RELAY-C's audit.

Marcus reads the cluster members. He sees the combined coverage number: 71% if all three are fixed, vs. 62% from #1 alone. 9pp difference — he's not sure if that's significant.

He scrolls down to POSSIBLE ROOT CAUSES. He reads:

> *"Role drift: agent design last updated Season 1. Role changed from short-range to 3-hop relay since Season 2."*

He stops. He *did* expand RELAY-C's role in season 2. He never went back and rebuilt it for the new role — he just kept patching the parameters that kept appearing as candidates.

The phrase "role drift" crystallizes what's been happening. He's been treating symptoms because he didn't have a name for the root cause.

**Minute 1:20 — Decision Point**

Marcus looks at the three options at the bottom: `[Apply All Three Fixes →]` `[Redesign RELAY-C →]` `[Dismiss]`

He's tempted by "Apply All Three Fixes" — it's one click and 71% coverage. But the word "redesign" has weight. He doesn't know what redesigning the agent would involve.

He clicks `[Redesign RELAY-C →]`.

The workbench opens with RELAY-C isolated. The other agents are visible but grayed out in the agent roster. The buffer visualization focuses on RELAY-C. A modal header reads: "RELAY-C Redesign Mode — changes here are isolated until deployed."

Marcus spends 15 minutes completely rebuilding RELAY-C's context config from scratch, this time sized for 3-hop relay (large buffer, deep priority queue, aggressive filter to compensate).

He feels, for the first time, like he's doing architecture rather than debugging.

**UI Annotations:**
- Amber banner: 60px height, slides from top of panel, stays visible until explicit dismiss; amber chosen (not red) because this is informational not critical
- Agent audit overlay: 40% screen width, left 60% shows dimmed runner-up list; "dimmed" = 40% opacity reduction so context isn't lost
- Root cause list: generated from config history diff + dependency graph; presented as "possible" not "confirmed" to avoid false authority
- Combined coverage number: displayed in larger text than individual coverages, formatted "+9pp over #1 fix alone" to make the incremental value clear
- Redesign mode indicator: persistent modal header strip across top of workbench, amber background, so player never forgets they're in an isolated redesign session

---

#### Journey: Priya, 28, Software Engineer — Recognizes the Pattern Immediately

**Context:** Priya has 300 hours of play. She's been doing career analyses since Season 2 and has seen the multi-cluster flag before — she now recognizes it as a signal she's been over-patching. She's currently in competitive Gauntlet mode (Season 4) and just got a multi-cluster result on COMMAND-A.

**Minute 0:00 — Banner Fires**

Priya sees the amber banner. She doesn't read it carefully — she already knows what it means. She clicks `[View Agent Audit →]` immediately.

**Minute 0:10 — Reading the Audit**

She reads the cluster members and combined coverage (58%, up from 51% on #1 alone — only +7pp, which she notes is a smaller increment than usual).

She reads the root causes:
> *"Dependency gap: signal input profile changed when SCOUT-B was rebuilt (Match 280). COMMAND-A config has not been retuned."*

Yes. She rebuilt SCOUT-B three months ago and never audited COMMAND-A afterward. Classic.

**Minute 0:20 — Strategic Calculation**

Priya is in Gauntlet mode. Her next match is in 4 hours (scheduled against a known opponent). She asks herself: is a full COMMAND-A redesign worth it before this match, or should she apply the top fix (51% coverage) and take the known improvement?

She looks at the combined coverage: +7pp from a complete overhaul. That's real but marginal. She also reads the "Possible Root Cause" — dependency gap. Fixing the dependency gap requires understanding what SCOUT-B now produces and retuning COMMAND-A's attention filters to match. That's a 90-minute job, minimum.

Her opponent in 4 hours is not known for hook-heavy strategies (she checked the threat model report, 4.57). COMMAND-A's structural problem is mainly exposed by hook-heavy pressure. For this specific match, the element-level fix might be sufficient.

She clicks `[Apply All Three Fixes →]`. She'll redesign COMMAND-A properly before the next Gauntlet season.

**Minute 0:35 — Fast Application**

The three fixes are applied as a batch. The workbench shows a brief animation — each fixed element in COMMAND-A's config briefly highlights teal as the change is written. A confirmation toast: "3 fixes applied to COMMAND-A. Deploy queue updated."

Priya notes the combined coverage number for her session log: "+7pp, dependency gap noted for season 5 rebuild."

**What Priya Found Valuable:**
- The combined coverage number let her do a cost-benefit calculation quickly
- The root cause hypothesis ("dependency gap") named the problem she already suspected
- The batch apply option ("Apply All Three") matched her time-constrained workflow perfectly

**What Priya Would Want (Feature Request):**
- An "estimated redesign complexity" rating ("~90 minutes" or "HIGH" complexity) based on how many elements are clustered and their dependency depth
- A "schedule redesign reminder" button that adds a note to the workbench for next session
- A filter in career analysis history: "show only cluster events" to review how often this pattern has occurred for each agent

---

#### Journey: Soren, 17, Student — First Encounter, No Engineering Background

**Context:** Soren has been playing for 6 weeks. He's in Season 2, Match 110. He's been mostly playing PvE missions and occasionally running career analysis when the tutorial recommends it. He doesn't have an engineering background — the terms "architecture" and "structural" are novel to him. He's been patching SCOUT-A every analysis and not understanding why the problems keep coming back.

**Minute 0:00 — The Banner Appears**

Soren runs his career analysis. The banner appears. He reads it slowly.

"Agent Multi-Cluster Detected" — okay, something is detected.
"SCOUT-A appears in 3 of your top 5 candidates" — SCOUT-A keeps breaking things?
"Individual fixes address symptoms" — he knows what symptoms are from when he was sick.
"This agent may have a structural problem" — structural? Like a building?

He clicks `[View Agent Audit →]` because the button says "View" and he wants to see what it found.

**Minute 0:30 — Agent Audit — Lost on Vocabulary**

He sees the audit panel. The combined coverage number (67%) is just a number to him — he doesn't yet understand what coverage means in this context.

He scrolls to POSSIBLE ROOT CAUSES and reads:

> *"Role drift: agent design last updated Season 1. Role changed from short-range to long-range scouting since Season 2."*

He understands this one. He did change SCOUT-A from short-range to long-range (the tutorial told him to). He didn't know that changing the role meant he should also rebuild the agent.

He clicks the `[?]` info icon next to "POSSIBLE ROOT CAUSES."

A tooltip expands: "An agent's design should match its current role. If you change what an agent does without rebuilding how it thinks, the mismatch creates ongoing problems. This is called 'role drift.'"

Soren reads it. "Rebuilding how it thinks" makes sense — it's like changing a job description for a worker without retraining them.

**Minute 1:00 — Choosing the Redesign Path**

He sees the three buttons. "Apply All Three Fixes" sounds like it fixes things. "Redesign SCOUT-A" sounds like more work. "Dismiss" sounds like giving up.

He clicks `[Apply All Three Fixes →]`. The three fixes are applied.

A new tooltip fires (first-time-triggered): "You applied 3 fixes to the same agent. If this agent appears in your next career analysis, consider using the full Redesign tool to address the root cause."

Soren notes: "next time, redesign." He feels like he learned something, even though he took the easy path.

**What Soren Needed:**
- Plain language in root cause descriptions (not "dependency gap" but "SCOUT-A hasn't been updated since you changed what SCOUT-B sends it — they're out of sync")
- The tooltip on "structural" (with the building metaphor) that fires on first encounter
- Permission to take the easy path (Apply All Three) with a nudge about the next step

**What Would Have Lost Soren:**
- A mandatory modal that blocks progress until he "redesigns" the agent
- Technical language in the audit without definitions
- A combined coverage number without context (what is 67% *good* — should he care about 9pp?)

**UI Annotations:**
- `[?]` info icons on all technical terms in the audit panel on first encounter; collapse to hidden after the player has seen them 3 times (graduated disclosure)
- First-time-apply tooltip fires after "Apply All Three" on the player's first cluster event only; subsequent uses are silent
- Plain-language root cause generation: the root cause generator has a "simplified mode" toggled by player experience level (< 50 matches = simplified; ≥ 50 matches = technical); language simplification is controlled by a config in the campaign manager

---

## Interaction Effects

### With 4.49 — Cross-Mission Pattern Detection

Cross-mission pattern detection finds patterns *across* matches over time ("RELAY-C's hook threshold failed in 7 of your last 10 missions involving dense enemy formations"). Multi-cluster detection finds patterns *within* a single career analysis result ("3 of the 5 top candidates are RELAY-C elements").

These are **complementary, not overlapping**:
- Cross-mission detection runs longitudinally — it requires many matches to build signal
- Multi-cluster detection runs transversally — it fires immediately when a career analysis produces a clustered result

A powerful synthesis: when the same agent triggers *both* cross-mission patterns *and* multi-cluster events, the combined evidence is very strong. The system could surface this: "RELAY-C has triggered multi-cluster events in 2 of your last 3 career analyses AND appears in cross-mission pattern data for dense-formation scenarios. The structural problem may be specific to that scenario class."

### With 4.38 — Counterfactual History

When the player clicks `[Redesign RELAY-C →]`, the counterfactual history system preserves the pre-redesign config as a baseline. After the redesign is deployed and 20+ matches are played, the player can compare:

```
Counterfactual: "If I had stayed on RELAY-C v3.2 and kept applying individual fixes..."
  Projected match outcome: [simulated from baseline + top fix only]

Actual: "After RELAY-C v4.0 redesign"
  Match outcome: [real results]
```

This closes the learning loop: the player can see whether the holistic redesign actually outperformed the element-by-element patching it replaced.

### With 4.59 — Career Minimum Fix

The career minimum fix finds the single best config change across all agents. Multi-cluster detection is a complementary signal: it finds cases where the single-best-change framing is the *wrong* framing. When multi-cluster fires, the game is effectively saying "the career minimum fix is answering the right question about the wrong problem — the question should be 'what should change about RELAY-C as a whole,' not 'what single element should change.'"

The interaction effect: multi-cluster detection *enriches* the career minimum fix result. It doesn't replace it — it contextualizes it.

### With 4.65 — Pre-Ranking Adversarial Surface

An adversarial player could deliberately design a config where an agent they control in a PvP match appears to be causing a multi-cluster pattern in the opponent's career analysis. If the career analysis is run on matches against a specific opponent and that opponent's attacks always target the same agent's elements, a naive cluster detector might flag the player's agent as "structurally weak" when it's actually "being adversarially targeted."

The adversarial version of multi-cluster: engineering an opponent config that reliably stresses three distinct elements of the same target agent across all match types, causing the cluster flag to fire and potentially misleading the opponent into an unnecessary redesign. Counter-design: the cluster flag should note whether the clustered agent's failures are concentrated against a *specific opponent config* ("RELAY-C cluster occurs primarily in matches against [Opponent X]") vs. distributed across diverse opponents (which is the true structural signal).

### With 4.72 — Debt-Free Season Achievement

The "debt-free" season achievement (no single element responsible for >20% of losses) is a season-level goal. Multi-cluster detection is an early warning system that tells the player *which agent* is preventing them from reaching debt-free status.

A strong interaction: the season health dashboard (4.68) could show the multi-cluster history alongside the coverage trend. If RELAY-C has triggered multi-cluster in 3 of 6 career analyses, it is *the obstacle* to reaching the debt-free milestone. The dashboard could show: "RELAY-C is responsible for 41% of your remaining structural debt. A holistic redesign would reduce debt concentration by an estimated 28pp."

---

## Comparable Games / Media

### Warcraft III / StarCraft — Identifying the "Supply Block" Agent

In RTS games, the most common diagnostic error is patching the wrong unit. A player who keeps building marines to counter zerglings isn't fixing the strategic problem — they're fixing a symptom. The signal that you're operating at the wrong level comes from experience, not from the game itself. Multi-cluster detection is the equivalent of a coach saying "you keep making more marines — the real problem is your base layout forces you into reactive production."

### Opus Magnum — Histogram Without Grouping

The Zachtronics histogram shows cycles, area, and instructions as three independent metrics. It does NOT group by which arm in the puzzle is responsible for which metric. A player might spend hours optimizing arm #3 without realizing arms #1 and #2 are both slower than arm #3 due to a shared constraint on the track layout. Multi-cluster detection is the Zachtronics histogram with component-level attribution added — it groups metrics by the component that drives them.

### Hearthstone — Deck Analysis Tools

Third-party Hearthstone deck analyzers flag cards that compete for the same resources: "You have 5 cards requiring Spell Power but only 2 Spell Power generators — these cards underperform together." This is multi-cluster detection at the card level: multiple deck elements all dependent on one missing infrastructure piece.

### Factorio — The Bottleneck Trace

In Factorio, a player debugging throughput will look at a backed-up belt, trace it to an inserter, trace the inserter to a power failure, trace the power failure to a missing pole. The causal chain runs through multiple components before it hits the root cause. The player has to manually trace each connection. Multi-cluster detection is the equivalent of Factorio automatically highlighting the full causal chain from "backed-up belt" to "missing power pole" — not fixing it, but visualizing the structural scope of the problem.

### Software Engineering — "God Object" Detection in Code Review

In software engineering, a "god object" is a class that does too much — too many responsibilities, too many dependencies. Static analysis tools flag god objects by looking at how many other components depend on one class. If `DatabaseManager.java` is imported by 15 different modules, it's a god object candidate. Multi-cluster detection is the equivalent for agent configs: when 3+ different elements of the same agent keep appearing as fix candidates, that agent is becoming a god object — it is doing too much, or too much depends on it.

The vocabulary alignment is exact: "structural problem," "role drift," "dependency gap" — these are all real software engineering terms. The game uses them correctly, and the player encounters them for the first time in a game context where their meaning is concretely illustrated.

---

## Sensory Description

**What the cluster detection looks like:**

When the career analysis result panel loads and multi-cluster fires, the standard result list appears first at full opacity — then, 800ms later, the amber banner slides down from the top of the panel over 300ms. The delay is intentional: let the player register the normal list, then interrupt. The banner is 60px tall, amber (#FFB347 background, dark brown text), with a warning icon (⚠) on the left, the message text, and two buttons flush right.

Below the banner, the runner-up list is still visible. The clustered rows (#1, #3, #5) gently pulse a warm amber glow — not flashing, a slow 1.5-second sine wave, barely noticeable until you look for it. A thin vertical bracket line, amber, connects the left edges of the three clustered rows. The bracket has a subtle end-cap design (a small horizontal line at top and bottom) that distinguishes it from ordinary list decoration.

**What the agent audit panel looks like:**

The agent audit panel slides in from the right at 400ms ease-in-out. The left 60% of the screen shows the dimmed runner-up list (at 40% opacity); the right 40% is the audit panel with a white background and clean typography. The agent name ("RELAY-C") is displayed in large text (24px) at the top, followed by its health indicators in a two-column grid (version, age, last redesign, cluster event count).

Below the health indicators, the cluster members are displayed as a numbered list. Each entry has a small "current value → suggested value" indicator in medium gray — not the focus, but visible for reference. The "combined coverage" figure is displayed in a highlighted box: large text (20px), teal background, "71% combined vs. 62% top candidate (+9pp)" on two lines.

The root cause hypotheses are displayed as bullet points in a collapsible section, with a light gray background to distinguish them from the measurement data. Each hypothesis is preceded by a small emoji-style icon: 🔄 for role drift, ⛓ for cascade, 🔗 for dependency gap. The icons are not decorative — they're vocabulary: the player will learn to associate the drift/cascade/gap icons with specific problem types.

**What the redesign mode feels like:**

When the player enters redesign mode, the battlefield Pixi canvas in the background fades to a very dark gray (85% black overlay) with only RELAY-C's range indicators still visible as dim circles. The workbench panel comes fully forward. A coral-colored modal header strip across the top of the screen reads "REDESIGN MODE — RELAY-C ISOLATED" in small caps. The changes the player makes glow with a faint coral border (vs. the standard teal for non-isolated changes) to remind them they're in a sandbox.

**Audio:**

The multi-cluster banner arrives with a soft two-tone chime — a rising minor third (D to F), at low volume, distinct from the neutral "analysis complete" single tone. It's not alarming; it's the audio equivalent of a gentle hand on the shoulder. If the player enters redesign mode, a low drone fades in under the workbench ambient — a held chord in a lower register that signals "you're doing architecture work now." The drone is the same audio motif that plays during campaign chapter transitions, creating a subliminal association between "redesign mode" and "chapter-level decisions."

---

## The TikTok Clip

A player is narrating a career analysis. The result loads. They start to hover over the #1 fix button. The amber banner slides down. They pause. They read it out loud: "Agent multi-cluster detected." They click View Agent Audit. The panel opens. They scroll to root causes. They read "role drift" and say "...oh. Oh, I've been doing this wrong for two seasons." The chat erupts. The clip title: "The game just diagnosed my biggest mistake." This clip transmits both the design's depth (the game *noticed*) and its gentleness (it didn't yell — it just said: here's what you might be missing).

---

## Newly Discovered Aspects

From this exploration, the following new aspects should be added to the frontier:

- **4.69a** — Multi-cluster threshold configurability: letting players set whether 2+, 3+, or 4+ appearances triggers the flag; accessibility consideration (2+ fires constantly for new players with concentrated configs); expert mode consideration (4+ threshold for players who want less interruption)
- **4.69b** — Combined agent coverage score display: showing "if ALL of this agent's clustered elements were fixed, combined coverage = X%" as a first-class metric in the career analysis panel; question of whether this number should be pre-computed or on-demand
- **4.69c** — Agent redesign mode as a dedicated workbench state: full design of the isolated redesign sandbox — how the player enters, what UI affordances are available, how changes are staged vs. committed, how the simulation differs from normal workbench operation
- **4.69d** — Multi-cluster persistence tracking: tracking whether the same agent triggers multi-cluster across multiple career analyses (RELAY-C flagged in 3 of 6 analyses); the "persistent offender" agent as a named archetype with dedicated treatment in the season health dashboard
- **4.69e** — Adversarial multi-cluster poisoning: opponent config design strategy that stresses 3+ elements of the same target agent across all match types, deliberately triggering the player's cluster flag to mislead them into an unnecessary redesign; counter-design — cluster flag distinguishes "clustered across all opponents" (structural) from "clustered against specific opponent" (adversarial)
- **4.69f** — "Apply All Three" batch deployment: detailed design of the multi-fix batch application — sequencing (apply in order of coverage? in order of dependency?), conflict detection (what if fixes conflict with each other?), rollback affordance, confirmation dialog
- **4.69g** — Agent cluster as a unit of analysis in career stats: career statistics dashboard that shows per-agent multi-cluster frequency history; "RELAY-C has triggered 4 cluster events in 180 matches — your longest-running structural debt"; the "agent debt ledger" as a companion to the match-level architectural debt metrics
