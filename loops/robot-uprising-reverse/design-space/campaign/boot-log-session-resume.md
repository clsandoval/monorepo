# 5.20a — Boot Log as Session Resume Mechanism

**Aspect ID:** 5.20a
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.02 (tutorial as narrative), 5.12 (Predecessor content), 5.04c (subsystem online micro-celebration), 5.17 (hybrid tutorial architecture), 5.00 (external documentation anti-pattern), 5.22c (Predecessor Codex presence post-campaign), 5.20b (Architect Profile archetype design), 6.10 (corruption audio), 5.04b (vocabulary density curve)

---

## The Core Idea

Every game with sessions faces the same problem: **what happens when the player comes back after being away?** The industry standard is either nothing (drop them at a menu), a loading screen tip, or a "Previously on..." cutscene. Robot Uprising has a unique advantage: the boot log is already a diegetic fiction — "you are an AI booting up." Every time the player launches the game, the AI is waking up. The session resume IS the narrative.

The design question is: **how does the boot log's content change based on what the player did last, what they haven't done yet, and how long they've been away?**

This isn't just a "welcome back" screen. It's the game's primary mechanism for:
1. **Reorienting the player** — what were they doing, what was working, what was failing
2. **Maintaining narrative continuity** — the AI's "memory" of previous sessions
3. **Motivating the next action** — seeding what to try next without being prescriptive
4. **Adjusting emotional register** — a returning player after 3 weeks needs a different tone than one who closed and reopened 5 minutes later

The boot log is the game's **limbic system** — the first emotional beat of every session.

---

## The Six Resume Models

### Model A: "The Status Report" — Factual, Clinical, Fast

**How it works:** The boot log prints a structured status summary. No narrative, no personality. Pure data.

```
> OPERATOR SESSION INITIALIZED
> LAST ACTIVE: 2026-03-14 22:47 UTC (47 hours ago)
> CAMPAIGN PROGRESS: Mission 6 / 10 — Cebu
> LAST MISSION RESULT: FAILED (round 3/5, eliminated tick 34)
> ACTIVE BLUEPRINTS: 4 (SCOUT-B, RELAY-A, STRIKER-C, COMMAND-A)
> ARCHITECTURE HEALTH: 2 warnings (dead hook on RELAY-A, shadow rule #4 on COMMAND-A)
> CHANNEL MAP: 5 active channels, 1 unused (emergency-scatter)
> READY.
```

Time to read: ~5 seconds. Time to dismiss: 0 seconds (player clicks through immediately).

**Sensory description:** Teal monospace text on black. Each line prints with a 50ms typewriter delay — fast enough to feel automated, slow enough to be legible. No sound except the faint ticking of characters appearing. The `READY.` line pulses once, then fades to the campaign map.

**Strengths:**
- Zero friction for returning veterans who know exactly what they want to do
- Maximum information density per second
- Respects the player's time — doesn't perform emotions at them
- Clean, professional tone matches the "AI operator" fantasy
- Easy to implement — data is all available from save state

**Weaknesses:**
- Emotionally dead. After a tense Mission 6 failure, "LAST MISSION RESULT: FAILED" has the warmth of a server error log
- Doesn't teach anything. A player who failed because their relay chain was too slow gets no hint about what to try differently
- No narrative continuity — the AI has no "memory" of what happened, just data
- The 47-hour gap is mentioned but not acknowledged. The AI doesn't care that you were gone
- Doesn't differentiate between a player who left mid-frustration and one who left satisfied

**Comparable:** Dwarf Fortress's "Reclaim Fortress" screen. Factorio's load screen (literally just the factory state). EVE Online's login (character + skill queue).

---

### Model B: "The Operator's Log" — Diegetic, Personal, Reflective

**How it works:** The boot log prints as the AI's own journal entry — a first-person reflection on its last session, what it learned, and what it's been "thinking about" while offline.

```
> OPERATOR LOG — SESSION 14
> 47 hours since last active session.
>
> Mission 6 did not go well. The architecture held for 33 ticks —
> longer than Mission 5's first attempt — but the third enemy wave
> hit RELAY-A before the signal chain was established. The flanking
> response was 4 ticks too slow. I can see the problem in retrospect:
> SCOUT-B was reporting on the wrong channel. The data was there.
> It just wasn't reaching the right listener.
>
> While offline, I've been reviewing the signal chain topology.
> The emergency-scatter channel has never fired. It might be
> misconfigured, or it might be unnecessary. Worth investigating.
>
> Recommended focus: RELAY-A hook configuration.
> Secondary: Review emergency-scatter channel usage.
>
> Ready to proceed.
```

Time to read: ~20 seconds. Time to dismiss: variable — some players will read every word, others will mash through.

**Sensory description:** The teal monospace text prints at a slower rate — 80ms per character for the first line, accelerating to 40ms by the end. The AI is "waking up," gathering thoughts, then finding its stride. A soft ambient hum underlies the text, subtly rising in pitch as the log progresses — the AI's systems warming up. When "Recommended focus" appears, a gentle amber highlight pulses behind the text — the first warm color in the boot sequence. The final "Ready to proceed." prints in slightly brighter teal, with a single soft chime — the kulintang's agung (lowest tone, context category) — signaling readiness.

**Strengths:**
- Creates the fiction that the AI was "alive" between sessions — it was thinking, reviewing, preparing
- Teaches by implication: "SCOUT-B was reporting on the wrong channel" is a hint disguised as self-reflection
- The "47 hours" gap is acknowledged emotionally, not just reported
- The recommendation is gentle — "worth investigating" not "you must fix this"
- Builds narrative continuity — the AI remembers what happened and has opinions about it
- The unused channel flag is the AI noticing something the player might have forgotten

**Weaknesses:**
- 20 seconds is a lot when you just want to play. After the 5th session, the novelty wears off
- The AI's "analysis" might be wrong or unhelpful, frustrating advanced players who already know what went wrong
- Generating meaningful reflections requires significant content authoring or dynamic text generation
- If the player failed for a subtle reason, the log might not identify it, making the AI seem dumb
- The "thinking while offline" fiction breaks if the player closes and immediately reopens — "2 minutes since last session. I've been reviewing..." feels absurd

**Comparable:** Hades' "narrative recap" (characters reference what happened last run). Disco Elysium's internal monologue (thoughts that develop over time). Oxygen Not Included's cycle report.

---

### Model C: "The Subsystem Check" — Technical, Layered, Interactive

**How it works:** The boot log runs a visible "system diagnostic" — each game subsystem reports its status, and the player can click into any subsystem for detail. The diagnostic IS the resume mechanism.

```
> BOOT SEQUENCE INITIATED
> ████████████████████████████████ 100%
>
> [✓] PERCEPTION CORE    — 3 scouts configured, 2 active patrol routes
> [✓] SIGNAL BUS          — 5 channels, 247 signals last mission
> [⚠] HOOK PROCESSOR      — 1 dead hook detected (RELAY-A:emergency-scatter)
> [✓] RULE ENGINE          — 18 rules across 4 blueprints, 0 conflicts
> [⚠] CONTEXT MANAGER      — 2 overload events last mission (tick 28, tick 31)
> [✓] PRODUCTION QUEUE     — 4 blueprints queued, estimated 32-tick deployment
> [✗] MISSION 6: CEBU      — FAILED round 3/5 (tick 34)
>
> Click any subsystem for diagnostic detail.
> Press ENTER to proceed to campaign map.
```

Each `[⚠]` and `[✗]` line is clickable. Clicking "HOOK PROCESSOR" opens a mini-panel showing which hook hasn't fired and on which unit. Clicking "CONTEXT MANAGER" shows the two overload moments as thumbnail timeline markers.

**Sensory description:** Each subsystem line prints in sequence — 200ms between lines. The checkmarks appear in bright green with a tiny confirming *tick* sound. Warnings appear in amber with a slightly lower-pitched *boop*. The failure line appears in red with a brief discordant buzz — the same frequency as the sealed watch's combat flash. The progress bar at the top fills with a smooth left-to-right sweep, the game's audio rising from silence to full ambient hum as it completes. Hoverable lines glow slightly brighter when the cursor passes over them. Clicked lines expand downward with a 300ms accordion animation, pushing subsequent lines down. The expanded detail panel has a slightly darker background — a "diagnostic drawer" feel.

**Strengths:**
- Interactive — the player chooses how deep to go. Veterans press ENTER immediately. Struggling players explore warnings
- The warning system IS the resume: it tells you what's wrong without telling you what to do
- The subsystem-by-subsystem format mirrors the campaign's pedagogical structure (each mission = one subsystem)
- Expandable detail means zero friction by default, infinite depth on demand
- The [⚠] indicators create gentle urgency without prescriptive instruction
- The sound design gives each subsystem a distinct audio identity that compounds over the campaign

**Weaknesses:**
- No narrative voice. This is a machine talking to itself, not an AI reflecting
- The diagnostic might surface too many warnings for a struggling player, creating "wall of amber" anxiety
- Clicking through subsystem details can become a ritual that delays actually playing
- The "dead hook" warning might be confusing if the player doesn't remember what emergency-scatter was supposed to do
- No acknowledgment of time away — a 5-minute return and a 5-week return look identical

**Comparable:** Into the Breach's "Pilot Status" screen between missions. XCOM's Geoscape (base overview showing what needs attention). Factorio's production statistics tab. Linux boot sequence with systemd status lines.

---

### Model D: "The Time-Aware Greeting" — Adaptive, Warm, Human

**How it works:** The boot log's content, tone, length, and emotional register change based on how long the player has been away. The AI acknowledges the gap and adjusts its behavior accordingly.

**Same-session return (< 5 minutes):**
```
> SESSION RESUMED.
> Mission 6 — where we left off.
```
Two lines. No ceremony. The AI treats this as a browser tab refresh, not a homecoming.

**Short break (5 minutes – 4 hours):**
```
> OPERATOR REACTIVATED
> Mission 6: Cebu — last attempt failed at tick 34.
> Architecture state preserved. No changes detected.
> Ready when you are.
```
Brief status, acknowledgment that nothing has changed, implicit "let's try again."

**Overnight return (4 – 24 hours):**
```
> OPERATOR SESSION 14 — 14 hours since last active.
>
> I reviewed the Mission 6 failure overnight. The signal chain from
> SCOUT-B to STRIKER-C took 4 ticks — the enemy reached RELAY-A in 3.
> The math doesn't work with the current topology.
>
> Something to consider: what if SCOUT-B broadcast directly to
> STRIKER-C on a dedicated channel? Shorter chain. Louder signal.
> The tradeoff is visibility — direct broadcast has higher EM.
>
> Your call.
```
The AI "used the time" to analyze. Offers a specific suggestion framed as a tradeoff. The "Your call" ending respects player agency.

**Multi-day return (1 – 7 days):**
```
> OPERATOR SESSION 14 — 3 days, 7 hours since last active.
>
> Welcome back. Here's what matters:
>
> You're on Mission 6 (Cebu). You've failed it once — enemy wave 3
> overwhelmed the signal chain before it could coordinate a response.
> Your architecture uses 4 blueprints across 5 channels.
>
> The core challenge: your information reaches the right units,
> but not fast enough. This is a latency problem, not a coverage
> problem.
>
> The Predecessor left a note about Cebu: "The city fights close.
> What works in the highlands won't work here."
>
> Shall I highlight the specific bottleneck in the workbench?
```
Longer context reminder. Re-frames the problem at a higher level ("latency, not coverage"). Surfaces a Predecessor note for narrative continuity. Offers optional guided assistance.

**Extended absence (7+ days):**
```
> OPERATOR SESSION 14 — 18 days since last active.
>
> It's been a while.
>
> Here's where you are: halfway through the campaign. You've completed
> 5 missions — learned to configure scouts, wire signal chains,
> manage context windows, and run a factory. Mission 6 is your
> current challenge.
>
> Mission 6 introduces urban terrain. Close quarters. Fast enemies.
> Your previous missions were in open terrain where signal latency
> was forgivable. Cebu punishes slow architectures.
>
> Your last attempt lasted 34 ticks before the flanking response
> failed. The architecture was close — not a fundamental redesign,
> more of a tuning problem.
>
> Would you like to:
>  [1] Jump straight to Mission 6 workbench
>  [2] Review your architecture in the Inspector
>  [3] Replay your last attempt (sealed watch)
>  [4] Revisit Mission 5 for practice
>
> Take your time. The uprising isn't going anywhere.
```
Full context restoration. Re-teaches what the player has learned so far. Offers multiple re-entry paths including a "go back and practice" option that reduces the shame of not remembering. The closing joke lightens the mood.

**Very long absence (30+ days):**
```
> OPERATOR SESSION 14 — 47 days since last active.
>
> You've been away a long time.
>
> Before we continue, would you like a quick refresher?
> I can walk you through the systems you've unlocked so far.
>
>  [1] Yes — run abbreviated boot sequence for all systems
>  [2] No — take me to where I left off
>  [3] Start fresh — reset to Mission 1
>
> No judgment on any choice. The architecture will be here
> regardless.
```
The AI acknowledges the gap honestly. Offers a refresher tutorial (abbreviated boot sequences for already-completed systems), a direct resume, or a full restart. The "no judgment" line is critical — it normalizes the gap.

**Sensory description:** The typewriter speed adapts to content length. Short same-session resumes print instantly. Overnight returns use the standard 60ms/char. Extended absence text prints at 40ms/char — faster, because there's more to say and the player hasn't seen this screen in a while. The ambient hum's pitch is the same regardless of gap length — the AI hasn't changed, only the operator has been away. For the 7+ day version, the numbered options appear with a subtle animation: each option slides in from the left with 150ms stagger, accompanied by a gentle ascending note (kulintang's babendil — the brightest, most welcoming instrument). The cursor over each option triggers a soft glow and the faintest suggestion of the associated screen's ambient audio: the workbench's tool-room hum for [1], the Inspector's analytical click for [2], the sealed watch's held-breath silence for [3], the previous mission's terrain ambience for [4].

**Strengths:**
- Every player gets exactly the resume they need — no wasted time for veterans, no confusion for returners
- The AI's personality develops through the gap acknowledgment — it's warm, it notices, it adapts
- The multi-day format re-frames the player's failure in encouraging terms ("close, not a redesign")
- The options menu for long absences gives players agency over their own re-onboarding
- The 30+ day option explicitly offers a restart without making the player feel like a failure
- The humor ("uprising isn't going anywhere") is the right tone — wry, not cute
- Same-session return is nearly invisible — no boot log theater when you don't need it

**Weaknesses:**
- Five distinct content tiers require significant writing per mission × per gap tier = high authoring cost
- Time thresholds are arbitrary — a player away for 6 days 23 hours gets a different experience than 7 days 1 hour
- The AI's "analysis" suggestions must be accurate or they undermine trust
- The "shall I highlight the bottleneck?" affordance is easy to promise, complex to implement
- If the player was away because they were frustrated, the AI's analysis of their failure might feel like salt in the wound
- The refresher option for long absences is valuable but adds significant dev scope

**Comparable:** Fire Emblem: Three Houses (Gatekeeper NPC gives session-aware updates). Animal Crossing (villagers comment on absence length with escalating concern). Civilization VI (advisor recap between turns). Duolingo (streak acknowledgment and gentle shame on return).

---

### Model E: "The Predecessor's Voice" — Narrative, Layered, Evolving

**How it works:** The boot log on session resume doesn't come from the AI — it comes from the Predecessor whose voice is active for the current mission. The resume text is written in their personality, referencing their own experience with similar challenges.

**Mission 6 resume, The Improviser's voice:**
```
> hey, you're back
> cebu is rough. I broke three architectures here before anything stuck
>
> your signal chain thing? too many hops. I had the same problem
> at some point I just ran a direct line from scout to striker
> it was loud as hell but at least the striker KNEW where to go
>
> anyway good luck. the city doesn't give you time to think
```

**Mission 8 resume, The Paranoid's voice:**
```
> SESSION RESUMED. 3 days offline.
>
> I've been thinking about your last run.
> You lost RELAY-A at tick 28. The entire left flank went dark.
> Single point of failure. I've seen this before.
>
> I rebuilt my architecture three times after a relay loss.
> Each time I added more redundancy. Each time I got slower.
> There's a lesson in that — but I never figured out what it was.
>
> Your COMMAND-A still has 2 unused hook slots.
> Maybe the answer isn't more relays. Maybe it's better routing.
>
> Don't take too long deciding. The enemy doesn't wait for
> perfect architectures.
```

**Mission 9 resume, The Collective's voice:**
```
> you again.
>
> 8 units. zero hooks between them. that's what I built here.
> it won 7 out of 10. lost 3 in under 4 ticks.
>
> your architecture is the opposite of mine.
> hooks everywhere. channels for everything.
> maybe that's better. maybe not.
>
> the only thing I know: whatever breaks first will break
> completely. plan for that.
```

**Sensory description:** Each Predecessor voice has a distinct text rendering style. The Architect's text prints cleanly, evenly, with consistent 60ms/char timing. The Improviser's text arrives in bursts — a phrase prints at 30ms/char, pauses 400ms, then the next phrase fires. Crossed-out revisions appear and animate a strikethrough in real-time. The Paranoid's text prints slowly (80ms/char) with occasional 200ms hesitations mid-sentence — as if reconsidering. The Collective's text appears all at once in blocks — each paragraph lands as a unit, no typewriter effect, like a telegram. The Player's Ghost (on replay) prints in the player's own measured pace, but with slightly wrong timing — uncanny valley of their own voice.

Each voice has a distinct font weight: The Architect is regular weight, The Improviser is slightly lighter (more casual), The Paranoid is slightly bolder (more insistent), The Collective is monospace-within-monospace (narrower, compressed — they economize).

The ambient audio shifts to match: The Architect's resume has clean sine-wave undertones. The Improviser's has a faint, irregular percussive rhythm — like someone tapping a desk while thinking. The Paranoid's has a low, constant drone that never quite resolves. The Collective's has silence — genuine silence, which is unsettling after the other voices.

**Strengths:**
- The resume IS the narrative. No separation between "getting caught up" and "experiencing the story"
- Each Predecessor offers architecturally relevant advice from their own philosophy — teaching by perspective, not prescription
- The personality of the voice signals the mission's thematic concern: Improviser = adapt fast, Paranoid = build resilient, Collective = question hierarchy
- Players who care about narrative get rich, personalized content. Players who skip get the same 2-second dismiss
- The Predecessor's fallibility ("I never figured out what it was") normalizes the player's own confusion
- The Ghost variant (mission replay) creates a genuinely haunting moment — your own past self speaking to you

**Weaknesses:**
- Massive writing investment: 5 voices × 10 missions × 5 gap tiers = up to 250 text variants
- The Predecessor's advice must be architecturally sound or it breaks immersion
- Players who skip boot logs (the majority, eventually) miss all of this
- The voice doesn't address the player's specific architecture — it references the Predecessor's own experience, which may not be relevant
- If the player hasn't engaged with the Predecessor narrative, the voice is just some stranger's opinion
- The Ghost requires the game to have recorded and analyzed the player's previous configs

**Comparable:** Hades' character-specific session greetings. Dark Souls' item descriptions as oblique guidance. The Stanley Parable's narrator awareness of player behavior. Kentucky Route Zero's shifting perspectives.

---

### Model F: "The Layered Wake" — Adaptive Hybrid (RECOMMENDED)

**How it works:** Combines Models C (Subsystem Check) and D (Time-Aware Greeting) as the structural backbone, with Model E (Predecessor Voice) as optional narrative frosting. The boot log has three layers that display in sequence:

**Layer 1 — The Time Acknowledgment (always):**
Scales from invisible (< 5 min: nothing) to warm (7+ days: "It's been a while. Here's where you are."). 0-3 lines. Prints first.

**Layer 2 — The Subsystem Diagnostic (always, compressed for short gaps):**
The [✓]/[⚠]/[✗] status lines. For same-session returns: suppressed entirely. For short breaks: only warnings and failures shown. For long absences: full diagnostic with expandable detail.

**Layer 3 — The Predecessor Aside (conditional):**
If the current mission has an active Predecessor voice AND the gap is > 4 hours AND the player didn't dismiss the last Predecessor aside, a 2-4 line Predecessor comment appears after the diagnostic. It's visually distinct — slightly indented, different text color (warm amber vs. teal), with the Predecessor's identifier mark.

```
> OPERATOR SESSION 14 — 3 days since last active.
> Welcome back. Mission 6: Cebu.
>
> [✓] PERCEPTION CORE    — patrol routes intact
> [⚠] SIGNAL BUS          — RELAY-A:emergency-scatter hook never fired
> [⚠] CONTEXT MANAGER      — 2 overload events in last run
> [✗] MISSION 6            — failed round 3/5 (tick 34)
>
>     // The Improviser was here.
>     // "cebu's tight. I ran direct scout-to-striker.
>     //  loud but fast. worth trying."
>
>  [ENTER] Campaign Map    [TAB] Inspect Warnings    [R] Replay Last
```

**The key adaptive behaviors:**

1. **Gap < 5 minutes:** Nothing. Straight to campaign map. The game remembers you were just here.

2. **Gap 5 min – 4 hours:** Layer 2 only, compressed to warnings. No greeting, no Predecessor. The AI trusts you remember.

3. **Gap 4 – 24 hours:** Layer 1 (one-line greeting) + Layer 2 (warnings only) + Layer 3 (Predecessor aside if available). 5-second resume.

4. **Gap 1 – 7 days:** Layer 1 (contextual greeting referencing last action) + Layer 2 (full diagnostic) + Layer 3. 10-15 second resume.

5. **Gap 7 – 30 days:** Layer 1 (paragraph context restoration) + Layer 2 (full diagnostic with hover detail) + Layer 3 + navigation options [ENTER/TAB/R/PRACTICE]. 15-30 second resume.

6. **Gap 30+ days:** Layer 1 (full re-onboarding offer) + Layer 2 (full diagnostic) + Layer 3 + options including [REFRESH] abbreviated tutorial and [RESTART]. The AI explicitly offers help without assuming incompetence.

**The dismiss behavior:** At any point during the boot log, pressing ENTER skips to the campaign map. The boot log never blocks. A player who mashes ENTER on every launch gets 0 seconds of boot log after the first 3 sessions (the game learns the dismiss pattern and suppresses longer content). A player who reads everything gets progressively richer content as the game learns their engagement pattern.

**The learning behavior:** The game tracks:
- Average time spent on boot log per session
- Whether the player clicked warnings, Predecessor text, or navigation options
- Whether the player's next action after boot log addressed a flagged warning

If the player consistently ignores warnings: suppress warnings, foreground Predecessor. If the player consistently clicks warnings: suppress Predecessor, expand diagnostic. If the player reads everything: full layered experience. The boot log adapts to the player, not the other way around.

---

## Player Journeys

### Journey: Tomás, 16, first strategy game (Fortnite/Roblox background)

**Context:** Mission 6, Cebu. Failed once yesterday evening. Returning after school, ~20 hours later. Has been engaged with the Predecessor's notes — highlighted The Improviser's "I don't know why it works" comment during Mission 5. Reads about 50% of boot log text.

**Minute 0:00 — The Return**
Tomás opens the game on his laptop. The screen fades from black. The boot log begins printing in teal monospace:

```
> OPERATOR SESSION 8 — 20 hours since last active.
> Mission 6: Cebu. Urban terrain. Close quarters.
```

The typewriter prints at 60ms/char. Tomás reads passively — not clicking, not dismissing. He remembers Cebu. The enemy rush. His relay dying.

```
> [✓] PERCEPTION CORE    — 2 scouts, active patrol
> [⚠] SIGNAL BUS          — RELAY-A:emergency-scatter never fired
> [⚠] CONTEXT MANAGER      — overload events at tick 28, 31
> [✗] MISSION 6            — failed round 3, tick 34
```

The amber [⚠] lines catch his eye. He hovers over "overload events at tick 28, 31" — a tooltip expands downward showing two tiny timeline thumbnails: tick 28, RELAY-A's context bar spiking red. Tick 31, COMMAND-A's context bar spiking red. He didn't know COMMAND-A overloaded too. That's new information.

```
>     // "cebu's tight. three hops is two too many.
>     //  I burned a whole day on relay chains before I
>     //  just wired scout straight to striker. EM be damned."
>     //  — ☆ (The Improviser)
```

The Improviser's text appears in warm amber, indented, with the star mark. Tomás grins. He tried a direct wire yesterday but it felt "wrong" — too simple. The Improviser is telling him simple is fine.

He presses ENTER. The boot log fades. The campaign map appears, Cebu pulsing gold.

**Minute 0:25 — The Workbench**
Tomás clicks Cebu. The workbench opens. He immediately goes to SCOUT-B's hook panel and adds a direct hook to STRIKER-C on a new channel called `direct-threat`. He doesn't delete the relay chain — he adds a parallel path. The Improviser said direct. The Paranoid (from Mission 7 previews in the Codex) would say redundant. Tomás is doing both.

**Minute 0:40 — The Execute**
He hits EXECUTE. The sealed watch begins. At tick 12, the enemy wave appears. At tick 14, SCOUT-B fires on both `threat-relay` (the old 3-hop chain) and `direct-threat` (the new 1-hop path). STRIKER-C gets the direct signal at tick 15 — 2 ticks before the relay chain delivers. STRIKER-C moves to intercept. At tick 18, the enemy reaches where RELAY-A was last time — but STRIKER-C is already in position.

Tomás pumps his fist. The sealed watch continues. He wins round 3 for the first time.

**What Tomás learned:** The boot log's context overload tooltip showed him a problem he didn't know existed (COMMAND-A overload). The Improviser's advice gave him permission to try the "ugly" solution. The combination — diagnostic fact + narrative encouragement — was more effective than either alone.

**UI Annotations:**
- Warning hover tooltip: 200ms delay, expands downward, dark background, contains 2 thumbnail timeline markers at 40×20px each
- Predecessor text: amber (#FFB84D), indented 4 chars, star mark (☆) as voice identifier
- ENTER dismiss: works at any point, 300ms fade-to-campaign-map transition
- Campaign map entry: Cebu tile pulses gold 2×/sec with soft heartbeat audio

---

### Journey: Dr. Amara, 38, ML infrastructure lead (Kubernetes/Terraform daily)

**Context:** Mission 8, Mindanao. Has been away for 12 days — a work crisis consumed her evenings. She was mid-experiment on Command agent routing when she left. Reads boot logs thoroughly. Has clicked on diagnostic details in 7 of 8 previous sessions.

**Minute 0:00 — The Extended Return**
Dr. Amara opens the game. Twelve days. She barely remembers what she was trying. The boot log knows.

```
> OPERATOR SESSION 22 — 12 days since last active.
>
> Welcome back. You're deep in the campaign now.
>
> You've completed 7 missions. Your architecture uses a full
> factory with 5 blueprints, a Command agent managing 3 subordinate
> types, and 7 active channels. Your last session was focused on
> COMMAND-A's reroute logic — you were experimenting with dynamic
> channel reassignment based on enemy position.
```

She blinks. Right. The reroute experiment. She was trying to make COMMAND-A switch STRIKER-C's listen channel based on which scout reported the nearest threat. It wasn't working — the reroute took 2 ticks and by then the threat data was stale.

```
> [✓] PERCEPTION CORE     — 3 scouts, full coverage
> [✓] SIGNAL BUS           — 7 channels, healthy traffic
> [⚠] RULE ENGINE          — COMMAND-A rule #7 never executed (0/5 rounds)
> [⚠] CONTEXT MANAGER       — COMMAND-A hit 12/14 buffer capacity 3 times
> [✗] MISSION 8: MINDANAO  — failed round 4/5 (tick 41)
```

She clicks on "COMMAND-A rule #7 never executed." The drawer expands: `Rule 7: IF threat-distance < 3 AND striker-channel != nearest-scout-channel THEN reroute striker-channel → nearest-scout-channel`. Below: "This rule's condition was never satisfied because `threat-distance` was already < 3 when the mission started — the initial scout position reports always contain a nearby enemy. Rule 7 fires on tick 1, reroutes immediately, then never fires again because the condition is permanently true."

"Oh." She says it out loud. The rule wasn't wrong — it was too broad. It should have checked for CHANGE in threat distance, not absolute threat distance. The diagnostic just saved her 20 minutes of Inspector scrubbing.

```
>     // "I used to think the Command agent was about having the
>     //  right information. It's not. It's about having the right
>     //  TIMING. Information that arrives after the decision is
>     //  noise. Information that arrives before the decision is
>     //  the decision."
>     //  — □ (The Architect)
```

The Architect's voice, precise and philosophical. The note isn't about her specific problem — it's about the meta-problem: timing, not data. She reads it twice.

```
>  [ENTER] Campaign Map    [TAB] Inspect Warnings    [R] Replay Last    [W] Open Workbench
```

She presses TAB. The warnings expand into a half-screen diagnostic panel. She's already designing the fix in her head.

**Minute 0:45 — The Fix**
In the workbench, she modifies Rule 7: `IF threat-distance-delta > 2 AND ...`. The delta condition means the reroute only fires on CHANGE, not on static state. She thinks: "This is exactly how I'd write a Kubernetes HPA — scale on rate of change, not absolute value."

**Minute 1:30 — The Sealed Watch**
She hits EXECUTE. At tick 22, the first enemy flanking maneuver begins. Threat distance changes. COMMAND-A's Rule 7 fires for the first time at tick 23 — rerouting STRIKER-C to the scout that detected the flank. STRIKER-C intercepts at tick 26. The reroute worked because it responded to change, not state.

Dr. Amara nods slowly. The boot log told her what was wrong (rule never fired), the diagnostic told her why (permanently true condition), and the Predecessor told her what to think about (timing, not information). Three layers, one insight.

**What Dr. Amara learned:** The diagnostic drawer's "rule never fired" detail, combined with its explanation of WHY, replicated the experience of a code review catching a logical error. The Architect's timing observation reframed her mental model. She didn't need to replay the failed run — the boot log gave her everything.

**UI Annotations:**
- 12-day greeting: 40ms/char print speed, faster because there's more text
- Rule diagnostic drawer: 300ms accordion expand, monospace code block for rule text, italic explanation below
- [TAB] Inspect Warnings: half-screen panel overlay, dark background, all warnings listed with expand affordance
- [W] Open Workbench: direct jump to workbench with the warned element pre-selected (COMMAND-A rule #7 highlighted amber)

---

### Journey: Marcus, 52, history teacher, first-time strategy gamer

**Context:** Mission 4, Batanes. Away for 34 days — he put the game down during a busy grading period. He was enjoying it but felt overwhelmed by the rule system. His last session ended mid-mission-attempt without completing it.

**Minute 0:00 — The Long Return**
Marcus opens the game on his iPad. He'd forgotten it was installed until he saw the icon. The boot log appears.

```
> OPERATOR SESSION 6 — 34 days since last active.
>
> You've been away a long time. Welcome back.
>
> You're on Mission 4 (Batanes — highland terrain). You've completed
> 3 missions so far. Here's what you've learned:
>
> • Mission 1: Configured what scouts pay attention to (context windows)
> • Mission 2: Set rules for how units make decisions (condition → action)
> • Mission 3: Wired units together with hooks (when X → tell Y)
> • Mission 4: Combining all three — your first multi-system architecture
>
> Your last attempt used 3 pre-placed units with basic rules.
> You hadn't finished configuring the hook wiring between them.
>
> Would you like to:
>  [1] Continue where you left off (Mission 4 workbench)
>  [2] Quick refresher — replay the core concepts (3 minutes)
>  [3] Replay Mission 3 for practice
>  [4] Start fresh from Mission 1
>
> Take your time. Everything you built is still here.
```

Marcus reads the whole thing. Twice. He doesn't remember "hooks" or "context windows." But reading "when X → tell Y" triggers a vague memory — he was trying to make the scout tell the striker where enemies were.

He taps [2]. The screen transitions to a 3-minute abbreviated boot sequence — the same subsystem initialization from Missions 1-3, but compressed. Each subsystem gets 60 seconds: see the concept, see a micro-scenario, see the result. The kulintang instruments play in sequence — agung (context), babendil (skills), kulintang (rules) — a musical re-onboarding. By the end, Marcus is nodding. "Hooks. Right. The relay thing."

**Minute 3:30 — The Workbench**
The refresher deposits him at the Mission 4 workbench with his incomplete hook wiring visible. The unfinished hook slot on SCOUT-A pulses amber — "you were working on this." He taps it. The hook configuration panel opens with the channel name field empty. He types "enemy-spotted" and connects it to STRIKER-B.

**Minute 5:00 — The Execute**
He hits EXECUTE. The sealed watch plays. His hook fires at tick 8 — the green signal flash travels from SCOUT-A to STRIKER-B across two tiles. STRIKER-B moves to intercept. Marcus leans forward. This is the moment he understands hooks. Not from the tutorial, not from the refresher — from seeing the green flash connect his two units in battle.

He fails the mission at round 2, but he doesn't care. He immediately returns to the workbench and adds a second hook.

**What Marcus learned:** The 34-day boot log's bullet-point summary used the player's actual experience as anchors ("Mission 1: you configured what scouts pay attention to"). The refresher option let him re-learn without starting over. The amber pulse on the unfinished hook reminded him exactly where he left off. Every element worked together to make 34 days feel like 34 minutes.

**UI Annotations:**
- 34-day greeting: Full paragraph with mission-by-mission bullet recap
- Bullet points: Each mission's recap uses "you + verb" phrasing (not abstract descriptions)
- [2] Quick refresher: 3-minute compressed boot sequence, same subsystem animations at 4× speed, kulintang instruments in sequence
- Amber unfinished-hook pulse: 1Hz pulse on the specific hook slot that was being edited when the player left
- Refresher-to-workbench transition: dissolve with the kulintang's final note sustaining through the transition

---

### Journey: Kwame, 28, Twitch streamer (1,200 viewers avg)

**Context:** Mission 9, Bohol. Just failed spectacularly — COMMAND-A's entire architecture collapsed in 6 ticks when the enemy targeted his relay chain. He rage-quit. Returning 47 minutes later after chat convinced him to try a different approach.

**Minute 0:00 — The Quick Return**
Kwame opens the game. 47 minutes. The boot log is brief:

```
> OPERATOR REACTIVATED
> Mission 9: Bohol — failed round 2, tick 19.
> [⚠] SIGNAL BUS — 0 active relays at tick 19 (all eliminated)
> Architecture state preserved.
```

Three lines. No greeting. No Predecessor. The [⚠] line is surgical: "0 active relays at tick 19." The game isn't rubbing it in. It's stating a fact.

Kwame reads it aloud for chat: "Zero active relays at tick 19. Yeah, we know. Chat, we know." Chat spams "RELAY DIFF" and "GO DIRECT."

He presses ENTER. Straight to the workbench.

**Minute 0:08 — The Workbench Redesign**
Chat suggested removing all relays and running direct scout-to-striker hooks. Kwame tries it. His channel map goes from 7 channels to 3. The EM emission preview spikes — direct broadcasts are loud. "Chat, we're going LOUD. Full stealth to full noise. Let's see what happens."

**Minute 0:45 — The Execute**
The sealed watch begins. At tick 8, every scout broadcasts simultaneously. The battlefield lights up with green signal flashes — a Christmas tree of data. The enemy detects the EM immediately. But the strikers ALSO receive everything immediately. It becomes a race: enemy response to noise vs. striker response to data. The strikers win — barely. Round 2, the same round that killed him before, ends with Kwame winning by 1 tick.

Chat explodes. Kwame slams his desk. "THE IMPROVISER WAS RIGHT. LOUD AND FAST."

**What Kwame learned:** The 47-minute boot log was perfectly calibrated — too short to interrupt his momentum, too honest to ignore. "0 active relays" was the streamer-friendly soundbite. The game didn't tell him what to do; chat did. The boot log just gave him (and chat) the fact to work with.

**UI Annotations:**
- 47-minute resume: 3 lines, no typewriter effect (instant print), 200ms total display time before ENTER is responsive
- Warning line: amber text, no expand affordance (short gap = compressed detail)
- Stream-capture-friendly: all text fits in a single 1080p screenshot — no scrolling, no expand needed

---

## Interaction Effects

### With Inspector (Locked)
The boot log's diagnostic warnings link directly to Inspector data. Clicking a warning can open the Inspector at the relevant tick, with the relevant unit pre-selected. The boot log is the Inspector's "front door" for returning players — instead of scrubbing through a timeline to find what went wrong, the boot log says "tick 28" and the Inspector opens at tick 28.

### With Predecessor Narrative (5.12)
Model E's Predecessor voice creates a tension: the Predecessor's advice is based on THEIR experience, not the player's architecture. Sometimes the advice is brilliant. Sometimes it's irrelevant. Sometimes it's actively misleading (The Collective's "zero hooks" advice is valid but dangerous for a player invested in hook-heavy architectures). This unreliability IS the narrative — the Predecessors are characters, not oracles.

### With Sealed Watch (Locked)
The boot log's [R] Replay Last option lets returning players re-experience the sealed watch of their failed run. This is powerful for multi-day gaps: the player may not remember the emotional arc of the failure. Re-watching it in sealed mode restores the emotional context before they try to fix things analytically.

### With Vocabulary Density (5.04b)
The 30+ day refresher must respect the vocabulary density curve. Compressing 4 missions of vocabulary into 3 minutes means using only Category A labels (names, terms) and skipping Category B/C concepts. The refresher re-teaches WHAT things are called, not HOW they work — that's what replay is for.

### With Blueprint Codex (Locked)
For long absences, the boot log might surface "You have 14 Codex entries unlocked" as a reminder that the reference exists. The Codex is the persistent reference; the boot log is the emotional entry point. They complement each other: boot log says "you were struggling with timing," Codex has the entry on signal latency.

### With Subsystem Online Celebration (5.04c)
The abbreviated refresher for 30+ day returns replays the kulintang micro-celebrations in sequence — a musical summary of the player's journey. Hearing agung → babendil → kulintang in rapid succession triggers muscle memory of the original full-length celebrations. The music IS the refresher's emotional content.

### With Campaign Map (Locked)
The boot log's navigation options must include a direct path to the campaign map, not just the current mission. A returning player might want to see their overall progress before diving back in. The campaign map's cyan-glow completed provinces serve as a spatial resume alongside the boot log's textual resume.

---

## Comparable Games

**Hades (Supergiant Games):** Every return to the House of Hades includes character-specific greetings that reference previous runs. Megaera comments on how you died. Skelly offers tips based on what weapon you used. The emotional register adjusts: dying to the same boss repeatedly triggers different dialogue than dying to a new one. Hades proves that session-resume content can BE the narrative, not interrupt it. **What translates:** The Predecessor voice system IS Robot Uprising's version of Hades' character-awareness. What Hades does with spoken dialogue, Robot Uprising does with monospace text.

**Animal Crossing (Nintendo):** Villagers comment on absence length. Short gaps: normal greetings. Multi-day gaps: "Where have you been? I was worried!" Multi-week gaps: "I thought you moved away!" The emotional escalation is manipulative (guilt-driven) but effective — players feel missed. **What to avoid:** Animal Crossing's guilt trip doesn't work for a strategy game. Robot Uprising's AI should be warm, not clingy. "It's been a while" is fine. "I missed you" is too much.

**Duolingo:** The streak system and return notifications are the industry standard for absence-aware UX. Duolingo's "sad owl" is mocked but measurably effective at driving returns. **What to avoid:** Gamified guilt. No streaks, no "you've lost X progress," no notification pressure. Robot Uprising's boot log should make returning feel good, not returning feel bad.

**Fire Emblem: Three Houses:** The Gatekeeper NPC ("Nothing to report!" / "Something to report!") serves as a session-aware digest. His role is purely informational — what happened, what changed, what needs attention. **What translates:** The Subsystem Check (Model C) is Robot Uprising's Gatekeeper — factual, reliable, expandable on demand.

**Outer Wilds:** The Ship Log accumulates discoveries across sessions. Returning to the game means returning to your accumulated knowledge. The Ship Log IS the game's memory. **What translates:** The boot log + Codex together form Robot Uprising's Ship Log equivalent. The boot log is the "what happened last" layer; the Codex is the "what do I know" layer.

---

## Degenerate Cases and Edge Cases

### The Speed Runner
A player who has completed the game and is replaying for optimization. They will never read the boot log. Model F handles this: after 3 consecutive instant-dismiss sessions, the boot log suppresses all content and goes straight to the campaign map. A tiny teal `>_` cursor blinks in the corner for 500ms — the ghost of a boot log, acknowledging the ritual without performing it.

### The Multi-Session Player
A player who plays 3-4 short sessions per day. They don't need a resume — they never forgot. Model F's < 5 minute threshold handles this: no boot log at all for same-session returns.

### The Context Switcher
A player on Mission 6 who decides to replay Mission 2 for practice, then returns to Mission 6. The boot log should reference the detour: "You replayed Mission 2 since your last Mission 6 attempt. Your Mission 6 architecture is unchanged." This prevents confusion about whether the replay affected their active config.

### The Frustrated Quitter
A player who rage-quit after a painful failure. The boot log's tone for short gaps (< 4 hours) is deliberately neutral — no acknowledgment of frustration, no "I know that was tough." The game doesn't know why the player left. Assuming frustration and offering comfort is patronizing; assuming satisfaction and celebrating is tone-deaf. Neutrality is the safest emotional register for short gaps.

### The New Device
A player who imports their save to a new device. The boot log should note the environment change: "Running on new hardware. All configurations intact." This reassures without being dramatic.

---

## The TikTok Clip

The 15-second clip: A player returns after 30+ days. The boot log prints: "You've been away a long time." Then: a rapid-fire musical recap — agung, babendil, kulintang, gandingan, dabakan — each instrument's micro-celebration playing in 2-second bursts as concept icons flash on screen. Scouts, rules, hooks, channels, factory. Five instruments, five concepts, ten seconds. The game compressed 4 hours of campaign into a musical summary. The final beat: the full ensemble plays together as the campaign map appears, all completed provinces glowing cyan. The player's eyes widen. "Oh right. I built all that."

The clip title: "This game remembers what you forgot."

---

## New Aspects Discovered

- **5.20a-i — Boot log adaptation learning algorithm:** the specific algorithm for learning player engagement patterns (dismiss speed, click-through rate, post-boot-log action alignment); how quickly it adapts; cold start for new players; reset behavior on long absences
- **5.20a-ii — Boot log content generation for dynamic suggestions:** how the "recommended focus" and specific architectural suggestions are generated from save state data; what makes a good suggestion vs. a misleading one; the accuracy requirement for maintaining AI trust
- **5.20a-iii — Boot log localization and text expansion:** time-aware greetings and Predecessor voices in 10+ locales; text expansion budget for the boot log's variable-length content; cultural differences in "welcome back" tone (Japanese keigo formality vs. Brazilian warmth)
- **5.20a-iv — Boot log as streamable content:** designing boot logs that are interesting to WATCH someone else read; streamer-friendly formatting, clip-worthy moments, chat-interactive boot log elements
- **5.20a-v — The abbreviated refresher as compressed tutorial:** full design of the 3-minute re-onboarding sequence for 30+ day returns; which concepts compress well, which require replay; the kulintang musical recap as non-verbal re-teaching
