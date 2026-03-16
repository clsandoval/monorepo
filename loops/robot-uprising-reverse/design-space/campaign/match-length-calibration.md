# 5.23 — Campaign Match Length Calibration

**The Tick Budget Problem:** How long should each battle last, measured in ticks? Short matches (30-50 ticks) favor rapid iteration and learning. Long matches (80-150 ticks) favor emergent complexity, dramatic reversals, and deep system expression. The campaign-to-Gauntlet transition is a deliberate gear shift — the game literally gets longer as the player gets better. This file explores every dimension of that calibration.

---

## The Core Tension: Learning Speed vs. System Expression

Robot Uprising's four primitives (skills, rules, hooks, context config) need *time* to express themselves. A scout patrol takes 3-4 ticks to complete a route. A hook chain (scout→relay→striker) takes 4 ticks minimum due to signal latency. A command agent's reassign skill needs multiple observation cycles before the data that triggers it even arrives. Context windows fill gradually — a 6-slot scout buffer might take 8-12 ticks to reach interesting eviction decisions.

But learning requires *iteration*. A player who waits 150 ticks to see whether their hook wiring works, loses, and must wait another 150 ticks to test a fix — that player quits. The sealed watch's "no skip, no pause" rule means every tick is a real second of wall-clock time. A 150-tick match at 1x speed = 2.5 minutes of mandatory viewing. At 0.5x, that's 5 minutes. Multiply by 3-5 retries per mission, and the iteration loop balloons.

**The speed controls don't solve this.** 2x speed compresses wall-clock time but also compresses *readability*. Signal chains flash by. Context bars fill too fast to track. The sealed watch's educational value degrades at higher speeds because the player can't absorb what's happening. Speed controls are a band-aid for length, not a replacement for calibration.

---

## Comparable Game Match Lengths

### Into the Breach: The 5-Turn Gold Standard
Each battle is exactly **4-5 turns**. At roughly 30-60 seconds per turn of player deliberation (plus animation), battles last **2-4 minutes**. This is the tightest match length in the genre. Key insight: Into the Breach's battles are *puzzles*, not *systems*. There's no emergent behavior to wait for — the entire state is visible from turn 1. Robot Uprising's systems need time to *unfold*, which fundamentally requires more ticks than ItB's turns.

### Slay the Spire: The 15-Floor Act
Each act has 17 floors, with individual combat encounters lasting 3-15 minutes depending on complexity. Early Hallway fights: 2-3 minutes. Late Elite fights: 5-8 minutes. Boss fights: 8-15 minutes. The *progression within a run* is key — encounters get longer as you go deeper. This maps directly to Robot Uprising's campaign-to-Gauntlet arc.

### FTL: The 5-Minute Encounter
Individual ship battles in FTL last 1-5 minutes in real-time (pausable). The 8-sector run totals 30-45 minutes. Each sector's encounters get harder but not significantly longer — difficulty scales through enemy capability, not encounter duration.

### Zachtronics: The Uncapped Solve
TIS-100 and Shenzhen I/O puzzles average 40-90 minutes of *design time*, but the execution (running the solution) takes seconds. Robot Uprising's sealed watch occupies the execution timeslot — it must be long enough to be dramatic but short enough that failing doesn't feel like wasted time. Zachtronics never makes you watch your solution run for 2 minutes — execution is instant, and the histogram appears. The sealed watch deliberately rejects this, betting that *watching is the game*. This bet requires careful tick budget calibration.

### Factorio: The Unbounded Session
Factorio has no match length — sessions are player-determined. But the *feedback loop* operates on a ~30-second cycle: build → observe throughput → identify bottleneck → fix. Robot Uprising's plan→execute→debrief cycle is the equivalent, and the execute phase (sealed watch) is the one phase with a fixed, non-skippable duration. It's the only part of the loop the player can't speed through.

---

## Five Tick Budget Models

### Model A: "The Constant" — Fixed Tick Ceiling Across All Missions

Every mission runs exactly 60 ticks (1 minute at 1x). No variation.

**How it works:** The mission designer fits all objectives, enemy waves, and narrative beats into exactly 60 ticks. Early tutorial missions might feel leisurely (nothing much happens after tick 30). Late campaign missions feel compressed (everything happens at once).

**Strengths:**
- Maximum predictability. Players know exactly how long every sealed watch will be.
- Speed controls become precise time commitments: 0.5x = 2 min, 1x = 1 min, 2x = 30 sec.
- Streaming-friendly — content creators can promise "each attempt is exactly one minute."

**Weaknesses:**
- Tutorial missions feel padded. After the player's scout finds the enemy at tick 10 and the striker engages at tick 15, there are 45 dead ticks.
- Late missions feel rushed. A factory-vs-factory battle with command agents, production queues, and multi-relay architectures can't express itself in 60 ticks.
- No dramatic pacing variation. Every match has the same temporal shape.

**The TikTok clip:** Every clip is exactly 60 seconds. Consistent format, easy to produce. But the early missions' clips have 30 seconds of nothing.

---

### Model B: "The Escalator" — Tick Ceiling Increases Linearly Per Mission

| Mission | Tick Ceiling | Wall-Clock (1x) | Phase |
|---------|-------------|------------------|-------|
| M1 | 30 | 30s | Tutorial — context |
| M2 | 35 | 35s | Tutorial — rules |
| M3 | 40 | 40s | Tutorial — hooks |
| M4 | 50 | 50s | Tutorial — skills |
| M5 | 60 | 1:00 | Factory intro |
| M6 | 70 | 1:10 | Command intro |
| M7 | 80 | 1:20 | Deadlock/mid-campaign |
| M8 | 90 | 1:30 | Full system |
| M9 | 100 | 1:40 | Advanced |
| M10 | 120 | 2:00 | Final boss |
| Gauntlet | 80-150 | 1:20-2:30 | Competitive |

**How it works:** Each mission gives the player's architecture slightly more time to express itself. The designer calibrates enemy wave timing, reinforcement schedules, and victory conditions to use the full tick budget. The Gauntlet uses a variable ceiling based on ELO bracket or mutator selection.

**Strengths:**
- Tutorial matches are snappy. A 30-second sealed watch at M1 means the plan→execute→debrief loop takes under 2 minutes total. Players iterate 6-8 times per 15-minute session.
- Complexity earns time. As the player's architecture grows more sophisticated, the game gives it more room to breathe.
- The lengthening is *felt*. The player notices M7's sealed watch is longer than M3's. This signals "the game is getting more serious."
- The Gauntlet transition (M10: 120 ticks → Gauntlet: 80-150) is a deliberate moment. The game whispers: *this is no longer a lesson.*

**Weaknesses:**
- The linear ramp might not match the actual complexity ramp. M5 (factory introduction) is a massive cognitive leap but only gets 60 ticks — is that enough for a production queue to matter?
- Fixed ceilings per mission mean the designer must tune enemy arrival timing precisely. If the ceiling is 50 ticks but the player's architecture needs 55 to stabilize, they always lose.
- Retry fatigue at M9-M10. Five retries at 100 ticks (1:40 each) = 8+ minutes of sealed watching. With debrief, that's 15+ minutes per retry cycle.

**The TikTok clip:** M1 clips are 30-second micro-dramas. M10 clips are 2-minute epics. The variety is content-friendly, but longer clips lose casual viewers.

---

### Model C: "The Hourglass" — Short Tutorial, Short Endgame, Long Middle

| Mission | Tick Ceiling | Rationale |
|---------|-------------|-----------|
| M1-M2 | 30-35 | Tutorial: fast iteration |
| M3-M4 | 50-60 | Pre-factory: systems emerging |
| M5-M7 | 80-100 | Factory + command: maximum expression |
| M8-M9 | 60-70 | Advanced: efficiency required |
| M10 | 90 | Final: climactic but not bloated |
| Gauntlet | 80-150 | Variable |

**How it works:** Tick ceilings peak in the middle campaign (M5-M7) when the player has the most new systems to absorb, then *contract* in the advanced missions. M8-M9 force the player to build architectures that win *faster* — time pressure as a teaching mechanic.

**Strengths:**
- The contraction from M7 (100 ticks) to M8 (60 ticks) creates a "speed run" feel that teaches efficiency. The player's architecture must be *better*, not just *more*.
- Avoids late-campaign retry fatigue — M8-M9 are only 60-70 ticks per attempt.
- The M10 climax gets a generous 90 ticks, earning its length by contrast with the tight M8-M9.
- Teaches a transferable engineering lesson: "good architecture solves problems faster."

**Weaknesses:**
- The contraction at M8 can feel punishing. "I just learned all this complexity and now I have less time to use it?"
- The M5-M7 peak might be too long for the player's actual architecture complexity at that point. If M5 is the first factory mission, the player's production queue is simple — 80 ticks might feel like waiting.
- Non-monotonic difficulty curve. Players expect "later = harder = longer."

**The TikTok clip:** The M8 "speedrun" clip is electric — complex architecture executing a clean win in 60 ticks. "I built this in M7 with 100 ticks. Now watch it do it in 60."

---

### Model D: "The Dynamic Ceiling" — Victory/Defeat Conditions End the Match Early

No fixed tick ceiling. The match ends when:
1. All enemies eliminated, OR
2. Enemy base destroyed, OR
3. All player units eliminated, OR
4. Player base destroyed, OR
5. A hard maximum is reached (200 ticks)

**How it works:** The mission designer controls *pacing* through enemy wave timing, not tick ceilings. A well-designed architecture might win M3 in 25 ticks. A struggling player's M3 might drag to 80 ticks before their last unit falls. The sealed watch is exactly as long as the architecture needs to resolve.

**Strengths:**
- Natural match length. Clean victories are fast and satisfying. Drawn-out losses communicate "something is wrong" through duration itself.
- No wasted ticks. There's never a period where the board is resolved but the tick clock hasn't run out.
- Rewards good architecture with shorter watches. The iteration loop gets faster as the player improves.
- Creates dramatic late-match tension. If you're at tick 80 and neither side has won, the match is a genuine cliffhanger.

**Weaknesses:**
- Unpredictable sealed watch duration. A player can't budget their time ("I have 5 minutes, can I do one more attempt?").
- Extremely long losses. A poorly-designed architecture might create a 150-tick attritional stalemate that the player must sit through without skipping.
- Mission designers lose control of pacing. The emotional arc of the sealed watch depends on the player's architecture, not the designer's curation.
- The Inspector's timeline scrubber length varies wildly across attempts. Comparing runs requires time-normalization.

**Mitigation: The Mercy Clock.** If no combat has occurred for 20 consecutive ticks (stalemate), the match ends as a draw/loss. This prevents infinite loops without cutting off legitimate slow-burn strategies. The mercy clock is communicated by an amber border creeping in from the screen edges — subtle at first, then urgent, then the screen fades to the "systems inactive" message. Audio: low frequency pulse increasing in tempo. The mercy clock is NOT communicated before it triggers — it's a safety net, not a game mechanic.

**The TikTok clip:** "Watch my M7 go from 80-tick slog to 23-tick blitz after one hook change." The before/after is the content.

---

### Model E: "The Hybrid Budget" — Soft Floor + Hard Ceiling Per Mission

Each mission has two tick thresholds:

| | Soft Floor | Hard Ceiling | Purpose |
|-|------------|-------------|---------|
| M1 | 15 | 40 | Tutorial: if you win before 15, something is wrong |
| M5 | 30 | 80 | Factory: production queue needs 30+ ticks to matter |
| M10 | 50 | 130 | Final: climactic, but the hard ceiling prevents marathon |
| Gauntlet | 40 | 150 | Competitive: wide range for architectural variety |

**Soft floor:** Enemy waves are calibrated so that *no architecture, however perfect,* can win before the soft floor. This ensures every sealed watch has a minimum dramatic duration. If the floor is 30 ticks, the first enemy wave doesn't arrive until tick 8, and the main force doesn't engage until tick 20.

**Hard ceiling:** The match ends at this tick regardless of state. If neither side has won, the result depends on the mission objective (defender wins in defense missions; attacker wins in assault missions; draw otherwise).

**How it works:** Between the floor and ceiling, victory/defeat conditions resolve naturally (like Model D). The floor prevents trivially short matches; the ceiling prevents marathon failures.

**Strengths:**
- Best of both worlds. Natural match resolution within bounded time.
- Soft floors ensure every sealed watch has *something to watch*. No 5-tick stomps that feel like a loading screen.
- Hard ceilings prevent stalemates without a mercy clock.
- The floor/ceiling band is a level design tool. Wide bands (M10: 50-130) = high variability = high drama. Narrow bands (M1: 15-40) = controlled experience = focused learning.

**Weaknesses:**
- Two parameters to tune per mission instead of one. More design work.
- Hard ceiling losses feel arbitrary. "I was about to win at tick 131 but the timer ran out" is the worst feeling in gaming.
- Players might game the soft floor ("nothing matters before tick 30, I'll check my phone").

**Mitigation for ceiling losses:** The "Last Stand" mechanic. If the player's architecture would have won within 10 ticks of the ceiling, the Inspector shows a "PROJECTED VICTORY" overlay in the debrief timeline — a ghost timeline extending past the ceiling showing what *would* have happened. The player sees they were close. This converts ceiling-loss frustration into "I need 10 more ticks of efficiency" — a solvable problem. Emotionally, it's the difference between "the timer screwed me" and "I need to be faster."

**The TikTok clip:** The projected victory ghost timeline. "I was THIS close. One hook change. One."

---

## RECOMMENDED: Model E Hybrid Budget with Escalator Defaults

The recommended approach combines Model E's floor/ceiling structure with Model B's escalating defaults:

| Mission | Soft Floor | Hard Ceiling | Band Width | Wall-Clock Range (1x) |
|---------|------------|-------------|------------|----------------------|
| M1 | 12 | 35 | 23 | 0:12 – 0:35 |
| M2 | 15 | 40 | 25 | 0:15 – 0:40 |
| M3 | 18 | 45 | 27 | 0:18 – 0:45 |
| M4 | 20 | 55 | 35 | 0:20 – 0:55 |
| M5 | 30 | 70 | 40 | 0:30 – 1:10 |
| M6 | 35 | 80 | 45 | 0:35 – 1:20 |
| M7 | 35 | 85 | 50 | 0:35 – 1:25 |
| M8 | 30 | 75 | 45 | 0:30 – 1:15 |
| M9 | 35 | 90 | 55 | 0:35 – 1:30 |
| M10 | 45 | 120 | 75 | 0:45 – 2:00 |
| Gauntlet | 40 | 150 | 110 | 0:40 – 2:30 |

Note the M8 *contraction* from Model C — ceiling drops from 85 to 75, teaching efficiency. The band width generally widens across the campaign, reflecting growing architectural variety.

---

## How Mission Briefings Communicate Expected Match Length

The player must have *some* expectation of match duration before hitting EXECUTE. Five communication approaches:

### Approach 1: "The Tick Counter"
The mission briefing shows: **"Tick Budget: 70"** next to the EXECUTE button. Explicit, clinical, perfectly informative. But it breaks diegetic framing — the AI wouldn't tell itself "you have 70 ticks."

### Approach 2: "The Threat Assessment"
The boot log says: *"THREAT ANALYSIS: Moderate engagement window. Primary contact expected within 20 ticks. Resolution probability peaks at tick 50-60."* Diegetic, atmospheric, and communicates the time horizon without an exact number.

### Approach 3: "The Recon Icon"
A small stopwatch icon in the mission briefing panel shows a circular arc — the arc length represents the hard ceiling relative to the maximum possible (150 ticks). M1's arc is a thin sliver. M10's arc is nearly complete. The Gauntlet's arc is full. No numbers — just a visual proportion.

### Approach 4: "The Previous Attempt"
After the first attempt, the mission briefing shows: **"Last attempt: 47/70 ticks"** — the player's actual match length versus the hard ceiling. First attempt shows nothing. This rewards iteration — information accrues.

### Approach 5: "The Hybrid Clock"
The EXECUTE button itself contains the information. Its border is a circular progress bar that fills during the sealed watch. Before execution, the button's border is a static arc showing the hard ceiling as a proportion. During sealed watch, the tick clock fills the arc. After sealed watch, the arc shows where the match ended.

**Recommended: Approach 2 (diegetic) + Approach 5 (EXECUTE button arc).** The boot log provides atmospheric expectation-setting; the button provides precise visual feedback during and after the match. No raw numbers until the Inspector debrief, where the timeline scrubber shows exact tick positions.

---

## The Campaign-to-Gauntlet Gear Shift

The transition from M10 (ceiling: 120) to Gauntlet (ceiling: 150) is a *designed moment*. This is the first time the player faces a match that could last 2.5 minutes of sealed watching. The lengthening communicates:

1. **"The training wheels are off."** Campaign missions had calibrated ceilings. Gauntlet matches are longer because *anything can happen*.
2. **"Your architecture must be self-sustaining."** A 150-tick match requires an architecture that doesn't just solve a puzzle — it must adapt, sustain, and recover over extended engagements.
3. **"The stakes are higher per attempt."** Losing a 150-tick Gauntlet match costs more *time* than losing a 35-tick M1 tutorial. The player invests more emotional weight.

### The Gear Shift as Sensory Experience

**M10 ends.** The Predecessor's final message fades. The campaign map dims. A new interface appears: the Gauntlet lobby. The EXECUTE button's arc is visibly larger than any campaign mission — the player can see the ceiling is higher before they play. The boot log (if it speaks at all): *"OPERATIONAL PARAMETERS: Unrestricted. No ceiling override. Full autonomous mode."*

**First Gauntlet match.** The tick clock at the top of the sealed watch has more pips than the player has ever seen. The match stretches past familiar landmarks — tick 80, tick 100, tick 120. The player's architecture enters uncharted territory. Things happen that never happened in campaign: context windows churn through 3-4 eviction cycles instead of 1. Relays process more messages than the player tested for. Enemy factories produce reinforcement waves the player never faced.

**The audio tells the story.** The kulintang layering (from 6.02) adds voices as the match lengthens — gong layers that the player has never heard because campaign matches never lasted this long. The soundtrack itself communicates "you are in new territory."

**The debrief.** The Inspector timeline is the longest the player has ever scrubbed. Scrolling through 140 ticks of data reveals patterns invisible in 60-tick campaign matches: drift in context utilization, gradual channel saturation, slow eviction policy failures that only manifest after 80+ ticks of accumulated data. The Gauntlet teaches that *some bugs only appear at scale* — a direct parallel to production engineering where load testing reveals failures that unit tests can't.

---

## Retry Iteration Speed by Mission

The single most important metric is **full loop time** — how long from hitting EXECUTE to being ready to hit EXECUTE again:

| Phase | Duration | Notes |
|-------|----------|-------|
| Sealed watch | soft floor – hard ceiling | Non-skippable |
| Act 1→Act 2 transition | 1-2 seconds | Automatic |
| Inspector debrief | 30s – 5 min | Player-controlled |
| Plan screen edits | 30s – 10 min | Player-controlled |
| **Total loop** | **~1-15 min** | **Wide range** |

The sealed watch is the only *fixed-cost* portion. For M1 (12-35 ticks), the sealed watch is 12-35 seconds — the full loop can be under 1 minute. For M10 (45-120 ticks), the sealed watch alone is 45 seconds to 2 minutes.

**Iteration velocity by campaign phase:**

- **M1-M4 (tutorial):** Target 3-6 full loops per 15-minute session. Sealed watch: 12-55 seconds. Debrief: 15-30 seconds (simple failures, obvious fixes). Plan edits: 15-30 seconds (single parameter changes). **Full loop: 1-2 minutes.** This is Wordle-fast. The player is in flow.

- **M5-M7 (factory/command):** Target 2-4 full loops per 15-minute session. Sealed watch: 30-85 seconds. Debrief: 1-3 minutes (complex failures, multiple causes). Plan edits: 2-5 minutes (blueprint redesign, production queue tuning). **Full loop: 4-9 minutes.** This is Into the Breach-paced. Each attempt is a meaningful investment.

- **M8-M10 (advanced):** Target 1-3 full loops per 15-minute session. Sealed watch: 30-120 seconds. Debrief: 2-5 minutes (multi-agent failures, cross-mission pattern analysis). Plan edits: 3-10 minutes (architectural redesign). **Full loop: 6-17 minutes.** This is Zachtronics-paced. Each attempt is an experiment with a hypothesis.

- **Gauntlet:** Target 1-2 full loops per 15-minute session. Sealed watch: 40-150 seconds. Debrief: 2-5 minutes. Plan edits: 3-10 minutes. **Full loop: 6-18 minutes.** The stakes per attempt are high enough that each EXECUTE press matters.

---

## Speed Control Interaction Design

The 0.5x / 1x / 2x speed controls interact non-trivially with match length:

**0.5x speed** doubles wall-clock duration. A 120-tick M10 at 0.5x = 4 minutes of watching. This is viable for first attempts and learning, but punishing for retries. **Design consideration:** Should 0.5x be available on retries? Restricting it to first-attempt-only would be paternalistic. But the game could *default* to 1x on retries and require explicit 0.5x selection each time — a small friction that nudges toward faster iteration.

**2x speed** halves wall-clock duration but degrades readability. At 2x, signal chain flashes last 0.25 seconds instead of 0.5. Context bars update twice per second. Unit movement is snappy but harder to track. **Design consideration:** 2x speed could apply *selectively* — 2x for ticks where nothing happens to the player's units, 1x for ticks with combat/signals. This "smart speed" automatically accelerates boring stretches while preserving dramatic moments. The player sees: tick 15 at 2x → tick 16 at 2x → tick 17 COMBAT, automatically drops to 1x → tick 18 at 1x → tick 19 at 2x. The speed control becomes 0.5x / 1x / Smart 2x.

**Smart 2x event triggers:**
- Any player unit takes damage → 1x
- Any player unit's context enters amber/red zone → 1x
- Any hook chain involves 3+ units → 1x
- Any command agent fires reassign/reroute → 1x
- All other ticks → 2x

This creates a "highlight reel" effect at Smart 2x — the boring ticks blur by, the important ticks snap into focus. The rhythm is jazz-like: long-short-short-long-short depending on what's happening.

---

## Player Journeys

#### Journey: Mika, 14, First Strategy Game (Mission 3, Third Attempt)

**Context:** Mika has completed M1 and M2, learning context windows and basic rules. M3 introduces hooks. She failed her first two attempts because her scout sees enemies but her striker doesn't know about it — the hook isn't wired yet.

**Minute 0:00 — The Plan Screen**
Mika stares at the workbench. Her scout blueprint has a patrol skill and an ON_ENEMY_SPOTTED hook — but the hook's channel field is empty. She remembers the boot log said something about channels. She types "alerts" in the channel name field. A green checkmark appears. She opens the striker blueprint, goes to context config, and sees a "Listen" panel with her new "alerts" channel listed. She toggles it on. Total plan time: 45 seconds.

**Minute 0:45 — EXECUTE**
She hits the button. The button's arc is small — M3's ceiling is only 45 ticks. The sealed watch begins. The tick clock at the top shows 45 tiny pips.

**Minute 0:48 — Tick 3**
Her scout moves. The board is quiet. She watches the scout's context bar — one slot fills with "terrain: open." At 2x speed, three ticks pass in 1.5 seconds.

**Minute 0:52 — Tick 8**
The scout spots an enemy. A green flash appears on the scout's tile — signal sent! A colored dashed line arcs from the scout across the board toward the striker. The line has a tiny "1" on it — 1 tick latency. Mika leans forward.

**Minute 0:53 — Tick 9**
The signal arrives at the striker. A green flash on the striker's tile. The striker's context bar gains a new slot: "alert: enemy at D4." The striker's rules evaluate — and it starts moving toward D4. Mika whispers "yes."

**Minute 0:57 — Tick 13**
The striker reaches the enemy. Adjacent tile. One-shot, one-kill. Red flash. The enemy disappears. But the scout has already moved on — it spots another enemy at F6 and sends another signal.

**Minute 1:02 — Tick 18**
Second enemy eliminated. The board is clear. "MISSION COMPLETE" fades in. Total sealed watch: 18 ticks = 18 seconds (she was on 1x). She pumps her fist.

**Minute 1:03 — Inspector**
The timeline scrubber shows 18 ticks. She scrubs to tick 8 — the moment the signal was sent. She clicks the striker and sees: "Context: [alert: enemy at D4] — Source: scout via 'alerts' channel." Decision trace: "Rule 1 matched: IF context contains enemy_location THEN move_toward." She understands. The whole debrief takes 30 seconds.

**Minute 1:33 — Back to Campaign Map**
Total loop time for this successful attempt: 1 minute 33 seconds. She's done 3 attempts in under 5 minutes. The short tick ceiling (45) made each attempt feel like a coin flip — quick enough to try "one more time" without hesitation.

**UI Annotations:**
- Tick clock: 45 pips, each lighting up cyan as the tick passes. Defeated enemy pips turn red.
- EXECUTE button arc: thin sliver (45/150 = 30% of maximum). Fills during watch.
- Speed default: 1x (Mika hasn't learned about speed controls yet — they're unlocked in M4).

---

#### Journey: Marcus, 38, Factorio Veteran (Mission 8, First Attempt)

**Context:** Marcus completed M7 (deadlock tutorial) after 4 attempts. M8 is the first mission with a *contracted* tick ceiling — 75 ticks instead of M7's 85. The boot log says: *"OPERATIONAL WINDOW: Compressed. Enemy reinforcement cycle: 25 ticks. Projected engagement density: high."*

**Minute 0:00 — Reading the Briefing**
Marcus notices the EXECUTE button's arc is *shorter* than M7's. He zooms the board preview: two enemy spawners, one in the northeast, one in the southwest. His factory is center-west. The terrain is Zambales volcanic coast — lava tiles block direct paths, forcing zigzag movement. He thinks: "I need to win faster than last mission. My relay chain took 60 ticks to stabilize in M7 — that won't work here."

**Minute 2:00 — Redesigning for Speed**
He strips his architecture from M7's 3-relay chain to a 1-relay direct pipe. Scouts report to a single central relay. The relay compresses and broadcasts to two strikers. No command agent — too slow for 75 ticks. He adds a second scout facing southwest. Production queue: scout, relay, scout, striker, striker. Total plan time: 3 minutes.

**Minute 3:00 — EXECUTE**
He selects Smart 2x from the speed controls. The sealed watch begins. The first 12 ticks flash by at double speed — scouts deploying, relay activating, nothing interesting. Then at tick 13 —

**Minute 3:08 — Tick 13 (auto-drops to 1x)**
Northeast scout spots enemy scouts. Three of them. Green flash — signal sent to relay. But the relay's context window is already half-full from the southwest scout's terrain reports. The context bar flickers to amber. Marcus watches the relay's compress skill fire — two terrain reports compress into one. Room made. The enemy position signal gets through.

**Minute 3:15 — Tick 20 (Smart 2x resumes)**
Both strikers are moving. The northeast striker engages the first enemy scout at tick 22. One-shot kill. But an enemy striker has emerged from the northeast spawner — something Marcus didn't see coming.

**Minute 3:22 — Tick 27 (auto-drops to 1x)**
The enemy striker is adjacent to Marcus's scout. One-shot kill — his scout is eliminated. The southwest has gone quiet, so the relay's context window starts filling with stale data. The eviction policy kicks in, but it's set to "oldest first" which evicts the northeast enemy position report — the most important data.

**Minute 3:35 — Tick 38**
Marcus's northeast striker is hunting blind — the position data was evicted. The remaining striker on the southwest path engages an enemy relay and destroys it. But the northeast is collapsing. His relay enters amber. His single striker wanders.

**Minute 3:55 — Tick 55**
He's lost one striker and one scout. One scout and one striker remain, plus the relay. The relay's context window is red — overloaded with incoming data from the remaining scout's frantic reports. It stuns for a tick. Sparking animation, jitter. When it recovers, it sends a compressed burst — but the striker is too far from the northeast spawner.

**Minute 4:10 — Tick 68**
The remaining enemies converge on his factory. Adjacent enemy striker. Red flash. "FACTORY DESTROYED."

**Minute 4:12 — Match ends at tick 68/75**
He lost with 7 ticks to spare. The sealed watch lasted 68 seconds (with Smart 2x, actual wall-clock was ~50 seconds due to acceleration of quiet ticks).

**Minute 4:15 — Inspector Debrief**
The timeline shows 68 ticks. He immediately scrubs to tick 27 — the scout elimination. He clicks the relay and sees the context window at that tick: stale terrain data in the oldest slots, critical enemy position in slot 3. The eviction policy was wrong. "Oldest first" should be "lowest priority first" with enemy positions flagged as high priority. He sees it. This is a 30-second fix.

**Minute 5:30 — Second Attempt**
He changes the relay's eviction policy from "oldest" to "priority-weighted." Total plan edit: 15 seconds. He hits EXECUTE. This time the relay holds critical data. Northeast striker stays on target. He wins at tick 44.

**Minute 6:45 — Victory**
Two full loops in under 7 minutes. The contracted ceiling (75 ticks) forced him to simplify his architecture. The previous mission's 3-relay chain would have been too slow — and he learned *why* speed matters. The 75-tick ceiling isn't just a time limit; it's a *design constraint* that teaches efficiency.

**UI Annotations:**
- Smart 2x indicator: small "2x" badge on the tick clock that pulses to "1x" when events trigger slowdown. The transition is a smooth 200ms zoom — the tick clock pips spread apart slightly at 1x, compress at 2x.
- EXECUTE button arc: noticeably shorter than M7. Marcus registered this before reading the briefing.
- Mercy clock: not triggered (match ended by factory destruction at tick 68).

---

#### Journey: Dr. Priya, 42, DevOps Lead (Gauntlet Match 15, ELO 1450)

**Context:** Priya has completed the campaign and is deep in the Gauntlet. Her current architecture uses a 2-relay mesh with a command agent that dynamically reroutes based on threat density. She's facing a Gauntlet opponent whose config specializes in EM noise flooding — broadcasting garbage on all channels to overload context windows.

**Minute 0:00 — Pre-Match**
The Gauntlet lobby shows the EXECUTE button's arc at its maximum extent — 150 ticks possible. She hasn't seen a match last past 110 ticks yet, but she knows this opponent's noise-flood strategy tends to create long, attritional matches. She switches to Smart 2x.

**Minute 0:15 — EXECUTE**
The sealed watch begins. Her scouts deploy efficiently — Smart 2x accelerates the first 15 ticks of positioning.

**Minute 0:30 — Tick 22 (auto-1x)**
She sees it: enemy units are broadcasting on every channel. Her relays' context bars jump to amber immediately. Slots fill with garbage: `[noise-alpha: $%#@]`, `[noise-beta: &*!!]`. Her relays' compress skills fire, but they're compressing noise, not signal. By tick 25, both relays are in red.

**Minute 0:45 — Tick 30**
First relay stuns. Sparking, jittering. One tick of paralysis. The command agent detects the stun (via hook) and fires reroute — sending scout signals directly to strikers, bypassing the stunned relay. Smart 2x kicks in during the reroute delay ticks.

**Minute 1:05 — Tick 45**
The direct scout→striker pipe works but lacks compression. Strikers' context windows fill faster. One striker enters amber. But the striker's filter skill (normally passive) starts paying off — it drops signals tagged as "noise" based on a fidelity threshold Priya set during M9. The filter was never tested against this volume of noise. It holds — barely.

**Minute 1:40 — Tick 70**
This is where campaign matches would have ended. But the Gauntlet goes on. Priya's architecture has entered uncharted duration territory. The kulintang soundtrack adds a low bamboo percussion voice she's never heard before — it only layers in after tick 60. She notices. The battlefield has a different *feel* at this duration. Patterns emerge that campaign matches never showed: her command agent has fired reroute 4 times. Each reroute has accumulated a slightly different network topology. The architecture is *drifting*.

**Minute 2:15 — Tick 90**
The enemy's noise flood is tapering — the opponent's EM budget is running low. Priya's architecture is battered but functional. Her command agent, now in its 5th reroute configuration, has accidentally created a topology that concentrates all scout data through the un-stunned relay with maximum compression. The efficiency is higher than her original design. She's watching her architecture *adapt* — not through intelligent design, but through the command agent's rules interacting with the noise flood's pressure.

**Minute 2:50 — Tick 115**
Her strikers close on the enemy factory. One enemy striker remains — positioned to guard. Her scout spots it and sends a signal through the now-efficient relay chain. Both strikers converge from different angles. Adjacent. Red flash. Enemy down. Next tick: striker reaches enemy factory. Red flash. "MATCH COMPLETE."

**Minute 2:55 — Debrief**
The Inspector timeline stretches across 115 ticks — the longest she's ever analyzed. She scrubs to tick 70, where the campaign would have ended. She sees: context utilization was at 92% across all units. By tick 90, it had dropped to 68% — her architecture had found equilibrium with the noise. She opens the context window chart: the sparkline shows a dramatic peak at tick 30 (first stun), a sustained plateau at 85-95% through tick 70, then a gradual decline as the noise tapered. The *shape* of that sparkline tells a story no campaign match could tell. She screenshots it.

**Minute 5:00 — Post-Debrief Insight**
Priya realizes: her architecture's performance at tick 90 was better than tick 30 because the command agent's rules — designed for a different purpose — accidentally created noise resilience through repeated rerouting. She didn't design for this. It *emerged*. She pulls up the command agent's reroute history: each reroute was triggered by a different relay's stun event. The 5th reroute, by coincidence, routed through the relay with the strongest filter settings. This is the Gauntlet's gift: matches long enough for emergence.

**UI Annotations:**
- Tick clock: 150 pips maximum. At tick 115, 77% filled. The unfilled pips are faint grey, creating a "how much time is left?" tension.
- Kulintang audio layer: bamboo voice enters at tick 60, deep drum at tick 90, full chorus at tick 120. Priya has never heard the full chorus — it requires 120+ tick matches.
- Smart 2x: accelerated roughly 40% of ticks (positioning, movement without events). Actual wall-clock for 115 ticks ≈ 2 minutes 10 seconds instead of 1:55. The time savings is modest because this match had frequent events.
- Context window sparkline: shown in post-match stat block. The peak-plateau-decline shape is a recognizable signature Priya can compare across future matches.

---

#### Journey: Leo, 28, Twitch Streamer (Mission 6, Streaming Live)

**Context:** Leo is streaming his blind playthrough. 340 viewers. M6 introduces the command agent. He failed M5 twice and optimized his factory in a stream highlight clip. Now M6's briefing mentions a "command module" — he's excited.

**Minute 0:00 — Reading the Briefing**
Leo reads the boot log aloud to chat: *"SUBSYSTEM INITIALIZATION: Command module online. Meta-level operational. Subordinate management enabled."* He says to chat: "Okay chat, command agent. This is where it gets real." He notices the EXECUTE button arc is bigger than M5's. "Longer match too. Seventy... eighty ticks? Let's see what happens."

**Minute 3:00 — Configuring the Command Agent**
He's spent 3 minutes on the command agent blueprint. He's given it reassign and reroute skills, 4 hook slots all wired to a "command-net" channel, and 3 rules:
- IF any_unit_stunned THEN reassign(stunned_unit, reduce_buffer_load)
- IF unit_count(scout) < 2 THEN reroute(relay, scout_direct)
- IF enemy_near_factory THEN reroute(all_strikers, defend)
Chat is backseat gaming: "your third rule is too broad lol," "you need a priority on rule 2," "EXECUTE ALREADY." He hits EXECUTE.

**Minute 3:15 — Sealed Watch Begins**
Smart 2x is on. First 15 ticks blur past. His factory produces: scout, scout, relay, command agent. The command agent spawns at tick 12 — taking 4 production slots means it's late to the field.

**Minute 3:30 — Tick 18**
Enemy contact. His scouts spot 4 enemies pushing from the north. Signals fly — green flashes everywhere. The relay compresses and forwards to both the command agent and the striker production queue. Chat: "here we go," "those scouts are gonna get eaten."

**Minute 3:40 — Tick 24**
Scout eliminated. The command agent's Rule 1 would fire (unit stunned), but the scout wasn't stunned — it was killed. Rule 1 doesn't match. Rule 2 checks: scout count = 1, less than 2. Fires. The command agent reroutes the relay to send signals directly to the factory instead of through the channel. Leo doesn't understand what happened — the channel map panel updates but he's watching the board.

**Minute 3:55 — Tick 35**
Chat is ahead of Leo. "Your command agent rerouted the relay!" "check the channel panel!" Leo glances at the channel map panel in the Inspector sidebar. He sees the reroute. "Oh! It did the thing! It's managing the network!" His voice rises. 12 new viewers join in 30 seconds.

**Minute 4:15 — Tick 48**
The match is reaching a duration Leo hasn't experienced before. His factory has produced 2 more scouts and a striker. The command agent's Rule 3 fires — enemy near factory — and all strikers reroute to defend. Chat explodes: "THE PIVOT," "he built an autopilot," "this is Kubernetes: The Game." Leo watches his strikers converge on the factory's position without any manual intervention. The sealed watch is doing its job — *watching* is the content.

**Minute 4:45 — Tick 62**
Victory. Enemy factory destroyed by the striker wave. Total sealed watch at Smart 2x: roughly 50 seconds. Leo sits back. "Chat. CHAT. I didn't DO anything. I designed it and it just... worked. Sixty-two ticks of autonomous operation."

**Minute 5:00 — Inspector Debrief**
He scrubs to tick 24 and shows chat the reroute moment. Then to tick 48 and shows the defend reroute. "Look at the decision trace. Rule 3 fired because the hook detected enemy proximity. The striker's context shows the reroute command from the command agent. I designed a *system*." Chat: "clip it," "that's the game right there."

**Minute 5:30 — The Clip**
Leo clips the 62-second sealed watch. It goes on Twitter. The clip shows: 15 seconds of quiet positioning → scout death → command agent reroute → factory builds reinforcements → enemy pushes factory → command agent pivots defense → striker wave crushes enemy base. The entire story arc in 62 seconds.

**UI Annotations:**
- Stream overlay: Leo has a webcam in the bottom-left, the game takes 80% of the screen. The tick clock, board, and context bars are all visible at 1080p.
- Smart 2x: accelerated roughly 30% of the match. The "auto-drop to 1x" moments are exactly the dramatic beats — scout death, reroute, defend pivot.
- Channel map panel: a small read-only panel showing channel topology. Updates in real-time during sealed watch. Leo didn't notice it during the match, but it's visible in the clip.

---

## Interaction Effects

**With Sealed Watch (locked):** The "no skip, no pause" rule means tick budget IS time budget. Every tick is a second the player can't get back. This makes match length calibration the single most impactful tuning parameter for player experience. Too long = frustration per retry. Too short = insufficient system expression.

**With Inspector (locked):** Longer matches produce longer timelines to scrub. The Inspector must handle 150-tick timelines without performance degradation or UI overwhelm. Consider: a "chapter markers" system that auto-detects dramatic moments (combat, stun events, reroutes) and places scrubber bookmarks.

**With Production Queue (locked):** Factory production rate interacts with tick ceiling. If the factory produces one unit every 5 ticks and the ceiling is 70, the maximum army size is 14 units. At 150 ticks (Gauntlet), it's 30 units. The board (8x8 = 64 tiles) can't support 30 units comfortably. Either production rate must scale with tick ceiling, or army composition must shift from quantity to quality at higher durations.

**With Signal Latency (locked, 1 tick/hop):** A scout→relay→striker chain takes 4 ticks. In a 35-tick M1, that's 11% of the match spent on signal propagation. In a 150-tick Gauntlet, it's 2.7%. Longer matches make signal latency less punishing — which means short campaign matches disproportionately teach "minimize hops" while Gauntlet matches allow deeper architectures.

**With Context Overload (locked):** Longer matches mean more data passes through context windows. A 6-slot scout buffer at 1 observation/tick fills in 6 ticks. In a 35-tick match, it fills ~5 times. In a 150-tick match, it fills ~25 times. Eviction policy matters 5x more in the Gauntlet than in the tutorial. This is a feature: the tutorial teaches eviction basics, and the Gauntlet reveals eviction mastery.

**With Speed Controls (locked):** See "Speed Control Interaction Design" above. Smart 2x is the recommended enhancement.

**With EM Emissions (locked):** Longer matches accumulate more EM noise. If enemy scouts detect EM, longer matches give them more detection opportunities. Stealth architectures (minimal hooks, compressed signals) are proportionally more valuable in the Gauntlet than in campaign.

**With Phase Shifts (5.08a-iv):** Phase shifts reset architectural assumptions. A 100-tick match with 2 phase shifts = 3 distinct 33-tick phases. A 50-tick match with 1 phase shift = 2 distinct 25-tick phases. Shorter phases give the architecture less recovery time, making phase shifts relatively more punishing in short matches.

**With Vocabulary Density (5.04b):** Short tutorial matches (30-35 ticks) mean fewer observable events per match. If a new term requires 3-5 observations to understand, and a M1 match produces only 12-15 events total, each event must be term-relevant. The mission designer's event budget is tight at low tick ceilings.

**With Campaign Match Length (5.23 — this file):** The Gauntlet's variable ceiling (80-150) means match length itself becomes a strategic variable. Architectures that win fast (60 ticks) are *different* from architectures that win by attrition (130 ticks). The Gauntlet rewards versatility — or punishes specialization.

---

## New Aspects Discovered

- **5.23a — Smart 2x speed control detailed design:** Full specification of the event-trigger system for automatic speed shifting; which events trigger 1x, transition animation, player override behavior, interaction with streaming/spectator mode
- **5.23b — The "Last Stand" projected victory mechanic:** Detailed design of the ghost timeline extension shown when a player would have won within N ticks of the hard ceiling; emotional pacing of the reveal; false-last-stand (projected victories that wouldn't have actually worked) as edge case
- **5.23c — Inspector chapter markers for long matches:** Auto-detection of dramatic moments on the timeline scrubber; bookmark types (combat, stun, reroute, phase shift, production milestone); visual language for bookmarks; interaction with Gauntlet 150-tick timelines
- **5.23d — Production rate vs. tick ceiling scaling:** How unit production rate should interact with match duration; constant rate vs. escalating rate vs. resource-gated rate; board saturation calculations at different tick ceilings
- **5.23e — The "one more try" threshold by mission duration:** Psychological research on retry willingness as a function of attempt duration; the 30-second retry (always) vs. 90-second retry (usually) vs. 3-minute retry (rarely) cliff; designing mission ceilings to stay below the "quit" threshold per campaign phase
