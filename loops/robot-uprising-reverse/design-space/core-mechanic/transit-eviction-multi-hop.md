# 2.01b — Transit Eviction in Multi-Hop Chains

**Aspect:** 2.01b — Transit eviction in multi-hop chains: signals that arrive at a Relay and are evicted before compression can process them; "data dies in transit" problem; how common is this? Core tension or degenerate edge case?
**Wave:** 2 (Core Mechanic Deep Dives)
**Category:** core-mechanic
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02b (Delivery Richness), 2.02c (Weight-Aware Eviction Policies), 2.00f (No Global Coordinator), 2.14 (Spatial Routing)

---

## The Mechanic: "Data Dies in Transit"

A Scout observes a Striker-class enemy at close range. The observation is critical — the enemy will reach the player's base in four ticks. The Scout's hook fires, transmitting a structured signal (3 buffer slots) on channel `threat-net` to RELAY-A, which sits two tiles behind the front line. RELAY-A's job is simple: receive raw signals, compress them into dense intelligence packets, forward the compressed output to the Striker who will intercept the threat. The signal travels one hop (1 tick latency) and arrives at RELAY-A on tick 8.

RELAY-A's buffer has 12 slots. Eleven are occupied. The structured signal needs 3 slots but only 1 is free. The signal enters the buffer — but it cannot fit whole. The buffer is full. Eviction fires. Under FIFO, the three oldest entries are pushed out to make room. Under lightest-first, the three lowest-weight entries are sacrificed. The structured signal lands in the buffer, occupying slots 10, 11, and 12.

Compress runs on the **next tick** — tick 9. But between tick 8 and tick 9, two more signals arrive: a terrain observation from RELAY-A's own perception (it perceives nothing, but a Scout's heartbeat on `status-net` generates 1 stripped signal) and another tagged signal from a second Scout on `threat-net` (2 slots). Three more slots consumed. The buffer was already at capacity after the structured signal arrived. The eviction policy fires again. The oldest entries are evicted. And the oldest entries are... the structured signal that arrived last tick. It entered at tick 8. It is now the oldest unprocessed content. The FIFO conveyor belt has pushed it to slot 0, slot 1, slot 2 — the eviction end.

The structured signal is gone. Evicted. Compress fires on tick 9 and finds nothing to compress except terrain pings and heartbeats. It dutifully compresses these into a useless summary and forwards it downstream. The Striker receives intelligence about ground conditions and friendly unit heartbeats. It knows the floor is concrete. It does not know an enemy Striker is three ticks away.

The enemy arrives. The Striker, acting on its buffered data, sees no threat signal in its context window. Its rules find no match. It holds position. The enemy walks adjacent. One-shot-one-kill. The Striker dies. The base is exposed.

The structured signal — the one that would have saved the Striker — existed for exactly one tick inside RELAY-A's buffer. It was born at the Scout's perception, traveled one hop, entered the Relay, and was crushed between the data that preceded it and the data that followed it. It died in transit.

### The Mechanical Anatomy

Transit eviction occurs when all four conditions align:

1. **High buffer occupancy** — The Relay's buffer is above 75% capacity when the signal arrives. At 12 slots, that means 9+ slots occupied. Common by tick 10+ in any mission with two or more Scouts feeding a single Relay.

2. **Rich signal format** — The incoming signal occupies 2+ slots (tagged or structured delivery). Stripped signals (1 slot) are harder to transit-evict because they only need one free slot and are small enough to survive in the buffer margins. Structured signals (3-4 slots) are maximally vulnerable — they consume the most space and therefore trigger the most aggressive eviction cascades.

3. **Continued inflow** — Other signals arrive in the same tick or the next tick, pushing the newly arrived signal toward the eviction boundary before compress can fire. The Relay is a bottleneck receiving from multiple sources; the more hooks it listens on, the higher the inflow rate, the faster buffer contents age toward eviction.

4. **Compress delay** — Compress does not fire on the tick of arrival. It fires on the next tick, after the unit's perception and rule evaluation phases complete. This one-tick gap is the kill window. Any signal that enters the buffer and is pushed to the eviction boundary within that single tick is dead before compress touches it.

### How Common Is It?

In the baseline locked design (12-slot Relay buffer, FIFO eviction, 1-tick compress delay), transit eviction frequency depends on the information architecture:

**Low traffic (1 Scout feeding 1 Relay):** Rare. One Scout generates 2-4 observations per tick plus 1-2 hook signals. A 12-slot Relay receiving 3-6 entries per tick fills its buffer around tick 3-4, but the inflow rate is low enough that compress can process entries before they reach the eviction boundary. Transit eviction probability: ~5% per signal. Players will encounter it occasionally but won't identify it as a pattern.

**Medium traffic (2-3 Scouts feeding 1 Relay):** Regular. Six to fifteen entries per tick. The buffer is perpetually near-full. Structured signals survive 1-2 ticks before eviction. Transit eviction probability: ~25% for structured signals, ~10% for tagged, ~3% for stripped. Players will notice that "the Relay keeps losing data" but may attribute it to insufficient buffer size rather than timing.

**High traffic (4+ Scouts or multi-channel wiring to 1 Relay):** Constant. The buffer churns every tick. Structured signals have a >50% chance of being evicted before compress processes them. The Relay becomes a sieve — signals pass through without being compressed, arriving downstream as raw fragments or not at all. The player's information architecture is self-defeating: the more information they feed to the Relay, the less the Relay can actually process.

This frequency distribution answers the aspect's core question: **transit eviction is a core tension, not a degenerate edge case.** It emerges naturally from any architecture where a Relay serves as a hub for multiple information sources — which is the default architecture most players build. The question is not whether the player encounters transit eviction. The question is whether they recognize it, diagnose it, and solve it.

---

## Player Journeys

#### Journey: Anika, 16, competitive Valorant player turned strategy gamer

Anika builds her first multi-unit architecture in Mission 3. She wires two Scouts to a single Relay, the Relay to a Striker. Clean lines. Obvious topology. She names the Relay "Post Office" because it handles all the mail. She sets delivery richness to structured on `threat-net` because she wants her Striker to have maximum targeting data. More information is better. That is how shooters work — you always want full intel on the enemy.

She hits EXECUTE. The first ten ticks are clean. Scouts spot enemies, signals travel through Post Office, the Striker receives compressed intelligence and repositions. Buffer bars glow healthy blue-green. Anika nods. This is working.

Tick 14. Both Scouts spot an enemy cluster — three enemies entering from the north. Each Scout fires two structured signals on `threat-net`. Four structured signals, 3 slots each, 12 slots total — arriving at a Relay with 12 slots, 9 of which are already occupied. The buffer cannot hold them. Eviction cascades. The first structured signal enters, evicts three old entries. The second enters, evicts three more — including two slots from the first structured signal that just arrived. The third enters, evicts the remainder of signal one and half of signal two. By the time the tick resolves, Post Office's buffer contains fragments: one complete structured signal and wreckage.

Compress fires on tick 15. It processes the one surviving signal. The Striker receives a single compressed intelligence packet about one of the three enemies. It engages. It kills enemy one. Enemy two flanks. Enemy three reaches the base. Mission fails at tick 23.

Anika stares at the defeat screen. She had two Scouts. She had intel on all three enemies. Why did the Striker only know about one?

She opens the Inspector. She clicks Post Office at tick 14. The buffer history shows the cascade: four signals entering, three being shredded by eviction, compress processing the survivor on tick 15. Below the buffer display, the eviction graveyard shows six entries marked with red X icons — the remnants of the three lost signals. She expands one. It contains the position, movement vector, and threat assessment of enemy two. The enemy that killed her Striker. The data was there. Post Office held it for less than one tick.

Anika's first reaction: "The buffer is too small." She looks for a way to increase it. There is none — 12 slots is the Relay's fixed capacity. Her second reaction: "I need to send less data." She switches `threat-net` to tagged delivery (2 slots instead of 3). Reruns. The tagged signals survive longer — two ticks in the buffer instead of one. Compress processes two of them. The Striker knows about two of three enemies. Better. Still not enough.

Her third reaction, the one that teaches: "I need two Post Offices." She splits the architecture. RELAY-NORTH listens to SCOUT-A on `threat-net-north`. RELAY-SOUTH listens to SCOUT-B on `threat-net-south`. Each Relay receives half the traffic. Each buffer stays below 75% occupancy. Compress fires reliably. The Striker listens to both Relays on separate channels. The Striker's buffer fills faster now — two sources instead of one — but the Striker has 8 slots and only needs to hold the latest compressed intel from each Relay. The architecture works.

Anika has learned relay sharding. She does not know the term. She knows that one Post Office serving two mailpeople is a bottleneck, and two Post Offices serving one each is not. She will carry this intuition into her networking class in two years and recognize it as load balancing across message queue consumers.

#### Journey: Derek, 38, DevOps engineer, plays on lunch breaks

Derek recognizes the transit eviction problem the first time he sees it in the Inspector. He has seen this exact failure mode in production. RabbitMQ queue at max depth, messages arriving faster than the consumer can process them, dead-letter queue filling with undelivered messages. The Relay is a message broker. The compress skill is a consumer. The buffer is the queue. Transit eviction is a dropped message.

He does not need the game to teach him the problem. He needs the game to give him tools he does not have at work.

At work, the solution is horizontal scaling: add more consumers, add more broker nodes, increase queue depth. In Robot Uprising, buffer depth is fixed. You cannot add consumers to a Relay — it has one compress skill and it fires once per tick. The constraint is tighter than production. Derek finds this refreshing. The game forces him to solve the problem architecturally instead of throwing resources at it.

His first solution: **relay chaining with traffic shaping.** RELAY-A receives raw signals from Scouts on `raw-intel`. RELAY-A compresses and forwards on `stage-1`. RELAY-B listens on `stage-1`, applies a second compression pass, and forwards on `processed-intel`. The Striker listens on `processed-intel`. Two-stage compression pipeline. Each Relay handles half the compression work. The second Relay's buffer never overloads because its input is already compressed — smaller signals, lower inflow rate.

His second solution, the elegant one: **delivery richness tiering.** Scouts transmit stripped signals to RELAY-A on `ping-net` (1 slot each, high throughput, never evicted) and simultaneously transmit structured signals on `detail-net` (3 slots each, low throughput). RELAY-A listens on `ping-net` with lightest-first eviction (stripped pings are weight-1, always evicted first when something heavier arrives) and on `detail-net` with priority-tagged eviction (structured signals are pinned). The Relay processes the pings for heartbeat awareness and the structured signals for deep intelligence. Two tiers of data, two eviction strategies, one Relay.

Derek screenshots his architecture and posts it to the Robot Uprising Discord. The caption: "finally, a game where I can build a proper dead letter queue." Fourteen upvotes. Three people ask what a dead letter queue is. Derek explains, using the game's vocabulary. The game has become his teaching tool for the concepts he uses at work every day.

#### Journey: Lila, 52, retired math teacher, plays with her grandson

Lila does not build complex architectures. She uses the default topology the tutorial suggests: one Scout, one Relay, one Striker, straight line. She sets everything to tagged delivery because the tutorial said tagged is "the balanced option." She names her units after her grandchildren. The Scout is Mateo. The Relay is Sofia. The Striker is Diego.

Mission 5 introduces a multi-wave enemy pattern. Lila's Scout spots the first wave — two enemies. Sofia (the Relay) compresses and forwards. Diego engages and wins. Clean. The buffer bars stayed green throughout. Lila smiles.

Wave two arrives one tick after wave one ends. Mateo spots four enemies simultaneously. Four tagged signals (2 slots each, 8 slots total) flood Sofia's buffer. Sofia had 7 of 12 slots occupied from wave one's residual data. Eight new slots needed, five available. Eviction cascades. Three signals survive. One is evicted — the signal describing the enemy approaching from the east.

Compress fires. Diego receives intelligence about three of four enemies. He engages the nearest. He repositions toward the second. He does not know about the eastern enemy. It approaches from his blind side. Adjacent. Dead.

Lila does not open the Inspector. She watches the replay. She sees Diego walk toward the northern enemies and ignores the eastern one. She says to her grandson: "Diego didn't know. Sofia forgot to tell him about that one."

Her grandson, who is fourteen and has played forty hours, says: "Check Sofia's buffer. I bet she got too much mail at once."

Lila opens the Inspector for the first time. She clicks Sofia at the tick wave two arrived. She sees the buffer bar: all twelve slots filled, the left edge flashing red. Below, the eviction graveyard. One entry with a red X. She clicks it. It says: `[T18] threat-net: ENEMY_STRIKER, distance: 4, direction: E (tagged, evicted T18)`. Arrived and evicted on the same tick.

"Sofia got the letter," Lila says. "She just couldn't hold it long enough to read it."

Her grandson suggests adding a second Relay. Lila does. She names it Abuela. She positions Abuela closer to the eastern approach. She wires Mateo to both Sofia and Abuela, splitting the channel by direction. She does not know she has invented geographic load balancing. She knows that one person cannot sort all the mail when it arrives at once, and two people can.

---

## Strengths of Transit Eviction as a Mechanic

**It creates a legible, solvable problem.** Transit eviction is visible in the Inspector as a specific event: a signal in the eviction graveyard with matching arrival and eviction timestamps. The player can point to it and say "this is what went wrong." Unlike diffuse problems (gradually degrading performance, unclear causal chains), transit eviction has a sharp signature. The diagnostic path is clear: open Inspector, find the dead signal, trace it backward to the source, trace it forward to the unit that needed it. The gap between "I see the problem" and "I know how to fix it" is short.

**It teaches relay architecture as a first-class design concern.** Without transit eviction, players can wire every Scout to a single Relay and never reconsider. Transit eviction punishes hub-and-spoke laziness and rewards thoughtful topology: relay sharding, delivery richness tiering, geographic distribution, buffer headroom management. The mechanic converts relay placement from an afterthought into a strategic decision.

**It scales with player skill.** Beginners encounter transit eviction as a mysterious failure. Intermediate players learn to diagnose it. Advanced players learn to prevent it through architecture. Expert players learn to exploit it — flooding an opponent's relay with garbage signals to trigger transit eviction on the signals that matter (see 2.05c, shared buffer attacks). The mechanic serves four skill levels with no rule changes.

**It maps directly to real-world distributed systems.** Network packet drops at overloaded routers, RabbitMQ messages dead-lettered because the consumer is slower than the producer, Kafka consumer lag causing offset expiry, LLM context windows silently dropping earlier tokens when the prompt overflows. Every player who understands transit eviction has intuition for these real-world phenomena. The game teaches infrastructure engineering through play.

**It generates compelling spectator moments.** The "data dies in transit" moment is visually and narratively clean: a signal enters a relay, the buffer bar flashes red, the signal vanishes, and downstream a unit dies because it never received the warning. Streamers can narrate this in one sentence. Viewers understand it immediately. It is the information-architecture equivalent of a missed heal in an MMO raid — a single dropped packet that cascades into a wipe.

---

## Weaknesses of Transit Eviction as a Mechanic

**The one-tick compress delay feels arbitrary.** Why does compress not fire immediately when a signal arrives? The answer is architectural (tick phases execute in order: perception, inflow, eviction, rule evaluation, skill execution, outflow) but it feels like a bug to the player encountering it for the first time. "My Relay received the signal and then forgot it before processing it" sounds like a software defect, not a strategic challenge. The game must make the tick-phase ordering legible — perhaps through an Inspector view that shows the phase sequence — or players will file bug reports instead of designing solutions.

**It punishes structured delivery disproportionately.** Structured signals (3-4 slots) are vastly more vulnerable to transit eviction than stripped signals (1 slot). This creates an implicit pressure toward stripped delivery everywhere, which undermines the delivery richness system (2.02b). If the optimal response to transit eviction is "never send structured signals to a Relay," then an entire tier of the delivery richness system becomes a trap. The game must provide paths where structured delivery through Relays is viable — perhaps through reserved buffer slots, priority-tagged eviction policies, or multi-tick compress that processes on arrival.

**Diagnosis requires Inspector fluency.** Transit eviction is invisible during sealed watch. The buffer bar flashes red, but one red flash among many is not diagnostic. The player cannot distinguish "signal evicted because the buffer is full of useful data" from "signal evicted one tick before compress would have saved it" without opening the Inspector and reading the eviction graveyard. Players who avoid the Inspector — casual players, narrative-focused players, players who find the Inspector intimidating — will experience transit eviction as unexplained failure. The teaching curve must actively guide these players into the Inspector at the moment transit eviction first occurs.

**It can create a "solved" architecture pattern.** If relay sharding always prevents transit eviction, and relay sharding is cheap enough to always build, then transit eviction is not a tension — it is a one-time lesson. The player learns "never use one Relay for multiple Scouts," builds two Relays in every mission thereafter, and never thinks about transit eviction again. For the mechanic to remain a tension, the cost of relay sharding must be real: mineral cost (two Relays = 10 minerals instead of 5), spatial cost (two Relays require two board positions), EM cost (two active Relays emit more detectable signal). The player must choose between transit eviction risk and the costs of mitigation.

---

## Interaction Effects

**With buffer size (12 slots for Relay):** Twelve slots is generous enough that low-traffic architectures rarely experience transit eviction, but tight enough that medium-traffic architectures experience it regularly. If Relays had 20 slots, transit eviction would be rare and the mechanic would degenerate into a curiosity. If Relays had 6 slots, transit eviction would be constant and the mechanic would feel punitive. Twelve is the sweet spot where the mechanic is present but avoidable through skill.

**With delivery richness (2.02b):** Structured signals (3 slots) are the primary victims of transit eviction. This creates a direct tension: the player wants structured delivery for maximum intelligence quality, but structured signals are most likely to die in transit. Tagged signals (2 slots) are the natural compromise — enough data for tactical decisions, small enough to survive relay transit. Stripped signals (1 slot) are nearly immune to transit eviction but carry too little data for downstream rule evaluation. The delivery richness trichotomy gains strategic depth specifically because of transit eviction pressure.

**With eviction policies (2.02c):** FIFO eviction makes transit eviction timing-dependent — the signal that arrived earliest is evicted first, regardless of importance. Lightest-first eviction can protect high-weight signals from transit eviction but sacrifices low-weight ambient data. Priority-tagged eviction can pin specific signal types to survive transit, but pinned signals consume permanent buffer space. Each eviction policy creates a different transit eviction profile, and the player's choice of eviction policy is partly a statement about which signals they are willing to lose in transit.

**With compress skill:** Compress is the cure for transit eviction — it reduces buffer pressure by condensing multiple signals into one. But compress's one-tick delay is also the cause of transit eviction. This circular dependency is the mechanic's deepest tension. The solution to buffer overload (compress) is gated behind the problem of buffer overload (the signal must survive long enough for compress to fire). Players who understand this circularity start designing architectures that manage the gap: low-richness intake channels that feed the compress pipeline without overloading it, buffer headroom strategies that keep 2-3 slots free for burst traffic, pre-compression at the Scout level to reduce downstream Relay pressure.

**With relay positioning (2.14 Spatial Routing):** A Relay positioned at the center of the board receives signals from all directions — maximum utility, maximum transit eviction risk. A Relay positioned behind one Scout receives signals from one direction — limited utility, minimal transit eviction risk. Relay positioning is a geographic expression of the centralization-versus-resilience tradeoff. Transit eviction makes relay placement a spatial optimization problem, not just a connectivity problem.

**With the teaching curve:** Transit eviction should first occur in Mission 3 (when multi-unit wiring is introduced) but should not be explicitly named until Mission 5 (when the player has enough Inspector fluency to diagnose it). The gap between encountering and understanding is deliberate — the player feels the failure, then gains the vocabulary. The Inspector's eviction graveyard annotation ("evicted before compress — transit eviction") should appear as an unlockable tooltip after the player clicks an evicted signal whose arrival tick matches its eviction tick. The game names the concept when the player discovers it, not before.

---

## Comparable Systems

**Network packet drops at overloaded routers:** When a router's queue is full and a new packet arrives, the packet is dropped — silently, with no notification to the sender. TCP compensates by detecting the loss (via missing ACK) and retransmitting. UDP does not. Robot Uprising's signal system is closer to UDP: fire-and-forget, no acknowledgment, no retransmission. The signal dies and the sender never knows. This is what makes transit eviction dangerous — the Scout does not know its signal was evicted at the Relay. It assumes the Striker received the intel. The information gap is invisible at the source. Real networking solves this with TCP's reliable delivery. Robot Uprising could offer an analog — signal acknowledgment as an advanced mechanic (see 2.01b-discovered aspects below) — but the base game deliberately omits it to preserve the diagnostic challenge.

**RabbitMQ dead letter queues:** When a RabbitMQ consumer cannot process a message before the TTL expires, the message is routed to a dead letter queue for later inspection. The dead letter queue is the production equivalent of Robot Uprising's eviction graveyard — a morgue for data that died in transit. The key difference: RabbitMQ's dead letter queue preserves the message for human review. Robot Uprising's eviction graveyard is an Inspector artifact — it exists as diagnostic metadata, not as recoverable data. The signal is truly dead. The graveyard is a post-mortem, not a backup.

**Kafka consumer lag and offset expiry:** In Apache Kafka, if a consumer falls behind the producer, unconsumed messages can be deleted when the retention period expires. The consumer resumes reading from a later offset, permanently missing the intermediate messages. This is transit eviction at a different timescale — days instead of ticks — but the mechanic is identical: a processing unit that cannot keep up with its input stream loses data irreversibly. Kafka's solution (increase retention, add consumer instances, backpressure) maps to Robot Uprising's solution (increase buffer headroom, add relay instances, reduce delivery richness).

**LLM context window overflow:** When a conversation with an LLM exceeds the context window, early messages are silently dropped. The model continues responding as if those messages never existed. A user who provided critical instructions in message 2 of a 200-message thread discovers that the model has "forgotten" those instructions — they were evicted from the context window. Transit eviction is the game-scale version of this phenomenon: the signal entered the Relay's "context window," was pushed out by subsequent data, and the Relay proceeded as if it never received it.

---

## Sensory Description: What Transit Eviction Looks and Sounds Like

**The arrival.** The signal travels the channel wire as a thick pulse — visible internal segmentation if it is structured, a medium glow if tagged. It reaches RELAY-A's buffer bar and slides in from the right. The buffer bar is nearly full: ten of twelve segments illuminated, a gradient from dim amber (left, old) to bright cyan (right, new). The incoming signal pushes in — three new bright segments appear on the right edge. The bar is now completely full. Twelve of twelve. No empty space. The rightmost segments are vivid, almost white-hot. The leftmost segments are dim, barely visible, old data about to die.

**The eviction.** One tick later, new data arrives. The bar cannot expand. The leftmost segments flash red — not the gentle pulse of normal aging, but a hard, flat red, the color of an error state. The segments blink twice, fast, and disappear. Gone. In their place, the new data slides in from the right, pushing everything left by one position. The structured signal that arrived last tick is now in the middle of the bar, its bright segments dimming as they age. If traffic continues, it will be at the left edge by next tick.

**The death.** Another tick. More inflow. The structured signal's segments — still identifiable by their rich, saturated color among the washed-out pings surrounding them — reach the left edge of the bar. They flash red. Two rapid blinks. They vanish. In the audio mix, there is a sound: a soft descending tone, like a glass being set down on a table, followed by silence. Not dramatic. Not alarming. Just... gone. The understatement is deliberate. Transit eviction does not announce itself. It is the quiet disappearance of something important in a system too busy to notice.

**The consequence.** Downstream, the Striker's buffer bar shows a gap. It was expecting a compressed intelligence packet from RELAY-A. The packet never arrives — compress had nothing meaningful to process. The Striker's buffer has a stale entry from two ticks ago and an empty slot where fresh intelligence should be. The empty slot is dark gray, a void. The Striker's idle animation continues. It does not know what it does not know. Its perception cone scans left, right, left, right. Mechanical. Uninformed. The enemy approaches from outside the cone. The Striker does not turn.

**The Inspector revelation.** Post-battle. The player clicks RELAY-A at the transit eviction tick. The buffer display shows twelve slots, all full, with a thin red border around three slots on the left — the structured signal that was evicted. Below the buffer, the eviction graveyard: a horizontal strip with faded, ghost-colored entries. The transit-evicted signal is highlighted with a pulsing amber border and a label: `TRANSIT EVICTED — arrived T14, evicted T15, compress would have processed T16`. The label is the game naming the problem. The player hovers over the ghost entry and sees the full signal payload — the enemy position, the threat assessment, the data that would have saved the Striker. It is all there, perfectly preserved in the graveyard, perfectly useless. The information existed. The architecture failed to hold it long enough to matter.

---

## Discovered Aspects

- **2.01b-i — Signal acknowledgment as advanced mechanic:** Should the sender (Scout) know when its signal was successfully received and processed? An acknowledgment hook that fires only when compress touches the signal would let the Scout retransmit on failure — at the cost of additional buffer pressure and EM emissions. TCP-over-hooks.
- **2.01b-ii — Buffer headroom as explicit strategy:** Can the player configure a "reserve slots" parameter that keeps N slots permanently empty for burst traffic? A Relay with 12 slots and 2 reserved effectively has 10 usable slots but guarantees that a sudden burst of 2 signals always has room. The cost is reduced steady-state capacity.
- **2.01b-iii — Compress-on-arrival variant:** Should compress have a variant that fires immediately when the buffer crosses a threshold, rather than waiting for the next tick? This would eliminate the one-tick kill window but remove the timing puzzle that makes transit eviction a designable tension.
- **2.01b-iv — Transit eviction as enemy tactic:** Can enemy units deliberately flood a Relay's input channels to trigger transit eviction on critical friendly signals? This weaponizes the mechanic — the player must defend not just against physical threats but against information-warfare attacks targeting relay buffer capacity.
- **2.01b-v — Multi-hop amplification of transit eviction:** In a 3-hop chain (Scout → Relay-A → Relay-B → Striker), transit eviction at Relay-A means Relay-B never receives the signal at all. Each hop is an additional transit eviction risk. Does multi-hop amplification make long chains unviable, or does compression at each stage reduce signal size enough to mitigate the risk?
