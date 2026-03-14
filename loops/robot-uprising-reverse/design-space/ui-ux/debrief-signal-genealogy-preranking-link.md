# Signal Genealogy as Pre-ranking Source — Cross-Tool Linking

**Aspect:** 4.66 — Signal genealogy as pre-ranking source: link the pivot-tick activity signal in the pre-ranking directly to the signal genealogy graph (4.16); clicking "active at tick 52" in the drawer highlights the relevant genealogy node; unifies diagnostic tools into one vocabulary.

**Parent:** 4.58 — Pre-ranking transparency panel
**Siblings:** 4.67 — Probe hook suggestion from transparency panel; 4.68 — Cross-match coverage as season health metric
**Related:** 4.16 — Signal genealogy visualization; 4.15 — Probe hooks; 4.20 — Counterfactual simulation; 8.09 — Diagnostic layer as teaching arc; 4.25 — EDT trajectory career metric; 4.58 — Pre-ranking transparency panel

---

## The Core Concept

The pre-ranking transparency panel (4.58) tells the player *which* element was causally suspect and *why*: "RELAY-C was active at tick 52 — the pivot tick. RELAY-C was modified 2 sessions ago (recent change). RELAY-C produced 22 distinct states during the match (volatility: 0.81)."

The signal genealogy graph (4.16) shows the full network of signal propagation — which agents were sending, receiving, and routing signals across a given tick range. A network graph of nodes (agents) and edges (signal transmissions), with temporal markers showing when each transmission occurred.

**These two tools speak the same language but do not know each other exist.**

The pre-ranking drawer says "active at tick 52." The signal genealogy graph *shows* what "active at tick 52" means — the specific signals RELAY-C was sending and receiving, from whom, to whom, with what data, at that exact moment in the match. The pre-ranking gives you the *why*. The genealogy gives you the *what*. Neither is complete without the other.

**4.66 is the wire between them.**

When the drawer says "active at tick 52," that phrase is not static text. It is a live anchor. Clicking it:
1. Opens the signal genealogy panel if it isn't already open
2. Animates to the tick-52 frame of the genealogy
3. Highlights the RELAY-C node — its edges glow, its signal streams become visible
4. The player sees exactly what "active" means: RELAY-C received SCOUT-B's beacon at tick 51, processed it at tick 52, and sent a routing signal toward STRIKER-A — which was dropped because STRIKER-A's buffer was full at tick 53

The pivot tick annotation (EDT diamond on the timeline), the pre-ranking drawer explanation, and the signal genealogy visualization snap into alignment. Three separate diagnostic surfaces are now a single coherent diagnostic story.

---

## The Design Problem This Solves

### Problem 1: The "Active" Assertion Is Unverifiable

When the pre-ranking drawer says "RELAY-C was active at tick 52," the player cannot currently verify this claim from the drawer itself. They can:
- Trust it
- Go manually open the replay, find tick 52, and look for RELAY-C activity
- Go manually open the signal genealogy (if they know it exists), navigate to tick 52, find RELAY-C

None of these are good. Trusting a claim without verification builds false confidence in the heuristic. Manual navigation is slow and breaks the diagnostic flow. If the player doesn't know the signal genealogy panel exists, they can't navigate there at all.

The cross-tool link makes the assertion **immediately verifiable with one click**. The drawer makes a claim. The player clicks the claim. The claim is shown to be true (or shown to be misleading, which is just as valuable).

### Problem 2: Two Mental Models for One Reality

The pre-ranking drawer builds a mental model around *elements*: RELAY-C, SCOUT-B, STRIKER-A. Here is what each element was doing, scored and ranked.

The signal genealogy builds a mental model around *signals*: signal S-07 from SCOUT-B to RELAY-C at tick 51, signal S-08 from RELAY-C to STRIKER-A at tick 52 (dropped).

Both models describe the same match. Both models describe the same failure. But they are parallel vocabularies — the player has to hold both in their head and translate between them manually.

The cross-tool link makes the translation happen automatically. Clicking RELAY-C in the drawer highlights RELAY-C *as a node in the genealogy graph*. The player simultaneously sees the pre-ranking's element-centric view and the genealogy's signal-centric view. The two mental models merge into one richer model: "RELAY-C is the 4th element in the relay chain, received S-07, was active during the routing phase at tick 52, and the signal it tried to forward (S-08) was the one that was dropped."

### Problem 3: Discovery of Signal Genealogy Is Accidental

The signal genealogy is an expert tool. Players who don't discover it miss a significant diagnostic layer. In its current design (4.16), it lives as a separate panel in the debrief — players have to find it, click it, learn its interface, and understand what it shows.

The cross-tool link creates a **natural discovery pathway**: player opens the drawer (lower-friction, already established), reads the pivot-tick explanation, gets curious about "active at tick 52," clicks the link, and *lands inside the signal genealogy for the first time* — already oriented to a specific tick, a specific agent, a specific context. They don't discover the genealogy panel as an abstract visualization tool; they discover it as the answer to a specific question they were already asking.

First exposure to a complex tool becomes structured and purposeful rather than open-ended and overwhelming.

---

## The Full Design Space

### Option A: Inline Anchor Links — Text Is Live

**What happens:** In the pre-ranking drawer, every reference to a specific element, tick, or signal is a live link.

```
RELAY-C was active at [tick 52] — the pivot tick.
The match turned when [RELAY-C]'s signal didn't reach [STRIKER-A].
This element is a likely root-cause candidate.

RELAY-C was modified [2 sessions ago] (most recent config change).

RELAY-C produced [18 distinct states] during the match (volatility: 0.71/1.0).
```

Square-bracket items are clickable anchors. Each opens a specific view:
- `[tick 52]` → signal genealogy, tick 52, RELAY-C highlighted
- `[RELAY-C]` → signal genealogy, full run, RELAY-C's node and all its edges
- `[STRIKER-A]` → signal genealogy, tick 52-55 range, showing the dropped signal path
- `[2 sessions ago]` → config history panel, showing the RELAY-C change from 2 sessions ago
- `[18 distinct states]` → a state-change heatmap for RELAY-C across the full match timeline

**Strengths:**
- Dense with affordances — every specific claim is verifiable
- Mimics hypertext (the web) — a deeply familiar interaction pattern
- Encourages exploration: players who are curious can follow the chain of links outward

**Weaknesses:**
- Text with many inline links can feel cluttered — the drawer starts looking like a Wikipedia article
- Players who don't know what the links do may feel anxiety about clicking (will this change something?)
- Some links (config history, state heatmap) open very different panels from the genealogy — context switching multiple times in one exploration is disorienting

**Visual treatment:** Anchor links use the established teal hyperlink color (consistent with tick-52 link in the transparency panel 4.58 design). Underline on hover only, not always — keeps the drawer readable as prose.

---

### Option B: Focus Command — One Action Opens Genealogy in Context

**What happens:** Instead of multiple inline links, a single "Explain in genealogy →" button appears at the bottom of each signal-contributing explanation block in the drawer.

```
RELAY-C was active at tick 52 — the pivot tick.
The match turned when RELAY-C's signal didn't reach STRIKER-A.

                [See RELAY-C at tick 52 in signal genealogy →]
```

Clicking this button:
1. Expands the signal genealogy panel (slides in from the right if collapsed)
2. Scrolls to tick 52 in the genealogy timeline
3. Highlights RELAY-C with a warm amber ring — same visual language as the pre-ranking drawer's "active at tick 52" highlight
4. The three edges connecting to RELAY-C glow: one incoming (SCOUT-B → RELAY-C), one outgoing-dropped (RELAY-C → STRIKER-A, rendered with a severed-edge visual), and one context-background (RELAY-C's buffer fill at tick 52, shown as a fill-level overlay on the node)
5. The drawer stays open — split-view, drawer on left, genealogy on right

**Strengths:**
- Single, clear action point — no link anxiety, no cluttered text
- The "See in genealogy" framing makes the relationship explicit: the drawer is the *what*, the genealogy is the *why it matters in the network*
- Consistent with the pattern of "see tick 52 in replay" links (4.58 established this pattern; this is the same pattern for a different target panel)

**Weaknesses:**
- One button per explanation block means multiple buttons if the drawer has three explanation blocks — visual noise
- Players who use the button never learn to click directly on the element names themselves (misses a teaching moment about the link between element-centric and signal-centric views)

**Mitigation:** Use Option A's inline anchor for element names (RELAY-C, STRIKER-A) and Option B's dedicated button for the tick reference. Element clicks → genealogy focused on that element across the full match. Tick-reference button → genealogy focused on that specific tick window.

---

### Option C: Synchronized Highlight — Passive Coupling

**What happens:** The pre-ranking drawer and the signal genealogy panel are always synchronized when both are open. When the player opens the drawer, if the genealogy panel is already visible, RELAY-C's node pulses gently in the genealogy — no click required. As the player reads down the drawer, the genealogy updates:

- Reading the pivot-tick explanation → genealogy highlights tick 52 range with a soft amber glow across the timeline
- Reading the recency explanation → genealogy dims the genealogy and shows a "config version overlay" — an amber tint on RELAY-C's node indicating "this node changed 2 sessions ago"
- Reading the volatility explanation → genealogy activates a volatility heatmap mode — RELAY-C's node pulses at a rhythm corresponding to its 18 distinct states, while lower-volatility nodes appear static

The player doesn't click anything. The two panels narrate the same story simultaneously — one in text, one in graph. As the player reads the drawer, the genealogy illustrates each point in real-time.

**Strengths:**
- Zero friction — the player reads and the visualization responds; no decision about whether to click
- Creates the feeling that both tools are one tool with two representations of the same data
- Teaches the vocabulary implicitly: player reads "RELAY-C produced 18 distinct states" while watching RELAY-C's node pulse 18 times in the genealogy — the phrase becomes meaningful without a definition

**Weaknesses:**
- Requires the genealogy panel to be open — if it's collapsed, nothing happens; the passive coupling is invisible
- The synchronized updates might be distracting — if the genealogy is updating as the player is reading, their attention is split
- Passive coupling is hard to discover: players who don't notice the correlation between reading and genealogy updates learn nothing about the intentional link

**Mitigation:** Passive coupling activates only when the player pauses on a text section for 1+ seconds (dwell-time trigger). This prevents rapid scrollers from triggering constant genealogy updates while rewarding careful readers with a live illustration of what they're reading.

---

### Option D: The "Explain This Path" Overlay — Genealogy Inside the Drawer

**What happens:** Instead of linking *to* the genealogy panel, the drawer embeds a **miniature genealogy view** directly inside the drawer's explanation section.

When the drawer shows "RELAY-C was active at tick 52," a compact inline graph appears below the text:

```
        tick 51        tick 52         tick 53
SCOUT-B ──────────→ RELAY-C ──✗──────→ STRIKER-A
         [S-07: beacon]  [S-08: route] [dropped: buffer full]
```

This is not the full genealogy — it's a single-path slice: the specific signal chain that makes RELAY-C causally relevant at tick 52. Three nodes, two edges, three ticks. Compact enough to fit inside the drawer without a separate panel.

The "✗" on the S-08 edge is the critical visual: it marks where the signal chain breaks. The pre-ranking surfaced RELAY-C because RELAY-C was *active*, but the break happened *downstream* from RELAY-C. The inline graph makes this immediately visible.

**Strengths:**
- No second panel required — the diagnostic information lives entirely within the drawer
- The path slice is easier to read than the full genealogy: three nodes vs. a potentially complex multi-node graph
- The "✗" on the dropped edge is the single most diagnostic visual in the entire debrief — it shows in one icon where the failure occurred
- Players who never open the genealogy panel still see the signal chain context

**Weaknesses:**
- Single-path slice may miss important context: what if RELAY-C had three incoming signals at tick 52, and the pre-ranking is only showing one of them? The slice could be misleading.
- Embedding a graph inside a text panel creates a mixed-mode UI that may feel cluttered
- The path slice is generated based on the pre-ranking heuristic's view of which path matters — if the heuristic is wrong about the path, the slice is wrong

**Recommended Hybrid: Option D inline path + Option B "full genealogy" link**

The inline path slice gives immediate visual context (the path, the break) without requiring the player to navigate anywhere. The "See full signal genealogy →" link at the bottom of the path slice provides an exit ramp to the full visualization for players who want to explore beyond the ranked candidate's path.

```
RELAY-C was active at tick 52 — the pivot tick.

      tick 51        tick 52         tick 53
 SCOUT-B ───→ RELAY-C ──✗──→ STRIKER-A
              [S-07]  [S-08]  [buffer full]

The signal chain broke at STRIKER-A (buffer full at tick 53).
RELAY-C was the last active node before the break.

[See full signal genealogy →]
```

---

## Player Journeys

### Journey: Tomás, 34, Backend Engineer, Session 18

**Context:** Mission 9 — "Cascading Silence." Tomás has been using the pre-ranking drawer for 4 sessions. He's comfortable with the vocabulary (pivot tick, recency, volatility) but hasn't encountered the signal genealogy panel yet. He failed 3 consecutive runs and is confident the QUICK result is wrong, but can't figure out why.

**Minute 0:00 — The Familiar Drawer, A New Link**

Tomás opens the debrief. Runs QUICK mode. The Fix Explorer surfaces:

> **FIRST VIABLE FIX: RELAY-C — context buffer +1 slot** *(rank score: 0.84)*

He opens the drawer:

> "RELAY-C was active at **[tick 52]** — the pivot tick."

He's seen this text before. Usually he'd look at it briefly and apply the fix. But he's applied this fix twice and it didn't help. He's going to look at tick 52.

He hovers over "[tick 52]" — the text brightens slightly, a teal underline appears. He clicks.

**Minute 0:30 — First Contact with the Genealogy**

The right side of the debrief screen — previously showing the pass-rate chart — transitions. A panel slides in, animated: a network graph, cool grey background, nodes as small hexagons labeled with agent names. The genealogy panel.

He hasn't seen this before. He takes a moment to orient.

The graph has already navigated to tick 52. RELAY-C's node glows amber — a warm, pulsing ring — while other nodes are dim. Three edges connect to RELAY-C: two incoming (SCOUT-B and SENSOR-D, both dim grey, labeled with tick numbers), one outgoing (toward STRIKER-A, shown as a broken line with a red ✗ marker).

There's a timestamp at the top of the panel: **Tick 52 of 71**. A thin timeline scrubber at the bottom of the panel.

**Minute 1:00 — Reading the Network**

Tomás moves his mouse over the ✗ on the RELAY-C → STRIKER-A edge. A tooltip:

> **Signal S-08 dropped at STRIKER-A (tick 53)**
> Cause: STRIKER-A context buffer full (8/8 slots occupied)
> Signal content: routing directive from RELAY-C
> Dropped signals this match: 3 total (2 at STRIKER-A, 1 at RELAY-C)

He stares at this. STRIKER-A's buffer was full. RELAY-C sent the signal. RELAY-C isn't the problem — STRIKER-A's buffer is.

He moves his mouse to STRIKER-A's node. It highlights. He right-clicks: "View in Fix Explorer as primary candidate."

A new entry appears in the Fix Explorer results list, now reordered with STRIKER-A at the top:

> **MINIMUM FIX: STRIKER-A — context buffer +1 slot** *(pass rate improvement: +17)*

**Minute 2:00 — The Realization**

Tomás reads the pre-ranking drawer for STRIKER-A now (the drawer updates to reflect the newly focused candidate):

> STRIKER-A was NOT active at tick 52 — the pivot tick.
> STRIKER-A's buffer was full, causing signal S-08 to be dropped.
> **Low pre-ranking score: 0.31** — STRIKER-A was inactive at tick 52.

The pre-ranking heuristic scored STRIKER-A low *because* it was inactive at tick 52. But inactive *because its buffer was full* is not the same as inactive *because it wasn't involved*. The heuristic can't distinguish between "not present" and "present but silent because overwhelmed."

This is the core insight. RELAY-C was active because it was *doing the work*. STRIKER-A was silent because it was *blocked*. The pre-ranking reads silence as "not involved." But full-buffer silence is the most involved you can be — it's the failure mode.

**Minute 3:00 — The Fix and the Note**

He applies STRIKER-A — context buffer +1 slot. Pass rate: 81/100.

In the session notes panel, he types: "signal genealogy exposes what pre-ranking can't see: buffer-full silence = failure, not absence. QUICK finds the sender. Genealogy finds the receiver. Always check downstream from the ranked candidate."

**What Tomás wants to do next:** He wants to know how many of his past failed diagnoses had the same pattern — pre-ranking surfaced the sender, but the real failure was the full-buffer receiver. He suspects it's happened before.

**UI Annotations:**
- `[tick 52]` link in drawer: teal underline on hover, 150ms delay; clicking triggers genealogy panel slide-in from right, 250ms ease-out
- Genealogy panel: 480px wide when open, takes right half of debrief; the fix explorer and drawer remain on left half
- RELAY-C amber ring in genealogy: 600ms pulse, 3 pulses, then holds steady glow while the node is the focus candidate
- Broken edge (✗ marker): the RELAY-C → STRIKER-A edge is rendered as a dashed line (not solid) with a small red circle containing ×; the dashed rendering distinguishes dropped signals from all successful transmissions
- Tooltip on ✗: appears after 300ms hover; four-line tooltip with signal ID, cause, content snippet, total dropped-signal count for the match
- Right-click context menu on STRIKER-A: "View in Fix Explorer as primary candidate" is the first item; triggers Fix Explorer re-sort with STRIKER-A moved to #1 position; the pre-ranking drawer updates to show STRIKER-A's (low) rank score and why it was ranked low

---

### Journey: Priya, 16, High School Student, First Three Hours

**Context:** Mission 4 — "The Silent Network." Priya has been playing casually. She's used the Fix Explorer twice and applied two fixes without really understanding why they worked. She just finished a replay and noticed the debrief has a lot of panels she hasn't clicked. She's curious.

**Minute 0:00 — Exploration Mode**

Priya runs QUICK analysis. Result:

> **FIRST VIABLE FIX: SCOUT-B — attention filter, increase range +1**

She opens the "why is this ranked first?" drawer. She reads it.

"SCOUT-B was active at [tick 34]."

She hovers over "[tick 34]." The text lights up. She clicks.

A panel appears on the right side of the screen. It's new — she's never seen it. A network graph with little hexagons connected by arrows.

**Minute 0:30 — "Oh, This Is What's Happening"**

The panel shows SCOUT-B's node glowing, with two arrows: one from SCOUT-B to RELAY-A, one from SCOUT-B to RELAY-B. Both arrows are bright and animated — little pulses of light moving along the arrows from SCOUT-B outward.

She moves the mouse over the arrows. One is labeled "S-04: beacon signal (priority: high)." The other is "S-05: beacon signal (priority: high)."

She's watching the signals travel. This is what her agents are actually doing — sending messages to each other. She didn't think about this before. She thought of them as individual units. But they're talking.

**Minute 1:30 — The Discovery of the Dropped Signal**

She scrubs the timeline in the genealogy panel. At tick 36, she sees a broken edge appear: RELAY-A → STRIKER-C, with a ✗. She hovers: "Signal dropped — STRIKER-C buffer full."

She didn't know buffers could fill up. She opens STRIKER-C's portrait by clicking the node. A sidebar shows: "Context buffer: 8/8 slots (full). Oldest signal evicted to make room: S-02 (tick 29)."

Something about this clicks — these agents have limited memory. Like RAM. When the buffer fills up, they drop signals. Her agents are dropping important information because she didn't think about memory capacity.

She doesn't apply the pre-ranking fix. Instead, she goes to the workbench, finds STRIKER-C, and increases its buffer size. Runs the mission. Pass rate improves from 41 to 67.

**Minute 3:00 — What She Learned**

Priya didn't come into this session with a diagnostic question. She was just exploring. But the link from the pre-ranking drawer to the genealogy panel introduced her to two concepts simultaneously: (1) signals travel between agents in a network, and (2) buffers have limited capacity and can fill up.

She discovered these things by following her own curiosity from one tool to the next. The cross-tool link was the doorway.

**What Priya wants to do next:** She wants to look at the signal genealogy for all her missions now. She's curious whether dropped signals are a pattern across all her failures or just this one.

**UI Annotations:**
- The animated signals in genealogy: small circular pulses, 40px diameter, moving along edge path at constant speed; pulse color matches agent portrait color (SCOUT-B is blue, so S-04 pulses are blue); new pulses appear every 800ms while the replay is paused at a given tick
- Paused genealogy: when the debrief timeline is paused (not scrubbing), the genealogy shows a "snapshot" view with static arrows and a subtle ambient animation (light pulses every 3 seconds) to indicate it's live data, not a static screenshot
- STRIKER-C node click → sidebar: appears as a 200px-wide overlay on the left side of the genealogy panel (not the main debrief left panel); shows the buffer-fill percentage, eviction history, and a list of signals currently in the buffer at the focused tick
- Buffer fill meter: a vertical bar next to the node, fill color shifts from cool blue (under 50%) to amber (75%+) to red (full); at full capacity, the bar pulses red at 1-second intervals

---

### Journey: Kwame, 26, Game Designer, Evaluating Robot Uprising, 45 minutes in

**Context:** Kwame is a game designer at a small studio considering building something similar. He's playing Robot Uprising for the first time to evaluate its design. He's not interested in winning — he's interested in how the debrief works as a teaching system.

**Minute 0:00 — The Diagnostic Stack**

Kwame reads the pre-ranking drawer carefully. He notices the "[tick 52]" link. He doesn't click it immediately — instead he looks at the whole debrief screen. He counts the diagnostic surfaces:
- The timeline scrubber
- The EDT diamond annotation
- The Fix Explorer result list
- The pre-ranking transparency drawer
- The link in the drawer (which he suspects leads somewhere)

He's noticing the architecture. This is a diagnostic stack — multiple layers of explainability, each triggered by the previous one. The timeline shows *when*. The EDT annotation shows *what moment mattered*. The Fix Explorer shows *what to change*. The drawer shows *why that change was surfaced*. The drawer's link presumably shows *how the causal chain works in the agent network*.

He clicks "[tick 52]."

**Minute 1:00 — The Genealogy as the Bottom Layer**

The genealogy panel opens. He reads it as a game designer: this is a network graph with temporal replay — essentially a message-passing trace log. Comparable to a distributed systems trace view (Jaeger, Zipkin, OpenTelemetry). The agents are services, the signals are HTTP requests, the dropped signals are failed calls, the buffer-full error is a 429 or connection timeout.

He's impressed. This is not a toy version of systems debugging — this is an actual systems debugging artifact. The signal genealogy is the kind of visualization you'd build for a real distributed system.

**Minute 2:00 — The Cross-Tool Link As Design Pattern**

He opens a note in Obsidian: "Robot Uprising diagnostic stack design pattern."

He writes: "The key insight is that each diagnostic tool in the debrief is the *explanation* for the tool above it. The EDT tells you *when*. The pre-ranking drawer explains *why that element*. The genealogy explains *how that element was involved in the network*. Each tool is the answer to the question the previous tool raises. The cross-tool link makes this explicit: you don't have to know the genealogy exists; the drawer tells you to look at it. Navigation is guided by curiosity, not by UI discovery."

He continues: "The design implication: this pattern of 'explanation-as-navigation' could work for any complex debugging UI. The explanation for each decision is itself a doorway into the deeper system. The user is never asked to navigate the full complexity at once — they follow the chain of 'why' from each answer to the next question."

**Minute 3:30 — The Educational Vocabulary Unification**

Kwame notices that in both the drawer and the genealogy, the phrase "tick 52" refers to the same moment. The element name "RELAY-C" refers to the same agent. The signal ID "S-08" appears in the genealogy's edge tooltip and (he checks) in the signal genealogy's animation.

Everything is consistently named. There's no translation required between the two tools. This is vocabulary unification — the most underrated thing in complex tool design. When every tool in a system uses the same names for the same things, the cognitive load of context-switching between tools approaches zero.

He writes: "Vocabulary unification is the secret to the cross-tool link working. If the drawer said 'agent relay-03' and the genealogy said 'Node R-C (relay type)', the link would create confusion rather than clarity. Consistent naming is a prerequisite for cross-tool navigation to feel natural."

**What Kwame wants to do next:** He wants to understand the full diagnostic vocabulary: every term used in any debrief tool, and how they map to real distributed systems concepts. He suspects this vocabulary was deliberately designed to be 1:1 with real engineering terminology, and he wants to write a blog post about it.

**UI Annotations:**
- Kwame's experience reveals a design requirement: the genealogy panel's vocabulary must be exactly consistent with the drawer's vocabulary. Signal IDs, element names, tick numbers, and error descriptions must be identical string values, not paraphrases. This is a data-layer requirement (the genealogy and the drawer must be rendering from the same data model, not separate models with cross-referenced IDs).
- Obsidian integration note: no in-game integration needed; Kwame's use of Obsidian to take notes while playing is a real player behavior — the debrief should be designed with the assumption that some players will have a second screen open for notes, and that the vocabulary and diagram format should be "copy-friendly" (the genealogy node labels should be copyable text, not canvas-drawn bitmap text).

---

## Strengths

**The "explanation-as-navigation" pattern:** Each diagnostic tool is simultaneously the answer to a previous question and the doorway to the next. The pre-ranking drawer answers "why was this ranked first?" — and surfaces the question "but what was it actually doing at tick 52?" — which the genealogy link then answers. The player is always following their curiosity, never navigating blind.

**Vocabulary unification at the data layer:** When the player sees "RELAY-C active at tick 52" in the drawer and then sees RELAY-C's node highlighted in the genealogy at tick 52, the connection is immediate and zero-friction. No translation. No disambiguation. The two tools are windows onto the same data model, and the consistent naming makes that obvious.

**Structured first exposure to the genealogy:** The genealogy panel is complex. A player stumbling on it without context — "what is this graph? why are there broken edges? what do the signal IDs mean?" — could feel lost. Discovery via the pre-ranking drawer link gives the player their first genealogy session with:
  - A specific agent to look for (RELAY-C, highlighted)
  - A specific tick to be at (tick 52, pre-navigated)
  - A specific question to answer ("what was RELAY-C doing here?")

This is guided discovery — the opposite of "here's a complex tool, figure it out."

**Reveals the pre-ranking's epistemic limits:** The most valuable thing the link teaches is what the pre-ranking *can't* see. The pre-ranking surfaced RELAY-C because RELAY-C was active. The genealogy shows STRIKER-A's full buffer as the actual failure. The pre-ranking read RELAY-C's activity as causal; the genealogy reveals STRIKER-A's silence as causal. Two tools, different conclusions. The player must now evaluate both and develop their own judgment. This is the highest-quality diagnostic teaching moment in the debrief.

---

## Weaknesses

**Requires the genealogy panel to be navigable to a specific tick:** This assumes the genealogy is a temporal visualization (tick-by-tick replay) and not just a summary graph. If the genealogy panel only shows aggregate signal flow across the full match, the "navigate to tick 52" operation doesn't exist. This is a design dependency: 4.66 constrains 4.16's implementation toward temporally-navigable visualization.

**"Active" is underspecified as a link target:** When the drawer says "RELAY-C was active at tick 52," it could mean:
  - RELAY-C was *sending* a signal at tick 52
  - RELAY-C was *receiving* a signal at tick 52
  - RELAY-C was *processing* (running its rules/hooks) at tick 52
  - RELAY-C's buffer was *changing state* at tick 52

Each of these "active" meanings corresponds to a different part of the genealogy graph. The link needs to navigate to the right part, which requires the data model to distinguish between these activity types. A naive implementation that just highlights the RELAY-C node at tick 52 may be insufficient if the genealogy can show sub-agent-level activity.

**Information density during discovery:** A new player's first encounter with the genealogy is already cognitively loaded (new visualization type, new vocabulary, new interaction model). Arriving via the pre-ranking link means the player is simultaneously learning the genealogy's interface *and* trying to answer a specific diagnostic question. These two goals may conflict — the player may learn neither well if they're trying to do both at once.

**Mitigation for information density:** On first arrival, the genealogy panel shows only the immediately relevant neighborhood — the three nodes in RELAY-C's direct signal path, not the full agent graph. "Expand to full genealogy" button at the bottom reveals the rest. Scoping the first view to the relevant nodes reduces the initial information load.

---

## Interaction Effects

**With 4.16 (Signal genealogy visualization):**
This is the primary interaction — 4.66 is literally a UI integration point between 4.58 and 4.16. Whatever interaction model 4.16 uses for its timeline (scrubber, tick selector, animation controls), that model must support external navigation (a link saying "go to tick 52 and highlight node X"). This requires the genealogy panel to be programmatically navigable, not just user-navigable.

**With 4.58 (Pre-ranking transparency panel):**
The cross-tool link is an extension of 4.58's existing timestamp link ("see tick 52 in replay") pattern. 4.58 established that clicking a tick reference in the drawer opens the replay at that tick. 4.66 adds a second link target type: clicking a tick reference in the drawer that references a specific element opens the genealogy focused on that element at that tick. The two link types live in parallel; the replay link shows the battle; the genealogy link shows the signal network.

**With 4.15 (Probe hooks):**
When the genealogy shows a broken edge (dropped signal), it surfaces a question: "what was in STRIKER-A's buffer that was taking up all 8 slots?" Probe hooks on STRIKER-A would capture that state. The genealogy's broken-edge view should (optionally) surface a "probe hook suggestion" similar to 4.67: "STRIKER-A had a full buffer at tick 52–55. Add a probe hook to STRIKER-A to capture buffer state in the next match →"

**With 4.67 (Probe hook suggestion from transparency panel):**
Both 4.66 and 4.67 are "active diagnostic step" affordances: 4.66 says "click here to see the signal network context"; 4.67 says "click here to set up a probe hook for the next match." They are complementary follow-on actions from the same pre-ranking drawer explanation. The drawer's explanation block should show both affordances together: "See in genealogy →" for retrospective understanding; "Add probe hook →" for prospective diagnosis.

**With 4.39 (Adversarial counterfactual mode):**
The signal genealogy, when focused on the pivot-tick activity, can be shown in "counterfactual genealogy" mode — what would the signal network have looked like if the pre-ranking's proposed fix (RELAY-C +1 buffer slot) had been applied? The counterfactual genealogy shows the same tick range, same agents, but with the modified agent highlighted and the signal chains it would have altered. If the fix doesn't change the dropped edge (STRIKER-A was still going to fill up), the counterfactual genealogy makes this visible immediately — the fix doesn't help, even though the pre-ranking ranked it highly.

**With 4.22 (Act 2 tool introduction sequence):**
The signal genealogy is introduced as part of the debrief's Act 2 materialization sequence. If the cross-tool link from the pre-ranking drawer is the primary discovery pathway for the genealogy, then the Act 2 materialization sequence can de-emphasize or defer the genealogy panel's explicit introduction — the player will find it naturally via the drawer link. The materialization sequence doesn't need to announce the genealogy; it just needs to make the genealogy panel *available to navigate to* from the drawer link.

**With 8.09 (Diagnostic layer as teaching arc):**
The cross-tool link is step 4.5 in the diagnostic teaching arc: (1) passive replay → (2) EDT annotation → (3) Fix Explorer → (4) pre-ranking drawer → **(4.66) signal genealogy via drawer link** → (5) building personal diagnostic priors. The link makes the genealogy a step in the teaching arc rather than a separate expert tool. Every player who reaches step 4 (opens the drawer) is naturally guided to step 4.5 by the link's existence.

---

## Comparable Games and Media

**OpenTelemetry / Jaeger distributed trace views**: A direct technical analogue. Distributed systems tracing tools show service calls as a directed graph — each node is a service, each edge is an API call or message, failed calls are highlighted red, retries appear as parallel edges. The signal genealogy is Robot Uprising's version of this. The cross-tool link is the equivalent of a "view trace" button on an error alert: clicking from the alert (pre-ranking drawer) navigates directly to the relevant trace (genealogy) pre-filtered to the relevant time range and service.

**Chrome DevTools Network Panel → Request Inspector**: When you click a failed network request in the Network panel, the request inspector opens on the right showing headers, timing, response, and error details. The "why is this failing?" view leads directly to the "what happened at the network layer?" view. Robot Uprising's drawer-to-genealogy link is this pattern: the ranking explanation opens the signal-level network view.

**Splunk / Kibana log correlation**: In production monitoring, clicking on a log alert often deep-links to a pre-filtered log view showing the surrounding context — the correlated events before and after the alert. The pre-ranking drawer's "tick 52" link should feel like this: clicking the alert anchor opens the relevant log view (genealogy) already filtered to the relevant context.

**Into the Breach — simultaneous prediction display**: Into the Breach shows the outcome of all possible enemy actions simultaneously as colored overlays on the grid. The player doesn't need to mentally simulate "what would happen if X moved to Y" — they can see it. The signal genealogy's temporal replay does the same thing for signal propagation: instead of mentally simulating "what signals were passing when the match turned?", the player can *see* it in the genealogy. The cross-tool link makes this visual directly accessible from the "why?" question in the drawer.

**Wikipedia inline citation links**: Reading a Wikipedia article, every cited claim is a superscript link to the source. The reader can keep reading (ignoring the citation) or click to verify the source. Robot Uprising's `[tick 52]` link is the same pattern: the drawer makes a claim ("active at tick 52"), the link is the citation, the genealogy is the source. Readers who trust the claim keep reading; curious readers click through to verify. The citation-link pattern is the most natural "explainability affordance" in existence — everyone who has read Wikipedia understands it.

**Hearthstone's "Learn More" card mechanic explanations**: Hearthstone (and similar card games) allows players to click on complex card text to see simplified explanations of mechanics. The cross-tool link is this for the pre-ranking: the drawer's explanation is the card text, the genealogy is the "Learn More" overlay. Players who understand the explanation keep moving; players who want to go deeper click through.

---

## Sensory Description

**The pre-ranking drawer with the cross-tool links active:**

The drawer looks almost identical to its 4.58 design — monochrome text, amber/teal/violet signal indicators, the three contributing-factor rows. The difference is subtle and deliberate: specific phrases are now underlined with a very faint, hair-thin teal line. Not hyperlink-blue — not the same color as external web links — but the same teal used for EDT annotations throughout the debrief. The underline says "this is navigationally meaningful in the debrief vocabulary," not "this is a web link."

On hover, the underline brightens slightly and thickens from 0.5px to 1.5px. A small right-arrow icon (↗) appears inline after the linked text, the same size as the surrounding characters. The cursor changes to a pointer. There is no tooltip on hover — the link target is inferred from context ("tick 52" clearly goes somewhere tick-52-related; "RELAY-C" clearly goes somewhere RELAY-C-related).

**The click:**

A brief, light animation: the linked text pulses once with a subtle amber wash (100ms ease-in-out, then fades). A sound: a single, clean chime — one note at approximately 880Hz, 80ms duration, immediate fade. The sound is soft enough not to be startling but present enough to confirm the click registered. The same sound used for the EDT diamond's timestamp link click — consistent sound vocabulary for "navigating to a specific moment in the match."

**The genealogy panel slide-in:**

The genealogy panel slides in from the right edge of the screen. 250ms, ease-out cubic. The backdrop of the debrief dims slightly (0% → 15% opacity overlay on the left side) to draw attention to the new panel. The panel itself has a slightly cooler background tone than the debrief — the debrief uses warm off-white; the genealogy uses cool grey, signaling "this is a technical/analytical view, not a narrative view."

The genealogy's nodes are small hexagons (not circles, not squares — hexagons because they tile the space more efficiently for dense agent networks). Lines between nodes are thin, directional arrows. The focused node (RELAY-C) pulses with a warm amber ring — a visual echo of the amber indicators in the pre-ranking drawer, creating a visual throughline between the two panels.

**The broken edge:**

The dropped signal edge is rendered as a dashed line (60px solid, 10px gap, repeating) rather than a solid arrow. The ✗ marker at the end of the dashed line is a small circle (16px diameter) with an × inside, filled red, placed at the position where the signal was expected to arrive. The overall visual impression is of a signal that "dissolves" before arriving — the dashes suggest transmission in progress, the ✗ suggests the arrival point where it should have appeared but didn't.

**The synchronized vocabulary:**

Both the pre-ranking drawer and the genealogy panel display RELAY-C's name in the same typeface, same weight, same color. When RELAY-C is highlighted in the genealogy, the text "RELAY-C" in the drawer is simultaneously italicized — a subtle typographic echo that says "what you're seeing in the graph is what we were talking about in the text." The connection is felt, not announced.

**The moment of insight:**

When the player first sees the broken edge on the genealogy (RELAY-C → STRIKER-A ✗) after being told by the drawer that RELAY-C was ranked #1, there is a designed moment of dissonance: "the pre-ranking said RELAY-C. The genealogy shows the signal breaking at STRIKER-A. These are different things."

This dissonance is the teaching moment. The game does not resolve it for the player. There is no pop-up saying "actually, the real problem is STRIKER-A." The player has to connect the dots: the pre-ranking found the sender; the genealogy shows the receiver is where the signal died. The insight is earned, not given.

The animation that plays at this moment is subtle: a slight pulse-wave moves along the broken edge, from RELAY-C toward the ✗, stopping and fading. It looks like an electrical signal traveling and then dissipating. It plays once, on first view, then stops. Players who catch it understand immediately. Players who miss it see only the static dashed line. Both experiences are valid — the wave is a reward for attention, not a required tutorial.

---

## Discovered New Aspects

1. **4.102 — Genealogy "neighborhood expansion" on first arrival**: When a player navigates to the genealogy via the drawer link for the first time, the panel shows only the immediately relevant signal path (3 nodes, 2 edges), not the full graph; "Expand to full genealogy" button reveals remaining agents; prevents information overload during discovery; subsequent visits default to full graph; interaction with 4.22 Act 2 tool introduction.

2. **4.103 — Counterfactual genealogy overlay**: Applying the pre-ranking fix as a counterfactual overlay on the genealogy — showing the proposed-fix graph in a different color alongside the actual graph; if the fix changes the signal routing, the differences are highlighted; if the fix doesn't change the broken edge, the genealogy makes this visible immediately; interaction with 4.39 adversarial counterfactual mode and 4.20 counterfactual simulation.

3. **4.104 — Signal vocabulary consistency audit**: A design-layer requirement: the genealogy panel and the pre-ranking drawer must use exactly identical string identifiers for agents, signals, and ticks; any naming divergence (e.g., "RELAY-C" in the drawer vs. "relay-c" in the genealogy tooltip) breaks the vocabulary unification and creates confusion; this is a data-model requirement, not a UI requirement; interaction with 8.08 real-language vocabulary claim.

4. **4.105 — "Why was this signal dropped?" sub-panel**: When the player hovers over a broken edge in the genealogy, the tooltip shows the cause (buffer full, priority eviction, hook interrupt); clicking the tooltip opens a sub-panel in the genealogy panel showing the receiving agent's buffer state at that tick — all 8 slots, their contents, and which slot would have been used by the dropped signal; the most granular diagnostic view in the game; interaction with 4.16 buffer state visualization and 4.15 probe hooks.

5. **4.106 — Signal genealogy as pre-ranking source for enemy agents**: Extending the cross-tool link to work for enemy agent configs — when the debrief's adversarial view (4.39) identifies a high-pivot-activity enemy element, clicking it opens the genealogy showing the enemy signal network at that tick; teaches that the pre-ranking heuristic applies symmetrically to both player and enemy architectures; interaction with 4.39 adversarial counterfactual and 4.65 pre-ranking adversarial surface.
