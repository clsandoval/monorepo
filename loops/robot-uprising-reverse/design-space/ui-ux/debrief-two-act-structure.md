# The Two-Act Debrief Structure

**Aspect:** 4.04b — Designing the watch experience and the analysis experience as sequential phases — sealed watch (emotional) → full debrief (analytical) — with a deliberate transition between them; the "seal breaking" as the transition event

**Parent:** 1.06c-ext-A — Sealed Replay as Tension Mechanic
**Siblings:** 4.04a — Debrief as Debugger; 1.06c-ext-A-ii — The False Pivot Anti-Pattern
**Related:** 4.16 — Signal Genealogy Visualization; 4.13 — Latency Visualization; 4.03 — Buffer Visualization

---

## The Core Insight

Every debrief in Robot Uprising is structurally two different activities that players tend to collapse into one — and that collapsing is a design failure.

**Activity 1: Watching** — you experienced something. Your architecture ran. Units moved. Hook chains fired. The outcome resolved. You don't know yet whether it worked. Your emotional system is engaged. This is fundamentally a *viewing experience* — the same neural circuits that activate when watching a sports match or a film.

**Activity 2: Analyzing** — you're diagnosing. You need to know *why* something happened. You're using tools to trace signal genealogy, scrub to specific ticks, inspect buffer state at decisive moments, identify the genuine pivot behind the false one. This is fundamentally a *debugging session* — the same mental mode as stepping through code in a debugger.

These two activities are incompatible in the same moment. You cannot authentically watch a sealed match while also using debrief diagnostic tools — the tools spoil the watch. You cannot do deep diagnostic work in an emotional haze — the emotion clouds the analysis.

**The two-act design acknowledges this incompatibility and sequences the activities deliberately.** First the watch; then the debrief. The transition between them — the moment the seal breaks and the analytical layer materializes — is the pivot point of the entire post-match experience.

---

## Why This Is Not Just "Watch First, Then Analyze"

The naive implementation: play the replay, show a "results" screen when it's done. Players can scrub through a timeline. Done.

The two-act design is different in five ways:

**1. Act 1 has its own distinct visual register.** The sealed watch is not a "replay." It's a battlefield observation experience. The UI is stripped: no analytical overlays, no timeline scrubber, no probability bars, no diagnostic rings expanded. The screen looks like the execute-phase view, not the analysis view. The player is positioned as an observer, not a diagnostician.

**2. Act 2 tools are not available in Act 1.** Signal genealogy, buffer state history, the gold pivot diamond, latency color-coding — all absent during Act 1. The analytical layer does not "appear gradually"; it materializes at the seal break and only then. If you haven't broken the seal, you cannot access Act 2 tools even if you rewind the replay.

**3. The seal break is a designed event, not a screen transition.** It happens *in the replay*, at the tick where the outcome is effectively determined, not at the end of watching. The sealed bar dissolves mid-replay (Progressive Reveal model). The Act 1 → Act 2 transition occurs at the moment of narrative resolution, not at a technical replay endpoint.

**4. Act 1 is designed to be linear; Act 2 is designed to be non-linear.** In Act 1: no rewinding, no scrubbing (pause-only). The player watches forward. In Act 2: full scrubber control, rewind to any tick, jump to gold diamond, run analysis tools. The shift from "linear viewer" to "non-linear explorer" is itself the experience of the transition.

**5. The two acts feel different sensorially.** Act 1: battlefield ambient sound, the sounds of agents acting, hook chains firing, the sealed bar's soft pulse. Act 2: a different ambient register — quieter, more analytical. The sound of the debrief is the sound of a *review session*, not a *battle*. The audio environment shifts at the transition.

---

## Act 1: The Sealed Watch

### What the Player Sees

The screen is sparse. The battlefield renders at full resolution — this is not a thumbnail replay or a summary. Agents are visible as their unit portraits, moving, sensing, acting. The visual language is *live execution*, not *analysis*.

**HUD elements present in Act 1:**
- Agent portraits in bottom tray (compact view, diagnostic ring visible but condensed)
- Tick counter (top-right, counting up)
- SEALED bar (top-center, pulsing cyan — the visual "the outcome is pending" signal)
- Pause button (top-right — only control available)
- Match identifier and opponent/mission designation (top-left, small)

**HUD elements absent in Act 1:**
- Timeline scrubber (not yet accessible)
- Signal genealogy toggle
- Buffer state history
- Latency color overlay
- False pivot grey markers
- Gold diamond pivot indicator
- Agent inspector (expanded view)
- "What-if" counterfactual mode

The player cannot rewind in Act 1. Pause is the only control. This is intentional: the sealed watch is designed to be a commitment. Watching forward without the ability to analyze is what makes it emotionally distinct from the debrief.

### What Happens to Buffer State

The buffer diagnostic ring is visible on agent portraits, but in condensed form: a circular arc around the portrait that fills amber→red as the buffer fills. The player can see *that* a buffer is filling; they cannot see *which signals* are occupying which slots. That detail is reserved for Act 2.

This is crucial to the emotional design: the player watches their relay's buffer ring turn amber and feels anxiety — "is that okay? is that going to matter?" — without having the tool to know definitively. The uncertainty is preserved.

### The Ambient Sound of Act 1

The battlefield ambient: low industrial hum, the kind that says "systems running." Individual sound cues punctuate:
- Hook chain fire: a soft two-tone "connect" sound as the link activates
- Buffer fill increment: a barely-audible *tick* for each slot occupied (subtle — players learn to listen for this cluster of ticks as a warning sign)
- Agent action: a brief movement sound, different per skill type (scout detects → a high-frequency ping; relay compresses → a "squish" reduction sound; striker engages → a resonant clang)
- SEALED bar pulse: a 3-second breathing rhythm, a barely-audible low tone on each pulse — like a heartbeat for the pending outcome

### The False Pivot Experience (Act 1)

During Act 1, false pivots hit with full force. A hook cascade fires. Multiple agents respond. The relay's buffer drains and fills in one dramatic cycle. The player sees the spectacular event and *feels* it as the decisive moment.

This experience is not a design failure — it's the point. The false pivot sensation during Act 1 is what makes the Act 2 diagnostic revelation meaningful. If Act 1 were analytical, the player would never have the false pivot to correct.

---

## The Transition: The Seal Break

This is the most carefully designed moment in the entire post-match experience. It has five distinct phases, taking approximately 4-6 seconds from the decisive event resolution to the fully activated Act 2 interface.

### Phase 1: The Decision Moment (0.0s – 0.5s)

At the tick window where the outcome is effectively determined — the moment identified later by the gold diamond — a barely perceptible change occurs. The battlefield ambient sound's frequency rises very slightly. Not enough to consciously notice on a first watch; enough to train into pattern-recognition over many replays. The player who has watched 50 sealed replays will start *feeling* when the genuine pivot is happening, before they know what it is.

This is the "sixth sense" design goal: trained players develop intuition about quiet decisive moments, which is the exact skill that transfers to real agentic AI debugging.

### Phase 2: The Dissolve Begins (0.5s – 2.0s)

The SEALED bar at the top-center begins dissolving from *left to right* — not fading, dissolving. The dark panel that hid the result retreats, pixel by pixel, from left edge to right edge. Behind it, the outcome fills in as the dissolve reveals it:

- **Win (amber-gold):** A warm gold fills behind the dissolving panel, the color of mission-accomplished reports, of field operations that succeeded. Not celebratory yellow — deeper, more like old brass.
- **Loss (crimson wash):** A deep red fills, not aggressive, not alarm-red — the red of a declassified document, of something that didn't work. Weighted. Not punishing.

The dissolve rate is tied to the speed of the gameplay — a match that resolved quickly gets a faster dissolve; a closely contested match gets a slower one. The dissolve duration communicates how decisively the outcome was determined.

### Phase 3: The Resolution Beat (2.0s – 3.5s)

The dissolve completes. The outcome is visible.

**Silence for 1.5 seconds.**

No music sting. No UI animation. No prompts. Just the battlefield still rendering its final tick state, with the result bar now showing amber or crimson. The player absorbs the outcome.

This pause is not an oversight — it's a deliberate design choice rooted in emotional psychology. Cutting immediately to "NOW ANALYZE" destroys the emotional beat. The moment of outcome revelation has weight. That weight needs one to two seconds to land before the analytical mode begins.

A single sound plays at the start of this pause:
- **Win:** A clean three-note ascending tone, mid-register, around 440Hz. Like a key turning in a lock that opens. Resolved, not triumphant.
- **Loss:** A single descending note, held for 0.8 seconds, then silence. Not a buzzer. The sound of a door closing.

### Phase 4: The Materialization (3.5s – 5.5s)

The Act 2 interface assembles onto the screen. Not a fade — an **assembly**. Each analytical element appears by sliding in from its logical position:

- **Timeline scrubber:** emerges from the bottom edge, assembling left-to-right over 0.8 seconds
- **Gold diamond:** a small amber pip appears on the timeline at the pivot tick, with a brief radiance pulse (it glows bright, then settles to its resting state)
- **False pivot grey markers:** smaller grey circles assemble at their positions on the timeline (if applicable)
- **Signal genealogy toggle:** slides in from the top-right, its icon materializing from a ghost to solid
- **Agent inspector expanded mode:** the compact Act 1 portraits grow slightly, diagnostic rings expanding to full display
- **Buffer state detail:** the opaque buffer fill indicators become granular — individual slots now visible in the agent portraits

The assembly takes 2 seconds. It's slightly mechanical, intentionally — like diagnostic instrumentation being plugged in. The visual language is: *analysis tools are connecting.*

### Phase 5: The Curtain-Raiser Moment (5.5s – ...)

When the assembly completes, a single line of text appears briefly below the timeline — present for 2 seconds, then fades:

*"Outcome determined at Tick [N]–[M]."*

If it was a loss, a second line:

*"Scout the pivot before you reconfigure."*

If it was a win:

*"Find what made it work."*

These are the only directive instructions the game provides for Act 2. They are suggestions, not requirements. Players can do whatever they want with the debrief tools. But the curtain-raiser text establishes Act 2's purpose: this is the diagnostic act, and the game has already identified where to look.

---

## Act 2: The Full Debrief

### What the Player Now Has Access To

**Timeline scrubber:** A horizontal bar spanning the full match length, marked at regular tick intervals. The gold diamond glows at the pivot window. Grey circles mark the most visually dramatic false pivots (up to 3, to avoid clutter). Clicking any point on the timeline jumps the replay to that tick.

**Signal genealogy overlay:** A toggle that transforms the battlefield view into a network graph — each agent shown with its signal connections, colored by signal age (fresh = bright, stale = dimmed). Clicking on any agent shows its signal chain for the current tick. The "genealogy" mode traces backward from any action: this signal came from here, which received it from there, which originated at this scout's query at Tick 12.

**Buffer state detail:** Each agent's portrait now shows its full buffer in slot-by-slot detail — a vertical strip of N slots, each rendered as a labeled entry showing signal type, source agent, tick age, and fidelity. The slots fill and drain visually as the player scrubs the timeline.

**Latency color overlay:** A battlefield tint mode that colors each agent action by the age of the signal that influenced it. Fresh signals = bright agent action. Stale signals = muted, slightly grey-tinged action. At a glance, the player can see which agents were operating on fresh intelligence and which were acting on 15-tick-old ghost data.

**Per-agent inspection:** Clicking any agent portrait expands the full inspector panel — full rules list, active hooks, current skills, buffer history for the visible tick range.

**Pivot annotation:** Clicking the gold diamond shows the causal chain annotation: exactly what happened in the decisive tick window, in plain language. "At Tick 22, Scout_Alpha's position query returned empty because the buffer was cleared by eviction policy. The fall-through behavior was PATROL-CONTINUE. This gave the opponent's scout a 6-tick advantage in first contact."

**Replay rewind:** Full bidirectional scrubbing. No restrictions.

**"Reconfigure" shortcut:** A button in the top-right corner that, when clicked, collapses the debrief and opens the workbench pre-loaded with the configuration from this match. The debrief doesn't close — it overlays the workbench. The player can reference the debrief while editing the configuration.

### The Act 2 Ambient Register

Act 2 sounds different from Act 1. The battlefield sounds stop — there is no "live" combat sound in Act 2. Instead: a quieter ambient register, like a review room, the sound of an air-conditioned office, low and steady. Individual tool interactions have crisp, mechanical sounds — the scrubber clicking, signal genealogy lines appearing, the gold diamond pinging when clicked.

The music in Act 2, if present, should shift from the ambient battle score to something more contemplative — the tempo reduces, the timbre shifts from rhythmic to sustained. The emotional transition from "participant in a dramatic event" to "analyst reviewing that event" should be sonically supported.

---

## Design Variations

### Variation 1: "The Cold Open" (Act 2-First Access)

When a player chooses "Show result immediately" (opting out of sealed watch), the debrief opens directly in Act 2 mode with no Act 1. The SEALED bar shows the result immediately; the timeline scrubber is available from the start; the gold diamond is visible immediately.

The "cold open" debrief is purely analytical. No emotional arc. Players who choose this path are in diagnostic mode from the beginning — they've accepted the tradeoff of emotional drama for faster iteration. The game accommodates this without friction or shame text. The "cold open" is a valid choice, especially for players on attempt #8 of a stuck mission.

**Design principle:** Act 1 must be the default, but Act 2 must be accessible directly. The two-act structure is a designed experience, not a requirement.

### Variation 2: "The Fast Track" (Skip Act 1 After Watching)

After watching Act 1 once, the player can replay the same match in Act 2 mode directly — the seal is already broken, the outcome is known, the analytical tools are available from the start of the replay.

This enables the "second watch" that players like Petra (the chess veteran from the sealed replay journeys) use: first watch sealed (emotional), then watch again with signal genealogy to trace the genuine pivot. The second watch is structurally different because Act 2 tools are active from tick 0.

### Variation 3: "The Hybrid Watch" (Signal Genealogy During Act 1)

An advanced option (accessible from settings, not the default): a mode that enables *signal genealogy overlay* during Act 1, while keeping the result sealed. The player can trace signal chains during the sealed watch without knowing the outcome.

**Who this serves:** The Keiko archetype (competitive expert who prefers to find pivots without the gold diamond) may want signal genealogy while still watching sealed.

**Risk:** For most players, activating analytical tools during Act 1 undercuts the emotional experience. The recommended default keeps Act 1 purely observational. But the expert option exists.

### Variation 4: "The Collaborative Debrief" (Shared Act 2)

In multiplayer or community context: a shared Act 2 debrief where two players (or a player and a spectator) analyze the same replay simultaneously. Each person has their own timeline cursor; signal genealogy overlays from both cursors are visible. Chat annotations attach to specific tick windows.

This is the foundation of the config necropsy community artifact — two players analyzing a match together, disagreeing about which tick was decisive, tracing signal chains simultaneously, building shared understanding.

**Long-term feature:** Not launch functionality, but an important community surface. The two-act structure makes collaborative debrief natural — you watch Act 1 together (seated side by side, or in a Discord call with screenshare), then do Act 2 together with shared cursor tools.

---

## PvP vs. PvE Structural Differences

### PvP Two-Act Debrief

In Gauntlet async PvP, the two-act structure is at its most natural. The player has been waiting 6-24 hours. The opponent is unknown. Act 1 is maximally suspenseful. The transition to Act 2 is a clean emotional pivot.

**Duration:** Act 1 runs for the full match duration (80-150 ticks, approximately 2-5 minutes). Act 2 follows with no time limit.

**Gold diamond:** Present, algorithmic, points to the genuine pivot.

**False pivot markers:** Present if the match contained false pivots.

**Opponent information in Act 2:** The Act 2 tools reveal the opponent's architecture to the player — signal genealogy shows where enemy signals came from, what hooks they used, how they routed intelligence. This is the PvP debrief's unique value: Act 2 teaches you the opponent's design as well as your own. The "reveal" of the opponent's architecture is designed into the gold diamond annotation: "At Tick 22, the opponent's Scout detected your relay's position because their hook range extended into Quadrant C (your hook range was set to Quadrant A only)." Act 2 is where you learn what they built.

### PvE Two-Act Debrief

In campaign missions, the two-act structure is adapted (see 1.06c-ext-A-iii). Key differences:

**The scenario grid in Act 1:** During a 100-case PvE run, Act 1 shows the scenario grid filling live. The grid is itself a form of progressive reveal — each scenario resolving adds information. The "seal" in PvE is the final score rather than win/loss. The seal breaks when all scenarios are resolved (or the match ends), not at a single decisive tick.

**Act 1 duration in PvE:** Longer than PvP — 100 scenarios resolved over a 3-8 minute Act 1 watch. The scenario grid fills during this time, which is its own emotional engine. The player watches dots turn green and red, knowing their architecture is being tested against every edge case simultaneously.

**Act 2 in PvE:** The failure-cluster grid replaces the gold diamond as the primary Act 2 tool. Instead of a single pivot, Act 2 shows a *pattern* of failures: which scenario types failed, at which tick windows, with which agents implicated. The debrief annotation is not "here is the decisive tick" but "here is the failure cluster — Quadrant C scenarios, ticks 60-80, Relay_Core buffer overflow."

---

## Player Journeys

### Journey: Daniel, 31, DevOps Engineer, First PvP Gauntlet Sealed Watch

**Context:** Daniel is at Operative tier in the Gauntlet, rank 280. He deployed his relay-chain architecture two evenings ago against a player called "NullVector_Prime." He's been practicing patience — he's heard about sealed replay from a clip online and has his settings on default-sealed. The notification arrived during his commute. He waits until he's home.

**Minute 0:00 — The Notification**

Daniel opens the app on his laptop, windowed, second monitor. He pours a glass of water. He does not tap "I can't wait." He taps "WATCH NOW."

The screen loads. The battlefield populates: three agents, relay at center, striker south, scout north. SEALED bar pulses cyan at the top. He can see his relay's compact buffer ring — it's at 20% fill. Good.

He doesn't know what NullVector_Prime built. He'll find out when the scouts make first contact.

**Minute 0:20 — First Contact**

His scout moves north and detects an enemy relay node at Tick 12. The hook chain fires: Scout → Relay_Core (compress 3→1 slot). The relay's buffer ring ticks from 20% to 28%.

An enemy agent is moving south. It's a striker class, judging by the movement signature. Daniel leans forward: "They're pushing aggressive."

His relay has the data. His striker is positioned south. The escalation hook fires: Relay → Striker_One (priority target). His striker receives the signal. He can see the delivery — the compact buffer indicator on the striker shows one slot filling (fresh data, bright white).

*Good.* Daniel's thinking: *fresh data, striker engaged, this should work.*

**Minute 1:15 — The False Pivot**

At Tick 38, his striker intercepts the enemy striker. Direct engagement. Both buffer rings pulse as combat ticks fire. His striker's health indicator (the outer ring of the portrait) starts descending. The enemy striker's health indicator descends faster.

His striker wins the engagement. The enemy striker is eliminated.

Daniel sits back. "There. Done." He can tell from the position that the enemy had only one forward striker. If that's the main attacking unit, the match is his. His relay and scout are intact. The SEALED bar pulses steady cyan. He exhales.

*False pivot incoming — he doesn't know it.*

**Minute 2:00 — The Quiet Unraveling**

At Tick 55, something happens that Daniel doesn't notice: his relay's buffer fills to 85%. He's been watching the battlefield, not the buffer ring. The ring has shifted from amber (75%) to nearly-red (85%), but Daniel's eyes are on the overall battlefield position.

The enemy had a second agent — a jammer class positioned at the center-north chokepoint. His scout, now operating without fresh relay data (the relay is 85% full and starting to evict old scout reports), is navigating blind. It continues patrolling its last-known waypoint, not requesting a retask.

For 20 ticks, his scout patrols an irrelevant area. The jammer accumulates presence at the objective. His relay, buffer at capacity, is evicting scout reports as fast as they arrive — the eviction policy he set ("evict terrain data first") is treating scout position reports as terrain data.

Daniel still hasn't noticed. The buffer ring is glowing red-amber on the replay, but he's watching the north sector where nothing dramatic is happening.

**Minute 2:45 — The Seal Breaks**

The decisive tick window is 55-65. At Tick 65, the outcome is effectively determined: the jammer has accumulated 22 presence ticks uncontested. Daniel's architecture can no longer recover the presence deficit. But the match continues until Tick 110 — there will be 45 more ticks of a match that is already decided.

At Tick 65, the SEALED bar begins dissolving. Left to right.

Daniel blinks. He was still watching the north sector. He looks at the bar. The dissolution is slow — this match was closely contested for the first 65 ticks, so the "close match" dissolve rate is relatively slow.

Behind the dissolving bar: **crimson wash**.

The descent tone plays: a single held note. Then silence.

Daniel stares at the bar. "I... wait. What happened? The striker fight — I won that." He's confused.

**Minute 2:52 — The Materialization**

The Act 2 tools assemble. Timeline scrubber slides in from the bottom. Gold diamond appears at Tick 55-65. Two grey false pivot markers appear — at Tick 38 (the striker engagement he thought was decisive) and at Tick 22 (an earlier scout detection he'd forgotten about).

The curtain-raiser text: *"Outcome determined at Tick 55–65. Scout the pivot before you reconfigure."*

Daniel stares at the grey marker at Tick 38. Then at the gold diamond at Tick 55. "So the striker fight *wasn't* the thing." He clicks the gold diamond.

**Minute 3:00 — The Act 2 Analysis**

The annotation reads:

*"At Tick 55, Relay_Core's buffer reached 85% capacity. Your eviction policy (terrain-first eviction) is treating scout position reports as terrain data and evicting them at this threshold. Scout_Alpha continued operating on Tick 40 position data (now 15 ticks stale) and did not request retask. The jammer at center-north accumulated 22 uncontested presence ticks between Tick 57–79. Your striker (eliminated at Tick 38) had been the jammer-intercept agent; after its elimination, no fallback hook triggered a retask for Scout_Alpha."*

Daniel reads it twice. He opens signal genealogy. He can see the thread: Scout_Alpha's position query returning stale data, the relay's buffer ring filling, the eviction policy eating scout reports, the jammer moving freely. It's all there in the visualization — amber threads that were going nowhere, a grey relay portrait portrait for 20 ticks while it processed its own cache.

*"My eviction policy is wrong. Scout reports are not terrain data. I need a separate eviction priority for agent-position signals vs. static terrain."*

He clicks "Reconfigure." The workbench opens with Relay_Core's context config active — the eviction priority panel loaded. He makes the change in 90 seconds. Total Act 2 analysis time: 4 minutes.

**What Daniel learned:** Buffer management is not about keeping the buffer from filling — it's about the *taxonomy* of what gets evicted when it does fill. His eviction policy was categorically wrong, treating dynamic agent position data as static terrain data. The striking false pivot (the striker fight) was irrelevant. The silent buffer misclassification at Tick 55 decided the match.

**UI Annotations:**
- **SEALED bar dissolve:** left-to-right, 1.2 seconds for a close match, 0.5 seconds for a decisive stomp
- **Gold diamond:** 20px amber pip on the timeline, permanent glow after Act 2 activation, click opens 3-4 sentence annotation with causal chain
- **False pivot grey markers:** 12px grey circles, click shows "This appeared decisive but was not — the match continued for X more ticks after this event"
- **Buffer ring in Act 1 vs. Act 2:** Act 1 = arc fill indicator only (color changes with level); Act 2 = full slot-by-slot visualization showing each entry with type, source, age
- **Curtain-raiser text:** white sans-serif, bottom of the timeline scrubber, 2-second display, fades to ghost

---

### Journey: Yuki, 22, Art Student, Emotional First Win

**Context:** Yuki has been playing for three weeks and just won her first Gauntlet match. She does not understand most of the diagnostic tools. She clicked "WATCH NOW" because the sealed option looked exciting and she wanted to experience whatever that meant.

**Minute 0:00 – The Watch Begins**

Yuki doesn't know what she's looking at tactically. She knows: her robots are blue, the enemy robots are red. Things are happening. Signals are moving (she can see the amber hook threads firing). Her relay is doing something — the compact buffer ring is filling and draining in a pattern she doesn't understand.

She watches because it's visually compelling. The hook chain fire sounds like something is *working*. When her scout detects something, the ping sound makes her sit forward.

She has no idea if she's winning.

**Minute 1:30 – The Cascade**

At Tick 50, a hook cascade fires. Three agents redirect simultaneously. The relay's buffer drains in one cycle. The battlefield shows her striker pivoting north — toward where she thinks the enemy is. The sounds: connect-connect-connect, three hook chains in four ticks. The enemy's unit starts retreating?

*"Is that good? Did I do something?"*

She doesn't know. But it looked impressive.

**Minute 2:10 – The Seal Breaks**

The SEALED bar starts dissolving.

**Amber gold.** Warm, old-brass color filling the result bar.

The ascending three-note tone: *ding, ding, ding.*

Yuki reads the bar for a second. Then: "Oh. OH. OH I WON??"

She hadn't expected to win. She had no confident prediction. The sealed experience worked maximally for her because she had *zero* preconceptions — genuine uncertainty about an architecture she'd built mostly by intuition.

**Minute 2:20 – The Materialization**

The Act 2 tools appear. Yuki doesn't understand most of them. Gold diamond on the timeline. A scrubber. Signal genealogy toggle (she doesn't know what that is). The curtain-raiser text: *"Find what made it work."*

She reads this and thinks: *...I don't know what made it work.*

She clicks the gold diamond — it's the most visually distinct element. The annotation reads:

*"At Tick 44, your striker received a high-fidelity compressed position signal from Relay_Core (signal age: 2 ticks). This is the freshest data your striker had received all match. The striker's position query returned a precise enemy relay location and your striker moved to intercept. The opponent's relay node was eliminated at Tick 51, severing their communication chain. Without relay-to-striker signals, the opponent's striker acted on 18-tick-old data for the remaining 60 ticks."*

Yuki doesn't understand every word. But she understands: *my robot got really fresh information right when it needed it, and that's why it knew where to go.*

She screenshots the annotation. She messages her friend: "ok so I won because my thing got 'fresh data' apparently. idk what that means but I'm going to figure it out."

**What this journey shows:** Act 2 serves Yuki at her level. The gold diamond gives her *one thing to click* and *one plain-language explanation*. She doesn't need signal genealogy or buffer state detail on her third week of playing. The curtain-raiser's "find what made it work" is the right framing for a win — not "debug your failure" but "understand your success." The two-act structure served a new player's first win with emotional impact in Act 1 and accessible insight in Act 2.

**UI Annotations:**
- **Gold diamond as primary Act 2 onboarding element:** The single most prominent clickable element in Act 2. New players will click this first; it's designed to deliver value from that one interaction.
- **Annotation text literacy level:** Adjustable in accessibility settings — "Technical" (current default), "Plain language" (uses no jargon, explains terms inline), "Minimal" (one sentence, no causal chain detail). Yuki would benefit from "Plain language" mode.
- **Screenshot export:** Share button in Act 2 HUD allows exporting the current debrief view (with or without annotation overlays) as an image. Designed for exactly Yuki's behavior.

---

### Journey: Rodrigo, 38, Architect, Deep Act 2 Diagnostics Session

**Context:** Rodrigo is at Commander tier, rank 22. He's been playing for 11 months. He watches sealed replays of every Gauntlet match but his Act 2 sessions often run 20-40 minutes. He considers Act 2 the actual game — Act 1 is the emotional setup. He is currently analyzing a loss where his architecture performed well by all surface metrics but lost consistently to a specific opponent playstyle.

**Rodrigo's Act 2 Practice**

After the seal breaks and the materialization completes, Rodrigo does not click the gold diamond first. He opens signal genealogy and runs the replay from tick 0, watching signal chains build and collapse in slow motion (0.25x speed). He's looking for something specific: whether his relay's compression skill is degrading the fidelity of position signals.

At Tick 18, he sees it: the relay receives a 3-slot position report from Scout_Alpha, compresses it to 1 slot. The compressed signal has fidelity score 0.72 (compressed from the scout's 0.91 original). His striker's rules have a fidelity threshold of 0.75 — the compressed signal *almost* passes the threshold.

At Tick 22: the striker receives the 0.72 signal and the threshold rule fires a fall-through: "fidelity too low — skip and patrol." The striker ignores the signal.

Rodrigo pauses. "The compression is eating fidelity. It drops from 0.91 to 0.72, which is below my threshold. So I'm compressing my way out of useful signals." He annotates the frame: *"Compression fidelity loss — threshold mismatch"*.

He then runs the signal genealogy for the opponent's architecture in the same tick range. The opponent's relay doesn't compress at all — they use a direct relay (3-slot pass-through, high latency) rather than a compression relay. Their striker receives the 0.91 signal directly and the threshold fires correctly.

"They sacrificed buffer efficiency for fidelity. I was optimizing for buffer efficiency and accidentally dropped signal quality below my own threshold. Classic over-optimization."

He makes three notes. He'll need to either raise the compression ratio (less aggressive compression, higher fidelity output) or lower the striker's threshold slightly. There's a tradeoff: lower threshold might cause the striker to act on lower-quality intelligence in other scenarios.

He runs the latency overlay next, checking whether the direct-relay opponent's latency is actually a disadvantage in other tick ranges. He finds two windows where the opponent's 3-slot relay delivery was delayed by 2 ticks compared to his compression relay. In those windows, *his* striker had better data than theirs. So the strategies are genuinely in tension — not one-better-than-other, but map-position dependent.

**Total Act 2 session:** 38 minutes. Three config changes identified. Two tradeoffs documented.

**UI Annotations:**
- **Signal genealogy at 0.25x speed:** A speed selector in the genealogy overlay — 0.25x, 0.5x, 1x, 2x. At 0.25x, each tick takes 4 seconds of real time, allowing close inspection of individual signal deliveries.
- **Fidelity score in genealogy lines:** When hovering over a signal thread in genealogy overlay, a tooltip shows: signal type, source agent, original fidelity, current fidelity (after any compression), recipient, and the rule that acted on it.
- **Opponent architecture visibility in Act 2:** After the seal breaks, the opponent's hook architecture is revealed in the genealogy overlay as a second color set (player's hooks = amber; opponent's hooks = teal). Players can trace the opponent's signal chains the same way they trace their own.
- **Annotation notes:** A text field attached to any paused frame in Act 2. Notes persist across sessions (saved with the replay file). Rodrigo's annotation practice is supported by this feature.

---

## Comparable Games and Media

### Chess.com: The Post-Game Analysis (Closest Functional Analogue)

Chess.com's post-game analysis has a two-act structure by convention if not by design: players typically play the game first (Act 1 equivalent — they're playing, not analyzing), then open the "Review game" engine analysis afterward (Act 2). The problem is that Chess.com shows the game result immediately — there is no Act 1 sealing mechanism. The two acts are separated by a conscious player choice to open the engine, not by a designed transition.

**What Robot Uprising improves:** The sealing of Act 1 is intentional, not optional. The transition is a designed moment, not a button click to open an analysis panel. The diagnostic tools appear *because* the seal broke, not because the player thought to open them.

**What Chess.com does well:** Accuracy percentage, "brilliant/good/inaccuracy/mistake/blunder" move annotations, and the engine's evaluation bar are all excellent Act 2 analogues. The blunder annotations are the gold diamond equivalent — they point you to the decisive mistake rather than requiring full move-by-move review.

### Frozen Synapse: The Dual Replay (Best Emotional Precedent)

Frozen Synapse is the most direct emotional precedent for Act 1. Both players watch their orders play out simultaneously against the opponent's sealed orders. The resolution is organic — neither player knows the outcome before watching.

What Frozen Synapse lacks: a true Act 2. After the replay, there's no scrubber, no signal trace, no diagnostic annotation. Players must reconstruct what happened from memory. Robot Uprising's Act 2 is the diagnostic system Frozen Synapse needed but didn't build.

### Game Film Review in NFL: The Professional Analogue

NFL teams spend more time reviewing game film than playing games. The film review room is the institutional Act 2 — after the emotional Act 1 of the game itself, coaches and players use film tools (telestration, slow motion, angle switching, side-by-side comparison) to diagnose what happened.

Players on a team that won still watch film — to understand what worked. This is exactly the "Find what made it work" framing Robot Uprising should have for Act 2 on wins as well as losses.

**What this implies for Robot Uprising:** Act 2 should be culturally framed as a "film room" — not a failure analysis tool, but a professional review tool used after both wins and losses. The game should signal that high-performing players spend significant time in Act 2, not just debugging failures.

### The Dark Souls Message System: Asynchronous Community Annotation

Dark Souls' message system is an asynchronous Act 2 — players leave notes that other players discover. The game's community operates a distributed "what happened here" annotation layer. This is the community-debrief equivalent of Robot Uprising's Act 2.

**Config necropsy culture** is Robot Uprising's version of this: the shareable annotated replay, the community "here's what I found in Act 2" posts. The two-act structure makes this possible — Act 1 produces the emotional event, Act 2 produces the analysis artifact, and the annotation export tools make the artifact shareable.

---

## Sensory Description

### Act 1 Feels Like:

A darkened observation room with a window onto the battlefield. The control panel is covered. You can see everything happening; you cannot intervene; you cannot pull up documentation. The sounds are field sounds — hook chains connecting like radio messages crackling through, buffer fills ticking like a Geiger counter, the SEALED bar breathing like a pending verdict. The whole thing has the quality of watching someone else's operation from a satellite feed, except it's your operation, and you designed the agents, and you don't know if they're winning.

The room is slightly cool. The light is blue-grey. The SEALED bar is the only warm element — its cyan pulse is the color of standby systems, of things that are ready but not yet resolved.

### The Transition Feels Like:

The window suddenly cracks. Then shatters inward — but slowly, methodically, from left to right, like a paper document being unsealed rather than broken. Behind the shattering seal: either warm gold light or cool red light, filling the observation room. The temperature of the room changes. The control panel cover lifts, instruments assembling with soft mechanical precision. The field sounds stop. The review room sounds begin.

It's the difference between watching a test run and reading the printout.

### Act 2 Feels Like:

An analysis station at the same window, but now the window is interactive. You can tap any moment, replay it at any speed. The field still exists on the other side of the glass, but you're now holding a probe rather than watching passively. The tool sounds are clean and satisfying — the timeline clicking, the signal genealogy lines drawing with a soft trace sound, the gold diamond glowing when touched. The ambient sound is analytical — quieter, slightly reverberant, the sound of a server room at low load.

The gold diamond is the brightest object in the room. It says: *start here*.

---

## Strengths

**Makes both emotional and analytical value available without compromise.** Act 1 is not corrupted by analytical tools. Act 2 is not constrained by emotional framing. Each act is pure in its register.

**The transition is itself valuable.** The 5-second materialization sequence is not dead time — it's emotional transition time. Players who've experienced the sequence dozens of times report that the materialization sound design itself starts to carry meaning: hearing the tools assemble signals "now I understand what happened."

**Scales across player sophistication.** A 14-year-old and a Commander-tier expert both have Act 1 as a valid shared experience. Their Act 2 interactions diverge dramatically (Yuki clicks one thing; Rodrigo spends 38 minutes with signal genealogy), but both have a natural Act 2 entry point (the gold diamond).

**Teaches the diagnostic habit transfer explicitly.** The two-act structure models the professional engineering practice: first experience the system running, then diagnose what happened. This is not incidentally educational — it is the exact workflow that transfers to real agentic AI engineering. The game's structure is the lesson.

---

## Weaknesses

**Act 1 duration can drag.** A 150-tick match runs for 4-5 minutes of Act 1. Players who are impatient or in rapid-iteration mode will resent mandatory non-analytical watching. The opt-out ("Show result immediately") is essential, but even with opt-out, the default is designed for a pacing that may frustrate some player archetypes.

**The materialization sequence can feel slow after many repetitions.** Twelve to fifteen seconds of materialization animation, experienced 100+ times, may begin to feel like a loading bar. A "skip materialization" option in accessibility settings (bypasses the assembly animation but still provides a beat of silence before Act 2) is warranted.

**Act 2 tool depth is intimidating.** Signal genealogy, latency overlay, buffer slot detail, per-agent inspector — these tools together create a sophisticated analytical environment. New players who click into Act 2 unprompted may be overwhelmed. The gold diamond as a single "start here" entry point is the mitigation, but Act 2's full capability is not self-teaching.

**The transition can feel manipulative when a loss follows a spectacular false pivot.** Players who watched a beautiful hook cascade fire in Act 1, then see crimson wash, may feel the game is taunting them — "look how impressive that cascade was, and you still lost." The framing of the Act 2 annotation must be sensitive here. The annotation for this scenario is "your cascade executed correctly — the outcome was determined earlier." This is accurate and not discouraging, but it requires careful UX writing.

---

## Interaction Effects

**With 1.06c-ext-A — Sealed Replay:** The two-act structure is the designed container for sealed replay. Act 1 *is* the sealed watch. Without a designed Act 2, sealed replay has nowhere to go after the reveal — it's an emotional beat with no analytical follow-through. Act 2 is what makes Act 1 matter beyond the moment.

**With 1.06c-ext-A-ii — False Pivot Anti-Pattern:** The gold diamond in Act 2 is the primary mechanism for correcting false pivot misdiagnosis. The false pivot happens in Act 1 (emotional misidentification); the correction happens in Act 2 (annotation pointing to genuine pivot). The two acts are specifically designed around this problem.

**With 4.04a — Debrief as Debugger:** Aspect 4.04a explores the debrief scrubber as a step-through debugger. This is entirely Act 2 functionality. Act 2's interface *is* the debugger described in 4.04a. The two-act structure specifies *when* the debugger activates and how it's introduced (via the seal-breaking transition).

**With 4.16 — Signal Genealogy Visualization:** Signal genealogy is an Act 2-only feature. Its activation as part of the materialization sequence (appearing in the tool tray as the analytical layer assembles) makes its visual introduction part of the transition design. It should materialize with particular visual prominence — the genealogy toggle arriving last in the assembly sequence as the "most powerful tool" signal.

**With 5.22 — The Gauntlet as Third Act:** If the game's narrative is three acts (campaign, advanced campaign, Gauntlet), then the two-act debrief is a fractal: each individual match also has two acts. The player lives in a nested act structure — campaign missions produce two-act debriefs, which together constitute the first act of the meta-campaign. The debrief's emotional-then-analytical rhythm is a microcosm of the game's macro structure.

**With 7.10 — Config Necropsy as Community Artifact:** The two-act structure produces the material for config necropsies. Act 1 produces the authentic emotional response ("I had no idea that was happening"). Act 2 produces the diagnostic insight ("the genuine pivot was the eviction policy misclassification at Tick 55"). The necropsy post documents the arc from Act 1 discovery to Act 2 understanding. Both acts are necessary for the artifact to have narrative shape.

---

## New Aspects Discovered

- **4.21 — The materialization sound design as learned signal:** Across many replays, the materialization sequence's specific sounds (scrubber assembling, gold diamond ping, signal genealogy trace sound) become conditioned cues for "entering analysis mode." Deep dive on designing these sounds as a learned vocabulary — what they should sound like on first hearing vs. what they should trigger in a veteran player; the UX design of a sound that is satisfying at first and meaningful later.

- **4.22 — Act 2 tool introduction sequence:** What order do Act 2 tools appear in the materialization, and what does the order communicate about which tool to use first? Gold diamond first (priority diagnostic), signal genealogy last (expert tool)? Or organize by the player's own journey through the tools? Deep dive on the materialization sequence as an onboarding arc compressed into 2 seconds.

- **4.23 — Replay annotated export format:** The shareable replay artifact that includes Act 1 timestamp annotations, Act 2 notes, and gold diamond location — a file format designed for community sharing and config necropsy culture; what information gets exported and what stays local; interaction with workshop and community sharing systems.

- **4.24 — The "hot take vs. cold analysis" temporal gap:** Studies of sports analysis show that analysis done immediately after a match is systematically biased toward outcome (hot take mode); analysis done 24+ hours later is more accurate (cold mode). Should Robot Uprising's debrief have a timer mechanic — Act 2 tools are available immediately but a "24-hour cold analysis" mode unlocks additional insights only after temporal distance? Or would this friction destroy the iteration loop entirely?

- **8.11 — The two-act structure as pedagogical framework:** Cross-cutting synthesis of how the emotional-first, analytical-second sequence maps to real agentic AI engineering workflows; are there actual methodologies (blameless postmortems, incident review, chaos engineering) that follow the same structure; what does Robot Uprising teach by making this structure visceral and habitual?
