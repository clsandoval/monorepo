# 8.06 — The "First Ugly Solution" as Tutorial Completion

**Aspect ID:** 8.06
**Wave:** 8 (Cross-Cutting Synthesis)
**Category:** Onboarding
**Related aspects:** 1.03 (Opus Magnum histograms), 5.13a (spawn storm designed failure), 7.06 (histogram system), 5.04a (Mission 5 wall), 5.01 (tutorial as puzzle), 5.10 (product as puzzle), 2.00h (solved-game mitigations), 5.09a (Doctrines/constraint ratchet), 3.06 (rule conflicts), 8.07 (robustness vs. efficiency tension), 5.00 (external documentation anti-pattern)

---

## The Design Question

**What if "winning ugly" is the intended tutorial outcome — and every mission in the campaign is designed to be beatable by brute-force, inelegant agent configurations, so that the histogram and Inspector become the real teachers instead of tutorial prompts?**

This is the Opus Magnum principle: the game never requires optimization. It only requires *completion*. Your sprawling, wasteful, spaghetti agent architecture that wins Mission 4 by flooding the board with scouts is a **valid solution**. You pass. You move on. But the histogram shows you where you sit — and the Inspector shows you *why*. The teaching happens through self-motivated curiosity after success, not through gated failure before it.

The radical implication: **Robot Uprising's tutorial system is not the boot log, not the vocabulary pacing, not the designed failures. The tutorial system is the histogram.** Everything else is onboarding. The histogram is where learning actually lives.

---

## The Principle: "Make It Work, Then Make It Right"

### The Zachtronics Precedent

Opus Magnum never gates progression on solution quality. A machine that uses 47 arms, costs 890 gold, and takes 340 cycles to produce one molecule of healing salve is **equivalent** to a machine that uses 3 arms, costs 45 gold, and runs in 22 cycles — for the purpose of advancing the campaign. Both unlock the next puzzle. The difference is visible only in the histogram: three vertical lines showing cost, cycles, and area, with the player's position marked against the global distribution.

The psychological sequence is:
1. **Relief** — "I solved it!" (dopamine)
2. **Curiosity** — "Where did I land?" (histogram appears)
3. **Surprise** — "Oh, I'm in the 90th percentile for cost..." (social comparison)
4. **Motivation** — "I bet I could shave off those extra arms..." (self-directed optimization)
5. **Return** — Player voluntarily revisits a solved puzzle with no external pressure

This sequence is **the most powerful teaching loop in puzzle game design** because the learner chooses to learn. There is no lecture. There is no "you should optimize this." There is only a mirror showing you where you stand.

### Why This Matters More for Robot Uprising

In Opus Magnum, the optimization dimensions are legible: cost (count your arms), cycles (watch the clock), area (see the footprint). In Robot Uprising, the optimization dimensions are *architectural* — signal latency, context utilization, EM exposure, production efficiency, robustness across variants. These are harder to see, harder to feel, harder to name. A brute-force config that wins by flooding scouts doesn't obviously *look* worse than a lean three-unit intelligence pipeline that wins by precision.

This makes the histogram + Inspector combination **even more essential** than in Opus Magnum. The player needs both:
- **The histogram** to know they *can* do better (social proof)
- **The Inspector** to understand *how* they can do better (causal trace)

Without the "first ugly solution" philosophy, the game would need to teach optimization through gated failure — "your solution isn't good enough, try again." That's the traditional tutorial approach, and it's hostile. It says: "you're wrong." The histogram says: "you're right, and here's how right."

---

## The Five "Ugly Solution" Archetypes

Every mission in Robot Uprising should be winnable by at least one of these brute-force approaches. The brute-force path is the **floor** — it's how a player who doesn't understand the nuance still progresses.

### Archetype A: "The Swarm" (Quantity Over Quality)

**What it looks like:** Player configures one simple blueprint (scout or striker with default rules) and queues it repeatedly. No hooks, no channels, no inter-unit communication. Each unit acts independently based on its own perception.

**Why it works:** On easier missions (M1-M5), raw unit count can overwhelm enemies. Eight uncoordinated strikers that each independently walk toward the nearest enemy will, through sheer numbers, eventually stumble into the enemy base.

**Why it's ugly:** No intelligence architecture. No information sharing. Units duplicate effort (three scouts investigating the same tile). High casualties from context overload (no filters configured = everything fills the buffer = frequent stuns). High EM signature from default hook settings. Enormous material cost.

**What the histogram reveals:** The player's "units produced" metric is 3× the median. Their "units lost" metric is 5× the median. Their "ticks to win" is in the 85th percentile. The shape of their failure mode is *visible* — they won, but they won expensively.

**What the Inspector reveals:** Click any unit. Its context window is full of redundant observations. Three scouts all observed the same enemy. Two strikers walked past each other heading to the same target while an unguarded flank was exposed. The decision trace for each unit shows reasonable local behavior — but no global coordination.

### Archetype B: "The Wall" (Static Defense)

**What it looks like:** Player places relays and strikers in a defensive formation around their base. No movement, no scouting. Units wait for enemies to come to them. Rules: "if enemy adjacent, attack." No other rules.

**Why it works:** On missions where enemies must path through the player's territory, a dense wall of strikers near the base will eventually kill everything that approaches. Relays compress and filter nothing — they just exist as extra bodies.

**Why it's ugly:** Zero intelligence. No scouting means no early warning. The wall can't adapt if enemies approach from an unexpected direction. Relays are wasted (configured as additional bodies rather than information infrastructure). The player wins by having more strikers than the enemy has units, not by outsmarting anyone.

**What the histogram reveals:** "Ticks to win" is very high (enemies take time to walk across the board). "Context utilization" is near zero (most units' buffers are empty because they're not perceiving anything useful). "Signal count" is zero. The player's solution is functionally a tower defense game with no towers.

**What the Inspector reveals:** Click any relay. Its context window is empty. It never processed a signal. It never compressed anything. It just... sat there. The relay's entire existence was wasted. This is the "dead code" moment — the player sees a unit they thought was useful doing nothing.

### Archetype C: "The Solo Hero" (One Over-Configured Unit)

**What it looks like:** Player pours all resources into one Command agent or one heavily-configured striker. Every skill equipped, maximum rules, all hook slots filled. One unit does everything. The rest are afterthoughts.

**Why it works:** A fully-loaded Command agent with reassign, reroute, and prioritize — plus a few basic scouts and strikers to command — can brute-force missions where one intelligent actor is enough.

**Why it's ugly:** Single point of failure. If the hero unit dies (one-shot-one-kill), the remaining units are lobotomized — they have no architecture of their own. The hero's context window overflows constantly because it's trying to process everything. EM emissions are concentrated in one tile, making the hero trivially detectable.

**What the histogram reveals:** "Peak context utilization" is 100% on one unit, <20% on all others. "EM concentration" is an extreme outlier. "Single point of failure score" (if such a metric exists) is maximum.

**What the Inspector reveals:** Click the hero. Its context window is a warzone — entries evicting entries every tick, decision trace showing which critical information was lost because the buffer was full. Click any other unit. Its context window is nearly empty, its rules are simple, its hooks are disconnected. The architecture's lopsidedness is *spatially visible* on the board: one unit glowing with activity, surrounded by inert shells.

### Archetype D: "The Copy-Paste" (Identical Blueprints)

**What it looks like:** Player creates one blueprint that's "pretty good" and assigns it to every unit type. Scouts, strikers, and relays all have the same rules, same hooks, same channel subscriptions. No specialization.

**Why it works:** A config that's decent for one context isn't terrible for others. If every unit has "move toward enemy" + "attack if adjacent" + "report sightings on channel-1," the army functions at a basic level.

**Why it's ugly:** No architectural differentiation. Scouts don't leverage their wide perception. Relays don't use compress or filter. Strikers waste time scouting when they should be engaging. Every unit is mediocre at everything, excellent at nothing.

**What the histogram reveals:** "Blueprint diversity" is 1 (all identical). "Skill utilization" shows that compress, filter, amplify, hack, and extract are all at 0% usage. The player used 4 of 12 available skills.

**What the Inspector reveals:** Click a relay. It's moving around the board — relays are stationary! Its rules say "move toward enemy" but it can't move. Three rule slots are wasted on impossible actions. The relay's unique skills (compress, filter, amplify) are unequipped. The difference between "what this unit *could* do" and "what this unit *does* do" is the teaching moment.

### Archetype E: "The Goldberg Machine" (Over-Engineered Mess)

**What it looks like:** Player has configured extensive hook chains, multiple channels, elaborate rules with many conditions — but the architecture is internally contradictory. Signals loop. Channels overlap. Rules fire in unexpected orders. It works because enough units survive the chaos to eventually kill enough enemies.

**Why it works:** Complex systems with many interactions sometimes produce accidentally effective behavior. A scout that's constantly stunned from overload might still stumble into useful positions. A signal chain that loops three times before reaching a striker still reaches it — just late.

**Why it's ugly:** The architecture works *despite* itself, not because of itself. Remove any random component and it might still work. Add any random component and it might break. It's not designed; it's accreted.

**What the histogram reveals:** "Signal chain length" is an extreme outlier. "Context overload events" is very high. "EM emissions" are through the roof. But "ticks to win" might actually be reasonable — the chaos produces activity that happens to be effective.

**What the Inspector reveals:** Signal genealogy shows tangled spaghetti. The decision trace for any given unit shows it responding to signals from 3 ticks ago that have been compressed, re-amplified, and re-routed through two relays. The player *thinks* their system is clever. The Inspector shows it's a Rube Goldberg machine where the ball happens to land in the cup.

---

## The Histogram as Teacher

### What Robot Uprising's Histogram Must Show

The histogram system (see 7.06) is the primary teaching mechanism in the "first ugly solution" philosophy. For each completed mission, the player sees their position on multiple axes against the global population:

| Metric | What It Measures | What "Ugly" Looks Like | What "Elegant" Looks Like |
|--------|-----------------|----------------------|--------------------------|
| **Ticks to win** | Speed of victory | 85th percentile (slow) | 15th percentile (fast) |
| **Units produced** | Army size | 3× median (wasteful) | 0.5× median (lean) |
| **Units lost** | Casualty rate | 5× median (bloody) | 0× (flawless) |
| **Context overloads** | Buffer management | Many (chaotic) | Zero (clean) |
| **Signal count** | Communication volume | 0 (silent) or extreme (noisy) | Moderate (efficient) |
| **EM emissions** | Stealth | High (exposed) | Low (stealthy) |
| **Blueprint diversity** | Architectural variety | 1 (copy-paste) | 3-5 (specialized) |
| **Skill utilization** | How many skills used | 3/12 (underusing) | 8-10/12 (full toolkit) |

The critical UX decision: **which metrics are shown immediately and which are discoverable?**

#### Option 1: "The Full Panel" — Show Everything

All 8 metrics appear in a vertical stack of histograms after every mission. The player scans them like a medical report. Overwhelming for beginners, but nothing is hidden.

*Risk:* Information overload. The player who just beat their first mission sees eight graphs they don't understand and ignores all of them.

#### Option 2: "The Spotlight" — Show One, Tease the Rest

One histogram is highlighted based on where the player deviates most from the median. "YOUR CONTEXT OVERLOADS: 14 [histogram showing player at 95th percentile]." The other metrics are visible but dimmed, with labels only.

*Advantage:* Focused attention. The player has one clear signal: "this is where you're unusual." They can explore the rest when curious.

*Risk:* The highlighted metric might not be the one the player cares about.

#### Option 3: "The Unlocking Curriculum" — Progressive Metric Reveal

Mission 1 shows only "ticks to win." Mission 2 adds "units lost." Mission 3 adds "context overloads." By Mission 10, the full panel is available. Each new metric is introduced with a one-line explanation in the debrief.

*Advantage:* Mirrors the vocabulary pacing curve (5.04b). Players learn to read one histogram before seeing two.

*Risk:* Veterans who already understand metrics are forced through a slow reveal.

#### RECOMMENDED: Option 2 + Option 3 Hybrid — "The Diagnostic Spotlight"

Progressive unlock determines *which metrics exist*. The Spotlight determines *which gets attention*. Mission 1 has two metrics (ticks, units lost); the spotlight highlights whichever the player deviates more on. By Mission 10, eight metrics exist and the spotlight picks the most actionable. **The spotlight always answers one question: "what could you improve most?"**

### The Histogram Population Problem

The histogram only works as a teacher if the population is meaningful. A histogram that shows the player at the 50th percentile against 12 beta testers is useless. The population needs:

- **Launch seeding:** Developer playthroughs + AI benchmark runs provide synthetic baselines (disclosed as "AI solutions" with a robot icon, not disguised as human). See 7.06b.
- **Segmentation:** Campaign mode shows campaign-player population. Gauntlet shows Gauntlet population. Beginners don't see grandmaster data skewing their percentile.
- **Decay:** Old solutions don't persist forever. A 6-month-old meta-optimal solution shouldn't anchor the histogram when the meta has shifted (especially post-seasonal-modifier changes).

---

## Mission-by-Mission "Ugly Solution" Floor

Every mission must have a documented brute-force path — the simplest configuration that wins. This is a design constraint, not an accident.

| Mission | Setting | Ugly Floor | Why It Works | What Histogram Teaches |
|---------|---------|-----------|-------------|----------------------|
| M1 (Ifugao) | Pre-placed scouts | Do nothing — default config wins | Default perception + rules handle the tutorial scenario | "You won, but look how many ticks it took" |
| M2 (Siquijor) | Pre-placed scout + striker | Give striker "attack anything" rule | One striker can kill everything on a small board | "Your scout saw nothing useful" (signal count = 0) |
| M3 (Palawan) | Pre-placed + first hooks | Wire one hook: scout→striker "enemy spotted" | A single channel is enough for a small engagement | "Your messages arrived 2 ticks late" (latency) |
| M4 (Batanes) | Full rule system | Copy scout config to all units | Generic config handles simple enemies | "3 of your 5 rules never fired" (dead rules) |
| M5 (Cebu) | Factory introduced | Queue 8 strikers, no blueprinting | Raw striker spam overwhelms | "You built 3× more units than median" |
| M6 (Manila) | Command agent | One command agent with basic reassign | Single meta-agent is enough for manageable army | "Your command agent was overloaded 40% of ticks" |
| M7 (Mindanao) | Production tuning | Repeat M6 approach with more units | Scaling up the same approach still works — barely | "Your EM signature was visible from T3" |
| M8 (Bohol) | Full system | Reuse M7 config wholesale | Previous configs carry forward on similar terrain | "Blueprint diversity: 1" (copy-paste detected) |
| M9 (Zambales) | Factory vs factory | Build more units than enemy, fast | Production rate race is winnable with pure volume | "Units lost: 12. Median: 3." |
| M10 (Taal) | Final boss | Everything at maximum, hope for the best | Sufficient unit count + some luck can win on lower randomization variants | "You're in the 88th percentile for... everything" |

**Critical constraint:** M9 and M10 must remain beatable by brute force, even though they're the hardest missions. If the final boss *requires* elegant architecture, the "first ugly solution" philosophy collapses. The difficulty must come from *how badly* you win, not *whether* you win.

**The tension:** If M10 is too easy to brute-force, there's no climax. The solution is invisible randomization (2.00h) — the brute-force path wins on some variants and loses on others. A 60-70% pass rate on M10 with brute force is achievable. A 95%+ pass rate requires architectural sophistication. The histogram makes this visible: "You passed! 67/100 variants. Here's where the other 33 failed."

---

## The Inspector as the "Why" Layer

The histogram answers "how well did I do?" The Inspector answers "why did I do that well?" They form a two-part diagnostic:

1. **Histogram** (Act 1 of debrief — emotional): "You won. You're in the 75th percentile for units lost. Here's where you stand." Feeling: accomplishment with a tinge of "I could do better."

2. **Inspector** (Act 2 of debrief — analytical): "Here's tick 14, where your scout's context window overflowed because it was subscribed to three channels simultaneously. Here's tick 22, where your striker attacked a tile that was already empty because the signal arrived 2 ticks late." Feeling: "Oh. OH. I see why."

The two-act debrief structure (locked design) maps perfectly to the "first ugly solution" flow:
- **Sealed watch** (emotional) → you experience the ugly solution's consequences viscerally. Scouts bumbling. Strikers arriving late. Context overloads freezing your best unit at the worst moment.
- **Histogram** (comparative) → you learn that *other people solved this better*.
- **Inspector** (analytical) → you learn *how* they did it, by understanding what went wrong in your own approach.

### The "Aha Chain"

The ideal teaching sequence for a player who brute-forced Mission 3:

1. **Sealed watch:** Player sees their scout spot an enemy. The scout sends a signal. The striker receives it... 2 ticks later. By then, the enemy has moved. The striker walks to an empty tile. Meanwhile, another enemy sneaks past the scout from behind because the scout was facing the wrong way.

2. **Histogram:** "Signal latency: you're at the 80th percentile (slower than 80% of players). Context utilization: 23% (most of your units' buffers were nearly empty)."

3. **Inspector:** Player clicks the scout at tick 8. Its context window shows: [enemy_north, terrain_flat, terrain_flat, ally_position, ---empty---, ---empty---]. Three of six slots hold terrain observations that aren't useful. The scout's perception is wide but its filter is unconfigured — it's filling its buffer with noise. The player clicks the striker at tick 10. Its context window shows: [enemy_spotted_T8, ---empty---, ---empty---, ---empty---, ---empty---, ---empty---, ---empty---, ---empty---]. One old signal, seven empty slots. The striker has capacity for intelligence but receives almost none.

4. **Aha:** "I need to configure the scout's context to filter out terrain. And I need a relay between scout and striker to reduce latency."

5. **Return to Plan screen with intent.** Not because the game told them to optimize. Because they *saw* the waste.

---

## The Anti-Pattern: "Your Solution Isn't Good Enough"

The "first ugly solution" philosophy explicitly rejects certain tutorial patterns common in strategy games:

### Anti-Pattern 1: "Minimum Score Gate"

"You must achieve at least a B rating to unlock the next mission." This forces optimization before the player has the vocabulary to optimize meaningfully. It teaches frustration, not architecture.

**Robot Uprising alternative:** Every mission unlocks the next on *any* win. The histogram shows quality. Quality is optional.

### Anti-Pattern 2: "The Perfect Solution Tutorial"

"Follow these exact steps to configure the optimal agent architecture for this scenario." This teaches rote execution, not understanding. The player can't transfer the knowledge because they don't know *why* those steps were right.

**Robot Uprising alternative:** Boot log teaches vocabulary (what things are called). The player's own ugly solution teaches mechanics (what things do). The histogram teaches quality (how well things can be done). The Inspector teaches causality (why things happened).

### Anti-Pattern 3: "The Efficiency Lecture"

"TIP: Try using a relay to compress signals before sending them to your striker!" Pre-emptive optimization advice robs the player of the discovery moment. The relay's value should be *felt* through the ugly solution's failure mode, not *told* through a tooltip.

**Robot Uprising alternative:** The tooltip for the relay says what it does (compress, filter, amplify). It doesn't say *when* or *why* to use it. The player discovers the "when" and "why" by watching their relay-less solution stumble.

### Anti-Pattern 4: "The Star Rating System"

One star for completion, two for speed, three for elegance. This creates a hierarchy where completion feels like failure. "I only got one star" is a negative emotional frame on what should be a positive event.

**Robot Uprising alternative:** The histogram has no stars, no letter grades, no pass/fail. It shows a continuous distribution. Being at the 80th percentile for latency isn't a "C-minus" — it's a position on a curve. The emotional valence is neutral to positive: "here's where you are, here's where everyone else is, the space between is your playground."

---

## Player Journeys

### Journey: Mika, 14, Manila — First Strategy Game Ever

**Context:** Mission 3 (Palawan jungle). Just learned hooks in Mission 2's debrief. Has configured one hook: scout sends "spotted" on channel "alert" when it perceives an enemy. Striker listens to "alert" and has a rule: "if alert received, move toward signal source."

**Minute 0:00 — Plan Screen**
Mika stares at her workbench. The scout blueprint has one hook in its two hook slots: `ON_PERCEIVE_ENEMY → SEND "spotted" on "alert"`. The striker blueprint has one rule: `IF context contains "alert" THEN move toward source`. She doesn't fully understand signal latency. She doesn't know about context filters. She's configured the minimum viable architecture. She hits EXECUTE.

The fill ring begins its 800ms charge. The cyan ring on the EXECUTE button climbs. Mika's phone (she's playing on mobile) vibrates with an accelerating heartbeat. At 100%, the breaker *clack*. The board transitions to sealed watch.

**Minute 0:15 — Sealed Watch, Ticks 1-5**
The board is an 8×8 jungle grid. Humid green tiles with vine patterns. Her scout (👁) is at C3. Her striker (⚔) is at F6. Two enemy scouts (🤖) lurk at A7 and G2.

Tick 1: Her scout patrols northward, perception cone lighting up three tiles. Nothing seen. The context bar below the scout shows one green pip (terrain observation).

Tick 2: Scout continues north. Perception cone sweeps B4, C4, D4. Still nothing. Context bar: two pips (both terrain).

Tick 3: Scout reaches B5. Perception cone lights up A6, B6, C6 — and **catches the edge of enemy at A7**. A green flash on the A7 tile. The scout's context bar gets a bright new pip: enemy sighting. A dashed cyan line shoots from the scout toward... nothing? The signal enters the channel "alert" — a tiny pulse traveling southeast across the board toward the striker.

Tick 4: The signal pulse arrives at the striker's tile. The striker's context bar lights up: one pip — the alert. The striker's rules evaluate: "IF context contains alert → move toward source." But the source position in the alert is the scout's location at tick 3 — the enemy's position two ticks ago. The striker begins moving northwest toward A7's general direction. But the enemy has already moved. It's now at B7.

Tick 5: The striker reaches E5, heading toward the stale position. The enemy moves again to C7. The striker is chasing a ghost. Mika watches, lips pressed together. Something is wrong but she can't articulate it.

**Minute 0:45 — Sealed Watch, Ticks 6-15**
The chase continues. The scout sends another alert at tick 6, but the signal doesn't reach the striker until tick 8. By then the enemy has moved again. The striker zigzags across the board, always two ticks behind. Meanwhile, the second enemy at G2 has been moving undetected — the scout was facing north the entire time, perception cone pointed away from the southeast.

Tick 12: The southeast enemy reaches F5 — adjacent to the striker's path. The striker's context window has no data about this enemy because no scout has spotted it. The striker walks past it. The enemy strikes. **ELIMINATED.** Red flash. The striker tile goes dark. Mika gasps.

Tick 13-15: The scout continues patrolling, alone now, sending alerts about enemy #1 to a channel nobody is listening to. The battle ends in failure at tick 20 when both enemies reach the base.

**Minute 1:30 — Histogram**
"MISSION FAILED — OBJECTIVE: DEFEND BASE."

Even in failure, the histogram appears. Mika's single metric (this is Mission 3 — she sees "ticks survived" and "units lost"):
- **Ticks survived: 20** — she's at the 35th percentile. Most players survived longer.
- **Units lost: 1** — she's at the 50th percentile. Many players lost a unit here too.

The 50th percentile on unit loss is comforting. She's not terrible. The 35th percentile on survival time stings a little. Other people's armies lasted longer.

**Minute 2:00 — Inspector**
Mika taps the striker at tick 12. Its context window shows:
```
[1] enemy_spotted (from: scout, age: 4 ticks, source: A7) ← STALE
[2] terrain_jungle (from: self, age: 1 tick)
[3] —empty—
[4] —empty—
[5] —empty—
[6] —empty—
[7] —empty—
[8] —empty—
```

The "age: 4 ticks" label glows amber. The tooltip reads: "This observation is 4 ticks old. Enemy may have moved." Mika taps the decision trace: "Rule matched: IF alert → move toward A7. Context entry used: [1] enemy_spotted." She sees the problem: the striker was moving toward a 4-tick-old position.

She taps the scout. Its perception cone is drawn on the replay board: a wide arc pointing north. Southeast is completely dark. The second enemy's path is drawn as a red dotted line — it walked right through the scout's blind spot.

**Minute 3:00 — The Return**
Mika goes back to Plan. She has two insights she *discovered*, not two tips she was *told*:
1. "The striker's information was old. I need something that delivers signals faster." (This leads her toward relays, or toward shortening the signal chain.)
2. "The scout couldn't see everything. I need to cover more of the board." (This leads her toward a second scout, or toward configuring patrol routes.)

She doesn't know the word "latency." She doesn't know the concept "coverage." But she felt both problems viscerally. She'll learn the words later, when the boot log or Codex names them. Right now, she has the *experience* that the words will attach to.

**UI Annotations:**
- Histogram bars: horizontal, amber fill on dark background, player's position marked with gold diamond, median marked with white line
- Inspector context window: vertical stack of 8 slot rows, occupied = teal text on dark card, empty = dashed border, age > 2 ticks = amber label glow
- Decision trace: vertical timeline with rule name highlighted in gold, arrows pointing to context entries that triggered it
- Perception cone on replay board: semi-transparent wedge in unit's color (cyan for friendly), dark area outside cone

---

### Journey: Diego, 31, Cebu — Backend Engineer, Factorio Veteran

**Context:** Mission 7 (Mindanao jungle). Diego has played Factorio for 2000 hours. He understood the factory model immediately. His Mission 6 solution used one Command agent managing four scouts and two strikers — a tight hierarchy. For Mission 7, he copy-pasted his M6 config and queued more units. He's about to learn that scaling a mediocre architecture doesn't make it good.

**Minute 0:00 — Plan Screen**
Diego's workbench shows six blueprints, but four are identical — he cloned "SCOUT-ALPHA" three times with different names. His Command agent has 12 rules (near the maximum), most of which are M6-era rules that reference specific unit names. He hasn't abstracted his rules into role-based conditions. His architecture is **hard-coded to a specific army composition** that worked on a different map.

He glances at the tactical preview. Mindanao jungle — dense vegetation, reduced visibility. His scouts' perception range will be hampered by terrain. He doesn't adjust. He hits EXECUTE.

**Minute 0:20 — Sealed Watch, Ticks 1-12**
The battle begins. His army deploys. Four scouts fan out in their default patrol patterns. But the jungle reduces perception from 5 to 3 tiles. Scouts that could see the whole board in Manila now see only a small cone. Signals arrive at the Command agent with less information.

The Command agent's context window fills rapidly. Four scouts × frequent reports = 12+ messages per tick. The Command agent's 14-slot buffer overflows at tick 4. **CONTEXT OVERLOAD.** The Command agent sparks and jitters — stunned for one tick. During that tick, it can't issue reassign commands. The strikers, waiting for targeting orders, do nothing.

Tick 6: Command recovers. Issues a late targeting command. But by now, the enemy has advanced past the optimal engagement range. Two strikers engage an enemy scout — successfully. But three enemy strikers slip through the gap created by the 1-tick command blackout.

Ticks 8-12: The pattern repeats. Every 3-4 ticks, the Command agent overloads. Each overload creates a 1-tick gap in coordination. Each gap costs a unit or a position. Diego wins — barely — at tick 38, with 4 of 6 original units destroyed and 6 replacement units queued.

**Minute 1:10 — Histogram**
"MISSION COMPLETE."

Diego sees five metrics (M7 has unlocked EM emissions and context overloads):
- **Ticks to win: 38** — 72nd percentile. Slow.
- **Units produced: 12** — 88th percentile. Very expensive.
- **Units lost: 10** — 91st percentile. Almost everyone did better.
- **Context overloads: 9** — 95th percentile. Way worse than almost everyone.
- **EM emissions: HIGH** — 85th percentile. Very loud.

The Spotlight highlights: **"CONTEXT OVERLOADS: 9"** — the metric where Diego is the biggest outlier. A one-line annotation reads: "Your Command agent was stunned 9 times. Most architectures: 0-2."

Diego leans forward. Nine overloads. He won — but his Command agent spent 9 of 38 ticks disabled. That's 24% downtime. In Factorio terms, his main bus was backed up a quarter of the time.

**Minute 1:40 — Inspector**
Diego scrubs to tick 4 — the first overload. He clicks the Command agent. Its context window at tick 3 (the tick before overload):

```
[01] scout-1: enemy_N (age: 0) ← USED by Rule 3
[02] scout-2: terrain_clear (age: 0)
[03] scout-1: terrain_jungle (age: 1)
[04] scout-3: enemy_NW (age: 0)
[05] scout-4: ally_pos (age: 0)
[06] scout-2: terrain_jungle (age: 1)
[07] scout-3: terrain_clear (age: 0)
[08] scout-4: terrain_jungle (age: 1)
[09] scout-1: terrain_clear (age: 1)
[10] scout-3: ally_pos (age: 1)
[11] scout-2: terrain_jungle (age: 2) ← EVICTED at tick 4
[12] scout-4: terrain_clear (age: 2) ← EVICTED at tick 4
[13] scout-1: ally_pos (age: 2) ← EVICTED at tick 4
[14] scout-2: enemy_E (age: 0) ← CAUSED OVERLOAD
```

Diego sees it instantly. Fourteen slots. Eight of them are terrain observations — `terrain_jungle`, `terrain_clear`. The scouts are reporting *everything they see*, including tiles the Command agent doesn't need. The useful information (enemy positions) is buried in noise. The fix is obvious to an engineer: **configure the scouts' context to filter out terrain, or configure the Command agent to ignore terrain entries**.

He also notices: four scouts, each reporting 3-4 observations per tick. That's 12-16 entries per tick for 14 slots. The math doesn't work. He needs either fewer scouts, less verbose scouts, or a relay that compresses scout reports before they reach Command.

**Minute 2:30 — The Return**
Diego goes back to Plan with three Factorio-legible insights:
1. "My main bus is too wide for my throughput" → scouts need output filters
2. "I need inserter filtering" → relay with compress between scouts and Command
3. "My factory floor is copy-pasted, not designed" → blueprints need per-role specialization

He doesn't need the game to tell him any of this. The Inspector showed him a data bus overloading. He's seen that pattern in Factorio, in Kafka, in microservices. The vocabulary is different (context window vs. message queue) but the architecture is identical.

**UI Annotations:**
- Context window at 14/14: all slot rows bright, pulsing red border around entire window, "OVERLOAD" text flashing above
- Terrain entries: grey text, lower visual priority than enemy entries (gold text) and ally entries (cyan text)
- Eviction markers: red strikethrough on evicted entries
- Overload entry: red glow, "⚠ OVERLOAD TRIGGER" annotation

---

### Journey: Prof. Adaora, 52, Lagos — Computer Science Professor

**Context:** Mission 5 (Cebu urban). Prof. Adaora is using Robot Uprising as supplementary material for her sophomore AI course. She's played through M1-M4 with pedagogical intent, noting which concepts map to her curriculum. Now she encounters the factory for the first time. She deliberately builds the ugliest solution she can, because she wants to show her students the improvement arc.

**Minute 0:00 — Plan Screen**
Adaora configures one blueprint: a scout with default rules (patrol, report everything) and one hook (ON_PERCEIVE_ENEMY → SEND on "alarm"). She queues six copies. No strikers. No relays. No command agent. Pure scouts. She's building the teaching artifact: "what happens when you have perception but no action?"

She knows this will fail, or barely succeed. That's the point. She screenshots the workbench configuration.

**Minute 0:20 — Sealed Watch**
Six scouts deploy. They fan out across Cebu's neon-lit urban grid. Within 3 ticks, two scouts have spotted enemies. Alarm signals fly across the board — green flashes on delivery. But nobody can *do* anything with the information. Scouts can't attack. There are no strikers to receive the alarms.

Tick 8: An enemy striker reaches scout-3. One-shot elimination. Red flash.
Tick 10: Enemy striker reaches scout-1. Eliminated.
Tick 12: The remaining four scouts are all sending alarms about enemies they can see but can't fight. The "alarm" channel is saturated with information. No one is listening.

The base falls at tick 18. The scouts saw everything. They knew everything. They communicated everything. And they could do nothing.

**Minute 1:00 — Histogram**
"MISSION FAILED."

Metrics:
- **Ticks survived: 18** — 25th percentile
- **Units lost: 2** — 40th percentile (not terrible — scouts evade well)
- **Signal count: 34** — 90th percentile (huge number of signals for no payoff)

The Spotlight highlights: **"SIGNAL COUNT: 34"** with annotation: "Your units sent 34 signals. Average units acting on signals: 0."

Adaora photographs this screen. She'll project it in Monday's lecture next to a Kafka cluster diagram with consumers that are all producers and no consumers.

**Minute 1:30 — Inspector**
She clicks scout-1 at tick 9 (one tick before death). Its context window:

```
[1] enemy_striker_E5 (age: 0) ← PANIC
[2] enemy_scout_B7 (age: 1)
[3] alarm_from_scout-3 (age: 2) ← UNACTIONABLE
[4] enemy_striker_D4 (age: 3) ← STALE
[5] alarm_from_scout-5 (age: 1) ← UNACTIONABLE
[6] terrain_urban (age: 0)
```

The decision trace shows: "Rule: IF enemy adjacent THEN evade. Match: YES. Action: evade toward D2." The scout tried to run. It failed because the enemy striker is faster in urban terrain. The scout had *perfect information* about its own death. It saw the striker coming. It knew it couldn't escape. And it sent one last alarm — to nobody.

Adaora screenshots the decision trace. She'll pair it with the producer-consumer problem slide. "Information without action is surveillance, not intelligence."

**Minute 2:15 — The Teaching Arc**
Adaora replays Mission 5 three more times, each time adding one element:
1. **Run 2:** Adds two strikers listening to "alarm." They arrive late (latency) but eventually kill enemies. Ugly win. Histogram improves on "ticks to win" but "signal count" is still extreme.
2. **Run 3:** Adds a relay with compress between scouts and strikers. Signal count drops. Latency improves (relay is centrally positioned). Cleaner win. Histogram shows major improvement on latency metric.
3. **Run 4:** Configures scouts to filter terrain observations. Adds context priority: enemy > ally > terrain. Buffer utilization drops from 90% to 40%. No overloads. Tight win. Histogram shows her at 30th percentile on most metrics.

Each run is a lecture slide. Each histogram is a data point. The improvement arc from "perception without action" to "filtered, compressed, prioritized intelligence pipeline" maps exactly to her course's progression from "raw data" to "actionable intelligence." She builds a 4-slide sequence titled "From Data Flood to Information Architecture" and uploads it to the course LMS that evening.

**UI Annotations:**
- Failed mission histogram: dimmer palette than victory, but still shows comparative data — failure doesn't hide feedback
- "0 units acting on signals": displayed as ghost icons next to signal count bar — visual of wasted communication
- Multi-run comparison: not natively supported in-game, but screenshot comparison reveals the arc. (New aspect: should the game support multi-run histogram comparison? See 8.06a)

---

## Interaction Effects

### × Histogram System (7.06)
The "first ugly solution" philosophy **defines the histogram's purpose**. Without it, histograms are a vanity metric ("look how good I am"). With it, histograms are a teaching tool ("look how much room I have to grow"). Every histogram design decision should be evaluated against: "does this help a player who just won ugly understand how to win elegantly?"

### × Spawn Storm (5.13a)
The spawn storm is a special case of "first ugly solution" — specifically, it's the solution so ugly it loses. The spawn storm teaches that there's a *floor* below which ugly solutions fail. But the floor is low. Most ugly solutions win. The spawn storm is the exception that proves the rule: even Robot Uprising has failure modes that brute force can't overcome. The key is that the spawn storm failure is *instructive* (you learn about termination conditions), not *punitive* (the game doesn't mock you).

### × Doctrines / Constraint Ratchet (5.09a, 2.00h)
Doctrines invert the "first ugly solution" philosophy for veterans. Once a player has mastered elegant solutions, Doctrines constrain them: "now win with only 1 hook per unit." The first ugly solution under a Doctrine is a *second first-contact moment* — the veteran rediscovers the feeling of barely winning, but at a higher skill level. Doctrines are the mechanism that makes the "first ugly solution" feeling renewable.

### × Two-Act Debrief (Locked)
The emotional→analytical debrief sequence is **designed for the ugly solution**. Act 1 (sealed watch): you *feel* your solution working badly — scouts bumbling, signals arriving late, context overflowing. Act 2 (Inspector): you *understand* why. Without the ugly solution, the two-act structure has nothing to teach. A perfect solution's sealed watch is satisfying but uninstructive. The ugly solution is where the debrief earns its keep.

### × Vocabulary Pacing (5.04b, 5.00a)
The "first ugly solution" philosophy has implications for vocabulary pacing. Terms like "context overload" and "signal latency" should be *named* in the debrief (Inspector annotations, histogram labels) AFTER the player has *experienced* them. The boot log introduces the words; the ugly solution gives them meaning; the Inspector connects word to experience. Sequence: experience → name → understand.

### × Invisible Randomization (2.00h, locked)
Invisible randomization ensures that ugly solutions don't have consistent success rates. A brute-force config might win 7 of 10 variants. The histogram shows this: "67/100 variants passed." This creates a gradient between "barely works" (50-60% pass rate) and "robustly works" (95%+ pass rate). The gradient IS the skill curve. The ugly solution is the low end of the gradient, not a binary pass/fail.

### × Robustness vs. Efficiency (8.07)
The "first ugly solution" often wins by being robust *accidentally* — flooding the board with units means some survive even when the plan fails. An efficient architecture is fragile: one context overload on the Command agent collapses the whole system. The histogram should surface *both* dimensions (efficiency AND robustness), so the player learns that elegant ≠ robust and ugly ≠ fragile.

### × External Documentation Anti-Pattern (5.00)
The "first ugly solution" philosophy is the *strongest argument against external documentation*. If the game lets you win ugly and then teaches you through the histogram and Inspector, external guides become redundant. The game IS the guide. The player's own solution IS the lesson. This aligns with Position 3.5 (the recommended hybrid in 5.00): the game teaches through experience, names through the boot log, and references through the diegetic terminal — not through alt-tab wikis.

---

## Comparable Games

### Opus Magnum (Zachtronics) — The Origin
No solution quality gate. Three histograms (cost, cycles, area) after every puzzle. The game's greatest innovation is making "you solved it" feel like a beginning, not an ending. GIF-sharing culture emerged because players wanted to show their *improved* solutions — the ugly first attempt was private; the elegant revision was public.

**What translates:** The histogram as motivator, not gatekeeper. The emotional sequence: relief → curiosity → surprise → motivation.

**What doesn't translate:** Opus Magnum's optimization dimensions are immediately legible (count the arms, watch the clock). Robot Uprising's dimensions are architectural — they need the Inspector to make them visible.

### Factorio — The Spaghetti-to-Main-Bus Arc
Every Factorio player's first factory is spaghetti. Belts going everywhere. Inserters facing wrong directions. Assemblers backed up. It works — iron plates eventually reach the science pack assembler — but it's ugly. The game never tells you to reorganize. YouTube videos and the subreddit show you clean main-bus designs. You reorganize because you want to, not because you have to.

**What translates:** The social learning loop. Seeing other people's clean solutions motivates self-improvement. Robot Uprising's histogram is the in-game version of Factorio's subreddit.

**What doesn't translate:** Factorio's spaghetti is *spatially visible*. You can see the mess. Robot Uprising's "spaghetti" is architectural — tangled signal chains, overlapping rules, overloaded buffers — and needs the Inspector to visualize.

### Into the Breach — The "No Damage" Ceiling
Into the Breach missions can be completed with casualties. But the histogram-equivalent (the post-mission score screen) shows perfect runs are possible. No damage taken, no buildings lost, bonus objectives achieved. The "ugly" win — losing a mech, failing a bonus — is valid but visible against the ceiling.

**What translates:** The "you can do better" social proof without gating.

**What doesn't translate:** Into the Breach's optimization dimension is singular (damage avoidance). Robot Uprising's is multi-dimensional. A solution can be elegant on latency and ugly on EM emissions simultaneously.

### Baba Is You — The Accidental Solution
Many Baba Is You puzzles have solutions the designer didn't intend. Players stumble into configurations of rule-tiles that technically satisfy the win condition but aren't the "real" solution. The game accepts them. There's no histogram — but the player often suspects their solution is wrong because it felt too weird.

**What translates:** The validity of unintended solutions. Robot Uprising should embrace emergent architectures that win in unexpected ways.

**What doesn't translate:** Baba Is You has a single correct state (reach the goal). Robot Uprising has a continuous quality dimension.

### Dark Souls — Overleveling as Brute Force
Dark Souls bosses can be beaten by grinding levels until your stats overwhelm the boss's damage. The "intended" experience is to learn patterns at appropriate level. But the game never stops you from grinding. The ugly solution (level 80 vs. a level 30 boss) is valid.

**What translates:** The game respects the player's choice of difficulty self-selection.

**What doesn't translate:** Dark Souls has no histogram showing you that other players beat the boss at level 30. Robot Uprising's histogram is the mechanism that makes the ugly solution feel like a starting point rather than a destination.

---

## Sensory Description

### The Ugly Win
When a player wins a mission with a brute-force configuration, the victory screen should feel **earned but imperfect**:
- **Colors:** The "MISSION COMPLETE" text is gold, but the background has amber undertones instead of the clean cyan of an efficient win. Not red — not failure. Warm amber, like old paper, like a draft that could be revised.
- **Sound:** A completion chord that's satisfying but doesn't fully resolve — a major seventh instead of a clean octave. It ends on a note that invites continuation. Not the triumphant brass of a perfect win. More like a guitar chord that rings and fades with one note slightly unsettled.
- **Animation:** Units on the board celebrate (small bounce), but the base's factory displays a utilization readout that fades from view — a ghost of the resources consumed. The conveyor belt shows the ghosts of units that were produced and destroyed: transparent silhouettes sliding off the production line and dissolving. Not mocking — elegiac. "These units served. They didn't have to die."

### The Histogram Reveal
- **Animation:** Histograms draw from left to right, the distribution curve filling in like a wave. The player's marker drops from above — a gold diamond that *clunks* into position with a tactile thud sound. If the player is far from the median, the camera subtly shifts to keep both the player's marker and the median visible — the gap is the story.
- **Sound:** Each histogram draws with a soft pencil-scratch sound. The diamond landing has weight — a ceramic *tock* on a porcelain surface. If the player is in the top 20% (good), a soft bell tone. If the player is in the bottom 20% (room to grow), a lower tone — not negative, just grounding. Like a tuning fork finding its pitch.
- **Color:** The distribution curve is rendered in soft grey-blue. The player's marker is gold. The median is white. The space between the player's marker and the median — the "improvement gap" — glows faintly, like an invitation. Hover over it and a tooltip reads the exact percentile.

### The Inspector Discovery Moment
When a player clicks a unit and sees a context window full of wasted entries, or a decision trace pointing to stale data:
- **Sound:** A quiet descending tone — three notes, each lower than the last. Not an error sound. A "hmm" sound. The sound of noticing something you hadn't noticed before.
- **Animation:** The problematic entry (stale data, terrain noise, overload trigger) gains a soft amber glow. A thin dashed line extends from it to the board position where the consequence played out — "this entry caused this outcome." The line pulses once. Connection made.
- **Color:** Fresh, useful context entries are cool teal. Stale entries are warm amber. Wasted entries (terrain in a Command agent, ignored signals) are dim grey. The color temperature of the context window tells the story at a glance: a window full of teal is healthy; a window full of amber and grey is sick.

---

## The TikTok Clip

**"My First Win Was Trash (And That's the Point)"**

Split screen. Left: the brute-force sealed watch — 12 scouts bumbling, context overloads sparking, signals going nowhere, units dying left and right, the player's base barely surviving. Chaos. Right: the optimized replay — 4 units in precise formation, signals flowing through a relay in clean compressed bursts, the Command agent never overloading, enemies eliminated in sequence. Surgical.

The ugly win takes 38 ticks. The clean win takes 16. Same mission. Same player. Same game. The counter at the bottom shows "Attempt #1" and "Attempt #4."

The audio: the ugly win's battlefield sounds are cacophonous — overlapping alarm pings, overload buzzes, elimination crackles. The clean win's sounds are rhythmic — signal pulses like a heartbeat, elimination sounds spaced evenly, the bass note of a context window that never fills past 60%.

Text overlay at the end: "The game never told me to optimize. I just... wanted to."

Comment section prediction: "wait this is literally my CI pipeline before and after the refactor" / "factorio players know this feeling" / "the sound design though" / "how is a robot game making me feel feelings"

---

## New Aspects Discovered

- **8.06a — Multi-run histogram comparison view:** Should the Inspector support comparing histogram positions across multiple attempts of the same mission? A "run history" panel showing how the player improved from attempt 1 to attempt 4. The improvement arc as a first-class visualization. Interaction with 7.06 histogram system.

- **8.06b — The "ugly solution gallery" as community feature:** Player-submitted worst wins. "Show me the most context overloads anyone has ever had on Mission 7." A leaderboard inverted — celebrating the ugliest victories. The community bonding over shared brute-force experiences. The gallery as onboarding: new players see that ugly wins are normal and celebrated.

- **8.06c — Histogram-gated optional challenges:** Not gating progression, but gating *bonus content*. "Reach the 30th percentile on context overloads to unlock the 'Clean Machine' achievement." The achievement as a named milestone in the optimization journey. Interaction with Doctrines (5.09a).

- **8.06d — The "first elegant solution" as mid-campaign moment:** If the first ugly solution is M1-M4, when does the first elegant solution happen? The moment where a player's histogram position crosses the median for the first time. Designing that moment as a milestone with a distinct celebration (new completion chord, different victory screen color temperature shifting from amber to cyan). The emotional arc from "barely winning" to "winning well" as designed progression.

- **8.06e — Ugly solution archetypes as Inspector diagnostic categories:** Should the Inspector recognize the five ugly archetypes (Swarm, Wall, Solo Hero, Copy-Paste, Goldberg) and label them? "Your architecture matches the 'Solo Hero' pattern — 85% of context utilization on one unit." Named patterns as teaching vocabulary. Risk: players feel judged rather than informed.
