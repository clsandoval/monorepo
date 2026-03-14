# Multi-Cluster Persistence Tracking

**Aspect:** 4.69d — Multi-cluster persistence tracking: tracking whether the same agent triggers multi-cluster across multiple career analyses; the "persistent offender" agent as a named archetype with dedicated treatment in the season health dashboard.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69b — Combined agent coverage score display; 4.69c — Agent redesign mode as a dedicated workbench state
**Related:** 4.68 — Coverage percentage as season health; 4.49 — Cross-mission pattern detection; 4.59 — Career minimum fix; 4.72 — Debt-free season achievement; 4.69g — Agent cluster as a unit of analysis in career stats

---

## The Core Concept

The multi-cluster detection system (4.69) fires when the same agent appears in 3+ distinct runner-up slots in a single career analysis result. A single cluster event is a diagnostic prompt: *consider reviewing this agent holistically.* But what happens when the player runs career analysis again next season, and RELAY-C clusters again? And again the season after that?

**Multi-cluster persistence** is the pattern across analyses, not within one. It is the signal that the player has been receiving the same diagnostic and not acting on it — or acting on it incompletely. Where a single cluster event says "you might want to look at this agent," a persistent cluster event says: **you have been looking at this agent for three seasons and the problem has not resolved. The individual fix path is definitively not working.**

The distinction matters enormously to the player's frame. A single cluster is a suggestion. A persistent cluster is a diagnosis that has been confirmed by repetition. The game must communicate this difference explicitly — not as a complaint ("you haven't fixed this yet") but as evidence ("here is the data showing that the whack-a-mole cycle is still active").

The **Persistent Offender** archetype is an agent that has triggered the multi-cluster flag in 2 or more career analyses since its last redesign. The name is deliberately evocative — borrowed from the criminal justice framing of recidivism, applied without judgment to a config problem. RELAY-C is not a bad agent. RELAY-C is an agent that keeps surfacing as the most productive redesign target, and the player's incremental repairs have not been sufficient.

Key design insight: the "since last redesign" framing is critical. An agent that clustered 8 times in Season 1 but was completely rebuilt in Season 2 and has never clustered since is **not** a persistent offender — it is a success story. The persistence counter resets on redesign commit. The metric measures unresolved clustering, not historical clustering.

---

## The Mechanical Underpinning

### What Gets Tracked

For each agent in the player's roster, the system maintains a **cluster history log**:

```
RELAY-C Cluster History
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Entries are cleared on redesign commit.
Current version: v3.2 (last redesigned: Season 1, Match 12)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Career Analysis Run 2 (Match 45–65):
  Cluster entries: 3  (context buffer, fallback filter, priority queue)
  Combined coverage: 58%
  Player action: Applied #1 fix only (dismissed agent audit)

Career Analysis Run 4 (Match 100–130):
  Cluster entries: 3  (context buffer, fallback filter, priority queue)
  Combined coverage: 64%
  Player action: Applied All Three fixes

Career Analysis Run 6 (Match 165–195):
  Cluster entries: 4  (context buffer, fallback filter, priority queue, burst threshold)
  Combined coverage: 71%
  Player action: [pending]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Persistent offender status: CONFIRMED (3 cluster events since v3.2)
```

The log captures:
1. **Which career analysis run** generated the cluster (by run number and match range)
2. **How many elements** clustered (3 in runs 2 and 4; 4 in run 6 — the cluster is *growing*, a separate signal)
3. **Combined coverage** at time of cluster
4. **Player action** — dismiss, apply-all, apply-#1-only, or enter-redesign (the most important data point)
5. **Threshold active** at time of detection (so threshold changes don't distort the record)

### The Persistence Threshold

The persistent offender flag is a separate threshold from the cluster threshold. Default: **N=2 cluster events since last redesign.** This means:
- First cluster on an agent: single cluster event (standard diagnostic)
- Second cluster on the same agent without a redesign between: persistent offender flag

This is intentionally low. The argument for N=2: after two cluster events on the same agent — especially after the player took some action (applying individual fixes) — the evidence that element-by-element fixing is insufficient is now empirically established. The game doesn't need to wait for three or four repetitions to call the pattern.

The argument for N=3: N=2 might feel accusatory if the player applied all three fixes and genuinely believed they'd resolved it. But the system should be honest: if the agent clustered again after a batch fix, the batch fix was not sufficient. The semantic should be "this problem recurred," not "you failed."

Recommended default: **N=2**, but presented as an observation, not an indictment.

### Cluster Severity Trend

Within the persistence log, a secondary signal: the **cluster entry count trend.** If RELAY-C clustered with 3 entries in run 2, 3 entries in run 4, and 4 entries in run 6, the cluster is expanding. This is architecturally ominous — the agent is becoming more deeply problematic over time, not less. The severity trend is displayed separately from the persistence count:

```
Persistent offender: 3 cluster events
Severity trend: WORSENING (3 → 3 → 4 entries)
```

Versus a stable severity:
```
Persistent offender: 3 cluster events
Severity trend: STABLE (3 entries each occurrence)
```

Versus an improving severity:
```
Persistent offender: 2 cluster events
Severity trend: IMPROVING (4 → 3 entries)
```

The improving severity is worth noting: it could mean the batch fixes are partially working (reducing the scope of the problem) even if they haven't fully resolved it. This nuance prevents the system from treating all persistence as identical.

---

## Design Options

### Option A — Persistent Offender Badge in Agent Inspector (Passive Tracking)

The agent inspector (accessible from the workbench at any time) gains a persistent offender badge next to the agent's name. The badge is a small amber diamond icon — visually distinct from the standard cluster flag — with a number indicating how many cluster events have occurred since last redesign.

```
RELAY-C ◆3  [inspect]
  Role: Mid-range relay
  Version: v3.2 (Season 1, Match 12)
  Buffer: 80/120
```

The `◆3` badge is visible in the agent roster list, in the battlefield canvas unit tooltip, and in the career analysis candidate panel (next to RELAY-C's name in the runner-up list). It is passive — it doesn't interrupt any workflow, but it is always visible to a player who looks.

**Strengths:** Non-intrusive. Persistent visibility without recurring interruptions. The badge visible in the runner-up list contextualizes a new cluster event immediately ("RELAY-C has already done this 3 times").
**Weaknesses:** Easy to ignore. No mechanism to escalate from passive badge to active recommendation. Players who never open the agent inspector won't see it. Badge number alone doesn't communicate the severity trend.

### Option B — Escalating Flag in Career Analysis (Active Interruption)

The first cluster event on an agent triggers the standard amber banner (4.69). The second cluster event on the same agent triggers an **escalated persistent offender banner** — visually and semantically stronger:

**First cluster (amber, soft):**
> ⚠ **Agent Multi-Cluster Detected**
> RELAY-C appears in 3 of your top 5 candidates.
> `[View Agent Audit →]` `[Dismiss]`

**Second cluster on same agent (amber-red, elevated):**
> 🔁 **Persistent Offender: RELAY-C (2nd cluster since v3.2)**
> RELAY-C appeared in your career analysis 60 matches ago and has clustered again.
> Combined coverage this run: 64% (+6pp vs. last cluster).
> The previous batch fix addressed 3 elements but did not resolve the root cause.
> `[View Persistence History →]` `[Enter Redesign Mode →]` `[Dismiss — I'll address this later]`

**Third cluster on same agent (red, urgent):**
> 🔁 **Structural Debt Warning: RELAY-C (3rd cluster since v3.2)**
> RELAY-C has now appeared in 3 consecutive career analyses without a redesign.
> Combined coverage trend: 58% → 64% → 71% (worsening).
> This agent is accumulating architectural debt. Incremental fixes have not been sufficient.
> `[View Persistence History →]` `[Enter Redesign Mode →]` `[Dismiss — I understand the risk]`

The language of the dismiss button escalates deliberately: "Dismiss" becomes "Dismiss — I'll address this later" becomes "Dismiss — I understand the risk." The escalating dismiss text makes the player's choice legible as a choice, not a habit.

**Strengths:** High visibility. Escalation communicates severity proportionally. The third-cluster dismiss text creates explicit acknowledgment of the accumulating debt.
**Weaknesses:** The third-cluster banner may feel nagging to players who have strategic reasons for deferring the redesign (e.g., they're mid-season and don't want to risk destabilizing a working config). The escalating urgency could feel accusatory.

### Option C — Season Health Dashboard: Persistent Offender Panel (Dedicated View)

The season health dashboard (4.68) gains a **Persistent Offenders** panel — a dedicated section showing all agents that have triggered multi-cluster 2+ times since their last redesign. This is where the cluster history log surfaces as a first-class display:

```
┌──────────────────────────────────────────────────────────────┐
│  PERSISTENT OFFENDERS (2 agents with recurring clusters)     │
├──────────────────────────────────────────────────────────────┤
│  RELAY-C   ◆3 events   Severity: WORSENING  Debt: HIGH       │
│  Last cluster: Run 6 (Match 165–195, 71% combined)           │
│  Since redesign: 183 matches without architectural review     │
│                            [View History →] [Redesign →]     │
├──────────────────────────────────────────────────────────────┤
│  SCOUT-A   ◆2 events   Severity: STABLE     Debt: MED        │
│  Last cluster: Run 5 (Match 130–165, 52% combined)           │
│  Since redesign: 147 matches without architectural review     │
│                            [View History →] [Redesign →]     │
├──────────────────────────────────────────────────────────────┤
│  Agents resolved via redesign (no recurring clusters):        │
│  COMMAND-A redesigned Season 3 — 0 clusters in 4 analyses    │
│  STRIKER-B redesigned Season 2 — 0 clusters in 6 analyses    │
└──────────────────────────────────────────────────────────────┘
```

The "resolved" section at the bottom is as important as the active persistent offenders. It shows the player that redesigns work — COMMAND-A is no longer a persistent offender because the redesign resolved the structural problem. This closes the feedback loop: the player can see the before-and-after in the same panel that shows the unresolved cases.

**Strengths:** Comprehensive view. Shows both the problem and the solutions to previous problems. The "resolved" section provides positive reinforcement and evidence that redesigns are worth it. Separates the "check this now" context (career analysis panel) from the "review this at leisure" context (season health dashboard).
**Weaknesses:** Requires the player to navigate to the season health dashboard — players who only check career analysis results won't see it. The resolved section requires maintaining history after redesign, which adds storage complexity.

### Option D — Persistence Indicator in Cover Coverage Trend (Inline)

The coverage trend sparkline (4.68) gets an annotation layer: each bar in the sparkline that was associated with a cluster event gets a small ◆ marker at the top. When the same agent triggered the cluster in consecutive bars, the markers are connected by a thin amber line — visually indicating "same agent, recurring."

```
Career Analysis Coverage History (6 runs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run 1 (M30):  ████████████ 61%
Run 2 (M65):  ████████░░░░ 43% ◆RELAY-C
Run 3 (M90):  ██████░░░░░░ 34%
Run 4 (M130): ███████░░░░░ 38% ◆RELAY-C ←connected to Run 2's marker
Run 5 (M165): ██████░░░░░░ 32%
Run 6 (M195): ████████░░░░ 45% ◆RELAY-C ←connected to Run 4's marker
```

The connecting lines form a visual "persistence wire" — you can trace RELAY-C's recurrence through the sparkline without needing to open a separate panel. Hovering the marker shows the cluster entry count and combined coverage. Clicking jumps to the persistence history log for that agent.

A secondary annotation: when the sparkline rises on a run where RELAY-C clustered (run 6 rises from 32% to 45%), the combination of rising coverage + cluster event is a specific pattern: **regression with attribution**. The coverage rose AND the same agent clustered — which means the uncoverage was probably causal. The sparkline could annotate this with a different marker color (amber for cluster, red for cluster-with-regression).

**Strengths:** Integrates persistence tracking directly into the existing season health view without requiring a new panel. The visual wire connecting recurring cluster events is immediately readable even without any labels.
**Weaknesses:** Sparkline becomes visually busy with annotations. The connecting lines may be confusing if multiple agents are persistent offenders (multiple simultaneous wires). Works best as a supplement to Option C, not a replacement.

### Recommended Design: Options B + C + D (Layered)

- **Option B** (escalating flag) handles the real-time interruption at career analysis time
- **Option C** (season health panel) handles the reflective/planning view
- **Option D** (sparkline annotation) handles the at-a-glance trend visualization

The layers serve different player contexts: active analysis (B), strategic planning session (C), quick status check (D). None of them replaces the others.

---

## The Persistence History View

When the player clicks `[View History →]` on a persistent offender, they see the **Agent Cluster History** — a dedicated view showing the full record of cluster events for that agent since its last redesign:

```
┌─────────────────────────────────────────────────────────────────────┐
│  RELAY-C — Cluster History   [Since redesign: v3.2, Season 1, M12]  │
├─────────────────────────────────────────────────────────────────────┤
│  ◆ Run 2  (M45–65)   3 entries   Combined: 58%   Action: Fix #1      │
│    Elements: context buffer (31%), fallback filter (19%), queue (11%)│
│    What happened next: coverage improved 43%→34% in Run 3            │
│    Verdict: partial resolution — coverage improved, problem persisted│
├─────────────────────────────────────────────────────────────────────┤
│  ◆ Run 4  (M100–130) 3 entries   Combined: 64%   Action: Apply All 3 │
│    Elements: context buffer (38%), fallback filter (22%), queue (14%)│
│    What happened next: coverage held at 32% for 2 runs (Runs 4–5)    │
│    Verdict: stability plateau — not a fix, not a regression           │
├─────────────────────────────────────────────────────────────────────┤
│  ◆ Run 6  (M165–195) 4 entries   Combined: 71%   Action: [pending]   │
│    Elements: context buffer (43%), fallback filter (28%), queue (18%)│
│              burst threshold (new, 12%)                               │
│    Note: burst threshold is NEW — not present in previous clusters.  │
│    This element emerged after SCOUT-A's rebuild (Match 147).         │
│    Verdict: worsening — scope expanded, new element from dependency  │
├─────────────────────────────────────────────────────────────────────┤
│  AGGREGATE PATTERN ANALYSIS:                                          │
│  • context buffer: present in all 3 cluster events (100% recurrence)│
│  • fallback filter: present in all 3 cluster events (100%)          │
│  • priority queue: present in all 3 cluster events (100%)           │
│  • burst threshold: present in 1/3 cluster events (NEW, 33%)        │
│                                                                       │
│  DIAGNOSIS: context buffer size is the probable root node.           │
│  It has appeared in every cluster event and shows increasing         │
│  coverage over time (31% → 38% → 43%). The other elements may        │
│  be downstream of this one size decision.                             │
└─────────────────────────────────────────────────────────────────────┘
│  [Enter Redesign Mode — RELAY-C →]          [Close]                  │
└─────────────────────────────────────────────────────────────────────┘
```

The **aggregate pattern analysis** is the feature that makes this view uniquely valuable: by looking at which elements appear in ALL cluster events vs. some, the system can identify the **most structurally stable problem** — the element that has been present since the beginning. An element with 100% recurrence across all cluster events is a candidate for the root node of the problem. An element with 33% recurrence is probably a symptom or a downstream effect.

The "what happened next" row closes a feedback loop that single-run career analysis can't provide. After Run 2, the player applied Fix #1. Coverage improved (43%→34%). The system records this and shows: the fix produced a measurable improvement, but not a resolution. This is evidence, not judgment.

The "Verdict" field (partial resolution / stability plateau / worsening) is generated by the system based on a simple rule:
- **Partial resolution**: coverage improved by ≥10pp in the next run but the agent clustered again later
- **Stability plateau**: coverage changed by <5pp for 2+ consecutive runs after the action
- **Worsening**: combined coverage or entry count increased in the next cluster event

The Verdict field makes the aggregate picture readable without requiring the player to mentally model the causal chain.

---

## Player Journeys

#### Journey: Marcus, 35, Product Manager — Hitting the Persistent Offender Wall

**Context:** Marcus has been playing for 4 months. He's in Season 3, Match 195. He has applied batch fixes to RELAY-C twice (after Runs 2 and 4 in his cluster history). He's been satisfied each time — the coverage improved and the problem seemed resolved. He's about to encounter the third cluster flag on RELAY-C, with a new element he doesn't recognize.

**Minute 0:00 — Career Analysis Loads**

Marcus finishes Match 195, a grueling 3-agent suppression mission that took him 4 attempts. He opens career analysis from the post-match debrief — he does this after every major milestone now, a habit he's built over three seasons.

The analysis spins for 3 seconds. The result loads.

He scans the list. He sees RELAY-C at #1, RELAY-C at #3, RELAY-C at #4. And then something new: RELAY-C's "burst threshold" at #5 — a parameter he's never touched.

Before he can hover the new entry, the banner fires.

But it's different this time. It's not the soft amber banner he's seen before. It's deeper — an amber-red gradient at the edges, a subtle red outline. The language has shifted:

> 🔁 **Structural Debt Warning: RELAY-C (3rd cluster since v3.2)**
> RELAY-C has appeared in 3 consecutive career analyses. Combined coverage this run: 71% (worsening trend). Incremental fixes have not been sufficient to resolve this agent's architectural problem.
> `[View Persistence History →]` `[Enter Redesign Mode →]` `[Dismiss — I understand the risk]`

Marcus reads it twice. *Third cluster.* He remembers: he applied all three fixes last time and was pleased with the result. But *"3rd consecutive career analysis"* — how long has this been going on?

**Minute 0:30 — Opening the Persistence History**

He clicks `[View Persistence History →]`.

The history panel opens. He reads it top to bottom, slowly. Run 2: he applied #1 fix. Coverage improved. "Partial resolution." Run 4: he applied all three fixes. Coverage held. "Stability plateau." Run 6 (now): four entries. "Worsening."

He reads the aggregate pattern analysis: context buffer at 100% recurrence. Every single cluster event, that parameter.

He reads the verdict for Run 4: *"stability plateau — not a fix, not a regression."*

He thinks: the batch fix stopped the regression but didn't fix anything. He achieved homeostasis, not improvement. He's been maintaining the problem, not solving it.

He looks at the new element: `burst threshold (new, 12%)`. The note says: *"This element emerged after SCOUT-A's rebuild (Match 147)."* Match 147 — he rebuilt SCOUT-A six months ago. RELAY-C was never adjusted afterward.

**Minute 1:00 — The Realization**

Marcus sits back.

He rebuilt SCOUT-A to handle long-range burst transmissions. RELAY-C, downstream of SCOUT-A, was never told it would receive burst packets. Its burst threshold is set to the default (the parameter he's never touched). So SCOUT-A now regularly produces bursts that RELAY-C drops, because RELAY-C doesn't know it should be expecting them.

The context buffer problem, the fallback filter problem, the priority queue problem — all of those might be downstream of RELAY-C being fundamentally wrong for the current signal environment. The root node the aggregate analysis identified is right: context buffer size was set when RELAY-C was a short-range relay in Season 1. It's never been sized for the new architecture.

He clicks `[Enter Redesign Mode →]`.

**Minute 1:20 — Redesign Mode Opens**

Redesign mode opens with coral headers. In the bottom-left, a small "Redesign trigger: 3 cluster events" indicator reminds him why he's here.

The stress test scenarios are pre-populated from all three cluster events — 9 test scenarios in total, the most he's ever seen. Marcus notices something: 7 of the 9 scenarios involve SCOUT-A producing burst signals. The concentrated pattern is unmistakable. This is a SCOUT-A→RELAY-C integration problem.

He opens the signal flow overlay. He traces the path from SCOUT-A's burst output to RELAY-C's receive hook. He sees a filter mismatch: SCOUT-A now produces signals with `type: burst_compressed`, but RELAY-C's attention filter only passes `type: compressed`. The burst-compressed signals are silently dropped.

The fix is more elegant than he expected: it's not about buffer size at all. He changes RELAY-C's filter to accept `type: burst_compressed`. He runs the stress test.

8 of 9 scenarios pass. The one failure is an unusual edge case (triple-burst, dense scenario) that he notes for future investigation.

He commits the redesign. The coral header dissolves, replaced by the standard teal. "RELAY-C v4.0" badge pulses green.

**Minute 3:00 — Post-Commit Reflection**

Back in the career analysis panel, Marcus reads the persistence history for RELAY-C again. The three cluster events are still there, but now a new footer line has appeared:

> **Redesign committed: v4.0 (Season 3, Match 195)** — cluster history reset. Monitoring for recurrence.

The counter is at zero. Marcus feels not relief, but satisfaction — the specific satisfaction of having fixed something at the right level of abstraction for the first time.

He'd applied the same three patches twice before. The persistence tracker was the thing that told him he was in the wrong frame. He needed it to take 3 cluster events for the evidence to be unavoidable.

**UI Annotations:**
- Third-cluster banner: amber-red gradient (amber #FFB347 → red #FF6B6B at edges, 20% opacity), red outline 1px, otherwise same layout as standard banner; the visual escalation is subtle but distinctly different from the first-cluster amber
- Persistence history panel: opens as full-screen overlay with a dim background; no animation competing — this is a reading task; max width 720px, centered, white card on dark overlay
- "What happened next" row: faint gray background, italicized, smaller font (13px vs. 14px for measurement rows) — it's context, not measurement
- Verdict field: colored dot to left of text — amber for "partial resolution," yellow for "stability plateau," red for "worsening"; color matches the severity framing
- Aggregate pattern analysis: recurrence percentage rendered as a small horizontal bar (full bar for 100%, partial for 33%); element with highest recurrence has a subtle bold treatment
- Redesign trigger indicator in redesign mode: 10px label in the bottom-left of the coral header strip: "Triggered by: 3 cluster events — RELAY-C"
- Post-commit footer in persistence history: green checkmark left of text, "cluster history reset" in green; "Monitoring for recurrence" adds expectation-setting without pressure

---

#### Journey: Priya, 30, Software Engineer — Strategic Deferral and the Persistent Offender Ledger

**Context:** Priya is in competitive Gauntlet mode, Season 4. She's 7 matches into a 12-match season. She has two persistent offenders: RELAY-C (2 cluster events) and COMMAND-A (2 cluster events). She knows about both — she's aware she's carrying architectural debt. The question is not whether to redesign but *when*, given match scheduling.

**Minute 0:00 — The Season Health Dashboard**

Priya opens the season health dashboard between matches. She's not doing a career analysis right now — she wants the full picture before deciding which agents to work on before her quarterfinal.

She navigates to the Persistent Offenders panel:

```
PERSISTENT OFFENDERS (2 agents)

RELAY-C  ◆2 events  Severity: STABLE   Debt: MED
  Last cluster: Run 8 (M220–260, 59% combined)
  Since redesign: 156 matches
  [View History →] [Redesign →]

COMMAND-A  ◆2 events  Severity: WORSENING  Debt: HIGH
  Last cluster: Run 9 (M260–295, 74% combined)
  Since redesign: 198 matches
  [View History →] [Redesign →]
```

She reads this in five seconds. RELAY-C: stable severity, medium debt, 59% combined coverage. COMMAND-A: worsening severity, high debt, 74% combined coverage.

Her quarterfinal opponent (she's checked the threat model report, 4.57) runs hook-heavy, rapid-signal strategies. COMMAND-A is her routing intelligence layer — it interprets signals from RELAY-C and dispatches actions. If COMMAND-A is structurally compromised, the hook-heavy attack will saturate it first.

**Minute 0:30 — Triage Decision**

She clicks `[View History →]` on COMMAND-A.

She reads the aggregate pattern analysis. The 100%-recurrence elements are: `attention_filter_depth` and `hook_evaluation_batch_size`. Two parameters. The worsening is attributable to a new element in Run 9: `priority_decay_rate`, which emerged after she optimized RELAY-C's compression settings.

She reads the verdict for Run 8: *"stability plateau."* Run 9: *"worsening."*

The pattern is clear: optimizing RELAY-C in Season 3 indirectly made COMMAND-A worse (RELAY-C now produces signals that COMMAND-A's priority decay can't keep up with).

She looks at the match schedule. Quarterfinal in 18 hours. If she redesigns COMMAND-A now, she has time to run 4 stress tests before the match. That's enough for a targeted redesign — but not a full architectural rebuild.

She makes a decision: targeted fix to the two 100%-recurrence elements (not a full redesign, but more deliberate than "Apply All Three"). She specifically won't touch `priority_decay_rate` until she has more matches to characterize it.

She clicks `[Redesign →]` on COMMAND-A — but selects "Targeted Fix Mode" from the redesign mode entry dialog (this is a sub-variant of redesign mode that doesn't require rebuilding from scratch; she can edit specific parameters while the overall architecture stays locked).

**Minute 1:15 — Targeted Fix in Redesign Mode**

In targeted fix mode, only the highlighted elements are editable (the two with 100% recurrence). Everything else is locked. Priya increases `attention_filter_depth` from 3 to 5 and `hook_evaluation_batch_size` from 8 to 12.

She runs the pre-populated stress tests from the persistence history. 6/8 pass — the two failures both involve `priority_decay_rate`, the element she deliberately didn't touch.

She commits. The persistence history for COMMAND-A updates:

> **Targeted fix applied: Season 4, Match 295** — targeted fix (2 of 4 cluster elements addressed). Persistence count maintained (redesign threshold requires architectural rebuild). Monitoring.

The persistence count is NOT reset by a targeted fix. This is by design: the system distinguishes "full redesign" (which earned the counter reset in Marcus's journey) from "targeted fix" (which addresses symptoms, not the root). The persistent offender badge on COMMAND-A now shows `◆2` with a small "⚡" suffix indicating "partial fix applied — persistent status maintained."

**Minute 2:00 — Post-Fix Reflection**

Priya saves the season health dashboard state in her notes (external — she screenshots it). She wants to compare this COMMAND-A persistence record to the post-quarterfinal result: if she wins, the targeted fix was sufficient. If she loses and COMMAND-A was implicated, the persistence tracking will have documented exactly why.

She exits the dashboard. She has 17 hours before her quarterfinal. She'll do the full COMMAND-A architectural rebuild after the final regardless of the outcome.

**What Priya Found Valuable:**
- The severity indicator (STABLE vs. WORSENING) made triage instantaneous — no need to read the full history to decide which to prioritize
- The "since redesign: 198 matches" duration created urgency without being alarmist — a factual timestamp, not a judgment
- Targeted Fix Mode enabled a time-constrained intermediate path (neither "apply all three" nor "full redesign")
- The partial fix annotation (⚡ suffix) honestly reflected what she'd done: she hadn't fully resolved the problem, and the system said so

**What Priya Would Want:**
- An estimated match-count impact for redesigning now vs. after the quarterfinal (counterfactual planning: "if you redesign before the quarterfinal, these 4 scenarios pass; if you wait, you carry this risk for 1 match")
- A "pre-final redesign window" indicator — how many matches she can run before the final if she starts the redesign today

**UI Annotations:**
- Persistent offenders panel: refreshes on every dashboard load (not cached — always reflects current state after new analyses)
- Severity indicators: STABLE = amber dot, WORSENING = red pulse dot (slow 2-second pulse to communicate ongoing deterioration), IMPROVING = green dot
- Targeted Fix Mode entry: available as a radio button option in the redesign mode entry dialog alongside "Full Redesign"; descriptions: "Full Redesign — rebuild the agent from scratch, architectural freedom, counter reset on commit" vs. "Targeted Fix — edit specific elements, architecture preserved, persistence status maintained"
- Partial fix annotation in history: small lightning bolt ⚡ icon at the end of the "Action:" field; tooltip: "Targeted fix applied — 2 of 4 cluster elements addressed; persistence counter maintained pending architectural rebuild"

---

#### Journey: Soren, 17, Student — Discovering the Persistent Offender Concept

**Context:** Soren is in Season 2, Match 115. He's had two cluster flags on SCOUT-A (he applied "Apply All Three" both times and moved on). He's never navigated to the season health dashboard — he doesn't know it exists. He's about to encounter the second-cluster escalated banner for the first time and discover the persistence tracking system.

**Minute 0:00 — The Different Banner**

Soren runs career analysis after Match 115. The banner fires. But it looks different — the soft amber he recognizes from before, but with an orange-red tint at the edges.

He reads it:
> 🔁 **Recurring Cluster: SCOUT-A (2nd time since last redesign)**
> SCOUT-A clustered 35 matches ago and has clustered again.
> The previous batch fix improved coverage but didn't fully resolve the problem.
> `[See what happened →]` `[Enter Redesign Mode →]` `[I'll handle it later]`

Soren pauses on "2nd time." He remembers the first time, vaguely — he applied the three fixes and it seemed to work.

He clicks `[See what happened →]`. (He's drawn to the verb "see" — it feels less technical than "view history.")

**Minute 0:20 — The History, Simplified**

The persistence history panel opens. For new players with experience <50 matches, the history uses a simplified layout — no percentage labels on the individual elements, no technical parameter names. Instead:

```
SCOUT-A — What's Been Happening

✓ Run 2 (35 matches ago): You fixed 3 things.
  Coverage improved. Problem returned.

◆ Run 4 (today): Same 3 things appeared. Plus 1 new one.
  The 1 new thing showed up after you changed SCOUT-B.

What this might mean:
  → SCOUT-A hasn't been updated to match how SCOUT-B works now.
  → The same 3 things keep appearing because of one bigger problem.
```

The simplified view uses plain English throughout. No "combined coverage," no "aggregate pattern analysis," no "recurrence percentage." Just: what you did, what happened, what this might mean.

At the bottom, one button: `[Rebuild SCOUT-A for the new setup →]`. Not "Enter Redesign Mode" — "Rebuild SCOUT-A for the new setup."

Soren reads it. He understands. He changed SCOUT-B two weeks ago (the tutorial told him to). He never changed SCOUT-A. Now SCOUT-A doesn't work right with the new SCOUT-B.

He clicks the button.

**Minute 0:45 — Redesign Mode with Training Wheels**

Because Soren is a new player entering redesign mode for the first time (detected by the system based on session count), the redesign mode opens in a guided variant. A step-by-step sidebar panel replaces the free-form workspace:

```
STEP 1 OF 3: What does SCOUT-A do now?
  SCOUT-A currently: "scout short-range, send beacons on location change"
  After your SCOUT-B change: SCOUT-B now sends long-range compressed bursts.

  Is SCOUT-A's job still the same? [Yes, same job] [No, SCOUT-A should do more]
```

Soren clicks "No, SCOUT-A should do more."

```
STEP 2 OF 3: What should SCOUT-A do differently?
  Your config shows SCOUT-B handles: compression, burst formatting
  SCOUT-A currently handles: beacon transmission, location sensing

  Suggestion: SCOUT-A should also handle burst_compressed signals.
  [Accept suggestion] [I want to decide myself]
```

Soren clicks "Accept suggestion."

The system applies the burst_compressed signal type to SCOUT-A's attention rules and increases the buffer size to accommodate burst patterns.

```
STEP 3 OF 3: Test the new SCOUT-A
  Running 3 test scenarios (from your match history)...
  [████████████] 3/3 passed ✓

  [Deploy SCOUT-A v2.0 →]
```

Soren clicks deploy. The redesign is committed. The persistence counter resets.

**Minute 2:00 — The Resolution Moment**

Back on the main screen, Soren notices a small notification in the corner:

> ✓ SCOUT-A persistence resolved. 2 cluster events cleared.
> SCOUT-A will be monitored across your next career analyses.

The notification is small — not a celebration. Just an acknowledgment. Soren feels competent, not celebrated. He solved a real structural problem, even if he had guidance getting there.

Three career analyses later, SCOUT-A has not clustered. The season health dashboard (which Soren has now discovered) shows SCOUT-A in the "Resolved agents" section: "0 clusters in 3 analyses."

**What Soren Needed:**
- The plain-language history panel (no technical vocabulary, just story: "you did X, Y happened, here's why")
- The guided redesign mode (step-by-step rather than open sandbox)
- The "Rebuild for the new setup" framing (connects the redesign to the SCOUT-B change he remembers making)
- The resolution notification (small acknowledgment that something was genuinely resolved)

**What Would Have Lost Soren:**
- The technical persistence history with percentage recurrence bars
- "Targeted Fix Mode" in the redesign entry dialog (too many choices too early)
- A counter in the banner that counts upward without explaining why it matters ("2nd time" needs translation to "this has happened before and will happen again unless you fix the root cause")

**UI Annotations:**
- Experience-gated history view: players with <50 matches see simplified plain-language history; players with ≥50 matches see technical history by default; a "Switch to simplified view" link is available in the technical view
- "Rebuild for the new setup" button in simplified history: maps to `[Enter Redesign Mode →]` but uses plain language; only available when the simplified history detects a dependency gap root cause hypothesis (most common root cause for new players)
- Guided redesign mode: only triggers on player's first redesign mode entry; subsequent entries default to standard redesign mode; a "Switch to guided mode" toggle is always available
- Resolution notification: bottom-right corner, 3-second auto-dismiss, green checkmark icon, font size 13px (not prominent — this is confirmation, not celebration)

---

## Interaction Effects

### With 4.69a — Threshold Configurability

At N=2 (hyper-sensitive threshold), agents accumulate cluster events rapidly. If every career analysis flags 2+ agents, the persistence counter will hit ◆2 within 2–3 career analyses even for healthy configs. At N=2, the persistence tracking **must** display "since last redesign" framing and normalize the persistence count somehow — perhaps showing "◆2 (at N=2 threshold)" to remind the player that their high sensitivity is partially responsible for the count.

At N=4 (expert threshold), persistence events are rare and high-signal. When an agent triggers N=4 persistence (the same 4+ elements in 2+ consecutive analyses), the evidence is very strong. Expert players who reach persistent offender status at N=4 have a legitimately significant architectural problem.

A recommended design: the persistent offender flag itself should have its own threshold — defaulting to "2 cluster events" but adjustable by the player independently of the cluster threshold. This prevents N=2 players from drowning in false persistent offender flags. See 4.69h for threshold preset profiles that address this.

### With 4.68 — Season Health Dashboard

The season health dashboard is the natural home for the persistent offenders panel (Option C above). The interaction is bidirectional:
- The coverage trend sparkline gains the ◆ persistence annotation from Option D
- The persistent offenders panel provides the detail view that the sparkline's ◆ markers point to
- A rising coverage trend AND a persistent offender are often causally linked: the coverage is rising because the persistent offender's root problem is driving an increasing share of losses

The season health dashboard becomes a "two-panel diagnostic view": left panel shows the trend (are things getting better or worse over time?), right panel shows the root causes (which agents are the structural sources of the trend?). Together, they answer both "what is happening?" and "why is it happening?"

### With 4.69c — Redesign Mode

The persistence history log's pre-populated stress tests are the most powerful integration: when Marcus enters redesign mode from the persistent offender panel, the test scenarios come from all three cluster events combined — a 9-scenario stress battery drawn from real match failures, organized by the persistent pattern. This is qualitatively different from the standard redesign mode's pre-population (which only uses the current cluster's scenarios).

The persistent offender path into redesign mode implies a higher-stakes redesign: the player has been deferring this for multiple career analyses. The system should reflect this by pre-loading the longest available diagnostic context.

The redesign mode commit creates the persistence counter reset. The counter reset is a first-class game event — not just a data update, but a visible moment of architectural resolution. RELAY-C goes from ◆3 to "v4.0 — monitoring" in the player's permanent record.

### With 4.72 — Debt-Free Season Achievement

The debt-free achievement requires no single element responsible for >20% of losses. Persistent offenders are, by definition, obstacles to the debt-free achievement: they are agents with elements that repeatedly appear in the top candidates at coverage levels well above 20%.

The season health dashboard could show: "RELAY-C is preventing debt-free status. Your current structural ceiling with RELAY-C unresolved: ~45% (vs. debt-free target: <20%). Redesigning RELAY-C is the critical path to this season's achievement."

This makes the persistent offender not just a diagnostic curiosity but a concrete obstacle to a seasonal goal — adding stakes to the resolution decision.

### With 4.49 — Cross-Mission Pattern Detection

Cross-mission detection (4.49) finds patterns longitudinally: "RELAY-C's hook threshold failed in 7 of your last 10 missions involving dense enemy formations." Multi-cluster persistence tracking finds the same agent appearing in multiple career analyses. When both fire on the same agent simultaneously, the evidence is orthogonal and cumulative — two different analysis methodologies agreeing.

The interaction: when an agent is a persistent offender AND has cross-mission patterns, the game could surface a combined signal: "RELAY-C has triggered multi-cluster in 3 career analyses AND shows cross-mission failure patterns in dense-formation scenarios. Both signals point to the same agent. The structural problem may be scenario-class-specific." This merged signal could be displayed in the season health dashboard as a "multi-source flag" — higher confidence because two independent diagnostic systems converge on the same target.

### With 4.38 — Counterfactual History

The persistence history's "what happened next" rows are a simplified version of counterfactual history: they show the observed outcome of each action (fix #1, apply all three). The full counterfactual history system (4.38) creates a formal comparison — "if you had stayed on RELAY-C v3.2 with only the batch fixes applied..." — which can be evaluated post-redesign against the actual redesign results.

The persistence history view should link to the counterfactual history view for each cluster event: "See what would have happened →" (the counterfactual from after Run 4's batch fix, projected through to today). This closes a learning loop that's unique to persistent cases: did the batch fixes actually help at all, or did they just delay the inevitable redesign?

---

## Comparable Games / Media

### Git — Commit History and "File Hot Spots"

In Git, tools like `git blame` and commit history can identify files that are modified in almost every commit: the "hot spot" files that are always touched because something about them is structurally wrong. Some code analysis tools (like CodeScene) visualize "hotspot" files as a top-level concern — not a bug report, but a pattern that indicates architectural debt. The persistent offender is the agent-config equivalent of a Git hotspot file: it keeps being touched because something about it is never right.

The vocabulary alignment is striking: "technical debt" in software engineering means exactly what "architectural debt" means in Robot Uprising. The persistence tracking is the equivalent of CodeScene's hotspot detection — applied to the player's agent configurations.

### Hearthstone — Card Performance Over Multiple Runs

In Hearthstone's competitive scene, players track card performance across many matches. A card that consistently underperforms (low win rate, low play-quality rating) across multiple runs is flagged for replacement — not based on one bad game, but on the accumulated pattern. The persistence tracking is the equivalent: not "this agent was bad in one analysis" but "this agent has been the worst-performing element in three consecutive analyses." The multi-run framing is critical — a single bad result could be variance; three consecutive results are signal.

### Software Engineering — Jira "Reopen" Count

In issue tracking systems (Jira, Linear, GitHub Issues), a ticket that is closed, reopened, closed, and reopened multiple times has a "reopen count." High reopen count is a signal that the root cause was never addressed — only symptoms were patched. The persistent offender is the agent equivalent of a high-reopen-count ticket: it was "fixed" (apply all three, apply #1 fix) multiple times, but kept coming back because the underlying problem was never diagnosed.

The "Since last redesign" counter in the persistence history is analogous to "time since first opened" in the issue tracker — how long has this ticket been active?

### Factorio — "Priority Belt" Problem

In Factorio, players sometimes optimize a specific belt throughput without realizing that the entire logistics route is structured around a bottleneck that will recur no matter how many inserters they add. The bottleneck is the persistent offender: it keeps slowing production not because of any single inserter but because the routing architecture is wrong. Experienced Factorio players learn to recognize the "same belt, same problem" pattern and commit to restructuring rather than adding more inserters. The persistence tracking is the Factorio equivalent of a player noticing: "I've optimized this belt three times, and throughput is still capped at the same rate. The problem is not the belt."

### Agile — "Recurring Retro Items"

In agile development teams, retrospectives often surface recurring themes: the same issue appears in three consecutive retrospective sessions. Teams use this as a decision trigger: if a retro item recurs three times without resolution, it's escalated to a structural fix (not a "we should do better" action item, but a process change). The persistent offender mechanic is structurally identical: the career analysis is the retrospective, the cluster flag is the recurring item, and the persistence tracking is the escalation mechanism.

---

## Sensory Description

**What the escalated persistent offender banner looks like:**

The standard first-cluster banner is flat amber (#FFB347, warm orange-yellow). The second-cluster banner is the same amber base but with a radial gradient that darkens toward the edges — the center is amber, the outer 20% of the banner bleeds toward #FF8C42 (a deeper orange-amber), and the border is a thin 1px line of #E05A00 (dark amber-red). It reads as "same thing, more serious" — the color family is consistent, the intensity has increased. It is not alarming (not red, not flashing) but it is noticeably elevated.

The banner icon shifts from ⚠ (warning triangle, static) to 🔁 (cycle arrows, which implies recurrence rather than a single alert). This is a subtle but important signal — the 🔁 icon communicates "this happened before" without any text.

The third-cluster banner adds a slow pulse to the border — a 3-second sine wave that increases the border opacity from 60% to 100% and back, at low amplitude. It's barely visible unless you look for it. The effect is a subliminal "heartbeat" quality — the badge is alive, not static.

**What the persistence history panel looks like:**

The persistence history panel opens as a focused modal over a very dark overlay (90% black). The card itself is 720px wide, centered, white background, with generous 32px padding. Typography is clean and left-aligned.

Each cluster event in the history is a distinct card within the panel: a light gray (#F5F5F5) background, 8px rounded corners, 1px #DCDCDC border. The three "phases" of each card — elements, coverage, action — are separated by thin hairlines, not heavy dividers.

The verdict badge (partial resolution / stability plateau / worsening) is placed inline at the end of the "Action:" row. The badge uses the same color-dot convention as the season health dashboard: amber dot for partial resolution (warm, non-critical), dim yellow for plateau (neutral, waiting), red dot for worsening (slow pulse matching the third-cluster banner's heartbeat — visual cross-reference to the banner that triggered this view).

The aggregate pattern analysis section has a distinct visual treatment: a very light blue-gray background (#F0F4FF) that signals "this is a synthesized interpretation, not raw data." Each element name is displayed with a small horizontal recurrence bar (width proportional to recurrence percentage) in teal, so the 100%-recurrence elements are immediately visually distinct from the 33%-recurrence elements.

**What the resolution moment sounds like:**

When the player commits a full redesign that resets the persistence counter, two audio events fire in sequence:

1. The standard redesign mode commit sound (ascending perfect fifth — the motif established in 4.69c) plays at full volume.
2. 400ms later, a second sound: a soft three-note descending arpeggio (C → G → E, major, at half velocity). This is the "resolution motif" — it sounds like settling, like a tension releasing. It plays only when the persistence counter reaches zero (not on targeted fixes, not on regular commits).

The two-sound sequence creates a "commit + resolve" feeling: the ascending fifth says "I've done something," the descending arpeggio says "and it's complete." Together they mark the persistence resolution as a significant moment without being celebratory.

**What the persistent offender badge looks like in context:**

The `◆` badge on the agent roster is an amber diamond, 10×10px, rendered with a subtle drop shadow (2px, 30% opacity) to lift it off the agent name. The number inside the diamond (2, 3, 4...) is white, 9px monospace. At ◆3 or higher, the badge gains a very faint amber glow effect (8px blur radius, 20% opacity) that pulses at 4-second intervals — barely visible but present, a persistent low-level signal in the periphery of the agent roster.

When the persistence counter resets after a full redesign, the badge performs a "dissolve out" animation: the amber diamond fades to 0% opacity over 800ms, then the spot where it was briefly shows a small green checkmark (3-frame flash, 300ms) before disappearing entirely. The checkmark communicates: "this was resolved, not ignored."

---

## The TikTok Clip

A player is looking at the season health dashboard. The camera shows the screen. The persistent offenders panel shows RELAY-C with `◆3` and "Severity: WORSENING." The player clicks "View History." The history panel opens — three cluster events, "what happened next" rows showing coverage improving then plateauing then rising again. The player reads aloud: "I applied the fix. Three times. And it came back." They pause. "I've been fixing the symptoms." They click `[Enter Redesign Mode →]`. The screen dissolves to coral. The timer jumps forward — 8 minutes of workbench editing compressed into 5 seconds. The player deploys. The session cuts back to the season health dashboard. The persistent offenders panel is empty. The resolved section shows "RELAY-C redesigned — 0 clusters in 3 analyses." The player says nothing. Chat goes: "3 SEASONS" / "the resolution noise" / "bro finally" / "that ascending fifth sound...". The clip title: "I've been patching this for 6 months."

---

## Newly Discovered Aspects

From this exploration, the following new aspects should be added to the frontier:

- **4.69d-i** — Cluster entry count trend as secondary severity metric: tracking whether the NUMBER of elements in each cluster event grows over time (3 → 3 → 4 entries); "worsening severity" as a distinct signal from "recurring severity"; architectural debt accumulation rate vs. simple recurrence count
- **4.69d-ii** — "Partial fix" annotation in persistence tracking: the ⚡ suffix that marks targeted fixes (addressing some cluster elements without a full redesign) and maintains the persistence counter; how the partial fix history reads differently from the "applied #1 fix" history — the player's level of engagement with the diagnostic is part of the record
- **4.69d-iii** — Persistence counter reset as first-class game event: the moment when a redesign commit resets the persistence counter; the "◆ badge dissolve + green checkmark" animation; the resolution motif sound; the "resolved agents" section in the persistent offenders panel as a trophy shelf
- **4.69d-iv** — "Cluster-free since redesign" streak counter: tracking how many consecutive career analyses have passed without the agent clustering, post-redesign; "RELAY-C has been cluster-free for 4 analyses since v4.0 redesign" as a positive reinforcement signal; how long before a player can trust the redesign "stuck"
- **4.69d-v** — Multi-source flag (persistent offender + cross-mission pattern): the merged diagnostic signal when both persistence tracking (4.69d) and cross-mission detection (4.49) flag the same agent; higher confidence framing; dedicated combined-evidence view in the season health dashboard
- **4.69d-vi** — Persistence history as learning artifact: the persistence history log as something the player can share, review, and build metacognitive awareness from; "my RELAY-C took 3 redesigns to fix" as a player narrative; sharable history links as community discussion artifacts (compare to Zachtronics histogram sharing)
- **4.69d-vii** — Experience-gated history vocabulary: the simplified vs. technical history view design (plain-language "what happened" vs. technical recurrence bars), including the transition point and the bidirectional toggle; how this affects new vs. veteran player onboarding to the persistence concept
