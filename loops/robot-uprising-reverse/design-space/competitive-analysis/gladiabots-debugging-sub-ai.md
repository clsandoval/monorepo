# Gladiabots — The Debugging Sub-AI Pattern

**Aspect:** 1.06a — The debugging sub-AI pattern: community-developed diagnostic layer; how Robot Uprising designs this in from the start; the always-on diagnostics sidebar in a workbench-native implementation
**Source game:** Gladiabots (GFX47 / Sébastien Dubois)
**Category:** Competitive Analysis → Community-Developed Practice → Design Implication

---

## What It Is

The **debugging sub-AI** is the most important community-developed practice in Gladiabots. It wasn't designed by the developer. It emerged from player frustration, got documented on the community wiki, and became standard practice at intermediate and expert tiers.

**Mechanically:** Create a separate AI named something like `DEBUG_SN` (debug, sniper class). Populate it exclusively with **condition nodes** — no action nodes at all. Configure each condition to sense the things you most need to understand: own health/shield, enemy bot classes at various ranges, whether any ally is under attack, whether a tagged target still exists. Link this debug sub-AI as the **very first node** evaluated from root in your main AI.

**Why it doesn't break anything:** Because the sub-AI has zero action nodes, the traversal enters it, evaluates all conditions (lighting them green or red in the debugger overlay), then **backtracks without committing to any action**. The main AI's logic executes normally below. The debug sub-AI is a **read-only probe inserted at the head of the evaluation chain**.

**What it shows:** In the debugger overlay during replay, the debug sub-AI's conditions light up green (this sensory condition is currently true) or red (false) **before any decision is made**. You can read the bot's entire sensing state at the moment of decision, separated from the cluttered logic of the actual decision tree below.

This solves a specific problem: the game's last-turn data delay (agents act on a frozen snapshot from 0.025 seconds ago) combined with a complex tree makes it very hard to answer the question *"did the bot fail to sense the thing, or did it sense the thing and still pick the wrong branch?"* The debug sub-AI isolates sensing from deciding.

---

## Why It Exists: The Underlying Problem

Gladiabots's debugger overlay is excellent — green/red/translucent nodes, colored lines from bots to their current targets, step-through tick navigation. But it has a structural problem: **sensing and deciding are entangled in the same tree**.

When your sniper fails to retreat during a match, you watch the replay and see:
- The retreat condition node is RED
- But why? Did the bot not sense low health? Or did it sense low health but the condition fires only when health < 20% and it was at 22%?

The overlay shows *which* nodes fired. It doesn't show *why* the conditions evaluated false. You have to mentally trace backward through the tree while the match plays — a difficult simultaneous cognitive load.

The debug sub-AI solves this by **extracting the sensing layer and putting it first**. Now you watch the debug conditions light up (green: health sensed below threshold / red: health not below threshold) before any decision branch runs. The sensing state is legible before any decision noise interferes.

The community discovered this because **the game forced them to**. Expert trees can grow to 200+ nodes with 5+ sub-AI modules. Without the diagnostic layer, debugging a non-deterministic-seeming failure (actually caused by a threshold that was off by 5%) could take an hour. With it: thirty seconds.

---

## The Bigger Design Gap This Reveals

The debugging sub-AI is a **diagnostic layer that the game required but didn't provide**. This is a common failure mode in complex simulation games: the game gives players expressive tools to build complex systems, but insufficient tools to *understand the systems they've built*.

The gap in Gladiabots is specifically: **no separation between observation state and decision state**. Both live in the same visual tree. Both fire in the same debugger overlay. The community invented a workaround — a condition-only tree as a dedicated observation layer — because the game didn't have one.

For Robot Uprising, this gap is wider. The game's entire premise is that agents have **limited working memory** (context buffers) that shapes what they know when they decide. The questions "what did this agent have in its buffer when it chose to flank?" and "what had already been evicted when the flank order arrived?" are central to understanding why anything happened. A Gladiabots-style tree overlay, however good, cannot answer those questions.

**The Robot Uprising diagnostic challenge is fundamentally about information architecture, not just decision logic.**

---

## Design Option A: Let It Emerge (The Gladiabots Approach)

Don't build a diagnostic layer. Give players a good tree/config overlay and let the community invent their own diagnostic patterns.

**What this looks like in Robot Uprising:** The debrief shows hook activations, buffer states by agent, and the sequence of actions taken. Players who want to understand what an agent knew at a given tick must scrub through the replay and watch the buffer visualization change. Experts will develop pattern: "I always add a 'buffer probe' hook that fires once per second and logs the full buffer to a shared channel — that's how I read the state mid-battle."

**The problem:** Letting it emerge means beginners never discover it and remain stuck. The average Gladiabots playtime is under 2 hours — the debugging sub-AI is an expert-tier pattern that most players never reach. If Robot Uprising's core gameplay is understanding information architecture, hiding the diagnostic tools behind community-discovered practices means the core loop is inaccessible to the majority.

**The benefit:** Community-invented tools feel more authentic. Players who discover the buffer probe pattern feel clever. The practice becomes a social signal ("what diagnostic hooks are you running?").

---

## Design Option B: Designed-In Diagnostic Layer — The Inspector Sidebar

Robot Uprising designs the diagnostic layer **as a first-class workbench component**, present from the start.

**The Inspector Sidebar:** A vertical panel, permanently docked on the right side of the battlefield during execution. When you click any agent during a match, the Inspector shows:

- **Live buffer contents:** Each slot rendered as a horizontal strip. Slot label (signal type), signal value, fidelity bar (full = fresh, degraded = stale), age in ticks. Eviction events: when a slot empties, it dims briefly with a small "evicted" label before clearing.
- **Last action:** What skill the agent just executed, and which buffer entry it acted on (highlighted in the slot list with a small pulse).
- **Rule evaluation trace:** The last 3 rules that fired, with pass/fail status and the signal that triggered each.
- **Incoming/outgoing hooks:** Active hook connections displayed as labeled lines. "RELAY → SCOUT: POSITION_UPDATE" in amber. "SCOUT → STRIKER: FLANK_VECTOR" in green.
- **Buffer pressure indicator:** A small thermometer on the left edge. Cool blue < 50% full, amber at 75%, pulsing red when at capacity. This is the "oh no" moment visualized at a glance.

**The key difference from Gladiabots:** The Inspector Sidebar shows *information state*, not just *decision state*. You can see not only what the agent did but **what it knew (and didn't know) when it decided**.

**During planning:** The Inspector is empty but preconfigured. Players can set **probe hooks** — lightweight one-liner hooks that send a signal to a dedicated "debug channel" whenever a specific condition is met. The probe hooks are visible in the workbench alongside regular hooks, but visually distinct (grey outline, "PROBE" label). They have no effect on agent behavior — they're read-only taps.

**During debrief:** The Inspector is fully populated with the replayed history. You can click any moment on the timeline and see the exact buffer state at that tick for any agent. The "buffer pressure" thermometer becomes a graph — click the graph to scrub to the moment of maximum pressure. The "last action" trace becomes a full sequence timeline.

---

## Design Option C: The Always-On Diagnostics HUD

Rather than requiring players to click into an inspector, key diagnostic information is visible on agents **at all times during execution**, rendered directly on the battlefield canvas.

**Unit portrait diagnostic ring:** Each agent on the battlefield has a small status ring around its portrait. The ring is segmented like a clock face, with each segment representing one buffer slot. Segment color: bright white = recently filled, dimming toward grey as the signal ages. When a slot evicts, the segment flashes amber and dims to nothing. When the buffer is at capacity, the ring pulses red.

**Action beam color:** When an agent executes a skill, a colored beam radiates briefly outward indicating what kind of signal it acted on. Blue beam = acted on fresh (<3-tick) signal. Yellow beam = acted on moderately stale (3–8-tick) signal. Red beam = acted on very stale (>8-tick) signal. This teaches the asynchronous observation gap (2.20) visually without requiring the inspector sidebar.

**Hook activation flash:** When a hook fires, a line arcs between the two connected agents — brief, bright, then fading. The line color matches the signal type. Multiple simultaneous hook activations create a brief web of light across the battlefield. The visual vocabulary of a "well-connected" agent vs. an "isolated" agent is instantly legible.

**The tradeoff:** The always-on HUD is visually noisy during complex battles. Players may find it overwhelming — exactly the "information overload is viscerally legible" goal of the game. But it risks making the spectacle illegible to new players who haven't learned the vocabulary yet.

**Resolution:** Toggleable HUD layers. New players see: health only. Intermediate players unlock: hook activations. Expert players unlock: buffer pressure ring and signal freshness beam. The unlock sequence teaches the vocabulary by introducing one diagnostic layer at a time.

---

## Player Journeys

#### Journey: Tomás, 22, Computer Science Student, First Playthrough

**Context:** Mission 4 of the campaign. Has learned about rules and hooks. Deployed a scout-relay-striker chain and watched it fail twice. The striker kept flanking in the wrong direction. Has no idea why.

**Minute 0:00 — The Confusion State**
The debrief screen is open. Tomás is looking at the timeline — a horizontal bar showing the sequence of hook activations. The scout fired a hook at tick 3. The relay received it. The relay fired a COMPRESS hook at tick 5. The striker received something at tick 6 and... went left. The enemy objective was right.
He scrubs to tick 6 in the debrief. The striker's last action shows: FLANK toward position (12, 4).
He hovers over the striker's buffer. The Inspector Sidebar populates with tick-6 state. Buffer slot 1: FLANK_VECTOR, value: (12, 4), age: 3 ticks, fidelity: 0.7 (partial degradation from relay compression).
He sees slot 2: ENEMY_POSITION, value: (28, 11), age: 1 tick, fidelity: 1.0.
*Tomás: "Wait. The flank vector is pointing toward where the enemy WAS, not where it is. The relay compressed the old position."*

**Minute 2:00 — The Fidelity Discovery**
He clicks the fidelity bar in the inspector. A tooltip explains: "RELAY-COMPRESS halves vector precision. The striker is acting on a position that was accurate 3 ticks ago — the enemy has moved 6 units since then."
*Tomás: "I need the striker to either act faster OR use the fresher ENEMY_POSITION signal directly instead of the relay-compressed flank vector."*
He goes back to the workbench and adds a new rule: "IF ENEMY_POSITION fidelity > 0.8 AND age < 2 ticks THEN use direct ATTACK. ELSE use FLANK_VECTOR."
The mission passes on the next attempt.
*Tomás: "The inspector just taught me what fidelity means in practice. I'll never misconfigure relay compression again."*

**Minute 6:00 — The Probe Habit Forms**
Tomás notices a small probe icon in the workbench toolbar. He clicks it. A tooltip: "Probe hooks send read-only signals to the Debug channel. They don't affect agent behavior. Use them to observe state during execution."
He adds a probe: "At each tick, send SCOUT buffer state to Debug channel." In the next debrief, the Debug channel timeline shows exactly what the scout had in its buffer at each moment.
*Tomás: "This is like console.log for agents. I'm going to add this to every build from now on."*

**UI Annotations:**
- **Inspector Sidebar**: Slides in when any agent is clicked during debrief/execution. Shows buffer slots, last action, rule trace, hook connections. Default: closed. Width: 280px. Docked to right of battlefield canvas.
- **Buffer slot row**: 3 elements — signal type label (left), fidelity gradient bar (center, fills left-to-right, white-to-grey), age label (right, e.g. "3t"). Tooltip on hover: full signal contents.
- **Probe hook**: Grey-outlined hook in workbench. Label "PROBE". No agent-side effect. Sends copy to Debug channel. Debrief shows debug channel as separate timeline row.

---

#### Journey: Sarah, 38, Product Manager, Playing for the 3rd Time in Campaign

**Context:** Reached Mission 9 — the first mission with 5 agents on each side. Her relay chain is working, but one of her strikers is mysteriously silent — never fires its ATTACK skill. She knows from previous missions that the strike isn't "broken" but she can't figure out why it never acts.

**Minute 0:00 — The Silent Agent Problem**
She opens the debrief and clicks the silent striker. Inspector Sidebar: buffer is completely empty at tick 30 — the moment she expected the first attack.
She scrolls back to tick 1. Buffer: empty.
Tick 10: empty.
Tick 20: empty.
*Sarah: "Nothing ever made it into the buffer. The striker never received anything."*

**Minute 1:30 — Tracing the Chain Backward**
She clicks the relay. Inspector: at tick 5, the relay has a COMPRESS signal queued. It fires to the striker at tick 6. But the striker's buffer is still empty at tick 7.
She looks at the hook connections diagram in the inspector. The relay's outgoing hook reads: "RELAY → STRIKER_2 (range: 8 units)."
She looks at the battlefield overlay. The striker started at position (22, 18). The relay started at (10, 10). Distance: ~14 units. **Out of range.**

*Sarah: "The hook range constraint. I forgot the striker was deployed too far from the relay."*

**Minute 3:00 — The Spatial Hook Lesson**
The inspector shows the hook connection line in muted red (disconnected) for ticks 0–12, then in amber (just in range) from tick 13 onward as the striker advanced forward. But by tick 13 the striker's buffer had no signal and by the time signals arrived, the mission's first phase was already over.
*Sarah: "Hooks don't tunnel through distance. I need to either deploy the striker closer OR give it a MOVE-toward-relay rule to enter range before the attack phase."*
She adjusts deployment: striker starts 4 units closer to relay. Next attempt: striker activates at tick 7.

**Minute 8:00 — The Campaign Unlock**
Mission 9 completion unlocks a new Inspector panel section: "Signal Genealogy." Each signal in the buffer now shows its origin chain: "SCOUT → RELAY (compressed) → STRIKER_2." She can trace any signal's provenance back to its source agent and see every transformation applied to it.
*Sarah: "Oh this is incredible. This is like a supply chain tracker for information."*

**UI Annotations:**
- **Hook connection line**: Color encodes state. Grey = within range, connected. Red = out of range, disconnected. Amber = at edge of range, intermittent. Line thickness encodes signal frequency — more signals per 10 ticks = thicker line.
- **Range ring**: Toggle option in Inspector. Shows the hook's range radius as a translucent circle around the sending agent on the battlefield overlay.
- **Signal genealogy**: Unlocked mid-campaign. Adds provenance chain to each buffer entry tooltip. Format: [ORIGIN AGENT] → [each relay/transform step] → [CURRENT AGENT], with signal type at each hop.

---

#### Journey: Dmitri, 26, Ex-StarCraft Player, High-Difficulty Optional Mission

**Context:** Mission 12-X, the first optional "challenge" mission — no scout allowed, only relays and strikers. He's trying to build a decentralized sensing architecture where strikers self-organize by sharing position data peer-to-peer via direct hooks, no relay. It's failing in weird ways: strikers sometimes cluster on the same target.

**Minute 0:00 — The Cluster Problem**
He opens the debrief. Five strikers; three of them simultaneously attacked the same enemy at tick 18. The other two attacked nobody (no signal). The battle was effectively 2v5 because three strikers wasted their turns on an already-dying enemy.
He clicks Striker_3. Buffer at tick 16: two entries for the same ENEMY_POSITION signal — one from Striker_1 (tick 14, fidelity 0.9) and one from Striker_2 (tick 15, fidelity 0.85). The signal was the same underlying event, propagated through two paths.
*Dmitri: "Fan-out. The same signal arrived twice through different paths. I've got an echo chamber."*

**Minute 3:00 — The Deduplication Problem**
He wants to add a deduplication rule: "IF buffer contains two signals of same type from within last 3 ticks, evict the older one." But the workbench UI for eviction policies doesn't have a "same type within window" option — only FIFO, priority-based, and age-based.
*Dmitri: "I need signal identity. Every signal needs a source-agent tag so I can write a rule: don't act on a signal if you've already seen one from this source in the last 5 ticks."*
He adds signal source metadata to each hook configuration (previously he'd left this unset). The inspector shows hook outputs now labeled with source agent ID. His deduplication rule can now compare source IDs across buffer entries.

**Minute 7:00 — The Architecture Insight**
He reruns the mission. Striker buffer at tick 16: one entry with a source-conflict annotation. The inspector shows: "DEDUP: received ENEMY_POSITION from Striker_2 matching signal from Striker_1 (0.5-tick offset). Evicted Striker_2 copy."
Three strikers attack three different enemies. The fight is 5v5 from the start.
*Dmitri: "Information routing is the real game. Not where you point your guns. Where you route your signals."*
He screenshots the signal genealogy view and posts it in the community Discord. The image shows a beautiful web of arrows converging on five strikers from five different sources, with dedup annotations. Five replies within an hour: "how did you do that?"

**UI Annotations:**
- **Buffer deduplication annotation**: When an incoming signal is deduplicated, the evicted copy leaves a ghost entry in the buffer slot — dim, strikethrough text, "DEDUP" label. Visible for 2 ticks before clearing. Teaches that the dedup happened.
- **Signal source tag**: Optional metadata field in hook configuration. When set, adds source agent ID to outgoing signals. Inspector renders source ID in small text below signal type. Enables source-aware rule conditions.
- **Signal genealogy web**: Debrief view, accessible from the "Network" tab. Shows the full graph of signal propagation across all agents for any tick range. Edges labeled with signal type, colored by fidelity. Selectable path highlighting.

---

## The TikTok Clip for the Always-On Diagnostics HUD

**15-second clip:**
A five-agent battle plays. The battlefield shows agents with diagnostic rings around their portraits. As the match progresses the rings pulse — slots filling, slots dimming, slots evicting in amber flashes. One striker's ring turns solid red at tick 12 (buffer at capacity). The striker's action beam fires yellow (moderate staleness). The striker flanks... in the wrong direction.

The clip cuts to the Inspector Sidebar: buffer shows 5 full slots, all stale (ages 8, 7, 9, 6, 8 ticks). At the top of the buffer: FLANK_VECTOR, fidelity 0.2.

Text overlay: "its buffer was full of old intelligence and it still had to act."

The clip cuts back to the battlefield. The striker's ring drains to empty — the full buffer finally evicted on a new data arrival. The diagnostic ring resets cool blue.

Text overlay: "the attention system is the game."

---

## Strengths of Designing the Diagnostic Layer In

**Accessibility:** The debugging sub-AI in Gladiabots is an expert-tier workaround. In Robot Uprising, the inspector sidebar is visible from mission 1. New players learn the vocabulary (buffer, fidelity, age, eviction) by watching it rather than by being told.

**Teaching without tutorials:** The inspector is the best teacher in the game. "Your agent flanked wrong because the fidelity of its FLANK_VECTOR was 0.2 and the source data was 9 ticks old" is more informative than any tutorial text. The debrief becomes a classroom.

**Viral sharing:** The signal genealogy web is a gorgeous visualization. Players will screenshot it and share it. It makes the information architecture visible and beautiful — not abstract.

**Probe hooks as design pattern:** Teaching players to add probe hooks encourages them to think observably-by-default, a real software engineering practice. The game teaches good design habits.

---

## Weaknesses / Tradeoffs

**Information overload risk:** The always-on diagnostic HUD adds visual noise to the battlefield. If every agent has a diagnostic ring, a 6v6 battle has 12 diagnostic rings pulsing simultaneously. This may be too much.

**Resolution:** Progressive unlock keeps early missions clean. The game's stated goal ("information overload is viscerally legible") means some overload is intentional — but it should feel meaningful, not random.

**Inspector depth creates tutorial debt:** The more powerful the inspector, the more players need to learn what each indicator means. Signal genealogy is powerful but complex. The game needs a "first time you open this panel" tooltip sequence.

**Probe hooks are debugging tools, not gameplay:** In the final shipped game, players may not want to maintain probe hooks in "production" builds. The distinction between diagnostic probes and real hooks needs to be clear. Ideally probe hooks are a separate non-exported system that exists only during dev/test phases of the campaign.

---

## Interaction Effects

**Buffer model (2.01–2.05):** The inspector's value scales with buffer model complexity. A fixed-slot FIFO buffer is easy to inspect (just look at the 5 slots). A decay buffer (entries fade over time) requires fidelity gradients and age indicators to be readable at a glance. Weighted buffers need visual size differentiation per slot. The inspector must adapt its display to the active buffer model.

**Eviction policies (2.06–2.09):** The inspector's eviction visualization (amber flash, ghost entry) is only meaningful if eviction is visible and frequent. A sticky memory model (entries never evict until pinned) makes the inspector less dramatic but more legible.

**Hook semantics (1.04d):** If blocking rendezvous hooks are used, the inspector needs a "BLOCKED — waiting for rendezvous" state distinct from "BLOCKED — buffer full." The two blocking reasons are diagnosable through the inspector but visually distinct: rendezvous waiting shows a blue breathing pulse on the hook connection line; buffer full shows a solid red ring on the receiver.

**Debrief as debugger (4.04a):** The inspector sidebar during debrief is the primary teacher. Aspect 4.04a goes deeper on debrief screen design — the inspector is the debrief's core diagnostic tool, not just a feature.

**Latency visualization (4.13):** Signal age at time of action is essentially the inspector's "action beam color" made explicit. These two aspects are complementary: 4.13 is the debrief annotation layer, the inspector is the real-time execution layer.

**Onboarding (5.17 hybrid tutorial architecture):** The inspector is the diegetic complement to any in-game tutorial document. Rather than reading "context buffers have limited capacity" in a document, the player watches the buffer fill in real time through the inspector. The document provides vocabulary; the inspector provides proof.

---

## Sensory Description

**The Inspector Sidebar** slides in from the right with a 150ms ease-in-out when an agent is clicked. Background: very dark navy (#0d0f1f). Header bar: agent's name in the game's circuit-glyph font, unit class icon, and a small health bar.

**Buffer slots:** A vertical stack of rows, each 32px tall. Left edge: a narrow signal-type color tab (blue for comms, green for terrain, red for threat, yellow for orders). Center: signal label in medium-weight white text. Right: age in ticks (small grey text, e.g. "4t"). Between label and age: the fidelity bar — a horizontal fill that depletes left-to-right as fidelity decreases, white-to-amber at 50%, amber-to-red at 20%. When a slot is empty: the row dims, the color tab bleaches to grey, and a faint ghost of the last occupant label shows in 30% opacity for 2 ticks.

**Eviction event:** The evicted slot's row flashes amber (#ffaa00) for one frame, then the ghost fade begins. A small particle: three small hexagonal sparks scatter left from the slot. A click-sound: a single soft electronic thunk, pitched lower for higher-priority evictions.

**Buffer pressure thermometer:** On the left edge of the Inspector, a vertical thermometer 4px wide and 120px tall. Filled from bottom. Color: white below 50%, amber at 75%, animated red pulse at 90%+. Pulse frequency increases with buffer pressure — the visual urgency of "this agent is about to forget something" is visceral.

**Hook connections diagram:** Below the buffer, a small schematic showing the agent as a center node with lines radiating to connected agents. Lines: color-coded by signal type. Thickness: scales with signals/tick. Grey = within range, connected. Red = disconnected (out of range or blocked). Amber = intermittent. Each connection labeled with signal type. When a hook fires, the corresponding line brightens for 0.25 seconds, then fades back to base color.

**The diagnostic ring on the battlefield:** A thin circular ring, 40px diameter, centered on the agent portrait. Twelve segments, like a clock face. Each segment represents one buffer slot — lit when occupied (white-blue), dim when empty. The ring slowly rotates clockwise at 1 RPM in idle state, conveying "alive and evaluating." When a slot evicts, the corresponding segment flashes amber and dims. When at capacity: all twelve segments lit, ring stops rotating, pulses with a slow red throb.

---

## New Aspects Discovered

The following aspects emerged from this analysis and should be added to the frontier:

- **4.15 — The probe hook as first-class debugging primitive:** Design exploration of the probe hook system — how probes are created, what they cost (nothing, but maybe a context slot?), how debrief surfaces their output, whether probe hooks should persist into production configs or auto-strip before Gauntlet deploy. The engineering practice of "always-be-observable" as a game mechanic.

- **4.16 — Signal genealogy as visualization:** The full network graph of signal propagation across all agents for a given tick range — what does this look like as a visualization? How do you make it legible for 5 agents vs. 15 agents? Comparable graph visualizations: network traffic analyzers, dependency trees in build systems, call graphs in profilers.

- **3.10a — Hook range as spatial mechanic:** Hooks that only fire within a configurable range radius create spatial choreography requirements — agents must stay in communication range. Design options: fixed range per signal type, configurable range as a context config parameter, range extenders as a skill, and "relay positioning" as a tactical mini-game (do I deploy the relay at the midpoint or closer to the scout?).

- **2.23 — Echo suppression as agent mechanic:** When a signal propagates through a peer-to-peer mesh (each agent relaying to each neighbor), the same signal can arrive multiple times through different paths. Design options: signal identity (source-agent + tick ID = unique key), TTL decrement (each relay decrements a hop count until 0), deduplication rule vocabulary, and whether echo suppression is a default behavior or a configurable skill.

- **8.09 — The diagnostic layer as teaching mechanic:** Cross-cutting synthesis: the inspector sidebar / probe hooks / signal genealogy / diagnostic ring are all parts of one designed system for making information architecture legible. How does this system scale across all three acts (campaign → advanced campaign → Gauntlet)? What should be permanently visible vs. opt-in vs. expert-only? A full design pass on the diagnostic teaching arc from mission 1 to Gauntlet.

---

*Aspect 1.06a fully documented. 2,850 words. 3 full player journeys. 5 new aspects discovered.*
