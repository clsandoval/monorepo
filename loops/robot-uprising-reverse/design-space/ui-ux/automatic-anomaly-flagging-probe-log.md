# 4.110 — Automatic Anomaly Flagging in Probe Log

## Aspect Definition

When a probe snapshot contains buffer state that is statistically unusual compared to the same agent at the same tick across the last 5 matches, the snapshot marker in the Probe Log gets a "⚠ unusual state" indicator. This reduces manual scanning burden for high-frequency probes generating many snapshots and teaches anomaly detection as a workflow step.

---

## 1. The Mechanic — How It Works

### Core Loop

The Probe Log is a horizontal timeline of snapshot markers — small dots or diamonds representing moments where a probe fired and captured the full buffer state of an agent. With high-frequency probes (every tick on an 8x8 grid where matches can run 60-200+ ticks), a single agent can generate hundreds of snapshots. Scrolling through each one manually is tedious and error-prone. The anomaly flagging system automates the first pass of triage.

### Statistical Comparison Model

After each match completes, the system performs a per-agent, per-tick comparison against the historical record:

1. **Window**: The last 5 completed matches where that agent configuration was deployed. The system tracks agent identity by build hash — if the player changes a single skill or rule, the history resets (or optionally carries forward with a "config drift" notation).
2. **Comparison vector**: For each tick where a probe fired, the system constructs a buffer state fingerprint. This fingerprint captures:
   - **Slot occupancy**: How many context window slots are filled vs. empty.
   - **Content category distribution**: What proportion of the buffer is tactical data, hook messages, skill outputs, stale entries, etc.
   - **Staleness profile**: The age distribution of buffer entries (how many ticks old each entry is).
   - **Channel activity**: Which hook channels have written to the buffer since the last probe, and how many messages.
   - **Priority inversion count**: How many times a lower-priority entry displaced a higher-priority one due to overflow.
3. **Anomaly threshold**: The system computes a simple z-score for each dimension of the fingerprint against the 5-match historical mean for that tick. If any single dimension exceeds **2 standard deviations**, or if the composite distance (Euclidean across normalized dimensions) exceeds **1.5 standard deviations**, the snapshot is flagged.
4. **Edge cases**:
   - If fewer than 3 historical matches exist, no flags are shown (insufficient data). A subtle "building baseline..." label appears on the Probe Log header.
   - If a match diverges wildly from history early (e.g., the opponent plays a completely different build), most snapshots after the divergence point will flag. The system groups consecutive flags into "anomaly runs" and collapses them into a single expandable region to prevent flag fatigue.
   - Tick alignment is exact — tick 47 compares to tick 47 in prior matches. If a match ends earlier than history (agent died sooner), the missing ticks show as "no data" ghosts rather than anomalies.

### Flag Presentation

A flagged snapshot marker transforms visually:

- **Unflagged marker**: A small, muted dot (4px) on the timeline, colored by agent identity.
- **Flagged marker**: The dot grows to 8px, gains a pulsing amber outline, and a small "⚠" glyph appears above it. The amber is not red — it's a caution signal, not an error. The system is saying "this is worth looking at," not "this is broken."
- **Anomaly runs** (3+ consecutive flags): The individual dots merge into an amber-highlighted region on the timeline with a single "⚠ ×N" label, where N is the count. Clicking expands back to individual markers.

### What the Player Sees When They Click a Flag

Opening a flagged snapshot shows the standard buffer state view — the grid of context window slots with their contents — but with an additional **anomaly overlay**:

- Slots whose contents are statistically unusual are highlighted with a thin amber border.
- A small **"vs. history"** toggle in the corner lets the player split-screen the current snapshot against the historical median for that tick. The median view is a composite: slots show the most common content category, with a confidence bar showing how consistent that slot was across the 5 matches.
- A one-line natural-language summary appears at the top: e.g., "Buffer is 40% stale entries (historical avg: 12%)" or "Hook channel 'threat-alert' has 0 messages (historical avg: 3.2)."

### Teaching Dimension

This mechanic teaches anomaly detection as an engineering workflow concept. In production AI systems, operators don't manually inspect every inference — they set up monitoring that flags statistical outliers. The Probe Log anomaly system is a concrete, visual, interactive version of that same pattern. Players internalize that:

- You need a baseline before you can detect anomalies (the 5-match window).
- Not every anomaly is a problem — some are just the agent adapting to a novel situation.
- The value is in reducing the search space, not in providing answers.
- Configuration changes invalidate your baseline (the build hash reset).

---

## 2. Player Journeys

#### Journey: Marcus, 28, Backend Engineer

**Context:** Marcus has been iterating on a "relay guardian" agent for 12 matches. His agent protects relay chains by monitoring threat channels and repositioning. He's noticed the agent sometimes "freezes" in late-game situations — stops repositioning even when threats are nearby — but can't figure out why. He's running a high-frequency probe (every tick) on the guardian, generating 140+ snapshots per match.

**Minute 0:00 — The Wall of Dots**
Marcus finishes a Sealed Watch match. His guardian froze again around tick 95. He opens the Inspector and navigates to the Probe Log. The timeline stretches across the bottom of the screen: 143 small dots in his agent's teal color. He's done this before — scrolled through dozens of snapshots trying to find the moment the agent's behavior changed. Last time it took him 20 minutes and he wasn't even sure he found the right tick.

**Minute 0:15 — The Amber Cluster**
But today, something is different. Around tick 88-96, eight dots have transformed. They pulse with amber outlines, and a collapsed region reads "⚠ ×8." The rest of the timeline is clean — 135 unremarkable dots, 8 flagged ones. Marcus feels a spike of recognition. That's exactly the window where the freeze happened. He didn't have to scan. The system scanned for him.

**Minute 0:30 — Expanding the Run**
He clicks the "⚠ ×8" region. It fans out into 8 individual flagged markers. He clicks tick 88, the first flag. The buffer state view opens with the anomaly overlay. Three slots have amber borders. The summary line reads: "Buffer is 92% stale entries (historical avg: 34%). Hook channel 'threat-repositioning' has 0 new messages (historical avg: 1.8)."

**Minute 1:00 — The Split-Screen Revelation**
Marcus toggles "vs. history." The left panel shows the current buffer: almost entirely stale tactical data from 15+ ticks ago, with no fresh threat channel input. The right panel shows the historical median: a healthy mix of fresh threat data, recent repositioning commands, and only 30% stale entries. The contrast is stark. Something is preventing new data from entering the buffer.

**Minute 1:30 — Diagnosis**
Marcus checks the agent's context window size — 8 slots. He traces backward to tick 85 (unflagged). The buffer there looks normal. At tick 86 (unflagged but borderline — the z-score was 1.4), a burst of hook messages from two channels arrived simultaneously, filling all 8 slots. By tick 88, all those entries are aging, but the agent's skill priority rules are keeping them because they're tagged "high priority." Fresh threat data can't displace them. It's a priority inversion causing buffer stagnation.

**Minute 2:30 — The Fix**
Marcus returns to the Plan screen, adds a staleness decay rule: entries older than 5 ticks lose one priority level per tick. He queues another match. This time, the Probe Log shows zero flags. The guardian repositions smoothly through late-game. Marcus grins. He found in 2 minutes what used to take 20.

**Minute 3:00 — The Insight**
Marcus realizes he's just implemented a TTL (time-to-live) policy — the same pattern he uses in Redis caches at work. The anomaly flags didn't tell him the answer, but they told him exactly where to look. He thinks: "This is how monitoring should work."

---

#### Journey: Priya, 34, Data Scientist

**Context:** Priya is running a coordinated squad of three agents connected via hook channels. She's been refining the build over 7 matches. She sets up probes on all three agents at every-other-tick frequency. After her latest match (a loss), she opens the Inspector expecting to see anomaly flags on her forward scout (the agent that died first).

**Minute 0:00 — The Wrong Agent**
The Probe Log loads with three parallel timelines (one per agent). Priya's eyes go to the scout's timeline — clean. No flags. She blinks. Then she notices: the flags are on her *commander* agent. A cluster of 5 amber markers around ticks 30-38, plus two isolated flags at ticks 52 and 67.

**Minute 0:20 — Questioning the System**
Priya's first instinct is skepticism. The commander didn't die — the scout did. Why is the commander flagged? She clicks tick 30. The summary reads: "Hook channel 'squad-orders' has 6 outbound messages (historical avg: 1.4). Buffer contains 0 inbound acknowledgments (historical avg: 2.8)." The commander was screaming orders into the void. Nobody was acknowledging.

**Minute 0:50 — The Cascade**
She clicks tick 34. "Buffer slot occupancy: 8/8 (historical avg: 5.2). All slots contain outbound queue overflow." The commander's buffer was completely clogged with unsent orders because the hook channel was backed up. She switches to the scout's timeline — no flags, because the scout's behavior was *normal for a scout that's not receiving orders*. The anomaly was upstream.

**Minute 1:20 — Cross-Agent Correlation**
Priya opens the split-screen on tick 34. Historical median shows the commander with 3 outbound orders, 2 acknowledgments, and 3 tactical awareness slots. Current shows 8 outbound orders, 0 acknowledgments, 0 tactical awareness. The commander had no situational awareness because its entire context window was consumed by order queue overflow. It wasn't commanding — it was buffering.

**Minute 2:00 — Root Cause**
She traces backward. At tick 28 (unflagged), the scout moved out of hook range for the 'squad-orders' channel. Messages started queuing. The commander's rules didn't have a "channel unreachable" fallback — it just kept generating orders, filling its own buffer. The scout, meanwhile, was operating on stale orders and walked into a trap.

**Minute 2:45 — The Design Lesson**
Priya adds a rule to the commander: "If acknowledgment count drops to 0 for 3 consecutive ticks, pause order generation and allocate buffer to tactical awareness." She also adds a "channel health" skill that monitors message round-trip. She recognizes the pattern from distributed systems: backpressure. The anomaly flags didn't just help her debug — they helped her see a *system-level* failure that manifested in a non-obvious agent.

**Minute 3:30 — The Appreciation**
Priya reflects that without the flags, she would have spent all her time analyzing the scout (the agent that died) and never looked at the commander. The anomaly detection redirected her attention to the actual point of failure. She thinks about how this parallels her work: when a model prediction fails, the root cause is often in the data pipeline, not the model.

---

#### Journey: Tomás, 16, High School Student and Competitive Gamer

**Context:** Tomás is new to Robot Uprising (3 matches played). He's running a single melee agent with a simple "attack nearest enemy" skill. He just unlocked probes and set one to fire every 5 ticks on his agent. He has no idea what anomaly detection means.

**Minute 0:00 — The Gray Label**
Tomás finishes his 3rd match and opens the Probe Log for the first time with the probe active. He sees 24 snapshot dots along the timeline. At the top of the Probe Log, a subtle gray label reads: "Building baseline... (3/5 matches)." There are no amber flags. He doesn't really notice the label — he's busy clicking random snapshots to see what the buffer looks like.

**Minute 1:00 — Exploring Raw Snapshots**
He clicks tick 20. Sees his agent's buffer: 4 slots, containing [nearest enemy position], [attack skill output], [movement vector], [empty]. He clicks tick 40: [nearest enemy position], [attack skill output], [movement vector], [stale: damage received tick 35]. He notices the "stale" tag but doesn't know what to do with it. He clicks through a few more, gets bored. The snapshots all look similar. He closes the Inspector.

**Minute 2:00 — Two Matches Later (Match 5)**
Tomás has played two more matches with the same build. He opens the Probe Log after match 5. The gray "building baseline" label is gone. Most of his 22 snapshots are clean dots. But three are flagged — ticks 35, 40, and 45, right before his agent died at tick 48. The amber pulse catches his eye immediately.

**Minute 2:15 — The Warning Triangle**
He hovers over the ⚠ on tick 35. A tooltip reads: "Unusual: buffer 75% stale (usually 12%)." He clicks it. The buffer view opens — 3 of 4 slots contain entries tagged "stale" with ages of 8, 12, and 15 ticks. The one-line summary says: "Buffer is 75% stale entries (historical avg: 12%)." He doesn't fully understand z-scores, but he understands "your agent's memory was full of old junk when it usually isn't."

**Minute 2:45 — The Aha Moment**
Tomás clicks the "vs. history" toggle. Left side: stale, stale, stale, attack output. Right side: fresh enemy position, fresh attack output, fresh movement vector, empty. The visual contrast is obvious even without statistical literacy. His agent's working memory was clogged. He thinks: "Oh, it forgot where the enemy was because it was remembering old stuff." This is his first intuition about context window management, and he got it from a visual comparison, not a lecture.

**Minute 3:15 — The Attempted Fix**
He goes to the Plan screen and looks at his agent's rules. He sees there's no eviction rule — nothing tells the agent to drop old entries. He doesn't know exactly what to add, but he opens the skill shop and finds "Memory Hygiene: drop entries older than N ticks." He adds it with N=4 and queues another match.

**Minute 4:00 — Match 6 — Validation**
After match 6, the Probe Log shows zero flags. Tomás pumps his fist. He doesn't know the words "anomaly detection" or "TTL eviction policy," but he's just implemented both. The flag system guided him from "something is wrong" to "here's where it went wrong" to "here's what my agent's memory should look like" without requiring him to understand the underlying statistics.

---

## 3. Strengths and Weaknesses

### Strengths

**The Haystack Reducer.** The primary value proposition is brutal and clear: instead of scanning 140 snapshots, you scan 8. For high-frequency probes, this transforms the Probe Log from an unusable data dump into a focused diagnostic tool. The ratio of signal to noise improves by an order of magnitude.

**The Attention Redirector.** As Priya's journey demonstrates, the flags don't just reduce volume — they redirect attention to the *right* agent and the *right* tick. Without flags, players default to analyzing the agent that failed most visibly (the one that died). With flags, they analyze the agent with the most unusual behavior, which is often the actual root cause. This is a profound shift in diagnostic strategy.

**The Baseline Teacher.** The 5-match window requirement teaches that anomaly detection needs a baseline. Players learn that you can't flag unusual behavior until you know what usual behavior looks like. The "building baseline..." label makes this explicit. When players change their build and the baseline resets, they experience the cost of configuration drift on monitoring — a real-world production concern.

**The Vocabulary Builder.** The one-line summaries ("buffer 75% stale, historical avg 12%") give players language for buffer states they could previously only see. "Stale entries," "channel activity," "priority inversion" — these terms appear in context, attached to specific visual states, making them learnable without a glossary.

**The Graduated Disclosure.** Tomás's journey shows the system working for a player who doesn't understand statistics. The amber color, the tooltip, the visual comparison — these are all pre-statistical entry points. The z-scores and standard deviations exist in the underlying model but never appear in the UI unless the player digs into an advanced panel. The mechanic teaches the *concept* of anomaly detection without requiring the *math*.

### Weaknesses

**The False Positive Tax.** When an opponent plays a radically different strategy, the player's agents will behave differently, and many snapshots will flag as anomalous. These are "true anomalies" statistically but "false positives" diagnostically — the agent is behaving unusually because the situation is unusual, not because something is wrong. The anomaly run collapsing helps, but players will still learn to distrust flags after a few matches against novel opponents. **Mitigation:** The system could distinguish "agent-side anomalies" (unusual buffer management given the inputs) from "situation-side anomalies" (unusual inputs), but this adds complexity.

**The Cold Start Problem.** 5 matches is a significant investment before the system activates. For a new build, the player must play 5 matches blind before getting any anomaly assistance. This is realistic (you need data to detect anomalies) but frustrating. **Mitigation:** The system could offer a "population baseline" mode that compares against aggregate statistics for similar agent archetypes, accepting lower precision for earlier activation.

**The History Fragility.** The build hash reset means any configuration change — even a minor parameter tweak — wipes the baseline. A player iterating quickly (changing their build every match) will never accumulate enough history for flags to activate. This is architecturally correct (a different build is a different agent) but creates a perverse incentive to stop iterating so your monitoring works. **Mitigation:** A "fuzzy history" mode that carries forward partial baselines for builds with >80% similarity, with reduced confidence thresholds.

**The Overfit Risk.** 5 matches is a small sample. If a player happens to play 5 matches against the same opponent type, the baseline will be narrow, and any match against a different opponent will generate flag floods. The system could overfit to a specific competitive context. **Mitigation:** Weight recent matches more heavily but include up to 10 matches in the window if available, with diminishing weight.

**The Passive Consumption Trap.** The flags do the work of scanning, which means players might stop looking at unflagged snapshots entirely. If the statistical model misses a subtle issue (one that doesn't exceed the threshold), the player will never find it because they've been trained to only click amber markers. The system could create a learned helplessness where players can't diagnose issues without flags. **Mitigation:** Occasionally highlight an unflagged snapshot with a "looks normal — verify?" prompt to keep manual inspection skills active.

---

## 4. Interaction Effects with Other Systems

### With the Sealed Watch (No-Pause Battle)

The Sealed Watch prevents mid-battle intervention, making post-battle analysis the only diagnostic window. Anomaly flags dramatically increase the value of that window by front-loading the triage work. Without flags, the Sealed Watch's "no pause" constraint makes high-frequency probes counterproductive (more data but no more time to analyze). With flags, high-frequency probes become the optimal strategy: capture everything, let the system surface what matters.

### With Probe Frequency Configuration

Players currently face a trade-off: high-frequency probes capture more data but create more scanning burden. Anomaly flags break this trade-off — the scanning burden is now constant regardless of probe frequency (you only look at flags). This shifts the meta toward always-on, every-tick probes, which is both realistic (production monitoring typically captures everything) and potentially problematic (it removes a meaningful design choice about probe granularity). **Counter-argument:** The choice shifts from "how often to capture" to "what to capture" — players still choose which agents and which buffer dimensions to probe.

### With the Inspector Post-Battle Analysis

The Inspector already provides aggregate statistics and replay scrubbing. Anomaly flags add a *directed entry point* into the Inspector: instead of starting from the replay and scrubbing to find interesting moments, players start from flagged probes and scrub outward to understand context. This inverts the analysis workflow from exploratory to targeted, which is faster but potentially narrows the player's view. The Inspector's other tools (heatmaps, channel activity graphs) remain valuable for understanding the context around a flag.

### With Hook Channel Architecture

Anomaly flags on hook channel activity create a secondary monitoring layer for inter-agent communication. If a hook channel suddenly goes silent (0 messages when the historical average is 3), the flag surfaces a coordination failure that might not be visible in any single agent's behavior. This makes the anomaly system a *distributed systems debugger* — it detects failures in the spaces between agents, not just within them. This interaction is the mechanic's deepest teaching moment: monitoring individual components isn't enough; you need to monitor their connections.

### With Context Window Size

Agents with smaller context windows will flag more often because buffer pressure events are more dramatic — going from 3/4 slots stale to 4/4 stale is a 33% swing, while going from 6/8 to 8/8 is a 25% swing. This means the anomaly system implicitly penalizes small context windows by generating more noise. Players might size up their context windows partly to reduce flag volume, which is an interesting emergent meta-consideration.

### With Match History Tracking

The 5-match window leverages the existing match history system. This creates a feedback loop: the more matches you play with a stable build, the better your anomaly detection becomes. This rewards consistency and patience — thematic virtues in a game about engineering stable systems. It also means the anomaly system is a *reason to play more matches with the same build*, increasing engagement depth per build rather than encouraging constant build churn.

---

## 5. Comparable Games and Media

**Grafana / Datadog Alerting.** The most direct real-world analogue. Production monitoring dashboards use statistical thresholds to flag unusual metrics. The Probe Log anomaly system is essentially a Grafana alert rule applied to agent buffer state. The 2-sigma threshold, the historical window, the one-line summary — all of these have direct production monitoring counterparts. The game is teaching players to be SREs for their AI agents.

**Kerbal Space Program — Mission Log.** KSP's flight log records events during missions. Experienced players learn to scan the log for anomalies (unexpected staging events, attitude changes). Robot Uprising automates this scanning. The parallel is in the "post-flight analysis" workflow: you can't intervene during the mission (Sealed Watch), so the log is your only diagnostic tool.

**Football Manager — Match Analysis.** FM's post-match analysis highlights statistical anomalies in player performance (unusual number of lost possessions, abnormal heat maps). Coaches use these flags to identify tactical failures. The anomaly flagging system works identically: statistical deviation from established baseline triggers visual highlighting for the "coach" (player) to investigate.

**Chess Engines — Evaluation Spikes.** When analyzing a chess game with an engine, sudden jumps in the evaluation score flag moments where a critical mistake or brilliant move occurred. Players learn to jump to these spikes rather than analyzing every move sequentially. The amber flag serves the same function: it marks moments of phase transition in the agent's internal state.

**Factorio — Production Alerts.** Factorio lets players set alerts when production rates deviate from targets. The anomaly system is an automatic version of this: instead of manually setting thresholds, the system learns them from history. Factorio players who transition to Robot Uprising will immediately recognize the pattern.

**Medical Monitoring — ICU Alarms.** Hospital ICU monitors flag vital signs that deviate from patient baselines. The system accepts that false positives are preferable to missed events. Robot Uprising's anomaly system adopts the same philosophy: it's better to flag 3 false positives than to miss the one true anomaly that explains why your agent died.

---

## 6. Sensory Design

### Visual Language

**Unflagged snapshot markers:** 4px circles in the agent's identity color (teal, coral, slate, etc.), 60% opacity, no animation. They form a calm, regular rhythm along the timeline — a visual heartbeat of normal operation.

**Flagged snapshot markers:** 8px circles, same identity color at 100% opacity, with a 2px amber (#D4A017) outer ring that pulses gently — a slow breathe animation, 2 seconds per cycle, opacity oscillating between 60% and 100%. The ⚠ glyph above is rendered in the same amber, 10px, static (not animated — the pulse on the dot is enough). The overall effect is a warm caution glow, not an aggressive alarm.

**Anomaly run regions:** When 3+ consecutive flags collapse, the individual dots are replaced by a horizontal amber band (12px tall, same #D4A017 at 15% opacity fill, 100% opacity 1px border). The "⚠ ×N" label sits centered above the band in 11px monospace, amber text. The band has rounded corners (4px radius). Hovering the band raises its fill opacity to 30% and shows a tooltip: "N consecutive unusual snapshots — click to expand."

**The "vs. history" split-screen:** Current buffer state on the left, historical median on the right, separated by a thin vertical divider. The historical median slots use a desaturated, slightly transparent version of their normal colors — a ghostly "expected state." Slots that differ significantly between current and historical get a connecting amber dashed line drawn between them across the divider, creating a visual "diff" effect.

**The one-line summary:** Appears in a slim amber-tinted bar (background: #D4A017 at 8% opacity) above the buffer view. Text is 13px, regular weight, dark charcoal. The anomalous metric is **bolded**: "Buffer is **75% stale entries** (historical avg: 12%)."

**The "building baseline" label:** Rendered in 11px, 50% opacity gray, italic. Positioned in the Probe Log header, right-aligned. Format: "Building baseline... (3/5 matches)". A thin progress bar (2px tall, gray) fills proportionally beneath it. This is deliberately understated — it's informational, not actionable.

### Animation

**Flag appearance on Probe Log load:** When the Probe Log first renders after a match, all markers appear simultaneously as unflagged dots. After a 400ms pause (long enough for the player to see the raw timeline), flagged markers animate: they scale up from 4px to 8px over 200ms (ease-out), the amber ring fades in over 300ms, and the ⚠ glyph drops down from above over 200ms (ease-out-back, slight overshoot). The staggered reveal creates a "the system found something" moment — a small dramatic beat.

**Anomaly run collapse:** If flags are close enough to form a run, the individual flag animations play first, then after 600ms the dots slide together and merge into the band with a smooth 300ms morph. The player briefly sees the individual flags before they consolidate, reinforcing that the band represents multiple snapshots.

**Split-screen transition:** Toggling "vs. history" slides the current buffer view to the left and reveals the historical median sliding in from the right, with the divider line drawing itself top-to-bottom over 200ms. The amber diff lines draw in one by one (50ms stagger), creating a "connecting the dots" effect.

### Sound Design

**Flag pulse:** A soft, periodic tone synced to the amber pulse animation — a clean sine wave at 440Hz (A4), 50ms duration, very low volume (15% of UI sound level), with a gentle fade-in/out. It plays only when the Probe Log first loads and flags are visible, not continuously. The effect is a quiet "ping" that draws attention without alarming. If multiple flags are present, only one ping plays (not one per flag).

**Anomaly run collapse:** A soft descending chime — three notes (C5, A4, F4) over 400ms at 20% volume. The descending pitch suggests consolidation, compression, gathering.

**Clicking a flagged marker:** A slightly brighter version of the standard snapshot-open sound, with a subtle amber-frequency warmth (additional harmonic layer at 220Hz). The difference from an unflagged click is subliminal — the player feels rather than hears that this snapshot is different.

**"vs. history" toggle:** A clean stereo pan effect — a soft tone that sweeps from center to left (current buffer) then center to right (historical median) over 300ms. Reinforces the spatial metaphor of the split-screen.

### The TikTok Clip

The clip-worthy moment is the **flag appearance animation** after a frustrating loss. The player opens the Probe Log expecting a wall of identical dots. The 400ms pause builds tension. Then the amber flags bloom — 3, 5, 8 of them, pulsing gently amid 130 calm dots. The camera would zoom on the player's face as they realize the system already found the problem. Cut to the split-screen revealing a clogged buffer vs. a healthy one. The contrast is visually striking and immediately legible even to viewers who don't play the game. The narrative is universal: "I was looking for a needle in a haystack, and the game told me exactly where it was."

The secondary clip moment is when a player like Priya discovers the flags are on the *wrong agent* — the one she wasn't suspicious of. That misdirection-and-revelation arc is inherently compelling. "Wait, the problem isn't where I thought it was" is a story beat that works in any context.
