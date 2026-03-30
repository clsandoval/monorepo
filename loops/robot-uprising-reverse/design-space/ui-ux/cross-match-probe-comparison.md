# 4.108 — Cross-Match Probe Comparison View

*Design-space exploration — what happens when a probe lives long enough to show you three different truths*

---

## 1. The Mechanic

### Core Concept: The Three-Column Tribunal

When a player pins a probe to a specific agent slot range and that probe persists across three consecutive matches, the Probe Log transforms from a single-match timeline into a **three-column comparison view**. Each column represents one match. The rows are ticks. The cells are slot states. The differences glow.

This is not a feature the player toggles. It **emerges**. The player pins a probe in match 1, plays match 2 with the same agent configuration, plays match 3 — and when they open the Inspector after match 3, the Probe Log has quietly grown a new mode. A tab at the top reads: **"Cross-Match (3)"**. Click it, and the single-column log splits into three synchronized columns.

### Exact Rules

**Probe Persistence Criteria:**
- A probe is defined by: (agent ID, slot range, tick range)
- A probe "persists" across matches if the agent configuration (skills, rules, hooks, context config) is **identical** between matches — same agent blueprint, same probe target
- The match scenarios may differ. In fact, differing scenarios is the entire point
- If the player modifies the agent's configuration between matches, the probe chain **breaks** and the count resets to 1
- Probes persist across scenario changes but not across agent edits — this is the key design constraint

**Three-Match Threshold:**
- Two matches show nothing special. The comparison view requires exactly three columns. Not two, not four. Three
- Why three: two matches can show a difference but cannot distinguish "usually X" from "sometimes X." Three matches establish a **majority pattern**. Two out of three is a quorum. This is the minimum sample size for the word "stable" to mean anything
- After the third match, subsequent matches **rotate** — match 4 replaces match 1, creating a rolling window of three. The player always sees the three most recent runs

**Slot Difference Highlighting:**

The comparison view uses a precise color vocabulary:

| Condition | Color | Meaning |
|-----------|-------|---------|
| Slot identical across all 3 matches | No highlight (base dark) | Stable behavior — deterministic |
| Slot full in 2/3 matches, empty in 1 | **Amber** | Mostly reliable, one scenario didn't trigger it |
| Slot empty in 2/3 matches, full in 1 | **Teal-flagged** | Rare activation — scenario-dependent or edge case |
| Slot has different *content* across all 3 | **Magenta dashed border** | Volatile — the agent fills this slot but with different data each time |
| Slot identical in 2, different in 1 | **Amber with content diff tooltip** | Mostly stable content, one outlier |

The amber/teal binary is the primary teaching tool. Amber says: "this almost always happens." Teal says: "this almost never happens." The player learns to read their agent's behavior as a probability distribution, not a script.

**Tick Synchronization:**
- Columns are aligned by tick number, not by game event
- If match 1 ended at tick 47 and match 3 ended at tick 62, the shorter columns show empty rows past their final tick, grayed out
- A **tick scrubber** at the bottom lets the player scroll all three columns simultaneously
- Clicking any cell in any column highlights the same tick across all three columns with a thin horizontal rule

**Column Headers:**
Each column header shows:
- Match number in the rolling window (I, II, III)
- Scenario name and fingerprint ID (from 2.28)
- Match outcome (WIN / LOSS / DRAW)
- Total ticks survived

### The Teaching Moment

The comparison view teaches one of the hardest concepts in agentic AI: **the difference between architecture and environment**. A slot that's always full reflects something about the agent's *design* — a skill that always fires, a rule that always applies. A slot that's full in some matches but not others reflects something about the *scenario* — the agent's architecture is reacting to environmental conditions.

This is the distinction between robust behavior and brittle behavior. It's the distinction between a well-architected agent and one that works by coincidence. And the player discovers it not through a tutorial, but by staring at three columns and noticing the colors.

---

## 2. Player Journeys

### Journey: Marcus, 26, Software Engineer (Junior)

**Context:** Marcus has been playing for two evenings. He built an agent called "Sentinel" — a defensive unit that prioritizes protecting relay anchors. He's cleared the first campaign arc but keeps losing a specific scenario where enemies rush from the east flank. He's been tweaking Sentinel's skills but nothing sticks.

**Minute 0:00 — The Third Match Ends**

Marcus loses again. East flank rush, relay anchor destroyed at tick 34. He's frustrated. He clicks through to the Inspector almost on autopilot. But something is different. The Probe Log tab, which usually just says "Probe Log," now has a small badge: a circled **3**. He hovers over it. Tooltip: "Cross-Match comparison available (3 matches, same agent config)." He clicks.

**Minute 0:15 — The Columns Appear**

The single-column probe log slides left, and two more columns fade in from the right. Three columns. Three matches. His probe — slots 3-7 of Sentinel's context window, ticks 10-40 — is displayed across all three. Column I was two matches ago (a scenario he won). Column II was last match (also a loss). Column III is this match (loss again).

His eyes go wide. Column I is almost entirely unhighlighted — stable, dark cells. Columns II and III are *splashed* with teal and amber. The visual difference is immediate. He doesn't even need to read the slot contents yet. The colors tell a story: "Something is very different about what your agent was thinking in these three scenarios."

**Minute 0:45 — Reading the Amber**

He focuses on the amber cells. Slot 5, ticks 15-25: amber across columns II and III, meaning the slot was full in two matches but empty in one. He checks column I — empty. So in the match he *won*, slot 5 wasn't being used during ticks 15-25, but in the two losses, it was. He clicks the amber cell. The slot content reads: `THREAT_EAST: priority=HIGH, units=3, distance=4`. His agent was *detecting* the east flank threat. It was filling the context window with threat data. But that detection was *displacing* something else.

**Minute 1:30 — The Displacement Discovery**

He scrolls down to slot 6, same tick range. In column I (the win): `RELAY_SHIELD: active, coverage=3_tiles`. In columns II and III: empty, teal-flagged. The relay shield skill — the core of Sentinel's defensive identity — was getting **pushed out of the context window** by the flood of threat data. His agent's fixed-size context window couldn't hold both the threat assessment *and* the shield maintenance instruction. The threat data won the priority contest and the shield dropped.

This is the "aha." Marcus sits back. He's been trying to fix the wrong thing. He doesn't need better threat detection — he needs to change slot priorities so the shield skill can't be evicted. Or he needs to reduce the verbosity of the threat assessment so it takes fewer slots.

**Minute 2:30 — The Fix**

He goes back to the Plan screen, adjusts Sentinel's context config to give `RELAY_SHIELD` a pinned slot (slot 3, unevictable). He doesn't touch the threat detection at all. He runs the east flank scenario again. Wins at tick 51. The probe comparison will now start a new rolling window from this match.

**Pattern name: The Eviction Postmortem** — the comparison view reveals that a critical behavior was being displaced under pressure, something invisible in a single-match log.

---

### Journey: Anika, 34, Data Scientist

**Context:** Anika is deep in the mid-game. She has a squad of four agents and is working on hook coordination — agents passing information through named channels. She's trying to understand why her "Scout" agent sometimes sends a relay warning and sometimes doesn't. She's pinned a probe on Scout's outgoing hook buffer.

**Minute 0:00 — Deliberate Experimentation**

Unlike Marcus, Anika is using the comparison view *intentionally*. She's played the same scenario twice already, specifically to build up the three-match data. She picks a third scenario — this one from a different fingerprint class (per 2.28, it's tagged as "flanking-pressure" while the first two were "attrition-grind"). She wants to see if Scout's hook behavior changes across scenario types.

She runs the match. Scout performs adequately. She opens the Inspector and goes straight to Cross-Match.

**Minute 0:20 — The Fingerprint Overlay**

The three columns are up. But Anika does something Marcus didn't: she enables the **scenario fingerprint overlay**. This is the 2.28 interaction. Each column header already shows the scenario fingerprint ID, but the overlay goes further — it color-codes the column *backgrounds* by fingerprint class. Columns I and II (both attrition-grind) have a subtle warm gray background. Column III (flanking-pressure) has a cool blue-gray. The visual grouping is immediate.

**Minute 0:50 — Stable Hooks vs. Scenario Hooks**

Scout's hook buffer (slots 1-3) shows a clean pattern. Slot 1: identical across all three columns. Content: `HEARTBEAT: alive, tick={n}`. This is a basic liveness ping. Unhighlighted. Completely stable. Anika nods — this is deterministic architecture, nothing to see.

Slot 2: amber. Full in columns I and II (attrition-grind), empty in column III (flanking-pressure). Content in I and II: `RELAY_WARNING: sector=north, threat_level=moderate`. Anika furrows her brow. In the flanking-pressure scenario, the threat came from a different sector and Scout's warning logic didn't fire because it was hard-coded to watch the north. This is a **scenario-dependent hole** in Scout's coverage.

Slot 3: teal-flagged. Empty in I and II, full in III. Content in III: `EMERGENCY_RETREAT: all_units, reason=flank_collapse`. Scout sent an emergency retreat in the flanking scenario but never in attrition scenarios. This is a behavior that only emerges under specific pressure.

**Minute 1:45 — The Hypothesis**

Anika writes in her notes (the game has an in-Inspector notepad): "Scout's hook logic is biased toward north-sector threats. Flanking scenarios expose a directional blind spot. Need to parameterize sector detection or add a second scanning rule." She also notes: "Emergency retreat hook fires correctly under flank collapse — good, that's working. But it's scenario-dependent by nature, so teal is expected."

This is a different kind of insight than Marcus had. Anika isn't finding a bug — she's mapping her agent's **behavioral envelope**. The comparison view is acting as a scientific instrument, and the three scenarios are her experimental conditions.

**Minute 2:45 — The Fingerprint Correlation**

She opens the 2.28 scenario fingerprint panel alongside the comparison view. The fingerprint for "flanking-pressure" lists architectural patterns it tests: `lateral_detection`, `retreat_coordination`, `sector_agnosticism`. The comparison view has just shown her that Scout fails `sector_agnosticism`. She clicks the fingerprint tag and it highlights which slots are relevant to that pattern — slot 2 lights up with a small badge: "Tests: sector_agnosticism." The fingerprint system and the comparison view are now cross-referencing each other. Anika sees exactly which architectural weakness the scenario was designed to expose, and the comparison view confirms it was indeed exposed.

**Pattern name: The Controlled Experiment** — the player deliberately selects scenarios from different fingerprint classes and uses the comparison view as a differential analysis tool.

---

### Journey: Diego, 19, College Freshman (Art Major)

**Context:** Diego doesn't care about AI engineering. He plays Robot Uprising because the aesthetic is sick and his roommate won't shut up about it. He's been brute-forcing the campaign by copying builds from a Discord server. He's never opened the Inspector on purpose.

**Minute 0:00 — The Accidental Discovery**

Diego misclicks. He was trying to hit "Next Mission" but clicked the Inspector tab instead. He's about to close it when he sees something he hasn't seen before: three columns of colored cells, pulsing gently. The amber cells have a slow, warm throb. The teal cells have a cool, quick flicker. It looks like a heartbeat monitor crossed with a heatmap. It looks *cool*.

**Minute 0:10 — Visual Curiosity**

He doesn't know what any of this means, but the pattern is visually striking. One column is almost entirely dark (the easy scenario he stomped). The other two are lit up like a Christmas tree (the hard scenarios he barely survived). He scrubs the tick slider at the bottom and watches the highlights move in real-time — amber patches appearing and disappearing, teal spikes flashing at moments of crisis.

He notices that the teal spikes in columns II and III happen at nearly the same tick range (ticks 28-33). Something happened at that tick range in both matches that didn't happen in the first. He clicks a teal cell. The tooltip reads: `PANIC_RESPONSE: target=nearest_enemy, override=true`. His agent panicked. In both hard matches, at almost the same moment, the agent's context window filled with a panic override.

**Minute 0:40 — The First Real Question**

For the first time, Diego asks a *design* question: "Why does my agent panic at tick 30?" He didn't ask this because a tutorial told him to. He asked because the visual pattern made the question obvious. Three columns. Two panics. One calm. What's different?

He clicks the column I header (the easy scenario). Scenario fingerprint: "light-skirmish." He clicks column II: "multi-vector-assault." Column III: "multi-vector-assault." Both hard scenarios are the same fingerprint class. The easy one is different. Diego doesn't fully understand fingerprinting yet, but he gets the gist: the hard scenarios are the same *type* of hard.

**Minute 1:15 — The Screenshot**

Diego screenshots the three-column view. The amber/teal pattern across the grid looks genuinely beautiful — like a data visualization art piece. He posts it to the Discord with the caption: "my agent's panic attack visualized lmao." Three people respond with their own comparison views. One person's is almost entirely dark — they've built an agent so stable it barely registers differences across scenarios. Someone replies: "that's a boring agent tbh, mine is all amber and I still win." A design philosophy debate breaks out.

**Minute 2:00 — The TikTok Clip**

Diego records a 15-second clip: he scrubs the tick slider slowly from tick 0 to tick 60. The three columns transform in real-time — the first column stays dark while the other two bloom with amber and teal, the colors flowing upward like a thermal readout. At tick 30, the teal spikes hit simultaneously in columns II and III. He adds the caption: "when your AI has a synchronized panic attack." It gets 40K views.

**Pattern name: The Accidental Aesthetic** — the comparison view's visual language is compelling enough to draw in players who have zero interest in the underlying engineering, creating a gateway to deeper engagement.

---

## 3. Strengths and Weaknesses

### Strengths

**The Three-Column Quorum**
Three is the right number. Two columns show "different." Three columns show "usually" and "rarely." This is the minimum viable sample for probabilistic reasoning. The amber/teal vocabulary (2-of-3 vs. 1-of-3) maps directly to intuitive notions of "reliable" and "flaky." Players absorb statistical thinking without encountering a single number or percentage.

**Emergent Activation**
The comparison view isn't a menu item the player selects from a toolbar. It *appears* when conditions are met. This creates a discovery moment — "wait, when did this get here?" — that feels rewarding. It also means the feature is invisible to players who aren't probing, which prevents cognitive overload for beginners. The three-match threshold acts as a natural skill gate: only players who are already engaged with the probe system will see the comparison view.

**The Rolling Window**
Replacing the oldest match when a fourth is played keeps the data fresh and prevents information overload. The player always sees the most recent three runs, which are the most relevant to their current iteration. This also creates a gentle time pressure: if you see an interesting pattern, investigate it now, because three more matches will rotate it out.

**Visual-First Communication**
The amber/teal/magenta color system communicates slot stability without requiring the player to read content. You can assess an agent's behavioral consistency at a glance, the same way you'd assess weather patterns on a colored map. This scales: even agents with large context windows (many slots) produce readable comparison views because the signal is in the color, not the text.

**Teaching the Architecture-Environment Distinction**
This is the deepest strength. The comparison view makes visible something that professional AI engineers struggle to articulate: the difference between behavior that comes from the agent's design and behavior that comes from the environment. Stable slots = architecture. Variable slots = environment response. This distinction is fundamental to building robust agents, and the comparison view teaches it through direct visual experience.

### Weaknesses

**Configuration Sensitivity**
The probe chain breaks if the player modifies *anything* about the agent between matches. This is correct by design — comparing probes across different configurations would be meaningless — but it punishes exploratory players who tweak between every match. A player who changes one minor skill parameter loses their entire comparison history. This could create frustration, especially for players who don't understand why the comparison view disappeared.

*Mitigation:* Show a clear notification when the chain breaks: "Agent config changed — probe comparison reset. Run 3 matches with this config to rebuild." Also consider a "soft edit" concept where cosmetic changes (renaming, reordering non-priority slots) don't break the chain.

**Three-Match Minimum as Barrier**
Players must play three matches without editing their agent to see the comparison view. Impatient players may never trigger it. Players who are struggling will naturally want to edit between matches, which resets the counter.

*Mitigation:* The campaign could include a "stability test" mission set — three scenarios played back-to-back with editing locked between them, specifically designed to introduce the comparison view. Frame it narratively: "Command wants to evaluate your agent's consistency across three field conditions. No modifications permitted between deployments."

**Scenario Selection Blindness**
If the player happens to play three identical scenarios, the comparison view will show almost no differences — all slots stable, no amber, no teal. The player might conclude their agent is perfectly robust when in reality they simply haven't tested it against diverse conditions. The comparison view is only as informative as the scenario diversity in the three-match window.

*Mitigation:* If all three matches use the same scenario fingerprint class, show a subtle note: "All 3 matches used similar scenarios. Try a different scenario type to test robustness." This leverages 2.28 fingerprinting to guide experimentation.

**Colorblind Accessibility**
Amber and teal are distinguishable by most colorblind players (they differ in both hue and luminance), but magenta may blend with amber for players with deuteranopia. The system should include a secondary channel — patterns (stripes, dots) or icons — in addition to color.

---

## 4. Interaction Effects

### With 2.28 — Scenario Fingerprinting (Primary Interaction)

This is the marquee interaction. Scenario fingerprinting tells the player *what kind of test* each scenario is. The comparison view tells the player *how their agent responded* to each test. Together, they form a complete diagnostic loop:

1. Fingerprint says: "This scenario tests lateral_detection"
2. Comparison view shows: "Your agent's detection slot was teal (empty in 2/3 matches)"
3. Conclusion: "Your agent can't detect lateral threats reliably"

The fingerprint overlay on comparison columns (described in Anika's journey) is the key UI integration. When enabled, the column backgrounds tint according to fingerprint class, and individual slots can display fingerprint-tag badges showing which architectural pattern that slot is relevant to. This creates a **bidirectional reference**: the fingerprint panel can link to specific comparison-view slots, and comparison-view slots can link back to fingerprint tags.

**Emergent use:** Advanced players will deliberately select scenarios from different fingerprint classes to maximize the diagnostic value of their three-match window. This turns scenario selection into a strategic decision — not "which scenario can I win?" but "which three scenarios will teach me the most about my agent?"

### With Probe Pinning System

The comparison view inherits all probe constraints. Probes must be pinned to specific slot ranges and tick ranges. This means the comparison view shows a *window* into the agent's behavior, not the whole thing. Players must choose what to compare, which is itself a skill. Over time, players learn to pin probes at critical moments — the tick range where decisions happen, the slot range where priority conflicts occur.

### With Sealed Watch (No-Pause Battle)

Because matches are sealed (the player cannot pause or intervene), the three matches in a comparison window are pure agent-vs-scenario interactions. The player's real-time skill is irrelevant. This makes the comparison view a true test of *design*, not *execution*. It reinforces the game's core message: in agentic AI, the quality of the architecture matters more than the quality of real-time intervention.

### With Context Window Mechanics (Fixed-Size Working Memory)

The comparison view is fundamentally about context window utilization. Every amber and teal cell is a story about what was in the context window and what wasn't. This makes the comparison view the most powerful tool for understanding context window dynamics — more powerful than the single-match probe log, because single-match logs can't distinguish "this slot is always empty" from "this slot is empty in this particular scenario."

### With the Hook System (Agent-to-Agent Communication)

When the probe targets an agent's hook buffer (outgoing or incoming), the comparison view reveals communication stability. A hook message that appears in all three matches is a reliable communication channel. A hook message that appears in only one match is a fragile signal that depends on specific conditions. This teaches players to build redundant communication — if a critical warning only fires in one scenario type, the hook logic needs broadening.

---

## 5. Comparable Games and Media

**Football Film Study (All-22 Tape)**
NFL coaches review the same play across multiple games to identify tendencies. "Does this defensive end always set the edge against outside runs, or does he sometimes crash inside?" The cross-match comparison view is digital All-22 tape for AI agents. The three-column layout even visually resembles side-by-side film breakdowns.

**Git Diff / Three-Way Merge**
Developers are familiar with three-way diffs: base, ours, theirs. The comparison view is a three-way diff of agent behavior. The color highlighting follows the same logic: unchanged = no highlight, changed in one = highlighted, changed in all = a different kind of highlighted. Players with programming experience will feel an immediate familiarity.

**A/B/n Testing Dashboards (Optimizely, LaunchDarkly)**
Product teams compare metrics across multiple experiment variants. The comparison view is an A/B/C test where the "variants" are scenarios and the "metrics" are slot states. The amber/teal vocabulary maps to statistical significance: amber (2/3) suggests a pattern; teal (1/3) suggests an outlier.

**FTL: Faster Than Light — Run Comparison**
FTL players informally compare runs — "I always have shields by sector 3 but weapons vary." The comparison view formalizes this kind of cross-run analysis. Unlike FTL, where comparison is purely mental, Robot Uprising makes it visual and precise.

**Nand2Tetris — Logic Gate Verification**
In Nand2Tetris, students verify hardware designs by running test scripts and comparing output against expected values. The comparison view serves a similar function: the three matches are test cases, and the slot states are outputs. Discrepancies between columns are "test failures" that reveal design issues.

**Weather Map Overlays (Windy.com)**
The visual experience of the comparison view — colored cells, scrollable timeline, ambient animation — is reminiscent of weather data overlays where different data layers reveal different atmospheric patterns. The tick scrubber feels like scrubbing a weather timeline forward in time.

---

## 6. Sensory Description

### Visual

**The Split Animation:** When the player first clicks "Cross-Match (3)," the single-column probe log doesn't jump to three columns. It *unfolds*. The existing column slides left while two ghostly columns materialize on the right, fading from 0% to 100% opacity over 400ms. Each column has a thin vertical separator line — not a hard border, but a 1px line in 20% white, barely there. The columns breathe.

**Amber Highlight:** A warm, low-saturation orange (`#D4915C` at 30% opacity background, `#D4915C` at full opacity for the left border). The cell has a slow pulse — opacity oscillates between 25% and 35% over a 3-second cycle. The pulse is slow enough to feel organic, like a resting heartbeat. It says: "pay attention, but don't panic."

**Teal Flag:** A cool, slightly desaturated cyan (`#4CA6A8` at 25% opacity background, full opacity left border). The teal cells have a quicker pulse — 1.5-second cycle — and include a tiny flag icon (▸) in the top-right corner of the cell. The flag is 8x8 pixels, barely visible, but it catches the eye during a scan. Teal cells feel *alert*, like a notification badge.

**Magenta Dashed Border:** For fully volatile slots (different content in all three matches), the cell gets no background tint but a 1px dashed border in muted magenta (`#A86C9E`). No animation. The dashes create visual texture that says "unstable" without screaming.

**Tick Scrubber:** A horizontal slider at the bottom of the three-column view. As the player drags it, all three columns scroll vertically in sync. The current tick is indicated by a thin horizontal rule that stretches across all three columns — a pale gold line (`#C8B88A` at 60% opacity). When scrubbing, the line moves smoothly, and the cells above and below it have slightly increased brightness, creating a "spotlight" effect on the current tick neighborhood.

**Column Headers:** Each column header is a compact card showing the match number (roman numeral in a small circle), scenario name, fingerprint class tag (a small colored pill), and outcome (WIN in muted green, LOSS in muted red, DRAW in gray). The fingerprint pill uses the same color as the 2.28 fingerprint system, creating visual continuity.

### Audio

**Column Appearance:** When the three-column view activates for the first time, a soft tri-tone chime — three ascending notes, each slightly delayed, one per column. The notes are clean sine waves, not musical. They sound like a system coming online. Boop. Boop. Boop.

**Tick Scrubbing:** As the player drags the tick scrubber, a very quiet granular texture plays — like running a finger along the edge of paper. It's rhythmic, tied to tick boundaries. Each tick-crossing produces a tiny tactile click. At ticks where all three columns have highlighted cells, the click is slightly louder and has a subtle harmonic — a hint that something interesting is here.

**Amber Hover:** Hovering over an amber cell produces a warm, low hum — a single held note at ~220Hz (A3), very quiet, with slight vibrato. It's the sound of something steady. Something *usually true*.

**Teal Hover:** Hovering over a teal cell produces a cooler, higher ping — a brief note at ~880Hz (A5), with a quick decay. It sounds like a sonar blip. Something detected. Something *unusual*.

**Cross-Column Highlight:** When the player clicks a cell and the horizontal rule lights up across all three columns, a soft stereo sweep plays — left to right, crossing all three columns in audio space. The sweep is a filtered noise burst, ~200ms long. It sounds like a scanner passing over data.

### Haptic (Controller/Mobile)

**Tick Scrubbing:** Light continuous vibration tied to tick crossings. Highlighted ticks produce a slightly stronger pulse.

**Amber Cell Selection:** A slow, double-tap vibration pattern. Thump-thump. Like a heartbeat. Matches the visual pulse.

**Teal Cell Selection:** A single sharp tap. Quick. Alert.

---

## Summary of Named Patterns

| Pattern | Description |
|---------|-------------|
| **The Eviction Postmortem** | Comparison view reveals a critical behavior displaced under environmental pressure |
| **The Controlled Experiment** | Player deliberately selects diverse scenarios to maximize diagnostic value |
| **The Accidental Aesthetic** | Visual beauty of the comparison view draws in non-analytical players |
| **The Three-Column Quorum** | Minimum sample size for distinguishing "usually" from "sometimes" |
| **The Fingerprint Handshake** | Scenario fingerprints and comparison highlights cross-reference each other |
| **The Rolling Window** | Oldest match rotates out, keeping data fresh and creating investigative urgency |
| **The Architecture Mirror** | Stable slots reflect design; variable slots reflect environment — the view makes the distinction visible |
