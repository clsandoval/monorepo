# Mission Variety: A Taxonomy of Mission Types

**Aspect:** 5.08 — Mission variety: what types of missions exist (defend, attack, stealth, escort, puzzle, boss)
**Category:** Campaign / Mission Design
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

The locked 10-mission arc introduces mechanics progressively: context → rules → hooks → relays → skills → factory → command → specialist → counter-architectures → factory-vs-factory. But each mission also has a **TYPE** — a shape of challenge that tests different architectural thinking. What types exist? How do they feel different? Which ones the locked missions already embody, and which types remain unexplored for post-campaign Gauntlet content, advanced campaign expansions, or community-designed missions?

This is critical because Robot Uprising's core mechanic — attention architecture design — is abstract. The mission type is what gives each run its **concrete texture**. Two missions with identical mechanics can feel completely different if one asks "defend this position" and another asks "infiltrate without detection." The mission type determines which primitives the player leans on, which synergies matter, and which failure modes are most devastating.

---

## Type 1: "The Filter Puzzle" — Subtractive Clarity

### How It Works

The player's agents are pre-configured (or over-configured) and the objective requires removing noise, not adding capability. The board starts crowded with information sources. The win condition is recognizing and suppressing irrelevant signals so agents can focus on what matters.

**Locked example:** Mission 1 (Wake Up) — two frozen units with buffers full of noise. The player configures LISTEN/IGNORE filters to unblock them.

### Mechanical Signature

- **Primary primitive tested:** Context config (listen/ignore toggles, eviction priorities)
- **Decision shape:** Subtractive. "What do I turn OFF?" rather than "What do I add?"
- **Failure mode:** Agents paralyzed by irrelevant data, never acting or acting on wrong signals
- **Optimal architecture:** Minimal. The best solution uses the fewest active channels and tightest perception
- **Scaling axis:** More noise types, more subtle signal/noise distinctions, time-varying noise (changes per tick)

### Sensory Description

The board is visually cluttered at the start — every unit's buffer bar is maxed out, glowing angry red, pulsing with the overfull animation. Signal chevrons fly across the board in every direction, a storm of green and amber arrows overlapping into visual mush. When the player toggles an IGNORE filter, the corresponding signal type goes dim on all units — grey chevrons dissolve into smoke particles, buffer bars drop a notch, the red fades toward amber. Each filter toggle gives an immediate visual sigh of relief. The final "aha" moment: one toggle clears three buffer slots across every unit simultaneously, the board exhales, buffer bars settle to calm blue, and the agents snap into motion.

**Audio:** A low-frequency hum that gets higher-pitched and more distorted as buffers fill. Each IGNORE toggle removes one frequency band from the hum, like pulling frequencies off an equalizer. When all noise is cleared, the hum resolves into a clean sine tone — the "system ready" chord.

### Strengths

- Perfect for tutorials — subtractive framing is less overwhelming than additive
- Rewards observation before action (study what's in the buffer, then decide what to remove)
- Creates satisfying "eureka" moments when a single toggle fixes multiple agents
- Scales naturally: easy = obvious noise categories, hard = noise that looks like signal

### Weaknesses

- Limited replayability — once you identify the filter, the mission is trivially repeatable
- Doesn't test the deep primitives (hooks, rules, production) that make the game distinctive
- Can feel passive — the player is configuring settings, not building architectures
- Risk of "guess the developer's filter" feeling if signal/noise distinction isn't learnable

### Interaction Effects

- **With sealed watch:** Low drama. Units either work or stand still. Not much emergent behavior to watch.
- **With inspector:** High synergy. The inspector's buffer viewer IS the diagnosis tool. Filter puzzles teach inspector literacy.
- **With robustness (1.04e):** Limited. Randomizing noise types works, but there's a ceiling on how many variations feel meaningfully different.
- **With Gauntlet:** Not a standalone Gauntlet type — too one-dimensional. Works as a "phase" within a larger mission (clear noise THEN do the real objective).

### Comparable Games

- **Baba Is You** early levels: remove rules to simplify the board state, subtractive puzzle-solving
- **Papers, Please:** sort signal from noise under time pressure with increasingly ambiguous criteria
- **Mushroom 11:** destroy parts of yourself to move forward — subtractive action as primary verb

---

## Type 2: "The Relay Network" — Information Pipeline Construction

### How It Works

Agents are spread across the board with no direct line of communication. The win condition requires information to flow from one area to another — scouts detect threats, data must reach strikers positioned elsewhere. The player builds a relay topology: hub-and-spoke, chain, mesh, or star.

**Locked example:** Mission 3 (Blind Spots) — 3 scouts and 2 strikers overload with direct hooks. Player discovers relay-as-hub topology.

### Mechanical Signature

- **Primary primitives tested:** Hooks (channel naming, routing), Relay unit placement, Context config (buffer sizing)
- **Decision shape:** Topological. "How do I wire these agents together?" The board IS the circuit diagram.
- **Failure mode:** Buffer overflow at relay nodes, signal latency causing stale responses, single-point-of-failure relay destruction
- **Optimal architecture:** Depends on board geometry. Hub-and-spoke for small boards, mesh for large, chain for linear maps.
- **Scaling axis:** More agents to wire, longer distances, dynamic threats that require rerouting, multiple relay hops adding latency

### Sensory Description

The Plan screen's board is covered in translucent colored lines — each channel a different hue — connecting ghost units. The player drags a hook onto a scout, types "recon-north" into the channel name field, and a cyan line shoots from the scout to the relay that's listening on "recon-north." As more hooks are wired, the board becomes a subway map of colored routes. The player hovers over the relay and its buffer capacity shows: 12 slots, and four scouts are feeding it. A yellow warning pip appears: "estimated throughput: 4 signals/tick, buffer capacity: 12 — overflow risk at tick 3."

During sealed watch: signal chevrons travel along the channel lines, cyan pulses hopping from scout to relay, the relay's buffer bar climbing with each arrival. At the relay, the compress skill fires — a squish animation, the buffer bar drops, and a denser yellow signal departs toward the striker. When it works, it looks like a circulatory system. When it fails, the relay's buffer bar hits red, signals bounce off (tiny red X marks), and the striker on the far side stands motionless, deaf.

**Audio:** Each signal hop has a soft click — like a telegraph relay engaging. Relay compression sounds like a vinyl record being fast-forwarded. Buffer overflow: a harsh static burst, like a phone line dropping.

### Strengths

- Tests the core mechanic directly — information architecture IS the gameplay
- Creates beautiful visual spectacle during sealed watch (signal flows, relay cascades)
- Natural difficulty curve: more agents = more complex topology = more interesting failures
- Directly teaches distributed systems concepts (single point of failure, throughput bottleneck, latency)
- High replay value — different board layouts demand different topologies

### Weaknesses

- Can feel like "solve the wiring puzzle" rather than "fight a battle" — low combat drama
- Relay-centric missions make non-relay units feel like furniture (scouts detect, strikers wait)
- Risk of optimal topology being obvious to networking professionals ("it's just a load balancer")
- If relays are stationary, the topology is static — less moment-to-moment drama during execution

### Interaction Effects

- **With combat:** Low direct combat. Add enemies that target relays specifically to inject urgency.
- **With EM emissions (Mission 4):** High synergy. Relay networks are EM beacons. Stealth topology conflicts with coverage topology.
- **With command agent:** Command agent rerouting mid-battle transforms static relay missions into dynamic ones.
- **With production:** Factory missions can produce relays mid-battle, extending the network in real time.

### Comparable Games

- **Factorio** belt networks: throughput optimization as primary gameplay, bottleneck diagnosis as skill
- **Mini Metro / Mini Motorways:** network topology as the entire game
- **Screeps** room links: inter-room relay infrastructure as endgame optimization

---

## Type 3: "The Stealth Run" — Emissions Budget Management

### How It Works

Enemies can detect EM emissions from hook transmissions. The player must accomplish the objective while keeping emissions below a threshold — or at least below enemy detection range. Every hook fire is a calculated risk. Architecture must be "quiet" — compressed signals, minimal broadcasts, whisper-range channels.

**Locked example:** Mission 4 (Noisy Channel) — enemies converge on the relay by tracking EM emissions. Player learns compress/filter skills and emission management.

### Mechanical Signature

- **Primary primitives tested:** Skills (compress, filter), EM emissions model, hook design (minimal transmissions)
- **Decision shape:** Budget-constrained. "How do I get maximum intelligence for minimum noise?"
- **Failure mode:** Architecture too loud → enemies converge on relay → network destroyed → cascade failure
- **Optimal architecture:** Dark networks — stripped payloads, minimal hook triggers, compress-heavy relays, short-range whisper channels
- **Scaling axis:** Enemy detection sensitivity, emission decay rate, terrain that amplifies/dampens emissions, time windows where detection is more/less punishing

### Sensory Description

The Plan screen shows an EM overlay: concentric rings around each unit that has hooks configured, colored from faint green (low emission) through amber to angry red (high emission). As the player adds a hook, the rings expand. Adding a compress step to the relay shrinks the downstream emission rings. The emission overlay pulses gently, like sonar. The player can see, before hitting EXECUTE, exactly how loud their architecture will be.

During sealed watch: the emission rings pulse with each hook fire. Enemies have a detection cone — a pale red wedge emanating from their position. When an emission ring overlaps an enemy's detection cone, the enemy's icon flashes and it begins moving toward the emission source. The dread builds as enemies close in on the relay, guided by the player's own signal traffic. A well-compressed architecture shows tiny, dim emission pulses — almost invisible. A loud architecture turns the board into a neon advertisement.

**Audio:** Emissions have a characteristic radio-static hiss proportional to their radius. A loud relay sounds like a radio tower. A whisper-net sounds like distant Morse code — barely audible clicks. Enemy detection triggers a low, predatory bass note. Enemy movement toward a detected emission: footsteps getting louder.

### Strengths

- Creates genuine tension during sealed watch — the player is watching their own architecture betray them
- Forces engagement with compress/filter skills that might otherwise feel optional
- Natural stealth fantasy that appeals to non-strategy players
- Teaches a real agentic AI concept: the observability cost of inter-agent communication
- TikTok clip material: "My relay was so loud the entire enemy team walked straight to it"

### Weaknesses

- Can punish communication itself, making the optimal strategy "barely communicate" — which is boring to watch
- If the optimal dark network is solved, every stealth mission uses the same template
- Balancing emission detection is extremely sensitive: too easy = irrelevant, too punishing = frustrating
- Stealth missions with no combat feel like puzzle games, not like "leading a robot uprising"

### Interaction Effects

- **With relay network type:** Direct conflict. Relay networks maximize throughput but also maximize emissions. Stealth forces minimal-relay or no-relay architectures.
- **With combat:** Best combined: you MUST engage eventually, but getting detected early means fighting without information advantage.
- **With hook taxonomy (3.08):** Stealth missions drive adoption of stripped payloads and narrow triggers — the "dark network" strategy.
- **With command agent:** Command agent's 6 hook slots make it the loudest unit. Stealth missions create tension: meta-control vs. stealth.

### Comparable Games

- **Into the Breach** (information is free, but action has consequences — similar budget-constraint feeling)
- **Mark of the Ninja** (visibility as literal game mechanic, stealth meter)
- **Invisible Inc.** (alarm level escalation from agent activity — direct parallel to emission detection)

---

## Type 4: "The Siege" — Sustained Defense Under Escalating Pressure

### How It Works

Enemies arrive in waves of increasing size, speed, or intelligence. The player's architecture must survive sustained pressure. No single decisive moment — the challenge is maintaining coherence over 60-100 ticks as buffers fill, signals stack, and the information load increases. The win condition is survival for N ticks or until a specific wave is repelled.

**Locked example:** Mission 7 (Pressure Test) — sustained enemy waves with constrained resources and contested material nodes. Architecture must self-sustain.

### Mechanical Signature

- **Primary primitives tested:** Eviction policies (what gets dropped when buffers fill), production queue (replacing destroyed units), resource management (tagging nodes under pressure)
- **Decision shape:** Resilience engineering. "Will this architecture survive degradation?" The player designs for the WORST tick, not the average tick.
- **Failure mode:** Graceful degradation → cascade collapse. Architecture works for 30 ticks, then one relay dies, then a striker goes deaf, then the other relay overflows, then everything falls apart in 5 ticks.
- **Optimal architecture:** Redundant relay topology, aggressive eviction (recent > old signals), self-healing properties (factory replacing destroyed units with same blueprints)
- **Scaling axis:** Wave frequency, enemy variety within waves, resource scarcity, time-to-failure of individual units

### Sensory Description

The sealed watch begins calmly. First wave: 3 enemies from the north. Scouts detect, relay forwards, strikers engage. Clean. The tick clock advances. Second wave, tick 15: 4 enemies, north AND east. The relay's buffer bar climbs from green to amber. Scouts are generating more signals than the relay can process. Third wave, tick 25: 5 enemies from three directions. The relay hits red. Signals start bouncing (red X pips). A striker on the south flank stands motionless — it didn't receive the scout's alert about the eastern approach. The player watches the architecture bend, then break, then (if well-designed) recover as the factory replaces the destroyed scout with a fresh one that reconnects to the surviving relay.

The board's color palette shifts over time: cool blues and greens in early ticks, progressively more amber and red as pressure builds. By tick 40, the board is a heat map of stress — buffer bars pulsing red, emission rings overlapping, destruction flashes punctuating each failed engagement.

**Audio:** A heartbeat-like pulse that accelerates with wave intensity. Buffer overflow static layered on top, growing louder. Factory production has a rhythmic clunk-clunk — steady, reassuring, the machine still working even as the front lines crumble. When a cascade collapse begins, the audio shifts to a descending tone — each system failure pulling the pitch down. Recovery (if it happens) sounds like the tone slowly climbing back up.

### Strengths

- Maximum sealed watch drama — the escalation IS the entertainment
- Tests architecture resilience, which is the hardest and most valuable skill to develop
- Directly parallels real systems engineering: load testing, capacity planning, graceful degradation
- Natural "one more attempt" energy: "I survived to wave 4 this time, maybe with better eviction I can reach wave 5"
- Production queue management becomes critical — this is where factory gameplay shines

### Weaknesses

- Can feel like watching a slow-motion train wreck if the architecture is fundamentally wrong — frustrating, not educational
- Long sealed watches (60+ ticks) test patience, especially on failure
- If the solution is "build more relays" every time, the type becomes one-note
- Difficulty calibration is hard: too easy = boring, too hard = unfun cascade collapse

### Interaction Effects

- **With factory production:** Essential pairing. The factory is the player's regeneration mechanism. Siege missions make production queue decisions life-or-death.
- **With command agent:** Command agent's ability to reroute mid-battle is most valuable here — adapting to shifting pressure.
- **With eviction policies (core-mechanic):** Siege missions are the primary test of eviction design. Different eviction policies produce radically different survival curves.
- **With robustness scenarios (1.04e):** Randomized wave composition creates the 100-test-case pattern naturally. "Does your architecture survive any wave order?"

### Comparable Games

- **They Are Billions** (zombie horde defense, cascade collapse as primary drama)
- **Factorio** biters (sustained pressure on production infrastructure, defenses must scale)
- **Kingdom Rush / tower defense genre** (lane defense, wave escalation, resource allocation)
- **FTL: Faster Than Light** (system cascade failure under pressure, oxygen → fire → hull → crew death spiral)

---

## Type 5: "The Infiltration" — Objective-Based Assault Through Enemy Territory

### How It Works

The player's agents must cross enemy-controlled territory to reach a specific objective (destroy a target, hack a terminal, extract data). The board is populated with enemy patrols and defenses. Unlike the siege, the player is on offense — pushing through rather than holding ground.

**Locked example:** Mission 8 (Breach) — enemy spawner, turrets, walls, two objectives (data terminal + power core). Specialist needed to hack turrets.

### Mechanical Signature

- **Primary primitives tested:** Multi-blueprint coordination (hack team + strike team), parallel channel architectures, specialist unit usage, timing/sequencing
- **Decision shape:** Operational planning. "How do I coordinate multiple teams moving through space toward different objectives?"
- **Failure mode:** Teams desynchronized — hack team arrives before escort, specialist dies. Or: single-architecture tries to do everything, gets overwhelmed. Or: clock runs out while fumbling with turret defenses.
- **Optimal architecture:** Parallel architectures from one factory — distinct channel topologies for distinct objectives. "hack-net" and "strike-net" as independent operating units.
- **Scaling axis:** Number of objectives, enemy density, turret placement, time pressure (spawner producing reinforcements), terrain complexity (walls, chokepoints)

### Sensory Description

The Plan screen shows a board dense with threat markers. Red tiles indicate enemy patrol routes. Orange tiles mark turret coverage zones — overlapping cones of fire rendered as translucent orange wedges. The objectives glow gold at opposite corners of the board. The player's base sits in a third corner. Ghost units show the deployment plan: a cluster of strikers on "strike-net" (red channel lines), a pair of specialists with scout escort on "hack-net" (blue channel lines), a relay positioned mid-board bridging both.

During sealed watch: the two teams emerge from the base in sequence (production queue order). The hack team moves west, the strike team moves east. Scout escorts detect a turret at B4 — a signal fires on hack-net, the specialist changes course to approach from behind. The specialist reaches the turret, the hack skill activates — the turret's threat cone flickers, dims, goes dark. The hack team presses forward. Meanwhile, the strike team encounters a patrol — striker engages, one-shot kill, but the combat triggers an EM emission, alerting another patrol.

The board feels like a heist movie: two operations running simultaneously, tension building as each team encounters obstacles, the relay in the middle bridging their awareness. When one team's timeline falls behind, the other must adapt — or the command agent reroutes resources.

**Audio:** Two distinct audio channels matching the two team topologies — hack-net has a low electronic hum, strike-net has a percussive military rhythm. When a turret is hacked, a satisfying power-down whine. When the two teams' timelines converge (both reaching objectives simultaneously), the audio channels merge into a combined theme.

### Strengths

- Maximum architectural complexity — forces multi-blueprint, multi-channel, multi-objective thinking
- Feels like commanding a real operation, not solving a puzzle
- Specialist units finally shine (hack/extract as mission-critical, not optional)
- Creates emergent narrative: the heist that goes wrong, the improvised adaptation, the clutch save
- High replay variance: different turret placements, patrol routes, spawn timings create different puzzles each run

### Weaknesses

- Complexity spike — requires understanding ALL primitives simultaneously
- Can be frustrating if the player doesn't realize they need parallel architectures (tries single-net approach, fails repeatedly)
- Long setup time in Plan screen — many blueprints to configure, many channels to name
- If the hack team fails, the mission is essentially over — high "restart tax"

### Interaction Effects

- **With stealth:** Natural pairing — infiltration + emission management = "quiet heist" variant.
- **With command agent:** Command agent coordinating two teams mid-battle is peak meta-level gameplay.
- **With production:** Factory must produce two teams in the right order — production queue sequencing becomes a strategic decision (hack team first? Strike team first? Interleave?).
- **With time pressure:** Enemy spawner creates urgency — the longer you take, the more enemies appear. Pushes toward aggressive architecture over cautious.

### Comparable Games

- **Invisible Inc.** (stealth infiltration, objective extraction, escalating alarm)
- **XCOM** (squad-based tactical assault, specialist roles, overwatch/flank positioning)
- **Commandos / Desperados** (parallel team coordination, timing-critical operations)
- **Heat Signature** (infiltration with time pressure and improvisation)

---

## Type 6: "The Mirror Match" — Factory vs. Factory

### How It Works

Both sides have bases, production queues, and autonomous architectures. The win condition is destroying the enemy base. This is the apex mission type — the full system test where everything matters: information architecture, production economy, resource denial, and counter-architecture design.

**Locked example:** Missions 9-10 (Arms Race, The Warden) — enemy base with blueprints and (in Mission 10) a command agent.

### Mechanical Signature

- **Primary primitives tested:** Everything simultaneously. Meta-level strategy — which architecture beats THIS enemy's architecture?
- **Decision shape:** Adversarial systems design. "I'm building a factory to outthink their factory."
- **Failure mode:** Attrition stalemate (evenly matched, grinding forever), or catastrophic mismatch (enemy architecture hard-counters yours, collapse in 20 ticks)
- **Optimal architecture:** Reconnaissance-first (scout enemy architecture) → adaptive (command agent adjusts production based on enemy composition) → exploitation (find the structural weakness, build to exploit it)
- **Scaling axis:** Enemy architecture complexity (rigid/scripted → adaptive/learning), enemy resource advantage, terrain asymmetry, enemy unit variety

### Sensory Description

The board is split: player base lower-left, enemy base upper-right. Both empty at tick 0. Then, simultaneously, both bases begin producing. The production conveyor belt in the HUD shows the player's queue; a mirrored shadow-queue in the upper corner shows the enemy's visible production (if scouts can observe it). Units stream from both bases, establishing patrol routes, relay networks, channel topologies. The two autonomous systems expand toward each other like growing organisms.

The first contact moment: a player scout's perception radius overlaps an enemy patrol route. The scout's buffer receives an enemy observation. A signal fires on "recon-alpha." The relay receives it. The striker turns. The game shifts from expansion to engagement. But the enemy's architecture is also reacting — their scouts detected the player's relay's emissions. Their strikers are converging.

The sealed watch is a chess game played by two alien intelligences the player designed. Each tick resolves like a complex equation — dozens of hook fires, buffer updates, movement decisions happening simultaneously. The player watches their creation operate, hoping the design decisions hold up under adversarial pressure.

When one side's architecture breaks — a relay destroyed, a channel severed, a command agent overwhelmed — the collapse cascades. The losing side's units begin acting on stale data, moving toward threats that no longer exist, ignoring the flanking force that just appeared. The winning side's architecture, still coherent, methodically dismantles what's left.

**Audio:** Both sides have distinct sound palettes — player signals are cool-toned (chimes, clicks), enemy signals are warm-toned (thuds, hums). As the battle develops, the two soundscapes overlap and compete. A successful architecture sounds like a well-conducted orchestra. A collapsing architecture sounds like instruments dropping out one by one until silence.

### Strengths

- The ultimate Robot Uprising experience — this IS the game's promise delivered
- Maximum emergent narrative: two autonomous systems clashing produces unpredictable drama every time
- TikTok gold: "My decoy scouts overwhelmed the enemy's relay, crashed their architecture, and my strikers walked through an army that couldn't see them"
- Inspector replay of a mirror match is endlessly analyzable
- Directly maps to real adversarial AI concepts: red team vs. blue team, architecture resilience

### Weaknesses

- Requires mastery of ALL systems — steep skill floor
- Long sealed watches (80-100+ ticks for close matches)
- Risk of dominant strategy if one architecture template beats most enemy configs
- Balance is extremely difficult — small advantages compound over 100 ticks into blowouts
- If both sides are well-designed, can devolve into attrition with no clear resolution mechanism

### Interaction Effects

- **With robustness (1.04e):** Mirror matches with randomized enemy blueprints are the ultimate robustness test.
- **With Gauntlet/PvP:** Mirror matches ARE the Gauntlet format. Campaign mirrors are practice for PvP mirrors.
- **With campaign structure:** Must appear late (Missions 9-10) because it requires all other skills. The locked arc handles this correctly.
- **With replayability:** Highest replay potential of any mission type. Different enemy architecture = completely different puzzle.

### Comparable Games

- **StarCraft** macro games (two bases expanding, economy + army composition as strategic dimensions)
- **Gladiabots** ranked PvP (architecture vs. architecture, no direct control)
- **Robocode** (program-vs-program, emergent combat)
- **Auto Chess / Teamfight Tactics** (build → deploy → watch autonomous battle → iterate)

---

## Type 7: "The Escort" — Protecting a Fragile VIP

### How It Works

A high-value, fragile unit (a specialist extracting data, a command agent being relocated, a captured enemy unit being transported) must traverse from point A to point B. The VIP has no combat capability and limited buffer space. The player's architecture must protect, guide, and communicate with the VIP while handling threats along the route.

**Not in locked missions, but naturally extends from Mission 8's specialist escort subplot.**

### Mechanical Signature

- **Primary primitives tested:** Rules (priority-based threat response near VIP), hooks (VIP status broadcasts), spatial coordination (escort formation)
- **Decision shape:** Protective topology. "How do I build a moving bubble of awareness around a fragile target?"
- **Failure mode:** Escort units pulled away by distractions, leaving VIP exposed. Or: escort too tight, missing flanking threats. Or: VIP's buffer fills with irrelevant data, it stops moving.
- **Optimal architecture:** Layered defense — inner scouts detecting immediate threats, outer scouts providing early warning, strikers on intercept routes, relay maintaining communication with the moving cluster
- **Scaling axis:** VIP speed vs. threat density, route length, ambush points, VIP doing something useful during transit (extracting data from nodes it passes)

### Sensory Description

The VIP unit has a distinct visual treatment: a golden border, slightly larger than standard units, with a pulsing white aura. Its buffer bar is prominent — only 4 slots, meaning every piece of information matters. The escort formation surrounds it: scouts in a diamond pattern at perception range, strikers at close range, a relay trailing behind maintaining the communication link back to base.

During sealed watch, the formation moves across the board like a convoy. The outer scouts' perception cones sweep ahead and to the sides — translucent blue fans rotating with each tick. When a scout detects an enemy, the hook fires: a cyan signal arrow races to the relay, which forwards to the nearest striker. The striker breaks formation to engage. The gap in the escort is visible — one side of the diamond is now exposed. If another threat appears on the exposed flank before the striker returns...

The tension is geographic and temporal: will the striker finish engagement and return before the next threat? Is the VIP's buffer clean enough for it to keep moving, or has irrelevant data clogged it and forced a stop?

**Audio:** The VIP has a gentle heartbeat sound — steady, calm when protected, quickening when threats are near. Escort movement has coordinated footstep sounds, military and precise. When the formation breaks (a striker engaging), the heartbeat sound stutters — the VIP is less protected. When the escort reforms, the heartbeat stabilizes.

### Strengths

- Creates intense emotional investment in a single unit's survival — personal stakes
- Tests spatial reasoning about moving defensive architectures
- Forces dynamic topology — the network moves with the VIP, not static relay placement
- Natural narrative: "escort the defector," "transport the data core," "protect the wounded command agent"
- TikTok clip: a last-second striker interception saving the VIP from an ambush

### Weaknesses

- Can feel frustrating if the VIP has bad pathfinding or buffer management — "I did everything right but my VIP stopped moving because its buffer filled"
- Escort missions in other games are widely considered the worst mission type — Robot Uprising must solve why
- The player has no direct control over VIP movement, which amplifies frustration
- If escort architecture is solved (standard diamond formation), every escort mission uses the same template

### How to Avoid the "Escort Mission" Stigma

The reason escort missions are hated in most games: the player must slow down to match a dumb AI's pace, and the AI makes stupid decisions the player can't override. Robot Uprising avoids this because:
1. The VIP IS an agent the player configured — its behavior IS the player's design
2. The player doesn't move at all — they design, then watch. There's no "slow down" frustration.
3. The VIP's failure modes (buffer overflow, bad pathing) are diagnosable in the Inspector — the player can fix the DESIGN, not retry the same dumb AI.

### Interaction Effects

- **With stealth:** Escort + stealth = "get the VIP through undetected." Emission budget is tightest when protecting a fragile unit.
- **With production:** Factory can't help mid-mission if the VIP dies before reinforcements arrive. Pre-battle preparation matters most.
- **With command agent:** Command agent rerouting escort units mid-battle is the highest-value command action.
- **With specialist units:** Specialist AS VIP (extracting data along the route) creates dual-objective: protect AND exploit.

### Comparable Games

- **XCOM** VIP extraction missions (escort to evac zone, ambush-heavy routes)
- **Into the Breach** civilian building protection (protecting fragile objectives)
- **The Legend of Zelda: Breath of the Wild** escort quests (widely hated — cautionary tale)
- **ICO** (entire game is escort — emotional investment in vulnerable companion)

---

## Type 8: "The Puzzle Box" — Fixed Configuration Challenge

### How It Works

The player receives a pre-built architecture with a specific flaw. The challenge is to find and fix the flaw using limited modifications (e.g., "change exactly 2 rules," "move 1 relay," "add 1 hook"). The architecture mostly works — but fails under specific conditions that the player must diagnose.

**Not in locked missions as a distinct type, but Mission 1's filter puzzle is a minimal version.**

### Mechanical Signature

- **Primary primitives tested:** Diagnosis skill — reading buffer states, tracing signal paths, identifying bottlenecks
- **Decision shape:** Diagnostic. "What's wrong with this architecture?" followed by surgical fix.
- **Failure mode:** Wrong diagnosis — player fixes the wrong thing, breaks something else
- **Optimal approach:** Run, observe failure in Inspector, hypothesize, apply minimal fix, run again
- **Scaling axis:** Architecture complexity, flaw subtlety, modification budget, number of interacting flaws

### Sensory Description

The Plan screen shows a pre-wired architecture — all units placed, all hooks configured, all rules set. But the player can see certain elements highlighted with a faint amber border: "modifiable." Everything else is locked (greyed out, non-interactive). The player can examine but not change most of the architecture.

The player hits EXECUTE. The sealed watch runs. Something goes wrong at tick 23 — a striker fails to engage, a relay overflows, a command agent sends the wrong instruction. The Inspector opens. The player scrubs to tick 22, one tick before failure. They click the failing unit. Buffer contents visible: slot 1 is a stale scout report from tick 5, slot 2 is the relay's compressed alert, slot 3 is a duplicate of slot 2, slots 4-8 are noise from an unconfigured perception cone.

The diagnosis: the relay's compress skill is sending duplicates because its hook fires on every tick (not just on new observations). The fix: change the relay's hook trigger from ON_TICK to ON_PERCEIVE. One modification. Execute again. It works.

**Audio:** A "case file" sound when the puzzle opens — a file folder slap. Locked elements have a muted click when the player tries to interact. Modifiable elements ring with a bell tone on hover. The successful fix plays a satisfying latch sound — mechanical, precise, like a lock clicking open.

### Strengths

- Teaches diagnostic thinking, which is the game's deepest skill
- Low time commitment — puzzle missions can be 5-minute sessions
- Introduces architectural patterns the player hasn't seen (the pre-built architecture is a teaching tool)
- Scales beautifully: easy = obvious flaw, hard = the flaw is a subtle interaction between 3 components
- Perfect for daily challenges or community-created content

### Weaknesses

- Limits player creativity — you're fixing someone else's design, not building your own
- Can feel like a multiple-choice test if the modification options are too constrained
- Risk of "red herring" frustration if the architecture has many suspicious-looking elements
- Doesn't test production, command, or meta-level skills

### Interaction Effects

- **With Inspector:** The Inspector IS the game in puzzle missions. Puzzle missions are Inspector training.
- **With campaign structure:** Best as optional side missions between main campaign missions — "debugging exercises."
- **With community:** Players designing puzzles for each other is high-potential community content.
- **With onboarding:** Excellent bridge between tutorials and open missions — guided but not handholding.

### Comparable Games

- **Zachtronics SpaceChem** (pre-built partial solutions to extend)
- **The Witness** (constrained puzzle with single "aha" solution)
- **Bug-fixing code challenges** (LeetCode, Advent of Code — find the bug in working code)
- **Chess puzzles** (given a board state, find the best move)

---

## Type 9: "The Arms Race" — Iterated Counter-Design

### How It Works

The player faces the same enemy architecture repeatedly, but the enemy adapts between attempts. First attempt: enemy uses basic patrols. Player builds counter-architecture. Second attempt: enemy has adapted to the player's approach (more scouts detecting flanks the player exploited). Third attempt: enemy countered the counter. The player must design architectures that are robust to the enemy's adaptations — or find exploits in the adaptation pattern.

**Locked example (partial):** Mission 9 (Arms Race) — enemy base adapts each replay with different blueprint priorities. Mission 10's Warden has structural weaknesses that vary.

### Mechanical Signature

- **Primary primitives tested:** Robustness design, counter-architecture thinking, adaptation to changing conditions
- **Decision shape:** Meta-strategic. "How do I build something that works against multiple enemy variations?"
- **Failure mode:** Over-specialized architecture that beats variant A but loses to variant B. Or: spreading too thin trying to handle everything.
- **Optimal architecture:** Generalist core + scout-driven adaptation (detect enemy type → command agent adjusts production/routing accordingly)
- **Scaling axis:** Number of enemy variants, how different variants are from each other, whether the player gets to see the enemy's changes before or after EXECUTE

### Sensory Description

The mission briefing screen shows a "threat assessment" panel: the enemy base icon with a rotating holographic display of possible configurations. Three small silhouettes show the enemy's last 3 known configurations, each slightly different — one scout-heavy, one striker-heavy, one relay-heavy. A randomization indicator pulses: "ENEMY CONFIGURATION: VARIABLE."

After each attempt, the debrief shows a "counter-intelligence report" — what the enemy changed and (for higher-difficulty) why. "Enemy adapted: +2 scouts on eastern approach. LIKELY REASON: your last attempt exploited eastern blind spot." The player sees their own architecture being studied. The feeling is adversarial — you're not fighting a static puzzle, you're in an arms race with a thinking opponent.

**Audio:** A chess clock ticking during the counter-intelligence report. Each enemy adaptation announcement has a ominous bass note. The player's response — modifying their architecture — sounds like pieces being moved on a board.

### Strengths

- Creates the strongest "one more attempt" loop — each loss teaches something specific
- Directly models the iterative design process that IS agentic AI engineering
- Tests the meta-skill: designing for robustness, not for specific scenarios
- Natural difficulty curve: more sophisticated enemy adaptation = harder puzzle
- The Gauntlet IS this type, infinitely

### Weaknesses

- Requires sophisticated enemy AI or a large library of pre-designed enemy variants
- Risk of "I solved it, but then the enemy cheated by changing" — perceived unfairness
- Can feel exhausting if the iteration cycle is too long (full 80-tick battle per attempt)
- If enemy adaptations are random rather than responsive, it feels like guessing, not strategizing

### Interaction Effects

- **With Gauntlet/PvP:** The iterated arms race IS the Gauntlet structure. Each opponent's architecture is a new adaptation.
- **With Inspector:** Post-battle analysis of WHY the enemy adapted enables learning. Without Inspector, it's just trial-and-error.
- **With command agent:** Command agent's mid-battle adaptation is the real-time version of inter-attempt adaptation.
- **With robustness scenarios (1.04e):** The arms race is the macro-level version of the 100-test-case pattern.

### Comparable Games

- **Slay the Spire** (Act 1 builds your deck, Act 2 tests it against different challenges, Act 3 requires adaptation)
- **Gladiabots** ranked ladder (opponents adapt week to week, meta shifts)
- **Mega Man** boss rematches (same bosses, different acquired weapons, new strategies)
- **Speed Chess / Blitz** (opponent adjusts between games, you must vary your opening)

---

## Type 10: "The Sandbox Experiment" — Open-Ended Free Play

### How It Works

No win condition. No enemies (or optional enemies). The player has full access to all unit types, skills, and resources. The objective is to build, test, and observe architectures for fun. A playground mode where the player can prototype ideas before deploying them in campaign or Gauntlet missions.

**Not in locked missions, but sandbox mode is referenced in the broader design as a potential feature.**

### Mechanical Signature

- **Primary primitives tested:** Creativity, experimentation, deep system understanding
- **Decision shape:** Open-ended. "What happens if I wire 6 relays in a ring?" "Can I build a relay chain that spans the entire board?"
- **Failure mode:** No failure — or rather, failure IS the content. Testing what breaks and why.
- **Optimal architecture:** There is none. That's the point.
- **Scaling axis:** Tool availability (all units? custom units? modified rules?), spawn controls (place anything anywhere), speed controls (fast-forward, slow-motion, pause)

### Sensory Description

The board is empty. The full production menu is open: every unit type, unlimited resources, click-to-place anywhere. No base required. The Plan screen's workbench shows all skills unlocked, all hook types available, all rules at maximum expressiveness. A "scenario editor" sidebar offers toggles: add enemy patrols (adjustable count, route, detection), set tick limit (or infinite), enable/disable EM emissions, enable/disable one-shot-kill.

The player places a scout, a relay, and a striker in a line. Wires the hooks. Hits EXECUTE. Watches 10 ticks of the three-unit chain operating. Hits PAUSE (allowed in sandbox). Adds two more scouts. Resumes. Watches the relay overflow. Adds a second relay. Watches the load balance. Adjusts eviction policy. Runs 50 ticks. Reviews in Inspector.

The sandbox has a "record" button that saves the configuration + replay as a shareable file. Players can share "cool architectures" as sandbox recordings.

**Audio:** Ambient background — a calm electronic hum. No tension music. Placement sounds are soft clicks. Execution has the normal signal and combat sounds but at reduced volume. The vibe is a workshop, not a battlefield.

### Strengths

- Essential for deep players who want to understand the system completely
- Content creation tool — community-designed missions and challenges
- Low-stress environment for practicing before high-stakes Gauntlet attempts
- "Factorio sandbox" energy — some players will spend more time here than in the campaign
- Showcases the game's systemic depth without pressure

### Weaknesses

- No goal = no motivation for goal-oriented players
- Can become a "solitaire distraction" (aspect 5.11) that's more engaging than the campaign
- Needs significant UI investment (scenario editor, speed controls, pause, place-anywhere)
- Risk of players optimizing in sandbox, then finding the campaign trivially easy

### Interaction Effects

- **With campaign:** Sandbox should be gated behind Mission 5 (factory introduction) to prevent overwhelming new players.
- **With community (7.x):** Sandbox is the foundation for community content — shared architectures, custom challenges, puzzle creation.
- **With replayability:** Sandbox IS replayability for the system-explorer player archetype.
- **With onboarding:** A guided sandbox (with suggested experiments) can complement the tutorial without replacing it.

### Comparable Games

- **Factorio** sandbox mode (creative mode, unlimited resources, test designs)
- **Kerbal Space Program** sandbox (build rockets without budget constraints)
- **Minecraft** creative mode (unrestricted building, no survival pressure)
- **Opus Magnum** infinite canvas (no constraint on solution size in most puzzles)

---

## Cross-Cutting Analysis: Which Types Appear in the Locked Campaign?

| Mission | Primary Type | Secondary Type | Missing Types |
|---------|-------------|---------------|---------------|
| 1 — Wake Up | Filter Puzzle | — | — |
| 2 — First Contact | Relay Network (basic) | — | — |
| 3 — Blind Spots | Relay Network (scaled) | — | — |
| 4 — Noisy Channel | Stealth Run | Relay Network | — |
| 5 — Assembly Line | Relay Network (factory) | — | — |
| 6 — Chain of Command | Infiltration (lite) | Arms Race (reactive) | — |
| 7 — Pressure Test | Siege | Resource Management | — |
| 8 — Breach | Infiltration | Multi-Objective | — |
| 9 — Arms Race | Mirror Match | Arms Race (iterated) | — |
| 10 — The Warden | Mirror Match (boss) | Arms Race (iterated) | — |

**Types NOT in the locked campaign:**
- Escort (Type 7) — hinted at in Mission 8's specialist coordination but not the primary objective
- Puzzle Box (Type 8) — Mission 1 is a minimal version, but full "fix the pre-built architecture" isn't explored
- Sandbox Experiment (Type 10) — not a mission type, but a mode the campaign doesn't include

**Types under-represented:**
- Stealth Run — only Mission 4, then emissions become one factor among many
- Siege — only Mission 7, then the game moves to offense
- Escort — nowhere as a primary objective

---

## Gauntlet Mission Type Distribution

For the post-campaign Gauntlet (infinite play), mission types should rotate to test all architectural skills:

| Gauntlet Format | Types Mixed | Why |
|----------------|-------------|-----|
| The Obstacle Course | Stealth → Escort → Siege → Mirror | Tests architecture across all stress modes with ONE config |
| The Specialist Exam | Pure Puzzle Box | 3-minute diagnostic challenges, fastest time wins |
| The Endurance Run | Siege (escalating, 200+ ticks) | How long can your architecture last? |
| The Heist | Infiltration + Stealth + Time Pressure | Maximum coordination, minimum emissions |
| The Grand Prix | Mirror Match (best of 5, different maps) | Architecture consistency across varied terrain |
| The Workshop | Community Puzzle Boxes | Player-created challenges, rated by community |

---

## Player Journeys

### Journey: Tomás, 16, First Strategy Game Ever

**Context:** Mission 7 (Pressure Test), his first encounter with the Siege type. He's beaten Missions 1-6 over the past week. He understands hooks, relays, and basic channel architecture. He just unlocked the factory in Mission 5 and the command agent in Mission 6.

**Minute 0:00 — The Briefing**
The boot log prints: `MODULE: STRESS_TEST — STATUS: Initializing sustained combat evaluation. Incoming wave data: [ENCRYPTED]. Production resources: CONSTRAINED.` Tomás sees the board: his base in the lower-left, two material nodes (one nearby, one contested in the center), and a wave indicator in the top-right corner showing "WAVE 1: 3 ENEMIES — NORTH" with greyed-out waves behind it.

He opens the workbench. His production queue from Mission 6 is still loaded as a template. 3 scouts, 1 relay, 2 strikers. But the resource counter reads: 15 materials, 4 energy/tick. His old queue cost 32 materials. He can't build everything.

**Minute 1:30 — First Attempt Configuration**
He cuts the queue to 2 scouts, 1 relay, 1 striker. Cheaper. Assigns scouts to patrol north (where Wave 1 is coming from). Relay in the center. Striker behind the relay. Channels: "recon" from scouts to relay, "engage" from relay to striker. He's reusing his Mission 3 topology. Hits EXECUTE.

**Minute 2:30 — Sealed Watch: Wave 1 (Ticks 1-15)**
Scouts deploy, fan out north. First enemy detected at tick 5. Signal fires on "recon." Relay receives, forwards on "engage." Striker moves to intercept. Clean kill at tick 8. Two more enemies — handled by tick 14. Wave 1 cleared. Tomás pumps his fist.

**Minute 3:00 — Sealed Watch: Wave 2 (Ticks 16-30)**
Wave 2: 5 enemies, north AND east. His scouts only patrol north. The eastern approach is unmonitored. Two enemies slip through on the east side. The relay's buffer receives frantic scout reports from the north but nothing from the east. The striker engages northward. Two enemy units reach his base from the east. Base takes damage (or in one-shot-kill: a critical unit near the base gets destroyed). Tomás watches, helpless. "I only covered north!"

**Minute 3:30 — Sealed Watch: Wave 3 (Ticks 31-45)**
Wave 3: 7 enemies from three directions. His single relay can't handle the signal volume from both remaining scouts covering north plus the new threats. Buffer overflow at tick 33. The relay's buffer bar pulses red. Signal X-marks everywhere. The striker gets contradictory information — stale north report in slot 1, urgent east alert in slot 3, noise in slots 5-8. It moves north. The south is wide open. Total collapse by tick 40.

**Minute 4:00 — Inspector: Diagnosis**
Tomás scrubs to tick 16 — the start of Wave 2. He clicks the relay. Buffer at 5/12 — healthy. He scrubs to tick 25. Buffer at 12/12 — full. He sees the dropped signals: three east-flank alerts from scout K₂ all bounced. "If the relay had forwarded even ONE of those, the striker would have gone east instead of north."

He opens the queue depth chart. A clear spike at tick 22. The relay was already processing north signals when the east wave hit. No buffer space. He realizes: one relay isn't enough for multi-directional threats. He needs a second relay, or better — scout routing that prioritizes NEW threats over ongoing ones.

**Minute 5:30 — Second Attempt**
He adds a second relay to the production queue. Assigns "recon-east" and "recon-north" as separate channels. Each relay listens to one. Both forward to the striker on "engage." Now the striker gets parallel feeds from two relays, each monitoring one flank. He also adds an eviction policy on the striker: "drop oldest signal first" so stale north data doesn't crowd out fresh east alerts.

He hits EXECUTE. Survives to Wave 4.

**Minute 8:00 — Resolution**
After three more attempts, each time pushing one wave further, Tomás beats the mission on his fifth try with a 3-relay, 3-scout, 2-striker architecture that covers all approaches. His final realization: "I need to design for the WORST wave, not the first wave. My architecture worked great against 3 enemies but collapsed against 7."

**What he learned:** Resilience design. Redundancy. Eviction policies. Buffer math (N scouts × signal rate vs. relay buffer capacity). The difference between "works" and "works under pressure."

---

### Journey: Dr. Priya, 38, ML Engineer and Factorio Veteran

**Context:** Mission 8 (Breach), her first infiltration-type mission. She's breezed through Missions 1-7 in a single weekend. She immediately grasped the relay network and factory mechanics from professional experience with distributed systems.

**Minute 0:00 — Reading the Board**
The boot log: `MODULE: BREACH_PROTOCOL — STATUS: Multi-objective strike authorized. Targets: [DATA_TERMINAL @ F7] [POWER_CORE @ B2]. Hazards: [TURRETS] [WALLS] [REINFORCEMENT_SPAWNER].` Priya surveys the board: her base at H1, the data terminal at F7 (behind a wall with turret coverage), the power core at B2 (guarded by patrols), the enemy spawner at A8 producing reinforcements every 10 ticks.

She immediately thinks: "Two objectives, one factory. I need two teams." She opens the workbench and starts configuring two blueprints from scratch.

**Minute 2:00 — Architecture Design**
Team Alpha (hack-net): 1 Specialist (hack skill), 2 Scouts (escort), 1 Relay (bridge). Channel: "alpha-recon" (scouts→relay), "alpha-cmd" (relay→specialist). The specialist's rules: "IF receive turret-detected on alpha-cmd → move adjacent to turret → hack." The scouts' rules: "patrol around specialist, report threats on alpha-recon."

Team Bravo (strike-net): 2 Strikers, 1 Scout (forward observer), 1 Relay. Channel: "bravo-recon" (scout→relay), "bravo-engage" (relay→strikers). Standard assault formation.

Command Agent: Listens to both "alpha-recon" and "bravo-recon." Rule: "IF alpha-team-complete on alpha-cmd → reroute bravo-team to power-core." The command agent coordinates timing — hack team goes first, then strike team.

Production queue: Alpha team first (specialist, 2 scouts, relay), then Bravo team (2 strikers, scout, relay), then command agent.

**Minute 4:00 — First Attempt**
She hits EXECUTE. The factory builds Alpha team first. Specialist and escorts deploy toward F7. Scout detects the turret at E6 — fires on alpha-recon. Relay at G4 forwards. Specialist moves toward E6. But a patrol intersects at tick 12. Scout detects the patrol, fires on alpha-recon. Specialist now has two signals: turret ahead, patrol approaching. Its rules say "turret-detected → hack" — it ignores the patrol. The patrol destroys the specialist at tick 14. Mission over before Bravo team even deploys.

**Minute 4:30 — Inspector Diagnosis**
Priya scrubs to tick 12. Specialist's buffer: [turret-E6, patrol-D5]. Rules evaluation: first matching rule is "turret-detected → hack." The patrol signal is in the buffer but the rule doesn't account for immediate threats. She realizes: the specialist needs a HIGHER priority rule — "IF threat-adjacent → evade" — BEFORE the hack rule. Priority ordering matters.

**Minute 5:30 — Fix and Second Attempt**
She adds the evade rule at priority 1. Hack rule drops to priority 2. Also adds a rule for the escort scouts: "IF specialist-under-threat on alpha-cmd → converge on specialist position." Now the escorts will actively protect the specialist, not just patrol nearby.

Second attempt: specialist evades the patrol, escorts engage it, specialist resumes hack path. Turret disabled at tick 22. Alpha team signals completion. Command agent reroutes Bravo. Strike team assaults power core. Enemy spawner produces reinforcements — but the timing is right. Strikers breach the core at tick 38, 2 ticks before reinforcements would have overwhelmed the position.

**Minute 7:00 — Resolution**
Priya completes the mission on her second attempt. She spends 3 more minutes in the Inspector tracing the command agent's reroute decision at tick 23 — marveling at how her architecture adapted mid-battle. "This IS the distributed systems problem. Priority ordering, message routing, graceful degradation. I'm not playing a game, I'm designing microservices."

**What she learned:** Rule priority ordering is critical. Escort requires explicit protection logic, not just proximity. Command agent timing depends on production queue sequencing.

---

### Journey: Kai, 11, Minecraft Builder and First Strategy Game

**Context:** A Gauntlet "Workshop" puzzle box — a community-created challenge he found on the game's sharing hub. He's beaten the campaign but prefers puzzles to mirror matches.

**Minute 0:00 — The Puzzle**
The screen shows a pre-built architecture: 4 scouts, 2 relays, 2 strikers, 1 command agent. All wired up. A briefing panel reads: "This architecture fails at tick 31. You may change EXACTLY 2 rules and 1 hook. Find the bug."

Kai hits EXECUTE without changing anything. He wants to see the failure first.

**Minute 0:30 — Watching the Failure**
The architecture runs cleanly for 30 ticks. Scouts patrol, relays process, strikers engage. At tick 31, a second enemy wave arrives from the south. The command agent receives the south-alert signal. It fires a reroute instruction to Striker-B on channel "cmd-south." Striker-B's buffer receives the reroute... but Striker-B doesn't move. It continues engaging a northern enemy that's already been eliminated. Tick 32: south enemies advance. Tick 33: they reach the base.

**Minute 1:00 — Inspector Investigation**
Kai scrubs to tick 31. Clicks Striker-B. Buffer contents: [engage-north (tick 25), reroute-south (tick 31), enemy-eliminated-north (tick 29), engage-north (tick 27), stale-patrol (tick 18), stale-patrol (tick 12), stale-patrol (tick 8), stale-patrol (tick 3)]. Buffer is 8/8. The reroute-south signal is in slot 2, but the RULES evaluate top-to-bottom: Rule 1 is "IF engage-target in buffer → engage." The stale engage-north from tick 25 is in slot 1. It matches Rule 1 first. The reroute never gets evaluated.

Kai scrolls through the rules. He counts: Rule 1 (engage), Rule 2 (reroute), Rule 3 (patrol). The bug: engage is higher priority than reroute. Stale engage data in the buffer keeps triggering engage even after the target is eliminated.

**Minute 2:00 — The Fix**
Fix 1 (rule change): Move reroute ABOVE engage in priority order. Now reroute commands from the command agent override active engagement.

Fix 2 (rule change): Add a condition to the engage rule: "IF engage-target in buffer AND target-still-alive." But wait — Kai realizes the striker can't know if the target is still alive unless it gets an updated observation. The stale engage-north signal doesn't have a "target-alive" flag. So instead: change the engage rule's condition to "IF engage-target in buffer AND signal-age < 3 ticks." Fresh engagement signals override stale ones.

Fix 3 (hook change): Change the command agent's hook to broadcast reroute on the SAME channel as engage (so it overwrites the engage signal in the buffer) rather than on a separate "cmd-south" channel.

Kai applies fixes 1 and 2 (his two rule changes) and fix 3 (his one hook change). Hits EXECUTE.

**Minute 2:30 — Success**
The architecture runs to tick 50. At tick 31, the reroute fires. Striker-B's new rules: reroute (priority 1) triggers. It turns south. Engages the southern wave. Clean sweep. The puzzle flashes "SOLVED" with a green border. Time: 2 minutes 34 seconds.

**Minute 3:00 — Resolution**
Kai checks the community leaderboard for this puzzle. Average solve time: 4 minutes 12 seconds. His 2:34 puts him in the top 20%. He clicks "share replay" — his diagnosis scrubbing is recorded and posted. He browses other players' solutions. One person solved it with a COMPLETELY different approach: changing the eviction policy instead of the rule priority. "Whoa, that works too?"

**What he learned:** Rule priority ordering. Signal staleness. The relationship between buffer age and decision quality. That the same bug can have multiple valid fixes.

---

### Journey: Amara, 45, Non-Gamer, Plays Because Her Son Recommended It

**Context:** Mission 4 (Noisy Channel), her first stealth-type mission. She's spent two weeks on Missions 1-3, playing 20 minutes per evening. She understands filters and basic relay topology but finds hooks confusing.

**Minute 0:00 — The Briefing**
The boot log: `MODULE: EMISSION_CONTROL — WARNING: Enemy detection capability confirmed. Hook transmissions produce detectable electromagnetic signatures.` Amara reads this twice. She's not sure what "electromagnetic signatures" means in the game's context. She sees the board: her 6 units pre-placed, enemies on the far side. She notices something new in the Plan screen — an "EM Overlay" toggle in the corner. She clicks it.

**Minute 0:30 — Discovery**
The EM overlay activates. Concentric rings appear around every unit that has hooks configured. Her relay — which she wired with 4 hooks in Mission 3 — has HUGE rings. Bright amber-red, pulsing. Her scouts have smaller rings. Her strikers, with only receive-hooks, have tiny rings. A tooltip on the relay reads: "EM emission radius: 7 tiles. Detectable by enemies within this range."

Amara hovers over an enemy. Its detection cone is visible: a pale red wedge, 5 tiles deep. She can see that the enemy's detection cone overlaps with the relay's emission radius. "Oh. They can HEAR my relay talking."

**Minute 1:30 — First Attempt**
She doesn't change anything. Hits EXECUTE. She wants to see what happens.

Sealed watch: scouts patrol, detect enemies, fire hooks. Relay receives. EM overlay shows emission rings pulsing with each hook fire — bright blue flashes expanding outward. An enemy's detection cone sweeps across a relay emission. The enemy's icon flashes yellow. It turns. It starts walking toward the relay. Then another enemy detects the emissions. Then a third. They converge on the relay like sharks to blood. The relay is destroyed at tick 18. Her architecture collapses. "Oh no! They came right for it!"

**Minute 2:30 — Inspector**
She opens the EM emission overlay in the Inspector. Scrubs back to tick 10. The emission heatmap shows the relay as a bright red spot — each hook fire added to the cumulative emission signature. She can see the exact tick when the first enemy detected it: tick 12. The emission radius overlapped the detection cone at that tick because the relay had just forwarded 3 signals in 2 ticks.

She clicks the relay. Its buffer shows: 12 signals received in 12 ticks. Each one generated an outbound hook fire. 12 emissions in 12 ticks. "It's sending EVERYTHING it gets. Can I make it send less?"

**Minute 3:30 — Learning Compress**
She opens the relay's blueprint. Under "Skills," she sees two new options she hasn't used: "compress" and "filter." She hovers over compress: "Halve buffer contents, randomly choosing which to keep." She hovers over filter: "Drop all signals below a priority threshold."

She enables compress. In the Plan screen, the relay's EM overlay rings visibly shrink — from 7 tiles to 4. A tooltip: "compress reduces output volume by 50%, reducing EM signature." She enables filter with threshold "medium." Rings shrink further to 2.5 tiles. The enemy detection cones no longer overlap.

**Minute 4:30 — Second Attempt**
She hits EXECUTE. This time, the relay compresses and filters. Emission rings are small, dim pulses — barely visible. Enemies patrol normally, detection cones sweeping past without triggering. Her architecture operates in near-silence. Scouts detect, relay processes quietly, strikers receive clean, compressed signals. The mission completes at tick 45.

**Minute 5:00 — Resolution**
Amara stares at the debrief. She didn't change the topology at all — same scouts, same relay, same strikers. She just made the relay QUIET. "It's like... being loud in a library. The more you talk, the more people notice you. The relay was screaming." She texts her son: "I made my relay whisper and the enemies couldn't find it. This game is WILD."

**What she learned:** EM emissions as a real cost of communication. Compress and filter as noise-reduction tools. The stealth-intelligence tradeoff: a quiet architecture knows less but survives longer.

---

## Discovered New Aspects

1. **5.08a — The "Phase Shift" mission structure:** Missions that change TYPE mid-battle (start as relay network → becomes siege when waves arrive → becomes infiltration when opportunity opens). How do multi-phase missions work with sealed watch pacing?
2. **5.08b — Community mission editor:** What tools does the player need to create custom missions of each type? Mission type as a template system with adjustable parameters.
3. **5.08c — Mission type as difficulty language:** Using mission types as difficulty communication — "Siege: Hard," "Puzzle Box: Medium" — instead of arbitrary star ratings. Players self-select into types they enjoy.
4. **5.08d — "The Gauntlet Rotation" meta-structure:** How Gauntlet missions cycle through types to test all architectural skills. The rotation schedule as a meta-puzzle (this week: stealth + escort combo, next week: siege + puzzle box).
5. **5.08e — Escort mission anti-frustration design:** Deep dive on why escort missions are hated in other games and how Robot Uprising's "design-then-watch" model avoids the core frustrations. The VIP-as-configured-agent insight as key differentiator.
