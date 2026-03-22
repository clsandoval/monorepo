# Agent Cluster as a Unit of Analysis in Career Stats

**Aspect:** 4.69g — Agent cluster as a unit of analysis in career stats: career statistics dashboard that shows per-agent multi-cluster frequency history; "agent debt ledger" as companion to match-level architectural debt metrics.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69b — Combined agent coverage score display; 4.69d — Multi-cluster persistence tracking; 4.69e — Adversarial multi-cluster poisoning; 4.69f — "Apply All Three" batch deployment
**Related:** 4.68 — Coverage percentage as season health; 4.25 — EDT trajectory as career metric; 4.49 — Cross-mission pattern detection; 7.10 — Config necropsy as community artifact

---

## The Core Problem

The multi-cluster detection system (4.69) fires within a single career analysis run. The persistence tracker (4.69d) watches whether the same agent clusters repeatedly across analyses. But neither system answers the question that a serious player eventually asks while reviewing their career profile: **which agents have been my chronic problems, and how does that chronic debt compare across my entire roster?**

The existing career stats surface — win rate, eEDT trajectory, coverage percentage — all treat the player's config as a monolithic thing. Win rate measures outcomes. eEDT measures match depth. Coverage measures season health. None of them attribute performance *to specific agents* over time. The player knows their win rate is 58%, but they cannot look at a single dashboard and say: "RELAY-C has been responsible for 31% of my career analysis interventions across four seasons, while every other agent averages 8%."

This is the problem the **Agent Debt Ledger** solves. It takes multi-cluster events — which currently exist as ephemeral moments during debrief — and aggregates them into a persistent, per-agent, career-spanning statistical surface. The cluster is no longer a one-time flag. It becomes a **unit of analysis** — a first-class object in the career stats system, with its own history, its own trend line, and its own contribution to the player's overall architectural debt profile.

The deeper design question: what happens when the player can finally see, quantified and graphed, that one agent has been the source of most of their structural problems for months? The answer should be architectural insight, not guilt. The ledger is a diagnostic tool, not a blame ledger. Its purpose is to make the invisible pattern visible — the same purpose as eEDT making opener quality visible, or coverage percentage making season health visible. The Agent Debt Ledger makes *agent-level technical debt* visible.

---

## The Design

### The Agent Debt Ledger

The Agent Debt Ledger is a new panel accessible from the Career Stats dashboard — the same dashboard that shows win rate, eEDT, and season coverage history. It appears as a fourth tab: **Roster | Matches | Season | Debt Ledger**.

The ledger shows every agent in the player's current and historical roster, ranked by **Cluster Debt Score (CDS)** — a composite metric derived from three inputs:

1. **Cluster frequency** — how many times this agent has triggered a multi-cluster event across all career analyses, normalized by the number of career analyses run. An agent that clustered in 4 of 10 analyses has a frequency of 0.40.
2. **Cluster severity trend** — whether the cluster is growing (more elements per event) or shrinking. Worsening severity multiplies the base score by 1.3x. Improving severity multiplies by 0.7x. Stable is 1.0x.
3. **Time since last redesign** — an agent that hasn't been redesigned in 120 matches and is still clustering has higher debt than one that clustered twice but was rebuilt 15 matches ago. The redesign recency acts as a decay factor: recent redesigns pull the score toward zero.

The CDS is not a single number displayed to the player. It is the internal sort key. What the player sees is the ranked list and the raw data:

```
AGENT DEBT LEDGER — Season 1 through Season 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                                        Cluster  Last        Severity
Agent         Clusters / Analyses  Freq  Share   Redesign     Trend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELAY-C         4 / 10           0.40    38%    S1 M12      ▲ WORSENING
SCOUT-A         2 / 10           0.20    19%    S2 M87      ─ STABLE
COMMAND-A       2 / 10           0.20    19%    S3 M145     ▼ IMPROVING
STRIKER-B       1 / 10           0.10    10%    S2 M60      ─ STABLE
RELAY-D         1 / 10           0.10    10%    S4 M180     ─ NEW
SCOUT-B         0 / 10           0.00     0%    S3 M130     ─ CLEAR
SPECIALIST-A    0 / 10           0.00     0%    S4 M170     ─ CLEAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total cluster events: 10 across 10 career analyses
Roster debt concentration: RELAY-C holds 38% of all cluster debt
```

### Cluster Share

The **Cluster Share** column is the percentage of total cluster events attributable to each agent. This is the number that makes architectural imbalance visible at a glance. If RELAY-C holds 38% of all cluster events across a roster of 7 agents, the debt is concentrated. If no agent exceeds 15%, the debt is distributed — which is healthier.

Cluster Share connects directly to the Coverage Percentage (4.68) and the Debt-Free Season Achievement (4.72). The season health dashboard already tracks whether a single element dominates loss attribution. Cluster Share does the same thing at the agent level, across a longer time horizon. A player pursuing the "debt-free season" achievement can look at the Debt Ledger to identify which agent is the obstacle.

### The Cluster History Spark-Line

Each agent row in the ledger is expandable. Clicking an agent row unfolds a detail panel showing a **cluster history spark-line** — a horizontal bar divided into segments, one per career analysis run. Segments where the agent clustered are filled amber. Segments where it did not are filled dark gray. The visual is immediate: a bar that's mostly amber means this agent clusters almost every time.

```
RELAY-C — Cluster History
Career Analysis:  1   2   3   4   5   6   7   8   9  10
                 [ ] [■] [ ] [■] [ ] [■] [ ] [ ] [ ] [■]
                      ↑         ↑         ↑              ↑
                   3 elem    3 elem    4 elem          3 elem
                   58%cc     64%cc     71%cc           62%cc
```

Below the spark-line, the detail panel shows:
- **Combined coverage at each cluster event** (the "cc" values above) — letting the player see whether the scope of the problem has grown or shrunk
- **Player action taken** at each event (dismissed, applied #1, applied all, entered redesign)
- **Config version active** at each event — showing whether fixes applied between events actually changed anything

The player action log is the most narratively powerful element. It lets the player see their own decision history: "I dismissed the first cluster, applied #1 the second time, applied all three the third time, and it still came back a fourth time." The pattern of escalating responses followed by recurrence tells a story without commentary. The data speaks.

### The Debt Concentration Indicator

At the top of the Debt Ledger panel, a single summary metric: **Debt Concentration Index (DCI)**. This is a Herfindahl-style index — the sum of squared Cluster Shares across all agents. A roster where one agent holds all the debt has DCI approaching 1.0. A roster where debt is evenly distributed has DCI near 1/N (where N is the number of agents that have ever clustered).

The DCI is displayed as a single number with a qualitative label:

```
Debt Concentration Index: 0.24 — CONCENTRATED
[■■■■■■■■░░░░░░░░░░░░░░] ← visual bar, filled to 0.24
```

DCI thresholds:
- **< 0.15**: DISTRIBUTED — no single agent dominates your structural debt
- **0.15 – 0.30**: CONCENTRATED — one or two agents are responsible for most cluster events
- **> 0.30**: CRITICAL — a single agent is overwhelmingly your structural bottleneck

The DCI bar is colored: teal for DISTRIBUTED, amber for CONCENTRATED, coral for CRITICAL. The transition between colors is continuous, not stepped — the bar gradient shifts smoothly as DCI changes.

### Season-Over-Season Comparison

The Debt Ledger supports a season filter. The player can view debt stats for "All Time," "Current Season," or any individual past season. When switching between seasons, the table animates — rows slide up or down as their rank changes, and the Cluster Share percentages counter-animate to their new values. An agent that was #1 in Season 2 but dropped to #4 by Season 4 visibly slides down the table.

This animation is not decorative. It communicates *debt mobility*: which agents are improving, which are getting worse. A player watching RELAY-C stay pinned at #1 across four season views while other agents shuffle around it sees the persistence as motion (everything else moves) and stasis (RELAY-C doesn't).

---

## Player Journeys

#### Journey: Marcus, 34, Product Manager — Discovering the Pattern He Missed

**Context:** Marcus has been playing for four months, currently in Season 4 of the Gauntlet. He's run 10 career analyses over that span. He knows RELAY-C has been problematic — he's seen the multi-cluster flag three times — but he's never connected the events into a trend. He's just applied fixes each time and moved on. Today he notices the "Debt Ledger" tab for the first time.

**Minute 0:00 — Opening the Ledger**

Marcus opens his Career Stats dashboard from the post-match screen. He's looked at win rate (58%) and eEDT (0.44, trending up) before. Today he notices the fourth tab: "Debt Ledger." The tab has a small amber dot on it — a notification badge indicating new data since his last view. He clicks it.

The ledger loads. The table fades in row by row, top to bottom, each row appearing 80ms after the previous. RELAY-C is at the top. The Cluster Share column reads 38%. The severity trend arrow points up with the word WORSENING in amber text.

Marcus stares at the 38% number. He's never seen this stat before. Thirty-eight percent of his career's cluster events are RELAY-C.

**Minute 0:20 — Expanding the History**

He clicks the RELAY-C row. The detail panel unfolds downward with a smooth 300ms accordion animation. The cluster history spark-line appears: four amber blocks out of ten, spaced across his career. Below each amber block, the combined coverage numbers: 58%, 64%, 71%, 62%.

He reads his own action log:
- Run 2: "Dismissed agent audit"
- Run 4: "Applied All Three fixes"
- Run 6: "Applied All Three fixes"
- Run 10: "Applied #1 fix only"

He didn't remember dismissing the audit the first time. He didn't remember that he'd applied batch fixes *twice* and the problem came back both times. The action log is a mirror — it shows him his own pattern of half-measures. Not cruelly. Just factually.

**Minute 0:45 — The Concentration Index**

He scrolls up to the Debt Concentration Index at the top: 0.24 — CONCENTRATED. The amber bar fills roughly a quarter of the track. He reads the label: "One or two agents are responsible for most cluster events."

He looks back at the table. RELAY-C at 38%, SCOUT-A and COMMAND-A tied at 19% each. The other four agents are at 10% or below. The distribution is visually obvious — the first row's Cluster Share bar is nearly twice as long as any other.

Marcus feels something he's never felt in the game before: the recognition that he's been avoiding a structural decision. Not consciously avoiding it — the game doesn't punish avoidance — but the data makes the avoidance visible. Four cluster events. Two batch fixes. Still clustering.

He clicks the "Redesign RELAY-C" shortcut at the bottom of the detail panel.

**Minute 1:15 — Entering Redesign Mode with New Context**

The workbench opens in Redesign Mode (coral header strip, isolated agent). But this time, Marcus has something he didn't have in previous redesign attempts: the full cluster history. The detail panel persists as a collapsible sidebar in redesign mode, showing all four cluster events, the elements that clustered each time, and the combined coverages.

He can see that "context buffer" appeared in all four clusters. "Fallback filter" appeared in three. "Priority queue depth" appeared in three. "Burst threshold" appeared once. The intersection is clear: context buffer and fallback filter are the chronic elements. Everything else orbits those two.

He rebuilds RELAY-C from scratch, starting with a buffer architecture twice the size of the original, and a filter designed for the new buffer size. For the first time, he's not patching. He's rebuilding. The debt ledger gave him the evidence he needed to justify the effort.

---

#### Journey: Priya, 28, Software Engineer — Using the Ledger for Competitive Preparation

**Context:** Priya is preparing for a Gauntlet tournament. She has 350+ hours and knows her roster intimately. She opens the Debt Ledger not to discover problems — she already knows COMMAND-A is her weakest agent — but to quantify her roster's vulnerability profile before the tournament.

**Minute 0:00 — The Pre-Tournament Audit**

Priya opens the Debt Ledger and switches the season filter to "Season 4 only." The table re-sorts with a smooth row-slide animation. In Season 4 alone, COMMAND-A has clustered in 2 of 3 career analyses — a frequency of 0.67, far higher than its all-time 0.20.

She didn't notice this acceleration because Season 4 is only three weeks old. But the per-season view makes it stark: COMMAND-A went from a moderate historical offender to the dominant one this season.

**Minute 0:15 — Cross-Referencing with EDT**

Priya opens her eEDT trajectory (4.25) in a side panel. She lines up the timeline: her eEDT dipped from 0.55 to 0.48 at the start of Season 4. She now suspects the dip correlates with COMMAND-A's increased clustering. If COMMAND-A's structural problems are forcing early resolutions (her command structure collapses under pressure, shortening effective match duration), the eEDT dip is a downstream symptom.

She's never made this connection before. The Debt Ledger didn't tell her about the eEDT connection — she inferred it by having both data surfaces open simultaneously. The game designed the surfaces to be spatially adjacent; the player makes the connection.

**Minute 0:30 — Exporting for the Necropsy Thread**

Priya takes a screenshot of the Debt Ledger with COMMAND-A expanded. She pastes it into her tournament prep document alongside her eEDT chart. The visual pairing — amber blocks on the cluster spark-line aligning with the eEDT dip — tells the story clearly.

She posts a compressed version to the community `#config-necropsies` channel: "Season 4 pre-tournament audit. COMMAND-A frequency spiked to 0.67 this season. Correlates with eEDT dip. Redesigning before Saturday." Three community members respond with suggestions for command-structure architectures that handle pressure better.

**What Priya demonstrates:** The Debt Ledger is not just a debrief tool — it is a **preparation tool**. Competitive players will use it proactively to identify vulnerabilities before they cost matches in high-stakes settings.

---

#### Journey: Soren, 17, Student — First Encounter, Learning What "Debt" Means

**Context:** Soren has been playing for two months. He's run 4 career analyses total. He has 2 cluster events on SCOUT-A. He opens the Debt Ledger because his friend told him about it on Discord.

**Minute 0:00 — The Tab Has a Badge**

Soren sees the amber dot on the "Debt Ledger" tab. He clicks it. The table loads. It's smaller than Marcus's — only 4 agents, and only 2 have ever clustered.

```
Agent         Clusters / Analyses   Freq   Cluster Share
SCOUT-A          2 / 4             0.50      67%
STRIKER-B        1 / 4             0.25      33%
```

The Debt Concentration Index reads 0.56 — CRITICAL. The bar is filled in coral, more than halfway across the track.

**Minute 0:10 — "Critical" Feels Alarming**

Soren sees "CRITICAL" in coral text and his first reaction is anxiety. His roster sounds broken. He hovers over the DCI label. A tooltip appears:

> **Debt Concentration Index** measures how evenly your cluster events are spread across your agents. "Critical" means most of your structural issues come from one agent. This is normal early in your career — you have fewer agents and less tuning history. As you build and diversify your roster, this number will naturally decrease.

The "this is normal early in your career" line is load-bearing. Without it, Soren would interpret CRITICAL as failure. With it, he reads it as a natural starting state he'll grow out of. The tooltip is calibrated to player experience: it only includes the "normal early" language when the player has fewer than 8 career analyses on record.

**Minute 0:20 — Expanding SCOUT-A**

He clicks the SCOUT-A row. The detail panel shows the cluster history spark-line: two amber blocks out of four. Below, his action log:
- Run 2: "Applied #1 fix only"
- Run 4: "Applied All Three fixes"

He sees the combined coverage grew from 52% to 61% between the two events. He doesn't yet understand what that growth means, so he hovers over the "61%" number. A tooltip: "If all clustered elements were fixed together, 61% of analyzed matches would improve. This grew from 52% — meaning the scope of the problem is expanding."

"The scope of the problem is expanding" is a sentence Soren has never read in a game before. He feels like the game is teaching him something real. He's right — the vocabulary of structural debt is being introduced through experience, not through a tutorial page.

**Minute 0:35 — Deciding What to Do**

Soren doesn't click "Redesign SCOUT-A" — he doesn't feel confident enough to rebuild an agent from scratch yet. Instead, he takes a mental note: SCOUT-A is the one to watch. The next time the multi-cluster flag fires on SCOUT-A, he'll try the redesign path instead of batch-fixing.

The Debt Ledger planted a seed. It didn't force an action. It gave Soren a named frame ("cluster debt") and a quantified observation ("67% of your debt is SCOUT-A") that will make the next cluster event more meaningful.

---

#### Journey: Elena, 42, Systems Architect — The "Zero Debt" Campaign

**Context:** Elena has 500+ hours and plays Robot Uprising specifically because the vocabulary maps to her day job. She read about the Debt-Free Season achievement (4.72) on a community forum and decided to pursue it. She opens the Debt Ledger as her primary planning tool.

**Minute 0:00 — Baseline Assessment**

Elena opens the Debt Ledger filtered to "Current Season." She has 6 career analyses this season. Her DCI is 0.19 — CONCENTRATED, but barely. Two agents have clustered once each. No agent has clustered more than once.

She's close to debt-free. The achievement requires a full season with no agent exceeding 20% coverage in any career analysis — but the Debt Ledger shows her a complementary metric: cluster frequency at zero for all agents.

**Minute 0:10 — The Preventive Redesign**

She looks at her roster. RELAY-D has a cluster frequency of 0.17 this season (1 cluster in 6 analyses). The severity was STABLE and the combined coverage was only 48%. Not alarming — but Elena knows from experience that a single cluster event in a season often becomes two if left unaddressed.

She clicks into RELAY-D's detail panel, reads the clustered elements (buffer overflow handler, signal priority config), and decides to do a preventive redesign. Not because the game told her to — but because the Debt Ledger gave her the data to make a risk-informed decision. She's treating the Debt Ledger as a risk register, exactly the way she treats dependency vulnerability reports at work.

**Minute 0:30 — The Season Comparison Moment**

Elena switches the season filter from "Current Season" to "Season 2" — her worst season, six months ago. The table re-sorts with the row-slide animation. COMMAND-A jumps to #1 with a cluster frequency of 0.60 and a DCI of 0.41 — CRITICAL. She watches the animation: rows shuffling, bars resizing, the DCI indicator sliding from teal into deep coral.

She switches back to "Current Season." The DCI slides back to 0.19 — CONCENTRATED but manageable. The visual transition between her worst season and her current state is the most satisfying thing she's seen in the game in weeks. She screenshots the two states side by side and posts them to the community `#config-necropsies` channel with the caption: "Season 2 DCI 0.41 to Season 6 DCI 0.19. This is what roster discipline looks like."

---

## Strengths and Weaknesses

### Strengths

**Makes agent-level technical debt visible for the first time.** No existing career surface attributes performance to specific agents over time. The Debt Ledger fills a genuine analytical gap — the player can finally answer "which agent is my chronic problem" with data instead of intuition.

**Creates a persistent, career-spanning narrative.** Multi-cluster events were ephemeral — they fired during debrief and disappeared. The ledger captures them as history. The player's relationship with each agent gains a quantified backstory: "RELAY-C has been my biggest problem for four seasons" is a sentence that could not be constructed from any existing surface.

**Connects to the Debt-Free Season achievement organically.** The ledger is both the diagnostic tool for identifying what blocks debt-free status and the scorecard for measuring progress toward it. Players pursuing the achievement will live in this panel.

**Bridges to community sharing.** The Debt Ledger is inherently shareable — a ranked list of agent-level problems with trend data. Config necropsy culture (7.10) gains a new artifact type: the "debt profile comparison" where players post their DCI evolution over seasons as a measure of architectural discipline.

**Vocabulary transfer to real engineering.** "Debt concentration," "cluster frequency," "severity trend" — these terms map directly to real technical debt management in software engineering. Players who learn this vocabulary in Robot Uprising carry it into professional contexts.

### Weaknesses

**Small sample problem for new players.** A player with only 3 career analyses has a Cluster Share distribution dominated by noise. One cluster event gives an agent 100% share. The DCI is meaningless at N<5. Mitigation: display the ledger in provisional mode (gray, italic, "preliminary data — run more career analyses for reliable trends") when fewer than 5 analyses exist.

**CDS internal ranking may feel opaque.** The sort order combines frequency, severity trend, and redesign recency — but the player only sees the raw data, not the formula. If an agent with lower cluster frequency appears above one with higher frequency (because the severity trend is worse), the player may be confused by the ordering. Mitigation: show the sort key on hover ("Sorted by: frequency x severity x recency") and let the player click column headers to re-sort by any single dimension.

**Risk of analysis paralysis.** A player who opens the Debt Ledger and sees CRITICAL concentration may feel overwhelmed — especially if the debt has been accumulating for multiple seasons. The ledger shows the problem clearly but doesn't prescribe a solution path. Mitigation: add a "Start Here" recommendation at the bottom of the panel that highlights the single highest-impact redesign opportunity, with an estimated combined coverage improvement.

**Doesn't distinguish between agent complexity and agent debt.** A complex agent with many configurable elements will naturally appear in more cluster events simply because it has more elements that *can* cluster. A simple agent with 2 elements can never trigger a 3-element cluster. The ledger doesn't normalize for agent complexity. Mitigation: future aspect (4.69h) could explore a normalized debt score that accounts for element count per agent.

---

## Interaction Effects

### With 4.69d — Multi-Cluster Persistence Tracking

The persistence tracker provides the raw event stream; the Debt Ledger aggregates it into career-level statistics. They are complementary layers: persistence tracking says "RELAY-C clustered again this analysis," the Debt Ledger says "RELAY-C has clustered in 40% of all analyses across your career." The persistence tracker is the tick-level signal; the Debt Ledger is the season-level trend.

The critical design integration: when the persistence tracker marks an agent as a "Persistent Offender" (4.69d), the Debt Ledger row for that agent gains a persistent offender badge — a small amber shield icon next to the agent name. This connects the in-analysis diagnostic to the career-level view.

### With 4.25 — EDT Trajectory as Career Metric

The eEDT spark-line and the Debt Ledger cluster history spark-line share the same temporal axis — career analyses map to match ranges, which map to points on the eEDT curve. A sophisticated player (like Priya in Journey 2) can overlay these two spark-lines to detect correlation: "Every time RELAY-C clusters, my eEDT dips 0.05–0.08 in the surrounding matches."

Future enhancement: a "correlation view" toggle that overlays eEDT trajectory onto the Debt Ledger timeline, showing cluster events as vertical markers on the eEDT curve. This makes the causal hypothesis visually testable.

### With 4.68 — Coverage Percentage as Season Health

Coverage percentage tracks whether any single *element* dominates loss attribution in a season. The Debt Ledger tracks whether any single *agent* dominates cluster events across a career. These operate at different granularities (element vs. agent, season vs. career) but answer the same fundamental question: is your architectural debt concentrated or distributed?

The season health dashboard (4.68) could include a link to the Debt Ledger with the current season pre-filtered: "Your coverage concentration this season is driven by RELAY-C. View full agent debt history." This connects the match-level diagnostic to the career-level story.

### With 4.49 — Cross-Mission Pattern Detection

Cross-mission pattern detection finds recurring per-element failures across diverse match types. The Debt Ledger aggregates per-agent cluster events across career analyses. If cross-mission detection finds that RELAY-C's context buffer fails specifically in dense-formation missions, and the Debt Ledger shows RELAY-C clustering in career analyses that include dense-formation missions, the combined signal is: "RELAY-C's structural problem is scenario-specific. A redesign should focus on dense-formation performance."

### With 7.10 — Config Necropsy Culture

The Debt Ledger becomes a first-class necropsy artifact. A player posting a config evolution retrospective can include their DCI trajectory over seasons: "Season 2: DCI 0.41 (RELAY-C dominated everything). Season 4: DCI 0.12 (distributed debt, no chronic offenders). Here's what I changed." The DCI evolution chart is a more compact and shareable summary of architectural improvement than the full cluster history. It becomes the "before/after" metric for necropsy threads about roster-level improvements.

---

## Comparable Games / Media

### Destiny 2 — Stat Trackers and Weapon Kill Counts

Destiny 2 tracks per-weapon kill counts and per-activity completion rates. Players develop attachment to specific weapons through these persistent statistics. The Debt Ledger creates a similar per-component narrative — but inverted. Instead of tracking success per weapon, it tracks *failure attribution* per agent. The emotional dynamic is different (pride vs. diagnostic honesty) but the structural principle is the same: persistent per-component statistics create a relationship between the player and their tools.

### Magic: The Gathering — Sideboard Analytics in Arena

MTG Arena tracks which sideboard cards are boarded in most frequently and their win-rate contribution when boarded. This per-card contribution analysis across matches is structurally identical to per-agent cluster share across career analyses. Sideboard analytics answer "which cards am I relying on as fixes?" — Debt Ledger answers "which agents keep needing fixes?"

### Software Engineering — SonarQube Technical Debt Dashboard

SonarQube displays a "technical debt" metric for software projects — estimated remediation time for all code quality issues, broken down by module and severity. The debt concentration view (which module holds the most debt) maps directly to the Debt Ledger's Cluster Share column. SonarQube's "debt ratio" (debt per lines of code) is the analogue of a future normalized debt score that accounts for agent complexity. The vocabulary overlap is not accidental — Robot Uprising's analytical vocabulary is drawn from software engineering because the players who deeply engage with these systems often *are* software engineers, and the vocabulary transfer is part of the game's identity.

### Factorio — Production Statistics Screen

Factorio's production statistics show per-item production and consumption rates over time, with line graphs for each item. Players use the production screen to identify bottlenecks: "iron plate production is flat while iron ore is increasing — something is wrong with smelting capacity." The Debt Ledger's cluster history spark-line is visually similar to Factorio's per-item production graphs — a time-series view of a per-component metric. The difference: Factorio shows throughput; Robot Uprising shows debt events. But the analytical motion is the same — scan the list for the outlier, click to expand, diagnose the trend.

### Professional Sports — Player Efficiency Rating (PER) in Basketball

The NBA's Player Efficiency Rating collapses a player's per-game statistics into a single composite number, enabling comparison across a roster. The Debt Ledger's Cluster Debt Score serves a similar function — collapsing cluster frequency, severity trend, and redesign recency into a single sort key. Like PER, the composite score is useful for ranking but the component stats are more useful for diagnosis. And like PER, the composite will generate community debate about whether the formula weights the right things.

---

## Sensory Description

**What the Debt Ledger looks like when it first loads:**

The panel opens with a half-second fade-in. The DCI indicator at the top appears first — a horizontal bar track, 400px wide, with a filled portion that slides from left to right over 600ms, settling at its final position with a subtle elastic bounce (overshoots by 8px, bounces back over 200ms). The fill color shifts continuously along the bar: teal on the left, transitioning through amber in the middle to coral on the right. The filled portion stops at the DCI value and the qualitative label ("CONCENTRATED") fades in 200ms after the bar settles. The label is set in small caps, letter-spaced 2px, in the same color as the bar's endpoint.

Below the DCI bar, the table rows appear in sequence — each row slides in from the right with an 80ms stagger, top to bottom. The Cluster Share column uses inline horizontal bars (like a proportional bar chart embedded in the table cell): each bar is filled in warm amber on a dark charcoal background, proportional to the agent's share percentage. RELAY-C's 38% bar is visually dominant — nearly twice the width of any other row's bar. The severity trend arrow is a small directional chevron: pointing up for WORSENING (amber), horizontal dash for STABLE (medium gray), pointing down for IMPROVING (teal). The "WORSENING" label beside the up-arrow pulses once on load — a single soft amber flash, 500ms duration — drawing the eye without being alarming.

**What the spark-line detail panel looks like:**

When a row is expanded, the detail panel unfolds downward over 300ms with an accordion animation. The cluster history spark-line is a row of square tiles — each tile 28px wide with 4px spacing. Unfilled tiles (no cluster event) are dark charcoal (#1a1a2e) with a 1px border in slightly lighter charcoal (#2a2a3e). Filled tiles (cluster event) are warm amber (#FFB347) with a subtle inner glow — a 2px radial gradient from white-amber at center to amber at edge, giving the impression of a lit indicator. Below each filled tile, two small text lines in monospace: the element count ("3 elem") and the combined coverage ("58%cc"). The text is medium gray, 10px, and only appears below filled tiles — the unfilled tiles have no annotation, reinforcing the binary signal.

The player action log appears below the spark-line as a small timeline — each action as a tag: "DISMISSED" in medium gray, "APPLIED #1" in pale amber, "APPLIED ALL" in brighter amber, "REDESIGNED" in teal. The tags are pill-shaped, 20px height, with rounded corners. A redesign tag stands out — it's the only teal element in the panel, visually marking the positive action in an otherwise amber-dominated view.

**What the season-switch animation looks like:**

When the player changes the season filter dropdown, the table rows animate simultaneously. Each row smoothly slides vertically to its new rank position over 400ms (ease-in-out). Cluster Share bars resize horizontally at the same time — shrinking or growing to their new proportional width. The DCI bar at the top slides to its new value over the same 400ms. If the DCI crosses a threshold boundary (e.g., from CONCENTRATED to DISTRIBUTED), the fill color shifts fluidly — amber washing out to teal in a smooth 400ms gradient transition. The qualitative label cross-fades: old label fades out at 50% through the animation, new label fades in at 50%.

**Audio:**

Opening the Debt Ledger plays no dedicated sound — it uses the standard panel-open sound (a soft mechanical slide, like a filing cabinet drawer). The DCI bar settling plays a single muted tone whose pitch maps to the DCI value: low pitch (C3) for healthy DISTRIBUTED, rising to a higher pitch (G4) for CRITICAL. The pitch is not alarming at any value — it's the same tonal register as the buffer visualization, a diagnostic sound, not an alert. When a row expands and the spark-line tiles appear, each filled (amber) tile produces a barely-audible click — the same click used when signal enters a buffer in the main game view. The clicks play in sequence with 60ms spacing, creating a brief rhythmic pattern: click-silence-click-click-silence... where the pattern of sounds and silences IS the cluster history. A player with headphones can literally hear the distribution of cluster events as a rhythm.

---

## The TikTok Clip

A player opens their career stats. They switch to the Debt Ledger tab. The DCI bar slides across to 0.41 — CRITICAL, deep coral. They scroll down. One agent dominates: RELAY-C, 58% Cluster Share, severity WORSENING. They expand the row. The spark-line is almost entirely amber — 6 out of 8 tiles lit up. They read the action log out loud: "Dismissed. Applied one. Applied all. Applied all. Applied one. Applied all." Six attempts to fix RELAY-C element by element. All failed. They pause. "I've been patching the same agent for four months."

They switch the season filter to Season 1. The table shows a clean roster — DCI 0.08, DISTRIBUTED, every bar short and even. They switch to Season 4. The animation plays: RELAY-C surges to the top, its bar extending across the cell, the DCI bar sliding deep into coral. The contrast between the healthy past and the concentrated present is visceral.

Cut to: the player clicking "Redesign RELAY-C." The workbench opens in coral isolation mode. The cluster history sidebar shows the full amber spark-line. The player starts deleting RELAY-C's old config elements. Caption on screen: "sometimes the fix is admitting you should have rebuilt it three months ago."

---

## Newly Discovered Aspects

- **4.69h** — Normalized cluster debt by agent complexity: adjusting Cluster Debt Score for the number of configurable elements per agent, so complex agents with many elements are not penalized relative to simple agents in cluster frequency
- **4.69i** — Debt Ledger correlation overlay with eEDT: a toggle view that overlays cluster event markers on the eEDT career spark-line, enabling visual detection of whether cluster events correlate with eEDT dips
- **4.69j** — "Start Here" recommendation engine: automated identification of the single highest-impact redesign opportunity from the Debt Ledger, with estimated combined coverage improvement and difficulty rating, shown as a call-to-action at the bottom of the ledger panel
- **4.69k** — DCI as a season achievement prerequisite: formally connecting the Debt Concentration Index to the Debt-Free Season achievement (4.72), so DCI < 0.15 at season end is one of the achievement criteria
- **7.16** — Debt profile comparison as community sharing artifact: the DCI evolution chart across seasons as a standard format in config necropsy culture, enabling community benchmarking of "roster discipline" over time
