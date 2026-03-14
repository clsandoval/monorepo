# Counterfactual Simulation as Advanced Debrief Feature

**Aspect:** 4.20 — A "what if" mode in the debrief that lets the player change a single agent decision at the identified pivot tick and re-simulate the match forward; the "minimum fix explorer" showing how small a change was needed to flip the outcome

**Parent:** 4.04b — Two-Act Debrief Structure; 4.18 — Effective Outcome Timestamp
**Siblings:** 4.27 — Pivot Accuracy as Displayed Stat; 4.04a — Debrief as Debugger; 4.16 — Signal Genealogy Visualization
**Related:** 1.06c-ext-A-ii — False Pivot Anti-Pattern; 2.00a — Fully Deterministic Execution; 8.08 — Real-Language Vocabulary Claim; 8.09 — Diagnostic Layer as Teaching Mechanic

---

## The Core Concept

Every debrief in Robot Uprising ends at the same question: **"What should I change?"**

The EDT (4.18) tells the player *when* the outcome was decided. The signal genealogy (4.16) tells the player *which agents* were involved. The FPG bracket (4.26) tells the player *whether* the most dramatic moment was the real cause. But none of these tools answer the one question that actually unblocks iteration:

**"Would this one small fix have been enough?"**

Counterfactual simulation is the answer. After Act 2 completes, an advanced mode unlocks: the player can **fork the match at any tick** (typically the EDT), apply a single targeted change to their configuration, and **re-simulate the match forward** from that state. The game runs the forked simulation deterministically — same opponents, same initial positions, same random seed — and shows the divergent outcome in parallel with the original.

The **Minimum Fix Explorer** is the apex feature: the game automatically searches the space of single-element changes (one rule adjustment, one hook reroute, one buffer size increment) and reports the *smallest possible change* that would have flipped the outcome. Not a redesign. One tweak.

This is the game making the player a precision surgeon rather than a butcher. It teaches that most failures are not systemic — they're a single load-bearing assumption that broke.

---

## The Three Sub-Features

### Sub-Feature 1: Manual Fork Mode

The player scrubs the debrief timeline to any tick, clicks **"Fork here"**, makes a single change in a lightweight edit panel, and clicks **"Simulate forward."** The re-simulation runs in 1–3 seconds (deterministic tick scheduler means this is fast), then loads a comparison view.

This is the core feature. The Minimum Fix Explorer (below) is built on top of it.

### Sub-Feature 2: The Minimum Fix Explorer

The game automatically enumerates *small* changes to the player's configuration — one rule reordered, one hook threshold adjusted by ±1, one buffer slot added — and runs each candidate change as a forked simulation from the EDT. The explorer reports the smallest change (by number of config fields touched) that would have flipped the outcome to a win.

The player gets a list: "Here are the 3 things that would have fixed this match, ordered by how small the change was."

This is mutation testing applied to agent configurations. The term comes from software fault localization: find the minimum mutation that changes the output.

### Sub-Feature 3: The Ghost Overlay

When comparing the forked simulation to the original, the original match plays in desaturated grey while the forked simulation plays in full color. Both run simultaneously from the fork point, diverging visually as their outcomes separate. The moment of divergence — when their tactical states first meaningfully differ — is marked on the timeline as a **blue split marker**.

The blue split marker is distinct from the EDT (gold) and false pivot (grey): it marks the tick at which the counterfactual world *looks different*, which is often several ticks after the EDT because the match unfolds slowly from the change.

---

## Mechanical Rules

### What Can Be Changed in a Fork?

The fork edit panel is **deliberately constrained** to prevent players from redesigning their whole army. The constraint is both pedagogical and practical:

**Allowed changes (single-element):**
- One rule: reorder, toggle active/inactive, change one operand value
- One hook: reroute target, change threshold, change trigger condition
- One context config value: buffer size ±1, fidelity threshold ±5%, eviction priority swap between two adjacent entries
- One skill assignment: swap one skill from one agent (remove skill from agent A, assign it to agent B)
- One context filter: add or remove one signal type from one agent's filter

**Not allowed in a single fork:**
- Adding new units
- Changing the topology of the hook network (add/remove hook nodes — must work with existing hooks)
- Changing two unrelated config fields simultaneously
- Changing spawn configurations (these are pre-battle decisions, not pivot-tick decisions)

The constraint is enforced by the edit panel itself — not as a hard error but as a visual limit. Each "change slot" is a single draggable/selectable element. The panel shows one change slot and greys out further modifications until the player clicks "run this fork" or "clear change."

**Why this constraint matters:** The constraint forces the player to identify *which specific element* was the problem, rather than doing a wholesale redesign. This is the diagnostic discipline the game is teaching. If the player needs to change three things to flip the outcome, the Minimum Fix Explorer will tell them — they don't need to find that themselves. Manual fork mode is for testing a specific hypothesis.

### Fork State Initialization

A fork at tick T means:
- All agent buffer contents as of tick T are frozen (read-only snapshot)
- All hook states as of tick T are preserved
- All unit positions, health, and active statuses as of tick T are preserved
- The player's configuration change is applied on top of this snapshot
- The deterministic tick scheduler resumes from tick T+1 with the modified configuration

The opponent's configuration is **not** replicated in the fork — the opponent's original configuration runs exactly as it did in the original match. The fork is testing "what if my config had been slightly different" against the exact same opponent behavior. This is correct: the player can only control their own architecture.

**One critical subtlety:** The fork inherits the opponent's actual random seed, ensuring that any opponent behaviors that involved randomness unfold identically. The counterfactual tests only the player's change, not a different roll of the dice.

### How the Game Detects "Outcome Flipped"

The fork simulation runs to `max_ticks` or to match resolution, whichever comes first. If the forked simulation produces a win (or higher pass rate in PvE mode) where the original produced a loss, the outcome has flipped. The game shows a **green outcome banner** over the fork timeline: "✓ This change would have won."

If the fork loses with the same outcome, the banner shows: "✗ Not enough — outcome unchanged." This is not a failure state — it's information. The hypothesis was wrong. The player needs to look elsewhere.

---

## The Minimum Fix Explorer: Deep Design

The Minimum Fix Explorer is an automated search over the space of single-element changes. It runs as a background process during Act 2 analysis — the player can watch the Minimum Fix Explorer working in a small panel while they're manually scrubbing the timeline.

### What It Actually Searches

Given a loss at the EDT, the explorer enumerates:
1. All rules across all agents → for each rule, try toggling active/inactive; try incrementing/decrementing numeric operands by ±1
2. All hooks → for each hook, try rerouting to adjacent agents; try adjusting trigger threshold ±1
3. All buffer sizes → for each agent, try +1 slot
4. All eviction priority orders → for each agent, try swapping adjacent priority entries

For a typical army of 5–8 agents with 3–5 rules each and 4–10 hooks, this is approximately 50–150 candidate changes. Each candidate fork takes ~200ms to simulate (deterministic scheduler, no graphics). Total search time: 10–30 seconds. The explorer displays a progress bar and updates results as they come in.

### What It Reports

The Minimum Fix Explorer panel shows a ranked list of **"fixes that would have won"**:

```
Minimum Fix Explorer — 3 solutions found (searched 127 candidates in 22s)

1. SCOUT-A › Rule 3: raise fidelity threshold from 60% to 65%          [1 field change]
   Fork from tick 34 → Win at tick 71 (+12 ticks late, narrower margin)

2. RELAY-B › Hook "alert-striker": reroute to STRIKER-C instead of STRIKER-B   [1 hop change]
   Fork from tick 34 → Win at tick 58 (same tempo as original loss, opposite outcome)

3. COMMAND › Buffer: increase capacity from 4 to 5 slots                [+1 slot]
   Fork from tick 34 → Win at tick 63 (7 ticks earlier than solution 1)
```

The list is ordered by **change minimality** (fewest config fields touched), not by outcome quality. All three are single-element changes. The player can click any entry to load the ghost overlay for that specific fork.

**What the player does with this list:** They are now looking at three different causal explanations for why they lost. Solution 1 says "your scout's fidelity threshold filtered out a signal you needed." Solution 2 says "the wrong striker got the alert." Solution 3 says "your command agent ran out of buffer space." Each is a different architectural diagnosis.

The player now has three competing hypotheses, each verified by a working counterfactual simulation. The question is: which one reflects the *real* structural weakness in the architecture, not just a one-match fix? This is where the game's pedagogy deepens — counterfactual simulation produces hypotheses, human judgment evaluates them.

### When the Explorer Finds No Single-Element Fix

If no single-element change flips the outcome, the explorer reports:

```
Minimum Fix Explorer — 0 single-element solutions found.
This match required at least 2 config changes to flip.

Recommend: check signal genealogy for the EDT tick — the failure is architectural, not parametric.
```

This is a meaningful result: the match loss is *not* attributable to one specific misconfiguration. Something deeper is wrong — the network topology, the overall agent roles, the skill assignments. The explorer communicates this clearly rather than leaving the player confused about why it found nothing.

### Computational Feasibility

This is only possible because of Robot Uprising's core technical choice: **deterministic tick scheduler, no backend**. The game can run 150 candidate simulations at 200ms each because:
- Each simulation is a pure deterministic function over a state snapshot — no rendering, no physics, no graphics
- The state snapshot at tick T is ~5–20KB of data
- The tick scheduler is essentially a loop — no I/O, no network, no randomness beyond the seeded RNG
- Modern JavaScript can execute this at well over 100k ticks/second

If the game used an LLM for agent behavior, this feature would be economically and latency-infeasible. The fully-deterministic architecture (2.00a) directly enables counterfactual simulation as a first-class feature. This is one of the strongest arguments for the deterministic model.

---

## What the UI Looks Like

### Entering Counterfactual Mode

In Act 2 (after seal break), the timeline shows the EDT gold diamond. To the right of the debrief controls appears a new button: **[⑂ Fork here]** — appears only when the scrubber is positioned at or after the EDT. The button uses a fork/branch icon (two diverging lines from one point), cool blue tint.

Clicking **[⑂ Fork here]** opens the **Fork Panel** — a sliding drawer from the right side of the debrief screen. The drawer does not replace the current view; the timeline and ghost overlay remain visible.

The Fork Panel contains:
- A read-only snapshot summary: "Fork at tick 34 — SCOUT-A buffer: [4 entries], RELAY-B hook state: [active], match score: [3 objectives vs 1]"
- A single **Change Slot** — a drag target that accepts one config element from the agent inspector (drag a rule, a hook, or a buffer slot from the inspector on the left into this slot)
- Once an element is in the Change Slot, inline editing controls appear: a toggle (on/off for rules), a numerical input (for threshold values), a dropdown (for hook routing)
- A green **[▶ Simulate fork]** button
- Below this, a secondary section: **[🔍 Run Minimum Fix Explorer]** which auto-populates the list when clicked

### The Ghost Overlay View

When a fork simulation completes, the debrief timeline splits:

```
[Original timeline] ─────────────── grey ─────────── Loss at tick 82
                         Fork point ⑂ (tick 34)
[Fork timeline]    ──────────────── color ──────────── Win at tick 71
```

Both timelines run simultaneously when the user clicks play. The original is desaturated to 60% saturation, 60% brightness. The fork runs in full color. Agents that diverge in behavior between the two timelines are highlighted with a blue border that intensifies as their states diverge. The first tick at which any agent's state differs between the two timelines is the **blue split marker** — a vertical blue line on both timelines labeled "⑂ First divergence."

In the Pixi.js battlefield view (used for execution phase), the ghost overlay appears as a canvas-level split: original match plays in the left half in grey, fork plays in the right half in color. The fork point is rendered as a brief visual flash — a horizontal blue line sweeping across the battlefield at the moment the fork activates.

### The Minimum Fix Explorer Panel

A collapsible panel below the timeline. Its header shows a progress indicator while searching: "Searching 127 candidates… 63/127." Each result that arrives mid-search appears in the list with a brief green flash on the row. When complete, the panel header updates to "3 solutions found."

Clicking any result in the list:
1. Loads that fork's ghost overlay into the main view
2. Highlights the changed config element in the agent inspector (left panel) with a blue glow
3. Auto-scrubs the timeline to the blue split marker for that fork

The inspector highlight communicates: "This is the element that made the difference." The player can see exactly where in their architecture the fix lives.

---

## Player Journeys

### Journey 1: Yusuf, 27, Engineer by Day, First Counterfactual

**Context:** Yusuf has 40 hours in the game. He just finished a Gauntlet match that he expected to win — his architecture had been performing at 78% for two weeks. This loss felt random. EDT is at tick 47. He enters Act 2.

**Minute 0:00 — Act 2 Materializes**

Signal genealogy lights up. EDT gold diamond at tick 47. He clicks the diamond. Signal genealogy shows a relay chain that died at tick 46 — one tick before the EDT. His RELAY-C went silent and the striker it was feeding continued attacking without new target data for 12 ticks before the match resolved.

He knows the relay died. He doesn't know why. Buffer overflow? Hook timing? He doesn't want to read all 47 ticks of signal history tonight — it's 11pm.

**Minute 1:30 — Discovers the Fork Button**

His scrubber is at tick 47. He notices the **[⑂ Fork here]** button he's never clicked before. He hovers: "Fork from this tick and simulate a change to see if the outcome would have flipped." He clicks it.

The Fork Panel opens. He drags RELAY-C's buffer size slot from the inspector into the Change Slot — changes it from 4 to 5. He clicks **[▶ Simulate fork]**.

A 3-second progress bar. Then: **"✓ This change would have won."** Win at tick 63 — 16 ticks later than his expected match length.

**Minute 2:15 — The Ghost Overlay**

The overlay loads. Original match in grey, fork in color. He hits play. Both play simultaneously. At tick 46, the grey RELAY-C goes silent. The color RELAY-C keeps running — the +1 buffer slot caught the signal that would have been evicted. The color striker flanks successfully. Win.

Yusuf stares at the screen. One buffer slot. His entire architecture failed because RELAY-C ran out of buffer by exactly one slot at exactly the right moment. He'd been optimizing skills and hooks for weeks while the actual weak point was a single buffer size setting he hadn't touched since campaign day 1.

He laughs, types in the note field: "RELAY-C: 4→5 slots. One slot. I lost 8 Gauntlet matches and it was ONE SLOT."

He adjusts RELAY-C's buffer in the workbench. Tomorrow's deploys will tell him if that was the whole story.

**What the game taught him:** Buffer management is not a secondary concern. Every agent has a minimum viable buffer size for the match tempo it operates in. He now has a mental model of "buffer headroom as architectural slack" that came not from a tutorial but from watching his own match diverge at one slot.

**UI Annotations:**
- Fork Panel: slides in from right, 320px wide, takes up 30% of debrief screen width, non-blocking overlay
- Change Slot: 60px square drag target with dotted border and "drag a config element here" label when empty
- Fork progress: 3-second animated bar with a subtle binary-digits fill animation (not a spinner, makes the computation feel like work)
- Win banner: green, full-width across fork timeline, with white text and a ✓ icon — bright enough to cut through the grey/color split

---

### Journey 2: Amara, 34, Senior Player, Minimum Fix Explorer Power User

**Context:** Amara has 300+ hours. She's doing a full necropsy session on a 3-match losing streak. She opens the first loss debrief. EDT tick 52. FPG: 18 ticks. She skips Act 1 (she already watched it), goes straight to Act 2.

**Minute 0:10 — Triage**

She reads: `EDT: 52. FPG: 18.` Low FPG. Clean match. The most dramatic moment was basically the real cause. She scrubs to tick 52, clicks **[⑂ Fork here]**, then immediately clicks **[🔍 Run Minimum Fix Explorer]** without putting anything in the Change Slot.

The explorer starts: "Searching 142 candidates…"

She uses the 22-second wait to manually inspect the signal genealogy around tick 52. She's looking for candidates to verify once the explorer completes.

**Minute 0:35 — Explorer Returns Three Results**

```
1. SCOUT-B › Rule 2: fidelity threshold 55% → 60%       [parametric: +5%]
2. COMMAND › Hook "reassign-scout": reroute SCOUT-B → SCOUT-A  [routing change]
3. RELAY-A › Buffer: 3 → 4 slots                          [+1 slot]
```

She scrolls through them with experienced eyes. All three flip the outcome. But solutions 1 and 3 are both "small" changes that compensate for something. Solution 2 is different — it reroutes the hook, suggesting the COMMAND agent was sending reassignment signals to the wrong scout. That's a topology error, not a parameter drift.

**Minute 1:00 — Clicking Solution 2**

She clicks solution 2. Ghost overlay loads. She watches from the fork point. The COMMAND agent in the forked simulation reroutes to SCOUT-A (which is in better position). SCOUT-A is responsive. The flank executes. Win at tick 61.

She looks at the original. COMMAND routed to SCOUT-B, which was pinned in a defensive position and couldn't respond to the reassignment. SCOUT-B accepted the hook but physically couldn't execute. So the reassignment consumed the COMMAND agent's action budget without producing the intended effect.

**The insight:** Her COMMAND agent was sending reassignment signals to the wrong unit — not because the hook was wrong, but because she'd been using SCOUT-B as her designated "reassign target" from an early campaign habit. SCOUT-A is now her better-positioned unit and the COMMAND hook routing hadn't been updated. This is an *architectural debt* problem — an outdated assumption baked into the hook topology.

**Minute 2:15 — Third Match**

She opens the third loss. `EDT: 41. FPG: 9.` Explorer runs. **0 single-element solutions found.**

She reads: "This match required at least 2 config changes to flip."

She leans forward. This one is structural. She saves a note: "Loss 3: no single fix available — architecture diagnosis needed, not parameter tuning." She adds it to her necropsy backlog as a separate session. She doesn't try to fix it tonight — the explorer told her it's a bigger job.

**What counterfactual simulation did for her workflow:**
- Loss 1: Found a quick parameter fix (5 minutes)
- Loss 2: Found a routing topology error (10 minutes)
- Loss 3: Triage signal — "this needs deeper work, don't fix tonight" (2 minutes)

Without counterfactual simulation, she'd have spent equal time on all three. The explorer let her triage correctly.

**UI Annotations:**
- Explorer result list: 3 rows visible without scroll; each row has an icon showing change type (⊕ for parameter, ⇉ for routing, □ for buffer); clicking a row loads ghost overlay without needing to scroll to confirm
- "0 solutions" state: displays a yellow caution indicator (not red — it's informational, not an error); recommends signal genealogy as the next diagnostic step; links directly to 4.16 visualization
- The recommendation text is not dismissible until the player clicks the signal genealogy link — one nudge toward the right next step

---

### Journey 3: Cass, 29, Streamer, "Counterfactual Live" Format

**Context:** Cass runs weekly "Gauntlet Breakdown" streams. This week they're introducing the Minimum Fix Explorer to their audience for the first time. They have 500 viewers who know the game but haven't used advanced debrief features.

**The Setup (pre-stream)**

Cass picks a loss with `FPG: 33` (a misleading match — should be good content). They've already done the sealed watch off-camera. They're going to run the explorer live for the first time.

**Minute 0:00 — Stream Opens**

"OK chat, you've seen me use the EDT diamond and the signal genealogy. Today we're going to use something I've never used on stream — the Minimum Fix Explorer. It searches my entire config for the smallest possible change that would have won this match. I literally don't know what it's going to find."

Chat: `??? what??` `this game is insane` `actual mutation testing for a robot game`

**Minute 2:00 — Explorer Running**

Cass scrubs to the EDT (tick 39), clicks Fork, clicks "Run Minimum Fix Explorer." Progress bar starts: "Searching 89 candidates…"

"So it's literally running 89 different versions of my last match in the background right now, checking each one to see if it would have changed the outcome. Give it like 15 seconds."

Chat counts down: `89` `70` `50` `almost there` `lets gooo`

**Minute 2:20 — Two Solutions Found**

```
1. RELAY-C › Rule 1: priority THREAT before TERRAIN   [rule reorder]
   Fork win at tick 52 (13 ticks after fork point)

2. SCOUT-A › Context filter: add SIGNAL_TYPE.RETREAT to observe list   [+1 filter]
   Fork win at tick 44 (5 ticks after fork point)
```

Cass reads them aloud. Chat immediately debates: `solution 2 is faster` `but solution 1 makes more conceptual sense` `both are one change??` `ONE CHANGE WOOOO`

"OK so solution 2 flips the match in only 5 ticks after the fork — that means it fixes the problem almost immediately. Let me load that one."

**Minute 2:45 — Ghost Overlay for Solution 2**

Ghost overlay loads. Grey original: SCOUT-A misses the RETREAT signal from an enemy unit, doesn't disengage, gets flanked. Color fork: SCOUT-A catches the RETREAT signal (now in its filter), reads the enemy movement, calls in the relay hook, flanks instead of being flanked.

"So SCOUT-A couldn't see RETREAT signals. The enemy was retreating and setting up a flank and my scout had no idea because RETREAT wasn't in its filter. One filter entry. I'm adding one filter entry and I win in 5 ticks."

Chat: `RETREAT WAS IN PLAIN SIGHT` `the machine told you in 20 seconds` `how is this game real` `game of the year`

"What's wild is solution 1 — the rule reorder — also would have worked, but through a different mechanism. My relay would have prioritized the THREAT signal over the terrain data it was caching, and that would have gotten to my striker in time. Two completely different architectural paths to the same win."

Chat: `branching timelines` `counterfactual supremacy` `this is a GDC talk`

**What this stream moment does for the game:**
- Demonstrates the Minimum Fix Explorer's output in live conditions with genuine surprise from the streamer
- The chat countdown ("89… 70… 50…") turns the computation into audience participation
- "Two different paths to the same win" is a teaching moment about non-determinism in architectural diagnosis
- The 5-tick divergence vs. 13-tick divergence comparison gives audiences something to debate

**UI Annotations:**
- Explorer output is large enough to be readable in stream thumbnails (minimum 16px equivalent)
- The progress bar uses binary-filling animation that streams entertainingly at 30fps clip speed
- Ghost overlay has distinct visual language at 720p/1080p — grey vs. color split is visible even with stream compression artifacts

---

## Strengths and Weaknesses

### Strengths

**Closes the diagnosis-to-fix loop.** The debrief currently ends with "here's what happened" (signal genealogy, EDT, FPG). Counterfactual simulation extends it to "here's what would have worked." This is the complete engineering feedback cycle: observe → diagnose → hypothesis → test. Without counterfactual simulation, players leave the debrief with a hypothesis but must deploy a new config to test it (another 3-10 minute loop). With it, they test the hypothesis in 20 seconds.

**Reveals that most failures are small.** The Minimum Fix Explorer systematically demonstrates that most losses are attributable to one specific misconfiguration — not wholesale architectural failure. This prevents the common anti-pattern of over-engineering after a loss. "I lost because my relay had 3 buffer slots when it needed 4" is not a call to redesign the whole army. The explorer makes this precision visible.

**Teaches fault localization as a skill.** Mutation testing (the software equivalent) is a professional skill in QA engineering. The Minimum Fix Explorer makes it a game mechanic — players learn to think about their configurations as things that can fail at a single point, not as holistic gestures. This skill transfers directly to real agentic AI engineering.

**Enables the "no single fix" triage signal.** Some losses genuinely require architectural rethinking. The explorer's "0 solutions" output is as valuable as its positive findings — it tells the player this loss is different and requires a different kind of attention. Without this signal, players apply parameter-tuning logic to structural problems and make no progress.

**Computational feasibility as an argument for determinism.** This feature is only possible because the tick scheduler is deterministic and fast. It becomes an in-game argument for the fully-deterministic execution model (2.00a), which might otherwise seem like a creativity constraint. The counterfactual simulation demonstrates that determinism *enables* features that probabilistic/LLM-native models cannot support without massive compute cost.

**Streamer content engine.** The Minimum Fix Explorer's live operation is inherently streamable — progress counting, result reveal, ghost overlay comparison, chat debate over two solutions. It produces good clips without any additional design work.

### Weaknesses

**Risk of over-reliance.** Players who always run the explorer before manually analyzing the debrief skip the diagnostic reasoning that makes them better players. The explorer produces the answer without building the skill of finding it. Mitigation: the explorer should require Act 2 completion before it unlocks — force the player to watch signal genealogy and scrub to EDT first.

**Multiple solutions create decision paralysis.** When the explorer finds 4–6 solutions, the player has to choose among competing diagnoses. Each solution is a local fix for a different underlying problem. Advanced players benefit from this (they understand the tradeoffs); beginners may be confused by "there are 3 different right answers." Mitigation: rank solutions by how fundamental the change is (topology changes > routing changes > parameter changes > size changes), with a one-line explanation of what each change addresses.

**The "false fix" problem.** A single-element change that flips the outcome on *this specific match seed* may not generalize to the broader config. The player fixes RELAY-C's buffer from 3 to 4 and wins the next 5 Gauntlet matches — but only because this particular opponent's strategy happened to stress that specific buffer. When the meta shifts, the fix evaporates. The counterfactual is correct for the specific match but may be misleading about the architecture's general health. Mitigation: display the Minimum Fix Explorer results alongside the mission's pass rate, not in isolation — remind the player that a one-match fix must be validated across the full scenario distribution.

**Computational load on mobile/low-end hardware.** Running 150 mini-simulations at 200ms each in 30 seconds may be fine on desktop but could be 2–3x slower on mobile. The explorer should have a graceful degradation mode: run top 30 most-likely candidates first, report those results, continue in background if the player stays on the debrief screen. Never block UI.

**Ghost overlay visual complexity.** The grey/color split with two simultaneous battlefield replays is information-dense. For complex armies (6+ agents), the divergence between timelines becomes hard to track visually. Mitigation: on the Pixi.js battlefield view, highlight only the agent(s) that differ between timelines in a given tick — all others rendered identically in both panels. The divergence path stays visible, the rest isn't noise.

**Does not work for PvP opponent configs.** The fork changes the player's config only — the opponent's behavior is identical in both timelines. This is correct, but it means the explorer cannot diagnose "I lost because my opponent's config was just fundamentally better." If the match is lost because no single change to the player's config would have won, the "0 solutions" result may indicate the opponent was in a different strategy tier — the explorer can't distinguish "bad architecture" from "outclassed." The message should acknowledge this: "No single-element fix found. This may indicate an architectural gap or a superior opponent configuration."

---

## Interaction Effects

### Counterfactual + EDT (4.18)
The EDT is the canonical fork point. While the player can fork at any tick, the fork is most diagnostically meaningful at EDT — because that's the last point where a change could have mattered. Forking before EDT may reveal interesting mechanics but doesn't answer "what fix would have won." Forking after EDT is useless (outcome was already locked). The UI should default the fork button to the EDT tick, with a tooltip explaining why.

### Counterfactual + FPG (4.26)
In high-FPG matches, the explorer should automatically offer to fork from both the EDT *and* the false pivot tick. "Fork from EDT (tick 82)" and "Fork from False Pivot (tick 34)" are two different diagnostic hypotheses. A fix at the false pivot tick is an *early intervention*; a fix at the EDT is a *late intervention*. The Minimum Fix Explorer at the false pivot may find no solutions (because the match wasn't actually decided there), confirming the FPG story.

### Counterfactual + Two-Act Debrief (4.04b)
Counterfactual mode is an Act 2 feature only. The fork button does not appear during Act 1 (sealed watch). This is load-bearing — the sealed watch's emotional experience must not be contaminated by "I could just test what would have fixed this." The fork mode is analytical surgery; the sealed watch is emotional experience. They must be temporally separated.

### Counterfactual + Signal Genealogy (4.16)
The two features are complementary. Signal genealogy shows *what happened* in the original match — the causal chain. Counterfactual simulation shows *what would have happened* with a change. The ideal workflow: use signal genealogy to identify a suspicious element, then use manual fork to test a specific hypothesis about that element, then use the explorer to find alternatives. The debrief should make this workflow explicit with UI affordances (e.g., right-clicking an element in signal genealogy should offer "test a change to this element" as an option that pre-fills the fork panel).

### Counterfactual + Deterministic Execution (2.00a)
Counterfactual simulation is the strongest argument for the deterministic execution model. An LLM-native model (2.00d) cannot run 150 mini-simulations in 30 seconds — each would require API calls with latency and cost. A hybrid model (2.00c) could support it for the deterministic portion of agent behavior but not for LLM-generated decisions. The Minimum Fix Explorer as a feature creates a concrete design argument: if you want this kind of diagnostic power, you need determinism. This interacts with the core pitch — "the game teaches agentic AI engineering" — by demonstrating that deterministic agents can be analyzed in ways that stochastic agents cannot.

### Counterfactual + Robustness Scenarios (4.22, campaign/mission-design-robustness-scenarios.md)
In PvE missions with 100 randomized test cases, counterfactual simulation changes. You can't fork "the match" because there are 100 matches. Instead, the explorer should fork each failing scenario independently and find the single config change that improves pass rate across the most scenarios. This is a multi-scenario optimization problem: "what one change improves the most failing cases?" This may require ranking changes by pass-rate delta rather than by binary win/loss flip — a harder computation but a more powerful teaching tool. The Minimum Fix Explorer in robustness context becomes "which single fix gains you the most scenarios."

### Counterfactual + Screeps's Live Win-Rate (1.04g, competitive-analysis/live-winrate-persistent-identity.md)
In Gauntlet mode (async PvP), counterfactual simulation works exactly as described — fork from a specific match's EDT. But the results should be framed in terms of ELO/win-rate impact rather than binary outcome: "This fix would have flipped this specific match, which was against a [roughly equal Elo] opponent. Applied to your current config, expected win-rate change: +3–5% (estimated from match pool sample)." Connecting the counterfactual to expected aggregate win-rate makes it more actionable for players optimizing a live config.

---

## Comparable Games and Media

### Chess Engines: Retrograde Analysis
Chess engines can analyze any position and show "the best move from here." Stockfish's retrograde analysis is functionally a Minimum Fix Explorer: given a losing position, what's the one move that keeps you in the game? Every serious chess improvement resource (Chess.com's Game Review, Lichess's analysis board) implements this. Robot Uprising's explorer applies the same concept to agent configurations instead of board positions. The key difference: chess has one legal space of moves; Robot Uprising's config space is larger and requires enumeration rather than alpha-beta search.

### Factorio: Blueprint Variant Testing
Factorio players manually test belt layouts by building multiple versions of the same factory subsystem to compare throughput. The counterfactual simulation automates this — instead of manually rebuilding an agent config and running a new mission, the game does it for you from the exact tick of failure. The difference is speed (seconds vs. minutes) and precision (you test the same match state, not a new instance).

### Into the Breach: Preview Consequences
Into the Breach shows the *consequences of each possible action* before you take it. The counterfactual is the post-hoc version of this — "what would have happened if I had taken a different action at tick T." Both games share a commitment to making consequences visible and learnable. Into the Breach does it prospectively; Robot Uprising's counterfactual does it retrospectively.

### Software: Time-Travel Debugging (rr, WinDbg TTD)
Mozilla's `rr` debugger and Windows's Time Travel Debugging (TTD) allow developers to record a program execution and replay it, stepping both forward and backward, setting breakpoints in the past. They're used to diagnose bugs that are hard to reproduce: set a watchpoint on a value, rewind to when it changed. Robot Uprising's fork at EDT is functionally a time-travel debugger for agent configurations: set the "break condition" as the EDT, fork from there, apply a change, continue forward. The mental model is identical. The game can explicitly reference this: "the counterfactual is a time-travel debugger for your attention architecture."

### Incident Response: "If We Had Alerting at X, Would the Incident Have Been Caught Earlier?"
Postmortems often include hypotheticals: "If we had added the latency alert we discussed in Q2, this would have triggered 8 hours earlier." This is a counterfactual simulation in incident response — what change to the monitoring configuration would have changed the outcome? The Minimum Fix Explorer in Robot Uprising makes this reasoning automatic. Players who play hundreds of matches with counterfactual simulation develop the professional habit of asking "what's the minimum observability change that would have caught this?" — and that's a transferable skill the game explicitly teaches.

### Speedrunning: TAS (Tool-Assisted Speedruns)
TAS creators search the space of frame-perfect inputs to find the fastest path through a game. The Minimum Fix Explorer is a TAS-style automated search over the config space, but for winning rather than speed. The spirit is the same: brute-force exploration of the decision space to find the optimal single intervention. The key difference: TAS searches for *all-frame-perfect* solutions; the explorer searches for *minimum-change* solutions. The explorer is the "minimum viable intervention" version of TAS.

---

## Sensory Description

**The Fork Panel Opening**
The fork panel slides from the right edge of the debrief screen with a soft hydraulic sound — not a clang (this is a tool, not a weapon). The panel has the same dark background as the agent inspector, but with a subtle blue-tinted border — the color of something that exists outside the original timeline. The fork icon in the button (two diverging lines from one point) briefly animates when clicked: one line goes straight, one curves away. The animation takes 0.3 seconds.

**The Change Slot (Empty)**
A 60×60px area with a dotted border in that same timeline-blue. The border pulses very slowly (once per 3 seconds) — just enough to suggest it's waiting, not animated enough to be distracting. The icon inside is a chain link with a question mark — "one change goes here." When a config element is dragged in, the border flashes solid blue and the question mark fades to the element's icon.

**The Fork Simulation Running**
The progress bar fills left-to-right in binary-cascade style — not a smooth gradient but a sequence of tiny 1s and 0s appearing and locking into place. Each candidate simulation completing is one small "tick" sound — a soft electronic click, quiet enough to barely register individually, collectively creating a pulsing drumbeat as the explorer runs. The sound tempo increases slightly as more candidates are checked.

**The Win Banner**
When a fork simulation returns a win: the fork timeline header flashes solid green, then settles to a steady bright green strip. A clean digital chord plays — two notes, major interval, resolving upward. The word "WIN" appears in white large text for 0.8 seconds, then transitions to the full timeline label. The animation is deliberately quick — this is confirmation, not celebration. The celebration happens when the player loads the ghost overlay and watches why it worked.

**The Ghost Overlay in Motion**
On the Pixi.js battlefield: original agents move in grey, their glow effects reduced to monochrome. Fork agents move in color — their signal indicators bright, their hook connections visible in color. When an agent's behavior first diverges between the two timelines (the blue split marker tick), a brief ripple effect spreads from that agent's position in the fork view — like a stone dropped in still water, three expanding rings, blue, fading. This is the precise moment the timeline branches. The sound: a single deep resonant bell tone, not musical, more like a tuning fork. It says: here is where this version of history diverges.

**The Minimum Fix Explorer List**
Results appear with green left-border highlights on each row. Each row has a small colored dot indicating change type: blue for routing, amber for parameter, purple for filter, green for buffer. The dots are small but consistent — after 50 hours of play, their color language is as automatic as reading text. Hovering any row shows a preview thumbnail of the ghost overlay for that fork — a 100×60px replay preview that automatically plays the 5 ticks around the blue split marker.

**When the Explorer Finds Nothing**
A single yellow caution icon appears in the panel header. The panel empties and shows a grey shimmer animation — like a scan finding nothing. The message appears in yellow text: "No single-element fix found." The audio: a low, brief two-note descent. Not a fail sound — a "look elsewhere" sound. Quieter than the win chord, less definitive. The message is accompanied by a glowing arrow pointing to the signal genealogy panel: "This match needs deeper architectural analysis."

---

## The TikTok Clip

**15-second scenario:** Player opens debrief. EDT at tick 39. Clicks "Run Minimum Fix Explorer." Progress bar counting down (audience sees numbers). Result: "2 solutions found." First result: "RELAY-C: buffer 3 → 4 slots." Player clicks. Ghost overlay: grey original loses, color fork wins. The single divergent moment is highlighted — one agent catching a signal it missed before. The entire chain — scout data → relay compression → striker flank — fires because of one extra buffer slot. Text overlay: "I lost 8 matches in a row and it was one buffer slot. The machine found it in 22 seconds."

This clip works because:
1. The countdown creates audience participation tension
2. "22 seconds" is astonishing — it tested 127 versions of the match
3. "One buffer slot" is viscerally satisfying — precision, not wholesale redesign
4. The ghost overlay makes the causal chain visible even without game knowledge — you see something happening in the color version that didn't happen in the grey version
5. "The machine found it" positions the game as genuinely intelligent, not menu-driven

---

## Discovered Aspects

**4.36 — Multi-scenario Minimum Fix Explorer for PvE robustness missions:** Instead of "what change flips this match," ask "what change improves pass rate across the most failing scenarios simultaneously." A harder computation but more architecturally meaningful — the fix that wins 7/10 failing scenarios is more robust than the fix that wins 1. Requires ranking changes by pass-rate delta, not binary flip.

**4.37 — Fork-and-deploy shortcut:** After finding a winning fork via the explorer, a one-click button applies the winning change to the active workbench config and opens the deploy queue. Removes the friction of manually finding and applying the change after seeing it in the explorer. Risk: removes the learning step of "find the element in the config yourself."

**4.38 — Counterfactual history as config evolution record:** Preserving all forks that the player ran against a given config as a version history artifact — "you tested 12 counterfactuals against v3.2, here are the ones that worked." This history as a shareable artifact in the necropsy culture — "here's the diagnostic work I did before landing on v3.3."

**4.39 — Adversarial counterfactual mode:** Rather than exploring "what change to my config would have won," run the Minimum Fix Explorer on the *opponent's config* — "what one change to the opponent's config would have beaten me even more decisively?" This is the meta-diagnostic: finding your config's structural weaknesses by simulating improvements to adversaries. Available only in Gauntlet mode after a match. Teaches "stress testing from the attacker's perspective" — a professional red-teaming mental model.

**4.40 — The "first viable fix" vs. "minimum fix" preference toggle:** Some players want the fastest-running fork (the first candidate that flips the outcome, which may not be the smallest change). Others want the truly minimum change. A toggle in the explorer: "Find first flip" vs. "Find minimum flip." First flip is faster (stops at first success); minimum flip checks all candidates. Surfacing this tradeoff as a player choice is itself an educational moment about search strategies.
