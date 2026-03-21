# The Pass-Rate Plateau Problem

**Aspect:** 5.19 — The "pass-rate plateau" problem: players who get 80/100 and feel done — designing campaign gates that require 90% rather than 100% for progression, while reserving 100% for cosmetic/leaderboard rewards; the psychological difference between "good enough" and "provably correct"
**Category:** Campaign / Progression Gating
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

A player finishes Mission 6. Their scout network spotted 80% of incoming threats, their relay chain compressed and forwarded signals with decent timing, and their strikers eliminated most enemies. They won. The campaign map lights up — Mission 7 is unlocked. But their architecture leaked. Twenty percent of enemy units slipped through detection, causing unnecessary losses, wasted ticks, and near-misses that the inspector reveals in painful detail.

The player shrugs. "Good enough."

This is the pass-rate plateau — the moment where a player's solution is *functional* but not *excellent*, and the game has no lever to pull them toward excellence. It is a cousin of the "satisficing" problem from behavioral economics: humans naturally settle for "good enough" when the marginal effort to reach "perfect" feels disproportionate to the marginal reward. In Robot Uprising, where the core loop is about building information architectures that handle chaos gracefully, the difference between 80% and 100% pass rates is where the real design mastery lives. An 80% architecture handles the obvious cases. A 100% architecture handles the edge cases — the scout that gets eliminated early, the relay that overloads on tick 14, the striker that arrives one tick late because signal latency ate the timing window.

The question: how does the game make that last 20% feel worth pursuing without making the first 80% feel like failure?

### Why This Matters for Robot Uprising Specifically

Robot Uprising's locked constraints make this unusually sharp:

- **Deterministic execution with invisible randomization** means each run varies within constraints. A player's 80% architecture might score 75% on one run and 85% on another. The plateau isn't a fixed number — it's a band of "usually works."
- **One-shot, one-kill** means every failure in the remaining 20% is a dead unit. Not a scratched unit, not a damaged unit — a vanished unit. The gap between 80% and 100% is measured in bodies.
- **The inspector exists.** Unlike most games where imperfect play is invisible, the inspector's decision trace and context window replay makes every mistake forensically visible. The player can *see* exactly where their architecture leaked, which is both motivating ("I can fix that!") and demotivating ("That's a lot of edge cases to handle").
- **10-mission campaign** means limited content. If the gate is too low, players blaze through. If too high, they stall. The threshold directly controls pacing.

---

## The Threshold Spectrum

Before exploring options, it helps to name the positions along the spectrum:

| Threshold | Name | Philosophy |
|-----------|------|------------|
| Any win = progression | **The Zachtronics Gate** | Completion is enough; optimization is self-directed |
| 70% pass rate required | **The Passing Grade** | You need to demonstrate basic competence |
| 90% pass rate required | **The Honor Roll** | You need to demonstrate strong mastery |
| 100% pass rate required | **The Perfectionist Gate** | Nothing less than flawless |
| No fixed gate; histogram comparison | **The Social Mirror** | You decide when you're done; others show you what's possible |

Each has a fundamentally different relationship with the plateau.

---

## Option A: "The Zachtronics Split" — Any Win Progresses; Histograms Motivate Optimization

### How It Works

Any working solution — even one that barely scrapes by with 60% of units surviving and half the enemy base destroyed by accident — unlocks the next mission. The campaign gate is binary: win or lose. No stars, no grades, no pass-rate percentage displayed at the gate.

But after each mission, three histograms appear in the inspector debrief, showing the player's solution compared to all other players across three metrics: **units surviving** (proxy for architecture robustness), **ticks to completion** (proxy for efficiency), and **signal waste** (total unused context slots across all units across all ticks — proxy for information architecture tightness). The player's position is a bright cyan marker on each histogram. The distributions show where "most players" land and where the top players cluster.

The histograms are always visible in the inspector. They're not a pop-up or a gate — they're ambient information. A thermometer strip at the bottom of each histogram glows cool blue at the median, shifts to gold at the 75th percentile, and pulses white-hot at the 95th. The player's marker leaves a faint trail of previous attempts, so they can see their own improvement arc.

### Why It Works

Zachtronics proved this model with SpaceChem's histograms, which Zach Barth developed specifically as a replacement for global leaderboards. Traditional leaderboards tell 99% of players "you're bad." Histograms tell 99% of players "here's what's possible, and here's where you stand." The psychological difference is enormous — a leaderboard is a ranking (hierarchical, competitive, discouraging), while a histogram is a distribution (informational, curious, inviting).

The key insight: **the histogram doesn't tell you what to do.** It shows you that better solutions exist and roughly how much better they are, but it doesn't gate anything behind them. The motivation to optimize is entirely intrinsic — "I bet I can get that signal waste number lower" — rather than extrinsic — "I need 3 stars to unlock the next level."

Opus Magnum refined this further. Its puzzles have infinite workspace, meaning any solution that works is valid. The histograms for cost, cycles, and area exist purely as social mirrors. Players regularly post GIFs of their solutions on Reddit, competing for the most elegant or absurd approach. The optimization game becomes its own content layer — entirely optional, entirely social, entirely self-directed.

### Strengths

- **Never blocks progression.** No player ever hits a wall because their 80% solution isn't "good enough." Everyone can see the full campaign.
- **Self-directed mastery.** Players who want to optimize will. Players who want to see the story will. Both are valid.
- **Social motivation without social pressure.** The histogram is anonymous — you're a dot among dots. No usernames, no rankings, no shame.
- **Replayability engine.** After finishing the campaign, the histograms give players a reason to revisit every mission. "I was 40th percentile on Mission 7's signal waste — I bet I can do better now that I understand relay compression."

### Weaknesses

- **The plateau is unchallenged.** A player who scores 80% on every mission and never looks at the histograms will have a complete but shallow experience. The game never pushes them.
- **No tangible reward for excellence.** The histogram position is its own reward, but some players need something to *get* — a badge, an unlock, a visual change. Pure intrinsic motivation works for self-driven optimizers but leaves extrinsically motivated players cold.
- **Pacing collapses.** If every win progresses, a player could finish all 10 missions in a single session with sloppy solutions. The campaign has no speed bumps.

---

## Option B: "The Honor Roll Gate" — 90% Required for Progression, 100% for Cosmetics

### How It Works

Each mission has a pass rate displayed as a percentage bar in the post-battle debrief. The pass rate is a composite score measuring: percentage of player units surviving, percentage of enemy units eliminated, and information efficiency (inverse of wasted context slots). The campaign map shows each mission node with a ring that fills as the pass rate rises — cyan fill up to 89%, gold fill from 90-99%, and a blazing white-gold starburst at 100%.

**To unlock the next mission, you need 90%.** Not 100%. Not "any win." Ninety percent. The number is chosen carefully: it means the player's architecture must handle the core challenge and most edge cases, but one or two imperfections are forgiven. It's the difference between "your system works" (any win) and "your system works well" (90%).

**At 100%, something cosmetic happens.** The mission node on the campaign map transforms — the province glows with a circuit-board pattern that pulses with data-flow animations. The unit blueprints used in that mission gain a small gold sigil in the Blueprint Codex. A "perfect architecture" stamp appears in the mission's inspector view. None of these affect gameplay. They're trophies. Proof that you solved the edge cases.

**At 100% on all 10 missions**, the campaign map itself transforms. The circuit-board connections between provinces animate with flowing data pulses. The archipelago silhouette gains a subtle aurora effect — bioluminescent light rippling across the ocean between islands. A final boot log entry appears: "SYSTEM STATUS: ALL SUBSYSTEMS NOMINAL. ZERO INFORMATION LEAKAGE DETECTED. ARCHITECTURE VERIFIED." This is the game's equivalent of a platinum trophy — visible only to the player, meaningful only to them.

### The 90% Sweet Spot

Why 90% and not 80% or 95%?

- **80% is too easy to stumble into.** A player with a mediocre architecture will occasionally hit 80% through favorable randomization. The gate doesn't ensure understanding.
- **95% is too close to 100%.** The effort to go from 95% to 100% is often the same as 90% to 95%. At 95%, the gate feels like it demands perfection without admitting it.
- **90% requires intentionality.** You can't hit 90% consistently with a sloppy architecture. You need to have thought about edge cases, even if you haven't solved all of them. It's the difference between "I got lucky" and "I designed for this."
- **The 10% forgiveness buffer** means the player doesn't need to solve every single edge case — just most of them. This keeps the game from feeling like a Zachtronics-style "find the exact solution" puzzle and preserves the feeling that you're building a *robust system* rather than *the one correct answer*.

### Strengths

- **Pushes past the plateau.** The 90% gate forces players to engage with the inspector, understand why their architecture leaked, and fix the common failure modes. The plateau is at 80%? The gate is at 90%. You can't plateau and progress simultaneously.
- **Clear motivation for 100%.** The cosmetic rewards give completionists a tangible target without punishing non-completionists. The gold sigils and map transformation are visible proof of mastery.
- **Pacing control.** The 90% gate means each mission takes 2-4 attempts minimum for most players, creating a natural rhythm of plan-execute-inspect-iterate that prevents the campaign from being blitzed.
- **Psychological safety of "not quite perfect."** The game is saying: "90% is genuinely good. You're genuinely skilled. 100% is for the obsessive — and we celebrate that too, but it's not required." This avoids the toxic perfectionism that makes some puzzle games feel punishing.

### Weaknesses

- **The 89% frustration cliff.** A player who hits 89% three times in a row will feel the game is being unfair. "I was so close!" The fixed threshold creates a binary pass/fail at a specific number, and near-misses are painful.
- **Invisible randomization tension.** If the same architecture scores 88% on one run and 92% on another due to randomization, the player may feel the gate is arbitrary. "I didn't change anything and now I pass?" This undermines the feeling that mastery is what matters.
- **The 91% trap.** A player who consistently scores 91% has "passed" but their architecture still leaks. The game has no mechanism to push them from 91% to 100% except the cosmetic rewards, which not all players care about.

### Interaction Effects

- **Inspector becomes essential.** At 80%, players can skip the inspector and brute-force. At 90%, they need the decision trace to diagnose leaks. The inspector's value proposition is dramatically higher with this gate.
- **Blueprint Codex gains weight.** The gold sigils on blueprints create a collection metagame within the codex. Players browse their codex and see which blueprints have earned perfect marks — and which haven't.
- **Invisible randomization needs tuning.** The randomization variance must be smaller than the gate margin. If the gate is 90%, the variance for a given architecture should be plus or minus 3%, not plus or minus 10%. Otherwise the gate feels like a dice roll.

---

## Option C: "The Tiered Medal System" — Bronze/Silver/Gold Gates at Different Thresholds

### How It Works

Each mission awards a medal based on pass rate:

| Medal | Pass Rate | What It Unlocks |
|-------|-----------|-----------------|
| **Bronze** | 70% | Next mission in the campaign |
| **Silver** | 85% | Bonus modifier for that mission (new enemy variant, tighter constraints) |
| **Gold** | 95% | Cosmetic reward + Blueprint Codex sigil |
| **Perfect** | 100% | Leaderboard entry + campaign map transformation piece |

The medal is displayed as a physical emblem on the campaign map's province node — a bronze gear, a silver circuit, a gold data crystal, or a white-gold starburst. The province node grows more elaborate with each tier: bronze shows a dim circuit trace, silver adds pulsing data lines, gold adds a holographic shimmer, perfect adds the full aurora effect.

**The critical design choice:** Bronze unlocks progression. Everything above Bronze is optional enrichment. This means the campaign is never blocked at 90% — even a 70% player can see all 10 missions. But the game *visibly acknowledges* the difference between 70% and 100%, and the bonus modifiers at Silver create additional content for players who push past the plateau.

### The Silver Modifier — Bonus Content for Excellence

This is the most interesting tier. When a player earns Silver (85%) on a mission, they unlock a **modifier** for that mission — a variant that changes the challenge:

- Mission 3 Silver modifier: "SIGNAL STORM" — ambient noise fills all context windows 2 slots faster, requiring tighter filters
- Mission 6 Silver modifier: "GHOST FACTORY" — enemy factory is invisible until a unit gets within perception range
- Mission 8 Silver modifier: "TICK PRESSURE" — battle ends 5 ticks earlier than normal

These modifiers are entirely optional. They don't gate anything. But they provide *new content* for players who demonstrated mastery — content that further tests and develops that mastery. The modifier is itself a new puzzle that requires the player to refine their architecture further.

### Strengths

- **Multiple plateaus, multiple nudges.** A player who plateaus at 75% has Bronze and is working toward Silver. A player at 88% has Silver and is working toward Gold. Each tier provides a near-term goal.
- **Content reward at Silver.** The modifier system gives players *new gameplay* for pushing past 80%, not just a shinier medal. This is qualitatively different from a cosmetic-only reward.
- **Low progression gate.** Bronze at 70% means almost no one is blocked. The campaign serves its narrative function for all players.
- **Visible mastery gradient.** The campaign map becomes a portfolio of the player's skill — some provinces bronze, some gold, the few perfects glowing brightest. A single glance tells the story of the player's journey.

### Weaknesses

- **Complexity overload.** Four tiers, modifier unlocks, leaderboard entries — this is a lot of systems for a 10-mission campaign. Each system needs UI, explanation, and onboarding. A player who just wants to play the campaign now has to parse medal thresholds, modifier descriptions, and leaderboard mechanics.
- **Bronze feels like failure.** Even though Bronze unlocks the next mission, a player who sees "BRONZE" stamped on their province knows it's the lowest tier. The name itself connotes third place. "You passed, but barely" is the subtext, even if the game doesn't intend it.
- **Modifier quality burden.** Each mission needs a hand-designed modifier that's genuinely interesting, not just "harder." That's 10 additional challenge variants to design and balance — effectively 50% more content.

---

## Option D: "The Social Mirror with Gentle Gates" — Histogram-Driven Dynamic Thresholds

### How It Works

Instead of fixed percentage thresholds, the game uses the player population's performance to set dynamic expectations. After completing a mission, the player sees the Zachtronics-style histogram showing where their pass rate lands among all players. The campaign progression gate is set at the **25th percentile** — you must perform better than the worst quarter of successful completions.

In practice, this means early missions (where most players score 90%+) have effective gates around 85%, while later missions (where most players score 70-80%) have gates around 65%. The gate adapts to difficulty: harder missions have lower thresholds because the game knows fewer people ace them.

For the 100% cosmetic layer, the game tracks the **top 5% of each histogram** and grants a "Top Architect" badge to anyone who reaches it. This badge appears next to the mission on the campaign map — a small cyan diamond that pulses softly. The player doesn't need to be the best — they need to be among the best.

### Strengths

- **Self-calibrating difficulty.** The gate naturally adjusts to each mission's difficulty. No need to hand-tune thresholds.
- **Social context for mastery.** "You're in the 82nd percentile" is more meaningful than "you scored 85%." The player knows where they stand relative to the community, not just relative to a fixed number.
- **Avoids the 89% cliff.** Since the gate is percentile-based, there's no single number to fixate on. The threshold shifts with the population.

### Weaknesses

- **Requires population data.** For a single-player web game, this means phoning home with scores. Privacy concerns, offline play breaks it, small player counts create noisy distributions.
- **Moving goalposts.** If the player base gets better over time, the effective gate rises. A player who was at the 30th percentile six months ago might be at the 20th percentile now — below the gate — without changing anything. This feels deeply unfair.
- **Opaque to the player.** "Score above the 25th percentile" is harder to understand and target than "score 90%." Players can't plan for a percentile; they can plan for a number.

---

## Player Journeys

### Journey: Maya, 28, UX Designer and Casual Puzzle Player

**Context:** Maya has completed Missions 1-5, scoring between 75% and 85% on each. She's on Mission 6, which introduces the Command agent. The game uses Option B (90% gate). She scored 82% on her first attempt of Mission 6.

**Minute 0:00 — The Debrief Wall**
The sealed watch ends. Maya's forces won — barely. Two scouts eliminated, one relay overloaded on tick 18, but the enemy base fell on tick 31 of 35. The inspector opens. A large circular gauge dominates the top of the debrief panel: **82%**. The ring is filled with cyan up to the 82% mark, then a dim dashed outline continues to 90%, where a gold tick mark sits. Above 90%, the outline continues to 100% with a white tick mark. The visual is immediate: she's in cyan territory, she needs to reach gold.

Below the gauge, three breakdown bars:
- Units Surviving: 4/6 (67%) — amber bar, two skull icons for the lost scouts
- Enemies Eliminated: 12/12 (100%) — full green bar
- Information Efficiency: 79% — amber bar with a tooltip: "31% of context window capacity was unused across all units"

Maya clicks the units surviving bar. The inspector zooms to tick 14, where Scout-2 was eliminated. The decision trace shows: Scout-2 was on patrol, entered a tile adjacent to an undetected enemy striker, and was eliminated before it could evade. The context window replay shows Scout-2's buffer had no entry about the enemy — no other unit had transmitted a warning.

**Minute 1:30 — The Diagnosis**
Maya traces the problem: Scout-1 was on the opposite side of the map and never detected the enemy in Scout-2's quadrant. The relay was listening to both scouts but only compressing and forwarding signals from Scout-1 because Scout-2's hook was transmitting on channel "recon-alpha" while the relay was listening on "recon-net." A channel naming mismatch — Scout-2 was broadcasting into the void.

"Oh." Maya mutters. She sees it now. The information efficiency score makes sense too — Scout-2's context window was filling up with its own observations that it was dutifully transmitting to no one, while the relay's listen slots for "recon-alpha" sat empty for the entire battle.

**Minute 3:00 — The Fix Attempt**
Maya clicks RETRY. The plan screen loads with her previous configuration. She opens Scout-2's hook panel and changes the channel from "recon-alpha" to "recon-net" to match the relay's listener. She also notices that her Command agent has 3 unused hook slots — she adds a hook that listens on "recon-net" and retransmits on "priority-alert" when the signal contains a threat within 2 tiles of any friendly unit. This is her first attempt at a multi-hop signal chain.

She hits EXECUTE.

**Minute 5:30 — The Second Debrief**
The sealed watch is visibly better. Both scouts survive. The relay is actively compressing signals from both quadrants. But the Command agent overloaded on tick 22 — too many signals arriving simultaneously from two scouts plus the relay's compressed output. It stunned for one tick, and a striker missed its window to intercept an enemy that destroyed a forward relay.

The gauge reads: **88%**. The cyan fill stretches almost to the gold line. Almost. Two percent short. Maya sees the breakdown: Units Surviving 5/6 (83%), Enemies Eliminated 12/12 (100%), Information Efficiency 82%.

The 88% stings more than the 82% did. She's close enough to taste it.

**Minute 7:00 — The Insight**
Maya opens the Command agent's context window replay. At tick 22, all 14 slots are occupied. The eviction priority is set to "oldest first," which means the Command agent evicted early scout reports to make room for new ones — but those early reports contained the initial threat assessment that the striker's rule was using to plan its route. When the old data was evicted, the striker's next decision was made with incomplete information.

She goes back to the plan screen. In the Command agent's context config, she changes the eviction priority from "oldest first" to "lowest threat level first." Now routine observations are evicted before threat assessments, preserving the data the striker needs.

**Minute 9:00 — The Breakthrough**
Third attempt. The gauge reads: **94%**. Gold territory. The ring fills with warm gold light up to the 94% mark. The campaign map transition animation plays — Mission 7's province brightens from dim to available, a data cable connecting it to Mission 6's node pulses once with traveling light.

Maya grins. She glances at the 100% mark on the gauge. Six percent away. The white starburst icon sits there, faintly glowing, inviting. She could chase it. She could also move on to Mission 7.

She moves on. But she bookmarks Mission 6 in her mind. She'll be back.

**UI Annotations:**
- **Pass rate gauge:** Circular ring, top-center of inspector debrief. Cyan fill (0-89%), gold fill (90-99%), white starburst at 100%. Dashed outline shows remaining progress. Gold tick mark at 90% is always visible. Animated fill on first display.
- **Breakdown bars:** Three horizontal bars below gauge. Color-coded (green >90%, amber 70-89%, red <70%). Clickable — clicking a bar navigates the inspector to the most relevant moment for that metric.
- **Campaign map transition:** 0.5-second animation. Locked province brightens. Data cable between provinces pulses with a traveling light particle. Subtle chime sound (two ascending notes, like a system coming online).
- **100% starburst:** Sits at the end of the gauge ring, faintly pulsing even when not achieved. Visual promise of what's possible. Does not obstruct or distract — just present.

---

### Journey: Riku, 34, Software Engineer and Zachtronics Veteran

**Context:** Riku has completed all 10 missions with scores ranging from 91% to 97%. He's on the campaign map, which shows all provinces lit up in gold. No perfect scores yet. The game uses Option B (90% gate). Riku has finished the campaign and is now in the post-campaign optimization phase.

**Minute 0:00 — The Incomplete Map**
Riku stares at the campaign map. Ten provinces, all gold. The data cables between them pulse steadily. It's beautiful — but it's not *done*. He can see what "done" looks like because Mission 3 (Palawan, jungle terrain) has a faint shimmer at its border that the others don't — he scored 97% there, the closest to perfect. The white starburst icon on each province is dim, waiting.

He clicks Mission 7 (Mindanao, jungle). His best score: 91%. The lowest of the campaign. The inspector replay loads, showing his best run. He scrubs to tick 8, where the first leak happened.

**Minute 1:00 — The Forensic Hunt**
Mission 7 has three enemy spawners spread across the map, each producing scouts and strikers on staggered timers. Riku's architecture handles two spawners perfectly but the third — in the northeast corner — consistently produces units that reach his relay network before his scouts detect them. The problem: his scout patrol routes create a 3-tick detection gap in the northeast every 12 ticks.

He opens the plan screen. His scout has a patrol skill configured with a route that covers the south and west sides of the map. Adding a northeast leg would fix the gap, but the patrol skill only supports 4 waypoints and all 4 are occupied. He'd need to remove a southern waypoint, which would create a gap in the south.

"This is a coverage problem," he thinks. "One scout can't patrol the whole perimeter with 4 waypoints."

**Minute 3:00 — The Architecture Rethink**
Riku's first instinct was to tweak waypoints — the 91% instinct, the instinct that got him this far. But 91% to 100% requires something different. He needs a second scout. But his production queue is full — factory capacity is limited, and he needs every striker for the three-front battle.

He looks at his relay. It's stationary, compressing signals. But what if the relay's compression was more aggressive? If the relay compressed two scout reports into one before forwarding, the command agent's context window would have more room, and the striker could react faster. Faster reaction means fewer strikers needed. Fewer strikers means room for a second scout in the production queue.

This is the cascade that 100% demands — not tweaking one component, but rethinking the whole system. The improvement in one area (relay compression) enables an improvement in another (production allocation) which enables an improvement in a third (patrol coverage). It's the factory-that-builds-the-factory thinking.

**Minute 8:00 — The Attempt**
Riku rebuilds: two scouts with complementary patrol routes (north/east and south/west), one relay with aggressive compression (2:1 ratio instead of passthrough), one fewer striker, and a command agent whose rules prioritize threats by proximity rather than detection order. He hits EXECUTE.

The sealed watch is tense. The two-scout setup means better coverage but each scout is more isolated — if one goes down, half the map goes dark. On tick 16, an enemy striker crosses the northeast corner. Scout-2 detects it immediately (the gap is closed), transmits on "recon-net," the relay compresses and forwards to the command agent, which routes to the nearest striker. The striker arrives on tick 19 — three ticks of latency, perfectly within the engagement window.

The battle ends on tick 28. All units survive. All enemies eliminated. Zero wasted context slots on the command agent (the aggressive compression kept it lean).

**Minute 10:00 — The Starburst**
The gauge fills: **100%**. The ring doesn't just fill with white — it *detonates*. The ring expands slightly, emits a brief ring of particles, then settles into a steady white-gold glow. A boot log entry types itself across the bottom of the screen in monospaced green text: "MISSION 7: ARCHITECTURE VERIFIED. ZERO INFORMATION LEAKAGE. SYSTEM NOMINAL."

On the campaign map, Mission 7's province transforms. The gold fill deepens, and a circuit-board pattern etches itself across the province silhouette. Tiny data pulses flow through the circuit traces. The change is permanent — the province will look like this forever.

In the Blueprint Codex, the two scout blueprints and the relay blueprint he used gain small gold diamonds next to their names. These diamonds mean "used in a perfect architecture." Over time, Riku's codex will show which blueprints have proven themselves in 100% completions — a collection within the collection.

Riku looks at the campaign map. Nine gold provinces. One white-gold province. He clicks Mission 4 — next target.

**UI Annotations:**
- **100% detonation:** 1-second particle burst from the gauge ring. Ring expands 10% then contracts to normal. Gold-white particles radiate outward and fade. Sound: a deep resonant chime, like a server rack powering up, followed by a high crystalline ping.
- **Boot log entry:** Types character-by-character across the bottom of the inspector screen. Green monospaced text on dark background. Takes 3 seconds to type. Disappears after 5 seconds. Saved in the mission's permanent inspector view.
- **Province transformation:** Circuit-board pattern animated over 2 seconds. Each trace line draws itself from the center outward. Data pulses begin flowing 1 second after traces complete. The province's glow intensifies by approximately 20%.
- **Codex diamond:** Small gold diamond icon (8x8 pixels) appears next to blueprint name in the Blueprint Codex. Tooltip on hover: "Used in a Perfect Architecture — Mission 7."

---

### Journey: Dani, 22, College Student, First Strategy Game

**Context:** Dani is on Mission 4, the last tutorial mission before the factory is introduced. They've scored between 70% and 78% on Missions 1-3, consistently hitting the plateau just below the 90% gate. The game uses Option C (Tiered Medal System). Dani has Bronze on all three missions.

**Minute 0:00 — The Bronze Wall**
Dani stares at the campaign map. Three provinces, each with a bronze gear emblem. The visual is functional but plain — bronze gears don't glow, don't pulse, don't animate. They just sit there, dull brown-copper against the dark map. Mission 4 is unlocked (Bronze only requires 70%), but the map makes Dani feel like they're scraping by.

They've noticed other things. The Blueprint Codex has empty slots with "Silver Modifier" labels — content they can't access because they've never hit 85%. The campaign map has tooltip text on each province: "BRONZE — Architecture functional. Silver unlocks SIGNAL STORM variant." Dani has never seen a Silver variant. They don't even know what a modifier does.

"Maybe I should go back and try to Silver Mission 1," they think.

**Minute 1:00 — Returning to Mission 1**
Mission 1 is the simplest — a single scout, a single striker, 4 enemies on a small section of the 8x8 board. Dani scored 74% the first time. They click the mission and select REPLAY. The plan screen loads with their original configuration.

Dani opens the inspector from their best run. They scored 74% because the scout detected 3 of 4 enemies but missed one that approached from the east — outside the scout's perception arc during its patrol loop. The striker eliminated 3 enemies but the fourth reached the base on tick 20.

The fix is simple: adjust the scout's patrol to swing east on the return leg. Dani makes the change and hits EXECUTE.

**Minute 3:00 — The Silver Surprise**
The gauge reads: **92%**. Silver. The mission node on the campaign map transforms in real time — the bronze gear dissolves and a silver circuit emblem fades in, pulsing with a soft blue-white light. A notification slides in from the bottom: "SILVER UNLOCKED — SIGNAL STORM variant now available for Mission 1."

But more importantly, Dani *felt* the difference. The sealed watch was clean — all enemies detected, all enemies eliminated, no near-misses. The gap between 74% and 92% was one patrol waypoint change, but the battle looked completely different. The scout was calm, methodical, covering the whole board. The striker acted on reliable intelligence instead of stumbling into enemies.

"That's what good architecture feels like," Dani realizes. Not a higher number — a calmer battle.

**Minute 4:00 — The Modifier**
Curiosity wins. Dani clicks "SIGNAL STORM" on Mission 1's province. A tooltip explains: "Ambient electromagnetic noise fills all context windows 2 slots faster. Your agents must work with less working memory. Design tighter filters." The modifier icon is a crackling static overlay on the province.

Dani selects it. The plan screen loads, but now each unit's context window capacity is reduced by 2 slots (the scout goes from 6 to 4, the striker from 8 to 6). The constraint forces Dani to think about what information is *essential* vs. what's *nice to have*. The scout's context config has listen filters — Dani toggles off "terrain observation" and "ambient scan," keeping only "enemy detection" and "allied position."

This is the first time Dani has engaged with context configuration meaningfully. The Silver modifier taught them something that 10 more Bronze runs wouldn't have.

**Minute 8:00 — The New Plateau**
Dani scores 78% on the Signal Storm variant — a Bronze medal for the modifier. But they don't care about the medal. They're thinking about Mission 2 now, where their 72% score was partly due to context overload on the relay. "If I apply what I just learned about filtering..."

They're past the plateau. Not because the game forced them to score 90%, but because the Silver modifier *changed what they were optimizing for*. The plateau at 75% was a plateau of understanding — they didn't know what they didn't know. The modifier revealed the gap.

**Minute 10:00 — The Return Trip**
Dani revisits Mission 2 with fresh understanding. The relay's context config gets proper filters. Score: 87%. Silver. Another modifier unlocked. The campaign map now shows one bronze and two silver provinces. The visual progression is tangible — the silvers glow, the bronze doesn't. Dani wants their map to glow.

They won't chase Gold (95%) — not yet, maybe not ever. But Silver is within reach, and the modifiers make reaching it *fun*, not just *obligatory*. The tiered system met them where they were and gave them something to grow toward without demanding perfection.

**UI Annotations:**
- **Bronze gear emblem:** 24x24 pixel icon, dull copper color (#B87333), no animation, no glow. Sits on the province node. Tooltip: "BRONZE — Architecture functional."
- **Silver circuit emblem:** 24x24 pixel icon, blue-white (#C0C0C0 with #6699CC glow), soft pulse animation (1.5s cycle). Tooltip: "SILVER — Architecture robust. Modifier unlocked."
- **Modifier notification:** Slides up from bottom of screen, dark panel with cyan border, icon of the modifier (static crackling for SIGNAL STORM), 3-second display then fades. Clickable — opens modifier details.
- **Modifier selection:** On the campaign map, Silver+ provinces show a small toggle icon. Clicking opens a panel listing available modifiers with descriptions. Selecting a modifier changes the province's visual overlay (static for SIGNAL STORM, fog for GHOST FACTORY, clock for TICK PRESSURE).

---

### Journey: Cole, 41, Project Manager, Completionist

**Context:** Cole has finished the campaign with Option A (Zachtronics Split — any win progresses, histograms only). All 10 missions complete. He scored between 72% and 88% across missions. He's looking at the campaign map — all 10 provinces are lit, all identical. There's nothing to distinguish his 88% Mission 3 from his 72% Mission 9.

**Minute 0:00 — The Flat Map**
The campaign map shows ten lit provinces connected by data cables. They all look the same. Cole knows his scores vary wildly — his Mission 3 was elegant, his Mission 9 was a mess — but the map treats them identically. Both are "completed."

He opens the inspector for Mission 3. Three histograms appear: Units Surviving, Ticks to Completion, Signal Waste. His markers sit at the 65th, 70th, and 55th percentile respectively. Above average on two metrics, below average on one. Decent, but not remarkable.

Cole looks at the histogram distribution. The right edge — the top percentile — shows a cluster of players who achieved near-perfect scores. The gap between his marker and that cluster feels vast. He'd need to improve signal waste by 40% to join them. That's not a tweak — that's a redesign.

**Minute 2:00 — The Motivation Question**
Cole tabs over to Mission 9. His histograms show 30th, 25th, 40th percentile. Below average on everything. He knows why — his Command agent's rules were poorly ordered, causing the wrong striker to respond to threats half the time. The inspector even highlights the exact ticks where rule priority mattered.

But here's the problem: he already won. Mission 10 is complete. The campaign is "done." There's no gate, no medal, no reason to return except his own dissatisfaction with being at the 30th percentile. For Cole — a completionist who thrives on checklists and tangible goals — the histograms offer information but not motivation. He can see he's below average, but there's no checkbox to tick, no achievement to unlock, no visual reward for improving.

"What's the point?" he thinks. Not in a defeatist way — in a genuinely confused way. The game gave him everything (the complete campaign) and now expects him to generate his own reasons to continue. He's not that kind of player.

**Minute 4:00 — The Drift**
Cole closes the game. Not in frustration — in completion. He "finished" the campaign. The histograms told him he could do better, but they didn't give him a reason to. He never returned to optimize. His campaign map stays flat — ten identical provinces, no visual record of the quality of his journey.

If the game had used Option B or C, this moment would be different. A 90% gate would have forced him to engage with Mission 9's flaws before finishing. A medal system would have given him bronze medals to upgrade — a visible, tangible, checklistable goal. The histogram told him *where* he stood; it never told him *what to do about it*.

**UI Annotations:**
- **Histogram position marker:** Bright cyan vertical line on the histogram. Tooltip shows exact percentile. Previous attempt markers shown as faded cyan lines (up to 3 previous attempts visible).
- **Histogram heat zones:** Bottom 25% of distribution is tinted faint red. Middle 50% is neutral. Top 25% is tinted faint gold. Top 5% is tinted bright gold with a subtle sparkle. The player's marker inherits the zone's tint.
- **Campaign map (no differentiation):** All completed provinces are identical — same cyan glow, same static data cables. No visual record of score quality. The map reads as "all done" regardless of performance.

---

## Comparable Games and Precedent

### Zachtronics (SpaceChem, Opus Magnum, Shenzhen I/O)

The Zachtronics model is the purest "any solution progresses" system in puzzle gaming. The histograms replaced traditional leaderboards specifically because Zach Barth observed that leaderboards discourage 99% of players while motivating only the top 1%. Histograms show the full distribution, which tells every player "you're somewhere in the middle, and here's what better looks like." This is psychologically gentler than a leaderboard ranking.

However, Zachtronics games have a self-selecting audience — people who buy SpaceChem are already intrinsically motivated puzzle solvers. Robot Uprising aims for a broader audience ("accessible to someone who's never played a strategy game"), which means relying on intrinsic motivation alone may not be sufficient.

### Angry Birds (Star Gating)

Angry Birds popularized the 3-star system where 1 star unlocks the next level and 3 stars unlock bonus content. The key insight: **1 star is trivially achievable** (you just need to complete the level), while 3 stars requires genuine optimization. This creates two parallel games — the progression game (clear levels) and the mastery game (earn stars). Most players play the progression game. Completionists play both.

The weakness: the 1-star gate is so low that most players never engage with optimization at all. The game's deepest puzzles (getting 3 stars on hard levels) are experienced by a small minority. Robot Uprising can't afford this — the whole point is that the deep architecture design IS the game.

### Into the Breach

Into the Breach uses building grid power as its progression currency. Grid power functions as a health bar for the entire campaign — lose buildings and you lose grid power, lose all grid power and the run ends. Crucially, you can complete islands at reduced power and still progress, but each building lost makes future islands harder. This creates a natural "pass rate" system: a sloppy island doesn't gate you, but it degrades your resources for later.

The scoring system (up to 30,000 for a perfect hard-mode run) is entirely separate from progression. Score unlocks nothing — it's a pure bragging-rights number. The perfect run, with zero buildings lost across all islands, is the self-imposed challenge that Into the Breach's community organizes around.

### Celeste

Celeste's B-sides and C-sides are locked behind collectible strawberries found in the main levels. Getting *some* strawberries is easy; getting *all* of them requires mastery-level play. The B-sides (remixed, harder versions of each level) serve the same role as Option C's Silver modifiers — bonus content that rewards and further develops mastery.

Crucially, Celeste's main campaign never requires strawberries. The A-sides are completable without collecting a single one. The strawberries and B-sides are a parallel progression track for players who want more challenge. The game explicitly tells you: "You don't need to do this. But if you want to, here it is."

---

## Interaction Effects

### With the Inspector
The pass-rate threshold directly controls how much players use the inspector. At a low gate (any win), the inspector is optional — players can skip the analytical phase and retry by instinct. At 90%, the inspector becomes essential. Players *need* the decision trace and context window replay to diagnose the specific failures preventing them from crossing the threshold. This makes the inspector's design quality load-bearing — if the inspector is confusing or incomplete, the 90% gate becomes a source of frustration rather than learning.

### With Invisible Randomization
The randomization variance must be calibrated against the gate threshold. If the gate is 90% and a given architecture produces results between 82% and 95% depending on the run, the player experiences the gate as a dice roll — sometimes they pass, sometimes they don't, with the same setup. This is toxic. The variance for any given architecture should be narrow enough (plus or minus 3-5%) that a player who crosses the threshold has genuinely improved their design, not just gotten lucky.

### With the Blueprint Codex
If 100% completion earns codex sigils (Option B) or gold medals (Option C), the codex becomes a trophy case. Players browse their collection and see which blueprints have earned marks of excellence. This adds a second layer of motivation — not just "beat the mission perfectly" but "prove this blueprint is capable of perfection." A blueprint that's earned gold sigils on multiple missions feels proven, reliable, worth keeping.

### With the Campaign Map Aesthetic
The campaign map is the most visible surface for showing mastery progression. In Option A, all completed provinces look identical — the map tells you nothing about quality. In Options B and C, the map becomes a gradient from dim bronze to blazing white-gold, and the visual difference is immediately legible. A single glance at the map tells the story: "I've mastered these provinces, I'm working on these, I've barely passed these." This is the at-a-glance status that the PROMPT.md calls for — the TikTok clip of someone's campaign map, every province at white-gold, circuit traces pulsing with data, is a 15-second flex.

### With the 10-Mission Structure
Ten missions is short. If the gate is too high, players stall and never see the late-game content (factory-vs-factory in Missions 8-10, the payoff of the whole system). If the gate is too low, players finish in one session and never engage with the depth. The recommended approach (Option B's 90% gate or Option C's Bronze-at-70% with Silver modifiers) preserves access to all content while incentivizing deeper engagement.

---

## Recommendation: The Hybrid — "Bronze Progresses, Gold Glows"

The strongest design combines elements from Options B and C:

1. **70% unlocks the next mission** (Bronze/progression gate). No player is ever blocked from experiencing the campaign. This is sacred — the narrative arc and the mechanical arc (tutorial missions through factory-vs-factory) must be accessible to everyone.

2. **90% earns a visual distinction on the campaign map** (Gold glow). The province transforms from a basic lit node to a pulsing, circuit-traced showcase. This is the primary mastery reward — visible, permanent, aesthetically gratifying.

3. **100% earns a starburst + codex sigils + a boot log entry** (Perfect marker). The obsessive player's reward. Cosmetic-only, leaderboard-visible, deeply satisfying but never required.

4. **Histograms appear in the inspector regardless of threshold** (Social mirror). Even at 100%, the player can see where they stand on ticks-to-completion and signal waste compared to other perfect completions. The optimization rabbit hole has no bottom.

5. **No Silver modifiers in the base design.** While Option C's modifiers are compelling, they multiply the content burden and add complexity. Save modifiers for a post-launch "New Game+" mode or community challenge system. The 10-mission campaign should be clean and focused.

This hybrid gives players three natural stopping points — "I finished the campaign" (70%), "I mastered the campaign" (90%), and "I perfected the campaign" (100%) — each with distinct visual feedback and each feeling like a genuine achievement rather than a stepping stone. The plateau at 80% is addressed by the 90% gate being visible and inviting, not by the 70% gate being punishing.

The psychological key: **the game never says "you failed."** It says "you passed" (70%), "you excelled" (90%), or "you perfected" (100%). Every threshold is a positive label. Bronze isn't failure — it's completion. Gold isn't expectation — it's excellence. The pass-rate plateau dissolves not because the game demands more, but because it shows the player that more is possible and makes the "more" visible, beautiful, and worth wanting.

---

## Sensory Design

### The 90% Threshold Moment
When the pass-rate gauge crosses 90%, the cyan fill transitions to gold over 0.3 seconds — not a snap, but a warm bloom, like sunrise reaching a ridge line. A two-note chime sounds: the first note is the standard mission-complete tone (mid-range, clean), the second note is a perfect fifth above it (bright, resonant, implying "and then some"). The gold color is warm (#D4A017) with a subtle inner glow, distinct from the functional cyan of sub-90% scores.

### The 100% Detonation
When the gauge hits 100%, the gold completes its ring and then the entire gauge briefly inverts — white center, dark ring — before settling into a steady white-gold glow with particle effects. A deep resonant tone sounds, like a massive system activating, followed by a high crystalline ping that fades over 2 seconds. The boot log entry types itself in green monospaced text at the bottom of the screen. The feeling is not "congratulations" — it is "SYSTEM VERIFIED." Clinical. Mechanical. Appropriate for an AI that has just proven its architecture is leak-proof.

### The Campaign Map Gradient
A campaign map at mixed completion levels reads like a city at dusk — some buildings lit, some still catching the last light, some dark. Bronze provinces are dim copper, functional but unadorned. Gold provinces pulse with warm light and circuit traces, alive with data flow. Perfect provinces blaze white-gold with bioluminescent aurora effects at their borders, as if the data flowing through them is so clean it literally glows. The contrast between a bronze province and a perfect province, sitting side by side on the archipelago, is the visual story of the player's growth.

### The Histogram Whisper
The histograms in the inspector are deliberately understated — thin lines, muted colors, small markers. They don't compete with the pass-rate gauge for attention. They're ambient, background, the kind of information you notice on your third visit to the inspector, not your first. The player's marker is a bright cyan pip; the distribution is a soft gray mountain. The top 5% zone has a barely visible golden shimmer. The histograms whisper where the gauge shouts.
