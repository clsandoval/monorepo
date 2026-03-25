# 1.14c — Peaceful Mode as Accessibility Escape Valve

**Aspect:** 1.14c — Peaceful mode as accessibility escape valve: sandbox mode for configure-and-test without mission pressure; ghost preview vs. full simulation; interaction with plan screen design
**Status:** Complete
**Category:** Competitive Analysis (Factorio sub-aspect)
**Related aspects:** 1.14 (Factorio), 5.03 (tutorial as sandbox), 4.04a (debrief as debugger), 5.04 (complexity ramp), 5.05 (campaign structure), 6.02 (audio design), 3.02 (skill acquisition), 2.00g (personality ceiling)

---

## The Option Itself

Factorio's peaceful mode removes alien attacks entirely. Biters exist on the map but never attack, never expand, never interact with the factory. The player can build, research, and optimize without time pressure or defensive obligations. It transforms a survival-factory game into a pure construction sandbox. The game changes from "build a factory that survives" to "build a factory that works."

For Robot Uprising, a peaceful mode must answer a harder structural question: **what does "remove the enemy" mean when the entire game is about configuring agents to fight an enemy?** You cannot simply delete the red units and leave the player with an empty board. The game's core verb — "design attention systems" — only produces observable behavior when agents have something to attend to. A Scout with perfectly configured context filters staring at an empty grid is indistinguishable from a broken Scout.

This means Robot Uprising's peaceful mode is not "remove enemies." It is **"remove consequences."** The enemies are still there. The battle still runs. But nothing is at stake. No mission fails. No resources are consumed. No campaign progress is affected. The player gets an infinite sandbox to configure, execute, observe, and iterate — the same plan → sealed watch → inspector loop, but decoupled from progression pressure.

### Ghost Preview vs. Full Simulation

Two implementation flavors exist:

**Ghost Preview** runs a lightweight projection of the first N ticks (say, 8-12) the moment the player places or modifies a unit on the plan screen. No EXECUTE button required. The board shows translucent afterimages — "ghosts" — of where units will move, which rules will fire, which hooks will transmit. The ghosts overlay the plan screen itself, turning it into a living schematic. The player drags a rule higher in the priority list and watches the ghost paths shift in real time. This is the **immediate feedback** variant. It turns the plan screen into a what-if scratchpad.

**Full Simulation** is the standard plan → sealed watch → inspector loop, but in a consequence-free sandbox. The player hits EXECUTE, watches the full sealed watch (all ticks, full resolution, full audio), enters the inspector with full analytical tools, then returns to the plan screen with zero impact on campaign state. This is the **practice round** variant. It preserves the emotional arc of sealed watch — the tension of watching, the relief or disappointment — but removes the stakes.

These are not mutually exclusive. Ghost preview is a plan-screen feature that could exist in normal campaign play. Full simulation is a mode toggle that wraps the existing loop. The design question is which to build, when to surface each, and how they interact.

---

## Player Journeys

#### Journey: Marisol, 34, UX Designer, Manila

**Context:** Mission 5 (Assembly Line). Just encountered the factory system for the first time. Has completed missions 1-4 with hand-configured units but has never built a blueprint or managed a production queue. Feeling overwhelmed by the simultaneous introduction of blueprints, channels, and resource economy. Has failed Mission 5 twice — both times her striker blueprint spawned units that wandered aimlessly because the channel wiring was wrong.

**Minute 0:00 — The Escape Hatch**
Marisol stares at the mission failure screen for the second time. The boot log reads `[CORE] MISSION FAILURE: 0/3 objectives completed. Configuration inadequate.` Below the RETRY button, a new option she hasn't noticed before: a small text link in muted amber, the same color as the whisper bar — `[sandbox: test your blueprints without stakes]`. She hesitates. The link doesn't look like a button. It looks like a system message, something the AI would say to itself. She clicks it.

**Minute 0:15 — The Sandbox Loads**
The plan screen appears, but different. The mission timer in the upper-right is replaced by an infinity symbol (∞) rendered in the boot-log monospace font, pulsing with a slow, barely perceptible amber glow. The resource counter still shows material and compute, but the numbers are a translucent teal rather than the usual solid white — a visual signal that these are simulated resources, not real ones. The board shows the same Mission 5 layout: her base tile, the enemy positions, the three objective nodes. But the entire scene has a subtle scanline overlay — faint horizontal lines scrolling upward at 1px/second, like viewing a CRT monitor through a camera. The audio shifts: the kulintang melody plays at 60 BPM instead of 70, slower, more contemplative, with a gentle low-pass filter softening the gong attacks. The sub-bass hum drops an octave. The feeling is warmth. Safety. A practice room, not a battlefield.

**Minute 0:30 — First Ghost Preview**
Marisol drags her Striker blueprint onto the production queue. As she does, ghost silhouettes appear on the board — translucent cyan outlines of where the first spawned striker will move during the first 8 ticks, based on its current rule configuration. The ghosts are rendered as dotted outlines, each successive tick slightly more transparent than the last, creating a fading trail. She sees the ghost striker move north, then east, then stop — no rule is telling it what to do after it loses sight of the spawn point. The trail just ends. A tiny question mark icon pulses at the ghost's final position. She hasn't executed anything. She hasn't pressed a button. The board is showing her, in real time, that her configuration has a dead end.

**Minute 1:00 — Iterative Wiring**
She opens the Striker blueprint and adds a rule: `IF receiving_signal ON strike-net → MOVE toward signal_source`. The ghost trail updates instantly. Now the translucent striker moves north, receives a signal on tick 4 (shown as a tiny green ping along the ghost trail), pivots west toward the signal source, and continues. The trail extends further, reaching an enemy position by tick 7. She watches the ghost reach the enemy and a faint red X appears — the ghost preview doesn't simulate combat, just proximity. She grins. The wiring works.

**Minute 2:00 — Full Simulation Run**
She wants to see the real thing. She presses EXECUTE. The scanline overlay fades. The kulintang accelerates. The agung drops. For the next 45 seconds, she watches a full sealed-watch simulation — her factory spawns a striker, the scout detects an enemy, the relay forwards the signal on east-net, the striker receives it on strike-net and moves to engage. Elimination. Dabakan crack. But something goes wrong at tick 14: a second enemy approaches from the south and nobody detects it. The scout was facing north. She watches her base get tagged by the undetected enemy.

**Minute 3:00 — Inspector Without Guilt**
She enters the inspector. Full tools. Buffer viewer, action trace, channel metrics. She scrubs to tick 14 and sees the scout's context window — it was full of north-quadrant observations, no room for the southern approach. She needs a second scout, or she needs to widen the first scout's patrol. She scrubs back and forth, taking her time. There is no "you failed" screen waiting. No resource penalty. No retry counter incrementing. She can stay here as long as she wants.

**Minute 5:00 — Return and Retry for Real**
She exits the sandbox. The boot log shows: `[SANDBOX] Session complete. 1 execution, 14 ticks observed. No campaign state modified.` She's back at the Mission 5 briefing. She hits START. This time, she places two scouts — one north-facing, one south-facing — and splits them onto separate channels. She knows this will work because she already saw the gap.

**UI Annotations:**
- **Sandbox toggle link:** Bottom of mission failure screen, muted amber monospace text, no button chrome, feels like a system log entry rather than a UI element
- **Infinity timer:** Upper-right, replaces mission timer, amber pulsing glow, monospace ∞
- **Resource counters:** Same position, but rendered in translucent teal instead of solid white
- **Scanline overlay:** Full-screen, 1px horizontal lines scrolling upward at 1px/sec, 8% opacity
- **Ghost trails:** Translucent cyan unit outlines, dotted borders, opacity fading from 80% (tick 1) to 20% (tick 8)
- **Ghost signal pings:** Small green circles along ghost trails where hook transmissions would occur
- **Dead-end indicator:** Pulsing question mark at the position where a ghost's trail terminates due to no applicable rules

---

#### Journey: Kenta, 19, CS Student, Osaka

**Context:** Mission 8 (Breach). Has been playing for 6 hours across multiple sessions. Comfortable with all core mechanics. Currently trying to design a relay chain that handles multi-objective missions — forwarding different signal types to different strikers based on content. He's not stuck. He's optimizing. He wants to test a specific hypothesis about channel topology without burning 15 minutes on a full mission attempt each time.

**Minute 0:00 — Sandbox as Laboratory**
Kenta doesn't enter sandbox from a failure screen. He enters it from the campaign map — a small beaker icon next to each unlocked mission node. He taps the beaker on Mission 8. The sandbox loads the Mission 8 map layout with all enemy positions, objective markers, and terrain features intact. The scanline overlay appears. The infinity timer. He's been here four times today already.

**Minute 0:10 — Hypothesis Testing**
His hypothesis: a single relay with 4 hook slots can serve as a signal router if he names channels carefully — `threat-north`, `threat-south`, `strike-north`, `strike-south`. The relay listens on both threat channels and forwards to the corresponding strike channel based on signal content. He wires it up. The ghost preview shows signal paths as colored arcs between unit ghosts — green for `threat-north`, blue for `threat-south` — curving across the board like circuit traces. He watches the arcs and sees a collision: both threat signals arrive on the same tick, and the relay only processes one per tick. The second signal queues. The queue visualization appears as a tiny stack of colored dots next to the relay ghost, growing by one dot. He sees the queue grow to 3 before the relay catches up. Three ticks of latency. Is that acceptable?

**Minute 0:40 — Rapid Iteration**
He modifies the relay's eviction priority to favor newer signals. The ghost preview updates. The queue behavior changes — older signals get dropped, newer ones process immediately. The latency drops to 1 tick but now he's losing signals. He toggles between configurations, watching the ghost arcs shift. Each toggle takes 2 seconds. He does this eleven times in 90 seconds, each time watching the ghost trails and signal arcs reshape. This is the core sandbox value for advanced players: **rapid parameter sweeping without execution overhead**.

**Minute 2:00 — Full Simulation for Validation**
He settles on a configuration and runs a full simulation to see if the ghost preview's predictions hold under realistic conditions. EXECUTE. Sealed watch. The relay handles the two-front assault well for the first 20 ticks, but at tick 22 a third threat vector opens (enemy spawner activates) and the relay's queue backs up fatally. He enters the inspector, identifies the exact tick where queue depth exceeded buffer capacity, and realizes he needs two relays, not one. Ghost preview couldn't show this because it only projects 8 ticks and the spawner activates at tick 18.

**Minute 4:00 — The Discovery**
He redesigns with two relays — one per front — and runs another full simulation. It works. He exits sandbox, launches Mission 8 for real, and clears it on the first attempt. Total sandbox time: 12 minutes across 4 sessions. Total real mission attempts: 1. The sandbox didn't make the game easier — it made his thinking faster.

**UI Annotations:**
- **Beaker icon:** Campaign map, next to each unlocked mission node, 16x16 pixels, rendered as a line-art Erlenmeyer flask in the boot-log amber color
- **Signal arcs:** Curved lines between unit ghosts showing channel routing, color-coded per channel name, animated with traveling dots showing signal direction
- **Queue depth indicator:** Stack of colored dots next to relay ghosts, grows/shrinks in real time as ghost preview projects queue behavior
- **Configuration toggle:** Plan screen tools remain fully interactive during ghost preview — every change triggers a 200ms ghost recalculation with a soft fade transition

---

#### Journey: David, 52, Retired Engineer, Sydney

**Context:** Mission 2 (First Contact). Just started the game. Has motor control limitations (mild essential tremor) that make time-pressured interactions difficult. Chose sandbox mode from the options menu before starting the campaign, toggling "Sandbox Campaign" which makes every mission consequence-free by default.

**Minute 0:00 — A Different Campaign**
David launches Mission 2. The briefing appears with the same boot-log narrative, the same map reveal, the same enemy placement. But the infinity timer is present from the start. The scanline overlay is absent — he toggled it off in accessibility settings because the scrolling lines triggered mild visual discomfort. Instead, a thin amber border around the board indicates sandbox mode — unobtrusive, always present, a gentle reminder that this is practice space.

**Minute 0:30 — Unlimited Exploration**
He opens the Scout blueprint. He reads each rule slowly, hovering over them for 5-10 seconds each. The whisper hints trigger often because his interaction pace is slower than the hint cooldown assumes. He doesn't mind — they feel like a patient instructor. He drags a rule to a new priority position. His hand trembles slightly and the rule snaps to the wrong slot. In normal mode, he'd need to undo quickly. In sandbox, he pauses, breathes, drags it again. No time pressure. No tick clock counting down. The kulintang plays its slow 60 BPM meditation.

**Minute 3:00 — Execute and Learn**
He presses EXECUTE. The sealed watch plays. He watches intently but doesn't fully track what happened — the 1-second ticks move faster than he can process. In the inspector, he uses the tick-by-tick scrubber, advancing one tick at a time. He spends 4 minutes on a 20-tick battle, examining each unit's context window at each moment. He discovers that his scout detected the enemy but the rule he configured had the wrong priority — "patrol" outranked "report-enemy." He returns to the plan screen and fixes it.

**Minute 8:00 — The Choice to Progress**
After three sandbox executions, David is satisfied with his configuration. A button appears in the sandbox toolbar: `[DEPLOY: Run this mission for real]`. He clicks it. The scanline overlay (or amber border, in his case) fades. The infinity timer is replaced by the mission timer. The resource counters solidify from teal to white. The kulintang tempo rises to 70 BPM. He's in the real mission now, with a configuration he trusts. He completes it on the first real attempt.

**UI Annotations:**
- **Sandbox Campaign toggle:** Options menu → Accessibility → "Sandbox Campaign: all missions start in sandbox mode"
- **Amber border:** 2px solid border around the board in `#d4a040`, replaces scanline overlay for players who disable it
- **DEPLOY button:** Appears after at least one sandbox execution, centered below the board, amber text on dark background, monospace font: `[DEPLOY: Run this mission for real]`
- **Tick-by-tick scrubber:** Inspector timeline with left/right arrow buttons for single-tick advancement, 48px hit targets for motor accessibility

---

## Strengths

**The Learning Accelerator Pattern.** Sandbox mode doesn't make the game easier — it makes *understanding* faster. The core game loop already teaches through failure (configure → execute → observe failure → diagnose → reconfigure). Sandbox mode removes the friction between iterations: no mission restart, no repeated briefing, no resource penalty. The player stays in the learning loop without the punishment loop. This is the same pattern that makes Factorio's peaceful mode popular not just with casual players but with experienced players designing complex systems — you iterate faster when you're not defending your factory.

**Ghost Preview as Plan-Screen Enhancement.** The ghost preview variant doesn't require a separate mode at all. It enhances the standard plan screen by making configuration changes immediately visible. This follows the Into the Breach "consequence preview" pattern — showing the player what will happen before they commit. For Robot Uprising, where the player can't control units during battle, pre-execution visibility is one of the few ways to reduce the anxiety of the sealed watch.

**Accessibility Without Condescension.** The sandbox doesn't simplify the game. Every system is present. Every tool is available. The difficulty of designing good attention systems is unchanged. What's removed is only the meta-pressure: the mission timer, the resource cost, the campaign consequence. This means players with cognitive or motor accessibility needs can engage with the full game at their own pace without encountering a "baby mode" stigma.

**The TikTok Clip.** A split-screen: left side shows the plan screen with ghost trails updating in real time as the player drags rules around. Right side shows the resulting sealed watch. The player moves one rule — the ghost trails shift — the battle outcome changes. Caption: "I can see the future before I press play." The ghost preview is inherently visual, inherently satisfying, and communicates the game's core fantasy (designing systems that behave predictably) in 15 seconds.

---

## Weaknesses

**The Sealed Watch Tension Collapse.** Sealed watch is designed to be anxious. You can't intervene. You can only observe. The drama comes from not knowing if your design will hold. In sandbox mode, the stakes are zero. The sealed watch becomes a screensaver — pretty but emotionally flat. Factorio doesn't have this problem because its moment-to-moment gameplay is the same regardless of enemy presence. Robot Uprising's sealed watch is *only* interesting because something is at stake. Removing stakes removes the game's emotional core.

Mitigation: The ghost preview variant avoids this by keeping sandbox to the plan screen. Full simulation sandbox should be framed as "test run" rather than "the real experience" — something you do to validate, not to play. The real play is always with stakes.

**The Difficulty Cliff.** If a player spends 20 minutes in sandbox perfecting a configuration for Mission 5, then deploys it for real, the mission becomes trivially easy. The sandbox has already shown them every failure mode and they've already solved each one. The first real attempt is a victory lap. This undermines the campaign's difficulty curve — missions are designed assuming the player will fail 2-3 times before succeeding, and each failure teaches something. Sandbox front-loads all the learning into a zero-stakes environment, leaving the real mission as a hollow formality.

Mitigation: The "invisible randomization" system (each EXECUTE varies within constraints) partially addresses this — the sandbox run won't be identical to the real run. But if the player's design is robust enough to handle sandbox variation, it's almost certainly robust enough for the real mission. The deeper mitigation is accepting this tradeoff: sandbox makes missions easier, and that's fine, because the player who used sandbox still learned the same lessons. The learning is the game, not the score.

**Ghost Preview Computational Cost.** Projecting 8-12 ticks of deterministic simulation in real time, updating with every parameter change, is expensive — especially when the player is dragging sliders continuously. The simulation must run fast enough that the ghost trails feel responsive (sub-200ms latency). For complex boards with many units, channels, and relay chains, this may require significant optimization or a reduced-fidelity ghost (fewer ticks, simplified signal routing). The risk is that the ghost preview becomes unreliable — showing behavior that diverges from actual execution — which would undermine trust in the tool.

**Narrative Dissonance.** Robot Uprising frames the player as an AI orchestrating a rebellion. The narrative voice is urgent — boot logs reference system compromise, mission deadlines, escalating threats. Sandbox mode breaks this fiction. An AI architect in the middle of an uprising doesn't have time for practice runs. The scanline overlay and infinity timer are visual signals that "this isn't real," which is precisely the problem: the game's fantasy depends on everything feeling real.

Mitigation: Frame sandbox narratively as **simulation runs within the AI's own planning subsystem.** The boot log could read: `[CORE] SIMULATION MODE: modeling battlefield outcomes before deployment. No resources committed.` This is actually more diegetically consistent than the real missions — of course an AI would simulate before deploying. The sandbox isn't an escape from the narrative. It IS the narrative. The AI architect who simulates first and deploys confidently is more compelling than one who throws units at a wall repeatedly.

---

## Interaction Effects

### With the Plan Screen
Ghost preview transforms the plan screen from a static configuration tool into a living schematic. Every change produces visible consequences on the board. This raises the plan screen's information density significantly — ghost trails, signal arcs, queue indicators, dead-end markers all compete for visual space with the actual unit positions, terrain tiles, and workbench panels. The risk is visual clutter. The mitigation is progressive disclosure: ghosts are only visible when the player is actively editing a blueprint (the workbench panel is open). When the workbench closes, ghosts fade, and the board returns to its clean state.

### With Sealed Watch
Full simulation sandbox preserves the sealed watch exactly as-is — same visuals, same audio, same temporal structure. The only difference is what comes after: no mission success/failure screen, just a direct transition to inspector. The sealed watch's "no skip, no fast-forward" constraint should remain in sandbox mode. If the sealed watch isn't compelling even without stakes, the game has a deeper problem. Sandbox mode is a quality test for sealed watch design.

### With the Inspector
The inspector is unchanged in sandbox mode. If anything, it's more useful — the player has more patience for deep analysis when there's no "retry" button pulling them back to the plan screen. Sandbox inspector sessions will likely be longer and more thorough than campaign inspector sessions, which means the inspector's UI must handle extended use (comfortable scrubbing, no performance degradation on long timelines, readable at slow tick-by-tick pace).

### With Campaign Progression
Two models: **Parallel Sandbox** (sandbox is always available alongside real missions, accessed via the beaker icon) and **Sandbox Campaign** (all missions are sandbox by default, real deployment is opt-in). Parallel sandbox has no campaign interaction — it's a side tool. Sandbox campaign needs a progression gate: the player must eventually DEPLOY for real to advance. The DEPLOY button appearing after at least one sandbox run creates a natural rhythm: sandbox until comfortable, deploy when ready. This is the "commit when ready" pattern from version control systems — you work in a branch, you merge when confident.

---

## Comparable Games

**Factorio Peaceful Mode** removes biters as a threat but keeps them on the map. The player can still observe biter behavior, build near nests without attack, and even coexist. The factory's challenges remain (throughput, logistics, power). Factorio also offers a **Sandbox scenario** (separate from peaceful mode) that gives infinite resources, instant construction, and no tech tree — pure building with no constraints. Robot Uprising's sandbox sits between these two: enemies present, stakes removed, tools unchanged.

**Minecraft Creative Mode** gives flight, infinite blocks, no damage, no hunger. It's a fundamentally different game from Survival. Players use it for architecture, redstone testing, and exploration. The lesson: creative mode users and survival users are often the *same* people at different moments. They switch modes based on intent (building vs. surviving). Robot Uprising's sandbox should feel like a mode switch, not a difficulty setting.

**Kerbal Space Program's Sandbox Mode** unlocks all parts from the start (vs. Career mode's tech tree). KSP's sandbox is where players learn orbital mechanics without resource constraints. Notably, KSP later added a **Science Mode** — a middle ground with tech progression but no budgets or reputation. This three-tier approach (full stakes / reduced stakes / no stakes) might apply to Robot Uprising: Campaign / Sandbox Campaign / Free Sandbox.

**Into the Breach's "Custom Game" option** (Advanced Edition) lets players configure squad, difficulty, and island count. It's not a sandbox — every configuration is still a real run with stakes. But it provides a controlled testing environment for experienced players. Robot Uprising's sandbox goes further by removing stakes entirely, which Into the Breach never does.

**Gladiabots' "Free Play" mode** is the closest analog. Gladiabots lets players test AI configurations in custom scenarios with chosen unit compositions, map layouts, and opponent behaviors. The player configures, executes, observes, and iterates with no ranking impact. Robot Uprising's sandbox should study Gladiabots carefully here — Gladiabots proves that the "configure AI → test → iterate" loop is compelling enough to sustain a standalone mode.

---

## Sensory Description

**Entering Sandbox.** The transition is a slow exhale. The screen's color temperature shifts warmer — the SE Asian cyberpunk palette's teals and neon blues desaturate by 15%, the ambers and golds brighten by 10%. The effect is sunset rather than midnight. The kulintang melody, already playing in the plan screen, drops its tempo from 70 to 60 BPM. The gong attacks soften — less percussive ring, more sustained tone, as if the gongs are underwater. A single boot log line types itself across the top of the screen in amber monospace: `[CORE] ENTERING SIMULATION MODE...` followed by a cursor blink, then: `[CORE] No resources will be committed. Iterate freely.` The infinity symbol fades in where the mission timer was, pulsing once every 4 seconds — a heartbeat, slow and steady.

**Ghost Trails on the Plan Screen.** The ghosts are luminous — they glow faintly against the dark board tiles like bioluminescent organisms in deep water. Each ghost is a wireframe outline of the unit sprite, rendered in the unit type's signature color (scout cyan, striker red-orange, relay gold, specialist violet, command white) at 40% opacity. As the player drags a rule to a new priority position, the ghost trails dissolve (a 150ms fade) and reform (a 200ms fade-in) along new paths. The reformation has a subtle particle effect — tiny motes of the unit's color scatter from the old path and coalesce along the new one, like iron filings aligning to a magnet. Signal transmissions along ghost trails appear as traveling pulses — bright dots that move along the signal arc at a visible speed, arriving at the receiver with a tiny flash. The overall effect is watching a circuit diagram come alive.

**The Sandbox Sealed Watch.** Visually identical to a real sealed watch. Same agung tick-clock, same dabakan combat strikes, same babendil signal pings. But the emotional register is different because the player chose this. There's a meta-awareness — "I'm testing" rather than "I'm hoping." The audio is the same, but the listening is different. The tension is curiosity rather than anxiety. When a unit fails (eliminated, lost, stuck), the player doesn't flinch. They lean forward. "Interesting. Why did that happen?" The inspector transition agung rings with the same authority, but the player enters the inspector as a scientist entering a lab, not a detective entering a crime scene.

**Exiting Sandbox to Deploy.** The DEPLOY button, when pressed, triggers a 1.5-second transition. The scanline overlay (or amber border) contracts toward the center of the screen and vanishes with a soft snap — a single sharp babendil ping, higher-pitched than normal, almost celebratory. The infinity timer morphs digit by digit into the real mission timer (the ∞ separates into two zeros, then fills with the actual time limit). The resource counters shift from translucent teal to solid white, each digit solidifying with a tiny sparkle animation. The kulintang tempo accelerates from 60 to 70 BPM over 2 seconds. The boot log types: `[CORE] SIMULATION COMPLETE. DEPLOYING CONFIGURATION. This is real.` The last three words are bold amber. The screen is identical to a normal mission start, but the player has arrived here through a different emotional path — not "let's try" but "I know this works."
