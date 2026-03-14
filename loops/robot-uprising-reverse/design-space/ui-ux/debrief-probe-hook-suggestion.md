# Probe Hook Suggestion from Transparency Panel

**Aspect:** 4.67 — Probe hook suggestion from transparency panel: when the drawer identifies an element as high-volatility or high-pivot-activity, surface a one-click action "Add probe hook to capture [ELEMENT] state in next match →"; converts passive explanation into active diagnostic step; probe hooks (4.15) as natural follow-on to understanding the pre-ranking.

**Parent:** 4.58 — Pre-ranking transparency panel
**Siblings:** 4.66 — Signal genealogy as pre-ranking source; 4.68 — Cross-match coverage as season health metric
**Related:** 4.15 — Probe hooks; 4.16 — Signal genealogy visualization; 4.58 — Pre-ranking transparency panel; 4.66 — Signal genealogy cross-tool link; 4.20 — Counterfactual simulation; 8.09 — Diagnostic layer as teaching arc; 4.25 — EDT trajectory career metric

---

## The Core Concept

The pre-ranking transparency drawer (4.58) is a retrospective tool. It explains what happened *last match*: "RELAY-C was active at tick 52. RELAY-C was modified 2 sessions ago. RELAY-C produced 18 distinct states during the match."

This explanation is valuable — it teaches the player how the pre-ranking heuristic works and gives them a mental model of diagnostic reasoning. But it's a *postmortem*. It tells you what was interesting. It cannot tell you what was *actually happening inside* RELAY-C at tick 52. The pre-ranking knows that RELAY-C was processing — but not which context slots were occupied, which signals triggered which rules, which hooks fired in what order.

**Probe hooks (4.15) exist to fill this gap.** A probe hook is a debug tap — a special hook type that fires without changing behavior. It captures an agent's full context buffer state at a specific trigger moment and writes that snapshot to a persistent diagnostic log. Like `console.log` in a JavaScript runtime, or a breakpoint in a debugger: it observes without interfering.

**The design insight of 4.67:** the pre-ranking drawer is not just a teaching tool. It is a *diagnostic lead generator*. Every time the drawer says "RELAY-C was high-volatility," it is implicitly saying: "you probably want to know more about what RELAY-C was doing, but last match's data doesn't go deep enough." The probe hook suggestion converts that implicit invitation into an explicit one-click action.

### The Bridge Between Retrospection and Prospection

The drawer says: "Here's what was interesting last match."
The probe hook says: "Set up a tap on that element so next match you'll see exactly what was happening."

This is the **retrospection → prospection bridge** — the mechanism by which the diagnostic system teaches the player to be proactive rather than reactive. Players who only use retrospective tools (replay scrubbing, fix explorer, transparency drawer) are always catching up: the match already happened, the failure already occurred, and they're analyzing the wreckage. Players who combine retrospective tools with prospective probes are setting traps: they form a hypothesis about where the system will be interesting, instrument it, run the match, and return to exactly the data they predicted they'd need.

This is how experienced software engineers debug distributed systems: after an incident, you add logging to the components that were acting interesting. Next time the incident happens (or a similar one does), you have the detailed data you were missing before.

**The probe hook suggestion makes this workflow available to a player who has never debugged a distributed system.** The drawer reads the pre-ranking signals and proposes the instrumentation step automatically. The player doesn't need to know that "high volatility = worth probing." The drawer infers this and offers the action.

---

## What a Probe Hook Is

Before designing the suggestion affordance, the probe hook mechanic itself needs to be defined:

**A probe hook is a zero-side-effect observation hook attached to a specific agent, triggered at a specified condition, that captures a full context buffer snapshot.**

Mechanically:
- **Target**: One agent (e.g., RELAY-C)
- **Trigger**: A condition (e.g., "at tick 52," "when buffer utilization exceeds 75%," "when a signal from SCOUT-B arrives," "on every tick")
- **Capture**: The agent's full context buffer at the moment of trigger — all occupied slots, slot contents (signal ID, data type, priority, age), current rules being evaluated, active hooks
- **Output**: A timestamped snapshot written to the Probe Log, visible in the next match's debrief

Probe hooks are explicitly **inert to the simulation**. A config with five active probe hooks behaves identically to the same config with zero probe hooks. The simulation engine processes them after each tick as an observation step, not as part of the agent's rule/hook evaluation. Players cannot cheat by adding probe hooks to a competitive config — probe hooks are stripped before Gauntlet deployment.

**The Probe Log** appears in the debrief as a new timeline track: a row of labeled capture points, each clickable to see the full snapshot. If RELAY-C had a probe hook triggering at tick 52 and at tick 68, two markers appear on the probe timeline row, labeled "RELAY-C @ 52" and "RELAY-C @ 68." Clicking either opens a slot-by-slot view of RELAY-C's buffer at that moment.

---

## The Trigger Conditions: When Does the Suggestion Appear?

Not every element in the pre-ranking drawer warrants a probe suggestion. The suggestion should appear when the pre-ranking signals are high enough that deeper data would likely be actionable. Three trigger thresholds:

### Threshold A: High Volatility (Primary Trigger)

**Condition:** Volatility score ≥ 0.65 (state changed 15+ times during the match)

**Why volatility is the best primary trigger:** High-volatility elements are elements whose state is changing rapidly — and those are precisely the elements where a buffer snapshot at a single moment is likely to reveal something. A low-volatility element (state changed 2 times in 90 ticks) has simple behavior; a snapshot tells you what you already expect. A high-volatility element (state changed 22 times in 90 ticks) has complex behavior; a snapshot at the right moment could reveal an unexpected state that explains the failure.

**Suggested probe trigger:** "When state changes rapidly, capture on the 3 most frequent transition ticks" — the probe hook auto-generates three trigger conditions, one for each of the top-3 state-change ticks for that element in the last match. This means the player doesn't have to specify when to trigger the probe — the system infers the most interesting moments from the replay data.

### Threshold B: High Pivot-Tick Activity (Secondary Trigger)

**Condition:** Pivot-tick activity score ≥ 0.70 (element was processing at or within 2 ticks of the EDT)

**Why pivot-tick activity triggers probing:** An element that was active at the moment the match turned is one where a snapshot at that exact moment could reveal the state that led to the pivot. "RELAY-C was processing at tick 52" is interesting; "RELAY-C's buffer had 7/8 slots occupied at tick 52 with a high-priority signal queued behind a low-priority signal that should have been evicted" is diagnostic gold.

**Suggested probe trigger:** "Capture at tick [EDT ± 2]" — a fixed-window capture around the effective determination tick. If the EDT is tick 52, the probe fires at ticks 50, 51, 52, 53, 54, giving five snapshots across the critical window.

### Threshold C: Combined High Score (Both Present)

**Condition:** Volatility ≥ 0.55 AND pivot-activity ≥ 0.55 (both signals present but neither dominant)

**Why the combined case is worth a suggestion:** When an element is both active at the pivot AND generally high-volatility, it's doubly interesting — it was doing complex things *and* it was doing them right when the match turned. The combined case is the highest-confidence "you should watch this one closely" signal in the pre-ranking.

**Suggested probe trigger:** "Capture at state-change boundary" — the probe fires whenever the element's buffer state changes (new signal arrives, signal evicted, rule evaluation alters buffer). This gives a complete trace of every state change, not just a snapshot at a fixed tick.

---

## The Full Design Space

### Option A: Inline CTA at the Bottom of the Drawer

**What happens:** At the bottom of the pre-ranking drawer's explanation for the top-ranked candidate, if the element clears one of the three threshold conditions, a new section appears:

```
┌─────────────────────────────────────────────────────────────────┐
│ RELAY-C was active at tick 52 — the pivot tick.                │
│ RELAY-C produced 18 distinct states (volatility: 0.71/1.0).   │
│ RELAY-C was modified 2 sessions ago.                           │
│ Rank score: 0.84 / 1.0                                         │
│ ─────────────────────────────────────────────────────────────  │
│ ⊕ Add probe hook to RELAY-C — capture state at next match      │
│   Captures: buffer snapshot at pivot-tick window (±2 ticks)    │
│   Visible in next debrief: Probe Log timeline track            │
└─────────────────────────────────────────────────────────────────┘
```

The "⊕ Add probe hook" line has a subtle amber left-border — connecting visually to the amber pivot-activity indicator above. It's clearly a button (slightly elevated, hover darkens background) but not aggressive — it's an offer, not a demand.

Clicking adds the probe hook to a staging area. The button changes to "✓ Probe added — active for next match" in teal. The player can click again to remove it.

**Strengths:**
- Appears exactly where the explanation is — the proximity makes the relationship between "why it's interesting" and "observe it next time" immediately legible
- Single click to add — zero configuration required
- Collapsible with the drawer — if the player collapses the drawer, the probe suggestion disappears, not as a separate element
- The summary line ("Captures: buffer snapshot at pivot-tick window") tells the player what they'll get before they commit

**Weaknesses:**
- Drawer is already information-dense — the probe CTA adds a fourth item below the three-signal explanation
- If multiple candidates in the result list each have their own probe suggestions (high-volatility #1 AND high-pivot-activity #2), there are now two CTAs across the drawer — visual noise
- Players may click "⊕ Add probe hook" without understanding what it does; the two-line summary may not be enough

**Mitigation:**
- Only show the probe suggestion for the #1 ranked candidate in the drawer by default
- Add a "Why is this useful?" expand link next to the summary line — expands to a 3-sentence explanation for players who want more context
- The "✓ Probe added" state includes a link: "View probe configuration →" for players who want to customize the trigger

---

### Option B: Probe Suggestion in the Pre-Ranking Score Widget

**What happens:** In the three-bar heuristic visualizer (Option E from 4.58), the bar that exceeds a threshold gets an additional indicator — a small amber circle with a probe icon (a stylized circle with an arrow, like a crosshair):

```
RELAY-C — context buffer +1 slot    [score: 0.84]
■■■■■■■■░░ PIVOT ACTIVITY    0.78 [🎯]
■■■■■░░░░░ RECENCY           0.62
■■■■■■░░░░ VOLATILITY        0.71 [🎯]
                              ─────
                     [Add probe for RELAY-C →]
```

The [🎯] icons appear only on bars where the signal score exceeds the threshold. They're small (12px) and carry a tooltip: "This signal is strong enough to warrant probing — add a probe hook to observe RELAY-C's state directly next match." Clicking either [🎯] icon OR the [Add probe for RELAY-C →] button at the bottom adds the probe.

**What's different from Option A:** The probe suggestion is connected directly to the score visualization. The player can see *which* signals justify the probe suggestion, not just that the overall candidate is "worth probing." If only volatility is above threshold but pivot-activity is not, only the volatility bar gets a [🎯].

**Strengths:**
- Directly tied to the specific signal scores — teaches "probe when X signal is high" not just "probe this element"
- Multiple signals above threshold = multiple icons, making it clear the element is doubly flagged
- The probe CTA appears inside the data visualization, not as a separate section below it — keeps the drawer spatially compact

**Weaknesses:**
- Requires the three-bar visualizer (Option E from 4.58) to be the active drawer mode — the inline-text drawer (Option C from 4.58) doesn't have bars to attach icons to
- [🎯] is a small icon that may be easy to miss or visually confusing — what does a crosshair mean in this context?
- Players who haven't learned what probe hooks are will see [🎯] icons without context

---

### Option C: Probe Suggestion as a Debrief-Level Panel

**What happens:** Instead of embedding the probe suggestion inside the pre-ranking drawer, it appears as a separate, persistent panel at the bottom of the debrief screen — the "Diagnostic Actions" panel. This panel accumulates all one-click diagnostic actions the debrief has surfaced across its various tools:

```
╔══════════════════════════════════════════════════════════════════╗
║ DIAGNOSTIC ACTIONS FOR NEXT MATCH                               ║
╠══════════════════════════════════════════════════════════════════╣
║ ⊕ Probe RELAY-C at pivot-tick window (from: pre-ranking, rank  ║
║   score 0.84, volatility 0.71)                           [Add] ║
║ ⊕ Probe STRIKER-A at buffer-full event (from: signal           ║
║   genealogy broken edge, tick 52-55)                     [Add] ║
║ ─────────────────────────────────────────────────────────────  ║
║ 2 probes queued for next match. [Clear all] [Review probes →]  ║
╚══════════════════════════════════════════════════════════════════╝
```

The panel aggregates suggestions from multiple diagnostic surfaces: the pre-ranking drawer surfaces a probe for RELAY-C; the signal genealogy's broken-edge discovery (from 4.66's design) surfaces a probe for STRIKER-A; the MSMFE's coverage map might surface a probe for an element in the dominant failure cluster. Each suggestion includes its source ("from: pre-ranking") so the player knows why it's there.

**Strengths:**
- The player has one place to review all diagnostic actions — they don't have to hunt through three separate panels to see what probes have been suggested
- Aggregation is powerful: if both the pre-ranking drawer AND the signal genealogy suggest probing the same element, the panel can de-duplicate and show one entry labeled "from: pre-ranking + genealogy" — the convergence of two sources strengthens the case
- Separating suggestions from the pre-ranking drawer means the drawer itself stays focused on explanation, not actions

**Weaknesses:**
- The "Diagnostic Actions" panel is a new UI surface in the debrief — more screen real estate consumed
- Probe suggestions from the pre-ranking drawer may feel disconnected from the reasoning if the source panel is no longer adjacent
- Aggregation makes the panel useful only when there are multiple suggestions; if there's only one probe suggestion, a dedicated panel feels heavyweight

**Recommended design: Option A (default) + Option C (unlocked after 10 sessions)**

For early-game players, the inline CTA at the bottom of the drawer (Option A) is the right approach: it's contextually located and low-friction. After 10 sessions, the "Diagnostic Actions" aggregation panel appears in the debrief layout (collapsed by default), giving experienced players a single surface for reviewing all the actions the debrief has surfaced across its tools.

---

### Option D: Smart Probe — Pre-Configured Trigger Inference

**What happens:** Instead of a generic "add probe hook to RELAY-C," the suggestion proposes a *specific pre-configured probe* derived from the pre-ranking signals:

When **high volatility** drives the suggestion:
```
⊕ Add volatility probe to RELAY-C
  Trigger: on every state change
  Captures: buffer snapshot on each transition
  Expected: ~18 snapshots next match
```

When **high pivot-tick activity** drives the suggestion:
```
⊕ Add pivot-window probe to RELAY-C
  Trigger: ticks 50–54 (pivot window)
  Captures: buffer snapshot at each tick
  Expected: 5 sequential snapshots
```

When **recent modification** drives the suggestion (new threshold: recency ≥ 0.80):
```
⊕ Add change-validation probe to RELAY-C
  Trigger: on rule-evaluation (every tick RELAY-C processes)
  Captures: full rule evaluation trace
  Expected: continuous trace for match duration
```

The probe type is chosen based on which signal is highest. The label explains the capture strategy and includes an estimated number of snapshots ("~18 snapshots") so the player knows how much data they'll be looking at.

**Strengths:**
- The player doesn't need to configure the probe — the right trigger for the right signal is chosen automatically
- The "Expected: ~18 snapshots" number sets realistic expectations and previews what next match's Probe Log will look like
- Three distinct probe types build a vocabulary of probe strategies: "volatility probes" for complex elements, "pivot-window probes" for timing analysis, "change-validation probes" for recent modifications

**Weaknesses:**
- Three probe types add vocabulary the player needs to learn: what's the difference between a "volatility probe" and a "pivot-window probe"?
- The estimated snapshot count ("~18 snapshots") is inferred from last match's behavior, which may not predict next match's behavior if the config or scenario changes
- A "continuous trace" probe (from the change-validation variant) could generate hundreds of snapshots in a long match — overwhelming the Probe Log

**Mitigation for continuous traces:** Cap the change-validation probe at 50 snapshots, sampling evenly from the match. Show "50 sampled snapshots (1 per 2 ticks)" in the preview.

---

## The Probe Log: What Players See Next Match

The probe suggestion is only half of 4.67's design. The other half is what happens when the player runs the next match with an active probe.

The **Probe Log** appears in the debrief as a new timeline track, positioned directly below the main debrief timeline. It looks like a second, narrower timeline with labeled markers at the probe capture ticks:

```
MAIN TIMELINE:  ──────────────◆──────────────────────── (tick 90)
                              EDT(52)
PROBE LOG:      ────⬛─⬛─⬛──⬛──⬛──────────────────────
                   50 51 52 53 54
                   RELAY-C snapshots (5)
```

Each marker (⬛) is clickable. Clicking opens the **Probe Detail Panel** — a side panel showing the full context buffer at that tick:

```
RELAY-C @ tick 52
─────────────────────────────────────────────
CONTEXT BUFFER (7/8 slots occupied):
  [1] S-04: beacon from SCOUT-B  (age: 3t, priority: HIGH)
  [2] S-07: routing directive     (age: 0t, priority: HIGH)
  [3] S-02: ambient scan result   (age: 8t, priority: LOW)
  [4] S-11: relay confirmation    (age: 1t, priority: MED)
  [5] S-09: fallback route        (age: 5t, priority: LOW)
  [6] S-13: redundant beacon      (age: 2t, priority: LOW)
  [7] S-06: routing directive     (age: 3t, priority: HIGH)
  [ ] (empty)
─────────────────────────────────────────────
ACTIVE RULES AT THIS TICK:
  Rule 3: IF buffer >75% THEN evict lowest-priority → FIRED
  Rule 1: IF signal.type=routing THEN forward to STRIKER-A → FIRED
─────────────────────────────────────────────
HOOKS EVALUATED:
  Hook A: ON signal(SCOUT-B) → relay(STRIKER-A) → TRIGGERED
─────────────────────────────────────────────
OUTGOING SIGNALS THIS TICK:
  S-08 → STRIKER-A (routing directive) → DROPPED (STRIKER-A buffer full)
```

This is a complete diagnostic snapshot: every buffer slot, every active rule, every hook evaluation, every outgoing signal. The player can now see that RELAY-C had 7/8 slots occupied, Rule 3 was evicting low-priority signals (but there was still a mix of LOW-priority signals in slots 3, 5, 6), and the routing directive it tried to send to STRIKER-A was dropped because STRIKER-A's buffer was full.

The pre-ranking drawer told the player that RELAY-C was interesting at tick 52. The probe snapshot reveals *why* it was interesting, with full mechanical fidelity.

---

## Player Journeys

### Journey: Tomás, 34, Backend Engineer, Session 22

**Context:** Mission 9 — "Cascading Silence." Tomás has been using the pre-ranking drawer and signal genealogy for 6 sessions. He discovered last session (via the genealogy, from 4.66) that the pre-ranking was surfacing RELAY-C as a sender but the real failure was STRIKER-A as a receiver. He applied the fix (STRIKER-A +1 buffer slot) and got 81% pass rate. Still 19 failures. He wants to understand what's happening in the remaining failure cases.

**Minute 0:00 — The Drawer Offers a New Tool**

Tomás opens the debrief. Runs QUICK mode. The Fix Explorer surfaces:

> **FIRST VIABLE FIX: RELAY-C — context buffer +1 slot** *(rank score: 0.84)*

He opens the drawer. Familiar signals: RELAY-C, pivot-active at tick 52, volatility 0.71.

Below the three-signal explanation, there's something new:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⊕ Add pivot-window probe to RELAY-C
   Captures buffer snapshot at ticks 50–54 (5 snapshots)
   Visible in next debrief: Probe Log timeline track
   "Why is this useful?" ▼
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

He clicks "Why is this useful?" The section expands:

> "The pre-ranking identifies RELAY-C as high-activity during the match's turning point. But it doesn't show what RELAY-C's context buffer *contained* at that moment — which signals were queued, which rules fired, and what was sent or dropped. A pivot-window probe captures 5 sequential snapshots of RELAY-C's buffer from ticks 50–54, giving you the full mechanical picture of what RELAY-C was doing at the critical moment."

He clicks the ⊕ button. It changes to "✓ Probe added — active for next match."

**Minute 1:30 — The Next Match**

Tomás runs the mission with the probe active. The match runs. Pass rate: 78/100 (slightly different scenario seed from last time).

In the debrief, the Probe Log timeline track has appeared — a new row below the main timeline. Five square markers at ticks 50, 51, 52, 53, 54. He clicks tick 52.

**Minute 2:00 — Reading the Snapshot**

The Probe Detail Panel opens. He reads:

```
RELAY-C @ tick 52
CONTEXT BUFFER (7/8 slots occupied):
  [1] S-04: beacon from SCOUT-B  (age: 3t, priority: HIGH)
  [2] S-07: routing directive     (age: 0t, priority: HIGH)
  [3] S-02: ambient scan result   (age: 8t, priority: LOW)
  [4] S-09: fallback route        (age: 5t, priority: LOW)
  [5] S-11: relay confirmation    (age: 1t, priority: MED)
  [6] S-13: redundant beacon      (age: 2t, priority: LOW)
  [7] S-06: routing directive     (age: 3t, priority: HIGH)
  [ ] (empty)
OUTGOING SIGNALS THIS TICK:
  S-08 → STRIKER-A (routing directive) → DROPPED (STRIKER-A buffer full)
```

Then he looks at tick 51 snapshot:

```
RELAY-C @ tick 51
CONTEXT BUFFER (6/8 slots occupied):
  [1] S-04: beacon from SCOUT-B  (age: 2t, priority: HIGH)
  [2] S-02: ambient scan result   (age: 7t, priority: LOW)
  [3] S-09: fallback route        (age: 4t, priority: LOW)
  [4] S-11: relay confirmation    (age: 0t, priority: MED)
  [5] S-13: redundant beacon      (age: 1t, priority: LOW)
  [6] S-06: routing directive     (age: 2t, priority: HIGH)
  [ ] (empty)
  [ ] (empty)
```

He stares at the progression. At tick 51, RELAY-C had 6/8 slots. At tick 52, it had 7/8 slots — the new slot was S-07 (routing directive, age: 0t). This is the critical signal that needed to reach STRIKER-A. But RELAY-C's eviction rule only evicts when buffer is >75% (6/8 = 75% — exactly on the boundary). Rule 3 didn't fire at tick 51. At tick 52, the buffer was 7/8 = 87.5% — Rule 3 fired, but it evicted S-02 (an ambient scan result) — not one of the three LOW-priority signals. S-02 was the oldest LOW-priority signal, so it was evicted correctly by age. But S-13 (redundant beacon, age: 2t) and S-09 (fallback route, age: 5t) were also LOW-priority and didn't get evicted.

Wait. The eviction rule says "IF buffer >75% THEN evict lowest-priority." But there were multiple LOW-priority signals. How does the rule choose? Does it evict the oldest? The newest? All of them?

**Minute 3:30 — The Discovery**

Tomás goes to the workbench and opens RELAY-C's rule configuration. Rule 3:

```
IF buffer_utilization > 75% THEN evict_priority(LOWEST, count=1)
```

`count=1`. The rule evicts exactly one signal when the buffer exceeds 75%. But at tick 52, RELAY-C had *three* LOW-priority signals taking up buffer slots. The rule evicted one of them. Two remained. Two wasted slots that could have accommodated incoming routing directives.

He changes Rule 3: `count=2`. Now it evicts two LOW-priority signals when the buffer is above 75%.

He runs the mission. Pass rate: 91/100.

**Minute 5:00 — What He Learned**

The probe gave him data he couldn't get from the replay, the genealogy, or the fix explorer: the exact count of LOW-priority signals occupying RELAY-C's buffer at the critical moment, and the rule parameter that controlled how many were evicted. The pre-ranking drawer identified the right neighborhood. The fix explorer found the wrong fix (buffer +1 slot would have helped but the real issue was eviction policy). The probe revealed the actual mechanical state that led to the suboptimal eviction.

In his session notes: "Pre-ranking = right agent. Fix Explorer = first guess. Probe = actual state. Three tools, three levels of resolution. Go to probe when Fix Explorer gives a wrong fix."

**What Tomás wants to do next:** He wants to add a probe to STRIKER-A as well — to see its buffer state at tick 52-55 and confirm STRIKER-A's buffer fill was being managed correctly after his earlier fix. Two probes, one mission, complete mechanical picture.

**UI Annotations:**
- Probe suggestion section: appears below the three-signal explanation, above the "compare with #2" link; separated by a hairline amber rule; 44px tall in collapsed state
- "Why is this useful?" expand: reveals a 3-sentence expansion in lighter-weight type; expand animation 150ms; collapses when clicked again
- ⊕ button: 28px height, full width of the drawer's inner content area; left-aligned amber circle with ⊕ icon; on click, transitions to "✓ Probe added" in teal with a checkmark; no modal, no confirmation needed
- Probe Log timeline track: 24px tall row positioned below the main debrief timeline; amber label "PROBE LOG (RELAY-C)" left-aligned; square markers are 10px × 10px, amber-fill, labeled with tick number in 9px type below
- Probe Detail Panel: opens as right-side panel, same width and animation as genealogy panel; monospace typeface for buffer slot contents; slot rows are individually selectable; clicking a signal ID highlights it in the signal genealogy if genealogy is also open (vocabulary unification, cross-tool link extension of 4.66)

---

### Journey: Priya, 16, High School Student, Session 7

**Context:** Mission 5 — "Ghost Protocol." Priya has been playing for 2 weeks. She's discovered the pre-ranking drawer and finds it satisfying to read. She doesn't fully understand volatility scores but she likes that the game tells her *why* something is ranked first. Today she's stuck — her pass rate went from 63 to 58 after applying a fix and she doesn't know why.

**Minute 0:00 — The Drawer and the New Button**

Priya opens the debrief. Runs QUICK mode. The drawer says:

```
RELAY-A was busy at tick 43 (when the match turned).
RELAY-A was very busy this run — it changed between 21 different states.
RELAY-A was changed in your last session.
Rank score: 0.89
```

(She's in plain-language mode — the vocabulary is accessible.)

Below this, she sees:

```
⊕ Watch RELAY-A closely next match
  Records what RELAY-A was holding at the key moment
  "Why is this useful?" ▼
```

She doesn't know what "watch RELAY-A closely" means technically, but it sounds good. She clicks "Why is this useful?"

The expansion:

> "RELAY-A was busy at exactly the moment the match turned. This probe will take a picture of everything RELAY-A was doing at that moment — like a pause button that shows you what's inside. Next match, you'll be able to see exactly what RELAY-A had in its memory and what it was trying to do."

She clicks ⊕. "✓ Added — RELAY-A will be watched next match." Okay.

**Minute 1:30 — The Watched Match**

Priya runs the mission. Pass rate: 61 — a little better but still struggling.

She opens the debrief. There's a new row below the timeline:

```
WATCH LOG (RELAY-A):  ──────⬛──────────────────────
                           43
```

One marker, at tick 43. She clicks it.

The panel that opens shows a list of things. She reads:

```
RELAY-A @ tick 43
CONTEXT BUFFER (8/8 slots — FULL):
  [1] S-01: beacon from SCOUT-A  (age: 10t, priority: LOW)
  [2] S-03: beacon from SCOUT-A  (age: 8t, priority: LOW)
  [3] S-05: beacon from SCOUT-A  (age: 6t, priority: LOW)
  [4] S-07: beacon from SCOUT-A  (age: 4t, priority: LOW)
  [5] S-09: beacon from SCOUT-A  (age: 2t, priority: LOW)
  [6] S-11: beacon from SCOUT-A  (age: 0t, priority: LOW)
  [7] S-13: routing directive     (age: 2t, priority: HIGH)
  [8] S-14: routing directive     (age: 0t, priority: HIGH)
OUTGOING SIGNALS THIS TICK: None
```

She stares at this. Slots 1–6 are all beacons from SCOUT-A, all LOW priority, ranging from just-arrived to 10 ticks old. Two HIGH priority routing directives are stuck in slots 7 and 8. RELAY-A's buffer is completely full of SCOUT-A's beacon signals.

She didn't know SCOUT-A was sending that many signals. She thought SCOUT-A was scouting — she didn't know it was flooding RELAY-A's memory.

**Minute 2:30 — The "Oh" Moment**

Priya opens SCOUT-A's configuration in the workbench. SCOUT-A has a hook:

```
ON location_change → send_beacon(RELAY-A, priority=LOW)
```

SCOUT-A sends a beacon to RELAY-A *every time it changes location*. And SCOUT-A is moving a lot — it's a scout, it changes location every 2 ticks. So RELAY-A is getting a new LOW-priority beacon from SCOUT-A every 2 ticks, filling up its buffer and blocking the HIGH-priority routing directives it's trying to relay.

She changes the hook:

```
ON location_change, rate_limit=10 → send_beacon(RELAY-A, priority=LOW)
```

Rate limit — she saw this option in the hook builder and wasn't sure what it did. She sets it to 10: "only send one beacon per 10 ticks."

She runs the mission. Pass rate: 79/100.

**Minute 4:00 — What She Learned (Without Knowing She Learned It)**

Priya didn't come into this session with a vocabulary for "beacon flooding" or "buffer saturation." She discovered a real distributed systems problem — a high-frequency low-priority publisher drowning out a low-frequency high-priority publisher — by looking at a probe snapshot. The game named none of this. She just saw the picture and understood it.

Three sessions later, when a friend asks her about the game, she'll say "you have to be careful about agents sending too many messages because it fills up other agents' memory." She's described a real engineering problem in her own words, without vocabulary she didn't have.

**What Priya wants to do next:** She wants to add a rate limit to SCOUT-B as well (she realizes SCOUT-B probably has the same hook). And she wants to understand what "priority=LOW" and "priority=HIGH" actually mean for the eviction rules. She saw that HIGH priority signals were stuck behind LOW priority ones — that seems backwards.

**UI Annotations:**
- Plain-language mode changes the drawer section label from "⊕ Add pivot-window probe to RELAY-A" to "⊕ Watch RELAY-A closely next match" — same mechanics, accessible language
- Probe Detail Panel in plain-language mode: slot labels change from "S-01: beacon from SCOUT-A (age: 10t, priority: LOW)" to "S-01: message from SCOUT-A (received 10 ticks ago, low importance)"; slot-full state is labeled "FULL — RELAY-A's memory is completely occupied" rather than "8/8 slots"
- The "OUTGOING SIGNALS THIS TICK: None" line appears in amber when zero signals were sent but the agent was active — it implies the agent was processing but couldn't complete any outgoing actions
- The Watch Log label in plain-language mode says "WATCH LOG (RELAY-A)" rather than "PROBE LOG (RELAY-A)"; consistent plain-language mode throughout

---

### Journey: Keiko, 28, Commander-Tier Competitive Player, Session 94

**Context:** Keiko is in Gauntlet prep for a tournament match against an opponent known as "Mirror Mirror" — a player whose configs famously mimic the opponent's routing architecture and then subvert it. Keiko's had a 73% win rate this season but two recent losses that don't fit her mental model. She suspects Mirror Mirror has found a specific structural weakness in her relay chain timing. She needs to find it before the match.

**Minute 0:00 — The Diagnostic Setup**

Keiko opens the debrief from her last match against Mirror Mirror's ghost. Pre-ranking: RELAY-C, rank score 0.91, all three signals high.

She ignores the standard probe suggestion — "Add pivot-window probe" — and instead clicks "View probe configuration →" to customize it:

The probe configuration panel:

```
PROBE CONFIGURATION: RELAY-C
───────────────────────────────
Trigger type:
  ○ Pivot-window (ticks EDT±2)  [suggested]
  ● Custom tick range: [38] to [58]
  ○ On every state change
  ○ On signal receipt from: [_______]
  ○ On rule evaluation

Capture scope:
  ● Full buffer + active rules + hooks evaluated + outgoing signals
  ○ Buffer slots only
  ○ Outgoing signals only

Duration:
  ● Single match
  ○ Next 3 matches
  ○ Until manually removed
```

Keiko sets a custom range: ticks 38–58. She suspects the critical window is around tick 45, not tick 52. She also adds a second probe: STRIKER-A, custom range ticks 45-60. She saves. Two probes active for next match.

**Minute 2:00 — Reading Two Simultaneous Probes**

Next match runs. Debrief:

```
PROBE LOG:
RELAY-C:    ──⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛──── (ticks 38-58, 21 snapshots)
STRIKER-A:  ──────⬛⬛⬛⬛⬛⬛⬛⬛⬛── (ticks 45-60, 16 snapshots)
```

She clicks through the RELAY-C snapshots methodically. At tick 43, she notices something:

```
RELAY-C @ tick 43
CONTEXT BUFFER (5/8 slots):
  [1] S-04: high-value target confirmed (age: 2t, priority: HIGH)
  [2] S-06: flanking position available (age: 1t, priority: HIGH)
  [3] S-08: flanking position available (age: 0t, priority: HIGH)
  [4] S-02: ambient scan (age: 11t, priority: LOW)
  [5] S-03: ambient scan (age: 9t, priority: LOW)
ACTIVE RULES: Rule 5: IF count(HIGH_priority) >= 3 THEN evict_low(count=ALL) → NOT FIRED (condition not met: count was 2 at prev tick, now 3)
```

Rule 5 fires when there are 3+ HIGH-priority signals. At tick 43, there are exactly 3. But the rule checks at the *start* of the tick, based on the previous tick's buffer state. At tick 42, RELAY-C had 2 HIGH-priority signals. At tick 43, it has 3. But the rule didn't fire because it evaluated at the start of tick 43 (with tick 42's count = 2), not at the end.

She checks tick 44:

```
RELAY-C @ tick 44
CONTEXT BUFFER (7/8 slots):
  [1] S-04: high-value target confirmed (age: 3t, priority: HIGH)
  [2] S-06: flanking position available (age: 2t, priority: HIGH)
  [3] S-08: flanking position available (age: 1t, priority: HIGH)
  [4] S-10: emergency routing signal    (age: 0t, priority: CRITICAL)
  [5] S-02: ambient scan (age: 12t, priority: LOW)
  [6] S-03: ambient scan (age: 10t, priority: LOW)
  [7] S-07: secondary target            (age: 3t, priority: MED)
ACTIVE RULES: Rule 5: IF count(HIGH_priority) >= 3 THEN evict_low(count=ALL) → FIRED → evicted S-02, S-03
```

Rule 5 fired at tick 44 (based on tick 43's count = 3). It evicted S-02 and S-03. But at tick 44, S-10 — an EMERGENCY ROUTING signal — arrived. After eviction, the buffer has 5 occupied slots. Room for S-10. Fine.

But now she looks at tick 45:

```
RELAY-C @ tick 45
CONTEXT BUFFER (6/8 slots):
  [1] S-04: high-value target confirmed (age: 4t, priority: HIGH)
  [2] S-06: flanking position available (age: 3t, priority: HIGH)
  [3] S-08: flanking position available (age: 2t, priority: HIGH)
  [4] S-10: emergency routing signal    (age: 1t, priority: CRITICAL)
  [5] S-12: flanking confirmation       (age: 0t, priority: HIGH)
  [6] S-07: secondary target            (age: 4t, priority: MED)
OUTGOING SIGNALS:
  Routing toward STRIKER-A → DROPPED (STRIKER-A buffer full, critical signals given priority)
```

S-12 arrived at tick 45 — a fourth HIGH-priority signal. Now Rule 5 should fire at tick 46. But the routing signal toward STRIKER-A was dropped at tick 45. Why?

Keiko checks the STRIKER-A probe at tick 45:

```
STRIKER-A @ tick 45
CONTEXT BUFFER (8/8 — FULL):
  [1-6]: 6 × "flanking position available" (HIGH priority, age 0-5t)
  [7]: "high-value target confirmed" (HIGH priority, age 3t)
  [8]: "emergency routing" (CRITICAL priority, age 0t)
```

STRIKER-A was receiving flanking confirmation signals directly from something — not from RELAY-C, but from a direct source. STRIKER-A's buffer was full of flanking signals before RELAY-C's routing signal arrived. STRIKER-A was not receiving from RELAY-C; it was being flooded by a different source.

**Minute 5:00 — The Architectural Weakness Found**

Keiko checks STRIKER-A's hook configuration. STRIKER-A has an undocumented behavior: it's also connected directly to SCOUT-B via a hook (`ON scout_B.high_value_signal → absorb_and_analyze`). She didn't configure this — it's inherited from a template she used in Season 2 and hasn't reviewed.

Mirror Mirror's configs are designed to send a high volume of diversionary signals through SCOUT-B, knowing that any opponent using this template will have STRIKER-A absorbing them directly, crowding out RELAY-C's routing signals.

The structural weakness: STRIKER-A has a direct hook to SCOUT-B that was never disabled. Under high SCOUT-B traffic, STRIKER-A's buffer fills with diversionary signals before RELAY-C's priority routing can arrive.

She removes the direct SCOUT-B → STRIKER-A hook. STRIKER-A will now receive only from RELAY-C (as intended). She runs the mission against Mirror Mirror's ghost. Pass rate: 87/100. Her best ever against this opponent.

**What Keiko wants to do next:** She wants to run the adversarial counterfactual (4.39) against Mirror Mirror's last config with this fix in place, to confirm that the fix makes her resistant to the specific attack pattern Mirror Mirror uses. Then she wants to check whether any of her other striker units have the same template-inherited hook.

**UI Annotations:**
- "View probe configuration →" link: appears in the ✓ Probe added state, right-aligned in the same amber text; clicking opens a modal overlay on the debrief screen rather than navigating away
- Custom tick range inputs: two number fields, min/max, with "EDT (52)" shown as a hint value in grey; range inputs are live-validating (can't set min > max; can't set range outside [0, max_ticks])
- Duration option "Next 3 matches": the probe persists across 3 sequential matches before auto-expiring; useful for investigating behaviors that are scenario-dependent rather than config-dependent
- Two simultaneous Probe Log rows: RELAY-C row is amber (matching its pre-ranking treatment); STRIKER-A row is violet (matching the second-candidate treatment from the agree-to-disagree design); distinct colors prevent visual confusion when two rows are open simultaneously
- Snapshot comparison mode: when both rows are visible, clicking a RELAY-C snapshot at tick 44 and then a STRIKER-A snapshot at tick 45 opens a two-column comparison view — left column RELAY-C@44, right column STRIKER-A@45; useful for exactly Keiko's use case of checking two agents' states at adjacent ticks

---

## Strengths

**Closes the retrospection-to-prospection loop.** The pre-ranking drawer is retrospective: it explains what was interesting last match. The probe hook is prospective: it sets up observation for next match. Without 4.67, the player who understands "RELAY-C was interesting" has no clear next step beyond "apply the fix and hope." With 4.67, there's a natural action: instrument the interesting element and learn more.

**Makes the invisible visible at the mechanical level.** The replay shows visual behavior. The fix explorer shows counterfactual outcomes. The signal genealogy shows signal network topology. None of these show the *contents* of an agent's context buffer at a specific tick. Only a probe can reveal that. Buffer slot contents are the most mechanical, granular, and diagnostic data level in the game — and they're completely opaque without probing.

**Teaches the engineering discipline of instrumentation.** Every experienced systems engineer knows that when something is behaving unexpectedly, the first response is to add logging and reproduce. Robot Uprising's probe suggestion teaches this exact workflow: notice interesting behavior (pre-ranking drawer) → add instrumentation (probe hook) → reproduce with instrumentation active (run next match) → read the log (Probe Detail Panel). This is debugging methodology 101, taught through game mechanics.

**Context-appropriate suggestion threshold.** The suggestion only appears when the pre-ranking signals meet the threshold criteria — not for every candidate, not for every match. When it appears, it's because the signals are genuinely strong enough that probing is likely to yield useful data. This prevents the suggestion from becoming noise.

**The customization path (Option D) serves expert users.** For players like Keiko who know exactly what they want to observe, the "View probe configuration →" path gives full control: custom tick ranges, scope selection, multi-match duration. The probe suggestion is a fast path to a reasonable default; the configuration panel is the expert path to a precisely calibrated instrument.

---

## Weaknesses

**Probe Log is a new vocabulary.** Players need to learn what the Probe Log is, what a "snapshot" means, and how to read the slot-by-slot buffer view. This is another surface to discover and understand. The probe suggestion's "Why is this useful?" expand helps, but it can't eliminate the learning curve of reading buffer slot data for the first time.

**Probe hooks are invisible during the match.** Unlike most game mechanics, probe hooks do nothing observable while the match runs. The player clicks "Add probe" and then... the match runs normally. Nothing visually indicates the probe is active during execution. If the probe adds its Probe Log track to the debrief, the player might not notice it (it's a new UI element below the familiar timeline). Discovery of the Probe Log output requires the player to look down.

**Mitigation:** When the debrief opens for a match that had active probes, the debrief's opening animation pauses briefly at the Probe Log track — a single amber pulse on the track's label ("PROBE LOG (RELAY-C)") draws the eye. A small banner at the top of the debrief: "Probe data available — 5 snapshots captured." Dismissable.

**High volatility ≠ interesting probe data.** A high-volatility element that's just cycling through normal states may not have surprising probe data — the volatility reflects normal operation, not a failure mode. The probe suggestion's threshold (volatility ≥ 0.65) will sometimes produce probes that reveal nothing surprising, and the player will feel the probe was a waste of setup time.

**Mitigation:** In the Probe Detail Panel, anomalous states are flagged automatically: if the buffer contents at a probe-captured tick are significantly different from the average buffer state at that tick across the last 5 matches, a small "⚠ unusual state" label appears on the snapshot marker. This helps players find the interesting snapshots quickly rather than reading all 18 snapshots to find the one that matters.

**Multi-match probe persistence complicates scenario variation.** When a probe persists for 3 matches (from Keiko's usage pattern), the three Probe Log outputs may show different behavior because the scenario seeds are different. The player needs to know whether a pattern they see is stable across scenarios or specific to one seed. The Probe Log should show which scenario seed each snapshot was captured in — and ideally show a "snapshot comparison across matches" view for multi-match probes.

---

## Interaction Effects

**With 4.15 (Probe hooks as core mechanic):**
4.67 is the primary discovery pathway for probe hooks. Players who might never encounter probe hooks as an explicit feature (they live in the hook builder in the workbench, which is an advanced surface) will discover them naturally through the pre-ranking drawer's suggestion. The drawer is the probe hook's tutorial.

**With 4.58 (Pre-ranking transparency panel):**
4.67 is an extension of the pre-ranking drawer, not a separate feature. It lives inside the drawer's layout. Its appearance depends on the drawer being open and a threshold condition being met. The two must be designed as a single integrated surface — the probe suggestion's visual language (amber, same as pivot-activity indicator) must match the drawer's existing vocabulary.

**With 4.66 (Signal genealogy cross-tool link):**
Both 4.66 and 4.67 are "follow-on actions" from the pre-ranking drawer:
- 4.66: "See in genealogy →" — retrospective, navigates to existing data
- 4.67: "Add probe hook →" — prospective, sets up new data collection

These are complementary, not competing. A player looking at RELAY-C in the drawer would naturally want both: "show me what RELAY-C was doing in the signal network" (4.66) AND "let me look at RELAY-C's buffer contents next match" (4.67). Both should appear in the drawer when their respective thresholds are met:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[See RELAY-C at tick 52 in signal genealogy →]    (4.66)
⊕ Add probe to RELAY-C — capture state next match (4.67)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Two actions, both offering to go deeper — but in different temporal directions. The genealogy action looks backward (last match's signal network). The probe action looks forward (next match's buffer contents).

**With 4.105 (Signal genealogy broken-edge sub-panel):**
When the genealogy reveals a broken edge (RELAY-C → STRIKER-A dropped at tick 52), the sub-panel (4.105) shows why the signal was dropped. But 4.105 shows the receiving agent's buffer state inferred from the simulation, not captured in real-time. A probe hook on STRIKER-A captures its buffer state with full mechanical fidelity — more granular than the inferred state. The broken-edge sub-panel should offer a probe suggestion if the inferred state is uncertain: "Buffer analysis based on simulation inference. For exact data, add a probe hook →"

**With 4.60 (Search budget as player resource):**
If search budget is a scarce resource (from 4.60), probe hooks could be similarly resource-limited — the player has a probe budget that regenerates between sessions. Early-game: 2 probe slots per session. Mid-game: 4 slots. Unlimited after reaching a research milestone. This creates strategic decisions about which elements to probe and when, paralleling the QUICK/THOROUGH budget decision.

**With 8.09 (Diagnostic layer as teaching arc):**
The probe hook suggestion is step 5 in the diagnostic teaching arc: (1) passive replay → (2) EDT annotation → (3) Fix Explorer → (4) pre-ranking drawer → (4.5) signal genealogy → **(5) probe hooks** → (6) building personal diagnostic priors that transfer to real engineering. The probe step is the highest-resolution tool in the diagnostic stack — and the one that most directly maps to real engineering practice (adding logging/tracing before reproducing a bug).

**With 4.39 (Adversarial counterfactual mode):**
In adversarial counterfactual analysis, the probe suggestion could appear on the *opponent's* config elements: "OPPONENT'S RELAY-C was high-volatility during your match. Add a probe to your next match to observe how similar relay configurations behave under high-signal load →" — prospective diagnosis of a vulnerability in your own architecture based on observing the opponent's behavior.

---

## Comparable Games and Media

**Chrome DevTools "Add breakpoint" from exception stack trace**: When Chrome's DevTools shows an uncaught exception, the stack trace includes the file and line number. Next to the line, there's often an option to "add a logpoint" or "pause on exceptions of this type." This is exactly the probe hook suggestion pattern: the error surface (pre-ranking drawer = uncaught exception report) tells you what was interesting, and offers a one-click action to instrument the specific location for future diagnosis.

**AWS CloudWatch "Create alarm" from a metric spike**: In CloudWatch's metric visualization, when a metric shows unusual behavior, a contextual action appears: "Create alarm for this metric." The alarm is prospective instrumentation — it watches the interesting metric going forward and notifies you when it does something unusual again. Robot Uprising's probe suggestion is the game equivalent: "This element was unusual. Set up a watch for next match."

**Git blame → "Add watch" in IDE integrations**: In some IDEs, git blame annotations on a line include a quick-action to "watch this file for changes" or "add this function to code review coverage." The developer has been reading the history of who changed a line (retrospective), and the IDE offers an action to monitor future changes (prospective). Same temporal pattern as the probe suggestion.

**Slay the Spire's Weakness/Vulnerability status effects as "watch this"**: In Slay the Spire, the Weakness debuff (attacks deal 25% less damage) and Vulnerability buff (take 50% more damage) serve as diagnostic markers during combat: "this turn, the enemy is particularly vulnerable." The probe suggestion is a pre-match version of this: before the match starts, mark the element you want to observe closely, and the debrief will have heightened attention on it. The design lesson from StS: marking something for attention should be frictionless enough that players do it speculatively, not only when they're certain it matters.

**Incident postmortem "add monitoring" action items**: Every well-run incident postmortem ends with action items. The most common: "Add [X metric] to the monitoring dashboard." "Add alerting for [Y condition]." This is the real-world engineering pattern that probe hooks formalize. Players who go on to real engineering work will recognize "I noticed something interesting, I set up instrumentation to capture it next time it happens, I analyzed the captured data" as standard practice — because Robot Uprising made them do it repeatedly for 40 hours.

**Factorio's circuit network as diagnostic instrumentation**: In Factorio, the circuit network allows players to wire up condition detectors that read and output the state of machines — inserters, belts, assemblers — and trigger actions or display values on indicator lights. Experienced Factorio players build elaborate monitoring systems that visualize factory state in real-time. Robot Uprising's probe hooks are the spiritual equivalent: active instrumentation that reveals internal state. The Factorio lesson: once players understand the power of instrumentation, they want to instrument *everything* — design the probe system to handle players who add 6+ probes across a mission.

---

## Sensory Description

**The probe suggestion section in its default state:**

A thin horizontal section at the bottom of the pre-ranking drawer, separated from the three-signal explanation by a hairline amber rule — the same amber as the pivot-activity indicator above. The section has a barely-perceptible amber background tint (2% opacity amber over the drawer's off-white), signaling "this is action-oriented, not explanation-oriented."

The ⊕ icon is a circle with a plus sign in the center, rendered in amber. It sits left-aligned at the start of the CTA text. The text itself: "Add probe to RELAY-C — capture state next match." The typeface weight is slightly heavier than the explanation text above — more assertive, less academic. A single chevron (→) at the end of the line, the same as the "See in genealogy →" link from 4.66, creating consistent visual vocabulary for "this is an action that takes you somewhere."

**Clicking ⊕:**

A smooth transition: the amber ⊕ icon morphs into a teal ✓ icon over 200ms. The text changes to "Probe added — RELAY-C will be watched next match." The teal is the same teal used for EDT annotations and confirmed actions throughout the debrief vocabulary.

A soft sound: a single note at 660Hz — slightly higher than the 880Hz chime used for the genealogy link click (4.66). The higher pitch suggests "I set something up" rather than "I navigated somewhere." The note has a gentle reverb, fading over 400ms — it sounds like a small instrument being placed down, ready to be picked up next session.

The "✓ Probe added" state includes a small teal badge that persists on the drawer's collapsed state — a 6px teal dot in the corner of the drawer's chevron icon, indicating "a probe is active from this session." This badge remains until the probe has run (i.e., the player runs one more match with the probe active).

**The Probe Log track in the debrief:**

The Probe Log track is 24px tall, positioned below the main timeline. It has an amber background at 8% opacity — subtly warmer than the main timeline's neutral grey. The track label "PROBE LOG (RELAY-C)" is in all-caps amber text, 9px, left-aligned — the same small-caps style used for other timeline metadata labels.

Snapshot markers are 10px × 10px amber squares, slightly rounded. Their positions on the timeline correspond exactly to the tick numbers. On hover, each marker brightens and a tooltip appears: "RELAY-C @ tick 52 — click to view buffer snapshot." On click, the marker pulses outward (a brief scale from 1.0 to 1.6 and back) while the Probe Detail Panel opens.

**The Probe Detail Panel:**

A right-side panel, same dimensions and slide-in animation as the signal genealogy panel. The background is slightly darker than the main debrief — cool grey instead of warm off-white — signaling "this is a technical/mechanical view." The typeface inside is monospace: every line of buffer slot data is tabular-formatted, every signal ID in the same column width.

The buffer visualization inside the panel uses the familiar vertical thermometer language from elsewhere in the debrief (cool blue → amber → red based on fill level). But here, each slot is visible as a horizontal row — not just a fill percentage, but the individual content of each slot. Full slots have a dim amber background; empty slots have a dim grey background. The slot currently holding the "interesting signal" (the one the probe was targeting, inferred from the pre-ranking's signal of interest) has a bright amber outline — "this is the thing we were looking for."

The "OUTGOING SIGNALS THIS TICK: DROPPED" status appears in amber text with a small broken-arrow icon (→✗) — the same visual vocabulary as the signal genealogy's broken edge, creating a consistent "drop" symbol throughout the debrief's diagnostic vocabulary.

**The TikTok clip for this option:**

Player opens the pre-ranking drawer after a confusing loss. The drawer shows RELAY-C with volatility 0.81. At the bottom of the drawer, they click "⊕ Add probe to RELAY-C." Teal confirmation chime. They run the next match.

Debrief opens. Probe Log track appears. They click a marker at tick 52.

Probe Detail Panel slides in. 8/8 buffer slots — ALL FULL. Six of the slots are the same signal type: "redundant scan beacon (LOW priority)." In the lower-right corner of the screen, a small notification: "⚠ Unusual state — buffer contents differ significantly from average."

Player says out loud: "Wait — it's full of junk. It's completely full of low-priority junk and the important signal couldn't get in."

Cut. Title card: "Robot Uprising — build the architecture, watch it think."

---

## Discovered New Aspects

1. **4.107 — Probe budget as resource**: Paralleling the search budget mechanic (4.60), limiting the number of simultaneous active probes per session (early: 2, mid: 4, late: unlimited via research tree); encourages strategic probe placement decisions; teaches cost-of-observability tradeoff from real monitoring systems (not everything can be logged at high fidelity); interaction with 4.60 search budget.

2. **4.108 — Cross-match probe comparison view**: When a probe persists across 3 matches, the Probe Log shows a comparison mode — three columns, one per match, same tick range, same agent; differences between columns are highlighted (a slot that was full in 2/3 matches is amber-flagged; a slot that was empty in 1/3 matches is teal-flagged); teaches which behaviors are stable across scenarios vs. scenario-dependent; interaction with 2.28 scenario fingerprinting.

3. **4.109 — Probe suggestion from signal genealogy broken-edge view**: When the signal genealogy (4.16) shows a broken edge, the broken-edge sub-panel (4.105) surfaces a probe suggestion for the *receiving* agent: "STRIKER-A dropped signal S-08. Add a probe to STRIKER-A to capture its buffer state at next match →"; extends the probe suggestion pattern to a second diagnostic surface beyond the pre-ranking drawer; interaction with 4.105 and 4.66.

4. **4.110 — Automatic anomaly flagging in Probe Log**: When a probe snapshot contains buffer state that is statistically unusual compared to the same agent at the same tick across the last 5 matches, the snapshot marker in the Probe Log is highlighted with a "⚠" indicator; reduces the manual scanning burden for players who add high-frequency probes generating many snapshots; teaches the concept of "anomaly detection" as a workflow step.

5. **4.111 — Probe hook as adversarial information risk**: In Gauntlet, probe hooks are stripped before deployment — but the *decision of which elements to probe* is diagnostic metadata. If an opponent could see which elements a player had been probing before a match (e.g., via a leaked config that includes probe configuration comments), they would know which architectural areas the player considers uncertain. The adversarial information theory of probe choices — probing = revealing uncertainty = potential competitive intelligence leak; interaction with 4.54 adversarial exposure policy and 4.65 pre-ranking poisoning.
