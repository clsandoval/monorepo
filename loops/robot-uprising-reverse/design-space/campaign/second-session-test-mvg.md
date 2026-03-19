# 8.04a — The "Second Session" Test for the MVG

## The Question

A player finishes all five missions of the minimum viable game. No progression system. No new content. No unlocks. No leaderboard. No daily challenge. They close the browser tab. Twenty-four hours pass. **What makes them open it again?**

This is the hardest test a prototype can face. The first session is powered by novelty — new mechanics, new visuals, new puzzles. The second session has none of that fuel. Whatever pulls the player back must come from the mechanics themselves, from unfinished business in the player's own mind. This analysis maps every possible source of "one more try" psychology available to a 5-mission, 3-unit-type, zero-progression prototype.

---

## The Six Engines of Return

Six distinct psychological mechanisms can generate pull-back without new content or progression systems. Each operates on a different timescale and appeals to a different player motivation.

### Engine 1: "The Unfinished Architecture" (Zeigarnik Pull)

The Zeigarnik effect: incomplete tasks occupy mental bandwidth more than completed ones. A waiter remembers open orders, not closed ones. The MVG's Inspector is a Zeigarnik machine — it shows the player exactly what went wrong, plants the seed of a better design, then forces them to leave (session ends, life intervenes). The unfinished architecture haunts.

**Why it works for Robot Uprising specifically:** The Inspector's decision trace doesn't just show failure — it shows the *exact causal chain* that produced failure. "Striker stunned at T6 because relay buffer was 8/8 because three scouts reported simultaneously because all three had ON_ENEMY_SPOTTED → SEND 'recon' with no filtering." The player sees the fix in their mind's eye — a second channel, a priority filter, a different eviction policy — but hasn't implemented it yet. That mental blueprint is the unfinished task. Named: **"The Blueprint in Your Head."**

**Vulnerability:** Only works if the player lost, or won but noticed imperfection. A clean sweep on all five missions with no overloads, no stuns, no wasted ticks closes all the loops. The MVG must ensure Mission 5 is hard enough that most players' first architecture has visible flaws.

### Engine 2: "The Optimization Itch" (Factorio Throughput)

The player won Mission 5, but the Inspector showed their relay hitting 7/8 buffer utilization at tick 14. That's a 87.5% load on a system designed for 100%. It worked — but it was sloppy. The signal chain had a 3-tick latency spike when both scouts reported simultaneously. The production queue could have been reordered to get the relay out 2 ticks earlier.

This is the Factorio player's drive: not "can I do it?" but "can I do it *better*?" The metric is self-imposed. No score, no timer, no rating. Just the player's own standard of engineering elegance.

**Named: "The Sawtooth Sparkline."** The relay's buffer utilization chart — that sawtooth wave oscillating between 3/8 and 5/8 — is either beautiful or ugly depending on the player's aesthetic. Some players will return to smooth it. To reduce the amplitude. To make the compression ratio a clean 3:1 instead of a jittery 2.7:1.

**Vulnerability:** Only appeals to optimization-oriented players. A casual player who got a victory screen has no reason to care about buffer utilization percentages.

### Engine 3: "The What-If Experiment" (Combinatorial Curiosity)

Three unit types. Twelve skills (six available in MVG: patrol, evade, engage, compress, filter, amplify — wait, MVG only has patrol, evade, engage, compress, and filter across Scout/Relay/Striker). Multiple rule orderings. Multiple channel topologies. Multiple production queue sequences. The combinatorial space is larger than five missions can exhaust.

The player's first architecture was scout→relay→striker with a single "recon" channel. But what about two channels — one for "threat" and one for "position"? What about two relays in series, each filtering a different signal type? What about a scout with evade enabled, patrolling behind enemy lines, sending compressed long-range intelligence?

**Named: "The Napkin Sketch."** The player draws architectures on mental napkins during idle moments — in the shower, on the commute, during a meeting. They return to the MVG not because the game asked them to, but because they had an idea and want to test it.

**Vulnerability:** Requires the player to have internalized the primitive vocabulary deeply enough to think in it. If the five missions taught the mechanics but didn't create fluency, the player won't have ideas — they'll just have memories of following instructions.

### Engine 4: "The Replay Surprise" (Invisible Randomization)

The locked spec includes invisible randomization: each execution varies within constraints. The player presses EXECUTE with the same configuration and gets a slightly different battle. Enemy spawn timing shifts. Patrol paths diverge. The architecture that won cleanly last time might stumble this time because the scout happened to look left instead of right at tick 3.

This is the poker player's return mechanism: the same strategy produces different outcomes because the environment varies. The player isn't optimizing a fixed puzzle — they're building a *robust* system that handles variance.

**Named: "The Seed Shuffle."** Each EXECUTE is a new seed. The player's architecture is tested against a distribution, not a point. The Inspector's debrief shows "Run Stats: Win rate over 10 runs: 7/10" (or similar). The player returns to push that number higher.

**Critical design question for the MVG:** How much randomization? Too little and missions are deterministic puzzles with one solution (no replay value). Too much and the player can't debug (failures feel random, not causal). The sweet spot: enemy spawn *timing* varies (which tick they appear), enemy *movement* varies (left or right path), but enemy *count* and *type* are fixed. The architecture must handle timing variance, not fundamentally different scenarios.

**Vulnerability:** If the MVG's five missions are tightly scripted tutorials with minimal randomization (which they might need to be for teaching clarity), this engine produces nothing.

### Engine 5: "The Showoff Impulse" (Social Proof)

The player sends a TikTok clip — the relay compression sparkline, the coordinated flanking maneuver, the overload-then-fix split-screen. A friend replies: "wait, how did you wire that?" The player reopens the game to screenshot their architecture, or to recreate the moment, or to build something even more impressive to share.

**Named: "The Architecture Portfolio."** The player's configurations become artifacts of identity. "I built a dual-channel relay mesh that compresses 6:1" is a flex in the same way "I built a Factorio megabase doing 1K science/minute" is a flex. The social currency is engineering elegance.

**Dependency:** Requires the MVG to have export/share functionality (GIF export, replay link, config code). Without it, the social loop is a dead end. The 8.04e analysis (MVG as web demo) covers the technical pipeline. The question here is whether 5 missions generate enough visible complexity to be *worth sharing*.

**Vulnerability:** Social engines are slow-start. They require an existing audience. For the very first players of an unknown prototype, there's no one to show off to.

### Engine 6: "The Mastery Gradient" (Skill Ceiling Visibility)

The MVG's five missions teach five concepts in sequence: buffer-as-attention, hooks-as-wiring, rule-priority, compression-as-infrastructure, system-design-vs-unit-control. By Mission 5, the player has used all five concepts. But have they *mastered* them?

The Inspector reveals mastery gaps. The decision trace shows a rule that never fired (dead rule — wasted slot). The context fill chart shows a buffer that was always under 50% (over-provisioned — could have been allocated to a faster eviction policy). The event log shows a channel that carried 3 messages total over 20 ticks (underutilized infrastructure).

These are visible skill ceilings. The player knows they won, but they can also see they won *wastefully*. The mastery gradient is the distance between "it worked" and "it worked perfectly."

**Named: "The Dead Rule."** The single most powerful pull-back mechanic in the MVG might be a red-outlined rule in the Inspector that reads "NEVER FIRED — 0 evaluations in 20 ticks." That dead rule is a splinter. It says: "You thought you needed this. You didn't. Your mental model of the system is wrong. Come back and fix it."

**Vulnerability:** Only works if the Inspector surfaces these diagnostic insights prominently. If the player has to actively hunt for inefficiencies, most won't. The dead-rule highlight, the underutilized-channel annotation, the over-provisioned-buffer warning — these must be automatic, visible, and emotionally charged.

---

## Player Journeys

### Journey 1: Mika, 14, Manila, Plays Mobile Legends and Genshin Impact

**Context:** Played the MVG web demo on her phone during a commute yesterday. Completed Missions 1-4, got stuck on Mission 5. The factory confused her — she set the production queue to Scout→Scout→Scout→Striker (no Relay) and the Strikers got overloaded. She saw the OVERLOADED flash, the sparking jitter, the red context bars. She closed the tab when she arrived at school.

**Hour 0 — The Thought (During Math Class)**
Mika is solving a system of equations. She thinks about the relay from Mission 4 — how it sat between the scouts and striker and compressed three messages into one. "I forgot to put the relay in Mission 5." The thought is intrusive. She didn't choose to think about it. The Zeigarnik effect fired.

She opens her notebook (the physical one) and draws a diagram: three boxes labeled S (scout), one box labeled R (relay), one box labeled X (striker). Arrows: S→R→X. She writes "recon" on the S→R arrows and "clean" on the R→X arrow. She underlines "RELAY FIRST" twice.

**Hour 6 — The Return (After Dinner)**
She opens the browser on her phone. The MVG's URL is still in her recent tabs. The page loads in 2.3 seconds. Mission 5 Plan screen. The production queue still shows her failed config: Scout, Scout, Scout, Striker. No relay.

She drags the Relay icon from the blueprint panel onto the conveyor belt. Drops it in position 1 — before everything else. The queue reads: Relay, Scout, Scout, Striker. Cost preview updates: "5m + 3m + 3m + 8m = 19m. First unit: tick 3."

She opens the Relay blueprint. Skills: compress [ON], filter [OFF]. Hooks: she types "recon" in the listen field (the scouts already send on "recon" from her earlier config). She adds an output hook: ON_COMPRESSED → SEND "clean". She opens the Striker blueprint and changes its listen channel from "recon" to "clean".

**Minute 0:00 — The Second EXECUTE**
She taps EXECUTE. The phone vibrates softly — a single pulse. The screen transitions: workbench slides away, board fills the screen. The factory glows amber in the bottom-left corner of the rice terrace grid.

Tick 3: The relay materializes. A 📡 icon appears on the factory tile with a mechanical *chunk* and holographic shimmer. The relay sits still — stationary, as designed. Its context bar appears: 0/8, empty blue.

Tick 5: First scout materializes. 👁 begins patrolling northeast. Tick 7: Second scout, patrolling northwest.

Tick 9: First scout spots an enemy. Green flash. A cyan dashed line zips from the scout to the relay — the "recon" signal traveling like a tiny star on a wire. The relay's context bar ticks: 1/8. The compress skill processes. A second cyan line fires from the relay eastward to... nothing. The striker hasn't been built yet.

Mika's eyes widen. "The relay sent the message but there's no striker to hear it." The signal line hits the edge of the board and fades. The relay's output was wasted.

Tick 11: Striker materializes. It listens on "clean". Its context bar: 0/6. Empty. It missed the first compressed report.

Tick 12: Second scout spots an enemy. Signal to relay. Relay compresses. Signal to striker. This time the cyan line connects — relay to striker, the star traveling cleanly. Striker's context bar: 1/6. Green. It begins moving.

Tick 15: Striker adjacent to enemy. Red flash. Eliminated.

Tick 16-20: The pipeline runs smoothly. Scouts report, relay compresses, striker acts. No overloads. No stuns. The context bars stay blue and green. Victory chime — three ascending kulintang notes.

**Minute 1:30 — The Inspector Revelation**
Mika taps the relay in the Inspector. She scrubs to tick 9 — the first compression. The decision trace shows: "Hook 1: ON_COMPRESSED → SEND 'clean'. Fired at T9. Payload: threat_D5. Listeners: 0 (no active units on channel 'clean')."

Zero listeners. The message was sent into the void. She scrubs to tick 12 — the second compression. "Listeners: 1 (Striker-1)." The striker wasn't built in time. Two ticks of intelligence were lost.

She thinks: "What if I build the striker BEFORE the scouts? Then it's ready to listen when the first report comes." But then the scouts would start reporting before the relay exists... She needs: Relay first (to receive), then Striker (to listen to relay), THEN Scouts (to start reporting). The production order matters.

**Minute 2:00 — The Third EXECUTE**
She reorders: Relay → Striker → Scout → Scout. EXECUTE.

This time, the relay is ready at tick 3, the striker at tick 7, and when the first scout spots an enemy at tick 11, the full pipeline is operational. Zero wasted signals. The striker's context fill sparkline is a clean staircase: 0→1→1→2→1 (entry arrives, fires rule, evicts old entry). No jitter. No waste.

Victory at tick 18 — faster than before.

**Minute 2:30 — "I Want to Try Two Relays"**
In the Inspector, she notices the relay hit 4/8 at tick 14 when both scouts reported simultaneously. What if she added a second relay — one per scout — so each relay only handles one scout's reports? She opens Plan screen and starts sketching the architecture. She's designing a system. She's on her third attempt at Mission 5 and she hasn't been asked to retry. She chose to.

**UI Annotations:**
- **Production queue (conveyor belt):** Horizontal strip at bottom of Plan screen. Blueprint icons are 48px circles with unit silhouettes. Drag to reorder — icon lifts with a subtle shadow, slot highlights show valid drop zones. Cost preview updates live during drag with a soft *tick* per recalculation.
- **Context bar (sealed watch):** 4px-wide vertical bar at bottom-right of each unit tile. Blue (#4FC3F7) at <50%, amber (#FFB74D) at 50-80%, red (#EF5350) at >80%. Pulses at overload threshold.
- **Signal line (sealed watch):** Cyan (#00BCD4) dashed line between sender and receiver. A small bright dot travels along the line at 1 tile/tick. Arrival triggers a soft ascending chime, pitch randomized within a major pentatonic scale.
- **"Listeners: 0" annotation (Inspector):** Displayed in the decision trace panel as amber text with a warning triangle icon. Not an error — just information. But the amber color carries emotional weight: "this worked, but nothing was listening."

---

### Journey 2: Derek, 31, Software Engineer, Factorio Veteran (600 hours)

**Context:** Completed all five missions last night in one sitting. Won everything. His Mission 5 architecture was clean: Relay→Scout→Scout→Striker, single "recon"→"processed" pipeline, 2:1 compression ratio. He went to bed satisfied. Now it's Saturday morning.

**Minute 0:00 — The Shower Thought**
Derek is brushing his teeth. He's thinking about last night's Mission 5 run. His architecture was a single pipeline — every scout reporting on one channel, one relay compressing, one striker acting. It worked. But it was a *single point of failure.* If the relay had been destroyed (one-shot-one-kill applies to relays too), the entire information network would collapse. The scouts would keep reporting on "recon" but nobody would be listening. The striker would go blind.

He thinks: "What about redundant relays? Primary and backup. Or a mesh — two relays cross-feeding. Or forget relays entirely — what if scouts compressed their own reports using rules? Wait, scouts don't have the compress skill. But they have evade. What if I used evade to keep a scout alive longer, turning it into a persistent long-range sensor instead of a disposable warning system?"

He opens his laptop.

**Minute 0:30 — The Redundancy Experiment**
Mission 5, Plan screen. Derek clears his old config and starts fresh. New architecture:

- **Two relays**, each on a different channel: "north-intel" and "south-intel". Scout 1 sends on "north-intel", Scout 2 sends on "south-intel". Each relay compresses its own scout's feed. Both relays output on a shared "threats" channel. The striker listens on "threats."

Production queue: Relay-A → Relay-B → Scout-N → Scout-S → Striker. Five units total. The cost preview shows: 5m + 5m + 3m + 3m + 8m = 24m. Income: 2m/tick. Last unit at tick 12.

He opens the channel map panel. It auto-generates: `Scout-N ──"north-intel"──▶ Relay-A ──"threats"──▶ Striker` and `Scout-S ──"south-intel"──▶ Relay-B ──"threats"──▶ Striker`. A diamond-shaped topology. Two independent paths converging on one consumer.

**Minute 1:00 — EXECUTE**
Sealed watch. Ticks 1-12: units materialize in sequence. The board now has five units — more than his previous run. More signal lines. More complexity.

Tick 14: Both scouts spot enemies simultaneously. Two separate cyan lines — one from Scout-N to Relay-A ("north-intel"), one from Scout-S to Relay-B ("south-intel"). Each relay processes independently. Two compressed signals fire on "threats" — two cyan lines converging on the striker from different directions.

The striker's context bar: 2/8. Two entries. One per relay. It evaluates its rules: "IF threat_reported AND closest_threat THEN engage." It picks the closest enemy and moves.

Tick 16: Striker eliminates the northern enemy. Tick 18: Striker pivots south, engages the second enemy. Red flash. Both eliminated.

Derek watches the signal network — it looks like a nervous system with two lobes. Relay-A and Relay-B pulse alternately, feeding the striker a steady stream of compressed intelligence. No overloads. No stuns. Buffer utilization on the striker never exceeds 3/8.

**Minute 1:30 — The Destruction Test**
Derek has a thought: "What if I kill one relay?" He can't — this is the MVG, no manual intervention during sealed watch. But he replays the Inspector and looks at Relay-A's context fill. At tick 16, Relay-A hits 6/8 because three rapid scout reports came in before compression could keep up. If an enemy striker had been adjacent at that tick, Relay-A would be destroyed. What happens to the striker?

He traces the dependency: with Relay-A gone, Scout-N's "north-intel" messages would arrive at... nobody. No listener on that channel. Scout-N becomes a deaf broadcaster. The striker still receives from Relay-B via "south-intel"→"threats", but now it only has intelligence from one hemisphere. Partial blindness.

Derek types in his notes app: "Need: cross-channel failover. If one relay dies, surviving relay listens on BOTH channels. Requires... a rule on the relay? IF peer_destroyed THEN listen_on('north-intel')? Can relays have rules about other units?"

He can't implement this in the MVG — there's no mechanism for runtime channel subscription changes. But he's already designing the Command agent's feature set in his head. The MVG planted the need without providing the solution.

**Minute 2:00 — The Throughput Audit**
Inspector, deep dive. Derek opens the context fill sparkline for each unit across all 20 ticks. He creates a mental dashboard:

- Relay-A: sawtooth, 1-4/8 range, healthy
- Relay-B: sawtooth, 1-3/8 range, healthy (lighter load because southern enemies spawned later)
- Striker: stepped, 0-3/8, never above 37.5% utilization
- Scout-N: flat at 2/6 — it barely uses its own buffer. Most of its context is outbound (hooks), not inbound (observations)

He notices: the striker's buffer is *under-utilized*. 8 slots, using 3 at peak. That's waste. In the full game (with Command agents and more complex signals), that headroom would matter. But in the MVG, the striker has more buffer than it needs. What if he gave the striker additional rules to use that buffer space? What if the striker also listened on "north-intel" as a backup?

He wires it: Striker now listens on "north-intel", "south-intel", AND "threats". Direct raw feed plus compressed feed. The rules are ordered: 1) IF compressed_threat THEN engage (use the processed data first), 2) IF raw_report AND no_compressed_available THEN engage (fallback to raw if relay is slow or dead).

**Minute 2:30 — EXECUTE (Third Time)**
The architecture runs. Everything works the same as before — the compressed channel dominates because it's faster (relay processes within the same tick). But at tick 16, Derek watches the striker's context window: it received both the compressed signal on "threats" AND the raw signal on "north-intel". Rule 1 matched (compressed), Rule 2 was evaluated but didn't fire (compressed was available). The buffer now holds 4/8 entries instead of 2/8.

He's added redundancy but increased buffer pressure. The tradeoff is visible in the sparkline. He thinks: "In a longer mission with more enemies, this might cause overload on the striker. I'd need to adjust eviction priority — dump raw reports first, keep compressed ones."

He's 30 minutes into his second session. He hasn't seen a single new mechanic, mission, or piece of content. He's exploring the *architecture space* within a fixed 5-mission prototype. The game is his own engineering curiosity.

**Minute 3:00 — Reflection**
Derek saves a screenshot of his diamond topology and posts it to a game design Discord: "Built a redundant relay mesh in the Robot Uprising demo. Two relays, two channels, shared output bus. Striker has raw+compressed failover. Who else is playing this?" Three people reply within an hour. One shares a completely different architecture: a single relay with two scouts on the same channel, but filter skill enabled to drop duplicate reports. Simpler, cheaper, different tradeoff. Derek opens the game again.

**UI Annotations:**
- **Channel map panel:** Read-only auto-generated topology diagram at bottom of Plan screen. Nodes are unit icons, edges are channel names in monospace font. Channel color auto-assigned from a palette (first channel cyan, second teal, third green, etc.). Diamond shapes for converging topologies, linear chains for pipelines. Updates live as player edits hooks.
- **Context fill sparkline (Inspector):** 120px-wide × 24px-tall inline chart. X-axis = ticks, Y-axis = buffer fill percentage. Line color matches buffer health (blue→amber→red gradient). Hover shows exact values: "T14: 4/8 (50%)". Sawtooth pattern for relays (fill→compress→output), stepped for strikers (receive→act→evict).
- **Decision trace "fallback" annotation:** When Rule 2 was evaluated but Rule 1 already matched, the trace shows Rule 2 in dim gray with text: "EVALUATED — not fired (Rule 1 matched first)." This teaches priority ordering without explicit instruction.

---

### Journey 3: Rosa, 62, Retired Teacher, Plays Candy Crush and Wordle

**Context:** Her grandson Tomás (8, from parent analysis Journey 3) showed her the game on the family tablet. She completed Missions 1-3 yesterday with his help. She got stuck on Mission 4 (the overload mission) and Tomás told her to "put the phone tower in the middle" (his word for the relay). She did, it worked, she felt proud. She hasn't tried Mission 5. She picks up the tablet after morning coffee.

**Minute 0:00 — The Familiar Grid**
Rosa opens the browser. The MVG loads. She sees the mission select: five numbered buttons. 1, 2, 3, 4 have green checkmarks. 5 is gold, pulsing gently. She taps 5.

The Plan screen loads. The board shows the factory (bottom-left) and enemy spawner (top-right). The workbench shows blueprint tabs. This is new — yesterday she edited individual units, now she's editing *templates*. She reads the conveyor belt strip at the bottom: Scout → Relay → Striker. Default order.

She remembers Tomás's advice: "The phone tower goes first." She drags the Relay to position 1. Then she pauses. She doesn't know how to configure the blueprints. Yesterday, each unit was pre-placed and partially configured. Now she's starting from scratch.

**Minute 0:30 — The Template Discovery**
She taps the Scout blueprint tab. The skills panel shows patrol [ON], evade [OFF]. The rules panel has two pre-filled rules: "IF enemy_in_perception THEN send_on_hook" and "IF no_enemy THEN patrol." The hooks panel has one pre-filled hook: "ON enemy_spotted → SEND 'recon'."

She realizes: the game pre-configured a reasonable default. She doesn't need to build from zero. The scout already knows how to patrol and report. She taps the Relay tab. Skills: compress [ON], filter [OFF]. Hook: "ON_COMPRESSED → SEND 'intel'." Default channel names are already filled in.

She taps EXECUTE without changing anything. She trusts the defaults.

**Minute 1:00 — The Default Architecture Runs**
Sealed watch. The factory builds Relay (tick 3), Scout (tick 5), Striker (tick 8). The pipeline works — scout reports, relay compresses, striker acts. But it's slow. Only one scout. Large coverage gaps. Enemies spawn from the top-right and the single scout only covers the northeast quadrant. Enemies approaching from the northwest go undetected until they're close.

Tick 14: An enemy from the northwest reaches the striker's narrow perception range. The striker spots it — but late. It engages, eliminates the enemy. But a second enemy was right behind it. Tick 16: Red flash. Striker eliminated.

Defeat screen. Rosa frowns. "I needed more eyes."

**Minute 1:30 — The Second Scout**
She goes back to Plan screen. She drags a second Scout onto the production queue. The conveyor reads: Relay → Scout → Scout → Striker. Four units. Cost: 5m + 3m + 3m + 8m = 19m. She doesn't think about cost — she just wants more coverage.

EXECUTE. This time, two scouts patrol in opposite directions. The relay receives from both. The striker gets comprehensive intelligence. It handles the northwest enemy at tick 13 — two ticks earlier than before. Victory at tick 19.

Rosa smiles. She doesn't know she's replicated the exact architecture from the parent analysis (8.04 Journey 2). She arrived at it through her own logic: "more eyes, one phone tower, one fighter." She opens Mission 5 again and adds *three* scouts. Cost: 5m + 3m + 3m + 3m + 8m = 22m. She wants to see what happens with maximum coverage.

**Minute 2:00 — The Overload Returns**
With three scouts, the relay's buffer fills faster. At tick 12, the relay hits 7/8. At tick 14: 8/8. The relay *overloads* — the same sparking jitter animation she saw on the striker in Mission 4. The relay stuns for one tick. Compressed output is delayed. The striker acts on stale data.

Rosa recognizes the pattern immediately. "Too many callers! The phone tower can't handle them all." She learned this in Mission 4. She knows the fix: another relay. But she's already at 22 minerals. Can she afford a second relay?

She opens Plan screen. Relay → Relay → Scout → Scout → Scout → Striker. Cost: 5m + 5m + 3m + 3m + 3m + 8m = 27m. Income: 2m/tick. Last unit at tick 14. That's late — enemies will be spawning for 14 ticks before her striker is ready.

She stares at the numbers. She's doing resource math for the first time. "What if I put the fighter earlier and the eyes later?" She experiments: Relay → Striker → Scout → Scout → Scout. The striker is ready by tick 8 but has nothing to act on (no scouts reporting yet). She watches it stand idle for 3 ticks.

She's learning production scheduling. She's 62 years old, she's never played a strategy game, and she's optimizing a factory pipeline on a Saturday morning because three scouts overloaded a relay and she recognized the problem from two missions ago.

**Minute 3:00 — The Architecture That Works**
After two more attempts, Rosa settles on: Relay → Scout → Striker → Scout → Scout. The relay and first scout establish the pipeline early. The striker arrives with immediate intelligence. The second and third scouts expand coverage. The relay handles the load because scouts are staggered — they don't all start reporting at the same tick.

Victory. Clean. No overloads. Rosa sets the tablet down and thinks about what Tomás will say when she tells him she beat Mission 5 with *five* units.

**UI Annotations:**
- **Default blueprint configs:** Each blueprint tab opens with a "starter config" — reasonable defaults for skills, rules, and hooks. Rules are pre-ordered. Channel names are pre-filled ("recon", "intel"). The player can modify anything but doesn't have to start from zero. A dim label at the top of each pre-filled section reads "DEFAULT — tap to customize" in 10pt gray text.
- **Cost preview on conveyor belt:** Real-time mineral cost total below the production queue. Format: "3m + 5m + 8m = 16m | Income: 2m/tick | First unit: T2 | Last unit: T8". Numbers animate when queue changes — the total counter spins up/down like an odometer. Overspend (total > available at any tick) highlights the offending unit in amber.
- **Overload animation on relay:** Identical to striker overload — sprite jitter, white sparks, *bzzzt* crackle, 1-tick stun. The relay's output hook doesn't fire during stun. Signal lines from scouts to relay still arrive (they pile up in the buffer) but nothing exits. The "bottleneck" is viscerally visible: lines flowing in, nothing flowing out.

---

### Journey 4: Kwame, 28, DevOps Engineer, Streams on Twitch (47 Average Viewers)

**Context:** Played through all five missions on stream last night. Chat loved the overload moment in Mission 4. He promised to "break the demo" today. His stream title: "ROBOT UPRISING DEMO — FINDING THE LIMITS." He wants content.

**Minute 0:00 — The Challenge**
Kwame opens Mission 5 with an intentionally bad architecture. One scout, zero relays, four strikers. "All offense, no intelligence," he tells chat. "Let's see how dumb pure aggression is."

Production queue: Striker → Striker → Striker → Striker → Scout. Total cost: 8+8+8+8+3 = 35m. The scout arrives last — tick 18. Strikers are wandering blind for 18 ticks.

**Minute 0:20 — The Blind Army**
EXECUTE. Four strikers materialize in sequence. They have narrow perception (range 2). They can't see enemies until they're practically adjacent. No scout reports. No signal lines. The board is eerily quiet — no cyan dashes, no green flashes. Just four ⚔ icons slowly patrolling in tight circles around the factory.

Tick 10: An enemy wanders within striker-2's perception. Red flash — eliminated. Chat types "EZ." But three other enemies have been roaming the north side of the board, completely undetected.

Tick 14: Two enemies converge on striker-1 simultaneously. One-shot-one-kill goes both ways — the striker eliminates one, but the second enemy is adjacent. Red flash. Striker-1 destroyed.

Chat: "F" "F" "F" "RELAY DIFF" "NO INTEL NO WIN."

Tick 18: Scout finally materializes. Too late. Two strikers are already destroyed. The scout starts reporting but there's no relay to compress — signals go directly to the remaining strikers. Their buffers fill with raw, uncompressed scout data. Tick 20: Striker-3 overloads from the raw feed. Sparks. Stun. An enemy walks up. Red flash.

Defeat. Kwame laughs. "OKAY, intel matters. Chat, what's the most CURSED architecture you can think of?"

**Minute 1:00 — Chat Builds an Architecture**
Chat suggests: "ALL RELAYS. Five relays, zero scouts, zero strikers." Kwame builds it. Five relays sitting in a grid. No perception (relays are stationary, no perception). No scouts to feed them. No strikers to act on their output. Five silent 📡 icons doing absolutely nothing for 20 ticks while enemies walk up and destroy them one by one.

The sealed watch is hilarious. Twenty ticks of silence. Five context bars at 0/8. Zero signal lines. Then enemies arrive and start deleting relays. Red. Red. Red. Red. Red. Defeat.

Chat: "RELAY DIFF" "THEY HAD NO EYES" "build a scout challenge (impossible)."

Kwame is generating content. Each absurd architecture produces a unique sealed watch — a unique visual comedy of failure. The MVG's three-screen loop (design→watch→inspect) is a content generation engine. The game is a toy the streamer uses to create moments. Return value: infinite, because chat keeps suggesting new configurations.

**Minute 2:00 — The Optimal Run**
After four joke runs, Kwame builds a serious architecture. "Okay chat, what's the OPTIMAL Mission 5 config? Let's theory-craft." Chat debates in real time. Kwame builds their consensus: Relay → Scout → Scout → Striker → Striker. Dual scouts, dual strikers, single relay hub.

He configures carefully: scouts on separate channels ("north" and "south"), relay listens on both, compresses, outputs on "threats". Both strikers listen on "threats" but have different rules — Striker-1 prioritizes the closest enemy, Striker-2 prioritizes the enemy closest to the factory (defensive).

EXECUTE. The architecture runs beautifully. Two scouts painting the battlefield in signal lines. The relay humming at 3-4/8 buffer. Two strikers moving in coordinated but different patterns — one aggressive, one defensive. Chat watches the dual-striker behavior emerge from different rule orderings.

Tick 15: Both strikers converge on the same enemy (it was both closest-overall AND closest-to-factory). They collide on the same tile. One eliminates it, the other wasted a turn moving to an already-dead target.

Chat: "THEY NEED A CHANNEL" "MAKE THEM TALK" "FRIENDLY FIRE... kinda." Kwame realizes: the strikers need coordination. A hook from each striker: ON_ENGAGING → SEND "claimed". The other striker's rule: IF enemy_claimed_by_other THEN target_next. But the MVG's rule language might not support "claimed_by_other" as a condition. He's hitting the expressive ceiling.

"THIS is where you need the full game," Kwame tells chat. "Five missions isn't enough for what I want to build." He pastes the wishlist URL. Three viewers click it live.

**UI Annotations:**
- **Defeat screen (humor potential):** After defeat, the board freezes on the last tick. All destroyed units show as broken sprites — collapsed chassis, sparking wires, dim gray instead of their unit color. The context bars are empty black rectangles. A single line of text: "SYSTEM FAILURE." For a streamer, this is a screenshot opportunity. The visual comedy of five dead relays in a perfect grid with "SYSTEM FAILURE" overlaid is shareable content.
- **Replay button:** After sealed watch and Inspector, a "REPLAY" button allows re-watching the sealed watch with the same seed. Streamers use this to commentate over the action. Each replay is identical (deterministic), so the streamer can narrate in real time: "Watch — tick 14, striker-1 sees the enemy but tick 15, the SECOND enemy comes from the northwest and..."
- **Chat integration potential:** The MVG's web demo could display a minimal chat overlay or accept URL parameters for Twitch integration. Architecture configs could be shared via URL: `?config=base64encodedconfig`. Chat pastes a config link, streamer loads it, EXECUTE. Social loop closes instantly.

---

## Strengths of Each Engine

| Engine | Target Player | Strength | When It Fires |
|--------|--------------|----------|---------------|
| The Blueprint in Your Head | Everyone who lost or saw imperfection | Automatic, involuntary, no game design needed | Hours after play |
| The Sawtooth Sparkline | Optimization players (Factorio, Zachtronics) | Self-sustaining — players set their own goals | During Inspector review |
| The Napkin Sketch | Creative/system-design players | Generates ideas outside the game | Idle moments (shower, commute) |
| The Seed Shuffle | Competitive/robustness players | Reframes each run as a sample, not a solution | On defeat after a "should have worked" config |
| The Architecture Portfolio | Social/sharing players | External motivation amplifies internal | When someone asks "how did you do that?" |
| The Dead Rule | Perfectionist/mastery players | Emotional — it BOTHERS them | Inspector close-read |

## Weaknesses and Mitigations

| Weakness | Engine Affected | Mitigation |
|----------|----------------|------------|
| Player wins all 5 missions cleanly on first try | Blueprint in Your Head, Dead Rule | Mission 5 should be tuned so first-attempt victory with zero inefficiency is rare. Ensure at least one "it worked but..." moment via invisible randomization variance. |
| Player doesn't use the Inspector | Sawtooth Sparkline, Dead Rule, Napkin Sketch | The sealed watch must produce dramatic enough failures (or near-misses) to create curiosity. The two-act structure (watch THEN inspect) is load-bearing. |
| Player is casual and doesn't care about optimization | Sawtooth Sparkline | The casual player's return path is Engine 1 (Zeigarnik) or Engine 4 (Seed Shuffle). Not every engine needs to fire for every player. |
| No social audience for a new prototype | Architecture Portfolio | Seed the social loop with built-in share prompts. Match Card (auto-generated summary image) at mission end. "Share your architecture" button. |
| Invisible randomization not implemented in MVG | Seed Shuffle | This is a design decision: does the MVG use fixed seeds per mission (deterministic puzzle) or random seeds (robust system test)? Recommendation: fixed seeds for M1-4 (tutorial clarity), random seeds for M5 (replay value). |
| Five missions exhausted in 15-20 minutes | All engines | The five missions are the FRAME, not the CONTENT. The content is the architecture space within each mission. Mission 5 alone has thousands of possible configurations. The replay value is horizontal (different approaches to the same mission), not vertical (more missions). |

---

## Interaction Effects

**Second session test x Inspector design (4.39, 8.04c):** The Inspector is the primary engine for five of six return mechanisms. Its diagnostic annotations — dead rules, underutilized channels, buffer utilization percentages, compression ratios — are the seeds planted in the player's mind. An Inspector that shows only "you won" or "you lost" generates zero pull-back. An Inspector that shows "you won, but Rule 3 never fired and your relay hit 87.5% buffer at tick 14" generates obsessive return.

**Second session test x Invisible randomization (locked spec):** If Mission 5 uses random seeds, the "Seed Shuffle" engine activates and transforms the MVG from a puzzle (solve once) to a stress test (build robust systems). This single design decision may be the largest determinant of second-session return rate.

**Second session test x Web demo packaging (8.04e):** The web demo's URL persistence matters. If the player closes the tab and returns 24 hours later, does their Mission 5 config still exist? Service worker caching and localStorage persistence are load-bearing for the Zeigarnik engine. If the player returns and has to reconfigure from scratch, the unfinished-task pull becomes a friction wall.

**Second session test x GIF/clip export (6.09):** The Architecture Portfolio engine requires zero-friction export. A "Share" button on the victory/defeat screen that generates a Match Card (auto-composed image with topology diagram, key stats, and a QR/link to the replay) could be the single most impactful feature for second-session return — not because it brings the *same* player back, but because it brings *new* players who then also need to come back.

**Second session test x Default blueprint configs:** Rosa's journey reveals that default configs are critical for the second-session casual player. If Mission 5 requires building from zero, the re-entry cost is too high for a player who barely understood the mechanics the first time. Pre-filled defaults with "tap to customize" lower the floor while preserving the ceiling.

---

## Comparable Games and Their Second-Session Hooks

| Game | Content Volume at MVG Stage | What Creates Return | Lesson |
|------|----------------------------|--------------------|---------|
| **Into the Breach** | 3 mechs, 1 island (4 missions), 1 squad | "What if I used Flame Behemoths instead of Rift Walkers?" — squad variety. MVG lacks this (only 3 unit types). | Into the Breach's replay comes from unit variety, which the MVG doesn't have. The MVG must generate replay from *configuration variety* within fixed units. |
| **Baba Is You** | First world (8 levels) | "There must be a simpler solution" — the elegance chase. Baba's levels have multiple solutions; finding the most elegant is the return hook. | The MVG's "elegance chase" is the Sawtooth Sparkline — optimizing buffer utilization, compression ratio, timing. |
| **Slay the Spire** | Act 1, 1 character, ~40 cards | "What if I drafted Shiv Deck instead of Poison?" — build variety. | Slay the Spire's deck variety creates natural experimentation. The MVG equivalent: "What if I used 2 relays instead of 1?" "What if I skipped the relay entirely?" |
| **Factorio Demo** | Automation up to green science | "My smelting array is only 60% efficient" — the throughput optimization loop is self-generating. | Factorio's demo hooks optimization players with visible inefficiency. The Inspector's sparklines serve the same function. |
| **Tetris** | One mode, infinite play | "I can beat my high score" — pure skill mastery. | Tetris has zero content variety. Return comes entirely from skill expression. The MVG can learn: if the core loop is satisfying, content volume doesn't matter. |
| **Wordle** | One puzzle per day, 6 guesses | "I want to solve it in 3" — self-imposed difficulty. | Wordle's constraint (one attempt per day) creates scarcity-driven return. The MVG could learn from this: what if Mission 5 had a daily seed? |

---

## Sensory Specification: The Return Moment

What does it feel like to open the MVG for the second time?

**The load screen:** The browser tab opens. A brief loading state — the rice terrace background fades in from black over 800ms, server racks appearing first as dim orange rectangles, then resolving into pixel detail. Water begins flowing between the terraces. Cicada ambient audio fades in over 1.2 seconds. The mission select appears: five buttons, four checked, one gold.

**The recognition:** The player's last Mission 5 config is still loaded (localStorage). The Plan screen opens with their previous production queue, their previous blueprint configs, their previous channel names. Everything is exactly as they left it. A tiny label in the top-right corner: "Last modified: 22 hours ago." The game remembers. The player's unfinished architecture is waiting.

**The modification:** They change one thing. Drag a relay to a different queue position. Add a channel name. Toggle a skill. The board preview updates — ghost units shift, perception cones adjust, channel lines redraw. The change is small but the implication ripples through the whole system. The conveyor belt recalculates costs. The channel map redraws topology.

**The re-execution:** EXECUTE. The same Plan-to-Watch transition — workbench slides away, board expands, tick clock appears. But this time the player watches with *prediction.* They know what happened last time. They're watching for the specific tick where things went wrong before. Tick 14. The relay's buffer. Does it overload this time?

It doesn't. The modification worked. The player exhales. The architecture runs clean. Victory chime. Three ascending kulintang notes.

The second session wasn't about new content. It was about a better answer to the same question.

---

## The TikTok Clip for Second-Session Psychology

**15 seconds:**

*Split screen. Left: "ATTEMPT 1" — Mission 5 sealed watch. Three scouts flood a single striker. Context bar goes red. Sparks. Stun. Enemy walks up. Red flash. Defeat.*

*Right: "ATTEMPT 7" — Same Mission 5. Two relays in a diamond topology, dual scouts, dual strikers with different rule priorities. Signal lines crisscross the board like a living circuit. Buffer bars all blue. Coordinated pincer movement. Two enemies eliminated in sequence. Victory.*

*Text overlay: "Same 5 missions. Different brain."*

*Cut to black. Text: "What's YOUR architecture?"*
