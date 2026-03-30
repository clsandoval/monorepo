# 4.109 — The Diagnostic Reflex: Probe Suggestion from Signal Genealogy Broken-Edge View

**Aspect:** 4.109 — Probe suggestion from signal genealogy broken-edge view: when the signal genealogy (4.16) shows a broken edge (dropped signal), the broken-edge sub-panel (4.105) surfaces a probe suggestion for the *receiving* agent: "STRIKER-A dropped signal S-08. Add a probe to STRIKER-A to capture its buffer state at next match -->"; extends the probe suggestion pattern to a second diagnostic surface beyond the pre-ranking drawer; interaction with 4.105 and 4.66

**Parent:** 4.105 — "Why Was This Signal Dropped?" Sub-Panel (The Coroner's Slab)
**Siblings:** 4.67 — Probe hook suggestion from transparency panel; 4.107 — Probe budget as resource; 4.108 — Cross-match probe comparison view
**Related:** 4.16 — Signal genealogy visualization; 4.15 — Probe hooks; 4.66 — Signal genealogy as pre-ranking source; 4.58 — Pre-ranking transparency panel; 4.20 — Counterfactual simulation; 8.09 — Diagnostic layer as teaching arc; 2.01 — Fixed-slot buffer model; 2.06 — Player-configured eviction

---

## The Diagnostic Reflex

The Coroner's Slab (4.105) is the most granular diagnostic surface in Robot Uprising. It shows the player a dead signal — the exact buffer contents that blocked it, the exact slot it contested, the exact eviction policy that rejected it. The player stares at the corpse on the slab and understands *why* this signal died in *this* match.

But the Slab is a postmortem tool. It analyzes the past. What the player needs next is a way to observe the *same pathology* in the future — after they have changed their configuration and want to verify whether their fix actually works. Did the buffer clear up? Is Striker-B receiving threat signals now? Or is the same bottleneck persisting in a different form?

**The probe suggestion at the bottom of the Coroner's Slab is the game's way of saying: "You found the body. Now wire up the surveillance camera so you can watch the scene in the next match."**

This is the second location in the game where probe suggestions appear. The first is the pre-ranking transparency panel (4.67), where the suggestion fires based on statistical indicators — high volatility, high pivot-tick activity. That suggestion is inferential: "this element *might be* interesting, based on aggregate signals." The broken-edge probe suggestion is concrete: "this element *definitely had a problem*, at *this exact tick*, involving *this exact signal*." The confidence level is categorically different. The transparency panel says "you should probably look here." The Coroner's Slab says "here is the murder scene; set up a camera."

### The Pattern Name: "Scene-of-Crime Instrumentation"

In forensic engineering, when an incident occurs at a specific location, the first action after analysis is to instrument that location: add monitoring, set up alerts, install sensors that will fire if the same conditions recur. The broken-edge probe suggestion is this pattern applied to agent diagnostics. The player has identified a failure point (signal dropped at Striker-B's buffer at tick 34). The suggestion instruments that failure point (probe hook on Striker-B capturing buffer state). The next match produces data at that exact location. The player returns to the debrief and can compare: "before my fix, Striker-B's buffer was 8/8 terrain data. After my fix, Striker-B's buffer was 5/8 with the threat signal in slot 6."

This is the **diagnostic loop closure** — the mechanic that turns a one-time observation into a repeatable measurement. Without it, the player changes their config, runs a new match, opens the genealogy, and has to manually hunt for whether Striker-B dropped signals again. With it, the Probe Log timeline has a marker at tick 34 that the player can click to see the exact buffer state, compare it to what the Slab showed last match, and confirm whether the fix worked.

### Why the Receiving Agent, Not the Sending Agent

The suggestion always targets the receiving agent — the one whose buffer was full — not the sending agent or the relay chain. This is a deliberate pedagogical choice.

Beginners who see a dropped signal tend to blame the sender: "Scout-A didn't send the signal correctly" or "Relay-C must have corrupted it." The Coroner's Slab already corrects this misconception by showing that the signal arrived intact and was rejected by a full buffer. The probe suggestion reinforces the correction by directing attention to the receiver: "Add a probe to *STRIKER-A*." Not Scout-A. Not Relay-C. The agent that had the full buffer. The one whose attention system failed.

This teaches a core principle of distributed systems: **the receiver is responsible for what it attends to.** In real-world systems, when a message queue is full and messages are dropped, you don't blame the producer — you examine the consumer. Why isn't it processing fast enough? Why is its queue configured so small? Why is it retaining stale data instead of making room for fresh messages? The probe suggestion embeds this principle in the interaction: the game always points the diagnostic instrument at the consumer, never at the producer.

---

## Exact Mechanics

### Trigger Condition

The probe suggestion appears in the Coroner's Slab's "What-If Footer" section (defined in 4.105) when ALL of the following are true:

1. The player has clicked a broken edge in the signal genealogy and the Coroner's Slab is open
2. The receiving agent does not already have an active probe hook
3. The player has available probe budget (see 4.107 — early game: 2 slots, mid: 4, late: unlimited)

If the receiving agent already has a probe, the suggestion text changes to: "Probe already active on STRIKER-A. Buffer state will be captured at next match." The CTA button is replaced with a teal checkmark and a link: "View probe configuration -->"

If the probe budget is exhausted, the suggestion text reads: "Probe budget full (2/2 active). Remove a probe to instrument STRIKER-A." The CTA button is greyed out. A small link beneath: "Manage probes -->" opens the probe management panel.

### The CTA Element

The probe suggestion occupies the third position in the What-If Footer, below "What if this signal had arrived 1 tick earlier?" and "What if buffer had 1 more slot?" The visual hierarchy is intentional: the first two what-ifs are hypothetical explorations (backward-looking counterfactuals), and the third is a forward-looking action (set up observation for next match). The progression is: understand the past, imagine alternatives, prepare for the future.

The CTA renders as:

```
┌────────────────────────────────────────────────────────────────────┐
│  ◉ Add probe to STRIKER-A — capture buffer state at next match    │
│    Trigger: tick 34 (±2 ticks)  |  Captures: all 8 buffer slots  │
│    Cost: 1 hook slot on STRIKER-A                                  │
└────────────────────────────────────────────────────────────────────┘
```

The `◉` icon is a probe glyph — a small circle with radiating lines, rendered in the game's diagnostic teal (`#4ecdc4`). The entire row has a 2px left border in teal, visually linking it to the probe system's color language (distinct from the amber of the Coroner's Slab's verdict line and the red of the broken edge).

The second line provides three pieces of information before the player commits:
- **Trigger:** The tick range that the probe will capture. Default is the drop tick +-2, producing a 5-tick window of snapshots. This mirrors the pivot-tick window probe from 4.67.
- **Captures:** What data the probe will record. "All 8 buffer slots" is explicit — the player knows they will get the same slot-by-slot view they are currently seeing in the Slab, but from the *next* match.
- **Cost:** The hook slot cost, stated plainly. If Striker-A has 2 hook slots and both are occupied, this line reads: `Cost: 1 hook slot on STRIKER-A (requires freeing a slot)` and the CTA becomes a two-step action: clicking opens the hook configuration panel first.

### Click Behavior

**Single click** on the CTA:

1. The `◉` icon fills from outline to solid teal (200ms transition). A soft confirmation tone — a short ascending two-note chime, same as the probe activation sound in the Plan screen (4.15) — plays at 60% volume.
2. The text changes to: `Probe added to STRIKER-A — active for next match` in teal.
3. A small "undo" link appears inline: `(remove)` — clickable for 5 seconds before fading to 30% opacity.
4. The Coroner's Slab header gains a small teal probe indicator next to the receiving agent's name, confirming the probe is attached.
5. In the signal genealogy behind the Slab panel, the receiving agent's node gains a subtle teal ring — the same "probed" indicator used in the Plan screen blueprints.

**The probe configuration is inferred, not manually specified.** The system auto-generates:
- **Target:** The receiving agent from the broken edge
- **Trigger ticks:** Drop tick +-2 (if the drop was at tick 34, the probe fires at ticks 32, 33, 34, 35, 36)
- **Capture scope:** Full buffer state (all slots, contents, priorities, ages), rule evaluation trace, hook trigger log

The player does not need to configure anything. One click. The probe is staged. The next match will capture data. This zero-configuration approach matches the transparency panel's probe suggestion (4.67) — both use inferred triggers based on the diagnostic context that prompted the suggestion.

### What the Player Gets Next Match

After running the next match, the player opens the debrief and finds the Probe Log timeline track (defined in 4.15). The track shows 5 markers — one for each tick in the +-2 window around tick 34 (or whatever tick the signal was dropped in the previous match). Each marker is clickable and opens the Probe Snapshot View:

- Full slot table (identical format to the Coroner's Slab, but from the new match)
- Rule evaluation trace at that tick
- Hook trigger events at that tick

If the player's fix worked — the buffer is no longer full at tick 34, the threat signal is received — the probe snapshot shows the improvement directly. The slot table has open slots, or the threat signal is present in one of them. The player can compare this to their memory of the Slab from last match (or, if they have cross-match probe comparison from 4.108, see them side by side).

If the fix did not work — the buffer is still full, or full of different junk — the probe snapshot shows the persisting problem, and the player iterates. The probe persists until manually removed, so subsequent matches continue capturing data at the same trigger ticks.

---

## Interaction with Adjacent Systems

### Interaction with 4.105 (The Coroner's Slab)

The probe suggestion is *part of* the Coroner's Slab, not an overlay or tooltip on top of it. It lives in the What-If Footer section, which is the Slab's "what do I do now?" action zone. The Slab's information flow is: (1) header strip identifies the dead signal, (2) slot table shows the buffer state, (3) contested slot highlight shows the eviction decision, (4) ghost row shows the corpse, (5) What-If Footer offers next steps. The probe suggestion is the third what-if — the one that bridges from "understanding this match" to "preparing for the next match."

The Slab's sequential Slab navigation (left/right arrows to cycle through multiple broken edges at the same agent) interacts with the probe suggestion: if the player clicks through five broken edges at Command between ticks 40-45, the probe suggestion appears on each one. But a single probe covering the +-2 window around tick 40 would also cover ticks 38-42, missing ticks 43-45. When the player is on the third broken edge (tick 43), the suggestion text adjusts: "Existing probe covers ticks 38-42. Extend to cover ticks 38-47? (no additional hook slot cost)" — the probe's trigger window expands to encompass all discovered drops. This automatic window expansion prevents the player from needing to add five separate probes for a single cluster of drops.

### Interaction with 4.66 (Signal Genealogy Cross-Tool Link)

The cross-tool link (4.66) allows clicking "active at tick 52" in the pre-ranking drawer to highlight the relevant node in the signal genealogy. When that highlighted node has broken edges, the player can click a broken edge to open the Coroner's Slab, which contains the probe suggestion. This creates a three-step diagnostic chain:

1. Pre-ranking drawer says "RELAY-C was active at tick 52" --> player clicks --> genealogy opens at tick 52
2. Genealogy shows broken edge at STRIKER-A, tick 53 --> player clicks --> Coroner's Slab opens
3. Slab shows full buffer, identifies the drop --> probe suggestion appears --> player clicks --> probe staged

The chain is: **assertion --> evidence --> autopsy --> instrumentation.** Four surfaces, four clicks, one continuous diagnostic narrative. The player never has to decide "what should I look at next?" — each surface points to the next.

### Interaction with 4.67 (Probe Suggestion from Transparency Panel)

Both 4.67 and 4.109 suggest probes. They can suggest probes for the same agent. When this happens, the system merges the probe configurations rather than creating duplicates. If the transparency panel suggests probing RELAY-C at the pivot-tick window (ticks 50-54) and the broken-edge panel suggests probing RELAY-C at the drop window (ticks 52-56), the merged probe covers ticks 50-56. The merge notification appears in both panels: "Probe merged with existing suggestion from [other panel name]. Window: ticks 50-56."

If the two suggestions target *different* agents (transparency panel suggests RELAY-C; broken edge suggests STRIKER-A), both probes are staged independently, each consuming one hook slot. The probe budget (4.107) governs whether both can be active simultaneously.

The two suggestion surfaces have different confidence profiles. The transparency panel's suggestion is probabilistic: "this element had high volatility, it *might* be worth probing." The broken-edge suggestion is deterministic: "this element dropped a signal, it *did* have a problem." Players who learn to distinguish these confidence levels — who understand that a broken-edge probe is higher-priority than a volatility-based probe — are learning to triage diagnostic resources. This is the "prioritize by evidence strength" skill that transfers directly to real incident response.

### Interaction with 4.107 (Probe Budget)

Early-game players have only 2 probe slots. If both are occupied and the player encounters a broken edge, the suggestion CTA is greyed out with the "Probe budget full" message. This creates a genuine resource decision: "Do I remove my existing probe on Scout-A to instrument Striker-B?" The scarcity is pedagogically deliberate — it teaches that observability has a cost and must be rationed. The broken-edge probe suggestion, being high-confidence ("we know there's a problem here"), helps the player make this triage decision: remove a speculative probe to add an evidence-based one.

---

## Strengths

### 1. Zero-Configuration Diagnostic Action

The probe suggestion requires exactly one click. No trigger condition to specify, no tick range to input, no capture scope to configure. The system infers everything from the context of the broken edge: which agent, which tick, what to capture. This is the "smart default" pattern — the game does the expert's work of configuring the instrument, letting the beginner benefit from expert-quality instrumentation without expert-level knowledge.

### 2. Closes the Diagnostic Loop

Without this feature, the diagnostic workflow dead-ends at the Coroner's Slab. The player understands the problem, makes a fix, runs a new match, and then must manually hunt through the genealogy to see if the fix worked. The probe suggestion creates a guaranteed observation point in the next match's debrief, closing the hypothesize-fix-verify loop that is the core rhythm of iterative engineering.

### 3. Teaches Proactive Instrumentation

The first time a player clicks the probe suggestion, they learn that probes exist and what they do — without a tutorial, without a manual, without a tooltip that explains the probe system in the abstract. They encounter the probe suggestion in the most motivating possible context: they just saw a signal die, they feel the frustration of a broken architecture, and the suggestion says "want to watch this spot next time?" The motivation-to-learn-the-tool is at its peak. This is the **"Need Before Tool"** pattern — the game creates the need first, then introduces the tool exactly when the need is sharpest.

### 4. Reinforces Receiver-Side Thinking

By always suggesting probes on the receiving agent, the feature consistently trains the player to think about attention management from the consumer's perspective. Over many matches, this builds the mental habit of asking "what is the receiver's buffer doing?" rather than "did the sender send the signal?" — a perspective shift that maps directly to real distributed systems debugging.

### 5. Natural Discovery Pathway for the Probe System

Many players will encounter the probe system for the first time through this suggestion. The broken edge is emotionally salient (their unit failed), the Slab is visually compelling (they just saw the buffer autopsy), and the suggestion is contextually perfect (they want to know if their fix works). This is a stronger discovery pathway than stumbling across the probe icon in the Plan screen blueprint, because the motivation is already present.

---

## Weaknesses

### 1. Probe Accumulation Without Cleanup

Players who click the probe suggestion on every broken edge they encounter will accumulate probes that persist across matches (probes are not auto-removed, per 4.15's design). After five matches of aggressive probe-clicking, a player might have probes on three different agents, each consuming a hook slot. The game does not currently prompt probe cleanup — the player must remember to remove probes they no longer need. This is intentional (teaches "don't leave debug logging in production") but may frustrate players who forget and wonder why their agents have reduced hook capacity.

**Mitigation:** A post-match prompt when a probe has been active for 3+ matches without the player viewing its data: "Probe on STRIKER-A has been active for 3 matches. Still needed? [Keep] [Remove]"

### 2. Over-Reliance on Probe Data Instead of Structural Fixes

The probe suggestion is so easy to click — one button, zero configuration — that some players may develop a pattern of "drop --> probe --> run match --> read probe --> drop at a different tick --> probe again" without ever making architectural changes. They use probes as a comfort blanket instead of a diagnostic tool. The probe data confirms the problem exists but the player does not act on it.

**Mitigation:** After the second consecutive match where a probed agent drops signals at the same tick range, the Probe Log surfaces a recommendation: "STRIKER-A has dropped signals in 2 consecutive matches at ticks 32-36. Consider reviewing buffer capacity or eviction policy." The recommendation links to the relevant configuration panel.

### 3. Trigger Window May Miss Shifted Drops

The auto-generated probe trigger is +-2 ticks around the drop tick from the previous match. If the player's config change causes the drop to shift in time (the signal now arrives at tick 28 instead of tick 34), the probe window (ticks 32-36) misses it entirely. The player sees clean probe data and concludes the fix worked, when in reality the same pathology moved to a different tick.

**Mitigation:** The probe suggestion footer includes a small note: "Probe captures ticks 32-36. If your config change affects signal timing, the drop may shift outside this window. Consider a full-match probe for comprehensive coverage." A "full-match" option (probe fires every tick, not just the window) is available as a secondary button, at higher probe budget cost.

### 4. Interaction Complexity with Multiple Broken Edges

When a single agent has many broken edges (Danilo's scenario: Command dropping 5 signals in ticks 40-45), the probe window expansion logic ("extend to cover ticks 38-47?") adds UI complexity. The player must understand that the probe window is being merged, that it covers a range rather than a single tick, and that it still costs only one hook slot. This merging behavior may be opaque to beginners.

**Mitigation:** The expansion prompt includes a micro-visualization — a small number line showing the existing probe window (teal segment) and the proposed extension (teal dashed segment extending rightward). Visual representation makes the merge legible without requiring the player to parse text.

### 5. The "Autopilot Probing" Anti-Pattern

If probe suggestions appear on every broken edge and the player habitually clicks them, probing becomes reflexive rather than deliberate. The player stops reading the Slab's slot table, stops analyzing the eviction verdict, and goes straight to the probe button. The diagnostic tool that was supposed to teach buffer management becomes a "skip understanding, just instrument it" shortcut.

**Mitigation:** The probe suggestion has a 2-second delay before becoming clickable. During those 2 seconds, the CTA is visible but desaturated (40% opacity), with text: "Reading buffer state..." The delay forces a minimum dwell time on the Slab — the player must look at the slot table for at least 2 seconds before the probe option activates. This is the **"Forced Gaze"** pattern — a micro-delay that ensures the diagnostic content is at least seen before the action is taken. The delay is short enough to avoid frustration but long enough to prevent zero-thought clicking.

---

## The TikTok Clip

The moment that would make a compelling 15-second clip: the player is in the signal genealogy, sees the broken edge pulsing red, clicks it. The Coroner's Slab slides open with the filing-cabinet sound. Camera zooms on the ghost row — the dead signal in faded red with the X. Then the player scrolls down to the probe suggestion, clicks it. The teal probe glyph fills in, the ascending chime plays, and the receiving agent's node in the genealogy behind the panel gains its teal ring. Cut to the next match's debrief: the player opens the Probe Log, clicks tick 34, and the slot table shows the threat signal alive in slot 6. The fix worked. Overlay text: "Set a trap. Caught the proof." The clip sells the diagnostic loop — problem found, instrument placed, verification achieved — in a visual story that reads without explanation.

---

## Player Journeys

#### Journey: Kenji, 19, CS Freshman
**Context:** Mission 8, "Double Relay." Kenji has been playing for two weeks and has a basic understanding of hooks and channels. He has never used a probe hook. His architecture has Scout-A feeding Relay-B, which forwards to both Striker-C and Striker-D. In the sealed watch, Striker-C engaged an enemy group at tick 28, but Striker-D — which was supposed to flank from the east — stood still and did nothing. Kenji is confused because both Strikers have identical configurations.

**Minute 0:00 — The Mismatch**
Kenji opens the signal genealogy in the post-match debrief. The "Signal River" shows four swim lanes. He can see arcs flowing from Scout-A to Relay-B (solid teal), then from Relay-B splitting into two paths: one to Striker-C (solid coral) and one to Striker-D. The Striker-D path is dashed. A red X sits at the terminus. Kenji hovers the broken edge. Tooltip: `Signal SIG-0212 (ENEMY_POSITION) from Relay-B dropped at Striker-D, tick 27. Click to inspect.` He has seen this tooltip format before in Mission 7's tutorial but never investigated it. The fact that Striker-C received the same signal type (he can see the solid arc to Striker-C at the same tick) while Striker-D did not makes the broken edge feel personally offensive. Same relay. Same signal. One lived, one died. He clicks.

**Minute 0:14 — First Slab, Fresh Eyes**
The Coroner's Slab slides in from the right. Filing-cabinet sound. Kenji reads the header: `SIG-0212 | Source: Relay-B | Channel: threat-net | Type: ENEMY_POSITION | Priority: NORMAL | Arrived: tick 27.` Below: `Receiving: Striker-D | Class: Striker | Buffer: 8/8 slots occupied.` The verdict: `DROPPED: buffer full. No evictable slot under FIFO policy.`

He looks at the slot table. Eight rows. Types: TERRAIN, TERRAIN, TERRAIN, FRIENDLY_POS, TERRAIN, AMBIENT_NOISE, TERRAIN, FRIENDLY_POS. Priorities: all LOW. Ages: +15t, +13t, +12t, +10t, +9t, +7t, +5t, +3t. The buffer is packed with ancient, low-priority noise. The ghost row below: ENEMY_POSITION, NORMAL, +1t, rendered at 50% opacity with a red X. Kenji stares at the contrast — a fresh, important signal blocked by a wall of stale terrain data.

He thinks: "Why is Striker-D full of terrain data? It shouldn't be listening to terrain." He checks Striker-C's configuration later and finds both Strikers are subscribed to `terrain-net`, `status-net`, and `threat-net`. But Striker-C happened to have processed some terrain data before tick 27 (its rules consumed and discarded old entries), while Striker-D's rules never triggered terrain processing, so the entries accumulated. Same config, different buffer states, because Striker-D was positioned in a quieter area and its rules never had reason to clear stale data. The asymmetry was environmental, not configurational.

**Minute 0:55 — The What-If Footer**
Kenji scrolls down past the ghost row. He sees the three what-if options. He clicks "What if this signal had arrived 1 tick earlier?" The genealogy scrubs to tick 26. The panel recalculates: `At tick 26, slot 7 was occupied (FRIENDLY_POS, +2t). Buffer still full. Signal would have been dropped.` Not helpful. He clicks "What if buffer had 1 more slot?" The virtual 9th slot appears with the signal alive in it. A dashed green border. But he knows the buffer is fixed at 8.

Then he sees the third option: `Add probe to STRIKER-D -- capture buffer state at next match.` He reads the detail line: `Trigger: tick 25-29 | Captures: all 8 buffer slots | Cost: 1 hook slot on STRIKER-D.` Kenji pauses. He has not used probes before. The phrase "1 hook slot" gives him pause — Striker-D only has 2 hook slots. But the CTA is sitting right there, in diagnostic teal, looking like the obvious next step after the autopsy he just read. He is still frustrated that Striker-D failed. He wants to know if his fix will work.

He clicks.

**Minute 1:08 — The Confirmation**
The probe glyph fills teal. The ascending two-note chime plays. The text updates: `Probe added to STRIKER-D -- active for next match.` In the genealogy behind the panel, Striker-D's node gains a subtle teal ring. Kenji exits the Slab, goes to the Plan screen, unsubscribes Striker-D from `terrain-net` and `status-net`. He notices the probe indicator on Striker-D's blueprint — a small teal magnifying glass consuming one of two hook slots. The empty slot where a channel hook could go has a dashed outline. He decides the diagnostic data is worth the temporary cost.

**Minute 3:00 — The Next Match**
Kenji runs Mission 8 again. In the sealed watch, both Strikers engage at tick 26. The mission succeeds. He opens the debrief and sees the Probe Log timeline track — a new row he has not seen before, with 5 small teal dots at ticks 25, 26, 27, 28, 29. He clicks tick 27. The Probe Snapshot opens: Striker-D's buffer has 3/8 slots occupied. Slot 0: ENEMY_POSITION, NORMAL, +1t. Slot 1: FRIENDLY_POS, LOW, +4t. Slot 2: COMMAND_OVERRIDE, URGENT, +0t. Five empty slots. The buffer that was 8/8 terrain junk last match is now 3/8 with the threat signal present. The fix worked. Kenji removes the probe, freeing the hook slot.

**What Kenji Learned:** Buffer overflow is caused by what you listen to, not how you process. Probes let you verify fixes across matches. The hook slot cost is temporary and worth it for confirmation. He will use probes again.

---

#### Journey: Amara, 34, Site Reliability Engineer
**Context:** Gauntlet match, Tier 3. Amara's architecture is a factory build: 12 agents, 3 scout clusters, 2 relay chains, 4 strikers, 1 command agent. She lost to an opponent running a signal-flood strategy — the enemy relays broadcasted high-volume noise on shared channels, deliberately polluting Amara's agents' buffers with junk data. EDT was tick 19 — devastatingly early. In the debrief, the signal genealogy looks like a war zone: 11 broken edges across 4 different agents between ticks 15-25. She has been in the Coroner's Slab three times already, confirming that the drops are caused by the opponent's noise flooding her buffers with low-priority garbage signals that arrive faster than her eviction policy can clear them.

**Minute 0:00 — Strategic Probe Placement**
Amara is on her fourth broken edge: Striker-A, tick 18, `ENGAGE_ORDER` from Command dropped. The Slab shows 8/8 slots occupied — 6 of them are `NOISE_BROADCAST` signals from the opponent's relay, all LOW priority, ages ranging from +1t to +4t. Her eviction policy is PRIORITY_THEN_AGE but the noise signals have the same LOW priority as her legitimate low-priority entries, so the eviction lottery is essentially random. The ENGAGE_ORDER was NORMAL priority but the buffer was already full and the eviction happened before the NORMAL signal could assert priority.

She sees the probe suggestion: `Add probe to STRIKER-A -- capture buffer state at next match. Trigger: tick 16-20 | Captures: all 8 buffer slots | Cost: 1 hook slot on STRIKER-A.`

Amara already has one probe active — on Command, from a transparency panel suggestion (4.67) two matches ago. She has 4 probe slots (Tier 3 budget). She clicks the CTA. Probe added. Then she navigates to the next broken edge: Striker-B, tick 20, same pattern. The probe suggestion appears again. She clicks. Third probe active.

She navigates to the fifth broken edge: Striker-C, tick 22. Same flood pattern. The probe suggestion appears but this time the trigger window text reads: `Trigger: tick 20-24.` She clicks. Fourth probe active.

She has now instrumented all four strikers and her command agent. Five probes, four budget slots used plus the one from the transparency panel. She returns to the Plan screen and makes her fix: she adds a channel filter to all four strikers that blocks signals from unknown sources (any agent not in her own squad). The filter consumes one rule slot per striker but should block the opponent's noise broadcasts.

**Minute 4:00 — The Verification Match**
She queues a rematch. In the next debrief, she goes straight to the Probe Log. Five timeline tracks, one per probed agent. She clicks Striker-A at tick 18. The snapshot: 4/8 slots occupied. Zero `NOISE_BROADCAST` entries. The channel filter worked. She clicks through Striker-B, Striker-C, Striker-D — all clean. Command's probe shows 9/14 slots, with the engage orders present and delivered. She removes all five probes, freeing the hook slots for the upcoming Gauntlet deployment (where probes would be auto-stripped anyway, but she prefers clean configs).

**What Amara Learned:** Probes from broken edges are stackable — she could instrument multiple agents simultaneously to verify a systemic fix. The probe budget forced her to be strategic about which agents to instrument (she chose all strikers because the flood affected all of them, not just one). The broken-edge suggestion was higher-confidence than the transparency panel suggestion — she knew exactly what she was looking for.

---

#### Journey: Tomasz, 42, Civil Engineer, Casual Player
**Context:** Mission 11, "The Bottleneck." Tomasz plays two matches per evening after his kids are in bed. He has a functional but unoptimized architecture — 6 agents, standard relay chain. His Relay-B is dropping signals intermittently. He opened the signal genealogy and found two broken edges at Relay-B in the same match. He clicked the first one and read the Coroner's Slab. He understood that the buffer was full but is unsure what to change. He has never used a probe.

**Minute 0:00 — Hesitation at the CTA**
Tomasz sees the probe suggestion at the bottom of the Slab. He reads: `Add probe to RELAY-B -- capture buffer state at next match. Trigger: tick 38-42 | Captures: all 12 buffer slots | Cost: 1 hook slot on RELAY-B.` He notices "1 hook slot" and frowns. Relay-B has 4 hook slots, all occupied with channel subscriptions. Adding a probe means losing a channel. He hovers the CTA. A tooltip appears: `RELAY-B has 4/4 hook slots occupied. Adding a probe requires freeing one slot. Click to choose which slot to free.`

He clicks. A small overlay appears showing Relay-B's four hook slots: `recon-net (in)`, `threat-net (in)`, `command-net (in)`, `relay-forward (out)`. Each has a small radio button. Tomasz thinks about which channel is least important. He selects `recon-net (in)` — the scout reconnaissance channel. The overlay confirms: `Recon-net hook will be temporarily replaced by probe. RELAY-B will not receive recon-net signals during next match.` He accepts.

**Minute 0:30 — The Tradeoff Sinks In**
The probe is active. The CTA shows the teal checkmark. But Tomasz is now worried — will removing the recon-net hook cause new problems? He decides to run the next match anyway and see what the probe data reveals. If the buffer data helps him fix the dropping issue, the one-match loss of recon-net is worth it.

**Minute 1:00 — Next Evening, Next Match**
Tomasz runs Mission 11 again the following evening. In the debrief, the Probe Log shows 5 markers on Relay-B's timeline (ticks 38-42). He clicks tick 40. The snapshot: 12/12 slots occupied. But wait — last match's Slab showed the same thing. He clicks tick 38. Snapshot: 10/12 slots. At tick 38, there was room. By tick 40, the buffer filled. He clicks tick 39: 12/12 slots. Between tick 38 and 39, two signals arrived simultaneously and filled the remaining slots. The probe's temporal resolution reveals something the single-tick Slab could not: the buffer goes from "has room" to "full" in a single tick because two signals arrive at the same moment.

Tomasz realizes the fix is not about eviction policy — it's about ingestion rate. Two simultaneous signals overflowed a buffer that had room for only one. He needs to stagger signal arrivals or increase buffer capacity. He adjusts the scout's emission timing to alternate between even and odd ticks, spreading the signal load. Next match: zero drops at Relay-B.

He removes the probe and reconnects the recon-net hook. The probe occupied the slot for exactly two matches — the diagnostic was surgical.

**What Tomasz Learned:** Probes reveal temporal dynamics that single-tick autopsies cannot. The hook-slot cost forced him to make a deliberate tradeoff, which made the probe data feel earned rather than free. The two-match diagnostic arc (install probe, run match, read data, fix, remove probe) became a repeatable pattern he uses for future issues.

---

## Comparable Games and Media

### Chrome DevTools "Preserve Log" Checkbox
When debugging a page that redirects or reloads, Chrome DevTools has a "Preserve log" checkbox that keeps the network/console log across navigations. The probe suggestion is analogous: the Coroner's Slab shows you data from *this* match, and the probe "preserves the log" into the *next* match. The gesture is the same — "I saw something interesting, don't lose it next time" — but the game's version is more targeted (you preserve logging for a specific agent at a specific time) rather than Chrome's blanket preservation.

### Wireshark Capture Filters
Wireshark lets you set capture filters before starting a packet capture: "only capture traffic on port 443" or "only capture packets involving IP 192.168.1.50." The probe suggestion pre-configures a capture filter for the next match: "only capture buffer state for STRIKER-A at ticks 32-36." The player is doing packet capture planning — deciding what to observe before the observation begins. The difference is that Wireshark requires manual filter syntax, while the game infers the filter from the broken edge context.

### DataDog's "Create Monitor from Query" Button
In DataDog's APM trace view, when you find an interesting trace, there is a "Create Monitor" button that converts the observation into a persistent alert. The broken-edge probe suggestion is this pattern: "you found an interesting failure, convert it into a persistent observation (probe) that will capture data if the failure recurs." The difference is that the probe captures data regardless of whether the failure recurs — it is an observation, not an alert.

### Factorio's "Show Bottleneck" Mod
Factorio's popular Bottleneck mod adds colored indicators to machines showing whether they are starved for inputs (red), blocked on outputs (yellow), or running normally (green). The probe suggestion is like manually placing a bottleneck indicator on a specific machine after you discover it is starved. The game could have made probes automatic (always-on, like the mod) but chose to make them manual and costly, because the act of choosing what to observe is part of the learning.

### Dwarf Fortress's "Legends Mode"
Dwarf Fortress's Legends mode lets you inspect the complete history of any entity in the generated world — every battle, migration, and artifact creation. The Coroner's Slab plus probe is a micro version of this: the Slab shows you the complete history of one signal's death, and the probe lets you request the complete history of one agent's buffer state in the next match. Both are tools for players who want to understand causality at the deepest level the system can provide.

---

## Sensory Description: The Full Interaction

### Visual

The probe suggestion CTA sits at the bottom of the Coroner's Slab, below the ghost row's red X. The visual progression from top to bottom is: **dark indigo header** (agent identity) --> **slate table rows** (buffer contents) --> **amber-highlighted contested slot** (the judgment) --> **50% opacity ghost row with red X** (the corpse) --> **teal-bordered probe CTA** (the next step). The color arc is deliberate: indigo (neutral information) --> amber (warning) --> red (failure) --> teal (action). The player's eye travels from understanding through alarm to resolution. The teal is the coolest, calmest color in the sequence — it says "here is what you can do about it."

When the player clicks the CTA, the teal probe glyph fills in with a smooth 200ms ease-in. The fill animation radiates outward from the center of the circle, like ink spreading on paper. The two-note chime is pitched at C5-E5 — a minor third, warm and confirmatory, distinct from the game's error sounds (which use dissonant intervals) and the Slab's filing-cabinet slide (mechanical, not tonal). The chime plays at 60% master volume — present but not startling.

Behind the Slab panel, the receiving agent's node in the signal genealogy gains a teal ring. The ring fades in over 400ms with a slow-breathing pulse (2-second cycle, 80%-100% opacity). This pulse persists as long as the Slab is open, creating a visual connection between the panel (foreground, detailed) and the genealogy (background, contextual). When the Slab closes, the ring remains on the node — it is now part of the genealogy's visual state, indicating "this agent is probed."

### Audio

The Slab's ambient sound is a low, steady hum — like the tone of a fluorescent light in a morgue. It plays at 15% volume, barely perceptible, but contributes to the Slab's clinical atmosphere. When the probe CTA activates (after the 2-second "Forced Gaze" delay), a subtle click sounds — like a diagnostic cable being connected. Then the two-note chime on click. The audio arc matches the visual arc: clinical observation (hum) --> mechanical readiness (click) --> confirmed action (chime).

### Tactile (Controller Vibration)

On gamepad: when the Slab opens, a very faint low-frequency rumble (10% intensity, 300ms) — the drawer sliding. When the probe CTA becomes clickable after the 2-second delay, a single micro-pulse (5% intensity, 50ms) — a gentle tap indicating the button is now active. On probe click, a medium pulse (30% intensity, 150ms) ascending to 0% — the sensation of something locking into place.

### The "Forced Gaze" Delay in Detail

The 2-second delay before the CTA becomes clickable is visually marked: the CTA starts at 40% opacity with the text "Reading buffer state..." in italicized light grey. Over 2 seconds, the opacity ramps from 40% to 100% in a linear interpolation. The teal left border animates from bottom to top — a thin line drawing upward like a loading bar. At 100%, the text snaps from italic grey to regular teal, the border completes, and the CTA is clickable. A micro-pulse on gamepad. The animation communicates "this option is loading" without lying — it is not loading anything, it is enforcing a minimum read time. But the visual framing makes the wait feel purposeful rather than arbitrary.

---

## Named Patterns

| Pattern | Description | Where It Appears |
|---------|-------------|-----------------|
| **Scene-of-Crime Instrumentation** | After diagnosing a failure at a specific location, instrumenting that location for future observation | The probe suggestion itself — placing a diagnostic tap at the exact point where a signal died |
| **Need Before Tool** | Introducing a game mechanic only when the player has a concrete need for it | First probe encounter via broken edge — the player wants to verify their fix before learning what probes are |
| **Forced Gaze** | A micro-delay before an action becomes available, ensuring the player sees the diagnostic content first | The 2-second opacity ramp before the probe CTA is clickable |
| **Diagnostic Loop Closure** | A mechanic that connects the observation of a problem to the verification of a fix across sessions | The broken-edge probe captures data at the same tick in the next match, enabling before/after comparison |
| **Confidence Gradient** | Different diagnostic surfaces suggest probes at different confidence levels | Transparency panel (inferential, "might be interesting") vs. broken edge (deterministic, "this failed") |
| **Autopilot Prevention** | Design friction that prevents a diagnostic action from becoming reflexive and unthinking | The Forced Gaze delay, the hook-slot cost, the probe budget limit |
| **Window Expansion** | Automatically merging probe trigger windows when multiple broken edges cluster at the same agent | Sequential Slab navigation extending probe coverage from tick 38-42 to tick 38-47 |
| **Receiver Responsibility** | Consistently directing diagnostic attention to the consumer (buffer owner) rather than the producer (signal sender) | The probe always targets the receiving agent, reinforcing that attention management is the receiver's job |