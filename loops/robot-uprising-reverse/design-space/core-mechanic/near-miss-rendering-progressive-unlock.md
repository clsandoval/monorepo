# 2.00b-i — Near-Miss Rendering as Progressive Unlock

## The Option

The near-miss animation — a 200-400ms micro-hesitation where a unit briefly orients toward what its second-priority rule *would have* done before snapping to its actual action — is one of the most powerful anthropomorphization tools in the simulated intelligence layer (2.00b). But it requires the player to understand **rule priority evaluation** to interpret correctly. Without that understanding, the flicker reads as a bug ("why did my striker twitch toward my relay instead of attacking?") rather than as deliberation ("my striker considered helping the relay but the attack rule had higher priority").

This creates a gating problem: **when does the near-miss animation unlock, and what controls the gate?**

The stakes are high. Too early, and the animation confuses beginners into thinking their agents are malfunctioning. Too late, and veterans miss dozens of ticks of personality-building micro-moments during the campaign's most emotionally intense missions. The near-miss is the single feature most responsible for transforming deterministic rule execution from "watching a spreadsheet resolve" into "watching characters make difficult choices."

### Why This Matters Beyond Cosmetics

The near-miss animation is Robot Uprising's equivalent of a character actor's eye movement. In film, an actor who glances at a door before answering a question communicates "I'm considering leaving" without dialogue. The near-miss does the same thing for deterministic agents. It transforms rule evaluation — a purely mechanical process — into a visible internal conflict.

But here's the design tension: **the animation teaches rule priority retroactively.** A player who sees their striker twitch toward a friendly before attacking an enemy, and who understands rule priority, now has a visible confirmation that their rule stack is working as designed. The near-miss becomes a **diagnostic tool disguised as personality.** It's the Inspector's decision trace, rendered as body language, visible during the sealed watch when the Inspector is inaccessible.

This dual function (personality + diagnostic) means the unlock gate isn't just about "when is the player ready for visual complexity?" — it's about "when does the player have enough mechanical literacy to extract information from the animation?"

---

## Six Unlock Gate Models

### Model A: "The Mission Gate" — Campaign-Locked Unlock

**How it works:** Near-miss rendering activates at a fixed campaign point — Mission 5 (factory introduction) or Mission 6 (first Command agent mission). A boot log line announces: `DECISION TRACE VISUALIZATION: ONLINE. Subsystem renders alternative-action flicker on all units. Rule priority determines display hierarchy.` The animation appears on all units for all future missions.

**Gate logic:** Pure progression. Complete Mission N, near-miss turns on. No toggle, no gradual introduction.

**Strengths:**
- **Zero cognitive load on the gate itself.** The player doesn't need to do anything special — it just appears when the designers decided they're ready.
- **Pairs naturally with boot log narrative.** The subsystem "coming online" is diegetically coherent with the AI-awakening frame. A new perceptual capability activating mid-campaign mirrors real software feature flags.
- **Guaranteed encounter.** Every player who reaches Mission 5 sees near-misses. No risk of discovery failure.

**Weaknesses:**
- **Binary cliff.** Mission 4 has zero near-misses; Mission 5 has them everywhere. The visual language of the sealed watch changes abruptly. Players may not notice, or may notice and be confused.
- **Wrong timing for some players.** A Factorio veteran on Mission 3 would benefit from near-misses already. A struggling beginner on Mission 6 still doesn't understand rule priority. The fixed gate serves neither.
- **No regression path.** Once on, always on. A player who finds the animations distracting after Mission 5 has no recourse.

**Where to gate:**
- Mission 5 (factory intro): Player has configured rules (M3-4), seen them execute, used the Inspector to trace decisions. They've had at least 4 missions of rule-priority literacy building. But M5 already introduces 5 new concepts — adding a new visual element risks overload.
- Mission 6 (Command agent): Player has used the factory, built multiple blueprints, and is now managing meta-level configuration. The near-miss on a Command agent ("it considered rerouting before reassigning") would be especially legible. But this is 60% through the campaign — veterans have missed near-misses for 6 missions of potentially rich personality.
- **Mission 4 completion** (compromise): The player has just learned rules and seen them in Inspector. Near-miss activates for Mission 5 onward. M5's factory shock creates enough new visual stimuli that one more animation blends in rather than standing out.

### Model B: "The Usage Gate" — Inspector-Triggered Unlock

**How it works:** Near-miss rendering activates after the player has used the Inspector's decision trace feature N times. Specifically: after the player clicks on 3 different units in the Inspector and expands the "Decision Trace" panel (viewing which rule matched and why), the system judges they have sufficient rule-priority literacy. Next sealed watch, near-misses appear. Boot log: `DECISION TRACE VISUALIZATION: CALIBRATED. Unit behavior now renders alternative-action consideration.`

**Gate logic:** Demonstrated competence. The player must have actually used the tool that teaches rule priority before the animation that requires understanding rule priority.

**Strengths:**
- **Adaptive to player pace.** Fast learners unlock early (potentially Mission 2-3 if they explore the Inspector aggressively). Slow learners unlock later. The gate tracks actual understanding, not progression.
- **Reinforces Inspector use.** Creates an incentive to explore the Inspector deeply — every decision trace click is progress toward a visible reward.
- **Coherent metaphor.** "The AI calibrates its display to the operator's demonstrated analytical capability." The system adapts to you. This IS the game's theme.

**Weaknesses:**
- **Invisible gate.** The player doesn't know near-misses exist until they appear. There's no "you're 2/3 of the way to unlocking near-miss rendering" indicator. The unlock feels random rather than earned.
- **Gameable.** A player who reads a guide could click 3 units in the Inspector perfunctorily without understanding anything. The gate tests behavior, not comprehension.
- **Streamer problem.** A streamer who rushes through the Inspector to get to the next battle never unlocks near-misses. Their audience sees a flatter version of the game. This is anti-content-creation.
- **Discovery problem.** Some players might never use the decision trace panel (they look at buffer state instead), and never unlock near-misses at all. The personality layer becomes invisible to a segment of the audience.

**Threshold calibration:** 3 unique units × decision trace expanded = minimum. Could also require: viewed at least 2 different ticks for the same unit (understanding temporal decision changes), or viewed a unit where the second-priority rule was within 1 condition of matching (directly previewing what near-miss will show).

### Model C: "The Settings Toggle" — Player-Controlled

**How it works:** Near-miss rendering is a toggle in Settings → Visual → Animation Detail, defaulting to OFF. The setting is surfaced during the post-Mission-4 boot log: `ADVANCED VISUALIZATION OPTIONS AVAILABLE. Toggle Decision Trace overlay in Settings for alternative-action rendering.` The player can turn it on whenever they want.

**Gate logic:** Player agency. The player decides when they're ready.

**Strengths:**
- **Maximum player control.** Players who want clean animations keep them. Players who want rich deliberation get it. No paternalism.
- **Regression path.** Can be toggled off if distracting. Especially valuable for accessibility (photosensitivity, ADHD — the flicker adds visual complexity that some players may not tolerate).
- **Streamers love toggles.** "Let me turn on the near-miss layer so you can see the deliberation." Content creation moment.

**Weaknesses:**
- **Discovery failure.** Settings toggles are graveyards. Most players never explore Settings beyond volume. The most powerful personality feature in the game buried in a submenu.
- **Decision burden.** "Should I turn this on? I don't know what it does. I'll leave it off." Default OFF means most players never see near-misses.
- **Breaks the diegetic frame.** A settings toggle is meta-game UI, not the AI configuring itself. Every other visual feature in the personality layer (callsigns, idle animations, death animations) activates automatically and feels like part of the world. A toggle feels like an option menu.

**Mitigation:** Default ON after Mission 5, with a prominent one-time tooltip: "Notice how units briefly orient toward what they almost did? This shows their rule stack deliberation. Toggle in Settings if you find it distracting." This converts Model C into a hybrid: auto-on with opt-out.

### Model D: "The Gradient" — Intensity Ramping

**How it works:** Near-miss rendering is always active from Mission 1, but its visual intensity starts at near-zero and increases over the campaign. Mission 1-2: the micro-hesitation is 50ms and 5° of orientation shift — barely perceptible, registering as a "twitch" rather than a deliberation. Mission 3-4 (rules introduction): 150ms and 12° — noticeable if you're looking for it. Mission 5-7: 250ms and 20° — clearly visible, obviously a "look then commit" gesture. Mission 8-10: 400ms and 30° — dramatic deliberation, the agent clearly wrestling with its priorities.

**Gate logic:** Progressive disclosure through intensity, not presence/absence. The animation is always there — it just becomes more legible over time.

**Strengths:**
- **No cliff.** The visual language evolves continuously. There's never a "before/after" moment that could confuse.
- **Subliminal priming.** Even in Mission 1, the near-imperceptible twitch is planting the seed. The player's brain registers "something happened" without conscious processing. When the twitch becomes legible in Mission 4-5, the player has been subliminally prepared.
- **Natural attention bandwidth mapping.** In Mission 1, the player is watching everything for the first time — their visual bandwidth is maxed. In Mission 8, they've seen hundreds of ticks and their eyes are trained. The escalating intensity matches the player's escalating visual literacy.
- **Matches the boot log narrative.** "Subsystem initializing... decision trace resolution increasing... full fidelity achieved." The AI's perceptual systems are booting up across the campaign. Near-miss fidelity is literally a subsystem coming online gradually.

**Weaknesses:**
- **Missions 1-3 near-misses are wasted.** At 50ms and 5°, no one will consciously see them. The development cost of rendering them is non-zero for zero conscious benefit.
- **No "unlock moment."** There's no discrete beat where the player thinks "whoa, I can see what my unit almost did!" The feature slides in without announcement. This robs the player of an aha moment.
- **Tuning nightmare.** Getting the intensity curve right across 10 missions requires extensive playtesting. Too aggressive early = confusion. Too subtle late = invisible. The gradient must be perceivable at every step but not jarring.
- **Inspector mismatch.** The Inspector's decision trace shows near-miss data at full fidelity from Mission 1 (it has to — the analytical tool can't lie about the data). But the sealed watch shows the same information at reduced fidelity. This inconsistency could confuse: "the Inspector says rule 2 almost fired, but I didn't see any hesitation during the battle."

**Implementation:** The tick resolver already logs near-miss data (2.00b spec). The gradient only affects the rendering layer: `nearMissIntensity = clamp(missionNumber * 0.12, 0.05, 0.4)` controlling both animation duration (ms) and orientation angle (degrees).

### Model E: "The Earned Revelation" — Achievement-Gated

**How it works:** Near-miss rendering unlocks when the player achieves a specific Inspector-based accomplishment: "Identify a near-miss event in the decision trace and trace it back to the second-priority rule." This requires the player to: (1) open Inspector, (2) click a unit, (3) expand the decision trace, (4) notice the "Alternative Action" sub-panel showing the rule that almost fired, (5) click on that rule to see its evaluation. After this interaction sequence, a boot log message appears: `ALTERNATIVE ACTION RENDERING: UNLOCKED. Decision trace layer promoted to sealed-watch visualization.`

**Gate logic:** Demonstrated deep understanding. Not just "looked at the Inspector" but "found and engaged with the exact data the near-miss will visualize."

**Strengths:**
- **Maximum teaching coherence.** The player learns about near-misses analytically (Inspector) before seeing them rendered visually (sealed watch). The visual flicker is the Inspector data brought to life — the player has already seen the data in its raw form.
- **Unlock as aha moment.** "Wait, I can SEE this in battle now?" The analytical discovery in the Inspector → visual confirmation in the sealed watch creates a powerful two-beat learning sequence. This IS the three-screen loop's thesis: plan → watch → inspect → understand.
- **Self-selecting.** Only players who are genuinely engaged with the Inspector's deep features will unlock it. These are exactly the players who will benefit from near-miss rendering.
- **Collectible-feel.** Unlocking a new visual layer through gameplay mastery has the satisfying "earned" feeling of Metroidvania power-ups. The game gets richer because you got better.

**Weaknesses:**
- **Requires Inspector discoverability.** The "Alternative Action" panel in the Inspector must be findable without a guide. If it's buried or unclear, the unlock gate becomes a wiki-check gate.
- **Excludes casual players permanently.** Some players will complete the entire 10-mission campaign without ever finding the Alternative Action panel. They play a visually flatter game without knowing what they're missing.
- **Streamer friction.** A streamer who wants to show near-misses to their audience must first demonstrate the Inspector workflow. This is actually a POSITIVE for educational content — but a negative for quick clips.
- **The "silent majority" problem.** Achievement data from other games suggests 60-70% of players don't engage with advanced analytical tools. If near-miss rendering is gated behind Inspector mastery, the majority of players will never see it.

### Model F: "The Hybrid Cascade" — Layered Progressive Unlock (RECOMMENDED)

**How it works:** Four stages, layered and non-exclusive:

1. **Stage 0 (Mission 1-3): Subliminal.** Near-miss renders as a 50ms, 5° orientation twitch. No audio cue. No annotation. No acknowledgment. The unit twitches and the player's peripheral vision catches... something. Maybe nothing.

2. **Stage 1 (Mission 4 completion): Visible.** Near-miss animation increases to 200ms, 15°. The "decision click" audio cue activates — a tiny mechanical relay-switch sound. The first time it fires post-M4, a one-time subtle callout appears: a thin gold outline briefly pulses around the near-miss unit, and a whisper-text annotation fades in for 1.5 seconds next to the unit: `⟨considering: [rule name]⟩`. This only appears ONCE, the very first near-miss after M4. Future near-misses play the animation and audio without annotation.

3. **Stage 2 (Inspector engagement): Annotated.** After the player views the decision trace in Inspector and clicks on any "Alternative Action" entry (Model E's gate, but softer — any click, not a specific sequence), near-misses in sealed watch gain a persistent option: holding Shift during sealed watch highlights near-miss units with a subtle gold shimmer and shows the alternative rule name on hover. This is a non-default overlay — the sealed watch remains clean by default, but the player has a "lens" to look deeper.

4. **Stage 3 (Mission 8+): Full fidelity.** Near-miss animation reaches 350ms, 25°. The decision click becomes a full "dual-click" — two rapid mechanical sounds, first for the alternative (lower pitch) then for the chosen action (higher pitch). The animation now includes a brief ghost-trail: a translucent afterimage of the unit in the direction it *almost* moved, fading over 400ms. The ghost trail is the same holographic treatment used for plan-screen ghost previews — visual continuity across screens.

**Gate logic:** Time (campaign progression) + Demonstrated engagement (Inspector interaction) + Player control (Shift overlay). All three gates contribute. No single gate is sufficient; the experience accumulates.

**Boot log integration per stage:**
- Stage 0: (silent — no acknowledgment)
- Stage 1: `DECISION TRACE RENDERING: BASIC FIDELITY. Unit orientation reflects rule-stack evaluation.`
- Stage 2: `ANALYTICAL OVERLAY CALIBRATED. Operator has demonstrated decision trace literacy. Enhanced visualization available during observation [SHIFT].`
- Stage 3: `DECISION TRACE RENDERING: FULL FIDELITY. Alternative-action ghost rendering enabled. "I show you what I almost chose."`

---

## Player Journeys

### Journey: Mika, 14, First-Time Strategy Player

**Context:** Mission 3 (hooks introduction). Mika has configured scouts with patrol + a basic "IF enemy_spotted → transmit on alert-channel" hook. She's watching her second sealed watch ever.

**Minute 0:00 — The Subliminal Seed**
The sealed watch begins. Mika's two scouts patrol the board. At tick 4, Scout-Alpha spots an enemy. The hook fires — green flash on the channel, signal delivered.

At tick 5, Scout-Alpha is adjacent to the enemy AND has a friendly relay nearby. The rule stack evaluates: Rule 1 (IF enemy_adjacent → evade) fires. But Rule 2 (IF friendly_in_range → patrol_toward_friendly) was one condition away from matching — the relay is in range but enemy_adjacent took priority.

Scout-Alpha executes evade. During the tick resolution, the sprite twitches 5° toward the relay for 50ms before snapping to its evade direction.

Mika doesn't consciously register the twitch. Her eyes are on the green flash of the signal delivery. But her peripheral vision catches movement. A faint neural imprint forms: "Scout-Alpha did... something... before it dodged."

She doesn't think about it again. But the seed is planted.

**Minute 2:00 — The Mission Continues**
Scout-Alpha evades successfully. The battle continues. Three more near-misses fire across the remaining ticks — all at 50ms, 5°. Mika notices none of them consciously. The sealed watch feels crisp and clean.

**Minute 3:00 — Inspector**
In the Inspector, Mika clicks Scout-Alpha at tick 5. The decision trace shows: `Rule 1: IF enemy_adjacent → EVADE ✓ MATCHED`. Below it, greyed out: `Rule 2: IF friendly_in_range → PATROL_TOWARD ○ NOT EVALUATED (higher priority rule matched)`. Mika reads it but doesn't connect it to the sealed watch twitch. She's focused on "did the signal reach the relay?"

**Result:** Near-miss was invisible. Correct for Mika's current literacy level. No confusion, no visual noise.

---

### Journey: Derek, 31, Software Engineer, Factorio Veteran

**Context:** Mission 5, second attempt. Derek has been through the factory introduction (Phase 1 guided, Phase 2 full authority). His first attempt failed because his strikers engaged enemies piecemeal instead of focusing fire. He rebuilt with explicit priority rules: `Rule 1: IF tagged_enemy_in_range → ENGAGE_TAGGED` / `Rule 2: IF enemy_adjacent → ENGAGE_NEAREST` / `Rule 3: IF no_contacts → ADVANCE_TO_WAYPOINT`.

**Minute 0:00 — Stage 1 Fires**
Derek completed Mission 4 last session. Near-miss rendering is now at Stage 1 — 200ms, 15°, with audio.

The sealed watch begins. At tick 8, Striker-Bolo is adjacent to an untagged enemy. Rule 2 fires (engage nearest). But Rule 1 almost fired — there IS a tagged enemy, but it's not in range (3 tiles away). Near-miss: Bolo orients 15° toward the tagged enemy's direction for 200ms, accompanied by a faint mechanical *click-click*. Then Bolo snaps to the adjacent enemy and attacks.

Derek sees it. "Wait — did Bolo just look at something before attacking?" He leans forward. The gold callout annotation fades in next to Bolo for 1.5 seconds: `⟨considering: ENGAGE_TAGGED⟩`. Derek's eyes widen. "It considered the tagged target but it was too far. That's the priority evaluation happening in real time."

**Minute 0:30 — Recognition Cascades**
Derek is now watching for near-misses. At tick 11, Scout-Osprey spots two enemies simultaneously. Osprey's rule stack: `Rule 1: IF enemy_spotted → TRANSMIT on alert-net` / `Rule 2: IF enemy_adjacent → EVADE`. Both conditions are true. Rule 1 fires (transmit). Osprey twitches toward an escape route — the near-miss for the evade rule. *Click-click*. Derek mutters: "Osprey wanted to run but signal priority was higher. That's... that's exactly what I configured."

He feels a rush of authorship. The scout isn't malfunctioning. It's *deliberating within the constraint system he built.* The near-miss rendered his design choices as visible character.

**Minute 1:15 — The Near-Miss That Matters**
Tick 14. Striker-Bolo is now adjacent to TWO enemies — one tagged (the scout tagged it 3 ticks ago), one untagged. Rule 1 fires: engage tagged. Near-miss: Bolo flickers toward the untagged enemy (Rule 2 almost fired because it also satisfies enemy_adjacent). *Click-click*. But then the attack animation plays on the tagged enemy — a flash of red, elimination.

Derek pumps his fist. "Bolo prioritized the tagged target even with another threat right there. The priority stack WORKS." He didn't need the Inspector to confirm this — the near-miss told him during the sealed watch.

**Minute 4:00 — Inspector Validation**
Post-battle Inspector. Derek clicks Bolo at tick 14. Decision trace: `Rule 1: IF tagged_enemy_in_range → ENGAGE_TAGGED ✓ MATCHED — Target: E-3 (tagged T11 by Scout-Osprey)`. Alternative action panel: `Rule 2: IF enemy_adjacent → ENGAGE_NEAREST — Would have engaged E-7 (untagged, adjacent)`. Derek nods. "That's exactly what the twitch showed me."

He clicks the "Alternative Action" entry — this triggers Stage 2. Boot log on his next mission: `ANALYTICAL OVERLAY CALIBRATED.`

**Minute 5:00 — The Teaching Moment**
Derek opens his blueprint editor. He looks at Bolo's rule stack with new eyes. The rules aren't abstract condition→action pairs anymore. Each one is a *visible behavior he watched Bolo consider.* He drags Rule 3 (advance to waypoint) above Rule 2 (engage nearest). "What if Bolo advances toward tagged enemies instead of engaging whatever's nearby?" He hits EXECUTE. This time, he's watching for Bolo's near-misses to validate his hypothesis.

**Result:** Near-miss transformed Derek's relationship with his rule stack. Rules became visible character, the sealed watch became a diagnostic tool, and blueprint iteration became hypothesis testing. Stage 1 delivered the revelation. Stage 2 deepened it.

**UI Annotations:**
- Near-miss animation: Unit sprite rotates 15° toward alternative action target over 200ms, with sprite returning to actual action direction via a quick 100ms snap
- Decision click: Two rapid mechanical clicks (~60ms apart), first at -3dB (alternative), second at 0dB (chosen). Sounds like a relay switch testing both contacts.
- Gold callout (first time only): `⟨considering: [rule name]⟩` in 10pt amber monospace, positioned 8px above and right of unit tile, fades in over 200ms, holds for 1.5s, fades out over 300ms. No background — text only with 1px dark outline for readability.
- Shift overlay (Stage 2): Holding Shift during sealed watch dims the board 15% and applies a warm gold glow (4px radius) to any unit currently executing a near-miss. Hovering shows the alternative rule name.

---

### Journey: Abuela Rosa, 62, Retired Nurse, Casual Mobile Player

**Context:** Mission 7, playing on iPad during evening routine. Rosa plays one mission per evening, taking notes in a physical notebook. She's been through the factory introduction and is building her first Command agent. She understands rules conceptually ("the top rule is what the robot tries first") but doesn't use the Inspector's decision trace — she looks at buffer state and the event log instead.

**Minute 0:00 — The Persistent Twitch**
Rosa's Command agent, whom she's named "Kapitan," is stationary on the board with 6 hook connections to subordinate units. The sealed watch begins. Rosa's attention is on her striker pair advancing toward the enemy base.

At tick 3, Kapitan receives an intelligence signal: Scout-Maya has spotted enemy movement on the west flank. Kapitan's rule stack evaluates. Rule 1: `IF enemy_west AND striker_east → REROUTE striker to west`. Rule 2: `IF production_queue_empty → QUEUE new scout`. Rule 1 fires — Kapitan reroutes the striker.

Near-miss: Kapitan's chassis briefly illuminates on its production antenna (the direction associated with queuing) for 200ms. *Click-click*. Then the reroute command fires — a cascade of colored signals flowing outward to the striker.

Rosa sees the brief illumination. "Kapitan looked at the factory before giving the order." She interprets this anthropomorphically — correctly, in spirit if not in mechanism. "Kapitan thought about building a new scout but decided rerouting was more important." She writes in her notebook: "Kapitan prioritizes moving existing units over building new ones."

**Minute 1:30 — The Pattern Emerges**
Tick 9. Kapitan receives three simultaneous signals. Three rules could fire. The near-miss is dramatic: 200ms orientation toward Signal-2's associated unit, *click-click*, then action on Signal-1's unit. Rosa has been watching Kapitan specifically (she's emotionally attached to the Command agent — "my Kapitan").

"Kapitan is always thinking about the wrong thing first." Rosa misreads the near-miss — she thinks Kapitan is hesitating ineffectively, not that the near-miss shows the rule that was *correctly deprioritized.* She makes a note: "Why does Kapitan keep looking at the relay before acting?"

**Minute 3:00 — The Productive Misunderstanding**
After the battle (victory — barely), Rosa enters the Inspector. She doesn't go to the decision trace. Instead, she scrolls through the event log, looking for ticks where Kapitan acted. She sees: `T9: Kapitan → REROUTE Striker-Bolo to E4`. She doesn't see the near-miss data because she's not in the decision trace panel.

But the question nags: "Why did Kapitan keep looking at the relay?" She mentions it to her grandson next time they play. He says: "Abuela, that means Kapitan's second rule almost fired. The first rule was more important, so it won. But the twitch shows what was second."

Rosa's eyes light up. "Like triage! When you have three patients, you look at all of them but treat the most critical first. The looking is the assessment." She now understands rule priority — not through the Inspector's formal decision trace, but through her professional experience mapped onto the near-miss animation.

**Minute 4:00 — The Reframe**
Rosa goes back to the Plan screen. She looks at Kapitan's rule stack. "Rule 1 is the most critical patient. Rule 2 is the second. The twitch shows Kapitan assessing Rule 2 before treating Rule 1." She reorders the rules. This time, she's doing it with a mental model of triage priority — which is, mechanically, exactly what rule priority IS.

**Result:** Near-miss created a productive misunderstanding that eventually resolved into deep mechanical literacy — mediated by Rosa's professional expertise as a nurse. The animation didn't need the Inspector to teach; it taught through anthropomorphic interpretation corrected by social learning. Stage 1's 200ms intensity was sufficient for casual observation. The annotation appeared and disappeared too quickly for Rosa to read on her first near-miss, but the physical animation was clear enough.

**UI Annotations:**
- iPad-specific: Near-miss animation scales to 1.5x intensity on tablet displays (250ms, 18°) to compensate for arm's-length viewing distance
- Touch-and-hold during sealed watch (iPad): Functions as Shift-key equivalent for Stage 2 overlay, with a brief vibration (10ms taptic) on touch-hold recognition
- Stage 2 overlay on mobile: Instead of hover-to-see-rule-name, touch-and-hold on the gold-glowing unit shows a bottom-sheet with the alternative action name and the unit's rule stack with the near-miss rule highlighted in amber

---

### Journey: Kwame, 27, Twitch Streamer, 800 Average Viewers

**Context:** Mission 9, streaming his first campaign playthrough. Kwame has been vocal about the game's "robots with personality" throughout his stream. He unlocked Stage 2 on Mission 6. He's now on Mission 9 — Stage 3 (full fidelity) activated at Mission 8.

**Minute 0:00 — The Ghost Trail**
Kwame hits EXECUTE on a complex 6-unit configuration against the Mission 9 enemy fleet. Chat is excited: `KwameBOT army lets go` / `relay mesh is clean` / `rip to the scout in advance`.

Tick 3. His lead striker, Kris, is adjacent to two enemies. Rule 1 fires: engage the tagged enemy. Near-miss at FULL FIDELITY: Kris orients 25° toward the untagged enemy over 350ms. A translucent holographic ghost-trail of Kris lingers in the direction of the untagged enemy for 400ms — a cyan-tinted afterimage, identical to the plan screen's ghost preview treatment. The dual-click audio fires: *tick* (low, alternative) then *TICK* (high, chosen). Kris attacks the tagged enemy. Red flash. Elimination.

Kwame: "Chat, did you see that? Kris LOOKED at the other enemy. Kris was like 'nah, you're tagged, you die first.' The ghost! You can see where Kris WOULD have gone!"

Chat explodes: `THE GHOST TRAIL` / `ROBOT DRAMA` / `kris chose violence (the right violence)` / `that dual click sound is so good`

**Minute 0:45 — The Narrative Clip**
Tick 7. Scout-Maya is in a dangerous position — adjacent to an enemy with a damaged relay behind her. Maya's rules: `Rule 1: IF enemy_adjacent → EVADE` / `Rule 2: IF friendly_damaged → TRANSMIT damage_report`. Both conditions are true. Rule 1 fires: Maya evades.

Near-miss: Maya orients toward the damaged relay. Ghost trail lingers toward the relay for 400ms — the afterimage reaches toward the relay like an outstretched hand. Dual-click: *tick-TICK*. Maya evades away from the enemy.

Kwame, softly: "Maya wanted to call for help for the relay. But she had to save herself first. Look at the ghost reaching toward the relay..."

Chat: `MAYA NO` / `the ghost hand 😭` / `robots have feelings confirmed` / `clip it CLIP IT`

This is the 15-second TikTok clip. The ghost trail reaching toward a friend while the unit is forced to flee. Pure character from pure determinism.

**Minute 2:00 — Competitive Use**
Kwame notices a pattern: his Command agent has been near-missing on the production queue rule every tick for 5 ticks straight. The ghost trail keeps flickering toward the factory direction. "Wait — Kapitan keeps wanting to queue units but something higher priority keeps firing. Let me check if my production rule is too low in the stack..."

He's using the near-miss as a real-time diagnostic during the sealed watch — exactly the dual personality/diagnostic function the feature was designed to serve. He catches a priority misconfiguration without needing the Inspector.

**Minute 4:00 — Inspector Deep Dive**
Post-battle, Kwame pulls up the Inspector with the Shift overlay still fresh in his mind. He scrubs to tick 7 (Maya's near-miss). The decision trace confirms: Rule 2 (transmit damage report) was one condition away from matching — "friendly_damaged: TRUE, enemy_adjacent: TRUE → Rule 1 takes priority."

"I need to reconfigure Maya. If I add a hook that transmits damage reports automatically on detection, Maya won't need a rule for it. The evade rule stays top priority and the hook handles the communication in parallel." He's iterating based on near-miss data — the animation showed him a design tension he wouldn't have noticed from the battle outcome alone (Maya survived regardless).

**Result:** Full-fidelity near-miss created a stream-defining content moment, a diagnostic insight, and a design iteration — all from the same 350ms animation. The ghost trail was the visual that chat responded to most intensely. The dual-click audio was immediately memed.

**UI Annotations:**
- Ghost trail: Translucent holographic copy of unit sprite at 40% opacity, offset from unit position by 0.5 tiles in the alternative-action direction, rendered with the same shader as Plan screen ghost previews (scanline overlay, cyan tint, gentle flicker). Fades over 400ms with ease-out curve.
- Dual-click audio: Two metallic relay clicks, first at 80Hz (7ms duration), second at 120Hz (7ms duration), separated by 60ms. At 1x speed, both clicks resolve within the 200ms pre-action window. At 0.5x speed, the gap stretches to 120ms — more dramatic, more legible.
- Stream overlay compatibility: Ghost trail renders in PixiJS canvas layer (not DOM overlay), ensuring OBS captures it at full fidelity without z-index issues.

---

## Strengths

1. **Dual function: personality AND diagnostics.** The near-miss is the only sealed-watch feature that simultaneously makes units feel alive AND communicates mechanical state. Every other diagnostic tool lives in the Inspector. This one crosses the screen boundary.

2. **Teaches rule priority without text.** A player who watches near-misses for 3 missions understands rule priority viscerally — they've SEEN what "second in the stack" means. The Inspector's formal decision trace becomes confirmation, not discovery.

3. **Content creation goldmine.** The ghost trail at Stage 3 creates "robot drama" moments that are inherently clippable. Chat reactions to near-misses ("the ghost hand reaching toward the relay 😭") are exactly the community-building content that sustains interest.

4. **Scales with player investment.** Casual players get subtle twitches that make units feel alive without understanding why. Veterans get full ghost trails with diagnostic utility. The same feature serves both audiences.

5. **Reinforces the three-screen loop.** The near-miss in sealed watch creates questions ("why did it twitch?") that the Inspector answers. This drives Inspector engagement naturally. Stage 2's Shift overlay bridges the gap further.

## Weaknesses

1. **Anthropomorphization backfire.** Players like Rosa may interpret the near-miss as indecision, weakness, or malfunction rather than deliberation. This misreading could persist for missions, creating frustration. Mitigation: the one-time annotation at Stage 1 helps, but may be missed.

2. **Visual noise at scale.** In Mission 8+ with 8-12 units, multiple near-misses fire per tick. At full fidelity with ghost trails, the board becomes cluttered with translucent afterimages. Mitigation: ghost trails suppress when more than 3 near-misses fire simultaneously; only the highest-priority near-miss (top-2 rules closest to equal match) renders at full fidelity, others render at Stage 1 intensity.

3. **The debugging tax interaction.** Near-miss rendering shows when things are working correctly (the right rule won). But it could also train players to watch for near-misses as a debugging signal, adding cognitive load. "Is that twitch good or bad? Should I change something?" When every action has a visible alternative, the player may feel perpetually uncertain about their configuration. Mitigation: the ghost trail always shows the LOSING rule, framing it as "this is what was correctly deprioritized," not "this is what went wrong."

4. **Speed-sensitive legibility.** At 2x speed (0.5 seconds per tick), Stage 1's 200ms near-miss occupies 40% of the inter-tick window. At 0.5x speed (2 seconds), it occupies 10%. The feature is dramatically different at different speeds. Mitigation: near-miss duration should scale inversely with speed multiplier: `effectiveDuration = baseDuration / speedMultiplier`, clamped to [100ms, 500ms].

5. **Deterministic spoiler effect.** On replays, the player already knows the outcome. Near-misses on replay are pure noise — the tension of "what will it do?" is gone. Mitigation: Inspector's timeline scrubber mode suppresses near-miss animations by default (analytical context, not emotional). Toggle available for content creators.

---

## Interaction Effects

### × 2.00b (Simulated Intelligence Parent)
Near-miss is Layer 6 of the personality system. Its progressive unlock must be coordinated with other layers: callsigns (Layer 3, always-on), idle animations (Layer 1, always-on), signal-receive gestures (Layer 4, always-on), death animations (Layer 5, always-on). Near-miss is the ONLY personality layer that unlocks progressively. This makes it special — the "advanced" personality feature.

### × 2.00j (Debugging Tax)
Near-miss rendering partially mitigates the debugging tax by surfacing diagnostic information during the sealed watch, BEFORE the Inspector. A player who notices a repeated near-miss pattern ("my striker keeps wanting to retreat instead of attack") can diagnose a priority issue without entering the Inspector at all. But it can also amplify the tax: every twitch becomes a question to answer.

### × 3.05 (Rules Language)
The near-miss only works if rules are ordered-priority (Paradigm B, the locked spec). If rules used weighted voting (Paradigm C), there would be no binary "this rule won vs. this rule almost won" — every rule contributes. Near-miss rendering is structurally coupled to the priority-queue rules model.

### × Inspector (4.xx)
The Inspector's decision trace provides the analytical data that the near-miss renders emotionally. Stage 2's unlock requires Inspector engagement, creating a bidirectional reinforcement: near-miss drives Inspector use, Inspector unlocks richer near-miss. The two features are designed to teach each other.

### × Sealed Watch Pacing (Locked)
The 1-second-per-tick default pacing provides a natural 800ms window (after the 200ms near-miss) for the player to process the animation before the next tick. At 2x speed, this window shrinks to 300ms — still perceivable but rushed. Near-miss rendering argues against adding a 4x speed option.

### × EM Emissions
The near-miss animation is purely cosmetic — it doesn't generate EM noise. But the CAUSE of the near-miss (the rule evaluation that almost fired) does exist in the engine's state. A hypothetical advanced feature: an enemy with intercept capability could detect near-miss patterns to infer an opponent's rule priorities. This would be a Wave 10+ exploration.

### × Accessibility (6.01d)
The near-miss orientation (directional flicker) is already non-color-dependent — it's a spatial/directional cue. The ghost trail uses the same holographic shader as plan screen ghosts, which passes the colorblind accessibility pipeline. The dual-click audio provides a non-visual channel. Players with reduced-motion preferences should have near-miss rendering suppressed to Stage 0 (subliminal) or completely off.

### × Content Creation (6.04)
Ghost trails at Stage 3 are the feature streamers will talk about most. The ghost reaching toward a friend while the unit flees in the opposite direction is cinema. Clip export tools should preserve ghost trail at full fidelity. The "Architecture beauty shot" screenshot mode (6.04e) should capture ghost trails as an optional layer.

---

## Comparable Games

### Into the Breach — The Absence
Into the Breach has ZERO near-miss rendering. Mechs do what they do — push, shoot, block. There's no indication of "what the mech considered doing instead." This is appropriate for ItB because the PLAYER makes every decision. But in Robot Uprising, the player designs the decision-making system and then watches it execute. Near-miss rendering fills the observation gap between player intent (the rule stack) and agent execution (the action taken).

### The Sims — The Thought Bubble
When a Sim is deciding between actions, a thought bubble shows the competing desires. "I want to eat... no, I need to sleep... actually, I'll watch TV." This is the most direct precedent for near-miss rendering. The Sims uses it as comedy — conflicting desires are played for laughs. Robot Uprising uses it as drama and diagnostics.

### XCOM: Enemy Unknown — The Overwatch Twitch
When an XCOM soldier is on overwatch and an alien moves through their cone of fire but doesn't trigger the shot (too far, too low percentage), the camera briefly follows the alien's movement and the soldier's model turns to track. This subtle animation communicates "I saw it but couldn't shoot." It's a near-miss rendered as awareness rather than action.

### Dwarf Fortress — Thought Records
Each dwarf maintains a thought record showing recent emotional events and their current emotional state. "Urist was content after eating a fine meal. Urist felt frustrated after being unable to find a table." These are textual near-misses — they describe what the dwarf WANTED to do but couldn't. Robot Uprising renders this visually in real-time rather than as post-hoc text.

### StarCraft II — Unit Idle Animations
SC2 units have subtle idle behaviors (Marines fidget, Zealots pulse their psi-blades) but zero near-miss rendering. When a Marine attacks, it attacks. There's no indication of "this Marine almost patrolled instead." This is appropriate for SC2's real-time direct control, but leaves a gap for Robot Uprising's autonomous agents.

### Gladiabots — No Near-Miss, Much Desired
Gladiabots' deterministic robots show no indication of rule evaluation. Community feedback consistently asks for better visualization of "why did my robot do that?" The lack of near-miss rendering forces all debugging into post-hoc analysis. Robot Uprising's near-miss directly addresses Gladiabots' most common community complaint.

---

## Sensory Description

**The Twitch (Stage 0-1):** A barely-perceptible — then gradually legible — directional flicker. The unit's sprite pivots like a person whose gaze is caught by movement in their peripheral vision. At Stage 0, it's a 50ms shiver — did it move? At Stage 1, it's a clear 200ms look-then-snap. The unit's "eyes" (sensor array, antenna, targeting lens) orient toward the alternative before returning to the chosen action. The movement has an ease-in-ease-out curve — natural, not mechanical.

**The Click (Stage 1+):** A tiny metallic sound, like the mechanism inside a light switch being tested — *chk-CHK*. The first click is the alternative being evaluated (lower volume, lower pitch: 80Hz for 7ms). The second is the chosen action being committed (full volume, higher pitch: 120Hz for 7ms). Together they create a "this-then-THAT" rhythm. At 0.5x speed, the clicks are more spaced and dramatic. At 2x, they merge into a single *tchk*.

**The Ghost (Stage 3):** A holographic afterimage, identical in shader treatment to the Plan screen's ghost preview — scanline overlay, cyan-tinted, gently flickering at 3Hz. The ghost appears at the moment of near-miss and drifts 0.5 tiles in the alternative-action direction before dissolving over 400ms. At full scale, it looks like the unit's spirit briefly left its body, reached toward what it wanted, and was pulled back. On Siquijor's bioluminescent terrain, the ghost trail blends with the environment's natural glow. On Cebu's neon cityscape, it looks like a holographic advertisement briefly miscalibrated. On Taal's volcanic terrain, it glows against the dark basalt like lava veins.

**The Annotation (first time only):** `⟨considering: ENGAGE_TAGGED⟩` — amber monospace text, angular brackets suggesting system-level diagnostic output. The text doesn't appear in a box or tooltip — it floats next to the unit like a holographic HUD element, consistent with the game's cyberpunk aesthetic. It fades after 1.5 seconds. This annotation appears exactly once in the entire campaign, creating a micro-narrative beat: the AI reveals that it was already running decision trace visualization — you just couldn't see it until now.

---

## The TikTok Clip

**"The Ghost Hand"**
15 seconds. Mission 9 sealed watch, 1x speed. A scout (Maya) is cornered — enemy adjacent, damaged relay behind her. The tick resolves: Maya evades. But the ghost trail reaches toward the relay — a translucent hand stretching toward a friend in need. *tick-TICK*. Maya flees. The ghost lingers for 400ms, slowly fading. The relay sparks alone.

Text overlay: "She wanted to help. The rules said run."

This clip communicates: (1) the units have visible inner lives, (2) the player's configuration creates character, (3) the game is a drama engine. It's emotionally legible to someone who has never played the game.
