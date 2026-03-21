# 8.13 — Three-Act Metric Mapping

**Aspect:** Formally defining the primary career stat for each act (Campaign: pass rate / Advanced Campaign: robustness % / Gauntlet: eEDT) and designing the transition moments where a new primary stat becomes visible for the first time.
**Category:** Cross-Cutting Synthesis (Wave 8)
**Related:** 4.25 (EDT Trajectory), 4.26 (False Pivot Gap), 8.07 (Robustness vs. Efficiency), 8.09 (Diagnostic Teaching Layer), 5.22 (Gauntlet as Third Act), 8.04 (Minimum Viable Game), 8.05 (Maximum Viable Game), 1.04e (100-Test-Case Robustness), 4.29 (eEDT Rolling Window), 4.31 (Career Growth Event Detection)

---

## The Mechanic: The Three Numbers

Robot Uprising has three acts. Each act foregrounds a single primary metric that defines what "good" means. The metrics do not replace each other — they layer. But the primary metric shifts, and each shift is a designed revelation moment. Call the whole system **The Three Numbers**.

### Act I: Campaign — Pass Rate

**What it measures:** Did you win? Binary. Green checkmark or red X. Ten missions, each either passed or not. The career dashboard shows a simple fraction: **7/10**, **9/10**, **10/10**.

**How it works mechanically:** Each mission has a victory condition (destroy enemy base, survive N ticks, eliminate all enemies). You either meet it or you do not. Invisible randomization means each execution varies — enemy patrol routes shift, spawn timing jitters, resource node placement rotates within constraints. But Campaign randomization is gentle; a good architecture wins 95%+ of executions on a given mission. The pass rate is effectively binary per mission: you have the architecture or you do not.

**What it teaches:** Architecture correctness. Your system either works or it does not. Pass rate is the simplest possible metric — it asks "did you solve the puzzle?" The player learns to build architectures that function, period. No shades of grey. No "well, it almost worked." The one-shot-one-kill combat model reinforces this: one mistake in the information chain and a striker walks into an ambush. Pass or fail.

**Where it lives in the UI:** The campaign map shows each province with a green circuit-glow (passed) or dim grey (locked/failed). The campaign overview panel shows the fraction prominently — large numerals, DM Sans Bold, 48px. Below the fraction, a row of ten small squares, each green or grey, representing individual missions. No percentages. No decimals. No ambiguity.

**The sensory experience of pass rate:** Green is relief. The province on the archipelago map flickers from gold-pulse (current mission) to steady cyan glow. A brief chord — two notes, the second a major third above the first — plays as the circuit-board data cables connecting the province to its neighbors illuminate. The mission square in the overview fills from left to right with a liquid-green animation, like coolant flooding a channel. The fraction ticks up: 6/10 becomes 7/10. It is simple, clean, and complete.

### Act II: Advanced Campaign — Robustness %

**What it measures:** Of 100 procedurally generated scenario variants for a given mission, how many does your architecture survive? Not a binary pass/fail — a percentage. **73/100. 88/100. 96/100.**

**How it works mechanically:** After completing Campaign Mission 10, the player unlocks Advanced Campaign. Each of the 10 missions now has a "Robustness Challenge" mode: the same map, the same victory condition, but 100 scenario variants with meaningfully different enemy compositions, spawn timings, patrol routes, resource distributions, and counter-intelligence tactics. The variants are not random noise — they are a curated stress test. Variant 1 might be a standard enemy composition. Variant 47 might flood noise on the recon-net channel. Variant 82 might use a two-front pincer. Variant 99 might deploy a specialist that hacks your relay at tick 15.

The player submits their architecture once. The game runs all 100 variants automatically — a rapid-fire montage of 100 battles, each compressed to 3-5 seconds of visual summary (board state at tick 0, critical moment, final state). The robustness percentage appears as the results accumulate: a filling progress bar, each segment green (pass) or red (fail), left to right.

**What it teaches:** Architecture generality. An architecture that passes one scenario might be hyper-specialized — it works because it exploits a specific enemy patrol pattern that happened to appear. Robustness % forces the player to build architectures that handle variation. The shift from "does it work?" to "does it work against everything?" is the conceptual leap from debugging to engineering. It is the difference between a script that runs on your machine and a script that runs in production.

**The key design tension:** Robustness % can always be improved. 73% is not a failure — it is a score with room to grow. This creates a fundamentally different relationship with the metric. Pass rate is binary satisfaction: you solved it or you did not. Robustness % is asymptotic striving: you can always close one more gap, patch one more failure mode, handle one more edge case. The player who goes from 73% to 88% has done meaningful architectural work. The player who goes from 96% to 100% has done heroic architectural work. Both feel progression, but the texture of the work is different at different points on the curve.

**Where it lives in the UI:** The Advanced Campaign overview replaces the simple green/grey mission squares with horizontal bars. Each bar is 100 segments wide, green and red, showing the stress spectrum for that mission (see 8.07, Model C). The primary number is the percentage, displayed in the same large numerals as the Campaign fraction but now with a percent sign: **88%**. Below it, a second line in smaller text shows the raw count: "88 of 100 scenarios passed." The archipelago map gains a new visual layer: instead of binary cyan-glow, each province shows a radial fill — 88% of the province outline glows cyan, with the remaining 12% dim. A province at 100% blazes with full circuit-glow and a subtle particle effect, like data packets streaming along its cables.

### Act III: Gauntlet — eEDT (Effective Career EDT)

**What it measures:** How contested are your matches? The 30-match rolling average of EDT (Effective Determination Tick) — the normalized ratio of the tick where the match outcome was effectively decided to the total match length. eEDT ranges from 0.00 (outcome decided immediately — stomp or collapse) to 1.00 (outcome decided on the final tick — maximally contested).

**How it works mechanically:** Every Gauntlet match produces an EDT. The EDT is computed after the match: the engine identifies the tick at which the winning side's advantage became irreversible (the "determination tick"), then divides by total match length. A match where one side lost a relay at tick 8 and never recovered in a 60-tick match has EDT = 0.13. A match where lead changed three times and the decisive signal chain fired at tick 52 of 60 has EDT = 0.87.

The 30-match rolling average smooths noise. A single stomp (EDT 0.05) or a single nail-biter (EDT 0.91) does not define the player. The rolling average — the eEDT — captures the player's architectural tendency: do they build openers that resolve fast, or midgame systems that create prolonged contests?

**What it teaches:** Architectural depth. A high eEDT means the player's architecture has answers for more situations, recovers from setbacks, adapts through the match. It does not mean they win more — a player with 50% win rate and 0.55 eEDT is playing fairer, deeper games than a player with 70% win rate and 0.15 eEDT. The shift from "does it survive stress tests?" to "does it create genuine contests against human opponents?" is the conceptual leap from engineering to mastery. It is the difference between a system that passes tests and a system that thrives in the wild.

**Where it lives in the UI:** The Gauntlet career dashboard shows three numbers in a horizontal row (as described in 4.25): WIN RATE (30), eEDT (30), GAUNTLET RANK. The eEDT is the center number — literally and figuratively the heart of the display. Below it, the spark-line graph shows 90 matches of EDT history with the 30-match rolling average overlaid. The gradient shifts red (< 0.25) through amber (0.25-0.40) through green (0.40-0.60) through deep violet (0.60+, rare "midgame master" territory). The profile card shows eEDT as the featured stat, more prominent than win rate.

---

## The Transition Moments: "The Reveal Ceremonies"

Each metric transition is a designed moment — a ceremony where a new number appears for the first time and the player's relationship with "what good means" permanently shifts.

### Transition 1: Campaign Complete, Robustness % Appears — "The Stress Test Boot Sequence"

**When it happens:** The player has just completed Campaign Mission 10. The victory screen plays. The archipelago map is fully cyan — all 10 provinces glowing. The 10/10 fraction is displayed. A moment of satisfaction.

Then the screen dims. Not dark — just 20% dimmer, as if the system is thinking. The boot log appears.

**The boot log ceremony:**

```
> CAMPAIGN PROTOCOL COMPLETE .............. [OK]
> PRIMARY OBJECTIVE ACHIEVED .............. [10/10 MISSIONS]
> ARCHITECTURE STATUS ..................... [FUNCTIONAL]
>
> INITIATING ADVANCED DIAGNOSTICS .........
> WARNING: Architecture validated against CONTROLLED scenarios only
> Real-world deployment requires ROBUSTNESS CERTIFICATION
>
> Loading scenario generator ...............
> Generating 100 variants per mission ..... [1000 TOTAL]
>
> NEW METRIC ONLINE: ROBUSTNESS %
> Definition: Architecture survival rate across scenario variants
> Current value: UNCALIBRATED
>
> ADVANCED CAMPAIGN UNLOCKED
```

Each line types out at boot-log speed — fast enough to read, slow enough to feel procedural. The line `NEW METRIC ONLINE: ROBUSTNESS %` renders in a different color: amber, not the usual teal. It pulses once — a heartbeat — then settles. The word "UNCALIBRATED" blinks three times and fades.

**What happens to pass rate:** Pass rate does not disappear. The 10/10 fraction remains visible on the campaign overview, now smaller — tucked into the upper-left corner of the Advanced Campaign screen. It becomes a badge, a credential: "Campaign: 10/10." It is no longer the primary number. The primary number is now the robustness percentage, which reads "---" until the player runs their first stress test. Pass rate becomes historical — a thing you achieved — while robustness % becomes aspirational — a thing you are pursuing.

**The old metric as trophy, the new metric as challenge:** This is the critical design principle. The old metric does not vanish. It becomes a trophy on the shelf — visible, respected, no longer the focus. The new metric arrives empty, demanding to be filled. The player's relationship with numbers shifts: from "I have achieved 10/10" to "I am pursuing 88%."

### Transition 2: Advanced Campaign Mastered, eEDT Appears — "The Adversarial Awakening"

**When it happens:** The player has achieved a threshold robustness % across Advanced Campaign missions (design decision: minimum 80% average across all 10 missions, or 100% on any 5 missions). The Gauntlet unlock screen triggers.

**The boot log ceremony:**

```
> ROBUSTNESS CERTIFICATION ................ [PASSED]
> Average robustness: 91% across 10 missions
> Architecture handles procedural variation
>
> WARNING: All scenarios are AUTHORED
> No authored test suite covers adversarial creativity
> Human opponents will find what 100 scenarios missed
>
> INITIATING GAUNTLET PROTOCOL ............
> Connecting to adversarial matchmaking ....
>
> NEW METRIC ONLINE: eEDT
> Definition: 30-match rolling contest quality
> Measures: How deeply into the match outcomes are decided
> Current value: UNCALIBRATED (requires 10 Gauntlet matches)
>
> NOTE: Win rate will be tracked. eEDT will be featured.
> A 50% win rate with high eEDT means your architecture
> creates genuine contests. That is the goal.
>
> GAUNTLET UNLOCKED
```

The line `A 50% win rate with high eEDT means your architecture creates genuine contests` is the most important line in the entire game. It redefines what "winning" means. The player has spent 10+ hours optimizing for binary pass/fail, then optimizing for percentage coverage. Now the game tells them: the deepest metric is not about winning at all. It is about the quality of the contest.

**What happens to robustness %:** Robustness % joins pass rate in the trophy case. The career dashboard now shows three tiers:

```
CAMPAIGN         ADVANCED CAMPAIGN         GAUNTLET
  10/10               91%                  eEDT: ---
                                           Win: ---
                                           Rank: ---
```

The three tiers read left to right as a progression narrative: "I learned to build systems that work, then systems that handle anything, and now I am learning to build systems that create real contests."

**The sensory experience of the eEDT reveal:** When the boot log line `NEW METRIC ONLINE: eEDT` appears, the Gauntlet career panel fades in behind the boot log text — visible through the semi-transparent terminal overlay. The eEDT spark-line is empty: a flat grey line with no data points. It looks like a heart monitor with no heartbeat. The first Gauntlet match will produce the first data point — a single dot on the line. The player watches the line come alive over 10 matches, each dot extending the graph, the rolling average beginning to form. By match 30, the curve has shape. It is alive.

---

## Player Journeys

#### Journey: Mei, 19, Computer Science student with no strategy game experience

**Context:** Mei has just completed Campaign Mission 10. She has been playing for about 6 hours across three sessions. Her architecture for Mission 10 used two scouts, a relay, and three strikers with a command agent — a standard factory configuration she iterated on for about 40 minutes. She won on her third execution attempt.

**Minute 0:00 — The Victory Glow**
The Mission 10 victory screen shows the Taal volcano battlefield in its cleared state — all enemy units eliminated, her factory still standing. The tick clock reads T47. The two-act debrief completed moments ago. The campaign map fades in. All 10 provinces glow cyan. The fraction reads **10/10** in large white numerals at the top of the screen. Mei exhales. She screenshots the map and sends it to her group chat.

**Minute 0:15 — The Dim**
The screen dims by 20%. Mei's mouse cursor changes from the standard arrow to a loading indicator — a small rotating gear icon. The boot log terminal slides up from the bottom of the screen, overlaying the campaign map. Green monospace text begins typing:

```
> CAMPAIGN PROTOCOL COMPLETE .............. [OK]
```

Mei has seen boot logs before every mission — she reads them carefully, having learned that they contain mechanical hints. She leans forward.

**Minute 0:30 — The New Word**
The line `NEW METRIC ONLINE: ROBUSTNESS %` appears in amber. Mei reads it twice. She has not heard the word "robustness" in this game before. The boot log continues: `Definition: Architecture survival rate across scenario variants.` She thinks: "So my architecture worked on Mission 10... but would it work if the enemies were different?"

The word "UNCALIBRATED" blinks and fades. The boot log closes. The Advanced Campaign screen appears: the same archipelago, but now each province shows a horizontal bar instead of a simple glow. The bars are empty — grey dashes. The primary number reads **---** where 10/10 used to be.

**Minute 0:45 — The First Stress Test**
Mei clicks Ifugao (Mission 1). A new button appears where "EXECUTE" used to be: "RUN STRESS TEST (100 variants)." She clicks it. The screen splits: the board on the left shows a rapid-fire montage of battles. Each variant plays in 3-4 seconds — board appears, units move in fast-forward, outcome flashes green or red. A progress bar at the top fills segment by segment. Green. Green. Green. Red. Green. Green. Red. Red. Green.

Mei watches the failures with alarm. Her Mission 1 architecture — the simplest one, just a scout and a striker — fails when the enemy spawns from the south instead of the east. It fails when two enemies arrive simultaneously. It fails when a noise-flooding variant jams her scout's context window.

The progress bar completes. The number appears: **78/100 — 78%**. The Ifugao province on the map fills 78% cyan. The remaining 22% stays dim.

**Minute 1:30 — The Reframe**
Mei stares at 78%. She passed Mission 1 in Campaign — she got the green checkmark. But her architecture only survives 78 of 100 possible scenarios. The 22 failures are not bugs — they are blind spots. Her architecture assumed enemies would come from one direction. It assumed the context window would not be jammed. It assumed only one enemy at a time.

She opens her workbench and begins rebuilding her Mission 1 architecture. For the first time, she is not asking "will it work?" She is asking "what will break it?"

**UI Annotations:**
- **Stress test progress bar:** 100 segments, 3px wide each, filling left-to-right. Green (#00e676) for pass, red (#ff1744) for fail. Total width: 300px. Positioned at top of screen, below tick clock area.
- **Robustness percentage:** DM Sans Bold, 48px, centered below province name. Amber text (#ffc107) until above 90%, then shifts to teal (#00bcd4), then cyan (#00e5ff) at 100%.
- **Province radial fill:** The province outline on the archipelago map fills proportionally. At 78%, roughly three-quarters of the outline glows. The unfilled portion is not invisible — it is a dim amber outline, visible, marking the gap.

---

#### Journey: Dante, 28, Ex-StarCraft II Diamond player, Factorio veteran

**Context:** Dante has blazed through Campaign in one long session (4 hours) and spent two weeks in Advanced Campaign. His average robustness across all 10 missions is 93%. He has been grinding Mission 8 from 89% to 94% for three days, rebuilding his relay mesh to handle the double-pincer variant cluster (variants 71-85). He just hit the Gauntlet unlock threshold.

**Minute 0:00 — The Threshold**
Dante's Mission 8 stress test completes. The bar fills: 94/100. His average robustness ticks from 92% to 93%. A notification sound — a rising three-note sequence, each note a half-step higher than the last — plays. The boot log slides up without being summoned:

```
> ROBUSTNESS CERTIFICATION ................ [PASSED]
> Average robustness: 93% across 10 missions
```

Dante grins. He has been chasing this unlock since he heard about the Gauntlet from a forum post.

**Minute 0:20 — The Warning**
The boot log continues:

```
> WARNING: All scenarios are AUTHORED
> No authored test suite covers adversarial creativity
> Human opponents will find what 100 scenarios missed
```

Dante's grin fades slightly. He played StarCraft II at Diamond level — he knows exactly what this means. Authored scenarios are like playing against the AI on Hard. Human opponents are a fundamentally different challenge. His 93% robustness was earned against a test suite. A human will read his architecture's tendencies and exploit them.

**Minute 0:40 — The New Number**
The line `NEW METRIC ONLINE: eEDT` types out. Dante reads the definition. He pauses at: `A 50% win rate with high eEDT means your architecture creates genuine contests. That is the goal.`

He recognizes this immediately. In StarCraft, his ladder rating told him who he could beat. But the games he remembered — the games he saved replays of, the games he posted on forums — were the ones that went to 25 minutes with three base trades. The close ones. eEDT is measuring what he always valued but never had a number for.

The Gauntlet career panel fades in. Three numbers in a row:

```
WIN RATE (30)   eEDT (30)   GAUNTLET RANK
    ---           ---           ---
```

The eEDT spark-line is a flat grey line. Empty. Waiting.

**Minute 1:00 — First Blood**
Dante queues his first Gauntlet match. The matchmaking spinner rotates for 8 seconds. An opponent is found. The plan screen appears — but now there is a difference. In the upper-right corner, where the mission briefing used to be, a small panel shows:

```
OPPONENT: [anonymous handle]
Rank: Unranked (placement)
```

No eEDT shown for the opponent — that is private. Dante submits his 93%-robustness architecture unchanged. He hits EXECUTE.

The sealed watch plays. His scout-relay-striker chain activates cleanly. But at tick 14, something he has never seen in 100 authored scenarios: the opponent's scout tags his relay — not to attack it, but to mark its position. At tick 16, a specialist appears on the flank and fires a hack at the relay, corrupting its compression skill. His entire signal chain goes dark for 3 ticks. His strikers, receiving no intelligence, default to their patrol rules and walk into an ambush.

He loses at tick 31 of 60. EDT: 0.52.

The Inspector reveals the relay hack — something no authored scenario ever deployed at that timing, with that precision, targeting that specific unit. A human read his architecture and found the linchpin.

**Minute 3:00 — The Learning**
After 10 matches (4 wins, 6 losses), Dante's eEDT reads 0.38. His spark-line has 10 data points — a jagged line that has not yet found a shape. The number is shown in amber (below 0.40). His win rate is 40% — far below his expectations. But the eEDT is more interesting to him. His losses are not stomps. They are mid-game collapses at tick 25-40, where his relay mesh gets targeted. His wins are early dominations where his relay mesh survives the opening. He realizes: his architecture has no midgame recovery. When the relay goes down, everything goes down. He is building exactly what the robustness % could not test — resilience against creative adversarial targeting.

He opens the workbench and begins designing a command agent whose REROUTE skill activates when relay heartbeat signals stop arriving. For the first time, he is not building against a test suite. He is building against imagination.

**UI Annotations:**
- **Gauntlet career panel:** Three columns, centered horizontally. Win rate on left (grey until 10 matches), eEDT center (amber/green/violet gradient), rank on right. DM Sans Bold, 36px for numbers, 12px for labels. Panel background: dark navy (#1a1a2e) with subtle grid lines at 5% opacity.
- **Spark-line:** 200px wide, 40px tall. Grey baseline. Data points as 3px circles. Rolling average as 2px smooth curve, color-coded by value. First 10 points show individual dots connected by thin lines. At 30 points, the rolling average curve appears and the individual dots fade to 30% opacity.
- **Placement matches indicator:** Below the three numbers, a row of 10 small diamonds. Filled green (win) or red (loss) as matches complete. After 10 matches: "PLACEMENT COMPLETE" in small caps, the diamonds fade, and the rank number appears.

---

#### Journey: Reina, 34, Game designer, 200+ Gauntlet matches, content creator

**Context:** Reina has been playing Robot Uprising for two months. She completed Campaign in one session, Advanced Campaign in a week, and has been in the Gauntlet for six weeks. She streams her matches weekly and posts architectural breakdowns on her blog. Her current stats: Win rate 54%, eEDT 0.51, Rank #245. She is reviewing her full career dashboard before a stream.

**Minute 0:00 — The Three Numbers, Together**
Reina opens her career profile. The full dashboard is visible — three tiers, left to right:

```
CAMPAIGN         ADVANCED CAMPAIGN         GAUNTLET
  10/10               97%                  eEDT: 0.51
                                           Win: 54%
                                           Rank: #245
```

She reads the three numbers as a narrative: "I learned to build architectures that work. Then I learned to build architectures that survive anything. Now I am learning to build architectures that create genuine contests against people who are trying to destroy me."

The 10/10 is tiny — 14px, grey text, upper-left. It is ancient history. The 97% is medium — 24px, teal, left-center. She is proud of it but does not think about it daily. The eEDT is dominant — 36px, green (0.51 is solidly in the "contested" range), center-screen. Below it, the 90-match spark-line tells a story.

**Minute 0:30 — Reading the Spark-Line**
Reina hovers over the spark-line. The tooltip shows individual match EDT values. She reads her own history:

- Matches 1-15: eEDT ~0.22. Red zone. Her robustness-optimized architecture was being exploited by opponents who found specific weak points. Matches resolved fast — either she stomped opponents who had not yet learned counter-play, or she got dismantled by opponents who had.
- Matches 15-40: eEDT climbing from 0.22 to 0.38. Amber zone. She redesigned her relay architecture three times. Each redesign added more failover logic, more recovery paths. Matches started lasting longer. She was losing slower — and winning slower.
- Matches 40-60: eEDT plateauing at 0.38-0.42. The amber-green boundary. She hit a wall. Her architectures were creating mid-game contests but could not close them. She was the "fun opponent who never wins."
- Matches 60-90: eEDT breaking through to 0.45, then 0.48, then 0.51. Green zone. She discovered the command-agent mid-game pivot — a command agent that reads the eEDT-proxy signal (her own architecture's health) and switches from defensive relay-protection to offensive striker-coordination at the right moment. Her win rate climbed from 45% to 54% during this period.
- One gold dot at match 73. The career "growth event" marker (4.31). The inflection point where her rolling eEDT crossed 0.45 and never came back. The tooltip reads: "Architectural shift detected: midgame pivot strategy adopted."

**Minute 1:00 — The Stream Setup**
Reina screenshots the spark-line and pastes it into her stream overlay. She labels the four phases: "Stomp Phase," "Learning Phase," "Plateau," "Breakthrough." Her chat will see the graph as she plays — a live career narrative overlaid on the match. She knows her audience cares about the eEDT more than the win rate. A close loss (EDT 0.78) generates more chat engagement than a fast win (EDT 0.09). The number has become content.

She queues a Gauntlet match. As the sealed watch plays, her chat watches the context bars on her units, calling out when the relay is under pressure. At tick 38, her command agent fires the pivot signal — switching from defense to offense. Chat explodes: "THE PIVOT." She wins at tick 54. EDT: 0.72. Her spark-line gains a new point — high and green. The rolling eEDT ticks from 0.51 to 0.52.

**Minute 2:30 — The Career Reflection**
Between matches, Reina pulls up her full career dashboard for a blog post. She writes: "The three numbers are three different questions. Campaign asks: can you build something that works? Advanced Campaign asks: can you build something that works against everything? Gauntlet asks: can you build something that works against everyone — not by winning, but by making the contest matter?"

She notes that the three metrics have different emotional textures:
- **Pass rate** felt like homework. Satisfying to complete, no desire to revisit.
- **Robustness %** felt like engineering. The grind from 73% to 97% was deeply technical and deeply satisfying. She still revisits Advanced Campaign to experiment.
- **eEDT** feels like art. There is no "done." The number moves with every match. It reflects not just her skill but her philosophy — what kind of games she wants to create.

**UI Annotations:**
- **Career dashboard layout:** Full-width panel, three tiers left to right. Campaign tier: 120px wide, grey border, contains 10/10 and mission squares. Advanced Campaign tier: 200px wide, teal border, contains 97% and 10 stress spectrum bars (miniaturized, 100px each). Gauntlet tier: 280px wide, green border, contains eEDT, win rate, rank, and the 90-match spark-line.
- **Growth event gold dot:** 5px circle, gold (#ffd700), subtle glow animation (pulsing at 0.5Hz). Tooltip on hover shows the date, the eEDT value at that moment, and the detected architectural shift label.
- **Spark-line color gradient:** Rendered as a smooth curve with color determined by the Y-value at each point. Red below 0.25, amber 0.25-0.40, green 0.40-0.60, violet above 0.60. The curve itself is 2px wide, anti-aliased, with a 10% opacity fill below it matching the gradient.

---

## Strengths and Weaknesses

### Strengths

**"The Ladder of Abstraction"** — The three metrics form a clean conceptual ladder. Pass rate measures correctness. Robustness % measures generality. eEDT measures depth. Each is strictly more abstract than the last. A player who has internalized all three has learned not just game mechanics but a transferable engineering philosophy: first make it work, then make it work everywhere, then make it work beautifully. This maps directly to the software engineering maxim "make it work, make it right, make it fast" — but with "fast" replaced by "deep," which is more interesting.

**"The Emotional Ramp"** — Each metric has a different emotional character. Pass rate is binary relief. Robustness % is asymptotic striving. eEDT is aesthetic satisfaction. The progression from relief to striving to aesthetics mirrors mastery itself — beginners want to succeed, intermediates want to improve, experts want to create beauty. The metric progression tracks this emotional arc naturally.

**"The Anti-Elo Move"** — By making eEDT the featured Gauntlet metric instead of win rate or rank, the game makes a radical statement: the quality of your contests matters more than whether you win them. This is not how competitive games typically work. Most games foreground win rate or Elo. Robot Uprising foregrounds something more like "are you playing interesting games?" This is unusual, memorable, and strongly aligned with the game's identity as a teaching tool for agentic engineering. In real engineering, the quality of your system's behavior matters more than whether it "wins" any specific benchmark.

**"The Trophy Case Effect"** — Old metrics do not disappear. They become trophies. The player accumulates a row of numbers that tell their story. This creates a sense of permanent progression — even when eEDT fluctuates, the 10/10 and 97% are fixed achievements that cannot be lost. The career dashboard reads as a narrative, not a report card.

### Weaknesses

**"The Robustness % Grind Problem"** — 100 scenarios per mission, 10 missions, means 1,000 total scenario runs to fully calibrate Advanced Campaign. Each run takes 3-5 seconds visually, but the player may want to watch specific failures in detail via the Inspector. A full Advanced Campaign calibration session could take 2-3 hours of passive watching. Risk: the stress test montage becomes tedious. Mitigation: allow the player to filter to "failures only" replay mode after the first calibration, and show the stress spectrum bar as a live progress indicator so the player can look away during passing variants.

**"The eEDT Perverse Incentive"** — A player who wants to maximize eEDT could build architectures that are deliberately slow — not because they create genuine contests, but because they drag out matches. An architecture with a relay that buffers signals for 10 ticks before forwarding would inflate EDT without creating real tactical depth. Mitigation: eEDT is the featured metric but rank still exists and is based on win rate with Elo adjustments. A player who loses 70% of long matches will have high eEDT but a terrible rank. The two metrics together prevent gaming either one. Additionally, EDT is based on the determination tick — the moment the outcome becomes inevitable — not the match length. An architecture that delays but does not genuinely contest the outcome will still have low EDT because the determination tick occurs early even if the match runs long.

**"The Transition Pacing Risk"** — If a player completes Campaign quickly (a Factorio veteran might finish in 3 hours), the robustness % reveal at Campaign completion might feel premature — they have not yet internalized the "correctness" lesson enough for the "generality" lesson to land. Conversely, if a player takes 20 hours on Campaign, they may have already intuited robustness from repeated failed executions and the new metric feels anticlimactic. The reveal is tied to progression, not readiness. Mitigation: the boot log text adapts slightly based on play history — a player who passed most missions on their first try gets a more emphatic "your architecture may be FRAGILE" warning, while a player who iterated heavily gets a more celebratory "you already know what failure looks like — now quantify it" framing.

**"The eEDT Cold Start"** — eEDT requires 10 matches to display and 30 to stabilize. During the first 10 Gauntlet matches, the metric reads "---" — a void. The player has just been told this is the most important number in the game, and they cannot see it yet. This is deliberate tension (the empty spark-line as "a heart monitor with no heartbeat" is evocative), but it could frustrate impatient players. Mitigation: during placement matches, show the individual EDT per match as a temporary substitute — "Last match EDT: 0.52" — so the player has something to track while the rolling average bootstraps.

---

## Interaction Effects

### Career Stats Dashboard
The three-act metric mapping IS the career stats dashboard's primary architecture. The dashboard is organized as a three-tier left-to-right progression (Campaign, Advanced Campaign, Gauntlet), with each tier showing its primary metric prominently and its secondary metrics (individual mission results, failure modes, win rate) as subordinate displays. The dashboard reads as a story: "Here is who I was, here is who I became, here is who I am." Every other career stat (FPG trajectory, diagnostic accuracy, config version history) nests under one of the three tiers.

### The Autonomy Dial
The autonomy dial controls how much the player delegates to their agents versus micromanaging their configurations. In Campaign (pass rate), the autonomy dial is at its lowest — the player is still learning what each primitive does and configures everything manually. In Advanced Campaign (robustness %), the player begins to trust their agents more — the stress test rewards architectures that handle variation autonomously, not architectures that are hand-tuned for one scenario. In Gauntlet (eEDT), full autonomy is the only viable strategy — human opponents are too creative for hand-tuned solutions. The metric progression maps to the autonomy progression: pass rate rewards correct configuration, robustness % rewards general configuration, eEDT rewards autonomous adaptation.

### Difficulty Scaling
The three metrics define difficulty differently in each act. Campaign difficulty is binary: can you pass or not? Advanced Campaign difficulty is granular: 100 scenarios form a difficulty gradient, and the player's robustness % shows where they are on that gradient. Gauntlet difficulty is emergent: the matchmaking system pairs players by rank, but eEDT reveals whether the difficulty is creating genuine contests or just one-sided outcomes. A player whose eEDT is consistently low despite good rank is being poorly matchmade — their matches resolve too quickly in either direction.

### Community and Streaming
**Which metric do viewers care about?** eEDT. Unambiguously. A high-eEDT match is a close match, and close matches are dramatic. A streamer's spark-line trending upward is a narrative — the audience watches a player grow in real-time. The stress test montage (100 variants in ~5 minutes) is also strong stream content — viewers react to each red segment, call out failure modes, suggest architectural fixes. Pass rate is too binary for stream engagement. Robustness % is a good secondary — "can we get to 95% on Mission 8?" is a valid stream goal. But eEDT is the metric that produces the "clip-worthy moment" — a match with EDT 0.91 where the determination tick was 3 ticks from the end.

The TikTok clip: A split-screen of the spark-line in the corner and the sealed watch board in the center. The spark-line's rolling average crosses from amber to green. The streamer reacts. "WE'RE GREEN." Fifteen seconds, immediately communicable — a number went up, the player is happy, and the viewer understands that this number means "my games are getting more intense."

### The Blueprint Codex
The Codex is the persistent reference for all game mechanics. The three metrics should each have a Codex entry that unlocks at the moment the metric is first revealed. The Pass Rate entry unlocks at Mission 1 (it is the default metric). The Robustness % entry unlocks at Campaign completion — the boot log ceremony triggers the Codex card to appear with a "NEW" badge. The eEDT entry unlocks at Gauntlet access. Each Codex entry explains the metric's formula, shows example values, and includes a "what this means for your architecture" section. The Codex entries grow retroactively — when the player reaches Advanced Campaign, the Pass Rate codex entry gains a new paragraph: "Pass rate measures correctness against a single scenario. For generality across scenarios, see: Robustness %."

---

## Comparable Games

### Diablo 3: Paragon Levels — "The Number After the Number"
Diablo 3's level cap is 70. After reaching 70, the player begins earning Paragon levels — an infinite progression system with diminishing-but-never-zero stat returns. The moment the player hits level 70 and sees "Paragon Level 1" for the first time is a reveal ceremony: the old number (70) becomes a fixed credential, and the new number (Paragon 1) becomes the active pursuit. Robot Uprising's metric transitions mirror this structure — 10/10 becomes a credential, robustness % becomes the active pursuit. The key difference: Diablo's Paragon is more-of-the-same (more stats), while Robot Uprising's transitions change WHAT is being measured (correctness to generality to depth). Diablo's transition is quantitative; Robot Uprising's is qualitative.

### Path of Exile: Atlas Progression — "The Map After the Map"
Path of Exile's campaign ends at Act 10. Then the Atlas of Worlds opens — a meta-map of maps, where the player's progression is measured by atlas completion percentage and maven invitations. The transition from "beat the campaign" to "fill the atlas" is a metric shift: from linear progression to radial completion. Like Robot Uprising's transition from pass rate to robustness %, the player goes from "can I get through this?" to "how much of the space can I cover?" Path of Exile's atlas also has a stress-test quality — higher-tier maps with more modifiers are the equivalent of harder scenario variants. A player's atlas completion % IS their robustness %.

### Chess Elo: The Hidden Number Made Visible
New chess players on Chess.com play provisional games before their rating stabilizes. The rating is visible from game 1 but marked "provisional" — it fluctuates wildly, settling over ~30 games. This mirrors eEDT's cold start: visible from match 1 as individual EDT values, but the rolling average only stabilizes at 30. Chess.com's Accuracy metric (introduced years after Elo) is also relevant: it measures how close the player's moves are to the engine's best moves, independent of whether they won. Accuracy trends upward even during losing streaks, giving players a "growth signal" when win rate is flat. eEDT serves exactly this function — a growth signal orthogonal to wins.

### Overwatch Competitive: SR to Role Queue to Open Queue — "Metric Fragmentation"
Overwatch's competitive system has undergone multiple metric transitions: a single SR (skill rating) was replaced by separate role-based SRs, then a new "competitive points" system, then role queue SRs and open queue SR existing simultaneously. Each transition confused the player base. What is MY number? Do I have three numbers now? Which one is "real"? This is the cautionary tale. Robot Uprising avoids this by making the transitions sequential and additive (not replacement). The player always has one primary number. Old numbers become trophies. There is never ambiguity about which number matters NOW.

### Slay the Spire: Ascension Levels — "Difficulty as Metric"
Slay the Spire's Ascension system adds difficulty modifiers incrementally. Ascension Level IS the metric — "I'm on Ascension 15" communicates skill more than win rate does. This is closest to Robot Uprising's robustness % concept: the number communicates not "did you win?" but "how hard was the version you won?" The difference is that Slay the Spire's Ascension is linear (1 through 20), while robustness % is multidimensional (100 scenarios with different failure modes). A player at 88% robustness and a player at 88% robustness might have completely different failure profiles — the number is the same but the meaning diverges.

---

## Sensory Description: The Ceremonies in Full

### Ceremony 1: Robustness % Awakens — "The Stress Test Overture"

The screen dims. Not a dramatic blackout — a 20% reduction in brightness, like cloud shadow crossing the sun. The boot log terminal rises from the bottom edge: a dark panel (#0d0d1a) with a 1px teal border (#00bcd4) and a subtle CRT scanline texture at 3% opacity. Text types at 40 characters per second — fast enough that the player does not lose patience, slow enough that each line feels deliberate.

The ambient music — the campaign's triumphant completion chord — fades to a low drone. A new sound enters: a slow, rhythmic pulse, like a server rack's cooling fan cycling up. The pulse is 72 BPM — resting heart rate. It will accelerate during the stress test.

When `NEW METRIC ONLINE: ROBUSTNESS %` appears, the text color shifts from teal to amber (#ffc107). The ambient pulse skips a beat — one moment of silence — then resumes at 80 BPM. The amber text pulses once in synchrony with the heartbeat. Then the boot log fades and the Advanced Campaign screen assembles itself: the archipelago map redrawing with the new horizontal bars, each bar emerging as a row of 100 tiny rectangles, grey, waiting.

The first time the player runs a stress test, the 100-variant montage plays with the heartbeat pulse accelerating: 80 BPM at variant 1, rising to 120 BPM at variant 50, peaking at 140 BPM at variant 100. Each green result adds a soft chime (pitched randomly within a major pentatonic scale). Each red result adds a low thud — not punishing, just present. The accumulated chimes and thuds create an aleatory musical texture — more green = more melodic, more red = more percussive. The final robustness percentage appears with a sustained chord: major if above 80%, minor if below.

### Ceremony 2: eEDT Awakens — "The Adversarial Handshake"

The Gauntlet unlock ceremony differs from the robustness reveal. Where the robustness reveal was meditative (slow heartbeat, gradual montage), the Gauntlet reveal is electric. When `ROBUSTNESS CERTIFICATION: PASSED` appears, the boot log text briefly corrupts — characters replaced by random symbols for 200ms, then snapping back. A glitch. Not a bug — a signal. The authored world is ending. The adversarial world is beginning.

The boot log line `Connecting to adversarial matchmaking....` is accompanied by a new sound: a distant, synthetic voice murmuring — not intelligible words, just the texture of another intelligence. The sound fades before the player can focus on it. It suggests presence. Someone else is out there.

When `NEW METRIC ONLINE: eEDT` appears, the text color is not amber — it is violet (#7c4dff). The violet is deliberate: it is the color of the deepest eEDT range (0.60+), signaling that this metric's ceiling is where the veterans live. The spark-line appears as a thin grey horizontal line — absolutely flat — with a single blinking cursor at the far right edge, like a text prompt. It says: start playing.

The first Gauntlet match's sealed watch has one difference from Campaign sealed watches: a second context bar appears in the upper-right corner of the screen, mirroring the one in the lower-left. This is the opponent's aggregate architecture health — not their individual unit states, but a single bar showing their side's overall signal chain integrity. Two bars. Two architectures. The contest is between systems, not units. This visual pairing — your bar and their bar, mirrored across the board — makes eEDT's meaning viscerally legible before the player ever sees the number. You can feel whether the match is contested by watching the two bars.

### Ceremony 3: The Career Dashboard — "The Three-Pillar Temple"

When all three metrics are active, the career dashboard renders as three vertical columns — pillars — each with its own color palette and visual density.

The left pillar (Campaign) is sparse: 10 small green squares on a dark background. Simple. Clean. Completed. The green is muted — #4caf50 at 60% opacity. This is history.

The center pillar (Advanced Campaign) is dense: 10 horizontal stress spectrum bars, each 100 segments wide, creating a complex mosaic of green and red. The teal accent color (#00bcd4) is more vivid than the Campaign green. This is the player's engineering resume — detailed, technical, revealing.

The right pillar (Gauntlet) is alive: the spark-line pulses with new data, the eEDT number updates after every match, the rank shifts. The violet-to-green gradient moves. This is the present tense.

Together, the three pillars create a visual narrative of increasing complexity and vitality: sparse-and-still, dense-and-fixed, alive-and-moving. The dashboard reads as a timeline — left is the past, center is the foundation, right is now. A player looking at their career dashboard sees not three numbers but three chapters of a story they are still writing.
