# Sealed Replay for PvE Missions

**Aspect:** 1.06c-ext-A-iii — Applying the sealed mechanic to campaign missions — hiding pass/fail until player watches; whether sealed tension works when the player designed both sides of the encounter

**Parent:** 1.06c-ext-A — Sealed Replay as Tension Mechanic
**Siblings:** 1.06c-ext-A-i — Replay Length as Tension Design; 1.06c-ext-A-ii — The "False Pivot" Anti-Pattern
**Related:** 4.04b — Two-Act Debrief Structure

---

## The Fundamental Question

The sealed replay mechanic was designed to solve a specific PvP problem: you know what *you* built; you don't know what *they* built; hiding the result while you watch manufactures genuine suspense from genuine uncertainty.

Campaign missions break this model. The player built their robot architecture. The enemy architecture is scripted, documented in the mission briefing, with fixed unit compositions and behavior trees that the player has read. The player *designed their solution against a known problem*. The match has already resolved. The outcome is already determined.

**Does hiding that outcome produce tension? Or just friction?**

The answer is not "no" — but it depends entirely on which dimension of uncertainty is sealed.

---

## The Two Types of PvE Uncertainty

To understand sealed PvE mechanics, we need to distinguish two fundamentally different uncertainty types that exist in Robot Uprising campaign missions:

### Type 1: Outcome Uncertainty (Did I Win?)
The player doesn't know whether their architecture passed or failed. This exists maximally on a first attempt, diminishes after the third attempt, and approaches zero on attempt #10. The player has usually already formed a strong prediction ("I think this is going to work" / "I'm not sure about the relay timing") before executing.

This is the uncertainty sealed replay addresses in PvP. In PvE, it's partial and asymmetric: the enemy is known, the player's config is known, the uncertainty is purely about whether the player's own solution is *correct enough*. This is programmer uncertainty — "does my code work?" — not competitive uncertainty — "what did they build?"

### Type 2: Scenario Uncertainty (Which Cases Will I Hit?)
With the 100-randomized-test-case model (aspect 1.04e), even a player who has built a correct architecture doesn't know *which specific enemy layouts, spawn positions, and signal paths* will appear in this execution. They might pass 88/100 and the sealed reveal is "you'll find out which 12 when you watch."

This is where PvE sealed mechanics find their strongest footing. The randomization creates genuine combinatorial uncertainty. A player who got 75/100 last run doesn't know if their targeted fix improved things to 88/100 or caused a regression to 60/100. **This uncertainty is fully genuine, and sealing it adds real tension.**

---

## The Asymmetries That Make PvE Sealed Different

Before exploring design options, the core asymmetries must be understood:

**Asymmetry 1: Iteration tempo**
PvP async is 6-24 hours between submits and results. Each sealed replay is a *significant event* — you've been waiting. PvE iteration is 10-30 minutes. You fail, tweak, resubmit, watch. Sealing a 3-minute replay on a 10-minute iteration cycle is a 30% overhead. Sealing a 3-minute replay on a 6-hour async cycle is negligible. **PvE sealed must be shorter, smoother, or optional to avoid becoming a death-by-friction experience.**

**Asymmetry 2: Who designed the problem**
In PvP, the opponent is a person with creative agency who made something you haven't seen. In PvE, the "opponent" is a designer's script. The surprise factor is self-referential: the player is asking "was I clever enough to beat this puzzle?" rather than "was I clever enough to beat a thinking opponent?" The emotional register is *puzzle completion* rather than *competitive victory*. These feel different in the gut.

**Asymmetry 3: "You designed both sides" — but did you?**
The aspect prompt notes "the player designed both sides of the encounter." This is only true in sandbox/custom mode. In campaign, the enemy is explicitly not the player's creation. However, the player has *full knowledge* of the enemy — which makes the tension more like a test submission than a battle report. "I studied for this exam. Did I pass?"

**Asymmetry 4: The 100-case model distributes uncertainty differently**
A single PvP match resolves as binary: win or loss. A PvE run resolves as a score: 78/100. The sealed reveal isn't "win or lose" — it's "find out your score." This is a *quieter* tension (curiosity about a grade rather than a sporting outcome), but it's deeply compatible with the intellectual tone of Robot Uprising's core audience.

---

## The "Designed Both Sides" Variant: Sandbox Duel Mode

The aspect prompt explicitly asks whether sealed works "when the player designed both sides." This requires addressing the sandbox/custom scenario case separately, because there is exactly one context where the player *does* design both sides:

**The Adversarial Sandbox**: A design mode where the player configures both the "blue team" (their uprising bots) and the "red team" (the enemy they're practicing against). This is a solo practice tool, not a mission.

In this context, sealing the result is bizarre: the player *knows* both architectures. There is zero uncertainty about what either team will do. The outcome can be inferred analytically without watching. Sealed is pure theater here — the player is essentially pretending not to know the answer to a math problem they calculated. This produces a specific, limited emotional effect:

- It turns the execution into a ceremony rather than a test
- It gives the replay aesthetic value (watching it "fresh") without informational value
- It functions like sealing a letter you wrote and then unsealing it later

**Verdict for sandbox duel:** Sealed should be opt-in only, with no friction applied to revealing immediately. The emotional function is ritual, not suspense.

---

## Six Design Options for Campaign Sealed

### Option A — No Seal in Campaign (PvP-Only Mechanic)

Campaign missions show results immediately: "MISSION COMPLETE — 94/100 scenarios passed." The watch button is available but non-blocking. Only Gauntlet (PvP) uses sealed mechanics.

**Rationale:** Campaign is a learning environment. Fast iteration is the core value. Sealed replay interrupts the iteration-tweaking feedback loop that is the campaign's pedagogical engine. Mission 3 should not take 15 minutes per attempt because of mandatory watching.

**What this loses:** The campaign never produces the "sealed reveal moment" — a specific emotional beat that could be a powerful memory anchor. First passing a hard mission with sealed would be a significant moment; without sealed, it's just a pass/fail banner.

**What this gains:** Fast iteration. Clean, legible feedback. No friction on the core learning loop.

**Recommended if:** The campaign is primarily a tutorial for the Gauntlet. Learning speed matters more than emotional drama in the early acts.

---

### Option B — Boss-Mission Sealed Only

Normal campaign missions show results immediately. The final mission of each chapter (the "boss encounter") gets sealed replay treatment — the player must watch before seeing the result.

**Rationale:** Chapter-end missions are designed as emotional peaks. Players spend 30-60 minutes on them (many failed attempts). When they finally execute what they believe is their solution, the wait has earned the drama. Sealing the boss mission replay creates a ritual around the chapter completion moment.

**Design detail:** Boss mission sealed replay should be longer (90-150 ticks) and architecturally more complex — multiple phases, presence score reversals, meaningful false pivots — to justify the sealed watching investment.

**Precedent logic:** Zelda bosses. Dark Souls fog doors. The dramatic weight of a chapter-ending battle implies a slower, more ceremonial reveal.

**What this loses:** The sealed mechanic is rare and special, not a habitual experience.

**What this gains:** Boss-mission moments become the game's most shared clips. "Watch me find out I beat Chapter 2's boss" is a natural streaming beat.

---

### Option C — Pass-Score-Sealed Only (The Report Card)

The result banner shows: **"Execution complete. Watch replay to reveal your score."** The MISSION PASS/FAIL threshold is not hidden — that's shown (so the player knows if they're unblocked) — but the specific scenario score (e.g., 78/100 vs. 94/100) is sealed behind the replay.

**Rationale:** This separates two distinct emotional events:
1. "Did I pass?" — binary, urgent, iteration-relevant. Show immediately.
2. "How well did I do?" — nuanced, discovery-flavored, self-evaluative. Seal it.

A player who passed at 81/100 and then watches the replay will see which 19 scenarios failed. These failures are still valuable information — they show edge cases to fix for a higher score. The sealed reveal is "here's where your architecture cracks" rather than "here's whether you won."

**This is the strongest PvE-native sealed mechanic** because it aligns the seal with the information that is actually uncertain and valuable: the distribution of performance, not the binary outcome.

**UI treatment:** After execution, the banner says: "MISSION STATUS: PASSED [81/100 scenarios sealed — watch replay to reveal]". The 81/100 is not shown as a number yet — just "passed" with a sealed indicator. Watching the replay plays normally, but the scenario tracker (the 10×10 grid of dots, green/red) fills in live as each test case resolves on screen. At the end: the final grid, fully populated. The score revealed as you watch it accumulate.

---

### Option D — The Confidence Wager

Before executing, the player optionally declares a confidence level: "I'm confident" / "Not sure" / "Experiment." Declarations are paired with default sealed/unsealed behavior:

- "I'm confident" → sealed by default (the player has staked something on their conviction)
- "Not sure" → immediate result
- "Experiment" → immediate result with reduced-friction debrief

**Why declaring matters:** The confidence declaration is a forcing function for metacognition. Before executing, the player must commit to a belief about whether their solution is correct. This is directly analogous to the test-driven development mindset ("I believe this function returns X") — a transferable skill the game is explicitly trying to teach.

**Small reward for correct confidence:** A cosmetic achievement "Calibrated Confidence" tracks how often a player who declared "I'm confident" actually passed. A high accuracy rate earns a small badge. This turns sealing into a skill-expression game within the game.

**Failure case:** Players who always declare "Not sure" to avoid sealed friction — this would need a gentle nudge, perhaps making the "I'm confident" button more visually prominent as an invitation rather than a pressure.

---

### Option E — Fail-Sealed Only (The Debugging Ritual)

Wins are revealed immediately: "MISSION COMPLETE — 94/100." Failures are sealed: "Execute replay to see what happened." You must watch before you can access the failure analysis debrief.

**Philosophical inversion:** The seal isn't "withholding the outcome" — it's "requiring you to witness the failure before you can diagnose it." This turns the sealed replay into a mandatory step in the debugging loop rather than a drama device.

**Emotional profile:** Distinct from all PvP-derived models. The experience of watching your architecture fail sealed is something like watching a recording of yourself making a mistake — uncomfortable but not suspenseful. The sealed experience here is about *attention direction*, not drama: the game is requiring you to watch the match play out rather than jumping straight to the histogram or the failure-cluster annotations. The failure is revealed progressively as you watch, so you identify the approximate trouble point before the debrief confirms it.

**Teaching benefit:** A player who watches their 62/100 failure unsealed might skip straight to the failure cluster grid and miss the moment at tick 40 where the relay buffer filled and the striker began acting on 15-tick-old data. Forced watching catches these "invisible" failure moments.

**Comparable mechanic:** The way police body cam footage is sometimes reviewed before written reports, to prevent the report from being shaped by the outcome rather than the experience. Watching first primes diagnosis differently.

---

### Option F — Progressive Reveal (The Score Accumulator)

This is the PvE adaptation of Option E from the PvP sealed design (the "cliffhanger system"). The replay plays normally, but the pass/fail counter is live and visible — scenarios are resolved and counted as the replay progresses through test cases.

Not "sealed" in the traditional sense — the player can see the score building in real time. But the final result isn't pre-revealed. Each test case that resolves green is a small victory. Each red is a small failure. The final score arrives at the end of the match rather than at the start of the watch.

**Visual treatment:** The 10×10 scenario grid sits in the corner of the replay view. Each test case's dot activates as that scenario's tick range plays. The counters tick up live: "47/100... 48/100... [scenario 49: RED]... 50/100..." A pass-threshold line glows gold at the required score (say, 75). Crossing it produces a celebration overlay. But the final score isn't known until all cases have resolved.

**This is the least "dramatic" sealed option but the most *engaging* to watch** — each scenario resolution is a micro-beat. Watching 100 test cases resolve against your architecture is like watching 100 tiny exams graded in real time. This creates a specific kind of suspense unique to PvE: "Will case #83 hit the weird edge case I didn't fix?"

---

## Player Journeys

### Journey: Marcus, 29, Software Engineer, 5th Attempt at Campaign Mission 6 ("Signal Interception")

**Context:** Mission 6 requires an architecture that intercepts enemy communications through a relay chain. Marcus has failed four times. Attempts 1-3 were clearly wrong. Attempt 4 scored 71/100 — close, but the threshold is 80. He watched the debrief, identified that cases where enemy spawned early were failing, and added a timeout hook. He's confident this fixes it. He's running Option D (Confidence Wager).

**Minute 0:00 — The Wager**
The pre-execution panel shows the scenario parameters: enemy spawn timing, 20-tick variance window, three possible spawn quadrants. Marcus reviews his changes. The bottom of the screen shows three buttons: "I'm confident," "Not sure," "Experiment." There's no pressure to choose — just an invitation.

Marcus hesitates. Then clicks "I'm confident." The button presses with a satisfying *clunk* sound. A small amber diamond appears next to the Execute button. The confidence level is now committed.

He's thinking: *Okay. I fixed the timeout. This should work. If it doesn't, I want to know why.*

**Minute 0:30 — The Execution Flash**
He clicks Execute. The workbench folds away. The notification: "EXECUTION COMPLETE. Your confidence is on the line." A sealed lock icon, cyan, with a countdown. He clicks Watch.

The battlefield spins up. His relay chain activates — the amber chain of hooks glowing softly orange as messages propagate. He can see the incoming enemy early-spawn cases. His new timeout hook fires correctly. He can *see* it working.

*Yes. Yes. Okay, that's the fix.*

**Minute 1:45 — The Scenario Grid**
The scenario tracker is visible but sealed — 100 grey dots. As each scenario resolves, a dot turns green or red. He doesn't know which scenario number is which. He just watches the dots fill. Green. Green. Green. Red. *Which one was that?* Green. Green. Green. Green. Red. *Still two failures so far. Keep watching.*

At tick ~80, the grid is 60% filled. He's at 55 green / 4 red / 41 pending. He's on track.

**Minute 2:30 — The Threshold Cross**
Scenario 82 resolves green. The counter reads: "80/100 — THRESHOLD MET." A gold flash crosses the grid. The pass-threshold line pulses. But the replay keeps going — 18 more scenarios to resolve, even though the pass is confirmed.

Marcus leans back. The remaining scenarios still matter — higher score means better histogram placement — but the anxiety is gone. The match plays out. Final score: 83/100. The amber diamond next to the score glows: "Confident: CORRECT."

He's thinking: *Okay. So the 17 failures are edge cases still — let me see which clusters failed.*

**Resolution:**
Marcus is already clicking into the debrief before the reveal animation finishes. The sealed experience worked: the scenario grid live-accumulation gave him a specific beat — the threshold cross — that felt like a genuine moment of confirmation. He knows exactly what he wants to fix next.

**UI Annotations:**
- Confidence wager button: three options, amber diamond appears on selection, no penalty for "Not sure"
- Sealed lock: cyan, "EXECUTION COMPLETE" message replaces workbench
- Scenario grid: 10×10 grid, dots fill live, green/red as test cases resolve, pass-threshold line pulses gold when crossed
- Final score: replaces sealed lock animation with a 1-second counter that ticks up to 83

---

### Journey: Aiko, 17, High School Student, First Attempt at Mission 3 ("Relay Chain")

**Context:** Aiko has never failed a mission yet. Missions 1 and 2 were easy — the game scaffolded her through them with guided first-touch tutorials. Mission 3 is the first mission where she builds a relay chain herself, and the tutorial explicitly said "there are many ways to solve this." She's built something she thinks makes sense. She has no idea if it works.

**Minute 0:00 — The First Execute**
She clicks Execute. There's no confidence wager on Mission 3 — the wager only appears from Mission 5 onward, once the game knows she understands the mechanics. Instead, the button just says "Execute — results sealed."

A tooltip, the first time: "In Robot Uprising, you watch before you know. Your architecture speaks for itself."

She reads it. Clicks Execute.

**Minute 0:15 — Watching Without Knowing**
The battlefield renders. Her relay chain activates. She can see... things happening. She doesn't entirely know if what she's seeing is correct or not. A message propagates through the relay — she can see the blue glow moving from agent to agent. Her striker receives something and moves.

*Is that right? Is that what's supposed to happen?*

She has no reference. This is her first relay chain. She doesn't know if the striker is supposed to move like that, or whether the signal arrived in time. The sealed experience for Aiko is not "I know my solution, will it work?" — it's "I don't know enough to judge what I'm watching."

**Minute 1:00 — The Unexpected Reveal**
The match resolves. A banner fades in: **"MISSION COMPLETE."** Aiko lets out a breath she didn't know she was holding.

Then the score: **"89/100 scenarios passed."**

She stares at it. She had no idea she was doing well. She thought she might be failing.

The debrief opens. The scenario grid shows 11 red dots in a cluster — all on cases where enemy spawned in Quadrant C. The debrief annotation: "Your relay has a blind spot for Quadrant C spawns. Your striker reaches them too late. Fix the relay's hook trigger to account for early Quadrant C detection."

**Resolution:**
Aiko's experience of sealed PvE was different from a veteran's: not "I know this should work, let me confirm" but "I have no idea, let me find out." The sealed mechanic worked because Aiko's first-attempt uncertainty was genuine and total. The reveal felt like a grade coming back. She immediately wants to fix the Quadrant C problem — her first voluntary optimization.

**UI Annotations:**
- Execute button for early campaign: no confidence wager, just "Execute — results sealed" with tooltip on first use
- Battlefield: full visual, hooks glow during propagation, no outcome spoilers in the HUD
- Result banner: fades in at match completion, full-screen for 2 seconds before shrinking to HUD
- Score: ticks up from 0 over 1 second to final value

---

### Journey: Priya, 34, Product Manager, Attempt #11 at Mission 7 ("Buffer Exhaustion")

**Context:** Priya has been stuck on Mission 7 for two evenings. The mission requires building an architecture that maintains buffer hygiene over a 120-tick match — enemy is designed to flood the player's relay with junk signals. She has failed 10 times. Scores: 41, 38, 55, 61, 67, 63, 72, 74, 74, 71. A plateau. She thinks she's made a change that might break the plateau. She is exhausted. She does NOT want sealed replay.

**Minute 0:00 — Opting Out**
The default is Option C (pass-score sealed). Priya clicks "Show score immediately" before hitting Execute. The button is clearly labeled. There's no friction, no shame text. A small toggle flips: "Immediate result." She hits Execute.

**Minute 0:10 — The Immediate Read**
The execution completes. The result banner: "79/100 — MISSION THRESHOLD NOT MET (80 required)." She closes her eyes. *One point.*

She clicks into the debrief without watching the replay at all. She does not press Watch. She goes straight to the failure cluster grid. The debrief shows 21 red dots — she can see a pattern she hasn't noticed before: almost all the failures are in scenarios 60-80, which correspond to the late-match period. Her buffer hygiene is breaking down around tick 80-90 regardless of which case runs.

She has her next fix. She doesn't need the replay.

**Minute 3:00 — The Next Attempt**
She makes the change, executes, this time letting it seal because she's curious whether her new approach changes the pattern. Score: 84/100. MISSION COMPLETE.

Now she watches the replay. Not sealed — she already knows she passed. She watches because she wants to see what 84% success actually *looks like*. The buffer eviction fires, the relay clears, the striker gets fresh data and converges. She watches it work.

**Resolution:**
Priya's journey illustrates the key principle: **sealed PvE must be opt-out-able, and the opt-out must be frictionless.** Forcing sealed replay on an exhausted player stuck at 79/100 for the 11th time is hostile design. The goal is to have sealed be *available* for the emotionally meaningful moments, not mandatory for the grinding ones.

**UI Annotations:**
- Sealed toggle: always accessible before Execute; default sealed but "Show immediately" is prominent, no negative framing
- Immediate result banner: larger, appears 0.5s after execute
- Failure cluster grid: accessible without watching replay; filters by tick range, scenario number, failure type
- "Watch replay" button is present but non-blocking after immediate result

---

## Strengths

**Sealed PvE is strongest when:**
- It's the player's first attempt on a mission (genuine outcome uncertainty)
- The run uses randomized scenarios with meaningful variance (genuine combinatorial uncertainty)
- The player has declared confidence explicitly (psychological investment)
- The mission is a chapter-end boss (emotional weight justifies the watching investment)
- It's used for Pass-Score-Sealed Option C (sealing the interesting information, not the urgent one)

**The progressive scenario accumulation (Option F) is the strongest PvE-specific innovation** — it creates a live feedback experience unique to PvE that PvP sealed doesn't have. Watching 100 scenarios resolve in real time is a different kind of suspense from watching one match.

---

## Weaknesses

**Sealed PvE fails when:**
- The player is on their 5th+ failed attempt and is in fast-iteration debugging mode
- The mission is not randomized (deterministic missions have zero combinatorial uncertainty; the result is either known or can be inferred quickly)
- The replay is long and the match was a quick stomp (watching a 120-tick sealed replay that fails at tick 10 is pure punishment)
- The "designed both sides" framing applies (sandbox duel mode — player knows both architectures)

**The core failure mode of forced PvE sealed:** The player learns to predict outcomes by watching the first 30 seconds of the replay. If they can tell "this is going to fail" from early signals, the forced watching time is wasted. The game trains players to skip-to-conclusion before the game can reveal it.

---

## Interaction Effects

**With the 100-test-case robustness model (1.04e):**
Option F (progressive scenario accumulation) is only possible because of the multi-scenario execution model. Single-scenario deterministic missions have only one resolution event. The 100-case model creates 100 micro-resolution events, enabling the live score accumulation mechanic. These two systems are architecturally coupled.

**With the two-act debrief (4.04b):**
Sealed PvE is the natural activation condition for the two-act debrief structure: Act 1 (sealed watch, emotional experience) → Act 2 (full debrief analysis, intellectual diagnosis). The seal breaking — the moment the mission complete/fail banner appears during the watch phase — is the transition event between acts. Without sealed, Act 1 and Act 2 collapse into a single analytical experience.

**With the confidence wager (Option D):**
Creates a pre-execution metacognition habit that transfers to real agentic engineering. Developers who run tests should form beliefs about whether the tests will pass before running them. The game teaches this by rewarding calibrated confidence.

**With the 4.07a "Blocked" visual state:**
If agents are stuck in blocked states during the sealed replay, the player can observe the deadlock forming without knowing the outcome. A sealed replay where you watch a deadlock develop tick-by-tick, not knowing if the deadlock resolves or kills the match, is uniquely suspenseful — you're debugging and watching simultaneously.

**With the false pivot problem (1.06c-ext-A-ii):**
PvE sealed missions have a specific false pivot pattern not present in PvP: the **"fixed scenario fake-out."** Certain test cases in the 100-case randomized run will *always* look dramatic but *always* resolve the same way. The player in a sealed PvE run might watch Case 47 (high enemy spawn density) and think "THIS is where I fail" — but Case 47 is actually fine; it's Case 82 (quiet Quadrant C spawn) that silently eats a failure. PvE false pivots need specific debrief treatment.

---

## Comparable Games / Media

**SpeedRun.com split timers:** Speedrunners watch their run in real time, splits filling in as they hit checkpoints. The final time is "sealed" until the last split registers. The live-split experience is Option F (progressive reveal): each checkpoint is a micro-resolution. The runner knows if they're on pace but doesn't know the final time until the final split. This is a clean functional analogue to the scenario-accumulation mechanic.

**Competitive Pokémon team preview:** In competitive Pokémon, you see your opponent's team before battle but don't know their movesets, items, or EVs. This is the canonical asymmetric information sealed experience — you know *something*, you don't know *everything*. PvE sealed with randomized scenarios works the same way: you know the enemy's general architecture, you don't know exactly which variant you'll face. This is why PvE sealed is strongest with high-variance scenario generation.

**Paper grading vs. instant test feedback:** Traditional paper tests create a time delay between submission and result. Digital auto-graded tests show result immediately. The psychological difference is well-documented: paper results feel more "earned" and "official" because the wait forces commitment to the submitted answer. PvE sealed creates this "paper test" emotional quality. A result that arrives immediately feels like a tool output; a result you watch arrive feels like a verdict.

**Hearthstone Arena draft:** Players draft a deck, then play it out — they don't know how well their draft will do until they've played the matches. The evaluation of "was my draft good?" is revealed progressively through wins and losses, not as a single upfront score. PvE sealed with live scenario accumulation has the same structure: evaluate your configuration as its performance reveals itself.

---

## Sensory Description

**The sealed PvE watch experience looks and feels like this:**

The battlefield is full resolution — this is not a summary screen. Your agents are dots of color that pulse when acting: a clean white pulse for skill activation, a relay's hook firing as a thin amber thread that stretches between agents and then dissolves. The thread isn't instantaneous; it travels, visibly, at one hop per tick, the amber light moving across the map at perceptible speed.

In the corner: the **scenario grid**. A 10×10 arrangement of small circles, all grey at start. As each test case resolves, a dot lights — either pale green (cool, confirming) or a dim red (warm, slightly alarming). The transitions are not simultaneous — they happen when that scenario's tick clock closes, so the grid fills asynchronously, dots lighting in a pattern that looks almost random but follows the tick logic of each scenario.

The **score counter** is only visible in Option F. It's a two-part display: "XX / 100" in the lower left, below the grid. The left number ticks up in real time. It doesn't jump; it increments one integer at a time when a scenario resolves, with a small mechanical *tik* sound for green and a softer *tok* for red. The pass-threshold line is a gold horizontal stripe across the grid at the appropriate row. When the green count crosses it, the stripe pulses bright once.

When the match fully resolves — all 100 scenarios done, or the max tick reached — the grid stills. For 1.5 seconds: silence. Then the result banner slides in from the top: a dark panel with large text. If passed, the text is pale gold: **"MISSION COMPLETE"** with the score below it in smaller type. If failed, the text is grey-white: **"SYSTEMS DEGRADED"** (not "MISSION FAILED" — language that preserves agency: your systems degraded, not you failed) with the score and the threshold shown side by side so the gap is immediately legible.

A small sound on pass: a clean three-note ascending tone, almost like a startup chime, but lower and more deliberate. On fail: a single descending note, held, then silence. No buzzer. No alarm. Quiet assessment.

---

## The TikTok Clip

**Option F (progressive scenario accumulation), boss mission, player at threshold:**

The clip opens mid-match. Sixty-two seconds of beautiful hook-cascade watching — agents coordinating across the map, amber threads connecting relay to striker. In the corner, the scenario grid filling: green green green red green green green... The counter reading: **"74/100."** The pass-threshold gold line at 80.

Then, in the last fifteen seconds: five scenarios resolve in quick succession. **75... 76... 77... 78... 79...** One point from threshold. The player (off-screen) audibly inhales.

Scenario 100 resolves: **green.** The counter ticks to **80.** The threshold line pulses gold.

The banner slides in: **"MISSION COMPLETE."**

The clip ends. No commentary needed. The number-by-number buildup and the threshold-crossing green dot do all the work. This is the "lottery scratch reveal" energy — but for a puzzle game that taught the viewer something about attention systems while they watched.

---

## New Aspects Discovered

- **4.04b** — Two-act debrief structure: designing the watch experience and the analysis experience as sequential phases — sealed watch (emotional) → full debrief (analytical) — with a deliberate transition between them; the "seal breaking" as the transition event *(already in frontier)*

- **5.23-ext** — Campaign match length calibration for sealed mechanics: if campaign missions use 50-70 ticks (as documented in 5.23), sealed watching is 1.5-2 minutes; if randomized scenarios run 100 scenarios at variable tick lengths, total sealed watch time could be 5-8 minutes; design constraints on scenario count and tick ceiling are determined partly by the tolerable sealed watching time ceiling

- **5.25** — The "oracle preview" anti-pattern: players who alt-tab to look up a tier list or YouTube solution to discover the expected pass rate before watching their sealed replay; designing against this by making the sealed experience fast enough and surprising enough that spoiling it feels like opting out of the fun rather than gaining useful information

- **2.28** — Scenario fingerprinting: giving each of the 100 randomized test cases a persistent visual identity (distinct color tag, icon, or seed number) so players can identify which specific scenario caused a failure across multiple runs ("Case #47 always fails me"); designing the scenario taxonomy to be learnable, not opaque; whether cases should be named or numbered in the player-facing UI
