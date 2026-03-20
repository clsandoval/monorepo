# 2.19 — Variable Scenario Seeds as Difficulty Axis

## The Option

Replace the traditional single difficulty slider (easy/medium/hard) with a **scenario variance dial** that controls how much each execution diverges from the mission's baseline parameters. The dial goes from **Narrow** (minimal randomization — enemy count, patrol routes, node positions, timing all cluster tightly around predetermined values) to **Wide** (extreme randomization — every parameter swings across its full legal range, producing wildly different tactical situations each run).

The locked design already includes invisible randomization: "Each time the player hits execute, the scenario varies within constraints." The variance dial makes this invisible range **visible and player-controllable**. Narrow variance = a mission that plays almost identically each time (tutorial-friendly, debuggable, learnable through repetition). Wide variance = a mission where every execution is a genuinely new tactical problem requiring an architecture that generalizes across every possible configuration.

### Mechanical Rules

- **Variance coefficient V** ranges from 0.1 (near-deterministic) to 1.0 (full range).
- Each mission parameter P has a baseline B and a legal range [P_min, P_max]. The actual value for a given execution is drawn from [B - V*(B - P_min), B + V*(P_max - B)].
- Parameters affected: enemy count, enemy spawn timing, enemy approach direction, patrol route seeds, resource node positions, terrain variation (within biome constraints), objective placement, enemy detection sensitivity, wave composition.
- At V=0.1, a mission with baseline 4 enemies and range [2,6] spawns 3-5. At V=1.0, it spawns 2-6.
- The dial appears in the Plan screen's mission briefing bar, rendered as a horizontal **tuning knob** with a needle indicator. Turning the dial changes the visual representation: narrow shows a tight cluster of dots on a bell curve; wide shows dots scattered across the full range.
- The debrief shows the seed parameters that were actually rolled for each execution, so the player can see exactly how much variance they were dealing with.
- **Narrative framing:** You are tuning your own simulation fidelity. Narrow = running sanitized training scenarios. Wide = deploying into an unpredictable world.

### How It Creates Interesting Decisions

The variance dial transforms the game's core skill requirement. At narrow variance, the player can brute-force a solution by memorizing specific enemy positions and timing their architecture to match. At wide variance, the player must design architectures that **generalize** — that handle any combination of parameters, not just the ones they've seen. This maps directly to the real agentic engineering skill of building robust systems vs. brittle point solutions.

The dial also creates a natural **self-selected difficulty curve** without the stigma of "easy mode." A player struggling with Mission 5 can narrow the variance to practice their architecture against more predictable scenarios, then widen it once they're confident. The debrief's "runs: N, passed: M" display gains new meaning: passing 10/10 at narrow variance is a different achievement than passing 7/10 at wide variance.

---

## Player Journeys

#### Journey: Sofia, 15, first strategy game, Mission 5 (Assembly Line)

**Context:** Sofia just unlocked the factory system. She's designed her first blueprints — a scout, a relay, a striker — with channel wiring from the tutorial missions. Her first three executions at default variance (V=0.5) all failed: enemies approached from different directions each time, and her single relay couldn't cover both flanks.

**Minute 0:00 — The Frustration Point**
Plan screen. Board left, workbench right. Sofia's blueprints are wired: Scout-Alpha on recon-net, Relay-Main forwarding to strike-net, Striker-Bravo listening on strike-net. The mission briefing bar at top shows "Assembly Line — Palawan Jungle" with the variance dial at its default center position. Sofia has been staring at the same setup for three failed runs. She notices the dial for the first time — a small horizontal knob next to the mission name, a needle pointing to the center of a bell curve diagram. She hovers over it. A tooltip fades in: "Scenario Variance — controls how much each execution differs from the baseline. Narrow: more predictable. Wide: more chaotic."

**Minute 0:15 — Narrowing Down**
Sofia drags the dial left toward Narrow (V=0.2). The bell curve tightens visually — the scattered dots compress into a dense cluster. A subtle amber glow pulses around the dial to acknowledge the change. She hits EXECUTE. The sealed watch plays: enemies approach from the south — same as her second run. Her relay is positioned to handle south-facing threats. Scout detects, signals flow through recon-net, relay forwards to strike-net, striker engages. Three enemies down. The architecture works.

**Minute 1:30 — Building Confidence**
She executes again at narrow variance. Enemies from the south again, with one from southwest. Still works — her scout's patrol covers that angle. A third run: south and southeast. Still passes. "runs: 3, passed: 3" in the debrief. Sofia feels the architecture clicking. She understands the flow now.

**Minute 2:00 — Widening the Challenge**
Confidence built, she nudges the dial to center (V=0.5). Executes. Enemies from the north this time — her relay's positioning doesn't cover the north approach. The scout detects but the signal chain is too long; the striker arrives too late. "runs: 4, passed: 3." The Inspector shows the latency gap: 4 ticks from detection to striker action, but the enemy reached the base in 3. Sofia doesn't feel defeated — she feels like a scientist adjusting experimental conditions. She adds a second relay positioned north.

**Minute 3:30 — The Generalization Moment**
Two relays, redundant coverage. She sets variance to V=0.8 and runs five times. "runs: 5, passed: 4." One failure from a simultaneous east-west attack that overwhelmed both relays. She adjusts channel routing to handle multi-directional threats. "runs: 3, passed: 3" at V=0.8. She pushes to V=1.0.

**Minute 5:00 — Resolution**
At full variance, she passes 7/10. The three failures are edge cases: maximum enemy count (6) from three directions simultaneously. She could narrow the variance and call it done, but she wants the 10/10. She builds a third relay. "This is like... making sure your code works with weird inputs, not just the normal ones."

**UI Annotations:**
- **Variance dial**: 120px wide horizontal knob in the mission briefing bar, left of EXECUTE button. Needle indicator over bell-curve diagram. Drag left = narrow, right = wide. Amber pulse on adjustment.
- **Bell curve visualization**: 60x30px inline diagram showing dot distribution — tight cluster at narrow, scattered at wide. Updates in real-time as dial is dragged.
- **Debrief seed display**: Below "runs: N, passed: M", a collapsed section "Scenario Parameters" expands to show the rolled values (enemy count, direction weights, timing offsets) for the current run.

---

#### Journey: Marcus, 42, DevOps engineer, Mission 8 (Breach)

**Context:** Marcus has been playing at default variance (V=0.5) for the whole campaign. He's a methodical player who iterates carefully. Mission 8 introduces multi-objective with turrets and an enemy spawner. His architecture is sophisticated — hack team and strike team coordinated through command agent.

**Minute 0:00 — The Expert's Tool**
Marcus sees the variance dial and immediately understands it as a test harness. He sets it to V=0.1 first — near-deterministic. His architecture handles the mission cleanly. He watches the sealed watch, notes the exact tick sequence: hack team disables turrets at tick 8, strike team breaches at tick 12, specialist extracts data at tick 15. The architecture is tuned to this specific sequence.

**Minute 1:30 — Progressive Stress Testing**
He bumps to V=0.3. The turret positions shifted slightly — hack team still reaches them but one tick later. Strike team timing holds. Passes. V=0.5: turrets in different positions entirely. Hack team's patrol path doesn't cover the new position. Fails. He adjusts the scout's patrol to sweep wider. V=0.5 passes again. V=0.7: enemy spawner produces units faster in this variant. His resource income can't sustain the army. Fails. He adds a tagging scout to grab a resource node earlier.

**Minute 3:00 — The Architecture Stress Test**
At V=0.9, everything varies dramatically. Some runs have turrets clustered on one side (easy hack, hard strike). Others have them scattered (hard hack, easy strike). The spawner's rate varies by 50%. Marcus realizes his architecture has a **structural assumption** — it assumes turrets will be within 3 tiles of each other for the hack team to cover in sequence. At wide variance, they might be 6 tiles apart. He needs two hack teams, or a faster specialist, or a scout that identifies turret positions before committing the hack route.

**Minute 5:00 — The Debugging Insight**
The Inspector at V=0.9 shows something Marcus hadn't seen at narrow variance: his command agent's buffer fills with conflicting reports when turret positions are far apart. The command rules assume one "turret sector" — wide variance broke that assumption by creating two turret sectors. He adds a rule: "if turret reports from two sectors > 2 tiles apart, split hack team." This rule is invisible at narrow variance — it never fires. It only matters when the world is unpredictable.

**Minute 7:00 — Resolution**
Marcus sets V=1.0 and runs 20 times. 17/20 pass. The three failures are extreme edge cases he decides to accept. "This is chaos engineering for a video game. I'm literally running a game day on my robot army."

**UI Annotations:**
- **Seed parameter overlay in Inspector**: A collapsible panel showing each randomized parameter as a horizontal bar with the rolled value marked. Baseline marked with a vertical line; the rolled value marked with a dot. Visual comparison across multiple runs when the player expands "Run History."
- **Run History panel**: Shows last 10 runs as rows with pass/fail, variance level, and rolled parameters. Click any row to load that run's replay in the Inspector. Color-coded: green pass, red fail, amber hover highlight.

---

#### Journey: Kwame, 28, Twitch streamer, Mission 10 (The Warden)

**Context:** Kwame is streaming the final mission. Chat is active. He's beaten Mission 9 at V=0.7 and is feeling confident. The Warden — the enemy with full base, command agent, and channel map — awaits.

**Minute 0:00 — The Challenge Run**
Chat is spamming "MAX VARIANCE" and "NARROW COWARD." Kwame grins and sets the dial to V=1.0. "Full chaos, chat. If we die, we die loud." The bell curve scatters to maximum spread. He hits EXECUTE.

**Minute 0:30 — The First Disaster**
Sealed watch. The Warden's architecture varies dramatically at V=1.0 — this run, its scout-heavy blueprint dominates, flooding the map with detection. Kwame's decoy strategy fails because the Warden has so many scouts that the decoys can't saturate all their buffers. His relay gets detected early. Striker team wiped. "runs: 1, passed: 0."

**Minute 1:00 — Iterating Live**
Chat suggests different approaches. Kwame narrows to V=0.5 to understand the mission baseline, beats it in two attempts, then widens to V=0.7. The Warden's architecture shifts — now striker-heavy. Different counter needed. He adjusts, beats V=0.7. Widens to V=0.9. Now the relay placement varies — sometimes the Warden's relay is exposed, sometimes hidden behind its base.

**Minute 3:00 — The Content Moment**
At V=0.9, Kwame gets a run where the Warden's relay is on the far side of the map, protected by dense jungle terrain. His usual "target the relay" strategy fails. He needs a specialist to hack through the jungle sensor network. Chat explodes: "NEVER SEEN THAT BEFORE." The variance dial generated a mission configuration that none of his previous runs had produced. He pauses (on the plan screen — no pausing during sealed watch), redesigns for 2 minutes, executes. The specialist hacks a path, the striker team flanks through the opened corridor. The Warden's relay falls. Chat: "THE VARIANCE DIAL IS THE REAL FINAL BOSS."

**Minute 6:00 — The Victory Lap**
After 8 attempts across different variance levels, Kwame beats V=1.0. Debrief shows "runs: 12, passed: 8" across all his attempts. He scrolls through the Run History — a tapestry of different Warden configurations, each demanding a different counter. "This isn't one mission, chat. It's twelve missions wearing the same hat."

**UI Annotations:**
- **Stream-friendly variance display**: The bell curve visualization is large enough to be readable at 720p streaming resolution. When variance changes, a brief 500ms text overlay appears: "VARIANCE: 0.9 — EXTREME" in amber text.
- **Run History as content**: The Run History panel shows 12 rows of varied configurations, each with a thumbnail of the seed parameters. Streamers can scroll through this like a highlight reel.

---

## Strengths

- **Self-selected difficulty without stigma.** Players never choose "easy" — they choose "narrow variance." The framing is about precision vs. chaos, not skill level. This sidesteps the emotional baggage of difficulty labels entirely.
- **Teaches the transferable skill of robustness.** The jump from "works at narrow variance" to "works at wide variance" is exactly the jump from "works in dev" to "works in production." The game explicitly trains generalization, the core skill of agentic engineering.
- **Infinite replayability per mission.** At V=1.0, a single mission contains hundreds of meaningfully different tactical configurations. Players who love a particular mission can keep widening variance to find new challenges.
- **Natural content generation.** Streamers and content creators get unique runs every time at high variance. No two streams of the same mission look alike.
- **Debrief gains depth.** The Inspector becomes a statistical tool at high variance — not just "what went wrong this run" but "what configuration space does my architecture fail in?"

## Weaknesses

- **Balance complexity.** Ensuring that V=1.0 produces only solvable configurations requires careful range-setting per parameter per mission. If the variance range includes unsolvable configurations, players feel cheated.
- **Undercuts the sealed watch.** If the player knows the run is "just a narrow-variance test," the sealed watch loses emotional weight. The quality-signal argument ("if watching isn't fun, the game isn't fun") applies less when the player is using variance as a diagnostic tool.
- **Tutorial friction.** New players might adjust the dial without understanding what it does, accidentally making early missions harder. The dial should be hidden during Missions 1-4 and introduced with a boot log entry at Mission 5.
- **Leaderboard fragmentation.** If the community competes on pass rates, narrow-variance runs are trivially easier. Needs a weighted scoring system or separate leaderboards per variance level.

## Interaction Effects

- **Invisible randomization (locked):** The variance dial makes the locked "invisible randomization" visible and controllable. Compatible, not contradictory — the baseline randomization IS the dial at its default position.
- **Sealed watch (locked):** At narrow variance, watching the same mission play similarly each time could feel repetitive. At wide variance, every sealed watch is genuinely different, reinforcing its value.
- **Inspector / debrief (locked):** The Inspector gains a statistical dimension — "this parameter was X in the runs that failed, Y in the runs that passed." Pattern recognition across runs becomes a diagnostic skill.
- **Command agent (locked):** The command agent's value scales with variance. At narrow variance, a hand-tuned architecture beats the command agent. At wide variance, the command agent's mid-battle adaptation is essential — the player can't pre-optimize for every configuration.
- **2.22 AI-generated adversary configs:** Variance and adversarial AI are complementary difficulty axes. Variance randomizes the world; adversarial AI optimizes the enemy to exploit the player. They can stack or be offered as separate dials.
- **2.05a Shared buffer pooling tax:** Higher variance means more diverse information flows, which stress shared buffers more. The pooling tax coefficient matters more at high variance when the shared buffer can't predict what information will arrive.

## Comparable Games/Media

- **Into the Breach:** Near-zero variance — every mission is fully visible, deterministic. The game's clarity comes from predictability. Robot Uprising's narrow variance mode recreates this feeling; wide variance is the opposite philosophy.
- **Slay the Spire:** High variance through random card offerings, random encounters, random relics. The skill is building decks that handle any combination. The variance dial in Robot Uprising is an explicit version of StS's implicit variance.
- **XCOM 2:** Procedurally generated maps create natural variance. Players hate "unfair" RNG (95% miss) but love "interesting" RNG (pod placement). Robot Uprising's variance dial needs to generate interesting configurations, not frustrating ones.
- **Spelunky:** Full procedural generation means every run is unique. The game's skill ceiling is handling whatever the generator produces. Wide-variance Robot Uprising missions aspire to this.
- **Factorio's "deathworld" preset:** An explicit difficulty dial that makes resource scarcity and enemy aggression extreme. Players self-select into it for the challenge. Same emotional contract as wide variance.

## Sensory Description

The variance dial is a **60px-tall horizontal slider** nestled into the mission briefing bar's right side, just left of the EXECUTE button. The slider track is a dark navy channel with subtle tick marks at 0.1 intervals. The knob is a brushed-metal circle (16px diameter) with a tiny needle indicator. Below the track, a miniature bell curve visualization (80x24px) renders as a field of cyan dots — at narrow variance they cluster into a tight peak, at wide variance they scatter into a flat uniform distribution, animating smoothly as the player drags the knob. The transition between states has a satisfying elastic easing — dots seem to resist spreading then release.

When the player drags the dial rightward toward wide variance, a low hum subtly increases in pitch — barely audible, felt more than heard, like the background frequency of a power grid under load. At maximum variance, the mission briefing bar's border gains a thin amber pulse, as if the simulation itself is straining against its constraints. The EXECUTE button's glow intensifies slightly: executing at high variance is a bigger commitment.

In the sealed watch at high variance, the visual palette is unchanged — but the **unpredictability** creates its own sensory experience. Enemies appearing from unexpected directions produce a startle response that narrow variance can't. The sound design doesn't change per-variance, but the **context** of each sound shifts: a signal flash at narrow variance feels routine; the same flash at wide variance feels like a lifeline.

The debrief at high variance shows the **Run History panel** — a vertically scrolling list of previous runs, each row showing a tiny parameter-spread diagram (a 40x12px horizontal bar with dots marking rolled values). Passing runs glow soft green; failures glow amber-red. The visual pattern of passes and failures across different parameter configurations reads like a heat map of the architecture's robustness envelope. Hovering a row highlights which parameters differed most from the baseline — the dots that strayed furthest glow brighter.
