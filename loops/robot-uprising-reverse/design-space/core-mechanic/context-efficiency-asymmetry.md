# 2.21 — Context Efficiency Asymmetry (Tight vs. Fat Budgets)

## The Option

Should a player who designs a **minimal-footprint context architecture** — small buffers, aggressive filtering, lean signal payloads — actually outperform a player who **maxes every buffer** and subscribes to everything? This is the "budget players vs. big spenders" balance question: does Robot Uprising reward efficiency or capacity?

In real agentic engineering, the answer is nuanced. A Screeps player who builds CPU-efficient creeps with minimal memory footprint can outperform a brute-force player who maxes RAM and runs expensive operations every tick. The efficient player's code runs faster, costs less, and scales better. But the brute-force player's code is simpler to write and debug, and "good enough" for many situations. The tension between these approaches is a real engineering skill — and it maps directly to Robot Uprising's context window mechanic.

### Mechanical Foundation

The locked design creates several natural efficiency levers:

- **Buffer size is a stat.** Scout has 6 slots, Relay has 12, Command has 14. You can't make them bigger — but you can make them effectively smaller by subscribing to less.
- **Context overload = 1 tick stunned.** When the buffer fills and new entries arrive, the unit loses a tick. In a one-shot-one-kill game, one lost tick can be fatal.
- **Emissions scale with hook traffic.** More signals = more EM noise = more detectable. A chatty architecture is a loud architecture.
- **Bandwidth is a shared finite resource.** Complex channel maps consume bandwidth. Simpler architectures leave bandwidth headroom.
- **Compress is lossy.** Halving buffer contents randomly discards entries. The critical signal might be the one that gets dropped.

The question is whether the game should **additionally reward** efficiency through explicit mechanical bonuses — or whether the existing natural advantages are sufficient.

### Six Design Positions

**Position A — "Natural Consequences Only" (No Explicit Bonus)**
Efficiency is already rewarded through avoided stuns, lower EM footprint, and bandwidth savings. No additional mechanical bonus. The player discovers efficiency advantages through play. The buffer size stat is what it is — a Scout with 6 slots has 6 slots whether you use 1 or 6.

**Position B — "Headroom Bonus" (Explicit Reward)**
Units with buffer utilization below 50% gain a tangible benefit: +1 speed, +1 perception range, or priority processing (their actions resolve first in the tick). The metaphor: a mind with spare capacity thinks faster. Visualized as a cool-blue glow around efficient units vs. amber stress on full units.

**Position C — "Fat Tax" (Explicit Penalty)**
Units with buffer utilization above 80% suffer degraded performance beyond the stun mechanic: reduced perception range (tunnel vision), slower movement (cognitive load), or lower signal priority (their signals are processed last). The metaphor: a distracted mind misses things.

**Position D — "Asymmetric Scaling" (Efficiency Compounds)**
Efficiency bonuses compound across the architecture. A squad where every unit runs below 50% buffer gets a squad-level bonus: faster signal propagation (0.5 tick instead of 1 tick per hop), reduced EM emissions (50% quieter), or bandwidth discount. The system rewards architecturally efficient designs, not just individually efficient units.

**Position E — "The Efficiency Trap" (Deliberate Counter)**
Efficiency is powerful early but creates vulnerability late. Lean architectures have no buffer headroom for unexpected information — when the game introduces enemy noise flooding (Mission 4+), jam signals (Mission 8+), or adversarial data injection (Mission 9+), fat-budget architectures survive through absorption while lean ones stun-lock. The game teaches that **resilience requires slack** — the same lesson as capacity planning in real systems.

**Position F — "Dynamic Equilibrium" (Recommended)**
No explicit bonus or penalty beyond what's already locked. Instead, the mission design creates **alternating pressure** that makes both strategies viable at different moments. Early missions reward efficiency (fewer enemies, simpler situations). Mid missions reward capacity (complex multi-front battles). Late missions reward **adaptive architectures** that can shift between lean and fat modes — the Command agent adjusting filter configs mid-battle to tighten or loosen based on threat level. The skill ceiling is not "always lean" or "always fat" but "lean by default, fat when needed."

---

## Player Journeys

#### Journey: Priya, 29, backend engineer, Mission 4 (Noisy Channel)

**Context:** Priya has been playing a lean style since Mission 1. Her scouts ignore everything except threat signals and objective markers. Her relay filters aggressively — only combat alerts pass through. Her striker's buffer hovers at 2/8. She's proud of her "clean" architecture. Mission 4 introduces emissions and enemy detection.

**Minute 0:00 — The Lean Machine**
Plan screen. Priya's blueprints are minimal. Scout-Alpha: listens to [visual contact, threat signal] only, ignores [vibration, EM hum, thermal, acoustic]. Buffer typically at 2/6. Relay-Main: filter rule "drop everything below priority 3." Striker-Bravo: listens on strike-net only, buffer at 2/8. The whole architecture runs cool — context bars on ghost units glow steady blue. She's configured the system like she'd configure a production microservice: minimal resource allocation, maximum efficiency.

**Minute 0:20 — First Execution**
She hits EXECUTE. Sealed watch plays. Her scouts sweep the map. Minimal EM emissions because the hook chain is short and infrequent. Enemies don't detect her relay — it's electromagnetically quiet. Scouts find threats, signal to relay, relay forwards to striker. Striker eliminates three enemies. Clean run.

**Minute 1:30 — The Efficiency Payoff**
Inspector shows buffer utilization: Scout-Alpha averaged 33% (2/6), Relay-Main averaged 25% (3/12), Striker-Bravo averaged 25% (2/8). Zero stuns. Zero dropped signals. Zero enemy detection of the relay. The context window charts are flat lines in the green zone. "This is how you run a system. No waste."

**Minute 2:00 — The Trap Springs**
Second execution at higher variance. This run, enemies are closer to the relay. But more importantly — this run, the enemy's detection radius overlaps with Priya's scout's patrol zone from a direction she wasn't filtering for. Her scout's aggressive ignore list means it doesn't notice the enemy approaching from an acoustic-only detection angle (footstep vibrations, which she ignores). The scout walks into an ambush. It never saw the enemy because vibration detection was turned off.

**Minute 3:00 — The Efficiency Tax**
Inspector: Scout-Alpha's buffer had 4 empty slots when it was destroyed. It had plenty of capacity to hold vibration data — it just wasn't listening. The critical information existed in the world but was filtered at the source. Priya stares at the buffer chart: a flat green line that drops to zero (destroyed) at tick 9. "I didn't die from overload. I died from ignorance."

**Minute 3:30 — The Rebalance**
She adds vibration back to the listen list. Buffer utilization rises to 4/6 (67%). Still no stun risk. The extra information lets the scout detect the acoustic approach. She also loosens the relay's filter slightly — priority 2 and above now pass through. The architecture is less lean but more resilient.

**Minute 5:00 — Resolution**
Third execution: the scout detects the acoustic approach, signals the relay, striker intercepts. Passes. Buffer utilization: Scout 67%, Relay 42%, Striker 37%. Not as clean as before, but alive. "I was over-optimizing. In production you need slack for the unexpected. Same thing here." She realizes the game just taught her about capacity planning.

**UI Annotations:**
- **Context bars on ghost units**: During Plan, each ghost unit shows a predicted buffer utilization based on the listen config. Lean configs show a thin cyan bar; broad configs show a wider amber bar. This gives pre-execution feedback on the efficiency/resilience tradeoff.
- **Inspector efficiency overlay**: A toggle in the Inspector that colors each unit's context chart by utilization tier: green (<50%), amber (50-80%), red (>80%). Allows the player to see at a glance which units are lean vs. stressed.

---

#### Journey: Kai, 11, sixth grader, Mission 6 (Chain of Command)

**Context:** Kai plays the opposite of Priya — he subscribes to everything and maxes out his buffers. His scouts listen to all signal types. His relay has no filter. His command agent receives everything from every channel. His architecture is loud, fat, and overwhelmed — but it sees everything.

**Minute 0:00 — The Information Firehose**
Plan screen. Kai's blueprints are set to maximum intake. Scout-Alpha: listens to ALL signal types (visual, vibration, EM, thermal, acoustic, power). Relay-Main: no filter, no compress, forwards everything. Command-Overseer: 6 hook slots all wired, receiving from every channel. Ghost units on the board show amber-orange context bars — predicted high utilization.

**Minute 0:20 — The Stun Cascade**
Sealed watch. Mission 6 introduces reinforcements from an unknown direction. Kai's scouts detect everything — every vibration, every EM fluctuation, every thermal signature. Their 6-slot buffers fill instantly. Context overload: all three scouts stun simultaneously (sparking, jittering, cannot act for 1 tick). During that stunned tick, the reinforcements advance one tile closer. The scouts recover, detect again, stun again. "Why do they keep freezing?"

**Minute 1:00 — The Firehose Inspector**
Inspector: Scout-Alpha's context chart is a solid red bar — 6/6 every tick. Stun events at ticks 3, 5, 7, 9, 11 (every other tick). The scout was oscillating between stun and recovery, never getting a clean action tick. The relay's buffer: 12/12, overflowed at tick 4, dropped 6 signals. The command agent: 14/14, overflowed at tick 6, dropped the reinforcement direction report. "Everything is full. It's like when all my Chrome tabs crash."

**Minute 2:00 — The First Filter**
Kai doesn't know about efficiency theory. He just knows the scouts keep freezing. He drags thermal and power fluctuation to IGNORE on the scout blueprint. Buffer prediction drops from 6/6 to 4/6. He executes again. Scouts still stun — 4 signal types still produce enough data to overflow in dense areas. He removes acoustic. 3 types: visual, vibration, EM. Buffer prediction: 3/6.

**Minute 3:00 — The Lightbulb**
Execute. Scouts don't stun. They patrol, detect, signal. The relay receives manageable data. The command agent gets clean reports. Reinforcements from the east: detected, reported, command agent reroutes. Architecture adapts. "Oh! They work better when they think about LESS stuff. Like how I focus better when I turn off my phone."

**Minute 4:00 — The Efficiency Discovery**
Kai pushes further. He removes EM from the scout (scouts don't need to detect emissions — that's the relay's job). Buffer at 2/6. The scouts are fast, focused, and never stun. But now he wonders about the relay — should the relay filter too? He tries removing vibration from the relay (relays are stationary, vibration data about patrol routes isn't useful). The relay's buffer drops from 12/12 to 8/12. Signal drops decrease from 6 to 0.

**Minute 5:00 — Resolution**
The full architecture runs clean: scouts at 33% utilization, relay at 67%, command at 50%. No stuns, no drops, no overflows. Kai beat the mission not by adding something but by removing things. "My robots are smarter when they're dumber. That's weird."

**UI Annotations:**
- **Stun indicator on ghost units**: A red lightning-bolt icon appears on the ghost unit in Plan when its predicted utilization suggests frequent stuns. Disappears when the player adjusts filters to reduce utilization.
- **Buffer prediction**: A numerical tooltip "~4/6 avg" appears on hover over the context bar, giving the player a concrete number to optimize.

---

#### Journey: Dr. Amara, 38, ML researcher, Mission 9 (Arms Race)

**Context:** Amara is an expert player who understands both lean and fat architectures. She's facing the enemy factory for the first time and wants to build an architecture that adapts its efficiency profile based on battlefield conditions.

**Minute 0:00 — The Adaptive Architecture**
Plan screen. Amara's design is sophisticated: two tiers of blueprints. Tier 1 "Whisper" scouts: minimal listen config (visual + vibration only), tiny EM footprint, aggressive filter rules. Tier 2 "Broadcast" scouts: full listen config (all 6 types), high EM footprint, no filter. Her production queue alternates: 3 Whisper scouts, then 1 Broadcast scout. Her command agent has a rule: "if Whisper scouts report no threats for 5 ticks, do not produce Broadcast scouts. If threats detected, produce Broadcast scouts."

**Minute 0:30 — The Two-Speed Army**
Execute. Sealed watch. The Whisper scouts sweep the map quietly — low EM, low buffer utilization (2/6 = 33%), never stun, rarely detected. They map the enemy's patrol routes through visual and vibration detection alone. When a Whisper scout detects a cluster of enemies, it signals the command agent. The command agent activates Broadcast scout production.

**Minute 1:30 — The Broadcast Burst**
Broadcast scouts deploy to the high-threat sector. Full listen config means they detect everything — enemy emissions, movement patterns, hook traffic signatures. Their buffers run hot (5/6 = 83%), occasionally stunning in dense areas. But the intelligence they gather is comprehensive: enemy relay positions, hook transmission patterns, production cadence. This flood of data flows to the command agent, which uses it to reroute strikers.

**Minute 2:30 — The Efficiency Envelope**
Inspector: two distinct utilization profiles. Whisper scouts: flat green line at 2/6, zero stuns, zero dropped signals. Broadcast scouts: oscillating amber-red at 4-6/6, 3 stuns across the run, 2 dropped signals. The command agent's buffer tells the story: steady green during the Whisper phase, amber spikes during the Broadcast phase. Total EM emissions: Whisper scouts contribute 15% of emissions, Broadcast scouts contribute 60%, despite being outnumbered 3:1.

**Minute 3:30 — The Meta-Game**
Amara realizes the efficiency asymmetry creates a **stealth vs. intelligence tradeoff** that operates at the blueprint level, not the individual unit level. She can tune her army's overall efficiency profile by adjusting the Whisper:Broadcast ratio in the production queue. The command agent manages this ratio dynamically. She's building an adaptive system that shifts between lean surveillance and fat intelligence gathering based on battlefield conditions.

**Minute 5:00 — Resolution**
The enemy factory falls. Debrief shows aggregate metrics: average army buffer utilization 47% (healthy), EM profile 40% lower than a uniform full-listen architecture, zero critical signal drops. The architecture's efficiency came not from universal leanness but from **targeted fat** — investing buffer capacity where it matters, conserving it where it doesn't. "This is literally how you design a monitoring system. You don't put verbose logging on everything — you put it on the things that need attention."

**UI Annotations:**
- **Blueprint-level efficiency comparison**: In the workbench, a small bar chart next to each blueprint name shows its predicted buffer utilization. Whisper-Alpha: thin cyan bar. Broadcast-Beta: wide amber bar. At a glance, the player sees the efficiency profile of their army composition.
- **Inspector efficiency heatmap**: A board overlay (toggle in Inspector) colors each tile by the average buffer utilization of units that occupied it. Cool blue tiles = lean operations. Hot red tiles = stressed operations. The heatmap reveals spatial patterns — "my army runs lean on the flanks but hot in the center."

---

## Strengths

- **Teaches a real engineering skill.** The lean vs. fat tradeoff is one of the most important lessons in systems engineering. Robot Uprising can teach it viscerally through context overload consequences.
- **Creates two valid playstyles.** Lean "stealth" architectures and fat "intelligence" architectures are both viable, encouraging player expression. The skill ceiling is in knowing when to use each.
- **Emergent from locked mechanics.** The efficiency asymmetry doesn't require new mechanics — it emerges naturally from buffer sizes, stun consequences, EM emissions, and bandwidth constraints. Position F (Dynamic Equilibrium) leverages the locked design without additions.
- **Natural difficulty curve.** Early missions reward lean play (fewer inputs, simpler situations). Late missions demand selective fattening (complex multi-front battles, enemy counter-intelligence). The shift is organic, not imposed.

## Weaknesses

- **Risk of "optimal" convergence.** If one efficiency profile dominates across all missions, the asymmetry collapses. Mission design must ensure both lean and fat approaches have missions where they shine.
- **Invisible if not taught.** A player who never experiments with filter configs may never discover that efficiency matters. The tutorial needs at least one "remove noise and watch the unit wake up" moment (already in Mission 1 — good).
- **Balance nightmare.** If lean is too strong, fat architectures feel wasteful. If fat is too strong, filtering feels like unnecessary work. The buffer sizes, stun timing, and emission scaling must be carefully tuned.
- **Potential newbie trap.** New players who listen to everything will stun-lock constantly and may quit before discovering filtering. The tutorial must teach subtraction early and clearly (Mission 1 does this).

## Interaction Effects

- **Context overload stun (locked):** The 1-tick stun is the primary penalty for fat architectures. Without it, there's no efficiency asymmetry — fat would always be better (more data = better decisions). The stun makes buffer management a real constraint.
- **EM emissions (locked):** Lean architectures emit less EM, making them harder to detect. This gives efficiency a stealth advantage independent of buffer performance.
- **Compress skill (locked):** Compress is the fat player's coping mechanism — reduce buffer pressure through lossy compression. But compress itself costs a tick and emits processing noise. The efficiency tax of compress creates a second-order tradeoff.
- **Command agent (locked):** The command agent can dynamically adjust subordinate filter configs, enabling the "lean by default, fat when needed" adaptive strategy. This makes the command agent the key to the highest-skill efficiency management.
- **2.19 Variable scenario seeds:** At narrow variance, a perfectly tuned lean architecture can predict exactly what information it needs. At wide variance, lean architectures risk missing unexpected signals. Variance rewards some buffer slack.
- **2.05a Shared buffer pooling tax:** Shared buffers make efficiency a collective concern — one fat unit can fill the shared pool, penalizing lean units who share it. The pooling tax coefficient determines how much collective efficiency matters.

## Comparable Games/Media

- **Screeps:** CPU-efficient creeps are a major optimization axis. Players who minimize memory usage and CPU cycles per creep can field larger armies. The efficiency skill ceiling is immense.
- **Factorio:** Throughput optimization creates natural efficiency pressure. A player who designs a clean bus with minimal belt usage outperforms one with spaghetti. But "spaghetti works" is also a valid strategy for many situations.
- **StarCraft:** Supply and resource efficiency are core skills. A player who banks 2000 minerals is wasting potential. A player who spends every mineral has no reserve. The optimal bank balance is matchup-dependent — exactly the dynamic equilibrium Robot Uprising should target.
- **Slay the Spire:** Deck size efficiency — a 15-card deck cycles faster than a 30-card deck, letting the player see their best cards more often. But a 15-card deck has no flexibility. "Thin deck" vs. "thick deck" is a real community debate.

## Sensory Description

The efficiency asymmetry is primarily **felt** rather than seen. The visual language is the context bar system (locked): cyan-blue for healthy utilization, amber for pressure, red-pulse for overload. A lean architecture presents as a field of cool blue — calm, quiet, efficient. A fat architecture presents as a field of amber and red — stressed, noisy, active.

The audio dimension matters. Lean units produce sparse, clean signal sounds — a single clear ping when a scout detects a threat, a crisp chirp when the relay forwards it. Fat units produce a constant low chatter — overlapping pings, compression whirs, the hiss of EM emissions. The soundscape of a lean architecture is **silence punctuated by meaning**. The soundscape of a fat architecture is **noise punctuated by silence**.

When a lean unit dodges a stun by having buffer headroom, there's no fanfare — the absence of the stun jitter IS the reward. When a fat unit stuns, the sparking animation and brief freeze are viscerally unpleasant — a brief catch in the rhythm, like a record skip. The player feels the efficiency difference as **smoothness vs. stuttering**. A well-tuned lean architecture runs like a Swiss watch: tick, tick, tick. A fat architecture runs like a diesel engine: thrum, catch, thrum, catch, STALL.

The Inspector makes the efficiency asymmetry analytical. The context window chart for a lean unit is a **rolling meadow** — gentle green undulations well below the capacity line. For a fat unit it's a **mountain range** — jagged amber peaks scraping the red ceiling, with occasional cliff-drops where the stun compacted the buffer. The visual contrast between these charts is the most direct representation of the efficiency tradeoff: which chart do you want your units to have?
